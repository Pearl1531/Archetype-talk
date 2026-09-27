/* ---------- Persona poster — full-bleed visual one-pager (second persona view,
   opened from the persona detail hero; the document view stays untouched).
   Layout mirrors the researcher's Figma board: hero (name / photo / JTBD),
   gains + pains, the L2→L3→L4 improvement flow, then quotes / pains /
   relievers. Derived blocks (flow) render ONLY if their sections exist —
   honest gaps, nothing invented. The five researcher-authored sections
   (JTBD / gains / pains / quotes / relievers) always render: empty ones show
   an honest empty state, and each carries two actions — a full-list side
   layer (all bullets + an add-to-file form via saveEntityText) and a jump to
   the section in the document view. `photo:` frontmatter (URL or data:) gives
   a real photo; otherwise the DiceBear avatar carries the hero. ---------- */
const posterView = document.getElementById('posterView');
/* the five persona sections the researcher writes by hand — the only ones
   with add/full-list actions (Evidences/Correlations stay derived-only) */
const PP_SECS = [
  { sec:'Jobs to be Done',          label:'Jobs to be done',          cls:''        },
  { sec:'Potential Gains',          label:'Potential gains',          cls:'pp-gain' },
  { sec:'Pains',                    label:'Pains',                    cls:'pp-pain' },
  { sec:'Relevant Quotes',          label:'Relevant quotes',          cls:'pp-qcard'},
  { sec:'Potential Pain Relievers', label:'Potential pain relievers', cls:'pp-rel'  },
];

/* top-level "- " bullets with their indented sub-lines (e.g. *In her words:*).
   A leading or trailing [Signal/Evidence](link) is the bullet's SOURCE, not
   prose — extracted into `src` and rendered as a small label on the card. */
function posterBullets(sec){
  const out=[];
  sec.split('\n').forEach(l=>{
    if(/^- /.test(l)){
      let t=l.slice(2).trim(), src='', sid=null;
      const lead=t.match(/^\[([^\]]+)\]\(([^)]*)\)\s*/); if(lead){ src=lead[1]; sid=resolveRef(lead[2]); t=t.slice(lead[0].length); }
      const tail=t.match(/\s*\[([^\]]+)\]\(([^)]*)\)\s*$/); if(tail){ if(!src){ src=tail[1]; sid=resolveRef(tail[2]); } t=t.slice(0,t.length-tail[0].length); }
      out.push({ t:stripLinks(t), sub:'', src, sid });
    } else if(/^\s+- /.test(l) && out.length){
      const s=stripLinks(l.replace(/^\s+- /,'').replace(/\*?In (her|his|their) words:\*?/i,'').trim());
      out[out.length-1].sub += (out[out.length-1].sub?' ':'')+s;
    }
  });
  return out.filter(b=>b.t && !/^<!--/.test(b.t));
}
/* "**Title**\n[Signal](…) [Evidence](…)\ntext…\n→ Opportunity: …" blocks from
   ## Correlations — every [label](href) in the block is a grounding link
   (one correlation can cite many Signals/Evidence), resolved to entity ids */
function posterCorrelations(sec){
  const out=[]; const re=/\*\*(.+?)\*\*\n([\s\S]*?)(?=\n\*\*|$)/g; let m;
  while((m=re.exec(sec))){
    const lines=m[2].split('\n').map(s=>s.trim()).filter(Boolean);
    const opp=lines.filter(l=>/^→/.test(l)).map(l=>stripLinks(l.replace(/^→\s*(Opportunity:\s*)?/i,'')));
    const txt=stripLinks(lines.filter(l=>!/^→/.test(l) && !/^\[/.test(l) && !/^(-{3,}|\*{3,})$/.test(l)).join(' '));
    const links=[]; const lre=/\[([^\]]+)\]\(([^)]+)\)/g; let lm;
    while((lm=lre.exec(m[2]))){ const id=resolveRef(lm[2]); if(!links.some(x=>x.id&&x.id===id)) links.push({ label:lm[1], id }); }
    out.push({ title:stripLinks(m[1]), txt, opp, links });
  }
  return out;
}
/* source label → clickable xref when the linked file exists in this workspace */
function posterSrc(b){
  return b.sid && ENTITIES[b.sid]
    ? `<a class="pp-src pp-src-link" data-goto="${b.sid}" title="Open ${esc(b.src)}">${esc(b.src)}</a>`
    : (b.src?`<div class="pp-src">${esc(b.src)}</div>`:'');
}
function posterCards(items, cls){
  return items.map(b=>`<div class="pp-card ${cls||''}">${esc(b.t)}${b.sub?`<div class="pp-sub">${esc(b.sub)}</div>`:''}${posterSrc(b)}</div>`).join('');
}

