---
type: 'Competitor'
# demo: true   ← optional; marks illustrative/example content. Omit for real data.
title: <Competitor name>
tags: []
retrieved: YYYY-MM-DD   # when the sources were last verified — refresh after 3 months
proximity:              # direct | adjacent | indirect — market proximity for the app's competitor map.
                        #   direct   = SOM: fights for the SAME customer segment we researched
                        #   adjacent = SAM: same product category, different segment/geo we could serve
                        #   indirect = TAM: competes for the same need/time with a different product
                        # Researcher judgment — add one line of reasoning as a comment. See Competitors/README.md
picture:                # optional icon for map/cards/detail — best as an inline base64 data URI (data:image/png;base64,…) so it works offline; fetch via the app's "Fetch favicon" button, upload manually, or ask the AI (see persona-avatar skill). Initials tile when empty
mentioned_in: []        # DISTINCT transcripts that mention this competitor — one entry per participant,
                        # no matter how many times they said the name. Maintained by /extract-findings
                        # (aliases and product-family names count by judgment, e.g. "YouTube" → YouTube Music).
                        # This is the strength-among-our-participants measure the app's map uses
---

# <Competitor name>

> ⚠️ Competitor context is **opt-in** in persona conversations (`/persona-talk --competitors`
> or `[competitors on]`). By default the persona talks without this knowledge.

<!-- One plain sentence on what this product is — the app shows it under the name on the Competitors list. -->

## Market position

<!-- Market share / subscriber numbers — public data only, with a link. -->

## Features vs Spotify

<!-- What they have that Spotify doesn't (or vice versa). Facts, not marketing. -->

## Comparison

<!-- Feeds the app's side-by-side Compare view. Rows = the categories in
     Product Context.md frontmatter (`compare_categories:` — chosen at project
     setup; only axes that move THIS project's decisions, no vanity metrics).
     One row per category, verified sourced claims only — if a category can't
     be verified, LEAVE THE ROW OUT (the app shows an honest research gap).
     No `|` characters inside a cell. -->

| Category | Where they stand |
|---|---|
| <category> | <verified claim, with a source link> |

## User voices

<!-- Real opinions: community threads, reviews — with links. Include the negative ones. -->

## What this means for our personas

<!-- Which personas/segments might be tempted and why — link Signals if any. -->

## Sources

- <!-- full list of links -->
