/**
 * @fileoverview The base class for Box objects.
 * @author jmeadows
 */

var objects = angular.module('box.objects', ['rx', 'box.conf', 'box.http', 'box.util', 'chrome.downloads']);

objects.factory('boxObjectBase',
    ['apiUrl', 'boxHttp', function(apiUrl, boxHttp) {
        function BoxHttpProxy(user) {
            var defaultHeaders = Object.create(this.defaultHeaders || {});
            this.defaultHeaders = angular.extend(defaultHeaders, {
                'As-User': user.id
            });
        }
        var Constructor = Object.getPrototypeOf(boxHttp).constructor;
        BoxHttpProxy.prototype = Object.create(new Constructor());
    return {
        url: function() {
            return apiUrl + '/' + this.urlType + '/' + this.id;
        },
        /**
         * Allows enterprise administrators to make API calls for their managed users.
         * @param {BoxUser} user The user that operations should be made as
         * @returns {Object} A new instance of the same type as this box object, on which operations will be performed as the specified user.
         */
        asUser: function(user) {
            var constructor = this.constructor, args = [];
            function BoxObjectAsUser() {
                constructor.apply(this, args);
            }
            BoxObjectAsUser.prototype = Object.create(constructor.prototype);
            for (var i = 0; i < constructor.length - 1; i++) {
                args.push(null);
            }
            args.push(this);
            var boxObjectAsUser = new BoxObjectAsUser();
            boxObjectAsUser.boxHttp = new BoxHttpProxy(user);
            return boxObjectAsUser;
        }
    };
}]);
