/* ---------- type registry (icons: 1.5px-stroke geometric marks) ---------- */
/* Entity icons — Feather Icons (MIT, feathericons.com), inlined so the app
   stays offline. Keep each string starting with the exact width/height attrs:
   the mind map rescales them by replacing that prefix. */
const ICONS = {
  Persona: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  Competitor: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  Archetype: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  Hypothesis: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  Signal: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  Evidence: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  IdeaForImprovement: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  Transcript: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
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

