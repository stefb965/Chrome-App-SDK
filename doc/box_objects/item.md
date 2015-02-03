**Overview:** Box Item object. Base class for files and folders.

**Author:** jmeadows

Item.updateInfo(params, ifMatch)
--------------------------------
Update this item's information.

**Parameters**

**params**:  *Object*,  Specifies the information to update.  See [http://developers.box.com/docs/#files-update-a-files-information](Updating files) and [http://developers.box.com/docs/#folders-update-information-about-a-folder](Updating folders).

**ifMatch**:  *Boolean*,  Whether or not to send an If-Match header

**Returns**

*Observable*,  An observable containing the updated item.

Item.getSharedLink(access, unshareDateTime, permissions)
--------------------------------------------------------
Get a link that can be safely shared with others. See the [http://blog.box.com/2012/04/share-your-stuff-and-stay-in-control-using-box-shared-links/](shared link blog post).

**Parameters**

**access**:  *String*,  Controls who may access the shared link. Can be one of open, company, collaborators, or null (default).

**unshareDateTime**:  *Timestamp*,  When the shared link will automatically expire

**permissions**:  *Object*,  Controls whether users of the shared link can preview or download the item

**Returns**

*Observable*,  An observable containing the shared link.

Item.copyTo(parentFolder, name)
-------------------------------
Copy an item to another parent folder.

**Parameters**

**parentFolder**:  *Folder*,  The destination Box folder for the copy operation

**name**:  *String*,  The new name for the copied item

**Returns**

*Observable*,  An observable containing the new copied item.

Item.delete(recursive, ifMatch)
-------------------------------
Delete the item.

**Parameters**

**recursive**:  *Boolean*,  Whether or not the delete should be recursive (only valid for deleting folders)

**ifMatch**:  *Boolean*,  Whether or not to send an If-Match header

**Returns**

*Observable*,  An observable containing the Box API response for this request.

Item.commentOn(message)
-----------------------
Adds a comment to a file or folder.

**Parameters**

**message**:  *String*,  The message to leave as a comment

**Returns**

*Observable*,  An observable containing the newly created Box comment object.

Item.restoreFromTrash(parentFolder, name)
-----------------------------------------
Restore an item from the trash.

**Parameters**

**parentFolder**:  *Folder*,  The destination Box folder to restore the item to

**name**:  *String*,  The new name for the restored item

**Returns**

*Observable*,  An observable containing the restored item.

Item.deleteFromTrash(ifMatch)
-----------------------------
Permanently delete the item from the trash.

**Parameters**

**ifMatch**:  *Boolean*,  Whether or not to send an If-Match header

**Returns**

*Observable*,  An observable containing no result. The onCompleted callback will signal that the item was successfully deleted.

