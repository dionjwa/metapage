// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"UASB":[function(require,module,exports) {
'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],"GPLR":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetapageVersionCurrent = exports.MetapageVersionsAll = exports.MetaframeVersionCurrent = exports.MetaframeVersionsAll = exports.VersionsMetapage = exports.VersionsMetaframe = void 0;
var VersionsMetaframe;
exports.VersionsMetaframe = VersionsMetaframe;

(function (VersionsMetaframe) {
  VersionsMetaframe["V0_3"] = "0.3";
  VersionsMetaframe["V0_4"] = "0.4";
})(VersionsMetaframe || (exports.VersionsMetaframe = VersionsMetaframe = {}));

var VersionsMetapage;
exports.VersionsMetapage = VersionsMetapage;

(function (VersionsMetapage) {
  VersionsMetapage["V0_2"] = "0.2";
  VersionsMetapage["V0_3"] = "0.3";
})(VersionsMetapage || (exports.VersionsMetapage = VersionsMetapage = {}));

const MetaframeVersionsAll = Object.keys(VersionsMetaframe);
exports.MetaframeVersionsAll = MetaframeVersionsAll;
const MetaframeVersionCurrent = VersionsMetaframe.V0_4;
exports.MetaframeVersionCurrent = MetaframeVersionCurrent;
const MetapageVersionsAll = Object.keys(VersionsMetapage);
exports.MetapageVersionsAll = MetapageVersionsAll;
const MetapageVersionCurrent = VersionsMetapage.V0_3;
exports.MetapageVersionCurrent = MetapageVersionCurrent;
},{}],"s3GQ":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "MetaframeVersionCurrent", {
  enumerable: true,
  get: function () {
    return _versions.MetaframeVersionCurrent;
  }
});
Object.defineProperty(exports, "MetapageVersionCurrent", {
  enumerable: true,
  get: function () {
    return _versions.MetapageVersionCurrent;
  }
});
Object.defineProperty(exports, "MetaframeVersionsAll", {
  enumerable: true,
  get: function () {
    return _versions.MetaframeVersionsAll;
  }
});
Object.defineProperty(exports, "MetapageVersionsAll", {
  enumerable: true,
  get: function () {
    return _versions.MetapageVersionsAll;
  }
});

var _versions = require("./versions");
},{"./versions":"GPLR"}],"jX2q":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetapageEvents = void 0;
var MetapageEvents;
exports.MetapageEvents = MetapageEvents;

(function (MetapageEvents) {
  MetapageEvents["Inputs"] = "inputs";
  MetapageEvents["Outputs"] = "outputs";
  MetapageEvents["State"] = "state";
  MetapageEvents["Definition"] = "definition";
  MetapageEvents["DefinitionUpdateRequest"] = "definitionupdaterequest";
  MetapageEvents["Error"] = "error";
  MetapageEvents["UrlHashUpdate"] = "urlhashupdate";
  MetapageEvents["Message"] = "Message";
})(MetapageEvents || (exports.MetapageEvents = MetapageEvents = {}));
},{}],"TmGQ":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApiPayloadPluginRequestMethod = exports.JsonRpcMethodsFromParent = exports.JsonRpcMethodsFromChild = void 0;
var JsonRpcMethodsFromChild;
exports.JsonRpcMethodsFromChild = JsonRpcMethodsFromChild;

(function (JsonRpcMethodsFromChild) {
  JsonRpcMethodsFromChild["InputsUpdate"] = "InputsUpdate";
  JsonRpcMethodsFromChild["OutputsUpdate"] = "OutputsUpdate";
  JsonRpcMethodsFromChild["SetupIframeClientRequest"] = "SetupIframeClientRequest";
  JsonRpcMethodsFromChild["SetupIframeServerResponseAck"] = "SetupIframeServerResponseAck";
  JsonRpcMethodsFromChild["PluginRequest"] = "SetupIframeServerPluginRequestResponseAck";
  JsonRpcMethodsFromChild["HashParamsUpdate"] = "HashParamsUpdate";
})(JsonRpcMethodsFromChild || (exports.JsonRpcMethodsFromChild = JsonRpcMethodsFromChild = {}));

