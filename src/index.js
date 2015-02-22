var _ = require('./utils');

var staticJoinCreator = require('./staticJoinCreator');


exports.Action = require('./Action');
exports.Listener = require('./Listener');
exports.Publisher = require('./Publisher');
exports.Store = require('./Store');

exports.createAction = require('./createAction');
exports.createStore = require('./createStore');

exports.connect = require('./connect');
exports.connectFilter = require('./connectFilter');

exports.ListenerMixin = require('./ListenerMixin');
exports.PublisherMixin = require('./PublisherMixin');

exports.listenTo = require('./listenTo');
exports.listenToMany = require('./listenToMany');



exports.joinTrailing = exports.all = staticJoinCreator("last"); // fluo.all alias for backward compatibility
exports.joinLeading = staticJoinCreator("first");
exports.joinStrict = staticJoinCreator("strict");
exports.joinConcat = staticJoinCreator("all");


exports.EventEmitter = _.EventEmitter;
exports.Promise = _.Promise;


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
    var _ = require('./utils');
    exports.EventEmitter = _.EventEmitter = ctx;
};


/**
 * Sets the Promise library that Fluo uses
 */
exports.setPromise = function(ctx) {
    var _ = require('./utils');
    exports.Promise = _.Promise = ctx;
};

/**
 * Sets the Promise factory that creates new promises
 * @param {Function} factory has the signature `function(resolver) { return [new Promise]; }`
 */
exports.setPromiseFactory = function(factory) {
    var _ = require('./utils');
    _.createPromise = factory;
};


/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function(nextTick) {
    var _ = require('./utils');
    _.nextTick = nextTick;
};

/**
 * Provides the set of created actions and stores for introspection
 */
exports.__keep = require('./keep');

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
