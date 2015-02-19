
var Store = require('./Store');

var keep = require('./keep');


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
