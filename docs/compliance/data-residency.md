# Keeping processing in the EU

> Template for the deploying organisation. Not legal advice. No warranty.

The repo itself is trivially EU-resident: your files sit on your machine and the
app never sends them anywhere. The question is only ever about the services **you**
connect — above all the model, because that is where interview text actually goes.

## 1. The model — the one that matters

This tool is provider-agnostic: it drives whichever model your agent is
configured with. Residency is therefore a decision you make in your agent, not
here. Three routes that keep inference inside the EU:

| Route | How | Verify |
|---|---|---|
| A cloud provider's EU region | Run the model through `<AWS Bedrock in eu-central-1 / Google Vertex in europe-west4 / an equivalent EU region>` and point your agent at that endpoint | The endpoint hostname carries the region; confirm in the provider's console that no cross-region failover is enabled |
| The vendor's own EU data residency option | Some vendors offer EU processing on the enterprise tier | Get it in the contract, not in a sales email |
| Self-hosted / EU-based provider | Full control, at the cost of model quality | — |

Whatever you pick, settle two things in writing:

- **Zero retention** — the provider does not store prompts and completions beyond
  the request, and does not use them for training. Without this, "EU region"
  buys you less than it sounds like.
- **Sub-processors and transfers** — even an EU endpoint can involve support
  access from elsewhere. Ask.

If processing does happen outside the EEA, that is a transfer needing a safeguard
(SCCs, or an adequacy decision) — record it in your ROPA and DPIA rather than
hoping nobody asks.

## 2. The optional services

| Service | Reality | Practical answer |
|---|---|---|
| **ElevenLabs** (`/persona-voice`) | Voice synthesis, US-based | It is genuinely optional: no key, no calls. For an EU-only install, don't set `ELEVENLABS_API_KEY`. If you want voice, check their current terms and DPA, and remember only anonymised persona dialogue is sent — never transcripts |
| **Google favicon** | One domain name to Google | Off by default. Leave it off; upload icon files instead |
| **External images** | Only if a file points at a remote image | Off by default. Keep avatars as local paths |
| **MCP connectors** (Dovetail, Otter, Notion, analytics…) | Each has its own residency story; they authenticate in your MCP client, not in this repo | Assess per tool. The material usually *originates* there, so its residency matters as much as the model's |
| **Your git host** | If you version research, it holds everything you commit | Private repo; check the host's region options; see [../DATA-BOUNDARY.md](../DATA-BOUNDARY.md) |

## 3. Making the policy enforceable in the repo

Residency is a decision agents can't infer, so state it once where they read it.
Add to `.claude/preferences.local.md`:

```yaml
data_residency: EU     # EU | none — when EU, any non-EU service needs an explicit ok
```

`CLAUDE.md` turns that into a rule: with `data_residency: EU` set, a skill that is
about to call a service outside the EU — `/persona-voice`, the favicon fetch, an
external image, a connector you flagged as non-EU — **asks first and names the
service**, rather than proceeding and mentioning it afterwards. It is a
reminder, not a technical block: the model provider is configured in your agent,
so the repo cannot enforce residency there. What it can do is stop a casual
`[speak]` from quietly sending text to a US service in a project where somebody
promised participants otherwise.

## 4. What to write in the ROPA

> Session text is processed by `<provider>` in `<region>` under a DPA dated
> `<date>` with retention set to zero. `<No transfer outside the EEA takes place.>`
> / `<Transfers to <country> are covered by <SCCs / adequacy>.>` Optional voice
> and analytics services are `<not enabled>` / `<enabled, covered by …>`.
