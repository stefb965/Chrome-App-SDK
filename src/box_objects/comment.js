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
