var rxHttp = angular.module('rx.http', ['rx']);

rxHttp.factory('http', ['$http', 'rx', function($http, rx) {
    function makeFormData(data) {
        var form = new FormData();
        for (var param in data) {
            if (data.hasOwnProperty(param) && angular.isDefined(data[param])) {
                var value = data[param];
                // This param is a file - the first element is the file object and the second is the filename
                if (Array.isArray(value)) {
                    value.unshift(param);
                    form.append.apply(form, value);
                }
                else form.append(param, value);
            }
        }
        return form;
    }
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