/**
 * @fileoverview An Rx abstraction of Angular's $http service, with authorization for the Box API.
 * @author jmeadows
 */

var http = angular.module('box.http', ['rx', 'rx.http', 'box.conf', 'chrome.storage', 'crypto', 'moment']);

/**
 * Injects auth token header to http requests. Automatically retrieves new tokens.
 *
 * If we don't have an auth token, see if we have a refresh token and try to exchange for an auth token.
 * If we don't have a refresh token, we need to log in via oauth2.
 * If we do have an auth token that isn't expired, append it to all outgoing requests.
 * @param {Object} rx RxJS namespace object
 * @param {Object} chromeStorage Chrome storage service
 * @param {Object} http HTTP service
 * @param {Object} boxApiAuth Box auth service
 * @param {Object} moment Angular service for moment.js
 * @returns {Object} Box HTTP service
 */
http.factory('boxHttp', ['rx', 'chromeStorage', 'http', 'boxApiAuth', 'moment', function(rx, chromeStorage, http, boxApiAuth, moment) {
    function storeTokens(result) {
        var refreshMoment = moment(), accessMoment = moment();
        refreshMoment.add('days', 60);
        accessMoment.add('seconds', result.expires_in);
        chromeStorage.setLocal({
            /*eslint-disable camelcase*/
            refresh_token: {
                token: result.refresh_token,
                expires_at: refreshMoment.toDate().toString()
            },
            access_token: {
                token: result.access_token,
                expires_at: accessMoment.toDate().toString()
            }
            /*eslint-enable camelcase*/
        }).subscribe(angular.noop);
    }
    function ejectTokens() {
        chromeStorage.removeLocal('access_token')
            .concat(chromeStorage.removeLocal('refresh_token'))
            .subscribe(angular.noop);
    }
    function tryLogin() {
        return boxApiAuth.login()
            .flatMap(function(code) {
                return boxApiAuth.getToken(code);
            })
            .map(function(result) {
                return result.data;
            })
            .do(storeTokens);
    }
    function shouldRejectToken(data) {
        return !angular.isDefined(data) || !angular.isDefined(data.token) || !angular.isDefined(data.expires_at) || moment().isAfter(moment(data.expires_at));
    }
    function tryRefresh(noLogin) {
        return chromeStorage.getLocal('refresh_token')
            .flatMap(function(data) {
                function loginIfAllowed() {
                    if (noLogin) {
                        return rx.Observable.throw(new Error('Not logged in!'));
                    }
                    return tryLogin();
                }
                if (shouldRejectToken(data)) {
                    return loginIfAllowed();
                }
                return boxApiAuth.refreshToken(data.token)
                    .map(function(result) {
                        return result.data;
                    })
                    .onErrorResumeNext(rx.Observable.defer(loginIfAllowed).do(ejectTokens))
                    .take(1);
            })
            .do(storeTokens)
            .map(function(result) {
                return {
                    token: result.access_token
                };
            });
    }
    function tryGetAuthToken(noLogin) {
        return chromeStorage.getLocal('access_token')
            .flatMap(function(data) {
                if (shouldRejectToken(data)) {
                    return tryRefresh(noLogin);
                }
                return rx.Observable.return(data);
            })
            .map(function(data) {
                return data.token;
            });
    }
    function makeRequest(obs, method, url, config, data) {
        return obs
            .flatMap(function(token) {
                angular.extend(config.headers, {Authorization: 'Bearer ' + token});
                return http.getObservable(method, url, config, data);
            })
            .flatMap(function(response) {
                switch (response.status) {
                    case 401:  // Unauthorized - need to login again
                        return makeRequest(
                            tryLogin().map(function(data) {
                                return data.access_token;
                            }),
                            method, url, config, data
                        );
                    case 202:  // Download not ready yet - try it later
                    case 429:  // Too many requests - wait some time and then try again
                        return makeRequest(
                            rx.Observable.timer(parseInt(response.headers['Retry-After'], 10) * 1000)
                                .flatMap(function() {
                                    return tryGetAuthToken();
                                }),
                            method, url, config, data
                        );
                    default:
                        return rx.Observable.return(response.data);
                }
            });
    }
    function BoxHttp() {
    }
    function makeHelper(method) {
        return function() {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(method);
            return this.request.apply(this, args);
        };
    }
    BoxHttp.prototype = {
        request: function(method, url, config, data) {
            var subject = new rx.AsyncSubject();
            config = config || {};
            config.headers = config.headers || this.defaultHeaders;
            makeRequest(tryGetAuthToken(), method, url, config, data).subscribe(subject);
            return subject.asObservable();
        },
        get: makeHelper('GET'),
        post: makeHelper('POST'),
        put: makeHelper('PUT'),
        delete: makeHelper('DELETE'),
        options: makeHelper('OPTIONS'),
        auth: tryGetAuthToken,
        defaultHeaders: {}
    };
    BoxHttp.prototype.constructor = BoxHttp;
    return new BoxHttp();
}]);

http.factory('boxHttpResponseInterceptor',['$q', 'apiUrl', function($q, apiUrl){
    return {
        responseError: function(rejection) {
            try {
                if (rejection.config.url.indexOf(apiUrl) === 0 && (rejection.status === 401 || rejection.status === 429)) {
                    return rejection;
                }
            } catch(err) {
                return $q.reject(rejection);
            }
            return $q.reject(rejection);
        }
    };
}]);

http.config(['$httpProvider',function($httpProvider) {
    //Http Intercpetor to check auth failures for xhr requests
    $httpProvider.interceptors.push('boxHttpResponseInterceptor');
}]);
