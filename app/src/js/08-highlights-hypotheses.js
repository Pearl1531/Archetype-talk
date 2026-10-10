/* ---------- Transcript highlights + tags (Dovetail-style) ----------
   A highlight is ==fragment=={tag1, tag2} inline in the transcript .md —
   researcher-curated emphasis the AI reads as prioritized evidence. The app
   only ever wraps EXISTING verbatim text (quotes are data — never altered).
   Distinct tags per file are mirrored into `highlight_tags:` frontmatter so
   triage (header → grep → read) can find tagged files without reading them. */
function entityHighlights(e){
  const out=[]; let m; const re=new RegExp(HL_RE.source,'g');
  while((m=re.exec(e.body))) out.push({ text:m[1], tags:hlTagsParse(m[2]) });
  return out;
}
function syncHighlightTagsFm(md, body){
  const tags=new Set(); let m; const re=new RegExp(HL_RE.source,'g');
  while((m=re.exec(body))) hlTagsParse(m[2]).forEach(t=>tags.add(t));
  return setFmField(md, 'highlight_tags', tags.size? '['+[...tags].join(', ')+']' : null);
}
function withNewBody(e, newBody){ // splice a rewritten body back into the raw .md + resync the tag mirror
  const i = e.md.indexOf(e.body);
  return i===-1 ? null : syncHighlightTagsFm(e.md.slice(0,i) + newBody + e.md.slice(i+e.body.length), newBody);
}
function replaceNthHl(body, n, fn){ // fn(text, tags[]) -> replacement markdown for the nth highlight
  let i=-1;
  return body.replace(new RegExp(HL_RE.source,'g'), (m,txt,tags)=>{ i++; return i===n ? fn(txt, hlTagsParse(tags)) : m; });
}
/* Strip highlight markers and ** from a body, keeping a plain→raw index map,
   so a DOM selection (rendered text) can be located in the raw source. */
