/* ---------- Projects — the screen you land on ----------
   A research project IS a folder on this computer, so this screen is a list of
   folders you have connected, plus the three ways in: start a new one, import
   one that already exists, or look around the Demo. It owns the window (same
   full-bleed pattern as the persona poster) instead of being a view inside a
   project — you are not in a project yet.

   Two things it deliberately does NOT do: it never reads a folder to refresh a
   card (that needs the disk permission a click grants, and a list screen that
   silently reads eight folders is not what "everything stays local" means — the
   counts are shown as a remembered snapshot), and forgetting a project removes
   our record of it, never the files. */
let PROJECTS_ACTIVE = false;
/* Which page of this screen is up: the project list, or the help/FAQ. The Demo
   is not a page here — it is one of the three doors at the top, so there is a
   single place that opens it instead of two that disagree. */
let PJ_PAGE = 'projects';
const projectsView = document.getElementById('projectsView');

const PJ_ICONS = {
  grid: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  flask: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6.5L4.5 18A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3L14 9.5V3"/><path d="M7.5 15h9"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  shield: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  help: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6"/><line x1="12" y1="17.4" x2="12" y2="17.5"/></svg>',
  copy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  caret: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
};

/* The folder a fresh project starts as — one folder per entity type, exactly
   the shape the skills expect, plus the two root documents. Nothing is
   invented inside them: the stubs carry headings and a table header, and not
   one line of research. */
const PJ_FOLDERS = ['Transcripts', 'Inbox', 'Evidence', 'Signals', 'Archetypes', 'Personas', 'Hypotheses', 'Ideas'];
const PJ_PRODUCT_STUB = `---
title: Product context
updated:
---

# Product context

## What the product is

<!-- Two or three sentences: what it does, for whom. The founder is the
     authority here — this is the one place their own statements belong. -->

## What we believe about the people who use it

<!-- Assumptions, not findings. Anything here that is about users belongs in
     Hypotheses/ at L1 until research says otherwise. -->
`;
const PJ_BACKLOG_STUB = `# Research backlog — questions from persona sessions

## Open questions

| Date | Persona | Question | Source / level | Status | Priority |
|------|---------|----------|----------------|--------|----------|

## Closed / turned into research
`;

/* ---------- the card thumbnail ----------
   An abstract graph, not a preview: we cannot draw a folder we are not allowed
   to read. Its size follows the remembered entity count, so a big project
   looks like one. */
function pjThumb(n){
  const kids = Math.max(2, Math.min(5, Math.round(Math.sqrt(Math.max(1, n || 1)))));
  const W = 160, H = 100, cw = 34, ch = 11;
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">`;
  const rootY = H / 2 - ch / 2, rootX = 8, rootW = 40;
  const step = (H - 16) / kids;
  const parts = [];
  for(let i = 0; i < kids; i++){
    const y = 8 + step * i + step / 2 - ch / 2;
    parts.push(`<path class="pj-edge" d="M${rootX + rootW} ${H / 2} C ${rootX + rootW + 16} ${H / 2}, ${62} ${y + ch / 2}, ${70} ${y + ch / 2}"/>`);
    parts.push(`<rect class="pj-node" x="70" y="${y.toFixed(1)}" width="${cw}" height="${ch}" rx="3"/>`);
    if(i % 2 === 0){
      parts.push(`<path class="pj-edge" d="M${70 + cw} ${y + ch / 2} C ${112} ${y + ch / 2}, ${112} ${y + ch / 2}, ${118} ${y + ch / 2}"/>`);
      parts.push(`<rect class="pj-node" x="118" y="${y.toFixed(1)}" width="${cw}" height="${ch}" rx="3"/>`);
    }
  }
  s += parts.join('') + `<rect class="pj-node root" x="${rootX}" y="${rootY}" width="${rootW}" height="${ch}" rx="3"/></svg>`;
  return s;
}

function pjWhen(stamp){
  if(!stamp) return tr('not opened yet');
  const days = Math.floor((Date.now() - stamp) / 86400000);
  if(days <= 0) return tr('opened today');
  if(days === 1) return tr('opened yesterday');
  if(days < 7) return trn(days, 'opened {n} day ago', 'opened {n} days ago',
                                 'otwarty {n} dzień temu', 'otwarty {n} dni temu', 'otwarty {n} dni temu');
  return tr('opened') + ' ' + new Date(stamp).toLocaleDateString(LANG === 'pl' ? 'pl-PL' : 'en-GB');
}
function pjCount(n){
  return trn(n, '{n} entity', '{n} entities', '{n} encja', '{n} encje', '{n} encji');
}

