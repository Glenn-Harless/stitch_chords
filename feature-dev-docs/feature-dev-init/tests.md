# Stitch Chords PWA - Feature Dev Init Tests

## Overview
Tests describe observable behavior. Sections are split between current behavior and pending design/spec items.

---

## Acceptance Criteria (Implemented)

### Navigation
- Dashboard buttons navigate to active, artists, scratchpad, expansion, library, utility.
- Back actions return to dashboard from active, artists, expansion, and utility.
- Scratchpad back returns to active view when editing from hot swap, dashboard otherwise.
- No screen renders blank or crashes for default data.

### Dashboard
- System library list renders all progressions from `chords.json`.
- Selecting a progression loads it into active view.
- Quick access "resume" opens active view.
- NEW SONG creates fresh song and navigates to artist selection.

### Artist List
- Renders all artists with progression counts from `artists.json`.
- Search input does not filter (visual-only).

### Artist Library
- Selecting a progression and pressing V/B/C appends chords to matching section.
- Add action navigates to active view.

### Scratchpad
- Manual input updates note spelling when root is valid.
- Root/accidental/quality selectors update the input field.
- Add to verse/chorus appends one chord to the matching section and opens active view.

### Active Playing View
- Global transpose slider (-6..+6) transposes displayed chord labels and note spelling.
- Key selector updates roman numerals for all keys including flats (Bb, Eb, Ab, Db, Gb).
- Tapping a chord opens hot swap.
- Hot swap quality change replaces the chord in place.
- Hot swap delete removes the chord.
- Hot swap edit navigates to scratchpad, returns to active view on back.
- Save opens overlay with editable title and section summary.
- Saving updates header title immediately (no reload needed).
- Loading a different song resets key, transpose, and selection to song's values.

### Save Overlay
- Title input pre-filled with current song title.
- Section summary shows each section name with chord count.
- Save persists to localStorage and updates active view.
- Cancel dismisses without saving.

### Saved Songs Library
- Shows saved songs from localStorage, sorted by last opened (default).
- Sort cycling: LAST_OPENED → A-Z → CREATED.
- Section filters: VERSE / CHORUS / BRIDGE with prefix matching.
- Selecting a song loads it into active view with lastOpened updated.
- NEW SONG button navigates to artist selection with fresh song.
- Empty state shows when no matches; clear filters option available.

### Utility
- Placeholder renders and allows return to dashboard.

---

## Acceptance Criteria (Pending / Not Implemented)

- Artist list search filtering.
- Artist list alphabet quick jump.
- Expansion technique detail screens and apply-to-chart behavior.
- Voicing variations, roman numeral/function panels in scratchpad.
- Active view 4-column chart layout and tempo display.
- Wake Lock API integration.
- Instrument-specific voicing display.
- Utility settings (dark mode, font, export/import).

---

## Unit Test Coverage

### theory.ts (37 tests)

#### getNoteIndex
- Returns correct index for all natural notes (C=0, D=2, E=4, F=5, G=7, A=9, B=11).
- Handles sharps (F#=6, C#=1, G#=8).
- Handles flats (Bb=10, Eb=3, Ab=8).

#### transposeNote
- Transposes up correctly (C+2=D, A+3=C).
- Wraps around octave (B+1=C, G+7=D).
- Uses sharps by default for accidentals.
- Uses flats when preferFlat=true.

#### parseChord
- Parses major chord: "C" → { root: "C", quality: "" }.
- Parses minor: "Am" → { root: "A", quality: "m" }.
- Parses extended: "Am9" → { root: "A", quality: "m9" }.
- Parses with accidental: "F#m7" → { root: "F#", quality: "m7" }.
- Handles flats: "Bbmaj7" → { root: "Bb", quality: "maj7" }.
- Invalid returns input as root with empty quality.

#### transposeChord
- Transposes chord correctly: "Am"+2 = "Bm".
- Preserves quality through transposition.

#### getChordNotes
- Returns triad for major: "C" → ["C", "E", "G"].
- Returns 4 notes for 7th: "Cmaj7" → ["C", "E", "G", "B"].
- Returns 5 notes for 9th: "Am9" → ["A", "C", "E", "G", "B"].
- Invalid root returns [].
- Unsupported quality returns major triad notes.

#### getRomanNumeral
- Returns correct numeral for diatonic chords in C: C=I, Am=vi, G=V.
- Returns "N.C." for non-diatonic intervals.
- Works for flat keys: Bb in Bb MAJOR = I, Eb in Bb MAJOR = IV.
- Works for all flat major keys (Bb, Eb, Ab, Db, Gb).

### useSavedSongs.ts (behavioral expectations)
- Initializes from localStorage when valid JSON exists; otherwise empty array.
- saveSong overwrites by id, sets createdAt on first save, updates lastOpened.
- updateLastOpened updates timestamp for existing song.
- removeSong deletes and persists to localStorage.

---

## Integration Paths

1. **Artist flow:**
   Dashboard → artists → select artist → add progression (V/B/C) → active view → save → library shows entry.

2. **Scratchpad edit flow:**
   Active view → hot swap → edit → scratchpad → add → active view → chord replaced.

3. **Load saved song flow:**
   Library → select song → active view (key/transpose reset) → verify song data displayed.

4. **New song flow:**
   Dashboard → NEW SONG → artists → select → add progressions → active → save with title → library shows new entry.

---

## Edge Cases

- localStorage contains invalid JSON → error logged and list remains empty.
- Unsupported qualities from `artists.json` render but use major triad note spelling.
- Flat key selection works correctly (fixed in stitch_chords-13).
- Backing out of scratchpad clears editingTarget (fixed in stitch_chords-14).
- Loading different song resets key/transpose/selection (fixed in stitch_chords-21).
- Saving with new title updates header immediately (fixed in stitch_chords-22).
- Section filter matches prefixes: "VERSE 1" matches VERSE filter (fixed in stitch_chords-23).

---

## Manual Checks

- Layout holds on mobile width; scanline effect visible.
- PWA manifest and service worker register; install prompt appears.

---

## Visual Verification Criteria

- Background: #081020 (dark blue-black)
- Accent color: #00d4ff (cyan) for headers, buttons, interactive elements
- Fonts: Space Grotesk for display, JetBrains Mono for chord/data
- Scanline effect subtle but visible
- Glow effects on hover states
