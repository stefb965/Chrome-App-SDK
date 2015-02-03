**Overview:** Box SDK public interface.

**Author:** jmeadows

logout()
--------
Logs out from Box, revoking the current API auth and refresh tokens.

**Returns**

*Observable*,  An observable containing the result of the API request.

getFolder(id)
-------------
Get the folder object with a given id.

**Parameters**

**id**:  *String*,  The Box folder id identifying the requested folder

**Returns**

*Observable*,  An observable containing the requested folder object.

getFile(id)
-----------
Get the file object with a given id.

**Parameters**

**id**:  *String*,  The Box file id identifying the requested file

**Returns**

*Observable*,  An observable containing the requested file object.

getTrashedFolder(id)
--------------------
Get the folder object with a given id from the trash.

**Parameters**

**id**:  *String*,  The Box folder id identifying the requested trashed folder

**Returns**

*Observable*,  An observable containing the requested trashed folder object.

getTrashedFile(id)
------------------
Get the file object with a given id from the trash.

**Parameters**

**id**:  *String*,  The Box file id identifying the requested trashed file

**Returns**

*Observable*,  An observable containing the requested trashed file object.

getTrashedItems(fields)
-----------------------
Get a list of all items in the trash.

**Parameters**

**fields**:  *String*,  A comma separated list of fields that should be returned for each trashed item

**Returns**

*Observable*,  An observable sequence of files and/or folders that are in the trash.

getPendingCollaborations()
--------------------------
Get a list of all pending collaborations.

**Returns**

*Observable*,  An observable sequence of collaboration objects that are still pending.

search(query, params)
---------------------
Search Box for content. Read more here [http://developers.box.com/docs/#search].

**Parameters**

**query**:  *String*,  The string to search for

**params**:  *Object*,  Specifies how the query will be executed.

**Returns**

*Observable*,  An observable sequence of files and folders.

createTask(item, params)
------------------------
Create a new task.

**Parameters**

**item**:  *File* | *Object*,  The file the task will be associated with.

**params**:  *Object*,  Can include message (string) and/or due_at (timestamp).

**Returns**

*Observable*,  An observable containing the newly created Task.

getUserInfo()
-------------
Gets information about the logged-in user.

**Returns**

*Observable*,  An observable containing the User object for the logged-in user.

getUsers(filter)
----------------
Gets all users in the current user's enterprise if the current user is an enterprise admin.

**Parameters**

**filter**:  *String*,  A string used to filter the results to only users starting with the filter in either the name or the login

**Returns**

*Observable*,  An observable stream of user objects in the current enterprise.

createUser(params)
------------------
Creates a new enterprise user if the current user is an enterprise admin.

**Parameters**

**params**:  *Object*,  A hash of properties for the user.  Must contain at least login and name.

**Returns**

*Observable*,  An observable containing the new user object.

getGroups()
-----------
Get all of the groups for the logged-in user.

**Returns**

*Observable*,  An observable sequence of groups for the logged-in user.

createGroup(name)
-----------------
Create a new group.

**Parameters**

**name**:  *String*,  The name for the new group

**Returns**

*Observable*,  An observable containing the newly created group.

subscribeToEvents(streamPosition)
---------------------------------
Subscribe to events for the current user.

**Parameters**

**streamPosition**:  *String*,  The stream position from which to start streaming events.

**Returns**

*Observable*,  An observable sequence of BoxEvent objects. Disposing of this sequence unsubscribes.

