var Listener = require('./Listener');



/**
 */
class Store extends Listener {
    constructor( listenables ) {
        super();
        this.eventType = 'change';

        if( listenables ) {
            var arr = [].concat(listenables);
            for (var i = 0; i < arr.length; ++i) {
                this.listenToMany(arr[i]);
            }
        }
    }

    /**
     * Publishes the state to all subscribers.
     * This ensures that the stores always publishes the same data/signature.
     */
    publishState() {
        super.trigger( this.state );
    }
}

module.exports = Store;
