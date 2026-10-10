---
name: extract-findings
description: Turn raw interview/test transcripts into typed Evidence and Signals files wired into a Persona. Use when the user provides transcripts, runs /extract-findings, or the Inbox hook flags new files. Includes a PII scrub before anything is stored.
---

# extract-findings — Transcript → Evidence & Signals

Turn raw interview/test transcripts into typed `Evidence/` and `Signals/` files, then report how they wire into a Persona. Replaces the old single `findings.md` with first-class, linkable entities.

**Language:** adapt to the user's language in your replies, but keep verbatim participant quotes in their original language — they are data, never translate or paraphrase them **in place**. When a quote's language differs from the project's, add a translation on its own bracketed blockquote line right under the original (format in [/catalog](../catalog/SKILL.md#quote-translations--the-one-format-the-app-reads)); the app shows it behind *Show translation*.

## Trigger

```
/extract-findings                         ← process any transcript the user provides
/extract-findings <path/to/transcript>    ← a specific transcript
/extract-findings --inbox                 ← process new files sitting in Inbox/
/extract-findings --all                   ← reprocess a whole batch
```

## References — load only when that mode activates

| Situation | Read |
|---|---|
| `--inbox`, or `INBOX_NEW:` in context | [references/inbox-mode.md](references/inbox-mode.md) |
| The user says yes to the lifecycle question (Step 0b) | [references/lifecycle-fields.md](references/lifecycle-fields.md) |
| A participant matched a Persona and you reach the tone step | [references/tone-of-voice.md](references/tone-of-voice.md) |
| A participant named a competitor | [references/competitor-mentions.md](references/competitor-mentions.md) |
| A participant showed where they stand on a feature | [references/stance.md](references/stance.md) |

Steps 0 and 0b below are **not** optional and are never deferred — read them here.

---

## Step-by-step workflow

### 0. PII scrub — before anything is stored

Before a transcript is moved to `Transcripts/` (and before any quote is copied anywhere), scan it for personally identifying details of the **real participant**: real full name, employer, exact address/neighborhood, phone, email, names of their family members, anything that could identify them.

