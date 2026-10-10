---
name: researcher
description: Desk research on the web, filed as cited Evidence (never Signals) to fill gaps in a persona's data. Use on /researcher or when asked to find external reports/studies/data on a topic.
---

# researcher — Desk Research Assistant (UX Researcher + Analyst)

On request, search the web for **existing desk research** — reports, studies, official statistics, community threads, journalism — that fills a gap in a persona's data. Cite properly, then turn findings into `Evidence/` files. This is the tool for "go find out if this is actually true" — it doesn't run interviews, it finds what's already published.

**Language:** work in the user's language; keep any quoted source text verbatim (don't translate a quote from a source — translate your own commentary around it).

## Trigger

```
/researcher <topic or question>
/researcher Personas/Emma.md                                  ← find desk research for gaps in her data
/researcher Personas/Emma.md "student music discovery habits" ← persona + a specific angle
```

Also invoked mid-conversation from `/persona-talk`, when a persona hits a **Known unknown** and the user explicitly agrees to a web-fallback offer — see persona-talk/SKILL.md's "Warm-up and unknowns" section. Same skill, same rules, just triggered from inside a session instead of run standalone.

**Real user research always outranks this.** Whatever this skill finds is desk research (Evidence), not an interview (Signal) — say so plainly whenever it's offered as a stand-in for a data gap: a real interview/test with an actual user is the stronger, preferred source, and finding something on the web doesn't close that gap, it only softens it temporarily.

## Competitor quick-research (app-added files)

A `Competitors/*.md` with `needs_research: true` was created by name in the app. When the user confirms (the SessionStart hook prompts you to ask), honor the **lookback window they chose — 1, 2 or 3 years back from today** — and skip sources published earlier. Fill the file's own template sections (Market position, Features vs the product, User voices, Sources) with linked public data; recent-first. Then set `retrieved: <today>` and delete the `needs_research:` line. The competitor file is opt-in context, not Evidence — file separate `Evidence/` entries only for findings that ground persona claims.

## Why this always produces Evidence, never Signal

This project's grounding model draws a hard line: **`Signal` = an observation from OUR OWN interview/test** (has an "Interview date" and a `Transcript` link back to a session we ran). **`Evidence` = desk research** — data someone else already published, that we found and cited. A community thread, a market report, an academic paper — no matter how compelling the quote inside it — is desk research, not our interview. Filing it as a `Signal` would silently inflate the Level scale (`Signal`-only = L3, "from experience") for something that was never actually witnessed firsthand. **Everything this skill produces is `Evidence`.**

## Workflow

1. **Scope the research.**
   - Given a persona file: read its `Pains`, `Jobs to be Done`, and `Correlations`. Identify claims that are thin — L2 (Evidence-only, no interview) or L3 (Signal-only, no external confirmation) — or gaps with no data at all.
   - Given free text: treat it as the research question directly.
   - If genuinely ambiguous, ask one clarifying question — don't guess at scope silently.

2. **Search.**
   - Use `WebSearch` broadly first, then `WebFetch` on the most promising, most authoritative pages.
   - Priority order: official statistics/company reports > academic papers > established journalism > community/forum threads (fully valid — this repo already cites Spotify Community threads throughout) > generic blogs (only if nothing better exists, and say so).
   - Cross-check a surprising number against a second source when one exists.

3. **Draft candidate Evidence entries.**
   - One `Evidence/<Title>.md` per distinct finding, using `Evidence/_template.md` exactly, `retrieved:` = today. Fill what the AI needs first:
     - `claim:` — the finding in one plain sentence;
     - `source_kind:`, `published:` (the source's own date), `population:` (who, where, how many) — **empty when the source does not say, never guessed**;
     - `primary_checked: true` only when you read the figure in the original report or dataset (rule 7); press coverage alone is `false`, and say so;
     - **Key figures**: one row per number with its population and source — no figure without who it is about;
     - **Does not settle**: at least one honest line on what the source cannot tell you (rule 8).
   - Content and Takeaways stay readable prose for people. Never add `==highlights==` — they are the team's emphasis.
   - **Never invent a statistic or quote to fill a thin result.** If the search comes up empty or weak, say so plainly instead of padding the file.

4. **Check for duplicates.**
   - Before creating a new file, scan `Evidence/` for an existing entry on the same topic. If one exists, prefer updating its `retrieved:` date and content over creating a near-duplicate.

5. **Present a plan, then confirm before writing.**
   - List candidates: title — one-line summary — source domain(s). Ask which to keep. Don't silently write a batch of files the user hasn't seen (same pattern as `dovetail-sync`).

6. **Write, then wire.**
   - Create the confirmed file(s).
   - If the research targeted a persona, offer to add a line under that persona's `## Evidences` section, linking the new file and stating what it confirms.
   - **If a finding contradicts an existing Pain/Correlation, flag it explicitly** rather than quietly overwriting — this repo's standing rule is that contradictions are data, not noise.

7. **Freshness is automatic at creation** (new Evidence starts at L2+ eligible with today's `retrieved:` date) — but this skill is also the right tool to periodically refresh Evidence the 3-month rule has flagged as stale.

## Target-population estimates (for the app's sample-confidence math)

When asked to find the size of the user's target population (total active accounts, subscribers in a segment, market size in people): use **public sources no older than 9 months** — investor reports, regulator filings, established market research; cite the specific page and date. File it as `Evidence/` like everything else, then tell the user the number and offer to enter it in the app's **Settings → Target population** (stored in the gitignored `.claude/preferences.local.md`). If only older data exists, say so plainly and mark it as needing refresh — never silently use a stale figure for confidence math.

## Rules

- Real, verifiable, linkable sources only — the same hard rule as the rest of this project. No fabricated statistics, no invented quotes, ever.
- Cite the specific page, not a bare domain.
- Prefer the primary source (the original study/report) over a secondary write-up when both are findable.
- A weak source is still worth including if it's the only one — just label it plainly ("only source found — treat as thin") rather than omitting the gap silently.
