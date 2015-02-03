/*var conf = */angular.module('box.conf');
//conf.constant('clientSecret', 'uII-----------------------------');
//conf.constant('clientId', 'i3p-----------------------------');

var mod = angular.module('box.uploader', ['rx', 'chrome', 'ui.bootstrap', 'box.sdk', 'box.ui']);

function boxUploaderController($scope, $http, rx, chrome, boxItemPicker, boxSdk, notifications) {
    'use strict';
    // Set up an event handler for listening for messages from the background page
    rx.Observable.fromChromeEvent(chrome.runtime.onMessage)
        .filter(function(request) {
            // We're only interested in the showDialog message
            return request.function && request.function === 'showDialog';
        })
        .flatMap(function(request) {
            // Open the Box item picker to select where the file should be uploaded
            return boxItemPicker.open(boxItemPicker.mode.SAVE_AS, request.filename)
                .flatMap(function(item) {
                    if (item.type === 'folder') {
                        return rx.Observable.return({
                            folder: item,
                            filename: item.filename
                        });
                    } else {
                        return boxSdk.getFolder(item.parent)
                            .map(function(folder) {
                                return {
                                    folder: folder,
                                    file: item
                                };
                            });
                    }
                })
                .flatMap(function(item) {
                    // Download the file to be uploaded
                    return rx.Observable.fromPromise($http.get(
                        request.url,
                        {
                            responseType: 'blob'
                        }
                    ))
                        .retry()
                        .flatMap(function(content) {
                            // Upload the file, either replacing an existing selected file or uploading it to the selected folder
                            if (item.file) {
                                return item.file.replace(item.file.name, content.data);
                            } else {
                                return item.folder.uploadFileTo(request.filename, content.data);
                            }
                        });
                });
        })
        .subscribe(function(result) {
            // On successful upload, send a desktop notification that when clicked will open the file on Box
            notifications.send(result.name + ' uploaded to Box', {
                contextMessage: 'Click to view on Box.',
                isClickable: true
            })
                .onClicked
                .subscribe(function() {
                    window.open('https://app.box.com/files/0/f/' + result.parent.id + '/1/' + result.id);
                });
        });
}
mod.controller('boxUploaderController', ['$scope', '$http', 'rx', 'chrome', 'boxItemPicker', 'boxSdk', 'notifications', boxUploaderController]);

//This service allows sending desktop notifications
mod.provider('notifications', [function() {
    this.$get = ['rx', 'chrome', function(rx, chrome) {
        function createObservable(method, event) {
            var callback = event ? rx.Observable.fromChromeEventOnce : rx.Observable.fromChromeCallback;
            if (angular.isDefined(chrome.notifications)) {
                return callback(chrome.notifications[method]);
            } else {
                return function() {
                    return rx.Observable.fromChromeCallback(chrome.runtime.sendMessage)({
                        'function': 'notifications.' + method + (event ? '.addListener' : ''),
                        params: Array.prototype.slice.call(arguments)
                    });
                };
            }
        }
        var create = createObservable('create', false);
        var clear = createObservable('clear', false);
        var clicked = createObservable('onClicked', true);
        var closed = createObservable('onClosed', true);
        function createNotification(message, options) {
            var messageId = '';
            var innerCreateNotification = create(
                messageId,
                angular.extend({
                    type: 'basic',
                    iconUrl: 'img/box_icon_16.png',
                    title: 'Box Uploader',
                    message: message
                }, options)
            );
            innerCreateNotification.subscribe(function(id) {
                messageId = id;
            });
            var onclickSubject = new rx.ReplaySubject(1), oncloseSubject = new rx.ReplaySubject(1);
            clicked()
                .filter(function(id) {
                    return id && id === messageId;
                })
                .subscribe(onclickSubject);
            closed()
                .filter(function(id) {
                    return id && id === messageId;
                })
                .subscribe(oncloseSubject);
            return  {
                onClicked: onclickSubject,
                onClosed: oncloseSubject,
                clear: function() {
                    clear(messageId);
                }
            };
        }
        return {
            send: function(message, options) {
                return createNotification(message, options);
            }
        };
    }];
}]);

// Add a new element to the DOM and use it to bootstrap angular with our controller
var root = angular.element('<div ng-controller="boxUploaderController"></div>');
document.body.appendChild(root[0]);
angular.bootstrap(root, ['box.uploader']);
