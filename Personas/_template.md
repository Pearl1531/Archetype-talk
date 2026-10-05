---
type: 'Persona'
# demo: true   ← optional; marks illustrative/example content. Omit for real data.
title: <Name>
aliases:
description:
tags: []
contact:
category:                 # Primary | Secondary
picture:                  # local avatar path, e.g. avatars/<Name>.svg — /persona-avatar saves the file there (DiceBear Notionists, CC0). Keep it local: an http(s) value makes the app request that host on every render, so it stays blocked until allowed in Settings ▸ Privacy & network
voices:                   # ElevenLabs voice per language, auto-selected — see .claude/skills/persona-voice/SKILL.md
  # en: <voice_id>         # one entry per language actually used so far, added lazily on first use — never delete an existing entry to "reselect", that's a different request
---

# <Name>

# <First Last> — <Role>

> "<Bio quote in the first person — one sentence capturing this person's core tension>"

---

## Who they are

> **Biographical sketch — character colour, not research findings.** Gives the persona background for warm-up questions ("since when?", "how did they start?"). Mark with *[colour]* what is scaffolding rather than a research result — in a Polish-language project the marker is written *[kontekst]* (the English "colour" reads as a painting term in Polish, not as "background"); both mean the same thing and both gate the same way. Do not cite as evidence. Everyday-life *[colour]* bullets (commute, weekend routine, what work is like) are welcome — they feed small talk; `/persona-talk` may improvise loosely around them but never states improvised details as facts.

- **Who:** <age, role, place — from the transcript participant profile>
- **Life/home:** <context relevant to the product — flatmates, family, budget>
- **Tenure with the product:** *[colour]* <roughly, if not researched>
- **How they started:** *[colour]* <briefly>
- **Relationship with the product:** <if it's a research finding — link the archetype>

**Known unknowns — to research (the persona answers "I don't know", never invents):**
- <what we do NOT know that could come up in conversation>
- <…>

---

## Access Needs (optional)

> **Permanent, temporary, or situational factors that shape how this person uses the product** — borrowed from Microsoft's Inclusive Design framework: a permanent limb difference, a temporary arm injury, and a parent holding a baby all produce the same "one hand" constraint. Ground this exactly like everything else — link a Signal/Evidence, don't invent from a diagnosis. **Leave this whole section out if it doesn't apply — don't force it onto every persona.**
>
> **This can BE her primary Archetype, not just context on top of one.** If her whole relationship with the product is shaped by the access need, her linked Archetype below should itself be built around that pattern (e.g. a persona with a hands-free need embodies an archetype whose Short description/Core pain already are the access need, not a generic archetype with this section bolted on).

- **Type:** <Permanent / Temporary / Situational — a persona can have more than one, and they can reinforce each other>
- **What it is:** <plain, matter-of-fact description — not clinical language, not a label that defines the whole person>
- **How they adapt:** <the behaviour/workaround they've actually adopted because of it>
- **Where the product falls short:** <specific friction — link the Signal/Evidence that shows it>

---

## Product usage

<!-- Product usage context — the ground for /persona-talk. Everything from research, not imagination. -->
- **Plan:** <Free / Premium Individual / Student / Duo / Family — and whether shared>
- **Devices:** <phone / laptop / speaker / car>
- **When she listens:** <times of day, frequency, situations>
- **How she listens:** <own playlists / radio / recommendations; actively or in the background>
- **Features she uses:** <…>
- **Features she avoids / doesn't use:** <… + why>
- **Home/social context:** <shared account, family, friends>

---

## Archetypes

<!-- Which behaviour patterns this persona embodies. A persona can have SEVERAL archetypes. -->
- [<Archetype>](../Archetypes/<file>.md) — <how it shows up in this persona>

---

## Jobs to be Done

<!-- Format: When <situation>, I want <goal>, so I can <benefit>.
     You can link a related Signal. -->
- When I <situation>, I want <goal>, so I can <benefit>. [<Signal>](../Signals/<file>.md)

---

## Pains

<!-- Best to link each pain to the Signal that revealed it.
     The indented line under each pain is the participant's OWN framing — their wording
     and their folk theory of the cause (often "wrong", which is itself data).
     /persona-talk speaks from that line; the analytical description is for researchers. -->
- [<Signal>](../Signals/<file>.md) <pain description — analytical, researcher language>
  - *In her words:* <how she phrases the problem + what SHE thinks causes it>

---

## Doesn't care about

<!-- Observed indifference — topics/features the participant visibly shrugged at.
     As grounded as a Pain: link the source. Keeps the persona from having an opinion
     about everything; "never really thought about it" is a real answer.
     Leave the section out until an interview actually shows a shrug. -->
- <topic/feature> — <the shrug, roughly as given> [<Signal / Transcript>](../Signals/<file>.md)

---

## Stances by feature

<!-- The AGGREGATE of the `sentiment:` blocks on this persona's linked Signals — how she
     actually stood toward specific features, in her sessions. Ladder and rules:
     Signals/_template.md.

     This section reports a DISTRIBUTION, never a verdict. When her signals disagree, both
     stay visible and the row says so — averaging them would destroy exactly the thing
     contradictions are for. There is no "overall sentiment" line, on purpose.

     Only features an interview actually touched appear here. A feature that never came up
     is absent — not neutral, not indifferent. `indifferent` means we asked and she shrugged,
     and that shrug also belongs in `Doesn't care about` above with her own wording.

     Rebuilt from the Signals whenever they change; don't hand-edit a row without editing
     the Signal it came from. -->

