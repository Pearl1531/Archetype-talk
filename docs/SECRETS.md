# Secrets — where keys live, and where they should live

Archetype Talk needs **no API key to do its main job**. Reading the graph,
talking to a persona, extracting findings, linting — none of it requires a
secret stored in this repo. Keys appear only for two optional extras, and the
right storage depends on how sensitive your install is.

## What actually needs a key

| Key | Needed for | Without it |
|---|---|---|
| `ELEVENLABS_API_KEY` | `/persona-voice`, `[speak]` in a conversation | The skill says so and stops. Everything else works. |
| `CAPACITIES_API_TOKEN` | The API path of `/source-sync` | The Markdown-export path works with no key. |

Everything else authenticates **outside this repo**: Dovetail, Mixpanel, GA4 and
Amplitude go through your MCP client's own OAuth or secret store, and your model
provider is configured in your agent, not here. Never add those tokens to `.env`,
`.mcp.json`, `settings.json` or any tracked file.

## Three tiers — pick one deliberately

**Tier 0 — no keys (default).** Don't create `.env` at all. This is the right
setting for most installs and the only one with nothing to leak.

**Tier 1 — `.env` in the project folder.** What the app's Settings page writes.
`.env` is gitignored (the app re-checks and repairs `.gitignore` before writing a
key), values are only ever shown masked, and the AI is instructed to reference
keys by name (`$ELEVENLABS_API_KEY`) and never read or print them. Fine for
personal machines and non-sensitive work.

**Tier 2 — outside the repo (enterprise).** Keep `.env` empty or absent and
export the variable from your shell profile, your OS keychain, or your
organisation's secret manager, so the value never touches the project folder:

```bash
export ELEVENLABS_API_KEY="$(security find-generic-password -s archetype-elevenlabs -w)"
```

Skills read the variable from the environment either way, so nothing else
changes. Use this tier whenever the project folder is synced, shared, or backed
up somewhere you don't control.

## The honest limit

Your machine is the trust boundary. Any local process with file access can read
`.env`, and any agent you run in this folder can read anything in it. Tiering the
storage narrows the blast radius; it does not turn a shared workstation into a
vault. Rotate keys when someone leaves the project, and revoke rather than edit
if you suspect exposure.

See also: [SECURITY.md](../SECURITY.md) (reporting), 
[docs/compliance/subprocessors.md](compliance/subprocessors.md) (what each key
lets leave your machine).
