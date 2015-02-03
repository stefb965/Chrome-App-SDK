**Overview:** Box File Version object. @see http://developers.box.com/docs/#files-view-versions-of-a-file

**Author:** jmeadows

BoxFileVersion.promoteToCurrent()
---------------------------------
Promotes this version of the file to the current version.

**Returns**

*Observable*,  An observable containing a new file version object.

BoxFileVersion.delete()
-----------------------
Delete the file version.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

BoxFileVersion.download()
-------------------------
Download the file.

**Returns**

*Observable*,  An observable containing the integer ID identifying the download.

class BoxFileVersion.FileVersion
--------------------------------
**Members**

**file**,  


**boxHttp**,  


**file**,  


**type**,  


**id**,  


**version**,  


**constructor**,  


