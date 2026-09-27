# Record of processing activities — template (GDPR Art. 30)

> Template for the deploying organisation. Not legal advice. No warranty.
> Fill the `<…>` fields; the rest is pre-filled from how the tool actually works
> and only needs checking against your install.

## 1. Controller

| Field | Value |
|---|---|
| Controller | `<legal entity, address>` |
| Contact / DPO | `<name, email>` |
| Representative in the EU (if applicable) | `<…>` |
| Processing activity | UX research: qualitative interviews and usability tests, analysed into an internal research knowledge base |
| Record owner | `<research lead>` |
| Last reviewed | `<date>` |

## 2. Purposes and lawful basis

| Purpose | Lawful basis | Note |
|---|---|---|
| Understanding user needs and problems to inform product decisions | `<consent / legitimate interest>` | With legitimate interest, attach your LIA. Recording a session usually rests on consent regardless |
| Deriving personas and research findings from session material | Same as above | Findings are aggregated; the identifying material is the transcript, not the persona |
| AI-assisted analysis of session material | Same as above | The participant must be told this happens — see the information notice |
| Special-category material where participants raise it (Art. 9) | **Explicit consent**, Art. 9(2)(a) | Recorded per session as `special_category:` + `special_category` in `consent_scope` |

## 3. Categories of data subjects

Research participants (`<recruited how: customers, users, prospects, employees>`).
Note anyone else who appears incidentally in a transcript — colleagues, family
members named in an anecdote — they are data subjects too and are usually the
ones nobody remembers to scrub.

## 4. Categories of personal data

| Category | Where it lives | Note |
|---|---|---|
| Session content (verbatim statements, opinions, behaviour) | `Transcripts/` | The bulk of the personal data, in free text |
| Pseudonymous identifier (INT-xx) + coarse profile | `Participants.md`, transcript frontmatter | Age/role/city combinations can re-identify — keep coarse |
| Quotes reused in findings | `Signals/`, `Personas/`, `Archetypes/` | The derived layer people forget when handling an erasure request |
| Linking key (code → real person) | **Outside this repo** — `<your system>` | Whoever holds this holds the re-identification risk |
| Recordings / raw media | **Outside this repo** — `<your system>` | Usually the shortest retention |
| Special-category material | Flagged `special_category:` where present | Art. 9 |
| Team member names (`updated_by`, `author`) | Entity frontmatter | Display name only; the app never writes an email address |

## 5. Recipients

| Recipient | Role | What they receive | Basis |
|---|---|---|---|
| `<model provider>` | Processor | Session text submitted for analysis | DPA + `<zero-retention setting>` |
| `<source tool: Dovetail / Otter / …>` | Processor | Holds the original recording | DPA |
| `<voice / analytics tool>`, if used | Processor | Only what you send | DPA |
| Internal stakeholders | — | Findings and exports | Internal policy |
| `<git host>`, if research is versioned | Processor | Everything committed, permanently in history | DPA + **private repository** |

The tool's own author is **not** a recipient — no data is transmitted to them.
Full technical list: [subprocessors.md](subprocessors.md).

## 6. Transfers outside the EEA

| Transfer | Safeguard |
|---|---|
| `<model provider, if processing outside the EEA>` | `<SCCs / adequacy / EU-region processing>` — see [data-residency.md](data-residency.md) |
| `<other tools>` | `<…>` |

## 7. Retention

| Item | Period | Trigger |
|---|---|---|
| Recordings | `<e.g. 3 months>` | End of study |
| Raw transcripts (identifiable) | `<e.g. 12 months>` | Recorded per file as `retention_until:` |
| Linking key | `<e.g. destroyed at study close>` | **Destroying it makes the remaining material anonymous and stops the clock** |
| De-identified findings (Signals, personas) | `<indefinite once anonymous>` | Out of GDPR scope once genuinely anonymous |

Overdue files are surfaced by `python3 scripts/graph_lint.py`; `/retention`
proposes de-identification before deletion.

## 8. Technical and organisational measures

- Local-first: research is plain files on controlled machines; the app makes no
  network request of its own (enforced by CSP in the shipped file).
- Access control: filesystem and repository permissions; **no in-app RBAC** —
  see [../ACCESS-AND-AUDIT.md](../ACCESS-AND-AUDIT.md).
- Pseudonymisation at intake; local pre-scrub available before any AI processing.
- Secrets in `.env` (gitignored) or an external secret store.
- Guard rails: pre-commit hook blocks unscrubbed transcripts and unmasked email
  addresses; lint flags retention and Art. 9 conflicts.
- Audit trail: git history, plus `updated`/`updated_by` per file.
- `<your disk encryption, endpoint management, backup policy>`
