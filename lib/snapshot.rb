require 'msgpack'
require 'cgi'
require 'json'
require 'securerandom'

require_relative 'photo'
require_relative 'index'

class Snapshot
  attr_reader :sid

  def initialize(db, sid)
    @db = db
    @sid = sid
  end

  def self.key(sid)
    "SNAPSHOT.#{sid}"
  end

  def self.all_snapshots(db)
    snapshots = []
    db.range("SNAPSHOT.\x00", "SNAPSHOT/").each do |k, v|
      sid = k.split(".").last
      snapshots << Snapshot.new(db, sid)
    end

    snapshots
  end

  def self.update_with_params(db, params)
    snapshot = Snapshot.new(db, params[:sid])

    pids = JSON.parse(params[:pids])
    puts "Updating snapshot with #{pids.count} photos"

    photo_ts = pids.map {|pid| Photo.new(db, pid).date.to_i}
    photo_ts.sort!

    puts "Updating #{snapshot.key}"
    db.put(snapshot.key, {
      "title" => params[:title],
      "minDate" => photo_ts.first.to_i,
      "maxDate" => photo_ts.last.to_i,
      "createdDate" => snapshot.to_hash["createdDate"].to_i,
      "modifiedTime" => Time.now.to_i,
      "allowDownload" => params[:allowDownload] ? 1 : 0,
      "photoCount" => pids.count,
      "photos" => pids
    }.to_msgpack)

    puts "Snapshot now has #{snapshot.to_hash["photoCount"]} photos"

    snapshot
  end

  def self.create_from_params(db, params)
    _sid = SecureRandom.hex

    pids = JSON.parse(params[:pids])

    photo_ts = pids.map {|pid| Photo.new(db, pid).date.to_i}
    photo_ts.sort!

    db.put(Snapshot.key(_sid), {
      "title" => params[:title],
      "minDate" => photo_ts.first.to_i,
      "maxDate" => photo_ts.last.to_i,
      "createdDate" => Time.now.to_i,
      "modifiedTime" => Time.now.to_i,
      "allowDownload" => params[:allowDownload] ? 1 : 0,
      "photoCount" => pids.count,
      "photos" => pids
    }.to_msgpack)

    Snapshot.new(db, _sid)
  end

  def delete!
    @db.delete(key)
  end

  def key
    Snapshot.key(@sid)
  end

  def photos
    to_hash["photos"].map {|short_hash| short_hash}
  end

  def to_hash
    hash = MessagePack.unpack(@db.get(key)) rescue nil
    if not hash
      # retry one last time
      hash = MessagePack.unpack(@db.get(key)) rescue nil
    end
    return nil unless hash

    hash["photos"] = hash["photos"].map {|pid| Photo.new(@db, pid).short_hash}
    hash["photoCount"] = hash["photos"].count
    hash["sid"] = @sid
    hash["url"] = "http://localhost:4567/public.html?id=#{@sid}"

    hash
  end

  def to_hash_with_key_photos
    hash = to_hash

    hash["keyPhotos"] = []
    if hash["photos"].count <= 5
      hash["photos"].each {|photo_hash| hash["keyPhotos"] << photo_hash}
    else
      num_photos = [hash["photos"].count, 5].min
      partition_size = (hash["photos"].count.to_f/num_photos).to_i
      num_photos.times do |n|
        break if hash["keyPhotos"].count >= 5
        r = rand(partition_size - 1).to_i + (partition_size * (n + 1))
        hash["keyPhotos"] << hash["photos"][r] if hash["photos"][r]
      end
    end

    hash
  end
end
