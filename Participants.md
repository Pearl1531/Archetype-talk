# Participants — sample coverage registry

Pseudonymized registry of research participants, maintained by `/extract-findings` (Step 7). Its job: make **sample coverage visible** — which archetypes rest on several independent voices and which still hang on one interview. Used by `/interview-guide` to say who to recruit next.

> **Pseudonyms only, ever.** Codes (INT-xx / P-xx), never real names, employers, or contact details. The PII scrub in `/extract-findings` Step 0 happens before a participant reaches this table.
>
> **Pseudonymised is not anonymous.** As long as anyone can still link a code back to a person — a recruiting list, a calendar invite, an incentive payment — these rows are personal data under GDPR Art. 4(5), and the usual obligations apply. Treat "INT-06" as a name, not as a redaction.
>
> **Keep the segment sketch coarse.** It exists to show sample coverage, not to describe an individual. A useful test before writing a row: *would at least three people in this sample match this description?* "34, HR, mom of two, Denver" fails it — age plus role plus city plus family situation identifies one person to anyone who knows the recruiting round. Prefer the attributes that actually drive the archetype ("family account, one profile shared with kids") and drop the rest. Same rule for the `participant:` line in a transcript's frontmatter.

## Registry

| Code | Date | Segment sketch | Matched Archetype(s) | Produced |
|------|------|----------------|----------------------|----------|
| INT-01 | 12.06.2025 | 29, marketing specialist, Chicago — daily background listener, shared account | The Utility Listener, The Algorithm Drifter, The Library Hoarder | Signals → Emma |
| INT-02 | 14.06.2025 | 23, student, Boston — social discovery, price-sensitive | The Social Curator, The Value Auditor | Signals → Jake |
| INT-04 | 19.06.2025 | 34, HR, mom of two, Denver — family use on one account | The Algorithm Drifter (family variant) | Signals — persona not yet built |
| INT-05 | 20.06.2025 | 35, engineer, Seattle — 1h daily commute | The Utility Listener | Signals — persona not yet built |
| INT-06 | 25.06.2025 | 41, sales rep, Portland — 2–3h driving daily, voice-first | The Voice-First Driver | Signals → Tom |
| INT-07 | 27.06.2025 | 27, graphic designer, Brooklyn — vinyl collector, active explorer | The Passive Discoverer / curator segment | Signals — persona not yet built |
| TEST-03 | 18.06.2025 | moderated Smart Shuffle test — **same participant as INT-07 (Zoe)**, profile match | (usability test) | Signals |

*(Demo rows — mirror the example `Transcripts/` set; replace with your own as real sessions come in. These sketches are deliberately chatty because the participants are invented and the example has to read clearly; for real people, apply the minimisation test above and write less.)*

## Coverage read (update alongside the table)

- **Well-fed:** The Utility Listener (INT-01, INT-05; plus TEST-03 test observations — same person as INT-07, so not an extra voice)
- **Single-voice (recruit next):** The Voice-First Driver (INT-06 only), family-account segment (INT-04 only), curator segment (INT-07 only)
