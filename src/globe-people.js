/**
 * Day 27 — People packs (human-atlas layer 2).
 *
 * Cultural / ethnolinguistic peoples that are not state polities.
 * Schematic spheres of presence — honest approximate footprints, not GIS.
 * Distant island / diaspora footholds stay separate region ids (no ocean blobs).
 */

/**
 * @typedef {import('./globe-overlays.js').SpatialEntity} SpatialEntity
 */

/** First people pack — 10 seeded groups. */
export const PEOPLE_PACK_IDS = [
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
];
