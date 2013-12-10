require 'msgpack'
require 'time'
require 'securerandom'

require_relative 'photo'
require_relative 'index'

# Indexes:
#  - eid
#  - timestamp

class EventIndex < TimestampIndex
  def self.key
    "EVENT_TIMESTAMP_IDX"
  end

  def self.key_for(timestamp)
    "#{EventIndex.key}.#{timestamp.to_i}"
  end

  def index
    idx = @db.get(EventIndex.key)
    return MessagePack.unpack(idx) if idx
    []
  end

  def years
    # FIXME: this could be significantly improved
    index.map {|ts| Time.at(ts).year}.uniq
  end

  def object(timestamp)
    event(timestamp)
  end

  def event(timestamp)
    eid = @db.get("#{EventIndex.key}.#{timestamp.to_i}")
    return nil unless eid
    Event.new(@db, eid)
  end

  def update(batch, timestamp, eid)
    idx = index
    if not idx.include?(eid)
      idx << timestamp.to_i
      batch.put(EventIndex.key, idx.sort.to_msgpack)
    end
    batch.put(EventIndex.key_for(timestamp), eid)
  end
end

$times = {
  0 => "night",
  1 => "night",
  2 => "late_night",
  3 => "late_night",
  4 => "late_night", 
  5 => "early_morning",
  6 => "early_morning",
  7 => "early_morning",
  8 => "morning",
  9 => "morning",
  10 => "morning",
  11 => "midday",
  12 => "midday",
  13 => "midday",
  14 => "afternoon",
  15 => "afternoon",
  16 => "afternoon",
  17 => "early_evening",
  18 => "early_evening",
  19 => "early_evening",
  20 => "evening",
  21 => "evening",
  22 => "evening",
  23 => "night",
}

class Event
  attr_reader :eid

  def initialize(db, eid)
    @db = db
    @eid = eid
  end

  def self.key(eid)
    "EVENT.#{eid}"
  end

  def self.index(db)
    EventIndex.new(db)
  end

  def self.create_from_params(db, params)
    event = EventIndex.new(db).event(params[:timestamp])
    return event if event

    _eid = SecureRandom.hex

    db.batch do |batch|
      batch.put(Event.key(_eid), {
        "minDate" => params[:minDate].to_i,
        "maxDate" => params[:maxDate].to_i,
        "timestamp" => params[:timestamp].to_i,
        "photoSetVersion" => "1",
        "timeOfDay" => params[:timeOfDay],
        "visibility" => params[:visibility],
        "photos" => params[:pids]
      }.to_msgpack)

      Event.index(db).update(batch, params[:timestamp], _eid)
    end

    Event.new(db, _eid)
  end

  def self.events(db)
    Event.index(db).index.map {|ts| Event.index(db).event(ts)}
  end

  def self.from_params(db, params)
    return Event.new(db, params[:eid]) if params[:eid]

    events = []
    idx = index(db)
    if params[:startTimestamp] && params[:endTimestamp]
      events = idx.find(params[:startTimestamp].to_i, params[:endTimestamp].to_i, params[:limit])
    elsif params[:cursor]
      startTimestamp = params[:cursor].split(",").first
      endTimestamp = Time.parse("#{params[:year].to_i + 1}-01-01}") if params[:year]
      events = idx.find(startTimestamp.to_i, endTimestamp, params[:limit])
    elsif params[:year]
      events = idx.find_by_year(params[:year].to_i)
    elsif params[:pid]
      events = idx.find_by_pid(params[:pid])
    else
      events = Event.events(db)
    end

    if params[:order] == 'desc'
      events.reverse!
    end

    return events if params[:limit].to_i == 0 || params[:limit] == nil

    events[0...params[:limit].to_i]
  end

  def self.highlights_from_params(db, params)
    events = Event.from_params(db, {
        :order => params[:order],
        :year => params[:year],
        :cursor => params[:cursor]})
    _photos = []
    events.each do |event|
      break if params[:limit] && _photos.count >= params[:limit].to_i
      event_hash = event.to_hash
      if event_hash["photos"].count <= 5
        event_hash["photos"].each {|short_hash| _photos << Photo.new(db, short_hash["pid"])}
      else
        num_photos = (event_hash["photos"].count.to_f/10).to_i
        num_photos = 1 if num_photos == 0
        num_photos.times do |n|
          break if params[:limit] && _photos.count >= params[:limit].to_i
          short_hash = event_hash["photos"][rand(10) + (10 * (n + 1))]
          _photos << Photo.new(db, short_hash["pid"]) if short_hash
        end
      end
    end

    _photos
  end

  def self.timeOfDay(timestamp)
    $times[Time.at(timestamp).hour]
  end

  def key
    "EVENT.#{@eid}"
  end

  def index
    Event.index(@db)
  end

  def photos
    to_hash["photos"].map {|short_hash| Photo.new(@db, short_hash["pid"])}
  end

  def timestamp
    to_hash["timestamp"]
  end

  def <=>(other)
    timestamp <=> other.timestamp
  end

  def to_json
    to_hash.to_json
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
    hash["eid"] = @eid

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
