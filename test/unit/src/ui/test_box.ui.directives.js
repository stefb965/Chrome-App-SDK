/*jshint expr: true*/
describe('box.ui.directives', function() {
    var mocks, scope, element, compiledElement, provide, $rootScope;
    beforeEach(function() {
        mocks = sinon.sandbox.create();
        angular.module('box.conf')
            .constant('clientSecret', 'uII-----------------------------')
            .constant('clientId', 'i3p-----------------------------');
        module('box.ui', 'box.http', 'chrome.storage', function($provide) {
            provide = $provide;
        });
    });
    afterEach(function() {
        mocks.restore();
    });

    describe('boxBreadcrumbs', function() {
        var selectItem;
        beforeEach(inject(function(_$rootScope_, $compile, boxFolderViewDirective, _boxItemSelected_) {
            var boxFolderView = boxFolderViewDirective[0];
            boxFolderView.link = angular.noop;
            boxFolderView.controller = angular.noop;
            boxFolderView.compile = function() { return boxFolderView.link; };
            boxFolderView.scope = false;
            boxFolderView.template = '<div><div data-box-breadcrumbs data-item="item"></div>';
            provide.value('boxFolderViewDirective', boxFolderView);
            selectItem = mocks.stub(_boxItemSelected_, 'selectItem');
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();

            element = angular.element('<div data-box-folder-view data-folder-id="0"></div></div>');
            compiledElement = $compile(element)(scope);
        }));

        it('should be null for no item', function() {
            expect(compiledElement[0].querySelector('.box-breadcrumb')).to.be.null;
        });

        it('should display just the item name for an item with no parents that calls selectFolder(item) when clicked', function() {
            var name = 'All Files';
            scope.item = {
                type: 'folder',
                path_collection: {
                    entries: []
                },
                name: name
            };
            $rootScope.$digest();

            expect(compiledElement[0].querySelector('.box-breadcrumb-parent')).to.be.null;

            var leaf = element[0].querySelectorAll('.box-breadcrumb-leaf')[0];
            expect(leaf.innerHTML).to.equal(name);

            angular.element(leaf).triggerHandler('click');
            expect(selectItem).to.have.been.calledOnce.and.to.have.been.calledWithExactly(scope.item);
        });

        it('should display a list of breadcrumbs for an item with parents that call selectFolder(parentItem) when clicked', function() {
            var root = {
                type: 'folder',
                path_collection: {
                    entries: []
                },
                name: 'All Files'
            };
            var parent = {
                type: 'folder',
                path_collection: {entries:[root]},
                name: 'Some Folder'
            };
            var item = {
                type: 'file',
                path_collection: {entries: [root, parent]},
                name: 'Some File'
            };
            scope.item = item;
            $rootScope.$digest();

            var leaf = element[0].querySelectorAll('.box-breadcrumb-leaf')[0];
            expect(leaf.innerHTML).to.equal('Some File');
            angular.element(leaf).triggerHandler('click');

            var parents = element[0].querySelectorAll('.box-breadcrumb-parent');
            expect(parents[0].innerHTML).to.equal(root.name);
            angular.element(parents[0]).triggerHandler('click');
            expect(parents[1].innerHTML).to.equal(parent.name);
            angular.element(parents[1]).triggerHandler('click');

            expect(selectItem).to.have.been.calledWithExactly(item)
                .and.to.have.been.calledWithExactly(root)
                .and.to.have.been.calledWithExactly(parent)
                .and.to.have.property('callCount', 3);
        });
    });

    describe('boxItem', function() {
        var boxItemSelected, fileResponse;

        beforeEach(inject(function(_$rootScope_, $compile, boxFolderViewDirective, _boxItemSelected_) {
            var boxFolderView = boxFolderViewDirective[0];
            boxFolderView.link = angular.noop;
            boxFolderView.controller = angular.noop;
            boxFolderView.compile = function() { return boxFolderView.link; };
            boxFolderView.scope = false;
            boxFolderView.template = '<div><div data-box-item data-item="item"></div>';
            provide.value('boxFolderViewDirective', boxFolderView);
            boxItemSelected = _boxItemSelected_;
            mocks.stub(boxItemSelected.selectedItem);
            mocks.stub(boxItemSelected, 'selectItem');
            provide.value('boxItemSelected', boxItemSelected);
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();

            var thumbnail = {compile: angular.noop, controller: angular.noop, link: angular.noop, template: '<div class="mock-thumbnail"></div>'};
            provide.value('boxItemThumbnailDirective', thumbnail);

            element = angular.element('<div data-box-folder-view data-folder-id="0"></div></div>');
            compiledElement = $compile(element)(scope);

            fileResponse = {
                "type": "file",
                "id": "5000948880",
                "sequence_id": "3",
                "etag": "3",
                "sha1": "134b65991ed521fcfe4724b7d814ab8ded5185dc",
                "name": "tigers.jpeg",
                "description": "a picture of tigers",
                "size": 629644,
                "path_collection": {
                    "total_count": 2,
                    "entries": [
                        {
                            "type": "folder",
                            "id": "0",
                            "sequence_id": null,
                            "etag": null,
                            "name": "All Files"
                        },
                        {
                            "type": "folder",
                            "id": "11446498",
                            "sequence_id": "1",
                            "etag": "1",
                            "name": "Pictures"
                        }
                    ]
                },
                "created_at": "2012-12-12T10:55:30-08:00",
                "modified_at": "2012-12-12T11:04:26-08:00",
                "created_by": {
                    "type": "user",
                    "id": "17738362",
                    "name": "sean rose",
                    "login": "sean@box.com"
                },
                "modified_by": {
                    "type": "user",
                    "id": "17738362",
                    "name": "sean rose",
                    "login": "sean@box.com"
                },
                "owned_by": {
                    "type": "user",
                    "id": "17738362",
                    "name": "sean rose",
                    "login": "sean@box.com"
                },
                "shared_link": {
                    "url": "https://www.box.com/s/rh935iit6ewrmw0unyul",
                    "download_url": "https://www.box.com/shared/static/rh935iit6ewrmw0unyul.jpeg",
                    "vanity_url": null,
                    "is_password_enabled": false,
                    "unshared_at": null,
                    "download_count": 0,
                    "preview_count": 0,
                    "access": "open",
                    "permissions": {
                        "can_download": true,
                        "can_preview": true
                    }
                },
                "parent": {
                    "type": "folder",
                    "id": "11446498",
                    "sequence_id": "1",
                    "etag": "1",
                    "name": "Pictures"
                },
                "item_status": "active"
            };
        }));

        it('should be null for no item', function() {
            expect(element[0].querySelector('.box-item-body')).to.be.null;
        });

        it('should create a box-item with thumbnail and box-item-body children', function() {
            scope.item = fileResponse;
            $rootScope.$digest();

            var item = element[0].querySelector('.box-item'),
                thumbnail = item.querySelector('.box-item-thumbnail'),
                body = item.querySelector('.box-item-body'),
                title = body.querySelector('.box-item-body-title'),
                size = body.querySelector('.box-item-body-size'),
                date = body.querySelector('.box-item-body-date');
            expect(title.innerHTML).to.equal('tigers.jpeg');
            expect(size.innerHTML).to.equal('614.9 kB');
            expect(date.innerHTML).to.equal('Dec 12, 2012');
            expect(thumbnail.innerHTML).to.equal('<span box-item-thumbnail="" item="item" thumbnail-size="thumbnailSize"></span>');
        });

        it('should create a box-item-body that calls select() on click', function() {
            scope.item = fileResponse;
            $rootScope.$digest();

            var item = element[0].querySelector('.box-item'),
                body = item.querySelector('.box-item-body');

            angular.element(body).triggerHandler('click');
            expect(boxItemSelected.selectItem).to.have.been.calledOnce.and.to.have.been.calledWithExactly(fileResponse);
            expect(angular.element(item).hasClass('selected')).to.be.true;

            expect(boxItemSelected.selectedItem.subscribe).to.have.been.calledOnce;
            var removeClass = boxItemSelected.selectedItem.subscribe.firstCall.args[0];
            removeClass(fileResponse);
            expect(angular.element(item).hasClass('selected')).to.be.true;
            removeClass({id: 0});
            expect(angular.element(item).hasClass('selected')).to.be.false;
        });

        it('should create a box-item-body that calls select() and $emit("closeModal") on double click', function() {
            var listener = mocks.spy();
            scope.$on('closeModal', listener);
            scope.item = fileResponse;
            $rootScope.$digest();

            var item = element[0].querySelector('.box-item'),
                body = item.querySelector('.box-item-body');

            angular.element(body).triggerHandler('dblclick');
            expect(boxItemSelected.selectItem).to.have.been.calledOnce.and.to.have.been.calledWithExactly(fileResponse);
            expect(angular.element(item).hasClass('selected')).to.be.true;

            expect(boxItemSelected.selectedItem.subscribe).to.have.been.calledOnce;
            var removeClass = boxItemSelected.selectedItem.subscribe.firstCall.args[0];
            removeClass(fileResponse);
            expect(angular.element(item).hasClass('selected')).to.be.true;
            removeClass({id: 0});
            expect(angular.element(item).hasClass('selected')).to.be.false;

            expect(listener).to.have.been.calledOnce;
        });
    });

    describe('boxItemThumbnail', function() {
        var chromeRuntime, $compile;
        beforeEach(inject(function(_chrome_, _$rootScope_, _$compile_) {
            chromeRuntime = _chrome_.runtime;
            chromeRuntime.getURL = mocks.stub();
            provide.value('chrome', _chrome_);
            $compile = _$compile_;
            $rootScope = _$rootScope_;

            scope = $rootScope.$new();
        }));

        it('should insert the folder image for a folder item', function() {
            var src = 'img/folder.jpg';
            chromeRuntime.getURL.withArgs(src).returns(src);
            scope.item = {
                type: 'folder'
            };

            element = angular.element('<div box-item-thumbnail item="item"></div>');
            compiledElement = $compile(element)(scope);

            var img = element[0].querySelector('img');
            expect(img.src).to.contain(src);
        });

        it('should download and insert the file thumbnail for a file item', function() {
            var boxFile = {getThumbnail: mocks.stub()};
            scope.item = angular.extend({
                type: 'file'
            }, boxFile);
            scope.thumbnailSize = {
                min_width: 32,
                max_width: 32,
                min_height: 32,
                max_height: 32
            };
            var blob = ['hello'];
            blob.type = 'image/png';
            boxFile.getThumbnail.returns(Rx.Observable.return(new Blob(blob)));
            element = angular.element('<div box-item-thumbnail item="item" thumbnail-size="thumbnailSize"></div>');
            compiledElement = $compile(element)(scope);

            var img = element[0].querySelector('img');
            expect(img.src).to.contain('blob');
            expect(img.height).to.equal(scope.thumbnailSize.min_height);
            expect(img.width).to.equal(scope.thumbnailSize.max_width);
            expect(boxFile.getThumbnail).to.have.been.calledOnce.and.to.have.been.calledWithExactly('png', scope.thumbnailSize);
        });
    });

    describe('boxAllFiles', function() {
        beforeEach(inject(function(_$rootScope_, $compile) {
            provide.value('boxFolderViewDirective', {compile: angular.noop, controller: angular.noop, link: angular.noop});
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();


            element = angular.element('<div data-box-all-files></div>');
            compiledElement = $compile(element)(scope);
        }));

        it('should create a box folder view with item id 0', function() {
            expect(element[0].innerHTML).to.equal('<span box-folder-view="" folder-id="0"></span>');
        });
    });

    describe('boxFolderView', function() {
        var boxSdk, boxItemSelected, folder, items, subfolder, file;
        beforeEach(inject(function(_$rootScope_, _$compile_, _boxSdk_, _boxItemSelected_) {
            provide.value('boxItemDirective', {compile: angular.noop, controller: angular.noop, link: angular.noop, scope: {item: '='}});
            provide.value('boxBreadcrumbsDirective', {compile: angular.noop, controller: angular.noop, link: angular.noop, scope: {item: '='}});

            boxSdk = mocks.stub(_boxSdk_);
            provide.value('boxSdk', boxSdk);
            boxItemSelected = _boxItemSelected_;

            $rootScope = _$rootScope_;
            scope = $rootScope.$new();

            folder = {
                name: 'Awesome folder',
                getItems: mocks.stub()
            };
            subfolder = {
                type: 'folder',
                name: 'Subfolder',
                id: 1,
                getItems: mocks.stub()
            };
            file = {
                type: 'file',
                name: 'File in folder'
            };
            items = [subfolder, file];
            boxSdk.getFolder.returns(Rx.Observable.return(folder));
            folder.getItems.returns(Rx.Observable.fromArray(items));

            element = angular.element('<div data-box-folder-view folder-id="0"></div>');
            compiledElement = _$compile_(element)(scope);

            boxItemSelected.selectItem({type: 'folder', id: '0'});
        }));

        it('should get the items of the folder', function() {
            expect(boxSdk.getFolder).to.have.been.calledOnce.and.to.have.been.calledWithExactly('0');
            expect(folder.getItems).to.have.been.calledOnce.and.to.have.been.calledWithExactly('size,modified_at,name');
            var elmScope = element.isolateScope();
            expect(elmScope).to.have.property('name', folder.name);
            expect(elmScope).to.have.property('folder', folder);
            expect(elmScope.items).to.have.members(items);
        });

        it('should create a breadcrumbs for the folder', function() {
            expect(element[0].querySelector('[box-breadcrumbs]')).to.not.be.null;
        });

        it('should create a boxItem for each item in the folder', function() {
            $rootScope.$digest();

            var itemElms = element[0].querySelectorAll('[box-item]');
            expect(angular.element(itemElms[0]).scope()).to.have.property('item', subfolder);
            expect(angular.element(itemElms[1]).scope()).to.have.property('item', file);
        });
    });

    describe('folderView controller', function() {
        var subfolder, file, boxItemSelected, boxSdk, isolateScope;
        beforeEach(inject(function(boxFolderViewDirective, $rootScope, _boxItemSelected_, _boxSdk_, $compile) {
            boxItemSelected = _boxItemSelected_;
            boxSdk = mocks.stub(_boxSdk_);
            provide.value('boxSdk', boxSdk);
            scope = $rootScope.$new();
            var folder = {
                type: 'folder',
                name: 'All Files',
                getItems: mocks.stub()
            };
            subfolder = {
                type: 'folder',
                name: 'Subfolder',
                id: 1,
                getItems: mocks.stub()
            };
            file = {
                type: 'file',
                name: 'File in folder',
                id: 2
            };
            var items = [subfolder, file];
            boxSdk.getFolder.onFirstCall().returns(Rx.Observable.return(folder)).onSecondCall().returns(Rx.Observable.return(subfolder));
            folder.getItems.returns(Rx.Observable.fromArray(items));
            subfolder.getItems.returns(Rx.Observable.fromArray(items));

            element = angular.element('<div data-box-folder-view folder-id="0"></div>');
            compiledElement = $compile(element)(scope);
            isolateScope = element.isolateScope();
        }));

        it('should change folders when a folder item is selected', function(done) {
            boxItemSelected.selectItem(subfolder);

            boxItemSelected.selectedItem.subscribe(function() {
                expect(boxSdk.getFolder).to.have.been.calledOnce.and.to.have.been.calledWithExactly(subfolder.id);
                expect(isolateScope.folderId).to.equal(subfolder.id);
                expect(isolateScope.fileId).to.not.be.defined;
                done();
            });
        });

        it('should select the file when a file item is selected', function(done) {
            boxItemSelected.selectItem(file);

            boxItemSelected.selectedItem.subscribe(function() {
                expect(boxSdk.getFolder).not.to.have.been.called;
                expect(isolateScope.fileId).to.equal(file.id);
                expect(isolateScope.folderId).to.not.be.defined;
                done();
            });
        });
    });
});
