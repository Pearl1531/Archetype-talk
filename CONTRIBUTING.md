# Contributing

Issues and pull requests are welcome. This is a one-maintainer project, so the
honest expectation is: reviews happen in batches, not within hours. See
[docs/SUPPORT.md](docs/SUPPORT.md) for what that means in practice.

## Before you open a PR

```bash
python3 scripts/graph_lint.py     # structural check on the knowledge graph
python3 scripts/embed_demo.py     # rebuild the app if you touched app/src/ or demo files
git diff --exit-code app/index.html app/src/embedded-graph.html   # must be empty after a rebuild
```

CI runs the same three things. A red build is nearly always one of: an edited
`app/index.html` (edit the partial in `app/src/`, never the artifact), a demo file
changed without re-running `embed_demo.py`, or a dead link in the graph.

## Ground rules that are not style preferences

These come from [CLAUDE.md](CLAUDE.md), which governs every agent and human
working in this repo. Breaking them breaks the product's core claim.

1. **A persona conversation never creates data.** Its output is research
   questions, or a Hypothesis marked L1 — never a Signal or Evidence file.
2. **Signal = our own interview/test observation. Evidence = desk research or
   external/internal data.** Filing a web find as a Signal inflates grounding.
3. **Never invent quotes, statistics, dates or sources.** Verbatim quotes stay in
   their original language — they are data.
4. **Contradictions are data.** Two conflicting Signals stay two files.
5. **Every claim carries a Level** (L1–L5). No vibes.
6. **Links are the researcher's material.** Propose rewiring; never apply it
   silently.

## Editing the app

`app/index.html` is generated. Edit `app/src/{shell.html, css/NN-*.css, js/NN-*.js}`
— the component map is in [app/src/README.md](app/src/README.md), and
[docs/BUILD.md](docs/BUILD.md) explains the build. Two constraints hold
regardless of what you are adding:

- **No dependencies.** No npm package, no CDN, no web font. If it can't be done
  in first-party code, it doesn't go in.
- **No new outbound request.** Anything that touches the network must be
  off by default and behind a switch in Settings ▸ Privacy & network, and must
  be added to [docs/compliance/subprocessors.md](docs/compliance/subprocessors.md)
  in the same PR. CI fails a PR that introduces a remotely-loaded asset.

## Data in pull requests

Never include real research data. Demo content carries `demo: true`; if you add
an example, flag it and re-run `embed_demo.py`. Transcripts of real participants
do not belong in a PR to this repo under any circumstances.

## Security issues

Do not open a public issue — see [SECURITY.md](SECURITY.md).
