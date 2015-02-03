**Overview:** Box Group object. @see http://developers.box.com/docs/#groups

**Author:** jmeadows

BoxGroup.update(params)
-----------------------
Update the group's information.

**Parameters**

**params**:  *Object*,  An object containing parameters to update  (currently just name is supported)

**Returns**

*Observable*,  An observable containing a new Group object with the updated parameters.

BoxGroup.delete()
-----------------
Deletes the group.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

BoxGroup.getMemberships()
-------------------------
Get a group's memberships, specifying a user, a group, and the user's role in the group.

**Returns**

*Observable*,  An observable sequence of membership objects.

BoxGroup.addMember(user, role)
------------------------------
Add a new email alias to the user's account.

**Parameters**

**user**:  *User*,  The user to add to the group

**role**:  *String*,  The role of the user in the group

**Returns**

*Observable*,  An observable containing the newly created membership object.

BoxGroup.updateMembership(membership, role)
-------------------------------------------
Update a group membership.

**Parameters**

**membership**:  *Object*,  A membership object to update

**role**:  *String*,  The role of the user in the group

**Returns**

*Observable*,  An observable containing the updated membership object.

BoxGroup.deleteMembership(membership)
-------------------------------------
Remove a member from the group.

**Parameters**

**membership**:  *Object*,  A membership object to delete

**Returns**

*Observable*,  An empty observable.

BoxGroup.getCollaborations()
----------------------------
Gets a collection of collaboration objects for the task.

**Returns**

*Observable*,  An observable sequence of Box Collaboration objects.

