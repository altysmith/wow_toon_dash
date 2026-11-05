# Battle.net account connection

The local prototype can connect a Battle.net account using Blizzard's authorization-code OAuth flow and the `wow.profile` scope. The callback verifies state, exchanges the code on the server, and calls `/userinfo`. The short-lived user access token is kept only in an encrypted, HttpOnly cookie, capped at its reported expiry or 24 hours, so the user can run a profile namespace probe. The status endpoint never returns the token to the browser. No refresh token is stored; reconnect after expiry.

## Local setup

Create a Blizzard developer application and register this exact redirect URL in its settings:

```text
http://localhost:3000/api/battlenet/callback
```

Set these values in `.env.local` and restart the app:

```text
BLIZZARD_CLIENT_ID=
BLIZZARD_CLIENT_SECRET=
BLIZZARD_REDIRECT_URI=http://localhost:3000/api/battlenet/callback
APP_SESSION_SECRET=
```

Generate a strong app session secret locally, for example with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Do not commit `.env.local` or share the client secret/session secret in chat. Production callback URLs must use HTTPS.

Open **Forever Data Research** and choose **Connect Battle.net**. After Blizzard approves access, the app confirms the account. Then enter a namespace candidate from a Forever-specific source and run the character-list probe. Results appear as an unverified preview and do not import or update a manual profile.

## Forever data boundary

The correct Forever profile namespace and character-list behavior remain unknown. The probe requires an explicit region and namespace; it does not guess or prefill a retail or Classic namespace. Blizzard may return 404 both for an unsupported namespace and an account with no characters in that namespace. A successful response still needs verification that the returned characters belong to WoW Forever.

The encrypted cookie is local prototype session storage, not a multi-user production account system. Production deployment needs a reviewed session store, expiry/revocation policy, CSRF review, and access control before public exposure.
