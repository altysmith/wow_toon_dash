# Decision Log

## Confirmed product decisions

### D-001 — Personalized progression dashboard

- **Status:** Confirmed
- **Decision:** Build a personalized character intelligence dashboard rather than a general tutorial site or chatbot.
- **Reason:** The product should reduce research time and recommend practical next actions.

### D-002 — Versioned, source-backed game data

- **Status:** Confirmed
- **Decision:** Store provenance and game version with game facts and recommendation inputs.
- **Reason:** Forever-specific correctness is a core product requirement.

### D-003 — Manual workflow remains first-class

- **Status:** Confirmed
- **Decision:** Character planning and manual profile updates must work without an external API or addon.
- **Reason:** External data availability is currently unknown, and offline tolerance is required.

### D-004 — Self-hosted deployment target

- **Status:** Confirmed
- **Decision:** Target Debian 13 on Raspberry Pi with Docker, Nginx, Cloudflare Tunnel, and `wow.altylab.com`.
- **Reason:** This matches the intended AltyLab environment.
- **Constraint:** The live host and configurations have not been inspected.

### D-005 — Plans convert into manual character profiles

- **Status:** Confirmed
- **Decision:** The first demo includes converting a saved race/build plan into a manually maintained character profile.
- **Reason:** This joins pre-character planning to ongoing progress tracking without waiting for an external API or addon.
- **Initial identity fields:** Primary/main character name, secondary character name, region, and ruleset / mega-server type.
- **Naming evidence:** The owner's first-hand character-creation experience and a current Forever community implementation both describe required two-part names. The community implementation stores `name` and `secondaryName`, displays them together, and validates each as 2–12 characters.
- **Source quality:** Corroborated community evidence, not yet verified in official Blizzard documentation. See [fuzion PR #46](https://github.com/cageymage/fuzion/pull/46) and its [name migration](https://github.com/cageymage/fuzion/blob/main/backend/migrations/000006_add_character_secondary_name.up.sql).
- **Integration risk:** That implementation reports Blizzard profile data exposing only one name, which would require manual secondary-name entry or another supported data source.

## Proposed technical decisions

### D-006 — Next.js modular monolith

- **Status:** Proposed
- **Decision:** Begin with a Next.js and TypeScript modular monolith using server-side routes rather than a separate API service.
- **Reason:** It minimizes deployment and operational cost while preserving typed module boundaries.
- **Revisit when:** Background jobs, independent scaling, or importer traffic creates a demonstrated need.

### D-007 — SQLite and Prisma

- **Status:** Proposed
- **Decision:** Use SQLite and Prisma initially, with portable schema choices that allow a later PostgreSQL migration.
- **Reason:** It is sufficient for a single-household deployment and keeps Raspberry Pi operations simple.

### D-008 — Priest race comparison as first vertical slice

- **Status:** Proposed
- **Decision:** Build the Horde Priest race-comparison and saved-plan flow before broader optimizers.
- **Reason:** It exercises verified game data, preferences, explainability, persistence, and the primary user journey with limited scope.

### D-009 — Browser-persisted working prototype

- **Status:** Confirmed for prototype
- **Decision:** Build the first working prototype as a local Next.js web app using browser storage before introducing the production database.
- **Reason:** This makes the complete plan-to-profile interaction testable quickly and keeps unverified integration work out of the critical path.
- **Limitation:** Character data does not sync across browsers or computers. GitHub synchronizes source code and planning documents only.

### D-010 — Push verified milestones to GitHub

- **Status:** Confirmed
- **Decision:** Commit and push each coherent milestone after its relevant checks pass.
- **Reason:** Development will move between computers and needs an up-to-date shared source of truth.
- **Safety rule:** Fetch before editing, preserve local work, and never force-push over another session.

### D-011 — Build and talent focus are optional at onboarding

- **Status:** Confirmed
- **Decision:** Require a class selection but allow players to choose “Not sure yet” for build or talent focus.
- **Reason:** New and returning players may not understand talent paths when first creating a profile. The dashboard should help them learn rather than require a premature choice.
- **Prototype behavior:** Class and build use dropdowns; changing class clears an incompatible build.
- **Data note:** Prototype class and talent labels remain excluded from recommendations until Forever availability and terminology are verified.

### D-012 — Armory-inspired character display

- **Status:** Confirmed
- **Decision:** Present an active character as a central character sheet with identity and level above, equipment slots arranged on both sides, and compact character-section tabs.
- **Reason:** This layout makes the character feel like the center of the product and lets players scan identity, gear completeness, and progress quickly.
- **Design boundary:** Use original AltyLab styling and honest empty states. Do not copy Blizzard artwork, logos, item art, or character renders.
- **Prototype behavior:** Unknown equipment remains visibly empty, and unavailable character art uses a labeled placeholder rather than fabricated imagery.

### D-013 — Verify a WoW Forever source before any sync

- **Status:** Confirmed for prototype
- **Decision:** Verify an authorized WoW Forever data source before importing or synchronizing character data.
- **Reason:** Forever servers and character data may differ from Blizzard Retail, Classic, and Worldsoul services. A familiar Blizzard endpoint is not evidence of Forever compatibility.
- **Profile boundary:** Battle.net OAuth may confirm account identity, but imported character data remains disabled until its Forever source and field coverage are documented.
- **Current behavior:** The dashboard stays manual and records Forever region and ruleset; it does not ask for a realm name.
- **Prohibited assumptions:** Retail realm names, region rules, Armory fields, and standard Blizzard account APIs cannot be used as Forever evidence.

### D-014 — Battle.net OAuth confirms identity only

- **Status:** Confirmed for prototype
- **Decision:** Allow Battle.net account authorization with `wow.profile` scope to confirm account identity and probe an explicitly supplied namespace, while keeping character import disabled until Forever coverage is verified.
- **Credential handling:** Exchange the authorization code server-side and keep the short-lived access token only in an authenticated encrypted HttpOnly cookie, capped at the token's expiry or 24 hours, for the explicit namespace probe. The status route never returns the token; no refresh token is stored.
- **Boundary:** OAuth success does not mean Forever character sync is supported and does not overwrite the manual character profile.
- **Probe behavior:** The user must supply the region and namespace. A returned list is an unverified preview. A 404 remains ambiguous between no characters and an unsupported namespace.

## Open decisions

### Q-001 — Access model for local development

Decide whether the initial local build is single-user without application login, relying on local access, or includes authentication from the start.

**Recommendation:** Keep local development single-user and require an established access layer before any public tunnel exposure.

## Research corrections

### R-001 — Forever character names are two-part

- **Status:** Corroborated; official verification pending
- **Correction:** The earlier single-name assumption came from standard WoW behavior and does not fit Forever.
- **Working model:** Store primary/main and secondary names separately; display both together.
- **Still to verify:** Official terminology, allowed characters, 2–12 length rule, uniqueness scope, rename behavior, addon API fields, and Blizzard profile API fields.

