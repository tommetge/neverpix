#!/usr/bin/env ruby

require 'test/unit'

require 'bundler/setup'
require 'leveldb'
require 'tempfile'

require_relative '../lib/user'

class TestUser < Test::Unit::TestCase
  def setup
    @db_path = Dir.mktmpdir
    @db = LevelDB::DB.new(@db_path)
  end

  def teardown
    @db.close
    FileUtils.rm_rf(@db_path)
  end

  def test_create
    user = User.create(@db, "test@test.com", "test", "user")
    assert_not_nil(@db.get(User.primary_user_key))
    assert_not_nil(@db.get(User.key(user.uid)))
    assert_not_nil(user.to_hash)
    assert_not_nil(User.primary_user(@db).to_hash)
    assert_equal("test", User.primary_user(@db).to_hash["first_name"])
    assert_equal("user", User.primary_user(@db).to_hash["last_name"])
    assert_equal("test@test.com", User.primary_user(@db).to_hash["email"])
  end
end
