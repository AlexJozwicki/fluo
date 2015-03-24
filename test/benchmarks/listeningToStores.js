var fluo = require('../../src'),
    action = fluo.createAction(),
    store,
    i,
    noop = function() {},
    NUMBER_OF_LISTENERS = 100;

store = new class extends fluo.Store {
    constructor() {
        super();
        this.listenTo(action, this.trigger);
    }
}();

// noops are listening to the store to emit
for (i = 0; i < NUMBER_OF_LISTENERS; i++) {
    store.listen(noop);
}

exports.name = "Listening to stores with " + NUMBER_OF_LISTENERS + " listeners";

exports.fn = function() {
    action(Math.random());
};
