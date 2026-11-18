/* ---------- Persona page, Editorial (2026-10) ----------
   The top of a persona is one card — portrait, name, role, a few lines of
   context (the description plus the researched "Who they are" lines; character
   colour stays out), the button that starts a conversation — then cards and a
   table built straight from her file:

     ## Pains               → "Frustrations": one card per pain, the signal's
                              verbatim quote (the persona file paraphrases)
     ## Jobs to be Done     → "Typical behavior": the moment, what she expects
     (four facts)           → in one line, built from, sources, readiness score
     ## Ideas for this persona → idea, votes, description

   Where each card comes from is one hover away (the peek) and listed in full
   under the page.

   Every other section of the file still renders below, as before. Nothing
   here invents content: a row with nothing behind it says so. */
const PE_TABLED = ['Pains', 'Jobs to be Done', 'Ideas for this persona', 'Archetypes'];

/* list items of one ## section: the top-level line plus its indented sub-bullets */
function peItems(md){
  const out = [];
  md.split('\n').forEach(line=>{
    const top = line.match(/^[-*]\s+(.*)$/), sub = line.match(/^\s{2,}[-*]\s+(.*)$/);
    if(top) out.push({ text: top[1], subs: [] });
    else if(sub && out.length) out[out.length-1].subs.push(sub[1]);
  });
  return out;
}
/* the entities a piece of markdown links to, in order, with the raw href kept (it may carry #anchor) */
function peLinks(md){
  const out = [];
  for(const m of md.matchAll(MD_LINK)){
    const url = m[2]; if(/^https?:/.test(url)) continue;
    const id = resolveRef(url);
    if(id && ENTITIES[id]) out.push({ e: ENTITIES[id], label: m[1], anchor: (url.split('#')[1]||'') });
  }
  return out;
}
const peFirst = e => e.title.split(/\s+[—–-]\s+/)[0].trim();
function peLink(x, prefix){
  return `<a class="xref pe-a" data-goto="${esc(x.e.id)}">${prefix?esc(prefix)+' ':''}${esc(x.label || x.e.title)}</a>`;
}
function peSourcesOf(sig){
  // a signal's own grounding: the interview it was heard in, the evidence it cites
  const L = peLinks(sig.body);
  const tr_ = L.filter(x=> x.e.type==='Transcript');
  const ev = [...new Set([...L.filter(x=> x.e.type==='Evidence').map(x=> x.e.id),
    ...[].concat(sig.fm.evidences||[]).map(n=> byBasename[String(n).toLowerCase()]).filter(Boolean)])].map(id=> ({ e: ENTITIES[id] }));
  return { tr: tr_, ev };
}
function peLevelTip(n){
  return `<span class="pe-ladder">${[1,2,3,4,5].map(i=>`<span class="${i===n?'on':''}"><b>${i} · ${esc(tr(LEVEL_TEXT[i][0]))}</b> — ${esc(tr(LEVEL_TEXT[i][1]))}</span>`).join('')}</span>`;
}

