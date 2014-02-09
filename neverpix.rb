#!/usr/bin/env ruby

require 'bundler/setup'
require 'sinatra'
require 'leveldb'
require 'time'
require 'json'
require 'digest/sha1'

require_relative 'lib/photo'
require_relative 'lib/event'
require_relative 'lib/snapshot'
require_relative 'lib/source'
require_relative 'lib/user'

$db = LevelDB::DB.new('db')

get '/' do
  redirect '/index.html'
end

# API

before '/v2/*' do
  content_type 'application/json'
end

post '/v2/email_export' do
  # FIXME: implement this
  '{"_statusCode": 200}'
end

get '/v2/album_list' do
  '{
    "cursor": null,
    "_statusCode": 200,
    "albums": []
  }'
end

post '/v2/snapshot_create' do
  snapshot = Snapshot.create_from_params($db, params)
  snapshot.to_hash.merge({"_statusCode" => 200}).to_json
end

post '/v2/snapshot_update' do
  snapshot = Snapshot.update_with_params($db, params)
  snapshot.to_hash.merge({"_statusCode" => 200}).to_json
end

post '/v2/snapshot_delete' do
  if snapshot = Snapshot.new($db, params[:sid])
    snapshot.delete!
    return '{"_statusCode": 200}'
  end

  status 404
  '{"_statusCode": 404}'
end

get '/v2/snapshot_public_info' do
  snapshot = Snapshot.new($db, params[:sid])
  snapshot.to_hash.merge({"_statusCode" => 200}).to_json
end

get '/v2/snapshot_info' do
  snapshot = Snapshot.new($db, params[:sid])
  {
    "_statusCode" => 200,
    "info"        => snapshot.to_hash_with_key_photos
  }.merge(snapshot.to_hash).to_json
end

get '/v2/snapshot_list' do
  {
    "cursor"      => nil,
    "_statusCode" => 200,
    "snapshots"   => Snapshot.all_snapshots($db).map {|s| s.to_hash_with_key_photos}
  }.to_json
end

get '/v2/highlight_photos' do
  # return a random selection of photos from each event numbering about 10% of total
  photos = Event.highlights_from_params($db, params)
  {
    "cursor"      => "#{photos.last.date.to_i + 1},#{photos.last.pid},#{params[:order]}",
    "photos"      => photos.map {|photo| photo.short_hash},
    "_statusCode" => 200
    }.to_json
end

get '/v2/photo_interesting_set' do
  # FIXME: make this actually respect the type requested

  photos = {"photos" => [], "_statusCode" => 200}
  idx = PhotoTimeIndex.new($db)
  index = idx.index
  while photos["photos"].length < params[:limit].to_i
    selections = idx.photos(index[rand(index.count)])
    photos["photo"] << Photo.new($db, selections[rand(selections.count)]).short_hash
  end
  selections = idx.photos(index[rand(index.count)])
  photos["featuredPhoto"] = Photo.new($db, selections[rand(selections.count)]).short_hash

  return photos.to_json
end

get '/v2/photo_info' do
  Photo.new($db, params[:pid]).to_hash.merge({"_statusCode" => 200}).to_json
end

get '/v2/photo_shuffle' do
  photos = {"photos" => [], "_statusCode" => 200}

  idx   = PhotoTimeIndex.new($db)
  index = idx.index
  pids  = []
  while pids.length < params[:limit].to_i
    selections = idx.photos(index[rand(index.count)])
    pids << selections[rand(selections.count)]
  end
  photos["photos"] = pids.map {|pid| Photo.new($db, pid).short_hash}

  photos.to_json
end

get '/v2/inbox_list' do
  # FIXME: this *could* be useful. maybe implement later.
  '{
    "cursor": null,
    "mails": [],
    "_statusCode": 200
  }'
end

get '/v2/inbox_unread' do
  # FIXME: this *could* be useful. maybe implement later.
  '{
    "count": 0,
    "_statusCode": 200
  }'
end

get '/v2/event_info' do
  event = nil
  if params[:pid]
    event = EventIndex.new($db).find_by_pid(params[:pid]).first
  else
    event = Event.new($db, params[:eid])
  end

  if not event
    status 404
    return '{"_statusCode": 404}'
  end

  {
    "_statusCode" => 200,
    "cursor"      => nil,
    "photos"      => event.to_hash['photos'],
    "eid"         => params[:eid],
    "event"       => event.to_hash
  }.to_json
