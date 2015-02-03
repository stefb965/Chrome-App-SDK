/*jshint expr: true*/
describe('box.auth', function() {
    var http, chromeIdentity, mocks, observer, boxApiAuth, authUrl, redirectUri;
    var clientId = 'i3p-----------------------------',
        clientSecret = 'uII-----------------------------';
    beforeEach(function() {
        var provide;
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        angular.module('box.conf')
            .constant('clientSecret', clientSecret)
            .constant('clientId', clientId);
        module('box.objects', 'box.http', 'box.auth', 'chrome.identity', function($provide) {
            provide = $provide;
        });
        inject(function(_http_, _chromeIdentity_, crypto) {
            http = mocks.stub(_http_);
            provide.value('http', http);
            chromeIdentity = mocks.stub(_chromeIdentity_);
            provide.value('chromeIdentity', chromeIdentity);
            mocks.stub(crypto, 'getRandomValues', function(arr) {
                Array.prototype.fill.call(arr, 0);
            });
            provide.value('crypto', crypto);
        });
    });
    beforeEach(inject(function(_boxApiAuth_, _authUrl_, _redirectUri_) {
        authUrl = _authUrl_;
        boxApiAuth = _boxApiAuth_;
        redirectUri = _redirectUri_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('login()', function() {
        var code = 'authorizationcode', state = 'box_csrf_token_aaaaaaaaaaaaaaaa';
        beforeEach(function() {
            chromeIdentity.login.returns(Rx.Observable.return(redirectUri + '?code=' + code + '&state=' + state));
        });

        it('should call chromeIdentity.login', function() {
            boxApiAuth.login().subscribe(observer);

            expect(chromeIdentity.login).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                url: authUrl + '/authorize?client_id=' + clientId + '&response_type=code&redirect_uri=' + redirectUri + '&state=' + state,
                interactive: true
            });
        });

        it('should reject response with incorrect state', function() {
            chromeIdentity.login.returns(Rx.Observable.return(redirectUri + '?code=' + code + '&state=' + 'wrong_state'));

            var login = boxApiAuth.login();
            expect(login.subscribe.bind(login, observer)).to.throw(Error);

            expect(chromeIdentity.login).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                url: authUrl + '/authorize?client_id=' + clientId + '&response_type=code&redirect_uri=' + redirectUri + '&state=' + state,
                interactive: true
            });

            expect(observer).to.not.have.been.called;
        });

        it('should return authorization code', function() {
            boxApiAuth.login().subscribe(observer);

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(code);
        });
    });

    describe('getToken()', function() {
        var code = 'authorizationcode',
            token = 'T9cE5asGnuyYCCqIZFoWjFHvNbvVqHjl',
            expires_in = 3600;
        var response = {
            "access_token": token,
            "expires_in": expires_in,
            "restricted_to": [],
            "token_type": "bearer",
            "refresh_token": "J7rxTiWOHMoSC1isKZKBZWizoRXjkQzig5C6jFgCVJ9bUnsUfGMinKBDLZWP9BgR"
        };
        beforeEach(function() {
            http.request.returns(Rx.Observable.return(response));

            boxApiAuth.getToken(code).subscribe(observer);
        });

        it('should call http request', function() {
            expect(http.request).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                'POST',
                authUrl + '/token',
                null,
                {
                    grant_type: 'authorization_code',
                    code: code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri
                }
            );
        });

        it('should return authorization token and refresh token', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(response);
        });
    });

    describe('refreshToken()', function() {
        var refreshToken = 'J7rxTiWOHMoSC1isKZKBZWizoRXjkQzig5C6jFgCVJ9bUnsUfGMinKBDLZWP9BgR',
            token = 'T9cE5asGnuyYCCqIZFoWjFHvNbvVqHjl',
            expires_in = 3600;
        var response = {
            "access_token": token,
            "expires_in": expires_in,
            "restricted_to": [],
            "token_type": "bearer",
            "refresh_token": refreshToken
        };
        beforeEach(function() {
            http.request.returns(Rx.Observable.return(response).delay(1));
        });

        it('should call http request', function() {
            boxApiAuth.refreshToken(refreshToken).subscribe(observer);

            expect(http.request).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                'POST',
                authUrl + '/token',
                null,
                {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri
                }
            );
        });

        it('should return authorization token and refresh token', function(done) {
            boxApiAuth.refreshToken(refreshToken).do(observer).subscribe(function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(response);
                done();
            });
        });
    });

    //TODO: test api auth provider - change throw error and parse web response
});
