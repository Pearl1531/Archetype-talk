#!/usr/bin/env python3
"""participant_trace.py — find everything in this repo that traces back to one participant.

REPORT ONLY. This script never modifies, moves or deletes a file. It is the
mechanical base under three human-driven flows:

  /forget-participant   GDPR Art. 17 — erasure or de-identification
  /subject-access       GDPR Art. 15/20 — "give me everything you hold about me"
  /retention            the storage clock running out

Usage:
  python3 scripts/participant_trace.py INT-06
  python3 scripts/participant_trace.py INT-06 --json

Why a script and not just grep: a participant code is not the only thread. This
follows the transcript's own filename, `same_participant_as` links between
sessions, every Signal citing that transcript, the Personas and Archetypes
carrying those Signals' quotes, and the derived caches — then reports what the
graph LOSES, which is the part a grep can never tell you.

Exit code is always 0: nothing here is a failure, it is an inventory.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# One graph reader for every script here — see the note in graph_lint.py.
# `md_files` skips `_template.md` on its own, which is why the per-loop
# `startswith("_")` guards below are gone.
from graph_index import ROOT, read, frontmatter, rel, md_files   # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

GRAPH_FOLDERS = ["Transcripts", "Signals", "Personas", "Archetypes", "Evidence",
                 "Ideas", "Hypotheses", "Competitors"]
ROOT_DOCS = ["Participants.md", "Research backlog.md", "Product Context.md", "DEMO.md"]
DERIVED_DIRS = [".claude/cache", ".claude/voice-cache", "Inbox"]


def unquote(v):
    return v.strip().strip("'\"")


def trace(code):
    code = code.strip()
    if not code:
        return None
    # A code may appear as INT-06, INT‑06 in a link, or url-encoded in a path.
    pat = re.compile(re.escape(code).replace(r"\-", r"[-‑–]"), re.I)

    # 1. the participant's own transcripts (by interview_id or filename)
    transcripts, aliases = [], {code.lower()}
    for path in md_files("Transcripts"):
        text = read(path)
        fm = frontmatter(text)
        if pat.search(unquote(fm.get("interview_id", ""))) or pat.search(os.path.basename(path)):
            transcripts.append(path)
            aliases.add(os.path.basename(path)[:-3].lower())

    # 2. sessions the registry says are the SAME person (interview + later test)
    for path in md_files("Transcripts"):
        fm = frontmatter(read(path))
        linked = unquote(fm.get("same_participant_as", ""))
        if not linked:
            continue
        hit = any(pat.search(linked) or linked.lower() in aliases for _ in [0])
        if hit and path not in transcripts:
            transcripts.append(path)
            aliases.add(os.path.basename(path)[:-3].lower())
            aliases.add(unquote(fm.get("interview_id", "")).lower())
    tset = {rel(p) for p in transcripts}

    # 3. every graph file that mentions the code or links to one of the transcripts.
    # README.md is in scope here (readme=True): it is not an entity, but a worked
    # example inside one can quote a real session, and an access request asks what
    # text the repo holds about a person — not what the graph counts as a node.
    hits = []
    for folder in GRAPH_FOLDERS:
        for path in md_files(folder, readme=True):
            if rel(path) in tset:
                continue
            text = read(path)
            why = []
            if pat.search(text):
                why.append("names the code")
            for t in transcripts:
                stem = os.path.basename(t)[:-3]
                if stem.lower() in text.lower() or stem.replace(" ", "%20").lower() in text.lower():
                    why.append("links the transcript")
                    break
            if why:
                hits.append({"file": rel(path), "why": sorted(set(why)), "degree": 1,
                             "quotes": len(re.findall(r"^>\s?\S", text, re.M)),
                             "special_category": frontmatter(text).get("special_category", "")})

    # 3b. second degree — files that carry no code and no transcript link, but
    # reference an affected Signal or Persona. An Archetype paraphrasing "Tom
    # prefers dictation because of dyslexia" holds this person's data without
    # ever naming the session, so a code grep alone would miss it.
    # A folder's README is deliberately NOT a hop: every file in the folder links
    # to it as documentation, so following it turns one direct hit into the whole
    # folder — 42 Signals "holding" data they never mention. Hub, not carrier.
    first = {h["file"] for h in hits if os.path.basename(h["file"]) != "README.md"}
    # Match a LINK to the affected file (Folder/Stem.md), not a bare mention of
    # its name: "Tom" appears in prose all over a demo repo, and a tool that
    # cries wolf on every one of them is a tool nobody runs twice.
    seen = {h["file"] for h in hits}
    for folder in GRAPH_FOLDERS:
        for path in md_files(folder):
            if rel(path) in tset or rel(path) in seen:
                continue
            low = read(path).replace("%20", " ").lower()
            touched = sorted({os.path.basename(f)[:-3] for f in first
                              if f.lower() in low or f.split("/", 1)[-1].lower() in low})
            if touched:
                hits.append({"file": rel(path), "why": [f"references {', '.join(touched[:3])}"],
                             "degree": 2, "quotes": 0,
                             "special_category": frontmatter(read(path)).get("special_category", "")})

    # 4. root documents
    docs = []
    for name in ROOT_DOCS:
        p = os.path.join(ROOT, name)
        if os.path.isfile(p) and pat.search(read(p)):
            docs.append(name)

    # 5. derived artefacts — caches, generated audio, unprocessed inbox drops
    derived = []
    for d in DERIVED_DIRS:
        full = os.path.join(ROOT, d)
        if not os.path.isdir(full):
            continue
        for dirpath, _, names in os.walk(full):
            for n in names:
                p = os.path.join(dirpath, n)
                if pat.search(n) or (n.endswith((".md", ".txt", ".json")) and pat.search(read(p))):
                    derived.append(rel(p))
    # persona voice files are named after the persona, not the code — flag the
    # whole cache when the participant feeds a persona that has generated audio
    personas = [h["file"] for h in hits if h["file"].startswith("Personas/")]
    for pth in personas:
        stem = os.path.basename(pth)[:-3].lower()
        vc = os.path.join(ROOT, ".claude", "voice-cache")
        if os.path.isdir(vc):
            for n in sorted(os.listdir(vc)):
                if n.lower().startswith(stem) and rel(os.path.join(vc, n)) not in derived:
                    derived.append(rel(os.path.join(vc, n)))

    # 6. grounding impact — which signals would lose their ONLY source
    signals = [h["file"] for h in hits if h["file"].startswith("Signals/")]
    orphaned = []
    for s in signals:
        text = read(os.path.join(ROOT, s))
        links = re.findall(r"Transcripts/([^)\s]+?)\.md", text.replace("%20", " "))
        others = {l.strip() for l in links} - {os.path.basename(t)[:-3] for t in transcripts}
        if not others:
            orphaned.append(s)

    return {
        "code": code,
        "transcripts": sorted(tset),
        "graph_files": hits,
        "root_docs": docs,
        "derived": sorted(set(derived)),
        "signals": sorted(signals),
        "signals_losing_their_only_source": sorted(orphaned),
        "personas_affected": sorted(personas),
        "special_category": sorted({h["special_category"] for h in hits if h["special_category"]}),
    }


def report(r):
    print(f"Participant trace — {r['code']}\n" + "=" * 46)
    if not r["transcripts"]:
        print("\nNo transcript carries this code. Check Participants.md for the right one.")
    print(f"\nTranscripts ({len(r['transcripts'])}) — the raw source:")
    for t in r["transcripts"]:
        print(f"  {t}")
    direct = [h for h in r["graph_files"] if h.get("degree", 1) == 1]
    second = [h for h in r["graph_files"] if h.get("degree", 1) == 2]

    def line(h):
        extra = f" [{unquote(h['special_category']).strip('[]')}]" if h["special_category"] else ""
        q = f", {h['quotes']} quote block(s)" if h["quotes"] else ""
        print(f"  {h['file']}{extra} — {', '.join(h['why'])}{q}")

    print(f"\nDirect references ({len(direct)}) — name the code or link the transcript:")
    for h in direct:
        line(h)
    if second:
        print(f"\nSecond degree ({len(second)}) — carry the material without naming the session,")
        print("  e.g. an archetype paraphrasing this person. Read before deciding:")
        for h in second:
            line(h)
    if r["root_docs"]:
        print(f"\nRoot documents ({len(r['root_docs'])}):")
        for d in r["root_docs"]:
            print(f"  {d}")
    if r["derived"]:
        print(f"\nDerived artefacts ({len(r['derived'])}) — caches and generated media:")
        for d in r["derived"]:
            print(f"  {d}")
    if r["special_category"]:
        print(f"\n⚠ Special-category material involved: {', '.join(r['special_category'])}")
        print("  Name it explicitly when proposing anything, and never let it leave by default.")

    print("\nGrounding impact")
    print("-" * 46)
    if r["signals_losing_their_only_source"]:
        print("These signals cite NO other transcript — removing this participant leaves them")
        print("unverifiable. De-identify in place (keep the finding, drop the quote) or accept")
        print("the level drop; do not leave them silently standing:")
        for s in r["signals_losing_their_only_source"]:
            print(f"  {s}")
    else:
        print("No signal depends on this participant alone.")
    if r["personas_affected"]:
        print("\nPersonas whose grounding changes — re-grade their claims after any removal:")
        for p in r["personas_affected"]:
            print(f"  {p}")

    print("\nOutside this script's reach — must be handled by a human")
    print("-" * 46)
    print("  git history      — earlier versions survive `rm`; rewriting is a deliberate, coordinated act")
    print("  browser storage  — votes, exclusions and drafts: app Settings ▸ Privacy ▸ Clear local data")
    print("  source system    — Dovetail/Otter/etc. still holds the original recording")
    print("  model provider   — session logs, per your DPA and retention setting")
    print("  ElevenLabs       — if any audio was generated from this persona")
    print("  sent exports     — zips, PDFs and tickets already delivered to stakeholders")
    print("\nNothing was modified. Run /forget-participant or /subject-access to act on this.")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__.strip().split("\n\n")[2])
        sys.exit(0)
    result = trace(args[0])
    if "--json" in sys.argv[1:]:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        report(result)
