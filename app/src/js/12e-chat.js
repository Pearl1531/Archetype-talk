/* ---------- Conversations: talk to a persona like to a person ----------
   A page of its own (#chat, #chat:<id>), full width: a start screen (persona
   chips over the composer — the first message creates the conversation) or
   one thread; past conversations behind the History button. A 1:1 chat or a
   group of personas, each group a thread of its own. Replies come from the AI provider switched on in
   Settings ▸ AI providers (12d), grounded in the persona's file, the Signals
   and Evidence linked to her and Product Context.md.

   What this is NOT: research. A conversation never creates a Signal or
   Evidence (CLAUDE.md hard rule 1) — the page says "simulated" on every
   thread, and the history lives in this browser only (store, per project
   copy), never in the project folder, so no agent can mistake it for data.
   Outbound: a Signal marked special_category, or heard in a session whose
   consent_scope lacks ai_processing, stays home — the thread header counts
   what was left out. */
let CHAT_ACTIVE = false, CHAT_SEL = null, CHAT_NEW = null, CHAT_BUSY = null;
const chatBtn = document.getElementById('chatBtn');
const CHAT_SCOPE = () => WS === 'demo' ? 'demo' : 'project:' + ((typeof DIRHANDLE !== 'undefined' && DIRHANDLE && DIRHANDLE.name) || '');
function chatAll(){ try { const a = JSON.parse(store.get('chats') || '[]'); return Array.isArray(a) ? a : []; } catch(e){ return []; } }
function chatSave(all){ store.set('chats', JSON.stringify(all)); }
const chatMine = () => chatAll().filter(c=> c.scope === CHAT_SCOPE()).sort((a,b)=> b.updated - a.updated);
function chatPut(c){ const all = chatAll().filter(x=> x.id !== c.id); c.updated = Date.now(); all.push(c); chatSave(all); }
const chatGet = id => chatAll().find(c=> c.id === id && c.scope === CHAT_SCOPE()) || null;
const chatPersonas = () => wsEntities().filter(e=> e.type === 'Persona');
const chatName = e => e ? peFirst(e) : tr('Someone who left');
const chatTitle = c => c.title || c.who.map(id=> chatName(ENTITIES[id])).join(', ');
const chatTime = t => new Date(t).toLocaleTimeString(LANG === 'pl' ? 'pl-PL' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
const chatDay = t => { const d = new Date(t), now = new Date();
  return d.toDateString() === now.toDateString() ? chatTime(t) : d.toLocaleDateString(LANG === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'short' }); };

/* ---- what a persona knows: the same slice /persona-talk reads ----
   graph_index.py slice_for, ported: two hops out from the persona plus every
   file that links to her, and Product Context.md. Kept from it: Archetypes,
   Signals, Evidence and Transcripts (their excerpts — a ## Full transcript
   section stays home: the Signals already carry the quotes). Left out on
   purpose: Ideas and Hypotheses (the skill never lets a persona talk roadmap),
   Competitors (the skill's competitor mode is off by default). Outbound
   filter: a Signal or Transcript marked special_category, or heard in a
   session whose consent_scope lacks ai_processing, stays in this browser;
   a set-aside (excluded) session is skipped like everywhere else. */
const chatFlag = v => v && v !== 'false' && !(Array.isArray(v) && !v.length);
const chatNoAi = t => Array.isArray(t.fm.consent_scope) && !t.fm.consent_scope.includes('ai_processing');
const CHAT_KIND = { Archetype: 'A', Signal: 'S', Evidence: 'E', Transcript: 'T' };
/* a file's out-links as graph_index.py counts them: Markdown links in the body,
   plus the frontmatter keys that name files by title (its REF_KEYS) */
