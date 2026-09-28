/**
 * Historical overlay spatial entities (Phase 4 / PR C).
 *
 * Spatial entities + schematic region rings for Globe polygons (PR C + PR D).
 * Rings are intentionally rough — not GIS-accurate ancient borders.
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

/**
 * Schematic region rings for PR D — intentionally rough [lng, lat] GeoJSON order.
 * Closed rings (first point repeated at end). Not GIS-accurate borders.
 */
export const REGION_RINGS = {
  // --- Roman / Mediterranean ---
  italy: [
    [8.2, 44.0], [9.5, 45.8], [12.5, 46.5], [13.8, 45.6], [12.4, 43.8],
    [15.0, 42.0], [16.5, 41.0], [18.3, 40.2], [17.2, 38.9], [15.5, 38.0],
    [13.0, 37.5], [12.5, 38.2], [14.0, 40.5], [12.0, 41.8], [10.5, 42.8],
    [8.5, 43.5], [8.2, 44.0],
  ],
  mediterranean: [
    [-9.5, 36.0], [-8.0, 43.5], [-1.0, 48.5], [5.0, 51.0], [12.0, 54.0],
    [20.0, 52.0], [28.0, 48.0], [36.0, 46.0], [42.0, 43.0], [44.0, 38.0],
    [42.0, 32.0], [36.0, 28.0], [30.0, 25.0], [20.0, 26.0], [10.0, 30.0],
    [3.0, 32.0], [-5.0, 34.0], [-9.5, 36.0],
  ],
  'near-east': [
    [34.0, 31.0], [35.5, 37.0], [38.0, 41.0], [44.0, 40.0], [48.0, 37.0],
    [46.0, 32.0], [42.0, 30.0], [38.0, 29.5], [34.0, 31.0],
  ],

  // --- China / Silk Road ---
  'north-china': [
    [105, 34], [110, 41], [118, 42], [122, 40], [121, 35], [115, 32], [108, 33], [105, 34],
  ],
  'central-china': [
    [102, 26], [108, 34], [118, 34], [120, 28], [116, 24], [108, 24], [102, 26],
  ],
  'china-proper': [
    [100, 22], [103, 32], [108, 40], [115, 42], [122, 41], [122, 30],
    [120, 24], [112, 21], [105, 22], [100, 22],
  ],
  tarim: [
    [75, 37], [80, 42], [92, 43], [95, 40], [92, 36], [82, 36], [75, 37],
  ],

  // --- Mongol ---
  mongolia: [
    [87, 44], [95, 50], [112, 52], [120, 50], [118, 44], [105, 42], [92, 42], [87, 44],
  ],
  'central-asia': [
    [50, 36], [55, 46], [70, 48], [80, 45], [78, 38], [65, 35], [55, 35], [50, 36],
  ],
  'eurasian-steppe': [
    [30, 42], [40, 50], [70, 55], [100, 55], [130, 52], [135, 45],
    [120, 38], [90, 36], [60, 35], [40, 38], [30, 42],
  ],
  persia: [
    [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
  ],

  // --- Abbasid ---
  mesopotamia: [
    [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
  ],
  levant: [
    [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
  ],
  egypt: [
    [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
  ],

  // --- Inca ---
  andes: [
    [-81, -18], [-79, -5], [-77, 1], [-72, 2], [-68, -5], [-69, -15],
    [-72, -22], [-78, -20], [-81, -18],
  ],
  peru: [
    [-80, -16], [-78, -6], [-74, -3], [-69, -8], [-70, -17], [-76, -18], [-80, -16],
  ],
};

/** Convert bbox [west,south,east,north] to a closed GeoJSON ring [lng,lat][]. */
export function bboxToRing(bbox) {
  if (!Array.isArray(bbox) || bbox.length !== 4) return null;
  const [w, s, e, n] = bbox.map(Number);
  if ([w, s, e, n].some((v) => !Number.isFinite(v))) return null;
  return [
    [w, s],
    [e, s],
    [e, n],
    [w, n],
    [w, s],
  ];
}

function ensureClosed(ring) {
  if (!ring || ring.length < 3) return null;
  const out = ring.map(([lng, lat]) => [Number(lng), Number(lat)]);
  const [fLng, fLat] = out[0];
  const [lLng, lLat] = out[out.length - 1];
  if (fLng !== lLng || fLat !== lLat) out.push([fLng, fLat]);
  return out.length >= 4 ? out : null;
}

/**
 * Resolve a region ref to a closed [lng,lat] ring (schematic).
 * Prefer REGION_RINGS / inline ring, then bbox rectangle.
 */
export function resolveRegionRing(region) {
  if (region == null) return null;
  if (typeof region === 'string') {
    return ensureClosed(REGION_RINGS[region] || null);
  }
  if (typeof region !== 'object') return null;
  if (Array.isArray(region.ring)) return ensureClosed(region.ring);
  if (REGION_RINGS[region.id]) return ensureClosed(REGION_RINGS[region.id]);
  if (region.bbox) return ensureClosed(bboxToRing(region.bbox));
  return null;
}

/**
 * Build Globe.gl polygon features for entities active near `year`.
 * Uses the nearest overlay snapshot for geometry even when a keyYear wins activation.
 * @returns {object[]} GeoJSON-like features with color/name props for Globe.gl accessors
 */
export function getOverlayPolygonFeatures(year, entities = spatialEntities) {
  const active = getActiveOverlaysAtYear(year, entities);
  const features = [];

  for (const { entity, overlay: activeOverlay } of active) {
    // Prefer the overlay that activated; else nearest overlay for geometry
    let overlay = activeOverlay;
    if (!overlay && entity.overlays?.length) {
      let best = entity.overlays[0];
      let bestDist = Math.abs(best.year - year);
      for (const o of entity.overlays) {
        const d = Math.abs(o.year - year);
        if (d < bestDist) {
          best = o;
          bestDist = d;
        }
      }
      overlay = best;
    }
    if (!overlay?.regions?.length) continue;

    for (const region of overlay.regions) {
      const ring = resolveRegionRing(region);
      if (!ring) continue;
      const regionId = typeof region === 'string' ? region : region.id;
      const regionName = typeof region === 'string' ? region : (region.name || region.id);
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
        // Flat props for Globe.gl accessors (also mirrored under properties)
        entityId: entity.id,
        name: entity.name,
        regionId,
        regionName,
        color: entity.color,
        approximation: overlay.approximation || 'rough',
        overlayYear: overlay.year,
        properties: {
          entityId: entity.id,
          name: entity.name,
          regionId,
          regionName,
          color: entity.color,
          approximation: overlay.approximation || 'rough',
        },
      });
    }
  }

  return features;
}

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
