var downloads = angular.module('chrome.downloads', ['chrome', 'rx']);

downloads.service('chromeDownloads', ['chrome', 'rx', function(chrome, rx) {
    /**
     * Download a file.
     * @param {Object} options
     * @returns {Observable} An observable containing the id of the Chrome DownloadItem started by this call to download.
     */
    this.download = function(options) {
        return rx.Observable.fromChromeCallback(chrome.downloads.download, null, chrome.downloads)(options);
    };
}]);