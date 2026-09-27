---
name: contradictions
description: Find and report places where the graph disagrees with itself — Signals vs Signals, Signals vs Evidence, personas vs their sources. Use when the user runs /contradictions, asks where the data conflicts, or when another skill flags a divergence.
---

# contradictions — Where the data disagrees with itself

"Contradictions are data" is a standing rule of this repo — but until now there was no view that collects them. This skill reads the graph semantically and reports every place it argues with itself. **Report-only: it never resolves anything.**

## Trigger

```
/contradictions                    ← whole graph
/contradictions Personas/Emma.md   ← one persona's slice
```

## What counts as a contradiction

1. **Signal vs Signal** — two participants (or the same one across sessions) reporting opposite behaviour/attitude on the same thing.
2. **Signal vs Evidence** — an interview observation that runs against external data (e.g. a participant loves a feature the community data says is broadly hated — or vice versa).
3. **Persona vs sources** — a Pain, quote, or Product usage line in a Persona file that its own linked Signals no longer support (drift after edits).
4. **Correlation vs new data** — a `## Correlations` pattern that a newer Signal/Evidence undercuts.
5. **Tone drift** — canonical `Tone of Voice` traits vs contradicting candidate observations (`extract-findings` flags these at import; this skill re-surfaces unresolved ones).
6. **Stance split** — two Signals recording opposite `sentiment.stance` values on the same `feature:`. Cheap to find (`grep -A2 '^sentiment:' Signals/*.md`) and easy to under-read, so treat the two ends as the interesting cases: a `dealbreaker` next to a `relies_on` is a segment boundary or a change over time, not noise to be split down the middle. Report the two stances with their `because:` lines side by side. **Never average, and never convert the ladder to numbers to find a midpoint** — a persona whose stances got reconciled is a persona nobody can act on. `mixed` inside a *single* signal is not a contradiction; it is one person being genuinely ambivalent, which is a finding in its own right.

## Report format

Per finding:
- **The tension in one sentence** — plain language.
- **Both sides, cited** — file names + the exact quotes/values that clash, each with its Level (analyst context, so codes like L3 are fine here).
- **Possible readings** — e.g. different segments, different contexts, time drift, or a genuinely open question. Never pick a winner.
- **Suggested next step** — usually a `Research backlog.md` row ("which root cause is it?"); offer to append it.

## Rules

- **Never resolve a contradiction by editing files.** Two conflicting Signals stay two files with different root causes. If the user wants to act, route to `/backlog` (research it) — the answer comes from real users, not from us.
- Don't manufacture tension — near-misses and different-but-compatible observations are not contradictions; when in doubt, leave it out.
- A clean report ("no contradictions found") is a valid, useful result — say it plainly.
