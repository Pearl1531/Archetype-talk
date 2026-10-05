/* ---------- display language ----------
   One language for the app's own words, chosen by the user and remembered per
   project copy. Two boundaries decide what this may and may not touch:

   1. It never translates your research. Switching to Polish changes labels,
      help text, toasts — the app talking about itself — and the shipped Demo
      set, which is fiction we authored. A Signal you recorded in English stays
      in English: a verbatim quote is data, and a research tool that silently
      rewrites data is worse than one that only speaks English.
   2. Nothing is translated at runtime. Every string below was written out in
      full; there is no model here, no network, no guessing. A key with no
      translation falls back to English rather than inventing one — a visibly
      English label is a smaller failure than a confidently wrong Polish one.

   Keys ARE the English source string, so a call site reads as the sentence it
   renders and an untranslated string still says something sensible. */
let LANG = store.get('at-lang')==='pl' ? 'pl' : 'en';

const PL = {
  /* ---- sidebar, shell chrome ---- */
  'Home': 'Start',
  'Overview': 'Przegląd',
  'Research graph': 'Graf badań',
  'Planning': 'Planowanie',
  'Research backlog': 'Backlog badawczy',
  'Views': 'Widoki',
  'Research map': 'Mapa badań',
  'Support': 'Pomoc',
  'Settings': 'Ustawienia',
  'Help & guide': 'Pomoc i przewodnik',   // dataset.i18n hands back the DECODED attribute, so the key is the plain ampersand
  'Export .md': 'Eksport .md',
  'Connect folder': 'Podłącz folder',
  'Refresh files': 'Odśwież pliki',
  'Reconnect': 'Połącz ponownie',
  'Skip to content': 'Przejdź do treści',
  'Menu': 'Menu',
  'Switch workspace': 'Przełącz przestrzeń',
  'Archetype Talk — workspaces': 'Archetype Talk — przestrzenie',
  'Archetype Talk': 'Archetype Talk',
  'Discard the sandbox edits stored in this browser and restore the shipped example set':
    'Odrzuć zmiany z piaskownicy zapisane w tej przeglądarce i przywróć dostarczony zestaw przykładowy',
  'Reset the Demo workspace?': 'Zresetować przestrzeń Demo?',
  'All sandbox edits made in this browser (highlights, votes, text changes) will be discarded and the shipped example set restored.':
    'Wszystkie zmiany zrobione w tej przeglądarce (podświetlenia, głosy, edycje tekstu) zostaną odrzucone, a dostarczony zestaw przykładowy przywrócony.',
  '▶ New here? Take the 1-minute tour': '▶ Pierwszy raz? Minutowe wprowadzenie',
  'Drop .md files': 'Upuść pliki .md',
  'Language': 'Język',

  /* ---- First run — the welcome card (13d-welcome.js) ---- */
  'Welcome to Archetype Talk': 'Witaj w Archetype Talk',
  'Speak with your real data': 'Rozmawiaj ze swoimi prawdziwymi danymi',
  'Connect your folder': 'Połącz swój folder',
  'Skip for now': 'Pomiń na razie',
  'Leave a star on the repo': 'Zostaw gwiazdkę w repozytorium',
  'Secured · local-only interface': 'Bezpieczne · interfejs tylko lokalny',
  /* the five-step setup walk-through */
  'Five short steps: what this is, how you work with it, what it does with your data — and only then the folder.':
    'Pięć krótkich kroków: czym to jest, jak się z tym pracuje, co dzieje się z Twoimi danymi — i dopiero na końcu folder.',
  'Start setup': 'Rozpocznij konfigurację',
  'Open the demo instead': 'Otwórz zamiast tego demo',
  'Connect the project folder': 'Połącz folder projektu',
  'Step {n} of {total}': 'Krok {n} z {total}',
  'Setup progress': 'Postęp konfiguracji',
  'What this repository is': 'Czym jest to repozytorium',
  'A UX-research knowledge graph you can talk to. Your interviews and reports stay ordinary Markdown files in your folder — this app is the reading layer on top of them.':
    'Graf wiedzy z badań UX, z którym można rozmawiać. Twoje wywiady i raporty zostają zwykłymi plikami Markdown w Twoim folderze — ta aplikacja jest tylko warstwą do ich czytania.',
  'Evidence → Signal → Persona → Idea': 'Dowód → Sygnał → Persona → Pomysł',
  'A persona is assembled from what people actually said, and every claim links back to the file it came from.':
    'Persona jest złożona z tego, co ludzie faktycznie powiedzieli, a każde twierdzenie odsyła do pliku, z którego pochodzi.',
  'Nothing here is invented': 'Nic tu nie jest zmyślone',
  'Quotes, numbers and sources are never generated. A claim with no source stays a hypothesis — and is labelled as one.':
    'Cytaty, liczby i źródła nigdy nie są generowane. Twierdzenie bez źródła zostaje hipotezą — i jest tak oznaczone.',
  'Levels, not vibes': 'Poziomy, nie wrażenia',
  'Each finding carries a level from L1 (assumption) to L5 (validated with correlation), so you can see how much weight it holds.':
    'Każde ustalenie ma poziom od L1 (założenie) do L5 (zwalidowane z korelacją), więc od razu widać, ile waży.',
  'You and your AI assistant': 'Ty i Twój asystent AI',
  'The app shows the graph; your AI assistant writes it. Both work on the same folder of Markdown files, so neither of them owns your data.':
    'Aplikacja pokazuje graf, asystent AI go zapisuje. Oboje pracują na tym samym folderze plików Markdown, więc żadne z nich nie jest właścicielem Twoich danych.',
  'Talk to a persona': 'Porozmawiaj z personą',
  'She answers only from her linked signals and evidence — and a conversation never creates research data, only questions to go and ask.':
    'Odpowiada wyłącznie z podpiętych do niej sygnałów i dowodów — a rozmowa nigdy nie tworzy danych badawczych, tylko pytania do zadania ludziom.',
  'Turn interviews into findings': 'Zamień wywiady w ustalenia',
  'Put a transcript in the folder and ask the assistant to extract findings: signals and evidence come back with sources attached.':
    'Wrzuć transkrypcję do folderu i poproś asystenta o wyciągnięcie ustaleń: sygnały i dowody wracają z podpiętymi źródłami.',
  'You approve every write': 'Każdy zapis zatwierdzasz Ty',
  'Files change when you say so. Hand-written links and locked fields are never rewired behind your back.':
    'Pliki zmieniają się wtedy, gdy na to pozwolisz. Ręcznie napisane linki i zablokowane pola nigdy nie są przestawiane za Twoimi plecami.',
  'Safety and privacy': 'Bezpieczeństwo i prywatność',
  'Everything runs on your machine — no account, no server, nothing uploaded. Which is exactly why the browser you open this in matters.':
    'Wszystko działa na Twoim komputerze — bez konta, bez serwera, nic nie jest wysyłane. I właśnie dlatego ma znaczenie, w jakiej przeglądarce to otwierasz.',
  'Use a secure, up-to-date browser': 'Używaj bezpiecznej, aktualnej przeglądarki',
  'Reading a local folder needs the File System Access API — Chrome or Edge, kept current. That browser is the only thing standing between a web page and your disk, so an old one is a real risk.':
    'Odczyt lokalnego folderu wymaga File System Access API — Chrome albo Edge, na bieżąco aktualizowany. Ta przeglądarka jest jedyną rzeczą między stroną a Twoim dyskiem, więc stara wersja to realne ryzyko.',
  'Access is per folder, and you can take it back': 'Dostęp dotyczy jednego folderu i możesz go cofnąć',
  'The browser asks before we may read anything, the permission covers one folder and nothing above it, and it lapses when you close the tab.':
    'Przeglądarka pyta, zanim cokolwiek przeczytamy, zgoda obejmuje jeden folder i nic powyżej niego, a wygasa po zamknięciu karty.',
  'Secrets stay out of the repository': 'Sekrety zostają poza repozytorium',
  'API keys belong in <code>.env</code> — never in chat, never in a committed file. Data marked sensitive is not exported or read aloud by default.':
    'Klucze API należą do <code>.env</code> — nigdy do czatu i nigdy do commitowanego pliku. Dane oznaczone jako wrażliwe domyślnie nie są eksportowane ani czytane na głos.',
  'Last step. Point us at this project’s folder — the one holding <code>Personas/</code>, <code>Signals/</code> and <code>Transcripts/</code>.':
    'Ostatni krok. Wskaż folder tego projektu — ten, w którym leżą <code>Personas/</code>, <code>Signals/</code> i <code>Transcripts/</code>.',
  'Why this matters': 'Dlaczego to ważne',
  'Without a folder the app has only the demo to show. With one it reads your real research straight from disk — no import, no copy, no sync, no second version of the truth.':
    'Bez folderu aplikacja ma do pokazania tylko demo. Z folderem czyta Twoje prawdziwe badania prosto z dysku — bez importu, bez kopii, bez synchronizacji i bez drugiej wersji prawdy.',
  'What we touch': 'Czego dotykamy',
  'We read the <code>.md</code> files in that folder. We write only when you edit something here or ask for it.':
    'Czytamy pliki <code>.md</code> w tym folderze. Zapisujemy tylko wtedy, gdy coś tu edytujesz albo o to poprosisz.',
  'Pick the project’s top folder': 'Wskaż główny folder projektu',
  'No folder yet? Start a new project': 'Nie masz folderu? Załóż nowy projekt',
  'How do you manage your library?': 'Jak zarządzasz swoją biblioteką?',
  'The folder that contains the entity folders — not your whole Documents, and not one folder inside it.':
    'Ten, w którym są foldery encji — nie całe Dokumenty i nie jeden folder w środku.',
  'Exit': 'Wyjdź',
  'Leave the project — back to the welcome screen': 'Wyjdź z projektu — z powrotem na ekran powitalny',

  /* ---- Projects screen ---- */
  'Projects': 'Projekty',
  '▦ All projects…': '▦ Wszystkie projekty…',
  'Your projects': 'Twoje projekty',
  'Every project is a folder of Markdown files you own. Open one to browse its graph, talk to its personas and edit the files in place.':
    'Każdy projekt to folder z plikami Markdown, który należy do ciebie. Otwórz go, żeby przeglądać graf, rozmawiać z personami i edytować pliki w miejscu.',
  'New project': 'Nowy projekt',
  'Pick an empty folder — we create the research structure inside it and connect to it.':
    'Wskaż pusty folder — utworzymy w nim strukturę badawczą i podłączymy go.',
  'Import a project': 'Wczytaj projekt',
  'Connect a folder that already holds research — yours, or one pulled from git.':
    'Podłącz folder, w którym już są badania — twój albo pobrany z gita.',
  'Open the demo': 'Otwórz demo',
  'A finished example project you can click through and edit. It never mixes with your work.':
    'Gotowy przykładowy projekt — możesz go klikać i edytować. Nigdy nie miesza się z twoją pracą.',
  'Open': 'Otwórz',
  'Open project': 'Otwórz projekt',
  'Forget': 'Zapomnij',
  'Remove from this list — the folder and its files stay where they are':
    'Usuń z tej listy — folder i pliki zostają na miejscu',
  'Remove {name} from the projects list? The folder and every file in it stay exactly where they are.':
    'Usunąć {name} z listy projektów? Folder i wszystkie pliki w nim zostają dokładnie tam, gdzie są.',
  'No project connected yet': 'Nie ma jeszcze podłączonego projektu',
  'A project is a folder on this computer. Start one, connect a folder you already work in, or click through the demo first.':
    'Projekt to folder na tym komputerze. Załóż nowy, podłącz ten, w którym już pracujesz, albo najpierw obejrzyj demo.',
  'connected now': 'podłączony teraz',
  'nothing read yet': 'jeszcze nic nie wczytano',
  'That folder holds only example files — opened the Demo workspace, and left the Projects list alone.':
    'Ten folder zawiera wyłącznie pliki przykładowe — otwarto przestrzeń Demo, lista projektów została nietknięta.',
  'sandbox, in this browser': 'piaskownica, w tej przeglądarce',
  'not opened yet': 'jeszcze nieotwierany',
  'opened today': 'otwarty dzisiaj',
  'opened yesterday': 'otwarty wczoraj',
  'opened': 'otwarty',
  'Nothing leaves this computer': 'Nic nie opuszcza tego komputera',
  'The app reads the folder you point it at. No account, no upload, no sync.':
    'Aplikacja czyta folder, który jej wskażesz. Bez konta, bez wysyłki, bez synchronizacji.',
  'This browser can browse but not connect a folder — creating and opening projects needs Chrome or Edge.':
    'Ta przeglądarka pozwala przeglądać, ale nie podłączyć folderu — zakładanie i otwieranie projektów wymaga Chrome albo Edge.',
  'Creating a project needs Chrome or Edge': 'Zakładanie projektu wymaga Chrome albo Edge',
  '{name} is not empty. We only ADD the missing folders and leave every existing file untouched — continue?':
    '{name} nie jest pusty. Dodamy tylko brakujące foldery i nie ruszymy żadnego istniejącego pliku — kontynuować?',
  'Could not write to that folder — pick one you can edit':
    'Nie udało się zapisać w tym folderze — wybierz taki, w którym możesz pisać',
  'Could not open the new project': 'Nie udało się otworzyć nowego projektu',
  'Project created — the folders are ready and nothing else in there was touched ✓':
    'Projekt utworzony — foldery gotowe, nic innego nie zostało ruszone ✓',
  /* Projects screen — the starter prompt and the Help & FAQ page. The prompt
     TEXT itself stays English on purpose (like every other copied prompt):
     promptLang() tells the agent to answer in Polish. */
  'Already have the folder open in an AI assistant? Copy the opening prompt — it tells the agent what to read first and how to start.':
    'Masz już ten folder otwarty w asystencie AI? Skopiuj prompt otwierający — mówi agentowi, co przeczytać najpierw i jak zacząć.',
  'Copy the starter prompt for': 'Skopiuj prompt startowy dla',
  'Pick another AI assistant': 'Wybierz innego asystenta AI',
  'Copy the prompt for…': 'Skopiuj prompt dla…',
  'Another assistant': 'Inny asystent',
  'The prompt is plain text — it points the agent at the rule files in the folder, so it works the same in any assistant.':
    'Prompt to zwykły tekst — wskazuje agentowi pliki z zasadami w folderze, więc działa tak samo w każdym asystencie.',
  'Help & FAQ': 'Pomoc i FAQ',
  'How to run the whole thing, what it supports, and what to do when something will not connect. Everything here is about the app and the folder — never about your research.':
    'Jak uruchomić całość, co wspieramy i co zrobić, kiedy coś nie chce się podłączyć. Wszystko tutaj dotyczy aplikacji i folderu — nigdy twoich badań.',
  'Still stuck? Open the project and use Help & guide inside it — it goes deeper, view by view.':
    'Nadal utknąłeś? Otwórz projekt i zajrzyj do Pomocy i przewodnika w środku — tam jest głębiej, widok po widoku.',
  'Open source, MIT licence': 'Open source, licencja MIT',

  'A snapshot of what’s in your research graph right now — and what to look at next.':
    'Migawka tego, co jest teraz w twoim grafie badań — i co obejrzeć dalej.',

  /* ---- adding entries by hand (09b-new-entity.js) ---- */
  'New signal': 'Nowy sygnał',
  'New evidence': 'Nowy dowód',
  'New persona': 'Nowa persona',
  'New archetype': 'Nowy archetyp',
  'New transcript': 'Nowa transkrypcja',
  'Add a signal': 'Dodaj sygnał',
  'Add evidence': 'Dodaj dowód',
  'Add a persona': 'Dodaj personę',
  'Add an archetype': 'Dodaj archetyp',
  'Add a transcript': 'Dodaj transkrypcję',
  'Add an idea': 'Dodaj pomysł',
  'AI prompt': 'Prompt do AI',
  'Create': 'Utwórz',
  'required': 'wymagane',
  'Copy an instruction you can paste into your AI assistant': 'Skopiuj polecenie, które wkleisz swojemu asystentowi AI',
  'Prompt copied — paste it into your AI assistant ✓': 'Prompt skopiowany — wklej go swojemu asystentowi AI ✓',
  'Copy failed — select the text manually': 'Kopiowanie nie wyszło — zaznacz tekst ręcznie',
  '⧉ Copy AI prompt': '⧉ Kopiuj prompt do AI',
  'Nothing here yet.': 'Jeszcze nic tu nie ma.',
  'Give it a filename-safe name': 'Nadaj nazwę, która może być nazwą pliku',
  'A file with that name already exists': 'Plik o tej nazwie już istnieje',
  'Could not create the draft': 'Nie udało się utworzyć szkicu',
  'Save failed: ': 'Zapis nie powiódł się: ',
  'Saved into your project folder ✓ — open Edit to keep filling it in':
    'Zapisano w folderze projektu ✓ — kliknij Edytuj, żeby uzupełniać dalej',
  'Draft saved in this browser ✓ — connect your folder to make it a real file':
    'Szkic zapisany w tej przeglądarce ✓ — podłącz folder, żeby stał się prawdziwym plikiem',
  'No folder connected — this is kept as a local draft in this browser (editable, exported with Export .md). Connect your project folder anytime to save drafts as real files.':
    'Brak podłączonego folderu — zostanie zapisane jako szkic w tej przeglądarce (edytowalny, wchodzi do Eksportu .md). Podłącz folder projektu kiedy zechcesz, żeby zapisać szkice jako prawdziwe pliki.',
  'The button writes the file for you — no AI needed. The prompt is there for when you would rather hand a stack of transcripts to your agent.':
    'Przycisk sam zapisuje plik — bez AI. Prompt jest na wypadek, gdybyś wolał oddać stos transkrypcji swojemu agentowi.',

  /* leads and hints in the forms */
  'One observation from one real session — something you saw or heard yourself.':
    'Jedna obserwacja z jednej prawdziwej sesji — coś, co sam widziałeś albo usłyszałeś.',
  'Desk research: a report, a number, a public thread. Anything you did not observe yourself.':
    'Desk research: raport, liczba, publiczny wątek. Wszystko, czego nie zaobserwowałeś sam.',
  'A person your research keeps describing. Built by hand here — link her Signals as they arrive.':
    'Osoba, którą twoje badania opisują raz po raz. Tworzysz ją ręcznie — sygnały podlinkujesz, kiedy się pojawią.',
  'The pattern behind the person — a type, not someone in particular.':
    'Wzorzec stojący za osobą — typ, a nie ktoś konkretny.',
  'The conversation itself, word for word — one file, one person. Paste it here or drop the .md into the folder.':
    'Sama rozmowa, słowo w słowo — jeden plik, jedna osoba. Wklej ją tutaj albo wrzuć .md do folderu.',
  'What you observed, in one line': 'Co zaobserwowałeś, w jednej linii',
  'The observation': 'Obserwacja',
  'Verbatim quote': 'Cytat dosłowny',
  'their words, in the language they used — a quote is data': 'ich słowa, w języku, w którym padły — cytat to dane',
  'Where it came from': 'Skąd to pochodzi',
  'transcript title or interview id': 'tytuł transkrypcji albo id wywiadu',
  'Interview date': 'Data wywiadu',
  'Theme group': 'Grupa tematyczna',
  'optional — the affinity board uses it': 'opcjonalne — używa tego tablica tematyczna',
  'Tags': 'Tagi',
  'comma-separated': 'po przecinku',
  'Title': 'Tytuł',
  'What it says': 'Co z tego wynika',
  'Takeaways': 'Wnioski',
  'one per line': 'po jednym w linii',
  'Sources': 'Źródła',
  'one URL or reference per line — required for it to count as evidence':
    'jeden URL albo odnośnik na linię — bez tego to nie jest dowód',
  'Retrieved': 'Zweryfikowano',
  'when you last verified it — it goes stale after 3 months': 'kiedy ostatnio to sprawdziłeś — po 3 miesiącach się starzeje',
  'Name': 'Imię i nazwisko',
  'Role / who they are': 'Rola / kim jest',
  'Their core tension, in their voice': 'Jej główne napięcie, jej własnymi słowami',
  'one sentence, first person': 'jedno zdanie, pierwsza osoba',
  'Category': 'Kategoria',
  'not sure yet': 'jeszcze nie wiem',
  'Primary': 'Główna',
  'Secondary': 'Poboczna',
  'Who they are': 'Kim jest',
  'background colour — not research findings': 'kontekst postaci — nie wyniki badań',
  'Short description': 'Krótki opis',
  'the behaviour pattern: tension, motivation, context — no name, no age':
    'wzorzec zachowania: napięcie, motywacja, kontekst — bez imienia, bez wieku',
  'Core pain': 'Główny ból',
  'one sentence': 'jedno zdanie',
  'Persona who embodies it': 'Persona, która to ucieleśnia',
  'optional': 'opcjonalne',
  'Interview id': 'Id wywiadu',
  'Participant': 'Uczestnik',
  'pseudonymised: code, age, role, city — never a full name or email':
    'spseudonimizowany: kod, wiek, rola, miasto — nigdy pełne imię ani e-mail',
  'Method': 'Metoda',
  'Date': 'Data',
  'Consent on file': 'Zgoda w aktach',
  'optional — absence means "not recorded", it blocks nothing':
    'opcjonalne — brak znaczy „nie odnotowano”, niczego nie blokuje',
  'not recorded': 'nie odnotowano',
  'written': 'pisemna',
  'verbal, recorded': 'ustna, nagrana',
  'none': 'brak',
  'not applicable': 'nie dotyczy',
  'The conversation': 'Rozmowa',
  'paste it — use **M:** for moderator and **P:** for participant':
    'wklej ją — **M:** to moderator, **P:** to uczestnik',

  /* bar notes and empty states */
  'Yours to write — or let your agent draft them from transcripts.':
    'Możesz je napisać sam — albo pozwolić agentowi wyciągnąć je z transkrypcji.',
  'Desk research: reports, numbers, public threads. Every entry needs a source and the date you checked it.':
    'Desk research: raporty, liczby, publiczne wątki. Każdy wpis potrzebuje źródła i daty sprawdzenia.',
  'Write her by hand, link her Signals as they arrive. Until then she is an assumption, and the app says so.':
    'Napisz ją ręcznie, sygnały podlinkuj z czasem. Do tego momentu jest założeniem — i aplikacja to mówi wprost.',
  'Name the tension, then link the Signals that show it.':
    'Nazwij napięcie, potem podlinkuj sygnały, które je pokazują.',
  'Paste a conversation, or drop the .md straight into the folder.':
    'Wklej rozmowę albo wrzuć plik .md prosto do folderu.',
  'Add one yourself: what one person did or said, plus their exact words. Or hand your agent the transcripts and let it draft them for you.':
    'Dodaj sam: co jedna osoba zrobiła albo powiedziała, plus jej dokładne słowa. Albo daj agentowi transkrypcje i pozwól mu przygotować szkice.',
  'Add a report, a number or a public thread you have already read — with its link and the date you checked it. Or let your agent do the reading.':
    'Dodaj raport, liczbę albo publiczny wątek, który już przeczytałeś — z linkiem i datą sprawdzenia. Albo niech czytaniem zajmie się agent.',
  'Write the person you keep meeting in sessions. She stays an assumption until Signals are linked to her — that is the honest starting point, not a flaw.':
    'Opisz osobę, którą wciąż spotykasz na sesjach. Pozostaje założeniem, dopóki nie podepniesz do niej sygnałów — to uczciwy punkt startu, nie wada.',
  'Name the pattern behind your personas. One or two sentences is enough to start.':
    'Nazwij wzorzec stojący za twoimi personami. Na start wystarczy jedno–dwa zdania.',
  'Paste a conversation, or drop the .md file straight into the folder — the app picks it up on the next refresh.':
    'Wklej rozmowę albo wrzuć plik .md prosto do folderu — aplikacja podniesie go przy następnym odświeżeniu.',
  'Write it as When / I want / So that, and link the Signal or Evidence that earns it. Grounding is required here, on purpose.':
    'Zapisz jako Kiedy / Chcę / Żeby i podlinkuj sygnał albo dowód, który na to zapracował. Ugruntowanie jest tu wymagane — celowo.',
  'A hunch needs no proof to live here. Write it as If / By / Will / Because and let research catch up with it.':
    'Przeczucie nie potrzebuje tu dowodu. Zapisz je jako Jeśli / Przez / To / Bo i pozwól badaniom je dogonić.',
  'The name is enough to start — the rest can be researched later.':
    'Na start wystarczy nazwa — resztę można doszukać później.',
  'Your project workspace': 'Twoja przestrzeń projektu',
  'A blank page, and it’s yours.': 'Czysta kartka — i jest twoja.',
  'The demo never bleeds in here. Everything below writes a real Markdown file — into your folder once one is connected, or into this browser as a draft until then.':
    'Demo nigdy się tu nie przenika. Wszystko poniżej zapisuje prawdziwy plik Markdown — do twojego folderu, gdy jakiś podłączysz, a do tego czasu jako szkic w przeglądarce.',
  'Already have files? Connect the folder — it is read right here on your computer, nothing is uploaded.':
    'Masz już pliki? Podłącz folder — czytamy go tu, na twoim komputerze, nic nie jest wysyłane.',
  'The prompt hands a stack of transcripts to your AI assistant and asks it to draft the Signals — useful when you have twenty sessions, unnecessary when you have one. Every folder also ships a _template.md: a worked example of what good looks like.':
    'Prompt oddaje stos transkrypcji twojemu asystentowi AI i prosi o szkice sygnałów — przydatne przy dwudziestu sesjach, zbędne przy jednej. W każdym folderze leży też _template.md: rozpisany przykład tego, jak to ma wyglądać.',

  /* interface settings */
  'Interface': 'Interfejs',

  /* placeholders in the manual forms — examples, so they are translated too */
  'e.g. Gives up on search after one try': 'np. Poddaje się po jednej próbie wyszukiwania',
  'What this person did or said, in your words — not your interpretation of it.':
    'Co ta osoba zrobiła albo powiedziała, twoimi słowami — nie twoja interpretacja tego.',
  '"I type it in, and… nothing. Then I give up."': '„Wpisuję to i… nic. Po chwili się poddaję.”',
  'e.g. INT-02 Jake': 'np. INT-02 Jake',
  'DD.MM.YYYY': 'DD.MM.RRRR',
  'e.g. Library & finding music': 'np. Biblioteka i szukanie muzyki',
  'e.g. search, friction': 'np. wyszukiwanie, tarcie',
  'e.g. Abandoned searches': 'np. Porzucone wyszukiwania',
  'What was measured, on whom, what number. A fact, not an opinion.':
    'Co zmierzono, na kim, jaka liczba. Fakt, nie opinia.',
  'What this means for the product': 'Co to znaczy dla produktu',
  'YYYY-MM-DD': 'RRRR-MM-DD',
  'e.g. search, pricing': 'np. wyszukiwanie, ceny',
  'e.g. Emma Carter': 'np. Emma Carter',
  'e.g. Marketing Specialist, 32, Warsaw': 'np. specjalistka ds. marketingu, 32, Warszawa',
  '"Music is the only thing I control during the day."': '„Muzyka to jedyne, co kontroluję w ciągu dnia.”',
  'Life, work, how they came to the product': 'Życie, praca, jak trafiła do produktu',
  'e.g. commuter, power-user': 'np. dojeżdżająca, power-user',
  'e.g. The Niche Curator': 'np. Kurator niszy',
  'Someone who…': 'Ktoś, kto…',
  'The tension this pattern lives with': 'Napięcie, z którym żyje ten wzorzec',
  'e.g. curation, discovery': 'np. kuratorstwo, odkrywanie',
  'e.g. INT-03': 'np. INT-03',
  'e.g. P3, 29, nurse, Kraków': 'np. P3, 29, pielęgniarka, Kraków',
  'e.g. In-depth interview, remote': 'np. Wywiad pogłębiony, zdalnie',
  '**M:** How did you start?\n**P:** …': '**M:** Jak zaczęłaś?\n**P:** …',

  /* ---- Overview / project home (13-dashboard.js) ---- */
  "What's in your graph": 'Co masz w grafie',
  'right now': 'w tej chwili',
  'Demo workspace': 'przestrzeń Demo',
  'your project workspace': 'twoja przestrzeń projektu',
  'Hey,': 'Cześć,',
  'Your research graph': 'Twój graf badań',
  'as of {d}': 'stan na {d}',
  'Three things to try in this demo': 'Trzy rzeczy do sprawdzenia w demo',
  'Hide': 'Ukryj',
  'Open {name} and point at a source': 'Otwórz personę {name} i najedź na źródło',
  'Every pain carries its level; hover a signal to see the verbatim quote behind it.': 'Każdy problem ma swój poziom; najedź na sygnał, żeby zobaczyć dosłowny cytat.',
  'Copy “Talk to {name}”': 'Skopiuj „Porozmawiaj — {name}”',
  'Paste the line into your AI agent, in this folder — the persona answers only from her data.': 'Wklej polecenie do swojego agenta AI w tym folderze — persona odpowiada tylko ze swoich danych.',
  'See what she could not answer': 'Zobacz, na co nie umiała odpowiedzieć',
  'Gaps become questions for real interviews, not invented answers.': 'Luki stają się pytaniami do prawdziwych wywiadów, a nie zmyślonymi odpowiedziami.',
  'Where your data disagrees': 'Gdzie twoje dane się nie zgadzają',
  'two sides, never an average': 'dwie strony, nigdy średnia',
  'A split is a finding, not noise: ask your AI assistant to run /contradictions on it, or take it to the next interview round.': 'Rozbieżność to wynik, nie szum: poproś asystenta AI o /contradictions albo zabierz ją do następnej rundy wywiadów.',
  'Interview guide prompt': 'Prompt: scenariusz wywiadu',
  'Copies a prompt that turns the questions on screen into a discussion guide for real interviews': 'Kopiuje prompt, który zamienia widoczne pytania w scenariusz prawdziwych wywiadów',
  'Follow .claude/skills/interview-guide/SKILL.md.': 'Wykonaj .claude/skills/interview-guide/SKILL.md.',
  'Build the discussion guide for our next real interviews from these open questions in Research backlog.md, most urgent first:': 'Zbuduj scenariusz naszych następnych prawdziwych wywiadów z tych otwartych pytań z Research backlog.md, od najpilniejszych:',
  'Save as PDF': 'Zapisz jako PDF',
  'Opens the print dialog — pick “Save as PDF” for a one-pager you can share': 'Otwiera okno drukowania — wybierz „Zapisz jako PDF”, żeby mieć jednostronicowy plik do udostępnienia',
  'The research map: personas, signals, evidence and hypotheses joined by their links': 'Mapa badań: persony, sygnały, dowody i hipotezy połączone linkami',
  'Checked': 'Sprawdzono',
  'Assumption': 'Założenie', 'Desk research': 'Desk research', 'Interviews': 'Wywiady', 'Correlated': 'Skorelowane', 'Ready for decisions': 'Gotowe do decyzji',
  'No data behind it yet — the persona says “I don’t know”.': 'Brak danych — persona mówi „nie wiem”.',
  'Backed by desk research only — not confirmed in interviews.': 'Tylko desk research — niepotwierdzone w wywiadach.',
  'Heard in our own interviews — treat a single source with care.': 'Usłyszane w naszych wywiadach — pojedyncze źródło traktuj ostrożnie.',
  'Heard in interviews and backed by desk research.': 'Usłyszane w wywiadach i potwierdzone desk researchem.',
  'Interviews, desk research and correlations — may carry product recommendations.': 'Wywiady, desk research i korelacje — może nieść rekomendacje produktowe.',
  'Talk to {name}': 'Porozmawiaj — {name}',
  'Copy the line for…': 'Skopiuj polecenie dla…',
  'Copies the line that starts the conversation — paste it into {a}, opened in this project folder':
    'Kopiuje polecenie, które zaczyna rozmowę — wklej je w {a}, otwartym w folderze tego projektu',
  'Copied “{t}” — paste it into {a}, opened in this project folder': 'Skopiowano „{t}” — wklej w {a}, otwartym w folderze tego projektu',
  'Use the persona-talk skill: let me talk to the persona in {f}.': 'Użyj skilla persona-talk: chcę porozmawiać z personą z pliku {f}.',
  'Read AGENTS.md and CLAUDE.md, then follow .claude/skills/persona-talk/SKILL.md to let me talk to the persona in {f}.':
    'Przeczytaj AGENTS.md i CLAUDE.md, potem wykonaj .claude/skills/persona-talk/SKILL.md, żebym mógł porozmawiać z personą z pliku {f}.',
  'All current': 'Wszystko aktualne',
  'Research timeline': 'Oś badań',
  'Trend charts appear once your research spans two months.': 'Wykresy trendu pojawią się, gdy badania obejmą co najmniej dwa miesiące.',
  'Menu: language, export, exit': 'Menu: język, eksport, wyjście',
  'not researched': 'niezbadane',
  'Character colour for warm-up questions — not a research finding': 'Koloryt postaci do pytań na rozgrzewkę — nie wynik badań',
  'no participants yet': 'jeszcze bez uczestników',
  '+{n} excluded': '+{n} wyłączony z analizy',
  'Excluded transcripts stay on disk but count toward nothing until you turn them back on':
    'Wyłączone transkrypcje zostają na dysku, ale nie liczą się do niczego, dopóki ich nie włączysz',
  'Example project · Spotify listeners': 'Przykładowy projekt · słuchacze Spotify',
  'All entities · this workspace': 'Wszystkie elementy · ta przestrzeń',
  'Plan next round': 'Zaplanuj następną rundę',
  'Transcript freshness': 'Świeżość transkrypcji',
  'fresh': 'świeże',
  'stale': 'przeterminowane',
  'none yet': 'jeszcze nic',
  'all switched off': 'wszystkie wyłączone',
  'Grounding': 'Ugruntowanie',
  'sources behind your personas': 'źródeł stojących za twoimi personami',
  'our own observations': 'nasze własne obserwacje',
  'desk research': 'desk research',

  'tracked': 'obserwowani',
  'Participants': 'Uczestnicy',
  'Transcripts over time': 'Transkrypcje w czasie',
  'cumulative, by month': 'narastająco, miesiącami',
  'total': 'łącznie',
  'Health check': 'Stan zdrowia',
  /* what the graph stands on — the signals/evidence bar */
  'What the graph stands on': 'Na czym stoi graf',
  'firsthand': 'z pierwszej ręki',
  'heard by you': 'usłyszane przez ciebie',
  'read by you': 'przeczytane przez ciebie',
  'A session you ran becomes a Signal; anything you read — a report, an analytics number, a public thread — is Evidence. Filing desk research as a signal is the one shortcut that quietly inflates how grounded you look.':
    'Sesja, którą sam poprowadziłeś, staje się sygnałem; wszystko, co przeczytałeś — raport, liczba z analityki, publiczny wątek — jest dowodem. Zapisanie desk researchu jako sygnału to ta jedna droga na skróty, która po cichu zawyża twoje ugruntowanie.',
  'Nothing to weigh yet': 'Nie ma jeszcze czego ważyć',
  'No signals, no evidence. Both start the same way: a real session (→ Signals) or a piece of desk research (→ Evidence).':
    'Ani sygnałów, ani dowodów. Jedno i drugie zaczyna się tak samo: prawdziwą sesją (→ Sygnały) albo kawałkiem desk researchu (→ Dowody).',
  'Desk research is carrying this graph': 'Ten graf niesie desk research',
  'Most of what your personas say rests on other people’s data. That is a fine start and a poor foundation — nobody has verified any of it with your users. Run a round of your own sessions before the next product decision.':
    'Większość tego, co mówią twoje persony, stoi na cudzych danych. To dobry początek i kiepski fundament — nikt tego nie zweryfikował z twoimi użytkownikami. Przeprowadź rundę własnych sesji przed następną decyzją produktową.',
  'Almost everything is firsthand': 'Prawie wszystko jest z pierwszej ręki',
  'Strong grounding — every claim traces to someone you actually spoke to. A little desk research would now tell you whether what you heard is typical or particular to your sample.':
    'Mocne ugruntowanie — każde twierdzenie prowadzi do kogoś, z kim naprawdę rozmawiałeś. Odrobina desk researchu powiedziałaby teraz, czy to, co usłyszałeś, jest typowe, czy właściwe tylko twojej próbie.',
  'Your own sessions are leading': 'Prowadzą twoje własne sesje',
  'The healthy shape: what you heard yourself carries the graph, and desk research backs it up instead of standing in for it.':
    'Zdrowy kształt: to, co usłyszałeś sam, niesie graf, a desk research to podpiera, zamiast go zastępować.',
  /* per-persona grounding */
  'What each persona stands on': 'Na czym stoi każda persona',
  'signals + evidence': 'sygnały + dowody',
  'Ember = Signals, what you heard in your own sessions. Grey = Evidence, what you read. A persona is only as good as the row behind her: the short ones answer “I don’t know” most often in a conversation.':
    'Pomarańczowy = sygnały, czyli to, co usłyszałeś na własnych sesjach. Szary = dowody, czyli to, co przeczytałeś. Persona jest warta tyle, ile jej pasek: te krótkie najczęściej odpowiadają w rozmowie „nie wiem”.',
  'Ember = Signals you heard yourself · grey = Evidence you read. The shortest row is the persona most likely to answer “I don’t know”.':
    'Pomarańczowy = sygnały usłyszane przez ciebie · szary = przeczytane dowody. Najkrótszy pasek to persona, która najczęściej odpowie „nie wiem”.',
  'No personas yet — nothing to weigh.': 'Nie ma jeszcze żadnej persony — nie ma czego ważyć.',
  'Open the Personas tab and use “New persona”, or run /persona-workshop with your AI.':
    'Wejdź w zakładkę Persony i użyj „Nowa persona”, albo uruchom /persona-workshop ze swoim AI.',
  /* coverage — the qualitative discovery curve */
  'Coverage': 'Pokrycie',
  'Estimated from the discovery curve behind the “five users” rule — Nielsen & Landauer (1993), replicated by Faulkner (2003): 1−(1−0.31)ⁿ, the share of recurring patterns n sessions in ONE segment are expected to surface. It answers “have we heard enough people?” and says nothing about how many users have a problem — that is a survey question, and a survey answer is Evidence.':
    'Szacunek z krzywej odkrywania, która stoi za regułą „pięciu użytkowników” — Nielsen i Landauer (1993), powtórzone przez Faulkner (2003): 1−(1−0,31)ⁿ, czyli udział powtarzalnych wzorców, jaki n sesji w JEDNYM segmencie powinno wydobyć. Odpowiada na pytanie „czy usłyszeliśmy dość osób?” i milczy o tym, ilu użytkowników ma dany problem — to pytanie ankietowe, a odpowiedź z ankiety jest dowodem.',
  'No personas yet': 'Nie ma jeszcze person',
  'Nothing to cover yet — a persona is what turns sessions into someone you can talk to.':
    'Nie ma jeszcze czego pokrywać — to persona zamienia sesje w kogoś, z kim można porozmawiać.',
  'A persona with nobody behind it': 'Persona, za którą nie stoi nikt',
  'Nothing links <b>{who}</b> to a single session — an assumption wearing a face. Wire those Signals to their transcripts, or run the round that gives them some.':
    'Nic nie łączy <b>{who}</b> z żadną sesją — to założenie z doklejoną twarzą. Podepnij jej sygnały do transkrypcji albo przeprowadź rundę, która je da.',
  'Below the qualitative floor': 'Poniżej progu badania jakościowego',
  'Thinnest: <b>{who}</b>, standing on {n} → around {p}% of what repeats in that segment would have surfaced. Five people per segment is the usual floor, where the curve reaches ~84%.':
    'Najcieniej: <b>{who}</b>, stoi na {n} → wyszłoby stąd około {p}% tego, co w tym segmencie się powtarza. Zwykły próg to pięć osób na segment — tam krzywa dochodzi do ~84%.',
  'Nearly at the floor': 'Prawie na progu',
  'Thinnest: <b>{who}</b>, standing on {n} → about {p}% of the recurring patterns there. One or two more sessions and you are at the ~84% that five buys you.':
    'Najcieniej: <b>{who}</b>, stoi na {n} → około {p}% powtarzalnych wzorców w tym segmencie. Jeszcze jedna–dwie sesje i jesteś przy ~84%, które daje pięć osób.',
  'At the qualitative threshold': 'Na progu badania jakościowego',
  'Every persona rests on at least {n} (thinnest: <b>{who}</b>) → ~{p}% of what recurs in a segment. This tells you WHAT people struggle with and WHY — never how many of them do; that needs a sized survey or analytics, and lands as Evidence.':
    'Każda persona stoi na co najmniej {n} (najcieniej: <b>{who}</b>) → ~{p}% tego, co się w segmencie powtarza. To mówi, Z CZYM ludzie się męczą i DLACZEGO — nigdy ilu ich jest; do tego trzeba ankiety o policzonej próbie albo analityki, a wynik ląduje jako dowód.',
  'Saturated': 'Nasycone',
  'Even the thinnest (<b>{who}</b>) has {n} behind it → ~{p}%. New sessions there rarely turn up a new pattern; the open question is how widespread each one is — a survey, not another interview.':
    'Nawet najcieńsza (<b>{who}</b>) stoi na {n} → ~{p}%. Nowe sesje rzadko przynoszą tam nowy wzorzec; otwarte pytanie brzmi teraz, jak powszechny jest każdy z nich — to ankieta, nie kolejny wywiad.',
  /* freshness */
  'Freshness': 'Świeżość',
  'No interviews on file': 'Brak wywiadów w plikach',
  'Everything is out of date': 'Wszystko jest nieaktualne',
  'More than half has aged out': 'Ponad połowa się zestarzała',
  'Mostly current': 'W większości aktualne',
  'Nothing to age yet — the freshness clock starts with your first transcript.':
    'Nie ma jeszcze czemu się starzeć — zegar świeżości rusza z pierwszą transkrypcją.',
  '{a} of {b} transcripts are younger than 3 months. Older sessions are not wrong, they are just no longer evidence about today — flag them for a refresh before the next decision leans on them.':
    '{a} z {b} transkrypcji jest młodszych niż 3 miesiące. Starsze sesje nie są błędne — po prostu nie są już świadectwem o dzisiaj; oznacz je do odświeżenia, zanim oprze się na nich kolejna decyzja.',
  'Three months is the repo’s freshness line: past it, a Signal gets flagged for a re-check rather than quietly passed off as current.':
    'Trzy miesiące to granica świeżości w tym repozytorium: po niej sygnał dostaje flagę do ponownego sprawdzenia, zamiast po cichu uchodzić za aktualny.',
  'Research cadence': 'Rytm badań',
  'interviews per month': 'wywiadów miesięcznie',
  'Refresh cadence': 'Rytm odświeżania',
  'vs the 3-month line': 'wobec granicy 3 miesięcy',
  'since the last interview': 'od ostatniego wywiadu',
  'd': 'dni',
  '3-month line': 'granica 3 miesięcy',
  'No dated interviews yet — nothing to chart.': 'Brak wywiadów z datą — nie ma czego rysować.',
  'No dated interviews to measure cadence.': 'Brak wywiadów z datą — nie ma jak zmierzyć rytmu.',
  /* every empty state on this page ends with the one move that gets you out of it */
  'Put your first transcript in the Inbox/ folder, then run /extract-findings with your AI.':
    'Wrzuć pierwszą transkrypcję do folderu Inbox/, potem uruchom /extract-findings ze swoim AI.',
  'Every transcript is switched off': 'Każda transkrypcja jest wyłączona',
  'Nothing counts toward freshness, sample stats or heard-from — that is why the numbers above read zero. Open a transcript and turn on “Use in analysis” to bring it back, or run a new round if these were meant to stay out.':
    'Nic nie liczy się do świeżości, statystyki próby ani do „usłyszanych” — dlatego liczby wyżej pokazują zero. Otwórz transkrypcję i włącz „Używaj w analizie”, żeby ją przywrócić, albo przeprowadź nową rundę, jeśli te miały zostać poza analizą.',
  '⧉ Copy AI prompt': '⧉ Kopiuj prompt do AI',
  '↓ Prompt .md': '↓ Prompt .md',
  '↓ Agency brief .md': '↓ Brief dla agencji .md',
  '⧉ Copy command': '⧉ Kopiuj komendę',
  'No interviews in the system yet': 'W systemie nie ma jeszcze żadnych wywiadów',
  'Your personas have nothing to stand on. Run a first round — grab the prompt and let the AI turn your backlog into a plan (or a brief for an agency).':
    'Twoje persony nie mają na czym stać. Przeprowadź pierwszą rundę — weź prompt i pozwól AI zamienić backlog w plan (albo w brief dla agencji).',
  'Every transcript is older than 3 months': 'Każda transkrypcja jest starsza niż 3 miesiące',
  "Your personas are answering from history, not from today's users. Before the next product decision, run a refresh round — the prompt turns your backlog and open hypotheses into a plan, or an agency brief if the backlog is empty.":
    'Twoje persony odpowiadają z historii, nie z dzisiejszych użytkowników. Przed następną decyzją produktową przeprowadź rundę odświeżającą — prompt zamieni backlog i otwarte hipotezy w plan, a przy pustym backlogu w brief dla agencji.',
  '{a} of {b} transcripts are fresh': '{a} z {b} transkrypcji jest świeżych',
  "Grab a head start on the next round whenever you're ready — the prompt hands the AI your current state, backlog and open hypotheses to plan from.":
    'Kiedy będziesz gotowy, zacznij następną rundę z rozbiegu — prompt podaje AI twój obecny stan, backlog i otwarte hipotezy jako podstawę planu.',
  'Startup with no research data yet?': 'Startup bez żadnych danych badawczych?',
  'Run the founding-brief protocol: the AI interviews you about the product, value proposition and target group — recording your beliefs about users as testable assumptions, never as findings — and plans the first research round. Paste the command into your AI assistant as your first message.':
    'Uruchom protokół briefu założycielskiego: AI przepytuje cię o produkt, propozycję wartości i grupę docelową — zapisując twoje przekonania o użytkownikach jako testowalne założenia, nigdy jako wyniki — i planuje pierwszą rundę badań. Wklej komendę asystentowi AI jako pierwszą wiadomość.',
  'Desk research is drifting:': 'Desk research się rozjeżdża:',
  'Enrich your data with the latest from the internet': 'Wzbogać dane o najnowsze rzeczy z internetu',
  'This prompt sends the AI on a desk-research refresh: re-verify stale Evidence at its sources, research flagged competitors, close Comparison gaps. Web finds land as cited Evidence — never as Signals — and nothing is written without your approval.':
    'Ten prompt wysyła AI na odświeżenie desk researchu: ponowna weryfikacja przeterminowanych dowodów u źródeł, zbadanie oznaczonych konkurentów, uzupełnienie luk w porównaniu. Znaleziska z sieci lądują jako cytowane dowody — nigdy jako sygnały — i nic nie zostaje zapisane bez twojej zgody.',
  /* ---- account nav (top right, shell.html + 15-topnav.js) ---- */
  'Account menu': 'Menu konta',
  'Anonymous': 'Anonim',
  'Language': 'Język',
  /* ---- settings: the population readout ---- */
  'participants for ±5 pp': 'uczestników dla ±5 pp',
  'You': 'Ty',
  'Stored in <code>.claude/preferences.local.md</code> — local and gitignored. Whichever AI assistant you work with reads this file to personalize research sessions.':
    'Zapisane w <code>.claude/preferences.local.md</code> — lokalnie i poza gitem. Ten plik czyta asystent AI, z którym pracujesz — którykolwiek to jest — żeby spersonalizować sesje badawcze.',
  'Used by the researcher notes in persona conversations, and by the account button in the top bar.':
    'Używane w notatkach badacza w rozmowach z personami i w przycisku konta na górnym pasku.',
  'Copied to clipboard ✓': 'Skopiowano do schowka ✓',
  'Clipboard blocked — downloaded the prompt instead': 'Schowek zablokowany — prompt został pobrany jako plik',
  'Downloaded the prompt (clipboard unavailable)': 'Prompt pobrany jako plik (schowek niedostępny)',
  'Prompt copied — paste it into your AI assistant ✓': 'Prompt skopiowany — wklej go swojemu asystentowi AI ✓',
  'Command copied — paste it as your first message ✓': 'Komenda skopiowana — wklej ją jako pierwszą wiadomość ✓',

  /* ---- Mind Map (11-mindmap.js) ---- */
  'Nothing to map in this workspace yet.': 'Nie ma tu jeszcze czego mapować.',
  'The map draws itself from the links your files already have — bring research in and it appears here.':
    'Mapa rysuje się sama z linków, które już są w twoich plikach — wnieś badania, a pojawi się tutaj.',
  'Every connection your files already have — signals to evidence, ideas to their grounding, hypotheses to the ideas they became. A map to read, not an editor: change links in the files and the map follows.':
    'Każde połączenie, które już jest w twoich plikach — sygnały do dowodów, pomysły do ich ugruntowania, hipotezy do pomysłów, którymi się stały. Mapa do czytania, nie edytor: zmień linki w plikach, a mapa pójdzie za nimi.',
  'Persona: all': 'Persona: wszystkie',
  'Persona:': 'Persona:',
  'Data: all time': 'Dane: cały czas',
  'Data: last 3 months': 'Dane: ostatnie 3 miesiące',
  'Data: last 6 months': 'Dane: ostatnie 6 miesięcy',
  'Data: last 12 months': 'Dane: ostatnie 12 miesięcy',
  "Show only this persona's graph — her signals, evidence, ideas and the sessions behind them (2 hops). Clicking nodes still never hides anything.":
    'Pokaż tylko graf tej persony — jej sygnały, dowody, pomysły i sesje, które za nimi stoją (2 kroki). Klikanie węzłów nadal niczego nie ukrywa.',
  "Freshness window for dated raw data (Transcript date:, Evidence retrieved:). Predefined periods only — GDPR art. 5(1)(e) storage limitation: don't lean on research data indefinitely; the repo flags anything older than 3 months for a refresh round. Undated files stay visible.":
    'Okno świeżości dla datowanych danych źródłowych (date: w transkrypcji, retrieved: w dowodzie). Tylko predefiniowane okresy — RODO art. 5(1)(e), ograniczenie przechowywania: nie opieraj się na danych badawczych bez końca; repo oznacza wszystko starsze niż 3 miesiące do odświeżenia. Pliki bez daty zostają widoczne.',
  'Focused on': 'Skupienie na',
  'depth': 'głębokość',
  'show the whole graph': 'pokaż cały graf',
  'Map': 'Mapa',
  'Flow': 'Przepływ',
  // Overview + rail, Editorial (2026-10)
  'Link removed from the signal’s text': 'Link usunięty z treści sygnału',
  'Nothing to connect in this section yet.': 'W tej sekcji nie ma jeszcze czego łączyć.',
  'Connected ✓ — written into the signal file': 'Połączone ✓ — zapisane w pliku sygnału',
  'Backed by evidence': 'Poparte dowodami',
  'Stands on': 'Opiera się na',
  'linked in the signal’s text': 'link w treści sygnału',
  'Click to remove this connection': 'Kliknij, żeby usunąć to połączenie',
  'Drag onto a card to connect': 'Przeciągnij na kartę, żeby połączyć',
  'Connect to pains': 'Połącz z bólami',
  'same signal': 'ten sam sygnał',
  'Connected ✓ — written into the file': 'Połączone ✓ — zapisane w pliku',
  'Connection removed': 'Połączenie usunięte',
  'Correlation name': 'Nazwa korelacji',
  '"Verbatim quote" — source': '"Dosłowny cytat" — źródło',
  'New entry, in your own words…': 'Nowy wpis, twoimi słowami…',
  'Enter — save · Shift+Enter — new line · Esc — cancel': 'Enter — zapisz · Shift+Enter — nowa linia · Esc — anuluj',
  'Name required.': 'Nazwa jest wymagana.',
  'Remove from this persona': 'Usuń z tej persony',
  'Delete': 'Usuń',
  'Type {w} to confirm': 'Wpisz {w}, żeby potwierdzić',
  'Saved under “## {sec}” in {file}.': 'Zapis pod „## {sec}” w {file}.',
  'Add evidence': 'Dodaj dowód',
  'Add signal': 'Dodaj sygnał',
  'Add correlation': 'Dodaj korelację',
  'Add to persona': 'Dodaj do persony',
  'Evidence file': 'Plik dowodu',
  'Signal file': 'Plik sygnału',
  'Every Evidence file in this project is already on this persona — create a new one first.': 'Każdy plik dowodu z tego projektu jest już przy tej personie — najpierw utwórz nowy.',
  'Every Signal file in this project is already on this persona — extract new findings first.': 'Każdy plik sygnału z tego projektu jest już przy tej personie — najpierw wyciągnij nowe obserwacje.',
  'What it confirms about this persona': 'Co potwierdza w tej personie',
  'Say what it confirms.': 'Napisz, co potwierdza.',
  'The pain it shows, in your words': 'Ból, który pokazuje — twoimi słowami',
  'A persona takes a signal in through a pain that links it.': 'Persona przyjmuje sygnał przez ból, który do niego linkuje.',
  'Describe the pain.': 'Opisz ból.',
  'What emerges when you put them together': 'Co wyłania się, gdy je zestawić',
  'Opportunity (optional)': 'Szansa (opcjonalnie)',
  'Add a signal or evidence first — a correlation stands on them.': 'Najpierw dodaj sygnał lub dowód — korelacja na nich stoi.',
  'This persona already has a correlation with that name.': 'Ta persona ma już korelację o tej nazwie.',
  'Tick at least one signal or evidence it stands on.': 'Zaznacz co najmniej jeden sygnał lub dowód, na którym stoi.',
  'Evidence added ✓': 'Dowód dodany ✓',
  'Signal added ✓': 'Sygnał dodany ✓',
  'Correlation added ✓': 'Korelacja dodana ✓',
  'Undo stays available right after.': 'Zaraz potem możesz cofnąć.',
  'Remove evidence from persona': 'Usuń dowód z persony',
  'This line is deleted from “## Evidences” in {file}:': 'Ta linia zostanie usunięta z „## Evidences” w {file}:',
  'The Evidence file itself stays.': 'Sam plik dowodu zostaje.',
  'Evidence removed': 'Dowód usunięty',
  'Detach signal from persona': 'Odłącz sygnał od persony',
  'Every link to “{t}” leaves {file} ({n}) — in pains, quotes, correlations. A pain or quote that only named this signal loses its source; words inside sentences stay.': 'Każdy link do „{t}” znika z {file} ({n}) — w bólach, cytatach, korelacjach. Ból lub cytat, który wskazywał tylko ten sygnał, traci źródło; słowa w zdaniach zostają.',
  'The Signal file stays — it is interview data.': 'Plik sygnału zostaje — to dane z wywiadu.',
  'Signal detached': 'Sygnał odłączony',
  'Delete correlation': 'Usuń korelację',
  'The whole “{t}” block is deleted from “## Correlations” in {file}.': 'Cały blok „{t}” zostanie usunięty z „## Correlations” w {file}.',
  'The signals and evidence it stood on stay.': 'Sygnały i dowody, na których stała, zostają.',
  'Correlation deleted': 'Korelacja usunięta',
  'Eased by:': 'Łagodzi to:',
  '+{n} set aside': '+{n} odłożona',
  'Based on': 'Na podstawie',
  'Built from': 'Zbudowana z',
  'Confidence': 'Pewność',
  'Distinct people behind this persona, counted through the signals the persona links to. A session the researcher set aside counts nowhere.': 'Różne osoby stojące za tą personą, liczone przez sygnały, do których prowadzi. Sesja odłożona przez badacza nie liczy się nigdzie.',
  'Every file this page is built from.': 'Każdy plik, z którego zbudowana jest ta strona.',
  'Everything behind {name}': 'Wszystko, co stoi za: {name}',
  'Evidence:': 'Dowód:',
  'Frustration it solves': 'Frustracja, którą rozwiązuje',
  'Frustration, in their words': 'Frustracja, ich słowami',
  'Heard': 'Usłyszane',
  'How confident can we be in this idea?': 'Jak pewny jest ten pomysł?',
  'How solid': 'Jak solidna',
  'How solid is a persona?': 'Jak solidna jest persona?',
  'Idea': 'Pomysł',
  'Idea for it': 'Pomysł na to',
  'In one line': 'W jednym zdaniu',
  'Moment': 'Moment',
  'No idea yet': 'Brak pomysłu',
  'No source yet': 'Brak źródła',
  'None of the listed ones': 'Żadną z wymienionych',
  'Paste into your AI assistant, opened in this project folder': 'Wklej do asystenta AI otwartego w folderze projektu',
  'Poster': 'Plakat',
  'Product ideas for {name}': 'Pomysły produktowe: {name}',
  'Read': 'Przeczytane',
  'Signal:': 'Sygnał:',
  'Typical behavior': 'Typowe zachowania',
  'Votes': 'Głosy',
  'What they do or expect': 'Co robi lub czego oczekuje',
  'Where it comes from': 'Skąd to wiemy',
  'Worked out from what the idea links to, not from votes: interviews and research together = strong, interviews only = medium, research only = weak.': 'Liczona z tego, do czego prowadzi pomysł, a nie z głosów: wywiady i badania razem = silna, same wywiady = średnia, same badania = słaba.',
  'set aside': 'odłożony',
  '{name}’s frustrations': 'Frustracje: {name}',
  '{n} of 5': '{n} z 5',
  'Against': 'Przeciw',
  'For': 'Za',
  'All personas': 'Wszystkie persony',
  'All {n}': 'Wszystkie {n}',
  'Ask': 'Zapytaj',
  'Ask a persona': 'Zapytaj personę',
  'Asked in conversations, answered with “I don’t know”. Each one waits for a real interview.': 'Padły w rozmowach, odpowiedź brzmiała „nie wiem”. Każde czeka na prawdziwy wywiad.',
  'Circle = interview, square = usability test, dashed = set aside by the researcher. Trend charts would need research that spans two months or more.': 'Kółko = wywiad, kwadrat = test użyteczności, przerywane = odłożone przez badacza. Wykresy trendu wymagają badań z co najmniej dwóch miesięcy.',
  'Every persona stands on a single person.': 'Każda persona opiera się na jednej osobie.',
  'Example data': 'Dane przykładowe',
  'Example project': 'Projekt przykładowy',
  'Firsthand': 'Z pierwszej ręki',
  'Four readings': 'Cztery odczyty',
  'Fresh': 'Świeże',
  'Have we heard enough people?': 'Czy wysłuchaliśmy dość osób?',
  'Heard {h} · Read {r}': 'Usłyszane {h} · Przeczytane {r}',
  'How solid: {l} of 5 · stands on {s} heard + {e} read': 'Jak solidna: {l} z 5 · opiera się na {s} usłyszanych + {e} przeczytanych',
  'Illustrative research on Spotify listeners, not your users. The numbers are read as of the day its research closed, and it never mixes with your own projects.': 'Poglądowe badania słuchaczy Spotify, nie Twoich użytkowników. Liczby są odczytane na dzień zamknięcia badań, a projekt nigdy nie miesza się z Twoimi.',
  'Interviews and tests': 'Wywiady i testy',
  'Last interview': 'Ostatni wywiad',
  'More': 'Więcej',
  'Next round': 'Następna runda',
  'No dated interviews yet': 'Brak datowanych wywiadów',
  'No research data yet — start with the founding brief.': 'Brak danych z badań — zacznij od briefu założycielskiego.',
  'None of them claims more precision than a handful of interviews can carry. Hover each ⓘ for what it means.': 'Żaden nie udaje większej precyzji, niż udźwignie garść wywiadów. Najedź na ⓘ, żeby zobaczyć, co znaczy.',
  'On the same feature, some participants stand against it and some for it. A split is a finding, not noise — take it to the next round, or ask your AI assistant to run /contradictions on it.': 'Przy tej samej funkcji część uczestników jest przeciw, a część za. Rozbieżność to wynik, nie szum — weź ją do następnej rundy albo poproś asystenta AI o /contradictions.',
  'One mark per session': 'Jeden znacznik na sesję',
  'Plan the next round': 'Zaplanuj następną rundę',
  'Research health': 'Kondycja badań',
  'Search': 'Szukaj',
  'Search this workspace': 'Szukaj w tej przestrzeni',
  'See all': 'Zobacz wszystkie',
  'Sessions': 'Sesje',
  'Solid = heard in your own sessions (signals). Striped = read in published research or data (evidence).': 'Pełne = usłyszane w Twoich sesjach (sygnały). W paski = przeczytane w publikacjach lub danych (dowody).',
  'Spotify listeners': 'Słuchacze Spotify',
  'The tick is the 3-month line. Past it, findings get flagged for a refresh round.': 'Kreska to granica 3 miesięcy. Po niej wyniki trafiają do rundy odświeżającej.',
  'Things a persona answered with “I don’t know”. They go to real interviews, never to the AI.': 'Rzeczy, na które persona odpowiedziała „nie wiem”. Trafiają do prawdziwych wywiadów, nigdy do AI.',
  'This is the example project': 'To jest projekt przykładowy',
  'Transcripts younger than 3 months. Past that line, findings get flagged for a re-check before a decision leans on them.': 'Transkrypcje młodsze niż 3 miesiące. Po tej granicy wyniki są oznaczane do ponownego sprawdzenia, zanim oprze się na nich decyzja.',
  'Two sides, never an average': 'Dwie strony, nigdy średnia',
  'What no persona can answer yet': 'Na co żadna persona jeszcze nie odpowie',
  'Where data disagrees': 'Gdzie dane się różnią',
  'Your project': 'Twój projekt',
  'current': 'aktualne',
  'days ago': 'dni temu',
  'everyone': 'wszyscy',
  'five people per segment ≈ 84%': 'pięć osób na segment ≈ 84%',
  'of patterns': 'wzorców',
  'of sources': 'źródeł',
  '⧉ Desk-research refresh prompt': '⧉ Prompt odświeżenia desk research',
  'Columns': 'Kolumny',
  'Free': 'Swobodny',
  'Map view': 'Widok mapy',
  'All links': 'Wszystkie połączenia',
  'Draw every link, not just the selected file’s': 'Rysuj wszystkie połączenia, nie tylko zaznaczonego pliku',
  'Graph diagram: {n} entities laid out freely by how they link, joined by {l} links. Every entity and every link here is also reachable as text — use the type tabs and the table view.':
    'Diagram grafu: {n} elementów ułożonych swobodnie według połączeń, połączonych {l} liniami. Każdy element i każde połączenie są też dostępne jako tekst — w zakładkach typów i widoku tabeli.',
  'click for details, double-click to open, drag / wheel to move around':
    'kliknij po szczegóły, kliknij dwa razy, żeby otworzyć, przeciągaj / kółkiem przesuwaj',
  'thicker band = more research flowing through': 'grubsza wstęga = więcej badań przez nią płynie',
  'no cross-type links to draw yet — the Columns and Free views show everything':
    'nie ma jeszcze połączeń między typami — widoki Kolumny i Swobodny pokazują wszystko',
  'Close details': 'Zamknij szczegóły',
  'excluded from analysis': 'wyłączone z analizy',
  'Open file →': 'Otwórz plik →',
  'Focus map here': 'Skup mapę tutaj',
  'evidence': 'dowodów',
  'grounded': 'ugruntowanych',
  'extracted': 'wyciągniętych',
  'of': 'z',
  'heard from': 'usłyszanych',
  'evidence — by definition': 'dowodów — z definicji',
  'Distinct participants this observation was heard from — excluded sessions don’t count':
    'Ile różnych osób powiedziało to samo — wyłączone sesje się nie liczą',
  'Desk-research files this signal links to': 'Pliki desk researchu, do których ten sygnał linkuje',
  'Interview observations that cite this evidence': 'Obserwacje z wywiadów, które cytują ten dowód',
  'Signals linked from Pains and Quotes': 'Sygnały podlinkowane z Bólów i Cytatów',
  'Distinct research participants behind this persona': 'Ile różnych osób stoi za tą personą',
  'The face(s) this pattern wears': 'Twarze, które przybiera ten wzorzec',
  'Observations pulled out of this session by /extract-findings':
    'Obserwacje wyciągnięte z tej sesji przez /extract-findings',
  'Distinct participants who brought this competitor up': 'Ile różnych osób samo wspomniało o tym konkurencie',
  'A hypothesis is a bet with zero grounding; the day it earns a Signal or Evidence, promote it to an Idea':
    'Hipoteza to zakład bez żadnego ugruntowania; w dniu, w którym zarobi na sygnał albo dowód, awansuj ją na pomysł',

  /* ---- Research backlog page (12b-backlog.js) ---- */
  'The only thing a persona conversation may leave behind: questions for real people. Sharpen them here, then take them to an interview.':
    'Jedyne, co rozmowa z personą może po sobie zostawić: pytania do prawdziwych ludzi. Naostrz je tutaj i zabierz na wywiad.',
  'New question': 'Nowe pytanie',
  'Filter questions…': 'Filtruj pytania…',
  'Filter backlog questions': 'Filtruj pytania z backlogu',

  'Everything': 'Wszystko',
  '◐ Qualitative': '◐ Jakościowe',
  '▦ Quantitative': '▦ Ilościowe',
  '◑ Mixed': '◑ Mieszane',

  'Open questions': 'Pytania otwarte',

  'Closed / turned into research': 'Zamknięte / zamienione w badanie',

  'Nothing open. After the next persona conversation there will be.': 'Nic otwartego. Po następnej rozmowie z personą coś tu będzie.',
  'Nothing closed yet — questions land here once real research answered them.':
    'Nic jeszcze nie zamknięte — pytania trafiają tutaj, kiedy odpowie na nie prawdziwe badanie.',

  'Research answered it — move it down with a note on what answered it':
    'Badanie na to odpowiedziało — przesuń w dół z notatką, co odpowiedziało',

  'Reopen': 'Otwórz ponownie',

  'Delete the row entirely': 'Usuń wiersz całkowicie',
  'Edit': 'Edytuj',
  'Save': 'Zapisz',
  'Close question': 'Zamknij pytanie',
  'What do we need to hear from a real user?': 'Co musimy usłyszeć od prawdziwego użytkownika?',
  '— let the wording suggest it —': '— niech podpowie brzmienie pytania —',

  'What answered it?': 'Co na nie odpowiedziało?',
  'e.g. Signal “Emma builds her own playlists” (interview 2026-07-18)':
    'np. Sygnał „Emma sama buduje playlisty” (wywiad 2026-07-18)',
  'Date': 'Data', 'Persona': 'Persona', 'Question': 'Pytanie', 'Source / level': 'Źródło / poziom',
  'Status': 'Status', 'Kind': 'Rodzaj', 'Priority': 'Priorytet',
  /* priority — the three levels, the three provenances, and the reasons a
     suggestion gives for itself */
  'Critical': 'Krytyczne', 'Major': 'Poważne', 'Minor': 'Drobne',
  'Blocks a decision someone is making now. Until this is answered, the choice it feeds is a coin toss with a slide deck.':
    'Blokuje decyzję, którą ktoś właśnie podejmuje. Dopóki nie ma odpowiedzi, ta decyzja to rzut monetą z prezentacją.',
  'Shapes the work without blocking it. Getting it wrong costs a rework, not a wrong bet — worth a slot in the next round.':
    'Kształtuje pracę, ale jej nie blokuje. Pomyłka kosztuje przeróbkę, nie zły zakład — warte miejsca w następnej rundzie.',
  'Good to know. Ask it while you have someone in the room anyway; never book a round for it on its own.':
    'Dobrze wiedzieć. Zapytaj przy okazji, kiedy i tak masz kogoś na sesji; nigdy nie umawiaj rundy tylko po to.',
  'Suggested from the wording — nothing is written to the file until you decide.':
    'Zasugerowane z brzmienia — nic nie trafia do pliku, dopóki nie zdecydujesz.',
  'Set by an AI run when the question was filed. Another run may revise it.':
    'Ustawione przez AI, kiedy pytanie trafiało do pliku. Kolejne uruchomienie może to zmienić.',
  'Your call — written as <code>(locked)</code>, so no AI run will change it again.':
    'Twoja decyzja — zapisana jako <code>(locked)</code>, więc żadne uruchomienie AI już tego nie zmieni.',
  'Its source column says <b>warm-up</b> — context you collect on the way to the real question, not a reason to run a round.':
    'W kolumnie źródła stoi <b>warm-up</b> — kontekst zbierany po drodze do właściwego pytania, a nie powód, żeby uruchamiać rundę.',
  'It is about what people will pay (<b>{x}</b>) — that number sets pricing, and pricing is hard to walk back.':
    'Dotyczy tego, ile ludzie zapłacą (<b>{x}</b>) — ta liczba ustawia cennik, a z cennika trudno się wycofać.',
  'It asks whether something would actually change behaviour (<b>{x}</b>) — a build decision hangs on it.':
    'Pyta, czy coś faktycznie zmieniłoby zachowanie (<b>{x}</b>) — wisi na tym decyzja, czy to budować.',
  'It is a <b>blind spot</b> — nobody raised it, which is exactly why it is the kind of unknown that ends up deciding things.':
    'To <b>martwy punkt</b> — nikt tego nie podniósł, i właśnie dlatego jest to ten rodzaj niewiadomej, która na końcu przesądza sprawę.',
  'The data already disagrees with itself here — a contradiction left standing quietly discredits everything built on it.':
    'Dane już same sobie tutaj przeczą — sprzeczność zostawiona bez odpowiedzi po cichu podważa wszystko, co na niej stoi.',
  'It asks for a plain fact (<b>{x}</b>) — cheap to establish, and nothing much rests on it.':
    'Pyta o zwykły fakt (<b>{x}</b>) — tanio to ustalić i niewiele od tego zależy.',
  'It is about why or how people act — the material personas are made of, so it shapes the work without blocking today’s decision.':
    'Dotyczy tego, dlaczego i jak ludzie działają — materiału, z którego zrobione są persony, więc kształtuje pracę, nie blokując dzisiejszej decyzji.',
  'Nothing in the wording marks it as urgent or as trivia — major is the honest middle until someone decides otherwise.':
    'Nic w brzmieniu nie czyni tego pilnym ani błahym — „poważne” to uczciwy środek, dopóki ktoś nie zdecyduje inaczej.',
  /* the two columns */

  'How to answer it': 'Jak na to odpowiedzieć',
  'Pick a question': 'Wybierz pytanie',
  'Every row carries what we already know about answering it: how urgent it looks, whether it needs a story or a number, and the two or three methods that fit — with what each one will not tell you.':
    'Każdy wiersz niesie to, co już wiemy o odpowiadaniu na niego: jak pilny wygląda, czy potrzebuje historii czy liczby, i dwie albo trzy pasujące metody — razem z tym, czego każda nie powie.',

  'All answered': 'Wszystkie odpowiedziane',
  /* the bar, the filter drawer, the two statuses */
  'Filter': 'Filtruj',
  'Help': 'Pomoc',
  'How this page works, and what the terms mean': 'Jak działa ta strona i co znaczą te pojęcia',
  'Demo — edits stay in this browser': 'Demo — zmiany zostają w tej przeglądarce',
  'Add a research question': 'Dodaj pytanie badawcze',
  'Type of research': 'Typ badania',
  'To run': 'Do przeprowadzenia',
  'All to run': 'Wszystkie do przeprowadzenia',
  'Set priority': 'Ustaw priorytet',
  'Mark as answered': 'Odpowiedziane',
  'Put it back on the list to run': 'Z powrotem na listę do przeprowadzenia',
  'Delete this question from the backlog?': 'Usunąć to pytanie z backlogu?',
  'Nothing here is deleted by accident: if research answered it, use “Mark as answered” instead, so the trail survives.':
    'Nic tu nie znika przypadkiem: jeśli odpowiedziało na nie badanie, użyj „Odpowiedziane” — wtedy ślad zostaje.',
  /* the method sheet */
  'What this method is': 'Na czym polega ta metoda',
  'Won’t tell you': 'Czego nie powie',
  'Where the answer lands': 'Gdzie ląduje odpowiedź',
  '<b>Triangulation</b> — the name is from surveying: you fix a point from two others, and the third corner of the triangle is the thing you are locating. Same here — one question, seen through methods that fail in different ways. Three are suggested above; two is the minimum, and the third earns its place exactly when the first two disagree. Agreement raises confidence; disagreement is a finding, not something to average away.':
    '<b>Triangulacja</b> — nazwa jest z geodezji: położenie punktu wyznacza się z dwóch innych, a trzecim wierzchołkiem trójkąta jest to, czego szukasz. Tu tak samo — jedno pytanie oglądane metodami, z których każda myli się inaczej. Wyżej są trzy propozycje; dwie to minimum, a trzecia zarabia na siebie dokładnie wtedy, gdy pierwsze dwie się rozejdą. Zgodność podnosi pewność, rozbieżność jest ustaleniem, a nie czymś do uśrednienia.',
  'A prepared but flexible one-to-one conversation: you have a guide, you follow what the person actually says. You ask about concrete recent situations („tell me about the last time…”) rather than opinions, because memory of a real event is far more reliable than a general judgement. Five to eight people of one type is usually where new themes stop appearing.':
    'Przygotowana, ale elastyczna rozmowa jeden na jeden: masz scenariusz, ale idziesz za tym, co człowiek naprawdę mówi. Pytasz o konkretne, niedawne sytuacje („opowiedz o ostatnim razie, kiedy…”), a nie o opinie — pamięć realnego zdarzenia jest dużo pewniejsza niż ogólny sąd. Przy pięciu–ośmiu osobach jednego typu zwykle przestają pojawiać się nowe wątki.',
  'You hand someone a realistic task and watch them do it, asking them to think out loud. You do not help and you do not explain — every place they hesitate is the finding. Five participants surface most of the serious problems in one flow, which is why this is the cheapest way to test a design before it ships.':
    'Dajesz komuś realistyczne zadanie i patrzysz, jak je wykonuje, prosząc, żeby myślał na głos. Nie pomagasz i nie tłumaczysz — każde zawahanie jest ustaleniem. Pięć osób wyłapuje większość poważnych problemów w jednej ścieżce, dlatego to najtańszy sposób sprawdzenia projektu przed wdrożeniem.',
  'Participants report their own moments over one to two weeks — a short note, a photo, a voice memo whenever the thing you are studying happens. It catches what an interview cannot, because people do not remember the small irritations of a Tuesday. Expect to nudge people and to lose some of them along the way.':
    'Uczestnicy sami relacjonują swoje momenty przez tydzień–dwa: krótka notatka, zdjęcie, nagranie głosowe za każdym razem, gdy zdarzy się to, co badasz. Łapie to, czego wywiad nie złapie, bo nikt nie pamięta drobnych irytacji ze zwykłego wtorku. Licz się z przypominaniem i z tym, że część osób odpadnie.',
  'Counting what your product already records: how many people reached a screen, how often they come back, where they drop out. No recruiting and no waiting — but it only answers questions about behaviour someone thought to track, and a number without a reason behind it is easy to read the way you were hoping to read it.':
    'Liczenie tego, co produkt już zapisuje: ile osób dotarło do ekranu, jak często wracają, gdzie odpadają. Bez rekrutacji i bez czekania — ale odpowiada tylko o zachowaniach, które ktoś wcześniej pomyślał, żeby mierzyć, a liczbę bez powodu za nią łatwo odczytać tak, jak się chciało.',
  'A short set of closed questions sent to enough people that the result carries a margin of error you can state out loud. It is for checking how widespread something is — never for discovering what that something is, because a question you wrote before you understood the topic will be answered politely and uselessly.':
    'Krótki zestaw pytań zamkniętych, wysłany do tylu osób, żeby wynik miał błąd oszacowania, który da się powiedzieć na głos. Służy do sprawdzenia, jak powszechne jest zjawisko — nigdy do odkrycia, czym ono jest: na pytanie napisane, zanim zrozumiałeś temat, ludzie odpowiedzą grzecznie i bezużytecznie.',
  'Looking for the answer in what has already been published — industry reports, public statistics, competitors’ own numbers. Hours instead of weeks, on one condition: you read the primary source and write down who measured it, on what sample and when. A figure repeated by an article about a report is not the report.':
    'Szukanie odpowiedzi w tym, co już opublikowano — raporty branżowe, statystyki publiczne, liczby podawane przez konkurencję. Godziny zamiast tygodni, pod jednym warunkiem: czytasz źródło pierwotne i zapisujesz, kto mierzył, na jakiej próbie i kiedy. Liczba powtórzona w artykule o raporcie to nie jest raport.',
  'Two versions running side by side on real traffic, with people split at random, so the difference between them can be attributed to the change itself. It is the only method that proves cause — and it needs a working variant, enough traffic, and a metric agreed before the test starts rather than after you have seen the result.':
    'Dwie wersje działające równolegle na prawdziwym ruchu, z losowym podziałem ludzi, dzięki czemu różnicę między nimi można przypisać samej zmianie. Jedyna metoda, która dowodzi przyczyny — i wymaga działającego wariantu, wystarczającego ruchu oraz metryki ustalonej przed startem testu, a nie po zobaczeniu wyniku.',
  'Answered': 'Odpowiedziane',
  'Who set them': 'Kto je ustawił',
  'yours': 'twoje', 'AI': 'AI', 'suggested': 'sugerowane',
  'Set by you — locked': 'Ustawione przez ciebie — zablokowane',
  'Written by an AI run': 'Zapisane przez uruchomienie AI',
  'Only a suggestion from the wording — nothing in the file': 'Tylko sugestia z brzmienia — w pliku nic nie ma',
  'Priority set by you — AI leaves it alone': 'Priorytet ustawiony przez ciebie — AI tego nie rusza',

  'Add a question by hand': 'Dodaj pytanie ręcznie',

  'Nothing matches the filters — {n} hidden.': 'Nic nie pasuje do filtrów — {n} ukrytych.',

  'Edit question': 'Edytuj pytanie',
  'Closing this question': 'Zamykasz to pytanie',
  'The backlog is append-honest, so say what answered it. It moves to <b>Closed / turned into research</b>, it is not lost.':
    'Backlog jest uczciwy przez dopisywanie, więc powiedz, co na nie odpowiedziało. Trafi do <b>Zamknięte / zamienione w badanie</b>, nie ginie.',
  'A question for <b>real</b> people. What a persona could not answer from data is exactly what belongs here.':
    'Pytanie do <b>prawdziwych</b> ludzi. To, czego persona nie potrafiła odpowiedzieć z danych, należy właśnie tutaj.',
  'Priority cleared — back to a suggestion': 'Priorytet wyczyszczony — z powrotem do sugestii',
  'Priority: {sev} — locked, no AI run will change it ✓':
    'Priorytet: {sev} — zablokowany, żadne uruchomienie AI go nie zmieni ✓',
  'set by AI': 'ustawione przez AI',
  '(empty row)': '(pusty wiersz)',
  /* method engine */
  'Start here': 'Zacznij tutaj', 'Or': 'Albo', 'Then, to be sure': 'Potem, dla pewności', 'Also': 'Także',
  'Why this question:': 'Dlaczego to pytanie:',
  'Won’t tell you:': 'Nie powie ci:',

  '(suggested)': '(sugerowane)',
  'Guessed from the wording; nothing is written to the file until you confirm it.':
    'Zgadnięte z brzmienia; nic nie trafia do pliku, dopóki tego nie potwierdzisz.',

  'qualitative': 'jakościowe', 'quantitative': 'ilościowe', 'mixed': 'mieszane',
  'Needs a story: motivation, context, the words people use. Answered by talking to a few people properly.':
    'Potrzebuje historii: motywacji, kontekstu, słów, których ludzie używają. Odpowiada się na nie porządną rozmową z kilkoma osobami.',
  'Needs a number: how many, how often, what share. Answered by counting — analytics, a sized survey, published data.':
    'Potrzebuje liczby: ile, jak często, jaki udział. Odpowiada się liczeniem — analityka, ankieta o policzonej próbie, dane publiczne.',
  'Two questions in one. Understand it qualitatively first, then size it — asking for a number before you know the vocabulary produces a confident wrong number.':
    'Dwa pytania w jednym. Najpierw zrozum jakościowo, potem zmierz — pytanie o liczbę, zanim znasz słownictwo, daje pewną siebie błędną liczbę.',
  'In-depth interviews': 'Wywiady pogłębione',
  '5–8 sessions · 45–60 min': '5–8 sesji · 45–60 min',
  'Signals — one file per observation, via <code>/extract-findings</code>':
    'Sygnały — jeden plik na obserwację, przez <code>/extract-findings</code>',
  'How common it is. Six people are a pattern, never a percentage.':
    'Jak to jest powszechne. Sześć osób to wzorzec, nigdy procent.',
  'Usability test / think-aloud': 'Test użyteczności / głośne myślenie',
  '5 participants · task-based': '5 uczestników · na zadaniach',
  'Signals — observed behaviour, with the moment it broke': 'Sygnały — zaobserwowane zachowanie, z momentem, w którym się posypało',
  'What people do on their own time. A given task is a rehearsal, not real life.':
    'Co ludzie robią we własnym czasie. Zadane zadanie to próba, nie życie.',
  'Diary study': 'Badanie dzienniczkowe',
  '7–14 days · 6–10 participants': '7–14 dni · 6–10 uczestników',
  'Signals — moments captured when they happen': 'Sygnały — momenty złapane, kiedy się dzieją',
  'Anything about people who drop out — diaries lose participants, and the ones who stay are the diligent ones.':
    'Cokolwiek o tych, którzy odpadają — dzienniczki tracą uczestników, a zostają ci sumienni.',
  'Product analytics': 'Analityka produktowa',
  'one query · no recruiting': 'jedno zapytanie · bez rekrutacji',
  'Evidence — an aggregate number, never a Signal': 'Dowód — liczba zagregowana, nigdy sygnał',
  'Why any of it happens. Events record the what and leave the motive out.':
    'Dlaczego cokolwiek się dzieje. Zdarzenia zapisują co, a motyw zostawiają poza.',
  'Sized survey': 'Ankieta o policzonej próbie',
  'n from your population — Settings shows the margin of error': 'n z twojej populacji — Ustawienia pokazują błąd oszacowania',
  'Evidence — a share with a confidence interval': 'Dowód — udział z przedziałem ufności',
  'What people actually do. A survey collects claims, and the wording you choose sets the answer you get.':
    'Co ludzie naprawdę robią. Ankieta zbiera deklaracje, a dobór słów ustawia odpowiedź, którą dostaniesz.',
  'Desk research': 'Desk research',
  'hours, not weeks · published sources': 'godziny, nie tygodnie · źródła publiczne',
  'Evidence — cited, with a retrieval date': 'Dowód — cytowany, z datą pobrania',

  'A/B test / experiment': 'Test A/B / eksperyment',
  'needs live traffic + a working variant': 'wymaga ruchu na żywo + działającego wariantu',
  'Evidence — a measured effect': 'Dowód — zmierzony efekt',
  'Why the losing variant lost. You get the outcome, not the mechanism.':
    'Dlaczego przegrany wariant przegrał. Dostajesz wynik, nie mechanizm.',
  "It asks <b>{x}</b> — a reason lives in someone's own words, and only a conversation gets at it.":
    'Pyta <b>{x}</b> — powód mieszka w czyichś własnych słowach i dobiera się do niego tylko rozmowa.',
  'It is about how a decision gets made (<b>{x}</b>) — people can walk you through the last real time it happened, but cannot report it as a statistic.':
    'Dotyczy tego, jak zapada decyzja (<b>{x}</b>) — ludzie przeprowadzą cię przez ostatni prawdziwy raz, ale nie zaraportują tego jako statystyki.',
  'It touches what someone feels (<b>{x}</b>) — a scale would give you a score without the reason behind it.':
    'Dotyka tego, co ktoś czuje (<b>{x}</b>) — skala dałaby ci wynik bez powodu, który za nim stoi.',
  'It is open-ended: you need the vocabulary and the context before any number about it would mean anything.':
    'Jest otwarte: potrzebujesz słownictwa i kontekstu, zanim jakakolwiek liczba na ten temat cokolwiek będzie znaczyć.',
  'It is about what someone actually <b>does</b>{where} — watching beats asking, because self-reported behaviour and observed behaviour routinely disagree.':
    'Dotyczy tego, co ktoś naprawdę <b>robi</b>{where} — patrzenie bije pytanie, bo deklarowane i obserwowane zachowanie rutynowo się rozjeżdżają.',
  'in': 'w',
  'It is about {x} moments — exactly what memory smooths over in an interview. Catching them as they happen is the only reliable way.':
    'Dotyczy momentów typu {x} — dokładnie tego, co pamięć wygładza w wywiadzie. Łapanie ich na gorąco to jedyny pewny sposób.',
  'It spans time rather than a single sitting, so a one-hour interview would be reconstructing it from memory.':
    'Rozciąga się w czasie, a nie mieści w jednym posiedzeniu, więc godzinny wywiad odtwarzałby to z pamięci.',
  'It asks for a fact we already hold (<b>{x}</b>) — that sits in our own data, so asking a person to recall it adds error for nothing.':
    'Pyta o fakt, który już mamy (<b>{x}</b>) — siedzi w naszych danych, więc proszenie człowieka o przypomnienie sobie tego dokłada błąd za darmo.',
  'It asks <b>{x}</b> — if the event is already tracked, this is an answer today instead of a whole research round.':
    'Pyta <b>{x}</b> — jeśli zdarzenie jest już śledzone, to odpowiedź na dziś zamiast całej rundy badań.',
  'The question has no number in it, but the behaviour behind it is probably already tracked — one query tells you how often this even comes up, and whether it deserves a round at all.':
    'W pytaniu nie ma liczby, ale zachowanie za nim pewnie już jest śledzone — jedno zapytanie powie, jak często to w ogóle wraca i czy zasługuje na rundę.',
  'It asks how widespread something is (<b>{x}</b>) — that is a sample-size question, and the app already computes the margin of error against your population.':
    'Pyta, jak bardzo coś jest powszechne (<b>{x}</b>) — to pytanie o wielkość próby, a aplikacja liczy już błąd oszacowania wobec twojej populacji.',
  'Willingness to pay (<b>{x}</b>) is a distribution, not an opinion — a sized survey (Van Westendorp or similar) reads it far better than a handful of interviews.':
    'Gotowość do zapłaty (<b>{x}</b>) to rozkład, nie opinia — ankieta o policzonej próbie (Van Westendorp albo podobna) czyta to znacznie lepiej niż kilka wywiadów.',
  'Once the interviews tell you what to ask and in whose words, this is how you check the pattern holds past the few people you spoke to.':
    'Kiedy wywiady powiedzą ci, o co i jakimi słowami pytać, tak sprawdzisz, czy wzorzec trzyma się poza tą garstką osób.',
  'It reaches past our own users (<b>{x}</b>) — someone has likely published this already, and re-running it ourselves would be expensive duplication.':
    'Sięga poza naszych użytkowników (<b>{x}</b>) — ktoś to pewnie już opublikował, a powtarzanie tego samemu byłoby drogim dublowaniem.',
  'A published number may already settle this, which is the cheapest possible answer — as long as the source is named and dated.':
    'Opublikowana liczba może to już rozstrzygać, a to najtańsza możliwa odpowiedź — o ile źródło jest nazwane i opatrzone datą.',
  'It is a question about effect (<b>{x}</b>) — comparison against a control is the only method that answers it causally.':
    'To pytanie o efekt (<b>{x}</b>) — porównanie z grupą kontrolną to jedyna metoda, która odpowiada przyczynowo.',
  'would it change behaviour': 'czy zmieniłoby zachowanie',
  /* backlog toasts */
  'Pick your project’s root folder to save the backlog…': 'Wskaż główny folder projektu, żeby zapisać backlog…',
  'A question needs… a question': 'Pytanie potrzebuje… pytania',
  'Say what answered it — closing without a reason is how a backlog rots':
    'Powiedz, co na nie odpowiedziało — zamykanie bez powodu to sposób, w jaki backlog gnije',
  'Undo': 'Cofnij',
  'Reverted — backlog back as it was ✓': 'Cofnięto — backlog wrócił do poprzedniego stanu ✓',
  'Research backlog.md created ✓': 'Utworzono Research backlog.md ✓',
  'Tag cleared — back to a suggestion from the wording': 'Tag zdjęty — wracamy do sugestii z brzmienia',
  'Tagged {kind} ✓ — written into the Kind column': 'Otagowano jako {kind} ✓ — zapisane w kolumnie Kind',
  'Question deleted from the open list': 'Pytanie usunięte z listy otwartych',
  'Question deleted from the closed list': 'Pytanie usunięte z listy zamkniętych',
  'Back on the open list ✓': 'Z powrotem na liście otwartych ✓',
  'Question added to the backlog ✓': 'Pytanie dodane do backlogu ✓',
  'Closed and moved down ✓ — if it contradicts a persona, run /contradictions':
    'Zamknięte i przesunięte w dół ✓ — jeśli zaprzecza personie, uruchom /contradictions',
  'Question updated ✓': 'Pytanie zaktualizowane ✓',
  'The demo backlog could not be loaded.': 'Nie udało się wczytać backlogu demo.',
  'Your backlog lives in <code>Research backlog.md</code> in your project folder. Connect the folder to read and edit it here — it never leaves this machine.':
    'Twój backlog mieszka w <code>Research backlog.md</code> w folderze projektu. Podłącz folder, żeby czytać i edytować go tutaj — nigdy nie opuszcza tego komputera.',
  'Choose project folder…': 'Wybierz folder projektu…',
  'Editing requires Chrome or Edge': 'Edycja wymaga Chrome albo Edge',
  'this browser cannot write local files.': 'ta przeglądarka nie umie zapisywać plików lokalnych.',
  'No <code>Research backlog.md</code> in <b>{folder}</b> yet. It is created the first time a persona conversation leaves a question behind — or start it here.':
    'W <b>{folder}</b> nie ma jeszcze <code>Research backlog.md</code>. Powstaje przy pierwszej rozmowie z personą, która zostawi pytanie — albo zacznij go tutaj.',
  'Create Research backlog.md': 'Utwórz Research backlog.md',

  /* ---- Settings page (12-settings.js) ---- */
  'Make it yours. Your name, defaults and keys live in your project folder — nowhere else.':
    'Zrób ją swoją. Twoje imię, domyślne ustawienia i klucze mieszkają w folderze projektu — nigdzie indziej.',
  'Settings are saved into files in your project folder, so the app needs you to point at it once.':
    'Ustawienia zapisują się do plików w folderze projektu, więc aplikacja musi go raz od ciebie dostać.',
  'Saving requires Chrome or Edge': 'Zapis wymaga Chrome albo Edge',

  'How should we address you?': 'Jak się do ciebie zwracać?',

  'Target population & sample confidence': 'Populacja docelowa i pewność próby',
  'The size of your whole target group — e.g. active accounts, subscribers in the researched segment. With it, the app computes how statistically confident your interview sample really is (shown on the Transcripts tab), so qualitative findings never masquerade as percentages.':
    'Wielkość całej grupy docelowej — np. aktywne konta, abonenci w badanym segmencie. Z nią aplikacja liczy, jak statystycznie pewna jest naprawdę twoja próba wywiadów (widać to na karcie Transkrypcje), żeby wyniki jakościowe nigdy nie udawały procentów.',
  '<b>This can be sensitive internal data.</b> It is saved only to <code>.claude/preferences.local.md</code> — local and gitignored, it never leaves this machine and is never committed. Alternatively, ask your AI assistant: <i>“find the size of our target population, grounded in public sources no older than 9 months, and file it as Evidence”</i> — public numbers avoid the sensitivity problem entirely.':
    '<b>To mogą być wrażliwe dane wewnętrzne.</b> Zapisują się wyłącznie do <code>.claude/preferences.local.md</code> — lokalnie, poza gitem, nigdy nie opuszczają tego komputera i nigdy nie trafiają do repo. Alternatywnie poproś asystenta AI: <i>„znajdź wielkość naszej populacji docelowej, w oparciu o publiczne źródła nie starsze niż 9 miesięcy, i zapisz to jako dowód”</i> — publiczne liczby całkowicie omijają problem wrażliwości.',
  'Population size (N)': 'Wielkość populacji (N)',
  'Digits only, e.g. 602000000. Leave empty to hide the sample-confidence readout.':
    'Same cyfry, np. 602000000. Zostaw puste, żeby ukryć odczyt pewności próby.',

  'Conversation defaults': 'Domyślne ustawienia rozmowy',
  'How /persona-talk behaves unless you override it mid-conversation.':
    'Jak zachowuje się /persona-talk, dopóki nie zmienisz tego w trakcie rozmowy.',
  'Researcher context detail': 'Szczegółowość kontekstu badacza',
  'auto escalates only for decision-worthy answers; quick keeps one-liners; full always shows the 5-part debrief.':
    'auto rozwija się tylko przy odpowiedziach ważnych dla decyzji; quick trzyma jednolinijkowce; full zawsze pokazuje 5-częściowy debrief.',
  'Judge — the reply self-check': 'Sędzia — autokontrola odpowiedzi',
  'Before every persona reply, a silent same-turn check against the data: anti-sycophancy, false premises, consistency with Signals, voice, no full-record recitals. Keep it on.':
    'Przed każdą odpowiedzią persony cicha kontrola w tej samej turze wobec danych: brak podlizywania się, fałszywe założenia, spójność z sygnałami, głos, żadnych recytacji całej kartoteki. Trzymaj włączone.',
  'Demo tips': 'Podpowiedzi w demo',
  '“💡 Try asking” hints from the researcher — only ever in conversations with demo personas.':
    'Podpowiedzi „💡 Spróbuj zapytać” od badacza — wyłącznie w rozmowach z personami demo.',
  'Judge instruction (override)': 'Instrukcja dla sędziego (nadpisanie)',
  'Advanced: replaces the default self-check list above with your own instruction. Leave empty for the default. Applied by the persona-talk skill.':
    'Zaawansowane: zastępuje domyślną listę autokontroli powyżej twoją własną instrukcją. Zostaw puste dla domyślnej. Stosuje ją skill persona-talk.',
  'e.g. Also verify the reply never proposes UI solutions — participants describe problems, not designs.':
    'np. Sprawdź też, czy odpowiedź nigdy nie proponuje rozwiązań UI — uczestnicy opisują problemy, nie projekty.',
  'Save instruction': 'Zapisz instrukcję',
  'Demo data': 'Dane demo',
  'The bundled Spotify example set. Every demo file carries <code>demo: true</code> in its frontmatter — that flag, not the folder, is what identifies it. Removing deletes <b>only</b> flagged files, so your own personas, signals and evidence sitting in the same folders are never touched. Keeping it is fine too: the Demo badges make it unmistakable.':
    'Dołączony przykładowy zestaw o Spotify. Każdy plik demo ma <code>demo: true</code> we frontmatterze — to ta flaga, nie folder, go identyfikuje. Usuwanie kasuje <b>wyłącznie</b> oznaczone pliki, więc twoje własne persony, sygnały i dowody w tych samych folderach nigdy nie są ruszane. Zostawienie go też jest OK: plakietki Demo nie pozwalają się pomylić.',
  'Remove demo files from disk': 'Usuń pliki demo z dysku',
  'Privacy & network': 'Prywatność i sieć',
  'This app runs fully offline: opening it makes <b>no</b> external requests, and your research files never leave this machine. Both switches below can change that, and both are off by default so a locked-down (e.g. enterprise) install stays airtight.':
    'Ta aplikacja działa w pełni offline: otwarcie jej nie wysyła <b>żadnych</b> zapytań na zewnątrz, a twoje pliki badawcze nigdy nie opuszczają tego komputera. Oba przełączniki poniżej mogą to zmienić i oba są domyślnie wyłączone, żeby zamknięta (np. korporacyjna) instalacja została szczelna.',
  'Allow external favicon fetch': 'Pozwól pobierać favicony z zewnątrz',
  'When on, the competitor “Fetch favicon” button may send that competitor’s domain to Google’s favicon service (google.com). Off keeps everything local — competitors still show a lettered monogram, and you can always upload an icon file or ask Claude to fetch one.':
    'Włączone: przycisk „Pobierz faviconę” przy konkurencie może wysłać jego domenę do usługi favicon Google (google.com). Wyłączone trzyma wszystko lokalnie — konkurenci mają monogram literowy, a ikonę zawsze możesz wgrać albo poprosić o nią AI.',
  'Allow external images': 'Pozwól na obrazy z zewnątrz',
  'A file whose <code>picture:</code> or <code>photo:</code> holds an <code>http(s)</code> address (e.g. an avatar still pointing at api.dicebear.com) is fetched from that host every time the page renders it — which tells that host you opened this file. Off shows initials instead, with a one-click load on the entity’s own page. Local paths (<code>avatars/Emma.svg</code>) and inline images are unaffected.':
    'Plik, którego <code>picture:</code> albo <code>photo:</code> zawiera adres <code>http(s)</code> (np. awatar wciąż wskazujący na api.dicebear.com), jest pobierany z tamtego hosta przy każdym renderowaniu — czyli host dowiaduje się, że otworzyłeś ten plik. Wyłączone pokazuje inicjały, z jednym kliknięciem na stronie samego elementu. Ścieżki lokalne (<code>avatars/Emma.svg</code>) i obrazy osadzone nie są tym objęte.',
  'Keep processing in the EU': 'Trzymaj przetwarzanie w UE',
  'When on, skills ask before calling any service outside the EU — persona voice, the favicon fetch, a remote image. A reminder, not a technical block: which model you use is set in your agent, not here. See <code>docs/compliance/data-residency.md</code>.':
    'Włączone: skille pytają, zanim wywołają jakąkolwiek usługę spoza UE — głos persony, pobranie favicony, zdalny obraz. To przypomnienie, nie blokada techniczna: model, którego używasz, ustawiasz w swoim agencie, nie tutaj. Zobacz <code>docs/compliance/data-residency.md</code>.',
  'Clear local data (this browser)': 'Wyczyść dane lokalne (ta przeglądarka)',
  'Nothing stored in this browser for this project copy.': 'Nic nie jest zapisane w tej przeglądarce dla tej kopii projektu.',
  'export or save them to the folder first, clearing loses them': 'najpierw je wyeksportuj albo zapisz do folderu, czyszczenie je gubi',
  'plus view preferences, column widths, idea votes and transcript exclusions':
    'plus preferencje widoku, szerokości kolumn, głosy na pomysły i wyłączenia transkrypcji',
  'Stored in this browser (never on disk, never in git, outside any retention policy you set on the folder): {list}. Your .md files are not touched.':
    'Zapisane w tej przeglądarce (nigdy na dysku, nigdy w gicie, poza jakąkolwiek polityką retencji ustawioną na folderze): {list}. Twoje pliki .md nie są ruszane.',
  'Clear everything this app stored in this browser for this project copy?':
    'Wyczyścić wszystko, co ta aplikacja zapisała w tej przeglądarce dla tej kopii projektu?',
  'Your .md files on disk are not touched.': 'Twoje pliki .md na dysku nie są ruszane.',
  'API keys': 'Klucze API',
  "<b>Never publish these keys or give them to anyone.</b> Anyone holding a key can spend your account's quota and money. Saved keys go straight from this form into <code>.env</code> in your project folder — a file that is gitignored, never leaves this machine, and is only ever shown here as a mask. The AI is instructed to use keys by name (<code>$ELEVENLABS_API_KEY</code>) without reading their values; note that any local tool with file access could technically read <code>.env</code> — your machine is the trust boundary.":
    '<b>Nigdy nie publikuj tych kluczy ani nikomu ich nie przekazuj.</b> Każdy, kto ma klucz, może wydać limit i pieniądze z twojego konta. Zapisane klucze idą prosto z tego formularza do <code>.env</code> w folderze projektu — pliku, który jest poza gitem, nigdy nie opuszcza tego komputera i tutaj pokazuje się wyłącznie jako maska. AI ma polecenie używać kluczy po nazwie (<code>$ELEVENLABS_API_KEY</code>), bez czytania ich wartości; pamiętaj, że dowolne lokalne narzędzie z dostępem do plików technicznie może odczytać <code>.env</code> — granicą zaufania jest twój komputer.',
  "Dovetail, Mixpanel, GA4 and Amplitude don't belong here — they authenticate through your MCP client (OAuth / its own secret store), no key in this repo.":
    'Dovetail, Mixpanel, GA4 i Amplitude tu nie należą — uwierzytelniają się przez twojego klienta MCP (OAuth / jego własny magazyn sekretów), żaden klucz nie trafia do tego repo.',
  'ElevenLabs — gives personas a voice: [speak] in /persona-talk reads replies aloud. Get a key at elevenlabs.io.':
    'ElevenLabs — daje personom głos: [speak] w /persona-talk czyta odpowiedzi na głos. Klucz weź na elevenlabs.io.',
  'Capacities — optional API access for /source-sync imports (the Markdown-export path needs no key at all).':
    'Capacities — opcjonalny dostęp API dla importów /source-sync (ścieżka przez eksport Markdown nie wymaga żadnego klucza).',
  'e.g. Mateusz': 'np. Mateusz',

  'e.g. 602000000': 'np. 602000000',

  'replace — paste & press Enter': 'zmień — wklej i naciśnij Enter',
  'paste key & press Enter': 'wklej klucz i naciśnij Enter',
  'Remove': 'Usuń',
  '•••••• saved': '•••••• zapisany',
  'You’ll be asked to pick your project folder first — deletion works on the files on disk.':
    'Najpierw poprosimy o wskazanie folderu projektu — usuwanie działa na plikach na dysku.',
  'Tip: click Export .md first if you want a backup. For the full cleanup (demo avatars, DEMO.md, demo rows in the backlog/registry) run /demo-data in your AI assistant.':
    'Wskazówka: kliknij najpierw Eksport .md, jeśli chcesz kopię. Pełne sprzątanie (awatary demo, DEMO.md, wiersze demo w backlogu/rejestrze) zrobi /demo-data u twojego asystenta AI.',
  'No demo files in the loaded set ✓': 'We wczytanym zestawie nie ma plików demo ✓',
  'Requires Chrome or Edge': 'Wymaga Chrome albo Edge',
  'Nothing flagged demo: true is loaded': 'Nie wczytano niczego z flagą demo: true',
  /* settings toasts */
  'No demo: true files found in the loaded folder': 'W wczytanym folderze nie ma plików z demo: true',
  'Delete {n} demo files from disk?': 'Usunąć {n} plików demo z dysku?',
  'Only files with demo: true are removed — your own files are untouched. This cannot be undone (consider Export .md first).':
    'Usuwane są tylko pliki z demo: true — twoje własne pliki zostają nietknięte. Tego nie da się cofnąć (rozważ najpierw Eksport .md).',
  'Restored {a} of {b} demo files ✓': 'Przywrócono {a} z {b} plików demo ✓',
  'Deleted {ok}; failed: {bad} ({first}…)': 'Usunięto {ok}; nie udało się: {bad} ({first}…)',
  'Deleted {n} demo files — your own data untouched ✓': 'Usunięto {n} plików demo — twoje dane nietknięte ✓',
  'Folder connected — settings now save to disk ✓': 'Folder podłączony — ustawienia zapisują się teraz na dysk ✓',
  'Key saved to .env (local, gitignored) ✓': 'Klucz zapisany do .env (lokalnie, poza gitem) ✓',
  'Key removed from .env ✓': 'Klucz usunięty z .env ✓',
  'Preference saved ✓': 'Ustawienie zapisane ✓',
  'Judge instruction saved ✓': 'Instrukcja dla sędziego zapisana ✓',

  /* ---- gallery: freshness, sample stats, tables, competitor rows ---- */
  'exclude from analysis': 'wyłącz z analizy',
  'Over a year old — we don’t recommend using this session in persona work. Re-run this research; people and products have moved on.':
    'Ponad rok — nie zalecamy używania tej sesji w pracy z personami. Powtórz to badanie; ludzie i produkty poszły dalej.',
  'Older than 3 months — schedule a refresh round before leaning on it.':
    'Starsze niż 3 miesiące — zaplanuj rundę odświeżającą, zanim się na tym oprzesz.',
  'Sample confidence:': 'Pewność próby:',
  'Statistically strong sample': 'Statystycznie mocna próba',
  'percentages from this sample are defensible as quantitative claims — provided recruitment was random/representative, which the math cannot check for you.':
    'procenty z tej próby da się obronić jako twierdzenia ilościowe — o ile rekrutacja była losowa/reprezentatywna, czego matematyka za ciebie nie sprawdzi.',
  'Directional at best': 'Co najwyżej kierunkowa',
  'percentages are rough directions, not measurements. Good for prioritizing, not for reporting numbers.':
    'procenty to zgrubne kierunki, nie pomiary. Dobre do priorytetyzacji, nie do raportowania liczb.',
  'Qualitative research — and that is fine': 'Badanie jakościowe — i to jest w porządku',
  'this sample tells you WHAT problems exist and WHY, not how many people have them. Never quote percentages from it.':
    'ta próba mówi, JAKIE problemy istnieją i DLACZEGO, a nie ilu ludzi je ma. Nigdy nie cytuj z niej procentów.',
  '<b>{n} participants</b> out of a target population of <b>{N}</b> → margin of error <b>±{moe} pp</b> at 95% confidence (worst-case p=50%). In plain terms:':
    '<b>{n} uczestników</b> z populacji docelowej <b>{N}</b> → błąd oszacowania <b>±{moe} pp</b> przy 95% ufności (najgorszy przypadek p=50%). Po ludzku:',
  'For ±5 pp at 95% you would need <b>~{need}</b> participants. Formula: MOE = z·√(p(1−p)/n)·√((N−n)/(N−1)), z=1.96 — same as standard sample-size calculators. Population set in Settings.':
    'Dla ±5 pp przy 95% potrzebowałbyś <b>~{need}</b> uczestników. Wzór: MOE = z·√(p(1−p)/n)·√((N−n)/(N−1)), z=1,96 — ten sam co w standardowych kalkulatorach wielkości próby. Populację ustawiasz w Ustawieniach.',
  'Heard from': 'Usłyszane od',
  'Share of the research participants (distinct transcripts) who brought this competitor up — maintained per transcript by /extract-findings':
    'Udział uczestników badania (odrębnych transkrypcji), którzy sami wspomnieli o tym konkurencie — utrzymywany per transkrypcja przez /extract-findings',
  'Sort by {col} — click again to flip, third click clears': 'Sortuj wg {col} — kliknij ponownie, żeby odwrócić, trzeci raz czyści',
  'Drag to resize — double-click to reset': 'Przeciągnij, żeby zmienić szerokość — dwuklik resetuje',
  'Excluded': 'Wyłączona',
  'Has {what} — make it a grounded Idea': 'Ma {what} — zrób z tego ugruntowany pomysł',
  'promote': 'awansuj',
  'Edit this hypothesis (form)': 'Edytuj tę hipotezę (formularz)',
  'Delete this hypothesis': 'Usuń tę hipotezę',
  'No highlights yet': 'Jeszcze żadnych podświetleń',
  'The best line always jumps out. Keep it.': 'Najlepsze zdanie zawsze rzuca się w oczy. Zatrzymaj je.',
  'Open a transcript, drag across the words that matter, and a <b>🖍 Highlight</b> button appears. Give it a tag or two — <code>pain</code>, <code>pricing</code>, whatever fits. It saves straight into the file, so the whole team gets it on the next <code>git pull</code>, and the AI treats it as the part you wanted heard first.':
    'Otwórz transkrypcję, zaznacz słowa, które mają znaczenie, a pojawi się przycisk <b>🖍 Podświetl</b>. Nadaj tag albo dwa — <code>pain</code>, <code>pricing</code>, co pasuje. Zapisuje się prosto do pliku, więc cały zespół dostaje to przy następnym <code>git pull</code>, a AI traktuje to jako fragment, który chciałeś usłyszeć najpierw.',
  'Rename everywhere; renaming onto an existing tag merges them': 'Zmień nazwę wszędzie; zmiana na istniejący tag scala je',
  'Rename…': 'Zmień nazwę…',
  'Remove this tag from every highlight (highlights stay)': 'Usuń ten tag ze wszystkich podświetleń (podświetlenia zostają)',
  'Remove…': 'Usuń…',
  'no tag — marked important': 'bez tagu — oznaczone jako ważne',
  'Hand-added — awaiting desk research. The next AI session will offer a 1–3 year lookback before filling this profile.':
    'Dodany ręcznie — czeka na desk research. Następna sesja z AI zaproponuje okno 1–3 lat wstecz, zanim wypełni ten profil.',
  '{m} of {T} participants brought it up — repeat mentions within one session count once':
    '{m} z {T} uczestników samo o tym wspomniało — powtórzenia w jednej sesji liczą się raz',
  'Market position': 'Pozycja rynkowa',
  'Verified': 'Zweryfikowano',
  'over 3 months old, worth re-checking': 'ponad 3 miesiące, warto sprawdzić ponownie',
  'Research footprint': 'Ślad badawczy',
  'Opt-in context — not used in persona conversations by default':
    'Kontekst opcjonalny — domyślnie nieużywany w rozmowach z personami',
  'Open profile': 'Otwórz profil',
  "Researcher's call (frontmatter proximity:)": 'Decyzja badacza (proximity: we frontmatterze)',
  /* table column headers */
  'Signal': 'Sygnał', 'Quote / observation': 'Cytat / obserwacja', 'Interview': 'Wywiad',
  'Evidences': 'Dowody', 'Hypothesis': 'Hipoteza', 'Feature': 'Funkcja', 'If': 'Jeśli',
  'Will': 'To', 'Author': 'Autor', 'Transcript': 'Transkrypcja',
  'Highlights': 'Podświetlenia', 'In analysis': 'W analizie',

  /* ---- cards, compare view, stances, votes (07-compare-votes.js) ---- */
  'Compare — not set up yet': 'Porównanie — jeszcze nieskonfigurowane',
  'Pick the axes that decide wins in <i>your</i> market.': 'Wybierz osie, które decydują o wygranej na <i>twoim</i> rynku.',
  "This view compares up to three competitors side by side — but only on categories that matter to <b>this</b> project, chosen at project setup. No vanity metrics: funding rounds and follower counts don't change what your users choose.":
    'Ten widok porównuje do trzech konkurentów obok siebie — ale tylko w kategoriach, które mają znaczenie dla <b>tego</b> projektu, wybranych przy jego zakładaniu. Żadnych metryk próżności: rundy finansowania i liczby obserwujących nie zmieniają tego, co wybierają twoi użytkownicy.',
  "<b>Two steps:</b> ① add <code>compare_categories: [Pricing, …]</code> to the frontmatter of <code>Product Context.md</code> (the AI offers this during setup); ② let the AI's desk research fill a <code>## Comparison</code> table in each <code>Competitors/</code> file — sourced claims only. A category it can't verify stays empty here, flagged as a research gap.":
    '<b>Dwa kroki:</b> ① dodaj <code>compare_categories: [Pricing, …]</code> do frontmatteru <code>Product Context.md</code> (AI proponuje to przy konfiguracji); ② pozwól desk researchowi AI wypełnić tabelę <code>## Comparison</code> w każdym pliku w <code>Competitors/</code> — wyłącznie twierdzenia ze źródłem. Kategoria, której nie da się zweryfikować, zostaje tu pusta i oznaczona jako luka badawcza.',
  'Your product — the anchor': 'Twój produkt — punkt odniesienia',
  'updated': 'zaktualizowano',
  'No verified data yet — a research gap, not a zero': 'Brak zweryfikowanych danych — to luka badawcza, nie zero',
  "Categories are this project's own (<code>compare_categories</code> in <code>Product Context.md</code>) — deliberately no vanity metrics. Cells come from each competitor's <code>## Comparison</code> table: desk-researched, sourced claims only.":
    'Kategorie są własne dla tego projektu (<code>compare_categories</code> w <code>Product Context.md</code>) — celowo bez metryk próżności. Komórki pochodzą z tabeli <code>## Comparison</code> każdego konkurenta: desk research, wyłącznie twierdzenia ze źródłem.',
  'Awaiting desk research': 'Czeka na desk research',
  'worth re-checking': 'warto sprawdzić ponownie',
  'Column': 'Kolumna',
  'No fresh research': 'Brak świeżych badań',
  'Every transcript here is older than 3 months.': 'Każda transkrypcja tutaj jest starsza niż 3 miesiące.',
  'Your personas are currently answering from history, not from your users. Before the next product decision, run a refresh round — <code>/interview-guide</code> will build the discussion guide from your open questions.':
    'Twoje persony odpowiadają teraz z historii, nie od twoich użytkowników. Przed następną decyzją produktową przeprowadź rundę odświeżającą — <code>/interview-guide</code> zbuduje scenariusz z twoich otwartych pytań.',
  '<b>Did you know?</b> In 1936, The Literary Digest ran one of the largest surveys in history — over <b>2.4 million responses</b> — and confidently predicted Alf Landon would win the US presidency. Franklin D. Roosevelt won 46 of 48 states. Meanwhile George Gallup called the election correctly with a sample roughly a thousand times smaller — but representative. The Digest folded within two years.':
    '<b>Czy wiesz, że…</b> W 1936 roku „The Literary Digest” przeprowadził jedno z największych badań w historii — ponad <b>2,4 miliona odpowiedzi</b> — i pewnie przewidział, że wybory prezydenckie w USA wygra Alf Landon. Franklin D. Roosevelt wygrał w 46 z 48 stanów. W tym samym czasie George Gallup trafił poprawnie, mając próbę mniej więcej tysiąc razy mniejszą — ale reprezentatywną. „Digest” upadł w ciągu dwóch lat.',
  'The lesson has not aged a day: <b>a small amount of fresh, well-sampled research beats a mountain of impressive-looking stale data.</b> Volume is not validity.':
    'Ta lekcja nie zestarzała się ani o dzień: <b>odrobina świeżych badań na dobrze dobranej próbie bije górę imponująco wyglądających, przeterminowanych danych.</b> Ilość to nie trafność.',
  "Hit <b>Connect folder</b> and point at your project — the folder itself, not the files inside. It's read right here on your computer; nothing is uploaded.":
    'Kliknij <b>Podłącz folder</b> i wskaż swój projekt — sam folder, nie pliki w środku. Czytamy go tu, na twoim komputerze; nic nie jest wysyłane.',
  'Nothing matches that filter — yet.': 'Nic nie pasuje do tego filtra — na razie.',
  'Researcher decision: this session is out of sample stats, heard-from counts and AI analyses. Flip “Use in analysis” inside to re-include.':
    'Decyzja badacza: ta sesja jest poza statystykami próby, licznikami „usłyszane od” i analizami AI. Przełącz w środku „Używaj w analizie”, żeby ją przywrócić.',
  'Local draft — lives in this browser until you connect the project folder':
    'Szkic lokalny — żyje w tej przeglądarce, dopóki nie podłączysz folderu projektu',
  'Draft': 'Szkic',
  'Illustrative example content, not real research': 'Treść przykładowa, nie prawdziwe badanie',
  'Core pain': 'Główny ból',
  'Because': 'Bo',
  'So that': 'Żeby',
  'This bet has research behind it — turn it into a grounded Idea':
    'Ten zakład ma za sobą badania — zamień go w ugruntowany pomysł',
  'Has {what} — promote to Idea': 'Ma {what} — awansuj na pomysł',
  "assumption — no evidence yet (that's fine, it's a hypothesis)":
    'założenie — jeszcze bez dowodów (i dobrze, to hipoteza)',
  'Team highlights in this transcript': 'Podświetlenia zespołu w tej transkrypcji',
  'Proximity': 'Bliskość',
  'SOM: same segment we researched': 'SOM: ten sam segment, który badaliśmy',
  'SAM: category we could serve': 'SAM: kategoria, którą moglibyśmy obsłużyć',
  'TAM: same need, different product': 'TAM: ta sama potrzeba, inny produkt',
  'see Competitors/README.md': 'zobacz Competitors/README.md',
  'Opt-in context — not used in conversations by default':
    'Kontekst opcjonalny — domyślnie nieużywany w rozmowach',
  /* stances — the ladder from Signals/_template.md */
  'dealbreaker': 'nie do przyjęcia', 'resents': 'ma żal', 'frustrated': 'sfrustrowany',
  'wary': 'nieufny', 'indifferent': 'obojętny', 'unaware': 'nie wie o tym', 'mixed': 'mieszany',
  'curious': 'ciekawy', 'appreciates': 'docenia',  'advocates': 'poleca innym',
  'Said they would leave or stop using over this': 'Powiedział, że przez to odejdzie albo przestanie używać',
  'Returns to it unprompted, with anger': 'Wraca do tego sam, ze złością',
  'It annoys them and they carry on using it': 'Denerwuje go i dalej z tego korzysta',
  'Assumes up front it will not work for them': 'Z góry zakłada, że u niego to nie zadziała',
  'Asked about it, and demonstrably did not care': 'Zapytany o to, wyraźnie miał to gdzieś',
  'Had never encountered it — a coverage gap, not a finding':
    'Nigdy się z tym nie zetknął — luka pokrycia, nie wynik',
  'Interested, has not used it': 'Zainteresowany, nie używał',
  'Likes it, would not fight for it': 'Lubi to, ale nie walczyłby o to',
  'Part of the routine — would notice it gone': 'Część rutyny — zauważyłby brak',
  'Recommends it unprompted': 'Poleca to sam z siebie',
  'They raised this themselves.': 'Sam o tym powiedział.',
  'The moderator raised this topic — the attitude is evidenced, how much it matters to them is not.':
    'Temat wprowadził moderator — postawa jest udokumentowana, ale nie to, jak bardzo mu na tym zależy.',
  'unprompted': 'sam z siebie', 'asked': 'zapytany', 'on': 'wobec',
  'Voted by:': 'Zagłosowali:',
  'No votes yet — be the first': 'Jeszcze bez głosów — bądź pierwszy',
  'Add your name in Settings first — it’s your one-per-person vote key':
    'Najpierw dodaj swoje imię w Ustawieniach — to twój klucz jednego głosu na osobę',
  'Open Settings': 'Otwórz Ustawienia',
  'Vote removed — commit & push to share': 'Głos wycofany — zacommituj i wypchnij, żeby się podzielić',
  'Voted ✓ — commit & push to share': 'Zagłosowano ✓ — zacommituj i wypchnij, żeby się podzielić',
  'items': 'pozycji',
  'all transcripts stale': 'wszystkie transkrypcje przeterminowane',
  'your workspace': 'twoja przestrzeń',
  'loaded': 'wczytano',
  'example set — connect your folder to see your own research':
    'zestaw przykładowy — podłącz folder, żeby zobaczyć swoje badania',
  'nothing loaded yet': 'nic jeszcze nie wczytano',

  /* ---- affinity board, market map, forms, detail chrome, poster, toasts ---- */
  'Move to another group': 'Przenieś do innej grupy',
  'New group…': 'Nowa grupa…',
  'Manually placed, AI leaves it put': 'Umieszczone ręcznie, AI tego nie rusza',
  'Contains manually-curated signals — AI suggests, never rewrites':
    'Zawiera sygnały ułożone ręcznie — AI sugeruje, nigdy nie przepisuje',
  'curated': 'ułożone ręcznie',
  '<b>Provisional grouping</b> — auto-grouped by tag. Run <code>/affinity</code> in your AI assistant for meaningful thematic groups, or curate them here.':
    '<b>Grupowanie tymczasowe</b> — automatycznie po tagach. Uruchom <code>/affinity</code> u swojego asystenta AI, żeby dostać sensowne grupy tematyczne, albo ułóż je tutaj.',
  "Groups are product-specific themes. The first grouping is AI-generated; anything you touch here gets a 🔒 <b>curated</b> flag, and the AI will then only <i>suggest</i> changes to it — never rewrite it. Membership lives in each signal's <code>affinity:</code> frontmatter.":
    'Grupy to tematy właściwe dla produktu. Pierwsze grupowanie robi AI; wszystko, czego tu dotkniesz, dostaje flagę 🔒 <b>ułożone ręcznie</b>, a AI będzie od tego momentu tylko <i>sugerować</i> zmiany — nigdy ich nie nadpisze. Przynależność mieszka we frontmatterze każdego sygnału, w polu <code>affinity:</code>.',
  'Moved to “{group}” — locked (AI leaves it put) ✓': 'Przeniesiono do „{group}” — zablokowane (AI tego nie rusza) ✓',
  'Connect the folder (Chrome/Edge) to rename': 'Podłącz folder (Chrome/Edge), żeby zmienić nazwę',
  'Saving needs Chrome or Edge (File System Access API)': 'Zapis wymaga Chrome albo Edge (File System Access API)',
  'Pick your project’s root folder to save this change…': 'Wskaż główny folder projektu, żeby zapisać tę zmianę…',
  'That folder doesn’t contain {file} — nothing was saved': 'Ten folder nie zawiera {file} — nic nie zostało zapisane',
  'Demo restored to factory state ✓': 'Demo przywrócone do stanu fabrycznego ✓',
  /* idea form */
  'Idea name': 'Nazwa pomysłu', 'When': 'Kiedy', 'I want': 'Chcę',
  'e.g. One-tap focus mode': 'np. Tryb skupienia jednym kliknięciem',
  "the user's situation / context": 'sytuacja / kontekst użytkownika',
  'the capability or action': 'możliwość albo działanie',
  'the goal / benefit': 'cel / korzyść',
  'Grounding — pick Signals & Evidence (at least one, required)':
    'Ugruntowanie — wybierz sygnały i dowody (co najmniej jeden, wymagane)',
  'Filter signals & evidence…': 'Filtruj sygnały i dowody…',
  'Tick sources above. Pair a Signal with an Evidence into a <b>tandem</b> (same group + a label) when they only make the case together.':
    'Zaznacz źródła powyżej. Połącz sygnał z dowodem w <b>tandem</b> (ta sama grupa + etykieta), kiedy dopiero razem tworzą argument.',
  'No folder connected — this idea will be kept as a <b>local draft in this browser</b> (editable, votable, included in Export .md). Connect your project folder anytime to save drafts as real files.':
    'Brak podłączonego folderu — ten pomysł zostanie <b>szkicem w tej przeglądarce</b> (edytowalnym, można na niego głosować, wchodzi do Eksportu .md). Podłącz folder projektu kiedy zechcesz, żeby zapisać szkice jako prawdziwe pliki.',
  'No match.': 'Brak dopasowania.',
  'no tandem': 'bez tandemu', 'Tandem': 'Tandem', 'new tandem': 'nowy tandem',
  'Tandem {n} label — why these belong together': 'Etykieta tandemu {n} — dlaczego to idzie w parze',
  'Give the idea a filename-safe name': 'Nadaj pomysłowi nazwę, która może być nazwą pliku',
  'An idea with that name already exists': 'Pomysł o tej nazwie już istnieje',
  /* market map */
  'Pulling our users': 'Przyciągają naszych użytkowników',
  'Same market, quiet so far': 'Ten sam rynek, na razie cicho',
  'Pull from outside': 'Przyciąganie z zewnątrz',
  'Periphery': 'Peryferie',
  'TAM — indirect': 'TAM — pośredni', 'SAM — adjacent': 'SAM — sąsiedni', 'SOM — direct (our segment)': 'SOM — bezpośredni (nasz segment)',
  'A competitor': 'Konkurent',
  'One dot per <code>Competitors/</code> file. Click it to open the profile.':
    'Jedna kropka na plik w <code>Competitors/</code>. Kliknij, żeby otworzyć profil.',
  'You — the anchor': 'Ty — punkt odniesienia',
  'Fixed top right: your segment, your users. Every dot is read relative to this point.':
    'Na stałe w prawym górnym rogu: twój segment, twoi użytkownicy. Każdą kropkę czyta się względem tego punktu.',
  'Right = closer to your market': 'W prawo = bliżej twojego rynku',
  "The researcher's call (<code>proximity:</code>) — TAM indirect · SAM adjacent · SOM direct.":
    'Decyzja badacza (<code>proximity:</code>) — TAM pośredni · SAM sąsiedni · SOM bezpośredni.',
  'Up = heard more often': 'W górę = słyszane częściej',
  "Distinct participants who brought them up — never market share. A low dot may just mean you haven't asked.":
    'Liczba różnych uczestników, którzy o nich wspomnieli — nigdy udział w rynku. Nisko położona kropka może znaczyć tylko tyle, że nie pytałeś.',
  'Participants who brought them up (distinct transcripts)': 'Uczestnicy, którzy sami o nich wspomnieli (odrębne transkrypcje)',
  'How to read the map': 'Jak czytać tę mapę',
  /* competitor + hypothesis forms */
  'Competitor name': 'Nazwa konkurenta', 'Website': 'Strona WWW',
  '(optional — feeds the favicon & research)': '(opcjonalne — zasila faviconę i research)',
  'Market proximity': 'Bliskość rynkowa',
  '(optional — your call, the map uses it)': '(opcjonalne — twoja decyzja, mapa z tego korzysta)',
  'direct — fights for the SAME segment we researched (SOM)': 'bezpośredni — walczy o TEN SAM segment, który badaliśmy (SOM)',
  'adjacent — same category, different segment/geo (SAM)': 'sąsiedni — ta sama kategoria, inny segment/rynek (SAM)',
  'indirect — same need, different product (TAM)': 'pośredni — ta sama potrzeba, inny produkt (TAM)',
  'Why they matter': 'Dlaczego mają znaczenie', '(optional, one line)': '(opcjonalne, jedna linia)',
  'e.g. Tidal': 'np. Tidal', 'e.g. tidal.com': 'np. tidal.com',
  'e.g. keeps coming up in sales calls as the cheaper option': 'np. wraca na rozmowach sprzedażowych jako tańsza opcja',
  'A name is enough. The file is created with a <b>needs_research</b> flag — the next AI session will ask whether to run initial desk research (you pick the lookback: 1, 2 or 3 years back from today).':
    'Wystarczy nazwa. Plik powstaje z flagą <b>needs_research</b> — następna sesja z AI zapyta, czy zrobić wstępny desk research (ty wybierasz okno: 1, 2 albo 3 lata wstecz).',
  'No folder connected — saved as a local draft in this browser.': 'Brak podłączonego folderu — zapisane jako szkic w tej przeglądarce.',
  'Give the competitor a filename-safe name': 'Nadaj konkurentowi nazwę, która może być nazwą pliku',
  'A competitor with that name already exists': 'Konkurent o tej nazwie już istnieje',
  'Competitor added ✓ — the AI will offer desk research (1–3 years back) next session':
    'Konkurent dodany ✓ — AI zaproponuje desk research (1–3 lata wstecz) na następnej sesji',
  'Hypothesis name': 'Nazwa hipotezy', 'Feature it concerns': 'Funkcja, której dotyczy', '(optional)': '(opcjonalne)',
  'By': 'Przez', 'Hints': 'Podpowiedzi',
  '— we do X': '— robimy X', '— the mechanism': '— mechanizm',
  '— the checkable outcome': '— sprawdzalny wynik', '— the assumption this bet rests on': '— założenie, na którym stoi ten zakład',
  'e.g. Guest mode protects recommendations': 'np. Tryb gościa chroni rekomendacje',
  'e.g. listening-profiles': 'np. profile-słuchania',
  'we add a one-tap guest mode': 'dodamy tryb gościa jednym kliknięciem',
  'excluding guest playback from taste modeling': 'wyłączając odtwarzanie gościa z modelowania gustu',
  'trust in Discover Weekly recovers': 'zaufanie do Discover Weekly wróci',
  'we assume distrust comes from polluting sessions, not the recommender':
    'zakładamy, że nieufność bierze się z zaśmieconych sesji, nie z samego rekomendera',
  '(optional — a hypothesis needs NO grounding; link a quote/signal only if one inspired it)':
    '(opcjonalne — hipoteza NIE potrzebuje ugruntowania; podlinkuj cytat/sygnał tylko, jeśli ją zainspirował)',
  "Nothing to link in this workspace — that's fine.": 'Nie ma tu czego podlinkować — i dobrze.',
  'Hypothesis updated ✓': 'Hipoteza zaktualizowana ✓',
  'saved to': 'zapisano do', 'draft': 'szkic', 'demo sandbox': 'piaskownica demo',
  'Give the hypothesis a filename-safe name': 'Nadaj hipotezie nazwę, która może być nazwą pliku',
  'A hypothesis with that name already exists': 'Hipoteza o tej nazwie już istnieje',
  'Could not splice the transcript body — reload the folder': 'Nie udało się wstawić tego w treść transkrypcji — wczytaj folder ponownie',
  'Read-only — connect your project folder (Chrome/Edge) to edit tags':
    'Tylko do odczytu — podłącz folder projektu (Chrome/Edge), żeby edytować tagi',
  'Idea created ✓ — but the hypothesis could not be updated (status: promoted)':
    'Pomysł utworzony ✓ — ale nie udało się zaktualizować hipotezy (status: promoted)',
  'Delete the hypothesis “{name}”?': 'Usunąć hipotezę „{name}”?',
  'It is a local draft — this cannot be undone later.': 'To szkic lokalny — później nie da się tego cofnąć.',
  'The .md file will be removed from disk.': 'Plik .md zostanie usunięty z dysku.',
  '(Demo sandbox — Reset demo can always bring it back.)': '(Piaskownica demo — Reset demo zawsze może to przywrócić.)',
  'Delete failed: ': 'Usuwanie nie powiodło się: ',
  'Hypothesis deleted': 'Hipoteza usunięta', 'Hypothesis restored ✓': 'Hipoteza przywrócona ✓',
  /* detail chrome */
  'Team highlight — click to edit tags': 'Podświetlenie zespołu — kliknij, żeby edytować tagi',
  'Out of sample stats, heard-from counts and AI analyses': 'Poza statystykami próby, licznikami „usłyszane od” i analizami AI',
  'Delete this draft? It only exists in this browser — this cannot be undone.':
    'Usunąć ten szkic? Istnieje tylko w tej przeglądarce — tego nie da się cofnąć.',
  'Draft deleted': 'Szkic usunięty',
  'Full-bleed visual one-pager of this persona': 'Wizualna jednostronicówka tej persony na całą szerokość',
  'Poster view': 'Widok plakatu',
  'L1 assumption — a bet to test, not a finding': 'Założenie L1 — zakład do sprawdzenia, nie wynik',
  'feature:': 'funkcja:',
  'No matching item in the ## Sources list for [S{n}]': 'Brak pasującej pozycji na liście ## Sources dla [S{n}]',
  'Folder connected ✓ — click the highlight again to edit it': 'Folder podłączony ✓ — kliknij podświetlenie jeszcze raz, żeby je edytować',
  'Folder connected ✓ — select the fragment again to highlight it': 'Folder podłączony ✓ — zaznacz fragment jeszcze raz, żeby go podświetlić',
  'edit': 'edytuj',
  'Discard unsaved changes?': 'Odrzucić niezapisane zmiany?',
  'Not saved — frontmatter must keep a valid type:': 'Nie zapisano — frontmatter musi zachować poprawne type:',
  'Write permission denied': 'Odmowa uprawnień do zapisu',
  'This file changed on disk since it was loaded here (another tool — maybe your AI assistant — edited it).':
    'Ten plik zmienił się na dysku od czasu wczytania tutaj (edytowało go inne narzędzie — może twój asystent AI).',
  'Overwrite the newer disk version with yours?': 'Nadpisać nowszą wersję z dysku swoją?',
  'Not saved — click Refresh files to pick up the disk version':
    'Nie zapisano — kliknij Odśwież pliki, żeby wczytać wersję z dysku',
  'Nothing to undo': 'Nie ma czego cofać',
  'Reverted {file} ✓': 'Cofnięto {file} ✓',
  'Saved to {file} ✓': 'Zapisano do {file} ✓',
  'Could not update frontmatter': 'Nie udało się zaktualizować frontmatteru',
  'External favicon fetch is off for privacy. Turn it on in Settings ▸ Privacy & network — or upload an icon, or ask your AI assistant to fetch it.':
    'Pobieranie favicon z zewnątrz jest wyłączone ze względu na prywatność. Włącz je w Ustawieniach ▸ Prywatność i sieć — albo wgraj ikonę, albo poproś o nią swojego asystenta AI.',
  'Fetch blocked (CORS/offline) — upload a file instead, or ask your AI assistant to fetch the favicon for {name}':
    'Pobieranie zablokowane (CORS/offline) — wgraj plik albo poproś asystenta AI o faviconę dla {name}',
  'Could not read that image': 'Nie udało się odczytać tego obrazu',
  /* poster */
  'Persona poster': 'Plakat persony',
  'Full list — every entry in this section': 'Pełna lista — wszystkie pozycje z tej sekcji',
  'All': 'Wszystko', 'Add': 'Dodaj', 'full list': 'pełna lista',
  'Nothing in this section yet — an honest gap, nothing invented. Add the first entry or fill it from research.':
    'W tej sekcji nic jeszcze nie ma — uczciwa luka, nic zmyślonego. Dodaj pierwszy wpis albo uzupełnij ją z badań.',
  'Nothing in “{sec}” yet — an honest gap, nothing invented. Add the first entry below or fill it from research.':
    'W „{sec}” nic jeszcze nie ma — uczciwa luka, nic zmyślonego. Dodaj pierwszy wpis poniżej albo uzupełnij ją z badań.',
  'Persona improvement': 'Rozwój persony',
  'Level 2': 'Poziom 2', 'Level 3': 'Poziom 3', 'Level 4': 'Poziom 4',
  'Evidence — desk research': 'Dowód — desk research',
  'Signal — interviews': 'Sygnał — wywiady',
  'Correlation — Signal + Evidence': 'Korelacja — sygnał + dowód',
  'Opportunity:': 'Szansa:',
  'Additional information': 'Dodatkowe informacje',
  'Jobs to be done': 'Zadania do wykonania', 'Potential gains': 'Potencjalne korzyści',
  'Pains': 'Bóle', 'Relevant quotes': 'Istotne cytaty', 'Potential pain relievers': 'Potencjalne lekarstwa na ból',
  'persona': 'persona',
  'New entry — one bullet, in your own words…': 'Nowy wpis — jeden punkt, twoimi słowami…',
  'Saved as a bullet under “## {sec}” in {file}. Link a Signal/Evidence to it in the document view — unsourced bullets read as assumptions.':
    'Zapisane jako punkt pod „## {sec}” w {file}. Podlinkuj do niego sygnał/dowód w widoku dokumentu — punkty bez źródła czyta się jak założenia.',
  'Close the poster and jump to this section in the document view': 'Zamknij plakat i przejdź do tej sekcji w widoku dokumentu',
  'Open in document view ↗': 'Otwórz w widoku dokumentu ↗',
  'Added to {sec} ✓': 'Dodano do {sec} ✓',
  'File not found in this workspace': 'Nie znaleziono pliku w tej przestrzeni',
  /* boot, export, filter bar */
  'No .md files found': 'Nie znaleziono plików .md',
  'No file has valid frontmatter (type: Persona / Signal / …)':
    'Żaden plik nie ma poprawnego frontmatteru (type: Persona / Signal / …)',
  'Stopped — that folder is enormous ({what}). Pick the project ROOT folder, not your whole disk.':
    'Zatrzymano — ten folder jest ogromny ({what}). Wskaż GŁÓWNY folder projektu, nie cały dysk.',
  '4000+ .md files': 'ponad 4000 plików .md', '30 000+ entries': 'ponad 30 000 elementów',
  'Save drafts': 'Zapisz szkice',
  'one shadows the other, rename to keep both': 'jeden przesłania drugi, zmień nazwę, żeby zachować oba',
  'Nothing loaded to export': 'Nie ma czego eksportować',
  'Exported {n} .md files as a zip ✓': 'Wyeksportowano {n} plików .md do zipa ✓',
  '(incl. {n} root docs)': '(w tym {n} dokumentów głównych)',
  'connect the folder to include Product Context & backlog':
    'podłącz folder, żeby dołączyć Product Context i backlog',
  'Filter {what}…': 'Filtruj {what}…',
  'Most voted': 'Najczęściej głosowane',
  'Step': 'Krok',

  /* ---- Help page chrome (the Q&A bodies live in 10-help.js as HELP_PL) ---- */
  'Short answers, straight to the point. Click a question to expand. New here?':
    'Krótkie odpowiedzi, prosto do rzeczy. Kliknij pytanie, żeby je rozwinąć. Pierwszy raz tutaj?',
  '▶ Replay the intro tour': '▶ Odtwórz wprowadzenie',
  'Filter these questions…': 'Filtruj te pytania…',
  'Filter questions in this category': 'Filtruj pytania w tej kategorii',

  'Edit highlight': 'Edytuj podświetlenie',
  'New highlight': 'Nowe podświetlenie',
  'Highlight': 'Podświetl',
  'Remove highlight': 'Usuń podświetlenie',
  'new tags, comma-separated (e.g. pain, pricing)': 'nowe tagi, po przecinku (np. pain, pricing)',

  'Fresh only (≤3 months) — hiding {n} stale': 'Tylko świeże (≤3 miesiące) — ukrywa {n} przeterminowanych',
  'Fresh only (≤3 months) · {n} of {t} are stale': 'Tylko świeże (≤3 miesiące) · {n} z {t} jest przeterminowanych',
  'you': 'ty',
  'select text inside any transcript to add one; tags are shared across all transcripts':
    'zaznacz tekst w dowolnej transkrypcji, żeby dodać kolejne; tagi są wspólne dla wszystkich transkrypcji',

  'fights for the exact segment we researched': 'walczy dokładnie o ten segment, który badaliśmy',
  'same category, a segment or geo we could serve': 'ta sama kategoria, segment albo rynek, który moglibyśmy obsłużyć',
  'different product competing for the same need or time': 'inny produkt walczący o tę samą potrzebę albo czas',
  'Graph diagram: {n} entities in {c} columns ({cols}), joined by {l} links. Every entity and every link here is also reachable as text — use the type tabs and the table view.':
    'Diagram grafu: {n} elementów w {c} kolumnach ({cols}), połączonych {l} połączeniami. Każdy element i każde połączenie są dostępne również jako tekst — użyj kart typów i widoku tabeli.',
  'Flow diagram: {n} entities and {c} connections between types, band thickness showing how much research flows through each. The same relationships are readable as text in the type tabs and table view.':
    'Diagram przepływu: {n} elementów i {c} połączeń między typami; grubość wstęgi pokazuje, ile badań przez nie płynie. Te same zależności da się przeczytać jako tekst w kartach typów i w widoku tabeli.',

  'Build version — the same string is in the header comment of this file and in CHANGELOG.md':
    'Wersja builda — ten sam ciąg jest w komentarzu nagłówkowym tego pliku i w CHANGELOG.md',

  /* ---- titles (hover) ---- */
  "Point the app at your project's root folder — everything stays on this computer":
    'Wskaż główny folder projektu — wszystko zostaje na tym komputerze',
  'Re-read the connected folder to pick up changes from git pull or other tools':
    'Wczytaj ponownie podłączony folder, żeby zobaczyć zmiany z git pull albo z innych narzędzi',
  'Download everything currently loaded as .md files in a zip — share the graph without GitHub':
    'Pobierz wszystko, co jest wczytane, jako pliki .md w zipie — podziel się grafem bez GitHuba',
  'Research backlog.md — the questions your persona conversations left open':
    'Research backlog.md — pytania, które zostawiły rozmowy z personami',
  'Filter this view': 'Filtruj ten widok',
  'Clear filter': 'Wyczyść filtr',
  'Card grid': 'Siatka kart',
  'Single column': 'Jedna kolumna',
  'Table view': 'Widok tabeli',
  'Market map (Competitors)': 'Mapa rynku (konkurenci)',
  'Compare side by side (Competitors)': 'Porównaj obok siebie (konkurenci)',
  'Affinity groups (Signals)': 'Grupy tematyczne (sygnały)',
  'Highlights by tag (Transcripts)': 'Podświetlenia wg tagu (transkrypcje)',
  'See this entity in the context of its connections': 'Zobacz ten element w kontekście jego powiązań',
  'Previous match (Shift+Enter)': 'Poprzednie trafienie (Shift+Enter)',
  'Next match (Enter)': 'Następne trafienie (Enter)',
  'Use this transcript in analyses and stats': 'Używaj tej transkrypcji w analizach i statystykach',

  /* ---- entity type labels ---- */
  'All': 'Wszystko',
  'All entities': 'Wszystkie elementy',
  'Personas': 'Persony',
  'Archetypes': 'Archetypy',
  'Signals': 'Sygnały',
  'Evidence': 'Dowody',
  'Hypotheses': 'Hipotezy',
  'Ideas': 'Pomysły',
  'Competitors': 'Konkurenci',
  'Transcripts': 'Transkrypcje',

  /* ---- page subtitles ---- */
  'Everything your team has learned. In one place. Open any card and follow it back to the person who said it.':
    'Wszystko, czego dowiedział się zespół. W jednym miejscu. Otwórz dowolną kartę i wróć nią do osoby, która to powiedziała.',
  'Real people, remembered. Every persona is built from actual conversations — and only says what your research can back up.':
    'Zapamiętani ludzie. Każda persona powstaje z prawdziwych rozmów — i mówi tylko to, co potwierdzają twoje badania.',
  'The pattern behind the person. Archetypes capture the tension people share, so a conversation can speak for many — not just one anecdote.':
    'Wzorzec za człowiekiem. Archetyp opisuje napięcie wspólne dla wielu osób, więc rozmowa mówi w imieniu grupy, a nie jednej anegdoty.',
  'Heard firsthand. One observation per file, straight from a real session, quote and all. Everything else in the graph stands on these.':
    'Usłyszane na własne uszy. Jedna obserwacja na plik, prosto z sesji, razem z cytatem. Cała reszta grafu stoi na nich.',
  'The homework, done. Reports, numbers and public threads that back up what you heard — or push back on it.':
    'Odrobiona praca domowa. Raporty, liczby i publiczne wątki, które potwierdzają to, co usłyszałeś — albo się z tym spierają.',
  'A hunch worth testing. Written as If / By / Will / Because, with nothing to prove it yet. The day research catches up, promote it to an Idea.':
    'Przeczucie warte sprawdzenia. Zapisane jako Jeśli / Przez / To / Ponieważ, na razie bez żadnego dowodu. W dniu, w którym badania je dogonią, awansuje na Pomysł.',
  'A change worth making — and the research that earns it. Written as When / I want / So that; the bars show how much evidence stands behind each one.':
    'Zmiana warta wprowadzenia — i badania, które na nią zapracowały. Zapisana jako Kiedy / Chcę / Żeby; paski pokazują, ile dowodów za nią stoi.',
  'Know the field. The map shows who your own participants keep bringing up — not who is biggest. Personas stay unaware of all this unless you switch it on.':
    'Poznaj pole gry. Mapa pokazuje, kogo sami uczestnicy wciąż przywołują — nie kto jest największy. Persony nic o tym nie wiedzą, dopóki tego nie włączysz.',
  'Where every insight was born. The full conversations, word for word — one file, one person.':
    'Miejsce narodzin każdego wniosku. Pełne rozmowy, słowo w słowo — jeden plik, jedna osoba.',

  /* ---- banners ---- */
  'Last time you were working in': 'Ostatnio pracowałeś w folderze',
  '. Reconnect it to load your files and save edits again.':
    '. Połącz go ponownie, żeby wczytać swoje pliki i znów zapisywać zmiany.',
  "This browser can browse and search, but <b>can't save</b> — editing, Settings and demo cleanup need Chrome or Edge (File System Access API). Your files are never modified here.":
    'W tej przeglądarce przejrzysz i przeszukasz dane, ale <b>nie zapiszesz</b> — edycja, Ustawienia i sprzątanie demo wymagają Chrome’a lub Edge’a (File System Access API). Twoje pliki nie są tu w żaden sposób zmieniane.',
  'Dismiss': 'Zamknij',

  /* ---- gallery bars ---- */
  '＋ New idea': '＋ Nowy pomysł',
  '＋ New hypothesis': '＋ Nowa hipoteza',
  '＋ New competitor': '＋ Nowy konkurent',

  'Everyone gets one vote. Back the ideas worth building next — the count lives right in each file, so it travels with the repo.':
    'Każdy ma jeden głos. Poprzyj pomysły warte zbudowania — licznik siedzi w samym pliku, więc jedzie razem z repozytorium.',
  'A hunch, not a plan. It needs no proof to live here — the day it earns a Signal or Evidence, promote it to an Idea.':
    'Przeczucie, nie plan. Nie potrzebuje dowodu, żeby tu być — w dniu, w którym zdobędzie Sygnał albo Dowód, awansuj je na Pomysł.',
  'Just the name will do. Next time you open Claude Code it offers to do the reading for you — you choose how far back to look, 1 to 3 years.':
    'Wystarczy sama nazwa. Przy następnym otwarciu Claude Code zaproponuje, że doczyta resztę — ty wybierasz, jak daleko wstecz sięgnąć, od roku do trzech.',

  /* ---- modals, detail view ---- */
  'New idea': 'Nowy pomysł',
  'New hypothesis': 'Nowa hipoteza',
  'New competitor': 'Nowy konkurent',
  'Cancel': 'Anuluj',
  'Create idea': 'Utwórz pomysł',
  'Save hypothesis': 'Zapisz hipotezę',
  'Add competitor': 'Dodaj konkurenta',
  'Close': 'Zamknij',
  'Graph': 'Graf',
  '◎ Map': '◎ Mapa',
  'Delete draft': 'Usuń szkic',
  'Delete this local draft': 'Usuń ten lokalny szkic',
  'Edit': 'Edytuj',
  'Save': 'Zapisz',
  'Fetch favicon': 'Pobierz favicon',
  'Upload icon…': 'Wgraj ikonę…',
  'Remove': 'Usuń',
  'Find in transcript…': 'Szukaj w transkrypcji…',
  'Use in analysis': 'Używaj w analizie',
  'Writes straight to the .md file on disk.': 'Zapisuje prosto do pliku .md na dysku.',
  'Back': 'Wstecz',
  'Next': 'Dalej',
  'Skip the tour': 'Pomiń wprowadzenie',
  'Intro tour': 'Wprowadzenie',

  /* ---- tour ---- */
  'Welcome to Archetype Talk': 'Witaj w Archetype Talk',
  'Your research, one living graph': 'Twoje badania jako jeden żywy graf',
  'Every interview, insight and idea your team gathers lives as a plain Markdown file in your project. This app is a window onto those files — it runs entirely in your browser, and <b>nothing is ever uploaded anywhere</b>.':
    'Każdy wywiad, wniosek i pomysł twojego zespołu to zwykły plik Markdown w twoim projekcie. Ta aplikacja jest oknem na te pliki — działa w całości w przeglądarce i <b>nic nigdzie się nie wysyła</b>.',
  'The graph': 'Graf',
  'Every claim leads back to its source': 'Każde twierdzenie prowadzi do swojego źródła',
  'Evidence → Signals → Personas ↔ Archetypes → Ideas. Click any pill to walk the chain down to the original interview. The little bars show <b>how much real research stands behind a claim</b> — validated beats plausible, always.':
    'Dowody → Sygnały → Persony ↔ Archetypy → Pomysły. Kliknij dowolną plakietkę, żeby zejść łańcuchem aż do oryginalnego wywiadu. Paseczki pokazują, <b>ile prawdziwych badań stoi za twierdzeniem</b> — potwierdzone zawsze bije prawdopodobne.',
  'Transcripts': 'Transkrypcje',
  'Search the raw sessions, highlight the gold': 'Przeszukaj surowe sesje, podświetl to, co złote',
  'Full word search inside every transcript. Select any fragment to <b>highlight and tag it</b> (pain, pricing — your call). Highlights are saved into the file itself, so teammates get them with git and the AI treats them as priority evidence.':
    'Pełne wyszukiwanie w każdej transkrypcji. Zaznacz fragment, żeby go <b>podświetlić i otagować</b> (ból, cena — twoja decyzja). Podświetlenia zapisują się w samym pliku, więc zespół dostaje je z gitem, a AI traktuje je jako materiał pierwszej kategorii.',
  'Ideas': 'Pomysły',
  'Decide together what to build next': 'Zdecydujcie wspólnie, co budować dalej',
  'Ideas form a request board: every idea must cite research, and <b>each teammate gets one vote</b>. Votes live in the files too — commit &amp; push, and the ranking syncs for the whole team.':
    'Pomysły tworzą tablicę zgłoszeń: każdy musi powoływać się na badania, a <b>każda osoba w zespole ma jeden głos</b>. Głosy też siedzą w plikach — commit i push, a ranking synchronizuje się dla całego zespołu.',
  'One last thing': 'Ostatnia rzecz',
  'Point it at your project — it all stays on your computer': 'Wskaż mu swój projekt — wszystko zostaje na twoim komputerze',
  "You're looking at the built-in <b>example set</b>. To see your team's research — and to save highlights, votes and edits — pick your project's <b>root folder</b> once (the one containing <code>Personas/</code>, <code>Signals/</code>, <code>Transcripts/</code>…).":
    'Patrzysz na wbudowany <b>zestaw przykładowy</b>. Żeby zobaczyć badania swojego zespołu — i zapisywać podświetlenia, głosy i zmiany — wskaż raz <b>główny folder</b> projektu (ten z katalogami <code>Personas/</code>, <code>Signals/</code>, <code>Transcripts/</code>…).',
  '🔒 The browser will ask for permission first. Your files are read <b>directly from this computer</b> — no upload, no account, no server.':
    '🔒 Przeglądarka najpierw poprosi o zgodę. Twoje pliki czytane są <b>bezpośrednio z tego komputera</b> — bez wysyłki, bez konta, bez serwera.',
  '📂 Choose project folder…': '📂 Wybierz folder projektu…',
  'Explore the example set first': 'Najpierw obejrzyj zestaw przykładowy',
  'Browse the example set': 'Przeglądaj zestaw przykładowy',
  '👁 This browser can browse and search, but saving needs <b>Chrome or Edge</b>. You can still explore the example set, or drop .md files anywhere in the window.':
    '👁 W tej przeglądarce przejrzysz i przeszukasz dane, ale zapis wymaga <b>Chrome’a lub Edge’a</b>. Nadal możesz obejrzeć zestaw przykładowy albo upuścić pliki .md gdziekolwiek w oknie.',

  /* ---- workspace switcher ---- */
  'Demo': 'Demo',
  'My project': 'Mój projekt',
  'your research from the connected folder': 'twoje badania z podłączonego folderu',
  'your real project — empty until research lands (drafts live here too)':
    'twój prawdziwy projekt — pusty, dopóki nie wpadną badania (szkice też tu mieszkają)',
  'example dataset — a fully editable sandbox (this browser only), never mixes with your work':
    'zestaw przykładowy — w pełni edytowalna piaskownica (tylko w tej przeglądarce), nigdy nie miesza się z twoją pracą',
  '📂 Connect your project folder…': '📂 Podłącz folder swojego projektu…',
  'Discard the sandbox edits stored in this browser and restore the shipped example set':
    'Odrzuć zmiany z piaskownicy zapisane w tej przeglądarce i przywróć fabryczny zestaw przykładowy',

  /* ---- toasts ---- */
  'No .md files found': 'Nie znaleziono plików .md',
  'No entity .md files found in that folder': 'W tym folderze nie ma plików .md z elementami grafu',
  'No file has valid frontmatter (type: Persona / Signal / …)':
    'Żaden plik nie ma poprawnego frontmattera (type: Persona / Signal / …)',
  'Permission declined — the folder stays disconnected': 'Odmowa dostępu — folder pozostaje niepodłączony',
  'That folder is gone — pick it again': 'Tego folderu już nie ma — wskaż go jeszcze raz',
  'Connecting a folder needs Chrome or Edge': 'Podłączenie folderu wymaga Chrome’a lub Edge’a',
  'Saving needs Chrome or Edge (File System Access API)':
    'Zapis wymaga Chrome’a lub Edge’a (File System Access API)',
  'Write permission denied': 'Brak zgody na zapis',
  'Order ideas by votes (request board) or A–Z': 'Sortuj pomysły wg głosów (tablica zgłoszeń) albo A–Z',

  'Stopped — that folder is enormous': 'Przerwano — ten folder jest ogromny'
};

