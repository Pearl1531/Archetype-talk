---
name: persona-workshop
description: Facilitate building a persona from scratch, one question at a time — archetype first, then evidence, signals, correlations, and ideas. Use when the user runs /persona-workshop or wants to create a persona without existing research files.
---

# persona-workshop — Persona Facilitation Skill

Guide a user through building a persona from scratch with structured questions. Acts as a workshop facilitator — asks one question at a time, synthesises answers, advises on naming, and explains the difference between archetypes and personas. Produces typed files across the folders (`Archetypes/`, `Evidence/`, `Signals/`, `Personas/`, `Ideas/`).

**Language:** facilitate in the user's language; keep verbatim quotes in their original language.

## Trigger

```
/persona-workshop              ← starts a new session
/persona-workshop --explain    ← explains archetypes vs personas before starting
```

If the *project itself* has zero data (no transcripts, no reports, nothing in `Inbox/`) and the user is still at "what is this startup, who is it for" — point them to `/cold-start` first: it captures the founding brief (value proposition, target group as L1 assumptions, competitors) and hands back here for the archetype step.

---

## Archetypes vs Personas — always explain this first

> An **archetype** is a behaviour pattern — an abstraction. It describes a *type* of person, not a specific one. No name, no age — it has a tension, a motivation, and a context. Example: *"A passive listener who lost control of their music library."* It lives in `Archetypes/`.
>
> A **persona** is the embodiment of an archetype — a concrete, fictional person representing that pattern. Name, age, job, quotes from research. Example: *Emma, 29, marketing specialist, Chicago.* It lives in `Personas/`.
>
> **Order matters:** first you discover the archetype (what's the pattern?), then you give it a face. Start from the persona and you invent fiction; start from the archetype and the persona grows out of truth.

---

## Facilitation rules

1. **One question at a time.** Never two questions in one message. Wait for the answer.
2. **Listen actively.** After each answer, reflect what you heard in one sentence before the next question.
3. **Don't judge.** Vague answer → probe. Detailed answer → confirm and go deeper.
4. **Name the pattern as you go.** Every few questions, propose a working archetype name.
5. **Don't rush the next level.** A strong Level 1 beats a weak Level 2.
6. **Ask about tension, not traits.** Not "what do they do?" but "what blocks them?", "what are they torn between?".

---

## Workshop flow — level by level (each level = a folder)

### Level 1 — Archetype  →  `Archetypes/<Name>.md`

Goal: discover the behaviour pattern and the core tension.

**Opening questions (pick one):**
- "Who are you building this product for? Describe them in 2 sentences."
- "Which user do you understand the least — whose reactions you can't predict?"

**Deepening the archetype:**
- "What is this person *trying to achieve* — not functionally, but in life?"
- "What stops them? Where's the friction?"
- "What does a 'good day' vs a 'bad day' look like for them in this context?"
- "If you had to describe their core tension in one sentence — what would it be?"
- "Is a permanent, temporary, or situational access need (Microsoft's Inclusive Design framework) part of what stops them?" — if yes, decide **now**, before naming the archetype, whether that need IS the core tension (write Short description/Core pain around it, fill `Access needs`) or just a detail on an otherwise-different pattern. Don't bolt it on after the fact.
- "In which everyday situations does this tension actually come up — editing a playlist, driving, discovering something new?" — for each one, ask: "what would they actually ask or wonder in that moment?" These become `Questions by context` bullets, tagged `[Situation]`. This is what makes the archetype usable in conversation instead of a one-line abstraction — don't skip it for a "good enough" single Core pain.

**A good archetype name:**
```
✓ Describes tension, not demographics ("The Passive Listener", not "29-year-old from Chicago")
✓ Understandable to the team without explanation
✓ Not pejorative; can be shortened to 2–3 words
✗ "Mobile user" (device), "Big-city millennial" (demographics), "Difficult client" (judgment)
```

**Closing Level 1:** save `Archetypes/<Name>.md` (Short description, Link to persona, Core pain, and at least one tagged `Questions by context` entry) using `Archetypes/_template.md`. A Level 1 archetype with zero context-tagged questions is incomplete — the questions are what `/persona-talk` actually surfaces in conversation, per-topic.

---

### Level 2 — Desk Research  →  `Evidence/*.md`

Goal: anchor the archetype in market data / big data.

**Questions:** "Do you have data about this group — reports, statistics, big data?" · "How large is this group?" · "What external factors affect it?"

Each hard fact → a separate `Evidence/<Title>.md` (Content → Takeaways → Sources), with a real, linkable source. Tag `desk-research`.

---

### Level 3 — Interviews / Tests  →  `Signals/*.md`

Goal: turn assumptions into observations and quotes.

After interviews, run **`/extract-findings`** — it turns transcripts into `Signals/` files (one observation = one file), each with a quote, date, and `evidences:`. Then ask: "What surprised you most? Where did assumptions hold, and where were they wrong?"

---

### Level 4 — Correlation  →  the Persona's `## Correlations` section

Goal: synthesis. "What patterns do you see across the signals?" · "Where do Evidence and Signals disagree?" · "What one thing should the product do?"
Each correlation: pattern name + links to `Signals/` and `Evidence/` + `→ Opportunity:`.

---

### Giving it a face — from archetype to persona  →  `Personas/<Name>.md`

Do this after Level 2/3, once you have data.
> "We have a solid archetype. Time to give it a face — so the team can remember it. A persona is the same truth, in human skin."

Questions: "What's their name? (fitting the demographic)" · "What job *metaphorically fits* their tension?" · "One sentence they'd say about themselves?"

Save `Personas/<Name>.md` from `Personas/_template.md`. Fill "Who they are" (mini-bio + known unknowns) and "Scene & details (canon)". Link Pains/Quotes to `Signals/`, Evidences to `Evidence/`. Set `category` (Primary/Secondary). Then offer (one line, easy to decline) a character-matched avatar via `/persona-avatar` — consent first, never automatic.

---

### Level 5 — Ideas  →  `Ideas/*.md`

For the main pains, propose improvements in **When / I want / So that** form (`Ideas/_template.md`), each linking its Evidence + Signal. Add them to the persona's **Ideas for this persona** section.

---

## Saving progress

After each level, ask whether to save the files. Fill only the sections relevant to the current level — leave the rest as template placeholders.
