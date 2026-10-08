/**
 * Day 35 — peoples persist to the present (review feedback B).
 *
 * Arthur: peoples vanished once big empires took over, "when in fact there's more people than ever".
 * These keyframes carry each ethnolinguistic group forward to today where it genuinely continues
 * (Slavs, Bantu, Arabs, Sinitic, Turkic, Indo-Aryan, Dravidian, Maya, Quechua/Aymara, Inuit, …),
 * and shrink/shift footprints where history did (Celtic languages to the Atlantic fringe, Khoisan to
 * the Kalahari / Namaqualand, Amazigh to the Atlas, Kabylie and Tuareg Sahara, Aral Sea gone by 2025).
 * Scythians are deliberately NOT extended — they ceased as a distinct people in late antiquity.
 *
 * Still schematic / honest: hand-drawn rings, not GIS; overseas diasporas (e.g. English-, Spanish-
 * or Chinese-speaking communities abroad) are not drawn. Distant footholds stay separate region ids.
 */

const S = 'schematic';

/** Reuse a ring under the same id so the morph holds steady across keyframes. */
const R = (id, name, ring, holes) => (holes ? { id, name, ring, holes } : { id, name, ring });

// --- shared rings (unchanged from the last authored keyframe unless noted) ---
const BANTU_WEST = [[8, -10], [10, 6], [22, 6], [24, -6], [16, -12], [8, -10]];
const BANTU_EAST = [[28, -14], [30, 2], [40, 2], [42, -8], [36, -16], [28, -14]];
const BANTU_SOUTH = [[16, -34], [18, -18], [34, -16], [34, -28], [28, -34], [18, -35], [16, -34]];
const BANTU_CENTRAL = [[12, -18], [14, -10], [24, -6], [30, -8], [30, -16], [22, -18], [12, -18]];

const POLY = [
  R('poly-samoa-tonga', 'Samoa / Tonga', [[-176, -22], [-175, -13], [-168, -13], [-168, -20], [-172, -22], [-176, -22]]),
  R('poly-society', 'Society Islands', [[-152, -18], [-151, -15], [-148, -15], [-148, -18], [-150, -19], [-152, -18]]),
  R('poly-hawaii', 'Hawaiian Islands', [[-160.5, 18.5], [-160, 22.5], [-154.5, 22.5], [-154.5, 18.8], [-157, 18], [-160.5, 18.5]]),
  R('poly-aotearoa', 'Aotearoa (Māori)', [[166, -46], [168, -35], [178, -34], [178, -42], [174, -47], [168, -47], [166, -46]]),
  R('poly-rapa-nui', 'Rapa Nui', [[-110.2, -27.5], [-109.8, -26.8], [-109.2, -26.8], [-109, -27.3], [-109.5, -27.6], [-110.2, -27.5]]),
];

const AUS = [
  R('aus-north', 'Northern Australia', [[125, -20], [128, -12], [142, -11], [144, -16], [138, -20], [128, -21], [125, -20]]),
  R('aus-east', 'Eastern Australia', [[140, -38], [142, -20], [152, -18], [154, -30], [150, -38], [144, -39], [140, -38]]),
  R('aus-west', 'Western Australia', [[114, -34], [116, -22], [126, -20], [128, -28], [122, -35], [116, -35], [114, -34]]),
  R('aus-south', 'Southern Australia', [[132, -36], [134, -30], [142, -30], [142, -36], [138, -38], [132, -36]]),
  R('aus-central', 'Central deserts', [[124, -28], [126, -21], [138, -21], [140, -27], [132, -30], [124, -28]]),
];

const INUIT = [
  R('inuit-alaska', 'Alaska (Iñupiat / Yupik)', [[-170, 62], [-168, 72], [-146, 72], [-144, 64], [-156, 60], [-170, 62]]),
  R('inuit-canada', 'Canadian Arctic / Nunavut', [[-120, 66], [-118, 76], [-80, 76], [-78, 68], [-95, 64], [-120, 66]]),
  R('inuit-greenland', 'Greenland (Kalaallit)', [[-54, 60], [-52, 74], [-38, 74], [-36, 62], [-46, 58], [-54, 60]]),
];

const MAYA = [
  R('maya-yucatan', 'Yucatán (Yucatec Maya)', [[-91, 18], [-90, 21.5], [-87, 21.5], [-87, 18.5], [-89.5, 17.5], [-91, 18]]),
  R('maya-highlands', 'Highland Maya (Chiapas / Guatemala)', [[-93.5, 14.5], [-92.8, 17.2], [-89, 16.5], [-89, 14.5], [-91, 13.8], [-93.5, 14.5]]),
];

const NILOTIC = [
  R('nilotic-upper-nile', 'Upper Nile (Dinka, Nuer, Shilluk)', [[26, 2], [28, 14], [36, 14], [38, 6], [32, 0], [26, 2]]),
  R('nilotic-rift', 'East African Rift (Luo, Kalenjin, Maasai)', [[33, -8], [34, 4], [39, 4], [40, -4], [36, -10], [33, -8]]),
];

