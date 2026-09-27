# Transcript Analysis Reference

How to read interview/test transcripts and turn them into typed `Evidence/` and `Signals/` files, then wire them into a Persona.

---

## Output model — transcripts become Evidence + Signals

Raw transcripts are **input**, not stored entities. From them you produce:

- **`Signals/`** — one file per meaningful observation (a quote, a moment of friction, an unprompted complaint). Each Signal holds the observation, the date, a link to the transcript, and `evidences: [...]` pointing at any hard data it supports.
- **`Evidence/`** — one file per hard data point (survey %, big-data stat, report figure). Interviews rarely *create* Evidence, but they **confirm or contradict** it.

Then the Persona's sections link to these files (see [persona-template.md](persona-template.md)).

---

## Extraction workflow (processing new transcripts)

### Step 1 — Read all transcripts for the project
Patterns only emerge across multiple interviews — never process just one.

### Step 2 — Extract observations
For each transcript, identify:

| What to look for | Becomes |
|------------------|---------|
| Direct quote worth preserving verbatim | a `Signal` (put the quote in a `>` blockquote) |
| Expressed frustration / workaround / complaint | a `Signal` (a Pain the Persona links to) |
| "I want to… / I need to…" | a **Job to be Done** on the Persona |
| Observed behaviour (from screen-share notes) | a `Signal` |
| Something that contradicts an assumption | a `Signal` + a note in **Persona Improvement** |

### Step 3 — Count cross-transcript frequency
- 1/N → `interview ×1`
- N/N → `interview ×N` (strongest)

### Step 4 — Cross-reference with Evidence
If a `Signal` confirms an `Evidence/` file → tag both `validated` and add the Evidence title to the Signal's `evidences:` list.

### Step 5 — Wire into the Persona
Update `Personas/<Name>.md`:
1. New quotes → **Relevant Quotes**, linking the Signal
2. New/upgraded pains → **Pains**, linking the Signal
3. Confirmed data → **Evidences**, linking the Evidence
4. Emerging patterns → **Correlations**, linking Signals + Evidence
5. Tone of voice → add as an unconfirmed candidate under `## Tone of Voice`, never a direct edit — see `extract-findings/SKILL.md` Step 6 for the full match/promotion mechanism (a trait only becomes canonical once a second, independent transcript confirms it).

---

## Coding rules

- **Preserve exact wording** in a Signal's quote — never paraphrase.
- **One observation per Signal** — don't merge two into one file.
- **Source always visible** — every Signal shows its date and links its transcript.
- **Contradictions are data** — if P1 says X and P2 the opposite, make two Signals and note the differing root cause.
- **Moderator speech is not data** — only participant statements and observed behaviour.

---

## Example — after reading 2 transcripts

```
Create:
  Signals/Liked Songs chaos.md       (quote: "2000 liked songs, can never find anything") interview ×2
  Signals/Context pollution.md       (algorithm drift after parties/shared account)        interview ×2
    → evidences: [Premium churn 12-18m]
Confirm:
  Evidence/Premium churn 12-18m.md   desk-research → validated (both interviews align)

Update Personas/Emma.md:
  Pains          → link Signals/Context pollution.md
  Relevant Quotes→ link Signals/Liked Songs chaos.md
  Correlations   → "Life events corrupt the recommendation model" [Signal][Evidence]
```
