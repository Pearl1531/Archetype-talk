#!/usr/bin/env python3
"""graph_index.py — the graph's structural map, so agents stop re-deriving it.

Two jobs, one link scanner behind both:

  1. **A routing index** (`build`) — one line per entity: path, type, title, and
     the flags that change what an agent is allowed to do with the file. It
     answers *which files*, never *what they say*. Nothing in it is a source;
     nothing in it may be cited. Read the file for anything you intend to quote.

  2. **Per-persona freshness** (`hash <Persona>` / `check <card>`) — the hash of
     one persona's slice of the graph rather than the whole graph. The old global
     hash meant a single new Signal made every persona's card stale at once, so
     in a project where research actually happens the cache never paid off. A
     slice hash keeps Emma's card valid when Jake gains a Signal, and invalidates
     it the moment anything Emma stands on moves.

Commands:
  python3 scripts/graph_index.py build            -> write .claude/cache/graph-index.md
  python3 scripts/graph_index.py hash             -> whole-graph hash (compat)
  python3 scripts/graph_index.py hash <Persona>   -> that persona's slice hash
  python3 scripts/graph_index.py check <card.md>  -> FRESH | STALE | MISSING
  python3 scripts/graph_index.py slice <Persona>  -> list the files in the slice
  python3 scripts/graph_index.py skills           -> write .claude/skills/INDEX.md

No dependencies beyond the standard library.
"""
import hashlib
import json
import os
import re
import sys
import urllib.parse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Entity folders, in graph order. Transcripts and Competitors are included
# because a card can legitimately rest on them.
FOLDERS = ["Evidence", "Signals", "Archetypes", "Personas", "Hypotheses",
           "Ideas", "Competitors", "Transcripts"]

# Root documents that are part of the graph's meaning, not just prose.
ROOT_DOCS = ["Product Context.md", "Participants.md", "Research backlog.md"]

# Of those, the ones a persona card is actually built from. `Research backlog.md`
# is pointedly absent: /persona-talk *writes* to it at the end of every session,
# so counting it would make each session invalidate the card it just wrote.
SLICE_DOCS = ["Product Context.md"]

# Frontmatter keys holding references by *title* rather than by path.
# Value -> the folder the titles resolve in ('' = search every folder).
REF_KEYS = {
    "evidences": "Evidence",
    "competitors": "Competitors",
    "mentioned_in": "Transcripts",
    "same_participant_as": "Transcripts",
    "idea": "Ideas",
    "signals": "Signals",
}

# Frontmatter keys worth carrying in the index: each one changes what an agent
# may do with the file (skip it, handle it carefully, treat it as stale) or
# where it belongs. Free prose (abstract, description) is deliberately absent —
# that is content, and content is read from the file.
FLAG_KEYS = [
    "demo", "excluded", "category", "status", "affinity", "affinity_lock",
    "special_category", "date", "retrieved", "retention_until", "anonymization",
    "key_location", "needs_research", "highlight_tags", "topics",
    "mentions_competitors", "interview_id", "method", "proximity", "feature",
    "tags", "source_kind", "primary_checked", "question", "stakes",
]
# the keys that name a topic: the Topics section turns them round (topic -> files),
# so "do we have anything on X?" is one lookup instead of a grep over every folder
TOPIC_KEYS = ["tags", "topics", "feature", "affinity"]


# --------------------------------------------------------------------------
# parsing
# --------------------------------------------------------------------------

def read(path):
    """The one reader for every script in scripts/. An unreadable file is '' —
    these tools survey a folder they do not own, and one bad file must not stop
    a lint run or an index build."""
    try:
        with open(path, "rb") as fh:
            # normalize line endings so hashes match across OSes and checkouts
            return fh.read().replace(b"\r\n", b"\n").decode("utf-8", "replace")
    except OSError:
        return ""


