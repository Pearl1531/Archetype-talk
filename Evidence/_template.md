---
type: 'Evidence'
# demo: true   ← optional; marks illustrative/example content. Omit for real data.
title: 'Evidence #N'
claim: '<what this piece says, in one plain sentence — the AI reads it first to decide whether to open the file>'
tags: [Topic1, Topic2]       # topics, not types — a tag two or more pieces share becomes a folder in the app
source_kind: <survey | analytics | study | report | statistics | community | press>
published: <YYYY-MM-DD or YYYY — when the SOURCE came out; leave empty if unknown, never guess>
population: '<who was measured, where, how many — e.g. "2,000 US adults 18+, online panel"; empty if the source does not say>'
primary_checked: <true | false>   # true only if the figures were read in the original report/data, not in press about it (CLAUDE.md rule 7)
retrieved: YYYY-MM-DD        # when the sources were last verified — refresh after 3 months
# --- optional provenance ---
# source: dovetail | mixpanel | ga4 | web-research
# dovetail_id / query_ref: <insight id, or a short description of the query that produced this>
# dovetail_url: <deep link, if one exists — internal analytics queries usually don't have one>
---

# Evidence #N

<!-- Two readers. The front matter, Key figures and Does not settle are for the
     AI: exact, short, one fact per row. Content and Takeaways are for people:
     free text. The team may mark passages in Content as ==passage=={tag} —
     their emphasis, the same mark as in Transcripts. An AI never adds,
     removes or retags a highlight; it cites highlighted passages first. -->

## Key figures

<!-- Every number the piece carries, with who it is about and where it comes
     from. A figure without its population is never quoted. No numbers in the
     source? Delete this section rather than inventing one. -->

| Figure | Value | Who | Source |
|---|---|---|---|
| <what was measured> | <number + unit> | <population, or "same"> | <source name> |

## Content

<!-- What the source found, in your own words. What was measured, on whom, what number. A fact, not an opinion. -->

## Takeaways

- <!-- Takeaway 1 -->
- <!-- Takeaway 2 -->

## Does not settle

<!-- The honest limit, at least one line: what this source cannot tell you
     (stated intent vs behaviour, another market, an old sample, press not the
     original…). If you cannot write it, you have not understood the source. -->

- <!-- limit 1 -->

## Sources

- <!-- [Title](URL) — kind (press | report | study | statistics | community | analytics), primary or secondary -->
