#!/bin/sh
# SessionStart hook — cheap, token-light check.
# 1) First run (no onboarding marker) -> tell the AI to greet + onboard.
# 2) Otherwise -> remind the AI what this repo is (for a bare greeting) + flag unprocessed Inbox files.
# Emits at most a few short lines. Never analyzes anything itself.

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
MARKER="$ROOT/.claude/onboarded.local"
INBOX="$ROOT/Inbox"

# ── Which project is this? ────────────────────────────────────────────────────
# The single thing an agent got wrong most often: this repo holds the user's
# research AND the bundled Spotify demo, in the SAME folders, told apart only by
# `demo: true`. Without this block the first answer of a session mixes them —
# it lists Emma next to the user's own personas, or offers the demo as if the
# project were empty. Naming the project and its real personas here costs a few
# lines and removes the guess.
PC="$ROOT/Product Context.md"
if [ -f "$PC" ]; then
  PROJ=$(sed -n 's/^project_name:[[:space:]]*//p' "$PC" | head -1 | sed "s/[[:space:]]*#.*$//; s/^['\"]//; s/['\"]$//")
  PTITLE=$(sed -n 's/^title:[[:space:]]*//p' "$PC" | head -1 | sed "s/[[:space:]]*#.*$//; s/^['\"]//; s/['\"]$//")
  if [ -n "$PROJ" ]; then
    echo "PROJECT: \"$PROJ\"${PTITLE:+ — $PTITLE}. This is the ACTIVE project. Its brief is \`Product Context.md\` — read it before answering anything about what the user is working on, and never describe this repo as empty or as a demo."
    REALP=$(grep -rL "^demo: true" "$ROOT"/Personas/*.md 2>/dev/null | grep -v '_template' | sed "s|$ROOT/||" | paste -sd ',' - | sed 's/,/, /g')
    [ -n "$REALP" ] && echo "  Its personas: $REALP"
    DEMOP=$(grep -rl "^demo: true" "$ROOT"/Personas/*.md 2>/dev/null | grep -v '_template' | sed "s|$ROOT/||" | paste -sd ',' - | sed 's/,/, /g')
    [ -n "$DEMOP" ] && echo "  NOT this project (demo: true, the bundled example set): $DEMOP — exclude every demo: true file from reading, grep, triage and answers unless the user asks about the demo itself."
  fi
fi

if [ ! -f "$MARKER" ]; then
  echo "ONBOARDING_NEEDED: No onboarding marker (.claude/onboarded.local). This looks like a fresh install."
  echo "-> Run the 'welcome' skill: greet the user, explain what this repo is and whose it is, describe your capabilities (incl. Dovetail via MCP), then ask whether they want to configure or start working with personas."
  if [ -n "${PROJ:-}" ]; then
    echo "-> But this repo is NOT blank: it already carries the project named on the PROJECT line above. Open with what that project is, offer to pick the work up, and do NOT offer the demo persona unless they ask for it."
  else
    echo "-> Mention the DEMO persona (Personas/Emma.md)."
  fi
  echo "-> After onboarding, create the file .claude/onboarded.local so this does not repeat."
  exit 0
fi

echo "GREETING_CONTEXT: If the user's first message this session is just a bare greeting (hi/hello/cześć/etc.) with no other request, briefly say what this repo is — Archetype Talk, a UX-research knowledge graph you can talk to (see README.md) — before asking how you can help. Don't reply with just a generic greeting."

# Refresh the routing index (~0.1s, no output). It saves far more tool calls than
# it costs; if Python is missing or it fails, the session just proceeds without it.
if command -v python3 >/dev/null 2>&1; then
  python3 "$ROOT/scripts/graph_index.py" build >/dev/null 2>&1 && \
    echo "GRAPH_INDEX: .claude/cache/graph-index.md is freshly generated — a one-read map of every entity (type, path, flags, links) plus each persona's slice hash. Use it to find WHICH files matter before reading any; it is never a source and is never cited. Rebuild after you edit entity files: python3 scripts/graph_index.py build"
fi

# Hand-added competitors (app's "New competitor" button) awaiting desk research
if ls "$ROOT"/Competitors/*.md >/dev/null 2>&1; then
  PENDING=$(grep -l "^needs_research: true" "$ROOT"/Competitors/*.md 2>/dev/null | grep -v '_template' | sed "s|$ROOT/||")
  if [ -n "$PENDING" ]; then
    C=$(printf '%s\n' "$PENDING" | wc -l | tr -d ' ')
    echo "COMPETITOR_RESEARCH_PENDING: $C competitor file(s) were hand-added in the app and await initial desk research:"
    printf '%s\n' "$PENDING" | sed 's/^/  - /'
    echo "-> Do NOT research automatically. ASK the user whether to run initial web desk research for them, and OFFER the lookback window: sources from the last 1, 2 or 3 years (counted back from today). After researching (or if the user declines), remove the needs_research flag from the file and set retrieved:."
  fi
fi

if [ -d "$INBOX" ]; then
  N=$(find "$INBOX" -type f -name '*.md' ! -name 'README.md' ! -name '_*' 2>/dev/null | wc -l | tr -d ' ')
  if [ "${N:-0}" -gt 0 ]; then
    echo "INBOX_NEW: $N unprocessed file(s) in Inbox/."
    echo "-> Do NOT analyze automatically. First ASK the user whether to process them via /extract-findings."
    if [ "$N" -gt 5 ]; then
      echo "-> WARN the user: $N files is a lot — analysis may take a while and use noticeable tokens. Offer to do a subset first."
    fi
  else
    # Zero-data project: empty Inbox AND no real (non-demo) transcripts.
    REAL=$(grep -rL "^demo: true" "$ROOT"/Transcripts/*.md 2>/dev/null | grep -v '_template' | wc -l | tr -d ' ')
    if [ "${REAL:-0}" -eq 0 ]; then
      echo "ZERO_DATA: Inbox is empty and there are no real (non-demo) transcripts. If the user has no research data at all, the /cold-start skill runs a founding-brief interview (product, value proposition, target group as L1 assumptions) and plans the first research round. MENTION it only when relevant — NEVER run it unprompted; it must be explicitly invoked by the user."
    fi
  fi
fi
exit 0
