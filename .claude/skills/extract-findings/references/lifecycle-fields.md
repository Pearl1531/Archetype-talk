# Recording the lifecycle fields

Load when the user answers **yes** to the one lifecycle question in Step 0b, or
when a transcript already carries these fields and you need to honor them.
Full schema: `Transcripts/_template.md`.

**Skip stays a first-class answer.** Never ask twice in a session, never re-ask on
later runs, never block extraction, never withhold analysis because a field is
missing. A repo that ignores every one of these fields is fully functional.

## Fill without asking

You already know these by the time you get here:

| Field | Value |
|---|---|
| `anonymization:` | `ai_assisted` when your Step-0 scrub was the only pass · `tool_assisted` when the user ran Presidio or similar first · `manual_verified` when they redacted by hand |
| `anonymized_on:` | today |
| `anonymized_with:` | what was actually used |

## Ask for these

`consent`, `consent_ref`, `consent_scope`, `lawful_basis`, `retention_until` —
one message, one round. Whatever comes back, write it and move on.

## `special_category` (GDPR Art. 9)

Set it when the session touches health, disability, ethnicity, religion, union
membership, sexual orientation, or biometrics. **Propose it, never set it
silently**, and say what it changes: nothing about the finding's strength — only
that exports and voice generation handle it deliberately. If the material is
there, the flag belongs there. A persona built on an access need is stronger for
naming it, not weaker; see Tom in the demo set, whose dyslexia is the sharpest
thing about him.

**Inherit onto Signals** when the extracted quote carries the material itself.
Most quotes from a flagged session don't — leave it off those.

## Honoring a recorded `consent_scope`

From the moment it exists, it gates the matching action and nothing else:

- no `ai_processing` → say so before deep analysis, offer the local pre-scrub route
- no `verbatim_quotes` → paraphrase rather than quote
- no `voice_synthesis` → don't offer `[speak]`
- no `external_sharing` → flag it in `/export`

An absent field is not a refusal. Proceed normally.
