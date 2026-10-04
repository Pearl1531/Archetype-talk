/* Regression self-tests removed 2026-07-12 to cut per-edit token/verification
   cost — verify changes by driving the app, not a resident suite. */

/* hash router — makes the browser's back/forward buttons work (incl. file://) */
function route(){
  if(suppressRoute){ suppressRoute = false; return; }
  if(editDirty() && !confirm(tr('Discard unsaved changes?'))){
    suppressRoute = true; location.hash = '#'+CURRENT; return;
  }
  exitEdit();
  const h = decodeURIComponent(location.hash.replace(/^#/,''));
  if(h==='projects'){ projectsEnter(); return; }
  projectsExit();   // the Projects screen covers the app — any other route leaves it
  if(h==='dashboard'){ mindmapExit(); settingsExit(); helpExit(); backlogExit(); dashboardEnter(); return; }
  if(h==='settings'){ mindmapExit(); dashboardExit(); backlogExit(); settingsEnter(); return; }
  if(h==='backlog'){ mindmapExit(); settingsExit(); helpExit(); dashboardExit(); backlogEnter(); return; }
  if(h==='mindmap' || h.startsWith('mindmap:')){ dashboardExit(); backlogExit(); mindmapEnter(h.split(':')[1] || null); return; }
  if(h==='help' || h.startsWith('help:')){ mindmapExit(); settingsExit(); dashboardExit(); backlogExit(); helpEnter(h.split(':')[1] || HELP_CAT); return; }
  helpExit(); settingsExit(); mindmapExit(); dashboardExit(); backlogExit();
  if(h && ENTITIES[h]) openDetail(h); else { closeDetail(); renderGrid(searchInput.value); }
}
window.addEventListener('hashchange', route);

/* ---------- toast ---------- */
let toastT;
function toast(msg, action){ // action: {label, fn} — e.g. an Undo
  const t = document.getElementById('toast');
  t.innerHTML = ''; t.appendChild(document.createTextNode(msg));
  if(action){
    const b = document.createElement('button');
    b.className = 'toast-act'; b.textContent = action.label;
    b.onclick = ()=>{ t.classList.remove('show'); action.fn(); };
    t.appendChild(b);
  }
  t.style.pointerEvents = action ? 'auto' : 'none';
  t.classList.add('show'); clearTimeout(toastT);
  toastT = setTimeout(()=> t.classList.remove('show'), action ? 6500 : 3200);
}

/* ---------- load from disk ---------- */
async function ingest(fileList){
  const all = Array.from(fileList);
  const files = all.filter(f=>{
    const nm=(f.webkitRelativePath||f.name).split('/').pop();
    return nm.toLowerCase().endsWith('.md') && !nm.startsWith('_') && !nm.startsWith('.');
  });
  if(!files.length){ toast(tr('No .md files found')); return; }
  // avatars picked up alongside the .md files — read locally, never fetched
  for(const f of all.filter(f=> /\.(svg|png|jpe?g|webp|gif)$/i.test(f.name))){
    try{
      const rel = (f.webkitRelativePath || f.name).split('/').slice(1).join('/') || f.name;
      picStore(rel, await new Promise((res, rej)=>{
        const fr = new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(f);
      }));
    }catch(err){}
  }
  const fresh = {}; let ok=0;
  for(const f of files){
    try{
      const text = await f.text();
      const rel = f.webkitRelativePath || f.name;
      const parts = rel.split('/');
      if(parts.at(-1)===BACKLOG_FILE && parts.length<=2){ BACKLOG_RAW = text; continue; }   // root doc — read-only here, still browsable
      const file = parts.length>1 ? parts.slice(-2).join('/') : rel;
      const e = parseEntity(text, file);
      if(e){ e.id = idFor(file); fresh[e.id] = e; ok++; }
    }catch(err){}
  }
  if(ok){
    ENTITIES = { ...EMBEDDED_DEMO, ...wsTagFresh(fresh) }; reindex();
    applyDemoOverlay();
    rehydrateDrafts();
    setWs('project');
    const d=new Date(); lastLoad = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    renderTabs(); renderBacklogCount(); renderGrid(searchInput.value);
    route(); // re-resolve the current hash against the fresh dataset
    toast(trn(ok,'Loaded {n} file from disk','Loaded {n} files from disk','Wczytano {n} plik z dysku','Wczytano {n} pliki z dysku','Wczytano {n} plików z dysku'));
  } else {
    toast(tr('No file has valid frontmatter (type: Persona / Signal / …)'));
  }
}
async function walkDir(dirHandle, pathParts, out, budget){
  // budget guards against picking a huge folder (home dir, whole disk) by mistake
  budget = budget || { visited: 0, mds: 0, aborted: null };
  for await (const [name, h] of dirHandle.entries()){
    if(budget.aborted) return budget;
    if(++budget.visited > 30000){ budget.aborted = 'entries'; return budget; }
    if(name.startsWith('.') || name==='node_modules' || name==='Library' || name==='AppData') continue;
    if(h.kind==='directory'){ await walkDir(h, [...pathParts, name], out, budget); }
    else if(name.toLowerCase().endsWith('.md') && !name.startsWith('_')){
      if(++budget.mds > 4000){ budget.aborted = 'files'; return budget; }
      try{
        const f = await h.getFile(); const text = await f.text();
        const rel = [...pathParts, name];
        const file = rel.length>1 ? rel.slice(-2).join('/') : rel[0];
        if(pathParts.length===0 && name==='Product Context.md'){ PRODUCT_RAW = text; continue; }
        if(pathParts.length===0 && name===BACKLOG_FILE){ BACKLOG_RAW = text; continue; }   // root doc, not an entity — the Research backlog page owns it
        const e = parseEntity(text, file);
        if(e){
          e.id = idFor(file);
          if(out[e.id] && out[e.id].file !== file) COLLISIONS.push(file + ' ⇄ ' + out[e.id].file);
          e.handle = h; out[e.id] = e;
        }
      }catch(err){}
    }
  }
  return budget;
}
/* Avatars/photos the loaded files point at, read once per load into PIC_INLINE.
   Render functions build HTML synchronously, so this has to happen up front —
   and reading them here is what keeps a local avatar local: the page never
   requests an image from anywhere. */
async function loadLocalPictures(){
  if(!DIRHANDLE) return 0;
  const want = new Set();
  for(const e of Object.values(ENTITIES)){
    for(const field of ['picture','photo']){
      const v = String((e.fm && e.fm[field]) || '').trim();
      if(!v || /^[a-z][a-z0-9+.-]*:/i.test(v)) continue;   // data:, http(s): — not a local file
      const dir = String(e.file||'').includes('/') ? String(e.file).replace(/\/[^/]*$/, '/') : '';
      const rel = v.replace(/^\.\//,'');
      want.add(rel.startsWith('/') ? rel.slice(1) : dir + rel);
    }
  }
  let n = 0;
  for(const path of want){
    if(PIC_INLINE[path]) continue;
    try{
      let dir = DIRHANDLE; const parts = path.split('/');
      for(const part of parts.slice(0,-1)) dir = await dir.getDirectoryHandle(part);
      const file = await (await dir.getFileHandle(parts.at(-1))).getFile();
      picStore(path, await new Promise((res, rej)=>{
        const fr = new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file);
      }));
      n++;
    }catch(err){ /* no such file — that entity just shows its initials */ }
  }
  return n;
}
/* Read a folder the user has already chosen — freshly picked, or the one from
   last session that the browser still lets us open. Returns true when files
   were loaded. */
async function connectDir(dir, opts){
  opts = opts || {};
  DIRHANDLE = dir;
  const fresh = {}; COLLISIONS = []; PRODUCT_RAW = null; BACKLOG_RAW = null;
  const budget = await walkDir(dir, [], fresh);
  if(budget.aborted){
    DIRHANDLE = null;
    toast(tr('Stopped — that folder is enormous ({what}). Pick the project ROOT folder, not your whole disk.')
      .replace('{what}', tr(budget.aborted==='files' ? '4000+ .md files' : '30 000+ entries')));
    return false;
  }
  const ok = Object.keys(fresh).length;
  // A folder with no entities is normally the wrong folder — except right after
  // we created one, where empty is exactly what it should be.
  if(!ok && !opts.allowEmpty){ toast(tr('No entity .md files found in that folder')); return false; }
  ENTITIES = { ...EMBEDDED_DEMO, ...wsTagFresh(fresh) }; reindex();
  applyDemoOverlay();
  await loadLocalPictures();
  const nDrafts = rehydrateDrafts();
  /* Land where the files actually are. Connecting YOUR folder should open YOUR
     workspace — but a folder whose entities are all `demo: true` (a fresh clone
     of this repo, say) leaves the project workspace empty, and switching to it
     would show a blank app while hiding everything just read. */
  const nProject = Object.values(fresh).filter(e=> (e.ws||'project')==='project').length;
  setWs(nProject || opts.created ? 'project' : 'demo');
  await rememberFolder(dir);   // so the next visit starts here instead of at the picker
  store.set('at-last', 'project');
  // …and so the Projects screen can list it next time, with the size it had
  /* Demo is one card, always. A folder that holds nothing but `demo: true`
     files (a fresh clone of this repo is exactly that) opens the Demo
     workspace — listing it as a project too would put two doors to the same
     content on the Projects screen. So it is not remembered as one, and any
     older record for it is dropped. A folder we just scaffolded is empty on
     purpose and stays listed. */
  const nDemoFiles = Object.values(fresh).filter(e=> (e.ws||'project')==='demo').length;
  if(nProject || opts.created){
    await projectRemember(dir, { entities: nProject, created: !!opts.created, label: projectNameOverride(),
      personas: Object.values(fresh).filter(e=>e.type==='Persona').length });
  } else {
    await projectForgetHandle(dir);
    if(nDemoFiles) setTimeout(()=> toast(tr('That folder holds only example files — opened the Demo workspace, and left the Projects list alone.')), 2600);
  }
  if(nDrafts) setTimeout(()=> toast(trn(nDrafts,
      'You have {n} local draft — save it into the project folder?','You have {n} local drafts — save them into the project folder?',
      'Masz {n} lokalny szkic — zapisać go do folderu projektu?','Masz {n} lokalne szkice — zapisać je do folderu projektu?','Masz {n} lokalnych szkiców — zapisać je do folderu projektu?'),
      {label:tr('Save drafts'), fn: writeDraftsToFolder}), 2200);
  try{ await loadSettingsData(); }catch(err){ /* prefs optional — voting will prompt if name missing */ }
  if(COLLISIONS.length) setTimeout(()=> toast('⚠ '+trn(COLLISIONS.length,
      '{n} filename collision (same slug)','{n} filename collisions (same slug)',
      '{n} kolizja nazw plików (ten sam slug)','{n} kolizje nazw plików (ten sam slug)','{n} kolizji nazw plików (ten sam slug)')
      +': '+COLLISIONS[0]+' — '+tr('one shadows the other, rename to keep both')), 1800);
  const d=new Date(); lastLoad = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  renderTabs(); renderBacklogCount();
  if(BACKLOG_ACTIVE) await backlogEnter();
  else if(!SETTINGS_ACTIVE && !HELP_ACTIVE){ renderGrid(searchInput.value); route(); }
  toast(opts.created
    ? tr('Project created — the folders are ready and nothing else in there was touched ✓')
    : opts.restored
    ? trn(ok, 'Reconnected {name} — {n} file ✓', 'Reconnected {name} — {n} files ✓',
              'Połączono ponownie z {name} — {n} plik ✓', 'Połączono ponownie z {name} — {n} pliki ✓',
              'Połączono ponownie z {name} — {n} plików ✓').split('{name}').join(dir.name)
    : trn(ok, 'Loaded {n} file from your folder — in-place editing enabled ✓',
              'Loaded {n} files from your folder — in-place editing enabled ✓',
              'Wczytano {n} plik z twojego folderu — edycja w miejscu włączona ✓',
              'Wczytano {n} pliki z twojego folderu — edycja w miejscu włączona ✓',
              'Wczytano {n} plików z twojego folderu — edycja w miejscu włączona ✓'));
  if(!nProject && ok) setTimeout(()=> toast(trn(ok,
    "All {n} file is flagged demo: true — you're in the Demo workspace. Your project workspace is still empty.",
    "All {n} files are flagged demo: true — you're in the Demo workspace. Your project workspace is still empty.",
    'Wszystkie {n} plik ma flagę demo: true — jesteś w przestrzeni Demo. Twoja przestrzeń projektu jest nadal pusta.',
    'Wszystkie {n} pliki mają flagę demo: true — jesteś w przestrzeni Demo. Twoja przestrzeń projektu jest nadal pusta.',
    'Wszystkie {n} plików ma flagę demo: true — jesteś w przestrzeni Demo. Twoja przestrzeń projektu jest nadal pusta.')), 3400);
  const lbl = document.getElementById('loadBtnLabel');
  lbl.dataset.i18n = 'Refresh files'; lbl.textContent = tr('Refresh files');   // keep the key in sync, or a later language switch would restore "Connect folder"
  const lb = document.getElementById('loadBtn');
  lb.dataset.i18nTitle = 'Re-read the connected folder to pick up changes from git pull or other tools';
  lb.title = tr(lb.dataset.i18nTitle);
  store.set('at-tour-done','1'); // connecting IS the tour's goal — don't nag again
  return true;
}
async function loadFromPicker(){ // returns true when a folder was connected + loaded
  let dir;
  try{ dir = await showDirectoryPicker(); }catch(err){ return false; } // user cancelled
  return connectDir(dir);
}

/* ---------- pick up where you left off ----------
   The handle from last session is in IndexedDB; whether it still opens is the
   browser's call. Chrome can persist the grant itself ("Allow on every visit"),
   and then this is invisible — the app opens straight on your own files. When
   it can't, the handle still saves the folder picker: re-granting has to happen
   inside a click, so we offer exactly that one click. */
function showReconnect(dir){
  const bar = document.getElementById('reconnectBar'); if(!bar) return;
  document.getElementById('reconnectName').textContent = dir.name;
  bar.style.display = 'flex';
  document.getElementById('reconnectBtn').onclick = async ()=>{
    let perm = 'denied';
    try{ perm = await dir.requestPermission({mode:'readwrite'}); }catch(err){}
    if(perm !== 'granted'){ toast(tr('Permission declined — the folder stays disconnected')); return; }
    bar.style.display = 'none';
    try{ if(!(await connectDir(dir, {restored:true}))) await forgetFolder(); }
    catch(err){ await forgetFolder(); toast(tr('That folder is gone — pick it again')); }
  };
  document.getElementById('reconnectX').onclick = async ()=>{ bar.style.display='none'; await forgetFolder(); };
}
/* Returns true only when the folder actually opened — the boot sequence uses
   that to decide between landing in your files and landing on Projects. */
async function restoreFolder(){
  if(!window.showDirectoryPicker) return false;        // Safari/Firefox: no handle to restore
  const dir = await rememberedFolder(); if(!dir) return false;
  let perm = 'prompt';
  try{ perm = await dir.queryPermission({mode:'readwrite'}); }catch(err){ await forgetFolder(); return false; }
  if(perm === 'denied'){ await forgetFolder(); return false; }
  if(perm !== 'granted'){ showReconnect(dir); return false; }
  try{ if(await connectDir(dir, {restored:true})) return true; await forgetFolder(); }
  catch(err){ await forgetFolder(); }                  // folder moved, renamed or deleted
  return false;
}
document.getElementById('loadBtn').onclick = async ()=>{
  if(window.showDirectoryPicker){ await loadFromPicker(); }
  else { document.getElementById('folderInput').click(); } // Safari/Firefox: read-only fallback
};
document.getElementById('folderInput').addEventListener('change', e=> ingest(e.target.files));
{ const pfl=document.getElementById('pickFilesLink'); if(pfl) pfl.onclick=()=> document.getElementById('fileInput').click(); }
document.getElementById('fileInput').addEventListener('change', e=> ingest(e.target.files));

/* drag & drop */
const dropmask=document.getElementById('dropmask'); let dd=0;
window.addEventListener('dragenter',e=>{ e.preventDefault(); dd++; dropmask.classList.add('on'); });
window.addEventListener('dragover',e=> e.preventDefault());
window.addEventListener('dragleave',e=>{ dd--; if(dd<=0){ dd=0; dropmask.classList.remove('on'); } });
window.addEventListener('drop',e=>{ e.preventDefault(); dd=0; dropmask.classList.remove('on'); if(e.dataTransfer.files?.length) ingest(e.dataTransfer.files); });

/* ---------- find-in-transcript (offline, DOM text-node walk — no packages) ---------- */
let FIND_HITS=[], FIND_CUR=-1;
const findInput = document.getElementById('findInput');
function updateFindCount(){
  document.getElementById('findCount').textContent =
    FIND_HITS.length ? (FIND_CUR+1)+' / '+FIND_HITS.length : (findInput.value.trim() ? '0' : '');
}
function clearFind(){
  document.querySelectorAll('#doc .find-hit').forEach(s=>{
    const p=s.parentNode; p.replaceChild(document.createTextNode(s.textContent), s); p.normalize();
  });
  FIND_HITS=[]; FIND_CUR=-1; updateFindCount();
}
function runFind(q){
  clearFind();
  if(!q || q.length<2){ updateFindCount(); return; }
  const doc=document.getElementById('doc');
  const ql=q.toLowerCase();
  const walker=document.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
  const nodes=[]; let nd;
  while((nd=walker.nextNode())) nodes.push(nd);
  nodes.forEach(node=>{
    let t=node;
    while(t && t.nodeValue){
      const i=t.nodeValue.toLowerCase().indexOf(ql);
      if(i===-1) break;
      const hit=t.splitText(i); const rest=hit.splitText(q.length);
      const span=document.createElement('span'); span.className='find-hit';
      hit.parentNode.replaceChild(span, hit); span.appendChild(hit);
      FIND_HITS.push(span); t=rest;
    }
  });
  if(FIND_HITS.length){ FIND_CUR=0; focusFindHit(); }
  updateFindCount();
}
function focusFindHit(){
  FIND_HITS.forEach((s,i)=> s.classList.toggle('cur', i===FIND_CUR));
  const s=FIND_HITS[FIND_CUR]; if(s) s.scrollIntoView({block:'center'});
}
function stepFind(d){
  if(!FIND_HITS.length) return;
  FIND_CUR=(FIND_CUR+d+FIND_HITS.length)%FIND_HITS.length;
  focusFindHit(); updateFindCount();
}
let findT;
findInput.addEventListener('input', ()=>{ clearTimeout(findT); findT=setTimeout(()=> runFind(findInput.value.trim()), 150); });
findInput.addEventListener('keydown', ev=>{
  if(ev.key==='Enter'){ ev.preventDefault(); stepFind(ev.shiftKey?-1:1); }
  if(ev.key==='Escape'){ ev.stopPropagation(); findInput.value=''; clearFind(); findInput.blur(); }
});
document.getElementById('findPrev').onclick=()=> stepFind(-1);
document.getElementById('findNext').onclick=()=> stepFind(1);

/* ---------- highlight selection UI: floating button + tag popover ---------- */
let hlBtnEl=null, hlPopEl=null;
function hideHlUi(){ if(hlBtnEl) hlBtnEl.style.display='none'; if(hlPopEl) hlPopEl.style.display='none'; }
function ensureHlEls(){
  if(hlBtnEl) return;
  hlBtnEl=document.createElement('button');
  hlBtnEl.id='hlBtn'; hlBtnEl.className='hl-float'; hlBtnEl.type='button'; hlBtnEl.textContent='🖍 '+tr('Highlight');
  hlBtnEl.style.display='none';
  hlBtnEl.addEventListener('mousedown', ev=>{ ev.preventDefault(); ev.stopPropagation(); });
  document.body.appendChild(hlBtnEl);
  hlPopEl=document.createElement('div');
  hlPopEl.id='hlPop'; hlPopEl.className='hl-pop'; hlPopEl.style.display='none';
  hlPopEl.addEventListener('mousedown', ev=> ev.stopPropagation());
  document.body.appendChild(hlPopEl);
  document.addEventListener('mousedown', ev=>{
    if(hlPopEl.style.display!=='none' && !hlPopEl.contains(ev.target)) hideHlUi();
  });
}
function openHlPop(x, y, ctx){
  ensureHlEls();
  hlBtnEl.style.display='none';
  const existing = hlAllTagNames();
  const sel = new Set(ctx.tags||[]);
  hlPopEl.innerHTML = `
    <div class="hl-pop-head">${tr(ctx.mode==='edit'?'Edit highlight':'New highlight')}</div>
    <div class="hl-pop-quote">${esc(trim(ctx.selText||ctx.text||'',140))}</div>
    ${existing.length?`<div class="hl-pop-tags">${existing.map(t=>`<button type="button" class="hl-chip${sel.has(t)?' on':''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>`:''}
    <input class="hl-pop-input" id="hlTagInput" placeholder="${esc(tr('new tags, comma-separated (e.g. pain, pricing)'))}" autocomplete="off">
    <div class="hl-pop-actions">
      <button type="button" class="btn btn-primary btn-sm" id="hlSave">${tr('Save')}</button>
      ${ctx.mode==='edit'?`<button type="button" class="btn btn-outline btn-sm" id="hlRemove">${tr('Remove highlight')}</button>`:''}
      <button type="button" class="btn btn-ghost btn-sm" id="hlCancel">${tr('Cancel')}</button>
    </div>`;
  hlPopEl.style.display='block';
  hlPopEl.style.left = Math.max(8, Math.min(x, window.innerWidth-340))+'px';
  hlPopEl.style.top  = (y+8)+'px';
  hlPopEl.querySelectorAll('.hl-chip').forEach(b=> b.onclick=()=> b.classList.toggle('on'));
  document.getElementById('hlCancel').onclick = hideHlUi;
  const rm = document.getElementById('hlRemove');
  if(rm) rm.onclick = async ()=>{ hideHlUi(); await removeHighlight(ctx.e, ctx.hln); };
  document.getElementById('hlSave').onclick = async ()=>{
    const chips=[...hlPopEl.querySelectorAll('.hl-chip.on')].map(b=>b.dataset.t);
    const typed=hlTagsParse(document.getElementById('hlTagInput').value).map(t=>t.replace(/[{}]/g,'').trim()).filter(Boolean);
    const tags=[...new Set([...chips, ...typed])];
    hideHlUi();
    if(ctx.mode==='edit') await editHighlight(ctx.e, ctx.hln, tags);
    else await addHighlight(ctx.e, ctx.selText, ctx.occ, tags);
  };
  const inp=document.getElementById('hlTagInput');
  inp.addEventListener('keydown', ev=>{ if(ev.key==='Enter'){ ev.preventDefault(); document.getElementById('hlSave').click(); } if(ev.key==='Escape'){ ev.stopPropagation(); hideHlUi(); } });
  setTimeout(()=> inp.focus(), 0);
}
document.getElementById('doc').addEventListener('mouseup', ()=>{
  setTimeout(()=>{ // selection finalizes after mouseup
    const e = ENTITIES[CURRENT];
    if(!e || e.type!=='Transcript' || EDITING) return;
    if(hlPopEl && hlPopEl.style.display!=='none') return;
    const sel = window.getSelection();
    if(!sel || sel.isCollapsed || !sel.rangeCount){ if(hlBtnEl) hlBtnEl.style.display='none'; return; }
    const range = sel.getRangeAt(0);
    const doc = document.getElementById('doc');
    if(!doc.contains(range.commonAncestorContainer)) return;
    const text = sel.toString();
    const norm = text.replace(/\s+/g,' ').trim();
    if(norm.length<3){ if(hlBtnEl) hlBtnEl.style.display='none'; return; }
    /* which occurrence was selected? count matches of the selection in the
       rendered text BEFORE it — maps to the nth candidate in the source */
    const pre = document.createRange(); pre.selectNodeContents(doc); pre.setEnd(range.startContainer, range.startOffset);
    const pat = new RegExp(norm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+'), 'g');
    const occ = (pre.toString().match(pat)||[]).length;
    ensureHlEls();
    const r = range.getBoundingClientRect();
    hlBtnEl.style.display='block';
    hlBtnEl.style.left = Math.max(8, Math.min(r.left + r.width/2 - 50 + window.scrollX, window.innerWidth-130))+'px';
    hlBtnEl.style.top  = (r.bottom + window.scrollY + 6)+'px';
    hlBtnEl.onclick = async ()=>{
      hlBtnEl.style.display='none';
      const w = await ensureWritable(e);
      if(!w) return;
      if(w!==e){ openDetail(w.id); toast(tr('Folder connected ✓ — select the fragment again to highlight it')); return; }
      openHlPop(r.left + window.scrollX, r.bottom + window.scrollY, { mode:'new', e, selText:text, occ });
    };
  }, 0);
});

/* Is a <dialog> up? Esc still reaches window while the browser closes the
   dialog, so every other Escape handler has to stand down — otherwise one press
   closes the modal AND walks the history back behind it. */
function modalOpen(){ return !!document.querySelector('dialog[open]'); }

/* keyboard: "/" focuses search, Esc leaves detail.
   Esc on an open modal is the <dialog>'s own — it closes before this runs. */
window.addEventListener('keydown', e=>{
  if(modalOpen()) return;
  if(e.key==='/' && document.activeElement!==filterInput && !detailView.classList.contains('active')){ e.preventDefault(); filterInput.focus(); }
  if(e.key==='Escape' && detailView.classList.contains('active')){
    if(EDITING){ document.getElementById('cancelEditBtn').click(); } else history.back();
  }
});

/* ---------- a11y: make every xref/data-goto target keyboard-operable ----------
   Many click targets render as <div data-goto> or hrefless <a> — invisible to
   Tab and Enter. Stamp each one with a tab stop + a role as it enters the DOM
   (a MutationObserver keeps up with re-renders without touching every call
   site), and let Enter/Space activate it exactly like a mouse click.
   Native <button>/<a href> keep their own handling; <tr> keeps table semantics. */
function a11yStamp(el){
  if(el.dataset.a11yWired) return;
  el.dataset.a11yWired = '1';
  if(!el.hasAttribute('tabindex')) el.tabIndex = 0;
  if(!el.hasAttribute('role') && /^(DIV|SPAN|LI)$/.test(el.tagName)) el.setAttribute('role','button');
}
function a11yScan(node){
  if(node.nodeType!==1) return;
  if(node.matches && node.matches('[data-goto]')) a11yStamp(node);
  if(node.querySelectorAll) node.querySelectorAll('[data-goto]').forEach(a11yStamp);
}
let a11yTrapRaf=0;
new MutationObserver(muts=>{
  for(const m of muts) for(const n of m.addedNodes) a11yScan(n);
  if(!a11yTrapRaf) a11yTrapRaf = requestAnimationFrame(()=>{ a11yTrapRaf=0; a11ySyncTrap(); });
}).observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style'] });
a11yScan(document.body);
document.addEventListener('keydown', ev=>{
  if(ev.key!=='Enter' && ev.key!==' ') return;
  const t = ev.target;
  if(!t || !t.matches || !t.matches('[data-goto]')) return;
  if(t.tagName==='BUTTON' || (t.tagName==='A' && t.getAttribute('href'))) return; // native activation
  ev.preventDefault();
  t.click();
});

/* ---------- focus containment for the overlays that are NOT <dialog> ----------
   While one is open, Tab cycles inside it, focus lands in it on open, and
   returns to whatever opened it on close. The five modals used to be handled
   here too; they are `<dialog>` now and the browser does all three (plus making
   the rest of the page inert, which this never did). What is left are the two
   overlays built as plain divs — the persona poster and its list layer. The
   mind-map drawer is deliberately absent: it is a non-modal side panel, and the
   map stays operable behind it. */
function a11yActiveOverlay(){
  const pp = document.getElementById('ppLayer'); if(pp) return pp;
  if(document.body.classList.contains('poster-open')){ const p=document.getElementById('posterView'); if(p) return p; }
  return null;
}
function a11yFocusables(c){
  return [...c.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    .filter(el=> el.offsetWidth || el.offsetHeight || el===document.activeElement);
}
let a11yOpener=null, a11yTrapped=null, a11yLastOutside=null;
/* Track the last control focused OUTSIDE any overlay, so when a modal that
   focuses its own field opens, we still know what to restore focus to on close. */
document.addEventListener('focusin', ev=>{ if(!a11yActiveOverlay()) a11yLastOutside = ev.target; });
function a11ySyncTrap(){
  const c=a11yActiveOverlay();
  if(c && c!==a11yTrapped){
    if(!a11yTrapped) a11yOpener = a11yLastOutside;
    a11yTrapped = c;
    if(!c.contains(document.activeElement)){ const f=a11yFocusables(c); if(f.length) f[0].focus(); }
  } else if(!c && a11yTrapped){
    a11yTrapped=null;
    if(a11yOpener && document.contains(a11yOpener)){ try{ a11yOpener.focus(); }catch(err){} }
    a11yOpener=null;
  }
}
document.addEventListener('keydown', ev=>{
  if(ev.key!=='Tab') return;
  const c=a11yActiveOverlay(); if(!c) return;
  const f=a11yFocusables(c); if(!f.length) return;
  const first=f[0], last=f[f.length-1];
  if(!c.contains(document.activeElement)){ ev.preventDefault(); first.focus(); }
  else if(ev.shiftKey && document.activeElement===first){ ev.preventDefault(); last.focus(); }
  else if(!ev.shiftKey && document.activeElement===last){ ev.preventDefault(); first.focus(); }
});

let searchT;
searchInput.addEventListener('input', e=>{ clearTimeout(searchT); const v=e.target.value; searchT=setTimeout(()=>renderGrid(v), 120); });
/* ---------- in-view filter bar (all tables + card grids) ----------
   The only search surface (the old topbar search is gone; hidden #searchInput
   just mirrors the query for the many renderGrid(searchInput.value) callers).
   Filters the current tab: title + body + frontmatter, case-insensitive. */
const filterInput = document.getElementById('filterInput');
function syncFilterBar(filter, n){
  const bar = document.getElementById('filterBar');
  const total = wsEntities().filter(e=> activeType==='All' || e.type===activeType).length;
  bar.style.display = total ? 'flex' : 'none';
  if(!total) return;
  filterInput.placeholder = tr('Filter {what}…').replace('{what}', typeCounted(activeType, total));
  if(document.activeElement !== filterInput) filterInput.value = filter;
  document.getElementById('filterCount').textContent = filter.trim()
    ? trn(n,'{n} match','{n} matches','{n} trafienie','{n} trafienia','{n} trafień') : '';
  document.getElementById('filterClear').style.display = filter.trim() ? '' : 'none';
}
let filterT;
filterInput.addEventListener('input', ()=>{
  clearTimeout(filterT);
  const v = filterInput.value;
  searchInput.value = v; // one source of truth
  filterT = setTimeout(()=> renderGrid(v), 120);
});
filterInput.addEventListener('keydown', ev=>{
  if(ev.key==='Escape'){ ev.stopPropagation(); filterInput.value=''; searchInput.value=''; renderGrid(''); filterInput.blur(); }
});
document.getElementById('filterClear').onclick = ()=>{ filterInput.value=''; searchInput.value=''; renderGrid(''); filterInput.focus(); };
/* the rail's search is a door into that same filter, not a second search:
   from any page it opens All files with the query already in the filter bar.
   ⌘K / Ctrl+K puts the cursor in it from anywhere. */
const sideSearch = document.getElementById('sideSearch');
sideSearch.addEventListener('input', ()=>{
  const v = sideSearch.value;
  searchInput.value = v;
  if(location.hash){   // leave whatever page is open the way a nav tab does, then show All files filtered
    helpExit(); settingsExit(); mindmapExit(); dashboardExit(); backlogExit(); projectsExit(); closeDetail();
    activeType = 'All'; suppressRoute = true; location.hash = '';
    renderTabs(); renderGrid(v); updatePageHead(); return;
  }
  clearTimeout(filterT); filterT = setTimeout(()=> renderGrid(v), 120);
});
sideSearch.addEventListener('keydown', ev=>{ if(ev.key==='Escape'){ sideSearch.value=''; searchInput.value=''; renderGrid(''); sideSearch.blur(); } });
document.addEventListener('keydown', ev=>{
  if((ev.metaKey || ev.ctrlKey) && !ev.altKey && ev.key.toLowerCase()==='k'){ ev.preventDefault(); sideSearch.focus(); sideSearch.select(); }
});
document.getElementById('viewCardsBtn').onclick = ()=> setView('cards');
document.getElementById('viewListBtn').onclick = ()=> setView('list');
document.getElementById('viewTableBtn').onclick = ()=> setView('table');
document.getElementById('viewMapBtn').onclick = ()=> setView('map');
document.getElementById('viewCompareBtn').onclick = ()=> setView('compare');
document.getElementById('viewAffinityBtn').onclick = ()=> setView('affinity');
document.getElementById('viewHlBtn').onclick = ()=> setView('hl');
function renderIdeaSortBtn(){
  const b = document.getElementById('ideaSortBtn'); if(!b) return;
  b.textContent = IDEA_SORT==='votes' ? '▲ '+tr('Most voted') : 'A–Z';
  b.classList.toggle('active', IDEA_SORT==='votes');
}
document.getElementById('ideaSortBtn').onclick = ()=>{
  IDEA_SORT = IDEA_SORT==='votes' ? 'title' : 'votes';
  store.set('at-idea-sort', IDEA_SORT);
  renderIdeaSortBtn(); renderGrid(searchInput.value);
};
document.getElementById('newIdeaBtn').onclick = openIdeaForm;
document.getElementById('newCreate').onclick = createNewEntity;
document.getElementById('newHypoBtn').onclick = openHypoForm;
document.getElementById('newCompBtn').onclick = openCompForm;
document.getElementById('compCreate').onclick = createCompetitor;
document.getElementById('hypoCreate').onclick = createHypothesis;
document.getElementById('ideaCreate').onclick = createIdea;
/* ✕, Cancel, Esc and a click on the backdrop all mean the same thing on every
   form. A click that lands on the <dialog> itself IS the backdrop — the card
   inside it catches everything else.

   Esc is wired explicitly even though <dialog> closes on it by itself: the
   browser only closes the element, and each form also has state to drop. The
   handler runs while the dialog is still open, and the .close() inside it is a
   no-op once the browser has done its part — so both orders end up the same.

   stopPropagation is the load-bearing part: without it the same keypress
   carries on to the window handler below, which sees a dialog that is already
   closed and walks the detail view back out from under the form. Closing the
   dialog is not the same as dismissing the page behind it. */
for(const [id, close] of [['comp', closeCompForm], ['hypo', closeHypoForm],
                          ['idea', closeIdeaForm], ['new', closeNewForm]]){
  const dlg = document.getElementById(id + 'Modal');
  document.getElementById(id + 'Close').onclick = close;
  document.getElementById(id + 'Cancel').onclick = close;
  dlg.addEventListener('click', ev=>{ if(ev.target === dlg) close(); });
  dlg.addEventListener('keydown', ev=>{ if(ev.key === 'Escape'){ ev.stopPropagation(); close(); } });
}

/* ---------- export everything as .md files in a zip (no dependencies, store-only zip) ---------- */
function crc32(buf){
  if(!crc32.t){ const t=[]; for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c = c&1 ? 0xEDB88320 ^ (c>>>1) : c>>>1; t[n]=c>>>0; } crc32.t=t; }
  let crc = 0 ^ (-1);
  for(let i=0;i<buf.length;i++) crc = (crc>>>8) ^ crc32.t[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}
function makeZip(files){
  const enc = new TextEncoder(); const u16=n=>[n&255,(n>>8)&255]; const u32=n=>[n&255,(n>>8)&255,(n>>16)&255,(n>>24)&255];
  const d = new Date();
  const time = ((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xFFFF;
  const date = (((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xFFFF;
  const parts=[], central=[]; let offset=0;
  for(const f of files){
    const name=enc.encode(f.path), data=enc.encode(f.text), crc=crc32(data);
    const lh = new Uint8Array([0x50,0x4b,3,4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(time), ...u16(date), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)]);
    parts.push(lh,name,data); central.push({name,len:data.length,crc,offset});
    offset += lh.length + name.length + data.length;
  }
  let csize=0;
  for(const c of central){
    const ch = new Uint8Array([0x50,0x4b,1,2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(time), ...u16(date), ...u32(c.crc), ...u32(c.len), ...u32(c.len), ...u16(c.name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(c.offset)]);
    parts.push(ch, c.name); csize += ch.length + c.name.length;
  }
  parts.push(new Uint8Array([0x50,0x4b,5,6, ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length), ...u32(csize), ...u32(offset), ...u16(0)]));
  return new Blob(parts, {type:'application/zip'});
}
document.getElementById('exportBtn').onclick = async ()=>{
  const files = wsEntities().map(e=>({ path: e.file, text: e.md }));
  if(!files.length){ toast(tr('Nothing loaded to export')); return; }
  // the connective tissue — without these the receiver gets a graph with no
  // product context, open questions or sample registry
  let extras = 0;
  if(DIRHANDLE){
    for(const name of ['Product Context.md','Research backlog.md','Participants.md','DEMO.md','README.md']){
      try{ const t = await readRepoFile(name); if(t != null){ files.push({ path: name, text: t }); extras++; } }catch(err){}
    }
  }
  const blob = makeZip(files);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'archetype-talk-graph-' + new Date().toISOString().slice(0,10) + '.zip';
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 5000);
  toast(tr('Exported {n} .md files as a zip ✓').replace('{n}', files.length)
    + (extras ? ' '+tr('(incl. {n} root docs)').replace('{n}', extras) : '')
    + (DIRHANDLE ? '' : ' — '+tr('connect the folder to include Product Context & backlog')));
};

/* ---------- intro tour (mobile-onboarding style) ----------
   Five slides: what this is, and the four things you'll actually do — ending
   on the folder-connection step phrased around the ONE thing users worry
   about: where their files go (answer: nowhere — everything stays local). */
const TOUR_SVG = {
  graph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M7.7 7.5 10.6 16M16.3 7.5 13.4 16M8.4 6h7.2"/></svg>',
  chain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  marker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 11l6-6 4 4-6 6H9v-4z"/><path d="M15 5l4 4"/><path d="M3 21h8"/></svg>',
  vote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/><path d="M4 21h16"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M12 11v6M9 14l3-3 3 3"/></svg>'
};
const TOUR_STEPS = [
  { art:'graph',  kicker:'Welcome to Archetype Talk',
    title:'Your research, one living graph',
    text:'Every interview, insight and idea your team gathers lives as a plain Markdown file in your project. This app is a window onto those files — it runs entirely in your browser, and <b>nothing is ever uploaded anywhere</b>.' },
  { art:'chain',  kicker:'The graph',
    title:'Every claim leads back to its source',
    text:'Evidence → Signals → Personas ↔ Archetypes → Ideas. Click any pill to walk the chain down to the original interview. The little bars show <b>how much real research stands behind a claim</b> — validated beats plausible, always.' },
  { art:'marker', kicker:'Transcripts',
    title:'Search the raw sessions, highlight the gold',
    text:'Full word search inside every transcript. Select any fragment to <b>highlight and tag it</b> (pain, pricing — your call). Highlights are saved into the file itself, so teammates get them with git and the AI treats them as priority evidence.' },
  { art:'vote',   kicker:'Ideas',
    title:'Decide together what to build next',
    text:'Ideas form a request board: every idea must cite research, and <b>each teammate gets one vote</b>. Votes live in the files too — commit &amp; push, and the ranking syncs for the whole team.' },
  { art:'folder', kicker:'One last thing',
    title:'Point it at your project — it all stays on your computer',
    text:'' } // final slide renders its own body + CTA
];
let TOUR_AT = 0;
const tourModal = document.getElementById('tourModal');
function tourFinalHtml(){
  const canFS = !!window.showDirectoryPicker;
  return `
    <p>${tr("You're looking at the built-in <b>example set</b>. To see your team's research — and to save highlights, votes and edits — pick your project's <b>root folder</b> once (the one containing <code>Personas/</code>, <code>Signals/</code>, <code>Transcripts/</code>…).")}</p>
    <p class="tour-privacy">${tr('🔒 The browser will ask for permission first. Your files are read <b>directly from this computer</b> — no upload, no account, no server.')}</p>
    ${canFS
      ? `<div class="tour-cta">
           <button class="btn btn-primary" id="tourConnect">${tr('📂 Choose project folder…')}</button>
           <button class="btn btn-outline" id="tourExplore">${tr('Explore the example set first')}</button>
         </div>`
      : `<p class="tour-privacy">${tr('👁 This browser can browse and search, but saving needs <b>Chrome or Edge</b>. You can still explore the example set, or drop .md files anywhere in the window.')}</p>
         <div class="tour-cta"><button class="btn btn-primary" id="tourExplore">${tr('Browse the example set')}</button></div>`}`;
}
function renderTour(){
  const s = TOUR_STEPS[TOUR_AT];
  const last = TOUR_AT === TOUR_STEPS.length-1;
  document.getElementById('tourBody').innerHTML = `
    <div class="tour-art">${TOUR_SVG[s.art]}</div>
    <div class="tour-kicker">${tr(s.kicker)}</div>
    <h2>${tr(s.title)}</h2>
    ${last ? tourFinalHtml() : `<p>${tr(s.text)}</p>`}`;
  document.getElementById('tourDots').innerHTML =
    TOUR_STEPS.map((_,i)=>`<button class="tour-dot${i===TOUR_AT?' on':''}" data-i="${i}" aria-label="${esc(tr('Step'))} ${i+1}"></button>`).join('');
  document.getElementById('tourBack').style.visibility = TOUR_AT ? 'visible' : 'hidden';
  document.getElementById('tourNext').style.display = last ? 'none' : '';
  document.querySelectorAll('.tour-dot').forEach(d=> d.onclick=()=>{ TOUR_AT=+d.dataset.i; renderTour(); });
  const conn = document.getElementById('tourConnect');
  if(conn) conn.onclick = async ()=>{ if(await loadFromPicker()) tourClose(); };
  const exp = document.getElementById('tourExplore');
  if(exp) exp.onclick = ()=> tourClose();
}
function tourOpen(at){ TOUR_AT = at||0; tourModal.showModal(); renderTour(); }
/* However it closed — button, backdrop, Esc — the tour counts as seen. */
function tourClose(){ tourModal.close(); store.set('at-tour-done','1'); }
tourModal.addEventListener('keydown', ev=>{ if(ev.key==='Escape'){ ev.stopPropagation(); tourClose(); } });
document.getElementById('tourSkip').onclick = ()=> tourClose();
document.getElementById('tourBack').onclick = ()=>{ if(TOUR_AT>0){ TOUR_AT--; renderTour(); } };
document.getElementById('tourNext').onclick = ()=>{ if(TOUR_AT<TOUR_STEPS.length-1){ TOUR_AT++; renderTour(); } };
tourModal.addEventListener('click', ev=>{ if(ev.target===tourModal) tourClose(); });
window.addEventListener('keydown', ev=>{
  if(!tourModal.open) return;
  if(ev.key==='ArrowRight' && TOUR_AT<TOUR_STEPS.length-1){ TOUR_AT++; renderTour(); }
  if(ev.key==='ArrowLeft' && TOUR_AT>0){ TOUR_AT--; renderTour(); }
});
document.getElementById('tourLink').onclick = ()=> tourOpen(0);
document.addEventListener('click', ev=>{ if(ev.target && ev.target.id==='helpTour') tourOpen(0); });
/* First visit used to run this tour automatically. It no longer does: the
   welcome card (13d-welcome.js) now owns first contact, and two onboardings
   in a row is one too many. The tour itself is untouched and still reachable
   by hand from Help ▸ "Take the tour" — flip TOUR_AUTO back to true to have it
   greet people again. */
const TOUR_AUTO = false;
let TOUR_PENDING = store.get('at-tour-done')!=='1';
function tourMaybeOpen(){
  if(!TOUR_AUTO){ TOUR_PENDING = false; return; }
  if(!TOUR_PENDING || store.get('at-tour-done')==='1'){ TOUR_PENDING = false; return; }
  TOUR_PENDING = false; tourOpen(0);
}

// read-only browsers (Safari/Firefox): tell the user why saving is unavailable, once
if(!window.showDirectoryPicker && store.get('ro-dismissed') !== '1'){
  const b = document.getElementById('roBanner');
  if(b){ b.style.display = 'flex';
    document.getElementById('roBannerX').onclick = ()=>{ b.style.display='none'; store.set('ro-dismissed','1'); }; }
}
// mobile nav drawer (≤860px): burger toggles body.nav-open; scrim tap, Esc or
// picking any nav destination closes it
const navBurger = document.getElementById('navBurger');
if(navBurger){
  const setNav = open => {
    document.body.classList.toggle('nav-open', open);
    navBurger.setAttribute('aria-expanded', String(open));
  };
  navBurger.onclick = ()=> setNav(!document.body.classList.contains('nav-open'));
  document.getElementById('navScrim').onclick = ()=> setNav(false);
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && !modalOpen() && document.body.classList.contains('nav-open')) setNav(false);
  });
  document.getElementById('sideNav').addEventListener('click', e=>{
    if(document.body.classList.contains('nav-open') && e.target.closest('.nav-item, .side-foot .btn')) setNav(false);
  });
}

// cursor-tracked card spotlight (CSS reads --mx/--my; hover-only media query gates the effect)
document.addEventListener('mousemove', ev=>{
  const c = ev.target.closest ? ev.target.closest('.card') : null;
  if(!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
  c.style.setProperty('--my', (ev.clientY - r.top) + 'px');
});

rehydrateDrafts();
applyDemoOverlay();
/* Language before the first paint, so a Polish user never sees the shell flash
   English on the way in. */
document.documentElement.lang = LANG;
document.querySelectorAll('.lang-opt').forEach(b=>{
  b.classList.toggle('on', b.dataset.lang===LANG);
  b.onclick = ()=> setLang(b.dataset.lang);
});
applyLangDom();
/* A remembered 'project' workspace with nothing in it is a blank app — the
   state a folder of all-demo files used to leave behind. Open in Demo instead;
   nothing is written, so the moment real files land you're back in yours. */
if(WS==='project' && !Object.values(ENTITIES).some(e=> (e.ws||'project')==='project')) WS='demo';
renderWsMenu();
renderTabs(); renderBacklogCount(); setView(VIEW); route();
/* Where you land: whatever you had open last. A folder the browser still opens
   by itself wins — those are your files, already on screen. If the last thing
   you opened was the Demo, that opens instead, because it is a card on the
   Projects screen like any other. Only when there is nothing to reopen (first
   run, or a permission the browser did not persist) does Projects come up,
   which is where every way in lives. A hash beats all of it: a link to an
   entity opens that entity. */
restoreFolder().then(connected=>{
  if(connected || location.hash){ welcomeSeen(); tourMaybeOpen(); return; }   // your files, or a link to one entity
  if(store.get('at-last')==='demo'){ setWs('demo'); welcomeSeen(); tourMaybeOpen(); return; }  // the Demo was the last thing open
  if(welcomeFirstRun()){ welcomeEnter(); return; }             // never been here: the welcome, once
  if(!PROJECTS_ACTIVE) projectsEnter();                        // nothing to reopen — pick from the list
});
