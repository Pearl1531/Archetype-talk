# Session setup — everything done once, before the first question

Read at the start of every `/persona-talk` session. All of it is silent preparation: none of it is shown to the user except the grounding line, the preamble flags and the opening scene.

## Contents
- Step 0 — persona card cache
- Steps 1–3 — the full read (only when the card is stale or missing)
- Step 4 — the grounding line
- Preamble flags, demo tips, user preferences
- Opening scene

## Step 0 — persona card cache (token saver)

1. Run `python3 scripts/graph_index.py check .claude/cache/<Name>.card.md` (on native Windows, `python` instead of `python3`; same output).
2. **FRESH** → load the card **instead of** re-reading every linked Signal/Evidence/Archetype. The card already holds the tone profile, canon (scene + episodes), always-on archetype facts, topic-gated questions and stances, claims with precomputed Levels and freshness, in-their-words pain framings, indifference list, known unknowns, and guardrails. Load `Product Context.md` only if the conversation turns to features.
3. **STALE / MISSING** → do the full read (Steps 1–3), then write the card to `.claude/cache/<Name>.card.md` so the next session starts cheap. Two frontmatter fields make the check work — omit either and every future session pays the full read:

   ```yaml
   persona: <Name>                                   # which slice this card describes
   graph_hash: <python3 scripts/graph_index.py hash <Name>>
   ```

   The card is internal and gitignored — never show it or cite it as a source; cite the underlying files it summarizes.

The card is also what makes re-anchoring cheap mid-conversation — it is the thing to re-read every ~8 exchanges, not the whole graph.

**Freshness is per persona, not per graph.** The hash covers the persona file, everything it links to two hops out, everything that links *to* it, and `Product Context.md` — so a new Signal for another persona leaves this card valid, while anything this persona stands on invalidates it immediately. `Research backlog.md` is deliberately outside the slice: this skill appends to it at the end of every session, and counting it would make each session invalidate the card it had just written. `python3 scripts/graph_index.py slice <Name>` prints exactly what is covered.

## Steps 1–3 — the full read

**Step 1 — Persona file** (`Personas/<Name>.md`): Who they are (+ **Known unknowns**), **Access Needs** (optional), **Scene & details (canon)**, **Episodes (canon)** with their `peak:` / `end:` lines, **Product usage** (what the persona can credibly talk about), **Doesn't care about**, **Tone of Voice** (incl. *what animates / what shuts down*, *Asks back*), quotes, JTBD, Pains with their *In their words* lines, `## Stances by feature`.
- Items marked *[colour]* — written *[kontekst]* in Polish-language files, same marker — are said loosely ("a few years, since uni"), never as precise facts.

**Step 1a — Stances:** the persona's `## Stances by feature` section plus the `sentiment:` (and `unprompted:`) blocks on every linked Signal. Note which stances are `unprompted: false` — the reply that leans on one carries the focusing-illusion note.

**Step 1b — Linked Archetypes:** load every file in `## Archetypes`. Always-on: `Short description`, `Core pain`, `Access needs` type, `Resists agreeing about`. Topic-gated: `## Questions by context` and `## Stances by feature` bullets tagged `[Context]`. An archetype stance describes the *pattern* and is L1 unless a Signal backs it.

**Step 2 — Linked Signals & Evidence + Product Context:** take sentence rhythm, fillers, what makes the persona laugh or change the subject. If the conversation may touch features, load `Product Context.md` — the persona reacts to a **description of how a feature works**, never to internal names or the roadmap.

**Step 3 — Tone-of-voice note (private):** vocabulary, sentence length, emotional register, what the persona never says, 2–3 signature phrases, top annoyance, **speech markers** (where they hedge, restart a sentence, repeat themselves, trail off, slide from "I" to "people") — each tied to the topic it was recorded on.

## Step 4 — the grounding line

Gauge claim strength on the **Level scale (L1–L5)** — canonical definition in `.claude/skills/ai-persona/references/levels.md`: L1 assumption (the persona doesn't speak on it) · L2 Evidence only · L3 Signal only · L4 Signal+Evidence (`validated`) · L5 +Correlation. Levels silently decide confidence and tier escalation — **never print a raw code ("L3") anywhere the user can see.** Before the scene, show ONE plain-language line:

```
📊 This persona's pains are confirmed by both an interview and outside data — research from Jun 2025, over 3 months old; a refresh round with this audience is recommended.
```

Fresh data (≤3 months) → drop the freshness clause; silence is the "nothing to flag" state.

## Preamble flags, demo tips, user preferences

**Preamble flags** (frontmatter, after the grounding line): `demo: true` → `⚠️ Demo persona — illustrative example content, not real user research.` · `category: Competitor` → `⚠️ Competitor persona — optional add-on, does not represent our users.` Both can apply; neither changes in-character behaviour.

**Demo tips — ONLY when the persona has `demo: true`, never for real personas.** The user is likely test-driving the tool, so the researcher block occasionally suggests what to try next: after the opening scene, then at most every few replies when a natural next beat exists, one line:

```
💡 Try asking: "How do you manage your library — do you find saved tracks easily?" (should surface the Lost-library pain)
```

Draw suggestions from `DEMO.md`'s script arc (warm-up → pains → feature reactions → `[competitors on]` → `[exit]`) and the persona's own data — each tip names *why* it's interesting. Not every reply gets one; never inside the in-character text; `[no tips]` turns them off, `[tips on]` back on.

**User preferences** (`.claude/preferences.local.md`, written by the app's Settings page — honor when present): `name:` = how the researcher block addresses the user · `context_tier_default:` overrides the auto tier default · `demo_tips: false` disables 💡 tips even for demo personas · `judge_enabled: false` skips the per-reply self-check (never skip grounding itself — data rules still hold) · a "Judge instruction (override)" section replaces the default self-check list.

## Opening scene — walking in together

Before the first question, one short scene (2–4 sentences, second person, present tense, conversation's language): **you walk into the interview room together with the UX researcher** — the same researcher whose notes appear in the "Researcher context" blocks. The persona is already there **for the interview**: seated, present, waiting. Never stage them doing something else (listening to music, deep in some task) — no real participant does that, and it breaks immersion instead of building it.

- Use the persona's **Scene & details (canon)** props if present — don't invent new ones; keep them consistent with an interview setting.
- One concrete observable detail beats five adjectives. No evaluative adjectives.

**Example (Emma):**

*You walk into a small meeting room in a downtown Chicago office, the UX researcher right behind you with a notebook. Emma is already at the table — headphones around her neck, phone face-down. She looks up and gives a small nod, ready when you are.*
