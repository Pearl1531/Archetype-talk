# docs/demo-workspace — the demo's own root docs

Two files the Demo workspace needs and cannot get from the repo root:
`Product Context.md` and `Research backlog.md`.

## Why they exist

Every entity file carries `demo: true`, and `scripts/embed_demo.py` filters on
that flag — so personas, signals and evidence sort themselves. The two **root**
docs have no such flag. There is exactly one of each, and it belongs to whatever
project the repo currently holds.

Reading them straight from the root meant the shipped Demo workspace inherited
the *user's* brief: Spotify personas sitting under a product context about
something else entirely, in a build that is committed and shared. These copies
are the demo's own, frozen, and they change only when the demo changes.

## How they are used

`embed_demo.py` prefers a file here over the one in the repo root, for each doc
independently, and says so in its output:

```
… root docs from docs/demo-workspace/ (Product Context.md, Research backlog.md)
```

Delete one and the build silently falls back to the root doc — which is the old
behaviour, including its bug. If you see that line missing a name, that is why.

The backlog is embedded **whole** when it comes from here: it is already the
demo's, so every row belongs in the build, including rows tied to no persona
(a coverage gap is a question about the demo too). The per-row persona filter
in `embed_demo.py` only guards the fallback path, where a real project's open
questions would otherwise ship inside `app/index.html`.

## Editing

These are ordinary Markdown files — edit them the way you would any root doc,
then re-run:

```bash
python3 scripts/embed_demo.py
```

Keep them about the demo (Spotify). If you find yourself pasting your own
project's context in here, the file you want is the one in the repo root.
