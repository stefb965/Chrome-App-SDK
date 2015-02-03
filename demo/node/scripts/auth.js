/* eslint-disable no-process-exit */
'use strict';
var argv = require('argv'),
    path = require('path');
var sdkMod, angularjs, rx, options, injector, boxHttp, clientId, clientSecret, authUrl, deviceId;

options = argv.option([
    {
        name: 'client-id',
        short: 'i',
        type: 'string',
        description: 'The Box application id for your application.',
        example: '--client-id=xxx or -i xxx'
    },{
        name: 'client-secret',
        short: 's',
        type: 'string',
        description: 'The Box Client Secret for your application.',
        example: '--client-secret=xxx or -s xxx'
    },
    {
        name: 'auth-url',
        short: 'u',
        type: 'string',
        description: 'The Box website auth URL',
        example: '--auth-url=https://www.box.com/api/oauth2'
    },
    {
        name: 'device-id',
        short: 'd',
        type: 'string',
        description: 'Optional device ID to send with auth requests.',
        example: '--device-id=0'
    }
]).run();

clientId = options.options['client-id'];
clientSecret = options.options['client-secret'];
authUrl = options.options['auth-url'];
deviceId = options.options['device-id'];
sdkMod = require('./sdk.js')(path.join(__dirname, '/../node_modules/Box-Chrome-SDK/dist/Box-Chrome-SDK.js'), clientId, clientSecret, authUrl, deviceId);
angularjs = sdkMod.angular;
rx = sdkMod.Rx;
require('./identity.js')(angularjs, rx, clientId, authUrl);
require('./storage.js')(angularjs, rx);
injector = angularjs.injector(['ng', 'box.sdk', 'box.http']);
boxHttp = injector.get('boxHttp');

boxHttp.auth().subscribe(function(token) {
    console.log(token);
    process.exit(0);
}, function(error) {
    console.log(error); process.exit(1);
});

module.exports = injector;
