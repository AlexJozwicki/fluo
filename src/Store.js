var Listener = require('./Listener');
var keep = require('./keep');


/**
 * @constructor
 * @extends {Listener}
 * @param {Object=} methods Data store object methods
 */
class Store extends Listener {
    constructor(listenables) {
        super();
        this.eventType = 'change';

        if (listenables) {
            var arr = [].concat(listenables);
            for (var i = 0; i < arr.length; ++i) {
                this.listenToMany(arr[i]);
            }
        }

        keep.createdStores.push( this );
    }
}

module.exports = Store;
