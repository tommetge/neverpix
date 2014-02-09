#!/usr/bin/env ruby

# update_photos.rb
#
# Usage: update_photos.rb [photo directory]
#
# Use this script to populate and update your photos database.
# It will non-recursively scan the folder you pass it for all
# JPG images and add them to your database as well as generate
# or update "Events" or "Moments" for the photos added.
#
# Note: this must be run while the server is SHUT DOWN!

require 'bundler/setup'
require 'leveldb'

require_relative '../lib/photo'
require_relative '../lib/event'
require_relative '../lib/source'

db = LevelDB::DB.new(File.join(File.dirname(File.dirname(__FILE__)), 'db'))
dir = ARGV[0]

Source.create_with_path(db, dir)

Dir.glob(File.join(dir, "*.{jpg,JPG}")).each do |photo_path|
  begin
    Photo.create_from_file(db, photo_path)
  rescue
    puts "Error processing: #{photo_path}"
  end
end

events = []
current_event = nil
last_photo = nil

photo_index = PhotoTimeIndex.new(db)
photo_index.index.each do |timestamp|
  if current_event == nil
    current_event = []
    current_event << timestamp
    next
  end

  if timestamp - current_event.last > 14400
    # save the old event, bring in the new
    events << current_event
    current_event = [timestamp]
  else
    # continue with the current event
    current_event << timestamp
  end
end

if !current_event.empty?
  events << current_event
end

events.each do |event|
  pids = []
  event.each do |timestamp|
    photo_index.photos(timestamp).each {|pid| pids << pid}
  end

  Event.create_from_params(db, {
    :minDate    => event.first,
    :maxDate    => event.last,
    :timestamp  => event.first,
    :timeOfDay  => Event.timeOfDay(event.first),
    :visibility => 1,
    :pids       => pids
  })
end

EventIndex.new(db).index.each do |ts|
  event = EventIndex.new(db).event(ts)
end
