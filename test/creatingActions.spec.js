var chai = require('chai'),
    assert = chai.assert,
    fluo = require('../src'),
    sinon = require('sinon'),
    Q = require('q');

chai.use(require('chai-as-promised'));

describe('Creating action', function() {

    it("should implement the publisher API",function(){
        var action = new fluo.Action();
        for(var apimethod in fluo.PublisherMethods){
            assert.equal(fluo.PublisherMethods[apimethod],action[apimethod]);
        }
    });

    // TODO: should it copy everything..?
    it("should copy properties from the definition into the action",function(){
        var def = {
            preEmit: function () { return "PRE"; },
            shouldEmit: function () { return "SHO"; },
            //random: function () { return "RAN"; }
        };
        var action = new fluo.Action(def);
        assert.equal(action.preEmit, def.preEmit);
        assert.equal(action.shouldEmit, def.shouldEmit);
        //assert.equal(action.random, def.random);
    });

    it("should create specified child actions",function(){
        var def = {children: ["foo","BAR"]},
            action = new fluo.Action(def);

        assert.deepEqual(action.children, ["foo", "BAR"]);
        assert.equal(action.foo.isAction, true);
        assert.deepEqual(action.foo.children, []);
        assert.equal(action.BAR.isAction, true);

    });

    it("should create completed and failed child actions for async actions",function(){
        var def = {asyncResult: true},
            action = new fluo.Action(def);

        assert.equal(action.asyncResult, true);
        assert.deepEqual(action.children, ["completed", "failed"]);
        assert.equal(action.completed.isAction, true);
        assert.equal(action.failed.isAction, true);
    });

    var action,
        testArgs;

    beforeEach(function () {
        action = new fluo.Action();
        testArgs = [1337, 'test'];
    });

    it('should be a callable functor', function() {
        assert.isFunction(action);
    });

    describe("the synchronisity",function(){
        var syncaction = new fluo.Action({sync: true}),
            asyncaction = new fluo.Action(),
            synccalled = false,
            asynccalled = false,
            store = new class extends fluo.Store {
                sync(){synccalled=true;}
                async(){asynccalled=true;}
            }();
        store.listenTo(syncaction,"sync");
        store.listenTo(asyncaction,"async");
        it("should be asynchronous when not specified",function(){
            asyncaction();
            assert.equal(false,asynccalled);
        });
        it("should be synchronous if requested",function(){
            syncaction();
            assert.equal(true,synccalled);
        });
    });

    describe('when listening to action', function() {

        var promise;

        beforeEach(function() {
            promise = new Promise(function(resolve) {
                action.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                });
            });
        });


        it('should receive the correct arguments', function() {
            action(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });


        describe('when adding preEmit hook', function() {
            var preEmit = sinon.spy(),
                action = new fluo.Action({preEmit:preEmit});

            action(1337,'test');

            it('should receive arguments from action functor', function() {
                assert.deepEqual(preEmit.firstCall.args,[1337,'test']);
            });
        });

        describe('when adding shouldEmit hook',function(){
            describe("when hook returns true",function(){
                var shouldEmit = sinon.stub().returns(true),
                    action = new fluo.Action({shouldEmit:shouldEmit}),
                    callback = sinon.spy();

                var listener = new fluo.Listener();
                listener.listenTo(action,callback);

                action(1337,'test');

                it('should receive arguments from action functor', function() {
                    assert.deepEqual(shouldEmit.firstCall.args,[1337,'test']);
                });

                it('should still trigger to listeners',function(){
                    assert.equal(callback.callCount,1);
                    assert.deepEqual(callback.firstCall.args,[1337,'test']);
                });

            });

            describe("when hook returns false",function(){
                var shouldEmit = sinon.stub().returns(false),
                    action = new fluo.Action({shouldEmit:shouldEmit}),
                    callback = sinon.spy();

                var listener = new fluo.Listener();
                listener.listenTo(action,callback);

                action(1337,'test');

                it('should receive arguments from action functor', function() {
                    assert.deepEqual(shouldEmit.firstCall.args,[1337,'test']);
                });

                it('should not trigger to listeners',function(){
                    assert.equal(callback.callCount,0);
                });
            });
        });
    });

});

describe('Creating actions with children to an action definition object', function() {
    var actions;

    beforeEach(function () {
        actions = {
            foo: new fluo.Action({asyncResult: true}),
            bar: new fluo.Action({children: ['baz']})
        };
    });

    it('should contain foo and bar properties', function() {
        assert.property(actions, 'foo');
        assert.property(actions, 'bar');
    });

    it('should contain action functor on foo and bar properties with children', function() {
        assert.instanceOf(actions.foo, fluo.Action);
        assert.instanceOf(actions.foo.completed, fluo.Action);
        assert.instanceOf(actions.foo.failed, fluo.Action);
        assert.instanceOf(actions.bar, fluo.Action);
        assert.instanceOf(actions.bar.baz, fluo.Action);
    });

    describe('when listening to the child action created this way', function() {
        var promise;

        beforeEach(function() {
            promise = new Promise(function(resolve) {
                actions.bar.baz.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                }, {}); // pass empty context
            });
        });

        it('should receive the correct arguments', function() {
            var testArgs = [1337, 'test'];
            actions.bar.baz(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });
    });

    describe('when promising an async action created this way', function() {
        var promise;

        beforeEach(function() {
            // promise resolves on foo.completed
            promise = new Promise(function(resolve) {
                actions.foo.completed.listen(function(){
                    resolve.apply(null, arguments);
                }, {}); // pass empty context
            });

            // listen for foo and return a promise
            actions.foo.listen(function() {
                var args = Array.prototype.slice.call(arguments, 0);
                var deferred = Q.defer();

                setTimeout(function() {
                    deferred.resolve(args);
                }, 0);

                return deferred.promise;
            });
        });

        it('should invoke the completed action with the correct arguments', function() {
            var testArgs = [1337, 'test'];
            actions.foo(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });
    });
});

describe('Creating multiple actions to an action definition object', function() {

    var actions;

    beforeEach(function () {
        actions = {
            foo: new fluo.Action(),
            bar: new fluo.Action()
        };
    });

    it('should contain foo and bar properties', function() {
        assert.property(actions, 'foo');
        assert.property(actions, 'bar');
    });

    it('should contain action functor on foo and bar properties', function() {
        assert.instanceOf(actions.foo, fluo.Action);
        assert.instanceOf(actions.bar, fluo.Action);
    });

    describe('when listening to any of the actions created this way', function() {

        var promise;

        beforeEach(function() {
            promise = Q.promise(function(resolve) {
                actions.foo.listen(function() {
                    assert.equal(this, actions.foo);
                    resolve(Array.prototype.slice.call(arguments, 0));
                }); // not passing context, should default to action
            });
        });

        it('should receive the correct arguments', function() {
            var testArgs = [1337, 'test'];
            actions.foo(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });

    });

});
