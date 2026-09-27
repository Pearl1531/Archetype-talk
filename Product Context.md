---
type: 'ProductContext'
project_name: ''            # short slug for this project — the SessionStart hook reads it to name the active project
title: ''
updated:
compare_categories: []      # the app's Compare view axes — set per project, decision-relevant only (no vanity metrics); each Competitors/ file mirrors them in its ## Comparison table
---

# <Product> — research product context

Shared product context for every persona in this project. `/persona-talk` reads this file before a conversation about features — the persona knows the product from its own experience, and the researcher knows from here what is being talked about.

> **This file is a blank template.** Fill it in for your own project, or delete the
> sections that don't apply. The bundled Spotify demo has its own frozen copy in
> [docs/demo-workspace/](docs/demo-workspace/README.md) — edit that one when you change
> the demo, never this one.

---

## What the product is

<!-- One paragraph: what it is, who uses it, how many, which segments matter. Every
     number gets a source link — the same rule as in Evidence/. -->

## Existing features relevant to the research

| Feature | What it does | State / context |
|---|---|---|
|  |  |  |

## Candidate features (to test persona reactions)

<!-- From the research graph (`Ideas/`), plus concepts that have no Idea file yet —
     mark which is which. -->

1.

## Physical form factor & constraints (optional — fill for hardware or hardware-adjacent products)

<!-- For products with a physical dimension, personas need the same grounding about the
     physical context as about features. Fill what applies; delete what doesn't:

- **Form factor:** <device(s) the product runs on or is — size, weight, mounting, wearability>
- **Input methods:** <touch, voice, physical buttons, knobs — and which work in which situation>
- **Environments of use:** <in the car, outdoors/glare, noisy floor, gloves on, one-handed…>
     Each environment worth researching should also exist as a `[Context]` tag in the
     relevant Archetype's "Questions by context" — same topic gate as everything else.
- **Physical constraints & failure modes:** <battery, connectivity drops, temperature, durability>
- **Telemetry available:** <what the device itself logs — importable as internal Evidence
     via the analytics-sync labeling rules> -->

## Competitors

Competitor context is **opt-in** — it enters a persona conversation only after `--competitors` / `[competitors on]`. Rules and fields: [Competitors/README.md](Competitors/README.md).

## Comparison

<!-- Our own row set for the app's Compare view ("us" as a column). Same rules as the
     competitors' tables: one row per compare_categories entry, sourced claims only. -->

| Category | Where we stand |
|---|---|
|  |  |

## The rule for a persona in a feature conversation

The persona doesn't know internal names or the roadmap — it reacts to a **description of how a feature works** in the language of its own experience and pains. Its reactions must stay consistent with its Signals and Pains.