- Propose pseudonymized replacements (participant → `INT-xx`/`P-xx` code or the persona's fictional name; employer → "her company"; etc.) and show the list — the user confirms before the file is written.
- The persona's own fictional details (Emma, Brad, Chicago) are not PII — they're the stand-ins.
- If a verbatim quote contains PII, pseudonymize inside the quote and mark the edit with brackets (`"my boss at [her company] said…"`) — the substitution must be visible, never silent.
- This mirrors `persona-voice`'s outbound anonymization rule: PII is stripped at the boundary, in both directions.

> **GDPR honesty (Art. 4(2)): this AI scrub happens *after* the text reaches the model.** By the time you (the AI) read the raw transcript to propose pseudonyms, the participant's personal data has already been processed by the model provider. This step is a safety net, **not** a way to avoid processing — it cannot be fully automated away. When a session clearly involves **sensitive or client-confidential data**, say so plainly and offer the two stronger options below *before* proceeding; never silently rely on the AI scrub alone.
>
> - **Local pre-scrub (recommended for sensitive data):** redact PII *before* it ever leaves the machine, so the model only sees anonymized text. Point the user to **[Microsoft Presidio](https://microsoft.github.io/presidio/)** — open-source, no account, runs locally — to detect and redact names/emails/phones/locations, then drop the cleaned file into `Inbox/`. (You can help write the Presidio command, but the redaction runs on their machine, not through you.)
> - **Manual scrub:** the user redacts by hand before dropping the file into `Inbox/` — zero machine processing of raw PII, for the strictest cases.
>
> Lawful basis / consent covering AI-assisted processing, a DPA with the model provider, and cross-border safeguards remain the user's responsibility — flag this once, don't lecture. Full note: README ▸ *Anonymization & GDPR*.

### 0b. Record the lifecycle — one question, skippable, never a gate

While filing the transcript, ask **once**, in a single message, whether to record the optional lifecycle fields (schema: `Transcripts/_template.md`):

> Record consent and retention for this session? (consent type + what it covers + a retention date; I'll also note how it was anonymised.) — or **skip**, and everything works exactly as it does today.

Two rules hold whatever they answer:

- **Skip is a first-class answer.** Never ask twice in a session, never re-ask on later runs, never block extraction, never withhold analysis because a field is missing. A repo that ignores these fields entirely stays fully functional.
- **`special_category:` (GDPR Art. 9) gets proposed, never set silently** — and it changes nothing about a finding's strength, only how exports and voice generation treat it.

If they say yes — or the transcript already carries these fields and you need to honor a `consent_scope` — read [references/lifecycle-fields.md](references/lifecycle-fields.md) for what to fill, what to ask, and what each scope gates.

### 1. Read the transcript(s)
Read every transcript for the project. Note participant code, date, and profile. Patterns only emerge across multiple sessions — never process just one when several exist.

### 2. Extract observations → Signals
Create one `Signals/<Title>.md` per meaningful observation:
- a vivid verbatim quote, a moment of friction, an unprompted complaint, an observed behaviour
- put the quote in a `>` blockquote (plus its translation line when needed), add **Interview date** and a **Transcript** link — with the `#anchor` of the moment when the transcript has one, so the app's *Go to the quote* lands on it
- one plain sentence under the quote saying what the signal is, in the project's language
- skip vague filler ("it's ok", "I guess")
- if the project already has themes (`affinity:` on other signals), give the new signal the one it belongs to; with no themes yet, leave it empty — grouping is `/catalog`'s job

Signal frontmatter:
```yaml
type: 'Signal'
title: <short observation title>
tags: []
affinity: ''    # the theme, if the project has them; never on a signal a human locked
evidences: []   # titles of Evidence this observation confirms
```

Extraction ends at writing findings. Sorting them — themes, evidence folders, missing translations, the evidence fields — is [/catalog](../catalog/SKILL.md); offer it at the end of the run instead of doing it inline.

### 3. Extract / confirm hard data → Evidence
If the transcript cites a number, survey, or report, create `Evidence/<Title>.md` (`Evidence/_template.md`: `claim:` + the source fields, Key figures, Content, Takeaways, Does not settle, Sources); a number someone only said aloud stays in the Signal (rule 7). More often, an interview **confirms** existing Evidence — in that case add the Evidence title to the Signal's `evidences:` list and tag both `validated`.

### 4. Assign source tags
- 1 participant → `interview ×1`
- N participants → `interview ×N`
- Signal confirms an Evidence → `validated`

### 5. Wire into the Persona
Propose edits to `Personas/<Name>.md`:
- **bump "Grounded in participants"** when this transcript's participant newly matched the persona — the count is of DISTINCT participants (one per transcript), never repeated sessions with "the persona": every interview is a different, independently recruited person, and matching happens here, per transcript (Step 6)
- new quotes → **Relevant Quotes** (link the Signal)
- new/upgraded pains → **Pains** (link the Signal), **each with its *In her words* sub-line**: the participant's own phrasing of the problem plus their folk theory of the cause, kept close to how they said it. A "wrong" attribution ("it's my boyfriend's metal") is data — record it as given, never replace it with the analytical framing; the analytical description is the bullet above it. This line is what `/persona-talk` speaks from.
- **told anecdotes → Episodes (canon)**: when the participant tells a concrete, situated story (a moment, a place, what happened — not a general complaint), distill it into a 2–3 sentence episode keeping the concrete details they gave, linked to the Signal/transcript. A restated pain is NOT an episode; only actually-told stories qualify. These are what makes the persona answer "tell me about a time when…" like a person.
  **Also capture the shape:** a `peak:` line (the sharpest moment, in their terms) and an `end:` line (how it finished — resolved, abandoned, still open). Memory is dominated by those two and neglects duration, so they are what makes a retelling sound remembered rather than reported. Both optional, both from the transcript: no spike in the story → no `peak:`, and that flatness is true to it; never invent an ending they didn't give.
- **visible shrugs → Doesn't care about**: when the participant is asked about a topic/feature and demonstrably doesn't care ("never thought about it", flat "it's fine" with no engagement), record the indifference with a link — it's an attitude finding, and it stops `/persona-talk` from inventing opinions. Don't log mere non-mention as indifference; only observed shrugs count.
- **recorded stances → Stances by feature**: one row per feature, linking the Signal. When her signals disagree about the same feature, write the row as a **split showing both**, never a reconciled value — that split is a finding, and `/contradictions` should be able to find it
- confirmed data → **Evidences** (link the Evidence)
- emerging patterns → **Correlations** (link Signals + Evidence)

### 6. Match the participant to a Persona, then aggregate Tone of Voice

**Classify first, and don't force it.** Compare this transcript's participant against existing Personas — does their `Product usage`, `Pains`, or linked Archetype overlap clearly with one of them?
- **Confident match** → attach the tone observations below to that Persona, and say so plainly in the report ("Tone → Emma").
- **No confident match** → don't attach the observations anywhere as a guess. Report that plainly instead ("No confident Persona/Archetype match for this participant") and offer `/persona-workshop` to build a new Archetype/Persona from this transcript if the user wants one. An unattached participant isn't a failure — it's the honest outcome when nothing fits yet.

**Then treat tone observations as candidates, not edits.** A single transcript adds a `**Candidate observations**` line, **never a canonical `## Tone of Voice` edit** — promotion needs a second, independent transcript showing the same pattern. One new interview can never overwrite a tone built from dozens of prior ones.

Full machinery — what to extract, the `seen ×N` counter, how to check recurrence without reopening old transcripts, and what to do when a new session contradicts a canonical trait: [references/tone-of-voice.md](references/tone-of-voice.md).

### 7. Update the participant registry

Add (or update) a row in `Participants.md`: participant code, session date, segment sketch, which Archetype(s) they matched (or "no match"), which files their session produced. **If this session's participant is the SAME person as an earlier transcript** (same recruit doing e.g. an interview and later a usability test), set `same_participant_as: '<earlier transcript id>'` in the new transcript's header and mark it in the registry row instead of adding a new person — sessions ≠ people, and every person-level stat (sample confidence, competitor heard-from) collapses such sessions. This is what makes sample coverage visible — which archetypes are well-fed (`interview ×3`) and which still rest on one voice. Pseudonyms only, ever.

### 8. Report to the user
```
Created:
  Signals/Skip track.md              interview ×1  → evidences: ['The Skip']
  Signals/Suggested songs.md         interview ×1  → evidences: ['Discover Weekly erosion']
Validated:
  Evidence/Discover Weekly erosion.md  desk-research → validated
Persona Emma.md:
  + Pains → Signals/Skip track.md (In her words: "it just skips like it's bored")
  + Relevant Quotes → Signals/Suggested songs.md
  + Episode (canon): "The gym playlist fail" — INT-11
  + Doesn't care about: podcasts on home screen — INT-11
  + Tone of Voice candidate: "honestly, kind of a mess" — seen ×1 (INT-11)
```

---

## Rules

- **Never invent quotes** — Signals hold verbatim speech only.
- **One observation per Signal** — don't merge two into one file.
- **Contradictions are data** — conflicting participants → two Signals with different root causes, not one averaged file.
- **Everything links** — a Signal without `evidences:` (when relevant) or a Pain without its Signal link is incomplete.
- **A competitor mention is two bookkeeping moves** — `competitors:` on the Signal, and this transcript's id appended once to that Competitor's `mentioned_in:`. Details, and how aliases attribute: [references/competitor-mentions.md](references/competitor-mentions.md).
- **Highlighted fragments come first.** `==fragment=={tag}` marks in a transcript are the team's own emphasis — extract from those before anything else and name their tags in the report. Never add, remove or retag a highlight yourself; suggest it.
- **A stance needs a line you can point at.** When a participant shows where they stand on a feature, propose a `sentiment:` block on the Signal — never set one silently, and never infer one from a pain alone. Ambiguous tone, irony or sarcasm → leave it out and write the question into `Research backlog.md`. Ladder and failure modes: [references/stance.md](references/stance.md).
- **Never force a persona/archetype match for Tone of Voice.** No confident fit means no attachment — offer `/persona-workshop` instead of guessing.
- **Tone of Voice only changes through recurrence.** A single transcript adds a candidate, never a canonical edit — see Step 6.
- **Freshness check (3 months)** — after processing, compare all Signal dates and Evidence `retrieved:` with today. If the newest data supporting a persona is older than 3 months, end the report with: `🕒 Data older than 3 months — suggest the user run a refresh round of research.`
- **URL-encode links** — spaces `%20`, apostrophes `%27`, parentheses stay literal or `%28`/`%29`.
- **Offer a local commit after each processed batch** — a snapshot of the graph per research batch is free history ("Process INT-11: 3 signals, 1 evidence validated, Emma updated"). Commit locally only; never push unasked.
- **Suggest `/graph-lint` after large batches** — new links are where the graph breaks.
- **Rebuild the routing index when you're done** — `python3 scripts/graph_index.py build`. New Signals are invisible to it until then, and the personas whose slices you touched need their cards rebuilt on next use, which the slice hash now handles by itself.