var JsonRpcMethodsFromParent;
exports.JsonRpcMethodsFromParent = JsonRpcMethodsFromParent;

(function (JsonRpcMethodsFromParent) {
  JsonRpcMethodsFromParent["InputsUpdate"] = "InputsUpdate";
  JsonRpcMethodsFromParent["MessageAck"] = "MessageAck";
  JsonRpcMethodsFromParent["SetupIframeServerResponse"] = "SetupIframeServerResponse";
})(JsonRpcMethodsFromParent || (exports.JsonRpcMethodsFromParent = JsonRpcMethodsFromParent = {}));

var ApiPayloadPluginRequestMethod;
exports.ApiPayloadPluginRequestMethod = ApiPayloadPluginRequestMethod;

(function (ApiPayloadPluginRequestMethod) {
  ApiPayloadPluginRequestMethod["State"] = "metapage/state";
})(ApiPayloadPluginRequestMethod || (exports.ApiPayloadPluginRequestMethod = ApiPayloadPluginRequestMethod = {}));
},{}],"D/Lb":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"FmIn":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
;
},{}],"1svx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require("./core");

Object.keys(_core).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _core[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _core[key];
    }
  });
});

var _events = require("./events");

Object.keys(_events).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _events[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _events[key];
    }
  });
});

var _jsonrpc = require("./jsonrpc");

Object.keys(_jsonrpc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _jsonrpc[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _jsonrpc[key];
    }
  });
});

var _metaframe = require("./metaframe");

Object.keys(_metaframe).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _metaframe[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _metaframe[key];
    }
  });
});

var _metapage = require("./metapage");

Object.keys(_metapage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _metapage[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _metapage[key];
    }
  });
});

var _versions = require("./versions");

Object.keys(_versions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _versions[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _versions[key];
    }
  });
});
},{"./core":"s3GQ","./events":"jX2q","./jsonrpc":"TmGQ","./metaframe":"D/Lb","./metapage":"FmIn","./versions":"GPLR"}],"Xnuv":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VERSION_METAFRAME = exports.VERSION_METAPAGE = exports.METAPAGE_KEY_STATE = exports.METAPAGE_KEY_DEFINITION = exports.METAFRAME_JSON_FILE = void 0;

var _v0_ = require("./v0_4");

