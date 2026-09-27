# Compliance pack

> **Templates for the deploying organisation. Not legal advice. No warranty
> (MIT — see [LICENSE](../../LICENSE)).**

Everything here is pre-work, not a promise. Archetype Talk is software you run on
your own machine; the obligations belong to whoever decides to process research
data with it. These documents exist so that "we need a ROPA entry / a DPIA / a
subprocessor list" doesn't mean starting from a blank page.

| Document | What it is | Who finishes it |
|---|---|---|
| [subprocessors.md](subprocessors.md) | Every path data can take out of your machine, what triggers it, and its default | Ready to use as-is |
| [ROPA-template.md](ROPA-template.md) | Record of processing activities (GDPR Art. 30) | You add identity, purposes, and your own retention decision |
| [DPIA-template.md](DPIA-template.md) | Data protection impact assessment (Art. 35), risks pre-filled from how the tool actually works | You assess, decide and sign |
| [participant-information-notice.md](participant-information-notice.md) | What you tell a participant (Art. 13) + a consent script for the start of a session | You fill in your organisation's details |
| [ai-system-card.md](ai-system-card.md) | Purpose, limits, transparency and oversight, for AI-governance reviews and the EU AI Act | You classify it for your context |
| [data-residency.md](data-residency.md) | Keeping model processing inside the EU, and what to do about the optional services | You choose the provider and verify |

## Who is who

This is the question that decides everything else, and it has an unusually clean
answer here.

| Role | Who | Why |
|---|---|---|
| **Controller** | Your organisation | You decide why and how the research data is processed |
| **Processor** | Your model provider; any source, analytics or voice tool you connect | They process on your instructions — contract with each directly |
| **Neither** | **The author of Archetype Talk** | Ships MIT-licensed code. Operates no server, receives no data, has no account system, no telemetry and no way to reach your files |

**There is no DPA to sign with the author, because nothing is transmitted to the
author.** If a vendor questionnaire has a field for it, that sentence is the
answer. The DPAs you need are with the parties in
[subprocessors.md](subprocessors.md) — the ones you actually connect.

## What the tool gives you, mechanically

Not documents — working controls a reviewer can test:

- **Nothing leaves on its own.** The app makes no network request when opened;
  both optional outbound paths are off by default and enforced by a
  Content-Security-Policy inside the shipped file.
- **Data-subject rights have an implementation**, not just a promise:
  `/forget-participant` (Art. 17), `/subject-access` (Art. 15/20), `/retention`
  (Art. 5(1)(e)) — each backed by `scripts/participant_trace.py`, which finds
  every file that traces back to one person.
- **Lifecycle state is recorded in the data itself** — consent, scope, retention
  date, anonymisation state, Art. 9 flags — see
  [Transcripts/_template.md](../../Transcripts/_template.md).
- **Guard rails run mechanically**: `graph_lint` flags overdue retention, an Art. 9
  conflict with the recorded consent scope, and any unmasked email address; an
  opt-in pre-commit hook stops an unscrubbed transcript or an email address from
  entering git history.
- **Nothing is deleted silently, ever.** Every destructive step is proposed and
  waits for a human.

## The honest limits

State these in your assessment rather than discovering them later:

- **Pseudonymisation is not anonymisation.** While anyone can still link a code to
  a person, the files are personal data. See [../DATA-BOUNDARY.md](../DATA-BOUNDARY.md).
- **The AI scrub happens after the model has read the text.** It is a safety net.
  Local pre-scrubbing before anything leaves the machine is the real control.
- **Git history is effectively permanent.** Erasure from history is a deliberate,
  coordinated act, not a command this tool runs for you.
- **Access control is filesystem-level.** No RBAC, no in-app permissions — see
  [../ACCESS-AND-AUDIT.md](../ACCESS-AND-AUDIT.md).
