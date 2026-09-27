# Maze, UserTesting, Lookback → Signals/ + Evidence/

Usability platforms hold both sides of the Signal/Evidence line at once, so the split matters more here than anywhere:

- **Individual session artifacts** — one participant's recording transcript, task walkthrough, open-text answer, observed struggle → these are OUR OWN research observations. Import the session record to `Inbox/`/`Transcripts/` and run `/extract-findings`, which creates the `Signals/` (one observation per file, verbatim quote, date, transcript link). Test observations get the Observation variant of the Signal template (behaviour instead of quote) when there's no usable verbatim line.
- **Aggregated metrics** — task success rate, misclick rate, average time-on-task, SUS scores across N participants → aggregate numbers, not single observations. These become `Evidence/` (internal-data labeling rule applies: not publicly verifiable, say so in Sources), and Signals from the same study list them in `evidences:` — which is exactly how a Signal reaches `validated` (L4).

## Workflow

1. Connect via the platform's official MCP/API — read-only, OAuth preferred, secrets never in chat.
2. List studies; user picks one. Never bulk-import all studies.
3. Show the plan: which sessions → Inbox (→ Signals via extraction), which metrics → Evidence. Confirm.
4. Provenance on every file: `source: maze|usertesting|lookback`, study + session ids, deep links.
5. Pseudonymize participants on the way in (P-xx codes) — platform profile names never enter the repo.
6. After import, run the usual wiring: Signals ↔ Evidence ↔ Persona, then suggest `/graph-lint`.

## Notes

- A platform's auto-generated "insights" are the tool's synthesis, not data — treat like wiki insight pages: offer as context to compare against, don't import as Evidence unless the user explicitly wants them (then label the file as tool-generated synthesis).
- Prototype tests map cleanly to candidate features in `Product Context.md` — after import, offer to update the relevant feature's row with the study's headline numbers (cited).
