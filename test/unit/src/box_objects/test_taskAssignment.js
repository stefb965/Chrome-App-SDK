/*jshint expr: true*/
describe('BoxTaskAssignment', function() {
    var taskAssignmentResponse = {}, taskAssignment, apiUrl, boxHttp, mocks, observer, BoxTaskAssignment, task, taskResponse;
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
        taskAssignmentResponse = {
            "type": "taskAssignment",
            "id": "191969",
            "is_reply_taskAssignment": false,
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
        taskResponse = {
            "type": "task",
            "id": "191969",
            "is_reply_task": false,
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
    beforeEach(inject(function(_BoxTaskAssignment_, _apiUrl_, _BoxTask_) {
        BoxTaskAssignment = _BoxTaskAssignment_;
        task = new _BoxTask_(taskResponse);
        taskAssignment = new BoxTaskAssignment(task, taskAssignmentResponse);
        apiUrl = _apiUrl_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(taskAssignmentResponse)
                .forEach(function(name) {
                    expect(taskAssignment).to.have.property(name, taskAssignmentResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(taskAssignment).to.respondTo('url');
            expect(taskAssignment.url()).to.equal(apiUrl + '/task_assignments/' + taskAssignmentResponse.id);
        });
    });

    describe('update()', function() {
        var message = 'awesome!!1';
        var state = 'completed';
        beforeEach(function() {
            taskAssignmentResponse.message = message;
            taskAssignmentResponse.state = state;
            boxHttp.put.returns(Rx.Observable.return(taskAssignmentResponse));
            taskAssignment.update(message, state).subscribe(observer);
        });
        it('should call http put', function() {
            expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(taskAssignment.url(), null, {
                message: message,
                resolution_state: state
            });
        });

        it('should return the updated BoxTaskAssignment', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxTaskAssignment(taskAssignmentResponse));
        });
    });

    describe('delete()', function() {
        beforeEach(function() {
            boxHttp.delete.returns(Rx.Observable.return({}));
            taskAssignment.delete().subscribe(observer);
        });

        it('should call http delete', function() {
            expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(taskAssignment.url());
        });

        it('should return an empty response', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
        });
    });

    describe('getInfo()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(taskAssignmentResponse));
            taskAssignment.getInfo().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(taskAssignment.url());
        });

        it('should return the BoxTaskAssignment', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(taskAssignment);
        });
    });
});
