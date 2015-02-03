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
