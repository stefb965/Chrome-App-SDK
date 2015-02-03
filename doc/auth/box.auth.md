**Overview:** An angular module and service providing OAuth2 access to the SDK.

**Author:** jmeadows

login()
-------
Present the user with a login form from Box, requesting their login and that they grant access to
your application.

**Returns**

*Observable*,  An observable that will contain an authorization code if the user performs
the login to Box successfully and grants access to your application.

getToken(code)
--------------
Exchange an authorization code for an authorization token.

**Parameters**

**code**:  *String*,  An authorization code returned from @see login

**Returns**

*Observable*,  An observable that will contain the HTTP result from the request
to url https://www.box.com/api/oauth2 containing an authorization token and a refresh token.

refreshToken(refreshToken)
--------------------------
Exchange a refresh token for a new authorization token.

**Parameters**

**refreshToken**:  *String*,  A refresh token returned from @see getToken or this function.

**Returns**

*Observable*,  An observable that will contain the HTTP result from the request
to url https://www.box.com/api/oauth2 containing an authorization token and a refresh token.

