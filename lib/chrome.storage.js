/**
 * @fileoverview chrome.storage An Rx abstraction of the
 * [chrome.storage API](https://developer.chrome.com/extensions/storage)
 * @author jmeadows
 */

var storage = angular.module('chrome.storage', ['chrome', 'rx']);

storage.service('chromeStorage', ['chrome', 'rx', function(chrome, rx) {
    /**
     * Gets an item from the Chrome local item store.
     * @param {String} name The name of the item to get from the local item store.
     * @returns {Observable} An observable containing the object from the local item store with the given name.
     */
    this.getLocal = function(name) {
        return rx.Observable.fromChromeCallback(chrome.storage.local.get, null, chrome.storage.local)(name)
            .map(function(result) {
                return result[name];
            });
    };
    /**
     * Sets an item in the Chrome local item store.
     * @param {Object} value The items to save in the local item store.
     * @returns {Observable} An observable containing a boolean value indicating whether the storage was successful.
     */
    this.setLocal = function(value) {
        return rx.Observable.fromChromeCallback(chrome.storage.local.set, null, chrome.storage.local)(value);
    };
    /**
     * Removes an item from the Chrome local item store.
     * @param {String} name The name of the item to get from the local item store.
     * @returns {Observable} An observable containing a boolean value indicating whether the removal was successful.
     */
    this.removeLocal = function(name) {
        return rx.Observable.fromChromeCallback(chrome.storage.local.remove, null, chrome.storage.local)(name);
    };
}]);
