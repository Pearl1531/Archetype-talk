/* ---------- gallery ---------- */
const grid = document.getElementById('grid');
const countEl = document.getElementById('count');
const searchInput = document.getElementById('searchInput');
function sorted(){
  return wsEntities().sort((a,b)=>
    TYPE_ORDER.indexOf(a.type)-TYPE_ORDER.indexOf(b.type) || a.title.localeCompare(b.title));
}
let VIEW = store.get('at-view') || 'cards';
/* Each tab allows only the views that fit its data — one view = no toggle at
   all. The global VIEW preference persists; effView() resolves it per tab. */
const TYPE_VIEWS = {
  All:      ['cards'],
  Persona:  ['cards'],
  Archetype:['list'],
  Signal:   ['cards','list','table','affinity'],
  Evidence: ['cards'],
  Hypothesis: ['table'],
  IdeaForImprovement: ['list'],
  Competitor: ['map','list','compare'],
  Transcript: ['cards','list','table','hl']
};
const VIEW_BTN = { cards:'viewCardsBtn', list:'viewListBtn', table:'viewTableBtn', map:'viewMapBtn', compare:'viewCompareBtn', affinity:'viewAffinityBtn', hl:'viewHlBtn' };
function viewsFor(t){ return TYPE_VIEWS[t] || ['cards']; }
function effView(){ const a = viewsFor(activeType); return a.includes(VIEW) ? VIEW : a[0]; }
function syncViewButtons(V){
  const allowed = viewsFor(activeType);
  Object.entries(VIEW_BTN).forEach(([mode,id])=>{
    const b = document.getElementById(id);
    b.style.display = allowed.includes(mode) ? '' : 'none';
    b.classList.toggle('active', V===mode);
    b.setAttribute('aria-pressed', V===mode ? 'true' : 'false');
    if(!b.getAttribute('aria-label')) b.setAttribute('aria-label', b.title);
  });
  document.querySelector('.view-toggle').style.display = allowed.length>1 ? '' : 'none';
}
function setView(v){
  VIEW = v; store.set('at-view', v);
  renderGrid(searchInput.value);
}
/* Strength among the people we actually talked to: DISTINCT transcripts naming this
   competitor (frontmatter mentioned_in, maintained by /extract-findings — one entry per
   participant however often they said the name). Falls back to counting Signals that
   reference it when mentioned_in isn't maintained. */
function competitorMentions(c){
  if(Array.isArray(c.fm.mentioned_in)){
    const g = new Set();
    c.fm.mentioned_in.forEach(t=>{
      const id = byBasename[String(t).replace(/\.md$/i,'').toLowerCase()];
      const e = id && ENTITIES[id];
      if(e && e.type==='Transcript' && isExcluded(e)) return; // researcher retired this session
      g.add(e && e.type==='Transcript' ? participantGroupId(e) : String(t));
    });
    return g.size;
  }
  return wsEntities().filter(e =>
    e.type==='Signal' && Array.isArray(e.fm.competitors) && e.fm.competitors.includes(c.title)).length;
}
function totalTranscripts(){ return wsEntities().filter(e=>e.type==='Transcript').length; }
/* researcher's per-session kill switch (frontmatter `excluded: true`, written by
   the "Use in analysis" toggle): the file stays visible, but drops out of every
   count and out of AI analyses. Absence of the field = in use. */
function isExcluded(e){ return String(e.fm.excluded).toLowerCase()==='true'; }
async function toggleExcluded(e, exclude){
  if(!e || e.type!=='Transcript') return;
  const w = await ensureWritable(e);
  if(!w){ if(CURRENT===e.id) openDetail(e.id); return; }
  e = w;
  const md = setFmField(e.md, 'excluded', exclude
    ? 'true   # researcher decision — out of sample stats, heard-from counts and AI analyses; flip “Use in analysis” in the app to re-include'
    : null);
  if(await saveEntityText(e, md)){
    if(CURRENT===e.id) openDetail(e.id);
    toast(exclude ? 'Session excluded from analysis — stats and the AI will skip it ✓' : 'Session back in analysis ✓', {label:'Undo', fn: undoLastSave});
  }
}
/* Sessions ≠ people: a transcript may mark same_participant_as: '<earlier id>'
   (e.g. a usability test with someone already interviewed). All person-level
   counts collapse such sessions into one participant. Cycle-safe. */
