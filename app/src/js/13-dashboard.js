/* ---------- Overview dashboard ----------
   A snapshot of what's actually in the graph right now — counts, freshness,
   research cadence and grounding health. Strictly read-only: it never creates
   data, it points at the next research round and hands you a brief for it. Same full-screen pattern as Settings / Help / Mind Map, and it only
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
/* Research activity, GitHub-style: the last twelve months as a calendar, one
   square a day, its ember deeper the more sources arrived that day — a new
   transcript (date:) or new desk research (Evidence retrieved:). A project
   that stops listening shows it as a run of empty weeks. The head keeps the
   freshness count (younger than three months) the old line chart carried.
   Pointing at a day (or ←/→ on the focused card) says what came in. Set-aside
   sessions and undated files count nowhere. */
let DX_FRESH = null;
const DX_DAY = 86400000;
const dxDayOf = d => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DX_DAY);
const dxDateOf = n => { const u = new Date(n * DX_DAY); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
const dxDayLabel = n => { const d = dxDateOf(n); return `${d.getDate()} ${dashMon(d.getMonth())} ${d.getFullYear()}`; };
function dxFresh(){
  DX_FRESH = null;
  const today = dxDayOf(new Date(graphNow())), WIN = 92, per = new Map();
  let fresh = 0, soon = 0;
  wsEntities().forEach(e=>{
    const d = e.type==='Transcript' && !isExcluded(e) ? parseAnyDate(e.fm.date) : e.type==='Evidence' ? parseAnyDate(e.fm.retrieved) : null;
    const n = d && dxDayOf(d);
    if(!n || n > today) return;
    (per.get(n) || per.set(n, { tr: 0, ev: 0 }).get(n))[e.type==='Transcript' ? 'tr' : 'ev']++;
    if(n + WIN > today){ fresh++; if(n + WIN <= today + 30) soon++; }
  });
  if(!per.size) return '';
  /* 53 weeks, Monday on top, the last column ending today */
  const dow = n => (dxDateOf(n).getDay() + 6) % 7, W = 53, start = today - dow(today) - (W - 1) * 7;
  const C = 11, STEP = 14, LW = 30, MH = 18, vw = LW + W * STEP, vh = MH + 7 * STEP;
  const inRange = [...per].filter(([n])=> n >= start), total = inRange.reduce((s, [, c])=> s + c.tr + c.ev, 0);
  const max = Math.max(1, ...inRange.map(([, c])=> c.tr + c.ev));
  const lvl = v => v ? Math.min(4, Math.ceil(v / max * 4)) : 0;
  const what = c => [
    c.tr && trn(c.tr, '{n} transcript', '{n} transcripts', '{n} transkrypcja', '{n} transkrypcje', '{n} transkrypcji'),
    c.ev && trn(c.ev, '{n} desk research source', '{n} desk research sources', '{n} źródło z desk research', '{n} źródła z desk research', '{n} źródeł z desk research'),
  ].filter(Boolean).join(' · ') || tr('Nothing came in');
  let cells = '', months = '', lastM = -1, lastX = -99;
  for(let col = 0; col < W; col++){
    const m = dxDateOf(start + col * 7 + 6).getMonth(), x = LW + col * STEP;   // a week belongs to the month its Sunday is in
    if(m !== lastM){ lastM = m; if(x - lastX >= 30){ months += `<text x="${x}" y="11">${esc(dashMon(m))}</text>`; lastX = x; } }
    for(let row = 0; row < 7; row++){
      const n = start + col * 7 + row; if(n > today) break;
      const c = per.get(n), v = c ? c.tr + c.ev : 0;
      cells += `<rect class="dx-hm-c l${lvl(v)}" data-n="${n}" x="${x}" y="${MH + row * STEP}" width="${C}" height="${C}" rx="2.5" style="--d:${Math.min((col * 7 + row) * 1.4, 520) | 0}ms"/>`;
    }
  }
  const wd = k => new Date(2024, 0, 1 + k).toLocaleDateString(LANG==='pl' ? 'pl-PL' : 'en-US', { weekday: 'short' });   // 1 Jan 2024 was a Monday
  const days = [0, 2, 4].map(r=> `<text x="0" y="${MH + r * STEP + C / 2}" dominant-baseline="middle">${esc(wd(r))}</text>`).join('');
  const unit = n => trn(n, 'source', 'sources', 'źródło', 'źródła', 'źródeł');
  const nowWhat = trn(fresh, '{n} still fresh', '{n} still fresh', '{n} wciąż świeże', '{n} wciąż świeże', '{n} wciąż świeżych')
    + ' · ' + (soon ? trn(soon, '{n} goes out of date in 30 days', '{n} go out of date in 30 days', '{n} zestarzeje się w ciągu 30 dni', '{n} zestarzeją się w ciągu 30 dni', '{n} zestarzeje się w ciągu 30 dni') : tr('Nothing goes out of date in the next 30 days'));
  DX_FRESH = { today, start, nowWhat, label: dxDayLabel, what: n => what(per.get(n) || {}) };
  const legend = [0,1,2,3,4].map(l=> `<i class="dx-hm-k l${l}"></i>`).join('');
  return `<section class="dx-sec">
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Research activity')}</h2><span class="dx-h2note">${esc(dxDayLabel(start))} – ${tr('today')}</span>${dxTip(tr('When research came in'), esc(tr('One square a day for the last twelve months. The deeper the colour, the more sources arrived that day — a new interview or new desk research. A source counts as fresh for three months. Point at a day to see what came in. Sessions the researcher set aside count nowhere.')), 'right')}</div>
      <div class="dx-card dx-fr dx-hm" tabindex="0" aria-label="${esc(tr('Research activity by day — use the arrow keys to step through the days'))}">
        <div class="dx-fr-head" aria-live="polite"><b class="dx-fr-v">${total}</b><span class="dx-fr-unit">${esc(unit(total))}</span>
          <span class="dx-fr-when">${tr('Last 12 months')}</span><span class="dx-fr-what">${esc(nowWhat)}</span></div>
        <div class="dx-hm-scroll"><svg class="dx-hm-svg" viewBox="0 0 ${vw} ${vh}" role="img" aria-label="${esc(total + ' ' + unit(total) + ' · ' + tr('Last 12 months'))}"><g class="dx-hm-t">${months}${days}</g>${cells}</svg></div>
        <div class="dx-hm-legend">${tr('Less')}${legend}${tr('More')}</div>
      </div>
    </section>`;
}
/* pointing at a day (or ←/→ on the focused card) says what came in; back to the summary on leave */
function dxFreshWire(){
  const card = grid.querySelector('.dx-hm'); if(!card || !DX_FRESH) return;
  const F = DX_FRESH, $ = s => card.querySelector(s), head = [$('.dx-fr-v'), $('.dx-fr-unit'), $('.dx-fr-when'), $('.dx-fr-what')];
  const keep = head.map(x=> x.textContent);
  let at = null;
  const show = n=>{
    card.querySelector('.dx-hm-c.on')?.classList.remove('on');
    at = n;
    if(n == null){ head.forEach((x, k)=> x.textContent = keep[k]); return; }
    card.querySelector(`.dx-hm-c[data-n="${n}"]`)?.classList.add('on');
    const w = F.what(n), v = (w.match(/\d+/g) || []).reduce((s, x)=> s + +x, 0);
    head[0].textContent = v;
    head[1].textContent = trn(v, 'source', 'sources', 'źródło', 'źródła', 'źródeł');
    head[2].textContent = F.label(n);
    head[3].textContent = w;
  };
  const svg = $('.dx-hm-svg');
  svg.onpointerover = ev=>{ const r = ev.target.closest('.dx-hm-c'); if(r && +r.dataset.n !== at) show(+r.dataset.n); };
  svg.onpointerleave = ()=> show(null);
  card.onkeydown = ev=>{
    const step = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 }[ev.key];
    if(step){ ev.preventDefault(); show(Math.max(F.start, Math.min(F.today, at == null ? F.today : at + step))); }
    if(ev.key==='Escape') show(null);
  };
  card.onblur = ()=> show(null);
}

