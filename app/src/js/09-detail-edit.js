/* ---------- markdown detail with xref navigation ---------- */
function esc(s){ return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
let HL_N = 0; // render-order index of highlights — maps a clicked <mark> back to the nth HL_RE match in the source body
function inline(s){
  s = esc(s);
  s = s.replace(HL_RE, (m,txt,tags)=>{
    const tl = hlTagsParse(tags);
    return `<mark class="hl" data-hln="${HL_N++}" title="${esc(tr('Team highlight — click to edit tags'))}">${txt}${tl.map(t=>`<span class="hl-t">${t}</span>`).join('')}</mark>`;
  });
  s = s.replace(MD_LINK, (m,txt,url)=>{
    if(/^https?:/.test(url)) return `<a href="${url}" target="_blank" rel="noopener">${txt}</a>`; // url already escaped by esc(s) above (now incl. quotes)
    const id = resolveRef(url);
    const icon = id && ENTITIES[id] ? (ICONS[ENTITIES[id].type]||'') : '';
    return `<a class="xref${id?'':' missing'}" data-goto="${id||''}">${icon}${txt}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');
  s = s.replace(/\[([PQDIC]\d+)\]/g,'<span class="tagref">$1</span>');
  /* inline source citation [S1] — a superscript chip that jumps to the Nth item
     under the page's ## Sources list (wired in openDetail). Editing stays plain:
     type [S1] in prose, keep the numbered source in ## Sources. */
  s = s.replace(/\[S(\d+)\]/g,'<a class="cite" data-cite="$1" role="doc-noteref" aria-label="Source $1">$1</a>');
  return s;
}
/* Reusable, package-free visual components rendered from a fenced block whose
   info string names the type (```bar / ```stat / ```rating / ```timeline).
   Documented in app/src/README.md so every AI can emit them. Unknown types fall
   back to a plain code block. */
function vizBlock(type, body){
  const lines = body.split('\n').map(l=>l.trim()).filter(Boolean);
  type = (type||'').toLowerCase();
  if(type==='bar' || type==='share'){
    const rows = lines.map(l=>{ const i=l.lastIndexOf(':'); if(i<0) return null;
      const v=parseFloat(l.slice(i+1).replace(',','.')); return { label:l.slice(0,i).trim(), val:isNaN(v)?0:v, raw:l.slice(i+1).trim() }; }).filter(Boolean);
    if(!rows.length) return `<pre class="viz-code"><code>${esc(body)}</code></pre>`;
    const max = Math.max(...rows.map(r=>r.val), 1);
    return `<div class="viz viz-bar" role="img" aria-label="Bar chart">${rows.map(r=>
      `<div class="viz-bar-row"><span class="viz-bar-label">${esc(r.label)}</span><span class="viz-bar-track"><span class="viz-bar-fill" style="width:${Math.max(2,(r.val/max)*100).toFixed(1)}%"></span></span><span class="viz-bar-val">${esc(r.raw)}</span></div>`).join('')}</div>`;
  }
  if(type==='stat'){
    const cards = lines.map(l=>{ const p=l.split('|').map(s=>s.trim()); return { v:p[0]||'', lab:p[1]||'', src:p[2]||'' }; }).filter(c=>c.v||c.lab);
    return `<div class="viz viz-stats">${cards.map(c=>
      `<div class="viz-stat"><span class="viz-stat-v">${esc(c.v)}</span>${c.lab?`<span class="viz-stat-lab">${esc(c.lab)}</span>`:''}${c.src?`<span class="viz-stat-src">${esc(c.src)}</span>`:''}</div>`).join('')}</div>`;
  }
  if(type==='rating'){
    const rows = lines.map(l=>{ const i=l.lastIndexOf(':'); if(i<0) return null;
      const mm=l.slice(i+1).match(/([\d.]+)\s*\/\s*(\d+)/); return { label:l.slice(0,i).trim(), val:mm?parseFloat(mm[1]):0, max:mm?parseInt(mm[2],10):5 }; }).filter(Boolean);
    if(!rows.length) return `<pre class="viz-code"><code>${esc(body)}</code></pre>`;
    return `<div class="viz viz-rating">${rows.map(r=>
      `<div class="viz-rating-row"><span class="viz-rating-label">${esc(r.label)}</span><span class="viz-rating-dots" role="img" aria-label="${r.val} of ${r.max}">${Array.from({length:r.max},(_,i)=>`<i class="${i<Math.round(r.val)?'on':''}"></i>`).join('')}</span><span class="viz-rating-val">${r.val}/${r.max}</span></div>`).join('')}</div>`;
  }
  if(type==='timeline'){
    const rows = lines.map(l=>{ const i=l.indexOf(':'); if(i<0) return null;
      return { when:l.slice(0,i).trim(), what:l.slice(i+1).trim() }; }).filter(Boolean);
    if(!rows.length) return `<pre class="viz-code"><code>${esc(body)}</code></pre>`;
    return `<div class="viz viz-timeline">${rows.map(r=>
      `<div class="viz-tl-row"><span class="viz-tl-dot"></span><div class="viz-tl-body"><span class="viz-tl-when">${esc(r.when)}</span><span class="viz-tl-what">${inline(r.what)}</span></div></div>`).join('')}</div>`;
  }
  return `<pre class="viz-code"><code>${esc(body)}</code></pre>`;
}
function mdToHtml(md){
  HL_N = 0;
  const lines = md.split('\n'); let html=''; let inList=false; let para=[];
  let fenceType=null, fenceBuf=null;
  const flushP=()=>{ if(para.length){ html+='<p>'+inline(para.join(' '))+'</p>'; para=[]; } };
  const closeList=()=>{ if(inList){ html+='</ul>'; inList=false; } };
  for(let raw of lines){
    const line = raw.replace(/\s+$/,''); let m;
    if(fenceType!==null){ // inside a fenced block — collect until the closing fence
      if(/^```+\s*$/.test(line.trim())){ html+=vizBlock(fenceType, fenceBuf.join('\n')); fenceType=null; fenceBuf=null; }
      else fenceBuf.push(raw);
      continue;
    }
    if(m=line.trim().match(/^```+\s*([A-Za-z]+)?\s*$/)){ flushP(); closeList(); fenceType=m[1]||''; fenceBuf=[]; continue; }
    if(!line.trim()){ flushP(); closeList(); continue; }
    if(/^<!--.*-->\s*$/.test(line.trim())) continue;
    if(line.trim()==='---'){ flushP(); closeList(); html+='<hr>'; continue; }
    if(m=line.match(/^#\s+(.*)/)){ flushP(); closeList(); html+='<h1>'+inline(m[1])+'</h1>'; continue; }
    if(m=line.match(/^##\s+(.*)/)){ flushP(); closeList(); html+='<h2>'+inline(m[1])+'</h2>'; continue; }
    if(m=line.match(/^###\s+(.*)/)){ flushP(); closeList(); html+='<h3>'+inline(m[1])+'</h3>'; continue; }
    /* A template's note to the writer ("Biographical sketch — character colour,
       not research findings. … Do not cite …") is for whoever edits the file;
       the reader gets its bold lead as a quiet caption, not a pull quote. */
    if(m=line.match(/^>\s?\*\*([^*]+)\*\*/)) if(/not research findings/i.test(m[1])){ flushP(); closeList(); html+='<p class="md-note">'+inline(m[1].trim())+'</p>'; continue; }
    if(m=line.match(/^>\s?(.*)/)){ flushP(); closeList(); html+='<blockquote>'+inline(m[1])+'</blockquote>'; continue; }
    // "  - …" under a bullet is its continuation — rendered as a sub-item, not as literal "- " in a paragraph
    if(m=line.match(/^(\s*)[-*]\s+(.*)/)){ flushP(); if(!inList){ html+='<ul>'; inList=true; } html+=(m[1].length>=2?'<li class="li-sub">':'<li>')+inline(m[2])+'</li>'; continue; }
    closeList(); para.push(line.trim());
  }
  if(fenceType!==null) html+=vizBlock(fenceType, fenceBuf.join('\n')); // unclosed fence
  flushP(); closeList();
  // *[colour]* marks invented-for-flavour detail: say so in words, not in brackets
  return html.replace(/<em>\[colour\]<\/em>/g, `<span class="colour-chip" title="${esc(tr('Character colour for warm-up questions — not a research finding'))}">${tr('not researched')}</span>`);
}

const galleryView=document.getElementById('galleryView');
const detailView=document.getElementById('detailView');
let CURRENT = null;
let PTOC_SPY = null;   // persona TOC scroll-spy observer
function openDetail(id){
  const e = ENTITIES[id]; if(!e) return;
  CURRENT = id;
  exitEdit();
  document.getElementById('editBtn').style.display = '';
  galleryView.style.display="none"; detailView.classList.add('active');
  syncLinTheme();
  document.getElementById('crumbType').textContent = e.meta.label;
  document.getElementById('crumbType').onclick = ()=>{ activeType=e.type; renderTabs(); renderGrid(searchInput.value); updatePageHead(); location.hash=''; };
  document.getElementById('crumbHere').textContent = e.title;
  document.getElementById('dKicker').innerHTML =
    `<span class="type-badge">${ICONS[e.type]}${tr(e.meta.singular)}</span>${e.type==='Transcript'&&isExcluded(e)?`<span class="demo-badge exc-badge" title="${esc(tr('Out of sample stats, heard-from counts and AI analyses'))}">${tr('Excluded')}</span>`:''}${e.draft?`<span class="demo-badge draft-badge" title="${esc(tr('Local draft — lives in this browser until you connect the project folder'))}">${tr('Draft')}</span>`:''}${e.fm.demo?`<span class="demo-badge" title="${esc(tr('Illustrative example content, not real research'))}">${tr('Demo')}</span>`:''}`;
  const delBtn = document.getElementById('deleteDraftBtn');
  delBtn.style.display = e.draft ? '' : 'none';
  delBtn.onclick = ()=>{
    if(!confirm(tr('Delete this draft? It only exists in this browser — this cannot be undone.'))) return;
    dropDraft(e.file); delete ENTITIES[e.id]; reindex();
    location.hash=''; renderTabs(); renderGrid(searchInput.value);
    toast(tr('Draft deleted'));
  };
  document.getElementById('dName').textContent = e.title;
  document.getElementById('dSub').textContent = e.fm.description || e.fm.participant || e.fm.category || '';
  /* Persona detail = a magazine layout (avatar + role on the left, the persona's
     own words big on the right), then a sticky section menu beside the content. */
  const dcard = document.querySelector('.detail-card');
  dcard.classList.toggle('persona-detail', e.type==='Persona');
  document.querySelector('.detail-wrap').classList.toggle('detail-wide', e.type==='Persona');
  const pHero = document.getElementById('pHero');
  if(e.type==='Persona'){
    const h1 = (e.body.match(/^#\s+(.+—.+)$/m)||[])[1] || e.title;
    const [nm, role] = h1.includes('—') ? h1.split('—').map(s=>s.trim()) : [e.title, ''];
    const qFull = (firstQuote(e.body)||'').replace(/^["“']|["”']$/g,'');
    let q=''; for(const s of qFull.split(/(?<=[.!?])\s+/)){ if(!q) q=s; else if((q+' '+s).length<=160) q+=' '+s; else break; }
    if(q.length>190) q=trim(q,180);
    const bioSec = section(e.body,'Who they are');
    const whoBullet = (bioSec.match(/\*\*Who:\*\*\s*([^\n(]+)/)||[])[1] || '';   // the human one-liner, not the template blockquote
    const who = trim(stripLinks((e.fm.description || whoBullet).replace(/\*\[colour\]\*/g,'')), 200);
    const cf = personaStats(e).cf;
    pHero.innerHTML = `
      <figure class="p-hero-fig">
        <div class="p-hero-avatar">${avatarHtml(e, nm)}</div>
        <figcaption>
          <div class="p-hero-name">${esc(nm)}</div>
          <div class="p-hero-role">${esc(role || e.fm.description || '')}</div>
          <div class="p-hero-chips">
            ${e.fm.category?`<span class="tag">${esc(e.fm.category)}</span>`:''}
            ${participantsChip(e)}
            <span class="tag">${esc(String(cf).trim())} confidence</span>
          </div>
          <button type="button" class="btn btn-primary p-hero-cta" id="pPosterBtn" title="${esc(tr('Full-bleed visual one-pager of this persona'))}">⧉ ${tr('Poster view')}</button>
        </figcaption>
      </figure>
      <div class="p-hero-main">
        <div class="kicker">${ICONS.Persona}Persona${e.fm.demo?'<span class="demo-badge">Demo</span>':''}</div>
        ${q?`<blockquote class="p-hero-quote">${esc(q)}</blockquote>`:`<h1 class="p-hero-quote">${esc(nm)}</h1>`}
        ${who?`<p class="p-hero-who">${esc(who)}</p>`:''}
      </div>`;
    pHero.style.display='';
    document.getElementById('pPosterBtn').onclick = ()=> posterOpen(e.id);
  } else { pHero.style.display='none'; }
  const ctl = document.getElementById('dIconCtl');
  if(e.type==='Competitor'){
    ctl.style.display = '';
    const can = !!e.handle;
    ['icFetch','icUpload','icRemove'].forEach(id=>{
      const b = document.getElementById(id);
      b.disabled = !can;
      b.title = can ? '' : 'Connect your project folder (Chrome/Edge) to save icons into the files';
    });
    document.getElementById('icRemove').style.display = String(e.fm.picture||'').trim() ? '' : 'none';
  } else { ctl.style.display = 'none'; }
  const dg = document.getElementById('dGround');
  if(e.type==='Competitor' && Array.isArray(e.fm.mentioned_in)){
    const pills = e.fm.mentioned_in.map(t=>{
      const id = byBasename[String(t).toLowerCase()];
      return id ? `<a class="xref" data-goto="${id}" style="text-transform:none;letter-spacing:0">${ICONS.Transcript}${esc(t)}</a>` : `<span class="tag" style="text-transform:none;letter-spacing:0">${esc(t)}</span>`;
    }).join(' ');
    dg.innerHTML = `Heard from ${competitorMentions(e)} of ${distinctParticipants()} participants${pills?` · <span style="display:inline-flex;gap:6px;flex-wrap:wrap;vertical-align:middle">${pills}</span>`:''}`;
    dg.classList.add('on');
    dg.querySelectorAll('a.xref[data-goto]').forEach(a=> a.onclick = ()=>{ location.hash = '#'+a.dataset.goto; });
  } else if(e.type==='Hypothesis'){
    const g = ideaGrounding(e);
    const s = hypoStatus(e);
    dg.innerHTML = `${hypoStatusChip(e)} ${authorChip(e)} <span style="text-transform:none;font-weight:400">${tr('L1 assumption — a bet to test, not a finding')}${e.fm.feature?` · ${tr('feature:')} ${esc(e.fm.feature)}`:''}</span>`
      + ` <button type="button" class="btn btn-outline btn-sm" id="dHypoEdit">✎ Edit</button>`
      + ` <button type="button" class="btn btn-ghost btn-sm" id="dHypoDel">🗑 Delete</button>`
      + (s==='open' ? ` <button type="button" class="btn ${g.level>0?'btn-primary':'btn-outline'} btn-sm" id="dPromote" title="${g.level>0?'It has research behind it — make it a grounded Idea':'Opens the Idea form — you\'ll need to cite at least one Signal/Evidence'}">↑ Promote to Idea${g.level>0?` (${esc(g.detail)})`:'…'}</button>` : '')
      + (s==='promoted' && e.fm.idea ? (()=>{ const iid=resolveRef(e.fm.idea); return iid? ` <a class="xref" data-goto="${iid}" style="text-transform:none;letter-spacing:0">${ICONS.IdeaForImprovement}see the Idea</a>` : ''; })() : '');
    dg.classList.add('on');
    const pb=document.getElementById('dPromote'); if(pb) pb.onclick=()=> promoteHypothesis(e.id);
    document.getElementById('dHypoEdit').onclick=()=> editHypothesis(e.id);
    document.getElementById('dHypoDel').onclick=()=> deleteHypothesis(e.id);
    dg.querySelectorAll('a.xref[data-goto]').forEach(a=> a.onclick=()=>{ location.hash='#'+a.dataset.goto; });
  } else if(e.type==='IdeaForImprovement'){
    const g = ideaGrounding(e);
    dg.innerHTML = `${barsHtml(g)}${esc(g.word)}${g.detail?` · ${esc(g.detail)}`:''} <span style="text-transform:none;font-weight:400">(${esc(g.why)})</span>`;
    dg.classList.add('on');
  } else if(e.type==='Transcript' && staleNoteHtml(e)){
    dg.innerHTML = `<span style="text-transform:none;letter-spacing:0;font-weight:400">${staleNoteHtml(e)}</span>`;
    dg.classList.add('on');
  } else { dg.innerHTML=''; dg.classList.remove('on'); }
  const dv = document.getElementById('dVote');
  if(e.type==='IdeaForImprovement'){
    const n = voteCount(e), names = voteList(e);
    dv.innerHTML = `${votePillHtml(e)}<span class="vote-meta">${n? esc(names.join(', ')) : 'No votes yet'}</span>`
      + (myVoteName() ? '' : ` <span class="vote-hint">— set your name in Settings to vote</span>`)
      + '';
    dv.classList.add('on'); wireVotes(dv);
  } else { dv.innerHTML=''; dv.classList.remove('on'); }
  const dAv = document.getElementById('dAvatar');
  const pic = picFor(e);
  if(pic && pic.src){ dAv.innerHTML = `<img src="${esc(pic.src)}" alt="" onerror="this.parentElement.classList.remove('on')">`; dAv.classList.add('on'); }
  else if(pic && pic.blocked){
    // External image, not yet allowed. The detail page is the one view with room
    // to explain it, so this is where the opt-in lives (Settings holds the switch).
    dAv.innerHTML = `<button type="button" class="ext-img" data-extimg="${esc(pic.url)}"
      title="This file points at an image on ${esc(pic.host)}. Loading it would tell that host you opened this page — off by default.">⤓ ${esc(pic.host)}</button>`;
    dAv.classList.add('on');
    dAv.querySelector('.ext-img').onclick = ()=> allowExternalImages(pic.host);
  }
  else if(e.type==='Archetype' && ARCH_ICONS[String(e.fm.icon||'').trim()]){
    dAv.innerHTML = `<div class="arch-icon lg" style="border:none">${ARCH_ICONS[String(e.fm.icon||'').trim()]}</div>`; dAv.classList.add('on');
  }
  else { dAv.innerHTML=''; dAv.classList.remove('on'); }
  document.getElementById('dSource').innerHTML =
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>${esc(e.file)}${e.draft?' <span class="draft-src">· draft — stored in this browser, not on disk yet</span>':''}${e.sandbox?' <span class="draft-src">· sandbox edit — this browser only (↺ Reset demo in the workspace menu)</span>':''}`;
  const doc = document.getElementById('doc');
  // a persona's opening quote already stands in the hero above — don't print it twice
  doc.innerHTML = mdToHtml(e.type==='Persona'
    ? e.body.replace(/^#\s+.*\n/,'').replace(/^\s*>\s?"[^\n]*\n(\s*---\s*\n)?/,'')
    : e.body.replace(/^#\s+.*\n/,''));
  doc.querySelectorAll('a.xref[data-goto]').forEach(a=>{
    const gid = a.getAttribute('data-goto');
    if(gid) a.onclick = (ev)=>{ ev.preventDefault(); location.hash = '#'+gid; };
  });
  /* inline source citations [S1]: number the list items under the ## Sources
     heading (src-1, src-2, …) and make each chip scroll to + flash its source */
  const srcHead = [...doc.querySelectorAll('h2,h3')].find(h=> /^(sources|references|źródła|zrodla)\b/i.test(h.textContent.trim()));
  if(srcHead){
    let el = srcHead.nextElementSibling, n=0;
    while(el && !/^H[1-3]$/.test(el.tagName)){
      if(el.tagName==='UL' || el.tagName==='OL'){ for(const li of el.children) li.id = 'src-'+(++n); }
      el = el.nextElementSibling;
    }
  }
  doc.querySelectorAll('a.cite[data-cite]').forEach(a=> a.onclick = (ev)=>{
    ev.preventDefault();
    const t = doc.querySelector('#src-'+a.dataset.cite);
    if(t){ t.scrollIntoView({behavior:'smooth', block:'center'}); t.classList.remove('cite-flash'); void t.offsetWidth; t.classList.add('cite-flash'); }
    else toast(tr('No matching item in the ## Sources list for [S{n}]').replace('{n}', a.dataset.cite));
  });
  /* Persona anchor menu: a sticky rail of the ## sections, with a scroll-spy. */
  if(PTOC_SPY){ PTOC_SPY.disconnect(); PTOC_SPY=null; }
  const pToc = document.getElementById('pToc');
  if(e.type==='Persona'){
    const label = h => (h.childNodes[0] ? h.childNodes[0].textContent : h.textContent).trim();
    const hs = [...doc.querySelectorAll('h2')].filter(h=> !/^metadata$/i.test(label(h)));
    const used = {};
    hs.forEach(h=>{ let s='sec-'+label(h).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); if(used[s]) s+='-'+(used[s]++); else used[s]=1; h.id=s; });
    pToc.innerHTML = hs.map(h=>`<a href="#${h.id}" data-sec="${h.id}">${esc(label(h))}</a>`).join('');
    pToc.style.display = hs.length ? '' : 'none';
    pToc.querySelectorAll('a').forEach(a=> a.onclick = ev=>{
      ev.preventDefault();
      const el = document.getElementById(a.dataset.sec);
      if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
    if(hs.length && 'IntersectionObserver' in window){
      const links = {}; pToc.querySelectorAll('a').forEach(a=> links[a.dataset.sec]=a);
      PTOC_SPY = new IntersectionObserver(ents=>{
        ents.forEach(en=>{ if(en.isIntersecting){ pToc.querySelectorAll('a.active').forEach(a=>a.classList.remove('active')); links[en.target.id]?.classList.add('active'); } });
      }, { rootMargin: '-72px 0px -70% 0px', threshold: 0 });
      hs.forEach(h=> PTOC_SPY.observe(h));
    }
  } else { pToc.style.display='none'; }
  /* transcript tools: find-in-transcript bar + click-to-edit on highlights */
  document.getElementById('docTools').style.display = e.type==='Transcript' ? 'flex' : 'none';
  if(e.type==='Transcript'){
    const chk = document.getElementById('useChk');
    chk.checked = !isExcluded(e);
    chk.onchange = ()=> toggleExcluded(e, !chk.checked);
    document.getElementById('useWrap').title = isExcluded(e)
      ? 'Excluded — not counted in sample stats or heard-from, skipped by AI analyses. Flip to re-include.'
      : 'In use — counted everywhere. Flip to retire this session from analyses (saved into the file as excluded: true).';
  }
  const fi = document.getElementById('findInput');
  if(fi.value){ fi.value=''; }
  FIND_HITS=[]; FIND_CUR=-1; updateFindCount();
  doc.querySelectorAll('mark.hl').forEach(mk=>{
    mk.onclick = async (ev)=>{
      ev.stopPropagation();
      const w = await ensureWritable(e);
      if(!w) return;
      if(w!==e){ openDetail(w.id); toast(tr('Folder connected ✓ — click the highlight again to edit it')); return; }
      const hln = +mk.dataset.hln;
      const h = entityHighlights(e)[hln]; if(!h) return;
      const r = mk.getBoundingClientRect();
      openHlPop(r.left + window.scrollX, r.bottom + window.scrollY, { mode:'edit', e, hln, text:h.text, tags:h.tags });
    };
  });
  /* per-section editing: every ## heading gets a pencil that opens the editor
     with exactly that section selected — convenient manual control over
     Pains / Ideas for this persona / any other section */
  if(canEdit(e)) doc.querySelectorAll('h2').forEach(h=>{
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sec-edit'; btn.textContent = tr('edit');
    btn.title = 'Edit this section in place';
    btn.setAttribute('aria-label', 'Edit section: ' + h.textContent.trim());
    btn.onclick = (ev)=>{
      ev.stopPropagation();
      const heading = h.childNodes[0] ? h.childNodes[0].textContent.trim() : h.textContent.trim();
      enterEdit();
      const md = e.md;
      const re = new RegExp('^##\\s*' + heading.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\s*$', 'im');
      const m = md.match(re);
      if(m){
        const start = m.index;
        const rest = md.slice(start + m[0].length);
        const nm = rest.search(/^#{1,2}\s/m);
        const end = nm === -1 ? md.length : start + m[0].length + nm;
        editorEl.focus();
        editorEl.setSelectionRange(start, end);
        // scroll the selection roughly into view (line height ≈ 20.8px at 13px/1.6)
        const line = md.slice(0, start).split('\n').length;
        editorEl.scrollTop = Math.max(0, (line - 3) * 20.8);
      }
    };
    h.appendChild(btn);
  });
  window.scrollTo(0,0);
}
function closeDetail(){ detailView.classList.remove('active'); galleryView.style.display=""; window.scrollTo(0,0); }
document.getElementById('backBtn').onclick=()=>{ location.hash=''; };

/* ---------- in-place editing (File System Access API — Chromium; user grants write access) ---------- */
let EDITING = false, suppressRoute = false;
const editorEl = document.getElementById('editor');
const editorWrap = document.getElementById('editorWrap');
function editDirty(){ return EDITING && CURRENT && ENTITIES[CURRENT] && editorEl.value !== ENTITIES[CURRENT].md; }
function enterEdit(){
  const e = ENTITIES[CURRENT]; if(!e || !canEdit(e)) return;
  editorEl.value = e.md; EDITING = true;
  document.getElementById('doc').style.display='none'; editorWrap.style.display='';
  document.getElementById('editBtn').style.display='none';
  editorEl.focus();
}
function exitEdit(){
  EDITING = false; editorWrap.style.display='none';
  const doc = document.getElementById('doc'); if(doc) doc.style.display='';
}
document.getElementById('editBtn').onclick = async ()=>{
  const e = ENTITIES[CURRENT]; if(!e) return;
  const w = await ensureWritable(e); if(!w) return;
  if(w!==e) openDetail(w.id);
  enterEdit();
};
document.getElementById('cancelEditBtn').onclick = ()=>{
  if(editDirty() && !confirm(tr('Discard unsaved changes?'))) return;
  exitEdit();
  document.getElementById('editBtn').style.display = ENTITIES[CURRENT] ? '' : 'none';
};
let LAST_SAVE = null; // one-level undo: {id, file, prev}
/* Per-file audit trail: who last changed this entity through the app, and when.
   git already records this for committed work, but not everyone commits every
   edit, and a folder shared over Drive has no history at all.

   NAME ONLY — never an email address, not even a masked one. These files are
   routinely committed to public repositories, an email there is harvestable, and
   a display name already answers the only question this field exists for ("who
   touched this?"). No name set means no `updated_by` line: falling back to an
   email is exactly the leak this rule prevents. */
function stampUpdated(text){
  const iso = new Date().toISOString().slice(0, 10);
  let out = setFmField(text, 'updated', iso);
  const who = String((typeof PREFS !== 'undefined' && PREFS.name) || '').trim().replace(/['\n]/g, '');
  if(who) out = setFmField(out, 'updated_by', `'${who}'`);
  return out;
}
async function saveEntityText(e, text, opts){
  opts = opts || {};
  const ne = parseEntity(text, e.file);
  if(!ne){ toast(tr('Not saved — frontmatter must keep a valid type:')); return false; }
  if(e.draft){ // local draft: persist to localStorage, no disk involved
    if(!opts.noUndo) LAST_SAVE = { id: e.id, file: e.file, prev: e.md };
    ne.id = e.id; ne.draft = true; ne.ws = e.ws; ENTITIES[e.id] = ne; reindex(); persistDraft(e.file, text, e.ws);
    renderTabs(); renderGrid(searchInput.value);
    return true;
  }
  if(isSandbox(e)){ // embedded demo: sandbox overlay, this browser only
    if(!opts.noUndo) LAST_SAVE = { id: e.id, file: e.file, prev: e.md };
    ne.id = e.id; ne.ws = 'demo'; ne.sandbox = true; ENTITIES[e.id] = ne; reindex();
    const m = loadDemoOverlay(); m[e.file] = text; saveDemoOverlay(m);
    renderWsMenu(); renderTabs(); renderGrid(searchInput.value);
    return true;
  }
  try{
    if(e.handle.requestPermission && await e.handle.requestPermission({mode:'readwrite'}) === 'denied'){ toast(tr('Write permission denied')); return false; }
    if(!opts.skipDriftCheck){
      // the file may have changed on disk since it was loaded here (e.g. Claude
      // edited it in a parallel session) — never overwrite that silently
      try{
        const disk = await (await e.handle.getFile()).text();
        if(disk !== e.md && disk !== text){
          if(!confirm(tr('This file changed on disk since it was loaded here (another tool — maybe your AI assistant — edited it).')+'\n\n'+tr('Overwrite the newer disk version with yours?'))){
            toast(tr('Not saved — click Refresh files to pick up the disk version')); return false;
          }
        }
      }catch(err){ /* deleted on disk — recreating it below is the right move */ }
    }
    // stamp only what actually lands on disk — drafts and sandbox edits above
    // never touch a file, so there is nothing to attribute there
    text = stampUpdated(text);
    const w = await e.handle.createWritable(); await w.write(text); await w.close();
  }catch(err){ toast(tr('Save failed: ')+err.message); return false; }
  if(!opts.noUndo) LAST_SAVE = { id: e.id, file: e.file, prev: e.md };
  const saved = parseEntity(text, e.file) || ne;   // keep memory identical to disk
  saved.id = e.id; saved.handle = e.handle; saved.ws = saved.fm.demo ? 'demo' : 'project'; ENTITIES[e.id] = saved; reindex();
  renderTabs(); renderGrid(searchInput.value);
  return true;
}
async function undoLastSave(){
  const u = LAST_SAVE; if(!u) return;
  const ent = ENTITIES[u.id];
  if(!ent || !canEdit(ent)){ toast(tr('Nothing to undo')); return; }
  LAST_SAVE = null;
  if(await saveEntityText(ent, u.prev, { skipDriftCheck:true, noUndo:true })){
    if(CURRENT === u.id) openDetail(u.id);
    toast(tr('Reverted {file} ✓').replace('{file}', u.file));
  }
}
document.getElementById('saveBtn').onclick = async ()=>{
  const e = ENTITIES[CURRENT]; if(!e || !canEdit(e)) return;
  if(await saveEntityText(e, editorEl.value)){ exitEdit(); openDetail(CURRENT); toast(tr('Saved to {file} ✓').replace('{file}', e.file), {label:tr('Undo'), fn: undoLastSave}); }
};

/* ---------- competitor icon manager: fetch favicon / upload / remove, stored inline (base64) ---------- */
/* Add / replace / remove (value===null) a single-line frontmatter field, in place.
   Preserves the rest of the block; comment on the same line is dropped on replace. */
function setFmField(md, key, value){
  const m = md.match(/^---\n[\s\S]*?\n---/);
  if(!m) return md;
  let fm = m[0];
  const re = new RegExp('^'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':.*$','m');
  if(value===null || value===undefined){
    fm = fm.replace(new RegExp('\\n'+key+':.*',''), '');
  } else if(re.test(fm)){
    fm = fm.replace(re, `${key}: ${value}`);
  } else {
    fm = fm.replace(/\n---$/, `\n${key}: ${value}\n---`);
  }
  return md.replace(m[0], fm);
}
function setPictureInMd(md, value){ return setFmField(md, 'picture', value ? `${value}   # stored inline (base64) for offline use` : null); }
async function saveCompetitorIcon(dataUriOrEmpty){
  let e = ENTITIES[CURRENT]; if(!e) return;
  e = await ensureWritable(e); if(!e) return;
  const md = setPictureInMd(e.md, dataUriOrEmpty);
  if(md===null){ toast(tr('Could not update frontmatter')); return; }
  if(await saveEntityText(e, md)){ openDetail(CURRENT); toast(dataUriOrEmpty ? 'Icon saved into the file (works offline) ✓' : 'Icon removed ✓', {label:'Undo', fn: undoLastSave}); }
}
function shrinkToDataUri(fileOrBlob){
  return new Promise((res, rej)=>{
    const img = new Image();
    img.onload = ()=>{
      const c = document.createElement('canvas'); c.width = 64; c.height = 64;
      const ctx = c.getContext('2d');
      const r = Math.min(64/img.width, 64/img.height);
      const w = img.width*r, h = img.height*r;
      ctx.drawImage(img, (64-w)/2, (64-h)/2, w, h);
      res(c.toDataURL('image/png'));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(fileOrBlob);
  });
}
document.getElementById('icFetch').onclick = async ()=>{
  const e = ENTITIES[CURRENT]; if(!e) return;
  if(!(typeof PREFS!=='undefined' && PREFS.allow_external_favicon)){
    toast(tr('External favicon fetch is off for privacy. Turn it on in Settings ▸ Privacy & network — or upload an icon, or ask your AI assistant to fetch it.'));
    return;
  }
  const dom = prompt('Company domain to fetch the favicon from (e.g. deezer.com):', '');
  if(!dom) return;
  if(!confirm(`This sends the domain “${dom.trim()}” to Google’s favicon service (google.com). Continue?\n\nThe fetched icon is then stored inline in the file, so it never has to be fetched again.`)) return;
  try{
    const r = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(dom.trim())}&sz=64`);
    if(!r.ok) throw new Error('HTTP '+r.status);
    const uri = await shrinkToDataUri(await r.blob());
    await saveCompetitorIcon(uri);
  }catch(err){
    toast(tr('Fetch blocked (CORS/offline) — upload a file instead, or ask your AI assistant to fetch the favicon for {name}').replace('{name}', e.title));
  }
};
document.getElementById('icUpload').onclick = ()=> document.getElementById('icFile').click();
document.getElementById('icFile').addEventListener('change', async ev=>{
  const f = ev.target.files[0]; ev.target.value='';
  if(!f) return;
  try{ await saveCompetitorIcon(await shrinkToDataUri(f)); }
  catch(err){ toast(tr('Could not read that image')); }
});
document.getElementById('icRemove').onclick = ()=> saveCompetitorIcon('');

let DIRHANDLE = null; // root folder handle (Chromium) — lets Settings write .env / preferences

