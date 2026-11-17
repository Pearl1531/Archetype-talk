/* ---------- chapter scrubber: the transcript's sections as a rail of ticks ----------
   One short tick per section, sticky beside the text. Under the pointer the
   ticks swell in a wave (a raised-cosine bump: no seams at its edge) and a
   card beside the rail previews the section — title, its timestamp, the first
   words said in it. Click / Enter jumps there; arrows walk the rail. The tick
   of the section you are reading stays in the accent colour.
   Two springs drive it — the pointer (stiff: the wave sticks to the cursor)
   and the strength (soft: it swells and settles). Reduced motion drops the
   springs and keeps the wave. CSS: .tr-chap in 10b-transcript.css. */
const TR_CH = { row: 12, rest: 10, peak: 34, radius: 4 };
let TR_CH_SPY = null;   // the open transcript's scroll-spy, null when there is none
addEventListener('scroll', ()=>{ if(TR_CH_SPY) TR_CH_SPY(); }, { capture: true, passive: true });

function trChapters(main, doc){
  main.querySelector('.tr-chap')?.remove(); TR_CH_SPY = null;
  const secs = [...doc.querySelectorAll('.tr-anchor')];
  main.classList.toggle('has-chap', secs.length > 1);
  if(secs.length < 2) return;
  const { row, rest, peak, radius } = TR_CH, last = secs.length - 1;
  const chs = secs.map(a=>{
    let t = a.nextElementSibling; while(t && !t.classList.contains('tr-turn') && !t.classList.contains('tr-anchor')) t = t.nextElementSibling;
    const turn = t && t.classList.contains('tr-turn') ? t : null;
    const ts = turn && turn.querySelector('.tr-spk time');
    return { el: a,
      title: (a.querySelector('b') || a).textContent.trim(),
      meta: (a.querySelector('i') || ts || {}).textContent || '',
      desc: turn ? trim(turn.querySelector('.tr-txt').textContent, 140) : '' };
  });
  const wrap = document.createElement('nav');
  wrap.className = 'tr-chap';
  wrap.style.setProperty('--ch-h', (chs.length * row) + 'px');
  wrap.innerHTML = `<div class="tr-chap-rail" role="listbox" aria-orientation="vertical" aria-label="${esc(tr('Sections'))}">${chs.map((c, i)=>
      `<button type="button" role="option" tabindex="${i ? -1 : 0}" aria-label="${esc(c.title + (c.desc ? '. ' + c.desc : ''))}" style="height:${row}px"><span></span></button>`).join('')}</div>
    <div class="tr-chap-card" aria-hidden="true"><small></small><b></b><p></p></div>`;
  doc.before(wrap);
  const rail = wrap.firstElementChild, btns = [...rail.children], bars = btns.map(b=> b.firstElementChild);
  const card = wrap.lastElementChild, [cMeta, cTitle, cDesc] = card.children;

  /* springs: x moves toward target t with velocity v */
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = { x: 0, v: 0, t: 0, k: 700, c: 52, m: .5 }, S = { x: 0, v: 0, t: 0, k: 260, c: 30, m: .6 };
  let active = -1, current = -1, raf = 0, prev = 0, hovering = false, focused = null;
  const bump = d=> d >= radius ? 0 : .5 * (1 + Math.cos(Math.PI * d / radius));
  const show = i=>{
    i = Math.max(0, Math.min(last, i));
    if(i === active) return;
    active = i; const c = chs[i];
    cMeta.textContent = c.meta; cMeta.hidden = !c.meta;
    cTitle.textContent = c.title;
    cDesc.textContent = c.desc; cDesc.hidden = !c.desc;
  };
  const paint = ()=>{
    bars.forEach((b, i)=>{
      const rise = S.x * bump(Math.abs(i - P.x)), base = i === current ? .6 : .22;
      b.style.width = (rest + rise * (peak - rest)) + 'px';
      b.style.opacity = base + rise * (1 - base);
      b.style.transform = `scaleY(${1 + rise * .4})`;
    });
    const h = card.offsetHeight, total = chs.length * row, half = h / 2;
    const mid = Math.min(Math.max((P.x + .5) * row, half), Math.max(half, total - half));
    card.style.top = (mid - half) + 'px';
    card.style.opacity = S.x;
    card.style.transform = `translateX(${(1 - S.x) * -6}px) scale(${.97 + .03 * S.x})`;
    card.style.visibility = S.x < .01 ? 'hidden' : 'visible';
  };
  const spring = (s, dt)=>{ s.v += ((s.t - s.x) * s.k - s.v * s.c) / s.m * dt; s.x += s.v * dt; };
  const frame = now=>{
    // rAF's timestamp can predate the performance.now() taken in kick(): a negative step blows the spring up
    const dt = now > prev ? Math.min(1/30, (now - prev) / 1000) : 1/60; prev = now;
    if(still){ P.x = P.t; S.x = S.t; } else { spring(P, dt); spring(S, dt); }
    paint();
    const calm = [P, S].every(s=> Math.abs(s.t - s.x) < .001 && Math.abs(s.v) < .01);
    if(calm){ P.x = P.t; S.x = S.t; paint(); raf = 0; } else raf = requestAnimationFrame(frame);
  };
  const kick = ()=>{ if(!raf){ prev = performance.now(); raf = requestAnimationFrame(frame); } };
  const engage = (at, i)=>{ P.t = at; S.t = 1; show(Math.round(i)); kick(); };
  const release = ()=>{ S.t = 0; kick(); };

  rail.onpointermove = ev=>{
    const r = rail.getBoundingClientRect(), at = (ev.clientY - r.top) / row - .5;
    hovering = true; engage(Math.max(-.5, Math.min(last + .5, at)), at);
  };
  rail.onpointerleave = ()=>{ hovering = false; if(focused != null) engage(focused, focused); else release(); };
  btns.forEach((b, i)=>{
    b.onfocus = ()=>{ focused = i; btns.forEach((x, k)=> x.tabIndex = k === i ? 0 : -1); engage(i, i); };
    b.onclick = ()=> chs[i].el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
  });
  rail.onfocusout = ev=>{ if(!rail.contains(ev.relatedTarget)){ focused = null; if(!hovering) release(); } };
  rail.onkeydown = ev=>{
    const at = focused ?? active, to = { ArrowDown: at + 1, ArrowRight: at + 1, ArrowUp: at - 1, ArrowLeft: at - 1, Home: 0, End: last }[ev.key];
    if(to == null) return;
    ev.preventDefault(); btns[Math.max(0, Math.min(last, to))].focus();
  };
  /* the section you are reading: the last one whose bookmark has passed a third of the screen */
  TR_CH_SPY = ()=>{
    if(!wrap.isConnected){ TR_CH_SPY = null; return; }
    let k = 0; secs.forEach((a, i)=>{ if(a.getBoundingClientRect().top < innerHeight / 3) k = i; });
    if(k === current) return;
    current = k; btns.forEach((b, i)=> b.setAttribute('aria-selected', i === k)); paint();
  };
  TR_CH_SPY(); paint();
}
