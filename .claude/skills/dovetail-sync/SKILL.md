---
name: dovetail-sync
description: Connect a Dovetail workspace over its official MCP as a read-only research source and map interviews/highlights/insights into Transcripts/Signals/Evidence with provenance. Use when the user mentions Dovetail or wants to sync/refresh research from it.
---

# dovetail-sync — Connect Dovetail as a research source (MCP)

Safely connect this project to a Dovetail workspace over the official Dovetail MCP server, then pull research **into our schema** (Transcripts / Signals / Evidence) with full provenance. Dovetail is a **read-only source of knowledge** — it never dictates or changes our folder structure.

## Core principle — direction of truth

```
Dovetail (source)  ──read-only──▶  our graph (canonical)
```

- **Our schema is canonical.** Dovetail data is mapped INTO `Transcripts/`, `Signals/`, `Evidence/` — never the other way around.
- **Read-only.** Use only Dovetail's `search_*` / `get_*` / `list_*` tools. Never call create/update tools; never write anything back to Dovetail.
- **Provenance always.** Every imported file records where it came from (`source: dovetail`, `dovetail_id`, `dovetail_url`) so it's traceable and re-syncable.
- **Grounding rules still apply.** Imported Signals keep verbatim quotes + real dates; Evidence gets a `retrieved:` date; the 3-month freshness rule holds (see `ai-persona/references/levels.md`).

## When to use

- The user wants to connect Dovetail, or refresh data from it.
- The user has interviews/highlights/insights in Dovetail and wants them as Signals/Evidence here.

## Trigger

```
/dovetail-sync            ← full flow: ensure connection → discover → map → confirm → write
/dovetail-sync --setup    ← only walk through the safe connection setup
/dovetail-sync <project>  ← sync a specific Dovetail project
```

## Safety rules (read before doing anything)

1. **Never handle secrets in chat.** Do NOT ask the user to paste an API token into the conversation, and never type one into a file. Prefer **OAuth / first-party login** (browser). If a token is unavoidable, the user configures it in their MCP client's own secret store / env — see [setup.md](references/setup.md). Tokens must never be committed to the repo.
2. **Read-only tools only.** If a Dovetail write/create tool is available, do not use it.
3. **Confirm before writing our files.** Show the user a plan (what will become which file) and get a yes before creating/updating anything in `Transcripts/`, `Signals/`, `Evidence/`.
4. **No fabrication.** Import only what Dovetail actually returns. Never invent quotes, numbers, dates, or participants. If a Dovetail item is thin, import it thin.
5. **Don't restructure our data to match Dovetail.** Map into our types; if something doesn't fit, ask — don't bend the schema.

## Workflow

```
1. Ensure connection  → load references/setup.md; verify with one read call
                        (e.g. get_dovetail_projects / search_workspace).
2. Discover           → list projects; with the user, pick the project(s) to sync.
3. Map                → load references/mapping.md; classify each Dovetail item:
                        Data entry → Transcripts/ ; Highlight → Signals/ ;
                        Insight → Evidence/ (or a Correlation candidate).
4. Plan               → show a table: Dovetail item → target file → type. Confirm.
5. Write              → create/update files with provenance frontmatter and
                        verbatim quotes; URL-encode links; add retrieved:/dates.
6. Wire               → link Signals to their Transcript + evidences:; surface new
                        Evidence to the relevant Persona; keep the graph consistent.
7. Freshness + gaps   → flag items older than 3 months (🕒); anything Dovetail
                        can't answer becomes a question in Research backlog.md.
```

## What this skill never does

- Never writes to Dovetail or changes Dovetail content.
- Never commits API tokens or puts secrets in the repo.
- Never overwrites a hand-written file without showing a diff and confirming.
- Never turns a synthetic persona chat into a Dovetail record (that pipeline is one-way: Dovetail → us).

## Re-sync

Files carry `dovetail_id`. On the next sync, match by that id: update the mapped file in place (content/quote/date), but keep our structure and any local edits the user flagged as kept. Never duplicate.
