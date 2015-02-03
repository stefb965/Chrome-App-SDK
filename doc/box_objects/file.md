**Overview:** Box File object. @see http://developers.box.com/docs/#files

**Author:** jmeadows

BoxFile.download(params)
------------------------
Download the file.

**Parameters**

**params**:  *Object*,  Can contain a version (Integer) value specifying which version to download

**Returns**

*Observable*,  An observable containing the integer ID identifying the download

BoxFile.getContent(params)
--------------------------
Get the content of the file.

**Parameters**

**params**:  *Object*,  Parameters related to file download. See https://developers.box.com/docs/#files-download-a-file

**Returns**

*Observable*,  An observable containing the file content.

BoxFile.replace(name, content, mtime, ifMatch)
----------------------------------------------
Upload a new version of the file.

**Parameters**

**name**:  *string*,  The name of the file

**content**:  *ArrayBuffer* | *Blob*,  The file content to upload

**mtime**:  *String*,  Timestamp that will be assigned to the file's modified_at property

**ifMatch**:  *Boolean*,  Whether or not to send an If-Match header with the request

**Returns**

*Observable*,  An observable containing the new file object.

BoxFile.getHistory()
--------------------
Get a list of file versions for the file.

**Returns**

*Observable*,  An observable sequence of file version objects for the file.

BoxFile.getThumbnail(extension, params)
---------------------------------------
Get image data for the file's thumbnail.

**Parameters**

**extension**:  *String*,  The file extension to retrieve.  Can be png, gif, or jpg.

**params**:  *Object*,  Parameters specifying the thumbnail's dimensions.

**Returns**

*Observable*,  An observable containing the thumbnail image data as a Blob.

BoxFile.getComments()
---------------------
Get a list of comments for the file.

**Returns**

*Observable*,  An observable sequence of comment objects for the file.

BoxFile.getTasks()
------------------
Get a list of tasks for the file.

**Returns**

*Observable*,  An observable sequence of task objects for the file.

BoxFile.getMetadata(type)
-------------------------
Get the file's associated metadata.

**Parameters**

**type**:  *String*,  Type of metadata. Must be properties.

**Returns**

*Observable*,  An observable containing the metadata object.

BoxFile.createMetadata(type, value)
-----------------------------------
Create metadata associated with the file.

**Parameters**

**type**:  *String*,  Type of metadata to create. Must be properties.

**value**:  *Object*,  Hash containing key-value pairs to be stored as metadata for the file

**Returns**

*Observable*,  An observable containing the created metadata object.

class BoxFile.File
------------------
**Members**

**boxHttp**,  


**urlType**,  


**url**,  


**url**,  


**url**,  


**headers**,  


**Authorization**,  


**params**,  


**responseType**,  


**boxHttp**,  


**etag**,  


**fileId**,  


**headers**,  


**Content-MD5**,  


**If-Match**,  


**filename**,  


**content_modified_at**,  


**that**,  


**responseType**,  


**params**,  


**that**,  


**that**,  


**constructor**,  


