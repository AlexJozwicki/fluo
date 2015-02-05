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

    this.dispatchPromises_ = [];
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
    var aborted = false;
    bindContext = bindContext || this;

    var eventHandler = function (args) {
        if (aborted) {
            // This state is achieved when one listener removes another.
            //   It might be considered a bug of EventEmitter2 which makes
            //   a snapshot of the listener list before looping through them
            //   and effectively ignores calls to removeListener() during emit.
            // TODO: Needs a test.
            return;
        }

        var result = callback.apply(bindContext, args);
        if (_.isPromise(result)) {
            // Note: To support mixins, we need to access the method this way.
            //   Overrides are not possible.
            var canHandlePromise = Publisher.prototype.canHandlePromise.call(self);
            if (!canHandlePromise) {
                console.warn('Unhandled promise for ' + self.eventType);
                return;
            }

            self.dispatchPromises_.push({
                promise: result,
                listener: callback
            });
        }
    };
    this.emitter.addListener(this.eventType, eventHandler);

    return function () {
        aborted = true;
        self.emitter.removeListener(self.eventType, eventHandler);
    };
};


Publisher.prototype.listenOnce = function (callback, bindContext) {
    bindContext = bindContext || this;
    var unsubscribe = this.listen(function () {
        var args = Array.prototype.slice.call(arguments);
        unsubscribe();
        return callback.apply(bindContext, args);
    });
    return unsubscribe;
};


/**
 * Attach handlers to promise that trigger the completed and failed
 * child publishers, if available.
 *
 * @param {Object} promise The result to use or a promise to which to listen.
 */
Publisher.prototype.resolve = function (promise) {
    // Note: To support mixins, we need to access the method this way.
    //   Overrides are not possible.
    var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
    if (!canHandlePromise) {
        throw new Error('Not an async publisher');
    }

    if (!_.isPromise(promise)) {
        this.completed.trigger(promise);
        return;
    }

    var self = this;
    promise.then(function (response) {
        return self.completed.trigger(response);
    }, function (error) {
        return self.failed.trigger(error);
    });
};


Publisher.prototype.reject = function (result) {
    if (_.isPromise(result)) {
        console.warn('Use #resolve() for promises.');
        return;
    }

    this.failed.trigger(result);
};


Publisher.prototype.then = function (onSuccess, onFailure) {
    // Note: To support mixins, we need to access the method this way.
    //   Overrides are not possible.
    var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
    if (!canHandlePromise) {
        throw new Error('Not an async publisher');
    }

    if (onSuccess) {
        this.completed.listenOnce(onSuccess);
    }
    if (onFailure) {
        this.failed.listenOnce(onFailure);
    }
};


Publisher.prototype['catch'] = function (onFailure) {
    this.then(null, onFailure);
};


Publisher.prototype.canHandlePromise = function () {
    return _.isPublisher(this.completed) && _.isPublisher(this.failed);
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
        this.dispatchPromises_ = [];
        this.emitter.emit(this.eventType, args);
        // Note: To support mixins, we need to access the method this way.
        //   Overrides are not possible.
        Publisher.prototype.handleDispatchPromises_.call(this);
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
    // Note: To support mixins, we need to access the method this way.
    //   Overrides are not possible.
    var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
    if (!canHandlePromise) {
        throw new Error('Publisher must have "completed" and "failed" child publishers');
    }

    var self = this;
    var args = arguments;

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


Publisher.prototype.handleDispatchPromises_ = function () {
    var promises = this.dispatchPromises_;
    this.dispatchPromises_ = [];

    if (promises.length === 0) {
        return;
    }
    if (promises.length === 1) {
        return this.resolve(promises[0].promise);
    }

    var mappedPromises = promises.map(function (item) {
        return item.promise.then(function (result) {
            return {
                listener: item.listener,
                value: result
            };
        });
    });

    var joinedPromise = _.Promise.all(mappedPromises);
    return this.resolve(joinedPromise);
};


module.exports = Publisher;