const TURKIC_CENTRAL = [[48, 36], [50, 48], [78, 48], [80, 40], [68, 34], [52, 34], [48, 36]];
const TURKIC_VOLGA = [[40, 46], [42, 54], [55, 54], [56, 48], [50, 45], [42, 45], [40, 46]];
const TURKIC_ANATOLIA = [[26, 36], [26, 42], [44, 42], [45, 38], [40, 36], [36, 36], [28, 36], [26, 36]];
const TURKIC_AZERI = [[44, 38.5], [45, 41.5], [50, 41.8], [50, 38.5], [47, 38], [44, 38.5]];
const TURKIC_UYGHUR = [[74, 36], [76, 44], [88, 46], [92, 42], [88, 37], [78, 35.5], [74, 36]];
const TURKIC_SAKHA = [[108, 58], [110, 68], [135, 70], [140, 64], [130, 58], [108, 58]];

const SINITIC_CORE = [[104, 30], [106, 42], [122, 42], [124, 34], [118, 28], [104, 30]];
const SINITIC_SOUTH = [[105, 20], [108, 32], [122, 32], [122, 22], [116, 18], [105, 20]];
const SINITIC_SW = [[98, 22], [99, 30], [105, 32], [106, 26], [103, 22], [98, 22]];
const SINITIC_TAIWAN = [[120, 22], [120.1, 25.2], [121.9, 25.3], [121.6, 23], [120.8, 21.9], [120, 22]];
const SINITIC_MANCHURIA = [[120, 40], [122, 48], [128, 50], [132, 46], [129, 42], [124, 40], [120, 40]];
const SINITIC_NW = [[94, 36], [97, 41], [104, 42], [106, 36], [100, 34], [94, 36]];

const ARAB_PENINSULA = [[34, 14], [36, 30], [50, 30], [58, 24], [56, 12], [42, 12], [34, 14]];
const ARAB_LEVANT = [[34, 30], [36, 38], [48, 36], [48, 30], [42, 28], [34, 30]];
const ARAB_EGYPT = [[28, 22], [30, 32], [34, 32], [34, 24], [32, 22], [28, 22]];
const ARAB_MAGHREB = [[-12, 28], [-10, 36], [10, 36], [12, 32], [4, 26], [-8, 26], [-12, 28]];
const ARAB_SUDAN = [[22, 12], [24, 22], [37, 22], [38, 16], [34, 12], [26, 11], [22, 12]];
const ARAB_LIBYA = [[10, 30], [12, 33], [25, 32.5], [25, 29], [18, 28], [10, 30]];

const INDO_GANGETIC = [[66, 23], [70, 36], [80, 34], [88, 28], [92, 25], [89, 21], [78, 20], [68, 22], [66, 23]];
const INDO_DECCAN = [[73, 15], [75, 24], [84, 24], [86, 18], [82, 14], [74, 14], [73, 15]];
const INDO_LANKA = [[79.7, 6], [79.9, 7.8], [81.2, 8.2], [81.9, 7], [81.2, 6], [80.2, 5.9], [79.7, 6]];

const DRAV_CORE = [[74, 8], [75, 20], [83, 20], [83, 11], [80, 8], [74, 8]];
const DRAV_DECCAN = [[74, 15], [76, 23], [81, 23], [82, 18], [78, 14], [74, 15]];
const DRAV_JAFFNA = [[79.8, 8.5], [79.9, 9.9], [80.6, 9.9], [81.3, 8.5], [80.5, 8.2], [79.8, 8.5]];

const ANDEAN_CENTRAL_LATE = [[-78.5, -14], [-78, -2], [-76, -2], [-70, -12], [-65, -17], [-66, -21], [-70, -21], [-74, -16], [-78.5, -14]];

/**
 * Extra keyframes per people entity (appended after the Day 27–28 keyframes, years ascending).
 * @type {Record<string, { year: number, label: string, approximation: string, regions: object[] }[]>}
 */
