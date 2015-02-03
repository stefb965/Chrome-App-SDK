/* eslint-disable no-undef, no-new-func */
/* jshint -W079, -W054 */
var fs = require('fs'),
	jsdom = require('jsdom'),
    angular = require('angular'),
    moment = require('moment'),
    rx = require('rx'),
    formData = require('form-data');
var document = jsdom.jsdom('<html><head></head><body></body></html>'),
    window = document.parentWindow;
/* eslint-enable no-undef */
/* jshint +W079 */

module.exports = function (path, clientId, clientSecret, authUrl, deviceId) {
    'use strict';
	// read angular source into memory
	var src = fs.readFileSync(path, 'utf8');

	// replace implicit references
    window.angular = angular;
    window.Rx = rx;
    window.moment = moment;
    /* eslint-disable no-underscore-dangle */
    var lb = formData.prototype._lastBoundary;
    formData.prototype._lastBoundary = function() {
        return lb.call(this) + formData.LINE_BREAK;
    };
    /* eslint-enable no-underscore-dangle */
    window.FormData = formData;
    window.chrome = {
        runtime: {
            id: '0'
        }
    };
    src = 'angular.module("rx", []).factory("rx", function() { return window.Rx; });' +
        src +
        'angular.module("box.conf").constant("clientSecret", "' + clientSecret + '").constant("clientId", "' + clientId + '");' +
        (angular.isDefined(authUrl) ? 'angular.module("box.auth").constant("authUrl", "' + authUrl + '");' : '') +
        'angular.module("box.auth").constant("redirectUri", "https://localhost:9888/finish_auth");';

    src = src.split('angular').join('window.angular');
    src = src.split('Rx').join('window.Rx');
    src = src.split('moment.').join('window.moment.');
    src = src.split(' FormData').join(' window.FormData');
    src = src.split('chrome.runtime.id').join('window.chrome.runtime.id');

	(new Function('window', 'document', src))(window, document);

    if (angular.isDefined(deviceId)) {
        var http = angular.module('box.http');

        http.factory('boxDeviceIdInterceptor',['$q', 'authUrl', function($q, authUrl){
            return {
                request: function(config) {
                    if (config.url.indexOf(authUrl) === 0) {
                        config.data.append('box_device_id', deviceId);
                    }
                    return config;
                }
            };
        }]);

        http.config(['$httpProvider',function($httpProvider) {
            $httpProvider.interceptors.push('boxDeviceIdInterceptor');
        }]);
    }

	return window;
};
