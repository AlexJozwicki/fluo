!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.fluo=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

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
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
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
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}],2:[function(_dereq_,module,exports){
(function (global){
/*! Native Promise Only
    v0.7.6-a (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/
!function(t,n,e){n[t]=n[t]||e(),"undefined"!=typeof module&&module.exports?module.exports=n[t]:"function"==typeof define&&define.amd&&define(function(){return n[t]})}("Promise","undefined"!=typeof global?global:this,function(){"use strict";function t(t,n){l.add(t,n),h||(h=y(l.drain))}function n(t){var n,e=typeof t;return null==t||"object"!=e&&"function"!=e||(n=t.then),"function"==typeof n?n:!1}function e(){for(var t=0;t<this.chain.length;t++)o(this,1===this.state?this.chain[t].success:this.chain[t].failure,this.chain[t]);this.chain.length=0}function o(t,e,o){var r,i;try{e===!1?o.reject(t.msg):(r=e===!0?t.msg:e.call(void 0,t.msg),r===o.promise?o.reject(TypeError("Promise-chain cycle")):(i=n(r))?i.call(r,o.resolve,o.reject):o.resolve(r))}catch(c){o.reject(c)}}function r(o){var c,u,a=this;if(!a.triggered){a.triggered=!0,a.def&&(a=a.def);try{(c=n(o))?(u=new f(a),c.call(o,function(){r.apply(u,arguments)},function(){i.apply(u,arguments)})):(a.msg=o,a.state=1,a.chain.length>0&&t(e,a))}catch(s){i.call(u||new f(a),s)}}}function i(n){var o=this;o.triggered||(o.triggered=!0,o.def&&(o=o.def),o.msg=n,o.state=2,o.chain.length>0&&t(e,o))}function c(t,n,e,o){for(var r=0;r<n.length;r++)!function(r){t.resolve(n[r]).then(function(t){e(r,t)},o)}(r)}function f(t){this.def=t,this.triggered=!1}function u(t){this.promise=t,this.state=0,this.triggered=!1,this.chain=[],this.msg=void 0}function a(n){if("function"!=typeof n)throw TypeError("Not a function");if(0!==this.__NPO__)throw TypeError("Not a promise");this.__NPO__=1;var o=new u(this);this.then=function(n,r){var i={success:"function"==typeof n?n:!0,failure:"function"==typeof r?r:!1};return i.promise=new this.constructor(function(t,n){if("function"!=typeof t||"function"!=typeof n)throw TypeError("Not a function");i.resolve=t,i.reject=n}),o.chain.push(i),0!==o.state&&t(e,o),i.promise},this["catch"]=function(t){return this.then(void 0,t)};try{n.call(void 0,function(t){r.call(o,t)},function(t){i.call(o,t)})}catch(c){i.call(o,c)}}var s,h,l,p=Object.prototype.toString,y="undefined"!=typeof setImmediate?function(t){return setImmediate(t)}:setTimeout;try{Object.defineProperty({},"x",{}),s=function(t,n,e,o){return Object.defineProperty(t,n,{value:e,writable:!0,configurable:o!==!1})}}catch(d){s=function(t,n,e){return t[n]=e,t}}l=function(){function t(t,n){this.fn=t,this.self=n,this.next=void 0}var n,e,o;return{add:function(r,i){o=new t(r,i),e?e.next=o:n=o,e=o,o=void 0},drain:function(){var t=n;for(n=e=h=void 0;t;)t.fn.call(t.self),t=t.next}}}();var g=s({},"constructor",a,!1);return s(a,"prototype",g,!1),s(g,"__NPO__",0,!1),s(a,"resolve",function(t){var n=this;return t&&"object"==typeof t&&1===t.__NPO__?t:new n(function(n,e){if("function"!=typeof n||"function"!=typeof e)throw TypeError("Not a function");n(t)})}),s(a,"reject",function(t){return new this(function(n,e){if("function"!=typeof n||"function"!=typeof e)throw TypeError("Not a function");e(t)})}),s(a,"all",function(t){var n=this;return"[object Array]"!=p.call(t)?n.reject(TypeError("Not an array")):0===t.length?n.resolve([]):new n(function(e,o){if("function"!=typeof e||"function"!=typeof o)throw TypeError("Not a function");var r=t.length,i=Array(r),f=0;c(n,t,function(t,n){i[t]=n,++f===r&&e(i)},o)})}),s(a,"race",function(t){var n=this;return"[object Array]"!=p.call(t)?n.reject(TypeError("Not an array")):new n(function(e,o){if("function"!=typeof e||"function"!=typeof o)throw TypeError("Not a function");c(n,t,function(t,n){e(n)},o)})}),a});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

var Publisher = _dereq_('./Publisher');


/**
 * @constructor
 * @extends {Publisher}
 */
var Action = function (definition) {
    definition = definition || {};
    if (!_.isObject(definition)) {
      definition = { actionType: definition };
    }

    Publisher.call(this);

    this._isAction = true;
    this.actionType = 'action';
    this.eventType = 'event';
    this.asyncResult = !!definition.asyncResult;

    this.children = definition.children || [];
    if (this.asyncResult) {
        this.children.push('completed', 'failed');
    }

    delete definition.children;
    _.extend(this, definition);
    this.createChildActions();

    var trigger = definition.sync ? this.triggerSync : this.trigger;
    var functor = trigger.bind(this);
    functor.__proto__ = this;
    return functor;
};

_.inherits(Action, Publisher);


/**
 * @protected
 */
Action.prototype.createChildActions = function () {
    var children = this.children;
    for (var i = 0; i < children.length; ++i) {
        var name = children[i];
        this[name] = new Action({ actionType: name });
    }
};


module.exports = Action;

},{"./Publisher":6,"./utils":19}],4:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

var Publisher = _dereq_('./Publisher');

var instanceJoinCreator = _dereq_('./instanceJoinCreator');


/**
 * A module of methods related to listening.
 * @constructor
 * @extends {Publisher}
 */
var Listener = function () {
    Publisher.call(this);

    this.subscriptions = [];
};

_.inherits(Listener, Publisher);


/**
 * An internal utility function used by `validateListening`
 *
 * @param {Action|Store} listenable The listenable we want to search for
 * @returns {Boolean} The result of a recursive search among `this.subscriptions`
 */
Listener.prototype.hasListener = function (listenable)  {
    var subs = this.subscriptions || [];
    for (var i = 0; i < subs.length; ++i) {
        var listenables = [].concat(subs[i].listenable);
        for (var j = 0; j < listenables.length; ++j) {
            var listener = listenables[j];
            if (listener === listenable) {
                return true;
            }
            if (listener.hasListener && listener.hasListener(listenable)) {
                return true;
            }
        }
    }
    return false;
};

/**
 * A convenience method that listens to all listenables in the given object.
 *
 * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
 */
Listener.prototype.listenToMany = function (listenables) {
    var allListenables = flattenListenables(listenables);
    for (var key in allListenables) {
        var cbname = _.callbackName(key);
        var localname = this[cbname] ? cbname : this[key] ? key : undefined;
        if (localname) {
            var callback = (
                this[cbname + 'Default'] ||
                this[localname + 'Default'] ||
                localname
            );
            this.listenTo(allListenables[key], localname, callback);
        }
    }
};

/**
 * Checks if the current context can listen to the supplied listenable
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @returns {String|Undefined} An error message, or undefined if there was no problem.
 */
Listener.prototype.validateListening = function (listenable) {
    if (listenable === this) {
        return 'Listener is not able to listen to itself';
    }
    if (!_.isFunction(listenable.listen)) {
        return listenable + ' is missing a listen method';
    }
    if (listenable.hasListener && listenable.hasListener(this)) {
        return 'Listener cannot listen to this listenable because of circular loop';
    }
};

/**
 * Sets up a subscription to the given listenable for the context object
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @param {Function|String} callback The callback to register as event handler
 * @param {Function|String} defaultCallback The callback to register as default handler
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
 */
Listener.prototype.listenTo = function (listenable, callback, defaultCallback)  {
    _.throwIf(this.validateListening(listenable));

    this.fetchInitialState(listenable, defaultCallback);

    var subs = this.subscriptions;
    var desub = listenable.listen(this[callback] || callback, this);
    var unsubscriber = function () {
        var index = subs.indexOf(subscriptionObj);
        _.throwIf(index === -1,
                'Tried to remove listen already gone from subscriptions list!');
        subs.splice(index, 1);
        desub();
    };

    var subscriptionObj = {
        stop: unsubscriber,
        listenable: listenable
    };
    subs.push(subscriptionObj);
    return subscriptionObj;
};

/**
 * Stops listening to a single listenable
 *
 * @param {Action|Store} listenable The action or store we no longer want to listen to
 * @returns {Boolean} True if a subscription was found and removed, otherwise false.
 */
Listener.prototype.stopListeningTo = function (listenable) {
    var subs = this.subscriptions || [];
    for (var i = 0; i < subs.length; ++i) {
        var sub = subs[i];
        if (sub.listenable === listenable) {
            sub.stop();
            _.throwIf(subs.indexOf(sub) !== -1,
                    'Failed to remove listen from subscriptions list!');
            return true;
        }
    }
    return false;
};

/**
 * Stops all subscriptions and empties subscriptions array
 */
Listener.prototype.stopListeningToAll = function () {
    var subs = this.subscriptions || [];
    var remaining;
    while ((remaining = subs.length)) {
        subs[0].stop();
        _.throwIf(subs.length !== remaining - 1,
                'Failed to remove listen from subscriptions list!');
    }
};

/**
 * Used in `listenTo`. Fetches initial data from a publisher if it has a `getInitialState` method.
 * @param {Action|Store} listenable The publisher we want to get initial state from
 * @param {Function|String} defaultCallback The method to receive the data
 */
Listener.prototype.fetchInitialState = function (listenable, defaultCallback) {
    if (typeof defaultCallback === 'string') {
        defaultCallback = this[defaultCallback];
    }

    var self = this;
    if (_.isFunction(defaultCallback) && _.isFunction(listenable.getInitialState)) {
        var data = listenable.getInitialState();
        if (data && _.isFunction(data.then)) {
            data.then(function() {
                defaultCallback.apply(self, arguments);
            });
        } else {
            defaultCallback.call(this, data);
        }
    }
};

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with the last emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinTrailing = instanceJoinCreator('last');

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with the first emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinLeading = instanceJoinCreator('first');

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with all emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinConcat = instanceJoinCreator('all');

/**
 * The callback will be called once all listenables have triggered.
 * If a callback triggers twice before that happens, an error is thrown.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinStrict = instanceJoinCreator('strict');


/**
 * Extract child listenables from a parent from their
 * children property and return them in a keyed Object
 *
 * @param {Object} listenable The parent listenable
 */
var mapChildListenables = function (listenable) {
    var children = {};

    var childListenables = listenable.children || [];
    for (var i = 0; i < childListenables.length; ++i) {
        var childName = childListenables[i];
        if (listenable[childName]) {
            children[childName] = listenable[childName];
        }
    }

    return children;
};

/**
 * Make a flat dictionary of all listenables including their
 * possible children (recursively), concatenating names in camelCase.
 *
 * @param {Object} listenables The top-level listenables
 */
var flattenListenables = function (listenables) {
    var flattened = {};
    for (var key in listenables) {
        var listenable = listenables[key];
        var childMap = mapChildListenables(listenable);

        // recursively flatten children
        var children = flattenListenables(childMap);

        // add the primary listenable and chilren
        flattened[key] = listenable;
        for (var childKey in children) {
            var childListenable = children[childKey];
            flattened[key + _.capitalize(childKey)] = childListenable;
        }
    }

    return flattened;
};


module.exports = Listener;

},{"./Publisher":6,"./instanceJoinCreator":14,"./utils":19}],5:[function(_dereq_,module,exports){

var Listener = _dereq_('./Listener');

var slice = Array.prototype.slice;


/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `ListenerMethods` mixin and takes care of teardown of subscriptions.
 * Note that if you're using the `connect` mixin you don't need this mixin, as connect will
 * import everything this mixin contains!
 */

var listener = new Listener();

listener.listenTo = function () {
  this.subscriptions = this.subscriptions || [];
  return Listener.prototype.listenTo.apply(this, slice.call(arguments));
};

/**
 * Cleans up all listener previously registered.
 */
listener.componentWillUnmount = function () {
  this.stopListeningToAll();
};


module.exports = listener;

},{"./Listener":4}],6:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');


