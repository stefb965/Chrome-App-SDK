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
