# app/src/img — pictures the single-file app carries with it

`scripts/build_app.py` swaps every `__IMG:name__` token in the build for the
data: URI of the file with that name here. That is the only way a picture can
travel with this app: it ships as one HTML file you can e-mail, and its CSP
allows `data:` images and no remote host at all.

A file that is missing is not a build error — the token becomes an empty
string, the markup that uses it renders nothing, and the build prints which
file it was looking for. So a step of the welcome wizard keeps working while
its screenshot is still being made.

## What is expected here

| file | used by |
|---|---|
| `wizard-graph.jpg` | welcome step 2, "What this repository is" — the mind map |

Both are shown in a band of ~512×132 CSS px (the card's full width; it never
grows for a picture), so they are stored **already cut to that proportion**,
≈3.9:1. Cropping in the file rather than hiding most of a whole screenshot
behind `object-fit` is what keeps them small — and an inlined image is base64,
which costs a third more than the file on disk and is downloaded whole before
the first screen renders. Aim under 60 KB each.

## Cutting a new one

`sips` ships with macOS. WebP is read-only there, so these are JPEG.

```bash
# 1. crop the interesting band out of the screenshot: -c HEIGHT WIDTH, then
#    --cropOffset TOP LEFT. Pick HEIGHT ≈ WIDTH / 3.9.
sips -c 315 1223 --cropOffset 120 0 shot.png --out /tmp/band.png

# 2. cap the width at 1024 (2× the display width) and compress
sips -Z 1024 -s format jpeg -s formatOptions 72 /tmp/band.png \
     --out app/src/img/wizard-graph.jpg
```

Keep the names above; the tokens in `app/src/js/13d-welcome.js` refer to them.
