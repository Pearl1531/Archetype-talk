---
name: source-sync
description: Connect read-only research sources beyond Dovetail — voice memos (Grain, Fireflies, Otter, tl;dv, Zoom), Notion, Confluence, Capacities, Maze, UserTesting, Lookback. Use when importing research from a tool without a dedicated skill.
---

# source-sync — Generic read-only research source connector

One pattern, many sources. `dovetail-sync` proved the shape: **external tool = read-only source, our graph = canonical.** This skill applies the same shape to everything else, so adding a new source means writing one mapping reference, not a new skill.

```
External tool (source)  ──read-only──▶  our graph (canonical)
```

## Trigger

```
/source-sync                    ← list supported sources, ask which to connect
/source-sync <source>           ← e.g. /source-sync grain, /source-sync notion
/source-sync --setup <source>   ← connection walkthrough only
```

## Supported source families (one reference each — load only the relevant one)

| Family | Tools | Maps to | Reference |
|--------|-------|---------|-----------|
| **Voice memos & call recordings** | Grain, Fireflies, Otter, tl;dv, Zoom; raw voice memo files | `Inbox/` → `Transcripts/` | [references/voice-memos.md](references/voice-memos.md) |
| **Docs & wikis** | Notion, Confluence | `Transcripts/` or `Evidence/` (per item) | [references/docs-wikis.md](references/docs-wikis.md) |
| **PKM apps** | Capacities (Markdown export or API) | `Inbox/` → `Transcripts/` or `Evidence/` | [references/capacities.md](references/capacities.md) |
| **Usability testing** | Maze, UserTesting, Lookback | `Signals/` + `Evidence/` | [references/usability-tools.md](references/usability-tools.md) |

Analytics tools (Mixpanel, GA4, Amplitude) have their own skill — `/analytics-sync`. Dovetail keeps its dedicated skill — `/dovetail-sync`.

## Universal rules (inherited from dovetail-sync — apply to every source)

1. **Never handle secrets in chat.** Prefer OAuth/browser sign-in via the tool's official MCP server; tokens live in the MCP client's own config, never in files or chat. MCP servers and their auth flows drift — check the tool's live docs at setup time instead of assuming.
2. **Read-only.** Only `search_*` / `get_*` / `list_*`-shaped tools. Never call anything that writes to the source.
3. **Confirm before writing our files.** Show a mapping plan (source item → target file → type), get a yes.
4. **No fabrication.** Import only what the source returns; thin items import thin.
5. **Provenance always:** `source: <tool>`, a stable source id, and a deep link where one exists — so items are traceable and re-syncable (match by id on re-sync, update in place, never duplicate).
6. **The Signal/Evidence line holds:** an observation from OUR OWN session (whatever tool recorded it) → `Transcripts/` then `/extract-findings` → Signals. Someone else's published/aggregated data → `Evidence/`. When ambiguous, ask — never guess an item into Signal status.
7. **Our schema is canonical.** Map into our types; if something doesn't fit, ask — don't bend the folder structure to mirror the tool.