function personaEditorialHtml(e){
  const first = peFirst(e);
  const h1 = (e.body.match(/^#\s+(.+—.+)$/m)||[])[1] || '';
  const role = h1.includes('—') ? h1.split('—').slice(1).join('—').trim() : '';
  const fullName = h1.includes('—') ? h1.split('—')[0].trim() : e.title;
  const prim = /primary/i.test(e.fm.category||'');
  const lv = personaLevel(e);
  const all = peLinks(e.body);
  const uniq = t => [...new Map(all.filter(x=> x.e.type===t).map(x=> [x.e.id, x])).values()];
  const heard = uniq('Signal'), read = uniq('Evidence'), archs = peLinks(section(e.body,'Archetypes')).filter(x=> x.e.type==='Archetype');
  const { n: people, off } = personaParticipants(e, true);
  const ideas = peLinks(section(e.body,'Ideas for this persona')).filter(x=> x.e.type==='IdeaForImprovement');

  /* hero: portrait, then who she is, a few lines of context, the conversation */
  const ctx = [stripLinks(e.fm.description||''), ...peItems(section(e.body,'Who they are'))
    .map(it=> it.text).filter(t=> !/\[colour\]/.test(t))            // character colour stays out of the headline
    .map(t=> stripLinks(t.replace(/^\*\*[^*]+:\*\*\s*/,'')).replace(/\*+/g,'').trim())]
    .filter(Boolean).map(t=> /[.!?]$/.test(t) ? t : t+'.').join(' ');
  const hero = `<section class="pe-hero">
      ${faceHtml(e, 'pe-portrait'+(prim?' prim':''), first)}
      <div class="pe-main">
        <div class="pe-chips"><span class="dx-chip">${tr(prim ? 'Primary persona' : 'Secondary persona')}${dxTip(tr(prim ? 'Primary persona' : 'Secondary persona'), esc(tr(prim ? 'the main user type this project designs for' : 'a secondary user type')))}</span>${e.fm.demo ? `<span class="dx-chip">${tr('Example data')}${dxTip(tr('This is the example project'), esc(tr('Illustrative research on Spotify listeners, not your users. The numbers are read as of the day its research closed, and it never mixes with your own projects.')))}</span>` : ''}</div>
        <h1 class="pe-name">${esc(first)}<span class="dx-dot">.</span></h1>
        <div class="pe-role">${esc([fullName !== first ? fullName.replace(first,'').trim() : '', role].filter(Boolean).join(' · '))}</div>
        ${ctx ? `<p class="pe-ctx" title="${esc(ctx)}">${esc(ctx)}</p>` : ''}
        <div class="pe-actions">${talkButtonHtml(e, first)}</div>
      </div>
    </section>`;

  /* four facts */
  const facts = `<section class="dx-facts pe-facts">
      <div class="pe-wide"><span class="dx-fl">${tr('In one line')}</span><span class="pe-oneline">${esc(stripLinks(e.fm.description||'')) || '—'}</span></div>
      <div><span class="dx-fl">${tr('Built from')}${dxTip(tr('Built from'), esc(tr('Distinct people behind this persona, counted through the signals the persona links to. A session the researcher set aside counts nowhere.')))}</span>
        <b class="pe-fact">${esc(trn(people,'{n} interview','{n} interviews','{n} wywiad','{n} wywiady','{n} wywiadów'))}</b>${off ? `<span class="dx-fs">${esc(tr('+{n} set aside').replace('{n}', off))}</span>` : ''}</div>
      <div><span class="dx-fl">${tr('Sources')}${dxTip(tr('Heard {h} · Read {r}').replace('{h}', heard.length).replace('{r}', read.length), esc(tr('Solid = heard in your own sessions (signals). Striped = read in published research or data (evidence).')))}</span>
        <b class="pe-fact">${heard.length + read.length}</b><span class="dx-split"><i style="flex:${heard.length} 1 0"></i><i class="ev" style="flex:${read.length} 1 0"></i></span></div>
      <div><span class="dx-fl">${tr('Readiness score')}${dxTip(tr('What is the readiness score?'), peLevelTip(lv), 'right')}</span>
        ${levelMeter(lv, '', true)}</div>
    </section>`;

  /* frustrations and typical behaviour: one card each, the words first */
  const pcard = (emo, label, title, text, link)=> `<article class="pe-cd">
      <div class="pe-cd-k"><span class="pe-emo" aria-hidden="true">${emo}</span>${esc(label)}</div>
      <div class="pe-cd-t">${link ? `<a class="xref" data-goto="${esc(link)}">${esc(title)}</a>` : esc(title)}</div>
      ${text ? `<p class="pe-cd-q">${esc(text)}</p>` : ''}
    </article>`;
  const painCards = peItems(section(e.body,'Pains')).map(it=>{
    const sig = (peLinks(it.text).find(x=> x.e.type==='Signal') || {}).e;
    const title = stripLinks(it.text.replace(MD_LINK,'')).replace(/^[\s—–-]+/,'') || (sig ? sig.title : '');
    const said = it.subs.map(x=> stripLinks(x).replace(/^In (her|his|their) words:\s*/i,'')).join(' ');
    const quote = sig ? (firstQuote(sig.body)||'').replace(/^["“]|["”]$/g,'') : '';
    return pcard('😡', tr('Pain'), title, quote ? `“${quote}”` : said, sig && sig.id);
  }).join('');
  const jobCards = peItems(section(e.body,'Jobs to be Done')).map(it=>{
    const txt = stripLinks(it.text.replace(MD_LINK, '')).trim();
    const m = txt.match(/^(When [^,]+),\s*(.*)$/i) || txt.match(/^(Kiedy [^,]+),\s*(.*)$/i);
    const src = peLinks(it.text)[0];
    return pcard('💤', tr('Typical behavior'), m ? m[1] : txt, m ? m[2].charAt(0).toUpperCase()+m[2].slice(1) : '', src && src.e.id);
  }).join('');

  /* ideas */
  const ideaRows = ideas.map(x=>{
    const i = x.e;
    return `<tr>
        <td><a class="xref pe-t" data-goto="${esc(i.id)}">${esc(i.title.replace(/^Idea:?\s*\d*\s*/,''))}</a></td>
        <td>${votePillHtml(i)}</td>
        <td class="pe-sub">${esc(stripLinks(i.fm.description||'')) || '—'}</td>
      </tr>`;
  }).join('');

  const head = (title, sub, sec)=> `<div class="pe-h2row"><div><h2 class="dx-h2">${title}</h2>${sub ? `<p class="pe-h2sub">${sub}</p>` : ''}</div>${canEdit(e) ? `<button type="button" class="dx-btn dx-btn-line dx-btn-sm" data-pe-edit="${esc(sec)}">${tr('Edit')}</button>` : ''}</div>`;
  const cards = (title, sec, html)=> html ? `<section class="dx-sec">${head(title, '', sec)}<div class="pe-cards">${html}</div></section>` : '';
  const ideasSec = ideaRows ? `<section class="dx-sec">${head(tr('Product ideas'), '', 'Ideas for this persona')}
      <div class="dx-card"><table class="dx-table pe-table"><thead><tr><th style="width:36%">${tr('Idea')}</th><th style="width:80px">${tr('Votes')}</th><th>${tr('Description')}</th></tr></thead><tbody>${ideaRows}</tbody></table></div></section>` : '';

  /* everything behind her */
  const interviews = [...new Map(heard.flatMap(h=> peSourcesOf(h.e).tr).map(x=> [x.e.id, x])).values()];
  const col = (label, n, items)=> items.length ? `<nav class="pe-fcol"><b>${label} <span>${n}</span></b>${items.join('')}</nav>` : '';
  const footer = `<footer class="pe-foot">
      <div class="pe-foot-h"><span>${esc(tr('Everything behind {name}').replace('{name}', first))}</span><small>${tr('Every file this page is built from.')}</small></div>
      ${col('● '+tr('Heard'), heard.length, heard.map(x=> peLink(x)))}
      ${col('○ '+tr('Read'), read.length, read.map(x=> peLink(x)))}
      ${col(tr('Interviews'), interviews.length, interviews.map(x=> peLink({e:x.e, label:x.e.title + (isExcluded(x.e) ? ' · '+tr('set aside') : '')})))}
      ${col(tr('Archetypes'), archs.length, archs.map(x=> peLink(x)))}
    </footer>`;
  return { top: hero + cards(tr('Frustrations'), 'Pains', painCards) + cards(tr('Typical behavior'), 'Jobs to be Done', jobCards) + facts + ideasSec, footer };
}

function personaEditorialWire(root, e){
  wireTalkButton(root, e, peFirst(e));
  wireVotes(root);
  wirePeek(root);
  const face = root.querySelector('.pe-portrait');
  if(face){
    face.insertAdjacentHTML('beforeend', `<label class="pe-pic"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" hidden><span>${tr('Change photo')}</span></label>`);
    face.querySelector('.pe-pic input').onchange = ev=>{ const f = ev.target.files[0]; ev.target.value = ''; if(f) savePersonaPhoto(e, f); };
  }
  root.querySelectorAll('a.xref[data-goto]').forEach(a=> a.onclick = ev=>{ ev.preventDefault(); location.hash = '#'+a.dataset.goto; });
  root.querySelectorAll('[data-pe-edit]').forEach(b=> b.onclick = ()=> editSection(e, b.dataset.peEdit));
}

/* A persona's own photo, from the hover on the portrait. Any size up to
   PHOTO_MAX_MB is shrunk here, in the browser: longest side 512px, WebP (JPEG
   where the browser can't encode WebP — Safari), quality stepped down until it
   fits. With a folder open it lands next to the avatars as Personas/photos/<Name>.webp
   and `picture:` points at it — never base64 in the .md, which every agent
   reading the persona would pay for in tokens. The demo sandbox has no folder,
   so there it goes inline. */
const PHOTO_MAX_MB = 25;
async function photoShrink(file, maxBytes){
  if(!/^image\//.test(file.type)) throw new Error(tr('That file is not an image'));
  if(file.size > PHOTO_MAX_MB * 1048576) throw new Error(tr('That photo is {n} MB — the limit is {m} MB. Make it smaller and try again.').replace('{n}', (file.size / 1048576).toFixed(1)).replace('{m}', PHOTO_MAX_MB));
  const bmp = await createImageBitmap(file);
  const r = Math.min(1, 512 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height); bmp.close();
  let blob;
  for(const q of [.82, .7, .55, .4]){
    blob = await new Promise(res=> c.toBlob(res, 'image/webp', q));
    if(!blob || blob.type !== 'image/webp') blob = await new Promise(res=> c.toBlob(res, 'image/jpeg', q));
    if(blob.size <= maxBytes) break;
  }
  return blob;
}
async function savePersonaPhoto(e, file){
  e = await ensureWritable(e); if(!e) return;
  const local = !!(e.handle && DIRHANDLE);
  let blob;
  try{ blob = await photoShrink(file, local ? 150000 : 60000); }
  catch(err){ toast(err.message && !/decode|bitmap|source/i.test(err.message) ? err.message : tr('Could not read that image')); return; }
  const uri = await new Promise((res, rej)=>{ const fr = new FileReader(); fr.onload = ()=> res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
  let md;
  if(local){
    const dir = e.file.replace(/[^/]*$/, ''), name = 'photos/' + e.file.replace(/^.*\//, '').replace(/\.md$/i, '') + (blob.type === 'image/webp' ? '.webp' : '.jpg');
    try{
      let d = DIRHANDLE; const parts = (dir + name).split('/');
      for(const p of parts.slice(0, -1)) d = await d.getDirectoryHandle(p, {create: true});
      const w = await (await d.getFileHandle(parts.at(-1), {create: true})).createWritable(); await w.write(blob); await w.close();
    }catch(err){ toast(tr('Could not write the photo file — nothing was saved')); return; }
    picStore(dir + name, uri);
    md = setFmField(e.md, 'picture', name);
  } else md = setPictureInMd(e.md, uri);
  if(await saveEntityText(e, md)){ openDetail(e.id); toast(tr('Photo saved ({k} KB) ✓').replace('{k}', Math.round(blob.size / 1024)), {label: 'Undo', fn: undoLastSave}); }
}
