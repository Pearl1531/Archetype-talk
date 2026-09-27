/* ---------- Competitor compare — Apple-style, up to 3 columns ----------
   Categories are project-specific: `compare_categories: [...]` in Product
   Context.md frontmatter (chosen at project setup — only axes that move THIS
   project's decisions, no vanity metrics). Each competitor carries a
   `## Comparison` table (| Category | claim with source |) filled by desk
   research; Product Context.md may carry its own so "us" can be a column.
   A missing row renders as an honest research gap — never a guess. */
function parseCompareTable(body){
  // own section cut (section() stops at the first line end via multiline $)
  const at = body.search(/^##\s*Comparison\s*$/im); if(at < 0) return null;
  const rows = {};
  for(const raw of body.slice(at).split('\n').slice(1)){
    const l = raw.trim();
    if(/^#{1,6}\s/.test(l)) break;                 // next heading — section over
    if(!l.startsWith('|')) continue;
    const cells = l.split('|').map(c=>c.trim());
    if(cells.length < 3 || /^[-: ]*$/.test(cells[1]) || /^category$/i.test(stripLinks(cells[1]))) continue;
    const cat = stripLinks(cells[1]);
    if(cat && cells[2]) rows[cat] = cells[2];
  }
  return Object.keys(rows).length ? rows : null;
}
function compareCell(rows, cat){
  if(!rows) return '';
  const lc = cat.toLowerCase();
  const k = Object.keys(rows).find(k=> k.toLowerCase()===lc);
  return k ? rows[k] : '';
}
/* minimal inline markdown for a table cell: links (external open a tab,
   internal resolve to the entity), bold, code */
function inlineCell(md){
  let s = esc(md);
  s = s.replace(MD_LINK, (all, txt, url)=>{
    if(/^https?:/i.test(url)) return `<a href="${url}" target="_blank" rel="noopener">${txt}</a>`;
    const id = resolveRef(url);
    return id && ENTITIES[id] ? `<a href="#${id}">${txt}</a>` : txt;
  });
  return s.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>');
}
let CMP_SEL = (()=>{ try{ return JSON.parse(store.get('at-compare-sel')||'null'); }catch(_){ return null; } })();
function renderCompare(){
  const T = distinctParticipants();
  const prod = getProduct();
  const all = wsEntities().filter(e=>e.type==='Competitor')
    .sort((a,b)=> competitorMentions(b)-competitorMentions(a) || a.title.localeCompare(b.title));
  const rowsFor = id => id==='__us' ? (prod && prod.rows) : (ENTITIES[id] ? parseCompareTable(ENTITIES[id].body) : null);
  // categories: the configured project axes; fallback = union across the tables present
  let cats = (prod && prod.cats && prod.cats.length) ? prod.cats.slice() : null;
  if(!cats){
    cats = []; const seen = new Set();
    ['__us', ...all.map(e=>e.id)].forEach(id=>{
      const r = rowsFor(id); if(!r) return;
      Object.keys(r).forEach(k=>{ const lc=k.toLowerCase(); if(!seen.has(lc)){ seen.add(lc); cats.push(k); } });
    });
  }
  if(!cats.length){
    grid.innerHTML = `<div class="didyouknow">
      <div class="kicker">${tr('Compare — not set up yet')}</div>
      <h3>${tr('Pick the axes that decide wins in <i>your</i> market.')}</h3>
      <p>${tr("This view compares up to three competitors side by side — but only on categories that matter to <b>this</b> project, chosen at project setup. No vanity metrics: funding rounds and follower counts don't change what your users choose.")}</p>
      <p>${tr("<b>Two steps:</b> ① add <code>compare_categories: [Pricing, …]</code> to the frontmatter of <code>Product Context.md</code> (the AI offers this during setup); ② let the AI's desk research fill a <code>## Comparison</code> table in each <code>Competitors/</code> file — sourced claims only. A category it can't verify stays empty here, flagged as a research gap.")}</p>
    </div>`;
    return;
  }
  const hasUs = !!(prod && prod.rows);
  // three slots, Apple-style; default: us + the two most-heard competitors
  const valid = id => id==='' || (id==='__us' && hasUs) || all.some(e=>e.id===id);
  if(!Array.isArray(CMP_SEL) || CMP_SEL.length!==3 || !CMP_SEL.every(valid) || !CMP_SEL.some(Boolean)){
    const def = hasUs ? ['__us', ...all.slice(0,2).map(e=>e.id)] : all.slice(0,3).map(e=>e.id);
    CMP_SEL = [def[0]||'', def[1]||'', def[2]||''];
  }
  const optionsHtml = cur => `<option value="">—</option>`
    + (hasUs ? `<option value="__us"${cur==='__us'?' selected':''}>${esc(prod.name)} · ${tr('you')}</option>` : '')
    + all.map(e=>`<option value="${e.id}"${cur===e.id?' selected':''}>${esc(e.title)}</option>`).join('');
  const colHead = id => {
    if(!id) return '<div class="cmp-col-head empty"></div>';
    if(id==='__us') return `<div class="cmp-col-head">
        <div class="map-tile us">${esc(prod.name.slice(0,2))}</div>
        <div class="cmp-col-name">${esc(prod.name)} <span class="you-badge">YOU</span></div>
        <div class="cmp-col-sub">${tr('Your product — the anchor')}${prod.updated?` · ${tr('updated')} ${esc(prod.updated)}`:''}</div>
      </div>`;
    const e = ENTITIES[id];
    const m = competitorMentions(e);
    const prox = PROX_LABEL[String(e.fm.proximity||'').trim()];
    const vDays = e.fm.retrieved ? (d=>d?Math.floor((graphNow()-d.getTime())/86400000):null)(parseAnyDate(e.fm.retrieved)) : null;
    return `<div class="cmp-col-head">
      ${compTileHtml(e,56)}
      <div class="cmp-col-name"><a href="#${e.id}">${esc(e.title)}</a>${e.fm.demo?'<span class="demo-badge">Demo</span>':''}</div>
      <div class="cmp-col-sub">${prox?`<span class="cg-prox" title="${esc(prox[1])}">${esc(prox[0])}</span>`:''} ${tr('Heard from')} ${m} ${tr('of')} ${T}</div>
      ${String(e.fm.needs_research)==='true' ? `<div class="cmp-col-note">🔎 ${tr('Awaiting desk research')}</div>`
        : e.fm.retrieved ? `<div class="cmp-col-note${vDays>92?' stale':''}">${tr('Verified')} ${esc(e.fm.retrieved)}${vDays>92?' — '+tr('worth re-checking'):''}</div>` : ''}
    </div>`;
  };
  const body = cats.map(cat=>`
    <div class="cmp-cat">${esc(cat)}</div>
    ${CMP_SEL.map(id=>{
      if(!id) return '<div class="cmp-cell empty"></div>';
      const v = compareCell(rowsFor(id), cat);
      return `<div class="cmp-cell">${v ? inlineCell(v) : `<span class="cmp-gap">${tr('No verified data yet — a research gap, not a zero')}</span>`}</div>`;
    }).join('')}`).join('');
  grid.innerHTML = `<div class="cmp-wrap">
    <div class="cmp-grid">
      ${CMP_SEL.map((id,i)=>`<div class="cmp-picker"><select class="cmp-sel" data-slot="${i}" aria-label="${esc(tr('Column'))} ${i+1}">${optionsHtml(id)}</select></div>`).join('')}
      ${CMP_SEL.map(colHead).join('')}
      ${body}
    </div>
    <div class="cmp-foot">${tr("Categories are this project's own (<code>compare_categories</code> in <code>Product Context.md</code>) — deliberately no vanity metrics. Cells come from each competitor's <code>## Comparison</code> table: desk-researched, sourced claims only.")}</div>
  </div>`;
  grid.querySelectorAll('.cmp-sel').forEach(s=> s.onchange = ()=>{
    CMP_SEL[+s.dataset.slot] = s.value;
    store.set('at-compare-sel', JSON.stringify(CMP_SEL));
    renderGrid(searchInput.value);
  });
}
function renderGrid(filter=""){
  if(HELP_ACTIVE || SETTINGS_ACTIVE || MINDMAP_ACTIVE || DASHBOARD_ACTIVE) return; // these pages own the content area
  const list = filteredList(filter);
  const n = list.length;
  const V = effView();
  syncViewButtons(V);
  syncFilterBar(filter, n);
  syncLinTheme();
  const cardClass = V==='list' ? 'single' : 'masonry';
  document.getElementById('ideaBar').style.display = activeType==='IdeaForImprovement' ? 'flex' : 'none';
  if(activeType==='IdeaForImprovement') renderIdeaSortBtn();
  document.getElementById('hypoBar').style.display = activeType==='Hypothesis' ? 'flex' : 'none';
  document.getElementById('compBar').style.display = activeType==='Competitor' ? 'flex' : 'none';
  syncNewBar();
  const freshBar = document.getElementById('freshBar');
  freshBar.style.display = activeType==='Transcript' ? 'block' : 'none';
  const statHost = document.getElementById('sampleStat');
  statHost.innerHTML = activeType==='Transcript' ? sampleStatsHtml() : '';
  if(activeType==='Transcript'){
    const total = totalTranscripts();
    const stale = wsEntities().filter(e=>e.type==='Transcript' && !isExcluded(e) && (transcriptAgeDays(e)??0)>92).length;
    const bt = document.getElementById('freshToggle');
    bt.className = 'btn btn-outline btn-sm' + (FRESH_ONLY?' active':'');
    bt.textContent = FRESH_ONLY
      ? tr('Fresh only (≤3 months) — hiding {n} stale').replace('{n}', stale)
      : tr('Fresh only (≤3 months) · {n} of {t} are stale').replace('{n}', stale).replace('{t}', total);
    bt.onclick = ()=>{ FRESH_ONLY = !FRESH_ONLY; store.set('at-fresh-only', FRESH_ONLY?'1':'0'); renderGrid(searchInput.value); };
  }
  if(V==='hl' && activeType==='Transcript' && n){
    grid.className = ''; renderHighlights(list);
  } else if(V==='affinity' && activeType==='Signal' && n){
    grid.className = ''; renderAffinity(list);
  } else if(V==='map' && activeType==='Competitor' && n){
    grid.className = ''; renderMap(list);
  } else if(V==='compare' && activeType==='Competitor' && n){
    grid.className = ''; renderCompare();
  } else if(V==='list' && activeType==='Competitor' && n){
    grid.className = 'comp-list'; renderCompList(list);
  } else if(V==='table' && n){
    grid.className = 'tableview'; renderTable(list);
  } else if(activeType==='All' && n){
    // grouped subsections per type — quick scanning instead of one mixed stream
    grid.className = ''; grid.innerHTML = '';
    TYPE_ORDER.forEach(t=>{
      const items = list.filter(e=>e.type===t); if(!items.length) return;
      const sec = document.createElement('section'); sec.className = 'type-section';
      const head = document.createElement('button'); head.className = 'section-head';
      head.title = 'Show only ' + TYPES[t].label;
      head.innerHTML = `${ICONS[t]}<span>${TYPES[t].label}</span><span class="n">${items.length}</span>`;
      head.onclick = ()=>{ activeType = t; renderTabs(); renderGrid(searchInput.value); updatePageHead(); window.scrollTo(0,0); };
      const wrap = document.createElement('div'); wrap.className = cardClass;
      items.forEach(e=> wrap.appendChild(card(e)));
      sec.append(head, wrap); grid.appendChild(sec);
    });
  } else {
    grid.className = cardClass;
    grid.innerHTML = "";
    list.forEach(e=> grid.appendChild(card(e)));
  }
  if(!n){
    grid.className = 'masonry';
    if(activeType==='Transcript' && FRESH_ONLY && totalTranscripts() > 0){
      grid.className = '';
      grid.innerHTML = `<div class="didyouknow">
        <div class="kicker">${tr('No fresh research')}</div>
        <h3>${tr('Every transcript here is older than 3 months.')}</h3>
        <p>${tr('Your personas are currently answering from history, not from your users. Before the next product decision, run a refresh round — <code>/interview-guide</code> will build the discussion guide from your open questions.')}</p>
        <p>${tr('<b>Did you know?</b> In 1936, The Literary Digest ran one of the largest surveys in history — over <b>2.4 million responses</b> — and confidently predicted Alf Landon would win the US presidency. Franklin D. Roosevelt won 46 of 48 states. Meanwhile George Gallup called the election correctly with a sample roughly a thousand times smaller — but representative. The Digest folded within two years.')}</p>
        <p>${tr('The lesson has not aged a day: <b>a small amount of fresh, well-sampled research beats a mountain of impressive-looking stale data.</b> Volume is not validity.')}</p>
      </div>`;
      countEl.textContent = '0 ' + tr('items') + ' · ' + tr('all transcripts stale');
      return;
    }
    // an empty TYPE is different from an empty filter: say what belongs here,
    // and offer both doors — write it yourself, or hand the job to your agent
    if(!filter.trim() && activeType!=='All' && typeof typeEmptyHtml==='function'){
      grid.className = '';
      grid.innerHTML = typeEmptyHtml(activeType);
      wireEmptyState(activeType);
      countEl.textContent = '0 ' + tr('items');
      return;
    }
    if(WS==='project' && !wsEntities().length && !filter.trim()){
      grid.className = '';
      grid.innerHTML = projectEmptyHtml();
      wireProjectEmpty();
      countEl.textContent = '0 ' + tr('items') + ' · ' + tr('your workspace');
      return;
    }
    const empty = !wsEntities().length
      ? tr("Hit <b>Connect folder</b> and point at your project — the folder itself, not the files inside. It's read right here on your computer; nothing is uploaded.")
      : tr('Nothing matches that filter — yet.');
    grid.innerHTML = `<div class="card slot">
      <svg class="glyph" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
      <p>${empty}</p></div>`;
  }
  const state = lastLoad ? tr('loaded')+' '+lastLoad
    : (Object.keys(ENTITIES).length ? tr('example set — connect your folder to see your own research') : tr('nothing loaded yet'));
  countEl.textContent = n + ' ' + plw(n,'item','items','pozycja','pozycje','pozycji') + ' · ' + state;
}

function badge(e){
  return `<div class="card-top"><span class="type-badge">${ICONS[e.type]}${tr(e.meta.singular)}${e.type==='Persona'&&e.fm.category?` · ${esc(tr(e.fm.category))}`:''}</span>${e.type==='Transcript'&&isExcluded(e)?`<span class="demo-badge exc-badge" title="${esc(tr('Researcher decision: this session is out of sample stats, heard-from counts and AI analyses. Flip “Use in analysis” inside to re-include.'))}">${tr('Excluded')}</span>`:''}${e.draft?`<span class="demo-badge draft-badge" title="${esc(tr('Local draft — lives in this browser until you connect the project folder'))}">${tr('Draft')}</span>`:''}${e.fm.demo?`<span class="demo-badge" title="${esc(tr('Illustrative example content, not real research'))}">${tr('Demo')}</span>`:''}</div>`;
}

/* Where a participant stood on one feature. Three visual groups, never a score:
   the ladder is ordered for reading, not for arithmetic, so nothing here sorts,
   averages or colours by degree. `mixed` gets its own look precisely because it
   is NOT the middle of the scale — `indifferent` is. */
const STANCE_GROUP = {
  dealbreaker:'neg', resents:'neg', frustrated:'neg', wary:'neg',
  indifferent:'mid', unaware:'mid', mixed:'mix',
  curious:'pos', appreciates:'pos', relies_on:'pos', advocates:'pos'
};
const STANCE_TIP = {
  dealbreaker:'Said they would leave or stop using over this',
  resents:'Returns to it unprompted, with anger',
  frustrated:'It annoys them and they carry on using it',
  wary:'Assumes up front it will not work for them',
  indifferent:'Asked about it, and demonstrably did not care',
  unaware:'Had never encountered it — a coverage gap, not a finding',
  curious:'Interested, has not used it',
  appreciates:'Likes it, would not fight for it',
  relies_on:'Part of the routine — would notice it gone',
  advocates:'Recommends it unprompted',
  mixed:'Genuinely both ways at once — not the middle of the scale'
};
function stanceChip(e){
  const s = e.fm && e.fm.sentiment;
  if(!s || typeof s !== 'object' || !s.stance) return '';   // absent means not observed, never neutral
  const g = STANCE_GROUP[s.stance] || 'mid';
  /* Who put the topic on the table. Asked directly, people overweight anything —
     so an elicited stance is sound about the attitude and silent about the salience.
     Only marked when recorded: an absent flag means unknown, not "prompted". */
  const up = s.unprompted === 'true' ? 'unprompted'
           : s.unprompted === 'false' ? 'asked' : '';
  const tip = tr(STANCE_TIP[s.stance] || '') + (s.because ? ' — ' + s.because : '')
    + (up === 'unprompted' ? '\n\n'+tr('They raised this themselves.')
     : up === 'asked' ? '\n\n'+tr('The moderator raised this topic — the attitude is evidenced, how much it matters to them is not.') : '');
  return `<div class="stance st-${g}" title="${esc(tip)}"><b>${esc(tr(String(s.stance).replace(/_/g,' ')))}</b>${
    s.feature ? ` ${tr('on')} ${esc(s.feature)}` : ''}${up ? `<i class="st-src">${tr(up)}</i>` : ''}</div>`;
}

function card(e){
  const el=document.createElement('div'); el.className='card' + (e.type==='Transcript'&&isExcluded(e)?' excluded':'');
  let inner = badge(e);
  if(e.type==='Persona'){
    /* Apple-store card: small-caps kicker, the persona's own words as the
       headline, cartoon avatar as the hero image. Trimmed on purpose. */
    const h1 = (e.body.match(/^#\s+(.+—.+)$/m)||[])[1] || '';
    const [nm, role] = h1.includes('—') ? h1.split('—').map(x=>x.trim()) : [e.title, ''];
    const qFull = (firstQuote(e.body)||'').replace(/^["“']|["”']$/g,'');
    let q=''; for(const s of qFull.split(/(?<=[.!?])\s+/)){ if(!q) q=s; else if((q+' '+s).length<=130) q+=' '+s; else break; }  // whole sentences
    if(q.length>150) q=trim(q,140);
    el.classList.add('p-apple');
    inner = `<div class="pa-kicker">${esc(e.fm.category||'')} persona${e.fm.demo?'<span class="pa-demo">Demo</span>':''}</div>
      <h3 class="pa-quote">${esc(q)}</h3>
      <div class="pa-who">${esc(nm)}${role?` · ${esc(role)}`:''}</div>
      <div class="pa-avatar">${avatarHtml(e, nm)}</div>`;
    } else if(e.type==='Archetype'){
    inner += `<div class="persona-id">${archIconHtml(e)}<div><div class="name">${esc(e.title)}</div></div></div>
      <div class="excerpt">${esc(trim(stripLinks(afterLabel(e.body,'Short description')),150))}</div>
      <div class="kv"><b>${tr('Core pain')}</b> — ${esc(trim(stripLinks(afterLabel(e.body,'Core pain')),90))}</div>`;
  } else if(e.type==='Signal'){
    const q = firstQuote(e.body);
    const first = (q || stripLinks(e.body.split('\n').find(l=>l.trim() && !l.startsWith('#'))||'')).replace(/^["“”']+|["“”']+$/g,'');
    const date = section(e.body,'Interview date') || '';
    const ev = Array.isArray(e.fm.evidences)? e.fm.evidences : (e.fm.evidences?[e.fm.evidences]:[]);
    inner += `<div class="name">${esc(e.title)}</div>
      <div class="excerpt quote">${esc(trim(first,160))}</div>
      ${date?`<div class="kv"><b>${tr('Interview')}</b> — ${esc(date)}</div>`:''}
      ${stanceChip(e)}
      ${ev.length?`<div class="tags">${ev.map(x=>`<span class="tag">↳ ${esc(x)}</span>`).join('')}</div>`:''}`;
  } else if(e.type==='Evidence'){
    const tags = Array.isArray(e.fm.tags)? e.fm.tags : [];
    inner += `<div class="name">${esc(e.title)}</div>
      <div class="excerpt">${esc(trim(stripLinks(section(e.body,'Content')),170))}</div>
      ${tags.length?`<div class="tags">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}`;
  } else if(e.type==='Hypothesis'){
    const g = ideaGrounding(e);
    const open = hypoStatus(e)==='open';
    inner += `<div class="idea-card-top"><div class="name">${esc(e.title)}</div>${hypoStatusChip(e)}</div>
      <div class="kv"><b>If</b> — ${esc(trim(stripLinks(afterLabel(e.body,'If')),80))}</div>
      <div class="kv"><b>Will</b> — ${esc(trim(stripLinks(afterLabel(e.body,'Will')),80))}</div>
      <div class="kv"><b>${tr('Because')}</b> — ${esc(trim(stripLinks(afterLabel(e.body,'Because')),80))}</div>
      ${e.fm.feature?`<div class="tags"><span class="tag">${esc(e.fm.feature)}</span></div>`:''}
      ${open && g.level>0
        ? `<button type="button" class="hypo-promote" data-promote="${e.id}" title="${esc(tr('This bet has research behind it — turn it into a grounded Idea'))}">↑ ${tr('Has {what} — promote to Idea').replace('{what}', esc(g.detail))}</button>`
        : (open ? `<div class="ground-row">${tr("assumption — no evidence yet (that's fine, it's a hypothesis)")}</div>` : '')}`;
  } else if(e.type==='IdeaForImprovement'){
    const g = ideaGrounding(e);
    inner += `<div class="idea-card-top"><div class="name">${esc(e.title.replace(/^Idea:\s*/,'Idea: '))}</div>${votePillHtml(e)}</div>
      <div class="kv"><b>When</b> — ${esc(trim(stripLinks(afterLabel(e.body,'When')),80))}</div>
      <div class="kv"><b>I want</b> — ${esc(trim(stripLinks(afterLabel(e.body,'I want')),80))}</div>
      <div class="kv"><b>${tr('So that')}</b> — ${esc(trim(stripLinks(afterLabel(e.body,'So that')),80))}</div>
      <div class="ground-row">${barsHtml(g)}${esc(g.word)}${g.detail?` · ${esc(g.detail)}`:''}</div>`;
  } else if(e.type==='Transcript'){
    const firstLine = stripLinks((e.body.split('\n').find(l=>/^\*\*/.test(l.trim()))||'').trim());
    const gist = e.fm.abstract ? String(e.fm.abstract) : firstLine;
    const topics = Array.isArray(e.fm.topics) ? e.fm.topics : [];
    const nhl = entityHighlights(e).length;
    /* live word search: when the tab filter matches this transcript's body,
       show up to 3 KWIC snippet lines with the term marked */
    let kwic = '';
    const q = (searchInput.value||'').trim();
    if(q.length>1){
      const ql=q.toLowerCase();
      kwic = e.body.split('\n')
        .filter(l=>{ const s=l.trim(); return s && !s.startsWith('<!--') && !s.startsWith('#') && stripLinks(s).toLowerCase().includes(ql); })
        .slice(0,3)
        .map(l=>{
          const s=stripLinks(l); const i=s.toLowerCase().indexOf(ql);
          const from=Math.max(0, i-40);
          return `<div class="kwic">${from>0?'…':''}${esc(s.slice(from,i))}<b class="find-hit">${esc(s.slice(i,i+q.length))}</b>${esc(s.slice(i+q.length, i+q.length+70))}${s.length>i+q.length+70?'…':''}</div>`;
        }).join('');
    }
    inner += `<div class="name">${esc(e.title)}</div>
      ${e.fm.participant?`<div class="kv"><b>${tr('Participant')}</b> — ${esc(e.fm.participant)}</div>`:''}
      ${e.fm.method?`<div class="kv"><b>Method</b> — ${esc(e.fm.method)}</div>`:''}
      ${e.fm.date?`<div class="kv"><b>Date</b> — ${esc(e.fm.date)}</div>`:''}
      ${kwic || (gist?`<div class="excerpt">${esc(trim(gist,220))}</div>`:'')}
      ${topics.length || nhl ? `<div class="tags">${nhl?`<span class="tag hl-count" title="${esc(tr('Team highlights in this transcript'))}">🖍 ${nhl}</span>`:''}${topics.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}
      ${staleNoteHtml(e, true)}`;
  } else if(e.type==='Competitor'){
    const tags = Array.isArray(e.fm.tags)? e.fm.tags : [];
    inner += `<div class="persona-id">${compTileHtml(e,40)}<div><div class="name">${esc(e.title)}</div></div></div>
      <div class="excerpt">${esc(trim(stripLinks(section(e.body,'Market position')),150))}</div>
      ${heardBarHtml(e)}
      ${e.fm.proximity?`<div class="kv"><b>${tr('Proximity')}</b> — ${esc(e.fm.proximity)} (${tr(({direct:'SOM: same segment we researched',adjacent:'SAM: category we could serve',indirect:'TAM: same need, different product'})[String(e.fm.proximity).trim()]||'see Competitors/README.md')})</div>`:''}
      ${e.fm.retrieved?`<div class="kv"><b>${tr('Verified')}</b> — ${esc(e.fm.retrieved)}</div>`:''}
      ${tags.length?`<div class="tags">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}
      <div class="optin-note">${tr('Opt-in context — not used in conversations by default')}</div>`;
  }
  el.innerHTML = inner;
  el.onclick = ()=> { location.hash = '#'+e.id; };
  wireVotes(el);
  el.querySelectorAll('[data-promote]').forEach(b=> b.onclick = ev=>{ ev.stopPropagation(); promoteHypothesis(b.dataset.promote); });
  el.querySelectorAll('[data-exclude]').forEach(b=> b.onclick = ev=>{ ev.stopPropagation(); toggleExcluded(ENTITIES[b.dataset.exclude], true); });
  return el;
}
function trim(s,n){ s=(s||'').replace(/\s+/g,' ').trim(); return s.length>n? s.slice(0,n).replace(/[,;.]?\s+\S*$/,'')+'…' : s; }
function ideaGrounding(e){
  let sig=0, ev=0;
  for(const m of e.body.matchAll(MD_LINK)){
    const url = m[2]; if(/^https?:/.test(url)) continue;
    const id = resolveRef(url);
    const t = id && ENTITIES[id] && ENTITIES[id].type;
    if(t==='Signal') sig++; else if(t==='Evidence') ev++;
  }
  const level = (sig&&ev) ? 3 : sig ? 2 : ev ? 1 : 0;
  const word  = ['No research linked','Weak grounding','Medium grounding','Strong grounding'][level];
  const why   = ['assumption — nothing linked yet',
                 'desk research only — not confirmed in interviews',
                 'own research — signal(s) only, no external confirmation',
                 'signal + evidence — validated'][level];
  const parts = [];
  if(sig) parts.push(sig+' signal'+(sig>1?'s':'')); if(ev) parts.push(ev+' evidence');
  return { level, word, why, detail: parts.join(' + ') };
}

/* ---------- Idea voting (Spotify-style request board) ----------
   A vote is a voter NAME in the idea's `votes:` frontmatter — one entry per
   person (key = the `name:` from .claude/preferences.local.md, which every
   teammate sets once in Settings). Stored as a block YAML list so parallel
   votes on different branches merge cleanly in git. The app writes straight
   into the .md via the File System Access API (Chrome/Edge), so counts sync
   through a normal commit + pull. Voting again toggles your own vote off. */
function voteList(e){
  const v = e.fm.votes;
  if(Array.isArray(v)) return v.map(x=>String(x).trim()).filter(Boolean);
  return v && String(v).trim() ? [String(v).trim()] : [];
}
function voteCount(e){ return voteList(e).length; }
function myVoteName(){ return (PREFS.name||'').trim(); }
function iVoted(e){
  const who = myVoteName().toLowerCase(); if(!who) return false;
  return voteList(e).some(v=>v.toLowerCase()===who);
}
/* render a voter name as a safe single-line YAML scalar */
function yamlItem(s){
  s = String(s).replace(/[\r\n]+/g,' ').trim();
  return /^[\w][\w .,'’&()\/-]*$/.test(s) ? s : JSON.stringify(s);
}
/* replace the `votes:` block (line + any "- item" lines) in a raw .md */
function setVotesInMd(md, voters){
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if(!m) return md;
  let fm = m[1].replace(/\n?$/,'\n');
  fm = fm.replace(/^votes:[^\n]*\n(?:[ \t]+-[^\n]*\n)*/m, '');  // drop old votes block
  fm = fm.replace(/\n+$/,'');
  if(voters.length) fm += '\nvotes:\n' + voters.map(v=>'  - '+yamlItem(v)).join('\n');
  return md.replace(m[0], '---\n'+fm+'\n---');
}
function votePillHtml(e){
  const n = voteCount(e), mine = iVoted(e);
  const names = voteList(e);
  const tip = n ? tr('Voted by:')+' '+names.join(', ') : tr('No votes yet — be the first');
  return `<button type="button" class="vote-pill${mine?' voted':''}" data-vote="${e.id}" aria-pressed="${mine?'true':'false'}" title="${esc(tip)}">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
    <span class="vote-n">${n}</span></button>`;
}
function wireVotes(root){
  root.querySelectorAll('[data-vote]').forEach(b=> b.onclick = ev=>{ ev.stopPropagation(); ev.preventDefault(); toggleVote(ENTITIES[b.dataset.vote]); });
}
async function toggleVote(e){
  if(!e) return;
  const who = myVoteName();
  if(!who){ toast(tr('Add your name in Settings first — it’s your one-per-person vote key'), {label:tr('Open Settings'), fn:()=> settingsBtn.click()}); return; }
  const w = await ensureWritable(e); if(!w) return; e = w;
  const voters = voteList(e);
  const idx = voters.findIndex(v=>v.toLowerCase()===who.toLowerCase());
  if(idx>-1) voters.splice(idx,1); else voters.push(who);
  const md = setVotesInMd(e.md, voters);
  const ok = await saveEntityText(e, md);   // re-parses, reindexes, re-renders grid+tabs
  if(ok){
    toast(tr(idx>-1 ? 'Vote removed — commit & push to share' : 'Voted ✓ — commit & push to share'));
    if(CURRENT===e.id) openDetail(e.id);
  }
}

