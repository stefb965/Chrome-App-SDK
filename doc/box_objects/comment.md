**Overview:** Box Comment object. @see http://developers.box.com/docs/#comments

**Author:** jmeadows

BoxComment.updateMessage(message)
---------------------------------
Updates the comment's message.

**Parameters**

**message**:  *String*,  The new message that should be in the comment

**Returns**

*Observable*,  An observable containing the updated comment.

BoxComment.getInfo()
--------------------
Get information about the comment.

**Returns**

*Observable*,  An observable containing a new comment object with this comment's
full information.

BoxComment.delete()
-------------------
Delete the comment.

**Returns**

*Observable*,  An observable containing the Box API response for this request.

class BoxComment.Comment
------------------------
**Members**

**boxHttp**,  


**urlType**,  


**message**,  


**constructor**,  


