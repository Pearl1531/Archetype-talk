/* ---------- the full transcript: its place in the file, and bringing one in ----------
   A transcript file may hold excerpts (a compiled secondary source) and the
   whole conversation under "## Full transcript" — timestamped paragraphs,
   "[12:04] **Emma:** text", or "[12:04] text" when the speakers are unknown,
   with the source's chapters as "### Title (12:04)". The transcript page
   switches between the two (09d), and "Add full transcript" pastes or reads a
   file — a YouTube transcript copy, .srt, .vtt or plain text — into that shape
   without changing a word. Whether the text is anonymised is the file's
   `anonymization:` field, set here and in the page header. */
const TR_FULL_RE = /^(full transcript|pełna transkrypcja)\b/i;
const TR_TS_LINE = /^\[?(\d{1,2}:\d{2}(?::\d{2})?)(?:[.,]\d+)?\]?$/;
const trSec = t => t.split(':').reduce((a, n)=> a * 60 + +n, 0);
const trClock = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`; };

/* raw text → the file's Markdown. Words are kept as they are; only timestamps
   are normalised, cues joined into ~30-second paragraphs, a speaker change or
   a chapter starting a new one. Text with no timestamps comes back as it was. */
function trTimed(raw){
  const lines = String(raw || '').replace(/\r/g, '').split('\n').map(l=> l.trim());
  const cues = []; let cur = null, pre = [];
  const youtube = lines.some(l=> TR_TS_LINE.test(l) && !/^\[/.test(l));
  lines.forEach((l, i)=>{
    if(!l || /^WEBVTT/.test(l) || /^NOTE\b/.test(l)) return;
    const arrow = l.match(/^(\d[\d:.,]*)\s*-->/);
    const lead = l.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.+)$/);
    if(arrow || TR_TS_LINE.test(l)){ const t = (arrow ? arrow[1] : l).replace(/[\[\]]/g, '').replace(/[.,]\d+$/, '').replace(/^00:(\d\d:\d\d)$/, '$1'); cur = { t: trSec(t), lines: [] }; cues.push(cur); return; }
    if(lead){ cur = { t: trSec(lead[1]), lines: [lead[2]] }; cues.push(cur); return; }
    if(/^\d+$/.test(l) && /-->/.test(lines.slice(i + 1).find(Boolean) || '')) return;            // an .srt cue number
    if(/^\d+\s+(godzin|godzina|godziny|minut|minuta|minuty|sekund|sekunda|sekundy|hours?|minutes?|seconds?)\b/i.test(l)) return;   // a screen reader's copy of the time
    (cur ? cur.lines : pre).push(l);
  });
  if(!cues.length) return String(raw || '').trim();
  /* a YouTube copy puts a chapter's title on its own line, last before the
     timestamp it starts at — short, and after the cue's own text */
  const chapter = (c, i)=> youtube && c.lines.length > 1 && i + 1 < cues.length && c.lines[c.lines.length - 1].length < 90 ? c.lines.pop() : null;
  const out = []; let para = null;
  const flush = ()=>{ if(para) out.push(`[${trClock(para.t)}] ${para.who ? `**${para.who}:** ` : ''}${para.text.join(' ')}`); para = null; };
  // what comes before the first timestamp: a chapter title when it is one short line, else the opening words
  if(pre.length === 1 && pre[0].length < 90 && youtube) cues[0].title = pre[0];
  else if(pre.length) cues.unshift({ t: 0, lines: pre });
  cues.forEach((c, i)=>{ const ch = chapter(c, i); if(ch) cues[i + 1].title = ch; });
  cues.forEach(c=>{
    let text = c.lines.join(' ').trim(), who = null;
    const sp = text.match(/^([A-ZĄĆĘŁŃÓŚŹŻ][\wĄĆĘŁŃÓŚŹŻąćęłńóśźż .]{0,28}):\s+(.+)$/);
    if(sp && !youtube && !/\d:\d/.test(sp[1])){ who = sp[1].trim(); text = sp[2]; }
    if(c.title){ flush(); out.push(`### ${c.title} (${trClock(c.t)})`); }
    if(para && (who && who !== para.who || c.t - para.t >= 30)) flush();
    if(!text) return;
    if(!para) para = { t: c.t, who: who || null, text: [] };
    para.text.push(text);
  });
  flush();
  return out.join('\n\n');
}

