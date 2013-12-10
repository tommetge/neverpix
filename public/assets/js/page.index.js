/* Copyright 2011-2013 33cube, Inc. All rights reserved. */
function Procrastination() {
  this.procrastinations || (this.procrastinations = {})
}
Procrastination.prototype.procrastinate = function(a, b, c, d) {
  var e = this,
    f;
  _(b).isArray() || (b = [b]);
  _(c).isArray() || (c = [c]);
  b = _(b).filter(function(b) {
    return _(b).isFunction()
  });
  e.procrastinations[a] ? (clearTimeout(e.procrastinations[a].timeout), delete e.procrastinations[a].timeout) : e.procrastinations[a] = $.extend({
    tasks: [],
    taskStrings: [],
    taskArgs: []
  }, $.Deferred());
  f = e.procrastinations[a];
  _(b).each(function(b) {
    var a = b.toString(),
      d = _(f.taskStrings).indexOf(a);
    0 > d ? (f.tasks.push(b), f.taskStrings.push(a), f.taskArgs.push(c)) :
      $.extend(f.taskArgs[d], c)
  });
  f.timeout = setTimeout(function() {
    function b() {
      var a;
      f.tasks.length ? (a = f.tasks.splice(0, 1)[0].apply(e, f.taskArgs.splice(0, 1)), f.taskStrings.splice(0, 1), _(a).isObject() && a.promise ? a.done(b).fail(function() {
        f.reject()
      }) : !1 === a && null === a ? f.reject() : b()) : f.resolve()
    }
    delete e.procrastinations[a];
    b()
  }, d || 0);
  return f.promise()
};
Procrastination.prototype.abortProcrastinatedTasks = function(a) {
  this.procrastinations[a] && (clearTimeout(this.procrastinations[a].timeout), delete this.procrastinations[a])
};

function RequestUtilities() {
  this.resources || (this.resources = {})
}
RequestUtilities.prototype.makeParams = function(a, b) {
  var c = this,
    d;
  if (c.resources[a]) return d = _({}).extend(c.resources[a].params, b), _(d).each(function(b, a) {
    _(b).isFunction() ? d[a] = b.call(c) : d[a] = b
  }), d;
  console.error("No such resource exists for this object:", a);
  return !1
};

function Strings() {
  this.strings || (this.strings = {})
}
Strings.prototype.makeString = function(a) {
  var b = this.strings[a],
    c = _(arguments).tail(1);
  return _(b).isFunction() ? b.apply(this, c) : b
};

function Subscriptions() {
  this.subs || (this.subs = {})
}
Subscriptions.prototype.subscribe = function(a, b, c, d) {
  if (this.subs[a]) return this.subs[a].topic === b && this.subs[a].callback.toString() === c.toString() || console.error("Subscription overwrites previous callback:", c), !1;
  this.subs[a] = {
    topic: b,
    callback: c
  };
  PubHub.sub(b, c, d || 10);
  return !0
};
Subscriptions.prototype.unsubscribe = function() {
  var a = this;
  _(arguments).each(function(b) {
    a.subs[b] && (PubHub.drubSub(a.subs[b].topic, a.subs[b].callback), delete a.subs[b])
  })
};
Subscriptions.prototype.unsubscribeAll = function() {
  this.unsubscribe(_(this.subs).keys())
};

function TaskQueue() {
  this.taskQueues || (this.taskQueues = {})
}
TaskQueue.prototype.queueTask = function(a, b, c) {
  var d = this.taskQueues[a];
  d || (this.taskQueues[a] = d = {
    queue: [],
    tasks: {}
  });
  if (!b) b = "task-" + Math.floor(1E8 * Math.random()).toString(16);
  else if (d.tasks[b]) return console.error("ID conflict with another task:", b, d.tasks[b]), !1;
  d.tasks[b] = c;
  d.queue.push(c);
  return b
};
TaskQueue.prototype.dequeueTask = function(a, b) {
  var c = this.taskQueues[a];
  return c && b && c.tasks[b] ? (c.queue.splice(c.queue.indexOf(c.tasks[b]), 1), delete c.tasks[b], !0) : !1
};
TaskQueue.prototype.executeAllTasks = function(a) {
  var b = this,
    c = b.taskQueues[a];
  return c ? (c = _(c.queue).map(function(a) {
    return a.call(b)
  }), delete b.taskQueues[a], $.when.apply(b, c)) : $.Deferred().reject()
};
TaskQueue.prototype.dequeueAllTasks = function(a) {
  return this.taskQueues[a] ? (delete this.taskQueues[a], !0) : !1
};

function Templates() {
  this.templates || (this.templates = {});
  this.$els || (this.$els = {});
  this.buildDfds || (this.buildDfds = {})
}
Templates.prototype.buildElement = function(a, b, c) {
  var d = this,
    e = $.Deferred(),
    f, g = {};
  if (d.templates[a]) {
    if (!d.buildDfds[a] || c) d.buildDfds[a] = $.Deferred(), _(g).extend(d.templates[a].options, b), _(g).each(function(b, a) {
      _(b).isFunction() ? g[a] = b.call(d) : g[a] = b
    }), $(function() {
      f = d.templates[a].selector;
      _(f).isFunction() && (f = f.call(d));
      d.$els[a] = d["$" + a] = $(f).mustache(g);
      d.buildDfds[a].resolve(d.$els[a])
    });
    e.follow(d.buildDfds[a])
  } else e.resolve(!1);
  return e.promise()
};
Templates.prototype.destroyElement = function(a) {
  return this.$els[a] ? (this.$els[a].empty().remove(), delete this.$els[a], delete this["$" + a], delete this.buildDfds[a], !0) : !1
};
Templates.prototype.destroyAllElements = function() {
  var a = this;
  _(a.$els).each(function(b, c) {
    a.destroyElement(c)
  })
};

function Tracking() {
  this.analytics || (this.sessions = [])
}
Tracking.prototype.startTrackingSession = function() {
  this.sessions.length && !_(this.sessions).last().stop && this.stopTrackingSession();
  this.sessions.push({
    start: $.now(),
    stop: void 0,
    duration: void 0,
    isLogged: !1
  })
};
Tracking.prototype.stopTrackingSession = function(a) {
  var b = _(this.sessions).last();
  b.stop || (b.stop = a || $.now(), b.duration = b.stop - b.start, 0 > b.duration && (b.duration = 0))
};

function ViewControls() {
  var a = this;
  $.extend(!0, a.templates, {
    monthControls: {
      selector: "#template-view-controls-month",
      options: {
        months: _(MONTHS).chain().filter(function(b, c) {
          return !a.viewOf || a.viewOf.year !== XDate.today().getFullYear() || c <= XDate.today().getMonth()
        }).map(function(b, a) {
          return {
            name: b,
            number: padStringToLength(a + 1, 2, "0", !0)
          }
        }).value()
      }
    },
    sortOrderControls: {
      selector: "#template-view-controls-sortOrder",
      options: {
        sortAsc: function() {
          return "desc" !== Preferences.get("sort_order")
        }
      }
    }
  })
}
ViewControls.prototype.buildViewControls = function() {
  var a = this;
  a.$view && (a.buildElement("monthControls").done(function(b) {
    var c, d, e;
    b.appendTo(a.$view.find(".view-controls"));
    c = b.find(".view-monthMenu");
    d = c.find(".months-list");
    d.scrollPane();
    e = c.on({
      "afterOpen.bubble": function() {
        d.scrollPane().activate()
      },
      "beforeClose.bubble": function() {
        d.scrollPane().deactivate()
      }
    }).bubble({
      id: "view-monthMenu-" + a.id
    });
    b.find(".view-controls-button").on({
      mousedown: function() {
        return !e.isOpen
      },
      click: function() {
        e.isOpen ?
          e.close() : e.open();
        return !1
      }
    })
  }), a.buildElement("sortOrderControls").done(function(b) {
    var c;
    b.appendTo(a.$view.find(".view-controls"));
    c = b.find(".view-sortOrderMenu").bubble({
      id: "view-sortOrderMenu-" + a.id
    });
    b.find(".view-controls-button").on({
      mousedown: function() {
        return !c.isOpen
      },
      click: function() {
        c.isOpen ? c.close() : c.open();
        return !1
      }
    });
    b.find(".bubbleMenu-button").on("click", function() {
      var a = $(this),
        c = a.attr("data-order");
      a.hasClass("selected") || (Preferences.set("sort_order", c), b.find(".bubbleMenu-button.selected").removeClass("selected"),
        a.addClass("selected"))
    })
  }))
};

function Photo(a, b, c) {
  var d = this;
  $.extend(d, {
    id: a,
    resources: {
      details: {
        resource: "photoDetails",
        params: {
          pid: a,
          nearbyPhotosLimit: FETCH_LIMIT_NEARBY,
          nearbyPhotos: "photos"
        }
      },
      edit: {
        resource: "photoEdit",
        params: {
          pid: a
        }
      },
      baleet: {
        resource: "photoDelete",
        params: {
          pid: a
        }
      },
      dumpID: {
        resource: "photoDumpID",
        params: {
          pid: a
        }
      },
      semanticFeedback: {
        resource: "semanticFeedback",
        params: {
          pid: a
        }
      }
    }
  }, c, {
    isDestructed: !1,
    requests: {},
    largeSrcs: {}
  });
  d.thumbnailID = b.tid;
  d.unixTimestamp = b.timestamp ? b.timestamp : null;
  d.timestamp = b.timestamp ?
    new XDate(1E3 * b.timestamp, !0) : null;
  d.width = b.width;
  d.height = b.height;
  d.aspectRatio = d.width / d.height;
  d.poi = {
    x: b.poiX,
    y: b.poiY
  };
  d.visibility = b.visibility || 0;
  d.orientation = b.orientation || 1;
  d.semanticInfo = b.info || void 0;
  Procrastination.call(d);
  RequestUtilities.call(d);
  _.defer(function() {
    PubHub.pub("Item/construct", d)
  })
}
$.extend(!0, Photo.prototype, Procrastination.prototype, RequestUtilities.prototype);
Photo.prototype.getDetails = function() {
  var a = this;
  a.detailsDfd && "rejected" !== a.detailsDfd.state() || (a.detailsDfd = $.Deferred(), a.requests.details = API.request(a.resources.details.resource, a.makeParams("details")).always(function() {
    delete a.requests.details
  }).done(function(b) {
    var c = $.Deferred();
    a.originalTimestamp = b.originalTimestamp ? new XDate(1E3 * b.originalTimestamp, !0) : null;
    a.orientation = b.orientation;
    a.details = $.extend({}, b);
    a.details.captureDevice && (a.details.captureDevice.make && a.details.captureDevice.model ?
      0 <= a.details.captureDevice.make.indexOf(a.details.captureDevice.model.split(" ")[0]) ? a.details.captureDevice.camera = a.details.captureDevice.model : a.details.captureDevice.camera = a.details.captureDevice.make + " " + a.details.captureDevice.model : a.details.captureDevice.camera = a.details.captureDevice.model);
    a.details.displaySources = _(a.details.sources).chain().map(function(b) {
      return Sources.getMetaDetails(b)
    }).compact().value();
    a.details.nearbyPhotosDistancesMeters && (a.details.nearbyPhotos = _(a.details.nearbyPhotosDistancesMeters).map(function(b,
      a) {
      return {
        photo: Photos.get(b[0].pid) || new Photo(b[0].pid, b[0], {}),
        distance: b[1]
      }
    }));
    a.details.location ? (a.details.location.minimapURL = $.mustache(PHOTOVIEWER_MINIMAP_URL, a.details.location), a.details.location.mapLink = $.mustache(PHOTOVIEWER_MAP_LINK, a.details.location), a.details.location.description = $.mustache(PHOTOVIEWER_LATLONG_DESCRIPTION, {
      latitude: Math.abs(a.details.location.latitude),
      longitude: Math.abs(a.details.location.longitude),
      latitudeRef: 1 < a.details.location.latitude ? "N" : "S",
      longitudeRef: 1 <
        a.details.location.longitude ? "E" : "W"
    }), Maps.getFriendlyLocation(a.details.location.latitude, a.details.location.longitude).always(function(b) {
      a.details.location.name = b || void 0;
      c.resolve()
    })) : c.resolve();
    $.when(c).always(function() {
      a.detailsDfd.resolve(a.details)
    })
  }).fail(function() {
    a.detailsDfd.reject()
  }));
  return a.detailsDfd.promise()
};
Photo.prototype.clearDetails = function() {
  this.detailsDfd && ("pending" === this.detailsDfd.state() ? (this.detailsDfd.reject(), this.requests.details && this.requests.details.abort()) : (delete this.detailsDfd, delete this.details))
};
Photo.prototype.loadLarge = function(a, b) {
  var c = this,
    d = $.Deferred(),
    e = Thumbnails.generateURL(c.thumbnailID, THUMBNAIL_FULL_SIZES[a]);
  $("<img/>", {
    load: function() {
      $(this).off("load error");
      d.resolve(e);
      if (!c.largeSrcs[a] || b) c.largeSrcs[a] = e, PubHub.pub("Photo/loadLarge", c, e)
    },
    error: function() {
      $(this).off("load error");
      d.reject()
    },
    src: e
  });
  return d.promise()
};
Photo.prototype.setVisibility = function(a, b) {
  function c() {
    d.visibility = a;
    PubHub.pub("Photo/set/visibility", d, a, g)
  }
  var d = this,
    e = $.Deferred(),
    f, g = d.visibility;
  d.visibility !== a ? b ? (c(), e.resolve()) : d.requests.visibility || (f = d.makeParams("edit", {
    visibility: a
  }), d.requests.visibility = API.request(d.resources.edit.resource, f).always(function() {
    delete d.requests.visibility
  }).done(c), e.follow(d.requests.visibility)) : e.resolve();
  return e.promise()
};
Photo.prototype.hide = function(a) {
  var b = this;
  return b.setVisibility(0, a).done(function() {
    PubHub.pub("Photo/hide", b)
  })
};
Photo.prototype.unhide = function(a) {
  var b = this;
  return b.setVisibility(1, a).done(function() {
    PubHub.pub("Photo/unhide", b)
  })
};
Photo.prototype.setOrientation = function(a) {
  var b = this,
    c = b.orientation;
  return a !== b.orientation ? (b.orientation = a, b.procrastinate("setOrientation", function() {
    var a = $.Deferred(),
      e;
    e = b.makeParams("edit", {
      orientation: b.orientation
    });
    API.request(b.resources.edit.resource, e).done(function(e) {
      b.width = e.width;
      b.height = e.height;
      b.aspectRatio = b.width / b.height;
      b.poi = {
        x: e.poiX,
        y: e.poiY
      };
      b.thumbnailID = e.tid;
      _(b.largeSrcs).each(function(a, c) {
        b.loadLarge(c, !0)
      });
      PubHub.pub("Photo/set/orientation", b, b.orientation,
        c);
      a.resolve(b.orientation, c)
    }).fail(function() {
      b.orientation = c;
      a.reject(c, c)
    });
    return a.promise()
  })) : $.Deferred().reject(c, c).promise()
};
Photo.prototype.rotateClockwise = function() {
  var a = PHOTO_ROTATION_SEQUENCE.indexOf(this.orientation);
  0 > a && (a = 1);
  PubHub.pub("Photo/rotate", this, "clockwise");
  return this.setOrientation(PHOTO_ROTATION_SEQUENCE[(a + 8 + 2) % 8])
};
Photo.prototype.rotateCounterClockwise = function() {
  var a = PHOTO_ROTATION_SEQUENCE.indexOf(this.orientation);
  0 > a && (a = 1);
  PubHub.pub("Photo/rotate", this, "counterclockwise");
  return this.setOrientation(PHOTO_ROTATION_SEQUENCE[(a + 8 - 2) % 8])
};
Photo.prototype.editTimestamp = function() {
  var a = this,
    b = new XDate,
    c = $.Deferred(),
    d = !1,
    e = !1,
    f;
  f = $("#template-photo-editTimestamp").mustache({
    nowDate: b.toString(PHOTO_EDITTIMESTAMP_DATE_FORMAT),
    nowTime: b.toString(PHOTO_EDITTIMESTAMP_TIME_FORMAT),
    date: (a.timestamp ? a.timestamp : b).toString(PHOTO_EDITTIMESTAMP_DATE_FORMAT),
    time: (a.timestamp ? a.timestamp : b).toString(PHOTO_EDITTIMESTAMP_TIME_FORMAT),
    originalTimestamp: a.originalTimestamp && a.originalTimestamp.getTime() !== a.timestamp.getTime() ? a.originalTimestamp.toString(PHOTO_EDITTIMESTAMP_FULL_FORMAT) : !1,
    thumbnailSrc: Thumbnails.generateURL(a.thumbnailID, THUMBNAIL_SIZE_TINY)
  });
  f.appendTo("body").on({
    "afterOpen.popover": function() {
      f.find("input, textarea").filter(function() {
        return "" === $(this).val()
      }).first().trigger("focus")
    },
    "beforeClose.popover": function(b) {
      b.userTriggered && c.reject()
    },
    "afterClose.popover": function() {
      f.popover().destruct()
    },
    "execute.asyncForm": function() {
      var b = new XDate($("#photo-editTimestamp\\/date").val() + " " + $("#photo-editTimestamp\\/time").val() + " Z", !0);
      d || b.valid() ? a.setTimestamp(d ?
        "reset" : b, !1, e).done(function() {
        c.resolve(b)
      }).fail(function(b, a) {
        412 === a ? (e = !0, f.asyncForm().unlock().always(function() {
          f.trigger({
            type: "validate",
            validationData: {
              result: !1,
              message: "This photo will fall outside of your account's time window and become inaccessible. Are you sure you wish to continue?"
            }
          })
        })) : f.asyncForm().unlock().always(function() {
          f.trigger({
            type: "validate",
            validationData: {
              result: !1,
              message: "Unexpected error, please try again. (code " + a + ")"
            }
          })
        })
      }) : f.asyncForm().unlock().always(function() {
        f.trigger({
          type: "validate",
          validationData: {
            result: !1,
            message: "Invalid date format"
          }
        })
      })
    }
  });
  $("#photo-editTimestamp\\/date #photo-editTimestamp\\/time").on("change", function() {
    d = !1
  });
  $("#photo-editTimestamp\\/original").on("click", function() {
    $("#photo-editTimestamp\\/date").val(a.originalTimestamp ? a.originalTimestamp.toString(PHOTO_EDITTIMESTAMP_DATE_FORMAT) : "");
    $("#photo-editTimestamp\\/time").val(a.originalTimestamp ? a.originalTimestamp.toString(PHOTO_EDITTIMESTAMP_TIME_FORMAT) : "");
    d = !0;
    return new MessageBar(PHOTO_EDITTIMESTAMP_MESSAGE_RESET, {
      extraClasses: "instructional",
      insertFunction: "appendTo",
      insertElement: f
    })
  });
  f.popover({
    isOpen: !0,
    closeButton: "back"
  });
  f.asyncForm();
  return c.done(function(b) {
    PubHub.pub("Photo/editTimestamp", a, d ? "reset" : b)
  }).promise()
};
Photo.prototype.setTimestamp = function(a, b, c) {
  function d(b, a) {
    b ? (e.timestamp = b, e.unixTimestamp = a || b.getTime() / 1E3) : (e.timestamp = null, e.unixTimestamp = null);
    PubHub.pub("Photo/set/timestamp", e, b, h)
  }
  var e = this,
    f = $.Deferred(),
    g = !1,
    h = e.timestamp;
  "reset" !== a && a instanceof XDate && (!a.valid() || e.timestamp instanceof XDate && e.timestamp.getTime() === a.getTime()) ? f.resolve() : ("reset" === a && (g = !0, a = e.originalTimestamp), b || !a ? (d(a), f.resolve()) : e.requests.timestamp ? f.follow(e.requests.timestamp) : (a = e.makeParams("edit", {
    timestamp: g ? "reset" : a.getTime() / 1E3,
    force: c ? 1 : 0
  }), e.requests.timestamp = f.follow(API.request(e.resources.edit.resource, a).always(function() {
    delete e.requests.timestamp
  }).done(function(b) {
    d(b.timestamp ? new XDate(1E3 * b.timestamp, !0) : null, b.timestamp)
  }))));
  return f.promise()
};
Photo.prototype.resetTimestamp = function(a) {
  return this.setTimestamp("reset", a)
};
Photo.prototype.showFullInfo = function() {
  var a = this,
    b;
  b = $("#template-photo-fullInfo").mustache({}).appendTo("body").on({
    "afterClose.popover": function() {
      $(this).popover().destruct()
    }
  });
  b.popover({
    fixedTop: 0.1,
    isOpen: !0
  });
  spinner = b.find(".spinner").spinner({
    showing: !0
  });
  a.requests.details = API.request("photoDetails", a.makeParams("details", {
    _debug: 1
  })).always(function() {
    delete a.requests.details
  }).done(function(a) {
    b.find("#photo-fullInfo\\/details").val(JSON.stringify(sortObject(a, !0), null, "  "))
  }).fail(function() {
    return new MessageBar(PHOTO_FULLINFO_ERROR, {
      extraClasses: "alert",
      insertFunction: "appendTo",
      insertElement: b
    })
  });
  a.requests.dumpID = API.request("photoDumpID", a.makeParams("dumpID")).always(function() {
    delete a.requests.dumpID
  }).done(function(a) {
    b.find("#photo-fullInfo\\/link").attr("href", Page.all.photoDump + "?id=" + a.token).on("click", function() {
      b.popover().close(!0)
    })
  }).fail(function() {
    return new MessageBar(PHOTO_DUMPID_ERROR, {
      extraClasses: "alert",
      insertFunction: "appendTo",
      insertElement: b
    })
  });
  return $.when(a.requests.details, a.requests.dumpID).always(function() {
    spinner.hide().always(function() {
      spinner.destruct()
    });
    b.find(".formField.hidden").removeClass("hidden")
  }).promise()
};
Photo.prototype.baleet = function(a) {
  function b() {
    return API.request(c.resources.baleet.resource, c.makeParams("baleet")).done(function() {
      d.popover().close();
      PubHub.pub("Photo/delete", c);
      c.destruct()
    })
  }
  var c = this,
    d, e = $.Deferred();
  a ? (c.requests.baleet || (c.requests.baleet = b()), e.follow(c.requests.baleet.always(function() {
    delete c.requests.baleet
  }))) : (d = $("#template-photo-deleteWarning").mustache({
    thumbnailSrc: Thumbnails.generateURL(c.thumbnailID, THUMBNAIL_SIZE_TINY)
  }).on({
    "beforeClose.popover": function(b) {
      b.userTriggered &&
        e.reject()
    },
    "afterClose.popover": function() {
      $(this).popover().destruct()
    },
    "execute.asyncForm": function() {
      e.follow(b())
    }
  }).appendTo("body"), d.popover({
    isOpen: !0,
    closeButton: "back"
  }), d.asyncForm(), d.find(".cancelLink").on("click", function() {
    d.popover().close(!0);
    e.reject()
  }));
  return e.promise()
};
Photo.prototype.destruct = function() {
  this.isDestructed = !0;
  PubHub.pub("Item/destruct", this);
  return $.resolved
};
Photo.prototype.download = function() {
  Downloader.get(Thumbnails.generateURL(this.thumbnailID, THUMBNAIL_SIZE_DOWNLOAD));
  PubHub.pub("Photo/download", this)
};
Photo.prototype.submitSemanticFeedback = function(a, b, c) {
  function d() {
    var d;
    c || SEMANTIC_TAGS[a] ? (d = $("#template-semanticFeedback-confirmation").mustache({
      title: SEMANTIC_TAGS[a] ? SEMANTIC_TAGS[a].feedbackTitle : a,
      tagName: SEMANTIC_TAGS[a] ? SEMANTIC_TAGS[a].title : a,
      thumbnailSrc: Thumbnails.generateURL(e.thumbnailID, THUMBNAIL_SIZE_TINY)
    }).on({
      "afterOpen.popover": function() {
        d.find("input:submit").trigger("focus")
      },
      "beforeClose.popover": function(b) {
        b.userTriggered && f.reject()
      },
      "afterClose.popover": function() {
        $(this).popover().destruct()
      },
      "execute.asyncForm": function() {
        var g = {};
        c ? g.string = a : (g.semanticTags = {}, g.semanticTags[a] = b, g.semanticTags = JSON.stringify(g.semanticTags));
        API.request(e.resources.semanticFeedback.resource, e.makeParams("semanticFeedback", g));
        d.popover().close();
        f.resolve()
      }
    }).appendTo("body"), d.popover({
      isOpen: !0,
      closeButton: "back"
    }), d.asyncForm(), d.find(".cancelLink").on("click", function() {
      d.popover().close(!0);
      f.reject()
    })) : f.reject()
  }
  var e = this,
    f = $.Deferred(),
    g;
  b = _(b).isNumber() ? b : 0;
  Cookie.getRemote(COOKIE_SEMANTICFEEDBACK_NAME) ?
    d() : (g = $("#template-semanticFeedback-explanation").mustache().on({
      "beforeClose.popover": function(b) {
        b.userTriggered && f.reject()
      },
      "afterClose.popover": function() {
        $(this).popover().destruct()
      },
      "execute.asyncForm": function() {
        Cookie.setRemote(COOKIE_SEMANTICFEEDBACK_NAME, 1);
        f.follow(d())
      }
    }).appendTo("body"), g.popover({
      isOpen: !0
    }), g.asyncForm(), g.find(".cancelLink").on("click", function() {
      g.popover().close(!0);
      f.reject()
    }));
  return f.promise()
};

function WebConnection(a, b, c) {
  var d = this;
  $.extend(!0, d, {
    title: a,
    resources: {
      info: {
        resource: a + "Info"
      },
      connect: {
        resource: a + "Connect"
      },
      complete: {
        resource: a + "Complete"
      },
      disconnect: {
        resource: a + "Disconnect"
      },
      sync: {
        resource: a + "Sync"
      }
    }
  }, b, {
    service: a,
    isConnected: !1,
    syncPhotos: !1,
    syncActive: !1,
    sourceUUID: null,
    requests: {}
  }, $.extend(!0, {}, d));
  d.update(c);
  PubHub.sub("WebConnections/refresh", function(b) {
    d.update(b[d.service])
  })
}
WebConnection.prototype.update = function(a) {
  var b = this,
    c = ["syncPhotos", "syncActive", "lastSync", "sourceUUID"];
  !a || $.isEmptyObject(a) ? b.isConnected = b.syncPhotos = b.syncActive = b.lastSync = !1 : ($.each(a, function(a, e) {
    -1 !== $.inArray(a, c) && (b.isConnected = !0, "lastSync" === a ? (b.lastSync = new XDate(1E3 * e), b.lastSync = e && b.lastSync.valid() ? b.lastSync : !1) : b[a] = e)
  }), b.syncPhotos = void 0 === a.syncPhotos ? !0 : a.syncPhotos);
  PubHub.pub("WebConnection/update", b);
  return b
};
WebConnection.prototype.refresh = function() {
  var a = {};
  $.extend(a, (void 0).resources.info.params);
  $.each(a, function(b, c) {
    $.isFunction(c) && (a[b] = c.call(void 0))
  });
  return API.request(this.resources.info.resource, a)
};
WebConnection.prototype.connect = function() {
  function a() {
    var f = {}, g;
    if (b.authWindow && !b.authWindow.closed) {
      try {
        g = b.authWindow.location.hostname === window.location.hostname
      } catch (h) {
        g = !1
      }
      if (g && !1 !== b.authWindow.authFinished) return $.extend(f, b.resources.complete.params, b.authCheck(c, b.authWindow)), $.each(f, function(a, c) {
        $.isFunction(c) && (f[a] = c.call(b))
      }), $.isEmptyObject(f) ? (console.error("Connection failure for " + b.service + "! Bad params: " + JSON.stringify(f)), b.connectPromise.reject(!0, !0), PubHub.pub("WebConnection/connectFail",
        b)) : b.requests.complete = API.request(b.resources.complete.resource, f).always(function() {
        delete b.requests.complete
      }).done(function(a) {
        b.connectPromise.resolve();
        b.update(a)
      }).fail(function(a, c) {
        console.error("Connection failure for " + b.service + "! API call failed with code " + c + ": " + a);
        b.connectPromise.reject(!0, !0);
        PubHub.pub("WebConnection/connectFail", b)
      }), !1
    } else return b.connectPromise.reject("Connection to " + b.title + " was canceled."), PubHub.pub("WebConnection/connectCancel", b), !1;
    e--;
    e ? setTimeout(a,
      d) : (console.error("Connection failure for " + b.service + "! Window expired."), b.connectPromise.reject("Your window for " + b.title + " has expired."), PubHub.pub("WebConnection/connectCancel", b));
    return !0
  }
  var b = this,
    c, d = 500,
    e = 600;
  if (b.isConnected && b.syncActive) return $.Deferred().resolve();
  b.connectPromise || (b.inProgress = !0, PubHub.pub("WebConnection/connectStart", b), b.connectPromise = $.Deferred().done(function() {
    b.isConnected = !0;
    PubHub.pub("WebConnection/connect", b)
  }).always(function() {
    b.inProgress = !1;
    PubHub.pub("WebConnection/update",
      b);
    b.authWindow && !b.authWindow.closed && (b.authWindow.focus(), b.authWindow.close(), delete b.authWindow);
    delete b.connectPromise
  }), PubHub.pub("WebConnection/update", b), function() {
    var d = window.location.protocol + "//" + window.location.hostname + "/auth.html",
      e = {};
    $.extend(e, b.resources.info.params, {
      callback: d
    });
    $.each(e, function(a, c) {
      $.isFunction(c) && (e[a] = c.call(b))
    });
    b.authWindow = window.open(d + "#service=" + encodeURIComponent(b.title), b.service + "AuthWindow", "status=0,width=500,height=550,resizable=1");
    window.AUTHWINDOW =
      b.authWindow;
    b.requests.connect = API.request(b.resources.connect.resource, e).always(function() {
      delete b.requests.connect
    }).done(function(d) {
      c = d;
      setTimeout(a, 2E3);
      b.authWindow.location = d.url;
      "iOS" === Platform.os && b.authWindow.focus()
    }).fail(function(a, c) {
      console.error("Connection failure for " + b.service + "! API call failed with code " + c + ": " + a);
      b.connectPromise.reject(!0, !0);
      PubHub.pub("WebConnection/connectFail", b)
    })
  }());
  return b.connectPromise
};
WebConnection.prototype.authCheck = function(a, b) {
  return b.queryParams && b.queryParams.oauth_token === a.oauthToken && b.queryParams.oauth_verifier ? {
    oauthToken: a.oauthToken,
    oauthSecret: a.oauthSecret,
    oauthVerifier: b.queryParams.oauth_verifier
  } : !1
};
WebConnection.prototype.cancelConnect = function(a) {
  var b = $.Deferred();
  this.connectPromise ? (this.requests.connect && this.requests.connect.abort(), this.requests.complete && this.requests.complete.abort(), this.connectPromise.always(function() {
    b.resolve()
  }).reject(a)) : b.resolve();
  return b
};
WebConnection.prototype.disconnect = function() {
  var a = this;
  return a.isConnected ? (a.disconnectPromise || (a.disconnectPromise = $.Deferred().done(function() {
    a.isConnected = !1;
    PubHub.pub("WebConnection/disconnect", a)
  }).always(function() {
    delete a.disconnectPromise
  }), a.cancelConnect().done(function() {
    function b() {
      var b = {};
      $.extend(b, a.resources.disconnect.params);
      $.each(b, function(c, f) {
        $.isFunction(f) && (b[c] = f.call(a))
      });
      return API.request(a.resources.disconnect.resource, b).done(function() {
        a.disconnectPromise.resolve();
        a.update(!1)
      }).fail(function() {
        a.disconnectPromise.reject(!0)
      })
    }
    var c;
    a.syncPhotos ? (c = $("#template-disconnect").mustache({
      source: a.service,
      title: a.title
    }).appendTo("body").on({
      "beforeClose.popover": function(b) {
        b.userTriggered && a.disconnectPromise.reject()
      },
      "afterClose.popover": function() {
        c.popover().destruct()
      },
      "execute.asyncForm": function() {
        b().always(function() {
          c.popover().close(!1)
        })
      }
    }), c.asyncForm(), c.find(".cancelLink").on("click", function() {
      c.popover().close(!0)
    }), c.popover({
      isOpen: !0,
      closeButton: "back"
    })) :
      b()
  })), a.disconnectPromise) : $.Deferred().resolve()
};
WebConnection.prototype.syncNow = function() {
  var a = this,
    b = {};
  $.extend(b, a.resources.sync.params);
  $.each(b, function(c, d) {
    $.isFunction(d) && (b[c] = d.call(a))
  });
  return API.request(this.resources.sync.resource, b).done(function(b) {
    PubHub.pub("WebConnection/sync", a)
  })
};
WebConnection.prototype.deletePhotos = function() {
  return this.sourceUUID ? Sources.deleteSource(this.sourceUUID) : $.Deferred().reject()
};

function FacebookConnection(a) {
  this.title = "Facebook";
  WebConnection.call(this, "facebook", {}, a)
}
$.extend(!0, FacebookConnection.prototype, WebConnection.prototype);
FacebookConnection.prototype.authCheck = function(a, b) {
  return b.hashParams && b.hashParams.access_token ? {
    accessToken: b.hashParams.access_token,
    syncPhotos: this.shouldImportPhotos ? 1 : 0
  } : !1
};
FacebookConnection.prototype.connect = function(a) {
  var b = this,
    c = $.Deferred(),
    d;
  b.isConnected && b.syncActive ? c.resolve() : a ? (b.shouldImportPhotos = !0, c.follow(WebConnection.prototype.connect.call(b))) : (d = $("#template-connect-facebook").mustache({}).appendTo("body").on({
    "beforeClose.popover": function(a) {
      $("#connections").length && $("#connections").popover().open();
      a.userTriggered && (c.reject(), PubHub.pub("WebConnection/connectCancel", b))
    },
    "afterClose.popover": function(b) {
      $(this).popover().destruct()
    }
  }), d.popover({
    isOpen: !0,
    closeButton: "back"
  }), d.find(".connect-facebook-sharingOnly, .connect-facebook-importPhotos").on("click", function() {
    b.shouldImportPhotos = $(this).is(".connect-facebook-importPhotos");
    d.popover().close(!1);
    c.follow(WebConnection.prototype.connect.call(b))
  }));
  return c
};
FacebookConnection.prototype.cancelConnect = function(a) {
  return WebConnection.prototype.cancelConnect.call(this, a).done(function() {
    var b = $("#connections\\/web\\/connect\\/facebook");
    b.length && b.popover().close(!0)
  })
};

function TwitterConnection(a) {
  this.title = "Twitter";
  WebConnection.call(this, "twitter", {}, a)
}
$.extend(!0, TwitterConnection.prototype, WebConnection.prototype);
TwitterConnection.prototype.syncNow = function() {
  return $.Deferred().reject()
};
TwitterConnection.prototype.update = function(a) {
  this.isConnected = a ? !0 : !1;
  this.importPhotos = !1;
  PubHub.pub("WebConnection/update", this);
  return this
};

function InstagramConnection(a) {
  this.title = "Instagram";
  WebConnection.call(this, "instagram", {}, a)
}
$.extend(!0, InstagramConnection.prototype, WebConnection.prototype);
InstagramConnection.prototype.authCheck = function(a, b) {
  return b.hashParams && b.hashParams.access_token ? {
    accessToken: b.hashParams.access_token
  } : !1
};

function FlickrConnection(a) {
  this.title = "Flickr";
  WebConnection.call(this, "flickr", {}, a)
}
$.extend(!0, FlickrConnection.prototype, WebConnection.prototype);

function PicasaConnection(a) {
  this.title = "Picasa Web Albums";
  WebConnection.call(this, "picasa", {}, a)
}
$.extend(!0, PicasaConnection.prototype, WebConnection.prototype);

function GmailConnection(a) {
  $.extend(!0, this, {
    title: "Gmail",
    resources: {
      complete: {
        params: {
          folder: function() {
            return this.folder
          }
        }
      }
    }
  }, $.extend({}, this));
  WebConnection.call(this, "gmail", {}, a)
}
$.extend(!0, GmailConnection.prototype, WebConnection.prototype);
GmailConnection.prototype.update = function(a) {
  a && a.folder && (this.folder = a.folder);
  return WebConnection.prototype.update.call(this, a)
};
GmailConnection.prototype.connect = function(a) {
  var b = this,
    c = $.Deferred(),
    d;
  b.isConnected && b.syncActive ? c.resolve() : a ? (d = $("#template-connect-gmail-folder").mustache({}).appendTo("body").on({
    "execute.asyncForm": function() {
      b.folder = $("#connections\\/web\\/connect\\/gmail\\/folder").val() || void 0;
      d.popover().close(!1);
      c.follow(WebConnection.prototype.connect.call(b, a))
    },
    "afterOpen.popover": function() {
      d.find("input").first().trigger("focus")
    },
    "beforeClose.popover": function(b) {
      $("#connections").length &&
        $("#connections").popover().open();
      b.userTriggered && c.reject()
    },
    "afterClose.popover": function(b) {
      $(this).asyncForm().destruct();
      $(this).popover().destruct()
    }
  }), d.popover({
    isOpen: !0,
    closeButton: "back"
  }), d.asyncForm()) : c.follow(WebConnection.prototype.connect.call(b, a));
  return c
};
GmailConnection.prototype.authCheck = function(a, b) {
  return b.queryParams && b.queryParams.code ? {
    code: b.queryParams.code,
    callback: window.location.protocol + "//" + window.location.hostname + "/auth.html"
  } : !1
};
GmailConnection.prototype.cancelConnect = function(a) {
  return WebConnection.prototype.cancelConnect.call(this, a).done(function() {
    var b = $("#connections\\/web\\/connect\\/gmail");
    b.length && b.popover().close(!0)
  })
};

function PathConnection(a) {
  this.title = "Path";
  WebConnection.call(this, "path", {}, a)
}
$.extend(!0, PathConnection.prototype, WebConnection.prototype);
PathConnection.prototype.syncNow = function() {
  return $.Deferred().reject()
};
PathConnection.prototype.update = function(a) {
  this.isConnected = a ? !0 : !1;
  this.importPhotos = !1;
  PubHub.pub("WebConnection/update", this);
  return this
};
PathConnection.prototype.authCheck = function(a, b) {
  return b.queryParams && b.queryParams.code ? {
    code: b.queryParams.code
  } : !1
};

function Group(a) {
  var b = this;
  $.extend(!0, b, {
    itemsDictionary: {},
    itemLimit: void 0,
    itemLimitTruncate: "last",
    isDestructed: !1,
    strings: {
      groupName: DEFAULT_GROUPNAME,
      itemName: DEFAULT_ITEMNAME,
      itemsName: DEFAULT_ITEMSNAME
    }
  });
  b.items = a || [];
  Subscriptions.call(b);
  Strings.call(b);
  _(b.items).each(function(a) {
    a.id && (b.itemsDictionary[a.id] = a)
  });
  b.subscribe("processItemConstruction", "Item/construct", function(a) {
    b.processItemConstruct(a)
  });
  b.subscribe("processItemDestruction", "Item/destruct", function(a) {
    b.processItemDestruct(a)
  })
}
$.extend(!0, Group.prototype, Subscriptions.prototype, Strings.prototype);
Group.prototype.match = function(a) {
  return !0
};
Group.prototype.file = function(a) {
  return this.items.length
};
Group.prototype.add = function(a) {
  var b = $.Deferred(),
    c;
  a && !_(this.items).contains(a) ? (c = this.file(a), !this.itemLimit || "last" === this.itemLimitTruncate && c < this.itemLimit || "first" === this.itemLimitTruncate && 0 < c ? (this.items.splice(c, 0, a), a.id && (this.itemsDictionary[a.id] = a), PubHub.pub("Group/add", this, a), this.itemLimit && this.items.length >= this.itemLimit ? "first" === this.itemLimitTruncate ? b.follow(this.remove(_(this.items).first())) : b.follow(this.remove(_(this.items).last())) : b.resolve(a)) : b.reject()) : b.reject();
  return b.promise()
};
Group.prototype.remove = function(a) {
  var b = _(this.items).indexOf(a);
  return 0 <= b ? (this.items.splice(b, 1), a.id && delete this.itemsDictionary[a.id], PubHub.pub("Group/remove", this, a), $.resolved) : $.rejected
};
Group.prototype.refile = function(a) {
  var b = _(this.items).indexOf(a),
    c;
  return 0 <= b ? (this.items.splice(b, 1), c = this.file(a), this.items.splice(c, 0, a), c !== b && PubHub.pub("Group/refile", this, a), $.resolved) : $.rejected
};
Group.prototype.processItemConstruct = function(a) {
  var b = $.Deferred();
  this.match(a) ? b.follow(this.add(a)) : b.reject();
  return b.promise()
};
Group.prototype.processItemDestruct = function(a) {
  var b = $.Deferred();
  _(this.items).contains(a) ? b.follow(this.remove(a)) : b.reject();
  return b.promise()
};
Group.prototype.reset = function() {
  var a = this,
    b;
  b = _(a.items).map(function(b) {
    var d = $.Deferred();
    _(function() {
      a.remove(b).always(function() {
        d.resolve()
      })
    }).defer();
    return d
  });
  return $.when.apply(a, b).always(function() {
    PubHub.pub("Group/reset", a)
  }).promise()
};
Group.prototype.countItems = function() {
  return this.items.length
};
Group.prototype.hasItem = function(a) {
  return !(_(a).isObject() ? !_(this.items).contains(a) : !this.itemsDictionary[a])
};
Group.prototype.get = function(a) {
  return a || 0 === a ? this.itemsDictionary[a] : $.extend({}, this.itemsDictionary)
};
Group.prototype.getMatching = function(a) {
  return _(this.items).filter(a)
};
Group.prototype.countMatching = function(a) {
  return this.getMatching(a).length
};
Group.prototype.getIndexOf = function(a) {
  return _(this.items).indexOf(a)
};
Group.prototype.generateItemHash = function() {
  return _(this.items).pluck("id").join()
};
Group.prototype.destruct = function() {
  this.isDestructed = !0;
  this.unsubscribeAll();
  this.items.splice(0);
  return $.resolved
};

function PhotoGroup(a, b) {
  var c = this;
  Group.call(c, a);
  $.extend(!0, c, {
    sortOrder: "asc"
  }, b);
  c.photos = c.items;
  c.subscribe("photoRefile", "Photo/set/timestamp", function(b) {
    _(c.items).contains(b) && c.refile(b)
  })
}
$.extend(!0, PhotoGroup.prototype, Group.prototype);
PhotoGroup.prototype.match = function(a) {
  return a instanceof Photo
};
PhotoGroup.prototype.file = function(a) {
  var b = this;
  return _(b.items).sortedIndex(a, function(a) {
    return (a.unixTimestamp || 0) * ("asc" === b.sortOrder ? 1 : -1)
  })
};

function ContextGroup(a, b) {
  var c = this;
  Group.call(c, a);
  $.extend(!0, c, {
    sortOrder: "asc"
  }, b);
  c.contexts = c.items;
  c.subscribe("contextRefile", "Context/set/timestamp", function(b) {
    _(c.items).contains(b) && c.refile(b)
  })
}
$.extend(!0, ContextGroup.prototype, Group.prototype);
ContextGroup.prototype.match = function(a) {
  return _(a.photos).isArray()
};
ContextGroup.prototype.file = function(a) {
  var b = this;
  return _(b.items).sortedIndex(a, function(a) {
    return (a.timestamp ? a.timestamp.getTime() : 0) * ("asc" === b.sortOrder ? 1 : -1)
  })
};

function CategoryGroup(a, b) {
  Group.call(this, a);
  $.extend(!0, this, {}, b);
  this.categories = this.items
}
$.extend(!0, CategoryGroup.prototype, Group.prototype);
CategoryGroup.prototype.match = function(a) {
  return _(a.contexts).isArray()
};
CategoryGroup.prototype.file = function(a) {
  var b = this;
  return _(b.items).sortedIndex(a, function(a) {
    return (a.year || 0) * ("asc" === b.sortOrder ? 1 : -1)
  })
};

function KeyPhotoGroup(a, b) {
  PhotoGroup.call(this, a)
}
$.extend(!0, KeyPhotoGroup.prototype, PhotoGroup.prototype);
KeyPhotoGroup.prototype.match = function(a) {
  return !1
};
KeyPhotoGroup.prototype.file = function(a) {
  return this.items.length
};
KeyPhotoGroup.prototype.processItemConstruct = function() {
  return $.rejected
};

function Fetcher(a, b) {
  var c = this;
  Group.call(c, a);
  $.extend(!0, c, {
    cursor: void 0,
    fetchContinue: !0,
    fetchedOnce: !1,
    resources: {
      fetchItems: {
        resource: "",
        params: {
          cursor: function() {
            return this.cursor
          },
          order: function() {
            return this.sortOrder
          }
        }
      }
    },
    respectSortOrderPref: !1,
    sortOrder: "asc"
  }, b, {
    requests: {}
  });
  TaskQueue.call(c);
  RequestUtilities.call(c);
  _(function() {
    c.respectSortOrderPref && c.setSortOrder(Preferences.get("sort_order"));
    c.subscribe("sortOrderPreference", "Preference/set", function(b, a) {
      c.respectSortOrderPref &&
        "sort_order" === b && c.setSortOrder(a)
    })
  }).defer()
}
$.extend(!0, Fetcher.prototype, TaskQueue.prototype, RequestUtilities.prototype, Group.prototype);
Fetcher.prototype.processItemConstruct = function() {
  return $.rejected
};
Fetcher.prototype.reset = function(a) {
  a = $.Deferred();
  this.isDestructed ? a.reject() : (this.cursor = void 0, this.fetchContinue = !0, this.fetchedOnce = !1, this.requests.fetch && this.requests.fetch.abort(), a.follow(Group.prototype.reset.call(this)));
  return a.promise()
};
Fetcher.prototype.fetch = function(a) {
  var b = this,
    c = $.Deferred();
  b.isDestructed ? c.reject() : b.fetchContinue ? (b.requests.fetch || (a = b.makeParams("fetchItems", a), b.requests.fetch = API.request(b.resources.fetchItems.resource, a).always(function() {
    b.fetchedOnce = !0;
    delete b.requests.fetch
  }).done(function(a) {
    _(b.processFetchResponse(a)).each(function(a) {
      b.add(a, "fetch")
    });
    PubHub.pub("Group/fetch", b)
  })), c.follow(b.requests.fetch)) : c.resolve();
  return c.promise()
};
Fetcher.prototype.processFetchResponse = function(a) {
  this.cursor = a.cursor || null;
  this.fetchContinue = null !== this.cursor;
  return _(a.items).map(function(b) {
    return b
  })
};
Fetcher.prototype.fetchAll = function(a) {
  var b = this,
    c = $.Deferred();
  b.fetchContinue ? b.fetch(a).done(function() {
    c.follow(b.fetchAll())
  }).fail(function() {
    c.reject()
  }) : c.resolve();
  return c.promise()
};
Fetcher.prototype.checkForUpdate = function() {
  function a() {
    var a = b.makeParams("fetchItems", {
      cursor: void 0
    });
    a.limit = Math.max(a.limit, b.items.length);
    b.requests.fetch = API.request(b.resources.fetchItems.resource, a).done(function(a) {
      var c;
      newItems = b.processFetchResponse(a);
      a = _(newItems).difference(b.items);
      c = _(b.items).difference(newItems);
      _(a).each(function(a) {
        b.add(a, "update")
      });
      _(c).each(function(a) {
        b.remove(a, "update")
      })
    });
    c.follow(b.requests.fetch)
  }
  var b = this,
    c = $.Deferred();
  b.isDestructed ? c.reject() :
    void 0 === b.cursor ? c.resolve() : b.requests.fetch ? b.requests.fetch.done(a) : a();
  return c.promise()
};
Fetcher.prototype.setSortOrder = function(a) {
  var b = $.Deferred();
  _(["asc", "desc"]).contains(a) || (a = "asc");
  a !== this.sortOrder ? (this.sortOrder = a, b.follow(this.reset())) : b.reject();
  return b.promise()
};
Fetcher.prototype.destruct = function(a) {
  var b = this;
  return Group.prototype.destruct.call(b, a).done(function() {
    b.requests.fetch && b.requests.fetch.abort()
  })
};

function PhotoFetcher(a, b) {
  PhotoGroup.call(this, a, b);
  Fetcher.call(this, a);
  $.extend(!0, this, {
    resources: {
      fetchItems: {
        resource: "",
        params: {
          limit: FETCH_LIMIT_PHOTOS
        }
      }
    }
  }, b)
}
$.extend(!0, PhotoFetcher.prototype, PhotoGroup.prototype, Fetcher.prototype);
PhotoFetcher.prototype.file = PhotoGroup.prototype.file;
PhotoFetcher.prototype.processFetchResponse = function(a) {
  Fetcher.prototype.processFetchResponse.call(this, a);
  return _(a.photos).map(function(b) {
    return !!window.Photos && Photos.get(b.pid) || new Photo(b.pid, b, null, "fetch")
  })
};
PhotoFetcher.prototype.selectItemForViewer = function(a, b) {
  function c() {
    var c = d.items.length,
      e = f + c,
      m = d.items[e % c],
      p = void 0;
    m === a && b ? g.reject() : (1 < c && (p = d.items[(e + 1) % c]), g.resolve(m, p, 0 === e % c, e % c === c - 1))
  }
  var d = this,
    e = _(d.items).indexOf(a),
    f, g = $.Deferred();
  b = 0 + b || 0;
  e = a ? _(d.items).indexOf(a) : 0;
  0 <= e ? (f = e + b, f >= d.items.length - 1 ? d.fetch().always(c) : 0 > f ? d.fetchAll().always(c) : c()) : g.reject();
  return g.promise()
};

function ContextFetcher(a, b) {
  ContextGroup.call(this, a, b);
  Fetcher.call(this, a, b);
  $.extend(!0, this, {
    resources: {
      fetchItems: {
        resource: "",
        params: {
          limit: FETCH_LIMIT_CONTEXTS
        }
      }
    }
  }, b)
}
$.extend(!0, ContextFetcher.prototype, ContextGroup.prototype, Fetcher.prototype);
ContextFetcher.prototype.file = ContextGroup.prototype.file;

function SemanticFetcher(a, b) {
  PhotoFetcher.call(this, a);
  $.extend(!0, this, {
    resources: {
      fetchItems: {
        resource: "semanticPhotos",
        params: {
          minLikelihood: 60,
          maxLikelihood: 100,
          limit: 50
        }
      }
    }
  }, b, {
    description: null
  })
}
$.extend(!0, SemanticFetcher.prototype, PhotoFetcher.prototype);
SemanticFetcher.prototype.file = function(a) {
  return this.items.length
};
SemanticFetcher.prototype.fetch = function(a) {
  var b = this;
  return PhotoFetcher.prototype.fetch.call(b, a).done(function(a, d) {
    b.description = a.description
  })
};
SemanticFetcher.prototype.processFetchResponse = function(a) {
  var b = PhotoFetcher.prototype.processFetchResponse.call(this, a);
  _(function() {
    _(a.photos).each(function(b) {
      Photos.get(b.pid).semanticInfo = b.info || void 0
    })
  }).defer();
  return b
};

function ShuffleFetcher(a, b) {
  PhotoFetcher.call(this, a);
  $.extend(!0, this, {
    resources: {
      fetchItems: {
        resource: "shufflePhotos",
        params: {
          limit: FETCH_LIMIT_SHUFFLE
        }
      }
    }
  }, b)
}
$.extend(!0, ShuffleFetcher.prototype, PhotoFetcher.prototype);
ShuffleFetcher.prototype.file = function(a) {
  return this.items.length
};

function InterestingFetcher(a, b, c) {
  PhotoFetcher.call(this, a);
  $.extend(!0, this, {
    resources: {
      fetchItems: {
        resource: "interestingPhotos",
        params: {
          tagNames: function() {
            return JSON.stringify(this.tags)
          },
          format: "photos"
        }
      }
    }
  }, c, {
    tags: _(b).isArray() ? b : [b]
  })
}
$.extend(!0, InterestingFetcher.prototype, PhotoFetcher.prototype);
InterestingFetcher.prototype.file = function(a) {
  return this.items.length
};

function TodayFetcher(a, b, c) {
  Fetcher.call(this, a);
  $.extend(!0, this, {
    mode: "photos",
    resources: {
      fetchItems: {
        resource: "today",
        params: {
          format: function() {
            return this.mode
          },
          windowDuration: "today",
          timestamp: function() {
            return this.date.getTime() / 1E3
          },
          limit: FETCH_LIMIT_TODAY
        }
      }
    }
  }, c, {
    date: b && b instanceof XDate ? b : new XDate
  });
  "events" === this.mode ? this.contexts = this.items : (this.mode = "photos", this.photos = this.items)
}
$.extend(!0, TodayFetcher.prototype, PhotoFetcher.prototype);
TodayFetcher.prototype.file = function(a) {
  return this.items.length
};
TodayFetcher.prototype.processFetchResponse = function(a) {
  Fetcher.prototype.processFetchResponse.call(this, a);
  a.timestamp && (this.displayTimestamp = new XDate(1E3 * a.timestamp, !0));
  return "photos" === this.mode ? _(a.photos).map(function(b) {
    return Photos.get(b.pid) || new Photo(b.pid, b, null, "fetch")
  }) : _(a.events).map(function(b) {
    return Moments.get(b.eid) || new Moment(b.eid, b, null, null, "fetch")
  })
};
API.define("today", "GET", "event_memories", {
  includeAuthToken: !0
});

function ViewGroup(a, b) {
  var c = this;
  Group.call(c, a);
  $.extend(!0, c, {}, b);
  c.views = c.items;
  c.subscribe("processViewConstruction", "View/construct", function(b) {
    c.processViewConstruct(b)
  });
  c.subscribe("processViewDestruction", "View/destruct", function(b) {
    c.processViewDestruct(b)
  })
}
$.extend(!0, ViewGroup.prototype, Group.prototype);
ViewGroup.prototype.processItemConstruct = function() {
  return $.rejected
};
ViewGroup.prototype.processItemDestruct = function() {
  return $.rejected
};
ViewGroup.prototype.processViewConstruct = function(a) {
  var b = $.Deferred();
  this.match(a) ? b.follow(this.add(a)) : b.reject();
  return b.promise()
};
ViewGroup.prototype.processViewDestruct = function(a) {
  return $.Deferred().follow(this.remove(a)).promise()
};
ViewGroup.prototype.getViewOf = function(a) {
  return _(this.views).find(function(b) {
    return b.viewOf && b.viewOf === a
  })
};

function Context(a, b, c) {
  var d = this;
  PhotoFetcher.call(d, []);
  $.extend(!0, d, {
    resources: {
      edit: {
        resource: "",
        params: {}
      }
    },
    strings: {
      title: CONTEXT_TITLE,
      groupName: CONTEXT_GROUPNAME,
      itemName: CONTEXT_ITEMNAME,
      itemsName: CONTEXT_ITEMSNAME
    },
    templates: {
      deleteWarning: {
        selector: "#template-group-deleteWarning",
        options: {
          count: function() {
            return this.photoCount
          },
          isPlural: function() {
            return 1 !== this.photoCount
          },
          groupName: function() {
            return this.makeString("groupName")
          },
          itemName: function() {
            return this.makeString("itemName")
          },
          itemsName: function() {
            return this.makeString("itemsName")
          }
        }
      }
    }
  }, c, {
    timestamp: null,
    minDate: null,
    maxDate: null,
    year: null,
    photoCount: 0,
    photoSetVersion: void 0,
    visibility: 1
  });
  Templates.call(d);
  _(a).isObject() && (d.timestamp = a.timestamp ? new XDate(1E3 * a.timestamp, !0) : null, d.minDate = a.minDate ? new XDate(1E3 * a.minDate, !0) : null, d.maxDate = a.maxDate ? new XDate(1E3 * a.maxDate, !0) : null, d.year = d.timestamp instanceof XDate ? d.timestamp.getFullYear() : null, d.photoCount = a.photoCount || 0, d.photoSetVersion = a.photoSetVersion, d.visibility =
    void 0 === a.visibility ? 1 : a.visibility, _(a.keyPhotos).isArray() ? d.keyPhotos = new KeyPhotoGroup(_(a.keyPhotos).map(function(b) {
      return Photos.get(b.pid) || new Photo(b.pid, b, {}, "keyPhotos")
    })) : d.keyPhotos = new KeyPhotoGroup);
  _(b).isObject() && (d.fetchedOnce = !0, _(d.processFetchResponse(b)).each(function(b) {
    d.add(b, "fetch")
  }), PubHub.pub("Group/fetch", d))
}
$.extend(!0, Context.prototype, PhotoFetcher.prototype, Templates.prototype);
Context.prototype.match = function() {
  return !1
};
Context.prototype.remove = function(a) {
  var b = this;
  return PhotoFetcher.prototype.remove.call(b, a).done(function() {
    b.fetchContinue || b.items.length || b.destruct()
  })
};
Context.prototype.setTimestamp = function(a) {
  var b = $.Deferred(),
    c = this.timestamp;
  a instanceof XDate && (!a.valid() || c instanceof XDate && c.getTime() === a.getTime()) ? b.reject() : (this.timestamp = a, this.year = this.timestamp instanceof XDate ? this.timestamp.getFullYear() : null, PubHub.pub("Context/set/timestamp", this, a, c), b.resolve());
  return b.promise()
};
Context.prototype.setMinDate = function(a) {
  var b = $.Deferred(),
    c = this.minDate;
  a instanceof XDate && (!a.valid() || c instanceof XDate && c.getTime() === a.getTime()) ? b.reject() : (this.minDate = a, PubHub.pub("Context/set/minDate", this, a, c), b.resolve());
  return b.promise()
};
Context.prototype.setMaxDate = function(a) {
  var b = $.Deferred(),
    c = this.maxDate;
  a instanceof XDate && (!a.valid() || c instanceof XDate && c.getTime() === a.getTime()) ? b.reject() : (this.maxDate = a, PubHub.pub("Context/set/maxDate", this, a, c), b.resolve());
  return b.promise()
};
Context.prototype.setPhotoCount = function(a) {
  var b = $.Deferred(),
    c = this.photoCount;
  c !== a ? (this.photoCount = a, PubHub.pub("Context/set/photoCount", this, a, c), b.resolve()) : b.reject();
  return b.promise()
};
Context.prototype.setKeyPhotos = function(a) {
  var b = this,
    c = $.Deferred(),
    d = a || [];
  a = b.keyPhotos.generateItemHash();
  var e = _(d).pluck("pid").join();
  a !== e ? b.keyPhotos.reset().always(function() {
    var a = _(d).map(function(a) {
      return b.keyPhotos.add(Photos.get(a.pid) || new Photo(a.pid, a))
    });
    $.when.apply(null, a).always(function() {
      PubHub.pub("Context/set/keyPhotos", b, b.keyPhotos);
      c.resolve()
    })
  }) : c.reject();
  return c.promise()
};
Context.prototype.setVisibility = function(a, b) {
  function c() {
    d.visibility = a;
    PubHub.pub("Context/set/visibility", d, a, g)
  }
  var d = this,
    e = $.Deferred(),
    f, g = d.visibility;
  if (d.visibility !== a) b ? (c(), e.resolve()) : (d.requests.visibility && d.requests.visibility.abort(), f = d.makeParams("edit", {
    visibility: a
  }), d.requests.visibility = API.request(d.resources.edit.resource, f).always(function(b, a) {
    delete d.requests.visibility
  }).done(function() {
    c()
  }), e.follow(d.requests.visibility));
  else return e.resolve();
  return e.promise()
};
Context.prototype.editTime = function(a, b, c) {
  var d = this,
    e = $.Deferred();
  b ? d.resources.edit ? (e = _(a).isArray() && 0 !== _(d.photos).difference(a).length ? Photos.editTimestamps(a, b) : API.request(d.resources.edit.resource, d.makeParams("edit", {
    deltaTimestamp: b,
    force: c ? 1 : 0
  })).done(function(b) {
    d.setTimestamp(new XDate(1E3 * b.timestamp, !0));
    d.setMinDate(new XDate(1E3 * b.minDate, !0));
    d.setMaxDate(new XDate(1E3 * b.maxDate, !0))
  }), e.done(function() {
    PubHub.pub("Context/editTime", d);
    _(a).each(function(a) {
      a.setTimestamp(a.timestamp.clone().addSeconds(b), !0)
    })
  })) : e.reject() : e.resolve();
  return e.promise()
};
Context.prototype.baleet = function(a) {
  var b = this,
    c = $.Deferred();
  b.resources.baleet ? a ? (b.requests.baleet || (b.requests.baleet = API.request(b.resources.baleet.resource, b.makeParams("baleet")).done(function() {
    PubHub.pub("Context/delete", b);
    b.destruct()
  })), c.follow(b.requests.baleet)) : b.buildElement("deleteWarning").done(function(a) {
    a ? (a.on({
      "beforeClose.popover": function(b) {
        b.userTriggered && c.reject()
      },
      "afterClose.popover": function() {
        $(this).popover().destruct()
      },
      "execute.asyncForm": function() {
        b.requests.baleet ||
          (b.requests.baleet = API.request(b.resources.baleet.resource, b.makeParams("baleet")).always(function() {
          a.popover().close()
        }).done(function() {
          PubHub.pub("Context/delete", b);
          b.destruct()
        }));
        c.follow(b.requests.baleet)
      }
    }).appendTo("body"), a.popover({
      isOpen: !0
    }), a.asyncForm(), a.find(".cancelLink").on("click", function() {
      a.popover().close(!0)
    })) : c.reject()
  }) : c.reject();
  return c.promise()
};

function Moment(a, b, c, d) {
  var e = this;
  Context.call(e, b, c, d);
  $.extend(!0, e, {
    id: a,
    groupName: "moment",
    resources: {
      fetchItems: {
        resource: "momentInfo",
        params: {
          eid: a
        }
      },
      edit: {
        resource: "momentEdit",
        params: {
          eid: a
        }
      }
    },
    strings: {
      title: function() {
        return this.timestamp.toString(MOMENT_TITLE_DATE_FORMAT)
      },
      groupName: MOMENT_GROUPNAME
    }
  }, d, {
    timeOfDay: b.timeOfDay,
    sourceType: b.sourceType
  });
  e.subscribe("photoVisibility", "Photo/set/visibility", function(b) {
    e.hasItem(b) && ((b = _(e.photos).every(function(b) {
        return !b.visibility
      })) ?
      e.setVisibility(0, !0) : e.setVisibility(1, !0))
  });
  _.defer(function() {
    PubHub.pub("Item/construct", e)
  })
}
$.extend(!0, Moment.prototype, Context.prototype);
Moment.prototype.destruct = function() {
  var a = this;
  return Context.prototype.destruct.call(a).done(function() {
    PubHub.pub("Item/destruct", a)
  })
};
Moment.prototype.hide = function(a) {
  var b = this;
  return b.setVisibility(0, a).done(function() {
    _(b.photos).each(function(b) {
      b.setVisibility(0, !0)
    })
  })
};
Moment.prototype.unhide = function(a) {
  var b = this;
  return b.setVisibility(1, a).done(function() {
    _(b.photos).each(function(b) {
      b.setVisibility(1, !0)
    })
  })
};
Moment.prototype.getTimeOfDayString = function() {
  var a = this.minDate.diffDays(this.maxDate);
  return this.timeOfDay && MOMENT_TIMEOFDAY_DEFINITONS[this.timeOfDay] ? MOMENT_TIMEOFDAY_DEFINITONS[this.timeOfDay] : 1 <= a ? Math.floor(a) + " day" + (1 < Math.floor(a) ? "s" : "") : this.minDate.toString(MOMENT_TIMEOFDAY_TIME_FORMAT) + " to " + this.maxDate.toString(MOMENT_TIMEOFDAY_TIME_FORMAT)
};

function Set(a, b, c, d) {
  var e = this;
  Context.call(e, b, c, d);
  $.extend(!0, e, {
    id: a,
    groupName: "set",
    resources: {
      fetchItems: {
        resource: "setInfo",
        params: {
          aid: a
        }
      },
      edit: {
        resource: "setEdit",
        params: {
          aid: a
        }
      }
    },
    strings: {
      title: function() {
        return this.setName
      },
      groupName: SET_GROUPNAME
    }
  }, d, {
    albumName: b.albumName,
    sourceName: b.sourceName,
    sourceType: b.sourceType,
    filterSourceType: Sources.getFilterDetails(b.sourceType) ? Sources.getFilterDetails(b.sourceType).type : !1
  });
  e.setName = e.makeName();
  e.subscribe("photoVisibility", "Photo/set/visibility",
    function(b) {
      e.hasItem(b) && ((b = _(e.photos).every(function(b) {
        return !b.visibility
      })) ? e.setVisibility(0, !0) : e.setVisibility(1, !0))
    });
  _.defer(function() {
    PubHub.pub("Item/construct", e)
  })
}
$.extend(!0, Set.prototype, Context.prototype);
Set.prototype.destruct = function() {
  var a = this;
  return Context.prototype.destruct.call(a).done(function() {
    PubHub.pub("Item/destruct", a)
  })
};
Set.prototype.setTimestamp = function(a) {
  var b = $.Deferred(),
    c = this.timestamp;
  a instanceof XDate && (!a.valid() || c instanceof XDate && c.getTime() === a.getTime()) ? b.reject() : (this.timestamp = a, this.year = this.timestamp instanceof XDate ? this.timestamp.getFullYear() : null, this.setName = this.makeName(), PubHub.pub("Context/set/timestamp", this, a, c), b.resolve());
  return b.promise()
};
Set.prototype.hide = function(a) {
  var b = this;
  return b.setVisibility(0, a).done(function() {
    _(b.photos).each(function(b) {
      b.setVisibility(0, !0)
    })
  })
};
Set.prototype.unhide = function(a) {
  var b = this;
  return b.setVisibility(1, a).done(function() {
    _(b.photos).each(function(b) {
      b.setVisibility(1, !0)
    })
  })
};
Set.prototype.makeName = function() {
  return this.albumName && "mac-photostream" !== this.sourceType ? this.albumName : this.sourceName && "mac-photostream" !== this.sourceType ? $.mustache(SET_DEFAULT_TITLE, {
    month: this.timestamp.toString("MMMM"),
    source: this.sourceName
  }) : $.mustache(SET_DEFAULT_TITLE, {
    month: this.timestamp.toString("MMMM"),
    source: this.filterSourceType ? Sources.getFilterDetails(this.sourceType).title : !1
  })
};

function PhotoMail(a, b, c, d) {
  var e = this;
  Context.call(e, b, c, d);
  $.extend(!0, e, {
    id: a,
    groupName: "Photo Mail",
    resources: {
      fetchItems: {
        resource: "photoMailInfo",
        params: {
          mid: a
        }
      },
      baleet: {
        resource: "photoMailDelete",
        params: {
          mid: a
        }
      },
      mark: {
        resource: "photoMailMark",
        params: {
          mid: a
        }
      }
    },
    strings: {
      title: function() {
        return this.subject || this.timestamp.toString(PHOTOMAIL_SENT_DATE_FORMAT)
      },
      groupName: PHOTOMAIL_GROUPNAME
    }
  }, d, {
    subject: b.subject || null,
    body: b.body || null,
    sender: b.sender
  });
  _.defer(function() {
    PubHub.pub("Item/construct",
      e)
  })
}
$.extend(!0, PhotoMail.prototype, Context.prototype);
PhotoMail.prototype.destruct = function() {
  var a = this;
  return Context.prototype.destruct.call(a).done(function() {
    PubHub.pub("Item/destruct", a)
  })
};
PhotoMail.prototype.setVisibility = function(a, b) {
  return 1 === a ? this.mark(!0, b) : 2 === a ? this.mark(!1, b) : $.rejected
};
PhotoMail.prototype.mark = function(a, b) {
  function c() {
    d.visibility = a ? 1 : 2;
    PubHub.pub("Context/set/visibility", d, d.visibility)
  }
  var d = this,
    e;
  if (a && 2 === d.visibility || !a && 2 !== d.visibility) {
    if (b) return c(), $.Deferred().resolve();
    d.requests.visibility && d.requests.visibility.abort();
    e = d.makeParams("mark", {
      read: a ? 1 : 0
    });
    d.requests.visibility = API.request(d.resources.mark.resource, e).always(function(b, a) {
      delete d.requests.visibility
    }).done(function() {
      c()
    });
    return d.requests.visibility
  }
  return $.resolved
};

function HighlightYear(a, b, c) {
  var d = this;
  Context.call(d, b, null, c);
  $.extend(!0, d, {
    id: a,
    year: a,
    groupName: "year",
    resources: {
      fetchItems: {
        resource: "highlights",
        params: {
          year: a
        }
      }
    },
    strings: {
      title: function() {
        return $.mustache(HIGHLIGHTYEAR_TITLE, this)
      },
      groupName: HIGHLIGHTYEAR_GROUPNAME
    },
    respectSortOrderPref: !0
  }, c);
  _.defer(function() {
    PubHub.pub("Item/construct", d)
  })
}
$.extend(!0, HighlightYear.prototype, Context.prototype);
HighlightYear.prototype.add = function(a) {
  var b = this;
  return Context.prototype.add.call(b, a).done(function() {
    b.photoCount = b.countItems()
  })
};
HighlightYear.prototype.remove = function(a) {
  var b = this;
  return Context.prototype.remove.call(b, a).done(function() {
    b.photoCount = b.countItems()
  })
};
HighlightYear.prototype.destruct = function() {
  var a = this;
  return Context.prototype.destruct.call(a).done(function() {
    PubHub.pub("Item/destruct", a)
  })
};
HighlightYear.prototype.refile = function(a) {
  var b = _(this.items).indexOf(a),
    c = this.file(a);
  return 0 <= b ? (a.year !== this.year ? this.remove(a) : c !== b && (a.timestamp.getTime() >= this.minDate && this.items.splice(b, 1), this.items.splice(c, 0, a), PubHub.pub("Group/refile", this, a)), !0) : !1
};
HighlightYear.prototype.setTimestamp = function() {
  return th
};
HighlightYear.prototype.setMinDate = function() {
  return th
};
HighlightYear.prototype.setMaxDate = function() {
  return th
};
HighlightYear.prototype.setPhotoCount = function() {
  return th
};
HighlightYear.prototype.setKeyPhotos = function() {
  return th
};

function HighlightMonth(a, b, c, d) {
  HighlightYear.call(this, a, c, d);
  $.extend(!0, this, {
    id: a + "-" + padStringToLength(b + 1, 2, "0", !0),
    groupName: "month",
    month: b,
    resources: {
      fetchItems: {
        resource: "highlights",
        params: {
          year: void 0,
          startTimestamp: function() {
            return this.cursor ? void 0 : XDate.UTC(a, b + ("asc" !== this.sortOrder)) / 1E3
          },
          endTimestamp: function() {
            return this.cursor ? void 0 : XDate.UTC(a, b + ("asc" === this.sortOrder)) / 1E3
          }
        }
      }
    },
    strings: {
      title: function() {
        return $.mustache(HIGHLIGHTMONTH_TITLE, {
          month: MONTHS[this.month],
          year: this.year
        })
      },
      groupName: HIGHLIGHTMONTH_GROUPNAME
    }
  }, d)
}
$.extend(!0, HighlightMonth.prototype, HighlightYear.prototype);
HighlightMonth.prototype.refile = function(a) {
  var b = _(this.items).indexOf(a),
    c = this.file(a);
  return 0 <= b ? (a.year !== this.year || a.timestamp.getMonth() !== this.month ? this.remove(a) : c !== b && (a.timestamp.getTime() >= this.minDate && this.items.splice(b, 1), this.items.splice(c, 0, a), PubHub.pub("Group/refile", this, a)), !0) : !1
};

function PhotoPage(a, b, c, d) {
  var e = this;
  Context.call(e, b, c, d);
  $.extend(!0, e, {
    id: a,
    groupName: "Photo Page",
    resources: {
      fetchItems: {
        resource: "photoPageInfo",
        params: {
          sid: a
        }
      },
      edit: {
        resource: "photoPageEdit",
        params: {
          sid: a
        }
      },
      baleet: {
        resource: "photoPageDelete",
        params: {
          sid: a
        }
      }
    },
    strings: {
      title: function() {
        return this.title || this.timestamp.toString(PHOTOPAGE_TITLE_DATE_FORMAT)
      },
      groupName: PHOTOPAGE_GROUPNAME
    },
    templates: {
      deleteWarning: {
        selector: "#template-photoPage-deleteWarning"
      }
    }
  }, d, {
    title: b.title,
    url: b.url || null,
    allowDownload: !! b.allowDownload
  });
  _(b).isObject() && (e.timestamp = b.modifiedTime ? new XDate(1E3 * b.modifiedTime) : null, e.createdTimestamp = b.createdDate ? new XDate(1E3 * b.createdDate) : null);
  _.defer(function() {
    PubHub.pub("Item/construct", e)
  })
}
$.extend(!0, PhotoPage.prototype, Context.prototype);
PhotoPage.prototype.destruct = function() {
  var a = this;
  return Context.prototype.destruct.call(a).done(function() {
    PubHub.pub("Item/destruct", a)
  })
};
PhotoPage.prototype.updatePhotos = function(a) {
  var b = this,
    c = $.Deferred(),
    d;
  d = {
    title: b.makeString("title"),
    allowDownload: b.allowDownload,
    isNew: !1,
    photoCount: a.length,
    isSingle: 1 === a.length,
    downloadCheckbox: !User.getInfo("disableNewSnapshotsPhotoDownloads")
  };
  Sharing.buildForm("photoPageForm", d, a).done(function(d) {
    if (d) d.on({
      "beforeClose.popover": function(b) {
        b.userTriggered && c.reject()
      },
      "execute.asyncForm": function() {
        var f = b.makeParams("edit", {
          title: $("#share\\/photopage\\/title").val(),
          pids: JSON.stringify(_(a).pluck("id")),
          allowDownload: $("#share\\/photopage\\/allowDownload").length ? $("#share\\/photopage\\/allowDownload").is(":checked") ? 1 : 0 : void 0
        });
        API.request(b.resources.edit.resource, f).done(function(f, h) {
          d.popover().close();
          b.setPhotoCount(f.photoCount);
          b.setTimestamp(f.modifiedTime ? new XDate(1E3 * f.modifiedTime) : null);
          b.setTitle(f.title);
          b.allowDownload = !! f.allowDownload;
          f.keyPhotos && b.setKeyPhotos(f.keyPhotos);
          _(a).each(function(a) {
            b.add(a)
          });
          c.resolve()
        }).fail(function(b, a) {
          400 === a ? (d.popover().close(), c.reject(b,
            400)) : d.asyncForm().unlock().always(function() {
            d.trigger({
              type: "validate",
              validationData: {
                result: !1,
                message: "Unexpected error, please try again. (code " + a + ")"
              }
            })
          })
        })
      }
    })
  });
  return c.promise()
};
PhotoPage.prototype.refinePhotos = function(a, b) {
  var c = this,
    d = PhotoPages.getView(c.id),
    e;
  e = Selections.buildNew(d, function(b) {
    c.updatePhotos(b).done(function() {
      e.resolve(b)
    }).fail(function(b, a) {
      a && e.reject()
    })
  }, $.extend(!0, {
    showActionAlert: !1,
    selectAll: !0,
    maxToProceed: SHARE_PHOTOPAGE_MAX_PHOTOS
  }, b), {
    candidateGroups: _(a).isArray() ? a : [a]
  });
  e.always(function() {
    d.deactivate()
  }).done(function(b) {
    _(c.photos).chain().difference(b).each(function(b) {
      c.remove(b)
    });
    _(b).chain().difference(c.photos).each(function(b) {
      c.add(b)
    })
  });
  d.activate();
  return e
};
PhotoPage.prototype.addPhotosFromViews = function(a, b) {
  var c = this,
    d, e;
  if (a) _(a).isArray() || (a = [a]);
  else return $.rejected;
  _(a).every(function(b) {
    return !!b.viewOf.photos
  }) && (d = _(a).chain().pluck("grids").flatten().map(function(b) {
    return b.getInsertedPreviews()
  }).flatten().pluck("previewOf").filter(function(b) {
    return b instanceof Photo
  }).uniq().value());
  if (d && 1 === d.length) return c.refinePhotos([a[0].viewOf]);
  e = Selections.buildNew(a, function() {
    c.refinePhotos(e, {
      strings: {
        cancelButton: "Back"
      }
    }).done(function() {
      e.resolve()
    }).fail(function(b, a) {
      a &&
        e.reject()
    })
  }, $.extend(!0, b, {
    refineBeforeProceeding: !1
  }));
  e.allowedViews.push(PhotoPages.getView(c.id));
  return e
};
PhotoPage.prototype.editFromPanel = function() {
  var a = this,
    b = $.Deferred(),
    c, d = !0;
  c = a.refinePhotos(null, {
    includeAddButton: !0
  }).done(function() {
    b.resolve()
  }).fail(function() {
    d && b.reject()
  });
  $("#navBar").find(".navBar-selection-add").one("click.editFromPanel-" + a.id, function() {
    d = !1;
    c.reject();
    a.addPhotosFromViews(_(MomentYears.getView()).toArray().concat(_(MomentMonths.getView()).toArray()), {
      minToProceed: 0,
      maxToProceed: SHARE_PHOTOPAGE_MAX_PHOTOS
    }).done(function() {
      b.resolve()
    }).fail(function() {
      b.reject()
    });
    MomentYears.activateCurrent()
  });
  return b.always(function() {
    $("#navBar").find(".navBar-selection-add").off("click.editFromPanel-" + a.id)
  }).promise()
};
PhotoPage.prototype.addFromShareMenu = function(a) {
  var b = this,
    c = $.Deferred(),
    d;
  if (a) _(a).isArray() || (a = [a]);
  else return $.rejected;
  _(a).every(function(b) {
    return !!b.viewOf
  }) ? d = b.addPhotosFromViews(a) : _(a).every(function(b) {
    return b instanceof Photo
  }) && (d = b.refinePhotos(new PhotoGroup(a)));
  d ? d.done(function() {
    var a = $("#template-share-photopage-link").mustache({
      url: b.url,
      includeUndo: !1
    }).appendTo("body").on({
      "afterOpen.popover": function() {
        a.find("input").first().trigger("focus").trigger("select");
        MessageBars.buildNew(PHOTOPAGE_UPDATE_MESSAGE_SUCCESS, {
          insertFunction: "appendTo",
          insertElement: a
        })
      },
      "beforeClose.popover": function() {
        c.resolve()
      },
      "afterClose.popover": function() {
        a.popover().destruct()
      }
    });
    a.popover({
      isOpen: !0
    })
  }).fail(function(b, a) {
    c.reject(b, a)
  }) : c.reject("Invalid input", "error");
  return c.promise()
};
PhotoPage.prototype.setTitle = function(a) {
  var b = $.Deferred(),
    c = this.title;
  c !== a ? (this.title = a, PubHub.pub("Context/set/title", this, a, c), b.resolve()) : b.reject();
  return b.promise()
};

function SentMail(a, b, c, d) {
  var e = this;
  Context.call(e, b, c, d);
  $.extend(!0, e, {
    id: a,
    groupName: "Photo Mail",
    resources: {
      fetchItems: {
        resource: "sentMailInfo",
        params: {
          mid: a
        }
      }
    },
    strings: {
      title: function() {
        return this.subject || this.timestamp.toString(PHOTOMAIL_SENT_DATE_FORMAT)
      },
      groupName: PHOTOMAIL_GROUPNAME
    }
  }, d, {
    subject: b.subject || null,
    body: b.body || null,
    recipients: b.recipientsStatus
  });
  _.defer(function() {
    PubHub.pub("Item/construct", e)
  })
}
$.extend(!0, SentMail.prototype, Context.prototype);
SentMail.prototype.destruct = function() {
  var a = this;
  return Context.prototype.destruct.call(a).done(function() {
    PubHub.pub("Item/destruct", a)
  })
};

function Category(a, b) {
  ContextFetcher.call(this, a, b);
  $.extend(!0, this, b)
}
$.extend(!0, Category.prototype, ContextFetcher.prototype);
Category.prototype.processItemConstruct = function(a) {
  return this.fetchedOnce ? ContextGroup.prototype.processItemConstruct.call(this, a) : $.rejected
};
Category.prototype.processItemDestruct = function(a) {
  return this.fetchedOnce ? ContextGroup.prototype.processItemDestruct.call(this, a) : $.rejected
};

function MomentYear(a, b, c) {
  var d = this;
  Category.call(d, b, c);
  $.extend(!0, d, {
    id: a,
    year: a,
    groupName: "year",
    resources: {
      fetchItems: {
        resource: "moments",
        params: {
          year: a
        }
      }
    },
    strings: {
      title: function() {
        return $.mustache(MOMENTYEAR_TITLE, this)
      },
      groupName: MOMENTYEAR_GROUPNAME,
      itemName: MOMENTYEAR_ITEMNAME,
      itemsName: MOMENTYEAR_ITEMSNAME
    },
    respectSortOrderPref: !0
  }, c);
  _.defer(function() {
    PubHub.pub("Item/construct", d)
  })
}
$.extend(!0, MomentYear.prototype, Category.prototype);
MomentYear.prototype.match = function(a) {
  return a instanceof Moment && a.year === this.year
};
MomentYear.prototype.destruct = function() {
  var a = this;
  return Category.prototype.destruct.call(a).done(function() {
    PubHub.pub("Item/destruct", a)
  })
};
MomentYear.prototype.processFetchResponse = function(a) {
  Category.prototype.processFetchResponse.call(this, a);
  return _(a.events).map(function(b) {
    return Moments.get(b.eid) || new Moment(b.eid, b, null, null, "fetch")
  })
};
MomentYear.prototype.refile = function(a) {
  var b = _(this.items).indexOf(a),
    c = this.file(a);
  return 0 <= b ? (a.year !== this.year ? this.remove(a) : c !== b && (this.items.splice(b, 1), this.items.splice(c, 0, a), PubHub.pub("Group/refile", this, a)), !0) : !1
};

function MomentMonth(a, b, c, d) {
  MomentYear.call(this, a, c, d);
  $.extend(!0, this, {
    id: a + "-" + padStringToLength(b + 1, 2, "0", !0),
    groupName: "month",
    month: b,
    resources: {
      fetchItems: {
        resource: "moments",
        params: {
          year: void 0,
          startTimestamp: function() {
            return this.cursor ? void 0 : XDate.UTC(a, b + ("asc" !== this.sortOrder)) / 1E3
          },
          endTimestamp: function() {
            return this.cursor ? void 0 : XDate.UTC(a, b + ("asc" === this.sortOrder)) / 1E3
          }
        }
      }
    },
    strings: {
      title: function() {
        return $.mustache(MOMENTMONTH_TITLE, {
          month: MONTHS[this.month],
          year: this.year
        })
      },
      groupName: MOMENTMONTH_GROUPNAME
    }
  }, d)
}
$.extend(!0, MomentMonth.prototype, MomentYear.prototype);
MomentMonth.prototype.match = function(a) {
  return MomentYear.prototype.match.call(this, a) && a.timestamp.getMonth() === this.month
};
MomentMonth.prototype.refile = function(a) {
  var b = _(this.items).indexOf(a),
    c = this.file(a);
  return 0 <= b ? (a.year !== this.year || a.timestamp.getMonth() !== this.month ? this.remove(a) : c !== b && (this.items.splice(b, 1), this.items.splice(c, 0, a), PubHub.pub("Group/refile", this, a)), !0) : !1
};

function SourceYear(a, b, c) {
  var d = this;
  Category.call(d, b, c);
  $.extend(!0, d, {
    id: a,
    year: a,
    groupName: "year",
    contextSources: [],
    resources: {
      fetchItems: {
        resource: "sets",
        params: {
          year: a,
          limit: FETCH_LIMIT_SOURCES
        }
      }
    },
    strings: {
      title: function() {
        return $.mustache(SOURCEYEAR_TITLE, this)
      },
      groupName: SOURCEYEAR_GROUPNAME,
      itemName: SOURCEYEAR_ITEMNAME,
      itemsName: SOURCEYEAR_ITEMSNAME
    },
    respectSortOrderPref: !0
  }, c);
  d.contextSources = _(d.items).chain().pluck("filterSourceType").compact().uniq().value();
  _.defer(function() {
    PubHub.pub("Item/construct",
      d)
  })
}
$.extend(!0, SourceYear.prototype, Category.prototype);
SourceYear.prototype.match = function(a) {
  return a instanceof Set && a.year === this.year
};
SourceYear.prototype.destruct = function() {
  var a = this;
  return Category.prototype.destruct.call(a).done(function() {
    PubHub.pub("Item/destruct", a)
  })
};
SourceYear.prototype.add = function(a) {
  var b = this;
  return Category.prototype.add.call(b, a).done(function() {
    -1 === b.contextSources.indexOf(a.filterSourceType) && b.contextSources.push(a.filterSourceType)
  })
};
SourceYear.prototype.remove = function(a) {
  var b = this;
  return Category.prototype.remove.call(b, a).done(function() {
    _(b.items).findWhere({
      filterSourceType: a.filterSourceType
    }) || b.contextSources.splice(b.contextSources.indexOf(a.filterSourceType), 1)
  })
};
SourceYear.prototype.processFetchResponse = function(a) {
  Category.prototype.processFetchResponse.call(this, a);
  return _(a.albums).map(function(b) {
    return Sets.get(b.aid) || new Set(b.aid, b, null, null, "fetch")
  })
};
SourceYear.prototype.refile = function(a) {
  var b = _(this.items).indexOf(a),
    c = this.file(a);
  return 0 <= b ? (a.year !== this.year ? this.remove(a) : c !== b && (this.items.splice(b, 1), this.items.splice(c, 0, a), PubHub.pub("Group/refile", this, a)), !0) : !1
};

function SourceMonth(a, b, c, d) {
  SourceYear.call(this, a, c, d);
  $.extend(!0, this, {
    id: a + "-" + padStringToLength(b + 1, 2, "0", !0),
    month: b,
    groupName: "month",
    resources: {
      fetchItems: {
        resource: "sets",
        params: {
          year: void 0,
          startTimestamp: function() {
            return this.cursor ? void 0 : XDate.UTC(a, b + ("asc" !== this.sortOrder)) / 1E3
          },
          endTimestamp: function() {
            return this.cursor ? void 0 : XDate.UTC(a, b + ("asc" === this.sortOrder)) / 1E3
          }
        }
      }
    },
    strings: {
      title: function() {
        return $.mustache(SOURCEMONTH_TITLE, {
          month: MONTHS[this.month],
          year: this.year
        })
      },
      groupName: SOURCEMONTH_GROUPNAME
    }
  }, d)
}
$.extend(!0, SourceMonth.prototype, SourceYear.prototype);
SourceMonth.prototype.match = function(a) {
  return SourceYear.prototype.match.call(this, a) && a.timestamp.getMonth() === this.month
};
SourceMonth.prototype.refile = function(a) {
  var b = _(this.items).indexOf(a),
    c = this.file(a);
  return 0 <= b ? (a.year !== this.year || a.timestamp.getMonth() !== this.month ? this.remove(a) : c !== b && (this.items.splice(b, 1), this.items.splice(c, 0, a), PubHub.pub("Group/refile", this, a)), !0) : !1
};

function Grid(a, b, c) {
  var d = this;
  Group.call(d, a);
  $.extend(!0, d, {
    id: _.uniqueId("grid-"),
    title: !1,
    templates: {
      grid: {
        selector: "#template-grid",
        options: {
          title: function() {
            return this.title || !1
          },
          dimHiddenItems: function() {
            return this.dimHiddenItems
          },
          isDim: function() {
            return this.isDim
          }
        }
      },
      coverMessage: {
        selector: "#template-grid-coverMessage"
      }
    },
    columnsPerRow: !1,
    previewSize: !1,
    rowLimit: !1,
    previewLimit: !1,
    respectSortOrderPref: !1,
    sortOrder: "asc",
    respectShowHiddenPref: !1,
    showHiddenItems: !0,
    fileByTimestamp: !0,
    rollingScroll: !0,
    dimHiddenItems: !1,
    previewOptions: {}
  }, c, {
    selecting: !1,
    chunks: [],
    insertQueue: [],
    loadableTop: null,
    loadableBottom: null,
    isActive: !1,
    isEmpty: void 0,
    isDim: !1,
    spotlights: [],
    dogEars: []
  });
  d.previews = d.items;
  Procrastination.call(d);
  Subscriptions.call(d);
  TaskQueue.call(d);
  Templates.call(d);
  d.gridOf = b;
  _.defer(function() {
    d.subscribe("processGroupAdditions", "Group/add", function(b, a) {
      b === d.gridOf && d.processGroupAddition(a)
    });
    d.subscribe("processGroupRemovals", "Group/remove", function(b, a) {
      b === d.gridOf && d.processGroupRemoval(a)
    });
    d.subscribe("groupRefilings", "Group/refile", function(b, a) {
      b === d.gridOf && d.refile(a)
    });
    d.gridOf && _(d.gridOf.items).each(function(b) {
      d.add(b)
    });
    d.respectShowHiddenPref && d.setShowHiddenItems(Preferences.get("show_hidden"));
    d.subscribe("showHiddenPreference", "Preference/set", function(b, a) {
      d.respectShowHiddenPref && "show_hidden" === b && d.setShowHiddenItems(a)
    });
    d.respectSortOrderPref && d.setSortOrder(Preferences.get("sort_order"));
    d.subscribe("sortOrderPreference", "Preference/set", function(b, a) {
      d.respectSortOrderPref &&
        "sort_order" === b && d.setSortOrder(a)
    })
  });
  d.subscribe("processPreviewDestruction", "Preview/destruct", function(b) {
    0 <= d.items.indexOf(b) && d.remove(b)
  })
}
$.extend(!0, Grid.prototype, Group.prototype, Procrastination.prototype, Subscriptions.prototype, TaskQueue.prototype, Templates.prototype);
Grid.prototype.match = function(a) {
  return this.gridOf ? this.gridOf.hasItem(a) : !1
};
Grid.prototype.file = function(a) {
  var b = this;
  return b.fileByTimestamp ? _(b.items).sortedIndex(a, function(a) {
    return (a.previewOf.timestamp ? a.previewOf.timestamp.getTime() : 0) * ("asc" === b.sortOrder ? 1 : -1)
  }) : b.items.length
};
Grid.prototype.add = function(a) {
  var b = this,
    c;
  c = a.previewOf ? a : Previews.buildNew(b.id + "/" + a.id, a, b.previewType, $.extend(b.previewOptions, {
    isAwake: !b.rollingScroll
  }));
  return Group.prototype.add.call(b, c).done(function() {
    c.toggleSpotlight(_(b.spotlights).contains(c.previewOf.id));
    c.toggleDogEar(_(b.dogEars).contains(c.previewOf.id));
    b.layout()
  })
};
Grid.prototype.remove = function(a) {
  var b = this,
    c = a.previewOf ? a : Previews.get(b.id + "/" + a.id);
  return c ? Group.prototype.remove.call(b, c).done(function() {
    b.detach(c).always(function() {
      c.destruct()
    }).fail(function() {
      b.layout()
    })
  }) : $.rejected
};
Grid.prototype.refile = function(a) {
  var b = this,
    c = a.previewOf ? a : Previews.get(b.id + "/" + a.id);
  return c ? Group.prototype.refile.call(b, c).done(function() {
    b.isActive && b.detach(c)
  }) : $.rejected
};
Grid.prototype.processItemConstruct = function() {
  return $.rejected
};
Grid.prototype.processItemDestruct = function() {
  return $.rejected
};
Grid.prototype.destruct = function() {
  var a = this;
  return a.deactivate(!0).always(function() {
    a.destroyAllElements();
    _(a.previews).invoke("destruct");
    a.unsubscribeAll();
    _(function() {
      PubHub.pub("Grid/destruct", a)
    }).defer()
  })
};
Grid.prototype.processGroupAddition = function(a) {
  return this.match(a) ? this.add(a) : $.rejected
};
Grid.prototype.processGroupRemoval = function(a) {
  return this.getPreviewFor(a) ? this.remove(a) : $.rejected
};
Grid.prototype.getPreviewFor = function(a) {
  return this.get(this.id + "/" + a.id)
};
Grid.prototype.build = function() {
  var a = this;
  return a.buildElement("grid").done(function() {
    a.selecting && a.setSelectionUI(!0)
  })
};
Grid.prototype.activate = function() {
  var a = this,
    b = $.Deferred();
  !a.isActive && a.$grid ? (a.isActive = !0, a.layout().done(function() {
    var b;
    b = a.rollingScroll ? _(a.chunks).where({
      inViewport: !0
    }) : a.chunks;
    _(b).chain().pluck("previews").flatten().invoke("wake")
  }), a.subscribe("viewport", "Viewport/update", function(b) {
    b.deltas.columns || b.deltas.layoutSize || b.deltas.height && a.rowLimit ? a.layout(!0) : (b.deltas.top || b.deltas.height) && a.updateViewport()
  }), b.resolve()) : b.reject();
  return b.promise()
};
Grid.prototype.deactivate = function(a) {
  var b = this,
    c = $.Deferred();
  b.isActive ? (b.isActive = !1, a || b.updateViewport().always(function() {
    b.sleep()
  }), b.unsubscribe("viewport"), c.resolve()) : c.reject();
  return c.promise()
};
Grid.prototype.insert = function(a, b) {
  var c = this,
    d = $.Deferred();
  a.inGrid || a.pendingInsert ? d.reject() : (a.pendingInsert = !0, a.build().done(function() {
    c.queueTask("insert", a.id, function() {
      for (var b = a.$preview, d = _(c.previews).indexOf(a), g, d = d - 1; 0 <= d; d--)
        if (g = c.previews[d], g.inGrid) {
          b.insertAfter(g.$preview);
          a.inGrid = !0;
          break
        }
      a.inGrid || (b.prependTo(c.$grid.find(".grid-contents").eq(0)), a.inGrid = !0);
      c.selecting && (c.selectionHelper.shouldSelectAll || c.selectionHelper.selection.hasItem(a.previewOf)) && c.selectionHelper.select(a);
      a.pendingInsert = !1;
      PubHub.pub("Grid/insert", c, a)
    }) ? d.follow(c.procrastinate("insertAll", function() {
      var a = $.Deferred();
      c.executeAllTasks("insert").always(function() {
        b || c.layout();
        a.resolve()
      });
      return a.promise()
    }, [b])) : d.reject()
  }).fail(function() {
    d.reject()
  }));
  return d.promise()
};
Grid.prototype.detach = function(a, b) {
  var c = this,
    d = $.Deferred(),
    e;
  a.inGrid || a.pendingInsert ? a.pendingInsert ? (c.dequeueTask("insert", a.id), a.pendingInsert = !1, d.resolve()) : (e = c.queueTask("detach", a.id, function() {
    c.selecting && c.selectionHelper.deselect(a);
    a.$preview.detach();
    a.inGrid = !1;
    PubHub.pub("Grid/detach", c, a)
  })) ? d.follow(c.procrastinate("detachAll", function() {
    var a = $.Deferred();
    c.executeAllTasks("detach").always(function() {
      b || c.layout(!0);
      a.resolve()
    });
    return a.promise()
  })) : d.reject() : d.reject();
  return d.promise()
};
Grid.prototype.updateViewport = function(a) {
  var b = this;
  return a || b.rollingScroll ? b.procrastinate("updateViewport", function(a) {
    var d, e = Viewport.getTop(),
      f = Viewport.getHeight(),
      g = e - f,
      f = e + f + f,
      h = [],
      k = [];
    b.$grid && (d = b.$grid.offset().top, b.chunks.length && (a || g !== b.loadableTop || f !== b.loadableBottom) && (b.loadableTop = g, b.loadableBottom = f, _(b.chunks).each(function(a) {
      d + a.outerHeight >= b.loadableTop && d <= b.loadableBottom ? !0 !== a.inViewport && (a.inViewport = !0, d + a.outerHeight >= e ? _(a.previews).invoke("wake") : h.push(a)) : !1 !== a.inViewport && (a.inViewport = !1, k.push(a));
      d += a.outerHeight
    }), _(h.reverse()).each(function(b) {
      _(b.previews).invoke("wake")
    }), _(k).each(function(b) {
      _(b.previews).invoke("sleep")
    })))
  }, a, Viewport.isUpdatingHeavy() ? 100 : 0) : $.rejected
};
Grid.prototype.getPreviewsForLayout = function(a) {
  var b;
  b = this.showHiddenItems ? this.previews : _(this.previews).filter(function(b) {
    return !!b.previewOf.visibility
  });
  return a ? _(b).first(a) : b
};
Grid.prototype.getInsertedPreviews = function() {
  return _(this.previews).where({
    inGrid: !0
  })
};
Grid.prototype.setSortOrder = function(a) {
  var b = $.Deferred();
  _(["asc", "desc"]).contains(a) || (a = "asc");
  a !== this.sortOrder ? (this.sortOrder = a, this.isActive ? b.follow(this.layout()) : b.resolve()) : b.reject();
  return b.promise()
};
Grid.prototype.setShowHiddenItems = function(a) {
  var b = $.Deferred();
  a = !! a;
  a !== this.showHiddenItems ? (this.showHiddenItems = a, this.isActive ? b.follow(this.layout()) : b.resolve()) : b.reject();
  return b.promise()
};
Grid.prototype.layout = function(a) {
  var b = this;
  if (b.$grid && b.previews.length) return b.procrastinate("layout", function(a) {
      var d = 0,
        e, f, g, h, k, m;
      if (b.$grid && b.previews.length) {
        f = _(b).result("columnsPerRow") || Viewport.getColumns();
        g = _(b).result("previewSize") || Viewport.getLayoutSize();
        h = _(b).result("rowLimit") || !1;
        k = _(b).result("previewLimit") || !1;
        k = b.getPreviewsForLayout(k);
        m = b.getInsertedPreviews();
        if (!_(k).isEqual(m) || a) b.chunks = [], b.$grid.attr({
          "data-layout-size": g,
          "data-columns": f,
          "data-row-limit": h
        }),
        _(m).chain().difference(k).each(function(a) {
          b.detach(a, !0)
        }), _(k).each(function(a) {
          if (!e || e.isFull) {
            if (!1 !== h && d >= h) return b.detach(a, !0), !1;
            a.changeSize(g);
            e = {
              previews: [],
              inViewport: void 0,
              totalColumns: 0,
              rows: 1,
              isFull: !1,
              outerHeight: a.dimensions.height + a.dimensions.marginBottom
            };
            b.chunks.push(e)
          } else a.changeSize(g);
          a.inGrid || a.pendingInsert || b.insert(a, !0);
          e.previews.push(a);
          e.totalColumns += a.dimensions.columns;
          e.totalColumns >= f && (e.isFull = !0, d += e.rows);
          return !0
        });
        b.checkEmptiness();
        b.updateViewport(!0)
      }
    },
    a);
  b.chunks = [];
  b.checkEmptiness();
  return $.rejected
};
Grid.prototype.measureHeight = function() {
  var a = 0;
  _(this.chunks).each(function(b) {
    a += b.outerHeight
  });
  return a
};
Grid.prototype.checkEmptiness = function() {
  var a = !this.getPreviewsForLayout().length;
  this.isEmpty !== a && (this.isEmpty = a, this.$grid && this.$grid.toggleClass("empty", a), PubHub.pub("Grid/markEmpty", this, a));
  return this.isEmpty
};
Grid.prototype.wake = function() {
  _(this.previews).invoke("wake")
};
Grid.prototype.sleep = function() {
  _(this.previews).invoke("sleep")
};
Grid.prototype.startSelection = function(a) {
  var b = this;
  if (b.selecting) return !1;
  b.selecting = !0;
  b.selectionHelper = {
    selection: a,
    shouldSelectAll: a.selectAll,
    select: function(b) {
      a.add(b.previewOf);
      b.$preview && b.$preview.addClass("selected")
    },
    deselect: function(b) {
      a.remove(b.previewOf);
      b.$preview && b.$preview.removeClass("selected")
    },
    toggle: function(c) {
      a.hasItem(c.previewOf) ? b.selectionHelper.deselect(c) : b.selectionHelper.select(c)
    },
    selectAll: function(a) {
      b.selectionHelper.shouldSelectAll = !0;
      a = a ? _(b.getInsertedPreviews()).filter(function(b) {
        return 0 <
          b.previewOf.visibility
      }) : b.getInsertedPreviews();
      _(a).each(function(a) {
        b.selectionHelper.select(a)
      })
    },
    deselectAll: function() {
      b.selectionHelper.shouldSelectAll = !1;
      _(b.getInsertedPreviews()).each(function(a) {
        b.selectionHelper.deselect(a)
      })
    }
  };
  a.selectAll ? b.selectionHelper.selectAll( !! b.dimHiddenItems) : _(a.items).each(function(a) {
    (a = b.getPreviewFor(a)) && b.selectionHelper.select(a)
  });
  b.subscribe("selectionAddition", "Group/add", function(c, d) {
    var e = b.getPreviewFor(d);
    c === a && e && b.selectionHelper.select(e)
  });
  b.subscribe("selectionRemoval", "Group/remove", function(c, d) {
    var e = b.getPreviewFor(d);
    c === a && e && b.selectionHelper.deselect(e)
  });
  b.setSelectionUI(!0);
  return b.selectionHelper
};
Grid.prototype.setSelectionUI = function(a) {
  var b = this;
  return b.$grid ? b.procrastinate("setSelectionUI", function() {
    a ? (b.$grid.addClass("selectionMode"), b.$grid.on("click.selection", ".preview .preview-checkMark", function(a) {
      a = $(this).parents(".preview").data("previewOf");
      a = b.getPreviewFor(a);
      b.selectionHelper.toggle(a);
      return !1
    })) : b.$grid.removeClass("selectionMode").off("click.selection")
  }) : $.rejected
};
Grid.prototype.endSelection = function() {
  var a, b;
  return this.selecting ? (a = this.getSelectedPreviews(), b = _(a).pluck("previewOf"), this.selecting = !1, delete this.selectionHelper, this.unsubscribe("selectionAddition", "selectionRemoval"), this.setSelectionUI(!1), _(a).each(function(b) {
    b.$preview.removeClass("selected")
  }), b) : !1
};
Grid.prototype.getSelectedPreviews = function() {
  return this.selecting ? _(this.getInsertedPreviews()).filter(function(a) {
    return a.$preview.hasClass("selected")
  }) : []
};
Grid.prototype.scrollToItem = function(a) {
  var b = this;
  a && b.isActive && b.layout().done(function() {
    var c = _(b.getInsertedPreviews()).find(function(b) {
      return b.previewOf.id === a
    });
    c && $.scrollTo(c.$preview, {
      offset: {
        top: -1 * Math.max((Viewport.getHeight() - c.dimensions.height) / 2, NAVBAR_HEIGHT + 10)
      }
    })
  })
};
Grid.prototype.addSpotlight = function(a) {
  a && !_(this.spotlights).contains(a) && (this.spotlights.push(a), _(this.previews).chain().filter(function(b) {
    return b.previewOf.id === a
  }).invoke("toggleSpotlight", !0))
};
Grid.prototype.removeSpotlight = function(a) {
  var b = _(this.spotlights).indexOf(a);
  a && 0 <= b && (this.spotlights.splice(b, 1), _(this.previews).chain().filter(function(b) {
    return b.previewOf.id === a
  }).invoke("toggleSpotlight", !1))
};
Grid.prototype.addDogEar = function(a) {
  a && !_(this.dogEars).contains(a) && (this.dogEars.push(a), _(this.previews).chain().filter(function(b) {
    return b.previewOf.id === a
  }).invoke("toggleDogEar", !0))
};
Grid.prototype.removeDogEar = function(a) {
  var b = _(this.dogEars).indexOf(a);
  a && 0 <= b && (this.dogEars.splice(b, 1), _(this.previews).chain().filter(function(b) {
    return b.previewOf.id === a
  }).invoke("toggleDogEar", !1))
};
Grid.prototype.dim = function() {
  this.isDim = !0;
  this.$grid && this.$grid.toggleClass("dim", this.isDim)
};
Grid.prototype.undim = function() {
  this.isDim = !1;
  this.$grid && this.$grid.toggleClass("dim", this.isDim)
};
Grid.prototype.buildCoverMessage = function(a) {
  function b() {
    c.buildElement("coverMessage", a).done(function(b) {
      c.dim();
      b.appendTo(c.$grid);
      if (a.dismissButton) b.on("click", function() {
        c.destroyCoverMessage()
      })
    }).fail(function() {
      d.reject()
    })
  }
  var c = this,
    d = $.Deferred();
  c.$coverMessage ? c.destroyCoverMessage().always(b) : b();
  return d.promise()
};
Grid.prototype.destroyCoverMessage = function() {
  return this.$coverMessage ? (this.undim(), this.destroyElement("coverMessage"), $.resolved) : $.rejected
};

function PhotoGrid(a, b, c) {
  var d = this;
  Grid.call(d, a, b, c);
  $.extend(!0, d, {
    dropCap: !1,
    dropCapsInChunk: function(b) {
      return b ? 0 : 1
    },
    templates: {
      grid: {
        options: {
          extraClasses: "photoGrid"
        }
      }
    },
    previewType: "photo",
    handlePhotoViewer: !1
  }, c);
  d.subscribe("photoVisibility", "Photo/set/visibility", function(b) {
    d.getPreviewFor(b) && d.layout()
  });
  d.subscribe("photoOrientation", "Photo/set/orientation", function(b) {
    d.getPreviewFor(b) && d.layout(!0)
  })
}
$.extend(!0, PhotoGrid.prototype, Grid.prototype);
PhotoGrid.prototype.file = function(a) {
  var b = this;
  return b.fileByTimestamp ? _(b.items).sortedIndex(a, function(a) {
    return (a.previewOf.unixTimestamp || 0) * ("asc" === b.sortOrder ? 1 : -1)
  }) : b.items.length
};
PhotoGrid.prototype.build = function() {
  var a = this;
  return Grid.prototype.build.call(a).done(function() {
    if (a.$grid && a.handlePhotoViewer) a.$grid.on("click", ".photoPreview", function() {
      var b = Photos.get($(this).data("photo-id"));
      PhotoViewer.activate(b, a, !0);
      return !1
    })
  })
};
PhotoGrid.prototype.deactivate = function(a) {
  var b = this;
  return Grid.prototype.deactivate.call(b, a).done(function() {
    b.handlePhotoViewer && (PhotoViewer.isActive && PhotoViewer.supplier === b) && PhotoViewer.deactivate(!0)
  })
};
PhotoGrid.prototype.layout = function(a) {
  var b = this;
  if (b.$grid && b.previews.length) return b.procrastinate("layout", function() {
    function c(a, d, e) {
      var h, k = 0;
      _(a).each(function(a) {
        var c = {
          p: a,
          columns: a.naturalColumns
        };
        if (!h || h.isFull) {
          if (!1 !== g && k >= g) return b.detach(a, !0), !0;
          a.changeSize(f);
          h = {
            previewData: [],
            inViewport: void 0,
            rows: 1,
            isFull: !1,
            numDropCaps: 0,
            outerHeight: a.dimensions.height + a.dimensions.marginBottom
          };
          b.chunks.push(h)
        } else a.changeSize(f);
        a.inGrid || a.pendingInsert || b.insert(a, !0);
        h.previewData.push(c);
        b.dropCap && !e && (!g || k + 2 <= g) && (h.numDropCaps || 0) < (_(b.dropCapsInChunk).isFunction() ? b.dropCapsInChunk(_(b.chunks).indexOf(h)) : b.dropCapsInChunk) && (1 === h.previewData.length || h.previewData[h.previewData.length - 2].isDropCap) && 2 * a.naturalColumns < (h.nonDropCapColumns || d) ? (c.isDropCap = !0, c.columns *= 2, h.rows = 2, h.outerHeight = 2 * (a.dimensions.height + a.dimensions.marginBottom), h.numDropCaps = (h.numDropCaps || 0) + 1, h.dropCapColumns = (h.dropCapColumns || 0) + c.columns, h.nonDropCapColumns = d - h.dropCapColumns, h.row1Columns =
          0, h.row2Columns = 0) : h.totalColumns = (h.totalColumns || 0) + c.columns;
        h.numDropCaps ? (c.isDropCap || (h.row1Columns < h.nonDropCapColumns ? (c.inRow1 = !0, h.row1Columns += c.columns) : h.row2Columns < h.nonDropCapColumns && (c.inRow2 = !0, h.row2Columns += c.columns)), h.row1Columns >= h.nonDropCapColumns && h.row2Columns >= h.nonDropCapColumns && (h.isFull = !0, k += h.rows)) : h.totalColumns && h.totalColumns >= d && (h.isFull = !0, k += h.rows);
        return !0
      });
      h.numDropCaps && !h.isFull && (b.chunks.pop(), c(_(h.previewData).pluck("p"), d, !0))
    }

    function d(b, a,
      c) {
      var d, e;
      a -= c;
      c = 0;
      d = 1;
      for (e = _(b).chain().pluck("columns").max().value(); 0 < a;) b[c].columns === e && (b[c].columns--, a--), 0 < d ? c >= b.length - 1 ? (d = -1, e--) : c++ : 0 >= c ? (d = 1, e--) : c--
    }
    var e, f, g, h, k;
    if (b.$grid && b.previews.length) {
      e = _(b).result("columnsPerRow");
      _(e).isNumber() || (e = Viewport.getColumns());
      f = _(b).result("previewSize") || Viewport.getLayoutSize();
      g = _(b).result("rowLimit") || !1;
      h = _(b).result("previewLimit");
      _(h).isNumber() || (h = void 0);
      h = b.getPreviewsForLayout(h);
      k = b.getInsertedPreviews();
      if (!_(h).isEqual(k) ||
        a) b.chunks = [], b.queueTask("layoutGrid", "gridAttributes", function() {
        b.$grid.attr({
          "data-layout-size": f,
          "data-columns": e,
          "data-row-limit": g
        })
      }), _(k).chain().difference(h).each(function(a) {
        b.detach(a, !0)
      }), c(h, e), _(b.chunks).each(function(a) {
        a.numDropCaps ? (d(_(a.previewData).where({
          inRow1: !0
        }), a.row1Columns, a.nonDropCapColumns), d(_(a.previewData).where({
          inRow2: !0
        }), a.row2Columns, a.nonDropCapColumns)) : d(a.previewData, a.totalColumns, e);
        _(a.previewData).each(function(a) {
          b.queueTask("layoutGrid", a.p.id,
            function() {
              a.p.setColumns(a.columns);
              a.p.toggleDropCap( !! a.isDropCap)
            })
        });
        a.previews = _(a.previewData).pluck("p");
        delete a.previewData
      }), b.executeAllTasks("layoutGrid");
      b.checkEmptiness();
      b.updateViewport(!0)
    }
  }, [a]);
  b.chunks = [];
  b.checkEmptiness();
  return $.rejected
};
PhotoGrid.prototype.getPhotosForViewer = function() {
  return _(this.getInsertedPreviews()).chain().filter(function(a) {
    return a.previewOf instanceof Photo
  }).pluck("previewOf").value()
};
PhotoGrid.prototype.selectItemForViewer = function(a, b) {
  var c, d, e, f, g, h = $.Deferred();
  b = 0 + b || 0;
  c = _(this.getInsertedPreviews()).pluck("previewOf");
  d = c.length;
  e = a ? _(c).indexOf(a) : 0;
  0 <= e ? (e = e + b + d, f = c[e % d], g = void 0, f === a && b ? h.reject() : (1 < d && (g = c[(e + 1) % d]), h.resolve(f, g, 0 === e % d, e % d === d - 1))) : h.reject();
  return h.promise()
};

function ContextGrid(a, b, c) {
  var d = this;
  Grid.call(d, a, b, c);
  $.extend(!0, d, {
    templates: {
      grid: {
        options: {
          extraClasses: "contextGrid"
        }
      }
    },
    previewType: "context"
  }, c);
  d.subscribe("contextVisibility", "Context/set/visibility", function(b) {
    d.getPreviewFor(b) && d.layout()
  })
}
$.extend(!0, ContextGrid.prototype, Grid.prototype);
ContextGrid.prototype.setSelectionUI = function(a) {
  var b = this;
  return b.$grid ? b.procrastinate("setSelectionUI", function() {
    a ? (b.$grid.addClass("selectionMode"), b.$grid.on("click.selection", ".preview", function(a) {
      a = $(this).data("previewOf");
      a = b.getPreviewFor(a);
      b.selectionHelper.toggle(a);
      return !1
    })) : b.$grid.removeClass("selectionMode").off("click.selection")
  }) : $.rejected
};

function SemanticGrid(a, b, c, d) {
  PhotoGrid.call(this, a, b, d);
  $.extend(!0, this, {
    tag: c,
    previewType: "semanticPhoto",
    previewOptions: {
      tag: c
    }
  }, d)
}
$.extend(!0, SemanticGrid.prototype, PhotoGrid.prototype);

function TodayGrid(a, b, c) {
  PhotoGrid.call(this, a, b, c);
  $.extend(!0, this, {
    dropCap: !0,
    dropCapsInChunk: 2,
    previewOptions: {
      features: {
        absoluteDate: !1,
        relativeDate: !1,
        todayDate: !0
      }
    }
  }, c)
}
$.extend(!0, TodayGrid.prototype, PhotoGrid.prototype);
TodayGrid.prototype.file = function(a) {
  return _(this.items).sortedIndex(a, function(b) {
    var a, d;
    return b.previewOf.timestamp ? (a = (new XDate(!0)).getFullYear(), d = b.previewOf.timestamp.getFullYear(), b = b.previewOf.timestamp.clone().setFullYear(2013).getTime(), b * (a - d)) : 0
  })
};
TodayGrid.prototype.layout = function(a) {
  var b = this;
  if (b.$grid && b.previews.length) return b.procrastinate("layout", function() {
    function c(a, d, e) {
      var g = {
        previewData: [],
        inViewport: void 0,
        rows: 2,
        columnsPerRow: d,
        isFull: !1,
        numDropCaps: 0,
        dropCapColumns: 0,
        availableNonDropCapColumns: d,
        row1Columns: 0,
        row2Columns: 0
      };
      b.chunks.push(g);
      _(a).each(function(c) {
        var h = {
          p: c,
          columns: c.naturalColumns
        };
        g.isFull ? b.detach(c, !0) : (c.changeSize(f), c.inGrid || c.pendingInsert || b.insert(c, !0), g.previewData.push(h), g.outerHeight || (g.outerHeight =
            2 * (c.dimensions.height + c.dimensions.marginBottom)), b.dropCap && (g.numDropCaps < e && (1 === g.previewData.length || g.previewData[g.previewData.length - 2].isDropCap) && (a.length <= e || 2 * c.naturalColumns < (g.nonDropCapColumns || d))) && (h.isDropCap = !0, h.columns *= 2, g.numDropCaps++, g.dropCapColumns += h.columns, g.availableNonDropCapColumns -= h.columns), h.isDropCap || (g.row1Columns < g.availableNonDropCapColumns ? (h.inRow1 = !0, g.row1Columns += h.columns) : g.row2Columns < g.availableNonDropCapColumns && (h.inRow2 = !0, g.row2Columns += h.columns)),
          1 === a.length && g.dropCapColumns >= g.columnsPerRow ? g.isFull = !0 : g.previewData.length > g.numDropCaps && g.row1Columns >= g.availableNonDropCapColumns && g.row2Columns >= g.availableNonDropCapColumns ? g.isFull = !0 : g.numDropCaps === e && g.dropCapColumns >= g.columnsPerRow && (g.isFull = !0))
      });
      g.isFull || (b.chunks.pop(), 3 >= a.length ? e < g.previewData.length ? c(a, d, e + 1) : c(a, d - 4, e) : 1 === e && 1 === g.numDropCaps ? c(a, d, 2) : c(a, d - 4, 1))
    }

    function d(b, a, c) {
      var d, e;
      a -= c;
      c = 0;
      d = 1;
      for (e = _(b).chain().pluck("columns").max().value(); 0 < a;) b[c].columns !==
        e || b[c].isDropCap && 4 >= b[c].columns || (b[c].columns--, a--), 0 < d ? c >= b.length - 1 ? (d = -1, e--) : c++ : 0 >= c ? (d = 1, e--) : c--
    }
    var e, f, g, h, k;
    if (b.$grid && b.previews.length) {
      e = _(b).result("columnsPerRow") || Viewport.getColumns();
      f = _(b).result("previewSize") || Viewport.getLayoutSize();
      g = _(b).result("rowLimit") || !1;
      h = _(b).result("previewLimit") || void 0;
      h = b.getPreviewsForLayout(h);
      k = b.getInsertedPreviews();
      if (!_(h).isEqual(k) || a) b.chunks = [], b.queueTask("layoutGrid", "gridAttributes", function() {
        b.$grid.attr({
          "data-layout-size": f,
          "data-columns": e,
          "data-row-limit": g
        })
      }), _(k).chain().difference(h).each(function(a) {
        b.detach(a, !0)
      }), c(h, e, 3 >= h.length ? 2 : 1), e = b.chunks[0].columnsPerRow, 0 < b.chunks[0].availableNonDropCapColumns ? (d(_(b.chunks[0].previewData).where({
        inRow1: !0
      }), b.chunks[0].row1Columns, b.chunks[0].availableNonDropCapColumns), d(_(b.chunks[0].previewData).where({
        inRow2: !0
      }), b.chunks[0].row2Columns, b.chunks[0].availableNonDropCapColumns)) : d(b.chunks[0].previewData, b.chunks[0].dropCapColumns, e), _(b.chunks[0].previewData).each(function(a) {
        b.queueTask("layoutGrid",
          a.p.id, function() {
            a.p.setColumns(a.columns);
            a.p.toggleDropCap( !! a.isDropCap)
          })
      }), b.chunks[0].previews = _(b.chunks[0].previewData).pluck("p"), delete b.chunks[0].previewData, b.executeAllTasks("layoutGrid");
      b.checkEmptiness();
      b.updateViewport(!0)
    }
  }, [a]);
  b.rows = [];
  b.checkEmptiness();
  return $.rejected
};

function Preview(a, b, c) {
  $.extend(!0, this, {
    templates: {
      preview: {
        options: {
          isHidden: function() {
            return !this.previewOf.visibility
          },
          isSpotlight: function() {
            return this.isSpotlight
          },
          isDogEarred: function() {
            return this.isDogEarred
          },
          size: function() {
            return this.size
          }
        }
      }
    },
    isAwake: !0,
    size: null
  }, c, {
    id: a,
    builtOnce: !1,
    inGrid: !1,
    isSpotlight: !1,
    isDogEarred: !1
  });
  this.previewOf = b;
  this.prototypeDimensions = Preview.prototype.dimensions;
  this.dimensions = $.extend({}, this.prototypeDimensions[this.size]);
  Subscriptions.call(this);
  Templates.call(this);
  Strings.call(this)
}
$.extend(!0, Preview.prototype, Subscriptions.prototype, Templates.prototype, Strings.prototype);
Preview.prototype.dimensions = {};
Preview.prototype.build = function() {
  var a = this,
    b = a.$preview;
  return a.constructPreview().done(function(c) {
    c && (a.$preview = c, c.data("previewOf", a.previewOf), b && b.empty().replaceWith(a.$preview), a.isAwake && (a.isAwake = !1, a.wake()), a.builtOnce ? PubHub.pub("Preview/rebuild", a, a.previewOf) : (a.builtOnce = !0, PubHub.pub("Preview/build", a, a.previewOf)))
  })
};
Preview.prototype.constructPreview = function() {
  return this.buildElement("preview", null, !0)
};
Preview.prototype.changeSize = function(a) {
  return a !== this.size && this.prototypeDimensions[a] ? (this.size = a, this.dimensions = $.extend({}, this.prototypeDimensions[this.size]), this.build(), !0) : !1
};
Preview.prototype.destruct = function() {
  var a = this;
  a.unsubscribeAll();
  a.$preview && a.$preview.empty().remove();
  _(function() {
    PubHub.pub("Preview/destruct", a, a.previewOf)
  }).defer();
  return $.resolved
};
Preview.prototype.toggleSpotlight = function(a) {
  this.isSpotlight !== a && (this.isSpotlight = !! a, this.$preview && this.$preview.toggleClass("spotlight", !! a))
};
Preview.prototype.toggleDogEar = function(a) {
  this.isDogEarred !== a && (this.isDogEarred = !! a, this.$preview && this.$preview.toggleClass("dogEarred", !! a))
};
Preview.prototype.wake = function() {
  this.isAwake || (this.isAwake = !0)
};
Preview.prototype.sleep = function() {
  this.isAwake && (this.isAwake = !1)
};

function PhotoPreview(a, b, c) {
  var d = this;
  Preview.call(d, a, b, c);
  $.extend(!0, d, {
      features: {
        hide: !1,
        feedback: !1,
        dateTray: !1,
        relativeDate: !0,
        absoluteDate: !0,
        jumpToMoment: !0,
        todayDate: !1
      },
      templates: {
        preview: {
          selector: "#template-photoPreview",
          options: {
            photoID: b.id,
            columns: function() {
              return this.columns
            },
            isDropCap: function() {
              return this.isDropCap
            },
            features: function() {
              var b = $.extend({}, this.features);
              b.jumpToMoment = b.jumpToMoment && !! this.previewOf.timestamp;
              return b
            },
            relativeDate: function() {
              return this.previewOf.timestamp instanceof
              XDate ? this.previewOf.timestamp.relativeToNow() : PHOTO_UNDATED_TITLE
            },
            absoluteDate: function() {
              return this.previewOf.timestamp instanceof XDate ? this.previewOf.timestamp.toString(PHOTO_PREVIEW_DATE_FORMAT) : !1
            },
            yearsAgo: function() {
              return this.previewOf.timestamp instanceof XDate ? this.previewOf.timestamp.relativeToNow("year", null, "year", null) : !1
            },
            dayOfWeek: function() {
              return this.previewOf.timestamp instanceof XDate ? this.previewOf.timestamp.toString("dddd, MMM d") : !1
            }
          }
        }
      },
      isAwake: !1,
      size: "standard",
      columns: 2
    },
    c, {
      isDropCap: !1,
      thumbnailSrc: null
    });
  d.prototypeDimensions = PhotoPreview.prototype.dimensions;
  d.dimensions = $.extend({}, d.prototypeDimensions[d.size]);
  d.updateNaturalColumns();
  d.subscribe("photoVisibility", "Photo/set/visibility", function(b, a) {
    b === d.previewOf && d.$preview && d.$preview.toggleClass("hidden", !a)
  });
  d.subscribe("photoOrientation", "Photo/set/orientation", function(b, a) {
    b === d.previewOf && d.$preview && (d.updateNaturalColumns(), d.build())
  });
  d.subscribe("photoTimestamp", "Photo/set/timestamp", function(b,
    a) {
    var c = d.templates.preview.options.includeDate;
    b === d.previewOf && (d.$previewv && (_(c).isFunction() ? c() : c)) && d.build()
  })
}
$.extend(!0, PhotoPreview.prototype, Preview.prototype);
PhotoPreview.prototype.dimensions = {
  standard: {
    width: 0,
    height: 225,
    marginLeft: 12,
    marginBottom: 12,
    columnWidth: 66
  },
  small: {
    width: 0,
    height: 138,
    marginLeft: 8,
    marginBottom: 8,
    columnWidth: 40
  },
  mini: {
    width: 0,
    height: 113,
    marginLeft: 4,
    marginBottom: 4,
    columnWidth: 35
  }
};
PhotoPreview.prototype.build = function() {
  var a = this,
    b = a.$preview ? a.$preview.hasClass("selected") : !1;
  return Preview.prototype.build.call(a).done(function(c) {
    a.$preview.toggleClass("selected", b)
  })
};
PhotoPreview.prototype.constructPreview = function() {
  var a = this,
    b = a.previewOf;
  return a.buildElement("preview", {}, !0).done(function(c) {
    var d, e;
    c.width(a.dimensions.width);
    c.on("click", function(a) {
      return a.altKey ? (b.showFullInfo(), !1) : !0
    });
    a.features.hide && (c.find(".photoPreview-visibilityControls").on("click", function() {
      return !1
    }), d = c.find(".photoPreview-visibilityControls .spinner").spinner(), c.find(".photoPreview-hide").on("click", function() {
      c.addClass("visibilityPending");
      d.show();
      b.hide().always(function() {
        c.removeClass("visibilityPending");
        d.hide()
      })
    }), c.find(".photoPreview-show").on("click", function() {
      c.addClass("visibilityPending");
      d.show();
      b.unhide().always(function() {
        c.removeClass("visibilityPending");
        d.hide()
      })
    }));
    a.features.feedback && !Modernizr.touch && (e = c.find(".photoPreview-feedback > .bubble").bubble(), c.find(".photoPreview-feedback").on({
      mouseenter: function() {
        e.open()
      },
      mouseleave: function() {
        e.close()
      }
    }));
    if (a.features.jumpToMoment) c.find(".photoPreview-jumpTo").on("click", function() {
      Moments.jumpTo(a.previewOf.id).fail(function() {
        MessageBars.buildNew(MOMENT_JUMPTO_MESSAGE_ERROR, {
          extraClasses: "alert"
        })
      });
      return !1
    });
    a.$frame = c.find(".photoPreview-frame");
    a.$thumbnail = a.$frame.find(".photoPreview-thumbnail").detach()
  })
};
PhotoPreview.prototype.setWidth = function(a) {
  this.dimensions.width !== a && (this.dimensions.width = a, this.$preview && this.$preview.width(a))
};
PhotoPreview.prototype.setColumns = function(a) {
  this.columns = a;
  this.setWidth((this.dimensions.columnWidth + this.dimensions.marginLeft) * a - this.dimensions.marginLeft);
  this.$preview && this.$preview.attr("data-columns", a)
};
PhotoPreview.prototype.updateNaturalColumns = function() {
  this.naturalColumns = 1 > this.previewOf.aspectRatio ? 2 : 1.333 > this.previewOf.aspectRatio ? 3 : 1.7 > this.previewOf.aspectRatio ? 4 : 5
};
PhotoPreview.prototype.toggleDropCap = function(a) {
  this.isDropCap !== a && (this.isDropCap = !! a, this.$preview && (this.$preview.toggleClass("dropCap", !! a), this.buildThumbnail()))
};
PhotoPreview.prototype.buildThumbnail = function() {
  var a = this,
    b = Thumbnails.generateURL(a.previewOf.thumbnailID, a.isDropCap ? THUMBNAIL_SIZE_PHOTOPREVIEW_DROPCAP : THUMBNAIL_SIZE_PHOTOPREVIEW);
  a.thumbnailSrc = b;
  Thumbnails.queueDownload(b).done(function() {
    var c = a.$thumbnail.css("backgroundImage");
    $(this).off("load");
    a.isAwake && a.thumbnailSrc === b && (a.$thumbnail.css("backgroundImage", "url('" + b + "')").appendTo(a.$frame), !Modernizr.cssanimations || (Viewport.isUpdating() || c) || (a.$thumbnail.addClass("justLoaded"),
      setTimeout(function() {
        a.$thumbnail.removeClass("justLoaded")
      }, IMAGE_FADEIN_DURATION)))
  })
};
PhotoPreview.prototype.wake = function() {
  var a = this;
  a.isAwake || (a.isAwake = !0, Viewport.isUpdating() ? setTimeout(function() {
    a.isAwake && a.buildThumbnail()
  }, 200) : a.buildThumbnail())
};
PhotoPreview.prototype.sleep = function() {
  this.isAwake && (this.isAwake = !1, this.$thumbnail && (this.$thumbnail.detach(), Thumbnails.dequeueDownload(this.thumbnailSrc)))
};

function ContextPreview(a, b, c) {
  var d = this;
  Preview.call(d, a, b, c);
  $.extend(!0, d, {
    templates: {
      preview: {
        selector: "#template-contextPreview",
        options: {
          viewID: "",
          groupName: function() {
            return this.previewOf.makeString("groupName")
          },
          photoCount: function() {
            return this.previewOf.photoCount
          },
          isUnread: function() {
            return 2 === this.previewOf.visibility
          },
          direction: Math.abs(getHashCode(b.id)) % 2 ? "left" : "right"
        }
      }
    },
    isAwake: !1,
    size: "standard"
  }, c);
  d.prototypeDimensions = ContextPreview.prototype.dimensions;
  d.dimensions = $.extend({},
    d.prototypeDimensions[d.size]);
  d.subscribe("contextVisibility", "Context/set/visibility", function(b, a) {
    b === d.previewOf && d.$preview && (d.$preview.toggleClass("hidden", !a), d.$preview.toggleClass("unread", 2 === a))
  });
  d.subscribe("contextDetails", "Context/set/timestamp Context/set/photoCount Context/set/keyPhotos", function(b) {
    b === d.previewOf && d.build()
  })
}
$.extend(!0, ContextPreview.prototype, Preview.prototype);
ContextPreview.prototype.dimensions = {
  standard: {
    width: 300,
    height: 200,
    marginBottom: 12,
    columns: 4,
    maxKeyPhotos: 5,
    orientQuad: !0,
    thumbContainerDimensions: {
      1: [{
        width: 302,
        height: 202
      }],
      2: [{
        width: 202,
        height: 202
      }, {
        width: 202,
        height: 202
      }],
      3: [{
        width: 202,
        height: 202
      }, {
        width: 202,
        height: 102
      }, {
        width: 202,
        height: 102
      }],
      4: [{
        width: 202,
        height: 202
      }, {
        width: 202,
        height: 202
      }, {
        width: 102,
        height: 102
      }, {
        width: 102,
        height: 102
      }],
      5: [{
        width: 202,
        height: 202
      }, {
        width: 102,
        height: 102
      }, {
        width: 102,
        height: 102
      }, {
        width: 102,
        height: 102
      }, {
        width: 102,
        height: 102
      }]
    }
  },
  small: {
    width: 184,
    height: 122,
    marginBottom: 8,
    columns: 4,
    maxKeyPhotos: 5,
    orientQuad: !0,
    thumbContainerDimensions: {
      1: [{
        width: 186,
        height: 124
      }],
      2: [{
        width: 124,
        height: 124
      }, {
        width: 124,
        height: 124
      }],
      3: [{
        width: 124,
        height: 124
      }, {
        width: 124,
        height: 62
      }, {
        width: 124,
        height: 62
      }],
      4: [{
        width: 124,
        height: 124
      }, {
        width: 124,
        height: 124
      }, {
        width: 62,
        height: 62
      }, {
        width: 62,
        height: 62
      }],
      5: [{
        width: 124,
        height: 124
      }, {
        width: 62,
        height: 62
      }, {
        width: 62,
        height: 62
      }, {
        width: 62,
        height: 62
      }, {
        width: 62,
        height: 62
      }]
    }
  },
  mini: {
    width: 300,
    height: 100,
    marginBottom: 20,
    columns: 12,
    maxKeyPhotos: 4,
    thumbContainerDimensions: {
      1: [{
        width: 302,
        height: 102
      }],
      2: [{
        width: 202,
        height: 102
      }, {
        width: 202,
        height: 102
      }],
      3: [{
        width: 202,
        height: 102
      }, {
        width: 102,
        height: 102
      }, {
        width: 102,
        height: 102
      }],
      4: [{
        width: 102,
        height: 102
      }, {
        width: 102,
        height: 102
      }, {
        width: 102,
        height: 102
      }, {
        width: 102,
        height: 102
      }]
    }
  }
};
ContextPreview.prototype.constructPreview = function() {
  var a = this;
  return a.buildElement("preview", null, !0).done(function(b) {
    a.$frame = b.find(".contextPreview-frame");
    a.$thumbContainer = a.$frame.find(".contextPreview-thumbnails").detach();
    a.thumbnailCSS = [];
    a.transformOrigins = [];
    a.thumbnailEls = [];
    a.keyPhotoCount = Math.min(a.dimensions.maxKeyPhotos, a.previewOf.keyPhotos.countItems());
    if (1 === a.keyPhotoCount) a.$thumbContainer.addClass("single");
    else if (1 < a.keyPhotoCount) switch (a.$thumbContainer.addClass("shift-" +
      (a.templates.preview.options.direction || "left")), a.keyPhotoCount) {
      case 2:
        a.$thumbContainer.addClass("double");
        break;
      case 3:
        a.$thumbContainer.addClass("triple");
        break;
      case 4:
        a.dimensions.orientQuad ? a.previewOf.keyPhotos.items[1].width >= a.previewOf.keyPhotos.items[1].height ? a.$thumbContainer.addClass("quad-landscape") : a.$thumbContainer.addClass("quad-portrait") : a.$thumbContainer.addClass("quad");
        break;
      default:
        a.$thumbContainer.addClass("quint")
    } else a.$thumbContainer.addClass("empty");
    _(a.previewOf.keyPhotos.items).each(function(b,
      d) {
      if (d < a.dimensions.maxKeyPhotos) {
        var e;
        e = $("<span/>", {
          "class": "contextPreview-thumbnail-frame"
        });
        $("<span/>", {
          "class": "contextPreview-thumbnail"
        }).appendTo(e);
        e.appendTo(a.$thumbContainer);
        a.thumbnailEls.push(e);
        return !0
      }
      return !1
    })
  })
};
ContextPreview.prototype._getImageCoordinates = function(a, b, c, d, e, f) {
  var g = {};
  d = c / d;
  g.width = a < c ? a : c;
  g.height = Math.round(a / d);
  g.marginLeft = Math.round(0.5 * -g.width);
  g.marginTop = Math.round(0.5 * -g.height);
  g.height < b && (g.height = b, g.width = Math.round(b * d), g.marginTop = Math.round(0.5 * -g.height), g.marginLeft = Math.round(0.5 * -g.width - (g.width - a) * (e - 0.5)));
  g.width < a && (g.width = a, g.height = Math.round(a / d), g.marginLeft = Math.round(0.5 * -g.width), g.marginTop = Math.round(0.5 * -g.height - (g.height - b) * (f - 0.5)));
  g.height >= 1.3 *
    b && (g.marginTop = Math.round(0.33 * -g.height));
  b > 2 * -g.marginTop && (g.marginTop = Math.round(0.5 * -b));
  return g
};
ContextPreview.prototype.wake = function() {
  function a() {
    var a = [];
    _(c.previewOf.keyPhotos.items).each(function(e, f) {
      return f < c.dimensions.maxKeyPhotos ? (a.push(b(f, e)), !0) : !1
    });
    $.when.apply(c, a).always(function() {
      c.isAwake && (c.$thumbContainer.appendTo(c.$frame), Modernizr.cssanimations && !Viewport.isUpdating() && (c.$thumbContainer.addClass("justLoaded"), _(function() {
        c.$thumbContainer.removeClass("justLoaded")
      }).delay(IMAGE_FADEIN_DURATION)))
    }).promise()
  }

  function b(b, a) {
    var f = Thumbnails.generateURL(a.thumbnailID,
      2 > a.aspectRatio ? THUMBNAIL_SIZE_CONTEXTPREVIEW : THUMBNAIL_SIZE_CONTEXTPREVIEW_WIDE),
      g = $.Deferred();
    Thumbnails.queueDownload(f).done(function(g) {
      var k;
      c.isAwake && c.thumbnailEls[b] && (k = c.thumbnailEls[b].find(".contextPreview-thumbnail"), c.thumbnailCSS[b] || (c.thumbnailCSS[b] = c._getImageCoordinates(c.dimensions.thumbContainerDimensions[c.keyPhotoCount][b].width + (1 < c.keyPhotoCount ? 40 : 0), c.dimensions.thumbContainerDimensions[c.keyPhotoCount][b].height, g.width, g.height, a.poi.x, a.poi.y)), c.transformOrigins[b] ||
        (c.transformOrigins[b] = {}, 1 === c.keyPhotoCount && _(Modernizr._prefixes).each(function(f) {
          c.transformOrigins[b][f + "transform-origin"] = Math.round(100 * a.poi.x) + "% " + Math.round(100 * a.poi.y) + "%"
        })), g = Modernizr.backgroundsize ? {
          backgroundImage: "url('" + f + "')"
        } : {
          filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + f + "',sizingMethod='scale')"
        }, k.css(_(g).extend(c.thumbnailCSS[b], c.transformOrigins[b])))
    }).always(function() {
      g.resolve()
    });
    return g.promise()
  }
  var c = this;
  c.isAwake || (c.isAwake = !0, Viewport.isUpdating() ?
    _(function() {
      c.isAwake && a()
    }).delay(200) : a())
};
ContextPreview.prototype.sleep = function() {
  this.isAwake && (this.isAwake = !1, this.$thumbContainer && (this.$thumbContainer.detach(), _(this.previewOf.keyPhotos.items).each(function(a) {
    Thumbnails.dequeueDownload(Thumbnails.generateURL(a.thumbnailID, 2 > a.aspectRatio ? THUMBNAIL_SIZE_CONTEXTPREVIEW : THUMBNAIL_SIZE_CONTEXTPREVIEW_WIDE))
  })))
};

function MessagePreview(a, b) {
  Preview.call(this, a, {
    timestamp: new XDate(this.position ? 0 : $.now() + 1, !0),
    aspectRatio: 0
  }, b);
  $.extend(!0, this, {
    position: 0,
    templates: {
      preview: {
        selector: "#template-messagePreview",
        options: {
          icon: !1,
          message: function() {
            return this.message
          }
        }
      }
    },
    size: "standard"
  }, b, {
    id: a,
    message: a
  });
  this.prototypeDimensions = PhotoPreview.prototype.dimensions;
  this.dimensions = $.extend({}, this.prototypeDimensions[this.size])
}
$.extend(!0, MessagePreview.prototype, Preview.prototype);
MessagePreview.prototype.setWidth = function(a) {
  this.dimensions.width !== a && (this.dimensions.width = a, this.$preview && this.$preview.width(a))
};
MessagePreview.prototype.setColumns = function(a) {
  this.setWidth((this.dimensions.columnWidth + this.dimensions.marginLeft) * a - this.dimensions.marginLeft)
};
MessagePreview.prototype.toggleDropCap = function() {
  return !1
};

function SemanticPhotoPreview(a, b, c) {
  PhotoPreview.call(this, a, b, c);
  $.extend(!0, this, {
    tag: null,
    features: {
      feedback: !0
    },
    templates: {
      preview: {
        options: {
          feedbackTooltip: function() {
            return this.makeString("feedbackTooltip")
          },
          semanticInfo: function() {
            return this.previewOf.semanticInfo
          }
        }
      }
    },
    strings: {
      feedbackTooltip: function() {
        return this.tag ? $.mustache(PHOTO_SEMANTICFEEDBACK_TOOLTIP, {
          tagTitle: SEMANTIC_TAGS[this.tag] ? SEMANTIC_TAGS[this.tag].title : this.tag
        }) : !1
      }
    },
    useStringForFeedback: !1
  }, c)
}
$.extend(!0, SemanticPhotoPreview.prototype, PhotoPreview.prototype);
SemanticPhotoPreview.prototype.constructPreview = function() {
  var a = this;
  return PhotoPreview.prototype.constructPreview.call(a).done(function(b) {
    if (a.features.feedback) b.find(".photoPreview-feedback").on("click", function() {
      a.previewOf.submitSemanticFeedback(a.tag, 0, a.useStringForFeedback).done(function() {
        a.destruct()
      });
      return !1
    });
    b.on("click", function(b) {
      return SemanticView && b.shiftKey ? !SemanticView.usePhotoForSearch(a.previewOf) : !0
    })
  })
};

function Selection(a, b) {
  var c = this;
  Group.call(c);
  $.extend(!0, c, {
      skipLoading: !0,
      abortOnViewDeactivate: !0,
      allowedViews: [],
      selectAll: !1,
      includeSelectionMenu: !1,
      includeAppButton: !1,
      refineBeforeProceeding: !1,
      refineSelectionOpts: {},
      refineAdditionalContexts: [],
      minToProceed: 1,
      maxToProceed: void 0,
      showActionAlert: !0,
      strings: {
        itemName: DEFAULT_ITEMNAME,
        itemsName: DEFAULT_ITEMSNAME,
        specifier: function() {
          return this.strings[1 === this.countItems() ? "itemName" : "itemsName"]
        },
        cancelButton: "Cancel",
        doneButton: "Next",
        addButton: "Add Photos"
      }
    },
    b, {
      procedure: a
    }, $.Deferred());
  Strings.call(c);
  Subscriptions.call(c);
  c.abortOnViewDeactivate && (c.subscribe("viewChanges", "View/activate", function(b) {
    _(c.allowedViews).contains(b) || c.reject()
  }), c.always(function() {
    c.unsubscribe("viewChanges")
  }))
}
$.extend(!0, Selection.prototype, Group.prototype, Strings.prototype, Subscriptions.prototype);
Selection.prototype.processItemConstruct = function() {
  return $.rejected
};
Selection.prototype.proceed = function() {
  return this.refineBeforeProceeding ? Selections.buildNew(this, this.procedure, this.refineSelectionOpts).promise() : _(this.procedure).isFunction() ? this.procedure(this.items) : $.Deferred().resolve(this.items).promise()
};

function PhotoSelection(a, b) {
  Selection.call(this, a, b);
  PhotoGroup.call(this);
  $.extend(!0, this, {
    selectAll: !0,
    includeSelectionMenu: !0,
    strings: {
      itemName: CONTEXT_ITEMNAME,
      itemsName: CONTEXT_ITEMSNAME
    }
  }, b)
}
$.extend(!0, PhotoSelection.prototype, Selection.prototype, PhotoGroup.prototype);
PhotoSelection.prototype.processItemConstruct = function() {
  return $.rejected
};

function ContextSelection(a, b) {
  Selection.call(this, a, b);
  ContextGroup.call(this);
  $.extend(!0, this, {
    refineBeforeProceeding: !0
  }, b)
}
$.extend(!0, ContextSelection.prototype, Selection.prototype, ContextGroup.prototype);
ContextSelection.prototype.processItemConstruct = function() {
  return $.rejected
};

function View(a, b) {
  var c = this;
  $.extend(!0, c, {
    id: a,
    activateImmediately: !1,
    viewClass: null,
    state: null,
    allowedStates: [],
    skipBreadcrumbs: !1,
    features: {
      sharing: !1,
      slideshow: !1
    },
    templates: {
      view: {
        selector: "#template-view",
        options: {
          id: a,
          hasFootnoteNavigation: function() {
            return this.hasFootnoteNavigation
          }
        }
      },
      footer: !1
    },
    lobbyView: null,
    isLobbyView: !1,
    navBarSections: {
      left: "default",
      center: "default",
      right: "default"
    },
    navDrawerTags: {
      viewType: a,
      filterType: !1
    },
    showGlobalFooter: !0,
    hasFootnoteNavigation: !1,
    strings: {
      title: VIEW_TITLE,
      footnoteNavigationTitle: function() {
        return this.makeString("title")
      }
    }
  }, b, {
    isActive: !1,
    isDestructed: !1,
    scrollPosition: 0
  });
  Strings.call(c);
  Subscriptions.call(c);
  Templates.call(c);
  Tracking.call(c);
  _.defer(function() {
    PubHub.pub("View/construct", c);
    c.activateImmediately && c.activate()
  })
}
$.extend(!0, View.prototype, Strings.prototype, Subscriptions.prototype, Templates.prototype, Tracking.prototype);
View.prototype.destruct = function() {
  var a = this;
  return a.deactivate().always(function() {
    a.isDestructed = !0;
    a.destroyAllElements();
    a.unsubscribeAll();
    _.defer(function() {
      PubHub.pub("View/destruct", a)
    })
  })
};
View.prototype.activate = function(a) {
  function b() {
    d.isActive = !0;
    d.$view ? c() : d.build().done(c)
  }

  function c() {
    d.startTrackingSession();
    $(window).on("blur." + d.id, function() {
      var b = $.now();
      $(window).one("focus." + d.id, function() {
        6E4 < $.now() - b && (d.stopTrackingSession(b), d.startTrackingSession())
      })
    });
    d.$view.addClass("active");
    a || (d.scrollPosition = 0);
    _.defer(function() {
      $(window).scrollTop(d.scrollPosition)
    });
    PubHub.pub("View/activate", d);
    e.resolve()
  }
  var d = this,
    e = $.Deferred();
  d.isActive ? e.reject() : window.Views ?
    Views.activate(d, e).done(b).fail(function() {
      e.reject()
    }) : b();
  return e.promise()
};
View.prototype.deactivate = function() {
  function a() {
    b.isActive = !1;
    b.stopTrackingSession();
    b.scrollPosition = $(window).scrollTop();
    $(window).off(b.id);
    b.$view && b.$view.removeClass("active");
    $(".messageBar." + b.id).each(function() {
      $(this).data("messageBar").close()
    });
    PubHub.pub("View/deactivate", b);
    c.resolve()
  }
  var b = this,
    c = $.Deferred();
  b.isActive ? window.Views ? Views.deactivate(b, c).done(a).fail(function() {
    c.reject()
  }) : a() : c.reject();
  return c.promise()
};
View.prototype.setState = function(a) {
  var b = this,
    c = $.Deferred();
  b.state !== a && b.hasState(a) ? (b.state = a, c.resolve(), _(function() {
    PubHub.pub("View/update", b, b.state)
  }).defer()) : c.reject();
  return c.promise()
};
View.prototype.hasState = function(a) {
  return _(this.allowedStates).contains(a)
};
View.prototype.build = function() {
  var a = this,
    b = $.Deferred();
  $.when(a.buildElement("view"), a.buildElement("footer")).always(function(c, d) {
    c ? (c.appendTo("#main"), d && d.appendTo(c), a.subscribe("keyboard", "Keyboard/shortcut", function(b) {
      return a.isActive ? !a.handleKeys(b) : !0
    }), a.$actionAlertTarget = c, b.resolve(c, d)) : b.reject()
  });
  return b.promise()
};
View.prototype.handleKeys = function(a) {
  return !0
};
View.prototype.showActionAlert = function(a, b) {
  this.isActive && this.$view && this.$view.showActionAlert(a, b)
};

function SheetView(a, b) {
  View.call(this, a, b);
  $.extend(!0, this, {
    templates: {
      view: {
        selector: "#template-sheetView"
      }
    }
  }, b, {
    sheets: []
  });
  Procrastination.call(this);
  TaskQueue.call(this)
}
$.extend(!0, SheetView.prototype, Procrastination.prototype, TaskQueue.prototype, View.prototype);
SheetView.prototype.build = function() {
  var a = this;
  return View.prototype.build.call(a).done(function() {
    a.setupSheets().always(function() {
      _(a.sheets).each(function(b) {
        a.$view.append(b.$sheet)
      })
    })
  })
};
SheetView.prototype.setupSheets = function() {
  return $.resolved
};
SheetView.prototype.destruct = function() {
  var a = this;
  return View.prototype.destruct.call(a).done(function() {
    a.unsubscribeAll();
    _(a.sheets).invoke("destruct")
  })
};
SheetView.prototype.activate = function() {
  var a = this;
  return View.prototype.activate.call(a).done(function() {
    var b = _(a.sheets).findWhere({
      id: a.state
    });
    b ? b.activate() : a.sheets.length && a.setState(a.sheets[0].id);
    a.updateUI()
  })
};
SheetView.prototype.deactivate = function() {
  var a = this;
  return View.prototype.deactivate.call(a).done(function() {
    _(a.sheets).invoke("deactivate")
  })
};
SheetView.prototype.setState = function(a) {
  var b = this;
  return View.prototype.setState.call(b, a).done(function() {
    function c() {
      _(b.sheets).findWhere({
        id: a
      }).activate()
    }
    var d;
    b.isActive && ((d = _(b.sheets).findWhere({
      isActive: !0
    })) ? d.deactivate().done(c) : c())
  })
};
SheetView.prototype.updateUI = function() {
  return $.resolved
};

function GridView(a, b) {
  var c = this;
  View.call(c, a, b);
  $.extend(!0, c, {
    templates: {
      view: {
        options: {
          hasGrids: !0
        }
      }
    },
    strings: {
      updateMessage: VIEW_UPDATE_MESSAGE_DEFAULT,
      selectionActionAlertLabel: VIEW_ACTIONALERT_LABEL_SELECT
    },
    isEmpty: void 0,
    gridType: null,
    gridOptions: {
      respectShowHiddenPref: !1,
      respectSortOrderPref: !1
    }
  }, b, {
    mode: "browse",
    grids: []
  });
  Procrastination.call(c);
  TaskQueue.call(c);
  c.subscribe("gridEmptiness", "Grid/markEmpty", function(b, a) {
    _(c.grids).contains(b) && (c.isActive ? c.updateUI() : c.checkEmptiness())
  });
  c.subscribe("gridDestruction", "Grid/destruct", function(b) {
    b = _(c.grids).indexOf(b);
    0 <= b && (c.grids.splice(b, 1), c.isActive ? c.updateUI() : c.checkEmptiness())
  })
}
$.extend(!0, GridView.prototype, Procrastination.prototype, TaskQueue.prototype, View.prototype);
GridView.prototype.build = function() {
  var a = this;
  return View.prototype.build.call(a).done(function() {
    a.setupGrids().always(function() {
      "selection" === a.mode && a.executeAllTasks("selectionMode/build")
    })
  })
};
GridView.prototype.setupGrids = function() {
  var a = this,
    b;
  return (b = Grids.buildNew(a.gridType, [], a.viewOf, a.gridOptions)) ? (a.grids[0] = b, b.build().done(function() {
    a.$view.find(".view-grids").prepend(a.grids[0].$grid)
  })) : $.rejected
};
GridView.prototype.destruct = function() {
  var a = this;
  return View.prototype.destruct.call(a).done(function() {
    _(a.grids).invoke("destruct")
  })
};
GridView.prototype.activate = function(a) {
  var b = this;
  return View.prototype.activate.call(b, a).done(function() {
    _(b.grids).each(function(a) {
      "selection" === b.mode && b.executeAllTasks("selectionMode/activate");
      a.activate()
    });
    b.updateUI()
  })
};
GridView.prototype.deactivate = function() {
  var a = this;
  return View.prototype.deactivate.call(a).done(function() {
    _(a.grids).invoke("deactivate");
    a.executeAllTasks("updates")
  })
};
GridView.prototype.updateUI = function() {
  var a = this;
  return a.$view ? a.procrastinate("updateUI", function() {
    a.checkEmptiness()
  }) : $.rejected
};
GridView.prototype.checkEmptiness = function() {
  var a = this,
    b;
  b = _(a.grids).every(function(b) {
    return b.checkEmptiness()
  });
  a.isEmpty !== b && (a.isEmpty = b, PubHub.pub("View/markEmpty", a, b));
  a.$view && (a.$view.toggleClass("empty", a.isEmpty), a.isEmpty ? a.$emptyMessage || a.buildElement("emptyMessage").done(function(b) {
    a.$view.append(b)
  }) : a.destroyElement("emptyMessage"));
  return a.isEmpty
};
GridView.prototype.enterSelectionMode = function(a, b) {
  var c = this,
    d = $.Deferred();
  "selection" !== c.mode ? (c.mode = "selection", c.selection = a, c.queueTask("selectionMode/build", "getSelectors", function() {
    c.selectors = _(c.grids).chain().map(function(b) {
      return b.startSelection(a)
    }).compact().value()
  }), c.queueTask("selectionMode/activate", "setUI", function() {
    c.setSelectionUI(!0)
  }), c.isActive && c.selection.showActionAlert && c.showActionAlert(c.makeString("selectionActionAlertLabel"), "select"), c.$view && c.procrastinate("selectionModeSetup",
    function() {
      c.selection === a && (c.$view && c.executeAllTasks("selectionMode/build"), c.isActive && c.executeAllTasks("selectionMode/activate"))
    }), d.resolve()) : (a.reject(), d.reject());
  return d.promise()
};
GridView.prototype.exitSelectionMode = function() {
  var a = $.Deferred();
  "selection" === this.mode ? (this.mode = "browse", delete this.selection, delete this.selectors, this.$view && (_(this.grids).invoke("endSelection"), this.setSelectionUI(!1)), this.dequeueAllTasks("selectionMode/build"), this.dequeueAllTasks("selectionMode/activate"), a.resolve()) : a.reject();
  return a.promise()
};
GridView.prototype.setSelectionUI = function(a) {
  this.$view && this.$view.toggleClass("selectionMode", a)
};

function MonthsView(a, b) {
  var c = this;
  GridView.call(c, a, b);
  $.extend(!0, c, {
    gridOptions: {
      respectSortOrderPref: !0
    },
    strings: {
      gridTitle: function(b) {
        return $.mustache(MONTHSVIEW_GRID_TITLE, {
          month: b,
          year: this.viewOf.year
        })
      }
    },
    respectSortOrderPref: !0,
    sortOrder: "asc"
  }, b);
  _.defer(function() {
    c.respectSortOrderPref && c.setSortOrder(Preferences.get("sort_order"));
    c.subscribe("sortOrderPreference", "Preference/set", function(b, a) {
      c.respectSortOrderPref && "sort_order" === b && c.setSortOrder(a)
    })
  })
}
$.extend(!0, MonthsView.prototype, GridView.prototype);
MonthsView.prototype.setupGrids = function() {
  var a = this,
    b;
  if (a.grids.length) return $.rejected;
  b = _(MONTHS).map(function(b, d) {
    return (grid = Grids.buildNew(a.gridType, [], a.viewOf, $.extend({}, a.gridOptions, {
      title: a.makeString("gridTitle", b),
      month: d,
      match: function(b) {
        return Grid.prototype.match.call(this, b) && b.timestamp && b.timestamp.getMonth() === this.month
      }
    }))) ? (a.grids.push(grid), grid.build()) : $.rejected
  });
  return $.when.apply(null, b).done(function() {
    var b = a.$view.find(".view-grids");
    _(a.grids).each(function(d) {
      "asc" ===
        a.sortOrder ? d.$grid.appendTo(b) : d.$grid.prependTo(b)
    })
  })
};
MonthsView.prototype.setSortOrder = function(a) {
  var b = this,
    c = $.Deferred();
  _(["asc", "desc"]).contains(a) || (a = "asc");
  a !== b.sortOrder ? (b.sortOrder = a, b.$view && _(function() {
    var a = b.$view.find(".view-grids");
    _(b.grids).each(function(c) {
      "asc" === b.sortOrder ? c.$grid.appendTo(a) : c.$grid.prependTo(a)
    })
  }).defer(), c.resolve()) : c.reject();
  return c.promise()
};

function FetcherView(a, b, c) {
  var d = this;
  GridView.call(d, a, c);
  $.extend(!0, d, {
    strings: {
      updateMessage: function() {
        return $.mustache(VIEW_UPDATE_MESSAGE_FETCHER, {
          groupName: this.viewOf.makeString("groupName")
        })
      },
      fetchMessageBusy: function() {
        return $.mustache(VIEW_FETCH_MESSAGE_BUSY, {
          itemsName: this.viewOf.makeString("itemsName")
        })
      },
      fetchMessageError: function() {
        return $.mustache(VIEW_FETCH_MESSAGE_ERROR, {
          itemsName: this.viewOf.makeString("itemsName")
        })
      }
    },
    fetchOnScroll: !0,
    skipSelectionFetching: !1
  }, c);
  d.viewOf =
    b;
  d.viewOf.fetch && (d.subscribe("groupFetch", "Group/fetch", function(b) {
    b === d.viewOf && (d.isActive ? d.updateUI() : d.checkEmptiness())
  }), d.subscribe("groupReset", "Group/reset", function(b) {
    b === d.viewOf && d.isActive && d.requestFetch()
  }))
}
$.extend(!0, FetcherView.prototype, GridView.prototype);
FetcherView.prototype.activate = function(a) {
  var b = this;
  return GridView.prototype.activate.call(b, a).done(function() {
    function a() {
      var d = $.Deferred(),
        e = _(b.viewOf.items).every(function(b) {
          return !b.visibility
        }),
        f = _(b.grids).every(function(b) {
          return !b.includeHiddenItems
        });
      b.viewOf.fetchContinue && e && f ? b.requestFetch().done(function() {
        d.follow(a())
      }).fail(function() {
        d.reject()
      }) : d.resolve();
      return d.promise()
    }
    b.viewOf.fetch && ("selection" === b.mode ? b.requestFetchAll().done(function() {
      "selection" === b.mode &&
        _(function() {
          b.executeAllTasks("selectionMode/fetch")
        }).defer()
    }) : b.viewOf.fetchedOnce ? a().always(function() {
      b.toggleFetchOnScroll(!0)
    }) : b.requestFetch().done(function() {
      a().always(function() {
        b.toggleFetchOnScroll(!0)
      })
    }))
  })
};
FetcherView.prototype.deactivate = function() {
  var a = this;
  return GridView.prototype.deactivate.call(a).done(function() {
    a.fetchOnScroll && a.toggleFetchOnScroll(!1);
    a.viewOf.isDestructed && !a.isDestructed && a.destruct()
  })
};
FetcherView.prototype.updateUI = function() {
  var a = this;
  return a.$view ? a.procrastinate("updateUI", function() {
    a.viewOf.fetchedOnce && a.checkEmptiness();
    a.$view && (a.$view.toggleClass("pending", !a.viewOf.fetchedOnce), a.hasFootnoteNavigation && (a.prevView ? a.$view.find(".view-footnote-prev").removeClass("hidden").attr("href", "#view=" + a.prevView.id).text(a.prevView.makeString("footnoteNavigationTitle")) : a.$view.find(".view-footnote-prev").addClass("hidden").text(""), a.nextView ? a.$view.find(".view-footnote-next").removeClass("hidden").attr("href",
      "#view=" + a.nextView.id).text(a.nextView.makeString("footnoteNavigationTitle")) : a.$view.find(".view-footnote-next").addClass("hidden").text("")))
  }) : $.rejected
};
FetcherView.prototype.handleKeys = function(a) {
  var b = !1;
  2 === a.length ? a[0].which === KEYCODES.f && a[1].which === KEYCODES.a && (this.requestFetchAll(), b = !0) : 1 === a.length && (a[0].which === KEYCODES.j && this.prevView ? (this.prevView.activate(), b = !0) : a[0].which === KEYCODES.k && this.nextView && (this.nextView.activate(), b = !0));
  return b
};
FetcherView.prototype.requestFetch = function(a) {
  var b = this;
  return b.isActive && b.viewOf && b.viewOf.fetch && b.viewOf.fetchContinue ? (DiscreetActivity.show(b.id + "/fetch", b.makeString("fetchMessageBusy")), b.viewOf.fetch(a).always(function() {
    DiscreetActivity.hide(b.id + "/fetch")
  }).fail(function(a, d) {
    b.isActive && "abort" !== d && MessageBars.buildNew(b.makeString("fetchMessageError"), {
      extraClasses: "alert " + b.id
    })
  })) : $.rejected
};
FetcherView.prototype.requestFetchAll = function() {
  var a = this,
    b = $.Deferred();
  a.isActive && a.viewOf && a.viewOf.fetchAll ? a.viewOf.fetchContinue ? (BlockingActivity.show(a.id + "/fetch", a.makeString("fetchMessageBusy")), b.follow(a.viewOf.fetchAll().always(function() {
    BlockingActivity.hide(a.id + "/fetch")
  }).fail(function(b, d) {
    a.isActive && "abort" !== d && MessageBars.buildNew(a.makeString("fetchMessageError"), {
      extraClasses: "alert " + a.id
    })
  }))) : b.resolve() : b.reject();
  return b.promise()
};
FetcherView.prototype.toggleFetchOnScroll = function(a) {
  var b = this;
  b.fetchOnScroll && (b.viewOf && b.viewOf.fetch) && (a ? b.isActive && b.viewOf.fetchContinue && b.subscribe("scrollPosition", "Viewport/update", function(a) {
    0 < a.deltas.top && ("browse" === b.mode && b.viewOf.fetchContinue && Viewport.withinYOfBottom(VIEW_FETCH_THRESHOLD)) && (b.toggleFetchOnScroll(!1), b.requestFetch().done(function() {
      b.viewOf.fetchContinue && _(function() {
        b.toggleFetchOnScroll(!0)
      }).delay(1E3)
    }))
  }) : b.unsubscribe("scrollPosition"))
};
FetcherView.prototype.enterSelectionMode = function(a, b) {
  var c = this,
    d = $.Deferred();
  "selection" !== c.mode ? !c.isActive || a.skipFetching || c.skipSelectionFetching ? d.follow(GridView.prototype.enterSelectionMode.call(c, a, b)) : c.requestFetchAll().always(function() {
    d.follow(GridView.prototype.enterSelectionMode.call(c, a, b)).done(function() {
      _(function() {
        c.executeAllTasks("selectionMode/fetch")
      }).defer()
    })
  }) : (a.reject(), d.reject());
  return d.promise()
};
FetcherView.prototype.exitSelectionMode = function() {
  var a = this;
  return GridView.prototype.exitSelectionMode.call(a).done(function() {
    a.dequeueAllTasks("selectionMode/fetch")
  })
};
FetcherView.prototype.setNextView = function(a) {
  a !== this.nextView && (this.nextView = a, this.isActive && this.updateUI())
};
FetcherView.prototype.setPrevView = function(a) {
  a !== this.prevView && (this.prevView = a, this.isActive && this.updateUI())
};

function SelectionView(a, b, c, d) {
  var e = this;
  GridView.call(e, a, d);
  $.extend(!0, e, {
    viewClass: "selection",
    skipBreadcrumbs: !0,
    templates: {
      view: {
        options: {
          extraClasses: "photosView"
        }
      }
    },
    strings: {
      title: SELECTIONVIEW_TITLE
    },
    gridType: "photo",
    gridOptions: {
      handlePhotoViewer: !0
    }
  }, d, {
    fromGroups: [],
    photoSelection: c
  });
  _(b).each(function(b) {
    _(b.refineAdditionalContexts).each(function(b) {
      e.fromGroups.push(b)
    })
  });
  _(b).each(function(b) {
    b.photos ? e.fromGroups.push(b) : _(b.contexts).each(function(b) {
      e.fromGroups.push(b)
    })
  });
  e.photoSelection.always(function() {
    e.destruct()
  })
}
$.extend(!0, SelectionView.prototype, GridView.prototype);
SelectionView.prototype.setupGrids = function() {
  var a = this,
    b = $.Deferred();
  _(a.fromGroups).each(function(b, d) {
    var e = Grids.buildNew(a.gridType, [], b, $.extend({}, a.gridOptions, {
      id: "grid-" + a.id + "/" + d,
      title: b.makeString ? b.makeString("title") : !1
    }));
    e.build().done(function(b) {
      a.queueTask("gridInsertion", e.id, function() {
        a.$view.find(".view-grids").append(b)
      })
    });
    a.grids.push(e)
  });
  _(function() {
    a.executeAllTasks("gridInsertion").done(function() {
      _(a.grids).invoke("updateViewport");
      b.resolve()
    })
  }).defer();
  return b.promise()
};
SelectionView.prototype.activate = function(a) {
  var b = this;
  return GridView.prototype.activate.call(b, a).done(function() {
    b.enterSelectionMode(b.photoSelection)
  })
};
SelectionView.prototype.deactivate = function() {
  var a = this;
  return GridView.prototype.deactivate.call(a).always(function() {
    a.photoSelection.reject()
  })
};
SelectionView.prototype.enterSelectionMode = function(a, b) {
  var c = this,
    d;
  "selection" !== c.mode ? (BlockingActivity.show(c.id + "/selection", c.makeString("fetchMessageBusy")), d = _(c.fromGroups).map(function(b) {
    var a = $.Deferred();
    b.fetchAll ? b.fetchAll().always(function() {
      a.resolve()
    }) : a.resolve();
    return a.promise()
  }), $.when.apply(c, d).always(function() {
    BlockingActivity.hide(c.id + "/selection");
    GridView.prototype.enterSelectionMode.call(c, a, b)
  })) : a.reject();
  return c
};

function ContextView(a, b, c) {
  var d = this;
  FetcherView.call(d, a, b, c);
  $.extend(!0, d, {
    features: {
      miscMenu: !0,
      photoCount: !0,
      reveal: !1,
      hide: !1,
      baleet: !1,
      editTime: !1,
      download: !0,
      sharing: !1,
      slideshow: !0
    },
    templates: {
      view: {
        options: {
          extraClasses: "photosView"
        }
      },
      miscMenu: {
        selector: "#template-context-miscMenu",
        options: {
          id: a,
          features: function() {
            return this.features
          },
          groupName: b.makeString("groupName")
        }
      },
      hiddenBar: {
        selector: "#template-context-hiddenBar",
        options: {
          groupName: function() {
            return this.viewOf.makeString("groupName")
          }
        }
      }
    },
    navBarSections: {
      left: "context",
      center: "context",
      right: "share"
    },
    strings: {
      title: function() {
        return this.viewOf.makeString("title")
      },
      categoryTitle: !1,
      fetchMessageError: function() {
        return $.mustache(CONTEXT_FETCH_MESSAGE_ERROR, {
          groupName: this.viewOf.makeString("groupName")
        })
      },
      updateMessage: function() {
        return $.mustache(CONTEXT_UPDATE_MESSAGE, {
          groupName: this.viewOf.makeString("groupName")
        })
      },
      hideMessageBusy: function() {
        return $.mustache(CONTEXT_HIDE_MESSAGE_BUSY, {
          groupName: this.viewOf.makeString("groupName")
        })
      },
      hideMessageError: function() {
        return $.mustache(CONTEXT_HIDE_MESSAGE_ERROR, {
          groupName: this.viewOf.makeString("groupName")
        })
      },
      unhideMessageBusy: function() {
        return $.mustache(CONTEXT_UNHIDE_MESSAGE_BUSY, {
          groupName: this.viewOf.makeString("groupName")
        })
      },
      unhideMessageError: function() {
        return $.mustache(CONTEXT_UNHIDE_MESSAGE_ERROR, {
          groupName: this.viewOf.makeString("groupName")
        })
      },
      deleteMessageSuccess: function() {
        return $.mustache(CONTEXT_DELETE_MESSAGE_SUCCESS, {
          title: this.makeString("title")
        })
      },
      deleteMessageError: function() {
        return $.mustache(CONTEXT_DELETE_MESSAGE_ERROR, {
          groupName: this.viewOf.makeString("groupName")
        })
      },
      selectionMessageEditTime: function() {
        return $.mustache(CONTEXT_SELECTION_MESSAGE_EDITTIME, {
          itemsName: d.viewOf.makeString("itemsName")
        })
      },
      editTimeMessageSuccess: CONTEXT_EDITTIME_MESSAGE_SUCCESS,
      editTimeMessageError: CONTEXT_EDITTIME_MESSAGE_ERROR,
      downloadMessageBusy: CONTEXT_DOWNLOAD_MESSAGE_BUSY,
      downloadMessageError: CONTEXT_DOWNLOAD_MESSAGE_ERROR,
      shareFacebookTitle: function() {
        return this.makeString("title")
      },
      sharePhotoMailSubject: function() {
        return this.makeString("title")
      },
      sharePhotoPageTitle: function() {
        return this.makeString("title")
      }
    },
    handlePhotoViewer: !0,
    gridType: "photo",
    gridOptions: {
      id: a,
      handlePhotoViewer: !1
    }
  }, c, {
    spotlightPid: null
  });
  d.subscribe("contextDestruct", "Item/destruct", function(b) {
    b === d.viewOf && d.destruct()
  });
  d.subscribe("contextChange", "Context/set/visibility Context/set/photoCount Group/add Group/remove", function(b) {
    b === d.viewOf && d.isActive && d.updateUI()
  })
}
$.extend(!0, ContextView.prototype, FetcherView.prototype);
ContextView.prototype.build = function() {
  var a = this;
  return GridView.prototype.build.call(a).done(function(b) {
    if (b) {
      if (a.handlePhotoViewer) a.$view.on("click", ".photoPreview", function() {
        var b = Photos.get($(this).data("photo-id"));
        PhotoViewer.activate(b, a, !0);
        return !1
      });
      a.features.miscMenu && a.buildElement("miscMenu").done(function(b) {
        a.miscMenu = b.bubble({
          id: "miscMenu-" + a.id
        });
        if (a.features.hide) b.find(".context-miscMenu-showHidden").on("click", function(b) {
          _(a.grids).each(function(b) {
            b.setShowHiddenItems(!b.showHiddenItems)
          });
          $(this).toggleClass("off")
        });
        a.features.hide && (b.find(".context-miscMenu-hide").on("click", function() {
          BlockingActivity.show(a.id + "/hide", a.makeString("hideMessageBusy"));
          a.viewOf.hide().done(function() {
            BlockingActivity.hide(a.id + "/hide");
            PubHub.pub("ContextView/hide", a)
          }).fail(function() {
            MessageBars.buildNew(a.makeString("hideMessageError", {
              extraClasses: "alert " + a.id
            }))
          })
        }), b.find(".context-miscMenu-unhide").on("click", function() {
          BlockingActivity.show(a.id + "/unhide", a.makeString("unhideMessageBusy"));
          a.viewOf.unhide().done(function() {
            BlockingActivity.hide(a.id + "/unhide");
            PubHub.pub("ContextView/unhide", a)
          }).fail(function() {
            MessageBars.buildNew(a.makeString("unhideMessageError", {
              extraClasses: "alert " + a.id
            }))
          })
        }));
        if (a.features.baleet) b.find(".context-miscMenu-delete").on("click", function() {
          a.features.baleet && a.viewOf.baleet().done(function() {
            PubHub.pub("ContextView/delete", a);
            a.destruct();
            MessageBars.buildNew(a.makeString("deleteMessageSuccess"))
          }).fail(function(b, c) {
            a.isActive && (c && "abort" !==
              c) && MessageBars.buildNew(a.makeString("deleteMessageError"), {
              extraClasses: "alert " + a.id
            })
          })
        });
        if (a.features.editTime) b.find(".context-miscMenu-editTime").on("click", function(b) {
          a.features.editTime && a.editTime().done(function() {
            PubHub.pub("ContextView/editTime", a);
            MessageBars.buildNew(a.makeString("editTimeMessageSuccess"))
          }).fail(function(b, c) {
            a.isActive && (c && "abort" !== c) && MessageBars.buildNew(a.makeString("editTimeMessageError"), {
              extraClasses: "alert " + a.id
            })
          })
        });
        if (a.features.download) b.find(".context-miscMenu-download").on("click",
          function() {
            a.downloadPhotos().done(function(b) {
              PubHub.pub("ContextView/download", a, b)
            })
          })
      })
    }
    a.features.hide && a.buildElement("hiddenBar").done(function(b) {
      a.$hiddenBar = b || void 0
    })
  })
};
ContextView.prototype.setupGrids = function() {
  var a = this;
  return FetcherView.prototype.setupGrids.call(a).done(function() {
    _(a.grids).invoke("addSpotlight", a.spotlightPid)
  })
};
ContextView.prototype.activate = function(a, b) {
  var c = this;
  return FetcherView.prototype.activate.call(c, a).done(function() {
    c.features.hide && c.$hiddenBar && c.$hiddenBar.appendTo("#extraBars");
    b && (c.spotlightPid = b, _(c.grids).invoke("addSpotlight", c.spotlightPid), c.requestFetchAll().done(function() {
      _(function() {
        _(c.grids).invoke("scrollToItem", c.spotlightPid)
      }).defer()
    }))
  })
};
ContextView.prototype.deactivate = function() {
  var a = this;
  return FetcherView.prototype.deactivate.call(a).done(function() {
    a.features.hide && a.$hiddenBar && (a.$hiddenBar.removeClass("open"), _(function() {
      a.$hiddenBar.detach()
    }).delay(150));
    a.spotlightPid && (_(a.grids).invoke("removeSpotlight", a.spotlightPid), a.spotlightPid = null);
    a.handlePhotoViewer && (PhotoViewer.isActive && PhotoViewer.supplier === a) && PhotoViewer.deactivate(!0)
  })
};
ContextView.prototype.updateUI = function() {
  var a = this,
    b = [];
  return a.$view ? (b.push(FetcherView.prototype.updateUI.call(a)), b.push(a.procrastinate("updateUI", function() {
    var b = void 0 === a.viewOf.visibility ? !1 : !a.viewOf.visibility,
      d, e;
    a.$view && (a.$view.toggleClass("hidden", b), "selection" === a.mode ? a.$view.removeClass("pushTop") : a.$view.toggleClass("pushTop", b));
    a.features.hide && a.$hiddenBar && a.$hiddenBar.toggleClass("open", b);
    a.$miscMenu && (a.$miscMenu.find(".context-miscMenu-photoCount").text(a.viewOf.photoCount),
      a.features.hide && (d = a.viewOf.countItems() - a.viewOf.countMatching(function(b) {
        return !!b.visibility
      }), e = d / a.viewOf.photoCount, a.$miscMenu.find(".context-miscMenu-hiddenCount").text(d), 0 === e ? a.$miscMenu.find(".context-miscMenu-hiddenPercentage").text("") : 0.01 > e ? a.$miscMenu.find(".context-miscMenu-hiddenPercentage").text("(< 1%)") : a.$miscMenu.find(".context-miscMenu-hiddenPercentage").text("(" + Math.round(100 * e) + "%)"), a.$miscMenu.find(".context-miscMenu-showHidden").toggleClass("off", !a.grids[0].showHiddenItems)),
      a.$miscMenu.find(".context-miscMenu-hide").toggleClass("hidden", b), a.$miscMenu.find(".context-miscMenu-unhide").toggleClass("hidden", !b))
  })), $.when.apply(a, b).promise()) : $.rejected
};
ContextView.prototype.downloadPhotos = function() {
  var a = this,
    b;
  b = Selections.buildNew(a, function(c) {
    var d = c.length,
      e, f;
    1 < d ? (f = _(c).pluck("id"), e = $("#template-downloadWarning").mustache({
      photoCount: d
    }).appendTo("body").on({
      "afterClose.popover": function(b) {
        e.popover().destruct()
      }
    }), e.find(".downloadWarning-continue").on("click", function() {
      e.popover().close();
      b.resolve(c);
      DiscreetActivity.show(a.id + "/downloadPhotos", a.makeString("downloadMessageBusy"));
      API.request("photosZipped", {
        pids: JSON.stringify(f),
        title: a.makeString("title")
      }).always(function() {
        DiscreetActivity.hide(a.id + "/downloadPhotos")
      }).fail(function() {
        MessageBars.buildNew(a.makeString("downloadMessageError"), {
          extraClasses: "alert " + a.id
        })
      })
    }), e.find(".cancelLink").on("click", function() {
      e.popover().close()
    }), e.popover({
      isOpen: !0
    })) : (Downloader.get(Thumbnails.generateURL(c[0].thumbnailID, THUMBNAIL_SIZE_DOWNLOAD)), b.resolve(c))
  }, {
    selectAll: 200 > a.viewOf.photoCount
  });
  return b.promise()
};
ContextView.prototype.editTime = function() {
  var a = this,
    b;
  b = Selections.buildNew(a, function(c) {
    var d, e = new XDate,
      f = (c[0].timestamp || e).clone(),
      g = "offset",
      h = !1;
    d = $("#template-context-editTime").mustache({
      nowDate: e.toString(CONTEXT_EDITTIME_DATE_FORMAT),
      nowTime: e.toString(CONTEXT_EDITTIME_TIME_FORMAT),
      date: f.toString(CONTEXT_EDITTIME_DATE_FORMAT),
      time: f.toString(CONTEXT_EDITTIME_TIME_FORMAT)
    }).appendTo("body").on({
      "afterClose.popover": function() {
        $(this).popover().destruct()
      },
      "execute.asyncForm": function() {
        var e =
          (new XDate($("#context-editTime\\/date").val() + " " + $("#context-editTime\\/time").val() + " Z", !0)).setSeconds(f.getSeconds()),
          e = Math.round(f.diffSeconds(e));
        a.viewOf.editTime(_(b.items).union(), e, h).done(function() {
          b.resolve(c);
          d.popover().close()
        }).fail(function(b, a) {
          412 === a ? (h = !0, d.asyncForm().unlock().always(function() {
            d.trigger({
              type: "validate",
              validationData: {
                result: !1,
                message: "Some of these photos will fall outside of your account's time window and become inaccessible. Are you sure you wish to continue?"
              }
            })
          })) :
            d.asyncForm().unlock().always(function() {
              d.trigger({
                type: "validate",
                validationData: {
                  result: !1,
                  message: "Unexpected error, please try again. (code " + (a || "unknown") + ")"
                }
              })
            })
        })
      }
    });
    d.find("input[name='context-editTime\\/mode']").on("change", function() {
      g = $(this).val();
      "absolute" === g ? (d.find(".context-editTime-absolute").removeAttr("disabled"), d.find(".context-editTime-offset").attr("disabled", !0), $("#context-editTime\\/date").trigger("focus")) : (d.find(".context-editTime-offset").removeAttr("disabled"),
        d.find(".context-editTime-absolute").attr("disabled", !0))
    });
    d.find(".context-editTime-offset").on("change", function() {
      var b = f.clone();
      "offset" === g && (b.addYears($("#context-editTime\\/years").val()), b.addMonths($("#context-editTime\\/months").val()), b.addDays($("#context-editTime\\/days").val()), b.addHours($("#context-editTime\\/hours").val()), b.addMinutes($("#context-editTime\\/minutes").val()), $("#context-editTime\\/date").val(b.toString(CONTEXT_EDITTIME_DATE_FORMAT)), $("#context-editTime\\/time").val(b.toString(CONTEXT_EDITTIME_TIME_FORMAT)))
    });
    d.find(".context-editTime-absolute").on("blur", function() {
      var b = new XDate($("#context-editTime\\/date").val() + " " + $("#context-editTime\\/time").val() + " Z", !0),
        a, c, d = 0,
        e = 0,
        g = 0,
        h = 0;
      a = 0;
      b.valid() ? (b.getTime() > f.getTime() ? (a = b.clone(), b = f.clone(), c = 1) : (a = f.clone(), b = b.clone(), c = -1), a.setSeconds(0).setMilliseconds(0), b.setSeconds(0).setMilliseconds(0), d = parseInt(b.diffYears(a)), b.addYears(d), e = parseInt(b.diffMonths(a)), b.addMonths(e), g = parseInt(b.diffDays(a)), b.addDays(g), h = parseInt(b.diffHours(a)), b.addHours(h),
        a = parseInt(b.diffMinutes(a)), b.addMinutes(a), $("#context-editTime\\/years").val(d * c), $("#context-editTime\\/months").val(e * c), $("#context-editTime\\/days").val(g * c), $("#context-editTime\\/hours").val(h * c), $("#context-editTime\\/minutes").val(a * c)) : $(this).trigger({
        type: "validate",
        validationData: {
          result: !1,
          message: "Invalid format"
        }
      })
    });
    d.popover({
      isOpen: !0,
      closeButton: "back"
    });
    d.asyncForm()
  }, {
    selectAll: !0
  });
  _(a.grids).each(function(a) {
    a.respectShowHiddenPref && (a.respectShowHiddenPref = !1, b.always(function() {
      a.respectShowHiddenPref = !0
    }));
    a.showHiddenItems || (a.setShowHiddenItems(!0), b.always(function() {
      a.setShowHiddenItems(!1)
    }))
  });
  return b.promise()
};
ContextView.prototype.selectItemForViewer = function(a, b) {
  function c() {
    var c = f.length,
      d = h + c,
      e = f[d % c],
      g = void 0;
    e === a && b ? k.reject() : (1 < c && (g = f[(d + 1) % c]), k.resolve(e, g, 0 === d % c, d % c === c - 1))
  }

  function d() {
    var b;
    "selection" !== e.mode ? (b = e.grids[0].showHiddenItems ? e.viewOf.items : _(e.viewOf.items).filter(function(b) {
      return !!b.visibility
    }), e.viewOf.sortOrder !== e.grids[0].sortOrder && b.reverse()) : b = _(e.grids[0].getInsertedPreviews()).pluck("previewOf");
    return b
  }
  var e = this,
    f, g, h, k = $.Deferred();
  b = 0 + b || 0;
  f = d();
  g = a ?
    _(f).indexOf(a) : 0;
  0 <= g ? (h = g + b, h >= f.length - 1 ? e.viewOf.fetch().done(function() {
    f = d();
    c()
  }).fail(c) : 0 > h ? e.viewOf.fetchAll().done(function() {
    f = d();
    c()
  }).fail(c) : c()) : k.reject();
  return k.promise()
};
ContextView.prototype.startSlideshow = function() {
  var a = this;
  a.selectItemForViewer().done(function(b) {
    PhotoViewer.startSlideshow();
    PhotoViewer.activate(b, a, !0)
  })
};

function MomentView(a, b, c) {
  var d = this;
  ContextView.call(d, a, b, c);
  $.extend(!0, d, {
    viewClass: "moment",
    lobbyView: MomentYears.getView("moments-" + b.year) || MomentYears.emptyView,
    features: {
      miscMenu: !0,
      photoCount: !0,
      hide: !1,
      baleet: !1,
      editTime: !1,
      download: !0,
      sharing: !0,
      slideshow: !0
    },
    navDrawerTags: {
      viewType: "photos",
      filterType: "all"
    },
    strings: {
      shareFacebookTitle: function() {
        return $.mustache(MOMENT_SHARE_FACEBOOK_TITLE, {
          date: this.viewOf.timestamp.toString(MOMENT_TITLE_DATE_FORMAT)
        })
      },
      sharePhotoMailSubject: function() {
        return $.mustache(MOMENT_SHARE_PHOTOMAIL_TITLE, {
          date: this.viewOf.timestamp.toString(MOMENT_TITLE_DATE_FORMAT)
        })
      },
      sharePhotoPageTitle: function() {
        return $.mustache(MOMENT_SHARE_PHOTOPAGE_TITLE, {
          date: this.viewOf.timestamp.toString(SHARE_GROUP_PHOTOPAGE_DATE_FORMAT)
        })
      }
    },
    gridOptions: {
      previewOptions: {
        features: {
          hide: !0
        }
      },
      respectShowHiddenPref: !0,
      dimHiddenItems: !0
    },
    photoViewerFeatures: {
      jumpToMoment: !1
    }
  }, c);
  d.subscribe("contextTitle", "Context/set/timestamp", function(b) {
    b === d.viewOf && d.isActive && d.updateUI()
  });
  d.subscribe("photoVisibility", "Photo/set/visibility",
    function(b) {
      0 <= d.viewOf.photos.indexOf(b) && d.isActive && d.updateUI()
    })
}
$.extend(!0, MomentView.prototype, ContextView.prototype);
MomentView.prototype.activate = function(a, b) {
  if (this.isActive) return $.rejected;
  _(this.grids).invoke("setShowHiddenItems", !! Preferences.get("show_hidden"));
  return ContextView.prototype.activate.call(this, a, b)
};

function SetView(a, b, c) {
  var d = this;
  ContextView.call(d, a, b, c);
  $.extend(!0, d, {
    viewClass: "set",
    lobbyView: SourceYears.getView("sources-" + b.year) || SourceYears.emptyView,
    features: {
      miscMenu: !0,
      photoCount: !0,
      hide: !1,
      baleet: !1,
      editTime: !1,
      download: !0,
      sharing: !1,
      slideshow: !0
    },
    navDrawerTags: {
      viewType: "photos",
      filterType: b.filterSourceType
    },
    gridOptions: {
      previewOptions: {
        features: {
          hide: !0
        }
      },
      respectShowHiddenPref: !0,
      dimHiddenItems: !0
    }
  }, c);
  d.subscribe("contextTitle", "Context/set/timestamp", function(b) {
    b === d.viewOf &&
      d.isActive && d.updateUI()
  });
  d.subscribe("photoVisibility", "Photo/set/visibility", function(b) {
    0 <= d.viewOf.photos.indexOf(b) && d.isActive && d.updateUI()
  })
}
$.extend(!0, SetView.prototype, ContextView.prototype);
SetView.prototype.activate = function(a, b) {
  if (this.isActive) return $.rejected;
  _(this.grids).invoke("setShowHiddenItems", !! Preferences.get("show_hidden"));
  return ContextView.prototype.activate.call(this, a, b)
};

function PhotoMailView(a, b, c) {
  ContextView.call(this, a, b, c);
  $.extend(!0, this, {
    viewClass: "photomail",
    lobbyView: PhotoMailsView,
    features: {
      miscMenu: !0,
      photoCount: !0,
      hide: !1,
      baleet: !1,
      editTime: !1,
      download: !0,
      sharing: !0,
      slideshow: !0
    },
    templates: {
      view: {
        selector: "#template-photoMail-view",
        options: {
          senderName: function() {
            return this.viewOf.sender.name
          },
          sentDate: function() {
            return this.viewOf.timestamp.toString(PHOTOMAIL_SENT_DATE_FORMAT)
          },
          body: function() {
            return this.viewOf.body
          }
        }
      }
    },
    navDrawerTags: {
      viewType: "photomails"
    },
    gridOptions: {
      photoViewerOptions: {
        features: {
          jumpToMoment: !1
        }
      }
    }
  }, c)
}
$.extend(!0, PhotoMailView.prototype, ContextView.prototype);
PhotoMailView.prototype.activate = function(a, b) {
  var c = this;
  return ContextView.prototype.activate.call(c, a, b).done(function() {
    c.viewOf.mark(!0)
  })
};

function HighlightYearView(a, b, c) {
  MonthsView.call(this, a, c);
  ContextView.call(this, a, b, c);
  $.extend(!0, this, {
    viewClass: "highlights-year",
    isLobbyView: !0,
    features: {
      miscMenu: !1,
      photoCount: !1,
      hide: !1,
      baleet: !1,
      editTime: !1,
      download: !1,
      sharing: !0,
      slideshow: !0
    },
    templates: {
      view: {
        options: {
          hasControls: !0
        }
      },
      miscMenu: !1,
      emptyMessage: {
        selector: "#template-highlightYear-emptyMessage",
        options: {
          thisView: this.viewOf.year
        }
      }
    },
    navBarSections: {
      left: "default",
      center: "year"
    },
    navDrawerTags: {
      viewType: "photos",
      filterType: "highlights"
    },
    strings: {
      navBarTitle: HIGHLIGHTYEAR_TITLE_NAVBAR,
      footnoteNavigationTitle: function() {
        return this.viewOf.year
      },
      fetchMessageBusy: function() {
        return $.mustache(HIGHLIGHTYEAR_FETCH_MESSAGE_BUSY, {
          year: this.viewOf.year
        })
      },
      fetchMessageError: function() {
        return $.mustache(HIGHLIGHTYEAR_FETCH_MESSAGE_ERROR, {
          year: this.viewOf.year
        })
      },
      shareFacebookTitle: SHARE_DEFAULT_TITLE,
      sharePhotoMailSubject: SHARE_DEFAULT_TITLE,
      sharePhotoPageTitle: !1
    },
    gridOptions: {
      dropCap: !0,
      previewOptions: {
        features: {
          dateTray: !0,
          relativeDate: !1
        },
        templates: {
          preview: {
            options: {
              absoluteDate: function() {
                return this.previewOf.timestamp instanceof XDate ? this.previewOf.timestamp.toString(HIGHLIGHTYEAR_PHOTO_PREVIEW_DATE_FORMAT) : !1
              }
            }
          }
        }
      },
      respectSortOrderPref: !0
    },
    hasFootnoteNavigation: !0
  }, c);
  ViewControls.call(this)
}
$.extend(!0, HighlightYearView.prototype, MonthsView.prototype, ContextView.prototype, ViewControls.prototype);
HighlightYearView.prototype.build = function() {
  var a = this;
  return ContextView.prototype.build.call(a).done(function() {
    a.buildViewControls()
  })
};
HighlightYearView.prototype.setupGrids = MonthsView.prototype.setupGrids;
HighlightYearView.prototype.destruct = function(a) {
  this.isActive && HighlightYears.activateNearest(this);
  return ContextView.prototype.destruct.call(this, a)
};

function HighlightMonthView(a, b, c) {
  ContextView.call(this, a, b, c);
  $.extend(!0, this, {
    viewClass: "highlights-month",
    isLobbyView: !0,
    features: {
      miscMenu: !1,
      photoCount: !1,
      hide: !1,
      baleet: !1,
      editTime: !1,
      download: !1,
      sharing: !0,
      slideshow: !0
    },
    templates: {
      view: {
        options: {
          hasControls: !0
        }
      },
      miscMenu: !1,
      emptyMessage: {
        selector: "#template-highlightYear-emptyMessage",
        options: {
          thisView: MONTHS[this.viewOf.month]
        }
      }
    },
    navBarSections: {
      left: "default",
      center: "year"
    },
    navDrawerTags: {
      viewType: "photos",
      filterType: "highlights"
    },
    strings: {
      navBarTitle: HIGHLIGHTYEAR_TITLE_NAVBAR,
      footnoteNavigationTitle: function() {
        return $.mustache(HIGHLIGHTMONTH_TITLE_FOOTNOTE, {
          month: MONTHS[this.viewOf.month],
          year: this.viewOf.year
        })
      },
      fetchMessageBusy: HIGHLIGHTMONTH_FETCH_MESSAGE_BUSY,
      fetchMessageError: function() {
        return $.mustache(HIGHLIGHTMONTH_FETCH_MESSAGE_ERROR, {
          year: this.viewOf.year
        })
      },
      shareFacebookTitle: SHARE_DEFAULT_TITLE,
      sharePhotoMailSubject: SHARE_DEFAULT_TITLE,
      sharePhotoPageTitle: !1
    },
    gridOptions: {
      title: $.mustache(MONTHSVIEW_GRID_TITLE, {
        month: MONTHS[this.viewOf.month],
        year: this.viewOf.year
      }),
      dropCap: !0,
      previewOptions: {
        features: {
          dateTray: !0,
          relativeDate: !1
        },
        templates: {
          preview: {
            options: {
              absoluteDate: function() {
                return this.previewOf.timestamp instanceof XDate ? this.previewOf.timestamp.toString(HIGHLIGHTYEAR_PHOTO_PREVIEW_DATE_FORMAT) : !1
              }
            }
          }
        }
      },
      respectSortOrderPref: !0
    },
    hasFootnoteNavigation: !0
  }, c);
  ViewControls.call(this)
}
$.extend(!0, HighlightMonthView.prototype, ContextView.prototype, ViewControls.prototype);
HighlightMonthView.prototype.build = function() {
  var a = this;
  return ContextView.prototype.build.call(a).done(function() {
    a.buildViewControls()
  })
};
HighlightMonthView.prototype.destruct = function(a) {
  this.isActive && HighlightYears.activateNearest(this);
  return ContextView.prototype.destruct.call(this, a)
};

function PhotoPageView(a, b, c) {
  ContextView.call(this, a, b, c);
  $.extend(!0, this, {
    viewClass: "photopage",
    lobbyView: PhotoPagesView,
    skipBreadcrumbs: !0,
    features: {
      miscMenu: !0,
      photoCount: !0,
      hide: !1,
      baleet: !0,
      editTime: !1,
      download: !1,
      sharing: !0,
      slideshow: !0
    },
    navBarSections: {
      right: "default"
    },
    gridOptions: {
      photoViewerOptions: {
        features: {
          jumpToMoment: !0
        }
      }
    }
  }, c)
}
$.extend(!0, PhotoPageView.prototype, ContextView.prototype);
PhotoPageView.prototype.enterSelectionMode = function(a, b) {
  var c = this,
    d, e = [],
    f = [];
  "selection" !== c.mode ? (BlockingActivity.show(c.id + "/selection", c.makeString("fetchMessageBusy")), _(b.candidateGroups).each(function(b) {
    b && _(b.refineAdditionalContexts).each(function(b) {
      e.push(b)
    })
  }), _(b.candidateGroups).each(function(b) {
    b && (b.photos ? e.push(b) : _(b.contexts).each(function(b) {
      e.push(b)
    }))
  }), d = _(e).map(function(b, a) {
    var c = $.Deferred();
    b.fetchAll ? b.fetchAll().always(function() {
      f = f.concat(b.photos);
      c.resolve()
    }) :
      (f = f.concat(b.photos), c.resolve());
    return c.promise()
  }), $.when.apply(c, d).always(function() {
    BlockingActivity.hide(c.id + "/selection");
    ContextView.prototype.enterSelectionMode.call(c, a, b).done(function() {
      f.length && (c.queueTask("selectionMode/build", "addCandidates", function() {
        f = _(f).difference(c.viewOf.items);
        _(f).each(function(b) {
          c.grids[0].add(b)
        });
        a.always(function() {
          _(f).each(function(b) {
            _(c.viewOf.items).contains(b) || c.grids[0].remove(b)
          })
        })
      }), c.queueTask("selectionMode/fetch", "dogEarPhotos", function() {
        _(c.viewOf.items).each(function(b) {
          c.grids[0].addDogEar(b.id)
        });
        a.always(function() {
          _(c.viewOf.items).each(function(b) {
            c.grids[0].removeDogEar(b.id)
          })
        })
      }))
    })
  })) : a.reject();
  return c
};

function SentMailView(a, b, c) {
  ContextView.call(this, a, b, c);
  $.extend(!0, this, {
    viewClass: "sentmail",
    lobbyView: SentMailsView,
    features: {
      miscMenu: !0,
      photoCount: !0,
      hide: !1,
      baleet: !1,
      editTime: !1,
      download: !0,
      sharing: !0,
      slideshow: !0
    },
    templates: {
      view: {
        selector: "#template-photoMail-view",
        options: {
          hasRecipients: function() {
            return !_(this.viewOf.recipients).isEmpty()
          },
          recipients: function() {
            return _(this.viewOf.recipients).map(function(b, a) {
              return {
                email: a,
                isUnread: 2 === b
              }
            })
          },
          sentDate: function() {
            return this.viewOf.timestamp.toString(PHOTOMAIL_SENT_DATE_FORMAT)
          },
          body: function() {
            return this.viewOf.body
          }
        }
      }
    },
    gridOptions: {
      photoViewerOptions: {
        features: {
          jumpToMoment: !1
        }
      }
    }
  }, c)
}
$.extend(!0, SentMailView.prototype, ContextView.prototype);

function CategoryView(a, b, c) {
  var d = this;
  FetcherView.call(d, a, b, c);
  $.extend(!0, d, {
    isLobbyView: !0,
    features: {
      sharing: !0
    },
    templates: {
      view: {
        options: {
          extraClasses: "categoryView"
        }
      }
    },
    navBarSections: {
      right: "share"
    },
    strings: {
      title: function() {
        return this.viewOf.makeString("title")
      }
    },
    gridType: "context",
    gridOptions: {
      id: a
    }
  }, c);
  d.subscribe("categoryDestruct", "Item/destruct", function(b) {
    b === d.viewOf && d.destruct()
  });
  d.subscribe("categoryChange", "Group/add Group/remove", function(b) {
    b === d.viewOf && d.isActive && d.updateUI()
  })
}
$.extend(!0, CategoryView.prototype, FetcherView.prototype);

function MomentYearView(a, b, c) {
  MonthsView.call(this, a, c);
  CategoryView.call(this, a, b, c);
  $.extend(!0, this, {
    viewClass: "moments-year",
    features: {
      sharing: !0
    },
    templates: {
      view: {
        options: {
          hasControls: !0
        }
      },
      emptyMessage: {
        selector: "#template-momentYear-emptyMessage",
        options: {
          thisView: this.viewOf.year
        }
      }
    },
    navBarSections: {
      center: "year"
    },
    navDrawerTags: {
      viewType: "photos",
      filterType: "all"
    },
    strings: {
      navBarTitle: MOMENTYEAR_TITLE_NAVBAR,
      footnoteNavigationTitle: function() {
        return this.viewOf.year
      },
      fetchMessageBusy: MOMENTYEAR_FETCH_MESSAGE_BUSY,
      fetchMessageError: function() {
        return $.mustache(MOMENTYEAR_FETCH_MESSAGE_ERROR, {
          year: this.viewOf.year
        })
      }
    },
    gridOptions: {
      previewOptions: {
        templates: {
          preview: {
            options: {
              extraClasses: "momentPreview",
              viewID: function() {
                return "moment-" + this.previewOf.id
              },
              title: function() {
                return this.previewOf.timestamp.toString(MOMENT_PREVIEW_DATE_FORMAT)
              },
              timeOfDay: function() {
                return this.previewOf.getTimeOfDayString()
              }
            }
          }
        }
      },
      respectShowHiddenPref: !0,
      respectSortOrderPref: !0
    },
    hasFootnoteNavigation: !0
  }, c);
  ViewControls.call(this)
}
$.extend(!0, MomentYearView.prototype, MonthsView.prototype, CategoryView.prototype, ViewControls.prototype);
MomentYearView.prototype.build = function() {
  var a = this;
  return CategoryView.prototype.build.call(a).done(function() {
    a.buildViewControls()
  })
};
MomentYearView.prototype.setupGrids = MonthsView.prototype.setupGrids;
MomentYearView.prototype.destruct = function() {
  this.isActive && MomentYears.activateNearest(this);
  return CategoryView.prototype.destruct.call(this)
};

function MomentMonthView(a, b, c) {
  CategoryView.call(this, a, b, c);
  $.extend(!0, this, {
    viewClass: "moments-month",
    features: {
      sharing: !0
    },
    templates: {
      view: {
        options: {
          hasControls: !0
        }
      },
      emptyMessage: {
        selector: "#template-momentYear-emptyMessage",
        options: {
          thisView: MONTHS[this.viewOf.month]
        }
      }
    },
    navBarSections: {
      center: "year"
    },
    navDrawerTags: {
      viewType: "photos",
      filterType: "all"
    },
    strings: {
      navBarTitle: MOMENTYEAR_TITLE_NAVBAR,
      footnoteNavigationTitle: function() {
        return $.mustache(MOMENTMONTH_TITLE_FOOTNOTE, {
          month: MONTHS[this.viewOf.month],
          year: this.viewOf.year
        })
      },
      fetchMessageBusy: MOMENTMONTH_FETCH_MESSAGE_BUSY,
      fetchMessageError: function() {
        return $.mustache(MOMENTMONTH_FETCH_MESSAGE_ERROR, {
          year: this.viewOf.year
        })
      }
    },
    gridOptions: {
      title: $.mustache(MONTHSVIEW_GRID_TITLE, {
        month: MONTHS[this.viewOf.month],
        year: this.viewOf.year
      }),
      previewOptions: {
        templates: {
          preview: {
            options: {
              extraClasses: "momentPreview",
              viewID: function() {
                return "moment-" + this.previewOf.id
              },
              title: function() {
                return this.previewOf.timestamp.toString(MOMENT_PREVIEW_DATE_FORMAT)
              },
              timeOfDay: function() {
                return this.previewOf.getTimeOfDayString()
              }
            }
          }
        }
      },
      respectShowHiddenPref: !0,
      respectSortOrderPref: !0
    },
    hasFootnoteNavigation: !0
  }, c);
  ViewControls.call(this)
}
$.extend(!0, MomentMonthView.prototype, CategoryView.prototype, ViewControls.prototype);
MomentMonthView.prototype.build = function() {
  var a = this;
  return CategoryView.prototype.build.call(a).done(function() {
    a.buildViewControls()
  })
};
MomentMonthView.prototype.destruct = function(a) {
  this.isActive && MomentYears.activateNearest(this);
  return CategoryView.prototype.destruct.call(this, a)
};

function SourceYearView(a, b, c) {
  var d = this;
  MonthsView.call(d, a, c);
  CategoryView.call(d, a, b, c);
  $.extend(!0, d, {
    viewClass: "sources-year",
    state: SourceYears.getFilterState(),
    features: {
      sharing: !0
    },
    templates: {
      view: {
        options: {
          hasControls: !0
        }
      },
      emptyMessage: {
        selector: "#template-sourceYear-emptyMessage",
        options: {
          thisView: this.viewOf.year
        }
      },
      emptyFilterMessage: {
        selector: "#template-source-emptyFilterMessage",
        options: {
          sourceName: function() {
            return Sources.getSetSources()[this.state] || "sources"
          },
          thisView: this.viewOf.year
        }
      }
    },
    navBarSections: {
      center: "year"
    },
    navDrawerTags: {
      viewType: "photos",
      filterType: !1
    },
    strings: {
      navBarTitle: function() {
        return $.mustache(SOURCEYEAR_TITLE_NAVBAR, {
          sourceTitle: Sources.getSetSources()[this.state] || "All Sources"
        })
      },
      footnoteNavigationTitle: function() {
        return this.viewOf.year
      },
      fetchMessageBusy: SOURCEYEAR_FETCH_MESSAGE_BUSY,
      fetchMessageError: function() {
        return $.mustache(SOURCEYEAR_FETCH_MESSAGE_ERROR, {
          year: this.viewOf.year
        })
      }
    },
    gridOptions: {
      previewOptions: {
        templates: {
          preview: {
            options: {
              extraClasses: "setPreview",
              viewID: function() {
                return "set-" + this.previewOf.id
              },
              title: function() {
                return this.previewOf.setName
              },
              filterSourceType: function() {
                return this.previewOf.filterSourceType
              }
            }
          }
        }
      },
      respectShowHiddenPref: !0,
      respectSortOrderPref: !0,
      getPreviewsForLayout: function(b) {
        var a, c = SourceYears.getFilterState();
        a = "all" === c ? $.merge([], this.previews) : _(this.previews).filter(function(b) {
          return b.previewOf.filterSourceType === c
        });
        a = this.showHiddenItems ? a : _(a).filter(function(b) {
          return !!b.previewOf.visibility
        });
        return b ? _(a).first(b) :
          a
      }
    },
    hasFootnoteNavigation: !0
  }, c);
  ViewControls.call(d);
  d.subscribe("filter", "SourceYears/filterTo", function(b) {
    b !== d.state && d.setState(b)
  })
}
$.extend(!0, SourceYearView.prototype, MonthsView.prototype, CategoryView.prototype, ViewControls.prototype);
SourceYearView.prototype.build = function() {
  var a = this;
  return CategoryView.prototype.build.call(a).done(function() {
    a.buildViewControls()
  })
};
SourceYearView.prototype.setState = function(a) {
  var b = this;
  return CategoryView.prototype.setState.call(b, a).done(function() {
    b.navDrawerTags.filterType = a;
    b.updateUI();
    _(b.grids).invoke("layout");
    SourceYears.filterTo(a)
  })
};
SourceYearView.prototype.hasState = function(a) {
  return "all" === a || !! Sources.getSetSources()[a]
};
SourceYearView.prototype.setupGrids = MonthsView.prototype.setupGrids;
SourceYearView.prototype.destruct = function() {
  this.isActive && SourceYears.activateNearest(this);
  return CategoryYear.prototype.destruct.call(this)
};
SourceYearView.prototype.checkEmptiness = function() {
  var a = this,
    b = SourceYears.getFilterState(),
    c;
  c = _(a.grids).every(function(b) {
    return b.checkEmptiness()
  });
  a.isEmpty !== c && (a.isEmpty = c, PubHub.pub("View/markEmpty", a, c));
  a.$view && (a.destroyElement("emptyMessage"), a.destroyElement("emptyFilterMessage"), a.isEmpty ? (a.$view.addClass("empty"), "all" !== b && -1 === a.viewOf.contextSources.indexOf(b) ? a.buildElement("emptyFilterMessage", null, !0).done(function(b) {
      a.$view.append(b)
    }) : a.buildElement("emptyMessage").done(function(b) {
      a.$view.append(b)
    })) :
    a.$view.removeClass("empty"));
  return a.isEmpty
};

function SourceMonthView(a, b, c) {
  var d = this;
  CategoryView.call(d, a, b, c);
  $.extend(!0, d, {
    viewClass: "sources-month",
    state: SourceYears.getFilterState(),
    features: {
      sharing: !0
    },
    templates: {
      view: {
        options: {
          hasControls: !0
        }
      },
      emptyMessage: {
        selector: "#template-sourceYear-emptyMessage",
        options: {
          thisView: MONTHS[this.viewOf.month]
        }
      },
      emptyFilterMessage: {
        selector: "#template-source-emptyFilterMessage",
        options: {
          sourceName: function() {
            return Sources.getSetSources()[this.state] || "sources"
          },
          thisView: MONTHS[this.viewOf.month]
        }
      }
    },
    navBarSections: {
      center: "year"
    },
    navDrawerTags: {
      viewType: "photos",
      filterType: !1
    },
    strings: {
      navBarTitle: function() {
        return $.mustache(SOURCEYEAR_TITLE_NAVBAR, {
          sourceTitle: Sources.getSetSources()[this.state] || "All Sources"
        })
      },
      footnoteNavigationTitle: function() {
        return $.mustache(SOURCEMONTH_TITLE_FOOTNOTE, {
          month: MONTHS[this.viewOf.month],
          year: this.viewOf.year
        })
      },
      fetchMessageBusy: SOURCEMONTH_FETCH_MESSAGE_BUSY,
      fetchMessageError: function() {
        return $.mustache(SOURCEMONTH_FETCH_MESSAGE_ERROR, {
          year: this.viewOf.year
        })
      }
    },
    gridOptions: {
      title: $.mustache(MONTHSVIEW_GRID_TITLE, {
        month: MONTHS[d.viewOf.month],
        year: d.viewOf.year
      }),
      previewOptions: {
        templates: {
          preview: {
            options: {
              extraClasses: "setPreview",
              viewID: function() {
                return "set-" + this.previewOf.id
              },
              title: function() {
                return this.previewOf.setName
              },
              filterSourceType: function() {
                return this.previewOf.filterSourceType
              }
            }
          }
        }
      },
      respectShowHiddenPref: !0,
      respectSortOrderPref: !0,
      getPreviewsForLayout: function(b) {
        var a, c = SourceYears.getFilterState();
        a = "all" === c ? $.merge([], this.previews) :
          _(this.previews).filter(function(b) {
            return b.previewOf.filterSourceType === c
          });
        a = this.showHiddenItems ? a : _(a).filter(function(b) {
          return !!b.previewOf.visibility
        });
        return b ? _(a).first(b) : a
      }
    },
    hasFootnoteNavigation: !0
  }, c);
  ViewControls.call(d);
  d.subscribe("filter", "SourceYears/filterTo", function(b) {
    b !== d.state && d.setState(b)
  })
}
$.extend(!0, SourceMonthView.prototype, CategoryView.prototype, ViewControls.prototype);
SourceMonthView.prototype.build = function() {
  var a = this;
  return CategoryView.prototype.build.call(a).done(function() {
    a.buildViewControls()
  })
};
SourceMonthView.prototype.setState = function(a) {
  var b = this;
  return CategoryView.prototype.setState.call(b, a).done(function() {
    b.navDrawerTags.filterType = a;
    b.updateUI();
    _(b.grids).invoke("layout");
    SourceYears.filterTo(a)
  })
};
SourceMonthView.prototype.hasState = function(a) {
  return "all" === a || !! Sources.getSetSources()[a]
};
SourceMonthView.prototype.destruct = function(a) {
  this.isActive && SourceMonthView.activateNearest(this);
  return CategoryView.prototype.destruct.call(this, a)
};
SourceMonthView.prototype.checkEmptiness = function() {
  var a = this,
    b = SourceYears.getFilterState(),
    c;
  c = _(a.grids).every(function(b) {
    return b.checkEmptiness()
  });
  a.isEmpty !== c && (a.isEmpty = c, PubHub.pub("View/markEmpty", a, c));
  a.$view && (a.destroyElement("emptyMessage"), a.destroyElement("emptyFilterMessage"), a.isEmpty ? (a.$view.addClass("empty"), "all" !== b && -1 === a.viewOf.contextSources.indexOf(b) ? a.buildElement("emptyFilterMessage", null, !0).done(function(b) {
      a.$view.append(b)
    }) : a.buildElement("emptyMessage").done(function(b) {
      a.$view.append(b)
    })) :
    a.$view.removeClass("empty"));
  return a.isEmpty
};

function Sheet(a, b, c) {
  $.extend(!0, this, {
    id: a,
    templates: {
      sheet: {
        selector: "#template-sheet",
        options: {
          id: a,
          viewID: b.id,
          hasFootnoteNavigation: function() {
            return this.hasFootnoteNavigation
          }
        }
      }
    },
    hasFootnoteNavigation: !1,
    strings: {
      footnoteNavigationTitle: function() {
        return this.makeString("title")
      }
    }
  }, c, {
    view: b,
    isActive: !1,
    isDestructed: !1,
    scrollPosition: 0
  });
  this.fullID = this.view.id + "/" + this.id;
  Strings.call(this);
  Subscriptions.call(this);
  Templates.call(this);
  Tracking.call(this)
}
$.extend(!0, Sheet.prototype, Strings.prototype, Subscriptions.prototype, Templates.prototype, Tracking.prototype);
Sheet.prototype.destruct = function() {
  var a = this;
  return a.deactivate().always(function() {
    a.isDestructed = !0;
    a.destroyAllElements();
    a.unsubscribeAll()
  })
};
Sheet.prototype.activate = function(a) {
  function b() {
    c.startTrackingSession();
    $(window).on("blur." + c.id, function() {
      var b = $.now();
      $(window).one("focus." + c.id, function() {
        1E4 < $.now() - b && (c.stopTrackingSession(b), c.startTrackingSession())
      })
    });
    c.$sheet.addClass("active");
    a || (c.scrollPosition = 0);
    _.defer(function() {
      $(window).scrollTop(c.scrollPosition)
    });
    PubHub.pub("Sheet/activate", c);
    d.resolve()
  }
  var c = this,
    d = $.Deferred();
  c.isActive ? d.reject() : (c.isActive = !0, c.$sheet ? b() : c.build().done(b));
  return d.promise()
};
Sheet.prototype.deactivate = function() {
  var a = $.Deferred();
  this.isActive ? (this.isActive = !1, this.stopTrackingSession(), this.scrollPosition = $(window).scrollTop(), $(window).off(this.id), this.$sheet && this.$sheet.removeClass("active"), $(".messageBar[data-view='" + this.fullID + "']").each(function() {
    $(this).data("messageBar").close()
  }), PubHub.pub("Sheet/deactivate", this), a.resolve()) : a.reject();
  return a.promise()
};
Sheet.prototype.build = function() {
  var a = this,
    b = $.Deferred();
  $.when(a.buildElement("sheet"), a.buildElement("footer")).always(function(c, d) {
    c ? (d && d.appendTo(c), a.subscribe("keyboard", "Keyboard/shortcut", function(b) {
      return a.isActive ? !a.handleKeys(b) : !0
    }), b.resolve(c, d)) : b.reject()
  });
  return b.promise()
};
Sheet.prototype.handleKeys = function(a) {
  return !0
};
Sheet.prototype.showActionAlert = function(a, b) {
  this.isActive && this.$sheet && this.$sheet.showActionAlert(a, b)
};

function GridSheet(a, b, c) {
  var d = this;
  Sheet.call(d, a, b, c);
  $.extend(!0, d, {
    templates: {
      sheet: {
        options: {
          hasGrids: !0
        }
      }
    },
    strings: {
      updateMessage: VIEW_UPDATE_MESSAGE_DEFAULT,
      selectionActionAlertLabel: VIEW_ACTIONALERT_LABEL_SELECT
    },
    gridType: null,
    gridOptions: {
      id: "grid-" + a
    },
    isEmpty: void 0
  }, c, {
    mode: "browse",
    grids: []
  });
  Procrastination.call(d);
  TaskQueue.call(d);
  d.subscribe("gridEmptiness", "Grid/markEmpty", function(b, a) {
    _(d.grids).contains(b) && (d.isActive ? d.updateUI() : d.checkEmptiness())
  });
  d.subscribe("gridDestruction",
    "Grid/destruct", function(b) {
      b = _(d.grids).indexOf(b);
      0 <= b && (d.grids.splice(b, 1), d.isActive ? d.updateUI() : d.checkEmptiness())
    })
}
$.extend(!0, GridSheet.prototype, Sheet.prototype, Procrastination.prototype, TaskQueue.prototype);
GridSheet.prototype.build = function() {
  var a = this;
  return Sheet.prototype.build.call(a).done(function() {
    a.setupGrids().always(function() {
      "selection" === a.mode && a.executeAllTasks("selectionMode/build")
    })
  })
};
GridSheet.prototype.setupGrids = function() {
  var a = this,
    b;
  return (b = Grids.buildNew(a.gridType, [], a.viewOf, a.gridOptions)) ? (a.grids[0] = b, b.build().done(function() {
    a.$view.find(".view-grids").prepend(a.grids[0].$grid)
  })) : $.rejected
};
GridSheet.prototype.destruct = function() {
  var a = this;
  return View.prototype.destruct.call(a).done(function() {
    a.unsubscribeAll();
    _(a.grids).invoke("destruct")
  })
};
GridSheet.prototype.activate = function(a) {
  var b = this;
  return Sheet.prototype.activate.call(b, a).done(function() {
    "selection" === b.mode && b.executeAllTasks("selectionMode/activate");
    _(b.grids).invoke("activate");
    b.updateUI()
  })
};
GridSheet.prototype.deactivate = function() {
  var a = this;
  return Sheet.prototype.deactivate.call(a).done(function() {
    _(a.grids).invoke("deactivate");
    a.executeAllTasks("updates")
  })
};
GridSheet.prototype.updateUI = function() {
  var a = this;
  return a.$sheet ? a.procrastinate("updateUI", function() {
    a.checkEmptiness()
  }) : $.rejected
};
GridSheet.prototype.checkEmptiness = function() {
  var a = this,
    b;
  b = _(a.grids).every(function(b) {
    return b.checkEmptiness()
  });
  a.isEmpty !== b && (a.isEmpty = b, PubHub.pub("Sheet/markEmpty", a, b));
  a.$sheet && (a.$sheet.toggleClass("empty", a.isEmpty), a.isEmpty ? a.$emptyMessage || a.buildElement("emptyMessage").done(function(b) {
    a.$sheet.append(b)
  }) : a.destroyElement("emptyMessage"));
  return a.isEmpty
};
GridSheet.prototype.enterSelectionMode = function(a, b) {
  var c = this,
    d = $.Deferred();
  "selection" !== c.mode ? (c.mode = "selection", c.selection = a, c.queueTask("selectionMode/build", "getSelectors", function() {
    c.selectors = _(c.grids).chain().map(function(b) {
      return b.startSelection(a)
    }).compact().value()
  }), c.queueTask("selectionMode/activate", "setUI", function() {
    c.setSelectionUI(!0)
  }), c.isActive && c.selection.showActionAlert && c.showActionAlert(c.makeString("selectionActionAlertLabel"), "select"), c.$sheet && c.procrastinate("selectionModeSetup",
    function() {
      c.selection === a && (c.$sheet && c.executeAllTasks("selectionMode/build"), c.isActive && c.executeAllTasks("selectionMode/activate"))
    }), d.resolve()) : (a.reject(), d.reject());
  return d.promise()
};
GridSheet.prototype.exitSelectionMode = function() {
  var a = $.Deferred();
  "selection" === this.mode ? (this.mode = "browse", delete this.selection, delete this.selectors, this.$sheet && (_(this.grids).invoke("endSelection"), this.setSelectionUI(!1)), this.dequeueAllTasks("selectionMode/build"), this.dequeueAllTasks("selectionMode/activate"), a.resolve()) : a.reject();
  return a.promise()
};
GridSheet.prototype.setSelectionUI = function(a) {
  this.$sheet && this.$sheet.toggleClass("selectionMode", a)
};

function FetcherSheet(a, b, c, d) {
  var e = this;
  GridSheet.call(e, a, b, d);
  $.extend(!0, e, {
    strings: {
      updateMessage: function() {
        return $.mustache(VIEW_UPDATE_MESSAGE_FETCHER, {
          groupName: this.group.makeString("groupName")
        })
      },
      fetchMessageBusy: function() {
        return $.mustache(VIEW_FETCH_MESSAGE_BUSY, {
          itemsName: this.group.makeString("itemsName")
        })
      },
      fetchMessageError: function() {
        return $.mustache(VIEW_FETCH_MESSAGE_ERROR, {
          itemsName: this.group.makeString("itemsName")
        })
      }
    },
    fetchOnScroll: !0,
    skipSelectionFetching: !1
  }, d);
  e.group =
    c;
  e.group.fetch && e.subscribe("groupFetch", "Group/fetch", function(b) {
    b === e.group && (e.isActive ? e.updateUI() : e.checkEmptiness())
  })
}
$.extend(!0, FetcherSheet.prototype, GridSheet.prototype);
FetcherSheet.prototype.activate = function(a) {
  var b = this;
  return GridSheet.prototype.activate.call(b, a).done(function() {
    b.group.fetch && ("selection" === b.mode ? b.requestFetchAll().done(function() {
      "selection" === b.mode && _(function() {
        b.executeAllTasks("selectionMode/fetch")
      }).defer()
    }) : b.group.fetchedOnce ? b.toggleFetchOnScroll(!0) : b.requestFetch().done(function() {
      b.toggleFetchOnScroll(!0)
    }))
  })
};
FetcherSheet.prototype.deactivate = function() {
  var a = this;
  return GridSheet.prototype.deactivate.call(a).done(function() {
    a.fetchOnScroll && a.toggleFetchOnScroll(!1);
    a.group.isDestructed && !a.isDestructed && a.destruct()
  })
};
FetcherSheet.prototype.updateUI = function() {
  var a = this;
  return a.$sheet ? a.procrastinate("updateUI", function() {
    a.group.fetchedOnce && a.checkEmptiness();
    a.$sheet && (a.$sheet.toggleClass("pending", !a.group.fetchedOnce), a.hasFootnoteNavigation && (a.prevView ? a.$sheet.find(".view-footnote-prev").removeClass("hidden").attr("href", "#view=" + a.prevView.id).text(a.prevView.makeString("footnoteNavigationTitle")) : a.$sheet.find(".view-footnote-prev").addClass("hidden").text(""), a.nextView ? a.$sheet.find(".view-footnote-next").removeClass("hidden").attr("href",
      "#view=" + a.nextView.id).text(a.nextView.makeString("footnoteNavigationTitle")) : a.$sheet.find(".view-footnote-next").addClass("hidden").text("")))
  }) : $.rejected
};
FetcherSheet.prototype.handleKeys = function(a) {
  var b = !1;
  2 === a.length ? a[0].which === KEYCODES.f && a[1].which === KEYCODES.a && (this.requestFetchAll(), b = !0) : 1 === a.length && (a[0].which === KEYCODES.j && this.prevView ? (this.prevView.activate(), b = !0) : a[0].which === KEYCODES.k && this.nextView && (this.nextView.activate(), b = !0));
  return b
};
FetcherSheet.prototype.requestFetch = function(a) {
  var b = this;
  return b.isActive && b.group && b.group.fetch && b.group.fetchContinue ? (DiscreetActivity.show(b.id + "/fetch", b.makeString("fetchMessageBusy")), b.group.fetch(a).always(function() {
    DiscreetActivity.hide(b.id + "/fetch")
  }).fail(function(a, d) {
    b.isActive && "abort" !== d && MessageBars.buildNew(b.makeString("fetchMessageError"), {
      extraClasses: "alert " + b.id
    })
  })) : $.rejected
};
FetcherSheet.prototype.requestFetchAll = function() {
  var a = this,
    b = $.Deferred();
  a.isActive && a.group && a.group.fetchAll ? a.group.fetchContinue ? (BlockingActivity.show(a.id + "/fetch", a.makeString("fetchMessageBusy")), b.follow(a.group.fetchAll().always(function() {
    BlockingActivity.hide(a.id + "/fetch")
  }).fail(function(b, d) {
    a.isActive && "abort" !== d && MessageBars.buildNew(a.makeString("fetchMessageError"), {
      extraClasses: "alert " + a.id
    })
  }))) : b.resolve() : b.reject();
  return b.promise()
};
FetcherSheet.prototype.toggleFetchOnScroll = function(a) {
  var b = this;
  b.fetchOnScroll && (b.group && b.group.fetch) && (a ? b.isActive && b.group.fetchContinue && b.subscribe("scrollPosition", "Viewport/update", function(a) {
    0 < a.deltas.top && ("browse" === b.mode && b.group.fetchContinue && Viewport.withinYOfBottom(VIEW_FETCH_THRESHOLD)) && (b.toggleFetchOnScroll(!1), b.requestFetch().done(function() {
      b.group.fetchContinue && _(function() {
        b.toggleFetchOnScroll(!0)
      }).delay(1E3)
    }))
  }) : b.unsubscribe("scrollPosition"))
};
FetcherSheet.prototype.enterSelectionMode = function(a, b) {
  var c = this,
    d = $.Deferred();
  "selection" !== c.mode ? !c.isActive || a.skipFetching || c.skipSelectionFetching ? d.follow(GridSheet.prototype.enterSelectionMode.call(c, a, b)) : c.requestFetchAll().always(function() {
    d.follow(GridSheet.prototype.enterSelectionMode.call(c, a, b)).done(function() {
      _(function() {
        c.executeAllTasks("selectionMode/fetch")
      }).defer()
    })
  }) : (a.reject(), d.reject());
  return d.promise()
};
FetcherSheet.prototype.exitSelectionMode = function() {
  var a = this;
  return GridSheet.prototype.exitSelectionMode.call(a).done(function() {
    a.dequeueAllTasks("selectionMode/fetch")
  })
};
FetcherSheet.prototype.setNextView = function(a) {
  a !== this.nextView && (this.nextView = a, this.isActive && this.updateUI())
};
FetcherSheet.prototype.setPrevView = function(a) {
  a !== this.prevView && (this.prevView = a, this.isActive && this.updateUI())
};

function Sampler(a, b, c) {
  $.extend(!0, this, {
    id: a,
    inView: b,
    templates: {
      sampler: {
        selector: "#template-sampler",
        options: {
          id: a,
          title: function() {
            return this.makeString("title")
          },
          description: function() {
            return this.makeString("description")
          },
          moreLink: !1,
          moreLinkTitle: SAMPLER_SEEMORE_TITLE
        }
      }
    },
    strings: {
      title: "Sampler",
      description: !1
    }
  }, c, {
    isActive: !1,
    isEmpty: void 0
  });
  Strings.call(this);
  Templates.call(this)
}
$.extend(!0, Sampler.prototype, Strings.prototype, Templates.prototype);
Sampler.prototype.destruct = function() {
  var a = this;
  return a.deactivate().always(function() {
    a.isDestructed = !0;
    a.destroyAllElements();
    _.defer(function() {
      PubHub.pub("Sampler/destruct", a)
    })
  })
};
Sampler.prototype.activate = function() {
  var a = $.Deferred();
  !this.isActive && this.$sampler ? (this.isActive = !0, PubHub.pub("Sampler/activate", this), a.resolve()) : a.reject();
  return a.promise()
};
Sampler.prototype.deactivate = function() {
  var a = $.Deferred();
  this.isActive ? (this.isActive = !1, PubHub.pub("Sampler/deactivate", this), a.resolve()) : a.reject();
  return a.promise()
};
Sampler.prototype.build = function() {
  return this.buildElement("sampler")
};

function GridSampler(a, b, c) {
  var d = this;
  Sampler.call(d, a, b, c);
  $.extend(!0, d, {
    templates: {
      sampler: {
        options: {
          hasGrids: !0
        }
      },
      emptyMessage: !1
    },
    gridType: null,
    gridOptions: {
      id: "grid-" + a,
      columnsPerRow: function() {
        var b = Viewport.getColumns();
        return b - b % 4
      },
      rowLimit: 3,
      rollingScroll: !1,
      showHiddenItems: !1
    }
  }, c, {
    grids: []
  });
  Procrastination.call(d);
  Subscriptions.call(d);
  d.subscribe("gridEmptiness", "Grid/markEmpty", function(b, a) {
    _(d.grids).contains(b) && (d.isActive ? d.updateUI() : d.checkEmptiness())
  })
}
$.extend(!0, GridSampler.prototype, Sampler.prototype, Procrastination.prototype, Subscriptions.prototype);
GridSampler.prototype.activate = function() {
  var a = this;
  return Sampler.prototype.activate.call(a).done(function() {
    _(a.grids).each(function(b) {
      b.layout().always(function() {
        b.activate()
      })
    });
    a.updateUI()
  })
};
GridSampler.prototype.deactivate = function() {
  var a = this;
  return Sampler.prototype.deactivate.call(a).done(function() {
    _(a.grids).invoke("deactivate")
  })
};
GridSampler.prototype.build = function() {
  var a = this;
  return Sampler.prototype.build.call(a).done(function() {
    a.setupGrids()
  })
};
GridSampler.prototype.setupGrids = function() {
  var a = this,
    b;
  return (b = Grids.buildNew(a.gridType, [], a.samplerOf, a.gridOptions)) ? (a.grids[0] = b, b.build().done(function() {
    a.$sampler.find(".sampler-grids").prepend(a.grids[0].$grid)
  })) : $.rejected
};
GridSampler.prototype.destruct = function() {
  var a = this;
  return Sampler.prototype.destruct.call(a).done(function() {
    _(a.grids).invoke("destruct")
  })
};
GridSampler.prototype.updateUI = function() {
  var a = this;
  return a.$sampler ? a.procrastinate("updateUI", function() {
    a.checkEmptiness()
  }) : $.rejected
};
GridSampler.prototype.checkEmptiness = function() {
  var a = this,
    b;
  b = _(a.grids).every(function(b) {
    return b.checkEmptiness()
  });
  a.isEmpty !== b && (a.isEmpty = b, PubHub.pub("Sampler/markEmpty", a, b));
  a.$sampler && (a.$sampler.toggleClass("empty", a.isEmpty), a.isEmpty ? a.$emptyMessage || a.buildElement("emptyMessage").done(function(b) {
    a.$sampler.append(b)
  }) : a.destroyElement("emptyMessage"));
  return a.isEmpty
};

function FetcherSampler(a, b, c, d) {
  var e = this;
  GridSampler.call(e, a, b, d);
  $.extend(!0, e, {
    templates: {
      sampler: {
        options: {
          hasLoadMore: function() {
            return this.allowLoadMore
          }
        }
      }
    },
    strings: {
      fetchMessageBusy: SAMPLER_FETCH_MESSAGE_BUSY,
      fetchMessageError: SAMPLER_FETCH_MESSAGE_ERROR
    },
    allowLoadMore: !1
  }, d);
  e.samplerOf = c;
  e.samplerOf.fetch && e.subscribe("groupFetch", "Group/fetch", function(b) {
    b === e.samplerOf && (e.isActive ? e.updateUI() : e.checkEmptiness())
  })
}
$.extend(!0, FetcherSampler.prototype, GridSampler.prototype);
FetcherSampler.prototype.activate = function() {
  var a = this;
  return GridSampler.prototype.activate.call(a).done(function() {
    a.samplerOf.fetch && !a.samplerOf.fetchedOnce && a.requestFetch()
  })
};
FetcherSampler.prototype.build = function() {
  var a = this;
  return GridSampler.prototype.build.call(a).done(function(b) {
    if (b && a.allowLoadMore) b.find(".sampler-loadMore").on("click", function() {
      var b = $(this),
        d = b.text(),
        e = b.attr("data-value-pending");
      b.hasClass("disabled") || (b.addClass("disabled spinning").text(e), a.loadMore().always(function() {
        b.removeClass("disabled spinning").text(d)
      }))
    })
  })
};
FetcherSampler.prototype.updateUI = function() {
  var a = this;
  return a.$sampler ? a.procrastinate("updateUI", function() {
    a.samplerOf.fetchedOnce ? (a.$sampler.removeClass("pending"), a.$pendingMessage && (a.$pendingMessage.find(".spinner").spinner().destruct(), a.destroyElement("pendingMessage")), a.checkEmptiness()) : a.$sampler.hasClass("pending") || (a.$sampler.addClass("pending"), a.buildElement("pendingMessage").done(function(b) {
      b && (b.find(".spinner").spinner({
        showing: !0,
        showAfter: 0,
        hideAfter: 0
      }), b.appendTo(a.$sampler))
    }))
  }) :
    $.rejected
};
FetcherSampler.prototype.requestFetch = function() {
  var a = this;
  return a.isActive && a.samplerOf && a.samplerOf.fetch && a.samplerOf.fetchContinue ? (DiscreetActivity.show(a.id + "/fetch", a.makeString("fetchMessageBusy")), a.samplerOf.fetch().always(function() {
    DiscreetActivity.hide(a.id + "/fetch")
  }).done(function() {
    a.$sampler.find(".sampler-loadMore").toggleClass("visible", a.samplerOf.fetchContinue)
  }).fail(function(b, c) {
    a.isActive && "abort" !== c && MessageBars.buildNew(a.makeString("fetchMessageError"), {
      extraClasses: "alert " + a.inView.id
    })
  })) :
    $.rejected
};
FetcherSampler.prototype.loadMore = function() {
  var a = this,
    b = $.Deferred(),
    c, d;
  a.allowLoadMore ? (c = $.Deferred(), d = $.Deferred(), d.follow(a.requestFetch()), _(function() {
    c.resolve()
  }).delay(1E3), b.follow($.when(d, c).done(function() {
    _(a.grids).each(function(b) {
      b.rollingScroll = !0;
      a.gridOptions.rowLimit && (b.rowLimit += a.gridOptions.rowLimit);
      b.layout()
    })
  }))) : b.reject();
  return b.promise()
};

function PhotoSampler(a, b, c, d) {
  FetcherSampler.call(this, a, b, c, d);
  $.extend(!0, this, {
    templates: {
      sampler: {
        options: {
          extraClasses: "photoSampler"
        }
      }
    },
    gridType: "photo",
    gridOptions: {
      handlePhotoViewer: !0
    }
  }, d)
}
$.extend(!0, PhotoSampler.prototype, FetcherSampler.prototype);

function ContextSampler(a, b, c, d) {
  FetcherSampler.call(this, a, b, c, d);
  $.extend(!0, this, {
    templates: {
      sampler: {
        options: {
          extraClasses: "contextSampler"
        }
      }
    },
    gridType: "context"
  }, d)
}
$.extend(!0, ContextSampler.prototype, FetcherSampler.prototype);

function FlashbackSampler(a, b, c) {
  var d = this;
  GridSampler.call(d, a, b, c);
  $.extend(!0, d, {
    templates: {
      sampler: {
        selector: "#template-flashback-sampler",
        options: {
          extraClasses: "flashbackSampler photoSampler",
          moreLink: "#view=flashback"
        }
      },
      subTitle: {
        selector: "#template-flashback-sampler-subTitle"
      },
      fetchBubble: {
        selector: "#template-flashback-sampler-fetchBubble"
      },
      emptyMessage: !1,
      pendingMessage: {
        selector: "#template-flashback-sampler-pendingMessage"
      }
    },
    strings: {
      title: FLASHBACK_TITLE,
      fetchMessageBusy: function(b) {
        return b instanceof
        TodayFetcher ? FLASHBACK_TODAY_FETCH_MESSAGE_BUSY : b instanceof ShuffleFetcher ? FLASHBACK_SHUFFLE_FETCH_MESSAGE_BUSY : $.mustache(SEMANTIC_FETCH_MESSAGE_BUSY, {
          tagTitle: SEMANTIC_TAGS[b.tags[0]].title
        })
      },
      fetchMessageError: function(b) {
        return b instanceof TodayFetcher ? FLASHBACK_TODAY_FETCH_MESSAGE_ERROR : b instanceof ShuffleFetcher ? FLASHBACK_SHUFFLE_FETCH_MESSAGE_ERROR : $.mustache(SEMANTIC_FETCH_MESSAGE_ERROR, {
          tagTitle: SEMANTIC_TAGS[b.tags[0]].title
        })
      }
    },
    gridOptions: {
      dropCap: !0,
      rowLimit: 2,
      fileByTimestamp: !1,
      handlePhotoViewer: !0,
      previewOptions: {
        features: {
          dateTray: !0
        }
      }
    }
  }, c, {
    primaryGroup: null
  });
  d.allowedActions = [];
  _(SEMANTIC_TAGS).each(function(a, c) {
    _(a.allowInViews).contains(b.id) && d.allowedActions.push({
      tag: c,
      title: a.title
    })
  });
  d.allowedActions.push({
    tag: "shuffle",
    title: "Shuffle"
  });
  d.subscribe("groupFetch", "Group/fetch", function(b) {
    b === d.primaryGroup && (d.isActive ? d.updateUI() : d.checkEmptiness())
  });
  d.subscribe("todayOverride", "Cookie/setLocal", function(b, a) {
    b === COOKIE_TODAYOVERRIDE_NAME && d.requestToday()
  })
}
$.extend(!0, FlashbackSampler.prototype, GridSampler.prototype);
FlashbackSampler.prototype.build = function() {
  var a = this;
  return Sampler.prototype.build.call(a).done(function(b) {
    if (b) b.find(".flashbackSampler-randomize").on("click", function() {
      a.requestRandom()
    })
  })
};
FlashbackSampler.prototype.activate = function() {
  var a = this;
  return GridSampler.prototype.activate.call(a).done(function() {
    a.primaryGroup || a.requestToday()
  })
};
FlashbackSampler.prototype.updateUI = function() {
  var a = this;
  return a.$sampler ? a.procrastinate("updateUI", function() {
    a.primaryGroup && a.primaryGroup.fetchedOnce ? (a.$sampler.removeClass("pending"), a.$pendingMessage && (a.$pendingMessage.find(".spinner").spinner().destruct(), a.destroyElement("pendingMessage")), a.checkEmptiness()) : a.$sampler.hasClass("pending") || (a.$sampler.addClass("pending"), a.buildElement("pendingMessage").done(function(b) {
      b.find(".spinner").spinner({
        showing: !0,
        showAfter: 0,
        hideAfter: 0
      });
      b.appendTo(a.$sampler)
    }))
  }) : $.rejected
};
FlashbackSampler.prototype.setPrimaryGroup = function(a) {
  var b = this,
    c = {};
  a !== b.primaryGroup && (b.primaryGroup = a, FlashbackView.setState(a instanceof TodayFetcher ? "today" : "explore"), b.$sampler && (a instanceof TodayFetcher ? (c.action = "today", c.title = (a.displayTimestamp || a.date).toString(FLASHBACK_TODAY_DATE_FORMAT)) : a instanceof ShuffleFetcher ? (c.action = "shuffle", c.title = "Shuffle") : a instanceof InterestingFetcher && (c.action = a.tags[0], c.title = SEMANTIC_TAGS[a.tags[0]].title), b.destroyElement("subTitle"), b.buildElement("subTitle",
    c, !0).done(function(a) {
    a && b.$sampler.find(".sampler-title").append(a)
  })))
};
FlashbackSampler.prototype.getFetcher = function(a) {
  var b, c = {
      resources: {
        fetchItems: {
          params: {
            limit: FETCH_LIMIT_FLASHBACK_DOUBLE
          }
        }
      }
    };
  "today" === a ? (b = {
    tag: "today",
    title: "Today"
  }, c.mode = "photos") : b = a && a.tag ? a : FlashbackHelper.chooseAction(this.allowedActions, a);
  PubHub.pub("Flashback/fetch", b.tag === a ? a : "random", "sampler");
  return FlashbackHelper.getFetcher(b, c)
};
FlashbackSampler.prototype.requestFetch = function(a, b) {
  var c = this,
    d = [],
    e, f = $.Deferred();
  c.isActive ? (DiscreetActivity.show(c.id + "/fetch", c.makeString("fetchMessageBusy", a)), d.push(a.fetch()), b && (e = $.Deferred(), d.push(e), _(function() {
    e.resolve()
  }).delay(1E3)), $.when.apply(null, d).always(function() {
    DiscreetActivity.hide(c.id + "/fetch")
  }).done(function() {
    a.items.length ? f.resolve() : (a instanceof InterestingFetcher && (c.allowedActions = _(c.allowedActions).reject(function(b) {
      return b.tag === a.tags[0]
    })), f.reject())
  }).fail(function() {
    f.reject()
  })) :
    f.reject();
  return f.promise()
};
FlashbackSampler.prototype.buildGridForGroup = function(a, b) {
  var c = this,
    d = $.Deferred(),
    e, f = _.uniqueId("grid-flashback-");
  e = a instanceof TodayFetcher ? new TodayGrid([], a, $.extend(!0, {
    id: f
  }, c.gridOptions, b)) : a instanceof ShuffleFetcher ? new PhotoGrid([], a, $.extend(!0, {
    id: f
  }, c.gridOptions, b)) : new SemanticGrid([], a, a.tags[0], $.extend(!0, {
    id: f
  }, c.gridOptions, b));
  e.build().done(function(b) {
    c.grids.push(e);
    c.$sampler.find(".sampler-grids").append(b);
    c.isActive && e.activate();
    d.resolve(e)
  }).fail(function() {
    d.reject()
  });
  return d.promise()
};
FlashbackSampler.prototype.requestRandom = function() {
  var a = this,
    b = $.Deferred();
  a.isActive ? (a.$fetchBubble && (a.$fetchBubble.bubble().destruct(), a.destroyElement("fetchBubble")), a.getFetcher().done(function(c) {
    a.buildElement("fetchBubble", {
      message: a.makeString("fetchMessageBusy", c)
    }).done(function(d) {
      a.$sampler.find(".flashbackSampler-randomize").append(d);
      d.bubble().open();
      a.requestFetch(c, !0).done(function() {
        d.bubble().destruct().always(function() {
          a.destroyElement("fetchBubble")
        });
        _(a.grids).invoke("destruct");
        a.grids = [];
        a.buildGridForGroup(c).done(function(d) {
          a.setPrimaryGroup(c);
          b.resolve()
        }).fail(function() {
          b.reject()
        })
      }).fail(function() {
        a.isActive ? (d.empty().removeClass("hasSpinner oneLiner").html(a.makeString("fetchMessageError", c)).addClass("error"), _(function() {
          d.bubble().destruct().always(function() {
            a.destroyElement("fetchBubble")
          })
        }).delay(2E3)) : a.destroyElement("fetchBubble");
        b.reject()
      })
    })
  }).fail(function() {
    b.reject()
  })) : b.reject();
  return b.promise()
};
FlashbackSampler.prototype.requestToday = function() {
  var a = this,
    b = $.Deferred();
  a.isActive ? a.getFetcher("today").done(function(c) {
    a.getFetcher("shuffle").done(function(d) {
      var e = a.requestFetch(c),
        f = a.requestFetch(d);
      e.done(function() {
        _(a.grids).invoke("destruct");
        a.grids = [];
        f.done(function() {
          a.setPrimaryGroup(c);
          a.buildGridForGroup(c).done(function(b) {
            a.buildGridForGroup(d, {
              columnsPerRow: function() {
                return Viewport.getColumns() - b.$grid.attr("data-columns")
              }
            }).done(function(c) {
              c.$grid.on({
                mouseenter: function() {
                  c.$coverMessage ||
                    c.undim()
                },
                mouseleave: function() {
                  c.$coverMessage || c.dim()
                }
              });
              c.buildCoverMessage({
                title: FLASHBACKSAMPLER_SHUFFLE_TITLE,
                body: FLASHBACKSAMPLER_SHUFFLE_BODY,
                icon: "shuffle",
                dismissButton: !0
              });
              a.subscribe("todayGridLayout", "Grid/layout", function(a) {
                a === b && c.layout(!0)
              });
              a.subscribe("todayGridDestruct", "Grid/destruct", function(c) {
                c === b && a.unsubscribe("todayGridLayout", "todayGridDestruct")
              })
            })
          })
        }).fail(function() {
          b.reject()
        })
      }).fail(function() {
        f.done(function() {
          a.setPrimaryGroup(d);
          a.buildGridForGroup(d).done(function(b) {
            b.buildCoverMessage({
              title: FLASHBACKSAMPLER_NOTODAY_TITLE,
              body: FLASHBACKSAMPLER_NOTODAY_BODY,
              icon: "clock",
              dismissButton: !0
            })
          })
        }).fail(function() {
          b.reject()
        })
      })
    })
  }) : b.reject();
  return b.promise()
};
var Grids = function() {
  return {
    buildNew: function(a) {
      var b = _(arguments).rest(1),
        c = null;
      switch (a) {
        case "context":
          c = Object.create(ContextGrid.prototype);
          c = ContextGrid.apply(c, b) || c;
          break;
        case "photo":
          c = Object.create(PhotoGrid.prototype);
          c = PhotoGrid.apply(c, b) || c;
          break;
        case "singlePhoto":
          c = Object.create(SinglePhotoGrid.prototype);
          c = SinglePhotoGrid.apply(c, b) || c;
          break;
        case "semantic":
          c = Object.create(SemanticGrid.prototype);
          c = SemanticGrid.apply(c, b) || c;
          break;
        case "today":
          c = Object.create(TodayGrid.prototype),
          c = TodayGrid.apply(c, b) || c
      }
      return c
    }
  }
}(),
  MessageBars = function() {
    return {
      buildNew: function(a, b) {
        return new MessageBar(a, b)
      }
    }
  }(),
  Selections = function() {
    var a = {};
    $.extend(!0, a, Subscriptions.prototype);
    $.extend(!0, a, {
      selections: []
    });
    Subscriptions.call(a);
    a.buildNew = function(b, a, d, e) {
      var f = this,
        g, h;
      b = _(b).isArray() ? b : [b];
      if (!b.length) return $.rejected;
      g = _(b).filter(function(b) {
        return !!b.viewOf
      });
      if (1 === b.length && f.isSelection(b[0])) d = $.extend(!0, {
          showActionAlert: !1,
          includeSelectionMenu: !0,
          strings: {
            cancelButton: "Back"
          }
        },
        d), h = new PhotoSelection(a, d), g = [new SelectionView("selection", b, h, {
        activateImmediately: !0
      })], b[0].allowedViews.push(g[0]), h.allowedViews.push(g[0]), h.done(function() {
        b[0].resolve.apply(b, arguments)
      }).fail(function() {
        b[0].allowedViews.splice(_(b[0].allowedViews).indexOf(g[0]), 1)
      }), b[0].always(function() {
        h.reject()
      });
      else if (g.length)
        if (1 === g.length && g[0].viewOf.photos && b.length > g.length) h = new PhotoSelection(a, d), g = [new SelectionView("selection", _(b).chain().difference(g).filter(function(b) {
            return b.photos
          }).union([g[0].viewOf]).value(),
          h, {
            activateImmediately: !0
          })], h.allowedViews.push(g[0]);
        else {
          d = $.extend(!0, {
            strings: {
              itemName: g[0].viewOf.makeString("itemName"),
              itemsName: g[0].viewOf.makeString("itemsName")
            }
          }, d);
          if (_(g).every(function(b) {
            return b.viewOf.photos
          })) d = $.extend(!0, {
            selectAll: 1 >= g.length,
            includeSelectionMenu: 1 >= g.length
          }, d), h = new PhotoSelection(a, d);
          else if (_(g).every(function(b) {
            return b.viewOf.contexts
          })) h = new ContextSelection(a, d);
          else return $.rejected;
          Array.prototype.push.apply(h.allowedViews, g);
          b.length > g.length &&
            (h.refineBeforeProceeding = !0, h.refineAdditionalContexts = _(b).chain().difference(g).filter(function(b) {
            return b.photos
          }).value());
          _(g).any(function(b) {
            return b.isActive
          }) || g[0].activate();
          _(g).invoke("enterSelectionMode", h, e)
        } else
      if (b.length && _(b).every(function(b) {
        return b.photos
      })) d = $.extend(!0, {
        includeSelectionMenu: !0,
        strings: {
          itemName: b[0].makeString("itemName"),
          itemsName: b[0].makeString("itemsName")
        }
      }, d), h = new PhotoSelection(a, d), g = [new SelectionView("selection", b, h, {
        activateImmediately: !0
      })],
      h.allowedViews.push(g[0]);
      else return $.rejected;
      f.selections.push(h);
      NavBar.enterSelectionMode();
      PhotoViewer.enterSelectionMode();
      h.always(function() {
        f.selections.splice(_(this.selections).indexOf(h), 1);
        _(g).invoke("exitSelectionMode");
        f.selections.length ? NavBar.updateSelectionUI() : (NavBar.exitSelectionMode(), PhotoViewer.exitSelectionMode())
      });
      return h
    };
    a.getCurrent = function() {
      return _(this.selections).last() || void 0
    };
    a.isSelection = function(b) {
      return b instanceof Selection || b instanceof PhotoSelection ||
        b instanceof ContextSelection
    };
    return a
  }(),
  Sources = function() {
    function a(b) {
      return b ? g[b] : void 0 === b ? $.extend({}, g) : !1
    }

    function b(b) {
      return b ? h[b] : void 0 === b ? $.extend({}, h) : !1
    }

    function c(b) {
      return b ? k[b] : void 0 === b ? $.extend({}, k) : !1
    }

    function d(b) {
      var a = l[b];
      return $.isPlainObject(a) ? a.filterDetails ? {
        type: a.filterDetails.type || b,
        title: a.filterDetails.title || a.title
      } : {
        type: b,
        title: a.title
      } : !1
    }

    function e(c) {
      function d(c) {
        g = {};
        h = {};
        $.each(c.sources, function(c, d) {
          var e = d.sourceType,
            f = d.sourceUUID,
            k = d.deviceUUID;
          a(f) || "deleting" === d.state || (g[f] = {
            type: e,
            deviceUUID: k || null,
            state: d.state,
            createdTimestamp: d.createdTimestamp ? new XDate(1E3 * d.createdTimestamp, !0) : null
          }, l[e] ? $.isFunction(l[e].listTitle) ? g[f].name = l[e].listTitle.call(d) : l[e].listTitle ? g[f].name = l[e].listTitle : $.isFunction(l[e].title) ? g[f].name = l[e].title.call(d) : g[f].name = l[e].title ? l[e].title : d.sourceName ? d.sourceName : e : g[f].name = e, k && (b(k) || (h[k] = {
            name: d.deviceName,
            type: d.deviceType,
            client: p[d.client] || d.client,
            createdTimestamp: d.createdTimestamp ?
              new XDate(1E3 * d.createdTimestamp, !0) : null
          })))
        });
        PubHub.pub("Sources/refresh")
      }

      function e(b) {
        k = {};
        $.each(b.devices, function(b, a) {
          k[a.uuid] = $.extend(k[a.uuid], {
            name: a.name,
            type: a.type,
            client: p[a.client] || a.client,
            subtype: a.subtype || void 0,
            refreshed: new XDate(1E3 * a.refreshed)
          })
        });
        PubHub.pub("ConnectedDevices/refresh")
      }

      function m(b) {
        PubHub.pub("WebConnections/refresh", b)
      }
      var n = $.Deferred();
      switch (c) {
        case "sources":
          f.refreshSources || (f.refreshSources = API.request("sources").always(function() {
            delete f.refreshSources
          }).done(d));
          n.follow(f.refreshSources);
          break;
        case "connectedDevices":
          f.refreshConnectedDevices || (f.refreshConnectedDevices = API.request("connectedDevices").always(function() {
            delete f.refreshConnectedDevices
          }).done(e));
          n.follow(f.refreshConnectedDevices);
          break;
        case "webConnections":
          f.refreshWebConnections || (f.refreshWebConnections = API.request("webConnections").always(function() {
            delete f.refreshWebConnections
          }).done(m));
          n.follow(f.refreshWebConnections);
          break;
        default:
          f.refreshAll || (f.refreshAll = API.request("allSourceInfo").always(function() {
            delete f.refreshAll
          }).done(function(b) {
            d(b);
            e(b);
            m(b.connections)
          })), n.follow(f.refreshAll)
      }
      return n
    }
    var f = {}, g = {}, h = {}, k = {}, m = {
        facebook: new FacebookConnection,
        twitter: new TwitterConnection,
        instagram: new InstagramConnection,
        flickr: new FlickrConnection,
        picasa: new PicasaConnection,
        gmail: new GmailConnection,
        path: new PathConnection
      }, p = {
        "be.33cu.everpix-mac": "Mac Uploader",
        "be.33cu.everpix-windows": "Windows Uploader",
        "be.33cu.everpix": "iOS App",
        "be.33cu.everpix-hd": "iPad App",
        "com.everpix.android.uploader": "Android Uploader"
      }, l = {
        "mac-desktop": {
          title: "Mac Desktop",
          listTitle: "Desktop",
          metaDetails: {
            deviceName: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            title: "Mac Folders",
            type: "mac-folders"
          }
        },
        "mac-documents": {
          title: "Mac Documents",
          listTitle: "Documents",
          metaDetails: {
            deviceName: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            title: "Mac Folders",
            type: "mac-folders"
          }
        },
        "mac-pictures": {
          title: "Mac Pictures",
          listTitle: "Pictures",
          metaDetails: {
            deviceName: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            title: "Mac Folders",
            type: "mac-folders"
          }
        },
        "mac-folder": {
          title: "Mac Folder",
          listTitle: function() {
            return this.sourceName || "Custom Folder"
          },
          metaDetails: {
            title: function() {
              return this.sourceName || "Mac Folder"
            },
            deviceName: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            title: "Mac Folders",
            type: "mac-folders"
          }
        },
        "windows-desktop": {
          title: "Windows Desktop",
          listTitle: "Desktop",
          metaDetails: {
            deviceName: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            title: "Windows Folders",
            type: "windows-folders"
          }
        },
        "windows-documents": {
          title: "Windows Documents",
          listTitle: "Documents",
          metaDetails: {
            deviceName: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            title: "Windows Folders",
            type: "windows-folders"
          }
        },
        "windows-pictures": {
          title: "Windows Pictures",
          listTitle: "Pictures",
          metaDetails: {
            deviceName: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            title: "Windows Folders",
            type: "windows-folders"
          }
        },
        "windows-folder": {
          title: "Windows Folder",
          listTitle: function() {
            return this.sourceName || "Custom Folder"
          },
          metaDetails: {
            title: function() {
              return this.sourceName || "Windows Folder"
            },
            deviceName: !0,
            filePath: !0,
            fileName: !0
          },
          filterDetails: {
            title: "Windows Folders",
            type: "windows-folders"
          }
        },
        "mac-photostream": {
          title: "iCloud Photo Stream",
          metaDetails: {
            deviceName: !0,
            fileName: !0
          },
          filterDetails: {
            title: "Photo Stream",
            type: "photostream"
          }
        },
        "mac-photobooth": {
          title: "Photo Booth",
          metaDetails: {
            deviceName: !0
          },
          filterDetails: {
            title: "Mac Photo Booth",
            type: "photobooth"
          }
        },
        "mac-messages": {
          title: "Mac Messages",
          metaDetails: {
            deviceName: !0,
            filePath: !0,
            fileName: !0,
            caption: !0
          },
          filterDetails: {
            title: "Mac Messages",
            type: "messages"
          }
        },
        "mac-iphoto": {
          title: "iPhoto",
          listTitle: function() {
            return this.sourceName
          },
          metaDetails: {
            deviceName: !0,
            albumName: !0,
            caption: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            type: "iphoto"
          }
        },
        "mac-aperture": {
          title: "Aperture",
          listTitle: function() {
            return this.sourceName
          },
          metaDetails: {
            deviceName: !0,
            albumName: !0,
            caption: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            type: "aperture"
          }
        },
        "mac-lightroom": {
          title: "Lightroom",
          listTitle: function() {
            return this.sourceName
          },
          metaDetails: {
            deviceName: !0,
            albumName: !0,
            caption: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            type: "lightroom"
          }
        },
        "windows-lightroom": {
          title: "Lightroom",
          listTitle: function() {
            return this.sourceName
          },
          metaDetails: {
            deviceName: !0,
            albumName: !0,
            caption: !0,
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            type: "lightroom"
          }
        },
        "mac-cameras": {
          title: "Mac Camera Import",
          listTitle: "Camera Import",
          metaDetails: {
            deviceName: !0
          },
          filterDetails: {
            title: "Camera Import",
            type: "cameras"
          }
        },
        "windows-cameras": {
          title: "Windows Camera Import",
          listTitle: "Camera Import",
          metaDetails: {
            deviceName: !0
          },
          filterDetails: {
            title: "Camera Import",
            type: "cameras"
          }
        },
        "ios-roll": {
          title: "iOS Camera Roll",
          metaDetails: {
            title: function() {
              return this.deviceName || "iOS Camera Roll"
            }
          },
          filterDetails: {
            type: "ios"
          }
        },
        "android-roll": {
          title: "Android Camera",
          metaDetails: {
            title: function() {
              return this.deviceName || "Android Camera"
            }
          },
          filterDetails: {
            type: "android"
          }
        },
        facebook: {
          title: "Facebook",
          metaDetails: {
            albumName: !0,
            caption: !0
          }
        },
        flickr: {
          title: "Flickr",
          metaDetails: {
            albumName: !0,
            caption: !0
          }
        },
        picasa: {
          title: "Picasa Web Albums",
          metaDetails: {
            albumName: !0,
            caption: !0
          },
          filterDetails: {
            title: "Picasa Web"
          }
        },
        instagram: {
          title: "Instagram",
          metaDetails: {
            caption: !0
          }
        },
        email: {
          title: "Email",
          metaDetails: {
            fromEmail: !0,
            subject: !0
          }
        },
        web: {
          title: "Web",
          listTitle: "Web Uploads",
          metaDetails: {
            filePath: !0,
            fileName: function() {
              return this.filePath ? this.filePath.split("/").reverse()[0] : null
            }
          },
          filterDetails: {
            title: "Web"
          }
        },
        user: {
          title: "Everpix User",
          metaDetails: {
            title: function() {
              return this.fromName || "Everpix User"
            },
            fromEmail: !0,
            subject: !0
          },
          filterDetails: {
            title: "Everpix Users",
            type: "users"
          }
        }
      }, n = "mac-desktop mac-iphoto mac-documents windows-desktop mac-folder mac-aperture mac-pictures mac-photobooth windows-pictures windows-folder mac-picasa dropbox mac-lightroom windows-lightroom windows-documents".split(" ");
    API.define("allSourceInfo", "GET", "user_sources", {
      includeAuthToken: !0
    });
    API.define("sources",
      "GET", "photo_sources", {
        includeAuthToken: !0
      });
    API.define("connectedDevices", "GET", "user_devices", {
      includeAuthToken: !0
    });
    API.define("webConnections", "GET", "user_connections", {
      includeAuthToken: !0
    });
    API.define("sourceDelete", "POST", "source_delete");
    API.define("sourcePurge", "POST", "source_delete_removed_photos");
    API.define("deviceDisconnect", "POST", "user_disconnect");
    API.define("deviceTypeSyncStatus", "GET", "photo_device_synced", {
      includeAuthToken: !0
    });
    API.define("facebookInfo", "GET", "facebook_info", {
      includeAuthToken: !0
    });
    API.define("facebookConnect", "GET", "facebook_connect", {
      includeAuthToken: !0
    });
    API.define("facebookComplete", "POST", "facebook_connect");
    API.define("facebookDisconnect", "POST", "facebook_disconnect");
    API.define("facebookSync", "POST", "facebook_sync");
    API.define("twitterInfo", "GET", "twitter_info", {
      includeAuthToken: !0
    });
    API.define("twitterConnect", "GET", "twitter_connect", {
      includeAuthToken: !0
    });
    API.define("twitterComplete", "POST", "twitter_connect");
    API.define("twitterDisconnect", "POST", "twitter_disconnect");
    API.define("instagramInfo", "GET", "instagram_info", {
      includeAuthToken: !0
    });
    API.define("instagramConnect", "GET", "instagram_connect", {
      includeAuthToken: !0
    });
    API.define("instagramComplete", "POST", "instagram_connect");
    API.define("instagramDisconnect", "POST", "instagram_disconnect");
    API.define("instagramSync", "POST", "instagram_sync");
    API.define("flickrInfo", "GET", "flickr_info", {
      includeAuthToken: !0
    });
    API.define("flickrConnect", "GET", "flickr_connect", {
      includeAuthToken: !0
    });
    API.define("flickrComplete", "POST",
      "flickr_connect");
    API.define("flickrDisconnect", "POST", "flickr_disconnect");
    API.define("flickrSync", "POST", "flickr_sync");
    API.define("picasaInfo", "GET", "picasa_info", {
      includeAuthToken: !0
    });
    API.define("picasaConnect", "GET", "picasa_connect", {
      includeAuthToken: !0
    });
    API.define("picasaComplete", "POST", "picasa_connect");
    API.define("picasaDisconnect", "POST", "picasa_disconnect");
    API.define("picasaSync", "POST", "picasa_sync");
    API.define("gmailInfo", "GET", "gmail_info", {
      includeAuthToken: !0
    });
    API.define("gmailConnect",
      "GET", "gmail_connect", {
        includeAuthToken: !0
      });
    API.define("gmailComplete", "POST", "gmail_connect");
    API.define("gmailDisconnect", "POST", "gmail_disconnect");
    API.define("gmailSync", "POST", "gmail_sync");
    API.define("pathConnect", "GET", "service_connect", {
      includeAuthToken: !0,
      dataMap: function(b) {
        return $.extend({}, b, {
          service: "path"
        })
      }
    });
    API.define("pathComplete", "POST", "service_connect", {
      dataMap: function(b) {
        return $.extend({}, b, {
          service: "path"
        })
      }
    });
    API.define("pathDisconnect", "POST", "service_disconnect", {
      dataMap: function(b) {
        return $.extend({},
          b, {
            service: "path"
          })
      }
    });
    return {
      refresh: e,
      getSources: a,
      getSourceDevices: b,
      getConnections: function(b) {
        return b ? m[b] : void 0 === b ? $.extend({}, m) : !1
      },
      getConnectedDevices: c,
      getMetaDetails: function(b) {
        var a = {
          type: b.sourceType
        }, c = l[b.sourceType];
        return $.isPlainObject(c) ? ($.each(c.metaDetails || {}, function(c, d) {
          $.isFunction(d) ? a[c] = d.call(b) : !0 === d ? a[c] = b[c] || !1 : d && (a[c] = d)
        }), a.title || (a.title = c.title), a) : !1
      },
      getFilterDetails: d,
      getFilterSourceType: function(b) {
        return _(l).chain().map(function(a, c) {
          if (c === b ||
            a.filterDetails && a.filterDetails.type === b) return c
        }).compact().first().value()
      },
      getSetSources: function() {
        var b = {};
        $.each(g, function() {
          var a = d(this.type);
          b[a.type] || (b[a.type] = a.title)
        });
        return $.isEmptyObject(b) ? !1 : b
      },
      getSourcesArray: function() {
        var b = [],
          a = [];
        $.each(h, function(c, d) {
          b.push(c);
          a.push({
            uuid: c,
            name: d.name,
            type: d.type,
            client: d.client,
            isDevice: !0,
            isDeleting: !1,
            createdDate: d.createdTimestamp ? d.createdTimestamp.toString(SOURCE_MESSAGE_TIMESTAMP_FORMAT) : null,
            toString: function() {
              return d.name ?
                d.name.toLowerCase() : ""
            }
          })
        });
        $.each(g, function(c, d) {
          var e = b.indexOf(d.deviceUUID);
          d.deviceUUID ? 0 <= e && ("ios-roll" !== d.type && "android-roll" !== d.type ? (a[e].hasSubSources = !0, a[e].subSources || (a[e].subSources = []), a[e].subSources.push({
              uuid: c,
              name: d.name,
              type: d.type,
              isDeleting: "deleting" === d.state,
              allowPurge: _(n).contains(d.type),
              createdDate: d.createdTimestamp ? d.createdTimestamp.toString(SOURCE_MESSAGE_TIMESTAMP_FORMAT) : null,
              toString: function() {
                return d.name ? d.name.toLowerCase() : ""
              }
            })) : "deleting" === d.state &&
            (a[e].isDeleting = !0)) : a.push({
            uuid: c,
            name: d.name,
            type: d.type,
            isWeb: !! Sources.getConnections(d.type),
            isDeleting: "deleting" === d.state,
            isConnected: "active" === d.state,
            allowPurge: _(n).contains(d.type),
            createdDate: d.createdTimestamp ? d.createdTimestamp.toString(SOURCE_MESSAGE_TIMESTAMP_FORMAT) : null,
            toString: function() {
              return d.name ? d.name.toLowerCase() : ""
            }
          })
        });
        $.each(a, function() {
          var b;
          this.isDevice && this.hasSubSources && (b = !0, $.each(this.subSources, function(a, c) {
              return c.isDeleting ? !0 : b = !1
            }), this.isDeleting =
            b, this.subSources.sort())
        });
        a.sort();
        return a
      },
      getConnectedDevicesArray: function() {
        var b = [];
        $.each(k, function(a, c) {
          var d;
          d = $.extend({
            uuid: a,
            toString: function() {
              return c.name ? c.name.toLowerCase() : ""
            }
          }, c);
          b.push(d);
          "ios" === d.type && "iPad App" === d.client && (d.type = "ipad")
        });
        b.sort();
        return b
      },
      disconnectDevice: function(b) {
        return c(b) ? API.request("deviceDisconnect", {
          uuid: b
        }).done(function() {
          e("connectedDevices")
        }) : $.Deferred().reject()
      },
      deleteSource: function(b, c) {
        return a(b) ? API.request("sourceDelete", {
          sourceUUID: b,
          force: c ? 1 : 0
        }).done(function() {
          g[b].state = "deleting";
          e("sources")
        }) : $.Deferred().reject()
      },
      deleteDevice: function(a, c) {
        return b(a) ? API.request("sourceDelete", {
          deviceUUID: a,
          force: c ? 1 : 0
        }).done(function() {
          $.each(g, function(b, c) {
            c.deviceUUID === a && (g[b].state = "deleting")
          });
          e("sources")
        }) : $.Deferred().reject()
      },
      purge: function(b) {
        var a = $.Deferred(),
          c, d;
        c = new PhotoFetcher(null, {
          resources: {
            fetchItems: {
              resource: "postSourcePhotos",
              params: {
                limit: FETCH_LIMIT_PHOTOS_AGGREGATE,
                sourceUUID: b.isDevice ? void 0 : b.uuid,
                deviceUUID: b.isDevice ? b.uuid : void 0
              }
            }
          },
          photoCount: 0
        });
        d = new ContextView("purge-" + b.uuid, c, {
          viewClass: "purge",
          features: {
            miscMenu: !1,
            photoCount: !1,
            hide: !1,
            baleet: !1,
            download: !1,
            sharing: !1
          },
          templates: {
            emptyMessage: {
              selector: "#template-purge-emptyMessage"
            },
            miscMenu: !1,
            hiddenBar: !1
          },
          navBarSections: {
            left: "review",
            right: "review"
          },
          strings: {
            title: b.name,
            fetchMessageBusy: PURGEVIEW_FETCH_MESSAGE_BUSY,
            fetchMessageError: PURGEVIEW_FETCH_MESSAGE_ERROR,
            instructions: PURGEVIEW_INSTRUCTIONS
          },
          gridOptions: {
            fileByTimestamp: !1
          },
          activateImmediately: !0
        });
        d.deactivate = function() {
          return ContextView.prototype.deactivate.call(this).done(function() {
            a.reject()
          })
        };
        d.activate = function(b) {
          var a = this;
          return ContextView.prototype.activate.call(a, b).done(function() {
            MessageBars.buildNew(a.makeString("instructions"), {
              extraClasses: "instructional " + a.id
            })
          })
        };
        d.updateUI = function() {
          var b = this,
            a = [];
          return b.$view ? (a.push(ContextView.prototype.updateUI.call(b)), a.push(b.procrastinate("updateUI", function() {
            $("#navBar").find(".navBar-review-done").toggleClass("disabled", !b.viewOf.fetchedOnce || b.isEmpty)
          })), $.when.apply(b, a).promise()) : $.rejected
        };
        $("#navBar").find(".navBar-review-cancel").on("click.purge", function() {
          a.reject()
        });
        $("#navBar").find(".navBar-review-done").on("click.purge", function() {
          var c;
          $(this).hasClass("disabled") || (c = $("#template-source-purgeWarning").mustache({
              name: b.name
            }).appendTo("body").on({
              "afterClose.popover": function() {
                $(this).popover().destruct()
              },
              "execute.asyncForm": function() {
                a.follow(API.request("sourcePurge", {
                  sourceUUID: b.uuid
                }).done(function() {
                  e("sources")
                }))
              }
            }),
            c.popover({
              isOpen: !0,
              closeButton: "back"
            }), c.asyncForm(), c.find(".cancelLink").on("click", function() {
              c.popover().close(!0)
            }))
        });
        return a.promise().always(function() {
          d.destruct();
          $("#navBar").find(".navBar-review-cancel, .navBar-review-done").off(".purge")
        })
      },
      deviceTypeIsSynced: function(b) {
        var a = $.Deferred();
        b ? API.request("deviceTypeSyncStatus", {
          deviceType: b
        }).done(function(b) {
          a.resolve(!(!b.syncStarted && !b.photosImported))
        }).fail(function() {
          a.reject()
        }) : a.reject();
        return a
      }
    }
  }(),
  Preferences = function() {
    function a(b,
      a) {
      var g = $.Deferred(),
        h = {};
      $.isPlainObject(b) ? h = b : h[b] = a;
      $.each(h, function(b, a) {
        -1 !== c.indexOf(b) && d[b] !== a || delete h[b]
      });
      $.isEmptyObject(h) ? g.resolve() : Cookie.setRemote($.extend({}, h)).done(function() {
        $.each(h, function(b, a) {
          var c = $("body");
          (d[b] = a) ? c.attr("data-pref-" + b, !0) : c.removeAttr("data-pref-" + b);
          PubHub.pub("Preference/set", b, a)
        });
        g.resolve()
      }).fail(function() {
        g.reject()
      });
      return g
    }

    function b(c) {
      if (c) return a(c, null);
      $.each(d, function(a) {
        b(a)
      });
      return this
    }
    var c = ["show_hidden", "sort_order",
      "nav_guide", "keyboard_shortcuts", "webp"
    ],
      d = !1;
    Cookie.ready(function() {
      var b = Cookie.getRemote();
      return b ? (d = {}, $.each(b || {}, function(b, a) {
        -1 !== c.indexOf(b) && (d[b] = a, PubHub.pub("Preference/set", b, a))
      }), !0) : !1
    });
    return {
      get: function(b) {
        return b ? d ? d[b] : !1 : d ? $.extend({}, d) : !1
      },
      set: a,
      clear: b
    }
  }(),
  Subscription = function() {
    var a = {
      initDfd: $.Deferred(),
      data: {
        plan: null,
        payment: null,
        processor: null,
        planExpirationDate: null,
        graceExpirationDate: null,
        planDaysLeft: null,
        graceDaysLeft: null,
        stripeBillingInfo: {}
      },
      ready: function(b) {
        b &&
          b.promise ? b.follow(this.initDfd) : $.isFunction(b) && this.initDfd.done(b);
        return $.Deferred().follow(this.initDfd)
      },
      isReady: function() {
        return "resolved" === this.initDfd.state()
      },
      getInfo: function(b) {
        return void 0 !== this.data[b] ? this.data[b] instanceof XDate ? this.data[b].clone() : this.data[b] : $.extend(!0, {}, this.data)
      },
      setData: function(b) {
        var a = $.extend(!0, {}, this.data);
        $.isPlainObject(b.subscription) && (a.plan = b.subscription.plan, a.payment = b.subscription.payment || null, a.processor = b.subscription.processor ||
          null, a.planExpirationDate = b.subscription.planExpiration ? new XDate(1E3 * b.subscription.planExpiration, !0) : null, a.graceExpirationDate = b.subscription.graceExpiration ? new XDate(1E3 * b.subscription.graceExpiration, !0) : null, a.planDaysLeft = $.isNumeric(b.subscription.planDaysLeft) ? b.subscription.planDaysLeft : null, a.graceDaysLeft = $.isNumeric(b.subscription.graceDaysLeft) ? b.subscription.graceDaysLeft : null);
        $.isPlainObject(b.paymentCard) && (a.stripeBillingInfo.paymentCard = b.paymentCard);
        b.nextBillingDate && (a.stripeBillingInfo.nextBillingDate =
          new XDate(1E3 * b.nextBillingDate, !0));
        $.isNumeric(b.accountBalance) && (a.stripeBillingInfo.accountBalance = b.accountBalance);
        _(a).isEqual(this.data) || (this.data = a, PubHub.pub("Subscription/update"))
      },
      retrieveUserInfo: function() {
        a.setData({
          subscription: User.getInfo("subscription")
        })
      },
      retrieveBillingInfo: function(b) {
        return "stripe" === a.data.processor && _(a.data.stripeBillingInfo).isEmpty() || b ? API.request("stripeBillingInfo", {}).done(function(b) {
          a.setData(b)
        }) : $.resolved
      },
      openBillingInfoPopover: function(b,
        a) {
        var d = this,
          e = $.Deferred(),
          f, g, h, k, m, p = (new XDate).getFullYear(),
          l, n;
        a = $.isPlainObject(a) ? a : {
          billingAddress: {}
        };
        f = $("#template-billingInfo").mustache({
          isUpdate: "update" === b,
          isMonthly: "monthly" === b,
          isYearly: "yearly" === b,
          allowPromo: "yearly" === b && "update" !== b,
          basePrice: "yearly" === b ? "49" : "monthly" === b ? "4.99" : "",
          billingInfo: a
        }).appendTo("body");
        h = $("#billingInfo\\/expMonth");
        _.times(12, function(b) {
          b += 1;
          $("<option/>", {
            value: b,
            text: padStringToLength(b, 2, "0", !0)
          }).appendTo(h)
        });
        a.expMonth ? h.val(a.expMonth) :
          h.val((new XDate).getMonth() + 1);
        k = $("#billingInfo\\/expYear");
        _.times(15, function(b) {
          b += p;
          $("<option/>", {
            value: b,
            text: b
          }).appendTo(k)
        });
        a.expYear ? k.val(a.expYear) : k.val(p);
        m = $("#billingInfo\\/country");
        _(COUNTRIES).each(function(b, a) {
          $("<option/>", {
            value: a,
            text: b
          }).appendTo(m)
        });
        a.billingAddress.country ? m.val(a.billingAddress.country) : m.val("US");
        l = f.find(".billingInfo-promoSpinner").spinner({
          showAfter: 0,
          hideAfter: 0
        });
        $("#billingInfo\\/promoCode").on({
          keydown: function(b) {
            return b.which === KEYCODES.enter ?
              (f.find(".billingInfo-addPromo").trigger("click"), !1) : !0
          },
          keyup: function() {
            f.find(".billingInfo-addPromo").toggleClass("disabled", !$(this).val())
          }
        });
        f.find(".billingInfo-addPromo").on("click", function() {
          var a = $("#billingInfo\\/promoCode"),
            c = $(this),
            d = a.val();
          !d || (c.hasClass("applied") || c.hasClass("disabled")) || (a.attr("disabled", !0), c.addClass("disabled"), l.show(), API.request("stripePrice", {
            plan: b,
            couponCode: d
          }).always(function() {
            c.toggleClass("disabled", !d);
            l.hide()
          }).done(function(b) {
            b.discountedPrice ?
              (c.addClass("applied").text("applied"), n = d, f.find(".billingInfo-price").addClass("discounted"), f.find(".billingInfo-price-base").html("$" + b.regularPrice / 100), f.find(".billingInfo-price-discounted").html("$" + b.discountedPrice / 100)) : a.removeAttr("disabled")
          }).fail(function(b, c) {
            a.removeAttr("disabled");
            412 === c && a.trigger({
              type: "validate",
              validationData: {
                result: !1,
                message: "This promo code is invalid."
              }
            })
          }))
        });
        f.on({
          "afterOpen.popover": function() {
            f.find("input").first().trigger("focus")
          },
          "beforeClose.popover": function(a) {
            a.userTriggered &&
              ("update" !== b && PubHub.pub("Subscription/bail"), e.reject())
          },
          "afterClose.popover": function() {
            f.popover().destruct()
          },
          "execute.asyncForm": function() {
            var a = $.Deferred(),
              c;
            f.find(".billingInfo-addPromo").addClass("disabled");
            a.done(function() {
              e.resolve()
            });
            a.fail(function(b, a) {
              g.unlock().always(function() {
                402 === a && b.code && "incorrect_number" === b.code ? $("#billingInfo\\/cardNumber").trigger({
                  type: "validate",
                  validationData: {
                    result: !1,
                    message: "This is not a valid card number"
                  }
                }) : 402 !== a || !b.code || "invalid_expiry_month" !==
                  b.code && "invalid_expiry_year" !== b.code ? 402 !== a || !b.code || "invalid_cvc" !== b.code && "incorrect_cvc" !== b.code ? 402 === a && b.code && "expired_card" === b.code ? f.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "This credit card has expired."
                    }
                  }) : 402 === a && b.code && "card_declined" === b.code ? f.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "The credit card was declined."
                    }
                  }) : 402 === a && b.code && "processing_error" === b.code ? f.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "An error occurred while processing your card. Please try again."
                    }
                  }) :
                  400 === a ? f.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "This billing information is invalid."
                    }
                  }) : 409 === a && 0 === b.indexOf("Coupon code") ? $("#billingInfo\\/promoCode").trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "This promo code is invalid."
                    }
                  }) : (PubHub.pub("Subscription/error", b, a), $("#template-billingError").mustache({}).appendTo("body").popover({
                    isOpen: !0,
                    closeButton: !1,
                    clickOutsideToClose: !1,
                    pressEscToClose: !1
                  })) : $("#billingInfo\\/cvc").trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: !1
                    }
                  }) : $("#billingInfo\\/expMonth, #billingInfo\\/expYear").trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: !1
                    }
                  })
              })
            });
            c = {
              number: $("#billingInfo\\/cardNumber").val(),
              cvc: $("#billingInfo\\/cvc").val(),
              exp_month: $("#billingInfo\\/expMonth").val(),
              exp_year: $("#billingInfo\\/expYear").val(),
              name: $("#billingInfo\\/name").val(),
              address_zip: $("#billingInfo\\/postal").val(),
              address_country: $("#billingInfo\\/country").val()
            };
            Stripe.createToken(c, function(c, e) {
              e.error ? a.reject(e.error, c) : API.request("updateBillingInfo", {
                cardTokenID: e.id,
                plan: "update" === b ? void 0 : b,
                couponCode: n || $("#billingInfo\\/promoCode").val() || void 0
              }).done(function(b, c) {
                d.setData(b);
                a.resolve(b, c)
              }).fail(function(b, c) {
                "error" === c ? d.retrieveBillingInfo().always(function() {
                  "active" === d.getInfo("payment") ? a.resolve() : a.reject(b, "unknown")
                }) : a.reject(b, c)
              })
            })
          }
        });
        g = f.asyncForm({
          validateTests: {
            creditCard: {
              failureMessage: "This is not a valid card number"
            },
            cardCVC: {
              applyTo: function() {
                return "" !== this.val() && this.is("[data-validation-cvc]")
              },
              testVal: function() {
                return Stripe.validateCVC(this.val())
              },
              failureMessage: !1
            },
            expirationDate: {
              applyTo: function() {
                return "" !== this.val() && this.is("[data-validation-expiration-month]") && this.is("[data-validation-expiration-year]")
              },
              testVal: function() {
                return Stripe.validateExpiry($("#" + jqEscape(this.data("validation-expiration-month"))).val(), $("#" + jqEscape(this.data("validation-expiration-year"))).val())
              },
              failureMessage: !1
            }
          }
        });
        f.popover({
          isOpen: !0,
          closeButton: "back",
          fixedTop: 0.1
        });
        return e.promise()
      },
      startMonthly: function() {
        return this.start("monthly")
      },
      startYearly: function() {
        return this.start("yearly")
      },
      start: function(b) {
        var a = $.Deferred();
        this.openBillingInfoPopover(b).done(function(b, e) {
          var f;
          f = $("#template-subscription-success").mustache({}).appendTo("body").on({
            "beforeClose.popover": function() {
              a.resolve(b, e);
              $("<img/>", {
                src: "//www.googleadservices.com/pagead/conversion/992328252/?value=0&label=NJgvCNyC-AUQvPSW2QM&guid=ON&script=0"
              })
            },
            "afterClose.popover": function(b) {
              f.popover().destruct()
            }
          });
          f.find(".subscription-success-continue").on("click", function() {
            f.popover().close()
          });
          f.popover({
            isOpen: !0,
            fixedTop: 0.1
          })
        }).fail(function(b, e) {
          a.reject(b, e)
        });
        return a.promise()
      },
      editBillingInfo: function() {
        return this.openBillingInfoPopover("update", $.extend({}, this.data.stripeBillingInfo.paymentCard))
      },
      editPlanType: function() {
        var b = this,
          a = $.Deferred(),
          d, e;
        d = $("#template-edit-subscription").mustache({
          isMonthly: "monthly" === b.data.plan,
          isYearly: "yearly" === b.data.plan
        }).appendTo("body");
        d.on({
          "beforeClose.popover": function(b) {
            b.userTriggered && a.reject()
          },
          "afterClose.popover": function() {
            d.popover().destruct()
          },
          "execute.asyncForm": function() {
            var f = $("#edit-subscription").find("input:radio:checked").val();
            "monthly" === f ? e.unlock().always(function() {
              d.trigger({
                type: "validate",
                validationData: {
                  result: !1,
                  message: "Please contact support@everpix.com to switch to a monthly subscription."
                }
              })
            }) : "yearly" === f && a.follow(b.openBillingInfoPopover("yearly", $.extend({}, b.data.stripeBillingInfo.paymentCard)))
          }
        });
        e = d.asyncForm();
        d.popover({
          isOpen: !0,
          closeButton: "back",
          fixedTop: 0.1
        });
        $("#edit-subscription\\/cancel").on("click",
          function() {
            b.cancel().done(function() {
              a.resolve(!0)
            }).fail(function() {
              a.reject()
            })
          });
        return a.promise()
      },
      cancel: function() {
        var b = this,
          a = $.Deferred(),
          d, e;
        d = $("#template-subscription-cancel").mustache({
          dayOfReckoning: b.data.stripeBillingInfo.nextBillingDate ? b.data.stripeBillingInfo.nextBillingDate.toString(EXPIRATION_TIMESTAMP_FORMAT) : !1
        }).appendTo("body");
        d.on({
          "beforeClose.popover": function(b) {
            b.userTriggered && a.reject()
          },
          "afterClose.popover": function() {
            d.popover().destruct()
          },
          "execute.asyncForm": function() {
            API.request("updateBillingInfo", {
              plan: "cancel"
            }).done(function(d, e) {
              b.setData(d);
              a.resolve()
            }).fail(function(b, a) {
              e.unlock().always(function() {
                d.trigger({
                  type: "validate",
                  validationData: {
                    result: !1,
                    message: "Unexpected error, please try again. (code " + a + ")"
                  }
                })
              })
            })
          }
        });
        e = d.asyncForm();
        d.popover({
          isOpen: !0,
          closeButton: "back",
          fixedTop: 0.1
        });
        return a.promise()
      }
    };
    Stripe.setPublishableKey(STRIPE_KEY);
    API.define("stripeBillingInfo", "GET", "user_billing_stripe", {
      includeAuthToken: !0
    });
    API.define("stripePrice", "GET", "user_stripe_price", {
      includeAuthToken: !0
    });
    API.define("updateBillingInfo", "POST", "user_billing_stripe", {
      timeout: 65E3
    });
    PubHub.sub("User/updateInfo", function() {
      a.retrieveUserInfo()
    });
    a.initDfd.follow(Initializer.ready(function() {
      a.retrieveUserInfo()
    }));
    return a
  }(),
  FreeInfo = function() {
    API.define("freeInfo", "GET", "user_free_info", {
      includeAuthToken: !0
    });
    API.define("inviteFriends", "POST", "user_invite_others");
    return {
      data: null,
      retrieve: function(a) {
        var b = this,
          c = $.Deferred();
        if (!b.data || a) return API.request("freeInfo").done(function(a) {
          b.data = a;
          c.resolve(b.data);
          PubHub.pub("FreeInfo/retrieve", b.data)
        });
        c.resolve(b.data);
        return c.promise()
      },
      inviteFriends: function() {
        var a, b = $.Deferred();
        a = $("#template-invite").mustache({
          isFree: "free" === Subscription.getInfo("plan"),
          inviteLink: $.mustache(INVITE_LINK, {
            email: encodeURIComponent(User.getInfo("email"))
          })
        }).appendTo("body");
        a.on({
          "afterOpen.popover": function() {
            a.find("input").first().trigger("focus")
          },
          "beforeClose.popover": function(a) {
            a.userTriggered && b.reject()
          },
          "afterClose.popover": function() {
            a.popover().destruct()
          },
          "execute.asyncForm": function() {
            var c = _($("#invite\\/emails").val().match(REGEX_EMAIL_GLOBAL)).uniq(),
              d = {
                emails: JSON.stringify(c),
                message: $("#invite\\/message").val() || void 0
              };
            API.request("inviteFriends", d).done(function(a) {
              var d, g = _(c).difference(a.emailsWithAccounts),
                h = a.emailsWithAccounts,
                k, m;
              !$.isNumeric(a.queueDelay) || 0 >= a.queueDelay ? a = !1 : 3600 > a.queueDelay ? (a = Math.floor(a.queueDelay / 60), a = a + " minute" + (1 === a ? "" : "s")) : 86400 > a.queueDelay ? (a = Math.floor(a.queueDelay / 3600), a = a + " hour" + (1 === a ? "" : "s")) :
                604800 > a.queueDelay ? (a = Math.floor(a.queueDelay / 86400), a = a + " day" + (1 === a ? "" : "s")) : (a = Math.floor(a.queueDelay / 604800), a = a + " week" + (1 === a ? "" : "s"));
              k = 1 === g.length ? "<strong>" + g[0] + "</strong>" : 1 < g.length ? _(g).chain().initial().map(function(b) {
                return "<strong>" + b + "</strong>"
              }).value().join(", ") + " and <strong>" + _(g).last() + "</strong>" : !1;
              m = 1 === h.length ? "<strong>" + h[0] + "</strong>" : 1 < h.length ? _(h).chain().initial().map(function(b) {
                return "<strong>" + b + "</strong>"
              }).value().join(", ") + " and <strong>" + _(h).last() +
                "</strong>" : !1;
              d = $("#template-invite-done").mustache({
                time: a,
                invitees: k,
                inviteesPlural: 1 !== g.length,
                users: m,
                usersPlural: 1 !== h.length
              }).appendTo("body").on({
                "beforeClose.popover": function(a) {
                  b.resolve()
                },
                "afterClose.popover": function() {
                  $(this).popover().destruct()
                }
              });
              d.find(".button").on("click", function() {
                d.popover().close()
              });
              d.popover({
                isOpen: !0,
                fixedTop: 0.1
              })
            }).fail(function(b, c) {
              a.asyncForm().unlock().always(function() {
                400 === c && 0 <= b.indexOf("Invalid email") ? $("#invite\\/emails").trigger({
                  type: "validate",
                  validationData: {
                    result: !1,
                    message: "Invalid email address list"
                  }
                }) : 412 === c ? $("#invite\\/emails").trigger({
                  type: "validate",
                  validationData: {
                    result: !1,
                    message: "You cannot send an invite to yourself."
                  }
                }) : a.trigger({
                  type: "validate",
                  validationData: {
                    result: !1,
                    message: "Unexpected error, please try again. (code " + c + ")"
                  }
                })
              })
            })
          }
        }).asyncForm();
        $("#invite\\/emails").on("blur", function() {
          var b = $(this),
            a;
          a = _(b.val().split(/,|\s/)).chain().map(function(b) {
            return (REGEX_EMAIL.exec(b) || [])[0]
          }).compact().value();
          b.val(a.length ?
            a.join(", ") + ", " : "");
          _(a).contains(User.getInfo("email")) && b.trigger({
            type: "validate",
            validationData: {
              result: !1,
              message: "You cannot send an invite to yourself."
            }
          })
        });
        a.popover({
          isOpen: !0,
          closeButton: "back",
          fixedTop: 0.1
        });
        PubHub.pub("InviteForm/open");
        return b.promise()
      }
    }
  }(),
  State = function() {
    var a = {
      currentState: {}
    }, b = Modernizr.history;
    a.get = function(b) {
      return b ? this.currentState[b] : $.extend({}, this.currentState)
    };
    a.push = function(a) {
      a = this.requestChange(a);
      var d, e;
      return this.setApplicationState(a) ?
        (a = "#" + decodeURIComponent($.param(this.currentState)), b ? window.history.pushState(this.currentState, "", a) : (d = $(window).scrollLeft(), e = $(window).scrollTop(), window.location.hash = a, window.scrollTo(d, e)), $.extend({}, this.currentState)) : !1
    };
    a.replace = function(a) {
      a = this.requestChange(a);
      var d, e;
      return this.setApplicationState(a) ? (a = "#" + decodeURIComponent($.param(this.currentState)), b ? window.history.replaceState(this.currentState, "", a) : (d = $(window).scrollLeft(), e = $(window).scrollTop(), window.location.replace(window.location.toString().split("#")[0] +
        a), window.scrollTo(d, e)), $.extend({}, this.currentState)) : !1
    };
    a.requestChange = function(b) {
      var a = {};
      _({}).chain().extend(this.currentState, b).each(function(b, c) {
        b && (a[c] = b)
      });
      PubHub.pub("State/propose", a);
      return a
    };
    a.setApplicationState = function(b) {
      if (_(this.currentState).isEqual(b)) return !1;
      this.currentState = b;
      PubHub.pub("State/set", this.currentState);
      return $.extend({}, this.currentState)
    };
    Initializer.ready(function() {
      if (b) $(window).on({
        popstate: function(b) {
          b.originalEvent.state && a.setApplicationState(b.originalEvent.state)
        },
        hashchange: function() {
          a.replace($.deparam(window.location.hash.replace(/^#/, "")))
        }
      });
      else $(window).on("hashchange", function(b) {
        a.push($.deparam(window.location.hash.replace(/^#/, "")))
      });
      _(function() {
        a.push($.deparam(window.location.hash.replace(/^#/, "")))
      }).defer()
    });
    return a
  }(),
  Maps = function() {
    function a() {
      if (window.google && window.google.maps) return PubHub.pub("Maps/ready"), !0;
      $("<script/>", {
        src: MAPS_API_URL + "&callback=Maps.init"
      }).appendTo("body");
      return !1
    }
    return {
      init: a,
      getFriendlyLocation: function(b,
        c) {
        function d() {
          (new google.maps.Geocoder).geocode({
            latLng: new google.maps.LatLng(b, c)
          }, function(b, a) {
            var c = {}, d = [];
            a === google.maps.GeocoderStatus.OK && b.length ? ($.each(b[0].address_components, function() {
                c[this.types[0]] = {
                  longName: this.long_name.replace(/\s/g, "&nbsp;"),
                  shortName: this.short_name.replace(/\s/g, "&nbsp;")
                }
              }), c.neighborhood ? d.push(c.neighborhood.longName) : c.sublocality && d.push(c.sublocality.longName), c.locality && c.locality.longName !== d[0] ? d.push(c.locality.longName) : c.administrative_area_level_2 &&
              (c.administrative_area_level_1 && c.administrative_area_level_1.longName !== d[0]) && d.push(c.administrative_area_level_2.longName), c.administrative_area_level_1 && d.push(c.administrative_area_level_1.shortName), 2 > d.length && c.country && d.push(c.country.longName), e.resolve(d.join(", "))) : e.reject()
          })
        }
        var e = $.Deferred(),
          f;
        f = PubHub.sub("Maps/ready", function() {
          PubHub.drubSub("Maps/ready", f);
          d()
        });
        a();
        return e
      }
    }
  }(),
  Sharing = function() {
    var a = {};
    $.extend(!0, a, Strings.prototype, Templates.prototype);
    Strings.call(a);
    Templates.call(a);
    $.extend(!0, a, {
      templates: {
        facebookForm: {
          selector: "#template-share-facebook"
        },
        twitterForm: {
          selector: "#template-share-twitter"
        },
        photoMailForm: {
          selector: "#template-share-photomail"
        },
        photoPageForm: {
          selector: "#template-share-photopage"
        },
        pathForm: {
          selector: "#template-share-path"
        }
      },
      strings: {
        shareMessageSuccess: function(b, a) {
          return $.mustache(SHARE_MESSAGE_SUCCESS, {
            serviceTitle: b,
            isPlural: a
          })
        },
        shareMessageError: function(b) {
          return $.mustache(SHARE_MESSAGE_ERROR, {
            serviceTitle: b
          })
        },
        shareTitle: SHARE_DEFAULT_TITLE,
        shareDescription: SHARE_DEFAULT_DESCRIPTION
      },
      recentEmailAddresses: [],
      pathFriends: null
    });
    a.shareFromActive = function(b) {
      return PhotoViewer.isActive ? this.shareFromPhotoViewer(b) : this.shareFromActiveView(b)
    };
    a.shareFromActiveView = function(b) {
      var c = $.Deferred(),
        d = Views.getActive();
      d && d.features.sharing ? (d = d instanceof MomentYearView || d instanceof MomentMonthView ? _(MomentYears.getView()).toArray().concat(_(MomentMonths.getView()).toArray()) : d instanceof SourceYearView || d instanceof SourceMonthView ? _(SourceYears.getView()).toArray().concat(_(SourceMonths.getView()).toArray()) :
        d instanceof HighlightYearView || d instanceof HighlightMonthView ? _(HighlightYears.getView()).toArray().concat(_(HighlightMonths.getView()).toArray()) : [d]) ? c.follow(a.shareFromViews(b, d)) : c.reject() : c.reject();
      return c.promise()
    };
    a.shareFromViews = function(b, c, d, e) {
      function f(d) {
        var f = $.Deferred(),
          g = 1 === c.length,
          h, k = [d],
          r = a.makeString("shareTitle"),
          q;
        e && (k = k.concat(e));
        switch (b) {
          case "facebook":
            h = a.sharePhotosToFacebook;
            e || k.push(g ? c[0].makeString("shareFacebookTitle") : r);
            q = SHARE_TITLE_FACEBOOK;
            break;
          case "twitter":
            h = a.sharePhotosToTwitter;
            e || k.push(c[0].makeString("shareTwitterTweet"));
            q = SHARE_TITLE_TWITTER;
            break;
          case "photoMail":
            h = a.sharePhotosToPhotoMail;
            e || k.push(g ? c[0].makeString("sharePhotoMailSubject") : r);
            q = SHARE_TITLE_PHOTOMAIL;
            break;
          case "photoPage":
            h = a.sharePhotosToPhotoPage;
            e || k.push(g ? c[0].makeString("sharePhotoPageTitle") : r);
            q = SHARE_TITLE_PHOTOPAGE;
            break;
          case "path":
            h = a.sharePhotosToPath, e || k.push(g ? c[0].makeString("sharePathTitle") : r), q = SHARE_TITLE_PATH
        }
        h ? f.follow(h.apply(a, k).done(function() {
          var c;
          "photoPage" !== b && (c = a.makeString("shareMessageSuccess", q, 1 !== d.length), MessageBars.buildNew(c))
        }).fail(function(b, c) {
          var d;
          c && (d = b || a.makeString("shareMessageError", q), MessageBars.buildNew(d, {
            extraClasses: "alert"
          }))
        })) : f.reject();
        return f.promise()
      }

      function g() {
        var b, a;
        _(c).every(function(b) {
          return !!b.viewOf.photos
        }) && (b = _(c).chain().pluck("grids").flatten().map(function(b) {
          return b.getInsertedPreviews()
        }).flatten().pluck("previewOf").filter(function(b) {
          return b instanceof Photo
        }).uniq().value());
        if (b && 1 === b.length) return f(b);
        a = Selections.buildNew(c, function(b) {
          f(b).done(function() {
            a.resolve()
          }).fail(function(b, c) {
            c && a.reject()
          });
          return a.promise()
        }, d);
        return a.promise()
      }
      var h = $.Deferred(),
        k = Sources.getConnections(b);
      if (c) _(c).isArray() || (c = [c]);
      else return $.rejected;
      k && !k.isConnected ? ($("#template-serviceUnconnectedWarning").mustache({
        serviceTitle: k.title
      }).appendTo("body").on({
        "afterClose.popover": function(b) {
          $(this).popover().destruct()
        }
      }).popover({
        isOpen: !0,
        closeButton: "back"
      }), h.reject()) :
        "photoPage" === b ? PhotoPages.selectPhotoPage().done(function(b) {
          b instanceof PhotoPage ? h.follow(b.addFromShareMenu(c)) : h.follow(g())
        }).fail(function() {
          h.reject()
        }) : h.follow(g());
      return h.promise()
    };
    a.shareFromPhotoViewer = function(b, a) {
      function d() {
        var d = $.Deferred(),
          f, h = [g],
          l;
        a && (h = h.concat(a));
        switch (b) {
          case "facebook":
            f = e.sharePhotosToFacebook;
            a || h.push(PhotoViewer.makeString("shareFacebookCaption"));
            l = SHARE_TITLE_FACEBOOK;
            break;
          case "twitter":
            f = e.sharePhotosToTwitter;
            a || h.push(PhotoViewer.makeString("shareTwitterTweet"));
            l = SHARE_TITLE_TWITTER;
            break;
          case "photoMail":
            f = e.sharePhotosToPhotoMail;
            a || h.push(PhotoViewer.makeString("sharePhotoMailSubject"));
            l = SHARE_TITLE_PHOTOMAIL;
            break;
          case "photoPage":
            f = e.sharePhotosToPhotoPage;
            a || h.push(PhotoViewer.makeString("sharePhotoPageTitle"));
            l = SHARE_TITLE_PHOTOPAGE;
            break;
          case "path":
            f = e.sharePhotosToPath, a || h.push(PhotoViewer.makeString("sharePathTitle")), l = SHARE_TITLE_PATH
        }
        f ? f.apply(e, h).done(function() {
          d.resolve("photoPage" === b ? void 0 : e.makeString("shareMessageSuccess", l))
        }).fail(function(b,
          a) {
          d.reject(a ? b || e.makeString("shareMessageError", l) : void 0)
        }) : d.reject();
        return d.promise()
      }
      var e = this,
        f = $.Deferred(),
        g = PhotoViewer.photo,
        h = Sources.getConnections(b);
      g ? (PhotoViewer.sharePhotoTo(b, f.promise()), h && !h.isConnected ? $("#template-serviceUnconnectedWarning").mustache({
          serviceTitle: h.title
        }).appendTo("body").on({
          "beforeClose.popover": function(b) {
            f.reject(void 0, !b.userTriggered)
          },
          "afterClose.popover": function(b) {
            $(this).popover().destruct()
          }
        }).popover({
          isOpen: !0,
          closeButton: "back"
        }) : "photoPage" ===
        b ? PhotoPages.selectPhotoPage().done(function(b) {
          b instanceof PhotoPage ? f.follow(b.addFromShareMenu(g)) : f.follow(d())
        }).fail(function() {
          f.reject()
        }) : f.follow(d())) : f.reject();
      return f.promise()
    };
    a.sharePhotosToFacebook = function(b, c, d) {
      var e = $.Deferred();
      if (!Sources.getConnections("facebook").isConnected) return e.reject("Facebook not connected", 412).promise();
      if (b) _(b).isArray() || (b = [b]);
      else return e.reject("No photos provided.", 500).promise();
      a.buildForm("facebookForm", {
        albumTitle: c,
        photoCount: b.length,
        isSingle: 1 === b.length
      }, b).done(function(a) {
        if (a) a.on({
          "beforeClose.popover": function(b) {
            b.userTriggered && e.reject()
          },
          "execute.asyncForm": function() {
            var c;
            c = _(b).map(function(b) {
              return {
                pid: b.id
              }
            });
            1 < b.length ? c = {
              albumName: $("#share\\/facebook\\/title").val(),
              albumDescription: d || SHARE_DEFAULT_DESCRIPTION,
              photos: JSON.stringify(c)
            } : (c[0].caption = $("#share\\/facebook\\/caption").val(), c = {
              photos: JSON.stringify(c)
            });
            API.request("shareToFacebook", c).done(function() {
              a.popover().close();
              e.resolve("Success",
                200)
            }).fail(function(b, c) {
              412 === c ? (a.popover().close(), e.reject("Facebook not connected. You can connect Facebook from the <a href='#panel=connections/web'>Connections panel</a>.", 412)) : a.asyncForm().unlock().always(function() {
                a.trigger({
                  type: "validate",
                  validationData: {
                    result: !1,
                    message: "Unexpected error, please try again. (code " + c + ")"
                  }
                })
              })
            })
          }
        })
      });
      return e.done(function() {
        PubHub.pub("Sharing/share", "facebook", b.length)
      }).promise()
    };
    a.sharePhotosToTwitter = function(b, c) {
      var d = $.Deferred();
      if (!Sources.getConnections("twitter").isConnected) return d.reject("Twitter not connected",
        412).promise();
      if (b) _(b).isArray() || (b = [b]);
      else return d.reject("No photos provided.", 500).promise();
      a.buildForm("twitterForm", {
        allowDownload: !0,
        maxCharCount: SHARE_TWITTER_MAX_CHARCOUNT,
        photoCount: b.length,
        tweet: c,
        isSingle: 1 === b.length
      }, b).done(function(a) {
        a && (a.on({
          "beforeClose.popover": function(b) {
            b.userTriggered && d.reject()
          },
          "execute.asyncForm": function() {
            var c = $("#share\\/twitter\\/allowDownload").is(":checked") ? 1 : 0,
              c = {
                pids: JSON.stringify(_(b).pluck("id")),
                status: $("#share\\/twitter\\/tweet").val() ||
                  "",
                showUserName: 1,
                allowDownload: c
              };
            API.request("shareToTwitter", c).done(function(b) {
              a.popover().close();
              d.resolve(PhotoPages.get(b.sid) || new PhotoPage(b.sid, b, null, null, "fetch"))
            }).fail(function(b, c) {
              412 === c ? (a.popover().close(), d.reject("Twitter not connected", 412)) : a.asyncForm().unlock().always(function() {
                a.trigger({
                  type: "validate",
                  validationData: {
                    result: !1,
                    message: "Unexpected error, please try again. (code " + c + ")"
                  }
                })
              })
            })
          }
        }), $("#share\\/twitter\\/tweet").on("keyup", function() {
          var b = SHARE_TWITTER_MAX_CHARCOUNT -
            $(this).val().length;
          $("#share\\/twitter\\/characters").toggleClass("danger", 20 > b).text(b)
        }))
      });
      return d.done(function() {
        PubHub.pub("Sharing/share", "twitter", b.length)
      }).promise()
    };
    a.sharePhotosToPhotoMail = function(b, c) {
      var d = $.Deferred();
      if (b) _(b).isArray() || (b = [b]);
      else return d.reject("No photos provided.", 500).promise();
      a.buildForm("photoMailForm", {
        subject: c,
        photoCount: b.length,
        isSingle: 1 === b.length
      }, b, {
        validateTests: {
          recipientLimit: {
            applyTo: function() {
              return "" !== this.val() && this.is("input[type='email']")
            },
            testVal: function() {
              var b = (this.val() || "").match(REGEX_EMAIL);
              return b.length && b.length <= SHARE_MAIL_MAX_RECIPIENTS
            },
            failureMessage: "Cannot send to more than " + SHARE_MAIL_MAX_RECIPIENTS + " recipients."
          }
        }
      }).done(function(c) {
        c && (c.on({
          "beforeClose.popover": function(b) {
            b.userTriggered && d.reject()
          },
          "afterOpen.popover": function() {
            Cookie.getRemote(COOKIE_PHOTOMAILABOUT_NAME) || 0 !== Stats.getStat("photoMailsSent") || MessageBars.buildNew(SHARE_MAIL_MESSAGE_ABOUT, {
              insertFunction: "appendTo",
              insertElement: c,
              onClick: function() {
                Cookie.setRemote(COOKIE_PHOTOMAILABOUT_NAME, !0)
              }
            })
          },
          "execute.asyncForm": function() {
            var f = {
              recipients: JSON.stringify($("#share\\/photomail\\/recipients").val().match(REGEX_EMAIL_GLOBAL)),
              subject: $("#share\\/photomail\\/subject").val(),
              body: $("#share\\/photomail\\/body").val(),
              pids: JSON.stringify(_(b).pluck("id"))
            };
            API.request("shareToMail", f).done(function() {
              $("#share\\/photomail\\/recipients").autoCompleter().destruct();
              c.popover().close();
              a.refreshRecentEmailAddresses();
              d.resolve("Success", 200)
            }).fail(function(b, a) {
              c.asyncForm().unlock().always(function() {
                400 ===
                  a && 0 <= b.indexOf("Invalid email") ? $("#share\\/photomail\\/recipients").trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "Invalid email address list"
                    }
                  }) : 412 === a ? $("#share\\/photomail\\/recipients").trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "You cannot send photos to yourself."
                    }
                  }) : c.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "Unexpected error, please try again. (code " + a + ")"
                    }
                  })
              })
            })
          }
        }), $("#share\\/photomail\\/recipients").on("blur", function() {
          var b = $(this),
            a;
          a = _(b.val().split(/,|\s/)).chain().uniq().map(function(b) {
            return (REGEX_EMAIL.exec(b) || [])[0]
          }).compact().value();
          b.val(a.length ? a.join(", ") + ", " : "");
          _(a).contains(User.getInfo("email")) && b.trigger({
            type: "validate",
            validationData: {
              result: !1,
              message: "You cannot send photos to yourself."
            }
          })
        }), $("#share\\/photomail\\/recipients").autoCompleter({}, a.recentEmailAddresses))
      });
      return d.done(function() {
        PubHub.pub("Sharing/share", "email", b.length)
      }).promise()
    };
    a.sharePhotosToPhotoPage = function(b, c, d) {
      var e =
        $.Deferred();
      if (b) _(b).isArray() || (b = [b]);
      else return e.reject("No photos provided.", 500).promise();
      d ? API.request("shareToPhotoPage", {
        title: c,
        pids: JSON.stringify(_(b).pluck("id")),
        showUserName: 1
      }).done(function(b) {
        e.resolve(PhotoPages.get(b.sid) || new PhotoPage(b.sid, b, null, null, "fetch"))
      }).fail(function(b, a) {
        e.reject(b, a)
      }) : (c = {
        title: c,
        isNew: !0,
        allowDownload: !0,
        photoCount: b.length,
        isSingle: 1 === b.length
      }, a.buildForm("photoPageForm", c, b).done(function(a) {
        if (a) a.on({
          "beforeClose.popover": function(b) {
            b.userTriggered &&
              e.reject()
          },
          "execute.asyncForm": function() {
            var c = $("#share\\/photopage\\/allowDownload").length ? $("#share\\/photopage\\/allowDownload").is(":checked") ? 1 : 0 : void 0,
              c = {
                title: $("#share\\/photopage\\/title").val(),
                pids: JSON.stringify(_(b).pluck("id")),
                showUserName: 1,
                allowDownload: c
              };
            API.request("shareToPhotoPage", c).done(function(b, c) {
              a.popover().close();
              e.resolve(PhotoPages.get(b.sid) || new PhotoPage(b.sid, b, null, null, "fetch"))
            }).fail(function(b, c) {
              400 === c ? (a.popover().close(), e.reject(b, 400)) : 413 === c ?
                a.asyncForm().unlock().always(function() {
                  a.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "Photo Pages cannot contain more than " + SHARE_PHOTOPAGE_MAX_PHOTOS + " photos."
                    }
                  })
                }) : a.asyncForm().unlock().always(function() {
                  a.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "Unexpected error, please try again. (code " + c + ")"
                    }
                  })
                })
            })
          }
        })
      }));
      return e.then(function(a) {
        var c, d = $.Deferred();
        c = $("#template-share-photopage-link").mustache({
          url: a.url,
          includeUndo: !0
        }).appendTo("body").on({
          "afterOpen.popover": function() {
            c.find("input").first().trigger("focus").trigger("select")
          },
          "beforeClose.popover": function() {
            d.resolve()
          },
          "afterClose.popover": function() {
            c.popover().destruct()
          }
        });
        c.find(".photoPage-undo").on("click", function() {
          a.baleet(!0);
          c.popover().close()
        });
        c.popover({
          isOpen: !0
        });
        PubHub.pub("Sharing/share", "photoPage", b.length);
        return d.promise()
      }).promise()
    };
    a.sharePhotosToPath = function(b, a, d) {
      function e() {
        var d = $.Deferred(),
          e = _(f.pathFriends).pluck("name");
        if (!Sources.getConnections("path").isConnected) return d.reject("Path not connected", 412).promise();
        if (b) _(b).isArray() ||
          (b = [b]);
        else return d.reject("No photos provided.", 500).promise();
        f.buildForm("pathForm", {
          albumTitle: a,
          photoCount: b.length,
          isSingle: 1 === b.length,
          hasFriends: !! f.pathFriends.length
        }, b).done(function(a) {
          a && (a.on({
            "beforeClose.popover": function(b) {
              b.userTriggered && d.reject()
            },
            "execute.asyncForm": function() {
              var c = [],
                e = {
                  pid: b[0].id,
                  caption: $("#share\\/path\\/caption").val()
                };
              f.pathFriends.length && (c = _($("#share\\/path\\/friends").val().split(",")).chain().map(function(b) {
                var a = _(Sharing.pathFriends).filter(function(a) {
                  return a.name.toLowerCase() ===
                    b.trim().toLowerCase()
                });
                return a.length ? a[0].id : !1
              }).compact().value(), e.tags = JSON.stringify(c));
              API.request("shareToPath", e).done(function() {
                a.popover().close();
                d.resolve("Success", 200)
              }).fail(function(b, c) {
                f.pathFriends.length && 400 === c && 0 <= b.indexOf("Invalid tags") ? $("#share\\/path\\/friends").trigger({
                  type: "validate",
                  validationData: {
                    result: !1,
                    message: "Invalid friends list"
                  }
                }) : 412 === c ? (a.popover().close(), d.reject("Path not connected. You can connect Path from the <a href='#panel=connections/web'>Connections panel</a>.",
                  412)) : a.asyncForm().unlock().always(function() {
                  a.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: "Unexpected error, please try again. (code " + c + ")"
                    }
                  })
                })
              })
            }
          }), f.pathFriends.length && ($("#share\\/path\\/friends").on("blur", function() {
            var b = $(this),
              a;
            a = _(b.val().split(",")).chain().map(function(b) {
              var a = _(e).filter(function(a) {
                return a.toLowerCase() === b.trim().toLowerCase()
              });
              return a.length ? a[0] : !1
            }).compact().value();
            b.val(a.length ? a.join(", ") + ", " : "")
          }), $("#share\\/path\\/friends").autoCompleter({},
            e)))
        });
        return d.promise()
      }
      var f = this,
        g = $.Deferred();
      f.pathFriends ? g.follow(e()) : (BlockingActivity.show("Sharing-loadPath", SHARE_MESSAGE_LOAD_PATH), f.refreshPathFriends().always(function() {
        BlockingActivity.hide("Sharing-loadPath");
        g.follow(e())
      }));
      return g.done(function() {
        PubHub.pub("Sharing/share", "path", 1)
      }).promise()
    };
    a.buildForm = function(b, a, d, e) {
      var f = this;
      return f.buildElement.call(f, b, a, !1).done(function(a) {
        var c;
        a && (a.appendTo("body").on({
          "afterOpen.popover": function() {
            a.find("input, textarea").first().trigger("focus").trigger("select")
          },
          "afterClose.popover": function() {
            a.popover().destruct();
            f.destroyElement(b)
          }
        }), c = a.find(".card-thumbnails"), _(d).chain().first(5).each(function(b) {
          var a = $("<span/>", {
            "class": "card-thumbnail"
          }).appendTo(c),
            d = Thumbnails.generateURL(b.thumbnailID, THUMBNAIL_SIZE_TINY);
          $("<img/>", {
            load: function() {
              $(this).off("load");
              a.css("backgroundImage", "url('" + d + "')")
            },
            src: d
          })
        }), a.asyncForm(e), a.popover({
          isOpen: !0,
          closeButton: "back",
          autoCenter: !1
        }))
      })
    };
    a.refreshRecentEmailAddresses = function() {
      var b = this;
      return API.request("recentEmailAddresses").done(function(a) {
        b.recentEmailAddresses =
          a.emails || []
      })
    };
    a.refreshPathFriends = function() {
      var b = this;
      return API.request("pathFriends").always(function(a) {
        b.pathFriends = a ? a.contacts || [] : []
      })
    };
    Initializer.ready(function() {
      a.refreshRecentEmailAddresses()
    });
    PubHub.sub("Keyboard/shortcut", function(b) {
      var c = !0,
        d;
      if (2 === b.length && b[0].which === KEYCODES.s) {
        switch (b[1].which) {
          case KEYCODES.m:
            d = "photoMail";
            c = !1;
            break;
          case KEYCODES.p:
            d = "photoPage";
            c = !1;
            break;
          case KEYCODES.f:
            d = "facebook";
            c = !1;
            break;
          case KEYCODES.t:
            d = "twitter", c = !1
        }
        d && a.shareFromActive(d)
      }
      return c
    });
    API.define("shareToTwitter", "POST", "twitter_post");
    API.define("sharePhotoToTwitter", "POST", "twitter_export");
    API.define("shareToFacebook", "POST", "facebook_export");
    API.define("shareToMail", "POST", "email_export");
    API.define("shareToPhotoPage", "POST", "snapshot_create");
    API.define("shareToPath", "POST", "service_post", {
      dataMap: function(b) {
        return $.extend({}, b, {
          service: "path"
        })
      }
    });
    API.define("printToWalgreens", "POST", "walgreens_print");
    API.define("recentEmailAddresses", "GET", "email_recent", {
      includeAuthToken: !0
    });
    API.define("pathFriends", "GET", "service_contacts", {
      includeAuthToken: !0,
      dataMap: function(b) {
        return $.extend({}, b, {
          service: "path"
        })
      }
    });
    return a
  }(),
  Downloader = function() {
    var a;
    $(function() {
      a = $("<iframe/>", {
        id: "downloader"
      }).appendTo("body")
    });
    return {
      get: function(b) {
        Initializer.ready(function() {
          a && (a.removeAttr("src"), a.attr("src", b));
          PubHub.pub("Downloader/get", b)
        })
      }
    }
  }(),
  Stats = function() {
    function a(a) {
      var c = $.Deferred();
      return API.request("stats", {
        includePending: 1,
        includeUpdating: 1
      }).done(function(a) {
        b =
          a;
        b.updated || delete b.updated;
        User.isCollectionUpdating( !! b.updating);
        c.resolve(b);
        PubHub.pub("Stats/refresh", b)
      })
    }
    var b = {}, c = $.Deferred();
    API.define("stats", "GET", "user_statistics", {
      includeAuthToken: !0
    });
    Initializer.ready(function() {
      c.follow(a())
    });
    return {
      ready: function(b) {
        b && b.promise ? b.follow(c) : $.isFunction(b) && c.done(b);
        return $.Deferred().follow(c)
      },
      refresh: a,
      getStat: function(a) {
        return a ? b[a] : $.extend({}, b)
      }
    }
  }(),
  FlashbackHelper = function() {
    return {
      chooseAction: function(a, b) {
        return _(a).find(function(a) {
          return a.tag ===
            b
        }) || a[_.random(_(a).size() - 1)]
      },
      getFetcher: function(a, b) {
        var c = $.Deferred(),
          d;
        "time" === a.tag ? Moments.fetchRandom().done(function(b) {
          c.resolve(b)
        }).fail(function() {
          c.reject()
        }) : "today" === a.tag ? (Query.today && /[0-9]{2}\/[0-9]{2}/.test(Query.today) ? d = (new XDate).setMonth(Query["today-date"].split("/")[0] - 1).setDate(Query.today.split("/")[1]) : Cookie.getLocal(COOKIE_TODAYOVERRIDE_NAME) && (d = (new XDate).setMonth(Cookie.getLocal(COOKIE_TODAYOVERRIDE_NAME).split("/")[0] - 1).setDate(Cookie.getLocal(COOKIE_TODAYOVERRIDE_NAME).split("/")[1])),
          c.resolve(new TodayFetcher([], d && d.valid() ? d : void 0, b))) : "shuffle" === a.tag ? c.resolve(new ShuffleFetcher([], $.extend(!0, {
          resources: {
            fetchItems: {
              params: {
                limit: FETCH_LIMIT_FLASHBACK_DOUBLE
              }
            }
          }
        }, b))) : c.resolve(new InterestingFetcher([], a.tag, $.extend(!0, {
          resources: {
            fetchItems: {
              params: {
                limit: FETCH_LIMIT_FLASHBACK_SINGLE
              }
            }
          }
        }, b)));
        return c.promise()
      },
      setTodayDate: function() {
        var a = $.Deferred();
        $(function() {
          var b = $("#template-today").mustache({
            savedValue: Cookie.getLocal(COOKIE_TODAYOVERRIDE_NAME)
          });
          b.appendTo("body").on({
            "afterOpen.popover": function() {
              b.find("input, textarea").first().trigger("focus")
            },
            "beforeClose.popover": function(b) {
              b.userTriggered && a.reject()
            },
            "afterClose.popover": function() {
              b.popover().destruct()
            },
            "execute.asyncForm": function() {
              var c = $("#today\\/date").val();
              c && /[0-9]{2}\/[0-9]{2}/.test(c) ? Cookie.setLocal(COOKIE_TODAYOVERRIDE_NAME, c, COOKIE_TODAYOVERRIDE_EXP) : Cookie.clearLocal(COOKIE_TODAYOVERRIDE_NAME);
              a.resolve();
              b.popover().close()
            }
          });
          b.find(".cancelLink").on("click", function() {
            Cookie.clearLocal(COOKIE_TODAYOVERRIDE_NAME);
            a.resolve();
            b.popover().close()
          });
          b.popover({
            isOpen: !0
          });
          b.asyncForm()
        });
        return a.promise()
      }
    }
  }(),
  Thumbnails = function() {
    var a = {};
    $.extend(!0, a, Procrastination.prototype);
    $.extend(!0, a, {
      hosts: {},
      finishedDownloadSrcs: [],
      finishedDownloadImages: [],
      concurrentDownloads: 12
    });
    Procrastination.call(a);
    a.queueDownload = function(b) {
      var a = this,
        d = $.Deferred(),
        e = _(a.finishedDownloadSrcs).indexOf(b),
        f;
      0 <= e ? d.resolve(a.finishedDownloadImages[e]) : b ? (e = document.createElement("a"), e.href = b, f = e.hostname, a.hosts[f] || (a.hosts[f] = {
          isDownloading: !1,
          imageSrcs: [],
          imageDfds: []
        }), a.hosts[f].imageSrcs.push(b),
        a.hosts[f].imageDfds.push(d), a.hosts[f].isDownloading || a.procrastinate("download:" + f, function() {
          a.startDownloading(f)
        })) : d.reject(1, "No thumbnailURL provided");
      return d.promise()
    };
    a.dequeueDownload = function(b) {
      var a;
      b && (a = document.createElement("a"), a.href = b, a = a.hostname, this.hosts[a] && (b = _(this.hosts[a].imageSrcs).indexOf(b), 0 <= b && (this.hosts[a].imageSrcs.splice(b, 1), this.hosts[a].imageDfds.splice(b, 1)[0].reject(2, "Download canceled"))))
    };
    a.startDownloading = function(b) {
      function a(b) {
        var c, d;
        b < f.imageSrcs.length ?
          (c = f.imageSrcs.splice(b, 1)[0], d = f.imageDfds.splice(b, 1)[0], $("<img/>", {
          load: function() {
            e.finishedDownloadSrcs.push(c);
            e.finishedDownloadImages.push(this);
            d.resolve(this)
          },
          error: function() {
            d.reject(3, "Error downloading image")
          },
          src: c
        })) : d = $.rejected;
        return d.promise()
      }

      function d(b) {
        f.isDownloading && (f.imageSrcs.length ? a(b).always(function() {
          d(0)
        }) : f.isDownloading = !1)
      }
      var e = this,
        f;
      b ? e.hosts[b] && !e.hosts[b].isDownloading && (f = e.hosts[b], f.isDownloading = !0, _.times(e.concurrentDownloads || e.imageSrcs.length,
        function() {
          d(0)
        })) : _(e.hosts).each(function(b, a) {
        e.startDownloading(a)
      })
    };
    a.pauseDownloading = function(b) {
      var a = this;
      b ? a.hosts[b] && a.hosts[b].isDownloading && (a.hosts[b].isDownloading = !1) : _(a.hosts).each(function(b, e) {
        a.startDownloading(e)
      })
    };
    a.generateURL = function(b, a) {
      var d;
      void 0 === this.allowRetina && (this.allowRetina = 2 <= window.devicePixelRatio);
      void 0 === this.allowWebP && (this.allowWebP = Modernizr.webp && !! window.Preferences && !! Preferences.get("webp"));
      this.allowRetina && 1024 < parseInt(a) && (a = "1024" + a.split("").splice(-1,
        1)[0]);
      d = THUMBNAIL_SERVER_URL + b + "/" + a;
      this.allowWebP && "original" !== a && (d += "~webp");
      this.allowRetina && "original" !== a && (d += "@2x");
      return d
    };
    PubHub.sub("Preference/set", function(b, c) {
      "webp" === b && (a.allowWebP = Modernizr.webp && !! c)
    });
    return a
  }(),
  Keyboard = function() {
    var a = {
      enabled: !1,
      isTracking: !1,
      inputFocused: !1,
      recentKeys: [],
      recentTimer: null,
      recentTimerDuration: 600,
      startTracking: function() {
        var b = this;
        b.isTracking || (b.isTracking = !0, $("body").on({
          "focus.keyboard": function() {
            b.inputFocused = !0
          },
          "blur.keyboard": function() {
            b.inputFocused = !1
          }
        }, "input, select, textarea"), $(document).on({
          "keydown.keyboard": function(a) {
            b.inputFocused || (a.metaKey || a.altKey || a.ctrlKey) || (clearTimeout(b.recentTimer), b.recentKeys.push(_(a).pick("which", "shiftKey")), PubHub.pub("Keyboard/shortcut", b.recentKeys), b.recentTimer = setTimeout(function() {
              b.recentKeys = []
            }, b.recentTimerDuration), a.preventDefault())
          }
        }))
      },
      stopTracking: function() {
        this.isTracking && (this.isTracking = !1, $("body").off(".keyboard"), $(document).off(".keyboard"))
      }
    };
    Initializer.ready(function() {
      PubHub.sub("Preference/set",
        function(b, c) {
          "keyboard_shortcuts" === b && (c ? (a.enabled = !0, a.startTracking()) : (a.enabled = !1, a.stopTracking()))
        });
      Preferences.get("keyboard_shortcuts") && (a.enabled = !0, a.startTracking())
    });
    return a
  }(),
  Notifications = function() {
    var a = {
      hasRemoteNotifications: !1,
      localNotifications: [],
      showNext: function() {
        var b = this,
          a;
        b.hasRemoteNotifications ? API.request("fetchNotification").done(function(a, c) {
          b.hasRemoteNotifications = !! a.hasMore;
          PubHub.pub("Notifications/hasRemote", b.hasRemoteNotifications);
          a.notification ?
            b.showNotification(a.notification) : b.showNext()
        }) : b.localNotifications.length && (a = b.localNotifications.splice(0, 1)[0], b.showNotification(a.info, a.onClick))
      },
      showNotification: function(b, a) {
        var d = this,
          e = $.Deferred();
        $(function() {
          var f = !! b.link && -1 !== b.link.indexOf(HOSTNAME),
            g;
          f && (b.link = "#" + b.link.split("#")[1]);
          g = $("#template-notification").mustache({
            subject: b.subject,
            body: b.body,
            link: b.link,
            isLocal: f
          }).prependTo(".navDrawer-notifications");
          g.on("click", function() {
            g.empty().remove();
            d.showNext();
            _(a).isFunction() &&
              a.call()
          });
          g.find("a").on("click", function() {
            b.code && PubHub.pub("Notification/click", b.code || void 0);
            f && NavPanel.deactivate(!0)
          });
          e.resolve()
        });
        return e.promise()
      },
      setLocalNotifications: function() {
        !Cookie.getRemote(COOKIE_RETINAPERFWARNING_NAME) && ("Mac" === Platform.os && 2 <= window.devicePixelRatio && "Safari" !== Platform.browser && "Chrome" !== Platform.browser) && this.localNotifications.push({
          info: {
            body: "Looks like you have a Mac with a Retina display. For best photo quality, we recommend using Chrome or Safari."
          },
          onClick: function() {
            Cookie.setRemote(COOKIE_RETINAPERFWARNING_NAME, 1)
          }
        })
      }
    };
    Initializer.ready(function() {
      a.setLocalNotifications();
      User.getInfo("hasNotifications") && (a.hasRemoteNotifications = !0, PubHub.pub("Notifications/hasRemote", a.hasRemoteNotifications));
      PubHub.sub("Panel/activate", function(b) {
        b === NavPanel && a.showNext()
      })
    });
    API.define("fetchNotification", "POST", "notification_fetch");
    return a
  }();
NavBar = function() {
  var a = {};
  $.extend(!0, a, Procrastination.prototype, Subscriptions.prototype, Templates.prototype);
  $.extend(!0, a, {
    mode: "browse",
    templates: {
      shareMenu: {
        selector: "#template-shareMenu",
        options: {
          title: SHAREMENU_TITLE_PLURAL
        }
      }
    }
  });
  Procrastination.call(a);
  Subscriptions.call(a);
  Templates.call(a);
  a.updateUI = function() {
    var b = this;
    if (b.$navBar) return b.procrastinate("updateUI", function() {
      var a = $.Deferred(),
        d = Views.getActive(),
        e = b.$navBar.find(".navBar-controls-content").transitionDuration(),
        f = $(""),
        g = $(""),
        h = [],
        k = $("#navBar-left").find(".navBar-controls.selected"),
        m = $("#navBar-right").find(".navBar-controls.selected"),
        p = $("#navBar-center").find(".navBar-controls.selected"),
        l, n;
      d ? ("selection" === b.mode ? l = $("#navBar-left\\/selection") : "context" === d.navBarSections.left ? l = $("#navBar-left\\/context") : "review" === d.navBarSections.left ? l = $("#navBar-left\\/review") : (l = $("#navBar-left\\/default"), l.find(".navBar-views-title").html(d.makeString("navBarTitle") || d.makeString("title") || "")), l.is(k) || (f = f.add(l),
          g = g.add(k), h.push(function() {
            l.find(".navBar-controls-content").append($("#discreetActivity"))
          })), $("#navBar-left\\/context").toggleClass("hideLobby", !Views.needsLobbyButton()), "selection" === b.mode ? n = $("#navBar-right\\/selection") : "review" === d.navBarSections.right ? n = $("#navBar-right\\/review") : "share" === d.navBarSections.right ? (n = $("#navBar-right\\/share"), h.push(function() {
          n.find(".navBar-slideshow").toggleClass("hidden", !d.features.slideshow)
        })) : n = $("#navBar-right\\/default"), n.is(m) || (f = f.add(n),
          g = g.add(m)), "context" === d.navBarSections.center ? (k = $("#navBar-center\\/context"), k.find(".navBar-title").html(d.makeString("title")).toggleClass("withMenu", d.features.miscMenu)) : "year" === d.navBarSections.center ? k = $("#navBar-center\\/year") : "flashback" === d.navBarSections.center ? (k = $("#navBar-center\\/flashback"), k.find(".button").removeClass("selected").filter("[data-state='" + d.state + "']").addClass("selected")) : k = $("#navBar-center\\/default"), d.$miscMenu && ($("#navBar").find(".miscMenu").detach(), $("#navBar").append(d.$miscMenu)),
        k.is(p) || (f = f.add(k), g = g.add(p)), f.length || h.length ? (f.show(), _(function() {
          f.addClass("selected");
          a.resolve();
          g.length && (g.removeClass("selected"), _(function() {
            g.hide()
          }).delay(e));
          _(h).invoke("call")
        }).defer()) : a.resolve(), b.updateYearNav(), b.toggleShareButton()) : a.reject()
    });
    dfd.reject();
    return dfd.promise()
  };
  a.updateYearNav = function() {
    this.$navBar && this.procrastinate("updateYearNav", function() {
      var b = Views.getActive(),
        a, d, e, f, g;
      b && (b.viewOf && b.viewOf.year) && (a = Years.list(), d = b ? a.indexOf(b.viewOf.year) : -1, e = $("#navBar-center\\/year"), f = e.find(".yearNav-prev"), g = e.find(".yearNav-next"), e.find(".yearNav-selector").text(b.viewOf.year), 0 <= d ? (f.add(g).removeClass("hidden"), 0 < d ? f.removeClass("disabled").attr("href", "#view=year-" + a[d - 1]) : f.addClass("disabled").removeAttr("href"), d < a.length - 1 ? g.removeClass("disabled").attr("href", "#view=year-" + a[d + 1]) : g.addClass("disabled").removeAttr("href")) : f.add(g).addClass("hidden"))
    })
  };
  a.toggleShareButton = function(b) {
    this.$navBar && this.$navBar.find(".navBar-share").toggleClass("disabled", !! Views.getActive().isEmpty || !Views.getActive().features.sharing)
  };
  a.toggleSlideshowButton = function(b) {
    this.$navBar && this.$navBar.find(".navBar-slideshow").toggleClass("disabled", !! Views.getActive().isEmpty || !Views.getActive().features.slideshow)
  };
  a.setNewCount = function(b) {
    var a = this;
    a.$navBar && a.procrastinate("setNewCount", function() {
      a.$navBar.find(".navBar-views").attr("data-new-count", b)
    })
  };
  a.setNotificationIcon = function(b) {
    var a = this;
    a.$navBar && a.procrastinate("setNotificationIcon", function() {
      b ?
        a.$navBar.find(".navBar-views").attr("data-has-notification", !0) : a.$navBar.find(".navBar-views").removeAttr("data-has-notification")
    })
  };
  a.enterSelectionMode = function() {
    var b = this;
    "selection" !== b.mode ? (b.mode = "selection", b.updateSelectionUI(), b.subscribe("selectionChanges", "Group/add Group/remove", function(a) {
      a === Selections.getCurrent() && b.updateSelectionUI()
    }), b.updateUI().always(function() {
      b.$navBar && b.$navBar.addClass("selectionMode")
    })) : b.updateSelectionUI()
  };
  a.exitSelectionMode = function() {
    var b =
      this;
    "selection" === b.mode ? (b.mode = "browse", b.unsubscribe("selectionChanges"), b.updateUI().always(function() {
      b.$navBar && b.$navBar.removeClass("selectionMode");
      $(".messageBar.selectionStart").each(function() {
        $(this).data("messageBar").close()
      })
    })) : b.updateSelectionUI()
  };
  a.updateSelectionUI = function() {
    var b = this,
      a = Selections.getCurrent();
    return "selection" === b.mode && b.$navBar && a ? b.procrastinate("updateSelectionUI", function() {
      b.$navBar.find(".navBar-selection-status").toggleClass("withMenu", a.includeSelectionMenu);
      b.$navBar.find(".navBar-selection-status-count").text(a.countItems());
      b.$navBar.find(".navBar-selection-status-specifier").text(a.makeString("specifier"));
      b.$navBar.find(".navBar-selection-add").toggleClass("hidden", !a.includeAddButton);
      b.$navBar.find(".navBar-selection-done").toggleClass("disabled", a.countItems() < a.minToProceed || a.countItems() > a.maxToProceed);
      b.$navBar.find(".navBar-selection-done").text(a.makeString("doneButton"));
      b.$navBar.find(".navBar-selection-cancel").text(a.makeString("cancelButton"))
    }) :
      $.rejected
  };
  a.updateSubscriptionStatus = function() {
    this.$navBar.find(".navBar-upgrade").toggleClass("visible", "free" === Subscription.getInfo("plan"))
  };
  $(function() {
    a.$navBar = $("#navBar");
    a.$navBar.find(".navBar-previous").on("click", function() {
      Views.activatePrevious()
    });
    a.$navBar.find(".navBar-lobby").on("click", function() {
      Views.activatePreviousLobby()
    });
    a.$navBar.find(".navBar-views").on("click", function(b) {
      b.altKey ? (NavPanel.setState("alt"), NavPanel.activate(), b.preventDefault()) : NavPanel.setState(null)
    });
    a.$navBar.find("#navBar-center\\/context").on({
      mousedown: function() {
        var b = Views.getActive();
        return "selection" !== a.mode && $(this).hasClass("withMenu") && b.miscMenu ? !b.miscMenu.isOpen : !0
      },
      click: function() {
        var b = Views.getActive();
        "selection" !== a.mode && ($(this).hasClass("withMenu") && b.miscMenu) && (b.miscMenu.isOpen ? b.miscMenu.close() : b.miscMenu.open());
        return !1
      }
    }, ".navBar-title");
    a.$navBar.find("#epLogo").on({
      mousedown: function() {
        var b = Views.getActive();
        return "selection" !== a.mode && b.miscMenu ? !b.miscMenu.isOpen :
          YearsMenu ? !YearsMenu.isOpen : !0
      },
      click: function() {
        var b = Views.getActive();
        "selection" !== a.mode && b.miscMenu ? b.miscMenu.isOpen ? b.miscMenu.close() : b.miscMenu.open() : YearsMenu && (YearsMenu.isOpen ? YearsMenu.close() : YearsMenu.open());
        return !1
      }
    });
    a.buildElement("shareMenu").done(function(b) {
      a.shareMenu = b.bubble({
        id: "shareMenu-navBar"
      });
      b.appendTo(a.$navBar);
      a.$navBar.find(".navBar-share").on({
        mousedown: function() {
          return !a.shareMenu.isOpen
        },
        click: function(b) {
          $(this).hasClass("disabled") || (a.shareMenu.isOpen ?
            a.shareMenu.close() : a.shareMenu.open());
          return !1
        }
      });
      b.find(".bubbleMenu-button").on("click", function() {
        Sharing.shareFromActiveView($(this).data("service"))
      })
    });
    a.$navBar.find(".navBar-slideshow").on("click", function() {
      var b = Views.getActive();
      !$(this).hasClass("disabled") && b.startSlideshow && b.startSlideshow()
    });
    a.$navBar.find(".navBar-selection-cancel").on("click", function() {
      var b = Selections.getCurrent();
      "selection" === a.mode && b && b.reject()
    });
    a.$navBar.find(".navBar-selection-done").on("click", function() {
      var b =
        Selections.getCurrent();
      "selection" === a.mode && (b && !$(this).hasClass("disabled")) && b.proceed()
    });
    a.updateUI()
  });
  PubHub.sub("View/activate View/update", function() {
    a.$navBar && (a.$navBar.find(".bubbleMenu").each(function() {
      $(this).bubble().close()
    }), a.updateUI())
  });
  PubHub.sub("View/construct View/destruct", function(b) {
    a.updateYearNav()
  });
  PubHub.sub("View/markEmpty", function() {
    a.toggleShareButton();
    a.toggleSlideshowButton()
  });
  Initializer.ready(function() {
    a.setNewCount(PhotoMails.getNewCount());
    PubHub.sub("PhotoMails/set/newCount",
      function(b) {
        a.setNewCount(b)
      })
  });
  Initializer.ready(function() {
    a.setNotificationIcon(Notifications.hasRemoteNotifications);
    PubHub.sub("Notifications/hasRemote", function(b) {
      a.setNotificationIcon(b)
    })
  });
  Subscription.ready(function() {
    a.updateSubscriptionStatus();
    PubHub.sub("Subscription/update", function() {
      a.updateSubscriptionStatus()
    })
  });
  return a
}();
var PhotoViewer = function() {
  var a = {};
  $.extend(!0, a, Procrastination.prototype, Strings.prototype, Subscriptions.prototype, TaskQueue.prototype, Templates.prototype, Tracking.prototype);
  $.extend(!0, a, {
    supplier: null,
    photo: null,
    nextPhoto: null,
    prevPhoto: null,
    infoPanelIsOpen: null,
    defaultFeatures: {
      navigation: !0,
      sharing: !0,
      slideshow: !0,
      infoPanel: !0,
      nearbyPhotos: !0,
      jumpToMoment: !0,
      hide: !1,
      miscMenu: !0,
      editTimestamp: !1,
      rotate: !1,
      download: "iOS" !== Platform.os,
      baleet: !1
    },
    features: {},
    templates: {
      shareMenu: {
        selector: "#template-shareMenu",
        options: {
          title: SHAREMENU_TITLE_SINGULAR,
          hasPath: !0
        }
      }
    },
    strings: {
      sharePhotoMailSubject: function() {
        return $.mustache(PHOTOVIEWER_SHARE_PHOTOMAIL_SUBJECT, {
          date: this.photo.timestamp ? this.photo.timestamp.toString(PHOTOVIEWER_SHARE_PHOTOMAIL_DATE_FORMAT) : !1
        })
      },
      sharePhotoPageTitle: function() {
        return $.mustache(PHOTOVIEWER_SHARE_PHOTOPAGE_TITLE, {
          date: this.photo.timestamp ? this.photo.timestamp.toString(PHOTOVIEWER_SHARE_PHOTOPAGE_DATE_FORMAT) : !1
        })
      }
    },
    isActive: !1,
    isSettingPhoto: !1,
    mode: "browse",
    previewSize: _(THUMBNAIL_FULL_SIZES).chain().values().first().value(),
    pendingRotation: null
  });
  Procrastination.call(a);
  Strings.call(a);
  Subscriptions.call(a);
  TaskQueue.call(a);
  Templates.call(a);
  Tracking.call(a);
  a.activate = function(b, a, d) {
    var e = this,
      f = $.Deferred();
    !e.isActive && e.$photoViewer ? (e.isActive = !0, e.checkPreviewSize(), a && e.setSupplier(a), b && e.setPhoto(b), e.popover.open(d).always(function() {
      e.subscribe("viewportResize", "Viewport/update", function(b) {
        e.checkPreviewSize() && 0 < b.deltas.width && e.loadPhoto(!0);
        b = e.$infoPanel.find(".photo-info");
        b.length && b.data("scrollPane") &&
          b.scrollPane().update()
      });
      $(document).on("keyup.photoViewer", function(b) {
        switch (b.which) {
          case KEYCODES.right:
            e.goToNextPhoto();
            e.hideChrome();
            break;
          case KEYCODES.left:
            e.goToPrevPhoto();
            e.hideChrome();
            break;
          case KEYCODES.esc:
            "slideshow" === e.mode ? e.pauseSlideshow() : e.deactivate(!0)
        }
      });
      e.$photoViewer.on("mousemove touchstart click", function(b) {
        "slideshow" !== e.mode && e.showChrome();
        e.navArrowTimeout && clearTimeout(e.navArrowTimeout);
        e.navArrowTimeout = setTimeout(function() {
          e.hideChrome()
        }, PHOTOVIEWER_HIDECHROME_WAIT)
      });
      e.navArrowTimeout = setTimeout(function() {
        e.hideChrome()
      }, PHOTOVIEWER_HIDECHROME_WAIT);
      e.startTrackingSession();
      $(window).on("blur.photoViewer", function() {
        var b = $.now();
        $(window).one("focus.photoViewer", function() {
          6E4 < $.now() - b && (e.stopTrackingSession(b), e.startTrackingSession())
        })
      });
      "slideshow" === e.mode && e.executeAllTasks("slideshowMode/activate");
      PubHub.pub("PhotoViewer/activate");
      f.resolve()
    })) : f.reject();
    return f.promise()
  };
  a.deactivate = function(b) {
    var a = this,
      d = $.Deferred();
    a.isActive ? (a.isActive = !1, a.popover.close(b).always(function() {
      a.unsubscribe("viewportResize");
      a.stopTrackingSession();
      $(document, window).off(".photoViewer");
      a.$photoViewer.find(".photoViewer-messageBars").find(".messageBar").each(function() {
        $(this).data("messageBar").close()
      });
      a.clearPhoto();
      a.pauseSlideshow(!0);
      a.$photoViewer.find(".bubble").each(function() {
        $(this).bubble().close()
      });
      a.applyPendingPhotoRotation();
      a.$photoViewer.off("mousemove touchstart");
      PubHub.pub("PhotoViewer/deactivate");
      d.resolve()
    })) : d.reject();
    return d.promise()
  };
  a.setSupplier = function(b) {
    b !== this.supplier && (this.supplier = b || null, "selection" !== this.mode && this.setFeatures($.extend({}, this.defaultFeatures, b ? b.photoViewerFeatures : void 0)))
  };
  a.setFeatures = function(b) {
    var a = this.features.infoPanel;
    this.applyPendingPhotoRotation();
    $.extend(!0, this.features, b);
    b = _(this.features).chain().map(function(b, a) {
      return b ? a : !1
    }).compact().value().join(" ");
    this.$photoViewer && (this.$photoViewer.attr("data-features", b), this.isActive && a !== this.features.infoPanel &&
      (this.features.infoPanel ? this.getCurrentPhotoMeta() : this.hideInfoPanel()))
  };
  a.setPhoto = function(b, a, d) {
    var e = this;
    if (e.isSettingPhoto) return $.rejected;
    e.isSettingPhoto = !0;
    e.photoActivity.show("settingPhoto");
    return e.getPhotoFromSupplier(b, a).done(function(b, a) {
      if (d || b !== e.photo) e.applyPendingPhotoRotation(), e.photo = b, e.nextPhoto = a, e.setFeatures({
        navigation: !! e.nextPhoto && $.extend({}, e.defaultFeatures, e.supplier.photoViewerFeatures).navigation,
        slideshow: "selection" !== e.mode && !! e.nextPhoto && $.extend({},
          e.defaultFeatures, e.supplier.photoViewerFeatures).slideshow
      }), e.$photoViewer.find(".photoViewer-photos .photoHolder").empty().append($("<img/>")), e.loadPhoto().done(function() {
        b === e.photo && e.nextPhoto && e.nextPhoto.loadLarge(e.previewSize)
      }), b.timestamp ? e.$photoViewer.find(".photoViewer-jumpToMoment").removeClass("hidden").text(b.timestamp.toString(PHOTOVIEWER_JUMPTO_DATE_FORMAT)) : e.$photoViewer.find(".photoViewer-jumpToMoment").addClass("hidden"), e.features.infoPanel && e.infoPanelIsOpen && e.getCurrentPhotoMeta(),
      PubHub.pub("PhotoViewer/changePhoto", e, b)
    }).always(function() {
      e.isSettingPhoto = !1;
      e.photoActivity.hide("settingPhoto")
    })
  };
  a.clearPhoto = function() {
    this.applyPendingPhotoRotation();
    this.prevPhoto = this.nextPhoto = this.photo = null;
    this.$photoViewer.find(".photoViewer-photos .photoHolder").empty();
    this.clearInfoPanel()
  };
  a.getPhotoFromSupplier = function(b, a) {
    var d = $.Deferred();
    this.supplier && this.supplier.selectItemForViewer ? d.follow(this.supplier.selectItemForViewer(b, a)) : d.reject();
    return d.promise()
  };
  a.goToNextPhoto =
    function(b) {
      var a = this,
        d = $.Deferred();
      a.pauseSlideshow();
      a.features.navigation && a.nextPhoto ? d.follow(a.setPhoto(a.nextPhoto).done(function(d, f, g, h) {
        h && !b && a.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_ATEND, "end")
      })) : d.reject();
      return d.promise()
  };
  a.goToPrevPhoto = function(b) {
    var a = this,
      d = $.Deferred();
    a.pauseSlideshow();
    a.features.navigation && a.photo ? d.follow(a.setPhoto(a.photo, -1).done(function(d, f, g, h) {
      g && !b && a.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_ATSTART, "start")
    })) : d.reject();
    return d.promise()
  };
  a.loadPhoto = function(b) {
    var a = this,
      d = a.photo,
      e = a.$photoViewer.find(".photoViewer-photos"),
      f = e.find(".photoHolder > img"),
      g = $.Deferred();
    a.photoActivity.show("loadPhoto-" + d.id);
    a.applyPendingPhotoRotation().always(function() {
      d === a.photo ? (b || (e.height() ? f.attr({
        src: Thumbnails.generateURL(d.thumbnailID, THUMBNAIL_SIZE_PHOTOPREVIEW),
        width: Math.min(a.previewSize, d.width, e.height() * d.aspectRatio, a.previewSize * d.aspectRatio)
      }) : _(function() {
        d === a.photo && "resolved" !== g.state() && f.attr({
          src: Thumbnails.generateURL(d.thumbnailID,
            THUMBNAIL_SIZE_PHOTOPREVIEW),
          width: Math.min(a.previewSize, d.width, e.height() * d.aspectRatio, a.previewSize * d.aspectRatio)
        })
      }).defer()), g.follow(d.loadLarge(a.previewSize)).done(function(b) {
        d === a.photo && (f.attr("src", b), "Internet Explorer" === Platform.browser ? f.removeAttr("width") : setTimeout(function() {
          f.removeAttr("width")
        }, 2E3))
      }).fail(function() {
        d === a.photo && MessageBars.buildNew(PHOTOVIEWER_MESSAGE_LOAD_ERROR, {
          extraClasses: "alert",
          insertElement: a.$messageBars
        })
      })) : g.reject()
    });
    return g.promise().always(function() {
      a.photoActivity.hide("loadPhoto-" +
        d.id)
    })
  };
  a.showInfoPanel = function() {
    var b = $.Deferred();
    this.features.infoPanel && !this.infoPanelIsOpen ? (this.infoPanelIsOpen = !0, this.$photoViewer.addClass("infoPanel-open"), Cookie.setRemote("photoMeta", !0), this.isActive && this.getCurrentPhotoMeta(), b.resolve()) : b.reject();
    return b.promise()
  };
  a.hideInfoPanel = function() {
    var b = $.Deferred();
    this.features.infoPanel && this.infoPanelIsOpen ? (this.infoPanelIsOpen = !1, this.applyPendingPhotoRotation(), this.$photoViewer.removeClass("infoPanel-open"), this.$infoPanel.find(".photoViewer-miscMenu").bubble().close(),
      Cookie.setRemote("photoMeta", !1), b.follow(this.clearInfoPanel())) : b.reject();
    return b.promise()
  };
  a.clearInfoPanel = function() {
    var b = $.Deferred(),
      a = this.$infoPanel.find(".photo-info");
    a.length ? (a.removeClass("active"), a.find(".bubble").each(function() {
      $(this).bubble().destruct()
    }), _(function() {
      a.length && (a.scrollPane() instanceof ScrollPane && a.scrollPane().destruct(), a.empty().remove());
      b.resolve()
    }).delay(a.transitionDuration())) : b.resolve();
    return b.promise()
  };
  a.getCurrentPhotoMeta = function() {
    var b =
      this,
      a = $.Deferred();
    thPhoto = b.photo;
    b.isActive && b.features.infoPanel && b.infoPanelIsOpen && thPhoto ? b.clearInfoPanel().done(function() {
      b.infoSpinner.show();
      thPhoto.getDetails().done(function(d) {
        var e;
        thPhoto === b.photo ? (b.infoSpinner.hide().always(function() {
            e = $("#template-photo-info").mustache($.extend({
              pid: thPhoto.id,
              pluralSources: 1 !== d.sources.length,
              hasNearbyPhotos: b.features.nearbyPhotos && !! d.nearbyPhotos && d.nearbyPhotos.length,
              hasDevice: !! d.camera || !! d.lens,
              hasEXIF: !$.isEmptyObject(d.exif),
              hasTimestamp: !! thPhoto.timestamp,
              absoluteDate: thPhoto.timestamp ? thPhoto.timestamp.toString(PHOTOVIEWER_META_DATE_FORMAT) : PHOTO_UNDATED_TITLE,
              relativeDate: thPhoto.timestamp ? thPhoto.timestamp.toString("dddd, ") + thPhoto.timestamp.relativeToNow() : !1
            }, d)).appendTo(b.$infoPanel.find(".photoViewer-infoPanel-content"));
            b.features.nearbyPhotos && (d.nearbyPhotos && d.nearbyPhotos.length) && _(d.nearbyPhotos).chain().first(6).each(function(a) {
              var c = a.photo,
                d = $("<span/>", {
                  "class": "photo-info-nearby-thumbnail",
                  title: $.mustache(PHOTOVIEWER_NEARBY_DISTANCE_LABEL, {
                    units: 1E3 < a.distance ? "kilometers" : "meters",
                    distance: 1E3 < a.distance ? (a.distance / 1E3).toFixed(1) : Math.round(a.distance)
                  })
                }).appendTo(e.find(".photo-info-nearby-thumbnails")),
                k = Thumbnails.generateURL(c.thumbnailID, THUMBNAIL_SIZE_TINY);
              $("<img/>", {
                load: function() {
                  $(this).off("load");
                  d.css("backgroundImage", "url('" + k + "')")
                },
                src: k
              });
              d.on("click", function() {
                b.jumpToMoment(c, !0)
              })
            });
            e.scrollPane({
              isActive: !0
            });
            _(function() {
              e.addClass("active")
            }).defer();
            e.find(".photo-info-date-absolute").on("click", function() {
              b.jumpToMoment(thPhoto)
            });
            e.find(".photo-info-semantic-tag, .photo-info-semantic-info").each(function() {
              var b = $(this),
                a;
              a = b.find(".bubble").bubble({
                closeAfter: 0,
                clickToClose: !1,
                clickOutsideToClose: !1
              });
              b.on({
                mouseenter: function() {
                  a.open()
                },
                mouseleave: function() {
                  a.close()
                }
              })
            });
            b.$photoViewer.find(".photoViewer-miscMenu-hide, .photoViewer-infoPanel-hide").toggleClass("visible", !! thPhoto.visibility);
            b.$photoViewer.find(".photoViewer-miscMenu-unhide, .photoViewer-infoPanel-unhide").toggleClass("visible", !thPhoto.visibility)
          }),
          b.getPhotoFromSupplier(b.photo, 1).done(function(b) {
            b.getDetails()
          }), a.resolve()) : a.reject()
      }).fail(function() {
        b.infoSpinner.hide();
        a.reject();
        MessageBars.buildNew(PHOTOVIEWER_MESSAGE_DETAILS_ERROR, {
          extraClasses: "alert",
          insertElement: b.$messageBars
        })
      })
    }) : a.reject();
    return a.promise()
  };
  a.applyPendingPhotoRotation = function() {
    var b = [];
    if (this.features.rotate) {
      this.abortProcrastinatedTasks("applyRotation");
      if (this.pendingRotation) {
        for (; 0 < this.pendingRotation; this.pendingRotation--) b.push(this.photo.rotateClockwise());
        for (; 0 > this.pendingRotation; this.pendingRotation++) b.push(this.photo.rotateCounterClockwise())
      }
      return $.when.apply(this, b)
    }
    return $.rejected
  };
  a.clearRotation = function() {
    this.pendingRotation = 0;
    this.$photoViewer.find(".photoHolder > img").removeClass("rotation-1 rotation-2 rotation-3").css({
      "max-width": "100%",
      "max-height": "100%"
    })
  };
  a.showChrome = function() {
    this.$photoViewer.removeClass("hideChrome")
  };
  a.hideChrome = function() {
    this.$photoViewer.addClass("hideChrome");
    this.$photoViewer.find(".bubble").each(function() {
      $(this).bubble().close()
    })
  };
  a.startSlideshow = function() {
    function b() {
      a.nextPhoto ? a.getPhotoFromSupplier(a.nextPhoto, 0).done(function(d, e, f, g) {
        f ? a.slideshowTimeout = setTimeout(function() {
          a.pauseSlideshow(!0);
          a.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_THEEND, "end")
        }, PHOTOVIEWER_SLIDESHOW_WAIT) : (a.nextPhoto.loadLarge(a.previewSize), a.slideshowTimeout = setTimeout(function() {
            a.setPhoto(a.nextPhoto).done(b).fail(function() {
              a.pauseSlideshow();
              MessageBars.buildNew(PHOTOVIEWER_MESSAGE_SLIDESHOW_ERROR, {
                insertElement: a.$messageBars
              })
            })
          },
          PHOTOVIEWER_SLIDESHOW_WAIT))
      }).fail(function() {
        a.pauseSlideshow();
        MessageBars.buildNew(PHOTOVIEWER_MESSAGE_SLIDESHOW_ERROR, {
          insertElement: a.$messageBars
        })
      }) : (a.pauseSlideshow(), MessageBars.buildNew(PHOTOVIEWER_MESSAGE_SLIDESHOW_ERROR, {
        insertElement: a.$messageBars
      }))
    }
    var a = this;
    a.features.slideshow && "slideshow" !== a.mode && (a.mode = "slideshow", a.hideChrome(), a.hideInfoPanel(), a.queueTask("slideshowMode/activate", "startLoop", function() {
      a.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_SLIDESHOW, "slideshow");
      b()
    }), a.isActive && a.executeAllTasks("slideshowMode/activate"))
  };
  a.pauseSlideshow = function(b) {
    "slideshow" === this.mode && (this.mode = "browse", clearTimeout(this.slideshowTimeout), this.slideshowTimeout = null, this.dequeueAllTasks("slideshowMode/activate"), b || this.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_PAUSE, "pause"))
  };
  a.checkPreviewSize = function() {
    var b, a = _(THUMBNAIL_FULL_SIZES).keys(),
      d = Viewport.getWidth();
    (b = _(a).find(function(b) {
      return d <= b
    })) || (b = _(a).last());
    return b !== this.previewSize ? (this.previewSize =
      b, !0) : !1
  };
  a.enterSelectionMode = function() {
    "selection" !== this.mode && (this.mode = "selection", this.$photoViewer.addClass("selectionMode"), this.setFeatures({
      sharing: !1,
      slideshow: !1,
      infoPanel: !1,
      nearbyPhotos: !1,
      jumpToMoment: !1,
      hide: !1,
      miscMenu: !1,
      editTimestamp: !1,
      rotate: !1,
      download: !1,
      baleet: !1
    }))
  };
  a.exitSelectionMode = function() {
    "selection" === this.mode && (this.mode = "browse", this.$photoViewer.removeClass("selectionMode"), this.setFeatures($.extend({}, this.defaultFeatures, this.supplier ? this.supplier.photoViewerFeatures :
      void 0)))
  };
  a.rotatePhotoRight = function() {
    var b = this,
      a = $.Deferred(),
      d, e, f = !1;
    b.features.rotate ? (b.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_ROTATERIGHT, "rotateRight"), d = b.$photoViewer.find(".photoViewer-photos"), e = d.find(".photoHolder > img"), e.hasClass("rotation-1") ? e.removeClass("rotation-1").addClass("rotation-2") : e.hasClass("rotation-2") ? (e.removeClass("rotation-2").addClass("rotation-3"), f = !0) : e.hasClass("rotation-3") ? e.removeClass("rotation-3") : (e.addClass("rotation-1"), f = !0), f ? e.css({
      "max-width": d.height(),
      "max-height": d.width()
    }) : e.css({
      "max-width": "100%",
      "max-height": "100%"
    }), b.pendingRotation++, b.procrastinate("applyRotation", function() {
      b.applyPendingPhotoRotation()
    }, null, PHOTO_ROTATION_REQUEST_WAIT), a.resolve()) : a.reject();
    return a.promise()
  };
  a.rotatePhotoLeft = function() {
    var b = this,
      a = $.Deferred(),
      d, e, f = !1;
    b.features.rotate ? (b.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_ROTATELEFT, "rotateLeft"), d = b.$photoViewer.find(".photoViewer-photos"), e = d.find(".photoHolder > img"), e.hasClass("rotation-3") ?
      e.removeClass("rotation-3").addClass("rotation-2") : e.hasClass("rotation-2") ? (e.removeClass("rotation-2").addClass("rotation-1"), f = !0) : e.hasClass("rotation-1") ? e.removeClass("rotation-1") : (e.addClass("rotation-3"), f = !0), f ? e.css({
        "max-width": d.height(),
        "max-height": d.width()
      }) : e.css({
        "max-width": "100%",
        "max-height": "100%"
      }), b.pendingRotation--, b.procrastinate("applyRotation", function() {
        b.applyPendingPhotoRotation()
      }, null, PHOTO_ROTATION_REQUEST_WAIT), a.resolve()) : a.reject();
    return a.promise()
  };
  a.hidePhoto =
    function() {
      var b = $.Deferred();
      this.features.hide ? (this.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_HIDE, "hide"), b.follow(this.photo.hide())) : b.reject();
      return b.promise()
  };
  a.unhidePhoto = function() {
    var b = $.Deferred();
    this.features.hide ? (this.showActionAlert(PHOTOVIEWER_ACTIONALERT_LABEL_UNHIDE, "unhide"), b.follow(this.photo.unhide())) : b.reject();
    return b.promise()
  };
  a.downloadPhoto = function() {
    var b = this,
      a = $.Deferred();
    b.features.download ? b.applyPendingPhotoRotation().always(function() {
      b.photo.download();
      a.resolve()
    }) : a.reject();
    return a.promise()
  };
  a.deletePhoto = function() {
    var b = this,
      a = $.Deferred();
    b.features.baleet ? b.photo.baleet().done(function() {
      b.nextPhoto ? (b.popover.open(), b.goToNextPhoto(), MessageBars.buildNew(PHOTOVIEWER_MESSAGE_DELETE_SUCCESS, {
        insertElement: b.$messageBars
      })) : b.deactivate();
      a.resolve()
    }).fail(function(d) {
      b.popover.open();
      d && MessageBars.buildNew(PHOTOVIEWER_MESSAGE_DELETE_ERROR, {
        extraClasses: "alert",
        insertElement: b.$messageBars
      });
      a.reject()
    }) : a.reject();
    return a.promise()
  };
  a.editPhotoTimestamp = function() {
    var b = this,
      a = $.Deferred();
    b.features.editTimestamp ? b.photo.editTimestamp().always(function() {
      b.popover.open();
      a.resolve()
    }).done(function() {
      MessageBars.buildNew($.mustache(PHOTOVIEWER_MESSAGE_EDITTIMESTAMP_SUCCESS, {
        timestamp: b.photo.timestamp.toString(PHOTOVIEWER_META_DATE_FORMAT)
      }), {
        insertElement: b.$messageBars
      })
    }) : a.reject();
    return a.promise()
  };
  a.jumpToMoment = function(b, a) {
    var d = this,
      e = $.Deferred(),
      f = b || d.photo;
    d.features.jumpToMoment || a ? e.follow(Moments.jumpTo(f.id).done(function() {
      d.deactivate(!0)
    }).fail(function() {
      MessageBars.buildNew(MOMENT_JUMPTO_MESSAGE_ERROR, {
        extraClasses: "alert",
        insertElement: d.$messageBars
      })
    })) : e.reject();
    return e.promise()
  };
  a.sharePhotoTo = function(b, a) {
    var d = this,
      e = d.photo,
      f = d.supplier;
    d.isActive && d.features.sharing && a.done(function(b) {
      d.isActive ? d.popover.open() : d.activate(e, f);
      b && MessageBars.buildNew(b, {
        insertElement: d.$messageBars
      })
    }).fail(function(b, a) {
      a ? d.deactivate() : (d.isActive ? d.popover.open() : d.activate(e, f), b && MessageBars.buildNew(b, {
        extraClasses: "alert",
        insertElement: d.$messageBars
      }))
    })
  };
  a.handleKeys = function(b) {
    var a = !1;
    2 === b.length ? b[0].which === KEYCODES.r && b[1].which === KEYCODES.r && this.features.rotate ? (this.rotatePhotoRight(), a = !0) : b[0].which === KEYCODES.r && (b[1].which === KEYCODES.l && this.features.rotate) && (this.rotatePhotoLeft(), a = !0) : 1 === b.length && (b[0].which === KEYCODES.i && this.features.infoPanel ? (this.infoPanelIsOpen ? this.hideInfoPanel() : this.showInfoPanel(), a = !0) : b[0].which === KEYCODES.h && this.features.hide ? (this.photo.visibility ? this.hidePhoto() : this.unhidePhoto(), a = !0) : b[0].which === KEYCODES.k && this.features.navigation ?
      (this.goToNextPhoto(), a = !0) : b[0].which === KEYCODES.j && this.features.navigation ? (this.goToPrevPhoto(), a = !0) : b[0].which === KEYCODES.space && this.features.slideshow && ("slideshow" === this.mode ? this.pauseSlideshow() : this.startSlideshow(), a = !0));
    return a
  };
  a.showActionAlert = function(b, a) {
    this.isActive && this.$actionAlerts && this.$actionAlerts.showActionAlert(b, a)
  };
  a.subscribe("photoLoad", "Photo/loadLarge", function(b, c) {
    var d;
    a.isActive && b === a.photo && (d = a.$photoViewer.find(".photoViewer-photos .photoHolder > img"),
      d.attr("src") !== c && a.loadPhoto(!0))
  });
  a.subscribe("photoRotate", "Photo/set/orientation", function(b) {
    a.isActive && b === a.photo && a.photo.loadLarge(a.previewSize).done(function() {
      a.clearRotation()
    })
  });
  a.subscribe("photoSetTimestamp", "Photo/set/timestamp", function(b, c) {
    a.isActive && b === a.photo && (c ? (a.$infoPanel.find(".photo-info-date-absolute").html(c.toString(PHOTOVIEWER_META_DATE_FORMAT)), a.$infoPanel.find(".photo-info-date-relative").show().html(c.toString("dddd, ") + c.relativeToNow())) : (a.$infoPanel.find(".photo-info-date-absolute").html(PHOTO_UNDATED_TITLE),
      a.$infoPanel.find(".photo-info-date-relative").hide()))
  });
  a.subscribe("photoHide", "Photo/set/visibility", function(b, c) {
    a.isActive && b === a.photo && (a.$photoViewer.find(".photoViewer-miscMenu-hide, .photoViewer-infoPanel-hide").toggleClass("visible", !! c), a.$photoViewer.find(".photoViewer-miscMenu-unhide, .photoViewer-infoPanel-unhide").toggleClass("visible", !c))
  });
  a.subscribe("keyboard", "Keyboard/shortcut", function(b) {
    return a.isActive ? !a.handleKeys(b) : !0
  }, 1);
  Initializer.ready(function() {
    var b, c;
    a.$photoViewer =
      $("#photoViewer");
    a.setFeatures(a.defaultFeatures);
    a.popover = a.$photoViewer.on({
      "beforeClose.popover": function(b) {
        b.userTriggered && a.deactivate()
      }
    }).popover({
      closeButton: !1,
      autoCenter: !1,
      clickOutsideToClose: !1,
      pressEscToClose: !1
    });
    a.$messageBars = a.$photoViewer.find(".photoViewer-messageBars");
    a.$actionAlerts = a.$photoViewer.find(".photoViewer-actionAlerts");
    a.photoActivity = new ActivityIndicator("#photoViewer-activity", {
      showAfter: 500
    });
    a.$photoViewer.find(".photoViewer-topBars-left, .photoViewer-topBars-right").on("click",
      function(b) {
        b.stopPropagation()
      });
    a.$photoViewer.on("click", function() {
      "slideshow" === a.mode ? a.pauseSlideshow() : a.deactivate(!0)
    });
    a.$photoViewer.find(".photoViewer-close").on("click", function() {
      a.deactivate(!0)
    });
    a.$photoViewer.find(".photoViewer-next").on("click", function(b) {
      b.stopPropagation();
      a.navArrowTimeout && clearTimeout(a.navArrowTimeout);
      a.showChrome();
      a.goToNextPhoto()
    });
    a.$photoViewer.find(".photoViewer-prev").on("click", function(b) {
      b.stopPropagation();
      a.navArrowTimeout && clearTimeout(a.navArrowTimeout);
      a.showChrome();
      a.goToPrevPhoto()
    });
    a.$photoViewer.find(".photoViewer-photos").on("click", ".photoHolder > img", function(b) {
      b.stopPropagation();
      "slideshow" === a.mode ? a.pauseSlideshow() : a.goToNextPhoto()
    });
    a.$photoViewer.find(".photoViewer-jumpToMoment").on("click", function() {
      a.jumpToMoment()
    });
    a.buildElement("shareMenu").done(function(b) {
      var c = a.$photoViewer.find(".photoViewer-share");
      a.shareMenu = b.bubble({
        id: "shareMenu-photoViewer"
      });
      b.insertAfter(c);
      c.on({
        mousedown: function() {
          return !a.shareMenu.isOpen
        },
        click: function(b) {
          $(this).hasClass("disabled") || (a.shareMenu.isOpen ? a.shareMenu.close() : a.shareMenu.open());
          return !1
        }
      });
      b.find(".bubbleMenu-button").on("click", function() {
        Sharing.shareFromPhotoViewer($(this).data("service"))
      })
    });
    a.$photoViewer.find(".photoViewer-info").on("click", function() {
      a.showInfoPanel()
    });
    a.$photoViewer.find(".photoViewer-download").on("click", function() {
      a.downloadPhoto()
    });
    a.$photoViewer.find(".photoViewer-slideshow").on("click", function() {
      a.startSlideshow()
    });
    a.$infoPanel =
      a.$photoViewer.find(".photoViewer-infoPanel").on("click", function(b) {
        b.stopPropagation()
      });
    a.infoSpinner = a.$infoPanel.find(".spinner").spinner();
    a.$infoPanel.find(".photoViewer-infoPanel-close").on("click", function() {
      a.hideInfoPanel()
    });
    c = a.$photoViewer.find(".photoViewer-topBars .photoViewer-miscMenu").bubble({
      id: "photoViewer-topBarMiscMenu"
    });
    a.$photoViewer.find(".photoViewer-more").on({
      mousedown: function() {
        return !1
      },
      click: function() {
        c.isOpen ? c.close() : c.open();
        return !1
      }
    });
    b = a.$infoPanel.find(".photoViewer-miscMenu").bubble({
      id: "photoViewer-infoPanelMiscMenu"
    });
    a.$infoPanel.find(".photoViewer-infoPanel-more").on({
      mousedown: function() {
        return !1
      },
      click: function() {
        b.isOpen ? b.close() : b.open();
        return !1
      }
    });
    a.$photoViewer.find(".photoViewer-miscMenu-hide, .photoViewer-infoPanel-hide").on("click", function() {
      a.hidePhoto()
    });
    a.$photoViewer.find(".photoViewer-miscMenu-unhide, .photoViewer-infoPanel-unhide").on("click", function() {
      a.unhidePhoto()
    });
    a.$photoViewer.find(".photoViewer-miscMenu-rotateRight, .photoViewer-infoPanel-rotateRight").on("click", function() {
      a.rotatePhotoRight();
      return !1
    });
    a.$photoViewer.find(".photoViewer-miscMenu-rotateLeft, .photoViewer-infoPanel-rotateLeft").on("click", function() {
      a.rotatePhotoLeft();
      return !1
    });
    a.$photoViewer.find(".photoViewer-miscMenu-editTimestamp, .photoViewer-infoPanel-editTimestamp").on("click", function() {
      a.editPhotoTimestamp()
    });
    a.$photoViewer.find(".photoViewer-miscMenu-download, .photoViewer-infoPanel-download").on("click", function() {
      a.downloadPhoto()
    });
    a.$photoViewer.find(".photoViewer-miscMenu-delete, .photoViewer-infoPanel-delete").on("click",
      function() {
        a.deletePhoto()
      });
    User.ready(function() {
      !1 !== Cookie.getRemote("photoMeta") ? a.showInfoPanel() : a.infoPanelIsOpen = !1
    })
  });
  return a
}(),
  Views = function() {
    var a = {
      currentView: null,
      nextView: null,
      allViews: {},
      breadcrumbs: [],
      get: function(b) {
        return b ? this.allViews[b] : $.extend({}, this.allViews)
      },
      getActive: function() {
        return this.currentView
      },
      activate: function(b, a) {
        var d = this,
          e = $.Deferred();
        Initializer.ready(function() {
          function f() {
            d.currentView = b;
            b.skipBreadcrumbs || d.breadcrumbs.push(b);
            a.done(function() {
              var a =
                b.state ? b.id + "/" + b.state : b.id;
              State.get("view") !== a && State.push({
                view: a
              });
              d.setDocumentTitle()
            });
            e.resolve()
          }
          d.currentView ? b !== d.currentView ? (d.nextView = b, d.currentView.deactivate().always(function() {
            d.nextView = void 0;
            f()
          })) : e.reject() : f()
        });
        return e.promise()
      },
      deactivate: function(b, a) {
        var d = this,
          e = $.Deferred();
        d.currentView === b ? (d.currentView = void 0, d.nextView || (_(d.breadcrumbs).last() === b && d.breadcrumbs.splice(-1, 1), a.done(function() {
            d.activatePrevious().fail(function() {
              State.push({
                view: null
              })
            })
          })),
          e.resolve()) : e.reject();
        return e.promise()
      },
      setDocumentTitle: function(b) {
        b = b || this.currentView.makeString("title") || !1;
        document.title = $.mustache(PAGE_TITLE_TEMPLATE, {
          viewTitle: b ? _(b).unescape() : !1
        })
      },
      activatePrevious: function() {
        var b = $.Deferred(),
          a;
        !this.currentView && 0 < this.breadcrumbs.length ? (a = this.breadcrumbs.splice(-1, 1)[0], b.follow(a.activate(!0))) : this.currentView && 1 < this.breadcrumbs.length ? (a = this.breadcrumbs.splice(-2, 2)[0], b.follow(a.activate(!0))) : this.currentView && this.currentView.lobbyView ?
          b.follow(this.currentView.lobbyView.activate(!0)) : this.currentView && this.currentView.lobbyViewID && this.get(this.currentView.lobbyViewID) ? b.follow(this.get(this.currentView.lobbyViewID).activate(!0)) : b.reject();
        return b.promise()
      },
      activatePreviousLobby: function() {
        var b = $.Deferred(),
          a = $.merge([], this.breadcrumbs),
          d;
        if (1 < this.breadcrumbs.length) {
          do _(a).last().isLobbyView && (d = _(a).last()), a.pop(); while (!d && a.length)
        }
        d ? (this.breadcrumbs = a, b.follow(d.activate(!0))) : this.currentView && this.currentView.lobbyView ?
          b.follow(this.currentView.lobbyView.activate(!0)) : this.currentView && this.currentView.lobbyViewID && this.get(this.currentView.lobbyViewID) ? b.follow(this.get(this.currentView.lobbyViewID).activate(!0)) : b.reject();
        return b.promise()
      },
      needsLobbyButton: function() {
        return 1 < this.breadcrumbs.length ? this.breadcrumbs[this.breadcrumbs.length - 1].isLobbyView || this.breadcrumbs[this.breadcrumbs.length - 2].isLobbyView ? !1 : !0 : !1
      }
    };
    PubHub.sub("View/construct", function(b) {
      var c = (State.get("view") || "").split("/");
      a.allViews[b.id] =
        b;
      b.id === c[0] && (b.setState(c[1]), b.activate())
    });
    PubHub.sub("View/destruct", function(b) {
      delete a.allViews[b.id];
      a.breadcrumbs = _(a.breadcrumbs).filter(function(a) {
        return a !== b
      })
    });
    PubHub.sub("View/update", function(b) {
      var c = b.state ? b.id + "/" + b.state : b.id;
      b === a.currentView && State.get("view") !== c && State.push({
        view: c
      })
    });
    PubHub.sub("State/propose", function(b) {
      var c, d, e;
      b.view ? (c = b.view.split("/"), d = c[0], c = c[1], (e = a.allViews[d]) || (e = "sources" === d ? SourceYears.getCurrent() || SourceYears.emptyView : "highlights" ===
        d ? HighlightYears.getCurrent() || HighlightYears.emptyView : "moments" === d ? MomentYears.getCurrent() || MomentYears.emptyView : "sources-recent" === d ? SourceYears.getLatest() || SourceYears.emptyView : "highlights-recent" === d ? HighlightYears.getLatest() || HighlightYears.emptyView : "moments-recent" === d ? MomentYears.getLatest() || MomentYears.emptyView : "moment-" === d.substr(0, 7) ? !1 : "set-" === d.substr(0, 4) ? !1 : "photomail-" === d.substr(0, 10) ? !1 : "sentmail-" === d.substr(0, 9) ? !1 : "photopage-" === d.substr(0, 10) ? !1 : "year-" === d.substr(0,
          5) && Years.hasYear(d.substr(5)) ? a.currentView && (a.currentView instanceof HighlightYearView || a.currentView instanceof HighlightMonthView) ? HighlightYears.getView("highlights-" + d.substr(5)) : a.currentView && (a.currentView instanceof SourceYearView || a.currentView instanceof SourceMonthView) ? SourceYears.getView("sources-" + d.substr(5)) : MomentYears.getView("moments-" + d.substr(5)) : "month-all" === d ? a.currentView && (a.currentView instanceof HighlightYearView || a.currentView instanceof HighlightMonthView) ? HighlightYears.getView("highlights-" +
          Years.currentYear) : a.currentView && (a.currentView instanceof SourceYearView || a.currentView instanceof SourceMonthView) ? SourceYears.getView("sources-" + Years.currentYear) : MomentYears.getView("moments-" + Years.currentYear) : "month-" === d.substr(0, 6) ? a.currentView && (a.currentView instanceof HighlightYearView || a.currentView instanceof HighlightMonthView) ? HighlightMonths.getView("highlights-" + Years.currentYear + "-" + d.substr(6)) : a.currentView && (a.currentView instanceof SourceYearView || a.currentView instanceof SourceMonthView) ? SourceMonths.getView("sources-" + Years.currentYear + "-" + d.substr(6)) : MomentMonths.getView("moments-" + Years.currentYear + "-" + d.substr(6)) : a.currentView ? a.currentView : HomeView)) : e = HomeView;
      e && (e.hasState(c) ? b.view = e.id + "/" + c : b.view = e.state ? e.id + "/" + e.state : e.id)
    });
    PubHub.sub("State/set", function(b) {
      var c, d;
      b.view ? (c = b.view.split("/"), b = c[0], c = c[1], (d = a.allViews[b]) ? (d.setState(c), d.activate(!0)) : "moment-" === b.substr(0, 7) ? Moments.fetchOne(b.substr(7)).fail(function() {
          State.replace({
            view: "moments"
          })
        }) :
        "set-" === b.substr(0, 4) ? Sets.fetchOne(b.substr(4)).fail(function() {
          State.replace({
            view: "sets"
          })
        }) : "photomail-" === b.substr(0, 10) ? PhotoMails.fetchOne(b.substr(10)).fail(function() {
          State.replace({
            view: "photomails"
          })
        }) : "sentmail-" === b.substr(0, 9) ? SentMails.fetchOne(b.substr(9)).fail(function() {
          State.replace({
            view: "sentmails"
          })
        }) : "photopage-" === b.substr(0, 10) ? PhotoPages.fetchOne(b.substr(10)).fail(function() {
          State.replace({
            view: "photopages"
          })
        }) : (HomeView.setState(c), HomeView.activate())) : State.replace({
        view: "home"
      })
    });
    PubHub.sub("Keyboard/shortcut", function(b) {
      var a = !0;
      if (2 === b.length && (b[0].which === KEYCODES.v || b[0].which === KEYCODES.g)) switch (b[1].which) {
        case KEYCODES.h:
          HomeView.activate();
          a = !1;
          break;
        case KEYCODES.p:
        case KEYCODES.m:
          MomentYears.activateCurrent();
          a = !1;
          break;
        case KEYCODES.f:
          FlashbackView.activate();
          a = !1;
          break;
        case KEYCODES.t:
          FlashbackView.setState("today");
          FlashbackView.activate();
          a = !1;
          break;
        case KEYCODES.e:
        case KEYCODES.x:
          FlashbackView.setState("explore");
          FlashbackView.activate();
          a = !1;
          break;
        case KEYCODES.s:
          PhotoMailsView.activate();
          a = !1;
          break;
        case KEYCODES.i:
          HighlightYears.activateCurrent(), a = !1
      }
      return a
    });
    return a
  }(),
  Popovers = function() {
    var a = {
      currentPopover: null,
      nextPopover: null,
      allPopovers: {},
      get: function(b) {
        return b ? this.allPopovers[b] : $.extend({}, this.allPopovers)
      },
      getOpen: function() {
        return this.currentPopover
      },
      open: function(b, a) {
        var d = this,
          e = $.Deferred();
        Initializer.ready(function() {
          d.currentPopover ? b !== d.currentPopover ? (d.nextPopover = b, d.currentPopover.close().always(function() {
            d.nextPopover = void 0;
            d.currentPopover = b;
            e.resolve()
          })) : e.reject() : (d.currentPopover = b, e.resolve())
        });
        return e.promise()
      },
      close: function(b, a) {
        var d = this,
          e = $.Deferred();
        d.currentPopover === b ? (a.always(function() {
          d.currentPopover === b && (d.currentPopover = void 0)
        }), e.resolve()) : e.reject();
        return e.promise()
      }
    };
    PubHub.sub("Popover/construct", function(b) {
      a.allPopovers[b.id] = b
    });
    PubHub.sub("Popover/destruct", function(b) {
      delete a.allPopovers[b.id]
    });
    return a
  }(),
  Panels = function() {
    var a = {
      currentPanel: null,
      nextPanel: null,
      allPanels: {},
      get: function(b) {
        return b ?
          this.allPanels[b] : $.extend({}, this.allPanels)
      },
      getActive: function() {
        return this.currentPanel
      },
      activate: function(b, a) {
        var d = this,
          e = $.Deferred();
        Initializer.ready(function() {
          function f() {
            d.currentPanel = b;
            a.done(function() {
              var a = b.state ? b.id + "/" + b.state : b.id;
              State.get("panel") !== a && State.push({
                panel: a
              })
            });
            e.resolve()
          }
          d.currentPanel ? b !== d.currentPanel ? (d.nextPanel = b, d.currentPanel.deactivate().always(function() {
            d.nextPanel = void 0;
            f()
          })) : e.reject() : f()
        });
        return e.promise()
      },
      deactivate: function(b, c) {
        var d =
          $.Deferred();
        a.currentPanel === b ? (a.currentPanel = void 0, a.nextPanel || State.push({
          panel: null
        }), d.resolve()) : d.reject();
        return d.promise()
      }
    };
    PubHub.sub("Panel/construct", function(b) {
      var c = (State.get("panel") || "").split("/");
      a.allPanels[b.id] = b;
      b.id === c[0] && (b.setState(c[1]), b.activate())
    });
    PubHub.sub("Panel/destruct", function(b) {
      delete a.allPanels[b.id]
    });
    PubHub.sub("Panel/update", function(b) {
      var c = b.state ? b.id + "/" + b.state : b.id;
      b === a.currentPanel && State.get("panel") !== c && State.push({
        panel: c
      })
    });
    PubHub.sub("State/propose",
      function(b) {
        var c, d, e;
        b.panel && (c = b.panel.split("/"), d = c[0], c = c[1], e = a.allPanels[d], "close" === d ? delete b.panel : e ? e.hasState(c) || (b.panel = e.state ? e.id + "/" + e.state : e.id) : a.currentPanel ? a.currentPanel.hasState(c) ? b.panel = a.currentPanel.id + "/" + c : b.panel = a.currentPanel.state ? a.currentPanel.id + "/" + a.currentPanel.state : a.currentPanel.id : delete b.panel)
      });
    PubHub.sub("State/set", function(b) {
      var c;
      b.panel ? (c = b.panel.split("/"), b = c[0], c = c[1], (b = a.allPanels[b]) ? (b.setState(c), b.activate()) : a.currentPanel && a.currentPanel.deactivate(!0)) :
        a.currentPanel && a.currentPanel.deactivate(!0)
    });
    PubHub.sub("Keyboard/shortcut", function(b) {
      var a = !0;
      if (2 === b.length && b[0].which === KEYCODES.p) switch (b[1].which) {
        case KEYCODES.p:
          PreferencesPanel.activate();
          a = !1;
          break;
        case KEYCODES.c:
          ConnectionsPanel.activate();
          a = !1;
          break;
        case KEYCODES.a:
          ConnectionsPanel.setState("apps");
          ConnectionsPanel.activate();
          a = !1;
          break;
        case KEYCODES.o:
          PhotoPagesPanel.activate();
          a = !1;
          break;
        case KEYCODES.b:
          BonusPanel.activate();
          a = !1;
          break;
        case KEYCODES.k:
          KeyboardPanel.activate(),
          a = !1
      } else 1 === b.length && b[0].which === KEYCODES.n ? (NavPanel.isActive ? NavPanel.deactivate(!0) : (b[0].altKey ? NavPanel.setState("alt") : NavPanel.setState(null), NavPanel.activate()), a = !1) : 1 === b.length && (b[0].which === KEYCODES.slash && b[0].shiftKey) && (KeyboardPanel.activate(), a = !1);
      return a
    });
    return a
  }(),
  Previews = function() {
    function a(a) {
      return a ? b[a] : $.extend({}, b)
    }
    var b = {};
    PubHub.sub("Preview/destruct", function(c) {
      a(c.id) && delete b[c.id]
    });
    PubHub.sub("Preference/set", function(b, d) {
      "webp" === b && _(a()).invoke("build")
    });
    return {
      get: a,
      buildNew: function(c, d, e, f) {
        var g = a(c);
        if (!b[c]) {
          switch (e) {
            case "photo":
              g = new PhotoPreview(c, d, f);
              break;
            case "context":
              g = new ContextPreview(c, d, f);
              break;
            case "message":
              g = new MessagePreview(c, d, f);
              break;
            case "semanticPhoto":
              g = new SemanticPhotoPreview(c, d, f);
              break;
            case "singlePhoto":
              g = new SinglePhotoPreview(c, d, f);
              break;
            default:
              g = new Preview(c, d, f)
          }
          b[c] = g
        }
        return g
      }
    }
  }(),
  Photos = function() {
    var a = {};
    $.extend(!0, a, PhotoGroup.prototype);
    PhotoGroup.call(a);
    a.destruct = function() {
      return $.rejected
    };
    a.editTimestamps = function(b, a) {
      return API.request("photosEdit", {
        pids: JSON.stringify(_(b).pluck("id")),
        deltaTimestamp: a
      })
    };
    API.define("photoDetails", "GET", "photo_info", {
      includeAuthToken: !0
    });
    API.define("photoEdit", "POST", "photo_update");
    API.define("photosEdit", "POST", "photo_batch_update");
    API.define("photoDelete", "POST", "photo_delete");
    API.define("photoDumpID", "POST", "photo_dump");
    API.define("recentPhotos", "GET", "photo_list_recent", {
      includeAuthToken: !0
    });
    API.define("undatedPhotos", "GET", "photo_list_orphan", {
      includeAuthToken: !0
    });
    API.define("shufflePhotos", "GET", "photo_shuffle", {
      includeAuthToken: !0
    });
    API.define("semanticPhotos", "GET", "photo_semantic_tags", {
      includeAuthToken: !0
    });
    API.define("semanticFeedback", "POST", "photo_semantic_tags");
    API.define("interestingPhotos", "GET", "photo_interesting_set", {
      includeAuthToken: !0
    });
    API.define("nearbyPhotos", "GET", "photo_nearby", {
      includeAuthToken: !0
    });
    API.define("photosZipped", "POST", "photo_export");
    return a
  }(),
  Moments = function() {
    var a = {};
    $.extend(!0, a, RequestUtilities.prototype,
      ContextGroup.prototype);
    ContextGroup.call(a);
    $.extend(!0, a, {
      resources: {
        fetchMoment: {
          resource: "momentInfo",
          params: {
            limit: FETCH_LIMIT_PHOTOS
          }
        }
      },
      requests: {}
    });
    RequestUtilities.call(a);
    a.match = function(b) {
      return b instanceof Moment
    };
    a.add = function(b) {
      var a = this;
      return ContextGroup.prototype.add.call(a, b).done(function() {
        var d = new MomentView("moment-" + b.id, b);
        a.viewGroup.add(d);
        return d
      })
    };
    a.fetchOne = function(b, a) {
      var d = this,
        e = $.Deferred(),
        f = b ? d.get(b) : !1;
      f ? e.resolve(f) : b || a ? (f = d.makeParams("fetchMoment"),
        b ? f.eid = b : f.pid = a, d.requests.fetch = API.request(d.resources.fetchMoment.resource, f).always(function() {
          delete d.requests.fetch
        }).done(function(b) {
          var a = d.get(b.event.eid);
          a || (a = new Moment(b.event.eid, b.event, b, null, "fetch"), d.add(a));
          e.resolve(a)
        }).fail(function(b, a) {
          e.reject(b, a)
        })) : e.reject();
      return e.promise()
    };
    a.fetchRandom = function() {
      var b = this,
        a = $.Deferred(),
        d;
      d = b.makeParams("fetchMoment", {
        random: 1
      });
      b.requests.fetch = API.request(b.resources.fetchMoment.resource, d).always(function() {
        delete b.requests.fetch
      }).done(function(d) {
        a.resolve(b.get(d.event.eid) ||
          new Moment(d.event.eid, d.event, d, null, "fetch"))
      }).fail(function(b, d) {
        a.reject(b, d)
      });
      return a.promise()
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.getViewOf = function(b) {
      return this.viewGroup.getViewOf(b)
    };
    a.jumpTo = function(b) {
      var a = this;
      BlockingActivity.show("jumpToMoment", MOMENT_JUMPTO_MESSAGE_PENDING);
      return a.fetchOne(null, b).always(function() {
        BlockingActivity.hide("jumpToMoment")
      }).done(function(d) {
        a.getViewOf(d).activate(!1, b)
      }).promise()
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match =
      function(b) {
        return b instanceof MomentView
    };
    a.viewGroup.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return b.viewOf.timestamp ? b.viewOf.timestamp.getTime() : 0
      })
    };
    API.define("momentInfo", "GET", "event_info", {
      includeAuthToken: !0
    });
    API.define("momentEdit", "POST", "event_update");
    API.define("momentResetHidden", "POST", "event_uncurate");
    return a
  }(),
  Sets = function() {
    var a = {};
    $.extend(!0, a, RequestUtilities.prototype, ContextGroup.prototype);
    ContextGroup.call(a);
    $.extend(!0, a, {
      resources: {
        fetchSet: {
          resource: "setInfo",
          params: {
            limit: FETCH_LIMIT_PHOTOS
          }
        }
      },
      requests: {}
    });
    RequestUtilities.call(a);
    a.match = function(b) {
      return b instanceof Set
    };
    a.add = function(b) {
      var a = this;
      return ContextGroup.prototype.add.call(a, b).done(function() {
        var d = new SetView("set-" + b.id, b);
        a.viewGroup.add(d);
        return d
      })
    };
    a.fetchOne = function(b) {
      var a = this,
        d = $.Deferred(),
        e = a.get(b);
      e ? d.resolve(e) : b ? (b = a.makeParams("fetchSet", {
        aid: b
      }), a.requests.fetch = API.request(a.resources.fetchSet.resource, b).always(function() {
        delete a.requests.fetch
      }).done(function(b) {
        var e =
          a.get(b.album.aid);
        e || (e = new Set(b.album.aid, b.album, b, null, "fetch"), a.add(e));
        d.resolve(e)
      }).fail(function() {
        d.reject()
      })) : d.reject();
      return d.promise()
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof SetView
    };
    a.viewGroup.file = function(b) {
      var a = this;
      return _(a.items).sortedIndex(b, function(b) {
        return (b.viewOf.timestamp ? b.viewOf.timestamp.getTime() : 0) * ("asc" === a.sortOrder ? 1 : -1)
      })
    };
    API.define("setInfo", "GET", "album_info", {
      includeAuthToken: !0
    });
    API.define("setEdit", "POST", "album_update");
    return a
  }(),
  PhotoMails = function() {
    var a = {};
    $.extend(!0, a, Procrastination.prototype, RequestUtilities.prototype, Category.prototype);
    Category.call(a);
    $.extend(!0, a, {
      id: "photomails",
      resources: {
        fetchItems: {
          resource: "photoMails"
        },
        fetchPhotoMail: {
          resource: "photoMailInfo",
          params: {
            limit: FETCH_LIMIT_PHOTOS
          }
        }
      },
      strings: {
        title: PHOTOMAILS_TITLE,
        groupName: PHOTOMAILS_GROUPNAME,
        itemName: PHOTOMAILS_ITEMNAME,
        itemsName: PHOTOMAILS_ITEMSNAME
      },
      sortOrder: "desc",
      newCount: 0
    });
    Procrastination.call(a);
    RequestUtilities.call(a);
    a.match = function(b) {
      return b instanceof PhotoMail
    };
    a.add = function(b) {
      var a = this;
      return Category.prototype.add.call(a, b).done(function() {
        var d = new PhotoMailView("photomail-" + b.id, b);
        a.viewGroup.add(d);
        return d
      })
    };
    a.processFetchResponse = function(b) {
      var a = this;
      Category.prototype.processFetchResponse.call(a, b);
      b = _(b.mails).map(function(b) {
        return a.get(b.mid) || new PhotoMail(b.mid, b, null, null, "fetch")
      });
      b.length && a.checkNewCount();
      return b
    };
    a.destruct = function() {
      return $.rejected
    };
    a.processItemConstruct = ContextGroup.prototype.processItemConstruct;
    a.processItemDestruct = ContextGroup.prototype.processItemDestruct;
    a.fetchOne = function(b) {
      var a = this,
        d = $.Deferred(),
        e = a.get(b);
      e ? d.resolve(e) : b ? (b = a.makeParams("fetchPhotoMail", {
        mid: b
      }), a.requests.fetch = API.request(a.resources.fetchPhotoMail.resource, b).always(function() {
        delete a.requests.fetch
      }).done(function(b) {
        var e = a.get(b.inbox_mail.mid);
        e || (e = new PhotoMail(b.inbox_mail.mid, b.inbox_mail,
          b, null, "fetch"), a.add(e));
        d.resolve(e)
      }).fail(function() {
        d.reject()
      })) : d.reject();
      return d.promise()
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.checkNewCount = function() {
      var b = this;
      return b.procrastinate("checkNewCount", function() {
        return API.request("photoMailsNewCount", {}).done(function(a) {
          a.count !== b.newCount && (b.newCount = a.count, PubHub.pub("PhotoMails/set/newCount", b.newCount))
        })
      })
    };
    a.getNewCount = function() {
      return this.newCount
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof
      PhotoMailView
    };
    a.viewGroup.file = function(b) {
      var a = this;
      return _(a.items).sortedIndex(b, function(b) {
        return (b.viewOf.timestamp ? b.viewOf.timestamp.getTime() : 0) * ("asc" === a.sortOrder ? 1 : -1)
      })
    };
    Initializer.ready(function() {
      a.checkNewCount()
    });
    a.subscribe("photoMailRead", "Context/set/visibility", function(b) {
      a.hasItem(b) && (2 === b.visibility ? a.newCount++ : a.newCount--, PubHub.pub("PhotoMails/set/newCount", a.newCount))
    });
    a.subscribe("photoMailDestruct", "Item/destruct", function(b) {
      b instanceof PhotoMail && 2 === b.visibility &&
        (a.newCount--, PubHub.pub("PhotoMails/set/newCount", a.newCount))
    });
    API.define("photoMails", "GET", "inbox_list", {
      includeAuthToken: !0
    });
    API.define("photoMailsNewCount", "GET", "inbox_unread", {
      includeAuthToken: !0
    });
    API.define("photoMailInfo", "GET", "inbox_info", {
      includeAuthToken: !0,
      dataMap: function(b) {
        return _({
          includeKeyPhotos: 1
        }).extend(b)
      }
    });
    API.define("photoMailMark", "POST", "inbox_mark");
    API.define("photoMailDelete", "POST", "inbox_delete");
    return a
  }(),
  SentMails = function() {
    var a = {};
    $.extend(!0, a, Procrastination.prototype,
      RequestUtilities.prototype, Category.prototype);
    Category.call(a);
    $.extend(!0, a, {
      id: "sentmails",
      resources: {
        fetchItems: {
          resource: "sentMails"
        },
        fetchSentMail: {
          resource: "sentMailInfo",
          params: {
            limit: FETCH_LIMIT_PHOTOS
          }
        }
      },
      strings: {
        title: SENTMAILS_TITLE,
        groupName: SENTMAILS_GROUPNAME,
        itemName: SENTMAILS_ITEMNAME,
        itemsName: SENTMAILS_ITEMSNAME
      },
      sortOrder: "desc"
    });
    Procrastination.call(a);
    RequestUtilities.call(a);
    a.match = function(b) {
      return b instanceof SentMail
    };
    a.add = function(b) {
      var a = this;
      return Category.prototype.add.call(a,
        b).done(function() {
        var d = new SentMailView("sentmail-" + b.id, b);
        a.viewGroup.add(d);
        return d
      })
    };
    a.processFetchResponse = function(b) {
      var a = this;
      Category.prototype.processFetchResponse.call(a, b);
      return _(b.mails).map(function(b) {
        return a.get(b.mid) || new SentMail(b.mid, b, null, null, "fetch")
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.processItemConstruct = ContextGroup.prototype.processItemConstruct;
    a.processItemDestruct = ContextGroup.prototype.processItemDestruct;
    a.fetchOne = function(b) {
      var a = this,
        d = $.Deferred(),
        e = a.get(b);
      e ? d.resolve(e) : b ? (b = a.makeParams("fetchSentMail", {
        mid: b
      }), a.requests.fetch = API.request(a.resources.fetchSentMail.resource, b).always(function() {
        delete a.requests.fetch
      }).done(function(b) {
        var e = a.get(b.outbox_mail.mid);
        e || (e = new SentMail(b.outbox_mail.mid, b.outbox_mail, b, null, "fetch"), a.add(e));
        d.resolve(e)
      }).fail(function() {
        d.reject()
      })) : d.reject();
      return d.promise()
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof
      SentMailView
    };
    a.viewGroup.file = function(b) {
      var a = this;
      return _(a.items).sortedIndex(b, function(b) {
        return (b.viewOf.timestamp ? b.viewOf.timestamp.getTime() : 0) * ("asc" === a.sortOrder ? 1 : -1)
      })
    };
    API.define("sentMails", "GET", "outbox_list", {
      includeAuthToken: !0
    });
    API.define("sentMailInfo", "GET", "outbox_info", {
      includeAuthToken: !0
    });
    return a
  }(),
  PhotoPages = function() {
    var a = {};
    $.extend(!0, a, Procrastination.prototype, RequestUtilities.prototype, Category.prototype);
    Category.call(a);
    $.extend(!0, a, {
      id: "photopages",
      resources: {
        fetchItems: {
          resource: "photoPages",
          params: {
            limit: FETCH_LIMIT_PHOTOPAGES
          }
        },
        fetchPhotoPage: {
          resource: "photoPageInfo",
          params: {
            limit: FETCH_LIMIT_PHOTOS
          }
        }
      },
      strings: {
        title: PHOTOPAGES_TITLE,
        groupName: PHOTOPAGES_GROUPNAME,
        itemName: PHOTOPAGES_ITEMNAME,
        itemsName: PHOTOPAGES_ITEMSNAME
      },
      sortOrder: "desc"
    });
    Procrastination.call(a);
    RequestUtilities.call(a);
    a.match = function(b) {
      return b instanceof PhotoPage
    };
    a.add = function(b) {
      var a = this;
      return Category.prototype.add.call(a, b).done(function() {
        var d = new PhotoPageView("photopage-" + b.id, b);
        a.viewGroup.add(d);
        return d
      })
    };
    a.processFetchResponse = function(b) {
      var a = this;
      Category.prototype.processFetchResponse.call(a, b);
      return _(b.snapshots).map(function(b) {
        return a.get(b.sid) || new PhotoPage(b.sid, b, null, null, "fetch")
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.fetchOne = function(b) {
      var a = this,
        d = $.Deferred(),
        e = a.get(b);
      e ? d.resolve(e) : b ? (b = a.makeParams("fetchPhotoPage", {
        sid: b
      }), a.requests.fetch = API.request(a.resources.fetchPhotoPage.resource, b).always(function() {
        delete a.requests.fetch
      }).done(function(b) {
        var e =
          a.get(b.sid);
        e || (e = new PhotoPage(b.info.sid, b.info, b, null, "fetch"), a.add(e));
        d.resolve(e)
      }).fail(function() {
        d.reject()
      })) : d.reject();
      return d.promise()
    };
    a.getView = function(b) {
      b && "photopage-" !== b.substr(0, 10) && (b = "photopage-" + b);
      return this.viewGroup.get(b)
    };
    a.selectPhotoPage = function() {
      var b = this,
        a = $.Deferred(),
        d, e, f, g;
      d = $("#template-share-photopage-select").mustache({}).appendTo("body").on({
        "beforeClose.popover": function(b) {
          b.userTriggered && a.reject()
        },
        "afterClose.popover": function() {
          d.popover().destruct()
        }
      });
      d.on("click", ".photoPage-listItem", function() {
        a.resolve(b.get($(this).attr("data-id")));
        d.popover().close()
      });
      d.popover({
        isOpen: !0,
        fixedTop: 0.1
      });
      e = d.find(".photoPages");
      f = e.find(".photoPages-list");
      f.scrollPane().activate();
      e.hasClass("populated") || (g = e.find(".spinner").spinner({
        showing: !0,
        showAfter: 0
      }));
      b.fetchAll().done(function() {
        function a() {
          var b = _(c).size();
          e.find(".photoPages-count").html($.mustache(PHOTOPAGELIST_COUNT, {
            count: b,
            isPlural: 1 !== b
          }))
        }
        var c = b.items,
          d = $("#template-photoPage-listItem");
        g && (e.addClass("populated"), g.hide());
        _(c).isEmpty() ? e.addClass("empty") : (e.removeClass("empty"), _(c).each(function(b) {
          d.mustache($.extend({
            id: b.id,
            title: b.makeString("title"),
            linkToPage: !1,
            url: b.url,
            photoCount: b.photoCount,
            isPlural: 1 !== b.photoCount,
            date: b.timestamp.toString(PHOTOPAGELIST_DATE_FORMAT),
            formattedDate: 1 < b.timestamp.diffMonths($.now()) ? b.timestamp.toString(PHOTOPAGELIST_DATE_FORMAT) : b.timestamp.relativeToNow(),
            thumbnailSrc: b.keyPhotos.countItems() ? Thumbnails.generateURL(b.keyPhotos.items[0].thumbnailID,
              THUMBNAIL_SIZE_TINY) : "",
            controls: {
              add: !0
            }
          })).appendTo(f.scrollPane().$pane)
        }), f.scrollPane().update(), a())
      }).fail(function() {
        g && g.hide();
        MessageBars.buildNew(PHOTOPAGELIST_MESSAGE_LIST_ERROR, {
          extraClasses: "alert",
          insertFunction: "appendTo",
          insertElement: d
        })
      });
      return a.promise()
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof PhotoPageView
    };
    a.viewGroup.file = function(b) {
      var a = this;
      return _(a.items).sortedIndex(b, function(b) {
        return (b.viewOf.timestamp ? b.viewOf.timestamp.getTime() :
          0) * ("asc" === a.sortOrder ? 1 : -1)
      })
    };
    API.define("photoPages", "GET", "snapshot_list", {
      includeAuthToken: !0
    });
    API.define("photoPageInfo", "GET", "snapshot_info", {
      includeAuthToken: !0
    });
    API.define("photoPageEdit", "POST", "snapshot_update");
    API.define("photoPageDelete", "POST", "snapshot_delete");
    return a
  }(),
  MomentYears = function() {
    var a = {};
    $.extend(!0, a, CategoryGroup.prototype);
    CategoryGroup.call(a);
    a.match = function(b) {
      return b instanceof MomentYear
    };
    a.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return b.year
      })
    };
    a.add = function(b) {
      var a = this;
      return CategoryGroup.prototype.add.call(a, b).done(function() {
        var d = new MomentYearView("moments-" + b.year, b);
        a.viewGroup.add(d).done(function() {
          a.refreshViewAdjacency()
        });
        return d
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.getLatest = function() {
      var b = this.viewGroup.countItems();
      return b ? this.viewGroup.items[b - 1] : !1
    };
    a.getCurrent = function() {
      return this.getView("moments-" + Years.currentYear) || !1
    };
    a.refreshViewAdjacency =
      function() {
        var b = this;
        _(b.viewGroup.items).each(function(a, d) {
          a.setPrevView(b.viewGroup.items[d - 1] || null);
          a.setNextView(b.viewGroup.items[d + 1] || null)
        })
    };
    a.activateLatest = function() {
      var b = $.Deferred();
      this.viewGroup.countItems() ? b.follow(this.viewGroup.items[this.viewGroup.countItems() - 1].activate()) : b.reject(!0);
      return b.promise()
    };
    a.activateEmpty = function() {
      return this.emptyView ? this.emptyView.activate() : $.rejected
    };
    a.activateNearest = function(b) {
      var a = this.viewGroup.items;
      b.viewOf.year ? (b = _(a).indexOf(this.getView("moments-" +
        b.viewOf.year)), a = b < a.length - 1 ? a[b + 1] : 1 < a.length ? a[b - 1] : emptyView) : a = emptyView;
      return a.activate()
    };
    a.activateCurrent = function() {
      var b = this.getCurrent();
      return b ? b.activate() : $.rejected
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof MomentYearView
    };
    a.viewGroup.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return b.viewOf.year
      })
    };
    a.viewGroup.add = function(b) {
      return ViewGroup.prototype.add.call(this, b).done(function() {
        MomentYears.emptyView.isActive && b.activate()
      })
    };
    a.emptyView = new View("moments-empty", {
      viewClass: "moments",
      features: {
        sharing: !1
      },
      templates: {
        emptyMessage: {
          selector: function() {
            return "#template-moments-emptyMessage-" + ("free" === Subscription.getInfo("plan") ? "free" : "subscriber")
          }
        }
      },
      navDrawerTags: {
        viewType: "photos",
        filterType: "all"
      },
      strings: {
        title: MOMENTYEAR_TITLE_NAVBAR,
        navBarTitle: MOMENTYEAR_TITLE_NAVBAR
      },
      isEmpty: !0
    });
    a.emptyView.build = function() {
      var b = this;
      return View.prototype.build.call(b).done(function(a) {
        a && (a.addClass("empty"), b.buildElement("emptyMessage").done(function(a) {
          b.$view.append(a)
        }))
      })
    };
    API.define("moments", "GET", "event_list", {
      includeAuthToken: !0
    });
    return a
  }(),
  MomentMonths = function() {
    var a = {};
    $.extend(!0, a, CategoryGroup.prototype, Subscriptions.prototype);
    CategoryGroup.call(a);
    Subscriptions.call(a);
    a.match = function(b) {
      return b instanceof MomentMonth
    };
    a.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return XDate.UTC(b.year, b.month)
      })
    };
    a.add = function(b) {
      var a = this;
      return CategoryGroup.prototype.add.call(a, b).done(function() {
        var d = new MomentMonthView("moments-" + b.id,
          b);
        a.viewGroup.add(d).done(function() {
          a.refreshViewAdjacency()
        });
        return d
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.refreshViewAdjacency = function() {
      var b = this;
      _(b.viewGroup.items).each(function(a, d) {
        a.setPrevView(b.viewGroup.items[d - 1] || null);
        a.setNextView(b.viewGroup.items[d + 1] || null)
      })
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof MomentMonthView
    };
    a.viewGroup.file = function(b) {
      return _(this.items).sortedIndex(b,
        function(b) {
          return XDate.UTC(b.viewOf.year, b.viewOf.month)
        })
    };
    a.subscribe("addYear", "Group/add", function(b, c) {
      var d = 12;
      b === MomentYears && (c.year === XDate.today().getFullYear() && (d = XDate.today().getMonth() + 1), _.times(d, function(b) {
        a.add(new MomentMonth(c.year, b, [], null))
      }))
    });
    a.subscribe("removeYear", "Group/remove", function(b, c) {
      var d = 12;
      b === MomentYears && (c.year === XDate.today().getFullYear() && (d = XDate.today().getMonth() + 1), _.times(d, function(b) {
        a.remove(a.get(c.year + "-" + padStringToLength(b + 1, 2, "0", !0)))
      }))
    });
    return a
  }(),
  SourceYears = function() {
    var a = {};
    $.extend(!0, a, CategoryGroup.prototype);
    CategoryGroup.call(a);
    $.extend(!0, a, {
      filterState: "all"
    });
    a.match = function(b) {
      return b instanceof SourceYear
    };
    a.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return b.year
      })
    };
    a.add = function(b) {
      var a = this;
      return CategoryGroup.prototype.add.call(a, b).done(function() {
        var d = new SourceYearView("sources-" + b.year, b);
        a.viewGroup.add(d).done(function() {
          a.refreshViewAdjacency()
        });
        return d
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.getLatest = function() {
      var b = this.viewGroup.countItems();
      return b ? this.viewGroup.items[b - 1] : !1
    };
    a.getCurrent = function() {
      return this.getView("sources-" + Years.currentYear) || !1
    };
    a.refreshViewAdjacency = function() {
      var b = this;
      _(b.viewGroup.items).each(function(a, d) {
        a.setPrevView(b.viewGroup.items[d - 1] || null);
        a.setNextView(b.viewGroup.items[d + 1] || null)
      })
    };
    a.activateLatest = function() {
      var b = $.Deferred();
      this.viewGroup.countItems() ? b.follow(this.viewGroup.items[this.viewGroup.countItems() -
        1].activate()) : b.reject(!0);
      return b.promise()
    };
    a.activateEmpty = function() {
      return this.emptyView ? this.emptyView.activate() : $.rejected
    };
    a.activateNearest = function(b) {
      var a = this.viewGroup.items;
      b.viewOf.year ? (b = _(a).indexOf(this.getView("sources-" + b.viewOf.year)), a = b < a.length - 1 ? a[b + 1] : 1 < a.length ? a[b - 1] : emptyView) : a = emptyView;
      return a.activate()
    };
    a.activateCurrent = function() {
      var b = this.getCurrent();
      return b ? b.activate() : $.rejected
    };
    a.filterTo = function(b) {
      b = b || "all";
      b === this.filterState || "all" !== b && !Sources.getSetSources()[b] ||
        (this.filterState = b, PubHub.pub("SourceYears/filterTo", this.filterState))
    };
    a.getFilterState = function() {
      return this.filterState
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof SourceYearView
    };
    a.viewGroup.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return b.viewOf.year
      })
    };
    a.viewGroup.add = function(b) {
      return ViewGroup.prototype.add.call(this, b).done(function() {
        SourceYears.emptyView.isActive && b.activate()
      })
    };
    a.emptyView = new View("sources-empty", {
      viewClass: "sources",
      features: {
        sharing: !1
      },
      templates: {
        emptyMessage: {
          selector: function() {
            return "#template-sources-emptyMessage-" + ("free" === Subscription.getInfo("plan") ? "free" : "subscriber")
          }
        }
      },
      navDrawerTags: {
        viewType: "photos",
        filterType: "sources"
      },
      strings: {
        title: SOURCEYEAR_TITLE_NAVBAR,
        navBarTitle: SOURCEYEAR_EMPTY_TITLE_NAVBAR
      },
      isEmpty: !0
    });
    a.emptyView.build = function() {
      var b = this;
      return View.prototype.build.call(b).done(function(a) {
        a && (a.addClass("empty"), b.buildElement("emptyMessage").done(function(a) {
          b.$view.append(a)
        }))
      })
    };
    a.emptyView.setState = function(b) {
      SourceYears.filterTo(b)
    };
    API.define("sets", "GET", "album_list", {
      includeAuthToken: !0
    });
    return a
  }(),
  SourceMonths = function() {
    var a = {};
    $.extend(!0, a, CategoryGroup.prototype, Subscriptions.prototype);
    CategoryGroup.call(a);
    Subscriptions.call(a);
    a.match = function(b) {
      return b instanceof SourceMonth
    };
    a.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return XDate.UTC(b.year, b.month)
      })
    };
    a.add = function(b) {
      var a = this;
      return CategoryGroup.prototype.add.call(a, b).done(function() {
        var d =
          new SourceMonthView("sources-" + b.id, b);
        a.viewGroup.add(d).done(function() {
          a.refreshViewAdjacency()
        });
        return d
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.refreshViewAdjacency = function() {
      var b = this;
      _(b.viewGroup.items).each(function(a, d) {
        a.setPrevView(b.viewGroup.items[d - 1] || null);
        a.setNextView(b.viewGroup.items[d + 1] || null)
      })
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof SourceMonthView
    };
    a.viewGroup.file = function(b) {
      return _(this.items).sortedIndex(b,
        function(b) {
          return XDate.UTC(b.viewOf.year, b.viewOf.month)
        })
    };
    a.subscribe("addYear", "Group/add", function(b, c) {
      var d = 12;
      b === SourceYears && (c.year === XDate.today().getFullYear() && (d = XDate.today().getMonth() + 1), _.times(d, function(b) {
        a.add(new SourceMonth(c.year, b, [], null))
      }))
    });
    a.subscribe("removeYear", "Group/remove", function(b, c) {
      var d = 12;
      b === SourceYears && (c.year === XDate.today().getFullYear() && (d = XDate.today().getMonth() + 1), _.times(d, function(b) {
        a.remove(a.get(c.year + "-" + padStringToLength(b + 1, 2, "0", !0)))
      }))
    });
    return a
  }(),
  HighlightYears = function() {
    var a = {};
    $.extend(!0, a, ContextGroup.prototype);
    ContextGroup.call(a);
    a.match = function(b) {
      return b instanceof HighlightYear
    };
    a.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return b.year
      })
    };
    a.add = function(b) {
      var a = this;
      return ContextGroup.prototype.add.call(a, b).done(function() {
        var d = new HighlightYearView("highlights-" + b.year, b);
        a.viewGroup.add(d).done(function() {
          a.refreshViewAdjacency()
        });
        return d
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.getView =
      function(b) {
        return this.viewGroup.get(b)
    };
    a.getLatest = function() {
      var b = this.viewGroup.countItems();
      return b ? this.viewGroup.items[b - 1] : !1
    };
    a.getCurrent = function() {
      return this.getView("highlights-" + Years.currentYear) || !1
    };
    a.refreshViewAdjacency = function() {
      var b = this;
      _(b.viewGroup.items).each(function(a, d) {
        a.setPrevView(b.viewGroup.items[d - 1] || null);
        a.setNextView(b.viewGroup.items[d + 1] || null)
      })
    };
    a.activateLatest = function() {
      var b = $.Deferred();
      this.viewGroup.countItems() ? b.follow(this.viewGroup.items[this.viewGroup.countItems() -
        1].activate()) : b.reject(!0);
      return b.promise()
    };
    a.activateEmpty = function() {
      return this.emptyView ? this.emptyView.activate() : $.rejected
    };
    a.activateNearest = function(b) {
      var a = this.viewGroup.items;
      b.viewOf.year ? (b = _(a).indexOf(this.getView("moments-" + b.viewOf.year)), a = b < a.length - 1 ? a[b + 1] : 1 < a.length ? a[b - 1] : emptyView) : a = emptyView;
      return a.activate()
    };
    a.activateCurrent = function() {
      var b = this.getCurrent();
      return b ? b.activate() : $.rejected
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof
      HighlightYearView
    };
    a.viewGroup.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return b.viewOf.year
      })
    };
    a.viewGroup.add = function(b) {
      return ViewGroup.prototype.add.call(this, b).done(function() {
        HighlightYears.emptyView.isActive && b.activate()
      })
    };
    a.emptyView = new View("highlights-empty", {
      viewClass: "highlights",
      features: {
        sharing: !1
      },
      templates: {
        emptyMessage: {
          selector: function() {
            return "#template-highlights-emptyMessage-" + ("free" === Subscription.getInfo("plan") ? "free" : "subscriber")
          }
        }
      },
      navDrawerTags: {
        viewType: "photos",
        filterType: "highlights"
      },
      strings: {
        title: HIGHLIGHTYEAR_TITLE_NAVBAR,
        navBarTitle: HIGHLIGHTYEAR_TITLE_NAVBAR
      },
      isEmpty: !0
    });
    a.emptyView.build = function() {
      var b = this;
      return View.prototype.build.call(b).done(function(a) {
        a && (a.addClass("empty"), b.buildElement("emptyMessage").done(function(a) {
          b.$view.append(a)
        }))
      })
    };
    API.define("highlights", "GET", "highlight_photos", {
      includeAuthToken: !0
    });
    return a
  }(),
  HighlightMonths = function() {
    var a = {};
    $.extend(!0, a, ContextGroup.prototype);
    ContextGroup.call(a);
    a.match = function(b) {
      return b instanceof
      HighlightMonth
    };
    a.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return XDate.UTC(b.year, b.month)
      })
    };
    a.add = function(b) {
      var a = this;
      return ContextGroup.prototype.add.call(a, b).done(function() {
        var d = new HighlightMonthView("highlights-" + b.id, b);
        a.viewGroup.add(d).done(function() {
          a.refreshViewAdjacency()
        });
        return d
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.getView = function(b) {
      return this.viewGroup.get(b)
    };
    a.refreshViewAdjacency = function() {
      var b = this;
      _(b.viewGroup.items).each(function(a,
        d) {
        a.setPrevView(b.viewGroup.items[d - 1] || null);
        a.setNextView(b.viewGroup.items[d + 1] || null)
      })
    };
    a.viewGroup = new ViewGroup;
    a.viewGroup.match = function(b) {
      return b instanceof HighlightMonthView
    };
    a.viewGroup.file = function(b) {
      return _(this.items).sortedIndex(b, function(b) {
        return XDate.UTC(b.viewOf.year, b.viewOf.month)
      })
    };
    a.subscribe("addYear", "Group/add", function(b, c) {
      var d = 12;
      b === HighlightYears && (c.year === XDate.today().getFullYear() && (d = XDate.today().getMonth() + 1), _.times(d, function(b) {
        a.add(new HighlightMonth(c.year,
          b, [], null))
      }))
    });
    a.subscribe("removeYear", "Group/remove", function(b, c) {
      var d = 12;
      b === HighlightYears && (c.year === XDate.today().getFullYear() && (d = XDate.today().getMonth() + 1), _.times(d, function(b) {
        a.remove(a.get(c.year + "-" + padStringToLength(b + 1, 2, "0", !0)))
      }))
    });
    return a
  }(),
  Years = function() {
    var a = {};
    $.extend(!0, a, Subscriptions.prototype);
    $.extend(!0, a, {
      initDfd: $.Deferred(),
      years: [],
      currentYear: null
    });
    Subscriptions.call(a);
    a.addYear = function(b) {
      var c = [];
      return (b = _(b).isNumber() ? b : parseInt(b, 10)) && !_(a.years).contains(b) ?
        (a.years.push(b), a.years.sort(function(b, a) {
        return b - a
      }), c.push(MomentYears.add(new MomentYear(b, [], null))), c.push(SourceYears.add(new SourceYear(b, [], null))), c.push(HighlightYears.add(new HighlightYear(b, [], null))), PubHub.pub("Years/add", b), $.when.apply(a, c)) : $.rejected
    };
    a.removeYear = function(b) {
      var c = [];
      return (b = _(b).isNumber() ? b : parseInt(b, 10)) && _(a.years).contains(b) ? (a.years.splice(_(a.years).indexOf(b), 1), a.currentYear === b && (a.currentYear = null), c.push(MomentYears.remove(MomentYears.get(b))),
        c.push(SourceYears.remove(SourceYears.get(b))), c.push(HighlightYears.remove(HighlightYears.get(b))), PubHub.pub("Years/remove", b), $.when.apply(a, c)) : $.rejected
    };
    a.init = function() {
      var b = this;
      b.initDfd.follow(API.request("years", null).done(function(a) {
        a = _.union(a.eventYears, a.albumYears, a.highlightYears);
        b.setYear(_(a).last());
        _(a).each(b.addYear)
      }));
      return b.initDfd.promise()
    };
    a.ready = function(b) {
      b && b.promise ? b.follow(this.initDfd) : _(b).isFunction() && this.initDfd.done(b);
      return $.Deferred().follow(this.initDfd).promise()
    };
    a.isReady = function() {
      return "resolved" === this.initDfd.state()
    };
    a.list = function() {
      return $.merge([], this.years)
    };
    a.hasYear = function(b) {
      b = _(b).isNumber(b) ? b : parseInt(b, 10);
      return _(this.years).contains(b)
    };
    a.setYear = function(b) {
      this.currentYear !== b && (this.currentYear = b, PubHub.pub("Years/set", b))
    };
    a.subscribe("processItemConstruction", "Item/construct", function(b) {
      (b.year && b instanceof Moment || b instanceof Set) && a.addYear(b.year)
    });
    a.subscribe("processItemDestruction", "Item/destruct", function(b) {
      (b = b.year) &&
        (MomentYears.get(b) && MomentYears.get(b).items.length && SourceYears.get(b) && SourceYears.get(b).items.length && HighlightYears.get(b) && HighlightYears.get(b).items.length) && a.removeYear(b)
    });
    a.subscribe("viewActivate", "View/activate", function(b) {
      b.viewOf && b.viewOf.year && a.setYear(b.viewOf.year)
    });
    API.define("years", "GET", "user_years", {
      includeAuthToken: !0
    });
    return a
  }(),
  Orphans = function() {
    var a = {};
    $.extend(!0, a, PhotoFetcher.prototype);
    PhotoFetcher.call(a);
    $.extend(!0, a, {
      resources: {
        fetchItems: {
          resource: "postSourcePhotos",
          params: {
            limit: FETCH_LIMIT_PHOTOS_AGGREGATE,
            sourceType: function() {
              return Sources.getFilterSourceType(SourceYears.filterState) || void 0
            }
          }
        }
      },
      photoCount: 0
    });
    a.add = function(b) {
      var a = this;
      return PhotoFetcher.prototype.add.call(a, b).done(function() {
        a.photoCount = a.countItems()
      })
    };
    a.remove = function(b) {
      var a = this;
      return PhotoFetcher.prototype.remove.call(a, b).done(function() {
        a.photoCount = a.countItems()
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    API.define("postSourcePhotos", "GET", "source_removed_photos", {
      includeAuthToken: !0
    });
    return a
  }(),
  LatestPhotos = function() {
    var a = {};
    $.extend(!0, a, Context.prototype, {
      processItemConstruct: Group.prototype.processItemConstruct,
      processItemDestruct: Group.prototype.processItemDestruct
    });
    Context.call(a);
    $.extend(!0, a, {
      resources: {
        fetchItems: {
          resource: "recentPhotos",
          params: {
            limit: FETCH_LIMIT_PHOTOS_AGGREGATE,
            mode: "timestamp"
          }
        }
      },
      photoCount: 0,
      sortOrder: "desc"
    });
    a.add = function(b) {
      var a = this;
      return Context.prototype.add.call(a, b).done(function() {
        a.photoCount = a.countItems()
      })
    };
    a.remove = function(b) {
      var a =
        this;
      return Context.prototype.remove.call(a, b).done(function() {
        a.photoCount = a.countItems()
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    return a
  }(),
  LatestMoments = function() {
    var a = {};
    $.extend(!0, a, ContextFetcher.prototype, {
      processItemConstruct: Group.prototype.processItemConstruct,
      processItemDestruct: Group.prototype.processItemDestruct
    });
    ContextFetcher.call(a);
    $.extend(!0, a, {
      resources: {
        fetchItems: {
          resource: "moments",
          params: {
            limit: FETCH_LIMIT_LATESTMOMENTS
          }
        }
      },
      sortOrder: "desc"
    });
    a.match = function(b) {
      return b instanceof
      Moment
    };
    a.destruct = function() {
      return $.rejected
    };
    a.processFetchResponse = function(b) {
      ContextFetcher.prototype.processFetchResponse.call(this, b);
      return _(b.events).map(function(b) {
        return Moments.get(b.eid) || new Moment(b.eid, b, null, null, "fetch")
      })
    };
    return a
  }(),
  RecentlyModifiedPhotos = function() {
    var a = {};
    $.extend(!0, a, PhotoFetcher.prototype);
    PhotoFetcher.call(a);
    $.extend(!0, a, {
      resources: {
        fetchItems: {
          resource: "recentPhotos",
          params: {
            limit: FETCH_LIMIT_PHOTOS_AGGREGATE,
            mode: "modifiedTime"
          }
        }
      },
      photoCount: 0,
      sortOrder: "desc"
    });
    a.add = function(b) {
      var a = this;
      return PhotoFetcher.prototype.add.call(a, b).done(function() {
        a.photoCount = a.countItems()
      })
    };
    a.remove = function(b) {
      var a = this;
      return PhotoFetcher.prototype.add.call(a, b).done(function() {
        a.photoCount = a.countItems()
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.file = function(b) {
      return this.items.length
    };
    return a
  }(),
  UndatedPhotos = function() {
    var a = {};
    $.extend(!0, a, PhotoFetcher.prototype);
    PhotoFetcher.call(a);
    $.extend(!0, a, {
      resources: {
        fetchItems: {
          resource: "undatedPhotos",
          params: {
            limit: FETCH_LIMIT_PHOTOS_AGGREGATE
          }
        }
      }
    });
    a.add = function(b) {
      var a = this;
      return PhotoFetcher.prototype.add.call(a, b).done(function() {
        a.photoCount = a.countItems()
      })
    };
    a.remove = function(b) {
      var a = this;
      return PhotoFetcher.prototype.add.call(a, b).done(function() {
        a.photoCount = a.countItems()
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.file = function(b) {
      return this.items.length
    };
    return a
  }(),
  HomeView = function() {
    var a = {};
    $.extend(!0, a, Procrastination.prototype, Subscriptions.prototype, View.prototype);
    View.call(a,
      "home");
    $.extend(!0, a, {
      isLobbyView: !0,
      features: {
        sharing: !0
      },
      templates: {
        emptyMessage: {
          selector: function() {
            return /importing|connected/.test(User.getInfo("importState")) ? "#template-home-importingMessage-" + ("free" === Subscription.getInfo("plan") ? "free" : "subscriber") : "#template-home-emptyMessage"
          }
        }
      },
      strings: {
        title: HOMEVIEW_TITLE
      },
      samplers: {}
    });
    Procrastination.call(a);
    Subscriptions.call(a);
    a.activate = function(b) {
      var a = this;
      return View.prototype.activate.call(a, b).done(function() {
        _(a.samplers).invoke("activate");
        a.updateUI()
      })
    };
    a.deactivate = function() {
      var b = this;
      return View.prototype.deactivate.call(b).done(function() {
        _(b.samplers).invoke("deactivate")
      })
    };
    a.build = function() {
      var b = this;
      return View.prototype.build.call(b).done(function() {
        b.$view.addClass("pending");
        b.buildMomentsSampler();
        "ready" === User.getInfo("importState") && b.buildFlashbackSampler();
        b.subscribe("userImportState", "User/updateInfo", function(a) {
          "ready" === a.importState ? b.buildFlashbackSampler().done(function() {
            b.isActive && b.samplers.flashback.activate()
          }) :
            b.samplers.flashback && b.samplers.flashback.destruct().always(function() {
              delete b.samplers.flashback
            })
        });
        b.subscribe("samplerEmptiness", "Sampler/markEmpty", function(a, d) {
          b.updateUI()
        })
      })
    };
    a.destruct = function() {
      return $.rejected
    };
    a.buildMomentsSampler = function() {
      var b = this;
      if (b.samplers.moments) return $.rejected;
      b.samplers.moments = new ContextSampler("home/moments", b, LatestMoments, {
        templates: {
          sampler: {
            options: {
              moreLink: "#view=moments-recent",
              moreLinkTitle: MOMENTSSAMPLER_SEEMORE_TITLE
            }
          }
        },
        strings: {
          title: MOMENTSSAMPLER_TITLE,
          fetchMessageBusy: MOMENTSSAMPLER_FETCH_MESSAGE_BUSY,
          fetchMessageError: MOMENTSSAMPLER_FETCH_MESSAGE_ERROR
        },
        gridOptions: {
          rowLimit: 3,
          sortOrder: "desc",
          previewOptions: {
            templates: {
              preview: {
                options: {
                  extraClasses: "momentPreview",
                  viewID: function() {
                    return "moment-" + this.previewOf.id
                  },
                  title: function() {
                    return this.previewOf.timestamp.toString(MOMENTSSAMPLER_PREVIEW_DATE_FORMAT)
                  },
                  timeOfDay: function() {
                    return this.previewOf.getTimeOfDayString()
                  }
                }
              }
            }
          }
        },
        allowLoadMore: !0
      });
      return b.samplers.moments.build().done(function(a) {
        b.$view.find(".view-contents").append(a)
      })
    };
    a.buildFlashbackSampler = function() {
      var b = this;
      if (b.samplers.flashback) return $.rejected;
      b.samplers.flashback = new FlashbackSampler("home/flashback", b);
      return b.samplers.flashback.build().done(function(a) {
        b.$view.find("#home\\/moments").length ? b.$view.find("#home\\/moments").before(a) : b.$view.find(".view-contents").append(a)
      })
    };
    a.updateUI = function() {
      var b = this;
      return b.$view ? b.procrastinate("updateUI", function() {
        b.samplers.moments && b.samplers.moments.samplerOf.fetchedOnce ? (b.$view && b.$view.removeClass("pending"),
          b.checkEmptiness()) : b.$view && b.$view.addClass("pending");
        _(b.samplers).invoke("updateUI")
      }) : $.rejected
    };
    a.checkEmptiness = function() {
      var b = this,
        a;
      a = (!b.samplers.moments || b.samplers.moments.isEmpty) && (!b.samplers.flashback || b.samplers.flashback.isEmpty);
      b.isEmpty !== a && (b.isEmpty = a, PubHub.pub("View/markEmpty", b, a));
      b.$view && (b.isEmpty ? (b.$view.addClass("empty"), b.destroyElement("emptyMessage"), b.buildElement("emptyMessage").done(function(a) {
        b.$view.append(a)
      })) : (b.$view.removeClass("empty"), b.destroyElement("emptyMessage")));
      return b.isEmpty
    };
    return a
  }(),
  PhotoMailsView = function() {
    var a = {};
    $.extend(!0, a, CategoryView.prototype);
    CategoryView.call(a, "photomails", PhotoMails);
    $.extend(!0, a, {
      isLobbyView: !0,
      features: {
        sharing: !0
      },
      gridOptions: {
        sortOrder: "desc",
        previewOptions: {
          templates: {
            preview: {
              options: {
                extraClasses: "photoMailPreview",
                viewID: function() {
                  return "photomail-" + this.previewOf.id
                },
                title: function() {
                  return this.previewOf.subject || this.previewOf.timestamp.toString(PHOTOMAIL_PREVIEW_DATE_FORMAT)
                },
                senderName: function() {
                  return this.previewOf.sender.name || !1
                }
              }
            }
          }
        }
      },
      templates: {
        emptyMessage: {
          selector: "#template-photoMails-emptyMessage"
        }
      },
      strings: {
        title: PHOTOMAILS_TITLE,
        fetchMessageBusy: PHOTOMAILS_FETCH_MESSAGE_BUSY,
        fetchMessageError: PHOTOMAILS_FETCH_MESSAGE_ERROR
      }
    });
    a.destruct = function() {
      return $.rejected
    };
    return a
  }(),
  PhotoPagesView = function() {
    var a = {};
    $.extend(!0, a, CategoryView.prototype);
    CategoryView.call(a, "photopages", PhotoPages);
    $.extend(!0, a, {
      isLobbyView: !0,
      features: {
        sharing: !0
      },
      templates: {
        emptyMessage: {
          selector: "#template-photoPages-emptyMessage"
        }
      },
      strings: {
        title: PHOTOPAGES_TITLE,
        fetchMessageBusy: PHOTOPAGES_FETCH_MESSAGE_BUSY,
        fetchMessageError: PHOTOPAGES_FETCH_MESSAGE_ERROR
      },
      navBarSections: {
        right: "default"
      },
      gridOptions: {
        previewOptions: {
          templates: {
            preview: {
              options: {
                viewID: function() {
                  return "photopage-" + this.previewOf.id
                },
                title: function() {
                  return this.previewOf.title
                }
              }
            }
          }
        }
      }
    });
    a.destruct = function() {
      return $.rejected
    };
    return a
  }(),
  FlashbackView = function() {
    var a = {};
    $.extend(!0, a, SheetView.prototype);
    SheetView.call(a, "flashback");
    $.extend(!0, a, {
      state: "today",
      allowedStates: ["today", "explore"],
      isLobbyView: !0,
      features: {
        sharing: !0
      },
      templates: {
        view: {
          selector: "#template-flashback-view"
        }
      },
      navBarSections: {
        center: "flashback"
      },
      strings: {
        title: FLASHBACK_TITLE
      }
    });
    a.destruct = function() {
      return $.rejected
    };
    a.setupSheets = function() {
      var a = this,
        c, d;
      c = function() {
        var c = {};
        $.extend(!0, c, GridSheet.prototype);
        GridSheet.call(c, "today", a);
        $.extend(!0, c, {
          templates: {
            emptyMessage: {
              selector: "#template-flashback-today-emptyMessage"
            }
          },
          strings: {
            fetchMessageBusy: FLASHBACK_TODAY_FETCH_MESSAGE_BUSY,
            fetchMessageError: FLASHBACK_TODAY_FETCH_MESSAGE_ERROR,
            shareTitle: function(a) {
              return $.mustache(FLASHBACK_TODAY_SHARE_TITLE, {
                timeAgo: a.timestamp.relativeToNow()
              })
            }
          },
          gridOptions: {
            rowLimit: 1,
            templates: {
              grid: {
                selector: "#template-flashback-grid",
                options: {
                  extraClasses: "photoGrid flashbackGrid",
                  action: "time",
                  hasShare: !0
                }
              }
            },
            fileByTimestamp: !1,
            handlePhotoViewer: !0,
            previewOptions: {
              features: {
                dateTray: !0
              }
            }
          }
        });
        c.subscribe("todayOverride", "Cookie/setLocal", function(a, b) {
          a === COOKIE_TODAYOVERRIDE_NAME && (_(c.grids).invoke("destruct"),
            c.group && c.group.destruct(), c.requestFetch())
        });
        c.activate = function() {
          var a = this;
          return GridSheet.prototype.activate.call(a).done(function() {
            a.group || a.requestFetch()
          })
        };
        c.updateUI = function() {
          var a = this;
          return a.$sheet ? a.procrastinate("updateUI", function() {
            a.group && a.group.fetchedOnce ? (a.$sheet.removeClass("pending"), a.checkEmptiness()) : a.$sheet.addClass("pending")
          }) : $.rejected
        };
        c.checkEmptiness = function() {
          var a = this,
            b = !a.grids.length;
          a.isEmpty !== b && (a.isEmpty = b, PubHub.pub("Sheet/markEmpty", a, b));
          a.$sheet && (a.$sheet.toggleClass("empty", a.isEmpty), a.isEmpty ? a.$emptyMessage || a.buildElement("emptyMessage").done(function(b) {
            a.$sheet.append(b)
          }) : a.destroyElement("emptyMessage"));
          return a.isEmpty
        };
        c.requestFetch = function() {
          var a = this,
            b = $.Deferred();
          a.isActive && !a.fetching ? (a.fetching = !0, DiscreetActivity.show(a.fullID + "/fetch", a.makeString("fetchMessageBusy")), FlashbackHelper.getFetcher({
            tag: "today"
          }, {
            mode: "events"
          }).done(function(c) {
            a.group = c;
            c.fetch().always(function() {
              a.fetching = !1;
              DiscreetActivity.hide(a.fullID +
                "/fetch")
            }).done(function() {
              var d;
              c.items.length ? (d = _(c.items).map(function(b) {
                var c, d = _.uniqueId("grid-flashback/today-");
                c = new PhotoGrid([], b.keyPhotos, $.extend(!0, {}, a.gridOptions, {
                  id: d,
                  title: b.timestamp.relativeToNow(),
                  templates: {
                    grid: {
                      options: {
                        momentID: b.id,
                        subtitle: $.mustache(FLASHBACK_GRID_SUBTITLE, {
                          dayOfWeek: b.timestamp.toString("dddd"),
                          timeOfDay: b.timeOfDay ? b.getTimeOfDayString() : null
                        })
                      }
                    }
                  },
                  previewOptions: {
                    features: {
                      dateTray: !1
                    }
                  }
                }));
                a.grids.push(c);
                return c.build().done(function(d) {
                  var e;
                  a.$sheet.find(".view-grids").append(d);
                  a.isActive && c.activate();
                  e = $("#template-shareMenu").mustache({}).appendTo(d.find(".flashbackGrid-controls"));
                  e.bubble({
                    id: "shareMenu-flashback/today-" + b.id
                  });
                  d.find(".flashbackGrid-share").on({
                    mousedown: function() {
                      return !e.bubble().isOpen
                    },
                    click: function(a) {
                      $(this).hasClass("disabled") || (e.bubble().isOpen ? e.bubble().close() : e.bubble().open());
                      return !1
                    }
                  });
                  e.find(".bubbleMenu-button").on("click", function() {
                    var c = Moments.getView("moment-" + b.id);
                    Sharing.shareFromViews($(this).data("service"),
                      c, null, [a.makeString("shareTitle", b)]).done(function() {
                      FlashbackView.activate()
                    }).fail(function(a) {
                      a || FlashbackView.activate()
                    })
                  })
                })
              }), $.when.apply(a, d).always(function() {
                b.resolve()
              })) : (a.updateUI(), b.reject())
            }).fail(function(c, d) {
              a.isActive && "abort" !== d && MessageBars.buildNew(a.makeString("fetchMessageError"), {
                extraClasses: "alert",
                viewID: a.fullID
              });
              b.reject()
            })
          }).fail(function() {
            a.isActive && MessageBars.buildNew(a.makeString("fetchMessageError"), {
              extraClasses: "alert",
              viewID: a.fullID
            });
            b.reject()
          })) :
            b.reject();
          return b.promise()
        };
        return c
      }();
      d = function() {
        var c = {};
        $.extend(!0, c, GridSheet.prototype);
        GridSheet.call(c, "explore", a);
        $.extend(!0, c, {
          gridLimit: 50,
          templates: {
            sheet: {
              selector: "#template-flashback-explore-sheet"
            },
            emptyMessage: {
              selector: "#template-flashback-explore-emptyMessage"
            }
          },
          strings: {
            fetchMessageBusy: function(a) {
              return "shuffle" === a.tag ? FLASHBACK_SHUFFLE_FETCH_MESSAGE_BUSY : $.mustache(SEMANTIC_FETCH_MESSAGE_BUSY, {
                tagTitle: a.title
              })
            },
            fetchMessageError: function(a) {
              return "shuffle" === a.tag ?
                FLASHBACK_SHUFFLE_FETCH_MESSAGE_ERROR : $.mustache(SEMANTIC_FETCH_MESSAGE_ERROR, {
                  tagTitle: a.title
                })
            }
          },
          gridOptions: {
            rowLimit: function() {
              return this.gridOf instanceof ShuffleFetcher ? 2 : 1
            },
            dropCap: !0,
            templates: {
              grid: {
                selector: "#template-flashback-grid",
                options: {
                  extraClasses: "photoGrid flashbackGrid",
                  isEmpty: function() {
                    return !this.gridOf.items.length
                  },
                  isExperimental: function() {
                    return this.gridOf instanceof InterestingFetcher ? SEMANTIC_TAGS[this.gridOf.tags[0]] && SEMANTIC_TAGS[this.gridOf.tags[0]].isExperimental : !1
                  },
                  action: function() {
                    return this.gridOf instanceof InterestingFetcher ? this.gridOf.tags[0] : "shuffle"
                  }
                }
              }
            },
            fileByTimestamp: !1,
            handlePhotoViewer: !0,
            previewOptions: {
              features: {
                dateTray: !0
              }
            }
          }
        });
        c.allowedActions = [];
        _(SEMANTIC_TAGS).each(function(a, b) {
          _(a.allowInViews).contains("flashback") && c.allowedActions.push({
            tag: b,
            title: a.title,
            isExperimental: a.isExperimental
          })
        });
        c.allowedActions.push({
          tag: "shuffle",
          title: "Shuffle"
        });
        c.build = function() {
          var a = this;
          return GridSheet.prototype.build.call(a).done(function(b) {
            function c(b,
              d) {
              var g, h;
              g = e.mustache({
                title: b,
                action: d
              });
              g.on({
                click: function() {
                  a.requestFetch(d);
                  return !1
                }
              });
              Modernizr.touch || (h = g.find(".bubble").bubble(), g.on({
                mouseenter: function() {
                  h.open()
                },
                mouseleave: function() {
                  h.close()
                }
              }));
              Modernizr.csstransitionspseudos || $("<em/>").appendTo(g);
              return g
            }
            var d, e = $("#template-flashback-explore-button");
            b && (d = a.$sheet.find(".flashback-buttons"), _(a.allowedActions).each(function(a) {
              c(a.title, a.tag).appendTo(d)
            }), d.on("dblclick", function() {
              a.requestFetch()
            }))
          })
        };
        c.updateUI =
          function() {
            var a = this;
            return a.$sheet ? a.procrastinate("updateUI", function() {
              "ready" !== User.getInfo("importState") ? a.$sheet && (a.$sheet.addClass("empty"), a.$emptyMessage || a.buildElement("emptyMessage").done(function(b) {
                a.$sheet.append(b)
              })) : (a.$sheet && (a.destroyElement("emptyMessage"), a.$sheet.removeClass("empty")), a.checkEmptiness())
            }) : $.rejected
        };
        c.checkEmptiness = function() {
          var a = !this.grids.length;
          this.isEmpty !== a && (this.isEmpty = a, PubHub.pub("Sheet/markEmpty", this, a));
          this.$sheet && (this.$sheet.toggleClass("initialState",
            this.isEmpty), this.$sheet.find(".flashback-button > .bubble").toggleClass("inverted", !this.isEmpty));
          return this.isEmpty
        };
        c.requestFetch = function(a) {
          var b = this,
            c, d = $.Deferred();
          b.isActive && !b.fetching ? (b.fetching = !0, c = FlashbackHelper.chooseAction(b.allowedActions, a), PubHub.pub("Flashback/fetch", c.tag === a ? a : "random", "view"), DiscreetActivity.show(b.id + "/fetch", b.makeString("fetchMessageBusy", c)), FlashbackHelper.getFetcher(c).done(function(a) {
            var e = $.Deferred(),
              f = $.Deferred(),
              n;
            n = b.$sheet.find(".flashback-button[data-action='" +
              c.tag + "']").addClass("fetching");
            e.follow(a.fetch());
            _(function() {
              f.resolve()
            }).delay(1E3);
            d.follow($.when(e, f).always(function() {
              b.fetching = !1;
              DiscreetActivity.hide(b.id + "/fetch");
              n.removeClass("fetching")
            }).done(function() {
              var d, e = _.uniqueId("grid-flashback/explore-");
              b.isActive && (d = "shuffle" === c.tag ? new PhotoGrid([], a, $.extend(!0, {}, b.gridOptions, {
                id: e,
                title: c.title
              })) : new SemanticGrid([], a, c.tag, $.extend(!0, {}, b.gridOptions, {
                id: e,
                title: c.title
              })), b.grids.push(d), b.grids.length > b.gridLimit && b.grids.splice(0,
                1)[0].destruct(), _(function() {
                d.build().done(function(e) {
                  var f;
                  b.$sheet.find(".view-grids").prepend(e);
                  d.activate();
                  if (!a.items.length)
                    if (f = e.find(".flashbackGrid-emptyMessage-learnMore-bubble").bubble({
                      closeAfter: 5E3
                    }), Modernizr.touch) e.find(".flashbackGrid-emptyMessage-learnMore").on({
                      click: function() {
                        f.open()
                      }
                    });
                    else e.find(".flashbackGrid-emptyMessage-learnMore").on({
                      mouseenter: function() {
                        f.open()
                      },
                      mouseleave: function() {
                        f.close()
                      }
                    });
                    else
                  if (c.isExperimental)
                    if (f = e.find(".flashbackGrid-experimentalMessage-learnMore-bubble").bubble({
                        closeAfter: 5E3
                      }),
                      Modernizr.touch) e.find(".flashbackGrid-experimentalMessage-learnMore").on({
                      click: function() {
                        f.open()
                      }
                    });
                    else e.find(".flashbackGrid-experimentalMessage-learnMore").on({
                      mouseenter: function() {
                        f.open()
                      },
                      mouseleave: function() {
                        f.close()
                      }
                    })
                })
              }).defer())
            }).fail(function(a, c) {
              b.isActive && "abort" !== c && MessageBars.buildNew(b.makeString("fetchMessageError"), {
                extraClasses: "alert " + b.id,
                viewID: b.fullID
              })
            }))
          }).fail(function() {
            b.isActive && MessageBars.buildNew(b.makeString("fetchMessageError"), {
              extraClasses: "alert " +
                b.id,
              viewID: b.fullID
            })
          })) : d.reject();
          return d.promise()
        };
        return c
      }();
      return $.when(c.build(), d.build()).done(function() {
        a.sheets.push(c);
        a.sheets.push(d)
      }).promise()
    };
    return a
  }(),
  SentMailsView = function() {
    var a = {};
    $.extend(!0, a, CategoryView.prototype);
    CategoryView.call(a, "sentmails", SentMails);
    $.extend(!0, a, {
      isLobbyView: !0,
      features: {
        sharing: !0
      },
      gridOptions: {
        sortOrder: "desc",
        previewOptions: {
          templates: {
            preview: {
              options: {
                extraClasses: "photoMailPreview",
                viewID: function() {
                  return "sentmail-" + this.previewOf.id
                },
                title: function() {
                  return this.previewOf.subject || this.previewOf.timestamp.toString(PHOTOMAIL_PREVIEW_DATE_FORMAT)
                },
                numRecipients: function() {
                  return _(this.previewOf.recipients).size() || !1
                }
              }
            }
          }
        }
      },
      templates: {
        emptyMessage: {
          selector: "#template-sentMails-emptyMessage"
        }
      },
      strings: {
        title: SENTMAILS_TITLE,
        fetchMessageBusy: SENTMAILS_FETCH_MESSAGE_BUSY,
        fetchMessageError: SENTMAILS_FETCH_MESSAGE_ERROR
      }
    });
    a.destruct = function() {
      return $.rejected
    };
    return a
  }(),
  OrphansView = function() {
    var a = {};
    $.extend(!0, a, ContextView.prototype);
    ContextView.call(a, "orphans", Orphans);
    $.extend(!0, a, {
      state: SourceYears.getFilterState(),
      isLobbyView: !0,
      features: {
        download: !1,
        sharing: !1
      },
      templates: {
        emptyMessage: {
          selector: "#template-source-emptyFilterMessage",
          options: {
            sourceName: function() {
              return Sources.getSetSources()[this.state] || "sources"
            },
            thisView: "this view"
          }
        }
      },
      strings: {
        title: ORPHANPHOTOSVIEW_TITLE,
        navBarTitle: function() {
          return $.mustache(ORPHANPHOTOSVIEW_TITLE_NAVBAR, {
            sourceTitle: Sources.getSetSources()[this.state] || "All Sources"
          })
        },
        fetchMessageBusy: ORPHANPHOTOSVIEW_FETCH_MESSAGE_BUSY,
        fetchMessageError: ORPHANPHOTOSVIEW_FETCH_MESSAGE_ERROR
      },
      navBarSections: {
        left: "default",
        center: "default",
        right: "default"
      },
      gridOptions: {
        fileByTimestamp: !1
      }
    });
    a.setState = function(a) {
      var c = this;
      return CategoryView.prototype.setState.call(c, a).done(function() {
        c.navDrawerTags.filterType = a;
        c.viewOf.reset();
        SourceYears.filterTo(a)
      })
    };
    a.hasState = function(a) {
      return "all" === a || !! Sources.getSetSources()[a]
    };
    a.destruct = function() {
      return $.rejected
    };
    a.checkEmptiness = function() {
      var a = this,
        c;
      c = _(a.grids).every(function(a) {
        return a.checkEmptiness()
      });
      a.isEmpty !== c && (a.isEmpty = c, PubHub.pub("View/markEmpty", a, c));
      a.$view && (a.destroyElement("emptyMessage"), a.$view.toggleClass("empty", a.isEmpty), a.isEmpty && a.buildElement("emptyMessage").done(function(c) {
        a.$view.append(c)
      }));
      return a.isEmpty
    };
    a.subscribe("filter", "SourceYears/filterTo", function(b) {
      b !== a.state && a.setState(b)
    });
    return a
  }(),
  LatestView = function() {
    var a = {};
    $.extend(!0, a, ContextView.prototype);
    ContextView.call(a, "latest", LatestPhotos);
    $.extend(!0, a, {
      isLobbyView: !0,
      features: {
        download: !1,
        sharing: !0
      },
      strings: {
        title: LATESTPHOTOSVIEW_TITLE,
        fetchMessageBusy: LATESTPHOTOSVIEW_FETCH_MESSAGE_BUSY,
        fetchMessageError: LATESTPHOTOSVIEW_FETCH_MESSAGE_ERROR
      },
      navBarSections: {
        left: "default",
        center: "default",
        right: "default"
      },
      gridOptions: {
        fileByTimestamp: !1,
        sortOrder: "desc"
      }
    });
    a.destruct = function() {
      return $.rejected
    };
    return a
  }(),
  RecentlyModifiedView = function() {
    var a = {};
    $.extend(!0, a, ContextView.prototype);
    ContextView.call(a, "recently-modified", RecentlyModifiedPhotos);
    $.extend(!0, a, {
      isLobbyView: !0,
      features: {
        download: !1,
        sharing: !0
      },
      strings: {
        title: MODIFIEDPHOTOSVIEW_TITLE,
        fetchMessageBusy: MODIFIEDPHOTOSVIEW_FETCH_MESSAGE_BUSY,
        fetchMessageError: MODIFIEDPHOTOSVIEW_FETCH_MESSAGE_ERROR
      },
      navBarSections: {
        left: "default",
        center: "default",
        right: "default"
      },
      gridOptions: {
        fileByTimestamp: !1,
        sortOrder: "desc"
      }
    });
    a.destruct = function() {
      return $.rejected
    };
    return a
  }(),
  UndatedView = function() {
    var a = {};
    $.extend(!0, a, ContextView.prototype);
    ContextView.call(a, "undated", UndatedPhotos);
    $.extend(!0, a, {
      isLobbyView: !0,
      features: {
        download: !1,
        sharing: !0
      },
      strings: {
        title: UNDATEDPHOTOSVIEW_TITLE,
        fetchMessageBusy: UNDATEDPHOTOSVIEW_FETCH_MESSAGE_BUSY,
        fetchMessageError: UNDATEDPHOTOSVIEW_FETCH_MESSAGE_ERROR
      },
      navBarSections: {
        left: "default",
        center: "default",
        right: "default"
      },
      gridOptions: {
        fileByTimestamp: !1
      }
    });
    a.destruct = function() {
      return $.rejected
    };
    return a
  }(),
  SemanticView = function() {
    var a = {};
    $.extend(!0, a, GridView.prototype);
    GridView.call(a, "semantic");
    $.extend(!0, a, {
      viewOf: new SemanticFetcher([], {
        resources: {
          fetchItems: {
            params: {
              minLikelihood: function() {
                var a =
                  JSON.parse(Cookie.getLocal("semanticParams") || "{}");
                return Query.minLikelihood || a.minLikelihood || 60
              },
              maxLikelihood: function() {
                var a = JSON.parse(Cookie.getLocal("semanticParams") || "{}");
                return Query.maxLikelihood || a.maxLikelihood || 100
              },
              limit: function() {
                var a = JSON.parse(Cookie.getLocal("semanticParams") || "{}");
                return Query.limit || a.limit || FETCH_LIMIT_SEMANTICVIEW
              }
            }
          }
        }
      }),
      isLobbyView: !0,
      state: "",
      templates: {
        view: {
          selector: "#template-semantic-view",
          options: {
            extraClasses: "photosView"
          }
        },
        miscMenu: {
          selector: "#template-semantic-miscMenu"
        },
        emptyMessage: !1
      },
      strings: {
        title: SEMANTICVIEW_TITLE,
        fetchMessageBusy: function() {
          return $.mustache(SEMANTIC_FETCH_MESSAGE_BUSY, {
            tagTitle: this.state
          })
        },
        fetchMessageError: function() {
          return $.mustache(SEMANTIC_FETCH_MESSAGE_ERROR, {
            tagTitle: this.state
          })
        }
      },
      navBarSections: {
        left: "default",
        center: "default",
        right: "default"
      },
      gridType: "semantic",
      gridOptions: {
        handlePhotoViewer: !0,
        fileByTimestamp: !1,
        previewOptions: {
          useStringForFeedback: !0
        }
      }
    });
    a.build = function() {
      var a = this;
      return GridView.prototype.build.call(a).done(function(c) {
        c &&
          ($("#semantic-search").on("execute.asyncForm", function() {
          var c = $(this);
          a.setState($("#semantic-search\\/term").val()).always(function() {
            c.asyncForm().unlock()
          })
        }).asyncForm(), a.buildElement("miscMenu").done(function(c) {
          a.miscMenu = c.bubble({
            id: "miscMenu-" + a.id
          });
          c.find(".semantic-miscMenu-parameters").on("click", function(c) {
            c = JSON.parse(Cookie.getLocal("semanticParams") || "{}");
            $form = $("#template-semantic-parameters").mustache(c).appendTo("body");
            $form.on("execute.asyncForm", function() {
              var c = {};
              $("#semantic\\/parameters\\/min-likelihood").val() &&
                (c.minLikelihood = $("#semantic\\/parameters\\/min-likelihood").val());
              $("#semantic\\/parameters\\/max-likelihood").val() && (c.maxLikelihood = $("#semantic\\/parameters\\/max-likelihood").val());
              $("#semantic\\/parameters\\/limit").val() && (c.limit = $("#semantic\\/parameters\\/limit").val());
              Cookie.setLocal("semanticParams", JSON.stringify(c));
              $(this).popover().close();
              a.state && a.requestFetch()
            }).asyncForm();
            $form.on({
              "afterClose.popover": function() {
                $(this).popover().destruct()
              }
            }).popover({
              isOpen: !0
            })
          })
        }))
      })
    };
    a.deactivate = function() {
      var a = this;
      return GridView.prototype.deactivate.call(a).done(function() {
        a.setState("")
      })
    };
    a.setState = function(a) {
      var c = this;
      a = a || "";
      c.state !== a && (c.state = a, PubHub.pub("View/update", c, a));
      return c.procrastinate("setState", function() {
        var a = $.Deferred();
        c.isActive ? (c.state ? a.follow(c.requestFetch()) : a.follow(c.viewOf.reset()), Views.setDocumentTitle()) : a.resolve();
        return a.promise()
      })
    };
    a.hasState = function(a) {
      return !!a
    };
    a.destruct = function() {
      return $.rejected
    };
    a.updateUI = function() {
      var a =
        this,
        c = [];
      return a.$view ? (c.push(GridView.prototype.updateUI.call(a)), c.push(a.procrastinate("updateUI", function() {
        a.$miscMenu && a.$miscMenu.find(".semantic-miscMenu-photoCount").text(a.viewOf.countItems());
        a.$view.find(".semantic-description").text(a.viewOf.description || "");
        a.$view.find("#semantic-search\\/term").val(a.state || "");
        a.isActive && !a.state && a.$view.find("#semantic-search\\/term").trigger("focus")
      })), $.when.apply(a, c).promise()) : $.rejected
    };
    a.checkEmptiness = function() {
      var a;
      a = _(this.grids).every(function(a) {
        return a.checkEmptiness()
      });
      this.isEmpty !== a && (this.isEmpty = a, PubHub.pub("View/markEmpty", this, a));
      return this.isEmpty
    };
    a.requestFetch = function() {
      var a = this,
        c = $.Deferred();
      a.isActive && a.viewOf && a.viewOf.fetch ? (DiscreetActivity.show(a.id + "/fetch", a.makeString("fetchMessageBusy")), a.viewOf.reset().always(function() {
        c.follow(a.viewOf.fetch({
          searchString: a.state
        }).always(function() {
          DiscreetActivity.hide(a.id + "/fetch")
        }).done(function() {
          var c;
          a.isActive && (c = Grids.buildNew(a.gridType, [], a.viewOf, a.state, $.extend(!0, {}, a.gridOptions, {
            id: _.uniqueId("grid-semantic-")
          })), _(a.grids).invoke("destruct"), a.grids = [], _(function() {
            a.grids.push(c);
            c.build().done(function(e) {
              a.$view.find(".view-grids").prepend(e);
              c.activate()
            })
          }).defer())
        }))
      })) : c.reject();
      return c.promise()
    };
    a.usePhotoForSearch = function(a) {
      return this.$view && a && a.semanticInfo && a.semanticInfo.minDate && a.semanticInfo.maxDate ? (this.$view.find("#semantic-search\\/term").val("Photos between " + a.semanticInfo.minDate + " and " + a.semanticInfo.maxDate), !0) : !1
    };
    a.subscribe("groupFetch",
      "Group/fetch", function(b) {
        b === a.viewOf && (a.checkEmptiness(), a.isActive && a.updateUI())
      });
    return a
  }();

function Panel(a, b) {
  var c = this;
  $.extend(!0, c, {
    activateImmediately: !1,
    state: null,
    allowedStates: [],
    selector: "#" + a,
    popoverOptions: {
      fixedTop: 0.1
    }
  }, b, {
    id: a,
    isActive: !1
  });
  Procrastination.call(c);
  Initializer.ready(function() {
    c.build();
    PubHub.pub("Panel/construct", c);
    c.activateImmediately && c.activate()
  })
}
$.extend(!0, Panel.prototype, Procrastination.prototype);
Panel.prototype.activate = function() {
  function a() {
    c.isActive = !0;
    c.popover ? b() : c.build().done(b)
  }

  function b() {
    PubHub.pub("Panel/activate", c);
    c.popover.open();
    d.resolve()
  }
  var c = this,
    d = $.Deferred();
  c.isActive ? d.reject() : window.Panels ? Panels.activate(c, d).done(a).fail(function() {
    d.reject()
  }) : a();
  return d.promise()
};
Panel.prototype.deactivate = function() {
  function a() {
    b.isActive = !1;
    PubHub.pub("Panel/deactivate", b);
    b.popover.close();
    c.resolve()
  }
  var b = this,
    c = $.Deferred();
  b.isActive ? window.Panels ? Panels.deactivate(b, c).done(a).fail(function() {
    c.reject()
  }) : a() : c.reject();
  return c.promise()
};
Panel.prototype.setState = function(a) {
  var b = $.Deferred();
  a !== this.state && this.hasState(a) ? (this.state = a, PubHub.pub("Panel/update", this, this.state), b.resolve()) : b.reject();
  return b.promise()
};
Panel.prototype.hasState = function(a) {
  return _(this.allowedStates).contains(a)
};
Panel.prototype.build = function() {
  var a = this;
  a.buildDfd || (a.buildDfd = $.Deferred(), $(function() {
    a.$el = $(a.selector);
    a.popover = a.$el.on({
      "beforeClose.popover": function(b) {
        b.userTriggered && a.deactivate()
      }
    }).popover(a.popoverOptions);
    a.buildDfd.resolve()
  }));
  return a.buildDfd.promise()
};
var NavPanel = function() {
  var a = {};
  $.extend(!0, a, Panel.prototype, Subscriptions.prototype);
  Panel.call(a, "nav");
  $.extend(!0, a, {
    allowedStates: [null, "alt"],
    state: null,
    popoverOptions: {
      fixedTop: !1,
      closeButton: !1,
      autoCenter: !1,
      overlayStrength: "weak"
    }
  });
  Procrastination.call(a);
  Subscriptions.call(a);
  a.activate = function() {
    var a = this;
    return Panel.prototype.activate.call(a).done(function() {
      a.popover.open().always(function() {
        a.setViewSelection();
        a.checkScrollability()
      });
      !1 !== Preferences.get("nav_guide") && a.activateGuide();
      a.subscribe("viewport", "Viewport/update", function(c) {
        c.deltas.height && a.checkScrollability()
      })
    })
  };
  a.deactivate = function(a) {
    var c = this;
    return Panel.prototype.deactivate.call(c, a).done(function() {
      c.deactivateGuide();
      c.unsubscribe("viewport")
    })
  };
  a.build = function() {
    var a = this;
    a.buildDfd || Panel.prototype.build.call(a).done(function() {
      a.$el.on("click", function() {
        a.deactivate(!0)
      });
      a.$drawers = a.$el.find(".navDrawer");
      a.$drawers.on("click", function(a) {
        a.stopPropagation()
      });
      a.$drawers.on("click", "a.selected",
        function() {
          return !1
        });
      "alt" === a.state ? a.$drawers.filter("#navDrawer\\/alt").addClass("active") : a.$drawers.filter("#navDrawer\\/default").addClass("active");
      a.updateSources();
      a.$el.find(".navDrawer-filter-expand").on("click", function() {
        a.expandFilters($(this).attr("data-viewtype"))
      });
      a.$el.find(".navDrawer-filter-collapse").on("click", function() {
        a.collapseFilters($(this).attr("data-viewtype"))
      });
      a.$guide = a.$el.find("#navGuide");
      a.$guide.on({
        click: function() {
          return !1
        },
        "mouseenter.navGuide": function() {
          a.guideVisible = !0;
          a.$guide.addClass("visible")
        },
        "mouseleave.navGuide": function() {
          a.guideVisible = !1;
          _(function() {
            a.guideVisible || a.$guide.removeClass("visible")
          }).delay(NAV_GUIDE_TIMEOUT)
        }
      });
      a.$guide.find(".navGuide-dismiss").on("click", function() {
        a.deactivateGuide();
        Preferences.set("nav_guide", !1)
      });
      a.$el.find(".navDrawer-footer-link[data-function='signOut']").on("click", function() {
        BlockingActivity.show("signOut", "Signing Out&hellip;");
        User.logout()
      });
      a.$el.find(".navDrawer-settings-link[data-function='back']").on("click",
        function() {
          a.setState(null)
        });
      a.$el.find(".navDrawer-settings-link[data-function='today']").on("click", function() {
        FlashbackHelper.setTodayDate();
        a.deactivate()
      });
      a.$el.find(".navDrawer-settings-link[data-function='party']").on("click", function() {
        $("html").toggleClass("partyMode");
        a.deactivate()
      })
    });
    return a.buildDfd.promise()
  };
  a.setState = function(a) {
    var c = this;
    return Panel.prototype.setState.call(c, a).done(function() {
      c.$el && ("alt" === c.state ? (c.$drawers.filter("#navDrawer\\/alt").addClass("active"),
        c.$drawers.filter("#navDrawer\\/default").removeClass("active").scrollPane().destruct()) : (c.$drawers.filter("#navDrawer\\/default").addClass("active"), c.$drawers.filter("#navDrawer\\/alt").removeClass("active").scrollPane().destruct()))
    })
  };
  a.expandFilters = function(b) {
    var c = a.$el.find(".navDrawer-filters[data-viewtype='" + b + "']"),
      d, e;
    c.length && (d = c.height(), e = 0, c.children().each(function() {
      var a = $(this);
      e += parseInt(a.css("padding-top"));
      e += parseInt(a.css("padding-bottom"));
      e += parseInt(a.css("border-bottom-width"));
      a.children().each(function() {
        e += $(this).outerHeight(!0)
      })
    }), e !== d && (a.isActive ? c.animate({
      height: e
    }, {
      duration: 200,
      easing: "easeInOutQuad",
      step: function() {
        a.checkScrollability()
      },
      done: function() {
        a.checkScrollability()
      }
    }) : c.css("height", e), a.$el.find(".navDrawer-filter-expand[data-viewtype='" + b + "']").removeClass("visible"), a.$el.find(".navDrawer-filter-collapse[data-viewtype='" + b + "']").addClass("visible")))
  };
  a.collapseFilters = function(b) {
    var c = a.$el.find(".navDrawer-filters[data-viewtype='" + b + "']"),
      d;
    c.length && (d = c.height(), 0 !== d && (a.isActive ? c.animate({
      height: 0
    }, {
      duration: 200,
      easing: "easeInOutQuad",
      step: function() {
        a.checkScrollability()
      },
      done: function() {
        a.checkScrollability()
      }
    }) : c.css("height", 0), a.$el.find(".navDrawer-filter-expand[data-viewtype='" + b + "']").addClass("visible"), a.$el.find(".navDrawer-filter-collapse[data-viewtype='" + b + "']").removeClass("visible")))
  };
  a.activateGuide = function() {
    var a = this;
    if (a.$el && a.isActive) a.$el.on({
        "mouseenter.navGuide": function() {
          var c = $(this),
            d, e, f;
          a.guideVisible = !0;
          a.$guide.find(".navGuide-title").html(c.html());
          a.$guide.find(".navGuide-description").html(NAV_GUIDE_DESCRIPTIONS[c.attr("data-guide-key")]);
          _(function() {
            d = c.outerHeight();
            e = c.offset().top - Viewport.getTop();
            f = a.$guide.outerHeight();
            e + f < Viewport.getHeight() ? a.$guide.css("top", e + d / 2).removeClass("inverted") : a.$guide.css("top", e + d / 2 - f).addClass("inverted");
            a.$guide.addClass("visible")
          }).defer()
        },
        "mouseleave.navGuide": function() {
          a.guideVisible = !1;
          _(function() {
            a.guideVisible || a.$guide.removeClass("visible")
          }).delay(NAV_GUIDE_TIMEOUT)
        }
      },
      "[data-guide-key]")
  };
  a.deactivateGuide = function() {
    this.$el.off(".navGuide", "[data-guide-key]");
    this.$guide.removeClass("visible")
  };
  a.checkScrollability = function() {
    var a = this;
    return a.isActive ? a.procrastinate("checkScrollability", function() {
      var c = Viewport.getHeight(),
        d = a.$el.find(".navDrawer.active"),
        e = d.find(".navDrawer-views"),
        f = d.find(".navDrawer-settings"),
        e = e.outerHeight(),
        g = f.outerHeight();
      e + g > c ? (d.scrollPane({
        isActive: !0
      }).update(), f.addClass("sticky")) : (d.scrollPane().destruct(), f.removeClass("sticky"))
    }) :
      $.rejected
  };
  a.updateSources = function() {
    var a, c;
    this.$el && (a = sortObject(Sources.getSetSources()) || {}, $sourceLists = this.$el.find(".navDrawer-filter-sources"), c = $("#template-navDrawer-filter-link"), $sourceLists.empty(), _(a).size() ? $sourceLists.removeClass("hidden").each(function() {
      var d = $(this),
        e = d.attr("data-baseView") || "sources";
      _(a).each(function(a, b) {
        c.mustache({
          baseView: e,
          source: b,
          title: a
        }).appendTo(d)
      })
    }) : $sourceLists.addClass("hidden"), this.setViewSelection())
  };
  a.setViewSelection = function() {
    var a =
      this,
      c, d, e, f;
    (f = Views.getActive()) && a.$el && (c = a.$el.find(".navDrawer-view-link.selected"), d = a.$el.find(".navDrawer-view-link[data-viewtype='" + f.navDrawerTags.viewType + "']"), c.is(d) || (c.removeClass("selected"), d.addClass("selected"), _(function() {
        a.collapseFilters(c.attr("data-viewtype"));
        a.expandFilters(d.attr("data-viewtype"))
      }).delay(a.$drawers.transitionDuration())), e = a.$el.find(".navDrawer-filter-link.selected"), f = a.$el.find(".navDrawer-filter-link[data-filtertype='" + f.navDrawerTags.filterType +
        "']"), e.is(f) || (e.removeClass("selected"), f.addClass("selected")))
  };
  a.setProcessingSpinner = function() {
    this.$el && this.$el.find(".navDrawer-processing").toggleClass("visible", User.isCollectionUpdating())
  };
  a.setNewCount = function(a) {
    var c = this;
    c.$el && c.procrastinate("setNewCount", function() {
      c.$el.find(".navDrawer-view-link[data-viewtype='photomails']").attr("data-new-count", a)
    })
  };
  PubHub.sub("View/activate", function() {
    a.setViewSelection()
  });
  PubHub.sub("View/update", function(b) {
    b.isActive && a.setViewSelection()
  });
  PubHub.sub("Sources/refresh", function() {
    a.updateSources()
  });
  a.updateSources();
  Initializer.ready(function() {
    a.setNewCount(PhotoMails.getNewCount());
    PubHub.sub("PhotoMails/set/newCount", function(b) {
      a.setNewCount(b)
    })
  });
  Initializer.ready(function() {
    a.setProcessingSpinner();
    PubHub.sub("User/setCollectionUpdating", function() {
      a.setProcessingSpinner()
    })
  });
  return a
}(),
  PreferencesPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "preferences");
    $.extend(!0, a, {
      state: "general",
      allowedStates: "general account email stats billing invite".split(" ")
    });
    a.setState = function(a) {
      var c = this;
      return Panel.prototype.setState.call(c, a).done(function() {
        c.tabset && c.tabset.select(c.state)
      })
    };
    a.build = function() {
      var a = this;
      return a.buildDfd ? a.buildDfd : Panel.prototype.build.call(a).done(function() {
        var c = a.$el.find(".tabset");
        a.tabset = c.tabset({
          tabLink: "#panel=preferences/{{id}}"
        });
        c.on("switch.tabset", function(c, e, f) {
          c = a.tabset.$tabs.eq(e).data("tab-id");
          a.setState(c);
          a.tabset.$contents.eq(f).find(".messageBar").each(function() {
            $(this).data("messageBar").close()
          })
        });
        a.tabset.select(a.state);
        (function() {
          var a = $("#preferences\\/general\\/photos\\/show-hidden"),
            b = $("#preferences\\/general\\/navigation\\/guide"),
            c = $("#preferences\\/general\\/shortcuts\\/keyboard"),
            g = $("#preferences\\/general\\/experiments\\/webp");
          a.on("change", function() {
            Preferences.set("show_hidden", $(this).prop("checked"))
          });
          b.on("change", function() {
            Preferences.set("nav_guide", $(this).prop("checked"))
          });
          c.on("change", function() {
            Preferences.set("keyboard_shortcuts", $(this).prop("checked"))
          });
          g.on("change",
            function() {
              Preferences.set("webp", $(this).prop("checked"))
            });
          PubHub.sub("Preference/set", function(h, k) {
            "show_hidden" === h ? a.prop("checked", !! k) : "nav_guide" === h ? b.prop("checked", !! k) : "keyboard_shortcuts" === h ? c.prop("checked", !! k) : "webp" === h && g.prop("checked", !! k)
          });
          a.prop("checked", !! Preferences.get("show_hidden"));
          b.prop("checked", !1 !== Preferences.get("nav_guide"));
          c.prop("checked", !! Preferences.get("keyboard_shortcuts"));
          g.prop("checked", !! Preferences.get("webp"))
        })();
        (function() {
          function a() {
            var c =
              User.getInfo(),
              d = [],
              h = $("#template-preferences-emailList-address");
            c && ($("#preferences\\/account\\/fullname").text(c.firstName + " " + c.lastName), $("#preferences\\/account\\/email").empty(), _(c.activeEmails).each(function(a) {
              d.push({
                email: a,
                isDefault: a === c.email
              })
            }), _(c.pendingEmails).each(function(a) {
              d.push({
                email: a,
                isPending: !0
              })
            }), _(d).chain().sortBy("email").each(function(a) {
              h.mustache(a).appendTo("#preferences\\/account\\/email")
            }), $("#preferences\\/account\\/email").find(".emailList-address:not(.default)").each(function() {
              var a =
                $(this),
                c = a.data("email");
              a.find(".emailList-address-delete").on("click", function() {
                User.removeEmail(c).done(function() {
                  a.empty().remove()
                }).fail(function() {
                  MessageBars.buildNew(USERINFO_MESSAGE_EMAIL_REMOVE_ERROR, {
                    extraClasses: "alert",
                    insertElement: b
                  })
                })
              });
              a.find(".emailList-address-setDefault").on("click", function() {
                User.setInfo("email", c).done(function() {
                  MessageBars.buildNew(USERINFO_MESSAGE_EMAIL_SETDEFAULT_SUCCESS, {
                    insertElement: b
                  })
                }).fail(function() {
                  MessageBars.buildNew(USERINFO_MESSAGE_EMAIL_SETDEFAULT_ERROR, {
                    extraClasses: "alert",
                    insertElement: b
                  })
                })
              })
            }))
          }
          var b = $("#preferences\\/account");
          Initializer.ready(a);
          PubHub.sub("User/updateInfo", a)
        })();
        (function() {
          function a(b) {
            $.isPlainObject(b) ? $.each(b, function(a, b) {
              c.filter("[data-list='" + a + "']").prop("checked", !! b)
            }) : c.prop("checked", !1)
          }

          function b(a) {
            var c = $("#template-preferences-flashbackEmails-address");
            $("#preferences\\/email\\/flashback-emails").empty();
            _(a).each(function(a) {
              c.mustache({
                email: a
              }).appendTo("#preferences\\/email\\/flashback-emails")
            });
            $("#preferences\\/email\\/flashback-emails").find(".flashbackEmails-address").each(function() {
              var a = $(this),
                b = a.data("email");
              a.find(".flashbackEmails-address-delete").on("click", function() {
                User.removeFlashbackEmail(b).done(function() {
                  a.empty().remove()
                }).fail(function() {
                  MessageBars.buildNew(USERINFO_MESSAGE_EMAIL_REMOVE_ERROR, {
                    extraClasses: "alert",
                    insertElement: $el
                  })
                })
              })
            })
          }
          var c = $("#preferences\\/email").find("input:checkbox");
          c.on("change", function() {
            var a = $(this),
              b = {};
            b[a.data("list")] = a.prop("checked");
            User.setInfo("mailingLists", b)
          });
          Initializer.ready(function() {
            a(User.getInfo("mailingLists"));
            b(User.getInfo("flashbackEmails"))
          });
          PubHub.sub("User/updateInfo", function(c) {
            a(c.mailingLists);
            b(c.flashbackEmails)
          })
        })();
        (function() {
          var a = $("#preferences\\/stats"),
            b;
          a.on({
            "activateTab.tabset": function() {
              Stats.refresh().fail(function() {
                MessageBars.buildNew("Could not retrieve your statistics.", {
                  extraClasses: "alert",
                  insertFunction: "prependTo",
                  insertElement: $("#preferences\\/stats")
                })
              })
            }
          });
          b = a.find(".stats-realTime-learnMore > .bubble").bubble();
          if (Modernizr.touch) a.find(".stats-realTime-learnMore").on({
            click: function() {
              b.open();
              return !1
            }
          });
          else a.find(".stats-realTime-learnMore").on({
            mouseenter: function() {
              b.open()
            },
            mouseleave: function() {
              b.close()
            }
          });
          PubHub.sub("Stats/refresh", function() {
            var b = a.find("[data-stats-collection]"),
              c = a.find(".stats-realTime dd[data-stats-realTime]");
            data = Stats.getStat();
            _(data).each(function(a, c) {
              b.filter("[data-stats-collection='" + c + "']").html(function() {
                var b;
                switch (c) {
                  case "oldestPhotoTimestamp":
                  case "newestPhotoTimestamp":
                    a &&
                      (b = (new XDate(1E3 * a, !0)).toString(STATS_TIMESTAMP_FORMAT));
                    break;
                  case "updated":
                    b = (new XDate(1E3 * a)).relativeToNow();
                    break;
                  default:
                    b = a
                }
                return b
              })
            });
            a.find(".stats-collection-free").toggleClass("visible", "free" === Subscription.getInfo("plan"));
            _(data.pending).each(function(b, e) {
              switch (e) {
                case "photos":
                  a.find(".stats-realTime-photoCount").html(function() {
                    return 1E3 <= data.pending.photos ? 1E3 * Math.floor(data.pending.photos / 1E3) + "+" : 100 <= data.pending.photos ? 100 * Math.floor(data.pending.photos / 100) + "+" : "some"
                  });
                  c.filter("[data-stats-realTime='photos']").find(".stats-realTime-status[data-state='processing']").toggleClass("visible", !! b);
                  break;
                case "deduplication":
                  c.filter("[data-stats-realTime='photos']").find(".stats-realTime-status[data-state='deduplicating']").toggleClass("visible", !data.pending.photos && b);
                  break;
                default:
                  c.filter("[data-stats-realTime='" + e + "']").find(".stats-realTime-status[data-state='processing']").toggleClass("visible", b)
              }
            })
          })
        })();
        (function() {
          function c() {
            var d = Subscription.getInfo(),
              e;
            f.empty();
            "unlimited" === d.plan ? $("#template-subscription-unlimited").mustache({}).appendTo(f) : "monthly" !== d.plan && "yearly" !== d.plan || "active" !== d.payment ? $("#template-subscription-shutdown").mustache({
              totalDays: 30,
              daysLeft: d.planDaysLeft,
              isPlural: 1 !== d.planDaysLeft,
              dayOfReckoning: d.planExpirationDate.toString(EXPIRATION_TIMESTAMP_FORMAT)
            }).prependTo(f) : "stripe" === d.processor ? (e = {
                typely: d.plan.substr(0, 1).toUpperCase() + d.plan.substr(1),
                cardError: "unpaid" === d.payment
              }, _(d.stripeBillingInfo).isEmpty() ?
              e.hasCardInfo = !1 : $.extend(e, {
                hasCardInfo: !0,
                nextBilling: d.stripeBillingInfo.nextBillingDate ? d.stripeBillingInfo.nextBillingDate.toString(EXPIRATION_TIMESTAMP_FORMAT) : !1,
                cardType: d.stripeBillingInfo.paymentCard.type,
                lastFour: d.stripeBillingInfo.paymentCard.last4,
                cardExpiration: padStringToLength(d.stripeBillingInfo.paymentCard.expMonth, 2, "0", !0) + "/" + d.stripeBillingInfo.paymentCard.expYear,
                address: {
                  postal: d.stripeBillingInfo.paymentCard.billingAddress.zip,
                  country: COUNTRIES[d.stripeBillingInfo.paymentCard.billingAddress.country]
                }
              }),
              $("#template-subscription-details-stripe").mustache(e).appendTo(f), f.find("#subscription-details\\/editPlanType").on("click", function() {
                Subscription.editPlanType().done(function() {
                  a.popover.open();
                  MessageBars.buildNew(SUBSCRIPTION_MESSAGE_UPDATE_SUCCESS, {
                    insertElement: f
                  })
                }).fail(function() {
                  a.popover.open()
                })
              }), f.find("#subscription-details\\/editBillingInfo").on("click", function() {
                Subscription.editBillingInfo().done(function(c) {
                  c ? (a.popover.open(), MessageBars.buildNew(SUBSCRIPTION_MESSAGE_CANCEL_SUCCESS, {
                    insertElement: f
                  })) : (a.popover.open(), MessageBars.buildNew(SUBSCRIPTION_MESSAGE_UPDATE_SUCCESS, {
                    insertElement: f
                  }))
                }).fail(function() {
                  a.popover.open()
                })
              }), "unpaid" === d.payment && $("#template-subscription-countdown-unpaid").mustache({
                dayOfPaymentFailure: d.planExpirationDate.toString(EXPIRATION_TIMESTAMP_FORMAT),
                daysLeft: d.graceDaysLeft,
                isPlural: 1 !== d.graceDaysLeft,
                dayOfReckoning: d.graceExpirationDate.toString(EXPIRATION_TIMESTAMP_FORMAT)
              }).appendTo(f.find(".card-content"))) : "apple" === d.processor ? $("#template-subscription-details-apple").mustache({
              typely: d.plan.substr(0,
                1).toUpperCase() + d.plan.substr(1)
            }).appendTo(f) : $("#template-subscription-details-comped").mustache({
              typely: d.plan.substr(0, 1).toUpperCase() + d.plan.substr(1),
              expiration: d.planExpirationDate ? d.planExpirationDate.toString(EXPIRATION_TIMESTAMP_FORMAT) : !1
            }).appendTo(f)
          }

          function e() {
            var a = Subscription.getInfo();
            "monthly" !== a.plan && "yearly" !== a.plan || "active" !== a.payment ? c() : Subscription.retrieveBillingInfo().always(c)
          }
          var f = $("#preferences\\/billing");
          f.on({
            "activateTab.tabset": function() {
              e();
              PubHub.sub("Subscription/update",
                e)
            },
            "deactivateTab.tabset": function() {
              PubHub.drubSub("Subscription/update", e)
            }
          })
        })();
        (function() {
          function c(a) {
            f.find(".bonus-reward-friend").remove();
            a.rewards && a.rewards["referred-user"] && _(a.rewards["referred-user"]).each(function(a) {
              $("<span/>", {
                "class": "bonus-reward-friend completed",
                html: a.details,
                title: a.details
              }).appendTo(f)
            });
            _(a.invitesPending).each(function(a) {
              $("<span/>", {
                "class": "bonus-reward-friend",
                html: a,
                title: a
              }).appendTo(f)
            })
          }
          var e = $("#preferences\\/invite"),
            f = e.find(".bonus-reward");
          e.on({
            "activateTab.tabset": function() {
              FreeInfo.retrieve(!0).done(c).fail(function() {
                MessageBars.buildNew("Failed loading data. Please refresh the page.", {
                  extraClasses: "alert",
                  insertFunction: "prependTo",
                  insertElement: e
                })
              })
            }
          });
          e.find(".preferences-inviteLauncher").on("click", function() {
            FreeInfo.inviteFriends().always(function() {
              a.popover.open()
            })
          });
          PubHub.sub("Subscription/update", function() {
            a.$el.find(".tabset-tab[data-tab-id='invite']").toggleClass("hidden", "free" === Subscription.getInfo("plan"))
          });
          a.$el.find(".tabset-tab[data-tab-id='invite']").toggleClass("hidden", "free" === Subscription.getInfo("plan"))
        })();
        (function() {
          a.$el.on("click", ".preferences-nameLauncher", function() {
            var c = $("#template-preferences\\/account\\/name").mustache({
              first: User.getInfo("firstName"),
              last: User.getInfo("lastName")
            }).appendTo("body");
            c.on({
              "afterOpen.popover": function() {
                c.find("input").first().trigger("focus")
              },
              "beforeClose.popover": function(c) {
                a.popover.open()
              },
              "afterClose.popover": function() {
                c.popover().destruct()
              },
              "execute.asyncForm": function() {
                var a = $("#preferences\\/account\\/name\\/first").val(),
                  b = $("#preferences\\/account\\/name\\/last").val();
                a !== User.getInfo("firstName") || b !== User.getInfo("lastName") ? User.setInfo({
                  firstName: a,
                  lastName: b
                }).done(function() {
                  c.popover().close();
                  MessageBars.buildNew(USERINFO_MESSAGE_NAME_EDIT_SUCCESS, {
                    insertElement: $("#preferences\\/account")
                  })
                }).fail(function(a, b) {
                  c.asyncForm().unlock().always(function() {
                    c.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "Unexpected error, please try again. (code " +
                          b + ")"
                      }
                    })
                  })
                }) : c.popover().close()
              }
            });
            c.asyncForm();
            c.popover({
              isOpen: !0,
              closeButton: "back",
              fixedTop: 0.1
            })
          })
        })();
        (function() {
          a.$el.on("click", ".preferences-emailLauncher", function() {
            var c = $("#template-preferences\\/account\\/addEmail").mustache({}).appendTo("body"),
              e = $("#preferences\\/account\\/addEmail\\/email");
            c.on({
              "afterOpen.popover": function() {
                e.trigger("focus")
              },
              "beforeClose.popover": function(c) {
                a.popover.open()
              },
              "afterClose.popover": function() {
                c.popover().destruct()
              },
              "execute.asyncForm": function() {
                var a =
                  e.val().match(REGEX_EMAIL)[0];
                User.addEmail(a, void 0 === a || void 0).done(function() {
                  c.popover().close();
                  MessageBars.buildNew(USERINFO_MESSAGE_EMAIL_ADD_SUCCESS, {
                    insertElement: $("#preferences\\/account")
                  })
                }).fail(function(b, h) {
                  c.asyncForm().unlock().always(function() {
                    400 === h ? e.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "This is not a valid email address"
                      }
                    }) : 409 === h && 0 === b.indexOf("Email address already in use") ? e.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "There is already an account with this email"
                      }
                    }) :
                      409 === h && "Too many email addresses associated with account" === b ? e.trigger({
                        type: "validate",
                        validationData: {
                          result: !1,
                          message: "You already have the maximum ten emails on your account."
                        }
                      }) : 409 === h && 0 === b.indexOf("Trying to add email addresses") ? e.trigger({
                        type: "validate",
                        validationData: {
                          result: !1,
                          message: "There is already an account with this email"
                        }
                      }) : 412 === h ? (lastEmailAddress = a, e.trigger({
                        type: "validate",
                        validationData: {
                          result: !1,
                          message: "Is this email address correct?"
                        }
                      })) : c.trigger({
                        type: "validate",
                        validationData: {
                          result: !1,
                          message: "Unexpected error, please try again. (code " + h + ")"
                        }
                      })
                  })
                })
              }
            });
            c.asyncForm();
            c.popover({
              isOpen: !0,
              closeButton: "back",
              fixedTop: 0.1
            })
          })
        })();
        (function() {
          a.$el.on("click", ".preferences-passwordLauncher", function() {
            var c = $("#template-preferences\\/account\\/password").mustache({}).appendTo("body");
            c.on({
              "afterOpen.popover": function() {
                c.find("input").first().trigger("focus")
              },
              "beforeClose.popover": function(c) {
                a.popover.open()
              },
              "afterClose.popover": function() {
                c.popover().destruct()
              },
              "execute.asyncForm": function() {
                var a = $("#preferences\\/account\\/password\\/current").val(),
                  b = $("#preferences\\/account\\/password\\/new").val();
                User.changePassword(a, b).done(function() {
                  c.popover().close();
                  MessageBars.buildNew(USERINFO_MESSAGE_PASSWORD_CHANGE_SUCCESS, {
                    insertElement: $("#preferences\\/account")
                  })
                }).fail(function(a, b) {
                  c.asyncForm().unlock().always(function() {
                    403 === b ? $("#preferences\\/account\\/password\\/current").trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "Password is incorrect"
                      }
                    }) :
                      400 === b && "Password too short" === a ? $("#preferences\\/account\\/password\\/new, #preferences\\/account\\/password\\/verify").trigger({
                        type: "validate",
                        validationData: {
                          result: !1,
                          message: "Must be at least 6 characters"
                        }
                      }) : c.trigger({
                        type: "validate",
                        validationData: {
                          result: !1,
                          message: "Unexpected error, please try again. (code " + b + ")"
                        }
                      })
                  })
                })
              }
            });
            c.asyncForm({
              validateTests: {
                matches: {
                  failureMessage: "Passwords must match."
                },
                minLength: {
                  failureMessage: function() {
                    return "Must be at least " + this.data("validation-minlength") +
                      " characters"
                  }
                }
              }
            });
            c.popover({
              isOpen: !0,
              closeButton: "back",
              fixedTop: 0.1
            })
          })
        })();
        (function() {
          a.$el.on("click", ".preferences-deleteLauncher", function() {
            var c = $("#template-delete").mustache({}).appendTo("body");
            c.on({
              "afterOpen.popover": function() {
                c.find("input").first().trigger("focus")
              },
              "beforeClose.popover": function(c) {
                a.popover.open()
              },
              "afterClose.popover": function() {
                c.popover().destruct()
              },
              "execute.asyncForm": function() {
                var a = $("#preferences\\/delete\\/password").val(),
                  b = $("#preferences\\/delete\\/reason").val() ||
                    null;
                User.baleet(a, b).fail(function(a, b) {
                  c.asyncForm().unlock().always(function() {
                    403 === b ? $("#preferences\\/delete\\/password").trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "Invalid password"
                      }
                    }) : 409 === b ? c.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "You must unsubscribe from Everpix before deleting your account."
                      }
                    }) : c.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "Unexpected error, please try again. (code " + b + ")"
                      }
                    })
                  })
                })
              }
            });
            c.asyncForm({
              validateTests: {
                confirmDelete: {
                  applyTo: function() {
                    return "" !==
                      this.val() && this.is("[data-validation-confirmdelete]")
                  },
                  testVal: function() {
                    return "delete" === this.val().toLowerCase()
                  },
                  failureMessage: 'Please type "DELETE" above to confirm.'
                }
              }
            });
            c.popover({
              isOpen: !0,
              closeButton: "back",
              fixedTop: 0.1
            })
          })
        })();
        (function() {
          a.$el.on("click", ".preferences-flashbackEmailLauncher", function() {
            var c, e = $("#template-preferences\\/email\\/addFlashbackEmail").mustache({}).appendTo("body"),
              f = $("#preferences\\/email\\/addFlashbackEmail\\/email");
            e.on({
              "afterOpen.popover": function() {
                User.hasFeature("forwardFlashbacks") ?
                  f.trigger("focus") : (e.asyncForm().lock(null, !0), e.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: USERINFO_MESSAGE_FLASHBACKEMAIL_NONSUBSCRIBER
                    }
                  }))
              },
              "beforeClose.popover": function(c) {
                a.popover.open()
              },
              "afterClose.popover": function() {
                e.popover().destruct()
              },
              "execute.asyncForm": function() {
                var a = f.val().match(REGEX_EMAIL)[0];
                User.addFlashbackEmail(a, c === a || void 0).done(function() {
                  e.popover().close();
                  MessageBars.buildNew($.mustache(USERINFO_MESSAGE_FLASHBACKEMAIL_ADD_SUCCESS, {
                    email: a
                  }), {
                    insertElement: $("#preferences\\/email")
                  })
                }).fail(function(b,
                  k) {
                  e.asyncForm().unlock().always(function() {
                    400 === k ? f.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "This is not a valid email address"
                      }
                    }) : 409 === k && "Too many flashback email addresses associated with account" === b ? f.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "You already have the maximum ten flashback recipients on your account."
                      }
                    }) : 412 === k ? (c = a, f.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "Is this email address correct?"
                      }
                    })) : e.trigger({
                      type: "validate",
                      validationData: {
                        result: !1,
                        message: "Unexpected error, please try again. (code " + k + ")"
                      }
                    })
                  })
                })
              }
            });
            e.asyncForm();
            e.popover({
              isOpen: !0,
              closeButton: "back",
              fixedTop: 0.1
            })
          })
        })()
      })
    };
    return a
  }(),
  ConnectionsPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "connections");
    $.extend(!0, a, {
      state: "apps",
      allowedStates: ["apps", "web", "devices", "delete"],
      qOps: {}
    });
    a.activate = function() {
      var a = this;
      return Panel.prototype.activate.call(a).done(function() {
        a.updateDevicesTab();
        a.updateDeleteTab();
        Sources.refresh()
      })
    };
    a.deactivate = function() {
      return Panel.prototype.deactivate.call(this).done(function() {
        $.each(Sources.getConnections(), function() {
          this.cancelConnect()
        })
      })
    };
    a.setState = function(a) {
      var c = this;
      return Panel.prototype.setState.call(c, a).done(function() {
        c.tabset && c.tabset.select(c.state)
      })
    };
    a.build = function() {
      var a = this;
      return a.buildDfd ? a.buildDfd : Panel.prototype.build.call(a).done(function() {
        var c = a.$el.find(".tabset");
        a.tabset = c.tabset({
          tabLink: "#panel=connections/{{id}}"
        });
        c.on("switch.tabset", function(c,
          e, f) {
          c = a.tabset.$tabs.eq(e).data("tab-id");
          a.setState(c);
          a.tabset.$contents.eq(f).find(".messageBar").each(function() {
            $(this).data("messageBar").close()
          })
        });
        a.tabset.select(a.state);
        (function() {
          function c(a) {
            var b = e.find(".web-connection[data-service='" + a.service + "']");
            a.inProgress ? b.removeClass("unconnected").addClass("connecting") : a.isConnected ? (b.removeClass("unconnected connecting").addClass("connected"), a.syncPhotos ? (b.removeClass("sharingOnly"), b.toggleClass("broken", !a.syncActive), a.lastSync ?
              (b.removeClass("pending"), b.find(".web-connection-lastSync").html($.mustache(CONNECTION_LAST_SYNC_TEXT, {
                timeAgo: a.lastSync.relativeToNow("week", 1, null, null)
              }))) : (b.addClass("pending"), b.find(".web-connection-lastSync").html(""))) : b.addClass("sharingOnly")) : (b.removeClass("connecting connected sharingOnly broken pending").addClass("unconnected"), b.find(".web-connection-lastSync").html(""))
          }
          var e = $("#connections\\/web");
          e.find(".web-connection").each(function() {
            var e = $(this),
              g = e.attr("data-service"),
              h = Sources.getConnections(g);
            e.find(".web-connection-connect, .web-connection-reconnect").on("click", function(e) {
              $(this).hasClass("disabled") || h.connect(e.altKey).always(function() {
                a.popover.open();
                c(h)
              }).fail(function(c, d) {
                c && (c = "string" === $.type(c) ? c : $.mustache(CONNECTION_MESSAGE_CONNECT_ERROR, h), MessageBars.buildNew(c, {
                  extraClasses: "alert",
                  insertFunction: "prependTo",
                  insertElement: a.tabset.$contents.filter("[data-tab-id='web']")
                }))
              })
            });
            e.find(".web-connection-disconnect").on("click", function() {
              h.disconnect().always(function() {
                a.popover.open();
                c(h)
              }).done(function() {
                MessageBars.buildNew($.mustache(CONNECTION_MESSAGE_DISCONNECT_SUCCESS, h), {
                  insertFunction: "prependTo",
                  insertElement: a.tabset.$contents.filter("[data-tab-id='web']")
                })
              }).fail(function(c) {
                c && (c = "string" === $.type(c) ? c : $.mustache(CONNECTION_MESSAGE_DISCONNECT_ERROR, h), MessageBars.buildNew(c, {
                  extraClasses: "alert",
                  insertFunction: "prependTo",
                  insertElement: a.tabset.$contents.filter("[data-tab-id='web']")
                }))
              })
            });
            e.find(".web-connection-lastSync").on("click", function() {
              h.syncNow().done(function() {
                MessageBars.buildNew($.mustache(CONNECTION_MESSAGE_SYNC_SUCCESS,
                  h), {
                  insertFunction: "prependTo",
                  insertElement: a.tabset.$contents.filter("[data-tab-id='web']")
                })
              }).fail(function() {
                MessageBars.buildNew($.mustache(CONNECTION_MESSAGE_SYNC_ERROR, h), {
                  extraClasses: "alert",
                  insertFunction: "prependTo",
                  insertElement: a.tabset.$contents.filter("[data-tab-id='web']")
                })
              })
            });
            c(h)
          });
          PubHub.sub("WebConnection/update", c);
          e.on({
            "activateTab.tabset": function() {
              e.find(".card-scrollable").scrollPane().activate();
              a.procrastinate("updateWebScrollPane", function() {
                e.find(".card-scrollable").scrollPane().update()
              });
              MessageBars.buildNew("Sorry, web connections are currently disabled.", {
                extraClasses: "alert",
                insertFunction: "prependTo",
                insertElement: a.tabset.$contents.filter("[data-tab-id='web']"),
                closeAfter: 0
              })
            },
            "deactivateTab.tabset": function() {
              e.find(".card-scrollable").data("scrollPane") && e.find(".card-scrollable").scrollPane().deactivate()
            }
          });
          a.$el.on({
            "beforeOpen.popover": function() {
              e.hasClass("selected") && a.procrastinate("updateWebScrollPane", function() {
                e.find(".card-scrollable").scrollPane().update()
              })
            }
          })
        })();
        (function() {
          var c = $("#connections\\/devices");
          PubHub.sub("ConnectedDevices/refresh", function() {
            a.updateDevicesTab()
          });
          c.on({
            "activateTab.tabset": function() {
              c.find(".card-scrollable").scrollPane().activate().update()
            },
            "deactivateTab.tabset": function() {
              c.find(".card-scrollable").data("scrollPane") && c.find(".card-scrollable").scrollPane().deactivate()
            }
          });
          a.$el.on({
            "beforeOpen.popover": function() {
              c.hasClass("selected") && a.procrastinate("updateDevicesScrollPane", function() {
                c.find(".card-scrollable").scrollPane().update()
              })
            }
          })
        })();
        (function() {
          var c = $("#connections\\/delete");
          PubHub.sub("Sources/refresh", function() {
            a.updateDeleteTab()
          });
          c.on({
            "activateTab.tabset": function() {
              c.find(".sources-list").scrollPane().activate().update()
            },
            "deactivateTab.tabset": function() {
              c.find(".sources-list").data("scrollPane") && c.find(".sources-list").scrollPane().deactivate()
            }
          });
          a.$el.on({
            "beforeOpen.popover": function() {
              c.hasClass("selected") && a.procrastinate("updateDeleteScrollPane", function() {
                c.find(".card-scrollable").scrollPane().update()
              })
            }
          })
        })()
      })
    };
    a.updateDevicesTab = function() {
      var a = this,
        c = $("#connections\\/devices"),
        d = c.find(".devices"),
        e = d.find(".connections"),
        f = Sources.getConnectedDevicesArray();
      d.find(".device-connection, .devices-empty").remove();
      d.addClass("populated");
      f.length ? (d.removeClass("empty"), $.each(f, function(d, f) {
        var k = $("#template-device-connection").mustache($.extend({}, f, {
          timeAgo: f.refreshed.relativeToNow("week", 1, null, null),
          type: f.subtype || f.type
        })).appendTo(e.scrollPane().$pane);
        k.find(".device-connection-disconnect").on("click",
          function() {
            var d = $("#template-disconnect").mustache({
              source: f.uuid,
              title: f.name
            }).appendTo("body").on({
              "beforeClose.popover": function(c) {
                a.popover.open()
              },
              "afterClose.popover": function() {
                d.popover().destruct()
              },
              "execute.asyncForm": function() {
                Sources.disconnectDevice(f.uuid).done(function() {
                  k.empty().remove();
                  MessageBars.buildNew($.mustache(DEVICE_MESSAGE_DISCONNECT_SUCCESS, {
                    name: f.name
                  }), {
                    insertElement: c
                  })
                }).fail(function() {
                  MessageBars.buildNew($.mustache(DEVICE_MESSAGE_DISCONNECT_ERROR, {
                    name: f.name
                  }), {
                    extraClasses: "alert",
                    insertElement: c
                  })
                }).always(function() {
                  d.popover().close()
                })
              }
            });
            d.asyncForm();
            d.find(".cancelLink").on("click", function() {
              d.popover().close(!0)
            });
            d.popover({
              isOpen: !0,
              closeButton: "back"
            })
          })
      })) : (d.addClass("empty"), $("#template-devices-empty").mustache({}).appendTo(d));
      a.procrastinate("updateDevicesScrollPane", function() {
        e.scrollPane().update()
      })
    };
    a.updateDeleteTab = function() {
      function a(b) {
        var e = g.mustache(b).appendTo(f);
        e.find(".source-control-delete, .source-control-deleteAll").eq(0).on("click",
          function() {
            var a;
            a = $("#template-source-deleteWarning").mustache({
              name: b.name,
              warnDisconnect: b.isWeb && b.isConnected
            }).appendTo("body").on({
              "beforeClose.popover": function(a) {
                c.popover.open()
              },
              "afterClose.popover": function() {
                $(this).popover().destruct()
              },
              "execute.asyncForm": function() {
                b.isDevice ? Sources.deleteDevice(b.uuid).done(function() {
                  a.popover().close();
                  e.addClass("deleting").find(".source-control-delete").remove();
                  MessageBars.buildNew($.mustache(DEVICE_MESSAGE_DELETE_SUCCESS, {
                    name: b.name
                  }), {
                    insertElement: d
                  })
                }).fail(function(c,
                  e) {
                  412 === e ? a.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: $.mustache(DEVICE_MESSAGE_DELETE_PENDING, {
                        name: b.name
                      })
                    }
                  }) : (a.popover().close(), MessageBars.buildNew($.mustache(DEVICE_MESSAGE_DELETE_ERROR, {
                    name: b.name
                  }), {
                    extraClasses: "alert",
                    insertElement: d
                  }))
                }) : Sources.deleteSource(b.uuid).done(function() {
                  a.popover().close();
                  e.addClass("deleting").find(".source-control-delete").remove();
                  MessageBars.buildNew($.mustache(SOURCE_MESSAGE_DELETE_SUCCESS, {
                    name: b.name
                  }), {
                    insertElement: d
                  })
                }).fail(function(c,
                  e) {
                  412 === e ? a.trigger({
                    type: "validate",
                    validationData: {
                      result: !1,
                      message: $.mustache(SOURCE_MESSAGE_DELETE_PENDING, {
                        name: b.name
                      })
                    }
                  }) : (a.popover().close(), MessageBars.buildNew($.mustache(SOURCE_MESSAGE_DELETE_ERROR, {
                    name: b.name
                  }), {
                    extraClasses: "alert",
                    insertElement: d
                  }))
                })
              }
            });
            a.popover({
              isOpen: !0,
              closeButton: "back"
            });
            a.asyncForm();
            a.find(".cancelLink").on("click", function() {
              a.popover().close(!0)
            })
          });
        if (b.allowPurge) e.find(".source-control-purge").eq(0).on("click", function() {
          c.popover.close();
          Sources.purge(b).always(function() {
            c.popover.open()
          }).done(function() {
            MessageBars.buildNew($.mustache(SOURCE_MESSAGE_PURGE_SUCCESS, {
              name: b.name
            }), {
              insertElement: d
            })
          }).fail(function(a, c) {
            c && MessageBars.buildNew($.mustache(SOURCE_MESSAGE_PURGE_ERROR, {
              name: b.name
            }), {
              extraClasses: "alert",
              insertElement: d
            })
          })
        });
        return e
      }
      var c = this,
        d = $("#connections\\/delete"),
        e = d.find(".sources"),
        f = e.find(".sources-list"),
        g = $("#template-source-listItem"),
        h = Sources.getSourcesArray();
      delete c.qOps.updateDeleteTab;
      e.find(".source, .sources-empty").remove();
      e.addClass("populated");
      $.isEmptyObject(h) ? (e.addClass("empty"), $("#template-sources-empty").mustache({}).appendTo(e)) :
        (e.removeClass("empty"), $.each(h, function(c, d) {
        var e = a(d).appendTo(f.scrollPane().$pane).find(".source-subSources");
        d.hasSubSources && $.each(d.subSources, function(c, d) {
          a(d).appendTo(e)
        })
      }));
      c.procrastinate("updateDeleteScrollPane", function() {
        f.scrollPane().update()
      })
    };
    return a
  }(),
  BonusPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "bonus");
    a.activate = function() {
      var a = this;
      return Panel.prototype.activate.call(a).done(function() {
        a.popover.open().done(function() {
          a.scrollPane.activate()
        });
        FreeInfo.retrieve(!0).fail(function() {
          MessageBars.buildNew("Failed loading data. Please refresh the page.", {
            extraClasses: "alert",
            insertFunction: "appendTo",
            insertElement: a.$el
          })
        }).done(function() {
          MessageBars.buildNew("Sorry, bonuses are currently disabled.", {
            extraClasses: "alert",
            insertFunction: "appendTo",
            insertElement: a.$el,
            closeAfter: 0
          })
        })
      })
    };
    a.deactivate = function(a) {
      var c = this;
      return Panel.prototype.deactivate.call(c, a).done(function() {
        c.scrollPane.deactivate()
      })
    };
    a.build = function() {
      var a = this;
      return a.buildDfd ?
        a.buildDfd : Panel.prototype.build.call(a).done(function() {
          $("#template-free-status").mustache({}).insertBefore(a.$el.find(".bonus-rewards"));
          a.$el.find(".bonus-reward[data-reward='desktop-uploader']").find("a").attr("href", "Mac" === Platform.os ? "#panel=mac-uploader" : "#panel=windows-uploader");
          a.$el.find(".bonus-inviteLauncher").on("click", function() {
            FreeInfo.inviteFriends().always(function() {
              a.popover.open()
            })
          });
          a.scrollPane = a.$el.find(".bonus-rewards").scrollPane();
          a.$el.on({
            "beforeOpen.popover": function() {
              a.procrastinate("updateScrollPane",
                function() {
                  a.scrollPane.update()
                })
            }
          })
        })
    };
    a.renderInfo = function(a) {
      var c = this;
      if (c.$el) {
        var d = c.$el.find(".bonus-reward[data-reward='referred-user']");
        c.$el.find(".bonus-reward.achieved").removeClass("achieved");
        c.$el.find(".bonus-reward-friend").remove();
        _(a.rewards).each(function(a, b) {
          var d = c.$el.find(".bonus-reward[data-reward='" + b + "']"),
            h = 0;
          "referred-user" === b ? _(a).each(function(a, b) {
            h += a.points;
            $("<span/>", {
              "class": "bonus-reward-friend completed",
              html: a.details,
              title: a.details
            }).appendTo(d)
          }) :
            h = a[0].points;
          d.addClass("achieved");
          d.find(".bonus-reward-value-earned").text(h)
        });
        _(a.invitesPending).each(function(a) {
          $("<span/>", {
            "class": "bonus-reward-friend",
            html: a,
            title: a
          }).appendTo(d)
        });
        c.procrastinate("updateScrollPane", function() {
          c.scrollPane.update()
        });
        c.$el.find(".free-status-photoCount").text(_(a.numAccessiblePhotos).isNumber() ? a.numAccessiblePhotos : "");
        c.$el.find(".free-status-monthCount").text(a.accessibleMonths || 12);
        c.$el.find(".free-timeline").attr("data-start", a.minDeferredYear ||
          "");
        c.$el.find(".free-timeline-accessible").attr("data-start", a.accessibleMonths || 12);
        c.$el.find(".free-timeline-bonus").attr("data-months", a.bonusMonths || 0)
      }
    };
    PubHub.sub("FreeInfo/retrieve", function(b) {
      a.renderInfo(b)
    });
    return a
  }(),
  PhotoPagesPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "photopages");
    a.activate = function() {
      var a = this;
      return Panel.prototype.activate.call(a).done(function() {
        a.popover.open().done(function() {
          a.scrollPane.activate()
        });
        a.retrieveSnapshots()
      })
    };
    a.deactivate =
      function() {
        var a = this;
        return Panel.prototype.deactivate.call(a).done(function() {
          a.scrollPane.deactivate()
        })
    };
    a.build = function() {
      var a = this;
      return a.buildDfd ? a.buildDfd : Panel.prototype.build.call(a).done(function() {
        a.scrollPane = a.$el.find(".photoPages-list").scrollPane();
        a.$el.on({
          "beforeOpen.popover": function() {
            a.procrastinate("updateScrollPane", function() {
              a.scrollPane.update()
            })
          }
        })
      })
    };
    a.retrieveSnapshots = function() {
      var a = this,
        c, d, e;
      a.$el && (c = a.$el.find(".photoPages"), d = c.find(".photoPages-list"),
        c.hasClass("populated") || (e = c.find(".spinner").spinner({
          showing: !0,
          showAfter: 0
        })), PhotoPages.fetchAll().done(function() {
          function f() {
            var a = _(g).size();
            c.find(".photoPages-count").html($.mustache(PHOTOPAGELIST_COUNT, {
              count: a,
              isPlural: 1 !== a
            }))
          }
          var g = PhotoPages.items,
            h = $("#template-photoPage-listItem");
          e && (c.addClass("populated"), e.hide());
          d.find(".photoPage-listItem").remove();
          _(g).isEmpty() ? c.addClass("empty") : (c.removeClass("empty"), _(g).each(function(c) {
            var e = h.mustache($.extend({
              id: c.id,
              title: c.makeString("title"),
              linkToPage: !0,
              url: c.url,
              photoCount: c.photoCount,
              isPlural: 1 !== c.photoCount,
              date: c.timestamp.toString(PHOTOPAGELIST_DATE_FORMAT),
              formattedDate: 1 < c.timestamp.diffMonths($.now()) ? c.timestamp.toString(PHOTOPAGELIST_DATE_FORMAT) : c.timestamp.relativeToNow(),
              thumbnailSrc: c.keyPhotos.countItems() ? Thumbnails.generateURL(c.keyPhotos.items[0].thumbnailID, THUMBNAIL_SIZE_TINY) : "",
              controls: {
                baleet: !0,
                edit: !0
              }
            })).appendTo(d.scrollPane().$pane);
            e.find(".photoPage-listItem-delete").on("click", function() {
              c.baleet().done(function() {
                a.retrieveSnapshots();
                a.popover.open()
              }).fail(function(c, d) {
                a.popover.open();
                d && MessageBars.buildNew(PHOTOPAGELIST_MESSAGE_DELETE_ERROR, {
                  extraClasses: "alert",
                  insertFunction: "appendTo",
                  insertElement: a.$el
                })
              })
            });
            e.find(".photoPage-listItem-edit").on("click", function() {
              a.deactivate();
              c.editFromPanel().done(function() {
                a.retrieveSnapshots();
                a.activate()
              }).fail(function(c, d) {
                a.activate();
                d && MessageBars.buildNew(PHOTOPAGELIST_MESSAGE_UPDATE_ERROR, {
                  extraClasses: "alert",
                  insertFunction: "appendTo",
                  insertElement: a.$el
                })
              })
            })
          }), a.procrastinate("updateScrollPane",
            function() {
              a.scrollPane.update()
            }), f())
        }).fail(function() {
          e && e.hide();
          MessageBars.buildNew(PHOTOPAGELIST_MESSAGE_LIST_ERROR, {
            extraClasses: "alert",
            insertFunction: "appendTo",
            insertElement: a.$el
          })
        }))
    };
    return a
  }(),
  MacUploaderPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "mac-uploader");
    $.extend(!0, a, {
      checkLoopTimer: null,
      checkLoopInterval: WELCOME_DOWNLOAD_CHECKLOOP_INTERVAL,
      checkLoopCounter: WELCOME_DOWNLOAD_CHECKLOOP_COUNT,
      checkLoopFailures: WELCOME_DOWNLOAD_CHECKLOOP_FAILS,
      isTrackingSteps: !1
    });
    a.activate = function() {
      var a = this;
      return Panel.prototype.activate.call(a).done(function() {
        "Mac" === Platform.os && (Downloader.get(MAC_UPLOADER_URL), a.startTrackingSteps())
      })
    };
    a.deactivate = function() {
      var a = this;
      return Panel.prototype.deactivate.call(a).done(function() {
        a.popover.close().always(function() {
          a.stopTrackingSteps()
        })
      })
    };
    a.build = function() {
      var a = this;
      return a.buildDfd ? a.buildDfd : Panel.prototype.build.call(a).done(function() {
        a.$el.find(".appDownload-mac").on("click", function() {
          Downloader.get(MAC_UPLOADER_URL);
          a.startTrackingSteps()
        })
      })
    };
    a.startTrackingSteps = function() {
      function a() {
        var f;
        if (0 < c.checkLoopCounter) {
          f = $.Deferred();
          switch (e) {
            case 0:
              Sources.refresh("connectedDevices").done(function() {
                _(Sources.getConnectedDevices()).any(function(a) {
                  return "mac" === a.type
                }) ? f.resolve() : f.reject()
              }).fail(function() {
                f.reject(!0)
              });
              break;
            case 1:
              Sources.deviceTypeIsSynced("mac").done(function(a) {
                a ? f.resolve() : f.reject()
              }).fail(function() {
                f.reject(!0)
              });
              break;
            case 2:
              f.resolve()
          }
          f.done(function() {
            switch (e) {
              case 0:
              case 1:
                d.eq(e).removeClass("inProgress").addClass("complete");
                e++;
                d.eq(e).addClass("inProgress");
                a();
                break;
              case 2:
                d.eq(e).addClass("complete"), c.$el.removeClass("inProgress").addClass("complete")
            }
          }).fail(function(d) {
            d ? (c.checkLoopFailures--, c.checkLoopFailures || (c.checkLoopCounter = 0)) : c.checkLoopCounter--;
            c.checkLoopTimer = setTimeout(a, c.checkLoopInterval)
          })
        }
      }
      var c = this,
        d = c.$el.find(".install-step"),
        e = 0;
      c.isTrackingSteps || (c.isTrackingSteps = !0, c.$el.addClass("inProgress"), d.eq(0).addClass("inProgress"), a())
    };
    a.stopTrackingSteps = function() {
      var a = this;
      if (a.isTrackingSteps ||
        a.checkLoopTimer) a.isTrackingSteps = !1, _(function() {
        clearTimeout(a.checkLoopTimer)
      }).defer(), a.$el.removeClass("inProgress complete"), a.$el.find(".install-step").removeClass("inProgress complete")
    };
    return a
  }(),
  WindowsUploaderPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "windows-uploader");
    $.extend(!0, a, {
      checkLoopTimer: null,
      checkLoopInterval: WELCOME_DOWNLOAD_CHECKLOOP_INTERVAL,
      checkLoopCounter: WELCOME_DOWNLOAD_CHECKLOOP_COUNT,
      checkLoopFailures: WELCOME_DOWNLOAD_CHECKLOOP_FAILS,
      isTrackingSteps: !1
    });
    a.activate = function() {
      var a = this;
      return Panel.prototype.activate.call(a).done(function() {
        "Windows" === Platform.os && (Downloader.get(WINDOWS_UPLOADER_URL), a.startTrackingSteps())
      })
    };
    a.deactivate = function() {
      var a = this;
      return Panel.prototype.deactivate.call(a).done(function() {
        a.popover.close().always(function() {
          a.stopTrackingSteps();
          a.$el.find(".card-details").removeClass("visible").height(0)
        })
      })
    };
    a.build = function() {
      var a = this;
      return a.buildDfd ? a.buildDfd : Panel.prototype.build.call(a).done(function() {
        a.$el.find(".appDownload-windows").on("click",
          function() {
            var c = a.$el.find(".card-details"),
              d = 0;
            Downloader.get(WINDOWS_UPLOADER_URL);
            a.startTrackingSteps();
            c.hasClass("visible") || (c.children().each(function() {
              d += $(this).outerHeight(!0)
            }), c.addClass("visible").height(d))
          });
        a.$el.find(".appDownload-windowsFull").on("click", function() {
          Downloader.get(WINDOWS_UPLOADER_EXE_URL);
          a.startTrackingSteps()
        })
      })
    };
    a.startTrackingSteps = function() {
      function a() {
        var f;
        if (0 < c.checkLoopCounter) {
          f = $.Deferred();
          switch (e) {
            case 0:
              Sources.refresh("connectedDevices").done(function() {
                _(Sources.getConnectedDevices()).any(function(a) {
                  return "windows" ===
                    a.type
                }) ? f.resolve() : f.reject()
              }).fail(function() {
                f.reject(!0)
              });
              break;
            case 1:
              Sources.deviceTypeIsSynced("windows").done(function(a) {
                a ? f.resolve() : f.reject()
              }).fail(function() {
                f.reject(!0)
              });
              break;
            case 2:
              f.resolve()
          }
          f.done(function() {
            switch (e) {
              case 0:
              case 1:
                d.eq(e).removeClass("inProgress").addClass("complete");
                e++;
                d.eq(e).addClass("inProgress");
                a();
                break;
              case 2:
                d.eq(e).addClass("complete"), c.$el.removeClass("inProgress").addClass("complete")
            }
          }).fail(function(d) {
            d ? (c.checkLoopFailures--, c.checkLoopFailures ||
              (c.checkLoopCounter = 0)) : c.checkLoopCounter--;
            c.checkLoopTimer = setTimeout(a, c.checkLoopInterval)
          })
        }
      }
      var c = this,
        d = c.$el.find(".install-step"),
        e = 0;
      c.isTrackingSteps || (c.isTrackingSteps = !0, c.$el.addClass("inProgress"), d.eq(0).addClass("inProgress"), a())
    };
    a.stopTrackingSteps = function() {
      var a = this;
      if (a.isTrackingSteps || a.checkLoopTimer) a.isTrackingSteps = !1, _(function() {
        clearTimeout(a.checkLoopTimer)
      }).defer(), a.$el.removeClass("inProgress complete"), a.$el.find(".install-step").removeClass("inProgress complete")
    };
    return a
  }(),
  IOSAppPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "ios-app");
    $.extend(!0, a, {
      checkLoopTimer: null,
      checkLoopInterval: WELCOME_DOWNLOAD_CHECKLOOP_INTERVAL,
      checkLoopCounter: WELCOME_DOWNLOAD_CHECKLOOP_COUNT,
      checkLoopFailures: WELCOME_DOWNLOAD_CHECKLOOP_FAILS,
      isTrackingSteps: !1
    });
    a.build = function() {
      var a = this;
      return a.buildDfd ? a.buildDfd : Panel.prototype.build.call(a).done(function() {
        a.$el.find(".iosApp-email").on("click", function() {
          var c = $(this);
          c.addClass("spinning").attr("disabled", !0);
          User.requestNotification("ios_apps").always(function() {
            c.removeClass("spinning").removeAttr("disabled")
          }).done(function() {
            MessageBars.buildNew("An email has been sent!", {
              insertFunction: "appendTo",
              insertElement: a.$el
            })
          }).fail(function() {
            MessageBars.buildNew("Oops, something went wrong. Please try again.", {
              extraClasses: "alert",
              insertFunction: "appendTo",
              insertElement: a.$el
            })
          });
          PubHub.pub("App/request", "ios", "emailMe");
          a.startTrackingSteps()
        });
        a.$el.find("a.button").on("click", function() {
          PubHub.pub("App/request",
            "ios", "itunes");
          a.startTrackingSteps()
        })
      })
    };
    a.deactivate = function() {
      var a = this;
      return Panel.prototype.deactivate.call(a).done(function() {
        a.popover.close().always(function() {
          a.stopTrackingSteps()
        })
      })
    };
    a.startTrackingSteps = function() {
      function a() {
        var f;
        if (0 < c.checkLoopCounter) {
          f = $.Deferred();
          switch (e) {
            case 0:
              Sources.refresh("connectedDevices").done(function() {
                _(Sources.getConnectedDevices()).any(function(a) {
                  return "ios" === a.type
                }) ? f.resolve() : f.reject()
              }).fail(function() {
                f.reject(!0)
              });
              break;
            case 1:
              Sources.deviceTypeIsSynced("ios").done(function(a) {
                a ?
                  f.resolve() : f.reject()
              }).fail(function() {
                f.reject(!0)
              });
              break;
            case 2:
              f.resolve()
          }
          f.done(function() {
            switch (e) {
              case 0:
              case 1:
                d.eq(e).removeClass("inProgress").addClass("complete");
                e++;
                d.eq(e).addClass("inProgress");
                a();
                break;
              case 2:
                d.eq(e).addClass("complete"), c.$el.removeClass("inProgress").addClass("complete")
            }
          }).fail(function(d) {
            d ? (c.checkLoopFailures--, c.checkLoopFailures || (c.checkLoopCounter = 0)) : c.checkLoopCounter--;
            c.checkLoopTimer = setTimeout(a, c.checkLoopInterval)
          })
        }
      }
      var c = this,
        d = c.$el.find(".install-step"),
        e = 0;
      c.isTrackingSteps || (c.isTrackingSteps = !0, c.$el.addClass("inProgress"), d.eq(0).addClass("inProgress"), a())
    };
    a.stopTrackingSteps = function() {
      var a = this;
      if (a.isTrackingSteps || a.checkLoopTimer) a.isTrackingSteps = !1, _(function() {
        clearTimeout(a.checkLoopTimer)
      }).defer(), a.$el.removeClass("inProgress complete"), a.$el.find(".install-step").removeClass("inProgress complete")
    };
    return a
  }(),
  AndroidUploaderPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "android-uploader");
    $.extend(!0,
      a, {
        checkLoopTimer: null,
        checkLoopInterval: WELCOME_DOWNLOAD_CHECKLOOP_INTERVAL,
        checkLoopCounter: WELCOME_DOWNLOAD_CHECKLOOP_COUNT,
        checkLoopFailures: WELCOME_DOWNLOAD_CHECKLOOP_FAILS,
        isTrackingSteps: !1
      });
    a.build = function() {
      var a = this;
      return a.buildDfd ? a.buildDfd : Panel.prototype.build.call(a).done(function() {
        a.$el.find(".androidUploader-email").on("click", function() {
          var c = $(this);
          c.addClass("spinning").attr("disabled", !0);
          User.requestNotification("android_apps").always(function() {
            c.removeClass("spinning").removeAttr("disabled")
          }).done(function() {
            MessageBars.buildNew("An email has been sent!", {
              insertFunction: "appendTo",
              insertElement: a.$el
            })
          }).fail(function() {
            MessageBars.buildNew("Oops, something went wrong. Please try again.", {
              extraClasses: "alert",
              insertFunction: "appendTo",
              insertElement: a.$el
            })
          });
          PubHub.pub("App/request", "android", "emailMe");
          a.startTrackingSteps()
        });
        a.$el.find("a.button").on("click", function() {
          PubHub.pub("App/request", "android", "googlePlay");
          a.startTrackingSteps()
        })
      })
    };
    a.deactivate = function() {
      var a = this;
      return Panel.prototype.deactivate.call(a).done(function() {
        a.popover.close().always(function() {
          a.stopTrackingSteps()
        })
      })
    };
    a.startTrackingSteps = function() {
      function a() {
        var f;
        if (0 < c.checkLoopCounter) {
          f = $.Deferred();
          switch (e) {
            case 0:
              Sources.refresh("connectedDevices").done(function() {
                _(Sources.getConnectedDevices()).any(function(a) {
                  return "android" === a.type
                }) ? f.resolve() : f.reject()
              }).fail(function() {
                f.reject(!0)
              });
              break;
            case 1:
              Sources.deviceTypeIsSynced("android").done(function(a) {
                a ? f.resolve() : f.reject()
              }).fail(function() {
                f.reject(!0)
              });
              break;
            case 2:
              f.resolve()
          }
          f.done(function() {
            switch (e) {
              case 0:
              case 1:
                d.eq(e).removeClass("inProgress").addClass("complete");
                e++;
                d.eq(e).addClass("inProgress");
                a();
                break;
              case 2:
                d.eq(e).addClass("complete"), c.$el.removeClass("inProgress").addClass("complete")
            }
          }).fail(function(d) {
            d ? (c.checkLoopFailures--, c.checkLoopFailures || (c.checkLoopCounter = 0)) : c.checkLoopCounter--;
            c.checkLoopTimer = setTimeout(a, c.checkLoopInterval)
          })
        }
      }
      var c = this,
        d = c.$el.find(".install-step"),
        e = 0;
      c.isTrackingSteps || (c.isTrackingSteps = !0, c.$el.addClass("inProgress"), d.eq(0).addClass("inProgress"), a())
    };
    a.stopTrackingSteps = function() {
      var a = this;
      if (a.isTrackingSteps ||
        a.checkLoopTimer) a.isTrackingSteps = !1, _(function() {
        clearTimeout(a.checkLoopTimer)
      }).defer(), a.$el.removeClass("inProgress complete"), a.$el.find(".install-step").removeClass("inProgress complete")
    };
    return a
  }(),
  KeyboardPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "keyboard");
    a.activate = function() {
      var a = this;
      return Panel.prototype.activate.call(a).done(function() {
        a.popover.open().done(function() {
          a.$el.find(".keyboard-sections").scrollPane().activate()
        })
      })
    };
    a.deactivate = function() {
      var a =
        this;
      return Panel.prototype.deactivate.call(a).done(function() {
        a.$el.find(".keyboard-sections").scrollPane().deactivate()
      })
    };
    return a
  }(),
  UploadPanel = function() {
    var a = {};
    $.extend(!0, a, Panel.prototype);
    Panel.call(a, "upload");
    a.activate = function() {
      var a = this;
      return Modernizr.draganddrop ? Panel.prototype.activate.call(a).done(function() {
        var c = $("#template-upload-file"),
          d = a.$el.find(".upload-container"),
          e = a.$el.find(".upload-files");
        a.popover.open().always(function() {
          a.$el.find(".upload-files").scrollPane().activate()
        });
        d.on({
          "dragstart.upload": function(a) {
            a.originalEvent.dataTransfer.effectAllowed = "copy"
          },
          "dragover.upload": function(a) {
            a.originalEvent.dataTransfer.dropEffect = "copy";
            return !1
          },
          "drop.upload": function(a) {
            var b = a.originalEvent.dataTransfer,
              h = 0;
            b.files.length && d.removeClass("empty");
            for (h = 0; h < b.files.length; h++)(function() {
              var a = b.files[h],
                d;
              d = c.mustache({
                name: a.name
              }).appendTo(e.scrollPane().$pane);
              API.request("uploadPhoto", {
                file: a
              }).done(function() {
                d.attr("data-status", "complete")
              }).fail(function(a,
                b) {
                d.attr("data-status", "error");
                console.error(b + ": " + a)
              })
            })();
            setTimeout(function() {
              e.scrollPane().update()
            }, 0);
            return !1
          }
        })
      }) : $.Deferred().reject()
    };
    a.deactivate = function() {
      var a = this;
      return Panel.prototype.deactivate.call(a).done(function() {
        a.popover.close().always(function() {
          var c = a.$el.find(".upload-container"),
            d = a.$el.find(".upload-files");
          d.data("scrollPane") && d.scrollPane().deactivate();
          d.find(".upload-file").remove();
          c.addClass("empty").off(".upload")
        })
      })
    };
    API.define("uploadPhoto", "POST",
      "photo_upload", {
        contentType: !1,
        processData: !1,
        includeAuthToken: !1,
        data: {
          _ajax: void 0
        },
        dataMap: function(a) {
          var c = new FormData;
          c.append("_ajax", 1);
          c.append("_authtoken", User.getAuthToken());
          c.append("fileData", a.file);
          c.append("fileName", a.file.name);
          return c
        }
      });
    return a
  }();

function BubbleMenu(a, b) {
  var c = this;
  $.extend(c, {
    isOpen: !1,
    selector: "#" + a
  }, b, {
    id: a
  });
  PubHub.pub("BubbleMenu/construct", c);
  _.defer(function() {
    c.build().done(function() {
      Bubble.call(c, c.$el)
    })
  })
}
$.extend(!0, BubbleMenu.prototype, Bubble.prototype);
BubbleMenu.prototype.open = function(a) {
  var b = this,
    c = $.Deferred();
  b.isOpen ? c.reject() : b.build().done(function() {
    c.follow(Bubble.prototype.open.call(b, a).done(function() {
      PubHub.pub("BubbleMenu/open", b)
    }))
  }).fail(function() {
    c.reject()
  });
  return c.promise()
};
BubbleMenu.prototype.close = function(a) {
  var b = this;
  return Bubble.prototype.close.call(b, a).done(function() {
    PubHub.pub("BubbleMenu/close", b)
  })
};
BubbleMenu.prototype.build = function() {
  var a = this;
  a.buildDfd || (a.buildDfd = $.Deferred(), $(function() {
    a.$el = $(a.selector);
    a.buildDfd.resolve()
  }));
  return a.buildDfd
};
var YearsMenu = function() {
  var a = {};
  $.extend(!0, a, BubbleMenu.prototype, Procrastination.prototype);
  BubbleMenu.call(a, "yearsMenu");
  Procrastination.call(a);
  a.open = function() {
    var a = this;
    return BubbleMenu.prototype.open.call(a).done(function() {
      a.scrollPane.activate();
      a.procrastinate("updateScrollPane", function() {
        a.scrollPane.update()
      })
    })
  };
  a.close = function() {
    var a = this;
    return BubbleMenu.prototype.close.call(a).done(function() {
      a.scrollPane.deactivate()
    })
  };
  a.build = function() {
    var a = this;
    return a.buildDfd ? a.buildDfd :
      BubbleMenu.prototype.build.call(a).done(function() {
        a.$yearLinks = a.$el.find(".yearMenu-link");
        a.scrollPane = a.$el.find(".years-list").scrollPane();
        _(Years.list()).each(function(c) {
          a.addYear(c)
        })
      })
  };
  a.addYear = function(a) {
    var c = this,
      d, e = !1;
    c.$el && (d = $("#template-yearMenu-link").mustache({
      year: a
    }), c.$yearLinks.each(function() {
      var c = $(this);
      return a > c.data("year") ? (d.insertBefore(c), e = !0, !1) : !0
    }), e || d.appendTo(c.scrollPane.$pane), c.$yearLinks = c.$el.find(".yearMenu-link"), $("#navBar").find(".yearNav-selector").toggleClass("withMenu",
      1 < c.$yearLinks.length), c.procrastinate("updateScrollPane", function() {
      c.scrollPane.update()
    }))
  };
  a.removeYear = function(a) {
    var c = this;
    c.$el && (c.$yearLinks.filter("[data-year='" + a + "']").remove(), c.$yearLinks = c.$el.find(".yearMenu-link"), $("#navBar").find(".yearNav-selector").toggleClass("withMenu", 1 < c.$yearLinks.length), c.procrastinate("updateScrollPane", function() {
      c.scrollPane.update()
    }))
  };
  PubHub.sub("Years/add", function(b) {
    a.addYear(b)
  });
  PubHub.sub("Years/remove", function(b) {
    a.removeYear(b)
  });
  $(function() {
    _(Years.list()).each(a.addYear);
    $("#navBar").find(".yearNav-selector").on({
      mousedown: function() {
        return !a.isOpen
      },
      click: function() {
        !$(this).hasClass("disabled") && 1 < a.$yearLinks.length && (a.isOpen ? a.close() : a.open());
        return !1
      }
    })
  });
  return a
}(),
  SelectionMenu = function() {
    var a = {};
    $.extend(!0, a, BubbleMenu.prototype);
    BubbleMenu.call(a, "selectionMenu");
    a.build = function() {
      var a = this;
      return a.buildDfd ? a.buildDfd : BubbleMenu.prototype.build.call(a).done(function() {
        a.$el.find(".selectionMenu-all").on("click", function() {
          var a = Views.getActive();
          a && _(a.selectors).invoke("selectAll")
        });
        a.$el.find(".selectionMenu-none").on("click", function() {
          var a = Views.getActive();
          a && _(a.selectors).invoke("deselectAll")
        })
      })
    };
    $(function() {
      $(".navBar-selection-status").on({
        mousedown: function() {
          return !a.isOpen
        },
        click: function(b) {
          (b = Selections.getCurrent()) && b.includeSelectionMenu && (a.isOpen ? a.close() : a.open());
          return !1
        }
      })
    });
    return a
  }();
(function() {
  function a(a) {
    $.isPlainObject(a) || (a = {});
    window.location.hash && (a.state = encodeURIComponent(window.location.hash.substr(1)));
    window.location = Page.all.landing + ($.isEmptyObject(a) ? "" : "?" + $.param(a))
  }
  var b = $.Deferred();
  $(function() {
    Initializer.on(b)
  });
  User.getAuthToken() ? Platform.canLogin ? (BlockingActivity.show("index.html-load", "Loading&hellip;"), b.always(function() {
    _(function() {
      BlockingActivity.hide("index.html-load")
    }).defer()
  }).fail(function() {
    $(function() {
      $("#template-loadingError").mustache({}).appendTo("body").popover({
        isOpen: !0,
        closeButton: !1,
        clickOutsideToClose: !1,
        pressEscToClose: !1
      })
    })
  }), AppStatus.check().done(function() {
    User.init().done(function() {
      $.when(Sources.refresh(), Years.init()).done(function() {
        "initial" !== User.getInfo("importState") && "connected-timeout" !== User.getInfo("importState") || Cookie.getRemote(COOKIE_SKIPWELCOME_NAME) ? b.resolve() : window.location = Page.all.welcome
      }).fail(function() {
        b.reject()
      })
    }).fail(function() {
      User.clearAuthToken();
      a({
        message: LANDING_MESSAGE_AUTHTOKEN_EXPIRED,
        action: "signin"
      })
    })
  }).fail(function() {
    a()
  })) :
    (User.clearAuthToken(), a()) : a()
})();
Initializer.ready(function() {
  $("a[href='" + Page.all.support + "']").on("click", function(a) {
    return User.getInfo("email").match(/@localhost$/) ? (a.preventDefault(), new MessageBar("Users with @localhost email addresses cannot access the support site.", {
      extraClasses: "alert"
    })) : !0
  })
});
(function() {
  var a = {
    "moments-year": "events",
    "moments-month": "events",
    moments: "events-empty",
    moment: "event",
    "highlights-year": "highlights",
    "highlights-month": "highlights",
    highlights: "highlights-empty",
    "sources-year": "albums",
    "sources-month": "albums",
    sources: "albums-empty",
    set: "album",
    photomails: "inmails",
    photomail: "inmail"
  }, b, c = 0;
  PubHub.sub("View/deactivate", function(d) {
    b = a[d.viewClass || d.id] || d.viewClass || d.id;
    _(d.sessions).each(function(a) {
      a.isLogged || (a.isLogged = !0, c += a.duration)
    })
  });
  PubHub.sub("View/activate",
    function(d) {
      d = a[d.viewClass || d.id] || d.viewClass || d.id;
      !b || _(["events", "albums", "highlights"]).contains(b) && d === b || (d = Math.floor(c / 1E3), Analytics.logEvent("showView", b, 1800 < d ? void 0 : d), b = void 0, c = 0)
    });
  PubHub.sub("Years/set", function(b) {
    var c = Views.getActive(),
      c = c ? a[c.viewClass || c.id] || c.viewClass || c.id : void 0;
    _(["events", "albums", "highlights"]).contains(c) && Analytics.logEvent("selectYear", c, b)
  });
  PubHub.sub("Flashback/fetch", function(a, b) {
    "random" === a && Analytics.logEvent("randomizeExplore", b)
  });
  PubHub.sub("Panel/deactivate",
    function(a) {
      a.popover.$el.one("afterClose.popover", function() {
        Analytics.logEvent("showPanel", a.id, Math.floor(a.popover.analytics.lastDuration / 1E3))
      })
    });
  PubHub.sub("InviteForm/open", function() {
    Analytics.logEvent("showInviteForm")
  });
  PubHub.sub("Photo/download", function(a) {
    Analytics.logEvent("savePhoto")
  });
  PubHub.sub("PhotoViewer/deactivate", function() {
    var a = 0;
    _(PhotoViewer.sessions).each(function(b) {
      b.isLogged || (b.isLogged = !0, a += b.duration)
    });
    Analytics.logEvent("showFullScreen", null, Math.floor(a / 1E3))
  });
  PubHub.sub("Downloader/get", function(a) {
    var b = {};
    b[MAC_UPLOADER_URL] = "mac";
    b[WINDOWS_UPLOADER_URL] = "windows";
    b[WINDOWS_UPLOADER_EXE_URL] = "windows_full";
    b[a] && Analytics.logEvent("downloadApp", b[a])
  });
  PubHub.sub("Notification/click", function(a) {
    a && Analytics.logEvent("openNotification", a)
  });
  PubHub.sub("Sharing/share", function(a, b) {
    "walgreens" === a && Analytics.logEvent("printWalgreens", null, b)
  });
  PubHub.sub("Subscription/bail", function() {
    Analytics.logEvent("bailSubscription")
  });
  PubHub.sub("Subscription/error",
    function(a, b) {
      Analytics.logEvent("failSubscription", null, null, {
        response: JSON.stringify(a),
        statusCode: b
      })
    });
  Initializer.ready(function() {
    function a(c) {
      b.stopTrackingSession(c);
      c = _(b.sessions).last();
      c.duration && Analytics.logEvent("runApp", null, Math.floor(c.duration / 1E3), null, c.stop / 1E3)
    }
    var b = new Tracking,
      c;
    $(window).on("mousemove.tracking click.tracking scroll.tracking", $.throttle(1E3, function() {
      var g = $.now();
      clearTimeout(c);
      c = setTimeout(function() {
        a(g);
        b.startTrackingSession()
      }, INACTIVE_MAX_DURATION)
    }));
    $(window).on("beforeunload.tracking", function() {
      a()
    });
    b.startTrackingSession()
  })
})();
