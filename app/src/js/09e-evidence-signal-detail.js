/* ---------- Evidence and Signal pages (styles: 10e-detail-ed.css) ----------
   Both replace the plain file view with a page that answers two questions at
   a glance: what this is, and where it came from. Everything is read from the
   file and the links around it; the few things the page writes (a key figure,
   a source field, a highlight) go back into the file with Undo. The Edit
   button still opens the whole file.
   Evidence: one sentence, the source's facts, key figures, the passages the
   team marked, takeaways, what it does not settle, sources; at the side, the
   interviews that back it and the personas standing on it.
   Signal: the quote with its source under it, where in the conversation it
   was said, the stance; at the side, what it confirms and grounds, the same
   theme, and what the same person said too. */
const ED_ICO = {
  folder: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"/></svg>',
  pen: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/></svg>',
  x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 6l-12 12M6 6l12 12"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  ext: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/></svg>',
  arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};
const edSecHead = (title, tip) => `<h2 class="ed-h">${esc(tr(title))}${tip ? dxTip(tr(title), esc(tr(tip)), 'right') : ''}</h2>`;
const edLabel = (title, tip) => `<div class="ed-label"><i class="ed-ember" aria-hidden="true"></i>${esc(tr(title))}${tip ? dxTip(tr(title), esc(tr(tip)), 'right') : ''}</div>`;
const edBullets = body => (body || '').split('\n').map(l=> l.match(/^\s*[-*]\s+(.*)$/)).filter(Boolean).map(m=> m[1].trim()).filter(t=> t && !t.startsWith('<!--'));
/* the persona whose interviews a transcript is — for its face */
function edPersonOf(t){ return t && wsEntities().find(p=> p.type==='Persona' && personaTranscriptIds(p).has(t.id)) || null; }
function edFace(t, cls){
  const p = edPersonOf(t), who = t ? String(t.fm.participant || t.title).split(/[,—–(]/)[0].trim() : '?';
  return faceHtml(p, cls, p ? null : who);
}
const edWho = t => t ? String(t.fm.participant || '').split(',')[0].trim() || t.title : '';
const edTid = t => t ? t.title.split(/\s+/)[0] : '';
/* a signal's source: the transcript it links, and whether it is our conversation */
function edSignalSource(x){
  const l = peLinks(x.body).find(l=> l.e.type==='Transcript');
  const secondary = [].concat(x.fm.tags || []).some(t=> /źródło-wtórne|secondary-source/i.test(t)) || /^>\s*⚠️?.*(wtórn|secondary)/im.test(x.body);
  return { t: l ? l.e : null, anchor: l ? l.anchor : '', secondary };
}
/* a quote's translation, as the files write it: a line in brackets right under the original */
const edTrLine = l => { const m = stripLinks(l.replace(/^[>\s]+/, '')).replace(/\*+/g, '').trim().match(/^\((.+)\)$/s); return m ? m[1].trim() : ''; };
function edQuoteTr(x){
  for(const m of x.body.matchAll(/^>[ \t]?(.+)$/gm)){ const t = edTrLine(m[1]); if(t) return t; }
  return '';
}
function edQuote(x){
  const qs = [...x.body.matchAll(/^>[ \t]?(.+)$/gm)].map(m=> stripLinks(m[1]).replace(/\*+/g, '').trim()).filter(q=> q && !/^⚠/.test(q) && !/^\(.*\)$/.test(q));
  return (qs.find(q=> /^["“„«']/.test(q)) || qs[0] || '').replace(/^["“”„«']+|["“”«»']+$/g, '');
}
function edLinksIn(id){ return wsEntities().filter(x=> x.id !== id && peLinks(x.body).some(l=> l.e.id === id)); }

/* ---- evidence: key figures live in the file as a table under "## Key figures" ---- */
function edFigures(e){
  const sec = section(e.body, 'Key figures'); if(!sec) return [];
  return sec.split('\n').filter(l=> /^\s*\|/.test(l) && !/^\s*\|[\s:|-]+\|\s*$/.test(l)).slice(1)
    .map(l=> l.trim().replace(/^\||\|$/g, '').split('|').map(c=> c.trim()))
    .filter(c=> c.some(Boolean) && !/^<.*>$/.test(c[1] || ''))
    .map(c=> ({ what: c[0] || '', value: c[1] || '', who: c[2] || '', src: c[3] || '' }));
}
function edWithFigures(md, figs){
  const cell = s => String(s || '').replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ').trim();
  const table = ['| Figure | Value | Who | Source |', '|---|---|---|---|', ...figs.map(f=> `| ${cell(f.what)} | ${cell(f.value)} | ${cell(f.who)} | ${cell(f.src)} |`)].join('\n');
  const re = /(^|\n)##\s*Key figures\s*\n[\s\S]*?(?=\n##\s|$)/i;
  if(re.test(md)) return md.replace(re, `$1## Key figures\n\n${table}\n`);
  const at = md.search(/\n##\s/);   // before the first section, after the title
  return at < 0 ? md.replace(/\n*$/, `\n\n## Key figures\n\n${table}\n`) : md.slice(0, at) + `\n\n## Key figures\n\n${table}\n` + md.slice(at);
}
let ED_FIG = null;   // the figure being edited: an index, 'new', or null
async function edSaveFile(e, md, msg){
  const w = await ensureWritable(e); if(!w) return false;
  if(await saveEntityText(w, md)){ openDetail(w.id); toast(tr(msg), { label: tr('Undo'), fn: async ()=>{ await undoLastSave(); openDetail(w.id); } }); return true; }
  return false;
}

function edEvidenceHtml(e){
  const r = evidenceIndex().get(e.id) || { sig: new Set(), people: new Set(), personas: new Set() };
  const fm = e.fm, figs = edFigures(e);
  const slot = (key, hint) => `<button type="button" class="ed-add" data-fm="${key}">${ED_ICO.plus}${esc(tr('Add'))}</button>${hint ? `<span class="ed-hint">${esc(tr(hint))}</span>` : ''}`;
  const val = (key, hint) => fm[key] != null && String(fm[key]).trim() !== '' ? `<b>${esc(String(fm[key]))}</b><button type="button" class="ed-mini" data-fm="${key}" aria-label="${esc(tr('Edit'))}">${ED_ICO.pen}</button>` : slot(key, hint);
  const kind = fm.source_kind || (fm.source === 'web-research' ? 'web research' : fm.source || '');
  const primary = String(fm.primary_checked).trim();
  const stale = evStale(e);
  const cell = (label, inner) => `<div class="ed-fact"><span class="ed-fk">${esc(tr(label))}</span>${inner}</div>`;
  const figTile = (f, i) => ED_FIG === i ? edFigForm(f) : `<div class="ed-fig">
      <span class="ed-fig-acts"><button type="button" data-fig-edit="${i}" aria-label="${esc(tr('Edit this figure'))}" title="${esc(tr('Edit'))}">${ED_ICO.pen}</button><button type="button" data-fig-del="${i}" aria-label="${esc(tr('Delete this figure'))}" title="${esc(tr('Delete'))}">${ED_ICO.x}</button></span>
      <b>${esc(f.value)}</b><span>${esc(f.what)}</span><small>${esc([f.who, f.src].filter(Boolean).join(' · '))}</small></div>`;
  const content = section(e.body, 'Content'), take = edBullets(section(e.body, 'Takeaways')), limits = edBullets(section(e.body, 'Does not settle'));
  const sources = edBullets(section(e.body, 'Sources')).map(s=>{
    const m = s.match(/^\[([^\]]+)\]\(([^)]+)\)\s*[—–-]?\s*(.*)$/), url = m ? m[2] : '';
    const host = /^https?:/.test(url) ? url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : '';
    return { title: m ? m[1] : stripLinks(s), url, host, note: m ? stripLinks(m[3]) : '' };
  });
  const known = /^(key figures|content|takeaways|does not settle|sources)$/i;
  const others = [...e.body.matchAll(/^##\s+(.+)$/gm)].map(m=> m[1].trim()).filter(h=> !known.test(h));
  const sigs = [...r.sig].map(id=> ENTITIES[id]).filter(Boolean);
  const pers = [...r.personas].map(id=> ENTITIES[id]).filter(Boolean);
  const tags = [].concat(fm.tags || []);
  return `<div class="ed">
    <div class="ed-head">
      <div class="ed-kick"><span class="ed-type">${ICONS.Evidence}${esc(LANG === 'pl' ? 'Dowód' : 'Evidence')}</span>${tags.map(t=> `<span class="ed-chip">${ED_ICO.folder}${esc(t)}</span>`).join('')}${fm.demo ? `<span class="demo-badge">${esc(tr('Demo'))}</span>` : ''}</div>
      <h1 class="ed-title">${esc(e.title)}<span class="ed-stop">.</span></h1>
    </div>
    <div class="ed-grid">
      <div class="ed-main">
        <section class="ed-sec">
          ${edLabel('In one sentence', 'What this evidence says, in one plain sentence (claim: in the file). The AI reads it first when it decides which evidence to open.')}
          ${fm.claim ? `<p class="ed-claim">${esc(String(fm.claim))}<button type="button" class="ed-mini" data-fm="claim" aria-label="${esc(tr('Edit'))}">${ED_ICO.pen}</button></p>` : `<div>${slot('claim', 'e.g. Price is the most common reason people cancel a subscription')}</div>`}
          ${edLabel('About the source', 'Type: survey, report, statistics, analytics, study, community or press. Who was studied: the people the numbers are about. Source date: when the report itself came out, not when you found it. Read in the original: whether the figures were checked in the report itself rather than in articles about it. Last checked: when someone last opened the source. A dashed slot is not filled in yet.')}
          <div class="ed-facts">
            ${cell('Type of source', kind ? `<b>${esc(kind)}</b><button type="button" class="ed-mini" data-fm="source_kind" aria-label="${esc(tr('Edit'))}">${ED_ICO.pen}</button>` : slot('source_kind', 'survey, report, statistics…'))}
            ${cell('Who was studied', val('population', 'e.g. 2,000 US adults, online panel'))}
            ${cell('Source date', val('published', 'when the report came out'))}
            ${cell('Read in the original', primary === 'true' ? `<b class="ok">${esc(tr('Yes'))}</b><button type="button" class="ed-link" data-primary="false">${esc(tr('Undo'))}</button>`
              : `<b class="warn">${esc(tr(primary === 'false' ? 'Not yet' : 'Not recorded'))}</b><button type="button" class="ed-link" data-primary="true">${esc(tr('Mark as read'))}</button>`)}
            ${cell('Last checked', fm.retrieved ? `<b>${esc(String(fm.retrieved))}</b><span class="${stale ? 'warn' : 'ok'}">${esc(tr(stale ? 'out of date' : 'fresh'))}</span><button type="button" class="ed-link" data-checked="1">${esc(tr('Checked today'))}</button>` : slot('retrieved'))}
          </div>
        </section>

        <section class="ed-sec">
          ${edSecHead('Key figures', 'Every number with who it is about and where it comes from, one row each in the file, so a number is never quoted without its population.')}
          <div class="ed-figs">${figs.map(figTile).join('')}${ED_FIG === 'new' ? edFigForm({}) : `<button type="button" class="ed-fig-add" data-fig-add="1">${ED_ICO.plus}${esc(tr('Add a figure'))}</button>`}</div>
        </section>

        ${content ? `<section class="ed-sec">
          ${edSecHead('Supported quotes', 'What the source itself says, with the passages your team marked. Select a passage to highlight it, like in a Word document. Highlights are the team’s emphasis: the AI cites them first and never adds or removes one.')}
          <div class="ed-card ed-quotes hl-zone">${mdToHtml(content)}</div>
        </section>` : ''}

        ${take.length ? `<section class="ed-sec">${edSecHead('Takeaways')}<ol class="ed-take">${take.map((t, i)=> `<li><span>${String(i + 1).padStart(2, '0')}</span><div>${inline(t)}</div></li>`).join('')}</ol></section>` : ''}

        <section class="ed-limits">
          ${edLabel('What it does not settle', 'The honest limit every piece needs: what this source cannot tell you, e.g. stated intent rather than behaviour, another market, an old sample.')}
          ${limits.length ? `<ul>${limits.map(l=> `<li>${inline(l)}</li>`).join('')}</ul>` : `<p class="ed-none">${esc(tr('Not written yet.'))} <button type="button" class="ed-link" data-edit-file="1">${esc(tr('Write it'))}</button></p>`}
        </section>

        ${sources.length ? `<section class="ed-sec">${edSecHead('Sources')}<div class="ed-card ed-srcs">${sources.map(s=> `<${s.url ? `a href="${esc(s.url)}" target="_blank" rel="noopener"` : 'div'} class="ed-src"><span class="ed-src-tile">${esc((s.host || s.title).replace(/[^A-Za-z0-9]/g, '').slice(0, 2) || '·')}</span><span><b>${esc(s.title)}</b>${s.host ? `<small>${esc(s.host)}</small>` : ''}</span>${s.note ? `<span class="ed-chip">${esc(s.note)}</span>` : '<span></span>'}${s.url ? ED_ICO.ext : ''}</${s.url ? 'a' : 'div'}>`).join('')}</div></section>` : ''}

        ${others.length ? `<section class="ed-sec">${edSecHead('More in the file')}<div class="ed-card ed-more">${others.map(h=> `<h3>${esc(h)}</h3>${mdToHtml(section(e.body, h))}`).join('')}</div></section>` : ''}
      </div>

      <aside class="ed-side">
        <div class="ed-card ed-strength">
          <span class="ed-side-h">${esc(tr('Strength'))}${dxTip(tr('Strength'), esc(tr('How many signals from your own interviews and tests back this piece, and how many different people said them. Ten signals from one person are still one person, and a secondary source adds nobody. Counted from the links, never typed in.')), 'right')}</span>
          <div class="ed-big"><b>${r.sig.size}</b><span>${esc(trn(r.sig.size, 'signal', 'signals', 'sygnał', 'sygnały', 'sygnałów'))}<small class="${r.people.size ? '' : 'warn'}">${esc(evPeopleLine(r.people.size))}</small></span></div>
        </div>
        <div class="ed-card">
          <span class="ed-side-h">${esc(tr('Backed by interviews'))}</span>
          ${sigs.length ? sigs.map(x=>{ const s = edSignalSource(x); return `<a class="ed-row" href="#${esc(x.id)}">${edFace(s.t, 'ed-face')}<span><b>${esc(x.title)}</b><small>${esc(s.secondary ? tr('secondary source') : edWho(s.t))}${s.t ? ` · <code>${esc(edTid(s.t))}</code>` : ''}</small></span></a>`; }).join('')
            : `<p class="ed-none">${esc(tr('No signal cites it yet.'))}</p>`}
        </div>
        <div class="ed-card">
          <span class="ed-side-h">${esc(tr('Personas standing on it'))}</span>
          <div class="ed-people">${pers.length ? pers.map(p=> `<a class="ed-person" href="#${esc(p.id)}">${faceHtml(p, 'ed-face')}${esc(p.title.split(/\s+[—–-]\s+/)[0])}</a>`).join('') : `<p class="ed-none">${esc(tr('no persona yet'))}</p>`}</div>
        </div>
      </aside>
    </div>
  </div>`;
}
function edFigForm(f){
  const inp = (k, label, ph) => `<label>${esc(tr(label))}<input class="set-input" data-ff="${k}" value="${esc(f[k] || '')}" placeholder="${esc(tr(ph))}"></label>`;
  return `<div class="ed-fig ed-fig-form">${inp('value', 'Number', 'e.g. 43%')}${inp('what', 'What it measures', 'e.g. would cancel a “too costly” subscription')}${inp('who', 'Who it is about', 'e.g. 2,000 US adults')}${inp('src', 'Source', 'e.g. dot.LA')}
    <span class="ed-fig-btns"><button type="button" class="btn btn-primary btn-sm" data-fig-save="1">${esc(tr('Save'))}</button><button type="button" class="btn btn-ghost btn-sm" data-fig-cancel="1">${esc(tr('Cancel'))}</button></span></div>`;
}
function edEvidenceWire(root, e){
  const figs = edFigures(e);
  root.querySelectorAll('[data-fig-add]').forEach(b=> b.onclick = ()=>{ ED_FIG = 'new'; openDetail(e.id); root.querySelector('[data-ff="value"]')?.focus(); });
  root.querySelectorAll('[data-fig-edit]').forEach(b=> b.onclick = ()=>{ ED_FIG = +b.dataset.figEdit; openDetail(e.id); });
  root.querySelectorAll('[data-fig-cancel]').forEach(b=> b.onclick = ()=>{ ED_FIG = null; openDetail(e.id); });
  root.querySelectorAll('[data-fig-save]').forEach(b=> b.onclick = ()=>{
    const f = {}; root.querySelectorAll('[data-ff]').forEach(i=> f[i.dataset.ff] = i.value.trim());
    if(!f.value){ toast(tr('Write the number first')); return; }
    const next = ED_FIG === 'new' ? [...figs, f] : figs.map((x, i)=> i === ED_FIG ? f : x);
    ED_FIG = null; edSaveFile(e, edWithFigures(e.md, next), 'Key figures saved ✓');
  });
  root.querySelectorAll('[data-fig-del]').forEach(b=> b.onclick = ()=> edSaveFile(e, edWithFigures(e.md, figs.filter((_, i)=> i !== +b.dataset.figDel)), 'Figure removed'));
  /* a source field: a small inline field in place of the slot */
  root.querySelectorAll('[data-fm]').forEach(b=> b.onclick = ()=>{
    const k = b.dataset.fm, host = b.closest('.ed-fact') || b.closest('.ed-claim') || b.parentElement;
    host.innerHTML = `<input class="set-input ed-inline" value="${esc(String(e.fm[k] ?? ''))}" aria-label="${esc(k)}"><span class="ed-fig-btns"><button type="button" class="btn btn-primary btn-sm">${esc(tr('Save'))}</button><button type="button" class="btn btn-ghost btn-sm">${esc(tr('Cancel'))}</button></span>`;
    const inp = host.querySelector('input'), [ok, no] = host.querySelectorAll('button');
    inp.focus();
    const save = ()=>{ const v = inp.value.trim().replace(/'/g, '’'); edSaveFile(e, setFmField(e.md, k, v ? (k === 'retrieved' || k === 'published' ? v : `'${v}'`) : null), 'Saved ✓'); };
    ok.onclick = save; no.onclick = ()=> openDetail(e.id);
    inp.onkeydown = ev=>{ if(ev.key === 'Enter') save(); if(ev.key === 'Escape'){ ev.stopPropagation(); openDetail(e.id); } };
  });
  root.querySelectorAll('[data-primary]').forEach(b=> b.onclick = ()=> edSaveFile(e, setFmField(e.md, 'primary_checked', b.dataset.primary), 'Saved ✓'));
  root.querySelectorAll('[data-checked]').forEach(b=> b.onclick = ()=> edSaveFile(e, setFmField(e.md, 'retrieved', blToday()), 'Marked as checked today ✓'));
  root.querySelectorAll('[data-edit-file]').forEach(b=> b.onclick = ()=> document.getElementById('editBtn').click());
  root.querySelectorAll('.hl-zone mark.hl').forEach(mk=> mk.onclick = async ev=>{   // a team highlight: edit its tags or remove it
    ev.stopPropagation();
    const w = await ensureWritable(e); if(!w) return;
    const h = entityHighlights(w)[+mk.dataset.hln]; if(!h) return;
    const r = mk.getBoundingClientRect();
    openHlPop(r.left + window.scrollX, r.bottom + window.scrollY, { mode: 'edit', e: w, hln: +mk.dataset.hln, text: h.text, tags: h.tags });
  });
}

/* ---- signal ---- */
const ED_STANCE = { dealbreaker: 'said they would leave over it', resents: 'returns to it unprompted, with anger', frustrated: 'it annoys them, they live with it',
  wary: 'assumes up front it won’t work', indifferent: 'asked, and did not care', unaware: 'never encountered it', curious: 'interested, has not used it',
  appreciates: 'likes it, would not fight for it', relies_on: 'part of the routine, would notice it gone', advocates: 'recommends it unprompted', mixed: 'genuinely both ways at once' };
/* where in the conversation: the participant's turn that holds the quote (or follows the anchor), with up to two turns before it */
function edConversation(t, anchor, quote){
  if(!t) return [];
  const blocks = t.body.split(/\n\s*\n/).map(b=> b.trim()).filter(Boolean);
  const turnOf = b => { const m = b.match(/^\*\*([^*]{1,40}?):\*\*\s*([\s\S]*)$/); if(!m) return null;
    const lines = m[2].split('\n'), trl = lines.find(l=> /^\s*>/.test(l) && edTrLine(l.replace(/^\s*>\s?/, '')));
    return { who: m[1].trim(), text: lines.filter(l=> l !== trl).join(' ').trim(), trans: trl ? edTrLine(trl.replace(/^\s*>\s?/, '')) : '' }; };
  const isMod = w => /^(m|moderator|mod|interviewer|r|researcher)\b/i.test(w);
  let at = -1;
  if(anchor){ const a = blocks.findIndex(b=> new RegExp('<!--\\s*anchor:\\s*' + anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*-->').test(b));
    if(a >= 0) for(let i = a; i < blocks.length; i++){ const tt = turnOf(blocks[i].replace(/^<!--.*?-->\s*/, '')); if(tt && !isMod(tt.who)){ at = i; break; } } }
  if(at < 0 && quote){ const head = trNorm(quote).split(' ').slice(0, 6).join(' '); at = blocks.findIndex(b=> turnOf(b) && trNorm(stripLinks(b)).includes(head)); }
  if(at < 0) return [];
  const out = [];
  for(let i = at; i >= 0 && out.length < 3; i--){ const tt = turnOf(blocks[i].replace(/^<!--.*?-->\s*/, '')); if(tt) out.unshift({ ...tt, mod: isMod(tt.who), main: i === at }); }
  return out;
}
let ED_TR = false;   // translations shown on the signal page (one switch for the quote and the conversation)
const ED_COPY = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/></svg>';
const edCopyBtn = (text) => `<button type="button" class="ed-copy" data-copy="${esc(text)}" title="${esc(tr('Copy'))}" aria-label="${esc(tr('Copy'))}">${ED_COPY}</button>`;
function edSignalHtml(x){
  const s = edSignalSource(x), t = s.t, q = edQuote(x), qt = edQuoteTr(x), st = x.fm.sentiment && typeof x.fm.sentiment === 'object' ? x.fm.sentiment : null;
  const summary = (x.body.replace(/^#\s+.*\n/, '').split(/\n\s*\n/).map(b=> b.trim()).find(b=> b && !/^[>#<|-]/.test(b) && !/^\*\*/.test(b)) || '');
  const unp = st && String(st.unprompted);
  const conv = edConversation(t, s.anchor, q);
  const hasTr = !!qt || conv.some(tt=> tt.trans);
  const who = t ? (s.secondary ? t.title.replace(/^\S+\s*/, '') : edWho(t)) : '';
  /* the quoted words, marked inside the turn they were said in */
  const turnHtml = tt => {
    const plain = esc(stripLinks(tt.text.replace(HL_RE, '$1')).replace(/\*+/g, ''));
    if(!tt.main || !q) return plain;
    const a = plain.indexOf(esc(q.slice(0, 30))), tail = esc(q.slice(-20)), b = a < 0 ? -1 : plain.indexOf(tail, a);
    return b < 0 ? plain : plain.slice(0, a) + '<mark class="ed-said">' + plain.slice(a, b + tail.length) + '</mark>' + plain.slice(b + tail.length);
  };
  const spkName = tt => tt.mod ? tr('Moderator') : /^(p|participant)$/i.test(tt.who) ? edWho(t) : tt.who.replace(/\s*\((p|participant)\)$/i, '');
  const avatar = tt => tt.mod ? `<span class="ed-av mod" aria-hidden="true">M</span>`
    : (()=>{ const p = edPersonOf(t); return p ? faceHtml(p, 'ed-face sm') : `<span class="ed-av" aria-hidden="true">${esc(initialsFor(spkName(tt)).slice(0, 1) || '?')}</span>`; })();
  const evid = [...new Set([...[].concat(x.fm.evidences || []).map(ti=> byBasename[String(ti).toLowerCase()] || Object.values(ENTITIES).find(z=> z.type === 'Evidence' && z.title === ti)?.id), ...peLinks(x.body).filter(l=> l.e.type === 'Evidence').map(l=> l.e.id)])].map(id=> ENTITIES[id]).filter(Boolean);
  const grounds = edLinksIn(x.id).filter(z=> /^(Persona|Archetype|Competitor|IdeaForImprovement|Hypothesis)$/.test(z.type));
  const theme = signalAffinity(x);
  const themes = [...new Set(wsEntities().filter(z=> z.type === 'Signal').map(signalAffinity).filter(Boolean))].sort();
  const same = theme ? wsEntities().filter(z=> z.type === 'Signal' && z.id !== x.id && signalAffinity(z) === theme) : [];
  const also = t ? wsEntities().filter(z=> z.type === 'Signal' && z.id !== x.id && edSignalSource(z).t === t) : [];
  const row = (z, sub) => `<a class="ed-row" href="#${esc(z.id)}"><span class="ed-kind">${esc(tr(z.meta.singular))}</span><span><b>${esc(z.title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></a>`;
  return `<div class="ed${ED_TR ? ' show-tr' : ''}">
    <div class="ed-head">
      <div class="ed-kick"><span class="ed-type">${ICONS.Signal}${esc(tr('Signal'))}</span>
        <span class="ed-theme">${theme ? `<button type="button" class="ed-chip ed-theme-btn" data-theme-edit="1" title="${esc(tr('Change the theme'))}">${esc(theme)}${ED_ICO.pen}</button>`
          : `<button type="button" class="ed-add ed-theme-add" data-theme-edit="1">${ED_ICO.plus}${esc(tr('Add a theme'))}</button><span class="ed-hint">${esc(tr('groups it with similar signals'))}</span>`}
          <datalist id="edThemes">${themes.map(n=> `<option value="${esc(n)}">`).join('')}</datalist></span>
        ${x.fm.demo ? `<span class="demo-badge">${esc(tr('Demo'))}</span>` : ''}</div>
      <h1 class="ed-title">${esc(x.title)}<span class="ed-stop">.</span></h1>
      ${summary ? `<p class="ed-summary">${inline(summary)}</p>` : ''}
    </div>
    <div class="ed-grid">
      <div class="ed-main">
        <section class="ed-card ed-quote">
          ${q ? `<div class="ed-q-tools">${hasTr ? `<button type="button" class="ed-link" data-tr-toggle="1">${esc(tr(ED_TR ? 'Hide translation' : 'Show translation'))}</button>` : ''}${edCopyBtn(`“${q}”${who ? ' — ' + who : ''}`)}</div>
            <blockquote><span>“</span>${esc(q)}<span>”</span></blockquote>${qt ? `<p class="ed-tr ed-q-tr">${esc(qt)}</p>` : ''}`
            : `<p class="ed-none">${esc(tr('No quote in this signal — an observation.'))}</p>`}
          <div class="ed-sig${s.secondary ? ' secondary' : ''}">
            ${t ? edFace(t, 'ed-face lg') : ''}
            <span class="ed-sig-who"><b>${esc(s.secondary ? tr('Secondary source — not our conversation') : (t ? String(t.fm.participant || t.title) : tr('Source not linked')))}</b>
              ${t ? `<small><code>${esc(edTid(t))}</code> · ${esc(s.secondary ? t.title.replace(/^\S+\s*/, '') : String(t.fm.method || ''))}${t.fm.date ? ' · ' + esc(String(t.fm.date)) : ''}</small>` : ''}</span>
            ${unp === 'true' ? `<span class="ed-chip ink">${esc(tr('volunteered'))}</span>` : unp === 'false' ? `<span class="ed-chip">${esc(tr('asked by the moderator'))}</span>` : ''}
            ${t ? `<button type="button" class="btn btn-primary btn-sm ed-open" data-open-moment="${esc(t.id)}">${esc(tr('Go to the quote'))}${ED_ICO.arrow}</button>` : ''}
          </div>
        </section>

        ${conv.length ? `<section class="ed-sec">${edSecHead('In the conversation')}<div class="ed-card ed-conv">${conv.map(tt=> `<span class="ed-spk${tt.mod ? ' mod' : ''}">${avatar(tt)}<b>${esc(spkName(tt))}</b></span>
          <span class="ed-turn${tt.main ? '' : ' dim'}">${turnHtml(tt)}${tt.trans ? `<span class="ed-tr">${esc(tt.trans)}</span>` : ''}${tt.mod ? '' : edCopyBtn(`${stripLinks(tt.text).replace(/\*+/g, '').trim()} — ${spkName(tt)}`)}</span>`).join('')}</div></section>` : ''}

        ${st && st.stance ? `<section class="ed-card ed-stance">
          <span class="ed-fk">${esc(tr('Stance'))}</span>
          <div><b class="st-${esc(String(st.stance))}">${esc(String(st.stance).replace(/_/g, ' '))}</b><span>${st.feature ? `${esc(tr('on'))} <b>${esc(String(st.feature))}</b> — ` : ''}${esc(tr(ED_STANCE[st.stance] || ''))}</span>
            ${st.because ? `<span class="ed-because">${esc(tr('because'))} ${esc(String(st.because))}</span>` : ''}
            ${unp === 'false' ? `<small>${esc(tr('Asked directly, so the attitude is real but how much it matters may be inflated.'))}</small>` : ''}</div>
        </section>` : ''}
      </div>
      <aside class="ed-side">
        <div class="ed-card"><span class="ed-side-h">${esc(tr('Confirms'))}</span>${evid.length ? evid.map(z=>{ const r = evidenceIndex().get(z.id); return row(z, r ? `${r.sig.size} ${evSigWord(r.sig.size)} · ${evPeopleLine(r.people.size)}` : ''); }).join('') : `<p class="ed-none">${esc(tr('No evidence linked yet.'))}</p>`}</div>
        ${grounds.length ? `<div class="ed-card"><span class="ed-side-h">${esc(tr('Grounds'))}</span>${grounds.map(z=> row(z)).join('')}</div>` : ''}
        ${same.length ? `<div class="ed-card"><span class="ed-side-h">${esc(tr('Same theme'))}</span>${same.map(z=> row(z, edWho(edSignalSource(z).t))).join('')}</div>` : ''}
        ${also.length ? `<div class="ed-card"><span class="ed-side-h">${esc(tr('Same source also said'))}</span>${also.map(z=> row(z)).join('')}</div>` : ''}
      </aside>
    </div>
  </div>`;
}
/* copy a quote: the words and who said them, nothing else */
function edCopy(text){
  const done = ()=> toast(tr('Quote copied ✓'));
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, ()=> fallbackCopy(text, done)); else fallbackCopy(text, done);
}
function edSignalWire(root){
  const x = ENTITIES[CURRENT];
  root.querySelectorAll('[data-open-moment]').forEach(b=> b.onclick = ()=>{ TR_FOCUS = CURRENT; location.hash = '#' + b.dataset.openMoment; });
  root.querySelectorAll('[data-copy]').forEach(b=> b.onclick = ()=> edCopy(b.dataset.copy));
  root.querySelectorAll('[data-tr-toggle]').forEach(b=> b.onclick = ()=>{ ED_TR = !ED_TR; root.querySelector('.ed').classList.toggle('show-tr', ED_TR); b.textContent = tr(ED_TR ? 'Hide translation' : 'Show translation'); });
  /* the theme: a researcher's pick, so it is written locked (affinity_lock) and no AI regrouping moves it */
  root.querySelectorAll('[data-theme-edit]').forEach(b=> b.onclick = ()=>{
    const host = b.closest('.ed-theme');
    host.innerHTML = `<input class="set-input ed-theme-in" list="edThemes" value="${esc(signalAffinity(x))}" placeholder="${esc(tr('Theme, e.g. Pricing & value'))}" aria-label="${esc(tr('Theme'))}"><button type="button" class="btn btn-primary btn-sm">${esc(tr('Save'))}</button><button type="button" class="btn btn-ghost btn-sm">${esc(tr('Cancel'))}</button>${host.querySelector('datalist').outerHTML}`;
    const inp = host.querySelector('input'), [ok, no] = host.querySelectorAll('button');
    inp.focus();
    const save = ()=>{ const v = inp.value.trim().replace(/'/g, '’'); let md = setFmField(x.md, 'affinity', `'${v}'`); md = setFmField(md, 'affinity_lock', v ? 'true' : null); edSaveFile(x, md, v ? 'Theme saved ✓' : 'Theme removed'); };
    ok.onclick = save; no.onclick = ()=> openDetail(x.id);
    inp.onkeydown = ev=>{ if(ev.key === 'Enter') save(); if(ev.key === 'Escape'){ ev.stopPropagation(); openDetail(x.id); } };
  });
}
let TR_FOCUS = null;   // a signal to scroll to once its transcript opens (09d)

/* highlights in the evidence text: the transcript's selection flow, on this page's text */
document.addEventListener('mouseup', ev=>{
  const zone = ev.target.closest && ev.target.closest('.hl-zone'); if(!zone) return;
  setTimeout(()=>{
    const e = ENTITIES[CURRENT]; if(!e || e.type !== 'Evidence' || EDITING) return;
    if(hlPopEl && hlPopEl.style.display !== 'none') return;
    const sel = window.getSelection(); if(!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0); if(!zone.contains(range.commonAncestorContainer)) return;
    const norm = sel.toString().replace(/\s+/g, ' ').trim(); if(norm.length < 3) return;
    const pre = document.createRange(); pre.selectNodeContents(zone); pre.setEnd(range.startContainer, range.startOffset);
    const pat = new RegExp(norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'), 'g');
    const before = stripLinks(e.body.split(/\n##\s*Content\s*\n/i)[0] || '');   // matches above the text count too
    const occ = (pre.toString().match(pat) || []).length + (before.match(pat) || []).length;
    const r = range.getBoundingClientRect();
    openHlPop(r.left + window.scrollX, r.bottom + window.scrollY, { mode: 'new', e, selText: norm, occ, tags: [] });
  }, 0);
});
