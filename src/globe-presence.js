/**
 * Day 29 — Human presence layer (human-atlas layer 3).
 *
 * Schematic inhabited-footprint regions that expand / densify over deep time.
 * Honest approximate hearths and belts — not GIS, not ethnolinguistic (that's Peoples).
 * Distant continental fragments stay separate region ids (no ocean-spanning blobs).
 */

/**
 * @typedef {import('./globe-overlays.js').SpatialEntity} SpatialEntity
 */

import { presencePack2Entities, PRESENCE_PACK_2_IDS } from './globe-presence-pack2.js';

/** Presence pack ids — first human-presence slice. */
export const PRESENCE_PACK_IDS = [
  'fertile-crescent-presence',
  'nile-valley-presence',
  'yellow-river-presence',
  'indus-gangetic-presence',
  'mesoamerica-presence',
  'andean-presence',
  'west-africa-sahel-presence',
  'temperate-europe-presence',
  'southeast-asia-presence',
  'global-modern-presence',
  // Day 31 — presence densify (pack 2)
  ...PRESENCE_PACK_2_IDS,
];

/** @type {SpatialEntity[]} */
export const presenceEntities = [
  {
    id: 'fertile-crescent-presence',
    name: 'Fertile Crescent presence',
    color: '#78350F',
    type: 'presence',
    description:
      'Schematic inhabited footprint of the early Holocene Near East — farming hearths spreading into wider SW Asia (not a polity or people label).',
    keyYears: [-8000, -5000, -2000, 500],
    overlays: [
      {
        year: -8000,
        label: 'Early Holocene Near East hearths (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'fc-levant',
            name: 'Levant / upper Mesopotamia fringe',
            ring: [
              [35, 31], [36, 37], [42, 37], [43, 33], [39, 31], [35, 31],
            ],
          },
        ],
      },
      {
        year: -5000,
        label: 'Wider Fertile Crescent belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'fc-levant',
            name: 'Levant',
            ring: [
              [34, 30], [35, 37], [40, 38], [42, 34], [38, 30], [34, 30],
            ],
          },
          {
            id: 'fc-mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [42, 30], [43, 36], [48, 35], [49, 31], [46, 29], [42, 30],
            ],
          },
        ],
      },
      {
        year: -2000,
        label: 'Bronze Age SW Asia inhabited belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'fc-levant',
            name: 'Levant / Anatolia fringe',
            ring: [
              [32, 30], [34, 38], [40, 39], [42, 34], [38, 30], [32, 30],
            ],
          },
          {
            id: 'fc-mesopotamia',
            name: 'Mesopotamia / Zagros fringe',
            ring: [
              [42, 29], [43, 36], [50, 35], [51, 30], [47, 28], [42, 29],
            ],
          },
          {
            id: 'fc-iran-fringe',
            name: 'Iranian plateau fringe',
            ring: [
              [50, 28], [52, 34], [58, 33], [58, 29], [54, 27], [50, 28],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Late antique SW Asia inhabited belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'fc-levant',
            name: 'Levant / Anatolia',
            ring: [
              [32, 30], [34, 39], [41, 40], [43, 34], [38, 30], [32, 30],
            ],
          },
          {
            id: 'fc-mesopotamia',
            name: 'Mesopotamia',
            ring: [
              [42, 29], [43, 36], [50, 35], [51, 30], [47, 28], [42, 29],
            ],
          },
          {
            id: 'fc-iran-fringe',
            name: 'Iranian fringe',
            ring: [
              [50, 28], [52, 35], [60, 34], [60, 28], [55, 26], [50, 28],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Fertile Crescent', url: 'https://en.wikipedia.org/wiki/Fertile_Crescent' },
    ],
  },
  {
    id: 'nile-valley-presence',
    name: 'Nile Valley presence',
    color: '#0E7490',
    type: 'presence',
    description:
      'Schematic inhabited Nile corridor from early farming into dense riverine settlement (not dynastic borders).',
    keyYears: [-6000, -3000, -1000, 500],
    overlays: [
      {
        year: -6000,
        label: 'Early Nile farming fringe (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'nile-upper',
            name: 'Upper Nile fringe',
            ring: [
              [31, 22], [32, 26], [34, 26], [34, 23], [32, 22], [31, 22],
            ],
          },
        ],
      },
      {
        year: -3000,
        label: 'Early dynastic Nile corridor',
        approximation: 'schematic',
        regions: [
          {
            id: 'nile-upper',
            name: 'Upper Egypt',
            ring: [
              [31, 22], [32, 27], [34.5, 27], [34.5, 23], [32.5, 22], [31, 22],
            ],
          },
          {
            id: 'nile-delta',
            name: 'Delta / Lower Egypt',
            ring: [
              [30, 29], [30.5, 31.5], [32.5, 31.5], [32.5, 30], [31.5, 29], [30, 29],
            ],
          },
        ],
      },
      {
        year: -1000,
        label: 'Dense Nile corridor',
        approximation: 'schematic',
        regions: [
          {
            id: 'nile-upper',
            name: 'Upper Egypt / Nubia fringe',
            ring: [
              [30.5, 20], [31.5, 27], [34.5, 27], [35, 22], [33, 20], [30.5, 20],
            ],
          },
          {
            id: 'nile-delta',
            name: 'Delta',
            ring: [
              [29.5, 29], [30, 31.8], [33, 31.8], [33, 30], [31.5, 29], [29.5, 29],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Late antique Nile inhabited belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'nile-upper',
            name: 'Upper Nile',
            ring: [
              [30.5, 20], [31.5, 27], [34.5, 27], [35, 22], [33, 20], [30.5, 20],
            ],
          },
          {
            id: 'nile-delta',
            name: 'Delta',
            ring: [
              [29.5, 29], [30, 31.8], [33, 31.8], [33, 30], [31.5, 29], [29.5, 29],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Nile', url: 'https://en.wikipedia.org/wiki/Nile' },
    ],
  },
  {
    id: 'yellow-river-presence',
    name: 'Yellow River presence',
    color: '#FCD34D',
    type: 'presence',
    description:
      'Schematic North China inhabited belt along the Yellow River — early farming hearths densifying over millennia (not state borders).',
    keyYears: [-6000, -3000, -500, 800],
    overlays: [
      {
        year: -6000,
        label: 'Early Yellow River hearths (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'yr-core',
            name: 'Middle Yellow River',
            ring: [
              [108, 33], [109, 37], [114, 37], [115, 34], [112, 33], [108, 33],
            ],
          },
        ],
      },
      {
        year: -3000,
        label: 'Wider North China farming belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'yr-core',
            name: 'Yellow River corridor',
            ring: [
              [106, 32], [108, 38], [116, 39], [118, 35], [114, 32], [106, 32],
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Dense North China inhabited belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'yr-core',
            name: 'North China plain fringe',
            ring: [
              [105, 32], [107, 40], [118, 41], [121, 36], [116, 31], [105, 32],
            ],
          },
          {
            id: 'yr-lower',
            name: 'Lower Yellow / coast fringe',
            ring: [
              [116, 34], [117, 38], [122, 38], [122, 35], [119, 34], [116, 34],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Medieval North China presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'yr-core',
            name: 'North China',
            ring: [
              [104, 31], [106, 41], [118, 42], [122, 36], [116, 30], [104, 31],
            ],
          },
          {
            id: 'yr-lower',
            name: 'Lower Yellow / coast',
            ring: [
              [116, 33], [117, 38], [122, 38], [122, 34], [119, 33], [116, 33],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Yellow River', url: 'https://en.wikipedia.org/wiki/Yellow_River' },
    ],
  },
  {
    id: 'indus-gangetic-presence',
    name: 'Indus–Gangetic presence',
    color: '#4ADE80',
    type: 'presence',
    description:
      'Schematic South Asian inhabited belts — Indus then Gangetic densification (not ethnolinguistic packs).',
    keyYears: [-5000, -2500, -500, 800],
    overlays: [
      {
        year: -5000,
        label: 'Early Indus farming fringe (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'ig-indus',
            name: 'Indus fringe',
            ring: [
              [66, 24], [67, 30], [72, 30], [73, 25], [70, 23], [66, 24],
            ],
          },
        ],
      },
      {
        year: -2500,
        label: 'Indus urban belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'ig-indus',
            name: 'Indus corridor',
            ring: [
              [65, 23], [66, 31], [74, 31], [75, 25], [71, 22], [65, 23],
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Indus + early Gangetic belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'ig-indus',
            name: 'Indus / northwest',
            ring: [
              [65, 23], [66, 32], [74, 32], [75, 25], [71, 22], [65, 23],
            ],
          },
          {
            id: 'ig-gangetic',
            name: 'Gangetic plain fringe',
            ring: [
              [76, 24], [77, 29], [88, 28], [88, 24], [82, 23], [76, 24],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Dense Indus–Gangetic presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'ig-indus',
            name: 'Indus / northwest',
            ring: [
              [65, 23], [66, 32], [74, 32], [75, 25], [71, 22], [65, 23],
            ],
          },
          {
            id: 'ig-gangetic',
            name: 'Gangetic plain',
            ring: [
              [75, 22], [76, 29], [90, 28], [90, 22], [82, 21], [75, 22],
            ],
          },
          {
            id: 'ig-deccan-fringe',
            name: 'Northern Deccan fringe',
            ring: [
              [73, 16], [74, 22], [82, 22], [82, 17], [78, 15], [73, 16],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Indus Valley Civilisation', url: 'https://en.wikipedia.org/wiki/Indus_Valley_Civilisation' },
    ],
  },
  {
    id: 'mesoamerica-presence',
    name: 'Mesoamerica presence',
    color: '#F87171',
    type: 'presence',
    description:
      'Schematic Mesoamerican inhabited footprint — later Holocene start than Old World hearths (not polity borders).',
    keyYears: [-2000, -500, 500, 1400],
    overlays: [
      {
        year: -2000,
        label: 'Early Mesoamerican farming fringe (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'ma-gulf',
            name: 'Gulf / southern Mexico fringe',
            ring: [
              [-98, 16], [-97, 20], [-92, 20], [-91, 17], [-94, 15], [-98, 16],
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Wider Mesoamerican belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'ma-gulf',
            name: 'Gulf lowlands',
            ring: [
              [-98, 16], [-97, 21], [-91, 21], [-90, 17], [-94, 15], [-98, 16],
            ],
          },
          {
            id: 'ma-highlands',
            name: 'Central highlands fringe',
            ring: [
              [-102, 17], [-101, 21], [-96, 21], [-95, 18], [-98, 16], [-102, 17],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Classic Mesoamerican presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'ma-gulf',
            name: 'Gulf / Maya fringe',
            ring: [
              [-98, 15], [-97, 21], [-88, 21], [-87, 16], [-92, 14], [-98, 15],
            ],
          },
          {
            id: 'ma-highlands',
            name: 'Central / southern highlands',
            ring: [
              [-103, 16], [-102, 21], [-96, 21], [-95, 17], [-99, 15], [-103, 16],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late Mesoamerican inhabited belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'ma-gulf',
            name: 'Gulf / Yucatán fringe',
            ring: [
              [-98, 15], [-97, 22], [-87, 22], [-86, 16], [-92, 14], [-98, 15],
            ],
          },
          {
            id: 'ma-highlands',
            name: 'Highlands',
            ring: [
              [-104, 15], [-103, 21], [-96, 21], [-95, 16], [-99, 14], [-104, 15],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Mesoamerica', url: 'https://en.wikipedia.org/wiki/Mesoamerica' },
    ],
  },
  {
    id: 'andean-presence',
    name: 'Andean presence',
    color: '#A78BFA',
    type: 'presence',
    description:
      'Schematic Andean inhabited belt — coastal and highland footholds densifying over time (not Inca polity).',
    keyYears: [-2500, -500, 500, 1400],
    overlays: [
      {
        year: -2500,
        label: 'Early Andean coastal / highland fringe (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'and-coast',
            name: 'Central Andean coast',
            ring: [
              [-79, -14], [-78, -8], [-75, -8], [-74, -13], [-76, -15], [-79, -14],
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Wider Andean inhabited belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'and-coast',
            name: 'Pacific coast fringe',
            ring: [
              [-80, -16], [-79, -6], [-74, -6], [-73, -15], [-76, -17], [-80, -16],
            ],
          },
          {
            id: 'and-highlands',
            name: 'Highland fringe',
            ring: [
              [-74, -18], [-73, -10], [-68, -10], [-67, -17], [-70, -19], [-74, -18],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Dense Andean presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'and-coast',
            name: 'Pacific coast',
            ring: [
              [-81, -18], [-80, -4], [-74, -4], [-73, -16], [-76, -19], [-81, -18],
            ],
          },
          {
            id: 'and-highlands',
            name: 'Highlands',
            ring: [
              [-74, -20], [-73, -8], [-66, -8], [-65, -18], [-69, -21], [-74, -20],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late Andean inhabited belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'and-coast',
            name: 'Pacific coast',
            ring: [
              [-81, -20], [-80, -2], [-73, -2], [-72, -18], [-76, -21], [-81, -20],
            ],
          },
          {
            id: 'and-highlands',
            name: 'Highlands / altiplano fringe',
            ring: [
              [-74, -22], [-73, -6], [-65, -6], [-64, -20], [-68, -23], [-74, -22],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Andes', url: 'https://en.wikipedia.org/wiki/Andes' },
    ],
  },
  {
    id: 'west-africa-sahel-presence',
    name: 'West Africa / Sahel presence',
    color: '#FDBA74',
    type: 'presence',
    description:
      'Schematic West African and Sahel inhabited belts — early farming then denser savanna corridors (not kingdoms).',
    keyYears: [-3000, -1000, 500, 1400],
    overlays: [
      {
        year: -3000,
        label: 'Early West African farming fringe (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'wa-savanna',
            name: 'Savanna fringe',
            ring: [
              [-8, 8], [-7, 14], [0, 14], [1, 9], [-3, 7], [-8, 8],
            ],
          },
        ],
      },
      {
        year: -1000,
        label: 'Wider Sahel / savanna belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'wa-savanna',
            name: 'West African savanna',
            ring: [
              [-12, 7], [-11, 15], [2, 15], [3, 8], [-4, 6], [-12, 7],
            ],
          },
          {
            id: 'wa-sahel',
            name: 'Sahel fringe',
            ring: [
              [-10, 14], [-9, 18], [4, 18], [5, 15], [-2, 13], [-10, 14],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Dense West Africa / Sahel presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'wa-savanna',
            name: 'Savanna belt',
            ring: [
              [-14, 6], [-13, 15], [4, 15], [5, 7], [-4, 5], [-14, 6],
            ],
          },
          {
            id: 'wa-sahel',
            name: 'Sahel',
            ring: [
              [-12, 14], [-11, 19], [6, 19], [7, 15], [-2, 13], [-12, 14],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late medieval West Africa presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'wa-savanna',
            name: 'Savanna / forest fringe',
            ring: [
              [-16, 5], [-15, 15], [6, 15], [7, 6], [-4, 4], [-16, 5],
            ],
          },
          {
            id: 'wa-sahel',
            name: 'Sahel corridor',
            ring: [
              [-12, 14], [-11, 20], [8, 20], [9, 15], [-2, 13], [-12, 14],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Sahel', url: 'https://en.wikipedia.org/wiki/Sahel' },
    ],
  },
  {
    id: 'temperate-europe-presence',
    name: 'Temperate Europe presence',
    color: '#93C5FD',
    type: 'presence',
    description:
      'Schematic temperate European inhabited footprint — Neolithic densification into medieval lowlands (not ethnic packs).',
    keyYears: [-5000, -2000, 0, 1000],
    overlays: [
      {
        year: -5000,
        label: 'Early Neolithic temperate Europe (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'eu-central',
            name: 'Danube / central fringe',
            ring: [
              [8, 45], [9, 50], [18, 50], [19, 46], [14, 44], [8, 45],
            ],
          },
        ],
      },
      {
        year: -2000,
        label: 'Wider temperate Europe belt',
        approximation: 'schematic',
        regions: [
          {
            id: 'eu-central',
            name: 'Central Europe',
            ring: [
              [4, 44], [5, 52], [20, 52], [21, 45], [14, 43], [4, 44],
            ],
          },
          {
            id: 'eu-west',
            name: 'Atlantic fringe',
            ring: [
              [-6, 44], [-5, 52], [2, 52], [3, 45], [-1, 43], [-6, 44],
            ],
          },
        ],
      },
      {
        year: 0,
        label: 'Roman-era temperate Europe presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'eu-central',
            name: 'Central Europe',
            ring: [
              [4, 44], [5, 54], [22, 54], [23, 45], [14, 42], [4, 44],
            ],
          },
          {
            id: 'eu-west',
            name: 'Western Europe',
            ring: [
              [-8, 42], [-7, 54], [4, 54], [5, 44], [0, 41], [-8, 42],
            ],
          },
          {
            id: 'eu-south',
            holes: ['mediterranean-west'], // Day 32: ocean gap (polygon hole)
            name: 'Mediterranean Europe fringe',
            ring: [
              [-6, 36], [-5, 44], [12, 44], [14, 38], [8, 36], [-6, 36],
            ],
          },
        ],
      },
      {
        year: 1000,
        label: 'Medieval temperate Europe presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'eu-central',
            name: 'Central Europe',
            ring: [
              [4, 44], [5, 55], [24, 55], [25, 45], [14, 42], [4, 44],
            ],
          },
          {
            id: 'eu-west',
            name: 'Western Europe',
            ring: [
              [-9, 42], [-8, 58], [4, 58], [5, 44], [0, 41], [-9, 42],
            ],
          },
          {
            id: 'eu-south',
            holes: ['mediterranean-west'], // Day 32: ocean gap (polygon hole)
            name: 'Mediterranean Europe',
            ring: [
              [-8, 36], [-7, 44], [16, 44], [18, 38], [10, 35], [-8, 36],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Neolithic Europe', url: 'https://en.wikipedia.org/wiki/Neolithic_Europe' },
    ],
  },
  {
    id: 'southeast-asia-presence',
    name: 'Southeast Asia presence',
    color: '#6EE7B7',
    type: 'presence',
    description:
      'Schematic mainland and island Southeast Asia inhabited belts — separate region ids, no ocean-spanning ring.',
    keyYears: [-3000, -500, 500, 1400],
    overlays: [
      {
        year: -3000,
        label: 'Early mainland SE Asia fringe (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'sea-mainland',
            name: 'Mainland SE Asia fringe',
            ring: [
              [98, 10], [99, 18], [108, 18], [109, 12], [104, 9], [98, 10],
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Wider mainland + island footholds',
        approximation: 'schematic',
        regions: [
          {
            id: 'sea-mainland',
            name: 'Mainland SE Asia',
            ring: [
              [96, 8], [97, 20], [110, 20], [111, 10], [104, 7], [96, 8],
            ],
          },
          {
            id: 'sea-sumatra',
            name: 'Sumatra fringe',
            ring: [
              [96, -4], [97, 4], [104, 4], [105, -2], [101, -5], [96, -4],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Dense SE Asia presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'sea-mainland',
            name: 'Mainland SE Asia',
            ring: [
              [95, 6], [96, 21], [110, 21], [111, 9], [104, 5], [95, 6],
            ],
          },
          {
            id: 'sea-sumatra',
            name: 'Sumatra',
            ring: [
              [95, -5], [96, 5], [105, 5], [106, -3], [101, -6], [95, -5],
            ],
          },
          {
            id: 'sea-java',
            name: 'Java fringe',
            ring: [
              [105, -9], [106, -6], [114, -6], [114, -8], [110, -9], [105, -9],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late medieval SE Asia presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'sea-mainland',
            name: 'Mainland SE Asia',
            ring: [
              [94, 5], [95, 22], [110, 22], [111, 8], [104, 4], [94, 5],
            ],
          },
          {
            id: 'sea-sumatra',
            name: 'Sumatra',
            ring: [
              [95, -5], [96, 5], [105, 5], [106, -3], [101, -6], [95, -5],
            ],
          },
          {
            id: 'sea-java',
            name: 'Java',
            ring: [
              [105, -9], [106, -6], [114, -6], [114, -8], [110, -9], [105, -9],
            ],
          },
          {
            id: 'sea-borneo-fringe',
            name: 'Borneo coastal fringe',
            ring: [
              [109, -2], [110, 4], [117, 4], [118, -1], [114, -3], [109, -2],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Southeast Asia', url: 'https://en.wikipedia.org/wiki/Southeast_Asia' },
    ],
  },
  {
    id: 'global-modern-presence',
    name: 'Global modern presence',
    color: '#CBD5E1',
    type: 'presence',
    description:
      'Late schematic coastal / lowland inhabited belts on major continents — many separate region ids, never one ocean-spanning ring.',
    keyYears: [1700, 1850, 2000],
    overlays: [
      {
        year: 1700,
        label: 'Early modern inhabited belts (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'gm-w-europe',
            name: 'Western Europe lowlands',
            ring: [
              [-8, 42], [-7, 56], [8, 56], [9, 44], [2, 41], [-8, 42],
            ],
          },
          {
            id: 'gm-e-china',
            name: 'Eastern China lowlands',
            ring: [
              [110, 22], [111, 40], [122, 40], [122, 28], [116, 22], [110, 22],
            ],
          },
          {
            id: 'gm-india',
            name: 'Indus–Gangetic / coast fringe',
            ring: [
              [70, 10], [71, 30], [90, 28], [90, 12], [80, 8], [70, 10],
            ],
          },
          {
            id: 'gm-w-africa',
            name: 'West Africa coast / savanna',
            ring: [
              [-16, 4], [-15, 14], [4, 14], [5, 5], [-4, 3], [-16, 4],
            ],
          },
        ],
      },
      {
        year: 1850,
        label: 'Denser nineteenth-century presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'gm-w-europe',
            name: 'Western / central Europe',
            ring: [
              [-9, 40], [-8, 58], [16, 58], [17, 44], [4, 39], [-9, 40],
            ],
          },
          {
            id: 'gm-e-china',
            name: 'Eastern China',
            ring: [
              [108, 20], [109, 42], [122, 42], [122, 26], [114, 20], [108, 20],
            ],
          },
          {
            id: 'gm-india',
            name: 'South Asia belt',
            ring: [
              [68, 8], [69, 32], [90, 30], [90, 10], [78, 6], [68, 8],
            ],
          },
          {
            id: 'gm-w-africa',
            name: 'West Africa',
            ring: [
              [-16, 4], [-15, 15], [6, 15], [7, 5], [-4, 3], [-16, 4],
            ],
          },
          {
            id: 'gm-e-us',
            name: 'Eastern North America',
            ring: [
              [-90, 28], [-89, 44], [-70, 44], [-69, 32], [-78, 27], [-90, 28],
            ],
          },
          {
            id: 'gm-se-brazil',
            name: 'SE South America fringe',
            ring: [
              [-50, -30], [-49, -18], [-40, -18], [-39, -28], [-44, -32], [-50, -30],
            ],
          },
        ],
      },
      {
        year: 2000,
        label: 'Modern dense inhabited belts (schematic)',
        approximation: 'schematic',
        regions: [
          {
            id: 'gm-w-europe',
            name: 'Europe lowlands',
            ring: [
              [-9, 38], [-8, 60], [24, 60], [25, 44], [8, 37], [-9, 38],
            ],
          },
          {
            id: 'gm-e-china',
            name: 'Eastern China',
            ring: [
              [106, 20], [107, 42], [122, 42], [122, 24], [112, 19], [106, 20],
            ],
          },
          {
            id: 'gm-india',
            name: 'South Asia',
            ring: [
              [68, 8], [69, 32], [90, 30], [90, 10], [78, 6], [68, 8],
            ],
          },
          {
            id: 'gm-w-africa',
            name: 'West Africa',
            ring: [
              [-16, 4], [-15, 16], [8, 16], [9, 5], [-4, 3], [-16, 4],
            ],
          },
          {
            id: 'gm-e-us',
            name: 'Eastern / central North America',
            ring: [
              [-100, 28], [-99, 48], [-70, 48], [-69, 32], [-80, 26], [-100, 28],
            ],
          },
          {
            id: 'gm-se-brazil',
            name: 'SE South America',
            ring: [
              [-52, -32], [-51, -16], [-38, -16], [-37, -28], [-44, -34], [-52, -32],
            ],
          },
          {
            id: 'gm-japan',
            name: 'Japan archipelago fringe',
            ring: [
              [130, 31], [131, 42], [142, 42], [142, 34], [136, 30], [130, 31],
            ],
          },
          {
            id: 'gm-se-asia',
            name: 'SE Asia mainland / islands fringe',
            ring: [
              [96, 0], [97, 18], [110, 18], [110, 2], [104, -1], [96, 0],
            ],
          },
          {
            id: 'gm-nile-maghreb',
            name: 'Nile / Maghreb fringe',
            ring: [
              [-8, 30], [-7, 36], [12, 36], [14, 31], [4, 29], [-8, 30],
            ],
          },
          {
            id: 'gm-nile-maghreb-east',
            name: 'Nile corridor',
            ring: [
              [29, 22], [30, 32], [34, 32], [34, 24], [32, 22], [29, 22],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Human geography', url: 'https://en.wikipedia.org/wiki/Human_geography' },
    ],
  },
  // Day 31 — presence densify (pack 2): ten more hearths / belts.
  ...presencePack2Entities,
];
