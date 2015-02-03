/**
 * @fileoverview Filters supporting the Box UI.
 * @author jmeadows
 */

var mod = angular.module('box.ui');

/**
 * @function bytes
 * @memberOf box.ui
 * @description Angular filter for formatting a number as a number of bytes, kB, MB, etc.
 * @returns {Function} Formatter for getting a representation of a number of bytes to a given precision.
 */
function bytes() {
    'use strict';
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
            return '-';
        }
        if (parseFloat(bytes) === 0) {
            return '0 bytes';
        }
        if (typeof precision === 'undefined') {
            precision = 1;
        }
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
}

mod.filter('bytes', bytes);