def frontmatter(text):
    """Flat key -> raw-string map. Deliberately not a YAML parser: the schema is
    flat, and a dependency-free repo is worth more than nested-value support."""
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).split("\n"):
        km = re.match(r"^([A-Za-z_][A-Za-z0-9_]*):(.*)$", line)
        if not km:
            continue
        val = km.group(2)
        # strip a trailing ' # comment', but never inside quotes or brackets
        depth, quote, cut = 0, None, len(val)
        for i, ch in enumerate(val):
            if quote:
                if ch == quote:
                    quote = None
            elif ch in "'\"":
                quote = ch
            elif ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
            elif ch == "#" and depth == 0 and (i == 0 or val[i - 1] in " \t"):
                cut = i
                break
        out[km.group(1)] = val[:cut].strip()
    return out


def split_list(inner):
    """Split a flow-sequence body on commas OUTSIDE quotes. An entity title may
    legitimately contain one — 'Rozstrzał prognoz — co jest zgodne, a co sporne'
    is one Evidence, not two — and a naive split reports it as two dangling
    references."""
    items, buf, quote = [], [], None
    for ch in inner:
        if quote:
            if ch == quote:
                quote = None
            else:
                buf.append(ch)
        elif ch in "'\"":
            quote = ch
        elif ch == ",":
            items.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
    items.append("".join(buf))
    return [s.strip() for s in items if s.strip()]


def scalar(raw):
    """'Emma'  ->  Emma  ;  [a, 'b']  ->  ['a', 'b']  ;  ''  ->  None"""
    raw = (raw or "").strip()
    if not raw:
        return None
    if raw.startswith("[") and raw.endswith("]"):
        return split_list(raw[1:-1].strip())
    if raw in ("true", "false"):
        return raw == "true"
    return raw.strip("'\"")


def list_field(fm, key):
    """A frontmatter key's flow sequence, or [] when it is not one."""
    raw = fm.get(key, "")
    return split_list(raw.strip("[]")) if raw.startswith("[") else []


def rel(path):
    return os.path.relpath(path, ROOT).replace(os.sep, "/")


def md_files(folder, templates=False, readme=False):
    """The .md files directly in one folder, entities only by default.

    `templates=True` keeps `_template.md` and friends. `readme=True` keeps
    README.md — it documents a folder rather than being an entity in it, so it
    is out of the graph, but a tool auditing what text the repo *holds* about a
    person still has to look inside it.
    """
    d = os.path.join(ROOT, folder)
    if not os.path.isdir(d):
        return []
    return sorted(
        os.path.join(d, f) for f in os.listdir(d)
        if f.endswith(".md")
        and (readme or f != "README.md")
        and (templates or not f.startswith("_"))
    )


def project_name():
    """`project_name:` from Product Context.md — what this project is called.

    It is the one place in the repo that names the active project, so it is
    what an agent should route by: everything else in these folders is either
    this project's or flagged `demo: true`.
    """
    path = os.path.join(ROOT, "Product Context.md")
    if not os.path.isfile(path):
        return ""
    with open(path, encoding="utf-8") as fh:
        head = fh.read(4000)
    m = re.search(r"^project_name:\s*(.+)$", head, re.M)
    return (scalar(m.group(1).split("#")[0]) or "") if m else ""


def entity_files():
    paths = []
    for folder in FOLDERS:
        d = os.path.join(ROOT, folder)
        if not os.path.isdir(d):
            continue
        for dirpath, _dirs, names in os.walk(d):
            for name in sorted(names):
                # README.md documents a folder; it is not an entity in it
                if name.endswith(".md") and name != "README.md":
                    rel = os.path.relpath(os.path.join(dirpath, name), ROOT)
                    paths.append(rel.replace(os.sep, "/"))
    for doc in ROOT_DOCS:
        if os.path.isfile(os.path.join(ROOT, doc)):
            paths.append(doc)
    paths.sort()
    return paths


# The URL may contain one level of balanced parentheses (e.g. "...(Smart Skip).md").
# One regex for every script here: a link this misses is a link the lint cannot
# check and the index cannot follow.
LINK_RE = re.compile(r"\]\(((?:[^()]|\([^()]*\))*)\)")


