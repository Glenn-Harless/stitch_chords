# Jam Companion POC Tests

## Acceptance Criteria

- App opens directly to the Jam Companion workspace.
- User can open the tuning bottom sheet and change key, vibe, energy, complexity, bar count, reference artist, and instrument.
- Generated session updates when controls change.
- Four-bar and eight-bar loops render the requested number of chord moments.
- Every chord card shows chord label, roman numeral, notes, and voicing guidance.
- Melody runway shows anchor notes, color notes, and a simple motif.
- Coach panel explains what to do without requiring advanced theory.
- Save uses the local API when it is running.
- Save falls back to localStorage when the API is offline.
- Bass preview plays without crashing on supported browsers.
- Sticky bottom actions remain available on mobile.
- Chords, Melody, Bass, and Coach tabs each show their corresponding guidance.

## Unit Expectations

- `generateJam` creates a valid default session.
- `generateJam` respects requested bar count.
- `generateJam` transposes source material into the requested key.
- Beginner complexity emits simpler melody guidance.
- Fallback theory patterns are used when seed data cannot satisfy a profile.

## Integration Paths

1. Frontend only:
   - Run `npm run dev`.
   - Change profile controls.
   - Save session and confirm local fallback.

2. Frontend plus API:
   - Run `npm run api:dev`.
   - Run `npm run dev`.
   - Save session and confirm SQLite write through `GET /api/jams`.

3. Music engine:
   - Run `npm test`.
   - Confirm theory tests and jam engine tests pass.

## Manual Checks

- Layout is designed first for phone portrait and remains usable on laptop width.
- Long chord names do not break cards.
- Source attribution is visible.
- Generated instructions are immediately playable at a keyboard.
- Main actions have large touch targets.
- Tuning controls appear in a bottom sheet, not a desktop-style control grid.
