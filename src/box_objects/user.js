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
