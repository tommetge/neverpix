#!/usr/bin/env ruby

require 'test/unit'

require 'bundler/setup'
require 'leveldb'
require 'json'
require 'tempfile'

require_relative '../lib/source'

class TestSource < Test::Unit::TestCase
  def setup
    @db_path = Dir.mktmpdir
    @db = LevelDB::DB.new(@db_path)
  end

  def teardown
    @db.close
    FileUtils.rm_rf(@db_path)
  end

  def data_dir
    File.absolute_path(File.join(File.dirname(__FILE__), 'data'))
  end

  def test_create
    source = Source.create_with_path(@db, data_dir)
    assert_not_nil(source)
    assert_equal(source.to_hash["sourceName"], File.basename(data_dir))
    assert_equal(source.to_hash["sourceUUID"], Digest::SHA1.hexdigest(data_dir))
    assert_equal(1, SourceIndex.new(@db).index.count)
    assert_equal(source.sid, SourceIndex.new(@db).index.first)
  end

  def test_create_dups
    100.times do
      source = Source.create_with_path(@db, data_dir)
      assert_not_nil(source)
    end
    assert_equal(1, SourceIndex.new(@db).index.count)
  end
end
