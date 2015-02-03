/**
 * @fileoverview Box Task object. @see http://developers.box.com/docs/#tasks
 * @author jmeadows
 */

/**
 * @module BoxTask
 */

angular.module('box.objects').factory('BoxTask',
    ['rx', 'boxHttp', 'apiUrl', 'boxObjectBase', 'BoxTaskAssignment', 'responseTranslator',
        function(rx, boxHttp, apiUrl, boxObjectBase, BoxTaskAssignment, responseTranslator) {
            /**
             * Represents a file-centric workflow object.  Read more at [https://support.box.com/hc/en-us/articles/200520868-Tasks](Tasks).
             * @param {Object} json Information about the task from an API result.
             * @constructor
             */
            function Task(json) {
                angular.extend(this, json);
                this.boxHttp = boxHttp;
            }
            Task.prototype = angular.extend(Object.create(boxObjectBase), {
                urlType: 'tasks',
                /**
                 * Get information about the task
                 * @returns {Observable} An observable containing a new Task object containing the details of this task.
                 */
                getInfo: function() {
                    return this.boxHttp.get(this.url()).map(function(result) {
                        return new Task(result);
                    });
                },
                /**
                 * Update the task's action, message, or due date.
                 * @param {Object} params Any or all of: action (String), message (String), and/or due_at (Timestamp)
                 * @returns {Observable} An observable containing a new Task object with the updated parameters.
                 */
                update: function(params) {
                    return this.boxHttp.put(this.url(), null, params).map(function(result) {
                        return new Task(result);
                    });
                },
                /**
                 * Deletes the task.
                 * @returns {Observable} An observable containing the Box API response for this request.
                 */
                delete: function() {
                    return this.boxHttp.delete(this.url());
                },
                /**
                 * Gets a collection of task assignment objects for the task.
                 * @returns {Observable} An observable sequence of Box Task Assignment objects.
                 */
                getAssignments: function() {
                    var that = this;
                    return this.boxHttp.get(this.url() + '/assignments').flatMap(function(result) {
                        return rx.Observable.fromArray(result.entries.map(function(entry) {
                            return new BoxTaskAssignment(that, entry);
                        }));
                    });
                },
                /**
                 * Assigns the task to a user.
                 * @param {User|Object} user The user object representing the user this task should be assigned to.
                 * @returns {Observable} An observable containing the Box API response for this request.
                 */
                assignTo: function(user) {
                    return this.boxHttp.post(apiUrl + '/task_assignments', null, {
                        task: {
                            id: this.id,
                            type: 'task'
                        },
                        /*eslint-disable camelcase*/
                        assign_to: {
                        /*eslint-enable camelcase*/
                            id: user.id,
                            login: user.login
                        }
                    }).map(function(result) {
                            return new BoxTaskAssignment(result);
                        });
                }
            });
            Task.prototype.constructor = Task;
            responseTranslator.registerDefaultTranslator('task', Task);
            return Task;
        }]);
