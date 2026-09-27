#!/usr/bin/env python3
"""embed_demo.py — regenerate the embedded example graph.

Reads entity .md files (7 folders, skipping _templates and READMEs), writes
them as <script type="text/markdown"> blocks into
app/src/embedded-graph.html, then rebuilds app/index.html via
scripts/build_app.py. Re-run after demo content changes.

Only files with `demo: true` in frontmatter are embedded — app/index.html is
committed and meant to be shared, so real research must never be baked into
it. Pass --all to deliberately embed everything (private builds only).
"""
import base64
import html
import json
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, "app", "src", "embedded-graph.html")
# The demo's own frozen root docs. The entity files carry `demo: true` and are
# filtered by it, but the two ROOT docs — Product Context.md and Research
# backlog.md — have no such flag: there is exactly one of each, and it belongs
# to whatever project this repo currently holds. Reading those straight from
# the root put the *user's* product context inside the Demo workspace, so the
# demo showed Spotify personas under someone else's brief. These copies are the
# demo's own, and they only change when the demo does.
DEMO_DOCS = os.path.join(ROOT, "docs", "demo-workspace")
FOLDERS = ["Personas", "Archetypes", "Signals", "Evidence", "Hypotheses", "Ideas", "Competitors", "Transcripts"]
EMBED_ALL = "--all" in sys.argv[1:]

def demo_doc(name):
    """The demo's frozen copy of a root doc, or the live one if there is none."""
    frozen = os.path.join(DEMO_DOCS, name)
    if os.path.isfile(frozen):
        return frozen, True
    return os.path.join(ROOT, name), False


frozen_used = []

DEMO_RE = re.compile(r"^demo:\s*true\s*(#.*)?$", re.M)
PIC_RE = re.compile(r"^(?:picture|photo):\s*([^\s#][^#\n]*?)\s*(?:#.*)?$", re.M)
MIME = {".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif"}


def is_demo(md):
    m = re.match(r"^---\n.*?\n---", md, re.S)
    return bool(m and DEMO_RE.search(m.group(0)))


demo_personas = set()   # first names of embedded demo personas — the backlog filter below


def persona_names(md, name):
    """Names a backlog row may use for this persona: full title + first token."""
    m = re.search(r"^title:\s*['\"]?(.+?)['\"]?\s*$", md, re.M)
    title = m.group(1) if m else name[:-3]
    out = {title.strip().lower()}
    out.add(re.split(r"\s+[—–-]\s+", title.strip())[0].strip().lower())
    return {n for n in out if n}


def collect_pictures(md, rel, into):
    """Inline any local image a file points at, so the shipped single-file app
    renders avatars with no folder connected and — crucially — no network call.
    Only relative paths are followed: an http(s) picture: stays external and the
    app blocks it behind Settings > Privacy & network until the user opts in."""
    head = re.match(r"^---\n.*?\n---", md, re.S)
    if not head:
        return
    for raw in PIC_RE.findall(head.group(0)):
        val = raw.strip().strip("'\"")
        if not val or re.match(r"^[a-z][a-z0-9+.-]*:", val, re.I):
            continue  # data:, http(s):, anything scheme-like — not a local file
        path = os.path.normpath(os.path.join(os.path.dirname(rel), val.lstrip("./")))
        key = path.replace(os.sep, "/")
        if key in into:
            continue
        full = os.path.join(ROOT, path)
        mime = MIME.get(os.path.splitext(full)[1].lower())
        if not mime or not os.path.isfile(full):
            print(f"  ! {rel}: picture/photo -> {val} (not found or unsupported type) — will render as initials")
            continue
        with open(full, "rb") as fh:
            into[key] = f"data:{mime};base64," + base64.b64encode(fh.read()).decode("ascii")


