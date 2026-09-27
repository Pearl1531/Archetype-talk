# Dovetail MCP — safe connection setup

Walk the user through this **once**. Goal: a working, read-only connection to their Dovetail workspace, with no secrets in the chat or the repo.

## Facts (official Dovetail MCP)

- **Endpoint:** `https://dovetail.com/api/mcp`
- **Transport:** Streamable HTTP
- **Auth (pick one):**
  - **OAuth 2.1 / first-party login** — browser sign-in, no token to manage. **Preferred.** Claude is a supported first-party client.
  - **Personal API Key** — header `Authorization: Bearer <token>`. Only if OAuth isn't available in the client.
- **Read tools:** `get_dovetail_projects`, `search_workspace`, `get_project_highlights`, `list_project_insights`, `get_project_insight`, `get_insight_content`, `list_project_data`, `get_project_data`, `get_data_content`.
- Docs: developers.dovetail.com/docs/mcp · docs.dovetail.com/integrations/mcp-server

## Path A — OAuth / first-party (recommended)

1. Tell the user to add the Dovetail connector in their Claude client (Settings → Connectors / MCP) using the hosted endpoint above, choosing **OAuth / login** when prompted.
2. The user completes sign-in **in their browser** — Claude never sees credentials.
3. Verify: call a harmless read tool (e.g. `get_dovetail_projects`). If it returns projects, you're connected.

> Claude must not perform the login, click consent, or enter credentials. The user does that in their own browser. Claude only uses the tools *after* the user has connected.

## Path B — Personal API Key (only if OAuth unavailable)

1. The user creates a **Personal API Key** in Dovetail (Account settings → API). **They keep it to themselves.**
2. The user pastes it into their **MCP client's secret field / environment variable** — NOT into this chat and NOT into any repo file.
3. If a config file is needed, it looks like this (token via env, never hard-coded):

   ```jsonc
   // MCP client config (kept OUTSIDE the repo, or in a git-ignored file)
   {
     "mcpServers": {
       "dovetail": {
         "type": "http",
         "url": "https://dovetail.com/api/mcp",
         "headers": { "Authorization": "Bearer ${DOVETAIL_API_TOKEN}" }
       }
     }
   }
   ```
   `DOVETAIL_API_TOKEN` lives in the user's shell/OS keychain or a git-ignored `.env`. Our repo's `.gitignore` already excludes `.env`.

4. Verify with a read call as in Path A.

## Guardrails during setup

- If Claude is ever about to receive or write a raw token → **stop** and instruct the user to place it in their client's secret store instead.
- Do not add any Dovetail token to `.mcp.json`, `settings.json`, or any tracked file.
- If a read call returns an auth error, don't retry with a token from chat — send the user back to reconnect (OAuth) or fix their env var.

## Done when

A read tool returns real workspace data. Then hand back to the main skill (discover → map → confirm → write).
