/* ---------- workspaces (Capacities-style) ----------
   Two permanent spaces that never mix: the DEMO workspace (the embedded
   example set + any demo: true files on disk) and the PROJECT workspace
   (the user's real research + local drafts). Every entity carries e.ws;
   every list, count, search and export is scoped to the current one. */
document.querySelectorAll('script[type="text/markdown"]').forEach(s=> addEntity(s.textContent, s.dataset.file));
{ const pc = document.querySelector('script[type="text/product-context"]');
  if(pc) PRODUCT_RAW = pc.textContent; }
{ const bl = document.querySelector('script[type="text/research-backlog"]');
  if(bl) BACKLOG_DEMO_RAW = bl.textContent.replace(/^\n/,''); }
Object.values(ENTITIES).forEach(e=> e.ws='demo');
const EMBEDDED_DEMO = {...ENTITIES};   // pristine copy — re-merged after every folder load, so Demo is always available
let WS = store.get('at-ws')==='project' ? 'project' : 'demo';
function wsEntities(){ return Object.values(ENTITIES).filter(e=> (e.ws||'project')===WS); }
function wsTagFresh(map){ Object.values(map).forEach(e=>{ e.ws = e.fm.demo ? 'demo' : 'project'; }); return map; }
function setWs(w){
  if(w!==WS){ WS=w; store.set('at-ws', w); }
  const cur = ENTITIES[CURRENT];
  if(detailView.classList.contains('active') && cur && (cur.ws||'project')!==WS){ suppressRoute=false; location.hash=''; }
  renderWsMenu(); renderTabs(); renderBacklogCount();
  if(MINDMAP_ACTIVE) renderMindMap();
  else if(DASHBOARD_ACTIVE) renderDashboard();
  else if(BACKLOG_ACTIVE) renderBacklog();   // the backlog is per-workspace too: demo sandbox vs the file on disk
  else if(!HELP_ACTIVE && !SETTINGS_ACTIVE) renderGrid(searchInput.value);
  if(!MINDMAP_ACTIVE && !DASHBOARD_ACTIVE && !BACKLOG_ACTIVE) updatePageHead();
}
/* ---------- the top-left menu ----------
   Not a switcher any more. Switching projects belongs to one place — the
   Projects screen — because that is where a project is a thing you can see,
   with its name, size and when you last opened it; a two-row dropdown was a
   second, poorer copy of that list. What stays here is what the menu is good
   at: telling you where you are, and the doors out. */