/**
 * @constructor
 */
var Publisher = function () {
    /**
     * @protected
     */
    this.emitter = new _.EventEmitter();

    this.children = [];
    this.eventType = 'event';
};


/**
 * Hook used by the publisher that is invoked before emitting
 * and before `shouldEmit`. The arguments are the ones that the action
 * is invoked with. If this function returns something other than
 * undefined, that will be passed on as arguments for shouldEmit and
 * emission.
 */
Publisher.prototype.preEmit = function () {};

/**
 * Hook used by the publisher after `preEmit` to determine if the
 * event should be emitted with given arguments. This may be overridden
 * in your application, default implementation always returns true.
 *
 * @returns {Boolean} true if event should be emitted
 */
Publisher.prototype.shouldEmit = function () {
    return true;
};

/**
 * Subscribes the given callback for action triggered
 *
 * @param {Function} callback The callback to register as event handler
 * @param {Mixed} [optional] bindContext The context to bind the callback with
 * @returns {Function} Callback that unsubscribes the registered event handler
 */
Publisher.prototype.listen = function (callback, bindContext) {
    var self = this;
    bindContext = bindContext || this;

    var eventHandler = function (args) {
        var result = callback.apply(bindContext, args);
        if (_.isPromise(result)) {
            var canHandlePromise = Publisher.prototype.canHandlePromise.call(self);
            if (!canHandlePromise) {
                console.warn('Unhandled promise for ' + self.eventType);
                return;
            }
            self.promise(result);
        }
    };
    this.emitter.addListener(this.eventType, eventHandler);

    return function () {
        self.emitter.removeListener(self.eventType, eventHandler);
    };
};

