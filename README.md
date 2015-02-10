Chrome-App-SDK
==============

[![Project Status](http://opensource.box.com/badges/active.svg)](http://opensource.box.com/badges)
[![Travis build status](https://travis-ci.org/box/box-chrome-sdk.png?branch=master)](https://travis-ci.org/box/box-chrome-sdk)
[![NPM info](https://nodei.co/npm/box-chrome-sdk.png?downloads=true)](https://www.npmjs.com/package/box-chrome-sdk)

Box V2 API SDK for Chrome apps and extensions written in AngularJS. With some effort, it can be used from node.js as well.

Installing
----------

####bower
```bash
bower install box-chrome-sdk
```

####npm
```bash
npm install box-chrome-sdk
```

Quick Start
-----------

### Setup

#### Make sure the following permissions are specified in your app's manifest:

```json
permissions: [
    "downloads",
    "identity",
    "storage",
    "https://*.box.com/*",
    "https://*.boxcdn.com/*",
    "https://*.boxcdn.net/*",
    "https://*.boxcloud.com/*"
]
```

#### Include SDK and requirements javascript
```
<script src="Box-Chrome-SDK.bower_components.min.js"></script>
<script src="Box-Chrome-SDK.min.js"></script>
```

#### Configure the SDK with your Box app's client ID and secret
```javascript
angular.module('box.conf')
    .constant('clientSecret', 'uII-----------------------------')
    .constant('clientId', 'i3p-----------------------------');
```

####Add a dependency to box.sdk to your angular module####

```javascript
angular.module('myModule', ['box.sdk']);
```

#### Require boxSdk as a dependency in your angular services or directives

```javascript
module.directive('myDirective', ['boxSdk', function(boxSdk) {

}]);
```

### Making API Calls

Most functions in the SDK return [Rx Observables](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md).
Mastery of reactive programming, however, is not required to use these objects.

To get at an API result, simply subscribe to the observable and read the result inside the callback.

#### Get a folder object

```javascript
boxSdk.getFolder(0).subscribe(function(folder) {
    console.log(folder.name);
});

// -> All Files
```

#### Search Box

```javascript
boxSdk.search('query text')
    .subscribe(function(result) {
        console.log(result.type + ' -> ' + result.name);
    });

// -> Folder -> Query 1
// -> File -> Results Query
```

### Device Pinning

Some Box enterprises enforce device pinning, and require that auth requests are accompanied by a device ID. Chrome doesn't support a device specific identifier, and that is by design.

However, it should be possible to supply a device ID, either from an application/extension setting supplied by a user, or by Chrome [managed storage](http://www.chromium.org/administrators/).  Passing it with auth requests is as simple as:

```javascript
var http = angular.module('box.http'),
    deviceId = getDeviceIdSomehow();

http.factory('boxDeviceIdInterceptor',['$q', 'authUrl', function($q, authUrl){
    return {
        request: function(config) {
            if (config.url.indexOf(authUrl) === 0) {
                config.data.append('box_device_id', deviceId);
            }
            return config;
        }
    };
}]);

http.config(['$httpProvider',function($httpProvider) {
    $httpProvider.interceptors.push('boxDeviceIdInterceptor');
}]);
```


### Docs and examples

#### Search Box from OmniBox Example
[Example extension](demo/search_extension/README.md) showing how to use the SDK in an extension's background page.

#### Upload to Box Example
[Example extension](demo/uploader_extension/README.md) showing how to use the SDK in a content script.

#### Box Chrome App Example
[Example packaged app](demo/box_app/README.md) showing how to use the SDK in a packaged app.

#### Node.js Example
[Example login script](demo/node/README.md) showing how to use the SDK in a node.js script.

#### Notifications Example
[Example events script](demo/notifications/README.md) showing how to use the SDK to monitor events.

#### Documentation
[Docs](doc/readme.md)

### Building the SDK

Building the SDK requires Grunt.
*If you are new to Grunt, you will find a lot of answers to your questions in their [getting started guide](http://gruntjs.com/getting-started).

From the same directory as Gruntfile.js, type
```
npm install
bower install
grunt
```

### Running the tests
```
grunt test
```

### Contributing

See [CONTRIBUTING](blob/master.CONTRIBUTING.md).

## Support

Need to contact us directly? Email oss@box.com and be sure to include the name of this project in the subject.

## Copyright and License

Copyright 2014 Box, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.