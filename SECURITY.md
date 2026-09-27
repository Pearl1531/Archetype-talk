# Security Policy

Archetype Talk is a **local-first** tool: the browser app (`app/index.html`) runs
entirely on your machine and makes no network requests on its own, and your
research files never leave your folder unless you explicitly run a skill that
calls an external service. See the *Privacy, data flow & GDPR* section of the
[README](README.md#privacy-data-flow--gdpr) for the full list of paths that can
leave your machine and how to keep a locked-down install airtight, and
[docs/compliance/subprocessors.md](docs/compliance/subprocessors.md) for the same
list in vendor-questionnaire form.

Two optional switches in the app can open an outbound path, both **off by
default** and both under Settings ▸ Privacy & network: the competitor favicon
fetch (one domain to Google's favicon service) and external images (loading an
`http(s)` address held in a file's `picture:`/`photo:` field). With both off, the
app makes no outbound request at all. This is enforced, not only documented: the
shipped file carries a `Content-Security-Policy` meta with `default-src 'none'`,
images limited to `self`/`data:`/`blob:`, and a single permitted connect host.
The policy is in the first 20 lines of `app/index.html` — read it there rather
than trusting this paragraph.

## Reporting a vulnerability

If you find a security or privacy issue, please **report it privately** — do not
open a public issue for anything exploitable.

- Preferred: open a [GitHub private security advisory](https://github.com/Pearl1531/Archetype-talk/security/advisories/new).
- Or reach the author via the LinkedIn contact in the [README](README.md#author).

Please include steps to reproduce, the affected file(s), and the impact you see.
Expect an acknowledgement within a few days. As a small open-source project there
is no bounty, but fixes to genuine issues are prioritized and credited (unless you
prefer to stay anonymous).

## Handling secrets

- API keys live only in `.env` (gitignored) or your MCP client's own store —
  never in committed files or chat. The app writes keys straight to `.env` and
  only ever shows them masked.
- The AI is instructed to reference keys by name (`$ELEVENLABS_API_KEY`) and
  never to read or print their values.
- Your machine is the trust boundary: any local tool with file access can read
  `.env`. Treat it like any other credential file.

## Scope

In scope: the browser app (`app/`), the build/utility scripts (`scripts/`), the
skills and hooks (`.claude/`). Out of scope: vulnerabilities in third-party
services you connect (your model provider, ElevenLabs, Dovetail, analytics tools)
— report those to the respective vendor.