function posterOpen(id){
  const e=ENTITIES[id]; if(!e || e.type!=='Persona') return;
  const h1=(e.body.match(/^#\s+(.+—.+)$/m)||[])[1] || e.title;
  const [nm, role]=h1.includes('—') ? h1.split('—').map(s=>s.trim()) : [e.title,''];
  const quote=(firstQuote(e.body)||'').replace(/^["“']|["”']$/g,'');
  const photoRes=picFor(e,'photo'); const photo=(photoRes&&photoRes.src)||'';
  const jtbd=posterBullets(section(e.body,'Jobs to be Done'));
  const gains=posterBullets(section(e.body,'Potential Gains'));
  const pains=posterBullets(section(e.body,'Pains'));
  const evid=posterBullets(section(e.body,'Evidences'));
  const corr=posterCorrelations(section(e.body,'Correlations'));
  /* L3 = the Signal entities this persona's file links to (Pains sources,
     Correlations, quotes…), deduped — real interview observations, clickable */
  const sigIds=[]; { const lre=/\[[^\]]+\]\(([^)]+)\)/g; let sm;
    while((sm=lre.exec(e.body))){ const id=resolveRef(sm[1]); const x=id&&ENTITIES[id];
      if(x && x.type==='Signal' && !sigIds.includes(id)) sigIds.push(id); } }
  const sigs=sigIds.map(id=>{ const x=ENTITIES[id];
    const ln=(x.body.split('\n').find(l=>l.trim() && !/^#/.test(l) && !/^>/.test(l) && !/^(-{3,}|\*{3,})$/.test(l))||'').trim();
    return { id, t:x.title, sub:trim(stripLinks(ln),150) }; });
  const reliev=posterBullets(section(e.body,'Potential Pain Relievers'));
  const quotes=posterBullets(section(e.body,'Relevant Quotes')).map(b=>{
    const m=b.t.match(/"(.+?)"\s*(?:—\s*(.+))?$/s);
    return m? { q:m[1], src:m[2]||'' } : { q:b.t, src:'' };
  });
  /* sec = canonical ## heading → the label grows count + add/full-list actions,
     and an empty section renders as an honest gap instead of vanishing */
  const col=(label,icon,html,sec,count)=>{
    if(!html && !sec) return '';
    const acts = sec?`<span class="pp-acts"><button type="button" class="pp-act" data-pp-list="${esc(sec)}" title="${esc(tr('Full list — every entry in this section'))}">${tr('All')} (${count||0})</button><button type="button" class="pp-act" data-pp-add="${esc(sec)}" title="${esc(tr('Add a new entry to this section of the file'))}">＋ ${tr('Add')}</button></span>`:'';
    const body = html || `<div class="pp-empty">${tr('Nothing in this section yet — an honest gap, nothing invented. Add the first entry or fill it from research.')}</div>`;
    return `<div class="pp-col"><div class="pp-label">${icon||''}<span>${label}</span>${acts}</div>${body}</div>`;
  };
  const flowCol=(lv,name,cards)=> cards?`<div class="pp-col"><div class="pp-lv"><b>${lv}:</b> ${name}</div><span class="pp-dot"></span>${cards}</div>`:'';

  posterView.innerHTML = `
    <div class="pp-top">
      <span class="pp-kicker">${ICONS.Persona}${tr('Persona poster')}${e.fm.demo?`<span class="demo-badge">${tr('Demo')}</span>`:''}</span>
      <button class="pp-close" id="ppClose" aria-label="Close poster">✕</button>
    </div>
    <section class="pp-hero">
      <div class="pp-id">
        <h1>${esc(nm)}</h1>
        <div class="pp-role">${esc(role||e.fm.description||'')}</div>
        ${e.fm.category?`<span class="pp-cat">${esc(tr(e.fm.category))} ${tr('persona')}</span>`:''}
        ${quote?`<blockquote class="pp-quote">“${esc(quote)}”</blockquote>`:''}
      </div>
      <figure class="pp-photo${photo?'':' pp-photo-avatar'}">
        ${photo?`<img src="${esc(photo)}" alt="${esc(nm)}">`:avatarHtml(e,nm)}
      </figure>
      ${col(tr('Jobs to be done'), ICONS.Persona, jtbd.length?`<div class="pp-grid">${posterCards(jtbd)}</div>`:'', 'Jobs to be Done', jtbd.length)}
    </section>
    <section class="pp-duo">
      ${col(tr('Potential gains'), ICONS.IdeaForImprovement, gains.length?`<div class="pp-grid">${posterCards(gains,'pp-gain')}</div>`:'', 'Potential Gains', gains.length)}
      ${col(tr('Pains'), ICONS.Signal, pains.length?`<div class="pp-grid">${posterCards(pains,'pp-pain')}</div>`:'', 'Pains', pains.length)}
    </section>
    ${(evid.length||sigs.length||corr.length)?`
    <div class="pp-divider"><span>${tr('Persona improvement')}</span></div>
    <section class="pp-flow">
      ${flowCol(tr('Level 2'),tr('Evidence — desk research'), evid.length?posterCards(evid):'')}
      ${flowCol(tr('Level 3'),tr('Signal — interviews'), sigs.length?sigs.map(s=>`<div class="pp-card pp-linkcard" data-goto="${s.id}"><b>${esc(s.t)}</b>${esc(s.sub)}</div>`).join(''):'')}
      ${flowCol(tr('Level 4'),tr('Correlation — Signal + Evidence'), corr.length?corr.map(c=>`<div class="pp-card pp-corr"><b>${esc(c.title)}</b>${esc(c.txt)}${c.links.length?`<div class="pp-refs">${c.links.map(l=>{ const x=l.id&&ENTITIES[l.id]; return x?`<a class="pp-ref" data-goto="${l.id}">${ICONS[x.type]||''}${esc(l.label)}</a>`:`<span class="pp-ref pp-ref-off" title="${esc(tr('File not found in this workspace'))}">${esc(l.label)}</span>`; }).join('')}</div>`:''}${c.opp.map(o=>`<div class="pp-opp">${tr('Opportunity:')} ${esc(o)}</div>`).join('')}</div>`).join(''):'')}
    </section>`:''}
    <div class="pp-divider"><span>${tr('Additional information')}</span></div>
    <section class="pp-flow pp-extra">
      ${col(tr('Relevant quotes'), ICONS.Transcript, quotes.length?quotes.map(q=>`<div class="pp-card pp-qcard">“${esc(q.q)}”${q.src?`<div class="pp-src">${esc(q.src)}</div>`:''}</div>`).join(''):'', 'Relevant Quotes', quotes.length)}
      ${col(tr('Pains'), ICONS.Signal, pains.length?posterCards(pains.map(p=>({t:p.t})),'pp-pain'):'')}
      ${col(tr('Potential pain relievers'), ICONS.IdeaForImprovement, reliev.length?posterCards(reliev,'pp-rel'):'', 'Potential Pain Relievers', reliev.length)}
    </section>
    <div class="pp-foot"><button class="btn btn-outline" id="ppBack">← Back to document view</button></div>`;
  document.body.classList.add('poster-open');
  posterView.setAttribute('aria-hidden','false');
  posterView.scrollTop=0;
  const close=()=>{ document.body.classList.remove('poster-open'); posterView.setAttribute('aria-hidden','true'); posterView.innerHTML=''; };
  document.getElementById('ppClose').onclick=close;
  document.getElementById('ppBack').onclick=close;
  posterView.querySelectorAll('[data-pp-list]').forEach(b=> b.onclick=()=> ppListOpen(e.id, b.dataset.ppList));
  posterView.querySelectorAll('[data-pp-add]').forEach(b=> b.onclick=()=> ppListOpen(e.id, b.dataset.ppAdd, {add:true}));
  posterView.querySelectorAll('[data-goto]').forEach(el=> el.onclick=()=>{ close(); location.hash='#'+el.dataset.goto; });
}

/* append "- text" at the end of ## sec (creating the section if missing) */
function ppAddBullet(md, sec, text){
  const line = '- ' + text.replace(/\s*\n+\s*/g,' ').trim();
  const re = new RegExp('^##\\s*' + sec.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\s*$', 'im');
  const m = md.match(re);
  if(!m) return md.replace(/\s*$/,'') + '\n\n## ' + sec + '\n\n' + line + '\n';
  const start = m.index + m[0].length;
  const rest = md.slice(start);
  const nx = rest.search(/^#{1,2}\s/m);
  const end = nx === -1 ? md.length : start + nx;
  let seg = md.slice(start, end).replace(/\s*$/,'');
  let tail = '';
  const hr = seg.match(/\n(-{3,}|\*{3,})\s*$/);   // keep a trailing --- separator last
  if(hr){ tail = '\n\n' + hr[1]; seg = seg.slice(0, hr.index).replace(/\s*$/,''); }
  return md.slice(0,start) + (seg||'\n') + '\n' + line + tail + '\n\n' + md.slice(end);
}

/* the persona section layer: full list of one section + add-to-file form.
   Adding writes through saveEntityText (real file / demo sandbox / draft);
   new bullets are the researcher's own words — no source label until they
   link a Signal/Evidence in the document view. */
function ppListOpen(id, sec, opts){
  const e=ENTITIES[id]; if(!e) return;
  const meta=PP_SECS.find(s=>s.sec===sec)||{label:sec, cls:''};
  const items=posterBullets(section(e.body, sec));
  const old=document.getElementById('ppLayer'); if(old) old.remove();
  const div=document.createElement('div');
  div.className='pp-layer'; div.id='ppLayer';
  div.innerHTML=`
    <div class="pp-layer-scrim"></div>
    <aside class="pp-layer-panel" role="dialog" aria-modal="true" aria-label="${esc(tr(meta.label))} — ${esc(tr('full list'))}">
      <div class="pp-layer-head">
        <span class="pp-label">${esc(tr(meta.label))}<span class="pp-count">${items.length}</span></span>
        <button class="pp-close" id="ppLayerClose" aria-label="Close list">✕</button>
      </div>
      <div class="pp-layer-list">
        ${items.length?posterCards(items, meta.cls):`<div class="pp-empty">${tr('Nothing in “{sec}” yet — an honest gap, nothing invented. Add the first entry below or fill it from research.').replace('{sec}', esc(sec))}</div>`}
      </div>
      <form class="pp-layer-form" id="ppAddForm">
        <textarea id="ppAddText" rows="3" placeholder="${esc(tr('New entry — one bullet, in your own words…'))}"></textarea>
        <div class="pp-hint">${tr('Saved as a bullet under “## {sec}” in {file}. Link a Signal/Evidence to it in the document view — unsourced bullets read as assumptions.').replace('{sec}', esc(sec)).replace('{file}', esc(e.file))}</div>
        <div class="pp-layer-actions">
          <button type="submit" class="btn btn-primary btn-sm">＋ Add to file</button>
          <button type="button" class="btn btn-outline btn-sm" id="ppGotoDoc" title="${esc(tr('Close the poster and jump to this section in the document view'))}">${tr('Open in document view ↗')}</button>
        </div>
      </form>
    </aside>`;
  posterView.appendChild(div);
  const close=()=>div.remove();
  div.querySelector('.pp-layer-scrim').onclick=close;
  document.getElementById('ppLayerClose').onclick=close;
  div.querySelectorAll('[data-goto]').forEach(el=> el.onclick=()=>{
    document.body.classList.remove('poster-open'); posterView.setAttribute('aria-hidden','true'); posterView.innerHTML='';
    location.hash='#'+el.dataset.goto;
  });
  document.getElementById('ppGotoDoc').onclick=()=>{
    document.body.classList.remove('poster-open'); posterView.setAttribute('aria-hidden','true'); posterView.innerHTML='';
    const slug='sec-'+sec.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const el=document.getElementById(slug);
    // a frame later: the overflow:hidden release cancels a same-frame smooth scroll
    if(el) setTimeout(()=> el.scrollIntoView({behavior:'smooth', block:'start'}), 60);
  };
  document.getElementById('ppAddForm').onsubmit=async ev=>{
    ev.preventDefault();
    const txt=document.getElementById('ppAddText').value.trim(); if(!txt) return;
    const w=await ensureWritable(e); if(!w) return;
    if(await saveEntityText(w, ppAddBullet(w.md, sec, txt))){
      toast(tr('Added to {sec} ✓').replace('{sec}', sec), {label:tr('Undo'), fn: async()=>{ await undoLastSave(); if(document.body.classList.contains('poster-open')){ posterOpen(w.id); ppListOpen(w.id, sec); } }});
      posterOpen(w.id); ppListOpen(w.id, sec);
    }
  };
  if(opts&&opts.add) document.getElementById('ppAddText').focus();
}
/* Esc closes the poster before the global "Esc leaves detail" handler runs
   (this partial registers first) */
document.addEventListener('keydown', ev=>{
  if(ev.key==='Escape' && document.body.classList.contains('poster-open')){
    ev.stopImmediatePropagation();
    const layer=document.getElementById('ppLayer');
    if(layer){ layer.remove(); return; }   // first Esc closes the section layer only
    document.body.classList.remove('poster-open');
    posterView.setAttribute('aria-hidden','true'); posterView.innerHTML='';
  }
});
