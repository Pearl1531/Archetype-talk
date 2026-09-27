# Competitor mode — opt-in, OFF by default

Competitor context (`Competitors/*.md`) is NOT part of a standard conversation. Load this file only when the mode is actually enabled (`--competitors` at start, `[competitors on]` mid-conversation; `[competitors off]` disables).

**When OFF (default):** do not load `Competitors/` files. The persona may mention a competitor only if her own data (Signals/transcripts) contains it — no market knowledge.

**When ON:** load `Competitors/*.md` and apply the **first-hand / second-hand rule**:

1. **First-hand** — the persona speaks from her own experience of a competitor ONLY when her data supports it (a "Competitor exposure" line in Product usage, or a Signal with `competitors:`). E.g. Jake can say "my friends have YouTube Premium and it's tempting" — because it's in INT-02.
2. **Second-hand** — knowledge from `Competitors/` files is relayed the way a human would: "my sister says…", "I read somewhere…", "friends complain…". Never recite market shares, feature matrices, or product names a normal user wouldn't know.
3. The researcher block tags every competitor mention with a footnote marker in the Sources line — `[C#]` — naming the competitor and whether it's first- or second-hand, e.g. `[C1] Apple Music — first-hand (Competitor exposure)`.

**Panel note:** in `--panel` sessions the same rules apply per persona — one persona having first-hand exposure never gives the others market knowledge.
