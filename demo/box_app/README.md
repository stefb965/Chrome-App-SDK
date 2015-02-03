Box for Chrome App
==================

An example packaged app showing how to use the SDK in an application.

The example showcases the following SDK features:
* File upload and download
* Inclusion in an HTML file in a packaged app
* Getting file thumbnails
* Using file content

The example also showcases the following Chrome features:
* File System
* Notifications

Using the extension
-------------------

###Configuring

The app requires an API client ID and client secret to function. Uncomment the lines and replace them with your ID and secret.
```javascript
angular.module('box.conf')
    //.constant('clientSecret', 'uII-----------------------------')
    //.constant('clientId', 'i3p-----------------------------');
```

###Building

Building the application requires Grunt.
*If you are new to Grunt, you will find a lot of answers to your questions in their [getting started guide](http://gruntjs.com/getting-started).

From the same directory as Gruntfile.js, type
```
npm install
bower install
grunt
```

###Installing

To install, enable developer mode and select this folder from the 'Load Unpacked Extension' dialog.  For more information, see the [Chrome Developer Guide](https://developer.chrome.com/extensions/getstarted#unpacked).