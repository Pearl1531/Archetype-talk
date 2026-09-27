# Google Analytics 4 MCP — safe connection setup

## Facts (official Google Analytics MCP server)

- **Package:** `google-analytics-mcp` — [github.com/googleanalytics/google-analytics-mcp](https://github.com/googleanalytics/google-analytics-mcp)
- **Run command:** `pipx run analytics-mcp` (the user runs this locally — it's not a hosted endpoint like Dovetail/Mixpanel)
- **Docs:** [developers.google.com/analytics/devguides/MCP](https://developers.google.com/analytics/devguides/MCP)
- Google's own docs state the server is **"available for read requests only. It can't edit your Google Analytics configuration or settings."**

## Auth — Application Default Credentials (ADC)

1. The user installs the Google Cloud CLI (`gcloud`) if they don't have it.
2. They run, **in their own terminal**: `gcloud auth application-default login --scopes="https://www.googleapis.com/auth/analytics.readonly"`
3. This opens their **own browser** for Google sign-in — Claude never sees credentials, and no token is pasted into chat or written into the repo.
4. Their Google account needs actual access to the GA4 property in question, and the project needs the **Google Analytics Admin API** and **Google Analytics Data API** enabled in Google Cloud Console (also the user's own action).
5. Alternative for headless/shared setups: service-account impersonation via `gcloud auth application-default login --impersonate-service-account=<sa-email>` — the service account itself is created and controlled by the user/their org, not by Claude.

## Allowed tools (read-only — this is the entire tool surface Google ships)

`get_account_summaries`, `get_property_details`, `list_google_ads_links`, `run_report`, `run_funnel_report`, `get_custom_dimensions_and_metrics`, `run_realtime_report`.

There are **no write tools** on this server per Google's own documentation — but re-verify against the current tool list before use, since server capabilities can change over time.

## Done when

A read tool (e.g. `get_account_summaries`) returns real account/property data. Then hand back to the main skill workflow (scope question → query → draft Evidence → confirm → write).
