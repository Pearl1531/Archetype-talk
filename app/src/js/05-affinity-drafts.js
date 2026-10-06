/* ---------- Affinity diagram: group Signals into product-specific themes ----------
   Each signal carries `affinity: '<group>'` in frontmatter (AI-generated first run).
   A signal a human placed carries `affinity_lock: true` — the AI must not move it,
   only suggest. When no signal has affinity yet, the app auto-groups by first tag as
   a provisional first run so a fresh user sees something immediately. */
let AFFINITY_EDIT = false;
function signalAffinity(e){ return String(e.fm.affinity||'').trim(); }
function affinityIsProvisional(list){ return !list.some(e=> signalAffinity(e)); }
function affinityGroups(list){
  const provisional = affinityIsProvisional(list);
  const groups = new Map(); // name -> {signals, locked}
  list.forEach(e=>{
    let name = signalAffinity(e);
    if(!name && provisional){ const t = Array.isArray(e.fm.tags)&&e.fm.tags[0]; name = t ? t.replace(/-/g,' ') : 'Ungrouped'; }
    if(!name) name = 'Ungrouped';
    if(!groups.has(name)) groups.set(name, { signals: [], locked: false });
    const g = groups.get(name); g.signals.push(e);
    if(e.fm.affinity_lock===true || String(e.fm.affinity_lock)==='true') g.locked = true;
  });
  return { provisional, groups };
}
function renderAffinity(list){
  const { provisional, groups } = affinityGroups(list);
  if(AFFINITY_EDIT) NEW_AFF_GROUPS.forEach(nm=>{ if(!groups.has(nm)) groups.set(nm, { signals: [], locked: false }); });
  const names = [...groups.keys()].sort((a,b)=> groups.get(b).signals.length - groups.get(a).signals.length);
  const editable = !provisional && !!DIRHANDLE;  // real groups + writable folder
  const cols = names.map(name=>{
    const g = groups.get(name);
    const chips = g.signals.map(e=>{
      const q = (firstQuote(e.body)||'').replace(/^["“”']+|["“”']+$/g,'');
      const move = AFFINITY_EDIT ? `<select class="aff-move" data-id="${e.id}" title="${esc(tr('Move to another group'))}">${names.map(nn=>`<option${nn===name?' selected':''}>${esc(nn)}</option>`).join('')}<option value="__new__">＋ ${tr('New group…')}</option></select>` : '';
      const lockMark = (e.fm.affinity_lock===true||String(e.fm.affinity_lock)==='true') ? `<span class="aff-lock" title="${esc(tr('Manually placed, AI leaves it put'))}">🔒</span>` : '';
      return `<div class="aff-chip" ${AFFINITY_EDIT?'':`data-goto="${e.id}" role="button" tabindex="0"`}>
        <div class="aff-chip-t">${esc(e.title)}${lockMark}</div>
        ${q?`<div class="aff-chip-q">${esc(trim(q,80))}</div>`:''}
        ${move}</div>`;
    }).join('');
    const head = AFFINITY_EDIT
      ? `<input class="aff-name-in" data-group="${esc(name)}" value="${esc(name)}" aria-label="Group name">`
      : `<span class="aff-name">${esc(name)}</span>`;
    return `<section class="aff-col${g.locked?' locked':''}" data-group="${esc(name)}">
      <div class="aff-head">${head}<span class="aff-count">${g.signals.length}</span>${g.locked?`<span class="aff-badge" title="${esc(tr('Contains manually-curated signals — AI suggests, never rewrites'))}">${tr('curated')}</span>`:''}</div>
      <div class="aff-body">${chips}</div>
    </section>`;
  }).join('');
  grid.innerHTML = `<div class="aff-wrap">
    <div class="aff-bar">
      <div class="aff-lead">${provisional
        ? tr('<b>Provisional grouping</b> — auto-grouped by tag. Run <code>/affinity</code> in your AI assistant for meaningful thematic groups, or curate them here.')
        : `<b>${names.length} affinity groups</b> · ${list.length} signals. ${editable?'Toggle Edit to rename, move, lock.':'Connect the folder (Chrome/Edge) to edit.'}`}</div>
      ${editable ? `<button class="btn btn-outline btn-sm${AFFINITY_EDIT?' active':''}" id="affEdit">${AFFINITY_EDIT?'Done editing':'Edit groups'}</button>` : ''}
      ${AFFINITY_EDIT ? '<button class="btn btn-ghost btn-sm" id="affAdd">＋ Add group</button>' : ''}
    </div>
    <div class="aff-board">${cols}</div>
    <div class="aff-guide">${tr("Groups are product-specific themes. The first grouping is AI-generated; anything you touch here gets a 🔒 <b>curated</b> flag, and the AI will then only <i>suggest</i> changes to it — never rewrite it. Membership lives in each signal's <code>affinity:</code> frontmatter.")}</div>
  </div>`;
  // navigation (read mode)
  grid.querySelectorAll('.aff-chip[data-goto]').forEach(n=>{
    const go = ()=>{ location.hash = '#'+n.dataset.goto; };
    n.onclick = go; n.onkeydown = ev=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); go(); } };
  });
  // edit handlers
  const eb = grid.querySelector('#affEdit'); if(eb) eb.onclick = ()=>{ AFFINITY_EDIT = !AFFINITY_EDIT; renderAffinity(filteredList(searchInput.value)); };
  const ab = grid.querySelector('#affAdd'); if(ab) ab.onclick = ()=>{ const nm = prompt('New group name:'); if(nm && nm.trim()){ NEW_AFF_GROUPS.add(nm.trim()); renderAffinity(filteredList(searchInput.value)); } };
  grid.querySelectorAll('.aff-move').forEach(sel=> sel.onchange = async ()=>{
    const e = ENTITIES[sel.dataset.id]; if(!e) return;
    let target = sel.value;
    if(target==='__new__'){ target = (prompt('New group name:')||'').trim(); if(!target){ renderAffinity(filteredList(searchInput.value)); return; } }
    await setSignalAffinity(e, target, true);
  });
  grid.querySelectorAll('.aff-name-in').forEach(inp=>{
    inp.onkeydown = ev=>{ if(ev.key==='Enter'){ inp.blur(); } };
    inp.onblur = async ()=>{
      const oldName = inp.dataset.group, newName = inp.value.trim();
      if(!newName || newName===oldName) return;
      await renameAffinityGroup(oldName, newName);
    };
  });
}
let NEW_AFF_GROUPS = new Set(); // groups added in edit mode that have no members yet
async function setSignalAffinity(e, group, lock){
  const md = setFmField(setFmField(e.md, 'affinity', "'"+group.replace(/'/g,'')+"'"), 'affinity_lock', lock?'true':null);
  NEW_AFF_GROUPS.delete(group);
  const w = await ensureWritable(e); if(!w) return; e = w;
  if(await saveEntityText(e, md)){ renderAffinity(filteredList(searchInput.value)); toast(tr('Moved to “{group}” — locked (AI leaves it put) ✓').replace('{group}', group), {label:tr('Undo'), fn: undoLastSave}); }
}
async function renameAffinityGroup(oldName, newName){
  const members = wsEntities().filter(e=> e.type==='Signal' && signalAffinity(e)===oldName);
  if(!members.length){ if(NEW_AFF_GROUPS.has(oldName)){ NEW_AFF_GROUPS.delete(oldName); NEW_AFF_GROUPS.add(newName); } renderAffinity(filteredList(searchInput.value)); return; }
  if(!DIRHANDLE){ toast(tr('Connect the folder (Chrome/Edge) to rename')); return; }
  let ok=0;
  for(const e of members){
    const md = setFmField(setFmField(e.md,'affinity',"'"+newName.replace(/'/g,'')+"'"),'affinity_lock','true');
    if(await saveEntityText(e, md, {noUndo:true, skipDriftCheck:true})) ok++;
  }
  renderAffinity(filteredList(searchInput.value));
  toast(`Renamed to “${newName}” (${ok} signals, curated) ✓`);
}

/* ---------- New idea — manual creation, grounding ENFORCED ----------
   An idea cannot be saved without ≥1 linked Signal/Evidence (the repo's hard
   rule, made unskippable in the UI). Selected sources can be paired into named
   "tandems" — signal+evidence meant to be read together. */
let IDEA = null; // {when,want,sothat, sel:[{id,tandem}], tLabels:{tid:label}, nextT}
function encPath(name){ return name.replace(/ /g,'%20').replace(/'/g,'%27'); }
function ideaLink(e){ const p=e.file.split('/'); return '../'+p.slice(0,-1).join('/')+'/'+encPath(p.at(-1)); }
async function getFileHandleFor(path, create){
  let dir = DIRHANDLE; const parts = path.split('/');
  for(const part of parts.slice(0,-1)) dir = await dir.getDirectoryHandle(part, {create:!!create});
  return dir.getFileHandle(parts.at(-1), {create:!!create});
}
/* ---------- local drafts ----------
   Ideas created with no folder connected live in localStorage (namespaced per
   project copy) as full .md text — same format as a real file, just not on
   disk yet. They are editable, votable and exported with the zip; connecting
   the folder offers to write them into Ideas/ for real. Offline, no deps. */
function loadDraftsMap(){ // values: {md, ws}; legacy plain strings = project drafts
  try{
    const m = JSON.parse(store.get('at-drafts')||'{}');
    for(const k of Object.keys(m)) if(typeof m[k]==='string') m[k] = { md: m[k], ws: 'project' };
    return m;
  }catch(e){ return {}; }
}
function saveDraftsMap(m){ store.set('at-drafts', JSON.stringify(m)); }
function persistDraft(file, md, ws){ const m=loadDraftsMap(); m[file]={ md, ws: ws||'project' }; saveDraftsMap(m); }
function dropDraft(file){ const m=loadDraftsMap(); delete m[file]; saveDraftsMap(m); }
function addDraftEntity(md, file){
  const e = parseEntity(md, file); if(!e) return null;
  e.id = idFor(file); e.draft = true; e.ws = WS;
  ENTITIES[e.id] = e; reindex(); persistDraft(file, md, WS);
  return e;
}
/* ---------- demo sandbox + the write-through guarantee ----------
   Embedded demo entities have no file on disk, so their edits (highlights,
   votes, exclusions, editor) land in a localStorage OVERLAY — a per-browser
   sandbox, resettable from the workspace menu. PROJECT entities are the
   opposite: their edits must ALWAYS reach the real .md — if no folder is
   connected, ensureWritable() opens the root picker right then and retries. */
function loadDemoOverlay(){ try{ return JSON.parse(store.get('at-demo-overlay')||'{}'); }catch(e){ return {}; } }
function saveDemoOverlay(m){ store.set('at-demo-overlay', JSON.stringify(m)); }
function isSandbox(e){ return e.ws==='demo' && !e.handle && !e.draft; }
function canEdit(e){ return !!(e.handle || e.draft || isSandbox(e)); }
function applyDemoOverlay(){
  let n=0;
  for(const [file, md] of Object.entries(loadDemoOverlay())){
    const id = idFor(file); const cur = ENTITIES[id];
    if(!cur || cur.handle || cur.draft) continue;   // a real disk file always wins
    const e = parseEntity(md, file); if(!e) continue;
    e.id=id; e.ws='demo'; e.sandbox=true; ENTITIES[id]=e; n++;
  }
  if(n) reindex();
  return n;
}
async function ensureWritable(e){
  if(!e) return null;
  if(canEdit(e)) return e;
  if(!window.showDirectoryPicker){ toast(tr('Saving needs Chrome or Edge (File System Access API)')); return null; }
  toast(tr('Pick your project’s root folder to save this change…'));
  if(!(await loadFromPicker())) return null;
  const fresh = ENTITIES[e.id];
  if(fresh && fresh.handle) return fresh;
  toast(tr('That folder doesn’t contain {file} — nothing was saved').replace('{file}', e.file));
  return null;
}
function resetDemoSandbox(){
  const files = Object.keys(loadDemoOverlay());
  const hadBacklog = !!store.get('at-backlog-demo');
  if(!files.length && !hadBacklog) return;
  store.del('at-demo-overlay');
  store.del('at-backlog-demo');   // the demo Research backlog is a sandbox too
  files.forEach(f=>{
    const id = idFor(f); const cur = ENTITIES[id];
    if(cur && !cur.handle && !cur.draft){
      if(EMBEDDED_DEMO[id]) ENTITIES[id] = EMBEDDED_DEMO[id]; else delete ENTITIES[id];
    }
  });
  reindex(); renderWsMenu(); renderTabs(); renderBacklogCount();
  if(BACKLOG_ACTIVE) renderBacklog(); else renderGrid(searchInput.value);
  if(detailView.classList.contains('active') && CURRENT && ENTITIES[CURRENT]) openDetail(CURRENT);
  toast(tr('Demo restored to factory state ✓'));
}
/* re-add stored drafts into ENTITIES (after the embedded seed or a folder
   load wiped them). A real disk file with the same name always wins. */
function rehydrateDrafts(){
  let shown = 0;
  for(const [file, d] of Object.entries(loadDraftsMap())){
    const id = idFor(file);
    if(ENTITIES[id] && !ENTITIES[id].draft) continue;
    const e = parseEntity(d.md, file); if(!e) continue;
    e.id = id; e.draft = true; e.ws = d.ws || 'project'; ENTITIES[id] = e; shown++;
  }
  if(shown) reindex();
  return shown;
}
async function writeDraftsToFolder(){
  const m = loadDraftsMap();
  const files = Object.keys(m).filter(f=> (m[f].ws||'project')==='project'); // demo-space drafts stay local sandboxes
  if(!files.length || !DIRHANDLE) return;
  let ok = 0; const skipped = [];
  for(const file of files){
    const id = idFor(file);
    if(ENTITIES[id] && !ENTITIES[id].draft){ skipped.push(file+' (a file with that name already exists)'); continue; }
    try{
      await writeRepoFile(file, m[file].md);
      const fh = await getFileHandleFor(file);
      const e = parseEntity(m[file].md, file); e.id = id; e.handle = fh; e.ws = 'project';
      ENTITIES[id] = e; dropDraft(file); ok++;
    }catch(err){ skipped.push(file+' ('+err.message+')'); }
  }
  reindex(); renderTabs(); renderGrid(searchInput.value);
  toast(`Saved ${ok} draft${ok===1?'':'s'} into your project ✓${skipped.length? ' — skipped '+skipped.join('; '):''}`);
}
async function openIdeaForm(){
  IDEA = { name:'', when:'', want:'', sothat:'', sel:[], tLabels:{}, nextT:1 };
  document.getElementById('ideaModal').showModal();
  document.getElementById('ideaBody').innerHTML = `
    <div class="idea-field"><label>${tr('Idea name')}</label><input id="ifName" placeholder="${esc(tr('e.g. One-tap focus mode'))}" autocomplete="off"></div>
    <div class="idea-field"><label>${tr('When')}</label><textarea id="ifWhen" placeholder="${esc(tr("the user's situation / context"))}"></textarea></div>
    <div class="idea-field"><label>${tr('I want')}</label><textarea id="ifWant" placeholder="${esc(tr('the capability or action'))}"></textarea></div>
    <div class="idea-field"><label>${tr('So that')}</label><textarea id="ifSothat" placeholder="${esc(tr('the goal / benefit'))}"></textarea></div>
    <div class="idea-field">
      <label>${tr('Grounding — pick Signals & Evidence (at least one, required)')}</label>
      <div class="idea-pick">
        <input class="idea-pick-search" id="ifSearch" placeholder="${esc(tr('Filter signals & evidence…'))}" autocomplete="off">
        <div class="idea-pick-list" id="ifList"></div>
      </div>
      <div class="idea-selected" id="ifSelected"></div>
      <div class="idea-hint">${tr('Tick sources above. Pair a Signal with an Evidence into a <b>tandem</b> (same group + a label) when they only make the case together.')}</div>
    </div>
    ${DIRHANDLE ? '' : `<div class="idea-draft-note">📝 ${tr('No folder connected — this idea will be kept as a <b>local draft in this browser</b> (editable, votable, included in Export .md). Connect your project folder anytime to save drafts as real files.')}</div>`}`;
  const bind = (id,key)=>{ const el=document.getElementById(id); el.oninput=()=>{ IDEA[key]=el.value; validateIdea(); }; };
  bind('ifName','name'); bind('ifWhen','when'); bind('ifWant','want'); bind('ifSothat','sothat');
  document.getElementById('ifSearch').oninput = ()=> renderIdeaPickList(document.getElementById('ifSearch').value);
  renderIdeaPickList(''); renderIdeaSelected(); validateIdea();
  document.getElementById('ifName').focus();
}
function renderIdeaPickList(filter){
  const f = filter.trim().toLowerCase();
  const items = wsEntities().filter(e=> (e.type==='Signal'||e.type==='Evidence') && (!f || e.title.toLowerCase().includes(f)))
    .sort((a,b)=> a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
  document.getElementById('ifList').innerHTML = items.map(e=>{
    const on = IDEA.sel.some(s=>s.id===e.id);
    return `<label class="idea-opt"><input type="checkbox" data-id="${e.id}" ${on?'checked':''}><span class="t">${ICONS[e.type]}${e.meta.singular}</span> ${esc(e.title)}</label>`;
  }).join('') || `<div style="padding:10px 12px;color:var(--text-dim);font-size: 14px">${tr('No match.')}</div>`;
  document.getElementById('ifList').querySelectorAll('input[data-id]').forEach(cb=> cb.onchange=()=>{
    const id = cb.dataset.id;
    if(cb.checked){ if(!IDEA.sel.some(s=>s.id===id)) IDEA.sel.push({id, tandem:0}); }
    else IDEA.sel = IDEA.sel.filter(s=>s.id!==id);
    renderIdeaSelected(); validateIdea();
  });
}
function renderIdeaSelected(){
  const host = document.getElementById('ifSelected');
  if(!IDEA.sel.length){ host.innerHTML = ''; return; }
  const tandems = [...new Set(IDEA.sel.map(s=>s.tandem).filter(t=>t))];
  const opts = [`<option value="0">— ${tr('no tandem')} —</option>`, ...tandems.map(t=>`<option value="${t}">${tr('Tandem')} ${t}</option>`), `<option value="__new__">＋ ${tr('new tandem')}</option>`];
  host.innerHTML = IDEA.sel.map(s=>{
    const e = ENTITIES[s.id]; if(!e) return '';
    return `<div class="idea-sel"><span class="ty">${e.meta.singular}</span><span class="nm">${esc(e.title)}</span>
      <select data-id="${s.id}">${opts.map(o=>o.replace(`value="${s.tandem}"`, `value="${s.tandem}" selected`)).join('')}</select>
      <button class="rm" data-rm="${s.id}" title="Remove" aria-label="Remove ${esc(e.title)}">✕</button></div>`;
  }).join('');
  // tandem label inputs (one per tandem with ≥2 members)
  const counts = {}; IDEA.sel.forEach(s=>{ if(s.tandem) counts[s.tandem]=(counts[s.tandem]||0)+1; });
  Object.keys(counts).filter(t=>counts[t]>=2).forEach(t=>{
    const wrap = document.createElement('div'); wrap.className='idea-tandem-label';
    wrap.innerHTML = `<input placeholder="${esc(tr('Tandem {n} label — why these belong together').replace('{n}', t))}" value="${esc(IDEA.tLabels[t]||'')}" data-tlabel="${t}">`;
    host.appendChild(wrap);
  });
  host.querySelectorAll('select[data-id]').forEach(sel=> sel.onchange=()=>{
    const s = IDEA.sel.find(x=>x.id===sel.dataset.id);
    if(sel.value==='__new__'){ s.tandem = IDEA.nextT++; } else s.tandem = parseInt(sel.value,10)||0;
    renderIdeaSelected(); validateIdea();
  });
  host.querySelectorAll('button[data-rm]').forEach(b=> b.onclick=()=>{ IDEA.sel = IDEA.sel.filter(s=>s.id!==b.dataset.rm); renderIdeaPickList(document.getElementById('ifSearch').value); renderIdeaSelected(); validateIdea(); });
  host.querySelectorAll('input[data-tlabel]').forEach(inp=> inp.oninput=()=>{ IDEA.tLabels[inp.dataset.tlabel]=inp.value; });
}
function validateIdea(){
  const msg = document.getElementById('ideaValid'), btn = document.getElementById('ideaCreate');
  let err = '';
  if(!IDEA.name.trim()) err = 'Name required.';
  else if(!IDEA.sel.length) err = 'Link at least one Signal or Evidence — grounding is required.';
  msg.textContent = err; btn.disabled = !!err;
  return !err;
}
function ideaMarkdown(){
  const name = IDEA.name.trim();
  const linkFor = id => { const e=ENTITIES[id]; return `- [${e.title}](${ideaLink(e)})`; };
  const tandems = {}; const solo = [];
  IDEA.sel.forEach(s=>{ if(s.tandem){ (tandems[s.tandem]=tandems[s.tandem]||[]).push(s.id); } else solo.push(s.id); });
  let ground = '';
  Object.keys(tandems).forEach(t=>{
    const ids = tandems[t];
    if(ids.length>=2){ ground += `**Tandem — ${(IDEA.tLabels[t]||'read together').trim()}:**\n` + ids.map(linkFor).join('\n') + '\n\n'; }
    else solo.push(ids[0]); // a tandem of one is just standalone
  });
  if(solo.length) ground += solo.map(linkFor).join('\n') + '\n';
  return `---
type: 'IdeaForImprovement'
title: 'Idea: ${name.replace(/'/g,'')}'
tags: []
---

# Idea: ${name}

- **When:** ${IDEA.when.trim()},

- **I want:** ${IDEA.want.trim()},

- **So that:** ${IDEA.sothat.trim()}.

## Evidence + Signal

${ground.trim()}
`;
}
async function createIdea(){
  if(!validateIdea()) return;
  const safe = IDEA.name.trim().replace(/[\/\\:*?"<>|]/g,'').trim();
  if(!safe){ toast(tr('Give the idea a filename-safe name')); return; }
  const file = 'Ideas/'+safe+'.md';
  if(ENTITIES[idFor(file)]){ toast(tr('An idea with that name already exists')); return; }
  const md = ideaMarkdown();
  if(DIRHANDLE){
    try{
      await writeRepoFile(file, md);
      const fh = await getFileHandleFor(file);
      const e = parseEntity(md, file); e.id = idFor(file); e.handle = fh; e.ws = 'project';
      ENTITIES[e.id] = e; reindex();
    }catch(err){ toast(tr('Save failed: ')+err.message); return; }
  } else {
    if(!addDraftEntity(md, file)){ toast(tr('Could not create the draft')); return; }
  }
  const nSel = IDEA.sel.length;
  const promoted = PROMOTE_FROM; PROMOTE_FROM = null;
  closeIdeaForm();
  renderTabs();
  location.hash = '#'+idFor(file);
  toast(DIRHANDLE
    ? 'Idea created — grounded in '+nSel+' source'+(nSel===1?'':'s')+' ✓'
    : 'Draft saved in this browser — grounded in '+nSel+' source'+(nSel===1?'':'s')+' ✓ Connect your folder to make it a real file.');
  if(promoted) await markHypothesisPromoted(promoted, ENTITIES[idFor(file)]);
}
function closeIdeaForm(){ document.getElementById('ideaModal').close(); IDEA=null; PROMOTE_FROM=null; }

/* The market map — proximity × research mentions (Competitors/README.md).
   Honest by construction: the vertical scale runs from 0 to every participant
   you heard (distinctParticipants), so a dot's height IS "brought up by m of
   N" — not a share of the loudest competitor — and a dot on the zero line is
   a research gap, drawn hollow. You sit at the top right: your segment, every
   participant is your user. A column's dots spread side by side (loudest
   first) with their names beside them, flipped left near the right edge, so
   nothing stacks. A click opens a side panel (who brought it up, in their
   words, the way to the profile) instead of leaving the map; "Mentioned by"
   lights only what one persona's participants named. Dragging a dot sideways
   moves it to another market column — the researcher's call, so it asks first,
   writes proximity: into the file (keeping the reasoning comment beside it)
   and offers Undo. Phones get a list. */
const MAP_BANDS = [['indirect', 'TAM — indirect'], ['adjacent', 'SAM — adjacent'], ['direct', 'SOM — direct (our segment)']];
let MAP_SEL = null, MAP_PERSONA = null, MAP_LIST = [];
const mapIdsOf = names => new Set([].concat(names||[]).map(t=> byBasename[String(t).replace(/\.md$/i,'').toLowerCase()]).filter(id=> ENTITIES[id] && ENTITIES[id].type==='Transcript' && !isExcluded(ENTITIES[id])));
function personaTranscriptIds(p){   // a persona's own transcripts: linked directly or through its Signals
  const ids = new Set(), add = (body, deep)=>{
    for(const m of body.matchAll(MD_LINK)){
      if(/^https?:/.test(m[2])) continue;
      const x = ENTITIES[resolveRef(m[2])]; if(!x) continue;
      if(x.type==='Transcript') ids.add(x.id); else if(deep && x.type==='Signal') add(x.body, false);
    }
  };
  add(p.body, true); return ids;
}
async function mapMoveProximity(c, prox){
  const cur = String(c.fm.proximity||'').trim().toLowerCase();
  if(prox === cur){ renderMap(MAP_LIST); return; }
  const name = k=> tr((MAP_BANDS.find(b=> b[0]===k) || [, 'Proximity not set'])[1]);
  ppDialog({
    title: tr('Move {name}?').replace('{name}', c.title),
    body: `<p>${esc(tr('From {a} to {b}. How close a competitor is to your market is your call as the researcher — it is written into the file as proximity: {v}.').replace('{a}', name(cur)).replace('{b}', name(prox)).replace('{v}', prox))}</p>`,
    ok: tr('Move'), check: ()=> '',
    run: async ()=>{
      const w = await ensureWritable(c); if(!w) return;
      const why = (w.md.match(/^proximity:[^#\n]*(#.*)$/m) || [])[1];   // the researcher's one-line reasoning stays
      if(await saveEntityText(w, setFmField(w.md, 'proximity', prox + (why ? '   ' + why : ''))))
        toast(tr('Moved to {b} ✓').replace('{b}', name(prox)), { label: tr('Undo'), fn: undoLastSave }, 8000, c.title);
    },
  });
  document.getElementById('ppModal').addEventListener('close', ()=> renderMap(MAP_LIST), { once: true });   // cancelled: the dot goes back
}
function mapSide(c, N){
  const m = competitorMentions(c), prox = PROX_LABEL[String(c.fm.proximity||'').trim().toLowerCase()];
  const ts = [...mapIdsOf(c.fm.mentioned_in)].map(id=> ENTITIES[id]);
  const said = wsEntities().filter(e=> e.type==='Signal' && [].concat(e.fm.competitors||[]).includes(c.title)).slice(0, 3);
  const r = picFor(c), tile = r && r.src ? `<img src="${esc(r.src)}" alt="" onerror="this.remove()">` : esc(c.title.slice(0,2));
  return `<aside class="map-side" aria-label="${esc(c.title)}">
      <div class="map-side-head"><span class="map-tile">${tile}</span><div><b>${esc(c.title)}</b>${prox ? `<span class="map-prox" title="${esc(prox[1])}">${esc(prox[0])}</span>` : `<span class="map-prox off">${tr('Proximity not set')}</span>`}</div>
        <button type="button" class="map-side-x" aria-label="${esc(tr('Close'))}">✕</button></div>
      ${compIntro(c) ? `<p class="map-side-intro">${esc(compIntro(c))}</p>` : ''}
      <div class="map-side-sec"><span class="dx-fl">${tr('Who brought it up')}</span>
        <b class="map-side-n">${m ? esc(tr('{m} of {T} participants').replace('{m}', m).replace('{T}', N)) : tr('Nobody yet — maybe nobody asked')}</b>
        ${ts.length ? `<div class="map-side-links">${ts.map(t=> `<a class="xref" data-goto="${esc(t.id)}">${esc(t.title)}</a>`).join('')}</div>` : ''}</div>
      ${said.length ? `<div class="map-side-sec"><span class="dx-fl">${tr('In their words')}</span>${said.map(sg=> `<a class="map-side-q" data-goto="${esc(sg.id)}">“${esc(trim((firstQuote(sg.body)||sg.title).replace(/^["“]|["”]$/g,''), 140))}”</a>`).join('')}</div>` : ''}
      <button type="button" class="dx-btn dx-btn-line dx-btn-sm" data-goto="${esc(c.id)}">${tr('Open profile')} →</button>
    </aside>`;
}
function renderMap(list){
  MAP_LIST = list;
  if(MAP_SEL && !list.some(c=> c.id===MAP_SEL)) MAP_SEL = null;
  const N = Math.max(1, distinctParticipants(), ...list.map(competitorMentions));
  const Y = m => 86 - m / N * 74;                         // % from the top: 0 at 86%, everyone at 12%
  const band = c => Math.max(0, MAP_BANDS.findIndex(b=> b[0]===String(c.fm.proximity||'').trim().toLowerCase()));   // unset → the middle column
  const personas = wsEntities().filter(e=> e.type==='Persona');
  const lit = MAP_PERSONA && ENTITIES[MAP_PERSONA] ? personaTranscriptIds(ENTITIES[MAP_PERSONA]) : null;
  const groups = [[], [], []];
  list.forEach(c=> groups[band(c)].push(c));
  let nodes = '';
  groups.forEach(g=> g.sort((a,b)=> competitorMentions(b) - competitorMentions(a) || a.title.localeCompare(b.title)).forEach((c, k)=>{
    const m = competitorMentions(c), b = band(c), set = String(c.fm.proximity||'').trim();
    const x = b*33.33 + (k+1) * 33.33 / (g.length+1);
    const hit = !lit || [...mapIdsOf(c.fm.mentioned_in)].some(id=> lit.has(id));
    const r = picFor(c), tile = r && r.src ? `<img src="${esc(r.src)}" alt="" onerror="this.remove()">` : esc(c.title.slice(0,2));
    nodes += `<button type="button" class="map-node${m ? '' : ' zero'}${hit ? '' : ' dim'}${MAP_SEL===c.id ? ' sel' : ''}${x > 78 ? ' flip' : ''}" style="left:${x.toFixed(2)}%;top:${Y(m).toFixed(2)}%" data-c="${esc(c.id)}"
        aria-label="${esc(c.title)} — ${esc(m ? tr('{m} of {T} participants').replace('{m}', m).replace('{T}', N) : tr('Nobody yet — maybe nobody asked'))}${set ? '' : ' · '+esc(tr('Proximity not set'))}">
        <span class="map-tile">${tile}${m ? `<b class="map-n">${m}</b>` : ''}</span><span class="cap">${esc(c.title)}</span></button>`;
  }));
  const prod = getProduct();
  const us = prod ? `<div class="map-node us" style="left:95%;top:${Y(N).toFixed(2)}%" title="${esc(prod.name)} — ${esc(tr('you'))}"><span class="map-tile us">${esc(prod.name.slice(0,2))}</span><span class="cap">${tr('you')}</span></div>` : '';
  const step = N <= 6 ? 1 : Math.ceil(N / 5);
  let ticks = '';
  for(let v = 0; v <= N; v += step) ticks += `<i class="map-tick" style="top:${Y(v).toFixed(2)}%"><span>${v}</span></i>`;
  const sel = MAP_SEL && ENTITIES[MAP_SEL];
  const rows = MAP_BANDS.slice().reverse().map(([key, label], bi)=>{
    const cs = list.filter(c=> band(c)===2-bi).sort((a,b)=> competitorMentions(b)-competitorMentions(a));
    return cs.length ? `<div class="map-list-band"><span class="dx-fl">${tr(label)}</span>${cs.map(c=> `<a class="map-list-row" data-goto="${esc(c.id)}"><b>${esc(c.title)}</b><span>${competitorMentions(c) ? esc(tr('{m} of {T} participants').replace('{m}', competitorMentions(c)).replace('{T}', N)) : tr('Nobody yet — maybe nobody asked')}</span></a>`).join('')}</div>` : '';
  }).join('');
  grid.innerHTML = `<div class="map-card">
    <div class="map-bar">
      <div class="map-filter" role="group" aria-label="${esc(tr('Mentioned by'))}"><span class="dx-fl">${tr('Mentioned by')}</span>
        <button type="button" class="map-chip${MAP_PERSONA ? '' : ' on'}" data-p="">${tr('Everyone')}</button>
        ${personas.map(p=> `<button type="button" class="map-chip${MAP_PERSONA===p.id ? ' on' : ''}" data-p="${esc(p.id)}">${faceHtml(p, 'dx-face-xs')}${esc(p.title.split(/\s+[—–-]\s+/)[0])}</button>`).join('')}</div>
      <span class="dx-fl map-how">${tr('How to read the map')}${dxTip(tr('How to read the map'), esc(tr("Right = closer to your market — the researcher's call (proximity:): TAM indirect · SAM adjacent · SOM direct. Up = how many of your {T} participants brought it up themselves — never market share; a hollow dot on the zero line may only mean nobody asked. You sit top right: your segment, and every participant is your user.").replace('{T}', N)), 'right')}</span>
    </div>
    <div class="map-body${sel ? ' has-side' : ''}">
      <div class="map-main">
        <div class="map-plot">
          <i class="map-band" style="left:33.33%"></i><i class="map-band" style="left:66.66%"></i>
          ${ticks}${us}${nodes}
        </div>
        <div class="map-xaxis">${MAP_BANDS.map(b=> `<span>${tr(b[1])}</span>`).join('')}</div>
      </div>
      ${sel ? mapSide(sel, N) : ''}
    </div>
    <div class="map-list">${rows}</div>
  </div>`;
  const card = grid.querySelector('.map-card');
  const again = ()=> renderMap(MAP_LIST);
  card.querySelectorAll('.map-node[data-c]').forEach(n=> n.onclick = ()=>{ MAP_SEL = MAP_SEL===n.dataset.c ? null : n.dataset.c; again(); grid.querySelector(`.map-node[data-c="${CSS.escape(n.dataset.c)}"]`)?.focus(); });
  card.querySelectorAll('.map-chip').forEach(b=> b.onclick = ()=>{ MAP_PERSONA = b.dataset.p || null; again(); });
  card.querySelectorAll('[data-goto]').forEach(a=> a.onclick = ()=>{ location.hash = '#'+a.dataset.goto; });
  const x = card.querySelector('.map-side-x'); if(x) x.onclick = ()=>{ MAP_SEL = null; again(); };
  // drag a dot sideways (mouse or pen) to move it to another market column; a drag is not a click
  const plot = card.querySelector('.map-plot');
  card.querySelectorAll('.map-node[data-c]').forEach(n=> n.onpointerdown = ev=>{
    if(ev.button !== 0 || ev.pointerType === 'touch') return;
    const r = plot.getBoundingClientRect(), x0 = ev.clientX, left0 = parseFloat(n.style.left);
    const bandAt = cx => Math.max(0, Math.min(2, Math.floor((cx - r.left) / r.width * 3)));
    let moved = false;
    const move = e2=>{
      if(!moved && Math.abs(e2.clientX - x0) < 6) return;
      if(!moved){ moved = true; n.classList.add('drag'); }
      n.style.left = Math.max(0, Math.min(100, left0 + (e2.clientX - x0) / r.width * 100)) + '%';
      plot.dataset.band = bandAt(e2.clientX);
    };
    const up = e2=>{
      removeEventListener('pointermove', move); removeEventListener('pointerup', up);
      if(!moved) return;
      n.addEventListener('click', e3=> e3.stopImmediatePropagation(), { capture: true, once: true });
      delete plot.dataset.band;
      mapMoveProximity(ENTITIES[n.dataset.c], MAP_BANDS[bandAt(e2.clientX)][0]);
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);   // on the window: a fast drag leaves the dot behind
  });
  card.onkeydown = ev=>{ if(ev.key==='Escape' && MAP_SEL){ ev.stopPropagation(); MAP_SEL = null; again(); } };
}
