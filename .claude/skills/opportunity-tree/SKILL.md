---
name: opportunity-tree
description: Render a Teresa Torres Opportunity Solution Tree from the graph — outcome at the root, opportunities, Ideas as solutions, backlog questions as experiments. Use on /opportunity-tree or for an OST / strategic view.
---

# opportunity-tree — OST from Correlations

The graph already contains an Opportunity Solution Tree in pieces: every persona's `## Correlations` ends in `→ Opportunity:`, every `Ideas/` file is a candidate solution, and `Research backlog.md` holds the open assumptions. This skill assembles them into the view PMs know from Teresa Torres — **without inventing a single node.**

## Trigger

```
/opportunity-tree                       ← whole graph
/opportunity-tree Personas/Emma.md      ← one persona's slice
/opportunity-tree --outcome "<metric>"  ← name the root outcome explicitly
```

## Mapping (strict — every node traces to a file)

- **Outcome (root)** — the product outcome; ask the user if not given (suggest candidates from `Product Context.md` / Ideas' `Metric to watch` fields). One root; a second outcome is a second tree.
- **Opportunities (branches)** — the `→ Opportunity:` lines from `## Correlations`, each annotated with its persona and its supporting Signals/Evidence (that's L5-grade material by construction). Pains with no correlation yet can appear as **thinner branches**, marked "pain, not yet correlated (L3/L4)".
- **Solutions (leaves)** — `Ideas/` files under the opportunity they address; unscored ideas show `RICE: TBD` (from the `## PM scoring` block when present).
- **Experiments / assumptions** — matching open rows from `Research backlog.md` under the solution or opportunity they'd de-risk.

## Output

Mermaid diagram (default — pasteable into most docs) plus an indented-list fallback; offer to save as `PRDs/Opportunity tree <YYYY-MM-DD>.md`. Every node label carries its source in parentheses, short form.

## Reading the tree honestly

- **A bare branch is a finding, not a failure** — an opportunity with no solutions means ideation hasn't happened; a solution with no experiments means it's about to be built on hope. Point both out.
- **An orphan Idea** (no opportunity above it) is roadmap-by-momentum — flag it and ask whether a Correlation is missing (needs synthesis: `ai-persona` Level 4) or the idea lacks grounding (needs research).
- The tree is a *view*: it never edits Correlations, Ideas, or the backlog. Gaps it exposes become backlog rows only with the user's yes.
