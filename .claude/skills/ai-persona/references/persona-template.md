# Persona Template & Linking Reference

Use this when creating or updating a file in `Personas/`. Fill only the sections relevant to the current level — leave the rest as placeholders.

## Frontmatter

```yaml
---
type: 'Persona'
title: <Name>              # single first name, used as the file/card title
aliases:
description: <one sentence about the pattern>
tags: []
contact:
category:                 # Primary | Secondary
picture:
---
```

## Body structure

```markdown
# <Name>

# <First Last> — <Role>

> "<Bio quote in the first person>"

## Jobs to be Done
## Pains
## Potential Gains
## Relevant Quotes
## Potential Pain Relievers
## Evidences
## Ideas for this persona
## Correlations
## Metadata
```

## Linking rules — the graph lives in the links

The Persona file is a hub. Its sections point outward to typed files:

| Section | Links to | Example |
|---------|----------|---------|
| **Pains** | `Signals/` | `- [Skip track](../Signals/Skip%20track.md) <pain description>` |
| **Relevant Quotes** | `Signals/` or `Evidence/` | `- [Smart Shuffle complaints](../Evidence/...) "<quote>" — <source>` |
| **Evidences** | `Evidence/` | `- [The Skip](../Evidence/...) <what it confirms> — <source>` |
| **Ideas for this persona** | `Ideas/` | `- [Idea:1 ...](../Ideas/...)` |
| **Correlations** | `Signals/` + `Evidence/` | bolded pattern name, then the supporting links |

- Filenames with spaces / apostrophes / parentheses must be **URL-encoded** in links
  (space → `%20`, apostrophe → `%27`).
- Prefer linking to a `Signal` over pasting a raw quote — the Signal holds the quote, date, and transcript link.

### Connections between sections — quotes → pains → relievers

A **Relevant Quotes** or **Potential Pain Relievers** bullet may end with
`(→ <Pain>; <Pain>)`. That token says which of this persona's **Pains** it is
about, or would ease.
- **Naming a Pain:** use its Signal's title, or the Pain's own text when it has
  no Signal.
- **One-to-many:** just list more Pains.
- **Implicit links:** a quote **without** a token is connected to the Pains
  citing the same Signal.
- **The token wins:** when a quote has a token, the token is the complete
  list. `(→ none)` means the researcher deliberately connected it to no Pain.

Read these tokens when you reason about the persona, e.g. "what would ease X?"
or "which quote backs X?". They are the researcher's own judgement. **Never
add, remove or rewire them without the researcher's approval** (CLAUDE.md,
rule 6): propose the connection instead. The app's persona poster draws and
edits them.

## Source tags

Add after a claim to mark confidence:
- `` `desk-research` `` — secondary source (report, survey, big data) → lives in `Evidence/`
- `` `interview ×N` `` — observed in N interviews/tests → lives in `Signals/`
- `` `validated` `` — a Signal confirms an Evidence (data + observation align)

## Metadata block

```markdown
## Metadata
- **Grounded in participants:** <N distinct participants + their transcript ids>   <!-- per-transcript matching: every interview is a different person; never phrase this as repeated sessions with the persona -->
- **Confidence:** <Low | Medium | High + short justification / sample size>
- **Last reviewed by:** <name>
```