const METAFRAME_JSON_FILE = "metaframe.json";
exports.METAFRAME_JSON_FILE = METAFRAME_JSON_FILE;
const METAPAGE_KEY_DEFINITION = "metapage/definition";
exports.METAPAGE_KEY_DEFINITION = METAPAGE_KEY_DEFINITION;
const METAPAGE_KEY_STATE = "metapage/state";
exports.METAPAGE_KEY_STATE = METAPAGE_KEY_STATE;
const VERSION_METAPAGE = _v0_.MetapageVersionsAll[_v0_.MetapageVersionsAll.length - 1];
exports.VERSION_METAPAGE = VERSION_METAPAGE;
const VERSION_METAFRAME = _v0_.MetaframeVersionsAll[_v0_.MetaframeVersionsAll.length - 1];
exports.VERSION_METAFRAME = VERSION_METAFRAME;
},{"./v0_4":"1svx"}],"ojAg":[function(require,module,exports) {
var define;
/* global define */
(function (root, factory) {
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.compareVersions = factory();
  }
}(this, function () {

  var semver = /^v?(?:\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+))?(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;

  function indexOrEnd(str, q) {
    return str.indexOf(q) === -1 ? str.length : str.indexOf(q);
  }

  function split(v) {
    var c = v.replace(/^v/, '').replace(/\+.*$/, '');
    var patchIndex = indexOrEnd(c, '-');
    var arr = c.substring(0, patchIndex).split('.');
    arr.push(c.substring(patchIndex + 1));
    return arr;
  }

  function tryParse(v) {
    return isNaN(Number(v)) ? v : Number(v);
  }

  function validate(version) {
    if (typeof version !== 'string') {
      throw new TypeError('Invalid argument expected string');
    }
    if (!semver.test(version)) {
      throw new Error('Invalid argument not valid semver (\''+version+'\' received)');
    }
  }

  function compareVersions(v1, v2) {
    [v1, v2].forEach(validate);

    var s1 = split(v1);
    var s2 = split(v2);

    for (var i = 0; i < Math.max(s1.length - 1, s2.length - 1); i++) {
      var n1 = parseInt(s1[i] || 0, 10);
      var n2 = parseInt(s2[i] || 0, 10);

      if (n1 > n2) return 1;
      if (n2 > n1) return -1;
    }

    var sp1 = s1[s1.length - 1];
    var sp2 = s2[s2.length - 1];

    if (sp1 && sp2) {
      var p1 = sp1.split('.').map(tryParse);
      var p2 = sp2.split('.').map(tryParse);

      for (i = 0; i < Math.max(p1.length, p2.length); i++) {
        if (p1[i] === undefined || typeof p2[i] === 'string' && typeof p1[i] === 'number') return -1;
        if (p2[i] === undefined || typeof p1[i] === 'string' && typeof p2[i] === 'number') return 1;

        if (p1[i] > p2[i]) return 1;
        if (p2[i] > p1[i]) return -1;
      }
    } else if (sp1 || sp2) {
      return sp1 ? -1 : 1;
    }

    return 0;
  };

  var allowedOperators = [
    '>',
    '>=',
    '=',
    '<',
    '<='
  ];

  var operatorResMap = {
    '>': [1],
    '>=': [0, 1],
    '=': [0],
    '<=': [-1, 0],
    '<': [-1]
  };

  function validateOperator(op) {
    if (typeof op !== 'string') {
      throw new TypeError('Invalid operator type, expected string but got ' + typeof op);
    }
    if (allowedOperators.indexOf(op) === -1) {
      throw new TypeError('Invalid operator, expected one of ' + allowedOperators.join('|'));
    }
  }

  compareVersions.validate = function(version) {
    return typeof version === 'string' && semver.test(version);
  }

  compareVersions.compare = function (v1, v2, operator) {
    // Validate operator
    validateOperator(operator);

    // since result of compareVersions can only be -1 or 0 or 1
    // a simple map can be used to replace switch
    var res = compareVersions(v1, v2);
    return operatorResMap[operator].indexOf(res) > -1;
  }

  return compareVersions;
}));

},{}],"Q9lO":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetapageShared = exports.isIframe = exports.MetapageHashParams = void 0;

var _eventemitter = require("eventemitter3");

var _v0_ = require("./v0_4");

var MetapageHashParams;
exports.MetapageHashParams = MetapageHashParams;

(function (MetapageHashParams) {
  MetapageHashParams["mp_debug"] = "mp_debug";
})(MetapageHashParams || (exports.MetapageHashParams = MetapageHashParams = {}));

const isIframe = () => {
  try {
    return window !== window.top;
  } catch (ignored) {
    return false;
  }
};

exports.isIframe = isIframe;

class MetapageShared extends _eventemitter.EventEmitter {
  constructor() {
    super();
    this._definition = {
      version: _v0_.VersionsMetapage.V0_3,
      metaframes: {}
    };
    this.getDefinition = this.getDefinition.bind(this);
  }

  error(err) {
    throw 'Subclass should implement';
  }

  getDefinition() {
    return this._definition;
  }

}

exports.MetapageShared = MetapageShared;
;
},{"eventemitter3":"UASB","./v0_4":"1svx"}],"f0H1":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.base64encode = base64encode;
exports.base64decode = base64decode;
exports.pageLoaded = exports.isPageLoaded = exports.intToRGB = exports.hashCode = exports.stringToRgb = exports.log = exports.generateId = exports.generateNonce = exports.generateMetapageId = exports.generateMetaframeId = exports.existsAnyUrlParam = exports.isDebugFromUrlsParams = exports.getUrlParamDebug = exports.getUrlParam = exports.getMatchingVersion = exports.merge = exports.convertToCurrentDefinition = void 0;

