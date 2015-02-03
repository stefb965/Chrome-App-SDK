/**
 * @fileoverview Chrome Identity module and angular service. @see See https://developer.chrome.com/apps/identity
 * @author jmeadows
 */
var downloads = angular.module('chrome.identity', ['chrome', 'rx']);

downloads.service('chromeIdentity', ['chrome', 'rx', function(chrome, rx) {
    /**
     * Download a file.
     * @param {Object} options Options for how to launch the web auth flow. See https://developer.chrome.com/apps/identity#method-launchWebAuthFlow
     * @returns {Observable} An observable containing the id of the Chrome DownloadItem started by this call to download.
     */
    this.login = function(options) {
        if (angular.isDefined(chrome.identity)) {
            return rx.Observable.fromChromeCallback(chrome.identity.launchWebAuthFlow, null, chrome.identity)(options);
        } else {
            return rx.Observable.fromChromeCallback(chrome.runtime.sendMessage, null, chrome.runtime)({
                'function': 'identity.launchWebAuthFlow',
                params: [options]
            });
        }
    };
}]);
