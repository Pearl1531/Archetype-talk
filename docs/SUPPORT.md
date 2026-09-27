# Support, maintenance and what you can rely on

Written for whoever has to fill in a vendor questionnaire. Short version: this is
MIT-licensed software from a single maintainer, with no service attached and no
SLA — and the things that usually make that risky are absent here.

## The facts

| Question | Answer |
|---|---|
| Who maintains it | One person: GOLDEN RATIO — Mateusz Jędraszczyk ([LinkedIn](https://www.linkedin.com/in/matjedux/?locale=en)) |
| Commercial support / SLA | None. Best-effort, in batches. |
| Licence | MIT — use, modify, fork, redistribute, commercially, without asking |
| Warranty | None (see [LICENSE](../LICENSE)) |
| Bug reports | GitHub issues |
| Security reports | Private advisory — [SECURITY.md](../SECURITY.md) |
| Releases | Git tags + GitHub Releases, changes in [CHANGELOG.md](../CHANGELOG.md) |
| Telemetry / phone-home | None, including for updates |

## Why single-maintainer risk is lower here than usual

The normal fear is "the author disappears and we're stuck". Three properties of
this repo make that a recoverable situation rather than a dead end:

1. **No dependencies to rot.** No npm packages, no lockfile, no framework — the
   app is first-party HTML/CSS/JS in one file, and the scripts use only the
   Python standard library. Nothing breaks because an upstream package was
   yanked or a CVE landed in a transitive dependency.
2. **A reproducible build you can run yourself.** Two commands rebuild the
   shipped artifact from sources, and CI proves the committed artifact matches
   ([docs/BUILD.md](BUILD.md)). You can verify — and continue — without the author.
3. **Your data is not locked in.** Everything is plain Markdown in your own
   folder. If this project stops, your research is still readable in any text
   editor, still greppable, still importable elsewhere. The tool is replaceable;
   the files are yours.

Under MIT you may fork and maintain your own copy at any time, including
commercially, with no notification.

## Versioning

Tagged releases with a written changelog. The version is visible in the app
footer and in the header comment of `app/index.html`, so you can always tell
which build is running. Breaking changes to the file schema — the frontmatter
fields entity files use — are called out explicitly in the changelog.

## Reporting something

- **A bug or a question:** GitHub issue.
- **A security or privacy issue:** private advisory, never a public issue —
  [SECURITY.md](../SECURITY.md).
- **A compliance gap** (a missing artifact your review needs): an issue is fine.
  Templates live in [docs/compliance/](compliance/) and grow as gaps are found.
