/* jshint expr:true */
describe.only('box.sdk', function() {
    var mocks, observer, xhr, server, module, injector;
    var boxSdk, authUrl;
    var chromeStorage, chrome;
    var authCode = 'authorization_code';
    var clientId = 'i3p-----------------------------',
        clientSecret = 'uII-----------------------------';
    beforeEach(function() {
        mocks = sinon.sandbox.create();
        server = mocks.useFakeServer();
        xhr = window.XMLHttpRequest;
        observer = mocks.spy();
        angular.module('box.conf')
            .constant('clientSecret', clientSecret)
            .constant('clientId', clientId);
        mocks.stub(window, 'FormData', function() {
            var datas = [];
            this.append = function(name, value, filename) {
                datas.push({
                    name: name,
                    value: value
                });
                if (filename) { datas[datas.length - 1].filename = filename; }
            };
            this.toString = function() {
                return datas.map(function(data) {
                    return data.name + '=' + data.value + (data.filename ? ';' + data.filename : '');
                }).join('&');
            };
        });
        if (!window.chrome.runtime) {
            window.chrome.runtime = {};
        }
        module = angular.module('box.sdk.test', ['box.sdk', 'box.http', 'box.objects', 'rx.http', 'box.auth', 'chrome']);
        module.run(['boxHttp', 'chrome', 'redirectUri', function(_boxHttp_, _chrome_, redirectUri) {
            var stubStorage = {local: {get: angular.noop, set: angular.noop, remove: angular.noop}};
            chrome = _chrome_;
            if (!angular.isDefined(chrome.storage)) { chrome.storage = stubStorage; }
            var local = chrome.storage.local;
            var cache = {};
            mocks.stub(local, 'get', function(name, callback) {
                var hash = {};
                if(cache.hasOwnProperty(name)) { hash[name] = cache[name]; }
                callback(hash);
            });
            mocks.stub(local, 'set', function(items, callback) {
                angular.extend(cache, items);
                callback(true);
            });
            mocks.stub(local, 'remove', function(name, callback) {
                delete cache[name];
                callback(true);
            });
            var chromeIdentity = chrome.identity || {launchWebAuthFlow: angular.noop};
            mocks.stub(chromeIdentity, 'launchWebAuthFlow');
            chromeIdentity.launchWebAuthFlow.yields(redirectUri + '?code=' + authCode);
        }]);

        injector = angular.injector(['ng', 'box.sdk.test', 'box.sdk', 'box.http', 'box.objects', 'rx.http', 'box.auth', 'chrome']);

        boxSdk = injector.get('boxSdk');
        authUrl = injector.get('authUrl');
        chromeStorage = injector.get('chromeStorage');

    });
    afterEach(function() {
        mocks.restore();
    });

    describe('logout()', function() {
        it('should remove stored tokens and revoke the token', function(done) {
            var postReturn = [204, {}, ''];
            chromeStorage.setLocal({refresh_token: {token: 'refresh_token'}}).subscribe(angular.noop);
            server.respondWith('POST', authUrl + '/revoke', postReturn);
            server.autoRespond = true;
            var request;
            var onCreate = xhr.onCreate;
            xhr.onCreate = function(_request) {
                request = _request;
                if (onCreate) { onCreate(_request); }
            };

            boxSdk.logout()
                .do(observer)
                .subscribe(
                function() {
                    expect(observer).to.have.been.calledOnce;
                    expect(observer.firstCall.args[0].data).to.equal(postReturn[2]);
                    expect(request.url).to.equal(authUrl + '/revoke');
                    expect(request.method).to.equal('POST');
                    expect(request.requestBody.toString()).to.include(clientId).and.to.include(clientSecret).and.to.include('refresh_token');
                    done();
                },
                function(error) {
                    assert.fail(error);
                    done();
                },
                function() {
                    done();
                }
            );

            expect(chrome.storage.local.get).to.have.been.calledOnce.and.to.have.been.calledWith('refresh_token');
            expect(chrome.storage.local.remove).to.have.been.calledTwice
                .and.to.have.been.calledWith('access_token')
                .and.to.have.been.calledWith('refresh_token');
        });
    });
});
