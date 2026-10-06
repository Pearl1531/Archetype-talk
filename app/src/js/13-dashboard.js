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
  return `<span class="dx-tip${side==='right'?' dx-tip-r':''}"><button type="button" class="dx-tip-btn" aria-label="${esc(title)}" aria-describedby="${id}">${DX_INFO}</button><span role="tooltip" id="${id}" class="dx-tip-pop" popover="manual"><b>${esc(title)}</b>${body}</span></span>`;
}
/* An ⓘ opens on hover or keyboard focus, in the browser's top layer (popover)
   — so no card, table or pane that clips its overflow can cut it off. It sits
   under its button (right-aligned for .dx-tip-r), flips above when the window
   has no room below, never leaves the window, and closes on scroll. */
/* puts an open popover under its button (right-aligned when `right`), above
   it when the window has no room below, and never outside the window */
function popPlace(pop, btn, right){
  const b = btn.getBoundingClientRect(), p = pop.getBoundingClientRect(), m = 12;
  const left = right ? b.right + 8 - p.width : b.left - 8;
  const top = b.bottom + 8 + p.height > innerHeight - m ? b.top - 8 - p.height : b.bottom + 8;
  pop.style.left = Math.max(m, Math.min(left, innerWidth - p.width - m)) + 'px';
  pop.style.top = Math.max(m, top) + 'px';
}
function dxTipShow(tip, on){
  const pop = tip && tip.querySelector('.dx-tip-pop'); if(!pop || !pop.showPopover) return;
  if(!on){ if(pop.matches(':popover-open')) pop.hidePopover(); return; }
  if(!pop.matches(':popover-open')) pop.showPopover();
  popPlace(pop, tip.querySelector('.dx-tip-btn'), tip.classList.contains('dx-tip-r'));
}
/* The ⋯ row menu — a row's actions in one place at its end, so the columns
   keep their room for content and a new action is one more item, not one more
   column. The browser's own popover="auto": it opens on click, closes on a
   click elsewhere, on Esc and on scroll; we only place it. `items` are menu
   buttons (role="menuitem", falsy ones skipped); `hint` puts an ember dot on
   the ⋯ and says why (e.g. a hypothesis ready to be promoted). */
function rowMenuHtml(id, items, hint){
  return `<span class="row-menu"><button type="button" class="row-menu-btn${hint ? ' hint' : ''}" popovertarget="${esc(id)}" aria-label="${esc(tr('Actions'))}" title="${esc(hint || tr('Actions'))}"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg></button><span class="row-menu-pop" id="${esc(id)}" popover="auto" role="menu">${items.filter(Boolean).join('')}</span></span>`;
}
document.addEventListener('toggle', ev=>{   // toggle doesn't bubble: caught on the way down
  const pop = ev.target;
  if(ev.newState !== 'open' || !pop.classList || !pop.classList.contains('row-menu-pop')) return;
  const btn = document.querySelector(`[popovertarget="${CSS.escape(pop.id)}"]`); if(btn) popPlace(pop, btn, true);
}, true);
const dxTipOf = ev => ev.target.closest ? ev.target.closest('.dx-tip') : null;
document.addEventListener('pointerover', ev=> dxTipShow(dxTipOf(ev), true));
document.addEventListener('pointerout', ev=>{ const t = dxTipOf(ev); if(t && !t.contains(ev.relatedTarget)) dxTipShow(t, false); });
document.addEventListener('focusin', ev=> dxTipShow(dxTipOf(ev), true));
document.addEventListener('focusout', ev=> dxTipShow(dxTipOf(ev), false));
addEventListener('scroll', ()=> document.querySelectorAll('.dx-tip-pop:popover-open, .row-menu-pop:popover-open').forEach(p=> p.hidePopover()), { capture: true, passive: true });
function dxBacklogTop(){
  const raw = backlogRaw(); if(!raw) return [];
  const sec = parseBacklog(raw).open;
  if(!sec || !sec.table) return [];
  const h = sec.table.header.map(x=> x.toLowerCase());
  const qi = h.findIndex(x=> /question|pytanie/.test(x)), pi = h.findIndex(x=> /persona/.test(x));
  return sec.table.rows.map(r=>({ q: r[qi>=0?qi:2]||'', who: (r[pi>=0?pi:1]||'').trim() }));
}
/* Fresh research, Revolut-style: one line for how many sources are younger
   than three months, day by day. A new transcript (date:) or new desk research
   (Evidence retrieved:) lifts it; 92 days later the same source goes out of
   date and the line steps down — so a project that stops listening slides
   visibly. A dot marks each day something changed; hovering (or ←/→ on the
   focused card) scrubs to it and says what happened, the way Revolut names a
   price. Set-aside sessions and undated files count nowhere. */
