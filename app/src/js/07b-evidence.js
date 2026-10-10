/* ---------- Evidence: confirmations and folders (styles: 10c-evidence.css) ----------
   A piece of evidence is as strong as what confirms it: the Signals — our own
   interviews and tests — that cite it (their `evidences:` or a link either
   way), and the different participants behind those Signals. Counted, never
   typed in; a session the researcher set aside confirms nothing.
   Folders are topics: a tag two or more pieces share is a folder (a piece can
   sit in several). Pieces in no folder — loose finds, often added by hand —
   lie first, in "Unsorted": a pile, not a folder. A folder sits closed, opens
   a little under the pointer, and a click spreads its sheets out below,
   strongest first, under a bar of what the folder is made of. */
let EV_IDX = new Map(), EV_OPEN = null, EV_FILTER = 'all';
const evLinkIds = body => [...String(body||'').matchAll(MD_LINK)]
  .filter(m=> !/^https?:/.test(m[2])).map(m=> resolveRef(m[2])).filter(id=> id && ENTITIES[id]);
const evPeopleOf = sig => evLinkIds(sig.body).map(id=> ENTITIES[id])
  .filter(t=> t.type==='Transcript' && !isExcluded(t)).map(participantGroupId);
/* one pass over the workspace: evidence id → { sig, people, personas } */
function evidenceIndex(){
  const evs = wsEntities().filter(e=> e.type==='Evidence');
  const idx = new Map(evs.map(e=> [e.id, { sig: new Set(), people: new Set(), personas: new Set() }]));
  const byTitle = new Map(evs.map(e=> [String(e.title).toLowerCase(), e.id]));
  const confirm = (eid, sig)=>{ const r = idx.get(eid); if(!r || r.sig.has(sig.id)) return; r.sig.add(sig.id); evPeopleOf(sig).forEach(p=> r.people.add(p)); };
  wsEntities().forEach(x=>{
    if(x.type==='Signal'){
      [].concat(x.fm.evidences||[]).forEach(t=> confirm(byTitle.get(String(t).toLowerCase()), x));
      evLinkIds(x.body).forEach(id=> confirm(id, x));
    } else if(x.type==='Persona'){
      evLinkIds(x.body).forEach(id=> idx.has(id) && idx.get(id).personas.add(x.id));
    }
  });
  evs.forEach(e=> evLinkIds(e.body).forEach(id=>{ if(ENTITIES[id].type==='Signal') confirm(e.id, ENTITIES[id]); }));
  return idx;
}
const evOf = e => EV_IDX.get(e.id) || { sig: new Set(), people: new Set(), personas: new Set() };
const evStale = e => { const d = parseAnyDate(e.fm.retrieved); return !!d && (graphNow() - d.getTime()) / 86400000 > 92; };
const evSigWord = n => trn(n, 'confirming signal', 'confirming signals', 'potwierdzający sygnał', 'potwierdzające sygnały', 'potwierdzających sygnałów');
const evFromPeople = n => trn(n, 'from {n} person', 'from {n} people', 'od {n} osoby', 'od {n} osób', 'od {n} osób');
/* who stands behind a piece: our own participants only — a Signal from a
   secondary source cites it but adds nobody. Graded for the folder's bar. */
