/**
 * @fileoverview Module and angular service wrapping window.crypto.
 * @author jmeadows
 */

angular.module('crypto', ['rx']).factory('crypto', ['rx', function(rx) {
    return {
        'getRandomValues': function(arr) {
            return window.crypto.getRandomValues(arr);
        },
        'digest': function(algorithm, content) {
            return rx.Observable.fromPromise(window.crypto.subtle.digest(algorithm, content));
        }
    };
}]);
