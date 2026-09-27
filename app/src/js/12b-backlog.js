/* ---------- Research backlog page ----------
   `Research backlog.md` is the one thing a synthetic persona conversation is
   allowed to leave behind: questions for REAL users. It is a root doc, not an
   entity, so it never shows up in the graph tabs — this page is where you read
   and edit it without opening a terminal.

   The file stays plain Markdown: we rewrite only the rows of the two known
   tables (Open questions / Closed) and leave every other line — the overriding
   rule, the prose, the HTML comments, any extra column — byte-identical, so
   `/backlog` and `/interview-guide` keep reading the same document.

   Append-honest (the skill's rule): closing always records WHY, and deleting
   asks first. Every write offers one-shot Undo. */
const BACKLOG_FILE = 'Research backlog.md';
const BL_DEFAULT_HEADER = ['Date','Persona','Question','Source / level','Status'];
const backlogBtn = document.getElementById('backlogBtn');
let BACKLOG_ACTIVE = false;
let BL = null;          // the parsed file currently on screen
let BL_EDIT = null;     // row key being edited ("open:2"), or 'new'
let BL_MODE = 'edit';   // 'edit' | 'close' | 'new'
let BL_SEL = null;      // row key shown in the right-hand pane
let BL_KIND_FILTER = 'all';
let BL_SEV_FILTER = 'all';
let BL_LIST = 'open';   // which list the left column is showing: open | closed
let BL_FILTERS_OPEN = false;   // the filter drawer under the bar
let BL_TEXT = '';              // the text filter in the list header, kept across re-renders
let BL_SHEET = null;           // method id explained in the right-hand sheet

/* Feather icons (feathericons.com, MIT) — the set this app already uses. */
const BL_ICONS = {
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  help:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  info:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  x:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
};

/* ---- markdown table parsing (pipe-escape aware) ---- */
function blSplitRow(line){
  const s = line.trim().replace(/^\|/,'').replace(/\|$/,'');
  const cells = []; let cur = '';
  for(let i=0;i<s.length;i++){
    if(s[i]==='\\' && s[i+1]==='|'){ cur += '|'; i++; continue; }
    if(s[i]==='|'){ cells.push(cur.trim()); cur = ''; continue; }
    cur += s[i];
  }
  cells.push(cur.trim());
  return cells;
}
function blCellOut(v){ return String(v==null?'':v).replace(/\s*\n+\s*/g,' ').replace(/\|/g,'\\|').trim(); }
function blIsSep(l){ return !!l && /^[\s|:-]+$/.test(l) && l.includes('-'); }
function blIsRow(l){ return /^\s*\|/.test(l||''); }

/* Split the file into `## ` sections; the first pipe-table inside a section is
   its data table. Lines are kept verbatim for the write-back splice. */
