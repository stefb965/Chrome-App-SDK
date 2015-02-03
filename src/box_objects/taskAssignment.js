/**
 * @fileoverview Box Task Assignment object. @see http://developers.box.com/docs/#tasks-get-the-assignments-for-a-task
 * @author jmeadows
 */

/**
 * @module BoxTaskAssignment
 */

angular.module('box.objects').factory('BoxTaskAssignment', ['boxHttp', 'boxObjectBase', 'responseTranslator', function(boxHttp, boxObjectBase, responseTranslator) {
    /**
     * Represents a task assignment, specifying the item the task is associated with and the user it is assigned to.
     * @param {Task} task The task specified by the task assignment
     * @param {Object} json Information about the task assignment from an API result.
     * @constructor
     */
    function TaskAssignment(task, json) {
        this.task = task;
        angular.extend(this, json);
        this.boxHttp = boxHttp;
    }
    TaskAssignment.prototype = angular.extend(Object.create(boxObjectBase), {
        urlType: 'task_assignments',
        /**
         * Get information about the task assignment
         * @returns {Observable} An observable containing a new TaskAssignment object containing the details of this task assignment.
         */
        getInfo: function() {
            var task = this.task;
            return this.boxHttp.get(this.url()).map(function(result) {
                return new TaskAssignment(task, result);
            });
        },
        /**
         * Delete this task assignment, unassigning the associated task from the assignee.
         * @returns {Observable} An observable containing the Box API response for this request.
         */
        delete: function() {
            return this.boxHttp.delete(this.url());
        },
        /**
         * Update this task assignment's message or resolution state.
         * @param {String} message A message to the assignee about the associated task.
         * @param {String} state Can be completed, incomplete, approved, or rejected.
         * @returns {Observable} An observable containing a new TaskAssignment object containing the updated task assignment.
         */
        update: function(message, state) {
            return this.boxHttp.put(this.url(), null, {
                message: message,
                /*eslint-disable camelcase*/
                resolution_state: state
                /*eslint-enable camelcase*/
            })
                .map(function(result) {
                    return new TaskAssignment(result);
                });
        }
    });
    TaskAssignment.prototype.constructor = TaskAssignment;
    responseTranslator.registerDefaultTranslator('task_assignment', TaskAssignment);
    return TaskAssignment;
}]);