/**
 * Attach handlers to promise that trigger the completed and failed
 * child publishers, if available.
 *
 * @param {Object} The promise to attach to
 */
Publisher.prototype.promise = function (promise) {
    var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
    if (!canHandlePromise) {
        throw new Error('Publisher must have "completed" and "failed" child publishers');
    }

    var self = this;
    promise.then(function (response) {
        return self.completed.trigger(response);
    });
    // IE compatibility - catch is a reserved word - without bracket notation source compilation will fail under IE
    promise["catch"](function (error) {
        return self.failed.trigger(error);
    });
};


Publisher.prototype.canHandlePromise = function () {
    return _.isAction(this.completed) && _.isAction(this.failed);
};

/**
 * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
 */
Publisher.prototype.triggerSync = function () {
    var args = arguments;
    var preResult = this.preEmit.apply(this, args);
    if (typeof preResult !== 'undefined') {
        args = _.isArguments(preResult) ? preResult : [].concat(preResult);
    }

    if (this.shouldEmit.apply(this, args)) {
        this.emitter.emit(this.eventType, args);
    }
};

/**
 * Tries to publish the event on the next tick
 */
Publisher.prototype.trigger = function () {
    var args = arguments;
    var self = this;

    _.nextTick(function () {
        self.triggerSync.apply(self, args);
    });
};

