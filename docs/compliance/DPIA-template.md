# Data protection impact assessment — template (GDPR Art. 35)

> Template for the deploying organisation. Not legal advice. No warranty.
> The risks below are pre-filled from how this tool actually behaves, including
> the uncomfortable ones. You assess likelihood and severity for your context,
> decide the measures, and sign.

## Is a DPIA needed here?

Often yes, and it is cheaper to write one than to argue about it. Qualitative
research with AI-assisted analysis usually hits several of the criteria: new
technology, systematic processing of free-text personal data, frequently
special-category material raised by participants, and — where sessions cover
work performance or health — vulnerable-subject considerations. Small sample size
does not exempt you; it makes re-identification *easier*.

## 1. The processing

| Field | Value |
|---|---|
| Purpose | `<why this research exists>` |
| Nature | Recorded interviews / usability tests → transcripts → AI-assisted extraction of findings → personas and product decisions |
| Scope | `<how many participants, how often, which segments>` |
| Context | `<customers / employees / minors? / regulated sector?>` |
| Data | Free-text session content, pseudonymous codes, coarse demographics, sometimes Art. 9 material |
| Technology | Archetype Talk (local, MIT) + `<model provider>` + `<source tools>` |

## 2. Necessity and proportionality

- Could the purpose be met with fewer identifiable data? `<e.g. no recordings, notes only>`
- Is AI-assisted analysis necessary, or convenience? `<state it honestly — this is the question a regulator asks>`
- Data minimisation applied: coarse participant sketches, pseudonymisation at intake, quotes reused only where they carry the finding.

## 3. Risks

Pre-filled with what this tool genuinely exposes. Assess each for your context.

| # | Risk | Why it exists here | Likelihood / severity | Measures available |
|---|---|---|---|---|
| 1 | **Re-identification from a "pseudonymised" transcript** | Verbatim text carries context no name-stripper removes: a role plus a city plus an anecdote. Small samples make this worse | `<…>` | Coarse profiles (rule in `Participants.md`), local pre-scrub, manual verification, destroy the key at study close |
| 2 | **Personal data reaches the model provider before any scrub** | The built-in scrub runs *after* the model reads the text — it is a safety net, not a control | `<…>` | Local pre-scrub (e.g. Presidio) before intake; manual redaction; DPA with zero retention; EU-region processing |
| 3 | **Special-category data (Art. 9) collected without explicit consent** | Participants volunteer health, disability, religion unprompted — it is often the sharpest finding | `<…>` | `special_category:` flag; lint errors when the consent scope does not cover it; the flag never travels into voice or exports by default |
| 4 | **Erasure is defeated by git history** | Committed transcripts stay retrievable from old commits in every clone and fork | `<…>` | Opt-in pre-commit gate on scrub state; private repos; keep raw sessions out of git; destroy the key so residue is anonymous; history rewrite as a last resort |
| 5 | **Findings survive their source, so the graph over-claims** | Deleting a transcript can leave a persona standing on evidence nobody can check | `<…>` | `/forget-participant` re-grades affected claims and reports level drops; `graph_lint` flags signals citing a missing transcript |
| 6 | **Data spreads beyond the folder** | Exports, tickets, drafts in browser storage, generated audio, sent PDFs | `<…>` | Egress table; Settings ▸ Clear local data; the erasure skill enumerates unreachable copies |
| 7 | **Third-country transfer** | Model, voice and analytics providers may process outside the EEA | `<…>` | EU-region endpoints, SCCs, or drop the optional services entirely |
| 8 | **Unauthorised access on a shared machine** | Access control is filesystem-level; any local process can read the folder and `.env` | `<…>` | Disk encryption, endpoint management, per-client separate folders/repos, secrets outside the project |
| 9 | **Participant data confused with AI output** | A synthetic persona reply could be mistaken for something a real person said | `<…>` | Structural: persona conversations never create data; L1–L5 levels on every claim; `author: AI` on AI-written entries; `demo:` badges |

## 4. Measures already built in (verifiable, not claimed)

- No outbound network call on open; CSP inside the shipped file; both optional
  egress paths off by default.
- Lifecycle recorded in the data: consent, scope, retention, anonymisation state,
  Art. 9 flags.
- Rights implemented: `/forget-participant`, `/subject-access`, `/retention`,
  backed by `scripts/participant_trace.py`.
- Mechanical guards: pre-commit gate (scrub state, email addresses), lint checks
  (retention overdue, Art. 9 vs consent scope, unmasked emails, orphaned sources).
- No destructive action without a human decision.
- Reproducible build + CI proving the shipped artifact matches its sources.

## 5. Outcome

| Field | Value |
|---|---|
| Residual risk after measures | `<low / medium / high>` |
| Prior consultation with the supervisory authority needed? | `<yes/no — required if high risk remains>` |
| DPO opinion | `<…>` |
| Decision and date | `<…>` |
| Review date | `<…>` |

Re-run this assessment when: the sample grows substantially, a new source or
model provider is connected, sessions start covering Art. 9 material routinely,
or the repository's visibility changes.
