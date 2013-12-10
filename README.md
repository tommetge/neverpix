Neverpix: Saving Everpix one user at a time
===========================================

Neverpix is a re-implementation of the Everpix API and service
that is designed to allow Everpix lovers to continue to use
the same beautiful interface after the service shuts down.

How do I use it?
================

Setting up Neverpix is pretty straightforward. You'll need to
install all dependencies with ruby's bundler, create a user,
add some photos, and run the server.

To do this on OS X, crack open Terminal.app and do the following:

1. Clone this repository
2. ```brew install leveldb```
3. ```cd neverpix```
4. ```bundle install```
5. ```ruby bin/create_user.rb [first name] [last name] [email]```
6. ```ruby bin/update_photos.rb /path/to/your/photos```
7. ```ruby neverpix.rb```

Under the hood
==============

Neverpix is a re-implementation of the Everpix infrastructure
using Ruby and the Sinatra micro-framework. It stores all data
in LevelDB, including cached thumbnails.

It can easily support tens of thousands of photos, though you
will notice that your database can grow quite large as more
thumbnails are generated and cached. With nearly all of my
13,000 photos cached, the database is about 500MB in size.

Questions?
==========

Create an issue, submit a pull request, or email me.
