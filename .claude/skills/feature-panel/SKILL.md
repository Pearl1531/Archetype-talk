---
name: feature-panel
description: Test one feature idea against ALL personas at once — a cited PM comparison table (who benefits, who's indifferent, churn risk). Use on /feature-panel or "how would our personas react to X?" without a live conversation.
---

# feature-panel — One feature × all personas

The PM's actual question is rarely "what does Emma think?" — it's **"who does this help, who doesn't care, and who does it annoy?"**. This skill answers that analytically, across every persona in `Personas/`, in one table. (For the *conversational* version of the same question, use `/persona-talk --panel`.)

## Trigger

```
/feature-panel Ideas/Idea3 Context mode (Listening Modes).md   ← an existing Idea file
/feature-panel "<feature description>"                          ← a free-text feature
```

## Workflow

1. **Load the feature.** From an Idea file: the When/I want/So that + its linked Evidence/Signals. From free text: treat as a candidate feature description (and note it has no Idea file yet).
2. **Load every persona** in `Personas/` (cards from `.claude/cache/` when fresh — same cache as persona-talk) with their Pains, JTBD, Product usage, and linked sources. Skip `category: Competitor` personas unless the user asks.
3. **Assess per persona, from data only — recorded stance first:**
   - **Does she already have a `sentiment.stance` on this feature?** Her `## Stances by feature`, or a `sentiment:` block on a linked Signal, is a *recorded* attitude — it beats anything inferred from a pain. Use it as the verdict and cite its Signal.
   - Only when no stance exists: does the feature touch one of her Pains/JTBD? (cite the Signal/Evidence)
   - Does it conflict with her Product usage or a "Resists agreeing about" guardrail?
   - No data either way → the honest cell is **"no data"**, not a guess.
4. **Output the table:**

```
| Persona | Verdict | Why (cited) | Level | Risk if shipped |
|---------|---------|-------------|-------|-----------------|
| Emma    | Strong fit | Hits "context pollution" pain — S: Shared account with partner, E: Shared accounts | L4 | Effort barrier: she avoids manual steps |
| Jake    | Indifferent | Asked about it, shrugged — S: <signal> (`indifferent`) | L3 | none seen |
| Tom     | Conflict | Requires visual interaction; he's voice-first while driving — S: Prefers voice over typing | L3 | Exclusion of a whole segment |
```

   - **Verdict** ∈ Strong fit / Partial fit / Indifferent / Conflict / **No data**.
   - **A recorded stance maps to a verdict, and the two weak spots are the point of the column:** `advocates`/`relies_on` → Strong fit · `appreciates`/`curious` → Partial fit · `indifferent` → Indifferent · `wary`/`frustrated`/`resents` → Conflict · `dealbreaker` → Conflict, and it belongs in *Risk if shipped* by name, because that is a churn statement, not a preference. `mixed`, or a split across her signals, is **never collapsed into one verdict** — write both stances in the cell and say what separates them.
   - **`indifferent` ≠ "no data".** One means we asked and she shrugged; the other means nobody asked. Merging them is how a research gap gets mistaken for a validated non-need.
   - **Mark `unprompted: false` stances in the cell** (e.g. `Conflict (prompted)`). The moderator raised that topic, so the *intensity* is inflated by the question — the stance is sound, its salience is not evidenced. A column where every cell is prompted is a feature the team is interested in and users have never mentioned: say that under the table in one line, because it is usually the most useful thing on the page.
   - **Level** = the claim Level of the strongest source behind the verdict (analyst output — codes allowed). Stale sources get the freshness note.
5. **Below the table, three short lines:** who this is *for* (segments), the biggest risk the data shows, and what's unvalidated → offer to append the unvalidated parts to `Research backlog.md` and, if the feature came as free text, offer to create the `Ideas/` file.

## Rules

- Every non-empty cell cites at least one source by name. "No data" is a first-class verdict — the table's honesty is its value.
- Personas are compared on *their own data*, never averaged into a fake "general user".
- This is analysis, not research: it creates no Signals/Evidence, and a full-column "no data" is a recruiting signal (check `Participants.md` coverage), not a license to speculate.
