/* ---------- parse frontmatter + body ---------- */
/* One YAML scalar, unquoted. Inside single quotes YAML escapes ' as '' —
   "It wasn''t me" has to read back as "It wasn't me". */
function unq(v){
  const q = /^'.*'$/s.test(v) && v.length>1;
  v = v.replace(/^['"]|['"]$/g,'');
  return q ? v.replace(/''/g,"'") : v;
}
function parseEntity(md, file){
  md = md.replace(/\r/g,'').trim();
  let fm = {}, body = md;
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if(m){
    body = md.slice(m[0].length).trim();
    let lastKey = null;   // for block-list values (key:\n  - a\n  - b) — merges cleanly in git
    m[1].split('\n').forEach(l=>{
      const li = l.match(/^\s+-\s+(.*)$/);          // a "- item" line under the previous key
      if(li && lastKey){
        if(!Array.isArray(fm[lastKey])) fm[lastKey] = fm[lastKey] ? [fm[lastKey]] : [];
        const item = unq(li[1].trim());
        if(item) fm[lastKey].push(item);
        return;
      }
      const nested = l.match(/^\s+([\w_]+):\s*(.*)$/);   // one level of nesting (sentiment:, voices:)
      if(nested && lastKey){
        if(typeof fm[lastKey] !== 'object' || Array.isArray(fm[lastKey])) fm[lastKey] = {};
        fm[lastKey][nested[1]] = unq(nested[2].replace(/\s+#\s.*$/,'').trim());
        return;   // lastKey stays put: sibling keys belong to the same block
      }
      const mm = l.match(/^([\w_]+):\s*(.*)$/); if(!mm){ lastKey = null; return; }
      let v = unq(mm[2].replace(/\s+#\s.*$/,'').trim());
      if(/^\[.*\]$/.test(v)) v = v.slice(1,-1).split(',').map(x=>unq(x.trim())).filter(Boolean);
      fm[mm[1]] = v;
      lastKey = mm[1];
    });
  }
  const rawType = (fm.type||'').trim();
  const t = TYPES[rawType];
  if(!t) return null; // not a known entity type
  return { file, type:rawType, meta:t, fm, body, md,
           title: fm.title || (body.match(/^#\s+(.+)/m)||[])[1] || file.split('/').pop().replace(/\.md$/,'') };
}
function section(body, h){
  /* no `m` flag: with it the `$` in the lookahead matches every line end and
     lazily truncates the capture to the section's first line */
  const re = new RegExp('(?:^|\\n)##\\s*'+h.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*\\n([\\s\\S]*?)(?=\\n##\\s|\\n#\\s|$)','i');
  const mm = body.match(re); return mm ? mm[1].trim() : '';
}
function afterLabel(body, label){
  const re = new RegExp('\\*\\*'+label+':\\*\\*\\s*(.+)','i');
  const mm = body.match(re); return mm ? mm[1].trim() : '';
}
function firstQuote(body){ const mm = body.match(/^>\s?(.+)/m); return mm ? mm[1].trim() : ''; }
function stripLinks(s){ return s.replace(HL_RE,'$1').replace(MD_LINK,'$1').replace(/[*`_]/g,'').trim(); }

/* ---------- state ---------- */
let ENTITIES = {};
let byBasename = {};
let byPath = {};        // "folder/name.md" (lowercase) -> id — folder-aware resolution
let COLLISIONS = [];    // slug collisions detected at load (two files -> one id)
let lastLoad = null;
let activeType = 'All';
function idFor(file){ return file.replace(/\.md$/,'').replace(/[^a-z0-9]+/gi,'-').toLowerCase(); }
function basenameOf(file){ return decodeURIComponent(file.split('/').pop().replace(/\.md$/,'')).toLowerCase(); }

function addEntity(md, file){
  const e = parseEntity(md, file); if(!e) return false;
  const id = idFor(file); e.id = id;
  if(ENTITIES[id] && ENTITIES[id].file !== file) COLLISIONS.push(file + ' ⇄ ' + ENTITIES[id].file);
  ENTITIES[id] = e; byBasename[basenameOf(file)] = id; byPath[file.toLowerCase()] = id;
  return true;
}
function reindex(){
  byBasename = {}; byPath = {};
  Object.values(ENTITIES).forEach(e=>{ byBasename[basenameOf(e.file)] = e.id; byPath[e.file.toLowerCase()] = e.id; });
}
/* Resolve a markdown link target to an entity id. Folder-aware: when the URL
   names a folder (../Evidence/Pricing.md), that beats a bare-basename match —
   otherwise two same-named files in different folders silently cross-link. */
function resolveRef(url){
  const clean = decodeURIComponent(String(url).split('#')[0]);
  const parts = clean.split('/').filter(x=>x && x!=='..' && x!=='.');
  if(!parts.length) return null;
  if(parts.length >= 2){
    const id = byPath[(parts.at(-2) + '/' + parts.at(-1)).toLowerCase()];
    if(id) return id;
  }
  return byBasename[parts.at(-1).replace(/\.md$/i,'').toLowerCase()] || null;
}

/* Per-project storage. file:// shares ONE origin across every local copy of
   this app, so raw localStorage keys would leak between unrelated projects:
   project A's population would feed project B's confidence math, and deleting
   demo data in one repo would suppress the embedded example in a fresh clone.
   Namespacing by pathname isolates each on-disk copy. */
const STORE_NS = 'at:' + location.pathname + ':';
const store = {
  get: k => { try { return localStorage.getItem(STORE_NS + k); } catch(e){ return null; } },
  set: (k, v) => { try { localStorage.setItem(STORE_NS + k, v); } catch(e){ /* Safari private mode / quota — preferences just won't persist */ } },
  del: k => { try { localStorage.removeItem(STORE_NS + k); } catch(e){} },
  keys: () => { try { return Object.keys(localStorage).filter(k=> k.startsWith(STORE_NS)); } catch(e){ return []; } },
  /* Everything this app has put in the browser for THIS project copy. Backs
     Settings ▸ "Clear local data" — drafts and sandbox edits live only here, so
     they fall outside your backups, your git history and any retention rule you
     set on the folder. See docs/DATA-BOUNDARY.md. */
  clear: () => { const ks = store.keys(); ks.forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} }); return ks.length; }
};

/* ---------- the connected folder, remembered across sessions ----------
   A FileSystemDirectoryHandle is structured-cloneable but not a string, so it
   cannot ride in localStorage — IndexedDB is the only place it survives a
   closed tab (and it does work on file://, which is how this app is opened).
   Keyed by pathname for the same reason `store` is namespaced: one file://
   origin is shared by every local copy of the app.

   What is stored is a *ticket*, not access. On the next visit the browser still
   decides whether the grant still stands (`queryPermission`); re-granting needs
   a click, because a page may not silently regain the disk it had yesterday.
   Nothing here reads a file — see restoreFolder() in 14-boot-router.js. */
const HANDLE_DB = 'archetype-talk', HANDLE_STORE = 'folder', HANDLE_KEY = location.pathname;
const PROJECT_STORE = 'projects';   // the Projects screen's list — see below
function idbTx(mode, fn, storeName){
  const st = storeName || HANDLE_STORE;
  return new Promise((res, rej)=>{
    let open; try{ open = indexedDB.open(HANDLE_DB, 2); }catch(err){ return rej(err); }
    open.onupgradeneeded = ()=>{ const db = open.result;
      if(!db.objectStoreNames.contains(HANDLE_STORE)) db.createObjectStore(HANDLE_STORE);
      if(!db.objectStoreNames.contains(PROJECT_STORE)) db.createObjectStore(PROJECT_STORE); };
    open.onerror = ()=> rej(open.error);
    open.onsuccess = ()=>{
      const db = open.result;
      let req;
      try{ req = fn(db.transaction(st, mode).objectStore(st)); }
      catch(err){ db.close(); return rej(err); }
      req.onsuccess = ()=>{ const v = req.result; db.close(); res(v); };
      req.onerror = ()=>{ db.close(); rej(req.error); };
    };
  });
}
/* All three swallow errors: a browser with no File System Access API, private
   mode, or a wiped profile just means "no folder remembered" — never a failure
   the user has to see. */
async function rememberFolder(h){ try{ if(h) await idbTx('readwrite', s=> s.put(h, HANDLE_KEY)); }catch(err){} }
async function rememberedFolder(){ try{ return (await idbTx('readonly', s=> s.get(HANDLE_KEY))) || null; }catch(err){ return null; } }
async function forgetFolder(){ try{ await idbTx('readwrite', s=> s.delete(HANDLE_KEY)); }catch(err){} }

/* ---------- the projects list (the Projects screen) ----------
   Same idea one step wider: every folder you have ever connected keeps a
   record here — its handle, the name it had, when you last opened it and how
   many entities it held then. The counts are a REMEMBERED snapshot, only ever
   shown as such: reading the folder to refresh them would need the disk
   permission we do not have until you click. Forgetting a project removes the
   record, never the folder. */
async function projectsAll(){
  try{
    const rows = (await idbTx('readonly', s=> s.getAll(), PROJECT_STORE)) || [];
    return rows.filter(r=> r && r.handle).sort((a,b)=> (b.opened||0)-(a.opened||0));
  }catch(err){ return []; }
}
async function projectPut(rec){ try{ await idbTx('readwrite', s=> s.put(rec, rec.id), PROJECT_STORE); }catch(err){} }
async function projectForget(id){ try{ await idbTx('readwrite', s=> s.delete(id), PROJECT_STORE); }catch(err){} }
/* One record per folder, not per connect: two handles for the same directory
   are only comparable through isSameEntry(), so matching is a scan. */
/* Drop whatever record exists for this folder — used when a folder turns out
   not to be a project after all (nothing but demo files in it). */
async function projectForgetHandle(dir){
  if(!dir) return;
  for(const r of await projectsAll()){
    try{ if(await r.handle.isSameEntry(dir)) await projectForget(r.id); }catch(err){}
  }
}
async function projectRemember(dir, stats){
  if(!dir) return null;
  const rows = await projectsAll();
  let rec = null;
  for(const r of rows){
    try{ if(await r.handle.isSameEntry(dir)) { rec = r; break; } }catch(err){}
  }
  rec = rec || { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), added: Date.now() };
  rec.handle = dir; rec.name = dir.name; rec.opened = Date.now();
  /* The folder name is what the disk calls it; `project_name:` in
     `Product Context.md` is what the team calls it. Keep both: the label is
     what we show, the folder name stays the truth about where it lives. */
  if(stats && 'label' in stats) rec.label = stats.label || '';
  if(stats) rec.stats = stats;
  if(stats && stats.created) rec.created = true;   // an empty folder we scaffolded is still a project
  await projectPut(rec);
  return rec;
}

/* ---------- picture sources — the app's image privacy boundary ----------
   `picture:` (personas, archetypes, competitor icons) and `photo:` (poster
   hero) can each hold one of three things, and only two of them may render
   without asking:

     data:image/…       inline bytes — what the app itself writes for uploaded
                        competitor icons. Always safe.
     avatars/Emma.svg   a path relative to the entity's own folder. Read from
                        the connected folder, or from the build-time map below
                        in the shipped single-file app. Also safe: local bytes.
     https://host/…     an external host. Rendering it turns "open the file"
                        into a request to that host on page load, which is
                        exactly what our privacy claim says never happens — so
                        it stays blocked until the user opts in (Settings ▸
                        Privacy & network), the same gate favicons use.

   Blocked images simply fall back to initials/monogram, like an entity with no
   picture at all; the detail page additionally offers a one-click load. */
const PIC_INLINE = {};   // repo-relative path -> data: URI
const PIC_BY_TAIL = {};  // 'avatars/Emma.svg' -> data: URI — the folder-input path
                         // (Safari/Firefox) can't tell how deep the picked root
                         // was, so the last two segments are the fallback key
function picStore(path, dataUri){
  const p = String(path||'').replace(/^\/+/,'');
  PIC_INLINE[p] = dataUri;
  const parts = p.split('/');
  if(parts.length >= 2) PIC_BY_TAIL[parts.slice(-2).join('/')] = dataUri;
}
{ const s = document.querySelector('script[type="application/json"][data-pictures]');
  if(s){ try{ const m = JSON.parse(s.textContent); Object.keys(m).forEach(k=> picStore(k, m[k])); }catch(e){} } }

/* Resolve a frontmatter picture value against the file that declared it.
   Returns {src} when it can be rendered offline, {blocked, host, url} for an
   external URL the user has not allowed, or null when there is nothing to show. */
function picResolve(raw, file){
  const p = String(raw||'').trim();
  if(!p) return null;
  if(/^data:image\//i.test(p)) return { src: p };
  if(/^https?:/i.test(p)){
    if(typeof PREFS!=='undefined' && PREFS && PREFS.allow_external_images) return { src: p };
    return { blocked: true, url: p, host: (p.match(/^https?:\/\/([^/?#]+)/i)||[])[1] || 'an external host' };
  }
  if(/^[a-z][a-z0-9+.-]*:/i.test(p)) return null;   // any other scheme: not ours to render
  const dir = String(file||'').includes('/') ? String(file).replace(/\/[^/]*$/, '/') : '';
  const rel = p.replace(/^\.\//,'');
  const path = rel.startsWith('/') ? rel.slice(1) : dir + rel;
  const tail = path.split('/').slice(-2).join('/');
  const hit = PIC_INLINE[path] || PIC_BY_TAIL[tail];
  return hit ? { src: hit } : null;
}
function picFor(e, field){ return e ? picResolve(e.fm && e.fm[field||'picture'], e.file) : null; }

/* "Us" — our own product, the anchor competitors are measured against. Parsed
   from Product Context.md (root doc); powers the market-map anchor node and the
   "About us" card on the Competitors tab. Null when no context is loaded. */
let PRODUCT_RAW = null;

/* "Research backlog.md" — the other root doc: the collector for questions a
   persona conversation raised but no data can answer. Not an entity (no type:
   frontmatter), so it lives outside ENTITIES: the demo copy is embedded, the
   project copy is read from the connected folder and written back in place. */
let BACKLOG_RAW = null;        // project copy — from the connected folder
let BACKLOG_DEMO_RAW = null;   // shipped demo copy — from the embedded block

