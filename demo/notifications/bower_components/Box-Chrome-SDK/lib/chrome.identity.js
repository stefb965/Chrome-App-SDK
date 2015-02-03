var downloads = angular.module('chrome.identity', ['chrome', 'rx']);

downloads.service('chromeIdentity', ['chrome', 'rx', function(chrome, rx) {
    /**
     * Download a file.
     * @param {Object} options
     * @returns {Observable} An observable containing the id of the Chrome DownloadItem started by this call to download.
     */
    this.login = function(options) {
        if (angular.isDefined(chrome.identity)) {
            return rx.Observable.fromChromeCallback(chrome.identity.launchWebAuthFlow)(options);
        } else {
            return rx.Observable.fromChromeCallback(chrome.runtime.sendMessage)({
                'function': 'identity.launchWebAuthFlow',
                params: [options]
            });
        }
    };
}]);