/**
 * Returns a Promise for the triggered action
 */
Publisher.prototype.triggerPromise = function () {
    var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
    if (!canHandlePromise) {
        throw new Error('Publisher must have "completed" and "failed" child publishers');
    }

    var self = this;
    var args = arguments;

    var promise = _.createPromise(function (resolve, reject) {
        var removeSuccess = self.completed.listen(function (args) {
            removeSuccess();
            removeFailed();
            resolve(args);
        });

        var removeFailed = self.failed.listen(function (args) {
            removeSuccess();
            removeFailed();
            reject(args);
        });

        self.trigger.apply(self, args);
    });

    return promise;
};


module.exports = Publisher;

},{"./utils":19}],7:[function(_dereq_,module,exports){

var Publisher = _dereq_('./Publisher');


/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `ListenerMethods` mixin and takes care of teardown of subscriptions.
 * Note that if you're using the `connect` mixin you don't need this mixin, as connect will
 * import everything this mixin contains!
 */

var publisher = new Publisher();

module.exports = publisher;

},{"./Publisher":6}],8:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

var Listener = _dereq_('./Listener');


/**
 * @constructor
 * @extends {Listener}
 * @param {Object=} methods Data store object methods
 */
var Store = function (methods) {
    Listener.call(this);

    this.eventType = 'change';

    if (methods) {
        _.bindMethods(methods, this);
        _.copyPropertiesOf(methods, this);
    }

    this.init();

    if (this.listenables) {
        var arr = [].concat(this.listenables);
        for (var i = 0; i < arr.length; ++i) {
            this.listenToMany(arr[i]);
        }
    }
};

_.inherits(Store, Listener);


Store.prototype.init = function () {
  // overrides encouraged
};


