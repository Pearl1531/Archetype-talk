# Recording a stance toward a feature

Load when a participant said or did something that shows where they stand on a
specific feature. Skip when the session produced only pains and behaviours with no
attitude attached — most signals carry no stance, and that is fine.

Schema and the full ladder: `Signals/_template.md`.

## The one rule that matters

**A stance is an observable, not a reading.** Every label below names something the
participant *said* or *did* that another researcher could find in the transcript.
If you cannot point at the line that justifies it, there is no stance.

| Stance | What must be in the transcript |
|---|---|
| `dealbreaker` | they said they would leave, cancel, or stop using over it |
| `resents` | they returned to it unprompted, with anger |
| `frustrated` | it annoys them and they carry on using it |
| `wary` | they assume up front it won't work for them |
| `indifferent` | **asked**, and demonstrably didn't care |
| `unaware` | they had never encountered it |
| `curious` | interested, hasn't used it |
| `appreciates` | likes it, wouldn't fight for it |
| `relies_on` | part of the routine; they'd notice it gone |
| `advocates` | recommends it without being prompted |
| `mixed` | strong both ways about the same feature |

Write the justification into `because:` in the participant's own terms — the
observable, not your interpretation of it. "Said he'd go back to Apple Music if it
kept failing" is a justification. "Seemed unhappy" is not.

## `unprompted:` — who put the topic on the table

Read it off the transcript's `**M:**` / `**P:**` turns. **Did the participant name
this feature before the moderator did?** That is the whole test, and it is usually
mechanical rather than a judgment call.

This is the focusing-illusion flag. Asked directly about anything, people overweight
it — Kahneman's "nothing in life is as important as you think it is while you are
thinking about it". A stance the moderator elicited is real data, but its *intensity*
is partly an artefact of having been asked; a stance the participant volunteered had
to win the competition for their attention first, which makes it the stronger signal
about what actually matters to them day to day.

Two things it is **not**:

- **Not a quality score.** A prompted stance is not weak data. It answers "how do
  they feel about X" perfectly well; it just cannot also answer "does X matter to
  them", because the question supplied the salience.
- **Not about the attitude, only the topic.** Participants routinely volunteer a much
  stronger statement inside an answer to a mild question — asked "do you pay for
  Premium?", Jake answered with a churn threat nobody asked for. The topic was
  prompted (`unprompted: false`); the escalation goes in `because:`, where it can be
  read. Keeping the field to one meaning is what makes it usable at all.

Can't tell who raised it — a cleaned-up transcript with no speaker turns, a session
you weren't given in full — leave the field out. Absent means unknown, and a wrong
value here quietly mis-weights every conclusion downstream.

## Propose, never set silently

Same flow as `special_category`: show the user the stance you would record, the
feature it attaches to, and the line it rests on. They confirm. This is not
bureaucracy — sentiment is the single easiest thing in this repo to hallucinate,
because a plausible-sounding stance reads exactly like an observed one.

## The four ways to get this wrong

**Irony and sarcasm.** The known failure mode of every sentiment system: "oh
great, another mix I didn't ask for" is not appreciation. When tone is ambiguous
and the words alone don't settle it, **leave the field out** and add a question to
`Research backlog.md` instead. An empty field costs nothing; a wrong stance
propagates into the persona, the panel and the roadmap.

**Treating absence as neutral.** No stance means not observed. Never write a
middle value to fill the gap, and never let a persona's aggregate imply that an
unmentioned feature was met with a shrug.

**`unaware` filed as a finding.** It says something about our coverage, not about
the person. It goes to `Research backlog.md` as "nobody we spoke to had met X",
not into the persona's stances.

**Averaging.** Two participants who disagree produce two signals with two stances,
and the persona shows both. Never reconcile them into one value, never convert the
ladder to numbers to compute a middle. The ladder is ordered for reading, not for
arithmetic — a split is a finding, and `/contradictions` is built to surface it.

## Where it lands afterwards

- The **Signal** holds the fact — one participant, one feature, one stance.
- The **Persona**'s `## Stances by feature` aggregates her linked signals and shows
  splits explicitly. An `indifferent` stance also belongs in `Doesn't care about`
  with her own wording, which is more expressive than the label.

  **Aggregate only the Signals the persona file itself links to** — not everything
  reachable through her archetypes. An archetype links signals from *other people's*
  sessions, because that is what a pattern is; pulling those into her stance list
  would put another participant's words in her mouth. They colour the pattern, and
  the pattern speaks through the archetype's own gated stances, not through her.
- An **Archetype** may carry a pattern-level stance under `## Stances by feature`,
  tagged `[Context]` so it surfaces only on-topic, `assumption` unless a Signal
  backs it. `Resists agreeing about` is that same idea in its oldest form.
