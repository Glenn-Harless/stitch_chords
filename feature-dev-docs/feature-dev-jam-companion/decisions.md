# Jam Companion POC Decisions

> Append-only log. Format: timestamp, agent, decision, rationale.

## 2026-05-08 | Codex | Reframe From Reference App To Jam Copilot

Decision: The active app should become a guided jam workspace instead of a chord library dashboard.

Rationale: The user wants help creating melodies and progressions while jamming, especially for electronica, and wants handholding because their theory is weaker. A reference-first UI does not directly serve that job.

## 2026-05-08 | Codex | Use SQLite And Local API For POC

Decision: Add a local Node API with SQLite persistence, while keeping frontend fallback storage.

Rationale: This is a personal app, so SQLite avoids cloud complexity. A backend is still useful for durable local sessions and future AI calls without exposing model API keys in the browser.

## 2026-05-08 | Codex | Keep Music Logic Deterministic

Decision: Build deterministic generation and validation first; reserve AI for explanation, adaptation, and variation.

Rationale: Music theory math must be predictable and testable. An LLM can be useful as a coach, but should not be the only source of chord spelling or playable constraints.

## 2026-05-08 | Codex | Retain Legacy Stitch Components Temporarily

Decision: Keep legacy Stitch screens in `src/components` as reference code during the POC, but do not route the active app through them.

Rationale: The old UI still contains useful interaction and design ideas. Removing it immediately would slow exploration, while the new Jam Companion docs define the active behavior.

## 2026-05-08 | Codex | Make Phone Portrait The Primary Design Target

Decision: Redesign the POC around a mobile-first layout with a compact header, bottom tuning sheet, tabbed detail panels, and sticky bottom action bar.

Rationale: The app is likely to be used near an instrument or while jamming, where a phone or small tablet is more realistic than a desktop dashboard. Mobile-first also forces the UI to prioritize the next playable action over broad reference density.