def md_links(text):
    """Every markdown link that points at a .md file, anchor stripped."""
    out = []
    for href in LINK_RE.findall(text):
        target = href.split("#")[0].strip()
        if target.endswith(".md"):
            out.append(target)
    return out


def resolve_link(href, from_path):
    """'../Signals/Prefers%20voice.md' seen in Personas/Emma.md -> 'Signals/Prefers voice.md'"""
    href = urllib.parse.unquote(href)
    if re.match(r"^[a-z][a-z0-9+.-]*:", href, re.I):   # http:, mailto:, …
        return None
    base = os.path.dirname(from_path)
    joined = os.path.normpath(os.path.join(base, href)) if base else os.path.normpath(href)
    joined = joined.replace(os.sep, "/")
    return None if joined.startswith("..") else joined


def build_graph():
    """-> (entities, out_links, in_links). One filesystem pass, reused by every command."""
    paths = entity_files()
    raw = {p: read(os.path.join(ROOT, p)) for p in paths}
    fm = {p: frontmatter(raw[p]) for p in paths}

    # title -> path, for the frontmatter reference keys
    by_title = {}
    for p in paths:
        stem = os.path.splitext(os.path.basename(p))[0]
        title = scalar(fm[p].get("title")) or stem
        by_title.setdefault((os.path.dirname(p), str(title)), p)
        by_title.setdefault((os.path.dirname(p), stem), p)
        by_title.setdefault(("", str(title)), p)
        by_title.setdefault(("", stem), p)

    entities, out_links = {}, {}
    for p in paths:
        links = set()
        for href in md_links(raw[p]):
            tgt = resolve_link(href, p)
            if tgt and tgt in raw:
                links.add(tgt)
        for key, folder in REF_KEYS.items():
            val = scalar(fm[p].get(key))
            if val in (None, True, False):
                continue
            for title in ([val] if isinstance(val, str) else val):
                tgt = by_title.get((folder, title)) or by_title.get(("", title))
                if tgt and tgt != p:
                    links.add(tgt)
        links.discard(p)
        out_links[p] = sorted(links)

        flags = {}
        for key in FLAG_KEYS:
            if key in fm[p]:
                val = scalar(fm[p][key])
                if val not in (None, ""):
                    flags[key] = val
        # `sentiment:` is the one nested block in the schema, so the flat parser above
        # misses it. Surfaced as `stance=<value>@<feature>` — routing only: which files
        # recorded an attitude, never what the attitude means.
        sblock = re.search(r"^sentiment:\s*\n((?:[ \t]+\S.*\n?)+)", raw[p], re.M)
        if sblock:
            def _sfield(key):
                m = re.search(rf"^\s+{key}:\s*(.+)$", sblock.group(1), re.M)
                return m.group(1).strip().strip("'\"") if m else None
            st, feat = _sfield("stance"), _sfield("feature")
            if st:
                flags["stance"] = f"{st}@{feat}" if feat else st
                if _sfield("unprompted") == "true":
                    flags["stance"] += " (unprompted)"
        rec = {
            "path": p,
            "type": scalar(fm[p].get("type")) or ("RootDoc" if "/" not in p else "?"),
            "title": scalar(fm[p].get("title")) or os.path.splitext(os.path.basename(p))[0],
            "bytes": len(raw[p].encode("utf-8")),
            "flags": flags,
            "links": out_links[p],
        }
        if os.path.basename(p) == "_template.md":
            rec["template"] = True
        entities[p] = rec

    in_links = {p: [] for p in paths}
    for src, targets in out_links.items():
        for t in targets:
            in_links[t].append(src)
    for t in in_links:
        in_links[t].sort()

    return entities, out_links, in_links


# --------------------------------------------------------------------------
# slices and hashing
# --------------------------------------------------------------------------

def persona_path(name, entities):
    """Accept 'Emma', 'Personas/Emma.md', or a card path."""
    name = os.path.splitext(os.path.basename(str(name)))[0]
    name = re.sub(r"\.card$", "", name)
    cand = f"Personas/{name}.md"
    if cand in entities:
        return cand
    for p, e in entities.items():
        if p.startswith("Personas/") and str(e["title"]).lower() == name.lower():
            return p
    return None


