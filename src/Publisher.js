var _ = require('./utils');


/**
 * @constructor
 */
var Publisher = function () {
    /**
     * @protected
     */
    this.emitter = new _.EventEmitter();

    this.children = [];
    this.eventType = 'event';
};


/**
 * Hook used by the publisher that is invoked before emitting
 * and before `shouldEmit`. The arguments are the ones that the action
 * is invoked with. If this function returns something other than
 * undefined, that will be passed on as arguments for shouldEmit and
 * emission.
 */
Publisher.prototype.preEmit = function () {};

/**
 * Hook used by the publisher after `preEmit` to determine if the
 * event should be emitted with given arguments. This may be overridden
 * in your application, default implementation always returns true.
 *
 * @returns {Boolean} true if event should be emitted
 */
Publisher.prototype.shouldEmit = function () {
    return true;
};

/**
 * Subscribes the given callback for action triggered
 *
 * @param {Function} callback The callback to register as event handler
 * @param {Mixed} [optional] bindContext The context to bind the callback with
 * @returns {Function} Callback that unsubscribes the registered event handler
 */
Publisher.prototype.listen = function (callback, bindContext) {
    var self = this;
    bindContext = bindContext || this;

    var eventHandler = function (args) {
        callback.apply(bindContext, args);
    };
    this.emitter.addListener(this.eventType, eventHandler);

    return function () {
        self.emitter.removeListener(self.eventType, eventHandler);
    };
};

/**
 * Attach handlers to promise that trigger the completed and failed
 * child publishers, if available.
 *
 * @param {Object} The promise to attach to
 */
Publisher.prototype.promise = function (promise) {
    var self = this;

    var canHandlePromise =
        this.children.indexOf('completed') >= 0 &&
        this.children.indexOf('failed') >= 0;

    if (!canHandlePromise){
        throw new Error('Publisher must have "completed" and "failed" child publishers');
    }

    promise.then(function (response) {
        return self.completed.trigger(response);
    });
    // IE compatibility - catch is a reserved word - without bracket notation source compilation will fail under IE
    promise["catch"](function (error) {
        return self.failed.trigger(error);
    });
};

/**
 * Subscribes the given callback for action triggered, which should
 * return a promise that in turn is passed to `this.promise`
 *
 * @param {Function} callback The callback to register as event handler
 */
Publisher.prototype.listenAndPromise = function (callback, bindContext) {
    var self = this;
    bindContext = bindContext || this;

    return this.listen(function () {
        if (!callback) {
            throw new Error('Expected a function returning a promise but got ' + callback);
        }

        var args = arguments,
            promise = callback.apply(bindContext, args);
        return self.promise.call(self, promise);
    }, bindContext);
};

/**
 * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
 */
Publisher.prototype.triggerSync = function () {
    var args = arguments;
    var preResult = this.preEmit.apply(this, args);
    if (typeof preResult !== 'undefined') {
        args = _.isArguments(preResult) ? preResult : [].concat(preResult);
    }

    if (this.shouldEmit.apply(this, args)) {
        this.emitter.emit(this.eventType, args);
    }
};

/**
 * Tries to publish the event on the next tick
 */
Publisher.prototype.trigger = function () {
    var args = arguments;
    var self = this;

    _.nextTick(function () {
        self.triggerSync.apply(self, args);
    });
};

/**
 * Returns a Promise for the triggered action
 */
Publisher.prototype.triggerPromise = function () {
    var self = this;
    var args = arguments;

    var canHandlePromise = (
        this.children.indexOf('completed') !== -1 &&
        this.children.indexOf('failed') !== -1
    );

    if (!canHandlePromise) {
        throw new Error('Publisher must have "completed" and "failed" child publishers');
    }

    var promise = _.createPromise(function (resolve, reject) {
        var removeSuccess = self.completed.listen(function (args) {
            removeSuccess();
            removeFailed();
            resolve(args);
        });

        var removeFailed = self.failed.listen(function (args) {
            removeSuccess();
            removeFailed();
            reject(args);
        });

        self.trigger.apply(self, args);
    });

    return promise;
};


module.exports = Publisher;
