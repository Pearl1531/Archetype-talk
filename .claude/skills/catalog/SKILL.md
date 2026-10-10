---
name: catalog
description: Organizes Signals and Evidence that already exist — themes for signals, topic tags that become evidence folders, missing quote translations, the evidence fields the AI reads first, and a list of what is still unsorted. Use on /catalog, or when the user asks to tidy, sort, group, catalogue or "clean up" signals or evidence. Never extracts new findings (that is /extract-findings) and never changes what a human curated.
---

# catalog — sort what is already in the graph

`/extract-findings` turns a source into Signals and Evidence. `/catalog` comes after it: it files them so people can find them and the AI can route to them. It writes only organising fields, never the findings themselves.

```
/catalog              ← the whole project: inventory, proposal, apply on yes
/catalog signals      ← themes and translations of Signals only
/catalog evidence     ← tags, translations and AI fields of Evidence only
/catalog --suggest    ← the proposal only; write nothing
```

## What it may change, and what never

| May write (after the user's yes) | Never touches |
|---|---|
| a Signal's `affinity:` when it has no `affinity_lock: true` | verbatim quotes, in any language — not a letter |
| Evidence `tags:` (topics; two pieces sharing a tag form a folder in the app) | `==highlights==` and `highlight_tags:` — the team's emphasis |
| a missing translation line under a quote (format below) | `affinity:` on a signal with `affinity_lock: true` — suggest instead |
| Evidence `claim:`, `source_kind:`, `published:`, `population:`, `primary_checked:`, the **Key figures** table and **Does not settle**, filled only from the file's own text and sources | links between entities (CLAUDE.md rule 6 — propose them) |
| | the number of Signals or Evidence: nothing is created, merged or deleted |

`demo: true` files are out of scope unless the user asks about the demo.

## Workflow

1. **Inventory — cheapest route first.** Read `.claude/cache/graph-index.md` (run `python3 scripts/graph_index.py build` if it is missing): its **Topics** section shows what is already tagged. Then list, per type:
   - Signals with an empty `affinity:`; locked signals (read them — they anchor what the themes are);
   - Evidence whose tags it shares with no other piece — the app shows these as **Unsorted**;
   - Evidence missing `claim:` or the source fields, or a **Does not settle** section;
   - quotes in a language other than the project's (`Product Context.md`, or the language the user writes in) with no translation line.
2. **Propose, in one table per type.** For signals, decide the theme set with the rules of [/affinity](../affinity/SKILL.md) (5–9 product-specific groups, one per signal, locked signals stay). For evidence, reuse existing tags before inventing one; a new tag must fit at least two pieces or it makes no folder. For each AI field, quote the sentence of the file it comes from.
3. **Ask once**, then apply only what was approved. "Yes to all" is fine; so is a partial yes.
4. **Report:** what moved where, what stayed unsorted and why, suggestions for locked signals (never applied), fields left empty because the source does not say. Rebuild the index: `python3 scripts/graph_index.py build`.

## Quote translations — the one format the app reads

The original stays first and exact. The translation goes on its own blockquote line right under it, in brackets, so the app can show it behind a *Show translation* switch:

```markdown
> *"I share it with my boyfriend. He listens to metal, I listen to pop."*
>
> *(Dzielę je z chłopakiem. On słucha metalu, ja popu.)*
```

In a transcript the same line follows the speaker's turn: `**Name:** *„original"*` and on the next line `> *(translation)*`. Translate faithfully, keep hedges and odd phrasing, never smooth the speaker into better prose — the translation is a reading aid, the original is the data. Only add a translation where the quote's language differs from the project's.

## The evidence fields — only from the file's own source

`claim:` is one plain sentence of what the piece says. `population:` and `published:` come from the source text; if it does not say, leave them empty — an empty slot is honest, a guess is an invented fact (rule 3). `primary_checked: true` only if the figures were read in the original report; a piece built from press coverage is `false`. **Does not settle** gets at least one line a reader of the source would agree with. Anything you cannot fill from the file goes into the report as "needs `/researcher`", not into the file.
