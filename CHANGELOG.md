# Changelog

Notable changes per release. Format follows [Keep a Changelog](https://keepachangelog.com/);
the current version is shown in the app footer. Changes to the **file
schema** (frontmatter fields entity files use) are always called out explicitly,
because those affect your data, not just the tool.

Git tags start at 0.13.0. Everything before it shipped while the repo was still
being cut for release, and is dated here rather than tagged retroactively — a tag
should mark a release that happened, not manufacture one after the fact.

## [Unreleased]

### Changed

- **The app is light now (Editorial).** Paper, ink and one ember accent
  across every screen: one palette swap in the shared tokens, plus the handful
  of colours that had assumed a dark canvas.
- **The left rail, rebuilt.** The project is a card with its own icon (the
  Demo shows Spotify's app icon, bundled — nothing is fetched), a search field
  that opens the filter on All files (⌘K / Ctrl+K from anywhere), Tabler icons,
  and the active row as a solid ink pill.
- **Overview, redesigned.** The project's name is the headline, with its
  personas beside it. Below are four numbers, the persona cards (how solid
  each one is, and *Ask*), four health readings, where the data disagrees,
  when you listened, the open questions, and one dark band for the next round.
  Every explanation sits behind an ⓘ instead of on the page; the demo's
  "three things to try" card is gone until a proper onboarding replaces it.
- **The Projects screen** — the first screen after opening — gets the same rail
  (darker paper, ink keyline, solid ink active row). On a phone the rail's
  search spans the width, and the drawer keeps the counts right-aligned.
- **One voice for page titles.** Every page title — lists, backlog, settings,
  projects, help — and every file's name now uses the Editorial headline:
  heavy and tight, closed with the ember full stop.
- **The persona page, Editorial.** The persona's name is the headline, with
  the archetypes it fits, the line that starts a conversation and four facts (in one
  line, built from, sources, how solid). Three working tables are built from
  the file itself:
  - *frustrations*: each pain's verbatim quote taken from its signal, plus
    tags, the interview and evidence behind it, and the idea that answers it;
  - *typical behavior*, from the jobs to be done;
  - *product ideas*, with votes and grounding.

  Every other section of the file follows as before, with a source index under
  the page.

A UX pass over the browser app, from a product-design audit of the first ten
minutes a new visitor spends in it.

### Added

- **Connections between persona parts.** In the poster's *Additional
  information*, quotes, pains and pain relievers are joined by lines:
  - a quote and a pain that cite the same Signal are linked automatically
    (dashed);
  - anything else is linked by hand: drag from a card's port onto a card in the
    next column, or tick pains in the ⟷ checklist;
  - click an ember line to remove it, with Undo.

  One-to-many works. Each written link is a plain `(→ Pain; Other pain)` at
  the end of the bullet in the persona file, so it can also be typed by hand
  and any agent reads it as written. The convention is documented in
  `Personas/_template.md` and the ai-persona skill's template reference.
  **File schema:** this token is new and optional.
- **The same connections in *Persona improvement*** (evidence → signal →
  correlation). Here the lines are the research links themselves, so they are
  written where the graph already keeps them, and no new syntax is needed:
  - evidence ↔ signal goes in the Signal's `evidences:` list;
  - signal or evidence ↔ correlation goes in as a link inside that
    correlation's block in the persona file;
  - a link that only appears in a signal's prose is drawn dashed and edited in
    the file.
- **Three views of the research map** — *Columns* (one column per type with
  its count on top), *Free* (an Obsidian-style layout where files settle by
  how they link, dot size by link count) and *Flow* (the Sankey, band
  thickness = research weight). All three share one shape language — solid =
  heard, ring = read, dashed = assumption or a session set aside — and a click
  keeps a file lit across them.
- **Links on demand in Columns** — only the lit file's links are drawn, chip
  edge to chip edge, and the column heads say where they land
  ("Signals 24 · 5 linked"); an *All links* switch brings the full web back.
- **Talk to a persona** — every persona has a button that copies the line
  starting the conversation in your agent's own dialect (`/persona-talk …`,
  `$persona-talk …` for Codex, a skill request for Gemini), remembering which
  agent you use.
- **Levels on screen** — persona maturity (L1–L5, computed per
  `references/levels.md`) on every persona card and hero, and a claim level on
  every sourced bullet of a persona page.
- **The evidence trail on hover** — pointing at a Signal shows its verbatim
  quote, transcript and date; at an Evidence, its takeaway and check date.
- **Where your data disagrees** — an Overview card listing features on which
  participants split for and against, both sides linked, never averaged.
- **Three things to try** — a dismissible card on the demo's Overview.
- Poster **Save as PDF** (the browser's print dialog, no library); backlog
  **Interview guide prompt** built from the questions on screen.

### Changed

- The demo is read as of 15 Jul 2026 and its interviews are dated June 2026,
  so it no longer opens as months overdue; the date is shown.
- Counts say what they leave out ("1 participant · +1 excluded").
- The Mind Map is the **Research map**, opens on Flow and on the Primary
  persona's slice; the persona filter and a drawer focus no longer disagree.
- Backlog: most urgent first, top question open on arrival, one add button.
- Welcome: fixed-height steps with Back/Next in one place, a drawn (translated)
  conversation instead of a Polish screenshot, and "Start a new project".
- Persona pages hide the template's writer notes, print sub-bullets as such
  and don't repeat the opening quote; phones show the quote before the face.
- Projects shows one set of ways in; the top bar shows a person glyph instead
  of an anonymous "A"; single-month charts wait for a second month.

## [0.15.0] — 2026-09-28

The toolkit edition: one illustrative dataset, skills every major coding agent
can load natively, and a layout that holds the same grid on every page.

### Added

- **`.agents/skills/`** — a link to `.claude/skills/`, so Codex and Gemini CLI
  load the skills natively (`$persona-talk` in Codex). Claude Code, Copilot and
  Cursor already read `.claude/skills/`. README, AGENTS.md, GEMINI.md and the
  per-tool pointer files say how each agent calls them.
- README warns, right at *Use this repo as a template*, that a copy holding real
  interviews has to be private.

### Removed — the Future Lab research project

The repository ships as a toolkit with one illustrative dataset again. The
"Luka pokoleniowa" project that 0.14.0 added — five personas, 43 signals, 21
evidence files, nine transcripts from public sources, the team brief and the
project notes in `docs/` — has been taken out, along with the app's *Wyzwanie pokoleniowe AI*
greeting and the third onboarding door the `welcome` skill offered. That project
lives on in its own repository; shipping it inside the template meant everyone
who cloned this one started inside someone else's research.

What is left in the entity folders is the **Spotify demo only**, every file of it
flagged `demo: true`. `Product Context.md` and `Research backlog.md` are back to
blank templates — the demo's own copies stay frozen in `docs/demo-workspace/`.

`Signals/README.md` went with it: it existed to police that project's documented
exception to hard rule 2 (signals from secondary sources), and there are no such
signals here now. The rule it protected is unchanged in `CLAUDE.md`; only the
pointer to the worked example is gone.

### Changed

- **The five forms are real `<dialog>`s now** (new idea, hypothesis, competitor,
  entry, and the intro tour). The browser owns focus trapping and makes the page
  behind inert; ✕, Cancel, Esc and a backdrop click all close the same way, and
  Esc on a form no longer also walks the detail view back out from under it.
- The app's skin got another pass: cards, detail view, backlog, persona poster
  and page chrome, with colours drawn from the shared tokens throughout.
- `scripts/` share one file reader (an unreadable file is skipped, not fatal) and
  one link pattern that handles parentheses in file names. The persona-card
  freshness check moved into `graph_index.py` (`check` / `hash` / `slice`);
  `persona-card.sh` and `persona_card.py` are gone.
- **One grid on every page.** Cards in a row share a bottom edge; single-column
  lists (Archetypes, Ideas, Competitors) end at the same right edge as the card
  grids; Settings keeps its reading width without moving the page title; the
  Overview heading, spacing and card padding, and the backlog's corner radius,
  use the same tokens as every other page. The Hypotheses table fits the column
  without a horizontal scroll at its default widths.
- The hint next to *New signal* / *New archetype* no longer repeats the page
  subtitle above it.

### Fixed

- Frontmatter in single quotes reads back with YAML's `''` escape undone — the
  demo idea *"It wasn't me"* showed as *"It wasn''t me"*.

## [0.14.0] — 2026-08-23

The *Wyzwanie pokoleniowe AI* edition. Two things at once: the app stopped looking like a
prototype, and the repo stopped being a toolkit with a demo in it — it now
carries a second, real research project that shows the method on a question
nobody has answered yet.

### Added — the app

- **Projects is the screen you land on.** A research project is a folder on your
  computer, so the app now opens on a list of them, with the three ways in:
  **new project** (pick an empty folder — the entity folders and the two root
  documents get created inside it, nothing existing is overwritten), **import**
  (connect a folder that already holds research) and **the demo**. Every folder
  you connect keeps a record — its handle, its name, when you last opened it and
  how many entities it held — in a new `projects` store in the same IndexedDB
  the remembered folder already used. The list never reads a folder to refresh a
  card: the counts are shown as the remembered snapshot they are, and reading
  needs the permission your click grants. Forgetting a project deletes our
  record, never your files.
- A folder that still opens by itself wins over the new screen: if the browser
  kept the permission from last session, you land in your files exactly as
  before (0.13.0's behaviour), and Projects is one click away in the workspace
  menu.
  The first-run tour no longer stacks on top of the landing screen — it waits
  until you are inside a project.

- **Every entity type can be added by hand, in the app.** Signals, Evidence,
  Personas, Archetypes and Transcripts get the treatment Ideas, Hypotheses and
  Competitors already had: a form that writes a real Markdown file in the shape
  its `_template.md` documents — into the connected folder, or as a local draft
  in this browser until one is connected. The AI was the only door to most of
  the graph; it is a shortcut now, not a requirement.
- **Empty states say what belongs there and how to put it there** — one button
  that opens the form, and one that copies an instruction you can paste into
  whatever AI assistant you use (it names our skills but reads as a sentence, so
  an agent without them can still follow it). The blank-project screen leads with
  the manual route instead of sending you to the terminal.
- **The language switch is where people look for it**: in the project menu under
  the workspace name, and in Settings ▸ Interface. It is a browser preference,
  not a project one, so it works before any folder is connected — the rest of
  Settings still needs one.

- **Polish is complete.** Stage two of the translation the 0.13.0 notes left
  open: Overview, Mind Map, the Research backlog (its method engine included),
  Settings, Help & guide (all 45 answers), the gallery and every view inside it,
  the persona poster, all forms, and every toast, confirm dialog, tooltip,
  placeholder and aria-label. Verified by walking the app in Polish and auditing
  the rendered DOM — no English chrome left, and nothing in your research files
  is touched: entity titles, quotes and section headings stay in the language
  they were written in, because a quote is data.
- **A copied prompt answers in your language.** The prompts the app hands to your
  AI assistant (plan the next round, the agency brief, the desk-research refresh,
  `/cold-start`, and the per-type prompts on empty states) stay English — they
  name English paths, frontmatter fields and skill names, which an agent follows
  most reliably written the way they exist on disk. With the interface in Polish
  they now carry one appended line telling the agent to hold the whole
  conversation in Polish, leave file names, fields and commands untranslated, and
  quote participants in the language they spoke.
- Two things Polish grammar forced that English hides: counted nouns take the
  genitive ("4 konkurentów"), and three plural forms where English has two — so
  counted strings go through `trn`/`plw` rather than concatenating a bare word.

- **Switching projects happens in one place.** The top-left menu is no longer a
  switcher: it says which project (or the Demo) you are in, and hands you the
  door to the Projects screen, where a project is something you can actually
  see — name, size, when you last opened it. The Demo row is gone from it too;
  the Demo is a card on that screen like any other.
- **You reopen where you were.** The app starts on whatever you had open last —
  your folder if the browser still opens it by itself, or the Demo if that was
  the last thing you picked. Projects comes up only when there is nothing to
  reopen: a first run, or a permission the browser did not keep.

### Fixed

- **There is exactly one Demo on the Projects screen.** Connect a folder whose
  entities all carry `demo: true` — a fresh clone of this repo is exactly that —
  and the app opens the Demo workspace, which is right; but it also listed the
  folder as a project, so two cards led to the same content and one of them
  claimed it had read nothing. Such a folder is no longer remembered as a
  project (and an older record for it is dropped), with a toast saying so. The
  list shows folders that hold actual research, plus the empty ones the app
  scaffolded itself.

### Changed — design

- **The whole app moved onto the shared skin.** The `--color-*` tokens are now
  aliases of the shared ones, so every rule ever written against them paints in
  the new palette — and the elevation flips with them: the canvas is the darkest
  surface and cards sit above it, where the canvas used to be the lighter one.
  Radii come off one scale instead of a flat 2px, controls are pills, the
  primary action is an inverted surface, and the sidebar's active row is an
  accent-tinted pill instead of a 2px keyline.
- **The Signal skin is retired** (`08-signal-layers.css` → `08-shared-skin.css`):
  no serif page titles, no mono uppercase buttons, no crosshair tick on the page
  head. `--font-serif` and `--font-mono` stay — the persona poster still wants a
  display serif, and code, commands and keycaps still want a monospace.
- **The project home (Overview)** led the migration and keeps its own details:
  data-viz in three colours (green healthy / ember attention / hairline empty),
  and health-check rows that put the explanation under the number instead of
  squeezing it into a third column.
- **The workspace menu stopped inventing a project.** "My project · 0" was a
  switchable space for a project that did not exist yet; the row now appears
  only when there is one — a connected folder, or drafts waiting in the browser.
- **Projects moved out of the sidebar into the workspace menu** — the context
  menu under the project's name, where IA Builder keeps the same door. Choosing
  a project or the demo there now lands on that project's home rather than the
  raw entity list.
- **A shared token layer** (`--bg`/`--bg-elev`/`--line`, `--text*`, `--r-*`,
  `--s-*`, `--font-ui`), named exactly as in IA Builder so a component can move
  between the two products without a rename: two steps of surface lift instead
  of shadows, hairline borders, pill buttons, an inverted-surface primary. The
  accent stays Archetype Talk's ember and everything accent-derived is computed
  from it — flip that one value and every page re-tints.
- **First run opens on a welcome, not on the app.** One screen that asks the
  single question deciding what this is for you — where are your files? — and
  offers the two honest answers. It replaces the tour that used to auto-open;
  two onboardings stacked is one too many, so the tour now waits until you are
  inside a project. The five-step walk-through behind it gained two screenshots
  (the graph, a persona talk), and the **EN/PL switch sits in the corner of
  every step** instead of being a step of its own — switching re-renders the
  card in place and keeps your position.
- **The top navigation is a bar**: a separator against the sidebar, the account
  in the right-hand corner, no product name repeated back at you. Type starts
  at 14px across the app, Overview tiles are the height of their own content,
  and Settings trades an explanatory paragraph for two numbers.

### Added — research

- **A second worked example ships in the repo: “Luka pokoleniowa”** (the
  generational gap) — why employers stopped hiring juniors once AI took the
  work juniors used to do, and what that does to their own bench in five
  years. 21 Evidence files from desk research, 43 Signals off nine
  public-source transcripts, six employer-side archetypes, five personas at
  L2, twelve hypotheses, four Ideas, and a team brief,
  a brief that hands a team the grounded problem plus the list of things
  nobody knows yet.
- **This is not demo content and carries no `demo: true`.** It is the active
  project of this copy, which the session hook says out loud, and the README
  leads with a notice saying whose research it is. `embed_demo.py` still
  refuses to bake it into the shipped app — real research never ships in
  `app/index.html`, only the demo does.
- Five personas got **photographs** instead of generated avatars, with the four
  routes to a persona's face and the criteria for choosing between them written
  down for any agent, not just Claude Code.

### Changed — the rules

- **Signals from secondary sources are a documented exception, not a
  precedent.** The project needed them (public podcasts, not our interviews);
  every such file carries a warning banner, grounds no persona, and
  `Signals/README.md` now explains the exception together with the extraction
  failure it exists to prevent.
- **Extract blind to the thesis.** Grep navigates a source; it must never
  select from it, or you get your own argument back. Re-reading the same
  interviews without a thesis in hand produced findings the first pass had
  missed — that second pass is what the rule is made of.
- **The agent has to know whose project it is in.** The session hook names the
  active project and lists both sets of personas, and the Demo workspace keeps
  its own frozen root documents in `docs/demo-workspace/` rather than borrowing
  the project's.
- The event framing became **Wyzwanie pokoleniowe AI** (the generational AI challenge), throughout the repository.

### Fixed — since 0.13.0

- **`graph_lint` treated a title containing a comma as two entities.**
  `list_field` split every list field on every comma, so one legitimate
  reference was reported as two dangling ones. The parser respects quotes now.
  This would have hit anyone naming an entity with a comma in it.
- **A Signal was filed in another Signal's `evidences:` field**, which has no
  meaning in the schema and quietly inflated the appearance of desk-research
  grounding. The reference moved into the body as a link, with a note on what
  the two signals do *not* share.
- **Every in-app link pointed at a repository nobody can open.** The footer
  licence link, the welcome screen's repo link, `SECURITY.md` and the issue
  template all named the private working repo; they now name the public one.

## [0.13.0] — 2026-08-20

The release that makes the previous two usable by someone who isn't us: the
mechanisms of 0.11–0.12 were in the code but could not fire in a demo session,
the app forgot your folder every time you opened it, and every word of the
interface was English. Plus the first machine-checked claim about the shipped
build.

### Added — the app

- **Research backlog is a page** (Planning → Research backlog), reading, writing
  and serializing `Research backlog.md` in place: add / edit / close / reopen /
  delete a question, `Kind` tagging (qualitative / quantitative / mixed) with 2–3
  recommended methods per row, demo sandbox kept separate from write-through to
  the real file.
- **The connected folder is remembered.** The `FileSystemDirectoryHandle` now
  lives in IndexedDB instead of a variable, so boot opens straight on your files
  when permission still stands, and offers **one click** to re-grant when it has
  lapsed. Re-granting cannot be made silent — the browser requires a gesture — so
  that click is the floor, not an oversight.
- **The load lands where the files are.** A folder whose entities are all
  `demo: true` used to open on an empty project workspace and store that choice,
  so the next open was blank too. It now opens the workspace that actually has
  content and says when everything is demo-flagged.
- **English and Polish, with a switch.** Stage one covers the engine and every
  surface met before clicking anything: sidebar, nav, page heads, tour, workspace
  switcher, modals, detail chrome, toasts. Nothing is translated at runtime — no
  model, no network — and keys *are* the English source string, so a missing
  translation degrades to English rather than to a key. Counted strings know
  Polish has three plural forms where English has two. **Switching language never
  touches research files:** a Signal recorded in English stays in English, because
  a quote is data and a tool that quietly rewrites data is worse than one that
  only speaks English. Still English in stage two: Help, Settings, Overview, Mind
  Map, the backlog page, compare, poster.

### Added — verification

- **CI proves the shipped app is what `app/src/` builds to.** `app/index.html` is
  a 600KB generated single-file app that nobody reads in a diff, so "it was built
  from these sources" is now a machine's claim rather than the author's: the
  workflow rebuilds it and fails if the committed artifact differs, publishing its
  sha256 in the run summary. Three guards ride along — `graph_lint` on the
  knowledge graph, a grep that no remotely-loaded asset slipped into the build,
  and a check that the CSP meta is still present. Python stdlib only, no npm, no
  third-party actions.

### Changed — the demo set

- **Redistributed so the new mechanisms can actually fire.** The graph was big
  enough but badly shaped: the fields added in 0.11–0.12 clustered where a demo
  session would never reach them, so features shipped and stayed invisible. Adds
  the persona **Zoe** and the archetype **The Niche Curator**, two new Signals
  (`Liked Songs is a junk drawer`, `Playlists as a personal archive`), and stances
  spread across the existing set. Everything is read off existing transcript
  lines; nothing is invented.

### Changed — for agents that are not Claude Code

- **The commands section is addressed to all of them.** "Claude Code commands"
  became "AI commands & skills", saying first that each slash-command is a plain
  `SKILL.md` any agent can follow and that the `.claude/` folder name is
  historical rather than a scope. Thin pointers in `.clinerules`, `.roorules`,
  `.cursorrules` and `.github/copilot-instructions.md` for tools that auto-load
  only their own rules file.

- **Switching projects happens in one place.** The top-left menu is no longer a
  switcher: it says which project (or the Demo) you are in, and hands you the
  door to the Projects screen, where a project is something you can actually
  see — name, size, when you last opened it. The Demo row is gone from it too;
  the Demo is a card on that screen like any other.
- **You reopen where you were.** The app starts on whatever you had open last —
  your folder if the browser still opens it by itself, or the Demo if that was
  the last thing you picked. Projects comes up only when there is nothing to
  reopen: a first run, or a permission the browser did not keep.

### Fixed

- **The README described a checkbox that does not exist.** Tested on `file://`
  with a full Chrome restart: the stored handle survives, the permission does
  not, and Chrome offers no "Allow on every visit" for a `file://` origin. The
  reconnect click is by design, and the text now says so.

## [0.12.0] — 2026-07-27

Six changes aimed at the conversation itself, all from published findings rather
than intuition. No research content was removed; every entity diff is an addition.

The framing throughout: **we are not simulating a psyche, we are replaying a record.**
That is the only version the evidence supports — a psychometric analysis of LLMs
asked to be specific people found their answers are "poor signals of potentially
underlying latent traits", and get *worse* when a detailed profile is added. Every
item below makes the replay more faithful to an observed human. None of them give the
model an inner life.

### Added — how she remembers

- **Episodes carry `peak:` and `end:`.** *Schema:* two optional lines per episode in
  a Persona's `## Episodes (canon)`. Memory is dominated by the sharpest moment and
  the ending while duration barely registers (peak–end rule, duration neglect), so
  `/persona-talk` now tells the story vivid at those two points and **loose in
  between**, never reconstructing a tidy beginning-middle-end. An episode with no
  `peak:` never spiked, and is told flat — that flatness is the finding. Both fields
  come from the transcript; an ending the participant didn't give is not invented.
- **She is unreliable about duration and frequency, and sounds it.** "How often",
  "how long" get a vague non-number, never a confident figure — the data behind her
  is the remembering self, which is bad at exactly this. The researcher block flags
  it as weak self-report and suggests measuring instead of asking.
- **"I don't know" split into three registers** — a known unknown, a
  duration/frequency question, and a feature with no recorded stance are three
  different human answers. And she never narrates her own boundary: no "that's
  outside my data", because people don't feel the shape of what they're missing
  (WYSIATI). The boundary is the researcher block's business, not hers.

### Added — how she talks

- **Speech markers** on `## Tone of Voice`: hedging, self-correction, repetition,
  going quiet, sliding from "I" to "people". Collected through the existing
  candidate/`seen ×2` promotion rule, so one interview can't rewrite a voice.
  **Explicitly for imitation, never inference** — hedging correlates with
  uncertainty, but weakly, and most transcripts are tidied in transcription. Reading
  a hidden preference out of "kind of" is the same over-reach the stance rules
  forbid; if a marker seems to mean something, that is a backlog question. The three
  demo personas carry markers traceable to their own transcript lines.

### Added — how she reacts

- **Framing sensitivity** ([persona-talk/references/framing.md](.claude/skills/persona-talk/references/framing.md),
  loaded only when the user frames a feature as a loss). Losses loom larger than
  equivalent gains, so removal draws a sharper reaction than addition — proportionate
  to her recorded stance, not on top of it. **The guardrail is absolute: framing
  changes the performance, never the record.** No stance strengthened, no Signal or
  Evidence created, nothing counted toward a sample. And when the user appears to be
  reading the stronger reaction as stronger evidence, the block says so — being able
  to watch the effect work is the entire point of modelling it.

- **Switching projects happens in one place.** The top-left menu is no longer a
  switcher: it says which project (or the Demo) you are in, and hands you the
  door to the Projects screen, where a project is something you can actually
  see — name, size, when you last opened it. The Demo row is gone from it too;
  the Demo is a card on that screen like any other.
- **You reopen where you were.** The app starts on whatever you had open last —
  your folder if the browser still opens it by itself, or the Demo if that was
  the last thing you picked. Projects comes up only when there is nothing to
  reopen: a first run, or a permission the browser did not keep.

### Fixed

- **Long persona conversations degraded, and now they don't.** A role-play study
  comparing LLM and human-authored turns measured LLM quality falling significantly
  as dialogue went on (β = −0.029, p = .001) while human-authored responses held or
  improved — naturalness and character context, lost to context accumulation. Since
  the researcher asks the interesting questions *after* the warm-up, this hit exactly
  the turns that matter. `/persona-talk` now **re-anchors every ~8 exchanges and on
  every topic change**, silently: back to the canon in the card (not the
  conversation's drifting memory of it), and back to a running list of what she has
  already committed to this session. Files win on facts; the session wins on things
  she has already said — she does not get to un-say them, which is how people
  actually behave. Told episodes are referred back to, never re-told as new.

### Added — the focusing-illusion flag

*Schema:* `sentiment.unprompted: true|false` on Signals. Optional; absent means
unknown, never "prompted".

- **Records who put the topic on the table**, read off the transcript's `**M:**` /
  `**P:**` turns — usually mechanical, not a judgment call. Kahneman's focusing
  illusion is the reason it matters: asked directly about anything, people overweight
  it, so an elicited stance is **evidenced about the attitude and silent about the
  salience**. A stance the participant volunteered had to win the competition for
  their attention first.
- **It is not a quality score.** `unprompted: false` answers "how do they feel about
  X" perfectly well; it just cannot also answer "does X matter to them", because the
  question supplied that. The field keeps one meaning on purpose — a volunteered
  escalation inside a mild question belongs in `because:`, not here.
- `/persona-talk`'s researcher block names it once per feature per session, and says
  the same applies to the question the user just asked. `/feature-panel` marks
  prompted cells and calls out a fully-prompted column — a feature the team is
  interested in and users have never raised unasked.
- `graph_lint` reports it as one summary line rather than a per-file nag, plus a
  focusing-illusion line listing features nobody raised unasked.
- The demo set carries all 14, each traceable to a specific `**M:**`/`**P:**` turn:
  6 unprompted, 8 elicited. The sharpest case is Jake — his `dealbreaker` on pricing
  came after the moderator asked whether he pays, while the YouTube bundle he brought
  up himself. Both real; only the second shows the topic is live for him unasked.

## [0.11.0] — 2026-07-27

### Added — feature sentiment

Personas can now say *how they felt* about a specific feature, not only what hurt.
*Schema:* Signals may carry an optional `sentiment:` block (`feature`, `stance`,
`because`); Personas gain `## Stances by feature`; Archetypes gain a `[Context]`-gated
`## Stances by feature`. All optional — a repo that ignores them behaves as it did in 0.10.

- **A named ladder, not a score.** `dealbreaker · resents · frustrated · wary ·
  indifferent · unaware · curious · appreciates · relies_on · advocates · mixed`.
  Eleven values, each naming an **observable** ("said they would leave") rather than a
  feeling, so it can be checked against the transcript instead of felt. Numbers were
  considered and rejected: a −0.6 invites averaging, and nobody can defend the
  difference between −0.6 and −0.7.
- **The distinctions that carry the weight:** `indifferent` (we asked, they shrugged —
  a finding) is not `unaware` (nobody asked — a coverage gap, routed to the backlog)
  and neither is an absent field (not observed — never "neutral"). `mixed` is not the
  middle of the scale; `indifferent` is.
- **Splits are preserved, never reconciled.** The order is for reading, not
  arithmetic. Two participants who disagree stay two Signals, the persona shows both,
  and `/contradictions` gained *stance split* as a detectable class.
- **Grounding is unchanged:** no Signal, no stance. `/extract-findings` proposes and
  never sets one silently, leaves the field out when tone is ironic or ambiguous, and
  aggregates onto a persona **only from the Signals she herself links to** — not from
  everything reachable through her archetypes, which are other people's sessions.
- **`/persona-talk` speaks from it.** The recorded stance sets the temperature of a
  reply and outranks the model's instinct; no stance means she has no opinion to
  perform, which is said in character rather than smoothed over.
- **`/feature-panel` reads stances instead of inferring from pains**, and `dealbreaker`
  lands in *Risk if shipped* by name — it is a churn statement, not a preference.
- `graph_lint` checks the ladder, a stance with no feature, a missing `because:`, and
  reports negative/positive splits per feature. Silent on a repo that uses none of it.
- The app shows a stance chip on Signal cards — grouped, never graded, with no colour
  ramp that could be read as a score.
- The demo set models the practice on 14 of 21 signals, each justified by that signal's
  own words. Seven carry none: a pain without a stated attitude does not get one.

## [0.10.0] — 2026-07-27

Agent-efficiency pass. No research content changed — across every entity file,
everything outside frontmatter is byte-identical, and no entity file was touched
at all. What changed is how much an agent has to read to do the same work.

- **Switching projects happens in one place.** The top-left menu is no longer a
  switcher: it says which project (or the Demo) you are in, and hands you the
  door to the Projects screen, where a project is something you can actually
  see — name, size, when you last opened it. The Demo row is gone from it too;
  the Demo is a card on that screen like any other.
- **You reopen where you were.** The app starts on whatever you had open last —
  your folder if the browser still opens it by itself, or the Demo if that was
  the last thing you picked. Projects comes up only when there is nothing to
  reopen: a first run, or a permission the browser did not keep.

### Fixed

- **Persona cards were never actually reused.** The freshness hash covered the
  *whole* graph, so one new Signal made every persona's card stale at once — in a
  project where research happens, that is every session, and the cache never paid
  for itself. Freshness is now **per persona**: her file, what she links to two
  hops out, what links *to* her, and `Product Context.md`. `Research backlog.md`
  is deliberately outside the slice, because `/persona-talk` writes to it at the
  end of every session and would otherwise invalidate the card it just wrote.
  A cold persona read costs ~12 000 tokens; a warm one costs the card.

### Added

- **`scripts/graph_index.py`** — one link scanner behind two outputs:
  - `build` → `.claude/cache/graph-index.md`, a ~12 KB routing map of every
    entity (type, path, flags, links) plus each persona's slice hash. It answers
    *which files*, never *what they say*: it is not a source and is never cited.
    Regenerated by the SessionStart hook in ~0.1 s.
  - `skills` → `.claude/skills/INDEX.md`, the skill map for agents that have no
    slash-commands. Committed, unlike the cache; excludes gitignored local skills.
  - `hash <Persona>`, `slice <Persona>`, `check <card>` — `persona-card.sh` and
    `persona_card.py` are now thin shims over it, so the freshness rule and the
    index can't drift apart. The documented commands are unchanged.

### Changed

- **`CLAUDE.md` is ~2.5 KB smaller.** Rules whose breach corrupts data stayed;
  rules that only shape one workflow moved to the skill that must obey them —
  where, in most cases, they were already written. The split criterion is stated
  in the file, so the next person knows which side a new rule belongs on.
- **`/extract-findings` splits into lazy references** (~3.7 KB smaller): inbox
  mode, lifecycle fields, tone-of-voice machinery and competitor bookkeeping load
  only when that mode activates. Steps 0 and 0b — the PII scrub and the lifecycle
  question — stay inline and are never deferred.
- Six skill descriptions lost clauses that described *behaviour* rather than
  triggers; every trigger phrase is intact, and the removed text was already in
  the skill body. This was worth ~150 tokens a session and was not pushed
  further: descriptions are what routes a request to the right skill.
- `AGENTS.md` and `GEMINI.md` route through the two indexes instead of the 18 KB
  README, cutting a non-Claude agent's entry cost from ~33 KB to ~21 KB.

### Not changed, deliberately

The single-file app is **not** minified. It reaches `domInteractive` in 40 ms
with zero network requests; minification would save no measurable time and would
cost the properties the compliance pack rests on — a readable CSP in the first
20 lines, and a build any reviewer can reproduce and diff.

## [0.9.0] — 2026-07-25

First tagged release. The theme is *verifiability*: several things the project
already claimed are now enforced in the artifact or checked by CI, and the
documents an enterprise review asks for exist instead of being implied.

- **Switching projects happens in one place.** The top-left menu is no longer a
  switcher: it says which project (or the Demo) you are in, and hands you the
  door to the Projects screen, where a project is something you can actually
  see — name, size, when you last opened it. The Demo row is gone from it too;
  the Demo is a card on that screen like any other.
- **You reopen where you were.** The app starts on whatever you had open last —
  your folder if the browser still opens it by itself, or the Demo if that was
  the last thing you picked. Projects comes up only when there is nothing to
  reopen: a first run, or a permission the browser did not keep.

### Fixed

- **The app no longer loads anything from a remote host.** Persona avatars held
  a `https://api.dicebear.com/…` URL in `picture:`, so rendering a persona
  fetched an image from that host — contradicting the documented "opening it
  makes no network requests". Avatars are now local files, inlined into the
  shipped single-file build. *Schema:* `picture:`/`photo:` should hold a path
  relative to the file's folder (`avatars/Emma.svg`) or an inline `data:` image;
  an `http(s)` value still works but is **blocked by default** and shows initials
  until you allow it in Settings ▸ Privacy & network.
- Settings' privacy switches and the new clear-local-data action work without a
  connected folder (the render used to return early before wiring them).
- The mind-map view preference is namespaced per project copy like every other
  stored preference, instead of leaking across local checkouts.

### Added

- **Content-Security-Policy** in `app/index.html`: `default-src 'none'`, images
  limited to `self`/`data:`/`blob:`, exactly one permitted connect host (the
  opt-in favicon service). The egress policy is now readable in the file's first
  20 lines rather than promised in prose.
- **Settings ▸ Privacy & network**: an *Allow external images* switch (off by
  default) and *Clear local data*, which reports how many browser-only drafts
  would be lost before clearing and never touches a `.md` file.
- **CI** ([.github/workflows/verify.yml](.github/workflows/verify.yml)): rebuilds
  the app from sources and fails if the committed `app/index.html` differs, runs
  `graph_lint.py`, asserts no remotely-loaded assets and that the CSP is present,
  and publishes the artifact's SHA-256.
- **Documentation an enterprise review asks for**:
  [docs/compliance/subprocessors.md](docs/compliance/subprocessors.md) (egress
  table, roles, and the statement that the author receives no data),
  [docs/DATA-BOUNDARY.md](docs/DATA-BOUNDARY.md) (folder vs browser vs `.claude/`
  vs third parties), [docs/AUTOMATION.md](docs/AUTOMATION.md) (the one hook, and
  how to disable it), [docs/SECRETS.md](docs/SECRETS.md) with `.env.example`,
  [docs/BUILD.md](docs/BUILD.md) (reproduce the artifact; dependency statement),
  [docs/SUPPORT.md](docs/SUPPORT.md), [CONTRIBUTING.md](CONTRIBUTING.md),
  `CODEOWNERS` and issue templates.
- A `VERSION` file stamped into the app footer and the generated file's header.

### Added — participant data lifecycle

Optional throughout. *Schema:* transcripts may carry `consent`, `consent_ref`,
`consent_scope`, `lawful_basis`, `retention_until`, `anonymization`,
`anonymized_with`, `anonymized_on`, `key_location` and `special_category`;
signals may carry `special_category`. **Absence means "not recorded", never "not
allowed"** — no skill refuses to work, no analysis is blocked, and a repo that
ignores every one of these fields behaves exactly as it did in 0.8.

- **`/forget-participant`** — GDPR Art. 17. Traces the code, `same_participant_as`
  links, signals, personas, archetypes, root docs and derived caches; defaults to
  **de-identification in place** (the finding survives, the person doesn't);
  re-grades claims that lose their only source and reports the level drops; writes
  an erasure record holding no personal data; names what it cannot reach.
- **`/subject-access`** — Art. 15/20 bundle, including the conclusions drawn from
  the session, with third parties redacted.
- **`/retention`** — treats the clock as a **state change, not a delete**:
  finish de-identification, destroy the linking key, and the data becomes
  anonymous — at which point the clock stops. Deletion only when the text itself
  still identifies.
- **`scripts/participant_trace.py`** — report-only tracer behind all three;
  follows links rather than bare names, so it doesn't cry wolf on every file
  containing the word "Tom".
- **`scripts/hooks/pre-commit`** (opt-in) — blocks a transcript from entering git
  history with no recorded scrub state. Documented bypass; demo files exempt.
- **`graph_lint`** gained retention, consent-scope, Art. 9 and anonymisation
  checks, tuned so an untouched repo stays green: the only ERROR is a stated
  intent contradicting itself (Art. 9 material against a consent scope that
  excludes it).
- Demo set models the practice: `INT-06 Tom` and its signal carry
  `special_category: [health]` — the flag changes nothing about the finding's
  strength, only how exports and voice generation treat it.

### Added — governance documents and audit trail

- **Per-file audit stamp**: the app writes `updated` and `updated_by` when it
  saves an entity. `updated_by` is a **display name only — never an email
  address, not even masked**, and is omitted entirely when no name is set rather
  than falling back to one.
- **Email-leak guards**, covering addresses arriving by any route: `graph_lint`
  warns on an unmasked address in any entity file or root document, and the
  pre-commit hook blocks the commit outright, printing the offenders masked.
- **Accessible names on the Mind Map and Flow diagrams** (`role="img"` with entity
  counts per column and link count), plus [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)
  — a self-assessed WCAG 2.2 AA statement that lists the known gaps (the graph
  canvas is not keyboard-operable; the table and detail views are its full text
  equivalent) instead of claiming conformance.
- **Compliance pack** in [docs/compliance/](docs/compliance/): a README settling
  who is controller, processor and neither; ROPA (Art. 30) and DPIA (Art. 35)
  templates pre-filled with this tool's real risks; a participant information
  notice and consent script (Art. 13) covering AI-assisted processing; an
  [AI system card](docs/compliance/ai-system-card.md) mapping AI Act transparency
  onto mechanisms that already existed (levels, `author: AI`, `demo:`, "a persona
  conversation never creates data") with an Art. 4 AI-literacy note; and
  [data-residency.md](docs/compliance/data-residency.md).
- **`data_residency: EU`** preference with a Settings switch: when set, skills ask
  before calling any non-EU service. A reminder, not a technical block — the
  model provider is configured in your agent, not here.
- [docs/ACCESS-AND-AUDIT.md](docs/ACCESS-AND-AUDIT.md) — states plainly that
  access control is filesystem-level with no in-app RBAC, that git is the audit
  trail, that reads are not logged, and how team review and concurrent-write
  detection actually work.

### Changed

- README and SECURITY.md now describe the network behaviour accurately, listing
  both optional outbound switches instead of one.
- `CLAUDE.md` gained a *Data lifecycle* section: consent scope gates the matching
  action when present, Art. 9 flags travel with the data without weakening it,
  retention is a state change, and erasure re-grades the graph.
- `Participants.md` carries a data-minimisation rule for its segment column.
- `/persona-avatar` writes local avatar paths and never a remote URL.

## 0.8.0 and earlier — before tagging

Roughly a year of work, untagged, summarised for orientation:

- **The graph and its rules** — `Evidence → Signal → (Persona ↔ Archetype) → Idea`
  with `Hypothesis` as the ungrounded waiting room; the L1–L5 level scale; the
  3-month freshness rule; the hard rule that a persona conversation never
  creates data.
- **Skills** — `persona-talk` (panel mode, mockup reactions), `persona-query`,
  `extract-findings` with a PII step, `researcher`, `graph-lint`,
  `contradictions`, `interview-guide`, `backlog`, `prioritize`, `prd`,
  `opportunity-tree`, `feature-panel`, `journey-map`, `export`, `cold-start`,
  `demo-data`, `persona-voice`, `persona-avatar`, and the source connectors
  (`dovetail-sync`, `source-sync`, `analytics-sync`).
- **The browser app** — a single self-contained file: gallery and table views,
  detail pages with in-place editing (File System Access), Mind Map and Flow
  views, Overview dashboard, competitor map and compare, affinity board,
  transcript highlights, hypotheses with promotion, persona poster, settings.
- **Componentisation** — `app/src/` split into CSS and JS partials assembled by
  `scripts/build_app.py`; demo content embedded by `scripts/embed_demo.py`.
- **Offline by design** — Google Fonts dropped in favour of a system font stack.
- **Cross-tool support** — `AGENTS.md` and `GEMINI.md` alongside `CLAUDE.md`.
