/* ---------- Motion — arrivals for every page (styles: 16-motion.css) ----------
   Loads before 13/14 on purpose: the boot route renders the Overview, and
   dxMotion needs MO_STILL / motionReveal to exist by then.
   A page is "entered" through the router (every hash change) or a rail tab;
   motionPage then marks what should rise on THAT page. Re-renders in place —
   a save, a highlight, typing in the filter — don't come through here, so they
   never replay it. Reduced motion: nothing runs, nothing is hidden. The
   Overview choreographs itself (dxMotion in 13) on top of motionReveal. */
const MO_STILL = matchMedia('(prefers-reduced-motion: reduce)');
let MO_IO = null;

/* blocks rise as they scroll in — the ones that enter together 45ms apart
   (--b); items inside a block follow it one by one (--i, capped so a long
   list never makes anyone wait). Numbers in a block count up as it lands. */
function motionReveal(scope, blocks, items){
  if(MO_IO){ MO_IO.disconnect(); MO_IO = null; }
  if(MO_STILL.matches || !scope || !('IntersectionObserver' in window)) return false;
  scope.classList.add('dx-motion');
  blocks.forEach(b=>{ b.classList.add('dx-rv'); b.classList.remove('in'); });   // shell blocks (the detail head) keep their class between pages
  (items || []).forEach(el=>{ el.classList.add('dx-st'); el.style.setProperty('--i', Math.min([...el.parentNode.children].indexOf(el), 10)); });
  MO_IO = new IntersectionObserver(es=>{
    let k = 0;
    es.forEach(en=>{
      if(!en.isIntersecting) return;
      const t = en.target;
      t.style.setProperty('--b', Math.min(k++, 8));
      t.classList.add('in'); MO_IO.unobserve(t);
      t.querySelectorAll('.dx-big, .dx-mid, .pe-fact').forEach(dxCount);
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });   // a ratio threshold would never fire for a block taller than the screen
  blocks.forEach(b=> MO_IO.observe(b));
  return true;
}

/* a name rises word by word out of its own mask (CSS: .dx-w); the dot after
   it pops once the last word is up (--n) */
function motionWords(title){
  const txt = title && title.firstChild;
  if(!txt || txt.nodeType !== 3) return;
  let k = 0;
  const words = txt.textContent.split(/(\s+)/).map(w=> /^\s*$/.test(w) ? w : `<span class="dx-w"><span style="--i:${k++}">${esc(w)}</span></span>`).join('');
  title.setAttribute('aria-label', title.textContent);
  txt.replaceWith(document.createRange().createContextualFragment(words));
  title.querySelector('.dx-dot')?.style.setProperty('--n', k);
  title.style.setProperty('--n', k);   // a dot drawn by ::after (the page head's) reads it here
}

/* the lean (CSS: 16-motion.css) — any element with data-lean="<degrees>"
   leans toward a mouse pointer over it (--rx/--ry) and its light follows the
   cursor (--mx/--my). The persona card's gesture, used by the Overview and
   Personas-tab cards and the persona portrait; one delegated listener, so a
   list that re-renders at will needs no wiring. */
let MO_LEAN = null;
const motionStraighten = el=> el && ['--rx','--ry'].forEach(v=> el.style.removeProperty(v));
document.addEventListener('pointermove', ev=>{
  if(ev.pointerType !== 'mouse' || MO_STILL.matches) return;
  const el = ev.target.closest ? ev.target.closest('[data-lean]') : null;
  if(MO_LEAN !== el){ motionStraighten(MO_LEAN); leanNet(MO_LEAN, false); MO_LEAN = el; leanNet(el, true); }
  if(!el) return;
  const deg = +el.dataset.lean || 4, r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
  el._px = x - .5; el._py = y - .5;   // the net under the card drifts a little toward the pointer
  el.style.setProperty('--mx', (x*100).toFixed(1)+'%'); el.style.setProperty('--my', (y*100).toFixed(1)+'%');
  el.style.setProperty('--ry', ((x-.5)*2*deg).toFixed(2)+'deg'); el.style.setProperty('--rx', ((.5-y)*1.5*deg).toFixed(2)+'deg');
});
document.addEventListener('pointerleave', ()=>{ motionStraighten(MO_LEAN); leanNet(MO_LEAN, false); MO_LEAN = null; });

/* the net — under a leaning card that holds a face: a few nodes wired to one
   point behind the avatar, drawing in on hover, drifting slowly, a pulse now
   and then running out along a wire. A hint of connections, not the graph:
   the layout is a schematic, made once per card from its size. */
const NET_NS = 'http://www.w3.org/2000/svg';
function leanNet(el, on){
  if(!el || el.matches('.face')) return;
  const face = el.querySelector('.face'); if(!face) return;
  if(!on){ clearTimeout(el._netOff); el._netOff = setTimeout(()=>{ cancelAnimationFrame(el._netRaf); el._netRaf = 0; }, 600); return; }
  clearTimeout(el._netOff);
  let svg = el.querySelector(':scope > .lean-net');
  if(!svg){
    const r = el.getBoundingClientRect(), f = face.getBoundingClientRect();
    const W = r.width, H = r.height, hx = f.left - r.left + f.width / 2, hy = f.top - r.top + f.height / 2, fr = f.width / 2;
    let seed = Math.round(W * 7 + H * 13);   // the same card draws the same net every time
    const rnd = ()=> (seed = (seed * 9301 + 49297) % 233280) / 233280;
    /* nodes go where this card has room: of 24 directions from the hub, the
       ones that reach furthest before the card's edge, at least 34° apart */
    const reach = a=>{ const c = Math.cos(a), s = Math.sin(a), lim = [c > 0 ? (W - 14 - hx) / c : c < 0 ? (14 - hx) / c : 1e9, s > 0 ? (H - 14 - hy) / s : s < 0 ? (14 - hy) / s : 1e9]; return Math.min(...lim); };
    const dirs = Array.from({ length: 24 }, (_, i)=> (i * 15 + rnd() * 8) * Math.PI / 180).map(a=> ({ a, free: reach(a) })).filter(o=> o.free > fr + 40).sort((p, q)=> q.free - p.free);
    const pick = [];
    dirs.forEach(o=>{ if(pick.length < 8 && pick.every(p=> Math.abs(Math.atan2(Math.sin(p.a - o.a), Math.cos(p.a - o.a))) > .6)) pick.push(o); });
    const nodes = pick.sort((p, q)=> p.a - q.a).map((o, i)=>{
      const d = fr + 30 + rnd() * Math.min(150, o.free - fr - 36);
      return { x: hx + Math.cos(o.a) * d, y: hy + Math.sin(o.a) * d, p: rnd() * 6.28, w: .5 + rnd() * .6, big: i % 3 === 1 };
    });
    const links = [[1, 2], [4, 5], [6, 7]].filter(([a, b])=> nodes[a] && nodes[b]);
    if(nodes.length < 3) return;   // a card with no room around its face gets no net
    svg = document.createElementNS(NET_NS, 'svg');
    svg.setAttribute('class', 'lean-net'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const wires = nodes.map((n, i)=> `<line class="w" pathLength="1" style="--d:${i * 45}ms" x1="${hx}" y1="${hy}" x2="${n.x}" y2="${n.y}"/>`).join('')
      + links.map(([a, b], i)=> `<line class="w x" pathLength="1" style="--d:${360 + i * 60}ms" x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}"/>`).join('');
    svg.innerHTML = wires + nodes.map((n, i)=> `<circle class="n${n.big ? ' big' : ''}" style="--d:${200 + i * 45}ms" r="${n.big ? 4.5 : 3}" cx="${n.x}" cy="${n.y}"/>`).join('') + '<circle class="pulse" r="2.5"/><circle class="pulse" r="2.5"/>';
    el.prepend(svg);
    el._net = { nodes, links, hx, hy, ls: [...svg.querySelectorAll('line')], cs: [...svg.querySelectorAll('circle.n')], ps: [...svg.querySelectorAll('circle.pulse')] };
  }
  if(el._netRaf) return;
  const N = el._net, t0 = performance.now();
  const step = now=>{
    const t = (now - t0) / 1000, mx = (el._px || 0) * 14, my = (el._py || 0) * 10;
    const at = N.nodes.map(n=> [n.x + Math.sin(t * n.w + n.p) * 5 + mx * n.w, n.y + Math.cos(t * n.w * .8 + n.p) * 4 + my * n.w]);
    N.nodes.forEach((n, i)=>{ N.cs[i].setAttribute('cx', at[i][0].toFixed(1)); N.cs[i].setAttribute('cy', at[i][1].toFixed(1));
      N.ls[i].setAttribute('x2', at[i][0].toFixed(1)); N.ls[i].setAttribute('y2', at[i][1].toFixed(1)); });
    N.links.forEach(([a, b], i)=>{ const l = N.ls[N.nodes.length + i]; l.setAttribute('x1', at[a][0].toFixed(1)); l.setAttribute('y1', at[a][1].toFixed(1)); l.setAttribute('x2', at[b][0].toFixed(1)); l.setAttribute('y2', at[b][1].toFixed(1)); });
    N.ps.forEach((p, k)=>{   // a pulse leaves the hub along one wire, then the next
      const per = 2.4, ph = ((t + k * per / 2) % per) / per, wi = (Math.floor((t + k * per / 2) / per) * 3 + k * 5) % N.nodes.length, e = ph * ph * (3 - 2 * ph);
      p.setAttribute('cx', (N.hx + (at[wi][0] - N.hx) * e).toFixed(1)); p.setAttribute('cy', (N.hy + (at[wi][1] - N.hy) * e).toFixed(1));
      p.style.opacity = (Math.sin(ph * Math.PI) * .9).toFixed(2);
    });
    el._netRaf = requestAnimationFrame(step);
  };
  el._netRaf = requestAnimationFrame(step);
}

/* a number counts up from zero (ease-out expo) — only the leading integer of
   its first text node, so "6/6", "83%" and the unit beside it stay as written */
function dxCount(el){
  const t = el.firstChild; if(!t || t.nodeType !== 3) return;
  const m = t.textContent.match(/^(\d+)([\s\S]*)$/); if(!m || +m[1] < 2) return;
  const to = +m[1], rest = m[2], t0 = performance.now(), dur = 1100;
  const step = now=>{
    const p = Math.min(1, (now - t0) / dur), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    t.textContent = Math.round(to * e) + rest;
    if(p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* what rises on each page: [scope, blocks, items] — the long reading (a
   document's body past its first screen, a transcript's turns) is left alone */
function motionPage(){
  if(MO_STILL.matches || MINDMAP_ACTIVE || document.body.classList.contains('poster-open')) return;
  const all = (root, sel)=> root ? [...root.querySelectorAll(sel)] : [];
  if(DASHBOARD_ACTIVE){   // every section after the hero rises; the hero choreographs itself (12-project-home.css)
    if(motionReveal(grid, [...grid.children].slice(1), all(grid, '.dx-pgrid > .dx-pc, .dx-health > .dx-ht, .dx-oq tbody tr'))) motionWords(grid.querySelector('.dx-title'));
    return;
  }
  if(detailView.classList.contains('active')){
    const card = detailView.querySelector('.detail-card');
    card.classList.remove('dx-motion');
    const blocks = all(card, ':scope > .detail-head, :scope > #docTools, #pHero > section:not(.pe-hero), #pBody > section, #pBody > .tr-main, #pBody > .tr-pane')
      .concat(all(card, '#doc > *').slice(0, 12));
    // a persona's tables arrive row by row, like the Overview's cards and questions
    const items = all(card, '.tr-pane-body > *').slice(0, 10).concat(all(card, '.pe-facts > div, #pHero .dx-table tbody tr'));
    if(!motionReveal(card, blocks, items)) return;
    // the persona hero choreographs itself, as the Overview's does (16-motion.css)
    const hero = card.querySelector('.pe-hero');
    if(hero){ hero.classList.add('mo-enter'); motionWords(hero.querySelector('.pe-name')); }
    return;
  }
  if(BACKLOG_ACTIVE){
    motionReveal(grid, all(grid, '.bl-bar, .bl-table > *, .bl-board > .bl-col'), all(grid, '.bl-col .bl-card'));
    return;
  }
  if(HELP_ACTIVE){ motionReveal(grid, all(grid, '.help-nav, .help-main > *:not(#helpList), #helpList > *')); return; }
  if(SETTINGS_ACTIVE){ const sw = document.querySelector('.set-wrap'); motionReveal(sw, all(sw, ':scope > *')); return; }
  motionReveal(grid, all(grid, ':scope > *:not(.ev-wrap), .ev-chips, .ev-fold'));   // the gallery of any type; Evidence folders rise one by one
  // the Personas tab: its head arrives the way a persona's name does (16-motion.css)
  const head = document.querySelector('.content > .page-head');
  if(!head) return;
  head.classList.remove('mo-enter');
  if(activeType === 'Persona' && grid.classList.contains('dx-motion')){
    void head.offsetWidth;   // restart the animation when the tab is entered again
    head.classList.add('mo-enter');
    motionWords(document.getElementById('pageTitle'));
  }
}
