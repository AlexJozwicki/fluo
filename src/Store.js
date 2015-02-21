var _ = require('./utils');

var Listener = require('./Listener');


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
