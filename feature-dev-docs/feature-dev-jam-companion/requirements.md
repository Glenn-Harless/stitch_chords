# Jam Companion POC Requirements

## Summary

Jam Companion reframes the project as a personal electronica jam copilot. The POC generates a playable loop from user-selected musical intent and explains chords, melody, bass, and next moves in weak-theory language.

## Inputs

- User profile controls: key, vibe, energy, complexity, bar count, reference artist, instrument.
- Static seed data: `src/data/artists.json`.
- Theory utilities: chord parsing, note spelling, transposition, roman numeral analysis.
- Optional local API: `apps/api/server.mjs`.

## Outputs

- A `JamSession` containing source attribution, chord moments, melody guidance, bass guidance, coach steps, and next moves.
- Rendered jam workspace in the React PWA.
- Optional SQLite persistence when the API is running.
- localStorage fallback when the API is unavailable.

## Constraints

- Personal app, no authentication in POC.
- SQLite is the default persistence layer.
- AI calls must happen server-side in future work.
- Browser must remain useful without API availability.
- Deterministic generation must be testable and must not rely on an LLM for note math.
- Mobile portrait is the primary design target.
- Desktop must extend the mobile workflow rather than introduce a separate dashboard model.

## User Flow

1. Open the app.
2. Review the generated chord loop immediately.
3. Use the bottom sheet to tune key, vibe, energy, complexity, bars, reference artist, and instrument.
4. Move between Chords, Melody, Bass, and Coach tabs.
5. Preview the bass pulse in the browser if desired.
6. Regenerate or save from the sticky bottom action bar.

## Mobile Layout Requirements

- Header remains compact and shows the current session intent.
- Primary loop cards are visible before any secondary explanation panels.
- Core actions remain reachable at the bottom of the screen.
- Profile controls live in a modal bottom sheet.
- Tab buttons must be large enough for touch use.
- No hover-only interactions are required for the core jam flow.

## Edge Cases

- If no artist progression matches the profile, the engine uses theory fallback patterns.
- If the API is offline, saving falls back to localStorage.
- If a chord cannot be parsed, note spelling falls back to empty or safe display behavior.
- If unsupported AI credentials are absent, backend coach responses remain deterministic.

## Out Of Scope For POC

- Cloud sync.
- User accounts.
- Full OpenAI integration.
- MIDI export.
- Full audio arrangement playback.
- Migrating old saved songs.
