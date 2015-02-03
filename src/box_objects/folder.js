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
