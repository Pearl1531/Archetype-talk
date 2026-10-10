/* everything the filter can match: title + body + frontmatter VALUES (feature
   tags, participant, dates, status…) — case-insensitive. Long values (inline
   base64 pictures) are skipped so they can't produce phantom matches. */
function entitySearchText(e){
  const fmVals = Object.values(e.fm)
    .flatMap(v => Array.isArray(v) ? v : [v])
    .filter(v => typeof v === 'string' && v.length < 200);
  return (e.title + ' ' + e.body + ' ' + fmVals.join(' ')).toLowerCase();
}
function filteredList(filter){
  const f = filter.trim().toLowerCase();
  let list = sorted().filter(e =>
    (activeType==='All' || e.type===activeType) &&
    (!f || entitySearchText(e).includes(f)) &&
    !(FRESH_ONLY && activeType==='Transcript' && e.type==='Transcript' && (transcriptAgeDays(e)??0) > 92));
  // Ideas tab defaults to a Spotify-style request board: most-voted first.
  if(activeType==='IdeaForImprovement' && IDEA_SORT==='votes')
    list = list.slice().sort((a,b)=> voteCount(b)-voteCount(a) || a.title.localeCompare(b.title));
  return list;
}
let IDEA_SORT = store.get('at-idea-sort') || 'votes';   // 'votes' (board) | 'title'
function personaStats(e){
  const cfRaw = (e.body.match(/Confidence:\**\s*([^\n(]+)/i)||[])[1]||'—';
  return { cf: String(cfRaw).split(/[—(;,]/)[0].trim() };
}
/* ---------- Levels, drawn ----------
   One ladder for a persona's maturity and for the weight of one claim — the
   canonical definition is .claude/skills/ai-persona/references/levels.md, and
   nothing here re-decides it. A persona sits on the highest rung whose
   artefacts all exist; a claim is weighed by what it links to. */
function linkedEntities(md){
  const out = [];
  for(const m of md.matchAll(MD_LINK)){ const url = m[2]; if(/^https?:/.test(url)) continue; const id = resolveRef(url); if(id && ENTITIES[id]) out.push(ENTITIES[id]); }
  return out;
}
function personaLevel(e){
  const types = new Set(linkedEntities(e.body).map(x=>x.type));
  const ev = types.has('Evidence'), sig = types.has('Signal');
  const corr = /[A-Za-z]/.test(stripLinks(section(e.body,'Correlations')||''));
  if(ev && sig && corr && types.has('IdeaForImprovement') && /primary/i.test(e.fm.category||'')) return 5;
  if(ev && sig && corr) return 4;
  return sig ? 3 : ev ? 2 : 1;
}
function claimLevel(ents){
  const sigs = ents.filter(x=>x.type==='Signal'), evs = ents.filter(x=>x.type==='Evidence');
  const validated = sigs.some(s=> [].concat(s.fm.evidences||[]).filter(Boolean).length);
  if(sigs.length && (evs.length || validated)) return 4;
  return sigs.length ? 3 : evs.length ? 2 : 0;
}
const LEVEL_TEXT = {
  1: ['Assumption', 'No data behind it yet — the persona says “I don’t know”.'],
  2: ['Desk research', 'Backed by desk research only — not confirmed in interviews.'],
  3: ['Interviews', 'Heard in our own interviews — treat a single source with care.'],
  4: ['Correlated', 'Heard in interviews and backed by desk research.'],
  5: ['Ready for decisions', 'Interviews, desk research and correlations — may carry product recommendations.'],
};
/* How solid a PERSONA is — the ONE look on every persona surface (Overview
   card, Personas tab, persona page): five bars, the fifth in ember, and
   "n/5"; `named` adds the level's name, `why` replaces the hover text
   (which otherwise says what the level means). levelChip stays for claims. */
function levelMeter(n, why, named){
  const [name, mean] = LEVEL_TEXT[n];
  const bars = Array.from({length: 5}, (_, i)=> `<i class="${i < n ? (i === 4 ? 'on hot' : 'on') : ''}"></i>`).join('');
  return `<span class="lvl-meter" title="${esc(why || tr(name)+' — '+tr(mean))}"><span class="dx-lvl" aria-hidden="true">${bars}</span>${n}/5${named ? ' — '+esc(tr(name)) : ''}</span>`;
}
function levelChip(n, withName){
  const [name, why] = LEVEL_TEXT[n];
  return `<span class="lvl lvl-${n}" title="${esc('L'+n+' · '+tr(name)+' — '+tr(why))}">L${n}${withName?' · '+esc(tr(name)):''}</span>`;
}
/* Distinct research participants feeding a persona — counted from its linked
   Signals' transcript links (matching happens per transcript: every interview
   is a different person, a persona is a composite, never one person re-interviewed). */
function personaParticipants(e, excludedToo){
  const seen = new Set(), off = new Set();
  const addTranscriptsOf = body => {
    for(const m of body.matchAll(MD_LINK)){
      const url = m[2]; if(/^https?:/.test(url)) continue;
      const id = resolveRef(url);
      if(id && ENTITIES[id] && ENTITIES[id].type==='Transcript')
        (isExcluded(ENTITIES[id]) ? off : seen).add(participantGroupId(ENTITIES[id]));
    }
  };
  addTranscriptsOf(e.body);
  for(const m of e.body.matchAll(MD_LINK)){
    const url = m[2]; if(/^https?:/.test(url)) continue;
    const id = resolveRef(url);
    if(id && ENTITIES[id] && ENTITIES[id].type==='Signal') addTranscriptsOf(ENTITIES[id].body);
  }
  /* excludedToo: also say how many people stand behind the persona but are out
     of analysis — a count that silently drops them contradicts the file, which
     still names them. */
  if(excludedToo){ seen.forEach(p=>off.delete(p)); return { n: seen.size, off: off.size }; }
  return seen.size;
}
function participantsChip(e){
  const { n, off } = personaParticipants(e, true);
  const main = n ? trn(n,'{n} participant','{n} participants','{n} uczestnik','{n} uczestników','{n} uczestników') : tr('no participants yet');
  return `<span class="tag"${off?` title="${esc(tr('Excluded transcripts stay on disk but count toward nothing until you turn them back on'))}"`:''}>${main}${off?' · '+tr('+{n} excluded').replace('{n}',off):''}</span>`;
}
const demoCell = e => e.fm.demo ? '<span class="demo-badge">Demo</span>' : '';
/* the ⋯ menu's Delete, for any row whose type deleteEntity (08) knows */
const delItem = id => `<button type="button" role="menuitem" class="danger" data-del="${id}">${FI('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>')}${tr('Delete')}</button>`;
const titleCell = e => {
  const av = e.type==='Persona' ? faceHtml(e, '', e.title) : (e.type==='Archetype' ? archIconHtml(e,'sm') : (e.type==='Competitor' ? compTileHtml(e,26) : ''));
  return `<span class="td-title">${av}${esc(e.title)}</span>`;
};
/* table columns exist only for the types whose tabs actually offer a table
   view (see TYPE_VIEWS) — everything else renders as cards/list */
const TABLE_COLS = {
  Signal: [
    ['Signal', titleCell, 200],
    ['Quote / observation', e=>{ const q=firstQuote(e.body)||stripLinks(e.body.split('\n').find(l=>l.trim()&&!l.startsWith('#'))||''); return `<span class="muted">${esc(trim(q.replace(/^["“”']+|["“”']+$/g,''),110))}</span>`; }, 340],
    ['Interview', e=>esc(section(e.body,'Interview date')||'—'), 120],
    ['Evidences', e=>{ const ev=Array.isArray(e.fm.evidences)?e.fm.evidences:(e.fm.evidences?[e.fm.evidences]:[]); return ev.length? ev.map(x=>`<span class="tag">${esc(x)}</span>`).join(' ') : '<span class="muted">—</span>'; }, 220], ['', demoCell, 90]
  ],
  Hypothesis: [
    ['Hypothesis', titleCell, 440],   // If / Will live in the file (and its side panel) — as columns they were mostly empty
    ['Topic', e=> e.fm.feature? `<span class="tag">${esc(e.fm.feature)}</span>` : '<span class="muted">—</span>', 130, 'fit'],
    ['Author', authorChip, 130, 'fit'],
    ['Status', hypoStatusChip, 110, 'fit'],
    ['', e=>{   // everything you can DO with a row sits behind its ⋯ — the columns stay for content
      const g = ideaGrounding(e), canPromote = hypoStatus(e)==='open' && g.level>0;
      return demoCell(e) + rowMenuHtml('rm-'+e.id, [
        canPromote && `<button type="button" role="menuitem" data-promote="${e.id}" title="${esc(tr('Has {what} — make it a grounded Idea').replace('{what}', g.detail))}">${FI('<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>')}${tr('Promote to Idea')}</button>`,
        `<button type="button" role="menuitem" data-hedit="${e.id}">${FI('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>')}${tr('Edit')}</button>`,
        delItem(e.id),
      ], canPromote ? tr('Ready to promote to an Idea') : ''); }, 64, 'fit']
  ],
  Evidence: [   // strongest first by clicking "Confirmed by" — the cell leads with the number of confirming signals
    ['Evidence', titleCell, 380],
    ['Topic', e=> [].concat(e.fm.tags||[]).length ? [].concat(e.fm.tags).slice(0, 2).map(t=> `<span class="tag">${esc(t)}</span>`).join(' ') : '<span class="muted">—</span>', 160, 'fit'],
    ['Confirmed by', evStrengthCell, 150, 'fit'],
    ['Personas', e=>{ const p = [...evOf(e).personas].map(id=> ENTITIES[id]).filter(Boolean); return p.length ? esc(p.map(x=> x.title.split(/\s+[—–-]\s+/)[0]).join(', ')) : '<span class="muted">—</span>'; }, 180],
    ['Retrieved', e=> e.fm.retrieved ? `<span${evStale(e) ? ' class="ev-stale" title="'+esc(tr('Retrieved more than three months ago — re-check before relying on it'))+'"' : ''}>${esc(e.fm.retrieved)}</span>` : '<span class="muted">—</span>', 120, 'fit'],
    ['', e=> demoCell(e) + rowMenuHtml('rm-'+e.id, [delItem(e.id)]), 90, 'fit']
  ],
  Transcript: [
    ['Transcript', titleCell, 180],
    ['Participant', e=>esc(e.fm.participant||'—'), 240],
    ['Method', e=>esc(e.fm.method||'—'), 190],
    ['Date', e=>esc(e.fm.date||'—'), 105],
    ['Highlights', e=>{ const n=entityHighlights(e).length; return n? `<span class="tag hl-count">🖍 ${n}</span>` : '<span class="muted">—</span>'; }, 115],
    ['In analysis', e=> isExcluded(e) ? `<span class="demo-badge exc-badge">${tr('Excluded')}</span>` : '✓', 115], ['', demoCell, 90]
  ]
};
/* Airtable-style tables: columns get honest intrinsic widths (3rd element of
   each TABLE_COLS entry) instead of being squeezed to fit — the .tableview
   wrapper scrolls horizontally when the sum outgrows the viewport. Every
   header edge is a drag handle; widths persist per tab, double-click resets. */
/* stored per tab AND per set of columns: when the columns change, old widths
   and a sort by a column that moved can't land on the wrong one */
const colStoreKey = (kind, type)=> 'at-'+kind+'-'+type+':'+(TABLE_COLS[type]||[]).map(c=> c[0]).join('|');
function colWidthsFor(type){
  const defs = (TABLE_COLS[type]||[]).map(c=> c[2]||160);
  let saved={}; try{ saved = JSON.parse(store.get(colStoreKey('colw', type))||'{}'); }catch(e){}
  return defs.map((w,i)=> Math.max(60, parseInt(saved[i],10) || w));
}
function saveColWidth(type, i, w){
  let m={}; try{ m = JSON.parse(store.get(colStoreKey('colw', type))||'{}'); }catch(e){}
  if(w===null) delete m[i]; else m[i] = Math.round(w);
  store.set(colStoreKey('colw', type), JSON.stringify(m));
}
/* Notion-style column sorting: header click cycles asc → desc → off. Keys are
   type-aware — dd.mm.yyyy dates chronologically, numeric cells (votes, 🖍 3,
   participant counts) numerically, everything else case-insensitive text.
   Empty cells (—) sink to the bottom in either direction. Persisted per tab. */
function tableSortKey(raw){
  const s = String(raw).trim();
  const dm = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if(dm) return 'd:'+dm[3]+'-'+dm[2].padStart(2,'0')+'-'+dm[1].padStart(2,'0');
  const nm = s.match(/-?\d+(?:\.\d+)?/);
  if(nm && s.replace(nm[0],'').replace(/[^A-Za-z0-9]/g,'').length<=2)  // mostly-numeric cell
    return 'n:'+String(1e12+parseFloat(nm[0])).padStart(16,'0');
  return 't:'+s.toLowerCase();
}
function nextSortDir(cur){ return cur===1 ? -1 : (cur===-1 ? null : 1); }
function cellText(html){ const d=document.createElement('div'); d.innerHTML=String(html); return d.textContent.trim(); }
function tableSortState(type){ try{ return JSON.parse(store.get(colStoreKey('sort', type))||'null'); }catch(e){ return null; } }
/* Column header icons (Feather, MIT) — shown under the Apple preview */
const FI = inner => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const COL_ICONS = {
  'Hypothesis': ICONS.Hypothesis, 'Signal': ICONS.Signal, 'Competitor': ICONS.Competitor, 'Transcript': ICONS.Transcript,
  'Topic': FI('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
  'Author': ICONS.Persona,
  'Status': FI('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),
  'Quote / observation': FI('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
  'Interview': FI('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  'Evidences': ICONS.Evidence,
  'Evidence': ICONS.Evidence,
  'Confirmed by': ICONS.Signal,
  'Personas': ICONS.Persona,
  'Retrieved': FI('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  'Participant': ICONS.Persona,
  'Method': FI('<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'),
  'Date': FI('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  'Highlights': FI('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
  'In analysis': FI('<rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/>')
};
function renderTable(list){
  const cols = TABLE_COLS[activeType]; if(!cols) return;
  const type = activeType;
  const widths = colWidthsFor(type);
  const sort = tableSortState(type);
  let rows = list;
  if(sort && cols[sort.ci] && cols[sort.ci][0]){
    rows = list.map(e=>{
      const txt = cellText(cols[sort.ci][1](e));
      return { e, empty: !txt || txt==='—', key: tableSortKey(txt) };
    }).sort((A,B)=> A.empty!==B.empty ? (A.empty?1:-1)
                  : sort.dir*(A.key<B.key ? -1 : A.key>B.key ? 1 : 0))
      .map(x=>x.e);
  }
  let html = `<table style="width:${widths.reduce((a,b)=>a+b,0)}px">`
    + `<colgroup>${widths.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>`
    + '<thead><tr>' + cols.map((c,i)=>{
        const active = sort && sort.ci===i;
        const hIco = COL_ICONS[c[0]] ? `<span class="th-ico">${COL_ICONS[c[0]]}</span>` : '';
        return `<th class="${c[0]?'th-sortable':''}${active?' th-sorted':''}" data-sci="${i}" ${c[0]?`title="${esc(tr('Sort by {col} — click again to flip, third click clears').replace('{col}', cellText(tr(c[0]))))}"`:''}>`
          + `${hIco}${tr(c[0])}<span class="th-sort">${active ? (sort.dir===1?'↑':'↓') : ''}</span>`
          + `<span class="col-resize" data-ci="${i}" title="${esc(tr('Drag to resize — double-click to reset'))}"></span></th>`;
      }).join('') + '</tr></thead><tbody>';
  rows.forEach(e=>{ html += `<tr data-goto="${e.id}">` + cols.map(c=>`<td${c[3]==='fit' ? ' class="td-fit"' : ''}>${c[1](e)}</td>`).join('') + '</tr>'; });
  html += '</tbody></table>';
  grid.innerHTML = html;
  // the row opens its entity — except from its ⋯ menu, whose clicks bubble through the row
  grid.querySelectorAll('tr[data-goto]').forEach(tr=> tr.onclick = ev=>{
    if(ev.target.closest('.row-menu')) return;
    if(type==='Hypothesis') hyOpen(tr.dataset.goto); else location.hash = '#'+tr.dataset.goto;   // a bet opens in the side panel
  });
  wireVotes(grid);
  grid.querySelectorAll('[data-promote]').forEach(b=> b.onclick = ev=>{ ev.stopPropagation(); promoteHypothesis(b.dataset.promote); });
  grid.querySelectorAll('[data-hedit]').forEach(b=> b.onclick = ev=>{ ev.stopPropagation(); editHypothesis(b.dataset.hedit); });
  grid.querySelectorAll('[data-del]').forEach(b=> b.onclick = ev=>{ ev.stopPropagation(); b.closest('[popover]')?.hidePopover(); deleteEntity(b.dataset.del); });
  grid.querySelectorAll('th.th-sortable').forEach(th=> th.onclick = ev=>{
    if(ev.target.closest('.col-resize')) return;          // resizing, not sorting
    const ci = +th.dataset.sci;
    const cur = tableSortState(type);
    const dir = nextSortDir(cur && cur.ci===ci ? cur.dir : null);
    store.set(colStoreKey('sort', type), dir===null ? 'null' : JSON.stringify({ci, dir}));
    renderTable(list);
  });
  const table = grid.querySelector('table');
  const colEls = [...table.querySelectorAll('col')];
  /* "fit" columns (chips, status, the ⋯) take the width of their widest cell —
     the column fits the content, not the other way round — until the user
     drags one; a dragged width is theirs and stays. */
  let saved = {}; try{ saved = JSON.parse(store.get(colStoreKey('colw', type))||'{}'); }catch(err){}
  cols.forEach((c,i)=>{
    if(c[3]!=='fit' || saved[i]) return;
    const cells = [table.rows[0].cells[i], ...[...table.tBodies[0].rows].map(r=> r.cells[i])];
    widths[i] = Math.max(60, Math.ceil(Math.max(...cells.map(td=> td.scrollWidth))));
    colEls[i].style.width = widths[i]+'px';
  });
  table.style.width = widths.reduce((a,b)=>a+b,0)+'px';
  grid.querySelectorAll('.col-resize').forEach(h=>{
    h.addEventListener('click', ev=> ev.stopPropagation());
    h.addEventListener('dblclick', ev=>{ ev.stopPropagation(); saveColWidth(type, +h.dataset.ci, null); renderTable(list); });
    h.addEventListener('pointerdown', ev=>{
      ev.preventDefault(); ev.stopPropagation();
      const ci = +h.dataset.ci;
      const startX = ev.clientX, startW = widths[ci];
      try{ h.setPointerCapture(ev.pointerId); }catch(err){}
      document.body.classList.add('col-dragging');
      const move = e2=>{
        widths[ci] = Math.max(60, Math.round(startW + e2.clientX - startX));
        colEls[ci].style.width = widths[ci]+'px';
        table.style.width = widths.reduce((a,b)=>a+b,0)+'px';
      };
      const up = ()=>{
        h.removeEventListener('pointermove', move);
        h.removeEventListener('pointerup', up);
        document.body.classList.remove('col-dragging');
        saveColWidth(type, ci, widths[ci]);
      };
      h.addEventListener('pointermove', move);
      h.addEventListener('pointerup', up);
    });
  });
}
/* Highlights board — every ==tagged=={fragment} across the (filtered) transcripts,
   grouped by tag, with rename/merge/delete. The Transcripts-tab counterpart of
   the Signals affinity board. */
function renderHighlights(list){
  const groups=new Map(); const untagged=[]; let total=0;
  list.forEach(e=> entityHighlights(e).forEach(h=>{
    total++;
    if(!h.tags.length) untagged.push({e,h});
    h.tags.forEach(t=>{ if(!groups.has(t)) groups.set(t,[]); groups.get(t).push({e,h}); });
  }));
  if(!total){
    grid.innerHTML = `<div class="didyouknow"><div class="kicker">${tr('No highlights yet')}</div>
      <h3>${tr('The best line always jumps out. Keep it.')}</h3>
      <p>${tr('Open a transcript, drag across the words that matter, and a <b>🖍 Highlight</b> button appears. Give it a tag or two — <code>pain</code>, <code>pricing</code>, whatever fits. It saves straight into the file, so the whole team gets it on the next <code>git pull</code>, and the AI treats it as the part you wanted heard first.')}</p></div>`;
    return;
  }
  const names=[...groups.keys()].sort((a,b)=> groups.get(b).length-groups.get(a).length || a.localeCompare(b));
  const item=({e,h})=>`<div class="hl-item" data-goto="${e.id}">
      <blockquote>${esc(trim(h.text,220))}</blockquote>
      <div class="hl-item-src">${ICONS.Transcript}<span>${esc(e.title)}</span>${h.tags.map(t=>`<span class="hl-t">${esc(t)}</span>`).join('')}</div></div>`;
  let html = `<div class="hl-board-head">${trn(total,'{n} highlight','{n} highlights','{n} podświetlenie','{n} podświetlenia','{n} podświetleń')} · ${trn(names.length,'{n} tag','{n} tags','{n} tag','{n} tagi','{n} tagów')} — ${tr('select text inside any transcript to add one; tags are shared across all transcripts')}</div>`;
  html += names.map(t=>`<section class="hl-group">
      <div class="hl-group-head"><b>${esc(t)}</b><span class="n">${groups.get(t).length}</span><span class="spacer"></span>
        <button class="btn btn-ghost btn-sm" data-ren="${esc(t)}" title="${esc(tr('Rename everywhere; renaming onto an existing tag merges them'))}">${tr('Rename…')}</button>
        <button class="btn btn-ghost btn-sm" data-del="${esc(t)}" title="${esc(tr('Remove this tag from every highlight (highlights stay)'))}">${tr('Remove…')}</button></div>
      <div class="hl-cards">${groups.get(t).map(item).join('')}</div></section>`).join('');
  if(untagged.length) html += `<section class="hl-group">
      <div class="hl-group-head"><b class="muted">${tr('no tag — marked important')}</b><span class="n">${untagged.length}</span></div>
      <div class="hl-cards">${untagged.map(item).join('')}</div></section>`;
  grid.innerHTML = html;
  grid.querySelectorAll('.hl-item[data-goto]').forEach(el=> el.onclick=()=>{ location.hash='#'+el.dataset.goto; });
  grid.querySelectorAll('button[data-ren]').forEach(b=> b.onclick=ev=>{
    ev.stopPropagation();
    const t=b.dataset.ren;
    const nn=(prompt('Rename tag “'+t+'” to (typing an existing tag merges them):', t)||'').replace(/[{},]/g,'').trim();
    if(nn && nn!==t) renameTagEverywhere(t, nn);
  });
  grid.querySelectorAll('button[data-del]').forEach(b=> b.onclick=ev=>{
    ev.stopPropagation();
    const t=b.dataset.del;
    if(confirm('Remove tag “'+t+'” from all highlights?\nThe highlighted fragments stay — only the tag goes.')) renameTagEverywhere(t, '');
  });
}
/* Competitors list — review-site-style profile rows (identity + what-it-is left,
   "Research footprint" panel right). The ring is the only stat: DISTINCT
   participants who brought it up (repeats within one session count once). The
   panel's fact line is the first sentence of Market position — public data from
   the file, never an invented score. Map view untouched. */
function compIntro(c){
  // the plain paragraph between the H1 and the first ## — "what is this product"
  const m = c.body.match(/^#\s[^\n]+\n([\s\S]*?)(?=\n##\s|$)/);
  if(!m) return '';
  const line = m[1].split('\n').map(l=>l.trim()).find(l=> l && !l.startsWith('>') && !l.startsWith('<!--'));
  return line ? trim(stripLinks(line), 160) : '';
}
/* [short chip, tooltip] — the tooltip half is a sentence, so it goes through tr()
   at the render sites that show it */
const PROX_RAW = { direct:['SOM · direct','fights for the exact segment we researched'],
                   adjacent:['SAM · adjacent','same category, a segment or geo we could serve'],
                   indirect:['TAM · indirect','different product competing for the same need or time'] };
const PROX_LABEL = new Proxy(PROX_RAW, { get:(o,k)=> o[k] ? [o[k][0], tr(o[k][1])] : undefined });
function renderCompList(list){
  const T = distinctParticipants();
  const rows = [...list].sort((a,b)=> competitorMentions(b)-competitorMentions(a) || a.title.localeCompare(b.title));
  const R = 25.5, C = 2*Math.PI*R;
  grid.innerHTML = rows.map(e=>{
    const m = competitorMentions(e), pct = T ? Math.round(100*m/T) : 0;
    const prox = PROX_LABEL[String(e.fm.proximity||'').trim()];
    const tags = Array.isArray(e.fm.tags)? e.fm.tags : [];
    const unbullet = s=> s.replace(/^[-•]\s*/,'');
    const intro = compIntro(e);
    const pos = unbullet(stripLinks(section(e.body,'Market position')));
    const fact = trim(pos.split(/(?<=[.!?])\s+/)[0]||'', 180);
    const vDays = e.fm.retrieved ? (d=>d?Math.floor((graphNow()-d.getTime())/86400000):null)(parseAnyDate(e.fm.retrieved)) : null;
    const panel = String(e.fm.needs_research)==='true'
      ? `<div class="cg-wait">🔎 ${tr('Hand-added — awaiting desk research. The next AI session will offer a 1–3 year lookback before filling this profile.')}</div>`
      : `<div class="cg-ring-row">
           <svg class="cg-ring" viewBox="0 0 60 60" role="img" aria-label="Heard from ${pct}% of participants">
             <circle class="bg" cx="30" cy="30" r="${R}"/>
             <circle class="fg" cx="30" cy="30" r="${R}" stroke-dasharray="${(pct/100*C).toFixed(1)} ${C.toFixed(1)}"/>
             <text x="30" y="34.5">${pct}%</text>
           </svg>
           <div class="cg-ring-cap"><b>${tr('Heard from')}</b><span>${tr('{m} of {T} participants brought it up — repeat mentions within one session count once').replace('{m}',m).replace('{T}',T)}</span></div>
         </div>
         ${fact?`<div class="cg-fact-label">${tr('Market position')}</div><div class="cg-fact">${esc(fact)}</div>`:''}
         ${e.fm.retrieved?`<div class="cg-verified${vDays>92?' stale':''}">${FI('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>')}${tr('Verified')} ${esc(e.fm.retrieved)}${vDays>92?' — '+tr('over 3 months old, worth re-checking'):''}</div>`:''}`;
    return `<article class="card comp-g2" data-goto="${e.id}">
      <div class="cg-main">
        <div class="cg-id">${compTileHtml(e,56)}
          <div>
            <div class="cg-name">${esc(e.title)}${e.fm.demo?'<span class="demo-badge" title="Illustrative example content, not real research">Demo</span>':''}</div>
            <div class="cg-sub">${prox?`<span class="cg-prox" title="${esc(tr("Researcher's call (frontmatter proximity:)"))} — ${esc(prox[1])}">${esc(prox[0])}</span>`:''}${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
          </div>
        </div>
        ${intro?`<div class="cg-desc">${esc(intro)}</div>`:''}
      </div>
      <aside class="cg-panel">
        <div class="cg-panel-head">${tr('Research footprint')}</div>
        ${panel}
      </aside>
      <footer class="cg-foot">
        <span class="optin-note">${tr('Opt-in context — not used in persona conversations by default')}</span>
        <button type="button" class="cg-open">${tr('Open profile')}</button>
      </footer>
    </article>`;
  }).join('');
  grid.querySelectorAll('[data-goto]').forEach(el=> el.onclick = ()=>{ location.hash = '#'+el.dataset.goto; });
}