var _compareVersions = require("compare-versions");

var _Shared = require("./Shared");

var _v0_ = require("./v0_4");

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

const convertToCurrentDefinition = def => {
  if (def === null) {
    throw "Metapage definition cannot be null";
  }

  if (typeof def === "string") {
    try {
      def = JSON.parse(def);
    } catch (err) {
      throw `Cannot parse into JSON:\n${def}`;
    }
  }

  let updatedDefinition;

  switch (getMatchingVersion(def.version)) {
    case _v0_.VersionsMetapage.V0_2:
      {
        updatedDefinition = convertToCurrentDefinition(definition_v0_2_to_v0_3(def));
        break;
      }

    case _v0_.VersionsMetapage.V0_3:
      {
        updatedDefinition = def;
        break;
      }

    default:
      console.warn(`Metapage definition version=${def.version} but we only know up to version ${_v0_.MetapageVersionCurrent}. Assuming the definition is compatible, but it's the future!`);
      updatedDefinition = def;
      break;
  }

  return updatedDefinition;
};

exports.convertToCurrentDefinition = convertToCurrentDefinition;

const definition_v0_2_to_v0_3 = old => {
  old.version = _v0_.VersionsMetapage.V0_3;
  return old;
};

const merge = (current, newInputs) => {
  if (!newInputs) {
    return false;
  }

  let modified = false;
  Object.keys(newInputs).forEach(pipeId => {
    modified = true;

    if (newInputs[pipeId] === undefined) {
      delete current[pipeId];
    } else {
      current[pipeId] = newInputs[pipeId];
    }
  });
  return modified;
};

exports.merge = merge;

const getMatchingVersion = version => {
  if (version == "latest") {
    return _v0_.MetapageVersionCurrent;
  } else if ((0, _compareVersions.compare)(version, "0.2", "<")) {
    throw `Unknown version: ${version}`;
  } else if ((0, _compareVersions.compare)(version, "0.2", ">=") && (0, _compareVersions.compare)(version, _v0_.VersionsMetapage.V0_3, "<")) {
    return _v0_.VersionsMetapage.V0_2;
  } else if ((0, _compareVersions.compare)(version, "0.3", ">=")) {
    return _v0_.VersionsMetapage.V0_3;
  } else {
    console.log(`Could not match version=${version} to any known version, assuming ${_v0_.MetapageVersionCurrent}`);
    return _v0_.MetapageVersionCurrent;
  }
};

exports.getMatchingVersion = getMatchingVersion;

const getUrlParam = key => {
  if (!window.location.search) {
    return null;
  }

  return new URLSearchParams(window.location.search).get(key);
};

exports.getUrlParam = getUrlParam;

const getUrlParamDebug = () => {
  return new URLSearchParams(window.location.search).has(_Shared.MetapageHashParams.mp_debug);
};

exports.getUrlParamDebug = getUrlParamDebug;

const isDebugFromUrlsParams = () => {
  const param = new URLSearchParams(window.location.search).get(_Shared.MetapageHashParams.mp_debug);
  return param === "true" || param === "1";
};

exports.isDebugFromUrlsParams = isDebugFromUrlsParams;

const existsAnyUrlParam = k => {
  const members = k.filter(param => {
    return new URLSearchParams(window.location.search).has(param);
  });
  return members.length > 0;
};

exports.existsAnyUrlParam = existsAnyUrlParam;

const generateMetaframeId = (length = 8) => {
  return generateId(length);
};

exports.generateMetaframeId = generateMetaframeId;

const generateMetapageId = (length = 8) => {
  return generateId(length);
};

exports.generateMetapageId = generateMetapageId;

const generateNonce = (length = 8) => {
  return generateId(length);
};

exports.generateNonce = generateNonce;
const LETTERS = "abcdefghijklmnopqrstuvwxyz0123456789";

