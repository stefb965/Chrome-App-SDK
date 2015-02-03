/*jshint expr: true*/
describe('rx.http', function() {
    var $http, http, mocks, observer, deferred, $rootScope;
    beforeEach(function() {
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        module('rx.http', function($provide) {
            $http = mocks.stub();
            $provide.value('$http', $http);
        });
    });
    beforeEach(inject(function(_http_, $q, _$rootScope_) {
        http = _http_;
        deferred = $q.defer();
        $rootScope = _$rootScope_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    describe('getObservable()', function() {
        it('should return an observable that contains the result from $http', function(done) {
            var response = 'foo', method = 'GET', url = 'http://example.com';
            $http.returns(deferred.promise);
            deferred.resolve(response);
            http.getObservable(method, url).do(observer).subscribe(function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(response);
                done();
            });
            $rootScope.$digest();
            expect($http).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                method: method,
                url: url,
                headers: {}
            });
        });

        it('should propagate errors from $http', function() {
            var rejection = 'err',
                errObserver = mocks.spy(),
                completedObserver = mocks.spy(),
                method = 'GET',
                url = 'http://example.com';
            $http.returns(deferred.promise);
            deferred.reject(rejection);
            http.getObservable('GET', 'http://example.com').subscribe(observer, errObserver, completedObserver);
            $rootScope.$digest();
            expect($http).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                method: method,
                url: url,
                headers: {}
            });
            expect(observer).to.not.have.been.called;
            expect(errObserver).to.have.been.calledOnce.and.to.have.been.calledWithExactly(rejection);
            expect(completedObserver).to.not.have.been.called;
        });

        ['GET', 'POST', 'PUT', 'DELETE'].forEach(function(method) {
            it('should call $http with the passed method - ' + method, function(done) {
                var url = 'https://example.com', response = 'foo';
                $http.returns(deferred.promise);
                deferred.resolve(response);
                http.getObservable(method, url).do(observer).subscribe(function() {
                    expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(response);
                    done();
                });
                $rootScope.$digest();
                expect($http).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                    method: method,
                    url: url,
                    headers: {}
                });
            });
        });

        ['http://example.com', 'https://secure.example.com'].forEach(function(url) {
            it('should call $http with the passed url', function(done) {
                var method = 'GET', response = 'foo';
                $http.returns(deferred.promise);
                deferred.resolve(response);
                http.getObservable(method, url).do(observer).subscribe(function() {
                    expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(response);
                    done();
                });
                $rootScope.$digest();
                expect($http).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                    method: method,
                    url: url,
                    headers: {}
                });
            });
        });

        it('should call $http with the passed data', function(done) {
            var response = 'foo', method = 'GET', url = 'http://example.com', data = {grant_type: 'token', filename: [new ArrayBuffer(100), 'my_file.txt']};
            var form = new FormData();
            form.append('grant_type', 'token');
            form.append('filename', new ArrayBuffer(100), 'my_file.txt');
            $http.returns(deferred.promise);
            deferred.resolve(response);
            http.getObservable(method, url, null, data).do(observer).subscribe(function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(response);
                done();
            });
            $rootScope.$digest();
            expect($http).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                method: method,
                url: url,
                headers: {'Content-Type': undefined},
                data: form,
                transformRequest: angular.identity
            });
        });

        it('should call $http with the passed config', function(done) {
            var response = 'foo', method = 'GET', url = 'http://example.com', config = {headers: {'Content-Type': 'application/json'}, transformRequest: angular.identity};
            $http.returns(deferred.promise);
            deferred.resolve(response);
            http.getObservable(method, url).do(observer).subscribe(function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(response);
                done();
            });
            $rootScope.$digest();
            expect($http).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                method: method,
                url: url,
                headers: config.headers,
                transformRequest: angular.identity
            });
        });
    });

    describe('request()', function() {
        it('should call getObservable with passed parameters and return an AsyncSubject as observable', function() {
            var AsyncSubject = mocks.stub(Rx, 'AsyncSubject'), fromPromise = mocks.stub(Rx.Observable, 'fromPromise');
            var httpObservable = {subscribe: mocks.spy()};
            var subject = {asObservable: mocks.stub()};
            var observable = mocks.spy();
            var promise = mocks.spy();
            var form = new FormData();
            form.append('grant_type', 'token');
            form.append('filename', new ArrayBuffer(100), 'my_file.txt');
            subject.asObservable.returns(observable);
            AsyncSubject.returns(subject);
            fromPromise.returns(httpObservable);
            $http.returns(promise);
            var method = 'GET', url = 'http://example.com', config = {headers: {'Content-Type': 'application/json'}, transformRequest: angular.identity}, data = {grant_type: 'token', filename: [new ArrayBuffer(100), 'my_file.txt']};

            var request = http.request(method, url, config, data);

            expect(AsyncSubject).to.have.been.calledOnce.and.to.have.been.calledWithExactly().and.to.have.been.calledWithNew;
            expect(fromPromise).to.have.been.calledOnce.and.to.have.been.calledWithExactly(promise);
            expect(httpObservable.subscribe).to.have.been.calledOnce.and.to.have.been.calledWithExactly(subject);
            expect(subject.asObservable).to.have.been.calledOnce.and.to.have.been.calledWithExactly();
            expect(request).to.equal(observable);
            expect($http).to.have.been.calledOnce.and.to.have.been.calledWithExactly({
                method: method,
                url: url,
                headers: {'Content-Type': undefined},
                data: form,
                transformRequest: angular.identity
            });
        });
    });
});