blocks = []
pictures = {}
count = skipped = 0
for folder in FOLDERS:
    d = os.path.join(ROOT, folder)
    if not os.path.isdir(d):
        continue
    for name in sorted(os.listdir(d)):
        if not name.endswith(".md") or name.startswith("_") or name == "README.md":
            continue
        with open(os.path.join(d, name), encoding="utf-8") as fh:
            md = fh.read()
        if not EMBED_ALL and not is_demo(md):
            skipped += 1
            continue
        if folder == "Personas":
            demo_personas |= persona_names(md, name)
        rel = f"{folder}/{name}"
        collect_pictures(md, rel, pictures)
        md = md.replace("</script", "<\\/script")  # never terminate the block early
        blocks.append(
            f'<script type="text/markdown" data-file="{html.escape(rel, quote=True)}">\n{md}\n</script>'
        )
        count += 1

# Product Context.md — not an entity, but the app reads it to render "us" (the
# market-map anchor + the About-us card on the Competitors tab).
pc_path, pc_frozen = demo_doc("Product Context.md")
if pc_frozen:
    frozen_used.append("Product Context.md")
if os.path.isfile(pc_path):
    with open(pc_path, encoding="utf-8") as fh:
        pc = fh.read().replace("</script", "<\\/script")
    blocks.append(f'<script type="text/product-context" data-file="Product Context.md">\n{pc}\n</script>')

# Local images the embedded files point at, inlined so the shipped app needs no
# folder and no network to show them (see picResolve in app/src/js/02-parse-state.js).
if pictures:
    payload = json.dumps(pictures, ensure_ascii=True).replace("</", "<\\/")
    blocks.append(f'<script type="application/json" data-pictures>{payload}</script>')

# Research backlog.md — the app's Research backlog page reads this root doc.
# app/index.html is committed, so only rows about an embedded DEMO persona ship:
# a real project's open questions are research too, and never belong in the
# shared build. Prose, headings and structure are kept verbatim.
dropped_rows = 0


def backlog_row_is_demo(line, persona_col):
    global dropped_rows
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    if persona_col >= len(cells):
        return False
    who = re.sub(r"\[|\]|\(.*?\)", "", cells[persona_col]).strip().lower()
    if who and (who in demo_personas or who.split()[0] in demo_personas):
        return True
    dropped_rows += 1
    return False


bl_path, bl_frozen = demo_doc("Research backlog.md")
if bl_frozen:
    frozen_used.append("Research backlog.md")
if os.path.isfile(bl_path):
    with open(bl_path, encoding="utf-8") as fh:
        bl_lines = fh.read().replace("</script", "<\\/script").split("\n")
    kept, persona_col, in_table = [], -1, False
    for line in bl_lines:
        stripped = line.strip()
        if stripped.startswith("|"):
            cells = [c.strip().lower() for c in stripped.strip("|").split("|")]
            if not in_table:  # header row of a table
                in_table = True
                persona_col = next((i for i, c in enumerate(cells) if "persona" in c), -1)
                kept.append(line)
                continue
            if set("".join(cells)) <= set("-: "):  # the |---|---| separator
                kept.append(line)
                continue
            # A frozen copy IS the demo's backlog, so every row in it belongs
            # in the build — including the ones tied to no persona at all (a
            # coverage gap is a question about the demo too). The per-row
            # filter is only needed when falling back to the live root doc,
            # where a real project's open questions would otherwise ship.
            if EMBED_ALL or bl_frozen or (persona_col > -1 and backlog_row_is_demo(line, persona_col)):
                kept.append(line)
            continue
        in_table = False
        kept.append(line)
    blocks.append(
        '<script type="text/research-backlog" data-file="Research backlog.md">\n'
        + "\n".join(kept)
        + "\n</script>"
    )

with open(DEST, "w", encoding="utf-8", newline="\n") as fh:
    fh.write("\n".join(blocks) + "\n")

sys.path.insert(0, os.path.join(ROOT, "scripts"))
import build_app  # noqa: E402
build_app.build()

note = f" (skipped {skipped} non-demo — real research never ships in the app; --all overrides)" if skipped else ""
pics = f"; inlined {len(pictures)} local image(s)" if pictures else ""
if dropped_rows:
    note += f"; dropped {dropped_rows} backlog row(s) not about a demo persona"
if frozen_used:
    note += "; root docs from docs/demo-workspace/ (" + ", ".join(frozen_used) + ")"
print(f"Embedded {count} entity files → app/src/embedded-graph.html{pics}; rebuilt app/index.html{note}")
