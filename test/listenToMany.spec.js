var assert = require('chai').assert,
    sinon = require('sinon'),
    fluo = require('../src'),
    listenToMany = require('../src/listenToMany'),
    _ = require('../src/utils');

describe('the listenToMany shorthand',function(){

    describe("when calling the factory",function(){
        var unsubscriber = sinon.spy(),
            listenable1 = {listen: sinon.stub().returns(unsubscriber)},
            listenable2 = {listen: sinon.stub().returns(unsubscriber)},
            listenables = {
                firstAction: listenable1,
                secondAction: listenable2
            },
            context = {
                onFirstAction: sinon.spy(),
                onSecondAction: sinon.spy()
            },
            result = _.extend(context,listenToMany(listenables));

        it("should return object with componentDidMount and componentWillUnmount methods",function(){
            assert.isFunction(result.componentDidMount);
            assert.isFunction(result.componentWillUnmount);
        });

        describe("when calling the added componentDidMount",function(){
            result.componentDidMount();

            it.skip("should add to a subscriptions array (via listenToMany)",function(){
                var subs = result.subscriptions;
                assert.isArray(subs);
                assert.equal(subs[0].listenable,listenable1);
                assert.equal(subs[1].listenable,listenable2);
            });

            it.skip("should call listen on the listenables correctly (via listenToMany)",function(){
                assert.equal(listenable1.listen.callCount,1);
                assert.deepEqual(listenable1.listen.firstCall.args,[context.onFirstAction,result]);
                assert.equal(listenable2.listen.callCount,1);
                assert.deepEqual(listenable2.listen.firstCall.args,[context.onSecondAction,result]);
            });
        });
    });

    describe('callbacks returning promises', function () {
        var firstAction = new fluo.Action({ asyncResult: true });
        var secondAction = new fluo.Action({ asyncResult: true });
        var listenables = {
            firstAction: firstAction,
            secondAction: secondAction
        };

        firstAction.completed.trigger = sinon.spy();
        secondAction.failed.trigger = sinon.spy();

        it('should resolve action with promises returned by their callback',
                function () {
            var resolveFirstPromise;
            var rejectSecondPrimise;
            var firstPromise = _.createPromise(function (resolve) {
                resolveFirstPromise = resolve;
            });
            var secondPromise = _.createPromise(function (_, reject) {
                rejectSecondPrimise = reject;
            });
            firstPromise.key = 'FIRST';
            secondPromise.key = 'SECOND';
            var context = {
                onFirstAction: function () { return firstPromise; },
                onSecondAction: function () { return secondPromise; }
            };

            var obj = _.extend(context, listenToMany(listenables));
            obj.componentDidMount();

            var testResultPromise1 = _.createPromise(function (resolve) {
                firstAction.completed.listen(resolve);
            });
            var testResultPromise2 = _.createPromise(function (resolve) {
                secondAction.failed.listen(resolve);
            });

            firstAction.triggerSync();
            secondAction.triggerSync();
            resolveFirstPromise('RESULT1');
            rejectSecondPrimise('RESULT2');

            assert.eventually.equal(testResultPromise1, 'RESULT1');
            assert.eventually.equal(testResultPromise2, 'RESULT2');
        });
    });
});
