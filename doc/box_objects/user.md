**Overview:** Box User object. @see http://developers.box.com/docs/#users

**Author:** jmeadows

BoxUser.assignTaskTo(task)
--------------------------
Assigns a task to the user.

**Parameters**

**task**:  *Task* | *Object*,  The task to assign to the user.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

BoxUser.update(params, notify)
------------------------------
Update the enterprise user's information if the current user is an enterprise admin.

**Parameters**

**params**:  *Object*,  A hash containing key/value pairs of the user fields to update

**notify**:  *Boolean*,  Whether to notify the affected user when they are rolled out of the enterprise.

**Returns**

*Observable*,  An observable containing a new User object with the updated parameters.

BoxUser.delete(notify, force)
-----------------------------
Delete the enterprise user if the current user is an enterprise admin.

**Parameters**

**notify**:  *Boolean*,  Whether to notify the affected user.

**force**:  *Boolean*,  Whether or not to delete the user even if they still own files

**Returns**

*Observable*,  An empty observable.

BoxUser.getEmailAliases()
-------------------------
Get a user's email address aliases.  Doesn't include the primary login, which is included in the User object.

**Returns**

*Observable*,  An observable sequence of email alias objects.

BoxUser.addEmailAlias(email)
----------------------------
Add a new email alias to the user's account.

**Parameters**

**email**:  *String*,  The email address to add to the user's account

**Returns**

*Observable*,  An observable containing the newly created email alias object.

BoxUser.deleteEmailAlias(emailAlias)
------------------------------------
Delete the email alias from the user's account.

**Parameters**

**emailAlias**:  *Object*,  The email alias object to remove from the user's account.

**Returns**

*Observable*,  An empty observable.

class BoxUser.User
------------------
**Members**

**boxHttp**,  


**urlType**,  


**task**,  


**id**,  


**type**,  


**assign_to**,  


**id**,  


**login**,  


**notify**,  


**notify**,  


**force**,  


**owned_by**,  


**id**,  


**email**,  


**constructor**,  


