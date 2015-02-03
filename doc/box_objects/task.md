**Overview:** Box Task object. @see http://developers.box.com/docs/#tasks

**Author:** jmeadows

BoxTask.getInfo()
-----------------
Get information about the task

**Returns**

*Observable*,  An observable containing a new Task object containing the details of this task.

BoxTask.update(params)
----------------------
Update the task's action, message, or due date.

**Parameters**

**params**:  *Object*,  Any or all of: action (String), message (String), and/or due_at (Timestamp)

**Returns**

*Observable*,  An observable containing a new Task object with the updated parameters.

BoxTask.delete()
----------------
Deletes the task.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

BoxTask.getAssignments()
------------------------
Gets a collection of task assignment objects for the task.

**Returns**

*Observable*,  An observable sequence of Box Task Assignment objects.

BoxTask.assignTo(user)
----------------------
Assigns the task to a user.

**Parameters**

**user**:  *User* | *Object*,  The user object representing the user this task should be assigned to.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

class BoxTask.Task
------------------
**Members**

**boxHttp**,  


**urlType**,  


**that**,  


**task**,  


**id**,  


**type**,  


**assign_to**,  


**id**,  


**login**,  


**constructor**,  


