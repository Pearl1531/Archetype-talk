# Mixpanel MCP — safe connection setup

## Facts (official Mixpanel MCP, beta)

- **Endpoint (pick your region):**
  - US: `https://mcp.mixpanel.com/mcp`
  - EU: `https://mcp-eu.mixpanel.com/mcp`
  - IN: `https://mcp-in.mixpanel.com/mcp`
- **Transport:** Streamable HTTP
- **Admin prerequisite:** an org admin must enable MCP in Mixpanel under **Settings → Org → Overview** before anyone can connect. This is the user's/their org's action, not something Claude can do. Changes take up to ~15 minutes to propagate.
- Docs: [docs.mixpanel.com/docs/mcp](https://docs.mixpanel.com/docs/mcp)

## Auth — two options

**Path A — OAuth (recommended, interactive)**
1. The user adds the Mixpanel connector in their Claude client using the regional endpoint above, choosing OAuth/login.
2. They sign in **in their own browser** with their Mixpanel credentials — Claude never sees the credentials. Existing Mixpanel project permissions/roles apply automatically.
3. Verify with a harmless read call (e.g. `Get-Projects`).

**Path B — Service Account (Beta, headless)**
1. The user creates a service account in Mixpanel and keeps the secret to themselves.
2. It's supplied as a header: `Authorization: Bearer Basic <base64(username:secret)>` — this goes in the user's **own MCP client config / secret store**, never pasted into chat, never written into a repo file.
3. Verify with the same harmless read call.

> If Claude is ever about to receive or write a raw credential, stop and redirect the user to their client's secret store instead — same rule as `dovetail-sync`.

## Allowed tools (read-only)

`Run-Query`, `Get-Query-Schema`, `Get-Report`, `Display-Query`, `Get-Projects`, `Get-Events`, `List-Properties`, `Get-Property-Values`, `Search-Entities`, `Get-Issues`, `List-Dashboards`, `Get-Dashboard`, `List-Experiments`, `Get-Experiment`, `List-Feature-Flags`, `Get-Feature-Flag`, `Get-User-Replays-Data`.

## Forbidden tools — never call these

`Create-Dashboard`, `Update-Dashboard`, `Edit-Event`, `Edit-Property`, any `Bulk-Edit` operation, `Create-Tag`/`Rename-Tag`/`Delete-Tag`, `Create-Experiment`, `Create-Feature-Flag`. These write to the user's live Mixpanel project — this skill only reads.

## Done when

A read tool (e.g. `Get-Projects`) returns real project data. Then hand back to the main skill workflow (scope question → query → draft Evidence → confirm → write).
