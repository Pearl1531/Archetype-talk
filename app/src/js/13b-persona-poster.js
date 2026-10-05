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
      let t=l.slice(2).trim().replace(PP_LINK_RE,''), src='', sid=null;
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

/* ---------- connections: quotes → pains → relievers ----------
   A persona is built from parts that answer each other: this quote is about
   that pain, this reliever eases those two. Two kinds of connection:

   · derived — a quote and a pain that cite the SAME Signal are about the same
     observation; drawn automatically, not editable (change the links instead)
   · written — a trailing `(→ Pain; Other pain)` on a Relevant Quotes or
     Potential Pain Relievers bullet. One-to-many is just a longer list. A pain
     is named by its Signal's title (or, without a Signal, its own text). The
     token is plain text in the file, so the researcher can type it by hand,
     the poster can draw and edit it, and any AI agent reads it as written —
     Personas/_template.md documents it. */
const PP_LINK_RE = /\s*\(→\s*([^)]*)\)\s*$/;
const PP_LINKABLE = { q: 'Relevant Quotes', r: 'Potential Pain Relievers' };
/* the top-level bullets of one ## section with their line numbers in the file —
   the same bullets, in the same order, as posterBullets() shows */
function ppRaw(md, sec){
  const lines = md.split('\n');
  const re = new RegExp('^##\\s*' + sec.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\s*$', 'i');
  const h = lines.findIndex(l=> re.test(l)); if(h < 0) return [];
  const out = [];
  for(let i = h+1; i < lines.length && !/^#{1,2}\s/.test(lines[i]); i++){
    if(!/^- /.test(lines[i])) continue;
    const b = posterBullets(lines[i])[0]; if(!b) continue;   // same filter as the cards (no comments, no empties)
    const m = lines[i].match(PP_LINK_RE);
    out.push({ i, b, has: !!m, to: m ? m[1].split(';').map(x=> x.trim()).filter(x=> x && !/^none$/i.test(x)) : [] });
  }
  return out;
}
const ppPainKey = p => (p.src || p.t).trim();
function ppSetLinks(md, lineNo, names /*, explicit */){
  const lines = md.split('\n');
  // explicit = the token is the whole list (a quote's same-signal link no longer applies): empty → "none"
  lines[lineNo] = lines[lineNo].replace(PP_LINK_RE, '') + (names.length ? ` (→ ${names.join('; ')})` : (arguments[3] ? ' (→ none)' : ''));
  return lines.join('\n');
}
/* change one bullet's written links and save — through the same path as every edit (file / sandbox / draft) */
async function ppSaveLinks(e, kind, idx, names, msg){
  const w = await ensureWritable(e); if(!w) return;
  const item = ppRaw(w.md, PP_LINKABLE[kind])[idx]; if(!item) return;
  // a quote with a same-signal pain keeps an explicit list, so removing that implicit link sticks
  if(await saveEntityText(w, ppSetLinks(w.md, item.i, names, kind==='q'))) ppAfterSave(w.id, msg);
}
/* ---------- the wire layer, shared by both three-column sections ----------
   Cards carry data-pp-node; `edges` are {a, b, kind:'auto'|'man', …}. Draws
   the curves, removes a written ('man') edge on click, and turns a drag from
   a .pp-port onto another card into onConnect(fromNode, toNode). */
let PP_ROS = [];
function ppWires(box, edges, onRemove, onConnect){
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','pp-wires'); svg.setAttribute('aria-hidden','true');
  box.prepend(svg);
  const node = id => box.querySelector(`[data-pp-node="${id}"]`);
  const pathD = (B, ed)=>{
    const A = node(ed.a), Z = node(ed.b); if(!A || !Z) return '';
    const a = A.getBoundingClientRect(), z = Z.getBoundingClientRect();
    const x1 = a.right - B.left, y1 = a.top + a.height/2 - B.top, x2 = z.left - B.left, y2 = z.top + z.height/2 - B.top;
    const c = Math.max(30, (x2-x1)/2);
    return `M${x1} ${y1} C${x1+c} ${y1} ${x2-c} ${y2} ${x2} ${y2}`;
  };
  let paths = [];
  const draw = ()=>{
    const B = box.getBoundingClientRect();
    svg.setAttribute('width', B.width); svg.setAttribute('height', B.height);
    svg.innerHTML = edges.map((ed,k)=>{
      const d = pathD(B, ed); if(!d) return '';
      return `<path class="pp-wire ${ed.kind}${ed.long?' long':''}" data-wire="${k}" d="${d}"/><path class="pp-wire-hit" data-edge="${k}" d="${d}"><title>${esc(tr('Click to remove this connection'))}</title></path>`;
    }).join('') + '<path class="pp-wire drag" d=""/>';
    paths = edges.map((_,k)=> svg.querySelectorAll(`[data-wire="${k}"],[data-edge="${k}"]`));
    svg.querySelectorAll('[data-edge]').forEach(h=>{
      h.onclick = ()=> onRemove(edges[+h.dataset.edge]);
      h.onmouseenter = ()=> clearTimeout(unhot);   // moving from a card onto its wire keeps the stream lit
      h.onmouseleave = ()=> leave();
    });
    if(hot) light(hot);
  };
  /* hover a card → light its stream: everything reachable downstream (a→b)
     and upstream (b→a) from it; every other wire and card steps back */
  let hot = null, unhot = 0;
  const light = id=>{
    hot = id;
    const nodes = new Map([[id, 0]]), lit = new Set();   // node → steps from the hovered card
    const walk = (start, fwd)=>{
      const q = [start];
      while(q.length){ const n = q.shift(); edges.forEach((ed,k)=>{ const [x, y] = fwd ? [ed.a, ed.b] : [ed.b, ed.a];
        if(x===n){ lit.add(k); if(!nodes.has(y)){ nodes.set(y, nodes.get(n) + 1); q.push(y); } } }); }
    };
    walk(id, true); walk(id, false);
    box.classList.toggle('pp-focus', !!id);
    box.querySelectorAll('[data-pp-node]').forEach(c=>{ const on = nodes.has(c.dataset.ppNode);
      c.classList.toggle('pp-hot', on); c.style.setProperty('--d', on ? nodes.get(c.dataset.ppNode) : 0); });
    track(700);
    svg.querySelectorAll('[data-wire],[data-edge]').forEach(p=> p.classList.toggle('hot', lit.has(+(p.dataset.wire ?? p.dataset.edge))));
  };
  const leave = ()=>{ clearTimeout(unhot); unhot = setTimeout(()=>{ hot = null; box.classList.remove('pp-focus');
    box.querySelectorAll('.pp-hot').forEach(c=> c.classList.remove('pp-hot')); svg.querySelectorAll('.hot').forEach(p=> p.classList.remove('hot')); track(700); }, 160); };
  /* a lifted card drags its wire ends along: re-aim the existing paths every
     frame while anything is still moving (rebuilding them would drop hover) */
  let until = 0, raf = 0;
  const step = ()=>{ const B = box.getBoundingClientRect();
    edges.forEach((ed,k)=>{ const d = pathD(B, ed); paths[k] && paths[k].forEach(p=> p.setAttribute('d', d)); });
    raf = performance.now() < until ? requestAnimationFrame(step) : 0; };
  const track = ms=>{ until = Math.max(until, performance.now() + ms); if(!raf) raf = requestAnimationFrame(step); };
  /* the hovered card rises toward the reader and leans after the cursor */
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  box.querySelectorAll('[data-pp-node]').forEach(c=>{
    let r = null;
    c.addEventListener('mouseenter', ()=>{ clearTimeout(unhot); if(box.classList.contains('pp-linking')) return;
      light(c.dataset.ppNode); r = c.getBoundingClientRect(); c.classList.add('pp-lift'); });
    c.addEventListener('pointermove', ev=>{
      if(!r || calm.matches || ev.pointerType !== 'mouse' || box.classList.contains('pp-linking') || c.querySelector('.pp-pick')) return;
      const x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), y = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
      c.style.setProperty('--rx', ((.5 - y) * 7).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x - .5) * 9).toFixed(2) + 'deg');
      c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      track(500);
    });
    c.addEventListener('mouseleave', ()=>{ r = null; c.classList.remove('pp-lift');
      ['--rx','--ry','--mx','--my'].forEach(v=> c.style.removeProperty(v)); track(700); leave(); });
  });
  draw();
  const ro = new ResizeObserver(draw); ro.observe(box); PP_ROS.push(ro);
  box.querySelectorAll('.pp-port').forEach(port=> port.onpointerdown = ev=>{
    ev.preventDefault();
    const from = port.closest('[data-pp-node]').dataset.ppNode;
    const drag = svg.querySelector('.pp-wire.drag');
    const B = box.getBoundingClientRect(), P = port.getBoundingClientRect();
    const x1 = P.left + P.width/2 - B.left, y1 = P.top + P.height/2 - B.top;
    box.classList.add('pp-linking');
    const move = mv=>{ const x2 = mv.clientX - B.left, y2 = mv.clientY - B.top, c = Math.max(30, Math.abs(x2-x1)/2), dir = x2 >= x1 ? 1 : -1;
      drag.setAttribute('d', `M${x1} ${y1} C${x1+c*dir} ${y1} ${x2-c*dir} ${y2} ${x2} ${y2}`); };
    const up = upv=>{
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      box.classList.remove('pp-linking'); drag.setAttribute('d','');
      const hit = document.elementFromPoint(upv.clientX, upv.clientY);
      const to = hit && hit.closest && hit.closest('[data-pp-node]');
      if(to && box.contains(to) && to.dataset.ppNode !== from) onConnect(from, to.dataset.ppNode);
    };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
  });
}
/* a checklist popover on one card — the keyboard / touch way to the same links */
function ppPickMenu(btn, title, rows, onToggle){
  const old = posterView.querySelector('.pp-pick'); if(old){ old.remove(); if(old.dataset.for===btn.dataset.ppPick) return; }
  const menu = document.createElement('div');
  menu.className = 'pp-pick'; menu.dataset.for = btn.dataset.ppPick; menu.setAttribute('role','group'); menu.setAttribute('aria-label', title);
  menu.innerHTML = `<b>${esc(title)}</b>` + (rows.length ? rows.map((r,i)=>
    `<label class="${r.auto?'auto':''}"><input type="checkbox" data-row="${i}"${r.on?' checked':''}${r.auto?' disabled':''}> <span>${esc(r.label)}${r.note?` <small>${esc(r.note)}</small>`:''}</span></label>`).join('')
    : `<small>${esc(tr('Nothing to connect in this section yet.'))}</small>`);
  btn.closest('.pp-card').appendChild(menu);
  menu.querySelectorAll('input[data-row]:not([disabled])').forEach(cb=> cb.onchange = ()=> onToggle(rows[+cb.dataset.row], cb.checked));
  menu.querySelector('input:not([disabled])')?.focus();
}
/* re-render the poster where it was, then offer Undo for the save that just happened */
function ppAfterSave(personaId, msg){
  const keep = posterView.scrollTop;
  posterOpen(personaId); posterView.scrollTop = keep;
  toast(msg, {label: tr('Undo'), fn: async()=>{ await undoLastSave(); if(document.body.classList.contains('poster-open')){ posterOpen(personaId); posterView.scrollTop = keep; } }});
}

