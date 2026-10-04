/* ---------- Overview dashboard ----------
   A snapshot of what's actually in the graph right now — counts, freshness,
   research cadence and grounding health. Strictly read-only: it never creates
   data, it points at the next research round and hands you a prompt / brief to
   run it. Same full-screen pattern as Settings / Help / Mind Map, and it only
   ever reads the current workspace via wsEntities(). */
let DASHBOARD_ACTIVE = false;
const dashBtn = document.getElementById('dashBtn');
const DASH_MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DASH_MON_PL = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
function dashMon(i){ return (LANG==='pl' ? DASH_MON_PL : DASH_MON)[i]; }
function dashFmtDate(d){ return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear(); }

function dashStats(){
  const ents = wsEntities();
  const by = t => ents.filter(e=>e.type===t);
  const transcripts = by('Transcript');
  const active = transcripts.filter(e=>!isExcluded(e));
  const fresh = active.filter(e=>{ const d=transcriptAgeDays(e); return d!==null && d<=92; });
  const dates = active.map(e=>parseAnyDate(e.fm.date)).filter(Boolean).sort((a,b)=>a-b);
  const openHypos = by('Hypothesis').filter(e=> String(e.fm.status||'').toLowerCase()!=='promoted');
  // desk-research staleness: Evidence + researched competitors verified >3 months
  // ago (or never dated), plus competitors still waiting for their first research
  const ageDays = v => { const d = parseAnyDate(v); return d ? Math.floor((graphNow()-d.getTime())/86400000) : null; };
  const desk = ents.filter(e=> e.type==='Evidence' || (e.type==='Competitor' && String(e.fm.needs_research)!=='true'));
  const staleDesk = desk.filter(e=>{ const a = ageDays(e.fm.retrieved || e.fm.updated || e.fm.date); return a===null || a>92; }).length;
  const needsRes = by('Competitor').filter(e=> String(e.fm.needs_research)==='true').length;
  return {
    personas: by('Persona').length, archetypes: by('Archetype').length,
    signals: by('Signal').length, evidence: by('Evidence').length,
    hypotheses: by('Hypothesis').length, openHypos,
    ideas: by('IdeaForImprovement').length, competitors: by('Competitor').length,
    transcripts: active.length, transcriptsAll: transcripts.length,
    excluded: transcripts.length - active.length,
    fresh: fresh.length, stale: active.length - fresh.length,
    participants: distinctParticipants(), dates,
    deskTotal: desk.length, staleDesk, needsRes,
  };
}

/* ---------- where the data disagrees ----------
   The same rule graph_lint applies: on one feature, some participants stand
   against it and some for it. Contradictions are data — this card does not
   average them, it puts both sides next to each other and links every Signal. */
const DASH_NEG = ['dealbreaker','resents','frustrated','wary'];
const DASH_POS = ['curious','appreciates','relies_on','relies on','advocates'];
function dashSplits(){
  const by = {};
  wsEntities().filter(e=>e.type==='Signal' && e.fm.sentiment && typeof e.fm.sentiment==='object').forEach(e=>{
    const f = String(e.fm.sentiment.feature||'').trim(), st = String(e.fm.sentiment.stance||'').trim().toLowerCase();
    if(!f) return; (by[f] = by[f] || {neg:[], pos:[]});
    if(DASH_NEG.includes(st)) by[f].neg.push(e); else if(DASH_POS.includes(st)) by[f].pos.push(e);
  });
  return Object.entries(by).filter(([,v])=> v.neg.length && v.pos.length)
    .sort((a,b)=> (b[1].neg.length+b[1].pos.length)-(a[1].neg.length+a[1].pos.length));
}

/* ---------- empty states, with the way out ----------
   An empty box that only says "nothing here" leaves you exactly where you
   were. Every one on this page names the state AND the single next move —
   and the two states are genuinely different: no transcripts at all (put one
   in Inbox/) vs. transcripts that are all switched off (flip them back on). */
function dashWayOut(s){
  return s.excluded
    ? trn(s.excluded,
        'All {n} transcript here is excluded from analysis — open it and turn on “Use in analysis” to count it.',
        'All {n} transcripts here are excluded from analysis — open one and turn on “Use in analysis” to count it.',
        'Wszystkie transkrypcje ({n}) są tu wyłączone z analizy — otwórz ją i włącz „Używaj w analizie”, żeby ją liczyć.',
        'Wszystkie transkrypcje ({n}) są tu wyłączone z analizy — otwórz jedną i włącz „Używaj w analizie”, żeby ją liczyć.',
        'Wszystkie transkrypcje ({n}) są tu wyłączone z analizy — otwórz jedną i włącz „Używaj w analizie”, żeby ją liczyć.')
    : tr('Put your first transcript in the Inbox/ folder, then run /extract-findings with your AI.');
}

/* the prompt the user pastes into Claude Code (our AI) to plan the next round.
   Built from live counts + open hypotheses; it tells the AI to read the backlog
   and either plan a round or, if the backlog is empty, write an agency brief. */
