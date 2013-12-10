/* Copyright 2011-2013 33cube, Inc. All rights reserved. */
$.fn.showActionAlert = function(c, b) {
  var a = $(this),
    d;
  d = $("<div/>", {
    "class": "actionAlert",
    html: c,
    "data-icon": b
  }).prependTo(a);
  _(function() {
    d.remove()
  }).delay(ACTIONALERT_LIFESPAN)
};

function AsyncForm(c, b) {
  var a = this,
    d = c.find("input:submit");
  $.extend(!0, a, {
    isLocked: !1,
    validateTests: {
      required: {
        failureMessage: !1
      }
    },
    $shakeWhom: !0
  }, b, {
    $form: c,
    $submit: d
  });
  a.$form.data("asyncForm", a).on({
    "submit.asyncForm": function(b) {
      b.preventDefault();
      a.isLocked || a.$form.validate(a.validateTests)
    },
    "validate.asyncForm": function(b, c) {
      var d = b.validationData,
        g;
      d.result ? (a.markValid(), c || (a.lock(!0), a.$form.trigger("execute.asyncForm"))) : d.message ? (g = a.$form.find(".form-error"), g.length ? (g.html(d.message),
        a.markInvalid()) : (g = $("<span/>", {
        html: d.message,
        "class": "form-error"
      }), a.$form.find(".form-errors").length ? g.appendTo(a.$form.find(".form-errors")) : a.$submit.length && a.$submit.parents(".formField").length ? g.insertBefore(a.$submit.parents(".formField")) : g.appendTo(a.$form), setTimeout(function() {
        a.markInvalid()
      }, 0))) : (a.$form.find(".form-error").remove(), a.markInvalid())
    }
  });
  a.$form.find("input, textarea, select").on({
    "validate.asyncForm": function(b) {
      var c = $(this),
        d = c.parents(".formField"),
        g = b.validationData;
      b.stopPropagation();
      g.result || d.hasClass("invalid") || (g.message ? (b = d.find(".formField-error"), b.length ? (b.html(g.message), d.addClass("invalid")) : (b = $("<label/>", {
        "class": "formField-error",
        "for": c.attr("id"),
        html: g.message
      }).appendTo(d), setTimeout(function() {
        d.addClass("invalid")
      }, 0))) : (d.find(".formField-error").remove(), d.addClass("invalid")));
      a.markInvalid()
    },
    "focus.asyncForm change.asyncForm keyup.asyncForm": function(b) {
      var c = $(this); - 1 === [9, 13, 16, 17, 18].indexOf(b.which) && (c.parents(".formField").removeClass("invalid"),
        a.markValid())
    }
  });
  a.$form.find("input, textarea, select").each(function() {
    var a = $(this);
    a.data("initialValue", a.val() + "")
  });
  a.$form.find(".formField-label-info").each(function() {
    var a = $(this),
      b;
    if (a.find(".bubble"))
      if (b = a.find(".bubble").bubble({
        clickOutsideToClose: !1
      }), Modernizr.touch) a.on({
        click: function() {
          b.open();
          return !1
        }
      });
      else a.on({
        mouseenter: function() {
          b.open()
        },
        mouseleave: function() {
          b.close()
        }
      })
  });
  !0 === a.$shakeWhom ? a.$shakeWhom = a.$form : a.$shakeWhom.jquery || (a.$shakeWhom = void 0);
  a.isLocked &&
    (a.isLocked = !1, a.lock());
  return a
}
AsyncForm.prototype.lock = function(c, b, a) {
  this.$submit.each(function() {
    var a = $(this);
    _(c).isString() ? a.val(c) : c && a.attr("data-value-pending") && a.val(a.attr("data-value-pending"))
  });
  b || this.$submit.addClass("spinning");
  a || (b = this.$form.find("input, textarea, select").filter(":not(:disabled)").attr("disabled", !0).trigger("blur"), this.$lockedInputs && this.$lockedInputs.length ? this.$lockedInputs.add(b) : this.$lockedInputs = b);
  this.isLocked || (this.isLocked = !0, this.$form.addClass("locked"), PubHub.pub("asyncForm/lock",
    this));
  return this
};
AsyncForm.prototype.unlock = function(c) {
  var b = $.Deferred();
  c || this.$submit.removeClass("spinning");
  b.resolve();
  this.$lockedInputs && (this.$lockedInputs.removeAttr("disabled"), delete this.$lockedInputs);
  this.$submit.each(function() {
    var a = $(this);
    a.val(a.data("initialValue"))
  });
  this.isLocked && (this.isLocked = !1, this.$form.removeClass("locked"), PubHub.pub("asyncForm/unlock", this));
  return b.promise()
};
AsyncForm.prototype.markInvalid = function() {
  this.$form.hasClass("invalid") || (this.$form.addClass("invalid"), this.$shakeWhom && this.$shakeWhom.addClass("shakeIt"));
  return this
};
AsyncForm.prototype.markValid = function(c) {
  this.$form.removeClass("invalid");
  this.$shakeWhom && this.$shakeWhom.removeClass("shakeIt");
  c && this.$form.find(".formField.invalid").removeClass("invalid");
  return this
};
AsyncForm.prototype.clearInputs = function() {
  this.$form.find("input[type='text'], input[type='password'], input[type='email'], textarea, select").val("");
  this.$form.find("input[type='radio'], input[type='checkbox']").attr("checked", !1);
  return this
};
AsyncForm.prototype.resetInputs = function() {
  this.$form.find("input, textarea, select").each(function() {
    var c = $(this);
    void 0 !== c.data("initialValue") && c.val(c.data("initialValue"))
  });
  return this
};
AsyncForm.prototype.destruct = function() {
  this.$form.removeData("asyncForm").off(".asyncForm");
  this.$form.find(".bubble").each(function() {
    $(this).bubble().destruct()
  });
  this.unlock();
  PubHub.pub("asyncForm/destruct", this.$form)
};
$.fn.asyncForm = function(c) {
  var b = $(this);
  if (1 === b.length) return b.data("asyncForm") ? b.data("asyncForm") : new AsyncForm(b, c);
  b.each(function() {
    $(this).asyncForm(c)
  });
  return b
};
$.fn.validate = function(c) {
  var b = $(this),
    a = 0,
    d = 0;
  if (1 !== b.length || !b.is("form")) return !1;
  c = $.extend(!0, {
    required: {
      applyTo: function() {
        return this.is("[data-validation-required]")
      },
      testVal: function() {
        return this.is(":not(:checkbox, :radio)") && this.val().length || $("input:radio[name='" + this.attr("name") + "']:checked").length || this.is(":checked") ? !0 : !1
      },
      failureMessage: "This field is required"
    },
    number: {
      applyTo: function() {
        return "" !== this.val() && (this.is("[data-validation-number]") || this.is("input[type='number']"))
      },
      testVal: function() {
        return $.isNumeric(this.val())
      },
      failureMessage: "This must be a number"
    },
    email: {
      applyTo: function() {
        return "" !== this.val() && this.is("[data-validation-email]")
      },
      testVal: function() {
        return !!(this.val() || "").match(REGEX_EMAIL)
      },
      failureMessage: "This is not a valid email address"
    },
    minLength: {
      applyTo: function() {
        return "" !== this.val() && this.data("validation-minlength")
      },
      testVal: function() {
        return this.val().length >= this.data("validation-minlength")
      },
      failureMessage: function() {
        return "Must be at least " +
          this.data("validation-minlength") + " characters in length"
      }
    },
    maxLength: {
      applyTo: function() {
        return "" !== this.val() && this.data("validation-maxlength")
      },
      testVal: function() {
        return this.val().length <= this.data("validation-maxlength")
      },
      failureMessage: function() {
        return "Cannot exceed " + this.data("validation-maxlength") + " characters in length"
      }
    },
    minValue: {
      applyTo: function() {
        return "" !== this.val() && this.data("validation-minvalue")
      },
      testVal: function() {
        return +this.val() >= this.data("validation-minvalue")
      },
      failureMessage: function() {
        return "Cannot be less than " +
          this.data("validation-minvalue")
      }
    },
    maxValue: {
      applyTo: function() {
        return "" !== this.val() && this.data("validation-maxvalue")
      },
      testVal: function() {
        return +this.val() <= this.data("validation-maxvalue")
      },
      failureMessage: function() {
        return "Cannot be greater than " + this.data("validation-maxvalue")
      }
    },
    matches: {
      applyTo: function() {
        return this.data("validation-matches")
      },
      testVal: function() {
        return this.val() === $("#" + jqEscape(this.data("validation-matches"))).val()
      },
      failureMessage: function() {
        var a = $(this.data("validation-matches").replace(/\//g,
          "\\/"));
        return "This must match " + $("label[for='" + a.attr("id") + "']").eq(0).text()
      }
    },
    creditCard: {
      applyTo: function() {
        return "" !== this.val() && this.is("[data-validation-creditcard]")
      },
      testVal: function() {
        var a = this.val().replace(/\-/g, "").replace(/\s/g, "");
        return window.Stripe ? window.Stripe.validateCardNumber(a) : $.isNumeric(a) && 16 === a.length
      },
      failureMessage: "This is not a valid credit card number"
    },
    date: {
      applyTo: function() {
        return "" !== this.val() && this.is("[data-validation-date]")
      },
      testVal: function() {
        return (new XDate(this.val())).valid()
      },
      failureMessage: "This is not a valid date"
    },
    time: {
      applyTo: function() {
        return "" !== this.val() && this.is("[data-validation-time]")
      },
      testVal: function() {
        var a = this.val().match(REGEX_TIME),
          b;
        if (a && 4 === a.length) {
          b = parseInt(a[1]);
          if (0 > b || 24 < b) return !1;
          a = a[2] ? parseInt(a[2]) : 0;
          return 0 > a || 60 < a ? !1 : !0
        }
        return !1
      },
      failureMessage: "This is not a valid time of day"
    }
  }, c);
  b.find("input, select, textarea").filter(":not(:disabled)").each(function() {
    var b = $(this);
    $.each(c, function(c, f) {
      var g = !1,
        k = !1;
      if (!$.isFunction(f.applyTo) ||
        f.applyTo.call(b)) a++, !$.isFunction(f.testVal) || f.testVal.call(b) ? (g = !0, d++, f.successMessage && (k = $.isFunction(f.successMessage) ? f.successMessage.call(b) : f.successMessage)) : f.failureMessage && (k = $.isFunction(f.failureMessage) ? f.failureMessage.call(b) : f.failureMessage), b.trigger({
        type: "validate",
        validationData: {
          test: c,
          result: g,
          message: k
        }
      })
    })
  });
  result = d === a;
  b.trigger({
    type: "validate",
    validationData: {
      result: result,
      totalTests: a,
      passedTests: d
    }
  });
  return result
};
$.fn.validateOnSubmit = function(c) {
  var b = $(this);
  b.filter("form").on("submit", function() {
    return $(this).validate(c)
  });
  return b
};
var AutoCompleter = function(c, b, a) {
  var d = this;
  $.extend(d, {
    candidateLimit: 3,
    caseSensitive: !1
  }, b, {
    haystack: a,
    $input: c,
    candidates: [],
    focusedOn: null,
    isActive: !1
  });
  d.$el = $("#template-autoCompleter").mustache({
    haystack: d.haystack
  }).insertAfter(d.$input);
  d.$items = d.$el.find(".autoComplete-item");
  d.$input.on({
    "focus.autocompleter": function() {
      d.show()
    },
    "blur.autocompleter": function() {
      d.hide()
    },
    "keydown.autocompleter": function(a) {
      switch (a.which) {
        case KEYCODES.down:
          return d.candidates.length ? (a = d.candidates.indexOf(d.focusedOn),
            a < d.candidates.length - 1 && (d.$items.filter(".focus").removeClass("focus"), d.focusedOn = d.candidates[a + 1], d.$items.filter("[data-value='" + d.focusedOn + "']").addClass("focus"))) : d.check(!0), !1;
        case KEYCODES.up:
          return d.candidates.length && (a = d.candidates.indexOf(d.focusedOn), 0 < a && (d.$items.filter(".focus").removeClass("focus"), d.focusedOn = d.candidates[a - 1], d.$items.filter("[data-value='" + d.focusedOn + "']").addClass("focus"))), !1;
        case KEYCODES.esc:
          if (d.isActive) return d.hide(), !1;
          break;
        case KEYCODES.tab:
          if (d.focusedOn) return d.choose(), !1;
          break;
        case KEYCODES.enter:
          return d.focusedOn && d.choose(), !1
      }
      return !0
    },
    "keyup.autocompleter": function(a) {
      switch (a.which) {
        case KEYCODES.down:
        case KEYCODES.up:
        case KEYCODES.esc:
        case KEYCODES.enter:
        case KEYCODES.tab:
          break;
        default:
          d.isActive || d.show(), d.check()
      }
      return !0
    },
    "click.autocompleter": function() {
      d.check()
    },
    "change.autocompleter": function() {
      d.check()
    }
  }).data("autoCompleter", d)
};
AutoCompleter.prototype.show = function() {
  var c = this;
  c.isActive || (c.isActive = !0, c.$input.addClass("autoCompleting"), c.$el.on({
    mousedown: function() {
      c.choose($(this).data("value"));
      return !1
    },
    mouseenter: function() {
      var b = $(this);
      c.$items.filter(".focus").removeClass("focus");
      c.focusedOn = b.data("value");
      $(this).addClass("focus")
    },
    mouseleave: function() {
      c.focusedOn = null;
      $(this).removeClass("focus")
    }
  }, ".autoComplete-item"), c.check())
};
AutoCompleter.prototype.hide = function() {
  this.isActive && (this.isActive = !1, this.$input.removeClass("autoCompleting"), this.$el.off("mousedown mouseenter mouseleave", ".autoComplete-item"));
  return this
};
AutoCompleter.prototype.choose = function(c) {
  var b, a;
  if (this.isActive) {
    b = this.$input.val().split(",");
    a = b.length;
    if (c || this.focusedOn) b[a - 1] = " " + (c || this.focusedOn);
    this.$input.val(b.join(",").replace(/^\s+/, "") + ", ");
    this.candidates = [];
    this.updateUI();
    this.$input.scrollLeft(9999).trigger("change")
  }
  return this
};
AutoCompleter.prototype.check = function(c) {
  var b = this,
    a = $.map(b.$input.val().split(","), $.trim),
    d = a.length,
    e = a[d - 1],
    h = e.length;
  b.isActive && (b.candidates = [], 0 < h ? $.each(b.haystack, function(c, g) {
    return (-1 === a.indexOf(g) || a.indexOf(g) === d - 1) && (b.caseSensitive ? g.substr(0, h) === e : g.substr(0, h).toLowerCase() === e.toLowerCase()) && (b.candidates.push(g), b.candidates.length >= b.candidateLimit) ? !1 : !0
  }) : c && $.each(b.haystack, function(c, e) {
    if (-1 === a.indexOf(e) || a.indexOf(e) === d - 1)
      if (b.candidates.push(e), b.candidates.length >=
        b.candidateLimit) return !1;
    return !0
  }), b.updateUI());
  return b
};
AutoCompleter.prototype.updateUI = function(c) {
  var b = this;
  b.isActive ? b.candidates.length ? (b.$input.addClass("autoCompleting"), -1 === b.candidates.indexOf(b.focusedOn) && (b.focusedOn = b.candidates[0]), b.$items.each(function() {
    var a = $(this),
      c = a.data("value");
    0 <= b.candidates.indexOf(c) ? (a.addClass("candidate"), a.toggleClass("focus", c === b.focusedOn)) : a.removeClass("candidate focus")
  })) : (b.focusedOn = null, b.$items.removeClass("candidate focus"), b.$input.removeClass("autoCompleting")) : b.$input.removeClass("autoCompleting");
  return b
};
AutoCompleter.prototype.destruct = function() {
  this.$el.empty().remove();
  this.$input.off(".autocompleter").removeData("autoCompleter");
  return this.$input
};
$.fn.autoCompleter = function(c, b) {
  var a = $(this);
  if (1 === a.length) return a.data("autoCompleter") ? a.data("autoCompleter") : new AutoCompleter(a, c, b || []);
  a.each(function() {
    $(this).autoCompleter(c, b)
  });
  return a
};