let DX_FRESH = null;
const DX_DAY = 86400000;
const dxDayOf = d => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DX_DAY);
const dxDateOf = n => { const u = new Date(n * DX_DAY); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
const dxDayLabel = n => { const d = dxDateOf(n); return `${d.getDate()} ${dashMon(d.getMonth())} ${d.getFullYear()}`; };
function dxFresh(){
  DX_FRESH = null;
  const today = dxDayOf(new Date(graphNow())), WIN = 92;
  const src = [];
  wsEntities().forEach(e=>{
    const d = e.type==='Transcript' && !isExcluded(e) ? parseAnyDate(e.fm.date) : e.type==='Evidence' ? parseAnyDate(e.fm.retrieved) : null;
    if(d && dxDayOf(d) <= today) src.push({ k: e.type==='Transcript' ? 'tr' : 'ev', n: dxDayOf(d) });
  });
  if(!src.length) return '';
  const days = new Map(), at = n => days.get(n) || days.set(n, { n, add: { tr: 0, ev: 0 }, out: { tr: 0, ev: 0 } }).get(n);
  src.forEach(s=>{ at(s.n).add[s.k]++; if(s.n + WIN <= today) at(s.n + WIN).out[s.k]++; });
  let v = 0;
  const pts = [...days.values()].sort((a,b)=> a.n - b.n).map(p=> ({ ...p, v: v += p.add.tr + p.add.ev - p.out.tr - p.out.ev }));
  const what = p => [
    p.add.tr && trn(p.add.tr, '+{n} transcript', '+{n} transcripts', '+{n} transkrypcja', '+{n} transkrypcje', '+{n} transkrypcji'),
    p.add.ev && trn(p.add.ev, '+{n} desk research source', '+{n} desk research sources', '+{n} źródło z desk research', '+{n} źródła z desk research', '+{n} źródeł z desk research'),
    p.out.tr && trn(p.out.tr, '{n} transcript went out of date', '{n} transcripts went out of date', '{n} transkrypcja się zestarzała', '{n} transkrypcje się zestarzały', '{n} transkrypcji się zestarzało'),
    p.out.ev && trn(p.out.ev, '{n} desk research source went out of date', '{n} desk research sources went out of date', '{n} źródło z desk research się zestarzało', '{n} źródła z desk research się zestarzały', '{n} źródeł z desk research się zestarzało'),
  ].filter(Boolean).join(' · ');
  const soon = src.filter(s=> s.n + WIN > today && s.n + WIN <= today + 30).length;
  const a = pts[0].n - 3, b = Math.max(today, pts[pts.length-1].n), H = 160, top = 14, max = Math.max(...pts.map(p=> p.v), 1);
  const X = n => (n - a) / Math.max(1, b - a) * 1000, Y = val => H - 4 - val / max * (H - 4 - top);
  const line = [`M${X(a).toFixed(1)},${Y(0).toFixed(1)}`].concat(pts.map(p=> `L${X(p.n).toFixed(1)},${Y(p.v).toFixed(1)}`), `L${X(b).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  const area = line + `L${X(b).toFixed(1)},${H}L${X(a).toFixed(1)},${H}Z`;
  DX_FRESH = {
    now: v,
    nowWhat: soon ? trn(soon, '{n} source goes out of date in the next 30 days', '{n} sources go out of date in the next 30 days', 'W ciągu 30 dni zestarzeje się {n} źródło', 'W ciągu 30 dni zestarzeją się {n} źródła', 'W ciągu 30 dni zestarzeje się {n} źródeł') : tr('Nothing goes out of date in the next 30 days'),
    pts: pts.map(p=> ({ x: X(p.n) / 10, v: p.v, when: dxDayLabel(p.n), what: what(p) })),
  };
  const unit = n => trn(n, 'fresh source', 'fresh sources', 'świeże źródło', 'świeże źródła', 'świeżych źródeł');
  const span = `${dxDayLabel(pts[0].n)} – ${tr('today')}`;
  return `<section class="dx-sec">
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Fresh research')}</h2><span class="dx-h2note">${esc(span)}</span>${dxTip(tr('What is still fresh'), esc(tr('How many of your sources are younger than three months, day by day. A new interview or new desk research lifts the line; three months later it goes out of date and the line steps down. Each dot is a day something changed — point at it to see what. Sessions the researcher set aside count nowhere.')), 'right')}</div>
      <div class="dx-card dx-fr" tabindex="0" aria-label="${esc(tr('Fresh research over time — use the arrow keys to step through the changes'))}">
        <div class="dx-fr-head" aria-live="polite"><b class="dx-fr-v">${v}</b><span class="dx-fr-unit" data-one="${esc(unit(1))}" data-many="${esc(unit(2))}" data-lots="${esc(unit(5))}">${esc(unit(v))}</span>
          <span class="dx-fr-when">${tr('Today')}</span><span class="dx-fr-what">${esc(DX_FRESH.nowWhat)}</span></div>
        <div class="dx-fr-plot">
          <svg viewBox="0 0 1000 ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="dxFrFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.16"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs>
            <path class="dx-fr-area" d="${area}"/><path class="dx-fr-line" d="${line}"/></svg>
          ${pts.map((p,i)=> `<i class="dx-fr-dot ${p.out.tr+p.out.ev ? (p.add.tr+p.add.ev ? 'mix' : 'down') : 'up'}" style="left:${(X(p.n)/10).toFixed(2)}%;top:${(Y(p.v)/H*100).toFixed(2)}%;--i:${i}"></i>`).join('')}
          <i class="dx-fr-cursor" aria-hidden="true"></i>
        </div>
        <div class="dx-fr-axis"><span>${esc(dxDayLabel(a))}</span><span>${tr('today')}</span></div>
      </div>
    </section>`;
}
/* scrubbing: the nearest change to the pointer (or ←/→), back to today on leave */
function dxFreshWire(){
  const card = grid.querySelector('.dx-fr'); if(!card || !DX_FRESH) return;
  const plot = card.querySelector('.dx-fr-plot'), cur = card.querySelector('.dx-fr-cursor'), dots = [...card.querySelectorAll('.dx-fr-dot')];
  const $ = s => card.querySelector(s), unit = $('.dx-fr-unit');
  let at = -1;
  const show = k=>{
    at = k; dots.forEach((d,j)=> d.classList.toggle('on', j===k)); card.classList.toggle('scrub', k >= 0);
    const p = k >= 0 ? DX_FRESH.pts[k] : null, v = p ? p.v : DX_FRESH.now;
    $('.dx-fr-v').textContent = v;
    unit.textContent = v===1 ? unit.dataset.one : (LANG==='pl' && !(v%10>=2 && v%10<=4 && (v%100<12 || v%100>14))) ? unit.dataset.lots : unit.dataset.many;
    $('.dx-fr-when').textContent = p ? p.when : tr('Today');
    $('.dx-fr-what').textContent = p ? p.what : DX_FRESH.nowWhat;
    if(p) cur.style.left = p.x + '%';
  };
  plot.onpointermove = ev=>{
    const r = plot.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 100;
    let k = 0; DX_FRESH.pts.forEach((p,j)=>{ if(Math.abs(p.x - x) < Math.abs(DX_FRESH.pts[k].x - x)) k = j; });
    if(k !== at) show(k);
  };
  plot.onpointerleave = ()=> show(-1);
  card.onkeydown = ev=>{
    const n = DX_FRESH.pts.length;
    if(ev.key==='ArrowRight' || ev.key==='ArrowLeft'){ ev.preventDefault(); show(Math.max(0, Math.min(n-1, at < 0 ? n-1 : at + (ev.key==='ArrowRight' ? 1 : -1)))); }
    if(ev.key==='Escape') show(-1);
  };
  card.onblur = ()=> show(-1);
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
  const cast = personas.slice(0,4).map((e,i)=> `<a class="dx-cast-${i}" href="#${esc(e.id)}" aria-label="${esc(firstName(e))}">${faceHtml(e, 'dx-face')}</a>`).join('');
  const askMenu = personas.map(e=> `<a role="menuitem" href="#${esc(e.id)}">${faceHtml(e,'dx-face-xs')}<span>${esc(firstName(e))}</span></a>`).join('');
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
        <b class="dx-big">${open.length}</b><a class="dx-btn dx-btn-line dx-btn-sm" href="#backlog">${tr('See all')} →</a></div>
    </section>`;

  /* personas: face, one line, how solid, ask */
  const pcards = personas.map(e=>{
    const lv = personaLevel(e), r = pgBy[e.id] || {sig:0, ev:0};
    const prim = /primary/i.test(e.fm.category||'');
    return `<article class="dx-pc has-card-link${prim?' prim':''}" data-lean="4">
        <div class="dx-pc-top">${faceHtml(e, 'dx-face-md')}${prim ? `<span class="dx-tag">${tr('Primary')}</span>` : ''}</div>
        <a class="dx-pc-name card-link" href="#${esc(e.id)}">${esc(firstName(e))}<span class="dx-dot">.</span></a>
        <p class="dx-pc-desc" title="${esc(e.fm.description||'')}">${esc(e.fm.description||'')}</p>
        <div class="dx-pc-foot">
          ${levelMeter(lv, tr('How solid: {l} of 5 · stands on {s} heard + {e} read').replace('{l}',lv).replace('{s}',r.sig).replace('{e}',r.ev))}
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
  const pair = splits ? `<section class="dx-sec dx-pair one">${splits}</section>` : '';
  const fresh = dxFresh();

  /* open questions: the first three, the rest one click away */
  const oq = open.length ? `<section class="dx-sec">
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Open questions')}</h2>${dxTip(tr('What no persona can answer yet'), esc(tr('Asked in conversations, answered with “I don’t know”. Each one waits for a real interview.')))}<span class="dx-spacer"></span><a class="dx-btn dx-btn-line dx-btn-sm" href="#backlog">${esc(tr('All {n}').replace('{n}', open.length))} →</a></div>
      <div class="dx-card"><table class="dx-table dx-oq"><tbody>
        ${open.slice(0,3).map((r,i)=>`<tr class="has-card-link"><td><a class="card-link" href="#backlog:open:${i}">${esc(r.q)}</a></td><td class="dx-oq-who">${r.who && r.who!=='—' ? r.who.split(/\s*[,/]\s*/).map(w=>`<span class="dx-pill">${esc(w)}</span>`).join(' ') : `<span class="dx-pill">${tr('everyone')}</span>`}</td></tr>`).join('')}
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

  grid.innerHTML = hero + facts + personasSec + health + fresh + pair + oq + band;

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
  dxFreshWire();
  dxMotion();
}

/* The Overview's pointer effects (styles: "Motion" at the end of
   12-project-home.css), wired on every render: the hero cast drifts against
   the pointer, the band's button leans toward it. The page's arrival is the
   shared one — motionPage (12c-motion.js) runs it when the router enters the
   page, so a language switch re-renders without replaying it. Persona cards
   lean through data-lean (16-motion.css). */
function dxMotion(){
  if(MO_STILL.matches) return;
  const fine = ev => ev.pointerType === 'mouse';
  const follow = (el, fn, vars)=>{
    el.onpointermove = ev=>{ if(!fine(ev)) return; const r = el.getBoundingClientRect(); fn((ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height, r); };
    el.onpointerleave = ()=> vars.forEach(v=> el.style.removeProperty(v));
  };
  // the hero cast drifts against the pointer, each face by its own depth (--d)
  const hero = grid.querySelector('.dx-hero'), cast = grid.querySelector('.dx-cast');
  if(hero && cast) follow(hero, (x, y)=>{ cast.style.setProperty('--hx', (x-.5).toFixed(3)); cast.style.setProperty('--hy', (y-.5).toFixed(3)); }, []);
  if(hero && cast) hero.onpointerleave = ()=>{ cast.style.removeProperty('--hx'); cast.style.removeProperty('--hy'); };
  // the band's main button leans a little toward the pointer (the hero's buttons stay still)
  grid.querySelectorAll('.dx-band .dx-btn-ember').forEach(b=> follow(b, (x, y, r)=>{
    b.style.setProperty('--tx', ((x-.5)*r.width*.16).toFixed(1)+'px'); b.style.setProperty('--ty', ((y-.5)*r.height*.3).toFixed(1)+'px');
  }, ['--tx','--ty']));
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

