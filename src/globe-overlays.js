/**
 * Historical overlay spatial entities (Phase 4 / PR C).
 *
 * Foundational seed data only — named region references + optional bbox
 * placeholders. Precise empire polygons are deferred to PR D.
 * Overlays are approximate; do not invent exact ancient borders.
 */

/** @typedef {'empire' | 'civilization' | 'state' | 'other'} SpatialEntityType */
/** @typedef {'rough' | 'simplified' | 'schematic'} ApproximationLevel */

/**
 * @typedef {Object} RegionRef
 * @property {string} id
 * @property {string} [name]
 * @property {[number, number, number, number]} [bbox] west,south,east,north degrees
 */

/**
 * @typedef {Object} OverlaySnapshot
 * @property {number} year
 * @property {string} [label]
 * @property {ApproximationLevel} approximation
 * @property {(string|RegionRef)[]} regions
 */

/**
 * @typedef {Object} SpatialEntity
 * @property {string} id
 * @property {string} name
 * @property {string} color
 * @property {SpatialEntityType} type
 * @property {string} description
 * @property {number[]} [keyYears]
 * @property {OverlaySnapshot[]} overlays
 * @property {string[]} [timelineItemIds]
 * @property {{ title: string, url: string }[]} [sources]
 */

/** @type {SpatialEntity[]} */
export const spatialEntities = [
  {
    id: 'roman-empire',
    name: 'Roman Empire',
    color: '#DC2626',
    type: 'empire',
    description:
      'A major Mediterranean empire centered on Rome. At its height under Trajan it spanned three continents.',
    keyYears: [-27, 117, 395, 476],
    overlays: [
      {
        year: -27,
        label: 'Principate begins (Augustus)',
        approximation: 'rough',
        regions: [
          { id: 'italy', name: 'Italy', bbox: [6.5, 36.5, 18.5, 47] },
          { id: 'mediterranean', name: 'Mediterranean basin', bbox: [-10, 30, 37, 46] },
        ],
      },
      {
        year: 117,
        label: 'Height under Trajan',
        approximation: 'rough',
        regions: [
          { id: 'mediterranean', name: 'Mediterranean basin', bbox: [-10, 24, 45, 56] },
          { id: 'italy', name: 'Italy' },
          { id: 'near-east', name: 'Near East fringe', bbox: [35, 30, 48, 42] },
        ],
      },
      {
        year: 395,
        label: 'East–West division',
        approximation: 'schematic',
        regions: [
          { id: 'mediterranean', name: 'Mediterranean basin', bbox: [-10, 30, 40, 48] },
        ],
      },
    ],
    timelineItemIds: ['roman-empire', 'roman-conquest'],
    sources: [
      { title: 'Wikipedia — Roman Empire', url: 'https://en.wikipedia.org/wiki/Roman_Empire' },
    ],
  },
  {
    id: 'han-china',
    name: 'Han China',
    color: '#CA8A04',
    type: 'empire',
    description:
      'Golden-age Chinese empire that consolidated imperial administration and opened Silk Road exchange.',
    keyYears: [-206, 2, 220],
    overlays: [
      {
        year: -141,
        label: 'Western Han expansion (Wu)',
        approximation: 'rough',
        regions: [
          { id: 'north-china', name: 'North China plain', bbox: [105, 30, 122, 42] },
          { id: 'central-china', name: 'Central China', bbox: [102, 25, 120, 35] },
        ],
      },
      {
        year: 2,
        label: 'Western Han census peak',
        approximation: 'simplified',
        regions: [
          { id: 'china-proper', name: 'China proper (approx.)', bbox: [100, 22, 122, 42] },
          { id: 'tarim', name: 'Tarim / Silk Road fringe', bbox: [75, 36, 95, 43] },
        ],
      },
      {
        year: 100,
        label: 'Eastern Han',
        approximation: 'schematic',
        regions: [
          { id: 'china-proper', name: 'China proper (approx.)', bbox: [102, 22, 122, 41] },
        ],
      },
    ],
    timelineItemIds: ['han-dynasty'],
    sources: [
      { title: 'Wikipedia — Han dynasty', url: 'https://en.wikipedia.org/wiki/Han_dynasty' },
    ],
  },
  {
    id: 'mongol-empire',
    name: 'Mongol Empire',
    color: '#7C3AED',
    type: 'empire',
    description:
      'Largest contiguous land empire in history, founded by Genghis Khan; linked East and West along the Silk Road.',
    keyYears: [1206, 1279, 1368],
    overlays: [
      {
        year: 1227,
        label: 'At Genghis Khan’s death',
        approximation: 'rough',
        regions: [
          { id: 'mongolia', name: 'Mongolia / steppe core', bbox: [87, 42, 120, 52] },
          { id: 'central-asia', name: 'Central Asia', bbox: [50, 35, 80, 48] },
        ],
      },
      {
        year: 1279,
        label: 'Yuan peak under Kublai',
        approximation: 'rough',
        regions: [
          { id: 'eurasian-steppe', name: 'Eurasian steppe belt', bbox: [30, 35, 135, 55] },
          { id: 'china-proper', name: 'China under Yuan', bbox: [100, 20, 125, 42] },
          { id: 'persia', name: 'Ilkhanate Persia', bbox: [44, 25, 65, 40] },
        ],
      },
    ],
    timelineItemIds: ['mongol-empire', 'mongol-conquests'],
    sources: [
      { title: 'Wikipedia — Mongol Empire', url: 'https://en.wikipedia.org/wiki/Mongol_Empire' },
    ],
  },
  {
    id: 'abbasid-caliphate',
    name: 'Abbasid Caliphate',
    color: '#059669',
    type: 'empire',
    description:
      'Islamic caliphate centered on Baghdad; a major scholarly and commercial power across the Middle East and beyond.',
    keyYears: [750, 800, 1258],
    overlays: [
      {
        year: 800,
        label: 'High Abbasid period',
        approximation: 'rough',
        regions: [
          { id: 'mesopotamia', name: 'Mesopotamia', bbox: [38, 30, 48, 37] },
          { id: 'levant', name: 'Levant', bbox: [34, 30, 42, 37] },
          { id: 'egypt', name: 'Egypt', bbox: [25, 22, 35, 32] },
          { id: 'persia', name: 'Iran / Persia', bbox: [44, 25, 62, 40] },
        ],
      },
      {
        year: 900,
        label: 'Fragmenting caliphal world',
        approximation: 'schematic',
        regions: [
          { id: 'mesopotamia', name: 'Mesopotamia', bbox: [38, 30, 48, 37] },
          { id: 'persia', name: 'Iran / Persia', bbox: [44, 25, 62, 40] },
        ],
      },
    ],
    timelineItemIds: ['abbasid-caliphate'],
    sources: [
      {
        title: 'Wikipedia — Abbasid Caliphate',
        url: 'https://en.wikipedia.org/wiki/Abbasid_Caliphate',
      },
    ],
  },
  {
    id: 'inca-empire',
    name: 'Inca Empire',
    color: '#EA580C',
    type: 'empire',
    description:
      'Andean empire stretching along the western spine of South America before Spanish conquest.',
    keyYears: [1438, 1527, 1533],
    overlays: [
      {
        year: 1527,
        label: 'Late Inca extent (approx.)',
        approximation: 'rough',
        regions: [
          { id: 'andes', name: 'Andean corridor', bbox: [-81, -22, -68, 2] },
          { id: 'peru', name: 'Peru highlands', bbox: [-80, -18, -69, -3] },
        ],
      },
    ],
    timelineItemIds: ['inca'],
    sources: [
      { title: 'Wikipedia — Inca Empire', url: 'https://en.wikipedia.org/wiki/Inca_Empire' },
    ],
  },
];