function Bubble(c, b) {
  $.extend(this, {
    isOpen: !1,
    id: "bubble-" + Math.floor(1E4 * Math.random()).toString(16),
    closeAfter: 1E4,
    clickToClose: !0,
    clickOutsideToClose: !0
  }, b, {
    $el: c,
    closeTimer: null
  }, $.extend(!0, {}, this));
  this.$el.data("bubble", this);
  this.$el.find(".spinner").each(function() {
    $(this).spinner({
      showAfter: 0,
      hideAfter: 0
    })
  });
  this.isOpen && (this.isOpen = null, this.open())
}
Bubble.prototype.open = function(c) {
  function b() {
    a.closeTimer = setTimeout(function() {
      a.close()
    }, a.closeAfter)
  }
  var a = this,
    d = $.Deferred();
  if (a.isOpen) d.reject();
  else {
    a.isOpen = !0;
    a.$el.trigger({
      type: "beforeOpen.bubble",
      userTriggered: c
    });
    a.$el.css("display", "block");
    if (a.clickOutsideToClose) $(document).on("mousedown." + a.id + " touchstart." + a.id, function() {
      a.close();
      return !1
    });
    _(function() {
      a.$el.addClass("open");
      a.$el.find(".spinner").each(function() {
        var a = $(this);
        a.is(":visible") && a.spinner().show()
      });
      a.$el.find(".scrollPane").each(function() {
        $(this).scrollPane().activate().update()
      });
      if (a.clickToClose) a.$el.on({
        "click.bubble": function() {
          a.close()
        },
        "mousedown.bubble touchstart.bubble": function(a) {
          a.stopPropagation()
        }
      });
      _(function() {
        a.closeAfter && (b(), a.$el.on({
          "mouseenter.bubble": function() {
            clearTimeout(a.closeTimer)
          },
          "mouseleave.bubble": b
        }));
        a.$el.trigger({
          type: "afterOpen.bubble",
          userTriggered: c
        });
        d.resolve()
      }).delay(a.$el.transitionDuration())
    }).defer()
  }
  return d.promise()
};
Bubble.prototype.close = function(c) {
  var b = this,
    a = $.Deferred();
  b.isOpen ? (b.isOpen = !1, b.$el.trigger({
    type: "beforeClose.bubble",
    userTriggered: c
  }), clearTimeout(b.closeTimer), $(document).off("." + b.id), b.$el.find(".spinner").each(function() {
    $(this).spinner().hide()
  }), b.$el.find(".scrollPane").each(function() {
    $(this).scrollPane().deactivate()
  }), _(function() {
    b.$el.removeClass("open").off(".bubble");
    _(function() {
      b.$el.css("display", "none");
      b.$el.trigger({
        type: "afterClose.bubble",
        userTriggered: c
      });
      a.resolve()
    }).delay(b.$el.transitionDuration())
  }).defer()) :
    a.reject();
  return a.promise()
};
Bubble.prototype.destruct = function() {
  var c = this,
    b = $.Deferred();
  c.close().always(function() {
    c.$el.trigger("beforeDestruct.bubble");
    c.$el.removeData("bubble").remove();
    c.$el.trigger("afterDestruct.bubble");
    $(document).off("." + c.id);
    b.resolve()
  });
  return b.promise()
};
$.fn.bubble = function(c) {
  var b = $(this);
  if (1 === b.length) return b.data("bubble") ? b.data("bubble") : new Bubble(b, c);
  b.each(function() {
    $(this).bubble(c)
  });
  return b
};

