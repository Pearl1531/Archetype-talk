/* ---------- Settings page ---------- */
let SETTINGS_ACTIVE = false;
const settingsBtn = document.getElementById('settingsBtn');
const KNOWN_KEYS = [
  ['ELEVENLABS_API_KEY', 'ElevenLabs — gives personas a voice: [speak] in /persona-talk reads replies aloud. Get a key at elevenlabs.io.'],
  ['CAPACITIES_API_TOKEN', 'Capacities — optional API access for /source-sync imports (the Markdown-export path needs no key at all).'],
];
/* No `email` here on purpose: a full address is a global identity setting for
   your AI assistant, not an app preference, and entity files only ever carry
   the masked form anyway. No `project_hint` either — the project's real name
   lives in `project_name:` in Product Context.md, which is the one place that
   should have to be right. */
const PREF_DEFAULTS = { name:'', context_tier_default:'auto', judge_enabled:true, demo_tips:true, population:'', judge_override:'', allow_external_favicon:false, allow_external_images:false, data_residency:'none' };
const PREF_BOOLS = ['judge_enabled','demo_tips','allow_external_favicon','allow_external_images'];

async function readRepoFile(path){ // path like '.env' or '.claude/preferences.local.md'
  if(!DIRHANDLE) return null;
  try{
    let dir = DIRHANDLE; const parts = path.split('/');
    for(const part of parts.slice(0,-1)) dir = await dir.getDirectoryHandle(part);
    const fh = await dir.getFileHandle(parts.at(-1));
    const text = await (await fh.getFile()).text();
    REPO_FILE_SEEN[path] = text;
    return text;
  }catch(e){ return null; }
}
const REPO_FILE_SEEN = {}; // path -> content at last read/write, for the drift check below
async function writeRepoFile(path, text){
  let dir = DIRHANDLE; const parts = path.split('/');
  for(const part of parts.slice(0,-1)) dir = await dir.getDirectoryHandle(part, {create:true});
  const fh = await dir.getFileHandle(parts.at(-1), {create:true});
  if(fh.requestPermission && await fh.requestPermission({mode:'readwrite'})==='denied') throw new Error('permission denied');
  // same guard saveEntityText has: another app tab / Claude session may have
  // written this file since we loaded it — never clobber that silently
  if(path in REPO_FILE_SEEN){
    try{
      const disk = await (await fh.getFile()).text();
      if(disk !== REPO_FILE_SEEN[path] && disk !== text &&
         !confirm(path+' changed on disk since this page loaded it (another tab or session).\n\nOverwrite the newer version with yours?')){
        throw new Error('kept the newer disk version of '+path);
      }
    }catch(err){ if(String(err.message||'').startsWith('kept the newer')) throw err; /* unreadable/new file — write on */ }
  }
  const w = await fh.createWritable(); await w.write(text); await w.close();
  REPO_FILE_SEEN[path] = text;
}
function parsePrefs(text){
  const p = {...PREF_DEFAULTS};
  if(!text) return p;
  const [head, ...rest] = text.split(/^## Judge instruction \(override\)\s*$/m);
  for(const line of head.split('\n')){
    const m = line.match(/^(\w+):\s*(.*?)\s*(#.*)?$/); if(!m) continue;
    const k = m[1], v = m[2];
    if(k in PREF_DEFAULTS){ p[k] = PREF_BOOLS.includes(k) ? v!=='false' : v; }
  }
  if(rest.length) p.judge_override = rest.join('').trim();
  return p;
}
function prefsToText(p){
  return `# User preferences — written by the app's Settings page. Local, gitignored.
# The AI honors these (see CLAUDE.md); edit here or in the app, both work.
name: ${p.name}
context_tier_default: ${p.context_tier_default}   # auto | quick | full
judge_enabled: ${p.judge_enabled}
demo_tips: ${p.demo_tips}
population: ${p.population}   # size of the whole target group (e.g. active accounts) — may be sensitive internal data; used for sample-confidence math
allow_external_favicon: ${p.allow_external_favicon}   # off by default — when on, "Fetch favicon" may send a competitor domain to Google's favicon service
allow_external_images: ${p.allow_external_images}   # off by default — when on, a picture:/photo: pointing at http(s) is loaded from that host when the page renders
data_residency: ${p.data_residency}   # EU | none — when EU, skills ask before calling any service outside the EU (docs/compliance/data-residency.md)

## Judge instruction (override)
${p.judge_override}
`;
}
let PREFS = {...PREF_DEFAULTS};
let ENV_LINES = [];   // raw .env lines — values never rendered to the DOM
async function loadSettingsData(){
  PREFS = parsePrefs(await readRepoFile('.claude/preferences.local.md'));
  if(typeof topnavSync === 'function') topnavSync();   // `name:` is what the avatar shows
  const env = await readRepoFile('.env');
  ENV_LINES = env ? env.split('\n') : [];
}
function envHasKey(k){ return ENV_LINES.some(l=>l.startsWith(k+'=') && l.slice(k.length+1).trim()!==''); }
async function ensureEnvIgnored(){
  // Belt-and-braces: before ever writing a secret, make sure .gitignore exists
  // and covers .env, so a fresh clone (or a stripped .gitignore) can't leak it.
  try{
    let gi = await readRepoFile('.gitignore');
    if(gi === null){ await writeRepoFile('.gitignore', '.env\n.env.local\n.env*.local\n'); return; }
    if(!gi.split(/\r?\n/).some(l=> l.trim()==='.env')){
      await writeRepoFile('.gitignore', gi.replace(/\n*$/,'\n') + '.env\n');
    }
  }catch(e){ /* best effort */ }
}
async function setEnvKey(k, value){ // value '' removes the entry
  if(value!=='') await ensureEnvIgnored();
  const idx = ENV_LINES.findIndex(l=>l.startsWith(k+'='));
  if(value===''){ if(idx>-1) ENV_LINES.splice(idx,1); }
  else if(idx>-1) ENV_LINES[idx] = k+'='+value;
  else ENV_LINES.push(k+'='+value);
  await writeRepoFile('.env', ENV_LINES.join('\n').replace(/\n*$/,'\n'));
}
async function savePrefs(){ await writeRepoFile('.claude/preferences.local.md', prefsToText(PREFS)); }

/* Everything this app keeps in the browser rather than on disk. Named honestly
   in Settings because it is invisible everywhere else: it is not in your git
   history, not in your backups, and not covered by any retention rule you apply
   to the project folder. Documented in docs/DATA-BOUNDARY.md. */
function localDataSummary(){
  const n = store.keys().length;
  if(!n) return tr('Nothing stored in this browser for this project copy.');
  let drafts = 0, sandbox = 0;
  try{ drafts = Object.keys(JSON.parse(store.get('at-drafts')||'{}')).length; }catch(e){}
  try{ sandbox = Object.keys(JSON.parse(store.get('at-demo-overlay')||'{}')).length; }catch(e){}
  const parts = [];
  if(drafts) parts.push('<b>'+trn(drafts,'{n} draft that exists only here','{n} drafts that exist only here','{n} szkic, który istnieje tylko tutaj','{n} szkice, które istnieją tylko tutaj','{n} szkiców, które istnieją tylko tutaj')+'</b> — '+tr('export or save them to the folder first, clearing loses them'));
  if(sandbox) parts.push(trn(sandbox,'{n} sandbox edit to demo files','{n} sandbox edits to demo files','{n} zmiana w piaskownicy plików demo','{n} zmiany w piaskownicy plików demo','{n} zmian w piaskownicy plików demo'));
  parts.push(tr('plus view preferences, column widths, idea votes and transcript exclusions'));
  return tr('Stored in this browser (never on disk, never in git, outside any retention policy you set on the folder): {list}. Your .md files are not touched.').replace('{list}', parts.join('; '));
}
async function clearLocalData(){
  let drafts = 0;
  try{ drafts = Object.keys(JSON.parse(store.get('at-drafts')||'{}')).length; }catch(e){}
  const warn = drafts ? '\n\n'+trn(drafts,'{n} draft lives only in this browser and will be lost.','{n} drafts live only in this browser and will be lost.','{n} szkic istnieje tylko w tej przeglądarce i zostanie utracony.','{n} szkice istnieją tylko w tej przeglądarce i zostaną utracone.','{n} szkiców istnieje tylko w tej przeglądarce i zostanie utraconych.') : '';
  if(!confirm(tr('Clear everything this app stored in this browser for this project copy?')+warn+'\n\n'+tr('Your .md files on disk are not touched.'))) return;
  const n = store.clear();
  await forgetFolder();   // the remembered folder handle lives in IndexedDB, outside store.clear()
  toast(trn(n,'Cleared {n} stored item from this browser ✓','Cleared {n} stored items from this browser ✓','Wyczyszczono {n} zapisaną pozycję z tej przeglądarki ✓','Wyczyszczono {n} zapisane pozycje z tej przeglądarki ✓','Wyczyszczono {n} zapisanych pozycji z tej przeglądarki ✓'));
  location.reload();
}

/* One-click opt-in from the entity page that shows a blocked external image.
   Same switch as Settings ▸ Privacy & network — asked where the user actually
   meets it. Persists only when a folder is connected (prefs live on disk);
   otherwise it holds for this session, which is the honest fallback. */
async function allowExternalImages(host){
  if(!confirm(`Load images from ${host||'the external host'}?\n\nFrom now on this app will request them from that host every time it renders a file pointing there — the host learns your IP address and when you opened the file. You can switch this back off in Settings ▸ Privacy & network.`)) return;
  PREFS.allow_external_images = true;
  let saved = false;
  try{ if(DIRHANDLE){ await savePrefs(); saved = true; } }catch(e){}
  toast(saved ? 'External images allowed — saved in your preferences ✓'
              : 'External images allowed for this session (connect your folder to remember the setting)');
  if(SETTINGS_ACTIVE) renderSettings();
  else if(CURRENT && ENTITIES[CURRENT]) openDetail(CURRENT);
  else renderGrid(searchInput.value);
}

/* Both texts are translated here rather than at 20 call sites: every caller
   passes the English source string, which is exactly what a key is. */
function settingsRow(lab, desc, ctl){
  return `<div class="set-row"><div class="lab"><b>${tr(lab)}</b><span>${tr(desc)}</span></div><div class="ctl">${ctl}</div></div>`;
}
function renderSettings(){
  pageTitle.textContent = tr('Settings');   // language switches re-render, never re-enter
  pageSub.textContent = tr('Make it yours. Your name, defaults and keys live in your project folder — nowhere else.');
  const can = !!DIRHANDLE;
  const demoCount = Object.values(ENTITIES).filter(e=>e.fm.demo && e.handle).length;
  const dis = can ? '' : 'disabled';
  const keyRows = KNOWN_KEYS.map(([k,desc])=>{
    const has = envHasKey(k);
    return settingsRow(k, desc,
      `${has?`<span class="key-state">${tr('•••••• saved')}</span>`:''}
       <input class="set-input" data-envkey="${k}" type="password" placeholder="${esc(tr(has?'replace — paste & press Enter':'paste key & press Enter'))}" autocomplete="new-password" spellcheck="false" ${dis}>
       ${has?`<button class="btn btn-ghost btn-sm" data-envdel="${k}" ${dis}>${tr('Remove')}</button>`:''}`);
  }).join('');
  grid.className = 'set-wrap';
  grid.innerHTML = `
    ${can?'':`<div class="set-banner">${tr('Settings are saved into files in your project folder, so the app needs you to point at it once.')} ${window.showDirectoryPicker?`<div style="margin-top:10px"><button class="btn btn-primary btn-sm" id="setPick">${tr('Choose project folder…')}</button></div>`:`<b>${tr('Saving requires Chrome or Edge')}</b> — ${tr('this browser cannot write local files.')}`}</div>`}
    <div class="set-card">
      <h3>${tr('You')}</h3>
      <div class="desc">${tr('Stored in <code>.claude/preferences.local.md</code> — local and gitignored. Whichever AI assistant you work with reads this file to personalize research sessions.')}</div>
      ${settingsRow('How should we address you?','Used by the researcher notes in persona conversations, and by the account button in the top bar.',`<input class="set-input" id="prefName" value="${esc(PREFS.name)}" placeholder="${esc(tr('e.g. Mateusz'))}" ${dis}>`)}
    </div>
    <div class="set-card">
      <h3>${tr('Target population & sample confidence')}</h3>
      <div class="desc">${tr('The size of your whole target group — e.g. active accounts, subscribers in the researched segment. With it, the app computes how statistically confident your interview sample really is (shown on the Transcripts tab), so qualitative findings never masquerade as percentages.')}</div>
      <div class="warn-box"><span>⚠</span><span>${tr('<b>This can be sensitive internal data.</b> It is saved only to <code>.claude/preferences.local.md</code> — local and gitignored, it never leaves this machine and is never committed. Alternatively, ask your AI assistant: <i>“find the size of our target population, grounded in public sources no older than 9 months, and file it as Evidence”</i> — public numbers avoid the sensitivity problem entirely.')}</span></div>
      ${settingsRow('Population size (N)','Digits only, e.g. 602000000. Leave empty to hide the sample-confidence readout.',`<input class="set-input" id="prefPopulation" inputmode="numeric" pattern="[0-9]*" value="${esc(PREFS.population)}" placeholder="${esc(tr('e.g. 602000000'))}" ${dis}>`)}
      <div class="set-note" id="popPreview"></div>
    </div>
    <div class="set-card">
      <h3>${tr('Conversation defaults')}</h3>
      <div class="desc">${tr('How /persona-talk behaves unless you override it mid-conversation.')}</div>
      ${settingsRow('Researcher context detail','auto escalates only for decision-worthy answers; quick keeps one-liners; full always shows the 5-part debrief.',
        `<span class="seg" id="segTier">${['auto','quick','full'].map(v=>`<button data-v="${v}" class="${PREFS.context_tier_default===v?'active':''}" ${dis}>${v}</button>`).join('')}</span>`)}
      ${settingsRow('Judge — the reply self-check','Before every persona reply, a silent same-turn check against the data: anti-sycophancy, false premises, consistency with Signals, voice, no full-record recitals. Keep it on.',
        `<label class="switch"><input type="checkbox" id="swJudge" aria-label="${esc(tr('Judge — the reply self-check'))}" ${PREFS.judge_enabled?'checked':''} ${dis}><i></i></label>`)}
      ${settingsRow('Demo tips','“💡 Try asking” hints from the researcher — only ever in conversations with demo personas.',
        `<label class="switch"><input type="checkbox" id="swTips" aria-label="${esc(tr('Demo tips'))}" ${PREFS.demo_tips?'checked':''} ${dis}><i></i></label>`)}
      <div class="set-row" style="display:block">
        <div class="lab"><b>${tr('Judge instruction (override)')}</b><span>${tr('Advanced: replaces the default self-check list above with your own instruction. Leave empty for the default. Applied by the persona-talk skill.')}</span></div>
        <textarea class="set-input" id="prefJudge" placeholder="${esc(tr('e.g. Also verify the reply never proposes UI solutions — participants describe problems, not designs.'))}" ${dis}>${esc(PREFS.judge_override)}</textarea>
        <div style="margin-top:8px"><button class="btn btn-primary btn-sm" id="saveJudge" ${dis}>${tr('Save instruction')}</button></div>
      </div>
    </div>
    <div class="set-card">
      <h3>${tr('Demo data')}</h3>
      <div class="desc">${tr('The bundled Spotify example set. Every demo file carries <code>demo: true</code> in its frontmatter — that flag, not the folder, is what identifies it. Removing deletes <b>only</b> flagged files, so your own personas, signals and evidence sitting in the same folders are never touched. Keeping it is fine too: the Demo badges make it unmistakable.')}</div>
      ${settingsRow('Remove demo files from disk', demoCount
        ? trn(demoCount,'{n} demo file in the loaded set.','{n} demo files in the loaded set.',
              '{n} plik demo we wczytanym zestawie.','{n} pliki demo we wczytanym zestawie.','{n} plików demo we wczytanym zestawie.')
          + (can ? '' : ' ' + tr('You’ll be asked to pick your project folder first — deletion works on the files on disk.'))
          + ' ' + tr('Tip: click Export .md first if you want a backup. For the full cleanup (demo avatars, DEMO.md, demo rows in the backlog/registry) run /demo-data in your AI assistant.')
        : tr('No demo files in the loaded set ✓'),
        `<button class="btn btn-danger btn-sm" id="btnDeleteDemo" ${(demoCount && (can || window.showDirectoryPicker)) ? '' : 'disabled'} title="${esc(demoCount ? (window.showDirectoryPicker?'':tr('Requires Chrome or Edge')) : tr('Nothing flagged demo: true is loaded'))}">${trn(demoCount||0,'Delete {n} demo file…','Delete {n} demo files…','Usuń {n} plik demo…','Usuń {n} pliki demo…','Usuń {n} plików demo…')}</button>`)}
    </div>
    <div class="set-card">
      <h3>${tr('Privacy & network')}</h3>
      <div class="desc">${tr('This app runs fully offline: opening it makes <b>no</b> external requests, and your research files never leave this machine. Both switches below can change that, and both are off by default so a locked-down (e.g. enterprise) install stays airtight.')}</div>
      ${settingsRow('Allow external favicon fetch','When on, the competitor “Fetch favicon” button may send that competitor’s domain to Google’s favicon service (google.com). Off keeps everything local — competitors still show a lettered monogram, and you can always upload an icon file or ask Claude to fetch one.',
        `<label class="switch"><input type="checkbox" id="swFavicon" aria-label="${esc(tr('Allow external favicon fetch'))}" ${PREFS.allow_external_favicon?'checked':''} ${dis}><i></i></label>`)}
      ${settingsRow('Allow external images','A file whose <code>picture:</code> or <code>photo:</code> holds an <code>http(s)</code> address (e.g. an avatar still pointing at api.dicebear.com) is fetched from that host every time the page renders it — which tells that host you opened this file. Off shows initials instead, with a one-click load on the entity’s own page. Local paths (<code>avatars/Emma.svg</code>) and inline images are unaffected.',
        `<label class="switch"><input type="checkbox" id="swExtImg" aria-label="${esc(tr('Allow external images'))}" ${PREFS.allow_external_images?'checked':''} ${dis}><i></i></label>`)}
      ${settingsRow('Keep processing in the EU','When on, skills ask before calling any service outside the EU — persona voice, the favicon fetch, a remote image. A reminder, not a technical block: which model you use is set in your agent, not here. See <code>docs/compliance/data-residency.md</code>.',
        `<label class="switch"><input type="checkbox" id="swResidency" aria-label="${esc(tr('Keep processing in the EU'))}" ${PREFS.data_residency==='EU'?'checked':''} ${dis}><i></i></label>`)}
      ${settingsRow('Clear local data (this browser)', localDataSummary(),
        `<button class="btn btn-danger btn-sm" id="btnClearLocal" ${store.keys().length?'':'disabled'}>${trn(store.keys().length,'Clear {n} item…','Clear {n} items…','Wyczyść {n} pozycję…','Wyczyść {n} pozycje…','Wyczyść {n} pozycji…')}</button>`)}
    </div>
    <div class="set-card">
      <h3>${tr('API keys')}</h3>
      <div class="warn-box"><span>⚠</span><span>${tr("<b>Never publish these keys or give them to anyone.</b> Anyone holding a key can spend your account's quota and money. Saved keys go straight from this form into <code>.env</code> in your project folder — a file that is gitignored, never leaves this machine, and is only ever shown here as a mask. The AI is instructed to use keys by name (<code>$ELEVENLABS_API_KEY</code>) without reading their values; note that any local tool with file access could technically read <code>.env</code> — your machine is the trust boundary.")}</span></div>
      ${keyRows}
      <div class="set-note">${tr("Dovetail, Mixpanel, GA4 and Amplitude don't belong here — they authenticate through your MCP client (OAuth / its own secret store), no key in this repo.")}</div>
    </div>`;
  const del = grid.querySelector('#btnDeleteDemo');
  if(del && !del.disabled) del.onclick = async ()=>{
    if(!DIRHANDLE){
      // connect first, then continue — one click does both
      if(!(await loadFromPicker())) return;
      renderSettings();
    }
    const demos = Object.values(ENTITIES).filter(e=>e.fm.demo && e.handle);
    if(!demos.length){ toast(tr('No demo: true files found in the loaded folder')); return; }
    if(!confirm(tr('Delete {n} demo files from disk?').replace('{n}', demos.length)+'\n\n'+tr('Only files with demo: true are removed — your own files are untouched. This cannot be undone (consider Export .md first).'))) return;
    let ok=0, failed=[]; const trash=[]; // kept in memory for one-shot Undo
    for(const e of demos){
      try{
        const parts = e.file.split('/');
        let dir = DIRHANDLE;
        for(const part of parts.slice(0,-1)) dir = await dir.getDirectoryHandle(part);
        await dir.removeEntry(parts.at(-1));
        trash.push({ file: e.file, md: e.md });
        delete ENTITIES[e.id]; ok++;
      }catch(err){ failed.push(e.file); }
    }
    reindex(); renderTabs();
    store.set('at-demo-deleted','1'); // legacy flag; the embedded copy stays available as the Demo workspace
    renderSettings();
    const undoDemo = async ()=>{
      let back=0;
      for(const t of trash){
        try{
          await writeRepoFile(t.file, t.md);
          const parts = t.file.split('/');
          let dir = DIRHANDLE; for(const part of parts.slice(0,-1)) dir = await dir.getDirectoryHandle(part);
          const fh = await dir.getFileHandle(parts.at(-1));
          const ent = parseEntity(t.md, t.file);
          if(ent){ ent.id = idFor(t.file); ent.handle = fh; ENTITIES[ent.id] = ent; back++; }
        }catch(err){}
      }
      reindex(); renderTabs(); store.del('at-demo-deleted'); renderSettings();
      toast(tr('Restored {a} of {b} demo files ✓').replace('{a}',back).replace('{b}',trash.length));
    };
    toast(failed.length ? tr('Deleted {ok}; failed: {bad} ({first}…)').replace('{ok}',ok).replace('{bad}',failed.length).replace('{first}',failed[0])
                        : tr('Deleted {n} demo files — your own data untouched ✓').replace('{n}',ok),
          ok ? {label:tr('Undo'), fn: undoDemo} : undefined);
  };
  const pick = grid.querySelector('#setPick');
  if(pick) pick.onclick = async ()=>{
    try{ DIRHANDLE = await showDirectoryPicker(); }catch(e){ return; }
    await rememberFolder(DIRHANDLE);   // same folder next visit, no picker
    await loadSettingsData(); renderSettings();
    toast(tr('Folder connected — settings now save to disk ✓'));
  };
  // Clearing browser storage touches no file, so it must stay available even
  // with no folder connected — wire it BEFORE the disk-only early return below.
  { const cl = grid.querySelector('#btnClearLocal'); if(cl && !cl.disabled) cl.onclick = clearLocalData; }
  if(!can) return;
  grid.querySelectorAll('input[data-envkey]').forEach(inp=>{
    inp.addEventListener('keydown', async ev=>{
      if(ev.key!=='Enter') return;
      const v = inp.value.trim(); if(!v) return;
      try{ await setEnvKey(inp.dataset.envkey, v); inp.value=''; renderSettings(); toast(tr('Key saved to .env (local, gitignored) ✓')); }
      catch(e){ toast(tr('Save failed: ')+e.message); }
    });
    inp.addEventListener('blur', ()=>{ /* never keep typed secrets around */ if(document.activeElement!==inp) return; });
  });
  grid.querySelectorAll('button[data-envdel]').forEach(b=> b.onclick = async ()=>{
    try{ await setEnvKey(b.dataset.envdel, ''); renderSettings(); toast(tr('Key removed from .env ✓')); }
    catch(e){ toast(tr('Save failed: ')+e.message); }
  });
  const bindPref = (id, key, ev='change') => { const el=grid.querySelector('#'+id); el.addEventListener(ev, async ()=>{
    PREFS[key] = el.type==='checkbox' ? el.checked : el.value;
    try{ await savePrefs(); toast(tr('Preference saved ✓')); }catch(e){ toast(tr('Save failed: ')+e.message); }
  }); };
  bindPref('prefName','name');
  const popPrev = grid.querySelector('#popPreview');
  /* Two numbers, both of them answers: how many people this size of population
     asks for, and what your sample is worth today. The sentence that used to
     wrap them ("worst-case p=50%", "pp", a pointer to another tab) explained
     the maths to people who were not asking about the maths. */
  const updatePopPreview = ()=>{
    const N = parseInt(String(grid.querySelector('#prefPopulation').value).replace(/[^0-9]/g,''),10);
    const n = distinctParticipants();
    if(!N){ popPrev.innerHTML = ''; return; }
    const loc = LANG==='pl' ? 'pl-PL' : 'en-US';
    popPrev.innerHTML = `<span class="pop-fig"><b>${sampleNeeded(N).toLocaleString(loc)}</b>${tr('participants for ±5 pp')}</span>`
      + `<span class="pop-fig"><b>±${(sampleMOE(Math.max(n,1), N)*100).toFixed(1)} pp</b>${trn(n,'your error at {n} participant','your error at {n} participants','twój błąd przy {n} uczestniku','twój błąd przy {n} uczestnikach','twój błąd przy {n} uczestnikach')}</span>`;
  };
  updatePopPreview();
  const popInp = grid.querySelector('#prefPopulation');
  /* the field is a number, so it refuses to hold anything else — pasting a
     report line leaves the digits behind instead of a value that reads as 0 */
  popInp.addEventListener('input', ()=>{
    const clean = popInp.value.replace(/[^0-9]/g,'');
    if(clean !== popInp.value){ const at = popInp.selectionStart - (popInp.value.length - clean.length); popInp.value = clean; popInp.setSelectionRange(at, at); }
    updatePopPreview();
  });
  popInp.addEventListener('change', async ()=>{
    PREFS.population = popInp.value.replace(/[^0-9]/g,'');
    store.set('at-population', PREFS.population);
    try{ await savePrefs(); toast('Population saved (local only) ✓'); }catch(e){ toast('Save failed: '+e.message); }
  });
  bindPref('swJudge','judge_enabled'); bindPref('swTips','demo_tips'); bindPref('swFavicon','allow_external_favicon'); bindPref('swExtImg','allow_external_images');
  // not a boolean on disk: the agent reads 'EU' | 'none', so the switch maps to those
  { const rs = grid.querySelector('#swResidency');
    if(rs) rs.addEventListener('change', async ()=>{
      PREFS.data_residency = rs.checked ? 'EU' : 'none';
      try{ await savePrefs(); toast(rs.checked ? 'EU-only mode on — skills will ask before calling a non-EU service ✓' : 'Preference saved ✓'); }
      catch(e){ toast('Save failed: '+e.message); }
    }); }
  grid.querySelectorAll('#segTier button').forEach(b=> b.onclick = async ()=>{
    PREFS.context_tier_default = b.dataset.v;
    grid.querySelectorAll('#segTier button').forEach(x=>x.classList.toggle('active', x===b));
    try{ await savePrefs(); toast(tr('Preference saved ✓')); }catch(e){ toast(tr('Save failed: ')+e.message); }
  });
  grid.querySelector('#saveJudge').onclick = async ()=>{
    PREFS.judge_override = grid.querySelector('#prefJudge').value.trim();
    try{ await savePrefs(); toast(tr('Judge instruction saved ✓')); }catch(e){ toast(tr('Save failed: ')+e.message); }
  };
}
async function settingsEnter(){
  SETTINGS_ACTIVE = true; syncLinTheme(); helpExit(); if(typeof mindmapExit==='function') mindmapExit();
  settingsBtn.classList.add('active');
  galleryView.style.display = ""; detailView.classList.remove('active');
  hideGalleryChrome();
  renderTabs(); // clear any graph-tab highlight — this page owns the active state
  pageTitle.textContent = tr('Settings');
  pageSub.textContent = tr('Make it yours. Your name, defaults and keys live in your project folder — nowhere else.');
  pageSub.style.display = '';
  await loadSettingsData();
  if(PREFS.population) store.set('at-population', PREFS.population);
  renderSettings(); window.scrollTo(0,0);
  motionPage();   // the page arrives after the await, so the router's call came too early
}
function settingsExit(){
  if(!SETTINGS_ACTIVE) return;
  SETTINGS_ACTIVE = false;
  settingsBtn.classList.remove('active');
  updatePageHead();
}
settingsBtn.onclick = ()=>{ location.hash = '#settings'; };