/* Additional information: quote → pain → reliever */
function ppWireLinks(e, pains, quotes, reliev){
  const box = posterView.querySelector('.pp-extra'); if(!box) return;
  const keyIdx = {}; pains.forEach((p,i)=> keyIdx[ppPainKey(p).toLowerCase()] = i);
  /* a quote's pains: its token when it has one (the whole list, as written),
     otherwise the pains that cite the same Signal */
  const sameSig = q => pains.filter(p=> q.b.sid && p.sid && q.b.sid===p.sid).map(ppPainKey);
  const listOf = side => side==='q' ? quotes : reliev;
  const effective = (side, item) => side==='q' && !item.has ? sameSig(item) : item.to;
  const edges = [];
  quotes.forEach((q,qi)=> effective('q', q).forEach(n=>{ const pi = keyIdx[n.toLowerCase()];
    if(pi!=null) edges.push({ a:`q${qi}`, b:`p${pi}`, kind: q.has ? 'man' : 'auto', side:'q', idx:qi, name:n }); }));
  reliev.forEach((r,ri)=> r.to.forEach(n=>{ const pi = keyIdx[n.toLowerCase()]; if(pi!=null) edges.push({ a:`p${pi}`, b:`r${ri}`, kind:'man', side:'r', idx:ri, name:n }); }));
  const without = (side, idx, name) => effective(side, listOf(side)[idx]).filter(n=> n.toLowerCase()!==name.toLowerCase());
  ppWires(box, edges,
    ed=> ppSaveLinks(e, ed.side, ed.idx, without(ed.side, ed.idx, ed.name), tr('Connection removed')),
    (from, to)=>{
      const m = [from, to].sort().join(' ').match(/^p(\d+) ([qr])(\d+)$/); if(!m) return;   // only quote↔pain and pain↔reliever
      const pi = +m[1], side = m[2], idx = +m[3], cur = effective(side, listOf(side)[idx]), name = ppPainKey(pains[pi]);
      if(cur.some(n=> n.toLowerCase()===name.toLowerCase())) return;
      ppSaveLinks(e, side, idx, [...cur, name], tr('Connected ✓ — written into the file'));
    });
  box.querySelectorAll('[data-pp-pick]').forEach(btn=> btn.onclick = ev=>{
    ev.stopPropagation();
    const side = btn.dataset.ppPick[0], idx = +btn.dataset.ppPick.slice(1), cur = effective(side, listOf(side)[idx]);
    ppPickMenu(btn, tr('Connect to pains'), pains.map(p=>{
      const name = ppPainKey(p);
      return { name, label: p.t, on: cur.some(n=> n.toLowerCase()===name.toLowerCase()) };
    }), (row, on)=> ppSaveLinks(e, side, idx, on ? [...cur, row.name] : without(side, idx, row.name),
        tr(on ? 'Connected ✓ — written into the file' : 'Connection removed')));
  });
}