function renderDashboard(){
  DX_TIP = 0;
  const s = dashStats();
  pageTitle.textContent = tr('Overview');
  pageSub.textContent = '';
  grid.className = 'dash-wrap dx';
  const lastAgo = s.dates.length ? Math.floor((graphNow()-s.dates[s.dates.length-1])/86400000) : null;
  const pg = dashPersonaGrounding();
  const pgBy = {}; pg.forEach(r=> pgBy[r.id] = r);
  const cov = dashCoverage(pg, s.participants);
  const mix = dashMixVerdict(s.signals, s.evidence);
  const freshPct = s.transcripts ? Math.round(s.fresh/s.transcripts*100) : 0;
  const personas = wsEntities().filter(e=> e.type==='Persona')
    .sort((a,b)=> (/primary/i.test(b.fm.category||'') - /primary/i.test(a.fm.category||'')) || a.title.localeCompare(b.title));
  const firstName = e => e.title.split(/\s+[—–-]\s+/)[0].trim();

  const sources = s.signals + s.evidence;
  /* personas: face, one line, how solid, ask */
  const pcards = personas.map(e=>{
    const lv = personaLevel(e), r = pgBy[e.id] || {sig:0, ev:0};
    const prim = /primary/i.test(e.fm.category||'');
    return `<article class="dx-pc has-card-link${prim?' prim':''}" data-lean="4">
        <div class="dx-pc-top">${faceHtml(e, 'dx-face-md')}${prim ? `<span class="dx-tag">${tr('Primary')}</span>` : ''}</div>
        <a class="dx-pc-name card-link" href="#${esc(e.id)}">${esc(firstName(e))}<span class="dx-dot">.</span></a>
        <p class="dx-pc-desc" title="${esc(e.fm.description||'')}">${esc(e.fm.description||'')}</p>
        <div class="dx-pc-foot">
          ${levelMeter(lv, tr('Readiness score: {l} of 5 · stands on {s} heard + {e} read').replace('{l}',lv).replace('{s}',r.sig).replace('{e}',r.ev))}
          <button type="button" class="dx-btn dx-btn-sm ${prim?'dx-btn-primary':'dx-btn-line'}" data-ask="${esc(e.id)}" title="${esc(tr('Copies the line that starts the conversation — paste it into {a}, opened in this project folder').replace('{a}', pjAgentLabel(pjAgent())))}">${TALK_ICO}${tr('Ask')}</button>
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
      <div class="dx-h2row"><h2 class="dx-h2">${tr('Research health')}</h2>${dxTip(tr('Four readings'), esc(tr('None of them claims more precision than a handful of interviews can carry. Hover each ⓘ for what it means.')))}<span class="dx-spacer"></span><button type="button" class="dx-btn dx-btn-line dx-btn-sm" id="dashDlBrief" title="${esc(tr('A ready-to-edit .md brief for commissioning the next round of interviews'))}">↓ ${tr('Research agency brief')}</button></div>
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

  const fresh = dxFresh();

  grid.innerHTML = personasSec + health + fresh;

  /* wiring */
  const $ = sel => grid.querySelector(sel);
  const all = $('#dxAllPersonas'); if(all) all.onclick = ()=>{ activeType = 'Persona'; location.hash = ''; renderTabs(); updatePageHead(); };
  grid.querySelectorAll('[data-ask]').forEach(b=> b.onclick = ()=>{
    const e = ENTITIES[b.dataset.ask], agent = pjAgent(), txt = talkCommand(e, agent);
    const done = ()=> toast(tr('Copied “{t}” — paste it into {a}, opened in this project folder').replace('{t}', trim(txt, 60)).replace('{a}', pjAgentLabel(agent)));
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, ()=> fallbackCopy(txt, done));
    else fallbackCopy(txt, done);
  });
  $('#dashDlBrief').onclick = ()=> dashDownload('research-brief.md', dashBriefText(s));
  dxFreshWire();
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

