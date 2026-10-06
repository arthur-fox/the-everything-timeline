/**
 * Day 27–28 — People packs (human-atlas layer 2).
 *
 * Cultural / ethnolinguistic peoples that are not state polities.
 * Schematic spheres of presence — honest approximate footprints, not GIS.
 * Distant island / diaspora footholds stay separate region ids (no ocean blobs).
 *
 * Day 27: first pack (10). Day 28: second pack (~10) filling geographic gaps.
 */

/**
 * @typedef {import('./globe-overlays.js').SpatialEntity} SpatialEntity
 */

/** People packs — Day 27 seed + Day 28 global-coverage expansion. */
export const PEOPLE_PACK_IDS = [
  // Day 27
  'celts',
  'germanic-peoples',
  'slavs',
  'bantu-peoples',
  'turkic-peoples',
  'polynesian-peoples',
  'scythians',
  'aboriginal-australian',
  'amazigh',
  'ancestral-puebloans',
  // Day 28
  'indo-aryan',
  'dravidian-peoples',
  'arab-peoples',
  'sinitic-peoples',
  'finno-ugric',
  'khoisan-peoples',
  'inuit-peoples',
  'maya-peoples',
  'andean-peoples',
  'nilotic-peoples',
];

/** @type {SpatialEntity[]} */
export const peopleEntities = [
  {
    id: 'celts',
    name: 'Celts',
    color: '#06B6D4',
    type: 'people',
    description:
      'Celtic-speaking peoples of temperate Europe — schematic La Tène / Insular footprints (not a single empire).',
    keyYears: [-600, -250, 50, 400],
    overlays: [
      {
        year: -600,
        label: 'Early Celtic Europe (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'celt-core',
            name: 'Alpine / Gaul core',
            ring: [
              [-2, 44], [-1, 49], [6, 50], [10, 48], [9, 44], [4, 43], [-2, 44],
            ],
          },
        ],
      },
      {
        year: -250,
        label: 'Wider Celtic Europe',
        approximation: 'schematic',
        regions: [
          {
            id: 'celt-core',
            name: 'Gaul / Alps',
            ring: [
              [-5, 43], [-4, 51], [6, 52], [12, 49], [10, 43], [2, 42], [-5, 43],
            ],
          },
          {
            id: 'celt-isles',
            name: 'Britain / Ireland fringe',
            ring: [
              [-10, 51], [-9, 58], [-2, 58], [0, 54], [-2, 50], [-8, 50], [-10, 51],
            ],
          },
          {
            id: 'celt-iberia',
            name: 'Celtiberian fringe',
            ring: [
              [-9, 39], [-8, 43], [-2, 43], [-1, 40], [-4, 38], [-9, 39],
            ],
          },
        ],
      },
      {
        year: 50,
        label: 'Insular Celts after Roman Gaul',
        approximation: 'schematic',
        regions: [
          {
            id: 'celt-isles',
            name: 'Britain / Ireland',
            ring: [
              [-10.5, 51], [-9, 58.5], [-1, 58], [1, 55], [-1, 50], [-8, 50], [-10.5, 51],
            ],
          },
          {
            id: 'celt-brittany',
            name: 'Armorica / Brittany',
            ring: [
              [-5.2, 47.2], [-4.8, 48.8], [-2.2, 48.8], [-1.8, 47.5], [-3.5, 47], [-5.2, 47.2],
            ],
          },
        ],
      },
      {
        year: 400,
        label: 'Late Insular Celtic',
        approximation: 'schematic',
        regions: [
          {
            id: 'celt-isles',
            name: 'Ireland / western Britain',
            ring: [
              [-10.5, 51.5], [-10, 55.5], [-6, 55.5], [-5, 52], [-6.5, 51], [-10, 51], [-10.5, 51.5],
            ],
          },
          {
            id: 'celt-brittany',
            name: 'Brittany',
            ring: [
              [-5.2, 47.2], [-4.8, 48.8], [-2.2, 48.8], [-1.8, 47.5], [-3.5, 47], [-5.2, 47.2],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Celts', url: 'https://en.wikipedia.org/wiki/Celts' },
    ],
  },
  {
    id: 'germanic-peoples',
    name: 'Germanic peoples',
    color: '#94A3B8',
    type: 'people',
    description:
      'Germanic-speaking groups of northern Europe — schematic homeland then Migration Period spread (not one polity).',
    keyYears: [-100, 200, 450, 600],
    overlays: [
      {
        year: -100,
        label: 'Early Germanic north',
        approximation: 'schematic',
        regions: [
          {
            id: 'germanic-core',
            name: 'Jutland / north Germany',
            ring: [
              [7, 52], [8, 57], [14, 57], [15, 53], [12, 51], [8, 51], [7, 52],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Wider Germania',
        approximation: 'schematic',
        regions: [
          {
            id: 'germanic-core',
            name: 'Germania',
            ring: [
              [5, 50], [6, 58], [16, 58], [18, 52], [14, 48], [8, 48], [5, 50],
            ],
          },
          {
            id: 'germanic-scandi',
            name: 'southern Scandinavia',
            ring: [
              [10, 55], [11, 60], [18, 60], [19, 56], [15, 55], [10, 55],
            ],
          },
        ],
      },
      {
        year: 450,
        label: 'Migration Period spread',
        approximation: 'schematic',
        regions: [
          {
            id: 'germanic-core',
            name: 'Central / north Europe',
            ring: [
              [4, 48], [5, 56], [16, 56], [18, 50], [12, 46], [6, 46], [4, 48],
            ],
          },
          {
            id: 'germanic-gaul',
            name: 'Gaul / Rhine fringe',
            ring: [
              [-1, 44], [0, 50], [6, 50], [7, 46], [4, 44], [-1, 44],
            ],
          },
          {
            id: 'germanic-italy',
            name: 'Italy / Danube fringe',
            ring: [
              [8, 44], [10, 48], [16, 47], [15, 43], [11, 42], [8, 44],
            ],
          },
        ],
      },
      {
        year: 600,
        label: 'Post-migration successor zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'germanic-core',
            name: 'Frankish / Saxon zone',
            ring: [
              [0, 46], [1, 54], [12, 54], [14, 48], [8, 45], [2, 45], [0, 46],
            ],
          },
          {
            id: 'germanic-scandi',
            name: 'Scandinavia',
            ring: [
              [5, 56], [8, 64], [18, 64], [20, 58], [14, 56], [5, 56],
            ],
          },
          {
            id: 'germanic-britain',
            name: 'Anglo-Saxon Britain',
            ring: [
              [-6, 50], [-5, 55], [1, 55], [1, 51], [-2, 50], [-6, 50],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Germanic peoples', url: 'https://en.wikipedia.org/wiki/Germanic_peoples' },
    ],
  },
  {
    id: 'slavs',
    name: 'Slavs',
    color: '#64748B',
    type: 'people',
    description:
      'Slavic-speaking peoples — schematic early homeland then Early Medieval expansion across East-Central Europe.',
    keyYears: [400, 700, 950, 1100],
    overlays: [
      {
        year: 400,
        label: 'Early Slavic homeland (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'slav-core',
            name: 'Pripet / middle Dnieper',
            ring: [
              [24, 50], [26, 54], [34, 54], [34, 50], [30, 48], [25, 49], [24, 50],
            ],
          },
        ],
      },
      {
        year: 700,
        label: 'Early Medieval expansion',
        approximation: 'schematic',
        regions: [
          {
            id: 'slav-core',
            name: 'East Slavic core',
            ring: [
              [22, 48], [24, 56], [38, 56], [38, 48], [32, 46], [24, 47], [22, 48],
            ],
          },
          {
            id: 'slav-west',
            name: 'West Slavic fringe',
            ring: [
              [12, 48], [14, 54], [22, 54], [22, 49], [18, 47], [12, 48],
            ],
          },
          {
            id: 'slav-south',
            name: 'South Slavic fringe',
            ring: [
              [15, 42], [16, 46], [24, 46], [24, 42], [20, 41], [15, 42],
            ],
          },
        ],
      },
      {
        year: 950,
        label: 'High Medieval Slavic Europe',
        approximation: 'schematic',
        regions: [
          {
            id: 'slav-core',
            name: 'East Slavic',
            ring: [
              [24, 48], [26, 58], [40, 58], [42, 50], [36, 46], [26, 47], [24, 48],
            ],
          },
          {
            id: 'slav-west',
            name: 'West Slavic',
            ring: [
              [12, 48], [14, 55], [22, 55], [23, 50], [18, 47], [12, 48],
            ],
          },
          {
            id: 'slav-south',
            name: 'South Slavic',
            ring: [
              [14, 41], [15, 46], [24, 46], [26, 42], [22, 40], [16, 40], [14, 41],
            ],
          },
        ],
      },
      {
        year: 1100,
        label: 'Established Slavic zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'slav-core',
            name: 'East Slavic',
            ring: [
              [24, 48], [26, 58], [40, 58], [42, 50], [36, 46], [26, 47], [24, 48],
            ],
          },
          {
            id: 'slav-west',
            name: 'West Slavic',
            ring: [
              [12, 48], [14, 55], [22, 55], [23, 50], [18, 47], [12, 48],
            ],
          },
          {
            id: 'slav-south',
            name: 'South Slavic',
            ring: [
              [14, 41], [15, 46], [24, 46], [26, 42], [22, 40], [16, 40], [14, 41],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Early Slavs', url: 'https://en.wikipedia.org/wiki/Early_Slavs' },
    ],
  },
  {
    id: 'bantu-peoples',
    name: 'Bantu peoples',
    color: '#365314',
    type: 'people',
    description:
      'Bantu-speaking expansion across sub-Saharan Africa — schematic corridors (not a single state).',
    keyYears: [-500, 200, 800, 1200],
    overlays: [
      {
        year: -500,
        label: 'Early Bantu homeland fringe',
        approximation: 'schematic',
        regions: [
          {
            id: 'bantu-west',
            name: 'Cameroon / Congo fringe',
            ring: [
              [8, 0], [9, 6], [16, 6], [16, 0], [12, -2], [8, 0],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Early eastward / southward spread',
        approximation: 'schematic',
        regions: [
          {
            id: 'bantu-west',
            name: 'Congo basin west',
            ring: [
              [8, -4], [10, 6], [18, 6], [20, -2], [14, -6], [8, -4],
            ],
          },
          {
            id: 'bantu-east',
            holes: ['lake-victoria'], // Day 32: ocean gap (polygon hole)
            name: 'Great Lakes fringe',
            ring: [
              [28, -4], [30, 2], [36, 2], [36, -4], [32, -6], [28, -4],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Wider Bantu Africa',
        approximation: 'schematic',
        regions: [
          {
            id: 'bantu-west',
            name: 'West-Central Africa',
            ring: [
              [8, -8], [10, 6], [20, 6], [22, -4], [16, -10], [8, -8],
            ],
          },
          {
            id: 'bantu-east',
            holes: ['lake-victoria'], // Day 32: ocean gap (polygon hole)
            name: 'East Africa corridor',
            ring: [
              [28, -12], [30, 2], [40, 2], [40, -8], [34, -14], [28, -12],
            ],
          },
          {
            id: 'bantu-south',
            name: 'Southern Africa fringe',
            ring: [
              [18, -28], [20, -18], [32, -16], [34, -24], [28, -32], [20, -32], [18, -28],
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Established Bantu zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'bantu-west',
            name: 'West-Central Africa',
            ring: [
              [8, -10], [10, 6], [22, 6], [24, -6], [16, -12], [8, -10],
            ],
          },
          {
            id: 'bantu-east',
            holes: ['lake-victoria'], // Day 32: ocean gap (polygon hole)
            name: 'East Africa',
            ring: [
              [28, -14], [30, 2], [40, 2], [42, -8], [36, -16], [28, -14],
            ],
          },
          {
            id: 'bantu-south',
            name: 'Southern Africa',
            ring: [
              [16, -34], [18, -18], [34, -16], [34, -28], [28, -34], [18, -35], [16, -34],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Bantu expansion', url: 'https://en.wikipedia.org/wiki/Bantu_expansion' },
    ],
  },
  {
    id: 'turkic-peoples',
    name: 'Turkic peoples',
    color: '#0C4A6E',
    type: 'people',
    description:
      'Turkic-speaking steppe peoples — schematic Inner Asian homeland then westward cultural spread (distinct from later Ottoman/Timurid states).',
    keyYears: [500, 750, 1000, 1200],
    overlays: [
      {
        year: 500,
        label: 'Early Turkic steppe',
        approximation: 'schematic',
        regions: [
          {
            id: 'turkic-altai',
            name: 'Altai / Mongolia fringe',
            ring: [
              [80, 44], [85, 52], [105, 52], [108, 46], [100, 42], [85, 42], [80, 44],
            ],
          },
        ],
      },
      {
        year: 750,
        label: 'Wider Inner Asia',
        approximation: 'schematic',
        regions: [
          {
            id: 'turkic-altai',
            name: 'Altai / Mongolia',
            ring: [
              [78, 42], [82, 52], [108, 52], [110, 44], [100, 40], [84, 40], [78, 42],
            ],
          },
          {
            id: 'turkic-central',
            holes: ['aral-sea'], // Day 32: ocean gap (polygon hole)
            name: 'Central Asian steppe',
            ring: [
              [55, 40], [58, 48], [78, 48], [80, 42], [70, 38], [58, 38], [55, 40],
            ],
          },
        ],
      },
      {
        year: 1000,
        label: 'Westward Turkic spread',
        approximation: 'schematic',
        regions: [
          {
            id: 'turkic-altai',
            name: 'Eastern steppe',
            ring: [
              [80, 42], [85, 52], [110, 52], [112, 44], [100, 40], [85, 40], [80, 42],
            ],
          },
          {
            id: 'turkic-central',
            holes: ['aral-sea'], // Day 32: ocean gap (polygon hole)
            name: 'Central Asia',
            ring: [
              [50, 38], [52, 48], [78, 48], [80, 40], [68, 36], [52, 36], [50, 38],
            ],
          },
          {
            id: 'turkic-anatolia',
            name: 'Anatolia fringe',
            ring: [
              [28, 36], [30, 42], [42, 42], [44, 38], [38, 35], [30, 35], [28, 36],
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Pre-Mongol Turkic zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'turkic-central',
            holes: ['aral-sea'], // Day 32: ocean gap (polygon hole)
            name: 'Central Asia',
            ring: [
              [48, 36], [50, 48], [78, 48], [80, 40], [68, 34], [52, 34], [48, 36],
            ],
          },
          {
            id: 'turkic-anatolia',
            name: 'Anatolia',
            ring: [
              [26, 36], [28, 42], [42, 42], [44, 38], [38, 35], [28, 35], [26, 36],
            ],
          },
          {
            id: 'turkic-volga',
            name: 'Volga / Pontic fringe',
            ring: [
              [40, 46], [42, 54], [55, 54], [56, 48], [50, 45], [42, 45], [40, 46],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Turkic peoples', url: 'https://en.wikipedia.org/wiki/Turkic_peoples' },
    ],
  },
  {
    id: 'polynesian-peoples',
    name: 'Polynesian peoples',
    color: '#2DD4BF',
    type: 'people',
    description:
      'Polynesian voyaging expansion — separate island-group regions (no ocean-spanning single ring).',
    keyYears: [-1000, -200, 800, 1200],
    overlays: [
      {
        year: -1000,
        label: 'West Polynesia footholds',
        approximation: 'schematic',
        regions: [
          {
            id: 'poly-samoa-tonga',
            name: 'Samoa / Tonga fringe',
            ring: [
              [-176, -22], [-175, -13], [-168, -13], [-168, -20], [-172, -22], [-176, -22],
            ],
          },
        ],
      },
      {
        year: -200,
        label: 'Central Polynesia',
        approximation: 'schematic',
        regions: [
          {
            id: 'poly-samoa-tonga',
            name: 'Samoa / Tonga',
            ring: [
              [-176, -22], [-175, -13], [-168, -13], [-168, -20], [-172, -22], [-176, -22],
            ],
          },
          {
            id: 'poly-society',
            name: 'Society Islands fringe',
            ring: [
              [-152, -18], [-151, -15], [-148, -15], [-148, -18], [-150, -19], [-152, -18],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Wider Polynesian triangle footholds',
        approximation: 'schematic',
        regions: [
          {
            id: 'poly-samoa-tonga',
            name: 'Samoa / Tonga',
            ring: [
              [-176, -22], [-175, -13], [-168, -13], [-168, -20], [-172, -22], [-176, -22],
            ],
          },
          {
            id: 'poly-society',
            name: 'Society Islands',
            ring: [
              [-152, -18], [-151, -15], [-148, -15], [-148, -18], [-150, -19], [-152, -18],
            ],
          },
          {
            id: 'poly-hawaii',
            name: 'Hawaiian Islands',
            ring: [
              [-160.5, 18.5], [-160, 22.5], [-154.5, 22.5], [-154.5, 18.8], [-157, 18], [-160.5, 18.5],
            ],
          },
          {
            id: 'poly-aotearoa',
            name: 'Aotearoa fringe',
            ring: [
              [172, -42], [173, -36], [178, -36], [178, -41], [175, -43], [172, -42],
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Settled Polynesian triangle',
        approximation: 'schematic',
        regions: [
          {
            id: 'poly-samoa-tonga',
            name: 'Samoa / Tonga',
            ring: [
              [-176, -22], [-175, -13], [-168, -13], [-168, -20], [-172, -22], [-176, -22],
            ],
          },
          {
            id: 'poly-society',
            name: 'Society Islands',
            ring: [
              [-152, -18], [-151, -15], [-148, -15], [-148, -18], [-150, -19], [-152, -18],
            ],
          },
          {
            id: 'poly-hawaii',
            name: 'Hawaiian Islands',
            ring: [
              [-160.5, 18.5], [-160, 22.5], [-154.5, 22.5], [-154.5, 18.8], [-157, 18], [-160.5, 18.5],
            ],
          },
          {
            id: 'poly-aotearoa',
            name: 'Aotearoa',
            ring: [
              [166, -46], [168, -35], [178, -34], [178, -42], [174, -47], [168, -47], [166, -46],
            ],
          },
          {
            id: 'poly-rapa-nui',
            name: 'Rapa Nui fringe',
            ring: [
              [-110.2, -27.5], [-109.8, -26.8], [-109.2, -26.8], [-109.0, -27.3], [-109.5, -27.6], [-110.2, -27.5],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Polynesia', url: 'https://en.wikipedia.org/wiki/Polynesia' },
    ],
  },
  {
    id: 'scythians',
    name: 'Scythians',
    color: '#C084FC',
    type: 'people',
    description:
      'Iranian-speaking steppe nomads of the Pontic–Caspian zone — schematic cultural footprint (not a territorial empire map).',
    keyYears: [-700, -400, -200, -50],
    overlays: [
      {
        year: -700,
        label: 'Early Scythian steppe',
        approximation: 'schematic',
        regions: [
          {
            id: 'scyth-pontic',
            name: 'Pontic steppe',
            ring: [
              [30, 44], [32, 50], [45, 50], [46, 46], [40, 43], [32, 43], [30, 44],
            ],
          },
        ],
      },
      {
        year: -400,
        label: 'Classical Scythia',
        approximation: 'schematic',
        regions: [
          {
            id: 'scyth-pontic',
            name: 'Pontic steppe',
            ring: [
              [28, 44], [30, 52], [48, 52], [50, 46], [42, 42], [30, 42], [28, 44],
            ],
          },
          {
            id: 'scyth-caspian',
            name: 'Caspian fringe',
            ring: [
              [48, 42], [50, 48], [58, 48], [58, 42], [54, 40], [48, 42],
            ],
          },
        ],
      },
      {
        year: -200,
        label: 'Late Scythian / Sarmatian overlap',
        approximation: 'schematic',
        regions: [
          {
            id: 'scyth-pontic',
            name: 'Pontic steppe',
            ring: [
              [28, 44], [30, 50], [46, 50], [48, 45], [40, 42], [30, 42], [28, 44],
            ],
          },
          {
            id: 'scyth-caspian',
            name: 'Caspian / Volga fringe',
            ring: [
              [46, 42], [48, 50], [58, 50], [60, 44], [54, 40], [46, 42],
            ],
          },
        ],
      },
      {
        year: -50,
        label: 'Residual Scythian zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'scyth-pontic',
            name: 'Crimea / lower Dnieper fringe',
            ring: [
              [30, 44], [32, 48], [40, 48], [40, 44], [36, 43], [30, 44],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Scythians', url: 'https://en.wikipedia.org/wiki/Scythians' },
    ],
  },
  {
    id: 'aboriginal-australian',
    name: 'Aboriginal Australians',
    color: '#FACC15',
    type: 'people',
    description:
      'Indigenous Australian peoples — schematic continental presence (deep time; not a single polity). Shapes are honest approximations only.',
    keyYears: [-3000, -1000, 500, 1700],
    overlays: [
      {
        year: -3000,
        label: 'Continental presence (schematic)',
        approximation: 'schematic',
        regions: [
          {
            id: 'aus-north',
            name: 'Northern Australia',
            ring: [
              [125, -20], [128, -12], [142, -11], [144, -16], [138, -20], [128, -21], [125, -20],
            ],
          },
          {
            id: 'aus-east',
            name: 'Eastern Australia',
            ring: [
              [140, -38], [142, -20], [152, -18], [154, -30], [150, -38], [144, -39], [140, -38],
            ],
          },
          {
            id: 'aus-west',
            name: 'Western Australia fringe',
            ring: [
              [114, -34], [116, -22], [126, -20], [128, -28], [122, -35], [116, -35], [114, -34],
            ],
          },
        ],
      },
      {
        year: -1000,
        label: 'Continental presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'aus-north',
            name: 'Northern Australia',
            ring: [
              [125, -20], [128, -12], [142, -11], [144, -16], [138, -20], [128, -21], [125, -20],
            ],
          },
          {
            id: 'aus-east',
            name: 'Eastern Australia',
            ring: [
              [140, -38], [142, -20], [152, -18], [154, -30], [150, -38], [144, -39], [140, -38],
            ],
          },
          {
            id: 'aus-west',
            name: 'Western Australia',
            ring: [
              [114, -34], [116, -22], [126, -20], [128, -28], [122, -35], [116, -35], [114, -34],
            ],
          },
          {
            id: 'aus-south',
            name: 'Southern Australia fringe',
            ring: [
              [132, -36], [134, -30], [142, -30], [142, -36], [138, -38], [132, -36],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Pre-colonial presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'aus-north',
            name: 'Northern Australia',
            ring: [
              [125, -20], [128, -12], [142, -11], [144, -16], [138, -20], [128, -21], [125, -20],
            ],
          },
          {
            id: 'aus-east',
            name: 'Eastern Australia',
            ring: [
              [140, -38], [142, -20], [152, -18], [154, -30], [150, -38], [144, -39], [140, -38],
            ],
          },
          {
            id: 'aus-west',
            name: 'Western Australia',
            ring: [
              [114, -34], [116, -22], [126, -20], [128, -28], [122, -35], [116, -35], [114, -34],
            ],
          },
          {
            id: 'aus-south',
            name: 'Southern Australia',
            ring: [
              [132, -36], [134, -30], [142, -30], [142, -36], [138, -38], [132, -36],
            ],
          },
        ],
      },
      {
        year: 1700,
        label: 'On the eve of colonisation',
        approximation: 'schematic',
        regions: [
          {
            id: 'aus-north',
            name: 'Northern Australia',
            ring: [
              [125, -20], [128, -12], [142, -11], [144, -16], [138, -20], [128, -21], [125, -20],
            ],
          },
          {
            id: 'aus-east',
            name: 'Eastern Australia',
            ring: [
              [140, -38], [142, -20], [152, -18], [154, -30], [150, -38], [144, -39], [140, -38],
            ],
          },
          {
            id: 'aus-west',
            name: 'Western Australia',
            ring: [
              [114, -34], [116, -22], [126, -20], [128, -28], [122, -35], [116, -35], [114, -34],
            ],
          },
          {
            id: 'aus-south',
            name: 'Southern Australia',
            ring: [
              [132, -36], [134, -30], [142, -30], [142, -36], [138, -38], [132, -36],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Aboriginal Australians', url: 'https://en.wikipedia.org/wiki/Aboriginal_Australians' },
    ],
  },
  {
    id: 'amazigh',
    name: 'Amazigh (Berbers)',
    color: '#134E4A',
    type: 'people',
    description:
      'Amazigh / Berber peoples of North Africa — schematic Maghreb presence across antiquity and the medieval era.',
    keyYears: [-500, 200, 800, 1200],
    overlays: [
      {
        year: -500,
        label: 'Ancient Maghreb',
        approximation: 'schematic',
        regions: [
          {
            id: 'amazigh-maghreb',
            name: 'Maghreb',
            ring: [
              [-10, 30], [-8, 36], [8, 37], [10, 33], [4, 30], [-6, 29], [-10, 30],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Roman-era Maghreb peoples',
        approximation: 'schematic',
        regions: [
          {
            id: 'amazigh-maghreb',
            name: 'Maghreb',
            ring: [
              [-10, 28], [-9, 36], [10, 37], [12, 32], [6, 28], [-6, 27], [-10, 28],
            ],
          },
          {
            id: 'amazigh-sahara',
            name: 'Saharan fringe',
            ring: [
              [-4, 24], [-2, 30], [8, 30], [10, 26], [4, 23], [-4, 24],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Early Islamic Maghreb',
        approximation: 'schematic',
        regions: [
          {
            id: 'amazigh-maghreb',
            name: 'Maghreb',
            ring: [
              [-12, 28], [-10, 36], [10, 37], [12, 32], [6, 27], [-8, 26], [-12, 28],
            ],
          },
          {
            id: 'amazigh-sahara',
            name: 'Saharan fringe',
            ring: [
              [-6, 20], [-4, 28], [10, 28], [12, 22], [4, 18], [-6, 20],
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Medieval Amazigh zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'amazigh-maghreb',
            name: 'Maghreb',
            ring: [
              [-12, 28], [-10, 36], [10, 37], [12, 32], [6, 27], [-8, 26], [-12, 28],
            ],
          },
          {
            id: 'amazigh-sahara',
            name: 'Saharan fringe',
            ring: [
              [-8, 18], [-6, 28], [10, 28], [12, 20], [4, 16], [-8, 18],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Berbers', url: 'https://en.wikipedia.org/wiki/Berbers' },
    ],
  },
  {
    id: 'ancestral-puebloans',
    name: 'Ancestral Puebloans',
    color: '#713F12',
    type: 'people',
    description:
      'Ancestral Puebloan peoples of the US Southwest — schematic Four Corners cultural footprint (not a state border).',
    keyYears: [500, 900, 1150, 1300],
    overlays: [
      {
        year: 500,
        label: 'Early Basketmaker / Pueblo fringe',
        approximation: 'schematic',
        regions: [
          {
            id: 'pueblo-core',
            name: 'Four Corners core',
            ring: [
              [-112, 34], [-111, 38], [-106, 38], [-106, 34], [-109, 33], [-112, 34],
            ],
          },
        ],
      },
      {
        year: 900,
        label: 'Pueblo I–II expansion',
        approximation: 'schematic',
        regions: [
          {
            id: 'pueblo-core',
            name: 'Four Corners',
            ring: [
              [-113, 33], [-112, 39], [-105, 39], [-105, 33], [-109, 32], [-113, 33],
            ],
          },
          {
            id: 'pueblo-rio-grande',
            name: 'Rio Grande fringe',
            ring: [
              [-107, 33], [-106, 37], [-104, 37], [-104, 33], [-105.5, 32.5], [-107, 33],
            ],
          },
        ],
      },
      {
        year: 1150,
        label: 'Chaco / Mesa Verde era',
        approximation: 'schematic',
        regions: [
          {
            id: 'pueblo-core',
            name: 'Four Corners',
            ring: [
              [-113, 33], [-112, 39], [-105, 39], [-105, 33], [-109, 32], [-113, 33],
            ],
          },
          {
            id: 'pueblo-rio-grande',
            name: 'Rio Grande',
            ring: [
              [-107.5, 32.5], [-106.5, 37.5], [-104, 37.5], [-103.5, 33], [-105.5, 32], [-107.5, 32.5],
            ],
          },
        ],
      },
      {
        year: 1300,
        label: 'Post-migration Pueblo zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'pueblo-rio-grande',
            name: 'Rio Grande pueblos',
            ring: [
              [-108, 32.5], [-107, 37], [-104, 37], [-103.5, 33], [-105.5, 32], [-108, 32.5],
            ],
          },
          {
            id: 'pueblo-hopi-zuni',
            name: 'Hopi / Zuni fringe',
            ring: [
              [-112, 34], [-111.5, 37], [-108.5, 37], [-108.5, 34.5], [-110, 33.5], [-112, 34],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Ancestral Puebloans', url: 'https://en.wikipedia.org/wiki/Ancestral_Puebloans' },
    ],
  },

  // —— Day 28 people pack 2 (global coverage) ——
  {
    id: 'indo-aryan',
    name: 'Indo-Aryan peoples',
    color: '#DC2626',
    type: 'people',
    description:
      'Indo-Aryan–speaking peoples of South Asia — schematic Vedic-to-medieval cultural footprint (not a single kingdom).',
    keyYears: [-1200, -400, 400, 1000],
    overlays: [
      {
        year: -1200,
        label: 'Early Indo-Aryan north (approx.)',
        approximation: 'schematic',
        regions: [
          {
            id: 'indo-aryan-northwest',
            name: 'Northwest / Indus-Saraswati fringe',
            ring: [
              [68, 28], [70, 34], [76, 34], [78, 30], [74, 26], [68, 27], [68, 28],
            ],
          },
        ],
      },
      {
        year: -400,
        label: 'Wider Indo-Aryan north India',
        approximation: 'schematic',
        regions: [
          {
            id: 'indo-aryan-gangetic',
            name: 'Gangetic / north India',
            ring: [
              [72, 24], [74, 32], [84, 30], [88, 26], [86, 22], [78, 22], [72, 24],
            ],
          },
          {
            id: 'indo-aryan-northwest',
            name: 'Northwest fringe',
            ring: [
              [66, 26], [68, 34], [74, 34], [76, 28], [72, 24], [66, 25], [66, 26],
            ],
          },
        ],
      },
      {
        year: 400,
        label: 'Classical Indo-Aryan sphere',
        approximation: 'schematic',
        regions: [
          {
            id: 'indo-aryan-gangetic',
            name: 'North / central India',
            ring: [
              [72, 20], [74, 32], [86, 30], [90, 24], [86, 18], [78, 18], [72, 20],
            ],
          },
          {
            id: 'indo-aryan-deccan-fringe',
            name: 'Deccan fringe',
            ring: [
              [74, 16], [76, 22], [82, 22], [84, 18], [80, 14], [74, 15], [74, 16],
            ],
          },
        ],
      },
      {
        year: 1000,
        label: 'Medieval Indo-Aryan zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'indo-aryan-gangetic',
            name: 'North India',
            ring: [
              [70, 22], [72, 33], [88, 30], [92, 24], [88, 20], [76, 20], [70, 22],
            ],
          },
          {
            id: 'indo-aryan-deccan-fringe',
            name: 'Central / Deccan fringe',
            ring: [
              [73, 15], [75, 24], [84, 24], [86, 18], [82, 14], [74, 14], [73, 15],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Indo-Aryan peoples', url: 'https://en.wikipedia.org/wiki/Indo-Aryan_peoples' },
    ],
  },
  {
    id: 'dravidian-peoples',
    name: 'Dravidian peoples',
    color: '#92400E',
    type: 'people',
    description:
      'Dravidian-speaking peoples of South India — schematic peninsular cultural footprint (not Chola/Pandya polities alone).',
    keyYears: [-800, 200, 800, 1400],
    overlays: [
      {
        year: -800,
        label: 'Early Dravidian south',
        approximation: 'schematic',
        regions: [
          {
            id: 'dravidian-core',
            name: 'South India core',
            ring: [
              [74, 8], [75, 16], [80, 16], [80, 10], [78, 8], [74, 8],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Classical Dravidian south',
        approximation: 'schematic',
        regions: [
          {
            id: 'dravidian-core',
            name: 'Tamil / Kerala / Andhra fringe',
            ring: [
              [74, 8], [75, 18], [82, 18], [82, 10], [80, 8], [74, 8],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Early medieval Dravidian zone',
        approximation: 'schematic',
        regions: [
          {
            id: 'dravidian-core',
            name: 'South India',
            ring: [
              [74, 8], [75, 20], [83, 20], [83, 11], [80, 8], [74, 8],
            ],
          },
          {
            id: 'dravidian-deccan',
            name: 'Deccan fringe',
            ring: [
              [74, 16], [76, 22], [80, 22], [81, 18], [78, 15], [74, 16],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late medieval Dravidian zone',
        approximation: 'schematic',
        regions: [
          {
            id: 'dravidian-core',
            name: 'South India',
            ring: [
              [74, 8], [75, 20], [83, 20], [83, 11], [80, 8], [74, 8],
            ],
          },
          {
            id: 'dravidian-deccan',
            name: 'Deccan fringe',
            ring: [
              [74, 15], [76, 23], [81, 23], [82, 18], [78, 14], [74, 15],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Dravidian peoples', url: 'https://en.wikipedia.org/wiki/Dravidian_peoples' },
    ],
  },
  {
    id: 'arab-peoples',
    name: 'Arab peoples',
    color: '#155E75',
    type: 'people',
    description:
      'Arabic-speaking / Arab cultural footprint — schematic peninsula then wider Middle East–North Africa presence (not a caliphate polity duplicate).',
    keyYears: [-200, 650, 1000, 1400],
    overlays: [
      {
        year: -200,
        label: 'Arabian peninsula peoples',
        approximation: 'schematic',
        regions: [
          {
            id: 'arab-peninsula',
            name: 'Arabian peninsula',
            ring: [
              [34, 16], [36, 30], [48, 30], [56, 24], [54, 14], [42, 12], [34, 16],
            ],
          },
        ],
      },
      {
        year: 650,
        label: 'Early Arabic cultural expansion',
        approximation: 'schematic',
        regions: [
          {
            id: 'arab-peninsula',
            name: 'Arabian peninsula',
            ring: [
              [34, 14], [36, 30], [50, 30], [58, 24], [56, 12], [42, 12], [34, 14],
            ],
          },
          {
            id: 'arab-levant-mesopotamia',
            name: 'Levant / Mesopotamia',
            ring: [
              [34, 30], [36, 38], [48, 36], [48, 30], [42, 28], [34, 30],
            ],
          },
          {
            id: 'arab-egypt',
            name: 'Egypt',
            ring: [
              [28, 22], [30, 32], [34, 32], [34, 24], [32, 22], [28, 22],
            ],
          },
        ],
      },
      {
        year: 1000,
        label: 'Medieval Arabic-speaking zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'arab-peninsula',
            name: 'Arabian peninsula',
            ring: [
              [34, 14], [36, 30], [50, 30], [58, 24], [56, 12], [42, 12], [34, 14],
            ],
          },
          {
            id: 'arab-levant-mesopotamia',
            name: 'Levant / Mesopotamia',
            ring: [
              [34, 30], [36, 38], [48, 36], [48, 30], [42, 28], [34, 30],
            ],
          },
          {
            id: 'arab-egypt',
            name: 'Egypt',
            ring: [
              [28, 22], [30, 32], [34, 32], [34, 24], [32, 22], [28, 22],
            ],
          },
          {
            id: 'arab-maghreb',
            name: 'Maghreb Arabic fringe',
            ring: [
              [-10, 30], [-8, 36], [10, 36], [12, 32], [4, 28], [-8, 28], [-10, 30],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late medieval Arabic zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'arab-peninsula',
            name: 'Arabian peninsula',
            ring: [
              [34, 14], [36, 30], [50, 30], [58, 24], [56, 12], [42, 12], [34, 14],
            ],
          },
          {
            id: 'arab-levant-mesopotamia',
            name: 'Levant / Mesopotamia',
            ring: [
              [34, 30], [36, 38], [48, 36], [48, 30], [42, 28], [34, 30],
            ],
          },
          {
            id: 'arab-egypt',
            name: 'Egypt',
            ring: [
              [28, 22], [30, 32], [34, 32], [34, 24], [32, 22], [28, 22],
            ],
          },
          {
            id: 'arab-maghreb',
            name: 'Maghreb',
            ring: [
              [-12, 28], [-10, 36], [10, 36], [12, 32], [4, 26], [-8, 26], [-12, 28],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Arabs', url: 'https://en.wikipedia.org/wiki/Arabs' },
    ],
  },
  {
    id: 'sinitic-peoples',
    name: 'Sinitic peoples',
    color: '#FEF08A',
    type: 'people',
    description:
      'Sinitic cultural sphere of East Asia — schematic Yellow River / China-proper presence distinct from Han/Qin/etc. polities.',
    keyYears: [-800, 200, 800, 1400],
    overlays: [
      {
        year: -800,
        label: 'Early Sinitic core',
        approximation: 'schematic',
        regions: [
          {
            id: 'sinitic-core',
            name: 'Yellow River core',
            ring: [
              [108, 32], [110, 40], [118, 40], [120, 34], [116, 30], [108, 32],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Expanded Sinitic China proper',
        approximation: 'schematic',
        regions: [
          {
            id: 'sinitic-core',
            name: 'North China',
            ring: [
              [106, 30], [108, 42], [120, 42], [122, 34], [118, 28], [106, 30],
            ],
          },
          {
            id: 'sinitic-south',
            name: 'Yangtze / south fringe',
            ring: [
              [108, 24], [110, 32], [120, 32], [122, 26], [116, 22], [108, 24],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Medieval Sinitic sphere',
        approximation: 'schematic',
        regions: [
          {
            id: 'sinitic-core',
            name: 'North China',
            ring: [
              [104, 30], [106, 42], [122, 42], [124, 34], [118, 28], [104, 30],
            ],
          },
          {
            id: 'sinitic-south',
            name: 'South China',
            ring: [
              [106, 22], [108, 32], [122, 32], [122, 24], [116, 20], [106, 22],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late medieval Sinitic presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'sinitic-core',
            name: 'China proper north',
            ring: [
              [104, 30], [106, 42], [122, 42], [124, 34], [118, 28], [104, 30],
            ],
          },
          {
            id: 'sinitic-south',
            name: 'China proper south',
            ring: [
              [105, 20], [108, 32], [122, 32], [122, 22], [116, 18], [105, 20],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Chinese people', url: 'https://en.wikipedia.org/wiki/Chinese_people' },
    ],
  },
  {
    id: 'finno-ugric',
    name: 'Finno-Ugric peoples',
    color: '#67E8F9',
    type: 'people',
    description:
      'Finno-Ugric peoples — schematic Finnic, Uralic, and Hungarian footholds as separate regions (no Europe-spanning blob).',
    keyYears: [-500, 500, 1000, 1500],
    overlays: [
      {
        year: -500,
        label: 'Early Finno-Ugric zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'finno-ugric-ural',
            name: 'Ural / Volga fringe',
            ring: [
              [48, 54], [50, 62], [60, 62], [62, 56], [56, 52], [48, 54],
            ],
          },
          {
            id: 'finno-ugric-baltic',
            name: 'Baltic Finnic fringe',
            ring: [
              [20, 58], [22, 66], [32, 66], [34, 60], [28, 56], [20, 58],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Early medieval Finno-Ugric',
        approximation: 'schematic',
        regions: [
          {
            id: 'finno-ugric-ural',
            name: 'Ural / Volga',
            ring: [
              [46, 52], [48, 62], [62, 62], [64, 54], [56, 50], [46, 52],
            ],
          },
          {
            id: 'finno-ugric-baltic',
            name: 'Finland / Baltic',
            ring: [
              [20, 58], [22, 68], [34, 68], [34, 60], [28, 56], [20, 58],
            ],
          },
        ],
      },
      {
        year: 1000,
        label: 'Medieval Finno-Ugric + Magyars',
        approximation: 'schematic',
        regions: [
          {
            id: 'finno-ugric-baltic',
            name: 'Finland / Baltic',
            ring: [
              [20, 58], [22, 68], [34, 68], [34, 60], [28, 56], [20, 58],
            ],
          },
          {
            id: 'finno-ugric-ural',
            name: 'Ural fringe',
            ring: [
              [48, 54], [50, 62], [60, 62], [62, 56], [56, 52], [48, 54],
            ],
          },
          {
            id: 'finno-ugric-hungary',
            name: 'Carpathian Basin (Magyar)',
            ring: [
              [16, 45], [17, 49], [23, 49], [24, 46], [20, 44], [16, 45],
            ],
          },
        ],
      },
      {
        year: 1500,
        label: 'Late Finno-Ugric zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'finno-ugric-baltic',
            name: 'Finland / Baltic',
            ring: [
              [20, 58], [22, 68], [34, 68], [34, 60], [28, 56], [20, 58],
            ],
          },
          {
            id: 'finno-ugric-hungary',
            name: 'Hungary',
            ring: [
              [16, 45], [17, 49], [23, 49], [24, 46], [20, 44], [16, 45],
            ],
          },
          {
            id: 'finno-ugric-ural',
            name: 'Ural fringe',
            ring: [
              [50, 56], [52, 64], [62, 64], [64, 58], [58, 54], [50, 56],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Finno-Ugric peoples', url: 'https://en.wikipedia.org/wiki/Finno-Ugric_peoples' },
    ],
  },
  {
    id: 'khoisan-peoples',
    name: 'Khoisan peoples',
    color: '#A3A3A3',
    type: 'people',
    description:
      'Khoisan peoples of southern Africa — schematic Kalahari / Cape cultural footprint across deep time (not a state border).',
    keyYears: [-2000, -500, 500, 1500],
    overlays: [
      {
        year: -2000,
        label: 'Deep-time southern Africa',
        approximation: 'schematic',
        regions: [
          {
            id: 'khoisan-core',
            name: 'Southern Africa core',
            ring: [
              [14, -34], [16, -22], [28, -22], [30, -32], [24, -35], [14, -34],
            ],
          },
        ],
      },
      {
        year: -500,
        label: 'Kalahari / Cape zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'khoisan-kalahari',
            name: 'Kalahari',
            ring: [
              [18, -28], [20, -20], [28, -20], [28, -28], [24, -30], [18, -28],
            ],
          },
          {
            id: 'khoisan-cape',
            name: 'Cape fringe',
            ring: [
              [16, -35], [18, -30], [26, -30], [28, -34], [22, -36], [16, -35],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Early historic Khoisan zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'khoisan-kalahari',
            name: 'Kalahari',
            ring: [
              [18, -28], [20, -20], [28, -20], [28, -28], [24, -30], [18, -28],
            ],
          },
          {
            id: 'khoisan-cape',
            name: 'Cape',
            ring: [
              [16, -35], [18, -30], [26, -30], [28, -34], [22, -36], [16, -35],
            ],
          },
        ],
      },
      {
        year: 1500,
        label: 'Late precolonial Khoisan zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'khoisan-kalahari',
            name: 'Kalahari',
            ring: [
              [18, -28], [20, -18], [28, -18], [28, -28], [24, -30], [18, -28],
            ],
          },
          {
            id: 'khoisan-cape',
            name: 'Cape / Karoo fringe',
            ring: [
              [16, -35], [18, -29], [26, -29], [28, -34], [22, -36], [16, -35],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Khoisan', url: 'https://en.wikipedia.org/wiki/Khoisan' },
    ],
  },
  {
    id: 'inuit-peoples',
    name: 'Inuit peoples',
    color: '#E0F2FE',
    type: 'people',
    description:
      'Inuit / Arctic peoples — schematic Alaska, Canadian Arctic, and Greenland footholds as separate regions (no ocean-spanning blob).',
    keyYears: [-500, 500, 1200, 1700],
    overlays: [
      {
        year: -500,
        label: 'Early Arctic Inuit / paleo-Inuit fringe',
        approximation: 'schematic',
        regions: [
          {
            id: 'inuit-alaska',
            name: 'Alaska Arctic',
            ring: [
              [-168, 64], [-166, 72], [-148, 72], [-146, 66], [-156, 62], [-168, 64],
            ],
          },
          {
            id: 'inuit-canada',
            name: 'Canadian Arctic fringe',
            ring: [
              [-120, 66], [-118, 74], [-90, 74], [-88, 68], [-100, 64], [-120, 66],
            ],
          },
        ],
      },
      {
        year: 500,
        label: 'Expanded Arctic presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'inuit-alaska',
            name: 'Alaska',
            ring: [
              [-170, 62], [-168, 72], [-146, 72], [-144, 64], [-156, 60], [-170, 62],
            ],
          },
          {
            id: 'inuit-canada',
            name: 'Canadian Arctic',
            ring: [
              [-120, 66], [-118, 76], [-80, 76], [-78, 68], [-95, 64], [-120, 66],
            ],
          },
          {
            id: 'inuit-greenland',
            name: 'Greenland fringe',
            ring: [
              [-54, 60], [-52, 72], [-40, 72], [-38, 62], [-46, 58], [-54, 60],
            ],
          },
        ],
      },
      {
        year: 1200,
        label: 'Thule / medieval Inuit zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'inuit-alaska',
            name: 'Alaska',
            ring: [
              [-170, 62], [-168, 72], [-146, 72], [-144, 64], [-156, 60], [-170, 62],
            ],
          },
          {
            id: 'inuit-canada',
            name: 'Canadian Arctic',
            ring: [
              [-120, 66], [-118, 76], [-80, 76], [-78, 68], [-95, 64], [-120, 66],
            ],
          },
          {
            id: 'inuit-greenland',
            name: 'Greenland',
            ring: [
              [-54, 60], [-52, 74], [-38, 74], [-36, 62], [-46, 58], [-54, 60],
            ],
          },
        ],
      },
      {
        year: 1700,
        label: 'Historic Inuit zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'inuit-alaska',
            name: 'Alaska',
            ring: [
              [-170, 62], [-168, 72], [-146, 72], [-144, 64], [-156, 60], [-170, 62],
            ],
          },
          {
            id: 'inuit-canada',
            name: 'Canadian Arctic',
            ring: [
              [-120, 66], [-118, 76], [-80, 76], [-78, 68], [-95, 64], [-120, 66],
            ],
          },
          {
            id: 'inuit-greenland',
            name: 'Greenland',
            ring: [
              [-54, 60], [-52, 74], [-38, 74], [-36, 62], [-46, 58], [-54, 60],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Inuit', url: 'https://en.wikipedia.org/wiki/Inuit' },
    ],
  },
  {
    id: 'maya-peoples',
    name: 'Maya peoples',
    color: '#3F6212',
    type: 'people',
    description:
      'Maya ethnolinguistic peoples of Mesoamerica — schematic highland / lowland cultural footprint (distinct from Aztec polity overlays).',
    keyYears: [-500, 250, 800, 1500],
    overlays: [
      {
        year: -500,
        label: 'Preclassic Maya zone',
        approximation: 'schematic',
        regions: [
          {
            id: 'maya-core',
            name: 'Maya lowlands / highlands',
            ring: [
              [-92, 14], [-91, 20], [-87, 20], [-87, 15], [-90, 14], [-92, 14],
            ],
          },
        ],
      },
      {
        year: 250,
        label: 'Early Classic Maya',
        approximation: 'schematic',
        regions: [
          {
            id: 'maya-lowlands',
            name: 'Lowland Maya',
            ring: [
              [-92, 16], [-91, 21], [-87, 21], [-87, 16], [-90, 15], [-92, 16],
            ],
          },
          {
            id: 'maya-highlands',
            name: 'Highland Maya',
            ring: [
              [-92.5, 14], [-91.5, 16.5], [-89, 16.5], [-89, 14.5], [-91, 13.8], [-92.5, 14],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Late Classic Maya',
        approximation: 'schematic',
        regions: [
          {
            id: 'maya-lowlands',
            name: 'Lowland Maya',
            ring: [
              [-92.5, 15.5], [-91.5, 21.5], [-86.5, 21.5], [-86.5, 16], [-90, 15], [-92.5, 15.5],
            ],
          },
          {
            id: 'maya-highlands',
            name: 'Highland Maya',
            ring: [
              [-92.5, 14], [-91.5, 16.5], [-89, 16.5], [-89, 14.5], [-91, 13.8], [-92.5, 14],
            ],
          },
        ],
      },
      {
        year: 1500,
        label: 'Postclassic / contact-era Maya',
        approximation: 'schematic',
        regions: [
          {
            id: 'maya-yucatan',
            name: 'Yucatán',
            ring: [
              [-91, 18], [-90, 21.5], [-87, 21.5], [-87, 18.5], [-89.5, 17.5], [-91, 18],
            ],
          },
          {
            id: 'maya-highlands',
            name: 'Highland Maya',
            ring: [
              [-92.5, 14], [-91.5, 16.5], [-89, 16.5], [-89, 14.5], [-91, 13.8], [-92.5, 14],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Maya peoples', url: 'https://en.wikipedia.org/wiki/Maya_peoples' },
    ],
  },
  {
    id: 'andean-peoples',
    name: 'Andean peoples',
    color: '#FB923C',
    type: 'people',
    description:
      'Andean / Quechua cultural sphere — schematic highland + coastal footholds across the central Andes (broader than Inca polity alone).',
    keyYears: [-500, 200, 800, 1400],
    overlays: [
      {
        year: -500,
        label: 'Early Andean cultural zone',
        approximation: 'schematic',
        regions: [
          {
            id: 'andean-central',
            name: 'Central Andes',
            ring: [
              [-78, -16], [-77, -8], [-70, -8], [-69, -14], [-72, -18], [-78, -16],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Expanded Andean presence',
        approximation: 'schematic',
        regions: [
          {
            id: 'andean-central',
            name: 'Central Andes',
            ring: [
              [-79, -18], [-78, -6], [-68, -6], [-68, -16], [-72, -20], [-79, -18],
            ],
          },
          {
            id: 'andean-coast',
            name: 'Pacific coastal fringe',
            ring: [
              [-82, -16], [-81, -6], [-78, -6], [-78, -14], [-80, -18], [-82, -16],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Middle Horizon Andean sphere',
        approximation: 'schematic',
        regions: [
          {
            id: 'andean-central',
            name: 'Central Andes',
            ring: [
              [-79, -20], [-78, -4], [-66, -4], [-66, -18], [-72, -22], [-79, -20],
            ],
          },
          {
            id: 'andean-coast',
            name: 'Coastal fringe',
            ring: [
              [-82, -18], [-81, -4], [-78, -4], [-78, -16], [-80, -20], [-82, -18],
            ],
          },
        ],
      },
      {
        year: 1400,
        label: 'Late Andean / Quechua sphere',
        approximation: 'schematic',
        regions: [
          {
            id: 'andean-central',
            name: 'Central / southern Andes',
            ring: [
              [-79, -22], [-78, -2], [-64, -2], [-64, -20], [-70, -24], [-79, -22],
            ],
          },
          {
            id: 'andean-coast',
            name: 'Coastal fringe',
            ring: [
              [-82, -18], [-81, -2], [-78, -2], [-78, -16], [-80, -20], [-82, -18],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Andean civilizations', url: 'https://en.wikipedia.org/wiki/Andean_civilizations' },
    ],
  },
  {
    id: 'nilotic-peoples',
    name: 'Nilotic peoples',
    color: '#14532D',
    type: 'people',
    description:
      'Nilotic peoples of East Africa — schematic Upper Nile / South Sudan / Kenya–Tanzania cultural footholds (not a single polity).',
    keyYears: [-500, 200, 800, 1500],
    overlays: [
      {
        year: -500,
        label: 'Early Nilotic Upper Nile',
        approximation: 'schematic',
        regions: [
          {
            id: 'nilotic-upper-nile',
            name: 'Upper Nile',
            ring: [
              [28, 4], [30, 14], [36, 14], [36, 6], [32, 2], [28, 4],
            ],
          },
        ],
      },
      {
        year: 200,
        label: 'Expanded Nilotic zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'nilotic-upper-nile',
            name: 'Upper Nile / South Sudan',
            ring: [
              [26, 2], [28, 14], [36, 14], [38, 6], [32, 0], [26, 2],
            ],
          },
          {
            id: 'nilotic-rift',
            name: 'Rift / Kenya fringe',
            ring: [
              [34, -2], [35, 6], [38, 6], [39, 0], [36, -4], [34, -2],
            ],
          },
        ],
      },
      {
        year: 800,
        label: 'Medieval Nilotic East Africa',
        approximation: 'schematic',
        regions: [
          {
            id: 'nilotic-upper-nile',
            name: 'Upper Nile',
            ring: [
              [26, 2], [28, 14], [36, 14], [38, 6], [32, 0], [26, 2],
            ],
          },
          {
            id: 'nilotic-rift',
            name: 'Kenya / Tanzania fringe',
            ring: [
              [33, -6], [34, 4], [39, 4], [40, -2], [36, -8], [33, -6],
            ],
          },
        ],
      },
      {
        year: 1500,
        label: 'Late Nilotic zones',
        approximation: 'schematic',
        regions: [
          {
            id: 'nilotic-upper-nile',
            name: 'Upper Nile',
            ring: [
              [26, 2], [28, 14], [36, 14], [38, 6], [32, 0], [26, 2],
            ],
          },
          {
            id: 'nilotic-rift',
            name: 'East African Rift fringe',
            ring: [
              [33, -8], [34, 4], [39, 4], [40, -4], [36, -10], [33, -8],
            ],
          },
        ],
      },
    ],
    sources: [
      { title: 'Wikipedia — Nilotic peoples', url: 'https://en.wikipedia.org/wiki/Nilotic_peoples' },
    ],
  },

];
