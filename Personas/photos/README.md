# Persona photos

Photorealistic persona imagery, as an alternative to the drawn avatars in [`../avatars/`](../avatars/README.md). Source: [Lummi](https://www.lummi.ai) — **AI-generated** stock imagery.

> **For any AI agent — Claude, Codex, Gemini, whichever you are.** This folder has
> different rules from `avatars/`: a different source, a different licence, and one
> honesty problem that the drawn avatars do not have. Read this before adding a photo.

## The honesty problem — read this first

A photorealistic face makes a persona **look like someone we interviewed**. A drawn avatar says "constructed" by itself; a photograph does not. Every persona in this project is **L2 — built from desk research, zero interviews** — so the picture is making a claim the data does not support.

That is not a reason to avoid photos. It is a reason to:

- keep the L2 warning block at the top of the persona file, always;
- record in the frontmatter comment that the image is **AI-generated**, so nobody six months from now mistakes it for a participant photo;
- never place a persona photo next to real transcript material without a caption saying which is which.

**Never use a photo of a real person for a persona**, stock or otherwise — and never anything resembling an actual research participant. AI-generated imagery is preferred here precisely because no real individual's likeness gets attached to invented statements.

## Where the faces come from — four routes, and when each wins

| Route | Realism | Steerable? | Use it when |
|---|---|---|---|
| **[thispersondoesnotexist.com](https://thispersondoesnotexist.com)** (StyleGAN, NVIDIA) | highest — reads as a snapshot, not a shoot | **no** — every request is a random face | the default for photorealistic personas |
| **[Lummi](https://www.lummi.ai)** | good, but visibly *stock* — lit, posed, styled | yes, by search terms | you need a specific scene (at a desk, on a call) more than a specific face |
| **DiceBear Notionists** — see [`../avatars/README.md`](../avatars/README.md) | drawn, obviously a construct | partly, by explicit traits | the persona should not read as a photographed person at all; also the style used by the demo project |
| **User-supplied file** | whatever they hand you | n/a | the user already has an image — see below |

**The trade-off is real and worth stating to the user:** thispersondoesnotexist gives the most convincing faces and *no* control — you cannot ask it for "a 52-year-old accountant". Lummi lets you search but everything looks like stock photography, which is exactly the look a persona should avoid.

The way through the no-control problem is volume plus triage: pull 40–60 faces, contact-sheet them, sort by apparent age and sex, then shortlist per persona. Endpoint and mechanics are under *How to fetch one*.

### Two selection criteria that are easy to get wrong

- **Realistic beats attractive.** Generated sets skew young, symmetrical and well-lit. A persona that looks like a model quietly undermines the file it sits in. Prefer ordinary faces, ordinary light, ordinary expressions.
- **Match the project's demography.** These personas are Polish employers, so the plausible face is Central European and the age must match the bio — a 52-year-old in the file needs a 52-year-old in the frame, and generated sets rarely offer many. Expect to sample more to fill the older roles.

### Licence status of thispersondoesnotexist — read before shipping

The site publishes **no explicit licence**, and the copyright status of GAN output is unsettled. The images are widely treated as free to use, and there is no real individual to hold a likeness claim — but the model was trained on photographs of real people (FFHQ), and generated faces can in principle resemble someone in that set.

Practical position: fine for internal research artefacts like these persona files. **For a public commercial deliverable, verify first** — or use Lummi, whose licence is written down and dated in the table below.

## Licence (checked 2026-08-22)

Per [lummi.ai/license](https://www.lummi.ai/license):

| Allowed | Not allowed |
|---|---|
| personal **and commercial** use, no limits | reselling the images |
| no attribution required (appreciated, not obligatory) | bundling them into a competing stock-image service |
| editing, remixing, combining | claiming ownership of them |
| use in websites, templates, eBooks | implying the artist gave up their rights |

Free and Pro accounts carry **the same licence rights** — Pro buys convenience, not permissions. One image per persona inside a project repository is ordinary use and well inside these terms.

Re-verify the licence before any bulk use; terms change and this table has a date on it.

## Sizing — no larger than the app can show

The poster view renders the hero image at `max-height: 480px` ([`app/src/css/09-persona-poster.css`](../../app/src/css/09-persona-poster.css)). The persona detail page renders `picture:` in a square avatar box, `object-fit: cover` — a tall portrait centre-cropped there **cuts the face off**, so the square needs its own crop.

So each persona gets two files, both WebP:

| File | Purpose | Size | Weight |
|---|---|---|---|
| `<Name>.webp` | poster hero (`photo:`) | 700 px wide | ~40 KB |
| `<Name>-square.webp` | avatar slot (`picture:`) | 420 × 420, cropped on the face | ~20 KB |

700 px wide covers a 2× display at 480 px height and nothing beyond it. **WebP matters here**: the same frame as PNG is ~780 KB — eighteen times heavier for no visible gain.

## How to fetch one — thispersondoesnotexist

The site now serves a page, not a raw image. The image itself is at `/random-person.jpeg`, one fresh 1024 × 1024 JPEG (~550 KB) per request. Send a browser `User-Agent` **and** a `Referer`, or you may get the HTML back instead.

```bash
curl -sL -A "Mozilla/5.0" -e "https://thispersondoesnotexist.com/" \
  -o face.jpg "https://thispersondoesnotexist.com/random-person.jpeg"
```

Pull 40–60 of them with a short delay between requests, then review as one contact sheet — the method, including the base64/CSP trap, is in [`../avatars/README.md`](../avatars/README.md). Two practical notes:

- **Resize before building the sheet.** On macOS `sips -Z 120 -s format jpeg -s formatOptions 40 in.jpg --out out.jpg` needs no dependencies. Full-size frames make the page hundreds of megabytes.
- **Keep the sheet under ~500 KB.** The preview pane refuses to open larger local pages, and the failure reads as "file missing", which sends you looking in the wrong place.

Once the user has chosen, resize the winner to the two sizes in the table above and convert to WebP: `sips -Z 700 -s format webp` for the poster, and a square crop for the avatar slot.

## How to fetch one — Lummi

Lummi's CDN takes imgix-style parameters. `crop=faces` is honoured, and it is what saves the square crop.

```bash
HASH=QmQJSyjdqrceaYWZZfhivZHXBe2HwTqMro7FzKqJmd937V   # from the photo page's og:image

# poster hero — tall
curl -sL -A "Mozilla/5.0" -o "Personas/photos/Nina.webp" \
  "https://assets.lummi.ai/assets/$HASH?w=700&q=72&fm=webp"

# avatar slot — square, cropped on the face
curl -sL -A "Mozilla/5.0" -o "Personas/photos/Nina-square.webp" \
  "https://assets.lummi.ai/assets/$HASH?w=420&h=420&fit=crop&crop=faces&fm=webp&q=72"
```

**When `crop=faces` is not enough.** It picks *where* to crop, not *how tight* — so on a frame that is a scene rather than a portrait (someone at a desk, reading, mid-room), it keeps the whole scene and the face ends up tiny in the avatar tile. Switch to face-area cropping, which scales to the detected face:

```bash
  "…?w=420&h=420&fit=facearea&facepad=3.0&fm=webp&q=72"
```

`facepad=3.0` gives head-and-shoulders, which matches how portrait-style frames crop anyway. `facepad=2.0` is tighter and tends to cut the top of the head. **Always look at the square crops side by side before committing** — this is the one that silently goes wrong, and it goes wrong only for some images.

Verify you actually got WebP and not a PNG fallback — `file <name>.webp` must say `Web/P image`. Without `fm=webp`, `auto=format` returns PNG to a plain HTTP client, because format negotiation depends on an `Accept` header a browser sends and `curl` does not.

## Wiring it into the persona

```yaml
picture: photos/<Name>-square.webp   # local file — the app never fetches images. Lummi (AI-generated, free licence, no attribution required); source <photo page URL> · author <name> · 420x420 crop=faces, WebP
photo: photos/<Name>.webp            # poster hero, local file. Same source; 700px wide WebP
```

Both fields take **a path relative to the persona's own folder**. **Never an `http(s)` value** — the app would request that host on every render, breaking the promise that opening a file makes no network calls, so it blocks such images until the user opts in under Settings ▸ Privacy & network.

The folder loader accepts `.svg`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif` and walks subfolders, so `photos/…` resolves the same way `avatars/…` does.

## User-supplied images

The user may hand you a file instead of asking you to find one. Take it, resize it to the two sizes above, and store it here like any other — but **the frontmatter comment must record where it came from**, because six months later nobody can tell a generated face from a photograph by looking at it:

```yaml
picture: photos/<Name>-square.webp   # local file. AI-generated, supplied by the user (<generator, e.g. Midjourney / thispersondoesnotexist / Stable Diffusion>), added <date>
```

If the user does not say which generator produced it, **ask** — "generated, source unknown" is still an honest note and far better than silence. And if the image turns out to be a photograph of a real person, stop: that is the one case this folder does not allow, whoever supplied it.

## Choosing the image

The user picks, not you. Assemble candidates, hand them over, wait. Faces are the one thing where "close enough" is visibly wrong to the person who wrote the persona — and a wrong face quietly contradicts the character described three paragraphs below it.
