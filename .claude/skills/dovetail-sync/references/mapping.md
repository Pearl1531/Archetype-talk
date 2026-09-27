# Dovetail → our schema — mapping reference

How Dovetail entities become files in our graph. Our types are canonical; Dovetail fills them, never reshapes them.

## Entity mapping

| Dovetail | → our type | Rationale |
|----------|-----------|-----------|
| **Data entry** (interview note, transcript, document) | `Transcripts/<id-title>.md` | The raw research artifact. Keep it as source; add anchors where you extract highlights. |
| **Highlight** (tagged snippet / quote from data) | `Signals/<title>.md` | One observation + verbatim quote + date. Links to its Transcript and up to `evidences:`. |
| **Insight** (synthesized theme, quantified finding) | `Evidence/<title>.md` **or** a Persona **Correlation** | If it states a measured/aggregated fact → Evidence. If it's a cross-signal synthesis → propose a Correlation on the relevant Persona. When unsure, ask. |
| **Project** | organizational scope | Maps to a research project / persona scope — not a file. Use it to pick what to sync. |
| **Tags / channel themes** | `tags:` on the mapped file | Reuse as tags; don't create a new type. |

## Provenance frontmatter (add to every imported file)

```yaml
source: dovetail
dovetail_id: <stable id from the API>
dovetail_url: <deep link to the item, if available>
imported: YYYY-MM-DD      # sync date
```

- On **Evidence**, `imported:` doubles as the `retrieved:` date for the 3-month freshness rule.
- On **Signals**, keep the real research date in `## Interview date` (from the Dovetail item), not the import date.

## Fidelity rules

- **Quotes verbatim.** Copy the highlight text exactly into the Signal's `>` blockquote. Never paraphrase.
- **Dates from Dovetail.** Use the item's real timestamp; don't invent.
- **Thin in, thin out.** If a highlight has no quote, import it without one — don't embellish.
- **One highlight = one Signal.** Don't merge; contradictions become two Signals.

## Wiring after import

1. Signal → link its **Transcript** (`## Transcript`) and any supporting **Evidence** (`evidences:`).
2. New Evidence → surface on the relevant **Persona** (`## Evidences`) with a one-line what-it-confirms.
3. Insight-as-Correlation → add to the Persona's `## Correlations` with links to the supporting Signals/Evidence.
4. Keep links **URL-encoded** (space `%20`, apostrophe `%27`).

## Dedupe & re-sync

- Match by `dovetail_id`. If a file with that id exists → update content/quote/date in place; keep our structure.
- Never create a second file for the same Dovetail item.
- If the user hand-edited an imported file, show a diff before overwriting and let them keep local changes.

## Freshness & gaps

- After sync, compare item dates with today. Older than **3 months** → flag `🕒` and suggest a refresh round.
- Anything the user asks that Dovetail doesn't cover → add a question to `Research backlog.md` (never fabricate an answer).
