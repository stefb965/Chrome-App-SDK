/*jshint expr: true*/
describe('BoxUser', function() {
    var userResponse = {}, user, apiUrl, boxHttp, mocks, observer, BoxUser, BoxTaskAssignment, BoxFolder;
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
    });
    beforeEach(inject(function(_BoxUser_, _apiUrl_, _BoxTaskAssignment_, _BoxFolder_) {
        BoxUser = _BoxUser_;
        user = new BoxUser(userResponse);
        apiUrl = _apiUrl_;
        BoxTaskAssignment = _BoxTaskAssignment_;
        BoxFolder = _BoxFolder_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(userResponse)
                .forEach(function(name) {
                    expect(user).to.have.property(name, userResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(user).to.respondTo('url');
            expect(user.url()).to.equal(apiUrl + '/users/' + userResponse.id);
        });
    });

    describe('assignTaskTo()', function() {
        var taskAssignmentResponse, task;
        beforeEach(function() {
            taskAssignmentResponse = {
                "type": "task_assignment",
                "id": "2698512",
                "item": {
                    "type": "file",
                    "id": "8018809384",
                    "sequence_id": "0",
                    "etag": "0",
                    "sha1": "7840095ee096ee8297676a138d4e316eabb3ec96",
                    "name": "scrumworksToTrello.js"
                },
                "assigned_to": {
                    "type": "user",
                    "id": "1992432",
                    "name": "rhaegar@box.com",
                    "login": "rhaegar@box.com"
                },
                "message": null,
                "completed_at": null,
                "assigned_at": "2013-05-10T11:43:41-07:00",
                "reminded_at": null,
                "resolution_state": "incomplete",
                "assigned_by": {
                    "type": "user",
                    "id": "11993747",
                    "name": "☁ sean ☁",
                    "login": "sean@box.com"
                }
            };
            task = {
                id: '191969'
            };
            boxHttp.post.returns(Rx.Observable.return(taskAssignmentResponse));
            user.assignTaskTo(task).subscribe(observer);
        });

        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(apiUrl + '/task_assignments', null, {
                task: {
                    id: task.id,
                    type: 'task'
                },
                assign_to: {
                    id: user.id,
                    login: user.login
                }
            });
        });

        it('should return the updated BoxTaskAssignment', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxTaskAssignment(taskAssignmentResponse));
        });
    });

    describe('update()', function() {
        var params = {
            name: 'sean'
        };
        beforeEach(function() {
            userResponse.name = params.name;
            boxHttp.put.returns(Rx.Observable.return(userResponse));
            user.update(params).subscribe(observer);
        });
        it('should call http put', function() {
            expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(user.url(), null, params);
        });

        it('should return the updated BoxTask', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxUser(userResponse));
        });
    });

    describe('delete()', function() {
        beforeEach(function() {
            boxHttp.delete.returns(Rx.Observable.return({}));
            user.delete().subscribe(observer);
        });

        it('should call http delete', function() {
            expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(user.url(), {});
        });

        it('should return an empty response', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
        });
    });

    describe('giveRootFolderToUser()', function() {
        var folderResponse, user;
        beforeEach(function() {
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
                    "download_url": null,
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
            user = new BoxUser({id: 4});
            boxHttp.put.returns(Rx.Observable.return(folderResponse));
            user.giveRootFolderToUser(user).subscribe(observer);
        });

        it('should call http put', function() {
            expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                user.url() + '/folders/0',
                null,
                {
                    owned_by: {id: user.id}
                }
            );
        });

        it('should return the new folder', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxFolder(folderResponse));
        });
    });

    describe('email aliases', function() {
        var emailAliasResponse;
        beforeEach(function() {
            emailAliasResponse = {
              "type":"email_alias",
              "id":"1234",
              "is_confirmed":true,
              "email": "dglover2@box.com"
            };
        });

        describe('getEmailAliases()', function() {
            beforeEach(function() {
                boxHttp.get.returns(Rx.Observable.return({
                    total_count: 1,
                    entries: [emailAliasResponse]
                }));
                user.getEmailAliases().subscribe(observer);
            });
            it('should call http get', function() {
                expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(user.url() + '/email_aliases');
            });

            it('should return a list of email aliases', function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(emailAliasResponse);
            });
        });

        describe('addEmailAlias()', function() {
            beforeEach(function() {
                boxHttp.post.returns(Rx.Observable.return(emailAliasResponse));
                user.addEmailAlias('dglover2@box.com').subscribe(observer);
            });
            it('should call http post', function() {
                expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    user.url() + '/email_aliases',
                    null,
                    {email: 'dglover2@box.com'}
                );
            });

            it('should return the new email alias', function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(emailAliasResponse);
            });
        });

        describe('deleteEmailAlias()', function() {
            beforeEach(function() {
                boxHttp.delete.returns(Rx.Observable.return({}));
                user.deleteEmailAlias(emailAliasResponse).subscribe(observer);
            });
            it('should call http delete', function() {
                expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(user.url() + '/email_aliases/' + emailAliasResponse.id);
            });

            it('should return an empty response', function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
            });
        });
    });
});
