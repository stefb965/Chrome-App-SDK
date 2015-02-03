/**
 * @fileoverview Services supporting the Box UI.
 * @author jmeadows
 */

var mod = angular.module('box.ui');

/**
 * @function boxItemSelected
 * @memberOf box.ui
 * @description Service that notifies subscribers when a new box item is selected.
 * @param {Object} rx RxJS namespace object
 * @returns {Object} Service with method selectItem and property selectedItem
 */
function boxItemSelected(rx) {
    'use strict';
    var subject = new rx.ReplaySubject(1);
    return {
        selectItem: function(item) {
            subject.onNext(item);
        },
        selectedItem: subject.asObservable()
    };
}
mod.factory('boxItemSelected', ['rx', boxItemSelected]);

/**
 * @function boxItemPicker
 * @memberOf box.ui
 * @description Service for opening a Box file or folder picker. Uses the @see $modal service from angular.ui.bootstrap.
 * Supports SAVE_AS, OPEN_FILE, and OPEN_FOLDER modes.
 * @param {Object} $modal ng-modal service
 * @param {Object} rx RxJS namespace object
 * @param {Object} boxItemSelected boxItemSelected service
 * @param {Function} BoxFolder Box Folder constructor
 * @returns {Object} service with method open and property modes
 */
function boxItemPicker($modal, rx, boxItemSelected, BoxFolder) {
    'use strict';
    var modes = Object.freeze({
        SAVE_AS: 'Save File As',
        OPEN_FILE: 'Open File',
        OPEN_FOLDER: 'Open Folder'
    });
    return {
        mode: modes,
        open: function(mode, filename, modalOptions) {
            var modal = $modal.open(angular.extend(modalOptions || {}, {
                template:
                    '<div>' +
                    '   <div class="modal-header">' +
                    '       <h3 class="modal-title">' + mode + '</h3>' +
                    '   </div>' +
                    '   <div class="modal-body">' +
                    '       <span box-all-files></span>' +
                    '       <div><label>Filename: <input type="text" ng-model="filename" /></label></div>' +
                    '   </div>' +
                    '   <div class="modal-footer">' +
                    '       <button class="btn btn-primary" ng-click="close()">OK</button>' +
                    '       <button class="btn btn-warning" ng-click="$dismiss()">Cancel</button>' +
                    '   </div>' +
                    '</div>',
                controller: function($scope) {
                    $scope.filename = filename;
                    $scope.close = function() {
                        boxItemSelected.selectedItem
                            .map(function(item) {
                                switch (mode) {
                                    case modes.SAVE_AS:
                                        item.filename = $scope.filename;
                                        return item;
                                    case modes.OPEN_FILE:
                                        if (item.type === 'folder') {
                                            throw new Error('Invalid selection - select a file.');
                                        } else {
                                            return item;
                                        }
                                        break;
                                    case modes.OPEN_FOLDER:
                                        if (item.type === 'folder') {
                                            return item;
                                        } else {
                                            return new BoxFolder(item.parent);
                                        }
                                        break;
                                    default:
                                        return item;
                                }
                            })
                            .subscribe(modal.close.bind(modal), modal.dismiss.bind(modal), angular.noop);
                    };
                    $scope.$on('closeModal', $scope.close);
                    boxItemSelected.selectedItem
                        .subscribe(function(item) {
                            if (item.type === 'file') {
                                $scope.filename = item.name;
                            }
                        });
                }
            }));
            return rx.Observable.fromPromise(modal.result);
        }
    };
}
mod.factory('boxItemPicker', ['$modal', 'rx', 'boxItemSelected', 'BoxFolder', boxItemPicker]);