function MessageBar(c, b) {
  var a = this,
    d;
  $.extend(a, {
    openImmediately: !0,
    extraClasses: !1,
    viewID: !1,
    closeAfter: 5E3,
    closeButton: !0,
    closeOnClick: !0,
    resetTimerOnHover: !0,
    onClick: void 0,
    template: "#template-messageBar",
    insertFunction: "prependTo",
    insertElement: $("#messageBars")
  }, b, {
    destructTimer: null,
    isOpen: !1
  });
  if (!$.fn[a.insertFunction] || !a.insertElement.jquery) return !1;
  a.$el = $(a.template).mustache(a).data("messageBar", a);
  if (a.resetTimerOnHover) a.$el.on({
    mouseenter: function() {
      a.stopTimer()
    },
    mouseleave: function() {
      a.startTimer()
    }
  });
  d = a.$el.find(".messageBar-contents");
  c && (c.jquery ? d.append(c) : "string" === $.type(c) && d.html(c), d.attr("title", d.text()));
  a.$el.on("click", function(b) {
    if (a.onClick) a.onClick();
    a.closeOnClick && a.close(!0);
    b.stopPropagation()
  });
  a.openImmediately && a.open();
  return a
}
MessageBar.prototype.open = function() {
  var c = this,
    b = $.Deferred(),
    a = [];
  c.isOpen ? b.reject() : (c.isOpen = !0, c.insertElement.find(".messageBar").length && c.insertElement.find(".messageBar").each(function() {
    a.push($(this).data("messageBar").close())
  }), $.when.apply(null, a).always(function() {
    $.fn[c.insertFunction].call(c.$el, c.insertElement);
    _(function() {
      c.isOpen && (c.insertElement.addClass("hasMessageBar"), c.$el.addClass("open"), PubHub.pub("MessageBar/open", c), c.closeAfter && c.startTimer(), b.resolve())
    }).defer()
  }));
  return b.promise()
};
MessageBar.prototype.close = function() {
  function c() {
    b.insertElement.removeClass("hasMessageBar");
    b.$el.removeData("messageBar").remove();
    a.resolve();
    PubHub.pub("MessageBar/destruct", b)
  }
  var b = this,
    a = $.Deferred();
  b.isOpen ? (b.isOpen = !1, b.$el.removeClass("open"), _(function() {
    _(c).delay(b.$el.transitionDuration())
  }).defer(), PubHub.pub("MessageBar/close", b)) : c();
  return a.promise()
};
MessageBar.prototype.stopTimer = function() {
  clearTimeout(this.destructTimer);
  return this
};
MessageBar.prototype.startTimer = function() {
  var c = this;
  c.closeAfter && (c.destructTimer = setTimeout(function() {
    c.close()
  }, c.closeAfter));
  return c
};

