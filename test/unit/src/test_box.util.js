/*jshint expr: true*/
describe('box.util', function() {
    var mocks, observer, getAll;
    beforeEach(function() {
        module('box.util');
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
    });
    beforeEach(inject(function(_getAll_) {
        getAll = _getAll_;
    }));
    afterEach(function() {
        mocks.restore();
    });
    describe('getAll()', function() {
        var observableFactory, entryTranslator;
        beforeEach(function() {
            observableFactory = mocks.stub();
            entryTranslator = mocks.stub();
        });
        [0, 1, 20, 21, 42, 105].forEach(function(total_count) {
            it('should call observable factory as long as it has results for total_count=' + total_count, function() {
                var limit = 20;
                observableFactory
                    .onFirstCall().returns(Rx.Observable.defer(function() {return Rx.Observable.return({
                        total_count: total_count,
                        entries: (new Array(Math.min(total_count, limit))).fill(0)
                    }); }));
                var expectSubsequentCall = function(i) {
                    observableFactory
                        .onCall(i / limit).returns(Rx.Observable.defer(function() {return Rx.Observable.return({
                            total_count: total_count,
                            entries: (new Array(Math.min(limit, total_count - i))).fill(0)
                        }); }));
                };
                for (var i = limit; i < total_count; i += limit) {
                    expectSubsequentCall(i);
                }
                entryTranslator.returns(1);
                getAll(observableFactory, entryTranslator).subscribe(observer);
                for (i = limit; i < total_count; i += limit) {
                    expect(observableFactory).to.have.been.calledWithExactly(limit, i);
                }
                expect(entryTranslator.callCount).to.equal(total_count);
                expect(observer.callCount).to.equal(total_count);
                if (total_count > 0) {
                    expect(entryTranslator.firstCall.args[0]).to.equal(0);
                    expect(entryTranslator.firstCall.args.length).to.equal(3);
                    expect(observer.firstCall.args[0]).to.equal(1);
                    expect(observer.firstCall.args.length).to.equal(1);
                }
            });
        });
    });
});
