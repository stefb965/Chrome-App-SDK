/*jshint expr: true*/
describe('BoxGroup', function() {
    var groupResponse = {}, group, apiUrl, boxHttp, mocks, observer, BoxGroup, BoxCollaboration, BoxUser;
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
        groupResponse = {
            "type": "group",
            "id": "119720",
            "name": "family",
            "created_at": "2013-05-16T15:27:57-07:00",
            "modified_at": "2013-05-16T15:27:57-07:00"
        };
    });
    beforeEach(inject(function(_BoxGroup_, _apiUrl_, _BoxCollaboration_, _BoxUser_) {
        BoxGroup = _BoxGroup_;
        group = new BoxGroup(groupResponse);
        apiUrl = _apiUrl_;
        BoxCollaboration = _BoxCollaboration_;
        BoxUser = _BoxUser_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(groupResponse)
                .forEach(function(name) {
                    expect(group).to.have.property(name, groupResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(group).to.respondTo('url');
            expect(group.url()).to.equal(apiUrl + '/groups/' + groupResponse.id);
        });
    });

    describe('update()', function() {
        var params = {
            name: 'Beer Appreciators'
        };
        beforeEach(function() {
            groupResponse.action = params.action;
            boxHttp.put.returns(Rx.Observable.return(groupResponse));
            group.update(params).subscribe(observer);
        });
        it('should call http put', function() {
            expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(group.url(), null, params);
        });

        it('should return the updated BoxGroup', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxGroup(groupResponse));
        });
    });

    describe('delete()', function() {
        beforeEach(function() {
            boxHttp.delete.returns(Rx.Observable.return({}));
            group.delete().subscribe(observer);
        });

        it('should call http delete', function() {
            expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(group.url());
        });

        it('should return an empty response', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
        });
    });

    describe('getCollaborations()', function() {
        var getCollaborationsResponse;
        beforeEach(function() {
            getCollaborationsResponse = {
                "total_count": 1,
                "entries": [
                    {
                        "type": "collaboration",
                        "id": "52123184",
                        "created_by": {
                            "type": "user",
                            "id": "13130406",
                            "name": "Eddard Stark",
                            "login": "ned@winterfell.com"
                        },
                        "created_at": "2013-11-14T16:16:20-08:00",
                        "modified_at": "2013-11-14T16:16:20-08:00",
                        "expires_at": null,
                        "status": "accepted",
                        "accessible_by": {
                            "type": "group",
                            "id": "160018",
                            "name": "Hand of the King inner counsel"
                        },
                        "role": "viewer",
                        "acknowledged_at": "2013-11-14T16:16:20-08:00",
                        "item": {
                            "type": "folder",
                            "id": "541014843",
                            "sequence_id": "0",
                            "etag": "0",
                            "name": "People killed by Ice"
                        }
                    }
                ],
                "offset": 0,
                "limit": 100
            };
            boxHttp.get.returns(Rx.Observable.return(getCollaborationsResponse));
            group.getCollaborations().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(group.url() + '/collaborations');
        });

        it('should return call the subscriber with a BoxCollaboration', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWith(new BoxCollaboration(getCollaborationsResponse.entries[0]));
        });
    });

    describe('memberships', function() {
        var membershipResponse, user, userResponse;
        beforeEach(function() {
            membershipResponse = {
                "type": "group_membership",
                "id": "1560354",
                "user": {
                    "type": "user",
                    "id": "13130406",
                    "name": "Alison Wonderland",
                    "login": "alice@gmail.com"
                },
                "group": {
                    "type": "group",
                    "id": "119720",
                    "name": "family"
                },
                "role": "member",
                "created_at": "2013-05-16T15:27:57-07:00",
                "modified_at": "2013-05-16T15:27:57-07:00"
            };
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
            user = new BoxUser(userResponse);
        });

        describe('getMemberships()', function() {
            beforeEach(function() {
                boxHttp.get.returns(Rx.Observable.return({
                    total_count: 1,
                    entries: [membershipResponse]
                }));
                group.getMemberships().subscribe(observer);
            });
            it('should call http get', function() {
                expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(group.url() + '/memberships');
            });

            it('should return a list of memberships', function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(membershipResponse);
            });
        });

        describe('addMembership()', function() {
            beforeEach(function() {
                boxHttp.post.returns(Rx.Observable.return(membershipResponse));
                group.addMember(user, 'member').subscribe(observer);
            });
            it('should call http post', function() {
                expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    apiUrl + '/group_memberships',
                    null,
                    {
                        user: {id: user.id},
                        group: {id: group.id},
                        role: 'member'
                    }
                );
            });

            it('should return the new email alias', function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(membershipResponse);
            });
        });

        describe('updateMembership()', function() {
            beforeEach(function() {
                boxHttp.put.returns(Rx.Observable.return(membershipResponse));
                group.updateMembership(membershipResponse, 'submaster').subscribe(observer);
            });
            it('should call http put', function() {
                expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    apiUrl + '/group_memberships/' + membershipResponse.id,
                    null,
                    {
                        role: 'submaster'
                    }
                );
            });

            it('should return the new membership', function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(membershipResponse);
            });
        });

        describe('deleteMembership()', function() {
            beforeEach(function() {
                boxHttp.delete.returns(Rx.Observable.return({}));
                group.deleteMembership(membershipResponse).subscribe(observer);
            });
            it('should call http delete', function() {
                expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(apiUrl + '/group_memberships/' + membershipResponse.id);
            });

            it('should return an empty response', function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
            });
        });
    });
});
