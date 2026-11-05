# Data Sources

Last checked: 2026-11-05

## Blizzard Battle.net APIs

| Field | Current finding |
| --- | --- |
| Provider | Blizzard Entertainment |
| Status | Official |
| Integration under test | OAuth client credentials plus the WoW Character Profile endpoint |
| Authentication | Blizzard developer client ID and client secret; account-wide character listing requires a separate user authorization flow |
| Rate limits | Must be confirmed from current official documentation before production use |
| License and usage | Must be confirmed from Blizzard developer terms before production use |
| Forever compatibility | **Unverified** |
| Two-part names | Existing community implementation reports the standard profile data exposing only one name; official behavior remains unverified |
| Reliability | Appropriate preferred source if Forever is supported; otherwise an adapter must fall back to manual entry or a permitted addon |

### Prototype integration

The prototype implements a server-side experimental adapter for:

```text
POST https://oauth.battle.net/token
GET  https://{region}.api.blizzard.com/profile/wow/character/{realm}/{primaryName}
```

Credentials never enter browser code. The adapter returns a normalized subset and marks Forever compatibility as unverified. It does not import the response into the profile automatically.

### Current blockers

- This cloud environment denied access to `develop.battle.net` under its current network policy, so the current API documentation could not be verified here.
- No Blizzard developer credentials are configured.
- Bigcrisp Lolo's region and realm have not been confirmed. The supplied Armory screenshot suggests `EU` and `Blackrock`, but this is only an inference.
- It is unknown whether the standard endpoint recognizes Forever characters, primary names, or the primary/secondary pair.
- Account-wide character discovery requires user OAuth, callback handling, protected token storage, and explicit authorization. It is outside this first public-lookup slice.

## Community implementation evidence

The public `cageymage/fuzion` project models Forever characters with required main and secondary names and notes that Blizzard sync provides only one name. This is useful corroboration, not an official API contract.

- https://github.com/cageymage/fuzion/pull/46
- https://github.com/cageymage/fuzion/blob/main/backend/migrations/000006_add_character_secondary_name.up.sql

## Questions still requiring official answers

- Does Blizzard expose Forever character profiles?
- Does the profile API return both name parts?
- Can equipment, talents, professions, statistics, level, and experience be queried?
- Does user OAuth enumerate Forever characters on an account?
- Which namespace and locale rules apply to Forever?
- What rate limits and caching requirements apply?
- Which fields require an addon or manual entry?
