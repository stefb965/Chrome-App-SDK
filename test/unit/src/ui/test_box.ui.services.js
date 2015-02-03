/*jshint expr: true*/
describe('box.ui.services', function() {
    var mocks, scope, provide, $rootScope, observer, $compile;
    beforeEach(function() {
        mocks = sinon.sandbox.create();
        angular.module('box.conf')
            .constant('clientSecret', 'uII-----------------------------')
            .constant('clientId', 'i3p-----------------------------');
        module('box.ui', 'box.http', 'chrome.storage', function($provide) {
            provide = $provide;
        });
        observer = mocks.spy();
    });
    afterEach(function() {
        mocks.restore();
    });

    describe('boxItemSelected', function() {
        var boxItemSelected, otherObserver;
        beforeEach(inject(function(_boxItemSelected_) {
            boxItemSelected = _boxItemSelected_;
            otherObserver = mocks.spy();
        }));

        it('should provide the selected item for each subscriber', function() {
            boxItemSelected.selectedItem.subscribe(observer);
            boxItemSelected.selectedItem.subscribe(otherObserver);

            boxItemSelected.selectItem('foo');

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('foo');
            expect(otherObserver).to.have.been.calledOnce.and.to.have.been.calledWithExactly('foo');
        });

        it('should provide/replay the last selected item for each subscriber', function() {
            boxItemSelected.selectItem('bar');
            boxItemSelected.selectItem('foo');

            boxItemSelected.selectedItem.subscribe(observer);
            boxItemSelected.selectedItem.subscribe(otherObserver);

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly('foo');
            expect(otherObserver).to.have.been.calledOnce.and.to.have.been.calledWithExactly('foo');
        });
    });

    describe('boxItemPicker', function() {
        var boxItemPicker, $modal, boxItemSelected, BoxFolder, $q;
        var deferred, modal, childScope;
        beforeEach(inject(function(_$modal_) {
            $modal = mocks.stub(_$modal_);
            provide.value('$modal', $modal);
        }));
        beforeEach(inject(function(_boxItemPicker_, _$q_, _BoxFolder_, _boxItemSelected_, _$rootScope_, _$compile_) {
            boxItemPicker = _boxItemPicker_;
            $q = _$q_;
            BoxFolder = _BoxFolder_;
            boxItemSelected = _boxItemSelected_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            $compile = _$compile_;

            deferred = $q.defer();
            modal = {result: deferred.promise, close: deferred.resolve.bind(deferred), dismiss: deferred.reject.bind(deferred)};
            childScope = scope.$new();
            $modal.open.returns(modal);
            $modal.open.yieldsTo('controller', childScope);

            inject(function(boxAllFilesDirective) {
                provide.value('boxAllFilesDirective', angular.extend(boxAllFilesDirective[0], {
                    controller: angular.noop,
                    link: angular.noop,
                    template: '<span class="mock-all-files"></span>'
                }));
            });
        }));

        describe('open()', function() {
            it('should show a $modal', function() {
                var deferred = $q.defer();
                $modal.open.returns({result: deferred.promise});
                var options = {
                    foo: 'bar'
                };

                boxItemPicker.open(boxItemPicker.mode.SAVE_AS, '', options);

                expect($modal.open).to.have.been.calledOnce;
                expect($modal.open.firstCall.args[0]).to.have.property('foo', 'bar');
            });
        });

        it('should close the modal when the child scope $emits closeModal', function() {
            var folder = new BoxFolder({id: 0, name: 'folder', type: 'folder'});

            boxItemPicker.open(boxItemPicker.mode.SAVE_AS, '').subscribe(observer);
            boxItemSelected.selectItem(folder);

            $rootScope.$digest();

            childScope.$emit('closeModal');
            $rootScope.$digest();

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(folder);
        });

        it('should save selected filename on its controller $scope', function() {
            var file = {id: 1, name: 'filename', type: 'file'};

            boxItemPicker.open(boxItemPicker.mode.SAVE_AS, 'default filename').subscribe(observer);

            expect(childScope.filename).to.equal('default filename');

            boxItemSelected.selectItem(file);
            $rootScope.$digest();

            expect(childScope.filename).to.equal(file.name);
        });

        it('should show a boxAllFiles in a modal popup', function() {
            var options = {};
            var allFilesScope;
            inject(function(boxAllFilesDirective) {
                provide.value('boxAllFilesDirective', angular.extend(boxAllFilesDirective[0], {
                    controller: function($scope) { allFilesScope = $scope; }
                }));
            });

            boxItemPicker.open(boxItemPicker.mode.SAVE_AS, 'default filename', options).subscribe(observer);
            var compiled = $compile(options.template)(childScope);
            $rootScope.$digest();

            expect(allFilesScope).to.not.be.undefined;
            var allFiles = compiled[0].querySelector('.mock-all-files');
            expect(allFiles).to.not.be.null;
            var title = compiled[0].querySelector('.modal-title');
            expect(title.innerHTML).to.equal(boxItemPicker.mode.SAVE_AS);
            var input = compiled[0].querySelector('input[type=text]');
            expect(input.value).to.equal('default filename');
        });

        it('should call observer onError when Cancel button is pressed', function() {
            var errObserver = mocks.spy(), completedObserver = mocks.spy();
            var options = {};
            scope.$dismiss = function(reason) {
                deferred.reject(reason);
            };

            boxItemPicker.open(boxItemPicker.mode.SAVE_AS, 'default filename', options).subscribe(observer, errObserver, completedObserver);
            var compiled = $compile(options.template)(childScope);
            $rootScope.$digest();
            var cancelButton = compiled[0].querySelector('.btn-warning');
            angular.element(cancelButton).triggerHandler('click');
            $rootScope.$digest();

            expect(observer).to.not.have.been.called;
            expect(errObserver).to.have.been.calledOnce.and.to.have.been.calledWithExactly(undefined);
            expect(completedObserver).to.not.have.been.called;
        });

        it('should call observer onNext when OK button is pressed if an item is selected', function() {
            var errObserver = mocks.spy(), completedObserver = mocks.spy();
            var options = {};

            boxItemPicker.open(boxItemPicker.mode.SAVE_AS, 'default filename', options).subscribe(observer, errObserver, completedObserver);
            var compiled = $compile(options.template)(childScope);
            $rootScope.$digest();
            var okButton = compiled[0].querySelector('.btn-primary');
            var file = {};
            boxItemSelected.selectItem(file);
            angular.element(okButton).triggerHandler('click');
            $rootScope.$digest();

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(file);
            expect(errObserver).to.not.have.been.called;
            expect(completedObserver).to.have.been.calledOnce;
        });

        it('should call observer when OK button is pressed if an item has not been selected', function() {
            var errObserver = mocks.spy(), completedObserver = mocks.spy();
            var options = {};

            boxItemPicker.open(boxItemPicker.mode.SAVE_AS, 'default filename', options).subscribe(observer, errObserver, completedObserver);
            var compiled = $compile(options.template)(childScope);
            $rootScope.$digest();
            var okButton = compiled[0].querySelector('.btn-primary');
            angular.element(okButton).triggerHandler('click');
            $rootScope.$digest();

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({type: 'folder', id: '0', filename: 'default filename'});
            expect(errObserver).to.not.have.been.called;
            expect(completedObserver).to.have.been.calledOnce;
        });
    });
});
