/* Copyright 2011-2013 33cube, Inc. All rights reserved. */
window.console || (window.console = {
  log: $.noop
});
$.isFunction(window.console.error) || (window.console.error = window.console.log);
$.rejected = $.Deferred().reject().promise();
$.resolved = $.Deferred().resolve().promise();
XDate.prototype.relativeToNow = function(a, b, c, d, f) {
  function e(a, d) {
    return a + " " + TIME_UNITS[d][f ? "short" : 1 === a ? "singular" : "plural"] + " " + h
  }
  var g = !1,
    h = "ago";
  this.valid() && (g = this.diffMilliseconds(new XDate(!1)), 0 > g && (g *= -1, g--, h = f ? "hence" : "from now"), g = c && d && g < TIME_UNITS[c].inMS * d ? (f ? "< " : "less than ") + e(d, c) : a && b && g > TIME_UNITS[a].inMS * b ? (f ? "> " : "more than ") + e(b, a) : g <= TIME_UNITS.second.inMS ? (f ? "< " : "less than ") + e(1, "second") : "second" === a || g <= TIME_UNITS.minute.inMS - 5 * TIME_UNITS.second.inMS ? e(Math.round(g /
    TIME_UNITS.second.inMS), "second") : "minute" === a || g <= TIME_UNITS.hour.inMS - 5 * TIME_UNITS.minute.inMS ? e(Math.round(g / TIME_UNITS.minute.inMS), "minute") : "hour" === a || g <= TIME_UNITS.day.inMS - 2 * TIME_UNITS.hour.inMS ? e(Math.round(g / TIME_UNITS.hour.inMS), "hour") : "day" === a || g <= TIME_UNITS.week.inMS - 12 * TIME_UNITS.hour.inMS ? e(Math.round(g / TIME_UNITS.day.inMS), "day") : "week" === a || g <= 4 * TIME_UNITS.week.inMS ? e(Math.round(g / TIME_UNITS.week.inMS), "week") : "month" === a || g <= TIME_UNITS.year.inMS - 20 * TIME_UNITS.day.inMS ? e(Math.round(g /
    TIME_UNITS.month.inMS), "month") : "year" === a || g <= TIME_UNITS.century.inMS ? e(Math.round(g / TIME_UNITS.year.inMS), "year") : e(Math.round(g / TIME_UNITS.century.inMS), "century"));
  return g
};
XDate.prototype.toTimezoneOffsetString = function() {
  var a = this.getTimezoneOffset(),
    b;
  b = (0 <= a ? "-" : "+") + padStringToLength(Math.abs(Math.floor(a / 60)), 2, "0", !0);
  b += ":";
  return b += padStringToLength(Math.abs(a % 60), 2, "0", !0)
};
_.mixin({
  sortInterpolated: function(a) {
    var b = 2,
      c = 1,
      d = 2;
    for (a.splice(1, 0, a.splice(-1, 1)[0]); b < a.length;) c % 2 && (a.splice(b, 0, a.splice(Math.floor((a.length - b) / d * c) + b, 1)[0]), b++), c++, c >= d && (c = 1, d *= 2);
    return a
  },
  sortRipple: function(a, b) {
    var c = 0;
    for (_(b).isNumber() ? 0 < b && 1 > b && (b = Math.floor(a.length * b)) : b = Math.floor(a.length / 2); c < b;) a.splice(c, 0, a.splice(b, 1)[0]), c++, b < a.length - 1 && c % 2 && b++;
    return a
  },
  sortStepped: function(a, b) {
    var c = 0,
      d = 0,
      f = 0;
    if (!b) b = 2;
    else if (1 === b) return a;
    for (; c < a.length;) d !== c && a.splice(c,
      0, a.splice(d, 1)[0]), c++, d += b - f, d >= a.length && (d = c, f++);
    return a
  }
});
Array.prototype.indexOf || (Array.prototype.indexOf = function(a) {
  for (var b = this.length, c = 0; c < b; c++)
    if (this[c] === a) return c;
  return -1
});
String.prototype.trim || (String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "")
});
Object.create || (Object.create = function() {
  function a() {}
  return function(b) {
    if (1 != arguments.length) throw Error("Object.create implementation only accepts one parameter.");
    a.prototype = b;
    return new a
  }
}());