function participantGroupId(e){
  const seen = new Set();
  let cur = e;
  while(cur){
    if(seen.has(cur.id)) break;
    seen.add(cur.id);
    const ref = String(cur.fm.same_participant_as||'').trim();
    if(!ref) break;
    const id = byBasename[ref.replace(/\.md$/i,'').toLowerCase()];
    const nxt = id && ENTITIES[id];
    if(!nxt || nxt.type!=='Transcript') break;
    cur = nxt;
  }
  return cur ? cur.id : e.id;
}
function distinctParticipants(){
  const g = new Set();
  wsEntities().forEach(e=>{ if(e.type==='Transcript' && !isExcluded(e)) g.add(participantGroupId(e)); });
  return g.size;
}
/* transcript freshness: >3 months = repeat the research; >1 year = don't lean on it for persona work */
function parseAnyDate(str){
  const t = String(str||'').trim(); let m;
  if(m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)) return new Date(+m[3], +m[2]-1, +m[1]);
  if(m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)) return new Date(+m[1], +m[2]-1, +m[3]);
  return null;
}
function transcriptAgeDays(e){
  const d = parseAnyDate(e.fm.date); if(!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
function staleNoteHtml(e, withAction){
  if(isExcluded(e)) return ''; // decision made — the warning's job is done
  const days = transcriptAgeDays(e);
  if(days===null || days<=92) return '';
  const act = withAction ? ` <button type="button" class="linklike stale-act" data-exclude="${e.id}">${tr('exclude from analysis')}</button>` : '';
  if(days>365) return `<div class="stale-note hard"><span>⚠</span><span>${tr('Over a year old — we don’t recommend using this session in persona work. Re-run this research; people and products have moved on.')}${act}</span></div>`;
  return `<div class="stale-note"><span>⏳</span><span>${tr('Older than 3 months — schedule a refresh round before leaning on it.')}${act}</span></div>`;
}
let FRESH_ONLY = store.get('at-fresh-only') === '1';
/* Margin of error for a proportion, with finite population correction — the same
   formula deterministic sample-size calculators use:
   MOE = z * sqrt(p(1-p)/n) * sqrt((N-n)/(N-1)),  z=1.96 (95%), p=0.5 (worst case)
   Required n for target e: n0 = z^2 p(1-p)/e^2;  n = n0 / (1 + n0/N)             */
function sampleMOE(n, N, z=1.96, pr=0.5){
  if(!(n>0) || !(N>1)) return null;
  if(n>=N) return 0;
  return z * Math.sqrt(pr*(1-pr)/n) * Math.sqrt((N-n)/(N-1));
}
function sampleNeeded(N, e=0.05, z=1.96, pr=0.5){
  const n0 = z*z*pr*(1-pr)/(e*e);
  return Math.ceil(n0 / (1 + n0/N));
}
function sampleVerdict(moePP){
  if(moePP===null) return null;
  if(moePP<=3)  return [tr('Statistically strong sample'), tr('percentages from this sample are defensible as quantitative claims — provided recruitment was random/representative, which the math cannot check for you.')];
  if(moePP<=10) return [tr('Directional at best'), tr('percentages are rough directions, not measurements. Good for prioritizing, not for reporting numbers.')];
  return [tr('Qualitative research — and that is fine'), tr('this sample tells you WHAT problems exist and WHY, not how many people have them. Never quote percentages from it.')];
}
function sampleStatsHtml(){
  const N = parseInt(String(store.get('at-population')||'').replace(/[^0-9]/g,''),10);
  const n = distinctParticipants();
  if(!N || !n) return '';
  const moe = sampleMOE(n, N); if(moe===null) return '';
  const moePP = moe*100;
  const [head, body] = sampleVerdict(moePP);
  const need = sampleNeeded(N);
  return `<div class="set-card" style="margin-top:0">
    <h3>${tr('Sample confidence:')} ${head.toLowerCase()}</h3>
    <div class="desc">${tr('<b>{n} participants</b> out of a target population of <b>{N}</b> → margin of error <b>±{moe} pp</b> at 95% confidence (worst-case p=50%). In plain terms:')
        .replace('{n}', n).replace('{N}', N.toLocaleString(LANG==='pl'?'pl-PL':'en-US')).replace('{moe}', moePP.toFixed(1))} ${body}</div>
    <div class="set-note">${tr('For ±5 pp at 95% you would need <b>~{need}</b> participants. Formula: MOE = z·√(p(1−p)/n)·√((N−n)/(N−1)), z=1.96 — same as standard sample-size calculators. Population set in Settings.')
        .replace('{need}', need.toLocaleString(LANG==='pl'?'pl-PL':'en-US'))}</div>
  </div>`;
}
function compTileHtml(c, px){
  const r = picFor(c);
  const inner = r && r.src ? `<img src="${esc(r.src)}" alt="" onerror="this.remove()">` : esc(c.title.slice(0,2));
  return `<div class="map-tile" style="width:${px}px;height:${px}px;font-size:${Math.round(px*0.32)}px">${inner}</div>`;
}
function heardBarHtml(c){
  const T = distinctParticipants(); if(!T) return '';
  const m = competitorMentions(c);
  const pct = Math.round(100*m/T);
  return `<div class="heard" title="${esc(tr('Share of the research participants (distinct transcripts) who brought this competitor up — maintained per transcript by /extract-findings'))}">
    <div class="lbl"><span>${tr('Heard from')}</span><b>${m} ${tr('of')} ${T} · ${pct}%</b></div>
    <div class="bar"><i style="width:${pct}%"></i></div></div>`;
}
