/* ---------- Add it yourself ----------
   Every entity type can be created by hand, in the app, with no AI in the loop:
   the AI is a shortcut here, never the only door. Ideas, Hypotheses and
   Competitors already had their own forms (they carry rules the others don't —
   enforced grounding, the L1 waiting room, the research flag); this file adds
   the remaining five and one shared modal.

   What it writes is a real entity file in the repo's own shape — the same
   frontmatter the folder's `_template.md` documents — straight into the
   connected folder, or as a local draft in this browser when no folder is
   connected (identical to how a new Idea behaves).

   Nothing here invents content. Empty fields are written as empty sections
   with a comment, so the file says "not filled in" rather than guessing. */

const NEW_SPEC = {
  Signal: {
    folder: 'Signals',
    label: 'signal', new: 'New signal', add: 'Add a signal',
    lead: 'One observation from one real session — something you saw or heard yourself.',
    fields: [
      { k:'title',  l:'What you observed, in one line', ph:'e.g. Gives up on search after one try', req:true },
      { k:'body',   l:'The observation', t:'area', ph:'What this person did or said, in your words — not your interpretation of it.' },
      { k:'quote',  l:'Verbatim quote', hint:'their words, in the language they used — a quote is data', t:'area', ph:'"I type it in, and… nothing. Then I give up."' },
      { k:'source', l:'Where it came from', hint:'transcript title or interview id', ph:'e.g. INT-02 Jake' },
      { k:'date',   l:'Interview date', ph:'DD.MM.YYYY' },
      { k:'affinity', l:'Theme group', hint:'optional — the affinity board uses it', ph:'e.g. Library & finding music' },
      { k:'tags',   l:'Tags', hint:'comma-separated', ph:'e.g. search, friction' },
    ],
    md(v){
      return `---
type: 'Signal'
title: ${yamlStr(v.title)}
tags: [${tagList(v.tags)}]
affinity: '${(v.affinity||'').replace(/'/g,'')}'
evidences: []
competitors: []
---

# ${v.title}

${v.body ? v.body.trim() : '<!-- what this person did or said -->'}

${v.quote ? '> "'+v.quote.trim().replace(/^["“]|["”]$/g,'')+'"\n' : ''}
## Interview date

${v.date ? v.date.trim() : '<!-- DD.MM.YYYY -->'}

## Transcript

${v.source ? v.source.trim() : '<!-- which session this came from -->'}
`;
    },
  },
  Evidence: {
    folder: 'Evidence',
    label: 'evidence', new: 'New evidence', add: 'Add evidence',
    lead: 'Desk research: a report, a number, a public thread. Anything you did not observe yourself.',
    fields: [
      { k:'title',  l:'Title', ph:'e.g. Abandoned searches', req:true },
      { k:'body',   l:'What it says', t:'area', ph:'What was measured, on whom, what number. A fact, not an opinion.' },
      { k:'takeaways', l:'Takeaways', hint:'one per line', t:'area', ph:'What this means for the product' },
      { k:'sources', l:'Sources', hint:'one URL or reference per line — required for it to count as evidence', t:'area', ph:'https://…' },
      { k:'date',   l:'Retrieved', hint:'when you last verified it — it goes stale after 3 months', ph:'YYYY-MM-DD' },
      { k:'tags',   l:'Tags', hint:'comma-separated', ph:'e.g. search, pricing' },
    ],
    md(v){
      const lines = s => (s||'').split('\n').map(x=>x.trim()).filter(Boolean);
      const take = lines(v.takeaways), src = lines(v.sources);
      return `---
type: 'Evidence'
title: ${yamlStr(v.title)}
tags: [${tagList(v.tags)}]
retrieved: ${(v.date||'').trim() || todayISO()}
---

# ${v.title}

## Content

${v.body ? v.body.trim() : '<!-- what was measured, on whom, what number -->'}

## Takeaways

${take.length ? take.map(t=>'- '+t.replace(/^[-*]\s*/,'')).join('\n') : '- <!-- takeaway -->'}

## Sources

${src.length ? src.map(s=>'- '+s.replace(/^[-*]\s*/,'')).join('\n') : '- <!-- source: URL, report, study name -->'}
`;
    },
  },
  Persona: {
    folder: 'Personas',
    label: 'persona', new: 'New persona', add: 'Add a persona',
    lead: 'A person your research keeps describing. Built by hand here — link her Signals as they arrive.',
    fields: [
      { k:'title',  l:'Name', ph:'e.g. Emma Carter', req:true },
      { k:'role',   l:'Role / who they are', ph:'e.g. Marketing Specialist, 32, Warsaw' },
      { k:'quote',  l:'Their core tension, in their voice', hint:'one sentence, first person', t:'area', ph:'"Music is the only thing I control during the day."' },
      { k:'category', l:'Category', t:'select', opts:[['','not sure yet'],['Primary','Primary'],['Secondary','Secondary']] },
      { k:'body',   l:'Who they are', hint:'background colour — not research findings', t:'area', ph:'Life, work, how they came to the product' },
      { k:'tags',   l:'Tags', hint:'comma-separated', ph:'e.g. commuter, power-user' },
    ],
    md(v){
      return `---
type: 'Persona'
title: ${yamlStr(v.title)}
aliases:
description: ${v.role ? yamlStr(v.role) : ''}
tags: [${tagList(v.tags)}]
category: ${(v.category||'').trim()}
picture:
---

# ${v.title}${v.role ? ' — '+v.role : ''}

${v.quote ? '> "'+v.quote.trim().replace(/^["“]|["”]$/g,'')+'"\n' : '> <!-- one sentence in the first person, their core tension -->\n'}
---

## Who they are

${v.body ? v.body.trim() : '<!-- background colour: life, work, how they came to the product. Mark scaffolding with *[colour]* — it is not a finding. -->'}

## Jobs to be Done

- <!-- what they are trying to get done -->

## Pains

- <!-- link a Signal once one supports it -->

## Potential Gains

- <!-- what would make this better for them -->

## Relevant Quotes

- <!-- verbatim, with a link to its Signal or Transcript -->

## Evidences

<!-- Signals and Evidence this persona stands on. Until one is linked here she is
     an L1 assumption: a sketch, not a finding. -->
`;
    },
  },
  Archetype: {
    folder: 'Archetypes',
    label: 'archetype', new: 'New archetype', add: 'Add an archetype',
    lead: 'The pattern behind the person — a type, not someone in particular.',
    fields: [
      { k:'title',  l:'Name', ph:'e.g. The Niche Curator', req:true },
      { k:'body',   l:'Short description', hint:'the behaviour pattern: tension, motivation, context — no name, no age', t:'area', ph:'Someone who…' },
      { k:'pain',   l:'Core pain', hint:'one sentence', t:'area', ph:'The tension this pattern lives with' },
      { k:'persona', l:'Persona who embodies it', hint:'optional', ph:'e.g. Emma Carter' },
      { k:'tags',   l:'Tags', hint:'comma-separated', ph:'e.g. curation, discovery' },
    ],
    md(v){
      return `---
type: 'Archetype'
title: ${yamlStr(v.title)}
tags: [${tagList(v.tags)}]
---

# ${v.title}

- **Short description:** ${v.body ? v.body.trim() : '<!-- the behaviour pattern: tension, motivation, context -->'}

- **Link to persona:** ${v.persona ? v.persona.trim() : '<!-- which persona embodies this pattern, and through what -->'}

- **Core pain:** ${v.pain ? v.pain.trim() : '<!-- the core tension, in one sentence -->'}

## Questions by context

<!-- What someone in this pattern actually wonders, grouped by the situation they
     are in when they wonder it. Assumption-tier until a Signal backs it. -->
`;
    },
  },
  Transcript: {
    folder: 'Transcripts',
    label: 'transcript', new: 'New transcript', add: 'Add a transcript',
    lead: 'The conversation itself, word for word — one file, one person. Paste it here or drop the .md into the folder.',
    fields: [
      { k:'id',     l:'Interview id', ph:'e.g. INT-03', req:true },
      { k:'who',    l:'Participant', hint:'pseudonymised: code, age, role, city — never a full name or email', ph:'e.g. P3, 29, nurse, Kraków' },
      { k:'method', l:'Method', ph:'e.g. In-depth interview, remote' },
      { k:'date',   l:'Date', ph:'DD.MM.YYYY' },
      { k:'consent', l:'Consent on file', t:'select', hint:'optional — absence means "not recorded", it blocks nothing',
        opts:[['','not recorded'],['written','written'],['verbal_recorded','verbal, recorded'],['none','none'],['n/a','not applicable']] },
      { k:'body',   l:'The conversation', hint:'paste it — use **M:** for moderator and **P:** for participant', t:'area', big:true, ph:'**M:** How did you start?\n**P:** …' },
    ],
    md(v){
      const id = (v.id||'').trim();
      const name = id + (v.who ? ' '+v.who.trim().split(',')[0] : '');
      return `---
type: 'Transcript'
title: ${yamlStr(name)}
interview_id: ${id}
participant: ${v.who ? yamlStr(v.who) : "''"}
method: ${v.method ? yamlStr(v.method) : "''"}
date: ${(v.date||'').trim()}
${v.consent ? 'consent: '+v.consent+'\n' : ''}---

# ${name}

${v.body ? v.body.trim() : '<!-- paste the conversation: **M:** moderator, **P:** participant -->'}
`;
    },
    fileName(v){ const id=(v.id||'').trim(); return id + (v.who ? ' '+v.who.trim().split(',')[0].trim() : ''); },
  },
};

