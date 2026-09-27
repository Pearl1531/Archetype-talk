# Egress & subprocessors

> **Template for the deploying organisation.** Archetype Talk is MIT-licensed
> software, not a service. The author operates no server, receives no data, and
> is therefore neither a controller nor a processor of anything you put in this
> repo — there is no DPA to sign with the author, because nothing is transmitted
> to the author. The parties below are ones **you** connect and contract with.
> This page is a factual description of the software, not legal advice, and
> carries no warranty (see [LICENSE](../../LICENSE)).

## Who is who

| Role | Who | Note |
|---|---|---|
| Controller | Your organisation | You decide the purposes and means of the research. |
| Processor | Your model provider, and any source/voice tool you connect | Contract with each directly (DPA, retention, region). |
| Neither | The author of Archetype Talk | Ships code; no service, no endpoint, no data received. |

## What can leave the machine

Nothing in this table happens by itself. Each row lists what triggers it.

| # | Destination | What is sent | Trigger | Default |
|---|---|---|---|---|
| 1 | **Your model provider** (Claude or whichever you wire in) | The text the agent reads: transcripts, entity files, your prompts | Every skill run and chat turn — this is the tool's core function | On (it *is* the product) |
| 2 | **ElevenLabs** | One line of persona dialogue, anonymised at the boundary; never frontmatter, file metadata or the researcher-context block | You type `[speak]` in `/persona-talk` | Off — needs your own `ELEVENLABS_API_KEY`; no key, no call |
| 3 | **Google favicon service** | One competitor domain name | You click "Fetch favicon" **and** enabled it in Settings ▸ Privacy & network, then confirm the prompt | **Off** |
| 4 | **Whatever host a `picture:`/`photo:` points at** | An HTTP request revealing your IP and when you opened the file | Only if a file holds an `http(s)` image address **and** you enabled external images in Settings | **Off** — blocked images show initials |
| 5 | **Read-only source connectors** (Dovetail, Grain/Fireflies/Otter/tl;dv/Zoom, Notion, Confluence, Capacities, Maze, UserTesting, Lookback) | Whatever you choose to import, in the direction *inbound*; authentication happens in your MCP client, not in this repo | You run `/dovetail-sync` or `/source-sync` | Off — nothing configured out of the box |
| 6 | **Analytics tools** (Mixpanel, GA4, Amplitude) | Your query; results come back as Evidence files | You run `/analytics-sync` | Off |
| 7 | **The open web** (arbitrary hosts) | Your search terms and page fetches | You run `/researcher` or ask for desk research | Off |
| 8 | **Your git remote** (e.g. GitHub) | Every file you commit and push — including transcripts, if you version them | You push | Off — the rules say push only when explicitly asked |
| 9 | **Linear / Jira** | The ticket you approve, shown in full first | You run `/export` and confirm | Off |

Rows 3 and 4 are the only ones the **browser app** can trigger; both are
off-by-default switches under Settings ▸ Privacy & network. Everything else
requires an agent session and an explicit instruction from you.

## What the app does on open

Nothing outbound. `app/index.html` bundles its own CSS and JS, uses system fonts,
loads no CDN, sets no cookie, has no account and no telemetry. Avatars and
competitor icons are local files or inline images. This is enforced by a
`Content-Security-Policy` meta in the file itself (`default-src 'none'`, images
limited to `self`/`data:`/`blob:`, a single permitted connect host for row 3) —
verifiable in the first 20 lines of the file, no code reading required.

## What stays local

- Research files: plain Markdown in your folder.
- Secrets: `.env` (gitignored) or your own secret store — [docs/SECRETS.md](../SECRETS.md).
- Preferences (`.claude/preferences.local.md`): your display name and email, used
  to attribute votes and hypotheses; **gitignored**, and emails are masked
  (`m***@g***.com`) before being written into any entity file.
- Drafts, votes, exclusions and sandbox edits: your browser's local storage,
  namespaced per project copy — [docs/DATA-BOUNDARY.md](../DATA-BOUNDARY.md).

## Points to settle before an enterprise rollout

- A DPA with the row-1 provider, and a retention setting you have verified
  (zero-retention where offered).
- Processing region for row 1, if EU residency matters to you.
- Whether rows 2–9 are permitted at all in your install; each can simply stay off.
- Lawful basis and participant information covering AI-assisted processing —
  see the *Anonymization & GDPR* section of the [README](../../README.md#anonymization--gdpr--read-before-importing-real-interviews).
