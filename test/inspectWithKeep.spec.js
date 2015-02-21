var chai = require('chai'),
    assert = chai.assert,
    fluo = require('../src');

describe('with the keep reset', function() {
    beforeEach(function () {
        fluo.__keep.reset();
    });

    describe('when an action is created', function() {
        var action;

        beforeEach(function () {
            action = fluo.createAction();
        });

        it('should be in the keep', function() {
            assert.equal(fluo.__keep.createdActions[0], action);
        });
    });

    describe('when a store is created', function() {
        var store;

        beforeEach(function () {
            store = fluo.createStore({ init: function() { /* no-op */} });
        });

        it('should be in the keep', function() {
            assert.equal(fluo.__keep.createdStores[0], store);
        });
    });
});