module.exports = Store;

},{"./Listener":4,"./utils":19}],9:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

var Listener = _dereq_('./Listener');


module.exports = function connect(listenable, key) {
    return {
        getInitialState: function () {
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (typeof key === 'undefined') {
                return listenable.getInitialState();
            } else {
                var state = {};
                state[key] = listenable.getInitialState();
                return state;
            }
        },
        componentDidMount: function () {
            this.__listener = new Listener();
            _.link(this.__listener, this);

            if (typeof key === 'undefined') {
                this.listenTo(listenable, this.setState);
            } else {
                var self = this;
                this.listenTo(listenable, function (state) {
                    var container = {};
                    container[key] = state;
                    self.setState(container);
                });
            }
        },
        componentWillUnmount: function () {
          this.__listener.stopListeningToAll();
        }
    };
};

},{"./Listener":4,"./utils":19}],10:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

var Listener = _dereq_('./Listener');


module.exports = function(listenable, key, filterFunc) {
    filterFunc = _.isFunction(key) ? key : filterFunc;
    return {
        getInitialState: function() {
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (_.isFunction(key)) {
                return filterFunc.call(this, listenable.getInitialState());
            } else {
                // Filter initial payload from store.
                var result = filterFunc.call(this, listenable.getInitialState());
                if (result) {
                  return _.object([key], [result]);
                } else {
                  return {};
                }
            }
        },
        componentDidMount: function() {
            this.__listener = new Listener();
            _.link(this.__listener, this);

            var self = this;
            var cb = function (value) {
                if (_.isFunction(key)) {
                    self.setState(filterFunc.call(self, value));
                } else {
                    var result = filterFunc.call(self, value);
                    self.setState(_.object([key], [result]));
                }
            };

            this.listenTo(listenable, cb);
        },
        componentWillUnmount: function () {
            this.__listener.stopListeningToAll();
        }
    };
};


},{"./Listener":4,"./utils":19}],11:[function(_dereq_,module,exports){

var Action = _dereq_('./Action');

var keep = _dereq_('./keep');


/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} method Action object definition.
 * @return {!Action} An action object.
 */
var createAction = function (definition) {
    definition = definition || {};

    var action = new Action(definition);
    keep.createdActions.push(action);

    return action;
};

module.exports = createAction;

},{"./Action":3,"./keep":15}],12:[function(_dereq_,module,exports){

var Store = _dereq_('./Store');

var keep = _dereq_('./keep');


/**
 * Creates an event emitting Data Store. It is mixed in with functions
 * from the `ListenerMethods` and `PublisherMethods` mixins. `preEmit`
 * and `shouldEmit` may be overridden in the definition object.
 *
 * @param {Object=} methods Data store object methods
 * @returns {!Store} A data store instance
 */
module.exports = function(methods) {
    var store = new Store(methods);
    keep.createdStores.push(store);

    return store;
};

},{"./Store":8,"./keep":15}],13:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

var staticJoinCreator = _dereq_('./staticJoinCreator');


exports.Action = _dereq_('./Action');
exports.Listener = _dereq_('./Listener');
exports.Publisher = _dereq_('./Publisher');
exports.Store = _dereq_('./Store');

exports.createAction = _dereq_('./createAction');
exports.createStore = _dereq_('./createStore');

exports.connect = _dereq_('./connect');
exports.connectFilter = _dereq_('./connectFilter');

exports.ListenerMixin = _dereq_('./ListenerMixin');
exports.PublisherMixin = _dereq_('./PublisherMixin');

exports.listenTo = _dereq_('./listenTo');
exports.listenToMany = _dereq_('./listenToMany');



exports.joinTrailing = exports.all = staticJoinCreator("last"); // fluo.all alias for backward compatibility
exports.joinLeading = staticJoinCreator("first");
exports.joinStrict = staticJoinCreator("strict");
exports.joinConcat = staticJoinCreator("all");


/**
 * Convenience function for creating a set of actions
 *
 * @param definitions the definitions for the actions to be created
 * @returns an object with actions of corresponding action names
 */
exports.createActions = function(definitions) {
    var actions = {};
    for (var k in definitions) {
        var val = definitions[k];
        var actionType = _.isObject(val) ? k : val;

        actions[actionType] = exports.createAction(val);
    }
    return actions;
};

/**
 * Sets the eventmitter that Fluo uses
 */
