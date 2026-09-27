/* ---------- Mind Map (Obsidian/Capacities-style link graph) ----------
   Strictly a VIEW: nodes are the current workspace's entities, edges are the
   links that already exist (body links, evidences:, idea:, mentioned_in:,
   same_participant_as:). Nothing here edits anything — vanilla JS + SVG force
   layout, offline, no packages. Hover highlights neighbors, double-click
   opens the file, drag/pan/wheel-zoom, legend toggles types. */
let MINDMAP_ACTIVE = false;
const MM_COLORS = { Persona:'#0ea5e9', Competitor:'#64748b', Archetype:'#8b5cf6', Hypothesis:'#f59e0b', Signal:'#e11d48', Evidence:'#10b981', IdeaForImprovement:'#eab308', Transcript:'#a1a1aa' };
let MM_HIDDEN = new Set();
let MM_FOCUS = null;   // entity id → local graph (Obsidian-style), null → whole workspace
let MM_DEPTH = 1;      // neighborhood radius in focused mode (1 or 2)
let MM_SELECTED = null; // node whose details are open in the drawer
/* Bar filters — independent of node-click focus (clicking a node never hides
   the rest; these two selects above the map do the narrowing): */
let MM_PERSONA = null;  // persona id → only nodes connected to her (2 hops: signals/evidence/ideas + the transcripts behind them)
let MM_MONTHS = 0;      // 0 = all time; 3/6/12 = hide Transcripts/Evidence dated older
                        // (GDPR art. 5(1)(e) storage limitation — predefined windows, no calendar; undated files stay visible)
let MM_VIEW = store.get('at-mm-view') || 'map'; // 'map' | 'flow' — via store, so it
  // stays namespaced per project copy and is covered by "Clear local data"
// Flow view reads left→right in research order: raw input → grounding → claims → bets
const MM_FLOW_ORDER = ['Transcript','Competitor','Evidence','Signal','Persona','Archetype','Hypothesis','IdeaForImprovement'];
/* Every first-degree connection in a set of entities — body links + the
   linking frontmatter fields. Shared by the map and the drawer stats. */
function graphPairs(ents){
  const idset = new Set(ents.map(e=>e.id));
  const edges = new Set();
  const add=(a,b)=>{ if(a && b && a!==b && idset.has(a) && idset.has(b)) edges.add(a<b ? a+'|'+b : b+'|'+a); };
  ents.forEach(e=>{
    for(const m of e.body.matchAll(MD_LINK)){ const u=m[2]; if(/^https?:/.test(u)) continue; add(e.id, resolveRef(u)); }
    (Array.isArray(e.fm.evidences)? e.fm.evidences : []).forEach(x=> add(e.id, byBasename[String(x).toLowerCase()]));
    if(e.fm.idea) add(e.id, resolveRef(e.fm.idea));
    (Array.isArray(e.fm.mentioned_in)? e.fm.mentioned_in : []).forEach(x=> add(e.id, byBasename[String(x).replace(/\.md$/i,'').toLowerCase()]));
    const sp = String(e.fm.same_participant_as||'').trim();
    if(sp) add(e.id, byBasename[sp.replace(/\.md$/i,'').toLowerCase()]);
  });
  return [...edges].map(k=>k.split('|'));
}
/* BFS over pairs from a start id, `depth` hops out */
function mmReach(pairs, start, depth){
  const adj = {};
  pairs.forEach(([a,b])=>{ (adj[a]=adj[a]||[]).push(b); (adj[b]=adj[b]||[]).push(a); });
  const keep = new Set([start]);
  let frontier=[start];
  for(let d=0; d<depth; d++){
    const next=[];
    frontier.forEach(id=> (adj[id]||[]).forEach(n=>{ if(!keep.has(n)){ keep.add(n); next.push(n); } }));
    frontier=next;
  }
  return keep;
}
/* the dated raw-data types: Transcript `date:`, Evidence `retrieved:` (or `date:`) */
function mmEntityDate(e){
  if(e.type==='Transcript') return parseAnyDate(e.fm.date);
  if(e.type==='Evidence') return parseAnyDate(e.fm.retrieved || e.fm.date);
  return null;
}
function mindmapData(focus, depth){
  let ents = wsEntities().filter(e=> !MM_HIDDEN.has(e.type));
  if(MM_MONTHS){                          // hide dated raw data older than the window; undated stays
    const cut = new Date(graphNow()); cut.setMonth(cut.getMonth()-MM_MONTHS);
    ents = ents.filter(e=>{ const d=mmEntityDate(e); return !d || d>=cut; });
  }
  let pairs = graphPairs(ents);
  let keep = new Set(ents.map(e=>e.id));
  if(MM_PERSONA && keep.has(MM_PERSONA)){ // her graph: 2 hops past the filtered edges
    keep = mmReach(pairs, MM_PERSONA, 2);
    pairs = pairs.filter(([a,b])=> keep.has(a) && keep.has(b));
  }
  if(focus && keep.has(focus)){           // BFS out to `depth` hops around the focus
    keep = mmReach(pairs, focus, depth||1);
    pairs = pairs.filter(([a,b])=> keep.has(a) && keep.has(b));
  }
  const deg = {};
  pairs.forEach(([a,b])=>{ deg[a]=(deg[a]||0)+1; deg[b]=(deg[b]||0)+1; });
  return {
    nodes: ents.filter(e=> keep.has(e.id)).map(e=>({ id:e.id, type:e.type, deg:deg[e.id]||0,
      title: e.title.replace(/^(Hypothesis|Idea):\s*/,''),
      excluded: e.type==='Transcript' && isExcluded(e) })),
    edges: pairs
  };
}
let MM_RAF = null; // kept for mindmapExit compatibility (layout is static now)
/* Columnar layout: one invisible vertical column per type (sidebar order),
   so every group has a fixed, findable place. Rows are ordered by a few
   barycenter sweeps (Sugiyama-lite) to untangle the edges. Pure function —
   mutates n.x/n.y and returns the content extent. */
