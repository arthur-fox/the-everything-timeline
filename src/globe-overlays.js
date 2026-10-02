/**
 * Historical overlay spatial entities (Phase 4 / PR C + Day 14–18).
 * Day 18: activation clamped to linked timeline lifespan + overlay keyframe span.
 * Day 19: early Bronze Age fill (Mesopotamia, early Egypt, Shang, Phoenicia, Olmec, Kush).
 * Day 20: living borders — morph rings between overlay keyframes + soft lifespan dissolve.
 * Day 21: denser non-rectangular keyframes for hero empires + softer lifespan edge fades.
 * Day 22: colony fragment/split — distant possessions as separate region ids (no ocean-spanning morph).
 * Day 23: denser overlay coverage — rise→peak→decline keyframes for thin / peak-only empires.
 * Day 24: densify remaining 2-keyframe notables to ≥3 overlays.
 * Day 25: fill remaining timeline civilisations on the globe (27 polity overlays; people/presence later).
 * Day 27–28: people packs (human-atlas layer 2) — cultural/ethnolinguistic overlays via globe-people.js (20 entities).
 *
 * Spatial entities + schematic region rings for Globe polygons.
 * Rings are intentionally rough — not GIS-accurate ancient borders.
 */

import { civilisations } from './civilisations.js';
import { warsItems } from './wars.js';
import { morphEntityAtYear, ensureClockwise } from './globe-morph.js';
import { peopleEntities, PEOPLE_PACK_IDS } from './globe-people.js';

/** @typedef {'empire' | 'civilization' | 'state' | 'people' | 'other'} SpatialEntityType */
/** @typedef {'rough' | 'simplified' | 'schematic'} ApproximationLevel */