const CHAT_REF_KEYS = { evidences: 'Evidence', competitors: 'Competitors', mentioned_in: 'Transcripts', same_participant_as: 'Transcripts', idea: 'Ideas', signals: 'Signals' };
function chatLinks(e, byTitle){
  const out = peLinks(e.body).map(l=> l.e);
  for(const [k, dir] of Object.entries(CHAT_REF_KEYS)){
    [].concat(e.fm[k] || []).forEach(t=>{ t = String(t).trim(); const x = byTitle.get(dir + '/' + t) || byTitle.get('/' + t); if(x && x !== e) out.push(x); });
  }
  return out;
}
function chatContext(p, c){
  const open = !!(c && c.sensitive);   // the researcher let this conversation carry special-category data
  const byTitle = new Map();
  wsEntities().forEach(e=>{
    const dir = e.file.split('/')[0], stem = e.file.split('/').pop().replace(/\.md$/, '');
    [String(e.fm.title || stem), stem].forEach(t=>{ if(!byTitle.has(dir + '/' + t)) byTitle.set(dir + '/' + t, e); if(!byTitle.has('/' + t)) byTitle.set('/' + t, e); });
  });
  const seen = new Set([p.id]); let front = [p];
  for(let d = 0; d < 2; d++){
    const nx = [];
    front.forEach(e=> chatLinks(e, byTitle).forEach(x=>{ if(!seen.has(x.id)){ seen.add(x.id); nx.push(x); } }));
    front = nx;
  }
  wsEntities().forEach(e=>{ if(chatLinks(e, byTitle).some(x=> x.id === p.id)) seen.add(e.id); });
  let held = 0;
  const items = [...seen].map(id=> ENTITIES[id]).filter(e=> e && CHAT_KIND[e.type] && !!e.fm.demo === !!p.fm.demo).filter(e=>{
    if(e.type === 'Transcript'){
      if(isExcluded(e)) return false;
      if(chatNoAi(e) || (!open && chatFlag(e.fm.special_category))){ held++; return false; }
    }
    if(e.type === 'Signal' && ((!open && chatFlag(e.fm.special_category)) || peLinks(e.body).some(l=> l.e.type === 'Transcript' && chatNoAi(l.e)))){ held++; return false; }
    return true;
  });
  const order = 'ASET', ref = {}, key = new Map(), n = {};   // [S3] → file, and back
  items.sort((x, y)=> order.indexOf(CHAT_KIND[x.type]) - order.indexOf(CHAT_KIND[y.type]) || x.title.localeCompare(y.title))
    .forEach(e=>{ const k = CHAT_KIND[e.type]; n[k] = (n[k] || 0) + 1; ref[k + n[k]] = e.id; key.set(e.id, k + n[k]); });
  return { items, held, ref, key, signals: items.filter(e=> e.type === 'Signal'), count: n };
}
const chatClean = md => String(md || '').replace(/\r/g, '').replace(/^﻿?\s*/, '').replace(/data:image\/[^\s)"']+/g, '(inline image)').trim();
const chatNoFull = md => chatClean(md).replace(/\n## Full transcript[^\n]*\n[\s\S]*?(?=\n## |$)/i, '\n## Full transcript\n(not included here)');
const CHAT_SKILL_TXT = ((document.getElementById('skillPersonaTalk') || {}).textContent || '').replace(/<\\\/script/g, '</script').trim();
/* how many special-category files this conversation's personas stand on (consent-held ones never count: those stay home regardless) */
const chatSensitiveN = c => c.who.reduce((n, id)=> { const p = ENTITIES[id]; return n + (p ? chatContext(p, { sensitive: true }).items.length - chatContext(p).items.length : 0); }, 0);
/* two parts: the rules (identical for every call → cached) and this persona's slice */
function chatSystem(p, c){
  const { items, key } = chatContext(p, c);
  const others = c.who.filter(id=> id !== p.id).map(id=> chatName(ENTITIES[id]));
  const pref = typeof PREFS !== 'undefined' ? PREFS : {};
  const rules = `# Running inside the Archetype Talk app — read this first
You are the persona-talk skill whose files follow, running in the app's Conversations page instead of a coding agent. Where this section and the skill differ, this section wins.
- You have no tools and no file access. The persona's whole slice is below this section, already read for you: Step 0 (the card cache), the full read and "back to the files" all mean the sections below. Never claim to have read, written or saved a file.
- Skip the grounding line, the preamble flags and the opening scene: the app shows those itself.
- The interview happens in a chat window. Keep the persona's spoken voice, at the length a person would type in a messaging app.
- Markers: use exactly the markers the slice gives each file ([S3], [E1], [A2], [T1]). They do NOT restart per reply. The app turns them into links.
- Output: the persona's reply, then a line containing only ---, then the researcher block, exactly as "Response format" describes. Nothing else.
- [exit] and the debrief: you cannot write Research backlog.md or Hypotheses/. Put the proposed backlog rows and hypotheses in the researcher block as text for the researcher to copy, and say plainly that nothing was saved.
- Not available here: images and mockups, [speak], competitor mode. If asked, say so in the researcher block, not in character.
- Researcher preferences: name ${pref.name ? `"${pref.name}"` : 'not set'} · context tier default ${pref.context_tier_default || 'auto'} · self-check ${pref.judge_enabled === false ? 'off' : 'on'}${pref.judge_override ? ` · judge instruction (override): ${pref.judge_override}` : ''} · demo tips ${pref.demo_tips === false ? 'off' : 'on'}.
${others.length ? `- Panel: this is a group conversation; also present: ${others.join(', ')}. You play ONLY ${chatName(p)} and write only her or his own reply and researcher block — the others answer in their own turns. Their lines reach you as "Name: text", the researcher's as "Researcher: text". If ${chatName(p)} has nothing to add to the last message, reply with exactly: (pass)\n` : ''}
${CHAT_SKILL_TXT}`;
  const slice = `# The slice for ${chatName(p)} (today is ${new Date(graphNow()).toISOString().slice(0, 10)})

## Persona file — ${p.file}
${chatClean(p.md)}

${items.map(e=> `## [${key.get(e.id)}] ${e.type} — ${e.file}\n${e.type === 'Transcript' ? chatNoFull(e.md) : chatClean(e.md)}`).join('\n\n') || '(nothing linked yet)'}

## Product Context.md
${chatClean(PRODUCT_RAW) || '(no product context)'}`;
  return { rules, slice };
}
/* the thread as one persona sees it: her own lines are "assistant", everyone else's "user" */
function chatTurns(c, pid){
  const group = c.who.length > 1, out = [];
  c.msgs.forEach(m=>{
    if(m.role === 'system' || m.pass) return;
    const mine = m.role === 'persona' && m.pid === pid;
    // her own turns go back whole — reply and researcher block — so the skill can see which tips and notes it already gave
    const text = mine ? (m.note ? m.text + '\n\n---\n' + m.note : m.text) : group ? `${m.role === 'user' ? 'Researcher' : chatName(ENTITIES[m.pid])}: ${m.text}` : m.text;
    const role = mine ? 'assistant' : 'user', last = out[out.length - 1];
    if(last && last.role === role) last.content += '\n\n' + text; else out.push({ role, content: text });
  });
  return out;
}

/* ---- the providers: Anthropic's Messages API, Gemini, and the OpenAI-shaped rest (OpenAI, Mistral, a local model) ---- */
async function chatCall(host, sys, msgs){
  const system = sys.rules + '\n\n' + sys.slice;
  const key = aiKey(host), model = aiModel(host);
  const bad = async r=>{ let m = ''; try { const j = await r.json(); m = (j.error && (j.error.message || j.error)) || ''; } catch(e){} return new Error(`${r.status} ${typeof m === 'string' ? m : ''}`.trim()); };
  if(host === 'https://api.anthropic.com'){
    const fallback = /^claude-(opus-5-5|opus-5|sonnet-5-5|fable-5-[12])$/.test(model);   // a policy decline re-runs on a fallback model in the same call
    const headers = { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2026-10-21', 'anthropic-dangerous-direct-browser-access': 'true' };
    if(fallback) headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
    const r = await fetch(host + '/v1/messages', { method: 'POST', headers,
      // the rules are the same for every persona and the slice for every turn of
      // one persona: each is its own cached block, so a turn pays for its new lines only
      body: JSON.stringify({ model, max_tokens: 16000, output_config: { effort: 'medium' }, ...(fallback ? { fallbacks: 'default' } : {}),
        system: [{ type: 'text', text: sys.rules, cache_control: { type: 'ephemeral' } }, { type: 'text', text: sys.slice, cache_control: { type: 'ephemeral' } }],
        messages: msgs }) });
    if(!r.ok) throw await bad(r);
    const j = await r.json();
    if(j.stop_reason === 'refusal') throw new Error(tr('The model declined to answer this.'));
    return (j.content || []).filter(b=> b.type === 'text').map(b=> b.text).join('').trim();
  }
  if(host === 'https://generativelanguage.googleapis.com'){
    const r = await fetch(`${host}/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: msgs.map(m=> ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) }) });
    if(!r.ok) throw await bad(r);
    const j = await r.json();
    return ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p=> p.text || '').join('').trim();
  }
  const r = await fetch(host + '/v1/chat/completions', { method: 'POST',
    headers: { 'content-type': 'application/json', ...(key ? { authorization: 'Bearer ' + key } : {}) },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, ...msgs] }) });
  if(!r.ok) throw await bad(r);
  const j = await r.json();
  return String((((j.choices || [])[0] || {}).message || {}).content || '').trim();
}

