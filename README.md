# AltyLab WoW Companion

A working local prototype for planning and tracking World of Warcraft: Forever characters without inventing unsupported game recommendations.

## Run locally

Requirements: Node.js 24 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## WoW Forever data research

The prototype is scoped to World of Warcraft: Forever. Its servers and data sources are treated as Forever-specific. The standard Blizzard Retail, Classic, or Worldsoul Armory is not assumed to represent Forever characters.

## Checks

```bash
npm test
npm run typecheck
npm run build
```

## Prototype behavior

- Starts with a draft for `Bigcrisp Lolo`.
- Stores Forever's primary and secondary names separately.
- Saves the plan and manual profile in browser local storage.
- Displays created profiles in an original armory-inspired character sheet with honest empty equipment and appearance states.
- Provides class and optional class-specific build dropdowns, including a beginner-friendly “Not sure yet” choice.
- Allows region, realm, ruleset, faction, and playstyle preferences to be edited.
- Provides a Forever-specific data research screen with manual server identity while an authorized Forever source is being verified.
- Keeps race, talent, gear, and leveling recommendations locked until suitable Forever sources are verified.

Prototype character data stays in the current browser. No external data is imported until its Forever source and coverage are documented. GitHub is the source of truth for code and planning documents.

See `docs/PRODUCT_BRIEF.md`, `docs/ROADMAP.md`, and `docs/BACKLOG.md` for scope and status.