def slice_for(persona, entities, out_links, in_links, depth=2):
    """Everything the persona's card can be built from.

    Outgoing to `depth` hops (persona -> Signals/Archetypes -> Evidence/Transcripts),
    plus every file pointing *at* the persona. That second half is the one that is
    easy to forget and expensive to get wrong: a Signal created later that links to
    Emma never touches Emma.md, so without in-edges her card would look fresh while
    the graph had moved underneath it.
    """
    seen = {persona}
    frontier = [persona]
    for _ in range(depth):
        nxt = []
        for p in frontier:
            for t in out_links.get(p, []):
                if t not in seen:
                    seen.add(t)
                    nxt.append(t)
        frontier = nxt
    seen.update(in_links.get(persona, []))
    for doc in SLICE_DOCS:
        if doc in entities:
            seen.add(doc)
    return sorted(seen)


def hash_paths(paths):
    h = hashlib.md5()
    for rel in sorted(paths):
        full = os.path.join(ROOT, rel)
        if not os.path.isfile(full):
            continue
        h.update(rel.encode("utf-8"))
        with open(full, "rb") as fh:
            h.update(fh.read().replace(b"\r\n", b"\n"))
    return h.hexdigest()


def global_hash():
    return hash_paths(entity_files())


def persona_hash(name):
    entities, out_links, in_links = build_graph()
    p = persona_path(name, entities)
    if not p:
        return None
    return hash_paths(slice_for(p, entities, out_links, in_links))


# --------------------------------------------------------------------------
# commands
# --------------------------------------------------------------------------

CACHE = os.path.join(ROOT, ".claude", "cache")
INDEX_PATH = os.path.join(CACHE, "graph-index.md")

# A text table, not JSON. The index is read by language models, and JSON spends
# roughly a fifth of its bytes repeating the same six key names on every row —
# pure cost for a reader that can follow a header line perfectly well.
HEADER_NOTE = """<!-- generated by scripts/graph_index.py — do not edit by hand -->
# Graph index — routing only

**This answers *which files*, never *what they say*.** Read the file itself for
anything you quote, cite, or ground a claim on; never cite this index as a
source. It is a cache: regenerate with `python3 scripts/graph_index.py build`
before trusting it, and treat a missing entry as "not indexed", never as
"does not exist". Links are shown without the `.md` suffix.
"""


def _fmt_flags(flags):
    out = []
    for k, v in flags.items():
        if v is True:
            out.append(k)
        elif isinstance(v, list):
            out.append(f"{k}={','.join(str(x) for x in v)}" if v else f"{k}=[]")
        else:
            out.append(f"{k}={v}")
    return " ".join(out)