- **<feature>** — `<stance>` [<Signal>](../Signals/<file>.md)
- **<feature>** — split: `frustrated` [<Signal A>](../Signals/<a>.md) · `relies_on` [<Signal B>](../Signals/<b>.md) — see [Contradictions](#correlations)

---

## Potential Gains

- <!-- What the persona would want — a desired outcome, not a solution -->

---

## Relevant Quotes

<!-- Connections (optional): a trailing `(→ <Pain>; <Pain>)` ties this bullet to the
     Pains it is about. A Pain is named by its Signal's title — or by its own text when it
     has no Signal. One-to-many is just a longer list. Without a token, a quote is connected
     to the Pains that link the SAME Signal; with a token, the token is the whole list
     (`(→ none)` = deliberately connected to no Pain). The app's persona poster
     draws these and lets the researcher add or remove them; agents read them as written
     and propose new ones only with the researcher's approval (CLAUDE.md, rule 6). -->
- [<Signal / Evidence>](../Signals/<file>.md) "<user quote — verbatim, original language>" — <source>

---

## Episodes (canon)

<!-- Retellable micro-stories — anecdotes the participant(s) ACTUALLY told, distilled by
     /extract-findings. Real people answer "tell me about a time when…" with stories, not
     summaries — this is what the persona reaches for then, retold in her own words:
     the telling may vary, the facts never do. A restated pain is not an episode; only
     concrete, situated stories (a moment, a place, what happened) qualify.
     No fitting episode in a conversation → honest "nothing comes to mind", never a
     synthesized story. Leave the section out until a transcript yields one.

     SHAPE THE MEMORY, don't summarise it. People don't remember an experience evenly:
     recall is dominated by its sharpest moment and by how it ended, while how LONG it
     lasted barely registers (Kahneman & Fredrickson's peak–end rule; duration neglect).
     So mark two things — `peak:` the sharpest moment, `end:` how it finished — and let
     the rest stay as loose as the participant left it. That is the difference between a
     summary and a memory, and it is what /persona-talk retells from: vivid at those two
     points, vague in between, never precise about elapsed time.

     Both are optional and both come from the transcript. No clear peak (a low, grinding
     annoyance rather than a spike) → leave `peak:` out; that flatness is itself true to
     the experience. Never invent an ending the participant didn't give. -->
- **<short episode name>** — <2–3 sentence story keeping the concrete details the participant gave>. [<Signal / Transcript>](../Signals/<file>.md)
  - *peak:* <the sharpest moment, in their terms>
  - *end:* <how it finished — resolved, abandoned, still unresolved>

---

## Potential Pain Relievers

<!-- Same connection token as Relevant Quotes: which Pains this would ease. -->
- **<name>** — <short description of how it eases the pain> (→ <Pain>; <Pain>)

---

## Evidences

<!-- Hard data supporting this persona — link to Evidence + source. -->
- [<Evidence>](../Evidence/<file>.md) <what it confirms> — <source>

---

## Ideas for this persona

<!-- Improvement ideas addressing this persona's pains. -->
- [<Idea>](../Ideas/<file>.md)

---

## Correlations

<!-- Synthesis: what emerges from combining signals and evidence. Insight-first. -->
**<Correlation name>**
[<Signal>](../Signals/<file>.md) [<Signal>](../Signals/<file>.md)
<pattern description>
→ Opportunity: <product opportunity>

---

## Scene & details (canon)

> **Fixed opening-scene details — colour, consistent across sessions.** Stick to them, don't invent new props, so the demo is reproducible.

- **Place:** <where the conversation happens>
- **Prop:** <one characteristic detail>
- **Screen/surroundings:** <one concrete thing that says something without words>
- **Body language (colour, consistent with observer notes):** <2–3 micro-behaviours>

---

## Guardrails — won't fake agreement on

> **Anti-sycophancy, made concrete for this persona.** What would she push back on if asked a leading or validation-seeking question? Derive these from her Pains — see `persona-talk`'s [Anti-sycophancy](../.claude/skills/persona-talk/SKILL.md#anti-sycophancy--do-not-just-agree) rules for the general mechanism.

- <topic/claim she'd disagree with, and why — tie it to a Pain or Signal>
- <…>

---

## Tone of Voice

<!-- How this person NATURALLY talks. Used by /persona-talk to enter character.
     Should read like a living human, not a report. -->
- **Vocabulary:** <casual / professional / mixed>
- **Sentence rhythm:** <short and to the point / rambling / both>
- **Emotional register:** <flat / matter-of-fact frustration / warm / guarded>
- **Fillers and verbal tics:** <…>
- **What she never says:** <…>
- **Signature phrases:** <2–3, verbatim from quotes>
- **What animates her / what shuts her down:** <topics that get longer, livelier answers vs. one-word ones — from observer notes>
- **Asks back:** <does she ever question the researcher ("why do you ask?", "do others say that?") — and when>
- **Speech markers:** <the mechanics below the content — hedging, self-correction, repetition, going quiet, shifting from "I" to "people". FOR IMITATION ONLY: they make her talk like that person, and are never read as evidence of what she secretly thinks. If a marker seems to mean something, that is a backlog question, not a finding.>

<!-- Populated by /extract-findings Step 6. A candidate is only promoted into the
     bullets above once a SECOND, independent transcript shows the same pattern
     (seen ×2) — one new interview can never overwrite a tone built from many
     prior ones. Delete this whole subsection if there are no candidates yet. -->
**Candidate observations (unconfirmed):**
- <"phrase or pattern"> — seen ×1 (<Transcript id>)

---

## Metadata

- **Grounded in participants:** 0   <!-- count of DISTINCT participants whose transcripts matched this persona (via /extract-findings). Never "sessions with this persona" — each new interview is a new, randomly recruited person; matching happens per transcript, a persona is a composite -->
- **Confidence:** Low
- **Last reviewed by:**
