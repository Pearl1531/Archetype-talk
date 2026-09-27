---
type: 'Transcript'
title: '<INT-xx Participant>'
interview_id: <INT-xx>
participant: '<pseudonymized profile — code, age, role, city>'
method: '<In-depth interview / usability test, remote / in person>'
date: DD.MM.YYYY
# --- data lifecycle — OPTIONAL, and nothing breaks without it ---------------
# Absence means "not recorded", never "not allowed": every skill keeps working,
# the lint says INFO/WARN, and no analysis is blocked. Fill these in when you
# work with real participants; skip them for scratch or demo material.
# Full rationale: docs/DATA-BOUNDARY.md and docs/compliance/.
consent: written          # written | verbal_recorded | none | n/a
consent_ref: 'CONS-2026-014'   # WHERE the signed form lives — a pointer, never the form.
                          # Consent records hold names; they belong in your own
                          # system, not in this repo.
consent_scope: [research, ai_processing, verbatim_quotes]
                          # what the participant actually agreed to. Recognised:
                          # research, ai_processing (an AI may read this text),
                          # verbatim_quotes, external_sharing, voice_synthesis,
                          # special_category (explicit consent under GDPR Art. 9).
                          # Skills check this before doing the matching thing.
lawful_basis: consent     # consent | legitimate_interest | contract | public_task
retention_until: 2027-06-25    # when the clock runs out. /retention proposes
                          # DE-IDENTIFICATION FIRST, deletion only if the text
                          # itself still identifies — findings survive by default.
anonymization: tool_assisted   # none | ai_assisted | tool_assisted | manual_verified
                          # ai_assisted = scrubbed by the model AFTER it read the
                          # raw text (a safety net, not a control);
                          # tool_assisted = a local tool (e.g. Presidio) ran BEFORE
                          # anything left the machine — you run it, this repo ships no scrubber;
                          # manual_verified = a human read it and confirmed.
anonymized_with: 'Presidio 2.2 + human review'   # free text, for the audit trail
anonymized_on: 2026-06-25
key_location: external    # external | destroyed
                          # 'external' = someone can still link this code to a
                          # person, so it stays personal data.
                          # 'destroyed' = that link is gone for good → the file
                          # is anonymous, and the retention clock STOPS. This is
                          # the graduation event, not the deletion.
special_category: []      # [] = checked, none. GDPR Art. 9 material mentioned by
                          # the participant, e.g. [health], [disability], [ethnicity],
                          # [religion], [union], [sexual_orientation], [biometric].
                          # Non-empty raises the bar: needs special_category in
                          # consent_scope, never leaves in a voice call or an
                          # export by default. Flag it, don't drop it — the
                          # finding usually matters (see Tom / dyslexia in the demo set).
# --- scan header — written by /extract-findings when the transcript is filed ---
abstract: <3–4 factual sentences covering every major theme of the session — what the participant does, what hurts, what they asked for, what surprised. This is what gets read INSTEAD of the full transcript during triage, so it must be honest and complete at the theme level.>
topics: []               # kebab-case theme tags, e.g. [library-chaos, shared-account]
same_participant_as:     # optional: '<earlier transcript id>' when this session's participant
                         # is the SAME person as an earlier one (e.g. interview + usability test).
                         # Person-level stats (sample confidence, heard-from) collapse the sessions.
mentions_competitors: [] # EXHAUSTIVE at extraction time: [] means "checked — none mentioned".
                         # Aliases attribute by judgment ("YouTube" → YouTube Music).
                         # Keep in sync with the Competitor files' mentioned_in: lists.
# excluded: true         # optional, researcher's call (usually via the app's "Use in
                         # analysis" switch — e.g. when a session goes stale). The file
                         # stays visible but drops out of sample stats, heard-from counts
                         # and ALL AI analyses/triage. Absence of the field = in use.
                         # Signals already extracted from it do NOT auto-disable —
                         # /graph-lint lists them for the researcher to review.
---

# <INT-xx — Participant>

<!-- Verbatim transcript. Speaker labels stay ("M:" / "P:"); anchor comments
     (<!-- anchor: topic -->) mark moments Signals link back to.
     Team highlights: ==fragment=={tag1, tag2} wraps an important moment
     (added by selecting text in the app — the wrapped verbatim text is never
     altered; quotes are data). Distinct tags are mirrored into a
     `highlight_tags:` frontmatter line by the app. Human-curated: the AI
     treats them as prioritized evidence and never edits them itself. -->

## Observer notes

<!-- Non-verbal observations, context, patterns the recording can't show. -->

<!--
THE SCAN-HEADER CONTRACT (why the fields above exist — and their limits):

The header is a POSITIVE INDEX for cheap triage, so the AI doesn't re-read
every transcript for every question. The triage ladder is:

  1. header  — trust abstract/topics/mentions_competitors to PRIORITIZE files;
  2. grep    — for anything novel or not covered by the header vocabulary,
               full-text-search all transcripts first (cheap, no context cost);
  3. read    — open in full only the files that steps 1–2 surfaced.

Absence of a topic tag is NEVER evidence of absence — new questions the user
asks may touch things nobody tagged, so step 2 is mandatory for novel queries.
The single exception: mentions_competitors is defined as exhaustive at
extraction time, so [] there does mean "checked — none".
-->
