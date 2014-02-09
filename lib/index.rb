require 'time'

class TimestampIndex
  def initialize(db)
    @db = db
  end

  def self.key
    raise NoMethodError.new
  end

  def index
    raise NoMethodError.new
  end

  def update(object)
    raise NoMethodError.new
  end

  def find(start_time, finish_time, limit=50)
    # this should be 2log(n)
    idx = index

    start  = start_time.to_i
    finish = finish_time ? finish_time.to_i : Time.now.to_i

    start  = start < idx.first ? idx.first : start
    finish = finish > idx.last ? idx.last : finish

    limit  = limit ? limit : -1

    return [] if start > idx.last
    return [] if finish < idx.first

    s = (0...idx.count).bsearch {|i| idx[i] >= start}
    f = (0...idx.count).bsearch {|i| idx[i] >= finish}

    idx[s..f].map {|ts| object(ts)}
  end

  def find_by_year(year)
    return [] unless year > 0
    start = Time.parse("1/1/#{year}")
    finish = Time.parse("1/1/#{year.to_i + 1}")
    find(start, finish)
  end

  def find_by_pid(pid)
    photo = Photo.new(@db, pid)
    start = photo.date - 14400
    finish = photo.date + 14400
    find(start, finish)
  end
end
