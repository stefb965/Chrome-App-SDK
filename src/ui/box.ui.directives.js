/**
 * @fileoverview Directives supporting the Box UI.
 * @author jmeadows
 */

var mod = angular.module('box.ui');

/**
 * @function boxBreadCrumbs
 * @memberOf box.ui
 * @description Builds a breadcrumb list from a user's root folder to the current item (file or folder). Must be inside
 * a @see BoxFolderView .
 * @param {Object} boxItemSelected Box item selected service
 * @returns {Object} directive for displaying breadcrumbs for an item.
 */
function boxBreadCrumbs(boxItemSelected) {
    'use strict';
    return {
        scope: {
            item: '='
        },
        link: function(scope) {
            scope.selectFolder = function(item) {
                boxItemSelected.selectItem(item);
            };
        },
        template: '<span ng-if="!!item" class="box-breadcrumb">' +
            '<span data-ng-repeat="parent in item.path_collection.entries">' +
            '<span class="box-breadcrumb box-breadcrumb-parent" data-ng-click="selectFolder(parent)">{{parent.name}}</span><span> / </span></span>' +
            '<span class="box-breadcrumb box-breadcrumb-leaf" data-ng-click="selectFolder(item)">{{item.name}}</span>' +
            '</span>',
        restrict: 'EA',
        replace: true
    };
}

mod.directive('boxBreadcrumbs', ['boxItemSelected', boxBreadCrumbs]);

/**
 * @function boxItem
 * @memberOf box.ui
 * @description Directive for showing the details of a Box item, including its name, thumbnail, mtime/ctime, and byte size.
 * @param {Object} boxItemSelected Box item selected service
 * @returns {Object} directive for displaying a Box item (file or folder)
 */
function boxItem(boxItemSelected) {
    'use strict';
    return {
        template: '<div class="box-item"><div ng-if="!!item">' +
                '<div class="box-item-thumbnail"><span box-item-thumbnail item="item" thumbnail-size="thumbnailSize"></span></div>' +
                '<div class="box-item-body" ng-click="select()" ng-dblclick="select() && $emit(\'closeModal\')">' +
                '    <span class="box-item-body-title">{{item.name}}</span>' +
                '    <span class="box-item-body-size">{{item.size | bytes}}</span>' +
                '    <span class="box-item-body-date">{{item.modified_at | date : \'mediumDate\'}}</span>' +
                '</div>' +
            '</div></div>',
        scope: {
            item: '=',
            thumbnailSize: '='
        },
        link: function(scope, element) {
            scope.select = function() {
                boxItemSelected.selectItem(scope.item);
                element.addClass('selected');
                return true;
            };
            boxItemSelected.selectedItem.subscribe(function(item) {
                if (item.id !== scope.item.id) {
                    element.removeClass('selected');
                }
            });
        },
        replace: true,
        restrict: 'EA'
    };
}
mod.directive('boxItem', ['boxItemSelected', boxItem]);

/**
 * @function boxItemThumbnail
 * @memberOf box.ui
 * @description Directive for showing an item's thumbnail.
 * @param {Object} chrome Service representing chrome APIs
 * @returns {Object} directive for displaying a Box item thumbnail
 */
function boxItemThumbnail(chrome) {
    'use strict';
    return {
        scope: {
            item: '=',
            thumbnailSize: '='
        },
        template: '<span></span>',
        link: function(scope, element) {
            if (scope.item.type === 'folder') {
                var image = new Image();
                image.src = chrome.runtime.getURL('img/folder.jpg');
                element.empty();
                element.append(image);
            } else if (scope.item.type === 'file') {
                scope.item.getThumbnail('png', scope.thumbnailSize).subscribe(function(thumbnail) {
                    var image = new Image();
                    image.height = scope.thumbnailSize.min_height;
                    image.width = scope.thumbnailSize.min_width;
                    // This is sort of wasteful, but it prevents a spurious warning from Chrome complaining that the blob's MIME type is text/xml.
                    if (thumbnail.type.indexOf('text/') !== -1) {
                        thumbnail = new Blob([thumbnail], {type: 'image/png'});
                    }
                    image.src = window.URL.createObjectURL(thumbnail);
                    image.onload = function() {
                        window.URL.revokeObjectURL(image.src);
                    };
                    element.empty();
                    element.append(image);
                });
            }
        },
        replace: true,
        restrict: 'EA'
    };
}
mod.directive('boxItemThumbnail', ['chrome', boxItemThumbnail]);

/**
 * @function boxAllFiles
 * @memberOf box.ui
 * @description Directive for showing a folder view of the user's root folder.
 * @param {Object} boxItemSelected Box item selected service
 * @returns {Object} directive for viewing all items in the root folder
 */
function boxAllFiles(boxItemSelected) {
    'use strict';
    return {
        template: '<div><span box-folder-view folder-id="0"></span></div>',
        replace: true,
        restrict: 'EA',
        link: function() {
            boxItemSelected.selectItem({type: 'folder', id: '0'});
        }
    };
}
mod.directive('boxAllFiles', ['boxItemSelected', boxAllFiles]);

/**
 * @function BoxFolderView
 * @memberOf box.ui
 * @description Directive for viewing a folder's items.
 * @param {Object} boxSdk Box SDK service
 * @param {Object} boxItemSelected Box item selected service
 * @returns {Object} directive for viewing a folder's items.
 */
function BoxFolderView(boxSdk, boxItemSelected) {
    'use strict';
    return {
        template: '<div>' +
                '<div class="item-view-header">' +
                '    <span box-breadcrumbs item="folder"></span>' +
                '</div>' +
                '<div class="item-view-body">' +
                '    <div class="folder-view-item-wrapper" ng-repeat="item in items">' +
                '        <div box-item item="item" thumbnail-size="thumbnailSize"></div>' +
                '    </div>' +
                '</div>' +
            '</div>',
        scope: {
            folderId: '@'
        },
        replace: true,
        restrict: 'EA',
        link: function(scope) {
            angular.extend(scope, {
                items: [],
                thumbnailSize: {
                    'min_width': 32,
                    'max_width': 32,
                    'min_height': 32,
                    'max_height': 32
                }
            });
            scope.getFolder = function(id) {
                scope.items = [];
                boxSdk.getFolder(id)
                    .do(function(folder) {
                        scope.name = folder.name;
                        scope.folder = folder;
                    })
                    .flatMap(function(folder) {
                        return folder.getItems('size,modified_at,name');
                    })
                    .subscribe(function(item) {
                        /*eslint-disable camelcase*/
                        item.modified_at = new Date(item.modified_at);
                        /*eslint-enable camelcase*/
                        scope.items.push(item);
                    });
            };
            scope.selectedItemDisposable = boxItemSelected.selectedItem.subscribe(function(item) {
                if (item.type === 'folder') {
                    scope.folderId = item.id;
                    scope.getFolder(item.id);
                } else {
                    scope.fileId = item.id;
                }
            });
        }
    };
}
mod.directive('boxFolderView', ['boxSdk', 'boxItemSelected', BoxFolderView]);
