var chai = require('chai'),
    assert = chai.assert,
    fluo = require('../src'),
    Q = require('q');

chai.use(require('chai-as-promised'));

describe('Managing subscriptions via ListenerMixin', function() {
    var component,
        action,
        promise,
        store;

    beforeEach(function() {
        // simulate ReactJS component instantiation and mounting
        component = Object.create(fluo.ListenerMixin);
        delete component.subscriptions;

        action = fluo.createAction();

        promise = Q.Promise(function(resolve) {
            component.listenTo(action, function() {
                resolve(Array.prototype.slice.call(arguments, 0));
            });
        });
    });

    it('should get argument given on action', function() {
        action('my argument');

        return assert.eventually.equal(promise, 'my argument');
    });

    it('should get any arbitrary arguments given on action', function() {
        action(1337, 'ninja');

        return assert.eventually.deepEqual(promise, [1337, 'ninja']);
    });

    describe('using a store and listening to it', function() {
        beforeEach(function () {
            store = fluo.createStore({
                init: function() {
                    this.listenTo(action, this.triggerSync);
                }
            });

            component.listenTo(store, function() {});
        });

        it('should be possible to listen to the store using two different components', function() {
            var component2 = Object.create(fluo.ListenerMixin);
            component2.listenTo(store, function() {});
        });
    });

    describe('get initial state', function () {
        beforeEach(function() {
            component.componentWillUnmount();
        });

        function mountComponent() {
            delete component.subscriptions;
            promise = Q.Promise(function(resolve) {
                var setData = function () {
                    resolve(Array.prototype.slice.call(arguments, 0));
                };
                component.listenTo(store, setData, setData);
            });
        }

        it('should get initial state from getInitialState()', function () {
            store = fluo.createStore({
                getInitialState: function () {
                    return 'initial state';
                }
            });
            mountComponent();
            return assert.eventually.equal(promise, 'initial state');
        });

        it('should get initial state from getInitialState() returned promise', function () {
            store = fluo.createStore({
                getInitialState: function () {
                    return Q.Promise(function (resolve) {
                        setTimeout(function () {
                            resolve('initial state');
                        }, 20);
                    });
                }
            });
            mountComponent();
            return assert.eventually.equal(promise, 'initial state');
        });
    });

});
