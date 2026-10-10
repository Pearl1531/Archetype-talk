/* ---------- Hypotheses: the side panel (styles: 10d-hypotheses.css) ----------
   A row of the table (06) opens one bet in the backlog's side panel: the bet
   itself (For · If · By · Instead of · Will · Because), an optional argument
   against it — what would show it is wrong, written in the file as
   "**We're wrong if:**" and asked for only on a click — and the Signals and
   Evidence linked to it. A hypothesis stays Level 1 whatever this shows. */
let HY_OPEN = null, HY_ORDER = [], HY_ARG = false;
/* The bet's parts as a file writes them. The repo ships English labels, a
   Polish project writes Polish ones (**Jeśli / Poprzez / To / Ponieważ**), and
   a file keeps whichever it has — read in any of them, written back in its own. */
const HY_PARTS = {
  for:     ['For', 'Dla'],
  if:      ['If', 'Jeśli', 'Jeżeli'],
  by:      ['By', 'Poprzez', 'Przez'],
  instead: ['Instead of', 'Zamiast'],
  will:    ['Will', 'To', 'Wtedy'],
  because: ['Because', 'Ponieważ', 'Bo'],
  wrong:   ['We’re wrong if', 'Mylimy się, jeśli', "We're wrong if", 'Argument przeciw'],
};
const HY_KEYS = Object.keys(HY_PARTS);
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function hyPartLine(text, k){   // -> [line, label, value] of the part's bullet, or null
  for(const l of HY_PARTS[k]){
    const m = text.match(new RegExp('^[ \\t]*(?:-[ \\t]*)?\\*\\*(' + reEsc(l) + '):\\*\\*[ \\t]*(.*)$', 'mi'));
    if(m) return m;
  }
  return null;
}
const hyPartRaw = (e, k) => { const m = hyPartLine(e.body, k); return m ? m[2].trim() : ''; };
const hyPart = (e, k) => stripLinks(hyPartRaw(e, k)).replace(/[.,;]\s*$/, '').trim();
const hyPolish = text => /\*\*(Jeśli|Poprzez|Ponieważ|Dla):\*\*/.test(text);
const HY_PREFIX = /^(Hypothesis|Hipoteza):\s*/i;
const hyName = e => e.title.replace(HY_PREFIX, '').trim();
const hyWrongIf = e => hyPart(e, 'wrong');
const hyNo = e => (e.file.split('/').pop().match(/^H\d+/i) || [''])[0].toUpperCase();
/* Write some parts into a hypothesis file and leave everything else as it was:
   a part the edit did not change keeps its line (links and bold included), an
   emptied optional part loses its line, a new one goes in after the part
   before it, labelled in the file's own language (`pl` for a new file).
   `vals`: key -> new text. */
