### BottomModal.tsx log in variant ###
- handles initial log in request
- Generates Proof Key for Code Exchange (PKCE) 
- (code_verifier, which prevents authorisation code interception attacks. also used to derive code_challenge. When code exchanged for token, server compares code_verifier to code_challenge, proving the app exchanging the code is the same one that initiated log in) 
- (csrfState prevents cross-site request forgery. attached to auth request, and later when callback returns with ?state... , it is checked that it matches what was originally sent)
- stores both in asyncStorage

### Backed OAuth Start ###
- code challenge created 
- tiktok.com/auth url created with parameters
- redirect to constructed url (tiktok login page)

### Tiktok Callback ###
- Tiktok log in page returns to callback endpoint with code & state
- checks code and state are valid
- redirected to tiktok-callback.tsx in front end, with code and state
- here, CSRF state is validated to returned state, and the token exchange request is initiated. Sent with code and code_verifier
- also storing of tokens & data, and rerouting to explore page

### Token exchange ###
- code & code verifier validated against eachother
- tiktok API call with parameters, which returns access_token & refresh token

Example shape of `response.data` from the exchange endpoint (`POST` to TikTok `/v2/oauth/token/`):

```json
{
  "access_token": "act.<REDACTED>",
  "expires_in": 86400,
  "open_id": "<REDACTED>",
  "refresh_expires_in": 31536000,
  "refresh_token": "rft.<REDACTED>",
  "scope": "user.info.basic",
  "token_type": "Bearer"
}
```

Never commit real tokens. Store refresh/access tokens only on your backend or in secure device storage.