/* Types that already own a richer form — the generic modal defers to them. */
const NEW_CUSTOM = {
  IdeaForImprovement: ()=> openIdeaForm(),
  Hypothesis: ()=> openHypoForm(),
  Competitor: ()=> openCompForm(),
};

function yamlStr(s){ return "'" + String(s||'').replace(/'/g, "''") + "'"; }
function tagList(s){ return (s||'').split(',').map(x=>x.trim()).filter(Boolean).join(', '); }
function todayISO(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

/* ---------- the shared modal ---------- */
let NEWENT = null;   // { type, v:{} }
function openNewForm(type){
  if(NEW_CUSTOM[type]) return NEW_CUSTOM[type]();
  const spec = NEW_SPEC[type]; if(!spec) return;
  NEWENT = { type, v:{} };
  const modal = document.getElementById('newModal');
  modal.showModal();
  document.getElementById('newTitle').textContent = tr(spec.new);
  document.getElementById('newBody').innerHTML =
    `<p class="idea-hint" style="margin-bottom:14px">${esc(tr(spec.lead))}</p>` +
    spec.fields.map(f=>{
      const lab = `<label>${esc(tr(f.l))}${f.hint?` <span class="muted">${esc(tr(f.hint))}</span>`:''}</label>`;
      if(f.t==='select') return `<div class="idea-field">${lab}<select class="set-input" data-nf="${f.k}">${f.opts.map(([val,txt])=>`<option value="${esc(val)}">${esc(tr(txt))}</option>`).join('')}</select></div>`;
      if(f.t==='area')   return `<div class="idea-field">${lab}<textarea data-nf="${f.k}" ${f.big?'style="min-height:180px"':''} placeholder="${esc(tr(f.ph||''))}"></textarea></div>`;
      return `<div class="idea-field">${lab}<input data-nf="${f.k}" placeholder="${esc(tr(f.ph||''))}" autocomplete="off"></div>`;
    }).join('') +
    (DIRHANDLE ? '' : `<div class="idea-draft-note">${esc(tr('No folder connected — this is kept as a local draft in this browser (editable, exported with Export .md). Connect your project folder anytime to save drafts as real files.'))}</div>`);
  document.getElementById('newBody').querySelectorAll('[data-nf]').forEach(el=>{
    const ev = el.tagName==='SELECT' ? 'onchange' : 'oninput';
    el[ev] = ()=>{ NEWENT.v[el.dataset.nf] = el.value; validateNew(); };
  });
  validateNew();
  const first = document.getElementById('newBody').querySelector('[data-nf]'); if(first) first.focus();
}
function validateNew(){
  const spec = NEW_SPEC[NEWENT.type];
  const missing = spec.fields.filter(f=> f.req && !String(NEWENT.v[f.k]||'').trim());
  const msg = document.getElementById('newValid'), btn = document.getElementById('newCreate');
  const err = missing.length ? tr(missing[0].l) + ' — ' + tr('required') : '';
  msg.textContent = err; btn.disabled = !!err;
  return !err;
}
function closeNewForm(){ document.getElementById('newModal').close(); NEWENT=null; }

async function createNewEntity(){
  if(!NEWENT || !validateNew()) return;
  const spec = NEW_SPEC[NEWENT.type], v = NEWENT.v;
  const raw = spec.fileName ? spec.fileName(v) : String(v.title||'');
  const safe = raw.replace(/[\/\\:*?"<>|]/g,'').trim();
  if(!safe){ toast(tr('Give it a filename-safe name')); return; }
  const file = spec.folder + '/' + safe + '.md';
  if(ENTITIES[idFor(file)]){ toast(tr('A file with that name already exists')); return; }
  const md = spec.md(v);
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
  closeNewForm(); renderTabs();
  location.hash = '#'+idFor(file);
  toast(DIRHANDLE
    ? tr('Saved into your project folder ✓ — open Edit to keep filling it in')
    : tr('Draft saved in this browser ✓ — connect your folder to make it a real file'));
}

/* ---------- the AI shortcut, spelled out ----------
   The prompt is a plain instruction the user pastes into whatever agent they
   use. It names the skill, but reads as a sentence — an agent without our
   skills installed can still follow it. */
const NEW_PROMPT = {
  Signal: 'I have interview transcripts in this project. Read the files in Inbox/ and Transcripts/ and turn them into Signals — one observation per file, with the verbatim quote and a link back to the transcript it came from. Follow the shape in Signals/_template.md. Never invent a quote, and never file desk research as a Signal. Show me what you plan to write before writing it. (This is what the /extract-findings skill does.)',
  Evidence: 'Do desk research for this project and file what you find as Evidence — public, linkable sources only, each with a retrieved: date, following Evidence/_template.md. Web findings are Evidence, never Signals. List what you intend to add before writing anything. (This is what the /researcher skill does.)',
  Persona: 'Build a persona for this project from the research already in the repo: read Signals/, Evidence/ and Transcripts/, then write a persona file following Personas/_template.md, linking every claim to the Signal or Evidence it rests on. Anything with no source stays marked as an assumption. (This is what the /ai-persona and /persona-workshop skills do.)',
  Archetype: 'Read the personas and Signals in this project and propose the archetypes behind them — the shared behaviour patterns, not the individuals. Write them following Archetypes/_template.md and link each to the persona that embodies it. Propose first, write after I agree.',
  Transcript: 'I am about to add raw interview material to this project. Take the text I paste next, pseudonymise it (no names, emails, employers), save it into Transcripts/ following Transcripts/_template.md, and then tell me which Signals you would extract from it before extracting anything.',
  IdeaForImprovement: 'Read the Signals and Evidence in this project and propose ideas worth building, each written as When / I want / So that and grounded in at least one linked Signal or Evidence. No grounding, no idea — put ungrounded ones in Hypotheses/ instead.',
  Hypothesis: 'Turn my untested assumptions about users into hypotheses in Hypotheses/ — If / By / Will / Because, all at L1, none counted as findings — and add the questions that would test them to Research backlog.md.',
  Competitor: 'Research the competitors my participants keep bringing up. Read Transcripts/ for mentions, then do desk research on each and file them in Competitors/ per Competitors/README.md, with sources and a retrieved: date. Ask me how far back to look before you start.',
};

function copyNewPrompt(type){
  const txt = (tr(NEW_PROMPT[type]||'') || '') + promptLang(); if(!txt.trim()) return;
  const done = ()=> toast(tr('Prompt copied — paste it into your AI assistant ✓'));
  if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done, ()=>fallbackCopy(txt, done)); }
  else fallbackCopy(txt, done);
}
function fallbackCopy(txt, done){
  const ta = document.createElement('textarea'); ta.value = txt;
  ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); done(); }catch(err){ toast(tr('Copy failed — select the text manually')); }
  ta.remove();
}

/* ---------- the bar above the grid ----------
   Ideas, Hypotheses and Competitors have their own bars already; this one
   covers every other type, so no tab is a dead end where the only way to add
   something is to leave the app. */
const NEW_BAR_NOTE = {
  Signal: 'Yours to write — or let your agent draft them from transcripts.',
  Evidence: 'Desk research: reports, numbers, public threads. Every entry needs a source and the date you checked it.',
  Persona: 'Write her by hand, link her Signals as they arrive. Until then she is an assumption, and the app says so.',
  Archetype: 'Name the tension, then link the Signals that show it.',
  Transcript: 'Paste a conversation, or drop the .md straight into the folder.',
};
function syncNewBar(){
  const bar = document.getElementById('newBar'); if(!bar) return;
  const spec = NEW_SPEC[activeType];
  if(!spec){ bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  const add = document.getElementById('newEntBtn');
  add.textContent = '＋ ' + tr(spec.new);
  add.onclick = ()=> openNewForm(activeType);
  const pr = document.getElementById('newPromptBtn');
  pr.textContent = '⧉ ' + tr('AI prompt');
  pr.title = tr('Copy an instruction you can paste into your AI assistant');
  pr.onclick = ()=> copyNewPrompt(activeType);
  document.getElementById('newBarNote').textContent = tr(NEW_BAR_NOTE[activeType] || '');
}

/* ---------- empty state ----------
   An empty type is the moment the app has to say what belongs here and how to
   put it there — by hand first, with the AI as the shortcut underneath. */
function typeEmptyHtml(type){
  const meta = TYPES[type]; if(!meta) return '';
  const spec = NEW_SPEC[type];
  const how = {
    Signal: 'Add one yourself: what one person did or said, plus their exact words. Or hand your agent the transcripts and let it draft them for you.',
    Evidence: 'Add a report, a number or a public thread you have already read — with its link and the date you checked it. Or let your agent do the reading.',
    Persona: 'Write the person you keep meeting in sessions. She stays an assumption until Signals are linked to her — that is the honest starting point, not a flaw.',
    Archetype: 'Name the pattern behind your personas. One or two sentences is enough to start.',
    Transcript: 'Paste a conversation, or drop the .md file straight into the folder — the app picks it up on the next refresh.',
    IdeaForImprovement: 'Write it as When / I want / So that, and link the Signal or Evidence that earns it. Grounding is required here, on purpose.',
    Hypothesis: 'A hunch needs no proof to live here. Write it as If / By / Will / Because and let research catch up with it.',
    Competitor: 'The name is enough to start — the rest can be researched later.',
  }[type] || '';
  return `<div class="didyouknow empty-state">
    <div class="kicker">${esc(tr(meta.label))}</div>
    <h3>${esc(tr('Nothing here yet.'))}</h3>
    <p>${esc(tr(PAGE_DESC[type] || ''))}</p>
    <p>${esc(tr(how))}</p>
    <div class="empty-acts">
      <button class="btn btn-primary btn-sm" id="esAdd">＋ ${esc(tr(spec ? spec.add : 'Add'))}</button>
      ${NEW_PROMPT[type] ? `<button class="btn btn-outline btn-sm" id="esPrompt">${esc(tr('⧉ Copy AI prompt'))}</button>` : ''}
    </div>
    <p class="empty-note">${esc(tr('The button writes the file for you — no AI needed. The prompt is there for when you would rather hand a stack of transcripts to your agent.'))}</p>
  </div>`;
}
function wireEmptyState(type){
  const add = document.getElementById('esAdd'); if(add) add.onclick = ()=> openNewForm(type);
  const pr = document.getElementById('esPrompt'); if(pr) pr.onclick = ()=> copyNewPrompt(type);
}

/* The first screen of an empty project. It used to send you to Claude Code for
   everything but one form; now the manual route comes first and the prompt is
   an offer, because a research tool you cannot fill in by hand is not a tool
   you own. */
function projectEmptyHtml(){
  const b = (t, label) => `<button class="btn btn-outline btn-sm" data-esnew="${t}">＋ ${esc(tr(label))}</button>`;
  return `<div class="didyouknow empty-state">
    <div class="kicker">${esc(tr('Your project workspace'))}</div>
    <h3>${esc(tr('A blank page, and it’s yours.'))}</h3>
    <p>${esc(tr('The demo never bleeds in here. Everything below writes a real Markdown file — into your folder once one is connected, or into this browser as a draft until then.'))}</p>
    <div class="empty-acts">
      ${b('Transcript','Add a transcript')}${b('Signal','Add a signal')}${b('Evidence','Add evidence')}${b('Persona','Add a persona')}
      <button class="btn btn-outline btn-sm" id="esIdea">＋ ${esc(tr('Add an idea'))}</button>
    </div>
    <p>${esc(tr('Already have files? Connect the folder — it is read right here on your computer, nothing is uploaded.'))}</p>
    <div class="empty-acts">
      <button class="btn btn-primary btn-sm" id="esConnect">${esc(tr('Connect folder'))}</button>
      <button class="btn btn-outline btn-sm" id="esPrompt2">${esc(tr('⧉ Copy AI prompt'))}</button>
    </div>
    <p class="empty-note">${esc(tr('The prompt hands a stack of transcripts to your AI assistant and asks it to draft the Signals — useful when you have twenty sessions, unnecessary when you have one. Every folder also ships a _template.md: a worked example of what good looks like.'))}</p>
  </div>`;
}
function wireProjectEmpty(){
  document.querySelectorAll('[data-esnew]').forEach(b=> b.onclick = ()=> openNewForm(b.dataset.esnew));
  const idea = document.getElementById('esIdea'); if(idea) idea.onclick = ()=> openIdeaForm();
  const conn = document.getElementById('esConnect'); if(conn) conn.onclick = ()=>{ const l=document.getElementById('loadBtn'); if(l) l.click(); };
  const pr = document.getElementById('esPrompt2'); if(pr) pr.onclick = ()=> copyNewPrompt('Signal');
}
