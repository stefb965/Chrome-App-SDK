/**
 * @fileoverview An angular module and service providing OAuth2 access to the SDK.
 * @author jmeadows
 */

var auth = angular.module('box.auth', ['rx', 'box.conf', 'chrome.identity', 'crypto']);

auth.provider('boxApiAuth', [
    'authUrl', 'clientId', 'clientSecret', 'redirectUri',
    function(authUrl, clientId, clientSecret, redirectUri) {
        var webAuthParams = {
            url: authUrl + '/authorize?client_id=' + clientId + '&response_type=code&redirect_uri=' + redirectUri,
            interactive: true
        };
        var throwError;
        throwError = function() {
            throw new Error('unknown error extracting code');
        };
        function parseWebAuthResponseWithState(state) {

            return function parseWebAuthResponse(responseUrl) {
                if (responseUrl) {
                    var error = responseUrl.match(/[&\?]error=([^&]+)/);
                    if (error) {
                        throw new Error('Error extracting code');
                    }
                    var csrfState = responseUrl.match(/[&\?]state=([\w\/\-]+)/);
                    if (! csrfState || csrfState[1] !== state) {
                        throw new Error('Returned csrf token does not match the one sent!');
                    }
                    return responseUrl.match(/[&\?]code=([\w\/\-]+)/)[1];
                } else {
                    return throwError();
                }
            };
        }
        this.setThrowError = function(throwErrorFunc) {
            throwError = throwErrorFunc;
        };
        var refreshObservable = null;
        this.$get = ['rx', 'chromeIdentity', 'http', 'crypto', function(rx, chromeIdentity, http, crypto) {
            return {
                /**
                 * Present the user with a login form from Box, requesting their login and that they grant access to
                 * your application.
                 * @returns {Observable} An observable that will contain an authorization code if the user performs
                 * the login to Box successfully and grants access to your application.
                 */
                login: function() {
                    var randomArray = new Uint8Array(16);
                    crypto.getRandomValues(randomArray);
                    var state = 'box_csrf_token_' + Array.prototype.map.call(randomArray, function(i) {
                        var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                        return alphabet.charAt(i % alphabet.length);
                    }).join('');
                    var params = JSON.parse(JSON.stringify(webAuthParams));
                    params.url += '&state=' + state;
                    return chromeIdentity.login(params).map(parseWebAuthResponseWithState(state));
                },
                /**
                 * Exchange an authorization code for an authorization token.
                 * @param {String} code An authorization code returned from @see login
                 * @returns {Observable} An observable that will contain the HTTP result from the request
                 * to url https://www.box.com/api/oauth2 containing an authorization token and a refresh token.
                 */
                getToken: function(code) {
                    return http.request(
                        'POST',
                        authUrl + '/token',
                        null,
                        {
                            /*eslint-disable camelcase*/
                            grant_type: 'authorization_code',
                            code: code,
                            client_id: clientId,
                            client_secret: clientSecret,
                            redirect_uri: redirectUri
                            /*eslint-enable camelcase*/
                        }
                    );
                },
                /**
                 * Exchange a refresh token for a new authorization token.
                 * @param {String} refreshToken A refresh token returned from @see getToken or this function.
                 * @returns {Observable} An observable that will contain the HTTP result from the request
                 * to url https://www.box.com/api/oauth2 containing an authorization token and a refresh token.
                 */
                refreshToken: function(refreshToken) {
                    var subject = new rx.Subject();
                    if (refreshObservable === null) {
                        refreshObservable = http.request(
                            'POST',
                            authUrl + '/token',
                            null,
                            {
                                /*eslint-disable camelcase*/
                                grant_type: 'refresh_token',
                                refresh_token: refreshToken,
                                client_id: clientId,
                                client_secret: clientSecret,
                                redirect_uri: redirectUri
                                /*eslint-enable camelcase*/
                            }
                        )
                            .publish()
                            .refCount();
                        refreshObservable.subscribe(
                            angular.noop,
                            angular.noop,
                            function() {
                                refreshObservable = null;
                            }
                        );
                    }
                    refreshObservable.subscribe(subject);
                    return subject.asObservable();
                }
            };
        }];
    }]);
