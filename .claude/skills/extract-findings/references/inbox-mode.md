# Inbox mode — processing what the hook flagged

Load when the user runs `/extract-findings --inbox`, or when `INBOX_NEW: N …`
appears in context. Not needed when the user hands you a transcript directly.

The SessionStart hook (`.claude/hooks/check-inbox.sh`) cheaply counts unprocessed
files in `Inbox/`. It only counts — it never reads or analyses them.

1. **Ask first — never auto-process.** Confirm with the user before analysing.
2. **Warn if it's a lot.** If N is large (the hook warns above 5), say it may take
   a while and use noticeable tokens; offer to do a subset first.
3. Process each accepted file with the main workflow.
4. **Move the processed original into `Transcripts/`** — it is now a source the
   Signals link back to — **and write its scan header** (schema:
   `Transcripts/_template.md`):
   - `abstract:` — 3–4 sentences covering *every* major theme
   - `topics:` — kebab-case tags
   - `mentions_competitors:` — **exhaustive**; `[]` means checked, none found

   This header is what future sessions read instead of the full transcript during
   triage. Honest and theme-complete, or it poisons every later search: a missing
   topic tag reads as "not in this transcript" to everyone downstream.
5. Leave `Inbox/` empty of processed items, and report what was created and moved.
6. Rebuild the routing index afterwards — new entities are invisible to it until
   then: `python3 scripts/graph_index.py build`

Dovetail interviews are pulled on demand via `/dovetail-sync`, not auto-scanned.

Transcripts are **input** the user supplies (a file, a paste, or a link). The
transcript becomes a repo entity when it lands in `Transcripts/`; the Signals and
Evidence extracted from it are the actual outputs.
