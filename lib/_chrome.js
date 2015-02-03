/**
 * @fileoverview Chrome module and angular service.
 * @author jmeadows
 */

angular.module('chrome', []).factory('chrome', function() {
    return window.chrome;
});
