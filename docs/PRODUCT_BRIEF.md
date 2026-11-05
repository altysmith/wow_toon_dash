# AltyLab WoW Companion Product Brief

## Product goal

Build a self-hosted character intelligence dashboard for World of Warcraft: Forever that helps a returning player make useful progress in limited play sessions.

The guiding promise is: **Spend less time researching. Spend more time progressing.**

## Primary user

A returning player with high-beginner experience who values damage optimization, survivability, damage-over-time play, solo exploration, world PvP, and playing with friends. Sessions may be as short as 30–60 minutes.

The first likely character is a Horde Shadow Priest on a PvP ruleset. A Mage is the likely second character. The product must support multiple characters, classes, races, builds, and goals.

## Questions the product should answer

1. What race best fits the selected class, build, and play priorities?
2. What is the current state of a character, and how complete is the available data?
3. What should the player do with 30, 45, 60, or 120 minutes?
4. Which leveling, gear, talent, or profession action offers the best practical value next?
5. Why is each recommendation being made, what evidence supports it, and how certain is it?

## First product slice

The proposed first slice lets a user:

1. Select Forever, faction, ruleset, and class, with build/talent focus remaining optional for players who are still learning.
2. View only verified eligible races and sourced racial abilities.
3. Adjust preference weights and see an explainable comparison.
4. Save the result as a planned character.
5. Convert the plan into a manual character profile without an external API.

The initial profile identity will use:

- Primary/main character name
- Secondary character name
- Realm/server
- Region
- Realm ruleset, selected manually until verified realm metadata is available

Unlike earlier versions of World of Warcraft, Forever uses a two-part character name. The dashboard should store the two parts separately and display the complete name in the same order used by the game. Current corroborating community implementation uses `primary/main name + secondary name` and validates each part as 2–12 characters. Phase 0 must confirm the official field labels, limits, uniqueness rules, API representation, and realm relationship before implementation.

This slice tests the central product idea while keeping external synchronization optional.

## Product principles

- Correct, versioned data before broad recommendations.
- Clear provenance and honest uncertainty.
- Explainable rankings instead of unexplained scores.
- Manual and offline-tolerant workflows as a dependable baseline.
- Responsive desktop-first design with useful mobile access.
- Local-first deployment and authenticated write operations.
- ARM64-compatible, resource-conscious services for Raspberry Pi deployment.

## Initial scope

- Responsive dashboard shell
- Manual character plans and profiles
- Data provenance and version tracking
- Race/class compatibility and racial comparison
- Saved preference weights and explainable recommendations
- SQLite-backed persistence
- Typed, validated application boundaries
- Local Docker development and deployment documentation

## Deferred until evidence exists

- Blizzard character synchronization
- Forever-compatible addon and Windows importer
- Talent, gear, leveling, and profession optimization
- Estimated DPS or XP-per-minute claims
- Live PvP activity, auction prices, or time-to-acquire estimates

These are product goals, but each requires a verified data source or a clearly labeled user-input model.

## Known constraints

- Forever may differ from Classic and Retail in race/class eligibility, talents, items, quests, and addon APIs.
- Community sites may not offer licensed public APIs.
- Addon SavedVariables are not guaranteed to update continuously during play.
- No live Raspberry Pi, Nginx, Cloudflare, Blizzard credential, or game-client access has been provided.

## Success measures for the first slice

- A user can complete the initial Priest planning scenario without fabricated data.
- Every displayed game fact has a source and game-data version.
- Weight changes produce reproducible, explainable ranking changes.
- A plan persists and can later become a character profile.
- Converting a plan preserves its two-part name, class, optional build intent, play priorities, and ruleset selection.
- Missing or uncertain data is visible rather than silently inferred.
- The application builds, starts, and passes its agreed tests on the development environment.

