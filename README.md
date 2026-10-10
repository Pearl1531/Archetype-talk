# Archetype Talk — synthetic personas that refuse to make things up

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An agent toolkit — Claude Code, Codex, Cursor, Copilot, Gemini CLI — for turning raw customer research into **Intention-Based Personas** you can browse and talk to — organised as a linked knowledge graph where **every claim traces to a real source**, and where a persona would rather say *"I don't know"* than invent an answer.

> ### What ships inside
>
> The repo arrives with **one illustrative dataset: the Spotify demo** — every file of it flagged `demo: true`, so your AI assistant treats it as an example and never as your research. `Product Context.md` and `Research backlog.md` are blank templates waiting for your project; the demo keeps its own frozen copies in [docs/demo-workspace/](docs/demo-workspace/).
>
> | | What it is | How it is marked |
> |---|---|---|
> | **Demo** (Spotify) | Illustrative examples, safe to delete | `demo: true` in frontmatter |
> | **Yours** | Nothing yet | you create it |
>
> **To start your own project**, point the app at a different folder: *Projects → New project* picks an empty one and scaffolds it. Or work in this folder and drop the demo when you're done with it (`/demo-data`).

**Try it in 2 minutes:** open the project in your agent and run `/persona-talk Personas/Emma.md` (`$persona-talk` in Codex — [every agent](#works-with-claude-code-codex-cursor-copilot--gemini-cli)) — a ready demo persona, no setup needed (guided walkthrough in [DEMO.md](DEMO.md)).

## Not the "synthetic users" you've been warned about

The UX community's criticism of AI-generated users is largely right: models happily fabricate opinions, agree with whatever you suggest, and launder guesses into "insights". This repo is built as a direct answer to that failure mode — the guardrails aren't a feature, they're the point:

- **A persona conversation never creates data.** Its only output is *questions for real research*, collected in [Research backlog.md](Research%20backlog.md). A `Signal` is created only after talking to a real user (`/extract-findings`).
- **Personas push back.** Leading questions ("you'd pay for this, right?") get grounded disagreement when the data says otherwise, and false premises get called out, not played along with.
- **Everything is graded** on the Level scale (below) and the 3-month freshness rule — a persona built on one interview *tells you* it's built on one interview.
- **"I don't know" is a designed answer.** Gaps are flagged as Known unknowns and routed to the backlog, never papered over.

Synthetic conversation is a *rehearsal space* for your evidence — a way to interrogate what you already know. The real interview stays the source of truth, and the tooling keeps pointing you back to it.

## The graph

```
Evidence  →  Signal  →  ( Persona ↔ Archetype )  →  Idea
```

| Folder | Type | What it holds |
|--------|------|---------------|
| `Evidence/` | `Evidence` | Hard data — big data, surveys, reports. Sections: *Content → Takeaways → Sources*. |
| `Signals/` | `Signal` | A single observation from a test/interview that flags a problem — a verbatim quote, or (for field/hardware sessions) an observed behaviour. Links up to Evidence via `evidences:`. |
| `Archetypes/` | `Archetype` | A behaviour pattern — a *type*, not a person. Includes topic-tagged *Questions by context*, gated at conversation time. |
| `Personas/` | `Persona` | The embodiment: JTBD, Pains, Gains, Quotes, Evidences, Ideas, Correlations — every section links out to the files above. |
| `Hypotheses/` | `Hypothesis` | A bet, not a solution: *If / By / Will / Because*, **zero evidence by definition** (always L1). Usually distilled by the AI from discussions (saved only with your approval). Gains a Signal or Evidence → promote it to an Idea (the app has a button). |
| `Ideas/` | `IdeaForImprovement` | An improvement idea in *When / I want / So that* form, linking its Evidence + Signal — a hypothesis that earned its grounding. |
| `Competitors/` | `Competitor` | **Opt-in** market context — never loaded into persona talks by default. |
| `Transcripts/` | raw input | Interview/test transcripts with anchors — the raw source Signals link back to. |

Each folder has a `_template.md` describing its schema. `Participants.md` tracks (pseudonymized) sample coverage — which archetypes rest on several voices and which on one.

## Levels — one scale for maturity and for claims

A persona deepens through **five levels**, and the same ladder weighs every single claim in conversation (canonical definition: [levels.md](.claude/skills/ai-persona/references/levels.md)):

| Level | Persona maturity | A single claim at this level |
|-------|------------------|------------------------------|
| **L1** | Archetype (assumption) | persona won't speak on it — "I don't know" |
| **L2** | Desk Research → `Evidence/` | spoken generally, flagged "not confirmed in interviews" |
| **L3** | Interviews/Tests → `Signals/` | from experience — "single source, treat with care" |
| **L4** | Correlation (`validated`) | full strength |
| **L5** | Primary + `Ideas/` | strongest — may carry product recommendations |

Plus the **3-month freshness rule**: data older than 3 months gets flagged in plain language with a recommendation to run a refresh round.

## Grounding mechanics worth knowing

- **The researcher-context block is tiered** — a one-line "Quick note" by default, escalating to a full 5-part debrief only for decision-worthy L4/L5 claims, contradictions, or feature evaluations.
- **Archetype content is topic-gated** — a fact tagged `[Driving]` never leaks into a reply about `[Playlist editing]`.
- **Competitor context is opt-in** (`--competitors` / `[competitors on]`), with a first-hand/second-hand rule.
- **Contradictions are data** — two conflicting Signals stay two files; `/contradictions` shows you where the graph argues with itself.

## Skills

> Machine-readable one-table version, for agents without slash-commands:
> [.claude/skills/INDEX.md](.claude/skills/INDEX.md) — regenerate with
> `python3 scripts/graph_index.py skills` after adding or re-describing a skill.

**Talk & query**
- `persona-talk` — embodies a persona, grounded in its linked Signals/Evidence; supports **panel mode** (multiple personas, focus-group style) and **mockup reactions** (show it an image, it reacts through its pains)
- `persona-query` — "would they…?" with most-likely / least-likely / edge-case scenarios and a confidence Level
- `persona-voice` — ElevenLabs voice per persona per language, so replies can be heard (`[speak]`); needs your own API key; anonymizes text before it leaves the repo
- `persona-avatar` — a Notion-style face matched to the persona's character, via DiceBear's CC0 "Notionists" style (no license risk, deterministic URLs, local SVG copies in `Personas/avatars/`)

**Build the graph**
- `persona-workshop` — builds a persona from scratch, one question at a time
- `ai-persona` — creates and levels up personas across the graph
- `extract-findings` — transcripts → `Evidence/` + `Signals/`, with a PII scrub before anything is stored
- `catalog` — sorts what is already there: themes for signals, topic folders for evidence, missing quote translations, the evidence fields the AI reads first; never touches what a human curated

**Connect sources (all read-only, all with provenance)**
- `dovetail-sync` — Dovetail workspace over its official MCP
- `source-sync` — **voice memos & call recordings** (Grain, Fireflies, Otter, tl;dv, Zoom), Notion/Confluence, **Capacities** (Markdown export in, zip export back out), usability tools (Maze, UserTesting, Lookback)
- `analytics-sync` — Mixpanel / GA4 / Amplitude, filed as clearly-labelled internal Evidence
- `researcher` — desk research on the open web, cited into `Evidence/` (never `Signal` — that line protects the Level scale)

**Participant data lifecycle** (all optional — a repo that ignores them works exactly as before)
- `forget-participant` — erasure or de-identification for one person: traces every file that leads back to them, keeps the *finding* while dropping the *person* by default, **re-grades the claims that lose their source**, and names what it can't reach (git history, the source tool, your model provider)
- `subject-access` — "what do you hold about me?" as a readable bundle, including the conclusions drawn, not just the transcript
- `retention` — when the storage clock runs out, de-identification comes first; destroying the linking key makes the data anonymous and **stops the clock**, so research survives compliance

**Keep it healthy & close the loop**
- `graph-lint` — dead links, incomplete Signals, orphans, stale data; proposes fixes, **never rewires links without your approval**
- `contradictions` — where the data disagrees with itself
- `backlog` — research-question hygiene for `Research backlog.md`
- `interview-guide` — turns backlog gaps and thin claims into a discussion guide for **real** interviews

**PM toolkit**
- `feature-panel` — one feature × all personas: who benefits, who's indifferent, who it hurts — every cell cited
- `prioritize` — RICE over `Ideas/`, with Reach cited from Evidence and Confidence *derived* from claim Levels, never gut-picked
- `prd` — a PRD draft whose "Why" section is 100% cited and whose open questions come from the backlog
- `opportunity-tree` — an Opportunity Solution Tree assembled from Correlations, Ideas, and backlog rows — no invented nodes

**Deliver outward**
- `journey-map` — a journey map where every pain point is a citation
- `export` — persona one-pagers (pdf/pptx/docx), Ideas as Linear/Jira tickets, stakeholder share packs

**Housekeeping**
- `demo-data` — keep, separate (into `Demo/`), or delete the example dataset; asked once after your first demo session

## Getting started

1. **Use this repo as a GitHub template** (or clone it) — the repo *is* the workspace. It arrives holding only the Spotify demo, so you can either work here and drop the demo later, or scaffold a separate folder for your project (*Projects → New project*).
   > **Keep your copy private once real interviews go in.** Transcripts, Signals and quotes are versioned by default — on a public repo they are public. See [docs/DATA-BOUNDARY.md](docs/DATA-BOUNDARY.md).
2. Open it in your agent — in Claude Code, the first run greets you and walks you through setup (the `welcome` skill).
3. Drop transcripts into `Inbox/` (a SessionStart hook flags them and asks before analyzing), connect a source (`/dovetail-sync`, `/source-sync`), or start from zero: `/cold-start` when there's no data at all yet (a founding-brief interview — the founder's beliefs become L1 assumptions to test, never findings), `/persona-workshop` to sketch a first archetype.

The Spotify example set (4 personas, 8 archetypes, 17 evidence files, 24 signals, 7 transcripts, 4 competitors, 3 hypotheses, 3 ideas) shows the graph fully wired — every claim traceable to a public source. Every example file carries `demo: true` in frontmatter (a **Demo** badge in the app, flagged by `persona-talk`); keep it as a reference, separate it under `Demo/`, or delete it when you add your own data (`/demo-data` — asked once, automatically, after your first demo conversation). During a demo conversation the researcher also drops `💡 Try asking:` tips so you can see the guardrails fire — demo personas only.

**Language:** the repo ships in English; the AI adapts to your language at runtime. Verbatim participant quotes stay in their original language — they are data.

**Windows & Linux:** everything important runs locally with no extra packages. The browser app works in any modern browser on any OS (in-place editing needs Chrome/Edge); line endings are pinned to LF via `.gitattributes` so Windows checkouts don't break scripts; the optional `scripts/` need only Python 3 and are invoked directly (`python scripts/graph_index.py …`), with no shell wrapper in the way; the SessionStart hook runs under bash — Git for Windows provides it, and if it doesn't fire, nothing else is affected.

## Interface

`app/index.html` is a self-contained browser for the graph — no server needed, ships with the demo set embedded. (It's a **generated file**: sources live in `app/src/` and `python3 scripts/build_app.py` assembles them — the shipped app stays one file.) Open it and walk the graph: sidebar filters by type, links between entities are clickable, and every view switches between **cards and a table** (Capacities-style). **Connect folder** swaps in your own files — in Chrome/Edge it also enables **in-place editing** of the .md files (File System Access API: you pick the folder, the browser asks for write permission, everything stays local). You pick that folder **once**: the app remembers which folder it was, so later visits open a *Reconnect* bar naming it instead of the file dialog. Opened straight from disk (`file://`), Chrome re-asks for permission once per browser session — one click, and your files are back. That click is the browser's rule, not ours: a page may not silently regain the disk it had yesterday. **Export .md** downloads the whole loaded graph as a zip of Markdown files — share it, or import it into tools like Capacities, without GitHub.

## Privacy, data flow & GDPR

Archetype Talk is **local-first by design**: your research is plain Markdown in your own folder, and the browser app (`app/index.html`) runs entirely on your machine. Opening it makes **no network requests** — no CDN, no web fonts, no telemetry, no account. Avatars and competitor icons are local files or inline images, never remote URLs, so rendering a page never phones anyone.

That claim is enforced in the file itself, not just promised: `app/index.html` carries a `Content-Security-Policy` meta that pins `default-src` to `'none'`, allows images only from `self`/`data:`/`blob:`, and permits exactly one outbound host (Google's favicon service, behind the off-by-default switch below). Open the file in any editor and read the first 20 lines to verify it.

**What can leave your machine — only ever when you act:**

| Path | When | Where it goes | Your control |
|------|------|---------------|--------------|
| **LLM API** (Claude, or any model you wire in) | You run a skill or chat | Your model provider | The core of the tool. Interview text is sent to the model — see *Anonymization* below. Prefer a provider DPA with zero data retention. |
| **ElevenLabs** (optional) | You type `[speak]` in `/persona-talk` | ElevenLabs | Only the reply text, anonymized at the boundary. Needs your own key; no key → no calls. |
| **Read-only source syncs** (optional) | You run `/dovetail-sync`, `/source-sync`, `/analytics-sync` | The tool you connect | Authenticated through your MCP client; you choose what to import. |
| **Competitor favicon** (optional) | You click "Fetch favicon" **and** enabled it in Settings ▸ Privacy & network | Google's favicon service (domain only) | **Off by default.** Competitors otherwise show a lettered monogram; upload an icon file for zero network. |
| **External images** (optional) | A file's `picture:`/`photo:` holds an `http(s)` address **and** you enabled it in Settings ▸ Privacy & network | Whichever host that address points at | **Off by default** — blocked images show initials instead. Keep avatars as local paths (`avatars/Emma.svg`) and this never applies. |

Nothing else touches the network. The `SessionStart` hook (`.claude/hooks/check-inbox.sh`) only prints a few status lines to your agent — it sends nothing and runs no analysis of its own; the full list of what runs by itself is in [docs/AUTOMATION.md](docs/AUTOMATION.md).

**For enterprise / client-confidential research:** both network switches stay off (default), pick a model provider offering a Data Processing Agreement and zero retention, and treat *your machine* as the trust boundary — secrets live in `.env` (gitignored), never in committed files.

The paperwork a review asks for is pre-written in [docs/compliance/](docs/compliance/) — templates for the deploying organisation, not promises from the author, who receives no data and is therefore neither controller nor processor:

| | |
|---|---|
| [subprocessors.md](docs/compliance/subprocessors.md) | every egress path, its trigger and its default |
| [ROPA-template.md](docs/compliance/ROPA-template.md) · [DPIA-template.md](docs/compliance/DPIA-template.md) | Art. 30 and Art. 35, pre-filled with this tool's real risks |
| [participant-information-notice.md](docs/compliance/participant-information-notice.md) | Art. 13 notice + a consent script that actually mentions AI processing |
| [ai-system-card.md](docs/compliance/ai-system-card.md) | purpose, out-of-scope uses, AI Act transparency and oversight, Art. 4 literacy note |
| [data-residency.md](docs/compliance/data-residency.md) | keeping inference in the EU; `data_residency: EU` makes skills ask before any non-EU call |
| [ACCESS-AND-AUDIT.md](docs/ACCESS-AND-AUDIT.md) · [DATA-BOUNDARY.md](docs/DATA-BOUNDARY.md) · [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | the limits, stated plainly rather than discovered later |

Secrets handling: [docs/SECRETS.md](docs/SECRETS.md). Vulnerability reports: [SECURITY.md](SECURITY.md).

### Anonymization & GDPR — read before importing real interviews

Under the GDPR, **pseudonymization is itself processing** (Art. 4(2)). The moment a raw transcript is sent to an LLM to be scrubbed, personal data has already been processed by your model provider (acting as a processor). Archetype Talk **cannot fully automate this away** — an AI removing names is still an AI reading the text. What the tooling does, and what stays yours:

- **Built-in AI scrub** — `/extract-findings` runs a PII pass (Step 0) that proposes pseudonyms (`INT-01`, "her company") for your confirmation *before* any file is written. Useful — but it happens *after* the text reaches the model.
- **Local pre-scrub (recommended for sensitive data)** — strip PII *before* anything leaves your machine, so the model only ever sees anonymized text. A no-account option is **[Microsoft Presidio](https://microsoft.github.io/presidio/)** (open-source, runs locally): it detects and redacts names, emails, phones and locations. Run transcripts through it into `Inbox/`, then `/extract-findings`.
- **Manual scrub** — for the strictest cases, redact by hand before dropping a file into `Inbox/`. Zero machine processing of raw PII.
- **Your obligations remain yours:** a lawful basis / participant consent that covers AI-assisted processing, a DPA with your model (and voice/analytics) providers, and — for transfers outside the EEA — appropriate safeguards (e.g. SCCs). *This is not legal advice.*

## Works with Claude Code, Codex, Cursor, Copilot & Gemini CLI

Every workflow is a plain `SKILL.md` in the open [Agent Skills](https://agentskills.io) format — nothing Claude-only. The skills live in `.claude/skills/`; `.agents/skills/` is a link to the same folder, so agents that look there find them too.

| Agent | Finds the skills in | Talk to the demo persona |
|---|---|---|
| Claude Code | `.claude/skills/` | `/persona-talk Personas/Emma.md` |
| VS Code + GitHub Copilot | `.claude/skills/` | `/persona-talk Personas/Emma.md` in chat |
| Cursor | `.claude/skills/` | `/persona-talk Personas/Emma.md` in Agent chat |
| OpenAI Codex | `.agents/skills/` | `$persona-talk Personas/Emma.md` |
| Gemini CLI | `.agents/skills/` | ask it to talk to Emma — `/skills` lists what it found |

- **[AGENTS.md](AGENTS.md)** (repo root) is the cross-tool entry point, and **[CLAUDE.md](CLAUDE.md)** holds the complete working rules — they apply to **every** agent despite the name. **[GEMINI.md](GEMINI.md)** is a thin pointer for Gemini CLI.
- **Agents without skill support** (Cline, Continue, Qwen Code…) auto-load only their own rules file, so thin pointers to AGENTS.md sit in `.clinerules`, `.roorules`, `.cursorrules` and `.github/copilot-instructions.md`. If yours reads none of them, paste the starter prompt from [AGENTS.md](AGENTS.md#start-of-session--paste-this-if-your-agent-never-loaded-this-file) and open the matching `SKILL.md` by hand — same result.
- **Windows:** `.agents/skills` is a symbolic link. Git checks it out as a link only with symlinks enabled (Developer Mode + `git config core.symlinks true` before cloning); otherwise Codex and Gemini CLI won't see the skills — copy `.claude/skills` to `.agents/skills` instead. Claude Code, Copilot and Cursor are unaffected.

Editors: works from a dedicated agent IDE or plain VS Code with the extension of your choice — no build step beyond `python3 scripts/build_app.py` for the browser app.

## Roadmap

Planned: hardware research contexts and more source connectors. Issues and ideas welcome.

## Author

**GOLDEN RATIO — Mateusz Jędraszczyk** · [LinkedIn](https://www.linkedin.com/in/matjedux/) · MIT licensed (see [LICENSE](LICENSE)).

If you use this in your research practice, I'd genuinely like to hear how it holds up.
