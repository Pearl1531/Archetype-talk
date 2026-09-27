---
name: subject-access
description: Answer a participant's "what do you hold about me?" — collect everything traceable to one person into a readable bundle (GDPR Art. 15 access, Art. 20 portability). Use on /subject-access or when a participant asks for their data.
---

# subject-access — what we hold about one person

A participant asks what you have on them, or asks for a copy. This is the same
mechanical trace `/forget-participant` uses, run in the opposite direction:
nothing is modified, everything traceable is gathered.

## Trigger

```
/subject-access INT-06
```

## Workflow

1. **Trace.** `python3 scripts/participant_trace.py <CODE>` — the inventory of
   every file that traces back to this person, including second-degree
   references and derived caches.
2. **Assemble** `docs/access/ACCESS-<CODE>-<YYYY-MM-DD>.md`, in plain language a
   non-researcher can read, not a file dump:
   - **What we hold**: the session(s), when, in what form, and why (the research
     purpose).
   - **Their own words**: the verbatim quotes we kept, each with where it is used.
   - **What we concluded**: the Signals derived from the session and which
     personas they feed — people are often more interested in this than in the
     raw text, and it is squarely within Art. 15.
   - **Who has seen it**: which exports or tickets included their material, if
     any; the processors involved (model provider, and voice/analytics tools if
     they were used on this material).
   - **Retention**: the date, and what happens then.
   - **Their rights**: rectification, erasure, objection, and how to exercise
     them with you.
3. **Attach the source** if asked for a copy (Art. 20): the transcript itself,
   as Markdown.
4. **Hand it to the researcher, never to the participant.** The skill produces a
   draft; a human checks it and sends it. Never email anything.

## Rules

- **Read-only.** This skill changes nothing in the graph.
- **Other people's data stays out.** A transcript may name a colleague, a partner,
  a child. Those are someone else's personal data — redact them from the bundle;
  the requester's right of access is not a right to third parties' data.
- **Don't hide the derived layer.** "We only have a transcript" is usually false
  — the interesting part is the Signals and the personas they support. Include them.
- **One participant may have several sessions** — check `same_participant_as`.
- **Keep a record of the request** alongside the bundle (date, what was sent),
  without adding new personal data to the repo.