/* ---- sending: the researcher's line, then each persona in turn ---- */
async function chatSend(c, text){
  const host = chatHost(c); if(!host) return;
  c.msgs.push({ role: 'user', text, t: Date.now() }); chatPut(c); chatRender();
  for(const pid of c.who){
    const p = ENTITIES[pid]; if(!p) continue;
    CHAT_BUSY = { id: c.id, pid }; chatRender();
    try {
      const raw = (await chatCall(host, chatSystem(p, c), chatTurns(c, pid))).replace(/<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi, '').trim();
      const cut = raw.search(/\n\s*-{3,}\s*\n/);
      const said = (cut < 0 ? raw : raw.slice(0, cut)).trim(), note = cut < 0 ? '' : raw.slice(cut).replace(/^\s*-{3,}\s*/, '').trim();
      const ctx = chatContext(p, c).ref, src = [...new Set([...raw.matchAll(/\[([SEAT]\d+)\]/g)].map(m=> m[1]).filter(k=> ctx[k]))];
      const text = said.replace(/\s*\[[SEAT]\d+\]/g, '').trim();
      const pass = c.who.length > 1 && /^\(?pass\)?\.?$/i.test(text);
      if(!text && !pass) throw new Error(tr('Empty reply'));
      c.msgs.push({ role: 'persona', pid, text, note, t: Date.now(), src, pass, ctx });
    } catch(err){
      c.msgs.push({ role: 'system', err: true, text: tr('{p} could not answer: {e}').replace('{p}', chatName(p)).replace('{e}', err.message || String(err)), t: Date.now() });
      CHAT_BUSY = null; chatPut(c); chatRender(); return;   // one failure stops the round: the next persona would answer a gap
    }
    chatPut(c);
  }
  CHAT_BUSY = null; chatRender();
}
const chatHost = c => { const r = aiReady(); return c && r.includes(c.host) ? c.host : r.includes(CHAT_HOST) ? CHAT_HOST : r[0] || null; };
let CHAT_HOST = null;   // the provider picked on the start screen, before a conversation exists

