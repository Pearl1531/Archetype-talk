---
name: retention
description: Act on the storage clock — transcripts past their retention date. Use on /retention, when graph-lint reports an overdue file, or during a periodic data review.
---

# retention — the clock, and why it usually ends in a state change

Storage limitation (GDPR Art. 5(1)(e)) says personal data may not be kept longer
than necessary. It does **not** say "delete your research" — and treating the two
as the same is how teams lose their evidence base for no compliance gain.

The insight this skill is built on: **anonymous data is outside the GDPR
entirely.** So the natural end of the clock is not deletion, it is graduation.

```
raw  →  scrubbed  →  key destroyed (anonymous)  →  [only if needed] deleted
        ↑ clock running          ↑ clock stops
```

## Trigger

```
/retention              ← what is due, what is close, what to do
/retention --review     ← walk every transcript, not only overdue ones
```

`graph-lint` surfaces overdue files too and points here.

## Workflow

### 1. What is due

```bash
python3 scripts/graph_lint.py    # [retention] lines: overdue, and due within 30 days
```

A file only has a clock if it has `retention_until:` and is still personal data
(`key_location:` anything but `destroyed`). Files without the field aren't
violations — they're unrecorded. Offer to set a date, don't nag.

### 2. Propose the state change first

For each overdue transcript, in this order:

1. **Finish de-identification** — is the scrub good enough that nobody could
   identify this person from the remaining text? Check the whole thing, not just
   names: unique phrasing, employer, city plus role plus age, an anecdote only
   one person could tell. `anonymization: manual_verified` means a human
   confirmed this; nothing else does.
2. **Destroy the key** — the linking list, the recording, the calendar invite,
   the recruiting-platform record, the incentive payment trail. This happens
   **outside this repo**, in the systems that hold them; the skill can only set
   `key_location: destroyed` to record that it was done. Ask, don't assume.
3. Once both are true, the file is anonymous: set `key_location: destroyed`, drop
   `retention_until` (or leave it as history), and **the clock stops for good**.

### 3. Delete only when the text still identifies

If the material can't be de-identified without gutting it — a small sample where
the story itself names the person, a session about a named product decision —
then deletion is the right answer. Hand off to `/forget-participant <CODE>`,
which does the cascade and the re-grading properly.

### 4. Report

Show: what graduated (clock stopped), what was deleted, what the user deferred
and until when. Then run `graph_lint` to confirm the graph is still consistent.

## Rules

- **Never delete a file on your own.** Propose; the researcher decides. This skill
  edits frontmatter after approval and hands deletion to `/forget-participant`.
- **De-identification before deletion, always.** Deleting a transcript that could
  simply have been anonymised destroys research for nothing.
- **Retention ≠ freshness.** The 3-month freshness rule asks *is this finding
  still true?*; retention asks *may we still hold this?* A stale finding may be
  perfectly lawful to keep; a fresh one may be past its retention date. Never
  merge the two clocks, and never let a UI filter that hides old items be
  described as deletion.
- **The clock comes from your promise, not from a statute.** GDPR sets no number.
  If the consent said "we keep recordings 12 months", that is the date. Read
  `consent_scope` and `consent_ref` before proposing anything.
- **Demo files have no clock** — fictional participants, nothing to expire.
