/*jshint expr: true*/
describe('BoxMetadata', function() {
    var metadataResponse = {}, metadata, apiUrl, boxHttp, mocks, observer, BoxMetadata, fileResponse, file;
    beforeEach(function() {
        var provide;
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        angular.module('box.conf')
            .constant('clientSecret', 'uII-----------------------------')
            .constant('clientId', 'i3p-----------------------------');
        module('box.objects', 'box.http', 'box.auth', 'chrome.downloads', function($provide) {
            provide = $provide;
        });
        inject(function(_boxHttp_) {
            boxHttp = mocks.stub(_boxHttp_);
            provide.value('boxHttp', boxHttp);
        });
        metadataResponse = {
            "$id":"c79896a0-a33f-11e3-a5e2-0800200c9a66",
            "$type": "properties",
            "$parent": "file_552345101",
            "client_number": "820183",
            "client_name": "Biomedical Corp",
            "case_reference": "A83JAA",
            "case_type": "Employment Litigation",
            "assigned_attorney": "Francis Burke",
            "case_status": "in-progress"
        };
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
    });
    beforeEach(inject(function(_BoxMetadata_, _apiUrl_, _BoxFile_) {
        BoxMetadata = _BoxMetadata_;
        file = new _BoxFile_(fileResponse);
        metadata = new BoxMetadata(file, metadataResponse);
        apiUrl = _apiUrl_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(metadataResponse)
                .forEach(function(name) {
                    expect(metadata).to.have.property(name, metadataResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(metadata).to.respondTo('url');
            expect(metadata.url()).to.equal(apiUrl + '/files/' + fileResponse.id + '/metadata/' + metadataResponse.$type);
        });
    });

    describe('startUpdate()', function() {
        it('should return a MetadataUpdate object that has an empty ops array', function() {
            var update = metadata.startUpdate();
            expect(update.ops).to.be.empty;
        });
    });

    describe('delete', function() {
        beforeEach(function() {
            boxHttp.delete.returns(Rx.Observable.return({}));
            metadata.delete().subscribe(observer);
        });
        it('should call http delete', function() {
            expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(metadata.url());
        });

        it('should return an empty response', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
        });
    });

    describe('sendUpdate()', function() {
        var update;
        beforeEach(function() {
            update = {ops: ['hello']};
            boxHttp.put.returns(Rx.Observable.return(metadataResponse));
            metadata.sendUpdate(update).subscribe(observer);
        });
        it('should call http put', function() {
            expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                metadata.url(),
                {
                    headers: {'Content-Type': 'application/json-patch+json'}
                },
                update.ops
            );
        });

        it('should return a new BoxMetadata containing the updated properties', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(metadata);
        });
    });

    describe('MetadataUpdate', function() {
        var metadataUpdate, dummyOp;
        beforeEach(function() {
            metadataUpdate = metadata.startUpdate();
            dummyOp = {
                op: 'dummy',
                path: '/path',
                value: 'value'
            };
            metadataUpdate.ops.push(dummyOp);
        });

        describe('add()', function() {
            it('should add a new op of type add', function() {
                var path = '/new/path', value = 'new value';
                metadataUpdate.add(path, value);
                expect(metadataUpdate.ops).to.have.deep.members([dummyOp, {op: 'add', path: path, value: value}]);
            });
        });

        describe('replace()', function() {
            it('should add a new op of type replace', function() {
                var path = '/new/path', value = 'new value';
                metadataUpdate.replace(path, value);
                expect(metadataUpdate.ops).to.have.deep.members([dummyOp, {op: 'replace', path: path, value: value}]);
            });

            it('should add a new op of type test and one of type replace', function() {
                var path = '/new/path', value = 'new value', oldValue = 'old value';
                metadataUpdate.replace(path, value, oldValue);
                expect(metadataUpdate.ops).to.have.deep.members([dummyOp, {op: 'test', path: path, value: oldValue}, {op: 'replace', path: path, value: value}]);
            });
        });

        describe('remove()', function() {
            it('should add a new op of type add', function() {
                var path = '/new/path';
                metadataUpdate.remove(path);
                expect(metadataUpdate.ops).to.have.deep.members([dummyOp, {op: 'remove', path: path}]);
            });

            it('should add a new op of type test and one of type remove', function() {
                var path = '/new/path', oldValue = 'old value';
                metadataUpdate.remove(path, oldValue);
                expect(metadataUpdate.ops).to.have.deep.members([dummyOp, {op: 'test', path: path, value: oldValue}, {op: 'remove', path: path}]);
            });
        });

        describe('test()', function() {
            it('should add a new op of type test', function() {
                var path = '/new/path', value = 'new value';
                metadataUpdate.test(path, value);
                expect(metadataUpdate.ops).to.have.deep.members([dummyOp, {op: 'test', path: path, value: value}]);
            });
        });
    });
});
