---
name: welcome
description: First-run onboarding — greet a new user, explain what Archetype Talk is and whose it is, list capabilities, and route to setup or the demo persona. Runs via the SessionStart hook on fresh installs or on /welcome.
---

# welcome — First-run onboarding

Greet a new user right after they install/clone this repo, explain what it is, describe what you can do, and route them to either configuration or hands-on work. Runs automatically on first session (via the SessionStart hook, when `.claude/onboarded.local` is missing) or on demand with `/welcome`.

**Adapt to the user's language.** The repo ships in English by default, but detect the user's language from how they write and respond in it. Translate section labels and your prose; never translate verbatim participant quotes (they are data).

## Step 0 — find out whether this repo is already somebody's project

**Do this before you write a word.** Read `project_name:` in `Product Context.md`
and check `.claude/cache/graph-index.md` for its `project:` and `demo_entities:`
lines. A repo that already carries a project is not a fresh install, and the
worst opening you can give is a tour of the demo to someone whose own research
is sitting right there.

- **A project is named and real (non-`demo: true`) entities exist** → say what
  the project is in your first sentence, from `Product Context.md`. Offer to
  pick up the work; keep the capability list short and skip the demo entirely
  unless they ask. Never present a demo persona alongside their own.
- **Nothing but the demo** → the flow below, as written.

The rest of this skill assumes the second case. In the first, use the parts
that apply and drop the rest — an onboarding that ignores what is already in
the folder is worse than no onboarding.

## The onboarding flow — four steps, one at a time

Keep it warm and short. Do not dump everything at once.

### Step 1 — What this is & whose it is
- This is **Archetype Talk** — a UX-research knowledge graph you can *talk to*. It turns real customer research into intention-based personas grounded in traceable evidence.
- Read `README.md` for the owner/author line and license. State whose repo it is (author from README / LICENSE) so the user knows they're standing in someone's method, not a blank tool.
- One-sentence shape: `Evidence → Signal → (Persona ↔ Archetype) → Idea`, with optional `Competitors/` context.

### Step 2 — What you can do here
Briefly list your capabilities (map to the skills):
- **Talk to a persona** grounded strictly in the research (`persona-talk`) — incl. a ready **DEMO persona**: `Personas/Emma.md`.
- **Query a persona** for likely reactions with confidence levels (`persona-query`).
- **Build / deepen personas** from research (`persona-workshop`, `ai-persona`).
- **Start from absolute zero** — no transcripts, no reports at all: `/cold-start` interviews the founder about the startup (value proposition, target group, pitch deck) and turns their beliefs into testable L1 assumptions + a research plan. Explicitly invoked only.
- **Turn transcripts into Signals & Evidence** (`extract-findings`).
- **Connect research sources over MCP** — Dovetail (`dovetail-sync`); voice memos & call recordings, Notion/Confluence, usability tools (`source-sync`); product analytics: Mixpanel / GA4 / Amplitude (`analytics-sync`). All read-only, with provenance.
- **Keep the graph healthy** — `/graph-lint` (dead links, orphans, stale data), `/contradictions`, `/backlog`.
- **Close the research loop** — `/interview-guide` turns backlog gaps into a discussion guide for real interviews.
- **PM toolkit** — `/feature-panel` (one feature × all personas, cited), `/prioritize` (RICE with Confidence derived from Levels), `/prd` (fully-cited Why), `/opportunity-tree` (OST from Correlations).
- **Deliver outward** — `/journey-map` (cited journey maps), `/export` (persona one-pagers, Ideas as tickets, stakeholder packs).
- **Give a persona an ElevenLabs voice** so `/persona-talk` replies can be heard, not just read (`persona-voice`) — needs the user's own ElevenLabs API key.
- Everything is graded by **grounding Levels (L1–L5, one scale with persona maturity)** and **freshness (3-month rule)**, and every claim links back to a real source.

### Step 3 — Ask which way to go
Ask the user (one clear question):
> "Would you like to (a) go through a short setup so the repo fits your project, or (b) jump straight in — talk to the DEMO persona or add your own research?"
Mention explicitly that they can try the DEMO persona right now with `/persona-talk Personas/Emma.md`, no setup needed.

### Step 4 — If they choose setup, ask the essentials (one at a time)
Only what the project genuinely needs to continue:
1. **Product under study** — what product/service are the personas about? (updates `Product Context.md`)
2. **Research source** — do they have transcripts to drop in `Inbox/`, or a **Dovetail** workspace to connect via `/dovetail-sync`? (or neither yet → offer `/cold-start` for a zero-data founding brief, or `/persona-workshop` to sketch an archetype)
3. **Primary segment(s)** — who are they researching first? (shapes the first persona/archetype)
3a. **Competitor compare categories** (only if they'll track competitors) — which 3–6 axes genuinely decide wins and losses in *their* market (pricing model, the contested capability, ownership, support, compliance…)? Write them to `compare_categories: [...]` in `Product Context.md` frontmatter — the app's Compare view shows exactly these. Steer them away from vanity metrics (funding, headcount, follower counts): if it doesn't change what their users choose, it's not a category.
4. **Keep, separate, or clear the example data?** — the Spotify example set is illustrative; every file carries `demo: true` in frontmatter (a **Demo** badge in the app, ⚠️ flagged by `persona-talk`). Three options via `/demo-data`: keep in place (badges mark it), **separate** it under `Demo/` (recommended once real data starts flowing), or delete it. No pressure to decide now — `persona-talk` will ask once after their first demo session anyway. Real content they add should simply omit the `demo:` field.
5. **Language** — confirm the language they want to work in (you adapt; repo stays English by default).
6. **Voice (optional)** — want personas to have an ElevenLabs voice? Needs their own API key in `.env` (`ELEVENLABS_API_KEY`); if they don't have one yet, skip this for now — it's revisitable anytime via `persona-voice`, not a one-time choice.

Then propose the concrete next action (connect Dovetail / process Inbox / start a workshop) and, if useful, remind them the DEMO persona is available.

## Finish

When onboarding is done, create the marker so it doesn't repeat:
```
touch .claude/onboarded.local
```
(If the user only ran `/welcome` manually and was already set up, don't recreate the marker logic — just help.)

## Rules

- **Never fabricate** the author/product — read `README.md` / `LICENSE` for the owner; if the product isn't set yet, say so and offer to set it in `Product Context.md`.
- **Don't auto-run heavy work.** Onboarding never bulk-analyzes files on its own — it points to `/extract-findings` and asks first.
- **One question at a time** in Step 4; summarize what you heard before moving on.
- **Never offer the demo to a repo that already has a project.** Step 0 decides
  this, and `demo: true` is the only thing separating the example set from the
  user's own files (hard rule 9 in CLAUDE.md) — so an unfiltered list of
  personas is always wrong here.