function hlPlainMap(body){
  const chars=[], map=[]; let i=0;
  while(i<body.length){
    if(body.startsWith('==',i)){ i+=2; if(body[i]==='{'){ const j=body.indexOf('}',i); i = j===-1? i : j+1; } continue; }
    if(body.startsWith('**',i)){ i+=2; continue; }
    chars.push(body[i]); map.push(i); i++;
  }
  return { plain: chars.join(''), map };
}
function findHlSpanInBody(body, selText, occurrence){
  const norm = String(selText||'').replace(/\s+/g,' ').trim();
  if(norm.length < 3) return { err:'too-short' };
  const pat = new RegExp(norm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+'), 'g');
  const taken=[]; let hm; const hre=new RegExp(HL_RE.source,'g');
  while((hm=hre.exec(body))) taken.push([hm.index, hm.index+hm[0].length]);
  const {plain, map} = hlPlainMap(body);
  const cands=[]; let m;
  while((m=pat.exec(plain))){
    const rs = map[m.index], re2 = map[m.index+m[0].length-1]+1;
    if(body.slice(rs,re2).includes('\n')) continue;                     // one paragraph only
    if(taken.some(([a,b])=> rs<b && re2>a)) continue;                   // overlaps an existing highlight
    cands.push({start:rs, end:re2});
  }
  if(!cands.length) return { err:'not-found' };
  return { span: cands[Math.min(occurrence||0, cands.length-1)] };
}
async function saveHighlightChange(e, newBody, msg, what){
  const md = withNewBody(e, newBody);
  if(md===null){ toast(tr('Could not splice the transcript body — reload the folder')); return false; }
  const prev = e.md;   // Undo puts back exactly this version — not "whatever was saved last"
  const detail = [what ? '“'+trim(what, 56)+'”' : '', e.title].filter(Boolean).join(' · ');   // which words, in which session
  const ok = await saveEntityText(e, md);
  if(ok){
    if(CURRENT===e.id) openDetail(e.id);
    toast(tr(msg), { label: tr('Undo'), fn: async ()=>{
      const cur = ENTITIES[e.id]; if(!cur) return;
      if(await saveEntityText(cur, prev, { skipDriftCheck:true, noUndo:true })){
        if(CURRENT===e.id) openDetail(e.id);
        toast(tr('Undone ✓'), null, 0, detail);
      }
    }}, 8000, detail);
  }
  return ok;
}
async function addHighlight(e, selText, occurrence, tags){
  const r = findHlSpanInBody(e.body, selText, occurrence);
  if(r.err){ toast(r.err==='too-short' ? 'Select a bit more text (3+ characters)' : 'Couldn’t match that selection in the source — select within one paragraph, outside existing highlights'); return; }
  const frag = e.body.slice(r.span.start, r.span.end);
  const nb = e.body.slice(0, r.span.start) + '==' + frag + '==' + (tags.length ? '{'+tags.join(', ')+'}' : '') + e.body.slice(r.span.end);
  await saveHighlightChange(e, nb, 'Highlighted ✓', frag);
}
async function editHighlight(e, hln, tags){
  await saveHighlightChange(e, replaceNthHl(e.body, hln, txt=>'=='+txt+'=='+(tags.length?'{'+tags.join(', ')+'}':'')), 'Tags updated ✓', (entityHighlights(e)[hln]||{}).text);
}
async function removeHighlight(e, hln){
  await saveHighlightChange(e, replaceNthHl(e.body, hln, txt=>txt), 'Highlight removed ✓', (entityHighlights(e)[hln]||{}).text);
}
function hlAllTagNames(){
  const s=new Set();
  wsEntities().filter(x=>x.type==='Transcript' || x.type==='Evidence').forEach(x=> entityHighlights(x).forEach(h=> h.tags.forEach(t=>s.add(t))));
  return [...s].sort((a,b)=>a.localeCompare(b));
}
/* Rename a tag across every transcript (newName '' = delete the tag; rename
   onto an existing name = merge — the Set dedupes). Needs write handles. */
async function renameTagEverywhere(oldName, newName){
  const ents = wsEntities().filter(x=>x.type==='Transcript' && entityHighlights(x).some(h=>h.tags.includes(oldName)));
  if(!ents.length) return;
  if(ents.some(x=>!canEdit(x))){
    if(!window.showDirectoryPicker || !(await loadFromPicker())){ toast(tr('Read-only — connect your project folder (Chrome/Edge) to edit tags')); return; }
    return renameTagEverywhere(oldName, newName);   // entities re-merged; retry once
  }
  let n=0;
  for(const x of ents){
    const nb = x.body.replace(new RegExp(HL_RE.source,'g'), (m,txt,tags)=>{
      let tl = hlTagsParse(tags);
      if(!tl.includes(oldName)) return m;
      tl = [...new Set(tl.map(t=> t===oldName? newName : t).filter(Boolean))]; n++;
      return '=='+txt+'=='+(tl.length? '{'+tl.join(', ')+'}' : '');
    });
    const md = withNewBody(x, nb);
    if(md===null || !await saveEntityText(x, md)) return;
  }
  toast(newName ? `Tag “${oldName}” → “${newName}” in ${n} highlight${n===1?'':'s'} ✓` : `Tag “${oldName}” removed from ${n} highlight${n===1?'':'s'} ✓`);
  renderGrid(searchInput.value);
}
/* ---------- Hypotheses (the ungrounded waiting room before Ideas) ----------
   A hypothesis is a BET (IF/BY/WILL/BECAUSE) with no evidence — L1 by
   definition. It never gets RICE, never feeds persona confidence. Once it
   has >=1 resolved Signal/Evidence link, the app offers PROMOTION: the New
   idea form opens prefilled (If→When, By→I want, Will→So that) with the
   hypothesis' sources preselected; the promoted file stays as a thinking
   trail (status: promoted + idea: link). Promotion is always a human click. */
function hypoStatus(e){ const s=String(e.fm.status||'open').trim().toLowerCase(); return ['open','promoted','rejected'].includes(s)? s : 'open'; }
function hypoStatusChip(e){
  const s = hypoStatus(e);
  const tip = { open:'A live bet — L1 assumption, no evidence yet', promoted:'Gained research and became an Idea — kept as the thinking trail', rejected:'Disproven or dropped — kept so the team remembers why' }[s];
  return `<span class="hypo-status ${s}" title="${esc(tr(tip))}">${esc(LANG==='pl' ? { open:'otwarta', promoted:'awansowana', rejected:'odrzucona' }[s] : s)}</span>`;
}
function hypoSourceIds(e){
  const ids=[];
  for(const m of e.body.matchAll(MD_LINK)){
    const url=m[2]; if(/^https?:/.test(url)) continue;
    const id=resolveRef(url);
    const ty=id && ENTITIES[id] && ENTITIES[id].type;
    if(ty==='Signal'||ty==='Evidence') ids.push(id);
  }
  return [...new Set(ids)];
}
/* pure mapping used by the promote flow (and its self-test) */
function hypoToIdeaPrefill(e){
  const clean = s => stripLinks(s).replace(/[,.\s]+$/,'').trim();
  return {
    name:   hyName(e),
    when:   clean(hyPartRaw(e,'if')),
    want:   clean(hyPartRaw(e,'by')),
    sothat: clean(hyPartRaw(e,'will')),
    sourceIds: hypoSourceIds(e)
  };
}
let PROMOTE_FROM = null; // hypothesis id while the prefilled idea form is open
async function promoteHypothesis(id){
  const e = ENTITIES[id]; if(!e) return;
  PROMOTE_FROM = id;
  await openIdeaForm();
  const pre = hypoToIdeaPrefill(e);
  IDEA.name = pre.name; IDEA.when = pre.when; IDEA.want = pre.want; IDEA.sothat = pre.sothat;
  IDEA.sel = pre.sourceIds.map(sid=>({ id: sid, tandem: 0 }));
  const set=(fid,v)=>{ const el=document.getElementById(fid); if(el) el.value=v; };
  set('ifName',pre.name); set('ifWhen',pre.when); set('ifWant',pre.want); set('ifSothat',pre.sothat);
  renderIdeaPickList(''); renderIdeaSelected(); validateIdea();
  const note=document.createElement('div');
  note.className='idea-draft-note';
  note.innerHTML=`⤴ Promoting the hypothesis <b>${esc(pre.name)}</b>. An Idea must cite research — ${pre.sourceIds.length? 'its linked sources are preselected below.' : 'pick at least one Signal or Evidence below.'} The hypothesis stays behind as the thinking trail.`;
  document.getElementById('ideaBody').prepend(note);
}
async function markHypothesisPromoted(hypoId, ideaEnt){
  const e = ENTITIES[hypoId]; if(!e) return;
  const w = await ensureWritable(e);
  if(!w){ toast(tr('Idea created ✓ — but the hypothesis could not be updated (status: promoted)')); return; }
  e = w;
  let md = setFmField(e.md, 'status', 'promoted');
  md = setFmField(md, 'idea', `'${ideaLink(ideaEnt)}'`);
  if(!/\*\*Promoted to:\*\*/.test(md))
    md = md.replace(/\n*$/,'\n') + `\n**Promoted to:** [${ideaEnt.title.replace(/[\[\]]/g,'')}](${ideaLink(ideaEnt)})\n`;
  await saveEntityText(e, md, { noUndo:true });
}
/* Name only. The address used to come from a setting the app no longer keeps —
   a full e-mail is your assistant's global identity, not this app's business,
   and an entity file was never allowed to carry one unmasked anyway. */
function hypoAuthor(){
  return (PREFS.name||'').trim() || 'unknown researcher';
}
function authorChip(e){
  const a = String(e.fm.author||'').trim();
  if(!a) return '<span class="muted">—</span>';
  // one short line — "Claude" or the person's name; the whole credit (who approved it) on hover
  const ai = /^ai\b/i.test(a), model = (a.match(/^ai\s*\(([^)]+)\)/i) || [])[1];
  const label = ai ? (model || 'AI') : a.replace(/\s*<[^>]*>/, '').split(/\s+[—–-]\s+/)[0];
  return `<span class="tag author-chip" title="${esc(a)}">${ai?'🤖':'👤'} ${esc(trim(label, 24))}</span>`;
}
/* Delete a hypothesis or a piece of evidence — the file goes, Undo brings it
   back. Evidence that Signals cite says so first: their links to it would break. */
