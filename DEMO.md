# DEMO — talking to an AI persona (Emma)

A demo script: interview a persona about using Spotify, then test reactions to candidate features. The persona answers strictly from the graph data (Signals/Evidence/Transcripts) — every conclusion is traceable to a source.

---

## Prep (before the demo)

1. Open the project in Claude Code.
2. Run:
   ```
   /persona-talk Personas/Emma.md
   ```
3. Claude loads the persona, its Signals/Evidence, and `Product Context.md`, sets the scene, and waits for questions. Because Emma is a `demo: true` persona, the UX researcher will occasionally add a `💡 Try asking:` tip to the researcher block, walking you through this script's arc — `[no tips]` turns that off (real personas never get tips).
4. Optional: `--no-context` = a clean conversation without the analytical block at all (turn it back on with `[context on]`). If you want the block on but brief, it's already the default — the analytical block is now a **quick one-liner** most of the time and only expands to the full debrief for a genuinely decision-worthy answer. Force a tier live with `[context quick]` / `[context full]` / `[context auto]`.

**Backup persona:** `/persona-talk Personas/Jake.md` — a different segment (student, social), different answers.

---

## Phase 1 — interview: how do you use Spotify (5–7 min)

Start soft, then dig into pains. Suggested questions:

1. "Tell me what a typical day with Spotify looks like for you?"
2. "How do you manage your library? Do you find saved tracks easily?" → should trigger [Lost library](Signals/Lost%20library.md)
3. "Do you use Discover Weekly? How do you rate its accuracy?" → [Doesn't trust Discover Weekly](Signals/Doesn%27t%20trust%20Discover%20Weekly.md)
4. "Who else uses your account, and what does that change?" → [Shared account with partner](Signals/Shared%20account%20with%20partner.md)
5. "What are you actually paying for with Premium? Worth the price?"

**What to expect:** a natural, slightly tired tone ("no", "honestly"), matter-of-fact frustration without theatre, short answers to simple questions. The persona doesn't know things outside the data — asked about e.g. headphones she'll say "I never thought about it".

## Phase 2 — reactions to features (7–10 min)

Describe a feature by what it does (no internal names), ask for a reaction:

1. **Listening Modes / "that wasn't me":** "Imagine a button: you tag a session as 'party' or 'not my listening' and the app doesn't learn from it. What do you think?"
   - Expected reaction: enthusiasm (hits her top pain), but check the effort barrier: "And would you have to turn it on manually every time?"
2. **Smart Library:** "What if your Liked Songs organised themselves into folders by mood and energy?"
3. **Multi-profile:** "Separate profiles on one account, like Netflix — would that change anything for you and Brad?"
4. **Lite plan:** "A cheaper music-only plan, without podcasts — does that sound like something for you?"
5. **Counter-probe (a mismatched feature):** "What if we added more podcast recommendations on the home screen?" → the persona should politely decline (she doesn't use podcasts) — **this is the moment that shows the grounding in data**.

## Phase 2b — competitor mode (optional, 3 min)

By default the persona has NO market knowledge of competitors. Turn it on in front of the audience:

1. Type `[competitors on]` — Claude loads the `Competitors/` files (Apple Music, YouTube Music, Deezer).
2. Ask: "Have you ever considered switching to something else?" → Emma answers first-hand about her sister's Apple Music ([Sister has Apple Music](Signals/Sister%20has%20Apple%20Music.md)) — and the researcher block tags *Competitor: Apple Music* and the grounding strength.
3. Follow up: "And what have you heard about Deezer?" → knowledge only second-hand ("I read somewhere…") or an honest "I don't really know it" — the persona doesn't recite market shares.
4. `[competitors off]` returns to clean mode.

With Jake the same moment lands even harder: friends on YouTube Premium ([Tempted by YouTube Premium](Signals/Tempted%20by%20YouTube%20Premium.md)) — a real churn risk.

## Phase 3 — exit character and debrief (2 min)

- Type `[exit]` — Claude steps out of character and speaks as an analyst.
- Ask: "Summarise which of my ideas hit Emma's pains and which don't — with references to Signals and Evidence."
- Show the audience that every tag/reference leads to a file in the repo, and from there to real Spotify community threads.
- Claude will offer to append the "Questions to dig into" to [Research backlog.md](Research%20backlog.md) — stress the rule: **a persona conversation doesn't create data, only questions for real research.** This closes the loop: synthesis → questions → real interviews → new Signals.

---

## Deeper questions (if time allows)

- "What would have to happen for you to leave Spotify?"
- "If you had 30 seconds with Spotify's head of product — what would you say?"
- `/persona-query Personas/Emma.md` → "Would Emma pay $1 more for Listening Modes?" — returns 3 scenarios (most likely / least likely / edge case) with cited sources.

## Tips

- Leading questions ("you love discovering music, right?") — the persona is allowed to disagree. That's a feature, not a bug.
- If the persona starts inventing details outside the data — you may catch it: `[exit]` and ask for the source.
- The demo works offline on the repo files; the community threads in Evidence are public links — you can open them live.
- **Grounding preamble:** before the scene you'll see one plain-language line, e.g. *"📊 This persona's pains are confirmed by both an interview and outside data…"* — that's the Level scale (L1 assumption → L5 signals+evidence+correlations) speaking in words; raw codes are internal and never printed in the conversation. A good moment to explain to the audience that talking to a "full" Level-5 persona weighs more than one built on a single interview.
- **Freshness:** the example research data is from 06.2025, so the preamble will also recommend a refresh round (the 3-month rule), spelled out in words. This is intentional — it shows the system keeps data current instead of pretending old research is valid forever.
