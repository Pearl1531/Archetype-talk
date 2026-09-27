/* ---------- Help & guide ---------- */
const HELP = [
 { id:"getting-started", label:"Getting started", items:[
  ["How do I get started?", "<p>The GitHub repo <i>is</i> the workspace — use it as a <b>template</b> or clone it, then open the folder in <b>Claude Code</b>. On the first run it says hello and walks you through setup. This browser app is just <code>app/index.html</code>: open it, no server, no build.</p>"],
  ["What am I looking at?", "<p>Your research, as a living graph: <code>Evidence → Signals → (Personas ↔ Archetypes) → Ideas</code>, one Markdown file per thing, plus opt-in Competitors and the raw Transcripts. This app is the window; the real work — talking to personas, pulling findings out of interviews — happens in Claude Code.</p>"],
  ["Is any of this real?", "<p>Not yet — what ships is a worked example (Spotify research). Every file wears a <b>Demo</b> badge and cites real, public sources so you can see the shape of good work. Connect your own folder to replace it, or run <code>/demo-data</code> in Claude Code to keep, separate, or clear the example.</p>"],
  ["How do I bring in my own research?", "<p>Hit <b>Connect folder</b> and point at your project — the folder itself, not the files inside. In Chrome or Edge that also lets you edit in place. You only do this once: the app remembers the folder and opens on it next time — the browser may ask you to confirm the permission first, which is one click, not the file dialog again. You can drag &amp; drop .md files anywhere too, or pick a few from the sidebar.</p>"],
  ["Does it run on Windows and Linux?", "<p>Yes — any modern browser, any OS. In-place editing wants Chrome or Edge (on all three). The optional scripts (<code>graph_lint</code>, <code>embed_demo</code>) need only Python 3; the Claude Code session hook uses bash, which Git for Windows provides — and if it never fires, nothing else breaks.</p>"],
  ["What does a normal day look like?", "<p>A loop. Transcripts land in <code>Inbox/</code> → <code>/extract-findings</code> turns them into Signals and Evidence and wires up your personas → you interview those personas (<code>/persona-talk</code>), which produces questions, never data → real interviews answer them, and round it goes. This app shows you where you are.</p>"],
 ]},
 { id:"interface", label:"Interface &amp; views", items:[
  ["What are the little view buttons?", "<p>Next to search: <b>cards</b>, <b>single column</b>, <b>table</b>, and — on Competitors — the <b>market map</b> and a side-by-side <b>Compare</b>. Each tab offers only the views that suit it, and your pick is remembered. Table columns drag to resize and click to sort.</p>"],
  ["Any keyboard shortcuts?", "<p><code>/</code> jumps to search. <code>Esc</code> steps back (closing the editor first, if it is open). And the browser back button just works — every card, pill and crumb is a stop in your history.</p>"],
  ["How does search work?", "<p>Type in the filter above any list, or the search up top — same thing. It matches the title, the body and the frontmatter of the current tab, upper- or lower-case alike. It never leaves your machine.</p>"],
  ["Can I link a teammate to one thing?", "<p>Yes. Every detail view has a steady address like <code>index.html#personas-emma</code>. On the demo set the link survives a reload; with your own data, your teammate connects the same folder first.</p>"],
  ["How do I edit a file here?", "<p>Chrome or Edge: connect the folder, open something, and click <b>Edit</b> in the breadcrumb. Saving writes straight to the .md after the browser asks permission — and an edit that would break the <code>type:</code> line is politely refused.</p>"],
  ["What is the Research backlog section?", "<p><b>Planning → Research backlog</b> opens <code>Research backlog.md</code> — the open questions your persona conversations left behind. Add one, sharpen the wording, or close it with a note on what answered it; every change is written back into the same Markdown table <code>/backlog</code> and <code>/interview-guide</code> read. Closing keeps the row (with the reason) rather than erasing it — the trail is the point. Pick any question and the right-hand pane shows everything we already hold about answering it: how urgent it looks, whether it wants a story or a number, and two or three methods that fit.</p>"],
  ["Who decides what is critical?", "<p>You do — and until you say otherwise, the AI proposes. Every question filed during a persona session arrives with a <b>priority</b> attached (<code>critical</code> / <code>major</code> / <code>minor</code>), and rows that carry none get a dashed suggestion read from their own wording, written nowhere. The moment you pick one yourself it is saved as <code>critical (locked)</code> — and that suffix is a promise: no AI run may change, clear or re-word it again. It is the same rule as <code>affinity_lock</code> on a Signal, or your <code>==highlights==</code> in a transcript.</p>"],
  ["Why is my backlog split into qualitative and quantitative?", "<p>Because the two need different methods. A <b>qualitative</b> question wants a story — why, how, in whose words — and is answered by talking to a few people properly. A <b>quantitative</b> one wants a number — how many, how often, what share — and is answered by counting. Click any question for two or three methods that fit it, each with why it suits <i>that</i> question and what it will not tell you. Untagged rows show a dashed guess read from the wording; confirm it and it lands in the file's <code>Kind</code> column, where the AI skills pick it up. And the ladder still holds: a session you run makes a <b>Signal</b>, an aggregate makes <b>Evidence</b>.</p>"],
  ["What is Export .md?", "<p>Your whole graph, zipped as Markdown with its folders intact — a no-strings way to hand it to a teammate, or carry it into a tool like Capacities, without going through GitHub.</p>"],
  ["What do the icons on the little pills mean?", "<p>Every cross-reference shows what it points to: activity = Signal, bars = Evidence, person = Persona, layers = Archetype, bolt = Idea, page = Transcript. A dashed pill means that file is not in the set you have loaded.</p>"],
 ]},
 { id:"claude-commands", label:"AI commands &amp; skills", items:[
  ["Not using Claude Code?", "<p>Everything below works with <b>any</b> AI agent — Qwen, Codex, Gemini, Copilot, Cline. The <code>/slash-commands</code> are just shortcuts Claude Code adds; each one is a plain instruction file at <code>.claude/skills/&lt;name&gt;/SKILL.md</code> (the folder name is historical, not a scope). In another tool, say what you want in your own words and point it at the matching file — same steps, same result. Start it with: <i>“Read AGENTS.md, then CLAUDE.md, then .claude/skills/INDEX.md.”</i></p>"],
  ["Talking &amp; asking", "<p><code>/persona-talk</code> — interview a persona in character (bring several for a panel, or show a mockup for a reaction). <code>/persona-query</code> — a quick “would they…?” with most- and least-likely and an edge case. <code>/persona-voice</code> gives them an ElevenLabs voice; <code>/persona-avatar</code>, a face.</p>"],
  ["Building the graph", "<p><code>/persona-workshop</code> — build a persona from nothing, one question at a time. <code>/extract-findings</code> — turn transcripts into Signals and Evidence, with a PII scrub first. <code>/researcher</code> — desk research from the web, always filed as Evidence.</p>"],
  ["Keeping it honest", "<p><code>/graph-lint</code> — dead links, orphans, stale data (it never rewires without your nod). <code>/contradictions</code> — where the data argues with itself. <code>/backlog</code> — tidy the open questions. <code>/interview-guide</code> — turn gaps into a guide for real interviews.</p>"],
  ["Shipping the work", "<p><code>/feature-panel</code> — one feature across every persona, cited. <code>/prioritize</code> — RICE, with confidence drawn from grounding, not gut. <code>/prd</code> — a spec whose Why is fully cited. <code>/opportunity-tree</code>, <code>/journey-map</code>, <code>/export</code> — trees, maps, one-pagers, tickets.</p>"],
  ["Bringing in sources", "<p><code>/dovetail-sync</code> — Dovetail, read-only. <code>/source-sync</code> — call recordings (Grain, Fireflies, Otter, tl;dv, Zoom), Notion, Confluence, Capacities, usability tools. <code>/analytics-sync</code> — Mixpanel, GA4 or Amplitude, filed as clearly-labelled internal Evidence.</p>"],
 ]},
 { id:"personas", label:"Personas", items:[
  ["What is a Persona here?", "<p>An archetype made human — a person whose every claim traces to research: pains to Signals, numbers to Evidence. Not a demographic doodle. If nothing backs a claim, she simply says she does not know.</p>"],
  ["What does PARTICIPANTS count?", "<p>How many <b>different people</b> stand behind her — counted automatically from the transcripts her Signals reach. Every interview is a new person; a persona is a composite of matched sessions, never one person asked the same thing twice.</p>"],
  ["What does CONFIDENCE mean?", "<p>How much research she rests on, all told. “Medium” means her pains held up in a real interview and match public data — but from only a few sessions, so treat her answers as a direction, not a verdict.</p>"],
  ["Why won’t my persona just agree?", "<p>On purpose. Lead her (“you’d pay for this, right?”) and, when the data disagrees, she pushes back; invent a detail and she notices. That friction is the feature — it is what keeps a made-up conversation honest.</p>"],
  ["Where do the faces come from?", "<p>DiceBear’s “Notionists” (CC0, public domain), matched to her character and saved as a steady URL plus a local SVG. Made-up faces for made-up people — never a real participant’s likeness.</p>"],
 ]},
 { id:"archetypes", label:"Archetypes", items:[
  ["Archetype or persona — which is which?", "<p>The archetype is the <b>pattern</b> — the tension, the motivation, the moment — with no name and no face. The persona is that pattern living as a person. Pattern first: start from the face and you are just writing fiction.</p>"],
  ["Why do archetypes get objects, not faces?", "<p>Because they are types, not people. Each icon is a little scene of the core tension — a wheel and a speech bubble for the Voice-First Driver. Set it with <code>icon:</code>; the built-in set is in <code>Archetypes/_template.md</code>.</p>"],
  ["What are “Questions by context”?", "<p>First-person questions pinned to a situation (<code>[Driving]</code>, <code>[Playlist editing]</code>) that surface in a conversation <b>only</b> when the topic fits — a firm gate so archetype facts never leak into a reply where they do not belong.</p>"],
 ]},
 { id:"signals-evidence", label:"Signals &amp; Evidence", items:[
  ["Signal vs Evidence — the one rule", "<p><b>Signal</b> = something you saw yourself, in your own interview or test (it has a date and a transcript). <b>Evidence</b> = the reading — data someone else published. A web find or an analytics number is always Evidence; calling it a Signal only flatters your grounding.</p>"],
  ["What are the Levels, L1–L5?", "<p>One ladder for how sure you are: L1 a hunch → L2 evidence only → L3 signal only → L4 signal and evidence, validated → L5 plus a correlation. Conversations speak it in plain words; analyst views may show the code.</p>"],
  ["What is the 3-month freshness rule?", "<p>Signals carry an interview date, Evidence a <code>retrieved:</code> date. Anything past three months gets a gentle flag to re-check — old research is never quietly passed off as current.</p>"],
  ["Two of my signals disagree. Delete one?", "<p>Neither. A disagreement is data — two conflicting Signals stay two files, ideally with different reasons behind them. Run <code>/contradictions</code> to see every place the graph argues with itself.</p>"],
 ]},
 { id:"ideas", label:"Ideas", items:[
  ["What shape does an Idea take?", "<p><b>When / I want / So that</b> — the moment, the ask, the payoff — plus links to the Evidence and Signals that earn it. An idea with no links is just an opinion.</p>"],
  ["What do the three bars mean?", "<p>Grounding at a glance: three bars = signal and evidence (validated), two = signal only (your own, one source), one = evidence only (the reading), empty = nothing yet. It updates itself from the links.</p>"],
  ["How do I decide what to build first?", "<p>In Claude Code, <code>/prioritize</code> scores your Ideas with RICE — Reach has to cite Evidence and Confidence comes from grounding, never a hunch. Effort stays yours to size.</p>"],
 ]},
 { id:"competitors", label:"Competitors", items:[
  ["Why don’t personas know the competition?", "<p>Because it is opt-in (<code>--competitors</code> or <code>[competitors on]</code>). A persona speaks first-hand about a rival only when her own data supports it; everything else she relays second-hand, and says so.</p>"],
  ["How do I read the market map?", "<p>Left to right: how close they sit to you — <b>direct</b> (your exact segment), <b>adjacent</b> (a segment you could serve), <b>indirect</b> (same need, other product). Up and down: how many of your participants brought them up. It is the voice of your research, not market share.</p>"],
  ["What is the “Heard from” bar?", "<p>The share of your participants who mentioned them — one person, one vote, however often the name came up. An empty bar is a gap in your research, not an all-clear.</p>"],
  ["Where should competitor insight come from?", "<p>Review sites (G2, Capterra) are fair game — but never alone. The strongest signal is your own interviews: an unprompted mention becomes a Signal and nudges the dot up the map. More in <code>Competitors/README.md</code>.</p>"],
  ["How does the Compare view work?", "<p>Pick up to three competitors (your own product can be a column too) and read them against the categories <b>your</b> project decided on — <code>compare_categories</code> in <code>Product Context.md</code>, set during project setup. Cells come from each competitor's <code>## Comparison</code> table, filled by desk research with sources; an empty cell is an honest research gap, never a guess. Vanity metrics are left out by design.</p>"],
 ]},
 { id:"transcripts", label:"Transcripts &amp; the loop", items:[
  ["How do transcripts get in?", "<p>Drop files in <code>Inbox/</code> (a session-start hook notices) or pull them with <code>/source-sync</code> from your call tools. <code>/extract-findings</code> asks before it touches anything, scrubs PII, makes the Signals and Evidence, and files the original under <code>Transcripts/</code>.</p>"],
  ["Why can’t a conversation make a Signal?", "<p>The one rule that never bends: made-up talk never makes data. All a conversation leaves behind is questions, gathered in <code>Research backlog.md</code>. A Signal is born only from a real session with a real person.</p>"],
  ["What is Participants.md?", "<p>A pseudonymised roll of who you spoke to — which person mapped to which archetype, and what their session gave you. It shows your coverage at a glance: which patterns rest on many voices, and which hang on a single interview.</p>"],
  ["How does the loop close?", "<p>Conversations and gap-hunts fill the backlog → <code>/interview-guide</code> turns open questions into a guide → you run the real interviews → <code>/extract-findings</code> makes them Signals → grounding rises, and the graph gets a little truer.</p>"],
 ]},
]
/* The Polish help, as its own array rather than 45 dictionary keys the size of
   paragraphs: the two languages sit side by side, so a change to one is easy to
   mirror in the other. Same ids, same order. */