const DEL_WORDS = {
  Hypothesis: ['Delete the hypothesis “{name}”?', 'Hypothesis deleted', 'Hypothesis restored ✓'],
  Evidence:   ['Delete the evidence “{name}”?', 'Evidence deleted', 'Evidence restored ✓'],
};
async function deleteEntity(id){
  let e = ENTITIES[id]; if(!e || !DEL_WORDS[e.type]) return;
  const w = await ensureWritable(e); if(!w) return; e = w;
  const words = DEL_WORDS[e.type];
  const cited = e.type==='Evidence' ? (evidenceIndex().get(id)?.sig.size || 0) : 0;
  if(!confirm(tr(words[0]).replace('{name}', e.title.replace(HY_PREFIX,''))
      + (cited ? '\n' + trn(cited, '{n} Signal cites it — its link to it will stop working.', '{n} Signals cite it — their links to it will stop working.', 'Cytuje go {n} Sygnał — jego link przestanie działać.', 'Cytują go {n} Sygnały — ich linki przestaną działać.', 'Cytuje go {n} Sygnałów — ich linki przestaną działać.') : '')
      + '\n' + tr(e.draft ? 'It is a local draft — this cannot be undone later.'
                : e.handle ? 'The .md file will be removed from disk.'
                : '(Demo sandbox — Reset demo can always bring it back.)'))) return;
  const trash = { file: e.file, md: e.md, ws: e.ws, wasDraft: !!e.draft, hadHandle: !!e.handle };
  try{
    if(e.handle){
      const parts = e.file.split('/');
      let dir = DIRHANDLE;
      for(const part of parts.slice(0,-1)) dir = await dir.getDirectoryHandle(part);
      await dir.removeEntry(parts.at(-1));
    } else if(e.draft){
      dropDraft(e.file);
    } else { // embedded demo: tombstone in the sandbox overlay
      const m = loadDemoOverlay(); m[e.file] = null; saveDemoOverlay(m);
    }
  }catch(err){ toast(tr('Delete failed: ')+err.message); return; }
  delete ENTITIES[id]; reindex();
  if(CURRENT===id){ location.hash=''; }
  renderWsMenu(); renderTabs(); renderGrid(searchInput.value);
  toast(tr(words[1]), {label:tr('Undo'), fn: async ()=>{
    if(trash.hadHandle){ await writeRepoFile(trash.file, trash.md); const fh=await getFileHandleFor(trash.file); const ne=parseEntity(trash.md, trash.file); ne.id=id; ne.handle=fh; ne.ws=trash.ws; ENTITIES[id]=ne; }
    else if(trash.wasDraft){ const ne=parseEntity(trash.md, trash.file); ne.id=id; ne.draft=true; ne.ws=trash.ws; ENTITIES[id]=ne; persistDraft(trash.file, trash.md, trash.ws); }
    else { const m=loadDemoOverlay(); delete m[trash.file]; saveDemoOverlay(m); if(EMBEDDED_DEMO[id]) ENTITIES[id]=EMBEDDED_DEMO[id]; }
    reindex(); renderWsMenu(); renderTabs(); renderGrid(searchInput.value);
    toast(tr(words[2]));
  }});
}
async function editHypothesis(id){
  let e = ENTITIES[id]; if(!e || e.type!=='Hypothesis') return;
  const w = await ensureWritable(e); if(!w) return; e = w;
  openHypoForm(e);
}
/* ----- New competitor form (a name is enough) ----------------------------
   Creates Competitors/<Name>.md from the template with needs_research: true —
   the SessionStart hook flags it, and the AI asks the user whether to run
   initial desk research with a 1/2/3-year lookback window. ----------------- */
