# AltyLab WoW Companion

A working local prototype for planning and tracking World of Warcraft: Forever characters without inventing unsupported game recommendations.

## Run locally

Requirements: Node.js 24 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

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
- Allows region, realm, ruleset, faction, class, build, and playstyle preferences to be edited.
- Keeps race, talent, gear, and leveling recommendations locked until suitable Forever sources are verified.

Prototype character data stays in the current browser. It does not sync between computers or call Blizzard services yet. GitHub is the source of truth for code and planning documents.

See `docs/PRODUCT_BRIEF.md`, `docs/ROADMAP.md`, and `docs/BACKLOG.md` for scope and status.
