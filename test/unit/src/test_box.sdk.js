/*jshint expr: true*/
describe('box.sdk', function() {
    var mocks, boxHttp, boxSdk, observer, chromeStorage, boxApiAuth, apiUrl, authUrl, http, $timeout = angular.noop;
    var BoxFile, BoxFolder, BoxGroup, BoxTask, BoxUser, BoxCollaboration, BoxEvent;
    var fileResponse, folderResponse, file, folder;
    var clientId = 'i3p-----------------------------',
        clientSecret = 'uII-----------------------------';
    var provide;
    beforeEach(function() {
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        angular.module('box.conf')
            .constant('clientSecret', clientSecret)
            .constant('clientId', clientId);
        module('box.sdk', 'box.http', 'box.objects', 'rx.http', 'box.auth', 'chrome.storage', function($provide) {
            provide = $provide;
        });
        inject(function(_boxHttp_, _chromeStorage_, _boxApiAuth_, _http_) {
            boxHttp = mocks.stub(_boxHttp_);
            provide.value('boxHttp', boxHttp);
            chromeStorage = mocks.stub(_chromeStorage_);
            provide.value('chromeStorage', chromeStorage);
            boxApiAuth = mocks.stub(_boxApiAuth_);
            provide.value('boxApiAuth', boxApiAuth);
            http = mocks.stub(_http_);
            provide.value('http', http);
            provide.value('$timeout', function() { $timeout.apply(this, Array.prototype.slice.call(arguments)); });
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
    beforeEach(inject(function(_boxSdk_, _apiUrl_, _authUrl_, _BoxFile_, _BoxFolder_, _BoxGroup_, _BoxTask_, _BoxUser_, _BoxCollaboration_, _BoxEvent_) {
        boxSdk = _boxSdk_;
        apiUrl = _apiUrl_;
        authUrl = _authUrl_;
        BoxFile = _BoxFile_;
        BoxFolder = _BoxFolder_;
        BoxGroup = _BoxGroup_;
        BoxTask = _BoxTask_;
        BoxUser = _BoxUser_;
        BoxCollaboration = _BoxCollaboration_;
        BoxEvent = _BoxEvent_;
        file = new BoxFile(fileResponse);
        folder = new BoxFolder(folderResponse);
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('logout()', function() {
        it('should remove stored tokens and revoke the token', function() {
            var postReturn = 'deleted';
            chromeStorage.getLocal.returns(Rx.Observable.return({
                token: 'refresh_token'
            }));
            chromeStorage.removeLocal.returns(Rx.Observable.return({}));
            http.request.returns(Rx.Observable.return(postReturn));

            boxSdk.logout().subscribe(observer);

            expect(chromeStorage.getLocal).to.have.been.calledOnce.and.to.have.been.calledWithExactly('refresh_token');
            expect(chromeStorage.removeLocal).to.have.been.calledTwice
                .and.to.have.been.calledWithExactly('access_token')
                .and.to.have.been.calledWithExactly('refresh_token');
            expect(http.request).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                'POST',
                authUrl + '/revoke',
                null,
                {
                    client_id: clientId,
                    client_secret: clientSecret,
                    token: 'refresh_token'
                }
            );
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(postReturn);
        });
    });

    describe('getFolder()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(folderResponse));
            boxSdk.getFolder(folderResponse.id).subscribe(observer);
        });
        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/folders/' + folderResponse.id
            );
        });

        it('should return a BoxFolder', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(folder);
        });
    });

    describe('getFile()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(fileResponse));
            boxSdk.getFile(fileResponse.id).subscribe(observer);
        });
        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id
            );
        });

        it('should return a BoxFolder', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(file);
        });
    });

    describe('getTrashedFolder()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(folderResponse));
            boxSdk.getTrashedFolder(folderResponse.id).subscribe(observer);
        });
        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/folders/' + folderResponse.id + '/trash'
            );
        });

        it('should return a BoxFolder', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(folder);
        });
    });

    describe('getTrashedFile()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(fileResponse));
            boxSdk.getTrashedFile(fileResponse.id).subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/files/' + fileResponse.id + '/trash'
            );
        });

        it('should return a BoxFolder', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(file);
        });
    });

    describe('getTrashedItems()', function() {
        var fields = '';
        beforeEach(function() {
            boxHttp.get
                .onFirstCall().returns(Rx.Observable.defer(function() {return Rx.Observable.return({
                    total_count: 24,
                    entries: (new Array(20)).fill(0).map(function(entry, i) { return i % 2 ? fileResponse : folderResponse; })
                }); }))
                .onSecondCall().returns(Rx.Observable.defer(function() {return Rx.Observable.return({
                    total_count: 24,
                    entries: (new Array(4)).fill(0).map(function(entry, i) { return i % 2 ? fileResponse : folderResponse; })
                }); }));
            boxSdk.getTrashedItems(fields).subscribe(observer);
        });

        it('should call http get twice', function() {
            expect(boxHttp.get).to.have.been.calledTwice
                .and.to.have.been.calledWithExactly(apiUrl + '/folders/trash/items', {fields: fields, limit: 20, offset: 0})
                .and.to.have.been.calledWithExactly(apiUrl + '/folders/trash/items', {fields: fields, limit: 20, offset: 20});
        });

        it('should return BoxFolders and BoxFiles', function() {
            expect(observer).to.have.been.calledWithExactly(file)
                .and.to.have.been.calledWithExactly(folder)
                .and.to.have.property('callCount', 24);
        });
    });

    describe('getPendingCollaborations()', function() {
        var pendingCollabResponse = {
            "total_count": 1,
            "entries": [
                {
                    "type": "collaboration",
                    "id": "27513888",
                    "created_by": {
                        "type": "user",
                        "id": "11993747",
                        "name": "sean",
                        "login": "sean@box.com"
                    },
                    "created_at": "2012-10-17T23:14:42-07:00",
                    "modified_at": "2012-10-17T23:14:42-07:00",
                    "expires_at": null,
                    "status": "Pending",
                    "accessible_by": {
                        "type": "user",
                        "id": "181216415",
                        "name": "sean rose",
                        "login": "sean+awesome@box.com"
                    },
                    "role": "Editor",
                    "acknowledged_at": null,
                    "item": null
                }
            ]
        };
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(pendingCollabResponse));
            boxSdk.getPendingCollaborations().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(apiUrl + '/collaborations?pending');
        });

        it('should return call the subscriber with a BoxCollaboration', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWith(new BoxCollaboration(pendingCollabResponse.entries[0]));
        });
    });

    describe('search()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return({
                total_count: 2,
                entries: [
                    file,
                    folder
                ]
            }));
            boxSdk.search('foo', {scope: 'user_content'}).subscribe(observer);
        });
        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/search',
                {
                    params: {
                        query: 'foo',
                        limit: 20,
                        offset: 0,
                        scope: 'user_content'
                    }
                }
            );
        });

        it('should return various box items', function() {
            expect(observer).to.have.been.calledTwice
                .and.to.have.been.calledWithExactly(file)
                .and.to.have.been.calledWithExactly(folder);
        });
    });

    describe('createTask()', function() {
        var taskResponse, params;
        beforeEach(function() {
            taskResponse = {
                "type": "task",
                "id": "1839355",
                "item": {
                    "type": "file",
                    "id": "7287087200",
                    "sequence_id": "0",
                    "etag": "0",
                    "sha1": "0bbd79a105c504f99573e3799756debba4c760cd",
                    "name": "box-logo.png"
                },
                "due_at": "2014-04-03T11:09:43-07:00",
                "action": "review",
                "message": "REVIEW PLZ K THX",
                "task_assignment_collection": {
                    "total_count": 0,
                    "entries": []
                },
                "is_completed": false,
                "created_by": {
                    "type": "user",
                    "id": "11993747",
                    "name": "☁ sean ☁",
                    "login": "sean@box.com"
                },
                "created_at": "2013-04-03T11:12:54-07:00"
            };
            taskResponse.item.id = fileResponse.id;
            params = {
                action: 'review'
            };

            boxHttp.post.returns(Rx.Observable.return(taskResponse));
            boxSdk.createTask(file, params).subscribe(observer);
        });
        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/tasks',
                null,
                {
                    item: {
                        id: file.id,
                        type: file.type
                    },
                    action: 'review'
                }
            );
        });

        it('should return a BoxTask', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxTask(taskResponse));
        });
    });

    describe('getUserInfo()', function() {
        var userResponse;
        beforeEach(function() {
            userResponse = {
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
            };

            boxHttp.get.returns(Rx.Observable.return(userResponse));
            boxSdk.getUserInfo(fileResponse.id).subscribe(observer);
        });
        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                apiUrl + '/users/me'
            );
        });

        it('should return a BoxUser', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxUser(userResponse));
        });
    });

    describe('getUsers()', function() {
        var usersResponse, filter;
        beforeEach(function() {
            usersResponse = {
                "total_count": 1,
                "entries": [
                    {
                        "type": "user",
                        "id": "181216415",
                        "name": "sean rose",
                        "login": "sean+awesome@box.com",
                        "created_at": "2012-05-03T21:39:11-07:00",
                        "modified_at": "2012-08-23T14:57:48-07:00",
                        "language": "en",
                        "space_amount": 5368709120,
                        "space_used": 52947,
                        "max_upload_size": 104857600,
                        "status": "active",
                        "job_title": "",
                        "phone": "5555551374",
                        "address": "10 Cloud Way Los Altos CA",
                        "avatar_url": "https://api.box.com/api/avatar/large/181216415"
                    }
                ]
            };
            filter = 'sean';
            boxHttp.get.returns(Rx.Observable.return(usersResponse));
            boxSdk.getUsers(filter).subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(apiUrl + '/users', {params: {filter_term: filter, limit: 20, offset: 0}});
        });

        it('should return a BoxGroup', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWith(new BoxUser(usersResponse.entries[0]));
        });
    });

    describe('createUser()', function() {
        var params, userResponse;
        beforeEach(function() {
            userResponse = {
                "type": "user",
                "id": "187273718",
                "name": "Ned Stark",
                "login": "eddard@box.com",
                "created_at": "2012-11-15T16:34:28-08:00",
                "modified_at": "2012-11-15T16:34:29-08:00",
                "role": "user",
                "language": "en",
                "space_amount": 5368709120,
                "space_used": 0,
                "max_upload_size": 2147483648,
                "tracking_codes": [],
                "can_see_managed_users": true,
                "is_sync_enabled": true,
                "status": "active",
                "job_title": "",
                "phone": "555-555-5555",
                "address": "555 Box Lane",
                "avatar_url": "https://www.box.com/api/avatar/large/187273718",
                "is_exempt_from_device_limits": false,
                "is_exempt_from_login_verification": false
            };
            params = {
                "name": "Ned Stark",
                "login": "eddard@box.com"
            };
            boxHttp.post.returns(Rx.Observable.return(userResponse));
            boxSdk.createUser(params).subscribe(observer);
        });

        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(apiUrl + '/users', null, params);
        });

        it('should return a BoxUser', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWith(new BoxUser(userResponse));
        });
    });

    describe('getGroups()', function() {
        var groupsResponse;
        beforeEach(function() {
            groupsResponse = {
                "total_count": 1,
                "entries": [
                    {
                        "type": "group",
                        "id": "1786931",
                        "name": "friends"
                    }
                ],
                "limit": 100,
                "offset": 0
            };
            boxHttp.get.returns(Rx.Observable.return(groupsResponse));
            boxSdk.getGroups().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(apiUrl + '/groups');
        });

        it('should return a BoxGroup', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWith(new BoxGroup(groupsResponse.entries[0]));
        });
    });

    describe('createGroup()', function() {
        var name, groupResponse;
        beforeEach(function() {
            groupResponse = {
                "type": "group",
                "id": "119720",
                "name": "family",
                "created_at": "2013-05-16T15:27:57-07:00",
                "modified_at": "2013-05-16T15:27:57-07:00"
            };
            name = 'family';
            boxHttp.post.returns(Rx.Observable.return(groupResponse));
            boxSdk.createGroup(name).subscribe(observer);
        });

        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(apiUrl + '/groups', null, {name: name});
        });

        it('should return a BoxGroup', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWith(new BoxGroup(groupResponse));
        });
    });

    describe('subscribeToEvents()', function() {
        var nextStreamPosition, eventsUrl, eventResponse;

        beforeEach(function() {
            nextStreamPosition = 1;
            eventsUrl = 'https://realtime.box.net/event/url';
            eventResponse = {
                "type": "event",
                "event_id": "f82c3ba03e41f7e8a7608363cc6c0390183c3f83",
                "created_by": {
                    "type": "user",
                    "id": "17738362",
                    "name": "sean rose",
                    "login": "sean@box.com"
                },
                "created_at": "2012-12-12T10:53:43-08:00",
                "recorded_at": "2012-12-12T10:53:48-08:00",
                "event_type": "ITEM_CREATE",
                "session_id": "70090280850c8d2a1933c1",
                "source": {
                    "type": "folder",
                    "id": "11446498",
                    "sequence_id": "0",
                    "etag": "0",
                    "name": "Pictures",
                    "created_at": "2012-12-12T10:53:43-08:00",
                    "modified_at": "2012-12-12T10:53:43-08:00",
                    "description": null,
                    "size": 0,
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
                    "shared_link": null,
                    "parent": {
                        "type": "folder",
                        "id": "0",
                        "sequence_id": null,
                        "etag": null,
                        "name": "All Files"
                    },
                    "item_status": "active",
                    "synced": false
                }
            };
        });

        afterEach(function() {
            $timeout = angular.noop;
        });

        it('should get streamPosition now if streamPosition is not passed to subscribe', function() {
            boxHttp.get.withArgs(apiUrl + '/events?stream_position=now').returns(Rx.Observable.return({
                'next_stream_position': nextStreamPosition
            }));
            boxHttp.options.withArgs(apiUrl + '/events').returns(Rx.Observable.return({'entries': [
                {url: eventsUrl}
            ]}));
            boxHttp.get.withArgs(eventsUrl + '&stream_position=' + nextStreamPosition).returns(Rx.Observable.empty());

            boxSdk.subscribeToEvents().subscribe(observer);

            expect(boxHttp.get).to.have.been.called
                .and.to.have.been.calledWithExactly(apiUrl + '/events?stream_position=now')
                .and.to.have.been.calledWithExactly(eventsUrl + '&stream_position=' + nextStreamPosition);
            expect(boxHttp.options).to.have.been.called.and.to.have.been.calledWithExactly(apiUrl + '/events');
        });

        it('should use the passed streamPosition if passed', function() {
            boxHttp.options.withArgs(apiUrl + '/events').returns(Rx.Observable.return({'entries': [
                {url: eventsUrl}
            ]}));
            boxHttp.get.withArgs(eventsUrl + '&stream_position=' + nextStreamPosition).returns(Rx.Observable.empty());

            boxSdk.subscribeToEvents(nextStreamPosition).subscribe(observer);

            expect(boxHttp.get).to.have.been.called
                .and.to.have.been.calledWithExactly(eventsUrl + '&stream_position=' + nextStreamPosition);
            expect(boxHttp.options).to.have.been.called.and.to.have.been.calledWithExactly(apiUrl + '/events');
        });

        it('should reconnect when receiving the reconnect message', function(done) {
            boxHttp.options.withArgs(apiUrl + '/events').returns(Rx.Observable.return({'entries': [
                {url: eventsUrl, retry_timeout: 1}
            ]}));
            boxHttp.get.withArgs(eventsUrl + '&stream_position=' + nextStreamPosition)
                .onFirstCall().returns(Rx.Observable.return({message: 'reconnect'}))
                .onSecondCall().returns(Rx.Observable.empty());
            var timeoutCalls = 0;
            $timeout = function(func) {
                timeoutCalls++;
                if (timeoutCalls < 2) {
                    func();
                } else {
                    expect(boxHttp.get).to.have.been.calledTwice.
                        and.to.have.been.calledWithExactly(eventsUrl + '&stream_position=' + nextStreamPosition);
                    expect(boxHttp.options).to.have.been.called.and.to.have.been.calledWithExactly(apiUrl + '/events');
                    done();
                }
            };

            boxSdk.subscribeToEvents(nextStreamPosition).subscribe(observer);
        });

        it('should reconnect after waiting for the timeout', function(done) {
            boxHttp.options.withArgs(apiUrl + '/events').returns(Rx.Observable.return({'entries': [
                {url: eventsUrl, retry_timeout: 0.001}
            ]}));
            boxHttp.get.withArgs(eventsUrl + '&stream_position=' + nextStreamPosition)
                .returns(Rx.Observable.never());
            var timeoutCalls = 0;
            $timeout = function(func) {
                timeoutCalls++;
                if (timeoutCalls < 2) {
                    func();
                } else {
                    expect(boxHttp.get).to.have.been.calledTwice.
                        and.to.have.been.calledWithExactly(eventsUrl + '&stream_position=' + nextStreamPosition);
                    expect(boxHttp.options).to.have.been.called.and.to.have.been.calledWithExactly(apiUrl + '/events');
                    done();
                }
            };

            boxSdk.subscribeToEvents(nextStreamPosition).subscribe(observer);
        });

        it('should reconnect after exhausting event stream', function(done) {
            var secondStreamPosition = 2;
            boxHttp.options.withArgs(apiUrl + '/events').returns(Rx.Observable.return({'entries': [
                {url: eventsUrl, retry_timeout: 1}
            ]}));
            boxHttp.get.withArgs(eventsUrl + '&stream_position=' + nextStreamPosition)
                .returns(Rx.Observable.return({message: 'new_change'}));
            boxHttp.get.withArgs(eventsUrl + '&stream_position=' + secondStreamPosition)
                .returns(Rx.Observable.empty());
            boxHttp.get.withArgs(apiUrl + '/events?stream_position=' + nextStreamPosition)
                .returns(Rx.Observable.return({
                    next_stream_position: secondStreamPosition,
                    chunk_size: 1,
                    entries: [eventResponse]
                }));
            boxHttp.get.withArgs(apiUrl + '/events?stream_position=' + secondStreamPosition)
                .returns(Rx.Observable.return({
                    next_stream_position: secondStreamPosition,
                    chunk_size: 0,
                    entries: []
                }));
            var timeoutCalls = 0;
            var doneCalls = 0;

            function perhapsDone() {
                doneCalls++;
                if(doneCalls >= 2) {
                    done();
                }
            }

            $timeout = function(func) {
                timeoutCalls++;
                if (timeoutCalls < 2) {
                    func();
                } else {
                    expect(boxHttp.get).to.have.been.called
                        .and.to.have.been.calledWithExactly(apiUrl + '/events?stream_position=' + nextStreamPosition)
                        .and.to.have.been.calledWithExactly(apiUrl + '/events?stream_position=' + secondStreamPosition)
                        .and.to.have.been.calledWithExactly(eventsUrl + '&stream_position=' + nextStreamPosition)
                        .and.to.have.been.calledWithExactly(eventsUrl + '&stream_position=' + secondStreamPosition);
                    expect(boxHttp.options).to.have.been.called.and.to.have.been.calledWithExactly(apiUrl + '/events');
                    perhapsDone();
                }
            };

            boxSdk.subscribeToEvents(nextStreamPosition).do(observer).subscribe(function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxEvent(eventResponse, secondStreamPosition));
                perhapsDone();
            });
        });
    });
});