function mmLayout(nodes, edges){
  const present = TYPE_ORDER.filter(ty=> nodes.some(n=>n.type===ty));
  const colOf = {}; present.forEach((ty,i)=> colOf[ty]=i);
  const COLW=290, ROWH=84, PADX=160, PADY=120;
  const cols = present.map(()=>[]);
  nodes.slice().sort((a,b)=> a.title.localeCompare(b.title)).forEach(n=> cols[colOf[n.type]].push(n));
  const adj={}; edges.forEach(([a,b])=>{ (adj[a]=adj[a]||[]).push(b); (adj[b]=adj[b]||[]).push(a); });
  const row={};
  cols.forEach(c=> c.forEach((n,i)=> row[n.id]=i));
  for(let s=0; s<4; s++){
    cols.forEach(c=>{
      c.sort((a,b)=>{
        const bary=n=>{ const nb=adj[n.id]||[]; return nb.length? nb.reduce((x,m)=> x+(row[m]??row[n.id]),0)/nb.length : row[n.id]; };
        return bary(a)-bary(b) || a.title.localeCompare(b.title);
      });
      c.forEach((n,i)=> row[n.id]=i);
    });
  }
  const maxRows = Math.max(1, ...cols.map(c=>c.length));
  cols.forEach((c,ci)=> c.forEach((n,ri)=>{
    n.x = PADX + ci*COLW;
    n.y = PADY + ri*ROWH + (maxRows-c.length)*ROWH/2;   // shorter columns float to the middle
  }));
  return { W: PADX*2 + Math.max(0,present.length-1)*COLW, H: PADY*2 + Math.max(0,maxRows-1)*ROWH, colTypes: present, COLW, PADX, PADY };
}
/* node face: persona avatars / competitor favicons when the file has one,
   otherwise the entity-type icon inside the colored disc */
function mmNodeFace(n, R){
  const e = ENTITIES[n.id];
  const pic = picFor(e);
  if(pic && pic.src){
    const r = R-2;
    return `<clipPath id="mmclip-${n.id}"><circle r="${r}"/></clipPath>
      <image href="${esc(pic.src)}" x="${-r}" y="${-r}" width="${2*r}" height="${2*r}" clip-path="url(#mmclip-${n.id})" preserveAspectRatio="xMidYMid slice"/>`;
  }
  const s = Math.round(R*1.15);
  return ICONS[n.type].replace('<svg width="14" height="14"', `<svg x="${-s/2}" y="${-s/2}" width="${s}" height="${s}" style="color:#fff"`);
}
/* Flow view: Sankey-style ribbons over the same graph data. Every raw file
   carries weight 1; a node's weight is whatever arrives from the left, split
   equally over its outgoing links — so a signal grounded by four interviews
   sends a visibly thicker band downstream than a one-off observation.
   Same-column links (e.g. two contradicting Signals) are not drawable here
   and stay on the Map view. */
