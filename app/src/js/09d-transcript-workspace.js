/* ---------- a transcript as a working surface (Condens-inspired, 2026-10) ----------
   The interview on the left, read turn by turn: who spoke, the sections the
   file bookmarks with <!-- anchor: … -->, the team's ==highlights== in their
   tag colours, and under each passage the Signals extracted from it. A pane
   on the right answers "what came out of this session": Signals ·
   Highlights · Summary. Hovering a Signal lights its passage and the other
   way round.

   Nothing here writes: highlights are still made by selecting text (14-…),
   and Signals still come from /extract-findings — this page only shows the
   trail. AI never adds a highlight (CLAUDE.md: human-curated). */
const TR_TAG_COLORS = [   // ground, ink — differ in lightness as well as hue
  ['#FFD9C4', '#8A2E00'], ['#E4DCFF', '#3F2D8F'], ['#CDEFDB', '#1D5C38'], ['#D4E6FB', '#1E4F86'],
  ['#F7E2B5', '#6E4A00'], ['#F6D5E8', '#7A1F55'], ['#DDE7C7', '#45561A'], ['#E3E1DC', '#3D3A34'],
];
let TR_TAB = 'signals', TR_TAG = null, TR_LAST = null;   // tab and tag filter last while you stay on one transcript
/* the section a passage sits in — the nearest bookmark above it */
function trSecOf(t){ let n = t && t.previousElementSibling; while(n && !n.classList.contains('md-anchor')) n = n.previousElementSibling; return n ? (n.querySelector('b') ? n.querySelector('b').textContent : trAnchorLabel(n.dataset.anchor)) : ''; }
const trAnchorLabel = a => a.replace(/[-_]+/g, ' ').replace(/^./, c=> c.toUpperCase());
const trNorm = s => String(s||'').toLowerCase().replace(/[“”"‘’'…().,!?:;—–-]/g, ' ').replace(/\s+/g, ' ').trim();

/* the tags of this file, in the order the file declares them */
function trTags(e){
  const seen = [];
  [].concat(e.fm.highlight_tags||[]).forEach(t=>{ t = String(t).trim(); if(t && !seen.includes(t)) seen.push(t); });
  entityHighlights(e).forEach(h=> h.tags.forEach(t=>{ if(!seen.includes(t)) seen.push(t); }));
  return seen;
}
/* the Signals that cite this session, with where they point */
function trSignals(e){
  return wsEntities().filter(x=> x.type==='Signal').map(x=>{
    const l = peLinks(x.body).find(l=> l.e.id===e.id);
    if(!l) return null;
    const qs = [...x.body.matchAll(/^>\s?(.+)$/gm)].map(m=> stripLinks(m[1]).replace(/\*+/g,'').trim()).filter(Boolean);
    const warn = qs.find(q=> /^⚠/.test(q));
    const said = qs.find(q=> /^["“„«']/.test(q)) || qs.find(q=> !/^⚠/.test(q) && !/^\(/.test(q)) || '';
    return { x, anchor: l.anchor, quote: said.replace(/^["“”„«']+|["“”«»']+$/g,''),
      secondary: !!warn && /wtórn|secondary/i.test(warn),   // a public statement, not our interview — say so on the card
      stance: x.fm.sentiment && x.fm.sentiment.stance };
  }).filter(Boolean);
}

function transcriptWorkspace(e){
  const samePage = TR_LAST === e.id;   // a re-render of the transcript you are on (a save, an undo) keeps tab, filter and pane scroll
  if(!samePage){ TR_LAST = e.id; TR_TAB = 'signals'; TR_TAG = null; }
  const doc = document.getElementById('doc'), body = document.getElementById('pBody');
  const tags = trTags(e), color = t => TR_TAG_COLORS[Math.max(0, tags.indexOf(t)) % TR_TAG_COLORS.length];
  /* the observer notes belong to the summary, not the dialogue */
  let notes = '';
  const oh = [...doc.querySelectorAll('h2')].find(h=> /^(observer notes|notatki obserwatora|uwagi obserwatora)/i.test(h.childNodes[0] ? h.childNodes[0].textContent.trim() : h.textContent.trim()));
  if(oh){
    let n = oh.nextElementSibling; const take = [];
    while(n && n.tagName!=='H2'){ take.push(n); n = n.nextElementSibling; }
    notes = take.map(x=> x.outerHTML).join('');
    take.forEach(x=> x.remove()); oh.remove();
  }
  /* the file's own ## sections become bookmarks, like <!-- anchor --> ones:
     a title (and its timestamp, when the heading carries one) on a hairline */
  const slug = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  doc.querySelectorAll(':scope > h2').forEach(h=>{
    const txt = (h.childNodes[0] ? h.childNodes[0].textContent : h.textContent).trim();
    const m = txt.match(/^(.*?)\s*\(([\d:–\-\s]+)\)\s*$/);
    const b = document.createElement('div');
    b.className = 'md-anchor tr-anchor tr-sec'; b.dataset.anchor = slug(txt);
    b.innerHTML = `<span>${ICONS_TR.hash}<b>${esc(m ? m[1] : txt)}</b>${m ? `<i>${esc(m[2])}</i>` : ''}</span>`;
    h.replaceWith(b);
  });
  /* who the participant is: the label of the first non-moderator turn ("Emma (P)") */
  const isMod = s => /^(m|moderator|mod|interviewer|r|researcher)\b/i.test(s.trim());
  let who = '';
  const label = p => { const s = p.firstElementChild;
    return s && s.tagName==='STRONG' && p.firstChild===s && /:\s*$/.test(s.textContent) && p.textContent.trim().length > s.textContent.trim().length
      ? s.textContent.replace(/:\s*$/,'').trim() : ''; };
  const said = {}; doc.querySelectorAll(':scope > p').forEach(p=>{ const l = label(p); if(l) said[l] = (said[l]||0) + 1; });
  const speaker = l => l && l.length <= 40 && (said[l] > 1 || isMod(l) || /\((p|participant)\)$/i.test(l));
  /* turns: "**Name:** text" → speaker column + text */
  doc.querySelectorAll(':scope > p').forEach(p=>{
    const s = p.firstElementChild;
    if(!speaker(label(p))) return;
    let name = label(p);
    const mod = isMod(name);
    if(!mod){ const m = name.match(/^(.+?)\s*\((p|participant)\)$/i); if(m) who = m[1]; if(/^p$|^participant$/i.test(name) && who) name = who; else if(m) name = m[1]; }
    if(mod) name = tr('Moderator');
    s.remove();
    const turn = document.createElement('div');
    turn.className = 'tr-turn' + (mod ? ' tr-mod' : '');
    turn.innerHTML = `<div class="tr-spk">${esc(name)}</div><div class="tr-txt"></div>`;
    p.replaceWith(turn); turn.querySelector('.tr-txt').appendChild(p);
  });
  if(!doc.querySelector('.tr-turn') && doc.querySelector('.md-anchor')){
    const guest = String(e.fm.participant||'').split(/\s+[—–-]\s+|,/)[0].trim() || tr('Guest');
    let started = false;
    [...doc.children].forEach(n=>{
      if(n.classList.contains('md-anchor')){ started = true; return; }
      if(!started || !/^(BLOCKQUOTE|P|UL)$/.test(n.tagName)) return;
      const q = n.tagName==='BLOCKQUOTE';
      const turn = document.createElement('div');
      turn.className = 'tr-turn' + (q ? '' : ' tr-mod tr-note');
      turn.innerHTML = `<div class="tr-spk">${esc(q ? guest : tr('Context'))}</div><div class="tr-txt"></div>`;
      n.replaceWith(turn); turn.querySelector('.tr-txt').appendChild(n);
    });
  }
  /* what follows a turn — a translation in a quote, a line of narration, a
     list — belongs to it, until the next turn, rule, heading or bookmark */
  doc.querySelectorAll('.tr-turn').forEach(t=>{
    let n = t.nextElementSibling;
    while(n && !n.classList.contains('tr-turn') && !n.classList.contains('md-anchor') && !/^(HR|H1|H2|H3)$/.test(n.tagName)){
      const nx = n.nextElementSibling; t.querySelector('.tr-txt').appendChild(n); n = nx;
    }
  });
  /* section bookmarks */
  doc.querySelectorAll('.md-anchor:not(.tr-sec)').forEach(a=>{
    a.classList.add('tr-anchor');
    a.innerHTML = `<span>${ICONS_TR.hash}${esc(trAnchorLabel(a.dataset.anchor))}</span>`;
  });
  doc.querySelectorAll(':scope > hr').forEach(h=>{ const n = h.nextElementSibling; if(!n || n.tagName==='H2' || n.classList.contains('md-anchor')) h.remove(); });
  /* highlights in their tag colour */
  doc.querySelectorAll('mark.hl').forEach(mk=>{
    const ts = [...mk.querySelectorAll('.hl-t')].map(t=> t.textContent.trim());
    const [bg, fg] = color(ts[0]);
    mk.style.setProperty('--hl-bg', bg); mk.dataset.tags = ts.join(' ');
    mk.querySelectorAll('.hl-t').forEach(t=>{ const [b2, f2] = color(t.textContent.trim()); t.style.setProperty('--t-bg', b2); t.style.setProperty('--t-fg', f2); });
  });
  /* Signals under the passage they came from: the turn right after their
     anchor; when the anchor is not in the file, the turn that holds the
     opening words of their quote. One that matches neither stays in the pane. */
  const sigs = trSignals(e);
  const turns = [...doc.querySelectorAll('.tr-turn')];
  sigs.forEach((s,i)=>{
    let t = null;
    const a = s.anchor && doc.querySelector(`.md-anchor[data-anchor="${CSS.escape(s.anchor)}"]`);
    if(a){ let n = a.nextElementSibling; while(n && !n.classList.contains('tr-turn')) n = n.nextElementSibling;
      // the anchor sits before the moderator's question — the answer is the next participant turn
      while(n && n.classList.contains('tr-mod')){ const nx = n.nextElementSibling; if(nx && nx.classList.contains('tr-turn')) n = nx; else break; }
      t = n; }
    if(!t && s.quote){ const head = trNorm(s.quote).split(' ').slice(0,6).join(' '); t = turns.find(x=> trNorm(x.textContent).includes(head)) || null; }
    s.turn = t; s.i = i;
    // "Open at this moment" on a signal: once the turn it lands on is the one on screen (a page can render twice)
    if(t && TR_FOCUS === s.x.id) setTimeout(()=>{ if(!t.isConnected || TR_FOCUS !== s.x.id) return; TR_FOCUS = null; t.scrollIntoView({ block: "center" }); t.classList.add("tr-focus"); }, 60);
    if(t){
      t.dataset.sig = (t.dataset.sig ? t.dataset.sig+' ' : '') + i;
      let row = t.querySelector('.tr-sigs'); if(!row){ row = document.createElement('div'); row.className = 'tr-sigs'; t.querySelector('.tr-txt').appendChild(row); }
      row.insertAdjacentHTML('beforeend', `<button type="button" class="tr-sig" data-sig="${i}">${ICONS.Signal}<span>${tr('Signal')} · ${esc(s.x.title)}</span></button>`);
    }
  });
  // the pane reads in the order of the conversation; one whose passage was not found goes last
  const ordered = sigs.slice().sort((a,b)=> (a.turn ? turns.indexOf(a.turn) : 1e9) - (b.turn ? turns.indexOf(b.turn) : 1e9));
  /* sections no Signal cites yet — a pointer for the next extraction pass */
  const gaps = [...doc.querySelectorAll('.md-anchor')].filter(a=>{
    let n = a.nextElementSibling;
    while(n && !n.classList.contains('md-anchor')){ if(n.dataset && n.dataset.sig) return false; n = n.nextElementSibling; }
    return true;
  }).map(a=> a.dataset.anchor);

  /* ---- the transcript's own sheet: find + tags on top, the dialogue under ---- */
  let main = document.getElementById('trMain');
  if(!main){ main = document.createElement('div'); main.id = 'trMain'; main.className = 'tr-main'; }
  if(main.parentNode !== body) body.insertBefore(main, doc.parentNode === body ? doc : null);
  main.append(document.getElementById('docTools'));
  /* ---- the pane ---- */
  const hls = entityHighlights(e);
  let pane = document.getElementById('trPane');
  if(!pane){ pane = document.createElement('aside'); pane.id = 'trPane'; pane.className = 'tr-pane'; body.appendChild(pane); }
  pane.style.display = '';
  const tabBtn = (k, label, n) => `<button type="button" role="tab" data-trtab="${k}" aria-selected="${TR_TAB===k}">${tr(label)}${n!=null?`<span class="n">${n}</span>`:''}</button>`;
  const card = s => `<div class="tr-card" data-sig="${s.i}">
      <div class="tr-card-h">${ICONS.Signal}<a class="xref" data-goto="${s.x.id}">${esc(s.x.title)}</a>${s.stance?`<span class="tr-stance">${esc(tr(s.stance))}</span>`:''}<a class="tr-open" data-goto="${s.x.id}" title="${esc(tr('Open the signal'))}" aria-label="${esc(tr('Open the signal'))}">${ICONS_TR.arrow}</a></div>
      ${s.secondary ? `<span class="tr-second" title="${esc(tr('A public statement collected as a secondary source — not an observation from an interview we ran'))}">${tr('Secondary source')}</span>` : ''}
      ${s.quote ? `<p>“${esc(s.quote)}”</p>` : ''}
      <div class="tr-card-m">${s.turn ? `<button type="button" class="tr-jump" data-sig="${s.i}">${ICONS_TR.hash}${esc(s.anchor && doc.querySelector(`.md-anchor[data-anchor="${CSS.escape(s.anchor)}"]`) ? trAnchorLabel(s.anchor) : trSecOf(s.turn) || tr('Go to passage'))}</button>` : `<span class="tr-miss" title="${esc(tr('The link points to an anchor this file does not have, and the quote was not found word for word'))}">${tr('passage not found')}</span>`}</div>
    </div>`;
  const tagChip = t => { const [b,f] = color(t); return `<span class="tr-tag" style="--t-bg:${b};--t-fg:${f}">${esc(t)}</span>`; };
  const extract = isExcluded(e) ? '' : `<button type="button" class="tr-more" data-tract="extract">${ICONS_TR.spark}${tr('Extract more findings')}</button>`;
  const panes = {
    signals: `<div class="tr-lead">${tr('Findings extracted from this session')}${dxTip(tr('Signals'), tr('A Signal is one observation from a real interview, filed by /extract-findings. Each one cites the passage it came from — hover a card to see it in the transcript.'), 'right')}</div>
      ${sigs.length ? ordered.map(card).join('') : `<div class="tr-empty">${tr('Nothing extracted from this session yet.')}</div>`}${extract}`,
    highlights: `<div class="tr-lead">${tr('The team’s emphasis in this session')}${dxTip(tr('Highlights'), tr('Highlights are curated by people. AI reads them first when it extracts, but never adds, removes or retags one — select text in the transcript to make your own.'), 'right')}</div>
      ${hls.length ? hls.map((h,n)=> `<div class="tr-hl${TR_TAG && !h.tags.includes(TR_TAG) ? ' dim' : ''}" data-hln="${n}" style="--t-bg:${color(h.tags[0])[0]}">
          <button type="button" class="tr-hl-go" data-hljump="${n}" title="${esc(tr('Show it in the transcript'))}"><span>“${esc(h.text)}”</span>${h.tags.length ? `<span class="tr-hl-tags">${h.tags.map(tagChip).join('')}</span>` : ''}</button>
          <button type="button" class="tr-hl-x" data-hlrm="${n}" title="${esc(tr('Remove highlight'))}" aria-label="${esc(tr('Remove highlight'))}">${ICONS_TR.x}</button>
        </div>`).join('')
        : `<div class="tr-empty">${tr('No highlights yet — select a passage in the transcript to make the first one.')}</div>`}`,
    summary: `${e.fm.abstract ? `<section><h4>${tr('Abstract')}${dxTip(tr('Abstract'), tr('The scan header from the file’s frontmatter — written at extraction so you can triage a session without opening it. A summary, never a source: cite the passage, not this line.'), 'right')}</h4><p>${esc(String(e.fm.abstract))}</p></section>` : ''}
      ${[].concat(e.fm.topics||[]).length ? `<section><h4>${tr('Topics')}</h4><div class="tr-chips">${[].concat(e.fm.topics).map(t=> `<span class="tr-chip">${esc(t)}</span>`).join('')}</div></section>` : ''}
      ${gaps.length ? `<section><h4>${tr('Not yet a finding')}${dxTip(tr('Not yet a finding'), tr('Sections of this session no Signal cites yet. Not a verdict that they are empty — a pointer for the next /extract-findings pass.'), 'right')}</h4>${gaps.map(g=>{ const a = doc.querySelector(`.md-anchor[data-anchor="${CSS.escape(g)}"]`); const l = a && a.querySelector('b') ? a.querySelector('b').textContent : trAnchorLabel(g);
        return `<button type="button" class="tr-gap" data-anchor="${esc(g)}">${ICONS_TR.hash}${esc(l)}</button>`; }).join('')}</section>` : ''}
      ${notes ? `<section><h4>${tr('Observer notes')}</h4><div class="tr-notes">${notes}</div></section>` : ''}
      ${[].concat(e.fm.mentions_competitors||[]).length ? `<section><h4>${tr('Mentions')}</h4><div class="tr-chips">${[].concat(e.fm.mentions_competitors).map(c=>{ const id = byBasename[String(c).toLowerCase()]; return id ? `<a class="tr-chip xref" data-goto="${id}">${esc(c)} ↗</a>` : `<span class="tr-chip">${esc(c)}</span>`; }).join('')}</div></section>` : ''}`,
  };
  const keepPane = pane.querySelector('.tr-pane-body') && samePage ? pane.querySelector('.tr-pane-body').scrollTop : 0;
  const draw = ()=>{
    pane.innerHTML = `<div class="tr-tabs" role="tablist">${tabBtn('signals','Signals',sigs.length)}${tabBtn('highlights','Highlights',hls.length)}${tabBtn('summary','Summary')}</div>
      <div class="tr-pane-body">${panes[TR_TAB]}</div>`;
    pane.querySelectorAll('a[data-goto]').forEach(a=> a.onclick = ev=>{ ev.preventDefault(); location.hash = '#'+a.dataset.goto; });
    wirePeek(pane);
  };
  // the highlights pane re-reads the filter, so it is rebuilt with it
  const rebuildHl = ()=>{ panes.highlights = panes.highlights.replace(/class="tr-hl( dim)?" data-hln="(\d+)"/g, (m, d, n)=> `class="tr-hl${TR_TAG && !hls[+n].tags.includes(TR_TAG) ? ' dim' : ''}" data-hln="${n}"`); };
  draw();
  pane.querySelector('.tr-pane-body').scrollTop = keepPane;

  /* ---- the toolbar row: tag filter + how to highlight ---- */
  let bar = document.getElementById('trTagBar');
  if(!bar){ bar = document.createElement('div'); bar.id = 'trTagBar'; bar.className = 'tr-tagbar'; }
  document.getElementById('docTools').after(bar); main.append(doc);
  bar.style.display = '';
  const drawBar = ()=>{
    bar.innerHTML = (tags.length ? `<button type="button" class="tr-tagbtn${TR_TAG?'':' on'}" data-trtag="">${tr('All highlights')}</button>`
      + tags.map(t=>{ const [b] = color(t); return `<button type="button" class="tr-tagbtn${TR_TAG===t?' on':''}${TR_TAG&&TR_TAG!==t?' off':''}" data-trtag="${esc(t)}"><i style="background:${b}"></i>${esc(t)}</button>`; }).join('') : '')
      + `<span class="tr-hint">${tr('Select text to highlight')}${dxTip(tr('Highlights'), tr('Select any passage and pick a tag. It is written into the file as ==text=={tag} — plain Markdown any AI agent reads.'), 'right')}</span>`;
  };
  drawBar();
  const applyTag = ()=> doc.querySelectorAll('mark.hl').forEach(mk=> mk.classList.toggle('dim', !!TR_TAG && !mk.dataset.tags.split(' ').includes(TR_TAG)));
  applyTag();

  /* ---- light a Signal and its passage, from either side ---- */
  const light = i=>{
    doc.querySelectorAll('.tr-turn.lit').forEach(t=> t.classList.remove('lit'));
    doc.querySelectorAll('.tr-sig.lit').forEach(t=> t.classList.remove('lit'));
    pane.querySelectorAll('.tr-card.lit').forEach(t=> t.classList.remove('lit'));
    if(i==null) return;
    const s = sigs[i]; if(!s) return;
    if(s.turn) s.turn.classList.add('lit');
    doc.querySelectorAll(`.tr-sig[data-sig="${i}"]`).forEach(b=> b.classList.add('lit'));
    pane.querySelectorAll(`.tr-card[data-sig="${i}"]`).forEach(c=> c.classList.add('lit'));
  };
  let kept = (ordered.find(s=> s.turn) || {}).i;
  if(kept == null) kept = null;
  const over = ev=>{ const el = ev.target.closest('[data-sig]'); if(el) light(+el.dataset.sig.split(' ')[0]); };
  const out = ev=>{ if(ev.target.closest('[data-sig]') && !(ev.relatedTarget && ev.relatedTarget.closest && ev.relatedTarget.closest('[data-sig]'))) light(kept); };
  doc.onmouseover = ev=>{ if(ev.target.closest('.tr-sig')) over(ev); };
  doc.onmouseout = out;
  pane.onmouseover = ev=>{ if(ev.target.closest('.tr-card')) over(ev); };
  pane.onmouseout = out;
  const goTurn = t=>{ if(t) t.scrollIntoView({ behavior:'smooth', block:'center' }); };
  doc.onclick = ev=>{
    const b = ev.target.closest('.tr-sig'); if(!b) return;
    kept = +b.dataset.sig; TR_TAB = 'signals'; draw(); light(kept);
    const c = pane.querySelector(`.tr-card[data-sig="${kept}"]`); if(c) c.scrollIntoView({ block:'nearest' });
  };
  pane.onclick = ev=>{
    const tab = ev.target.closest('[data-trtab]');
    if(tab){ TR_TAB = tab.dataset.trtab; draw(); light(kept); return; }
    const j = ev.target.closest('.tr-jump');
    if(j){ kept = +j.dataset.sig; light(kept); goTurn(sigs[kept].turn); return; }
    const rm = ev.target.closest('[data-hlrm]');
    if(rm){ (async ()=>{   // one click, Undo in the toast — the text stays, only the marking goes
      const w = await ensureWritable(e); if(!w) return;
      if(w!==e){ openDetail(w.id); return; }
      await removeHighlight(e, +rm.dataset.hlrm);
    })(); return; }
    const h = ev.target.closest('[data-hljump]');
    if(h){ const mk = doc.querySelector(`mark.hl[data-hln="${h.dataset.hljump}"]`); if(mk){ mk.scrollIntoView({ behavior:'smooth', block:'center' }); mk.classList.remove('flash'); void mk.offsetWidth; mk.classList.add('flash'); } return; }
    const g = ev.target.closest('.tr-gap');
    if(g){ goTurn(doc.querySelector(`.md-anchor[data-anchor="${CSS.escape(g.dataset.anchor)}"]`)); return; }
    if(ev.target.closest('[data-tract="extract"]')) trCopyExtract(e);
  };
  light(kept);
  bar.onclick = ev=>{
    const b = ev.target.closest('[data-trtag]'); if(!b) return;
    TR_TAG = b.dataset.trtag || null; if(TR_TAG) TR_TAB = 'highlights';
    drawBar(); applyTag(); rebuildHl(); draw(); light(kept);
  };
}
/* the line under the title: who (their persona, when the graph says so),
   when, how — and the one action that turns this session into findings */
function trMetaHtml(e){
  const sigIds = new Set(trSignals(e).map(s=> s.x.id));
  const score = p => peLinks(p.body).filter(l=> l.e.id===e.id || sigIds.has(l.e.id)).length;
  const per = wsEntities().filter(p=> p.type==='Persona').map(p=> [p, score(p)]).filter(([,n])=> n).sort((a,b)=> b[1]-a[1])[0];
  const bits = [];
  if(per) bits.push(`<a class="xref tr-who" data-goto="${per[0].id}">${faceHtml(per[0], 'tr-face')}${esc(peFirst(per[0]))}</a>`);
  if(e.fm.date) bits.push(`<span>${esc(String(e.fm.date))}</span>`);
  if(e.fm.method) bits.push(`<span>${esc(String(e.fm.method))}</span>`);
  if(isExcluded(e)) return `<span class="tr-meta">${bits.join('<i aria-hidden="true">·</i>')}</span>`;   // out of AI analyses: nothing to extract
  return `<span class="tr-meta">${bits.join('<i aria-hidden="true">·</i>')}</span>
    <button type="button" class="btn btn-primary btn-sm tr-extract" data-tract="extract" title="${esc(tr('Copies a prompt that has your AI assistant extract findings from this transcript'))}">${ICONS_TR.spark}${tr('Extract findings')}</button>`;
}
/* the hand-off to the AI: extract findings from this file, in the dialect of
   the agent the project uses */
function trCopyExtract(e){
  const agent = pjAgent();
  const cmd = agent==='codex' ? '$extract-findings' : (agent==='gemini' || agent==='other') ? tr('Follow .claude/skills/extract-findings/SKILL.md.') : '/extract-findings';
  const txt = `${cmd} ${e.file}` + promptLang();
  const done = ()=> toast(tr('Prompt copied — paste it into your AI assistant ✓'));
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, ()=> fallbackCopy(txt, done)); else fallbackCopy(txt, done);
}
/* leaving a transcript: the pane and the tag row belong to it alone */
function transcriptWorkspaceOff(){
  const p = document.getElementById('trPane'); if(p) p.style.display = 'none';
  const b = document.getElementById('trTagBar'); if(b) b.style.display = 'none';
  const pb = document.getElementById('pBody'); if(pb) pb.classList.remove('tr-split');
  // the find bar and the document go back where every other page expects them
  const main = document.getElementById('trMain');
  if(main && pb){ pb.before(document.getElementById('docTools')); pb.insertBefore(document.getElementById('doc'), main); main.remove(); }
}
const ICONS_TR = {
  x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  hash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9h14M5 15h14M11 4 7 20M17 4l-4 16"/></svg>',
  spark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
};