/* ---------- the starter prompt ----------
   An empty project's real first step happens outside this window: you open the
   same folder in an AI agent. So the empty state hands you the sentence that
   starts that conversation — and because people arrive with different agents,
   the button carries a list rather than assuming Claude Code. The body is one
   text for all of them (it points at the files, not at our slash commands);
   only the opening line changes, and promptLang() asks for answers in the
   language the interface is speaking. */
const PJ_AGENTS = [
  { id: 'claude',  label: 'Claude Code' },
  { id: 'codex',   label: 'Codex' },
  { id: 'gemini',  label: 'Gemini' },
  { id: 'cursor',  label: 'Cursor' },
  { id: 'copilot', label: 'GitHub Copilot' },
  { id: 'other',   label: 'Another assistant' },
];
const PJ_PROMPT_INTRO = {
  claude: 'You are my research partner in this Archetype Talk project. If you have the project skills installed, run /cold-start. If that command is not there, follow the steps below instead.',
  codex: 'You are my research partner in this Archetype Talk project, working in this folder. The /slash-commands you will see referenced are not special: each one is a plain instruction file you can open and follow yourself.',
  gemini: 'You are my research partner in this Archetype Talk project. Start from GEMINI.md, which points at the full ruleset — the /slash-commands referenced there are plain instruction files you can read and follow.',
  cursor: 'You are my research partner in this Archetype Talk project. Keep every change as a file edit I can review in the diff, and never write outside this folder.',
  copilot: 'You are my research partner in this Archetype Talk project. Keep every change as a file edit I can review, and never write outside this folder.',
  other: 'You are my research partner in this Archetype Talk project — a folder of Markdown files that holds UX research. Work only inside this folder.',
};
function pjPromptText(agent){
  return (tr(PJ_PROMPT_INTRO[agent] || PJ_PROMPT_INTRO.other)) + `

` + tr(`CONTEXT
This folder is an Archetype Talk project: a UX-research knowledge graph made of Markdown files. The shape is Evidence → Signals → (Personas ↔ Archetypes) → Ideas, with Hypotheses as the waiting room for bets nothing supports yet. One entity per file, one folder per type, and every folder has a _template.md showing the shape.

READ FIRST, IN THIS ORDER
1. AGENTS.md — the entry point for any AI tool
2. CLAUDE.md — the working rules; the "Hard rules" section is not negotiable
3. .claude/skills/INDEX.md — the workflows available, each one a plain instruction file

THEN HELP ME START
- Ask me what the product is, who I think uses it and what I believe about those people — one question at a time, not a questionnaire.
- What I tell you about the PRODUCT goes into "Product Context.md": there I am the authority.
- What I tell you about USERS is an assumption, not a finding — file it in "Hypotheses/" at L1, never as a Signal or as Evidence.
- Turn what we do not know into questions in "Research backlog.md", then propose the first research round: who to talk to, how many people, what to ask them.

THE RULES THAT MATTER MOST
- Never invent a quote, a statistic, a date or a source.
- Signal = an observation from our own interview or test. Evidence = desk research or external data. Web findings and analytics numbers are always Evidence.
- A conversation with a persona never creates data — it produces research questions.
- Contradictions are data: two conflicting findings stay two files, never an average.
- Show me what you plan to write before you write it.`) + promptLang();
}
function pjCopyPrompt(agent){
  store.set('at-ai', agent);
  const txt = pjPromptText(agent);
  const done = ()=> toast(tr('Prompt copied — paste it into your AI assistant ✓'));
  if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done, ()=> fallbackCopy(txt, done)); }
  else fallbackCopy(txt, done);
}
function pjAgent(){
  const id = store.get('at-ai');
  return PJ_AGENTS.some(a => a.id === id) ? id : 'claude';
}
function pjAgentLabel(id){ return (PJ_AGENTS.find(a => a.id === id) || PJ_AGENTS[0]).label; }

/* ---------- help / FAQ ----------
   The Demo used to sit in the rail, which made the screen say "here are your
   projects, and also a demo" twice. What belongs in a rail next to Projects is
   the thing you need before you have one: how to run the whole system, what it
   supports, and what to do when a folder will not connect. Two languages, side
   by side, same ids and same order — a change to one is easy to mirror. */