/* Polish counts three ways where English counts two — 1 plik, 2–4 pliki,
   5+ plików, and the teens go with the last. Getting this wrong is the fastest
   way to make an interface feel machine-made, so counted strings pass through
   here instead of through a bare lookup. */
function plForm(n, one, few, many){
  const n10 = n % 10, n100 = n % 100;
  if(n === 1) return one;
  if(n10 >= 2 && n10 <= 4 && !(n100 >= 12 && n100 <= 14)) return few;
  return many;
}
function trn(n, en1, enN, pl1, plFew, plMany){
  const s = LANG==='pl' ? plForm(n, pl1, plFew, plMany) : (n===1 ? en1 : enN);
  return s.split('{n}').join(n);
}
/* Just the word, no number in front — for chips and labels that render the
   count separately (the Mind Map's stat chips do exactly this). */
/* Polish counts things in the genitive: "4 konkurentów", not "4 konkurenci".
   The nav labels are nominative plurals, so counted phrases use this instead. */
const PL_TYPE_GEN = {
  All:'elementów', Persona:'person', Archetype:'archetypów', Signal:'sygnałów',
  Evidence:'dowodów', Hypothesis:'hipotez', IdeaForImprovement:'pomysłów',
  Competitor:'konkurentów', Transcript:'transkrypcji'
};
function typeCounted(type, n){
  if(LANG==='pl') return n + ' ' + (PL_TYPE_GEN[type] || tr(TYPES[type] ? TYPES[type].label : type).toLowerCase());
  return n + ' ' + (type==='All' ? plw(n,'entity','entities') : tr(TYPES[type].label).toLowerCase());
}
function plw(n, en1, enN, pl1, plFew, plMany){
  return LANG==='pl' ? plForm(n, pl1, plFew, plMany) : (n===1 ? en1 : enN);
}
/* ---------- the language a copied prompt should be ANSWERED in ----------
   The prompts themselves stay English on purpose: they name English file paths,
   frontmatter fields and skill names, and an agent follows those most reliably
   written the way they exist on disk. What the interface language decides is the
   language of the REPLY — so a Polish user gets a Polish conversation without
   the instruction losing its footing. Appended to everything the app puts on the
   clipboard or into a downloaded .md. */