/**
 * @typedef {Object} RegionRef
 * @property {string} id
 * @property {string} [name]
 * @property {[number, number, number, number]} [bbox] west,south,east,north degrees
 * @property {[number, number][]} [ring] closed schematic polygon [lng,lat] (preferred for morph deform)
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
    color: '#FF5A5F',
    type: 'empire',
    description:
      'A major Mediterranean empire centered on Rome. At its height under Trajan it spanned three continents.',
    keyYears: [-27, 50, 117, 200, 395, 476],
    overlays: [
      {
        year: -27,
        label: 'Principate begins (Augustus)',
        approximation: 'schematic',
        regions: [
          {
            id: 'italy',
            name: 'Italy',
            ring: [
              [8.2, 44.0], [9.5, 45.8], [12.5, 46.5], [13.8, 45.6], [12.4, 43.8],
              [15.0, 42.0], [16.5, 41.0], [18.3, 40.2], [17.2, 38.9], [15.5, 38.0],
              [13.0, 37.5], [12.5, 38.2], [14.0, 40.5], [12.0, 41.8], [10.5, 42.8],
              [8.5, 43.5], [8.2, 44.0],
            ],
          },
          {
            id: 'mediterranean',
            name: 'Mediterranean basin',
            // Early: Italy-centric + Spain / N. Africa fringe (non-rect)
            ring: [
              [-9, 36], [-8, 42], [-1, 43], [4, 44], [10, 45], [14, 44],
              [16, 40], [15, 36], [12, 33], [5, 32], [-2, 33], [-8, 35], [-9, 36],
            ],
          },
        ],
      },
      {
        year: 50,
        label: 'Claudian expansion (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'italy',
            name: 'Italy',
            ring: [
              [8.2, 44.0], [9.5, 45.8], [12.5, 46.5], [13.8, 45.6], [12.4, 43.8],
              [15.0, 42.0], [16.5, 41.0], [18.3, 40.2], [17.2, 38.9], [15.5, 38.0],
              [13.0, 37.5], [12.5, 38.2], [14.0, 40.5], [12.0, 41.8], [10.5, 42.8],
              [8.5, 43.5], [8.2, 44.0],
            ],
          },
          {
            id: 'mediterranean',
            name: 'Mediterranean basin',
            // Stretch into Gaul, Britain fringe, deeper N. Africa
            ring: [
              [-9.5, 35], [-8, 44], [-4, 50], [2, 51], [8, 50], [14, 48],
              [18, 45], [20, 42], [18, 36], [14, 32], [6, 30], [-2, 32], [-8, 34], [-9.5, 35],
            ],
          },
        ],
      },
      {
        year: 117,
        label: 'Height under Trajan',
        approximation: 'rough',
        regions: [
          {
            id: 'mediterranean',
            name: 'Mediterranean basin',
            // Peak: Britain → Near East, deep into Balkans / N. Africa
            ring: [
              [-9, 36], [-8, 44], [-4, 52], [2, 56], [10, 54], [18, 50],
              [26, 48], [34, 46], [40, 42], [42, 36], [40, 30], [34, 26],
              [26, 24], [16, 26], [6, 28], [-2, 32], [-8, 35], [-9, 36],
            ],
          },
          {
            id: 'italy',
            name: 'Italy',
            ring: [
              [8.2, 44.0], [9.5, 45.8], [12.5, 46.5], [13.8, 45.6], [12.4, 43.8],
              [15.0, 42.0], [16.5, 41.0], [18.3, 40.2], [17.2, 38.9], [15.5, 38.0],
              [13.0, 37.5], [12.5, 38.2], [14.0, 40.5], [12.0, 41.8], [10.5, 42.8],
              [8.5, 43.5], [8.2, 44.0],
            ],
          },
          {
            id: 'near-east',
            name: 'Near East fringe',
            ring: [
              [34, 31], [35.5, 37], [38, 41], [44, 40], [48, 37],
              [46, 32], [42, 30], [38, 29.5], [34, 31],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Severan high (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'mediterranean',
            name: 'Mediterranean basin',
            // Slight Mesopotamia pull-back; Britain + Africa still held
            ring: [
              [-9, 36], [-8, 44], [-4, 52], [2, 55], [10, 53], [18, 49],
              [26, 47], [34, 45], [38, 40], [40, 34], [36, 28], [28, 25],
              [18, 26], [8, 28], [0, 32], [-6, 34], [-9, 36],
            ],
          },
          {
            id: 'italy',
            name: 'Italy',
            ring: [
              [8.2, 44.0], [9.5, 45.8], [12.5, 46.5], [13.8, 45.6], [12.4, 43.8],
              [15.0, 42.0], [16.5, 41.0], [18.3, 40.2], [17.2, 38.9], [15.5, 38.0],
              [13.0, 37.5], [12.5, 38.2], [14.0, 40.5], [12.0, 41.8], [10.5, 42.8],
              [8.5, 43.5], [8.2, 44.0],
            ],
          },
        ],
      },
      {
        year: 395,
        label: 'East–West division',
        approximation: 'schematic',
        regions: [
          {
            id: 'mediterranean',
            name: 'Mediterranean basin',
            // Split-era: still broad but truncated north & east
            ring: [
              [-9, 36], [-7, 42], [-1, 46], [6, 48], [14, 47], [22, 45],
              [30, 43], [36, 40], [38, 34], [34, 30], [26, 28], [16, 30],
              [6, 32], [-2, 34], [-9, 36],
            ],
          },
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
    color: '#F59E0B',
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
    id: 'parthian-empire',
    name: 'Parthian Empire',
    color: '#A8A29E',
    type: 'empire',
    description:
      'Iranian empire controlling the Iranian plateau and Mesopotamia; Rome’s great eastern rival.',
    keyYears: [-247, 50, 224],
    overlays: [
      {
        year: -50,
        label: 'Early Parthian plateau',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau core',
            ring: [
              [48, 28], [50, 36], [58, 38], [60, 32], [56, 27], [50, 26], [48, 28],
            ],
          },
          {
            id: 'parthia-east',
            name: 'Eastern Parthia',
            ring: [
              [58, 32], [60, 38], [68, 39], [68, 34], [64, 30], [58, 30], [58, 32],
            ],
          },
        ],
      },
      {
        year: 50,
        label: 'Parthia vs Rome (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau',
            ring: [
              [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia fringe',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'parthia-east',
            name: 'Eastern Parthia',
            ring: [
              [55, 32], [58, 39], [68, 40], [70, 35], [65, 30], [58, 30], [55, 32],
            ],
          },
        ],
      },
      {
        year: 150,
        label: 'Later Parthian period',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau',
            ring: [
              [46, 27], [48, 37], [56, 39], [60, 35], [58, 28], [52, 26], [46, 27],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia fringe',
            ring: [
              [39, 31], [41, 35], [46, 36], [47, 33], [45, 30.5], [41, 30.5], [39, 31],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['parthian'],
    sources: [
      { title: 'Wikipedia — Parthian Empire', url: 'https://en.wikipedia.org/wiki/Parthian_Empire' },
    ],
  },
  {
    id: 'kushan-empire',
    name: 'Kushan Empire',
    color: '#D946EF',
    type: 'empire',
    description:
      'Central Asian / North Indian empire linking Silk Road trade between China, Iran, and the Gangetic plain.',
    keyYears: [50, 100, 200],
    overlays: [
      {
        year: 50,
        label: 'Early Kushan (Bactria–Gandhara)',
        approximation: 'schematic',
        regions: [
          {
            id: 'kushan-core',
            name: 'Bactria–Gandhara',
            ring: [
              [66, 32], [68, 37], [73, 38], [75, 35], [73, 31], [68, 31], [66, 32],
            ],
          },
        ],
      },
      {
        year: 100,
        label: 'Kushan high period',
        approximation: 'schematic',
        regions: [
          {
            id: 'kushan-core',
            name: 'Bactria–Gandhara',
            ring: [
              [65, 32], [68, 39], [76, 40], [78, 35], [74, 30], [68, 30], [65, 32],
            ],
          },
          {
            id: 'north-india',
            name: 'Northwest India fringe',
            ring: [
              [70, 26], [72, 33], [80, 34], [84, 30], [80, 24], [74, 24], [70, 26],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Late Kushan',
        approximation: 'schematic',
        regions: [
          {
            id: 'kushan-core',
            name: 'Bactria–Gandhara',
            ring: [
              [66, 32], [69, 38], [75, 38], [76, 34], [73, 30], [68, 30], [66, 32],
            ],
          },
          {
            id: 'north-india',
            name: 'Northwest India fringe',
            ring: [
              [71, 26], [73, 32], [80, 32], [82, 28], [78, 24], [73, 24], [71, 26],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['kushan'],
    sources: [
      { title: 'Wikipedia — Kushan Empire', url: 'https://en.wikipedia.org/wiki/Kushan_Empire' },
    ],
  },
  {
    id: 'maurya-empire',
    name: 'Maurya Empire',
    color: '#059669',
    type: 'empire',
    description:
      'Early Indian empire that, under Ashoka, controlled much of the subcontinent.',
    keyYears: [-322, -300, -250, -200],
    overlays: [
      {
        year: -300,
        label: 'Early Maurya (Magadha core)',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'Gangetic / Magadha core',
            ring: [
              [78, 22], [80, 28], [88, 28], [90, 24], [86, 20], [80, 20], [78, 22],
            ],
          },
        ],
      },
      {
        year: -250,
        label: 'Ashokan Maurya (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'Gangetic / north India',
            ring: [
              [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
            ],
          },
          {
            id: 'india-deccan',
            name: 'Deccan fringe',
            ring: [
              [74, 14], [76, 22], [84, 22], [85, 16], [80, 12], [76, 12], [74, 14],
            ],
          },
        ],
      },
      {
        year: -200,
        label: 'Late Maurya contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'Gangetic / north India',
            ring: [
              [76, 22], [78, 30], [88, 30], [90, 26], [86, 22], [80, 20], [76, 22],
            ],
          },
          {
            id: 'india-deccan',
            name: 'Deccan fringe',
            ring: [
              [75, 16], [77, 22], [83, 22], [84, 17], [80, 14], [76, 14], [75, 16],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['maurya'],
    sources: [
      { title: 'Wikipedia — Maurya Empire', url: 'https://en.wikipedia.org/wiki/Maurya_Empire' },
    ],
  },
  {
    id: 'gupta-empire',
    name: 'Gupta Empire',
    color: '#34D399',
    type: 'empire',
    description:
      'Classical Indian empire often associated with a “golden age” of science, art, and literature.',
    keyYears: [320, 350, 450, 520],
    overlays: [
      {
        year: 350,
        label: 'Early Gupta rise',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India core',
            ring: [
              [78, 22], [80, 30], [88, 30], [90, 26], [86, 22], [80, 20], [78, 22],
            ],
          },
        ],
      },
      {
        year: 450,
        label: 'Gupta high water (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India',
            ring: [
              [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
            ],
          },
          {
            id: 'india-central',
            name: 'Central India',
            ring: [
              [74, 18], [76, 26], [86, 26], [88, 20], [84, 16], [78, 16], [74, 18],
            ],
          },
        ],
      },
      {
        year: 520,
        label: 'Late Gupta',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India',
            ring: [
              [76, 22], [78, 30], [88, 30], [90, 26], [86, 22], [80, 20], [76, 22],
            ],
          },
          {
            id: 'india-central',
            name: 'Central India fringe',
            ring: [
              [76, 18], [78, 24], [84, 24], [85, 20], [82, 17], [78, 17], [76, 18],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['gupta'],
    sources: [
      { title: 'Wikipedia — Gupta Empire', url: 'https://en.wikipedia.org/wiki/Gupta_Empire' },
    ],
  },
  {
    id: 'byzantine-empire',
    name: 'Byzantine Empire',
    color: '#6366F1',
    type: 'empire',
    description:
      'Eastern Roman continuity centered on Constantinople; endured through medieval centuries.',
    keyYears: [395, 565, 800, 1453],
    overlays: [
      {
        year: 565,
        label: 'Justinianic reconquest',
        approximation: 'schematic',
        regions: [
          { id: 'byzantine-core', name: 'Balkans / Anatolia', bbox: [20, 35, 42, 46] },
          { id: 'egypt', name: 'Egypt (briefly)' },
          { id: 'italy', name: 'Italy fringe' },
        ],
      },
      {
        year: 800,
        label: 'Middle Byzantine world',
        approximation: 'schematic',
        regions: [
          { id: 'byzantine-core', name: 'Balkans / Anatolia', bbox: [22, 36, 42, 45] },
          { id: 'levant', name: 'Levant fringe' },
        ],
      },
      {
        year: 1025,
        label: 'Macedonian apex',
        approximation: 'schematic',
        regions: [
          { id: 'byzantine-core', name: 'Balkans / Anatolia', bbox: [19, 35, 42, 46] },
        ],
      },
    ],
    timelineItemIds: ['byzantine'],
    sources: [
      { title: 'Wikipedia — Byzantine Empire', url: 'https://en.wikipedia.org/wiki/Byzantine_Empire' },
    ],
  },
  {
    id: 'frankish-empire',
    name: 'Carolingian / Frankish realm',
    color: '#14B8A6',
    type: 'empire',
    description:
      'Frankish realm under Charlemagne covering much of Western and Central Europe.',
    keyYears: [700, 800, 843],
    overlays: [
      {
        year: 700,
        label: 'Merovingian / early Carolingian Gaul',
        approximation: 'schematic',
        regions: [
          {
            id: 'frankish-west',
            name: 'Gaul / West Francia',
            ring: [
              [-2, 44], [-1, 49], [4, 50], [7, 48], [5, 44], [1, 43], [-2, 44],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Charlemagne crowned (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'frankish-west',
            name: 'Gaul / West Francia',
            ring: [
              [-5, 43], [-4, 50], [4, 51], [8, 48], [6, 43], [0, 42], [-5, 43],
            ],
          },
          {
            id: 'frankish-east',
            name: 'East Francia / Germany',
            ring: [
              [5, 46], [8, 53], [16, 54], [18, 50], [14, 46], [8, 45], [5, 46],
            ],
          },
          {
            id: 'italy',
            name: 'Northern Italy fringe',
            ring: [
              [7.5, 44.0], [9.0, 46.0], [12.0, 46.2], [13.0, 45.0], [11.5, 44.0], [8.5, 43.5], [7.5, 44.0],
            ],
          },
        ],
      },
      {
        year: 843,
        label: 'Treaty of Verdun (partition edge)',
        approximation: 'schematic',
        regions: [
          {
            id: 'frankish-west',
            name: 'West Francia',
            ring: [
              [-5, 43], [-4, 50], [3, 51], [6, 48], [4, 43], [-1, 42], [-5, 43],
            ],
          },
          {
            id: 'frankish-east',
            name: 'East Francia',
            ring: [
              [6, 46], [9, 53], [15, 54], [17, 50], [13, 46], [8, 45], [6, 46],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['frankish'],
    sources: [
      { title: 'Wikipedia — Carolingian Empire', url: 'https://en.wikipedia.org/wiki/Carolingian_Empire' },
    ],
  },
  {
    id: 'tang-china',
    name: 'Tang China',
    color: '#FDE047',
    type: 'empire',
    description:
      'Cosmopolitan Chinese empire of the early medieval period; capital Chang’an a hub of Eurasian exchange.',
    keyYears: [618, 650, 750, 850],
    overlays: [
      {
        year: 650,
        label: 'Early Tang consolidation',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [102, 24], [105, 34], [112, 40], [120, 40], [120, 28], [114, 23], [105, 23], [102, 24],
            ],
          },
        ],
      },
      {
        year: 750,
        label: 'High Tang (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [100, 22], [103, 32], [108, 40], [115, 42], [122, 41], [122, 30],
              [120, 24], [112, 21], [105, 22], [100, 22],
            ],
          },
          {
            id: 'tarim',
            name: 'Western Regions fringe',
            ring: [
              [75, 37], [80, 42], [92, 43], [95, 40], [92, 36], [82, 36], [75, 37],
            ],
          },
          {
            id: 'tang-north',
            name: 'North China / steppe fringe',
            ring: [
              [100, 36], [108, 44], [122, 45], [125, 40], [118, 36], [108, 35], [100, 36],
            ],
          },
        ],
      },
      {
        year: 850,
        label: 'Late Tang contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [102, 23], [105, 33], [112, 40], [120, 40], [120, 28], [114, 23], [105, 22], [102, 23],
            ],
          },
          {
            id: 'tang-north',
            name: 'North China fringe',
            ring: [
              [105, 36], [110, 42], [120, 42], [122, 38], [116, 36], [108, 35], [105, 36],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['tang-dynasty'],
    sources: [
      { title: 'Wikipedia — Tang dynasty', url: 'https://en.wikipedia.org/wiki/Tang_dynasty' },
    ],
  },
  {
    id: 'song-china',
    name: 'Song China',
    color: '#CA8A04',
    type: 'empire',
    description:
      'Song dynasty China — commercially advanced, later pressed by Jurchen and Mongol powers.',
    keyYears: [960, 1127, 1279],
    overlays: [
      {
        year: 1000,
        label: 'Early Northern Song',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper (Northern Song core)',
            ring: [
              [105, 24], [108, 34], [115, 40], [120, 38], [120, 28],
              [116, 23], [110, 22], [105, 24],
            ],
          },
        ],
      },
      {
        year: 1100,
        label: 'Northern Song (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [102, 22], [103, 32], [108, 40], [115, 42], [122, 41], [122, 30],
              [120, 24], [112, 21], [105, 22], [102, 22],
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Southern Song (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'south-china',
            name: 'South China',
            ring: [
              [105, 20], [108, 30], [118, 32], [122, 28], [120, 21], [112, 20], [105, 20],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['song-dynasty'],
    sources: [
      { title: 'Wikipedia — Song dynasty', url: 'https://en.wikipedia.org/wiki/Song_dynasty' },
    ],
  },
  {
    id: 'abbasid-caliphate',
    name: 'Abbasid Caliphate',
    color: '#10B981',
    type: 'empire',
    description:
      'Islamic caliphate centered on Baghdad; a major scholarly and commercial power across the Middle East and beyond.',
    keyYears: [750, 800, 1258],
    overlays: [
      {
        year: 760,
        label: 'Early Abbasid (Baghdad founding era)',
        approximation: 'schematic',
        regions: [
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'persia',
            name: 'Iran / Persia',
            ring: [
              [46, 27], [48, 36], [56, 38], [58, 32], [54, 26], [48, 25], [46, 27],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'High Abbasid period',
        approximation: 'rough',
        regions: [
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
          {
            id: 'persia',
            name: 'Iran / Persia',
            ring: [
              [44, 25], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 25],
            ],
          },
        ],
      },
      {
        year: 900,
        label: 'Fragmenting caliphal world',
        approximation: 'schematic',
        regions: [
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'persia',
            name: 'Iran / Persia',
            ring: [
              [44, 25], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 25],
            ],
          },
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
    id: 'mali-empire',
    name: 'Mali Empire',
    color: '#EAB308',
    type: 'empire',
    description:
      'West African empire famed for gold, scholarship (Timbuktu), and the pilgrimage of Mansa Musa.',
    keyYears: [1235, 1250, 1324, 1400],
    overlays: [
      {
        year: 1250,
        label: 'Early Mali (Niger bend)',
        approximation: 'schematic',
        regions: [
          {
            id: 'west-africa-sahel',
            name: 'Sahel / Niger bend core',
            ring: [
              [-10, 12], [-8, 16], [-2, 17], [0, 14], [-2, 11], [-7, 11], [-10, 12],
            ],
          },
        ],
      },
      {
        year: 1324,
        label: 'Mansa Musa era (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'west-africa-sahel',
            name: 'Sahel / Niger bend',
            ring: [
              [-12, 12], [-10, 18], [0, 20], [4, 16], [2, 11], [-6, 10], [-12, 12],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late Mali',
        approximation: 'schematic',
        regions: [
          {
            id: 'west-africa-sahel',
            name: 'Sahel / Niger bend',
            ring: [
              [-11, 12], [-9, 17], [-1, 18], [2, 15], [0, 11], [-6, 10], [-11, 12],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['mali-empire'],
    sources: [
      { title: 'Wikipedia — Mali Empire', url: 'https://en.wikipedia.org/wiki/Mali_Empire' },
    ],
  },
  {
    id: 'khmer-empire',
    name: 'Khmer Empire',
    color: '#FB7185',
    type: 'empire',
    description:
      'Mainland Southeast Asian empire centered on Angkor; hydraulic cities and temple complexes.',
    keyYears: [802, 900, 1150, 1300],
    overlays: [
      {
        year: 900,
        label: 'Early Angkor rise',
        approximation: 'schematic',
        regions: [
          {
            id: 'mainland-sea',
            name: 'Angkor / Cambodia core',
            ring: [
              [102, 12], [103, 15], [106, 15.5], [107, 13], [105, 11.5], [103, 11.5], [102, 12],
            ],
          },
        ],
      },
      {
        year: 1150,
        label: 'Angkor high period (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'mainland-sea',
            name: 'Mainland SE Asia',
            ring: [
              [100, 11], [102, 17], [108, 18], [110, 14], [107, 10], [102, 10], [100, 11],
            ],
          },
        ],
      },
      {
        year: 1300,
        label: 'Late Khmer',
        approximation: 'schematic',
        regions: [
          {
            id: 'mainland-sea',
            name: 'Mainland SE Asia',
            ring: [
              [101, 11], [103, 16], [107, 16.5], [108, 13], [106, 10.5], [102, 10.5], [101, 11],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['khmer'],
    sources: [
      { title: 'Wikipedia — Khmer Empire', url: 'https://en.wikipedia.org/wiki/Khmer_Empire' },
    ],
  },
  {
    id: 'mongol-empire',
    name: 'Mongol Empire',
    color: '#8B5CF6',
    type: 'empire',
    description:
      'Largest contiguous land empire in history, founded by Genghis Khan; linked East and West along the Silk Road.',
    keyYears: [1206, 1227, 1241, 1279, 1300, 1368],
    overlays: [
      {
        year: 1227,
        label: 'At Genghis Khan’s death',
        approximation: 'schematic',
        regions: [
          {
            id: 'mongolia',
            name: 'Mongolia / steppe core',
            ring: [
              [87, 44], [95, 50], [112, 52], [120, 50], [118, 44],
              [105, 42], [92, 42], [87, 44],
            ],
          },
          {
            id: 'central-asia',
            name: 'Central Asia',
            ring: [
              [50, 36], [55, 46], [70, 48], [80, 45], [78, 38],
              [65, 35], [55, 35], [50, 36],
            ],
          },
        ],
      },
      {
        year: 1241,
        label: 'Westward surge (Ögedei era)',
        approximation: 'schematic',
        regions: [
          {
            id: 'mongolia',
            name: 'Mongolia / steppe core',
            ring: [
              [85, 42], [92, 50], [110, 53], [122, 51], [120, 44],
              [108, 40], [95, 40], [85, 42],
            ],
          },
          {
            id: 'central-asia',
            name: 'Central Asia',
            // Stretched west toward Caspian / Rus fringe
            ring: [
              [40, 38], [48, 48], [62, 52], [78, 50], [82, 42],
              [75, 36], [58, 34], [45, 35], [40, 38],
            ],
          },
          {
            id: 'eurasian-steppe',
            name: 'Pontic–Caspian fringe',
            ring: [
              [28, 44], [35, 52], [50, 54], [58, 50], [55, 42],
              [42, 40], [30, 42], [28, 44],
            ],
          },
        ],
      },
      {
        year: 1279,
        label: 'Yuan peak under Kublai',
        approximation: 'rough',
        regions: [
          {
            id: 'eurasian-steppe',
            name: 'Eurasian steppe belt',
            // Broad belt — non-rect so morph deforms, not only scales
            ring: [
              [30, 42], [40, 50], [70, 55], [100, 55], [130, 52], [135, 45],
              [120, 38], [90, 36], [60, 35], [40, 38], [30, 42],
            ],
          },
          {
            id: 'china-proper',
            name: 'China under Yuan',
            ring: [
              [100, 22], [103, 32], [108, 40], [115, 42], [122, 41], [122, 30],
              [120, 24], [112, 21], [105, 22], [100, 22],
            ],
          },
          {
            id: 'persia',
            name: 'Ilkhanate Persia',
            ring: [
              [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
            ],
          },
        ],
      },
      {
        year: 1300,
        label: 'Khanates still vast (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'eurasian-steppe',
            name: 'Eurasian steppe belt',
            // Slightly pinched / fragmented look vs 1279 peak
            ring: [
              [32, 40], [42, 48], [72, 53], [100, 53], [128, 50], [132, 44],
              [118, 36], [88, 34], [58, 34], [40, 36], [32, 40],
            ],
          },
          {
            id: 'china-proper',
            name: 'China under Yuan',
            ring: [
              [102, 22], [105, 32], [110, 40], [118, 42], [122, 40], [122, 28],
              [118, 23], [110, 21], [104, 22], [102, 22],
            ],
          },
          {
            id: 'persia',
            name: 'Ilkhanate Persia',
            ring: [
              [44, 27], [47, 37], [56, 39], [62, 35], [58, 27], [50, 25], [44, 27],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['mongol-empire', 'mongol-conquests'],
    sources: [
      { title: 'Wikipedia — Mongol Empire', url: 'https://en.wikipedia.org/wiki/Mongol_Empire' },
    ],
  },
  {
    id: 'delhi-sultanate',
    name: 'Delhi Sultanate',
    color: '#A3E635',
    type: 'state',
    description:
      'Series of Muslim dynasties ruling large parts of the Indian subcontinent from Delhi.',
    keyYears: [1206, 1230, 1300, 1400],
    overlays: [
      {
        year: 1230,
        label: 'Early Delhi Sultanate',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India core',
            ring: [
              [74, 24], [76, 30], [82, 30], [84, 26], [80, 22], [76, 22], [74, 24],
            ],
          },
        ],
      },
      {
        year: 1300,
        label: 'Delhi Sultanate extent (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India',
            ring: [
              [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
            ],
          },
          {
            id: 'india-central',
            name: 'Central India fringe',
            ring: [
              [74, 18], [76, 26], [86, 26], [88, 20], [84, 16], [78, 16], [74, 18],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Post-Timur Delhi world',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India',
            ring: [
              [74, 22], [76, 30], [84, 30], [86, 26], [82, 22], [76, 21], [74, 22],
            ],
          },
          {
            id: 'india-central',
            name: 'Central India fringe',
            ring: [
              [75, 18], [77, 24], [84, 24], [85, 20], [82, 17], [77, 17], [75, 18],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['delhi-sultanate'],
    sources: [
      { title: 'Wikipedia — Delhi Sultanate', url: 'https://en.wikipedia.org/wiki/Delhi_Sultanate' },
    ],
  },
  {
    id: 'ottoman-empire',
    name: 'Ottoman Empire',
    color: '#9A3412',
    type: 'empire',
    description:
      'Turkish empire spanning southeastern Europe, Anatolia, and much of the eastern Mediterranean.',
    keyYears: [1453, 1520, 1600, 1683, 1800, 1900, 1914],
    overlays: [
      {
        year: 1453,
        label: 'After Constantinople',
        approximation: 'schematic',
        regions: [
          {
            id: 'anatolia-balkans',
            name: 'Anatolia / Balkans',
            // Compact: Anatolia + Thrace / southern Balkans
            ring: [
              [26, 36], [27, 41], [29, 42.5], [33, 42], [38, 41], [42, 39],
              [43, 36], [38, 35], [30, 35], [26, 36],
            ],
          },
        ],
      },
      {
        year: 1520,
        label: 'Early modern Ottoman peak approach',
        approximation: 'schematic',
        regions: [
          {
            id: 'anatolia-balkans',
            name: 'Anatolia / Balkans',
            // Crescent: deeper Balkans, still Anatolia-heavy
            ring: [
              [19, 36], [20, 43], [26, 45], [30, 45], [36, 43], [42, 41],
              [45, 37], [42, 35], [35, 34], [26, 35], [19, 36],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
        ],
      },
      {
        year: 1600,
        label: 'Mid expansion (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'anatolia-balkans',
            name: 'Anatolia / Balkans',
            // Push into Hungary / north Balkans — silhouette stretches NW
            ring: [
              [16, 35], [17, 44], [22, 47], [28, 47], [35, 44], [43, 42],
              [47, 38], [45, 34], [36, 34], [26, 34], [18, 35], [16, 35],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30], [35, 37], [40, 37.5], [43, 34], [41, 30.5], [36, 29.5], [34, 30],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [24, 22], [27, 31.5], [34, 31.8], [35.5, 28], [33, 21.5], [28, 21.5], [24, 22],
            ],
          },
          {
            id: 'maghreb-east',
            name: 'Eastern Maghreb fringe',
            ring: [
              [8, 30], [10, 35], [18, 36], [22, 33], [18, 30], [10, 30], [8, 30],
            ],
          },
        ],
      },
      {
        year: 1683,
        label: 'Ottoman high water',
        approximation: 'schematic',
        regions: [
          {
            id: 'anatolia-balkans',
            name: 'Anatolia / Balkans',
            // Peak footprint — widest NW reach before Vienna turn
            ring: [
              [15, 34], [16, 45], [22, 48], [30, 48], [38, 45], [45, 42],
              [48, 37], [46, 34], [38, 34], [26, 34], [18, 34], [15, 34],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
          {
            id: 'maghreb-east',
            name: 'Eastern Maghreb',
            ring: [
              [5, 30], [8, 36], [20, 37], [25, 33], [22, 30], [10, 30], [5, 30],
            ],
          },
        ],
      },
      {
        year: 1800,
        label: 'Post-peak contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'anatolia-balkans',
            name: 'Anatolia / Balkans',
            // Balkans shrinking from the NW; Anatolia still solid
            ring: [
              [22, 36], [23, 43], [28, 44], [35, 43], [42, 41], [45, 37],
              [43, 35], [35, 35], [26, 35], [22, 36],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36], [39, 36.5], [41, 33.5], [39, 30.5], [35.5, 30], [34, 30.5],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [25, 22], [28, 31], [33.5, 31], [34.5, 27.5], [32, 22], [28, 22], [25, 22],
            ],
          },
        ],
      },
      {
        year: 1900,
        label: 'Late Ottoman (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'anatolia-balkans',
            name: 'Anatolia / Balkans remnant',
            // Mostly Anatolia + thin European toehold
            ring: [
              [26, 36], [27, 40], [29, 41.5], [32, 41], [38, 41], [42, 39],
              [44, 36], [40, 35], [32, 35], [26, 36],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['ottoman'],
    sources: [
      { title: 'Wikipedia — Ottoman Empire', url: 'https://en.wikipedia.org/wiki/Ottoman_Empire' },
    ],
  },
  {
    id: 'spanish-empire',
    name: 'Spanish Empire',
    color: '#FF8C42',
    type: 'empire',
    description:
      'Iberian oceanic empire with American viceroyalties and Pacific footholds after 1492.',
    keyYears: [1492, 1550, 1700, 1800],
    overlays: [
      {
        year: 1492,
        label: 'Iberia at contact (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Iberian Peninsula',
            ring: [
              [-9.5, 36.5], [-9.2, 42.5], [-6.5, 43.8], [-2.0, 43.5], [1.5, 42.2],
              [3.0, 41.5], [2.5, 38.5], [-0.5, 36.8], [-5.0, 36.0], [-8.5, 36.2], [-9.5, 36.5],
            ],
          },
        ],
      },
      {
        year: 1550,
        label: 'Spanish Americas + Pacific footholds',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Iberia',
            ring: [
              [-9.5, 36.5], [-9.2, 42.5], [-6.5, 43.8], [-2.0, 43.5], [1.5, 42.2],
              [3.0, 41.5], [2.5, 38.5], [-0.5, 36.8], [-5.0, 36.0], [-8.5, 36.2], [-9.5, 36.5],
            ],
          },
          {
            id: 'new-spain',
            name: 'New Spain / Mesoamerica',
            ring: [
              [-110, 16], [-108, 26], [-100, 28], [-92, 26], [-86, 22],
              [-88, 15], [-96, 14], [-104, 15], [-110, 16],
            ],
          },
          {
            id: 'andes',
            name: 'Andean corridor',
            ring: [
              [-81, -18], [-79, -5], [-77, 1], [-72, 2], [-68, -5],
              [-69, -15], [-72, -22], [-78, -20], [-81, -18],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean / Antilles',
            ring: [
              [-85, 17], [-82, 23], [-74, 23], [-68, 20], [-66, 17],
              [-70, 14], [-78, 15], [-85, 17],
            ],
          },
          {
            id: 'philippines',
            name: 'Philippines foothold',
            ring: [
              [119, 6], [120, 14], [124, 16], [126, 12], [125, 7], [122, 5], [119, 6],
            ],
          },
        ],
      },
      {
        year: 1700,
        label: 'Bourbon-era Spanish world',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Iberia',
            ring: [
              [-9.5, 36.5], [-9.2, 42.5], [-6.5, 43.8], [-2.0, 43.5], [1.5, 42.2],
              [3.0, 41.5], [2.5, 38.5], [-0.5, 36.8], [-5.0, 36.0], [-8.5, 36.2], [-9.5, 36.5],
            ],
          },
          {
            id: 'new-spain',
            name: 'New Spain',
            ring: [
              [-112, 18], [-110, 30], [-100, 32], [-90, 28], [-86, 22],
              [-88, 14], [-98, 14], [-108, 16], [-112, 18],
            ],
          },
          {
            id: 'andes',
            name: 'Andes / Peru',
            ring: [
              [-81, -20], [-79, -6], [-76, 2], [-70, 3], [-67, -6],
              [-68, -18], [-72, -24], [-78, -22], [-81, -20],
            ],
          },
          {
            id: 'southern-cone',
            name: 'Southern Cone fringe',
            ring: [
              [-75, -38], [-72, -22], [-62, -20], [-55, -28], [-58, -38],
              [-66, -42], [-72, -40], [-75, -38],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean',
            ring: [
              [-85, 17], [-82, 23], [-74, 23], [-68, 20], [-66, 17],
              [-70, 14], [-78, 15], [-85, 17],
            ],
          },
          {
            id: 'philippines',
            name: 'Philippines',
            ring: [
              [118, 5], [120, 15], [125, 18], [127, 12], [126, 6], [122, 4], [118, 5],
            ],
          },
        ],
      },
      {
        year: 1800,
        label: 'Late Spanish America (pre-independence contraction)',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Iberia',
            ring: [
              [-9.5, 36.5], [-9.2, 42.5], [-6.5, 43.8], [-2.0, 43.5], [1.5, 42.2],
              [3.0, 41.5], [2.5, 38.5], [-0.5, 36.8], [-5.0, 36.0], [-8.5, 36.2], [-9.5, 36.5],
            ],
          },
          {
            id: 'new-spain',
            name: 'New Spain (contracting)',
            ring: [
              [-110, 16], [-108, 26], [-98, 28], [-90, 24], [-86, 20],
              [-90, 14], [-100, 14], [-108, 15], [-110, 16],
            ],
          },
          {
            id: 'andes',
            name: 'Andes / Peru',
            ring: [
              [-80, -18], [-78, -6], [-74, 0], [-70, 1], [-68, -8],
              [-70, -18], [-74, -22], [-78, -20], [-80, -18],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean remnants',
            ring: [
              [-82, 18], [-80, 22], [-74, 22], [-70, 19], [-72, 16], [-78, 16], [-82, 18],
            ],
          },
          {
            id: 'philippines',
            name: 'Philippines',
            ring: [
              [119, 6], [120, 14], [124, 16], [126, 12], [125, 7], [122, 5], [119, 6],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['spanish-empire'],
    sources: [
      { title: 'Wikipedia — Spanish Empire', url: 'https://en.wikipedia.org/wiki/Spanish_Empire' },
    ],
  },
  {
    id: 'aztec-empire',
    name: 'Aztec Empire',
    color: '#A855F7',
    type: 'empire',
    description:
      'Mesoamerican tributary empire centered on Tenochtitlan in the Valley of Mexico.',
    keyYears: [1428, 1475, 1519, 1521],
    overlays: [
      {
        year: 1428,
        label: 'Triple Alliance founding',
        approximation: 'schematic',
        regions: [
          {
            id: 'valley-mexico',
            name: 'Valley of Mexico core',
            ring: [
              [-99.8, 19.0], [-99.5, 19.8], [-98.7, 20.0], [-98.2, 19.5],
              [-98.4, 18.8], [-99.2, 18.6], [-99.8, 19.0],
            ],
          },
        ],
      },
      {
        year: 1475,
        label: 'Mid Triple Alliance expansion',
        approximation: 'schematic',
        regions: [
          {
            id: 'valley-mexico',
            name: 'Valley of Mexico',
            ring: [
              [-101.0, 18.2], [-100.2, 20.5], [-98.5, 21.2], [-97.2, 20.2],
              [-97.5, 18.5], [-98.8, 17.6], [-100.2, 17.8], [-101.0, 18.2],
            ],
          },
          {
            id: 'aztec-tributary',
            name: 'Tributary fringe (schematic)',
            ring: [
              [-100.5, 16.5], [-99.5, 18.0], [-97.5, 18.5], [-96.0, 17.5],
              [-96.5, 15.8], [-98.5, 15.5], [-100.0, 16.0], [-100.5, 16.5],
            ],
          },
        ],
      },
      {
        year: 1519,
        label: 'Triple Alliance peak (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'valley-mexico',
            name: 'Valley of Mexico / central Mexico',
            ring: [
              [-102.0, 17.0], [-100.5, 21.0], [-97.5, 22.0], [-94.5, 20.0],
              [-94.8, 17.0], [-97.0, 15.8], [-100.0, 15.8], [-102.0, 17.0],
            ],
          },
          {
            id: 'aztec-tributary',
            name: 'Gulf / Pacific tributary fringe',
            ring: [
              [-101.5, 16.0], [-99.0, 18.2], [-96.0, 19.0], [-94.0, 17.5],
              [-94.5, 15.5], [-97.5, 14.8], [-100.5, 15.0], [-101.5, 16.0],
            ],
          },
        ],
      },
      {
        year: 1521,
        label: 'Fall of Tenochtitlan (brief)',
        approximation: 'schematic',
        regions: [
          {
            id: 'valley-mexico',
            name: 'Valley remnant',
            ring: [
              [-99.9, 19.0], [-99.6, 19.7], [-98.9, 19.8], [-98.5, 19.3],
              [-98.7, 18.8], [-99.4, 18.7], [-99.9, 19.0],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['aztec'],
    sources: [
      { title: 'Wikipedia — Aztec Empire', url: 'https://en.wikipedia.org/wiki/Aztec_Empire' },
    ],
  },
  {
    id: 'inca-empire',
    name: 'Inca Empire',
    color: '#EA580C',
    type: 'empire',
    description:
      'Andean empire stretching along the western spine of South America before Spanish conquest.',
    keyYears: [1438, 1475, 1495, 1527],
    overlays: [
      {
        year: 1438,
        label: 'Pachacuti / early Tawantinsuyu',
        approximation: 'schematic',
        regions: [
          {
            id: 'peru',
            name: 'Cusco / Peru highlands core',
            ring: [
              [-73.5, -14.5], [-72.8, -12.5], [-71.2, -12.0], [-70.5, -13.5],
              [-71.0, -15.0], [-72.5, -15.2], [-73.5, -14.5],
            ],
          },
        ],
      },
      {
        year: 1475,
        label: 'Andean expansion under Topa Inca',
        approximation: 'schematic',
        regions: [
          {
            id: 'peru',
            name: 'Peru highlands',
            ring: [
              [-79.0, -16.0], [-77.5, -8.0], [-74.0, -5.5], [-70.5, -9.0],
              [-71.0, -16.5], [-75.5, -17.5], [-79.0, -16.0],
            ],
          },
          {
            id: 'andes-north',
            name: 'Northern Andes fringe (Ecuador)',
            ring: [
              [-80.5, -4.0], [-79.5, 0.5], [-77.0, 1.5], [-75.5, -1.0],
              [-76.5, -4.5], [-78.5, -5.0], [-80.5, -4.0],
            ],
          },
          {
            id: 'andes-south',
            name: 'Southern Andes fringe (Bolivia)',
            ring: [
              [-72.0, -18.0], [-70.5, -15.5], [-67.5, -16.0], [-66.5, -19.5],
              [-68.5, -21.0], [-71.0, -20.0], [-72.0, -18.0],
            ],
          },
        ],
      },
      {
        year: 1495,
        label: 'Huayna Capac Andean spine',
        approximation: 'schematic',
        regions: [
          {
            id: 'peru',
            name: 'Peru highlands',
            ring: [
              [-80.0, -17.0], [-78.0, -6.0], [-74.0, -3.5], [-69.5, -8.0],
              [-70.0, -17.5], [-75.5, -18.5], [-80.0, -17.0],
            ],
          },
          {
            id: 'andes-north',
            name: 'Northern Andes (Ecuador / S. Colombia)',
            ring: [
              [-81.0, -3.5], [-79.5, 1.5], [-76.5, 2.5], [-74.5, -0.5],
              [-76.0, -4.5], [-78.5, -5.0], [-81.0, -3.5],
            ],
          },
          {
            id: 'andes-south',
            name: 'Southern Andes (Bolivia / N. Chile)',
            ring: [
              [-73.0, -18.5], [-70.5, -15.0], [-67.0, -15.5], [-66.0, -20.5],
              [-68.0, -22.5], [-71.5, -21.5], [-73.0, -18.5],
            ],
          },
        ],
      },
      {
        year: 1527,
        label: 'Late Inca extent (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'peru',
            name: 'Peru highlands',
            ring: [
              [-80.5, -17.5], [-78.5, -5.5], [-74.0, -2.5], [-69.0, -7.5],
              [-69.5, -18.0], [-76.0, -19.0], [-80.5, -17.5],
            ],
          },
          {
            id: 'andes-north',
            name: 'Northern Andes corridor',
            ring: [
              [-81.5, -3.0], [-80.0, 2.0], [-76.0, 2.8], [-74.0, -0.5],
              [-75.5, -4.5], [-78.5, -5.0], [-81.5, -3.0],
            ],
          },
          {
            id: 'andes-south',
            name: 'Southern Andes corridor',
            ring: [
              [-73.5, -19.0], [-71.0, -14.5], [-66.5, -15.0], [-65.5, -21.0],
              [-68.0, -23.0], [-72.0, -22.0], [-73.5, -19.0],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['inca'],
    sources: [
      { title: 'Wikipedia — Inca Empire', url: 'https://en.wikipedia.org/wiki/Inca_Empire' },
    ],
  },
  {
    id: 'ming-china',
    name: 'Ming China',
    color: '#FBBF24',
    type: 'empire',
    description:
      'Ming dynasty restored Han Chinese rule after the Yuan; maritime voyages then inward turn.',
    keyYears: [1368, 1420, 1644],
    overlays: [
      {
        year: 1380,
        label: 'Early Ming consolidation',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper (early Ming)',
            ring: [
              [105, 23], [108, 33], [114, 40], [120, 39], [120, 28],
              [116, 23], [110, 22], [105, 23],
            ],
          },
        ],
      },
      {
        year: 1420,
        label: 'Early Ming (Yongle era approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [100, 22], [103, 32], [108, 40], [115, 42], [122, 41], [122, 30],
              [120, 24], [112, 21], [105, 22], [100, 22],
            ],
          },
        ],
      },
      {
        year: 1550,
        label: 'Mid–late Ming',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [102, 22], [104, 33], [110, 41], [118, 42], [122, 40], [122, 28],
              [118, 22], [110, 21], [104, 22], [102, 22],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['ming-dynasty'],
    sources: [
      { title: 'Wikipedia — Ming dynasty', url: 'https://en.wikipedia.org/wiki/Ming_dynasty' },
    ],
  },
  {
    id: 'mughal-empire',
    name: 'Mughal Empire',
    color: '#4D7C0F',
    type: 'empire',
    description:
      'Early modern Indian empire blending Persianate court culture with the subcontinent’s diversity.',
    keyYears: [1526, 1605, 1707],
    overlays: [
      {
        year: 1560,
        label: 'Early Akbar consolidation',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India / Hindustan',
            ring: [
              [74, 24], [76, 30], [84, 30], [86, 26], [82, 22], [76, 22], [74, 24],
            ],
          },
          {
            id: 'india-central',
            name: 'Central India fringe',
            ring: [
              [76, 20], [78, 25], [84, 25], [85, 21], [82, 18], [78, 18], [76, 20],
            ],
          },
        ],
      },
      {
        year: 1605,
        label: 'Akbar–Jahangir era (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India',
            ring: [
              [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
            ],
          },
          {
            id: 'india-central',
            name: 'Central India',
            ring: [
              [74, 18], [76, 26], [86, 26], [88, 20], [84, 16], [78, 16], [74, 18],
            ],
          },
          {
            id: 'india-deccan',
            name: 'Deccan fringe',
            ring: [
              [74, 14], [76, 22], [84, 22], [85, 16], [80, 12], [76, 12], [74, 14],
            ],
          },
        ],
      },
      {
        year: 1700,
        label: 'Aurangzeb-era extent',
        approximation: 'schematic',
        regions: [
          {
            id: 'india-north',
            name: 'North India',
            ring: [
              [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
            ],
          },
          {
            id: 'india-central',
            name: 'Central India',
            ring: [
              [74, 18], [76, 26], [86, 26], [88, 20], [84, 16], [78, 16], [74, 18],
            ],
          },
          {
            id: 'india-deccan',
            name: 'Deccan',
            ring: [
              [73, 13], [75, 22], [84, 22], [86, 15], [80, 11], [75, 11], [73, 13],
            ],
          },
          {
            id: 'india-south',
            name: 'South India fringe',
            ring: [
              [74, 8], [76, 15], [80, 16], [80, 10], [78, 8], [74, 8],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['mughal'],
    sources: [
      { title: 'Wikipedia — Mughal Empire', url: 'https://en.wikipedia.org/wiki/Mughal_Empire' },
    ],
  },
  {
    id: 'qing-china',
    name: 'Qing China',
    color: '#F472B6',
    type: 'empire',
    description:
      'Manchu-led Qing empire — China’s last imperial dynasty, with vast Inner Asian frontiers.',
    keyYears: [1644, 1750, 1911],
    overlays: [
      {
        year: 1680,
        label: 'Early Qing (Kangxi era approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [100, 22], [103, 32], [108, 40], [115, 42], [122, 41], [122, 30],
              [120, 24], [112, 21], [105, 22], [100, 22],
            ],
          },
          {
            id: 'manchuria',
            name: 'Manchuria',
            ring: [
              [120, 40], [122, 48], [132, 50], [135, 46], [130, 40], [122, 40], [120, 40],
            ],
          },
        ],
      },
      {
        year: 1750,
        label: 'High Qing (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [100, 22], [103, 32], [108, 40], [115, 42], [122, 41], [122, 30],
              [120, 24], [112, 21], [105, 22], [100, 22],
            ],
          },
          {
            id: 'tarim',
            name: 'Xinjiang / Tarim',
            ring: [
              [75, 37], [80, 42], [92, 43], [95, 40], [92, 36], [82, 36], [75, 37],
            ],
          },
          {
            id: 'mongolia',
            name: 'Mongolia fringe',
            ring: [
              [87, 44], [95, 50], [112, 52], [120, 50], [118, 44], [105, 42], [92, 42], [87, 44],
            ],
          },
          {
            id: 'manchuria',
            name: 'Manchuria',
            ring: [
              [120, 40], [122, 48], [132, 50], [135, 46], [130, 40], [122, 40], [120, 40],
            ],
          },
        ],
      },
      {
        year: 1900,
        label: 'Late Qing (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper',
            ring: [
              [102, 22], [104, 33], [110, 41], [118, 42], [122, 40], [122, 28],
              [118, 22], [110, 21], [104, 22], [102, 22],
            ],
          },
          {
            id: 'manchuria',
            name: 'Manchuria',
            ring: [
              [120, 40], [122, 48], [132, 50], [135, 46], [130, 40], [122, 40], [120, 40],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['qing-dynasty'],
    sources: [
      { title: 'Wikipedia — Qing dynasty', url: 'https://en.wikipedia.org/wiki/Qing_dynasty' },
    ],
  },
  {
    id: 'russian-empire',
    name: 'Russian Empire',
    color: '#3B82F6',
    type: 'empire',
    description:
      'Eurasian land empire expanding from Muscovy across Siberia to the Pacific and into Central Asia.',
    keyYears: [1721, 1800, 1914],
    overlays: [
      {
        year: 1700,
        label: 'Petrine Russia',
        approximation: 'schematic',
        regions: [
          { id: 'russia-european', name: 'European Russia', bbox: [28, 48, 60, 68] },
          { id: 'siberia-west', name: 'Western Siberia', bbox: [60, 50, 90, 68] },
        ],
      },
      {
        year: 1850,
        label: 'Mid-imperial Russia',
        approximation: 'schematic',
        regions: [
          { id: 'russia-european', name: 'European Russia' },
          { id: 'siberia-belt', name: 'Siberian belt', bbox: [60, 50, 140, 70] },
          { id: 'central-asia', name: 'Central Asia fringe' },
        ],
      },
      {
        year: 1914,
        label: 'Russian Empire on the eve of WWI',
        approximation: 'schematic',
        regions: [
          { id: 'russia-european', name: 'European Russia' },
          { id: 'siberia-belt', name: 'Siberia' },
          { id: 'central-asia', name: 'Central Asia' },
        ],
      },
    ],
    timelineItemIds: ['russian-empire'],
    sources: [
      { title: 'Wikipedia — Russian Empire', url: 'https://en.wikipedia.org/wiki/Russian_Empire' },
    ],
  },
  {
    id: 'british-empire',
    name: 'British Empire',
    color: '#38BDF8',
    type: 'empire',
    description:
      'Oceanic empire with settler colonies, Indian Raj, and African/Asian possessions at its Victorian peak.',
    keyYears: [1700, 1780, 1850, 1900, 1920],
    overlays: [
      {
        year: 1700,
        label: 'Early British Atlantic',
        approximation: 'schematic',
        regions: [
          {
            id: 'british-isles',
            name: 'British Isles',
            ring: [
              [-8, 51], [-7, 58], [-2, 59], [2, 56], [1, 51], [-3, 50], [-8, 51],
            ],
          },
          {
            id: 'east-north-america',
            name: 'Eastern North America fringe',
            ring: [
              [-80, 32], [-78, 46], [-65, 48], [-60, 40], [-70, 30], [-78, 30], [-80, 32],
            ],
          },
        ],
      },
      {
        year: 1780,
        label: 'Atlantic + India foothold',
        approximation: 'schematic',
        regions: [
          {
            id: 'british-isles',
            name: 'British Isles',
            ring: [
              [-8, 51], [-7, 58], [-2, 59], [2, 56], [1, 51], [-3, 50], [-8, 51],
            ],
          },
          {
            id: 'east-north-america',
            name: 'Eastern North America fringe',
            // Pre-/post-revolution coastal strip — slightly pinched vs 1700
            ring: [
              [-78, 31], [-76, 44], [-68, 46], [-62, 38], [-68, 30], [-76, 30], [-78, 31],
            ],
          },
          {
            id: 'canada-east',
            name: 'Eastern Canada',
            ring: [
              [-80, 44], [-78, 54], [-62, 54], [-56, 48], [-64, 43], [-76, 43], [-80, 44],
            ],
          },
          {
            id: 'india-north',
            name: 'India (Bengal / Company core)',
            ring: [
              [78, 20], [80, 28], [88, 28], [90, 24], [86, 20], [80, 19], [78, 20],
            ],
          },
          {
            id: 'australia-east',
            name: 'NSW / Botany Bay foothold',
            // Small mid-keyframe so 1850 eastern Australia does not hard-pop
            ring: [
              [148, -36], [149, -32], [152, -32], [153, -35], [151, -37], [148, -36],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean fringe',
            ring: [
              [-78, 17], [-77, 22], [-70, 22], [-62, 18], [-64, 13], [-72, 14], [-78, 17],
            ],
          },
        ],
      },
      {
        year: 1850,
        label: 'Victorian expansion',
        approximation: 'schematic',
        regions: [
          {
            id: 'british-isles',
            name: 'British Isles',
            ring: [
              [-8, 51], [-7, 58], [-2, 59], [2, 56], [1, 51], [-3, 50], [-8, 51],
            ],
          },
          {
            id: 'india-north',
            name: 'India (Raj core)',
            ring: [
              [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
            ],
          },
          {
            id: 'india-deccan',
            name: 'India Deccan',
            ring: [
              [74, 14], [76, 22], [84, 22], [85, 16], [80, 12], [76, 12], [74, 14],
            ],
          },
          {
            id: 'australia-east',
            name: 'Eastern Australia',
            ring: [
              [140, -36], [142, -16], [152, -12], [154, -28], [150, -38], [144, -38], [140, -36],
            ],
          },
          {
            id: 'south-africa',
            name: 'South Africa fringe',
            ring: [
              [16, -34], [18, -24], [30, -22], [32, -28], [28, -35], [20, -35], [16, -34],
            ],
          },
          {
            id: 'canada-east',
            name: 'Eastern Canada',
            ring: [
              [-80, 44], [-78, 54], [-60, 55], [-55, 48], [-62, 42], [-75, 42], [-80, 44],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean',
            ring: [
              [-80, 16], [-78, 23], [-70, 23], [-61, 18], [-62, 12], [-72, 13], [-80, 16],
            ],
          },
        ],
      },
      {
        year: 1900,
        label: 'British peak (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'british-isles',
            name: 'British Isles',
            ring: [
              [-8, 51], [-7, 58], [-2, 59], [2, 56], [1, 51], [-3, 50], [-8, 51],
            ],
          },
          {
            id: 'india-north',
            name: 'India',
            ring: [
              [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
            ],
          },
          {
            id: 'india-deccan',
            name: 'India Deccan',
            ring: [
              [74, 14], [76, 22], [84, 22], [85, 16], [80, 12], [76, 12], [74, 14],
            ],
          },
          {
            id: 'india-south',
            name: 'South India',
            ring: [
              [74, 8], [76, 15], [80, 16], [80, 10], [78, 8], [74, 8],
            ],
          },
          {
            id: 'australia-east',
            name: 'Australia east',
            ring: [
              [140, -36], [142, -16], [152, -12], [154, -28], [150, -38], [144, -38], [140, -36],
            ],
          },
          {
            id: 'canada-east',
            name: 'Eastern Canada',
            ring: [
              [-80, 44], [-78, 54], [-60, 55], [-55, 48], [-62, 42], [-75, 42], [-80, 44],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt (occupation)',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
          {
            id: 'south-africa',
            name: 'South Africa',
            ring: [
              [16, -34], [18, -24], [30, -22], [32, -28], [28, -35], [20, -35], [16, -34],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean',
            ring: [
              [-80, 16], [-78, 23], [-70, 23], [-61, 18], [-62, 12], [-72, 13], [-80, 16],
            ],
          },
        ],
      },
      {
        year: 1920,
        label: 'Interwar peak extent (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'british-isles',
            name: 'British Isles',
            ring: [
              [-8, 51], [-7, 58], [-2, 59], [2, 56], [1, 51], [-3, 50], [-8, 51],
            ],
          },
          {
            id: 'india-north',
            name: 'India',
            ring: [
              [70, 22], [72, 33], [86, 33], [92, 28], [90, 22], [80, 19], [72, 20], [70, 22],
            ],
          },
          {
            id: 'india-deccan',
            name: 'India Deccan',
            ring: [
              [74, 14], [76, 22], [84, 22], [85, 16], [80, 12], [76, 12], [74, 14],
            ],
          },
          {
            id: 'india-south',
            name: 'South India',
            ring: [
              [74, 8], [76, 15], [80, 16], [80, 10], [78, 8], [74, 8],
            ],
          },
          {
            id: 'australia-east',
            name: 'Australia east',
            ring: [
              [140, -36], [142, -16], [152, -12], [154, -28], [150, -38], [144, -38], [140, -36],
            ],
          },
          {
            id: 'canada-east',
            name: 'Eastern Canada',
            ring: [
              [-80, 44], [-78, 54], [-60, 55], [-55, 48], [-62, 42], [-75, 42], [-80, 44],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt / Near East mandate fringe',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [36, 30], [34, 24], [29, 22], [25, 22],
            ],
          },
          {
            id: 'south-africa',
            name: 'South Africa',
            ring: [
              [16, -34], [18, -24], [30, -22], [32, -28], [28, -35], [20, -35], [16, -34],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean',
            ring: [
              [-80, 16], [-78, 23], [-70, 23], [-61, 18], [-62, 12], [-72, 13], [-80, 16],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['british-empire', 'british-raj'],
    sources: [
      { title: 'Wikipedia — British Empire', url: 'https://en.wikipedia.org/wiki/British_Empire' },
    ],
  },

  // --- Day 17 densification: ancient + colonial pass ---
  {
    id: 'achaemenid-empire',
    name: 'Achaemenid Persian Empire',
    color: '#C2410C',
    type: 'empire',
    description:
      'First true superpower of the ancient Near East — schematic core from Anatolia and Egypt to the Iranian plateau.',
    keyYears: [-550, -540, -500, -400],
    overlays: [
      {
        year: -540,
        label: 'Cyrus–Cambyses rise',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau',
            ring: [
              [46, 28], [48, 36], [56, 38], [60, 34], [58, 28], [52, 26], [46, 28],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Height under Darius',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau',
            ring: [
              [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
          {
            id: 'anatolia',
            name: 'Anatolia',
            ring: [
              [26, 36], [28, 42], [36, 42], [44, 40], [42, 36], [35, 35], [28, 35], [26, 36],
            ],
          },
        ],
      },
      {
        year: -400,
        label: 'Late Achaemenid',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau',
            ring: [
              [44, 26], [46, 38], [55, 40], [60, 36], [58, 28], [52, 25], [44, 26],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36], [39, 36.5], [41, 33], [39, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'anatolia',
            name: 'Anatolia',
            ring: [
              [27, 36], [29, 41], [36, 41], [42, 39], [40, 36], [34, 35], [28, 35], [27, 36],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['persian-achaemenid'],
    sources: [
      { title: 'Wikipedia — Achaemenid Empire', url: 'https://en.wikipedia.org/wiki/Achaemenid_Empire' },
    ],
  },
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    color: '#A16207',
    type: 'civilization',
    description:
      'Nile-valley civilisation across Old, Middle, and New Kingdoms — schematic river-core influence.',
    keyYears: [-3000, -2686, -2500, -2000, -1500, -1250, -500, -30],
    overlays: [
      {
        year: -3000,
        label: 'Early Dynastic Nile',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
        ],
      },
      {
        year: -2500,
        label: 'Old Kingdom Nile core',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
        ],
      },
      {
        year: -2000,
        label: 'Middle Kingdom',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
          { id: 'nile-upper', name: 'Upper Nile fringe' },
        ],
      },
      {
        year: -1500,
        label: 'New Kingdom rise',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
          { id: 'nile-upper', name: 'Upper Nile fringe' },
          { id: 'levant', name: 'Levant fringe' },
        ],
      },
      {
        year: -1250,
        label: 'New Kingdom core',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
          { id: 'nile-upper', name: 'Upper Nile fringe', bbox: [30, 10, 36, 22] },
        ],
      },
      {
        year: -500,
        label: 'Late Period',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
        ],
      },
    ],
    timelineItemIds: ['ancient-egypt'],
    sources: [
      { title: 'Wikipedia — Ancient Egypt', url: 'https://en.wikipedia.org/wiki/Ancient_Egypt' },
    ],
  },
  {
    id: 'classical-greece',
    name: 'Classical Greece',
    color: '#1D4ED8',
    type: 'civilization',
    description:
      'City-state world of the Aegean and southern Balkans — schematic cultural-political core, not a unitary empire.',
    keyYears: [-480, -450, -350],
    overlays: [
      {
        year: -480,
        label: 'Persian Wars era',
        approximation: 'schematic',
        regions: [
          {
            id: 'greece',
            name: 'Greece / Aegean',
            ring: [
              [20, 36], [21, 40], [24, 41], [26, 39], [25, 36], [22, 35.5], [20, 36],
            ],
          },
        ],
      },
      {
        year: -450,
        label: 'Classical Aegean',
        approximation: 'schematic',
        regions: [
          {
            id: 'greece',
            name: 'Greece / Aegean',
            ring: [
              [19, 36], [20, 41], [24, 42], [28, 41], [27, 36], [24, 35], [21, 35], [19, 36],
            ],
          },
        ],
      },
      {
        year: -350,
        label: 'Late Classical / Macedonian rise',
        approximation: 'schematic',
        regions: [
          {
            id: 'greece',
            name: 'Greece / Aegean',
            ring: [
              [19, 36], [20, 41.5], [24, 42.5], [28, 41], [27, 36], [24, 35], [21, 35], [19, 36],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['classical-greece'],
    sources: [
      { title: 'Wikipedia — Classical Greece', url: 'https://en.wikipedia.org/wiki/Classical_Greece' },
    ],
  },
  {
    id: 'carthage',
    name: 'Carthage',
    color: '#7F1D1D',
    type: 'empire',
    description:
      'Phoenician-founded North African power with western Mediterranean trade reach — schematic Maghreb core.',
    keyYears: [-814, -500, -264, -146],
    overlays: [
      {
        year: -700,
        label: 'Early Carthage / Maghreb core',
        approximation: 'schematic',
        regions: [
          {
            id: 'carthage-core',
            name: 'Carthage / Tunisia',
            ring: [
              [8, 33], [9, 37.5], [12, 38], [11, 33], [9, 32], [8, 33],
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Punic western Med',
        approximation: 'schematic',
        regions: [
          {
            id: 'carthage-core',
            name: 'Carthage / Tunisia',
            ring: [
              [8, 33], [9, 37.5], [12, 38], [11, 33], [9, 32], [8, 33],
            ],
          },
          {
            id: 'maghreb-east',
            name: 'Eastern Maghreb fringe',
            ring: [
              [5, 30], [8, 36], [20, 37], [25, 33], [22, 30], [10, 30], [5, 30],
            ],
          },
        ],
      },
      {
        year: -220,
        label: 'Before Second Punic War',
        approximation: 'schematic',
        regions: [
          {
            id: 'carthage-core',
            name: 'Carthage / Tunisia',
            ring: [
              [8, 33], [9, 37.5], [12, 38], [11, 33], [9, 32], [8, 33],
            ],
          },
          {
            id: 'iberia',
            name: 'Iberian fringe',
            ring: [
              [-10, 37], [-9, 43], [-2, 44], [3, 42], [2, 37], [-5, 36], [-10, 37],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['carthage'],
    sources: [
      { title: 'Wikipedia — Ancient Carthage', url: 'https://en.wikipedia.org/wiki/Ancient_Carthage' },
    ],
  },
  {
    id: 'sassanid-empire',
    name: 'Sassanid Empire',
    color: '#9D174D',
    type: 'empire',
    description:
      'Late antique Iranian empire rivaling Rome and Byzantium — schematic Persia–Mesopotamia core.',
    keyYears: [224, 400, 620, 651],
    overlays: [
      {
        year: 260,
        label: 'Early Sassanid (Shapur era approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau',
            ring: [
              [46, 27], [48, 37], [56, 39], [60, 34], [56, 27], [50, 25], [46, 27],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
        ],
      },
      {
        year: 400,
        label: 'Sassanid high',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau',
            ring: [
              [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'parthia-east',
            name: 'Eastern fringe',
            ring: [
              [55, 32], [58, 39], [68, 40], [70, 35], [65, 30], [58, 30], [55, 32],
            ],
          },
        ],
      },
      {
        year: 620,
        label: 'Late Sassanid',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iranian plateau',
            ring: [
              [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'levant',
            name: 'Levant fringe',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt (briefly)',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['sassanid'],
    sources: [
      { title: 'Wikipedia — Sasanian Empire', url: 'https://en.wikipedia.org/wiki/Sasanian_Empire' },
    ],
  },
  {
    id: 'umayyad-caliphate',
    name: 'Umayyad Caliphate',
    color: '#115E59',
    type: 'empire',
    description:
      'Early Islamic caliphate spanning Iberia to Central Asia — schematic Maghreb–Near East–Iberia arc.',
    keyYears: [661, 680, 720, 740],
    overlays: [
      {
        year: 680,
        label: 'Early Umayyad (Near East core)',
        approximation: 'schematic',
        regions: [
          {
            id: 'levant',
            name: 'Levant / Syria',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
        ],
      },
      {
        year: 720,
        label: 'Umayyad extent',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Al-Andalus / Iberia',
            ring: [
              [-10, 37], [-9, 43], [-2, 44], [3, 42], [2, 37], [-5, 36], [-10, 37],
            ],
          },
          {
            id: 'maghreb-east',
            name: 'Maghreb',
            ring: [
              [5, 30], [8, 36], [20, 37], [25, 33], [22, 30], [10, 30], [5, 30],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
          {
            id: 'persia',
            name: 'Iran fringe',
            ring: [
              [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
            ],
          },
        ],
      },
      {
        year: 740,
        label: 'Late Umayyad (pre-Abbasid)',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Al-Andalus / Iberia',
            ring: [
              [-10, 37], [-9, 43], [-2, 44], [3, 42], [2, 37], [-5, 36], [-10, 37],
            ],
          },
          {
            id: 'maghreb-east',
            name: 'Maghreb',
            ring: [
              [5, 30], [8, 36], [18, 36], [22, 33], [18, 30], [10, 30], [5, 30],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
          {
            id: 'levant',
            name: 'Levant',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['umayyad-caliphate'],
    sources: [
      { title: 'Wikipedia — Umayyad Caliphate', url: 'https://en.wikipedia.org/wiki/Umayyad_Caliphate' },
    ],
  },
  {
    id: 'holy-roman-empire',
    name: 'Holy Roman Empire',
    color: '#B45309',
    type: 'empire',
    description:
      'Central European patchwork empire — schematic German–Italian core, not precise princely borders.',
    keyYears: [962, 1050, 1250, 1550],
    overlays: [
      {
        year: 980,
        label: 'Ottonian core',
        approximation: 'schematic',
        regions: [
          {
            id: 'central-europe-hre',
            name: 'German lands (Ottonian)',
            ring: [
              [6, 47], [8, 53], [14, 54], [16, 50], [14, 47], [10, 46], [6, 47],
            ],
          },
        ],
      },
      {
        year: 1050,
        label: 'Ottonian–Salian core',
        approximation: 'schematic',
        regions: [
          {
            id: 'central-europe-hre',
            name: 'German lands',
            ring: [
              [5, 46], [7, 54], [15, 55], [18, 50], [16, 46], [10, 45], [5, 46],
            ],
          },
          {
            id: 'italy',
            name: 'Northern Italy fringe',
            ring: [
              [8.2, 44.0], [9.5, 45.8], [12.5, 46.5], [13.8, 45.6], [12.4, 43.8],
              [11.0, 43.0], [9.0, 43.2], [8.2, 44.0],
            ],
          },
        ],
      },
      {
        year: 1250,
        label: 'High medieval HRE',
        approximation: 'schematic',
        regions: [
          {
            id: 'central-europe-hre',
            name: 'German lands',
            ring: [
              [5, 46], [7, 54], [15, 55], [18, 50], [16, 46], [10, 45], [5, 46],
            ],
          },
          {
            id: 'frankish-east',
            name: 'East Francia fringe',
            ring: [
              [5, 46], [8, 53], [16, 54], [18, 50], [14, 46], [8, 45], [5, 46],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['holy-roman-empire'],
    sources: [
      { title: 'Wikipedia — Holy Roman Empire', url: 'https://en.wikipedia.org/wiki/Holy_Roman_Empire' },
    ],
  },
  {
    id: 'portuguese-empire',
    name: 'Portuguese Empire',
    color: '#16A34A',
    type: 'empire',
    description:
      'Early modern oceanic empire — schematic Iberian home plus Brazilian and African footholds.',
    keyYears: [1415, 1500, 1600, 1700, 1822],
    overlays: [
      {
        year: 1500,
        label: 'Age of Discovery',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Portugal / Iberia west',
            ring: [
              [-9.5, 37.0], [-9.2, 42.0], [-7.5, 42.2], [-6.2, 41.5], [-6.5, 39.5],
              [-7.5, 37.0], [-8.8, 36.8], [-9.5, 37.0],
            ],
          },
          {
            id: 'brazil-coast',
            name: 'Brazilian coast',
            ring: [
              [-48, -24], [-46, -12], [-40, -8], [-35, -12], [-38, -22], [-44, -25], [-48, -24],
            ],
          },
          {
            id: 'west-africa-coast',
            name: 'West African forts',
            ring: [
              [-18, 5], [-16, 14], [-10, 15], [-5, 10], [-8, 4], [-14, 4], [-18, 5],
            ],
          },
          {
            id: 'goa-fringe',
            name: 'Goa / India fringe',
            ring: [
              [72.5, 14.5], [73.0, 16.5], [74.5, 16.2], [74.8, 14.8], [73.8, 14.0], [72.5, 14.5],
            ],
          },
        ],
      },
      {
        year: 1600,
        label: 'Atlantic + Indian Ocean footholds',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Portugal',
            ring: [
              [-9.5, 37.0], [-9.2, 42.0], [-7.5, 42.2], [-6.2, 41.5], [-6.5, 39.5],
              [-7.5, 37.0], [-8.8, 36.8], [-9.5, 37.0],
            ],
          },
          {
            id: 'brazil-coast',
            name: 'Brazil coast',
            ring: [
              [-50, -25], [-48, -10], [-40, -5], [-35, -12], [-38, -24], [-46, -26], [-50, -25],
            ],
          },
          {
            id: 'west-africa-coast',
            name: 'West Africa fringe',
            ring: [
              [-18, 5], [-16, 14], [-8, 15], [-5, 8], [-8, 4], [-14, 4], [-18, 5],
            ],
          },
          {
            id: 'angola-coast',
            name: 'Angola foothold',
            ring: [
              [12, -18], [13, -10], [16, -8], [17, -14], [15, -18], [12, -18],
            ],
          },
          {
            id: 'goa-fringe',
            name: 'Goa / India fringe',
            ring: [
              [72.2, 14.2], [72.8, 17.0], [75.0, 16.8], [75.2, 14.5], [73.5, 13.8], [72.2, 14.2],
            ],
          },
        ],
      },
      {
        year: 1700,
        label: 'Brazil & Atlantic peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'iberia',
            name: 'Portugal',
            ring: [
              [-9.5, 37.0], [-9.2, 42.0], [-7.5, 42.2], [-6.2, 41.5], [-6.5, 39.5],
              [-7.5, 37.0], [-8.8, 36.8], [-9.5, 37.0],
            ],
          },
          {
            id: 'brazil-coast',
            name: 'Brazil',
            ring: [
              [-52, -28], [-50, -8], [-42, -2], [-35, -8], [-36, -22], [-44, -30], [-52, -28],
            ],
          },
          {
            id: 'west-africa-coast',
            name: 'West Africa fringe',
            ring: [
              [-18, 5], [-16, 14], [-8, 15], [-5, 8], [-8, 4], [-14, 4], [-18, 5],
            ],
          },
          {
            id: 'angola-coast',
            name: 'Angola',
            ring: [
              [11, -18], [12, -9], [16, -8], [18, -14], [16, -18], [11, -18],
            ],
          },
          {
            id: 'goa-fringe',
            name: 'Goa / India fringe',
            ring: [
              [72.2, 14.2], [72.8, 17.0], [75.0, 16.8], [75.2, 14.5], [73.5, 13.8], [72.2, 14.2],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['portugal'],
    sources: [
      { title: 'Wikipedia — Portuguese Empire', url: 'https://en.wikipedia.org/wiki/Portuguese_Empire' },
    ],
  },
  {
    id: 'dutch-republic',
    name: 'Dutch Republic / Empire',
    color: '#F97316',
    type: 'empire',
    description:
      'Dutch Golden Age maritime power — schematic Low Countries plus East Indies footholds.',
    keyYears: [1581, 1650, 1700, 1795],
    overlays: [
      {
        year: 1600,
        label: 'Early VOC era',
        approximation: 'schematic',
        regions: [
          {
            id: 'low-countries',
            name: 'Low Countries',
            ring: [
              [3.2, 50.5], [3.5, 53.5], [5.5, 53.8], [7.2, 53.5], [7.5, 51.0],
              [5.5, 50.2], [3.2, 50.5],
            ],
          },
          {
            id: 'java-bali',
            name: 'Java foothold',
            ring: [
              [105.5, -8.2], [106.5, -6], [111, -5.8], [112, -7.5], [110, -8.5],
              [107, -8.5], [105.5, -8.2],
            ],
          },
        ],
      },
      {
        year: 1650,
        label: 'Dutch Golden Age',
        approximation: 'schematic',
        regions: [
          {
            id: 'low-countries',
            name: 'Low Countries',
            ring: [
              [3.2, 50.5], [3.5, 53.5], [5.5, 53.8], [7.2, 53.5], [7.5, 51.0],
              [5.5, 50.2], [3.2, 50.5],
            ],
          },
          {
            id: 'java-bali',
            name: 'East Indies / Java',
            ring: [
              [105, -8.5], [106, -5.5], [112, -5.2], [116, -6], [115, -8.5],
              [110, -9], [106, -9], [105, -8.5],
            ],
          },
          {
            id: 'south-africa',
            name: 'Cape foothold',
            ring: [
              [17, -35], [18, -32], [22, -32], [23, -34], [20, -35.5], [17, -35],
            ],
          },
        ],
      },
      {
        year: 1700,
        label: 'VOC peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'low-countries',
            name: 'Low Countries',
            ring: [
              [3.2, 50.5], [3.5, 53.5], [5.5, 53.8], [7.2, 53.5], [7.5, 51.0],
              [5.5, 50.2], [3.2, 50.5],
            ],
          },
          {
            id: 'java-bali',
            name: 'Java / Spice Islands fringe',
            ring: [
              [105, -8.5], [106, -5.5], [112, -5.0], [116, -5.5], [116, -8],
              [112, -9], [106, -9], [105, -8.5],
            ],
          },
          {
            id: 'south-africa',
            name: 'Cape fringe',
            ring: [
              [16, -35], [18, -31], [24, -30], [26, -33], [22, -35.5], [18, -35.5], [16, -35],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['dutch-republic'],
    sources: [
      { title: 'Wikipedia — Dutch Empire', url: 'https://en.wikipedia.org/wiki/Dutch_Empire' },
    ],
  },
  {
    id: 'french-colonial',
    name: 'French Colonial Empire',
    color: '#2563EB',
    type: 'empire',
    description:
      'French Atlantic and later African/Asian empire — schematic metro France plus early colonial footholds.',
    keyYears: [1534, 1700, 1830, 1914],
    overlays: [
      {
        year: 1700,
        label: 'First colonial empire',
        approximation: 'schematic',
        regions: [
          {
            id: 'frankish-west',
            name: 'Metropolitan France',
            ring: [
              [-5, 43], [-4, 50], [0, 51], [4, 50.5], [6, 47], [5, 43.5],
              [1, 42.5], [-3, 43], [-5, 43],
            ],
          },
          {
            id: 'canada-east',
            name: 'New France fringe',
            ring: [
              [-78, 44], [-76, 52], [-64, 52], [-58, 48], [-64, 44], [-74, 43], [-78, 44],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean footholds',
            ring: [
              [-62, 14], [-61.5, 16.5], [-60.5, 16.2], [-60.8, 14.2], [-62, 14],
            ],
          },
          {
            id: 'west-africa-coast',
            name: 'West Africa fringe',
            ring: [
              [-18, 5], [-16, 14], [-10, 15], [-5, 10], [-8, 4], [-14, 4], [-18, 5],
            ],
          },
        ],
      },
      {
        year: 1830,
        label: 'Mid colonial transition (Algeria era)',
        approximation: 'schematic',
        regions: [
          {
            id: 'frankish-west',
            name: 'France',
            ring: [
              [-5, 43], [-4, 50], [0, 51], [4, 50.5], [6, 47], [5, 43.5],
              [1, 42.5], [-3, 43], [-5, 43],
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean footholds',
            ring: [
              [-62, 14], [-61.5, 16.5], [-60.5, 16.2], [-60.8, 14.2], [-62, 14],
            ],
          },
          {
            id: 'maghreb-east',
            name: 'Algeria / Maghreb fringe',
            ring: [
              [-8, 30], [-6, 36], [4, 37], [10, 35], [8, 30], [0, 29], [-8, 30],
            ],
          },
          {
            id: 'west-africa-coast',
            name: 'West Africa fringe',
            ring: [
              [-18, 5], [-16, 14], [-10, 15], [-5, 10], [-8, 4], [-14, 4], [-18, 5],
            ],
          },
        ],
      },
      {
        year: 1914,
        label: 'Second colonial empire',
        approximation: 'schematic',
        regions: [
          {
            id: 'frankish-west',
            name: 'France',
            ring: [
              [-5, 43], [-4, 50], [0, 51], [4, 50.5], [6, 47], [5, 43.5],
              [1, 42.5], [-3, 43], [-5, 43],
            ],
          },
          {
            id: 'maghreb-east',
            name: 'Maghreb',
            ring: [
              [-8, 30], [-6, 36], [4, 37], [10, 35], [8, 30], [0, 29], [-8, 30],
            ],
          },
          {
            id: 'west-africa-sahel',
            name: 'West Africa Sahel',
            ring: [
              [-16, 10], [-14, 18], [-4, 20], [4, 16], [2, 10], [-8, 8], [-16, 10],
            ],
          },
          {
            id: 'mainland-sea',
            name: 'Indochina fringe',
            ring: [
              [102, 10], [104, 18], [108, 18], [110, 14], [108, 9], [104, 9], [102, 10],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['french-colonial'],
    sources: [
      { title: 'Wikipedia — French colonial empire', url: 'https://en.wikipedia.org/wiki/French_colonial_empire' },
    ],
  },
  {
    id: 'safavid-empire',
    name: 'Safavid Empire',
    color: '#5B21B6',
    type: 'empire',
    description:
      'Early modern Iranian empire that shaped Shiʿa identity — schematic Persia core.',
    keyYears: [1501, 1520, 1620, 1700],
    overlays: [
      {
        year: 1520,
        label: 'Early Safavid Persia',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iran / Persia',
            ring: [
              [46, 28], [48, 36], [56, 38], [60, 34], [58, 28], [52, 26], [46, 28],
            ],
          },
        ],
      },
      {
        year: 1620,
        label: 'Safavid golden age',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iran / Persia',
            ring: [
              [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
            ],
          },
          {
            id: 'mesopotamia',
            name: 'Mesopotamia fringe',
            ring: [
              [40, 31], [42, 35], [46, 36], [48, 33], [46, 30], [42, 30], [40, 31],
            ],
          },
          {
            id: 'caucasus-south',
            name: 'South Caucasus fringe',
            ring: [
              [43, 39], [44, 42.5], [49, 42], [50, 39], [47, 38], [43, 39],
            ],
          },
        ],
      },
      {
        year: 1700,
        label: 'Late Safavid',
        approximation: 'schematic',
        regions: [
          {
            id: 'persia',
            name: 'Iran / Persia',
            ring: [
              [45, 27], [47, 37], [55, 39], [60, 35], [58, 28], [52, 26], [45, 27],
            ],
          },
          {
            id: 'caucasus-south',
            name: 'South Caucasus fringe',
            ring: [
              [44, 39], [45, 42], [49, 41.5], [49.5, 39], [47, 38], [44, 39],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['safavid'],
    sources: [
      { title: 'Wikipedia — Safavid dynasty', url: 'https://en.wikipedia.org/wiki/Safavid_dynasty' },
    ],
  },
  {
    id: 'maya',
    name: 'Maya Civilisation',
    color: '#65A30D',
    type: 'civilization',
    description:
      'Mesoamerican civilisation of the Yucatán and highlands — schematic Classic-period core.',
    keyYears: [-2000, -1500, -500, 250, 800, 1500],
    overlays: [
      {
        year: -2000,
        label: 'Archaic / early Maya fringe',
        approximation: 'schematic',
        regions: [
          { id: 'yucatan', name: 'Yucatán / Maya lowlands', bbox: [-92, 14, -86, 22] },
        ],
      },
      {
        year: -1500,
        label: 'Early Preclassic Maya',
        approximation: 'schematic',
        regions: [
          { id: 'yucatan', name: 'Yucatán / Maya lowlands' },
        ],
      },
      {
        year: -500,
        label: 'Preclassic Maya fringe',
        approximation: 'schematic',
        regions: [
          { id: 'yucatan', name: 'Yucatán / Maya lowlands' },
        ],
      },
      {
        year: 800,
        label: 'Classic Maya',
        approximation: 'schematic',
        regions: [
          { id: 'yucatan', name: 'Yucatán / Maya lowlands' },
          { id: 'mesoamerica', name: 'Southern Mesoamerica fringe' },
        ],
      },
    ],
    timelineItemIds: ['maya'],
    sources: [
      { title: 'Wikipedia — Maya civilization', url: 'https://en.wikipedia.org/wiki/Maya_civilization' },
    ],
  },
  {
    id: 'songhai-empire',
    name: 'Songhai Empire',
    color: '#D97706',
    type: 'empire',
    description:
      'West African Sahel empire succeeding Mali along the Niger bend — schematic Sahel core.',
    keyYears: [1430, 1460, 1500, 1550],
    overlays: [
      {
        year: 1460,
        label: 'Early Songhai rise',
        approximation: 'schematic',
        regions: [
          {
            id: 'west-africa-sahel',
            name: 'Sahel / Niger bend core',
            ring: [
              [-6, 13], [-4, 17], [2, 18], [4, 15], [2, 12], [-4, 12], [-6, 13],
            ],
          },
        ],
      },
      {
        year: 1500,
        label: 'Songhai height',
        approximation: 'schematic',
        regions: [
          {
            id: 'west-africa-sahel',
            name: 'Sahel / Niger bend',
            ring: [
              [-12, 12], [-10, 18], [0, 20], [4, 16], [2, 11], [-6, 10], [-12, 12],
            ],
          },
          {
            id: 'west-africa-coast',
            name: 'Gulf of Guinea fringe',
            ring: [
              [-5, 6], [-3, 12], [2, 12], [3, 8], [0, 5], [-4, 5], [-5, 6],
            ],
          },
        ],
      },
      {
        year: 1550,
        label: 'Late Songhai',
        approximation: 'schematic',
        regions: [
          {
            id: 'west-africa-sahel',
            name: 'Sahel / Niger bend',
            ring: [
              [-10, 12], [-8, 17], [1, 18], [3, 15], [1, 11], [-6, 11], [-10, 12],
            ],
          },
          {
            id: 'west-africa-coast',
            name: 'Gulf of Guinea fringe',
            ring: [
              [-4, 7], [-2, 12], [2, 12], [2.5, 8], [0, 6], [-3, 6], [-4, 7],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['songhai'],
    sources: [
      { title: 'Wikipedia — Songhai Empire', url: 'https://en.wikipedia.org/wiki/Songhai_Empire' },
    ],
  },
  {
    id: 'majapahit-empire',
    name: 'Majapahit Empire',
    color: '#E11D48',
    type: 'empire',
    description:
      'Maritime Southeast Asian empire centered on Java — schematic archipelago core.',
    keyYears: [1293, 1300, 1350, 1450],
    overlays: [
      {
        year: 1300,
        label: 'Early Majapahit (Java core)',
        approximation: 'schematic',
        regions: [
          {
            id: 'java-bali',
            name: 'Java / Bali',
            ring: [
              [106, -8.2], [107, -6.0], [114, -5.5], [115, -8.0], [112, -8.8], [107, -8.8], [106, -8.2],
            ],
          },
        ],
      },
      {
        year: 1350,
        label: 'Majapahit thalassocracy',
        approximation: 'schematic',
        regions: [
          {
            id: 'java-bali',
            name: 'Java / Bali',
            ring: [
              [105, -8.5], [106, -5.5], [115, -5], [116, -8], [112, -9], [106, -9], [105, -8.5],
            ],
          },
          {
            id: 'sumatra-south',
            name: 'Southern Sumatra fringe',
            ring: [
              [100, -5], [102, 1], [106, 2], [105, -4], [102, -6], [100, -5],
            ],
          },
        ],
      },
      {
        year: 1450,
        label: 'Late Majapahit',
        approximation: 'schematic',
        regions: [
          {
            id: 'java-bali',
            name: 'Java / Bali',
            ring: [
              [106, -8.3], [107, -5.8], [114, -5.5], [115, -8.0], [111, -8.8], [107, -8.8], [106, -8.3],
            ],
          },
          {
            id: 'sumatra-south',
            name: 'Southern Sumatra fringe',
            ring: [
              [101, -4], [103, 0], [106, 1], [105, -3.5], [103, -5], [101, -4],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['majapahit'],
    sources: [
      { title: 'Wikipedia — Majapahit', url: 'https://en.wikipedia.org/wiki/Majapahit' },
    ],
  },
  {
    id: 'meiji-japan',
    name: 'Imperial Japan',
    color: '#BE185D',
    type: 'empire',
    description:
      'Meiji-to-Shōwa imperial state — schematic home islands plus early overseas footholds.',
    keyYears: [1868, 1905, 1914, 1945],
    overlays: [
      {
        year: 1875,
        label: 'Early Meiji home islands',
        approximation: 'schematic',
        regions: [
          {
            id: 'japan-honshu',
            name: 'Japanese home islands',
            ring: [
              [129, 31], [131, 42], [141, 46], [146, 43], [142, 35], [136, 33], [131, 30], [129, 31],
            ],
          },
        ],
      },
      {
        year: 1905,
        label: 'After Russo-Japanese War',
        approximation: 'schematic',
        regions: [
          {
            id: 'japan-honshu',
            name: 'Japanese home islands',
            ring: [
              [129, 31], [131, 42], [141, 46], [146, 43], [142, 35], [136, 33], [131, 30], [129, 31],
            ],
          },
          {
            id: 'korea-peninsula',
            name: 'Korea (protectorate fringe)',
            ring: [
              [124, 34], [126, 42], [130, 43], [129, 35], [127, 33], [124, 34],
            ],
          },
          {
            id: 'manchuria',
            name: 'Manchuria fringe',
            ring: [
              [120, 40], [122, 48], [132, 50], [135, 46], [130, 40], [122, 40], [120, 40],
            ],
          },
        ],
      },
      {
        year: 1914,
        label: 'Early 20th-century empire',
        approximation: 'schematic',
        regions: [
          {
            id: 'japan-honshu',
            name: 'Home islands',
            ring: [
              [129, 31], [131, 42], [141, 46], [146, 43], [142, 35], [136, 33], [131, 30], [129, 31],
            ],
          },
          {
            id: 'korea-peninsula',
            name: 'Korea',
            ring: [
              [124, 34], [126, 42], [130, 43], [129, 35], [127, 33], [124, 34],
            ],
          },
          {
            id: 'manchuria',
            name: 'Manchuria fringe',
            ring: [
              [120, 40], [122, 48], [132, 50], [135, 46], [130, 40], [122, 40], [120, 40],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['meiji-japan'],
    sources: [
      { title: 'Wikipedia — Empire of Japan', url: 'https://en.wikipedia.org/wiki/Empire_of_Japan' },
    ],
  },

  // --- Day 19: early Bronze Age fill (3000–1200 BCE) ---
  {
    id: 'mesopotamia',
    name: 'Mesopotamia',
    color: '#0F766E',
    type: 'civilization',
    description:
      'Cradle of urban civilisation between the Tigris and Euphrates — schematic Sumer / Akkad / Babylon cores (not precise dynastic borders).',
    keyYears: [-3500, -3000, -2500, -1800, -1200, -539],
    overlays: [
      {
        year: -3000,
        label: 'Early Sumerian cities',
        approximation: 'schematic',
        regions: [
          { id: 'lower-mesopotamia', name: 'Lower Mesopotamia', bbox: [44, 30, 48, 34] },
        ],
      },
      {
        year: -2500,
        label: 'Early Dynastic Sumer',
        approximation: 'schematic',
        regions: [
          { id: 'lower-mesopotamia', name: 'Lower Mesopotamia' },
          { id: 'mesopotamia', name: 'Mesopotamia basin' },
        ],
      },
      {
        year: -1800,
        label: 'Old Babylonian world',
        approximation: 'schematic',
        regions: [
          { id: 'mesopotamia', name: 'Mesopotamia' },
          { id: 'levant', name: 'Fertile Crescent fringe' },
        ],
      },
      {
        year: -1200,
        label: 'Late Bronze Mesopotamia',
        approximation: 'schematic',
        regions: [
          { id: 'mesopotamia', name: 'Mesopotamia' },
          { id: 'near-east', name: 'Near East fringe' },
        ],
      },
    ],
    timelineItemIds: ['mesopotamia'],
    sources: [
      { title: 'Wikipedia — Mesopotamia', url: 'https://en.wikipedia.org/wiki/Mesopotamia' },
    ],
  },
  {
    id: 'shang-china',
    name: 'Shang Dynasty',
    color: '#7C2D12',
    type: 'empire',
    description:
      'Bronze Age Chinese dynasty on the Yellow River plain — schematic north-China core.',
    keyYears: [-1600, -1400, -1200, -1046],
    overlays: [
      {
        year: -1550,
        label: 'Early Shang Yellow River',
        approximation: 'schematic',
        regions: [
          {
            id: 'yellow-river-core',
            name: 'Yellow River core',
            ring: [
              [110, 33], [111, 38], [115, 39], [116, 35], [114, 32], [111, 32], [110, 33],
            ],
          },
        ],
      },
      {
        year: -1400,
        label: 'Shang Yellow River expansion',
        approximation: 'schematic',
        regions: [
          {
            id: 'north-china',
            name: 'North China plain',
            ring: [
              [105, 34], [110, 41], [118, 42], [122, 40], [121, 35], [115, 32], [108, 33], [105, 34],
            ],
          },
          {
            id: 'yellow-river-core',
            name: 'Yellow River core',
            ring: [
              [108, 33], [110, 39], [116, 40], [118, 36], [115, 32], [110, 32], [108, 33],
            ],
          },
        ],
      },
      {
        year: -1200,
        label: 'Late Shang',
        approximation: 'schematic',
        regions: [
          {
            id: 'north-china',
            name: 'North China plain',
            ring: [
              [106, 34], [110, 40], [118, 41], [121, 38], [120, 34], [114, 32], [108, 33], [106, 34],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['ancient-china-shang'],
    sources: [
      { title: 'Wikipedia — Shang dynasty', url: 'https://en.wikipedia.org/wiki/Shang_dynasty' },
    ],
  },
  {
    id: 'phoenicia',
    name: 'Phoenicia',
    color: '#0369A1',
    type: 'civilization',
    description:
      'Levantine seafaring city-states — schematic coastal strip (Tyre–Sidon–Byblos), not a unitary empire.',
    keyYears: [-1500, -1200, -800, -300],
    overlays: [
      {
        year: -1500,
        label: 'Late Bronze Levant coast',
        approximation: 'schematic',
        regions: [
          {
            id: 'phoenician-coast',
            name: 'Phoenician coast',
            ring: [
              [34.6, 32.8], [34.8, 35.2], [36.2, 35.4], [36.0, 33.0], [35.2, 32.6], [34.6, 32.8],
            ],
          },
          {
            id: 'levant',
            name: 'Levant fringe',
            ring: [
              [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
            ],
          },
        ],
      },
      {
        year: -1200,
        label: 'Late Bronze–Iron transition',
        approximation: 'schematic',
        regions: [
          {
            id: 'phoenician-coast',
            name: 'Phoenician coast',
            ring: [
              [34.5, 32.6], [34.7, 35.3], [36.3, 35.5], [36.1, 32.9], [35.1, 32.5], [34.5, 32.6],
            ],
          },
        ],
      },
      {
        year: -1000,
        label: 'Iron Age Phoenician cities',
        approximation: 'schematic',
        regions: [
          {
            id: 'phoenician-coast',
            name: 'Phoenician coast',
            ring: [
              [34.6, 32.8], [34.8, 35.2], [36.2, 35.4], [36.0, 33.0], [35.2, 32.6], [34.6, 32.8],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['phoenicia'],
    sources: [
      { title: 'Wikipedia — Phoenicia', url: 'https://en.wikipedia.org/wiki/Phoenicia' },
    ],
  },
  {
    id: 'olmec',
    name: 'Olmec Civilisation',
    color: '#854D0E',
    type: 'civilization',
    description:
      'Formative Mesoamerican culture of the Gulf lowlands — schematic Olmec heartland.',
    keyYears: [-1500, -1200, -900, -400],
    overlays: [
      {
        year: -1500,
        label: 'Early Olmec heartland',
        approximation: 'schematic',
        regions: [
          {
            id: 'olmec-heartland',
            name: 'Gulf Olmec heartland',
            ring: [
              [-96, 16.5], [-95.5, 19.5], [-92.5, 20], [-92, 17], [-94, 16], [-96, 16.5],
            ],
          },
        ],
      },
      {
        year: -1200,
        label: 'Olmec mid expansion',
        approximation: 'schematic',
        regions: [
          {
            id: 'olmec-heartland',
            name: 'Gulf Olmec heartland',
            ring: [
              [-96.5, 16], [-95.5, 20], [-92, 20.5], [-91.5, 17], [-93.5, 15.5], [-96.5, 16],
            ],
          },
          {
            id: 'mesoamerica',
            name: 'Mesoamerica fringe',
            ring: [
              [-100, 16], [-98, 22], [-92, 23], [-88, 18], [-92, 15], [-98, 15], [-100, 16],
            ],
          },
        ],
      },
      {
        year: -900,
        label: 'Olmec florescence',
        approximation: 'schematic',
        regions: [
          {
            id: 'olmec-heartland',
            name: 'Gulf Olmec heartland',
            ring: [
              [-96, 16.5], [-95.5, 19.5], [-92.5, 20], [-92, 17], [-94, 16], [-96, 16.5],
            ],
          },
          {
            id: 'mesoamerica',
            name: 'Mesoamerica fringe',
            ring: [
              [-110, 16], [-108, 26], [-96, 28], [-86, 22], [-90, 14], [-100, 14], [-110, 16],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['olmec'],
    sources: [
      { title: 'Wikipedia — Olmec', url: 'https://en.wikipedia.org/wiki/Olmec' },
    ],
  },
  {
    id: 'kush',
    name: 'Kingdom of Kush',
    color: '#166534',
    type: 'empire',
    description:
      'Nubian kingdom south of Egypt — schematic Upper Nile / Nubia core near the end of the Bronze Age window.',
    keyYears: [-1070, -750, -590, 350],
    overlays: [
      {
        year: -1000,
        label: 'Early Kush / Nubia',
        approximation: 'schematic',
        regions: [
          {
            id: 'nubia',
            name: 'Nubia / Upper Nile',
            ring: [
              [30, 13], [31, 21], [35, 22], [36, 16], [34, 12], [31, 12], [30, 13],
            ],
          },
        ],
      },
      {
        year: -850,
        label: 'Napatan Kush rise',
        approximation: 'schematic',
        regions: [
          {
            id: 'nubia',
            name: 'Nubia / Upper Nile',
            ring: [
              [30, 12], [31, 22], [36, 23], [37, 16], [34, 11], [31, 11], [30, 12],
            ],
          },
        ],
      },
      {
        year: -700,
        label: 'Napatan Kush',
        approximation: 'schematic',
        regions: [
          {
            id: 'nubia',
            name: 'Nubia / Upper Nile',
            ring: [
              [30, 13], [31, 21], [35, 22], [36, 16], [34, 12], [31, 12], [30, 13],
            ],
          },
          {
            id: 'egypt',
            name: 'Egypt fringe',
            ring: [
              [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['kush'],
    sources: [
      { title: 'Wikipedia — Kingdom of Kush', url: 'https://en.wikipedia.org/wiki/Kingdom_of_Kush' },
    ],
  },
  {
    id: 'zhou-china',
    name: 'Zhou Dynasty',
    color: '#0284C7',
    type: 'empire',
    description:
      'Longest Chinese dynasty — schematic Yellow River / north-China core (Western Zhou to Eastern Zhou / Warring States fringe).',
    keyYears: [-1046, -900, -771, -500, -256],
    overlays: [
      {
        year: -1040,
        label: 'Western Zhou Yellow River',
        approximation: 'schematic',
        regions: [
          {
            id: 'yellow-river-core',
            name: 'Yellow River core',
            ring: [
              [107, 33], [109, 38], [114, 39], [116, 35], [113, 32], [109, 32],
              [107, 33]
            ],
          },
        ],
      },
      {
        year: -850,
        label: 'Western Zhou mid',
        approximation: 'schematic',
        regions: [
          {
            id: 'north-china',
            name: 'North China plain',
            ring: [
              [105, 33], [109, 40], [117, 41], [120, 37], [118, 33], [112, 31],
              [107, 32], [105, 33]
            ],
          },
          {
            id: 'yellow-river-core',
            name: 'Yellow River core',
            ring: [
              [107, 33], [109, 38], [114, 39], [116, 35], [113, 32], [109, 32],
              [107, 33]
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Eastern Zhou / Warring States fringe',
        approximation: 'schematic',
        regions: [
          {
            id: 'north-china',
            name: 'North China plain',
            ring: [
              [104, 32], [108, 41], [118, 42], [122, 38], [120, 32], [112, 30],
              [106, 31], [104, 32]
            ],
          },
          {
            id: 'central-china',
            name: 'Central China fringe',
            ring: [
              [108, 28], [110, 34], [116, 34], [118, 29], [114, 26], [109, 27],
              [108, 28]
            ],
          },
        ],
      },
      {
        year: -270,
        label: 'Late Zhou contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'yellow-river-core',
            name: 'Yellow River remnant',
            ring: [
              [108, 33], [110, 37], [114, 38], [115, 34], [112, 32], [109, 32],
              [108, 33]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['ancient-china-zhou'],
    sources: [
      { title: 'Wikipedia — Zhou Dynasty', url: 'https://en.wikipedia.org/wiki/Zhou_dynasty' },
    ],
  },
  {
    id: 'seleucid-empire',
    name: 'Seleucid Empire',
    color: '#7C3AED',
    type: 'empire',
    description:
      'Hellenistic successor state from Anatolia toward Iran — schematic Near East / Mesopotamia core (not full Alexandrian reach).',
    keyYears: [-312, -280, -200, -100, -63],
    overlays: [
      {
        year: -300,
        label: 'Early Seleucid Near East',
        approximation: 'schematic',
        regions: [
          {
            id: 'syria-mesopotamia',
            name: 'Syria–Mesopotamia',
            ring: [
              [35, 32], [37, 38], [44, 37], [48, 34], [46, 30], [40, 30],
              [36, 31], [35, 32]
            ],
          },
          {
            id: 'anatolia-east',
            name: 'Eastern Anatolia fringe',
            ring: [
              [35, 37], [37, 40], [42, 40], [43, 37], [40, 36], [36, 36],
              [35, 37]
            ],
          },
        ],
      },
      {
        year: -250,
        label: 'Seleucid peak schematic',
        approximation: 'schematic',
        regions: [
          {
            id: 'syria-mesopotamia',
            name: 'Syria–Mesopotamia',
            ring: [
              [34, 31], [36, 39], [45, 38], [50, 35], [49, 30], [42, 29],
              [36, 30], [34, 31]
            ],
          },
          {
            id: 'iran-west',
            name: 'Western Iran fringe',
            ring: [
              [48, 30], [50, 36], [56, 36], [57, 32], [54, 29], [49, 29],
              [48, 30]
            ],
          },
          {
            id: 'anatolia-east',
            name: 'Eastern Anatolia fringe',
            ring: [
              [34, 37], [36, 41], [43, 41], [44, 37], [40, 35], [35, 36],
              [34, 37]
            ],
          },
        ],
      },
      {
        year: -150,
        label: 'Mid Seleucid contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'syria-mesopotamia',
            name: 'Syria–Mesopotamia',
            ring: [
              [35, 32], [37, 38], [44, 37], [47, 33], [45, 30], [39, 30],
              [36, 31], [35, 32]
            ],
          },
        ],
      },
      {
        year: -80,
        label: 'Late Seleucid Syria',
        approximation: 'schematic',
        regions: [
          {
            id: 'syria-core',
            name: 'Syria core',
            ring: [
              [35, 33], [36, 37], [40, 37], [41, 34], [39, 32], [36, 32],
              [35, 33]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['seleucid'],
    sources: [
      { title: 'Wikipedia — Seleucid Empire', url: 'https://en.wikipedia.org/wiki/Seleucid_Empire' },
    ],
  },
  {
    id: 'qin-china',
    name: 'Qin Dynasty',
    color: '#B91C1C',
    type: 'empire',
    description:
      'Brief unifier of China — schematic north-to-central China proper (short lifespan; three tight keyframes).',
    keyYears: [-221, -214, -206],
    overlays: [
      {
        year: -221,
        label: 'Qin unification begins',
        approximation: 'schematic',
        regions: [
          {
            id: 'qin-core',
            name: 'Qin / Wei valley',
            ring: [
              [105, 33], [107, 37], [112, 37], [113, 33], [110, 31], [106, 32],
              [105, 33]
            ],
          },
        ],
      },
      {
        year: -214,
        label: 'Qin China proper',
        approximation: 'schematic',
        regions: [
          {
            id: 'china-proper',
            name: 'China proper schematic',
            ring: [
              [102, 23], [105, 34], [110, 41], [118, 41], [121, 34], [118, 24],
              [110, 22], [104, 23], [102, 23]
            ],
          },
          {
            id: 'qin-core',
            name: 'Qin heartland',
            ring: [
              [105, 32], [107, 37], [112, 37], [113, 33], [110, 31], [106, 31],
              [105, 32]
            ],
          },
        ],
      },
      {
        year: -206,
        label: 'Qin collapse',
        approximation: 'schematic',
        regions: [
          {
            id: 'qin-core',
            name: 'Qin remnant',
            ring: [
              [106, 33], [108, 36], [112, 36], [112, 33], [109, 32], [106, 32],
              [106, 33]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['qin-dynasty'],
    sources: [
      { title: 'Wikipedia — Qin Dynasty', url: 'https://en.wikipedia.org/wiki/Qin_dynasty' },
    ],
  },
  {
    id: 'axum',
    name: 'Kingdom of Axum',
    color: '#0D9488',
    type: 'empire',
    description:
      'Horn of Africa trading empire — schematic Ethiopian highlands / Red Sea fringe.',
    keyYears: [100, 300, 500, 700, 940],
    overlays: [
      {
        year: 120,
        label: 'Early Axum highlands',
        approximation: 'schematic',
        regions: [
          {
            id: 'axum-core',
            name: 'Axum / Tigray core',
            ring: [
              [37, 12], [38, 16], [41, 16], [41, 13], [39, 11], [37, 12]
            ],
          },
        ],
      },
      {
        year: 400,
        label: 'Axum peak Red Sea',
        approximation: 'schematic',
        regions: [
          {
            id: 'axum-core',
            name: 'Axum / Tigray core',
            ring: [
              [36, 11], [37, 16], [41, 17], [42, 13], [40, 10], [37, 11],
              [36, 11]
            ],
          },
          {
            id: 'eritrea-coast',
            name: 'Eritrea / Red Sea fringe',
            ring: [
              [38, 13], [39, 17], [43, 17], [44, 14], [42, 12], [39, 12],
              [38, 13]
            ],
          },
          {
            id: 'horn-south',
            name: 'Highland south fringe',
            ring: [
              [37, 8], [38, 12], [41, 12], [41, 8], [39, 7], [37, 8]
            ],
          },
        ],
      },
      {
        year: 700,
        label: 'Late Axum contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'axum-core',
            name: 'Axum remnant',
            ring: [
              [37, 12], [38, 15], [40, 15], [40, 12], [38, 11], [37, 12]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['axum'],
    sources: [
      { title: 'Wikipedia — Kingdom of Axum', url: 'https://en.wikipedia.org/wiki/Kingdom_of_Aksum' },
    ],
  },
  {
    id: 'ghana-empire-ov',
    name: 'Ghana Empire',
    color: '#CD7F32',
    type: 'empire',
    description:
      'West African Land of Gold — schematic Sahel / upper Senegal–Niger corridor (not modern Ghana).',
    keyYears: [300, 600, 900, 1100, 1200],
    overlays: [
      {
        year: 350,
        label: 'Early Ghana / Wagadu',
        approximation: 'schematic',
        regions: [
          {
            id: 'ghana-sahel',
            name: 'Sahel Ghana core',
            ring: [
              [-12, 14], [-10, 18], [-4, 18], [-3, 15], [-6, 13], [-11, 13],
              [-12, 14]
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Ghana peak trade',
        approximation: 'schematic',
        regions: [
          {
            id: 'ghana-sahel',
            name: 'Sahel Ghana core',
            ring: [
              [-15, 13], [-12, 19], [-2, 19], [-1, 14], [-5, 12], [-13, 12],
              [-15, 13]
            ],
          },
          {
            id: 'sahara-fringe',
            name: 'Sahara trade fringe',
            ring: [
              [-10, 18], [-8, 22], [-2, 22], [-1, 18], [-5, 17], [-10, 17],
              [-10, 18]
            ],
          },
        ],
      },
      {
        year: 1100,
        label: 'Late Ghana',
        approximation: 'schematic',
        regions: [
          {
            id: 'ghana-sahel',
            name: 'Sahel Ghana remnant',
            ring: [
              [-11, 14], [-9, 17], [-4, 17], [-4, 14], [-7, 13], [-11, 13],
              [-11, 14]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['ghana-empire'],
    sources: [
      { title: 'Wikipedia — Ghana Empire', url: 'https://en.wikipedia.org/wiki/Ghana_Empire' },
    ],
  },
  {
    id: 'chola-empire',
    name: 'Chola Dynasty',
    color: '#DB2777',
    type: 'empire',
    description:
      'South Indian maritime dynasty — schematic Tamil Nadu core + brief Sri Lanka / Coromandel footholds as separate ids.',
    keyYears: [300, 850, 1000, 1200, 1279],
    overlays: [
      {
        year: 350,
        label: 'Early Chola Tamil core',
        approximation: 'schematic',
        regions: [
          {
            id: 'tamil-core',
            name: 'Tamil country',
            ring: [
              [77, 8], [78, 13], [80, 13], [80, 9], [79, 8], [77, 8]
            ],
          },
        ],
      },
      {
        year: 1000,
        label: 'Imperial Chola peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'tamil-core',
            name: 'Tamil country',
            ring: [
              [76, 8], [77, 14], [81, 14], [81, 8], [79, 7], [76, 8]
            ],
          },
          {
            id: 'sri-lanka-north',
            name: 'Northern Sri Lanka foothold',
            ring: [
              [79.5, 8], [80, 10], [81.5, 10], [81.5, 8.5], [80.5, 8], [79.5, 8]
            ],
          },
          {
            id: 'coromandel',
            name: 'Coromandel coast',
            ring: [
              [79, 10], [80, 16], [83, 16], [83, 11], [81, 10], [79, 10]
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Late Imperial Chola',
        approximation: 'schematic',
        regions: [
          {
            id: 'tamil-core',
            name: 'Tamil country',
            ring: [
              [77, 8], [78, 13], [80.5, 13], [80.5, 9], [79, 8], [77, 8]
            ],
          },
          {
            id: 'coromandel',
            name: 'Coromandel coast',
            ring: [
              [79, 11], [80, 15], [82, 15], [82, 11], [80, 10], [79, 11]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['chola'],
    sources: [
      { title: 'Wikipedia — Chola Dynasty', url: 'https://en.wikipedia.org/wiki/Chola_dynasty' },
    ],
  },
  {
    id: 'srivijaya',
    name: 'Srivijaya',
    color: '#4338CA',
    type: 'empire',
    description:
      'Sumatran maritime empire — schematic Palembang / Strait of Malacca core (island fragments, no ocean blob).',
    keyYears: [650, 800, 1000, 1200, 1377],
    overlays: [
      {
        year: 700,
        label: 'Early Srivijaya Sumatra',
        approximation: 'schematic',
        regions: [
          {
            id: 'sumatra-south',
            name: 'South Sumatra',
            ring: [
              [102, -5], [103, 0], [106, 0], [106, -4], [104, -5.5], [102, -5]
            ],
          },
        ],
      },
      {
        year: 1000,
        label: 'Srivijaya Malacca peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'sumatra-south',
            name: 'South Sumatra',
            ring: [
              [101, -5], [102, 1], [107, 1], [107, -4], [104, -6], [101, -5]
            ],
          },
          {
            id: 'malay-peninsula',
            name: 'Malay Peninsula fringe',
            ring: [
              [100, 1], [101, 6], [104, 6], [104, 2], [102, 1], [100, 1]
            ],
          },
          {
            id: 'java-west-fringe',
            name: 'West Java fringe',
            ring: [
              [105, -8], [106, -5], [109, -5], [109, -7], [107, -8], [105, -8]
            ],
          },
        ],
      },
      {
        year: 1250,
        label: 'Late Srivijaya contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'sumatra-south',
            name: 'South Sumatra remnant',
            ring: [
              [103, -4], [104, -1], [106, -1], [106, -3.5], [104, -4.5], [103, -4]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['srivijaya'],
    sources: [
      { title: 'Wikipedia — Srivijaya', url: 'https://en.wikipedia.org/wiki/Srivijaya' },
    ],
  },
  {
    id: 'venice',
    name: 'Republic of Venice',
    color: '#881337',
    type: 'state',
    description:
      'Maritime republic — schematic Venetian lagoon / Adriatic + brief Levant / Aegean footholds as separate ids.',
    keyYears: [697, 1000, 1204, 1500, 1797],
    overlays: [
      {
        year: 800,
        label: 'Early Venice lagoon',
        approximation: 'schematic',
        regions: [
          {
            id: 'veneto',
            name: 'Veneto / lagoon',
            ring: [
              [11.5, 44.5], [12, 46], [13.5, 46], [13.8, 44.8], [12.8, 44.2], [11.5, 44.5]
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Venetian Adriatic peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'veneto',
            name: 'Veneto / lagoon',
            ring: [
              [11, 44.2], [11.5, 46.2], [14, 46.2], [14.2, 44.5], [13, 43.8], [11, 44.2]
            ],
          },
          {
            id: 'dalmatia',
            name: 'Dalmatian coast',
            ring: [
              [14, 42], [14.5, 45], [17, 45], [17.5, 42.5], [16, 41.5], [14, 42]
            ],
          },
          {
            id: 'crete-foothold',
            name: 'Crete foothold',
            ring: [
              [23.5, 34.5], [24, 35.8], [26.5, 35.8], [26.5, 34.8], [25, 34.3], [23.5, 34.5]
            ],
          },
        ],
      },
      {
        year: 1500,
        label: 'High Renaissance Venice',
        approximation: 'schematic',
        regions: [
          {
            id: 'veneto',
            name: 'Veneto / lagoon',
            ring: [
              [11, 44.2], [11.5, 46.2], [14, 46.2], [14.2, 44.5], [13, 43.8], [11, 44.2]
            ],
          },
          {
            id: 'dalmatia',
            name: 'Dalmatian coast',
            ring: [
              [14, 42], [14.5, 45], [17, 45], [17.5, 42.5], [16, 41.5], [14, 42]
            ],
          },
          {
            id: 'ionian-fringe',
            name: 'Ionian fringe',
            ring: [
              [19, 37], [19.5, 40], [21.5, 40], [21.5, 37.5], [20.5, 36.8], [19, 37]
            ],
          },
        ],
      },
      {
        year: 1750,
        label: 'Late Venice contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'veneto',
            name: 'Veneto remnant',
            ring: [
              [11.8, 44.8], [12.2, 45.8], [13.5, 45.8], [13.6, 45], [12.8, 44.6], [11.8, 44.8]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['venice'],
    sources: [
      { title: 'Wikipedia — Republic of Venice', url: 'https://en.wikipedia.org/wiki/Republic_of_Venice' },
    ],
  },
  {
    id: 'heian-japan',
    name: 'Nara & Heian Japan',
    color: '#22C55E',
    type: 'state',
    description:
      'Classical Japan — schematic Honshu court core (Nara–Kyoto); not a continental empire.',
    keyYears: [710, 794, 1000, 1185],
    overlays: [
      {
        year: 720,
        label: 'Nara period core',
        approximation: 'schematic',
        regions: [
          {
            id: 'kinai',
            name: 'Kinai / Yamato',
            ring: [
              [135, 34], [135.5, 35.5], [136.8, 35.5], [136.8, 34.2], [136, 33.8], [135, 34]
            ],
          },
        ],
      },
      {
        year: 900,
        label: 'Heian court Japan',
        approximation: 'schematic',
        regions: [
          {
            id: 'kinai',
            name: 'Kinai / Yamato',
            ring: [
              [134.5, 33.8], [135, 36], [137, 36], [137.2, 34], [136, 33.5], [134.5, 33.8]
            ],
          },
          {
            id: 'honshu-central',
            name: 'Central Honshu',
            ring: [
              [135, 34], [136, 37], [140, 37], [140.5, 35], [139, 34], [136, 33.5],
              [135, 34]
            ],
          },
        ],
      },
      {
        year: 1100,
        label: 'Late Heian',
        approximation: 'schematic',
        regions: [
          {
            id: 'honshu-central',
            name: 'Central Honshu',
            ring: [
              [134.5, 33.5], [135.5, 37], [140.5, 37.5], [141, 35], [139.5, 33.8], [136, 33],
              [134.5, 33.5]
            ],
          },
          {
            id: 'kinai',
            name: 'Kinai / Yamato',
            ring: [
              [134.8, 34], [135.3, 35.5], [136.8, 35.5], [136.8, 34], [136, 33.7], [134.8, 34]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['heian-japan'],
    sources: [
      { title: 'Wikipedia — Nara & Heian Japan', url: 'https://en.wikipedia.org/wiki/Heian_period' },
    ],
  },
  {
    id: 'viking-age',
    name: 'Viking Age',
    color: '#6D28D9',
    type: 'civilization',
    description:
      'Norse world — Scandinavia core plus short-lived overseas footholds as separate region ids (not one Atlantic blob).',
    keyYears: [793, 850, 950, 1000, 1066],
    overlays: [
      {
        year: 800,
        label: 'Early Viking Age Scandinavia',
        approximation: 'schematic',
        regions: [
          {
            id: 'scandinavia',
            name: 'Scandinavia core',
            ring: [
              [5, 55], [8, 64], [18, 65], [20, 58], [15, 55], [10, 54],
              [5, 55]
            ],
          },
        ],
      },
      {
        year: 900,
        label: 'Viking overseas footholds',
        approximation: 'schematic',
        regions: [
          {
            id: 'scandinavia',
            name: 'Scandinavia core',
            ring: [
              [4, 55], [7, 65], [19, 66], [21, 58], [16, 54], [9, 53],
              [4, 55]
            ],
          },
          {
            id: 'danelaw',
            name: 'Danelaw / England fringe',
            ring: [
              [-3, 52], [-2, 56], [1, 56], [1, 52.5], [-1, 51.5], [-3, 52]
            ],
          },
          {
            id: 'normandy',
            name: 'Normandy foothold',
            ring: [
              [-2, 48.5], [-1.5, 50], [1.5, 50], [1.5, 48.8], [0, 48.2], [-2, 48.5]
            ],
          },
          {
            id: 'iceland',
            name: 'Iceland settlement',
            ring: [
              [-24, 63], [-22, 66], [-14, 66], [-13, 64], [-18, 63], [-24, 63]
            ],
          },
          {
            id: 'dublin-fringe',
            name: 'Dublin / Irish Sea fringe',
            ring: [
              [-8, 52], [-7, 54.5], [-5.5, 54.5], [-5.5, 52.5], [-6.5, 52], [-8, 52]
            ],
          },
        ],
      },
      {
        year: 1000,
        label: 'Late Viking / North Sea',
        approximation: 'schematic',
        regions: [
          {
            id: 'scandinavia',
            name: 'Scandinavia core',
            ring: [
              [5, 55], [8, 64], [18, 65], [20, 58], [15, 55], [10, 54],
              [5, 55]
            ],
          },
          {
            id: 'danelaw',
            name: 'England fringe',
            ring: [
              [-2, 52], [-1, 55.5], [1.5, 55.5], [1.5, 52.5], [0, 51.8], [-2, 52]
            ],
          },
          {
            id: 'iceland',
            name: 'Iceland',
            ring: [
              [-24, 63], [-22, 66], [-14, 66], [-13, 64], [-18, 63], [-24, 63]
            ],
          },
          {
            id: 'normandy',
            name: 'Normandy',
            ring: [
              [-2, 48.5], [-1.5, 50], [1.5, 50], [1.5, 48.8], [0, 48.2], [-2, 48.5]
            ],
          },
        ],
      },
      {
        year: 1060,
        label: 'End of Viking Age',
        approximation: 'schematic',
        regions: [
          {
            id: 'scandinavia',
            name: 'Scandinavia remnant',
            ring: [
              [6, 56], [9, 63], [17, 64], [18, 58], [14, 55], [8, 55],
              [6, 56]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['viking-age'],
    sources: [
      { title: 'Wikipedia — Viking Age', url: 'https://en.wikipedia.org/wiki/Viking_Age' },
    ],
  },
  {
    id: 'mississippian',
    name: 'Mississippian Culture',
    color: '#EC4899',
    type: 'civilization',
    description:
      'Eastern North American mound-building culture — schematic Mississippi / Ohio valleys (Cahokia core).',
    keyYears: [800, 1000, 1200, 1400, 1600],
    overlays: [
      {
        year: 850,
        label: 'Early Mississippian',
        approximation: 'schematic',
        regions: [
          {
            id: 'cahokia-core',
            name: 'Cahokia / American Bottom',
            ring: [
              [-92, 37], [-91, 40], [-88, 40], [-88, 37.5], [-90, 36.5], [-92, 37]
            ],
          },
        ],
      },
      {
        year: 1100,
        label: 'Mississippian florescence',
        approximation: 'schematic',
        regions: [
          {
            id: 'cahokia-core',
            name: 'Cahokia core',
            ring: [
              [-92.5, 37], [-91, 40.5], [-87.5, 40.5], [-87.5, 37], [-90, 36], [-92.5, 37]
            ],
          },
          {
            id: 'ohio-valley',
            name: 'Ohio Valley',
            ring: [
              [-88, 37], [-87, 41], [-81, 41], [-81, 37.5], [-84, 36.5], [-88, 37]
            ],
          },
          {
            id: 'lower-mississippi',
            name: 'Lower Mississippi',
            ring: [
              [-92, 31], [-91, 36], [-88, 36], [-88, 31.5], [-90, 30.5], [-92, 31]
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late Mississippian',
        approximation: 'schematic',
        regions: [
          {
            id: 'cahokia-core',
            name: 'Cahokia remnant',
            ring: [
              [-91.5, 37.5], [-90.5, 39.5], [-88.5, 39.5], [-88.5, 37.5], [-90, 37], [-91.5, 37.5]
            ],
          },
          {
            id: 'lower-mississippi',
            name: 'Lower Mississippi',
            ring: [
              [-92, 32], [-91, 36], [-88.5, 36], [-88.5, 32], [-90, 31], [-92, 32]
            ],
          },
          {
            id: 'southeast-mounds',
            name: 'Southeast mound fringe',
            ring: [
              [-90, 32], [-89, 35], [-83, 35], [-83, 32], [-86, 31], [-90, 32]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['mississippian'],
    sources: [
      { title: 'Wikipedia — Mississippian Culture', url: 'https://en.wikipedia.org/wiki/Mississippian_culture' },
    ],
  },
  {
    id: 'kievan-rus',
    name: 'Kievan Rus\'',
    color: '#1E3A8A',
    type: 'state',
    description:
      'East Slavic federation centred on Kyiv — schematic Dnieper / forest-steppe core.',
    keyYears: [882, 980, 1050, 1169, 1240],
    overlays: [
      {
        year: 900,
        label: 'Early Kievan Rus',
        approximation: 'schematic',
        regions: [
          {
            id: 'dnieper-core',
            name: 'Dnieper / Kyiv core',
            ring: [
              [28, 48], [29, 52], [34, 52], [34, 48.5], [31, 47.5], [28, 48]
            ],
          },
        ],
      },
      {
        year: 1050,
        label: 'Kievan Rus peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'dnieper-core',
            name: 'Dnieper / Kyiv core',
            ring: [
              [27, 47], [28, 53], [36, 53], [36, 47], [32, 46], [27, 47]
            ],
          },
          {
            id: 'novgorod-north',
            name: 'Novgorod north',
            ring: [
              [30, 56], [31, 60], [36, 60], [36, 56.5], [33, 55.5], [30, 56]
            ],
          },
          {
            id: 'volga-fringe',
            name: 'Upper Volga fringe',
            ring: [
              [36, 54], [37, 58], [42, 58], [42, 54.5], [39, 53.5], [36, 54]
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Late Rus principalities',
        approximation: 'schematic',
        regions: [
          {
            id: 'dnieper-core',
            name: 'Dnieper remnant',
            ring: [
              [28, 48], [29, 51], [33, 51], [33, 48], [31, 47.5], [28, 48]
            ],
          },
          {
            id: 'novgorod-north',
            name: 'Novgorod',
            ring: [
              [30, 56], [31, 59], [35, 59], [35, 56.5], [33, 55.5], [30, 56]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['kievan-rus'],
    sources: [
      { title: 'Wikipedia — Kievan Rus\'', url: 'https://en.wikipedia.org/wiki/Kievan_Rus%27' },
    ],
  },
  {
    id: 'toltec',
    name: 'Toltec Empire',
    color: '#A21CAF',
    type: 'empire',
    description:
      'Militaristic Mesoamerica centred on Tula — schematic central Mexican highlands.',
    keyYears: [900, 1000, 1100, 1168],
    overlays: [
      {
        year: 920,
        label: 'Early Toltec Tula',
        approximation: 'schematic',
        regions: [
          {
            id: 'tula-core',
            name: 'Tula / Hidalgo core',
            ring: [
              [-100, 19.5], [-99.5, 21.5], [-97.5, 21.5], [-97.5, 19.8], [-98.5, 19.2], [-100, 19.5]
            ],
          },
        ],
      },
      {
        year: 1050,
        label: 'Toltec peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'tula-core',
            name: 'Tula core',
            ring: [
              [-100.5, 19], [-99.5, 22], [-97, 22], [-97, 19.5], [-98.5, 18.8], [-100.5, 19]
            ],
          },
          {
            id: 'central-mexico',
            name: 'Central Mexico fringe',
            ring: [
              [-102, 18], [-101, 22.5], [-96, 22.5], [-96, 18.5], [-98, 17.5], [-102, 18]
            ],
          },
        ],
      },
      {
        year: 1150,
        label: 'Late Toltec',
        approximation: 'schematic',
        regions: [
          {
            id: 'tula-core',
            name: 'Tula remnant',
            ring: [
              [-100, 19.5], [-99.5, 21], [-98, 21], [-98, 19.5], [-99, 19.2], [-100, 19.5]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['toltec'],
    sources: [
      { title: 'Wikipedia — Toltec Empire', url: 'https://en.wikipedia.org/wiki/Toltec' },
    ],
  },
  {
    id: 'goryeo',
    name: 'Goryeo Dynasty',
    color: '#15803D',
    type: 'empire',
    description:
      'Medieval Korea — schematic Korean peninsula core.',
    keyYears: [918, 1000, 1200, 1392],
    overlays: [
      {
        year: 940,
        label: 'Early Goryeo',
        approximation: 'schematic',
        regions: [
          {
            id: 'korea-peninsula',
            name: 'Korean peninsula',
            ring: [
              [125, 34], [126, 40], [130, 41], [130, 36], [128, 34], [125, 34]
            ],
          },
        ],
      },
      {
        year: 1100,
        label: 'Goryeo mid',
        approximation: 'schematic',
        regions: [
          {
            id: 'korea-peninsula',
            name: 'Korean peninsula',
            ring: [
              [124.5, 33.5], [125.5, 41], [130.5, 42], [131, 36], [129, 33.5], [126, 33],
              [124.5, 33.5]
            ],
          },
        ],
      },
      {
        year: 1300,
        label: 'Late Goryeo',
        approximation: 'schematic',
        regions: [
          {
            id: 'korea-peninsula',
            name: 'Korean peninsula',
            ring: [
              [125, 34], [126, 40], [130, 41], [130, 36], [128, 34], [125, 34]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['goryeo'],
    sources: [
      { title: 'Wikipedia — Goryeo Dynasty', url: 'https://en.wikipedia.org/wiki/Goryeo' },
    ],
  },
  {
    id: 'khwarezmia',
    name: 'Khwarezmian Empire',
    color: '#C026D3',
    type: 'empire',
    description:
      'Persianate Central Asian empire — schematic Khwarezm / Transoxiana / eastern Iran (pre-Mongol).',
    keyYears: [1077, 1150, 1210, 1231],
    overlays: [
      {
        year: 1100,
        label: 'Early Khwarezm',
        approximation: 'schematic',
        regions: [
          {
            id: 'khwarezm-core',
            name: 'Khwarezm oasis',
            ring: [
              [57, 38], [58, 43], [63, 43], [63, 39], [60, 37], [57, 38]
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Khwarezmian peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'khwarezm-core',
            name: 'Khwarezm',
            ring: [
              [56, 37], [57, 44], [64, 44], [65, 39], [62, 36], [57, 36],
              [56, 37]
            ],
          },
          {
            id: 'transoxiana',
            name: 'Transoxiana',
            ring: [
              [64, 38], [65, 43], [72, 43], [72, 39], [69, 37], [64, 38]
            ],
          },
          {
            id: 'iran-east',
            name: 'Eastern Iran fringe',
            ring: [
              [55, 32], [56, 38], [63, 38], [63, 33], [60, 31], [55, 32]
            ],
          },
        ],
      },
      {
        year: 1225,
        label: 'Collapse under Mongols',
        approximation: 'schematic',
        regions: [
          {
            id: 'khwarezm-core',
            name: 'Khwarezm remnant',
            ring: [
              [58, 39], [59, 42], [62, 42], [62, 39.5], [60, 38.5], [58, 39]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['khwarezmia'],
    sources: [
      { title: 'Wikipedia — Khwarezmian Empire', url: 'https://en.wikipedia.org/wiki/Khwarazmian_Empire' },
    ],
  },
  {
    id: 'great-zimbabwe',
    name: 'Great Zimbabwe',
    color: '#9F1239',
    type: 'state',
    description:
      'Medieval southern African stone city — schematic Zimbabwe plateau trade core.',
    keyYears: [1100, 1250, 1400, 1450],
    overlays: [
      {
        year: 1150,
        label: 'Early Great Zimbabwe',
        approximation: 'schematic',
        regions: [
          {
            id: 'zimbabwe-plateau',
            name: 'Zimbabwe plateau',
            ring: [
              [28, -22], [29, -18], [33, -18], [33, -21], [31, -23], [28, -22]
            ],
          },
        ],
      },
      {
        year: 1300,
        label: 'Great Zimbabwe peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'zimbabwe-plateau',
            name: 'Zimbabwe plateau',
            ring: [
              [27, -23], [28, -17], [34, -17], [34, -22], [31, -24], [27, -23]
            ],
          },
          {
            id: 'limpopo-fringe',
            name: 'Limpopo fringe',
            ring: [
              [28, -24], [29, -21], [33, -21], [33, -24], [31, -25], [28, -24]
            ],
          },
        ],
      },
      {
        year: 1420,
        label: 'Late Great Zimbabwe',
        approximation: 'schematic',
        regions: [
          {
            id: 'zimbabwe-plateau',
            name: 'Zimbabwe remnant',
            ring: [
              [29, -21], [30, -18.5], [32.5, -18.5], [32.5, -21], [31, -22], [29, -21]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['great-zimbabwe'],
    sources: [
      { title: 'Wikipedia — Great Zimbabwe', url: 'https://en.wikipedia.org/wiki/Great_Zimbabwe' },
    ],
  },
  {
    id: 'kamakura-muromachi',
    name: 'Kamakura & Muromachi Japan',
    color: '#0891B2',
    type: 'state',
    description:
      'Samurai Japan — schematic Honshu shogunal cores (Kamakura then Kyoto/Muromachi).',
    keyYears: [1185, 1300, 1400, 1573],
    overlays: [
      {
        year: 1200,
        label: 'Kamakura bakufu',
        approximation: 'schematic',
        regions: [
          {
            id: 'kanto',
            name: 'Kanto / Kamakura',
            ring: [
              [138.5, 34.5], [139, 36.5], [141, 36.5], [141, 35], [140, 34.2], [138.5, 34.5]
            ],
          },
          {
            id: 'honshu-central',
            name: 'Central Honshu',
            ring: [
              [135, 34], [136, 37], [140, 37], [140.5, 35], [138, 33.8], [135, 34]
            ],
          },
        ],
      },
      {
        year: 1350,
        label: 'Nanbokucho / early Muromachi',
        approximation: 'schematic',
        regions: [
          {
            id: 'kinai',
            name: 'Kyoto / Kinai',
            ring: [
              [134.5, 34], [135, 36], [137, 36], [137.2, 34.2], [136, 33.8], [134.5, 34]
            ],
          },
          {
            id: 'honshu-central',
            name: 'Central Honshu',
            ring: [
              [134, 33.5], [135, 37.5], [141, 37.5], [141.5, 34.5], [139, 33], [135, 33],
              [134, 33.5]
            ],
          },
        ],
      },
      {
        year: 1500,
        label: 'Late Muromachi / Sengoku fringe',
        approximation: 'schematic',
        regions: [
          {
            id: 'honshu-central',
            name: 'Honshu fragmented fringe',
            ring: [
              [133.5, 33], [134.5, 38], [141.5, 38], [142, 34.5], [139, 32.5], [135, 32.5],
              [133.5, 33]
            ],
          },
          {
            id: 'kinai',
            name: 'Kinai',
            ring: [
              [134.8, 34], [135.3, 35.5], [136.8, 35.5], [136.8, 34], [136, 33.7], [134.8, 34]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['kamakura-muromachi'],
    sources: [
      { title: 'Wikipedia — Kamakura & Muromachi Japan', url: 'https://en.wikipedia.org/wiki/Kamakura_period' },
    ],
  },
  {
    id: 'ethiopian-empire',
    name: 'Ethiopian Empire',
    color: '#4C1D95',
    type: 'empire',
    description:
      'Solomonic Ethiopia — schematic highland core expanding then contracting in the Horn.',
    keyYears: [1270, 1500, 1700, 1900, 1974],
    overlays: [
      {
        year: 1300,
        label: 'Early Solomonic highlands',
        approximation: 'schematic',
        regions: [
          {
            id: 'ethiopian-highlands',
            name: 'Ethiopian highlands',
            ring: [
              [36, 8], [37, 15], [41, 15], [41, 9], [39, 7], [36, 8]
            ],
          },
        ],
      },
      {
        year: 1600,
        label: 'Ethiopian Empire mid',
        approximation: 'schematic',
        regions: [
          {
            id: 'ethiopian-highlands',
            name: 'Ethiopian highlands',
            ring: [
              [35, 6], [36, 15], [42, 15], [42, 8], [39, 5], [35, 6]
            ],
          },
          {
            id: 'eritrea-fringe',
            name: 'Northern fringe',
            ring: [
              [37, 13], [38, 17], [42, 17], [42, 14], [40, 12], [37, 13]
            ],
          },
        ],
      },
      {
        year: 1880,
        label: 'Late Ethiopian Empire',
        approximation: 'schematic',
        regions: [
          {
            id: 'ethiopian-highlands',
            name: 'Ethiopian highlands',
            ring: [
              [34, 5], [35, 15], [43, 15], [43, 7], [40, 4], [34, 5]
            ],
          },
          {
            id: 'ogaden-fringe',
            name: 'Eastern fringe',
            ring: [
              [40, 6], [41, 11], [46, 11], [46, 7], [43, 5], [40, 6]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['ethiopian-empire'],
    sources: [
      { title: 'Wikipedia — Ethiopian Empire', url: 'https://en.wikipedia.org/wiki/Ethiopian_Empire' },
    ],
  },
  {
    id: 'timurid',
    name: 'Timurid Empire',
    color: '#BE123C',
    type: 'empire',
    description:
      'Timur Central Asian empire — schematic Transoxiana / Iran / Afghanistan cores.',
    keyYears: [1370, 1405, 1450, 1507],
    overlays: [
      {
        year: 1380,
        label: 'Early Timur Transoxiana',
        approximation: 'schematic',
        regions: [
          {
            id: 'transoxiana',
            name: 'Transoxiana',
            ring: [
              [64, 38], [65, 43], [72, 43], [72, 39], [69, 37], [64, 38]
            ],
          },
        ],
      },
      {
        year: 1405,
        label: 'Timurid peak (Timur death)',
        approximation: 'schematic',
        regions: [
          {
            id: 'transoxiana',
            name: 'Transoxiana',
            ring: [
              [63, 37], [64, 44], [73, 44], [74, 39], [70, 36], [63, 37]
            ],
          },
          {
            id: 'iran-plateau',
            name: 'Iran plateau',
            ring: [
              [48, 28], [50, 38], [62, 38], [62, 30], [56, 26], [48, 28]
            ],
          },
          {
            id: 'afghanistan',
            name: 'Afghanistan core',
            ring: [
              [60, 30], [61, 37], [72, 37], [72, 31], [68, 29], [60, 30]
            ],
          },
        ],
      },
      {
        year: 1480,
        label: 'Late Timurid remnant',
        approximation: 'schematic',
        regions: [
          {
            id: 'transoxiana',
            name: 'Transoxiana remnant',
            ring: [
              [65, 38], [66, 42], [71, 42], [71, 39], [68, 37], [65, 38]
            ],
          },
          {
            id: 'afghanistan',
            name: 'Afghanistan',
            ring: [
              [62, 31], [63, 36], [70, 36], [70, 32], [67, 30], [62, 31]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['timurid'],
    sources: [
      { title: 'Wikipedia — Timurid Empire', url: 'https://en.wikipedia.org/wiki/Timurid_Empire' },
    ],
  },
  {
    id: 'kongo',
    name: 'Kingdom of Kongo',
    color: '#78716C',
    type: 'state',
    description:
      'Central African kingdom — schematic lower Congo / Angola north core.',
    keyYears: [1390, 1500, 1700, 1914],
    overlays: [
      {
        year: 1420,
        label: 'Early Kongo',
        approximation: 'schematic',
        regions: [
          {
            id: 'kongo-core',
            name: 'Kongo heartland',
            ring: [
              [12, -7], [13, -3], [17, -3], [17, -6], [15, -8], [12, -7]
            ],
          },
        ],
      },
      {
        year: 1600,
        label: 'Kongo mid',
        approximation: 'schematic',
        regions: [
          {
            id: 'kongo-core',
            name: 'Kongo heartland',
            ring: [
              [11, -8], [12, -2], [18, -2], [18, -7], [15, -9], [11, -8]
            ],
          },
          {
            id: 'angola-north',
            name: 'Northern Angola fringe',
            ring: [
              [12, -10], [13, -6], [17, -6], [17, -10], [15, -11], [12, -10]
            ],
          },
        ],
      },
      {
        year: 1850,
        label: 'Late Kongo remnant',
        approximation: 'schematic',
        regions: [
          {
            id: 'kongo-core',
            name: 'Kongo remnant',
            ring: [
              [13, -6], [14, -3], [16.5, -3], [16.5, -5.5], [15, -7], [13, -6]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['kongo'],
    sources: [
      { title: 'Wikipedia — Kingdom of Kongo', url: 'https://en.wikipedia.org/wiki/Kingdom_of_Kongo' },
    ],
  },
  {
    id: 'joseon',
    name: 'Joseon Dynasty',
    color: '#7E22CE',
    type: 'empire',
    description:
      'Long-lived Korean dynasty — schematic Korean peninsula (Hangul / Confucian state).',
    keyYears: [1392, 1500, 1700, 1897],
    overlays: [
      {
        year: 1420,
        label: 'Early Joseon',
        approximation: 'schematic',
        regions: [
          {
            id: 'korea-peninsula',
            name: 'Korean peninsula',
            ring: [
              [124.5, 33.5], [125.5, 41], [130.5, 42], [131, 36], [129, 33.5], [126, 33],
              [124.5, 33.5]
            ],
          },
        ],
      },
      {
        year: 1600,
        label: 'Joseon mid',
        approximation: 'schematic',
        regions: [
          {
            id: 'korea-peninsula',
            name: 'Korean peninsula',
            ring: [
              [124.5, 33.5], [125.5, 41], [130.5, 42], [131, 36], [129, 33.5], [126, 33],
              [124.5, 33.5]
            ],
          },
        ],
      },
      {
        year: 1850,
        label: 'Late Joseon',
        approximation: 'schematic',
        regions: [
          {
            id: 'korea-peninsula',
            name: 'Korean peninsula',
            ring: [
              [125, 34], [126, 40.5], [130.5, 41.5], [130.5, 36], [128.5, 34], [125, 34]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['joseon'],
    sources: [
      { title: 'Wikipedia — Joseon Dynasty', url: 'https://en.wikipedia.org/wiki/Joseon' },
    ],
  },
  {
    id: 'colonial-americas',
    name: 'Colonial Americas',
    color: '#F43F5E',
    type: 'other',
    description:
      'European colonial footprints in the New World as separate regional patches (Iberian / British / French / Dutch) — no ocean-spanning single ring.',
    keyYears: [1492, 1600, 1700, 1800, 1825],
    overlays: [
      {
        year: 1520,
        label: 'Early Iberian Americas',
        approximation: 'schematic',
        regions: [
          {
            id: 'caribbean',
            name: 'Caribbean',
            ring: [
              [-85, 12], [-84, 23], [-68, 24], [-62, 15], [-68, 12], [-80, 11],
              [-85, 12]
            ],
          },
          {
            id: 'new-spain-core',
            name: 'New Spain core',
            ring: [
              [-105, 16], [-104, 26], [-94, 26], [-93, 17], [-98, 15], [-105, 16]
            ],
          },
          {
            id: 'andes-coast',
            name: 'Andean coast',
            ring: [
              [-80, -18], [-79, -5], [-72, -5], [-72, -16], [-76, -19], [-80, -18]
            ],
          },
          {
            id: 'brazil-coast',
            name: 'Brazil coast',
            ring: [
              [-48, -25], [-47, -8], [-35, -8], [-35, -20], [-40, -26], [-48, -25]
            ],
          },
        ],
      },
      {
        year: 1700,
        label: 'Colonial Americas multi-power',
        approximation: 'schematic',
        regions: [
          {
            id: 'caribbean',
            name: 'Caribbean',
            ring: [
              [-85, 12], [-84, 23], [-68, 24], [-62, 15], [-68, 12], [-80, 11],
              [-85, 12]
            ],
          },
          {
            id: 'new-spain-core',
            name: 'New Spain',
            ring: [
              [-110, 16], [-108, 32], [-94, 32], [-92, 16], [-100, 14], [-110, 16]
            ],
          },
          {
            id: 'andes-coast',
            name: 'Spanish Andes',
            ring: [
              [-80, -22], [-79, -2], [-70, -2], [-70, -20], [-75, -24], [-80, -22]
            ],
          },
          {
            id: 'brazil-coast',
            name: 'Portuguese Brazil',
            ring: [
              [-52, -30], [-50, -2], [-35, -2], [-35, -22], [-42, -32], [-52, -30]
            ],
          },
          {
            id: 'british-atlantic',
            name: 'British Atlantic seaboard',
            ring: [
              [-80, 32], [-79, 45], [-68, 45], [-68, 35], [-74, 31], [-80, 32]
            ],
          },
          {
            id: 'new-france',
            name: 'New France / St Lawrence',
            ring: [
              [-80, 44], [-79, 50], [-68, 50], [-68, 45], [-74, 43], [-80, 44]
            ],
          },
          {
            id: 'dutch-guiana',
            name: 'Dutch Guiana fringe',
            ring: [
              [-58, 4], [-57, 7], [-53, 7], [-53, 4.5], [-55, 3.5], [-58, 4]
            ],
          },
        ],
      },
      {
        year: 1800,
        label: 'Late colonial Americas',
        approximation: 'schematic',
        regions: [
          {
            id: 'new-spain-core',
            name: 'New Spain late',
            ring: [
              [-110, 16], [-108, 32], [-94, 32], [-92, 16], [-100, 14], [-110, 16]
            ],
          },
          {
            id: 'andes-coast',
            name: 'Spanish Andes',
            ring: [
              [-80, -22], [-79, -5], [-70, -5], [-70, -20], [-75, -24], [-80, -22]
            ],
          },
          {
            id: 'brazil-coast',
            name: 'Portuguese Brazil',
            ring: [
              [-52, -30], [-50, -5], [-35, -5], [-35, -22], [-42, -32], [-52, -30]
            ],
          },
          {
            id: 'british-atlantic',
            name: 'British / US seaboard fringe',
            ring: [
              [-82, 30], [-81, 46], [-68, 46], [-68, 34], [-74, 29], [-82, 30]
            ],
          },
          {
            id: 'caribbean',
            name: 'Caribbean',
            ring: [
              [-85, 12], [-84, 22], [-70, 22], [-62, 15], [-70, 12], [-80, 11],
              [-85, 12]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['colonial-americas'],
    sources: [
      { title: 'Wikipedia — Colonial Americas', url: 'https://en.wikipedia.org/wiki/European_colonization_of_the_Americas' },
    ],
  },
  {
    id: 'tokugawa',
    name: 'Tokugawa Shogunate',
    color: '#818CF8',
    type: 'state',
    description:
      'Edo Japan — schematic Japanese home islands under Tokugawa peace (no overseas empire).',
    keyYears: [1603, 1700, 1800, 1868],
    overlays: [
      {
        year: 1620,
        label: 'Early Tokugawa',
        approximation: 'schematic',
        regions: [
          {
            id: 'honshu',
            name: 'Honshu',
            ring: [
              [131, 33], [132, 41], [141, 42], [142, 35], [139, 33], [134, 32],
              [131, 33]
            ],
          },
          {
            id: 'kyushu',
            name: 'Kyushu',
            ring: [
              [129.5, 31], [130, 34], [132, 34], [132, 31.5], [131, 30.5], [129.5, 31]
            ],
          },
        ],
      },
      {
        year: 1750,
        label: 'Mid Tokugawa',
        approximation: 'schematic',
        regions: [
          {
            id: 'honshu',
            name: 'Honshu',
            ring: [
              [130.5, 33], [131.5, 41.5], [141.5, 42], [142.5, 35], [139, 32.5], [134, 32],
              [130.5, 33]
            ],
          },
          {
            id: 'kyushu',
            name: 'Kyushu',
            ring: [
              [129.5, 31], [130, 34], [132, 34], [132, 31.5], [131, 30.5], [129.5, 31]
            ],
          },
          {
            id: 'shikoku',
            name: 'Shikoku',
            ring: [
              [132, 33], [132.5, 34.5], [134.5, 34.5], [134.5, 33.2], [133.5, 32.8], [132, 33]
            ],
          },
        ],
      },
      {
        year: 1850,
        label: 'Late Tokugawa',
        approximation: 'schematic',
        regions: [
          {
            id: 'honshu',
            name: 'Honshu',
            ring: [
              [130.5, 33], [131.5, 41.5], [141.5, 42], [142.5, 35], [139, 32.5], [134, 32],
              [130.5, 33]
            ],
          },
          {
            id: 'kyushu',
            name: 'Kyushu',
            ring: [
              [129.5, 31], [130, 34], [132, 34], [132, 31.5], [131, 30.5], [129.5, 31]
            ],
          },
          {
            id: 'hokkaido-fringe',
            name: 'Ezo / Hokkaido fringe',
            ring: [
              [140, 41.5], [141, 45.5], [146, 45.5], [146, 42], [143, 41], [140, 41.5]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['tokugawa'],
    sources: [
      { title: 'Wikipedia — Tokugawa Shogunate', url: 'https://en.wikipedia.org/wiki/Tokugawa_shogunate' },
    ],
  },
  {
    id: 'maratha-empire',
    name: 'Maratha Empire',
    color: '#84CC16',
    type: 'empire',
    description:
      'Hindu confederacy challenging Mughal power — schematic Deccan / western India expanding north.',
    keyYears: [1674, 1720, 1760, 1818],
    overlays: [
      {
        year: 1680,
        label: 'Early Maratha / Shivaji',
        approximation: 'schematic',
        regions: [
          {
            id: 'deccan-west',
            name: 'Western Deccan',
            ring: [
              [72, 16], [73, 21], [78, 21], [78, 17], [75, 15], [72, 16]
            ],
          },
        ],
      },
      {
        year: 1750,
        label: 'Maratha peak confederacy',
        approximation: 'schematic',
        regions: [
          {
            id: 'deccan-west',
            name: 'Western Deccan',
            ring: [
              [71, 15], [72, 22], [79, 22], [79, 16], [75, 14], [71, 15]
            ],
          },
          {
            id: 'malwa',
            name: 'Malwa / central India',
            ring: [
              [74, 21], [75, 26], [80, 26], [80, 22], [77, 20], [74, 21]
            ],
          },
          {
            id: 'gujarat-fringe',
            name: 'Gujarat fringe',
            ring: [
              [69, 20], [70, 24], [74, 24], [74, 21], [72, 19.5], [69, 20]
            ],
          },
          {
            id: 'north-india-fringe',
            name: 'North India fringe',
            ring: [
              [75, 25], [76, 30], [82, 30], [82, 26], [78, 24], [75, 25]
            ],
          },
        ],
      },
      {
        year: 1805,
        label: 'Late Maratha contraction',
        approximation: 'schematic',
        regions: [
          {
            id: 'deccan-west',
            name: 'Deccan remnant',
            ring: [
              [72, 16], [73, 21], [78, 21], [78, 17], [75, 15], [72, 16]
            ],
          },
          {
            id: 'malwa',
            name: 'Malwa',
            ring: [
              [75, 21], [76, 25], [79, 25], [79, 22], [77, 20.5], [75, 21]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['maratha'],
    sources: [
      { title: 'Wikipedia — Maratha Empire', url: 'https://en.wikipedia.org/wiki/Maratha_Confederacy' },
    ],
  },
  {
    id: 'sikh-empire',
    name: 'Sikh Empire',
    color: '#E879F9',
    type: 'empire',
    description:
      'Punjab state under Ranjit Singh — schematic Punjab / northwest India foothills.',
    keyYears: [1799, 1820, 1839, 1849],
    overlays: [
      {
        year: 1805,
        label: 'Early Sikh Punjab',
        approximation: 'schematic',
        regions: [
          {
            id: 'punjab',
            name: 'Punjab core',
            ring: [
              [71, 29], [72, 34], [77, 34], [77, 30], [74, 28.5], [71, 29]
            ],
          },
        ],
      },
      {
        year: 1835,
        label: 'Sikh Empire peak',
        approximation: 'schematic',
        regions: [
          {
            id: 'punjab',
            name: 'Punjab',
            ring: [
              [70, 28], [71, 34.5], [78, 34.5], [78, 29], [74, 27.5], [70, 28]
            ],
          },
          {
            id: 'kashmir-fringe',
            name: 'Kashmir fringe',
            ring: [
              [73, 33], [74, 36], [78, 36], [78, 33.5], [76, 32.5], [73, 33]
            ],
          },
          {
            id: 'peshawar-fringe',
            name: 'Peshawar fringe',
            ring: [
              [70, 33], [71, 35], [73.5, 35], [73.5, 33.5], [72, 32.8], [70, 33]
            ],
          },
        ],
      },
      {
        year: 1848,
        label: 'Sikh Empire late',
        approximation: 'schematic',
        regions: [
          {
            id: 'punjab',
            name: 'Punjab remnant',
            ring: [
              [71.5, 29.5], [72.5, 33.5], [76.5, 33.5], [76.5, 30], [74, 29], [71.5, 29.5]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['sikh-empire'],
    sources: [
      { title: 'Wikipedia — Sikh Empire', url: 'https://en.wikipedia.org/wiki/Sikh_Empire' },
    ],
  },
  {
    id: 'zulu',
    name: 'Zulu Kingdom',
    color: '#991B1B',
    type: 'state',
    description:
      'Shaka Zulu kingdom — schematic KwaZulu-Natal heartland.',
    keyYears: [1816, 1830, 1879, 1897],
    overlays: [
      {
        year: 1820,
        label: 'Early Zulu under Shaka',
        approximation: 'schematic',
        regions: [
          {
            id: 'zululand',
            name: 'Zululand',
            ring: [
              [30, -30], [30.5, -27], [33, -27], [33, -29.5], [31.5, -30.5], [30, -30]
            ],
          },
        ],
      },
      {
        year: 1850,
        label: 'Zulu mid',
        approximation: 'schematic',
        regions: [
          {
            id: 'zululand',
            name: 'Zululand',
            ring: [
              [29.5, -30.5], [30, -26.5], [33.5, -26.5], [33.5, -29.5], [31.5, -31], [29.5, -30.5]
            ],
          },
        ],
      },
      {
        year: 1885,
        label: 'Late Zulu after Anglo-Zulu War',
        approximation: 'schematic',
        regions: [
          {
            id: 'zululand',
            name: 'Zululand remnant',
            ring: [
              [30.5, -29.5], [31, -27.5], [32.5, -27.5], [32.5, -29], [31.5, -29.8], [30.5, -29.5]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['zulu'],
    sources: [
      { title: 'Wikipedia — Zulu Kingdom', url: 'https://en.wikipedia.org/wiki/Zulu_Kingdom' },
    ],
  },
  {
    id: 'austro-hungarian',
    name: 'Austro-Hungarian Empire',
    color: '#0EA5E9',
    type: 'empire',
    description:
      'Dual monarchy in Central Europe — schematic Austria–Hungary / Bohemia / Galicia cores.',
    keyYears: [1867, 1890, 1914, 1918],
    overlays: [
      {
        year: 1870,
        label: 'Early Dual Monarchy',
        approximation: 'schematic',
        regions: [
          {
            id: 'austria-hungary-core',
            name: 'Austria–Hungary core',
            ring: [
              [9, 45], [10, 51], [22, 51], [25, 45], [20, 44], [14, 44],
              [9, 45]
            ],
          },
        ],
      },
      {
        year: 1900,
        label: 'Austro-Hungarian mid',
        approximation: 'schematic',
        regions: [
          {
            id: 'austria-core',
            name: 'Alpine / Austrian core',
            ring: [
              [9, 46], [10, 49], [17, 49], [17, 46.5], [14, 45.5], [9, 46]
            ],
          },
          {
            id: 'hungary-plain',
            name: 'Hungarian plain',
            ring: [
              [16, 45], [17, 49], [23, 49], [25, 46], [22, 44.5], [16, 45]
            ],
          },
          {
            id: 'bohemia',
            name: 'Bohemia',
            ring: [
              [12, 48.5], [13, 51], [17, 51], [17, 49], [15, 48], [12, 48.5]
            ],
          },
          {
            id: 'galicia',
            name: 'Galicia fringe',
            ring: [
              [19, 48], [20, 51], [25, 51], [25, 48.5], [22, 47.5], [19, 48]
            ],
          },
        ],
      },
      {
        year: 1916,
        label: 'Late Dual Monarchy (WWI)',
        approximation: 'schematic',
        regions: [
          {
            id: 'austria-core',
            name: 'Austrian core',
            ring: [
              [9.5, 46], [10.5, 48.5], [16, 48.5], [16, 46.5], [13, 45.8], [9.5, 46]
            ],
          },
          {
            id: 'hungary-plain',
            name: 'Hungarian plain',
            ring: [
              [16, 45.5], [17, 48.5], [23, 48.5], [24, 46], [21, 45], [16, 45.5]
            ],
          },
          {
            id: 'bohemia',
            name: 'Bohemia',
            ring: [
              [12.5, 48.8], [13.5, 50.8], [16.5, 50.8], [16.5, 49], [15, 48.5], [12.5, 48.8]
            ],
          },
        ],
      },
    ],
    timelineItemIds: ['austro-hungarian'],
    sources: [
      { title: 'Wikipedia — Austro-Hungarian Empire', url: 'https://en.wikipedia.org/wiki/Austria-Hungary' },
    ],
  },
];

// Day 27 — append people-pack entities (type: 'people') into the shared catalogue.
for (const person of peopleEntities) {
  spatialEntities.push(person);
}

export { peopleEntities, PEOPLE_PACK_IDS };

/** @typedef {'polities' | 'peoples' | 'both'} OverlayLayerFilter */

