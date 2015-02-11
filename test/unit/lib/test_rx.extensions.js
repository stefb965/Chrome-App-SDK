/*jshint expr: true*/
describe('rx.extensions', function() {
    describe('fromChromeCallback()', function() {
        var callback, mocks, observer;
        beforeEach(function() {
            mocks = sinon.sandbox.create();
            observer = mocks.spy();
            callback = mocks.stub();
            if (!chrome.runtime) {
                chrome.runtime = {};
            }
        });
        afterEach(function() {
            mocks.restore();
            if (chrome.runtime) {
                chrome.runtime.lastError = undefined;
            }
        });
        it('should return an observable that calls the passed function', function() {
            callback.yields('foo');
            Rx.Observable.fromChromeCallback(callback)('foo', 'bar').subscribe(observer);
            expect(callback).to.have.been.calledOnce.and.to.have.been.calledWith('foo', 'bar');
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('foo');
        });

        it('should return an observable that calls schedule on the passed scheduler', function() {
            var scheduler = mocks.stub(Rx.Scheduler.immediate);
            scheduler.schedule.yields();
            callback.yields('foo');
            Rx.Observable.fromChromeCallback(callback, scheduler)().subscribe(observer);
            expect(callback).to.have.been.calledOnce.and.to.have.been.calledWith();
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('foo');
            expect(scheduler.schedule).to.have.been.calledOnce;
        });

        it('should return an observable that calls the passed function on the passed context', function() {
            var context = {};
            callback.yields('foo');
            Rx.Observable.fromChromeCallback(callback, null, context)().subscribe(observer);
            expect(callback).to.have.been.calledOnce.and.to.have.been.calledWith().and.to.have.been.calledOn(context);
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('foo');
        });

        it('should return an observable that propagates chrome.runtime.lastError', function() {
            var errObserver = mocks.spy(), completedObserver = mocks.spy();
            callback.yields('foo');
            chrome.runtime.lastError = {message: 'err'};
            Rx.Observable.fromChromeCallback(callback)().subscribe(observer, errObserver, completedObserver);
            expect(observer).to.not.have.been.called;
            expect(errObserver).to.have.been.calledOnce.and.to.have.been.calledWithExactly('err');
            expect(completedObserver).to.not.have.been.called;
        });

        it('should return an observable that uses the passed selector to translate the callback results', function() {
            var selector = mocks.stub();
            selector.returnsArg(0);
            callback.yields('foo', 'bar');
            var args;
            function saveArgs() {
                args = arguments;
            }
            saveArgs('foo', 'bar');
            Rx.Observable.fromChromeCallback(callback, null, null, selector)('foo', 'bar').subscribe(observer);
            expect(callback).to.have.been.calledOnce.and.to.have.been.calledWith('foo', 'bar');
            expect(selector).to.have.been.calledOnce.and.to.have.been.calledWithExactly(args);
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(args);
        });
    });

    describe('fromChromeEvent()', function() {
        var mocks;
        beforeEach(function() {
            mocks = sinon.sandbox.create();
            mocks.stub(Rx.Observable, 'fromEventPattern');
        });
        afterEach(function() {
            mocks.restore();
        });

        it('should call Rx.Observable.fromEventPattern', function() {
            var event = {addListener: mocks.spy(), removeListener: mocks.spy()},
                selector = mocks.spy(),
                stub = Rx.Observable.fromEventPattern,
                handler = mocks.spy();
            Rx.Observable.fromChromeEvent(event, selector);
            expect(stub).to.have.been.calledOnce;
            var args = stub.firstCall.args;
            expect(args[0]).to.be.a('function');
            args[0](handler);
            expect(event.addListener).to.have.been.calledOnce.and.to.have.been.calledWithExactly(handler);
            expect(args[1]).to.be.a('function');
            args[1](handler);
            expect(event.removeListener).to.have.been.calledOnce.and.to.have.been.calledWithExactly(handler);
            expect(args[2]).to.equal(selector);
        });
    });
});
