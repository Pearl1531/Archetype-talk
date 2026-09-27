# Voice memos & call recordings → Inbox/ → Transcripts/

The missing first link of the chain: most raw research today is a **recording** — a user interview on Zoom, a hallway conversation captured as a voice memo, a call auto-transcribed by Grain/Fireflies/Otter/tl;dv. This reference gets those recordings into `Inbox/` as text, where the normal pipeline (`/extract-findings`) takes over.

## Two paths in

### 1. Transcription tools (Grain, Fireflies, Otter, tl;dv, Zoom)

These tools already hold transcripts of your sessions. Connect the tool's official MCP server (or, where none exists, its export feature) and pull **read-only**:

- List recent meetings/recordings; the user picks which are *research sessions* — never bulk-import a whole meeting archive, most calls aren't research.
- Pull the transcript text + metadata: date, participant (pseudonymize on the way in — see PII rule), duration.
- Write to `Inbox/<INT-code or working title>.md` with provenance frontmatter (`source: grain|fireflies|otter|tldv|zoom`, source id, deep link).
- Then hand off: "N new transcripts in Inbox/ — run `/extract-findings --inbox`?"
- Speaker labels: keep them ("Researcher:" / "P:"), they matter for verbatim quotes later.

### 2. Raw voice memos (audio files the user drops or points to)

A researcher records a debrief or an in-person session as a voice memo. Audio can't enter the graph directly — it needs transcription first:

- If a transcription tool from path 1 is connected, suggest running the file through it.
- Otherwise ask how the user wants it transcribed (their tool of choice); this repo does not pick a transcription vendor for them or upload audio anywhere without being asked.
- Audio files themselves stay OUT of git (large binaries) — reference their location in the transcript's frontmatter (`recording: <path or URL>`), and store session media under `Transcripts/media/` only when the user explicitly wants it in the repo tree (gitignore-review it first).

## Rules specific to this family

- **A transcript of OUR session is raw input for Signals** (via `/extract-findings`) — this is the one source family that legitimately feeds the Signal side of the line. Everything must still pass through `Transcripts/` + extraction; a transcript is never itself a Signal.
- **PII in, pseudonym out:** real participant names get replaced with codes (INT-xx / P-xx) as the file is written to `Inbox/` — same standard `/extract-findings` enforces (its Step 0), applied one step earlier.
- **Consent is the researcher's call, not ours to assume:** when importing from a meeting tool, ask once per batch whether these participants consented to research use. Don't import if the user hesitates.
- Auto-transcripts are imperfect — mark the file `transcription: auto` so `/extract-findings` treats garbled quotes with care (verbatim quotes from an auto-transcript inherit its uncertainty; flag mangled ones instead of "fixing" them silently).