/** Active globe layer filter (sidebar + polygons). */
let overlayLayerFilter = /** @type {OverlayLayerFilter} */ ('both');

export function getOverlayLayerFilter() {
  return overlayLayerFilter;
}

/**
 * @param {OverlayLayerFilter|string} layer
 * @returns {OverlayLayerFilter}
 */
export function setOverlayLayerFilter(layer) {
  const v = String(layer || 'both');
  overlayLayerFilter = v === 'polities' || v === 'peoples' || v === 'both' ? v : 'both';
  return overlayLayerFilter;
}

/**
 * @param {OverlayLayerFilter} [layer]
 * @returns {SpatialEntity[]}
 */
export function entitiesForLayer(layer = overlayLayerFilter) {
  if (layer === 'peoples') return spatialEntities.filter((e) => e.type === 'people');
  if (layer === 'polities') return spatialEntities.filter((e) => e.type !== 'people');
  return spatialEntities;
}

export function isPeopleEntity(entity) {
  return entity?.type === 'people';
}

/**
 * Schematic region rings — intentionally rough [lng, lat] GeoJSON order.
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
  'south-china': [
    [105, 20], [108, 30], [118, 32], [122, 28], [120, 21], [112, 20], [105, 20],
  ],
  'tang-north': [
    [100, 36], [108, 44], [122, 45], [125, 40], [118, 36], [108, 35], [100, 36],
  ],
  tarim: [
    [75, 37], [80, 42], [92, 43], [95, 40], [92, 36], [82, 36], [75, 37],
  ],
  manchuria: [
    [120, 40], [122, 48], [132, 50], [135, 46], [130, 40], [122, 40], [120, 40],
  ],

  // --- Parthia / India ---
  'parthia-east': [
    [55, 32], [58, 39], [68, 40], [70, 35], [65, 30], [58, 30], [55, 32],
  ],
  'kushan-core': [
    [65, 32], [68, 39], [76, 40], [78, 35], [74, 30], [68, 30], [65, 32],
  ],
  'north-india': [
    [70, 26], [72, 33], [80, 34], [88, 30], [86, 24], [78, 22], [72, 24], [70, 26],
  ],
  'india-north': [
    [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
  ],
  'india-central': [
    [74, 18], [76, 26], [86, 26], [88, 20], [84, 16], [78, 16], [74, 18],
  ],
  'india-deccan': [
    [74, 14], [76, 22], [84, 22], [85, 16], [80, 12], [76, 12], [74, 14],
  ],
  'india-south': [
    [74, 8], [76, 15], [80, 16], [80, 10], [78, 8], [74, 8],
  ],

  // --- Mongol / Central Asia ---
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

  // --- Abbasid / Near East ---
  mesopotamia: [
    [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
  ],
  levant: [
    [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
  ],
  egypt: [
    [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
  ],
  'maghreb-east': [
    [5, 30], [8, 36], [20, 37], [25, 33], [22, 30], [10, 30], [5, 30],
  ],

  // --- Byzantine / Frankish ---
  'byzantine-core': [
    [20, 36], [22, 44], [30, 46], [40, 42], [42, 36], [35, 35], [26, 35], [20, 36],
  ],
  'frankish-west': [
    [-5, 43], [-4, 50], [4, 51], [8, 48], [6, 43], [0, 42], [-5, 43],
  ],
  'frankish-east': [
    [5, 46], [8, 53], [16, 54], [18, 50], [14, 46], [8, 45], [5, 46],
  ],
  'anatolia-balkans': [
    [18, 36], [20, 45], [30, 46], [42, 42], [45, 36], [38, 35], [26, 35], [18, 36],
  ],

  // --- Africa / SE Asia ---
  'west-africa-sahel': [
    [-12, 12], [-10, 18], [0, 20], [4, 16], [2, 11], [-6, 10], [-12, 12],
  ],
  'mainland-sea': [
    [100, 11], [102, 17], [108, 18], [110, 14], [107, 10], [102, 10], [100, 11],
  ],
  'south-africa': [
    [16, -34], [18, -24], [30, -22], [32, -28], [28, -35], [20, -35], [16, -34],
  ],

  // --- Americas ---
  andes: [
    [-81, -18], [-79, -5], [-77, 1], [-72, 2], [-68, -5], [-69, -15],
    [-72, -22], [-78, -20], [-81, -18],
  ],
  peru: [
    [-80, -16], [-78, -6], [-74, -3], [-69, -8], [-70, -17], [-76, -18], [-80, -16],
  ],
  // Day 23 — Inca spine fragments + Aztec tributary fringe
  'andes-north': [
    [-81, -4], [-79.5, 1.5], [-76, 2.5], [-74.5, -1], [-76.5, -4.5], [-79, -5], [-81, -4],
  ],
  'andes-south': [
    [-73, -18.5], [-70.5, -15], [-66.5, -15.5], [-65.5, -21], [-68.5, -22.5], [-72, -21.5], [-73, -18.5],
  ],
  'aztec-tributary': [
    [-101.5, 16], [-99, 18.2], [-96, 19], [-94, 17.5], [-94.5, 15.5], [-97.5, 14.8], [-100.5, 15], [-101.5, 16],
  ],
  mesoamerica: [
    [-110, 16], [-108, 26], [-96, 28], [-86, 22], [-90, 14], [-100, 14], [-110, 16],
  ],
  'valley-mexico': [
    [-102, 17], [-100, 21], [-96, 22], [-94, 19], [-96, 16], [-100, 16], [-102, 17],
  ],
  'southern-cone': [
    [-75, -38], [-72, -22], [-58, -20], [-55, -32], [-62, -40], [-72, -40], [-75, -38],
  ],
  'east-north-america': [
    [-80, 32], [-78, 46], [-65, 48], [-60, 40], [-70, 30], [-78, 30], [-80, 32],
  ],
  'canada-east': [
    [-80, 44], [-78, 54], [-60, 55], [-55, 48], [-62, 42], [-75, 42], [-80, 44],
  ],

  // --- Iberia / Britain / Russia / Australia ---
  iberia: [
    [-10, 37], [-9, 43], [-2, 44], [3, 42], [2, 37], [-5, 36], [-10, 37],
  ],
  'british-isles': [
    [-8, 51], [-7, 58], [-2, 59], [2, 56], [1, 51], [-3, 50], [-8, 51],
  ],
  'russia-european': [
    [28, 50], [30, 66], [50, 68], [60, 62], [55, 50], [40, 48], [28, 50],
  ],
  'siberia-west': [
    [60, 52], [62, 66], [88, 68], [90, 56], [78, 50], [65, 50], [60, 52],
  ],
  'siberia-belt': [
    [60, 52], [70, 68], [110, 70], [140, 66], [135, 52], [100, 50], [70, 50], [60, 52],
  ],
  'australia-east': [
    [140, -36], [142, -16], [152, -12], [154, -28], [150, -38], [144, -38], [140, -36],
  ],
  caribbean: [
    [-80, 16], [-78, 23], [-70, 23], [-61, 18], [-62, 12], [-72, 13], [-80, 16],
  ],
  philippines: [
    [119, 6], [120, 14], [124, 16], [126, 12], [125, 7], [122, 5], [119, 6],
  ],
  'goa-fringe': [
    [72.5, 14.5], [73.0, 16.5], [74.5, 16.2], [74.8, 14.8], [73.8, 14.0], [72.5, 14.5],
  ],
  'angola-coast': [
    [12, -18], [13, -10], [16, -8], [17, -14], [15, -18], [12, -18],
  ],
  'new-spain': [
    [-110, 16], [-108, 26], [-100, 28], [-92, 26], [-86, 22], [-88, 15], [-96, 14], [-104, 15], [-110, 16],
  ],

  // --- Day 17 densification rings ---
  anatolia: [
    [26, 36], [28, 42], [36, 42], [44, 40], [42, 36], [35, 35], [28, 35], [26, 36],
  ],
  'nile-upper': [
    [30, 12], [32, 22], [36, 22], [35, 12], [32, 10], [30, 12],
  ],
  greece: [
    [19, 36], [20, 41], [24, 42], [28, 41], [27, 36], [24, 35], [21, 35], [19, 36],
  ],
  'carthage-core': [
    [8, 33], [9, 37.5], [12, 38], [11, 33], [9, 32], [8, 33],
  ],
  'central-europe-hre': [
    [5, 46], [7, 54], [15, 55], [18, 50], [16, 46], [10, 45], [5, 46],
  ],
  'brazil-coast': [
    [-50, -24], [-48, -8], [-38, -5], [-35, -16], [-40, -25], [-48, -25], [-50, -24],
  ],
  'west-africa-coast': [
    [-18, 5], [-16, 14], [-8, 15], [-5, 8], [-8, 4], [-14, 4], [-18, 5],
  ],
  'low-countries': [
    [3.2, 50.5], [3.5, 53.5], [7.2, 53.8], [7.5, 51], [5.5, 50.2], [3.2, 50.5],
  ],
  'java-bali': [
    [105, -8.5], [106, -5.5], [115, -5], [116, -8], [112, -9], [106, -9], [105, -8.5],
  ],
  'sumatra-south': [
    [100, -5], [102, 1], [106, 2], [105, -4], [102, -6], [100, -5],
  ],
  yucatan: [
    [-92, 15], [-91, 21.5], [-87, 22], [-86, 18], [-88, 14], [-91, 14], [-92, 15],
  ],
  'caucasus-south': [
    [43, 39], [44, 42.5], [49, 42], [50, 39], [47, 38], [43, 39],
  ],
  'japan-honshu': [
    [129, 31], [131, 42], [141, 46], [146, 43], [142, 35], [136, 33], [131, 30], [129, 31],
  ],
  'korea-peninsula': [
    [124, 34], [126, 42], [130, 43], [129, 35], [127, 33], [124, 34],
  ],

  // --- Day 19 early Bronze Age rings ---
  'lower-mesopotamia': [
    [44, 30.5], [45, 33.5], [48, 34], [48, 31], [46, 30], [44, 30.5],
  ],
  'yellow-river-core': [
    [108, 33], [110, 39], [116, 40], [118, 36], [115, 32], [110, 32], [108, 33],
  ],
  'phoenician-coast': [
    [34.6, 32.8], [34.8, 35.2], [36.2, 35.4], [36.0, 33.0], [35.2, 32.6], [34.6, 32.8],
  ],
  'olmec-heartland': [
    [-96, 16.5], [-95.5, 19.5], [-92.5, 20], [-92, 17], [-94, 16], [-96, 16.5],
  ],
  nubia: [
    [30, 13], [31, 21], [35, 22], [36, 16], [34, 12], [31, 12], [30, 13],
  ],
};

/** Convert bbox [west,south,east,north] to a closed GeoJSON ring [lng,lat][]. */
export function bboxToRing(bbox) {
  if (!Array.isArray(bbox) || bbox.length !== 4) return null;
  const [w, s, e, n] = bbox.map(Number);
  if ([w, s, e, n].some((v) => !Number.isFinite(v))) return null;
  // Clockwise in lng/lat (matches REGION_RINGS / Globe.gl caps)
  return [
    [w, s],
    [w, n],
    [e, n],
    [e, s],
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
 * Prefer inline ring, then per-snapshot bbox (so keyframes can morph), then REGION_RINGS.
 */
export function resolveRegionRing(region) {
  if (region == null) return null;
  let ring = null;
  if (typeof region === 'string') {
    ring = ensureClosed(REGION_RINGS[region] || null);
  } else if (typeof region === 'object') {
    if (Array.isArray(region.ring)) ring = ensureClosed(region.ring);
    // Day 20: honour snapshot bbox before shared named rings so empires visibly grow/shrink.
    else if (region.bbox) ring = ensureClosed(bboxToRing(region.bbox));
    else if (REGION_RINGS[region.id]) ring = ensureClosed(REGION_RINGS[region.id]);
  }
  // Critical: Globe.gl wants CW exteriors; planar-CCW (bbox) washes the planet.
  return ensureClockwise(ring);
}

/**
 * Build Globe.gl polygon features for entities active at `year`.
 * Day 20: morph region rings between bracketing overlay keyframes; soft dissolve at lifespan edges.
 * @returns {object[]} GeoJSON-like features with color/opacity props for Globe.gl accessors
 */
export function getOverlayPolygonFeatures(year, entities = entitiesForLayer()) {
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) return [];

  const active = getActiveOverlaysAtYear(y, entities);
  const features = [];

  for (const { entity, overlay: nearestOverlay } of active) {
    const lifespan = getEntityLifespan(entity);
    const morphed = morphEntityAtYear(
      entity,
      y,
      resolveRegionRing,
      lifespan,
      OVERLAY_EDGE_GRACE,
    );
    if (!morphed.length) continue;

    const people = isPeopleEntity(entity);
    for (const part of morphed) {
      // People packs read slightly softer so polity borders stay primary when both layers show.
      const opacity = people
        ? Math.max(0.08, Math.min(0.42, (part.opacity ?? 0.43) * 0.82))
        : part.opacity;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [part.ring],
        },
        entityId: entity.id,
        name: entity.name,
        regionId: part.regionId,
        regionName: part.regionName,
        color: entity.color,
        opacity,
        entityType: entity.type,
        approximation: part.approximation || nearestOverlay?.approximation || 'rough',
        overlayYear: y,
        morphT: part.morphT,
        properties: {
          entityId: entity.id,
          name: entity.name,
          regionId: part.regionId,
          regionName: part.regionName,
          color: entity.color,
          opacity,
          entityType: entity.type,
          approximation: part.approximation || nearestOverlay?.approximation || 'rough',
          morphT: part.morphT,
        },
      });
    }
  }

  return features;
}

