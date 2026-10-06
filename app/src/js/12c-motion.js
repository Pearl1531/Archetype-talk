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
  if(MO_LEAN !== el){ motionStraighten(MO_LEAN); MO_LEAN = el; }
  if(!el) return;
  const deg = +el.dataset.lean || 4, r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
  el.style.setProperty('--mx', (x*100).toFixed(1)+'%'); el.style.setProperty('--my', (y*100).toFixed(1)+'%');
  el.style.setProperty('--ry', ((x-.5)*2*deg).toFixed(2)+'deg'); el.style.setProperty('--rx', ((.5-y)*1.5*deg).toFixed(2)+'deg');
});
document.addEventListener('pointerleave', ()=>{ motionStraighten(MO_LEAN); MO_LEAN = null; });

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
  motionReveal(grid, all(grid, ':scope > *'));   // the gallery of any type
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
