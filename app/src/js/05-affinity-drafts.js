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

const PROX_X = { indirect: 17, adjacent: 50, direct: 83 };
function renderMap(list){
  const maxM = Math.max(1, ...list.map(competitorMentions));
  let nodes = '';
  list.forEach((c,i)=>{
    const prox = String(c.fm.proximity||'').trim().toLowerCase();
    const m = competitorMentions(c);
    // deterministic jitter so same-cell competitors don't stack
    const x = Math.min(93, Math.max(7, (PROX_X[prox] ?? 50) + ((i*37)%13) - 6));
    const y = Math.min(85, Math.max(12, 82 - 58*(m/maxM) + ((i*23)%11) - 5));
    const r = picFor(c);
    const tile = r && r.src ? `<img src="${esc(r.src)}" alt="" onerror="this.remove()">` : esc(c.title.slice(0,2));
    const proxLabel = prox ? prox : 'proximity not set';
    nodes += `<div class="map-node" role="button" tabindex="0" style="left:${x}%;top:${y}%" data-goto="${c.id}" title="${esc(c.title)} — ${esc(proxLabel)}; brought up by ${m} of ${totalTranscripts()} participants we talked to. Click for details.">
      <div class="map-tile">${tile}</div><div class="cap">${esc(c.title)}</div></div>`;
  });
  // "Us" anchor — top-right: we ARE our own segment (far right) and every
  // participant is our user (top). The fixed reference everything else is
  // measured against; visually distinct (solid ink), not a competitor node.
  const prod = getProduct();
  const usNode = prod ? `<div class="map-node us" style="left:90%;top:11%" title="${esc(prod.name)} — that's us. This is the anchor: our own segment (right) and, by definition, every participant we interviewed is our user (top). Competitors are read relative to this point.">
      <div class="map-tile us">${esc(prod.name.slice(0,2))}</div><div class="cap"><b>${esc(prod.name)}</b> · ${tr('you')}</div></div>` : '';
  grid.innerHTML = `<div class="map-card">
    <div class="map-yaxis">↑ ${tr('Participants who brought them up (distinct transcripts)')}</div>
    <div class="map-plot">
      <div class="vline" style="left:33.3%"></div><div class="vline" style="left:66.6%"></div><div class="hline"></div>
      <div class="map-quad" style="top:0;right:0">${tr('Pulling our users')}</div>
      <div class="map-quad" style="bottom:0;right:0">${tr('Same market, quiet so far')}</div>
      <div class="map-quad" style="top:0;left:0">${tr('Pull from outside')}</div>
      <div class="map-quad" style="bottom:0;left:0">${tr('Periphery')}</div>
      ${usNode}${nodes}
    </div>
    <div class="map-xaxis"><span>${tr('TAM — indirect')}</span><span>${tr('SAM — adjacent')}</span><span>${tr('SOM — direct (our segment)')}</span></div>
    <div class="map-legend" aria-label="${esc(tr('How to read the map'))}">
      <div class="lg-i"><span class="lg-glyph"><span class="map-tile">Aa</span></span>
        <div class="lg-t"><b>${tr('A competitor')}</b><span>${tr('One dot per <code>Competitors/</code> file. Click it to open the profile.')}</span></div></div>
      <div class="lg-i"><span class="lg-glyph"><span class="map-tile us">${prod?esc(prod.name.slice(0,2)):'Us'}</span></span>
        <div class="lg-t"><b>${tr('You — the anchor')}</b><span>${tr('Fixed top right: your segment, your users. Every dot is read relative to this point.')}</span></div></div>
      <div class="lg-i"><span class="lg-glyph"><svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="7" x2="22" y2="7"/><polyline points="17 2 22 7 17 12"/></svg></span>
        <div class="lg-t"><b>${tr('Right = closer to your market')}</b><span>${tr("The researcher's call (<code>proximity:</code>) — TAM indirect · SAM adjacent · SOM direct.")}</span></div></div>
      <div class="lg-i"><span class="lg-glyph"><svg width="14" height="26" viewBox="0 0 14 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="24" x2="7" y2="4"/><polyline points="2 9 7 4 12 9"/></svg></span>
        <div class="lg-t"><b>${tr('Up = heard more often')}</b><span>${tr("Distinct participants who brought them up — never market share. A low dot may just mean you haven't asked.")}</span></div></div>
    </div>
  </div>`;
  grid.querySelectorAll('.map-node[data-goto]').forEach(n=>{
    const go = ()=>{ location.hash = '#'+n.dataset.goto; };
    n.onclick = go;
    n.onkeydown = ev=>{ if(ev.key==='Enter' || ev.key===' '){ ev.preventDefault(); go(); } };
  });
}
