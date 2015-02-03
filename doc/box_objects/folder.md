**Overview:** Box Folder object. @see http://developers.box.com/docs/#folders

**Author:** jmeadows

BoxFolder.getItems(fields)
--------------------------
Get a folder's items.

**Parameters**

**fields**:  *String*,  Comma separated list of fields that should be returned about each item

**Returns**

*Observable*,  An observable sequence of the folder's items.

BoxFolder.createSubfolder(name)
-------------------------------
Create a subfolder with the folder as its parent.

**Parameters**

**name**:  *String*,  The name of the new subfolder

**Returns**

*Observable*,  An observable containing the new folder object.

BoxFolder.getCollaborations()
-----------------------------
Get a list of collaborations on the folder.

**Returns**

*Observable*,  An observable sequence of the folder's collaborations.

BoxFolder.addCollaboration(role, collaborator, notify)
------------------------------------------------------
Invite a collaborator to a folder.

**Parameters**

**role**:  *String*,  The [role](https://support.box.com/entries/20366031-what-are-the-different-collaboration-permissions-and-what-access-do-they-provide) granted to the invited collaborator

**collaborator**:  *User* | *Group* | *Object*,  The collaborator that will be invited to the folder.  Must have properties of type ("user" or "group"), and id or login (email address)

**notify**:  *Boolean*,  whether or not the user should receive an email notification

**Returns**

*Observable*,  An observable containing the new collaboration object created by the request.

BoxFolder.uploadFileTo(name, content, ctime, mtime)
---------------------------------------------------
Upload a file to the folder.

**Parameters**

**name**:  *String*,  The name of the file

**content**:  *ArrayBuffer* | *Blob*,  The file content

**ctime**:  *Timestamp*,  Timestamp the new file will have as its created at time

**mtime**:  *Timestamp*,  Timestamp the new file will have as its modified at time

**Returns**

*Observable*,  An observable containing the new file object.

class BoxFolder.Folder
----------------------
**Members**

**boxHttp**,  


**urlType**,  


**url**,  


**boxHttp**,  


**params**,  


**fields**,  


**offset**,  


**limit**,  


**name**,  


**parent**,  


**id**,  


**notify**,  


**item**,  


**type**,  


**id**,  


**accessible_by**,  


**role**,  


**boxHttp**,  


**parentId**,  


**headers**,  


**Content-MD5**,  


**filename**,  


**parent_id**,  


**content_created_at**,  


**content_modified_at**,  


**constructor**,  