function Popover(c, b) {
  var a = this,
    d;
  d = b.id && "string" === typeof b.id ? b.id : "p" + Math.floor(1E4 * Math.random()).toString(16);
  $.extend(!0, a, {
    id: d,
    extraClasses: !1,
    isOpen: !1,
    closeButton: !0,
    clickOutsideToClose: !0,
    pressEscToClose: !0,
    handleHash: !1,
    fixedTop: !1,
    autoCenter: !0,
    overlayStrength: "normal"
  }, b, {
    scrollable: {
      x: !1,
      y: !1
    },
    id: d,
    pID: "popover-" + d,
    analytics: {
      openCount: 0,
      lastOpen: null,
      lastClose: null,
      lastDuration: 0
    }
  }, $.extend(!0, {}, a));
  a.$popover = $("<div/>", {
    "class": a.extraClasses ? "popover " + a.extraClasses : "popover",
    id: a.pID
  }).appendTo("body").data("popover", a);
  if (a.clickOutsideToClose) a.$popover.on("click", function() {
    a.close(!0)
  });
  a.$window = $("<div/>", {
    "class": "popover-window"
  }).on("click", function(a) {
    a.stopPropagation()
  }).appendTo(a.$popover);
  a.$el = c.appendTo(a.$window).data("popover", a);
  a.closeButton && (a.$closeButton = $("<a/>", {
    "class": "back" === a.closeButton ? "popover-close back" : "popover-close",
    text: "back" === a.closeButton ? "Back" : "Close",
    href: "#",
    click: function(b) {
      b.preventDefault();
      a.close(!0)
    }
  }).appendTo(a.$popover));
  a._upPos();
  a.$popover.hide();
  PubHub.pub("Popover/construct", a);
  a.isOpen && (a.isOpen = !1, a.open());
  !window.State && a.handleHash && (a.hash = a.id, a.storeHash = null, $(window).on("hashchange." + a.pID, function() {
    a._checkHash() ? a.open() : a.close(!0)
  }))
}
Popover.prototype.open = function(c) {
  function b() {
    var b = $(window);
    a.isOpen = !0;
    PubHub.pub("Popover/beforeOpen", a, c);
    a.$el.trigger({
      type: "beforeOpen.popover",
      userTriggered: c
    });
    window.Hash || (!a.handleHash || a._checkHash()) || (a.storeHash = window.location.hash.substr(1) === a.hash ? "" : window.location.hash, window.location.hash = a.hash);
    a.$popover.css("display", "block");
    a.scrollable = {
      x: !1,
      y: !1
    };
    _(function() {
      a._upPos();
      a.$popover.scrollTop(0).scrollLeft(0).addClass("open")
    }).defer();
    _(function() {
      a.analytics.openCount++;
      a.analytics.lastOpen = $.now();
      b.on("focus." + a.pID, function() {
        a.analytics.lastOpen = $.now()
      });
      a.viewportSub = PubHub.sub("Viewport/update", function(b) {
        (b.deltas.width || b.deltas.height) && a._upPos()
      });
      if (a.pressEscToClose) $(document).on("keyup." + a.pID, function(b) {
        27 === b.which && a.close(!0)
      });
      a.autoCenter && a._centerHeight();
      PubHub.pub("Popover/afterOpen", a, c);
      a.$el.trigger({
        type: "afterOpen.popover",
        userTriggered: c
      });
      a.openDfd.resolve()
    }).delay(a.$window.transitionDuration())
  }
  var a = this,
    d;
  a.openDfd ? d = a.openDfd :
    (a.openDfd = d = $.Deferred().always(function() {
    delete a.openDfd
  }), a.isOpen ? a.openDfd.reject() : window.Popovers ? window.Popovers.open(a, a.openDfd).done(b).fail(function() {
    a.openDfd.reject()
  }) : b());
  return d.promise()
};
Popover.prototype.close = function(c) {
  function b() {
    var b, d, f = $(window);
    a.isOpen = !1;
    PubHub.pub("Popover/beforeClose", a, c);
    a.$el.trigger({
      type: "beforeClose.popover",
      userTriggered: c
    });
    a.$popover.removeClass("open");
    a.autoCenter && a._centerHeight(!1);
    !window.Hash && (a.handleHash && a._checkHash()) && (b = f.scrollTop(), d = f.scrollLeft(), window.location.hash = a.storeHash || "", f.scrollTop(b).scrollLeft(d));
    f.off(a.pID);
    PubHub.drubSub("Viewport/update", a.viewportSub);
    delete a.viewportSub;
    a.pressEscToClose && $(document).off("keyup." +
      a.pID);
    _(function() {
      a.analytics.lastClose = $.now();
      a.analytics.lastDuration = a.analytics.lastClose - a.analytics.lastOpen;
      a._upPos();
      a.$popover.hide();
      PubHub.pub("Popover/afterClose", a, c);
      a.$el.trigger({
        type: "afterClose.popover",
        userTriggered: c
      });
      a.closeDfd.resolve()
    }).delay(a.$window.transitionDuration())
  }
  var a = this,
    d;
  a.closeDfd ? d = a.closeDfd : (a.closeDfd = d = $.Deferred().always(function() {
      delete a.closeDfd
    }), a.isOpen ? window.Popovers ? window.Popovers.close(a, a.closeDfd).done(b).fail(function() {
      a.closeDfd.reject()
    }) :
    b() : a.closeDfd.reject());
  return d.promise()
};
Popover.prototype.destruct = function() {
  var c = this,
    b = $.Deferred();
  c.close().always(function() {
    c.$el.trigger("beforeDestruct.popover");
    c.$el.removeData("popover").off(".popover").detach();
    $(window).off("." + c.pID);
    c.$popover.remove();
    PubHub.pub("Popover/destruct", c);
    c.$el.trigger("afterDestruct.popover");
    b.resolve()
  });
  return b.promise()
};
Popover.prototype._upPos = function() {
  var c = Viewport.getWidth() - this.$window.outerWidth(!1),
    b = Viewport.getHeight(),
    a = b - this.$window.outerHeight(!1);
  0 <= a ? (this.scrollable.y && (this.scrollable.y = !1), this.fixedTop && 1 <= this.fixedTop && a / 2 > this.fixedTop ? this.$window.css("top", this.fixedTop) : this.fixedTop && 1 > this.fixedTop && a / 2 > this.fixedTop * b ? this.$window.css("top", this.fixedTop * b) : this.$window.css("top", a / 2)) : this.scrollable.y || (this.scrollable.y = !0, this.$window.css("top", 0));
  0 <= c ? (this.scrollable.x && (this.scrollable.x = !1), this.$window.css("left", c / 2)) : this.scrollable.x || (this.scrollable.x = !0, this.$window.css("left", 0))
};
Popover.prototype._centerHeight = function(c) {
  function b() {
    var c;
    a.autoCenter = setTimeout(function() {
      c = a.$window.height();
      c === h && f ? (f = !1, 60 < Math.abs(c - e) && (e = c, a.$window.addClass("smoothTop"), a._upPos(), setTimeout(function() {
        a.$window.removeClass("smoothTop")
      }, 200))) : c !== h && (f = !0, h = c);
      !0 !== a.autoCenter && b()
    }, d)
  }
  var a = this,
    d = 50,
    e = a.$window.height(),
    h = e,
    f = !1;
  !1 !== a.autoCenter && (!1 === c ? !0 !== a.autoCenter && (clearTimeout(a.autoCenter), a.autoCenter = !0) : !0 === a.autoCenter && b())
};
Popover.prototype._checkHash = function() {
  return window.location.hash.substr(1).split("/")[0] === this.hash
};
$.fn.popover = function(c) {
  var b = $(this),
    a;
  if (1 === b.length) {
    a = $.extend({}, c);
    if (b.data("popover")) return b.data("popover");
    a.id = a && a.id && "string" === typeof a.id ? a.id : b.attr("id") || null;
    return new Popover(b, a)
  }
  b.each(function() {
    $(this).popover(c)
  });
  return b
};
var ScrollPane = function(c, b) {
  var a = this;
  $.extend(a, {
    isActive: !1
  }, b, {
    $el: c,
    visibleHt: 0,
    fullHt: 0,
    shuttleMinHt: 0,
    shuttleHt: 0
  });
  a.$el.data("scrollPane", a).on("scroll.scrollPane", function(a) {
    this.scrollTop = this.scrollLeft = 0
  });
  "static" === a.$el.css("position") && (a.originalPosValue = a.$el.css("position"), a.$el.css("position", "relative"));
  a.originalOverflow = a.$el.css("overflow");
  a.$el.css("overflow", "hidden");
  a.$el.children().length ? (a.$el.wrapInner($("<div/>", {
    "class": "scrollPane"
  })), a.$pane = a.$el.find(".scrollPane").eq(0)) :
    a.$pane = $("<div/>", {
      "class": "scrollPane"
    }).appendTo(a.$el);
  a.$pane.data("scrollPane", a);
  $(document).on("mouseup", function(b) {
    a.$pane.scrollLeft(0)
  });
  a.$shuttle = $("<div/>", {
    "class": "scrollPane-shuttle"
  }).on({
    "mousedown.scrollPane touchstart.scrollPane": function(b) {
      var c = $(document),
        h = a.$pane.scrollTop(),
        f = b.clientY;
      a.$shuttle.addClass("dragging");
      $("body").addClass("noSelect");
      c.on({
        "mousemove.scrollPane touchmove.scrollPane": function(b) {
          a.$pane.scrollTop(h + (b.clientY - f) / (a.visibleHt - a.shuttleHt) *
            (a.fullHt - a.visibleHt))
        },
        "mouseup.scrollPane touchend.scrollPane": function(b) {
          c.off(".scrollPane");
          a.$shuttle.removeClass("dragging");
          $("body").removeClass("noSelect")
        }
      })
    },
    "click.scrollPane": function(a) {
      return !1
    }
  }).appendTo(a.$el);
  setTimeout(function() {
    a.isActive && (a.isActive = null, a.activate())
  }, 0)
};
ScrollPane.prototype.activate = function() {
  var c = this;
  c.isActive || (c.isActive = !0, c.$pane.on("scroll.scrollPane", function() {
    var b = Math.floor(c.$pane.scrollTop() / (c.fullHt - c.visibleHt) * (c.visibleHt - c.shuttleHt));
    c.$shuttle.css("top", b);
    c.$el.toggleClass("scrolled", 0 < b)
  }), c.$el.on({
    "mouseenter.scrollPane": function() {
      c.update()
    }
  }));
  return c
};
ScrollPane.prototype.deactivate = function() {
  this.isActive && (this.isActive = !1, this.$pane.off("scroll.scrollPane"), this.$el.off(".scrollPane"), $(document).trigger("mouseup.scrollPane").trigger("touchend.scrollPane"));
  return this
};
ScrollPane.prototype.update = function() {
  var c = this.$pane.scrollTop(),
    b;
  this.$pane.height("auto");
  this.fullHt = this.$pane.get(0).scrollHeight;
  this.visibleHt = this.$el.height();
  this.$pane.height(this.visibleHt).scrollTop(c);
  this.shuttleMinHt = parseInt(this.$shuttle.css("min-height") || 0);
  this.shuttleHt = Math.max(this.visibleHt - (this.fullHt - this.visibleHt), this.shuttleMinHt);
  this.$shuttle.height(this.shuttleHt);
  this.visibleHt + 10 < this.fullHt ? (b = Math.floor(this.$pane.scrollTop() / (this.fullHt - this.visibleHt) *
    (this.visibleHt - this.shuttleHt)), this.$shuttle.css("top", b).removeClass("hidden"), this.$el.toggleClass("scrolled", 0 < c)) : (this.$shuttle.addClass("hidden"), this.$el.removeClass("scrolled"));
  return this
};
ScrollPane.prototype.destruct = function() {
  this.isActive && this.deactivate();
  this.$pane.children().eq(0).unwrap();
  this.$shuttle.remove();
  this.$el.removeData("scrollPane").css("overflow", this.originalOverflow).off(".scrollPane");
  this.originalPosValue && this.$el.css("position", this.originalPosValue);
  return this
};
$.fn.scrollPane = function(c) {
  var b = $(this);
  if (1 === b.length) return b.data("scrollPane") ? b.data("scrollPane") : new ScrollPane(b, c);
  b.each(function() {
    $(this).scrollPane(c)
  });
  return b
};

