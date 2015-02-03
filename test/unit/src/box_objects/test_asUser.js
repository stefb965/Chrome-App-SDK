describe('As-User', function() {
    var mocks, observer, chromeStorage, momentStub, http, apiUrl;
    var BoxFolder, BoxFile, BoxUser, user, folder;
    var clientId = 'i3p-----------------------------',
        clientSecret = 'uII-----------------------------';
    beforeEach(function() {
        var provide;
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        angular.module('box.conf')
            .constant('clientSecret', clientSecret)
            .constant('clientId', clientId);
        module('box.objects', 'box.http', 'rx.http', 'box.auth', 'chrome.storage', 'moment', function($provide) {
            provide = $provide;
        });
        inject(function(_chromeStorage_, _http_) {
            chromeStorage = mocks.stub(_chromeStorage_);
            provide.value('chromeStorage', chromeStorage);
            http = mocks.stub(_http_);
            provide.value('http', http);
            momentStub = mocks.stub();
            provide.value('moment', momentStub);
        });
    });
    beforeEach(inject(function(_apiUrl_, _BoxFolder_, _BoxFile_, _BoxUser_) {
        apiUrl = _apiUrl_;
        BoxFolder = _BoxFolder_;
        BoxFile = _BoxFile_;
        BoxUser = _BoxUser_;
        user = new BoxUser({
            "type": "user",
            "id": "17738362",
            "name": "sean rose",
            "login": "sean@box.com",
            "created_at": "2012-03-26T15:43:07-07:00",
            "modified_at": "2012-12-12T11:34:29-08:00",
            "language": "en",
            "space_amount": 5368709120,
            "space_used": 2377016,
            "max_upload_size": 262144000,
            "status": "active",
            "job_title": "Employee",
            "phone": "5555555555",
            "address": "555 Office Drive",
            "avatar_url": "https://www.box.com/api/avatar/large/17738362"
        });
        folder = new BoxFolder({
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
        });
    }));
    afterEach(function() {
        mocks.restore();
    });
    describe('asUser()', function() {
        var folderAsUser;
        beforeEach(function() {
            folderAsUser = folder.asUser(user);
        });
        var moment, yesterdayMoment;
        beforeEach(function() {
            moment = {add: mocks.spy(), toDate: mocks.stub(), isAfter: mocks.stub()};
            yesterdayMoment = mocks.spy();
            momentStub.withArgs('yesterday').returns(yesterdayMoment);
            momentStub.returns(moment);
            chromeStorage.getLocal.withArgs('access_token').returns(Rx.Observable.return({
                token: 'access_token',
                expires_at: 'yesterday'
            }));
            chromeStorage.setLocal.returns(Rx.Observable.return({}));
            moment.isAfter.withArgs(yesterdayMoment).returns(false);
        });
        it('should return a copy of the box object with a boxHttp proxy', function() {
            Object.getOwnPropertyNames(folder)
                .forEach(function(name) {
                    if (name === 'boxHttp') { expect(folderAsUser.boxHttp.defaultHeaders).to.have.property('As-User', user.id); }
                    else { expect(folderAsUser).to.have.property(name, folder[name]); }
                });
        });

        it('should make requests with the As-User header', function() {
            http.getObservable.returns(Rx.Observable.return({
                data: {
                    total_count: 2,
                    entries: [{type: 'file'}, {type: 'folder'}]
                }
            }));

            var fields = 'fields';

            folderAsUser.getItems(fields).subscribe(observer);

            expect(observer).to.have.been.calledTwice
                .and.to.have.been.calledWithExactly(new BoxFile({type: 'file'}))
                .and.to.have.been.calledWithExactly(new BoxFolder({type: 'folder'}));
            expect(http.getObservable).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                'GET',
                apiUrl + '/folders/' + folder.id + '/items',
                {
                    params: {
                        limit: 20,
                        offset: 0,
                        fields: fields
                    },
                    headers: {
                        'As-User': user.id,
                        Authorization: 'Bearer access_token'
                    }
                },
                undefined
            );
        });

        it('should not affect other requests', function() {
            http.getObservable.returns(Rx.Observable.return({
                data: {
                    total_count: 2,
                    entries: [{type: 'file'}, {type: 'folder'}]
                }
            }));

            var fields = 'fields';

            folder.getItems(fields).subscribe(observer);

            expect(observer).to.have.been.calledTwice
                .and.to.have.been.calledWithExactly(new BoxFile({type: 'file'}))
                .and.to.have.been.calledWithExactly(new BoxFolder({type: 'folder'}));
            expect(http.getObservable).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                'GET',
                apiUrl + '/folders/' + folder.id + '/items',
                {
                    params: {
                        limit: 20,
                        offset: 0,
                        fields: fields
                    },
                    headers: {
                        Authorization: 'Bearer access_token'
                    }
                },
                undefined
            );
        });
    });
});
