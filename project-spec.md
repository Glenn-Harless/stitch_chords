Comprehensive Product Specification
1. Project Vision
Lush Chords is a high-density, utility-focused digital cheat sheet for keyboard players and composers. Unlike traditional "learning" apps that focus on gamification or polished visuals, Lush Chords adopts a "Terminal Aesthetic" to provide maximum information at a glance. It bridges the gap between basic triads and complex artist-inspired harmonic "flavors" (e.g., Apparat, Radiohead, Nils Frahm).

2. Design Principles
Information Density: Prioritize text and data over whitespace or imagery.
Monospace Typography: Use code-style fonts (e.g., Roboto Mono) for alignment and legibility.
Dark Mode Utility: High-contrast dark backgrounds to reduce glare on music stands.
Instrument First: No audio output is required; the app is a visual reference for a musician sitting at a physical instrument.
Zero-Fluff UX: Every tap should lead directly to a chord or a theory application.
3. Core Capabilities
Artist Harmonic Mapping: Browse signature chord progressions used by specific artists.
Real-time Note Spelling: Every chord extension (9ths, 11ths, 13ths, etc.) is instantly broken down into individual notes.
Roman Numeral Analysis: Chords are displayed alongside their functional scale degree (I, IV, vi, etc.) to aid in transposing.
Dynamic Song Builder: Assemble "Verse," "Chorus," and "Bridge" sections by "dropping" progressions into an active chart.
Harmonic Expansion Engine: A set of 6 logical rules (Prolongation, Pedal Bass, etc.) to transform simple chords into "lush" sequences.
Live Performance Tools: Global Transpose, "Keep Screen On" mode, and Guitar/Keyboard toggle.
4. Screen-by-Screen Reference
A. The Discovery Layer
Artist Selection List: A minimal, searchable list of artists.
Artist Progression Library: Displays a list of an artist's signature progressions.
Interaction: Features an "Unfold More" toggle to show alternative voicings and note spellings.
Expansion Techniques Menu: A directory of 6 harmonic principles (e.g., "Modal Borrow Swaps") that teaches users how to expand basic harmony.
B. The Building Layer
Custom Chord Scratchpad: A manual entry tool. Type any chord name to get an instant note breakdown and add it to the active song.
Save Song Overlay: A terminal-style dialog to name and locally store the current song structure.
Saved Songs Library: A list of all user-created structures, sorted by "Last Opened."
C. The Playing Layer (The "Active" View)
Active Playing View: The primary interface for use at the keyboard.
Features: 4-bar grid layout, Global Transpose bar, and a "Swap Voicing" utility at the bottom for quick harmonic experimentation.
5. User Flows
Flow 1: Inspired Creation
User selects Artist (e.g., Radiohead) -> Browses Library.
User identifies a "Chorus" progression -> Taps [ADD TO CHORUS].
User opens Active Playing View to see the chords and notes spelled out while they play.
Flow 2: Harmonic Transformation
User has a simple Am - F - C - G progression in their chart.
User navigates to Expansion Techniques -> Selects "Pedal Bass."
User applies "Pedal A" -> The chart updates to show Am9/A - Fmaj7/A - Cmaj7/A, instantly creating a "lush" atmospheric drone.
Flow 3: The Live Transpose
User loads a song from the Saved Songs Library.
While playing, the user realizes they need the song in a different key.
User uses the Global Transpose slider -> All chords and note spellings update in real-time.
6. Technical Requirements for Developers
Music Theory Engine
The app must include a logic layer that knows the relationships between notes.

Chord Parser: Must translate strings like "maj9#11" into intervals (1, 3, 5, 7, 9, #11).
Key Awareness: Must calculate Roman numerals based on the relationship between the chord root and the global key.
Data Schema
Local Storage: All song data is stored as a JSON object in the browser’s LocalStorage.
No-Account Model: Initial version is strictly local-first.
UI Stack (Implemented)
Fonts:
- Display: Space Grotesk (headings, UI labels)
- Mono: JetBrains Mono (chord names, data, code-style elements)
Colors:
- Background: #081020 (dark blue-black)
- Card: #0a1628 (slightly lighter dark)
- Primary Text: #e5e5e5 (soft white)
- Accent: #00d4ff (cyan - for headers, interactive elements)
- Muted: #9ab8bc (blue-gray - for secondary text)
- Border: white/5 to white/20 (subtle borders)
Effects:
- Scanline overlay for terminal aesthetic
- Glow effects on accent elements (box-shadow with cyan)