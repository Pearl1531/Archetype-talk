---
name: affinity
description: Cluster Signals into product-specific themes (affinity diagram) via their `affinity:` frontmatter; never moves locked signals, only suggests. Use on /affinity or when grouping signals by theme.
---

# affinity — Signal affinity diagram

Cluster the project's `Signals/` into a handful of **product-specific thematic groups** — the affinity-diagram step of research synthesis. The grouping is written into each signal's frontmatter (`affinity: '<group>'`), so the browser app renders it as an editable board and every claim stays traceable.

## Trigger

```
/affinity            ← group all signals (first run) or re-group the unlocked ones
/affinity --suggest  ← propose changes only; write nothing
```

## The groups are dynamic — derive them from THIS product

Do not reuse a fixed taxonomy. Read `Product Context.md` and the signals, then invent groups that fit the product:
- a music streaming service → *Recommendations & algorithm, Library & finding music, Playback experience, Pricing & value, Competition & switching, Accounts & sharing, Input & accessibility, Social & identity* …
- a car maker → by *vehicle segment*, *customer type (fleet / sole-trader / private)*, *ownership stage* …
- a B2B SaaS → by *job-to-be-done*, *team role*, *lifecycle stage* …

Aim for **5–9 groups**: enough to separate real themes, few enough to stay legible. A theme with one lonely signal is usually a sub-point of a bigger one — fold it in unless it's genuinely distinct.

## The hard rule — never overwrite human curation

Each signal may carry `affinity_lock: true`. That means a human placed it (via the app's Edit mode or by hand). **You must not change `affinity:` on a locked signal.** Instead:
- Leave it exactly where it is.
- If the data suggests it belongs elsewhere, say so in your report as a *suggestion* ("Signal *X* reads more like *Group Y* — want me to move it?"), and act only if the user agrees.
- Locked signals still inform what the groups ARE — read them, just don't move them.

Unlocked signals (no `affinity_lock`, or `false`) are yours to (re)assign freely.

## Workflow

1. Read `Product Context.md` + every `Signals/*.md` (use the transcript scan headers / signal quotes; don't re-read transcripts).
2. Decide the group set (respecting the themes locked signals already anchor).
3. For each **unlocked** signal, set `affinity: '<group>'` in its frontmatter (one group per signal). Leave `affinity_lock` absent — the app adds it only when a human curates.
4. Report: the group list with counts, which signals moved, and any **suggestions** for locked signals you'd have placed differently (never applied).
5. First run (no signal has `affinity:` yet) is fully automatic — assign them all. The app also shows a provisional by-tag grouping until this runs.

## Rules

- One signal, one group — `affinity` is a single value, not a list.
- Group names are short human phrases, product-specific, not tag slugs.
- This never creates or deletes Signals, and never touches anything but the `affinity:` line of unlocked ones.
- Contradiction-safe: two signals that disagree can share a group (the group is a theme, not a conclusion) — grouping is not synthesis; Correlations remain where you reconcile them.
