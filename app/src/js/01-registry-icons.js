/* ---------- type registry (icons: 1.5px-stroke geometric marks) ---------- */
/* Entity icons — Feather Icons (MIT, feathericons.com), inlined so the app
   stays offline. Keep each string starting with the exact width/height attrs:
   the mind map rescales them by replacing that prefix. */
/* Tabler Icons (outline, MIT — tabler.io/icons), inlined: the app loads nothing remote.
   Signal = ear (heard), Evidence = book (read), Hypothesis = flask (a bet to test). */
const ICONS = {
  Persona: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/></svg>',
  Competitor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M7 12a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/></svg>',
  Archetype: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.192 9h6.616a2 2 0 0 1 1.992 2.183l-.567 6.182a4 4 0 0 1 -3.983 3.635h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183"/><path d="M15 13h.01"/><path d="M18 13h.01"/><path d="M15 16.5c1 .667 2 .667 3 0"/><path d="M8.632 15.982a4.037 4.037 0 0 1 -.382 .018h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183h6.616a2 2 0 0 1 2 2"/><path d="M6 8h.01"/><path d="M9 8h.01"/><path d="M6 12c.764 -.51 1.528 -.63 2.291 -.36"/></svg>',
  Hypothesis: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3l6 0"/><path d="M10 9l4 0"/><path d="M10 3v6l-4 11a.7 .7 0 0 0 .5 1h11a.7 .7 0 0 0 .5 -1l-4 -11v-6"/></svg>',
  Signal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 10a7 7 0 1 1 13 3.6a10 10 0 0 1 -2 2a8 8 0 0 0 -2 3a4.5 4.5 0 0 1 -6.8 1.4"/><path d="M10 10a3 3 0 1 1 5 2.2"/></svg>',
  Evidence: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12"/><path d="M19 16h-12a2 2 0 0 0 -2 2"/><path d="M9 8h6"/></svg>',
  IdeaForImprovement: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"/><path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"/><path d="M9.7 17l4.6 0"/></svg>',
  Transcript: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/><path d="M9 9l1 0"/><path d="M9 13l6 0"/><path d="M9 17l6 0"/></svg>'
};
/* Archetype icons — hand-drawn object scenes (Notion-ish line style, Fallout-skill-like
   illustration, played straight). Referenced from an Archetype's frontmatter `icon:`. */
const ARCH_ICONS = {
  'headphones-mug': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="19" y="27" width="23" height="21" rx="4"/><path d="M42 33h4a5 5 0 0 1 0 10h-4"/><path d="M14 29c0-11 8-19 18-19s18 8 18 19"/><rect x="9" y="28" width="9" height="14" rx="4"/><rect x="46" y="28" width="9" height="14" rx="4"/><path d="M25 36h11M25 41h7"/></svg>',
  'drifting-shuffle': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h11c6 0 8 4 11 10s5 10 11 10h9"/><path d="M8 42h11c6 0 8-4 11-10s5-10 11-10h9"/><path d="M45 16l6 6-6 6"/><path d="M45 36l6 6-6 6"/><path d="M27 12c4 2 5 6 3 9"/><path d="M32 17l-3 5-5-3"/></svg>',
  'record-crate': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M13 30a9 9 0 0 1 17 0"/><path d="M25 28a9 9 0 0 1 17 0"/><path d="M37 30a8 8 0 0 1 15 0"/><rect x="10" y="30" width="44" height="21" rx="3"/><path d="M10 37h44"/><path d="M25 44h14"/></svg>',
  'wheel-voice': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="25" cy="39" r="15"/><circle cx="25" cy="39" r="4.5"/><path d="M10.5 39h10M29.5 39h10M25 43.5V53"/><path d="M39 8h15a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-5l-6 6v-6h-4a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4z"/><path d="M43 18v-4M47.5 20v-8M52 18v-4"/></svg>',
  'radio-waves': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="26" width="34" height="24" rx="4"/><circle cx="21" cy="38" r="6"/><path d="M33 34h6M33 41h6"/><path d="M13 26 24 14"/><path d="M48 31c4 4 4 10 0 14"/><path d="M54 27c6 6 6 16 0 22"/></svg>',
  'shared-mixtape': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="24" width="44" height="26" rx="4"/><circle cx="24" cy="36" r="4"/><circle cx="40" cy="36" r="4"/><path d="M28 36h8"/><path d="M17 50l4-7h22l4 7"/><path d="M20 14c7-6 17-6 24 0"/><path d="M42 9l4 4-5 3"/></svg>',
  'balance-scale': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M32 14v32"/><circle cx="32" cy="12" r="2.5"/><path d="M18 16h28"/><path d="M18 16l-7 14M18 16l7 14"/><path d="M11 30a7 7 0 0 0 14 0"/><path d="M46 16l-7 14M46 16l7 14"/><path d="M39 30a7 7 0 0 0 14 0"/><path d="M23 52h18"/></svg>'
};
/* Key order = sidebar tab order + All-view section order: who we serve
   (Personas, Competitors), what we believe (Archetypes, Hypotheses), what we
   know (Signals, Evidence), what we'll do (Ideas), and the raw material last. */
const TYPES = {
  Persona:            { key:'Persona',    label:'Personas',    singular:'Persona',    folder:'Personas'   },
  Competitor:         { key:'Competitor', label:'Competitors', singular:'Competitor', folder:'Competitors'},
  Archetype:          { key:'Archetype',  label:'Archetypes',  singular:'Archetype',  folder:'Archetypes' },
  Hypothesis:         { key:'Hypothesis', label:'Hypotheses',  singular:'Hypothesis', folder:'Hypotheses' },
  Signal:             { key:'Signal',     label:'Signals',     singular:'Signal',     folder:'Signals'    },
  Evidence:           { key:'Evidence',   label:'Evidence',    singular:'Evidence',   folder:'Evidence'   },
  IdeaForImprovement: { key:'Idea',       label:'Ideas',       singular:'Idea',       folder:'Ideas'      },
  Transcript:         { key:'Transcript', label:'Transcripts', singular:'Transcript', folder:'Transcripts'}
};
const TYPE_ORDER = Object.keys(TYPES);
function initialsFor(n){ return n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }

/* The tag pill — the one chip every card, table cell and hero reuses. One
   builder so a tag paints the same everywhere (escaped, same class), and the
   `.tags` row that holds a list of them. Storybook documents both. */
function tagHtml(label, cls){ return `<span class="tag${cls?' '+cls:''}">${esc(label)}</span>`; }
function tagsHtml(items, lead){ // lead: extra markup that goes first in the row (a count chip, a proximity chip…)
  const list = (items||[]).map(t=>tagHtml(t)).join('');
  return list || lead ? `<div class="tags">${lead||''}${list}</div>` : '';
}

/* markdown links — URL may contain one level of balanced parentheses
   (e.g. Ideas/Idea1 Quick-skip mode (Smart Skip).md), which the naive
   [^)]+ pattern truncated at the first ')' and broke resolution */
const MD_LINK = /\[([^\]]*)\]\(((?:[^()]|\([^()]*\))*)\)/g;
/* Team highlights (Dovetail-style): ==fragment=={tag1, tag2} inline in the
   source .md — single line, tags optional. Human-readable, grep-able, and the
   AI reads them as researcher-prioritized moments. Aggregated per file into
   `highlight_tags:` frontmatter for cheap triage. */
const HL_RE = /==([^\n]+?)==(?:\{([^}\n]*)\})?/g;
function hlTagsParse(raw){ return String(raw||'').split(',').map(t=>t.trim()).filter(Boolean); }

