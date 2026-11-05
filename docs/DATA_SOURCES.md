# WoW Forever Data Sources

Last checked: 2026-11-05

## Scope rule

This project researches World of Warcraft: Forever only. Retail, Classic, and Worldsoul Armory behavior must not be used as evidence for Forever characters, servers, names, classes, talents, or progression.

## Blizzard Battle.net APIs (investigated, not accepted as a Forever source)

| Field | Current finding |
| --- | --- |
| Provider | Blizzard Entertainment |
| Status | Official Blizzard API; Forever coverage unverified |
| Integration under test | OAuth client credentials plus the WoW Character Profile endpoint |
| Authentication | Blizzard developer client ID and client secret; account-wide character listing requires a separate user authorization flow |
| Rate limits | Must be confirmed from current official documentation before production use |
| License and usage | Must be confirmed from Blizzard developer terms before production use |
| Forever compatibility | **Unverified** |
| Two-part names | Existing community implementation reports the standard profile data exposing only one name; official behavior remains unverified |
| Reliability | Not usable for Forever until a source-specific compatibility check succeeds |

### Prototype integration

The repository contains an isolated experimental adapter for comparison only:

```text
POST https://oauth.battle.net/token
GET  https://{region}.api.blizzard.com/profile/wow/character/{realm}/{primaryName}
```

It is not enabled as a WoW Forever data source. Credentials must not be created or entered for this adapter unless a Forever-specific investigation proves that the endpoint represents the user's server and character.

### Current blockers

- This cloud environment denied access to `develop.battle.net` under its current network policy, so the current API documentation could not be verified here.
- No Blizzard developer credentials are needed for the current Forever-only prototype.
- Bigcrisp Lolo's Forever server has not been confirmed. No Retail realm inference is being carried forward.
- It is unknown whether Blizzard represents any Forever server, character, primary name, or secondary name.
- Account-wide discovery is blocked until an authorized Forever source is identified.

## Forever source investigation

The first accepted source must be tied to WoW Forever and document its server list, character identity fields, version coverage, access method, rate limits, and permission to use the data. Candidate sources include a Forever-compatible addon export, a server-provided endpoint, or a community dataset with clear licensing. Until one is confirmed, the dashboard stays manual.

## Community implementation evidence

The public `cageymage/fuzion` project models Forever characters with required main and secondary names, validates each at 2–12 characters, and makes the pair unique. A direct check of its migration on 2026-11-05 confirmed those constraints. This is useful corroboration, not an official API contract.

- https://github.com/cageymage/fuzion/pull/46
- https://github.com/cageymage/fuzion/blob/main/backend/migrations/000006_add_character_secondary_name.up.sql

## Questions still requiring official answers

- Which Forever servers are in scope, and how are they identified?
- What authorized Forever source exposes character profiles, if any?
- Does that source return both name parts and the selected ruleset?
- Can equipment, talents, professions, statistics, level, and experience be queried?
- Which fields require a Forever addon export or manual entry?
