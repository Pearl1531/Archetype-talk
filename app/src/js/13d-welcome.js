/* ---------- First run — the welcome ----------
   The one screen shown before anything else, exactly once. Not a tour and not
   a feature tour-in-disguise: it asks the single question that decides what
   the app is for you — where are your files? — and offers the two honest
   answers (connect a folder, or look around the Demo). Everything else it says
   is what we can promise before you have trusted us with anything: this runs
   locally.

   It replaces the old auto-opening tour on first run (kept in the code, no
   longer opened by itself — see TOUR_AUTO in 14-boot-router.js). Two
   onboardings stacked is one too many.

   The field behind it is drawn, not decorated: a slow drift of faint dots and
   three hairlines, stopped entirely under prefers-reduced-motion and torn down
   the moment the screen closes, so nothing keeps animating off-screen. */
let WELCOME_ACTIVE = false;
const welcomeView = document.getElementById('welcomeView');
const WC_REPO = 'https://github.com/Pearl1531/Archetype-talk';

/* ---- the particle field ----
   Three layers, cheapest first: a static dot grid in CSS behind everything, a
   few hairlines, and these drifting dots. The dots notice the cursor — inside
   PULL_R they lean toward it, brighten, and thread a faint line back to it, so
   moving the mouse pulls the field along rather than sliding a picture around.
   Depth (`z`) gives each dot its own parallax, so the near ones travel further
   than the far ones and the whole thing reads as space, not wallpaper. */
