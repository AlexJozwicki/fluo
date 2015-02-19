var _ = require('./utils');

var Action = require('./Action');


/**
 * @constructor
 * @extends {Action}
 */
var AsyncAction = function (definition) {
    definition = definition || {};
    if (!_.isObject(definition)) {
      definition = { actionType: definition };
    }

    definition.children = definition.children || [];
    definition.children.push('completed', 'failed');

    var functor = Action.call(this, definition);

    this.asyncResult = true;

    return functor;
};

_.inherits(AsyncAction, Action);


module.exports = AsyncAction;
