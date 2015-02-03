(function() {
    var conf = angular.module('box.conf');
    conf.constant('clientSecret', 'uII-----------------------------');
    conf.constant('clientId', 'i3p-----------------------------');
    conf.constant('authUrl', 'https://www.box.com/api/oauth2');
    conf.constant('redirectUri', 'https://' + chrome.runtime.id + '.chromiumapp.org/provider_cb');

    var box = angular.module('box', ['ngRoute', 'rx', 'ui.bootstrap', 'box.sdk', 'box.ui']);
    var ui = angular.module('box.ui');

    box.service('routeChanger', ['$location', '$route', function($location, $route) {
        this.changeRoute = function(route) {
            $location.path('/View/' + route);
            $route.reload();
        };
    }]);

    box.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/View/:viewType', {
            template: function(params) {
                return '<span data-box-' + params.viewType + '></span>';
            },
            reloadOnSearch: false
        });
        $routeProvider.when('/View/folder/:folderId', {
            template: function(params) {
                return '<div><span box-folder-view folder-id="' + params.folderId + '"></span></div>';
            },
            reloadOnSearch: false
        });
        $routeProvider.when('/View/file/:fileId', {
            template: function(params) {
                return '<div><span box-file-view file-id="' + params.fileId + '"></span></div>';
            },
            reloadOnSearch: false
        });
        $routeProvider.otherwise({
            redirectTo: '/View/all-files'
        });
    }]);

    box.provider('notifications', [function() {
        this.$get = ['rx', 'chrome', function(rx, chrome) {
            var create = rx.Observable.fromChromeCallback(chrome.notifications.create);
            var clear = rx.Observable.fromChromeCallback(chrome.notifications.clear);
            var clicked = rx.Observable.fromChromeEvent(chrome.notifications.onClicked);
            var closed = rx.Observable.fromChromeEvent(chrome.notifications.onClosed);
            function createNotification(message, options) {
                var messageId = '';
                var innerCreateNotification = create(
                    messageId,
                    angular.extend({
                        type: 'basic',
                        iconUrl: 'img/box_icon_16.png',
                        title: 'Box',
                        message: message
                    }, options)
                );
                innerCreateNotification.subscribe(function(id) {
                    messageId = id;
                });
                var onclickSubject = new rx.ReplaySubject(1), oncloseSubject = new rx.ReplaySubject(1);
                clicked
                    .filter(function(id) {
                        return id && id === messageId;
                    })
                    .subscribe(onclickSubject);
                closed
                    .filter(function(id) {
                        return id && id === messageId;
                    })
                    .subscribe(oncloseSubject);
                return {
                    onClicked: onclickSubject,
                    onClosed: oncloseSubject,
                    clear: function() {
                        clear(messageId);
                    }
                };
            }
            return {
                send: function(data, options) {
                    return createNotification(data, options);
                }
            };
        }];
    }]);

    box.config(['$provide', function($provide) {
        $provide.decorator('boxFolderViewDirective', ['$delegate', '$compile', 'notifications', 'boxItemSelected', function($delegate, $compile, notifications, boxItemSelected) {
            var directive = $delegate[0];
            directive.template = null;
            var link = directive.link;
            directive.templateUrl = 'partials/folder-view.html';
            directive.compile = function() {
                return function(scope, element) {
                    link.apply(this, arguments);
                    var drop = angular.element('<div box-file-drop drop-target-title="Drag Files to Upload" process-file-data="uploadFileTo"></div>');
                    $compile(drop)(scope);
                    angular.element(element[0].querySelector('.item-view-header')).after(drop);
                    var isolateScope = element.isolateScope();
                    scope.uploadFileTo = function(data) {
                        isolateScope.folder.uploadFileTo(
                            data.file.name,
                            data.reader.result
                        )
                        .subscribe(function(result) {
                            // On successful upload, send a desktop notification that when clicked will open the file
                            notifications.send(result.name + ' uploaded to Box', {
                                contextMessage: 'Click to view.',
                                isClickable: true
                            })
                            .onClicked
                            .subscribe(function() {
                                boxItemSelected.selectItem(result);
                            });
                        });
                    };
                    scope.$watchCollection('items', function() {
                        scope.numFiles = scope.items.filter(function(item) {
                            return item.type === 'file';
                        }).length;
                        scope.numFolders = scope.items.filter(function(item) {
                            return item.type === 'folder';
                        }).length;
                    });
                    scope.selectedItemDisposable.dispose();
                };
            };
            return $delegate;
        }]);
    }]);

    box.directive('boxFileView', ['boxSdk', 'BoxFileTypeActions', 'boxItemSelected', '$modal', 'notifications', 'chrome', 'rx',
        function(boxSdk, BoxFileTypeActions, boxItemSelected, $modal, notifications, chrome, rx) {
            return {
                templateUrl: 'partials/file-view.html',
                scope: {
                    fileId: '@'
                },
                link: function(scope) {
                    angular.extend(scope, {
                        upload: angular.noop,
                        collaborate: angular.noop,
                        share: angular.noop,
                        settings: angular.noop,
                        thumbnailSize: {
                            min_width: 256,
                            min_height: 256
                        },
                        actions: [],
                        possibleActions: {
                            'Download': function() {
                                rx.Observable.fromChromeCallback(chrome.fileSystem.chooseEntry)({
                                    type: 'saveFile',
                                    suggestedName: scope.file.name
                                })
                                    .flatMap(function(entry) {
                                        return rx.Observable.fromCallback(entry.createWriter, null, entry)();
                                    })
                                    .flatMap(function(writer) {
                                        return scope.file.getContent()
                                            .flatMap(function(content) {
                                                var subject = new rx.Subject();
                                                writer.onwriteend = function(e) {
                                                    subject.onNext(e); subject.onCompleted();
                                                };
                                                writer.onerror = subject.onError.bind(subject);
                                                writer.write(content);
                                                return subject.asObservable();
                                            });
                                    })
                                    .subscribe(
                                    angular.noop,
                                    function(error) {
                                        notifications.send('Download of ' + scope.file.name + ' failed: ' + error);
                                    },
                                    function() {
                                        notifications.send('Download of ' + scope.file.name + ' is complete.');
                                    }
                                );
                            },
                            'Delete': function() {
                                scope.file.delete();
                                boxItemSelected(scope.file.parent);
                            },
                            'Play Video': function() {
                                scope.file.getContent()
                                    .subscribe(function(data) {
                                        notifications.send('Your preview of ' + scope.file.name + ' is ready to watch.');
                                        var video = data;
                                        $modal.open({
                                            template: '<span box-video-preview></span>',
                                            controller: function($scope, video) {
                                                $scope.video = video;
                                            },
                                            resolve: {
                                                video: function() {
                                                    return video;
                                                }
                                            }
                                        });
                                    });
                            },
                            'Play Audio': function() {
                                scope.file.getContent()
                                    .subscribe(function(data) {
                                        notifications.send('Your preview of ' + scope.file.name + ' is ready to play.');
                                        $modal.open({
                                            template: '<span box-audio-preview></span>',
                                            controller: function($scope, data) {
                                                $scope.data = data;
                                            },
                                            resolve: {
                                                data: function() {
                                                    return data;
                                                }
                                            }
                                        });
                                    });
                            },
                            'View Image': function() {
                                scope.file.getContent()
                                    .subscribe(function(data) {
                                        var image = new Image();
                                        //image.height = scope.thumbnailSize.min_height;
                                        //image.width = scope.thumbnailSize.min_width;
                                        // This is sort of wasteful, but it prevents a spurious warning from Chrome complaining that the blob's MIME type is text/xml.
                                        //if (data.type.indexOf("text/") != -1) data = new Blob([data], {type: "image/png"});
                                        image.src = window.URL.createObjectURL(data);
                                        image.onload = function() {
                                            window.URL.revokeObjectURL(image.src);
                                        };
                                        $modal.open({
                                            template: '<span box-image-preview></span>',
                                            controller: function($scope, image) {
                                                $scope.image = image;
                                            },
                                            resolve: {
                                                image: function() {
                                                    return image;
                                                }
                                            }
                                        });
                                    });
                            }
                        }
                    });
                    boxSdk.getFile(scope.fileId)
                        .subscribe(function(file) {
                            scope.file = file;
                        });
                    scope.$watch('file', function(file) {
                        if (angular.isDefined(file)) {
                            scope.actions = BoxFileTypeActions.getActions(file)
                                .filter(function(action) {
                                    return angular.isDefined(scope.possibleActions[action]);
                                });
                        }
                    });
                    scope.doAction = function(action) {
                        scope.possibleActions[action]();
                    };
                },
                restrict: 'EA',
                replace: true
            };
        }]);

    box.directive('boxImagePreview', function() {
        return {
            link: function(scope, element) {
                angular.element(element[0].querySelector('.image-preview')).empty().append(scope.image);
            },
            template: '<div >' +
                '<span class="image-preview"></span>' +
                '</div>'
        };
    });

    box.directive('boxVideoPreview', function() {
        return {
            link: function(scope, element) {
                var velm = element[0].querySelector('video');
                velm.src = window.URL.createObjectURL(scope.video);
                velm.play();
            },
            template: '<div >' +
                '<video controls></video>' +
                '</div>'
        };
    });

    box.directive('boxAudioPreview', function() {
        return {
            link: function(scope, element) {
                var aelm = element[0].querySelector('audio');
                aelm.src = window.URL.createObjectURL(scope.data);
                aelm.play();
            },
            template: '<div >' +
                '<audio controls></audio>' +
                '</div>'
        };
    });

    box.service('BoxFileTypeActions', function() {
        var actions = [
            {extensions: ['m4v', 'mpeg', 'avi', '3gp', 'flv', 'wmv', 'mov'], actions: ['Play Video']},
            {extensions: ['mp3', 'ogg', 'flac', 'aac', 'm4a', 'mp4'], actions: ['Play Audio']},
            {extensions: ['jpg', 'jpeg', 'gif', 'bmp', 'png'], actions: ['View Image']}
        ];
        var types = {
            file: ['Download', 'Delete', 'Replace'],
            folder: ['Delete', 'Create Subfolder'],
            collaboration: ['Delete']
        };
        this.getActions = function(item) {
            var ret = [];
            if (item.type === 'file') {
                var hasExtension = item.name.indexOf('.') !== -1;
                if (hasExtension) {
                    var extension = item.name.substring(item.name.lastIndexOf('.') + 1);
                    angular.forEach(actions, function(action) {
                        if (action.extensions.indexOf(extension) !== -1) {
                            ret = ret.concat(action.actions);
                        }
                    });
                }
            }
            return ret.concat(types[item.type]);
        };
    });

    box.directive('boxFileInfo', [function() {
        return {
            scope: {
                name: '@'
            },
            template: '<div>' +
                '<div class="box-file-info box-file-info-left">{{name}}</div>' +
                '<div class="box-file-info box-file-info-right"><span ng-transclude></span></div>' +
                '</div>',
            transclude: true,
            restrict: 'EA',
            replace: true
        };
    }]);

    ui.directive('BoxItem', ['boxItemSelected', function(boxItemSelected) {
        return {
            templateUrl: 'partials/drop-target.html',
            link: function(scope, element) {
                var isolateScope = element.isolateScope();
                isolateScope.select = function() {
                    boxItemSelected.selectItem(isolateScope.item);
                };
            },
            restrict: 'EA',
            priority: 100
        };
    }]);

    /*
     File drop area that loads the contents of the file and displays them in hawk.
     */
    box.directive('boxFileDrop', ['$compile', 'rx', function($compile, rx) {
        return {
            scope: {
                dropTargetTitle: '@',
                processFileData: '='
            },
            templateUrl: 'partials/drop-target.html',
            link: function(scope, element) {
                scope.tables = [];
                element.on('dragover', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    element.addClass('hover');
                });
                element.on('dragleave', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    element.removeClass('hover');
                });
                element.on('drop', function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    var fileObservable = rx.Observable.fromArray(e.dataTransfer.files)
                        .flatMap(function(file) {
                            var reader = new FileReader();
                            reader.readAsArrayBuffer(file);
                            return rx.Observable.fromEvent(reader, 'load').map(function() {
                                return {
                                    reader: reader,
                                    file: file
                                };
                            });
                        });
                    fileObservable.subscribe(scope.processFileData);
                });
            },
            restrict: 'EA',
            replace: true
        };
    }]);

    box.controller('boxController', ['$scope', 'boxItemSelected', 'routeChanger', function($scope, boxItemSelected, routeChanger) {
        boxItemSelected.selectedItem.subscribe(function(item) {
            routeChanger.changeRoute(item.type + '/' + item.id);
        });
    }]);
}());
