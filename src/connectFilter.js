var _ = require('./utils');

var Listener = require('./Listener');


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

