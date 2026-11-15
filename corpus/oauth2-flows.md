# OAuth 2.0 Authorization Flows

OAuth 2.0 is an authorization framework that lets a user grant an application limited access to their data on another service, without handing the application their password. The user is the resource owner, the application is the client, the service holding the data is the resource server, and the service that issues tokens is the authorization server.

The authorization code flow is the standard choice for applications that can keep a secret. The client redirects the user's browser to the authorization server, where the user signs in and approves the requested scopes. The authorization server redirects back with a short-lived authorization code. The client's backend then exchanges that code, together with its client credentials, directly with the authorization server and receives an access token. The token never passes through the browser's address bar or history.

Public clients, such as mobile apps and single-page web apps, cannot keep a client secret, because anyone can extract it from the shipped code. For them the authorization code flow is combined with PKCE, pronounced pixy, which stands for Proof Key for Code Exchange. The client generates a random code verifier, sends a hash of it with the authorization request, and sends the verifier itself when exchanging the code. The authorization server checks the two match, which stops an attacker who intercepted the code from redeeming it.

Access tokens are deliberately short-lived, often minutes to an hour, so a leaked token has a limited window of use. A refresh token, issued alongside for trusted clients, lets the client obtain fresh access tokens without involving the user again, until the refresh token expires or is revoked.

Scopes name the permissions a token carries, such as reading a profile or writing files. A resource server must check both that a token is valid and that its scopes cover the attempted operation. A valid token with the wrong scope should be rejected with 403 Forbidden, not accepted.
