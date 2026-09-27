# AI system card

> Template for the deploying organisation. Not legal advice. No warranty.
> Written for AI-governance reviews and for the EU AI Act. Most of what a review
> asks for already exists as a mechanism in this repo; this page names those
> mechanisms in the vocabulary the reviewer uses.

## What it is

Archetype Talk is a **research knowledge base you can interrogate**. It stores UX
research as linked Markdown files and uses a general-purpose model (whichever you
wire in) to do three things: help turn transcripts into structured findings,
answer questions about the material with citations, and speak "in character" as a
persona built from that material.

Under the AI Act you are a **deployer** of an AI system built on a general-purpose
model. The model provider carries the GPAI-provider obligations; you carry the
deployer ones. The author of this tool is neither — no model is trained,
fine-tuned or served here.

## Intended purpose

Rehearsing and interrogating research your team already gathered: finding what is
weakly evidenced, preparing better interview questions, comparing a feature idea
against several personas, and keeping every claim traceable to a source.

## Out of scope — do not use it for these

Stated plainly, because these are the uses that would change its risk
classification:

- **Any decision about a specific person** — hiring, performance, credit,
  insurance, education, access to services. This system produces composite
  patterns, not judgements about individuals.
- **A substitute for talking to real users.** Persona output is a synthesis of
  existing evidence, never new evidence.
- **Emotion inference, biometric categorisation, or profiling of identified
  individuals.**
- **Producing findings for external publication as if they came from participants.**
  Synthetic replies are not data.

Used as intended, this sits in the AI Act's minimal-risk band: it does not appear
in Annex III, it makes no decision with legal or similarly significant effect,
and a human approves every write. Used for the first bullet above, that changes —
which is precisely why it is written here.

## Transparency (AI Act Art. 50) — the mechanisms that already exist

| Requirement | How it is met | Where |
|---|---|---|
| AI-generated content is identifiable | Hypotheses distilled by the AI carry `author: AI (Claude) — approved by <name>`; a human-created one carries a name and a masked email | `Hypotheses/`, app's hypothesis form |
| Users know they are interacting with an AI | The persona is a documented synthesis; the interface labels demo personas, and the researcher-context block states the grounding behind each answer | `/persona-talk` |
| Confidence is not overstated | Every claim carries a level, L1 (assumption) to L5 (validated + correlated), shown in conversation; a persona built on one interview says so | `references/levels.md` |
| Illustrative content is separated from real research | `demo: true` files form a separate workspace with a visible badge and are excluded from real-project analysis | `/demo-data` |
| Output is not passed off as research data | Structural, not advisory: **a persona conversation never creates a Signal or Evidence file** — only research questions, or an L1 hypothesis with explicit approval | Hard rule 1, `CLAUDE.md` |

## Human oversight

Oversight here is architectural rather than a review step bolted on:

- Every file write is proposed and waits for a human yes.
- Promoting a hypothesis to an Idea (assumption → grounded bet) is always a
  human click, never automatic.
- Links between entities are never silently rewired; `/graph-lint` proposes.
- Erasure and retention actions are proposed with their consequences spelled
  out — including which claims lose grounding — and never executed unilaterally.
- The AI is instructed to answer "I don't know" and route to the research backlog
  rather than fill a gap.

## Limitations, stated for the record

- **Persona replies are a synthesis of existing evidence.** They cannot discover
  anything new, and they inherit every bias in the sample.
- **Small samples stay small.** A persona resting on one interview is one
  interview's worth of knowledge, however fluent it sounds.
- **The model can still be wrong** about what the material says. Citations exist
  so you can check; check them when a decision rests on it.
- **Freshness is not correctness.** The 3-month flag says data is old, not wrong.
- **Language.** The repo ships in English and adapts at runtime; quotes stay in
  their original language, which can mean mixed-language material in one file.

## Data governance

Training data: none — no model is trained or fine-tuned. Input data: your own
research files, processed by your chosen provider under your DPA. See
[subprocessors.md](subprocessors.md), [data-residency.md](data-residency.md) and
[../DATA-BOUNDARY.md](../DATA-BOUNDARY.md).

## AI literacy (AI Act Art. 4) — the 5-minute version for a team

Art. 4 asks that people using an AI system understand it well enough to use it
sensibly. For this tool that comes down to four things:

1. **Read the level before the sentence.** L1 is a guess, L4/L5 is evidence.
   A confident-sounding reply at L1 is still a guess.
2. **A persona is a composite, not a person.** It cannot tell you anything its
   sources don't contain — "I don't know" is a correct answer, not a failure.
3. **Talking to a persona produces questions, not findings.** If you want a new
   fact, the output is an interview, not a longer conversation.
4. **Check the citation when it matters.** Every claim links to its source; a
   decision worth making is worth one click.

Record who received this and when, if your governance process wants evidence of
Art. 4 compliance.

## Review

Revisit this card when: the model provider changes, a new AI-driven skill is
added, the system starts being used for a purpose in the out-of-scope list, or
the AI Act's applicable obligations change for your organisation's role.
