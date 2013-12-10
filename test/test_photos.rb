#!/usr/bin/env ruby

require 'test/unit'

require 'bundler/setup'
require 'leveldb'
require 'securerandom'

require_relative '../lib/photo'

TestPhotoExif = {
  "focalLength"=>"4.12",
  "isoSpeedRatings"=>"64.0",
  "fNumber"=>"2.2",
  "exposureTime"=>"1/30"
}

TestPhotoSources =
[
  {
    "deviceName"=>"tm-mac-pro",
    "sourceType"=>"mac-folder",
    "filePath"=> File.join(File.dirname(__FILE__), "data/2013-11-29 15.27.52-3.jpg"),
    "sourceName"=>"camera uploads",
    "albumName"=>"camera uploads",
    "fileName"=>"2013-11-29 15.27.52-3.jpg"
  }
]
TestPhotoCaptureDevice = {
  "make"=>"Apple",
  "model"=>"iPhone 5s"
}

{
  "orientation"=>1,
  "timestamp"=>1385764072.0,
  "modified"=>"2013-11-29 15:27:52 -0700",
  "visibility"=>1,
  "height"=>2448,
  "width"=>3264,
  "year"=>2013,
  "tid"=>"861c3217e32b168f3b19c7404ed1f784",
  "originalTimestamp"=>1385764072.0,
}

class TestPhotoTimeIndex < Test::Unit::TestCase
  def setup
    @db_path = Dir.mktmpdir
    @db = LevelDB::DB.new(@db_path)
  end

  def teardown
    @db.close
    FileUtils.rm_rf(@db_path)
  end

  def test_update
    idx = PhotoTimeIndex.new(@db)
    now = Time.now
    100.times.each do |n|
      @db.batch do |batch|
        ts = now + n
        idx.update(batch, ts, SecureRandom.hex)
      end
    end

    assert_equal(100, idx.index.count)
  end

  def test_update_with_dups
    idx = PhotoTimeIndex.new(@db)
    now = Time.now
    100.times.each do |n|
      @db.batch do |batch|
        idx.update(batch, now, SecureRandom.hex)
      end
    end

    assert_equal(1, idx.index.count)
    assert_equal(100, idx.photos(now).count)
  end

  def test_find
    idx = PhotoTimeIndex.new(@db)
    now = Time.now
    100.times.each do |n|
      @db.batch do |batch|
        ts = now + n
        idx.update(batch, ts, SecureRandom.hex)
      end
    end
    
    assert_equal(100, idx.index.count)

    100.times.each do |n|
      assert_equal(1, idx.photos(now + n).count)
    end
  end
end

class TestPhotoDateIndex < Test::Unit::TestCase
  def setup
    @db_path = Dir.mktmpdir
    @db = LevelDB::DB.new(@db_path)
  end

  def teardown
    @db.close
    FileUtils.rm_rf(@db_path)
  end

  def test_something
    assert(true)
  end
end

class TestPhoto < Test::Unit::TestCase
  def setup
    @db_path = Dir.mktmpdir
    @db = LevelDB::DB.new(@db_path)
  end

  def teardown
    @db.close
    FileUtils.rm_rf(@db_path)
  end

  def jpg
    File.absolute_path(
      File.join(File.dirname(__FILE__),
                'data/2013-11-29 15.27.52-3.jpg'))
  end

  def add_test_photo
    Photo.create_from_file(@db, jpg)
  end

  def test_create
    p = add_test_photo
    assert_not_nil(p)
    assert_equal(p.path, jpg)
    assert_equal(p.to_hash["exif"], TestPhotoExif)
    assert_equal(p.to_hash["sources"], TestPhotoSources)
    assert_equal(p.to_hash["captureDevice"], TestPhotoCaptureDevice)
    assert_equal(p.to_hash["orientation"], 1)
    assert_equal(p.date, Time.at(1385764072.0))
    assert_equal(p.to_hash["height"], 2448)
    assert_equal(p.to_hash["width"], 3264)
    assert_equal(p.to_hash["year"], 2013)
    assert_equal(p.to_hash["tid"], p.pid)

    p2 = Photo.new(@db, p.pid)
    assert_equal(p.pid, p2.pid)
    assert_equal(p.path, p2.path)
    assert_equal(p.to_hash, p2.to_hash)
  end

  def test_create_updates_index
    p = add_test_photo
    assert_not_nil(p)

    idx = p.index
    indexed = idx.photos(p.date)
    assert_equal(indexed.count, 1)
    assert_equal(indexed.first, p.pid)

    idx = p.path_index
    assert_not_nil(idx.photo(jpg))
    assert_equal(idx.photo(jpg).pid, p.pid)
  end

  def test_create_no_duplicates
    p = add_test_photo
    assert_not_nil(p)

    p2 = add_test_photo
    assert_not_nil(p2)
    assert_equal(p.pid, p2.pid)

    assert_equal(p.index.index.count, 1)
    assert_equal(p.path_index.photo(jpg).pid, p.pid)
  end
end
