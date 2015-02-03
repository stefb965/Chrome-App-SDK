/*jshint expr: true*/
describe('chrome.identity', function() {
    var chrome, chromeIdentity, mocks, observer;
    beforeEach(function() {
        chrome = {identity: {launchWebAuthFlow: angular.noop}, runtime: {sendMessage: angular.noop}};
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        module('chrome.identity', function($provide) {
            mocks.stub(chrome.identity, 'launchWebAuthFlow');
            mocks.stub(chrome.runtime, 'sendMessage');
            $provide.value('chrome', chrome);
        });
    });
    beforeEach(inject(function(_chromeIdentity_) {
        chromeIdentity = _chromeIdentity_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('login()', function() {
        var url, options;
        beforeEach(function() {
            options = {foo: 'bar'};
            url = 'https://callback.url';
        });
        it('should call launchWebAuthFlow with and return the redirect uri', function(done) {
            chrome.identity.launchWebAuthFlow.yields(url);
            chromeIdentity.login(options).do(observer).subscribe(function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(url);
                done();
            });
            expect(chrome.identity.launchWebAuthFlow).to.have.been.calledOnce.and.to.have.been.calledWithExactly(options);
        });

        it('should call sendMessage if chrome.identity is undefined', function(done) {
            chrome.runtime.sendMessage.yields(url);
            chrome.identity = undefined;
            chromeIdentity.login(options).do(observer).subscribe(function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(url);
                done();
            });
            expect(chrome.runtime.sendMessage).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                function: 'identity.launchWebAuthFlow',
                params: [options]
            });
        });
    });
});
