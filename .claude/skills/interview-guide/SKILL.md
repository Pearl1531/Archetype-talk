---
name: interview-guide
description: Generate a discussion guide for a real interview/test round from Research backlog questions and thin (L2/L3) claims. Use when the user runs /interview-guide, plans interviews, or asks what to ask real users next.
---

# interview-guide — From backlog to a discussion guide

Turn the graph's known gaps into a ready-to-use discussion guide for a **real** research round. This is the skill that closes the loop: synthesis → questions → **real interviews** → new Signals.

## Trigger

```
/interview-guide Personas/Emma.md      ← guide targeting one persona's segment
/interview-guide                       ← guide from the whole open backlog
/interview-guide <topic>               ← guide scoped to one theme
```

## Inputs — where questions come from

1. **Open rows in `Research backlog.md`** matching the scope (persona/theme). Prefer rows whose `Kind` is `qualitative` or `mixed` — a `quantitative` row ("what share of users…") belongs in analytics or a sized survey, and asking six people for a percentage produces a number that looks like data and isn't. Say so rather than silently dropping the row. **Order by `Priority`** where it is set — `critical` rows earn a place in the guide before `major`, and `minor` ones only fill time you have left; a session has room for maybe six real questions, so this column decides which ones they are.
2. **Thin claims** in the persona's data — anything at L2 (Evidence only, never confirmed in an interview) or L3 (single-source Signal, no external confirmation). Walk the persona's Pains/JTBD/Correlations and their linked files to find them.
2b. **Open hypotheses** (`Hypotheses/` with `status: open`, matching the scope's `feature:`/tags) — each contributes questions that could verify or kill the bet's BECAUSE assumption. Mark them `targets: Hypothesis <name>` so findings can route back.
3. **Known unknowns** listed in the persona file.
4. Stale data (>3 months) worth re-verifying — re-asking beats assuming.

## Output — the guide

A markdown document (offer to save as `Research/Guide <persona/topic> <YYYY-MM-DD>.md` — create the folder if needed), structured like a real discussion guide:

1. **Research goals** — 2–4 sentences: what this round should settle, in plain language.
2. **Screener hints** — who to recruit, from the persona's Product usage + `Participants.md` coverage gaps (segments under-represented so far).
3. **Warm-up** (2–3 questions) — low-stakes, from the persona's "Who they are" gaps.
4. **Core sections by theme** — each question annotated, for the researcher's eyes:
   - *Why:* which backlog row / thin claim it targets (cite the Signal/Evidence by name)
   - *If confirmed:* what it upgrades — e.g. "second independent source → moves *Lost library* from L3 to L4 (`validated`)"
   - open, non-leading phrasing only; follow-up probes indented underneath
5. **Feature probes** (optional) — candidate features from `Product Context.md` phrased as descriptions of behaviour, never internal names.
6. **Closing** — the "anything else?" space + a reminder to capture verbatim quotes.

## Rules

- **Non-leading phrasing is a hard requirement** — the same anti-sycophancy standard personas are held to applies to the questions we ask real people. "How do you find saved songs?" not "Is your library hard to navigate?".
- Every core question must trace to a concrete gap (backlog row, thin claim, known unknown) — no filler questions.
- The guide states at the top: **answers from this round come back via `/extract-findings`** — that's what turns them into Signals and closes backlog rows (`/backlog close`).
- Generating a guide changes nothing in the graph — it's a plan, not data.