/** Years within this window of an overlay/keyYear count as “active” for the scrubber list. */
export const OVERLAY_ACTIVE_WINDOW = 80;

/**
 * Format a CE/BCE year for display.
 * @param {number} year
 */
export function formatOverlayYear(year) {
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) return '';
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return '1 BCE / 1 CE';
  return `${y.toLocaleString()} CE`;
}

/**
 * Entities whose nearest overlay (or keyYear) is within OVERLAY_ACTIVE_WINDOW of `year`.
 * @param {number} year
 * @param {SpatialEntity[]} [entities]
 * @returns {{ entity: SpatialEntity, overlay: OverlaySnapshot|null, distance: number }[]}
 */
export function getActiveOverlaysAtYear(year, entities = spatialEntities) {
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) return [];

  const results = [];
  for (const entity of entities) {
    let bestOverlay = null;
    let bestDist = Infinity;

    for (const overlay of entity.overlays || []) {
      const d = Math.abs(overlay.year - y);
      if (d < bestDist) {
        bestDist = d;
        bestOverlay = overlay;
      }
    }

    // A closer keyYear alone still activates the entity (without overlay label).
    for (const keyYear of entity.keyYears || []) {
      const d = Math.abs(keyYear - y);
      if (d < bestDist) {
        bestDist = d;
        bestOverlay = null;
      }
    }

    if (bestDist <= OVERLAY_ACTIVE_WINDOW) {
      results.push({ entity, overlay: bestOverlay, distance: bestDist });
    }
  }

  results.sort((a, b) => a.distance - b.distance || a.entity.name.localeCompare(b.entity.name));
  return results;
}
