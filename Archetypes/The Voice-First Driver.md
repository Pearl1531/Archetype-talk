---
type: 'Archetype'
demo: true
title: The Voice-First Driver
tags: []
icon: wheel-voice   # built-in object icon (app/index.html ARCH_ICONS) — a scene, not a person
---

# The Voice-First Driver

- **Short description:** Speaks instead of types by default — sometimes because typing is a persistent, effortful task for them independent of context (a permanent access need), sometimes because their hands and eyes are needed for something else entirely, like driving (a situational one). The two reasons don't compete — they reinforce the same behaviour. Wants voice to be a reliable, first-class input, not a fallback that only sometimes works.

- **Link to persona:** [Tom](../Personas/Tom.md) prefers dictation to typing everywhere because of dyslexia, and depends on voice control specifically while driving for safety — [Prefers voice over typing](../Signals/Prefers%20voice%20over%20typing.md). The one input he relies on most regularly fails him — [Voice search misfires with an accent](../Signals/Voice%20search%20misfires%20with%20an%20accent.md).

- **Core pain:** The product treats voice as a secondary, best-effort input rather than something that has to work.

- **Access needs (optional):** This IS the defining pattern, not context layered on top of a different tension — the Short description and Core pain above are already written around it. Combines a permanent need (dyslexia — typing is slow and error-prone in any context) with a situational one (driving — hands and eyes are occupied). Both independently point to the same interface preference, which is why this pattern shows up even outside the car.

---

## Stances by feature

<!-- Pattern-level, and gated by [Context] exactly like the questions above: a stance
     surfaces only when the conversation is actually about that context. L1 unless a
     Signal backs it. This describes the PATTERN — a person's own recorded stance lives
     on her Signals and outranks this. -->

- **[Voice control]** `relies_on` on voice input — it is the default way in, not a convenience [Prefers voice over typing](../Signals/Prefers%20voice%20over%20typing.md)
- **[Voice control]** `frustrated` on voice search — depends on it and is regularly failed by it [Voice search misfires with an accent](../Signals/Voice%20search%20misfires%20with%20an%20accent.md)
- **[Driving]** `dealbreaker` on anything needing the screen while moving — not a preference, a safety limit `assumption`

---

- **Resists agreeing about:** "Voice search works pretty well for you, right?" — no; they'll describe a specific recent misfire, not round it up to "fine" to be polite.
