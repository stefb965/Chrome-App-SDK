/*jshint expr: true*/
describe('chrome.downloads', function() {
    var chrome = {downloads: {download: angular.noop}}, chromeDownloads, mocks, observer;
    beforeEach(function() {
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        module('chrome.downloads', function($provide) {
            mocks.stub(chrome.downloads, 'download');
            $provide.value('chrome', chrome);
        });
        if (!window.chrome.runtime) {
            window.chrome.runtime = {};
        }
    });
    beforeEach(inject(function(_chromeDownloads_) {
        chromeDownloads = _chromeDownloads_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('download()', function() {
        beforeEach(function() {
            chrome.downloads.download.yields(1);
        });

        it('should call chrome download with passed options and return the download id', function(done) {
            var options = {foo: 'bar'};
            chromeDownloads.download(options).do(observer).subscribe(function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(1);
                done();
            });
            expect(chrome.downloads.download).to.have.been.calledOnce.and.to.have.been.calledWithExactly(options);
        });
    });
});