function dashPromptText(s){
  const proj = (typeof projectDisplayName==='function' ? projectDisplayName() : '').trim();
  const last = s.dates.length ? dashFmtDate(s.dates[s.dates.length-1]) : '—';
  const ago = s.dates.length ? Math.floor((graphNow()-s.dates[s.dates.length-1])/86400000)+' days ago' : 'no dated interviews';
  const hy = s.openHypos.length ? s.openHypos.map(e=>'- '+e.title).join('\n') : '- (none on file yet)';
  return `You are helping plan the next qualitative research round for the Archetype Talk research graph${proj?` (project: ${proj})`:''}.

CURRENT STATE OF THE SYSTEM (project workspace)
- Personas: ${s.personas}  (Archetypes: ${s.archetypes})
- Participants heard from: ${s.participants}
- Transcripts: ${s.transcripts} in analysis — ${s.fresh} fresh (<=3 months), ${s.stale} stale (>3 months)${s.excluded?`\n- Excluded from analysis (excluded: true, researcher decision): ${s.excluded} — these are on disk but count toward nothing above`:''}
- Signals (our own observations): ${s.signals}    Evidence (desk research): ${s.evidence}
- Open hypotheses (untested bets): ${s.openHypos.length}
- Ideas (already grounded): ${s.ideas}
- Last interview: ${last} (${ago})

OPEN HYPOTHESES TO VERIFY
${hy}

YOUR TASK
1. Read \`Research backlog.md\` and every file in \`Hypotheses/\`.
2. IF the backlog has open questions: produce a prioritized plan for the next round — which questions to answer first and why (tie each to the thin personas / open hypotheses above), the method (interview or usability test), who to recruit and how many, and a discussion-guide outline. Prefer the \`/interview-guide\` skill.
3. IF the backlog is empty: instead write a RESEARCH BRIEF an external agency could run to feed the system with fresh interviews — background, objectives, target audience + screener, method, number of sessions, the key questions, and the deliverable (verbatim transcripts we can import with \`/extract-findings\`).

Stay grounded: this plan only defines what to ASK. Never invent findings, quotes or numbers.`+promptLang();
}

/* the desk-research refresh prompt — pasted into Claude Code to bring the
   Evidence/Competitor layer up to date with the internet. Deliberately strict:
   web finds are Evidence-grade only, and nothing is written without approval. */
function dashEnrichText(s){
  const proj = (typeof projectDisplayName==='function' ? projectDisplayName() : '').trim();
  return `You are working inside the Archetype Talk research repo${proj?` (project: ${proj})`:''} — you have direct file access. Task: bring the DESK-RESEARCH layer up to date with current public data from the internet. Interview data (Transcripts/, Signals/) is out of scope — never touch it.

CURRENT STATE (project workspace)
- Evidence + researched competitors on file: ${s.deskTotal} — ${s.staleDesk} verified over 3 months ago (or undated)
- Competitors still awaiting first desk research (needs_research): ${s.needsRes}
- Signals ${s.signals} · Evidence ${s.evidence} · Competitors ${s.competitors}

GROUND RULES (per CLAUDE.md — do not break)
- Web findings are Evidence-grade only: each claim needs a public, linkable source and a retrieved: date. NEVER file a web find as a Signal.
- Never invent quotes, statistics, dates or sources. A claim you cannot verify at its original source stays out — an honest gap beats a guess.
- Skip every file marked demo: true.
- Propose before writing: list the updates you intend to make and wait for my approval.

FIRST ask me one question: what lookback window should the research use — 1, 2 or 3 years back from today? Only cite sources published inside it.

THEN sweep and report before researching anything:
1. Evidence/ — files whose retrieved:/updated: date is over 3 months old or missing: re-verify each at its original source; say what changed, what still holds, what is dead.
2. Competitors/ — (a) files with needs_research: true → initial desk research per the template (Market position / Features / Comparison / User voices / Sources); (b) stale retrieved: dates → refresh pricing and features from official pages; (c) gaps in each ## Comparison table vs compare_categories in Product Context.md → close them with verifiable sources, otherwise leave the row out.
3. Research backlog.md — flag open questions desk research can answer, and answer those; interview questions stay for real users.

DELIVER: updated files with fresh citations and retrieved: set to today, plus a short list of what could NOT be verified. Offer a local commit at the end; do not push.`+promptLang();
}

/* a ready-to-send agency brief (.md) — the fallback when there's no backlog yet
   but we still want to commission fresh interviews. */
function dashBriefText(s){
  const proj = (typeof projectDisplayName==='function' ? projectDisplayName() : '').trim() || '[your product]';
  const today = new Date().toISOString().slice(0,10);
  const hy = s.openHypos.length ? s.openHypos.map(e=>'- '+e.title).join('\n') : '- (fill from Research backlog.md — currently none on file)';
  return `# Research brief — next qualitative round
_Generated from Archetype Talk on ${today}. Review and edit before sending to an agency._

## Background
${proj} maintains a research knowledge graph with ${s.personas} persona${s.personas===1?'':'s'} built from ${s.transcripts} interview${s.transcripts===1?'':'s'}. ${s.stale} of them ${s.stale===1?'is':'are'} older than 3 months, so our personas are answering from history rather than current users. We need a fresh round.

## Objectives
Refresh and extend our understanding of the personas below, and put our open bets to the test.

## Open questions / hypotheses to test
${hy}

## Audience & screener
- Segments: our existing personas (${s.personas}). Recruit users matching their contexts.
- Screen out anyone we interviewed in the last 3 months.

## Method
- Moderated interviews, 45-60 min, remote.
- Suggested sample: 5-8 per key segment (qualitative saturation, not statistical power).

## Key topics
- Derive from the open questions above and \`Research backlog.md\`.

## Deliverables
- Verbatim transcripts, one file per session, so we can import them and turn them into Signals via \`/extract-findings\`.
- No interpretation needed from the agency — we ground findings ourselves.

## Snapshot at time of brief
Personas ${s.personas} - Signals ${s.signals} - Evidence ${s.evidence} - Open hypotheses ${s.openHypos.length} - Ideas ${s.ideas} - Fresh transcripts ${s.fresh}/${s.transcripts}
`+promptLang();
}

