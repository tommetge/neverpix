/* Copyright 2011-2013 33cube, Inc. All rights reserved. */
var HOSTNAME = window.location.host,
  HOST_LOCALHOST = "localhost" === HOSTNAME || "localhost:8080" === HOSTNAME,
  HOST_127_0_0_1 = "127.0.0.1" === HOSTNAME || "127.0.0.1:8080" === HOSTNAME,
  IS_RETINA = 2 <= window.devicePixelRatio,
  REGEX_EMAIL = /[a-zA-Z0-9][\w\.\+\$\*!%#&~\-]*@((([\w-]+\.)+[a-zA-Z]{2,})|localhost)/,
  REGEX_EMAIL_GLOBAL = /[a-zA-Z0-9][\w\.\+\$\*!%#&~\-]*@((([\w-]+\.)+[a-zA-Z]{2,})|localhost)/g,
  REGEX_TIME = /([0-9]{1,2}):?([0-9]{2})?\s?([aApP][mM])?/,
  REGEX_BACKGROUNDIMAGE = /url\(['"]?(.*?[\.png|gif|jpg|jpeg|svg|webp])['"]?\)/,
  REGEX_BACKGROUNDIMAGE_GLOBAL = /url\(['"]?(.*?[\.png|gif|jpg|jpeg|svg|webp])['"]?\)/g,
  API_SERVER_URL;
API_SERVER_URL = HOST_LOCALHOST ? "http://localhost:4567/" : HOST_127_0_0_1 ? "http://127.0.0.1:8888/" : "http://localhost:4567/";
var STRIPE_KEY;
STRIPE_KEY = HOST_LOCALHOST || HOST_127_0_0_1 ? "pk_OicanASa5XV1zdX0SqK2ae4Ye5pMj" : "pk_HFzMqaZVZrUTNnwECQKntqbQnYJwM";
var MAPS_KEY = "AIzaSyC-Ow2_CSyiMFVK8bmAvdpnuVVmjlrCBTQ";
if (HOST_LOCALHOST || HOST_127_0_0_1) var MAPS_API_URL = "https://maps.googleapis.com/maps/api/js?sensor=false",
MAPS_STATIC_URL = "https://maps.googleapis.com/maps/api/staticmap?sensor=false";
else MAPS_API_URL = "https://maps.googleapis.com/maps/api/js?key=" + MAPS_KEY + "&sensor=false", MAPS_STATIC_URL = "https://maps.googleapis.com/maps/api/staticmap?key=" + MAPS_KEY + "&sensor=false";
var WALGREENS_KEY = "cca1e194c7c78ed15b1b63fddf3fdbfa",
  WALGREENS_API_URL = "https://services.walgreens.com/api/util/mweb5url",
  WALGREENS_AFFILIATE_ID = "everpix",
  WALGREENS_PUBLISHER_ID = "6499439",
  WALGREENS_GROUP_ID = "STDPR",
  THUMBNAIL_SERVER_URL;
THUMBNAIL_SERVER_URL = HOST_LOCALHOST ? "http://localhost:4567/thumbnail/" : HOST_127_0_0_1 ? "http://127.0.0.1:9999/" : "http://localhost:4567/thumbnail/";
var THUMBNAIL_SIZE_TINY = "225H",
  THUMBNAIL_SIZE_PHOTOPREVIEW = "225H",
  THUMBNAIL_SIZE_PHOTOPREVIEW_DROPCAP = "462H",
  THUMBNAIL_SIZE_CONTEXTPREVIEW = "302W",
  THUMBNAIL_SIZE_CONTEXTPREVIEW_WIDE = "202H",
  THUMBNAIL_SIZE_DOWNLOAD = "original",
  THUMBNAIL_FULL_SIZES = {
    480: "480T",
    800: "800T",
    1024: "1024T",
    1600: "1600T"
  }, USER_REFRESH_INTERVAL = 216E5,
  STREAM_REFRESH_INTERVAL = 6E5,
  PHOTO_UNDATED_TITLE = "Undated Photo",
  PHOTO_PREVIEW_DATE_FORMAT = "MMM d, yyyy",
  PHOTO_FULLINFO_ERROR = "Failed loading photo info.",
  PHOTO_DUMPID_ERROR = "Failed retrieving external link.",
  PHOTO_EDITTIMESTAMP_MESSAGE_RESET = "Original date reset. Click Save to continue.",
  PHOTO_EDITTIMESTAMP_FULL_FORMAT = "MMM d yyyy, h:mm TT",
  PHOTO_EDITTIMESTAMP_DATE_FORMAT = "MMM dd yyyy",
  PHOTO_EDITTIMESTAMP_TIME_FORMAT = "h:mm TT",
  PHOTO_SEMANTICFEEDBACK_TOOLTIP = "Not {{tagTitle}}?",
  PHOTO_ROTATION_SEQUENCE = [1, 7, 6, 4, 3, 5, 8, 2],
  PHOTO_ROTATION_REQUEST_WAIT = 5E3,
  PHOTO_THUMBNAIL_LOADING = "Loading preview&hellip;",
  PHOTOVIEWER_MESSAGE_LOAD_ERROR = "Couldn't load this image.",
  PHOTOVIEWER_MESSAGE_DETAILS_ERROR = "Couldn't load image information.",
  PHOTOVIEWER_MESSAGE_ROTATE_ERROR = "Couldn't rotate this photo.",
  PHOTOVIEWER_MESSAGE_EDITTIMESTAMP_SUCCESS = "Photo date changed to {{timestamp}}",
  PHOTOVIEWER_MESSAGE_DELETE_ERROR = "Failed deleting photo. Please try again.",
  PHOTOVIEWER_MESSAGE_DELETE_SUCCESS = "Photo successfully deleted.",
  PHOTOVIEWER_MESSAGE_SLIDESHOW_ERROR = "Failed loading next photo.",
  PHOTOVIEWER_SLIDESHOW_WAIT = 3E3,
  PHOTOVIEWER_HIDECHROME_WAIT = 3E3,
  PHOTOVIEWER_JUMPTO_DATE_FORMAT = "MMM d, yyyy",
  PHOTOVIEWER_META_DATE_FORMAT = "MMM d yyyy, h:mm TT",
  PHOTOVIEWER_MINIMAP_URL = MAPS_STATIC_URL + "&center={{latitude}},{{longitude}}&zoom=14&size=256x190&style=saturation:-50|hue:15",
  PHOTOVIEWER_MAP_LINK = "http://maps.google.com/?q={{latitude}},{{longitude}}",
  PHOTOVIEWER_LATLONG_DESCRIPTION = "Latitude {{latitude}}\u00b0{{latitudeRef}}, Longitude {{longitude}}\u00b0{{longitudeRef}}",
  PHOTOVIEWER_SHARE_PHOTOMAIL_SUBJECT = "{{#date}}Photo from {{date}}{{/date}}{{^date}}My Photo{{/date}}",
  PHOTOVIEWER_SHARE_PHOTOMAIL_DATE_FORMAT = "MMMM dS, yyyy",
  PHOTOVIEWER_SHARE_PHOTOPAGE_TITLE =
    "{{date}}",
  PHOTOVIEWER_SHARE_PHOTOPAGE_DATE_FORMAT = "MMM d yyyy, h:mm TT",
  PHOTOVIEWER_NEARBY_DISTANCE_LABEL = "{{distance}} {{units}} away",
  PHOTOVIEWER_ACTIONALERT_LABEL_HIDE = "Hide",
  PHOTOVIEWER_ACTIONALERT_LABEL_UNHIDE = "Unhide",
  PHOTOVIEWER_ACTIONALERT_LABEL_ROTATERIGHT = "Right",
  PHOTOVIEWER_ACTIONALERT_LABEL_ROTATELEFT = "Left",
  PHOTOVIEWER_ACTIONALERT_LABEL_ATSTART = "At Start",
  PHOTOVIEWER_ACTIONALERT_LABEL_ATEND = "At End",
  PHOTOVIEWER_ACTIONALERT_LABEL_SLIDESHOW = "Slideshow",
  PHOTOVIEWER_ACTIONALERT_LABEL_PAUSE =
    "Pause",
  PHOTOVIEWER_ACTIONALERT_LABEL_THEEND = "The End",
  IMAGE_FADEIN_DURATION = 250,
  SHAREMENU_TITLE_PLURAL = "Share Photos:",
  SHAREMENU_TITLE_SINGULAR = "Share Photo:",
  SHARE_MESSAGE_SUCCESS = "Photo{{#isPlural}}s{{/isPlural}} shared to {{serviceTitle}}.",
  SHARE_MESSAGE_ERROR = "Failed sharing to {{serviceTitle}}. Please try again.",
  SHARE_MESSAGE_LOAD_PATH = "Loading Path friends&hellip;",
  SHARE_DEFAULT_TITLE = "My Photos",
  SHARE_DEFAULT_DESCRIPTION = "Shared from https://www.everpix.com",
  SHARE_TITLE_FACEBOOK = "Facebook",
  SHARE_TITLE_TWITTER = "Twitter",
  SHARE_TITLE_PHOTOMAIL = "Photo Mail",
  SHARE_TITLE_PHOTOPAGE = "Photo Page",
  SHARE_TITLE_PATH = "Path",
  SHARE_TITLE_WALGREENS = "Walgreens",
  SHARE_MESSAGE_WALGREENS_SUCCESS = "Photo{{#isPlural}}s{{/isPlural}} sent to Walgreens.",
  SHARE_MESSAGE_WALGREENS_ERROR = "Failed sending to Walgreens. Please try again.",
  SHARE_GROUP_PHOTOPAGE_DATE_FORMAT = "MMM d, yyyy",
  SHARE_PHOTO_PHOTOPAGE_DATE_FORMAT = "MMM d yyyy, h:mm TT",
  SHARE_TWITTER_MAX_CHARCOUNT = 116,
  SHARE_MAIL_MAX_RECIPIENTS = 100,
  SHARE_PHOTOPAGE_MAX_PHOTOS =
    3E3,
  SHARE_MAIL_MESSAGE_ABOUT = "<a href='http://help.everpix.com/web.html?page=photomail' target='_blank'>Learn more about Photo Mail</a>",
  SHARE_WALGREENS_PENDING_MESSAGE = "Sending photos to Walgreens.com&hellip;",
  DEFAULT_GROUPNAME = "group",
  DEFAULT_ITEMNAME = "item",
  DEFAULT_ITEMSNAME = "items",
  CONTEXT_TITLE = "Photos",
  CONTEXT_GROUPNAME = "group",
  CONTEXT_ITEMNAME = "photo",
  CONTEXT_ITEMSNAME = "photos",
  CONTEXT_FETCH_MESSAGE_ERROR = "Failed loading photos for this {{groupName}}.",
  CONTEXT_UPDATE_MESSAGE = "This {{groupName}} has updates.",
  CONTEXT_DOWNLOAD_MESSAGE_BUSY = "Preparing photos for download&hellip;",
  CONTEXT_DOWNLOAD_MESSAGE_SUCCESS = "We'll email you a link when your photos are ready.",
  CONTEXT_DOWNLOAD_MESSAGE_ERROR = "Failed preparing these photos for download. Please try again.",
  CONTEXT_HIDE_MESSAGE_BUSY = "Hiding {{groupName}}&hellip;",
  CONTEXT_HIDE_MESSAGE_ERROR = "Couldn't hide this {{groupName}}. Please try again.",
  CONTEXT_UNHIDE_MESSAGE_BUSY = "Unhiding {{groupName}}&hellip;",
  CONTEXT_UNHIDE_MESSAGE_ERROR = "Couldn't unhide this {{groupName}}. Please try again.",
  CONTEXT_DELETE_MESSAGE_SUCCESS = 'Deleted "{{{title}}}".',
  CONTEXT_DELETE_MESSAGE_ERROR = "Failed deleting this {{groupName}}. Please try again.",
  CONTEXT_EDITTIME_MESSAGE_SUCCESS = "Edited photo timestamps.",
  CONTEXT_EDITTIME_MESSAGE_ERROR = "Failed editing photo timestamps. Please try again.",
  CONTEXT_EDITTIME_DATE_FORMAT = "MMM dd yyyy",
  CONTEXT_EDITTIME_TIME_FORMAT = "h:mm TT",
  MOMENT_GROUPNAME = "moment",
  MOMENT_PREVIEW_DATE_FORMAT = "MMM d",
  MOMENT_TITLE_DATE_FORMAT = "MMMM dS, yyyy",
  MOMENT_SHARE_FACEBOOK_TITLE = "My Photos from {{date}}",
  MOMENT_SHARE_PHOTOMAIL_TITLE = "Photos from {{date}}",
  MOMENT_SHARE_PHOTOPAGE_TITLE = "{{date}}",
  MOMENT_TIMEOFDAY_DEFINITONS = {
    late_night: "Late Night",
    early_morning: "Early Morning",
    afternoon: "Afternoon",
    early_evening: "Early Evening",
    evening: "Evening",
    midday: "Midday",
    morning: "Morning",
    night: "Night"
  }, MOMENT_TIMEOFDAY_TIME_FORMAT = "htt",
  MOMENT_JUMPTO_MESSAGE_PENDING = "Loading moment&hellip;",
  MOMENT_JUMPTO_MESSAGE_ERROR = "Couldn't find this moment.",
  SET_GROUPNAME = "set",
  SET_DEFAULT_TITLE = "{{#source}}{{{source}}} - {{/source}}{{month}}",
  SET_PREVIEW_DATE_FORMAT = "MMMM dS",
  PHOTOMAIL_GROUPNAME = "Photo Mail",
  PHOTOMAIL_PREVIEW_DATE_FORMAT = "MMM dS",
  PHOTOMAIL_SENT_DATE_FORMAT = "MMMM dS, yyyy",
  HIGHLIGHTYEAR_GROUPNAME = "year",
  HIGHLIGHTYEAR_TITLE = "{{year}} Highlights",
  HIGHLIGHTYEAR_TITLE_NAVBAR = "<span class='navBar-views-title-truncation'>My Photos&nbsp;&nbsp;&#8226;&nbsp;&nbsp;</span>Highlights",
  HIGHLIGHTYEAR_FETCH_MESSAGE_BUSY = "Loading highlights&hellip;",
  HIGHLIGHTYEAR_FETCH_MESSAGE_ERROR = "Failed loading highlights for {{year}}.",
  HIGHLIGHTYEAR_PHOTO_PREVIEW_DATE_FORMAT =
    "MMM d, hh:mm TT",
  HIGHLIGHTMONTH_GROUPNAME = "month",
  HIGHLIGHTMONTH_TITLE = "{{month}} {{year}} Highlights",
  HIGHLIGHTMONTH_TITLE_FOOTNOTE = "{{month}} {{year}}",
  HIGHLIGHTMONTH_FETCH_MESSAGE_BUSY = "Loading highlights&hellip;",
  HIGHLIGHTMONTH_FETCH_MESSAGE_ERROR = "Failed loading highlights for {{month}}.",
  PHOTOPAGE_GROUPNAME = "Photo Page",
  PHOTOPAGE_UPDATE_MESSAGE_SUCCESS = "Successfully updated Photo Page.",
  PHOTOPAGE_UPDATE_MESSAGE_ERROR = "Failed updating this Photo Page. Please try again.",
  MOMENTYEAR_TITLE = "{{year}} Photos",
  MOMENTYEAR_TITLE_NAVBAR = "My Photos",
  MOMENTYEAR_GROUPNAME = "year",
  MOMENTYEAR_ITEMNAME = "moment",
  MOMENTYEAR_ITEMSNAME = "moments",
  MOMENTYEAR_FETCH_MESSAGE_BUSY = "Loading moments&hellip;",
  MOMENTYEAR_FETCH_MESSAGE_ERROR = "Failed loading moments for {{year}}.",
  MOMENTMONTH_TITLE = "{{month}} {{year}} Photos",
  MOMENTMONTH_TITLE_FOOTNOTE = "{{month}} {{year}}",
  MOMENTMONTH_GROUPNAME = "month",
  MOMENTMONTH_FETCH_MESSAGE_BUSY = "Loading moments&hellip;",
  MOMENTMONTH_FETCH_MESSAGE_ERROR = "Failed loading moments for {{month}}.",
  SOURCEYEAR_TITLE = "{{year}} Sources",
  SOURCEYEAR_TITLE_NAVBAR = "<span class='navBar-views-title-truncation'>My Photos&nbsp;&nbsp;&#8226;&nbsp;&nbsp;</span>{{sourceTitle}}",
  SOURCEYEAR_EMPTY_TITLE_NAVBAR = "My Photos",
  SOURCEYEAR_GROUPNAME = "year",
  SOURCEYEAR_ITEMNAME = "set",
  SOURCEYEAR_ITEMSNAME = "sets",
  SOURCEYEAR_FETCH_MESSAGE_BUSY = "Loading sets&hellip;",
  SOURCEYEAR_FETCH_MESSAGE_ERROR = "Failed loading sets for {{year}}.",
  SOURCEMONTH_TITLE = "{{month}} {{year}} Sources",
  SOURCEMONTH_TITLE_FOOTNOTE = "{{month}} {{year}}",
  SOURCEMONTH_GROUPNAME = "month",
  SOURCEMONTH_FETCH_MESSAGE_BUSY = "Loading sets&hellip;",
  SOURCEMONTH_FETCH_MESSAGE_ERROR = "Failed loading sets for {{month}}.",
  PHOTOMAILS_TITLE = "Photo Mail",
  PHOTOMAILS_GROUPNAME = "inbox",
  PHOTOMAILS_ITEMNAME = "Photo Mail",
  PHOTOMAILS_ITEMSNAME = "Photo Mail",
  PHOTOMAILS_FETCH_MESSAGE_BUSY = "Loading Photo Mail&hellip;",
  PHOTOMAILS_FETCH_MESSAGE_ERROR = "Failed loading Photo Mail.",
  SENTMAILS_TITLE = "Sent Photo Mail",
  SENTMAILS_GROUPNAME = "outbox",
  SENTMAILS_ITEMNAME = "Photo Mail",
  SENTMAILS_ITEMSNAME =
    "Photo Mail",
  SENTMAILS_FETCH_MESSAGE_BUSY = "Loading Photo Mail&hellip;",
  SENTMAILS_FETCH_MESSAGE_ERROR = "Failed loading Photo Mail.",
  PHOTOPAGES_TITLE = "Photo Pages",
  PHOTOPAGES_GROUPNAME = "Photo Pages",
  PHOTOPAGES_ITEMNAME = "Photo Page",
  PHOTOPAGES_ITEMSNAME = "Photo Pages",
  PHOTOPAGES_FETCH_MESSAGE_BUSY = "Loading Photo Pages&hellip;",
  PHOTOPAGES_FETCH_MESSAGE_ERROR = "Failed loading Photo Pages.",
  PHOTOPAGES_UPDATE_MESSAGE = "This view has updates.",
  VIEW_TITLE = !1,
  VIEW_FETCH_THRESHOLD = 500,
  VIEW_FETCH_MESSAGE_BUSY = "Loading {{itemsName}}&hellip;",
  VIEW_FETCH_MESSAGE_ERROR = "Failed loading {{itemsName}}.",
  VIEW_UPDATE_MESSAGE_DEFAULT = "Your collection has updates.",
  VIEW_UPDATE_MESSAGE_FETCHER = "This {{groupName}} has updates.",
  VIEW_ACTIONALERT_LABEL_SELECT = "Select",
  MONTHSVIEW_GRID_TITLE = "{{month}} {{year}}",
  HOMEVIEW_TITLE = "Home",
  FLASHBACK_TITLE = "Flashback",
  FLASHBACK_GRID_SUBTITLE = "{{dayOfWeek}}{{#timeOfDay}} {{timeOfDay}}{{/timeOfDay}}",
  FLASHBACK_DATE_FORMAT = "MMMM dS, yyyy",
  FLASHBACK_SHUFFLE_FETCH_MESSAGE_BUSY = "Shuffling photos&hellip;",
  FLASHBACK_SHUFFLE_FETCH_MESSAGE_ERROR =
    "Couldn't shuffle photos.",
  FLASHBACK_TODAY_DATE_FORMAT = "MMMM dS",
  FLASHBACK_TODAY_FETCH_MESSAGE_BUSY = "Selecting photos from today's date&hellip;",
  FLASHBACK_TODAY_FETCH_MESSAGE_ERROR = "Couldn't find photos from today's date.",
  FLASHBACK_TODAY_SHARE_TITLE = "Photos from {{timeAgo}}",
  PURGEVIEW_TITLE = "Purge Photos",
  PURGEVIEW_FETCH_MESSAGE_BUSY = "Loading photos&hellip;",
  PURGEVIEW_FETCH_MESSAGE_ERROR = "Failed loading photos.",
  PURGEVIEW_INSTRUCTIONS = "Are you sure you want to delete these photos?",
  ORPHANPHOTOSVIEW_TITLE =
    "Orphan Photos",
  ORPHANPHOTOSVIEW_TITLE_NAVBAR = "<span class='navBar-views-title-truncation'>Orphan Photos&nbsp;&nbsp;&#8226;&nbsp;&nbsp;</span>{{sourceTitle}}",
  ORPHANPHOTOSVIEW_FETCH_MESSAGE_BUSY = "Loading orphan photos&hellip;",
  ORPHANPHOTOSVIEW_FETCH_MESSAGE_ERROR = "Failed loading orphan photos.",
  LATESTPHOTOSVIEW_TITLE = "Most Recent Photos",
  LATESTPHOTOSVIEW_FETCH_MESSAGE_BUSY = "Loading most recent photos&hellip;",
  LATESTPHOTOSVIEW_FETCH_MESSAGE_ERROR = "Failed loading most recent photos.",
  UNDATEDPHOTOSVIEW_TITLE =
    "Undated Photos",
  UNDATEDPHOTOSVIEW_FETCH_MESSAGE_BUSY = "Loading undated photos&hellip;",
  UNDATEDPHOTOSVIEW_FETCH_MESSAGE_ERROR = "Failed loading undated photos.",
  MODIFIEDPHOTOSVIEW_TITLE = "Latest Modified Photos",
  MODIFIEDPHOTOSVIEW_FETCH_MESSAGE_BUSY = "Loading latest modified photos&hellip;",
  MODIFIEDPHOTOSVIEW_FETCH_MESSAGE_ERROR = "Failed loading latest modified photos.",
  SEMANTICVIEW_TITLE = "Semantic Tags",
  SELECTIONVIEW_TITLE = "Select Photos",
  SAMPLER_SEEMORE_TITLE = "See More",
  SAMPLER_FETCH_MESSAGE_BUSY = "Loading photos&hellip;",
  SAMPLER_FETCH_MESSAGE_ERROR = "Failed loading photos.",
  MOMENTSSAMPLER_TITLE = "Recent Photos",
  MOMENTSSAMPLER_SEEMORE_TITLE = "My Photos",
  MOMENTSSAMPLER_PREVIEW_DATE_FORMAT = "MMM d, yyyy",
  MOMENTSSAMPLER_FETCH_MESSAGE_BUSY = "Loading photos&hellip;",
  MOMENTSSAMPLER_FETCH_MESSAGE_ERROR = "Failed loading recent photos.",
  FLASHBACKSAMPLER_NOTODAY_TITLE = "You have no photos from today in history",
  FLASHBACKSAMPLER_NOTODAY_BODY = "But here are some other photos you may like",
  FLASHBACKSAMPLER_SHUFFLE_TITLE = "Shuffled Photos",
  FLASHBACKSAMPLER_SHUFFLE_BODY = "Here are some other photos you may like",
  FETCH_LIMIT_CONTEXTS = 50,
  FETCH_LIMIT_SOURCES = 300,
  FETCH_LIMIT_PHOTOS = 50,
  FETCH_LIMIT_PHOTOS_AGGREGATE = 100,
  FETCH_LIMIT_LATESTMOMENTS = 18,
  FETCH_LIMIT_SIMILAR = 50,
  FETCH_LIMIT_SHUFFLE = 20,
  FETCH_LIMIT_FLASHBACK_SINGLE = 12,
  FETCH_LIMIT_FLASHBACK_DOUBLE = 24,
  FETCH_LIMIT_TODAY = 20,
  FETCH_LIMIT_SEMANTICVIEW = 50,
  FETCH_LIMIT_PHOTOPAGES = 250,
  FETCH_LIMIT_NEARBY = 7,
  LANDING_MESSAGE_AUTHTOKEN_EXPIRED = "Your session has expired. Please sign in again.",
  LANDING_MESSAGE_UNSUPPORTED =
    "Sorry, your browser is not supported by Everpix. <a href='#unsupported'>Learn More</a>",
  LANDING_MESSAGE_NOCOOKIES = "Please enable cookies on your browser and reload the page.",
  LANDING_MESSAGE_API_ERROR = "Sorry, Everpix is currently offline. Please come back in a little bit.",
  LANDING_MESSAGE_SIGNIN_TO_CONTINUE = "Please sign in to continue.",
  LANDING_MESSAGE_ACCOUNT_EXISTS = "An account with that email address already exists. Please sign in below.",
  LANDING_MESSAGE_INVALID_LOGIN = "Unknown email or invalid password. <a href='#reset-password'>Forgot your password?</a>",
  LANDING_MESSAGE_UNCONFIRMED_ACCOUNT = "This account hasn't been confirmed yet. Please check your email for a verification link.",
  LANDING_CAMERA_INTERVAL = 4400,
  LANDING_QUOTE_INTERVAL = 1E4,
  PAGE_TITLE_TEMPLATE = "Everpix{{#viewTitle}} - {{{viewTitle}}}{{/viewTitle}}",
  DEFAULT_LAYOUTSIZE = "standard",
  DEFAULT_COLUMNS = 12,
  PHOTOPAGE_FETCH_MESSAGE_BUSY = "Loading&hellip;",
  PHOTOPAGE_FETCH_MESSAGE_ERROR = "Failed loading photos.",
  PHOTOPAGE_TITLE_DATE_FORMAT = "MMMM dS, yyyy",
  PHOTOPAGE_DOWNLOAD_SUCCESS = "Okay, we'll send you an email as soon as {{#isPlural}}these photos are{{/isPlural}}{{^isPlural}}this photo is{{/isPlural}} packaged up and ready.",
  PHOTOPAGE_COPY_EXISTING_SUCCESS = "Okay, we'll send you a Photo Mail with {{#isPlural}}these photos{{/isPlural}}{{^isPlural}}this photo{{/isPlural}}.",
  PHOTOPAGE_COPY_NEW_SUCCESS = "<strong>Check your inbox!</strong> We'll send you an email with a link to create your Everpix account.",
  WELCOME_MESSAGE_FINALIZING = "Completing Setup&hellip;",
  WELCOME_DOWNLOAD_CHECKLOOP_INTERVAL = 3E3,
  WELCOME_DOWNLOAD_CHECKLOOP_COUNT = 100,
  WELCOME_DOWNLOAD_CHECKLOOP_FAILS = 3,
  VERIFY_EMAIL_MESSAGE_LOADING = "Verifying&hellip;",
  RESET_MESSAGE_LOADING =
    "Authenticating&hellip;",
  RESET_MESSAGE_INVALID_EMAIL = "Unknown email address.",
  ADD_EMAIL_MESSAGE_LOADING = "Authenticating&hellip;",
  SUPPORT_MESSAGE_ZENDESK_LOGIN = "Signing in&hellip;",
  SUPPORT_MESSAGE_ZENDESK_ERROR = "Could not log in to support page. Please try again.",
  UNSUBSCRIBE_MESSAGE_LOADING = "Authenticating&hellip;",
  COUPON_MESSAGE_LOADING = "Validating code&hellip;",
  SUBSCRIBE_PERIOD_YEARLY = "yearly",
  SUBSCRIBE_PERIOD_MONTHLY = "monthly",
  PHOTODUMP_MESSAGE_LOADING = "Retrieving photo details&hellip;",
  PHOTODUMP_DATE_FORMAT =
    "MMM d yyyy, h:mm TT 'UTC'",
  NAV_GUIDE_DESCRIPTIONS = {
    home: "Recent photos and daily Flashbacks at a glance",
    "my-photos": "Your Everpix photo collection",
    moments: "Organized into moments by date and time",
    highlights: "Shortcut to your memories",
    email: "Photo attachments in your Gmail inbox",
    instagram: "All Instagram photos",
    facebook: "Albums and tagged photos with you",
    flickr: "Photos in Flickr sets",
    picasa: "Photos from Picasa Albums",
    ios: "Photos in iOS camera roll",
    lightroom: "Photos organized by Lightroom collections",
    iphoto: "Photos organized by iPhoto events",
    aperture: "Photos organized by Aperture projects",
    "mac-folders": "Photos organized by folders on your Mac",
    "windows-folders": "Photos organized by folders on your PC",
    photostream: "Photos from iCloud Photo Stream",
    photobooth: "Photos taken with Photo Booth",
    cameras: "Photos synced from digital cameras",
    web: "Photos uploaded from the website",
    messages: "Photos received in iOS Messages",
    android: "Photos taken with your Android camera",
    flashback: "Daily dose of memories or explore photos by content",
    photomails: "Photos that you've received from other Everpix users",
    photopages: "All the Photo Pages you've created and shared",
    preferences: "Account settings, email notifications, billing, and statistics",
    connections: "Set up web connections and get Everpix apps",
    processing: "Your collection is being updated"
  }, NAV_GUIDE_TIMEOUT = 400,
  PHOTOPAGELIST_COUNT = "{{count}} photo page{{#isPlural}}s{{/isPlural}} shared",
  PHOTOPAGELIST_DATE_FORMAT = "MMM d, yyyy",
  PHOTOPAGELIST_MESSAGE_LIST_ERROR = "Failed retrieving photo pages.",
  PHOTOPAGELIST_MESSAGE_DELETE_ERROR = "Failed deleting photo page.",
  SOURCE_DATA_EXPIRATION = 9E4,
  SOURCE_MESSAGE_TIMESTAMP_FORMAT = "MMM d, yyyy",
  SOURCE_MESSAGE_LIST_ERROR = "Could not retrieve your sources.",
  SOURCE_MESSAGE_DELETE_SUCCESS = "Deleted photos from {{name}}.",
  SOURCE_MESSAGE_DELETE_ERROR = "Failed deleting photos from {{name}}.",
  SOURCE_MESSAGE_DELETE_PENDING = "There are currently photos being imported from {{name}}. You must disconnect this source from Everpix before deleting photos.",
  SOURCE_MESSAGE_PURGE_SUCCESS =
    "Purged photos from {{name}}.",
  SOURCE_MESSAGE_PURGE_ERROR = "Failed purging photos from {{name}}.",
  DEVICE_MESSAGE_LIST_ERROR = "Could not retrieve your devices.",
  DEVICE_MESSAGE_DISCONNECT_SUCCESS = "Disconnected {{name}}.",
  DEVICE_MESSAGE_DISCONNECT_ERROR = "Failed disconnecting {{name}}.",
  DEVICE_MESSAGE_DELETE_SUCCESS = "Deleted all photos from {{name}}.",
  DEVICE_MESSAGE_DELETE_ERROR = "Failed deleting photos from {{name}}.",
  DEVICE_MESSAGE_DELETE_PENDING = "There are currently photos being imported from {{name}}. You must disconnect this source from Everpix before deleting photos.",
  CONNECTION_MESSAGE_LIST_ERROR = "Could not retrieve your connections.",
  CONNECTION_MESSAGE_CONNECT_ERROR = "Failed to connect {{title}} account.",
  CONNECTION_MESSAGE_DISCONNECT_SUCCESS = "{{title}} has been disconnected.",
  CONNECTION_MESSAGE_DISCONNECT_ERROR = "Failed disconnecting {{title}}.",
  CONNECTION_MESSAGE_SYNC_SUCCESS = "{{title}} sync request sent.",
  CONNECTION_MESSAGE_SYNC_ERROR = "Failed requesting sync for {{title}}.",
  CONNECTION_LAST_SYNC_TEXT = "Synced {{timeAgo}}",
  USERINFO_MESSAGE_NAME_EDIT_SUCCESS = "Name updated successfully.",
  USERINFO_MESSAGE_EMAIL_ADD_SUCCESS = "Please check your inbox to confirm this email address.",
  USERINFO_MESSAGE_EMAIL_REMOVE_ERROR = "Could not remove email address.",
  USERINFO_MESSAGE_EMAIL_SETDEFAULT_SUCCESS = "Updated default email address.",
  USERINFO_MESSAGE_EMAIL_SETDEFAULT_ERROR = "Could not set default email address.",
  USERINFO_MESSAGE_PASSWORD_CHANGE_SUCCESS = "Password updated successfully.",
  USERINFO_MESSAGE_FLASHBACKEMAIL_NONSUBSCRIBER = "Sorry, you must be a subscriber to send Flashbacks to friends.",
  USERINFO_MESSAGE_FLASHBACKEMAIL_ADD_SUCCESS = "Flashbacks will now be forwarded to {{email}}.",
  USERINFO_MESSAGE_FLASHBACKEMAIL_REMOVE_ERROR = "Could not remove email address.",
  EXPIRATION_TIMESTAMP_FORMAT = "MMM d, yyyy",
  SUBSCRIPTION_MESSAGE_UPDATE_SUCCESS = "Your subscription has been updated.",
  SUBSCRIPTION_MESSAGE_CANCEL_SUCCESS = "Your subscription has been canceled.",
  SUBSCRIPTION_MESSAGE_LIST_ERROR = "Failed loading subscription details.",
  STATS_TIMESTAMP_FORMAT = "MMM d yyyy, h:mm TT",
  ACTIONALERT_LIFESPAN = 1E3,
  MONTHS = "January February March April May June July August September October November December".split(" "),
  TIME_UNITS = {
    second: {
      inMS: 1E3,
      singular: "second",
      plural: "seconds",
      "short": "sec"
    },
    minute: {
      inMS: 6E4,
      singular: "minute",
      plural: "minutes",
      "short": "min"
    },
    hour: {
      inMS: 36E5,
      singular: "hour",
      plural: "hours",
      "short": "hr"
    },
    day: {
      inMS: 864E5,
      singular: "day",
      plural: "days",
      "short": "day"
    },
    week: {
      inMS: 6048E5,
      singular: "week",
      plural: "weeks",
      "short": "wk"
    },
    month: {
      inMS: 2592E6,
      singular: "month",
      plural: "months",
      "short": "mon"
    },
    year: {
      inMS: 31536E6,
      singular: "year",
      plural: "years",
      "short": "yr"
    },
    century: {
      inMS: 31536E8,
      singular: "century",
      plural: "centuries",
      "short": "c"
    }
  }, SEMANTIC_TAGS = {
    food: {
      title: "Food",
      feedbackTitle: "Not a Food Photo?",
      allowInViews: ["semantic", "flashback"],
      isExperimental: !0
    },
    nature: {
      title: "Nature",
      feedbackTitle: "Not a Nature Photo?",
      allowInViews: ["semantic", "flashback", "home"]
    },
    city: {
      title: "City",
      feedbackTitle: "Not a City Photo?",
      allowInViews: ["semantic", "flashback", "home"]
    },
    people: {
      title: "People",
      feedbackTitle: "Not a People Photo?",
      allowInViews: ["semantic", "flashback", "home"]
    },
    animal: {
      title: "Animals",
      feedbackTitle: "Not an Animal Photo?",
      allowInViews: ["semantic"],
      isExperimental: !0
    },
    interior: {
      title: "Indoors",
      feedbackTitle: "Not an Indoor Photo?",
      allowInViews: ["semantic"]
    },
    wide: {
      title: "Subject Distance: {{value}}",
      allowInViews: []
    },
    medium: {
      title: "Subject Distance: {{value}}",
      allowInViews: []
    },
    close: {
      title: "Subject Distance: {{value}}",
      allowInViews: []
    },
    macro: {
      title: "Subject Distance: {{value}}",
      allowInViews: []
    }
  }, SEMANTIC_FETCH_MESSAGE_BUSY =
    "Finding {{tagTitle}} photos&hellip;",
  SEMANTIC_FETCH_MESSAGE_ERROR = "Couldn't find any {{tagTitle}} photos.",
  MAILINGLIST_MAP = {
    system: "System emails",
    everpix_newsletter: "Everpix newsletters",
    photo_mail_notifications: "Photo Mail notifications",
    promotions: "Everpix promotions",
    memories: "weekly Memory emails",
    memories_daily: "daily Memory emails",
    "default": "this mailing list"
  }, INVITE_LINK = "http://evrpx.co/invite?r={{email}}",
  BUILDS_BASE_URL = "https://d81t6dbiitr1r.cloudfront.net/",
  MAC_UPLOADER_URL = BUILDS_BASE_URL +
    "Everpix-Mac-Uploader.dmg",
  MAC_UPLOADER_SIGNUP_URL = BUILDS_BASE_URL + "Everpix-Mac-Uploader-1.4b1.dmg",
  WINDOWS_UPLOADER_URL = BUILDS_BASE_URL + "Everpix.application",
  WINDOWS_UPLOADER_EXE_URL = BUILDS_BASE_URL + "Everpix.exe",
  MAC_MEMORIES_URL = BUILDS_BASE_URL + "Everpix-Mac-Memories.dmg",
  COOKIE_AUTHTOKEN_NAME = "authToken",
  COOKIE_AUTHTOKEN_EXP = 365,
  COOKIE_SIGNIN_NAME = "justSignedIn",
  COOKIE_SIGNIN_EXP = 1,
  COOKIE_EMAIL_NAME = "email",
  COOKIE_EMAIL_EXP = 365,
  COOKIE_REMEMBER_NAME = "rememberMe",
  COOKIE_REMEMBER_EXP = 365,
  COOKIE_SAVEDEVENTS_NAME =
    "savedEvents",
  COOKIE_SAVEDEVENTS_EXP = 30,
  COOKIE_RETINAPERFWARNING_NAME = "retinaPerformanceWarning",
  COOKIE_SKIPWELCOME_NAME = "skipWelcome",
  COOKIE_PHOTOMAILABOUT_NAME = "hidePhotoMailAbout",
  COOKIE_NEWS_20130305 = "news20130305Notification",
  COOKIE_SEMANTICFEEDBACK_NAME = "feedbackEnabled",
  COOKIE_TODAYOVERRIDE_NAME = "todayDate",
  COOKIE_TODAYOVERRIDE_EXP = 7,
  COOKIE_SKIPADIEU_NAME = "skipAdieuMessage",
  COOKIE_SKIPADIEU_EXP = 365,
  INACTIVE_MAX_DURATION = 3E5,
  NAVBAR_HEIGHT = 51,
  STATEBAR_HEIGHT = 50,
  PHOTOGRID_COLUMN_WIDTH = 66,
  PHOTOGRID_COLUMN_GUTTER =
    12,
  API = function() {
    function f(a, d, l, g, e) {
      "string" === $.type(a) && (a = window.JSON.parse(a));
      "success" === d && 200 === a._statusCode ? g(c(a), 200) : !a || 401 !== a._statusCode || Page.path !== Page.all.main && Page.path !== Page.all.welcome ? a && 200 !== a._statusCode ? e(a._error || null, a._statusCode) : e(d, d) : (User.clearAuthToken(), window.location = Page.all.landing + "?" + $.param({
        message: LANDING_MESSAGE_AUTHTOKEN_EXPIRED,
        action: "signin",
        state: encodeURIComponent(window.location.hash.substr(1))
      }))
    }

    function c(a) {
      var c = ["_statusCode", "_error"],
        d = {};
      "object" === $.type(a) && $.each(a, function(a, e) {
        -1 === c.indexOf(a) && (d[a] = e)
      });
      return d
    }
    var d = Query.debug_api || !1,
      e = {};
    $.ajaxSetup({
      timeout: 3E4
    });
    PubHub.sub("request.complete", function(a, h, e) {
      var g = e,
        f;
      if (200 === g) {
        if (e = "success", f = c(h), "all" === d || "successes" === d) console.log("API success for " + a.resourceId + ": " + g), console.log("Request: " + JSON.stringify(a.data, null, "  ")), console.log("Response: " + JSON.stringify(h, null, "  "))
      } else if (200 !== g) {
        if (e = "error", f = h ? h._error : null, "all" === d || "errors" === d) "abort" ===
          h ? (console.log("API abort for " + a.resourceId + "."), console.log("Request: " + JSON.stringify(a.data, null, "  "))) : (console.log("API failure for " + a.resourceId + ": " + g), console.log("Request: " + JSON.stringify(a.data, null, "  ")), console.log("Response: " + JSON.stringify(h, null, "  ")))
      } else f = e, d && (console.log("API failure for " + a.resourceId + ": " + g), console.log("Request: " + JSON.stringify(a.data, null, "  ")), console.log("Response: " + JSON.stringify(h, null, "  ")));
      PubHub.pub("API/" + e, a.resourceId, a.data, g, f)
    });
    return {
      request: function(a, d, c, g) {
        var f = e[a],
          k;
        d = {
          resourceId: a,
          data: d || {}
        };
        if (f) {
          k = $.Deferred();
          $.isFunction(c) ? (d.success = function(b, a) {
            c(b, a);
            k.resolve(b, a)
          }, $.isFunction(g) ? d.error = function(b, a) {
            g(b, a);
            k.reject(b, a)
          } : d.error = function(b, a) {
            c(b, a);
            k.reject(b, a)
          }) : (d.success = function(b, a) {
            k.resolve(b, a)
          }, d.error = function(b, a) {
            k.reject(b, a)
          });
          if (f.includeAuthToken || "POST" === f.type && !1 !== f.includeAuthToken) d.data._authtoken = window.User ? User.getAuthToken() : void 0;
          return $.extend(k, amplify.request(d))
        }
        console.error("API request '" +
          a + "' is not registered");
        return $.Deferred().reject()
      },
      define: function(a, d, c, g) {
        if (e[a]) return console.error("API request '" + a + "' is already defined."), !1;
        g = $.extend(!0, {
          url: API_SERVER_URL + "v2/" + c,
          type: d,
          decoder: f,
          data: {
            _ajax: 1
          }
        }, g);
        amplify.request.define(a, "ajax", g);
        e[a] = g;
        return !0
      },
      verbose: function(a) {
        switch (a) {
          case "all":
          case "errors":
          case "successes":
            d = a;
            break;
          default:
            d = !0 === a ? "all" : !1
        }
        return d
      }
    }
  }();
PubHub.pub("API/ready");
var AppStatus = function(f) {
  function c(a, c) {
    a !== e && (-1 <= a && 1 >= a) && (e = a, PubHub.pub("AppStatus/update", e), e ? $("body").removeClass("offline") : ($("body").addClass("offline"), !1 !== c && d()))
  }

  function d() {
    var e = $.Deferred();
    $.support.cors ? (API.request("status", null, function(c, f) {
      clearTimeout(a);
      200 === f ? (h = 0, e.resolve()) : (h++, h < l.length ? setTimeout(function() {
        e.follow(d())
      }, l[h]) : e.reject())
    }), a = setTimeout(function() {
      c(0)
    }, 1E4)) : e.reject();
    return e
  }
  var e = -1,
    a = null,
    h = 0,
    l = [0, 3E3, 1E4];
  API.define("status", "GET",
    "status", {
      cache: !1,
      timeout: 5E3
    });
  PubHub.sub("API/success", function() {
    c(1)
  });
  PubHub.sub("API/error API/timeout", function(a, d, e) {
    e && 503 !== e && "error" !== e && "timeout" !== e || c(0)
  });
  return {
    get: function() {
      return e
    },
    isPending: function() {
      return -1 === e
    },
    isOffline: function() {
      return 0 === e
    },
    isOnline: function() {
      return 1 === e
    },
    set: c,
    check: d
  }
}(amplify),
  User = function() {
    function f(b) {
      g = b;
      Cookie.setLocal(COOKIE_AUTHTOKEN_NAME, b, COOKIE_AUTHTOKEN_EXP)
    }

    function c() {
      g = null;
      Cookie.clearLocal(COOKIE_AUTHTOKEN_NAME)
    }

    function d(b) {
      void 0 !==
        b && (m = !! b, PubHub.pub("User/setCollectionUpdating", m));
      return m
    }

    function e(b) {
      a && window.Crypto && (b = Crypto.MD5(b));
      return b
    }
    var a = !1,
      h = !1,
      l = $.Deferred(),
      g, m = !1,
      k = {};
    API.define("getUserInfo", "GET", "user_info", {
      includeAuthToken: !0
    });
    API.define("setUserInfo", "POST", "user_update");
    API.define("refreshUser", "POST", "user_refresh", {
      dataMap: function(b) {
        return $.extend({
          type: "web",
          timezone: (new XDate).toTimezoneOffsetString()
        }, b)
      }
    });
    API.define("invite", "POST", "user_invite", {
      includeAuthToken: !1
    });
    API.define("register",
      "POST", "user_create", {
        includeAuthToken: !1,
        dataMap: function(b) {
          return $.extend({}, b, {
            type: "web",
            timezone: (new XDate).toTimezoneOffsetString()
          })
        }
      });
    API.define("verify", "POST", "user_verify", {
      includeAuthToken: !1
    });
    API.define("login", "POST", "user_login", {
      includeAuthToken: !1,
      dataMap: function(b) {
        return $.extend({}, b, {
          type: "web",
          timezone: (new XDate).toTimezoneOffsetString()
        })
      }
    });
    API.define("logout", "POST", "user_logout");
    API.define("getNewPassword", "GET", "user_reauthenticate");
    API.define("resetPassword", "POST",
      "user_reauthenticate");
    API.define("confirmEmail", "POST", "user_add_email", {
      includeAuthToken: !1
    });
    API.define("notifyMe", "POST", "email_request_notification");
    API.define("deleteUser", "POST", "user_delete");
    PubHub.sub("API/success", function(b, a, c, e) {
      a = $.extend({}, e);
      200 === c && -1 < "getUserInfo setUserInfo refreshUser register verify login getNewPassword resetPassword".split(" ").indexOf(b) && (a.authtoken && (f(a.authtoken), delete a.authtoken), a.email && Cookie.setLocal(COOKIE_EMAIL_NAME, a.email, COOKIE_EMAIL_EXP),
        a.cookies && delete a.cookies, a.created && (k.created = new XDate(1E3 * a.created), delete a.created), void 0 !== a.updating && (d(a.updating), delete a.updating), $.extend(k, a, {
          _retrieved: $.now()
        }), PubHub.pub("User/updateInfo", k))
    });
    return {
      init: function() {
        var b;
        h || (h = !0, Cookie.getLocal(COOKIE_SIGNIN_NAME) ? (b = "getUserInfo", Cookie.clearLocal(COOKIE_SIGNIN_NAME)) : b = "refreshUser", l.follow(API.request(b, {
          includeUpdating: 1,
          checkNotifications: Page.path === Page.all.main ? 1 : void 0
        }).done(function() {
          $(window).on("focus", function() {
            $.now() -
              User.getInfo("_retrieved") > USER_REFRESH_INTERVAL && User.refresh(!0)
          })
        })));
        return l.promise()
      },
      ready: function(b) {
        b && b.promise ? b.follow(l) : $.isFunction(b) && l.done(b);
        return $.Deferred().follow(l)
      },
      isReady: function() {
        return "resolved" === l.state()
      },
      getInfo: function(b) {
        return b ? k[b] : $.isEmptyObject(k) ? !1 : $.extend({}, k)
      },
      setInfo: function(b, a) {
        var d = "firstName lastName email forceEmail mailingLists disableNewSnapshotsPhotoDownloads".split(" "),
          c = {};
        $.isPlainObject(b) ? ($.each(b, function(a, c) {
          -1 === d.indexOf(a) &&
            delete b[a]
        }), $.isEmptyObject(b) ? c = !1 : ($.isPlainObject(b.mailingLists) && (b.mailingLists = JSON.stringify(b.mailingLists)), c = b)) : -1 < d.indexOf(b) ? ("mailingLists" === b && $.isPlainObject(a) && (a = JSON.stringify(a)), c[b] = a) : c = !1;
        return c ? API.request("setUserInfo", c) : $.Deferred().reject("No valid parameters")
      },
      refresh: function(b) {
        return API.request("refreshUser", {
          includeUpdating: b ? 1 : void 0
        })
      },
      invite: function(b) {
        if (!$.isPlainObject(b) || !b.email)
          if ("string" === $.type(b)) b = {
            email: b
          };
          else return $.Deferred().reject("Missing an argument");
        return API.request("invite", b).done(function() {
          PubHub.pub("User/invite")
        })
      },
      register: function(b) {
        return $.isPlainObject(b) && b.firstName && b.lastName && b.email && b.password ? (b.password && (b.password = e(b.password)), API.request("register", b).done(function() {
          PubHub.pub("User/register")
        })) : $.Deferred().reject("Missing an argument")
      },
      verify: function(b) {
        return $.isPlainObject(b) && b.code && b.email ? API.request("verify", b).done(function() {
          PubHub.pub("User/verify")
        }) : $.Deferred().reject("Missing an argument")
      },
      login: function(email, password, c) {
        return email && password ? (email = {
          email: email,
          password: e(password),
          webLongSession: c ? 1 : 0
        }, API.request("login", email).done(function(email, password) {
          Cookie.setLocal(COOKIE_SIGNIN_NAME, 1, COOKIE_SIGNIN_EXP);
          PubHub.pub("User/login")
        })) : $.Deferred().reject()
      },
      logout: function() {
        var b = $.Deferred();
        Analytics.flushEvents().always(function() {
          b.follow(API.request("logout").done(function() {
            c();
            k = {};
            Page.isLogin || (window.location = Page.all.landing)
          }))
        });
        return b.promise()
      },
      getNewPassword: function(b) {
        return b ? API.request("getNewPassword", {
          email: b
        }).done(function() {
          PubHub.pub("User/getNewPassword")
        }) :
          $.Deferred().reject()
      },
      resetPassword: function(b) {
        return b ? API.request("resetPassword", {
          password: b
        }).done(function() {
          PubHub.pub("User/resetPassword")
        }) : $.Deferred().reject()
      },
      changePassword: function(b, a) {
        return b && a ? API.request("setUserInfo", {
          oldPassword: b,
          newPassword: a
        }) : $.Deferred().reject()
      },
      baleet: function(b, a) {
        var d, e = $.Deferred();
        b ? (d = {
          password: b
        }, a && (d.reason = a), API.request("deleteUser", d, function(b, a) {
          c();
          Cookie.clearLocal(COOKIE_EMAIL_NAME);
          k = {};
          PubHub.pub("User/delete");
          e.resolve();
          window.location =
            Page.all.landing
        }, function(b, a) {
          e.reject(b, a)
        })) : e.reject("No password provided");
        return e
      },
      getAuthToken: function() {
        return "fakeAuthToken"
        return g ? g : g = Cookie.getLocal("authToken")
      },
      setAuthToken: f,
      clearAuthToken: c,
      addEmail: function(b, a) {
        var c, d = $.Deferred();
        b ? (c = {
          addEmails: JSON.stringify([b])
        }, a && (c.forceEmail = a), d.follow(API.request("setUserInfo", c))) : d.reject("No email provided");
        return d
      },
      removeEmail: function(a) {
        var c = $.Deferred();
        a ? c.follow(API.request("setUserInfo", {
          removeEmails: JSON.stringify([a])
        })) : c.reject("No email provided");
        return c
      },
      addFlashbackEmail: function(a, c) {
        var d, e = $.Deferred();
        a ? (d = {
          addFlashbackEmails: JSON.stringify([a])
        }, c && (d.forceEmail = c), e.follow(API.request("setUserInfo", d))) : e.reject("No email provided");
        return e.promise()
      },
      removeFlashbackEmail: function(a) {
        var c = $.Deferred();
        a ? c.follow(API.request("setUserInfo", {
          removeFlashbackEmails: JSON.stringify([a])
        })) : c.reject("No email provided");
        return c.promise()
      },
      isCollectionUpdating: d,
      hasFeature: function(a) {
        return !!k.features && k.features[a]
      },
      requestNotification: function(a) {
        return API.request("notifyMe", {
          notificationId: a
        })
      }
    }
  }();
Initializer = function() {
  var f = {}, c = $.Deferred();
  f.ready = function(d) {
    d && d.promise ? d.follow(c) : $.isFunction(d) && c.done(d);
    return c.promise()
  };
  f.isReady = function() {
    return "resolved" === c.state()
  };
  f.on = function(d) {
    d.promise ? c.follow(d) : $.isFunction(d) ? c.follow(d()) : !0 === d && c.resolve()
  };
  return f
}();
var Analytics = function() {
  var f = {
    debug: Query.debug_analytics || !1,
    events: [],
    pauseDuration: 6E4,
    pauseTimeout: null,
    loopDuration: 3E5,
    loopTimeout: null,
    logOptimizelyEvent: function(c) {
      f.debug && console.log("ANALYTICS:OZLY_EVENT", c);
      window.optimizely.push(["trackEvent", c])
    },
    logGAEvent: function(c, d, e, a, h) {
      a = $.isNumeric(parseInt(a, 10)) ? parseInt(a, 10) : void 0;
      f.debug && console.log("ANALYTICS:GA_EVENT", c, d, e, a, h || void 0);
      window._gaq.push(["_trackEvent", c, d, e, a, h || void 0])
    },
    logEvent: function(c, d, e, a, f) {
      var l = this;
      c && (l.debug && console.log("ANALYTICS:EVENT", c, d, e, a), l.events.push({
        name: c,
        timestamp: f || (new XDate(!0)).getTime() / 1E3,
        string: _(d).isString() ? d : void 0,
        number: _(e).isNumber() ? e : void 0,
        parameters: a ? JSON.stringify(a) : void 0
      }), clearTimeout(l.pauseTimeout), l.pauseTimeout = setTimeout(function() {
        l.flushEvents()
      }, l.pauseDuration))
    },
    flushEvents: function() {
      var c = this,
        d;
      return c.events.length && User.getAuthToken() ? (d = c.events, c.events = [], API.request("trackEvent", {
        activities: JSON.stringify(d)
      }).always(function(e,
        a) {
        c.debug && console.log("ANALYTICS:FLUSH", d, e, a)
      }).fail(function(e, a) {
        500 <= a && (c.events = d.concat(c.events))
      })) : $.rejected
    },
    loopFlush: function() {
      var c = this;
      clearTimeout(c.loopTimeout);
      setTimeout(function() {
        c.flushEvents().always(function() {
          c.loopFlush()
        })
      }, c.loopDuration)
    }
  };
  window._gaq = window._gaq || [];
  window._gaq.push(["_setAccount", "UA-23684672-1"]);
  window.optimizely = window.optimizely || [];
  Initializer.ready(function() {
    window._gaq.push(["_trackPageview"]);
    Cookie.getLocal(COOKIE_SAVEDEVENTS_NAME) && (_(JSON.parse(Cookie.getLocal(COOKIE_SAVEDEVENTS_NAME))).each(function(c) {
        f.events.push(c)
      }),
      f.debug && console.log("ANALYTICS:RESTORE_FROM_COOKIES", f.events), Cookie.clearLocal(COOKIE_SAVEDEVENTS_NAME));
    User.ready(function() {
      f.flushEvents().always(function() {
        f.loopFlush()
      })
    });
    $(function() {
      $(window).on({
        "unload.analytics": function() {
          f.events.length && (Cookie.setLocal(COOKIE_SAVEDEVENTS_NAME, JSON.stringify(f.events), COOKIE_SAVEDEVENTS_EXP), f.debug && console.log("ANALYTICS:SAVE_TO_COOKIES", f.events))
        }
      })
    })
  });
  API.define("trackEvent", "POST", "activity_record");
  return f
}();