/* put the section into the body: before the observer notes, else at the end */
function trWithFull(body, md){
  const head = `## ${LANG === 'pl' ? 'Pełna transkrypcja' : 'Full transcript'}\n\n${md}\n`;
  const m = body.match(/^##\s+(observer notes|notatki obserwatora|uwagi obserwatora)\b.*$/im);
  return m ? body.slice(0, m.index) + head + '\n' + body.slice(m.index) : body.replace(/\s*$/, '\n\n' + head);
}

const TR_ANON = [['', 'Anonymisation not recorded'], ['none', 'Not anonymised'], ['ai_assisted', 'Anonymised by AI'],
  ['tool_assisted', 'Anonymised with a tool'], ['manual_verified', 'Anonymised, checked by a person']];
const trAnonSelect = (e, id) => `<select class="tr-anon" id="${id}" aria-label="${esc(tr('Anonymisation'))}">${TR_ANON.map(([v, l])=> `<option value="${v}"${String(e.fm.anonymization || '') === v ? ' selected' : ''}>${esc(tr(l))}</option>`).join('')}</select>`;
async function trSetAnon(e, v){
  const w = await ensureWritable(e); if(!w) return;
  if(w !== e){ openDetail(w.id); return; }
  if(await saveEntityText(e, setFmField(e.md, 'anonymization', v || null))){ openDetail(e.id); toast(tr('Saved ✓')); }
}

function trFullDialog(e){
  let dlg = document.getElementById('trFullModal');
  if(!dlg){ dlg = document.createElement('dialog'); dlg.id = 'trFullModal'; dlg.className = 'modal tr-full-modal'; document.body.appendChild(dlg); }
  dlg.innerHTML = `<form method="dialog" class="tr-full-form">
    <h3>${tr('Add the full transcript')}</h3>
    <p class="tr-full-lead">${tr('Paste the text or choose a file — a YouTube transcript copy, .srt, .vtt or plain text. Timestamps and chapters are kept; not a word is corrected or translated.')}</p>
    <label class="tr-full-file"><input type="file" accept=".txt,.srt,.vtt,.md,text/plain">${tr('Choose a file…')}</label>
    <textarea rows="10" placeholder="0:09&#10;${esc(tr('Hello, and welcome…'))}"></textarea>
    <label class="tr-full-anon"><span>${tr('Is this text anonymised?')}</span>${trAnonSelect(e, 'trFullAnon')}</label>
    <div class="tr-full-act"><button type="button" class="btn btn-ghost btn-sm" value="cancel">${tr('Cancel')}</button><button type="button" class="btn btn-primary btn-sm" data-ok>${tr('Add to the transcript')}</button></div>
  </form>`;
  const ta = dlg.querySelector('textarea');
  dlg.querySelector('input[type=file]').onchange = async ev=>{ const f = ev.target.files[0]; if(f) ta.value = await f.text(); };
  dlg.querySelector('[value=cancel]').onclick = ()=> dlg.close();
  dlg.querySelector('[data-ok]').onclick = async ()=>{
    const md = trTimed(ta.value); if(!md){ ta.focus(); return; }
    const w = await ensureWritable(e); if(!w) return;
    const anon = dlg.querySelector('#trFullAnon').value;
    const body = withNewBody(w, trWithFull(w.body, md)); if(body === null) return;
    dlg.close();
    if(await saveEntityText(w, setFmField(body, 'anonymization', anon || null))){ TR_VIEW = 'full'; openDetail(w.id); toast(tr('Full transcript added ✓')); }
  };
  dlg.showModal(); ta.focus();
}
