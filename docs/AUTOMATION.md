# What runs by itself

Short answer: **one shell script, at the start of an agent session, that prints
a few lines and sends nothing.** Nothing else in this repo runs on its own — no
background job, no scheduler, no watcher, no update check, no telemetry. The
browser app runs only while its tab is open and never starts a process.

This page exists because "a repo that runs a script when you open it" is a fair
thing for a security reviewer to ask about, and the answer should not require
reading the code.

## The one hook

`.claude/settings.json` registers a single `SessionStart` hook:

```json
{ "hooks": { "SessionStart": [ { "hooks": [
  { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-inbox.sh\"" }
] } ] } }
```

**What it reads** — only file names and a few frontmatter lines, all inside this
project folder:

- whether `.claude/onboarded.local` exists (first run or not),
- `Competitors/*.md` for a `needs_research: true` flag,
- how many `.md` files sit in `Inbox/`,
- whether any file in `Transcripts/` lacks `demo: true`.

**What it does with that** — prints at most a handful of lines to the agent, e.g.
"3 unprocessed files in Inbox/ → do NOT analyze automatically, ASK the user
first". They are instructions to the model, not actions.

**What it never does** — it opens no network connection, reads no transcript
content, sends nothing anywhere, writes no file, and starts no analysis. It is
~50 lines of `sh`; read it at [.claude/hooks/check-inbox.sh](../.claude/hooks/check-inbox.sh).

## Turning it off

Delete the `hooks` block from `.claude/settings.json` (or the file). Nothing
breaks: the hook only surfaces reminders you can also trigger by asking. For a
locked-down install, ship this instead:

```json
{}
```

The repo works identically without it — you simply won't be told about new Inbox
files or pending competitor research.

## What is *not* automatic, by design

These are deliberate: the agent must ask first, every time.

- Processing files dropped in `Inbox/` (`/extract-findings` is invoked by you).
- Desk research on a hand-added competitor.
- The founding-brief interview (`/cold-start`).
- Any write to a `.md` file, any external call, any git push.
- Promoting a hypothesis to an Idea — always a human click.

If an agent ever does one of these without asking, that is a bug worth
reporting ([SECURITY.md](../SECURITY.md)).
