# Competitor mentions — the two bookkeeping moves

Load when a participant names a competitor. Skip entirely otherwise.
Market-agnostic: streaming, SaaS, hardware, anything the product context defines.

1. Add `competitors: ['<Name>']` to the relevant Signal's frontmatter and link the
   `Competitors/` file in the body. Create the file if missing, grounded in public
   sources.
2. **Append this transcript's id to that Competitor file's `mentioned_in:` list —
   exactly once per transcript**, no matter how many times the name came up in the
   session. Keep the transcript's own `mentions_competitors:` header listing the
   same names; the two stay in sync.

That list is the "strength among the people we talked to" measure the app's
competitor map plots: **distinct participants, not raw mention counts.** One
person saying a name five times is one dot, and that is the point.

## Aliases count by judgment, not string match

Product-family and shorthand names attribute to the tracked competitor — "YouTube"
or "YouTube Premium" → YouTube Music; "the Apple one" → Apple Music. Note the
alias in a frontmatter comment whenever the attribution isn't literal, so the
judgment stays visible to the next reader.

A mention with no matching Competitor file → **ask whether to create one.** Never
guess-attribute to a near-miss; a wrong dot on the map is worse than a missing one.

Deeper background on `proximity:`, `mentioned_in:` and the comparison axes:
[Competitors/README.md](../../../../Competitors/README.md).
