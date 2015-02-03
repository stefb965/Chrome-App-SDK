/**
 * @fileoverview Chrome downloads module and angular service. @see https://developer.chrome.com/extensions/downloads
 * @author jmeadows
 */
var downloads = angular.module('chrome.downloads', ['chrome', 'rx']);

downloads.service('chromeDownloads', ['chrome', 'rx', function(chrome, rx) {
    /**
     * Download a file.
     * @param {Object} options Options specifying how to perform the download. See https://developer.chrome.com/extensions/downloads#method-download
     * @returns {Observable} An observable containing the id of the Chrome DownloadItem started by this call to download.
     */
    this.download = function(options) {
        return rx.Observable.fromChromeCallback(chrome.downloads.download, null, chrome.downloads)(options);
    };
}]);
