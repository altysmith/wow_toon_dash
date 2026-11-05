# AltyLab WoW Companion

A working local prototype for planning and tracking World of Warcraft: Forever characters without inventing unsupported game recommendations.

## Run locally

Requirements: Node.js 24 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Optional Blizzard character lookup

Create a Blizzard developer application at `https://develop.battle.net/`, then keep its credentials only on the machine running the app:

```powershell
Copy-Item .env.example .env.local
```

Fill in `BLIZZARD_CLIENT_ID` and `BLIZZARD_CLIENT_SECRET` in `.env.local`, choose the default region and locale, and restart the development server. Never commit `.env.local` or paste the client secret into chat.

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
- Offers a server-side Blizzard public character lookup that never sends the client secret to the browser.
- Keeps race, talent, gear, and leveling recommendations locked until suitable Forever sources are verified.

Prototype character data stays in the current browser. Blizzard lookup results are previews and do not overwrite the manual profile. GitHub is the source of truth for code and planning documents.

See `docs/PRODUCT_BRIEF.md`, `docs/ROADMAP.md`, and `docs/BACKLOG.md` for scope and status.
