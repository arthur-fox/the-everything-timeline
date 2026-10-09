/**
 * Day 44 — Phase 4c item 4 (showing uncertainty), step 4.1: confidence data.
 *
 * Every shape the globe draws carries a confidence level with a short reason:
 *   - documented:  the border is known from treaties, surveys or administrative records, and our
 *                  shape follows it (the Natural Earth nations layer, 1815–2025).
 *   - approximate: the state or people really held roughly this area, but the edge is uncertain
 *                  (frontier zones, claims wider than control) or our outline is hand-drawn.
 *   - conjectural: the area is inferred — from archaeology, the later spread of languages, or a
 *                  handful of sources — and the outline is a reasoned guess.
 *
 * Defaults go by layer, era and source (the roadmap's rule: Day 38 nations documented, ancient
 * spheres approximate, most prehistoric peoples conjectural). Per-entity overrides below cover
 * the cases where the default would overstate (or understate) what is known. An entity or an
 * overlay keyframe can also carry its own `confidence: { level, reason }` (overlay wins).
 * `scripts/check-confidence.js` makes sure every shape in every year resolves to a valid level
 * with a reason.
 */

export const CONFIDENCE_LEVELS = ['documented', 'approximate', 'conjectural'];

export const CONFIDENCE_LABEL = {
  documented: 'Documented',
  approximate: 'Approximate',
  conjectural: 'Conjectural',
};

/** One line for the key / detail panel: how the level is drawn. */
export const CONFIDENCE_DRAWING = {
  documented: 'crisp solid edge',
  approximate: 'softer edge, fill fades towards it',
  conjectural: 'dotted edge, fill fades out well inside it',
};

const R = {
  bronzeAge:
    'Bronze Age extent reconstructed from scattered sites, texts and later accounts; the outline is a guess at its reach.',
  ancientState:
    'Hand-drawn from historical atlases. Ancient and medieval states had frontier zones and tribute lands, not surveyed borders.',
  earlyModernState:
    'Hand-drawn from historical atlases. The real borders are better known than this rough outline, and claims were often wider than control.',
  colonialSphere: 'A colonial sphere: claims on paper ran far beyond the coasts and towns actually held.',
  peoplesPrehistoric:
    'Before written records: inferred from archaeology and the later spread of languages. Edges blur into neighbours.',
  peoplesEarly:
    'Known mostly from outsiders’ accounts and archaeology; peoples overlapped and moved, so the edge is a reasoned guess.',
  peoplesModern:
    'From ethnographic and language maps; mixed and moving populations are simplified into one area.',
  presenceEarly:
    'Where people lived is estimated from archaeological sites and population reconstructions; the footprint is a guess.',
  presenceModern:
    'Estimated from historical population and settlement maps, simplified to a soft footprint.',
  nation: 'Real borders: Natural Earth provinces regrouped by dated treaties, annexations and independence dates.',
  nation19c:
    'Real borders: Natural Earth provinces regrouped by dated treaties. Where a 19th-century line cut across a modern province it follows the province instead.',
  africanClaim:
    'A colonial claim drawn at roughly its final extent. Real control of the interior often came 10–30 years later, and inland lines were barely surveyed.',
};

/**
 * Hand-drawn polities whose default (approximate) would overstate what is known: states known
 * mostly from archaeology or later legend, or loose networks rather than territories.
 */
const ENTITY_OVERRIDES = {
  mesopotamia: { level: 'conjectural', reason: 'A shifting world of city-states and short-lived empires; the shape is a sphere of influence, not a border.' },
  phoenicia: { level: 'conjectural', reason: 'A network of coastal trading cities and colonies, not a territorial state; the inland edge is a guess.' },
  olmec: { level: 'conjectural', reason: 'Known only from archaeology (no readable texts); the area is where Olmec-style sites cluster.' },
  'shang-china': { level: 'conjectural', reason: 'Oracle-bone texts cover the royal core; how far Shang power reached beyond it is debated.' },
  'great-zimbabwe': { level: 'conjectural', reason: 'Known from stone ruins and trade goods; the extent of the state is inferred from related sites.' },
  mississippian: { level: 'conjectural', reason: 'A culture of mound-building chiefdoms known from archaeology; not one state, and the edge is inferred.' },
  toltec: { level: 'conjectural', reason: 'Largely known through later Aztec tradition; its real extent is disputed by archaeologists.' },
  'ghana-empire-ov': { level: 'conjectural', reason: 'Known from a few Arabic travellers’ accounts and archaeology; its extent is uncertain.' },
  'viking-age': { level: 'approximate', reason: 'Homelands plus settlements and raided coasts; Norse presence abroad was patchy.' },
  'ancient-egypt': { level: 'approximate', reason: 'The Nile valley core is well attested; the reach into Nubia and the Levant changed often and is drawn roughly.' },
  'colonial-americas': { level: 'approximate', reason: R.colonialSphere },
};

