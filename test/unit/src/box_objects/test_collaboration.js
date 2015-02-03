/*jshint expr: true*/
describe('BoxCollaboration', function() {
    var collaborationResponse = {}, collaboration, apiUrl, boxHttp, mocks, observer, BoxCollaboration;
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
    });
    beforeEach(inject(function(_BoxCollaboration_, _apiUrl_) {
        BoxCollaboration = _BoxCollaboration_;
        collaboration = new BoxCollaboration(collaborationResponse);
        apiUrl = _apiUrl_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(collaborationResponse)
                .forEach(function(name) {
                    expect(collaboration).to.have.property(name, collaborationResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(collaboration).to.respondTo('url');
            expect(collaboration.url()).to.equal(apiUrl + '/collaborations/' + collaborationResponse.id);
        });
    });

    describe('edit()', function() {
        var role = 'co-owner', status = 'pending';
        beforeEach(function() {
            collaborationResponse.role = role;
            collaborationResponse.status = status;
            boxHttp.put.returns(Rx.Observable.return(collaborationResponse));
            collaboration.edit(role, status).subscribe(observer);
        });
        it('should call http put', function() {
            expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(collaboration.url(), {
                role: role,
                status: status
            });
        });

        it('should return the updated BoxCollaboration', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxCollaboration(collaborationResponse));
        });
    });

    describe('delete()', function() {
        beforeEach(function() {
            boxHttp.delete.returns(Rx.Observable.return({}));
            collaboration.delete().subscribe(observer);
        });

        it('should call http delete', function() {
            expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(collaboration.url());
        });

        it('should return an empty response', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
        });
    });

    describe('getInfo()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(collaborationResponse));
            collaboration.getInfo().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(collaboration.url());
        });

        it('should return the BoxCollaboration', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(collaboration);
        });
    });
});