exports.setEventEmitter = function(ctx) {
    var _ = _dereq_('./utils');
    _.EventEmitter = ctx;
};


/**
 * Sets the Promise library that Fluo uses
 */
exports.setPromise = function(ctx) {
    var _ = _dereq_('./utils');
    _.Promise = ctx;
};

/**
 * Sets the Promise factory that creates new promises
 * @param {Function} factory has the signature `function(resolver) { return [new Promise]; }`
 */
exports.setPromiseFactory = function(factory) {
    var _ = _dereq_('./utils');
    _.createPromise = factory;
};


/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function(nextTick) {
    var _ = _dereq_('./utils');
    _.nextTick = nextTick;
};

/**
 * Provides the set of created actions and stores for introspection
 */
exports.__keep = _dereq_('./keep');

/**
 * Warn if Function.prototype.bind not available
 */
if (!Function.prototype.bind) {
  console.error(
    'Function.prototype.bind not available. ' +
    'ES5 shim required. ' +
    'https://github.com/jankuca/fluo#es5'
  );
}

},{"./Action":3,"./Listener":4,"./ListenerMixin":5,"./Publisher":6,"./PublisherMixin":7,"./Store":8,"./connect":9,"./connectFilter":10,"./createAction":11,"./createStore":12,"./keep":15,"./listenTo":16,"./listenToMany":17,"./staticJoinCreator":18,"./utils":19}],14:[function(_dereq_,module,exports){
var _ = _dereq_("./utils");

var slice = Array.prototype.slice;


/**
 * Used in `ListenerMethods.js` to create the instance join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} An instance method which sets up a join listen on the given listenables using the given strategy
 */
module.exports = function instanceJoinCreator(strategy) {
    return function(/* listenables..., callback*/) {
        _.throwIf(arguments.length < 3,
                'Cannot create a join with less than 2 listenables!');

        var listenables = slice.call(arguments);
        var callback = listenables.pop();
        var numberOfListenables = listenables.length;
        var join = {
            numberOfListenables: numberOfListenables,
            callback: this[callback] || callback,
            listener: this,
            strategy: strategy
        };
        var cancels = [];

        var i;
        for (i = 0; i < numberOfListenables; ++i) {
            _.throwIf(this.validateListening(listenables[i]));
        }
        for (i = 0; i < numberOfListenables; ++i) {
            cancels.push(listenables[i].listen(newListener(i,join), this));
        }
        reset(join);

        var subobj = { listenable: listenables };
        subobj.stop = makeStopper(subobj,cancels,this);

        this.subscriptions = (this.subscriptions || []).concat(subobj);

        return subobj;
    };
};

// ---- internal join functions ----

function makeStopper(subobj,cancels,context){
    return function() {
        var i, subs = context.subscriptions,
            index = (subs ? subs.indexOf(subobj) : -1);
        _.throwIf(index === -1,'Tried to remove join already gone from subscriptions list!');
        for(i=0;i < cancels.length; ++i){
            cancels[i]();
        }
        subs.splice(index, 1);
    };
}

function reset(join) {
    join.listenablesEmitted = new Array(join.numberOfListenables);
    join.args = new Array(join.numberOfListenables);
}

function newListener(i,join) {
    return function() {
        var callargs = slice.call(arguments);
        if (join.listenablesEmitted[i]){
            switch(join.strategy){
                case "strict": throw new Error("Strict join failed because listener triggered twice.");
                case "last": join.args[i] = callargs; break;
                case "all": join.args[i].push(callargs);
            }
        } else {
            join.listenablesEmitted[i] = true;
            join.args[i] = (join.strategy==="all"?[callargs]:callargs);
        }
        emitIfAllListenablesEmitted(join);
    };
}

function emitIfAllListenablesEmitted(join) {
    for (var i = 0; i < join.numberOfListenables; ++i) {
        if (!join.listenablesEmitted[i]) {
            return;
        }
    }
    join.callback.apply(join.listener,join.args);
    reset(join);
}

},{"./utils":19}],15:[function(_dereq_,module,exports){
exports.createdStores = [];

exports.createdActions = [];

exports.reset = function() {
    while(exports.createdStores.length) {
        exports.createdStores.pop();
    }
    while(exports.createdActions.length) {
        exports.createdActions.pop();
    }
};

},{}],16:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

var Listener = _dereq_('./Listener');


