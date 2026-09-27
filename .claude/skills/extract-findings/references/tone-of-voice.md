# Tone of Voice — candidates, promotion, drift

Load at Step 6 once a participant has been **confidently matched** to a Persona.
No match → nothing to attach, and none of this applies.

This is the machinery behind one rule that stays in the skill itself: *a single
transcript adds a candidate, never a canonical edit.*

## Extract, then treat as candidates

Pull concrete signal from the transcript:

- sentence rhythm, fillers and verbal tics, emotional register, recurring phrases
- **interview demeanor** — which topics visibly animated the participant vs. shut
  them down to one-word answers, and whether they asked the researcher questions
  back (these feed the *What animates / shuts down* and *Asks back* lines)
- **speech markers** — the mechanics of how they talk, below the level of content:

| Marker | What it looks like in a transcript |
|---|---|
| Hedging | "kind of", "I guess", "sort of", "maybe", "I think" |
| Self-correction | starts a sentence, restarts it differently |
| Repetition | says the same phrase twice for emphasis, or circles back to it |
| Going quiet | one-word answers, trailing off, "…yeah" |
| Pronoun shift | moves from "I" to "you" or "people" when the topic gets uncomfortable |
| Asking back | turns the question around on the researcher |

### These are for imitation, never for inference

**Record what they did. Never diagnose why.** Hedging is associated with uncertainty
and disfluency with cognitive load, but those are weak signals individually, and most
UX transcripts are tidied up in transcription — half the hesitations never survive to
the page. Reading a hidden preference out of "kind of" is exactly the over-reading the
stance rules forbid, and it would be unfalsifiable to a reviewer.

What they *are* good for: making the persona **talk like that person**. Someone who
hedges every third sentence and someone who states things flat are different to
interview, and reproducing that is imitation — not mind-reading. If a marker seems to
mean something, that belongs in `Research backlog.md` as a question to ask, never in
the persona as a conclusion.

Same promotion rule as everything else here: a marker seen once is a candidate.

**Never write directly into the Persona's canonical `## Tone of Voice` bullets.**
Add each observation under a `**Candidate observations**` subsection instead —
create it if missing — tagged with how many independent interviews have shown it
and which transcripts:

```
**Candidate observations (unconfirmed):**
- "specific phrase or pattern" — seen ×1 (INT-11)
```

## Promotion requires recurrence, never recency

A candidate moves into the canonical Vocabulary / Fillers / Signature phrases
bullets only once a **second, independent** transcript shows the same pattern
(`seen ×2`) — then move it up and drop it from the candidate list.

This is the `interview ×N` logic applied to voice instead of pains, and it exists
for one reason: **one new interview can never overwrite a tone built from dozens
of prior ones, because a single observation cannot cross the threshold by itself.**

## Check recurrence cheaply — never re-read old transcripts

The `seen ×N (INT-…)` tag is the running counter and its own history at once. To
tell whether a new observation is a repeat, compare it only against the candidates
already listed in the Persona file you are reading anyway: match → bump the count
and append the transcript id; no match → add a new `seen ×1`. The candidate list
*is* the memory, so past transcripts never get reopened just to check.

## Contradictions don't silently overwrite

If a new transcript's tone clashes with an already-canonical trait — a markedly
different register, say — don't quietly replace it. Flag the drift in the report
and let the user decide, exactly as with a contradicting Signal.

## Housekeeping

A candidate never reinforced across many later interviews for the same persona is
noise. Quietly drop it during a later pass rather than letting the list grow
forever.
