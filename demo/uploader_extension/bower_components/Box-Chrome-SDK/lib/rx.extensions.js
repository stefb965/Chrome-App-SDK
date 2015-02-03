/**
 * Converts a chrome.* API function that takes a callback to an observable sequence, raising an error if
 * chrome.runtime.lastError is set.
 *
 * @param {Function} func Function with a callback as the last parameter to convert to an Observable sequence.
 * @param {Scheduler} [scheduler] Scheduler to run the function on. If not specified, defaults to Scheduler.timeout.
 * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
 * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
 * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
 */
var fromChromeCallback = Rx.Observable.fromChromeCallback = function (func, scheduler, context, selector) {
    if (!scheduler) scheduler = Rx.Scheduler.immediate;
    return function () {
        var args = Array.prototype.slice.call(arguments, 0);

        return new Rx.AnonymousObservable(function (observer) {
            return scheduler.schedule(function () {
                function handler(e) {
                    if (chrome.runtime.lastError) {
                        observer.onError(chrome.runtime.lastError.message);
                        observer.onCompleted();
                    }
                    var results = e || [undefined];

                    if (selector) {
                        try {
                            results = selector(arguments);
                        } catch (err) {
                            observer.onError(err);
                            return;
                        }
                    } else {
                        if (results.length === 1) {
                            results = results[0];
                        }
                    }

                    observer.onNext(results);
                    observer.onCompleted();
                }

                args.push(handler);
                func.apply(context, args);
            });
        });
    };
};

/**
 * Creates an observable sequence from an chrome.event.
 * @param {Function} event The function to add a handler to the emitter.
 * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
 * @returns {Observable} An observable sequence which wraps an event from an event emitter
 */
var fromChromeEvent = Rx.Observable.fromChromeEvent = function(event, selector) {
    return Rx.Observable.fromEventPattern(
        function(handler) {
            event.addListener(handler);
        },
        null,
        selector
    );
};

/**
 * Creates an observable sequence from an chrome.event, detaching after the first event emission.
 * @param {Function} event The function to add a handler to the emitter.
 * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
 * @returns {Observable} An observable sequence which wraps an event from an event emitter
 */
var fromChromeEventOnce = Rx.Observable.fromChromeEventOnce = function(event, selector) {
    return Rx.Observable.fromEventPattern(
        function(handler) {
            event.addListener(handler);
        },
        function(handler) {
            event.removeListener(handler);
        },
        selector
    );
};
