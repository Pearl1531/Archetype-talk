/* ---------- Account nav (top right) ----------
   The one piece of chrome that never moves: an initials avatar over a small
   menu holding language, Export .md and Exit. The buttons themselves keep the
   ids they had in the left rail (`exportBtn`, `exitBtn`, `.lang-opt`), so the
   handlers that own them elsewhere are untouched — this file only draws who
   you are and opens and closes the menu. */
const topNavEl = document.getElementById('topNav');
const avatarBtn = document.getElementById('avatarBtn');
const avatarMenu = document.getElementById('avatarMenu');

/* Initials, the way a person would write them: "Mateusz Jędraszczyk" → MJ.
   No name on file gets a person glyph, not a letter: a lone "A" in the corner
   reads as someone else's account, and the app works fine without a name. */
function topnavInitials(){
  const who = String((typeof PREFS !== 'undefined' && PREFS.name) || '').trim();
  if(!who) return 'A';
  return (typeof initialsFor === 'function' ? initialsFor(who) : who[0].toUpperCase()).slice(0,2);
}
function topnavSync(){
  if(!avatarBtn) return;
  const who = String((typeof PREFS !== 'undefined' && PREFS.name) || '').trim();
  const ini = topnavInitials();
  ['avatarInitials','avatarInitials2'].forEach(id=>{
    const el = document.getElementById(id);
    if(who) el.textContent = ini; else el.innerHTML = ICONS.Persona;
  });
  document.getElementById('avatarName').textContent = who || tr('Anonymous');
  const ws = document.getElementById('avatarWs');
  ws.textContent = typeof WS !== 'undefined'
    ? tr(WS === 'demo' ? 'Demo workspace' : 'your project workspace') : '';
  avatarBtn.title = (who ? who + ' — ' : '') + tr('Menu: language, export, exit');
}
function topnavOpen(on){
  if(!avatarMenu) return;
  if(on) topnavSync();
  avatarMenu.style.display = on ? 'flex' : 'none';
  avatarBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
}
/* Back + trail, for the pages below the rail — an entity (openDetail) and its
   poster (posterOpen). The rail can't say where you are there, so the bar does:
   ← Back · Project › Section › Page, every crumb but the last a door.
   Back walks the browser history while there is in-app history to walk
   (`history.state.d`, stamped by the router), and goes one level up otherwise —
   so a page opened from a link or a reload never backs out of the app.
   CSS shows the trail only under body.detail-open / body.poster-open. */
function navTrail(items, up){
  const nav = document.getElementById('navTrail'); if(!nav) return;
  const proj = { label: document.getElementById('wsLabel')?.textContent || tr('Project'), go: ()=>{ location.hash = 'dashboard'; } };
  const all = [proj, ...items];
  nav.innerHTML = `<button type="button" class="nav-back" title="${esc(tr('Back'))} (Esc)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span>${tr('Back')}</span></button>
    <ol>${all.map((c,i)=> i < all.length-1
      ? `<li><button type="button" class="nav-crumb" data-i="${i}">${esc(c.label)}</button></li>`
      : `<li><span class="nav-here" aria-current="page" title="${esc(c.label)}">${esc(c.label)}</span></li>`).join('')}</ol>`;
  nav.querySelector('.nav-back').onclick = ()=> navBack(up);
  nav.querySelectorAll('.nav-crumb').forEach(b=> b.onclick = ()=> all[+b.dataset.i].go());
}
function navBack(up){
  if((history.state && history.state.d) > 0) history.back(); else up();
}

/* The detail page is the one view that drops the left rail, and the bar is
   pinned to where that rail ends — so it has to know. Watching the class the
   view already toggles beats adding a call to the seven places that toggle it. */
if(typeof detailView !== 'undefined' && detailView){
  const syncDetail = ()=> document.body.classList.toggle('detail-open', detailView.classList.contains('active'));
  new MutationObserver(syncDetail).observe(detailView, { attributes: true, attributeFilter: ['class'] });
  syncDetail();
}

if(avatarBtn){
  avatarBtn.onclick = e => { e.stopPropagation(); topnavOpen(avatarMenu.style.display === 'none'); };
  // clicking an action closes the sheet; the action's own handler still runs
  avatarMenu.addEventListener('click', e => { if(e.target.closest('.topnav-item')) topnavOpen(false); });
  document.addEventListener('click', e => { if(!e.target.closest('#topNav')) topnavOpen(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') topnavOpen(false); });
  topnavSync();
}
