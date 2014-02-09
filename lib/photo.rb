require 'thumbnail'
require 'mimemagic'
require 'exifr'
require 'cgi'
require 'base64'
require 'tempfile'
require 'securerandom'
require 'digest/sha1'
require 'msgpack'
require 'socket'

require_relative 'index'

# Indexes:
#  - timestamp
#  - path

class PhotoTimeIndex < TimestampIndex
  def self.key
    "PHOTO_TIMESTAMP_IDX"
  end

  def self.key_for(timestamp)
    "#{PhotoTimeIndex.key}.#{timestamp.to_i}"
  end

  def index
    idx = @db.get(PhotoTimeIndex.key)
    return MessagePack.unpack(idx) if idx
    []
  end

  def photos(timestamp)
    raw_photos = @db.get(PhotoTimeIndex.key_for(timestamp.to_i))
    if raw_photos
      return MessagePack.unpack(raw_photos)
    end
    []
  end

  def update(batch, timestamp, pid)
    idx = index
    if not idx.include?(timestamp.to_i)
      idx << timestamp.to_i
      batch.put(PhotoTimeIndex.key, idx.sort.to_msgpack)
    end

    photos = []
    raw_photos = @db.get(PhotoTimeIndex.key_for(timestamp))
    if raw_photos
      photos = MessagePack.unpack(raw_photos)
    end
    if not photos.include?(pid)
      photos << pid
      batch.put(PhotoTimeIndex.key_for(timestamp), photos.to_msgpack)
    end
  end
end

# Unsorted index of paths
class PhotoPathIndex
  def initialize(db)
    @db = db
  end

  def self.key
    "PHOTO_PATH_IDX"
  end

  def self.key_for(path)
    "#{PhotoPathIndex.key}.#{Digest::SHA1.hexdigest(path)}"
  end

  def photo(path)
    pid = @db.get(PhotoPathIndex.key_for(path))
    return nil unless pid
    Photo.new(@db, pid)
  end

  def update(batch, path, pid)
    batch.put(PhotoPathIndex.key_for(path), pid)
  end
end

class Photo
  attr_reader :pid
  
  def initialize(db, pid)
    @db = db
    @pid = pid
  end

  def self.key(pid)
    "PHOTO.#{pid}"
  end

  def self.index(db)
    PhotoTimeIndex.new(db)
  end

  def self.path_index(db)
    PhotoPathIndex.new(db)
  end

  def self.date(path, exif=nil)
    exif = EXIFR::JPEG.new(path) unless exif
    return exif.date_time if exif && exif.date_time
    return exif.date_time_original if exif && exif.date_time_original
    return exif.date_time_digitized if exif && exif.date_time_digitized
    time_from_name = File.basename(path).gsub(".jpg", "").gsub(".JPG", "").gsub(".", ":")
    Time.parse(time_from_name)
  end

  def self.create_from_file(db, path)
    return nil unless File.exists?(path)

    current_photo = path_index(db).photo(path)
    return current_photo if current_photo

    _pid = SecureRandom.hex

    db.batch do |batch|
      exif = EXIFR::JPEG.new(path)

      hash = {
        "path"                        => path,
        "poiX"                        => 0.5,
        "poiY"                        => 0.5,
        "originalTimestampType"       => "exif-original",
        "orientation"                 => exif.orientation.to_i,
        "exif"                        => {},
        "sources"                     => [{
          "deviceName"                => Socket.gethostname,
          "sourceType"                => "mac-folder",
          "filePath"                  => path,
          "sourceName"                => "camera uploads",
          "albumName"                 => "camera uploads",
          "fileName"                  => File.basename(path)
        }],
        "captureDevice"               => {},
        "timestamp"                   => date(path, exif).to_f,
        "pid"                         => _pid,
        "modified"                    => File.mtime(path).to_f,
        "visibility"                  => 1,
        "height"                      => exif.height,
        "width"                       => exif.width,
        "timestampType"               => "exif-original",
        "year"                        => date(path, exif).year,
        "tid"                         => _pid,
        "_statusCode"                 => 200,
        "originalTimestamp"           => date(path, exif).to_f,
        "nearbyPhotosDistancesMeters" => []
      }
      if exif.exif[:focal_length]
        hash["exif"]["focalLength"] = exif.focal_length.to_f.to_s
      end
      if exif.exif[:iso_speed_ratings]
        hash["exif"]["isoSpeedRatings"] = exif.iso_speed_ratings.to_f.to_s
      end
      if exif.exif[:f_number]
        hash["exif"]["fNumber"] = exif.f_number.to_f.to_s
      end
      if exif.exif[:exposure_time]
        hash["exif"]["exposureTime"] = exif.exposure_time.to_s
      end
      if exif.exif[:exposure_bias_value]
        hash["exif"]["exposureBiasValue"] = exif.exposure_bias_value.to_f.to_s 
      end
      hash["captureDevice"]["make"] = exif.make if exif.exif[:make]
      hash["captureDevice"]["model"] = exif.model if exif.exif[:model]

      batch.put(Photo.key(_pid), hash.to_msgpack)
      index(db).update(batch, date(path, exif).to_f, _pid)
      path_index(db).update(batch, path, _pid)
    end

    return Photo.new(db, _pid)
  end

  def key
    Photo.key(@pid)
  end

  def index
    Photo.index(@db)
  end

  def path_index
    Photo.path_index(@db)
  end

  def <=>(other)
    date <=> other.date
  end

  def mimetype
    mime = MimeMagic.by_path(@path)
    mime = MimeMagic.by_magic(@path) unless mime
    return mime
  end

  def generate_thumbnail(w, h=nil)
    if w
      h = (w.to_f/width.to_f) * height
    else
      w = (h.to_f/height.to_f) * width
    end
    if [5,6,7,8].include?(orientation)
      # need to reverse our values (sideways orientation)
      htmp = w
      wtmp = h
      h    = htmp
      w    = wtmp
    end

    thumb = Tempfile.new("thumb")

    begin
      Thumbnail.create(
        :in => path,
        :out => thumb.path,
        :width => w.to_i,
        :height => h.to_i
      )

      return thumb.read
    ensure
      thumb.close
      thumb.unlink
    end
  end

  def tid
    @pid
  end

  def width
    to_hash["width"].to_i
  end

  def height
    to_hash["height"].to_i
  end

  def date
    Time.at(to_hash["timestamp"])
  end

  def orientation
    to_hash["orientation"]
  end

  def path
    to_hash["path"]
  end

  def short_hash
    keys = ["poiX", "poiY", "timestamp", "pid", "visibility",
            "height", "width", "timestampType", "year"]
    short = to_hash.select {|k| keys.include?(k)}
    short["pid"] = short["tid"] = @pid

    short
  end

  def to_hash
    MessagePack.unpack(@db.get(key))
  end
end