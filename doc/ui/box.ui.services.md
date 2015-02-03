**Overview:** Services supporting the Box UI.

**Author:** jmeadows

boxItemSelected(rx)
-------------------
Service that notifies subscribers when a new box item is selected.

**Parameters**

**rx**:  *Object*,  RxJS namespace object

**Returns**

*Object*,  Service with method selectItem and property selectedItem

boxItemPicker($modal, rx, boxItemSelected, BoxFolder)
-----------------------------------------------------
Service for opening a Box file or folder picker. Uses the @see $modal service from angular.ui.bootstrap.
Supports SAVE_AS, OPEN_FILE, and OPEN_FOLDER modes.

**Parameters**

**$modal**:  *Object*,  ng-modal service

**rx**:  *Object*,  RxJS namespace object

**boxItemSelected**:  *Object*,  boxItemSelected service

**BoxFolder**:  *function*,  Box Folder constructor

**Returns**

*Object*,  service with method open and property modes

