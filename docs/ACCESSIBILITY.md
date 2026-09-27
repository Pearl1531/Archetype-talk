# Accessibility statement

**Scope:** the browser app, `app/index.html` (v0.9.0).
**Target:** WCAG 2.2 level AA — the technical basis of EN 301 549, which EU public
procurement asks for.
**Status: partially conformant.** Known gaps are listed below rather than
smoothed over; a statement claiming full conformance without an audit trail is
worth nothing to the people who need it.
**Self-assessed** by the maintainer on 2026-07-25, by inspection and scripted
checks (no external audit, no assistive-technology user testing).

## What was checked, and what it showed

| Check | Result |
|---|---|
| Page language declared (`<html lang>`) | Pass |
| Landmarks (`nav`, `main`, `aside`, `footer`) and a skip link | Pass |
| Accessible name on every visible control (37 buttons at the time of testing) | Pass |
| Form fields labelled | Pass |
| Images carry `alt` | Pass |
| Body text contrast | Pass — 15.7:1, far above the 4.5:1 minimum |
| `prefers-reduced-motion` honoured | Pass |
| Visible focus indicator | Pass — a dedicated focus ring token, not the default outline suppressed |
| Complex graphics have a text alternative | Pass since 0.9.0 — the Mind Map and Flow diagrams expose `role="img"` with a summary naming entity counts per column and link count |
| Zoom / reflow to 320 px | Pass — responsive layout, no horizontal scrolling of the page body |
| Heading order | **One known skip** (h1 → h3 on some views) |
| Keyboard operation of the graph canvas | **Known gap** — see below |
| Screen-reader user testing | **Not done** |
| External audit | **Not done** |

## Known gaps

**1. The Mind Map / Flow canvas is not keyboard-operable.** Panning, zooming and
node selection are pointer gestures (drag, wheel, click). A screen-reader or
keyboard-only user gets the diagram's summary — how many entities of each type,
how many links — but cannot walk the graph inside the canvas.

*The equivalent, and it is a full one:* every entity, every link and every
attribute in that diagram is also reachable as text. The type tabs list all
entities, each detail page lists that entity's links as ordinary hyperlinks, and
the table view exposes the same data as a sortable table. Nothing exists only in
the canvas. This is the WCAG "conforming alternate version" route, not a
workaround — the diagram is a second, faster way to read data that is fully
available in text form.

**2. One heading-level skip (h1 → h3).** Cosmetic for most users, mildly
disorienting when navigating by headings. Scheduled, not urgent.

**3. In-place editing needs Chrome or Edge** (File System Access API). This is a
browser-capability limit rather than an accessibility barrier — Firefox and
Safari users get the read-only view with all content available — but it does
narrow the choice of browser for editing, which matters if your assistive setup
is tied to a specific one.

**4. No assistive-technology user testing.** Everything above is inspection and
scripted checking. Inspection catches missing labels; it does not catch a flow
that is technically labelled and practically unusable. If you use a screen
reader with this tool, a report of what actually breaks would be more valuable
than anything else on this page.

## Feedback

Accessibility problems: open a GitHub issue, or use the contact in
[SUPPORT.md](SUPPORT.md). There is one maintainer and no SLA — see that page for
what response times realistically look like. Reports that name the assistive
technology, browser and the step that failed get fixed fastest.

## For procurement

- This is MIT-licensed software with no vendor behind it; there is no VPAT and no
  commercial accessibility warranty. This statement is the honest equivalent.
- The gaps above are stated so you can judge them against your own obligations
  rather than discovering them after adoption.
- The text alternative for the graph views (gap 1) is the point most reviewers
  ask about, so it is spelled out above in the terms a reviewer needs.
