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
