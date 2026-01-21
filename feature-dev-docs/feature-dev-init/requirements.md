# Stitch Chords PWA - Feature Dev Init Requirements

## Summary
Stitch Chords is a terminal-aesthetic PWA for dense chord and progression reference. The current implementation covers core screens (dashboard, artist discovery, scratchpad, active playing view, saved songs) using static JSON plus localStorage. Design references come from Stitch exports in `stitch-exports/stitch_chord_voicing_am9/`.

## Inputs
- Static data: `src/data/artists.json`, `src/data/chords.json`
- User actions: select artist/progression, edit chords, transpose, save songs
- Local persistence: localStorage key `stitch_chords_saved_songs`

## Outputs
- Rendered views: dashboard, artist list, artist library, expansion menu, scratchpad, active playing view, saved songs, utility placeholder
- LocalStorage writes on save

## Constraints
- React + Tailwind (Vite), no backend or network fetch
- Navigation is in-memory view state; no URL routing or deep links
- Data is bundled JSON; no runtime updates
- Visual language: terminal aesthetic, dark background (#081020), cyan accents (#00d4ff)
- No audio output

## Design References (Stitch Exports)
- Artist list: `stitch-exports/stitch_chord_voicing_am9/artist_selection_list`
- Artist library: `stitch-exports/stitch_chord_voicing_am9/apparat_progressions_library_*`
- Expansion menu: `stitch-exports/stitch_chord_voicing_am9/expansion_techniques_menu`
- Technique details: `stitch-exports/stitch_chord_voicing_am9/technique:_pedal_bass_drift`, `stitch-exports/stitch_chord_voicing_am9/technique:_prolongation`
- Scratchpad: `stitch-exports/stitch_chord_voicing_am9/custom_chord_scratchpad`
- Active playing: `stitch-exports/stitch_chord_voicing_am9/active_playing_view`
- Active chart variants: `stitch-exports/stitch_chord_voicing_am9/active_song_chart_reference_1`, `stitch-exports/stitch_chord_voicing_am9/active_song_chart_reference_2`
- Save overlay: `stitch-exports/stitch_chord_voicing_am9/save_song_overlay`
- Saved songs: `stitch-exports/stitch_chord_voicing_am9/saved_songs_library`
- Utility/settings: `stitch-exports/stitch_chord_voicing_am9/utility_&_data_settings`

---

## Current Screen Coverage

### Dashboard (view: dashboard) - Implemented
Behavior:
- Shows app header, quick access buttons, system library list, and footer nav.
- System library list is sourced from `chords.json`.
- Selecting a library progression loads it into active view.
- NEW SONG button creates fresh song and navigates to artist selection.

Gaps:
- No deep link to a specific saved song.

### Artist Selection List (view: artists) - Partial
Behavior:
- Renders all artists and progression counts from `artists.json`.
- Search input is visual-only.

Gaps:
- Search filtering is not wired.
- Alphabet quick jump is visual-only.

### Artist Library (view: artist-detail) - Implemented
Behavior:
- Lists progressions for the selected artist.
- V/B/C buttons add progressions to VERSE/BRIDGE/CHORUS sections.
- Add action updates the active song and navigates to active view.

Gaps:
- Voicing expansion details ("unfold more") are not present.
- Minor chord display shows progression summary without "m" suffix in some cases.

### Expansion Techniques Menu (view: expansion) - UI Only
Behavior:
- Static list of 6 techniques.

Gaps:
- No navigation to technique detail screens.
- No transformation logic applied to active song.

### Technique Detail Screens - Not Implemented
Reference designs include Pedal Bass Drift and Prolongation detail screens with apply actions. None are implemented.

### Custom Chord Scratchpad (view: scratchpad) - Implemented
Behavior:
- Freeform chord input with root/accidental/quality selectors.
- Note spelling from theory engine.
- Add to verse/chorus appends a single chord to active song.
- Back navigation returns to active view when editing from hot swap, or dashboard when accessed directly.

Gaps:
- Global key selector, roman numeral, function, and interval formula panels from design.
- Voicing variations carousel (drop 2, inversions, shell).
- Tab navigation (Pad/Vault/Theory/Pro).

### Active Playing View (view: active) - Implemented
Behavior:
- 2-column chord grid per section.
- Global transpose slider (-6 to +6 semitones).
- Key selector with roman numeral analysis (works for all keys including flats).
- Hot swap menu for quick quality swap, edit, or delete.
- Note spelling card for selected chord.
- Save button opens overlay with title editing and section summary.
- State resets (key, transpose, selection) when loading a different song.
- Wake lock and instrument toggles are UI-only state.

Gaps:
- Tempo display and action menu from design.
- 4-column grid and dense chart view variants.
- Instrument-specific voicing data.
- Wake Lock API integration.

### Hot Swap Menu - Implemented
Behavior:
- Quick quality swap uses the same root.
- Edit opens scratchpad; delete removes chord.

Gaps:
- No validation of unsupported chord qualities.
- No chord replacement history.

### Save Overlay - Implemented
Behavior:
- Modal with editable title input (pre-filled with current title).
- Section summary showing each section name and chord count.
- Save persists to localStorage and updates active view header immediately.
- Cancel dismisses without saving.

### Saved Songs Library (view: library) - Implemented
Behavior:
- Displays songs from localStorage sorted by last opened (default).
- Sort cycling: LAST_OPENED → A-Z → CREATED.
- Section filters: VERSE / CHORUS / BRIDGE (multi-select, prefix matching).
- Selecting a saved song loads it into active view.
- NEW SONG button navigates to artist selection with fresh song.
- Shows "No Matches Found" with clear filters option when filters exclude all songs.

Gaps:
- No delete or rename actions in UI (must use save overlay to rename).

### Utility / Settings (view: utility) - Placeholder Only
Behavior:
- Placeholder offline screen.

Gaps:
- Settings for dark mode, font, instrument view, export/import, version info.

---

## Data Model

### Song
```typescript
{
  id: string;           // Unique identifier (timestamp + random)
  title: string;
  artist: string;
  tempo: number;
  sections: Section[];
  key?: string;         // e.g., "C MAJOR", "Bb MAJOR"
  lastOpened?: number;  // Unix timestamp
  createdAt?: number;   // Unix timestamp
}
```

### Section
```typescript
{
  name: string;    // e.g., "VERSE", "CHORUS", "BRIDGE"
  bars: string[];  // Chord labels, e.g., ["Am", "F", "C", "G"]
}
```

### Storage
- localStorage key `stitch_chords_saved_songs` stores `Song[]` JSON.

---

## Music Theory Engine

### Implemented
- parseChord splits root and quality by regex `^([A-G][#b]?)(.*)$`.
- Supported qualities (20): "", m, dim, aug, maj7, m7, 7, dim7, m7b5, maj9, m9, 9, sus4, 7sus4, maj13, 13, add9, madd9, 6, m6.
- Unsupported qualities fall back to major triad spelling.
- Transposition uses sharps by default (Bb -> A#).
- Roman numerals work for all keys including flats (Bb, Eb, Ab, Db, Gb).
- Non-diatonic intervals return "N.C.".

### Test Coverage
- 37 unit tests in `src/utils/theory.test.ts`
- Covers: getNoteIndex, transposeNote, parseChord, transposeChord, getChordNotes, getRomanNumeral
- Includes flat-key edge cases

---

## User Flows

1. **Artist discovery to active view:**
   Dashboard → Artist list → Artist library → Add progression (V/B/C) → Active view

2. **Scratchpad add:**
   Scratchpad → Add to verse/chorus → Active view

3. **Active view edit:**
   Select chord → Hot swap → Edit → Scratchpad → Add → Active view (returns correctly)

4. **Save to library:**
   Active view → Save → Edit title → Confirm → localStorage updated → Library shows entry

5. **Load saved song:**
   Library → Select song → Active view (key/transpose reset to song's values)

6. **New song flow:**
   Dashboard → NEW SONG → Artist list → Select artist → Add progressions → Active view

---

## Edge Cases and Limitations
- Chords with qualities outside the supported list display incorrect note spelling.
- Invalid chord root yields empty note spelling; no error state beyond placeholder.
- Deleting the last chord in a section leaves empty sections.
- localStorage parse errors are logged to console only; UI does not surface errors.

---

## PWA
- `vite-plugin-pwa` configured with auto-update and manifest.
- Offline behavior and wake lock are unverified.
