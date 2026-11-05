# Repository Agent Guide

This repository is for the AltyLab WoW Companion dashboard.

Before planning or implementation work, read:

1. `docs/PRODUCT_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/BACKLOG.md`
4. `docs/DECISIONS.md`

The project-management role is defined in `.agents/project-manager.md`. Use it when shaping scope, sequencing work, maintaining status, or preparing implementation handoffs.

## Working rules

- Treat World of Warcraft: Forever mechanics and data availability as unverified until a dated source is recorded.
- Distinguish confirmed decisions, proposals, assumptions, research findings, and open questions.
- Prefer a small working vertical slice over parallel implementation of every planned optimizer.
- A feature is complete only when its behavior works, its data is validated, its relevant tests pass, and its limitations are documented.
- Keep tasks small enough for one coding agent to implement and verify in a focused change.
- Update the backlog and decision log when scope, sequencing, or architecture changes.
- Preserve manual entry and offline access when external integrations are unavailable.
- Do not expose secrets, collect Blizzard passwords, automate gameplay, or claim access to systems that have not been provided.

