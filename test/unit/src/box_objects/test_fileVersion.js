/*jshint expr: true*/
describe('BoxFileVersion', function() {
    var fileVersionResponse = {}, fileVersion, fileResponse, file, apiUrl, boxHttp, mocks, observer, BoxFileVersion, chromeDownloads;
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
        inject(function(_boxHttp_, _chromeDownloads_) {
            boxHttp = mocks.stub(_boxHttp_);
            provide.value('boxHttp', boxHttp);
            chromeDownloads = mocks.stub(_chromeDownloads_);
            provide.value('chromeDownloads', chromeDownloads);
        });
        fileVersionResponse = {
            "type": "file_version",
            "id": "871399",
            "sha1": "12039d6dd9a7e6eefc78846802e",
            "name": "Stark Family Lineage.doc",
            "size": 11,
            "created_at": "2013-11-20T13:20:50-08:00",
            "modified_at": "2013-11-20T13:26:48-08:00",
            "modified_by": {
                "type": "user",
                "id": "13711334",
                "name": "Eddard Stark",
                "login": "ned@winterfell.com"
            }
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
    beforeEach(inject(function(_BoxFileVersion_, _apiUrl_, _BoxFile_) {
        BoxFileVersion = _BoxFileVersion_;
        file = new _BoxFile_(fileResponse);
        fileVersion = new BoxFileVersion(file, fileVersionResponse);
        apiUrl = _apiUrl_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(fileVersionResponse)
                .forEach(function(name) {
                    expect(fileVersion).to.have.property(name, fileVersionResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(fileVersion).to.respondTo('url');
            expect(fileVersion.url()).to.equal(apiUrl + '/files/' + file.id + '/versions');
        });
    });

    describe('promoteToCurrent()', function() {
        beforeEach(function() {
            boxHttp.post.returns(Rx.Observable.return(fileVersionResponse));
            fileVersion.promoteToCurrent().subscribe(observer);
        });
        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(fileVersion.url() + '/current', null, {
                type: 'file_version',
                id: fileVersionResponse.id
            });
        });

        it('should return the updated BoxFileVersion', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(fileVersion);
        });
    });

    describe('delete()', function() {
        beforeEach(function() {
            boxHttp.delete.returns(Rx.Observable.return({}));
            fileVersion.delete().subscribe(observer);
        });

        it('should call http delete', function() {
            expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(fileVersion.url() + '/' + fileVersionResponse.id);
        });

        it('should return an empty response', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
        });
    });

    describe('download()', function() {
        beforeEach(function() {
            boxHttp.auth.returns(Rx.Observable.return('token'));
            chromeDownloads.download.returns(Rx.Observable.return(0));

            fileVersion.download().subscribe(observer);
        });

        it('should create a chrome download', function() {
            expect(chromeDownloads.download).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                url: apiUrl + '/files/' + fileResponse.id + '/content?version=' + fileVersionResponse.id,
                headers: [{'Authorization': 'Bearer token'}]
            });

            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(0);
        });

        it('should call http auth', function() {
            expect(boxHttp.auth).to.have.been.calledOnce.and.to.have.been.calledWithExactly();
        });
    });
});
