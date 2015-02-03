// Create a new entry in Chrome's context menu called Upload to Box for links, images, video, and audio
chrome.contextMenus.create({
    title: 'Upload to Box',
    id: 'boxupload',
    contexts: [
        'link',
        'image',
        'video',
        'audio'
    ],
    documentUrlPatterns: [
        'http://*/*',
        'https://*/*'
    ]
});

var hasInjectedScript = {};
// Set up observables from Chrome callback style functions
var injectScriptObservable = Rx.Observable.fromChromeCallback(chrome.tabs.executeScript);
var injectStyleObservable = Rx.Observable.fromChromeCallback(chrome.tabs.insertCSS);
var sendMessageObservable = Rx.Observable.fromChromeCallback(chrome.tabs.sendMessage);

function injectScripts(tab) {
    'use strict';
    if (hasInjectedScript[tab.id]) {
        return Rx.Observable.return(null);
    } else {
        return injectScriptObservable(tab.id, {
            file: 'build/upload_to_box_extension.js'
        })
            .flatMap(function() {
                return injectScriptObservable(tab.id, {
                    file: 'scripts/upload_to_box.js'
                });
            })
            .flatMap(function() {
                return injectStyleObservable(tab.id, {
                    file: 'styles/upload_to_box.css'
                });
            })
            .flatMap(function() {
                return injectStyleObservable(tab.id, {
                    file: 'bower_components/bootstrap-css-only/css/bootstrap.min.css'
                });
            })
            .do(function() {
                hasInjectedScript[tab.id] = true;
            });
    }
}

function handleTargetFile(tab, url) {
    'use strict';
    injectScripts(tab)
        .flatMap(function() {
            // After injecting the necessary scripts, send the content script a message asking it to show the dialog
            return sendMessageObservable(tab.id, {
                    function: 'showDialog',
                    filename: url.substr(url.lastIndexOf('/') + 1),
                    url: url
                }
            );
        })
        .subscribe(angular.noop);
}

// Add event handler for our context menu item
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'boxupload') {
        if (info.srcUrl) {
            handleTargetFile(tab, info.srcUrl);
        } else if (info.linkUrl) {
            // Don't handle html files or directories
            if (/^\w+:\/\/.+\.\w+$/.test(info.linkUrl) && !/^\w+:\/\/.+\.htm\w*$/.test(info.linkUrl)) {
                handleTargetFile(tab, info.linkUrl);
            }
        }
    }
});

// Add event handler for receiving messages from content scripts. Some Chrome APIs are not available in content scripts (like notifications),
// so they are performed here.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    function get(obj, key) {
        return obj[key];
    }
    if (message && message.function) {
        var objects = message.function.split('.');
        var params = message.params;
        params.push(sendResponse);
        objects.reduce(get, chrome).apply(objects.slice(0, -1).reduce(get, chrome), params);
    }
    return true;
});

chrome.tabs.onUpdated.addListener(function(id, info, tab) {
    hasInjectedScript[tab.id] = false;
});
