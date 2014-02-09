#!/usr/bin/env ruby

# create_user.rb
#
# Usage: create_user.rb first_name last_name email_address
#
# Use this script to create a user for your Neverpix instance.
#
# Note: this must be run while the server is SHUT DOWN!

require 'bundler/setup'
require 'leveldb'

require_relative '../lib/user'

db = LevelDB::DB.new(File.join(File.dirname(File.dirname(__FILE__)), 'db'))

current_user = User.primary_user(db).to_hash rescue nil
if current_user
  puts "Primary user already exists. Exiting..."
  exit 1
end

first_name = ARGV[0]
last_name  = ARGV[1]
email      = ARGV[2]

if !first_name || !last_name || !email
  puts "Usage: create_user.rb [first name] [last name] [email address]"
  exit 1
end

User.create(db, email, first_name, last_name)