function Slideshow(c, b) {
  var a = this;
  $.extend(a, {
    timerSpeed: 4E3,
    paused: !1,
    currentIndex: 0,
    advanceOnSlideClick: !1
  }, b, {
    $container: c,
    $slides: c.children("li"),
    timer: null
  });
  a.$container.data("slideshow", a);
  a.numSlides = a.$slides.length;
  if (a.advanceOnSlideClick) a.$slides.on("click", function() {
    a.pause().increment()
  });
  a.currentIndex -= 0.5;
  a.goTo(a.currentIndex + 0.5);
  a.paused || a.play()
}
Slideshow.prototype.goTo = function(c) {
  c = $.isNumeric(c) ? (c % this.numSlides + this.numSlides) % this.numSlides : null;
  this.currentIndex !== c && (this.$slides.filter(".selected").removeClass("selected"), this.$slides.eq(c).addClass("selected"), this.currentIndex = c, $(this).trigger("update.slideshow"));
  return this
};
Slideshow.prototype.increment = function(c) {
  this.goTo(this.currentIndex + (c || 1));
  return this
};
Slideshow.prototype.decrement = function(c) {
  this.goTo(this.currentIndex - (c || 1));
  return this
};
Slideshow.prototype.pause = function() {
  clearTimeout(this.timer);
  this.paused = !0;
  return this
};
Slideshow.prototype.play = function() {
  function c() {
    clearTimeout(b.timer);
    b.timer = setTimeout(function() {
      b.increment();
      c()
    }, b.timerSpeed)
  }
  var b = this;
  b.timerSpeed && (b.paused = !1, c());
  return b
};

