---
name: persona-avatar
description: Generate a Notion-style DiceBear avatar for a persona and wire it into her picture field. Use on /persona-avatar or when the user asks for persona avatars/faces/pictures.
---

# persona-avatar — A face for the persona (CC0, character-matched)

Generate an avatar in the Notion-faces visual language using **DiceBear's "Notionists" style (by Zoish, CC0 1.0 — public domain)**. Deliberately NOT the official faces.notion.com builder: Notion publishes no license permitting redistribution of its avatars in an open repo, while the DiceBear remix is free for any use. Same aesthetic, zero legal risk.

## Trigger

```
/persona-avatar Personas/Emma.md          ← generate (or regenerate) for one persona
/persona-avatar --all                     ← every persona missing a picture
```

Also **offer** this (one line, easy to decline) at the natural moment: right after `persona-workshop` / `ai-persona` finishes creating a persona file. **Consent first, always — never generate on your own initiative.** Network calls and repo writes both require the user's yes.

## Character → appearance mapping

The avatar should *look like the persona reads*. Derive traits from the persona file, then translate:

- **Who they are / Tone of Voice** → overall vibe candidates (tired-practical vs. energetic-social vs. sturdy-field-worker…)
- Apparent age/gender from the bio → pick among seed candidates by eye, not by assumption alone
- Concrete signals worth honoring: glasses/beard plausibility for the demographic, `beardProbability` / `glassesProbability` / `gestureProbability=0` (portraits read better without hands)
- DiceBear traits are numbered variants, not semantic — so **generate a small candidate grid (6–8 seeds) and pick visually**, don't guess blind. Show the user the chosen one (or the grid, if they want to choose themselves).

## Pipeline

1. Read the persona; propose the plan in one line ("generate a CC0 Notion-style avatar matched to her character?"). Wait for yes.
2. Build candidate URLs: `https://api.dicebear.com/9.x/notionists/svg?seed=<seed>&gestureProbability=0&beardProbability=<n>&glassesProbability=<n>` — vary seeds (name, role, traits as seed strings). Deterministic: same URL = same face, forever.
   **How to actually look at them:** render the candidates as PNG, build one HTML contact sheet (a labelled row per persona) and screenshot it — one image, every candidate, one decision. A preview pane usually serves local HTML under a CSP that allows only `img-src data:`, so relative `<img src="x.png">` renders as empty grey boxes; inline each PNG as a base64 data URI and they appear. Worked example and commands: [Personas/avatars/README.md](../../../Personas/avatars/README.md).
3. Pick the best match (or let the user pick). One persona = one face; **never reuse another persona's exact URL** — personas stay visually distinct (same rule as `persona-voice` voice_ids). Verify before finishing: `md5 -q Personas/avatars/*.svg | sort | uniq -d` must print nothing.
4. **Download the SVG** to `Personas/avatars/<Name>.svg` — that local file is the canonical copy — and point the frontmatter at it, never at the remote URL:
   ```yaml
   picture: avatars/<Name>.svg   # local file — the app never fetches avatars. DiceBear Notionists (CC0); regenerate from <the exact dicebear URL>
   ```
   **Never write an `http(s)` value into `picture:`/`photo:`.** The app would request that host every time the file renders, which breaks the promise that opening it makes no network requests — so it blocks such images until the user opts in (Settings ▸ Privacy & network) and shows initials meanwhile. Keeping the generating URL in the trailing comment preserves reproducibility at zero privacy cost.
5. The app resolves the relative path against the persona's folder (initials fallback when the file is missing). If the persona is part of the embedded demo set, re-run `python3 scripts/embed_demo.py` — it inlines local avatars into the shipped single file.
6. Report what was picked and why ("tired-practical, headphones vibe → seed Emma-3"), same one-line transparency rule as persona-voice.

## Archetype icons — objects, never people

Archetypes get avatars too, but of a different kind: **an object/scene illustrating the behaviour pattern** (Fallout-skill-style illustration, played straight — no comedy), never a human face (faces belong to Personas; an archetype is a *type*, not a person). Implementation:

- The app ships a built-in hand-drawn icon set (`ARCH_ICONS` in `app/index.html`), same line style as everything else. Current names: `headphones-mug`, `drifting-shuffle`, `record-crate`, `wheel-voice`, `radio-waves`, `shared-mixtape`, `balance-scale`.
- Set the archetype's frontmatter `icon: <name>` — **pick by meaning**: the metaphor should restate the Core pain/tension (Voice-First Driver → steering wheel + speech bubble), not decorate it.
- No fitting built-in? Two honest options: add a new SVG to `ARCH_ICONS` in the same style (64 viewBox, `stroke="currentColor"`, width 3, round caps, fill none, an object scene) and re-run `python3 scripts/embed_demo.py` if demo content changed — or save an image the user provides into the repo and set `picture:` to its relative path (same local-only rule as persona faces).
- Same consent rule as persona faces: offer at archetype creation (persona-workshop Level 1), never assign silently.

## Competitor tiles — initials by default, favicon on request, stored offline

The competitor map/cards/tables show a neutral initials tile by default. **On the user's request** (never unprompted), give a competitor its favicon — stored **inline as a base64 data URI in `picture:`**, so after the one-time fetch everything works fully offline (embedded demo, zip export, no network at render time).

**AI pipeline (the reliable path — no browser CORS limits):**
```
curl -sL "https://www.google.com/s2/favicons?domain=<their-domain>&sz=64" -o /tmp/fav.png
base64 -i /tmp/fav.png   # → picture: data:image/png;base64,<...>
```
Write it into the competitor's frontmatter with a comment noting the domain and fetch date; if the file is part of the demo set, re-run `python3 scripts/embed_demo.py`. Favicons are ~0.3–1 KB — frontmatter stays manageable.

**In-app options (Chromium, folder loaded via Load / refresh):** the competitor detail view has *Fetch favicon* (tries the same service from the browser; may be CORS-blocked — then it suggests this AI path), *Upload icon…* (any local image, auto-shrunk to 64px PNG), and *Remove*. All three write straight into the .md file.

Rules: this is plain nominative use of a company's own public favicon — never redraw trademarked logos by hand, never bulk-assign across all competitors unprompted, and replace/remove is always one request away.

## Rules

- **CC0 only.** If the user asks for the official Notion Faces builder, explain the license gap and offer this instead; if they insist on manually exporting one themselves at faces.notion.com, that's their call — don't automate it.
- **Fictional faces for fictional people.** Avatars represent personas, never real research participants — do not attempt likeness to any real person, and never generate from a participant photo.
- Regeneration is a normal request ("give Emma a different avatar") — replace the URL + local SVG, done. Changing it is cheap by design.
- `exports` (one-pagers) use the local SVG, not the URL — deliverables must not depend on a third-party API being up.
