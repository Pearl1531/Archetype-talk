# Notion & Confluence → Transcripts/ or Evidence/

Where most teams' research notes already live. Connect via the tool's official MCP server (Notion has one; Confluence via Atlassian's) — OAuth in the MCP client, read-only tools only.

## Classification — per page, never per import

A wiki page can be either side of the Signal/Evidence line, so classify each page with the user:

- **Session notes / interview writeups of OUR OWN research** → `Inbox/` as a transcript-like file → `/extract-findings`. (Notes are weaker than verbatim transcripts — mark `fidelity: notes` so quotes extracted from them are treated as paraphrase unless clearly marked verbatim in the source.)
- **Compiled reports, survey results, market analyses** (someone's synthesis, not a session record) → `Evidence/` (Content → Takeaways → Sources), `retrieved:` = today, source = the page's deep link (note plainly it's an internal link, not publicly verifiable — same labeled-exception rule as `analytics-sync`).
- **Existing persona/insight pages** → do NOT import as data. Offer them to the user as *context to compare against* — this graph rebuilds claims from sources, it doesn't inherit conclusions.

## Workflow

1. Verify connection with one harmless read (list/search).
2. Ask for a scope: a specific page, a database/space, or a search query. Never crawl a whole workspace.
3. Show the classification plan (page → target type → file name), get a yes.
4. Write with provenance: `source: notion|confluence`, page id, deep link.
5. Re-sync by page id: update in place, never duplicate; local edits the user flagged as kept stay kept.