/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `ListenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method.
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @param {Function|String} callback The callback to register as event handler
 * @param {Function|String} defaultCallback The callback to register as default handler
 * @returns {Object} An object to be used as a mixin, which sets up the listener for the given listenable.
 */
module.exports = function(listenable,callback,initial){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            this.__listener = new Listener();
            _.link(this.__listener, this);

            this.listenTo(listenable, callback, initial);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: function () {
            this.__listener.stopListeningToAll();
        }
    };
};

},{"./Listener":4,"./utils":19}],17:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

var Listener = _dereq_('./Listener');


/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `listenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method. This version is used
 * to automatically set up a `listenToMany` call.
 *
 * @param {Object} listenables An object of listenables
 * @returns {Object} An object to be used as a mixin, which sets up the listeners for the given listenables.
 */
module.exports = function(listenables){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            this.__listener = new Listener();
            _.link(this.__listener, this);

            this.listenToMany(listenables);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: function () {
            this.__listener.stopListeningToAll();
        }
    };
};

},{"./Listener":4,"./utils":19}],18:[function(_dereq_,module,exports){

var createStore = _dereq_("./createStore");
var slice = Array.prototype.slice;


var joinStrategyMethodNames = {
    strict: 'joinStrict',
    first: 'joinLeading',
    last: 'joinTrailing',
    all: 'joinConcat'
};


/**
 * Used in `index.js` to create the static join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} A static function which returns a store with a join listen on the given listenables using the given strategy
 */
module.exports = function staticJoinCreator(strategy) {
    return function(/* listenables... */) {
        var listenables = slice.call(arguments);
        return createStore({
            init: function(){
                var method = this[joinStrategyMethodNames[strategy]];
                method.apply(this, listenables.concat('trigger'));
            }
        });
    };
};

},{"./createStore":12}],19:[function(_dereq_,module,exports){
/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
var isObject = exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.inherits = function (Child, Parent) {
    /**
     * @constructor
     */
    var Constructor = function () {};
    Constructor.prototype = Parent.prototype;

    Child.prototype = new Constructor();
    Child.prototype.constructor = Parent;
};

exports.bindMethods = function (methods, instance) {
    for (var name in methods) {
        var method = methods[name];
        if (typeof method !== 'function' || !methods.hasOwnProperty(name)) {
            continue;
        }

        instance[name] = method.bind(instance);
    }
};

exports.linkMethodsOf = function (target, instance) {
    var plain = {};

    for (var name in target) {
        var method = target[name];
        if (typeof method !== 'function' || plain[name]) {
            continue;
        }

        if (typeof instance[name] === 'function') {
            throw new Error("Cannot override API method " + name);
        }
        instance[name] = method.bind(target);
    }
};

exports.copyPropertiesOf = function (target, instance) {
    var plain = {};

    for (var name in target) {
        var value = target[name];
        if (typeof value === 'function' || typeof plain[name] !== 'undefined') {
            continue;
        }

        instance[name] = value;
    }
};

exports.link = function (target, instance) {
    exports.linkMethodsOf(target, instance);
    exports.copyPropertiesOf(target, instance);
};

exports.extend = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.isAction = function (action) {
    return Boolean(
        action &&
        (typeof action === 'object' || typeof action === 'function') &&
        typeof action.trigger === 'function'
    );
};

exports.isPromise = function(value) {
    return (
        value &&
        (typeof value === 'object' || typeof value === 'function') &&
        typeof value.then === 'function'
    );
};

exports.EventEmitter = _dereq_('eventemitter3');

exports.nextTick = function(callback) {
    setTimeout(callback, 0);
};

exports.capitalize = function(string){
    return string.charAt(0).toUpperCase()+string.slice(1);
};

exports.callbackName = function(string){
    return "on"+exports.capitalize(string);
};

exports.object = function(keys,vals){
    var o={}, i=0;
    for(;i<keys.length;i++){
        o[keys[i]] = vals[i];
    }
    return o;
};

exports.Promise = _dereq_("native-promise-only");

exports.createPromise = function(resolver) {
    return new exports.Promise(resolver);
};

exports.isArguments = function(value) {
    return typeof value === 'object' && ('callee' in value) && typeof value.length === 'number';
};

exports.throwIf = function(val,msg){
    if (val){
        throw Error(msg||val);
    }
};

},{"eventemitter3":1,"native-promise-only":2}]},{},[13])
(13)
});