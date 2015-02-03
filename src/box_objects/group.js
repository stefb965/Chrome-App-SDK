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
