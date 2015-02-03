**Overview:** Box Metadata object.

**Author:** jmeadows

BoxMetadata.sendUpdate(update)
------------------------------
Updates this metadata object with the instructions specified in the given update object.

**Parameters**

**update**:  *MetadataUpdate*,  A metadata update object specifying what to update.

**Returns**

*Observable*,  An observable containing the updated metadata object

BoxMetadata.delete()
--------------------
Delete this metadata object.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

BoxMetadata.startUpdate()
-------------------------
Create a metadata update object that can be used to update this metadata object.

**Returns**

*MetadataUpdate*,  The update object that can be used to update this metadata object.

BoxMetadata.add(path, value)
----------------------------
Adds an instruction to this update object to add a new key/value pair to the metadata object.

**Parameters**

**path**:  *String*,  Specifies where to add the key

**value**:  *String*,  The value to add

**Returns**

*undefined*,  void

BoxMetadata.remove(path, oldValue)
----------------------------------
Adds an instruction to this update object to remove a key/value pair from the metadata object.

**Parameters**

**path**:  *String*,  Specifies which key to remove

**oldValue**:  *String*,  If specified, will only execute the replace if the current value matches this parameter

**Returns**

*undefined*,  void

BoxMetadata.replace(path, value, oldValue)
------------------------------------------
Adds an instruction to this update object to replace

**Parameters**

**path**:  *String*,  Specifies which key to replace

**value**:  *String*,  The new value for the specified key

**oldValue**:  *String*,  If specified, will only execute the replace if the current value matches this parameter

**Returns**

*undefined*,  void

BoxMetadata.test(path, value)
-----------------------------
Adds an instruction to this update object to test the metadata object for the existence of a key/value pair.
The next instruction will only be executed if this test passes.

**Parameters**

**path**:  *String*,  Sepcifies which key to test

**value**:  *String*,  Specifies the value to test for

**Returns**

*undefined*,  void

class BoxMetadata.Metadata
--------------------------
**Members**

**file**,  


**boxHttp**,  


**ops**,  


**file**,  


**headers**,  


**Content-Type**,  


**op**,  


**path**,  


**value**,  


**op**,  


**path**,  


**op**,  


**path**,  


**value**,  


**op**,  


**path**,  


**value**,  


**constructor**,  


