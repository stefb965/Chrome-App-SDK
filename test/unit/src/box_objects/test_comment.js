/*jshint expr: true*/
describe('BoxComment', function() {
    var commentResponse = {}, comment, apiUrl, boxHttp, mocks, observer, BoxComment;
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
        commentResponse = {
            "type": "comment",
            "id": "191969",
            "is_reply_comment": false,
            "message": "These tigers are cool!",
            "created_by": {
                "type": "user",
                "id": "17738362",
                "name": "sean rose",
                "login": "sean@box.com"
            },
            "created_at": "2012-12-12T11:25:01-08:00",
            "item": {
                "id": "5000948880",
                "type": "file"
            },
            "modified_at": "2012-12-12T11:25:01-08:00"
        };
    });
    beforeEach(inject(function(_BoxComment_, _apiUrl_) {
        BoxComment = _BoxComment_;
        comment = new BoxComment(commentResponse);
        apiUrl = _apiUrl_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(commentResponse)
                .forEach(function(name) {
                    expect(comment).to.have.property(name, commentResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(comment).to.respondTo('url');
            expect(comment.url()).to.equal(apiUrl + '/comments/' + commentResponse.id);
        });
    });

    describe('updateMessage()', function() {
        var message = 'awesome!!1';
        beforeEach(function() {
            commentResponse.message = message;
            boxHttp.put.returns(Rx.Observable.return(commentResponse));
            comment.updateMessage(message).subscribe(observer);
        });
        it('should call http put', function() {
            expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(comment.url(), null, {
                message: message
            });
        });

        it('should return the updated BoxComment', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxComment(commentResponse));
        });
    });

    describe('delete()', function() {
        beforeEach(function() {
            boxHttp.delete.returns(Rx.Observable.return({}));
            comment.delete().subscribe(observer);
        });

        it('should call http delete', function() {
            expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(comment.url());
        });

        it('should return an empty response', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
        });
    });

    describe('getInfo()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(commentResponse));
            comment.getInfo().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(comment.url());
        });

        it('should return the BoxComment', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(comment);
        });
    });
});
