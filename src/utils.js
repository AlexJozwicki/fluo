/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
var isObject = exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.extend = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
                var desc_src = source;
                while (desc_src) {
                    // Getter invocation prevention.
                    var desc = Object.getOwnPropertyDescriptor(desc_src, prop);
                    if (desc) {
                        Object.defineProperty(obj, prop, desc);
                        break;
                    }

                    // Inherited (not "own") properties are ignored
                    //   by Object.getOwnPropertyDescriptor()
                    //   We need to climb up the prototype chain.
                    desc_src = Object.getPrototypeOf(desc_src);
                }
            } else {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.isAction = function (action) {
    return exports.isPublisher(action) && action._isAction;
};

exports.isPublisher = function (pub) {
    return Boolean(
        pub &&
        (typeof pub === 'object' || typeof pub === 'function') &&
        typeof pub.trigger === 'function'
    );
};

exports.isPromise = function(value) {
    return (
        value &&
        (typeof value === 'object' || typeof value === 'function') &&
        typeof value.then === 'function'
    );
};

exports.EventEmitter = require('eventemitter3');

exports.nextTick = function(callback) {
    setTimeout(callback, 0);
};

exports.capitalize = function(string){
    return string.charAt(0).toUpperCase()+string.slice(1);
};

exports.callbackName = function(string){
    return "on"+exports.capitalize(string);
};

exports.object = function(keys,vals){
    var o={}, i=0;
    for(;i<keys.length;i++){
        o[keys[i]] = vals[i];
    }
    return o;
};

exports.Promise = require("native-promise-only");

exports.createPromise = function(resolver) {
    return new exports.Promise(resolver);
};

exports.isArguments = function(value) {
    return typeof value === 'object' && ('callee' in value) && typeof value.length === 'number';
};

exports.throwIf = function(val,msg){
    if (val){
        throw Error(msg||val);
    }
};