function addCommas(a) {
  x = (a + "").split(".");
  x1 = x[0];
  x2 = 1 < x.length ? "." + x[1] : "";
  for (a = /(\d+)(\d{3})/; a.test(x1);) x1 = x1.replace(a, "$1,$2");
  return x1 + x2
}

function sortObject(a, b) {
  var c, d;
  return $.isPlainObject(a) ? (c = {}, d = _(a).keys(), d.sort(), _(d).each(function(d) {
    var e = a[d];
    c[d] = b ? sortObject(e, b) : e
  }), c) : b && _(a).isArray() ? c = _(a).map(function(a) {
    return b ? sortObject(a, b) : a
  }) : a
}

function getHashCode(a) {
  var b = 0,
    c, d;
  if (a.length)
    for (d = 0; d < a.length; d++) c = a.charCodeAt(d), b = (b << 5) - b + c, b &= b;
  return b
}

function escapeHTML(a) {
  var b = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
  };
  return String(a).replace(/[&<>"'\/]/g, function(a) {
    return b[a] || a
  })
}

function padStringToLength(a, b, c, d) {
  a += "";
  for (c = _(c).isString() ? c : "0"; a.length < b;) a = d ? c + a : a + c;
  return a
}

function closeHtmlTags(a) {
  var b = /<(?!meta|img|br|hr|input\b)([/]?)([a-z]+)([^>]*)?>/i,
    c = [],
    d = [],
    f, e;
  for (f = b.exec(a); f;) {
    d.push(a.substr(0, f.index));
    a = a.substr(f.index + f[0].length);
    if ("/" !== f[1]) c.push(f[2]), d.push(f[0]);
    else
      for (; c.length && (e = c.pop(), d.push("</" + e + ">"), e !== f[2]););
    f = b.exec(a)
  }
  for (d.push(a); c.length;) e = c.pop(), d.push("</" + e + ">");
  return d.join("")
}

function preload(a) {
  var b = $.Deferred(),
    c = [],
    d = [];
  _(a).each(function(f) {
    var e = $.Deferred();
    e.done(function(a) {
      d.push(a.src)
    }).fail(function(a) {
      c.push(a.src)
    }).always(function() {
      var e = _(d).clone(),
        f = _(c).clone();
      b.notify(e, f);
      d.length + c.length === a.length && b.resolve(e, f)
    });
    $("<img/>", {
      load: function() {
        $(this).off("load error");
        e.resolve(this)
      },
      error: function() {
        $(this).off("load error");
        e.reject(this)
      },
      src: f
    })
  });
  return b.promise()
}
$.fn.truncateBlockAtLine = function(a, b, c) {
  function d(a) {
    a = a.join(" ");
    return closeHtmlTags || !1 === c ? closeHtmlTags(a) : a
  }
  var f = $(this).eq(0),
    e, g, h, l, k;
  if (f.html().length && "inline" !== f.css("display") && !f.find("*").filter(function() {
    return "inline" !== $(this).css("display")
  }).add("br,hr", f).length) {
    e = f.html().split(" ");
    b = "string" == $.type(b) ? b : "";
    a = $.isNumeric(a) && 0 < a ? a : 1;
    g = f.clone();
    f.replaceWith(g);
    h = g.wrapInner("<div/>").children("div");
    l = parseInt(g.css("line-height"), 10);
    k = a / Math.floor(h.height() / l);
    if (1 > k) {
      k = Math.ceil(e.length * k);
      do h.html(d(e.slice(0, k++)) + b); while (Math.floor(h.height() / l) <= a);
      do h.html(d(e.slice(0, k--)) + b); while (Math.floor(h.height() / l) > a);
      f.html(h.html());
      g.replaceWith(f);
      return !0
    }
    g.replaceWith(f)
  }
  return !1
};

