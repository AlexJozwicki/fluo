
var Store = require("./Store");
var slice = Array.prototype.slice;


var joinStrategyMethodNames = {
    strict: 'joinStrict',
    first: 'joinLeading',
    last: 'joinTrailing',
    all: 'joinConcat'
};


/**
 * Used in `index.js` to create the static join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} A static function which returns a store with a join listen on the given listenables using the given strategy
 */
module.exports = function staticJoinCreator(strategy) {
    return function(/* listenables... */) {
        var listenables = slice.call(arguments);
        return new Store({
            init: function(){
                var method = this[joinStrategyMethodNames[strategy]];
                method.apply(this, listenables.concat('trigger'));
            }
        });
    };
};
