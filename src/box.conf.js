/**
 * @fileoverview Configuration information for the SDK.
 * @author jmeadows
 */

var conf = angular.module('box.conf', []);

//conf.constant('clientSecret', 'uII-----------------------------');
//conf.constant('clientId', 'i3p-----------------------------');

var runtime = chrome.runtime || {};
var runtimeId = runtime.id;
conf.constant('authUrl', 'https://www.box.com/api/oauth2');
conf.constant('redirectUri', 'https://' + runtimeId + '.chromiumapp.org/provider_cb');
conf.constant('apiUrl', 'https://api.box.com/2.0');
conf.constant('uploadUrl', 'https://upload.box.com/api/2.0');
