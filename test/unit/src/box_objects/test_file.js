/*jshint expr: true*/
describe('BoxFile', function() {
    var fileResponse = {}, file, apiUrl, uploadUrl, boxHttp, chromeDownloads, mocks, observer;
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
        inject(function(_boxHttp_, _chromeDownloads_, crypto) {
            boxHttp = mocks.stub(_boxHttp_);
            provide.value('boxHttp', boxHttp);
            chromeDownloads = mocks.stub(_chromeDownloads_);
            provide.value('chromeDownloads', chromeDownloads);
            mocks.stub(crypto, 'digest', function() {
                return Rx.Observable.return([255, 255]);
            });
            provide.value('crypto', crypto);
        });
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
    beforeEach(inject(function(BoxFile, _apiUrl_, _uploadUrl_) {
        file = new BoxFile(fileResponse);
        apiUrl = _apiUrl_;
        uploadUrl = _uploadUrl_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(fileResponse)
                .forEach(function(name) {
                    expect(file).to.have.property(name, fileResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(file).to.respondTo('url');
            expect(file.url()).to.equal(apiUrl + '/files/' + fileResponse.id);
        });
    });

    describe('download()', function() {
        it('should create a chrome download', function() {
            boxHttp.auth.returns(Rx.Observable.return('token'));
            chromeDownloads.download.returns(Rx.Observable.return(0));

            file.download().subscribe(observer);

            expect(chromeDownloads.download).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                url: apiUrl + '/files/' + fileResponse.id + '/content',
                headers: [{'Authorization': 'Bearer token'}]
            });

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(0);
        });

        it('should call http auth', function() {
            boxHttp.auth.returns(Rx.Observable.return('token'));
            chromeDownloads.download.returns(Rx.Observable.return(0));

            file.download().subscribe(observer);

            expect(boxHttp.auth).to.have.been.calledOnce.and.to.have.been.calledWithExactly();
        });

        it('should download the correct version', function() {
            var version = 4;
            boxHttp.auth.returns(Rx.Observable.return('token'));
            chromeDownloads.download.returns(Rx.Observable.return(0));

            file.download({version: version}).subscribe(observer);

            expect(chromeDownloads.download).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                url: apiUrl + '/files/' + fileResponse.id + '/content?version=' + version,
                headers: [{'Authorization': 'Bearer token'}]
            });
        });
    });

    describe('getContent()', function() {
        it('should call http get and return a blob', function() {
            boxHttp.get.returns(Rx.Observable.return(new Blob()));

            file.getContent().subscribe(observer);

            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id + '/content',
                {
                    params: undefined,
                    responseType: 'blob',
                    headers: {}
                }
            );

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new Blob());
        });

        it('should include range header if range parameter specified', function() {
            boxHttp.get.returns(Rx.Observable.return(new Blob()));

            file.getContent({}, [1, 2]).subscribe(observer);

            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id + '/content',
                {
                    params: {},
                    responseType: 'blob',
                    headers: {'Range': 'bytes=1-2'}
                }
            );

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new Blob());
        });
    });

    describe('replace()', function() {
        var filename = 'filename', content = new ArrayBuffer(100);
        beforeEach(function() {
            boxHttp.post.returns(Rx.Observable.return({
                entries: [{
                    id: fileResponse.id,
                    name: filename,
                    type: 'file'
                }]
            }));
        });

        it('should call http post', function() {
            file.replace(filename, content, 'today').subscribe(observer);

            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                uploadUrl + '/files/' + fileResponse.id + '/content',
                { headers: {'Content-MD5': 'ffff'} },
                {
                    filename: [new Blob([content]), filename],
                    content_modified_at: 'today'
                }
            );
        });

        it('should pass ifMatch header to http post', function() {
            file.replace(filename, content, 'today', true).subscribe(observer);

            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                uploadUrl + '/files/' + fileResponse.id + '/content',
                { headers: {'If-Match': fileResponse.etag, 'Content-MD5': 'ffff'} },
                {
                    filename: [new Blob([content]), filename],
                    content_modified_at: 'today'
                }
            );
        });

        it('should return a file object', function() {
            file.replace(filename, content, 'today').subscribe(observer);

            expect(observer).to.have.been.calledOnce;
            expect(observer.firstCall.args[0]).to.have.property('id', fileResponse.id);
            expect(observer.firstCall.args[0]).to.have.property('name', filename);
            expect(observer.firstCall.args[0]).to.have.property('type', 'file');
            inject(function(BoxFile) {
                expect(observer.firstCall.args[0]).to.be.an.instanceOf(BoxFile);
            });
        });
    });

    describe('getHistory()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 5,
                entries: (new Array(5)).fill(0).map(function(entry, i) {
                    return {
                        type: 'file_version',
                        id: '42' + i,
                        name: fileResponse.name
                    };
                })
            }));

            file.getHistory().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id + '/versions'
            );
        });

        it('should return file versions', function() {
            expect(observer.callCount).to.equal(5);
            inject(function(BoxFileVersion) {
                [0, 1, 2, 3, 4].forEach(function(i) {
                    var version = observer.getCall(i).args[0];
                    expect(version).to.be.an.instanceOf(BoxFileVersion);
                    expect(version).to.have.property('type', 'file_version');
                    expect(version).to.have.property('id', '42' + i);
                    expect(version).to.have.property('name', fileResponse.name);
                });
            });
        });
    });

    describe('getThumbnail()', function() {
        ['png', 'jpg', 'gif'].forEach(function(extension) {
            it('should call http get and return a blob for ' + extension, function() {
                boxHttp.get.returns(Rx.Observable.return(new Blob()));

                file.getThumbnail(extension).subscribe(observer);

                expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    apiUrl + '/files/' + fileResponse.id + '/thumbnail.' + extension,
                    {
                        params: undefined,
                        responseType: 'blob'
                    }
                );

                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new Blob());
            });
        });
    });

    describe('getComments()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 5,
                entries: (new Array(5)).fill(0).map(function(entry, i) {
                    return {
                        type: 'comment',
                        id: '42' + i
                    };
                })
            }));

            file.getComments().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id + '/comments'
            );
        });

        it('should return comments', function() {
            expect(observer.callCount).to.equal(5);
            inject(function(BoxComment) {
                [0, 1, 2, 3, 4].forEach(function(i) {
                    var version = observer.getCall(i).args[0];
                    expect(version).to.be.an.instanceOf(BoxComment);
                    expect(version).to.have.property('type', 'comment');
                    expect(version).to.have.property('id', '42' + i);
                });
            });
        });
    });

    describe('getTasks()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 5,
                entries: (new Array(5)).fill(0).map(function(entry, i) {
                    return {
                        type: 'task',
                        id: '42' + i
                    };
                })
            }));

            file.getTasks().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id + '/tasks'
            );
        });

        it('should return tasks', function() {
            expect(observer.callCount).to.equal(5);
            inject(function(BoxTask) {
                [0, 1, 2, 3, 4].forEach(function(i) {
                    var version = observer.getCall(i).args[0];
                    expect(version).to.be.an.instanceOf(BoxTask);
                    expect(version).to.have.property('type', 'task');
                    expect(version).to.have.property('id', '42' + i);
                });
            });
        });
    });

    describe('getMetadata()', function() {
        var metadata;
        beforeEach(function() {
            metadata = {
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
            boxHttp.get.returns(Rx.Observable.return(metadata));

            file.getMetadata('properties').subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id + '/metadata/properties'
            );
        });

        it('should return metadata', function() {
            expect(observer).to.have.been.calledOnce;
            inject(function(BoxMetadata) {
                var metadata = observer.firstCall.args[0];
                expect(metadata).to.be.an.instanceOf(BoxMetadata);
                expect(metadata).to.have.property('file', file);
                for(var property in metadata) {
                    if(metadata.hasOwnProperty(property)) { expect(metadata).to.have.property(property, metadata[property]); }
                }
            });
        });
    });

    describe('createMetadata()', function() {
        var metadata;
        beforeEach(function() {
            metadata = {
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
            boxHttp.post.returns(Rx.Observable.return(metadata));

            file.createMetadata('properties', metadata).subscribe(observer);
        });

        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id + '/metadata/properties',
                null,
                metadata
            );
        });

        it('should return metadata', function() {
            expect(observer).to.have.been.calledOnce;
            inject(function(BoxMetadata) {
                var metadata = observer.firstCall.args[0];
                expect(metadata).to.be.an.instanceOf(BoxMetadata);
                expect(metadata).to.have.property('file', file);
                for(var property in metadata) {
                    if(metadata.hasOwnProperty(property)) { expect(metadata).to.have.property(property, metadata[property]); }
                }
            });
        });
    });
});
