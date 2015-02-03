/**
 * @fileoverview Module and angular service wrapping momentJs.
 * @author jmeadows
 */

angular.module('moment', []).factory('moment', function() {
    return window.moment;
});
