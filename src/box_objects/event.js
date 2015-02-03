/**
 * @fileoverview Box Event object. @see http://developers.box.com/docs/#events
 * @author jmeadows
 */

/**
 * @module BoxEvent
 */

angular.module('box.objects').factory('BoxEvent', ['boxHttp', 'boxObjectBase', 'responseTranslator', function(boxHttp, boxObjectBase, responseTranslator) {
    /**
     * Represents an event - something happening in a Box account.
     * @param {Object} json Information about the event.
     * @param {String} streamPosition Indicates a moment in time near where this event occurred.
     * @constructor
     */
    function Event(json, streamPosition) {
        angular.extend(this, json);
        this.streamPosition = streamPosition;
        if (angular.isDefined(this.source)) {
            this.source = responseTranslator.translateResponse(this.source);
        }
    }
    Event.prototype = angular.extend(Object.create(boxObjectBase), {
    });
    Event.prototype.constructor = Event;
    return Event;
}]);
