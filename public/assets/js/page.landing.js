/* Copyright 2011-2013 33cube, Inc. All rights reserved. */
var MessageBars = function() {
  return {
    buildNew: function(e, c) {
      return new MessageBar(e, c)
    }
  }
}(),
  Downloader = function() {
    var e;
    $(function() {
      e = $("<iframe/>", {
        id: "downloader"
      }).appendTo("body")
    });
    return {
      get: function(c) {
        Initializer.ready(function() {
          e && (e.removeAttr("src"), e.attr("src", c));
          PubHub.pub("Downloader/get", c)
        })
      }
    }
  }(),
  Popovers = function() {
    var e = {
      currentPopover: null,
      nextPopover: null,
      allPopovers: {},
      get: function(c) {
        return c ? this.allPopovers[c] : $.extend({}, this.allPopovers)
      },
      getOpen: function() {
        return this.currentPopover
      },
      open: function(c, e) {
        var d = this,
          b = $.Deferred();
        Initializer.ready(function() {
          d.currentPopover ? c !== d.currentPopover ? (d.nextPopover = c, d.currentPopover.close().always(function() {
            d.nextPopover = void 0;
            d.currentPopover = c;
            b.resolve()
          })) : b.reject() : (d.currentPopover = c, b.resolve())
        });
        return b.promise()
      },
      close: function(e, f) {
        var d = this,
          b = $.Deferred();
        d.currentPopover === e ? (f.always(function() {
          d.currentPopover === e && (d.currentPopover = void 0)
        }), b.resolve()) : b.reject();
        return b.promise()
      }
    };
    PubHub.sub("Popover/construct",
      function(c) {
        e.allPopovers[c.id] = c
      });
    PubHub.sub("Popover/destruct", function(c) {
      delete e.allPopovers[c.id]
    });
    return e
  }();