const generateId = (length = 8) => {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = LETTERS.length;

  for (var i = 0; i < length; i++) {
    result += LETTERS.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

exports.generateId = generateId;

const log = (o, color, backgroundColor) => {
  color = color ? color : "000";

  if (color && color.trim() == "") {
    color = undefined;
  }

  let s;

  if (typeof o === "string") {
    s = o;
  } else if (typeof o === "number") {
    s = o + "";
  } else {
    s = JSON.stringify(o, null, "  ");
  }

  if (color && color.trim() != "") {
    var cssstring = `color: #${color}`;

    if (backgroundColor) {
      cssstring = `${cssstring}; background: #${backgroundColor}`;
    }

    s = `%c${s}`;
    window.console.log(s, cssstring);
  } else {
    window.console.log(s);
  }
};

exports.log = log;

const stringToRgb = str => {
  return intToRGB(hashCode(str));
};

exports.stringToRgb = stringToRgb;

const hashCode = str => {
  var hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return hash;
};

exports.hashCode = hashCode;

const intToRGB = i => {
  var c = (i & 0x00ffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
};

exports.intToRGB = intToRGB;
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const lookup = new Uint8Array(256);

for (var i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}

function base64encode(arraybuffer) {
  let bytes = new Uint8Array(arraybuffer);
  let i;
  let len = bytes.length;
  let base64 = "";

  for (i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
    base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
    base64 += chars[bytes[i + 2] & 63];
  }

  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }

  return base64;
}

function base64decode(base64) {
  if (!base64) {
    throw new Error("base64decode string argument given");
  }

  let bufferLength = base64.length * 0.75,
      len = base64.length,
      i,
      p = 0,
      encoded1,
      encoded2,
      encoded3,
      encoded4;

  if (base64[base64.length - 1] === "=") {
    bufferLength--;

    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }

  var arraybuffer = new ArrayBuffer(bufferLength),
      bytes = new Uint8Array(arraybuffer);

  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }

  return arraybuffer;
}

const isPageLoaded = () => {
  return document.readyState == "complete" || document.readyState == "interactive";
};

exports.isPageLoaded = isPageLoaded;

const pageLoaded = () => __awaiter(void 0, void 0, void 0, function* () {
  if (isPageLoaded()) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    let loaded = false;
    window.addEventListener('load', () => {
      if (loaded) {
        return;
      }

      loaded = true;
      resolve();
    });
    const timer = setTimeout(() => {
      if (!loaded && isPageLoaded()) {
        loaded = true;
        resolve();
      }
    }, 200);
  });
});

exports.pageLoaded = pageLoaded;
},{"compare-versions":"ojAg","./Shared":"Q9lO","./v0_4":"1svx"}],"NK90":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetaframePlugin = exports.Metaframe = void 0;

var _eventemitter = require("eventemitter3");

var _Constants = require("./Constants");

var _v0_ = require("./v0_4");

var _MetapageTools = require("./MetapageTools");

var _Shared = require("./Shared");

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var MetaframeLoadingState;

(function (MetaframeLoadingState) {
  MetaframeLoadingState["WaitingForPageLoad"] = "WaitingForPageLoad";
  MetaframeLoadingState["SentSetupIframeClientRequest"] = "SentSetupIframeClientRequest";
  MetaframeLoadingState["Ready"] = "Ready";
})(MetaframeLoadingState || (MetaframeLoadingState = {}));

var MetaframeEvents;

(function (MetaframeEvents) {
  MetaframeEvents["Connected"] = "connected";
  MetaframeEvents["Error"] = "error";
  MetaframeEvents["Input"] = "input";
  MetaframeEvents["Inputs"] = "inputs";
  MetaframeEvents["Message"] = "message";
})(MetaframeEvents || (MetaframeEvents = {}));

