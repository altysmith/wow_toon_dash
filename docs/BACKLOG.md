# Backlog

## Active objective

Complete Phase 0 and prepare an implementation-ready handoff for the first vertical slice. Battle.net account identity may be confirmed through OAuth, while character data remains blocked until a Forever source is verified.

## Now

| ID | Task | Status | Depends on | Acceptance evidence |
| --- | --- | --- | --- | --- |
| PM-001 | Establish project-management sources of truth | Tested | None | Agent guide, brief, roadmap, backlog, and decision log exist and agree on the first proposed slice |
| RES-001 | Research official Blizzard developer support for Forever | In progress | None | Dated findings answer profile, equipment, talent, level, quest, profession, and statistics availability |
| RES-002 | Research authorized community datasets and addon APIs | Not started | None | Candidate sources include licensing, access rules, version coverage, and reliability |
| RES-003 | Create `docs/DATA_SOURCES.md` | In progress | RES-001, RES-002 | Initial Blizzard API findings and explicit unknowns are documented; provider matrix remains incomplete |
| RES-004 | Verify Forever's two-part character identity | In progress | None | Official terminology, validation, uniqueness, realmless region/ruleset behavior, addon fields, and profile API representation are documented |
| ARC-001 | Draft system architecture | Not started | RES-001 | `docs/ARCHITECTURE.md` defines modules, boundaries, sync adapters, offline behavior, and deployment shape |
| ARC-002 | Draft provenance-aware data model | Not started | RES-003 | `docs/DATABASE.md` separates raw imports, normalized records, versions, sources, and user overrides |
| SEC-001 | Draft threat model and access plan | Not started | ARC-001 | `docs/SECURITY.md` covers secrets, imports, parsing, write access, rate limits, and tunnel boundary |
| UX-001 | Define first-slice wireflow and states | Not started | D-005 | Flow covers loading, empty, incomplete, uncertain, error, comparison, saved-plan, and plan-to-profile states |
| PM-002 | Approve Phase 1/2 implementation handoff | Blocked | RES-003, ARC-001, ARC-002, SEC-001, UX-001 | Proposed choices and first-slice acceptance checks are reviewed |

## Next after the Phase 0 gate

| ID | Task | Status | Depends on | Acceptance evidence |
| --- | --- | --- | --- | --- |
| APP-001 | Initialize the Next.js TypeScript application | Tested | D-009 | Pinned install, 11 unit tests, strict typecheck, production build, rendered-page request, and health request pass |
| APP-002 | Add SQLite/Prisma persistence and migrations | Not started | APP-001, ARC-002 | Fresh migration and persistence checks pass |
| APP-003 | Build accessible dashboard shell | Implemented | APP-001, D-009 | Responsive shell and semantic navigation are implemented; visual and interaction review remains |
| APP-004 | Implement prototype character plans and profiles | Implemented | APP-001, D-005 | Two-part identity, preferences, browser persistence, validation, and plan-to-profile conversion are implemented; browser E2E remains |
| SYNC-001 | Keep the Blizzard adapter isolated as comparison code | Implemented | APP-001, D-013 | Adapter tests pass, but the UI does not treat Blizzard Retail data as WoW Forever data |
| SYNC-002 | Identify an authorized WoW Forever character source | Blocked | RES-001, RES-002, D-013 | Source documents region/ruleset identity, two-part names, field coverage, access rules, and licensing |
| AUTH-001 | Connect Battle.net account with OAuth | Implemented | APP-001 | State-checked OAuth callback confirms `/userinfo`; access token is discarded; only encrypted account identity cookie is kept. Live connection awaits app credentials and registered callback URL |
| DATA-001 | Import verified race/class and racial data | Not started | RES-003, APP-002 | Each record has version and source; fixture validation passes |
| OPT-001 | Implement deterministic race comparison | Not started | DATA-001, APP-004 | Weighting, eligibility, explanations, and reproducibility tests pass |
| E2E-001 | Verify the primary Priest scenario | Not started | OPT-001 | End-to-end flow completes with sourced data and saved plan |
| OPS-001 | Add ARM64-compatible local Docker workflow | Not started | APP-002 | Build, health check, migration, restart, and persistence checks pass |

## Later

- Official API or addon synchronization proof
- Gear recommendation slice
- Time-budget and leveling recommendation slice
- Profession planning slice
- Production deployment review

## Current blockers and unknowns

- No authorized WoW Forever API, addon export, or server dataset has been verified, including whether it exposes both name parts.
- Race/class examples and racial effects from the source prompt are requirements to verify, not seed data.
- Community dataset licensing and access rules are unknown.
- No authorized real character data or game-client environment is available.
- The local access model remains an open decision.

