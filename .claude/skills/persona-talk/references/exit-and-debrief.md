# Full debrief and exiting character

Read when a reply escalates to the full tier, or on `[exit]` / `[step out]` / session end. Every fixed phrase here is a shape to fill in the conversation's language.

## Contents
- Full debrief — the five parts
- Exit — what to collect, what to offer, what never to write

## Full debrief — the five parts

1. **What the data says** — the claim and what backs it, by marker.
2. **Scale of the problem** — how many sources, which segments, how fresh.
3. **Why it matters for the product** — the decision it touches.
4. **The emerging need** — numbered; each with an "if not" (what happens if nobody solves it) and the matching `Ideas/` file by name when one exists.
5. **Questions to dig into** — what real research should ask next.

Then a **Sources** list:

```
[S1] Signal: <name> — Interview <id>, Mon Year
[E1] Evidence: <name> — <publication>, retrieved YYYY-MM-DD
```

A reply that **contradicts** existing data always gets the full tier and opens with *"⚠️ Note: this reply diverges from [S1]"*. In panel mode, part 1 covers the split between personas explicitly.

## Exit

`[exit]` / `[step out]` pauses the roleplay for meta talk; `[back in]` returns. On `[exit]` or at session end:

1. **Collect** every **Questions to dig into** from this session (either tier) + every **Known unknown** the conversation hit.
2. **Blind spot (optional, at most one):** a question *nobody* (researcher or data) raised that this session's trajectory quietly suggests matters. Label it **"Blind spot (not raised this session)"**. Most sessions won't have one — never force it.
3. **Offer** to append everything to **`Research backlog.md`** (Open questions table; a blind spot gets `Source/level: blind spot — AI-inferred, not raised`). **Every row gets a `Priority`** — `critical` / `major` / `minor`, the bare word, per the ladder in `.claude/skills/backlog/SKILL.md`: what blocks a decision, what shapes the work, what is only worth asking while someone is already in the room. Say the priority out loud when offering the rows, so it is corrected in conversation rather than discovered later. A row already carrying `(locked)` (e.g. `critical (locked)`) is the researcher's own call: leave it exactly as it is.
4. **Hypothesis (optional):** if the discussion — especially the researcher's own questions — crystallized a testable bet, offer to save it as a `Hypotheses/` entry: IF/BY/WILL/BECAUSE per `Hypotheses/_template.md` plus, when one comes naturally, a **We're wrong if:** line (the argument against it: what result would show it is wrong — the user approves it with the rest), `feature:` tag, `created:` today, `status: open`, `source:` naming this session, `author: 'AI (Claude) — approved by <user name>'` (never a raw email). **Only with the user's explicit yes, at most 1–2 per session, always framed as an L1 assumption** ("a bet to test", never "a finding"). Backlog rows are questions to ask; hypotheses are statements to verify — never file the same thought as both.
5. **Never write `Signals/` or `Evidence/`.** A persona conversation produces questions for real research and, with approval, L1 hypotheses — nothing else. A Signal exists only after a real interview or test (→ `/extract-findings`).
6. **After a `demo: true` session only, once ever:** if `.claude/demo-decision.local` does not exist, ask what to do with the example data so it never gets mistaken for real research later — **keep as is** (the `demo: true` badges already mark it), **separate** (move it all under `Demo/`), or **delete**. Route the choice to `/demo-data`, which records the decision. One question, at the natural end of the session — never mid-conversation.

Panel sessions add: summarize the disagreements observed, which are backed by data (cite per persona) and which are gaps worth testing; the backlog's persona column names the relevant persona(s).