function jqEscape(a) {
  return a.replace(/([#;&,\.\+\*\~':"\!\^$\[\]\(\)=>\|\/])/g, "\\$1")
}
var KEYCODES = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  capsLock: 20,
  esc: 27,
  space: 32,
  pageUp: 33,
  pageDown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  insert: 45,
  "delete": 46,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  leftWindows: 91,
  rightWindows: 92,
  numpad0: 96,
  numpad1: 97,
  numpad2: 98,
  numpad3: 99,
  numpad4: 100,
  numpad5: 101,
  numpad6: 102,
  numpad7: 103,
  numpad8: 104,
  numpad9: 105,
  multiply: 106,
  add: 107,
  subtract: 109,
  decimalPoint: 110,
  divide: 111,
  f1: 112,
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123,
  numLock: 144,
  scrollLock: 145,
  semicolon: 186,
  equalSign: 187,
  comma: 188,
  dash: 189,
  period: 190,
  slash: 191,
  grave: 192,
  bracketOpen: 219,
  backslash: 220,
  bracketClose: 221,
  singleQuote: 222
}, COUNTRIES = {
    US: "United States",
    AF: "Afghanistan",
    AX: "\u00c5land Islands",
    AL: "Albania",
    DZ: "Algeria",
    AS: "American Samoa",
    AD: "Andorra",
    AO: "Angola",
    AI: "Anguilla",
    AQ: "Antarctica",
    AG: "Antigua and Barbuda",
    AR: "Argentina",
    AM: "Armenia",
    AW: "Aruba",
    AU: "Australia",
    AT: "Austria",
    AZ: "Azerbaijan",
    BS: "Bahamas",
    BH: "Bahrain",
    BD: "Bangladesh",
    BB: "Barbados",
    BY: "Belarus",
    BE: "Belgium",
    BZ: "Belize",
    BJ: "Benin",
    BM: "Bermuda",
    BT: "Bhutan",
    BO: "Bolivia",
    BA: "Bosnia and Herzegovina",
    BW: "Botswana",
    BV: "Bouvet Island",
    BR: "Brazil",
    IO: "British Indian Ocean Territory",
    BN: "Brunei Darussalam",
    BG: "Bulgaria",
    BF: "Burkina Faso",
    BI: "Burundi",
    KH: "Cambodia",
    CM: "Cameroon",
    CA: "Canada",
    CV: "Cape Verde",
    KY: "Cayman Islands",
    CF: "Central African Republic",
    TD: "Chad",
    CL: "Chile",
    CN: "China",
    CX: "Christmas Island",
    CC: "Cocos (Keeling) Islands",
    CO: "Colombia",
    KM: "Comoros",
    CG: "Congo",
    CD: "Congo, The Democratic Republic of the",
    CK: "Cook Islands",
    CR: "Costa Rica",
    CI: "Cote D'Ivoire",
    HR: "Croatia",
    CU: "Cuba",
    CY: "Cyprus",
    CZ: "Czech Republic",
    DK: "Denmark",
    DJ: "Djibouti",
    DM: "Dominica",
    DO: "Dominican Republic",
    EC: "Ecuador",
    EG: "Egypt",
    SV: "El Salvador",
    GQ: "Equatorial Guinea",
    ER: "Eritrea",
    EE: "Estonia",
    ET: "Ethiopia",
    FK: "Falkland Islands (Malvinas)",
    FO: "Faroe Islands",
    FJ: "Fiji",
    FI: "Finland",
    FR: "France",
    GF: "French Guiana",
    PF: "French Polynesia",
    TF: "French Southern Territories",
    GA: "Gabon",
    GM: "Gambia",
    GE: "Georgia",
    DE: "Germany",
    GH: "Ghana",
    GI: "Gibraltar",
    GR: "Greece",
    GL: "Greenland",
    GD: "Grenada",
    GP: "Guadeloupe",
    GU: "Guam",
    GT: "Guatemala",
    GG: "Guernsey",
    GN: "Guinea",
    GW: "Guinea-Bissau",
    GY: "Guyana",
    HT: "Haiti",
    HM: "Heard Island and Mcdonald Islands",
    VA: "Holy See (Vatican City State)",
    HN: "Honduras",
    HK: "Hong Kong",
    HU: "Hungary",
    IS: "Iceland",
    IN: "India",
    ID: "Indonesia",
    IR: "Iran, Islamic Republic Of",
    IQ: "Iraq",
    IE: "Ireland",
    IM: "Isle of Man",
    IL: "Israel",
    IT: "Italy",
    JM: "Jamaica",
    JP: "Japan",
    JE: "Jersey",
    JO: "Jordan",
    KZ: "Kazakhstan",
    KE: "Kenya",
    KI: "Kiribati",
    KP: "Korea, Democratic People'S Republic of",
    KR: "Korea, Republic of",
    KW: "Kuwait",
    KG: "Kyrgyzstan",
    LA: "Lao People'S Democratic Republic",
    LV: "Latvia",
    LB: "Lebanon",
    LS: "Lesotho",
    LR: "Liberia",
    LY: "Libyan Arab Jamahiriya",
    LI: "Liechtenstein",
    LT: "Lithuania",
    LU: "Luxembourg",
    MO: "Macao",
    MK: "Macedonia, The Former Yugoslav Republic of",
    MG: "Madagascar",
    MW: "Malawi",
    MY: "Malaysia",
    MV: "Maldives",
    ML: "Mali",
    MT: "Malta",
    MH: "Marshall Islands",
    MQ: "Martinique",
    MR: "Mauritania",
    MU: "Mauritius",
    YT: "Mayotte",
    MX: "Mexico",
    FM: "Micronesia, Federated States of",
    MD: "Moldova, Republic of",
    MC: "Monaco",
    MN: "Mongolia",
    MS: "Montserrat",
    MA: "Morocco",
    MZ: "Mozambique",
    MM: "Myanmar",
    NA: "Namibia",
    NR: "Nauru",
    NP: "Nepal",
    NL: "Netherlands",
    AN: "Netherlands Antilles",
    NC: "New Caledonia",
    NZ: "New Zealand",
    NI: "Nicaragua",
    NE: "Niger",
    NG: "Nigeria",
    NU: "Niue",
    NF: "Norfolk Island",
    MP: "Northern Mariana Islands",
    NO: "Norway",
    OM: "Oman",
    PK: "Pakistan",
    PW: "Palau",
    PS: "Palestinian Territory, Occupied",
    PA: "Panama",
    PG: "Papua New Guinea",
    PY: "Paraguay",
    PE: "Peru",
    PH: "Philippines",
    PN: "Pitcairn",
    PL: "Poland",
    PT: "Portugal",
    PR: "Puerto Rico",
    QA: "Qatar",
    RW: "RWANDA",
    RE: "Reunion",
    RO: "Romania",
    RU: "Russian Federation",
    SH: "Saint Helena",
    KN: "Saint Kitts and Nevis",
    LC: "Saint Lucia",
    PM: "Saint Pierre and Miquelon",
    VC: "Saint Vincent and the Grenadines",
    WS: "Samoa",
    SM: "San Marino",
    ST: "Sao Tome and Principe",
    SA: "Saudi Arabia",
    SN: "Senegal",
    CS: "Serbia and Montenegro",
    SC: "Seychelles",
    SL: "Sierra Leone",
    SG: "Singapore",
    SK: "Slovakia",
    SI: "Slovenia",
    SB: "Solomon Islands",
    SO: "Somalia",
    ZA: "South Africa",
    GS: "South Georgia and the South Sandwich Islands",
    ES: "Spain",
    LK: "Sri Lanka",
    SD: "Sudan",
    SR: "Suriname",
    SJ: "Svalbard and Jan Mayen",
    SZ: "Swaziland",
    SE: "Sweden",
    CH: "Switzerland",
    SY: "Syrian Arab Republic",
    TW: "Taiwan",
    TJ: "Tajikistan",
    TZ: "Tanzania, United Republic of",
    TH: "Thailand",
    TL: "Timor-Leste",
    TG: "Togo",
    TK: "Tokelau",
    TO: "Tonga",
    TT: "Trinidad and Tobago",
    TN: "Tunisia",
    TR: "Turkey",
    TM: "Turkmenistan",
    TC: "Turks and Caicos Islands",
    TV: "Tuvalu",
    UG: "Uganda",
    UA: "Ukraine",
    AE: "United Arab Emirates",
    GB: "United Kingdom",
    UM: "United States Minor Outlying Islands",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VU: "Vanuatu",
    VE: "Venezuela",
    VN: "Viet Nam",
    VG: "Virgin Islands, British",
    VI: "Virgin Islands, U.S.",
    WF: "Wallis and Futuna",
    EH: "Western Sahara",
    YE: "Yemen",
    ZM: "Zambia",
    ZW: "Zimbabwe"
  }, Page = function() {
    var a = "/" === window.location.pathname ? "/index.html" : window.location.pathname,
      b = {
        main: "/index.html",
        landing: "landing.html",
        welcome: "welcome.html",
        iosLauncher: "/ios_launcher.html",
        addEmail: "/add_email.html",
        archive: "/archive.html",
        coupon: "/coupon.html",
        download: "/download.html",
        invite: "/invite.html",
        mailingList: "/mailing_list.html",
        "public": "/public.html",
        resetPassword: "/reset.html",
        subscribe: "/subscribe.html",
        support: "/support.html",
        unsubscribe: "/unsubscribe.html",
        verify: "/verify.html",
        serviceAuth: "/auth.html",
        walgreensCart: "/walgreens.html",
        photoDump: "/photo_dump.html"
      };
    return {
      current: a.replace(/^\//,
        "").replace(/\.html/, "") || "index",
      path: a,
      isLanding: a === b.landing,
      isPublic: a === b["public"],
      all: b,
      special: {
        iOSApp: "everpix://"
      }
    }
  }(),
  Platform = function() {
    var a = window.navigator.userAgent,
      b = window.navigator.platform,
      c = {
        browser: "Unknown",
        browserVersion: "Unknown",
        os: "Unknown",
        osVersion: "Unknown",
        canLogin: $.support.cors,
        underpowered: !1
      };
    $.each({
      "Mobile Safari": {
        matches: function() {
          return /(iPhone|iPad|iPod)/.test(a) && /(Safari)/.test(a) && /(Version)/.test(a)
        },
        version: function() {
          var d = /Version\/(([0-9]*\.?)+)\sMobile/.exec(a);
          return d && 0 < d.length ? d[1] : "Unknown"
        },
        canLogin: function() {
          var a = this.browserVersion;
          return "Unknown" === a || 6 <= parseFloat(a)
        }
      },
      "Chrome for iOS": {
        matches: function() {
          return /(iPhone|iPad|iPod)/.test(a) && /(CriOS)/.test(a)
        },
        version: function() {
          var d = /CriOS\/(([0-9]*\.?)+)\sMobile/.exec(a);
          return d && 0 < d.length ? d[1] : "Unknown"
        }
      },
      Chrome: {
        matches: function() {
          return /Chrome/.test(a)
        },
        version: function() {
          var d = /Chrome\/(([0-9]*\.?)+)/.exec(a);
          return d && 0 < d.length ? d[1] : "Unknown"
        },
        canLogin: function() {
          var a = this.browserVersion;
          return "Unknown" === a || 10 <= parseFloat(a)
        }
      },
      "Internet Explorer": {
        matches: function() {
          return /MSIE/.test(a) || /Trident/.test(a)
        },
        version: function() {
          var d = /(MSIE\s|rv:)(([0-9]*\.?)+)/.exec(a);
          return d && 1 < d.length ? d[2] : "Unknown"
        },
        canLogin: function() {
          var a = this.browserVersion;
          return "Unknown" === a || 8 <= parseFloat(a)
        }
      },
      Firefox: {
        matches: function() {
          return /Firefox/.test(a)
        },
        version: function() {
          var d = /Firefox\/(([0-9]*\.?)+)/.exec(a);
          return d && 0 < d.length ? d[1] : "Unknown"
        },
        canLogin: function() {
          var a = this.browserVersion;
          return "Unknown" === a || 4 <= parseFloat(a)
        }
      },
      Safari: {
        matches: function() {
          return /Apple/.test(window.navigator.vendor) && /Safari/.test(a)
        },
        version: function() {
          var d = /Version\/(([0-9]*\.?)+)/.exec(a);
          return d && 0 < d.length ? d[1] : "Unknown"
        },
        canLogin: function() {
          var a = this.browserVersion;
          return "Unknown" === a || 5 <= parseFloat(a)
        }
      },
      Opera: {
        matches: function() {
          return !!window.opera
        },
        version: function() {
          var d = /Version\/(([0-9]*\.?)+)/.exec(a);
          return d && 0 < d.length ? d[1] : "Unknown"
        },
        canLogin: function() {
          var a = this.browserVersion;
          return "Unknown" === a || 12 <= parseFloat(a)
        }
      }
    }, function(a, b) {
      return b.matches() ? (c.browser = a, $.isFunction(b.version) ? c.browserVersion = b.version.call(c) : c.browserVersion = b.version.toString(), $.isFunction(b.canLogin) ? c.canLogin = b.canLogin.call(c) : void 0 !== b.canLogin && (c.canLogin = !! b.canLogin), $.isFunction(b.underpowered) ? c.underpowered = b.underpowered.call(c) : void 0 !== b.underpowered && (c.underpowered = !! b.underpowered), !1) : !0
    });
    $.each({
      Windows: {
        matches: function() {
          return /Win/.test(b)
        },
        version: function() {
          var b =
            /(Windows|Win)\s?((NT\s([0-9]*\.?)+)|XP|98|95)/.exec(a);
          return b && 1 < b.length ? b[2] : "Unknown"
        }
      },
      Mac: {
        matches: function() {
          return /Mac/.test(b)
        },
        version: function() {
          var b = /Mac\sOS\sX\s(([0-9]*(_|\.)?)+)/.exec(a);
          return b && 0 < b.length ? b[1].replace(/_/g, ".") : "Unknown"
        }
      },
      iOS: {
        matches: function() {
          return /(iPhone|iPad|iPod)/.test(a)
        },
        version: function() {
          var b = /(Version|CriOS)\/(([0-9]*\.?)+)\sMobile/.exec(a);
          return b && 1 < b.length ? b[2] : "Unknown"
        },
        device: function() {
          var b = /(iPhone|iPad|iPod)/.exec(a);
          return b && 0 < b.length ?
            b[1] : "Unknown"
        },
        underpowered: function() {
          return "iPad" !== this.device || 6 > this.osVersion
        }
      },
      Android: {
        matches: function() {
          return /Android/.test(a)
        },
        version: function() {
          var b = /Android\s(([0-9]*\.?)+(-update[0-9]*)?);/.exec(a);
          return b && 0 < b.length ? b[1] : "Unknown"
        },
        device: "Android",
        canLogin: function() {
          return "Chrome" === this.browser
        },
        underpowered: !0
      },
      Linux: {
        matches: function() {
          return /Linux/.test(b)
        },
        version: "Unknown"
      }
    }, function(a, b) {
      return b.matches() ? (c.os = a, $.isFunction(b.version) ? c.osVersion = b.version.call(c) :
        c.osVersion = b.version.toString(), $.isFunction(b.device) ? c.device = b.device.call(c) : b.device && (c.device = b.device.toString()), $.isFunction(b.canLogin) ? c.canLogin = b.canLogin.call(c) : void 0 !== b.canLogin && (c.canLogin = !! b.canLogin && c.canLogin), $.isFunction(b.underpowered) ? c.underpowered = b.underpowered.call(c) : void 0 !== b.underpowered && (c.underpowered = !! b.underpowered || c.underpowered), !1) : !0
    });
    $(function() {
      $("html").attr({
        "data-browser": c.browser,
        "data-browser-version": c.browserVersion,
        "data-os": c.os,
        "data-os-version": c.osVersion
      }).toggleClass("underpowered",
        c.underpowered)
    });
    "Mobile Safari" === c.browser && 6 > parseFloat(c.osVersion) && setTimeout(function() {
      window.scrollTo(0, 0)
    }, 0);
    c.underpowered && (Modernizr.csstransitions = !1, Modernizr.animations = !1, $("html").removeClass("csstransitions cssanimations").addClass("no-csstransitions no-cssanimations"));
    return $.extend({
      toString: function() {
        return window.JSON.stringify(c, null, "\t")
      }
    }, c)
  }(),
  PubHub = function() {
    return {
      pub: function() {
        return amplify.publish.apply(null, arguments)
      },
      sub: function() {
        return amplify.subscribe.apply(null,
          arguments)
      },
      drubSub: function() {
        return amplify.unsubscribe.apply(null, arguments)
      }
    }
  }(),
  Query = function() {
    var a = $.deparam(window.location.search.substr(1));
    _(a).each(function(b, c) {
      $.isNumeric(b) ? a[c] = +b : "true" === b ? a[c] = !0 : "false" === b && (a[c] = !1)
    });
    return a
  }(),
  Cookie = function(a) {
    var b = {}, c = {}, d = !1,
      f, e = $.Deferred();
    b.ready = function(a) {
      a && a.promise ? a.follow(e) : $.isFunction(a) && e.done(a);
      return e.promise()
    };
    b.isReady = function() {
      return "resolved" === e.state()
    };
    b.getLocal = function(a) {
      var e;
      return b.hasLocal ? a ?
        (void 0 === c.name && (e = a + "=", $.each(document.cookie.split(";"), function(b, d) {
        for (;
          " " === d.charAt(0);) d = d.substr(1);
        return 0 === d.indexOf(e) ? (c[a] = d.substr(e.length), !1) : !0
      })), c[a]) : _(c).clone() : null
    };
    b.setLocal = function(a, e, d) {
      var f = [a + "=" + e];
      if (!b.hasLocal) return null;
      0 === d ? (f.push("expires=Thu, 01-Jan-1970 00:00:01 GMT"), delete c[a]) : $.isNumeric(d) && (f.push("expires=" + (new Date($.now() + 864E5 * d)).toUTCString()), c[a] = e);
      f.push("path=/");
      document.cookie = f.join("; ");
      PubHub.pub("Cookie/setLocal", a, e, d);
      return a
    };
    b.clearLocal = function(a) {
      if (!b.hasLocal) return null;
      a ? b.setLocal(a, "", 0) : $.each(c, function(a) {
        b.clearLocal(a)
      });
      return !0
    };
    b.getRemote = function(a) {
      return a ? d[a] : d ? _(d).clone() : !1
    };
    b.setRemote = function(a, b) {
      var e = $.Deferred(),
        c = {};
      if (!window.API) return e.reject();
      $.isPlainObject(a) ? c = a : c[a] = b;
      $.each(c, function(a, b) {
        d[a] === b && delete c[a]
      });
      $.isEmptyObject(c) ? e.resolve() : API.request("setCookie", c, function(a, b) {
        200 === b ? ($.each(c, function(a, b) {
          b ? d[a] = b : delete d[a]
        }), e.resolve(), PubHub.pub("Cookie/setRemote",
          c)) : e.reject(b)
      });
      return e.promise()
    };
    b.clearRemote = function(a) {
      if (a) return b.setRemote(a, null);
      $.each(d, function(a) {
        b.clearRemote(a)
      });
      return this
    };
    navigator.cookieEnabled ? b.hasLocal = !0 : (document.cookie = "cookietest=1", b.hasLocal = -1 !== document.cookie.indexOf("cookietest="), document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT");
    _(document.cookie.split(";")).each(function(a, b) {
      for (var e;
        " " === a.charAt(0);) a = a.substr(1);
      e = a.split("=")[0];
      c[e] = a.substr(e.length + 1)
    });
    f = PubHub.sub("API/ready",
      function() {
        PubHub.drubSub("API/ready", f);
        API.define("setCookie", "POST", "user_update", {
          dataMap: function(a) {
            a && (a.cookies = {}, $.each(a, function(b, e) {
              "_" !== b[0] && "cookies" !== b && (delete a[b], a.cookies[b] = e)
            }), a.cookies = window.JSON.stringify(a.cookies));
            return a
          }
        });
        PubHub.sub("API/success", function(a, b, c, f) {
          b = !1; - 1 < "getUserInfo setUserInfo refreshUser register login resetPassword".split(" ").indexOf(a) && (f && f.cookies) && (a = $.extend({}, f.cookies), d || (b = !0, d = {}), $.each(a, function(a, b) {
            d[a] = b
          }), b && (PubHub.pub("Cookie/hasRemote",
            d), e.resolve()))
        })
      });
    return b
  }(amplify);
Viewport = function() {
  var a = window,
    b = document,
    c = $(a),
    d = $("html"),
    f = {
      top: void 0,
      height: void 0,
      viewHeight: void 0,
      left: void 0,
      width: void 0,
      viewWidth: void 0,
      layoutSize: void 0,
      columns: void 0,
      deltas: {
        top: 0,
        height: 0,
        left: 0,
        width: 0
      },
      updating: !1,
      checkAgain: void 0,
      getTop: function(e) {
        return this.updating && !e && void 0 !== this.top ? this.top : void 0 !== a.pageYOffset ? a.pageYOffset : (b.documentElement || b.body.parentNode || b.body).scrollTop
      },
      getBottom: function(a) {
        return this.getViewHeight(a) - (this.getTop(a) + this.getHeight(a))
      },
      getLeft: function(c) {
        return this.updating && !c && void 0 !== this.left ? this.left : void 0 !== a.pageXOffset ? a.pageXOffset : (b.documentElement || b.body.parentNode || b.body).scrollLeft
      },
      getRight: function(a) {
        return this.getViewWidth(a) - (this.getLeft(a) + this.getWidth(a))
      },
      getHeight: function(a) {
        return this.updating && !a && void 0 !== this.height ? this.height : c.height()
      },
      getWidth: function(a) {
        return this.updating && !a && void 0 !== this.width ? this.width : c.width()
      },
      getLayoutSize: function(c) {
        return this.updating && !c && void 0 !== this.layoutSize ?
          this.layoutSize : a.getComputedStyle ? a.getComputedStyle(b.body, ":after").getPropertyValue("content").replace(/'|"/g, "").split("/")[0] : DEFAULT_LAYOUTSIZE
      },
      getColumns: function(c) {
        return this.updating && !c && void 0 !== this.columns ? this.columns : a.getComputedStyle ? +a.getComputedStyle(b.body, ":after").getPropertyValue("content").replace(/'|"/g, "").split("/")[1] : DEFAULT_COLUMNS
      },
      getDeltas: function() {
        return this.deltas
      },
      getViewHeight: function(a) {
        return this.updating && !a && void 0 !== this.viewHeight ? this.viewHeight :
          $(".view.active").outerHeight() || $("body").outerHeight() || 0
      },
      getViewWidth: function(a) {
        return this.updating && !a && void 0 !== this.viewWidth ? this.viewWidth : $(".view.active").outerWidth() || $("body").outerWidth() || 0
      },
      withinYOfTop: function(a) {
        return this.getTop() <= a
      },
      withinYOfBottom: function(a) {
        return this.getBottom() <= a
      },
      withinXOfLeft: function(a) {
        return this.getLeft() <= a
      },
      withinXOfRight: function(a) {
        return this.getRight() <= a
      },
      update: function() {
        var a = {
          top: this.getTop(!0),
          height: this.getHeight(!0),
          left: this.getLeft(!0),
          width: this.getWidth(!0),
          layoutSize: this.getLayoutSize(!0),
          columns: this.getColumns(!0)
        };
        a.deltas = {
          top: a.top - (this.top || 0),
          height: a.height - (this.height || 0),
          left: a.left - (this.left || 0),
          width: a.width - (this.width || 0),
          layoutSize: a.layoutSize !== this.layoutSize ? a.layoutSize : !1,
          columns: a.columns - (this.columns || 0)
        };
        a.deltas.top && (this.top = a.top);
        a.deltas.height && (this.height = a.height);
        a.deltas.left && (this.left = a.left);
        a.deltas.width && (this.width = a.width);
        a.deltas.layoutSize && (this.layoutSize = a.layoutSize, d.attr("data-layout-size",
          this.layoutSize));
        a.deltas.columns && (this.columns = a.columns, d.attr("data-columns", this.columns));
        this.deltas = a.deltas;
        return a
      },
      publish: function(a) {
        PubHub.pub("Viewport/update", a)
      },
      check: function(a) {
        var b = this,
          c = b.update();
        !a && (a = _(c.deltas).any(function(a) {
          return !a
        })) && (b.updating || (b.updating = !0, d.addClass("updating")), clearTimeout(b.checkAgain), b.checkAgain = setTimeout(function() {
          b.updating = !1;
          d.removeClass("updating")
        }, 200));
        b.publish(c)
      },
      setHTMLAttributes: function() {
        d.attr({
          "data-layout-size": this.getLayoutSize(),
          "data-columns": this.getColumns()
        })
      },
      isUpdating: function() {
        return this.updating
      },
      isUpdatingHeavy: function() {
        return this.updating ? 300 < Math.abs(this.deltas.top) + Math.abs(this.deltas.left) || this.deltas.width || this.deltas.height ? !0 : !1 : !1
      }
    };
  $(function() {
    f.setHTMLAttributes();
    c.on("scroll.viewport resize.viewport orientationchange.viewport", $.throttle(50, function() {
      f.check()
    }))
  });
  return f
}();
