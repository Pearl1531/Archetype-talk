/* ---------- Persona page, Editorial (2026-10) ----------
   The top of a persona reads like the design: her name as the headline, the
   archetypes she fits, the line that starts a conversation, then four facts
   and three working tables built straight from her file:

     ## Pains               → "<Name>'s frustrations": each pain's signal, its
                              verbatim quote (from the signal itself — the
                              persona file paraphrases), tags, the sources
                              behind it, and the idea that answers it
     ## Jobs to be Done     → "Typical behavior": the moment, what she expects,
                              and the source (or "no source yet")
     ## Ideas for this persona → votes, grounding, what it stands on, which of
                              her frustrations it solves

   Every other section of the file still renders below, as before. Nothing
   here invents content: a row with nothing behind it says so. */
const PE_TABLED = ['Pains', 'Jobs to be Done', 'Ideas for this persona', 'Archetypes'];

/* list items of one ## section: the top-level line plus its indented sub-bullets */
function peItems(md){
  const out = [];
  md.split('\n').forEach(line=>{
    const top = line.match(/^[-*]\s+(.*)$/), sub = line.match(/^\s{2,}[-*]\s+(.*)$/);
    if(top) out.push({ text: top[1], subs: [] });
    else if(sub && out.length) out[out.length-1].subs.push(sub[1]);
  });
  return out;
}
/* the entities a piece of markdown links to, in order, with the raw href kept (it may carry #anchor) */
function peLinks(md){
  const out = [];
  for(const m of md.matchAll(MD_LINK)){
    const url = m[2]; if(/^https?:/.test(url)) continue;
    const id = resolveRef(url);
    if(id && ENTITIES[id]) out.push({ e: ENTITIES[id], label: m[1], anchor: (url.split('#')[1]||'') });
  }
  return out;
}
const peFirst = e => e.title.split(/\s+[—–-]\s+/)[0].trim();
function peLink(x, prefix){
  return `<a class="xref pe-a" data-goto="${esc(x.e.id)}">${prefix?esc(prefix)+' ':''}${esc(x.label || x.e.title)}</a>`;
}
function peSourcesOf(sig){
  // a signal's own grounding: the interview it was heard in, the evidence it cites
  const L = peLinks(sig.body);
  const tr_ = L.filter(x=> x.e.type==='Transcript');
  const ev = [...new Set([...L.filter(x=> x.e.type==='Evidence').map(x=> x.e.id),
    ...[].concat(sig.fm.evidences||[]).map(n=> byBasename[String(n).toLowerCase()]).filter(Boolean)])].map(id=> ({ e: ENTITIES[id] }));
  return { tr: tr_, ev };
}
function peLevelTip(n){
  return `<span class="pe-ladder">${[1,2,3,4,5].map(i=>`<span class="${i===n?'on':''}"><b>${i} · ${esc(tr(LEVEL_TEXT[i][0]))}</b> — ${esc(tr(LEVEL_TEXT[i][1]))}</span>`).join('')}</span>`;
}

