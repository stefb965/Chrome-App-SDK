(function() {
    /**
     * @fileoverview Chrome module and angular service.
     * @author jmeadows
     */
    
    angular.module('chrome', []).factory('chrome', function() {
        return window.chrome;
    });
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Chrome downloads module and angular service. @see https://developer.chrome.com/extensions/downloads
     * @author jmeadows
     */
    var downloads = angular.module('chrome.downloads', ['chrome', 'rx']);
    
    downloads.service('chromeDownloads', ['chrome', 'rx', function(chrome, rx) {
        /**
         * Download a file.
         * @param {Object} options Options specifying how to perform the download. See https://developer.chrome.com/extensions/downloads#method-download
         * @returns {Observable} An observable containing the id of the Chrome DownloadItem started by this call to download.
         */
        this.download = function(options) {
            return rx.Observable.fromChromeCallback(chrome.downloads.download, null, chrome.downloads)(options);
        };
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Chrome Identity module and angular service. @see See https://developer.chrome.com/apps/identity
     * @author jmeadows
     */
    var downloads = angular.module('chrome.identity', ['chrome', 'rx']);
    
    downloads.service('chromeIdentity', ['chrome', 'rx', function(chrome, rx) {
        /**
         * Download a file.
         * @param {Object} options Options for how to launch the web auth flow. See https://developer.chrome.com/apps/identity#method-launchWebAuthFlow
         * @returns {Observable} An observable containing the id of the Chrome DownloadItem started by this call to download.
         */
        this.login = function(options) {
            if (angular.isDefined(chrome.identity)) {
                return rx.Observable.fromChromeCallback(chrome.identity.launchWebAuthFlow, null, chrome.identity)(options);
            } else {
                return rx.Observable.fromChromeCallback(chrome.runtime.sendMessage, null, chrome.runtime)({
                    'function': 'identity.launchWebAuthFlow',
                    params: [options]
                });
            }
        };
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview chrome.storage An Rx abstraction of the
     * [chrome.storage API](https://developer.chrome.com/extensions/storage)
     * @author jmeadows
     */
    
    var storage = angular.module('chrome.storage', ['chrome', 'rx']);
    
    storage.service('chromeStorage', ['chrome', 'rx', function(chrome, rx) {
        /**
         * Gets an item from the Chrome local item store.
         * @param {String} name The name of the item to get from the local item store.
         * @returns {Observable} An observable containing the object from the local item store with the given name.
         */
        this.getLocal = function(name) {
            return rx.Observable.fromChromeCallback(chrome.storage.local.get, null, chrome.storage.local)(name)
                .map(function(result) {
                    return result[name];
                });
        };
        /**
         * Sets an item in the Chrome local item store.
         * @param {Object} value The items to save in the local item store.
         * @returns {Observable} An observable containing a boolean value indicating whether the storage was successful.
         */
        this.setLocal = function(value) {
            return rx.Observable.fromChromeCallback(chrome.storage.local.set, null, chrome.storage.local)(value);
        };
        /**
         * Removes an item from the Chrome local item store.
         * @param {String} name The name of the item to get from the local item store.
         * @returns {Observable} An observable containing a boolean value indicating whether the removal was successful.
         */
        this.removeLocal = function(name) {
            return rx.Observable.fromChromeCallback(chrome.storage.local.remove, null, chrome.storage.local)(name);
        };
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Module and angular service wrapping window.crypto.
     * @author jmeadows
     */
    
    angular.module('crypto', ['rx']).factory('crypto', ['rx', function(rx) {
        return {
            'getRandomValues': function(arr) {
                return window.crypto.getRandomValues(arr);
            },
            'digest': function(algorithm, content) {
                return rx.Observable.fromPromise(window.crypto.subtle.digest(algorithm, content));
            }
        };
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Module and angular service wrapping json.patch.
     * @author jmeadows
     */
    
    angular.module('json.patch', []).factory('jsonpatch', function() {
        return window.jsonpatch;
    });
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Module and angular service wrapping momentJs.
     * @author jmeadows
     */
    
    angular.module('moment', []).factory('moment', function() {
        return window.moment;
    });
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Extensions to RxJS for working with Chrome callbacks and events.
     * @author jmeadows
     */
    
    /**
     * Converts a chrome.* API function that takes a callback to an observable sequence, raising an error if
     * chrome.runtime.lastError is set.
     *
     * @param {Function} func Function with a callback as the last parameter to convert to an Observable sequence.
     * @param {Scheduler} [scheduler] Scheduler to run the function on. If not specified, defaults to Scheduler.timeout.
     * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
     * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
     * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
     */
    Rx.Observable.fromChromeCallback = function (func, scheduler, context, selector) {
        if (!scheduler) {
            scheduler = Rx.Scheduler.immediate;
        }
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);
    
            return new Rx.AnonymousObservable(function (observer) {
                return scheduler.schedule(function () {
                    function handler(e) {
                        if (chrome.runtime.lastError) {
                            observer.onError(chrome.runtime.lastError.message);
                            observer.onCompleted();
                        }
                        var results = e || [undefined];
    
                        if (selector) {
                            try {
                                results = selector(arguments);
                            } catch (err) {
                                observer.onError(err);
                                return;
                            }
                        } else {
                            if (results.length === 1) {
                                results = results[0];
                            }
                        }
    
                        observer.onNext(results);
                        observer.onCompleted();
                    }
    
                    args.push(handler);
                    func.apply(context, args);
                });
            });
        };
    };
    
    /**
     * Creates an observable sequence from an chrome.event.
     * @param {Function} event The function to add a handler to the emitter.
     * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
     * @returns {Observable} An observable sequence which wraps an event from an event emitter
     */
    Rx.Observable.fromChromeEvent = function(event, selector) {
        return Rx.Observable.fromEventPattern(
            function(handler) {
                event.addListener(handler);
            },
            function(handler) {
                event.removeListener(handler);
            },
            selector
        );
    };
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview An Rx abstraction of Angular's $http service.
     * @author jmeadows
     */
    
    var rxHttp = angular.module('rx.http', ['rx']);
    
    rxHttp.factory('http', ['$http', 'rx', function($http, rx) {
        /**
         * Creates a FormData object for sending a request that contains a file.
         * @param {Object} data An object containing key-value pairs to be sent with the request.
         * @returns {FormData} An object that can be sent as a multipart form request.
         */
        function makeFormData(data) {
            var form = new FormData();
            for (var param in data) {
                if (data.hasOwnProperty(param) && angular.isDefined(data[param])) {
                    var value = data[param];
                    // This param is a file - the first element is the file object and the second is the filename
                    if (Array.isArray(value)) {
                        value.unshift(param);
                        form.append.apply(form, value);
                    } else {
                        form.append(param, value);
                    }
                }
            }
            return form;
        }
    
        /**
         * Turns an Angular promise from the $http service into an Rx observable.
         * @param {String} method The HTTP verb to use in making the request.
         * @param {String} url The URL for the request.
         * @param {Object} config Configuration object for how the request should be sent.
         * @param {Object} data Data to be sent with the request.
         * @returns {Observable} An observable containing the result of the HTTP request.
         */
        function getObservable(method, url, config, data) {
            config = config || {};
            config.headers = config.headers || {};
            return rx.Observable.fromPromise(
                $http(angular.extend(
                    config,
                    {
                        url: url,
                        method: method
                    },
                    data ? {
                        data: makeFormData(data),
                        transformRequest: angular.identity,
                        headers: angular.extend(config.headers, {'Content-Type': undefined})
                    } : {}
                )));
        }
    
        /**
         * Make an HTTP request.
         * @param {String} method The HTTP verb to use in making the request.
         * @param {String} url The URL for the request.
         * @param {Object} config Configuration object for how the request should be sent.
         * @param {Object} data Data to be sent with the request.
         * @returns {Observable} An observable containing the result of the HTTP request.
         */
        function request(method, url, config, data) {
            var observable = getObservable(method, url, config, data),
                subject = new rx.AsyncSubject();
            observable.subscribe(subject);
            return subject.asObservable();
        }
        return {
            getObservable: getObservable,
            request: request
        };
    }]);
    
})();
//----------------------------
(function() {
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
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Configuration information for the SDK.
     * @author jmeadows
     */
    
    var conf = angular.module('box.conf', []);
    
    //conf.constant('clientSecret', 'uII-----------------------------');
    //conf.constant('clientId', 'i3p-----------------------------');
    
    var runtime = chrome.runtime || {};
    var runtimeId = runtime.id;
    conf.constant('authUrl', 'https://www.box.com/api/oauth2');
    conf.constant('redirectUri', 'https://' + runtimeId + '.chromiumapp.org/provider_cb');
    conf.constant('apiUrl', 'https://api.box.com/2.0');
    conf.constant('uploadUrl', 'https://upload.box.com/api/2.0');
    
})();
//----------------------------
(function() {
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
    
})();
//----------------------------
(function() {
    /**
     * @namespace box
     */
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box SDK public interface.
     * @author jmeadows
     */
    
    var sdk = angular.module('box.sdk', ['rx', 'chrome.storage', 'box.auth', 'box.conf', 'box.http', 'box.objects', 'box.util']);
    
    sdk.factory('boxSdk', [
        '$timeout',
        'rx',
        'boxHttp',
        'apiUrl',
        'authUrl',
        'crypto',
        'BoxCollaboration',
        'BoxFile',
        'BoxFolder',
        'BoxTask',
        'BoxUser',
        'BoxGroup',
        'getAll',
        'clientId',
        'clientSecret',
        'chromeStorage',
        'BoxComment',
        'http',
        'boxObjectBase',
        'responseTranslator',
        'BoxEvent',
        function(
            $timeout,
            rx,
            boxHttp,
            apiUrl,
            authUrl,
            crypto,
            BoxCollaboration,
            BoxFile,
            BoxFolder,
            BoxTask,
            BoxUser,
            BoxGroup,
            getAll,
            clientId,
            clientSecret,
            chromeStorage,
            BoxComment,
            http,
            boxObjectBase,
            responseTranslator,
            BoxEvent
            ) {
            function Sdk() {
                this.boxHttp = boxHttp;
            }
            Sdk.prototype = angular.extend(Object.create(boxObjectBase), {
                /**
                 * Logs out from Box, revoking the current API auth and refresh tokens.
                 * @returns {Observable} An observable containing the result of the API request.
                 */
                logout: function() {
                    return chromeStorage.getLocal('refresh_token')
                        .flatMap(function(data) {
                            return chromeStorage.removeLocal('access_token')
                                .concat(chromeStorage.removeLocal('refresh_token'))
                                .concat(http.request(
                                    'POST',
                                    authUrl + '/revoke',
                                    null,
                                    {
                                        /*eslint-disable camelcase*/
                                        client_id: clientId,
                                        client_secret: clientSecret,
                                        /*eslint-enable camelcase*/
                                        token: data.token
                                    }
                                ));
                        })
                        .takeLast(1);
                },
                /**
                 * Get the folder object with a given id.
                 * @param {String} id The Box folder id identifying the requested folder
                 * @returns {Observable} An observable containing the requested folder object.
                 */
                getFolder: function(id) {
                    return this.boxHttp.get(apiUrl + '/folders/' + id).map(function(result) {
                        return new BoxFolder(result);
                    });
                },
                /**
                 * Get the file object with a given id.
                 * @param {String} id The Box file id identifying the requested file
                 * @returns {Observable} An observable containing the requested file object.
                 */
                getFile: function(id) {
                    return this.boxHttp.get(apiUrl + '/files/' + id).map(function(result) {
                        return new BoxFile(result);
                    });
                },
                /**
                 * Get the folder object with a given id from the trash.
                 * @param {String} id The Box folder id identifying the requested trashed folder
                 * @returns {Observable} An observable containing the requested trashed folder object.
                 */
                getTrashedFolder: function(id) {
                    return this.boxHttp.get(apiUrl + '/folders/' + id + '/trash').map(function(result) {
                        return new BoxFolder(result);
                    });
                },
                /**
                 * Get the file object with a given id from the trash.
                 * @param {String} id The Box file id identifying the requested trashed file
                 * @returns {Observable} An observable containing the requested trashed file object.
                 */
                getTrashedFile: function(id) {
                    return this.boxHttp.get(apiUrl + '/files/' + id + '/trash').map(function(result) {
                        return new BoxFile(result);
                    });
                },
                /**
                 * Get a list of all items in the trash.
                 * @param {String} fields A comma separated list of fields that should be returned for each trashed item
                 * @returns {Observable} An observable sequence of files and/or folders that are in the trash.
                 */
                getTrashedItems: function(fields) {
                    var boxHttp = this.boxHttp;
                    return getAll(
                        function(limit, offset) {
                            return boxHttp.get(apiUrl + '/folders/trash/items', {
                                fields: fields,
                                limit: limit,
                                offset: offset
                            });
                        },
                        responseTranslator.translateResponse
                    );
                },
                /**
                 * Get a list of all pending collaborations.
                 * @returns {Observable} An observable sequence of collaboration objects that are still pending.
                 */
                getPendingCollaborations: function() {
                    return this.boxHttp.get(apiUrl + '/collaborations?pending').flatMap(function(result) {
                        return rx.Observable.fromArray(result.entries.map(function(entry) {
                            return new BoxCollaboration(entry);
                        }));
                    });
                },
                /**
                 * Search Box for content. Read more here [http://developers.box.com/docs/#search].
                 * @param {String} query The string to search for
                 * @param {Object} params Specifies how the query will be executed.
                 * @returns {Observable} An observable sequence of files and folders.
                 */
                search: function(query, params) {
                    var boxHttp = this.boxHttp;
                    return getAll(
                        function(limit, offset) {
                            return boxHttp.get(apiUrl + '/search', {
                                params: angular.extend(params || {}, {query: query, limit: limit, offset: offset})
                            });
                        },
                        responseTranslator.translateResponse
                    );
                },
                /**
                 * Create a new task.
                 * @param {File|Object} item The file the task will be associated with.
                 * @param {Object} params Can include message (string) and/or due_at (timestamp).
                 * @returns {Observable} An observable containing the newly created Task.
                 */
                createTask: function(item, params) {
                    return this.boxHttp.post(apiUrl + '/tasks', null,
                            angular.extend(params, {
                                item: {
                                    type: 'file',
                                    id: item.id
                                },
                                action: 'review'
                            })
                        ).map(function(result) {
                            return new BoxTask(result);
                        });
                },
                /**
                 * Gets information about the logged-in user.
                 * @returns {Observable} An observable containing the User object for the logged-in user.
                 */
                getUserInfo: function() {
                    return this.boxHttp.get(apiUrl + '/users/me').map(function(result) {
                        return new BoxUser(result);
                    });
                },
                /**
                 * Gets all users in the current user's enterprise if the current user is an enterprise admin.
                 * @param {String} filter A string used to filter the results to only users starting with the filter in either the name or the login
                 * @returns {Observable} An observable stream of user objects in the current enterprise.
                 */
                getUsers: function(filter) {
                    var boxHttp = this.boxHttp;
                    return getAll(
                        function(limit, offset) {
                            return boxHttp.get(apiUrl + '/users', {
                                /*eslint-disable camelcase*/
                                params: { filter_term: filter, limit: limit, offset: offset}
                                /*eslint-enable camelcase*/
                            });
                        },
                        function(result) {
                            return new BoxUser(result);
                        }
                    );
                },
                /**
                 * Creates a new enterprise user if the current user is an enterprise admin.
                 * @param {Object} params A hash of properties for the user.  Must contain at least login and name.
                 * @returns {Observable} An observable containing the new user object.
                 */
                createUser: function(params) {
                    return this.boxHttp.post(apiUrl + '/users', null, params)
                        .map(function(result) {
                            return new BoxUser(result);
                        });
                },
                /**
                 * Get all of the groups for the logged-in user.
                 * @returns {Observable} An observable sequence of groups for the logged-in user.
                 */
                getGroups: function() {
                    return this.boxHttp.get(apiUrl + '/groups').flatMap(function(result) {
                        return rx.Observable.fromArray(result.entries.map(function(entry) {
                            return new BoxGroup(entry);
                        }));
                    });
                },
                /**
                 * Create a new group.
                 * @param {String} name The name for the new group
                 * @returns {Observable} An observable containing the newly created group.
                 */
                createGroup: function(name) {
                    return this.boxHttp.post(apiUrl + '/groups', null, {name: name})
                        .map(function(result) {
                            return new BoxGroup(result);
                        });
                },
                /**
                 * Subscribe to events for the current user.
                 * @param {String} streamPosition The stream position from which to start streaming events.
                 * @returns {Observable} An observable sequence of BoxEvent objects. Disposing of this sequence unsubscribes.
                 */
                subscribeToEvents: function(streamPosition) {
                    var boxHttp = this.boxHttp;
                    function subscribe(streamPosition) {
                        return boxHttp.options(apiUrl + '/events')
                            .flatMap(function(result) {
                                return boxHttp.get(result.entries[0].url + '&stream_position=' + streamPosition)
                                    .flatMap(function(response) {
                                        if (response.message === 'new_change') {
                                            var chunk = -1;
                                            return rx.Observable.while(
                                                function() {
                                                    return chunk !== 0;
                                                },
                                                rx.Observable.defer(function() {
                                                    return rx.Observable.return(streamPosition);
                                                })
                                                    .flatMap(function(position) {
                                                        return boxHttp.get(apiUrl + '/events?stream_position=' + position)
                                                            .do(function(result) {
                                                                chunk = result.chunk_size;
                                                                streamPosition = result.next_stream_position;
                                                            })
                                                            .flatMap(function(result) {
                                                                return rx.Observable.fromArray(result.entries)
                                                                    .map(function(entry) {
                                                                        return new BoxEvent(entry, result.next_stream_position);
                                                                    });
                                                            });
                                                    })
                                            );
                                        } else if (response.message === 'reconnect') {
                                            return rx.Observable.empty();
                                        } else {
                                            return rx.Observable.empty();
                                        }
                                    })
                                    .timeout(result.entries[0].retry_timeout * 1000, rx.Observable.defer(function() {
                                        return rx.Observable.empty();
                                    }))
                                    .map(function(result) {
                                        return {
                                            result: result,
                                            streamPosition: streamPosition
                                        };
                                    });
                            });
                    }
                    var obs = rx.Observable.return(streamPosition);
                    if (!angular.isDefined(streamPosition)) {
                        obs = boxHttp.get(apiUrl + '/events?stream_position=now')
                            .map(function(result) {
                                return result.next_stream_position;
                            });
                    }
                    var subject = new rx.ReplaySubject();
                    obs.subscribe(function(streamPosition) {
                        var currentStreamPosition = streamPosition;
                        function sub() {
                            subscribe(currentStreamPosition)
                                .do(function(result) {
                                    currentStreamPosition = result.streamPosition;
                                })
                                .subscribe(
                                function onNext(result) {
                                    subject.onNext(result.result);
                                },
                                function onError(error) {
                                    subject.onError(error);
                                },
                                function onCompleted() {
                                    $timeout(sub, 1);
                                }
                            );
                        }
                        sub();
                    });
                    return subject.asObservable();
                }
            });
            return new Sdk();
        }]);
    
    sdk.config(['boxApiAuthProvider', function(boxApiAuthProvider) {
        boxApiAuthProvider.setThrowError(function() {
            throw chrome.runtime.lastError;
        });
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Utility functions needed by the SDK.
     * @author jmeadows
     */
    
    var util = angular.module('box.util', ['rx']);
    
    util.provider('getAll', function() {
        var defaultLimit = 20;
        this.setDefaultLimit = function(limit) {
            defaultLimit = limit;
        };
        this.$get = ['rx', function(rx) {
            /**
             * For a paginated API, get all results.
             * @param {Function} observableFactory A function that can create a request given a limit and offset.
             * @param {Function} entryTranslator A function that can turn JSON responses into Box objects.
             * @returns {Observable} An observable sequence of results.
             */
            return function(observableFactory, entryTranslator) {
                var limit = defaultLimit, offset = 0, total = -1;
                return rx.Observable.while(
                    function() {
                        return total === -1 || total > offset;
                    },
                    rx.Observable.defer(function() {
                        return rx.Observable.return({
                            limit: limit,
                            offset: offset
                        });
                    })
                        .flatMap(function(params) {
                            return observableFactory(params.limit, params.offset)
                                .do(function(result) {
                                    offset += limit;
                                    total = result.total_count;
                                })
                                .flatMap(function(result) {
                                    return rx.Observable.fromArray(
                                        result.entries
                                            .map(entryTranslator)
                                            .filter(function(entry) {
                                                return entry !== null;
                                            })
                                    );
                                });
                        })
                );
            };
        }];
    });
    
    util.service('responseTranslator', [function() {
        var translators = [];
        this.registerTranslator = function(translator) {
            translators.push(translator);
        };
        this.translateResponse = function(response) {
            var objects = translators.map(function(translator) {
                return translator(response);
            }).filter(angular.identity);
            if (objects.length > 0) {
                return objects[0];
            } else {
                return response;
            }
        };
        this.registerDefaultTranslator = function(type, Constructor) {
            this.registerTranslator(function(response) {
                return response.type === type ? new Constructor(response) : null;
            });
        };
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview The base class for Box objects.
     * @author jmeadows
     */
    
    var objects = angular.module('box.objects', ['rx', 'box.conf', 'box.http', 'box.util', 'chrome.downloads']);
    
    objects.factory('boxObjectBase',
        ['apiUrl', 'boxHttp', function(apiUrl, boxHttp) {
            function BoxHttpProxy(user) {
                var defaultHeaders = Object.create(this.defaultHeaders || {});
                this.defaultHeaders = angular.extend(defaultHeaders, {
                    'As-User': user.id
                });
            }
            var Constructor = Object.getPrototypeOf(boxHttp).constructor;
            BoxHttpProxy.prototype = Object.create(new Constructor());
        return {
            url: function() {
                return apiUrl + '/' + this.urlType + '/' + this.id;
            },
            /**
             * Allows enterprise administrators to make API calls for their managed users.
             * @param {BoxUser} user The user that operations should be made as
             * @returns {Object} A new instance of the same type as this box object, on which operations will be performed as the specified user.
             */
            asUser: function(user) {
                var constructor = this.constructor, args = [];
                function BoxObjectAsUser() {
                    constructor.apply(this, args);
                }
                BoxObjectAsUser.prototype = Object.create(constructor.prototype);
                for (var i = 0; i < constructor.length - 1; i++) {
                    args.push(null);
                }
                args.push(this);
                var boxObjectAsUser = new BoxObjectAsUser();
                boxObjectAsUser.boxHttp = new BoxHttpProxy(user);
                return boxObjectAsUser;
            }
        };
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Collaboration object. @see http://developers.box.com/docs/#collaborations
     * @author jmeadows
     */
    
    /**
     * @module BoxCollaboration
     */
    
    angular.module('box.objects').factory('BoxCollaboration', ['boxHttp', 'boxObjectBase', 'responseTranslator', function(boxHttp, boxObjectBase, responseTranslator) {
        /**
         * Box Collaboration object, representing an access control list.
         * [Learn more](http://developers.box.com/docs/#collaborations).
         * @param {Object} json Information about the collaboration from an API request.
         * @constructor
         */
        function Collaboration(json) {
            angular.extend(this, json);
            this.boxHttp = boxHttp;
        }
        Collaboration.prototype = angular.extend(Object.create(boxObjectBase), {
            urlType: 'collaborations',
            /**
             * Edit the collaboration, changing its [role](https://support.box.com/entries/20366031-what-are-the-different-collaboration-permissions-and-what-access-do-they-provide)
             * or whether or not the collaboration has been accepted.
             * @param {String} role The new role for the collaboration.
             * @param {Boolean} [status] The new status for the collaboration.
             * @returns {Observable} An observable containing a new, updated collaboration object.
             */
            edit: function(role, status) {
                return this.boxHttp.put(this.url(), {
                    role: role,
                    status: status
                }).map(function(result) {
                    return new Collaboration(result);
                });
            },
            /**
             * Delete the collaboration.
             * @returns {Observable} An observable containing the Box API response for this request.
             */
            delete: function() {
                return this.boxHttp.delete(this.url());
            },
            /**
             * Get information about the collaboration.
             * @returns {Observable} An observable containing a new collaboration object with this collaboration's
             * full information.
             */
            getInfo: function() {
                return this.boxHttp.get(this.url()).map(function(result) {
                    return new Collaboration(result);
                });
            }
        });
        Collaboration.prototype.constructor = Collaboration;
        responseTranslator.registerDefaultTranslator('collaboration', Collaboration);
        return Collaboration;
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Comment object. @see http://developers.box.com/docs/#comments
     * @author jmeadows
     */
    
    /**
     * @module BoxComment
     */
    
    angular.module('box.objects').factory('BoxComment', ['boxHttp', 'boxObjectBase', 'responseTranslator', function(boxHttp, boxObjectBase, responseTranslator) {
        /**
         * Represents a message from a Box user about a Box file.
         * @param {Object} json Information about the comment from an API request.
         * @constructor
         */
        function Comment(json) {
            angular.extend(this, json);
            this.boxHttp = boxHttp;
        }
        Comment.prototype = angular.extend(Object.create(boxObjectBase), {
            urlType: 'comments',
            /**
             * Updates the comment's message.
             * @param {String} message The new message that should be in the comment
             * @returns {Observable} An observable containing the updated comment.
             */
            updateMessage: function(message) {
                return this.boxHttp.put(this.url(), null, {
                    message: message
                }).map(function(result) {
                    return new Comment(result);
                });
            },
            /**
             * Get information about the comment.
             * @returns {Observable} An observable containing a new comment object with this comment's
             * full information.
             */
            getInfo: function() {
                return this.boxHttp.get(this.url()).map(function(result) {
                    return new Comment(result);
                });
            },
            /**
             * Delete the comment.
             * @returns {Observable} An observable containing the Box API response for this request.
             */
            delete: function() {
                return this.boxHttp.delete(this.url());
            }
        });
        Comment.prototype.constructor = Comment;
        responseTranslator.registerDefaultTranslator('comment', Comment);
        return Comment;
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Event object. @see http://developers.box.com/docs/#events
     * @author jmeadows
     */
    
    /**
     * @module BoxEvent
     */
    
    angular.module('box.objects').factory('BoxEvent', ['boxHttp', 'boxObjectBase', 'responseTranslator', function(boxHttp, boxObjectBase, responseTranslator) {
        /**
         * Represents an event - something happening in a Box account.
         * @param {Object} json Information about the event.
         * @param {String} streamPosition Indicates a moment in time near where this event occurred.
         * @constructor
         */
        function Event(json, streamPosition) {
            angular.extend(this, json);
            this.streamPosition = streamPosition;
            if (angular.isDefined(this.source)) {
                this.source = responseTranslator.translateResponse(this.source);
            }
        }
        Event.prototype = angular.extend(Object.create(boxObjectBase), {
        });
        Event.prototype.constructor = Event;
        return Event;
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box File object. @see http://developers.box.com/docs/#files
     * @author jmeadows
     */
    
    /**
     * @module BoxFile
     */
    
    angular.module('box.objects').factory('BoxFile', [
        'rx', 'crypto', 'chromeDownloads', 'apiUrl', 'uploadUrl', 'boxHttp', 'boxItem', 'BoxFileVersion', 'BoxComment', 'BoxTask', 'BoxMetadata', 'responseTranslator',
        function(rx, crypto, chromeDownloads, apiUrl, uploadUrl, boxHttp, boxItem, BoxFileVersion, BoxComment, BoxTask, BoxMetadata, responseTranslator) {
            /**
             * An individual file on Box. For more information, see [http://developers.box.com/docs/#files](File Object).
             * @param {Object} json Information about the file from an API request.
             * @constructor
             */
            function File(json) {
                angular.extend(this, json);
                this.boxHttp = boxHttp;
            }
            File.prototype = angular.extend(Object.create(boxItem), {
                urlType: 'files',
                /**
                 * Download the file.
                 * @param {Object} params Can contain a version (Integer) value specifying which version to download
                 * @returns {Observable} An observable containing the integer ID identifying the download
                 */
                download: function(params) {
                    var url = this.url() + '/content';
                    if (params && params.version) {
                        url += '?version=' + params.version;
                    }
                    return this.boxHttp.auth().flatMap(function(token) {
                        return chromeDownloads.download({
                            url: url,
                            headers: [{'Authorization': 'Bearer ' + token}]
                        });
                    });
                },
                /**
                 * Get the content of the file.
                 * @param {Object} params Parameters related to file download. See https://developers.box.com/docs/#files-download-a-file
                 * @returns {Observable} An observable containing the file content.
                 */
                getContent: function(params) {
                    return this.boxHttp.get(this.url() + '/content', {
                        params: params,
                        responseType: 'blob'
                    });
                },
                /**
                 * Upload a new version of the file.
                 * @param {string} name The name of the file
                 * @param {ArrayBuffer|Blob} content The file content to upload
                 * @param {String} mtime Timestamp that will be assigned to the file's modified_at property
                 * @param {Boolean} ifMatch Whether or not to send an If-Match header with the request
                 * @returns {Observable} An observable containing the new file object.
                 */
                replace: function(name, content, mtime, ifMatch) {
                    var boxHttp = this.boxHttp, etag = this.etag, fileId = this.id;
                    return crypto.digest('SHA-1', content).map(function(sha1) {
                        return Array.prototype.map.call(new Uint8Array(sha1), function(i) {
                            return ('0' + i.toString(16)).slice(-2);
                        }).join('');
                    }).flatMap(function(sha1) {
                        return boxHttp.post(uploadUrl + '/files/' + fileId + '/content',
                            {
                                headers: angular.extend(
                                    {'Content-MD5': sha1},
                                    ifMatch ? {'If-Match': etag} : {}
                                )
                            },
                            {
                                filename: [new Blob([content]), name],
                                /*eslint-disable camelcase*/
                                content_modified_at: mtime
                                /*eslint-enable camelcase*/
                            }
                        ).map(function(result) {
                            return new File(result.entries[0]);
                        });
                    });
                },
                /**
                 * Get a list of file versions for the file.
                 * @returns {Observable} An observable sequence of file version objects for the file.
                 */
                getHistory: function() {
                    var that = this;
                    return this.boxHttp.get(this.url() + '/versions').flatMap(function(result) {
                        return rx.Observable.fromArray(result.entries.map(function(entry) {
                            return new BoxFileVersion(that, entry);
                        }));
                    });
                },
                /**
                 * Get image data for the file's thumbnail.
                 * @param {String} extension The file extension to retrieve.  Can be png, gif, or jpg.
                 * @param {Object} params Parameters specifying the thumbnail's dimensions.
                 * @returns {Observable} An observable containing the thumbnail image data as a Blob.
                 */
                getThumbnail: function(extension, params) {
                    return this.boxHttp.get(this.url() + '/thumbnail.' + extension,
                        {
                            responseType: 'blob',
                            params: params
                        }
                    );
                },
                /**
                 * Get a list of comments for the file.
                 * @returns {Observable} An observable sequence of comment objects for the file.
                 */
                getComments: function() {
                    return this.boxHttp.get(this.url() + '/comments')
                        .flatMap(function(result) {
                            return rx.Observable.fromArray(result.entries.map(function(entry) {
                                return new BoxComment(entry);
                            }));
                        });
                },
                /**
                 * Get a list of tasks for the file.
                 * @returns {Observable} An observable sequence of task objects for the file.
                 */
                getTasks: function() {
                    return this.boxHttp.get(this.url() + '/tasks')
                        .flatMap(function(result) {
                            return rx.Observable.fromArray(result.entries.map(function(entry) {
                                return new BoxTask(entry);
                            }));
                        });
                },
                /**
                 * Get the file's associated metadata.
                 * @param {String} type Type of metadata. Must be properties.
                 * @returns {Observable} An observable containing the metadata object.
                 */
                getMetadata: function(type) {
                    var that = this;
                    return this.boxHttp.get(this.url() + '/metadata/' + type)
                        .map(function(result) {
                            return new BoxMetadata(that, result);
                        });
                },
                /**
                 * Create metadata associated with the file.
                 * @param {String} type Type of metadata to create. Must be properties.
                 * @param {Object} value Hash containing key-value pairs to be stored as metadata for the file
                 * @returns {Observable} An observable containing the created metadata object.
                 */
                createMetadata: function(type, value) {
                    var that = this;
                    return this.boxHttp.post(this.url() + '/metadata/' + type, null, value)
                        .map(function(result) {
                            return new BoxMetadata(that, result);
                        });
                }
            });
            File.prototype.constructor = File;
            responseTranslator.registerDefaultTranslator('file', File);
            return File;
        }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box File Version object. @see http://developers.box.com/docs/#files-view-versions-of-a-file
     * @author jmeadows
     */
    
    /**
     * @module BoxFileVersion
     */
    
    angular.module('box.objects').factory('BoxFileVersion', ['boxHttp', 'boxObjectBase', 'responseTranslator', function(boxHttp, boxObjectBase, responseTranslator) {
        /**
         * Represents a previous version of a Box file.
         * @param {File} file The Box file object this file version object is associated with
         * @param {Object} json Information about the file version from an API request.
         * @constructor
         */
        function FileVersion(file, json) {
            this.file = file;
            angular.extend(this, json);
            this.boxHttp = boxHttp;
        }
        FileVersion.prototype = angular.extend(Object.create(boxObjectBase), {
            url: function() {
                return this.file.url() + '/versions';
            },
            /**
             * Promotes this version of the file to the current version.
             * @returns {Observable} An observable containing a new file version object.
             */
            promoteToCurrent: function() {
                var file = this.file;
                return this.boxHttp.post(this.url() + '/current', null, {
                    type: 'file_version',
                    id: this.id
                }).map(function(result) {
                    return new FileVersion(file, result);
                });
            },
            /**
             * Delete the file version.
             * @returns {Observable} An observable containing the Box API response for this request.
             */
            delete: function() {
                return this.boxHttp.delete(this.url() + '/' + this.id);
            },
            /**
             * Download the file.
             * @returns {Observable} An observable containing the integer ID identifying the download.
             */
            download: function() {
                return this.file.download({version: this.id});
            }
        });
        FileVersion.prototype.constructor = FileVersion;
        responseTranslator.registerDefaultTranslator('file_version', FileVersion);
        return FileVersion;
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Folder object. @see http://developers.box.com/docs/#folders
     * @author jmeadows
     */
    
    /**
     * @module BoxFolder
     */
    
    angular.module('box.objects').factory('BoxFolder',
        ['rx', 'crypto', 'apiUrl', 'uploadUrl', 'boxHttp', 'boxItem', 'BoxCollaboration', 'BoxFile', 'getAll', 'responseTranslator',
            function(rx, crypto, apiUrl, uploadUrl, boxHttp, boxItem, BoxCollaboration, BoxFile, getAll, responseTranslator) {
                /**
                 * An individual folder on Box, containing other folders and/or files.
                 * @param {Object} json information about the folder from an API request
                 * @constructor
                 */
                function Folder(json) {
                    angular.extend(this, json);
                    this.boxHttp = boxHttp;
                }
                Folder.prototype = angular.extend(Object.create(boxItem), {
                    urlType: 'folders',
                    /**
                     * Get a folder's items.
                     * @param {String} fields Comma separated list of fields that should be returned about each item
                     * @returns {Observable} An observable sequence of the folder's items.
                     */
                    getItems: function(fields) {
                        var url = this.url(), boxHttp = this.boxHttp;
                        return getAll(
                            function(limit, offset) {
                                return boxHttp.get(url + '/items', {
                                    params: {
                                        fields: fields,
                                        offset: offset,
                                        limit: limit
                                    }
                                });
                            },
                            responseTranslator.translateResponse
                        );
                    },
                    /**
                     * Create a subfolder with the folder as its parent.
                     * @param {String} name The name of the new subfolder
                     * @returns {Observable} An observable containing the new folder object.
                     */
                    createSubfolder: function(name) {
                        return this.boxHttp.post(apiUrl + '/folders', null, {
                            name: name,
                            parent: {id: this.id}
                        }).map(function(result) {
                            return new Folder(result);
                        });
                    },
                    /**
                     * Get a list of collaborations on the folder.
                     * @returns {Observable} An observable sequence of the folder's collaborations.
                     */
                    getCollaborations: function() {
                        return this.boxHttp.get(this.url() + '/collaborations')
                            .flatMap(function(result) {
                                return rx.Observable.fromArray(result.entries.map(function(entry) {
                                    return new BoxCollaboration(entry);
                                }));
                            });
                    },
                    /**
                     * Invite a collaborator to a folder.
                     * @param {String} role The [role](https://support.box.com/entries/20366031-what-are-the-different-collaboration-permissions-and-what-access-do-they-provide) granted to the invited collaborator
                     * @param {User|Group|Object} collaborator The collaborator that will be invited to the folder.  Must have properties of type ("user" or "group"), and id or login (email address)
                     * @param {Boolean} notify whether or not the user should receive an email notification
                     * @returns {Observable} An observable containing the new collaboration object created by the request.
                     */
                    addCollaboration: function(role, collaborator, notify) {
                        return this.boxHttp.post(apiUrl + '/collaborations',
                            angular.isDefined(notify) ? {notify: notify} : null,
                            {
                                item: {
                                    type: this.type,
                                    id: this.id
                                },
                                /*eslint-disable camelcase*/
                                accessible_by: collaborator,
                                /*eslint-enable camelcase*/
                                role: role
                            }
                        ).map(function(result) {
                            return new BoxCollaboration(result);
                        });
                    },
                    /**
                     * Upload a file to the folder.
                     * @param {String} name The name of the file
                     * @param {ArrayBuffer|Blob} content The file content
                     * @param {Timestamp} ctime Timestamp the new file will have as its created at time
                     * @param {Timestamp} mtime Timestamp the new file will have as its modified at time
                     * @returns {Observable} An observable containing the new file object.
                     */
                    uploadFileTo: function(name, content, ctime, mtime) {
                        var boxHttp = this.boxHttp, parentId = this.id;
                        return crypto.digest('SHA-1', content).map(function(sha1) {
                            return Array.prototype.map.call(new Uint8Array(sha1), function(i) {
                                return ('0' + i.toString(16)).slice(-2);
                            }).join('');
                        }).flatMap(function(sha1) {
                            return boxHttp.post(uploadUrl + '/files/content', {
                                    headers: {
                                        'Content-MD5': sha1
                                    }
                                },
                                {
                                    filename: [new Blob([content]), name],
                                    /*eslint-disable camelcase*/
                                    parent_id: parentId,
                                    content_created_at: ctime,
                                    content_modified_at: mtime
                                    /*eslint-enable camelcase*/
                                }
                            ).map(function(result) {
                                return new BoxFile(result.entries[0]);
                            });
                        });
                    }
                });
                Folder.prototype.constructor = Folder;
                responseTranslator.registerDefaultTranslator('folder', Folder);
                return Folder;
            }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Group object. @see http://developers.box.com/docs/#groups
     * @author jmeadows
     */
    
    /**
     * @module BoxGroup
     */
    
    angular.module('box.objects').factory('BoxGroup',
        ['boxHttp', 'boxObjectBase', 'apiUrl', 'BoxCollaboration', 'rx', 'responseTranslator',
            function(boxHttp, boxObjectBase, apiUrl, BoxCollaboration, rx, responseTranslator) {
                function Group(json) {
                    angular.extend(this, json);
                    this.boxHttp = boxHttp;
                }
                Group.prototype = angular.extend(Object.create(boxObjectBase), {
                    urlType: 'groups',
                    /**
                     * Update the group's information.
                     * @param {Object} params An object containing parameters to update  (currently just name is supported)
                     * @returns {Observable} An observable containing a new Group object with the updated parameters.
                     */
                    update: function(params) {
                        return this.boxHttp.put(
                            this.url(),
                            null,
                            params
                        ).map(function(result) {
                            return new Group(result);
                        });
                    },
                    /**
                     * Deletes the group.
                     * @returns {Observable} An observable containing the Box API response for this request.
                     */
                    delete: function() {
                        return this.boxHttp.delete(this.url());
                    },
                    /**
                     * Get a group's memberships, specifying a user, a group, and the user's role in the group.
                     * @returns {Observable} An observable sequence of membership objects.
                     */
                    getMemberships: function() {
                        return this.boxHttp.get(this.url() + '/memberships').flatMap(function(result) {
                            return rx.Observable.fromArray(result.entries);
                        });
                    },
                    /**
                     * Add a new email alias to the user's account.
                     * @param {User} user The user to add to the group
                     * @param {String} role The role of the user in the group
                     * @returns {Observable} An observable containing the newly created membership object.
                     */
                    addMember: function(user, role) {
                        return this.boxHttp.post(apiUrl + '/group_memberships', null, {
                            user: {id: user.id},
                            group: {id: this.id},
                            role: role
                        });
                    },
                    /**
                     * Update a group membership.
                     * @param {Object} membership A membership object to update
                     * @param {String} role The role of the user in the group
                     * @returns {Observable} An observable containing the updated membership object.
                     */
                    updateMembership: function(membership, role) {
                        return this.boxHttp.put(apiUrl + '/group_memberships/' + membership.id, null, {role: role});
                    },
                    /**
                     * Remove a member from the group.
                     * @param {Object} membership A membership object to delete
                     * @returns {Observable} An empty observable.
                     */
                    deleteMembership: function(membership) {
                        return this.boxHttp.delete(apiUrl + '/group_memberships/' + membership.id);
                    },
                    /**
                     * Gets a collection of collaboration objects for the task.
                     * @returns {Observable} An observable sequence of Box Collaboration objects.
                     */
                    getCollaborations: function() {
                        return this.boxHttp.get(this.url() + '/collaborations').flatMap(function(result) {
                            return rx.Observable.fromArray(result.entries.map(function(entry) {
                                return new BoxCollaboration(entry);
                            }));
                        });
                    }
                });
                Group.prototype.constructor = Group;
                responseTranslator.registerDefaultTranslator('group', Group);
                return Group;
            }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Item object. Base class for files and folders.
     * @author jmeadows
     */
    
    /**
     * @module Item
     */
    
    angular.module('box.objects').factory('boxItem', ['boxHttp', 'boxObjectBase', 'BoxComment', 'apiUrl', function(boxHttp, boxObjectBase, BoxComment, apiUrl) {
        return angular.extend(Object.create(boxObjectBase), {
            /**
             * Update this item's information.
             * @param {Object} params Specifies the information to update.  See [http://developers.box.com/docs/#files-update-a-files-information](Updating files) and [http://developers.box.com/docs/#folders-update-information-about-a-folder](Updating folders).
             * @param {Boolean} ifMatch Whether or not to send an If-Match header
             * @returns {Observable} An observable containing the updated item.
             */
            updateInfo: function(params, ifMatch) {
                var Construct = this.constructor;
                return this.boxHttp.put(this.url(),
                    {
                        headers: ifMatch ? {'If-Match': this.etag} : {}
                    },
                    params
                ).map(function(result) {
                    return new Construct(result);
                });
            },
            /**
             * Get a link that can be safely shared with others. See the [http://blog.box.com/2012/04/share-your-stuff-and-stay-in-control-using-box-shared-links/](shared link blog post).
             * @param {String} access Controls who may access the shared link. Can be one of open, company, collaborators, or null (default).
             * @param {Timestamp} unshareDateTime When the shared link will automatically expire
             * @param {Object} permissions Controls whether users of the shared link can preview or download the item
             * @returns {Observable} An observable containing the shared link.
             */
            getSharedLink: function(access, unshareDateTime, permissions) {
                return this.updateInfo({
                    'shared_link': {
                        access: access,
                        /*eslint-disable camelcase*/
                        unshared_at: unshareDateTime,
                        /*eslint-enable camelcase*/
                        permissions: permissions
                    }
                });
            },
            /**
             * Copy an item to another parent folder.
             * @param {Folder} parentFolder The destination Box folder for the copy operation
             * @param {String} name The new name for the copied item
             * @returns {Observable} An observable containing the new copied item.
             */
            copyTo: function(parentFolder, name) {
                var Construct = this.constructor;
                return this.boxHttp.post(this.url() + '/copy', null, {
                    parent: {
                        id: parentFolder.id
                    },
                    name: name || this.name
                }).map(function(result) {
                    return new Construct(result);
                });
            },
            /**
             * Delete the item.
             * @param {Boolean} recursive Whether or not the delete should be recursive (only valid for deleting folders)
             * @param {Boolean} ifMatch Whether or not to send an If-Match header
             * @returns {Observable} An observable containing the Box API response for this request.
             */
            delete: function(recursive, ifMatch) {
                return this.boxHttp.delete(this.url(), {
                    headers: ifMatch ? {'If-Match': this.etag} : {},
                    params: {recursive: !!recursive}
                });
            },
            /**
             * Adds a comment to a file or folder.
             * @param {String} message The message to leave as a comment
             * @returns {Observable} An observable containing the newly created Box comment object.
             */
            commentOn: function(message) {
                return this.boxHttp.post(apiUrl + '/comments', null, {
                    item: {
                        type: this.type,
                        id: this.id
                    },
                    message: message
                }).map(function(result) {
                    return new BoxComment(result);
                });
            },
            /**
             * Restore an item from the trash.
             * @param {Folder} parentFolder The destination Box folder to restore the item to
             * @param {String} name The new name for the restored item
             * @returns {Observable} An observable containing the restored item.
             */
            restoreFromTrash: function(parentFolder, name) {
                var Construct = this.constructor;
                return this.boxHttp.post(this.url(), null, {
                    parent: {
                        id: parentFolder.id
                    },
                    name: name || this.name
                }).map(function(result) {
                    return new Construct(result);
                });
            },
            /**
             * Permanently delete the item from the trash.
             * @param {Boolean} ifMatch Whether or not to send an If-Match header
             * @returns {Observable} An observable containing no result. The onCompleted callback will signal that the item was successfully deleted.
             */
            deleteFromTrash: function(ifMatch) {
                return this.boxHttp.delete(this.url() + '/trash', {
                    headers: ifMatch ? {'If-Match': this.etag} : {}
                });
            }
        });
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Metadata object.
     * @author jmeadows
     */
    
    /**
     * @module BoxMetadata
     */
    
    angular.module('box.objects').factory('BoxMetadata', ['boxHttp', 'boxObjectBase', function(boxHttp, boxObjectBase) {
        /**
         * Custom data associated with a Box file.  For more information, see
         * [http://developers.box.com/metadata-api/](Box Metadata API).
         * @param {File} file The Box file with which this metadata is associated
         * @param {Object} json Information about the metadata from an API request.
         * @constructor
         */
        function Metadata(file, json) {
            this.file = file;
            angular.extend(this, json);
            this.boxHttp = boxHttp;
        }
        function MetadataUpdate() {
            this.ops = [];
        }
        Metadata.prototype = angular.extend(Object.create(boxObjectBase), {
            url: function() {
                return this.file.url() + '/metadata/' + this.$type;
            },
            /**
             * Updates this metadata object with the instructions specified in the given update object.
             * @param {MetadataUpdate} update A metadata update object specifying what to update.
             * @returns {Observable} An observable containing the updated metadata object
             */
            sendUpdate: function(update) {
                var file = this.file;
                return this.boxHttp.put(
                    this.url(),
                    {
                        headers: {'Content-Type': 'application/json-patch+json'}
                    },
                    update.ops
                ).map(function(result) {
                    return new Metadata(file, result);
                });
            },
            /**
             * Delete this metadata object.
             * @returns {Observable} An observable containing the Box API response for this request.
             */
            delete: function() {
                return this.boxHttp.delete(this.url());
            },
            /**
             * Create a metadata update object that can be used to update this metadata object.
             * @returns {MetadataUpdate} The update object that can be used to update this metadata object.
             */
            startUpdate: function() {
                return new MetadataUpdate();
            }
        });
        MetadataUpdate.prototype = {
            /**
             * Adds an instruction to this update object to add a new key/value pair to the metadata object.
             * @param {String} path Specifies where to add the key
             * @param {String} value The value to add
             * @returns {undefined} void
             */
            add: function(path, value) {
                this.ops.push({
                    op: 'add',
                    path: path,
                    value: value
                });
            },
            /**
             * Adds an instruction to this update object to remove a key/value pair from the metadata object.
             * @param {String} path Specifies which key to remove
             * @param {String} oldValue If specified, will only execute the replace if the current value matches this parameter
             * @returns {undefined} void
             */
            remove: function(path, oldValue) {
                if (oldValue) {
                    this.test(path, oldValue);
                }
                this.ops.push({
                    op: 'remove',
                    path: path
                });
            },
            /**
             * Adds an instruction to this update object to replace
             * @param {String} path Specifies which key to replace
             * @param {String} value The new value for the specified key
             * @param {String} oldValue If specified, will only execute the replace if the current value matches this parameter
             * @returns {undefined} void
             */
            replace: function(path, value, oldValue) {
                if (oldValue) {
                    this.test(path, oldValue);
                }
                this.ops.push({
                    op: 'replace',
                    path: path,
                    value: value
                });
            },
            /**
             * Adds an instruction to this update object to test the metadata object for the existence of a key/value pair.
             * The next instruction will only be executed if this test passes.
             * @param {String} path Sepcifies which key to test
             * @param {String} value Specifies the value to test for
             * @returns {undefined} void
             */
            test: function(path, value) {
                this.ops.push({
                    op: 'test',
                    path: path,
                    value: value
                });
            }
        };
        Metadata.prototype.constructor = Metadata;
        return Metadata;
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Task object. @see http://developers.box.com/docs/#tasks
     * @author jmeadows
     */
    
    /**
     * @module BoxTask
     */
    
    angular.module('box.objects').factory('BoxTask',
        ['rx', 'boxHttp', 'apiUrl', 'boxObjectBase', 'BoxTaskAssignment', 'responseTranslator',
            function(rx, boxHttp, apiUrl, boxObjectBase, BoxTaskAssignment, responseTranslator) {
                /**
                 * Represents a file-centric workflow object.  Read more at [https://support.box.com/hc/en-us/articles/200520868-Tasks](Tasks).
                 * @param {Object} json Information about the task from an API result.
                 * @constructor
                 */
                function Task(json) {
                    angular.extend(this, json);
                    this.boxHttp = boxHttp;
                }
                Task.prototype = angular.extend(Object.create(boxObjectBase), {
                    urlType: 'tasks',
                    /**
                     * Get information about the task
                     * @returns {Observable} An observable containing a new Task object containing the details of this task.
                     */
                    getInfo: function() {
                        return this.boxHttp.get(this.url()).map(function(result) {
                            return new Task(result);
                        });
                    },
                    /**
                     * Update the task's action, message, or due date.
                     * @param {Object} params Any or all of: action (String), message (String), and/or due_at (Timestamp)
                     * @returns {Observable} An observable containing a new Task object with the updated parameters.
                     */
                    update: function(params) {
                        return this.boxHttp.put(this.url(), null, params).map(function(result) {
                            return new Task(result);
                        });
                    },
                    /**
                     * Deletes the task.
                     * @returns {Observable} An observable containing the Box API response for this request.
                     */
                    delete: function() {
                        return this.boxHttp.delete(this.url());
                    },
                    /**
                     * Gets a collection of task assignment objects for the task.
                     * @returns {Observable} An observable sequence of Box Task Assignment objects.
                     */
                    getAssignments: function() {
                        var that = this;
                        return this.boxHttp.get(this.url() + '/assignments').flatMap(function(result) {
                            return rx.Observable.fromArray(result.entries.map(function(entry) {
                                return new BoxTaskAssignment(that, entry);
                            }));
                        });
                    },
                    /**
                     * Assigns the task to a user.
                     * @param {User|Object} user The user object representing the user this task should be assigned to.
                     * @returns {Observable} An observable containing the Box API response for this request.
                     */
                    assignTo: function(user) {
                        return this.boxHttp.post(apiUrl + '/task_assignments', null, {
                            task: {
                                id: this.id,
                                type: 'task'
                            },
                            /*eslint-disable camelcase*/
                            assign_to: {
                            /*eslint-enable camelcase*/
                                id: user.id,
                                login: user.login
                            }
                        }).map(function(result) {
                                return new BoxTaskAssignment(result);
                            });
                    }
                });
                Task.prototype.constructor = Task;
                responseTranslator.registerDefaultTranslator('task', Task);
                return Task;
            }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box Task Assignment object. @see http://developers.box.com/docs/#tasks-get-the-assignments-for-a-task
     * @author jmeadows
     */
    
    /**
     * @module BoxTaskAssignment
     */
    
    angular.module('box.objects').factory('BoxTaskAssignment', ['boxHttp', 'boxObjectBase', 'responseTranslator', function(boxHttp, boxObjectBase, responseTranslator) {
        /**
         * Represents a task assignment, specifying the item the task is associated with and the user it is assigned to.
         * @param {Task} task The task specified by the task assignment
         * @param {Object} json Information about the task assignment from an API result.
         * @constructor
         */
        function TaskAssignment(task, json) {
            this.task = task;
            angular.extend(this, json);
            this.boxHttp = boxHttp;
        }
        TaskAssignment.prototype = angular.extend(Object.create(boxObjectBase), {
            urlType: 'task_assignments',
            /**
             * Get information about the task assignment
             * @returns {Observable} An observable containing a new TaskAssignment object containing the details of this task assignment.
             */
            getInfo: function() {
                var task = this.task;
                return this.boxHttp.get(this.url()).map(function(result) {
                    return new TaskAssignment(task, result);
                });
            },
            /**
             * Delete this task assignment, unassigning the associated task from the assignee.
             * @returns {Observable} An observable containing the Box API response for this request.
             */
            delete: function() {
                return this.boxHttp.delete(this.url());
            },
            /**
             * Update this task assignment's message or resolution state.
             * @param {String} message A message to the assignee about the associated task.
             * @param {String} state Can be completed, incomplete, approved, or rejected.
             * @returns {Observable} An observable containing a new TaskAssignment object containing the updated task assignment.
             */
            update: function(message, state) {
                return this.boxHttp.put(this.url(), null, {
                    message: message,
                    /*eslint-disable camelcase*/
                    resolution_state: state
                    /*eslint-enable camelcase*/
                })
                    .map(function(result) {
                        return new TaskAssignment(result);
                    });
            }
        });
        TaskAssignment.prototype.constructor = TaskAssignment;
        responseTranslator.registerDefaultTranslator('task_assignment', TaskAssignment);
        return TaskAssignment;
    }]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Box User object. @see http://developers.box.com/docs/#users
     * @author jmeadows
     */
    
    /**
     * @module BoxUser
     */
    
    angular.module('box.objects').factory('BoxUser',
        [
            'rx',
            'apiUrl',
            'boxHttp',
            'boxObjectBase',
            'BoxCollaboration',
            'BoxComment',
            'BoxFile',
            'BoxFileVersion',
            'BoxFolder',
            'BoxGroup',
            'boxItem',
            'BoxMetadata',
            'BoxTask',
            'BoxTaskAssignment',
            'responseTranslator',
            function(
                rx,
                apiUrl,
                boxHttp,
                boxObjectBase,
                BoxCollaboration,
                BoxComment,
                BoxFile,
                BoxFileVersion,
                BoxFolder,
                BoxGroup,
                boxItem,
                BoxMetadata,
                BoxTask,
                BoxTaskAssignment,
                responseTranslator
                ) {
                /**
                 * Represents a user with a Box account.
                 * @param {Object} json information about the user from an API request
                 * @constructor
                 */
                function User(json) {
                    angular.extend(this, json);
                    this.boxHttp = boxHttp;
                }
                User.prototype = angular.extend(Object.create(boxObjectBase), {
                    urlType: 'users',
                    /**
                     * Assigns a task to the user.
                     * @param {Task|Object} task The task to assign to the user.
                     * @returns {Observable} An observable containing the Box API response for this request.
                     */
                    assignTaskTo: function(task) {
                        return this.boxHttp.post(apiUrl + '/task_assignments', null, {
                            task: {
                                id: task.id,
                                type: 'task'
                            },
                            /*eslint-disable camelcase*/
                            assign_to: {
                            /*eslint-enable camelcase*/
                                id: this.id,
                                login: this.login
                            }
                        }).map(function(result) {
                            return new BoxTaskAssignment(result);
                        });
                    },
                    /**
                     * Update the enterprise user's information if the current user is an enterprise admin.
                     * @param {Object} params A hash containing key/value pairs of the user fields to update
                     * @param {Boolean} notify Whether to notify the affected user when they are rolled out of the enterprise.
                     * @returns {Observable} An observable containing a new User object with the updated parameters.
                     */
                    update: function(params, notify) {
                        return this.boxHttp.put(
                            this.url(),
                            angular.isDefined(notify) ? {notify: notify} : null,
                            params
                        ).map(function(result) {
                            return new User(result);
                        });
                    },
                    /**
                     * Delete the enterprise user if the current user is an enterprise admin.
                     * @param {Boolean} notify Whether to notify the affected user.
                     * @param {Boolean} force Whether or not to delete the user even if they still own files
                     * @returns {Observable} An empty observable.
                     */
                    delete: function(notify, force) {
                        return this.boxHttp.delete(
                            this.url(),
                            angular.extend({},
                                angular.isDefined(notify) ? {notify: notify} : {},
                                angular.isDefined(force) ? {force: force} : {}
                            )
                        );
                    },
                    giveRootFolderToUser: function(user) {
                        /*eslint-disable camelcase*/
                        return this.boxHttp.put(this.url() + '/folders/0', null, {owned_by: {id: user.id}})
                        /*eslint-enable camelcase*/
                            .map(function(result) {
                                return new BoxFolder(result);
                            });
                    },
                    /**
                     * Get a user's email address aliases.  Doesn't include the primary login, which is included in the User object.
                     * @returns {Observable} An observable sequence of email alias objects.
                     */
                    getEmailAliases: function() {
                        return this.boxHttp.get(this.url() + '/email_aliases').flatMap(function(result) {
                            return rx.Observable.fromArray(result.entries);
                        });
                    },
                    /**
                     * Add a new email alias to the user's account.
                     * @param {String} email The email address to add to the user's account
                     * @returns {Observable} An observable containing the newly created email alias object.
                     */
                    addEmailAlias: function(email) {
                        return this.boxHttp.post(this.url() + '/email_aliases', null, {email: email});
                    },
                    /**
                     * Delete the email alias from the user's account.
                     * @param {Object} emailAlias The email alias object to remove from the user's account.
                     * @returns {Observable} An empty observable.
                     */
                    deleteEmailAlias: function(emailAlias) {
                        return this.boxHttp.delete(this.url() + '/email_aliases/' + emailAlias.id);
                    }
                });
                User.prototype.constructor = User;
                responseTranslator.registerDefaultTranslator('user', User);
                return User;
            }]);
    
})();
//----------------------------
(function() {
    /**
     * @namespace box.ui
     * @memberOf box
     */
    angular.module('box.ui', ['rx', 'chrome', 'ui.bootstrap', 'box.sdk']);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Directives supporting the Box UI.
     * @author jmeadows
     */
    
    var mod = angular.module('box.ui');
    
    /**
     * @function boxBreadCrumbs
     * @memberOf box.ui
     * @description Builds a breadcrumb list from a user's root folder to the current item (file or folder). Must be inside
     * a @see BoxFolderView .
     * @param {Object} boxItemSelected Box item selected service
     * @returns {Object} directive for displaying breadcrumbs for an item.
     */
    function boxBreadCrumbs(boxItemSelected) {
        'use strict';
        return {
            scope: {
                item: '='
            },
            link: function(scope) {
                scope.selectFolder = function(item) {
                    boxItemSelected.selectItem(item);
                };
            },
            template: '<span ng-if="!!item" class="box-breadcrumb">' +
                '<span data-ng-repeat="parent in item.path_collection.entries">' +
                '<span class="box-breadcrumb box-breadcrumb-parent" data-ng-click="selectFolder(parent)">{{parent.name}}</span><span> / </span></span>' +
                '<span class="box-breadcrumb box-breadcrumb-leaf" data-ng-click="selectFolder(item)">{{item.name}}</span>' +
                '</span>',
            restrict: 'EA',
            replace: true
        };
    }
    
    mod.directive('boxBreadcrumbs', ['boxItemSelected', boxBreadCrumbs]);
    
    /**
     * @function boxItem
     * @memberOf box.ui
     * @description Directive for showing the details of a Box item, including its name, thumbnail, mtime/ctime, and byte size.
     * @param {Object} boxItemSelected Box item selected service
     * @returns {Object} directive for displaying a Box item (file or folder)
     */
    function boxItem(boxItemSelected) {
        'use strict';
        return {
            template: '<div class="box-item"><div ng-if="!!item">' +
                    '<div class="box-item-thumbnail"><span box-item-thumbnail item="item" thumbnail-size="thumbnailSize"></span></div>' +
                    '<div class="box-item-body" ng-click="select()" ng-dblclick="select() && $emit(\'closeModal\')">' +
                    '    <span class="box-item-body-title">{{item.name}}</span>' +
                    '    <span class="box-item-body-size">{{item.size | bytes}}</span>' +
                    '    <span class="box-item-body-date">{{item.modified_at | date : \'mediumDate\'}}</span>' +
                    '</div>' +
                '</div></div>',
            scope: {
                item: '=',
                thumbnailSize: '='
            },
            link: function(scope, element) {
                scope.select = function() {
                    boxItemSelected.selectItem(scope.item);
                    element.addClass('selected');
                    return true;
                };
                boxItemSelected.selectedItem.subscribe(function(item) {
                    if (item.id !== scope.item.id) {
                        element.removeClass('selected');
                    }
                });
            },
            replace: true,
            restrict: 'EA'
        };
    }
    mod.directive('boxItem', ['boxItemSelected', boxItem]);
    
    /**
     * @function boxItemThumbnail
     * @memberOf box.ui
     * @description Directive for showing an item's thumbnail.
     * @param {Object} chrome Service representing chrome APIs
     * @returns {Object} directive for displaying a Box item thumbnail
     */
    function boxItemThumbnail(chrome) {
        'use strict';
        return {
            scope: {
                item: '=',
                thumbnailSize: '='
            },
            template: '<span></span>',
            link: function(scope, element) {
                if (scope.item.type === 'folder') {
                    var image = new Image();
                    image.src = chrome.runtime.getURL('img/folder.jpg');
                    element.empty();
                    element.append(image);
                } else if (scope.item.type === 'file') {
                    scope.item.getThumbnail('png', scope.thumbnailSize).subscribe(function(thumbnail) {
                        var image = new Image();
                        image.height = scope.thumbnailSize.min_height;
                        image.width = scope.thumbnailSize.min_width;
                        // This is sort of wasteful, but it prevents a spurious warning from Chrome complaining that the blob's MIME type is text/xml.
                        if (thumbnail.type.indexOf('text/') !== -1) {
                            thumbnail = new Blob([thumbnail], {type: 'image/png'});
                        }
                        image.src = window.URL.createObjectURL(thumbnail);
                        image.onload = function() {
                            window.URL.revokeObjectURL(image.src);
                        };
                        element.empty();
                        element.append(image);
                    });
                }
            },
            replace: true,
            restrict: 'EA'
        };
    }
    mod.directive('boxItemThumbnail', ['chrome', boxItemThumbnail]);
    
    /**
     * @function boxAllFiles
     * @memberOf box.ui
     * @description Directive for showing a folder view of the user's root folder.
     * @param {Object} boxItemSelected Box item selected service
     * @returns {Object} directive for viewing all items in the root folder
     */
    function boxAllFiles(boxItemSelected) {
        'use strict';
        return {
            template: '<div><span box-folder-view folder-id="0"></span></div>',
            replace: true,
            restrict: 'EA',
            link: function() {
                boxItemSelected.selectItem({type: 'folder', id: '0'});
            }
        };
    }
    mod.directive('boxAllFiles', ['boxItemSelected', boxAllFiles]);
    
    /**
     * @function BoxFolderView
     * @memberOf box.ui
     * @description Directive for viewing a folder's items.
     * @param {Object} boxSdk Box SDK service
     * @param {Object} boxItemSelected Box item selected service
     * @returns {Object} directive for viewing a folder's items.
     */
    function BoxFolderView(boxSdk, boxItemSelected) {
        'use strict';
        return {
            template: '<div>' +
                    '<div class="item-view-header">' +
                    '    <span box-breadcrumbs item="folder"></span>' +
                    '</div>' +
                    '<div class="item-view-body">' +
                    '    <div class="folder-view-item-wrapper" ng-repeat="item in items">' +
                    '        <div box-item item="item" thumbnail-size="thumbnailSize"></div>' +
                    '    </div>' +
                    '</div>' +
                '</div>',
            scope: {
                folderId: '@'
            },
            replace: true,
            restrict: 'EA',
            link: function(scope) {
                angular.extend(scope, {
                    items: [],
                    thumbnailSize: {
                        'min_width': 32,
                        'max_width': 32,
                        'min_height': 32,
                        'max_height': 32
                    }
                });
                scope.getFolder = function(id) {
                    scope.items = [];
                    boxSdk.getFolder(id)
                        .do(function(folder) {
                            scope.name = folder.name;
                            scope.folder = folder;
                        })
                        .flatMap(function(folder) {
                            return folder.getItems('size,modified_at,name');
                        })
                        .subscribe(function(item) {
                            /*eslint-disable camelcase*/
                            item.modified_at = new Date(item.modified_at);
                            /*eslint-enable camelcase*/
                            scope.items.push(item);
                        });
                };
                scope.selectedItemDisposable = boxItemSelected.selectedItem.subscribe(function(item) {
                    if (item.type === 'folder') {
                        scope.folderId = item.id;
                        scope.getFolder(item.id);
                    } else {
                        scope.fileId = item.id;
                    }
                });
            }
        };
    }
    mod.directive('boxFolderView', ['boxSdk', 'boxItemSelected', BoxFolderView]);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Filters supporting the Box UI.
     * @author jmeadows
     */
    
    var mod = angular.module('box.ui');
    
    /**
     * @function bytes
     * @memberOf box.ui
     * @description Angular filter for formatting a number as a number of bytes, kB, MB, etc.
     * @returns {Function} Formatter for getting a representation of a number of bytes to a given precision.
     */
    function bytes() {
        'use strict';
        return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '-';
            }
            if (parseFloat(bytes) === 0) {
                return '0 bytes';
            }
            if (typeof precision === 'undefined') {
                precision = 1;
            }
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
        };
    }
    
    mod.filter('bytes', bytes);
    
})();
//----------------------------
(function() {
    /**
     * @fileoverview Services supporting the Box UI.
     * @author jmeadows
     */
    
    var mod = angular.module('box.ui');
    
    /**
     * @function boxItemSelected
     * @memberOf box.ui
     * @description Service that notifies subscribers when a new box item is selected.
     * @param {Object} rx RxJS namespace object
     * @returns {Object} Service with method selectItem and property selectedItem
     */
    function boxItemSelected(rx) {
        'use strict';
        var subject = new rx.ReplaySubject(1);
        return {
            selectItem: function(item) {
                subject.onNext(item);
            },
            selectedItem: subject.asObservable()
        };
    }
    mod.factory('boxItemSelected', ['rx', boxItemSelected]);
    
    /**
     * @function boxItemPicker
     * @memberOf box.ui
     * @description Service for opening a Box file or folder picker. Uses the @see $modal service from angular.ui.bootstrap.
     * Supports SAVE_AS, OPEN_FILE, and OPEN_FOLDER modes.
     * @param {Object} $modal ng-modal service
     * @param {Object} rx RxJS namespace object
     * @param {Object} boxItemSelected boxItemSelected service
     * @param {Function} BoxFolder Box Folder constructor
     * @returns {Object} service with method open and property modes
     */
    function boxItemPicker($modal, rx, boxItemSelected, BoxFolder) {
        'use strict';
        var modes = Object.freeze({
            SAVE_AS: 'Save File As',
            OPEN_FILE: 'Open File',
            OPEN_FOLDER: 'Open Folder'
        });
        return {
            mode: modes,
            open: function(mode, filename, modalOptions) {
                var modal = $modal.open(angular.extend(modalOptions || {}, {
                    template:
                        '<div>' +
                        '   <div class="modal-header">' +
                        '       <h3 class="modal-title">' + mode + '</h3>' +
                        '   </div>' +
                        '   <div class="modal-body">' +
                        '       <span box-all-files></span>' +
                        '       <div><label>Filename: <input type="text" ng-model="filename" /></label></div>' +
                        '   </div>' +
                        '   <div class="modal-footer">' +
                        '       <button class="btn btn-primary" ng-click="close()">OK</button>' +
                        '       <button class="btn btn-warning" ng-click="$dismiss()">Cancel</button>' +
                        '   </div>' +
                        '</div>',
                    controller: function($scope) {
                        $scope.filename = filename;
                        $scope.close = function() {
                            boxItemSelected.selectedItem
                                .map(function(item) {
                                    switch (mode) {
                                        case modes.SAVE_AS:
                                            item.filename = $scope.filename;
                                            return item;
                                        case modes.OPEN_FILE:
                                            if (item.type === 'folder') {
                                                throw new Error('Invalid selection - select a file.');
                                            } else {
                                                return item;
                                            }
                                            break;
                                        case modes.OPEN_FOLDER:
                                            if (item.type === 'folder') {
                                                return item;
                                            } else {
                                                return new BoxFolder(item.parent);
                                            }
                                            break;
                                        default:
                                            return item;
                                    }
                                })
                                .subscribe(modal.close.bind(modal), modal.dismiss.bind(modal), angular.noop);
                        };
                        $scope.$on('closeModal', $scope.close);
                        boxItemSelected.selectedItem
                            .subscribe(function(item) {
                                if (item.type === 'file') {
                                    $scope.filename = item.name;
                                }
                            });
                    }
                }));
                return rx.Observable.fromPromise(modal.result);
            }
        };
    }
    mod.factory('boxItemPicker', ['$modal', 'rx', 'boxItemSelected', 'BoxFolder', boxItemPicker]);
    
})();