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
   No name on file is not a blank avatar — it is A, for anonymous, because the
   app works perfectly well without ever being told who you are. */
function topnavInitials(){
  const who = String((typeof PREFS !== 'undefined' && PREFS.name) || '').trim();
  if(!who) return 'A';
  return (typeof initialsFor === 'function' ? initialsFor(who) : who[0].toUpperCase()).slice(0,2);
}
function topnavSync(){
  if(!avatarBtn) return;
  const who = String((typeof PREFS !== 'undefined' && PREFS.name) || '').trim();
  const ini = topnavInitials();
  document.getElementById('avatarInitials').textContent = ini;
  document.getElementById('avatarInitials2').textContent = ini;
  document.getElementById('avatarName').textContent = who || tr('Anonymous');
  const ws = document.getElementById('avatarWs');
  ws.textContent = typeof WS !== 'undefined'
    ? tr(WS === 'demo' ? 'Demo workspace' : 'your project workspace') : '';
  avatarBtn.title = who || tr('Anonymous');
}
function topnavOpen(on){
  if(!avatarMenu) return;
  if(on) topnavSync();
  avatarMenu.style.display = on ? 'flex' : 'none';
  avatarBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
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
