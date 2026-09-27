---
name: journey-map
description: Build a journey map for a persona from her Product usage moments and linked Pains/Signals. Use when the user runs /journey-map, asks for a customer/user journey, or a designer wants pain points mapped to moments of use.
---

# journey-map — Journey map from the graph

Generate a journey map where **every pain point is a citation, not an opinion**. The stages come from the persona's actual `Product usage` moments; the pains at each stage come from her linked Signals/Evidence — clickable back to source.

## Trigger

```
/journey-map Personas/Emma.md
/journey-map Personas/Emma.md --scenario "commute"   ← one scenario, deeper
```

## Workflow

1. Read the persona + her linked Signals/Evidence (+ `Product Context.md` for feature names the map may reference descriptively).
2. **Derive stages from data:** the "When she listens / uses" moments in `Product usage` (e.g. morning commute → workday background → gym) — never a generic Awareness→Retention template. If the data only supports two stages, the map has two stages.
3. For each stage fill:
   - **Doing** — observed behaviour (Product usage, Signals)
   - **Thinking/feeling** — only from quotes and Signal observations; no invented inner monologue
   - **Pain points** — each one linked to its Signal/Evidence file, with its Level (analyst artefact — codes allowed) and a staleness note where the 3-month rule applies
   - **Opportunities** — only from existing `## Correlations` `→ Opportunity:` lines and `Ideas/` files, named and linked
4. **Gaps stay visible:** a stage with no researched pain gets an explicit "no data — not researched" cell, not a plausible guess. Offer to add those gaps to `Research backlog.md`.
5. Output as a markdown table (default) — offer to save as `Research/Journey <Persona> <YYYY-MM-DD>.md`, and optionally a Mermaid `journey` diagram for quick pasting into docs.

## Rules

- Nothing enters the map that isn't in the graph — a journey map is a *view* of the data, not new synthesis. New hypotheses it provokes go to the backlog.
- Emotions shown must trace to a quote or observation ("laughs at her own chaos" — INT-01 observer note), never inferred from stage logic ("users feel frustrated at checkout").
- Keep the map per-persona. A cross-persona map is really a comparison — point to `/persona-talk --panel` findings or build one map per persona side by side.