function personaEditorialHtml(e){
  const first = peFirst(e);
  const h1 = (e.body.match(/^#\s+(.+—.+)$/m)||[])[1] || '';
  const role = h1.includes('—') ? h1.split('—').slice(1).join('—').trim() : '';
  const fullName = h1.includes('—') ? h1.split('—')[0].trim() : e.title;
  const prim = /primary/i.test(e.fm.category||'');
  const lv = personaLevel(e);
  const all = peLinks(e.body);
  const uniq = t => [...new Map(all.filter(x=> x.e.type===t).map(x=> [x.e.id, x])).values()];
  const heard = uniq('Signal'), read = uniq('Evidence'), archs = peLinks(section(e.body,'Archetypes')).filter(x=> x.e.type==='Archetype');
  const { n: people, off } = personaParticipants(e, true);
  const pic = picFor(e);
  const ideas = peLinks(section(e.body,'Ideas for this persona')).filter(x=> x.e.type==='IdeaForImprovement');
  const pairs = graphPairs(wsEntities());
  const nb = id => { const s = new Set(); pairs.forEach(([a,b])=>{ if(a===id) s.add(b); else if(b===id) s.add(a); }); return s; };

  /* hero */
  const archPills = archs.map(x=> `<a class="pe-pill xref" data-goto="${esc(x.e.id)}" title="${esc(stripLinks(x.e.fm.description||''))}">${ICONS.Archetype}${esc(x.e.title)}</a>`).join('');
  const hero = `<section class="pe-hero">
      <div class="pe-main">
        <div class="pe-kicker"><b>${tr('Persona')}</b><span aria-hidden="true">·</span><span>${esc(tr(prim ? 'the main user type this project designs for' : 'a secondary user type'))}</span>${e.fm.demo ? `<span class="dx-chip">${tr('Example data')}${dxTip(tr('This is the example project'), esc(tr('Illustrative research on Spotify listeners, not your users. The numbers are read as of the day its research closed, and it never mixes with your own projects.')))}</span>` : ''}</div>
        <h1 class="pe-name">${esc(first)}<span class="dx-dot">.</span></h1>
        <div class="pe-role">${esc([fullName !== first ? fullName.replace(first,'').trim() : '', role].filter(Boolean).join(' · ') || e.fm.description || '')}</div>
        ${archPills ? `<div class="pe-arch"><span class="pe-arch-l">${tr('Archetypes')}</span>${archPills}</div>` : ''}
        <div class="pe-actions">${talkButtonHtml(e, first)}
          <span class="pe-cmd" title="${esc(tr('Paste into your AI assistant, opened in this project folder'))}"><code>${esc(talkCommand(e, pjAgent()))}</code></span>
          <span class="dx-spacer"></span>
          <button type="button" class="dx-btn dx-btn-line dx-btn-sm" id="pPosterBtn">${tr('Poster')} ↗</button>
        </div>
      </div>
      <div class="pe-portrait${prim?' prim':''}">${pic && pic.src ? `<img src="${esc(pic.src)}" alt="">` : `<span>${esc((first[0]||'?').toUpperCase())}</span>`}</div>
    </section>`;

  /* four facts */
  const facts = `<section class="dx-facts pe-facts">
      <div class="pe-wide"><span class="dx-fl">${tr('In one line')}</span><span class="pe-oneline">${esc(stripLinks(e.fm.description||'')) || '—'}</span></div>
      <div><span class="dx-fl">${tr('Built from')}${dxTip(tr('Built from'), esc(tr('Distinct people behind this persona, counted through the signals the persona links to. A session the researcher set aside counts nowhere.')))}</span>
        <b class="pe-fact">${esc(trn(people,'{n} interview','{n} interviews','{n} wywiad','{n} wywiady','{n} wywiadów'))}</b>${off ? `<span class="dx-fs">${esc(tr('+{n} set aside').replace('{n}', off))}</span>` : ''}</div>
      <div><span class="dx-fl">${tr('Sources')}${dxTip(tr('Heard {h} · Read {r}').replace('{h}', heard.length).replace('{r}', read.length), esc(tr('Solid = heard in your own sessions (signals). Striped = read in published research or data (evidence).')))}</span>
        <b class="pe-fact">${heard.length + read.length}</b><span class="dx-split"><i style="flex:${heard.length} 1 0"></i><i class="ev" style="flex:${read.length} 1 0"></i></span></div>
      <div><span class="dx-fl">${tr('How solid')}${dxTip(tr('How solid is a persona?'), peLevelTip(lv), 'right')}</span>
        <span class="pe-lvl">${dxBars(lv,5)}</span><span class="pe-lvl-t">${esc(tr('{n} of 5').replace('{n}', lv))} — ${esc(tr(LEVEL_TEXT[lv][0]))}</span></div>
    </section>`;

  /* frustrations */
  const painRows = peItems(section(e.body,'Pains')).map(it=>{
    const sigX = peLinks(it.text).find(x=> x.e.type==='Signal');
    const sig = sigX && sigX.e;
    const title = stripLinks(it.text.replace(MD_LINK,'')).replace(/^[\s—–-]+/,'') || (sig ? sig.title : '');
    const said = it.subs.map(s=> stripLinks(s).replace(/^In (her|his|their) words:\s*/i,'')).join(' ');
    const quote = sig ? (firstQuote(sig.body)||'').replace(/^["“]|["”]$/g,'') : '';
    const tags = sig ? [].concat(sig.fm.tags||[]).filter(Boolean) : [];
    const src = sig ? peSourcesOf(sig) : { tr: [], ev: [] };
    const fix = sig ? [...nb(sig.id)].map(id=> ENTITIES[id]).filter(x=> x && x.type==='IdeaForImprovement') : [];
    return `<tr>
        <td><div class="pe-t">${esc(title)}</div>${quote ? `<div class="pe-q">“${esc(quote)}”</div>` : said ? `<div class="pe-q pe-para">${esc(said)}</div>` : ''}${tags.length ? `<div class="pe-tags">${tags.map(t=>`<span class="dx-pill">${esc(t)}</span>`).join('')}</div>` : ''}</td>
        <td class="pe-src">${sig ? `<span class="pe-h">●</span> ${peLink({e:sig}, tr('Signal:'))}` : `<span class="pe-none">◌ ${tr('No source yet')}</span>`}
          ${src.tr.map(x=>`<br><span class="pe-h">●</span> ${peLink({e:x.e, label: x.e.title + (x.anchor ? ' · '+x.anchor : '')})}`).join('')}
          ${src.ev.map(x=>`<br><span class="pe-r">○</span> ${peLink({e:x.e}, tr('Evidence:'))}`).join('')}</td>
        <td class="pe-idea">${fix.length ? fix.map(i=> peLink({e:i, label: i.title.replace(/^Idea:?\s*\d*\s*/,'')})).join('<br>') : `<b class="pe-warn">${tr('No idea yet')}</b>`}</td>
      </tr>`;
  }).join('');

  /* typical behavior, from the jobs to be done */
  const jobRows = peItems(section(e.body,'Jobs to be Done')).map(it=>{
    const txt = stripLinks(it.text.replace(MD_LINK, '')).trim();
    const m = txt.match(/^(When [^,]+),\s*(.*)$/i) || txt.match(/^(Kiedy [^,]+),\s*(.*)$/i);
    const L = peLinks(it.text);
    return `<tr${L.length ? '' : ' class="pe-dim"'}><td class="pe-t">${esc(m ? m[1] : txt)}</td><td>${esc(m ? m[2].charAt(0).toUpperCase()+m[2].slice(1) : '')}</td>
        <td class="pe-src">${L.length ? L.map(x=>`<span class="pe-h">●</span> ${peLink(x)}`).join('<br>') : `<span class="pe-none">◌ ${tr('No source yet')}</span>`}</td></tr>`;
  }).join('');

  /* ideas */
  const ideaRows = ideas.map(x=>{
    const i = x.e, g = ideaGrounding(i);
    const L = peLinks(i.body).filter(y=> y.e.type==='Signal' || y.e.type==='Evidence');
    const mine = new Set(heard.map(h=> h.e.id));
    const solves = L.filter(y=> y.e.type==='Signal' && mine.has(y.e.id));
    return `<tr>
        <td><a class="xref pe-t" data-goto="${esc(i.id)}">${esc(i.title.replace(/^Idea:?\s*\d*\s*/,''))}</a>${i.fm.description ? `<div class="pe-sub">${esc(stripLinks(i.fm.description))}</div>` : ''}</td>
        <td>${votePillHtml(i)}</td>
        <td><span class="pe-conf">${barsHtml(g)}<b>${esc(tr(g.word))}</b></span><div class="pe-sub">${esc(g.detail || tr(g.why))}</div></td>
        <td class="pe-src">${L.map(y=> `<span class="${y.e.type==='Signal'?'pe-h':'pe-r'}">${y.e.type==='Signal'?'●':'○'}</span> ${peLink(y)}`).join('<br>') || `<span class="pe-none">◌ ${tr('No source yet')}</span>`}</td>
        <td>${solves.length ? solves.map(y=> esc(y.e.title)).join('<br>') : `<span class="pe-none">${tr('None of the listed ones')}</span>`}</td>
      </tr>`;
  }).join('');

  const head = (title, sub, sec)=> `<div class="pe-h2row"><div><h2 class="dx-h2">${title}</h2>${sub ? `<p class="pe-h2sub">${sub}</p>` : ''}</div>${canEdit(e) ? `<button type="button" class="dx-btn dx-btn-line dx-btn-sm" data-pe-edit="${esc(sec)}">${tr('Edit')}</button>` : ''}</div>`;
  const tables = `
    ${painRows ? `<section class="dx-sec">${head(esc(tr('{name}’s frustrations').replace('{name}', first)), '', 'Pains')}
      <div class="dx-card"><table class="dx-table pe-table"><thead><tr><th>${tr('Frustration, in their words')}</th><th style="width:30%">${tr('Where it comes from')}</th><th style="width:18%">${tr('Idea for it')}</th></tr></thead><tbody>${painRows}</tbody></table></div></section>` : ''}
    ${jobRows ? `<section class="dx-sec">${head(tr('Typical behavior'), '', 'Jobs to be Done')}
      <div class="dx-card"><table class="dx-table pe-table"><thead><tr><th style="width:30%">${tr('Moment')}</th><th>${tr('What they do or expect')}</th><th style="width:28%">${tr('Where it comes from')}</th></tr></thead><tbody>${jobRows}</tbody></table></div></section>` : ''}
    ${ideaRows ? `<section class="dx-sec">${head(esc(tr('Product ideas for {name}').replace('{name}', first)), '', 'Ideas for this persona')}
      <div class="dx-card"><table class="dx-table pe-table"><thead><tr><th>${tr('Idea')}</th><th style="width:80px">${tr('Votes')}</th><th style="width:20%"><span class="pe-th">${tr('Confidence')}${dxTip(tr('How confident can we be in this idea?'), esc(tr('Worked out from what the idea links to, not from votes: interviews and research together = strong, interviews only = medium, research only = weak.')))}</span></th><th style="width:22%">${tr('Based on')}</th><th style="width:18%">${tr('Frustration it solves')}</th></tr></thead><tbody>${ideaRows}</tbody></table></div></section>` : ''}`;

  /* everything behind her */
  const interviews = [...new Map(heard.flatMap(h=> peSourcesOf(h.e).tr).map(x=> [x.e.id, x])).values()];
  const col = (label, n, items)=> items.length ? `<nav class="pe-fcol"><b>${label} <span>${n}</span></b>${items.join('')}</nav>` : '';
  const footer = `<footer class="pe-foot">
      <div class="pe-foot-h"><span>${esc(tr('Everything behind {name}').replace('{name}', first))}</span><small>${tr('Every file this page is built from.')}</small></div>
      ${col('● '+tr('Heard'), heard.length, heard.map(x=> peLink(x)))}
      ${col('○ '+tr('Read'), read.length, read.map(x=> peLink(x)))}
      ${col(tr('Interviews'), interviews.length, interviews.map(x=> peLink({e:x.e, label:x.e.title + (isExcluded(x.e) ? ' · '+tr('set aside') : '')})))}
      ${col(tr('Archetypes'), archs.length, archs.map(x=> peLink(x)))}
    </footer>`;
  return { top: hero + facts + tables, footer };
}

function personaEditorialWire(root, e){
  wireTalkButton(root, e, peFirst(e));
  wireVotes(root);
  wirePeek(root);
  const pb = root.querySelector('#pPosterBtn'); if(pb) pb.onclick = ()=> posterOpen(e.id);
  root.querySelectorAll('a.xref[data-goto]').forEach(a=> a.onclick = ev=>{ ev.preventDefault(); location.hash = '#'+a.dataset.goto; });
  root.querySelectorAll('[data-pe-edit]').forEach(b=> b.onclick = ()=> editSection(e, b.dataset.peEdit));
}