const WC_PULL_R = 260;          // how far the cursor reaches
function wcField(canvas){
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dots = [], lines = [], raf = null, alive = true;
  let mx = 0, my = 0, tx = 0, ty = 0, hasPointer = false;

  function size(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if(!hasPointer){ mx = tx = w / 2; my = ty = h / 2; }
    seed();
  }
  function seed(){
    const n = Math.max(70, Math.min(240, Math.round(w * h / 7000)));
    dots = Array.from({ length: n }, ()=>{
      const z = Math.random();                       // 0 = far, 1 = near
      return {
        x: Math.random() * w, y: Math.random() * h, z,
        r: 0.6 + z * 1.3,
        a: 0.12 + z * 0.32,
        vx: (Math.random() - 0.5) * 0.07, vy: (Math.random() - 0.5) * 0.07,
        t: Math.random() * Math.PI * 2, ts: Math.random() * 0.007 + 0.002,
        // one dot in twelve carries the accent — the app's voice, barely audible
        ember: Math.random() < 0.08,
      };
    });
    lines = [0.33, 0.52, 0.72].map(p => ({ y: Math.round(h * p) + 0.5, a: 0.05 + Math.random() * 0.02 }));
  }
  function draw(){
    ctx.clearRect(0, 0, w, h);
    lines.forEach(l=>{
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,' + l.a.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, l.y); ctx.lineTo(w, l.y); ctx.stroke();
    });
    // parallax: the field leans with the cursor, near dots further than far ones
    const px = (mx - w / 2), py = (my - h / 2);
    dots.forEach(d=>{
      const ox = d.x + px * 0.035 * d.z, oy = d.y + py * 0.035 * d.z;
      const dx = mx - ox, dy = my - oy;
      const dist = Math.hypot(dx, dy);
      const near = dist < WC_PULL_R ? 1 - dist / WC_PULL_R : 0;
      const a = Math.min(0.85, d.a * (0.7 + 0.3 * Math.sin(d.t)) + near * 0.42);
      if(near > 0.35){                                    // the thread back to the cursor
        ctx.strokeStyle = 'rgba(255,255,255,' + ((near - 0.35) * 0.11).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(mx, my); ctx.stroke();
      }
      ctx.fillStyle = d.ember ? 'rgba(255,77,0,' + (a * 0.95).toFixed(3) + ')'
                              : 'rgba(255,255,255,' + a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(ox, oy, d.r + near * 0.7, 0, Math.PI * 2); ctx.fill();
    });
  }
  function step(){
    if(!alive) return;
    mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;       // the cursor is followed, never snapped to
    dots.forEach(d=>{
      const dx = mx - d.x, dy = my - d.y;
      const dist = Math.hypot(dx, dy) || 1;
      if(dist < WC_PULL_R){
        /* Lean in, gently — but the pull dies at 90px and reverses inside 45,
           so a cursor left sitting still gathers a halo instead of vacuuming
           its whole neighbourhood into one clump. */
        const ring = dist < 90 ? (dist - 45) / 45 : 1;
        const f = (1 - dist / WC_PULL_R) * 0.05 * (0.4 + d.z) * ring;
        d.vx += (dx / dist) * f; d.vy += (dy / dist) * f;
      }
      d.vx *= 0.965; d.vy *= 0.965;                       // and drift back to a crawl
      const sp = Math.hypot(d.vx, d.vy), cap = 0.9;
      if(sp > cap){ d.vx = d.vx / sp * cap; d.vy = d.vy / sp * cap; }
      d.x += d.vx; d.y += d.vy; d.t += d.ts;
      if(d.x < -4) d.x = w + 4; else if(d.x > w + 4) d.x = -4;
      if(d.y < -4) d.y = h + 4; else if(d.y > h + 4) d.y = -4;
    });
    draw();
    raf = requestAnimationFrame(step);
  }
  const onResize = ()=>{ size(); draw(); };
  /* The pointer is read on the whole screen, card included — the field belongs
     to the page, not to the empty margins around the card. */
  const host = canvas.parentNode;
  const onMove = ev=>{
    const r = canvas.getBoundingClientRect();
    tx = ev.clientX - r.left; ty = ev.clientY - r.top; hasPointer = true;
  };
  const onLeave = ()=>{ tx = w / 2; ty = h / 2; };        // no cursor: settle back to the middle
  size();
  if(reduce) draw(); else step();          // reduced motion: one still frame, no loop
  window.addEventListener('resize', onResize);
  if(!reduce){ host.addEventListener('mousemove', onMove); host.addEventListener('mouseleave', onLeave); }
  return ()=>{
    alive = false; if(raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    host.removeEventListener('mousemove', onMove); host.removeEventListener('mouseleave', onLeave);
  };
}
let WC_STOP = null;

/* ---- the setup walk-through ----
   Five steps. The first is a greeting, the last is the folder picker, and the
   three in between answer the question the old single card never did: what is
   this thing, and what am I agreeing to when I hand it a folder? Asking for
   disk access on the very first screen, with nothing said yet, is the part
   people were right to hesitate at — so the ask now comes last, after the
   answer. */

const WC_ICONS = {
  graph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2.4"/><circle cx="19" cy="12" r="2.4"/><circle cx="7" cy="18" r="2.4"/><path d="M7.2 7.2 16.7 11M16.9 13.6 9 16.8"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7H5.5A1.5 1.5 0 0 0 4 8.5V12h5V7ZM4 12v2.5A2.5 2.5 0 0 0 6.5 17M20 7h-3.5A1.5 1.5 0 0 0 15 8.5V12h5V7ZM15 12v2.5a2.5 2.5 0 0 0 2.5 2.5"/></svg>',
  levels: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19v-5M11 19V9M17 19V5"/></svg>',
  talk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a7 7 0 0 1-7 7H8l-4 3 1.2-4A7 7 0 0 1 13 5a7 7 0 0 1 7 7Z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9.5 17 4 11.5"/></svg>',
  browser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M6.5 6.5h.01M9.5 6.5h.01"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3.5M15.5 12v2.5"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v7.5A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5Z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  root: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v6M12 10c0 3-6 2-6 6M12 10c0 3 6 2 6 6"/><circle cx="12" cy="3.5" r="1.6"/><circle cx="6" cy="17.5" r="1.6"/><circle cx="18" cy="17.5" r="1.6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13"/><path d="m12 5 7 7-7 7"/></svg>',
};

/* The screenshots. Real pictures of the two things these steps describe — the
   graph you get, and a conversation with a persona — because "a knowledge
   graph you can talk to" is a sentence people nod at without seeing anything.
   They are inlined as data: URIs at build time from app/src/img (see
   inline_images in scripts/build_app.py): the app is one file you can e-mail,
   and its CSP allows data: images and no remote host at all. A file that is
   not there yet simply renders nothing — the step keeps working. */
const WC_SHOTS = {
  graph: '__IMG:wizard-graph.jpg__',
  talk:  '__IMG:wizard-talk.jpg__',
};

/* The steps, in order. `hero` opens, `connect` closes, the rest are one
   explanation each — three bullets is the ceiling on purpose. */
function wcSteps(){
  return [
    { kind: 'hero' },
    { kind: 'info', title: tr('What this repository is'),
      shot: WC_SHOTS.graph, shotAlt: tr('The mind map: personas, signals, evidence and hypotheses joined by their links'),
      lead: tr('A UX-research knowledge graph you can talk to. Your interviews and reports stay ordinary Markdown files in your folder — this app is the reading layer on top of them.'),
      bullets: [
        [WC_ICONS.graph, tr('Evidence → Signal → Persona → Idea'), tr('A persona is assembled from what people actually said, and every claim links back to the file it came from.')],
        [WC_ICONS.quote, tr('Nothing here is invented'), tr('Quotes, numbers and sources are never generated. A claim with no source stays a hypothesis — and is labelled as one.')],
        [WC_ICONS.levels, tr('Levels, not vibes'), tr('Each finding carries a level from L1 (assumption) to L5 (validated with correlation), so you can see how much weight it holds.')],
      ] },
    { kind: 'info', title: tr('You and your AI assistant'),
      shot: WC_SHOTS.talk, shotAlt: tr('A conversation with a persona, answering from her own signals'),
      lead: tr('The app shows the graph; your AI assistant writes it. Both work on the same folder of Markdown files, so neither of them owns your data.'),
      bullets: [
        [WC_ICONS.talk, tr('Talk to a persona'), tr('She answers only from her linked signals and evidence — and a conversation never creates research data, only questions to go and ask.')],
        [WC_ICONS.file, tr('Turn interviews into findings'), tr('Put a transcript in the folder and ask the assistant to extract findings: signals and evidence come back with sources attached.')],
        [WC_ICONS.check, tr('You approve every write'), tr('Files change when you say so. Hand-written links and locked fields are never rewired behind your back.')],
      ] },
    { kind: 'info', title: tr('Safety and privacy'),
      lead: tr('Everything runs on your machine — no account, no server, nothing uploaded. Which is exactly why the browser you open this in matters.'),
      bullets: [
        [WC_ICONS.browser, tr('Use a secure, up-to-date browser'), tr('Reading a local folder needs the File System Access API — Chrome or Edge, kept current. That browser is the only thing standing between a web page and your disk, so an old one is a real risk.')],
        [WC_ICONS.eye, tr('Access is per folder, and you can take it back'), tr('The browser asks before we may read anything, the permission covers one folder and nothing above it, and it lapses when you close the tab.')],
        [WC_ICONS.key, tr('Secrets stay out of the repository'), tr('API keys belong in <code>.env</code> — never in chat, never in a committed file. Data marked sensitive is not exported or read aloud by default.')],
      ] },
    { kind: 'connect', title: tr('Connect the project folder'),
      lead: tr('Last step. Point us at this project’s folder — the one holding <code>Personas/</code>, <code>Signals/</code> and <code>Transcripts/</code>.'),
      bullets: [
        [WC_ICONS.folder, tr('Why this matters'), tr('Without a folder the app has only the demo to show. With one it reads your real research straight from disk — no import, no copy, no sync, no second version of the truth.')],
        [WC_ICONS.eye, tr('What we touch'), tr('We read the <code>.md</code> files in that folder. We write only when you edit something here or ask for it.')],
        [WC_ICONS.root, tr('Pick the project ROOT'), tr('The folder that contains the entity folders — not your whole Documents, and not one folder inside it.')],
      ] },
  ];
}
let WC_STEP = 0;

/* ---- the card ---- */
function renderWelcome(){
  const canPick = !!window.showDirectoryPicker;
  const steps = wcSteps();
  const total = steps.length;
  if(WC_STEP < 0) WC_STEP = 0; if(WC_STEP >= total) WC_STEP = total - 1;
  const st = steps[WC_STEP];
  const last = WC_STEP === total - 1;

  const dots = steps.map((s, i)=>
    `<button type="button" class="wc-dot-step${i===WC_STEP?' on':''}${i<WC_STEP?' done':''}" data-step="${i}"
       aria-label="${esc(tr('Step {n} of {total}').replace('{n}', i+1).replace('{total}', total))}"${i===WC_STEP?' aria-current="step"':''}></button>`).join('');
  const progress = `<div class="wc-prog">
      <div class="wc-dots" role="group" aria-label="${esc(tr('Setup progress'))}">${dots}</div>
      <span class="wc-count">${esc(tr('Step {n} of {total}').replace('{n}', WC_STEP+1).replace('{total}', total))}</span>
    </div>`;

  const body = st.kind === 'hero'
    ? `<div class="wc-mark" aria-hidden="true"><span>AT</span></div>
       <h1 id="wcTitle">${esc(tr('Welcome to Archetype Talk'))}</h1>
       <p class="wc-sub">${esc(tr('Speak with your real data'))}</p>
       <p class="wc-lead">${esc(tr('Five short steps: what this is, how you work with it, what it does with your data — and only then the folder.'))}</p>
       <button class="btn btn-primary wc-btn wc-btn-go" id="wcStart">${esc(tr('Start setup'))}${WC_ICONS.arrow}</button>
       <button class="btn btn-outline wc-btn" id="wcDemo">${esc(tr('Open the demo'))}</button>`
    : `${st.shot ? `<figure class="wc-shot"><img src="${st.shot}" alt="${esc(st.shotAlt||'')}" loading="lazy" decoding="async"></figure>` : ''}
       <h1 id="wcTitle">${esc(st.title)}</h1>
       <p class="wc-lead">${st.lead}</p>
       <ul class="wc-list">${st.bullets.map(([ico, h, p])=>
          `<li><span class="wc-ico" aria-hidden="true">${ico}</span><span class="wc-li-txt"><b>${esc(h)}</b><span>${p}</span></span></li>`).join('')}</ul>
       ${st.kind === 'connect'
          ? `<button class="btn btn-primary wc-btn" id="wcConnect"${canPick ? '' : ' disabled'}>${esc(tr('Connect the project folder'))}</button>
             ${canPick ? '' : `<p class="wc-note">${esc(tr('This browser can browse but not connect a folder — creating and opening projects needs Chrome or Edge.'))}</p>`}
             <button class="btn btn-outline wc-btn" id="wcDemo">${esc(tr('Open the demo instead'))}</button>` : ''}`;

  /* On the last step "Back" is the only thing left in the nav row, and a third
     full-width button under the actual call to action reads as a third choice.
     It shrinks to what it is: the way back. */
  const nav = st.kind === 'hero' ? '' : `<div class="wc-nav${last ? ' wc-nav-end' : ''}">
      <button type="button" class="btn btn-outline" id="wcBack">${esc(tr('Back'))}</button>
      ${last ? '' : `<button type="button" class="btn btn-primary" id="wcNext">${esc(tr('Next'))}</button>`}
    </div>`;

  /* Language sits outside the card, in the corner, on every step — not a step of
     its own and never a decision the walk-through asks for. Someone who does not
     read English needs it before step 1 makes sense, so burying it behind "Next"
     would be the one setting they cannot reach when they need it. It stays put
     while the card changes underneath, which is what makes it read as a property
     of the app rather than part of the sequence. */
  const langSwitch = `<div class="wc-lang lang-switch" role="group" aria-label="${esc(tr('Language'))}">
      <button type="button" class="lang-opt${LANG === 'en' ? ' on' : ''}" data-wc-lang="en">EN</button><button type="button" class="lang-opt${LANG === 'pl' ? ' on' : ''}" data-wc-lang="pl">PL</button>
    </div>`;

  welcomeView.innerHTML = `
    <canvas class="wc-field" id="wcField" aria-hidden="true"></canvas>
    ${langSwitch}
    <div class="wc-card${st.kind === 'hero' ? '' : ' wc-wide'}" role="dialog" aria-modal="true" aria-labelledby="wcTitle">
      ${progress}
      ${body}
      ${nav}
      <div class="wc-links">
        <button type="button" class="wc-link" id="wcSkip">${esc(tr('Skip for now'))}</button>
        <span class="wc-dot">·</span>
        <a class="wc-link" href="${WC_REPO}" target="_blank" rel="noopener noreferrer">${esc(tr('Leave a star on the repo'))}</a>
      </div>
      <div class="wc-foot">
        ${WC_ICONS.lock}
        ${esc(tr('Secured · local-only interface'))}
      </div>
    </div>`;
  if(WC_STOP) WC_STOP();
  WC_STOP = wcField(welcomeView.querySelector('#wcField'));

  const go = n =>{ WC_STEP = n; renderWelcome(); };
  const q = id => welcomeView.querySelector('#' + id);
  if(q('wcStart')) q('wcStart').onclick = ()=> go(WC_STEP + 1);
  if(q('wcNext'))  q('wcNext').onclick  = ()=> go(WC_STEP + 1);
  if(q('wcBack'))  q('wcBack').onclick  = ()=> go(WC_STEP - 1);
  /* The dots are navigation, not decoration: a step you have seen is a step you
     may go back to — and jumping forward costs nothing, since nothing here is
     a form to fill in. */
  welcomeView.querySelectorAll('[data-step]').forEach(b=> b.onclick = ()=> go(+b.dataset.step));
  /* setLang re-renders this card in place, so the step you are on survives the
     switch — changing language is not a reason to start the walk-through again. */
  welcomeView.querySelectorAll('[data-wc-lang]').forEach(b=> b.onclick = ()=> setLang(b.dataset.wcLang));
  if(q('wcConnect')) q('wcConnect').onclick = async ()=>{
    if(!canPick){ toast(tr('Connecting a folder needs Chrome or Edge')); return; }
    if(await loadFromPicker()){ welcomeSeen(); wcGo('dashboard'); }
  };
  if(q('wcDemo')) q('wcDemo').onclick = ()=>{
    store.set('at-last', 'demo');            // next launch opens what you opened last
    setWs('demo'); welcomeSeen(); wcGo('dashboard');
  };
  q('wcSkip').onclick = ()=> welcomeSkip();
}

/* ---- lifecycle ---- */
function welcomeSeen(){ store.set('at-welcome', '1'); }
function welcomeFirstRun(){ return store.get('at-welcome') !== '1'; }
function welcomeEnter(){
  WELCOME_ACTIVE = true;
  WC_STEP = 0;                       // always open at the greeting, never mid-walk
  document.body.classList.add('welcome-open');
  welcomeView.setAttribute('aria-hidden', 'false');
  renderWelcome();
}
function welcomeExit(){
  if(!WELCOME_ACTIVE) return;
  WELCOME_ACTIVE = false;
  if(WC_STOP){ WC_STOP(); WC_STOP = null; }
  document.body.classList.remove('welcome-open');
  welcomeView.setAttribute('aria-hidden', 'true');
  welcomeView.innerHTML = '';
}
/* Skipping is not a dead end: it lands on the Projects screen, which is where
   every way in lives — including the two this card just offered. */
function welcomeSkip(){
  welcomeSeen(); welcomeExit();
  if(!PROJECTS_ACTIVE) projectsEnter();
}
function wcGo(hash){
  welcomeExit();
  projectsExit();
  const cur = location.hash.replace(/^#/, '');
  if(cur === hash){ if(hash === 'dashboard') dashboardEnter(); }
  else { suppressRoute = false; location.hash = hash; }
}
document.addEventListener('keydown', ev=>{
  if(!WELCOME_ACTIVE) return;
  if(ev.key === 'Escape'){ welcomeSkip(); return; }
  /* Arrows walk the steps — but not while the folder picker or a link has
     focus and the user is typing/tabbing through the card. */
  if(ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const n = wcSteps().length;
  if(ev.key === 'ArrowRight' && WC_STEP < n - 1){ WC_STEP++; renderWelcome(); }
  else if(ev.key === 'ArrowLeft' && WC_STEP > 0){ WC_STEP--; renderWelcome(); }
});

/* Exit, from the foot of the sidebar: not a log-out (there is no account to
   log out of) — it puts the welcome back up, which is where both ways in live.
   Nothing is disconnected and nothing is written; the folder you had open is
   still remembered, so coming back is one click. It is also the honest way to
   see this screen again after the first run. */
{ const ex = document.getElementById('exitBtn');
  if(ex) ex.onclick = ()=>{
    if(typeof wsMenuHide === 'function') wsMenuHide();
    document.body.classList.remove('nav-open');
    welcomeEnter();
  };
}
