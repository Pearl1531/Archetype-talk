---
name: export
description: Outbound deliverables: persona one-pagers (pdf/pptx/docx), Idea files as Linear/Jira tickets, stakeholder share packs. Use on /export or when something must be handed to PMs/stakeholders.
---

# export — Deliverables out of the graph

Everything else in this repo pulls data IN. This skill is the outbound direction: turn graph entities into artefacts other people consume — without ever weakening the grounding on the way out.

## Trigger

```
/export one-pager Personas/Emma.md          ← persona one-pager (ask: pdf / pptx / docx)
/export ticket Ideas/<file>.md              ← Idea → Linear/Jira ticket (via MCP)
/export pack Personas/Emma.md               ← share pack: one-pager + top ideas + open questions
```

## One-pager (for design crits, kickoffs, stakeholder walls)

Build from the persona file + linked sources; render via the pdf/pptx/docx skills. One page, in this order:

1. Name, one-line description, the **bio quote**
2. **Top 3 Pains** — each with its source named ("Interview INT-01, Jun 2025 + Spotify Community") and grounding in plain words, not codes
3. **Jobs to be Done** (top 2–3)
4. **"Won't fake agreement on"** — the guardrails section; this is the differentiator, keep it
5. Footer: data freshness ("research from Jun 2025 — refresh recommended" when the 3-month rule applies), `demo: true` → a visible "EXAMPLE DATA" stamp, and "every claim traceable in the repo"

Never pad a sparse persona to make the page look full — an L2-heavy persona ships with visibly fewer, honestly-labeled claims.

## Ticket (Ideas → Linear/Jira)

1. Read the Idea file + its linked Evidence/Signal.
2. Compose: title from the Idea name; body = **When / I want / So that** verbatim, then a **Why (evidence)** section citing each linked source by name with a one-line summary (public links included where the Evidence has them), then **Open questions** — matching rows from `Research backlog.md`, so engineering sees what's still unvalidated.
3. Use the Linear/Jira MCP connection if configured; otherwise output ready-to-paste markdown and say which MCP connector would automate it.
4. **Creating a ticket is an external, visible action — always show the full ticket and get an explicit yes before creating.** Never bulk-create.
5. After creating, offer to note the ticket URL in the Idea file (traceability both ways).

## Share pack

One folder (`Export/<Persona> <YYYY-MM-DD>/`): the one-pager, the persona's Ideas as one summary doc, and the open backlog questions for that persona — the honest "what we still don't know" page stakeholders never usually get. Offer to zip it.

## Rules

- Exports are **snapshots** — stamp every artefact with the date and, where stale data is involved, the refresh recommendation. Never present old research as current.
- No new claims at export time: if it isn't in the graph, it isn't in the deliverable.
- Anonymization rule (same as `persona-voice`): no real participant PII ever leaves the repo in an export.
