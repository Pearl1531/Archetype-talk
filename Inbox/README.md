# Inbox — drop new raw material here

Put **new, unprocessed** research material in this folder:

- interview / usability-test transcripts (`.md`, `.txt`, `.srt`, `.vtt`)
- reports and documents (`.pdf`, `.docx`, `.doc`, `.rtf`, `.odt`)
- scans and photos of notes or printouts (`.png`, `.jpg`, `.heic`, `.tif`, scanned PDFs)
- session notes, raw quotes, survey exports pasted into a markdown file

PDF, Word and image files are first turned into text on your own machine by `scripts/to_text.py` (nothing is uploaded; scans are read with the OCR built into macOS). The text keeps a `[p. N]` marker per page, so every figure can be traced back to the original. If a page can't be read, it is marked as unread rather than guessed.

## What happens next

At the start of a new conversation, a lightweight hook checks this folder. If it finds new files, the AI will **ask you first** whether to analyze them (and warn you if there are many, since it can take a while and cost tokens). When you say yes, it runs `/extract-findings`, which:

1. reads each file,
2. extracts **Signals** (one observation + verbatim quote + date) and any **Evidence**,
3. wires them into the relevant persona,
4. moves the processed original into `Transcripts/`.

Nothing here is analyzed automatically without your go-ahead. Verbatim quotes are never translated or paraphrased. A synthetic persona chat never lands here — this folder is only for **real** research.

> Dovetail interviews are pulled on demand via `/dovetail-sync` (not auto-checked, to save tokens).
