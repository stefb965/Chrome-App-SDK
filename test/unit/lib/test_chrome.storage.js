/*jshint expr: true*/
describe('chrome.storage', function() {
    var chrome = {storage: {local: {get: angular.noop, set: angular.noop, remove: angular.noop}}}, chromeStorage, mocks, observer;
    beforeEach(function() {
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        module('chrome.storage', function($provide) {
            mocks.stub(chrome.storage.local);
            $provide.value('chrome', chrome);
        });
        if (!window.chrome.runtime) {
            window.chrome.runtime = {};
        }
    });
    beforeEach(inject(function(_chromeStorage_) {
        chromeStorage = _chromeStorage_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('getLocal()', function() {
        var name = 'access_token', props = {foo: 'bar'}, storedItem = {};
        beforeEach(function() {
            storedItem[name] = props;
            chrome.storage.local.get.yields(storedItem);
        });

        it('should call chrome.storage.local.get', function() {
            chromeStorage.getLocal(name).subscribe(observer);
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(props);
            expect(chrome.storage.local.get).to.have.been.calledOnce.and.to.have.been.calledWith(name);
        });
    });

    describe('setLocal()', function() {
        var name = 'access_token', props = {foo: 'bar'}, storedItem = {};
        beforeEach(function() {
            storedItem[name] = props;
            chrome.storage.local.set.yields(true);
        });

        it('should call chrome.storage.local.set and return whether or not the operation was successful', function() {
            chromeStorage.setLocal(storedItem).subscribe(observer);
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(true);
            expect(chrome.storage.local.set).to.have.been.calledOnce.and.to.have.been.calledWith(storedItem);
        });
    });

    describe('removeLocal()', function() {
        var name = 'access_token';
        beforeEach(function() {
            chrome.storage.local.remove.yields(true);
        });

        it('should call chrome.storage.local.remove and return whether or not the operation was successful', function() {
            chromeStorage.removeLocal(name).subscribe(observer);
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(true);
            expect(chrome.storage.local.remove).to.have.been.calledOnce.and.to.have.been.calledWith(name);
        });
    });
});