function parseBacklog(raw){
  const lines = (raw||'').replace(/\r/g,'').split('\n');
  const secs = []; let cur = null;
  for(let i=0;i<lines.length;i++){
    const h = lines[i].match(/^##\s+(.*)$/);   // the "> ## Overriding rule" blockquote is not a heading
    if(h){ cur = { title: h[1].trim(), head: i, end: lines.length, table: null }; secs.push(cur); continue; }
    if(!cur || cur.table || !blIsRow(lines[i])) continue;
    let j = i; while(j < lines.length && blIsRow(lines[j])) j++;
    const block = lines.slice(i, j);
    const hasSep = blIsSep(block[1]);
    cur.table = { start: i, end: j, rawHead: block[0], rawSep: hasSep ? block[1] : null,
                  header: blSplitRow(block[0]), rows: block.slice(hasSep ? 2 : 1).map(blSplitRow) };
    i = j - 1;
  }
  secs.forEach((s,i)=>{ s.end = i+1 < secs.length ? secs[i+1].head : lines.length; });
  /* Section titles in either language — a Polish file says "Pytania otwarte" /
     "Zamknięte / zamienione w badanie", and matching only the English ones
     left the real tables invisible and appended a second, English pair of
     headings on the first save. */
  const bl = { lines, secs,
               open:   secs.find(s=> /^open|otwart/i.test(s.title)) || null,
               closed: secs.find(s=> /^closed|zamkni[eę]t/i.test(s.title)) || null };
  // A missing section (odd file) is synthesized at the end of the document;
  // a section with no table yet ("_(empty)_" closed list) gets a virtual one.
  // Both are materialized on save — only once they actually hold a row.
  ['open','closed'].forEach(k=>{
    if(!bl[k]) bl[k] = { title: k==='open'?'Open questions':'Closed / turned into research',
                         head: lines.length, end: lines.length, missingHeading: true, table: null };
    if(!bl[k].table) bl[k].table = { virtual:true, rawHead:null, rawSep:null, rows:[],
      header: (bl.open.table && !bl.open.table.virtual ? bl.open.table.header : BL_DEFAULT_HEADER).slice() };
  });
  return bl;
}
function blTableLines(t){
  return [ t.rawHead || '| '+t.header.join(' | ')+' |',
           t.rawSep  || '|'+t.header.map(()=>'---').join('|')+'|',
           ...t.rows.map(r=> '| '+t.header.map((_,i)=> blCellOut(r[i])).join(' | ')+' |') ];
}
function blSerialize(bl){
  const lines = bl.lines.slice(); const jobs = [];
  [bl.open, bl.closed].forEach(sec=>{
    const t = sec && sec.table; if(!t) return;
    if(!t.virtual){ jobs.push({ from: t.start, to: t.end, block: blTableLines(t) }); return; }
    if(!t.rows.length) return;                       // nothing to write yet
    let at = sec.end; while(at > sec.head+1 && lines[at-1].trim()==='') at--;
    const from = /^_?\(empty\)_?$/.test((lines[at-1]||'').trim()) ? at-1 : at;   // the "_(empty)_" placeholder gives way
    const head = sec.missingHeading ? ['', '## '+sec.title] : [];
    jobs.push({ from, to: at, block: [...head, '', ...blTableLines(t)] });
  });
  jobs.sort((a,b)=> b.from - a.from).forEach(j=> lines.splice(j.from, j.to - j.from, ...j.block));
  return lines.join('\n').replace(/\n*$/,'\n');
}

/* ---- columns: matched by header name, so an extra column in someone's file
   is edited and written back untouched instead of being dropped.

   Both languages, because the repo ships in English but runs in the user's:
   a backlog written by a Polish session has `Data | Priorytet | Pytanie |
   Rodzaj`, and a page that only knows the English names quietly reads the
   date cell as the question. Unknown columns ("Jak na nie odpowiedzieć") are
   still carried through untouched — matching is for the fields we edit. ---- */
const BL_COLS = [['date',/^date|^data\b/i], ['persona',/persona/i], ['question',/question|^pytani/i],
                 ['source',/source|level|origin|^źródł|^zrodl|^poziom/i], ['status',/status/i],
                 ['kind',/^kind|method|approach|^rodzaj|^typ\b/i],
                 ['priority',/^priorit|^severit|^prio|^waga|^wagi/i]];
function blMap(header){
  const m = {};
  BL_COLS.forEach(([k,re])=>{ const i = header.findIndex(h=> re.test(h)); if(i>-1) m[k]=i; });
  return m;
}
function blGet(t, row, key){ const i = blMap(t.header)[key]; return i==null ? '' : (row[i]||''); }
function blSet(t, row, key, v){ const i = blMap(t.header)[key]; if(i!=null) row[i] = v; }
/* move a row between two tables whose columns may differ — a column the row
   actually uses is created on the target rather than dropped in transit */
function blRemap(row, from, to){
  if(blGet(from, row, 'kind')) blEnsureCol(to, 'kind', 'Kind');
  if(blGet(from, row, 'priority')) blEnsureCol(to, 'priority', 'Priority');
  const a = blMap(from.header), b = blMap(to.header);
  const out = to.header.map(()=> '');
  Object.keys(b).forEach(k=>{ if(a[k]!=null) out[b[k]] = row[a[k]] || ''; });
  return out;
}
function blToday(){ const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
/* Add a column to an existing table — header + every row grow together, and the
   raw header lines are dropped so they get regenerated with the new width.
   Looked up by FIELD, not by label: a Polish file already carrying `Rodzaj`
   must not get a second, English `Kind` column bolted on beside it. */
function blEnsureCol(t, key, label){
  const i = blMap(t.header)[key];
  if(i != null) return i;
  t.header.push(label); t.rawHead = null; t.rawSep = null;
  t.rows.forEach(r=>{ while(r.length < t.header.length) r.push(''); });
  return t.header.length - 1;
}

/* ---------- qualitative vs quantitative ----------
   A backlog row says WHAT we don't know; the kind says what SHAPE of answer
   would settle it — a story or a number. It decides the method, and the method
   decides where the answer lands in the graph: a session we run becomes a
   Signal, an aggregate (analytics, survey, report) becomes Evidence.

   The tag is stored in a `Kind` column, so /interview-guide and /backlog read
   the same split. Untagged rows get a GUESS from the wording — shown as a
   dashed "suggested" chip and never written to the file until a human confirms
   it. A guess is not data. */
const BL_KINDS = {
  qualitative:  { label:'qualitative',  ico:'◐', blurb:'Needs a story: motivation, context, the words people use. Answered by talking to a few people properly.' },
  quantitative: { label:'quantitative', ico:'▦', blurb:'Needs a number: how many, how often, what share. Answered by counting — analytics, a sized survey, published data.' },
  mixed:        { label:'mixed',        ico:'◑', blurb:'Two questions in one. Understand it qualitatively first, then size it — asking for a number before you know the vocabulary produces a confident wrong number.' }
};
function blNormKind(v){
  const s = String(v||'').toLowerCase();
  if(/mix|both|hybrid/.test(s)) return 'mixed';
  if(/^quant|number|ilo/.test(s)) return 'quantitative';
  if(/^qual|jako/.test(s)) return 'qualitative';
  return '';
}
/* Wording patterns, EN + PL (the repo ships in English but runs in the user's
   language). Each match keeps the phrase it fired on so the recommendation can
   quote it back instead of explaining research methods in the abstract. */
const BL_SIGNALS = [
  ['why',       /\b(why|what makes|what stops|what keeps|for what reason)\b|\bdlaczego\b|\bz jakiego powodu\b|\bco sprawia\b/i],
  ['behaviour', /\bwhat (exactly )?(does|do)\b[^?]*\bdo\b|\bhow (does|do)\b[^?]*\b(use|find|search|handle|decide|choose|start|manage)\b|\bwhat happens when\b|\bco robi\b|\bjak (używa|szuka|wybiera|decyduje|radzi)\b/i],
  ['decide',    /\bdecide|decision|choose|pick\b|\bdecyd|wybier/i],
  ['attitude',  /\btrust|feel|expect|frustrat|worry|annoy|prefer|satisf|confus|\bufa|czuje|oczekuje|frustr/i],
  ['count',     /\bhow many\b|\bhow much\b|\bwhat (%|percent|share|proportion|fraction)\b|\d\s?%|\bshare of\b|\bproportion\b|\bilu\b|\bile\b|\bjaki procent\b|\budział\b/i],
  ['freq',      /\bhow often\b|\bfrequen|\bevery (day|week|month)\b|\bper (day|week|month)\b|\bjak często\b|\bczęstotliwo/i],
  ['typical',   /\b(most|majority|typical|average|median|usually|generally)\b|\bwiększość\b|\bprzecięt|\bzazwyczaj\b/i],
  ['rare',      /\brare(ly)?\b|\boccasional|\bmoments? (when|where)\b|\bedge case\b|\brzadk|\bmomentach\b/i],
  // `\bexact\b` deliberately does not catch the adverb "exactly" — "what exactly
  // does she do" is an open question, not a request for a figure we already hold
  ['fact',      /\bexact\b|\bwhen did\b|\btenure\b|\bhow long (has|have)\b|\bwhen (she|he|they) (moved|switched|started|signed|upgraded)\b|\bwhich (plan|tier|version)\b|\bdokładna\b|\bkiedy dokładnie\b/i],
  ['market',    /\bmarket\b|\bindustry\b|\bcompetitor|\bbenchmark|\bpeople in general\b|\bpublished\b|\brynek|\bkonkurenc|\bbranż/i],
  ['price',     /\bprice|pricing|\bpay\b|willing.{0,10}pay|subscription cost|\bcena|cenow|zapłac|\bpłac/i],
  ['effect',    /\bif we\b|\bwould (it|they|users)\b|\bimpact\b|\bincrease|decrease|improve\b|\bczy (jeśli|gdyby)\b|\bwpływ\b/i],
  ['product',   /\bapp\b|\bscreen\b|\bfeature\b|\bflow\b|\bonboarding\b|\bsearch\b|\blibrary\b|\bplaylist|\bsettings\b|\bsign.?up\b|\bcheckout\b|\baplikacj|\bekran|\bfunkcj/i]
];
function blAnalyze(q){
  const f = { hit: {} };
  BL_SIGNALS.forEach(([k,re])=>{ const m = String(q||'').match(re); if(m){ f[k] = true; f.hit[k] = m[0].trim(); } });
  const prod = (getProduct()||{}).name;
  if(prod && new RegExp('\\b'+prod.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(q||'')) { f.product = true; f.hit.product = prod; }
  return f;
}
function blGuessKind(q){
  const f = blAnalyze(q);
  const quant = (f.count?2:0) + (f.freq?2:0) + (f.typical?1:0) + (f.market?1:0) + (f.fact?1:0) + (f.effect?1:0);
  const qual  = (f.why?2:0) + (f.behaviour?2:0) + (f.attitude?1:0) + (f.decide?1:0) + (f.rare?1:0);
  if(quant && qual && Math.abs(quant-qual) <= 1) return 'mixed';
  if(quant > qual) return 'quantitative';
  return 'qualitative';   // a backlog fed by persona conversations is mostly why/how material
}
function blKindOf(t, row){
  const stored = blNormKind(blGet(t, row, 'kind'));
  return stored ? { kind: stored, sure: true } : { kind: blGuessKind(blGet(t, row, 'question')), sure: false };
}

/* ---------- priority ----------
   The kind says what SHAPE of answer settles a question; the priority says
   whether it is worth booking a round for at all. Three states of provenance,
   and the difference between them is the whole point:

     nothing in the file → the app SUGGESTS one from the wording (dashed, "?").
                           A guess is not data, so it is never written.
     `critical`          → an AI run wrote it (a persona session files questions
                           with a priority attached). Still machine-set: another
                           run may revise it.
     `critical (locked)` → a human decided. AI must leave it alone, for good.

   That third state is the rule the repo already applies to `affinity_lock:` on
   a Signal and to `==highlights==` in a transcript: human-curated fields are
   never overwritten, only questioned. Clicking a priority here IS the human
   decision, so the app always writes the locked form. */
const BL_SEVS = {
  critical: { label:'Critical', ico:'●', blurb:'Blocks a decision someone is making now. Until this is answered, the choice it feeds is a coin toss with a slide deck.' },
  major:    { label:'Major',    ico:'◆', blurb:'Shapes the work without blocking it. Getting it wrong costs a rework, not a wrong bet — worth a slot in the next round.' },
  minor:    { label:'Minor',    ico:'○', blurb:'Good to know. Ask it while you have someone in the room anyway; never book a round for it on its own.' },
};
const BL_SEV_ORDER = ['critical','major','minor'];
function blNormSev(v){
  const s = String(v||'').toLowerCase().trim();
  const sev = /^crit|blocker|blok/.test(s) ? 'critical'
            : /^major|^high|^ważn|^wazn/.test(s) ? 'major'
            : /^minor|^low|^nice|^drobn/.test(s) ? 'minor' : '';
  return { sev, locked: !!sev && /\block(ed)?\b|\bmanual\b|\bręcz|\brecz|🔒/.test(s) };
}
function blSevCell(sev, locked){ return sev ? sev + (locked ? ' (locked)' : '') : ''; }
/* The suggestion, and the reason for it in the researcher's own words. Reads
   the question AND its Source / level column — "warm-up" and "blind spot" say
   more about urgency than any adjective in the sentence does. */
function blGuessSev(t, row){
  const q = blGet(t, row, 'question'), src = String(blGet(t, row, 'source')||'').toLowerCase();
  const f = blAnalyze(q);
  if(/warm.?up|rozgrzew/.test(src))
    return { sev:'minor', why: tr('Its source column says <b>warm-up</b> — context you collect on the way to the real question, not a reason to run a round.') };
  if(f.price)
    return { sev:'critical', why: blWhy('It is about what people will pay (<b>{x}</b>) — that number sets pricing, and pricing is hard to walk back.', f.hit.price) };
  if(f.effect)
    return { sev:'critical', why: blWhy('It asks whether something would actually change behaviour (<b>{x}</b>) — a build decision hangs on it.', f.hit.effect) };
  if(/blind spot/.test(src))
    return { sev:'critical', why: tr('It is a <b>blind spot</b> — nobody raised it, which is exactly why it is the kind of unknown that ends up deciding things.') };
  if(/contradict|cross-participant|sprzeczn/.test(src) || /contradict|disagree|sprzeczn/i.test(q||''))
    return { sev:'critical', why: tr('The data already disagrees with itself here — a contradiction left standing quietly discredits everything built on it.') };
  if(f.fact)
    return { sev:'minor', why: blWhy('It asks for a plain fact (<b>{x}</b>) — cheap to establish, and nothing much rests on it.', f.hit.fact) };
  if(f.why || f.behaviour || f.decide)
    return { sev:'major', why: tr('It is about why or how people act — the material personas are made of, so it shapes the work without blocking today’s decision.') };
  return { sev:'major', why: tr('Nothing in the wording marks it as urgent or as trivia — major is the honest middle until someone decides otherwise.') };
}
function blSevOf(t, row){
  const stored = blNormSev(blGet(t, row, 'priority'));
  if(stored.sev) return { sev: stored.sev, source: stored.locked ? 'human' : 'ai', sure: true };
  const g = blGuessSev(t, row);
  return { sev: g.sev, why: g.why, source: 'guess', sure: false };
}
const BL_SEV_SOURCE = {
  guess: 'Suggested from the wording — nothing is written to the file until you decide.',
  ai:    'Set by an AI run when the question was filed. Another run may revise it.',
  human: 'Your call — written as <code>(locked)</code>, so no AI run will change it again.'
};

/* ---------- method recommendations ----------
   Never one method: a single recommendation reads like a verdict, and the
   honest answer is almost always "this one first, that one to be sure". Each
   card has to earn its place — why THIS question (quoting its own wording),
   what the method cannot tell you, and where the answer lands in the graph. */
const BL_METHODS = [
  { id:'interview', kind:'qualitative', label:'In-depth interviews', shape:'5–8 sessions · 45–60 min',
    lands:'Signals — one file per observation, via <code>/extract-findings</code>', skill:'/interview-guide',
    blind:'How common it is. Six people are a pattern, never a percentage.',
    about:'A prepared but flexible one-to-one conversation: you have a guide, you follow what the person actually says. You ask about concrete recent situations („tell me about the last time…”) rather than opinions, because memory of a real event is far more reliable than a general judgement. Five to eight people of one type is usually where new themes stop appearing.',
    score:f=> 2 + (f.why?3:0) + (f.attitude?2:0) + (f.decide?2:0) + (f.behaviour?1:0) - (f.count?1:0),
    why:f=> f.why    ? blWhy("It asks <b>{x}</b> — a reason lives in someone's own words, and only a conversation gets at it.", f.hit.why)
          : f.decide ? blWhy('It is about how a decision gets made (<b>{x}</b>) — people can walk you through the last real time it happened, but cannot report it as a statistic.', f.hit.decide)
          : f.attitude? blWhy('It touches what someone feels (<b>{x}</b>) — a scale would give you a score without the reason behind it.', f.hit.attitude)
          : tr('It is open-ended: you need the vocabulary and the context before any number about it would mean anything.') },
  { id:'usability', kind:'qualitative', label:'Usability test / think-aloud', shape:'5 participants · task-based',
    lands:'Signals — observed behaviour, with the moment it broke', skill:'/extract-findings (after the sessions)',
    blind:'What people do on their own time. A given task is a rehearsal, not real life.',
    about:'You hand someone a realistic task and watch them do it, asking them to think out loud. You do not help and you do not explain — every place they hesitate is the finding. Five participants surface most of the serious problems in one flow, which is why this is the cheapest way to test a design before it ships.',
    score:f=> (f.behaviour?3:0) + (f.product?2:0) + (f.decide?1:0),
    why:f=> tr('It is about what someone actually <b>does</b>{where} — watching beats asking, because self-reported behaviour and observed behaviour routinely disagree.')
              .replace('{where}', f.hit.product ? ' '+tr('in')+' '+esc(f.hit.product) : '') },
  { id:'diary', kind:'qualitative', label:'Diary study', shape:'7–14 days · 6–10 participants',
    lands:'Signals — moments captured when they happen', skill:'/extract-findings (after the round)',
    blind:'Anything about people who drop out — diaries lose participants, and the ones who stay are the diligent ones.',
    about:'Participants report their own moments over one to two weeks — a short note, a photo, a voice memo whenever the thing you are studying happens. It catches what an interview cannot, because people do not remember the small irritations of a Tuesday. Expect to nudge people and to lose some of them along the way.',
    score:f=> (f.rare?3:0) + (f.freq?2:0) + (f.behaviour?1:0),
    why:f=> f.rare ? blWhy('It is about {x} moments — exactly what memory smooths over in an interview. Catching them as they happen is the only reliable way.', f.hit.rare, true)
                   : tr('It spans time rather than a single sitting, so a one-hour interview would be reconstructing it from memory.') },
  { id:'analytics', kind:'quantitative', label:'Product analytics', shape:'one query · no recruiting', skillLabel:'/analytics-sync',
    lands:'Evidence — an aggregate number, never a Signal', skill:'/analytics-sync',
    blind:'Why any of it happens. Events record the what and leave the motive out.',
    about:'Counting what your product already records: how many people reached a screen, how often they come back, where they drop out. No recruiting and no waiting — but it only answers questions about behaviour someone thought to track, and a number without a reason behind it is easy to read the way you were hoping to read it.',
    // base 1: whatever the question, a look at data we already have is the
    // cheapest sanity check there is — it just rarely deserves to lead
    score:f=> 1 + (f.count?3:0) + (f.freq?3:0) + (f.fact?2:0) + (f.typical?2:0) + (f.product?1:0) - (f.market?2:0),
    why:f=> f.fact ? blWhy('It asks for a fact we already hold (<b>{x}</b>) — that sits in our own data, so asking a person to recall it adds error for nothing.', f.hit.fact)
          : (f.count||f.freq||f.typical) ? blWhy('It asks <b>{x}</b> — if the event is already tracked, this is an answer today instead of a whole research round.', f.hit.count||f.hit.freq||f.hit.typical)
          : tr('The question has no number in it, but the behaviour behind it is probably already tracked — one query tells you how often this even comes up, and whether it deserves a round at all.') },
  { id:'survey', kind:'quantitative', label:'Sized survey', shape:'n from your population — Settings shows the margin of error',
    lands:'Evidence — a share with a confidence interval', skill:'/analytics-sync (or your survey tool)',
    blind:'What people actually do. A survey collects claims, and the wording you choose sets the answer you get.',
    about:'A short set of closed questions sent to enough people that the result carries a margin of error you can state out loud. It is for checking how widespread something is — never for discovering what that something is, because a question you wrote before you understood the topic will be answered politely and uselessly.',
    score:f=> (f.count?3:0) + (f.typical?2:0) + (f.price?2:0) + (f.market?1:0),
    why:f=> (f.count||f.typical) ? blWhy('It asks how widespread something is (<b>{x}</b>) — that is a sample-size question, and the app already computes the margin of error against your population.', f.hit.count||f.hit.typical)
          : f.price ? blWhy('Willingness to pay (<b>{x}</b>) is a distribution, not an opinion — a sized survey (Van Westendorp or similar) reads it far better than a handful of interviews.', f.hit.price)
          : tr('Once the interviews tell you what to ask and in whose words, this is how you check the pattern holds past the few people you spoke to.') },
  { id:'desk', kind:'quantitative', label:'Desk research', shape:'hours, not weeks · published sources',
    lands:'Evidence — cited, with a retrieval date', skill:'/researcher',
    blind:'Anything specific to your users. Someone else\'s sample is not yours.',
    about:'Looking for the answer in what has already been published — industry reports, public statistics, competitors’ own numbers. Hours instead of weeks, on one condition: you read the primary source and write down who measured it, on what sample and when. A figure repeated by an article about a report is not the report.',
    score:f=> (f.market?3:0) + (f.price?1:0) + (f.count?1:0),
    why:f=> f.market ? blWhy('It reaches past our own users (<b>{x}</b>) — someone has likely published this already, and re-running it ourselves would be expensive duplication.', f.hit.market)
                     : tr('A published number may already settle this, which is the cheapest possible answer — as long as the source is named and dated.') },
  { id:'experiment', kind:'quantitative', label:'A/B test / experiment', shape:'needs live traffic + a working variant',
    lands:'Evidence — a measured effect', skill:'(engineering, then /extract-findings for what you learn)',
    blind:'Why the losing variant lost. You get the outcome, not the mechanism.',
    about:'Two versions running side by side on real traffic, with people split at random, so the difference between them can be attributed to the change itself. It is the only method that proves cause — and it needs a working variant, enough traffic, and a metric agreed before the test starts rather than after you have seen the result.',
    score:f=> (f.effect?3:0) + (f.product?1:0),
    why:f=> blWhy('It is a question about effect (<b>{x}</b>) — comparison against a control is the only method that answers it causally.', f.hit.effect||tr('would it change behaviour')) }
];
/* Top two of the question's own kind, plus the best from the other side —
   the sequence (understand → size, or size → understand) is the recommendation. */
function blRecommend(question, kind){
  const f = blAnalyze(question);
  const ranked = BL_METHODS.map(m=> ({ m, s: m.score(f) })).filter(x=> x.s > 0).sort((a,b)=> b.s - a.s);
  const primary = kind==='quantitative' ? 'quantitative' : 'qualitative';
  const other = primary==='qualitative' ? 'quantitative' : 'qualitative';
  const pick = [];
  ranked.filter(x=> x.m.kind===primary).slice(0, kind==='mixed'?2:2).forEach(x=> pick.push(x.m));
  const o = ranked.find(x=> x.m.kind===other);
  if(o) pick.push(o.m);
  // never fewer than three — one recommendation reads like a verdict
  ranked.forEach(x=>{ if(pick.length<3 && !pick.includes(x.m)) pick.push(x.m); });
  BL_METHODS.forEach(m=>{ if(pick.length<3 && !pick.includes(m)) pick.push(m); });
  return { f, methods: pick.slice(0,3), primary, other };
}
const BL_RANK_LABEL = ['Start here', 'Or', 'Then, to be sure'];
/* One sentence, one matched fragment from the question itself. The fragment is
   the researcher's own wording — never translated, only quoted. */
function blWhy(sentence, hit, plain){
  const frag = esc(String(hit||''));
  return tr(sentence).replace('{x}', plain ? frag : frag);
}

/* ---- source of truth: demo sandbox (this browser) vs the file on disk ---- */
function backlogRaw(){ return WS==='demo' ? (store.get('at-backlog-demo') || BACKLOG_DEMO_RAW) : BACKLOG_RAW; }
function blOpenCount(){
  const raw = backlogRaw(); if(!raw) return 0;
  const sec = parseBacklog(raw).open;
  return sec && sec.table ? sec.table.rows.length : 0;
}
function renderBacklogCount(){
  const el = document.getElementById('backlogCount'); if(!el) return;
  const n = blOpenCount();
  el.textContent = n || ''; el.style.display = n ? '' : 'none';
}
async function blSave(raw, msg){
  const prev = backlogRaw();
  const bail = m => { if(m) toast(m); renderBacklog(); return false; };   // re-parse from the file — never leave a mutated copy on screen
  if(WS==='demo'){ store.set('at-backlog-demo', raw); }
  else {
    if(!DIRHANDLE){
      if(!window.showDirectoryPicker) return bail('Saving needs Chrome or Edge (File System Access API)');
      toast(tr('Pick your project’s root folder to save the backlog…'));
      if(!(await loadFromPicker())) return bail();
    }
    try{ await writeRepoFile(BACKLOG_FILE, raw); }
    catch(err){ return bail('Save failed: '+err.message); }
    BACKLOG_RAW = raw;
  }
  BL_EDIT = null; BL_MODE = 'edit';
  renderBacklog(); renderBacklogCount();
  toast(msg, prev==null ? undefined : { label:tr('Undo'), fn: ()=> blSave(prev, tr('Reverted — backlog back as it was ✓')) });
  return true;
}

/* ---- render ---- */
function blPersonaLink(name){
  if(!name) return '';
  const plain = stripLinks(name).toLowerCase();
  const hit = wsEntities().find(e=> e.type==='Persona' &&
    (e.title.toLowerCase()===plain || e.title.toLowerCase().split(/\s+[—–-]\s+/)[0].trim()===plain));
  return hit ? hit.id : '';
}
/* ---------- the right-hand pane ----------
   The left column is the list of what we do not know; this is everything we
   already hold about the one question you picked — how urgent it is, what
   shape of answer would settle it, and the two or three methods that would
   get it. Nothing here is new information: it is the same recommendation the
   inline panel used to hide behind a caret, given a permanent home. */
function blMethodCards(q, kind){
  const rec = blRecommend(q, kind);
  /* Where the answer lands in the graph, which skill writes it — true, and
     nobody reading a method for the first time needs it on the card. It moved
     into the sheet behind the ⓘ, with the explanation of the method itself. */
  return rec.methods.map((m,i)=>`
    <div class="bl-m ${m.kind}">
      <div class="bl-m-rank">${tr(BL_RANK_LABEL[i]||'Also')}</div>
      <div class="bl-m-body">
        <h4>${tr(m.label)}<span class="bl-m-kind">${BL_KINDS[m.kind].ico} ${tr(BL_KINDS[m.kind].label)}</span>
          <button class="bl-m-info" data-act="about" data-m="${m.id}"
            title="${esc(tr('What this method is'))}" aria-label="${esc(tr('What this method is'))}">${BL_ICONS.info}</button></h4>
        <div class="bl-m-shape">${tr(m.shape)}</div>
        <p class="bl-m-why"><b>${tr('Why this question:')}</b> ${m.why(rec.f)}</p>
        <p class="bl-m-blind"><b>${tr('Won’t tell you:')}</b> ${tr(m.blind)}</p>
      </div>
    </div>`).join('');
}
/* ---------- the method sheet ----------
   Slides in from the right over the pane. Holds what the card deliberately
   does not: what the method actually is, and the technical tail (where the
   answer lands in the graph, which skill writes it) for when you want it. */
function blSheet(){
  if(!BL_SHEET) return '';
  const m = BL_METHODS.find(x=> x.id===BL_SHEET);
  if(!m) return '';
  return `<button class="bl-sheet-back" data-act="about-close" aria-label="${esc(tr('Close'))}"></button>
    <aside class="bl-sheet" role="dialog" aria-modal="true" aria-label="${esc(tr(m.label))}">
      <div class="bl-sheet-head">
        <div>
          <div class="bl-sheet-kind">${BL_KINDS[m.kind].ico} ${tr(BL_KINDS[m.kind].label)}</div>
          <h3>${tr(m.label)}</h3>
        </div>
        <button class="bl-sheet-x" data-act="about-close" aria-label="${esc(tr('Close'))}">${BL_ICONS.x}</button>
      </div>
      <div class="bl-sheet-body">
        <p class="bl-sheet-shape">${tr(m.shape)}</p>
        <p class="bl-sheet-about">${tr(m.about)}</p>
        <div class="bl-sheet-block">
          <div class="bl-d-h">${tr('Won’t tell you')}</div>
          <p>${tr(m.blind)}</p>
        </div>
        <div class="bl-sheet-block">
          <div class="bl-d-h">${tr('Where the answer lands')}</div>
          <p>${tr(m.lands)}</p>
          <p class="bl-sheet-skill"><code>${esc(m.skill)}</code></p>
        </div>
      </div>
    </aside>`;
}
function blDetailEmpty(){
  return `<div class="bl-detail bl-detail-empty">
      <h3>${esc(tr('Pick a question'))}</h3>
      <p>${esc(tr('Every row carries what we already know about answering it: how urgent it looks, whether it needs a story or a number, and the two or three methods that fit — with what each one will not tell you.'))}</p>
    </div>`;
}
function blDetail(){
  if(BL_EDIT) return blFormPane();
  const at = BL_SEL ? blRowAt(BL_SEL) : null;
  if(!at || !at.row){ BL_SEL = null; return blDetailEmpty(); }
  const { which, t, row } = at;
  const q = blGet(t,row,'question') || tr('(empty row)');
  const date = blGet(t,row,'date'), persona = blGet(t,row,'persona');
  const src = blGet(t,row,'source'), status = blGet(t,row,'status');
  const pid = blPersonaLink(persona);
  const { kind, sure } = blKindOf(t, row);
  const S = blSevOf(t, row);
  const K = BL_KINDS[kind];
  return `<div class="bl-detail">
    <div class="bl-d-head">
      <div class="bl-d-q">${esc(q)}</div>
      <div class="bl-meta">
        ${persona ? (pid ? `<a class="bl-chip bl-link" href="#${pid}">${esc(persona)}</a>` : `<span class="bl-chip">${esc(persona)}</span>`) : ''}
        ${src ? `<span class="bl-chip bl-src">${esc(src)}</span>` : ''}
        ${status ? `<span class="bl-chip bl-state ${which==='open'?'on':''}">${esc(status)}</span>` : ''}
      </div>
      <div class="bl-d-acts">
        <button class="btn btn-ghost btn-sm" data-act="edit" data-k="${BL_SEL}">${tr('Edit')}</button>
        ${which==='open'
          ? `<button class="btn btn-ghost btn-sm" data-act="close" data-k="${BL_SEL}" title="${esc(tr('Research answered it — move it down with a note on what answered it'))}">${tr('Mark as answered')}</button>`
          : `<button class="btn btn-ghost btn-sm" data-act="reopen" data-k="${BL_SEL}" title="${esc(tr('Put it back on the list to run'))}">${tr('Reopen')}</button>`}
        <button class="bl-del" data-act="del" data-k="${BL_SEL}" title="${esc(tr('Delete the row entirely'))}" aria-label="${esc(tr('Delete the row entirely'))}">${BL_ICONS.trash}</button>
      </div>
    </div>

    <div class="bl-d-block">
      <div class="bl-d-h">${tr('Set priority')}</div>
      <div class="seg bl-sev-seg">${BL_SEV_ORDER.map(s=>
        `<button data-act="sev" data-k="${BL_SEL}" data-sev="${s}" class="sev-opt ${s}${S.sev===s && S.sure ? ' active' : ''}" title="${esc(tr(BL_SEVS[s].blurb))}">${BL_SEVS[s].ico} ${tr(BL_SEVS[s].label)}</button>`).join('')}</div>
      <p class="bl-d-note"><b class="sev-${S.sev}">${BL_SEVS[S.sev].ico} ${tr(BL_SEVS[S.sev].label)}${S.sure?'':' '+tr('(suggested)')}</b> — ${tr(BL_SEVS[S.sev].blurb)}</p>
      ${S.source==='human' ? '' : `<p class="bl-d-note bl-prov prov-${S.source}">${tr(BL_SEV_SOURCE[S.source])}${S.why ? ' <i>'+S.why+'</i>' : ''}</p>`}
    </div>

    <div class="bl-d-block">
      <div class="bl-d-h">${tr('Type of research')}</div>
      <div class="seg bl-kind-seg">${Object.keys(BL_KINDS).map(k=>
        `<button data-act="kind" data-k="${BL_SEL}" data-kind="${k}" class="${sure&&kind===k?'active':''}" title="${esc(tr(BL_KINDS[k].blurb))}">${tr(BL_KINDS[k].label)}</button>`).join('')}</div>
      <p class="bl-d-note"><b>${K.ico} ${tr(K.label)}${sure?'':' '+tr('(suggested)')}</b> — ${tr(K.blurb)}</p>
      ${sure?'':`<p class="bl-d-note bl-prov prov-guess">${tr('Guessed from the wording; nothing is written to the file until you confirm it.')}</p>`}
    </div>

    <div class="bl-d-block">
      <div class="bl-d-h">${tr('How to answer it')}</div>
      <div class="bl-m-list">${blMethodCards(blGet(t,row,'question'), kind)}</div>
      <p class="bl-panel-foot">${tr('<b>Triangulation</b> — the name is from surveying: you fix a point from two others, and the third corner of the triangle is the thing you are locating. Same here — one question, seen through methods that fail in different ways. Three are suggested above; two is the minimum, and the third earns its place exactly when the first two disagree. Agreement raises confidence; disagreement is a finding, not something to average away.')}</p>
    </div>
    ${blSheet()}
  </div>`;
}
/* One row in the left column: the question, in full, as the headline. The kind
   tag and the date used to ride underneath — both are in the pane a click away,
   and neither is something you scan a list by. What stays is the priority mark
   you sort by eye on, who it came from, and the lock. */
function blRowCard(which, idx, t, row){
  const key = which+':'+idx;
  const q = blGet(t,row,'question') || row.find(c=>c) || '(empty row)';
  const persona = blGet(t,row,'persona').replace(/^[-—–\s]+$/,'');   // "—" in the cell means none
  const { kind } = blKindOf(t, row);
  const S = blSevOf(t, row);
  const sel = BL_SEL===key;
  return `<button class="bl-row${sel?' sel':''}" data-act="sel" data-k="${key}" data-kind="${kind}" aria-current="${sel}">
    <span class="bl-sev-mark sev-${S.sev}${S.sure?'':' guess'}" title="${esc(tr(BL_SEVS[S.sev].label)+(S.sure?'':' — '+tr('suggested')))}">${BL_SEVS[S.sev].ico}</span>
    <span class="bl-q">${esc(q)}</span>
    ${persona || S.source==='human' ? `<span class="bl-meta">
      ${persona ? `<span class="bl-chip">${esc(persona)}</span>` : ''}
      ${S.source==='human' ? `<span class="bl-chip bl-lock" title="${esc(tr('Priority set by you — AI leaves it alone'))}">🔒</span>` : ''}
    </span>` : ''}
  </button>`;
}
function blField(h, i, val){
  if(/question/i.test(h)) return `<label class="bl-f"><span>${esc(tr(h))}</span><textarea class="set-input" data-i="${i}" rows="3" placeholder="${esc(tr('What do we need to hear from a real user?'))}">${esc(val)}</textarea></label>`;
  if(/^kind|method|approach/i.test(h)){
    const cur = blNormKind(val);
    return `<label class="bl-f"><span>${esc(tr(h))}</span><select class="set-input" data-i="${i}">
      <option value=""${cur?'':' selected'}>${tr('— let the wording suggest it —')}</option>
      ${Object.keys(BL_KINDS).map(k=>`<option value="${k}"${cur===k?' selected':''}>${tr(BL_KINDS[k].label)}</option>`).join('')}
    </select></label>`;
  }
  if(/^priorit|^severit|^prio/i.test(h)){
    /* picking one here is a human decision too, so every option carries the
       (locked) marker — the same thing the buttons in the pane write */
    const cur = blNormSev(val);
    return `<label class="bl-f"><span>${esc(tr(h))}</span><select class="set-input" data-i="${i}">
      <option value=""${cur.sev?'':' selected'}>${tr('— let the wording suggest it —')}</option>
      ${BL_SEV_ORDER.map(s=>`<option value="${esc(blSevCell(s,true))}"${cur.sev===s?' selected':''}>${tr(BL_SEVS[s].label)}${cur.sev===s&&!cur.locked?' — '+tr('set by AI'):''}</option>`).join('')}
    </select></label>`;
  }
  return `<label class="bl-f"><span>${esc(tr(h))}</span><input class="set-input" data-i="${i}" value="${esc(val)}"${/persona/i.test(h)?' list="blPersonas"':''}${/source|level/i.test(h)?' list="blSources"':''}${/^date/i.test(h)?' placeholder="YYYY-MM-DD"':''}></label>`;
}
/* the form takes over the right-hand pane — the row stays put in the list, so
   you never lose your place while editing one */
function blFormPane(){
  const closing = BL_MODE==='close';
  const isNew = BL_EDIT==='new';
  const t = isNew ? BL.open.table : blRowAt(BL_EDIT).t;
  const row = isNew ? t.header.map(()=> '') : blRowAt(BL_EDIT).row;
  return `<div class="bl-detail bl-editing">
    <div class="bl-d-head"><div class="bl-d-q">${tr(isNew ? 'New question' : closing ? 'Closing this question' : 'Edit question')}</div></div>
    ${closing ? `<div class="bl-form-head">${tr('The backlog is append-honest, so say what answered it. It moves to <b>Closed / turned into research</b>, it is not lost.')}</div>` : ''}
    ${isNew ? `<div class="bl-form-head">${tr('A question for <b>real</b> people. What a persona could not answer from data is exactly what belongs here.')}</div>` : ''}
    <div class="bl-form">
      ${t.header.map((h,i)=> blField(h, i, row[i]||'')).join('')}
      ${closing ? `<label class="bl-f bl-f-wide"><span>${tr('What answered it?')}</span><input class="set-input" id="blWhy" placeholder="${esc(tr('e.g. Signal “Emma builds her own playlists” (interview 2026-07-18)'))}" autofocus></label>` : ''}
    </div>
    <div class="bl-form-acts">
      <button class="btn btn-primary btn-sm" data-act="save" data-k="${BL_EDIT}">${tr(closing?'Close question':'Save')}</button>
      <button class="btn btn-ghost btn-sm" data-act="cancel">${tr('Cancel')}</button>
    </div>
  </div>`;
}
/* the left column: one list at a time (open or answered), filtered by the
   tiles above it and by the kind segment */
/* the rows the list shows, most urgent first — "what is critical" is the
   question you arrive with, so it is never at the bottom. Ties keep file order. */
function blShown(){
  const t = (BL_LIST==='open' ? BL.open : BL.closed).table;
  const rank = r => BL_SEV_ORDER.indexOf(blSevOf(t,r).sev);
  return t.rows.map((r,i)=>({r,i})).filter(({r})=>
    (BL_KIND_FILTER==='all' || blKindOf(t,r).kind===BL_KIND_FILTER) &&
    (BL_SEV_FILTER==='all'  || blSevOf(t,r).sev===BL_SEV_FILTER))
    .sort((a,b)=> rank(a.r)-rank(b.r) || a.i-b.i);
}
function blListPane(){
  const which = BL_LIST;
  const sec = which==='open' ? BL.open : BL.closed;
  const t = sec.table, rows = t.rows;
  const shown = blShown();
  const hidden = rows.length - shown.length;
  const cards = shown.map(({r,i})=> blRowCard(which, i, t, r)).join('');
  /* The heading is the status, not the section name: a question is either still
     to be run, or already answered. That is the whole state machine, and it
     belongs where you are looking at the list. */
  return `<div class="bl-list">
    <div class="bl-list-head">
      <h3>${tr(which==='open' ? 'To run' : 'Answered')}<span class="n">${shown.length}${hidden?` / ${rows.length}`:''}</span></h3>
    </div>
    <label class="filter-pill bl-list-filter">
      ${BL_ICONS.search}
      <input id="blFilter" placeholder="${esc(tr('Filter questions…'))}" autocomplete="off" aria-label="${esc(tr('Filter backlog questions'))}">
    </label>
    <div class="bl-rows">${cards || `<div class="bl-empty">${rows.length
      ? tr('Nothing matches the filters — {n} hidden.').replace('{n}', hidden)
      : tr(which==='open' ? 'Nothing open. After the next persona conversation there will be.' : 'Nothing closed yet — questions land here once real research answered them.')}</div>`}</div>
  </div>`;
}
/* the split, counted — a backlog that is 90% "how many" is a signal in itself:
   you are trying to measure something nobody has understood yet */
function blKindCounts(){
  const c = { all:0, qualitative:0, quantitative:0, mixed:0 };
  const t = (BL_LIST==='open' ? BL.open : BL.closed).table;
  t.rows.forEach(r=>{ c.all++; c[blKindOf(t,r).kind]++; });
  return c;
}
/* ---------- the tiles ----------
   Priority at the top, because "what is critical" is the question you arrive
   with. Each tile is also the filter for its own severity — one control, not a
   readout plus a duplicate segment underneath it. */
function blSevCounts(){
  const t = (BL_LIST==='open' ? BL.open : BL.closed).table;
  const c = { all: t.rows.length, critical:0, major:0, minor:0, guess:0, ai:0, human:0 };
  t.rows.forEach(r=>{ const s = blSevOf(t,r); c[s.sev]++; c[s.source]++; });
  return c;
}
function blTiles(c){
  const tile = (k, label, n, cls) => `
    <button class="bl-tile${BL_SEV_FILTER===k?' on':''} ${cls||''}" data-act="sevfilter" data-sev="${k}"
            aria-pressed="${BL_SEV_FILTER===k}">
      <span class="bl-tile-top">${k==='all' ? '' : `<i class="bl-sev-mark sev-${k}">${BL_SEVS[k].ico}</i>`}${esc(tr(label))}</span>
      <span class="bl-tile-n">${n}</span>
    </button>`;
  return `<div class="bl-tiles">
    ${tile('all', BL_LIST==='open' ? 'All to run' : 'All answered', c.all)}
    ${tile('critical','Critical', c.critical, 'critical')}
    ${tile('major','Major', c.major, 'major')}
    ${tile('minor','Minor', c.minor, 'minor')}
    <div class="bl-tile bl-tile-static">
      <span class="bl-tile-top">${esc(tr('Who set them'))}</span>
      <span class="bl-tile-prov">
        <span title="${esc(tr('Set by you — locked'))}"><b>${c.human}</b> ${esc(tr('yours'))}</span>
        <span title="${esc(tr('Written by an AI run'))}"><b>${c.ai}</b> ${esc(tr('AI'))}</span>
        <span title="${esc(tr('Only a suggestion from the wording — nothing in the file'))}"><b>${c.guess}</b> ${esc(tr('suggested'))}</span>
      </span>
    </div>
  </div>`;
}
function blEmptyState(){
  if(WS!=='project') return `<div class="set-banner">${tr('The demo backlog could not be loaded.')}</div>`;
  if(!DIRHANDLE) return `<div class="set-banner">${tr('Your backlog lives in <code>Research backlog.md</code> in your project folder. Connect the folder to read and edit it here — it never leaves this machine.')}
    ${window.showDirectoryPicker ? `<div style="margin-top:10px"><button class="btn btn-primary btn-sm" id="blPick">${tr('Choose project folder…')}</button></div>` : `<b>${tr('Editing requires Chrome or Edge')}</b> — ${tr('this browser cannot write local files.')}`}</div>`;
  return `<div class="set-banner">${tr('No <code>Research backlog.md</code> in <b>{folder}</b> yet. It is created the first time a persona conversation leaves a question behind — or start it here.').replace('{folder}', esc(DIRHANDLE.name))}
    <div style="margin-top:10px"><button class="btn btn-primary btn-sm" id="blCreate">${tr('Create Research backlog.md')}</button></div></div>`;
}
const BL_STARTER = `# Research backlog — questions from persona sessions

A collector of research questions that emerged from AI persona conversations (\`/persona-talk\`) and queries (\`/persona-query\`).

## Open questions

| Date | Persona | Question | Source / level | Status | Priority |
|------|---------|----------|----------------|--------|----------|

## Closed / turned into research

<!-- Move an item here once you plan or run a study. After research:
     new transcript → /extract-findings → Signals/ (+ possibly new Evidence). -->
_(empty)_
`;
function renderBacklog(){
  const raw = backlogRaw();
  grid.className = 'bl-wrap';
  /* the head is re-set here, not only on entry: switching language re-renders
     this page and nothing else, and a Polish page under an English title is
     exactly the kind of seam that reads as a bug */
  pageTitle.textContent = tr('Research backlog');
  pageSub.textContent = tr('The only thing a persona conversation may leave behind: questions for real people. Sharpen them here, then take them to an interview.');
  pageSub.style.display = '';
  if(raw==null){
    grid.innerHTML = blEmptyState();
    const pick = grid.querySelector('#blPick');
    if(pick) pick.onclick = async ()=>{ if(await loadFromPicker()) { await backlogEnter(); } };
    const mk = grid.querySelector('#blCreate');
    if(mk) mk.onclick = async ()=>{ if(await blSave(BL_STARTER, tr('Research backlog.md created ✓'))) renderBacklogCount(); };
    renderBacklogCount(); return;
  }
  BL = parseBacklog(raw);
  const personas = wsEntities().filter(e=>e.type==='Persona').map(e=> e.title);
  const sandbox = WS==='demo';
  const sevC = blSevCounts(), kindC = blKindCounts();
  const nOpen = BL.open.table.rows.length, nClosed = BL.closed.table.rows.length;
  // how many filters are actually narrowing the list — the badge on the button,
  // so a filtered list can never look like the whole list
  // an empty right pane on arrival is a dead end — open the most urgent question
  if(!BL_EDIT && !(BL_SEL && blRowAt(BL_SEL).row)){ const f = blShown()[0]; BL_SEL = f ? BL_LIST+':'+f.i : null; }
  const nFilters = (BL_KIND_FILTER!=='all'?1:0) + (BL_SEV_FILTER!=='all'?1:0) + (BL_LIST!=='open'?1:0);
  grid.innerHTML = `
    <datalist id="blPersonas">${personas.map(p=>`<option value="${esc(p)}"></option>`).join('')}</datalist>
    <datalist id="blSources">${['warm-up','known unknown (L1)','blind spot — AI-inferred, not raised','persona query','thin claim (L2)'].map(s=>`<option value="${esc(s)}"></option>`).join('')}</datalist>

    ${blTiles(sevC)}

    <div class="bl-bar">
      <button class="btn btn-outline btn-sm bl-filter-btn${nFilters?' on':''}" data-act="filters" aria-expanded="${BL_FILTERS_OPEN}">
        ${BL_ICONS.filter} ${tr('Filter')}${nFilters?`<span class="bl-filter-n">${nFilters}</span>`:''}
      </button>
      <a class="bl-help-link" href="#help:interface" title="${esc(tr('How this page works, and what the terms mean'))}">${BL_ICONS.help} ${tr('Help')}</a>
      ${sandbox ? `<span class="bl-sandbox">${tr('Demo — edits stay in this browser')}</span>` : ''}
      <span class="bl-bar-acts">
        ${BL_LIST==='open' && nOpen ? `<button class="btn btn-outline btn-sm" data-act="guide" title="${esc(tr('Copies a prompt that turns the questions on screen into a discussion guide for real interviews'))}">⧉ ${tr('Interview guide prompt')}</button>` : ''}
        <button class="btn btn-primary btn-sm" data-act="new">＋ ${tr('Add a research question')}</button>
      </span>
    </div>
    ${BL_FILTERS_OPEN ? `<div class="bl-filters">
      <div class="bl-filters-row">
        <span class="bl-filters-lab">${tr('Status')}</span>
        <span class="seg seg-lg bl-list-seg">
          <button data-act="list" data-list="open" class="${BL_LIST==='open'?'active':''}">${tr('To run')}<span class="seg-n">${nOpen}</span></button>
          <button data-act="list" data-list="closed" class="${BL_LIST==='closed'?'active':''}">${tr('Answered')}<span class="seg-n">${nClosed}</span></button>
        </span>
      </div>
      <div class="bl-filters-row">
        <span class="bl-filters-lab">${tr('Type of research')}</span>
        <span class="seg seg-lg bl-kind-filter">${[['all','Everything'],['qualitative','◐ Qualitative'],['quantitative','▦ Quantitative'],['mixed','◑ Mixed']].map(([k,lab])=>
          `<button data-act="kindfilter" data-kind="${k}" class="${BL_KIND_FILTER===k?'active':''}">${tr(lab)}<span class="seg-n">${kindC[k]}</span></button>`).join('')}</span>
      </div>
    </div>` : ''}

    <div class="bl-cols">
      ${blListPane()}
      ${blDetail()}
    </div>`;
  /* Typing filters the rows in place rather than re-rendering the page — the
     caret stays where it is, and the count in the heading follows along so a
     filtered list never passes for the whole list. */
  const filt = grid.querySelector('#blFilter');
  if(filt){
    if(BL_TEXT){ filt.value = BL_TEXT; }
    const apply = ()=>{
      BL_TEXT = filt.value.trim();
      const f = BL_TEXT.toLowerCase();
      let n = 0;
      grid.querySelectorAll('.bl-rows .bl-row').forEach(r=>{
        const hit = !f || r.textContent.toLowerCase().includes(f);
        r.style.display = hit ? '' : 'none'; if(hit) n++;
      });
      const head = grid.querySelector('.bl-list-head h3 .n');
      if(head && f) head.textContent = n + ' / ' + (BL_LIST==='open' ? nOpen : nClosed);
    };
    filt.oninput = apply;
    if(BL_TEXT) apply();
  }
  const foc = grid.querySelector('.bl-editing textarea, .bl-editing input');
  if(foc) foc.focus();
}

/* ---- actions ---- */
function blRowAt(key){
  const [which, i] = key.split(':');
  const sec = which==='open' ? BL.open : BL.closed;
  return { which, sec, t: sec.table, idx: +i, row: sec.table.rows[+i] };
}
function blReadForm(card, header){
  const row = header.map(()=> '');
  card.querySelectorAll('[data-i]').forEach(el=>{ row[+el.dataset.i] = el.value.trim(); });
  return row;
}
grid.addEventListener('click', ev=>{
  if(!BACKLOG_ACTIVE) return;
  const b = ev.target.closest('button[data-act]'); if(!b) return;
  const act = b.dataset.act, key = b.dataset.k;
  if(act==='filters'){ BL_FILTERS_OPEN = !BL_FILTERS_OPEN; renderBacklog(); return; }
  if(act==='about'){ BL_SHEET = b.dataset.m; renderBacklog(); return; }
  if(act==='about-close'){ BL_SHEET = null; renderBacklog(); return; }
  if(act==='new'){ BL_EDIT='new'; BL_MODE='new'; renderBacklog(); return; }
  if(act==='cancel'){ BL_EDIT=null; BL_MODE='edit'; renderBacklog(); return; }
  if(act==='edit'){ BL_EDIT=key; BL_MODE='edit'; renderBacklog(); return; }
  /* The backlog's way out: the questions on screen, handed to /interview-guide
     in the dialect of the agent you use. A persona conversation leaves
     questions; this is where they become a real session. */
  if(act==='guide'){
    const t = BL.open.table, agent = pjAgent();
    const qs = blShown().map(({r})=> '- ' + (blGet(t,r,'question') || r.find(c=>c))).join('\n');
    const cmd = agent==='codex' ? '$interview-guide' : (agent==='gemini' || agent==='other') ? tr('Follow .claude/skills/interview-guide/SKILL.md.') : '/interview-guide';
    const txt = cmd + '\n\n' + tr('Build the discussion guide for our next real interviews from these open questions in Research backlog.md, most urgent first:') + '\n' + qs + promptLang();
    const done = ()=> toast(tr('Prompt copied — paste it into your AI assistant ✓'));
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, ()=> fallbackCopy(txt, done)); else fallbackCopy(txt, done);
    return;
  }
  if(act==='sel'){ BL_SEL = key; BL_EDIT = null; BL_SHEET = null; renderBacklog(); return; }
  if(act==='list'){ BL_LIST = b.dataset.list; BL_SEL = null; BL_EDIT = null; renderBacklog(); return; }
  if(act==='kindfilter'){ BL_KIND_FILTER = b.dataset.kind; renderBacklog(); return; }
  if(act==='sevfilter'){ BL_SEV_FILTER = BL_SEV_FILTER===b.dataset.sev ? 'all' : b.dataset.sev; renderBacklog(); return; }
  /* Clicking a priority IS the human decision — so it is always written in the
     locked form. Clicking the one already locked clears it, back to whatever
     the wording (or the next AI run) suggests. */
  if(act==='sev'){
    const { t, row } = blRowAt(key);
    const cur = blNormSev(blGet(t, row, 'priority'));
    const pick = b.dataset.sev;
    const same = cur.sev===pick && cur.locked;
    blEnsureCol(t, 'priority', 'Priority');
    row[blMap(t.header).priority] = same ? '' : blSevCell(pick, true);
    blSave(blSerialize(BL), same
      ? tr('Priority cleared — back to a suggestion')
      : tr('Priority: {sev} — locked, no AI run will change it ✓').replace('{sev}', tr(BL_SEVS[pick].label)));
    return;
  }
  if(act==='kind'){
    const { t, row } = blRowAt(key);
    const pick = b.dataset.kind;
    const same = blNormKind(blGet(t,row,'kind'))===pick;
    blEnsureCol(t, 'kind', 'Kind');                        // the column is created the first time a human tags something
    row[blMap(t.header).kind] = same ? '' : pick;  // clicking the active tag clears it, back to a suggestion
    blSave(blSerialize(BL), same ? tr('Tag cleared — back to a suggestion from the wording') : tr('Tagged {kind} ✓ — written into the Kind column').replace('{kind}', tr(pick)));
    return;
  }
  if(act==='close'){ BL_EDIT=key; BL_MODE='close'; renderBacklog(); return; }
  if(act==='del'){
    const { which, t, idx, row } = blRowAt(key);
    if(!confirm(tr('Delete this question from the backlog?')+'\n\n"'+ (blGet(t,row,'question')||'(empty)') +'"\n\n'+
                tr('Nothing here is deleted by accident: if research answered it, use “Mark as answered” instead, so the trail survives.'))) return;
    t.rows.splice(idx,1); BL_SEL = null;
    blSave(blSerialize(BL), tr(which==='open' ? 'Question deleted from the open list' : 'Question deleted from the closed list'));
    return;
  }
  if(act==='reopen'){
    const { t, idx, row } = blRowAt(key);
    const open = BL.open.table;
    const moved = blRemap(row, t, open);
    blSet(open, moved, 'status', 'open');
    t.rows.splice(idx,1); open.rows.push(moved);
    BL_SEL = null;
    blSave(blSerialize(BL), tr('Back on the open list ✓'));
    return;
  }
  if(act==='save'){
    const card = b.closest('.bl-detail');
    if(key==='new'){
      const t = BL.open.table;
      const row = blReadForm(card, t.header);
      if(!blGet(t,row,'question')){ toast(tr('A question needs… a question')); return; }
      if(!blGet(t,row,'date')) blSet(t,row,'date', blToday());
      if(!blGet(t,row,'status')) blSet(t,row,'status','open');
      t.rows.push(row);
      BL_LIST = 'open'; BL_SEL = 'open:'+(t.rows.length-1);   // land on what you just wrote
      blSave(blSerialize(BL), tr('Question added to the backlog ✓'));
      return;
    }
    const { t, idx, row } = blRowAt(key);
    const next = blReadForm(card, t.header);
    row.forEach((_,i)=> row[i] = next[i]);            // keep the same array — extra columns included
    if(BL_MODE==='close'){
      const why = (card.querySelector('#blWhy')||{}).value || '';
      if(!why.trim()){ toast(tr('Say what answered it — closing without a reason is how a backlog rots')); return; }
      const closed = BL.closed.table;
      const moved = blRemap(row, t, closed);
      blSet(closed, moved, 'status', 'closed — '+why.trim());
      t.rows.splice(idx,1); closed.rows.push(moved); BL_SEL = null;
      blSave(blSerialize(BL), tr('Closed and moved down ✓ — if it contradicts a persona, run /contradictions'));
      return;
    }
    blSave(blSerialize(BL), tr('Question updated ✓'));
  }
});

/* Esc closes the method sheet before anything else on this page reacts to it —
   unless a <dialog> is up, and then Esc belongs to the dialog. */
document.addEventListener('keydown', ev=>{
  if(BACKLOG_ACTIVE && BL_SHEET && ev.key==='Escape' && !modalOpen()){ ev.stopPropagation(); BL_SHEET = null; renderBacklog(); }
}, true);

/* ---- page lifecycle ---- */
async function backlogEnter(){
  BACKLOG_ACTIVE = true;
  if(typeof settingsExit==='function') settingsExit();
  if(typeof helpExit==='function') helpExit();
  if(typeof mindmapExit==='function') mindmapExit();
  if(typeof dashboardExit==='function') dashboardExit();
  syncLinTheme();
  backlogBtn.classList.add('active');
  galleryView.style.display = ""; detailView.classList.remove('active');
  hideGalleryChrome();
  renderTabs();   // this page owns the active state — clear any graph-tab highlight
  // re-read from disk on entry: another tab or a Claude session may have appended
  if(WS==='project' && DIRHANDLE){ try{ BACKLOG_RAW = await readRepoFile(BACKLOG_FILE); }catch(err){} }
  BL_EDIT = null; BL_MODE = 'edit'; BL_SHEET = null;
  renderBacklog(); renderBacklogCount(); window.scrollTo(0,0);
}
function backlogExit(){
  if(!BACKLOG_ACTIVE) return;
  BACKLOG_ACTIVE = false; BL_EDIT = null; BL_MODE = 'edit';
  backlogBtn.classList.remove('active');
  updatePageHead();
}
backlogBtn.onclick = ()=>{ location.hash = '#backlog'; };
