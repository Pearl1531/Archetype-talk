---
name: ai-persona
description: Core skill for creating and leveling up intention-based personas across the knowledge graph. Use when the user wants to create a persona/archetype, deepen one to the next level, turn research into Evidence/Signal files, or export a persona for PMs.
---

# ai-persona — Intention-Based Persona Skill

Build and manage UX personas grounded in real research, organised as a linked knowledge graph of five entity types.

## The five entity types (one folder each)

| Folder | Type | What it holds |
|--------|------|---------------|
| `Evidence/` | `Evidence` | Hard data — big data, surveys, reports. Sections: Content → Takeaways → Sources. |
| `Signals/` | `Signal` | A single observation from a test/interview that flags a problem, usually with a user quote. Links up to Evidence via `evidences:`. |
| `Archetypes/` | `Archetype` | A behaviour pattern (a *type*, not a person). Sections: Short description, Link to persona, Core pain. |
| `Personas/` | `Persona` | The embodiment: JTBD, Pains, Gains, Quotes, Pain Relievers, Evidences, Ideas, Correlations, Metadata. |
| `Ideas/` | `IdeaForImprovement` | An improvement idea in When / I want / So that form. Links to Evidence + Signal. |

**Flow:** `Evidence → Signal → (Persona ↔ Archetype) → Idea`

## Five levels of maturity (orthogonal to type)

A Persona deepens through 5 levels; each level produces artefacts in specific folders. See [levels.md](references/levels.md).

1. **Archetype** → a file in `Archetypes/`
2. **Desk Research** → files in `Evidence/`
3. **Interviews / Tests** → files in `Signals/` (each references its `Evidence/`)
4. **Correlation** → the Persona's `## Correlations` section, linking Signals + Evidence
5. **Primary + Ideas** → files in `Ideas/`, Persona `category: Primary`

## When to use this skill

Load this skill when the user wants to:
- Create a new persona (or archetype) from scratch
- Deepen an existing persona to the next level
- Turn research into Evidence / Signal files
- Export a persona for PMs

## References

Always load the relevant reference before acting:

| Reference | When to load |
|-----------|-------------|
| [levels.md](references/levels.md) | Before creating or leveling up a persona |
| [persona-template.md](references/persona-template.md) | Before writing a Persona file |
| [workshop-flow.md](references/workshop-flow.md) | When running a full persona workshop |
| [transcript-analysis.md](references/transcript-analysis.md) | When the user provides interview transcripts |

## Core rules

1. **Never skip levels.** A Level 3 persona must have Level 1 and 2 complete first.
2. **One file = one entity.** One Persona per file in `Personas/`, one Signal per observation, one Evidence per data point.
3. **Everything links.** Pains and Quotes link to the `Signals/` that revealed them; Signals link to their `Evidence/`; Ideas link to Evidence + Signal.
4. **Quote real people.** Quotes in Signals, Relevant Quotes, and JTBD must come from actual research, not invented.
5. **Mark confidence.** Every data point shows its source: `desk-research`, `interview ×N`, or `validated`.

## Workflow

```
1. Ask the user to describe their research or provide transcripts.
2. Load levels.md → confirm which level to build.
3. Process raw research into Evidence/ + Signals/ (see transcript-analysis.md).
4. Load persona-template.md → write/update the Persona file in Personas/,
   linking Pains/Quotes to Signals and Evidences to Evidence.
5. Return the paths of every file created or updated.
```

## Asking for input

Always start a persona session with:

> "To get started, please share one of the following:
> - **Interview transcripts** or test notes (I'll turn them into Evidence + Signals)
> - Existing **Evidence / Signal** files
> - Or describe your research data and I'll guide you through it."

### If the user provides transcripts

Suggest running `/extract-findings` first to turn them into `Evidence/` + `Signals/` files.
Then build the Persona from those typed files — not from raw transcripts.

1. Load [transcript-analysis.md](references/transcript-analysis.md)
2. Read all provided transcripts
3. Create `Evidence/` for hard data and `Signals/` for observations (each Signal references its Evidence)
4. Link the Persona's Pains / Quotes / Evidences to those files
5. Propose Correlations across signals

### If no transcripts

Proceed with manual input using [workshop-flow.md](references/workshop-flow.md).