/** Soft edge (years) past first/last overlay keyframe. Day 21: 20y for gentler appear/disappear. */
export const OVERLAY_EDGE_GRACE = 20;

/**
 * @deprecated Day 18 — was ±80 sticky activation; now an alias of OVERLAY_EDGE_GRACE.
 * Do not use as a “keep empire on” radius past death.
 */
export const OVERLAY_ACTIVE_WINDOW = OVERLAY_EDGE_GRACE;

/** @type {Map<string, { id: string, start?: number, end?: number }>} */
const timelineItemById = new Map();
for (const item of civilisations) timelineItemById.set(item.id, item);
for (const item of warsItems) timelineItemById.set(item.id, item);

/**
 * Inclusive [start, end] years when an entity may appear on the globe.
 * Intersection of:
 *   1) linked timeline item lifespan (union of timelineItemIds start/end), when any resolve
 *   2) [firstOverlay − grace, lastOverlay + grace]
 * So empires dissolve near their last keyframe / civ end — not ±80 years later.
 *
 * @param {SpatialEntity} entity
 * @returns {{ start: number, end: number }}
 */
export function getEntityLifespan(entity) {
  let start = -Infinity;
  let end = Infinity;

  const overlayYears = (entity?.overlays || [])
    .map((o) => Number(o?.year))
    .filter((y) => Number.isFinite(y));
  if (overlayYears.length) {
    start = Math.min(...overlayYears) - OVERLAY_EDGE_GRACE;
    end = Math.max(...overlayYears) + OVERLAY_EDGE_GRACE;
  }

  const ids = entity?.timelineItemIds || [];
  let tStart = Infinity;
  let tEnd = -Infinity;
  let linked = false;
  for (const id of ids) {
    const item = timelineItemById.get(id);
    if (!item) continue;
    linked = true;
    if (Number.isFinite(item.start)) tStart = Math.min(tStart, item.start);
    if (Number.isFinite(item.end)) tEnd = Math.max(tEnd, item.end);
  }
  if (linked && Number.isFinite(tStart) && Number.isFinite(tEnd)) {
    start = Math.max(start, tStart);
    end = Math.min(end, tEnd);
  }

  return { start, end };
}

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
 * Entities whose lifespan includes `year` (timeline ∩ overlay keyframe span ± grace).
 * Nearest overlay supplies sidebar label; polygon geometry morphs in getOverlayPolygonFeatures (Day 20).
 * @param {number} year
 * @param {SpatialEntity[]} [entities]
 * @returns {{ entity: SpatialEntity, overlay: OverlaySnapshot|null, distance: number }[]}
 */
export function getActiveOverlaysAtYear(year, entities = entitiesForLayer()) {
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) return [];

  const results = [];
  for (const entity of entities) {
    const { start, end } = getEntityLifespan(entity);
    if (y < start || y > end) continue;

    let bestOverlay = null;
    let bestDist = Infinity;
    for (const overlay of entity.overlays || []) {
      const d = Math.abs(overlay.year - y);
      if (d < bestDist) {
        bestDist = d;
        bestOverlay = overlay;
      }
    }

    results.push({ entity, overlay: bestOverlay, distance: bestDist });
  }

  results.sort((a, b) => a.distance - b.distance || a.entity.name.localeCompare(b.entity.name));
  return results;
}