class Metaframe extends _eventemitter.EventEmitter {
  constructor(options) {
    super();
    this._inputPipeValues = {};
    this._outputPipeValues = {};
    this._state = MetaframeLoadingState.WaitingForPageLoad;
    this._messageSendCount = 0;
    this.debug = (0, _MetapageTools.isDebugFromUrlsParams)();
    this.id = window.name;
    this.debug = (0, _MetapageTools.isDebugFromUrlsParams)();
    this._isIframe = (0, _Shared.isIframe)();
    this.addListener = this.addListener.bind(this);
    this.dispose = this.dispose.bind(this);
    this.error = this.error.bind(this);
    this.getInput = this.getInput.bind(this);
    this.getInputs = this.getInputs.bind(this);
    this.getOutput = this.getOutput.bind(this);
    this.getOutputs = this.getOutputs.bind(this);
    this.log = this.log.bind(this);
    this.logInternal = this.logInternal.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onInputs = this.onInputs.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.sendRpc = this.sendRpc.bind(this);
    this.setInput = this.setInput.bind(this);
    this.setInputs = this.setInputs.bind(this);
    this.setInternalInputsAndNotify = this.setInternalInputsAndNotify.bind(this);
    this.setOutput = this.setOutput.bind(this);
    this.setOutputs = this.setOutputs.bind(this);
    this.warn = this.warn.bind(this);
    this._resolveSetupIframeServerResponse = this._resolveSetupIframeServerResponse.bind(this);
    this.addListenerReturnDisposer = this.addListenerReturnDisposer.bind(this);
    this.connected = this.connected.bind(this);
    this.disableNotifyOnHashUrlChange = this.disableNotifyOnHashUrlChange.bind(this);
    this._onHashUrlChange = this._onHashUrlChange.bind(this);

    if (!this._isIframe) {
      this.log("Not an iframe, metaframe code disabled");
      return;
    }

    const thisRef = this;
    (0, _MetapageTools.pageLoaded)().then(() => {
      this.log('pageLoaded');
      window.addEventListener("message", this.onMessage);
      thisRef.sendRpc(_v0_.JsonRpcMethodsFromChild.SetupIframeClientRequest, {
        version: Metaframe.version
      });
      thisRef._state = MetaframeLoadingState.SentSetupIframeClientRequest;
    });

    if (!(options === null || options === void 0 ? void 0 : options.disableHashChangeEvent)) {
      window.addEventListener("hashchange", this._onHashUrlChange);
    }
  }

  _resolveSetupIframeServerResponse(params) {
    if (this._state === MetaframeLoadingState.WaitingForPageLoad) {
      throw 'Got message but page has not finished loading, we should never get in this state';
    }

    if (!this._parentId) {
      this._parentVersion = params.version;
      this.color = (0, _MetapageTools.stringToRgb)(this.id);
      this._parentId = params.parentId;
      this.log(`metapage[${this._parentId}](v${this._parentVersion ? this._parentVersion : "unknown"}) registered`);
      this._inputPipeValues = params.state && params.state.inputs ? params.state.inputs : this._inputPipeValues;
      this._state = MetaframeLoadingState.Ready;
      this.sendRpc(_v0_.JsonRpcMethodsFromChild.SetupIframeServerResponseAck, {
        version: Metaframe.version
      });

      if (this._inputPipeValues && Object.keys(this._inputPipeValues).length > 0) {
        this.emit(MetaframeEvents.Inputs, this._inputPipeValues);
        Object.keys(this._inputPipeValues).forEach(pipeId => this.emit(MetaframeEvents.Input, pipeId, this._inputPipeValues[pipeId]));
      }

      this.emit(MetaframeEvents.Inputs, this._inputPipeValues);

      if (params.plugin) {
        this.plugin = new MetaframePlugin(this);
      }

      this.emit(MetaframeEvents.Connected);
    } else {
      this.log("Got JsonRpcMethods.SetupIframeServerResponse but already resolved");
    }
  }

