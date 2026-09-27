# Participant information & consent — template (GDPR Art. 13)

> Template for the deploying organisation. Not legal advice. No warranty.
> Two parts: a written notice to send with the invitation, and a short script to
> read at the start of the session. Replace every `<…>`.

---

## Part 1 — Written notice (send before the session)

**Who we are.** `<Organisation>`, `<address>`. Questions about your data:
`<contact / DPO email>`.

**What we're doing.** We're running a `<interview / usability test>` of about
`<45>` minutes to understand how people `<use X / deal with Y>`. There are no
right answers and nothing is being tested about you — we're testing our product.

**What we record.** `<Audio / audio and screen>`, plus notes. From the recording
we produce a written transcript.

**How we use it.** We read the session and pull out findings — problems,
motivations, direct quotes — which feed internal research documents (including
composite "personas" that summarise patterns across several people). **We use AI
assistance to help analyse session text**: the transcript is processed by
`<model provider>` under a contract that `<does not allow your data to be used
for training / applies zero retention>`. A person reviews everything the AI
produces.

**Your name.** We replace it with a code (e.g. `INT-04`) before analysis, and we
avoid recording details that would identify you. Quotes we keep are your words,
with identifying details removed.

**Lawful basis.** `<Your consent / our legitimate interest in improving our
products — see below>`. If we discuss anything about `<health, disability, or
other sensitive matters>`, we rely on your **explicit consent** for that, and you
can decline that part while continuing the session.

**Who sees it.** The `<research and product>` team at `<Organisation>`. Our
processors: `<model provider>`, `<recording tool>`, `<any others>`.
`<If applicable: some of these process data outside the EEA, under
<SCCs / adequacy decision>.>`

**How long we keep it.** Recording: `<3 months>`. Transcript with identifying
detail: `<12 months>`. After that we either delete it or remove the link between
the material and you permanently — once that link is gone, what remains is
anonymous and is kept as research.

**Your rights.** Access a copy of what we hold, correct it, have it deleted,
object to the processing, or withdraw consent at any time — including during or
after the session, with no reason and no consequence for `<payment /
incentive / your relationship with us>`. Contact `<email>`. You may also complain
to `<supervisory authority>`.

**Withdrawal.** If you withdraw, we delete the recording and transcript and
remove your quotes from our findings. Where a conclusion has already been drawn
from several sessions, the anonymous conclusion may remain — nothing traceable to
you does.

---

## Part 2 — Script for the start of the session

> Read it, don't paraphrase from memory. Record the answer, and record it in the
> transcript's frontmatter (`consent`, `consent_scope`, `consent_ref`).

"Before we start, a few things about how this is recorded.

I'd like to record `<audio>` so I don't have to take notes the whole time. From
that I make a written transcript, and I use **AI assistance to help analyse it** —
so the text of what we say goes to `<model provider>` under our data agreement. I
replace your name with a code first, and a person reviews everything the AI
produces.

I might quote you in our internal findings — your words, but with anything
identifying taken out. We keep the recording about `<3 months>` and the
transcript about `<12 months>`.

You can stop at any point, skip any question, or tell me afterwards you'd rather
I didn't use something — that's completely fine and `<the incentive is unaffected>`.

Is that all OK? — And is it OK if I record?"

**Then, if the session may touch sensitive ground** (health, disability,
accessibility needs, religion, anything under Art. 9):

"One more thing — if we get into anything about `<your health or an accessibility
need>`, that's a more sensitive category and I need your explicit OK to write it
down. It's genuinely useful for us to know, but say the word and I'll leave it
out."

**Record afterwards** in the transcript frontmatter:

```yaml
consent: verbal_recorded
consent_ref: '<where the recording of the consent lives>'
consent_scope: [research, ai_processing, verbatim_quotes]   # + special_category if given
retention_until: <date>
```

## Notes for the researcher

- **Consent to record ≠ consent to AI processing.** If you don't mention the AI
  step, `ai_processing` is not covered. This is the sentence people skip.
- **Explicit consent for Art. 9 material is separate**, and it can be given
  mid-session — that's what the second paragraph is for. If it isn't given, keep
  the finding out rather than filing it quietly.
- **Consent forms hold names, so they stay out of this repo.** Only the pointer
  (`consent_ref`) goes in the frontmatter.
- **Withdrawal is easy to honour**: `/forget-participant <CODE>`.