function Spinner(c, b) {
  var a = this;
  $.extend(a, {
    showing: !1,
    showAfter: 1E3,
    hideAfter: 1500
  }, b, {
    $el: c,
    showTimer: null,
    hideTimer: null,
    hidePromise: $.Deferred().resolve()
  });
  a.$el.data("spinner", a);
  $(function() {
    var b = a.$el.css("backgroundImage").match(REGEX_BACKGROUNDIMAGE_GLOBAL);
    b && b.length && (a.sprite = a.$el.sprite(b[IS_RETINA && Modernizr.cssimageset ? b.length - 1 : 0].match(REGEX_BACKGROUNDIMAGE)[1], {
      fps: 12,
      playing: !1
    }));
    a.showing && (a.showing = !1, a.show())
  })
}
Spinner.prototype.toggle = function(c) {
  (c = void 0 === c ? !this.showing : !! c) ? this.show() : this.hide();
  return this
};
Spinner.prototype.show = function() {
  function c() {
    $(function() {
      b.sprite && b.sprite.play();
      b.$el.addClass("visible")
    })
  }
  var b = this;
  b.showing = $.now();
  "pending" === b.hidePromise.state() && (clearTimeout(b.hideTimer), b.hidePromise.reject());
  b.showAfter && !b.showTimer ? b.showTimer = setTimeout(c, b.showAfter) : c()
};
Spinner.prototype.hide = function() {
  function c() {
    $(function() {
      b.$el.removeClass("visible");
      b.sprite && b.sprite.pause();
      b.hidePromise.resolve()
    })
  }
  var b = this,
    a, d = b.showAfter + b.hideAfter;
  b.showing && (a = $.now() - b.showing, b.showing = !1, b.hidePromise = $.Deferred(), a < b.showAfter || a >= d ? (clearTimeout(b.showTimer), c()) : (clearTimeout(b.hideTimer), b.hideTimer = setTimeout(c, d - a)));
  return b.hidePromise
};
Spinner.prototype.getHidePromise = function() {
  return this.hidePromise
};
Spinner.prototype.destruct = function() {
  this.showing = !1;
  clearTimeout(this.hideTimer);
  clearTimeout(this.showTimer);
  this.hidePromise.reject();
  this.$el.removeData("spinner").remove();
  this.sprite && this.sprite.pause();
  return this.$el
};
$.fn.spinner = function(c) {
  var b = $(this);
  if (1 === b.length) return b.data("spinner") ? b.data("spinner") : new Spinner(b, c);
  b.each(function() {
    $(this).spinner(c)
  });
  return b
};