function hyApplyParts(md, vals, pl = hyPolish(md)){
  HY_KEYS.forEach((k, i)=>{
    if(!(k in vals)) return;
    const v = String(vals[k] || '').trim().replace(/[.,;]\s*$/, ''), m = hyPartLine(md, k);
    const end = k === 'because' || k === 'wrong' ? '.' : ',';
    if(m){
      if(stripLinks(m[2]).replace(/[.,;]\s*$/, '').trim() === v) return;   // untouched: keep the original line
      md = v ? md.replace(m[0], `- **${m[1]}:** ${v}${end}`) : md.replace(new RegExp(reEsc(m[0]) + '\\n?(\\s*\\n)?'), '');
      return;
    }
    if(!v) return;
    const line = `- **${HY_PARTS[k][pl ? 1 : 0]}:** ${v}${end}`;
    const before = HY_KEYS.slice(0, i).reverse().map(x=> hyPartLine(md, x)).find(Boolean);
    const after = HY_KEYS.slice(i + 1).map(x=> hyPartLine(md, x)).find(Boolean);
    if(before) md = md.replace(before[0], before[0] + '\n\n' + line);
    else if(after) md = md.replace(after[0], line + '\n\n' + after[0]);
    else md = md.replace(/^(# .*)$/m, '$1\n\n' + line);
  });
  return md.replace(/\n{3,}/g, '\n\n');
}

function renderHypotheses(list){
  HY_ORDER = list.map(e=> e.id);
  grid.className = 'tableview'; renderTable(list);
  hyPanel();
}

/* the argument against: its own line in the file, under Because; empty removes it */
async function hySaveArgument(id, text){
  let e = ENTITIES[id]; if(!e) return;
  e = await ensureWritable(e); if(!e) return;
  const t = text.trim(), md = hyApplyParts(e.md, { wrong: t });
  if(md === e.md){ HY_ARG = false; hyPanel(); return; }
  HY_ARG = false;
  if(await saveEntityText(e, md)) toast(tr(t ? 'Argument saved ✓' : 'Argument removed'), { label: tr('Undo'), fn: async ()=>{ await undoLastSave(); renderGrid(searchInput.value); } });
}

function hyOpen(id){ if(HY_OPEN !== id) HY_ARG = false; HY_OPEN = id; hyPanel(); }
function hyClose(){ if(!HY_OPEN) return; HY_OPEN = null; HY_ARG = false; hyPanel(); }
function hyPanel(){
  let host = document.getElementById('hyPanel');
  const e = HY_OPEN && ENTITIES[HY_OPEN];
  if(!e || e.type !== 'Hypothesis' || activeType !== 'Hypothesis'){ HY_OPEN = null; if(host) host.remove(); document.querySelectorAll('tr.hy-on').forEach(r=> r.classList.remove('hy-on')); return; }
  if(!host){ host = document.createElement('div'); host.id = 'hyPanel'; document.body.appendChild(host); }
  document.querySelectorAll('tr[data-goto]').forEach(r=> r.classList.toggle('hy-on', r.dataset.goto === e.id));
  const pos = HY_ORDER.indexOf(e.id), w = hyWrongIf(e), st = hypoStatus(e), linked = hypoSourceIds(e);
  const forL = hyPartRaw(e, 'for'), forM = forL.match(/\[([^\]]+)\]\(([^)]+)\)/), forId = forM && resolveRef(forM[2]);
  const step = (d, ico, lab, off) => `<button class="bl-icon" data-hstep="${d}"${off ? ' disabled' : ''} title="${esc(tr(lab))}" aria-label="${esc(tr(lab))}">${ico}</button>`;
  const prop = (ico, label, val) => `<div class="bl-prop"><span class="bl-prop-l">${ico}${esc(tr(label))}</span><span class="bl-prop-v">${val}</span></div>`;
  const bet = [['For', forId ? `<a href="#${esc(forId)}">${esc(forM[1])}</a>` : esc(hyPart(e, 'for'))], ['If', esc(hyPart(e, 'if'))], ['By', esc(hyPart(e, 'by'))],
               ['Instead of', esc(hyPart(e, 'instead'))], ['Will', esc(hyPart(e, 'will'))], ['Because', esc(hyPart(e, 'because'))]].filter(x=> x[1]);
  const ARG = 'Argument against this hypothesis';
  const arg = HY_ARG
    ? `<div class="hy-arg edit"><label for="hyArgIn">${esc(tr(ARG))}</label>
        <textarea id="hyArgIn" class="set-input" rows="3" placeholder="${esc(tr('What would show that this is wrong? e.g. listeners who never share their account distrust the mixes just as much'))}">${esc(w)}</textarea>
        <span class="hy-arg-acts"><button class="btn btn-primary btn-sm" data-hact="argsave">${esc(tr('Save'))}</button><button class="btn btn-ghost btn-sm" data-hact="argcancel">${esc(tr('Cancel'))}</button></span></div>`
    : w ? `<div class="hy-arg"><span class="hy-arg-h">${esc(tr(ARG))}<button class="hy-plain" data-hact="arg">${esc(tr('Edit'))}</button></span><p>${esc(w)}</p></div>`
    : `<button class="hy-arg-add" data-hact="arg">+ ${esc(tr(ARG))}</button>`;
  host.innerHTML = `<aside class="bl-panel hy-panel" role="dialog" aria-modal="false" aria-label="${esc(tr('Hypothesis'))}">
    <div class="bl-p-top">${step(-1, BL_ICONS.left, 'Previous hypothesis', pos <= 0)}<span class="bl-p-kick">${pos < 0 ? '' : tr('{n} of {m}').replace('{n}', pos + 1).replace('{m}', HY_ORDER.length)}</span>${step(1, BL_ICONS.right, 'Next hypothesis', pos < 0 || pos >= HY_ORDER.length - 1)}
      <span class="bl-p-gap"></span>
      ${st === 'open' && linked.length ? `<button class="btn btn-outline btn-sm" data-hact="promote" title="${esc(tr('Has {what} — make it a grounded Idea').replace('{what}', ideaGrounding(e).detail))}">↑ <span class="bl-hide-sm">${esc(tr('Promote to Idea'))}</span></button>` : ''}
      <button class="bl-icon" data-hact="close" title="${esc(tr('Close'))}" aria-label="${esc(tr('Close'))}">${BL_ICONS.x}</button></div>
    <div class="bl-p-body">
      <div class="hy-p-head"><span>${hyNo(e) ? `<span class="hy-no">${esc(hyNo(e))}</span>` : ''}${hypoStatusChip(e)}</span><h2 class="bl-p-h">${esc(hyName(e))}</h2></div>
      <dl class="hy-bet-dl">${bet.map(([k, v])=> `<dt>${esc(k === 'For' && LANG === 'pl' ? 'Dla' : tr(k))}</dt><dd>${v}</dd>`).join('')}</dl>
      ${arg}
      <div class="bl-props">
        ${e.fm.feature ? prop(BL_ICONS.source, 'Topic', esc(e.fm.feature)) : ''}
        ${prop(BL_ICONS.user, 'Author', authorChip(e))}
      </div>
      <div class="bl-p-sec"><h3>${esc(tr('Linked evidence'))} <span class="hy-cnt">${linked.length}</span></h3>
        ${linked.map(id=> `<a class="hy-link" href="#${esc(id)}"><span>${esc(tr(ENTITIES[id].meta.singular))}</span>${esc(trim(ENTITIES[id].title, 90))}</a>`).join('')
          || `<p class="bl-sugg">${esc(tr('None yet — that is what makes it a hypothesis.'))}</p>`}</div>
    </div>
    <div class="bl-p-foot"><button class="btn btn-outline" data-hact="edit">${esc(tr('Edit'))}</button><a class="btn btn-ghost" href="#${esc(e.id)}">${esc(tr('Open the file'))}</a></div>
  </aside>`;
  host.querySelectorAll('[data-hstep]').forEach(b=> b.onclick = ()=> hyOpen(HY_ORDER[pos + (+b.dataset.hstep)]));
  host.querySelectorAll('[data-hact]').forEach(b=> b.onclick = ()=>{
    const a = b.dataset.hact;
    if(a === 'close') hyClose(); else if(a === 'edit') editHypothesis(e.id); else if(a === 'promote') promoteHypothesis(e.id);
    else if(a === 'arg'){ HY_ARG = true; hyPanel(); host.querySelector('#hyArgIn')?.focus(); }
    else if(a === 'argcancel'){ HY_ARG = false; hyPanel(); }
    else if(a === 'argsave') hySaveArgument(e.id, host.querySelector('#hyArgIn').value);
  });
}
addEventListener('hashchange', hyClose);
document.addEventListener('keydown', ev=>{ if(ev.key === 'Escape' && HY_OPEN && !modalOpen()) hyClose(); });