function renderWsMenu(){
  const label = document.getElementById('wsLabel');
  const name = WS==='demo' ? tr('Spotify listeners') : projectDisplayName();
  label.textContent = name;
  /* the project's face: the demo studies Spotify, so it wears Spotify's app
     icon (bundled, 1.8 KB WebP); a real project gets its initial on ink */
  document.getElementById('wsSub').textContent = WS==='demo' ? tr('Example project') : tr('Your project');
  document.getElementById('wsIco').innerHTML = WS==='demo'
    ? '<img src="__IMG:spotify-app-icon.webp__" alt="" width="36" height="36">'
    : `<span class="ws-ini">${esc((name.trim()[0] || '?').toUpperCase())}</span>`;
  const menu = document.getElementById('wsMenu');
  const desc = WS==='demo'
    ? tr('example dataset — a fully editable sandbox (this browser only), never mixes with your work')
    : tr(DIRHANDLE ? 'your research from the connected folder'
                   : 'your real project — empty until research lands (drafts live here too)');
  const n = wsEntities().length;
  const sandboxEdits = Object.keys(loadDemoOverlay()).length + (store.get('at-backlog-demo')?1:0);
  menu.innerHTML = `
    <div class="ws-menu-head">${esc(tr('Archetype Talk'))}</div>
    <div class="ws-item ws-current" aria-current="true">
      <span class="ws-item-ico">${WS==='demo' ? '🧪' : '📁'}</span>
      <span class="ws-item-txt"><b>${esc(name)}</b><small>${esc(desc)}</small></span>
      <span class="n">${n}</span></div>
    <button class="ws-item ws-connect" id="wsProjects">${esc(tr('▦ All projects…'))}</button>
    ${DIRHANDLE ? '' : `<button class="ws-item" id="wsConnect">${esc(tr('📂 Connect your project folder…'))}</button>`}
    ${WS==='demo' && sandboxEdits ? `<button class="ws-item" id="wsResetDemo" title="${esc(tr('Discard the sandbox edits stored in this browser and restore the shipped example set'))}">${esc(trn(sandboxEdits,'↺ Reset demo ({n} sandbox edit)','↺ Reset demo ({n} sandbox edits)','↺ Zresetuj demo ({n} zmiana w piaskownicy)','↺ Zresetuj demo ({n} zmiany w piaskownicy)','↺ Zresetuj demo ({n} zmian w piaskownicy)'))}</button>` : ''}
    <div class="ws-lang">
      <span>${esc(tr('Language'))}</span>
      <span class="lang-switch" role="group" aria-label="${esc(tr('Language'))}">
        <button type="button" class="lang-opt${LANG==='en'?' on':''}" data-ws-lang="en">EN</button><button type="button" class="lang-opt${LANG==='pl'?' on':''}" data-ws-lang="pl">PL</button>
      </span>
    </div>`;
  menu.querySelectorAll('[data-ws-lang]').forEach(b=> b.onclick=(ev)=>{ ev.stopPropagation(); setLang(b.dataset.wsLang); renderWsMenu(); });
  /* The way between projects — and to the Demo — is the Projects screen. */
  const prj = menu.querySelector('#wsProjects');
  if(prj) prj.onclick = ()=>{ wsMenuHide(); if(location.hash==='#projects') projectsEnter(); else location.hash='projects'; };
  const conn = menu.querySelector('#wsConnect');
  if(conn) conn.onclick = async ()=>{ wsMenuHide(); if(window.showDirectoryPicker){ await loadFromPicker(); } else toast(tr('Connecting a folder needs Chrome or Edge')); };
  const rst = menu.querySelector('#wsResetDemo');
  if(rst) rst.onclick = ()=>{ wsMenuHide(); if(confirm(tr('Reset the Demo workspace?')+'\n'+tr('All sandbox edits made in this browser (highlights, votes, text changes) will be discarded and the shipped example set restored.'))) resetDemoSandbox(); };
}
function wsMenuHide(){ document.getElementById('wsMenu').style.display='none'; document.getElementById('wsBtn').setAttribute('aria-expanded','false'); }
document.getElementById('wsBtn').onclick = (ev)=>{
  ev.stopPropagation();
  const m = document.getElementById('wsMenu');
  const open = m.style.display==='none';
  if(open){
    renderWsMenu();
    const r = ev.currentTarget.getBoundingClientRect();   // menu is position:fixed — anchor it to the button
    m.style.left = Math.max(8, Math.min(r.left, window.innerWidth-272))+'px';
    m.style.top  = (r.bottom + 6)+'px';
    m.style.display='flex';
    document.getElementById('wsBtn').setAttribute('aria-expanded','true');
  }
  else wsMenuHide();
};
document.addEventListener('click', ev=>{
  const m = document.getElementById('wsMenu');
  if(m.style.display!=='none' && !m.contains(ev.target)) wsMenuHide();
});

/* ---------- what this project is called ----------
   A folder name is a path, not a name: `ArchetypeTalk-test` says where the
   files sit, not what the work is. `project_name:` in the frontmatter of
   `Product Context.md` overrides it everywhere the project is *named* (the
   workspace label, the Projects list). Anywhere we talk about the FOLDER —
   "saved into <folder>", the reconnect banner — the real folder name stays,
   because that is the thing on disk. Absent field = folder name, as before. */
