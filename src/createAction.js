
var Action = require('./Action');
var AsyncAction = require('./AsyncAction');

var keep = require('./keep');


/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} method Action object definition.
 * @return {!Action} An action object.
 */
var createAction = function (definition) {
    definition = definition || {};

    var action;
    if (definition.asyncResult) {
        action = new AsyncAction(definition);
    } else {
        action = new Action(definition);
    }

    keep.createdActions.push(action);

    return action;
};

module.exports = createAction;
