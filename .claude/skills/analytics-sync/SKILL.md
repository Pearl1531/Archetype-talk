---
name: analytics-sync
description: Connect Mixpanel, GA4, or Amplitude read-only over MCP and turn query results into internal Evidence files. Use for product-usage numbers grounding persona claims or "what % of users…" questions.
---

# analytics-sync — Mixpanel / GA4 / Amplitude as read-only sources (MCP)

Connect Mixpanel, Google Analytics 4, and/or Amplitude over their official MCP servers to pull **real product-usage data** into the graph as `Evidence` — quantitative backup for a persona's `Product usage` claims (e.g. "62% of sessions include a skip within 5 seconds"). Same direction-of-truth principle as `dovetail-sync`: the analytics tool is a source, our graph is canonical.

## Core principle

```
Mixpanel / GA4 (source)  ──read-only──▶  our graph (canonical)
```

- Analytics results become `Evidence/` — never `Signals/`. A dashboard number is aggregate desk-research-like data, not a single observation from an interview we ran (see `researcher`'s Signal-vs-Evidence rule — same logic applies here).
- **Read-only, always.** Mixpanel's MCP exposes write tools (`Create-Dashboard`, `Edit-Event`, `Create-Experiment`, `Create-Feature-Flag`, etc.) — **never call these.** Google's official GA4 MCP server is read-only by design (per Google's own docs, "available for read requests only"), but don't assume that stays true forever — re-check before using any tool whose name suggests a write.
- Provenance always: `source: mixpanel` or `source: ga4`, `retrieved:` = today, and a `query_ref` describing the query (a private dashboard has no public URL — see the labeling rule below).

## When to use

- The user wants to ground a persona's usage claims in real product analytics, not just interviews.
- The user asks a specific quantitative question ("what % of users do X", "what's the drop-off at step Y") that Mixpanel/GA4 can answer directly.

## Trigger

```
/analytics-sync --setup              ← walk through connecting Mixpanel and/or GA4
/analytics-sync <question>           ← query a connected source and turn the result into Evidence
```

## Safety rules (read before doing anything)

1. **Never handle secrets in chat.** Don't ask the user to paste an API key, service-account JSON, or OAuth token into the conversation, and never write one into a file. OAuth (browser sign-in) is preferred for all sources. See `references/mixpanel-setup.md`, `references/ga4-setup.md`, and `references/amplitude-setup.md`.
2. **Read-only tools only** — see the explicit allow/deny lists in each reference file.
3. **Confirm before writing our files.** Show the query and the resulting numbers before creating/updating anything in `Evidence/`.
4. **No fabrication.** Report only what the query actually returned. If a metric doesn't exist or the query fails, say so — don't approximate.
5. **Don't restructure our data to match the analytics tool.** Map results into an `Evidence` file; if something doesn't fit cleanly, ask.

## Workflow

```
1. Ensure connection  → load the relevant reference file; verify with one harmless read call
                        (e.g. Mixpanel Get-Projects, or GA4 get_account_summaries).
2. Scope the question → ask what metric/question to pull. Don't dump the whole dataset —
                        one targeted query per Evidence entry (e.g. "search vs. browse split",
                        "skip rate in first 5s", "DAU/WAU for feature X").
3. Query              → use only the read tools listed in the reference file.
4. Draft Evidence     → `Evidence/_template.md`: `claim:` in one sentence, `source_kind: analytics`,
                        `population:` = the segment and date range queried, `primary_checked: true`
                        (you read the data itself); Key figures = one row per number; Content =
                        what was measured; Takeaways = what it implies; Does not settle = what
                        the metric cannot show (usually *why*); Sources = see the labeling rule
                        below (this is internal data, not a public link).
5. Confirm            → show the draft, get a yes, before writing.
6. Write + wire       → create the file; offer to link it under the relevant Persona's
                        `## Evidences` and/or `Product Context.md`.
```

## Labeling internal analytics — a deliberate, visible exception

This project's hard rule is "real, verifiable, publicly-linkable sources." Analytics data is real, but it's **not publicly verifiable** the way a community thread or an NHTSA report is — nobody outside the org can click through and check it. Don't let that ambiguity hide:

- Tag it `source: mixpanel` / `source: ga4` in frontmatter.
- In the `## Sources` section, write plainly: `Internal Mixpanel query — not a public link, not independently verifiable outside the org.` (or GA4 equivalent).
- This is a **labeled exception**, not a loophole — readers of the file should immediately see this is first-party internal data, different in kind from the rest of the graph's public citations.

## What this skill never does

- Never writes to Mixpanel or GA4 (no dashboards, events, experiments, or feature flags created/edited).
- Never commits API keys, service-account JSON, or OAuth tokens to the repo or chat.
- Never files a query result as a `Signal`.
- Never overwrites a hand-written Evidence file without showing a diff and confirming.