function promptLang(){
  if(LANG!=='pl') return '';
  return '\n\nODPOWIADAJ PO POLSKU: cała rozmowa, pytania, podsumowania i teksty, które proponujesz zapisać do plików, mają być po polsku.'
    + ' Nie tłumacz nazw plików, folderów, pól frontmattera ani komend (np. /extract-findings, retrieved:, type:) — zostają dokładnie takie, jakie są.'
    + ' Wypowiedzi uczestników cytuj w języku, w którym padły — cytat to dane.';
}
function tr(s){
  if(LANG!=='pl') return s;
  const k = String(s==null ? '' : s).trim();
  return PL[k] !== undefined ? PL[k] : s;   // no translation: English, never a guess
}

/* Static markup carries its own English source in the attribute, so a key is
   readable at the call site and whitespace in the HTML can never break a
   lookup. `data-i18n` swaps innerHTML (some strings carry <b>/<code>),
   `-ph` a placeholder, `-title` a tooltip, `-aria` a label. */
function applyLangDom(root){
  const scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach(el=>{ el.innerHTML = tr(el.dataset.i18n); });
  scope.querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.placeholder = tr(el.dataset.i18nPh); });
  scope.querySelectorAll('[data-i18n-title]').forEach(el=>{ el.title = tr(el.dataset.i18nTitle); });
  scope.querySelectorAll('[data-i18n-aria]').forEach(el=>{ el.setAttribute('aria-label', tr(el.dataset.i18nAria)); });
}

