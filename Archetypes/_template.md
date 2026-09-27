---
type: 'Archetype'
# demo: true   ← optional; marks illustrative/example content. Omit for real data.
title: <The Archetype Name>
tags: []
icon:   # optional object icon shown in the app — a SCENE/OBJECT representing the pattern, never a person (people belong to Personas). Built-in names: headphones-mug, drifting-shuffle, record-crate, wheel-voice, radio-waves, shared-mixtape, balance-scale — or set picture: <url> for a custom one

---

# <The Archetype Name>

- **Short description:** <!-- The behaviour pattern — a *type* of person, not a specific one.
  Describe the tension, motivation, and context. No name, no age. -->

- **Link to persona:** <!-- Which persona embodies this pattern and through what.
  Reference pain/signal tags, e.g. (`P4`), (`Q3`). -->

- **Core pain:** <!-- The core tension of this archetype in one sentence. Always safe to surface —
  it's the one-line identity summary, not tied to any specific task. -->

## Questions by context

<!-- The concrete questions/curiosities someone embodying this archetype would actually have —
     grouped by the task or situation they're in when they'd ask them. This is what makes the
     archetype usable in conversation instead of a one-line abstraction.

     `persona-talk` only surfaces a bullet when the CURRENT conversation is actually about that
     tagged context — so a fact tied to [Driving] never leaks into a reply about [Playlist editing].
     This is the anti-leakage mechanism: gate by tag, don't rely on the model "remembering not to".

     Level 1 (archetype) is assumption-tier by default — tag `assumption` unless a Signal
     confirms it, then link the Signal and it inherits that Signal's grounding. -->

- **[<Context tag, e.g. Playlist editing>]** <question, first person, as they'd actually think it> `assumption`
- **[<Context tag>]** <question> [<Signal>](../Signals/<file>.md)

## Stances by feature

<!-- Where this pattern stands on specific features — the same anti-leakage gate as above:
     a stance surfaces ONLY when the current topic matches its [Context] tag, so a stance
     about voice control never colours a reply about playlist editing.

     Same ladder as Signals/_template.md (dealbreaker · resents · frustrated · wary ·
     indifferent · unaware · curious · appreciates · relies_on · advocates · mixed), and the
     same rules: no entry means "not observed", never neutral; the order is for reading,
     never for arithmetic; `mixed` is not the middle, `indifferent` is.

     Level 1 by default like everything else here — tag `assumption` unless a Signal backs it,
     then link the Signal and it inherits that grounding. An archetype-level stance describes
     the PATTERN; the person-level fact lives on the Signal.

     `Resists agreeing about` below is the special case of a stance: what this pattern will
     not perform enthusiasm about, however leading the question. -->

- **[<Context tag>]** `<stance>` on <feature> — <the observable behind it> `assumption`
- **[<Context tag>]** `<stance>` on <feature> — <observable> [<Signal>](../Signals/<file>.md)

---

- **Access needs (optional):** <!-- Permanent, temporary, or situational factors (Microsoft's
  Inclusive Design framework). Two shapes this can take:
  (a) it IS the defining pattern — the archetype's whole tension comes from it, in which case
      Short description and Core pain above should already be written around it, and this
      bullet just names the P/T/S type explicitly for scanning/wiring;
  (b) it's a supplementary factor layered onto an otherwise-different tension.
  Omit entirely if not applicable; don't force it onto every archetype. -->

- **Resists agreeing about:** <!-- Anti-sycophancy, at the pattern level: what would someone
  embodying this archetype push back on if asked a leading question? Ties the tension to a
  concrete disagreement, not just a mood. -->
