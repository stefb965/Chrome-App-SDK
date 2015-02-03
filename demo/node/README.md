Box SDK in Node
===============

An example node.js app showing how to use the SDK node.

The example showcases the following SDK features:
* Configuring client id and secret
* Auth

The example also showcases how to use the SDK on node.  The strategy is to use jsdom to evaluate the SDK script and to mock out the SDK's Chrome dependencies.
* Identity - replaced by launching a local webserver and Chrome to do the OAuth2 dance.
* Storage - replaced by an in-memory cache

Using the app
-------------

The app requires an API client ID and client secret to function. They can be passed on the command line.
```
node scripts/auth.js --client-id=i3p----------------------------- --client-secret=uII-----------------------------
```

This will launch Chrome and show the Box login screen, exchanging the web auth code for a Box access token and printing it to stdout.
