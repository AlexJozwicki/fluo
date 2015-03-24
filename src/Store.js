var _ = require('./utils');

var Listener = require('./Listener');
var keep = require('./keep');


/**
 * @constructor
 * @extends {Listener}
 * @param {Object=} methods Data store object methods
 */
class Store extends Listener {
    constructor(methods) {
        super();
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

        keep.createdStores.push( this );
    }

    init() {}
}

module.exports = Store;
