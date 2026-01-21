# Agent Protocol: Beads Task Tracking

This project uses `bd` (Beads), a local CLI issue tracker.
**You must check `bd` before writing code.**

Run `bd quickstart` for usage, epic/ticket conventions, and tooling.

## How to use `bd`
1.  **Check Status:** Run `bd ready` to see unblocked tasks.
2.  **Get Context:** Run `bd show <id>` to read the full requirements of a ticket.
3.  **Start Work:** Implementing the requirements found in the ticket.
4.  **Finish Work:** Run `bd close <id>` when the code is committed and working.

## Current Architecture (Stitch -> PWA)
- **Frontend:** React + Tailwind (Vite).
- **Design:** Derived from Google Stitch exports (HTML/CSS in `stitch-exports/`).
- **Data:** LocalStorage for user data (Saved Songs), JSON for static data (Chords).
- **No Backend:** This is a pure PWA. Do not suggest adding a server.