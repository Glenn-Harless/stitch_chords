# Jam Companion POC

Jam Companion is a personal electronica jamming tool. It helps a weaker-theory player quickly create a playable loop, then explains what to play for chords, bass, and melody.

The active POC keeps the old Stitch Chords data as seed material, but the product direction has changed from "dense chord reference" to "guided jam copilot."

## Run

Frontend only:

```bash
npm run dev
```

Optional local API with SQLite persistence:

```bash
npm run api:dev
```

The frontend saves to `http://localhost:8787/api/jams` when the API is running. If the API is offline, it falls back to browser localStorage.

## Current POC Scope

- React/Vite PWA frontend.
- Deterministic jam generation from artist seed data plus theory fallbacks.
- Key, vibe, energy, complexity, bar count, and reference artist controls.
- Mobile-first layout with bottom-sheet tuning, tabbed guidance, and sticky bottom actions.
- Chord grid with roman numerals, note spelling, voicing hints, bass guidance, and melody runway.
- Browser bass preview with Web Audio.
- Local Node API using built-in SQLite support.
- SQLite tables for jam sessions and AI interaction logs.
- AI endpoint placeholder so OpenAI orchestration can be added behind the backend without putting keys in the browser.

## Direction

The music engine should remain deterministic and testable. AI should explain, adapt, and propose variations through structured backend contracts, while the app validates and renders musical output locally.
