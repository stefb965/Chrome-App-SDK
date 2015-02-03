/*jshint expr: true*/
describe('box.http', function() {
    var mocks, boxHttp, observer, chromeStorage, momentStub, boxApiAuth, http, boxHttpResponseInterceptor, $q, apiUrl;
    var clientId = 'i3p-----------------------------',
        clientSecret = 'uII-----------------------------';
    beforeEach(function() {
        var provide;
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        angular.module('box.conf')
            .constant('clientSecret', clientSecret)
            .constant('clientId', clientId);
        module('box.http', 'rx.http', 'box.auth', 'chrome.storage', 'moment', function($provide) {
            provide = $provide;
        });
        inject(function(_http_, _chromeStorage_, _boxApiAuth_, _$q_) {
            http = mocks.stub(_http_);
            provide.value('http', http);
            chromeStorage = mocks.stub(_chromeStorage_);
            provide.value('chromeStorage', chromeStorage);
            momentStub = mocks.stub();
            provide.value('moment', momentStub);
            boxApiAuth = mocks.stub(_boxApiAuth_);
            provide.value('boxApiAuth', boxApiAuth);
            $q = mocks.stub(_$q_);
            provide.value('$q', $q);
        });
    });
    beforeEach(inject(function(_boxHttp_, _boxHttpResponseInterceptor_, _apiUrl_) {
        boxHttp = _boxHttp_;
        boxHttpResponseInterceptor = _boxHttpResponseInterceptor_;
        apiUrl = _apiUrl_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('auth()', function() {
        describe('missing or expired tokens', function() {
            it('should attempt login when tokens are missing', function() {
                var moment = {add: mocks.spy(), toDate: mocks.stub()};
                boxApiAuth.login.returns(Rx.Observable.return('code'));
                boxApiAuth.getToken.returns(Rx.Observable.return({
                    data: {
                        access_token: 'access_token',
                        refresh_token: 'refresh_token',
                        expires_in: 3600
                    }
                }));
                momentStub.returns(moment);
                moment.toDate.returns('date');
                chromeStorage.getLocal.withArgs('access_token').returns(Rx.Observable.return({}));
                chromeStorage.getLocal.withArgs('refresh_token').returns(Rx.Observable.return({}));
                chromeStorage.setLocal.returns(Rx.Observable.return({}));

                boxHttp.auth().subscribe(observer);

                expect(chromeStorage.getLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWithExactly('access_token')
                    .and.to.have.been.calledWithExactly('refresh_token');
                expect(boxApiAuth.login).to.have.been.calledOnce.and.to.have.been.calledWithExactly();
                expect(boxApiAuth.getToken).to.have.been.calledOnce.and.to.have.been.calledWithExactly('code');
                expect(momentStub).to.have.been.calledWithExactly();
                expect(momentStub.callCount).to.equal(4);
                expect(moment.add)
                    .and.to.have.been.calledWithExactly('seconds', 3600)
                    .and.to.have.been.calledWithExactly('days', 60);
                expect(moment.add.callCount).to.equal(4);
                expect(moment.toDate).to.have.been.calledWithExactly();
                expect(moment.toDate.callCount).to.equal(4);
                expect(chromeStorage.setLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWithExactly({
                        refresh_token: {
                            token: 'refresh_token',
                            expires_at: 'date'
                        },
                        access_token: {
                            token: 'access_token',
                            expires_at: 'date'
                        }
                    });
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('access_token');
            });

            it('should attempt login when refresh token is expired', function() {
                var moment = {add: mocks.spy(), toDate: mocks.stub(), isAfter: mocks.stub()};
                var yesterdayMoment = mocks.spy(), tomorrowMoment = mocks.spy();
                boxApiAuth.login.returns(Rx.Observable.return('code'));
                boxApiAuth.getToken.returns(Rx.Observable.return({
                    data: {
                        access_token: 'access_token',
                        refresh_token: 'refresh_token',
                        expires_in: 3600
                    }
                }));
                momentStub.withArgs('yesterday').returns(yesterdayMoment);
                momentStub.withArgs('tomorrow').returns(tomorrowMoment);
                momentStub.returns(moment);
                moment.toDate.returns('date');
                moment.isAfter
                    .withArgs(yesterdayMoment).returns(true)
                    .withArgs(tomorrowMoment).returns(true);
                chromeStorage.getLocal.withArgs('access_token').returns(Rx.Observable.return({
                    token: 'access_token',
                    expires_at: 'yesterday'
                }));
                chromeStorage.getLocal.withArgs('refresh_token').returns(Rx.Observable.return({
                    token: 'refresh_token',
                    expires_at: 'tomorrow'
                }));
                chromeStorage.setLocal.returns(Rx.Observable.return({}));

                boxHttp.auth().subscribe(observer);

                expect(chromeStorage.getLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWithExactly('access_token')
                    .and.to.have.been.calledWithExactly('refresh_token');
                expect(boxApiAuth.login).to.have.been.calledOnce.and.to.have.been.calledWithExactly();
                expect(boxApiAuth.getToken).to.have.been.calledOnce.and.to.have.been.calledWithExactly('code');
                expect(momentStub).to.have.been.calledWithExactly();
                expect(momentStub).to.have.been.calledWithExactly('yesterday');
                expect(momentStub).to.have.been.calledWithExactly('tomorrow');
                expect(momentStub.callCount).to.equal(8);
                expect(moment.add)
                    .and.to.have.been.calledWithExactly('seconds', 3600)
                    .and.to.have.been.calledWithExactly('days', 60);
                expect(moment.add.callCount).to.equal(4);
                expect(moment.toDate).to.have.been.calledWithExactly();
                expect(moment.toDate.callCount).to.equal(4);
                expect(moment.isAfter).to.have.been.calledWithExactly(yesterdayMoment);
                expect(moment.isAfter).to.have.been.calledWithExactly(tomorrowMoment);
                expect(moment.isAfter.callCount).to.equal(2);
                expect(chromeStorage.setLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWithExactly({
                        refresh_token: {
                            token: 'refresh_token',
                            expires_at: 'date'
                        },
                        access_token: {
                            token: 'access_token',
                            expires_at: 'date'
                        }
                    });
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('access_token');
            });

            it('should attempt refresh when access token is expired', function() {
                var moment = {add: mocks.spy(), toDate: mocks.stub(), isAfter: mocks.stub()};
                var yesterdayMoment = mocks.spy(), tomorrowMoment = mocks.spy();
                boxApiAuth.refreshToken.returns(Rx.Observable.return({
                    data: {
                        access_token: 'new_access_token',
                        refresh_token: 'new_refresh_token',
                        expires_in: 3600
                    }
                }));
                momentStub.withArgs('yesterday').returns(yesterdayMoment);
                momentStub.returns(moment);
                moment.toDate.returns('date');
                moment.isAfter
                    .withArgs(yesterdayMoment).returns(true)
                    .withArgs(tomorrowMoment).returns(false);
                chromeStorage.getLocal.withArgs('access_token').returns(Rx.Observable.return({
                    token: 'access_token',
                    expires_at: 'yesterday'
                }));
                chromeStorage.getLocal.withArgs('refresh_token').returns(Rx.Observable.return({
                    token: 'refresh_token',
                    expires_at: 'tomorrow'
                }));
                chromeStorage.setLocal.returns(Rx.Observable.return({}));

                boxHttp.auth().subscribe(observer);

                expect(chromeStorage.getLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWithExactly('access_token')
                    .and.to.have.been.calledWithExactly('refresh_token');
                expect(boxApiAuth.refreshToken).to.have.been.calledOnce.and.to.have.been.calledWithExactly('refresh_token');
                expect(momentStub).to.have.been.calledWithExactly();
                expect(momentStub).to.have.been.calledWithExactly('yesterday');
                expect(momentStub).to.have.been.calledWithExactly('tomorrow');
                expect(momentStub.callCount).to.equal(6);
                expect(moment.add)
                    .and.to.have.been.calledWithExactly('seconds', 3600)
                    .and.to.have.been.calledWithExactly('days', 60);
                expect(moment.add.callCount).to.equal(2);
                expect(moment.toDate).to.have.been.calledWithExactly();
                expect(moment.toDate.callCount).to.equal(2);
                expect(moment.isAfter).to.have.been.calledWithExactly(yesterdayMoment);
                expect(moment.isAfter.callCount).to.equal(2);
                expect(chromeStorage.setLocal).to.have.been.calledOnce
                    .and.to.have.been.calledWithExactly({
                        refresh_token: {
                            token: 'new_refresh_token',
                            expires_at: 'date'
                        },
                        access_token: {
                            token: 'new_access_token',
                            expires_at: 'date'
                        }
                    });
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('new_access_token');
            });

            it('should return an error if login is required but noLogin is specified', function() {
                var moment = {add: mocks.spy(), toDate: mocks.stub(), isAfter: mocks.stub()};
                var yesterdayMoment = mocks.spy(), tomorrowMoment = mocks.spy();
                var errObserver = mocks.spy(), completedObserver = mocks.spy();
                momentStub.withArgs('yesterday').returns(yesterdayMoment);
                momentStub.withArgs('tomorrow').returns(tomorrowMoment);
                momentStub.returns(moment);
                moment.toDate.returns('date');
                moment.isAfter
                    .withArgs(yesterdayMoment).returns(true)
                    .withArgs(tomorrowMoment).returns(true);
                chromeStorage.getLocal.withArgs('access_token').returns(Rx.Observable.return({
                    token: 'access_token',
                    expires_at: 'yesterday'
                }));
                chromeStorage.getLocal.withArgs('refresh_token').returns(Rx.Observable.return({
                    token: 'refresh_token',
                    expires_at: 'tomorrow'
                }));

                boxHttp.auth(true).subscribe(observer, errObserver, completedObserver);

                expect(chromeStorage.getLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWithExactly('access_token')
                    .and.to.have.been.calledWithExactly('refresh_token');
                expect(boxApiAuth.login).to.not.have.been.called;
                expect(boxApiAuth.getToken).to.not.have.been.called;
                expect(momentStub).to.have.been.calledWithExactly();
                expect(momentStub).to.have.been.calledWithExactly('yesterday');
                expect(momentStub).to.have.been.calledWithExactly('tomorrow');
                expect(momentStub.callCount).to.equal(4);
                expect(moment.isAfter).to.have.been.calledWithExactly(yesterdayMoment);
                expect(moment.isAfter).to.have.been.calledWithExactly(tomorrowMoment);
                expect(moment.isAfter.callCount).to.equal(2);
                expect(observer).to.not.have.been.called;
                expect(completedObserver).to.not.have.been.called;
                expect(errObserver).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new Error('Not logged in!'));
            });

            it('should attempt login if refresh fails', function() {
                var moment = {add: mocks.spy(), toDate: mocks.stub(), isAfter: mocks.stub()};
                var yesterdayMoment = mocks.spy(), tomorrowMoment = mocks.spy();
                boxApiAuth.refreshToken.returns(Rx.Observable.throw(new Error('bad request')));
                boxApiAuth.login.returns(Rx.Observable.return('code'));
                boxApiAuth.getToken.returns(Rx.Observable.return({
                    data: {
                        access_token: 'access_token',
                        refresh_token: 'refresh_token',
                        expires_in: 3600
                    }
                }));
                momentStub.withArgs('yesterday').returns(yesterdayMoment);
                momentStub.withArgs('tomorrow').returns(tomorrowMoment);
                momentStub.returns(moment);
                moment.toDate.returns('date');
                moment.isAfter
                    .withArgs(yesterdayMoment).returns(true)
                    .withArgs(tomorrowMoment).returns(false);
                chromeStorage.getLocal.withArgs('access_token').returns(Rx.Observable.return({
                    token: 'access_token',
                    expires_at: 'yesterday'
                }));
                chromeStorage.getLocal.withArgs('refresh_token').returns(Rx.Observable.return({
                    token: 'refresh_token',
                    expires_at: 'tomorrow'
                }));
                chromeStorage.setLocal.returns(Rx.Observable.return({}));
                chromeStorage.removeLocal.returns(Rx.Observable.return({}));

                boxHttp.auth().subscribe(observer);

                expect(chromeStorage.getLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWithExactly('access_token')
                    .and.to.have.been.calledWithExactly('refresh_token');
                expect(boxApiAuth.refreshToken).to.have.been.calledOnce.and.to.have.been.calledWithExactly('refresh_token');
                expect(boxApiAuth.login).to.have.been.calledOnce.and.to.have.been.calledWithExactly();
                expect(boxApiAuth.getToken).to.have.been.calledOnce.and.to.have.been.calledWithExactly('code');
                expect(momentStub).to.have.been.calledWithExactly();
                expect(momentStub.callCount).to.equal(8);
                expect(moment.add)
                    .and.to.have.been.calledWithExactly('seconds', 3600)
                    .and.to.have.been.calledWithExactly('days', 60);
                expect(moment.add.callCount).to.equal(4);
                expect(moment.toDate).to.have.been.calledWithExactly();
                expect(moment.toDate.callCount).to.equal(4);
                expect(moment.isAfter).to.have.been.calledWithExactly(yesterdayMoment);
                expect(moment.isAfter).to.have.been.calledWithExactly(tomorrowMoment);
                expect(moment.isAfter.callCount).to.equal(2);
                expect(chromeStorage.setLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWithExactly({
                        refresh_token: {
                            token: 'refresh_token',
                            expires_at: 'date'
                        },
                        access_token: {
                            token: 'access_token',
                            expires_at: 'date'
                        }
                    });
                expect(chromeStorage.removeLocal).to.have.been.calledTwice
                    .and.to.have.been.calledWith('access_token')
                    .and.to.have.been.calledWith('refresh_token');
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('access_token');
            });
        });
        describe('happy path', function() {
            it('should return the stored access token if not expired', function() {
                var moment = {add: mocks.spy(), toDate: mocks.stub(), isAfter: mocks.stub()}, yesterdayMoment = mocks.spy();
                momentStub.withArgs('yesterday').returns(yesterdayMoment);
                momentStub.returns(moment);
                chromeStorage.getLocal.withArgs('access_token').returns(Rx.Observable.return({
                    token: 'access_token',
                    expires_at: 'yesterday'
                }));
                chromeStorage.setLocal.returns(Rx.Observable.return({}));
                moment.isAfter.withArgs(yesterdayMoment).returns(false);

                boxHttp.auth().subscribe(observer);

                expect(chromeStorage.getLocal).to.have.been.calledOnce.and.to.have.been.calledWithExactly('access_token');
                expect(momentStub).to.have.been.calledTwice.and.to.have.been.calledWithExactly().and.to.have.been.calledWithExactly('yesterday');
                expect(moment.isAfter).to.have.been.calledOnce.and.to.have.been.calledWithExactly(yesterdayMoment);
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('access_token');
            });
        });
    });

    describe('requests', function() {
        var moment, yesterdayMoment;
        beforeEach(function() {
            moment = {add: mocks.spy(), toDate: mocks.stub(), isAfter: mocks.stub()};
            yesterdayMoment = mocks.spy();
            momentStub.withArgs('yesterday').returns(yesterdayMoment);
            momentStub.returns(moment);
            chromeStorage.getLocal.withArgs('access_token').returns(Rx.Observable.return({
                token: 'access_token',
                expires_at: 'yesterday'
            }));
            chromeStorage.setLocal.returns(Rx.Observable.return({}));
            moment.isAfter.withArgs(yesterdayMoment).returns(false);
        });
        ['GET', 'POST', 'PUT', 'DELETE'].forEach(function(method) {
            it('should make authorized request for ' + method, function() {
                var url = 'https://example.com', config = {}, data = {};
                http.getObservable.returns(Rx.Observable.return({
                    data: 'data'
                }));

                boxHttp[method.toLowerCase()](url, config, data).subscribe(observer);

                expect(chromeStorage.getLocal).to.have.been.calledOnce.and.to.have.been.calledWithExactly('access_token');
                expect(momentStub).to.have.been.calledTwice.and.to.have.been.calledWithExactly().and.to.have.been.calledWithExactly('yesterday');
                expect(moment.isAfter).to.have.been.calledOnce.and.to.have.been.calledWithExactly(yesterdayMoment);
                expect(http.getObservable).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    method,
                    url,
                    {headers: {'Authorization': 'Bearer access_token'}},
                    data
                );
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('data');
            });
        });

        [202, 429].forEach(function(status) {
            it('should retry ' + status + ' responses', function(done) {
                var method = 'GET', url = 'https://example.com', config = {}, data = {}, delay = 0.001;
                http.getObservable.onFirstCall().returns(Rx.Observable.return({
                    status: status,
                    headers: {'Retry-After': delay}
                }));
                http.getObservable.returns(Rx.Observable.return({
                    data: 'data'
                }));

                boxHttp[method.toLowerCase()](url, config, data).do(observer).subscribe(function() {
                    expect(http.getObservable).to.have.been.calledTwice.and.to.have.been.calledWithExactly(
                        method,
                        url,
                        {headers: {'Authorization': 'Bearer access_token'}},
                        data
                    );
                    expect(chromeStorage.getLocal).to.have.been.calledTwice.and.to.have.been.calledWithExactly('access_token');
                    expect(momentStub).to.have.been.calledWithExactly().and.to.have.been.calledWithExactly('yesterday');
                    expect(momentStub.callCount).to.equal(4);
                    expect(moment.isAfter).to.have.been.calledTwice.and.to.have.been.calledWithExactly(yesterdayMoment);
                    expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('data');
                    done();
                });
            });
        });

        it('should try login for 401 responses', function() {
            var method = 'GET', url = 'https://example.com', config = {}, data = {};
            var moment = {add: mocks.spy(), toDate: mocks.stub(), isAfter: mocks.stub()};
            momentStub.returns(moment);
            moment.toDate.returns('date');
            http.getObservable.onFirstCall().returns(Rx.Observable.return({
                status: 401
            }));
            http.getObservable.returns(Rx.Observable.return({
                data: 'data'
            }));
            boxApiAuth.login.returns(Rx.Observable.return('code'));
            boxApiAuth.getToken.returns(Rx.Observable.return({
                data: {
                    access_token: 'access_token',
                    refresh_token: 'refresh_token',
                    expires_in: 3600
                }
            }));
            chromeStorage.setLocal.returns(Rx.Observable.return({}));

            boxHttp[method.toLowerCase()](url, config, data).do(observer).subscribe(function() {
                expect(http.getObservable).to.have.been.calledTwice.and.to.have.been.calledWithExactly(
                    method,
                    url,
                    {headers: {'Authorization': 'Bearer access_token'}},
                    data
                );
            });

            expect(chromeStorage.getLocal).to.have.been.calledOnce.and.to.have.been.calledWithExactly('access_token');
            expect(momentStub.callCount).to.equal(4);
            expect(moment.add)
                .and.to.have.been.calledWithExactly('seconds', 3600)
                .and.to.have.been.calledWithExactly('days', 60);
            expect(moment.add.callCount).to.equal(2);
            expect(moment.toDate).to.have.been.calledWithExactly();
            expect(moment.toDate.callCount).to.equal(2);
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('data');
        });
    });

    describe('boxHttpResponseInterceptor', function() {
        beforeEach(function() {
            $q.reject.returns('rejected');
        });
        [401, 429].forEach(function(status) {
            it('should recover from the error for ' + status, function() {
                var response = {
                    status: status,
                    config: {url: apiUrl + '/some/path'}
                };
                var intercepted = boxHttpResponseInterceptor.responseError(response);
                expect(intercepted).to.equal(response);
            });
        });
        [400, 403].forEach(function(status) {
            it('should reject the response for ' + status, function() {
                var response = {
                    status: status,
                    config: {url: apiUrl + '/some/path'}
                };
                var intercepted = boxHttpResponseInterceptor.responseError(response);
                expect(intercepted).to.equal('rejected');
            });
        });
    });
});
