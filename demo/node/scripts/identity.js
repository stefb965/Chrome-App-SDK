'use strict';

var express = require('express'),
    spawn = require('child_process').spawn,
    https = require('https'),
    fs = require('fs'),
    path = require('path');
var rx,
    clientId,
    authUrl;

function getAuthCode(params, callback) {
    var options = {
            key: fs.readFileSync(path.join(__dirname, '../resources/self-signed.key')),
            cert: fs.readFileSync(path.join(__dirname, '../resources/self-signed.cert'))
        },
        app = express(),
        chrome,
        server;

    // Return location of chrome.exe file for a given Chrome directory (available: "Chrome", "Chrome SxS").
    function getChromeExe(chromeDirName) {
        if (process.platform !== 'win32') {
            return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        }
        var windowsChromeDirectory, i, prefix;
        var suffix = '\\Google\\' + chromeDirName + '\\Application\\chrome.exe';
        var prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']];

        for (i = 0; i < prefixes.length; i++) {
            prefix = prefixes[i];
            if (fs.existsSync(prefix + suffix)) {
                windowsChromeDirectory = prefix + suffix;
                break;
            }
        }

        return windowsChromeDirectory;
    }

    app.get('/finish_auth', function(req) {
        chrome.kill();
        callback(req.url);
    });
    app.get('/start_auth', function(req, res) {
        res.write('' +
            '<!DOCTYPE html>' +
            '<html>' +
            '<body>' +
            '<iframe height="1000" width="1000"' +
            'src="' + authUrl + '/authorize?client_id=' +
            clientId +
            '&response_type=code&redirect_uri=https://localhost:9888/finish_auth"></iframe>' +
            '</body>' +
            '</html>');
        res.end();
    });

    server = https.createServer(options, app).listen(9888, function() {
        var command = getChromeExe('Chrome');
        var flags = [
            '--user-data-dir=' + this.tempDir,
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-default-apps',
            '--disable-popup-blocking',
            '--disable-translate',
            '--ignore-certificate-errors'
        ].concat(['https://localhost:' + server.address().port + '/start_auth']);
        chrome = spawn(command, flags);
    });
}

module.exports = function(angular, _rx, _clientId, _authUrl) {
    rx = _rx;
    clientId = _clientId;
    authUrl = _authUrl || 'https://www.box.com/api/oauth2';
    angular.module('chrome.identity')
        .service('chromeIdentity', function() {
            this.login = rx.Observable.fromCallback(getAuthCode);
        });
};
