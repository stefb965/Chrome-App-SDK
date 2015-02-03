/*jshint expr: true*/
describe('boxItem', function() {
    var fileResponse, folderResponse, file, folder, apiUrl, boxHttp, mocks, observer, BoxComment;
    function getFile() {
        return {
            item: file,
            source: fileResponse
        };
    }
    function getFolder() {
        return {
            item: folder,
            source: folderResponse
        };
    }
    beforeEach(function() {
        var provide;
        mocks = sinon.sandbox.create();
        observer = mocks.spy();
        angular.module('box.conf')
            .constant('clientSecret', 'uII-----------------------------')
            .constant('clientId', 'i3p-----------------------------');
        module('box.objects', 'box.http', 'box.auth', function($provide) {
            provide = $provide;
        });
        inject(function(_boxHttp_) {
            boxHttp = mocks.stub(_boxHttp_);
            provide.value('boxHttp', boxHttp);
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
    beforeEach(inject(function(BoxFile, BoxFolder, _apiUrl_, _BoxComment_) {
        file = new BoxFile(fileResponse);
        folder = new BoxFolder(folderResponse);
        apiUrl = _apiUrl_;
        BoxComment = _BoxComment_;
    }));
    afterEach(function() {
        mocks.restore();
    });

    [getFile, getFolder].forEach(function(getItem) {
        var item, itemResponse;
        beforeEach(function() {
            item = getItem().item;
            itemResponse = getItem().source;
        });

        describe('updateInfo()', function() {
            beforeEach(function() {
                boxHttp.put.returns(Rx.Observable.return(itemResponse));
            });

            it('should call http put', function() {
                item.updateInfo({foo: 'bar'}).subscribe(observer);

                expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    item.url(), {headers: {}}, {foo: 'bar'}
                );
            });

            it('should pass ifMatch header to http put', function() {
                item.updateInfo({foo: 'bar'}, true).subscribe(observer);

                expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    item.url(), {headers: {'If-Match': itemResponse.etag}}, {foo: 'bar'}
                );
            });

            it('should return the updated item', function() {
                item.updateInfo({foo: 'bar'}).subscribe(observer);

                expect(observer).to.have.been.calledOnce;
                var updatedItem = observer.firstCall.args[0];
                expect(updatedItem).to.be.an.instanceOf(item.constructor);
                for(var property in item) {
                    if(item.hasOwnProperty(property)) { expect(updatedItem).to.have.property(property, item[property]); }
                }
            });
        });

        describe('getSharedLink()', function() {
            beforeEach(function() {
                boxHttp.put.returns(Rx.Observable.return(itemResponse));
            });

            it('should call http put', function() {
                var access = 'open', timestamp = 'tomorrow', permissions = {};
                item.getSharedLink(access, timestamp, permissions).subscribe(observer);

                expect(boxHttp.put).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    item.url(), {headers: {}}, {
                        "shared_link": {
                            access: access,
                            unshared_at: timestamp,
                            permissions: permissions
                        }
                    }
                );
            });

            it('should return the item including the shared link', function() {
                var access = 'open', timestamp = 'tomorrow', permissions = {};
                item.getSharedLink(access, timestamp, permissions).subscribe(observer);

                expect(observer).to.have.been.calledOnce;
                var updatedItem = observer.firstCall.args[0];
                expect(updatedItem).to.be.an.instanceOf(item.constructor);
                for(var property in item) {
                    if(item.hasOwnProperty(property)) { expect(updatedItem).to.have.property(property, item[property]); }
                }
            });
        });

        describe('copyTo()', function() {
            beforeEach(function() {
                boxHttp.post.returns(Rx.Observable.return(itemResponse));
            });

            it('should call http post', function() {
                item.copyTo({id: 0}).subscribe(observer);

                expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    item.url() + '/copy', null, {parent: {id: 0}, name: item.name}
                );
            });

            it('should return the copied file', function() {
                var filename = 'filename';
                item.copyTo({id: 0}, filename).subscribe(observer);

                expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    item.url() + '/copy', null, {parent: {id: 0}, name: filename}
                );

                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(item);
            });
        });

        describe('commentOnItem()', function() {
            var commentResponse;
            beforeEach(function() {
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
                commentResponse.item.id = item.id;
                commentResponse.item.type = item.type;

                boxHttp.post.returns(Rx.Observable.return(commentResponse));
                item.commentOn('These tigers are cool!').subscribe(observer);
            });
            it('should call http post', function() {
                expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    apiUrl + '/comments',
                    null,
                    {
                        item: {
                            id: item.id,
                            type: item.type
                        },
                        message: 'These tigers are cool!'
                    }
                );
            });

            it('should return a BoxComment', function() {
                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(new BoxComment(commentResponse));
            });
        });

        describe('delete', function() {
            beforeEach(function() {
                boxHttp.delete.returns(Rx.Observable.return({}));
            });

            [true, false, undefined].forEach(function(recursive) {
                [true, false, undefined].forEach(function(ifMatch) {
                    it('should call http delete', function() {
                        item.delete(recursive, ifMatch).subscribe(observer);

                        expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                            item.url(), {
                                headers: ifMatch ? {'If-Match': item.etag} : {},
                                params: {recursive: !!recursive}
                            }
                        );
                    });

                    it('should return an empty response', function() {
                        item.delete(recursive, ifMatch).subscribe(observer);

                        expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
                    });
                });
            });
        });

        describe('restoreFromTrash()', function() {
            beforeEach(function() {
                boxHttp.post.returns(Rx.Observable.return(itemResponse));
            });

            it('should call http post', function() {
                item.restoreFromTrash({id: 0}).subscribe(observer);

                expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    item.url(), null, {parent: {id: 0}, name: item.name}
                );
            });

            it('should return the restored item', function() {
                var filename = 'filename';
                item.restoreFromTrash({id: 0}, filename).subscribe(observer);

                expect(boxHttp.post).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                    item.url(), null, {parent: {id: 0}, name: filename}
                );

                expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly(item);
            });
        });

        describe('deleteFromTrash()', function() {
            beforeEach(function() {
                boxHttp.delete.returns(Rx.Observable.return({}));
            });

            [true, false, undefined].forEach(function(ifMatch) {
                it('should call http delete', function() {
                    item.deleteFromTrash(ifMatch).subscribe(observer);

                    expect(boxHttp.delete).to.have.been.calledOnce.and.to.have.been.calledWithExactly(
                        item.url() + '/trash', {
                            headers: ifMatch ? {'If-Match': item.etag} : {}
                        }
                    );
                });

                it('should return an empty response', function() {
                    item.deleteFromTrash(ifMatch).subscribe(observer);

                    expect(observer).to.have.been.calledOnce.and.to.have.been.calledWithExactly({});
                });
            });
        });
    });
});
