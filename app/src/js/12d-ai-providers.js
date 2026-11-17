/* ---------- AI providers: the one opt-in network hole ----------
   Off by default: the app talks to no AI. Switching a provider on adds its
   host to the page's connect-src (the <head> script in shell.html reads
   `at-ai-hosts` and writes the CSP before anything runs — so a change applies
   on reload). A key typed here lives ONLY in this browser's storage, keyed by
   host: never in the project folder, never in .env, never in an export — so
   an AI agent working in the repo (e.g. Claude Code) does not see it.
   "Remember on this device" keeps it in localStorage; off, it is gone when
   the tab closes (sessionStorage). Neither is encrypted on disk: the browser
   profile, not the project, is the trust boundary. */
const AI_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic (Claude)', host: 'https://api.anthropic.com', eu: false },
  { id: 'openai',    name: 'OpenAI',             host: 'https://api.openai.com', eu: false },
  { id: 'gemini',    name: 'Google Gemini',      host: 'https://generativelanguage.googleapis.com', eu: false },
  { id: 'mistral',   name: 'Mistral',            host: 'https://api.mistral.ai', eu: true },
];
// the same gate the <head> script applies — kept identical on purpose
const AI_HOST_RE = /^(https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(:\d{1,5})?|http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?)$/i;
const aiHosts = () => { try { const h = JSON.parse(localStorage.getItem('at-ai-hosts') || '[]'); return Array.isArray(h) ? h.filter(x=> AI_HOST_RE.test(x)) : []; } catch(e){ return []; } };
const aiSetHosts = h => { try { localStorage.setItem('at-ai-hosts', JSON.stringify([...new Set(h)])); } catch(e){ toast(tr('This browser blocks local storage — the setting cannot be kept')); } };
// what the running page actually allows (the policy was fixed at load)
const aiLive = () => ((document.querySelector('meta[http-equiv="Content-Security-Policy"]') || {}).content || '').match(/connect-src ([^;]*)/)?.[1].split(/\s+/) || [];
const aiKeyName = host => 'at-ai-key:' + host;
function aiKey(host){ try { return sessionStorage.getItem(aiKeyName(host)) || localStorage.getItem(aiKeyName(host)) || ''; } catch(e){ return ''; } }
function aiSetKey(host, key, remember){
  try {
    localStorage.removeItem(aiKeyName(host)); sessionStorage.removeItem(aiKeyName(host));
    if(key) (remember ? localStorage : sessionStorage).setItem(aiKeyName(host), key);
  } catch(e){ toast(tr('This browser blocks local storage — the key cannot be kept')); }
}
const aiRemembered = host => { try { return !!localStorage.getItem(aiKeyName(host)); } catch(e){ return false; } };
const aiHostLabel = h => h.replace(/^https?:\/\//, '');
/* which model each host runs — not a secret, so plain localStorage. Anthropic and
   Mistral have a sensible default; the others change names too often to guess. */
const AI_MODEL_DEFAULT = { 'https://api.anthropic.com': 'claude-opus-5-5', 'https://api.mistral.ai': 'mistral-large-latest' };
function aiModel(host){ try { return localStorage.getItem('at-ai-model:' + host) || AI_MODEL_DEFAULT[host] || ''; } catch(e){ return AI_MODEL_DEFAULT[host] || ''; } }
/* hosts a chat can use right now: switched on, allowed by the running page's policy, with a model (and a key, except a local model) */
const aiReady = () => aiHosts().filter(h=> aiLive().includes(h) && aiModel(h) && (aiKey(h) || /^http:\/\/(localhost|127\.0\.0\.1)/.test(h)));

function aiProvidersCard(){
  const on = aiHosts(), live = aiLive();
  const pending = on.some(h=> !live.includes(h)) || live.some(h=> /^https?:/.test(h) && h !== 'https://www.google.com' && !on.includes(h));
  const keyCtl = (host)=>{
    const has = !!aiKey(host);
    return `<div class="ai-key">
      ${has ? `<span class="key-state">${tr(aiRemembered(host) ? '•••••• saved on this device' : '•••••• until this tab closes')}</span>` : ''}
      <input class="set-input" type="password" data-aikey="${esc(host)}" placeholder="${esc(tr(has ? 'replace — paste & press Enter' : 'API key — paste & press Enter'))}" autocomplete="off" spellcheck="false" aria-label="${esc(tr('API key for {h}').replace('{h}', aiHostLabel(host)))}">
      ${has ? `<button class="btn btn-ghost btn-sm" data-aikeydel="${esc(host)}">${tr('Remove key')}</button>` : ''}
      <input class="set-input ai-model" data-aimodel="${esc(host)}" value="${esc(aiModel(host))}" placeholder="${esc(tr('model name, e.g. from the provider’s docs'))}" spellcheck="false" autocomplete="off" aria-label="${esc(tr('Model for {h}').replace('{h}', aiHostLabel(host)))}">
    </div>`;
  };
  const known = AI_PROVIDERS.map(p=>{
    const en = on.includes(p.host);
    return settingsRow(p.name, `<code>${esc(aiHostLabel(p.host))}</code> · ${tr(p.eu ? 'processing in the EU' : 'processing outside the EU')}`,
      `<label class="switch"><input type="checkbox" data-aihost="${esc(p.host)}" aria-label="${esc(tr('Allow {p}').replace('{p}', p.name))}" ${en ? 'checked' : ''}><i></i></label>`)
      + (en ? keyCtl(p.host) : '');
  }).join('');
  const custom = on.filter(h=> !AI_PROVIDERS.some(p=> p.host === h)).map(h=>
    settingsRow(aiHostLabel(h), tr(/^http:/.test(h) ? 'A model on this computer — nothing leaves the machine' : 'Your own endpoint'),
      `<button class="btn btn-ghost btn-sm" data-aihostdel="${esc(h)}">${tr('Remove')}</button>`) + keyCtl(h)).join('');
  return `<div class="set-card" id="aiCard">
      <h3>${tr('AI providers')}</h3>
      <div class="desc">${tr('Off by default: this app sends nothing to any AI. Switch on the provider you want to talk to personas through, and only its address is added to what the page may connect to — every other host stays blocked.')}</div>
      <div class="warn-box"><span>⚠</span><span>${tr('<b>Keys typed here stay in this browser only</b> — not in your project folder, not in <code>.env</code>, not in exports — so an AI assistant working in the repo (like Claude Code) never sees them. Without “Remember on this device” a key is forgotten when the tab closes. Browser storage is not encrypted: anyone with access to this computer’s user account could read it.')}</span></div>
      ${known}
      ${custom}
      ${settingsRow('Another endpoint', 'A bare address, e.g. <code>https://my-gateway.example.com</code> or a local model at <code>http://localhost:11434</code>. https only, except localhost.',
        `<input class="set-input" id="aiHostNew" placeholder="https://…" spellcheck="false" autocomplete="off"><button class="btn btn-ghost btn-sm" id="aiHostAdd">${tr('Add')}</button>`)}
      ${settingsRow('Remember keys on this device', 'Off: a key lasts until you close this tab. On: it stays in this browser until you remove it.',
        `<label class="switch"><input type="checkbox" id="aiRemember" aria-label="${esc(tr('Remember keys on this device'))}" ${store.get('ai-remember') === '1' ? 'checked' : ''}><i></i></label>`)}
      ${pending ? `<div class="set-banner ai-pending">${tr('Network access changes on reload — the page’s security policy is fixed when it opens.')} <button class="btn btn-primary btn-sm" id="aiReload">${tr('Reload now')}</button></div>` : ''}
    </div>`;
}

function aiProvidersWire(){
  const card = document.getElementById('aiCard'); if(!card) return;
  const redraw = ()=> { card.outerHTML = aiProvidersCard(); aiProvidersWire(); };
  const enable = h=>{
    const p = AI_PROVIDERS.find(x=> x.host === h);
    if(PREFS.data_residency === 'EU' && !(p ? p.eu : /^http:\/\/(localhost|127\.0\.0\.1)/.test(h))
       && !confirm(tr('Keep processing in the EU is on.') + '\n\n' + tr('{p} may process what you send outside the EU. Allow it anyway?').replace('{p}', p ? p.name : aiHostLabel(h)))) return false;
    aiSetHosts(aiHosts().concat(h)); return true;
  };
  card.querySelectorAll('[data-aihost]').forEach(sw=> sw.onchange = ()=>{
    const h = sw.dataset.aihost;
    if(sw.checked){ if(!enable(h)){ sw.checked = false; return; } }
    else { aiSetHosts(aiHosts().filter(x=> x !== h)); aiSetKey(h, ''); }   // switching off forgets the key too
    redraw();
  });
  card.querySelectorAll('[data-aihostdel]').forEach(b=> b.onclick = ()=>{ const h = b.dataset.aihostdel; aiSetHosts(aiHosts().filter(x=> x !== h)); aiSetKey(h, ''); redraw(); });
  const add = card.querySelector('#aiHostNew');
  const doAdd = ()=>{
    let v = add.value.trim().replace(/\/+$/, '');
    try { const u = new URL(v); v = u.origin; } catch(e){ v = ''; }
    if(!AI_HOST_RE.test(v)){ toast(tr('Use a bare https address, or http://localhost for a model on this computer')); add.focus(); return; }
    if(enable(v)) redraw();
  };
  card.querySelector('#aiHostAdd').onclick = doAdd;
  add.onkeydown = ev=>{ if(ev.key === 'Enter'){ ev.preventDefault(); doAdd(); } };
  card.querySelector('#aiRemember').onchange = ev=>{
    store.set('ai-remember', ev.target.checked ? '1' : '0');
    aiHosts().forEach(h=>{ const k = aiKey(h); if(k) aiSetKey(h, k, ev.target.checked); });   // move the keys you already have
    redraw();
  };
  card.querySelectorAll('[data-aikey]').forEach(inp=> inp.onkeydown = ev=>{
    if(ev.key !== 'Enter') return;
    ev.preventDefault();
    const v = inp.value.trim(); if(!v) return;
    aiSetKey(inp.dataset.aikey, v, store.get('ai-remember') === '1');
    inp.value = ''; toast(tr('Key saved in this browser ✓')); redraw();
  });
  card.querySelectorAll('[data-aikeydel]').forEach(b=> b.onclick = ()=>{ aiSetKey(b.dataset.aikeydel, ''); toast(tr('Key removed ✓')); redraw(); });
  card.querySelectorAll('[data-aimodel]').forEach(inp=> inp.onchange = ()=>{
    try { localStorage.setItem('at-ai-model:' + inp.dataset.aimodel, inp.value.trim()); } catch(e){}
    toast(tr('Model saved ✓'));
  });
  const rl = card.querySelector('#aiReload'); if(rl) rl.onclick = ()=> location.reload();
}
