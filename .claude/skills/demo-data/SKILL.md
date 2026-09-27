---
name: demo-data
description: List, keep, separate, or delete the demo dataset so it's never mistaken for real research. Use on /demo-data or when asked to clean up/remove/separate demo content.
---

# demo-data — Keep, separate, or delete the example dataset

Every example file carries `demo: true` in frontmatter (badge in the app, ⚠️ preamble in `persona-talk`). That's machine-clear, but as real research accumulates, humans skimming folders can still mix demo and real files. This skill executes a **one-time decision** (revisitable any time) and records it in `.claude/demo-decision.local` so nothing nags again.

**App shortcut:** the browser app's Settings page has a "Delete demo files" button — it mechanically removes every `demo: true` entity file from disk (never touching unflagged files in the same folders) and suppresses the app's embedded example preview. The delete mode below remains the *full* cleanup: demo avatars, `DEMO.md`, demo rows in `Research backlog.md`/`Participants.md`, README's example-set paragraph.

## Trigger

```
/demo-data            ← show status + the three options
/demo-data status     ← just list what's demo vs real, per folder
/demo-data keep       ← keep in place (badges already separate it) — records the decision
/demo-data separate   ← move all demo content under Demo/ (mirrored folders)
/demo-data delete     ← remove all demo content (destructive — double confirmation)
```

## Status (always run first)

Count `demo: true` files per folder vs files without the flag. Say plainly which state the repo is in: pure demo (no real data yet — recommend **keep**, it's the working reference), mixed (recommend **separate**), or real-only-plus-demo-leftovers (**separate** or **delete**).

## keep

Write the marker, done. Note for the user: the demo remains the best live reference of a fully-wired graph — and `persona-talk`'s ⚠️ preamble + the app's Demo badge keep it unmistakable.

## separate — move under `Demo/`, mirrored structure

Target layout preserves relative depth, so the demo's internal `../Signals/…` links keep working **unchanged**:

```
Demo/Personas/  Demo/Signals/  Demo/Evidence/  Demo/Archetypes/
Demo/Ideas/     Demo/Competitors/  Demo/Transcripts/
```

1. Plan first: list every `demo: true` file and its destination; get one approval for the whole move (this is a mechanical relocation, not a graph rewiring — the CLAUDE.md link-approval rule's "batch trivial fixes" case).
2. `git mv` each file (history preserved).
3. Special cases, handled explicitly:
   - **`Product Context.md`** — skills depend on this root path. Archive the demo content to `Demo/Product Context (Spotify demo).md` and reset the root file to a skeleton for the user's own product (offer `/welcome` Step 4 to fill it).
   - **`Research backlog.md` / `Participants.md`** — move demo *rows* to a clearly-marked "Demo examples" section at the bottom of each file (or delete the rows if the user prefers); the files themselves stay.
   - **`DEMO.md`** — update its paths to `Demo/Personas/Emma.md` so the demo walkthrough still works.
4. Add a one-line `Demo/README.md`: *"Example dataset (Spotify) — illustrative, `demo: true` everywhere, not real research. Talk to it: `/persona-talk Demo/Personas/Emma.md`."*
5. Run `python3 scripts/graph_lint.py` (it scans only top-level folders, so separated demo content drops out of lint noise — by design) and fix any real-data links the move surfaced.
6. Persona cards in `.claude/cache/` invalidate automatically (graph hash changed).
7. Write the marker; offer a local commit ("Separate demo dataset into Demo/").

## delete — destructive, slow down

1. Show the full list of what will be removed (files + demo rows).
2. **Commit the current state first** ("Snapshot before demo-data delete") so it's recoverable from history — then, after an explicit second confirmation, `git rm` the demo files and strip demo rows.
3. Update `DEMO.md` (points at content that no longer exists → replace body with a note that the example set was removed and the walkthrough requires the template's original data) and `README.md`'s example-set paragraph.
4. Run graph-lint; write the marker; offer a local commit.

## Rules

- Never mix decisions: one run = one of keep/separate/delete, applied consistently to the whole demo set — a half-moved demo is worse than either state.
- Real data (no `demo:` flag) is never touched by this skill, whatever the mode.
- The marker `.claude/demo-decision.local` (gitignored) stores the choice + date; `/demo-data` can always be re-run later to change the decision.
