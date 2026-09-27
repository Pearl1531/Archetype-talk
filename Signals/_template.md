---
type: 'Signal'
# demo: true   ← optional; marks illustrative/example content. Omit for real data.
title: <Signal title>
tags: []
affinity: ''            # product-specific theme group (affinity diagram) — set by /affinity or the app
# affinity_lock: true   # set when a HUMAN curates this signal's group; the AI then only suggests, never moves it
evidences: []   # titles of related Evidence, e.g. ['Smart Shuffle complaints']
competitors: []   # optional: titles from Competitors/, if the participant mentioned a competitor
# --- optional: how this participant stood toward a specific feature ---
# sentiment:
#   feature: <the function this is about — a compare_categories axis or a Product Context feature>
#   stance: frustrated        # one value from the ladder below
#   because: '<the observable that justifies it — what they said or did, not how you read it>'
#   unprompted: true          # did the PARTICIPANT name this feature before the moderator did?
#
# `unprompted` is the focusing-illusion flag, and it is worth more than it looks.
# Asked directly about anything, people overweight it — "nothing is as important as
# you think it is while you are thinking about it". A stance the moderator elicited
# is real, but its INTENSITY is inflated by the question itself; a stance the
# participant volunteered survived the competition for their attention.
# Read it off the transcript's `**M:**` / `**P:**` turns: who put this topic on the
# table first? Not sure → leave the field out. If they volunteered a much stronger
# statement inside an answer to a milder question, that belongs in `because:`.
#
# The ladder, negative to positive. Each label names an OBSERVABLE, not a feeling,
# so it can be checked against the transcript instead of felt:
#
#   dealbreaker   said they would leave / stop using over it
#   resents       returns to it unprompted, with anger
#   frustrated    it annoys them, they live with it
#   wary          assumes up front it won't work
#   indifferent   ASKED, and demonstrably didn't care  ← a finding, not a gap
#   unaware       never encountered it                 ← a coverage gap, not a finding
#   curious       interested, hasn't used it
#   appreciates   likes it, wouldn't fight for it
#   relies_on     part of the routine, would notice it gone
#   advocates     recommends it unprompted
#   mixed         genuinely both ways at once — NOT the middle of the scale
#
# Rules that keep this honest:
# - **No field means "not observed"** — never "neutral". Don't default to a middle.
# - **The order is for display, never for arithmetic.** These are named states, not
#   scores: never average them, never sum them, never convert them to numbers to rank.
# - **`mixed` is not the middle.** The middle is `indifferent`. `mixed` means strong
#   in both directions about the same feature, and needs either two signals or one
#   openly ambivalent statement. Two contradicting participants stay two signals.
# - **`unaware` belongs in `Research backlog.md`**, not in a persona: it says
#   something about our coverage, not about the person.
# - **Irony and sarcasm are the known failure mode.** Ambiguous tone → leave the
#   field out and write the question down instead of guessing.
# special_category: [health]   # optional — set when the quote itself carries GDPR
                # Art. 9 material (health, disability, ethnicity, religion, union
                # membership, sexual orientation, biometrics). Inherit it from the
                # source transcript. It does NOT weaken the signal: the finding
                # stays, it just travels with a flag so /export and persona-voice
                # handle it deliberately rather than by accident.
# --- optional provenance (when imported from Dovetail via /dovetail-sync) ---
# source: dovetail
# dovetail_id: <highlight id>
# dovetail_url: <deep link>
---

# <Signal title>

<!-- What signalled that something is off with a feature/service? A single observation
     from a test or interview. Two variants — pick one:

     QUOTE variant (default): the observation carries a verbatim user quote.
     OBSERVATION variant: what you SAW, not what was said — field studies, usability
     tests, and hardware sessions often produce behaviour without a usable quote
     (e.g. "participant took both gloves off to type a 4-character search").
     Describe the observed behaviour factually, note the situation/environment
     (in the car, gloves on, noisy room), and link any session media. -->

> "<user quote, if any — keep it verbatim, in the original language>"

<!-- OR, for the observation variant (delete the blockquote above):
**Observed:** <factual description of the behaviour — no interpretation>
**Situation:** <context/environment it happened in>
**Media:** <optional link(s) to photo/video/audio in Transcripts/media/ — keep large
binaries out of git unless deliberately reviewed in> -->

## Interview date

DD.MM.YYYY

## Transcript

<!-- link to the full transcript, session notes, or recording -->
