---
type: 'IdeaForImprovement'
# demo: true   ← optional; marks illustrative/example content. Omit for real data.
title: 'Idea:N <Idea name>'
tags: []
# votes: team request board — one line per person (their Settings `name:`), added
# by clicking the ▲ vote in the app. A block list so parallel votes merge in git.
# Honor system by design (no server): anyone could type a name here, but every
# vote lands in git history — `git blame` shows who really added what.
# Omit the field when nobody has voted. Example:
# votes:
#   - Mateusz
#   - Lena
---

# Idea:N <Idea name>

- **When:** <!-- the user's situation / context -->,

- **I want:** <!-- the expected capability or action -->,

- **So that:** <!-- the goal / benefit it delivers -->.

## Evidence + Signal

<!-- At least one Signal or Evidence is REQUIRED — an idea with no grounding is
     just an opinion (the app's "New idea" form enforces this).
     Optionally group a Signal + Evidence that only make the case TOGETHER into a
     named "tandem": a `**Tandem — <why>:**` line followed by their links. Links
     not under a tandem are standalone. -->

**Tandem — <why these belong together>:**
- [<Signal>](../Signals/<file>.md)
- [<Evidence>](../Evidence/<file>.md)

- [<standalone Evidence or Signal>](../Evidence/<file>.md)

## PM scoring (optional — filled/updated by /prioritize)

<!-- Grounded scoring: every number states where it came from, or is honestly marked
     an estimate. Confidence is DERIVED from the claim Levels of the linked sources
     above — never hand-picked. -->

- **Reach:** <who/how many — must cite an Evidence, e.g. "22.2% of subscribers share accounts [Shared accounts]" — or say `estimate, no data`>
- **Impact:** <expected effect on the linked Pain — 0.25 / 0.5 / 1 / 2 / 3, one line of reasoning>
- **Confidence:** <derived from source Levels: L4–L5 backing → High (1.0) · L3 → Medium (0.8) · L2 → Low (0.5) · L1/none → Very low (0.2)>
- **Effort:** <team estimate, person-weeks — the one input research can't provide; mark `TBD` until the team sizes it>
- **RICE:** <(Reach × Impact × Confidence) / Effort — leave `TBD` while Effort is TBD>
- **Metric to watch:** <the product metric this idea should move, phrased as a checkable query — e.g. "% of sessions with a skip in first 5s" — so /analytics-sync can verify it before and after>
