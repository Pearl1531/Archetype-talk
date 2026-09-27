# Persona avatars

Generated with [DiceBear](https://www.dicebear.com) — style **Notionists** by Zoish, licensed **CC0 1.0** (public domain; the visual language of Notion-style faces without Notion's brand-asset restrictions). Deterministic: the seed + traits in the generating URL always render the same face; the local `.svg` here is the canonical offline/export copy.

Avatars depict **fictional personas only**, never real research participants.

**Drawn is one of two options.** For photorealistic persona imagery — generated faces, their sources, licences and sizing — see [`../photos/README.md`](../photos/README.md). Drawn wins when the persona should not read as a photographed person at all; it is also the style the demo project uses throughout.

> **For any AI agent — Claude, Codex, Gemini, Cline, Copilot, whichever you are.**
> In Claude Code this runs as `/persona-avatar`; everywhere else there are no
> slash-commands, so follow the procedure below directly. The full skill file is
> [.claude/skills/persona-avatar/SKILL.md](../../.claude/skills/persona-avatar/SKILL.md)
> — the `.claude/` name is historical, not a scope. This README is the
> tool-agnostic short form plus the practical details that only show up when you
> actually do it.

---

## Rule zero — consent before generation

**Never generate an avatar on your own initiative.** Offer it in one line at the natural moment (right after a persona file is created) and wait for a yes. Two reasons, both real: it makes a network call to a third party, and it writes into the user's repo.

If `.claude/preferences.local.md` carries `data_residency: EU`, name the service and ask first — `api.dicebear.com` is outside the EU. Absent field = no constraint.

A persona with no avatar is not broken: the app falls back to initials. Missing faces are a smaller problem than faces nobody asked for.

## Procedure

### 1. Read the persona, derive the look

The avatar should look like the persona *reads*. Pull the vibe from `## Who they are` and `## Tone of voice`; take apparent age from the bio. Translate into three parameters:

| Parameter | Use |
|---|---|
| `gestureProbability=0` | always — portraits read better without hands |
| `beardProbability=<0–100>` | plausibility for the persona, not certainty |
| `glassesProbability=<0–100>` | same |

DiceBear traits are **numbered variants, not semantic** — you cannot request "tired 40-year-old accountant". This is why step 2 exists.

### 2. Generate candidates and look at them

Do not pick blind from a URL. Generate 4 candidates per persona as **PNG** (the review format), vary the seed, then actually look:

```bash
for i in 1 2 3 4; do
  curl -s -o "Marta-$i.png" \
    "https://api.dicebear.com/9.x/notionists/png?seed=Marta-$i&gestureProbability=0&beardProbability=0&glassesProbability=40&size=140"
done
```

**How to view them — this is the part that wastes an hour if nobody tells you.** Build one HTML contact sheet and screenshot it in a browser tool, instead of opening 20 image files one at a time.

The trap: a preview pane that renders local HTML usually converts the page to a `data:` URL under a strict CSP (`img-src data: blob:`). Relative `<img src="Marta-1.png">` then renders as **empty grey boxes** — the layout appears, the faces do not, and it looks like the download failed. It didn't.

Fix: inline every PNG as a base64 data URI.

```python
import base64
b64 = base64.b64encode(open("Marta-1.png","rb").read()).decode()
# <img src="data:image/png;base64,{b64}">
```

Lay the sheet out as one labelled row per persona, four candidates per row, and take a single screenshot. One image, every candidate, one decision.

Second trap, same area: **keep the page under ~500 KB.** A preview pane refuses to open larger local files and reports it as though the file were missing or unreadable, which sends you hunting for a path bug that isn't there. Shrink the thumbnails first — on macOS `sips -Z 120 -s format jpeg -s formatOptions 40 in.jpg --out out.jpg` needs nothing installed.

And whichever way you review them: **the user picks, not you.** Hand over the sheet and wait. A face that contradicts the character described three paragraphs below it is obvious to whoever wrote that character, and invisible to you.

If your agent has no browser tool, read the PNGs one by one — slower and heavier on context, but it still beats guessing.

### 3. Download the pick as SVG

**SVG is the canonical stored form**; the PNGs were only for reviewing. Same seed and parameters, `/svg` instead of `/png`, no `size`:

```bash
curl -sL -o "Personas/avatars/Marta.svg" \
  "https://api.dicebear.com/9.x/notionists/svg?seed=Marta-3&gestureProbability=0&beardProbability=0&glassesProbability=40"
```

File name matches the persona's file name (`Personas/Marta.md` → `avatars/Marta.svg`). Non-ASCII names are fine — `Paweł.svg` works; links to it need URL-encoding like every other link in this repo.

### 4. Wire it into the persona's frontmatter

```yaml
picture: avatars/Marta.svg   # local file — the app never fetches avatars. DiceBear Notionists (CC0); regenerate from https://api.dicebear.com/9.x/notionists/svg?seed=Marta-3&gestureProbability=0&beardProbability=0&glassesProbability=40
```

Two rules inside that one line:

- **Never write an `http(s)` value into `picture:` or `photo:`.** The app would request that host on every render, breaking the promise that opening a file makes no network calls — so it blocks such images until the user opts in under Settings ▸ Privacy & network, and shows initials meanwhile.
- **Keep the generating URL in the trailing comment.** That is what makes regeneration deterministic at zero privacy cost. Drop it and the face becomes unreproducible.

### 5. Check uniqueness before you finish

One persona, one face — never reuse another persona's seed or file. Cheap verification:

```bash
md5 -q Personas/avatars/*.svg | sort | uniq -d   # any output = a duplicated face
```

Two personas with the same face is the kind of error nobody notices until a workshop.

### 6. Rebuild only what changed

- The persona is part of the **demo set** (`demo: true`) → `python3 scripts/embed_demo.py`, which inlines local avatars into the shipped single file.
- The persona is **real project content** → do **not** run `embed_demo.py`. It also pulls root `Product Context.md` and `Research backlog.md` into the demo bundle, so running it after real-project edits contaminates the Demo workspace.
- Then `python3 scripts/graph_index.py build` so the index reflects the new frontmatter.

## Regeneration is cheap

"Give her a different face" is a normal request, not a redo of anything expensive: replace the SVG, update the seed in the comment, done. Say which persona and it takes one command.

## Related, different rules

- **Archetype icons are objects, never faces.** An archetype is a *type*, not a person. Set `icon: <name>` from the app's built-in set, chosen so the metaphor restates the archetype's Core pain. Details in the skill file.
- **Competitor tiles** default to neutral initials; a favicon is fetched only on request and stored **inline as a base64 data URI** so everything keeps working offline. Details in the skill file.
- Never redraw trademarked logos by hand, and never attempt likeness to a real person.