function dashDownload(name, text){
  const blob = new Blob([text], {type:'text/markdown;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 5000);
}
function dashCopy(text, okMsg, fname){
  const fn = fname || 'research-plan-prompt.md';
  const done = ()=> toast(okMsg||tr('Copied to clipboard ✓'));
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done, ()=>{ dashDownload(fn, text); toast(tr('Clipboard blocked — downloaded the prompt instead')); }); return; }
  }catch(e){}
  dashDownload(fn, text); toast(tr('Downloaded the prompt (clipboard unavailable)'));
}

/* ---------- what each persona actually stands on ----------
/* ---------- what each persona actually stands on ----------
   "Thinnest persona: Tom" told you who was weakest and nothing about why. The
   same traversal, drawn per persona, answers both at once: how many Signals
   (heard) and how much Evidence (read) are wired to her, and — through her
   Signals — how many real people she rests on. First-degree links only; the
   participant count walks one hop further, Signal → Transcript, and folds
   repeat sessions with the same person via participantGroupId. */
function dashPersonaGrounding(){
  const ents = wsEntities();
  const personas = ents.filter(e=> e.type==='Persona');
  if(!personas.length) return [];
  const byId = {}; ents.forEach(e=> byId[e.id] = e);
  const adj = {};
  graphPairs(ents).forEach(([a,b])=>{ (adj[a]=adj[a]||[]).push(b); (adj[b]=adj[b]||[]).push(a); });
  return personas.map(p=>{
    const nb = (adj[p.id]||[]).map(id=> byId[id]).filter(Boolean);
    const sig = nb.filter(e=> e.type==='Signal');
    const ev  = nb.filter(e=> e.type==='Evidence').length;
    const people = new Set();
    sig.forEach(s=> (adj[s.id]||[]).forEach(id=>{
      const t = byId[id];
      if(t && t.type==='Transcript' && !isExcluded(t)) people.add(participantGroupId(t));
    }));
    return { id: p.id, name: p.title.split(/\s+[—–-]\s+/)[0].trim(),
             sig: sig.length, ev, people: people.size, total: sig.length + ev };
  }).sort((a,b)=> a.total - b.total);          // thinnest first — that is the one to read
}

/* ---------- coverage, on the only curve that fits qualitative work ----------
   A margin of error would be the wrong maths here: five interviews cannot
   carry a percentage, and pretending otherwise is exactly the inflation this
   app exists to prevent. What IS defensible is the discovery curve behind the
   "five users" rule of thumb — Nielsen & Landauer (1993), replicated by
   Faulkner (2003): with L≈0.31 detected per participant, n sessions in ONE
   homogeneous segment surface 1−(1−L)^n of the patterns that repeat there.
   It answers "have we heard enough people?" and stays silent about "how
   many users have this problem?", which is a survey question — and a survey
   answer is Evidence, never a Signal. */
const DASH_L = 0.31;
function dashSaturation(n){ return n > 0 ? 1 - Math.pow(1 - DASH_L, n) : 0; }
function dashCoverage(rows, participants){
  const personas = rows.length;
  const min = personas ? Math.min(...rows.map(r=> r.people)) : 0;
  const thin = rows.filter(r=> r.people === min).map(r=> r.name);
  const pct = Math.round(dashSaturation(min) * 100);
  let head, note;
  if(!personas)      { head = 'No personas yet';        note = 'Nothing to cover yet — a persona is what turns sessions into someone you can talk to.'; }
  else if(min === 0) { head = 'A persona with nobody behind it'; note = 'Nothing links <b>{who}</b> to a single session — an assumption wearing a face. Wire those Signals to their transcripts, or run the round that gives them some.'; }
  else if(min < 3)   { head = 'Below the qualitative floor'; note = 'Thinnest: <b>{who}</b>, standing on {n} → around {p}% of what repeats in that segment would have surfaced. Five people per segment is the usual floor, where the curve reaches ~84%.'; }
  else if(min < 5)   { head = 'Nearly at the floor';    note = 'Thinnest: <b>{who}</b>, standing on {n} → about {p}% of the recurring patterns there. One or two more sessions and you are at the ~84% that five buys you.'; }
  else if(min < 8)   { head = 'At the qualitative threshold'; note = 'Every persona rests on at least {n} (thinnest: <b>{who}</b>) → ~{p}% of what recurs in a segment. This tells you WHAT people struggle with and WHY — never how many of them do; that needs a sized survey or analytics, and lands as Evidence.'; }
  else               { head = 'Saturated';              note = 'Even the thinnest (<b>{who}</b>) has {n} behind it → ~{p}%. New sessions there rarely turn up a new pattern; the open question is how widespread each one is — a survey, not another interview.'; }
  /* every note phrases this as "standing on {n}" / "stoi na {n}", so the Polish
     forms are locative — nominative here reads as broken grammar */
  const nPeople = trn(min, '{n} person', '{n} people', '{n} osobie', '{n} osobach', '{n} osobach');
  return { pct, head, min,
    note: tr(note).split('{who}').join(esc(thin.slice(0,2).join(', '))).split('{n}').join(nPeople).split('{p}').join(pct),
    value: trn(participants, '{n} person', '{n} people', '{n} osoba', '{n} osoby', '{n} osób')
         + ' · ' + trn(personas, '{n} persona', '{n} personas', '{n} persona', '{n} persony', '{n} person') };
}

