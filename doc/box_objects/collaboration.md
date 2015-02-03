**Overview:** Box Collaboration object. @see http://developers.box.com/docs/#collaborations

**Author:** jmeadows

BoxCollaboration.edit(role, status)
-----------------------------------
Edit the collaboration, changing its [role](https://support.box.com/entries/20366031-what-are-the-different-collaboration-permissions-and-what-access-do-they-provide)
or whether or not the collaboration has been accepted.

**Parameters**

**role**:  *String*,  The new role for the collaboration.

**status**:  *Boolean*,  The new status for the collaboration.

**Returns**

*Observable*,  An observable containing a new, updated collaboration object.

BoxCollaboration.delete()
-------------------------
Delete the collaboration.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

BoxCollaboration.getInfo()
--------------------------
Get information about the collaboration.

**Returns**

*Observable*,  An observable containing a new collaboration object with this collaboration's
full information.

class BoxCollaboration.Collaboration
------------------------------------
**Members**

**boxHttp**,  


**urlType**,  


**role**,  


**status**,  


**constructor**,  


