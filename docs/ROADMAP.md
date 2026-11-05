# Roadmap

This roadmap favors one working vertical slice before expanding the recommendation platform.

## Phase 0 — Evidence and architecture

**Outcome:** The team knows what Forever data is legally and technically available and can build without embedding unverified game claims.

Deliverables:

- Data-source matrix with provider, access method, authentication, rate limits, license, Forever coverage, verification date, and reliability
- Answers for character, equipment, talent, quest, profession, and addon data availability
- Architecture, database, security, and integration proposals
- Data provenance and confidence model
- Initial wireflow for the Priest race-comparison slice

Exit gate:

- The first slice has verified source inputs or is explicitly narrowed to supported data.
- Major integration unknowns are recorded with experiments.
- Architecture decisions needed to start the foundation are approved.

## Phase 1 — Working foundation

**Outcome:** A local user can run the dashboard and manually manage character plans and profiles.

Deliverables:

- Next.js, TypeScript, and accessible responsive shell
- SQLite and Prisma persistence
- Health endpoint and structured validation/errors
- Manual character plan/profile workflow
- Provenance-aware seed/import path
- ARM64-compatible Docker development setup
- Unit and integration test foundation

Exit gate:

- The application builds and starts from documented commands.
- Character create/read/update behavior works and is tested.
- Data persists across a normal container restart.
- No real game facts are represented by unlabeled synthetic fixtures.

## Phase 2 — Race and build planning slice

**Outcome:** A player can compare verified Horde Priest choices for a selected playstyle and save an explainable plan.

Deliverables:

- Verified race/class eligibility model
- Sourced racial-ability records
- Weighted preference input
- Deterministic, explainable comparison rules
- Saved planned character and build intent
- Primary acceptance scenario end-to-end test

Exit gate:

- Invalid combinations cannot be selected.
- Every game fact displays provenance and version.
- The ranking can be reproduced from stored inputs and rules.
- No unsupported performance percentage is shown.

## Phase 3 — Character synchronization experiment

**Outcome:** The project chooses and proves the safest supported data-collection path while retaining manual entry.

Possible paths:

- Official Blizzard API adapter
- Forever-compatible addon plus SavedVariables importer
- Hybrid adapter with manual fallback

Exit gate:

- Supported fields and refresh timing are demonstrated with authorized real data.
- Import is authenticated, validated, idempotent, and preserves newer manual changes.
- Unsupported fields remain clearly unavailable.

## Phase 4 — Gear recommendations

**Outcome:** The player sees source-backed, build-aware equipment comparisons and acquisition options.

Entry requirement: trustworthy item, eligibility, and acquisition data.

## Phase 5 — Session and leveling recommendations

**Outcome:** The player receives achievable, explainable suggestions for a chosen time budget.

Entry requirement: trustworthy zone/quest data plus defensible travel and duration inputs.

## Phase 6 — Profession planning

**Outcome:** The player can compare professions and plan useful recipes and materials without invented pricing.

Entry requirement: trustworthy profession, recipe, trainer, and material-source data.

## Phase 7 — Production refinement

**Outcome:** The application is documented and prepared for authenticated deployment behind the existing AltyLab infrastructure.

This phase includes performance, accessibility, backup/recovery, mobile polish, operational documentation, and reviewed Nginx/Cloudflare integration. Production changes require explicit approval and access.

