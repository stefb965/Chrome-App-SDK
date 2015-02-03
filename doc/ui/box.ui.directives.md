**Overview:** Directives supporting the Box UI.

**Author:** jmeadows

boxBreadCrumbs(boxItemSelected)
-------------------------------
Builds a breadcrumb list from a user's root folder to the current item (file or folder). Must be inside
a @see BoxFolderView .

**Parameters**

**boxItemSelected**:  *Object*,  Box item selected service

**Returns**

*Object*,  directive for displaying breadcrumbs for an item.

boxItem(boxItemSelected)
------------------------
Directive for showing the details of a Box item, including its name, thumbnail, mtime/ctime, and byte size.

**Parameters**

**boxItemSelected**:  *Object*,  Box item selected service

**Returns**

*Object*,  directive for displaying a Box item (file or folder)

boxItemThumbnail(chrome)
------------------------
Directive for showing an item's thumbnail.

**Parameters**

**chrome**:  *Object*,  Service representing chrome APIs

**Returns**

*Object*,  directive for displaying a Box item thumbnail

boxAllFiles(boxItemSelected)
----------------------------
Directive for showing a folder view of the user's root folder.

**Parameters**

**boxItemSelected**:  *Object*,  Box item selected service

**Returns**

*Object*,  directive for viewing all items in the root folder

BoxFolderView(boxSdk, boxItemSelected)
--------------------------------------
Directive for viewing a folder's items.

**Parameters**

**boxSdk**:  *Object*,  Box SDK service

**boxItemSelected**:  *Object*,  Box item selected service

**Returns**

*Object*,  directive for viewing a folder's items.