const evPeopleLine = n => n ? evFromPeople(n) : tr('Not confirmed in interviews');
const evGrade = e => { const n = evOf(e).people.size; return !n ? 'zero' : n === 1 ? 'single' : 'ok'; };
const EV_GRADES = { ok: 'Confirmed', single: 'Single source', zero: 'Not confirmed in interviews' };
/* the table's "Confirmed by" cell: the number leads, so the column sorts as numbers */
function evStrengthCell(e){
  const r = evOf(e);
  return `<span class="ev-cell"><b>${r.sig.size}</b><span class="ev-lv">${esc(evPeopleLine(r.people.size))}</span></span>`;
}
const EV_FILTERS = [
  ['all', 'All', 'Every piece of evidence in this view', ()=> true],
  ['single', 'Single source', 'Confirmed by one participant only — worth a second source before a decision leans on it', (e, r)=> r.people.size === 1],
  ['zero', 'Unconfirmed', 'Nobody we interviewed backs it yet — desk research, or a secondary source only', (e, r)=> r.people.size === 0],
  ['orphan', 'No persona yet', 'No persona stands on it — link it, or let it go', (e, r)=> !r.personas.size],
  ['stale', 'Out of date', 'Retrieved more than three months ago — re-check before relying on it', e=> evStale(e)],
];
function evTakeaway(e){
  const t = (section(e.body, 'Takeaways') || '').split('\n').map(l=> l.replace(/^\s*[-*]\s*/, '').trim()).find(l=> l && !l.startsWith('<!--'));
  return stripLinks(t || e.fm.description || (section(e.body, 'Content') || '').split('\n').find(l=> l.trim() && !l.startsWith('<!--')) || '');
}
function evFolders(list){
  const n = {}; list.forEach(e=> [].concat(e.fm.tags||[]).forEach(t=> n[t] = (n[t]||0) + 1));
  const name = t => { const s = String(t).replace(/[-_]+/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); };
  const fs = Object.keys(n).filter(t=> n[t] > 1).sort((a,b)=> n[b]-n[a] || a.localeCompare(b))
    .map(t=> ({ id: 'tag:'+t, name: name(t), items: list.filter(e=> [].concat(e.fm.tags||[]).includes(t)) }));
  const loose = list.filter(e=> ![].concat(e.fm.tags||[]).some(t=> n[t] > 1));
  if(loose.length) fs.unshift({ id: 'other', name: tr('Unsorted'), loose: true, items: loose });
  return fs;
}
function renderEvFolders(list){
  const all = [...list].sort((a,b)=> a.title.localeCompare(b.title));
  const no = new Map(all.map((e,i)=> [e.id, 'E-'+String(i+1).padStart(2,'0')]));
  const keep = EV_FILTERS.find(f=> f[0]===EV_FILTER)[3];
  const folders = evFolders(list);
  if(EV_OPEN && !folders.some(f=> f.id===EV_OPEN)) EV_OPEN = null;
  const folderHtml = f=>{
    const sig = new Set(), ppl = new Set(); f.items.forEach(e=>{ const r = evOf(e); r.sig.forEach(s=> sig.add(s)); r.people.forEach(p=> ppl.add(p)); });
    const single = f.items.filter(e=> evOf(e).people.size === 1).length;
    const open = EV_OPEN === f.id;
    return `<button type="button" class="ev-fold${open ? ' open' : ''}${f.loose ? ' loose' : ''}" data-f="${esc(f.id)}" aria-expanded="${open}">
        <i class="ev-back" aria-hidden="true"></i>
        <i class="ev-paper p1" aria-hidden="true"></i><i class="ev-paper p2" aria-hidden="true"></i>
        <span class="ev-paper p3" aria-hidden="true">${esc(f.items[0] ? f.items[0].title : '')}</span>
        <span class="ev-front">
          <span class="ev-fold-h"><b>${esc(f.name)}</b><span>${esc(trn(f.items.length, '{n} piece', '{n} pieces', '{n} dowód', '{n} dowody', '{n} dowodów'))}</span></span>
          <span class="ev-fold-n"><b>${sig.size}</b><span>${esc(evSigWord(sig.size))}<small>${esc(evFromPeople(ppl.size))}</small></span></span>
          <span class="ev-warn${f.loose ? ' loose' : single ? '' : ' ok'}">${esc(f.loose ? tr('in no topic folder yet') : single ? trn(single, '{n} on a single source', '{n} on a single source', '{n} z jednego źródła', '{n} z jednego źródła', '{n} z jednego źródła') : tr('every piece confirmed twice or more'))}</span>
        </span>
      </button>`;
  };
  const sheet = (e, i)=>{
    const r = evOf(e);
    const pers = [...r.personas].map(id=> ENTITIES[id]).filter(Boolean);
    return `<article class="ev-sheet has-card-link" style="--i:${i}">
        <div class="ev-sheet-main">
          <span class="ev-no">${no.get(e.id)}${[].concat(e.fm.tags||[]).length ? ' · ' + esc([].concat(e.fm.tags).join(' · ')) : ''}</span>
          <a class="card-link ev-title" href="#${esc(e.id)}">${esc(e.title)}</a>
          ${evTakeaway(e) ? `<p>${esc(trim(evTakeaway(e), 220))}</p>` : ''}
        </div>
        <div class="ev-strength${r.sig.size ? '' : ' zero'}">
          <b>${r.sig.size}</b><span>${esc(evSigWord(r.sig.size))}</span><small class="${r.people.size ? '' : 'none'}">${esc(evPeopleLine(r.people.size))}</small>
        </div>
        <div class="ev-foot">
          <span>${ICONS.Persona}<span>${pers.length ? `<span class="ev-foot-k">${esc(tr('Source for'))}</span> ` + pers.map(p=> `<a href="#${esc(p.id)}">${esc(p.title.split(/\s+[—–-]\s+/)[0])}</a>`).join(', ') : esc(tr('no persona yet'))}</span></span>
          ${e.fm.retrieved ? `<span>${ICONS.Evidence}${esc(tr('retrieved'))} ${esc(e.fm.retrieved)}</span>` : ''}
          ${evStale(e) ? `<span class="ev-flag warn">${esc(tr('Out of date'))}</span>` : '<span class="dx-spacer"></span>'}${rowMenuHtml('evm-'+e.id, [delItem(e.id)])}
        </div>
      </article>`;
  };
  const open = folders.find(f=> f.id===EV_OPEN);
  /* what the open folder is made of: one bar, a segment per grade, strongest first */
  const mix = open ? ['ok', 'single', 'zero'].map(k=> [k, open.items.filter(e=> evGrade(e) === k).length]).filter(x=> x[1]) : [];
  const sheets = open ? open.items.filter(e=> keep(e, evOf(e))).sort((a,b)=> evOf(b).sig.size - evOf(a).sig.size || evOf(b).people.size - evOf(a).people.size || a.title.localeCompare(b.title)) : [];
  grid.innerHTML = `<div class="ev-wrap">
      <div class="ev-chips" role="group" aria-label="${esc(tr('Show'))}">
        ${EV_FILTERS.map(([id, label, why, fn])=> `<button type="button" class="map-chip${EV_FILTER===id ? ' on' : ''}" data-ef="${id}" title="${esc(tr(why))}">${esc(tr(label))} <span class="ev-chip-n">${list.filter(e=> fn(e, evOf(e))).length}</span></button>`).join('')}
        <span class="dx-fl ev-how">${tr('Strength')}${dxTip(tr('How strong is a piece of evidence?'), esc(tr('The number is the Signals that cite it. Under it, how many different participants of your own interviews and tests stand behind them: ten signals from one person are still one person, and a secondary source adds nobody. Counted from the links, never typed in.')), 'right')}</span>
      </div>
      <div class="ev-folders">${folders.map(folderHtml).join('')}</div>
      ${open ? `<section class="ev-drawer" aria-label="${esc(open.name)}">
        <div class="ev-drawer-h"><button type="button" class="ev-close" aria-label="${esc(tr('Close the folder'))}">✕</button><h2>${esc(open.name)}</h2>
          <span>${esc(trn(open.items.length, '{n} piece', '{n} pieces', '{n} dowód', '{n} dowody', '{n} dowodów'))}</span><span class="dx-spacer"></span><span class="ev-sort">${tr('strongest first')}</span></div>
        <div class="ev-mix" role="img" aria-label="${esc(mix.map(([k, n])=> n + ' ' + tr(EV_GRADES[k])).join(', '))}">
          <div class="ev-mix-bar">${mix.map(([k, n], i)=> `<i class="${k}" style="flex-grow:${n};--i:${i}"></i>`).join('')}</div>
          <div class="ev-mix-key">${mix.map(([k, n])=> `<span><i class="${k}"></i><b>${n}</b>${esc(tr(EV_GRADES[k]))}</span>`).join('')}</div>
        </div>
        ${sheets.length ? `<div class="ev-sheets">${sheets.map(sheet).join('')}</div>` : `<p class="ev-none">${tr('Nothing in this folder matches the filter.')}</p>`}
      </section>` : ''}
    </div>`;
  const again = ()=> renderEvFolders(list);
  grid.querySelectorAll('.ev-fold').forEach(b=> b.onclick = ()=>{
    EV_OPEN = EV_OPEN === b.dataset.f ? null : b.dataset.f; again();
    if(EV_OPEN) requestAnimationFrame(()=> grid.querySelector('.ev-drawer')?.scrollIntoView({ behavior: MO_STILL.matches ? 'auto' : 'smooth', block: 'nearest' }));
  });
  grid.querySelectorAll('[data-ef]').forEach(b=> b.onclick = ()=>{ EV_FILTER = b.dataset.ef; again(); });
  grid.querySelectorAll('[data-del]').forEach(b=> b.onclick = ev=>{ ev.preventDefault(); b.closest('[popover]')?.hidePopover(); deleteEntity(b.dataset.del); });
  const x = grid.querySelector('.ev-close'); if(x) x.onclick = ()=>{ EV_OPEN = null; again(); };
}