function Sprite(c, b, a) {
  function d() {
    $("<img/>", {
      load: function() {
        $(this).off("load error");
        e.$el.filter("img").attr("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
        e.$el.width(e.frameWidth).height(e.frameHeight).css({
          backgroundImage: "url('" + e.sprite + "')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 0",
          backgroundSize: IS_RETINA && Modernizr.cssimageset ? this.width / 2 + "px auto" : "auto"
        });
        e.goToFrame(void 0 !== e.tempFrame ? e.tempFrame : e.startingFrame);
        e.spriteLoaded = !0;
        e.playing && (e.playing = null, e.play())
      },
      error: function() {
        $(this).off("load error");
        console.error("Could not load " + e.sprite);
        e.destruct()
      },
      src: b
    })
  }
  var e = this;
  $.extend(e, {
    fps: 30,
    playing: !0,
    loop: !0,
    startingFrame: 0,
    forward: !0,
    frameWidth: c.width(),
    frameHeight: c.height(),
    numFrames: 12
  }, a, {
    $el: c,
    $loader: null,
    spriteLoaded: !1,
    frame: 0,
    origSrc: c.attr("src"),
    origCSS: {
      backgroundImage: c.css("backgroundImage"),
      backgroundRepeat: c.css("backgroundRepeat"),
      backgroundPosition: c.css("backgroundPosition")
    },
    sprite: b,
    timer: null,
    tempFrame: void 0,
    cssShortcut: !! c.css("backgroundPositionX")
  });
  e.$el.data("sprite", e);
  e.fps = 0 < parseInt(e.fps, 10) ? parseInt(e.fps, 10) : 30;
  e.speed = parseInt(1E3 / e.fps, 10);
  e.$el.is("img") ? Modernizr.datauri ? (e.$el.one("load.sprite", function() {
    d()
  }).on("error.sprite", function() {
    $(this).off(".sprite");
    e.destruct()
  }), e.$el.get(0).complete && 0 < e.$el.width() && e.$el.trigger("load.sprite")) : e.destruct() : d()
}
Sprite.prototype.play = function() {
  function c(c) {
    a.goToFrame(c);
    a.timer = setTimeout(b, a.speed)
  }

  function b() {
    var b = a.frame + (a.forward ? 1 : -1);
    0 <= b && b < a.numFrames ? c(b) : a.loop ? (!0 !== a.loop && a.loop--, b = (b + a.numFrames) % a.numFrames, a.$el.trigger("tick.sprite"), c(b)) : (a.playing = !1, a.$el.removeClass("playing"))
  }
  var a = this;
  a.spriteLoaded ? a.playing || (a.playing = !0, a.$el.addClass("playing").trigger("play.sprite"), c(a.frame)) : a.playing = !0;
  return a
};
Sprite.prototype.pause = function() {
  this.spriteLoaded ? this.playing && (this.playing = !1, clearTimeout(this.timer), this.$el.removeClass("playing").trigger("pause.sprite")) : this.playing = !1;
  return this
};
Sprite.prototype.goToFrame = function(c) {
  var b;
  c = parseInt(c, 10);
  0 <= c && c < this.numFrames && (this.spriteLoaded ? (b = -c * this.frameWidth, this.cssShortcut ? this.$el.css("backgroundPositionX", b) : this.$el.css("backgroundPosition", b + "px 0"), this.frame = c) : this.tempFrame = c);
  return this
};
Sprite.prototype.reverse = function() {
  this.forward = !this.forward;
  this.$el.trigger("reverse.sprite");
  return this
};
Sprite.prototype.stop = function() {
  this.spriteLoaded ? (clearTimeout(this.timer), this.playing = !1, this.goToFrame(this.startingFrame), this.$el.removeClass("playing").trigger("stop.sprite")) : (this.playing = !1, this.tempFrame = void 0);
  return this
};
Sprite.prototype.destruct = function() {
  clearTimeout(this.timer);
  this.playing = !1;
  this.$loader && this.$loader.remove();
  this.$el.removeClass("playing").attr("src", this.origSrc);
  this.$el.css(this.origCSS);
  this.$el.trigger("destruct.sprite").off(".sprite").removeData("sprite");
  return this.$el
};
$.fn.sprite = function(c, b) {
  var a = $(this);
  if (1 === a.length) {
    if (a.data("sprite")) return a.data("sprite");
    if ($.isPlainObject(c) || void 0 === c) b = c, c = a.data("spritesheet");
    return c ? new Sprite(a, c, b) : !1
  }
  a.each(function() {
    $(this).sprite(c, b)
  });
  return a
};

function Tabset(c, b) {
  var a = this,
    d, e = {
      tabs: []
    };
  $.extend(!0, a, {
    currentTab: 0,
    calcHeight: !0,
    tabLink: "panel="
  }, b, {
    $tabset: c,
    $contents: c.find(".tabset-content")
  });
  a.$tabset.data("tabset", a);
  a.$contents.each(function() {
    var b = $(this);
    e.tabs.push({
      id: b.data("tab-id"),
      title: b.data("tab-title"),
      link: a.tabLink.replace(/\{\{id\}\}/g, b.data("tab-id"))
    })
  });
  $("#template-tabset-tabs").mustache(e).prependTo(a.$tabset);
  a.$tabs = a.$tabset.find(".tabset-tab");
  a.$container = $("<div/>", {
    "class": "tabset-container"
  }).appendTo(a.$tabset);
  a.$contents.appendTo(a.$container);
  d = a.currentTab;
  a.currentTab = 9999;
  a.select(d)
}
Tabset.prototype.select = function(c) {
  var b = this.currentTab,
    a, d;
  "string" === $.type(c) ? (a = this.$contents.filter("[data-tab-id='" + jqEscape(c) + "']"), d = this.$contents.index(a.get(0))) : "number" === $.type(c) && (a = this.$contents.eq(c), d = c);
  b !== d && (a && a.length && 0 <= d && d < this.$contents.length) && (this.currentTab = d, this.$tabs.filter(".selected").removeClass("selected"), this.$tabs.eq(d).addClass("selected"), this.$contents.filter(".selected").removeClass("selected").trigger("deactivateTab.tabset"), a.addClass("selected").trigger("activateTab.tabset"),
    PubHub.pub("Tabset/afterChange", this, this.currentTab, b), this.$tabset.trigger("switch.tabset", [this.currentTab, b]));
  return this
};
Tabset.prototype.getTabID = function(c) {
  return this.$el.contents.eq(c).attr("id")
};
Tabset.prototype.hasTab = function(c) {
  return !!this.$el.contents.filter("[data-tab-id='" + jqEscape(c) + "']").length
};
$.fn.tabset = function(c) {
  var b = $(this);
  if (1 === b.length) return b.data("tabset") ? b.data("tabset") : new Tabset(b, c);
  b.each(function() {
    $(this).tabset(c)
  });
  return b
};
var Overlay = function() {
  var c = {
    $overlay: null,
    isVisible: !1,
    beforeScroll: null,
    toggle: function(b) {
      var a = this,
        c = $(window),
        e = $("html"),
        h = $("body"),
        f = $("#navBar").find(".navBar-contents"),
        g, k, l, m;
      b = !! b;
      a.isVisible !== b && $(function() {
        (a.isVisible = b) ? (a.beforeScroll = Viewport.getTop(), g = Viewport.getWidth(!0), k = Viewport.getHeight(!0), e.addClass("overlayOpen"), l = Viewport.getWidth(!0) - g, m = Viewport.getHeight(!0) - k, f.css("right", l), h.css({
            right: l,
            bottom: m
          }), a.$overlay.css("display", "block"), e.scrollTop(a.beforeScroll),
          _(function() {
            a.$overlay.addClass("visible")
          }).defer()) : (a.$overlay.removeClass("visible"), _(function() {
          a.isVisible || (a.$overlay.css("display", "none"), e.removeClass("overlayOpen"), h.css({
            right: 0,
            bottom: 0
          }), f.css("right", 0), c.scrollTop(a.beforeScroll))
        }).delay(300))
      })
    },
    show: function() {
      this.toggle(!0)
    },
    hide: function() {
      this.toggle(!1)
    },
    isVisible: function() {
      return this.isVisible
    },
    setStrength: function(b) {
      var a = this;
      $(function() {
        a.$overlay.attr("data-strength", b)
      })
    }
  };
  $(function() {
    c.$overlay = $("<div/>", {
      id: "overlay"
    }).appendTo("body")
  });
  PubHub.sub("Popover/beforeOpen", function(b) {
    c.show();
    c.setStrength(b.overlayStrength)
  });
  PubHub.sub("Popover/beforeClose", function(b) {
    function a() {
      window.Popovers && Popovers.nextPopover || c.hide()
    }
    "Internet Explorer" === Platform.browser && 9 > Platform.browserVersion ? a() : _(a).defer()
  });
  return c
}();

function ActivityIndicator(c, b) {
  var a = this;
  $.extend(!0, a, {
    hideAfter: 1E3
  }, b, {
    showing: !1,
    requests: [],
    messages: {}
  }, $.extend(!0, {}, a));
  $(function() {
    $(c).length && (a.$el = $(c), a.$message = a.$el.find(".message"), a.spinner = a.$el.find(".spinner").spinner({
      showAfter: 0,
      hideAfter: 0
    }))
  })
}
ActivityIndicator.prototype.show = function(c, b) {
  var a = this;
  b = b || "Busy&hellip;";
  void 0 !== b && (a.messages[c] = b);
  a.requests.push(c);
  1 === a.requests.length && (a.showing = $.now(), a.hidePromise && (clearTimeout(a.hideTimer), a.hidePromise.reject(), delete a.hidePromise), a.showPromise = $.Deferred(), $(function() {
    a.$message.html(b);
    a.$el.addClass("visible").attr("title", b.replace(/&hellip;/g, "..."));
    a.spinner.show();
    a.showPromise && a.showPromise.resolve()
  }));
  return a.showPromise
};
ActivityIndicator.prototype.hide = function(c) {
  function b() {
    $(function() {
      a.$el.removeClass("visible");
      a.spinner.hide();
      a.hidePromise && a.hidePromise.resolve()
    })
  }
  var a = this;
  c = a.requests.indexOf(c);
  return 0 <= c ? (a.showing = !1, a.requests.splice(c, 1), a.hidePromise || (a.hidePromise = $.Deferred()), a.requests.length ? 0 === c && $(function() {
    a.$message.html(a.messages[a.requests[0]] || "Busy&hellip;");
    a.$el.attr("title", a.messages[a.requests[0]] || "Busy...")
  }) : (a.showPromise && (a.showPromise.reject(), delete a.showPromise),
    c = $.now() - a.showing, c >= a.hideAfter ? b() : (clearTimeout(a.hideTimer), a.hideTimer = setTimeout(b, a.hideAfter - c))), a.hidePromise) : $.Deferred().reject()
};
ActivityIndicator.prototype.isBusy = function() {
  return !!this.showing
};
var BlockingActivity = $.extend({}, ActivityIndicator.prototype, {
  hideAfter: 1500
});
ActivityIndicator.call(BlockingActivity, "#blockingActivity");
BlockingActivity.show = function(c, b) {
  return ActivityIndicator.prototype.show.call(this, c, b).done(function() {
    PubHub.pub("Activity/show/blocking")
  })
};
BlockingActivity.hide = function(c) {
  return ActivityIndicator.prototype.hide.call(this, c).done(function() {
    PubHub.pub("Activity/hide/blocking")
  })
};
var DiscreetActivity = $.extend({}, ActivityIndicator.prototype, {
  hideAfter: 1E3
});
ActivityIndicator.call(DiscreetActivity, "#discreetActivity");
DiscreetActivity.show = function(c, b) {
  return ActivityIndicator.prototype.show.call(this, c, b).done(function() {
    PubHub.pub("Activity/show/discreet")
  })
};
DiscreetActivity.hide = function(c) {
  return ActivityIndicator.prototype.hide.call(this, c).done(function() {
    PubHub.pub("Activity/hide/discreet")
  })
};
