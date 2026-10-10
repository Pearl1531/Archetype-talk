/* ---------- Signals: grouped by where they came from (styles: 10e-detail-ed.css) ----------
   The Signals tab opens on its signals grouped by source — one block per
   conversation, its person, session, method and date on top — or by theme
   (the affinity group), with chips that narrow the list. Each row says what
   the signal is (title, quote, stance) and where it came from (volunteered or
   asked, a secondary source, the evidence it confirms). */
let SG_GROUP = store.get('at-sg-group') === 'theme' ? 'theme' : 'source', SG_FILTER = 'all';
const SG_FILTERS = [
  ['all', 'All', ()=> true],
  ['vol', 'Volunteered', x=> x.fm.sentiment && String(x.fm.sentiment.unprompted) === 'true'],
  ['ask', 'Asked', x=> x.fm.sentiment && String(x.fm.sentiment.unprompted) === 'false'],
  ['noev', 'No evidence yet', x=> !sgEvidence(x).length],
  ['sec', 'Secondary sources', x=> edSignalSource(x).secondary],
];
function sgEvidence(x){
  return [...new Set([...[].concat(x.fm.evidences || []).map(String), ...peLinks(x.body).filter(l=> l.e.type === 'Evidence').map(l=> l.e.title)])];
}
function sgRow(x, withSource){
  const s = edSignalSource(x), q = edQuote(x), st = x.fm.sentiment && typeof x.fm.sentiment === 'object' ? x.fm.sentiment : null;
  const unp = st && String(st.unprompted), ev = sgEvidence(x).length;
  return `<a class="sg-row" href="#${esc(x.id)}">
    <span class="sg-what"><b>${esc(x.title)}</b>${q ? `<span>“${esc(q)}”</span>` : ''}</span>
    <span class="sg-tags">
      ${withSource ? `<span class="sg-src">${s.t ? edFace(s.t, 'ed-face sm') : ''}${esc(s.secondary ? tr('secondary source') : edWho(s.t) || tr('no source'))}${s.t ? ` · <code>${esc(edTid(s.t))}</code>` : ''}</span>` : ''}
      ${st && st.stance ? `<span class="ed-chip"><b class="sg-st st-${esc(String(st.stance))}">${esc(String(st.stance).replace(/_/g, ' '))}</b>${st.feature ? ` ${esc(tr('on'))} ${esc(String(st.feature))}` : ''}</span>` : ''}
      ${unp === 'true' ? `<span class="ed-chip ink">${esc(tr('volunteered'))}</span>` : unp === 'false' ? `<span class="ed-chip">${esc(tr('asked'))}</span>` : ''}
      <span class="sg-ev${ev ? '' : ' none'}">${esc(ev ? trn(ev, '{n} evidence', '{n} evidence', '{n} dowód', '{n} dowody', '{n} dowodów') : tr('no evidence yet'))}</span>
    </span></a>`;
}
function renderSignalGroups(list){
  const keep = SG_FILTERS.find(f=> f[0] === SG_FILTER)[2];
  const shown = list.filter(keep).sort((a, b)=> a.title.localeCompare(b.title));
  const groups = new Map();
  shown.forEach(x=>{
    const s = edSignalSource(x), k = SG_GROUP === 'theme' ? (signalAffinity(x) || '') : (s.t ? s.t.id : '');
    if(!groups.has(k)) groups.set(k, []); groups.get(k).push(x);
  });
  const head = (k, xs)=>{
    if(SG_GROUP === 'theme'){
      const ts = [...new Set(xs.map(x=> edSignalSource(x).t).filter(Boolean))];
      return `<header class="sg-head"><span class="sg-ico">${ICONS.Signal}</span><span class="sg-hl"><b>${esc(k || tr('No theme yet'))}</b><small>${esc(trn(xs.length, '{n} signal', '{n} signals', '{n} sygnał', '{n} sygnały', '{n} sygnałów'))} · ${esc(trn(ts.length, 'from {n} source', 'from {n} sources', 'z {n} źródła', 'z {n} źródeł', 'z {n} źródeł'))}</small></span>
        <span class="sg-stack" tabindex="0" aria-label="${esc(tr('Sources behind this theme'))}">${ts.slice(0, 6).map(t=> edFace(t, 'ed-face')).join('')}${ts.length > 6 ? `<span class="sg-more">+${ts.length - 6}</span>` : ''}
          <span class="sg-stack-tip" role="tooltip"><b>${esc(tr('Sources behind this theme'))}</b>${ts.map(t=> `<span>${edFace(t, 'ed-face sm')}${esc(edSignalSource(xs.find(x=> edSignalSource(x).t === t)).secondary ? t.title.replace(/^\S+\s*/, '') : edWho(t))} <code>${esc(edTid(t))}</code></span>`).join('')}</span></span></header>`;
    }
    const t = ENTITIES[k], sec = xs.every(x=> edSignalSource(x).secondary);
    if(!t) return `<header class="sg-head"><span class="sg-hl"><b>${esc(tr('No source linked'))}</b><small>${esc(tr('Link the transcript in the signal’s ## Transcript section'))}</small></span></header>`;
    return `<header class="sg-head${sec ? ' secondary' : ''}">${edFace(t, 'ed-face lg')}
      <span class="sg-hl"><b>${esc(sec ? t.title.replace(/^\S+\s*/, '') : String(t.fm.participant || t.title))}</b>
        <small><code>${esc(edTid(t))}</code> · ${esc(sec ? tr('Secondary source — not our conversation') : String(t.fm.method || ''))}${t.fm.date ? ' · ' + esc(String(t.fm.date)) : ''}</small></span>
      ${isExcluded(t) ? `<span class="demo-badge exc-badge">${esc(tr('Set aside — not counted'))}</span>` : ''}
      <span class="sg-count">${esc(trn(xs.length, '{n} signal', '{n} signals', '{n} sygnał', '{n} sygnały', '{n} sygnałów'))}</span>
      <a class="sg-open" href="#${esc(t.id)}">${esc(tr('Open transcript'))}${ED_ICO.arrow}</a></header>`;
  };
  const order = [...groups.keys()].sort((a, b)=> SG_GROUP === 'theme'
    ? (groups.get(b).length - groups.get(a).length) || a.localeCompare(b)
    : (!a) - (!b) || String(ENTITIES[a]?.title || '').localeCompare(String(ENTITIES[b]?.title || '')));
  grid.className = '';
  grid.innerHTML = `<div class="sg-wrap">
    <div class="sg-bar">
      <div class="ev-chips">${SG_FILTERS.map(([id, label, fn])=> `<button type="button" class="map-chip${SG_FILTER === id ? ' on' : ''}" data-sgf="${id}" aria-pressed="${SG_FILTER === id}">${esc(tr(label))} <span class="ev-chip-n">${list.filter(fn).length}</span></button>`).join('')}</div>
      <div class="sg-seg" role="group" aria-label="${esc(tr('Group by'))}"><span>${esc(tr('Group by'))}</span>${[['source', 'Source'], ['theme', 'Theme']].map(([k, l])=> `<button type="button" data-sgg="${k}" aria-pressed="${SG_GROUP === k}">${esc(tr(l))}</button>`).join('')}</div>
    </div>
    ${order.map(k=>{ const xs = groups.get(k), t = ENTITIES[k]; return `<section class="sg-group${SG_GROUP === 'source' && t && isExcluded(t) ? ' set-aside' : ''}${SG_GROUP === 'source' && t && xs.every(x=> edSignalSource(x).secondary) ? ' secondary' : ''}">${head(k, xs)}${xs.map(x=> sgRow(x, SG_GROUP === 'theme')).join('')}</section>`; }).join('')
      || `<p class="ev-none">${esc(tr('Nothing matches this filter.'))}</p>`}
  </div>`;
  grid.querySelectorAll('[data-sgf]').forEach(b=> b.onclick = ()=>{ SG_FILTER = b.dataset.sgf; renderSignalGroups(list); });
  grid.querySelectorAll('[data-sgg]').forEach(b=> b.onclick = ()=>{ SG_GROUP = b.dataset.sgg; store.set('at-sg-group', SG_GROUP); renderSignalGroups(list); });
}
