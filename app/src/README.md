# app/src — component map

`app/index.html` is generated: **never read or edit it.** Edit a partial below, then
`python3 scripts/build_app.py`. Partials concatenate in filename order (order matters:
CSS skin layers override base; JS shares one scope). Grep this map first, read ONE file.

## css/ (cascade order)

**One name per token.** Surfaces, ink, hairlines, radii and spacing are named
once — `--bg*`, `--text*`, `--line`, `--r-*`, `--s-*` — and that is what a new
rule should use. The old `--color-*` / `--spacing-*` / `--radius-*` layer was an
alias of exactly those and is gone. The **type scale is the exception**:
`--text-body` (14) / `--text-body-lg` (16) / `--text-subheading` (18) /
`--text-heading-sm` (24) / `--text-heading` (30) have no twin on the `--fs-*`
ladder, so they stay their own vocabulary until someone deliberately decides
what 16px should become.

| file | contains |
|---|---|
| 01-tokens-base.css | `:root` design tokens (surfaces, ink, radii, spacing, type scale, `--width-column/reading`), reset, base body, focus ring |
| 02-shell.css | app shell layout, sidebar, nav items, workspace switcher |
| 03-cards-gallery.css | main column, `.content`, page-head, cards, badges/tags, filter bar, view toggle, section heads, hypo/vote pills |
| 04-skin.css | `body.lin-all`/`lin-side` skin overrides, persona hero, mind-map canvas + drawer, tour + modal (`.modal` is a `<dialog>`: the element is the full-screen centring layer, the scrim is `::backdrop`) |
| 05-detail.css | detail view `.detail-wrap`, `.doc` markdown rendering |
| 06-views-chrome.css | toast, drop mask, competitor map + compare + list rows, tables, help page, settings page, responsive media queries |
| 08-shared-skin.css | the shared skin: page heads, pill controls, sidebar, card surfaces, chips, inputs, tables — written on top of 04 with the same `body.lin-*` prefixes, and it **wins**: where both name a selector, 08 is the live value and editing 04 does nothing. Also defines `--accent`, `--font-serif`, `--font-mono` |
| 09-persona-poster.css | persona poster overlay (`.pp-*`): hero grid, gains/pains cards, L2→L4 flow, dividers |
| 10-backlog.css | Research backlog page (`.bl-*`): question rows, provenance chips, in-place edit form |
| 11-projects.css | Projects screen (`.pj-*`): rail, CTA cards, project cards + thumbnails — written straight on the shared tokens (`--bg*`, `--r-*`, `--s-*`, `--font-ui`) from 01 |
| 12-project-home.css | Project home / Overview (`.dash-*`, data-viz primitives, CTA cards) |
| 13-welcome.css | First-run welcome (`.wc-*`): the card, its icon tile, and the full-bleed particle canvas behind it |
| 14-topnav.css | Top bar (`.topnav-*`): fixed, `--topbar-h` tall, running from the rail (`--sidebar-w`) to the right edge — full width only under `body.detail-open`, the one view with no rail. Holds the ember initials avatar over a menu with language, Export .md and Exit, and owns the top offset `.main` / `.detail` take from it |

## js/ (one shared scope; execution = declaration order)

