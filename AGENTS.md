# AGENTS.md — guide for any AI agent working in this repo

This file is the cross-tool entry point (the open [AGENTS.md](https://agents.md)
convention, read by OpenAI Codex, Google Antigravity, and others). It works
alongside Claude Code, Gemini CLI, or plain VS Code with any agent extension.

> **The complete working rules live in [CLAUDE.md](CLAUDE.md) — read it first.**
> Despite the name it is **not** Claude-specific; every rule there (grounding,
> Levels, Signals vs Evidence, never inventing quotes/stats, link approval,
> demo-data isolation) applies to **you**, whichever agent you are.

## Start of session — paste this if your agent never loaded this file

Most VS Code agents (Cline, Roo Code, Continue, Copilot, Qwen Code…) auto-read
only their own rules file, and several stop at the `.claude/` folder name and
conclude that none of it is meant for them. It is: the name is historical, not a
scope. Thin pointers to this file now sit in `.github/copilot-instructions.md`,
`.clinerules`, `.roorules` and `.cursorrules`. If your tool reads none of those,
paste this as your first message:

> Read `AGENTS.md`, then `CLAUDE.md`, then `.claude/skills/INDEX.md`. Those rules
> apply to you whichever model you are — the `.claude/` name is historical, not a
> scope. Then check `Inbox/` for unprocessed files and tell me what you found.
> Never read `app/index.html` or `app/src/embedded-graph.html` — they are generated.

## What this repo is

Archetype Talk — a UX-research knowledge graph you can talk to. Shape:
`Evidence → Signal → (Persona ↔ Archetype) → Idea`, with `Hypothesis` as the
ungrounded waiting room. One entity per Markdown file, one folder per type. Full
map: [README.md](README.md).

## Which project you are in — read this before your first answer

`project_name:` in [Product Context.md](Product%20Context.md) names the project
this repo is for, and that file is its brief. The entity folders hold **two**
sets side by side: that project's files, and a bundled Spotify example set
marked `demo: true`. Nothing but that flag separates them.

So: treat every `demo: true` file as out of scope — not read, not grepped, not
counted, not named in an answer — unless the user asks about the demo itself.
Offering a demo persona next to the user's own, or calling a repo empty because
the real files were filtered out, is the failure this paragraph exists to
prevent. [.claude/cache/graph-index.md](.claude/cache/graph-index.md) lists the
two sets separately and names the active project on its `project:` line.

## Where things live

Nothing here is a source you cite — it is routing, so you open the two files a
task needs instead of grepping for them. Cite the underlying entity file.

| Open this | For | When |
|---|---|---|
| [CLAUDE.md](CLAUDE.md) | the complete ruleset — grounding, Levels, Signal vs Evidence, data lifecycle, link approval | first, every session, whichever agent you are |
| [.claude/skills/INDEX.md](.claude/skills/INDEX.md) | every skill, one line each, what triggers it | before starting any task — it tells you which `SKILL.md` to open |
| `.claude/skills/<name>/SKILL.md` | the full procedure for one workflow, plus its own rules | when a task matches an INDEX row. Its `references/` only when the skill says that mode activated |
| [.claude/cache/graph-index.md](.claude/cache/graph-index.md) | type, path, flags and links of every entity | before opening research files, to pick *which*. Never cite it |
| `<Folder>/_template.md` | required frontmatter and section shape for that entity type | before creating or editing any entity |
| [Product Context.md](Product%20Context.md) | what the product actually does | when the work touches features |
| [Research backlog.md](Research%20backlog.md) | open research questions, with priorities | when proposing what to ask real users |
| [Participants.md](Participants.md) | who was interviewed, and in which session | when you need sample stats or heard-from counts |
| [README.md](README.md) | the human-facing overview | for orientation — the rules are in CLAUDE.md, not here |
| [app/src/README.md](app/src/README.md) | which app partial holds which component | before touching anything under `app/` |

Three folder-level homes you would not guess: **competitors** —
`needs_research:`, `mentioned_in:`, `proximity:` and the comparison axes are in
[Competitors/README.md](Competitors/README.md), not in a template.
**Persona avatars** — consent rule, the generate-and-review procedure, and why
`picture:` must never hold an `http(s)` value are in
[Personas/avatars/README.md](Personas/avatars/README.md); read it before making a
face for anyone (photorealistic alternatives, licences and sizing:
[Personas/photos/README.md](Personas/photos/README.md)).
And **`docs/`**, which nothing else links to:

| Open this | For |
|---|---|
| [docs/DATA-BOUNDARY.md](docs/DATA-BOUNDARY.md) | where the data physically lives, and what leaves the machine |
| [docs/SECRETS.md](docs/SECRETS.md) | where keys live and where they must never be written |
| [docs/AUTOMATION.md](docs/AUTOMATION.md) | what runs by itself — hooks, scripts, schedules |
| [docs/BUILD.md](docs/BUILD.md) | reproducing the shipped app |
| [docs/ACCESS-AND-AUDIT.md](docs/ACCESS-AND-AUDIT.md) | working as a team, who changed what |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | the accessibility statement |
| [docs/SUPPORT.md](docs/SUPPORT.md) | what is maintained and what you can rely on |

Answer questions about storage, keys, automation or the build **from these
files**, never from a guess about how such a repo usually works.

## Running the workflows when you're not Claude Code

The `.claude/skills/<name>/SKILL.md` files are plain instructions in the open
[Agent Skills](https://agentskills.io) format. `.agents/skills/` is a link to the
same folder, so skill-aware agents load them natively: Claude Code, Copilot and
Cursor as slash-commands (`/persona-talk`), Codex as `$persona-talk`, Gemini CLI
by activating the skill when a task matches it. **If your agent does not list
them** — or `.agents/skills` came out as a plain file on a Windows checkout —
open the matching `SKILL.md` and follow its steps directly. Same result.

**Start from [.claude/skills/INDEX.md](.claude/skills/INDEX.md)** — one table, every
skill, what triggers it. It exists so you don't have to read the 18 KB README to
find out which file to open. A skill's `references/` are loaded **only** when the
skill says that mode activated, never upfront.

**Follow a skill silently — never narrate it.** A `SKILL.md` is a procedure you
execute, not a document you think out loud about. The user gets the *result* in
the format that skill defines; they never get your plan, your step numbers, your
reading list, or a summary of what a file contained before you use it. This bites
hardest in VS Code custom modes and local reasoning models, which emit
`<think>`/`<reasoning>` tags as plain text that the client doesn't strip — in
`persona-talk` a leaked block reads as the persona's cheat sheet printed above her
own answer, and the interview is over. If your runtime can't hide the tags, keep
what's inside them to a few words.

**Then read [.claude/cache/graph-index.md](.claude/cache/graph-index.md)** before
opening research files — a one-read map of every entity (type, path, flags, links)
that tells you *which* files matter. Generate it with `python3
scripts/graph_index.py build`; Claude Code's SessionStart hook does that
automatically, and your agent probably doesn't. It is a routing map, never a
source — never cite it, and read the actual file for anything you quote.

Some behaviors are wired as a Claude Code `SessionStart` hook
(`.claude/hooks/check-inbox.sh`) that only *prints reminders*. If your agent
doesn't run hooks, reproduce the check yourself at the start of a session:
- unprocessed files in `Inbox/` → offer to run `extract-findings` (never auto-run);
- `Competitors/*.md` with `needs_research: true` → **ask** before desk research,
  offering a 1/2/3-year lookback window;
- no onboarding marker (`.claude/onboarded.local`) → run the `welcome` skill;
- the session's **first message is a bare greeting** ("hi", "cześć", "hello") with
  no request attached → don't answer with a bare greeting back. Say in one or two
  sentences what this repo is — Archetype Talk, a UX-research knowledge graph you
  can talk to ([README.md](README.md)) — and then ask what they want to do. Naming
  the folder you are sitting in is not the same as knowing what it holds.

## Editing the browser app (`app/`)

**Never read or edit `app/index.html` or `app/src/embedded-graph.html`** — they
are 300 KB+ generated build artifacts (reading them wastes huge context). The app
is edited as partials:

1. Grep [app/src/README.md](app/src/README.md) — the component map — first.
2. Read/edit only the matching `app/src/css/NN-*.css` or `app/src/js/NN-*.js`
   partial (plus `app/src/shell.html` for page structure).
3. Rebuild: `python3 scripts/build_app.py`.
4. After changing `demo: true` content: `python3 scripts/embed_demo.py`
   (embeds demo files only — real research never ships in the app).

### Reusable content components (no packages, pure Markdown)

Detail pages render four visual components from fenced blocks whose info string
names the type. Use them when a claim scans better as a visual than a sentence
(market share, key stats, comparison ratings, history) — but only when the data
supports it; an honest gap beats a decorative chart. Full spec in
[app/src/README.md](app/src/README.md).

````
```bar          ```stat                         ```rating          ```timeline
Spotify: 31%    100M+ | Subscribers | Q2 2025   Catalog: 5/5       2015: Launched
Apple: 15%      #2 | Market rank | 2025          Voice: 3/5         2025: 100M subs
```             ```                              ```                ```
````

### Inline source citations

Type `[S1]`, `[S2]` … in prose to drop a clickable superscript chip that jumps to
the matching item in that page's `## Sources` list (1-indexed). Keep sources as a
list under a `## Sources` heading. No other syntax — this stays editable by hand.

## GDPR / anonymization (do not skip)

Sending a raw transcript to an LLM to be scrubbed already processes personal data
(GDPR Art. 4(2)). Prefer a **local pre-scrub** (e.g. Microsoft Presidio) or a
manual redaction *before* text reaches any model; the `extract-findings` Step-0
PII pass is a safety net, not a substitute. Details:
[README.md](README.md#anonymization--gdpr--read-before-importing-real-interviews).

## Git

Commit locally with clear messages; **push only when the user explicitly asks.**
