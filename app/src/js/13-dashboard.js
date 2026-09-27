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
const nFresh = n => trn(n, '{n} fresh', '{n} fresh', '{n} świeża', '{n} świeże', '{n} świeżych');
const nStale = n => trn(n, '{n} stale', '{n} stale', '{n} przeterminowana', '{n} przeterminowane', '{n} przeterminowanych');
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
function dashEmptyState(s, lead, cls){
  return `<div class="${cls||'dv-empty'}">${tr(lead)} <span class="dash-wayout">${dashWayOut(s)}</span></div>`;
}

/* research cadence — interviews per month across the span. Honest progress
   (when we actually talked to users), not a vanity line that only goes up. */
function dashTimeline(s){
  const dates = s.dates;
  if(!dates.length) return dashEmptyState(s, 'No dated interviews yet — nothing to chart.', 'dash-muted');
  const key = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  const first = dates[0], now = new Date(graphNow());
  const buckets = []; let y=first.getFullYear(), m=first.getMonth();
  while((y<now.getFullYear() || (y===now.getFullYear() && m<=now.getMonth())) && buckets.length<18){
    buckets.push({ y, m, key:y+'-'+String(m+1).padStart(2,'0'), n:0 });
    if(++m>11){ m=0; y++; }
  }
  const idx={}; buckets.forEach((b,i)=>idx[b.key]=i);
  dates.forEach(d=>{ const i=idx[key(d)]; if(i!=null) buckets[i].n++; });
  const max = Math.max(1, ...buckets.map(b=>b.n));
  const step = buckets.length>10 ? 3 : (buckets.length>6 ? 2 : 1);
  const bars = buckets.map((b,i)=>{
    const h = b.n ? Math.max(10, Math.round(b.n/max*100)) : 4;
    const lbl = (i%step===0 || i===buckets.length-1) ? dashMon(b.m)+(b.m===0?" '"+String(b.y).slice(2):'') : '';
    return `<div class="dash-tl-col" title="${dashMon(b.m)} ${b.y}: ${trn(b.n,'{n} interview','{n} interviews','{n} wywiad','{n} wywiady','{n} wywiadów')}"><span class="dash-tl-v">${b.n||''}</span><div class="dash-tl-bar${b.n?'':' empty'}" style="height:${h}%"></div><span class="dash-tl-x">${lbl}</span></div>`;
  }).join('');
  return `<div class="dash-tl">${bars}</div>`;
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
/* Its own box, not a row on the health card: "Personas 5 · 6 archetypes" was a
   number you could only nod at, while the same space spent on the bars says
   which persona can actually answer you and which one is a face on a guess. */
function dashPgHtml(rows){
  const tip = tr('Ember = Signals, what you heard in your own sessions. Grey = Evidence, what you read. A persona is only as good as the row behind her: the short ones answer “I don’t know” most often in a conversation.');
  const head = `<div class="dash-sec-h"><h2>${tr('What each persona stands on')}</h2><span class="dash-sec-note">${tr('signals + evidence')}</span></div>`;
  if(!rows.length) return `<section class="dash-card dash-pg-card">${head}
    <div class="dv-empty">${tr('No personas yet — nothing to weigh.')} <span class="dash-wayout">${tr('Open the Personas tab and use “New persona”, or run /persona-workshop with your AI.')}</span></div></section>`;
  const max = Math.max(1, ...rows.map(r=> r.total));
  return `<section class="dash-card dash-pg-card" title="${esc(tip)}">${head}
    <div class="dash-pg">${rows.map(r=>`
      <a class="dash-pg-row" href="#${r.id}" title="${esc(r.name + ': ' + r.sig + ' ' + tr('Signals') + ' · ' + r.ev + ' ' + tr('Evidence'))}">
        <span class="dash-pg-n">${esc(r.name)}</span>
        <span class="dash-pg-bar"><i class="sig" style="width:${(r.sig/max*100).toFixed(1)}%"></i><i class="ev" style="width:${(r.ev/max*100).toFixed(1)}%"></i></span>
        <span class="dash-pg-v">${r.sig}<small> + ${r.ev}</small></span>
      </a>`).join('')}</div>
    <p class="dash-pg-foot">${tr('Ember = Signals you heard yourself · grey = Evidence you read. The shortest row is the persona most likely to answer “I don’t know”.')}</p>
  </section>`;
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

/* one small meter — label, a number you can say out loud, a bar, one line of
   what to do about it. Every block on this card speaks the same grammar. */
function dashMeter(label, value, pct, head, note, tip){
  return `<div class="dash-mix"${tip ? ` title="${esc(tip)}"` : ''}>
    <div class="dash-mix-top"><span class="dash-mix-k">${tr(label)}</span><span class="dash-mix-pct">${value}</span></div>
    <div class="dash-mix-bar"><span class="dash-mix-sig" style="width:${Math.max(0, Math.min(100, pct))}%"></span></div>
    <p class="dash-mix-note"><b>${tr(head)}.</b> ${note}</p>
  </div>`;
}

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
function dashMixHtml(sig, ev){
  const v = dashMixVerdict(sig, ev);
  const tip = tr('A session you ran becomes a Signal; anything you read — a report, an analytics number, a public thread — is Evidence. Filing desk research as a signal is the one shortcut that quietly inflates how grounded you look.')
            + '\n\n' + tr(v.note);
  return `<div class="dash-mix" title="${esc(tip)}">
    <div class="dash-mix-top">
      <span class="dash-mix-k">${tr('What the graph stands on')}</span>
      <span class="dash-mix-pct">${v.pct}% ${tr('firsthand')}</span>
    </div>
    <div class="dash-mix-bar" role="img" aria-label="${esc(sig + ' ' + tr('Signals') + ', ' + ev + ' ' + tr('Evidence'))}">
      <span class="dash-mix-sig" style="width:${sig + ev ? v.pct : 0}%"></span>
    </div>
    <div class="dash-mix-legend">
      <span><i class="dash-mix-i sig"></i>${sig} ${tr('Signals')} <small>${tr('heard by you')}</small></span>
      <span><i class="dash-mix-i ev"></i>${ev} ${tr('Evidence')} <small>${tr('read by you')}</small></span>
    </div>
    <p class="dash-mix-note"><b>${tr(v.head)}.</b> ${tr(v.note)}</p>
  </div>`;
}

/* ---- small Apple-styled data-viz primitives (vanilla inline SVG, offline).
   Two-tone language matching the app: ink = primary, #10b981 = healthy,
   ember = needs attention, hairline gray = the empty track. No decoration
   for its own sake — every mark encodes a real number. ---- */
function dashDonut(good, bad){
  const total = good + bad, r = 46, C = 2*Math.PI*r;
  if(total===0) return `<svg viewBox="0 0 120 120" class="dv-donut"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--dv-track)" stroke-width="14"/></svg>`;
  const gl = C*good/total, bl = C*bad/total;
  return `<svg viewBox="0 0 120 120" class="dv-donut"><g transform="rotate(-90 60 60)">`
    + `<circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--dv-good)" stroke-width="14" stroke-dasharray="${gl.toFixed(1)} ${(C-gl).toFixed(1)}"/>`
    + `<circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--dv-warn)" stroke-width="14" stroke-dasharray="${bl.toFixed(1)} ${(C-bl).toFixed(1)}" stroke-dashoffset="${(-gl).toFixed(1)}"/>`
    + `</g></svg>`;
}
/* cumulative transcript count at the end of each month, first interview → now */
function dashCumulative(dates){
  if(!dates.length) return [];
  const now = new Date(graphNow()), out = [];
  const mk = d => d.getFullYear()*12 + d.getMonth();
  const dkeys = dates.map(mk);
  // begin one month before the first interview at 0, so the line rises from a
  // real baseline instead of starting already at full height
  let y=dates[0].getFullYear(), m=dates[0].getMonth()-1, cum=0;
  if(m<0){ m=11; y--; }
  while((y<now.getFullYear() || (y===now.getFullYear() && m<=now.getMonth())) && out.length<24){
    cum += dkeys.filter(x=>x===y*12+m).length;
    out.push({ y, m, cum });
    if(++m>11){ m=0; y++; }
  }
  return out;
}
function dashArea(s){
  const S = dashCumulative(s.dates);
  if(!S.length) return dashEmptyState(s, 'No dated interviews yet — nothing to chart.');
  const W=580, H=150, PAD=10, n=S.length, max=Math.max(1, S[n-1].cum);
  const X = i => n<=1 ? W/2 : PAD + i/(n-1)*(W-2*PAD);
  const Y = v => H-16 - (v/max)*(H-36);
  const pts = S.map((s,i)=>[X(i), Y(s.cum)]);
  const line = pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area = line + ` L ${X(n-1).toFixed(1)} ${H-2} L ${X(0).toFixed(1)} ${H-2} Z`;
  const lp = pts[n-1];
  return `<svg viewBox="0 0 ${W} ${H}" class="dv-area" preserveAspectRatio="xMidYMid meet">`
    + `<defs><linearGradient id="dvAreaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--text)" stop-opacity=".13"/><stop offset="1" stop-color="var(--text)" stop-opacity="0"/></linearGradient></defs>`
    + `<path d="${area}" fill="url(#dvAreaG)"/>`
    + `<path d="${line}" fill="none" stroke="var(--text)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<circle cx="${lp[0].toFixed(1)}" cy="${lp[1].toFixed(1)}" r="4.5" fill="var(--bg-elev)" stroke="var(--text)" stroke-width="2.4"/>`
    + `</svg>`;
}
/* days-since-last-interview against the 3-month refresh line */
function dashGauge(lastAgo, s){
  if(lastAgo===null) return dashEmptyState(s, 'No dated interviews to measure cadence.');
  const target = 92, span = target*2, pct = Math.min(1, lastAgo/span), tickPct = target/span;
  const over = lastAgo>target, col = over ? 'var(--dv-warn)' : 'var(--dv-good)';
  const msg = over
    ? trn(lastAgo-target, 'Overdue by {n} day', 'Overdue by {n} days', 'Spóźnione o {n} dzień', 'Spóźnione o {n} dni', 'Spóźnione o {n} dni')
    : trn(target-lastAgo, 'Due in {n} day', 'Due in {n} days', 'Termin za {n} dzień', 'Termin za {n} dni', 'Termin za {n} dni');
  return `<div class="dv-gauge-head"><span class="dv-gauge-n">${lastAgo}<small>${tr('d')}</small></span><span class="dv-gauge-lbl">${tr('since the last interview')}</span></div>`
    + `<div class="dv-gauge"><div class="dv-gauge-fill" style="width:${(pct*100).toFixed(0)}%;background:${col}"></div><span class="dv-gauge-tick" style="left:${(tickPct*100).toFixed(0)}%"></span></div>`
    + `<div class="dv-gauge-foot"><span class="${over?'warn':'ok'}">${msg}</span><span class="dv-gauge-scale">▲ ${tr('3-month line')}</span></div>`;
}

function renderDashboard(){
  const s = dashStats();
  /* the head belongs to this render, not to dashboardEnter: switching language
     re-renders the page but never re-enters it */
  pageTitle.textContent = tr('Overview');
  pageSub.textContent = tr('A snapshot of what’s in your research graph right now — and what to look at next.');
  pageSub.style.display = '';
  grid.className = 'dash-wrap';
  const lastAgo = s.dates.length ? Math.floor((graphNow()-s.dates[s.dates.length-1])/86400000) : null;
  const totalEnt = wsEntities().length;

  /* No inventory tiles: Signals / Evidence / Hypotheses / Ideas are already on
     the hero legend and in the sidebar, and a number repeated three times on
     one screen reads as three findings. */
  const freshPct = s.transcripts ? Math.round(s.fresh/s.transcripts*100) : 0;
  const who = (PREFS.name||'').trim();

  // composition legend on the hero (ink shades — descriptive, not a score)
  const legend = [['Signals',s.signals],['Evidence',s.evidence],['Hypotheses',s.hypotheses],['Ideas',s.ideas]]
    .map((x,i)=>`<span class="dash-leg"><i class="dash-leg-i l${i}"></i>${tr(x[0])} <b>${x[1]}</b></span>`).join('');

  const span = s.dates.length
    ? `${dashMon(s.dates[0].getMonth())} ${s.dates[0].getFullYear()} → ${dashMon(s.dates[s.dates.length-1].getMonth())} ${s.dates[s.dates.length-1].getFullYear()}`
    : '';

  /* health — four blocks, one grammar: a label, a number you can say out loud,
     a bar, and one line telling you what to do about it. Nothing here is a
     figure without a reading ("grounding depth 10.3" invited a nod, never a
     question), and nothing claims a precision the sample cannot carry. */
  const pg = dashPersonaGrounding();
  const cov = dashCoverage(pg, s.participants);
  const health =
    dashMixHtml(s.signals, s.evidence) +
    dashMeter('Coverage', cov.value, cov.pct, cov.head, cov.note,
      tr('Estimated from the discovery curve behind the “five users” rule — Nielsen & Landauer (1993), replicated by Faulkner (2003): 1−(1−0.31)ⁿ, the share of recurring patterns n sessions in ONE segment are expected to surface. It answers “have we heard enough people?” and says nothing about how many users have a problem — that is a survey question, and a survey answer is Evidence.')) +
    dashMeter('Freshness', s.transcripts ? `${s.fresh} / ${s.transcripts}` : '—', freshPct,
      s.transcripts === 0 ? (s.excluded ? 'Every transcript is switched off' : 'No interviews on file')
        : freshPct === 0 ? 'Everything is out of date'
        : freshPct < 50 ? 'More than half has aged out' : freshPct === 100 ? 'All current' : 'Mostly current',
      s.transcripts === 0
        ? (s.excluded
            ? dashWayOut(s)
            : tr('Nothing to age yet — the freshness clock starts with your first transcript.') + ' ' + dashWayOut(s))
        : tr('{a} of {b} transcripts are younger than 3 months. Older sessions are not wrong, they are just no longer evidence about today — flag them for a refresh before the next decision leans on them.')
            .replace('{a}', s.fresh).replace('{b}', s.transcripts),
      tr('Three months is the repo’s freshness line: past it, a Signal gets flagged for a re-check rather than quietly passed off as current.'));

  // next-research card — strongest when nothing fresh remains
  const ctaBtns = `
    <div class="dash-cta-btns">
      <button class="btn btn-primary btn-sm" id="dashCopyPrompt">${tr('⧉ Copy AI prompt')}</button>
      <button class="btn btn-outline btn-sm" id="dashDlPrompt">${tr('↓ Prompt .md')}</button>
      <button class="btn btn-outline btn-sm" id="dashDlBrief">${tr('↓ Agency brief .md')}</button>
    </div>`;
  let refresh;
  if(s.transcripts===0 && s.excluded){
    // files on disk, all switched off — a different problem from having none,
    // and the fix is a toggle, not a research round
    refresh = `<div class="dash-cta warn"><div class="dash-cta-h"><span class="dash-cta-i">⊘</span><div><h3>${trn(s.excluded,
        '{n} transcript on file, excluded from analysis','{n} transcripts on file, all excluded from analysis',
        '{n} transkrypcja w plikach, wyłączona z analizy','{n} transkrypcje w plikach, wszystkie wyłączone z analizy','{n} transkrypcji w plikach, wszystkie wyłączone z analizy')}</h3><p>${tr('Nothing counts toward freshness, sample stats or heard-from — that is why the numbers above read zero. Open a transcript and turn on “Use in analysis” to bring it back, or run a new round if these were meant to stay out.')}</p></div></div>${ctaBtns}</div>`;
  } else if(s.transcripts===0){
    refresh = `<div class="dash-cta warn"><div class="dash-cta-h"><span class="dash-cta-i">◒</span><div><h3>${tr('No interviews in the system yet')}</h3><p>${tr('Your personas have nothing to stand on. Run a first round — grab the prompt and let the AI turn your backlog into a plan (or a brief for an agency).')} ${dashWayOut(s)}</p></div></div>${ctaBtns}</div>`;
  } else if(s.fresh===0){
    refresh = `<div class="dash-cta warn"><div class="dash-cta-h"><span class="dash-cta-i">⏳</span><div><h3>${tr('Every transcript is older than 3 months')}</h3><p>${tr("Your personas are answering from history, not from today's users. Before the next product decision, run a refresh round — the prompt turns your backlog and open hypotheses into a plan, or an agency brief if the backlog is empty.")}</p></div></div>${ctaBtns}</div>`;
  } else {
    refresh = `<div class="dash-cta"><div class="dash-cta-h"><span class="dash-cta-i ok">✓</span><div><h3>${tr('{a} of {b} transcripts are fresh').replace('{a}',s.fresh).replace('{b}',s.transcripts)}${s.stale?` · ${trn(s.stale,'{n} due for a refresh','{n} due for a refresh','{n} do odświeżenia','{n} do odświeżenia','{n} do odświeżenia')}`:''}</h3><p>${tr("Grab a head start on the next round whenever you're ready — the prompt hands the AI your current state, backlog and open hypotheses to plan from.")}</p></div></div>${ctaBtns}</div>`;
  }

  // the AI hand-off card: a zero-data startup gets the founding-brief protocol;
  // a project with data gets the desk-research refresh prompt instead
  const zeroData = s.transcripts===0 && s.signals===0 && s.evidence===0;
  const deskDrift = s.staleDesk + s.needsRes;
  const aiCard = zeroData
    ? `<div class="dash-cta"><div class="dash-cta-h"><span class="dash-cta-i">✦</span><div><h3>${tr('Startup with no research data yet?')}</h3><p>${tr('Run the founding-brief protocol: the AI interviews you about the product, value proposition and target group — recording your beliefs about users as testable assumptions, never as findings — and plans the first research round. Paste the command into your AI assistant as your first message.')}</p></div></div>
       <div class="dash-cta-btns"><code class="dash-cmd">/cold-start</code><button class="btn btn-primary btn-sm" id="dashColdStart">${tr('⧉ Copy command')}</button></div></div>`
    : `<div class="dash-cta${deskDrift?' warn':''}"><div class="dash-cta-h"><span class="dash-cta-i${deskDrift?'':' ok'}">${deskDrift?'◍':'◉'}</span><div><h3>${deskDrift
        ? `${tr('Desk research is drifting:')} ${s.staleDesk?trn(s.staleDesk,'{n} entry verified over 3 months ago','{n} entries verified over 3 months ago','{n} wpis sprawdzony ponad 3 miesiące temu','{n} wpisy sprawdzone ponad 3 miesiące temu','{n} wpisów sprawdzonych ponad 3 miesiące temu'):''}${s.staleDesk&&s.needsRes?' · ':''}${s.needsRes?trn(s.needsRes,'{n} competitor never researched','{n} competitors never researched','{n} konkurent nigdy nie zbadany','{n} konkurentów nigdy nie zbadanych','{n} konkurentów nigdy nie zbadanych'):''}`
        : tr('Enrich your data with the latest from the internet')}</h3><p>${tr('This prompt sends the AI on a desk-research refresh: re-verify stale Evidence at its sources, research flagged competitors, close Comparison gaps. Web finds land as cited Evidence — never as Signals — and nothing is written without your approval.')}</p></div></div>
       <div class="dash-cta-btns"><button class="btn btn-primary btn-sm" id="dashEnrichCopy">${tr('⧉ Copy AI prompt')}</button><button class="btn btn-outline btn-sm" id="dashEnrichDl">${tr('↓ Prompt .md')}</button></div></div>`;

  grid.innerHTML = `
    <section class="dash-sec">
      <div class="dash-sec-h"><h2>${tr("What's in your graph")}</h2><span class="dash-sec-note">${WS==='demo' ? tr('as of {d}').replace('{d}', DEMO_AS_OF.toLocaleDateString(LANG==='pl'?'pl-PL':'en-GB',{day:'numeric',month:'short',year:'numeric'})) : tr('right now')} · ${tr(WS==='demo'?'Demo workspace':'your project workspace')}</span></div>
      <!-- One horizontal strip instead of a tall hero column: the greeting and
           the two headline numbers are one line of reading, so making them a
           400px-tall card only bought empty space for the cards beside it. -->
      <section class="dash-card dash-strip">
        <div class="dash-strip-top">
          <div class="dash-hero-hi"><span class="dash-hero-ava">${who?esc(initialsFor(who)):'◐'}</span><div class="dash-hero-hey"><b>${who?(tr('Hey,')+' '+esc(who)):tr('Your research graph')}</b><span>${WS==='demo' ? tr('Example project · Spotify listeners') : esc(projectDisplayName())}</span></div></div>
          <div class="dash-strip-btns">
            <button class="btn btn-primary btn-sm" id="dashPlan">${tr('Plan next round')}</button>
            <button class="btn btn-outline btn-sm" id="dashConnect">${tr('Connect folder')}</button>
          </div>
        </div>
        <div class="dash-strip-bot">
          <div class="dash-stat"><b>${totalEnt}</b><span>${tr('All entities · this workspace')}</span></div>
          <div class="dash-stat"><b>${s.signals+s.evidence}</b><span>${tr('sources behind your personas')}</span></div>
          <div class="dash-hero-legend">${legend}</div>
        </div>
      </section>

      <div class="dash-two dash-two-wide">
        <div class="dash-card dash-ring-card">
          <div class="dash-mini-h">${tr('Transcript freshness')}</div>
          <div class="dash-ring-row">
            <div class="dash-ring-wrap">${dashDonut(s.fresh, s.stale)}<div class="dash-ring-center">${s.transcripts
              ? `<b>${s.fresh}/${s.transcripts}</b><span>${tr('fresh')}</span>`
              : `<b>—</b><span>${s.excluded?tr('all switched off'):tr('none yet')}</span>`}</div></div>
            ${s.transcripts
              ? `<div class="dash-ring-foot"><span><span class="dash-dot ok"></span>${nFresh(s.fresh)}</span><span><span class="dash-dot bad"></span>${nStale(s.stale)}</span>${s.excluded?`<span class="dash-ring-excl" title="${esc(tr('Excluded transcripts stay on disk but count toward nothing until you turn them back on'))}">${trn(s.excluded,'+ {n} excluded from analysis','+ {n} excluded from analysis','+ {n} wyłączona z analizy','+ {n} wyłączone z analizy','+ {n} wyłączonych z analizy')}</span>`:''}</div>`
              : `<p class="dash-ring-note">${dashWayOut(s)}</p>`}
          </div>
        </div>

        ${dashPgHtml(pg)}
      </div>
    </section>

    <!-- Everything that reads time down the left, the one long verdict down the
         right: three short cards next to one tall one, instead of a tall card
         next to 400px of nothing. -->
    <div class="dash-two">
      <div class="dash-col">
        ${/* A trend needs at least two months to be one. Before that, two charts
             would draw a single jump and a single bar — decoration pretending
             to be data — so they wait, and one line says what there is. */ ''}
        ${new Set(s.dates.map(d=>d.getFullYear()*12+d.getMonth())).size >= 2 ? `
        <section class="dash-card dash-area-card">
          <div class="dash-sec-h"><h2>${tr('Transcripts over time')}</h2><span class="dash-sec-note">${tr('cumulative, by month')}</span></div>
          ${dashArea(s)}
          ${span?`<div class="dash-axis"><span>${span}</span><span>${s.transcripts} ${tr('total')}</span></div>`:''}
        </section>
        <section class="dash-card">
          <div class="dash-sec-h"><h2>${tr('Research cadence')}</h2><span class="dash-sec-note">${tr('interviews per month')}</span></div>
          ${dashTimeline(s)}
        </section>` : s.dates.length ? `
        <section class="dash-card">
          <div class="dash-sec-h"><h2>${tr('Research timeline')}</h2></div>
          <p class="dash-note-line">${trn(s.dates.length,'{n} interview, all in {m}.','{n} interviews, all in {m}.','{n} wywiad, wszystkie w: {m}.','{n} wywiady, wszystkie w: {m}.','{n} wywiadów, wszystkie w: {m}.').replace('{m}', s.dates[0].toLocaleDateString(LANG==='pl'?'pl-PL':'en-GB',{month:'long',year:'numeric'}))} ${tr('Trend charts appear once your research spans two months.')}</p>
        </section>` : ''}
        <section class="dash-card dash-gauge-card">
          <div class="dash-sec-h"><h2>${tr('Refresh cadence')}</h2><span class="dash-sec-note">${tr('vs the 3-month line')}</span></div>
          ${dashGauge(lastAgo, s)}
        </section>
      </div>
      <section class="dash-card">
        <div class="dash-sec-h"><h2>${tr('Health check')}</h2></div>
        <div class="dash-health">${health}</div>
      </section>
    </div>

    <section class="dash-sec" id="dashCta"><div class="dash-cta-row">${refresh}${aiCard}</div></section>`;

  const plan = grid.querySelector('#dashPlan'); if(plan) plan.onclick = ()=>{ const c=grid.querySelector('#dashCta'); if(c) c.scrollIntoView({behavior:'smooth', block:'center'}); };
  const conn = grid.querySelector('#dashConnect'); if(conn) conn.onclick = ()=>{ const l=document.getElementById('loadBtn'); if(l) l.click(); };
  const cp = grid.querySelector('#dashCopyPrompt'); if(cp) cp.onclick = ()=> dashCopy(dashPromptText(s), tr('Prompt copied — paste it into your AI assistant ✓'));
  const dp = grid.querySelector('#dashDlPrompt'); if(dp) dp.onclick = ()=> dashDownload('research-plan-prompt.md', dashPromptText(s));
  const db = grid.querySelector('#dashDlBrief'); if(db) db.onclick = ()=> dashDownload('research-brief.md', dashBriefText(s));
  const cs = grid.querySelector('#dashColdStart'); if(cs) cs.onclick = ()=> dashCopy('/cold-start'+promptLang(), tr('Command copied — paste it as your first message ✓'), 'cold-start-command.md');
  const ecp = grid.querySelector('#dashEnrichCopy'); if(ecp) ecp.onclick = ()=> dashCopy(dashEnrichText(s), tr('Prompt copied — paste it into your AI assistant ✓'), 'desk-research-refresh-prompt.md');
  const edl = grid.querySelector('#dashEnrichDl'); if(edl) edl.onclick = ()=> dashDownload('desk-research-refresh-prompt.md', dashEnrichText(s));
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

