/**
 * @fileoverview An Rx abstraction of Angular's $http service.
 * @author jmeadows
 */

var rxHttp = angular.module('rx.http', ['rx']);

rxHttp.factory('http', ['$http', 'rx', function($http, rx) {
    /**
     * Creates a FormData object for sending a request that contains a file.
     * @param {Object} data An object containing key-value pairs to be sent with the request.
     * @returns {FormData} An object that can be sent as a multipart form request.
     */
    function makeFormData(data) {
        var form = new FormData();
        for (var param in data) {
            if (data.hasOwnProperty(param) && angular.isDefined(data[param])) {
                var value = data[param];
                // This param is a file - the first element is the file object and the second is the filename
                if (Array.isArray(value)) {
                    value.unshift(param);
                    form.append.apply(form, value);
                } else {
                    form.append(param, value);
                }
            }
        }
        return form;
    }

    /**
     * Turns an Angular promise from the $http service into an Rx observable.
     * @param {String} method The HTTP verb to use in making the request.
     * @param {String} url The URL for the request.
     * @param {Object} config Configuration object for how the request should be sent.
     * @param {Object} data Data to be sent with the request.
     * @returns {Observable} An observable containing the result of the HTTP request.
     */
    function getObservable(method, url, config, data) {
        config = config || {};
        config.headers = config.headers || {};
        return rx.Observable.fromPromise(
            $http(angular.extend(
                config,
                {
                    url: url,
                    method: method
                },
                data ? {
                    data: makeFormData(data),
                    transformRequest: angular.identity,
                    headers: angular.extend(config.headers, {'Content-Type': undefined})
                } : {}
            )));
    }

    /**
     * Make an HTTP request.
     * @param {String} method The HTTP verb to use in making the request.
     * @param {String} url The URL for the request.
     * @param {Object} config Configuration object for how the request should be sent.
     * @param {Object} data Data to be sent with the request.
     * @returns {Observable} An observable containing the result of the HTTP request.
     */
    function request(method, url, config, data) {
        var observable = getObservable(method, url, config, data),
            subject = new rx.AsyncSubject();
        observable.subscribe(subject);
        return subject.asObservable();
    }
    return {
        getObservable: getObservable,
        request: request
    };
}]);