end

get '/v2/event_list' do
  events = Event.from_params($db, params)
  cursor = nil
  if !params[:startTimestamp] && !params[:endTimestamp]
    cursor = "#{events.last.timestamp.to_f + 1},#{params[:order]}" if events.count > 0
  end

  {
    "cursor"      => cursor,
    "_statusCode" => 200,
    "events"      => events.map {|e| e.to_hash}
  }.to_json
end

get '/v2/event_memories' do
  # FIXME: This doesn't account for leap years
  start = (Time.at(params[:timestamp].to_f).to_date - 365).to_time
  finish = (Time.at(params[:timestamp].to_f).to_date - 364).to_time

  idx = EventIndex.new($db)
  events = idx.find(start, finish).map {|e| e.to_hash}

  {
    "_statusCode"        => 200,
    "relativeExpiration" => finish.to_f - params[:timestamp].to_f,
    "events"             => events,
    "timestamp"          => start.to_i
  }.to_json
end

get '/v2/user_statistics' do
  photo_index = PhotoTimeIndex.new($db).index
  {
    '_statusCode'             => 200,
    :updated                  => Time.now.to_f,
    :totalPhotoCount          => photo_index.count, # inaccurate
    :photoMailsSent           => 0,
    :syncedPhotoCount         => photo_index.count, # inaccurate
    :updating                 => false,
    :eventCount               => EventIndex.new($db).index.count,
    :albumCount               => 0, # unimplemented
    :accessibleDuplicateCount => 0, # unimplemented
    :deferredPhotoCount       => 0,
    :oldestPhotoTimestamp     => photo_index.first.to_i,
    :accessiblePhotoCount     => photo_index.count, # inaccurate
    :snapshotCount            => Snapshot.all_snapshots($db).count,
    :newestPhotoTimestamp     => photo_index.last.to_i,
    :pending                  => {
      :deduplication => false,
      :highlights    => false,
      :downloads     => 0,
      :photos        => 0,
      :explore       => false,
      :albums        => false,
      :events        => false
    }
  }.to_json
end

post '/v2/activity_record' do
  '{"_statusCode": 200}'
end

get '/v2/email_recent' do
  '{
    "_statusCode": 200,
    "emails": []
  }'
end

get '/v2/user_years' do
  years = EventIndex.new($db).years
  {
    '_statusCode'   => 200,
    :eventYears     => years,
    :albumYears     => years, # FIXME: implement this
    :highlightYears => years
  }.to_json
end

get '/v2/user_sources' do
  {
    "_statusCode" => 200,
    "connections" => {
      "instagram" => nil,
      "twitter"   => nil,
      "picasa"    => nil,
      "facebook"  => nil,
      "flickr"    => nil,
      "emails"    => [],
      "gmail"     => nil
    },
    "devices" => [],
    "sources" => SourceIndex.new($db).index.map {|s| Source.new($db, s).to_hash}
  }.to_json
end

post '/v2/user_refresh' do
  # FIXME: Show the tour resources at least once
  User.to_json_full($db)
end

get '/v2/status' do
  '{
    "_statusCode": 200
  }'
end

post '/v2/user_login' do
  User.to_json_full($db)
end

# THUMBNAILS

def thumbnail_key(photo, size)
  "THUMBS.#{Digest::SHA1.hexdigest(photo.path)}.#{params[:size]}"
end

get '/thumbnail/:photo_id/:size' do
  photo = Photo.new($db, params[:photo_id])

  if params[:size] == 'original'
    response.headers['Content-Type'] = 'image/jpeg'
    response.headers['Content-Disposition'] = "attachment; filename=\"#{File.basename(photo.path)}\""
    return File.open(photo.path).read
  end

  # Either fetch or generate a new thumbnail

  response.headers['Content-Type'] = 'image/jpeg'

  key = thumbnail_key(photo, params[:size])
  thumb = $db.get(key)
  return thumb if thumb

  # Generate a new thumbnail and cache it

  if params[:size][-1] == 'W'
    thumb = photo.generate_thumbnail(params[:size].to_i)
  else
    thumb = photo.generate_thumbnail(nil, params[:size].to_i)
  end

  # FIXME: defer this to a worker pool
  $db.put(key, thumb)

  thumb
end
