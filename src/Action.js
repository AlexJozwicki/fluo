var _ = require('./utils');

var Publisher = require('./Publisher');
var keep = require('./keep');


/**
 * @constructor
 * @extends {Publisher}
 */
class Action extends Publisher {
    constructor(definition) {
        super( this );

        definition = definition || {};
        if (!_.isObject(definition)) {
          definition = { actionType: definition };
        }

        //this.actionType = 'action';
        this.eventType = 'event';
        this.asyncResult = !!definition.asyncResult;

        this.children = definition.children || [];
        if (this.asyncResult) {
            this.children.push('completed', 'failed');
        }

        delete definition.children;
        _.extend(this, definition);
        this.createChildActions();

        var trigger = definition.sync ? this.triggerSync : this.trigger;
        var functor = trigger.bind(this);
        functor.__proto__ = this;

        // why do we need this ?
        keep.createdActions.push( functor );

        return functor;
    }

    get _isAction() { return true; }


    /**
     * @protected
     */
    createChildActions() {
        var children = this.children;
        for (var i = 0; i < children.length; ++i) {
            var name = children[i];
            this[name] = new Action({ actionType: name });
        }
    }
}


module.exports = Action;
