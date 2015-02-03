/*jshint expr: true*/
describe('BoxTask', function() {
    var taskResponse = {}, task, apiUrl, boxHttp, mocks, observer, BoxTask, BoxTaskAssignment;
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
    beforeEach(inject(function(_BoxTask_, _apiUrl_, _BoxTaskAssignment_) {
        BoxTask = _BoxTask_;
        BoxTaskAssignment = _BoxTaskAssignment_;
        task = new BoxTask(taskResponse);
        apiUrl = _apiUrl_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('constructor', function() {
        it('should have attributes of the response', function() {
            Object.getOwnPropertyNames(taskResponse)
                .forEach(function(name) {
                    expect(task).to.have.property(name, taskResponse[name]);
                });
        });
    });

    describe('url()', function() {
        it('should generate its api url', function() {
            expect(task).to.respondTo('url');
            expect(task.url()).to.equal(apiUrl + '/tasks/' + taskResponse.id);
        });
    });

    describe('getInfo()', function() {
        beforeEach(function() {
            boxHttp.get.returns(Rx.Observable.return(taskResponse));
            task.getInfo().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(task.url());
        });

        it('should return the BoxTask', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(task);
        });
    });

    describe('update()', function() {
        var params = {
            action: 'review'
        };
        beforeEach(function() {
            taskResponse.action = params.action;
            boxHttp.put.returns(Rx.Observable.return(taskResponse));
            task.update(params).subscribe(observer);
        });
        it('should call http put', function() {
            expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(task.url(), null, params);
        });

        it('should return the updated BoxTask', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxTask(taskResponse));
        });
    });

    describe('delete()', function() {
        beforeEach(function() {
            boxHttp.delete.returns(Rx.Observable.return({}));
            task.delete().subscribe(observer);
        });

        it('should call http delete', function() {
            expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(task.url());
        });

        it('should return an empty response', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
        });
    });

    describe('getAssignments()', function() {
        var getAssignmentsResponse;
        beforeEach(function() {
            getAssignmentsResponse = {
                "total_count": 1,
                "entries": [
                    {
                        "type": "task_assignment",
                        "id": "2485961",
                        "item": {
                            "type": "file",
                            "id": "7287087200",
                            "sequence_id": "0",
                            "etag": "0",
                            "sha1": "0bbd79a105c504f99573e3799756debba4c760cd",
                            "name": "box-logo.png"
                        },
                        "assigned_to": {
                            "type": "user",
                            "id": "193425559",
                            "name": "Rhaegar Targaryen",
                            "login": "rhaegar@box.com"
                        }
                    }
                ]
            };
            boxHttp.get.returns(Rx.Observable.return(getAssignmentsResponse));
            task.getAssignments().subscribe(observer);
        });

        it('should call http get', function() {
            expect(boxHttp.get).to.have.been.calledOnce.and.to.have.been.calledWithExactly(task.url() + '/assignments');
        });

        it('should return call the subscriber with a BoxCollaboration', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWith(new BoxTaskAssignment(task, getAssignmentsResponse.entries[0]));
        });
    });

    describe('assignTo()', function() {
        var taskAssignmentResponse, user;
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
            user = {
                id: '1992432',
                login: 'rhaegar@box.com'
            };
            boxHttp.post.returns(Rx.Observable.return(taskAssignmentResponse));
            task.assignTo(user).subscribe(observer);
        });

        it('should call http post', function() {
            expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(apiUrl + '/task_assignments', null, {
                task: {
                    id: taskResponse.id,
                    type: 'task'
                },
                assign_to: user
            });
        });

        it('should return the updated BoxTaskAssignment', function() {
            expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxTaskAssignment(taskAssignmentResponse));
        });
    });
});
