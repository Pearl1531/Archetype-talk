# Persona Levels

A persona grows through 5 levels of maturity. Each level adds depth **and** produces artefacts in specific folders of the knowledge graph.

---

## Level 1 — Archetype

**Source:** Assumptions, market knowledge, initial hypothesis
**Produces:** a file in `Archetypes/`
**Purpose:** Name the behaviour pattern before any research

An Archetype file (`Archetypes/<Name>.md`) contains:
- **Short description** — the pattern as a *type*, not a person (tension, motivation, context)
- **Persona link** — which persona will embody it (once one exists)
- **Core pain** — the core tension in one sentence

Do not give it a name/age yet — that comes with the Persona.

---

## Level 2 — Desk Research

**Source:** Public data, reports, statistics, big data
**Produces:** files in `Evidence/`
**Purpose:** Ground the archetype in real market context

Each Evidence file (`Evidence/<Title>.md`) contains: Content (the hard number), Takeaways, Sources.
Tag these findings `desk-research` until interviews confirm them.

---

## Level 3 — Interviews / Tests

**Source:** User interviews or usability tests (minimum 3 for a pattern)
**Produces:** files in `Signals/`
**Purpose:** Replace assumptions with observed behaviour and real quotes

Each Signal file (`Signals/<Title>.md`) captures **one** observation — what happened, ideally with a verbatim quote — and links up to the Evidence it supports via frontmatter `evidences: [...]`.
Tag `interview ×N` by how many participants showed it; `validated` when a Signal confirms an Evidence.

---

## Level 4 — Correlation

**Source:** Pattern analysis across Signals + Evidence
**Produces:** the Persona's `## Correlations` section
**Purpose:** Find connections, tensions, and design opportunities

Each correlation is insight-first: a bolded pattern name, the `Signals/` + `Evidence/` links that support it, a short explanation, and `→ Opportunity:`.
Also fill the Persona's **Potential Pain Relievers** here.

---

## Level 5 — Primary Persona + Ideas

**Source:** Full synthesis
**Produces:** files in `Ideas/`; Persona `category: Primary`
**Purpose:** Final validated persona ready for product decisions

Adds:
- `Ideas/` files (When / I want / So that) addressing the persona's pains, each linking its Evidence + Signal
- The Persona's **Ideas for this persona** section listing them
- Confidence note per section, ready for PM handoff and team alignment

---

## Level indicator

Set the Persona's `category:` frontmatter to reflect its role (`Primary` / `Secondary`).
The level itself is implicit in how many folders are populated — an early persona may only have an Archetype and some Evidence.

---

## Claim weight — the same Levels, applied to a single claim

**This is the canonical definition — every skill that grades claims points here instead of redefining it.** The persona's maturity ladder above and the weight of one claim in `/persona-talk` / `/persona-query` are ONE scale, not two:

| Level | Basis of the claim | Weight in conversation |
|-------|--------------------|------------------------|
| L1 | `assumption` — hypothesis, no data | persona does NOT speak on it ("I don't know") |
| L2 | Evidence only (desk research) | persona speaks generally; flagged "not confirmed in interviews" |
| L3 | Signal only (`interview ×N`) | persona speaks from experience; "single source — treat with care" |
| L4 | Signal + Evidence (`validated`) | full-strength claim |
| L5 | Signal + Evidence + Correlation | strongest — may carry product recommendations |

A conversation based on signals alone (L3) carries less decision weight than one with a full Level-5 persona.

**Display rule:** inside a `/persona-talk` conversation, never print a raw code ("L3") — say it in plain words ("confirmed by both an interview and outside data"). In analyst-facing output (`/persona-query`, reports, backlog entries) the short code is fine: `Confidence: High (L5)`.

## Data freshness — the 3-month rule

Real data ages. If a Signal ("Interview date") or Evidence (`retrieved:`) is older than **3 months**, the skills flag `🕒` and suggest a refresh round (new interviews/tests, re-verifying sources). Refreshing an Evidence = checking the source is still valid + bumping `retrieved:`.
