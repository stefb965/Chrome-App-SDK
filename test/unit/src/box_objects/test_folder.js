/*jshint expr: true*/
describe('BoxFolder', function() {
    var folderResponse = {}, folder, apiUrl, uploadUrl, boxHttp, mocks, observer, BoxCollaboration;

    beforeEach(function() {
        var provide;
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        angular.module('box.conf')
            .constant('clientSecret', 'uII-----------------------------')
            .constant('clientId', 'i3p-----------------------------');
        module('box.objects', 'box.http', 'box.auth', function($provide) {
            provide = $provide;
        });
        inject(function(_boxHttp_, crypto) {
            boxHttp = mocks.stub(_boxHttp_);
            provide.value('boxHttp', boxHttp);
            mocks.stub(crypto, 'digest', function() {
                return Rx.Observable.return([255, 255]);
            });
            provide.value('crypto', crypto);
        });
        folderResponse = {
            "type": "folder",
            "id": "11446498",
            "sequence_id": "1",
            "etag": "1",
            "name": "Pictures",
            "created_at": "2012-12-12T10:53:43-08:00",
            "modified_at": "2012-12-12T11:15:04-08:00",
            "description": "Some pictures I took",
            "size": 629644,
            "path_collection": {
                "total_count": 1,
                "entries": [
                    {
                        "type": "folder",
                        "id": "0",
                        "sequence_id": null,
                        "etag": null,
                        "name": "All Files"
                    }
                ]
            },
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
                "url": "https://www.box.com/s/vspke7y05sb214wjokpk",
                "download_url": "https://www.box.com/shared/static/vspke7y05sb214wjokpk",
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
            "folder_upload_email": {
                "access": "open",
                "email": "upload.Picture.k13sdz1@u.box.com"
            },
            "parent": {
                "type": "folder",
                "id": "0",
                "sequence_id": null,
                "etag": null,
                "name": "All Files"
            },
            "item_status": "active",
            "item_collection": {
                "total_count": 1,
                "entries": [
                    {
                        "type": "file",
                        "id": "5000948880",
                        "sequence_id": "3",
                        "etag": "3",
                        "sha1": "134b65991ed521fcfe4724b7d814ab8ded5185dc",
                        "name": "tigers.jpeg"
                    }
                ],
                "offset": 0,
                "limit": 100
            }
        };
    });
    beforeEach(inject(function(BoxFolder, _apiUrl_, _uploadUrl_, _BoxCollaboration_) {
        folder = new BoxFolder(folderResponse);
        apiUrl = _apiUrl_;
        uploadUrl = _uploadUrl_;
        BoxCollaboration = _BoxCollaboration_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(folderResponse)
                .forEach(function(name) {
                    expect(folder).to.have.property(name, folderResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(folder).to.respondTo('url');
            expect(folder.url()).to.equal(apiUrl + '/folders/' + folderResponse.id);
        });
    });

    describe('getItems()', function() {
        var fields = 'fields';
        it('should make http get request', function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 0,
                entries: []
            }));

            folder.getItems(fields).subscribe(observer);

            expect(observer).to.not.have.been.called;

            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/folders/' + folderResponse.id + '/items',
                {
                    params: {
                        fields: fields,
                        limit: 20,
                        offset: 0
                    }
                }
            );
        });
        it('should return a file and a folder', function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 2,
                entries: [{type: 'file'}, {type: 'folder'}]
            }));

            folder.getItems(fields).subscribe(observer);

            expect(observer).to.have.been.calledTwice;
            inject(function(BoxFolder, BoxFile) {
                expect(observer.firstCall.args[0]).to.be.an.instanceOf(BoxFile).and.to.have.property('type', 'file');
                expect(observer.secondCall.args[0]).to.be.an.instanceOf(BoxFolder).and.to.have.property('type', 'folder');
            });

            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/folders/' + folderResponse.id + '/items',
                {
                    params: {
                        fields: fields,
                        limit: 20,
                        offset: 0
                    }
                }
            );
        });
        it('should make multiple http get requests for large folders', function() {
            boxHttp.get
                .onFirstCall().returns(Rx.Observable.defer(function() {return Rx.Observable.return({
                    total_count: 24,
                    entries: (new Array(20)).fill(0).map(function(entry, i) { return i % 2 ? {type: 'file'} : {type: 'folder'}; })
                }); }))
                .onSecondCall().returns(Rx.Observable.defer(function() {return Rx.Observable.return({
                    total_count: 24,
                    entries: (new Array(4)).fill(0).map(function(entry, i) { return i % 2 ? {type: 'file'} : {type: 'folder'}; })
                }); }));

            folder.getItems(fields).subscribe(observer);

            expect(observer.callCount).to.equal(24);
            inject(function(BoxFolder, BoxFile) {
                for (var i = 0; i < 2; i += 2) {
                    expect(observer.getCall(i).args[0]).to.be.an.instanceOf(BoxFolder).and.to.have.property('type', 'folder');
                    expect(observer.getCall(i + 1).args[0]).to.be.an.instanceOf(BoxFile).and.to.have.property('type', 'file');
                }
            });

            expect(boxHttp.get).to.have.been.calledTwice;
            expect(boxHttp.get.firstCall).to.have.been.calledWithExactly(
                apiUrl + '/folders/' + folderResponse.id + '/items',
                {
                    params: {
                        fields: fields,
                        limit: 20,
                        offset: 0
                    }
                }
            );
            expect(boxHttp.get.secondCall).to.have.been.calledWithExactly(
                apiUrl + '/folders/' + folderResponse.id + '/items',
                {
                    params: {
                        fields: fields,
                        limit: 20,
                        offset: 20
                    }
                }
            );
        });
    });

    describe('createSubfolder()', function() {
        var subFolderName = 'subfolder';
        beforeEach(function() {
            boxHttp.post.returns(Rx.Observable.return({
                type: 'folder',
                id: '9',
                name: subFolderName,
                path_collection: {
                    total_count: 1,
                    entries: [folderResponse]
                }
            }));
        });

        it('should call http post', function() {
            folder.createSubfolder(subFolderName).subscribe(observer);

            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/folders',
                null,
                {
                    name: subFolderName,
                    parent: {id: folderResponse.id}
                }
            );
        });

        it('should return the new folder', function() {
            folder.createSubfolder(subFolderName).subscribe(observer);

            expect(observer).to.have.been.calledOnce;
            var subFolder = observer.args[0][0];
            expect(subFolder).to.have.property('name', subFolderName);
            expect(subFolder).to.have.property('id', '9');
            expect(subFolder).to.have.property('type', 'folder');
            expect(subFolder).to.have.deep.property('path_collection.entries[0]', folderResponse);
            inject(function(BoxFolder) {
                expect(subFolder).to.be.an.instanceOf(BoxFolder);
            });
        });
    });

    describe('getCollaborations()', function() {
        it('should call http get', function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 0,
                entries: []
            }));

            folder.getCollaborations().subscribe(observer);

            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/folders/' + folderResponse.id + '/collaborations'
            );
        });

        it('should not have any observations for no collabs', function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 0,
                entries: []
            }));

            folder.getCollaborations().subscribe(observer);

            expect(observer).to.not.have.been.called;
        });

        it('should return the set of collaborations', function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 2,
                entries: [{type: 'collaboration', id: '1'}, {type: 'collaboration', id: '2'}]
            }));

            folder.getCollaborations().subscribe(observer);

            expect(observer).to.have.been.calledTwice;
            inject(function(BoxCollaboration) {
                expect(observer.firstCall.args[0]).to.be.an.instanceOf(BoxCollaboration).and.to.have.property('id', '1');
                expect(observer.secondCall.args[0]).to.be.an.instanceOf(BoxCollaboration).and.to.have.property('id', '2');
            });
        });
    });

    describe('addCollaboration()', function() {
        var collaborationResponse, collaborator, role, notify;
        beforeEach(function() {
            collaborationResponse = {
                "type": "collaboration",
                "id": "791293",
                "created_by": {
                    "type": "user",
                    "id": "17738362",
                    "name": "sean rose",
                    "login": "sean@box.com"
                },
                "created_at": "2012-12-12T10:54:37-08:00",
                "modified_at": "2012-12-12T11:30:43-08:00",
                "expires_at": null,
                "status": "accepted",
                "accessible_by": {
                    "type": "user",
                    "id": "18203124",
                    "name": "sean",
                    "login": "sean+test@box.com"
                },
                "role": "editor",
                "acknowledged_at": "2012-12-12T11:30:43-08:00",
                "item": {
                    "type": "folder",
                    "id": "11446500",
                    "sequence_id": "0",
                    "etag": "0",
                    "name": "Shared Pictures"
                }
            };
            collaborationResponse.item.id = folderResponse.id;
            collaborator = {
                "type": "user",
                "id": "18203124",
                "name": "sean",
                "login": "sean+test@box.com"
            };
            role = 'editor';
            notify = true;

            boxHttp.post.returns(Rx.Observable.return(collaborationResponse));
            folder.addCollaboration(role, collaborator, notify).subscribe(observer);
        });
        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/collaborations',
                {notify: notify},
                {
                    item: {
                        id: folder.id,
                        type: folder.type
                    },
                    accessible_by: collaborator,
                    role: role
                }
            );
        });

        it('should return a BoxCollaboration', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxCollaboration(collaborationResponse));
        });
    });

    describe('uploadFileTo()', function() {
        var filename = 'filename', content = new ArrayBuffer(100);
        beforeEach(function() {
            boxHttp.post.returns(Rx.Observable.return({
                entries: [{
                    id: '1',
                    name: filename,
                    type: 'file'
                }]
            }));

            folder.uploadFileTo(filename, content, 'yesterday', 'today').subscribe(observer);
        });
        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                uploadUrl + '/files/content',
                { headers: {'Content-MD5': 'ffff'} },
                {
                    filename: [new Blob([content]), filename],
                    parent_id: folderResponse.id,
                    content_created_at: 'yesterday',
                    content_modified_at: 'today'
                }
            );
        });

        it('should return a file object', function() {
            expect(observer).to.have.been.calledOnce;
            expect(observer.firstCall.args[0]).to.have.property('id', '1');
            expect(observer.firstCall.args[0]).to.have.property('name', filename);
            expect(observer.firstCall.args[0]).to.have.property('type', 'file');
            inject(function(BoxFile) {
                expect(observer.firstCall.args[0]).to.be.an.instanceOf(BoxFile);
            });
        });
    });
});
