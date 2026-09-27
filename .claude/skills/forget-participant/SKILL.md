---
name: forget-participant
description: Remove one participant from the graph — GDPR Art. 17 erasure, or de-identification that keeps the finding and drops the person. Use on /forget-participant, on a withdrawal of consent, or when a retention date falls due.
---

# forget-participant — erasure without wrecking the graph

A participant asks to be forgotten, withdraws consent, or a retention clock runs
out. The naive version of this — delete the transcript — is the worst version: it
leaves Signals quoting a file that no longer exists, personas standing on
evidence nobody can check, and confidence numbers that quietly became fiction.

This skill removes the **person** while deciding, explicitly, what happens to the
**findings**.

## Trigger

```
/forget-participant INT-06              ← proposes de-identification (default)
/forget-participant INT-06 --erase      ← full removal of everything derived
/forget-participant                     ← asks which participant
```

## Workflow

### 1. Trace before touching anything

```bash
python3 scripts/participant_trace.py <CODE>
```

Report-only. It follows the code, `same_participant_as` links between sessions,
Signals citing the transcript, Personas and Archetypes carrying those quotes,
root documents, and derived caches (`.claude/cache`, `.claude/voice-cache`).
Show the user the inventory before proposing anything. **Second-degree hits**
(an archetype paraphrasing "Tom prefers dictation because of dyslexia") need a
human read — the script flags them, it cannot judge them.

### 2. Pick the mode — say what each one costs

**De-identification in place (default, propose this first).** The transcript
goes; the verbatim quote goes; the *observation* survives:

```markdown
> "I have dyslexia. Typing was always slow and full of mistakes for me..."
```
becomes
```markdown
**Observed:** participant reported a permanent difficulty with typing that makes
voice input faster in every context, not only while driving.
```
plus `source_removed: true` and `source_removed_on: <date>` in the Signal's
frontmatter. The finding keeps working for personas and PM decisions; nobody can
be identified from what remains. This is what a researcher almost always wants,
and it is usually enough — GDPR stops applying once the data can no longer be
linked to a person.

**Full erasure (`--erase`).** Everything derived from that participant goes,
including the observations. Use when the person asked for exactly that, when the
text itself identifies regardless of scrubbing, or when the material should never
have been collected. Say plainly what the graph loses before doing it.

### 3. Apply, in this order, with approval

1. `Transcripts/<file>.md` — delete (both sessions if `same_participant_as`).
2. Signals — de-identify or delete per mode. A Signal that loses its only source
   is listed by the trace; never leave one silently standing.
3. Personas / Archetypes — remove the quote lines, keep the claim only if a
   different source still supports it.
4. `Participants.md` — remove the row; **update the coverage read below the
   table**, since sample coverage just changed.
5. `Research backlog.md` — remove any question naming the person.
6. `same_participant_as` in other transcripts — drop the dangling reference.
7. Derived: `.claude/cache/*.card.md` (stale anyway), `.claude/voice-cache/*`
   for an affected persona, leftovers in `Inbox/`.

### 4. Re-grade — the step that makes this honest

Removing a source changes what the graph can claim. Recompute and **state the
drops in plain language**:

> Tom: "voice is faster than typing in every context" drops L4 → L3 (the
> correlation lost its interview leg; the Evidence on dyslexia and typing stands
> on its own). "Voice search misfires on accents" loses its only source — L3 → L1,
> now an assumption, added to the backlog as a question to re-ask.

Then run `python3 scripts/graph_lint.py` and show that the graph is consistent.

### 5. Record it — proof, without new personal data

Write `docs/erasure/ERASURE-<CODE>-<YYYY-MM-DD>.md`: the code, the date, the mode,
the file list with what happened to each, the level changes, and what remains out
of reach. **No names, no quotes, no contact details** — an erasure record that
holds personal data defeats itself. This file is the evidence you acted, so keep
it even after the data is gone.

### 6. Name what you cannot reach — every time, never buried

- **git history** — earlier commits still hold the file. Explain plainly: real
  removal means rewriting history and force-pushing, every clone and fork must
  be re-pulled, and it is a deliberate coordinated act. Offer the commands; never
  run a history rewrite yourself.
- **browser storage** — votes, exclusions, drafts: app Settings ▸ Privacy &
  network ▸ Clear local data.
- **the source system** — Dovetail, Otter, Zoom still hold the original.
- **the model provider** — session logs, per their retention setting.
- **ElevenLabs** — any audio generated from that persona.
- **already-sent exports** — zips, PDFs, tickets in stakeholders' hands.

## Rules

- **Never act on the trace alone.** Show the inventory, get a yes, then edit.
- **Never delete a whole Persona** because one participant left. A persona
  usually rests on several sources; if it truly rests on one, say so and let the
  researcher decide.
- **Special-category material (`special_category:`) is named explicitly** in the
  proposal — the researcher should know Art. 9 data is in scope before deciding.
- **One participant ≠ one session.** Always check `same_participant_as`.
- **Don't touch `demo: true` files** unless the user is explicitly cleaning up the
  demo set (that's `/demo-data`).
- The graph may end up thinner. That is the correct outcome, not a failure —
  never preserve a claim by quietly leaving its source citation dangling.
