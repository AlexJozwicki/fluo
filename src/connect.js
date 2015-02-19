var _ = require('./utils');

var Listener = require('./Listener');


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
