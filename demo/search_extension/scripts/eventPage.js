/*var conf = */angular.module('box.conf');
//conf.constant('clientSecret', 'uII-----------------------------');
//conf.constant('clientId', 'i3p-----------------------------');

// This application won't be run in an environment with a DOM, so we use angular's injector to get the dependencies
var injector = angular.injector(['ng', 'box.sdk', 'box.http']);
var sdk = injector.get('boxSdk');
var http = injector.get('boxHttp');

// Set up observables from chrome events
var setDefaultSuggestion = chrome.omnibox.setDefaultSuggestion.bind(chrome.omnibox);
var inputChanged = Rx.Observable.fromChromeEvent(
    chrome.omnibox.onInputChanged,
    function(args) {
        return {
            text: args[0],
            suggest: args[1]
        };
    }
);
var inputStarted = Rx.Observable.fromChromeEvent(
    chrome.omnibox.onInputStarted,
    function() {
        return {};
    }
);
var inputEntered = Rx.Observable.fromChromeEvent(
    chrome.omnibox.onInputEntered,
    function(args) {
        return {
            text: args[0],
            disposition: args[1]
        };
    }
);
var inputCancelled = Rx.Observable.fromChromeEvent(
    chrome.omnibox.onInputCancelled,
    function() {
        return {};
    }
);
var getAuthStatus = http.auth.bind(http, true);

// When the user starts typing in the omnibox, set the default suggestion to be 'Search Box'
inputStarted.merge(inputCancelled).subscribe(setDefaultSuggestion.bind(undefined, {description: 'Search Box'}));

// Whenever the user types in the omnibox
inputChanged
    // Ignore entries less than 2 characters
    .skipWhile(function(message) {
        return message.text.length < 2;
    })
    // Only take distinct entries
    .distinctUntilChanged(function(message) {
        return message.text;
    })
    .flatMap(function(message) {
        // Ensure we're authorized
        return getAuthStatus()
            .flatMap(function() {
                // Search Box for what the user has entered in the omnibox
                return sdk.search(message.text)
                    // Take the top 10 results
                    .take(10)
                    // For each result item, return the url that will allow viewing the item on Box and the item's name, with the search text highlighted
                    .map(function(result) {
                        var url;
                        if (result.type === 'file') {
                            url = 'https://app.box.com/files/0/f/' + result.parent.id + '/1/' + result.id;
                        } else if (result.type === 'folder') {
                            url = 'https://app.box.com/files/0/f/' + result.id + '/' + result.name;
                        } else {
                            url = result.url;
                        }
                        return {
                            content: url,
                            description: (result.name.replace(new RegExp(message.text, 'g'), '<match>' + message.text + '</match>') + ' - <url>' + url + '</url>').replace('&', '&amp;')
                        };
                    })
                    .toArray()
                    // Return the (up to) 10 results, plus the default suggestion which is still to search box for the entered text
                    .map(function(suggestions) {
                        return {
                            suggestions: suggestions,
                            suggest: message.suggest,
                            suggestion: {
                                description: 'Search Box for <match>' + message.text + '</match>'
                            }
                        };
                    });
            })
            // If the user is not logged in, suggest that they log in to activate search from the omnibox
            .onErrorResumeNext(
                Rx.Observable.return({
                    suggestions: [{
                        content: 'https://app.box.com/files/search/' + message.text + '/0',
                        description: 'Search Box for <match>' + message.text + '</match>'
                    }],
                    suggest: message.suggest,
                    suggestion: {
                        description: 'Log in to Box to activate search.'
                    }
                })
            )
            // Don't suggest login if already logged in
            .take(1);
    })
    .subscribe(
        function onNext(message) {
            // Set Chrome's default suggestion and populate other suggestions
            setDefaultSuggestion(message.suggestion);
            message.suggest(message.suggestions);
        },
        function onError() {
            //console.log(error);
        },
        function onCompleted() {
            //console.log('Input Started Completed');
        }
    );

// When the user has made their selection from the omnibox
inputEntered.subscribe(function(message) {
    // Function to navigate to a url, either in a new tab or in the current tab
    function navigate(url, disposition) {
        if (disposition === 'currentTab') {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.update(tabs[0].id, {url: url});
            });
        } else {
            chrome.tabs.create({
                url: url,
                active: disposition === 'newForegroundTab'
            });
        }
    }
    if (message.text.indexOf('https://app.box.com/files/') === 0) {
        // If the user has selected one of the suggestions, then navigate to it
        navigate(message.text, message.disposition);
    } else {
        // If the user has selected the default suggestion, then log in and show the Box search page
        http.auth()
            .subscribe(function() {
                navigate('https://app.box.com/files/search/' + message.text + '/0', message.disposition);
            });
    }
});