const PJ_FAQ = [
 { id:'start', label:'Getting started', items:[
  ['What is Archetype Talk?', '<p>A UX-research knowledge graph you can talk to. Your research lives as plain Markdown in one folder — <code>Evidence → Signals → (Personas ↔ Archetypes) → Ideas</code>, with <code>Hypotheses</code> as the waiting room for bets nothing supports yet. This app is the window onto that folder; the work — turning interviews into findings, interviewing a persona — happens in your AI agent.</p>'],
  ['What do I need to run the whole thing?', '<p>Three things, none of them a server. <b>A folder</b> for the project (this screen can create it). <b>A browser</b> to open <code>app/index.html</code> — no build step, no install. <b>An AI agent</b> pointed at that same folder: Claude Code, Codex, Gemini, Cursor, Copilot, whichever you use.</p>'],
  ['How do I start from zero?', '<p><b>New project</b> → pick an empty folder. We create the structure inside it (<code>Transcripts</code>, <code>Inbox</code>, <code>Evidence</code>, <code>Signals</code>, <code>Archetypes</code>, <code>Personas</code>, <code>Hypotheses</code>, <code>Ideas</code>) plus <code>Product Context.md</code> and <code>Research backlog.md</code>. Then open the same folder in your agent and paste the <b>starter prompt</b> from the Projects page — it tells the agent what to read first and how to begin.</p>'],
  ['I already have research. What now?', '<p><b>Import a project</b> and point at the folder itself, not the files inside. Files that already follow the shape show up as a graph straight away. If yours do not, ask your agent to file what you have — every folder carries a <code>_template.md</code> it can follow.</p>'],
  ['What does a normal week look like?', '<p>A loop. Transcripts land in <code>Inbox/</code> → your agent turns them into Signals and Evidence and wires them to the personas → you interview those personas, which produces <i>questions</i>, never data → the questions go to <code>Research backlog.md</code> → real interviews answer them, and round it goes. This app shows you where in the loop you are.</p>'],
 ]},
 { id:'support', label:'What we support', items:[
  ['Which browsers?', '<p>Any modern browser for reading. Connecting a folder and editing files in place uses the File System Access API — that means <b>Chrome or Edge</b> today. In Safari or Firefox you can still drop <code>.md</code> files into the window and browse them read-only; <b>New project</b> stays disabled there.</p>'],
  ['Which operating systems?', '<p>macOS, Windows and Linux alike — it is a browser page and a folder of text files. The optional helper scripts need nothing but Python 3.</p>'],
  ['Which AI assistants?', '<p>Any agent that can read and write files in the folder. The <code>/slash-commands</code> are Claude Code shortcuts, but each one is only an instruction file at <code>.claude/skills/&lt;name&gt;/SKILL.md</code> — another tool follows the same file once you point it there. The starter prompt has a version per assistant.</p>'],
  ['What about the research tools I already use?', '<p>Dovetail, call recorders (Grain, Fireflies, Otter, tl;dv, Zoom), Notion, Confluence, Capacities, Maze, UserTesting and product analytics (Mixpanel, GA4, Amplitude) are read-only imports your agent runs for you. Anything imported is filed as <b>Evidence</b> — never as an observation you made yourself.</p>'],
  ['Is there a format I have to learn?', '<p>No. Markdown with a short header. Every folder ships a <code>_template.md</code> showing the shape, and the app can write Signals, Evidence, personas and the rest through a form — no AI required.</p>'],
 ]},
 { id:'data', label:'Your data', items:[
  ['Where does my research live?', '<p>In your folder, in files you own. The app reads the folder you point it at: no account, no upload, no sync. Close the app and it is still plain Markdown you can open in any editor.</p>'],
  ['Does anything leave this computer?', '<p>The app sends nothing. Your AI agent sees what you show it — that is the one place research text travels, and which agent that is stays your choice. The optional extras that do reach out (a synthetic voice, desk research on the web) say so before they go.</p>'],
  ['What is the Demo?', '<p>A finished example project that lives in this browser, not on your disk. It never mixes with your work — demo files are their own workspace, and real entities are never linked to them. Click it apart; you cannot break anything.</p>'],
  ['Can I work with a team?', '<p>Put the folder in git. It is Markdown, so a change to a persona reviews like a change to code. For someone who would rather not touch git, <b>Export .md</b> hands over the whole graph in one file.</p>'],
 ]},
 { id:'trouble', label:'When something is off', items:[
  ['“New project” is greyed out.', '<p>That browser cannot connect a folder. Open the app in Chrome or Edge — everything else works everywhere.</p>'],
  ['It asks for folder permission again.', '<p>The browser remembers the folder, not the permission. One click on <b>Reconnect</b> and you are back in — that is the browser being careful, not the app forgetting you.</p>'],
  ['My project shows only demo files.', '<p>The folder you connected holds nothing but files marked <code>demo: true</code>. Connect the folder that has your research, or start a new project.</p>'],
  ['I changed a file outside the app.', '<p><b>Refresh files</b> in the sidebar re-reads the folder. The app never watches your disk in the background.</p>'],
  ['Who made this, and can I use it?', '<p>Golden Ratio — Mateusz Jędraszczyk. It is open source under the <b>MIT licence</b>: use it, change it, ship it, commercially too; keep the copyright notice and it comes with no warranty.</p>'],
 ]},
];
const PJ_FAQ_PL = [
 { id:'start', label:'Pierwsze kroki', items:[
  ['Czym jest Archetype Talk?', '<p>Grafem wiedzy z badań UX, z którym można rozmawiać. Twoje badania leżą jako zwykły Markdown w jednym folderze — <code>Dowody → Sygnały → (Persony ↔ Archetypy) → Pomysły</code>, a <code>Hipotezy</code> są poczekalnią dla zakładów, których nic jeszcze nie potwierdza. Ta aplikacja jest oknem na ten folder; właściwa praca — zamiana wywiadów we wnioski, rozmowa z personą — dzieje się w twoim agencie AI.</p>'],
  ['Czego potrzebuję, żeby uruchomić całość?', '<p>Trzech rzeczy, żadna nie jest serwerem. <b>Folder</b> na projekt (ten ekran może go utworzyć). <b>Przeglądarka</b>, żeby otworzyć <code>app/index.html</code> — bez budowania, bez instalacji. <b>Agent AI</b> wskazany na ten sam folder: Claude Code, Codex, Gemini, Cursor, Copilot — którego używasz.</p>'],
  ['Jak zacząć od zera?', '<p><b>Nowy projekt</b> → wskaż pusty folder. Utworzymy w nim strukturę (<code>Transcripts</code>, <code>Inbox</code>, <code>Evidence</code>, <code>Signals</code>, <code>Archetypes</code>, <code>Personas</code>, <code>Hypotheses</code>, <code>Ideas</code>) plus <code>Product Context.md</code> i <code>Research backlog.md</code>. Potem otwórz ten sam folder w agencie i wklej <b>prompt startowy</b> z ekranu Projekty — mówi agentowi, co przeczytać najpierw i jak zacząć.</p>'],
  ['Mam już badania. Co teraz?', '<p><b>Wczytaj projekt</b> i wskaż sam folder, nie pliki w środku. Pliki, które trzymają się kształtu, od razu pokażą się jako graf. Jeśli twoje go nie trzymają, poproś agenta, żeby poukładał to, co masz — w każdym folderze leży <code>_template.md</code>, którym może się kierować.</p>'],
  ['Jak wygląda normalny tydzień?', '<p>To pętla. Transkrypcje lądują w <code>Inbox/</code> → agent zamienia je w sygnały i dowody i podpina do person → ty przepytujesz te persony, co daje <i>pytania</i>, nigdy dane → pytania idą do <code>Research backlog.md</code> → prawdziwe wywiady na nie odpowiadają i koło się kręci. Ta aplikacja pokazuje, w którym miejscu pętli jesteś.</p>'],
 ]},
 { id:'support', label:'Co wspieramy', items:[
  ['Jakie przeglądarki?', '<p>Do czytania dowolna nowoczesna. Podłączenie folderu i edycja plików w miejscu korzystają z File System Access API — czyli dziś <b>Chrome albo Edge</b>. W Safari i Firefoksie nadal możesz wrzucić pliki <code>.md</code> do okna i przeglądać je tylko do odczytu; <b>Nowy projekt</b> zostaje tam wyłączony.</p>'],
  ['Jakie systemy?', '<p>macOS, Windows i Linux tak samo — to strona w przeglądarce i folder plików tekstowych. Opcjonalne skrypty pomocnicze potrzebują wyłącznie Pythona 3.</p>'],
  ['Jacy asystenci AI?', '<p>Dowolny agent, który potrafi czytać i zapisywać pliki w folderze. <code>/slash-komendy</code> to skróty Claude Code, ale każda z nich jest tylko plikiem z instrukcją w <code>.claude/skills/&lt;nazwa&gt;/SKILL.md</code> — inne narzędzie pójdzie za tym samym plikiem, gdy mu go wskażesz. Prompt startowy ma wersję dla każdego asystenta.</p>'],
  ['A narzędzia badawcze, których już używam?', '<p>Dovetail, nagrywarki rozmów (Grain, Fireflies, Otter, tl;dv, Zoom), Notion, Confluence, Capacities, Maze, UserTesting i analityka produktowa (Mixpanel, GA4, Amplitude) to importy tylko do odczytu, które robi twój agent. Wszystko zaimportowane trafia jako <b>dowód</b> — nigdy jako obserwacja, którą zrobiłeś sam.</p>'],
  ['Czy muszę nauczyć się jakiegoś formatu?', '<p>Nie. Markdown z krótkim nagłówkiem. W każdym folderze leży <code>_template.md</code> pokazujący kształt, a aplikacja potrafi zapisać sygnały, dowody, persony i resztę przez formularz — bez żadnego AI.</p>'],
 ]},
 { id:'data', label:'Twoje dane', items:[
  ['Gdzie leżą moje badania?', '<p>W twoim folderze, w plikach, które należą do ciebie. Aplikacja czyta folder, który jej wskażesz: bez konta, bez wysyłki, bez synchronizacji. Zamknij aplikację, a to nadal jest zwykły Markdown, który otworzysz w dowolnym edytorze.</p>'],
  ['Czy cokolwiek opuszcza ten komputer?', '<p>Aplikacja nie wysyła nic. Twój agent AI widzi to, co mu pokażesz — to jedyne miejsce, w które wędruje tekst badań, i to ty wybierasz, jaki to agent. Opcjonalne dodatki, które faktycznie sięgają na zewnątrz (syntetyczny głos, desk research w sieci), mówią o tym, zanim to zrobią.</p>'],
  ['Czym jest Demo?', '<p>Gotowym przykładowym projektem, który żyje w tej przeglądarce, a nie na twoim dysku. Nigdy nie miesza się z twoją pracą — pliki demo są osobną przestrzenią, a prawdziwe encje nie są z nimi linkowane. Klikaj do woli, nic nie zepsujesz.</p>'],
  ['Czy da się pracować zespołowo?', '<p>Wrzuć folder do gita. To Markdown, więc zmianę w personie recenzuje się jak zmianę w kodzie. Komu do gita nie po drodze, temu <b>Eksport .md</b> przekazuje cały graf w jednym pliku.</p>'],
 ]},
 { id:'trouble', label:'Kiedy coś nie gra', items:[
  ['„Nowy projekt” jest wyszarzony.', '<p>Ta przeglądarka nie potrafi podłączyć folderu. Otwórz aplikację w Chrome albo Edge — cała reszta działa wszędzie.</p>'],
  ['Znowu pyta o uprawnienie do folderu.', '<p>Przeglądarka pamięta folder, ale nie uprawnienie. Jedno kliknięcie w <b>Połącz ponownie</b> i jesteś z powrotem — to przeglądarka jest ostrożna, a nie aplikacja o tobie zapomniała.</p>'],
  ['W moim projekcie są same pliki demo.', '<p>Podłączony folder nie zawiera nic poza plikami oznaczonymi <code>demo: true</code>. Podłącz folder ze swoimi badaniami albo załóż nowy projekt.</p>'],
  ['Zmieniłem plik poza aplikacją.', '<p><b>Odśwież pliki</b> w panelu bocznym czyta folder od nowa. Aplikacja nigdy nie podgląda twojego dysku w tle.</p>'],
  ['Kto to zrobił i czy mogę tego używać?', '<p>Golden Ratio — Mateusz Jędraszczyk. To open source na <b>licencji MIT</b>: używaj, zmieniaj, wdrażaj, także komercyjnie; zostaw notę o prawach autorskich, a całość idzie bez gwarancji.</p>'],
 ]},
];
function pjFaqData(){ return LANG === 'pl' ? PJ_FAQ_PL : PJ_FAQ; }