function ScreenshotSlideshow(e, c, f) {
  var d = this;
  $.extend(d, {
    selectedID: 0
  }, f, {
    $links: e,
    $imageContainer: c
  });
  d.$imageContainer.data("slideshow", d);
  d.$links.each(function() {
    var b = $(this),
      a = b.data("slide-id");
    $("<img/>").attr({
      src: b.find("a").attr("href"),
      "data-slide-id": a
    }).appendTo(d.$imageContainer);
    b.on("click", function(b) {
      d.goTo(a);
      b.preventDefault()
    })
  });
  d.$images = d.$imageContainer.find("img[data-slide-id]");
  d.numImages = d.$images.length;
  (function() {
    var b = d.selectedID;
    d.selectedID = null;
    d.goTo(b)
  })()
}
ScreenshotSlideshow.prototype.goTo = function(e) {
  $.isNumeric(e) && (e = this.$images.eq((e % this.numImages + this.numImages) % this.numImages).data("slide-id"));
  this.selectedID !== e && (this.$images.filter(".selected").removeClass("selected"), this.$images.filter("[data-slide-id='" + e + "']").addClass("selected"), this.$links.filter(".selected").removeClass("selected"), this.$links.filter("[data-slide-id='" + e + "']").addClass("selected"), this.selectedID = e, $(this).trigger("update.slideshow"));
  return this
};
(function() {
  function e() {
    Query.redirect ? window.location = Page.all[Query.redirect] || Query.redirect : Query.state ? window.location = Page.all.main + "#" + decodeURIComponent(Query.state) : "initial" !== User.getInfo("importState") && "connected-timeout" !== User.getInfo("importState") || Cookie.getRemote(COOKIE_SKIPWELCOME_NAME) ? window.location = Page.all.main : window.location = Page.all.welcome
  }

  function c(b) {
    var a;
    1 === b ? (a = function() {
      $(function() {
        $("#invite, #sign-in, #reset-password").each(function() {
          $(this).asyncForm().unlock()
        });
        f && (f.close(), f = null);
        void 0 === Query.state || Query.message || (window.location.hash = "sign-in", MessageBars.buildNew(LANDING_MESSAGE_SIGNIN_TO_CONTINUE))
      })
    }, Query.token && User.setAuthToken(Query.token), User.getAuthToken() ? User.refresh().done(function() {
      void 0 === Query.noredirect ? e() : a()
    }).fail(function() {
      User.clearAuthToken();
      a()
    }) : a()) : 0 === b ? $(function() {
      $("#invite, #sign-in, #reset-password").each(function() {
        $(this).asyncForm().lock(!1, !0)
      });
      f || (f = new MessageBar(LANDING_MESSAGE_API_ERROR, {
        extraClasses: "alert",
        closeAfter: 0,
        closeButton: !1,
        closeOnClick: !1
      }))
    }) : $(function() {
      $("#invite, #sign-in, #reset-password").each(function() {
        $(this).asyncForm().lock(!1, !0)
      })
    })
  }
  var f, d;
  (function() {
    var b = ["panel", "view"],
      a = window.location.hash.substr(1),
      d = {}, a = $.deparam(a);
    $.each(a, function(a, g) {
      -1 !== b.indexOf(a) && (d[a] = g)
    });
    $.isEmptyObject(d) || (Query.state = encodeURIComponent($.param(d)), window.location.hash = "")
  })();
  $(function() {
    if (Query.tagline) switch (Query.tagline) {
      case "rediscover":
        $(".intro-title").html("The smart photo album that helps you organize and rediscover your photo collection.");
        break;
      case "unlimited":
        $(".intro-title").html("Unlimited photos in the cloud. All your memories in your pocket.");
        break;
      case "everywhere":
        $(".intro-title").html("All your pictures in one place. All your memories ready to play.")
    }
    "iOS" === Platform.os && Query.app && ($(".header-link").filter(function() {
      return !!$(this).find("a[href='#pricing']").length
    }).remove(), $(".intro-freeBadge").remove());
    Modernizr.input.placeholder || ($("[placeholder]:not([type='password'])").on({
      focus: function() {
        var b = $(this);
        "" ===
          b.val() && b.removeClass("placeholder").val("")
      },
      blur: function() {
        var b = $(this),
          a = b.attr("placeholder");
        "" === b.val() && b.addClass("placeholder").val(a)
      }
    }).trigger("blur"), $("[placeholder]:not([type='password'])").parents("form").on("submit", function() {
      $(this).find("[placeholder]:not([type='password'])").each(function() {
        var b = $(this);
        b.val() === b.attr("placeholder") && b.val("")
      })
    }), $.fn.oldVal = $.fn.val, $.fn.val = function() {
      var b = $(this),
        a;
      if (arguments.length || b.is(":not([placeholder]:not([type='password']))")) return $.fn.oldVal.apply(this,
        arguments);
      a = b.attr("placeholder");
      b = b.oldVal();
      return b === a ? "" : b
    });
    $("#pricing, #unsupported").popover({
      handleHash: !0
    });
    $("#video").on({
      "afterOpen.popover": function() {
        var b = 568 >= Viewport.getWidth(),
          a;
        a = $(b ? "#template-video-native" : "#template-video-embed").mustache({}).appendTo(this);
        if (!b) $(window).on("message.vimeo", function(b) {
          switch (JSON.parse(b.originalEvent.data).event) {
            case "ready":
              a[0].contentWindow.postMessage(JSON.stringify({
                method: "addEventListener",
                value: "play"
              }), "http://player.vimeo.com");
              a[0].contentWindow.postMessage(JSON.stringify({
                method: "addEventListener",
                value: "finish"
              }), "http://player.vimeo.com");
              break;
            case "play":
              Analytics.logGAEvent("landingPage", "startVideo");
              break;
            case "finish":
              Analytics.logGAEvent("landingPage", "finishVideo")
          }
        })
      },
      "afterClose.popover": function() {
        $(this).empty();
        $(window).off("message.vimeo")
      }
    }).popover({
      handleHash: !0,
      fixedTop: 130
    });
    $("#adieu").on({
      "beforeOpen.popover": function() {
        Cookie.setLocal(COOKIE_SKIPADIEU_NAME, !0, COOKIE_SKIPADIEU_EXP)
      }
    }).popover({
      isOpen: !Cookie.getLocal(COOKIE_SKIPADIEU_NAME),
      handleHash: !0
    });
    (function() {
      var b = $("#pricing").find(".pricing-tier-learnMore"),
        a = b.find(".bubble").bubble();
      b.on({
        "mouseenter click": function() {
          a.open()
        },
        mouseleave: function() {
          a.close()
        }
      })
    })();
    (function() {
      var b = $("#pricing").find(".pricing-tier-details-disclaimer"),
        a = b.find(".bubble").bubble();
      b.on({
        "mouseenter click": function() {
          a.open()
        },
        mouseleave: function() {
          a.close()
        }
      })
    })();
    $(window).on("hashchange", function() {
      var b = window.location.hash,
        a;
      "#reset-password" === b ? ($("#header").addClass("show-resetPassword").removeClass("show-signIn"),
        $("#sign-in\\/email").val() ? $("#reset-password\\/email").val($("#sign-in\\/email").val()) : Query.email ? $("#reset-password\\/email").val(Query.email) : Cookie.getLocal(COOKIE_EMAIL_NAME) && $("#reset-password\\/email").val(Cookie.getLocal(COOKIE_EMAIL_NAME)), setTimeout(function() {
          $("#reset-password\\/email").trigger("focus")
        }, 0)) : "#sign-in" === b ? ($("#header").addClass("show-signIn").removeClass("show-resetPassword"), a = $("#sign-in\\/password"), $("#reset-password\\/email").val() ? $("#sign-in\\/email").val($("#reset-password\\/email").val()) :
        Query.email ? $("#sign-in\\/email").val(Query.email) : Cookie.getLocal(COOKIE_EMAIL_NAME) ? $("#sign-in\\/email").val(Cookie.getLocal(COOKIE_EMAIL_NAME)) : a = $("#sign-in\\/email"), $("#sign-in\\/remember").prop("checked", !! Cookie.getLocal(COOKIE_REMEMBER_NAME)), setTimeout(function() {
          a.trigger("focus")
        }, 0)) : $("#header").removeClass("show-signIn show-resetPassword")
    }).trigger("hashchange");
    Platform.canLogin && (Cookie.getLocal(COOKIE_EMAIL_NAME) && "" === window.location.hash) && (window.location.hash = "#sign-in");
    $("#invite").on("execute.asyncForm",
      function() {
        var b = $(this),
          a = $("#invite\\/email").val().match(REGEX_EMAIL)[0],
          e = {
            email: a,
            forceEmail: a === d ? 1 : 0,
            referrer: Query.referrer || void 0,
            campaign: Query.campaign || "Landing Page"
          }, c;
        e.origin = Query.origin ? Query.origin : Query.referrer ? "photomail" : Query.platform && Query.app ? Query.platform + "-" + Query.app : "web";
        c = User.invite(e);
        c.done(function(a) {
          Cookie.setLocal(COOKIE_EMAIL_NAME, e.email, COOKIE_EMAIL_EXP);
          b.addClass("hidden");
          !$.isNumeric(a.queueDelay) || 0 >= a.queueDelay ? a = !1 : 3600 > a.queueDelay ? (a = Math.floor(a.queueDelay /
            60), a = a + " minute" + (1 === a ? "" : "s")) : 86400 > a.queueDelay ? (a = Math.floor(a.queueDelay / 3600), a = a + " hour" + (1 === a ? "" : "s")) : 604800 > a.queueDelay ? (a = Math.floor(a.queueDelay / 86400), a = a + " day" + (1 === a ? "" : "s")) : (a = Math.floor(a.queueDelay / 604800), a = a + " week" + (1 === a ? "" : "s"));
          $("#template-invite-done").mustache({
            time: a
          }).insertAfter("#invite");
          setTimeout(function() {
            $("#invite\\/done").removeClass("hidden")
          }, 350);
          Analytics.logOptimizelyEvent("invite");
          Analytics.logGAEvent("landingPage", "invite")
        });
        c.fail(function(e,
          c) {
          b.asyncForm().unlock().always(function() {
            400 === c ? $("#invite\\/email").trigger({
              type: "validate",
              validationData: {
                result: !1,
                message: "This is not a valid email address"
              }
            }) : 409 === c ? $("#invite\\/email").trigger({
              type: "validate",
              validationData: {
                result: !1,
                message: "This email address is already in use."
              }
            }) : 412 === c ? (d = a, $("#invite\\/email").trigger({
              type: "validate",
              validationData: {
                result: !1,
                message: "Is this email address correct?"
              }
            })) : b.trigger({
              type: "validate",
              validationData: {
                result: !1,
                message: "Unexpected error, please try again. (code " +
                  c + ")"
              }
            })
          })
        })
      }).asyncForm();
    $("#sign-in").on("execute.asyncForm", function() {
      var b = $(this),
        a = $("#sign-in\\/email").val().match(REGEX_EMAIL)[0],
        d = $("#sign-in\\/password").val(),
        c = $("#sign-in\\/remember").is(":checked"),
        a = User.login(a, d, c);
      a.done(function(a, b) {
        Cookie.setLocal(COOKIE_EMAIL_NAME, a.email, COOKIE_EMAIL_EXP);
        c ? Cookie.setLocal(COOKIE_REMEMBER_NAME, c, COOKIE_REMEMBER_EXP) : Cookie.clearLocal(COOKIE_REMEMBER_NAME);
        e()
      });
      a.fail(function(a, b) {
        Cookie.setLocal(COOKIE_EMAIL_NAME, 'tom@metge.us', COOKIE_EMAIL_EXP);
        Cookie.setLocal(COOKIE_REMEMBER_NAME, true, COOKIE_REMEMBER_EXP)
        e()
      });
    }).asyncForm({
      validateTests: {
        email: {
          failureMessage: !1
        }
      }
    });
    $("#reset-password").on("execute.asyncForm", function() {
      var b = $(this),
        a = $("#reset-password\\/email").val(),
        a = User.getNewPassword(a);
      a.done(function() {
        b.asyncForm().unlock();
        $("#sign-in\\/password").val("");
        window.location.hash = "sign-in";
        MessageBars.buildNew("An email was sent with information on how to reset your password.")
      });
      a.fail(function(a, c) {
        b.asyncForm().unlock().always(function() {
          403 === c && ($("#reset-password\\/email").trigger({
              type: "validate",
              validationData: {
                result: !1
              }
            }).trigger("focus").trigger("select"),
            MessageBars.buildNew("Oops! Something went wrong. Please check the email address and try again.", {
              extraClasses: "alert",
              closeAfter: 0
            }));
          b.trigger({
            type: "validate",
            validationData: {
              result: !1
            }
          })
        })
      })
    }).asyncForm({
      validateTests: {
        email: {
          failureMessage: !1
        }
      }
    });
    $(function() {
      $("#appDownload").on("click", function() {
        Downloader.get(MAC_UPLOADER_SIGNUP_URL);
        Analytics.logOptimizelyEvent("downloadApp");
        Analytics.logGAEvent("landingPage", "downloadApp")
      })
    });
    "signup" === Query.action || "invite" === Query.action ? ($("#invite\\/email").trigger("focus"),
      Query.email && $("#invite\\/email").val(Query.email)) : "signin" === Query.action ? (window.location.hash = "sign-in", Query.email && $("#sign-in\\/email").val(Query.email)) : "reset" === Query.action ? (window.location.hash = "reset-password", Query.email && $("#reset-password\\/email").val(Query.email)) : $(window).trigger("hashchange");
    Query.message && setTimeout(function() {
      MessageBars.buildNew(_.escape(Query.message))
    }, 100)
  });
  Query.email && User.getAuthToken() && Query.email !== Cookie.getLocal(COOKIE_EMAIL_NAME) ? User.clearAuthToken() :
    Query.email && Query.token && User.setAuthToken(Query.token);
  PubHub.sub("AppStatus/update", function(b) {
    c(b)
  });
  Initializer.on(function() {
    var b = $.Deferred().fail(function() {
      $("#invite, #sign-in, #reset-password").each(function() {
        $(this).asyncForm().lock(!1, !0)
      })
    });
    Platform.canLogin ? Cookie.hasLocal ? b.follow(AppStatus.check()) : (b.reject(), MessageBars.buildNew(LANDING_MESSAGE_NOCOOKIES, {
      extraClasses: "alert",
      closeAfter: 0,
      closeButton: !1,
      closeOnClick: !1
    })) : (b.reject(), MessageBars.buildNew(LANDING_MESSAGE_UNSUPPORTED, {
      extraClasses: "alert",
      closeAfter: 0,
      closeButton: !1,
      closeOnClick: !1
    }));
    return b
  });
  $(function() {
    function b() {
      d = (d + 1) % c;
      a.removeClass("selected");
      a.eq(d).addClass("selected");
      setTimeout(b, LANDING_CAMERA_INTERVAL)
    }
    var a = $(".intro-camera"),
      c = a.length,
      d = -1;
    b()
  });
  $(function() {
    function b() {
      d = (d + 1) % c;
      a.removeClass("selected");
      a.eq(d).addClass("selected");
      setTimeout(b, LANDING_QUOTE_INTERVAL)
    }
    var a = $(".press-quote"),
      c = a.length,
      d = 0;
    setTimeout(b, LANDING_QUOTE_INTERVAL)
  });
  $(function() {
    function b() {
      $("<img/>", {
        src: "//www.googleadservices.com/pagead/conversion/992328252/?value=0&label=W2BBCOSB-AUQvPSW2QM&guid=ON&script=0"
      })
    }
    PubHub.sub("User/invite", b);
    PubHub.sub("Downloader/get", b)
  })
})();