  connected() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this._state === MetaframeLoadingState.Ready) {
        return;
      }

      return new Promise((resolve, _) => {
        let disposer;
        disposer = this.addListenerReturnDisposer(MetaframeEvents.Connected, () => {
          resolve();
          disposer();
        });
      });
    });
  }

  addListenerReturnDisposer(event, listener) {
    super.addListener(event, listener);

    const disposer = () => {
      super.removeListener(event, listener);
    };

    return disposer;
  }

  log(o, color, backgroundColor) {
    if (!this.debug) {
      return;
    }

    this.logInternal(o, color ? color : this.color);
  }

  warn(o) {
    if (!this.debug) {
      return;
    }

    this.logInternal(o, "000", this.color);
  }

  error(err) {
    this.logInternal(err, this.color, "f00");
  }

  logInternal(o, color, backgroundColor) {
    let s;

    if (typeof o === "string") {
      s = o;
    } else if (typeof o === "number") {
      s = o + "";
    } else {
      s = JSON.stringify(o);
    }

    color = color ? color + "" : color;
    s = (this.id ? `Metaframe[${this.id}] ` : "") + `${s}`;
    (0, _MetapageTools.log)(s, color, backgroundColor);
  }

  dispose() {
    super.removeAllListeners();
    window.removeEventListener("message", this.onMessage);
    this.disableNotifyOnHashUrlChange();
    this._inputPipeValues = undefined;
    this._outputPipeValues = undefined;
  }

  addListener(event, listener) {
    super.addListener(event, listener);

    if (event === MetaframeEvents.Inputs) {
      window.setTimeout(() => {
        if (this._inputPipeValues) {
          listener(this._inputPipeValues);
        }
      }, 0);
    }

    return this;
  }

  onInput(pipeId, listener) {
    return this.addListenerReturnDisposer(MetaframeEvents.Input, (pipe, value) => {
      if (pipeId === pipe) {
        listener(value);
      }
    });
  }

  onInputs(listener) {
    const disposer = this.addListenerReturnDisposer(MetaframeEvents.Inputs, listener);
    return disposer;
  }

  setInput(pipeId, blob) {
    var inputs = {};
    inputs[pipeId] = blob;
    this.setInputs(inputs);
  }

  setInputs(inputs) {
    this.sendRpc(_v0_.JsonRpcMethodsFromChild.InputsUpdate, inputs);
  }

  setInternalInputsAndNotify(inputs) {
    if (!(0, _MetapageTools.merge)(this._inputPipeValues, inputs)) {
      return;
    }

    Object.keys(inputs).forEach(pipeId => this.emit(MetaframeEvents.Input, pipeId, inputs[pipeId]));
    this.emit(MetaframeEvents.Inputs, inputs);
  }

  getInput(pipeId) {
    console.assert(pipeId);
    return this._inputPipeValues[pipeId];
  }

  getInputs() {
    return this._inputPipeValues;
  }

  getOutput(pipeId) {
    console.assert(pipeId);
    return this._outputPipeValues[pipeId];
  }

  setOutput(pipeId, updateBlob) {
    console.assert(pipeId);
    console.assert(updateBlob);
    var outputs = {};
    outputs[pipeId] = updateBlob;
    this.setOutputs(outputs);
  }

  setOutputs(outputs) {
    if (!(0, _MetapageTools.merge)(this._outputPipeValues, outputs)) {
      return;
    }

    this.sendRpc(_v0_.JsonRpcMethodsFromChild.OutputsUpdate, outputs);
  }

  getOutputs() {
    return this._outputPipeValues;
  }

  disableNotifyOnHashUrlChange() {
    window.removeEventListener("hashchange", this._onHashUrlChange);
  }

  _onHashUrlChange(_) {
    const payload = {
      hash: window.location.hash,
      metaframe: this.id
    };
    this.sendRpc(_v0_.JsonRpcMethodsFromChild.HashParamsUpdate, payload);
  }

  sendRpc(method, params) {
    if (this._isIframe) {
      const message = {
        jsonrpc: "2.0",
        id: ++this._messageSendCount,
        method: method,
        params: params,
        iframeId: this.id,
        parentId: this._parentId
      };
      window.parent.postMessage(message, "*");
    } else {
      this.log("Cannot send JSON-RPC window message: there is no window.parent which means we are not an iframe");
    }
  }

  onMessage(e) {
    if (typeof e.data === "object") {
      let jsonrpc = e.data;

      if (jsonrpc.jsonrpc === "2.0") {
        var method = jsonrpc.method;

        if (!(method == _v0_.JsonRpcMethodsFromParent.SetupIframeServerResponse || jsonrpc.parentId == this._parentId && jsonrpc.iframeId == this.id)) {
          this.error(`window.message: received message but jsonrpc.parentId=${jsonrpc.parentId} _parentId=${this._parentId} jsonrpc.iframeId=${jsonrpc.iframeId} id=${this.id}`);
          return;
        }

        switch (method) {
          case _v0_.JsonRpcMethodsFromParent.SetupIframeServerResponse:
            this._resolveSetupIframeServerResponse(jsonrpc.params);

            break;

          case _v0_.JsonRpcMethodsFromParent.InputsUpdate:
            if (this._state !== MetaframeLoadingState.Ready) {
              throw 'Got InputsUpdate but metaframe is not MetaframeLoadingState.Ready';
            }

            this.setInternalInputsAndNotify(jsonrpc.params.inputs);
            break;

          case _v0_.JsonRpcMethodsFromParent.MessageAck:
            if (this.debug) this.log(`ACK: ${JSON.stringify(jsonrpc)}`);
            break;

          default:
            if (this.debug) this.log(`window.message: unknown JSON-RPC method: ${JSON.stringify(jsonrpc)}`);
            break;
        }

        this.emit(MetaframeEvents.Message, jsonrpc);
      }
    }
  }

}