function pjHelpMain(){
  const secs = pjFaqData().map(sec => `
    <section class="pj-faq-sec" id="pjfaq-${sec.id}">
      <h2>${esc(sec.label)}</h2>
      ${sec.items.map(([q, a]) => `
        <details class="pj-faq">
          <summary>${esc(q)}</summary>
          <div class="pj-faq-a">${a}</div>
        </details>`).join('')}
    </section>`).join('');
  /* buttons, not anchors: a href="#…" here would go through the hash router
     and close the screen we are standing on */
  const toc = pjFaqData().map(sec => `<button class="pj-chip" data-faq="${sec.id}">${esc(sec.label)}</button>`).join('');
  return `
    <div class="pj-head"><h1>${esc(tr('Help & FAQ'))}</h1></div>
    <p class="pj-lead">${esc(tr('How to run the whole thing, what it supports, and what to do when something will not connect. Everything here is about the app and the folder — never about your research.'))}</p>
    <div class="pj-chips">${toc}</div>
    ${secs}
    <p class="pj-lead" style="margin-top:var(--s-8)">${esc(tr('Still stuck? Open the project and use Help & guide inside it — it goes deeper, view by view.'))}</p>`;
}

/* ---------- render ---------- */
async function renderProjects(){
  /* Only folders that hold actual research, plus the empty ones we scaffolded
     ourselves. A folder of nothing but demo files is the Demo card, which is on
     this screen exactly once — see connectDir. Records written before that rule
     existed are filtered here too, so an old one disappears without waiting to
     be reopened. */
  const rows = (await projectsAll()).filter(r => (r.stats && r.stats.entities) || r.created);
  const canPick = !!window.showDirectoryPicker;
  const nDemo = Object.values(ENTITIES).filter(e => e.ws === 'demo').length;
  // which card is the folder we are connected to right now
  let liveId = null;
  if(DIRHANDLE){
    for(const r of rows){ try{ if(await r.handle.isSameEntry(DIRHANDLE)){ liveId = r.id; break; } }catch(err){} }
  }

  const cta = `
    <div class="pj-cta">
      <button class="pj-cta-card" id="pjNew"${canPick ? '' : ' disabled'}>
        <span class="pj-cta-ico">${PJ_ICONS.plus}</span>
        <b>${esc(tr('New project'))}</b>
        <span>${esc(tr('Pick an empty folder — we create the research structure inside it and connect to it.'))}</span>
      </button>
      <button class="pj-cta-card" id="pjImport">
        <span class="pj-cta-ico">${PJ_ICONS.folder}</span>
        <b>${esc(tr('Import a project'))}</b>
        <span>${esc(tr('Connect a folder that already holds research — yours, or one pulled from git.'))}</span>
      </button>
      <button class="pj-cta-card" data-demo="1">
        <span class="pj-cta-ico">${PJ_ICONS.flask}</span>
        <b>${esc(tr('Open the demo'))}</b>
        <span>${esc(tr('A finished example project you can click through and edit. It never mixes with your work.'))}</span>
        <span class="pj-cta-meta">${esc(pjCount(nDemo))} · ${esc(tr('sandbox, in this browser'))}</span>
      </button>
    </div>`;

  const cards = rows.map(r => {
    const n = (r.stats && r.stats.entities) || 0;
    /* `project_name:` from Product Context.md when the project has one, folder
       name otherwise — and the folder name still shows underneath, so a renamed
       project never hides where its files actually are. */
    const label = r.label || r.name;
    return `<article class="pj-card">
      <button class="pj-thumb" data-open="${r.id}" aria-label="${esc(tr('Open project'))} ${esc(label)}">${pjThumb(n)}</button>
      <div class="pj-foot">
        <div class="pj-txt">
          <button class="pj-name" data-open="${r.id}">${esc(label)}</button>
          <span class="pj-hint">${r.label && r.label !== r.name ? esc(r.name) + ' · ' : ''}${r.id === liveId ? esc(tr('connected now')) : esc(n ? pjCount(n) : tr('nothing read yet'))} · ${esc(pjWhen(r.opened))}</span>
        </div>
        <button class="pj-btn icon danger" data-forget="${r.id}" title="${esc(tr('Remove from this list — the folder and its files stay where they are'))}" aria-label="${esc(tr('Forget'))} ${esc(label)}">${PJ_ICONS.trash}</button>
      </div>
    </article>`;
  }).join('');

  /* The empty state is the one screen where the next real step happens outside
     this window: you open the same folder in an AI agent. So it hands over the
     opening sentence — and the caret next to it, because people arrive with
     different agents and a prompt written for the wrong one is worse than no
     prompt at all. */
  const agent = pjAgent();
  const empty = `
    <div class="pj-empty">
      <h2>${esc(tr('No project connected yet'))}</h2>
      <p>${esc(tr('A project is a folder on this computer. Start one, connect a folder you already work in, or click through the demo first.'))}</p>
      <p class="pj-empty-ai">${esc(tr('Already have the folder open in an AI assistant? Copy the opening prompt — it tells the agent what to read first and how to start.'))}</p>
      <div class="pj-split">
        <button class="pj-btn primary" id="pjPrompt">${PJ_ICONS.copy}${esc(tr('Copy the starter prompt for') + ' ' + pjAgentLabel(agent))}</button>
        <button class="pj-btn primary pj-split-more" id="pjPromptMore" aria-haspopup="true" aria-expanded="false" aria-label="${esc(tr('Pick another AI assistant'))}">${PJ_ICONS.caret}</button>
        <div class="pj-menu" id="pjPromptMenu" role="menu" hidden>
          <div class="pj-menu-head">${esc(tr('Copy the prompt for…'))}</div>
          ${PJ_AGENTS.map(a => `<button class="pj-menu-item${a.id === agent ? ' on' : ''}" role="menuitem" data-ai="${a.id}">${esc(tr(a.label))}</button>`).join('')}
        </div>
      </div>
      <p class="pj-empty-note">${esc(tr('The prompt is plain text — it points the agent at the rule files in the folder, so it works the same in any assistant.'))}</p>
    </div>`;

  const list = rows.length
    ? `<div class="pj-sec">${esc(tr('Your projects'))} <span class="pj-n">${rows.length}</span></div>
       <div class="pj-grid">${cards}</div>`
    : `<div class="pj-sec">${esc(tr('Your projects'))}</div>
       ${empty}`;

  const main = PJ_PAGE === 'help' ? pjHelpMain() : `
      <div class="pj-head">
        <h1>${esc(tr('Projects'))}</h1>
        ${rows.length ? `<div class="pj-actions">
          <button class="pj-btn" data-demo="1">${PJ_ICONS.flask}${esc(tr('Open the demo'))}</button>
          <button class="pj-btn" id="pjImport2">${PJ_ICONS.folder}${esc(tr('Import a project'))}</button>
          <button class="pj-btn primary" id="pjNew2"${canPick ? '' : ' disabled'}>${PJ_ICONS.plus}${esc(tr('New project'))}</button>
        </div>` : ''}
      </div>
      <p class="pj-lead">${esc(tr('Every project is a folder of Markdown files you own. Open one to browse its graph, talk to its personas and edit the files in place.'))}</p>
      ${/* one set of ways in, never two: the explained cards while there is nothing
           yet, compact buttons in the head once your projects fill the page */ ''}
      ${rows.length ? '' : cta}
      ${list}
      ${canPick ? '' : `<p class="pj-lead" style="margin-top:var(--s-6)">${esc(tr('This browser can browse but not connect a folder — creating and opening projects needs Chrome or Edge.'))}</p>`}`;

  projectsView.innerHTML = `
    <aside class="pj-rail">
      <div class="pj-brand"><span class="pj-mark">AT</span><span>Archetype Talk</span></div>
      <nav class="pj-nav">
        <button class="pj-nav-item${PJ_PAGE === 'projects' ? ' on' : ''}" data-page="projects">${PJ_ICONS.grid}${esc(tr('Projects'))}<span class="pj-n">${rows.length}</span></button>
        <button class="pj-nav-item${PJ_PAGE === 'help' ? ' on' : ''}" data-page="help">${PJ_ICONS.help}${esc(tr('Help & FAQ'))}</button>
      </nav>
      <div class="pj-rail-foot">
        <div class="lang-switch" role="group" aria-label="${esc(tr('Language'))}">
          <button type="button" class="lang-opt${LANG === 'en' ? ' on' : ''}" data-pj-lang="en">EN</button><button type="button" class="lang-opt${LANG === 'pl' ? ' on' : ''}" data-pj-lang="pl">PL</button>
        </div>
        <div class="pj-note">${PJ_ICONS.shield}<div><strong>${esc(tr('Nothing leaves this computer'))}</strong>${esc(tr('The app reads the folder you point it at. No account, no upload, no sync.'))}</div></div>
        <div class="pj-credit">
          <a href="https://www.linkedin.com/in/matjedux/" target="_blank" rel="noopener noreferrer">Golden Ratio — Mateusz Jędraszczyk</a>
          <span>${esc(tr('Open source, MIT licence'))}</span>
        </div>
      </div>
    </aside>
    <main class="pj-main">${main}</main>`;

  projectsView.querySelectorAll('[data-page]').forEach(b => b.onclick = () => {
    PJ_PAGE = b.dataset.page; renderProjects();
  });
  projectsView.querySelectorAll('[data-faq]').forEach(b => b.onclick = () => {
    const sec = projectsView.querySelector('#pjfaq-' + b.dataset.faq);
    if(sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const pmenu = projectsView.querySelector('#pjPromptMenu');
  const pmore = projectsView.querySelector('#pjPromptMore');
  const pmain = projectsView.querySelector('#pjPrompt');
  if(pmain) pmain.onclick = () => pjCopyPrompt(pjAgent());
  if(pmore) pmore.onclick = ev => {
    ev.stopPropagation();
    const open = pmenu.hidden;
    pmenu.hidden = !open;
    pmore.setAttribute('aria-expanded', String(open));
  };
  if(pmenu) pmenu.querySelectorAll('[data-ai]').forEach(b => b.onclick = () => {
    pmenu.hidden = true; pmore.setAttribute('aria-expanded', 'false');
    pjCopyPrompt(b.dataset.ai);
    renderProjects();   // the main button now names the assistant you picked
  });

  projectsView.querySelectorAll('[data-open]').forEach(b => b.onclick = () => {
    const rec = rows.find(r => r.id === b.dataset.open); if(rec) projectOpen(rec);
  });
  projectsView.querySelectorAll('[data-forget]').forEach(b => b.onclick = async () => {
    const rec = rows.find(r => r.id === b.dataset.forget); if(!rec) return;
    if(!confirm(tr('Remove {name} from the projects list? The folder and every file in it stay exactly where they are.').split('{name}').join(rec.name))) return;
    await projectForget(rec.id);
    renderProjects();
  });
  projectsView.querySelectorAll('[data-demo]').forEach(b => b.onclick = () => {
    store.set('at-last', 'demo');   // next launch opens what you opened last
    setWs('demo'); projectsLeave('dashboard');
  });
  projectsView.querySelectorAll('[data-pj-lang]').forEach(b => b.onclick = () => setLang(b.dataset.pjLang));
  const nw = () => projectCreate(), imp = () => projectImport();
  ['pjNew', 'pjNew2'].forEach(id => { const el = projectsView.querySelector('#' + id); if(el) el.onclick = nw; });
  ['pjImport', 'pjImport2'].forEach(id => { const el = projectsView.querySelector('#' + id); if(el) el.onclick = imp; });
}

/* One listener for the life of the page: the assistant menu closes when you
   click anywhere else, the way every other menu in the app does. */
document.addEventListener('click', ev => {
  const m = projectsView.querySelector('#pjPromptMenu');
  if(!m || m.hidden || m.contains(ev.target)) return;
  m.hidden = true;
  const b = projectsView.querySelector('#pjPromptMore');
  if(b) b.setAttribute('aria-expanded', 'false');
});

/* ---------- actions ---------- */
async function projectOpen(rec){
  let perm = 'denied';
  try{ perm = await rec.handle.queryPermission({ mode: 'readwrite' }); }catch(err){}
  if(perm !== 'granted'){
    try{ perm = await rec.handle.requestPermission({ mode: 'readwrite' }); }catch(err){}
  }
  if(perm !== 'granted'){ toast(tr('Permission declined — the folder stays disconnected')); return; }
  try{
    if(await connectDir(rec.handle, { restored: true })) projectsLeave('dashboard');
  }catch(err){
    await projectForget(rec.id); renderProjects();
    toast(tr('That folder is gone — pick it again'));
  }
}

async function projectImport(){
  if(window.showDirectoryPicker){ if(await loadFromPicker()) projectsLeave('dashboard'); return; }
  document.getElementById('folderInput').click();   // Safari/Firefox: read-only fallback
  projectsLeave();
}

async function projectCreate(){
  if(!window.showDirectoryPicker){ toast(tr('Creating a project needs Chrome or Edge')); return; }
  let dir;
  try{ dir = await showDirectoryPicker({ mode: 'readwrite' }); }catch(err){ return; }   // cancelled
  let used = false;
  try{ for await (const [name] of dir.entries()){ if(!name.startsWith('.')){ used = true; break; } } }catch(err){}
  if(used && !confirm(tr('{name} is not empty. We only ADD the missing folders and leave every existing file untouched — continue?').split('{name}').join(dir.name))) return;
  try{
    for(const f of PJ_FOLDERS) await dir.getDirectoryHandle(f, { create: true });
    await pjWriteIfAbsent(dir, 'Product Context.md', PJ_PRODUCT_STUB);
    await pjWriteIfAbsent(dir, BACKLOG_FILE, PJ_BACKLOG_STUB);
  }catch(err){ toast(tr('Could not write to that folder — pick one you can edit')); return; }
  try{
    await connectDir(dir, { created: true, allowEmpty: true });
    projectsLeave('dashboard');
  }catch(err){ toast(tr('Could not open the new project')); }
}
/* Never overwrite: a folder that already has a Product Context keeps it. */
async function pjWriteIfAbsent(dir, name, text){
  try{ await dir.getFileHandle(name); return false; }catch(err){ /* absent — write it */ }
  const fh = await dir.getFileHandle(name, { create: true });
  const w = await fh.createWritable(); await w.write(text); await w.close();
  return true;
}

/* ---------- enter / leave ---------- */
function projectsEnter(){
  PROJECTS_ACTIVE = true;
  PJ_PAGE = 'projects';   // the screen is called Projects — that is where entering it lands
  document.body.classList.add('projects-open');
  projectsView.setAttribute('aria-hidden', 'false');
  renderProjects();
}
function projectsExit(){
  if(!PROJECTS_ACTIVE) return;
  PROJECTS_ACTIVE = false;
  document.body.classList.remove('projects-open');
  projectsView.setAttribute('aria-hidden', 'true');
}
/* Leaving for the app itself. Picking a project here means "take me into it",
   so the default destination is that project's home (Overview) rather than the
   raw entity list — and going through the hash keeps the back button honest,
   which a silent projectsExit() would not. */
function projectsLeave(to){
  projectsExit();
  const target = to || '';
  const cur = location.hash.replace(/^#/, '');
  if(cur === target){ if(target === 'dashboard'){ dashboardEnter(); motionPage(); } }
  else { suppressRoute = false; location.hash = target; }   // hashchange → route() renders it
  if(typeof tourMaybeOpen === 'function') tourMaybeOpen();   // the first-run tour, held back while this screen was up
}
