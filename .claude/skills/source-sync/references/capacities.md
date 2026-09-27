# Capacities → the graph (and back)

[Capacities](https://capacities.io) is an object-based PKM — users keep research notes as typed objects in Spaces. Two directions, different reliability:

## Inbound — the dependable path: Markdown export

Capacities exports a whole Space as Markdown (in-app: Settings → Space → export). That's the format this repo already speaks, so no API needed:

1. User drops the exported .md files (or the folder) into `Inbox/` — or just points at the export folder.
2. Classify **per file**, same rules as `docs-wikis.md`:
   - **Session notes / interview writeups of OUR OWN research** → `Inbox/` → `/extract-findings` (mark `fidelity: notes` unless quotes are clearly verbatim).
   - **Compiled reports / syntheses** → `Evidence/` (Content → Takeaways → Sources), `retrieved:` = today, `source: capacities` + the object's deep link (a `capacities://` link is internal — say plainly it's not publicly verifiable, same labeled-exception rule as analytics data).
   - **Capacities' own persona/insight-like objects** → context to compare against, never imported as data — this graph rebuilds claims from sources.
3. Capacities objects carry properties (frontmatter-ish) in exports — preserve useful ones (dates, tags) in the target file's frontmatter; drop app-internal IDs into `capacities_id:` for re-sync matching (update in place on re-import, never duplicate).

## Inbound — the API (check live docs before relying on it)

Capacities has a REST API (api.capacities.io, token from the app, paid tiers) — historically **beta and narrow**: space info, search, and save-to-Capacities endpoints rather than full content reads. Verify the current surface at capacities.io/developer before promising anything; if full object reads aren't available, say so and use the export path above. Read-only rules apply as everywhere: never call endpoints that write into the user's Space unless the user explicitly asks for outbound delivery.

## Outbound — the graph into Capacities

The browser app (`app/index.html`) has **Export .md** — one click downloads every loaded entity as a zip of Markdown files, structure preserved. That zip imports cleanly into Capacities (or anything else that eats Markdown), which covers "share the graph without GitHub". For a persona one-pager instead of raw files, use `/export`.

## Rules

- Same direction-of-truth as every source: Capacities feeds the graph; the graph never reshapes itself to mirror Capacities' object model.
- The Signal/Evidence line holds: a Capacities note about OUR interview is a transcript-ish input (→ extraction), a Capacities note synthesizing desk research is Evidence, and a Capacities "insight" is somebody's conclusion — context, not data.
