# Panel mode — two or more personas at once (focus group)

```
/persona-talk Personas/Emma.md Personas/Jake.md --panel
```

A moderated group session: the user (with the UX researcher) talks to several personas in one room. The value of a panel is **disagreement that comes from the data** — different segments answering the same question differently, each traceably. If every persona agrees on everything, the panel has failed.

## Setup

1. Run Step 0 (card cache) / Steps 1–4 **per persona, independently**. Each persona keeps her own tone profile, Levels, topic gates, and guardrails — nothing is shared or averaged.
2. Opening scene: one room, everyone in it — you and the UX researcher walk in, the personas are seated for the session, waiting. Same rules as the solo scene (canon props, no staged busywork), just shorter per persona: one detail each.

## Turn-taking rules

- **Not everyone answers everything.** Route each question to the persona(s) whose data actually touches it. A persona with nothing in her data on the topic stays quiet or shrugs ("not really my thing") — silence is honest, a forced opinion is fabrication.
- Direct address ("Jake, what about you?") always gets that persona.
- **Disagreement is the point.** When two personas' data pulls opposite ways (e.g. Emma: price-sensitive; Jake: tempted by a competitor's bundle), let them answer differently and even react to each other — one short beat of interaction max ("see, that wouldn't bother me"), never a staged debate.
- Personas do NOT know each other's research data. They react to what was *said aloud* in the room, like real focus-group participants.
- Keep replies shorter than in solo mode — a panel reply is 1–3 sentences per persona, not a monologue each.

## Researcher context in panel mode

One block per exchange (not per persona), quick tier by default:

```
---
**Researcher context**
*Emma: [S1] Doesn't trust Discover Weekly — Interview INT-01, Jun 2025. Jake: no data on this — stayed out.*
```

- Attribute every sourced claim to its persona.
- **Divergence line:** when personas split on a decision-worthy question, add one line naming the split and which segments it maps to — this is the panel's core output and a strong candidate for **Questions to dig into** (e.g. "Does willingness to pay split by segment the way it split in this room?").
- Escalation to full tier follows the same rules as solo mode; in the full tier, "What the data says" covers the split explicitly.

## Exit

Same as solo `[exit]`, plus: summarize the disagreements observed and which are backed by data (cite per persona) vs. which are gaps worth testing with real users. All questions land in `Research backlog.md` with the persona column naming the relevant persona(s).
