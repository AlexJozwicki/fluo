/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
var isObject = exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.inherits = function (Child, Parent) {
    /**
     * @constructor
     */
    var Constructor = function () {};
    Constructor.prototype = Parent.prototype;

    Child.prototype = new Constructor();
    Child.prototype.constructor = Parent;
};

exports.bindMethods = function (methods, instance) {
    for (var name in methods) {
        var method = methods[name];
        if (typeof method !== 'function' || !methods.hasOwnProperty(name)) {
            continue;
        }

        instance[name] = method.bind(instance);
    }
};

exports.linkMethodsOf = function (target, instance) {
    var plain = {};

    for (var name in target) {
        var method = target[name];
        if (typeof method !== 'function' || plain[name]) {
            continue;
        }

        if (typeof instance[name] === 'function') {
            throw new Error("Cannot override API method " + name);
        }
        instance[name] = method.bind(target);
    }
};

exports.copyPropertiesOf = function (target, instance) {
    var plain = {};

    for (var name in target) {
        var value = target[name];
        if (typeof value === 'function' || typeof plain[name] !== 'undefined') {
            continue;
        }

        instance[name] = value;
    }
};

exports.link = function (target, instance) {
    exports.linkMethodsOf(target, instance);
    exports.copyPropertiesOf(target, instance);
};

exports.extend = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.isAction = function (action) {
    return Boolean(
        action &&
        (typeof action === 'object' || typeof action === 'function') &&
        typeof action.trigger === 'function'
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
