# Where your data actually lives

Four places, with different rules. Most confusion about this tool comes from
assuming everything is in the folder — some of it isn't.

| Place | What | Backed up? | In git? | Survives a browser wipe? |
|---|---|---|---|---|
| **The project folder** | Every entity `.md`, transcripts, avatars, `Product Context.md` | Whatever you back the folder up with | Yes, if you commit it | Yes |
| **This browser** | Draft ideas, idea votes, transcript exclusions, sandbox edits to demo files, view preferences | **No** | **No** | **No** |
| **`.claude/` local files** | `preferences.local.md` (your name + email), `.env` (keys), caches | No — gitignored | No | Yes |
| **Elsewhere** | Whatever a source connector still holds (Dovetail, Otter…), your model provider's logs | Their terms | No | Yes |

## The browser bucket — the one people forget

The app can run with no folder connected at all, so anything you create before
connecting has nowhere to go but `localStorage`. It is namespaced per project
copy (by the file path of `index.html`), so two checkouts never mix, and it holds:

- **draft ideas** created before a folder was connected — the only copy;
- **sandbox edits** to demo files (the Demo workspace is never written to disk);
- idea votes, transcript "use in analysis" exclusions, fresh-only filter state;
- view preferences: current tab, card/table view, sort order, column widths, mind-map/flow mode.

One thing lives next door, in **IndexedDB** rather than `localStorage`, because it
is not a string: the **handle of the folder you connected**, so the next visit
opens on your files instead of the folder picker. It stores *which* folder, never
its contents, and it is not access — the browser re-checks the permission every
visit and hands it back only after you click, unless you told Chrome to allow it
on every visit. "Clear local data" deletes it along with everything above.

Consequences worth stating plainly:

- It is **outside every retention policy you set on the folder**. Deleting a
  transcript from disk does not delete a vote or an exclusion referencing it.
- It is **outside your backups and outside git**. Clearing site data, switching
  browser, or opening the app from a different path loses drafts silently.
- It is **per-person**: your colleague's votes and exclusions are in their
  browser, not yours. There is no shared state.

**Settings ▸ Privacy & network ▸ Clear local data** removes all of it for the
current project copy in one click, tells you how many drafts you're about to
lose first, and never touches a `.md` file. Save drafts to the folder before
clearing — the app offers this in a toast after you connect a folder.

## The folder bucket and git

Your research is plain Markdown you own. Two things to decide deliberately:

**Is the repo private?** If you version transcripts (the default — only `Inbox/`,
`.env` and local caches are gitignored), then everything you commit lives in git
history. Renaming or deleting a file later does **not** remove earlier versions:
`git show <old-commit>:<path>` still returns them, in every clone and fork.

**Is the material anonymised before the first commit?** That is the question that
decides whether the previous paragraph is a problem. Name-stripping alone usually
leaves pseudonymised data — verbatim quotes carry context, and a small sample plus
age/role/city is often re-identifying. If the linking key is destroyed at study
close, the residue can genuinely stop being personal data; until then, treat git
history as permanent and act accordingly.

### The gate: state, not exclusion

Rather than keeping transcripts out of git — which breaks the way teams actually
work, reviewing research through pull requests — the repo records **what state a
file is in** and refuses to let an unrecorded one in.

Transcript frontmatter may carry `anonymization:` (`none` / `ai_assisted` /
`tool_assisted` / `manual_verified`), `anonymized_with:`, `anonymized_on:` and
`key_location:` (`external` / `destroyed`). Full schema in
[Transcripts/_template.md](../Transcripts/_template.md). All optional: a repo that
ignores them works exactly as before.

An **opt-in** git hook turns that into a guard rail. Install it once:

```bash
ln -s ../../scripts/hooks/pre-commit .git/hooks/pre-commit
```

It blocks a commit that adds or changes a file under `Transcripts/` whose
`anonymization:` is missing or `none`, and prints the three ways out: scrub and
record it, keep the file out of git, or mark it `demo: true`. `git commit
--no-verify` bypasses it deliberately. It does **not** judge scrub quality — no
tool can — it only stops the case where nobody even claims a scrub happened,
which is the accident that actually occurs: one hurried `git add -A` after
dropping a file into the folder.

Note what `anonymization: ai_assisted` really means: the model read the raw text
in order to scrub it, so processing already happened. It is a safety net, not a
control. `tool_assisted` (a local tool such as Presidio, run by you before
anything leaves the machine — this repo ships no scrubber) and `manual_verified`
are the states that actually reduce exposure.

### When the clock stops

`key_location: destroyed` records that nobody can link the code back to a person
any more — the recording, the recruiting list, the calendar invite and the
payment trail are gone. At that point the material is anonymous, GDPR stops
applying, and the retention clock stops with it: `graph_lint` no longer reports
the file as overdue. That is the graduation event, and for teams collaborating on
GitHub it is the cleanest long-term answer — see `/retention`.

## `.claude/` local files

- `preferences.local.md` — your display name and email, used to attribute votes
  and hypotheses. Gitignored. Emails are **masked** (`m***@g***.com`) before ever
  being written into an entity file, so a public repo never carries a full address.
- `.env` — API keys, gitignored — see [SECRETS.md](SECRETS.md).
- `voice-cache/`, `cache/`, `*.local` markers — derived, gitignored, safe to delete.

## Related

- [compliance/subprocessors.md](compliance/subprocessors.md) — what can leave the machine.
- [AUTOMATION.md](AUTOMATION.md) — what runs by itself.
- README ▸ *Anonymization & GDPR* — obligations that stay with you.
