/**
 * Day 57 — the early medieval world on the globe, about 500–1000 CE.
 *
 * Before this the globe had a thin Merovingian→Carolingian bbox blob, schematic Tang /
 * Byzantine / Umayyad / Abbasid / Srivijaya shapes, and nothing for the Visigoths,
 * Anglo-Saxon kingdoms, Avars, Khazars, Göktürks, Uyghurs, Tibetan Empire, Nanzhao or Silla.
 * This module adds or redraws those polities. Rings are honest hand-drawn approximations
 * (early medieval frontiers were fluid; each entity says how sure we are). Neighbours sit
 * beside Tang / Umayyad Spain rather than erasing them; Visigoths hand off before 711.
 *
 * Shapes live in the lazy globe chunk (see docs/DATA.md). Loaded via globe-overlays.js.
 */

const A = 'simplified';
const R = (id, name, ring) => ({ id, name, ring });
const K = (year, label, regions, extra = {}) => ({ year, label, approximation: A, regions, ...extra });
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${title.replace(/ /g, '_')}` });

const CONF = {
  frankish: {
    level: 'approximate',
    reason: 'Frankish expansion is well chronicled (Gregory of Tours, Royal Frankish Annals); the eastern and southern frontiers moved with campaigns and are drawn roughly here.',
  },
  iberia: {
    level: 'approximate',
    reason: 'Visigothic Spain is known from chronicles and church councils; how firmly the mountains and northern fringe were held is debated.',
  },
  britain: {
    level: 'approximate',
    reason: 'Heptarchy kingdoms are named in Bede and the Anglo-Saxon Chronicle; their frontiers shifted with war and are drawn as regions, not surveyed borders.',
  },
  steppe: {
    level: 'conjectural',
    reason: 'Steppe khaganates ruled by pasturage and tribute, not fixed borders; rings follow the zone of known camps, raids and subject peoples from Chinese and Byzantine sources.',
  },
  tibet: {
    level: 'approximate',
    reason: 'Tibetan Empire extent is known from Tibetan and Tang records (treaties, the Lhasa pillar); the western and northern edges are rough.',
  },
  eastasia: {
    level: 'approximate',
    reason: 'Nanzhao and Silla are well attested in Chinese and Korean sources; frontiers with Tang and with neighbours are approximate.',
  },
  maritime: {
    level: 'approximate',
    reason: 'Srivijaya controlled ports and sea lanes more than hinterland; land rings are the Sumatran / Malay footholds known from inscriptions and Chinese notices, not a filled ocean.',
  },
};

// --- Western Europe rings (closed [lng, lat]) -------------------------------------------------

const GAUL_CORE = [
  [-1.5, 43.2], [-4.2, 48.2], [-1.8, 49.6], [1.5, 50.1], [4.2, 49.6],
  [5.8, 47.8], [7.2, 47.2], [7.0, 45.5], [5.5, 44.2], [4.8, 43.4],
  [3.0, 42.8], [0.5, 42.6], [-1.5, 43.2],
];
const GAUL_AQUIT = [
  [-1.2, 43.0], [-0.5, 45.5], [1.2, 45.8], [2.5, 44.5], [1.8, 43.2], [-0.2, 42.8], [-1.2, 43.0],
];
const NEUSTRIA = [
  [-1.8, 47.5], [-4.0, 48.5], [-1.5, 49.8], [2.5, 50.0], [4.5, 49.2],
  [4.0, 47.8], [1.5, 47.2], [-1.8, 47.5],
];
const AUSTRASIA = [
  [4.0, 48.0], [5.5, 50.5], [8.5, 51.2], [10.5, 50.0], [9.5, 48.0],
  [8.0, 46.8], [6.0, 46.5], [4.5, 47.2], [4.0, 48.0],
];
const BURGUNDY = [
  [4.5, 45.0], [5.0, 47.2], [7.2, 47.5], [7.5, 45.8], [6.5, 44.8], [5.0, 44.5], [4.5, 45.0],
];
const FRANCIA_800_W = [
  [-4.5, 43.0], [-5.0, 48.5], [-2.0, 50.5], [2.0, 51.0], [5.0, 50.2],
  [6.5, 48.5], [5.5, 46.0], [4.0, 43.5], [1.0, 42.5], [-2.0, 42.8], [-4.5, 43.0],
];
const FRANCIA_800_E = [
  [5.5, 46.0], [7.0, 48.5], [9.5, 53.5], [14.0, 54.0], [16.5, 52.0],
  [15.5, 49.0], [13.0, 47.0], [10.5, 46.0], [8.0, 45.5], [5.5, 46.0],
];
const FRANCIA_ITALY = [
  [7.0, 44.0], [8.5, 46.2], [11.5, 46.5], [13.5, 45.8], [12.5, 44.2],
  [10.5, 43.8], [8.5, 43.5], [7.0, 44.0],
];
const FRANCIA_SAXONY = [
  [8.5, 51.0], [10.0, 53.8], [14.0, 54.2], [15.0, 52.5], [12.5, 51.0], [9.5, 50.5], [8.5, 51.0],
];
const WEST_FRANCIA = [
  [-4.5, 43.0], [-4.8, 48.5], [-1.5, 50.5], [2.5, 51.0], [5.0, 49.5],
  [5.5, 47.0], [4.0, 44.0], [1.0, 42.5], [-2.0, 42.8], [-4.5, 43.0],
];
const EAST_FRANCIA = [
  [5.5, 46.5], [7.5, 49.0], [10.0, 53.5], [14.5, 54.0], [16.0, 51.5],
  [14.0, 48.0], [11.0, 46.5], [8.0, 45.8], [5.5, 46.5],
];
const MIDDLE_FRANCIA = [
  [4.5, 43.5], [5.0, 48.5], [7.0, 50.5], [8.5, 49.0], [7.5, 46.0],
  [7.0, 44.5], [9.0, 45.5], [11.0, 45.8], [10.0, 44.0], [6.5, 43.2], [4.5, 43.5],
];

const IBERIA_FULL = [
  [-9.2, 37.0], [-9.0, 42.0], [-7.5, 43.5], [-5.0, 43.6], [-2.0, 43.4],
  [0.5, 42.5], [2.5, 42.0], [3.2, 41.2], [2.0, 38.5], [0.0, 37.5],
  [-2.5, 36.5], [-5.5, 36.0], [-8.0, 36.5], [-9.2, 37.0],
];
const IBERIA_NO_GALLIA = [
  [-9.2, 37.0], [-9.0, 42.0], [-7.5, 43.5], [-5.0, 43.5], [-2.5, 43.2],
  [-0.5, 42.5], [1.5, 41.8], [2.8, 41.0], [1.5, 38.5], [-1.0, 37.2],
  [-4.0, 36.2], [-7.5, 36.5], [-9.2, 37.0],
];
const SEPTIMANIA = [
  [1.5, 42.2], [2.0, 43.5], [3.5, 43.6], [4.2, 43.0], [3.5, 42.4], [2.2, 42.0], [1.5, 42.2],
];

const NORTHUMBRIA = [
  [-3.5, 54.0], [-2.0, 55.8], [0.5, 55.5], [-0.5, 54.2], [-1.5, 53.5], [-3.0, 53.5], [-3.5, 54.0],
];
const MERCIA = [
  [-3.2, 52.0], [-2.8, 53.5], [-0.5, 53.4], [0.2, 52.5], [-0.5, 51.6], [-2.0, 51.5], [-3.2, 52.0],
];
const WESSEX = [
  [-5.5, 50.2], [-4.5, 51.5], [-2.5, 51.6], [-1.0, 51.4], [-0.8, 50.6],
  [-2.0, 50.4], [-3.5, 50.2], [-5.0, 50.0], [-5.5, 50.2],
];
const EAST_ANGLIA = [
  [0.2, 52.0], [0.5, 52.8], [1.8, 52.8], [1.6, 52.0], [1.0, 51.6], [0.2, 52.0],
];
const KENT = [
  [0.2, 51.1], [0.5, 51.5], [1.4, 51.4], [1.3, 51.0], [0.8, 50.9], [0.2, 51.1],
];
const SUSSEX = [
  [-0.8, 50.7], [-0.2, 51.1], [0.5, 51.0], [0.3, 50.7], [-0.5, 50.6], [-0.8, 50.7],
];
const ESSEX = [
  [-0.2, 51.4], [0.0, 52.0], [1.0, 51.9], [0.8, 51.4], [0.2, 51.3], [-0.2, 51.4],
];

const AVAR_CORE = [
  [15.5, 45.0], [16.0, 48.0], [19.5, 48.5], [22.5, 47.8], [23.0, 45.5],
  [21.0, 44.2], [18.0, 44.0], [15.5, 45.0],
];
const AVAR_WIDE = [
  [14.5, 44.5], [15.0, 48.5], [20.0, 49.2], [24.0, 48.0], [25.0, 45.5],
  [22.5, 43.8], [18.5, 43.5], [15.5, 44.0], [14.5, 44.5],
];

const KHAZAR_CORE = [
  [40.0, 44.0], [42.0, 48.0], [48.0, 49.5], [52.0, 48.0], [52.0, 44.5],
  [48.0, 42.5], [44.0, 42.0], [40.0, 44.0],
];
const KHAZAR_WIDE = [
  [36.0, 44.5], [38.0, 48.5], [45.0, 51.0], [52.0, 50.5], [55.0, 47.0],
  [54.0, 43.5], [50.0, 41.5], [45.0, 41.0], [40.0, 42.5], [36.0, 44.5],
];
const KHAZAR_CRIMEA = [
  [32.5, 44.5], [33.5, 46.0], [36.5, 46.2], [36.0, 44.8], [34.0, 44.2], [32.5, 44.5],
];

const GOKTURK_WEST = [
  [70.0, 42.0], [72.0, 48.0], [85.0, 50.0], [90.0, 47.0], [88.0, 42.5],
  [80.0, 41.0], [72.0, 41.0], [70.0, 42.0],
];
const GOKTURK_EAST = [
  [90.0, 42.0], [92.0, 48.0], [105.0, 50.5], [115.0, 49.0], [118.0, 45.0],
  [112.0, 42.0], [100.0, 41.5], [92.0, 41.5], [90.0, 42.0],
];
const GOKTURK_PEAK = [
  [65.0, 40.0], [68.0, 48.0], [85.0, 52.0], [105.0, 52.0], [118.0, 48.0],
  [120.0, 44.0], [110.0, 41.0], [90.0, 40.0], [75.0, 39.0], [65.0, 40.0],
];

const UYGHUR_CORE = [
  [88.0, 42.0], [90.0, 48.0], [102.0, 49.0], [110.0, 47.0], [108.0, 43.0],
  [100.0, 41.5], [92.0, 41.5], [88.0, 42.0],
];
const UYGHUR_TARIM = [
  [78.0, 37.0], [80.0, 41.0], [90.0, 42.0], [95.0, 40.0], [92.0, 37.0],
  [85.0, 36.5], [78.0, 37.0],
];

const TIBET_CORE = [
  [82.0, 28.5], [84.0, 32.0], [92.0, 33.5], [98.0, 32.5], [100.0, 30.0],
  [98.0, 27.5], [92.0, 27.0], [85.0, 27.5], [82.0, 28.5],
];
const TIBET_PEAK = [
  [78.0, 28.0], [80.0, 34.0], [88.0, 36.5], [98.0, 36.0], [103.0, 33.0],
  [102.0, 29.0], [98.0, 27.0], [90.0, 26.5], [82.0, 27.0], [78.0, 28.0],
];
const TIBET_GANSU = [
  [98.0, 35.0], [100.0, 38.0], [105.0, 38.5], [106.0, 36.5], [103.0, 35.0], [98.0, 35.0],
];

const NANZHAO = [
  [98.5, 23.0], [99.5, 26.5], [103.0, 27.0], [105.0, 25.5], [104.5, 22.5],
  [101.5, 22.0], [98.5, 23.0],
];
const NANZHAO_WIDE = [
  [97.5, 22.5], [98.5, 27.0], [103.5, 27.5], [106.0, 25.5], [105.5, 21.5],
  [102.0, 21.0], [98.5, 21.5], [97.5, 22.5],
];

const SILLA_CORE = [
  [127.5, 34.8], [128.0, 36.5], [129.5, 36.8], [129.8, 35.5], [129.0, 34.8], [127.5, 34.8],
];
const SILLA_UNIFIED = [
  [126.2, 34.5], [126.5, 37.8], [128.5, 38.2], [129.8, 37.2], [129.8, 35.2],
  [128.5, 34.4], [126.8, 34.2], [126.2, 34.5],
];

const SUMATRA_S = [
  [102.0, -5.2], [103.0, -1.5], [105.5, -1.0], [106.0, -3.5], [104.5, -5.5], [102.0, -5.2],
];
const SUMATRA_MID = [
  [100.5, -3.5], [101.0, 1.5], [104.0, 2.0], [105.0, -1.0], [103.5, -3.5], [100.5, -3.5],
];
const MALAY_PEN = [
  [100.0, 1.2], [100.5, 5.5], [103.5, 5.8], [104.0, 2.5], [102.5, 1.0], [100.0, 1.2],
];
const JAVA_W = [
  [105.5, -7.8], [106.0, -5.8], [109.0, -5.5], [109.5, -7.2], [107.5, -8.0], [105.5, -7.8],
];
const KEDAH = [
  [99.5, 5.0], [100.0, 6.5], [101.0, 6.2], [100.8, 5.0], [100.0, 4.8], [99.5, 5.0],
];

// --- Polities ---------------------------------------------------------------------------------

const frankish = {
  id: 'frankish-empire',
  name: 'Frankish / Carolingian realm',
  color: '#0D9488',
  type: 'empire',
  description:
    'From Clovis’s conversion (496) the Merovingian Franks united most of Gaul; under the Carolingians — especially Charlemagne (crowned emperor in 800) — the realm stretched from the Pyrenees and northern Italy to the Elbe. The Treaty of Verdun (843) split it into West, Middle and East Francia, the seeds of France and Germany. Drawn from chronicles; the eastern marches against Saxons and Avars were fluid.',
  nameAt: [
    [481, 'Merovingian Francia'],
    [751, 'Carolingian Empire'],
    [843, 'Frankish realms (after Verdun)'],
  ],
  keyYears: [500, 561, 600, 714, 768, 800, 814, 843],
  overlays: [
    K(500, 'Clovis’s sons: early Merovingian Gaul', [
      R('gaul', 'Gaul', GAUL_CORE),
      R('aquitaine', 'Aquitaine', GAUL_AQUIT),
    ]),
    K(561, 'After Clothar I: Neustria, Austrasia, Burgundy', [
      R('neustria', 'Neustria', NEUSTRIA),
      R('austrasia', 'Austrasia', AUSTRASIA),
      R('burgundy', 'Burgundy', BURGUNDY),
      R('aquitaine', 'Aquitaine', GAUL_AQUIT),
    ]),
    K(600, 'Merovingian kingdoms', [
      R('neustria', 'Neustria', NEUSTRIA),
      R('austrasia', 'Austrasia', AUSTRASIA),
      R('burgundy', 'Burgundy', BURGUNDY),
      R('aquitaine', 'Aquitaine', GAUL_AQUIT),
    ]),
    K(714, 'Charles Martel’s rise (mayor of the palace)', [
      R('neustria', 'Neustria / west', NEUSTRIA),
      R('austrasia', 'Austrasia', AUSTRASIA),
      R('burgundy', 'Burgundy', BURGUNDY),
    ]),
    K(768, 'Charlemagne and Carloman inherit', [
      R('west', 'West Francia / Gaul', FRANCIA_800_W),
      R('east', 'Austrasia / east', FRANCIA_800_E),
    ]),
    K(800, 'Charlemagne crowned emperor', [
      R('west', 'Gaul / West', FRANCIA_800_W),
      R('east', 'East Francia / Germany', FRANCIA_800_E),
      R('italy', 'Lombard Italy (north)', FRANCIA_ITALY),
      R('saxony', 'Saxony (recently subdued)', FRANCIA_SAXONY),
    ]),
    K(814, 'At Charlemagne’s death', [
      R('west', 'Gaul / West', FRANCIA_800_W),
      R('east', 'East Francia / Germany', FRANCIA_800_E),
      R('italy', 'Northern Italy', FRANCIA_ITALY),
      R('saxony', 'Saxony', FRANCIA_SAXONY),
    ]),
    K(843, 'Treaty of Verdun: three kingdoms', [
      R('west', 'West Francia', WEST_FRANCIA),
      R('middle', 'Middle Francia (Lotharingia)', MIDDLE_FRANCIA),
      R('east', 'East Francia', EAST_FRANCIA),
    ]),
  ],
  timelineItemIds: ['frankish'],
  confidence: CONF.frankish,
  sources: [
    W('Franks'),
    W('Carolingian Empire'),
    W('Treaty of Verdun'),
    { title: 'McKitterick, The Frankish Kingdoms under the Carolingians (1983)', url: 'https://www.routledge.com/The-Frankish-Kingdoms-Under-the-Carolingians-751-987/McKitterick/p/book/9780582490055' },
  ],
  edgeGrace: 8,
};

const visigoths = {
  id: 'visigothic-kingdom',
  name: 'Visigothic Kingdom',
  color: '#C2410C',
  type: 'empire',
  description:
    'After the sack of Rome the Visigoths settled in Aquitaine, then built a kingdom centred on Toledo that ruled most of Iberia. Defeat by the Franks at Vouillé (507) pushed them out of most of Gaul; in 711 a Muslim army under Tariq defeated Roderic, and within a few years the kingdom collapsed. Al-Andalus (Umayyad Spain) takes over on this map after 711.',
  nameAt: [
    [418, 'Visigothic Kingdom (Toulouse)'],
    [507, 'Visigothic Kingdom (Toledo)'],
  ],
  keyYears: [500, 507, 570, 650, 700],
  overlays: [
    K(500, 'Kingdom of Toulouse: Iberia and Septimania', [
      R('iberia', 'Hispania', IBERIA_FULL),
      R('septimania', 'Septimania / Narbonensis', SEPTIMANIA),
    ]),
    K(507, 'After Vouillé: Spain and a Narbonne fringe', [
      R('iberia', 'Hispania', IBERIA_NO_GALLIA),
      R('septimania', 'Septimania', SEPTIMANIA),
    ]),
    K(570, 'Leovigild’s consolidation', [
      R('iberia', 'Hispania', IBERIA_NO_GALLIA),
      R('septimania', 'Septimania', SEPTIMANIA),
    ]),
    K(650, 'Toledo kingdom at its height', [
      R('iberia', 'Hispania', IBERIA_NO_GALLIA),
      R('septimania', 'Septimania', SEPTIMANIA),
    ]),
    K(700, 'Last decades before 711', [
      R('iberia', 'Hispania', IBERIA_NO_GALLIA),
      R('septimania', 'Septimania', SEPTIMANIA),
    ]),
  ],
  timelineItemIds: ['visigothic-kingdom'],
  confidence: CONF.iberia,
  sources: [W('Visigothic Kingdom'), W('Battle of Vouillé'), W('Umayyad conquest of Hispania')],
  edgeGrace: 6,
};

const angloSaxons = {
  id: 'anglo-saxon-kingdoms',
  name: 'Anglo-Saxon kingdoms',
  color: '#2563EB',
  type: 'civilization',
  description:
    'After Roman Britain, Angles, Saxons and Jutes founded several kingdoms (the “Heptarchy”). Northumbria, Mercia and later Wessex were the strongest; by the late 9th century Wessex under Alfred resisted the Danes, and in 927 Æthelstan is often counted as the first king of a united English realm. Kingdoms are drawn as separate regions that grow and shrink.',
  nameAt: [
    [550, 'Anglo-Saxon kingdoms (Heptarchy)'],
    [870, 'Wessex and the Danish wars'],
    [927, 'Kingdom of the English'],
  ],
  keyYears: [600, 650, 700, 750, 800, 870, 900, 927],
  overlays: [
    K(600, 'Early Heptarchy', [
      R('northumbria', 'Northumbria', NORTHUMBRIA),
      R('mercia', 'Mercia', MERCIA),
      R('wessex', 'Wessex', WESSEX),
      R('east-anglia', 'East Anglia', EAST_ANGLIA),
      R('kent', 'Kent', KENT),
    ]),
    K(650, 'After the Synod of Whitby era', [
      R('northumbria', 'Northumbria', NORTHUMBRIA),
      R('mercia', 'Mercia', MERCIA),
      R('wessex', 'Wessex', WESSEX),
      R('east-anglia', 'East Anglia', EAST_ANGLIA),
      R('kent', 'Kent', KENT),
      R('sussex', 'Sussex', SUSSEX),
    ]),
    K(700, 'Mercian rise beginning', [
      R('northumbria', 'Northumbria', NORTHUMBRIA),
      R('mercia', 'Mercia', MERCIA),
      R('wessex', 'Wessex', WESSEX),
      R('east-anglia', 'East Anglia', EAST_ANGLIA),
      R('kent', 'Kent', KENT),
      R('essex', 'Essex', ESSEX),
    ]),
    K(750, 'Mercian supremacy (Æthelbald / Offa)', [
      R('northumbria', 'Northumbria', NORTHUMBRIA),
      R('mercia', 'Mercia (enlarged)', [
        [-3.5, 51.8], [-3.0, 53.6], [0.0, 53.5], [0.8, 52.2], [0.2, 51.4],
        [-1.5, 51.3], [-3.0, 51.5], [-3.5, 51.8],
      ]),
      R('wessex', 'Wessex', WESSEX),
      R('east-anglia', 'East Anglia', EAST_ANGLIA),
      R('kent', 'Kent', KENT),
    ]),
    K(800, 'Offa’s Mercia and neighbours', [
      R('northumbria', 'Northumbria', NORTHUMBRIA),
      R('mercia', 'Mercia', [
        [-3.5, 51.8], [-3.0, 53.6], [0.0, 53.5], [0.8, 52.2], [0.2, 51.4],
        [-1.5, 51.3], [-3.0, 51.5], [-3.5, 51.8],
      ]),
      R('wessex', 'Wessex', WESSEX),
      R('east-anglia', 'East Anglia', EAST_ANGLIA),
      R('kent', 'Kent', KENT),
    ]),
    K(870, 'Great Heathen Army: Wessex holds the south', [
      R('wessex', 'Wessex', [
        [-5.5, 50.2], [-4.8, 51.8], [-2.0, 52.0], [-0.5, 51.5], [-0.8, 50.6],
        [-2.5, 50.3], [-4.5, 50.0], [-5.5, 50.2],
      ]),
      R('mercia', 'English Mercia (west)', [
        [-3.2, 52.0], [-2.8, 53.2], [-1.5, 53.0], [-1.2, 52.2], [-2.2, 51.8], [-3.2, 52.0],
      ]),
    ]),
    K(900, 'Edward the Elder / Æthelflæd reconquest', [
      R('wessex-mercia', 'Wessex–Mercia', [
        [-5.5, 50.2], [-4.5, 52.5], [-2.0, 53.5], [0.5, 53.2], [1.0, 52.0],
        [0.5, 51.0], [-1.0, 50.5], [-3.5, 50.2], [-5.5, 50.2],
      ]),
      R('northumbria', 'Northumbria / Jórvík zone', NORTHUMBRIA),
    ]),
    K(927, 'Æthelstan: kingdom of the English', [
      R('england', 'England', [
        [-5.5, 50.2], [-4.5, 53.0], [-3.0, 55.5], [0.0, 55.5], [1.5, 52.8],
        [1.2, 51.0], [-0.5, 50.5], [-3.5, 50.2], [-5.5, 50.2],
      ]),
    ]),
  ],
  timelineItemIds: ['anglo-saxon-kingdoms'],
  confidence: CONF.britain,
  sources: [W('Heptarchy'), W('Mercia'), W('Wessex'), W('Æthelstan')],
  edgeGrace: 10,
};

const avars = {
  id: 'avar-khaganate',
  name: 'Avar Khaganate',
  color: '#7C3AED',
  type: 'empire',
  description:
    'A steppe power that settled in the Carpathian basin after 568, pressing Byzantium and the Slavs. Charlemagne’s campaigns (791–796) broke the khaganate; by the early 9th century it had dissolved. The ring is the Pannonian core of camps and subject peoples, not a fixed state border.',
  keyYears: [580, 650, 700, 790, 822],
  overlays: [
    K(580, 'Avars in Pannonia', [R('pannonia', 'Pannonian basin', AVAR_CORE)]),
    K(650, 'Avar khaganate', [R('pannonia', 'Pannonian basin', AVAR_WIDE)]),
    K(700, 'Before the Frankish wars', [R('pannonia', 'Pannonian basin', AVAR_WIDE)]),
    K(790, 'On the eve of Charlemagne’s wars', [R('pannonia', 'Pannonian basin', AVAR_CORE)]),
    K(822, 'Last mentions; khaganate dissolving', [R('pannonia', 'Pannonian remnant', AVAR_CORE)]),
  ],
  timelineItemIds: ['avar-khaganate'],
  confidence: CONF.steppe,
  sources: [W('Pannonian Avars'), W('Avar Khaganate')],
  edgeGrace: 8,
};

const khazars = {
  id: 'khazar-khaganate',
  name: 'Khazar Khaganate',
  color: '#D97706',
  type: 'empire',
  description:
    'A Turkic khaganate on the Pontic–Caspian steppe that controlled the Volga–Don trade and blocked Arab expansion north of the Caucasus. Its elite famously adopted Judaism (8th–9th c.). Sviatoslav of Kiev destroyed the capital Atil around 965–969. Frontiers are the zone of Khazar authority known from Arabic, Byzantine and Hebrew sources.',
  keyYears: [650, 730, 800, 860, 940],
  overlays: [
    K(650, 'Early Khazar rise', [R('core', 'Volga–Caspian steppe', KHAZAR_CORE)]),
    K(730, 'After wars with the Umayyads', [
      R('core', 'Volga–Caspian steppe', KHAZAR_WIDE),
      R('crimea', 'Crimea / Bosporus fringe', KHAZAR_CRIMEA),
    ]),
    K(800, 'Khazar zenith', [
      R('core', 'Volga–Caspian steppe', KHAZAR_WIDE),
      R('crimea', 'Crimea fringe', KHAZAR_CRIMEA),
    ]),
    K(860, 'Still strong on the steppe', [
      R('core', 'Volga–Caspian steppe', KHAZAR_WIDE),
      R('crimea', 'Crimea fringe', KHAZAR_CRIMEA),
    ]),
    K(940, 'Late Khazaria before Sviatoslav', [R('core', 'Volga–Caspian core', KHAZAR_CORE)]),
  ],
  timelineItemIds: ['khazar-khaganate'],
  confidence: CONF.steppe,
  sources: [W('Khazars'), W('Khazar Khaganate'), { title: 'Golden, Khazar Studies (1980)', url: 'https://en.wikipedia.org/wiki/Khazars#Sources' }],
  edgeGrace: 10,
};

const gokturks = {
  id: 'gokturk-khaganate',
  name: 'Göktürk Khaganate',
  color: '#0891B2',
  type: 'empire',
  description:
    'The First Turkic Khaganate (from 552) united much of the Inner Asian steppe under the Ashina clan; it split into eastern and western halves, fell to Tang influence, and was restored as the Second Turkic Khaganate (682–744) before the Uyghurs took over. Rings follow the Orkhon–Altai pastoral zone of inscriptions and Tang annals — not a surveyed border.',
  nameAt: [
    [552, 'First Turkic Khaganate'],
    [682, 'Second Turkic Khaganate'],
  ],
  keyYears: [552, 580, 630, 682, 720, 744],
  overlays: [
    K(552, 'Bumin’s First Khaganate', [R('east', 'Eastern Turk steppe', GOKTURK_EAST), R('west', 'Western Turk steppe', GOKTURK_WEST)]),
    K(580, 'United Göktürk peak (schematic)', [R('steppe', 'Inner Asian steppe', GOKTURK_PEAK)]),
    K(630, 'Eastern khaganate under Tang pressure', [R('east', 'Eastern Turk steppe', GOKTURK_EAST)]),
    K(682, 'Second Turkic Khaganate restored', [R('east', 'Orkhon / eastern steppe', GOKTURK_EAST)]),
    K(720, 'Bilge Khagan era', [R('east', 'Orkhon / eastern steppe', GOKTURK_EAST)]),
    K(744, 'Fall to the Uyghurs', [R('east', 'Eastern remnant', GOKTURK_EAST)]),
  ],
  timelineItemIds: ['gokturk-khaganate'],
  confidence: CONF.steppe,
  sources: [W('Göktürks'), W('First Turkic Khaganate'), W('Second Turkic Khaganate')],
  edgeGrace: 6,
};

const uyghurs = {
  id: 'uyghur-khaganate',
  name: 'Uyghur Khaganate',
  color: '#DB2777',
  type: 'empire',
  description:
    'In 744 the Uyghurs overthrew the Second Turkic Khaganate and ruled from Ordu-Baliq in Mongolia. They were close Tang allies (helping against An Lushan) and later patrons of Manichaeism. Kyrgyz attacks destroyed the khaganate in 840; Uyghur groups then moved into the Tarim Basin. Drawn as the Mongolian core plus a later Tarim foothold.',
  keyYears: [744, 780, 820, 840],
  overlays: [
    K(744, 'Uyghurs take the eastern steppe', [R('orkhon', 'Orkhon / Mongolian steppe', UYGHUR_CORE)]),
    K(780, 'Uyghur Khaganate at its height', [R('orkhon', 'Orkhon / Mongolian steppe', UYGHUR_CORE)]),
    K(820, 'Late khaganate', [R('orkhon', 'Orkhon / Mongolian steppe', UYGHUR_CORE)]),
    K(840, 'Fall; groups move toward the Tarim', [
      R('orkhon', 'Orkhon remnant', UYGHUR_CORE),
      R('tarim', 'Tarim foothold (emerging)', UYGHUR_TARIM),
    ]),
  ],
  timelineItemIds: ['uyghur-khaganate'],
  confidence: CONF.steppe,
  sources: [W('Uyghur Khaganate'), W('Qocho')],
  edgeGrace: 6,
};

const tibetan = {
  id: 'tibetan-empire',
  name: 'Tibetan Empire',
  color: '#B45309',
  type: 'empire',
  description:
    'From Songtsen Gampo (c. 618) Tibet became a great power that fought and treated with Tang China, held the Hexi Corridor at times, and reached into the Pamirs. The empire fragmented after Langdarma’s assassination (842). Drawn beside Tang — not over China proper — from Tibetan and Chinese records.',
  keyYears: [630, 670, 750, 790, 840],
  overlays: [
    K(630, 'Songtsen Gampo’s realm', [R('tibet', 'Tibetan Plateau core', TIBET_CORE)]),
    K(670, 'Expansion under Mangsong / Tridu Songtsen', [
      R('tibet', 'Tibetan Plateau', TIBET_PEAK),
    ]),
    K(750, 'Peak under Trisong Detsen', [
      R('tibet', 'Tibetan Plateau', TIBET_PEAK),
      R('gansu', 'Hexi / Gansu corridor (contested with Tang)', TIBET_GANSU),
    ]),
    K(790, 'After the capture of Chang’an (763) era influence', [
      R('tibet', 'Tibetan Plateau', TIBET_PEAK),
      R('gansu', 'Hexi corridor fringe', TIBET_GANSU),
    ]),
    K(840, 'Last years before fragmentation', [R('tibet', 'Tibetan Plateau', TIBET_CORE)]),
  ],
  timelineItemIds: ['tibetan-empire'],
  confidence: CONF.tibet,
  sources: [W('Tibetan Empire'), W('Songtsen Gampo'), W('Trisong Detsen')],
  edgeGrace: 8,
};

const nanzhao = {
  id: 'nanzhao',
  name: 'Nanzhao',
  color: '#65A30D',
  type: 'empire',
  description:
    'A Yi–Bai kingdom in Yunnan that unified the Erhai region under Piluoge (738) with Tang backing, then fought Tang and expanded into Myanmar and northern Vietnam at times. Succeeded by Dali in the 10th century. Drawn south of Tang China proper so the two sit side by side.',
  keyYears: [738, 780, 830, 880],
  overlays: [
    K(738, 'Piluoge unifies the Six Zhaos', [R('yunnan', 'Erhai / Yunnan', NANZHAO)]),
    K(780, 'Nanzhao expanding', [R('yunnan', 'Yunnan', NANZHAO_WIDE)]),
    K(830, 'Height under Quanfengyou / Shilong', [R('yunnan', 'Yunnan', NANZHAO_WIDE)]),
    K(880, 'Late Nanzhao', [R('yunnan', 'Yunnan', NANZHAO)]),
  ],
  timelineItemIds: ['nanzhao'],
  confidence: CONF.eastasia,
  sources: [W('Nanzhao'), W('Dali Kingdom')],
  edgeGrace: 10,
};

const silla = {
  id: 'silla',
  name: 'Silla',
  color: '#E11D48',
  type: 'empire',
  description:
    'One of Korea’s Three Kingdoms; with Tang help Silla conquered Baekje (660) and Goguryeo (668) and then pushed Tang out of the peninsula, ruling Unified Silla from Gyeongju. By the early 10th century it gave way to Goryeo. Drawn as the south-east core, then the peninsula after unification — east of Tang, not over China.',
  nameAt: [
    [500, 'Silla'],
    [668, 'Unified Silla'],
  ],
  keyYears: [600, 668, 750, 850, 900],
  overlays: [
    K(600, 'Silla in the south-east', [R('silla', 'Silla (Gyeongju core)', SILLA_CORE)]),
    K(668, 'Unified Silla after conquering Baekje and Goguryeo', [R('silla', 'Unified Silla', SILLA_UNIFIED)]),
    K(750, 'Unified Silla at its height', [R('silla', 'Unified Silla', SILLA_UNIFIED)]),
    K(850, 'Late Unified Silla', [R('silla', 'Unified Silla', SILLA_UNIFIED)]),
    K(900, 'Silla weakening before Goryeo', [R('silla', 'Silla', SILLA_CORE)]),
  ],
  timelineItemIds: ['silla'],
  confidence: CONF.eastasia,
  sources: [W('Silla'), W('Unified Silla')],
  edgeGrace: 10,
};

const srivijaya = {
  id: 'srivijaya',
  name: 'Srivijaya',
  color: '#4338CA',
  type: 'empire',
  description:
    'A Buddhist thalassocracy based at Palembang (Sumatra) that from the 7th century controlled the Strait of Malacca and projected power to the Malay Peninsula and, at times, western Java. Chinese pilgrims (Yijing) and the Kedukan Bukit inscription record its rise; Chola raids in the 11th century weakened it. Drawn as island and peninsula footholds — never one ocean-filling blob.',
  keyYears: [683, 750, 850, 1000, 1200],
  overlays: [
    K(683, 'Early Srivijaya (Palembang)', [R('sumatra-south', 'South Sumatra (Palembang)', SUMATRA_S)]),
    K(750, 'Sumatra and the strait', [
      R('sumatra-south', 'South Sumatra', SUMATRA_S),
      R('sumatra-mid', 'Central Sumatra coast', SUMATRA_MID),
      R('malay', 'Malay Peninsula fringe', MALAY_PEN),
    ]),
    K(850, 'Srivijaya thalassocracy', [
      R('sumatra-south', 'South Sumatra', SUMATRA_S),
      R('sumatra-mid', 'Central Sumatra coast', SUMATRA_MID),
      R('malay', 'Malay Peninsula', MALAY_PEN),
      R('kedah', 'Kedah / north Malay', KEDAH),
      R('java-west', 'West Java fringe', JAVA_W),
    ]),
    K(1000, 'Peak before Chola pressure', [
      R('sumatra-south', 'South Sumatra', SUMATRA_S),
      R('sumatra-mid', 'Central Sumatra coast', SUMATRA_MID),
      R('malay', 'Malay Peninsula', MALAY_PEN),
      R('kedah', 'Kedah', KEDAH),
      R('java-west', 'West Java fringe', JAVA_W),
    ]),
    K(1200, 'Late contraction', [R('sumatra-south', 'South Sumatra remnant', SUMATRA_S)]),
  ],
  timelineItemIds: ['srivijaya'],
  confidence: CONF.maritime,
  sources: [W('Srivijaya'), W('Kedukan Bukit inscription'), W('Chola invasion of Srivijaya')],
  edgeGrace: 15,
};

/** Polities in drawing order. frankish-empire and srivijaya replace older schematic shapes. */
export const earlyMedievalPolities = [
  frankish,
  visigoths,
  angloSaxons,
  avars,
  khazars,
  gokturks,
  uyghurs,
  tibetan,
  nanzhao,
  silla,
  srivijaya,
];

/**
 * Extra keyframes for neighbours that already exist on the globe: keep Tang / Umayyad /
 * Abbasid / Byzantine shapes, but add a clearer Al-Andalus foothold after the Visigothic fall
 * and a mid-Tang frame so Tibetan / Nanzhao / Silla sit beside (not under) China.
 */
export const extraKeyframes = {
  'umayyad-caliphate': [
    K(715, 'Al-Andalus after the Visigothic collapse', [
      R('iberia', 'Al-Andalus / Iberia', [
        [-9.5, 36.5], [-9.0, 42.5], [-6.0, 43.2], [-2.0, 42.8], [0.5, 41.5],
        [2.0, 40.0], [1.0, 37.5], [-2.0, 36.2], [-5.5, 35.8], [-9.5, 36.5],
      ]),
      R('maghreb-east', 'Maghreb', [
        [-5.0, 32.0], [-2.0, 36.0], [8.0, 37.0], [12.0, 35.0], [10.0, 31.0], [2.0, 30.5], [-5.0, 32.0],
      ]),
      R('egypt', 'Egypt', [
        [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
      ]),
      R('levant', 'Levant / Syria', [
        [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
      ]),
    ]),
  ],
  'tang-china': [
    K(700, 'Tang beside Tibetan / Nanzhao neighbours', [
      R('china-proper', 'China proper', [
        [103, 23], [105, 34], [112, 40], [120, 40], [121, 30], [118, 24], [110, 22], [103, 23],
      ]),
      R('tarim', 'Western Regions fringe', [
        [75, 37], [80, 42], [92, 43], [95, 40], [92, 36], [82, 36], [75, 37],
      ]),
    ]),
  ],
};
