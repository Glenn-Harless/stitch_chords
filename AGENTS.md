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

### **1. Markdown Is the Single Source of Truth**

* All requirements, architectural reasoning, and behavioral expectations must live in Markdown files inside the repo.
* Code and documentation evolve **atomically** with each commit.
* The Markdown files must always reflect the *current* state of the system.

Agents must not create new feature-dev-{X} folders for Beads tickets.
Tickets map to changes within existing features, not new folders.
New feature-dev-{X} folders are created only when a new conceptual feature is introduced.


### **2. Requirements Must Stay Current**

* When code behavior changes, update the feature’s `requirements.md` immediately.
* Include:

  * high-level summary
  * inputs/outputs
  * constraints
  * edge cases
  * user flows
  * implementation-agnostic behavior

### **3. Decisions Must Be Logged**

* Update `decisions.md` for any architectural tradeoff, design change, or intentionally selected approach.
* Use an **append-only log** (include timestamp + agent name).
* Focus on *why* something changed, not what changed.

### **4. Tests Must Describe Behavior**

* Update `tests.md` whenever behavior, constraints, or flows evolve.
* Define:

  * acceptance criteria
  * unit test expectations
  * integration paths
  * relevant edge cases
* Tests describe *observable behavior*, not implementation specifics.

---

# **Directory Convention**

All feature-level documentation must live under:

```
feature-dev-docs/
    feature-dev-{X}/
        requirements.md
        decisions.md    # auto-updated by agents + commits
        tests.md
```

Where:

* `feature-dev-{X}` is a unique namespace for the feature, subsystem, or capability.
* Subfolders may be added for deep features if needed (agents should infer structure from existing patterns).

---
