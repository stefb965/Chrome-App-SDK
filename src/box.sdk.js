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
