**Overview:** Box Task Assignment object. @see http://developers.box.com/docs/#tasks-get-the-assignments-for-a-task

**Author:** jmeadows

BoxTaskAssignment.getInfo()
---------------------------
Get information about the task assignment

**Returns**

*Observable*,  An observable containing a new TaskAssignment object containing the details of this task assignment.

BoxTaskAssignment.delete()
--------------------------
Delete this task assignment, unassigning the associated task from the assignee.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

BoxTaskAssignment.update(message, state)
----------------------------------------
Update this task assignment's message or resolution state.

**Parameters**

**message**:  *String*,  A message to the assignee about the associated task.

**state**:  *String*,  Can be completed, incomplete, approved, or rejected.

**Returns**

*Observable*,  An observable containing a new TaskAssignment object containing the updated task assignment.

class BoxTaskAssignment.TaskAssignment
--------------------------------------
**Members**

**task**,  


**boxHttp**,  


**urlType**,  


**task**,  


**message**,  


**resolution_state**,  


**constructor**,  


