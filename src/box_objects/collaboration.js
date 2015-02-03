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
