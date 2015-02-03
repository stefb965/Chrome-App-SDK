module.exports = function(angular, rx) {
    'use strict';
    angular.module('chrome.storage')
        .service('chromeStorage', function() {
            var cache = {};
            this.getLocal = rx.Observable.fromCallback(function(name, callback) {
                var hash = {};
                if (cache.hasOwnProperty(name)) {
                    hash[name] = cache[name];
                }
                callback(hash);
            });
            this.setLocal = rx.Observable.fromCallback(function(items, callback) {
                angular.extend(cache, items);
                callback(true);
            });
            this.removeLocal = rx.Observable.fromCallback(function(name, callback) {
                delete cache[name];
                callback(true);
            });
        });
};
