# Access, audit and working as a team

Written for the reviewer who asks "who can see this, and how would we know who
changed it?". The answers are simple, and two of them are limits rather than
features — stated here so you can plan around them instead of discovering them.

## Access control: the filesystem, and nothing else

There is **no RBAC, no login, no in-app permission model**. Whoever can read the
folder can read every transcript, persona and signal in it. Whoever can write to
it can change anything. The browser app is a viewer over files you already have
access to — it grants nothing and restricts nothing.

That is a deliberate consequence of being local-first and file-based, not an
omission waiting to be fixed. Access control therefore lives one level down, and
that is where you configure it:

| Layer | How you actually control access |
|---|---|
| The folder | OS permissions, full-disk encryption, endpoint management |
| The repository | Private repo, branch protection, per-repo collaborator lists |
| Sharing | Send an export, not folder access — see below |
| Secrets | `.env` outside the repo, or an OS/keychain-backed variable ([SECRETS.md](SECRETS.md)) |

**The practical rule for sensitive work: one project, one folder, one repository,
one access list.** Client-confidential research in a separate repo is the only
reliable way to say "these three people can see this study and nobody else". Do
not rely on subfolders — nothing in the tool enforces a boundary between them.

## Audit trail: git, plus a per-file stamp

**Git is the audit trail.** Who changed what, when, and to what — with the full
diff — for everything committed. Enable signed commits if you need author
non-repudiation. This is a better audit trail than most research tools have; it
just requires that people actually commit.

**Per-file stamping** covers the gap between commits, and the case of a folder
shared over Drive with no history at all. When the app writes an entity file it
sets:

```yaml
updated: 2026-07-25
updated_by: 'Mateusz'
```

`updated_by` is a **display name only — never an email address, not even a masked
one.** These files get committed and repositories get made public; an address
there is harvestable and effectively permanent, while a name already answers the
only question the field exists for. If no name is set in Settings, the field is
simply omitted — there is no fallback to an email.

Two mechanical guards keep it that way, and they cover addresses arriving by any
route, not just this one:

- `python3 scripts/graph_lint.py` warns about an unmasked email address anywhere
  in an entity file or a root document.
- The opt-in pre-commit hook (`scripts/hooks/pre-commit`) **blocks the commit**,
  showing the offending addresses masked, with guidance per case: a participant's
  address should be removed outright, a teammate's masked, an organisation's
  usually replaced by a link.

Hypothesis authorship is the one place an email may appear, and it is masked to
`m***@g***.com` by the app before it is written — enough to tell teammates apart,
useless to a scraper.

What is **not** audited: reading. Nothing records who opened a file, in the app
or on disk. If you need read auditing, it has to come from the storage layer.

## Working as a team

The tool has no shared state — no server, no sync, no locking. Two people are two
independent copies of the files. What works in practice:

**Git as the collaboration and review layer.** This is also the approval workflow
people ask for: branch, extract findings, open a pull request, have a second
researcher review the signals before they enter the graph on `main`. Nothing in
the tool enforces review, but the standard git workflow provides it, and it is
the same reason keeping transcripts in git is worth the trouble — see
[DATA-BOUNDARY.md](DATA-BOUNDARY.md) for the anonymisation gate that makes it safe.

**Concurrent writes are detected, not prevented.** Before writing, the app
re-reads the file and compares it with what it loaded. If another tool — a
parallel Claude session, a teammate's sync client — changed it in the meantime,
you get an explicit prompt instead of a silent overwrite. Same check for `.env`
and preferences. It is last-writer-wins with a warning, which is honest for a
file-based tool; it is not a locking system.

**Read-only sharing without folder access.** For stakeholders who should see but
not touch, hand them `app/index.html` with the graph embedded, or an
**Export .md** zip. They get the research; they do not get write access, your
`.env`, or the rest of the folder.

**Browser-held state is per person.** Idea votes, transcript exclusions and
unsaved drafts live in each person's browser, not in the shared folder. Two
people will not see the same votes. Save drafts to the folder to share them —
see [DATA-BOUNDARY.md](DATA-BOUNDARY.md).

## Summary for a questionnaire

> Access control is filesystem- and repository-level; the application implements
> no authentication or role model and grants no access of its own. The audit
> trail is git history (optionally with signed commits), supplemented by
> `updated`/`updated_by` stamps written per file, which record a display name and
> never an email address. Read access is not logged. Concurrent modification is
> detected and surfaced to the user rather than silently resolved. Segregation
> between projects or clients is achieved by separate folders and repositories
> with separate access lists.
