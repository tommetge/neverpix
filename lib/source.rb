require 'msgpack'
require 'securerandom'
require 'digest/sha1'
require 'socket'

class SourceIndex
  def initialize(db)
    @db = db
  end

  def index
    idx = @db.get(SourceIndex.key)
    return MessagePack.unpack(idx) if idx
    []
  end

  def self.key
    "SOURCE_IDX"
  end

  def self.key_for(path)
    "#{SourceIndex.key}.#{Digest::SHA1.hexdigest(path)}"
  end

  def source(path)
    sid = @db.get(SourceIndex.key_for(path))
    return nil unless sid
    Source.new(@db, sid)
  end

  def update(batch, path, sid)
    idx = index
    idx << sid
    batch.put(SourceIndex.key_for(path), sid)
    batch.put(SourceIndex.key, idx.to_msgpack)
  end
end

class Source
  attr_reader :sid

  def initialize(db, sid)
    @db = db
    @sid = sid
  end

  def self.key(sid)
    "SOURCE.#{sid}"
  end

  def self.create_with_path(db, path)
    idx = SourceIndex.new(db)

    current = idx.source(path)
    return current if current

    _sid = SecureRandom.hex

    db.batch do |batch|
      batch.put(Source.key(_sid), {
        "createdTimestamp" => Time.now.to_f,
        "deviceName" => Socket.gethostname,
        "state" => "active",
        "deviceType" => "mac",
        "sourceType" => "mac-folder",
        "sourceName" => File.basename(path),
        "sourceUUID" => Digest::SHA1.hexdigest(path),
        "deviceUUID" => _sid
      }.to_msgpack)

      idx.update(batch, path, _sid)
    end

    Source.new(db, _sid)
  end

  def key
    Source.key(@sid)
  end

  def to_hash
    hash = MessagePack.unpack(@db.get(key)) rescue nil
    if not hash
      # retry one last time
      hash = MessagePack.unpack(@db.get(key)) rescue nil
    end
    return nil unless hash

    hash
  end
end