const HELP_PL = [
 { id:"getting-started", label:"Pierwsze kroki", items:[
  ["Jak zacząć?", "<p>Repozytorium na GitHubie <i>jest</i> miejscem pracy — użyj go jako <b>szablonu</b> albo sklonuj, a potem otwórz folder w <b>Claude Code</b>. Przy pierwszym uruchomieniu przywita cię i przeprowadzi przez konfigurację. Ta aplikacja w przeglądarce to po prostu <code>app/index.html</code>: otwierasz i działa, bez serwera i bez budowania.</p>"],
  ["Na co właściwie patrzę?", "<p>Na twoje badania jako żywy graf: <code>Dowody → Sygnały → (Persony ↔ Archetypy) → Pomysły</code>, jeden plik Markdown na jedną rzecz, plus opcjonalni konkurenci i surowe transkrypcje. Ta aplikacja jest oknem; właściwa praca — rozmowy z personami, wyciąganie wniosków z wywiadów — dzieje się w Claude Code.</p>"],
  ["Czy to prawdziwe dane?", "<p>Jeszcze nie — to, co dostajesz, jest rozpisanym przykładem (badanie o Spotify). Każdy plik nosi plakietkę <b>Demo</b> i cytuje prawdziwe, publiczne źródła, żebyś zobaczył kształt dobrej roboty. Podłącz własny folder, żeby go zastąpić, albo uruchom <code>/demo-data</code>, żeby przykład zachować, oddzielić lub usunąć.</p>"],
  ["Jak wnieść własne badania?", "<p>Kliknij <b>Podłącz folder</b> i wskaż swój projekt — sam folder, nie pliki w środku. W Chrome albo Edge pozwala to też edytować w miejscu. Robisz to raz: aplikacja zapamiętuje folder i następnym razem od razu go otwiera — przeglądarka może najpierw poprosić o potwierdzenie uprawnienia, to jedno kliknięcie, nie ponowne okno wyboru plików. Możesz też przeciągnąć pliki .md w dowolne miejsce okna albo wybrać kilka z panelu bocznego.</p>"],
  ["Czy działa na Windowsie i Linuksie?", "<p>Tak — dowolna nowoczesna przeglądarka, dowolny system. Edycja w miejscu chce Chrome albo Edge (na wszystkich trzech). Opcjonalne skrypty (<code>graph_lint</code>, <code>embed_demo</code>) potrzebują tylko Pythona 3; hook sesji Claude Code używa basha, który daje Git for Windows — a jeśli nigdy się nie odpali, nic innego się nie psuje.</p>"],
  ["Jak wygląda normalny dzień pracy?", "<p>To pętla. Transkrypcje lądują w <code>Inbox/</code> → <code>/extract-findings</code> zamienia je w sygnały i dowody i podpina do person → ty przepytujesz te persony (<code>/persona-talk</code>), co daje pytania, nigdy dane → prawdziwe wywiady na nie odpowiadają i koło się kręci. Ta aplikacja pokazuje, gdzie jesteś.</p>"],
 ]},
 { id:"interface", label:"Interfejs i widoki", items:[
  ["Co robią te małe przyciski widoków?", "<p>Obok wyszukiwania: <b>karty</b>, <b>jedna kolumna</b>, <b>tabela</b>, a przy konkurentach jeszcze <b>mapa rynku</b> i <b>porównanie</b> obok siebie. Każda karta oferuje tylko widoki, które do niej pasują, a twój wybór jest zapamiętywany. Kolumny tabeli przeciągasz, żeby zmienić szerokość, i klikasz, żeby posortować.</p>"],
  ["Są jakieś skróty klawiszowe?", "<p><code>/</code> przenosi do wyszukiwania. <code>Esc</code> cofa o krok (najpierw zamyka edytor, jeśli jest otwarty). A przycisk „wstecz” w przeglądarce po prostu działa — każda karta, pigułka i okruszek to przystanek w twojej historii.</p>"],
  ["Jak działa wyszukiwanie?", "<p>Wpisz w filtrze nad dowolną listą — przeszukuje tytuł, treść i frontmatter bieżącej karty, bez względu na wielkość liter. Nigdy nie opuszcza twojego komputera.</p>"],
  ["Czy mogę wysłać koledze link do jednej rzeczy?", "<p>Tak. Każdy widok szczegółu ma stały adres w rodzaju <code>index.html#personas-emma</code>. Na zestawie demo link przeżywa przeładowanie; przy twoich danych kolega musi najpierw podłączyć ten sam folder.</p>"],
  ["Jak edytować plik z poziomu aplikacji?", "<p>Chrome albo Edge: podłącz folder, otwórz coś i kliknij <b>Edytuj</b> w okruszkach. Zapis idzie prosto do pliku .md, po tym jak przeglądarka spyta o zgodę — a edycja, która zepsułaby linię <code>type:</code>, zostanie grzecznie odrzucona.</p>"],
  ["Czym jest sekcja Backlog badawczy?", "<p><b>Planowanie → Backlog badawczy</b> otwiera <code>Research backlog.md</code> — otwarte pytania, które zostawiły rozmowy z personami. Dodaj pytanie, doostrz jego brzmienie albo zamknij je z notatką, co na nie odpowiedziało; każda zmiana wraca do tej samej tabeli Markdown, którą czytają <code>/backlog</code> i <code>/interview-guide</code>. Zamknięcie zostawia wiersz (razem z powodem), zamiast go kasować — o ten ślad właśnie chodzi. Kliknij dowolne pytanie, a panel po prawej pokaże wszystko, co już mamy o odpowiadaniu na nie: jak pilne wygląda, czy chce historii czy liczby, i dwie albo trzy pasujące metody.</p>"],
  ["Kto decyduje, co jest krytyczne?", "<p>Ty — a dopóki nie powiesz inaczej, AI proponuje. Każde pytanie zapisane w trakcie sesji z personą przychodzi z <b>priorytetem</b> (<code>critical</code> / <code>major</code> / <code>minor</code>), a wiersze, które go nie mają, dostają przerywaną sugestię odczytaną z własnego brzmienia — nigdzie niezapisaną. W chwili, gdy wybierzesz priorytet sam, zapisuje się jako <code>critical (locked)</code> — a ten dopisek jest obietnicą: żadne uruchomienie AI już tego nie zmieni, nie wyczyści ani nie przeredaguje. To ta sama zasada co <code>affinity_lock</code> przy sygnale albo twoje <code>==podświetlenia==</code> w transkrypcji.</p>"],
  ["Dlaczego backlog dzieli się na jakościowy i ilościowy?", "<p>Bo jedno i drugie wymaga innych metod. Pytanie <b>jakościowe</b> chce historii — dlaczego, jak, czyimi słowami — i odpowiada się na nie porządną rozmową z kilkoma osobami. <b>Ilościowe</b> chce liczby — ile, jak często, jaki udział — i odpowiada się na nie liczeniem. Kliknij dowolne pytanie, żeby zobaczyć dwie albo trzy pasujące metody, każdą z uzasadnieniem, czemu pasuje do <i>tego</i> pytania, i z tym, czego ci nie powie. Nieotagowane wiersze pokazują przerywaną zgadywankę odczytaną z brzmienia; potwierdź ją, a wyląduje w kolumnie <code>Kind</code> w pliku, skąd biorą ją skille AI. I drabina dalej obowiązuje: sesja, którą sam prowadzisz, robi <b>sygnał</b>, agregat robi <b>dowód</b>.</p>"],
  ["Czym jest Eksport .md?", "<p>Całym twoim grafem spakowanym jako Markdown, z zachowaniem folderów — sposób bez zobowiązań, żeby przekazać go koledze albo przenieść do narzędzia w rodzaju Capacities, z pominięciem GitHuba.</p>"],
  ["Co znaczą ikony na małych pigułkach?", "<p>Każde odwołanie pokazuje, na co wskazuje: aktywność = sygnał, słupki = dowód, osoba = persona, warstwy = archetyp, błyskawica = pomysł, kartka = transkrypcja. Pigułka z przerywaną obwódką znaczy, że tego pliku nie ma w wczytanym zestawie.</p>"],
 ]},
 { id:"claude-commands", label:"Komendy i skille AI", items:[
  ["Nie używasz Claude Code?", "<p>Wszystko poniżej działa z <b>dowolnym</b> agentem AI — Qwen, Codex, Gemini, Copilot, Cline. <code>/slash-komendy</code> to tylko skróty, które dodaje Claude Code; każda z nich to zwykły plik z instrukcją w <code>.claude/skills/&lt;nazwa&gt;/SKILL.md</code> (nazwa folderu jest historyczna, nie oznacza ograniczenia). W innym narzędziu powiedz własnymi słowami, czego chcesz, i wskaż odpowiedni plik — te same kroki, ten sam efekt. Zacznij od: <i>„Przeczytaj AGENTS.md, potem CLAUDE.md, potem .claude/skills/INDEX.md.”</i></p>"],
  ["Rozmowa i pytania", "<p><code>/persona-talk</code> — przepytaj personę w roli (weź kilka na panel albo pokaż makietę, żeby zebrać reakcję). <code>/persona-query</code> — szybkie „czy ona by…?” z odpowiedzią najbardziej i najmniej prawdopodobną oraz przypadkiem brzegowym. <code>/persona-voice</code> daje im głos z ElevenLabs; <code>/persona-avatar</code> — twarz.</p>"],
  ["Budowanie grafu", "<p><code>/persona-workshop</code> — zbuduj personę od zera, pytanie po pytaniu. <code>/extract-findings</code> — zamień transkrypcje w sygnały i dowody, po wcześniejszym oczyszczeniu z danych osobowych. <code>/researcher</code> — desk research z sieci, zawsze zapisywany jako dowód.</p>"],
  ["Pilnowanie uczciwości", "<p><code>/graph-lint</code> — martwe linki, sieroty, przeterminowane dane (nigdy nie przepina niczego bez twojej zgody). <code>/contradictions</code> — miejsca, w których dane kłócą się same ze sobą. <code>/backlog</code> — porządki w otwartych pytaniach. <code>/interview-guide</code> — zamienia luki w scenariusz prawdziwych wywiadów.</p>"],
  ["Dowożenie pracy", "<p><code>/feature-panel</code> — jedna funkcja w oczach wszystkich person, z cytatami. <code>/prioritize</code> — RICE, w którym pewność bierze się z ugruntowania, nie z przeczucia. <code>/prd</code> — specyfikacja, której „dlaczego” jest w całości ocytowane. <code>/opportunity-tree</code>, <code>/journey-map</code>, <code>/export</code> — drzewa, mapy, jednostronicówki, tickety.</p>"],
  ["Wciąganie źródeł", "<p><code>/dovetail-sync</code> — Dovetail, tylko do odczytu. <code>/source-sync</code> — nagrania rozmów (Grain, Fireflies, Otter, tl;dv, Zoom), Notion, Confluence, Capacities, narzędzia do testów użyteczności. <code>/analytics-sync</code> — Mixpanel, GA4 albo Amplitude, zapisywane jako wyraźnie oznaczony dowód wewnętrzny.</p>"],
 ]},
 { id:"personas", label:"Persony", items:[
  ["Czym jest tutaj persona?", "<p>Archetypem, który stał się człowiekiem — osobą, której każde twierdzenie prowadzi z powrotem do badań: bóle do sygnałów, liczby do dowodów. Nie demograficzną wydmuszką. Jeśli za jakimś twierdzeniem nic nie stoi, po prostu mówi, że nie wie.</p>"],
  ["Co liczy UCZESTNICY?", "<p>Ile <b>różnych osób</b> za nią stoi — liczone automatycznie z transkrypcji, do których sięgają jej sygnały. Każdy wywiad to nowa osoba; persona jest złożeniem dopasowanych sesji, nigdy jedną osobą zapytaną dwa razy o to samo.</p>"],
  ["Co oznacza PEWNOŚĆ?", "<p>Ile badań pod nią stoi, w sumie. „Średnia” znaczy, że jej bóle potwierdziły się w prawdziwym wywiadzie i zgadzają się z danymi publicznymi — ale z niewielu sesji, więc traktuj jej odpowiedzi jako kierunek, nie wyrok.</p>"],
  ["Czemu moja persona się ze mną nie zgadza?", "<p>Bo tak ma być. Naprowadź ją („zapłaciłabyś za to, prawda?”) i jeśli dane mówią co innego, odbije piłeczkę; zmyśl szczegół, a to zauważy. To tarcie jest funkcją — właśnie ono trzyma zmyśloną rozmowę w ryzach.</p>"],
  ["Skąd biorą się twarze?", "<p>Z „Notionists” od DiceBear (CC0, domena publiczna), dobrane do charakteru i zapisane jako stały adres plus lokalny plik SVG. Zmyślone twarze dla zmyślonych ludzi — nigdy wizerunek prawdziwego uczestnika.</p>"],
 ]},
 { id:"archetypes", label:"Archetypy", items:[
  ["Archetyp czy persona — co jest czym?", "<p>Archetyp to <b>wzorzec</b> — napięcie, motywacja, moment — bez imienia i bez twarzy. Persona to ten wzorzec żyjący jako człowiek. Najpierw wzorzec: jeśli zaczniesz od twarzy, piszesz po prostu fikcję.</p>"],
  ["Czemu archetypy dostają przedmioty, a nie twarze?", "<p>Bo są typami, nie ludźmi. Każda ikona to mała scena z głównym napięciem — kierownica i dymek dla Kierowcy Sterowanego Głosem. Ustawisz ją przez <code>icon:</code>; wbudowany zestaw jest w <code>Archetypes/_template.md</code>.</p>"],
  ["Czym są „pytania wg kontekstu”?", "<p>Pytaniami w pierwszej osobie przypiętymi do sytuacji (<code>[Prowadzenie auta]</code>, <code>[Edycja playlisty]</code>), które pojawiają się w rozmowie <b>tylko</b> wtedy, gdy temat pasuje — twarda bramka, dzięki której fakty z archetypu nie wyciekają do odpowiedzi, w których nie mają czego szukać.</p>"],
 ]},
 { id:"signals-evidence", label:"Sygnały i dowody", items:[
  ["Sygnał czy dowód — jedna zasada", "<p><b>Sygnał</b> = coś, co sam widziałeś, we własnym wywiadzie albo teście (ma datę i transkrypcję). <b>Dowód</b> = lektura, dane opublikowane przez kogoś innego. Znalezisko z sieci albo liczba z analityki to zawsze dowód; nazwanie tego sygnałem tylko pochlebia twojemu ugruntowaniu.</p>"],
  ["Czym są poziomy L1–L5?", "<p>Jedną drabiną tego, jak bardzo jesteś pewien: L1 przeczucie → L2 same dowody → L3 same sygnały → L4 sygnał i dowód, zwalidowane → L5 dodatkowo korelacja. Rozmowy mówią o tym zwykłymi słowami; widoki analityczne mogą pokazywać sam kod.</p>"],
  ["Czym jest zasada 3 miesięcy?", "<p>Sygnały niosą datę wywiadu, dowody datę <code>retrieved:</code>. Wszystko starsze niż trzy miesiące dostaje delikatną flagę do ponownego sprawdzenia — stare badania nigdy nie są po cichu podawane jako aktualne.</p>"],
  ["Dwa moje sygnały sobie przeczą. Skasować jeden?", "<p>Żadnego. Sprzeczność to dane — dwa sprzeczne sygnały zostają dwoma plikami, najlepiej z różnymi powodami za nimi. Uruchom <code>/contradictions</code>, żeby zobaczyć każde miejsce, w którym graf kłóci się sam ze sobą.</p>"],
 ]},
 { id:"ideas", label:"Pomysły", items:[
  ["Jaki kształt ma pomysł?", "<p><b>Kiedy / Chcę / Żeby</b> — moment, prośba, korzyść — plus linki do dowodów i sygnałów, które na niego zapracowały. Pomysł bez linków to po prostu opinia.</p>"],
  ["Co znaczą te trzy słupki?", "<p>Ugruntowanie na pierwszy rzut oka: trzy słupki = sygnał i dowód (zwalidowane), dwa = sam sygnał (twój własny, jedno źródło), jeden = sam dowód (lektura), puste = jeszcze nic. Aktualizuje się samo z linków.</p>"],
  ["Jak zdecydować, co budować najpierw?", "<p>W Claude Code <code>/prioritize</code> punktuje twoje pomysły metodą RICE — Reach musi cytować dowód, a Confidence bierze się z ugruntowania, nigdy z przeczucia. Effort zostaje po twojej stronie.</p>"],
 ]},
 { id:"competitors", label:"Konkurenci", items:[
  ["Czemu persony nie znają konkurencji?", "<p>Bo to opcja włączana świadomie (<code>--competitors</code> albo <code>[competitors on]</code>). Persona mówi o rywalu z pierwszej ręki tylko wtedy, gdy stoją za tym jej własne dane; całą resztę relacjonuje z drugiej ręki i to zaznacza.</p>"],
  ["Jak czytać mapę rynku?", "<p>Od lewej do prawej: jak blisko ciebie siedzą — <b>bezpośredni</b> (dokładnie twój segment), <b>sąsiedni</b> (segment, który mógłbyś obsłużyć), <b>pośredni</b> (ta sama potrzeba, inny produkt). Góra–dół: ilu twoich uczestników o nich wspomniało. To głos twoich badań, nie udział w rynku.</p>"],
  ["Czym jest pasek „usłyszane od”?", "<p>Udziałem twoich uczestników, którzy o nich wspomnieli — jedna osoba, jeden głos, niezależnie od tego, ile razy padła nazwa. Pusty pasek to luka w badaniach, nie zielone światło.</p>"],
  ["Skąd powinna pochodzić wiedza o konkurencji?", "<p>Serwisy z recenzjami (G2, Capterra) są w porządku — ale nigdy same. Najmocniejszym sygnałem są twoje własne wywiady: niewymuszona wzmianka staje się sygnałem i podnosi kropkę na mapie. Więcej w <code>Competitors/README.md</code>.</p>"],
  ["Jak działa widok porównania?", "<p>Wybierasz do trzech konkurentów (twój własny produkt też może być kolumną) i czytasz ich wobec kategorii, które wybrał <b>twój</b> projekt — <code>compare_categories</code> w <code>Product Context.md</code>, ustawione przy jego zakładaniu. Komórki pochodzą z tabeli <code>## Comparison</code> każdego konkurenta, wypełnionej desk researchem ze źródłami; pusta komórka to uczciwa luka badawcza, nigdy zgadywanka. Metryki próżności są celowo pominięte.</p>"],
 ]},
 { id:"transcripts", label:"Transkrypcje i pętla", items:[
  ["Jak transkrypcje trafiają do środka?", "<p>Wrzuć pliki do <code>Inbox/</code> (hook przy starcie sesji je zauważy) albo ściągnij je przez <code>/source-sync</code> z narzędzi do rozmów. <code>/extract-findings</code> pyta, zanim czegokolwiek dotknie, czyści dane osobowe, tworzy sygnały i dowody i odkłada oryginał do <code>Transcripts/</code>.</p>"],
  ["Czemu rozmowa nie może stworzyć sygnału?", "<p>To jedyna zasada, która nigdy się nie ugina: zmyślona rozmowa nie robi danych. Wszystko, co zostawia po sobie rozmowa, to pytania, zbierane w <code>Research backlog.md</code>. Sygnał rodzi się wyłącznie z prawdziwej sesji z prawdziwym człowiekiem.</p>"],
  ["Czym jest Participants.md?", "<p>Spseudonimizowaną listą osób, z którymi rozmawiałeś — kto mapował się na który archetyp i co dała jego sesja. Pokazuje twoje pokrycie na jednym ekranie: które wzorce stoją na wielu głosach, a które wiszą na jednym wywiadzie.</p>"],
  ["Jak domyka się pętla?", "<p>Rozmowy i polowania na luki zapełniają backlog → <code>/interview-guide</code> zamienia otwarte pytania w scenariusz → ty przeprowadzasz prawdziwe wywiady → <code>/extract-findings</code> robi z nich sygnały → ugruntowanie rośnie, a graf staje się odrobinę prawdziwszy.</p>"],
 ]},
]
/* one source of truth for the page — the array that matches the current language */
function helpData(){ return LANG==='pl' ? HELP_PL : HELP; }
let HELP_ACTIVE = false, HELP_CAT = 'getting-started';
const helpBtn = document.getElementById('helpBtn');
function renderHelp(){
  pageTitle.textContent = tr('Help & guide');   // a language switch re-renders, never re-enters
  const H = helpData();
  const cat = H.find(c=>c.id===HELP_CAT) || H[0];
  grid.className = 'help-wrap';
  grid.innerHTML = `
    <div class="help-nav">${H.map(c=>`<button data-cat="${c.id}" class="${c.id===cat.id?'active':''}">${c.label}</button>`).join('')}</div>
    <div class="help-main">
      <h2>${cat.label}</h2>
      <div class="sub">${tr('Short answers, straight to the point. Click a question to expand. New here?')} <button type="button" class="linklike" id="helpTour">${tr('▶ Replay the intro tour')}</button></div>
      <label class="help-filter">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="helpFilter" placeholder="${esc(tr('Filter these questions…'))}" autocomplete="off" aria-label="${esc(tr('Filter questions in this category'))}">
        <span class="n" id="helpCount">${cat.items.length} ${tr('of')} ${cat.items.length}</span>
      </label>
      <div id="helpList">${cat.items.map(([q,a])=>`<details class="qa"><summary>${q}</summary><div class="a">${a}</div></details>`).join('')}</div>
    </div>`;
  grid.querySelectorAll('.help-nav button').forEach(b=> b.onclick = ()=>{ location.hash = '#help:'+b.dataset.cat; });
  const inp = grid.querySelector('#helpFilter');
  inp.oninput = ()=>{
    const f = inp.value.trim().toLowerCase(); let n=0;
    grid.querySelectorAll('#helpList .qa').forEach(d=>{
      const hit = !f || d.textContent.toLowerCase().includes(f);
      d.style.display = hit ? '' : 'none'; if(hit) n++;
      if(f && hit) d.open = true;
    });
    grid.querySelector('#helpCount').textContent = n + ' ' + tr('of') + ' ' + cat.items.length;
  };
}
function helpEnter(cat){
  if(typeof settingsExit === 'function') settingsExit();
  if(typeof mindmapExit === 'function') mindmapExit();
  HELP_ACTIVE = true; if(cat) HELP_CAT = cat;
  syncLinTheme();
  helpBtn.classList.add('active');
  galleryView.style.display = ""; detailView.classList.remove('active');
  hideGalleryChrome();
  renderTabs(); // clear any graph-tab highlight — this page owns the active state
  pageTitle.textContent = tr('Help & guide');
  pageSub.style.display = 'none';
  renderHelp(); window.scrollTo(0,0);
}
function helpExit(){
  if(!HELP_ACTIVE) return;
  HELP_ACTIVE = false;
  helpBtn.classList.remove('active');
  updatePageHead();
}
helpBtn.onclick = ()=>{ location.hash = '#help:'+HELP_CAT; };

