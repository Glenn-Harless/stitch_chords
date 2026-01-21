# Lush Chords PWA - Architectural Decisions Log

> Append-only log of architectural tradeoffs and design decisions.
> Format: [TIMESTAMP] [AGENT] - Decision + Rationale

---

## 2025-01-21 | Claude Opus 4.5 | Initial Architecture Audit

### Decision: No React Router - State-Based Navigation
**Context:** App uses `currentView` state in App.tsx for navigation instead of React Router.
**Rationale:**
- PWA with limited screens doesn't need URL-based routing
- Simpler mental model for screen transitions
- Reduces bundle size
- Matches terminal aesthetic where "location" is secondary
**Tradeoff:** No deep linking, no browser back button support, no URL sharing.

### Decision: Props Drilling Over Global State
**Context:** All state managed in App.tsx and passed via props.
**Rationale:**
- Simple app with ~8 screens
- Avoids Redux/Zustand complexity
- Easier to trace data flow
**Tradeoff:** Deep prop drilling may become unwieldy as features grow. Consider Context API or Zustand if state complexity increases.

### Decision: LocalStorage for Persistence
**Context:** User songs stored in browser localStorage.
**Rationale:**
- No backend requirement (pure PWA)
- Instant read/write
- Works offline
- Simple implementation via useSavedSongs hook
**Tradeoff:** Data limited to single browser, no sync, ~5MB limit.

### Decision: Static JSON for Chord/Artist Data
**Context:** Artists and chord voicings stored in `/src/data/*.json`.
**Rationale:**
- No server needed
- Bundle includes all data
- Fast reads
- Versionable with code
**Tradeoff:** Bundle size increases with data, updates require rebuild.

### Decision: Tailwind CSS v4 for Styling
**Context:** Utility-first CSS framework.
**Rationale:**
- Rapid UI development
- Small production bundle (purged)
- Matches terminal aesthetic with precise control
- No component library lock-in
**Tradeoff:** Verbose class strings, learning curve for new contributors.

### Decision: Custom Music Theory Engine
**Context:** Built `utils/theory.ts` instead of using tonal.js or teoria.
**Rationale:**
- Full control over chord parsing logic
- Smaller bundle than full music theory libraries
- Tailored to app's specific needs (18 qualities)
**Tradeoff:** Must maintain and extend ourselves.

### Decision: Terminal Aesthetic Design System
**Context:** Dark mode with cyan accents, monospace fonts, scanline effects.
**Rationale:**
- Matches project-spec.md vision
- High information density
- Reduces eye strain on music stands
- Distinctive brand identity
**Tradeoff:** Not everyone's aesthetic preference, may feel dated to some users.

### Decision: Vite + React 19 Stack
**Context:** Modern build tooling with latest React.
**Rationale:**
- Fast HMR during development
- Optimized production builds
- Native PWA plugin support
- React 19 concurrent features available
**Tradeoff:** Bleeding edge, potential for bugs in new React features.

---

## 2026-01-21 | Codex | Scope Clarification

### Decision: Keep theory quality support scoped to the current map
**Context:** `artists.json` includes chord qualities not represented in `CHORD_QUALITY_MAP`, which currently supports 20 qualities.
**Rationale:**
- Avoid expanding the theory engine until requirements are clarified
- Document fallback behavior so UI output is predictable
**Tradeoff:** Note spelling can be incorrect for many artist progressions until quality support expands.

---

## 2026-01-21 | Claude Opus 4.5 | Visual Tokens Source of Truth

### Decision: Keep Cyan Terminal Aesthetic, Update Spec
**Context:** project-spec.md specified gold accents (#FFD700) and Roboto Mono font. Implementation uses cyan accents (#00d4ff), Space Grotesk + JetBrains Mono, derived from Stitch design exports.
**Rationale:**
- Cyan aesthetic is already implemented and consistent across all screens
- Stitch exports are the authoritative design source
- Cyan provides better contrast for code/terminal aesthetic
- Changing to gold would require full UI rework with no functional benefit
**Resolution:** Update project-spec.md to match implementation. Stitch exports remain the design source of truth.
**Colors (Implemented):**
- Background: #081020 (dark blue-black)
- Primary Text: #e5e5e5 (soft white)
- Accent: #00d4ff (cyan)
- Card: #0a1628 (slightly lighter dark)
**Fonts (Implemented):**
- Display: Space Grotesk
- Mono: JetBrains Mono

---

## Future Decision Points

### Open: State Management Scaling
If complexity grows beyond 10 screens or state becomes deeply nested, evaluate:
- React Context API
- Zustand (lightweight)
- Jotai (atomic state)

### Open: Chord Data Source
Current chords.json is minimal. Options:
- Expand JSON manually
- Import from music theory database
- Generate programmatically from intervals

### Open: Audio Integration
Project-spec says "no audio output" but user feedback may request:
- Web Audio API for chord playback
- MIDI output for external instruments
- Keep as visual-only
