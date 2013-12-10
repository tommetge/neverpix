#!/usr/bin/env ruby

require 'test/unit'

require 'bundler/setup'
require 'leveldb'
require 'securerandom'
require 'json'

require_relative '../lib/photo'
require_relative '../lib/snapshot'

class TestSnapshot < Test::Unit::TestCase
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
    s = Snapshot.create_from_params(@db, {
      :title => "Test Snapshot",
      :allowDownload => true,
      :pids => [p.pid].to_json
    })
    assert_equal(1, s.photos.count)
    assert_equal(p.pid, s.photos.first["pid"])
  end

  def test_key_photos
    p = add_test_photo
    s = Snapshot.create_from_params(@db, {
      :title => "Test Snapshot",
      :allowDownload => true,
      :pids => [p.pid].to_json
    })
    assert_equal(1, s.photos.count)
    hash = s.to_hash_with_key_photos
    assert_equal(1, hash["keyPhotos"].count)
    assert_equal(p.pid, hash["keyPhotos"].first["pid"])
    keys = ["minDate", "maxDate", "title", "createdDate", "modifiedTime",
            "allowDownload", "photoCount", "photos", "keyPhotos"]
    keys.each do |required_key|
      assert_not_nil(hash[required_key])
    end
  end

  def test_hash
    p = add_test_photo
    s = Snapshot.create_from_params(@db, {
      :title => "Test Snapshot",
      :allowDownload => true,
      :pids => [p.pid].to_json
    })
    assert_equal(1, s.photos.count)
    keys = ["minDate", "maxDate", "title", "createdDate",
            "modifiedTime", "allowDownload", "photoCount", "photos"]
    hash = s.to_hash
    keys.each do |required_key|
      assert_not_nil(hash[required_key])
    end
  end
end