def cmd_build(argv):
    entities, out_links, in_links = build_graph()
    counts = {}
    for e in entities.values():
        if e.get("template"):        # templates are scaffolding, not research
            continue
        counts[e["type"]] = counts.get(e["type"], 0) + 1

    personas = [p for p in sorted(entities)
                if p.startswith("Personas/") and not entities[p].get("template")]
    orphans = sorted(p for p in entities
                     if not out_links[p] and not in_links[p]
                     and not entities[p].get("template") and "/" in p)

    def is_demo(path):
        return str(entities[path]["flags"].get("demo", "")).lower() == "true"

    lines = [HEADER_NOTE]
    lines.append(f"graph_hash: {global_hash()}")
    lines.append("counts: " + ", ".join(f"{t} {n}" for t, n in
                                        sorted(counts.items(), key=lambda kv: -kv[1])))

    # Which project this graph belongs to, and how much of it is the bundled
    # demo. Both sets live in the same folders — `demo: true` is what separates
    # them, not the path — so an index that lists them side by side is exactly
    # how a demo persona ends up in an answer about the user's research.
    proj = project_name()
    n_demo = sum(1 for path in entities
                 if not entities[path].get("template") and is_demo(path))
    if proj:
        lines.append(f"project: {proj}   # the active project — see Product Context.md")
    lines.append(f"demo_entities: {n_demo}   # `demo: true`, the bundled example set — "
                 "OUT of scope for the user's project unless they ask about the demo itself")
    lines.append("")

    lines.append("## Personas — slice hash for the persona-card cache")
    lines.append("")
    real_p = [p for p in personas if not is_demo(p)]
    demo_p = [p for p in personas if is_demo(p)]
    for label, group in (("This project", real_p), ("Demo — not this project", demo_p)):
        if not group:
            continue
        lines.append(f"**{label}**")
        for p in group:
            sl = slice_for(p, entities, out_links, in_links)
            lines.append(f"- **{entities[p]['title']}** · `{p}` · {len(sl)} files in slice "
                         f"· slice_hash `{hash_paths(sl)}`")
        lines.append("")

    lines.append("## Entities")
    lines.append("")
    lines.append("`type · path · flags · → links`")
    lines.append("")
    for p in sorted(entities):
        e = entities[p]
        row = f"{e['type']} · {p[:-3]}"
        fl = _fmt_flags(e["flags"])
        if e.get("template"):
            fl = ("template " + fl).strip()
        if fl:
            row += f" · {fl}"
        if e["links"]:
            row += " · → " + "; ".join(t[:-3] for t in e["links"])
        lines.append(row)
    lines.append("")

    # topic -> files, project and demo apart. Routing only: a topic here says a
    # file is tagged with it, not what the file says — and an untagged file is
    # absent, never "about nothing". Grep the folders when the topic is not here.
    lines.append("## Topics — tag, topic, feature or affinity → files")
    lines.append("")
    for label, demo in (("This project", False), ("Demo — not this project", True)):
        topics = {}
        for p, e in entities.items():
            if e.get("template") or is_demo(p) != demo:
                continue
            for k in TOPIC_KEYS:
                v = e["flags"].get(k)
                for t in (v if isinstance(v, list) else [v] if isinstance(v, str) else []):
                    if str(t).strip():
                        topics.setdefault(str(t).strip().lower(), set()).add(p[:-3])
        if not topics:
            continue
        lines.append(f"**{label}**")
        for t in sorted(topics):
            lines.append(f"- {t}: " + "; ".join(sorted(topics[t])))
        lines.append("")

    if orphans:
        lines.append("## Orphans — nothing links in or out")
        lines.append("")
        for p in orphans:
            lines.append(f"- {p[:-3]}")
        lines.append("")

    os.makedirs(CACHE, exist_ok=True)
    with open(INDEX_PATH, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))

    size = os.path.getsize(INDEX_PATH)
    print(f"wrote {os.path.relpath(INDEX_PATH, ROOT)} — {len(entities)} entities, "
          f"{size} bytes (~{size // 4} tokens)")
    for t, n in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {n:3} {t}")
    if orphans:
        print(f"  orphans (nothing links in or out): {len(orphans)}")
    return 0


SKILLS_DIR = os.path.join(ROOT, ".claude", "skills")
SKILLS_INDEX = os.path.join(SKILLS_DIR, "INDEX.md")

SKILLS_NOTE = """<!-- generated by `python3 scripts/graph_index.py skills` — do not edit by hand -->
# Skills index

Claude Code loads these as slash-commands and already knows their descriptions.
**This file exists for every other agent** — Codex, Gemini, Antigravity — which
has neither slash-commands nor an auto-loaded skill list. When a task matches a
row, open that `SKILL.md` and follow its steps directly. It is a map, not a
substitute: the rules live in the skill file, never here.

Committed on purpose, unlike `.claude/cache/`. Regenerate after adding, renaming
or re-describing a skill.
"""


def _ignored(path):
    """True when git ignores this path. No git, no problem — nothing is ignored."""
    try:
        import subprocess
        return subprocess.run(["git", "-C", ROOT, "check-ignore", "-q", path],
                              capture_output=True).returncode == 0
    except Exception:
        return False


