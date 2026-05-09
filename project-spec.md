# Jam Companion Product Specification

## Vision

Jam Companion is a personal electronica copilot for writing while sitting at an instrument. It helps the user make chords, bass movement, and melody ideas without assuming strong music theory knowledge.

The product should answer: "What can I play right now that fits the electronic music I like?"

## Product Shift

The previous Stitch Chords app was a dense chord and progression reference. The overhaul keeps useful seed data and the dark utility aesthetic, but the main surface is now a guided jam workspace.

## Core Loop

1. User chooses key, vibe, energy, complexity, bar count, and reference artist.
2. App generates a playable loop.
3. App shows chords, roman numerals, note spelling, voicing hints, bass/pedal ideas, and melody notes.
4. User previews the bass pulse or plays it on an instrument.
5. User regenerates, saves, or asks for a future AI variation.

## Architecture

- Frontend: React + Vite PWA.
- Music engine: deterministic TypeScript utilities in `src/utils`.
- Seed data: bundled artist/progression JSON.
- Backend: local Node API in `apps/api`.
- Database: SQLite file in `.data/stitch-chords.sqlite`.
- AI: backend-owned future integration. Browser must not own model API keys.

## Mobile-First Design

The primary design target is phone portrait. Desktop layouts may expand the same workflow, but must not define the product shape.

The main mobile surface uses:

- Compact sticky header with session summary.
- Bottom sheet for key, vibe, energy, complexity, bar count, reference artist, and instrument tuning.
- Four-tab detail model: Chords, Melody, Bass, Coach.
- Sticky bottom action bar for Preview, Vary, and Save.
- Large tap targets suitable for playing near an instrument.

## POC Constraints

- Personal app; no login or cloud sync required.
- SQLite is sufficient for persistence.
- PWA remains useful when the local API is not running.
- The first AI-ready surface can use deterministic responses until schemas and prompts are finalized.

## Behavior Principles

- Prefer explicit playable guidance over abstract theory.
- Use theory language, but translate it into instrument actions.
- Keep loops small, repeatable, and easy to mutate.
- Electronica defaults should emphasize repetition, pedals, color tones, filtering, density, and gradual variation.