exports.Metaframe = Metaframe;
Metaframe.version = _Constants.VERSION_METAFRAME;
Metaframe.ERROR = MetaframeEvents.Error;
Metaframe.CONNECTED = MetaframeEvents.Connected;
Metaframe.INPUT = MetaframeEvents.Input;
Metaframe.INPUTS = MetaframeEvents.Inputs;
Metaframe.MESSAGE = MetaframeEvents.Message;

class MetaframePlugin {
  constructor(metaframe) {
    this._metaframe = metaframe;
    this.requestState = this.requestState.bind(this);
    this.onState = this.onState.bind(this);
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
    this.onDefinition = this.onDefinition.bind(this);
    this.getDefinition = this.getDefinition.bind(this);
    this.setDefinition = this.setDefinition.bind(this);
  }

  requestState() {
    var payload = {
      method: _v0_.ApiPayloadPluginRequestMethod.State
    };

    this._metaframe.sendRpc(_v0_.JsonRpcMethodsFromChild.PluginRequest, payload);
  }

  onState(listener) {
    const disposer = this._metaframe.onInput(_Constants.METAPAGE_KEY_STATE, listener);

    if (this.getState()) {
      listener(this.getState());
    }

    return disposer;
  }

  getState() {
    return this._metaframe.getInput(_Constants.METAPAGE_KEY_STATE);
  }

  setState(state) {
    this._metaframe.setOutput(_Constants.METAPAGE_KEY_STATE, state);
  }

  onDefinition(listener) {
    var disposer = this._metaframe.onInput(_Constants.METAPAGE_KEY_DEFINITION, listener);

    if (this.getDefinition()) {
      listener(this.getDefinition());
    }

    return disposer;
  }

  setDefinition(definition) {
    this._metaframe.setOutput(_Constants.METAPAGE_KEY_DEFINITION, definition);
  }

  getDefinition() {
    return this._metaframe.getInput(_Constants.METAPAGE_KEY_DEFINITION);
  }

}

exports.MetaframePlugin = MetaframePlugin;
},{"eventemitter3":"UASB","./Constants":"Xnuv","./v0_4":"1svx","./MetapageTools":"f0H1","./Shared":"Q9lO"}]},{},["NK90"], "metapage")
//# sourceMappingURL=/index.js.map