| file | contains |
|---|---|
| 01-registry-icons.js | type registry, entity/archetype icons, link + highlight regexes |
| 02-parse-state.js | frontmatter parser, global state, per-project storage, link resolver, "us" competitor |
| 03-workspaces-nav.js | workspaces + switcher, sidebar nav, page subtitles, skin classes. Also `projectNameOverride`/`projectDisplayName` — `project_name:` in `Product Context.md` frontmatter is what the project is *called* (workspace label, Projects list); the folder name stays wherever we talk about the folder itself |
| 04-gallery-stats.js | gallery views per tab, heard-from strength, exclusions, freshness, margin of error |
| 05-affinity-drafts.js | affinity board, new-idea form, local drafts, demo sandbox + write-through, rehydrate |
| 06-filter-tables.js | filter matching, participant counts, table columns/sorting, highlights board, competitor list rows |
| 07-compare-votes.js | competitor compare view, markdown table cells, idea voting, YAML vote block |
| 08-highlights-hypotheses.js | transcript highlights + tag rename, hypotheses + promote flow, new competitor/hypothesis forms, email masking |
| 09-detail-edit.js | markdown detail + xref nav, in-place editing (File System Access), competitor icon manager |
| 09b-new-entity.js | manual creation for Signal / Evidence / Persona / Archetype / Transcript (`NEW_SPEC` field sets + markdown builders, one shared modal), the `＋ New …` bar, per-type empty states, and the copy-to-clipboard AI prompts (`NEW_PROMPT`). Ideas / Hypotheses / Competitors keep their own richer forms in 05 and 08 |
| 10-help.js | Help & guide page — `HELP` (English) and `HELP_PL` side by side, picked by `helpData()` |
| 11-mindmap.js | Mind Map + Flow view (graph, layout, drawer, detail pane) |
| 12-settings.js | Settings page |
| 12b-backlog.js | Research backlog page — `Research backlog.md` table parse/serialize, add / edit / close / reopen / delete a question. Two columns: the question list on the left, everything we hold about answering the selected one on the right (`blDetail`). `Priority` tiles up top double as the severity filter (`BL_SEVS`/`blGuessSev`; a human pick is written `critical (locked)` and AI must never overwrite it), plus qual/quant `Kind` tagging and method recommendations (`BL_SIGNALS`/`BL_METHODS`). The list is a **status**, not a section name: *To run* / *Answered*; the status and type segments live in the filter drawer behind the Filter button (`BL_FILTERS_OPEN`), the text filter sits in the list header (`BL_TEXT`, filters rows in place so the caret survives), and each recommended method explains itself in a right-hand sheet (`blSheet`/`BL_SHEET`, `about:` on `BL_METHODS`) instead of on the card. Demo sandbox vs write-through to the file |
| 13-dashboard.js | Overview dashboard stats, AI prompts (`dashPromptText`/`dashEnrichText`/`dashBriefText`), data-viz |
| 13b-persona-poster.js | persona poster view (`posterOpen`): section parsers (bullets + source links, correlations), hero/JTBD/gains/pains/L2-L4/quotes render, `photo:` frontmatter support, Esc/✕ close |
| 13c-projects.js | Projects screen (`projectsEnter`/`renderProjects`): the folders you have connected (IndexedDB `projects` store, see `projectRemember` in 02), new project (scaffolds the folder tree), import, and the Demo — reachable from the one CTA card, not a rail item. Also owns this screen's second page, **Help & FAQ** (`PJ_FAQ`/`PJ_FAQ_PL`, picked by `pjFaqData()`, switched by `PJ_PAGE`), the empty state's per-assistant starter prompt (`PJ_AGENTS`/`pjPromptText`) and the rail credits. The app opens here unless a remembered folder reconnects itself |
| 13d-welcome.js | First run only (`welcomeEnter`): a **five-step setup walk-through** (`wcSteps`/`WC_STEP`) over an animated particle field (`wcField`, still frame under `prefers-reduced-motion`, torn down on close). Step 1 greets, steps 2–4 explain the graph, the AI assistant and the privacy/browser story, step 5 asks for the folder and says why. Demo and Skip stay reachable from every step. Seen-once flag `at-welcome`. The **EN/PL switch (`.wc-lang`, `data-wc-lang`) sits in the corner on every step**, not as a step of its own — `setLang` re-renders the card in place and keeps `WC_STEP`, so switching does not restart the walk-through |
| 14-boot-router.js | hash router, toast, load-from-disk, drag&drop, find-in-transcript, highlight selection UI, keyboard shortcuts, in-view filter bar, the intro tour (**no longer auto-opens** — `TOUR_AUTO = false`; the welcome owns first contact, the tour stays reachable from Help), card spotlight, boot sequence |
| 15-topnav.js | Top bar — initials from `name:` in `.claude/preferences.local.md` (`A` when there is none), the workspace line, and open/close. The buttons inside it keep the ids they had in the left rail (`exportBtn`, `exitBtn`, `.lang-opt`), so their handlers still live in 14 / 13d / 02b. A MutationObserver on `#detailView` mirrors its `active` class onto `body.detail-open`, which is what widens the bar on the one page with no rail |

`img/` — pictures the build inlines as data: URIs wherever it finds an
`__IMG:name__` token (the app is one file, and its CSP allows no remote host).
A missing file renders as nothing and the build says so: see [img/README.md](img/README.md).

`shell.html` — static page structure with the three placeholders. The five
overlays (`ideaModal`, `newModal`, `hypoModal`, `compModal`, `tourModal`) are
`<dialog>` elements opened with `showModal()`: Esc, the backdrop, the focus trap
and making the page behind them inert are the browser's, not ours. Each form
still wires Esc itself — the browser closes the element, but the form also has
state to drop — and that handler calls `stopPropagation()` so the same keypress
does not also dismiss the view behind it. `embedded-graph.html` — generated by `scripts/embed_demo.py`, never edit. Root docs (`Product Context.md`, `Research backlog.md`) ride along in it as their own `<script type="text/…">` blocks; the backlog is filtered to rows about a **demo persona** so a real project's open questions never ship in the committed build.

## Content components (rendered from Markdown in any entity body)

These live in the detail-page Markdown renderer (`mdToHtml`/`vizBlock`/`inline`
in `09-detail-edit.js`, styled in `05-detail.css`). They need **no packages** —
any `.md` file (competitor, persona, evidence…) can use them, and any AI can emit
them. Use a visual only when the data supports it; an honest gap beats a
decorative chart.

**Fenced visual blocks** — the info string names the type:

| Type | Line format | Renders |
|------|-------------|---------|
| ` ```bar ` (or `share`) | `Label: 31%` | horizontal bar chart (bars scaled to the max value) |
| ` ```stat ` | `Value \| Label \| Source` (2nd/3rd parts optional) | row of stat cards (big number + label + source) |
| ` ```rating ` | `Label: 4/5` | labelled dot-rating rows |
| ` ```timeline ` | `When: What` | vertical timeline |

Unknown fence types fall back to a plain `<pre><code>` block.

**Inline source citations** — `[S1]`, `[S2]` … in prose become clickable
superscript chips that scroll to + flash the Nth item under the page's
`## Sources` list (1-indexed). Keep the sources as a list under a `## Sources`
heading. (Distinct from the inert `[P1]`/`[Q1]`/`[D1]`/`[I1]`/`[C1]` tag refs.)
`scripts/graph_lint.py` flags `[Sn]` chips with no matching source line.
