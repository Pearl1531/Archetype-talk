---
name: graph-lint
description: Health check for the graph: dead links, incomplete Signals, orphans, stale data — proposes fixes, never rewires links without approval. Use on /graph-lint or after large edit batches/imports.
---

# graph-lint — Graph health check

Run the mechanical linter, interpret its findings, and propose fixes. This skill **reports and proposes — the researcher owns the graph.**

## Trigger

```
/graph-lint            ← full report
/graph-lint --fix      ← report, then walk through proposed fixes (with approval)
```

Also worth suggesting (not auto-running) after a big import (`/dovetail-sync`, `/source-sync`, `/extract-findings --all`).

## Workflow

1. Run `python3 scripts/graph_lint.py` and show the output grouped as the script prints it (ERRORS / WARNINGS / INFO).
2. Interpret briefly — e.g. orphan Signals may simply belong to a persona not yet written (offer `/persona-workshop`), stale INFO items are candidates for a refresh round (`/researcher` for Evidence, real interviews for Signals).
3. If `--fix` (or the user asks): propose fixes per the approval rules below.

## Approval rules — the researcher stays in control

Hand-written links are the researcher's material. The AI never silently rewires the graph:

- **Trivial mechanical fixes** — a link whose intended target is obvious but the path is broken (missing URL-encoding, a typo'd filename, a file that was renamed and every other reference already points to the new name): batch them into ONE list, show old → new for each, apply only after a single explicit yes.
- **Meaning-changing fixes** — adding a link that didn't exist (e.g. wiring an orphan Signal to a Persona), removing a link, changing which entity something points to, or editing `evidences:` lists: propose **each one individually** with a one-line justification citing the content that supports it. These change what the graph claims, so they are individually approved, never batched.
- **Never "fix" a contradiction** — conflicting Signals are data. If lint output or content review surfaces a semantic conflict, point to `/contradictions` instead of editing anything.
- If the user declines a fix, leave it and don't re-propose it every run — note it as "known, accepted by researcher" in the summary.

## What this skill never does

- Never edits files during the report phase.
- Never deletes a Signal/Evidence file (even an orphan) — worst case it proposes archiving, user decides.
- Never touches `Transcripts/` content.
