# GEMINI.md

You are working in the **Archetype Talk** repo. The rules here are not
tool-specific — follow them as written.

1. **Read [AGENTS.md](AGENTS.md)** — the cross-tool guide (how to run the
   workflows in any agent, how to edit the browser app, GDPR rules).
2. **Read [CLAUDE.md](CLAUDE.md)** — the complete working rules (grounding,
   Levels, Signals vs Evidence, never inventing quotes/stats/dates, link-change
   approval, demo-data isolation). Every rule applies to you.

Gemini-specific notes:
- **Skills load from `.agents/skills/`** (a link to `.claude/skills/`); `/skills`
  lists them. If none show up — a Windows checkout without symlinks — open
  `.claude/skills/<name>/SKILL.md` and follow its steps directly;
  [.claude/skills/INDEX.md](.claude/skills/INDEX.md) is the one-table map of which.
- **No SessionStart hook.** Reproduce the start-of-session checks yourself — see
  the hook section in [AGENTS.md](AGENTS.md) — including
  `python3 scripts/graph_index.py build`, which writes the routing map of the graph
  you should read before opening research files.
- **Never read or edit** `app/index.html` or `app/src/embedded-graph.html`
  (generated build artifacts). Edit `app/src/` partials and rebuild with
  `python3 scripts/build_app.py`.
