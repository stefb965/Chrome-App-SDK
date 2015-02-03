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
