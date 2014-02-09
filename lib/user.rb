require 'msgpack'
require 'securerandom'
require 'digest/sha1'

class User
  attr_reader :uid, :email, :first_name, :last_name

  def initialize(db, uid)
    @db = db
    @uid = uid
  end

  def self.primary_user_key
    "USER.PRIMARY"
  end

  def self.key(uid)
    "USER.#{uid}"
  end

  def self.create(db, email, first_name, last_name)
    _uid = SecureRandom.hex

    db.batch do |batch|
      batch.put(User.primary_user_key, _uid)
      batch.put(User.key(_uid), {
        "created_at" => Time.now.to_i,
        "email"      => email,
        "first_name" => first_name,
        "last_name"  => last_name
      }.to_msgpack)
    end

    User.new(db, _uid)
  end

  def self.primary_user(db)
    User.new(db, db.get(User.primary_user_key))
  end

  def key
    User.key(@uid)
  end

  def email
    to_hash["email"]
  end

  def first_name
    to_hash["first_name"]
  end

  def last_name
    to_hash["last_name"]
  end

  def created_at
    to_hash["created_at"].to_i
  end

  def to_hash
    hash = MessagePack.unpack(@db.get(key)) rescue nil
    if not hash
      # retry one last time
      hash = MessagePack.unpack(@db.get(key)) rescue nil
    end
    return nil unless hash

    hash
  end

  def self.to_json_full(db)
    user = User.primary_user(db)
    {
      "_statusCode" => 200,
      "origin" => "web",
      "importState" => "ready",
      "cookies" => {
        "photoMeta" => true,
        "viewedTourSections" => [
          "Event",
          "Explore",
          "Highlight",
          "Memories",
          "Share",
          "Source"
        ],
        "learnMoreAboutPhotoMail" => true,
        "tourAutoOpened" => {
          "explore" => true,
          "moments" => true,
          "highlights" => true,
          "sharing" => true,
          "sources" => true
        }.to_json,
        "skipWelcome" => true,
        "ios.viewedTour" => 1
      },
      "uuid" => user.uid,
      "flashbackEmails" => [],
      "mailingLists" => {
        "promotions" => true,
        "flashback" => true,
        "photo_mail_notifications" => true,
        "everpix_newsletter" => true,
        "system" => true
      },
      "timezone" => "#{Time.now.strftime("%z")[0..2]}:00",
      "features" => {
        "allowSubscription" => false,
        "forwardFlashbacks" => true,
        "allowDownloadAccountArchive" => true
      },
      "authtoken" => "fakeAuthToken",
      "access" => "full",
      "email" => user.email,
      "hasNotifications" => false,
      "pendingEmails" => [],
      "priorityInvites" => true,
      "updating" => false,
      "subscription" => {
        "graceExpiration" => false,
        "planDaysLeft" => 365,
        "payment" => nil, 
        "planExpiration" => 9999999999.0,
        "graceDaysLeft" => nil,
        "plan" => "monthly",
        "processor" => "stripe"
      },
      "created" => user.created_at,
      "firstName" => user.first_name,
      "lastName" => user.last_name,
      "mode" => "Subscribed",
      "activeEmails" => [user.email]
    }.to_json
  end
end
