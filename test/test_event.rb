#!/usr/bin/env ruby

require 'test/unit'

require 'bundler/setup'
require 'leveldb'
require 'securerandom'

require_relative '../lib/photo'
require_relative '../lib/event'

class TestEvent < Test::Unit::TestCase
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

  def add_event
    p = add_test_photo
    e = Event.create_from_params(@db, {
      :minDate => p.date,
      :maxDate => p.date,
      :timestamp => p.date,
      :timeOfDay => "",
      :visibility => 1,
      :pids => [p.pid]
    })
    assert_equal(1, e.photos.count)
    assert_equal(p.pid, e.photos.first.pid)
    e
  end

  def test_create
    add_event
  end

  def test_create_dups
    100.times do
      add_event
    end

    assert_equal(1, Event.index(@db).index.count)
  end

  def test_hash
    e = add_event
    assert_equal(1, e.photos.count)
    keys = ["minDate", "maxDate", "timestamp", "timeOfDay",
            "visibility", "photos"]
    hash = e.to_hash
    keys.each do |required_key|
      assert_not_nil(hash[required_key])
    end
  end

  def test_highlights
    e = add_event
    assert_equal(1, e.photos.count)
    highlights = Event.highlights_from_params(@db, {
      :order => 'asc',
      :year => 2013  
    })
    assert_equal(1, highlights.count)
  end

  def test_find_by_year
    e = add_event
    assert_equal(1, e.photos.count)
    assert_equal(1, Event.index(@db).find_by_year(2013).count)
    assert_equal(0, Event.index(@db).find_by_year(2012).count)
    assert_equal(0, Event.index(@db).find_by_year(0).count)
  end
end
