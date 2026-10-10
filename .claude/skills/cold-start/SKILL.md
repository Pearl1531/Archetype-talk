---
name: cold-start
description: Founding-brief protocol for a project with ZERO research data — no transcripts, no reports, empty Inbox. Interviews the founder and plans the first research round. Runs ONLY when the user explicitly invokes /cold-start.
---

# cold-start — Founding brief for a zero-data project

Start a research project from literally nothing: no transcripts, no reports, an empty `Inbox/`. Interview the founder about their startup, capture what's needed for reliable desk research, and convert their beliefs into testable L1 assumptions — without ever letting a founder's declaration masquerade as a finding.

**Language:** facilitate in the user's language; the files you write follow the repo's conventions.

## Trigger

```
/cold-start        ← the only way in. Never auto-run, never suggest-and-start.
```

- This is a **consciously invoked option**. The SessionStart hook may *mention* it exists when the project has zero data — mentioning is the ceiling; the user must type it.
- Requires nothing: works with a completely empty project. If real Signals/Transcripts already exist, say so and ask whether they really want the founding-brief flow (it can still be useful to backfill `Product Context.md` and surface untested assumptions).

---

## The one rule that governs everything

**The founder is a primary source about the *product*, and an assumption source about the *users*.**

| Founder tells you… | It is… | It goes to… |
|---|---|---|
| what the product is, its stage, pricing, features that exist | product fact (they built it) | `Product Context.md` |
| who the target group is, what problem users have, what they'd pay | **L1 assumption** — a lead, not proof | `Hypotheses/` + `Research backlog.md` + the *Founding assumptions* section of `Product Context.md` |
| numbers/stats (incl. anything in a pitch deck) | founder claim until re-verified | `Evidence/` **only after** you verify the original external source per `/researcher` rules; otherwise it stays an L1 assumption |
| competitor names | pointers | `Competitors/` stubs via the existing `needs_research` flow |

Never create a `Signals/` or `Evidence/` file from a founder's declaration about users. A Signal exists only after a real interview/test (`/extract-findings`); Evidence only with a real, linkable external source. This is what keeps the graph honest when it's one week old.

---

## Facilitation rules

Same style as `/persona-workshop`: **one question at a time**, reflect each answer in one sentence before the next question, probe vague answers, don't rush. Two additions:

1. **Label assumptions out loud.** When the answer is a belief about users ("our target group is freelance designers"), reflect it back explicitly as an assumption: *"Recording that as an assumption to validate — not a finding."* The founder should hear the epistemic status of their own words.
2. **Hunt for the falsifiable core.** Every belief gets the silent follow-up: *how would we know if this is wrong?* That phrasing becomes the hypothesis/backlog entry.

---

## Question protocol

Ask in order; skip what the founder already volunteered. Reflect, then move on.

1. **What is it?** — the project in 1–2 sentences; stage (idea / prototype / MVP / live); what exists today that a user could touch.
2. **Value proposition** — what problem, for whom, why now, what's different from the obvious alternative. Ask for the exact sentence they'd say to a customer — verbatim, it's their positioning claim (an assumption, not data).
3. **Existing materials** — pitch deck, landing page, one-pager, competitor teardown? Ask them to drop files into `Inbox/`. Read them as *founder claims*: any external stat cited inside (market size, churn benchmarks) is re-verified at its original source before it may become `Evidence/`; unverifiable numbers stay founder assumptions.
4. **Target group** — who do they *think* it's for; segments and priority; who it is explicitly NOT for. ⚠️ This is the answer most likely to be treated as fact by everyone in the room — it never is. It becomes hypotheses and recruiting criteria, nothing more.
5. **How do they know the problem is real?** — own experience, past conversations, support tickets at a previous job? Anecdotes are leads for the backlog, not Signals — a remembered conversation can't be quoted verbatim, so it can't be data. If they ran actual interviews before, those transcripts go to `Inbox/` → `/extract-findings` (the normal pipeline takes over for that part).
6. **Alternatives & competitors** — named products *and* non-consumption ("Excel and a notebook"). Each named competitor → a `Competitors/` stub with `needs_research: true`, then follow the standard convention: ask whether to run initial desk research now, offering a 1/2/3-year lookback window. While here, propose 3–6 `compare_categories` for `Product Context.md` — the axes the founder believes decide wins (their pick of axes is itself informative); no vanity metrics.
7. **Business model & pricing assumption** — how it makes money; what they believe users will pay. Pure L1.
8. **The riskiest assumption** — "If one of your beliefs turned out false and killed the startup, which one?" That's the first hypothesis to test and the top of the research backlog.
9. **Where do these users live?** — channels, communities, forums, conferences. Feeds both desk-research sources and interview recruiting.

---

## Outputs — each saved only with the user's approval

1. **`Product Context.md`** — fill *What the product is* from the founder's product facts (stage, what exists, pricing model). Add a section:
   ```markdown
   ## Founding assumptions (L1 — founder-declared, to validate)
   <!-- Everything below is what the founder BELIEVES, recorded on <date>.
        Not findings. Each links to its Hypothesis / backlog entry.
        /persona-talk and /feature-panel must not cite these as facts. -->
   - Target group: … → [Hypothesis: …](Hypotheses/….md)
   ```
2. **`Hypotheses/`** — distill 3–7 bets in IF/BY/WILL/BECAUSE form with, where it helps, a **We're wrong if:** line — the argument against it (`Hypotheses/_template.md`), each approved individually by the user. `author: 'AI (Claude) — approved by <name>'`, `source: 'cold-start founding brief, <date>'`, `status: open`. The riskiest assumption (Q8) comes first.
3. **`Research backlog.md`** — the open questions in "how would we know if this is wrong?" form.
4. **`Competitors/`** — stubs per the `needs_research` convention.
5. **Verified `Evidence/`** *(optional, only if the user wants desk research now)* — market/problem desk research per `/researcher` rules, with the lookback window offered as 1/2/3 years; pitch-deck stats confirmed at their original sources land here with real citations.

**What this flow never produces:** `Signals/`, `Personas/`, or any bump to sample stats. If the user wants a proto-archetype to think with, hand over to `/persona-workshop` Level 1 (its archetype step is designed for exactly this) — and be plain that a *persona* stays out of reach until the first real interview lands.

## Closing the session — the route out of zero

End with the concrete path, in order:

1. Desk research round (if not done in step 5) → first real `Evidence/`.
2. `/interview-guide` — it already pulls open hypotheses as things to verify; the founding brief just fed it.
3. 3–5 real interviews with people from the (assumed) target group → drop transcripts in `Inbox/` → `/extract-findings` → the first `Signals/` and, at last, a persona grounded in something.

Offer a local commit ("Cold start: founding brief, N hypotheses, backlog seeded"). Never push unasked.

## Rules

- **Founder ≠ user.** Their statements about users are always L1 — never Signals, never Evidence, never counted into confidence or sample stats.
- **Never present a hypothesis as a finding** — in this flow or any later one.
- **No invented specifics.** If the founder doesn't know (e.g. market size), the answer is a backlog entry, not a guess.
- **Pitch-deck numbers are claims** until the original source is verified; the verification, not the deck, is what `Evidence/` cites.
- **One assumption per Hypothesis file** — same granularity rule as Signals.
- **Demo files stay out** — the founding brief concerns the user's real project only.