/** ISO 3166 alpha-3 (admin-0) and alpha-2 (admin-1 prefix) codes for Africa. */
const AFRICA_A3 = new Set(
  ('DZA AGO BEN BWA BFA BDI CMR CPV CAF TCD COM COD COG CIV DJI EGY GNQ ERI ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY ' +
    'MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM ZAF SSD SDN SWZ TZA TGO TUN UGA ZMB ZWE ESH SOL SAH')
    .split(' '),
);
const AFRICA_A2 = new Set(
  ('DZ AO BJ BW BF BI CM CV CF TD KM CD CG CI DJ EG GQ ER ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE ' +
    'NG RW ST SN SC SL SO ZA SS SD SZ TZ TG TN UG ZM ZW EH').split(' '),
);

function isAfricanUnit(token) {
  const t = String(token || '').replace(/^-/, '');
  if (!t) return false;
  if (AFRICA_A3.has(t)) return true;
  const m = /^([A-Z]{2})-/.exec(t);
  return Boolean(m && AFRICA_A2.has(m[1]));
}

/** First positive unit token of a nations period (`units` is a space-separated list). */
function firstUnit(units) {
  for (const tok of String(units || '').split(/\s+/)) if (tok && !tok.startsWith('-')) return tok;
  return '';
}

// Notes in the nations tables that admit an approximate line ("… not split out", "claimed …").
const APPROX_NOTE = /not split|approximat|\bclaim(?:ed|s)?\b|interior was|conquered only|not drawn/i;
const NOT_A_LINE_NOTE = /claimed independence|claimed by the/i;
// Finland's "Karelia lost in 1940/1944 is not split out": the shape is right again from 1945.
const NOTE_UNTIL = { finland: 1944 };

function valid(c) {
  return c && CONFIDENCE_LEVELS.includes(c.level) && typeof c.reason === 'string' && c.reason.trim().length > 0;
}

/**
 * Confidence for a hand-drawn shape (polity, people or presence) at `year`.
 * @param {{ id: string, type: string, confidence?: { level: string, reason: string } }} entity
 * @param {number} year
 * @param {{ confidence?: { level: string, reason: string } }} [overlay] nearest keyframe
 * @returns {{ level: 'documented'|'approximate'|'conjectural', reason: string, source: string }}
 */
export function confidenceForEntity(entity, year, overlay = null) {
  if (valid(overlay?.confidence)) return { ...overlay.confidence, source: 'overlay' };
  if (valid(entity?.confidence)) return { ...entity.confidence, source: 'entity' };
  const y = Number(year);
  const type = entity?.type;
  if (type === 'people') {
    if (y < -500) return { level: 'conjectural', reason: R.peoplesPrehistoric, source: 'default' };
    if (y < 1500) return { level: 'conjectural', reason: R.peoplesEarly, source: 'default' };
    return { level: 'approximate', reason: R.peoplesModern, source: 'default' };
  }
  if (type === 'presence') {
    if (y < 1500) return { level: 'conjectural', reason: R.presenceEarly, source: 'default' };
    return { level: 'approximate', reason: R.presenceModern, source: 'default' };
  }
  const o = ENTITY_OVERRIDES[entity?.id];
  if (o) return { ...o, source: 'override' };
  if (y < -1200) return { level: 'conjectural', reason: R.bronzeAge, source: 'default' };
  if (y < 1500) return { level: 'approximate', reason: R.ancientState, source: 'default' };
  return { level: 'approximate', reason: R.earlyModernState, source: 'default' };
}

/**
 * Confidence for a nations-layer period (1815–2025) at `year` (a colony's claim-era years can be
 * approximate while the same period after 1914 is documented).
 * @param {{ from: number, to: number|null, kind?: string, units: string, note?: string }} period
 * @param {number} [year]
 * @param {string} [entityId] nations table id (for NOTE_UNTIL)
 */
export function confidenceForNationPeriod(period, year = period?.from, entityId = null) {
  if (!period) return { level: 'documented', reason: R.nation, source: 'default' };
  if (valid(period.confidence)) return { ...period.confidence, source: 'period' };
  const note = typeof period.note === 'string' ? period.note.trim() : '';
  const kind = period.kind || 'state';
  // A 19th-century note's caveat lasts until the latest year it mentions (at least 1913), since
  // those periods often run on past 1914 with lines that are fine by then; a 20th-century note
  // covers its whole period, except where NOTE_UNTIL says when the caveat stops mattering.
  // Disputed areas and declared-but-unrecognised states have known lines, so they stay documented.
  if (note && kind !== 'disputed' && APPROX_NOTE.test(note) && !NOT_A_LINE_NOTE.test(note)) {
    const years = (note.match(/\b1[89]\d\d\b|\b20[0-2]\d\b/g) || []).map(Number);
    const until = NOTE_UNTIL[entityId] ?? (period.from >= 1914 ? Infinity : Math.max(1913, ...years));
    if (Number(year) <= until) return { level: 'approximate', reason: `Approximate line: ${note}`, source: 'note' };
  }
  if (kind === 'colony' && period.from >= 1880 && period.from < 1914 && Number(year) < 1914 && isAfricanUnit(firstUnit(period.units))) {
    return { level: 'approximate', reason: R.africanClaim, source: 'default' };
  }
  return { level: 'documented', reason: period.from < 1914 ? R.nation19c : R.nation, source: 'default' };
}

export { ENTITY_OVERRIDES as CONFIDENCE_ENTITY_OVERRIDES, valid as isValidConfidence };