function projectNameOverride(){
  const m = (PRODUCT_RAW||'').replace(/\r/g,'').match(/^\s*---\n([\s\S]*?)\n---/);
  if(!m) return '';
  const mm = m[1].match(/^project_name:\s*(.*)$/m);
  return mm ? mm[1].replace(/\s+#.*$/,'').trim().replace(/^['"]|['"]$/g,'') : '';
}
function projectDisplayName(){
  return projectNameOverride() || (DIRHANDLE ? DIRHANDLE.name : tr('My project'));
}

function getProduct(){
  if(!PRODUCT_RAW) return null;
  let fm = {}, body = PRODUCT_RAW;
  const m = PRODUCT_RAW.replace(/\r/g,'').match(/^\s*---\n([\s\S]*?)\n---/);   // \s* — the embedded <script> copy starts with a newline
  if(m){ body = PRODUCT_RAW.slice(m[0].length);
    m[1].split('\n').forEach(l=>{ const mm=l.match(/^([\w_]+):\s*(.*)$/); if(mm) fm[mm[1]]=mm[2].trim().replace(/^['"]|['"]$/g,''); }); }
  const rawTitle = fm.title || (body.match(/^#\s+(.+)/m)||[])[1] || 'Our product';
  const name = rawTitle.split(/\s+[—–-]\s+/)[0].trim();  // "Spotify — product context" → "Spotify"
  const secMatch = body.match(/^##\s*What the product is\s*\n+([\s\S]*?)(?=\n##\s|\n#\s|$)/im);
  const blurb = secMatch ? secMatch[1].trim().split('\n\n')[0].replace(/\s+/g,' ').trim() : '';
  // Compare view config: `compare_categories: [A, B, C]` (project-specific axes,
  // set at project setup) + our own `## Comparison` table so "us" can be a column.
  const catsRaw = (fm.compare_categories||'').match(/\[([^\]]*)\]/);   // tolerate a trailing # comment
  const cats = catsRaw ? catsRaw[1].split(',').map(s=>s.trim().replace(/^['"]|['"]$/g,'')).filter(Boolean) : null;
  return { name, blurb, updated: fm.updated || '', demo: PRODUCT_RAW.includes('demo:'), cats, rows: parseCompareTable(body) };
}

/* ---------- sidebar nav ---------- */
const tabsEl = document.getElementById('tabs');
const pageTitle = document.getElementById('pageTitle');
const pageSub = document.getElementById('pageSub');
/* Page subtitles, Apple voice: short, warm, benefit-first — but every one still
   carries the load-bearing fact (what grounds it, how to read it). */
const PAGE_DESC = {
  All: 'Everything your team has learned. In one place. Open any card and follow it back to the person who said it.',
  Persona: 'Real people, remembered. Every persona is built from actual conversations — and only says what your research can back up.',
  Archetype: 'The pattern behind the person. Archetypes capture the tension people share, so a conversation can speak for many — not just one anecdote.',
  Signal: 'Heard firsthand. One observation per file, straight from a real session, quote and all. Everything else in the graph stands on these.',
  Evidence: 'The homework, done. Reports, numbers and public threads that back up what you heard — or push back on it.',
  Hypothesis: 'A hunch worth testing. Written as If / By / Will / Because, with nothing to prove it yet. The day research catches up, promote it to an Idea.',
  IdeaForImprovement: 'A change worth making — and the research that earns it. Written as When / I want / So that; the bars show how much evidence stands behind each one.',
  Competitor: 'Know the field. The map shows who your own participants keep bringing up — not who is biggest. Personas stay unaware of all this unless you switch it on.',
  Transcript: 'Where every insight was born. The full conversations, word for word — one file, one person.'
};
function updatePageHead(){
  pageTitle.textContent = activeType==='All' ? tr('All entities') : tr(TYPES[activeType].label);
  pageSub.textContent = tr(PAGE_DESC[activeType] || PAGE_DESC.All);
  pageSub.style.display = '';
  syncLinTheme();
}
/* Apple is the app's look now (the Linear / ElevenLabs experiments were
   dropped). lin-all carries the shared tokens + component styles; lin-side
   the sidebar; lin-mm the Mind Map canvas.

   lin-all/lin-side are hardcoded on <body> in shell.html and nothing ever
   takes them off, so only lin-mm is actually a per-page toggle. The prefix
   they add is not decoration: `body.lin-all .btn` outranks a bare `.btn`, and
   10-backlog.css / 12-project-home.css are written against exactly that —
   dropping it silently hands those pages back to the skin's greys. Strip it
   only together with re-tuning those files. */
function hideGalleryChrome(){   // bars are siblings of the grid; pages that replace the grid must hide them
  ['ideaBar','hypoBar','compBar','newBar','freshBar','filterBar'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
  const ss=document.getElementById('sampleStat'); if(ss) ss.innerHTML='';
}
function syncLinTheme(){
  document.body.classList.toggle('lin-mm', MINDMAP_ACTIVE);
}
const ALL_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4l-8 4l8 4l8 -4l-8 -4"/><path d="M4 12l8 4l8 -4"/><path d="M4 16l8 4l8 -4"/></svg>';
function renderTabs(){
  const list = wsEntities();
  const counts = {}; list.forEach(e=> counts[e.type]=(counts[e.type]||0)+1);
  const total = list.length;
  // a full-screen page (Overview/Settings/Help/Mind Map) owns the active state —
  // don't also light up a graph tab, or two sections look selected at once
  const inView = DASHBOARD_ACTIVE || SETTINGS_ACTIVE || HELP_ACTIVE || MINDMAP_ACTIVE || BACKLOG_ACTIVE;
  let html = `<button class="nav-item ${!inView && activeType==='All'?'active':''}" data-t="All">${ALL_ICON}${tr('All')}<span class="n">${total}</span></button>`;
  Object.entries(TYPES).forEach(([raw,ty])=>{
    const c = counts[raw] || 0;
    html += `<button class="nav-item ${!inView && activeType===raw?'active':''}" data-t="${raw}">${ICONS[raw]}${tr(ty.label)}<span class="n">${c}</span></button>`;
  });
  tabsEl.innerHTML = html;
  tabsEl.querySelectorAll('.nav-item').forEach(b=> b.onclick=()=>{
    activeType=b.dataset.t;
    if(HELP_ACTIVE || SETTINGS_ACTIVE || MINDMAP_ACTIVE || DASHBOARD_ACTIVE || BACKLOG_ACTIVE){ helpExit(); settingsExit(); mindmapExit(); dashboardExit(); backlogExit(); if(location.hash) { suppressRoute = true; location.hash=''; } }
    renderTabs(); renderGrid(searchInput.value);
    updatePageHead();
  });
}

