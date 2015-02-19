
var Listener = require('./Listener');

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