export const PEOPLE_PERSISTENCE_KEYFRAMES = {
  celts: [
    {
      year: 1000,
      label: 'Medieval Gaelic & Brythonic fringe',
      approximation: S,
      regions: [
        R('celt-isles', 'Ireland / Wales', [[-10.5, 51.5], [-10, 55.5], [-6, 55.5], [-5, 52], [-6.5, 51], [-10, 51], [-10.5, 51.5]]),
        R('celt-scotland', 'Gaelic Scotland', [[-7.5, 55.5], [-7, 58.6], [-3, 58.7], [-3.5, 56.5], [-5.5, 55.3], [-7.5, 55.5]]),
        R('celt-brittany', 'Brittany', [[-5.2, 47.2], [-4.8, 48.8], [-2.2, 48.8], [-1.8, 47.5], [-3.5, 47], [-5.2, 47.2]]),
      ],
    },
    {
      year: 1700,
      label: 'Early modern Celtic-speaking fringe',
      approximation: S,
      regions: [
        R('celt-isles', 'Ireland / Wales', [[-10.5, 51.5], [-10, 55.5], [-6, 55.5], [-5, 52], [-6.5, 51], [-10, 51], [-10.5, 51.5]]),
        R('celt-scotland', 'Highlands & Islands', [[-7.6, 56], [-7, 58.6], [-3.2, 58.7], [-4, 56.6], [-5.6, 55.8], [-7.6, 56]]),
        R('celt-brittany', 'Lower Brittany', [[-5.2, 47.4], [-4.8, 48.8], [-2.8, 48.8], [-2.8, 47.6], [-3.8, 47.3], [-5.2, 47.4]]),
      ],
    },
    {
      year: 1900,
      label: 'Celtic languages retreat west (approx.)',
      approximation: S,
      regions: [
        R('celt-isles', 'Western Ireland (Gaeltacht)', [[-10.5, 51.5], [-10.3, 55.3], [-7.8, 55.3], [-8.6, 53], [-9, 51.6], [-10.5, 51.5]]),
        R('celt-wales', 'Wales (Cymraeg)', [[-5.3, 51.6], [-4.7, 53.4], [-3.1, 53.3], [-3, 51.8], [-4.2, 51.5], [-5.3, 51.6]]),
        R('celt-scotland', 'Hebrides / NW Highlands', [[-7.6, 56.4], [-7, 58.5], [-5, 58.6], [-5.2, 57], [-6.2, 56.4], [-7.6, 56.4]]),
        R('celt-brittany', 'Lower Brittany', [[-5.2, 47.6], [-4.8, 48.8], [-3, 48.8], [-3.1, 47.8], [-4, 47.6], [-5.2, 47.6]]),
      ],
    },
    {
      year: 2025,
      label: 'Celtic-language communities today (minority languages)',
      approximation: S,
      regions: [
        R('celt-isles', 'Gaeltacht (western Ireland)', [[-10.4, 51.7], [-10.2, 55.2], [-8, 55.2], [-8.9, 53.1], [-9.3, 51.8], [-10.4, 51.7]]),
        R('celt-wales', 'Wales (Cymraeg)', [[-5.3, 51.6], [-4.7, 53.4], [-3.1, 53.3], [-3, 51.8], [-4.2, 51.5], [-5.3, 51.6]]),
        R('celt-scotland', 'Outer Hebrides / Skye', [[-7.6, 56.8], [-7, 58.5], [-5.8, 58.5], [-5.8, 57], [-6.5, 56.7], [-7.6, 56.8]]),
        R('celt-brittany', 'Western Brittany', [[-5.2, 47.8], [-4.8, 48.8], [-3.3, 48.8], [-3.4, 47.9], [-4.2, 47.7], [-5.2, 47.8]]),
      ],
    },
  ],

  'germanic-peoples': [
    {
      year: 1000,
      label: 'Medieval Germanic-speaking Europe',
      approximation: S,
      regions: [
        R('germanic-core', 'German / Dutch lands', [[2, 46], [3, 55], [14, 55], [16, 47], [10, 45.5], [5, 45.5], [2, 46]]),
        R('germanic-scandi', 'Scandinavia (Norse)', [[5, 55], [6, 63], [14, 67], [22, 64], [18, 57], [12, 55], [5, 55]]),
        R('germanic-britain', 'English-speaking Britain', [[-5.5, 50], [-3.5, 55.8], [0, 56], [1.8, 52.5], [1, 51], [-5.5, 50]]),
      ],
    },
    {
      year: 1500,
      label: 'Late medieval (eastward settlement)',
      approximation: S,
      regions: [
        R('germanic-core', 'German / Dutch lands', [[2, 46], [3, 55], [20, 55], [18, 49], [16, 46.5], [10, 45.5], [5, 45.5], [2, 46]]),
        R('germanic-scandi', 'Scandinavia', [[5, 55], [6, 63], [14, 69], [24, 66], [20, 58], [12, 55], [5, 55]]),
        R('germanic-britain', 'English-speaking Britain', [[-5.5, 50], [-3.5, 56], [-2, 57.5], [1.8, 52.5], [1, 51], [-5.5, 50]]),
      ],
    },
    {
      year: 1900,
      label: 'Germanic-speaking Europe c. 1900',
      approximation: S,
      regions: [
        R('germanic-core', 'German / Dutch lands', [[3, 46], [3.5, 54], [14, 55], [22, 55.5], [20, 53], [18, 50], [17, 48], [13, 46.5], [6, 45.8], [3, 46]]),
        R('germanic-scandi', 'Scandinavia', [[5, 55], [6, 63], [14, 69], [24, 68], [22, 60], [12, 55], [5, 55]]),
        R('germanic-britain', 'English-speaking Britain', [[-5.5, 50], [-4, 58.6], [-1.5, 58.6], [1.8, 52.5], [1, 51], [-5.5, 50]]),
      ],
    },
    {
      year: 2025,
      label: 'Germanic-speaking Europe today (overseas diasporas not drawn)',
      approximation: S,
      regions: [
        R('germanic-core', 'German / Dutch lands', [[3, 46], [3.5, 54], [14, 55], [15, 50.5], [17, 48], [13, 46.5], [6, 45.8], [3, 46]]),
        R('germanic-scandi', 'Scandinavia', [[5, 55], [6, 63], [14, 69], [24, 68], [22, 60], [12, 55], [5, 55]]),
        R('germanic-britain', 'English-speaking Britain', [[-5.5, 50], [-4, 58.6], [-1.5, 58.6], [1.8, 52.5], [1, 51], [-5.5, 50]]),
      ],
    },
  ],

  slavs: [
    {
      year: 1500,
      label: 'Muscovy, Ruthenia, West & South Slavs',
      approximation: S,
      regions: [
        R('slav-core', 'East Slavic', [[23, 47], [26, 60], [45, 60], [48, 52], [40, 46], [28, 45.5], [23, 47]]),
        R('slav-west', 'West Slavic', [[12, 48], [14, 55], [22, 55], [23, 50], [18, 47], [12, 48]]),
        R('slav-south', 'South Slavic', [[14, 41], [15, 46], [24, 46], [26, 42], [22, 40], [16, 40], [14, 41]]),
      ],
    },
    {
      year: 1900,
      label: 'Slavic Europe + Russian settlement of Siberia',
      approximation: S,
      regions: [
        R('slav-core', 'East Slavic', [[22, 45], [26, 62], [50, 64], [56, 56], [50, 46], [40, 44], [30, 45], [22, 45]]),
        R('slav-west', 'West Slavic', [[12, 48], [14, 55], [23, 55], [24, 50], [19, 47.5], [12, 48]]),
        R('slav-south', 'South Slavic', [[13.5, 41], [14, 46.5], [23, 46], [28, 43], [23, 40.5], [16, 40], [13.5, 41]]),
        R('slav-west-siberia', 'Western Siberia settler belt', [[60, 52], [60, 59], [88, 58], [88, 51], [75, 50], [60, 52]]),
        R('slav-east-siberia', 'Southern Siberia / Far East settler belt', [[95, 52], [95, 57], [110, 56], [128, 54], [135, 48], [132, 43], [127, 49], [115, 51], [100, 51], [95, 52]]),
      ],
    },
    {
      year: 2025,
      label: 'Slavic-speaking peoples today',
      approximation: S,
      regions: [
        R('slav-core', 'East Slavic', [[22, 45], [26, 62], [50, 64], [56, 56], [50, 46], [40, 44], [30, 45], [22, 45]]),
        R('slav-west', 'West Slavic', [[12, 48], [14.5, 54.8], [23.5, 54.5], [24, 50], [19, 47.5], [12, 48]]),
        R('slav-south', 'South Slavic', [[13.5, 41], [14, 46.5], [23, 46], [28, 43], [23, 40.5], [16, 40], [13.5, 41]]),
        R('slav-west-siberia', 'Western Siberia', [[60, 52], [60, 60], [88, 59], [88, 51], [75, 50], [60, 52]]),
        R('slav-east-siberia', 'Southern Siberia / Far East', [[95, 52], [95, 57], [110, 56], [128, 54], [135, 48], [132, 43], [127, 49], [115, 51], [100, 51], [95, 52]]),
      ],
    },
  ],

  'bantu-peoples': [
    { year: 1600, label: 'Bantu-speaking Africa (approx.)', approximation: S, regions: [R('bantu-west', 'West-Central Africa', BANTU_WEST), R('bantu-east', 'East Africa', BANTU_EAST, ['lake-victoria']), R('bantu-south', 'Southern Africa', BANTU_SOUTH), R('bantu-central', 'Central plateau', BANTU_CENTRAL)] },
    { year: 1900, label: 'Bantu-speaking Africa c. 1900', approximation: S, regions: [R('bantu-west', 'West-Central Africa', BANTU_WEST), R('bantu-east', 'East Africa', BANTU_EAST, ['lake-victoria']), R('bantu-south', 'Southern Africa', BANTU_SOUTH), R('bantu-central', 'Central plateau', BANTU_CENTRAL)] },
    { year: 2025, label: 'Bantu-speaking peoples today (~350M+)', approximation: S, regions: [R('bantu-west', 'West-Central Africa', BANTU_WEST), R('bantu-east', 'East Africa', BANTU_EAST, ['lake-victoria']), R('bantu-south', 'Southern Africa', BANTU_SOUTH), R('bantu-central', 'Central plateau', BANTU_CENTRAL)] },
  ],

  'turkic-peoples': [
    { year: 1500, label: 'Turkic Eurasia after the Mongols', approximation: S, regions: [R('turkic-central', 'Central Asia', TURKIC_CENTRAL, ['aral-sea']), R('turkic-anatolia', 'Anatolia', TURKIC_ANATOLIA), R('turkic-volga', 'Volga / Crimea Tatars', TURKIC_VOLGA), R('turkic-azeri', 'Azerbaijan', TURKIC_AZERI), R('turkic-uyghur', 'Tarim Basin (Uyghur)', TURKIC_UYGHUR)] },
    { year: 1900, label: 'Turkic peoples c. 1900', approximation: S, regions: [R('turkic-central', 'Central Asia', TURKIC_CENTRAL, ['aral-sea']), R('turkic-anatolia', 'Anatolia', TURKIC_ANATOLIA), R('turkic-volga', 'Volga Tatars / Bashkirs', TURKIC_VOLGA), R('turkic-azeri', 'Azerbaijan', TURKIC_AZERI), R('turkic-uyghur', 'Tarim Basin (Uyghur)', TURKIC_UYGHUR), R('turkic-sakha', 'Sakha (Yakutia)', TURKIC_SAKHA)] },
    // 2025: the Aral Sea has largely dried up, so the hole is dropped.
    { year: 2025, label: 'Turkic-speaking peoples today', approximation: S, regions: [R('turkic-central', 'Central Asia', TURKIC_CENTRAL), R('turkic-anatolia', 'Anatolia', TURKIC_ANATOLIA), R('turkic-volga', 'Volga Tatars / Bashkirs', TURKIC_VOLGA), R('turkic-azeri', 'Azerbaijan', TURKIC_AZERI), R('turkic-uyghur', 'Tarim Basin (Uyghur)', TURKIC_UYGHUR), R('turkic-sakha', 'Sakha (Yakutia)', TURKIC_SAKHA)] },
  ],

  'polynesian-peoples': [
    { year: 1600, label: 'Polynesian triangle', approximation: S, regions: POLY },
    { year: 1900, label: 'Polynesian peoples under colonial rule', approximation: S, regions: POLY },
    { year: 2025, label: 'Polynesian peoples today', approximation: S, regions: POLY },
  ],

  'aboriginal-australian': [
    { year: 1900, label: 'Aboriginal peoples after colonisation (dispossessed, continent-wide)', approximation: S, regions: AUS },
    { year: 2025, label: 'Aboriginal and Torres Strait Islander peoples today', approximation: S, regions: AUS },
  ],

  amazigh: [
    {
      year: 1600,
      label: 'Amazigh after gradual Arabisation',
      approximation: S,
      regions: [
        R('amazigh-maghreb', 'Atlas / Rif / Kabylie', [[-11, 28.5], [-9.5, 33], [-6, 35.6], [2, 36.6], [8, 36.8], [8, 34], [-2, 32], [-7, 29], [-11, 28.5]]),
        R('amazigh-sahara', 'Tuareg Sahara', [[-4, 15], [-2, 24], [8, 27], [12, 23], [12, 16], [5, 14], [-4, 15]]),
      ],
    },
    {
      year: 1900,
      label: 'Amazigh-speaking heartlands',
      approximation: S,
      regions: [
        R('amazigh-maghreb', 'Atlas / Rif (Morocco)', [[-10, 29], [-9.5, 32.5], [-6, 35.5], [-2, 35.2], [-3, 32], [-6, 29.5], [-10, 29]]),
        R('amazigh-kabylie', 'Kabylie / Aurès', [[3, 35.5], [3.2, 36.9], [7, 36.9], [7.2, 35], [5, 34.8], [3, 35.5]]),
        R('amazigh-sahara', 'Tuareg Sahara', [[-2, 15], [0, 22], [6, 25], [12, 23], [12, 16], [6, 14], [-2, 15]]),
      ],
    },
    {
      year: 2025,
      label: 'Amazigh (Berber) peoples today',
      approximation: S,
      regions: [
        R('amazigh-maghreb', 'Atlas / Rif (Morocco)', [[-10, 29], [-9.5, 32.5], [-6, 35.5], [-2, 35.2], [-3, 32], [-6, 29.5], [-10, 29]]),
        R('amazigh-kabylie', 'Kabylie / Aurès', [[3, 35.5], [3.2, 36.9], [7, 36.9], [7.2, 35], [5, 34.8], [3, 35.5]]),
        R('amazigh-sahara', 'Tuareg Sahara', [[-2, 15], [0, 22], [6, 25], [12, 23], [12, 16], [6, 14], [-2, 15]]),
      ],
    },
  ],

  'ancestral-puebloans': [
    {
      year: 1600,
      label: 'Pueblo peoples at Spanish contact',
      approximation: S,
      regions: [
        R('pueblo-rio-grande', 'Rio Grande pueblos', [[-108, 33], [-107, 37], [-104.5, 37], [-104.5, 33.5], [-105.8, 32.8], [-108, 33]]),
        R('pueblo-hopi-zuni', 'Hopi / Zuni / Acoma', [[-111.5, 34.5], [-111.2, 36.6], [-108.6, 36.6], [-107.5, 34.8], [-109.5, 34.2], [-111.5, 34.5]]),
      ],
    },
    {
      year: 1900,
      label: 'Pueblo communities (descendants of the Ancestral Puebloans)',
      approximation: S,
      regions: [
        R('pueblo-rio-grande', 'Rio Grande pueblos', [[-107.5, 34.5], [-107, 36.6], [-105.6, 36.6], [-105.8, 35], [-106.6, 34.4], [-107.5, 34.5]]),
        R('pueblo-hopi-zuni', 'Hopi / Zuni / Acoma', [[-111.3, 35.2], [-111, 36.3], [-109.9, 36.3], [-107.5, 35.2], [-108.5, 34.8], [-111.3, 35.2]]),
      ],
    },
    {
      year: 2025,
      label: 'Pueblo peoples today (19 New Mexico pueblos, Hopi)',
      approximation: S,
      regions: [
        R('pueblo-rio-grande', 'Rio Grande pueblos', [[-107.5, 34.5], [-107, 36.6], [-105.6, 36.6], [-105.8, 35], [-106.6, 34.4], [-107.5, 34.5]]),
        R('pueblo-hopi-zuni', 'Hopi / Zuni / Acoma', [[-111.3, 35.2], [-111, 36.3], [-109.9, 36.3], [-107.5, 35.2], [-108.5, 34.8], [-111.3, 35.2]]),
      ],
    },
  ],

  'indo-aryan': [
    { year: 1500, label: 'Indo-Aryan South Asia', approximation: S, regions: [R('indo-aryan-gangetic', 'North India / Indus / Bengal', INDO_GANGETIC), R('indo-aryan-deccan-fringe', 'Marathi / Odia fringe', INDO_DECCAN), R('indo-aryan-lanka', 'Sinhala Lanka', INDO_LANKA)] },
    { year: 1900, label: 'Indo-Aryan South Asia c. 1900', approximation: S, regions: [R('indo-aryan-gangetic', 'North India / Indus / Bengal', INDO_GANGETIC), R('indo-aryan-deccan-fringe', 'Marathi / Odia fringe', INDO_DECCAN), R('indo-aryan-lanka', 'Sinhala Lanka', INDO_LANKA)] },
    { year: 2025, label: 'Indo-Aryan-speaking peoples today (~1B+)', approximation: S, regions: [R('indo-aryan-gangetic', 'North India / Pakistan / Bangladesh / Nepal', INDO_GANGETIC), R('indo-aryan-deccan-fringe', 'Marathi / Odia fringe', INDO_DECCAN), R('indo-aryan-lanka', 'Sinhala Sri Lanka', INDO_LANKA)] },
  ],

  'dravidian-peoples': [
    { year: 1700, label: 'Dravidian South India', approximation: S, regions: [R('dravidian-core', 'South India', DRAV_CORE), R('dravidian-deccan', 'Telugu / Kannada Deccan', DRAV_DECCAN), R('dravidian-jaffna', 'Tamil north Lanka', DRAV_JAFFNA)] },
    { year: 1900, label: 'Dravidian South India c. 1900', approximation: S, regions: [R('dravidian-core', 'South India', DRAV_CORE), R('dravidian-deccan', 'Telugu / Kannada Deccan', DRAV_DECCAN), R('dravidian-jaffna', 'Tamil north Lanka', DRAV_JAFFNA)] },
    { year: 2025, label: 'Dravidian-speaking peoples today (~250M)', approximation: S, regions: [R('dravidian-core', 'Tamil / Malayalam south', DRAV_CORE), R('dravidian-deccan', 'Telugu / Kannada Deccan', DRAV_DECCAN), R('dravidian-jaffna', 'Tamil north Sri Lanka', DRAV_JAFFNA)] },
  ],

  'arab-peoples': [
    { year: 1700, label: 'Arabic-speaking world', approximation: S, regions: [R('arab-peninsula', 'Arabian peninsula', ARAB_PENINSULA), R('arab-levant-mesopotamia', 'Levant / Mesopotamia', ARAB_LEVANT), R('arab-egypt', 'Egypt', ARAB_EGYPT), R('arab-maghreb', 'Maghreb', ARAB_MAGHREB), R('arab-libya', 'Libya', ARAB_LIBYA), R('arab-sudan', 'Northern / central Sudan', ARAB_SUDAN)] },
    { year: 1900, label: 'Arabic-speaking world c. 1900', approximation: S, regions: [R('arab-peninsula', 'Arabian peninsula', ARAB_PENINSULA), R('arab-levant-mesopotamia', 'Levant / Mesopotamia', ARAB_LEVANT), R('arab-egypt', 'Egypt', ARAB_EGYPT), R('arab-maghreb', 'Maghreb', ARAB_MAGHREB), R('arab-libya', 'Libya', ARAB_LIBYA), R('arab-sudan', 'Northern / central Sudan', ARAB_SUDAN)] },
    { year: 2025, label: 'Arab peoples today (~400M+)', approximation: S, regions: [R('arab-peninsula', 'Arabian peninsula', ARAB_PENINSULA), R('arab-levant-mesopotamia', 'Levant / Mesopotamia', ARAB_LEVANT), R('arab-egypt', 'Egypt', ARAB_EGYPT), R('arab-maghreb', 'Maghreb', ARAB_MAGHREB), R('arab-libya', 'Libya', ARAB_LIBYA), R('arab-sudan', 'Northern / central Sudan', ARAB_SUDAN)] },
  ],

  'sinitic-peoples': [
    { year: 1700, label: 'Han Chinese under the Qing', approximation: S, regions: [R('sinitic-core', 'China proper north', SINITIC_CORE), R('sinitic-south', 'China proper south', SINITIC_SOUTH), R('sinitic-southwest', 'Sichuan / Yunnan', SINITIC_SW), R('sinitic-taiwan', 'Taiwan (Han settlement)', SINITIC_TAIWAN)] },
    { year: 1900, label: 'Han migration into Manchuria', approximation: S, regions: [R('sinitic-core', 'China proper north', SINITIC_CORE), R('sinitic-south', 'China proper south', SINITIC_SOUTH), R('sinitic-southwest', 'Sichuan / Yunnan', SINITIC_SW), R('sinitic-taiwan', 'Taiwan', SINITIC_TAIWAN), R('sinitic-manchuria', 'Manchuria (Chuang Guandong)', SINITIC_MANCHURIA)] },
    { year: 2025, label: 'Sinitic-speaking peoples today (~1.3B; diaspora not drawn)', approximation: S, regions: [R('sinitic-core', 'China proper north', SINITIC_CORE), R('sinitic-south', 'China proper south', SINITIC_SOUTH), R('sinitic-southwest', 'Sichuan / Yunnan', SINITIC_SW), R('sinitic-taiwan', 'Taiwan', SINITIC_TAIWAN), R('sinitic-manchuria', 'Northeast China', SINITIC_MANCHURIA), R('sinitic-northwest', 'Gansu corridor / northwest', SINITIC_NW)] },
  ],

  'finno-ugric': [
    { year: 1700, label: 'Finno-Ugric (Uralic) peoples', approximation: S, regions: [R('finno-ugric-baltic', 'Finland / Estonia', [[20, 58], [22, 68], [34, 68], [34, 60], [28, 56], [20, 58]]), R('finno-ugric-hungary', 'Hungary', [[16, 45], [17, 49], [23, 49], [24, 46], [20, 44], [16, 45]]), R('finno-ugric-ural', 'Volga–Ural (Mari, Udmurt, Komi)', [[46, 55], [50, 64], [60, 64], [60, 57], [54, 54], [46, 55]]), R('finno-ugric-sami', 'Sápmi', [[14, 65.5], [18, 70.5], [30, 70.5], [30, 68], [22, 66.5], [14, 65.5]])] },
    { year: 1900, label: 'Uralic peoples c. 1900', approximation: S, regions: [R('finno-ugric-baltic', 'Finland / Estonia', [[21, 58], [22, 66], [31, 70], [32, 62], [28, 57.5], [21, 58]]), R('finno-ugric-hungary', 'Hungary', [[16, 45], [17, 49], [23, 49], [24, 46], [20, 44], [16, 45]]), R('finno-ugric-ural', 'Volga–Ural (Mari, Udmurt, Komi)', [[46, 55], [50, 64], [60, 64], [60, 57], [54, 54], [46, 55]]), R('finno-ugric-sami', 'Sápmi', [[14, 65.5], [18, 70.5], [30, 70.5], [30, 68], [22, 66.5], [14, 65.5]])] },
    { year: 2025, label: 'Uralic peoples today (Finns, Estonians, Hungarians, Sámi, Volga–Ural)', approximation: S, regions: [R('finno-ugric-baltic', 'Finland / Estonia', [[21, 58], [22, 66], [31, 70], [32, 62], [28, 57.5], [21, 58]]), R('finno-ugric-hungary', 'Hungary', [[16, 45.7], [17, 48.6], [22.8, 48.5], [22.5, 46], [19.5, 45.8], [16, 45.7]]), R('finno-ugric-ural', 'Volga–Ural pockets', [[48, 55.5], [51, 62], [58, 62], [58, 57], [54, 55], [48, 55.5]]), R('finno-ugric-sami', 'Sápmi', [[14, 65.5], [18, 70.5], [30, 70.5], [30, 68], [22, 66.5], [14, 65.5]])] },
  ],

  'khoisan-peoples': [
    { year: 1800, label: 'Khoisan after Cape colonisation', approximation: S, regions: [R('khoisan-kalahari', 'Kalahari', [[18, -28], [20, -18], [27, -18], [27, -27], [24, -29], [18, -28]]), R('khoisan-cape', 'Northern Cape / Karoo remnant', [[17, -32], [18, -29], [23, -29], [23, -32], [20, -33], [17, -32]]), R('khoisan-nama', 'Namaqualand (Nama)', [[15, -28.5], [15.5, -23], [19, -23], [19.5, -28], [17, -29], [15, -28.5]])] },
    { year: 1900, label: 'San and Nama c. 1900', approximation: S, regions: [R('khoisan-kalahari', 'Kalahari (San)', [[19, -26], [20, -19], [25, -18.5], [25, -24], [22, -26.5], [19, -26]]), R('khoisan-nama', 'Namaqualand (Nama)', [[15, -28.5], [15.5, -23], [19, -23], [19.5, -28], [17, -29], [15, -28.5]])] },
    { year: 2025, label: 'San and Khoekhoe communities today', approximation: S, regions: [R('khoisan-kalahari', 'Kalahari (San)', [[19, -26], [20, -19], [25, -18.5], [25, -24], [22, -26.5], [19, -26]]), R('khoisan-nama', 'Namaqualand (Nama)', [[15, -28.5], [15.5, -23], [19, -23], [19.5, -28], [17, -29], [15, -28.5]])] },
  ],

  'inuit-peoples': [
    { year: 1900, label: 'Inuit c. 1900', approximation: S, regions: INUIT },
    { year: 2025, label: 'Inuit today (Alaska, Nunavut, Nunavik, Greenland)', approximation: S, regions: INUIT },
  ],

  'maya-peoples': [
    { year: 1700, label: 'Maya under Spanish rule', approximation: S, regions: MAYA },
    { year: 1900, label: 'Maya c. 1900', approximation: S, regions: MAYA },
    { year: 2025, label: 'Maya peoples today (~6M+ speakers)', approximation: S, regions: MAYA },
  ],

  'andean-peoples': [
    {
      year: 1700,
      label: 'Quechua / Aymara under Spanish rule',
      approximation: S,
      regions: [
        R('andean-central', 'Central / southern Andes', [[-79, -22], [-78, -2], [-64, -2], [-64, -20], [-70, -24], [-79, -22]]),
        R('andean-coast', 'Coastal fringe (Hispanicising)', [[-81, -16], [-80.5, -4], [-79, -4], [-78, -14], [-79.5, -17], [-81, -16]]),
      ],
    },
    { year: 1900, label: 'Quechua / Aymara highlands', approximation: S, regions: [R('andean-central', 'Highland Quechua / Aymara', ANDEAN_CENTRAL_LATE)] },
    { year: 2025, label: 'Quechua and Aymara peoples today (~10M speakers)', approximation: S, regions: [R('andean-central', 'Highland Quechua / Aymara', ANDEAN_CENTRAL_LATE)] },
  ],

  'nilotic-peoples': [
    { year: 1700, label: 'Nilotic peoples', approximation: S, regions: NILOTIC },
    { year: 1900, label: 'Nilotic peoples c. 1900', approximation: S, regions: NILOTIC },
    { year: 2025, label: 'Nilotic peoples today', approximation: S, regions: NILOTIC },
  ],
};

