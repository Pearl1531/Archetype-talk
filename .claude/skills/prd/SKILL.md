---
name: prd
description: Draft a PRD from an Idea file where the "Why" section is 100% cited from the graph and open questions come from the Research backlog. Use when the user runs /prd or asks to write a product requirements doc / spec for an idea.
---

# prd — A PRD whose "Why" is fully cited

Generate a draft PRD from an `Ideas/` file. The differentiator: the **Why** section contains only claims that exist in the graph, each cited — and the **Open questions** section shows engineering exactly what's still unvalidated, pulled from `Research backlog.md`. A PRD that admits what it doesn't know.

## Trigger

```
/prd Ideas/Idea3 Context mode (Listening Modes).md
```

## Structure of the draft

1. **Problem statement** — the When/I want/So that, expanded into prose from the linked Pain and its Signal (verbatim quote included — a real user's sentence beats ten bullets).
2. **Why now / evidence** — every linked Evidence and Signal, one line each: claim + source + Level (analyst doc — codes fine) + freshness note where the 3-month rule bites. Nothing uncited enters this section, period.
3. **Who it's for** — the persona(s) whose Pains link here (run the logic of `/feature-panel` briefly: fit, indifferent, conflict — including any persona this could *hurt*).
4. **Scope sketch** — reasonable functional bullets from the idea; clearly labeled as **proposal, not research** (this is the one section allowed to go beyond the data, and it says so).
5. **Success metrics** — from the idea's `Metric to watch` + how to verify via `/analytics-sync`; baseline value if an internal Evidence already holds one.
6. **Open questions & risks** — matching open rows from `Research backlog.md` + anything Low/Very-low Confidence in the scoring block, each with the cheapest next validation step (interview round via `/interview-guide` vs analytics query vs desk research).
7. **Out of scope / won't do** — anything the data actively argues against (e.g. a guardrail like "she won't pay a separate add-on charge [Price sensitivity]").

## Workflow

1. Read the Idea + linked sources + persona sections + backlog rows + `Product Context.md`.
2. Draft; show it; iterate with the user.
3. On approval, save as `PRDs/<Idea name> <YYYY-MM-DD>.md` (create the folder if needed). Offer `/export ticket` for the implementation-sized version.

## Rules

- The Why section is load-bearing: if an Idea's grounding is thin (L2 or less), the PRD's own header says so — *"Draft based on desk research only; no interview validation yet"* — instead of dressing up thin evidence as conviction.
- Stamp the draft with its data snapshot date; stale sources carry the refresh recommendation into the PRD.
- A PRD is a proposal document, not data — it never feeds back into Evidence/Signals.
