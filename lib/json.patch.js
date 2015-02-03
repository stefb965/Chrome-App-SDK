/**
 * @fileoverview Module and angular service wrapping json.patch.
 * @author jmeadows
 */

angular.module('json.patch', []).factory('jsonpatch', function() {
    return window.jsonpatch;
});
