---
name: prioritize
description: Score and rank Ideas/ with RICE grounded in the graph. Use when the user runs /prioritize, asks which idea to build first, or wants a scored roadmap input.
---

# prioritize — Grounded RICE over Ideas/

Standard RICE with one twist that this repo makes possible: **the numbers have to say where they came from.** Reach cites Evidence, Confidence is *derived* from claim Levels (not gut-picked), and anything unknowable from research is marked TBD instead of invented.

## Trigger

```
/prioritize                 ← score every file in Ideas/ (Hypotheses/ are NEVER scored — no grounding, no RICE; promote to an Idea first)
/prioritize Ideas/<file>    ← score/rescore one idea
```

## Scoring rules (per idea)

- **Reach** — who/how many, cited from a linked `Evidence/` file ("22.2% of subscribers share accounts [Shared accounts]"). No Evidence with a number → `estimate, no data` and a note that `/researcher` or `/analytics-sync` could firm it up. Never invent a percentage.
- **Impact** (0.25–3) — how directly it addresses the linked Pain; one line of reasoning tied to the Signal.
- **Confidence** — **derived, never hand-picked**, from the strongest claim Level among the idea's linked sources (canonical scale: `ai-persona/references/levels.md`):
  - L4–L5 → High (1.0) · L3 → Medium (0.8) · L2 → Low (0.5) · L1/none → Very low (0.2)
  - Stale sources (3-month rule) knock Confidence down one band — say so in the row.
- **Effort** — the one input research can't provide. Ask the user/team for sizing; until given, `TBD` (and the RICE score stays `TBD` — an unranked idea is honest, a fake-ranked one isn't).
- **Metric to watch** — the product metric this idea should move, phrased so `/analytics-sync` could actually query it.

## Workflow

1. Read every idea in scope + its linked Evidence/Signals (+ the persona sections that reference it).
2. Compute the scoring block per idea; show the full table sorted by RICE (TBD-effort rows listed separately, not silently ranked last).
3. On approval, write/update each idea's `## PM scoring` section (the `Ideas/_template.md` block) — the file is the source of truth, the table is a view.
4. Flag ideas whose Confidence is Very low/Low as **research-first, not build-first** — route to `/interview-guide` (that's the cheaper way to raise Confidence than shipping blind).
5. Offer follow-ups: `/feature-panel` for a who-benefits view of the top idea, `/export ticket` for the winner, `/opportunity-tree` for the strategic view.

## Rules

- Confidence derivation is mechanical — if the user wants to override it, record the override explicitly ("Confidence raised by PM judgment, data says L3") rather than silently editing.
- Rescoring after new research is expected and cheap — new Signals/Evidence change Levels, Levels change Confidence; say what moved and why.
- This skill edits only `Ideas/` scoring blocks — never the underlying Evidence/Signals.