/* ---------- signals vs evidence, as one bar ----------
   Two counts side by side ("24 : 17") read as a score nobody knows how to
/* ---------- signals vs evidence, as one bar ----------
   Two counts side by side ("24 : 17") read as a score nobody knows how to
   win. The same two numbers as one bar answer the question people actually
   have: how much of this graph is ours? Ember is what we heard ourselves,
   grey is what we read — and the line underneath says what to do about the
   split, because a ratio without a recommendation is just decoration. */
function dashMixVerdict(sig, ev){
  const tot = sig + ev;
  if(!tot) return { pct: 0, head: 'Nothing to weigh yet',
    note: 'No signals, no evidence. Both start the same way: a real session (→ Signals) or a piece of desk research (→ Evidence).' };
  const pct = Math.round(sig / tot * 100);
  if(pct < 40) return { pct, head: 'Desk research is carrying this graph',
    note: 'Most of what your personas say rests on other people’s data. That is a fine start and a poor foundation — nobody has verified any of it with your users. Run a round of your own sessions before the next product decision.' };
  if(pct > 80) return { pct, head: 'Almost everything is firsthand',
    note: 'Strong grounding — every claim traces to someone you actually spoke to. A little desk research would now tell you whether what you heard is typical or particular to your sample.' };
  return { pct, head: 'Your own sessions are leading',
    note: 'The healthy shape: what you heard yourself carries the graph, and desk research backs it up instead of standing in for it.' };
}

/* ---------- Overview, Editorial (2026-10) ----------
   One rule shapes this page: the screen carries numbers and actions, the
   explanations wait behind an ⓘ. A newcomer gets an onboarding later; a
   returning researcher gets a page they can read in one look. Every number
   is the same one the rest of the app computes (dashStats, the persona
   grounding walk, the discovery curve, the backlog file) — nothing new is
   estimated here. */
const DX_INFO = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
const DX_CARET = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
let DX_TIP = 0;
/* ⓘ + a popover that opens on hover and on keyboard focus (CSS :hover /
   :focus-within) — `body` is trusted HTML built here, never file content */
function dxTip(title, body, side){
  const id = 'dxt' + (++DX_TIP);
  return `<span class="dx-tip${side==='right'?' dx-tip-r':''}"><button type="button" class="dx-tip-btn" aria-label="${esc(title)}" aria-describedby="${id}">${DX_INFO}</button><span role="tooltip" id="${id}" class="dx-tip-pop"><b>${esc(title)}</b>${body}</span></span>`;
}
function dxBars(n, of){
  return `<span class="dx-lvl" aria-hidden="true">${Array.from({length:of},(_,i)=>`<i class="${i<n?(i===of-1?'on hot':'on'):''}"></i>`).join('')}</span>`;
}
function dxPortrait(e, cls){
  const pic = picFor(e);
  const first = e.title.split(/\s+[—–-]\s+/)[0].trim();
  return pic && pic.src
    ? `<span class="${cls}"><img src="${esc(pic.src)}" alt=""></span>`
    : `<span class="${cls} dx-noimg">${esc((first[0]||'?').toUpperCase())}</span>`;
}
function dxBacklogTop(){
  const raw = backlogRaw(); if(!raw) return [];
  const sec = parseBacklog(raw).open;
  if(!sec || !sec.table) return [];
  const h = sec.table.header.map(x=> x.toLowerCase());
  const qi = h.findIndex(x=> /question|pytanie/.test(x)), pi = h.findIndex(x=> /persona/.test(x));
  return sec.table.rows.map(r=>({ q: r[qi>=0?qi:2]||'', who: (r[pi>=0?pi:1]||'').trim() }));
}
/* the sessions on one axis: days when research spans under two months, months after */
function dxSessions(){
  const ts = wsEntities().filter(e=> e.type==='Transcript').map(e=>({ e, d: parseAnyDate(e.fm.date) })).filter(x=> x.d).sort((a,b)=> a.d-b.d);
  if(!ts.length) return '';
  const day = 86400000, t0 = ts[0].d.getTime(), t1 = ts[ts.length-1].d.getTime();
  const short = t1 - t0 < 62*day;
  const a = short ? new Date(ts[0].d.getFullYear(), ts[0].d.getMonth(), 1).getTime() : t0 - 3*day;
  const b = short ? Math.max(new Date(ts[0].d.getFullYear(), ts[0].d.getMonth()+1, 0).getTime(), t1) : t1 + 3*day;
  const x = t => ((t - a) / Math.max(day, b - a) * 100).toFixed(1);
  const lift = [70, 40, 58, 28, 48, 76, 36];
  const marks = ts.map((s,i)=>{
    const ex = isExcluded(s.e), test = /test/i.test(String(s.e.fm.method||'')) || /^TEST/i.test(s.e.title);
    const who = s.e.title.replace(/^[A-Z]+-\d+\s*/,'').trim();
    const h = lift[i % lift.length];
    return `<a class="dx-ses${ex?' ex':''}${test?' test':''}" href="#${esc(s.e.id)}" style="left:${x(s.d.getTime())}%;--h:${h}px" title="${esc(s.e.title)} · ${dashFmtDate(s.d)}${ex?' · '+esc(tr('excluded from analysis')):''}">
        <i class="dx-ses-stem"></i><i class="dx-ses-dot"></i>${!test && !ex && who ? `<span class="dx-ses-lbl">${esc(who)}</span>` : ''}</a>`;
  }).join('');
  const d0 = new Date(a), d1 = new Date(b);
  const axis = short
    ? `<span>1 ${dashMon(d0.getMonth())}</span><span>10</span><span>20</span><span>${d1.getDate()} ${dashMon(d1.getMonth())}</span>`
    : `<span>${dashMon(d0.getMonth())} ${d0.getFullYear()}</span><span>${dashMon(d1.getMonth())} ${d1.getFullYear()}</span>`;
  const span = short ? `${dashMon(ts[0].d.getMonth())} ${ts[0].d.getFullYear()}` : `${dashMon(ts[0].d.getMonth())} ${ts[0].d.getFullYear()} – ${dashMon(ts[ts.length-1].d.getMonth())} ${ts[ts.length-1].d.getFullYear()}`;
  return `<div class="dx-col">
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Sessions')}</h2><span class="dx-h2note">${esc(span)}</span>${dxTip(tr('One mark per session'), esc(tr('Circle = interview, square = usability test, dashed = set aside by the researcher. Trend charts would need research that spans two months or more.')), 'right')}</div>
      <div class="dx-card dx-ses-card"><div class="dx-ses-plot" role="img" aria-label="${esc(trn(ts.length,'{n} session','{n} sessions','{n} sesja','{n} sesje','{n} sesji'))}">${marks}<div class="dx-ses-axis">${axis}</div></div></div>
    </div>`;
}