function mmRenderFlow(nodes, edges, seg, legend, focusBar, filters){
  const byId={}; nodes.forEach(n=> byId[n.id]=n);
  const present = MM_FLOW_ORDER.filter(ty=> nodes.some(n=>n.type===ty));
  const colOf={}; present.forEach((ty,i)=> colOf[ty]=i);
  const dir=[];
  edges.forEach(([a,b])=>{
    const ca=colOf[byId[a].type], cb=colOf[byId[b].type];
    if(ca===cb) return;
    dir.push(ca<cb? {a,b,w:1} : {a:b,b:a,w:1});
  });
  const inE={}, outE={};
  dir.forEach(e=>{ (outE[e.a]=outE[e.a]||[]).push(e); (inE[e.b]=inE[e.b]||[]).push(e); });
  const val={};
  present.forEach(ty=> nodes.filter(n=>n.type===ty).forEach(n=>{   // left→right, so inputs are always resolved
    const inc=(inE[n.id]||[]).reduce((s,e)=> s+e.w,0);
    val[n.id]=Math.max(1,inc);
    (outE[n.id]||[]).forEach((e,_,outs)=> e.w=val[n.id]/outs.length);
  }));
  // geometry: one column per type, bar height ∝ weight, columns vertically centered
  const GAP=10, BARW=14, VW=1200, PADX=100, PADT=72, PADB=28;
  const cols = present.map(ty=> nodes.filter(n=>n.type===ty));
  const HU = Math.max(540, ...cols.map(c=> c.length*15+(c.length-1)*GAP));
  const unit = Math.min(...cols.map(c=> (HU-(c.length-1)*GAP)/c.reduce((s,n)=> s+val[n.id],0)));
  const barH={}; nodes.forEach(n=> barH[n.id]=Math.max(5, val[n.id]*unit));
  const step = present.length>1 ? (VW-2*PADX-BARW)/(present.length-1) : 0;
  const X={}; present.forEach((ty,i)=> X[ty]=PADX+i*step);
  const colH = c=> c.reduce((s,n)=> s+barH[n.id],0)+(c.length-1)*GAP;
  const totalH = Math.max(...cols.map(colH));
  const Y={};
  const bary = n=>{ const ins=inE[n.id]||[]; return ins.length? ins.reduce((s,e)=> s+Y[e.a]+barH[e.a]/2,0)/ins.length : 1e6; };
  cols.forEach((c,ci)=>{
    if(ci===0) c.sort((x,y)=> val[y.id]-val[x.id] || x.title.localeCompare(y.title));
    else c.sort((x,y)=> bary(x)-bary(y) || val[y.id]-val[x.id] || x.title.localeCompare(y.title));
    let y = PADT + (totalH-colH(c))/2;
    c.forEach(n=>{ Y[n.id]=y; y+=barH[n.id]+GAP; });
  });
  // band anchors: incoming stacked by source height, outgoing by target height
  nodes.forEach(n=>{
    (inE[n.id]||[]).sort((p,q)=> Y[p.a]-Y[q.a] || X[byId[p.a].type]-X[byId[q.a].type]);
    (outE[n.id]||[]).sort((p,q)=> Y[p.b]-Y[q.b] || X[byId[p.b].type]-X[byId[q.b].type]);
    let o=0; (inE[n.id]||[]).forEach(e=>{ e.tt=e.w/val[n.id]*barH[n.id]; e.ty=Y[n.id]+o; o+=e.tt; });
    o=0; (outE[n.id]||[]).forEach(e=>{ e.ts=e.w/val[n.id]*barH[n.id]; e.sy=Y[n.id]+o; o+=e.ts; });
  });
  const r2 = v=> Math.round(v*100)/100;
  const band = e=>{
    const x0=X[byId[e.a].type]+BARW, x1=X[byId[e.b].type], mx=(x0+x1)/2;
    return `M ${x0} ${r2(e.sy)} C ${mx} ${r2(e.sy)}, ${mx} ${r2(e.ty)}, ${x1} ${r2(e.ty)} L ${x1} ${r2(e.ty+e.tt)} C ${mx} ${r2(e.ty+e.tt)}, ${mx} ${r2(e.sy+e.ts)}, ${x0} ${r2(e.sy+e.ts)} Z`;
  };
  const VH = PADT + totalH + PADB;
  const heads = present.map(ty=>`<text class="mm-colhead" x="${r2(X[ty]+BARW/2)}" y="${PADT-34}">${tr(TYPES[ty].label)} (${cols[colOf[ty]].length})</text>`).join('');
  const bands = dir.map(e=>`<path class="mm-fband" data-a="${e.a}" data-b="${e.b}" d="${band(e)}" fill="${MM_COLORS[byId[e.a].type]}"/>`).join('');
  const bars = nodes.map(n=>{
    const last = colOf[n.type]===present.length-1;
    return `<g class="mm-node mm-fnode${n.excluded?' mm-exc':''}" data-id="${n.id}" transform="translate(${r2(X[n.type])},${r2(Y[n.id])})">
      <rect width="${BARW}" height="${r2(barH[n.id])}" rx="4" fill="${MM_COLORS[n.type]}"/>
      ${barH[n.id]>=11?`<text x="${last?-7:BARW+7}" y="${r2(barH[n.id]/2+3.5)}" text-anchor="${last?'end':'start'}">${esc(trim(n.title,22))}<tspan class="mm-fcount">  ${n.deg}</tspan></text>`:''}
    </g>`;
  }).join('');
  const hint = tr(dir.length ? 'thicker band = more research flowing through' : 'no cross-type links to draw yet — the Map view shows everything');
  grid.innerHTML = `
    <div class="mm-bar">${seg}${filters||''}${legend}<span class="mm-stats">${trn(nodes.length,'{n} entity','{n} entities','{n} element','{n} elementy','{n} elementów')} · ${trn(dir.length,'{n} connection','{n} connections','{n} połączenie','{n} połączenia','{n} połączeń')} — ${hint}</span></div>
    ${focusBar}
    <div class="mm-canvas mm-canvas-flow"><svg id="mmFlowSvg" class="mm-flow-svg" viewBox="0 0 ${VW} ${VH}"
      role="img" aria-label="${esc(tr('Flow diagram: {n} entities and {c} connections between types, band thickness showing how much research flows through each. The same relationships are readable as text in the type tabs and table view.')
        .replace('{n}', nodes.length).replace('{c}', dir.length))}">
      ${heads}<g>${bands}</g><g>${bars}</g>
    </svg><div class="mm-tip" id="mmTip" style="display:none"></div>
    <aside class="mm-drawer" id="mmDrawer"></aside></div>`;
  const svg = document.getElementById('mmFlowSvg');
  const tip = document.getElementById('mmTip');
  const bandEls = [...svg.querySelectorAll('.mm-fband')];
  const touch = id=> bandEls.forEach(p=> p.classList.toggle('on', !!id && (p.dataset.a===id || p.dataset.b===id)));
  svg.querySelectorAll('.mm-fnode').forEach(el=>{
    const id=el.dataset.id, n=byId[id];
    el.addEventListener('pointerenter', ()=>{
      svg.classList.add('mm-dimming'); touch(id);
      const ins=(inE[id]||[]).length, outs=(outE[id]||[]).length;
      tip.innerHTML = `<b>${esc(n.title)}</b><small>${TYPES[n.type].singular} · ${ins} in · ${outs} out · research weight ${r2(val[id])}${n.excluded?' · excluded from analysis':''} — click for details, double-click to open</small>`;
      tip.style.display='block';
    });
    el.addEventListener('pointerleave', ()=>{ svg.classList.remove('mm-dimming'); touch(null); tip.style.display='none'; });
    el.addEventListener('click', ()=> mmOpenDrawer(id));
    el.addEventListener('dblclick', ()=> location.hash='#'+id);
  });
  bandEls.forEach(p=>{
    p.addEventListener('pointerenter', ()=>{
      p.classList.add('on'); svg.classList.add('mm-dimming');
      tip.innerHTML = `<b>${esc(byId[p.dataset.a].title)} → ${esc(byId[p.dataset.b].title)}</b>`;
      tip.style.display='block';
    });
    p.addEventListener('pointerleave', ()=>{ p.classList.remove('on'); svg.classList.remove('mm-dimming'); tip.style.display='none'; });
  });
  svg.addEventListener('pointerdown', ev=>{ if(!ev.target.closest('.mm-fnode, .mm-fband')) mmCloseDrawer(); });
  if(MM_SELECTED && byId[MM_SELECTED]) mmOpenDrawer(MM_SELECTED); else mmCloseDrawer();
}
function renderMindMap(){
  if(MM_FOCUS && !ENTITIES[MM_FOCUS]){ MM_FOCUS=null; }
  const { nodes, edges } = mindmapData(MM_FOCUS, MM_DEPTH);
  grid.className = 'mindmap-wrap';
  if(!nodes.length){
    grid.innerHTML = `<div class="didyouknow"><div class="kicker">${tr('Mind Map')}</div><h3>${tr('Nothing to map in this workspace yet.')}</h3><p>${tr('The map draws itself from the links your files already have — bring research in and it appears here.')}</p></div>`;
    return;
  }
  const L = mmLayout(nodes, edges);
  const VW=1200, VH=800;
  const byId = {}; nodes.forEach(n=> byId[n.id]=n);
  const adj = {}; edges.forEach(([a,b])=>{ (adj[a]=adj[a]||new Set()).add(b); (adj[b]=adj[b]||new Set()).add(a); });
  const legend = TYPE_ORDER.filter(ty=> wsEntities().some(e=>e.type===ty)).map(ty=>
    `<button class="mm-leg${MM_HIDDEN.has(ty)?' off':''}" data-ty="${ty}"><i style="background:${MM_COLORS[ty]}"></i>${tr(TYPES[ty].label)}</button>`).join('');
  const personas = wsEntities().filter(x=>x.type==='Persona').sort((a,b)=>a.title.localeCompare(b.title));
  const filters = `
    <select class="mm-filter${MM_PERSONA?' on':''}" id="mmPersonaF" title="${esc(tr("Show only this persona's graph — her signals, evidence, ideas and the sessions behind them (2 hops). Clicking nodes still never hides anything."))}">
      <option value="">${tr('Persona: all')}</option>
      ${personas.map(p=>`<option value="${p.id}"${p.id===MM_PERSONA?' selected':''}>${tr('Persona:')} ${esc(p.title)}</option>`).join('')}
    </select>
    <select class="mm-filter${MM_MONTHS?' on':''}" id="mmDateF" title="${esc(tr("Freshness window for dated raw data (Transcript date:, Evidence retrieved:). Predefined periods only — GDPR art. 5(1)(e) storage limitation: don't lean on research data indefinitely; the repo flags anything older than 3 months for a refresh round. Undated files stay visible."))}">
      <option value="0">${tr('Data: all time')}</option>
      <option value="3"${MM_MONTHS===3?' selected':''}>${tr('Data: last 3 months')}</option>
      <option value="6"${MM_MONTHS===6?' selected':''}>${tr('Data: last 6 months')}</option>
      <option value="12"${MM_MONTHS===12?' selected':''}>${tr('Data: last 12 months')}</option>
    </select>`;
  const focusBar = MM_FOCUS ? `
    <div class="mm-focus-bar">◎ ${tr('Focused on')} <b>${esc(ENTITIES[MM_FOCUS].title)}</b> · ${tr('depth')}
      <button class="mm-depth${MM_DEPTH===1?' on':''}" data-d="1">1</button>
      <button class="mm-depth${MM_DEPTH===2?' on':''}" data-d="2">2</button>
      <button class="mm-wholemap" id="mmWhole">✕ ${tr('show the whole graph')}</button></div>` : '';
  const seg = `<div class="mm-seg" role="tablist">
      <button class="${MM_VIEW!=='flow'?'on':''}" data-v="map">${tr('Map')}</button>
      <button class="${MM_VIEW==='flow'?'on':''}" data-v="flow">${tr('Flow')}</button></div>`;
  if(MM_VIEW==='flow'){ mmRenderFlow(nodes, edges, seg, legend, focusBar, filters); mmWireBar(); return; }
  const nCount = ty=> nodes.filter(n=>n.type===ty).length;
  grid.innerHTML = `
    <div class="mm-bar">${seg}${filters}${legend}<span class="mm-stats">${trn(nodes.length,'{n} node','{n} nodes','{n} węzeł','{n} węzły','{n} węzłów')} · ${trn(edges.length,'{n} link','{n} links','{n} połączenie','{n} połączenia','{n} połączeń')} — ${tr('click for details, double-click to open, drag / wheel to move around')}</span></div>
    ${focusBar}
    <div class="mm-canvas"><svg id="mmSvg" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet"
      role="img" aria-label="${esc(tr('Graph diagram: {n} entities in {c} columns ({cols}), joined by {l} links. Every entity and every link here is also reachable as text — use the type tabs and the table view.')
        .replace('{n}', nodes.length).replace('{c}', L.colTypes.length)
        .replace('{cols}', L.colTypes.map(ty=>`${tr(TYPES[ty].label)} ${nCount(ty)}`).join(', ')).replace('{l}', edges.length))}">
      <g id="mmWorld">
        <g id="mmHeads">${L.colTypes.map((ty,i)=>`<text class="mm-colhead" x="${L.PADX+i*L.COLW}" y="${L.PADY-58}">${tr(TYPES[ty].label)} (${nCount(ty)})</text>`).join('')}</g>
        <g id="mmEdges">${edges.map(([a,b])=>`<line data-ea="${a}" data-eb="${b}"/>`).join('')}</g>
        <g id="mmNodes">${nodes.map(n=>{
          const R = 13 + Math.min(7, n.deg);
          return `<g class="mm-node${n.excluded?' mm-exc':''}${n.id===MM_FOCUS?' mm-focus':''}" data-id="${n.id}">
            <circle r="${R}" fill="${MM_COLORS[n.type]}"/>
            ${mmNodeFace(n, R)}
            <text dy="${R+13}">${esc(trim(n.title,26))}</text>
          </g>`; }).join('')}</g>
      </g>
    </svg><div class="mm-tip" id="mmTip" style="display:none"></div>
    <aside class="mm-drawer" id="mmDrawer"></aside></div>`;
  mmWireBar();
  const svg = document.getElementById('mmSvg');
  const world = document.getElementById('mmWorld');
  const lineEls = [...svg.querySelectorAll('#mmEdges line')];   // edges only — node icons (Feather) contain their own <line>s
  const nodeEls = {}; [...svg.querySelectorAll('.mm-node')].forEach(el=> nodeEls[el.dataset.id]=el);
  const place = ()=>{
    nodes.forEach(n=> nodeEls[n.id].setAttribute('transform', `translate(${n.x},${n.y})`));
    lineEls.forEach(l=>{ const a=byId[l.dataset.ea], b=byId[l.dataset.eb];
      l.setAttribute('x1',a.x); l.setAttribute('y1',a.y); l.setAttribute('x2',b.x); l.setAttribute('y2',b.y); });
  };
  place();
  /* camera: translate+scale on the world group — zoom really scales the map
     (Obsidian-style); labels fade away when far out */
  const cam = { k:1, tx:0, ty:0 };
  const applyCam = ()=>{
    world.setAttribute('transform', `translate(${cam.tx},${cam.ty}) scale(${cam.k})`);
    svg.classList.toggle('mm-far', cam.k < 0.55);
  };
  const fit = ()=>{
    cam.k = Math.min((VW-60)/L.W, (VH-60)/L.H, 1.15);
    cam.tx = (VW - L.W*cam.k)/2; cam.ty = (VH - L.H*cam.k)/2;
    applyCam();
  };
  fit();
  const pt = svg.createSVGPoint();
  const toSvg = ev=>{ pt.x=ev.clientX; pt.y=ev.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  const toWorld = p=>({ x:(p.x-cam.tx)/cam.k, y:(p.y-cam.ty)/cam.k });
  // hover: light up the neighborhood
  const tip = document.getElementById('mmTip');
  const setFocus = id=>{
    const nb = adj[id]||new Set();
    Object.entries(nodeEls).forEach(([nid,el])=> el.classList.toggle('dim', !!id && nid!==id && !nb.has(nid)));
    lineEls.forEach(l=> l.classList.toggle('lit', !!id && (l.dataset.ea===id || l.dataset.eb===id)));
    if(!id) lineEls.forEach(l=> l.classList.remove('lit'));
  };
  Object.entries(nodeEls).forEach(([id,el])=>{
    el.addEventListener('pointerenter', ()=>{
      setFocus(id);
      const n=byId[id];
      tip.innerHTML = `<b>${esc(n.title)}</b><small>${TYPES[n.type].singular} · ${n.deg} link${n.deg===1?'':'s'}${n.excluded?' · excluded from analysis':''} — double-click to open</small>`;
      tip.style.display='block';
    });
    el.addEventListener('pointerleave', ()=>{ setFocus(null); tip.style.display='none'; });
    el.addEventListener('dblclick', ()=>{ location.hash='#'+id; });
    el.addEventListener('pointerdown', ev=>{           // drag a node; a still pointer = click → drawer
      ev.preventDefault(); ev.stopPropagation();
      const n=byId[id];
      const sx=ev.clientX, sy=ev.clientY; let moved=false;
      const move=e2=>{
        if(Math.abs(e2.clientX-sx)+Math.abs(e2.clientY-sy)>4) moved=true;
        if(moved){ const w=toWorld(toSvg(e2)); n.x=w.x; n.y=w.y; place(); }
      };
      const up=()=>{
        el.removeEventListener('pointermove',move); el.removeEventListener('pointerup',up);
        if(!moved) mmOpenDrawer(id);
      };
      try{ el.setPointerCapture(ev.pointerId); }catch(err){}
      el.addEventListener('pointermove',move); el.addEventListener('pointerup',up);
    });
  });
  if(MM_SELECTED && nodeEls[MM_SELECTED]) mmOpenDrawer(MM_SELECTED); else mmCloseDrawer();
  // pan + wheel zoom (around the cursor) on the background
  svg.addEventListener('pointerdown', ev=>{
    if(ev.target.closest('.mm-node')) return;
    mmCloseDrawer();
    const s0=toSvg(ev), ox=cam.tx, oy=cam.ty;
    const move=e2=>{ const p=toSvg(e2); cam.tx=ox+(p.x-s0.x); cam.ty=oy+(p.y-s0.y); applyCam(); };
    const up=()=>{ svg.removeEventListener('pointermove',move); svg.removeEventListener('pointerup',up); };
    try{ svg.setPointerCapture(ev.pointerId); }catch(err){}
    svg.addEventListener('pointermove',move); svg.addEventListener('pointerup',up);
  });
  svg.addEventListener('wheel', ev=>{
    ev.preventDefault();
    const p = toSvg(ev);
    const k2 = Math.max(0.12, Math.min(5, cam.k * (ev.deltaY>0 ? 1/1.16 : 1.16)));
    cam.tx = p.x - (p.x-cam.tx)*(k2/cam.k);
    cam.ty = p.y - (p.y-cam.ty)*(k2/cam.k);
    cam.k = k2;
    applyCam();
  }, {passive:false});
}
/* shared wiring for the bar above both views: legend toggles, view switch, focus controls */
function mmWireBar(){
  const focusEl = grid.querySelector('#mmWhole');
  if(focusEl) focusEl.onclick = ()=>{ MM_FOCUS=null; MM_SELECTED=null; suppressRoute=true; location.hash='#mindmap'; renderMindMap(); };
  grid.querySelectorAll('.mm-depth').forEach(b=> b.onclick=()=>{ MM_DEPTH=+b.dataset.d; renderMindMap(); });
  grid.querySelectorAll('.mm-seg button').forEach(b=> b.onclick=()=>{
    if(b.dataset.v===MM_VIEW) return;
    MM_VIEW=b.dataset.v; store.set('at-mm-view', MM_VIEW);
    renderMindMap();
  });
  grid.querySelectorAll('.mm-leg').forEach(b=> b.onclick=()=>{
    const ty=b.dataset.ty;
    if(MM_HIDDEN.has(ty)) MM_HIDDEN.delete(ty); else MM_HIDDEN.add(ty);
    renderMindMap();
  });
  const pf = grid.querySelector('#mmPersonaF');
  if(pf) pf.onchange = ()=>{ MM_PERSONA = pf.value || null; renderMindMap(); };
  const df = grid.querySelector('#mmDateF');
  if(df) df.onchange = ()=>{ MM_MONTHS = +df.value || 0; renderMindMap(); };
}
/* The at-a-glance strip at the top of the drawer: what this entity is made of,
   counted over the FULL workspace graph (map filters don't change the truth).
   The first chip per type is load-bearing and shows even at 0 — an honest gap;
   the rest appear only when non-zero. */
function mmStatsHtml(e){
  const nb = [];
  graphPairs(wsEntities()).forEach(([a,b])=>{
    if(a===e.id && ENTITIES[b]) nb.push(ENTITIES[b]);
    else if(b===e.id && ENTITIES[a]) nb.push(ENTITIES[a]);
  });
  const by = t => nb.filter(x=>x.type===t).length;
  const interviews = (()=>{ const s=new Set(); nb.forEach(x=>{ if(x.type==='Transcript' && !isExcluded(x)) s.add(participantGroupId(x)); }); return s.size; })();
  const chip = (n, label, title, always)=> (always || n) ? `<span class="mm-chip"${title?` title="${esc(title)}"`:''}><b>${n}</b>${esc(label)}</span>` : '';
  // one plural helper per noun — Polish needs three forms where English needs two
  const wInterview = n => ' '+plw(n,'interview','interviews','wywiad','wywiady','wywiadów');
  const wSignal    = n => ' '+plw(n,'signal','signals','sygnał','sygnały','sygnałów');
  const wPersona   = n => ' '+plw(n,'persona','personas','persona','persony','person');
  const wIdea      = n => ' '+plw(n,'idea','ideas','pomysł','pomysły','pomysłów');
  const wVote      = n => ' '+plw(n,'vote','votes','głos','głosy','głosów');
  const wEvidence  = () => ' '+tr('evidence');
  let chips = '';
  if(e.type==='Signal'){
    chips = chip(interviews, wInterview(interviews), tr('Distinct participants this observation was heard from — excluded sessions don’t count'), true)
          + chip(by('Evidence'), wEvidence(), tr('Desk-research files this signal links to'));
  } else if(e.type==='Evidence'){
    chips = chip(by('Signal'), wSignal(by('Signal'))+' '+tr('grounded'), tr('Interview observations that cite this evidence'), true)
          + chip(by('Persona'), wPersona(by('Persona')));
  } else if(e.type==='Persona'){
    const p = personaParticipants(e);
    chips = chip(by('Signal'), wSignal(by('Signal')), tr('Signals linked from Pains and Quotes'), true)
          + chip(by('Evidence'), wEvidence(), '', true)
          + chip(p, wInterview(p), tr('Distinct research participants behind this persona'), true)
          + chip(by('IdeaForImprovement'), wIdea(by('IdeaForImprovement')));
  } else if(e.type==='Archetype'){
    chips = chip(by('Persona'), wPersona(by('Persona')), tr('The face(s) this pattern wears'), true)
          + chip(by('Signal'), wSignal(by('Signal')));
  } else if(e.type==='Transcript'){
    chips = chip(by('Signal'), wSignal(by('Signal'))+' '+tr('extracted'), tr('Observations pulled out of this session by /extract-findings'), true);
  } else if(e.type==='Competitor'){
    const m = competitorMentions(e), T = distinctParticipants();
    chips = chip(`${m} ${tr('of')} ${T}`, ' '+tr('heard from'), tr('Distinct participants who brought this competitor up'), true)
          + chip(by('Signal'), wSignal(by('Signal')));
  } else if(e.type==='Hypothesis'){
    chips = chip(0, ' '+tr('evidence — by definition'), tr('A hypothesis is a bet with zero grounding; the day it earns a Signal or Evidence, promote it to an Idea'), true)
          + (e.fm.status ? `<span class="mm-chip">${esc(String(e.fm.status))}</span>` : '');
  } else if(e.type==='IdeaForImprovement'){
    chips = chip(by('Signal'), wSignal(by('Signal')), '', true)
          + chip(by('Evidence'), wEvidence(), '', true)
          + chip(voteCount(e), wVote(voteCount(e)));
  } else {
    chips = chip(nb.length, ' '+plw(nb.length,'linked entity','linked entities','powiązany element','powiązane elementy','powiązanych elementów'), '', true);
  }
  return `<div class="mm-dr-stats">${chips}</div>`;
}
/* right-hand detail pane: a read-only preview of the clicked node */
function mmOpenDrawer(id){
  const e = ENTITIES[id]; const dr = document.getElementById('mmDrawer');
  if(!e || !dr) return;
  MM_SELECTED = id;
  const { edges } = mindmapData(MM_FOCUS, MM_DEPTH);
  const deg = edges.filter(([a,b])=> a===id||b===id).length;
  dr.innerHTML = `
    <div class="mm-dr-head">
      <span class="type-badge">${ICONS[e.type]}${e.meta.singular}</span>
      ${e.fm.demo?'<span class="demo-badge">Demo</span>':''}${e.draft?'<span class="demo-badge draft-badge">Draft</span>':''}
      <button class="modal-x" id="mmDrX" aria-label="${esc(tr('Close details'))}">✕</button>
    </div>
    <h3>${esc(e.title)}</h3>
    ${mmStatsHtml(e)}
    <div class="mm-dr-sub">${trn(deg,'{n} link on this map','{n} links on this map','{n} połączenie na tej mapie','{n} połączenia na tej mapie','{n} połączeń na tej mapie')}${e.type==='Transcript'&&isExcluded(e)?' · '+tr('excluded from analysis'):''}</div>
    <div class="mm-dr-actions">
      <button class="btn btn-primary btn-sm" id="mmDrOpen">${tr('Open file →')}</button>
      ${MM_FOCUS===id?'':`<button class="btn btn-outline btn-sm" id="mmDrFocus">◎ ${tr('Focus map here')}</button>`}
    </div>
    <div class="mm-dr-doc doc">${mdToHtml(e.body.replace(/^#\s+.*\n/,''))}</div>`;
  dr.classList.add('open');
  document.getElementById('mmDrX').onclick = mmCloseDrawer;
  document.getElementById('mmDrOpen').onclick = ()=>{ location.hash='#'+id; };
  const fb = document.getElementById('mmDrFocus');
  if(fb) fb.onclick = ()=>{ MM_FOCUS=id; MM_SELECTED=id; suppressRoute=true; location.hash='#mindmap:'+id; renderMindMap(); };
  dr.querySelectorAll('a.xref[data-goto]').forEach(a=> a.onclick = ev=>{
    ev.preventDefault();
    const gid = a.getAttribute('data-goto');
    if(gid && document.querySelector(`.mm-node[data-id="${gid}"]`)) mmOpenDrawer(gid);
    else if(gid) location.hash='#'+gid;
  });
}
function mmCloseDrawer(){
  MM_SELECTED = null;
  const dr = document.getElementById('mmDrawer');
  if(dr) dr.classList.remove('open');
}
function mindmapEnter(focusId){
  MM_FOCUS = focusId || null;
  if(focusId) MM_HIDDEN.clear();   // a focused view must never hide its own center
  settingsExit(); helpExit();
  MINDMAP_ACTIVE = true;
  syncLinTheme();
  document.getElementById('mindmapBtn').classList.add('active');
  galleryView.style.display=""; detailView.classList.remove('active');
  pageTitle.textContent = tr('Mind Map');
  pageSub.textContent = tr('Every connection your files already have — signals to evidence, ideas to their grounding, hypotheses to the ideas they became. A map to read, not an editor: change links in the files and the map follows.');
  pageSub.style.display='';
  hideGalleryChrome();
  renderTabs(); // clear any graph-tab highlight — this page owns the active state
  document.querySelector('.view-toggle').style.display='none';
  renderMindMap(); window.scrollTo(0,0);
}
function mindmapExit(){
  if(!MINDMAP_ACTIVE) return;
  MINDMAP_ACTIVE = false;
  cancelAnimationFrame(MM_RAF);
  document.getElementById('mindmapBtn').classList.remove('active');
  updatePageHead();
}
document.getElementById('mindmapBtn').onclick = ()=>{ MM_FOCUS=null; MM_SELECTED=null; location.hash = '#mindmap'; };
document.getElementById('mapHereBtn').onclick = ()=>{ if(CURRENT){ MM_SELECTED=CURRENT; location.hash = '#mindmap:'+CURRENT; } };