/* Persona improvement: evidence (L2) → signal (L3) → correlation (L4).
   These ARE the research links, so they are written where the graph keeps
   them: evidence ↔ signal in the Signal's `evidences:` list, signal or
   evidence ↔ correlation as a link inside that correlation's block in the
   persona file. A link only in a signal's prose is drawn dashed — edit the
   file to change it. */
const ppRel = x => '../' + encodeURI(x.file).replace(/'/g, '%27');
const ppBase = x => x.file.split('/').pop().replace(/\.md$/i, '');
function ppSigEvidence(sig){
  const fm = [].concat(sig.fm.evidences||[]).map(n=> String(n).trim()).filter(Boolean);
  const fmIds = new Set(fm.map(n=> byBasename[n.toLowerCase()]).filter(Boolean));
  const bodyIds = new Set();
  for(const m of sig.body.matchAll(MD_LINK)){ const id = resolveRef(m[2]); if(id && ENTITIES[id] && ENTITIES[id].type==='Evidence' && !fmIds.has(id)) bodyIds.add(id); }
  return { fm, fmIds, bodyIds };
}
async function ppUnlinkInSignal(personaId, sigId, evId){
  const sig = ENTITIES[sigId]; if(!sig) return;
  const w = await ensureWritable(sig); if(!w) return;
  const md = w.md.replace(MD_LINK, (all, lab, href)=> resolveRef(href)===evId ? lab : all);   // keep the words, drop the link
  if(md !== w.md && await saveEntityText(w, md)) ppAfterSave(personaId, tr('Link removed from the signal’s text'));
}
async function ppSaveSigEvidence(personaId, sigId, evId, on){
  const sig = ENTITIES[sigId], ev = ENTITIES[evId]; if(!sig || !ev) return;
  const w = await ensureWritable(sig); if(!w) return;
  const name = ppBase(ev);
  const list = ppSigEvidence(w).fm.filter(n=> n.toLowerCase()!==name.toLowerCase());
  if(on) list.push(name);
  const val = list.length ? '[' + list.map(n=> "'" + n.replace(/'/g, "''") + "'").join(', ') + ']' : null;
  if(await saveEntityText(w, setFmField(w.md, 'evidences', val)))
    ppAfterSave(personaId, tr(on ? 'Connected ✓ — written into the signal file' : 'Connection removed'));
}
/* add or remove one [link] inside the persona's **title** correlation block */
function ppCorrStart(lines, title){
  const h = lines.findIndex(l=> /^##\s*Correlations\s*$/i.test(l)); if(h < 0) return -1;
  for(let i = h+1; i < lines.length && !/^#{1,2}\s/.test(lines[i]); i++){
    const m = lines[i].match(/^\*\*(.+?)\*\*\s*$/); if(m && stripLinks(m[1])===title) return i;
  }
  return -1;
}
function ppCorrSetLink(md, title, target, on){
  const lines = md.split('\n');
  const t = ppCorrStart(lines, title); if(t < 0) return md;
  let end = t+1; while(end < lines.length && lines[end].trim() && !/^\*\*.+\*\*\s*$/.test(lines[end]) && !/^#{1,2}\s/.test(lines[end])) end++;
  if(on){
    const link = `[${target.title}](${ppRel(target)})`;
    const li = lines.slice(t+1, end).findIndex(l=> /^\s*\[/.test(l));
    if(li >= 0) lines[t+1+li] = lines[t+1+li].replace(/\s*$/, '') + ' ' + link;
    else lines.splice(t+1, 0, link);
  } else {
    for(let i = t+1; i < end; i++){
      lines[i] = lines[i].replace(MD_LINK, (all, lab, href)=> resolveRef(href)===target.id ? '' : all).replace(/\s{2,}/g,' ').replace(/^\s+|\s+$/g,'');
    }
    for(let i = end-1; i > t; i--) if(!lines[i].trim()) { lines.splice(i, 1); }
  }
  return lines.join('\n');
}
async function ppSaveCorr(e, title, targetId, on){
  const w = await ensureWritable(e); if(!w) return;
  const md = ppCorrSetLink(w.md, title, ENTITIES[targetId], on);
  if(md !== w.md && await saveEntityText(w, md)) ppAfterSave(w.id, tr(on ? 'Connected ✓ — written into the file' : 'Connection removed'));
}
function ppWireFlow(e, evid, sigs, corr){
  const box = posterView.querySelector('.pp-improve'); if(!box) return;
  const eIdx = {}; evid.forEach((x,i)=>{ if(x.sid) eIdx[x.sid] = i; });
  const sIdx = {}; sigs.forEach((x,i)=> sIdx[x.id] = i);
  const edges = [];
  sigs.forEach((x,si)=>{
    const r = ppSigEvidence(ENTITIES[x.id]);
    r.fmIds.forEach(id=>{ if(eIdx[id]!=null) edges.push({ a:`e${eIdx[id]}`, b:`s${si}`, kind:'man', sig:x.id, ev:id }); });
    r.bodyIds.forEach(id=>{ if(eIdx[id]!=null) edges.push({ a:`e${eIdx[id]}`, b:`s${si}`, kind:'auto', sig:x.id, ev:id }); });
  });
  corr.forEach((c,ci)=> c.links.forEach(l=>{
    if(l.id && sIdx[l.id]!=null) edges.push({ a:`s${sIdx[l.id]}`, b:`c${ci}`, kind:'man', corr:c.title, target:l.id });
    else if(l.id && eIdx[l.id]!=null) edges.push({ a:`e${eIdx[l.id]}`, b:`c${ci}`, kind:'man', long:true, corr:c.title, target:l.id });
  }));
  ppWires(box, edges,
    ed=> ed.corr ? ppSaveCorr(e, ed.corr, ed.target, false) : ed.kind==='auto' ? ppUnlinkInSignal(e.id, ed.sig, ed.ev) : ppSaveSigEvidence(e.id, ed.sig, ed.ev, false),
    (from, to)=>{
      const [a, b] = [from, to].sort();   // c… < e… < s…
      const ev = n => evid[+n.slice(1)].sid, sg = n => sigs[+n.slice(1)].id, co = n => corr[+n.slice(1)];
      if(a[0]==='e' && b[0]==='s'){ if(ev(a)) ppSaveSigEvidence(e.id, sg(b), ev(a), true); }
      else if(a[0]==='c'){
        const target = b[0]==='s' ? sg(b) : ev(b);
        if(target && !co(a).links.some(l=> l.id===target)) ppSaveCorr(e, co(a).title, target, true);
      }
    });
  box.querySelectorAll('[data-pp-new]').forEach(b=> b.onclick = ()=> ppAddImprovement(e, b.dataset.ppNew, evid, sigs, corr));
  box.querySelectorAll('[data-pp-del]').forEach(b=> b.onclick = ev=>{ ev.stopPropagation(); ppDeleteImprovement(e, b.dataset.ppDel, evid, sigs, corr); });
  box.querySelectorAll('[data-pp-pick]').forEach(btn=> btn.onclick = ev=>{
    ev.stopPropagation();
    const kind = btn.dataset.ppPick[0], idx = +btn.dataset.ppPick.slice(1);
    if(kind==='s'){
      const r = ppSigEvidence(ENTITIES[sigs[idx].id]);
      ppPickMenu(btn, tr('Backed by evidence'), evid.filter(x=> x.sid).map(x=>({ id: x.sid, label: x.src || x.t,
        prose: r.bodyIds.has(x.sid), note: r.bodyIds.has(x.sid) ? tr('linked in the signal’s text') : '', on: r.fmIds.has(x.sid) || r.bodyIds.has(x.sid) })),
        (row, on)=> !on && row.prose ? ppUnlinkInSignal(e.id, sigs[idx].id, row.id) : ppSaveSigEvidence(e.id, sigs[idx].id, row.id, on));
    } else {
      const c = corr[idx], has = new Set(c.links.map(l=> l.id));
      ppPickMenu(btn, tr('Stands on'), [...sigs.map(x=>({ id:x.id, label:'● '+x.t })), ...evid.filter(x=> x.sid).map(x=>({ id:x.sid, label:'○ '+(x.src || x.t) }))]
        .map(r=> Object.assign(r, { on: has.has(r.id) })), (row, on)=> ppSaveCorr(e, c.title, row.id, on));
    }
  });
}

/* ---------- adding and removing Persona improvement elements ----------
   Everything is written into the persona file, never elsewhere: evidence is a
   bullet under ## Evidences, a signal comes in as a Pain that links it (L3
   cards are the Signals the persona links), a correlation is a block under
   ## Correlations. Removing works on the persona file only — the Evidence and
   Signal files are research data and stay. A delete asks for the word
   "delete", like Jira; Undo is in the toast afterwards. */
function ppDialog({ title, body, ok, danger, check, run }){
  let dlg = document.getElementById('ppModal');
  if(!dlg){ dlg = document.createElement('dialog'); dlg.className = 'modal'; dlg.id = 'ppModal'; document.body.appendChild(dlg); }
  dlg.setAttribute('aria-label', title);
  dlg.innerHTML = `<form class="modal-card pp-modal">
    <div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="modal-x" data-x aria-label="${esc(tr('Close'))}">✕</button></div>
    <div class="modal-body">${body}</div>
    <div class="modal-foot"><span class="idea-valid"></span>
      <button type="button" class="btn btn-ghost btn-sm" data-x>${tr('Cancel')}</button>
      <button type="submit" class="btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}" disabled>${esc(ok)}</button></div></form>`;
  const form = dlg.querySelector('form'), go = form.querySelector('[type=submit]'), msg = form.querySelector('.idea-valid');
  const close = ()=> dlg.close();
  form.querySelectorAll('[data-x]').forEach(b=> b.onclick = close);
  dlg.onclick = ev=>{ if(ev.target === dlg) close(); };
  dlg.onkeydown = ev=>{ if(ev.key === 'Escape') ev.stopPropagation(); };   // closes the dialog, not the poster behind it
  let touched = false;
  const validate = ()=>{ const err = check(form.elements); msg.textContent = touched && err ? err.trim() : ''; go.disabled = !!err; };
  form.oninput = form.onchange = ()=>{ touched = true; validate(); };
  form.onsubmit = async ev=>{ ev.preventDefault(); if(check(form.elements)) return; close(); await run(form.elements); };
  dlg.showModal(); validate();
  form.querySelector('.modal-body input, .modal-body textarea, .modal-body select')?.focus();
}
function ppConfirmDelete(title, what, run){
  ppDialog({ title, ok: tr('Delete'), danger: true,
    body: `<div class="pp-del-what">${what}</div>
      <div class="idea-field"><label for="ppDelWord">${tr('Type {w} to confirm').replace('{w}', '<b class="pp-del-word">delete</b>')}</label>
      <input id="ppDelWord" name="word" autocomplete="off" spellcheck="false" autocapitalize="off"></div>`,
    check: f=> f.word.value.trim().toLowerCase()==='delete' ? '' : ' ', run });
}
async function ppSavePersona(e, fn, msg){
  const w = await ensureWritable(e); if(!w) return;
  const md = fn(w.md);
  if(md !== w.md && await saveEntityText(w, md)) ppAfterSave(w.id, msg);
}
const ppSameWs = (e, type) => Object.values(ENTITIES).filter(x=> x.type===type && !!x.fm.demo===!!e.fm.demo).sort((a,b)=> a.title.localeCompare(b.title));
const ppField = (label, inner) => `<div class="idea-field"><label>${label}</label>${inner}</div>`;
const ppMdLink = x => `[${x.title}](${ppRel(x)})`;
function ppAddImprovement(e, kind, evid, sigs, corr){
  const where = sec => `<div class="pp-hint">${tr('Saved under “## {sec}” in {file}.').replace('{sec}', sec).replace('{file}', esc(e.file))}</div>`;
  const pickFile = (type, have, label, empty) => {
    const list = ppSameWs(e, type).filter(x=> !have.has(x.id));
    return list.length ? ppField(label, `<select name="pick" class="set-input">${list.map(x=> `<option value="${esc(x.id)}">${esc(x.title)}</option>`).join('')}</select>`)
      : `<div class="pp-empty">${empty}</div>`;
  };
  if(kind==='e') return ppDialog({ title: tr('Add evidence'), ok: tr('Add to persona'),
    body: pickFile('Evidence', new Set(evid.map(b=> b.sid)), tr('Evidence file'), tr('Every Evidence file in this project is already on this persona — create a new one first.'))
      + ppField(tr('What it confirms about this persona'), '<textarea name="txt" rows="3"></textarea>') + where('Evidences'),
    check: f=> !f.pick ? ' ' : f.txt.value.trim() ? '' : tr('Say what it confirms.'),
    run: f=> ppSavePersona(e, md=> ppAppend(md, 'Evidences', '- ' + ppMdLink(ENTITIES[f.pick.value]) + ' ' + ppOneLine(f.txt.value)), tr('Evidence added ✓')) });
  if(kind==='s') return ppDialog({ title: tr('Add signal'), ok: tr('Add to persona'),
    body: pickFile('Signal', new Set(sigs.map(x=> x.id)), tr('Signal file'), tr('Every Signal file in this project is already on this persona — extract new findings first.'))
      + ppField(tr('The pain it shows, in your words'), '<textarea name="txt" rows="3"></textarea>')
      + `<div class="pp-hint">${tr('A persona takes a signal in through a pain that links it.')} ${tr('Saved under “## {sec}” in {file}.').replace('{sec}', 'Pains').replace('{file}', esc(e.file))}</div>`,
    check: f=> !f.pick ? ' ' : f.txt.value.trim() ? '' : tr('Describe the pain.'),
    run: f=> ppSavePersona(e, md=> ppAppend(md, 'Pains', '- ' + ppMdLink(ENTITIES[f.pick.value]) + ' ' + ppOneLine(f.txt.value)), tr('Signal added ✓')) });
  const src = [...sigs.map(x=> ({ id: x.id, label: x.t, t: tr('Signal') })), ...evid.filter(b=> b.sid).map(b=> ({ id: b.sid, label: b.src || b.t, t: tr('Evidence') }))];
  ppDialog({ title: tr('Add correlation'), ok: tr('Add to persona'),
    body: ppField(tr('Correlation name'), '<input name="title" autocomplete="off">')
      + ppField(tr('What emerges when you put them together'), '<textarea name="txt" rows="3"></textarea>')
      + ppField(tr('Opportunity (optional)'), '<input name="opp" autocomplete="off">')
      + ppField(tr('Stands on'), src.length ? `<div class="idea-pick"><div class="idea-pick-list">${src.map(x=> `<label class="idea-opt"><input type="checkbox" name="on" value="${esc(x.id)}"> <span class="t">${esc(x.t)}</span> ${esc(x.label)}</label>`).join('')}</div></div>`
        : `<div class="pp-empty">${tr('Add a signal or evidence first — a correlation stands on them.')}</div>`)
      + where('Correlations'),
    check: f=>{ const t = f.title.value.trim();
      if(!t) return tr('Name required.');
      if(corr.some(c=> c.title.toLowerCase()===t.toLowerCase())) return tr('This persona already has a correlation with that name.');
      return [...document.querySelectorAll('#ppModal [name=on]:checked')].length ? '' : tr('Tick at least one signal or evidence it stands on.'); },
    run: f=>{
      const on = [...document.querySelectorAll('#ppModal [name=on]:checked')].map(c=> ENTITIES[c.value]).filter(Boolean);
      const block = [`**${ppOneLine(f.title.value).replace(/\*/g, '')}**`, on.map(ppMdLink).join(' '), ppOneLine(f.txt.value), f.opp.value.trim() && `→ Opportunity: ${ppOneLine(f.opp.value)}`].filter(Boolean).join('\n');
      return ppSavePersona(e, md=> ppAppend(md, 'Correlations', block, '\n\n'), tr('Correlation added ✓'));
    } });
}
/* drop the idx-th bullet of ## sec with its indented sub-lines */
function ppDropBullet(md, sec, idx){
  const r = ppRaw(md, sec)[idx]; if(!r) return md;
  const lines = md.split('\n'); let n = 1;
  while(r.i + n < lines.length && /^\s+\S/.test(lines[r.i + n])) n++;
  lines.splice(r.i, n);
  return lines.join('\n');
}
/* drop one **title** block from ## Correlations, up to the next block or rule */
function ppDropCorr(md, title){
  const lines = md.split('\n'), t = ppCorrStart(lines, title); if(t < 0) return md;
  let end = t + 1;
  while(end < lines.length && !/^\*\*.+\*\*\s*$/.test(lines[end]) && !/^#{1,2}\s/.test(lines[end]) && !/^(-{3,}|\*{3,})\s*$/.test(lines[end])) end++;
  while(end > t + 1 && !lines[end-1].trim() && /^\*\*/.test(lines[end] || '')) end--;   // keep the gap before the next block
  lines.splice(t, end - t);
  while(t > 0 && t < lines.length && !lines[t-1].trim() && !lines[t].trim()) lines.splice(t, 1);   // no double gap left behind
  return lines.join('\n');
}
/* detach a signal: every link to it leaves the persona file. A source link
   (leading a bullet, trailing a line, or a line of links) goes whole; one
   inside a sentence keeps its words. Lines left empty go too. */
function ppDetachSignal(md, sigId){
  const out = [];
  md.split('\n').forEach(l=>{
    let x = l.replace(MD_LINK, (all, lab, href)=> resolveRef(href)===sigId ? `\u0000${lab}\u0001` : all);
    if(x === l){ out.push(l); return; }
    x = x.replace(/^(\s*(?:- )?)\u0000[^\u0001]*\u0001\s*/, '$1').replace(/\s*(?:[—–]\s*)?\u0000[^\u0001]*\u0001\s*$/, '').replace(/\u0000([^\u0001]*)\u0001/g, '$1');
    if(x.trim() && !/^\s*-\s*$/.test(x)) out.push(x);
  });
  return out.join('\n');
}
const ppSignalLinkCount = (md, sigId) => [...md.matchAll(MD_LINK)].filter(m=> resolveRef(m[2])===sigId).length;
function ppDeleteImprovement(e, node, evid, sigs, corr){
  const k = node[0], i = +node.slice(1), file = `<code>${esc(e.file)}</code>`, keep = t => `<p class="pp-keep">${t} ${tr('Undo stays available right after.')}</p>`;
  if(k==='e'){ const b = evid[i];
    return ppConfirmDelete(tr('Remove evidence from persona'),
      `<p>${tr('This line is deleted from “## Evidences” in {file}:').replace('{file}', file)}</p><blockquote>${esc(b.t)}</blockquote>${keep(tr('The Evidence file itself stays.'))}`,
      ()=> ppSavePersona(e, md=> ppDropBullet(md, 'Evidences', i), tr('Evidence removed'))); }
  if(k==='s'){ const x = sigs[i], n = ppSignalLinkCount(e.md, x.id);
    return ppConfirmDelete(tr('Detach signal from persona'),
      `<p>${tr('Every link to “{t}” leaves {file} ({n}) — in pains, quotes, correlations. A pain or quote that only named this signal loses its source; words inside sentences stay.').replace('{t}', esc(x.t)).replace('{file}', file).replace('{n}', n)}</p>${keep(tr('The Signal file stays — it is interview data.'))}`,
      ()=> ppSavePersona(e, md=> ppDetachSignal(md, x.id), tr('Signal detached'))); }
  const c = corr[i];
  ppConfirmDelete(tr('Delete correlation'),
    `<p>${tr('The whole “{t}” block is deleted from “## Correlations” in {file}.').replace('{t}', esc(c.title)).replace('{file}', file)}</p>${keep(tr('The signals and evidence it stood on stay.'))}`,
    ()=> ppSavePersona(e, md=> ppDropCorr(md, c.title), tr('Correlation deleted')));
}

/* "+ Add" under a column: the button turns into a card you type into, Enter
   writes the bullet into that section and opens the next one, Esc backs out */
function ppQuickAdd(e, btn){
  const sec = btn.dataset.ppQuick, quote = sec==='Relevant Quotes';
  const form = document.createElement('div');
  form.className = 'pp-card pp-quick-card';
  form.innerHTML = `<textarea rows="2" placeholder="${esc(quote ? tr('"Verbatim quote" — source') : tr('New entry, in your own words…'))}"></textarea><div class="pp-quick-hint">${tr('Enter — save · Shift+Enter — new line · Esc — cancel')}</div>`;
  btn.replaceWith(form);
  const ta = form.querySelector('textarea'); ta.focus();
  const back = ()=> form.replaceWith(btn);
  ta.onblur = ()=>{ if(!ta.value.trim()) back(); };
  ta.onkeydown = async ev=>{
    if(ev.key==='Escape'){ ev.stopPropagation(); back(); return; }   // not the poster's Esc
    if(ev.key!=='Enter' || ev.shiftKey || ev.isComposing) return;
    ev.preventDefault();
    let txt = ppOneLine(ta.value); if(!txt) return;
    if(quote && !/^["“„]/.test(txt)){   // the card reads a quote between quote marks; a trailing " — source" stays outside
      const m = txt.match(/^(.*\S)\s+—\s+([^—]+)$/);
      txt = m ? `"${m[1]}" — ${m[2]}` : `"${txt}"`;
    }
    ta.onblur = null; ta.disabled = true;
    const w = await ensureWritable(e); if(!w){ ta.disabled = false; return; }
    if(await saveEntityText(w, ppAddBullet(w.md, sec, txt))){
      ppAfterSave(w.id, tr('Added to {sec} ✓').replace('{sec}', sec));
      posterView.querySelector(`[data-pp-quick="${sec}"]`)?.click();   // straight on to the next card
    } else ta.disabled = false;
  };
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
  const reliev=ppRaw(e.md, 'Potential Pain Relievers');
  const quotes=ppRaw(e.md, 'Relevant Quotes').map(x=>{
    const m=x.b.t.match(/"(.+?)"\s*(?:—\s*(.+))?$/s);
    return Object.assign(x, m? { q:m[1], qsrc:m[2]||'' } : { q:x.b.t, qsrc:'' });
  });
  // always offered: saving goes through ensureWritable, which asks for the folder when it has to
  const port = side => `<span class="pp-port pp-port-${side}" title="${esc(tr('Drag onto a card to connect'))}"></span>`;
  const pick = (id, label) => `<button type="button" class="pp-pick-btn" data-pp-pick="${id}" title="${esc(label || tr('Connect to pains'))}" aria-label="${esc(label || tr('Connect to pains'))}">⟷</button>`;
  /* sec = canonical ## heading → the label grows count + add/full-list actions,
     and an empty section renders as an honest gap instead of vanishing */
  const quick = (attr, val) => `<button type="button" class="pp-quick" ${attr}="${esc(val)}">＋ ${tr('Add')}</button>`;
  const col=(label,icon,html,sec,count,foot='')=>{
    if(!html && !sec) return '';
    const acts = sec?`<span class="pp-acts"><button type="button" class="pp-act" data-pp-list="${esc(sec)}" title="${esc(tr('Full list — every entry in this section'))}">${tr('All')} (${count||0})</button><button type="button" class="pp-act" data-pp-add="${esc(sec)}" title="${esc(tr('Add a new entry to this section of the file'))}">＋ ${tr('Add')}</button></span>`:'';
    const body = html || `<div class="pp-empty">${tr('Nothing in this section yet — an honest gap, nothing invented. Add the first entry or fill it from research.')}</div>`;
    return `<div class="pp-col"><div class="pp-label">${icon||''}<span>${label}</span>${acts}</div>${body}${foot}</div>`;
  };
  const flowCol=(lv,name,cards,kind)=> `<div class="pp-col"><div class="pp-lv"><b>${lv}:</b> ${name}</div><span class="pp-dot"></span>${cards||`<div class="pp-empty">${tr('Nothing here yet.')}</div>`}${quick('data-pp-new', kind)}</div>`;
  const del = id => `<button type="button" class="pp-del" data-pp-del="${id}" title="${esc(tr('Remove from this persona'))}" aria-label="${esc(tr('Remove from this persona'))}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg></button>`;

  posterView.innerHTML = `
    <div class="pp-top">
      <span class="pp-kicker">${ICONS.Persona}${tr('Persona poster')}${e.fm.demo?`<span class="demo-badge">${tr('Demo')}</span>`:''}</span>
      <span class="pp-top-acts">
        <button class="pp-print" id="ppPrint" title="${esc(tr('Opens the print dialog — pick “Save as PDF” for a one-pager you can share'))}">⤓ ${tr('Save as PDF')}</button>
        <button class="pp-close" id="ppClose" aria-label="Close poster">✕</button>
      </span>
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
    <div class="pp-divider"><span>${tr('Persona improvement')}</span></div>
    <section class="pp-flow pp-improve">
      ${flowCol(tr('Level 2'),tr('Evidence — desk research'), evid.length?evid.map((b,i)=>`<div class="pp-card" data-pp-node="e${i}">${esc(b.t)}${b.sub?`<div class="pp-sub">${esc(b.sub)}</div>`:''}${posterSrc(b)}${del('e'+i)}${b.sid?port('r'):''}</div>`).join(''):'', 'e')}
      ${flowCol(tr('Level 3'),tr('Signal — interviews'), sigs.length?sigs.map((s,i)=>`<div class="pp-card pp-linkcard" data-pp-node="s${i}">${port('l')}<b data-goto="${s.id}">${esc(s.t)}</b>${esc(s.sub)}${pick('s'+i, tr('Backed by evidence'))}${del('s'+i)}${port('r')}</div>`).join(''):'', 's')}
      ${flowCol(tr('Level 4'),tr('Correlation — Signal + Evidence'), corr.length?corr.map((c,ci)=>`<div class="pp-card pp-corr" data-pp-node="c${ci}">${port('l')}${pick('c'+ci, tr('Stands on'))}<b>${esc(c.title)}</b>${esc(c.txt)}${c.links.length?`<div class="pp-refs">${c.links.map(l=>{ const x=l.id&&ENTITIES[l.id]; return x?`<a class="pp-ref" data-goto="${l.id}">${ICONS[x.type]||''}${esc(l.label)}</a>`:`<span class="pp-ref pp-ref-off" title="${esc(tr('File not found in this workspace'))}">${esc(l.label)}</span>`; }).join('')}</div>`:''}${c.opp.map(o=>`<div class="pp-opp">${tr('Opportunity:')} ${esc(o)}</div>`).join('')}${del('c'+ci)}</div>`).join(''):'', 'c')}
    </section>
    <div class="pp-divider"><span>${tr('Additional information')}</span></div>
    <section class="pp-flow pp-extra">
      ${col(tr('Relevant quotes'), ICONS.Transcript, quotes.length?quotes.map((q,i)=>`<div class="pp-card pp-qcard" data-pp-node="q${i}">“${esc(q.q)}”${q.qsrc?`<div class="pp-src">${esc(q.qsrc)}</div>`:''}${pick('q'+i)}${port('r')}</div>`).join(''):'', 'Relevant Quotes', quotes.length, quick('data-pp-quick', 'Relevant Quotes'))}
      ${col(tr('Pains'), ICONS.Signal, pains.length?pains.map((p,i)=>`<div class="pp-card pp-pain" data-pp-node="p${i}">${port('l')}${esc(p.t)}${p.src?`<div class="pp-src">${esc(p.src)}</div>`:''}${port('r')}</div>`).join(''):'', null, 0, quick('data-pp-quick', 'Pains'))}
      ${col(tr('Potential pain relievers'), ICONS.IdeaForImprovement, reliev.length?reliev.map((r,i)=>`<div class="pp-card pp-rel" data-pp-node="r${i}">${port('l')}${esc(r.b.t)}${pick('r'+i)}</div>`).join(''):'', 'Potential Pain Relievers', reliev.length, quick('data-pp-quick', 'Potential Pain Relievers'))}
    </section>
    <div class="pp-foot"><button class="btn btn-outline" id="ppBack">← Back to document view</button></div>`;
  document.body.classList.add('poster-open');
  posterView.setAttribute('aria-hidden','false');
  posterView.scrollTop=0;
  const close=()=>{ document.body.classList.remove('poster-open'); posterView.setAttribute('aria-hidden','true'); posterView.innerHTML=''; };
  document.getElementById('ppClose').onclick=close;
  // the browser's own print → "Save as PDF": no library, and the file is the page you see
  document.getElementById('ppPrint').onclick=()=> window.print();
  document.getElementById('ppBack').onclick=close;
  posterView.querySelectorAll('[data-pp-list]').forEach(b=> b.onclick=()=> ppListOpen(e.id, b.dataset.ppList));
  posterView.querySelectorAll('[data-pp-add]').forEach(b=> b.onclick=()=> ppListOpen(e.id, b.dataset.ppAdd, {add:true}));
  posterView.querySelectorAll('[data-goto]').forEach(el=> el.onclick=()=>{ close(); location.hash='#'+el.dataset.goto; });
  PP_ROS.forEach(r=> r.disconnect()); PP_ROS = [];   // observers belong to one render
  ppWireFlow(e, evid, sigs, corr);
  ppWireLinks(e, pains, quotes, reliev);
  posterView.querySelectorAll('[data-pp-quick]').forEach(b=> b.onclick = ()=> ppQuickAdd(e, b));
  posterView.onclick = ev=>{ if(!ev.target.closest('.pp-pick, [data-pp-pick]')) posterView.querySelector('.pp-pick')?.remove(); };
}

/* append "- text" at the end of ## sec (creating the section if missing) */
const ppOneLine = t => t.replace(/\s*\n+\s*/g,' ').trim();
const ppAddBullet = (md, sec, text) => ppAppend(md, sec, '- ' + ppOneLine(text));
/* append a chunk at the end of ## sec; gap '\n\n' keeps a block apart */
function ppAppend(md, sec, line, gap = '\n'){
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
  return md.slice(0,start) + (seg||'\n') + gap + line + tail + '\n\n' + md.slice(end);
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
