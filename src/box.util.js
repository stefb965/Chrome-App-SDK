/**
 * @fileoverview Utility functions needed by the SDK.
 * @author jmeadows
 */

var util = angular.module('box.util', ['rx']);

util.provider('getAll', function() {
    var defaultLimit = 20;
    this.setDefaultLimit = function(limit) {
        defaultLimit = limit;
    };
    this.$get = ['rx', function(rx) {
        /**
         * For a paginated API, get all results.
         * @param {Function} observableFactory A function that can create a request given a limit and offset.
         * @param {Function} entryTranslator A function that can turn JSON responses into Box objects.
         * @returns {Observable} An observable sequence of results.
         */
        return function(observableFactory, entryTranslator) {
            var limit = defaultLimit, offset = 0, total = -1;
            return rx.Observable.while(
                function() {
                    return total === -1 || total > offset;
                },
                rx.Observable.defer(function() {
                    return rx.Observable.return({
                        limit: limit,
                        offset: offset
                    });
                })
                    .flatMap(function(params) {
                        return observableFactory(params.limit, params.offset)
                            .do(function(result) {
                                offset += limit;
                                total = result.total_count;
                            })
                            .flatMap(function(result) {
                                return rx.Observable.fromArray(
                                    result.entries
                                        .map(entryTranslator)
                                        .filter(function(entry) {
                                            return entry !== null;
                                        })
                                );
                            });
                    })
            );
        };
    }];
});

util.service('responseTranslator', [function() {
    var translators = [];
    this.registerTranslator = function(translator) {
        translators.push(translator);
    };
    this.translateResponse = function(response) {
        var objects = translators.map(function(translator) {
            return translator(response);
        }).filter(angular.identity);
        if (objects.length > 0) {
            return objects[0];
        } else {
            return response;
        }
    };
    this.registerDefaultTranslator = function(type, Constructor) {
        this.registerTranslator(function(response) {
            return response.type === type ? new Constructor(response) : null;
        });
    };
}]);