/* Switching re-renders in place rather than reloading: a reload would drop the
   connected folder and make the user grant permission again just to read a
   different label. */
function setLang(l){
  LANG = l==='pl' ? 'pl' : 'en';
  store.set('at-lang', LANG);
  document.documentElement.lang = LANG;
  document.querySelectorAll('.lang-opt').forEach(b=> b.classList.toggle('on', b.dataset.lang===LANG));
  applyLangDom();
  if(typeof topnavSync==='function') topnavSync();
  /* The welcome is checked before anything else and returns early: it covers the
     whole screen on first run, so re-rendering the views underneath it would be
     work nobody can see. `WC_STEP` is untouched, so the switch keeps your place. */
  if(typeof WELCOME_ACTIVE!=='undefined' && WELCOME_ACTIVE){ renderWelcome(); return; }
  if(typeof PROJECTS_ACTIVE!=='undefined' && PROJECTS_ACTIVE) renderProjects();
  if(typeof renderWsMenu==='function') renderWsMenu();
  if(typeof renderTabs==='function') renderTabs();
  if(typeof renderBacklogCount==='function') renderBacklogCount();
  if(typeof MINDMAP_ACTIVE!=='undefined' && MINDMAP_ACTIVE) renderMindMap();
  else if(typeof DASHBOARD_ACTIVE!=='undefined' && DASHBOARD_ACTIVE) renderDashboard();
  else if(typeof BACKLOG_ACTIVE!=='undefined' && BACKLOG_ACTIVE) renderBacklog();
  else if(typeof HELP_ACTIVE!=='undefined' && HELP_ACTIVE) helpEnter(typeof HELP_CAT!=='undefined' ? HELP_CAT : null);
  else if(typeof SETTINGS_ACTIVE!=='undefined' && SETTINGS_ACTIVE) renderSettings();
  else if(typeof renderGrid==='function'){ renderGrid(searchInput.value); if(typeof updatePageHead==='function') updatePageHead(); }
  if(typeof CURRENT!=='undefined' && CURRENT && typeof openDetail==='function'
     && document.getElementById('detailView').classList.contains('active')) openDetail(CURRENT);
}