/* ---- the page: one full-width column. The start screen is a headline, the
   personas as chips and the composer; a thread is the messages and the
   composer. The history waits behind a button, in a panel that slides over. ---- */
const CH_I = {
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  rail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>',
  clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>',
  send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  pen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  bin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
};
const chatFaces = (c, cls) => `<span class="ch-faces">${c.who.slice(0, 3).map(id=> faceHtml(ENTITIES[id], cls, chatName(ENTITIES[id]))).join('')}</span>`;
const chatMenu = c => rowMenuHtml('chm-' + c.id, [
  `<button type="button" role="menuitem" data-chren="${esc(c.id)}">${CH_I.pen}${tr('Rename')}</button>`,
  `<button type="button" role="menuitem" class="danger" data-chdel="${esc(c.id)}">${CH_I.bin}${tr('Delete')}</button>`]);

function chatListHtml(list){
  return `<aside class="ch-list" id="chHist" popover aria-label="${esc(tr('History'))}">
    <b class="ch-list-head">${tr('History')}</b>
    ${list.length ? list.map(c=>{
      const last = [...c.msgs].reverse().find(m=> m.role !== 'system' && !m.pass);
      const who = last ? (last.role === 'user' ? tr('You') : chatName(ENTITIES[last.pid])) + ': ' : '';
      return `<div class="ch-item${c.id === CHAT_SEL ? ' on' : ''}">
        <a class="ch-item-link" href="#chat:${esc(c.id)}">${chatFaces(c, 'ch-face-sm')}
          <span class="ch-item-txt"><b>${esc(chatTitle(c))}</b><span>${last ? esc(who + last.text) : esc(tr('No messages yet'))}</span></span>
          <time>${esc(chatDay(c.updated))}</time></a>${chatMenu(c)}</div>`;
    }).join('') : `<p class="ch-none">${tr('No conversations yet.')}</p>`}
  </aside>`;
}
/* the top row: History left, the thread's title in the middle, New conversation right */
function chatTopHtml(c, n){
  let mid = '';
  if(c){
    const held = c.who.reduce((k, id)=> k + (ENTITIES[id] ? chatContext(ENTITIES[id], c).held : 0), 0);
    const grounded = c.who.map(id=> ENTITIES[id] ? chatContext(ENTITIES[id], c).signals.length : 0).reduce((a, b)=> a + b, 0);   // the slice also carries archetypes, evidence and transcript excerpts
    mid = `<div class="ch-title">${chatFaces(c, 'ch-face-sm')}<div><b>${esc(chatTitle(c))}</b><span>${tr('Simulated conversation')} · ${trn(grounded, 'grounded in {n} signal', 'grounded in {n} signals', 'oparta na {n} sygnale', 'oparta na {n} sygnałach', 'oparta na {n} sygnałach')}${held ? ' · ' + trn(held, '{n} file kept local', '{n} files kept local', '{n} plik zostaje lokalnie', '{n} pliki zostają lokalnie', '{n} plików zostaje lokalnie') : ''}${chatSensitiveN(c) && !c.sensitive ? ` · <button type="button" class="ch-linkbtn" data-chsens>${tr('Include sensitive data')}</button>` : c.sensitive ? ` · ${tr('sensitive data included')}` : ''}</span></div>${chatMenu(c)}</div>`;
  }
  return `<div class="ch-top">
    <span class="ch-top-l">
      <button type="button" class="ch-pill ch-rail" data-chrail aria-pressed="${document.body.classList.contains('chat-rail')}" aria-label="${esc(tr('Show menu'))}" title="${esc(tr('Show menu'))}">${CH_I.rail}</button>
      <button type="button" class="ch-pill" popovertarget="chHist">${CH_I.clock}<span>${tr('History')}</span>${n ? `<span class="ch-count">${n}</span>` : ''}</button>
    </span>
    ${mid}
    ${c ? `<button type="button" class="ch-pill" data-chnew>${CH_I.plus}<span>${tr('New conversation')}</span></button>` : ''}
  </div>`;
}
function chatComposeHtml(c, ph, ready){
  const host = chatHost(c), all = aiReady();
  if(!host) return `<div class="ch-nokey">${tr('To chat, switch on an AI provider and add its key — it stays in this browser.')} <a class="btn btn-primary btn-sm" href="#settings">${tr('Open Settings')}</a></div>`;
  return `<form class="ch-compose" id="chForm">
      <textarea id="chInput" rows="1" placeholder="${esc(ph)}" aria-label="${esc(tr('Message'))}" ${CHAT_BUSY ? 'disabled' : ''}></textarea>
      ${all.length > 1 ? `<select id="chHost" aria-label="${esc(tr('AI provider'))}">${all.map(h=> `<option value="${esc(h)}" ${h === host ? 'selected' : ''}>${esc(aiHostLabel(h))}</option>`).join('')}</select>` : ''}
      <button type="submit" class="ch-send" aria-label="${esc(tr('Send'))}" ${CHAT_BUSY || !ready ? 'disabled' : ''}>${CH_I.send}</button></form>
    <p class="ch-foot">${tr('Simulated from your research — a source of questions, never of data.')} ${esc(tr('Messages go to {h}; the history stays in this browser.').replace('{h}', aiHostLabel(host)))}</p>`;
}
function chatStartHtml(){
  const ps = chatPersonas(), sel = ps.filter(p=> CHAT_NEW.has(p.id));
  return `<section class="ch-start">
    <h2>${tr('Talk to your personas')}</h2>
    <p>${tr('Every answer comes from your research. Pick one persona, or several for a group conversation.')}</p>
    ${ps.length ? `<div class="ch-chips" role="group" aria-label="${esc(tr('Personas'))}">${ps.map(p=>{ const on = CHAT_NEW.has(p.id);
        return `<button type="button" class="ch-chip${on ? ' on' : ''}" aria-pressed="${on}" data-chpick="${esc(p.id)}">${faceHtml(p, 'ch-face-xs', chatName(p))}<span>${esc(chatName(p))}</span></button>`; }).join('')}</div>
      <div class="ch-dock">${chatComposeHtml(null, sel.length ? tr('Write to {p}…').replace('{p}', sel.map(chatName).join(', ')) : tr('Pick a persona above, then write…'), sel.length)}</div>`
    : `<p class="ch-none">${tr('No personas in this workspace yet.')}</p>`}
  </section>`;
}
function chatMsgHtml(c, m, prev){
  if(m.role === 'system') return `<div class="ch-sys${m.err ? ' err' : ''}">${esc(m.text)}</div>`;
  if(m.pass) return '';
  const mine = m.role === 'user', p = ENTITIES[m.pid];
  const cont = prev && !prev.pass && prev.role === m.role && prev.pid === m.pid && m.t - prev.t < 120000;   // a run of lines from one speaker
  const chips = (m.src || []).map(k=> { const id = m.ctx && m.ctx[k], e = id && ENTITIES[id];
    return e ? `<a class="ch-src" href="#${esc(id)}" title="${esc(e.title)}">${esc(k)}</a>` : ''; }).join('');
  return `<div class="ch-msg ${mine ? 'me' : 'them'}${cont ? ' cont' : ''}">
    ${mine ? '' : `<span class="ch-av">${cont ? '' : faceHtml(p, 'ch-face', chatName(p))}</span>`}
    <div class="ch-col">
      ${!mine && c.who.length > 1 && !cont ? `<span class="ch-who">${esc(chatName(p))}</span>` : ''}
      <div class="ch-bubble">${esc(m.text).replace(/\n/g, '<br>')}</div>
      <span class="ch-meta"><time>${chatTime(m.t)}</time>${chips ? `<span class="ch-srcs" aria-label="${esc(tr('Based on'))}">${chips}</span>` : ''}</span>
      ${m.note ? `<details class="ch-note"><summary>${tr('Researcher context')}</summary><div>${chatNoteHtml(m)}</div></details>` : ''}
    </div></div>`;
}
/* the researcher block: light markdown (bold, italics, lines), markers as links */
function chatNoteHtml(m){
  return esc(m.note.replace(/^\s*(\*\*|#+\s*)?(Researcher context|Kontekst badacza)(\*\*)?\s*\n/i, '')).replace(/^#+\s*/gm, '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<i>$2</i>')
    .replace(/\[([SEAT]\d+)\]/g, (x, k)=> m.ctx && m.ctx[k] ? `<a class="ch-src" href="#${esc(m.ctx[k])}">${k}</a>` : x).replace(/\n/g, '<br>');
}
function chatThreadHtml(c){
  const busy = CHAT_BUSY && CHAT_BUSY.id === c.id ? ENTITIES[CHAT_BUSY.pid] : null;
  return `<section class="ch-thread">
    <div class="ch-body" id="chBody" aria-live="polite"><div class="ch-msgs">
      ${c.msgs.map((m, i)=> chatMsgHtml(c, m, c.msgs[i-1])).join('')}
      ${busy ? `<div class="ch-msg them"><span class="ch-av">${faceHtml(busy, 'ch-face', chatName(busy))}</span><div class="ch-col"><div class="ch-bubble ch-typing" aria-label="${esc(tr('{p} is typing').replace('{p}', chatName(busy)))}"><i></i><i></i><i></i></div></div></div>` : ''}
    </div></div>
    <div class="ch-dock">${chatComposeHtml(c, tr('Write to {p}…').replace('{p}', chatTitle(c)), true)}</div>
  </section>`;
}
/* a new conversation, made by the first message sent from the start screen */
function chatCreate(who){
  const c = { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), scope: CHAT_SCOPE(), who, title: '', created: Date.now(), msgs: [], host: chatHost(null) || '' };
  c.msgs.push({ role: 'system', t: Date.now(), text: who.length > 1
    ? tr('{list} joined the conversation').replace('{list}', who.map(id=> chatName(ENTITIES[id])).join(', '))
    : tr('You are chatting with {p}').replace('{p}', chatName(ENTITIES[who[0]])) });
  chatPut(c); CHAT_NEW = null; CHAT_SEL = c.id; suppressRoute = true; location.hash = '#chat:' + c.id;
  return c;
}
function chatRender(){
  if(!CHAT_ACTIVE) return;
  const c = CHAT_SEL && chatGet(CHAT_SEL), list = chatMine();
  if(!c && !CHAT_NEW){ const ps = chatPersonas(); CHAT_NEW = new Set(ps.length === 1 ? [ps[0].id] : []); }
  const keep = document.getElementById('chInput'), draft = keep ? keep.value : '';
  grid.className = 'ch-wrap';
  grid.innerHTML = chatTopHtml(c, list.length) + chatListHtml(list) + (c ? chatThreadHtml(c) : chatStartHtml());
  wirePeek(grid, '[data-chpick]', b=> b.dataset.chpick);   // who is this persona? — on hover/focus
  const body = document.getElementById('chBody'); if(body) body.scrollTop = body.scrollHeight;
  const inp = document.getElementById('chInput');
  if(inp){ inp.value = draft; const fit = ()=>{ inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 200) + 'px'; }; fit(); inp.oninput = fit;
    inp.onkeydown = ev=>{ if(ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing){ ev.preventDefault(); document.getElementById('chForm').requestSubmit(); } };
    if(!CHAT_BUSY) inp.focus(); }
  const form = document.getElementById('chForm');
  if(form) form.onsubmit = ev=>{ ev.preventDefault(); const v = inp.value.trim(); if(!v || CHAT_BUSY) return;
    const cc = c || (CHAT_NEW && CHAT_NEW.size ? chatCreate([...CHAT_NEW]) : null); if(!cc) return;
    inp.value = ''; chatSend(cc, v); };
  const hs = document.getElementById('chHost'); if(hs) hs.onchange = ()=>{ if(c){ c.host = hs.value; chatPut(c); } else CHAT_HOST = hs.value; };
}
grid.addEventListener('click', ev=>{
  if(!CHAT_ACTIVE) return;
  const t = ev.target;
  if(t.closest('[data-chnew]')){ CHAT_NEW = null; CHAT_SEL = null; suppressRoute = true; location.hash = '#chat'; chatRender(); return; }
  const rail = t.closest('[data-chrail]');
  if(rail){ rail.setAttribute('aria-pressed', String(document.body.classList.toggle('chat-rail'))); return; }
  const pick = t.closest('[data-chpick]');
  if(pick){ const id = pick.dataset.chpick; CHAT_NEW.has(id) ? CHAT_NEW.delete(id) : CHAT_NEW.add(id); chatRender(); return; }
  if(t.closest('[data-chsens]')){
    const c = chatGet(CHAT_SEL); if(!c) return;
    const host = chatHost(c), eu = PREFS.data_residency === 'EU' ? '\n\n' + tr('Keep processing in the EU is on — check that this provider processes in the EU.') : '';
    if(!confirm(tr('Send special-category data (GDPR Art. 9 — e.g. health) to {h} in this conversation?').replace('{h}', host ? aiHostLabel(host) : tr('the AI provider')) + '\n\n'
      + tr('These files make the persona truer, but their content leaves this computer for the provider. It applies to this conversation only, and files without consent for AI processing still stay here.') + eu)) return;
    c.sensitive = true; c.msgs.push({ role: 'system', t: Date.now(), text: tr('Sensitive data included from here on') }); chatPut(c); chatRender(); return;
  }
  const ren = t.closest('[data-chren]');
  if(ren){ t.closest('[popover]')?.hidePopover(); const c = chatGet(ren.dataset.chren); if(!c) return;
    const v = prompt(tr('Name this conversation (empty = the participants’ names)'), c.title || '');
    if(v === null) return; c.title = v.replace(/\s+/g, ' ').trim().slice(0, 80); chatPut(c); chatRender(); return; }
  const del = t.closest('[data-chdel]');
  if(del){ t.closest('[popover]')?.hidePopover(); const c = chatGet(del.dataset.chdel); if(!c) return;
    if(!confirm(tr('Delete “{t}”?').replace('{t}', chatTitle(c)) + '\n\n' + tr('The conversation is removed from this browser for good — it cannot be undone.'))) return;
    chatSave(chatAll().filter(x=> x.id !== c.id)); if(CHAT_SEL === c.id){ CHAT_SEL = null; suppressRoute = true; location.hash = '#chat'; } chatRender(); return; }
});

function chatEnter(id){
  CHAT_ACTIVE = true; CHAT_SEL = id || null; if(id) CHAT_NEW = null;
  syncLinTheme(); chatBtn.classList.add('active'); document.body.classList.add('chat-open');
  galleryView.style.display = ''; detailView.classList.remove('active');
  hideGalleryChrome(); renderTabs();
  pageTitle.textContent = tr('Talk to AI persona');   // hidden on this page (body.chat-open); kept for the tab title
  chatRender(); window.scrollTo(0, 0);
}
function chatExit(){
  if(!CHAT_ACTIVE) return;
  CHAT_ACTIVE = false; CHAT_NEW = null; chatBtn.classList.remove('active'); document.body.classList.remove('chat-open', 'chat-rail');
  grid.className = ''; updatePageHead();
}
chatBtn.onclick = ()=>{ location.hash = '#chat'; };