/** Peoples that genuinely ceased as distinct groups — not extended (kept for validation). */
export const PEOPLES_THAT_CEASED = ['scythians'];

/** Short honesty notes appended to descriptions so the detail panel explains the persistence. */
const PERSISTENCE_NOTES = {
  'ancestral-puebloans':
    "Their descendants are today's Pueblo peoples (Hopi, Zuni, Acoma and the Rio Grande pueblos), so the footprint continues to the present.",
  celts: 'Celtic languages survive today as minority languages on the Atlantic fringe (Irish, Scottish Gaelic, Welsh, Breton).',
  'khoisan-peoples': 'Much reduced by colonisation; San and Khoekhoe (e.g. Nama) communities continue today.',
  scythians: 'Ceased as a distinct people by late antiquity, so this footprint ends there.',
};
const DEFAULT_NOTE = 'Still present today — later keyframes carry the footprint to 2025.';

/**
 * Append persistence keyframes (sorted, no duplicate years) and extend keyYears.
 * @param {object[]} entities
 */
export function applyPeoplePersistence(entities) {
  for (const entity of entities) {
    const extra = PEOPLE_PERSISTENCE_KEYFRAMES[entity.id];
    const note = PERSISTENCE_NOTES[entity.id] || (extra ? DEFAULT_NOTE : '');
    if (note && !entity.description.includes(note)) entity.description = `${entity.description} ${note}`;
    if (!extra) continue;
    const last = Math.max(...entity.overlays.map((o) => o.year));
    for (const kf of extra) {
      if (kf.year > last) entity.overlays.push(kf);
    }
    entity.overlays.sort((a, b) => a.year - b.year);
    const ky = new Set([...(entity.keyYears || []), ...extra.map((k) => k.year)]);
    entity.keyYears = [...ky].sort((a, b) => a - b);
  }
  return entities;
}
