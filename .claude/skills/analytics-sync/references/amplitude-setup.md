# Amplitude — read-only connection

Same shape as Mixpanel/GA4: Amplitude is a **source**, our graph is canonical, results become clearly-labelled internal `Evidence/`.

## Connect

- Prefer Amplitude's official MCP server; check Amplitude's live docs for its current name and auth flow at setup time — MCP surfaces drift, don't assume.
- Auth lives in the MCP client's own config (OAuth or API key entered there) — never pasted into chat, never written into a repo file.
- Verify with one harmless read call (e.g. listing projects/charts) before doing anything else.

## Allow / deny

- **Use:** query/read tools — chart data, event segmentation reads, funnel/retention results, user counts.
- **Never call:** anything that creates or edits — charts, dashboards, cohorts, experiments, tracking plan entries, or user data (including deletions). If a tool name suggests a write, don't use it.

## Mapping

One targeted query per Evidence entry (same rule as Mixpanel/GA4):
- frontmatter: `source: amplitude`, `retrieved:` = today, `query_ref:` describing the query (project, event(s), segment, date range)
- `## Sources`: `Internal Amplitude query — not a public link, not independently verifiable outside the org.`
- Confirm the draft with the user before writing the file; then offer to wire it under the relevant Persona's `## Evidences`.