function renderDashboard(){
  DX_TIP = 0;
  const s = dashStats();
  pageTitle.textContent = tr('Overview');
  pageSub.textContent = '';
  grid.className = 'dash-wrap dx';
  const demo = WS==='demo';
  const name = demo ? tr('Spotify listeners') : projectDisplayName();
  const lastAgo = s.dates.length ? Math.floor((graphNow()-s.dates[s.dates.length-1])/86400000) : null;
  const pg = dashPersonaGrounding();
  const pgBy = {}; pg.forEach(r=> pgBy[r.id] = r);
  const cov = dashCoverage(pg, s.participants);
  const mix = dashMixVerdict(s.signals, s.evidence);
  const freshPct = s.transcripts ? Math.round(s.fresh/s.transcripts*100) : 0;
  const personas = wsEntities().filter(e=> e.type==='Persona')
    .sort((a,b)=> (/primary/i.test(b.fm.category||'') - /primary/i.test(a.fm.category||'')) || a.title.localeCompare(b.title));
  const firstName = e => e.title.split(/\s+[—–-]\s+/)[0].trim();
  const open = dxBacklogTop();
  const asOf = demo ? tr('as of {d}').replace('{d}', DEMO_AS_OF.toLocaleDateString(LANG==='pl'?'pl-PL':'en-GB',{day:'numeric',month:'short',year:'numeric'})) : tr('right now');

  /* hero: the project is the headline, its people beside it */
  const cast = personas.slice(0,4).map((e,i)=> `<a class="dx-cast-${i}" href="#${esc(e.id)}" aria-label="${esc(firstName(e))}">${dxPortrait(e, 'dx-face')}</a>`).join('');
  const askMenu = personas.map(e=> `<a role="menuitem" href="#${esc(e.id)}">${dxPortrait(e,'dx-face-xs')}<span>${esc(firstName(e))}</span></a>`).join('');
  const hero = `<section class="dx-hero">
      <div class="dx-hero-main">
        <div class="dx-kicker"><b>${tr('Overview')}</b><span aria-hidden="true">·</span><span>${esc(asOf)}</span>${demo ? `<span class="dx-chip">${tr('Example data')}${dxTip(tr('This is the example project'), esc(tr('Illustrative research on Spotify listeners, not your users. The numbers are read as of the day its research closed, and it never mixes with your own projects.')))}</span>` : ''}</div>
        <h1 class="dx-title">${esc(name)}<span class="dx-dot">.</span></h1>
        <div class="dx-actions">
          <button type="button" class="dx-btn dx-btn-ember" id="dashPlan">${tr('Plan the next round')}</button>
          ${personas.length ? `<div class="dx-menu-wrap"><button type="button" class="dx-btn dx-btn-line" id="dxAsk" aria-haspopup="menu" aria-expanded="false">${TALK_ICO}${tr('Ask a persona')}${DX_CARET}</button><div class="dx-menu" id="dxAskMenu" role="menu" hidden>${askMenu}</div></div>` : ''}
        </div>
      </div>
      ${cast ? `<div class="dx-cast" aria-label="${esc(tr('Personas'))}">${cast}</div>` : ''}
    </section>`;

  /* four numbers, explanations behind ⓘ */
  const sources = s.signals + s.evidence;
  const facts = `<section class="dx-facts">
      <div><span class="dx-fl">${tr('Interviews')}${dxTip(tr('Interviews and tests'), esc(trn(s.participants,'{n} person behind them','{n} people behind them','{n} osoba za nimi','{n} osoby za nimi','{n} osób za nimi')) + (s.excluded ? '. '+esc(trn(s.excluded,'{n} more is set aside by the researcher: on disk, counted nowhere.','{n} more are set aside by the researcher: on disk, counted nowhere.','{n} kolejna jest odłożona przez badacza: na dysku, nigdzie nie liczona.','{n} kolejne są odłożone przez badacza: na dysku, nigdzie nie liczone.','{n} kolejnych jest odłożonych przez badacza: na dysku, nigdzie nie liczonych.')) : ''))}</span>
        <b class="dx-big">${s.transcripts}</b><span class="dx-fs">${esc(trn(s.participants,'{n} person','{n} people','{n} osoba','{n} osoby','{n} osób'))}</span></div>
      <div><span class="dx-fl">${tr('Sources')}${dxTip(tr('Heard {h} · Read {r}').replace('{h}', s.signals).replace('{r}', s.evidence), esc(tr('Solid = heard in your own sessions (signals). Striped = read in published research or data (evidence).')))}</span>
        <b class="dx-big">${sources}</b><span class="dx-split" aria-label="${esc(s.signals+' '+tr('Signals')+', '+s.evidence+' '+tr('Evidence'))}"><i style="flex:${s.signals||0} 1 0"></i><i class="ev" style="flex:${s.evidence||0} 1 0"></i></span></div>
      <div><span class="dx-fl">${tr('Fresh')}${dxTip(tr('Freshness'), esc(tr('Transcripts younger than 3 months. Past that line, findings get flagged for a re-check before a decision leans on them.')))}</span>
        <b class="dx-big">${s.transcripts ? `${s.fresh}<span class="dx-of">/${s.transcripts}</span>` : '—'}</b><span class="dx-fs ${freshPct===100?'ok':''}">${s.transcripts ? tr(freshPct===100 ? 'All current' : freshPct===0 ? 'Everything is out of date' : 'Mostly current') : esc(tr('none yet'))}</span></div>
      <div><span class="dx-fl">${tr('Open questions')}${dxTip(tr('Open questions'), esc(tr('Things a persona answered with “I don’t know”. They go to real interviews, never to the AI.')), 'right')}</span>
        <b class="dx-big">${open.length}</b><a class="dx-fs dx-link" href="#backlog">${tr('See all')} →</a></div>
    </section>`;

  /* personas: face, one line, how solid, ask */
  const pcards = personas.map(e=>{
    const lv = personaLevel(e), r = pgBy[e.id] || {sig:0, ev:0};
    const prim = /primary/i.test(e.fm.category||'');
    return `<article class="dx-pc${prim?' prim':''}">
        <div class="dx-pc-top">${dxPortrait(e, 'dx-face-md')}${prim ? `<span class="dx-tag">${tr('Primary')}</span>` : ''}</div>
        <a class="dx-pc-name" href="#${esc(e.id)}">${esc(firstName(e))}<span class="dx-dot">.</span></a>
        <p class="dx-pc-desc" title="${esc(e.fm.description||'')}">${esc(e.fm.description||'')}</p>
        <div class="dx-pc-foot">
          <span class="dx-pc-lvl" title="${esc(tr('How solid: {l} of 5 · stands on {s} heard + {e} read').replace('{l}',lv).replace('{s}',r.sig).replace('{e}',r.ev))}">${dxBars(lv,5)}${lv}/5</span>
          <button type="button" class="dx-btn dx-btn-sm ${prim?'dx-btn-ember':'dx-btn-line'}" data-ask="${esc(e.id)}" title="${esc(tr('Copies the line that starts the conversation — paste it into {a}, opened in this project folder').replace('{a}', pjAgentLabel(pjAgent())))}">${TALK_ICO}${tr('Ask')}</button>
        </div>
      </article>`;
  }).join('');
  const personasSec = `<section class="dx-sec">
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Personas')}</h2><span class="dx-spacer"></span><button type="button" class="dx-btn dx-btn-line dx-btn-sm" id="dxAllPersonas">${tr('All personas')} →</button></div>
      ${personas.length ? `<div class="dx-pgrid">${pcards}</div>` : `<div class="dx-card dx-empty">${tr('No personas yet — nothing to weigh.')} <span class="dash-wayout">${tr('Open the Personas tab and use “New persona”, or run /persona-workshop with your AI.')}</span></div>`}
    </section>`;

  /* research health: four readings, one grammar */
  const span = 184, tick = 92;
  const ageW = lastAgo===null ? 0 : Math.min(100, lastAgo/span*100);
  const over = lastAgo!==null && lastAgo > tick;
  const tile = (label, tipTitle, tipBody, big, unit, bar, status, cls, right)=> `<div class="dx-ht ${cls||''}">
      <span class="dx-fl">${label}${dxTip(tipTitle, tipBody, right?'right':'')}</span>
      <b class="dx-mid">${big}<small>${unit}</small></b>${bar}<span class="dx-hs">${status}</span></div>`;
  const health = `<section class="dx-sec">
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Research health')}</h2>${dxTip(tr('Four readings'), esc(tr('None of them claims more precision than a handful of interviews can carry. Hover each ⓘ for what it means.')))}</div>
      <div class="dx-card dx-health">
        ${tile(tr('Firsthand'), tr('What the graph stands on'), esc(tr(mix.note)), sources ? mix.pct+'%' : '—', ' '+tr('of sources'),
          `<span class="dx-split dx-split-sm"><i style="flex:${s.signals||0} 1 0"></i><i class="ev" style="flex:${s.evidence||0} 1 0"></i></span>`, esc(tr(mix.head)))}
        ${tile(tr('Coverage'), tr('Have we heard enough people?'), cov.note, pg.length ? '~'+cov.pct+'%' : '—', ' '+tr('of patterns'),
          `<span class="dx-track"><i style="width:${cov.pct}%"></i><b style="left:84%" title="${esc(tr('five people per segment ≈ 84%'))}"></b></span>`, esc(tr(cov.head)), cov.min < 3 ? 'warn' : '')}
        ${tile(tr('Freshness'), tr('Freshness'), esc(s.transcripts ? tr('{a} of {b} transcripts are younger than 3 months. Older sessions are not wrong, they are just no longer evidence about today — flag them for a refresh before the next decision leans on them.').replace('{a}', s.fresh).replace('{b}', s.transcripts) : dashWayOut(s)),
          s.transcripts ? `${s.fresh}/${s.transcripts}` : '—', ' '+tr('current'), `<span class="dx-track ok"><i style="width:${freshPct}%"></i></span>`,
          s.transcripts ? tr(freshPct===100 ? 'All current' : freshPct===0 ? 'Everything is out of date' : freshPct < 50 ? 'More than half has aged out' : 'Mostly current') : esc(tr('No interviews on file')), freshPct===100 ? 'ok' : '')}
        ${tile(tr('Last interview'), tr('Refresh cadence'), esc(tr('The tick is the 3-month line. Past it, findings get flagged for a refresh round.')),
          lastAgo===null ? '—' : String(lastAgo), ' '+tr('days ago'), `<span class="dx-track ink"><i style="width:${ageW}%"></i><b style="left:50%"></b></span>`,
          lastAgo===null ? esc(tr('No dated interviews yet')) : esc(over ? trn(lastAgo-tick,'Overdue by {n} day','Overdue by {n} days','Spóźnione o {n} dzień','Spóźnione o {n} dni','Spóźnione o {n} dni') : trn(tick-lastAgo,'Refresh in {n} day','Refresh in {n} days','Odświeżenie za {n} dzień','Odświeżenie za {n} dni','Odświeżenie za {n} dni')), over ? 'warn' : '', true)}
      </div>
    </section>`;

  /* where the data disagrees + when you listened */
  const pairs = graphPairs(wsEntities());
  const whoHas = id => { const out = []; pairs.forEach(([a,b])=>{ const o = a===id ? b : b===id ? a : null; if(o && ENTITIES[o] && ENTITIES[o].type==='Persona') out.push(firstName(ENTITIES[o])); }); return out.join(', '); };
  const sigLink = e => `<a href="#${esc(e.id)}">${esc(e.title)}</a>${whoHas(e.id) ? ` <span class="dx-who">${esc(whoHas(e.id))}</span>` : ''}`;
  const sp = dashSplits();
  const splits = sp.length ? `<div class="dx-col">
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Where data disagrees')}</h2>${dxTip(tr('Two sides, never an average'), esc(tr('On the same feature, some participants stand against it and some for it. A split is a finding, not noise — take it to the next round, or ask your AI assistant to run /contradictions on it.')))}</div>
      <div class="dx-card"><table class="dx-table"><thead><tr><th>${tr('Feature')}</th><th><i class="dx-sw ember"></i>${tr('Against')}</th><th><i class="dx-sw"></i>${tr('For')}</th></tr></thead><tbody>
        ${sp.map(([f,v])=>`<tr><td class="dx-feat">${esc(f.charAt(0).toUpperCase()+f.slice(1))}</td><td>${v.neg.map(sigLink).join('<br>')}</td><td>${v.pos.map(sigLink).join('<br>')}</td></tr>`).join('')}
      </tbody></table></div>
    </div>` : '';
  const sessions = dxSessions();
  const pair = splits || sessions ? `<section class="dx-sec dx-pair${splits && sessions ? '' : ' one'}">${splits}${sessions}</section>` : '';

  /* open questions: the first three, the rest one click away */
  const oq = open.length ? `<section class="dx-sec">
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Open questions')}</h2>${dxTip(tr('What no persona can answer yet'), esc(tr('Asked in conversations, answered with “I don’t know”. Each one waits for a real interview.')))}<span class="dx-spacer"></span><a class="dx-btn dx-btn-line dx-btn-sm" href="#backlog">${esc(tr('All {n}').replace('{n}', open.length))} →</a></div>
      <div class="dx-card"><table class="dx-table dx-oq"><tbody>
        ${open.slice(0,3).map(r=>`<tr><td>${esc(r.q)}</td><td class="dx-oq-who">${r.who && r.who!=='—' ? r.who.split(/\s*[,/]\s*/).map(w=>`<span class="dx-pill">${esc(w)}</span>`).join(' ') : `<span class="dx-pill">${tr('everyone')}</span>`}</td></tr>`).join('')}
      </tbody></table></div>
    </section>` : '';

  /* the next round: the one dark band on the page */
  const zeroData = s.transcripts===0 && s.signals===0 && s.evidence===0;
  const head = zeroData ? tr('No research data yet — start with the founding brief.')
    : s.transcripts===0 ? tr('No interviews in the system yet')
    : s.fresh===0 ? tr('Every transcript is older than 3 months')
    : pg.length && pg.every(r=> r.people===1) ? tr('Every persona stands on a single person.')
    : tr(cov.head)+'.';
  const band = `<section class="dx-band" id="dashCta">
      <span class="dx-band-k">${tr('Next round')}</span>
      <span class="dx-band-h">${esc(head)}</span>
      <span class="dx-band-acts">
        ${zeroData
          ? `<code class="dx-cmd">/cold-start</code><button type="button" class="dx-btn dx-btn-ember" id="dashColdStart">${tr('⧉ Copy command')}</button>`
          : `<button type="button" class="dx-btn dx-btn-ember" id="dashCopyPrompt">${tr('⧉ Copy AI prompt')}</button>
             <div class="dx-menu-wrap"><button type="button" class="dx-btn dx-btn-inv" id="dxMore" aria-haspopup="menu" aria-expanded="false">${tr('More')}${DX_CARET}</button>
               <div class="dx-menu dx-menu-up" id="dxMoreMenu" role="menu" hidden>
                 <button type="button" role="menuitem" id="dashDlPrompt">${tr('↓ Prompt .md')}</button>
                 <button type="button" role="menuitem" id="dashDlBrief">${tr('↓ Agency brief .md')}</button>
                 <button type="button" role="menuitem" id="dashEnrichCopy">${tr('⧉ Desk-research refresh prompt')}</button>
               </div></div>`}
      </span>
    </section>`;

  grid.innerHTML = hero + facts + personasSec + health + pair + oq + band;

  /* wiring */
  const $ = sel => grid.querySelector(sel);
  const menu = (btnSel, menuSel)=>{
    const b = $(btnSel), m = $(menuSel); if(!b || !m) return;
    b.onclick = ev=>{ ev.stopPropagation(); m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); };
    document.addEventListener('click', function close(ev){
      if(!grid.contains(b)){ document.removeEventListener('click', close); return; }   // the page re-rendered: drop this listener
      if(!m.hidden && !m.contains(ev.target)){ m.hidden = true; b.setAttribute('aria-expanded','false'); }
    });
  };
  menu('#dxAsk', '#dxAskMenu'); menu('#dxMore', '#dxMoreMenu');
  const plan = $('#dashPlan'); if(plan) plan.onclick = ()=> $('#dashCta').scrollIntoView({behavior:'smooth', block:'center'});
  const all = $('#dxAllPersonas'); if(all) all.onclick = ()=>{ activeType = 'Persona'; location.hash = ''; renderTabs(); updatePageHead(); };
  grid.querySelectorAll('[data-ask]').forEach(b=> b.onclick = ()=>{
    const e = ENTITIES[b.dataset.ask], agent = pjAgent(), txt = talkCommand(e, agent);
    const done = ()=> toast(tr('Copied “{t}” — paste it into {a}, opened in this project folder').replace('{t}', trim(txt, 60)).replace('{a}', pjAgentLabel(agent)));
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, ()=> fallbackCopy(txt, done));
    else fallbackCopy(txt, done);
  });
  const on = (id, fn)=>{ const el = grid.querySelector('#'+id); if(el) el.onclick = fn; };
  on('dashCopyPrompt', ()=> dashCopy(dashPromptText(s), tr('Prompt copied — paste it into your AI assistant ✓')));
  on('dashDlPrompt', ()=> dashDownload('research-plan-prompt.md', dashPromptText(s)));
  on('dashDlBrief', ()=> dashDownload('research-brief.md', dashBriefText(s)));
  on('dashEnrichCopy', ()=> dashCopy(dashEnrichText(s), tr('Prompt copied — paste it into your AI assistant ✓'), 'desk-research-refresh-prompt.md'));
  on('dashColdStart', ()=> dashCopy('/cold-start'+promptLang(), tr('Command copied — paste it as your first message ✓'), 'cold-start-command.md'));
}

function dashboardEnter(){
  if(typeof settingsExit==='function') settingsExit();
  if(typeof helpExit==='function') helpExit();
  if(typeof mindmapExit==='function') mindmapExit();
  DASHBOARD_ACTIVE = true; syncLinTheme();
  document.body.classList.add('dash-open');   // scopes the shared-token skin to this page (12-project-home.css)
  dashBtn.classList.add('active');
  galleryView.style.display=''; detailView.classList.remove('active');
  hideGalleryChrome();
  renderTabs(); // drop any lingering graph-tab highlight while this page owns the screen
  renderDashboard(); window.scrollTo(0,0);
}
function dashboardExit(){
  if(!DASHBOARD_ACTIVE) return;
  DASHBOARD_ACTIVE = false;
  document.body.classList.remove('dash-open');
  dashBtn.classList.remove('active');
  renderTabs(); // restore the graph-tab highlight now the page has released the screen
  updatePageHead();
}
dashBtn.onclick = ()=>{ location.hash = '#dashboard'; };