def cmd_skills(argv):
    """Generate .claude/skills/INDEX.md from each skill's frontmatter."""
    if not os.path.isdir(SKILLS_DIR):
        print("no .claude/skills directory", file=sys.stderr)
        return 1
    rows = []
    for name in sorted(os.listdir(SKILLS_DIR)):
        path = os.path.join(SKILLS_DIR, name, "SKILL.md")
        if not os.path.isfile(path):
            continue
        # local-only skills (design labs and the like) are gitignored; this file is
        # committed, so listing them would advertise skills a clone does not have
        if _ignored(os.path.join(SKILLS_DIR, name)):
            continue
        fm = frontmatter(read(path))
        # the whole description, triggers included: for an agent with no skill
        # auto-loading, the "use when" half is the half that does the routing
        desc = str(scalar(fm.get("description")) or "").strip().replace("|", "\\|")
        refs = os.path.join(SKILLS_DIR, name, "references")
        n_refs = len([f for f in os.listdir(refs) if f.endswith(".md")]) if os.path.isdir(refs) else 0
        rows.append((scalar(fm.get("name")) or name, desc, n_refs))

    lines = [SKILLS_NOTE, "| Skill | What it does, and when | References |", "|---|---|---|"]
    for name, desc, n_refs in rows:
        refs_cell = f"{n_refs}, load on demand" if n_refs else "—"
        lines.append(f"| **`/{name}`** | {desc} | {refs_cell} |")
    lines.append("")
    lines.append(f"{len(rows)} skills. References are loaded **only** when the skill "
                 "says that mode has activated — never upfront.")
    lines.append("")

    with open(SKILLS_INDEX, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    size = os.path.getsize(SKILLS_INDEX)
    print(f"wrote {os.path.relpath(SKILLS_INDEX, ROOT)} — {len(rows)} skills, "
          f"{size} bytes (~{size // 4} tokens)")
    return 0


def cmd_hash(argv):
    if argv:
        h = persona_hash(argv[0])
        if h is None:
            print(f"unknown persona: {argv[0]}", file=sys.stderr)
            return 1
        print(h)
    else:
        print(global_hash())
    return 0


def cmd_check(argv):
    if not argv:
        print("usage: graph_index.py check <card.md>", file=sys.stderr)
        return 1
    card = argv[0] if os.path.isabs(argv[0]) else os.path.join(ROOT, argv[0])
    if not os.path.isfile(card):
        print("MISSING")
        return 0
    text = read(card)
    fm = frontmatter(text)
    stored = str(scalar(fm.get("graph_hash")) or "")
    if not stored:
        m = re.search(r"^graph_hash:\s*(.+)$", text, re.M)
        stored = m.group(1).strip().strip("'\"") if m else ""
    name = scalar(fm.get("persona")) or os.path.basename(card)
    current = persona_hash(name)
    if current is None:                       # persona gone, or an unnamed card
        current = global_hash()
    print("FRESH" if stored and stored == current else "STALE")
    return 0


def cmd_slice(argv):
    if not argv:
        print("usage: graph_index.py slice <Persona>", file=sys.stderr)
        return 1
    entities, out_links, in_links = build_graph()
    p = persona_path(argv[0], entities)
    if not p:
        print(f"unknown persona: {argv[0]}", file=sys.stderr)
        return 1
    files = slice_for(p, entities, out_links, in_links)
    total = sum(entities[f]["bytes"] for f in files if f in entities)
    for f in files:
        print(f)
    print(f"--- {len(files)} files, {total} bytes (~{total // 4} tokens)", file=sys.stderr)
    return 0


def main():
    argv = sys.argv[1:]
    cmds = {"build": cmd_build, "hash": cmd_hash, "check": cmd_check,
            "slice": cmd_slice, "skills": cmd_skills}
    if not argv or argv[0] not in cmds:
        print(__doc__.split("Commands:")[1].strip(), file=sys.stderr)
        return 1
    return cmds[argv[0]](argv[1:])


if __name__ == "__main__":
    sys.exit(main())
