var _ = require('./utils');

var Listener = require('./Listener');


/**
 * @constructor
 * @extends {Listener}
 * @param {Object=} methods Data store object methods
 */
class Store extends Listener {
    constructor() {
        super();
        this.eventType = 'change';

        this.init();

        if (this.listenables) {
            var arr = [].concat(this.listenables);
            for (var i = 0; i < arr.length; ++i) {
                this.listenToMany(arr[i]);
            }
        }
    }

    init() {}
}

module.exports = Store;
