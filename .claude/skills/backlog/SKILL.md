---
name: backlog
description: Review and manage Research backlog.md. Use when the user runs /backlog, asks what's open to research, wants to dedupe/close backlog questions, or plan the next research round.
---

# backlog — Research backlog review

Close the loop that `/persona-talk` opens: questions land in `Research backlog.md`, this skill keeps that list useful instead of letting it silt up.

## Trigger

```
/backlog              ← review: dedupe, group, flag stale, propose next steps
/backlog close <ref>  ← move a question to "Closed / turned into research"
```

## The table

| Date | Persona | Question | Source / level | Status | Kind | Priority |

`Kind` is optional and holds `qualitative`, `quantitative` or `mixed` — **the shape
of the answer that would settle the question**, not its topic. It decides the method,
and the method decides where the answer lands: a session we run becomes a `Signal`,
an aggregate (analytics, survey, published report) becomes `Evidence`. The app's
Research backlog page writes this column and recommends 2–3 methods per row; an
empty cell means nobody has decided yet — suggest a value, never backfill silently.

### `Priority` — proposed by you, owned by the researcher

Holds `critical`, `major` or `minor` — **how much rests on the answer**, not how
interesting the question is:

- `critical` — blocks a decision someone is making now (pricing, build/don't-build, a standing contradiction in the data, a blind spot nobody raised).
- `major` — shapes the work without blocking it: why and how people act.
- `minor` — good to know. Warm-up context, a plain fact, anything you would only ask because someone is already in the room.

**Set it whenever you add a row.** A question filed with no priority is a question
nobody will schedule. Write the bare word (`critical`) — that marks it as
machine-set, and a later run of this skill may revise it with a reason.

**`critical (locked)` is a human decision. Never overwrite it, never clear it, never
re-word it — not even when your own read disagrees.** The suffix is written by the
app the moment the researcher picks a priority by hand, and it means the same thing
as `affinity_lock:` on a Signal or `==highlights==` in a transcript: this field
belongs to a person now. You may *say* you would rate it differently and why — once,
in the review output, never in the file.

An empty `Priority` cell is not "minor": it means nobody has decided. The app shows
a dashed guess read from the wording and writes nothing.

## Review workflow

1. Read `Research backlog.md` (Open questions table).
1b. **Check the split.** A backlog that is nearly all `quantitative` usually means we
   are trying to measure something no one has understood yet — say so. Nearly all
   `qualitative` after several rounds means findings are never being sized.
2. **Dedupe:** near-duplicate questions (same underlying unknown, different wording) → propose merging into the sharper phrasing, keep the earliest date. Show merges before applying — the table is the researcher's document.
3. **Group by persona and by theme** — a cluster of 3+ questions around one theme is a research-round candidate; say so explicitly.
4. **Flag stale questions** — open for months with no linked activity: ask whether they're still worth answering or should be closed as "no longer relevant".
4b. **Re-read the priorities.** Rows you (or an earlier run) set are yours to revise —
   say what changed and why. Rows carrying `(locked)` are the researcher's: report a
   disagreement in one line, leave the cell alone. Rows with an empty cell get a
   proposed value with the reason drawn from the question's own wording.
5. **Propose next steps**, most valuable first — `critical` before `major` before `minor`, always:
   - a cluster ready for interviews → offer `/interview-guide` (it builds the discussion guide from these rows)
   - a question answerable by desk research → offer `/researcher` (result = Evidence, and say plainly it doesn't close the gap the way a real interview would)
   - a question answerable from product analytics → offer `/analytics-sync`
   - route by `Kind` where it is set: `qualitative` → `/interview-guide`; `quantitative` → `/analytics-sync` or `/researcher`, or a sized survey; `mixed` → qualitative round **first**, then size it. Never propose only one method — name the alternative and what each one cannot tell you.
6. Apply approved edits to the table only — never touch Signals/Evidence from here.

## Closing workflow

When research actually happened (new transcript processed via `/extract-findings`, or Evidence created):
- move the row to **Closed / turned into research** with a pointer to what answered it (Signal/Evidence title).
- if the answer *contradicts* what a persona currently claims, flag it — that's `/contradictions` territory, not a silent persona edit.

## Rules

- The backlog is append-honest: never delete a question silently; closing always states why.
- Source/level column keeps its origin (`warm-up`, `known unknown (L1)`, `blind spot — AI-inferred, not raised`).
- A `Priority` you wrote is a proposal; a `Priority` ending in `(locked)` is a decision that has already been made. Proposals may be revised with a stated reason, decisions may only be questioned out loud.
- A `Kind` value is the researcher's call. You may propose one (with the wording that suggests it) and write it once approved — a guess left in the file is indistinguishable from a decision.
- This skill never creates Signals or Evidence — it routes questions toward the tools that do it legitimately.
