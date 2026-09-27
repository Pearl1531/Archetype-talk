---
name: persona-voice
description: Give a persona an ElevenLabs voice (one per language, auto-selected by traits) so /persona-talk replies can be spoken via [speak]. Use when the user runs /persona-voice, types [speak], or asks about persona voices in plain language.
---

# persona-voice — Give a Persona an ElevenLabs Voice

Connects a persona to one or more [ElevenLabs](https://elevenlabs.io) voices — one per language she's actually spoken in — so `/persona-talk` replies can be heard, not just read. Auto-selects a voice matching the current conversation's language and the persona's traits, keeps every persona vocally distinct from every other, and generates audio on demand — never automatically, never without the anonymization step below.

**Requires** `ELEVENLABS_API_KEY` in `.env` (already `.gitignore`d in this repo). If it's missing, say so plainly and stop — never ask the user to paste a key into chat.

## Trigger

```
/persona-voice Personas/Emma.md      ← configure (or re-configure) a voice for this persona
[speak]                              ← mid-conversation in /persona-talk: voice the last reply
```

Also loads whenever the user asks about persona voices in plain language ("can Emma have a voice?", "change Jake's voice", "what does Tom sound like?") — this isn't limited to the two triggers above. Offered once during `/welcome`'s Step 4 setup, but just as available any time after — configuration is never a one-time locked-in choice.

## Configuration — one voice per language, auto-selected, always reported, always changeable

A persona can end up with **several voices — one per language she's actually been voiced in**, not just one fixed voice overall. The same persona answering in English one session and Polish the next should sound like two different, language-native voices, not one voice stretched across languages by a multilingual model — that matches ElevenLabs' own guidance that a native voice per language gives the best result. Stored as a map on the Persona file (`voices:`), populated lazily: only the languages actually used get an entry, nothing upfront.

1. **Detect which language is needed right now** — the language of the **current conversation** (`persona-talk` already adapts to whatever language the user is writing in), not necessarily the language her `Transcripts/` were recorded in. A persona whose source data is all in English can still need a Polish voice if that's what this session is in.
2. **Check her `voices:` map first.** An entry already there for this language means: use that `voice_id`, nothing else to do — this is what makes the choice stick once made.
3. **Missing entry → auto-select, no confirmation prompt.** Search the **full shared voice library** (`GET /v1/shared-voices`, filterable by `language`/`locale`/`gender`/`descriptive`/`age`) rather than just the ~28 default voices sitting on the account (`GET /v1/voices`) — the default set is generic/stock-sounding by comparison; the shared library's `descriptive`/`use_case` fields (e.g. "casual", "conversational") match a persona's actual `Tone of Voice` far better than the handful of preset options. A shared-library voice can be used directly in a text-to-speech call by its `voice_id`, no separate "add to account" step needed. Filter by the language plus whatever the Persona file implies about her (apparent age, gender, `Tone of Voice` register). **Never pick a `voice_id` already used by a *different* persona** — read every other file in `Personas/` and exclude anything already claimed anywhere in their `voices:` maps, so personas stay vocally distinct from each other. (The same persona reusing a similar-sounding voice_id across her *own* different languages isn't a conflict — that check is cross-persona, not cross-language.)
4. **Always say what got picked, right after.** One line is enough: *"Emma now has a Polish voice too (separate from her English one) — want a different one? Just tell me a specific voice, or ask me to try again."* Never silently pick and move on.
5. **Persist it** — add or update that language's entry in her `voices:` map (see `Personas/_template.md`). Data like everything else in this graph, not a hidden setting.
6. **Changing it later is a normal request, not a special flow** — "give Emma a different Polish voice" replaces just that one language entry; her other languages are untouched. "Use voice `<id>` for Tom's English" sets it directly, no filtering needed.

## Before any text reaches ElevenLabs — anonymize, every time

This is a hard rule, not a courtesy: **strip identifying details from the text before it ever leaves the repo**, whether it's a live `[speak]` reply or a one-off demo clip.

- Remove/replace: a real participant's real name, employer, exact street/neighborhood, phone/email, or any other detail that could identify a real person — swap in the fictional persona's own name or a generic term instead.
- For this repo's current demo content, this is close to a no-op — Emma/Jake/Tom are already fictional stand-ins with no real PII in their lines. The rule exists so this stays correct the day real participant data flows through the same path; don't skip writing/checking it just because today's pass-through is trivial.
- Only the persona's spoken words get anonymized-then-sent — never send the researcher-context block, frontmatter, or any file metadata to the API. ElevenLabs only ever sees a line of in-character dialogue, nothing else.

## `[speak]` — voice the last reply

1. Take the persona's most recent **in-character reply only** — never the researcher-context block, never a footnote line.
2. Run it through the anonymization step above.
3. Look up the `voice_id` for **this conversation's current language** in her `voices:` map. If that language has no entry yet, run the Configuration step above first (it's a normal part of `[speak]`, not a separate blocking step the user has to remember to do beforehand).
4. Call ElevenLabs' text-to-speech endpoint with that `voice_id`, using `eleven_v3` as the default model — the most expressive/natural option on this account, clearly better than `eleven_multilingual_v2` for how alive a reply sounds. It responds to inline audio tags (`[laughs]`, `[sighs]`, etc.) placed directly in the text — use one only where the reply already implies that beat (e.g. a stage direction like "(laughs)" in the source text becomes `[laughs]`), never invented for effect. Confirm the exact current endpoint/parameters against ElevenLabs' live docs regardless — API surfaces drift, don't assume a hardcoded shape is still current.
5. Save the returned audio to `.claude/voice-cache/` (gitignored — binary audio never belongs in this git-based markdown graph) and tell the user the file path so they can play it.

## Cost awareness

ElevenLabs is a metered, paid API. `[speak]` is opt-in per-reply by design — never suggest generating audio for a whole conversation's worth of replies at once, and never trigger it automatically just because the researcher-context block escalated to full tier.

## One-off demo clip

The same `[speak]` pipeline, run once against a real representative English exchange, produces a standalone audio file meant for the user to upload to ElevenLabs themselves however they want it hosted. Not an automated or repeating task — just this same mechanism, used once, on request.
