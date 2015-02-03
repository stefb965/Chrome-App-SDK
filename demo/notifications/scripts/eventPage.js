(function() {
    'use strict';

    /*var conf = */angular.module('box.conf');
    //conf.constant('clientSecret', 'uII-----------------------------');
    //conf.constant('clientId', 'i3p-----------------------------');

    // This application won't be run in an environment with a DOM, so we use angular's injector to get the dependencies
    var injector = angular.injector(['ng', 'box.sdk', 'box.http']);
    var sdk = injector.get('boxSdk');
    //var http = injector.get('boxHttp');
    //var getAuthStatus = http.auth.bind(http, true);
    var chromeStorage = injector.get('chromeStorage');

    var create = Rx.Observable.fromChromeCallback(chrome.notifications.create);
    var clear = Rx.Observable.fromChromeCallback(chrome.notifications.clear);
    var clicked = Rx.Observable.fromChromeEvent(chrome.notifications.onClicked);
    var notificationClosed = Rx.Observable.fromChromeEvent(chrome.notifications.onClosed);
    function createNotification(message, options) {
        var messageId = '';
        var innerCreateNotification = create(
            messageId,
            angular.extend({
                type: 'basic',
                iconUrl: 'img/box_icon_16.png',
                title: 'Box',
                message: message
            }, options)
        );
        innerCreateNotification.subscribe(function(id) {
            messageId = id;
        });
        var onclickSubject = new Rx.ReplaySubject(1), oncloseSubject = new Rx.ReplaySubject(1);
        clicked
            .filter(function(id) {
                return id && id === messageId;
            })
            .subscribe(onclickSubject);
        notificationClosed
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

    chromeStorage.getLocal('streamPosition')
        .flatMap(function(data) {
            var streamPosition = angular.isDefined(data) ? data : undefined;
            return sdk.subscribeToEvents(streamPosition);
        })
        .do(function(event) {
            chromeStorage.setLocal({'streamPosition': event.streamPosition}).subscribe(angular.noop);
        })
        .subscribe(function(event) {
            if (event.event_type.indexOf('ITEM') === 0) {
                createNotification(event.source.name + ' ' + event.event_type.substring(5) + ' recorded.', {
                    contextMessage: 'Click to view on Box.',
                    isClickable: true
                })
                    .onClicked
                    .subscribe(function() {
                        if (event.source.type === 'folder') {
                            window.open('https://app.box.com/files/0/f/' + event.source.id);
                        } else {
                            window.open('https://app.box.com/files/0/f/' + event.source.parent.id + '/1/' + event.source.id);
                        }
                    });
            }
        });
}());
