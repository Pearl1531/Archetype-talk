# Competitors — competitor context

The sixth entity type in the graph: `type: 'Competitor'`, one file per competitor. **Public data with links only** (market reports, community threads, official announcements) — the `retrieved:` field records when the sources were last verified (the 3-month rule).

## How it works in conversations

Competitor context is **opt-in** — OFF by default:

```
/persona-talk Personas/Emma.md --competitors    ← on from the start
[competitors on] / [competitors off]             ← toggle mid-conversation
```

A persona speaks first-hand about a competitor only when its own research supports it (a Signal with a `competitors:` field); knowledge from these files it relays second-hand ("my sister says…", "friends have…"). Details: the `persona-talk` skill.

---

## Competitor personas — OPTIONAL ADD-ON

> ⚠️ This is NOT a core feature of the method. The core is personas of **our** users.
> A competitor persona only makes sense in specific scenarios: switcher analysis,
> studying switching barriers, simulating "why they did NOT choose us".

Rules, if you decide to build them:

1. **Same requirements as core personas** — real research (interviews with the competitor's users), transcripts, Signals, Evidence. No research = we don't build one. Public opinions from `Competitors/` files are not enough for a persona.
2. **Keep the file in `Personas/`** with frontmatter:
   ```yaml
   type: 'Persona'
   category: Competitor        # a clear add-on marker
   description: <competitor> user — optional persona (switcher analysis)
   ```
3. **`/persona-talk` with a competitor persona** works the same, but the grounding preamble always adds: `⚠️ Competitor persona — optional add-on, does not represent our users.`
4. **Don't mix correlations** — conclusions from competitor personas do not feed the Correlations of core personas; at most they suggest questions for further research of our own.

## The market map (app) — proximity × research mentions

**You are on the map too.** The app reads `Product Context.md` and places *your* product as a distinct dark anchor in the top-right corner — your own segment (far right) where, by definition, every interviewed participant is your user (top). It's the fixed reference every competitor is read against; an "About us" card also heads the Competitors list. Edit the details in `Product Context.md` (the "What the product is" section supplies the blurb).


`app/index.html` → Competitors tab → map view. Deliberately **not** a G2-style grid clone — different axes, different meaning:

- **Horizontal — market proximity** (`proximity:` frontmatter, researcher judgment with a one-line reason):
  - **direct (SOM — Serviceable Obtainable Market):** fights for the exact customer segment we researched. Losing a user to them is straight churn.
  - **adjacent (SAM — Serviceable Available Market):** same product category, but a segment or geography we merely *could* serve today.
  - **indirect (TAM — Total Addressable Market):** a different product competing for the same underlying need or time budget (e.g. a purchase marketplace vs. a streaming subscription).
- **Vertical — mentions in our research:** counted automatically from `Signals/` whose `competitors:` field names the competitor. This is *our participants' voice*, not market share — a dot sits high because real interviewees brought that competitor up.

- **`mentioned_in:` — the vertical axis's data.** A list of **distinct transcripts** that mention the competitor: one entry per participant, however many times they said the name in the session. Maintained by `/extract-findings` at processing time; aliases and product-family names attribute by judgment ("YouTube" → YouTube Music), noted in a comment when not literal. The app shows "Heard from N of M participants" on cards and clickable transcript pills in the detail view — so the strength claim is one click from its raw sources.

**Honesty rules:** proximity is a judgment call — write the reasoning next to it; `mentioned_in` can be empty simply because we never asked (a low dot is a research gap candidate, not an all-clear); one participant ≠ a trend; nothing on this map is a market-size estimate. The mechanism is market-agnostic — swap the product context and competitor set, and the same counting works for any industry.

## The Compare view (app) — project-specific axes, no vanity metrics

The Competitors tab's third view puts **up to three competitors side by side** (your own product can be a column too, via its `## Comparison` table in `Product Context.md`). What gets compared is deliberately not universal: the axes live in `Product Context.md` frontmatter — `compare_categories: [ … ]` — and are chosen **at project setup**, limited to what actually decides wins and losses in *this* market (pricing model, the contested capability, ownership, support…). Funding rounds, follower counts and other vanity metrics stay out by design.

Each competitor file mirrors those axes in its `## Comparison` table (`| Category | claim |`) — filled by desk research under the same rules as everything else here: **verified, sourced claims only**. A category that can't be verified is left out of the table, and the app renders it as an honest research gap rather than a guess.

## Gathering competitor insight

Review platforms — **G2, Capterra, TrustRadius** — are a genuinely good source of competitor insight (real users, structured complaints, segment hints). But they should **never be the only source**:

- **Your own interviews are the strongest signal** — when a participant brings up a competitor unprompted, that becomes a `Signal` with `competitors:` set, and the dot moves up the map. (`/extract-findings` handles this automatically.)
- Community threads and forums (this repo's Spotify examples cite them throughout), churn stories, public reports and filings, `/researcher` desk-research rounds — all feed the *Real user opinions* and *Market position* sections here, each with a public link and a `retrieved:` date.
- Review-platform findings are cited like any other web source: specific page, not a bare domain.
