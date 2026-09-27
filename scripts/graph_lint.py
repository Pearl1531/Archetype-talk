#!/usr/bin/env python3
"""graph_lint.py — mechanical health check for the Archetype Talk knowledge graph.

Checks (report-only; this script never modifies files):
  1. Dead relative links (.md targets that don't exist, after URL-decoding)
  2. Signals missing an Interview date or a Transcript link
  3. Frontmatter `evidences:` entries with no matching Evidence/<title>.md
  4. Orphan Signals — not linked from any Persona
  5. Freshness — Evidence `retrieved:`/Signal interview dates older than 90 days
  2b. Signals citing transcripts excluded from analysis (excluded: true)
  6. Competitor `mentioned_in` ↔ transcript `mentions_competitors` sync (both ways)
  7. `same_participant_as` targets exist
  8. Frontmatter the app's line-based parser can't read (multiline `>`/`|` YAML)
  9. Slug collisions (two files → one app id) and duplicate basenames across folders
 10. Inline source citations `[Sn]` that have no matching item in a `## Sources` list

Exit code: 1 if any ERROR-level finding, else 0 (WARN/INFO don't fail).
"""
import os, re, sys, datetime, urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# The graph reader lives in ONE place. Reading a .md file, parsing its
# frontmatter, splitting a `[a, b]` list and finding a markdown link are the
# same job here, in graph_index and in participant_trace — when they were three
# copies, a fix landed in one of them and the other two kept the bug.
from graph_index import (      # noqa: E402
    ROOT, FOLDERS, LINK_RE, read, frontmatter, list_field, rel, md_files,
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

TODAY = datetime.date.today()
STALE_DAYS = 90

errors, warns, infos = [], [], []


def parse_date(s):
    s = s.strip()
    for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%d-%m-%Y"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


# --- 1. dead links ------------------------------------------------------------
for folder in FOLDERS:
    for path in md_files(folder):
        text = read(path)
        for target in LINK_RE.findall(text):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            clean = urllib.parse.unquote(target.split("#")[0])
            if not clean or not clean.endswith((".md", ".png", ".jpg", ".jpeg", ".mp3", ".mp4", ".pdf")):
                continue
            resolved = os.path.normpath(os.path.join(os.path.dirname(path), clean))
            if not os.path.exists(resolved):
                errors.append(f"[dead link] {rel(path)} → {target}")

# --- 2 & 5. signals: date + transcript + freshness -----------------------------
signal_paths = md_files("Signals")
for path in signal_paths:
    text = read(path)
    m = re.search(r"##\s*Interview date\s*\n+([^\n]+)", text)
    date_line = m.group(1).strip() if m else ""
    if not m or not date_line or date_line.upper().startswith("DD"):
        warns.append(f"[signal] {rel(path)} — missing Interview date")
    else:
        d = parse_date(date_line)
        if d is None:
            warns.append(f"[signal] {rel(path)} — unparseable Interview date: '{date_line}'")
        elif (TODAY - d).days > STALE_DAYS:
            infos.append(f"[stale >3mo] {rel(path)} — interview {d.isoformat()}")
    if not re.search(r"##\s*Transcript\s*\n+[^\n]*\]\(", text):
        warns.append(f"[signal] {rel(path)} — missing Transcript link")

# --- 2b. signals citing transcripts the researcher excluded from analysis ---------
# (`excluded: true`, usually set via the app's "Use in analysis" switch). The signal
# is NOT auto-disabled — links are the researcher's material — but it deserves a look.
excluded_tr = set()
for tpath in md_files("Transcripts"):
    if frontmatter(read(tpath)).get("excluded", "").strip().strip("'\"").lower() == "true":
        excluded_tr.add(os.path.splitext(os.path.basename(tpath))[0].lower())
if excluded_tr:
    for path in signal_paths:
        for m in re.finditer(r"\]\(([^)]*Transcripts/[^)#]+)(?:#[^)]*)?\)", read(path)):
            base = os.path.splitext(os.path.basename(urllib.parse.unquote(m.group(1))))[0].lower()
            if base in excluded_tr:
                warns.append(f"[excluded source] {rel(path)} cites an excluded transcript ('{base}') — review whether this signal should still ground personas (your call; nothing was changed)")

# --- 3. evidences: frontmatter entries resolve ---------------------------------
evidence_titles = {os.path.splitext(os.path.basename(p))[0] for p in md_files("Evidence")}
for path in signal_paths:
    fm = frontmatter(read(path))
    for ev in list_field(fm, "evidences"):
        if ev not in evidence_titles:
            errors.append(f"[evidences:] {rel(path)} → no Evidence file titled '{ev}'")

# --- 4. orphan signals ----------------------------------------------------------
persona_text = "".join(urllib.parse.unquote(read(p)) for p in md_files("Personas"))
for path in signal_paths:
    name = os.path.basename(path)
    if name not in persona_text:
        warns.append(f"[orphan] {rel(path)} — not linked from any Persona")

# --- 5b. evidence freshness ------------------------------------------------------
for path in md_files("Evidence"):
    fm = frontmatter(read(path))
    raw = fm.get("retrieved", "")
    if raw:
        d = parse_date(raw)
        if d and (TODAY - d).days > STALE_DAYS:
            infos.append(f"[stale >3mo] {rel(path)} — retrieved {d.isoformat()}")
    else:
        warns.append(f"[evidence] {rel(path)} — no retrieved: date")

# --- 6. competitor mentions sync (both directions) -------------------------------
transcript_titles = {os.path.splitext(os.path.basename(p))[0]: p for p in md_files("Transcripts")}
competitor_titles = {os.path.splitext(os.path.basename(p))[0]: p for p in md_files("Competitors")}
comp_mentioned = {}   # competitor title -> set of transcript titles it claims
for title, path in competitor_titles.items():
    fm = frontmatter(read(path))
    ment = list_field(fm, "mentioned_in")
    comp_mentioned[title] = set(ment)
    for t in ment:
        if t not in transcript_titles:
            errors.append(f"[mentions sync] {rel(path)} → mentioned_in names missing transcript '{t}'")
for ttitle, tpath in transcript_titles.items():
    fm = frontmatter(read(tpath))
    if "mentions_competitors" not in fm:
        warns.append(f"[scan header] {rel(tpath)} — no mentions_competitors (should be [] when checked-none)")
        continue
    listed = list_field(fm, "mentions_competitors")
    for c in listed:
        if c not in competitor_titles:
            errors.append(f"[mentions sync] {rel(tpath)} → names missing competitor '{c}'")
        elif ttitle not in comp_mentioned.get(c, set()):
            warns.append(f"[mentions sync] {rel(tpath)} mentions '{c}' but {c}'s mentioned_in lacks '{ttitle}'")
    for c, ments in comp_mentioned.items():
        if ttitle in ments and c not in listed:
            warns.append(f"[mentions sync] Competitors/{c}.md lists '{ttitle}' but that transcript's mentions_competitors lacks '{c}'")

# --- 7. same_participant_as targets exist -----------------------------------------
for ttitle, tpath in transcript_titles.items():
    ref = frontmatter(read(tpath)).get("same_participant_as", "").strip().strip("'\"")
    if ref and ref not in transcript_titles:
        errors.append(f"[participants] {rel(tpath)} → same_participant_as names missing transcript '{ref}'")

# --- 8. frontmatter the app's line-based parser can't read -------------------------
for folder in FOLDERS:
    for path in md_files(folder):
        text = read(path)
        if text.startswith("---"):
            end = text.find("\n---", 3)
            if end != -1:
                for line in text[3:end].splitlines():
                    if re.match(r"^\w+:\s*[>|]\s*$", line):
                        warns.append(f"[frontmatter] {rel(path)} — multiline YAML ('{line.strip()}') — the app's parser reads single lines only")
                        break

# --- 9. slug collisions + duplicate basenames ---------------------------------------
def app_slug(relpath):
    return re.sub(r"[^a-z0-9]+", "-", relpath[:-3].lower()) if relpath.endswith(".md") else relpath
slugs, basenames = {}, {}
for folder in FOLDERS:
    for path in md_files(folder):
        rp = rel(path).replace(os.sep, "/")
        sl = app_slug(rp)
        if sl in slugs:
            errors.append(f"[collision] {rp} ⇄ {slugs[sl]} — same app id, one silently shadows the other")
        slugs[sl] = rp
        b = os.path.basename(path).lower()
        if b in basenames and os.path.dirname(basenames[b]) != os.path.dirname(rp):
            warns.append(f"[duplicate name] {rp} vs {basenames[b]} — bare-name links are ambiguous (folder-qualified links still resolve)")
        basenames[b] = rp

# --- 10. inline source citations [Sn] resolve to a ## Sources list item -------------
CITE_RE = re.compile(r"\[S(\d+)\]")
def count_sources(text):
    m = re.search(r"^##\s+(?:Sources|References|Źródła|Zrodla)\b.*$", text, re.MULTILINE | re.IGNORECASE)
    if not m:
        return None
    tail = text[m.end():]
    nxt = re.search(r"^#{1,3}\s", tail, re.MULTILINE)
    if nxt:
        tail = tail[:nxt.start()]
    return len(re.findall(r"^\s*(?:[-*]|\d+\.)\s+\S", tail, re.MULTILINE))
for folder in FOLDERS:
    for path in md_files(folder):
        text = read(path)
        cites = [int(n) for n in CITE_RE.findall(text)]
        if not cites:
            continue
        n_src = count_sources(text)
        if n_src is None:
            warns.append(f"[citation] {rel(path)} — uses [S{max(cites)}] but has no '## Sources' list")
        else:
            for c in sorted(set(cites)):
                if c < 1 or c > n_src:
                    warns.append(f"[citation] {rel(path)} → [S{c}] has no matching item in its {n_src}-item ## Sources list")

# --- 11. data lifecycle: retention, consent scope, Art. 9, anonymisation ----------
# Severity rule for this whole block: the lifecycle fields are OPTIONAL, so their
# ABSENCE is never an error and mostly not even a warning — a repo that has never
# heard of them stays green. Errors are reserved for a stated intent contradicting
# itself (Art. 9 material against a consent scope that excludes it), because that
# is the one case where staying quiet would be actively misleading.
CONSENT_SCOPES = {"research", "ai_processing", "verbatim_quotes", "external_sharing",
                  "voice_synthesis", "special_category"}
transcript_paths = md_files("Transcripts")
lifecycle_seen = False
for path in transcript_paths:
    text = read(path)
    fm = frontmatter(text)
    if fm.get("demo", "").lower() == "true":
        continue  # demo participants are invented; a consent record would be fiction
    scope = set(list_field(fm, "consent_scope"))
    special = [s for s in list_field(fm, "special_category") if s]
    consent = fm.get("consent", "").strip().strip("'\"").lower()
    anon = fm.get("anonymization", "").strip().strip("'\"").lower()
    key_loc = fm.get("key_location", "").strip().strip("'\"").lower()
    if scope or consent or anon or fm.get("retention_until"):
        lifecycle_seen = True

    unknown = scope - CONSENT_SCOPES
    if unknown:
        warns.append(f"[consent] {rel(path)} — unrecognised consent_scope value(s): {', '.join(sorted(unknown))}")

    # Art. 9 material recorded, but the consent scope explicitly does not cover it
    if special and scope and "special_category" not in scope:
        errors.append(
            f"[art.9] {rel(path)} — carries special_category {special} but consent_scope does not "
            f"include 'special_category'. Either the scope is incomplete or this material should not be held."
        )
    # quoting rights
    if scope and "verbatim_quotes" not in scope:
        infos.append(f"[consent] {rel(path)} — consent_scope has no 'verbatim_quotes': paraphrase instead of quoting")

    # retention clock — only meaningful while the data is still personal
    due = parse_date(fm.get("retention_until", "")) if fm.get("retention_until") else None
    if due and key_loc != "destroyed":
        overdue = (TODAY - due).days
        if overdue > 0:
            warns.append(
                f"[retention] {rel(path)} — past retention_until ({due.isoformat()}, {overdue} days). "
                f"Run /retention: de-identify first (key_location: destroyed stops the clock), delete only if the text still identifies."
            )
        elif overdue > -30:
            infos.append(f"[retention] {rel(path)} — retention_until in {-overdue} day(s) ({due.isoformat()})")
    if consent == "none" and anon in ("", "none"):
        warns.append(f"[consent] {rel(path)} — consent: none and no anonymisation recorded; confirm this file may be held at all")

# Signals must not out-live their source, and must inherit the Art. 9 flag
transcript_special = {}
for path in transcript_paths:
    fm = frontmatter(read(path))
    stem = os.path.basename(path)[:-3]
    transcript_special[stem] = [s for s in list_field(fm, "special_category") if s]
for path in md_files("Signals"):
    text = read(path)
    fm = frontmatter(text)
    own = [s for s in list_field(fm, "special_category") if s]
    for target in LINK_RE.findall(text):
        clean = urllib.parse.unquote(target.split("#")[0])
        if "Transcripts/" not in clean or not clean.endswith(".md"):
            continue
        stem = os.path.basename(clean)[:-3]
        src_special = transcript_special.get(stem)
        if src_special and not own:
            # INFO, not WARN, and phrased as a question on purpose: a session can
            # touch Art. 9 material in one answer and nowhere else, so most signals
            # from a flagged transcript need no flag. Only a human can tell, and a
            # check that nags on every one of them just teaches people to over-flag.
            infos.append(
                f"[art.9] {rel(path)} — its source {stem} is flagged {src_special}. Does THIS quote carry "
                f"that material too? Often not — flag only if it does."
            )
        if stem not in transcript_special and os.path.isdir(os.path.join(ROOT, "Transcripts")):
            infos.append(f"[erasure] {rel(path)} — cites a transcript that is no longer present ({stem}); if it was erased, re-grade this signal")

# --- 12. unmasked email addresses in entity files ---------------------------------
# These files get committed, and repos get made public. An address here is a
# harvestable leak whether it belongs to a participant (their contact details) or
# to the team (author:/updated_by:). The app writes `updated_by` as a display name
# only and masks author emails to m***@g***.com; this catches everything that
# arrives by another route — a pasted transcript, a hand-edited frontmatter line.
EMAIL_RE = re.compile(r"(?<![\w.+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}(?![\w-])")
for folder in FOLDERS:
    for path in md_files(folder):
        for hit in set(EMAIL_RE.findall(read(path))):
            if "***" in hit or hit.lower().endswith(("@example.com", "@example.org")):
                continue
            local, _, domain = hit.partition("@")
            warns.append(
                f"[email] {rel(path)} — unmasked address ({local[0]}***@{domain[0]}***). "
                f"Remove it or mask it before this file is committed; contact details do not belong in the graph."
            )
for name in ["Participants.md", "Research backlog.md", "Product Context.md"]:
    p = os.path.join(ROOT, name)
    if os.path.isfile(p):
        for hit in set(EMAIL_RE.findall(read(p))):
            if "***" in hit or hit.lower().endswith(("@example.com", "@example.org")):
                continue
            warns.append(f"[email] {name} — unmasked address; mask or remove it before committing")

# --- sentiment stances ------------------------------------------------------------
# Only the ladder is enforced. A signal with no stance is normal and silent: most
# observations carry no attitude, and "absent" must never drift into meaning "neutral".
STANCES = {"dealbreaker", "resents", "frustrated", "wary", "indifferent", "unaware",
           "curious", "appreciates", "relies_on", "advocates", "mixed"}

stance_by_feature = {}
for path in md_files("Signals"):
    text = read(path)
    block = re.search(r"^sentiment:\s*\n((?:[ \t]+\S.*\n?)+)", text, re.M)
    if not block:
        continue
    body = block.group(1)
    def field(key):
        m = re.search(rf"^\s+{key}:\s*(.+)$", body, re.M)
        return m.group(1).strip().strip("'\"") if m else None
    stance, feature = field("stance"), field("feature")
    name = rel(path)
    if stance and stance not in STANCES:
        errors.append(f"[stance] {name} — '{stance}' is not on the ladder "
                      f"(see Signals/_template.md); a made-up value silently disables every check")
    if stance and not feature:
        warns.append(f"[stance] {name} — stance '{stance}' with no feature: it cannot be "
                     f"aggregated onto a persona or read by /feature-panel")
    if stance and not field("because"):
        infos.append(f"[stance] {name} — no 'because:' line. A stance you cannot point at in "
                     f"the transcript is the one most likely to have been inferred")
    if stance == "unaware":
        infos.append(f"[stance] {name} — 'unaware' is a coverage gap, not a finding about the "
                     f"person: it belongs in Research backlog.md")
    if stance and feature:
        stance_by_feature.setdefault(feature, []).append((stance, name, field("unprompted")))

# One summary line, not one per file: `unprompted` is optional, and a per-signal
# nag on an optional field is how a linter teaches people to stop reading it.
_st = [e for v in stance_by_feature.values() for e in v]
_no_flag = [n for _s, n, u in _st if u is None]
if _st and _no_flag:
    infos.append(f"[stance] {len(_no_flag)} of {len(_st)} stance(s) have no 'unprompted:' recorded — "
                 f"without it, /feature-panel cannot tell an attitude the participant "
                 f"volunteered from one the moderator elicited")
_prompted_only = [f for f, es in stance_by_feature.items()
                  if es and all(u == "false" for _s, _n, u in es)]
if _prompted_only:
    # n is shown because the reading differs: one prompted stance is thin, five is a pattern
    listed = ", ".join(f"{f} ({len(stance_by_feature[f])})" for f in sorted(_prompted_only))
    infos.append("[focusing illusion] nobody raised these unasked — every recorded stance came "
                 "after a moderator question, so the attitude is evidenced but the salience is "
                 f"not: {listed}")

for feature, entries in sorted(stance_by_feature.items()):
    NEG = {"dealbreaker", "resents", "frustrated", "wary"}
    POS = {"curious", "appreciates", "relies_on", "advocates"}
    neg = [n for s, n, _u in entries if s in NEG]
    pos = [n for s, n, _u in entries if s in POS]
    if neg and pos:
        infos.append(f"[stance split] '{feature}' — {len(neg)} negative vs {len(pos)} positive. "
                     f"That is a finding for /contradictions, not something to average away")

if not lifecycle_seen and transcript_paths:
    infos.append("[lifecycle] no transcript records consent/retention/anonymisation yet — optional, "
                 "but it is what /forget-participant and /retention act on (schema: Transcripts/_template.md)")

# --- report ----------------------------------------------------------------------
def emit(label, items):
    if items:
        print(f"\n{label} ({len(items)}):")
        for i in items:
            print(f"  {i}")

emit("ERRORS", errors)
emit("WARNINGS", warns)
emit("INFO", infos)
if not (errors or warns or infos):
    print("Graph is clean — no findings.")
print(f"\nSummary: {len(errors)} error(s), {len(warns)} warning(s), {len(infos)} info.")
sys.exit(1 if errors else 0)