let COMP = null;
function openCompForm(){
  COMP = { name:'', website:'', proximity:'', why:'' };
  document.getElementById('compModal').showModal();
  document.getElementById('compBody').innerHTML = `
    <div class="idea-field"><label>${tr('Competitor name')}</label><input id="cfName" placeholder="${esc(tr('e.g. Tidal'))}" autocomplete="off"></div>
    <div class="idea-field"><label>${tr('Website')} <span class="muted">${tr('(optional — feeds the favicon & research)')}</span></label><input id="cfSite" placeholder="${esc(tr('e.g. tidal.com'))}" autocomplete="off"></div>
    <div class="idea-field"><label>${tr('Market proximity')} <span class="muted">${tr('(optional — your call, the map uses it)')}</span></label>
      <select id="cfProx" class="set-input">
        <option value="">${tr('not sure yet')}</option>
        <option value="direct">${tr('direct — fights for the SAME segment we researched (SOM)')}</option>
        <option value="adjacent">${tr('adjacent — same category, different segment/geo (SAM)')}</option>
        <option value="indirect">${tr('indirect — same need, different product (TAM)')}</option>
      </select></div>
    <div class="idea-field"><label>${tr('Why they matter')} <span class="muted">${tr('(optional, one line)')}</span></label><textarea id="cfWhy" placeholder="${esc(tr('e.g. keeps coming up in sales calls as the cheaper option'))}"></textarea></div>
    <div class="idea-draft-note">🔎 ${tr('A name is enough. The file is created with a <b>needs_research</b> flag — the next AI session will ask whether to run initial desk research (you pick the lookback: 1, 2 or 3 years back from today).')}${DIRHANDLE?'':' '+tr('No folder connected — saved as a local draft in this browser.')}</div>`;
  const bind=(fid,key)=>{ const el=document.getElementById(fid); el.oninput=()=>{ COMP[key]=el.value; validateComp(); }; };
  bind('cfName','name'); bind('cfSite','website'); bind('cfWhy','why');
  document.getElementById('cfProx').onchange=()=>{ COMP.proximity=document.getElementById('cfProx').value; };
  validateComp();
  document.getElementById('cfName').focus();
}
function validateComp(){
  const msg=document.getElementById('compValid'), btn=document.getElementById('compCreate');
  const err = COMP.name.trim() ? '' : 'Name required.';
  msg.textContent=err; btn.disabled=!!err;
  return !err;
}
function compMarkdown(){
  const name=COMP.name.trim();
  const site=COMP.website.trim().replace(/^https?:\/\//,'').replace(/\/$/,'');
  return `---
type: 'Competitor'
title: ${name}
tags: []
retrieved:              # not verified yet — initial desk research pending
${COMP.proximity?`proximity: ${COMP.proximity}   # researcher's initial call — see Competitors/README.md\n`:''}picture:
mentioned_in: []
${site?`website: ${site}\n`:''}needs_research: true   # hand-added in the app — the AI asks about initial desk research (1/2/3-year lookback), then removes this
---

# ${name}

> ⚠️ Competitor context is **opt-in** in persona conversations (\`/persona-talk --competitors\`
> or \`[competitors on]\`). By default the persona talks without this knowledge.

## Market position

${COMP.why.trim()? COMP.why.trim()+' *(researcher note at creation — desk research pending)*' : '<!-- pending initial desk research -->'}

## Features vs our product

<!-- pending initial desk research -->

## User voices

<!-- pending initial desk research -->

## What this means for our personas

<!-- fill once research lands — link Signals if any -->

## Sources

${site?`- https://${site}\n`:'- <!-- pending -->'}
`;
}
async function createCompetitor(){
  if(!validateComp()) return;
  const safe=COMP.name.trim().replace(/[\/\\:*?"<>|]/g,'').trim();
  if(!safe){ toast(tr('Give the competitor a filename-safe name')); return; }
  const file='Competitors/'+safe+'.md';
  if(ENTITIES[idFor(file)]){ toast(tr('A competitor with that name already exists')); return; }
  const md=compMarkdown();
  if(DIRHANDLE){
    try{
      await writeRepoFile(file, md);
      const fh=await getFileHandleFor(file);
      const e=parseEntity(md, file); e.id=idFor(file); e.handle=fh; e.ws='project';
      ENTITIES[e.id]=e; reindex();
    }catch(err){ toast(tr('Save failed: ')+err.message); return; }
  } else {
    if(!addDraftEntity(md, file)){ toast(tr('Could not create the draft')); return; }
  }
  closeCompForm(); renderTabs();
  location.hash='#'+idFor(file);
  toast(tr('Competitor added ✓ — the AI will offer desk research (1–3 years back) next session'));
}
function closeCompForm(){ document.getElementById('compModal').close(); COMP=null; }
/* ----- New hypothesis form (no grounding requirement — the opposite of Ideas) ----- */
let HYPO = null;
function openHypoForm(editEnt){
  HYPO = editEnt
    ? { editId: editEnt.id,
        name: hyName(editEnt),
        feature: String(editEnt.fm.feature||''),
        if_: hyPart(editEnt,'if'), by: hyPart(editEnt,'by'), will: hyPart(editEnt,'will'), because: hyPart(editEnt,'because'),
        for_: resolveRef((hyPartRaw(editEnt,'for').match(/\]\(([^)]+)\)/)||[])[1]||'') || '',
        instead: hyPart(editEnt,'instead'), wrong: hyWrongIf(editEnt),
        sel: hypoSourceIds(editEnt) }
    : { name:'', feature:'', if_:'', by:'', will:'', because:'', for_:'', instead:'', wrong:'', sel:[] };
  const personas = wsEntities().filter(x=> x.type==='Persona').sort((a,b)=> a.title.localeCompare(b.title));
  document.getElementById('hypoModal').showModal();
  document.querySelector('#hypoModal .modal-head h2').textContent = tr(editEnt ? 'Edit hypothesis' : 'New hypothesis');
  document.getElementById('hypoBody').innerHTML = `
    <div class="idea-field"><label>${tr('Hypothesis name')}</label><input id="hfName" value="${esc(HYPO.name)}" placeholder="${esc(tr('e.g. Guest mode protects recommendations'))}" autocomplete="off"></div>
    <div class="idea-field"><label>${tr('Feature it concerns')} <span class="muted">${tr('(optional)')}</span></label><input id="hfFeature" value="${esc(HYPO.feature)}" placeholder="${esc(tr('e.g. listening-profiles'))}" autocomplete="off"></div>
    <div class="idea-field"><label>${LANG==='pl' ? 'Dla' : 'For'} <span class="muted">${tr('— the persona this bet is about (optional)')}</span></label>
      <select id="hfFor" class="set-input"><option value="">${tr('nobody in particular')}</option>${personas.map(x=> `<option value="${x.id}"${HYPO.for_===x.id?' selected':''}>${esc(x.title)}</option>`).join('')}</select></div>
    <div class="idea-field"><label>${tr('If')} <span class="muted">${tr('— we do X')}</span></label><textarea id="hfIf" placeholder="${esc(tr('we add a one-tap guest mode'))}">${esc(HYPO.if_)}</textarea></div>
    <div class="idea-field"><label>${tr('By')} <span class="muted">${tr('— the mechanism')}</span></label><textarea id="hfBy" placeholder="${esc(tr('excluding guest playback from taste modeling'))}">${esc(HYPO.by)}</textarea></div>
    <div class="idea-field"><label>${tr('Instead of')} <span class="muted">${tr('— what we compare it with (optional)')}</span></label><textarea id="hfInstead" placeholder="${esc(tr('asking listeners to clean their history by hand'))}">${esc(HYPO.instead)}</textarea></div>
    <div class="idea-field"><label>${tr('Will')} <span class="muted">${tr('— the checkable outcome')}</span></label><textarea id="hfWill" placeholder="${esc(tr('trust in Discover Weekly recovers'))}">${esc(HYPO.will)}</textarea></div>
    <div class="idea-field"><label>${tr('Because')} <span class="muted">${tr('— the assumption this bet rests on')}</span></label><textarea id="hfBecause" placeholder="${esc(tr('we assume distrust comes from polluting sessions, not the recommender'))}">${esc(HYPO.because)}</textarea></div>
    <div class="idea-field"><label>${tr('Argument against this hypothesis')} <span class="muted">${tr('(optional — what would show that it is wrong)')}</span></label><textarea id="hfWrong" placeholder="${esc(tr('listeners who never share their account distrust Discover Weekly just as much'))}">${esc(HYPO.wrong)}</textarea></div>
    <div class="idea-field">
      <label>${tr('Hints')} <span class="muted">${tr('(optional — a hypothesis needs NO grounding; link a quote/signal only if one inspired it)')}</span></label>
      <div class="idea-pick">
        <input class="idea-pick-search" id="hfSearch" placeholder="${esc(tr('Filter signals & evidence…'))}" autocomplete="off">
        <div class="idea-pick-list" id="hfList"></div>
      </div>
    </div>
    ${DIRHANDLE ? '' : `<div class="idea-draft-note">📝 ${tr('No folder connected — saved as a local draft in this browser.')}</div>`}`;
  const bind=(fid,key)=>{ const el=document.getElementById(fid); el.oninput=()=>{ HYPO[key]=el.value; validateHypo(); }; };
  bind('hfName','name'); bind('hfFeature','feature'); bind('hfIf','if_'); bind('hfBy','by'); bind('hfWill','will'); bind('hfBecause','because');
  bind('hfInstead','instead'); bind('hfWrong','wrong');
  document.getElementById('hfFor').onchange = ev=>{ HYPO.for_ = ev.target.value; };
  document.getElementById('hfSearch').oninput=()=> renderHypoPickList(document.getElementById('hfSearch').value);
  renderHypoPickList(''); validateHypo();
  document.getElementById('hfName').focus();
}
function renderHypoPickList(filter){
  const f=(filter||'').trim().toLowerCase();
  const items = wsEntities().filter(e=> (e.type==='Signal'||e.type==='Evidence') && (!f || e.title.toLowerCase().includes(f)))
    .sort((a,b)=> a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
  document.getElementById('hfList').innerHTML = items.map(e=>`
    <label class="idea-pick-row"><input type="checkbox" data-id="${e.id}" ${HYPO.sel.includes(e.id)?'checked':''}>
      <span class="ty">${tr(e.meta.singular)}</span><span>${esc(e.title)}</span></label>`).join('') || `<div class="muted" style="padding:8px">${tr("Nothing to link in this workspace — that's fine.")}</div>`;
  document.querySelectorAll('#hfList input[data-id]').forEach(cb=> cb.onchange=()=>{
    if(cb.checked) HYPO.sel.push(cb.dataset.id); else HYPO.sel = HYPO.sel.filter(x=>x!==cb.dataset.id);
  });
}
function validateHypo(){
  const msg=document.getElementById('hypoValid'), btn=document.getElementById('hypoCreate');
  let err='';
  if(!HYPO.name.trim()) err='Name required.';
  else if(!HYPO.if_.trim() || !HYPO.will.trim()) err='Write at least If and Will: what we would do, and what should happen.';
  msg.textContent=tr(err); btn.disabled=!!err;
  return !err;
}
/* The file for the form. Editing changes only what the form holds — the
   title, the feature, the bet's parts and the linked hints — and leaves every
   other line, section, note and front-matter field as it was. A new file is
   written in the app's language (English or Polish labels). */
function hypoMarkdown(base){
  const name = HYPO.name.trim().replace(/'/g,'’'), who = ENTITIES[HYPO.for_];
  const forVal = who ? `[${who.title.split(/\s+[—–-]\s+/)[0]}](${ideaLink(who)})` : '';
  const vals = { if: HYPO.if_, by: HYPO.by, instead: HYPO.instead, will: HYPO.will, because: HYPO.because, wrong: HYPO.wrong };
  const linkLine = id => `- [${ENTITIES[id].title}](${ideaLink(ENTITIES[id])})`;
  if(base){
    let md = base.md;
    const prefix = (base.title.match(HY_PREFIX) || [])[1] || 'Hypothesis';
    if(name !== hyName(base)){
      md = setFmField(md, 'title', `'${prefix}: ${name}'`);
      md = md.replace(/^(---\n[\s\S]*?\n---[\s\S]*?)^# .*$/m, `$1# ${prefix}: ${name}`);
    }
    if(HYPO.feature.trim() !== String(base.fm.feature||'').trim()) md = setFmField(md, 'feature', HYPO.feature.trim() ? `'${HYPO.feature.trim().replace(/'/g,'’')}'` : null);
    const forNow = resolveRef((hyPartRaw(base,'for').match(/\]\(([^)]+)\)/)||[])[1]||'') || '';
    if(forNow !== (HYPO.for_ || '')) vals.for = forVal;
    md = hyApplyParts(md, vals);
    /* hints: a newly ticked one is added to the links section, an unticked one loses its bullet */
    const had = hypoSourceIds(base);
    had.filter(id=> !HYPO.sel.includes(id)).forEach(id=>{
      md = md.split('\n').filter(l=> !(/^\s*-\s/.test(l) && [...l.matchAll(MD_LINK)].some(m=> resolveRef(m[2])===id))).join('\n');
    });
    const add = HYPO.sel.filter(id=> !had.includes(id)).map(linkLine);
    if(add.length){
      const h = md.match(/^##\s+(Possible links|Możliwe powiązania).*$/mi);
      md = h ? md.replace(h[0], h[0] + '\n\n' + add.join('\n'))
             : md.replace(/\n*$/, '\n\n## ' + (hyPolish(md) ? 'Możliwe powiązania' : 'Possible links (optional)') + '\n\n' + add.join('\n') + '\n');
    }
    return md.replace(/\n{3,}/g, '\n\n');
  }
  const pl = LANG === 'pl', prefix = pl ? 'Hipoteza' : 'Hypothesis';
  const fm = [
    "type: 'Hypothesis'",
    `title: '${prefix}: ${name}'`,
    ...(HYPO.feature.trim() ? [`feature: '${HYPO.feature.trim().replace(/'/g,'’')}'`] : []),
    `created: ${blToday()}`,   // the day it was made, never the day of an edit
    'tags: []',
    'status: open',
    `source: '${pl ? 'utworzone w aplikacji' : 'created in the app'}'`,
    `author: '${hypoAuthor().replace(/'/g,'’')}'`,
  ].join('\n');
  const links = HYPO.sel.map(linkLine).join('\n');
  const body = hyApplyParts(`# ${prefix}: ${name}\n`, { for: forVal, ...vals }, pl).replace(/^# .*\n/, '');
  return `---\n${fm}\n---\n\n# ${prefix}: ${name}\n\n${body.trim()}\n\n## ${pl ? 'Możliwe powiązania' : 'Possible links (optional)'}\n\n${links || '<!-- ' + (pl ? 'czyste przypuszczenie — nic jeszcze nie podlinkowano' : 'pure assumption — no research linked yet') + ' -->'}\n`;
}
async function createHypothesis(){
  if(!validateHypo()) return;
  if(HYPO.editId){ // manual edit: same file, fm preserved, saved via disk/draft/sandbox rules
    const e = ENTITIES[HYPO.editId]; if(!e){ closeHypoForm(); return; }
    const md = hypoMarkdown(e);
    if(await saveEntityText(e, md)){
      closeHypoForm();
      if(HY_OPEN!==e.id){ location.hash='#'+e.id; if(CURRENT===e.id) openDetail(e.id); }   // edited from the side panel: stay on the list
      toast(tr('Hypothesis updated ✓')+(e.handle?' — '+tr('saved to')+' '+e.file:e.draft?' ('+tr('draft')+')':' ('+tr('demo sandbox')+')'));
    }
    return;
  }
  const safe=HYPO.name.trim().replace(/[\/\\:*?"<>|]/g,'').trim();
  if(!safe){ toast(tr('Give the hypothesis a filename-safe name')); return; }
  const file='Hypotheses/'+safe+'.md';
  if(ENTITIES[idFor(file)]){ toast(tr('A hypothesis with that name already exists')); return; }
  const md=hypoMarkdown();
  if(DIRHANDLE){
    try{
      await writeRepoFile(file, md);
      const fh=await getFileHandleFor(file);
      const e=parseEntity(md, file); e.id=idFor(file); e.handle=fh; e.ws='project';
      ENTITIES[e.id]=e; reindex();
    }catch(err){ toast(tr('Save failed: ')+err.message); return; }
  } else {
    if(!addDraftEntity(md, file)){ toast(tr('Could not create the draft')); return; }
  }
  closeHypoForm(); renderTabs();
  location.hash='#'+idFor(file);
  toast(tr(DIRHANDLE ? 'Hypothesis saved ✓ — a bet to test, not a finding' : 'Hypothesis draft saved in this browser ✓'));
}
function closeHypoForm(){ document.getElementById('hypoModal').close(); HYPO=null; }
function barsHtml(g){
  return `<span class="bars" title="${esc(g.why)}"><i class="${g.level>=1?'on':''}"></i><i class="${g.level>=2?'on':''}"></i><i class="${g.level>=3?'on':''}"></i></span>`;
}
function archIconHtml(e, size){
  const cls = 'arch-icon' + (size ? ' '+size : '');
  const r = picFor(e);
  if(r && r.src) return `<div class="${cls}"><img src="${esc(r.src)}" alt="" loading="lazy" style="width:100%;height:100%;border-radius:50%" onerror="this.remove()"></div>`;
  const ic = ARCH_ICONS[String(e.fm.icon||'').trim()];
  return `<div class="${cls}">${ic || ICONS.Archetype}</div>`;
}

