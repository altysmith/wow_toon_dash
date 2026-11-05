# Battle.net account connection

The local prototype can connect a Battle.net account using Blizzard's authorization-code OAuth flow and the `wow.profile` scope. The callback verifies state, exchanges the code on the server, calls `/userinfo`, then discards the access token. The app stores only the returned account ID, BattleTag when available, and connection time in an encrypted, HttpOnly cookie.

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

Open **Forever Data Research** and choose **Connect Battle.net**. After Blizzard approves access, the app confirms the account. It does not import a character yet.

## Forever data boundary

The correct Forever profile namespace and character-list behavior remain unknown. The OAuth connection does not probe retail or Classic namespaces and does not guess a Forever namespace. Character discovery stays unavailable until an authorized Forever-specific source and namespace are verified.

The encrypted cookie is local prototype session storage, not a multi-user production account system. Production deployment needs a reviewed session store, expiry/revocation policy, CSRF review, and access control before public exposure.
