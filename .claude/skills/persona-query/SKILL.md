---
name: persona-query
description: Answer "would this persona…?" with three cited scenarios (most likely / least likely / edge case) and confidence Levels. Use on /persona-query — grounded answers without roleplay.
---

# persona-query — Query Persona Data

Answer research questions about a persona with structured probability analysis. Always returns 3 scenarios: most likely, least likely, and edge case — each grounded in the persona's linked `Signals/` and `Evidence/`.

## Trigger

```
/persona-query Personas/Emma.md
/persona-query                   ← lists available personas in Personas/
```

Then the user asks a question, e.g.:
- "Would Emma pay for a smart library feature?"
- "How would she react to a 20% price increase?"
- "Would she recommend Spotify to a friend?"

Before answering, read the Persona file **and** the `Signals/` / `Evidence/` files it links to — the grounding lives in those, not in the Persona summary alone.

---

## Response format — always 3 scenarios

### 🟢 Most likely
What the data strongly suggests. Must cite at least one linked **Signal**, **Evidence**, or **Correlation**.
One clear answer + brief reasoning (2–4 sentences).

### 🔴 Least likely
What the data suggests won't happen — and why. Explain the counter-evidence: which Signal/Evidence rules it out.
Not "impossible" — just against the grain of what we know.

### ⚠️ Edge case
The scenario that could happen under specific conditions the data doesn't rule out. Name the condition: "This could happen IF…"
This is the "worst case for the product team" — plan for it even if it's not the default.

---

## Rules

1. **Ground every claim in the graph.** No scenario from generic user psychology — only from this persona's linked Signals/Evidence. If there's no data, say so.
2. **Scenarios must be meaningfully different.** Not three versions of "she might use it."
3. **Cite the source file.** Every scenario references at least one `Signals/…`, `Evidence/…`, or a named Correlation.
4. **Edge case ≠ speculation.** It must sit on a real tension in the data — a contradiction, an extreme value, a `validated` finding pushed to its limit.
5. **State confidence with the Level scale** (canonical definition: `ai-persona/references/levels.md` — L1 assumption → L2 Evidence-only → L3 Signal-only → L4 validated → L5 Signal+Evidence+Correlation). This is analyst-facing output, so the short code is fine here. After the three scenarios, one line:
   > Confidence: High (L5) — Signals *Skip track* + *Suggested songs*, Evidence *Smart Shuffle complaints* and a Correlation converge.
   > Confidence: Low (L3) — single Signal, no Evidence confirmation.
6. **Freshness rule.** If the newest supporting Signal ("Interview date") or Evidence (`retrieved:`) is older than **3 months**, append: `🕒 Data older than 3 months — a refresh round of research is recommended before deciding.`
7. **Competitor context is opt-in.** Use `Competitors/*.md` only when the user asks a competitor-related question or passes `--competitors`; cite the competitor file explicitly.

---

## Example

**Question:** Would Emma pay extra for a "Listening Modes" feature?

🟢 **Most likely — Yes, if bundled into Premium (not a separate charge)**
Signals *Suggested songs* + *Skip track*; Correlation "Context pollution corrupts the core experience".
She explicitly wants a simple context switch and her core frustration is algorithm pollution from context-switching. She'd value it — but as part of what she already pays for.

🔴 **Least likely — Paying a standalone add-on price**
Evidence *Price sensitivity* (43% cancels a subscription seen as too costly).
She already feels Premium is overpriced for her use case; an extra charge for something that should "just work" would confirm it. More likely: a manual workaround than paying.

⚠️ **Edge case — She churns entirely if price rises before this is fixed**
Evidence *Price sensitivity* + Correlation "Product-market misalignment".
Frustration with drift + cost sensitivity compound. This could happen IF a competitor offers profile separation first.

> **Confidence: High** — two Signals and one Evidence point the same way.
