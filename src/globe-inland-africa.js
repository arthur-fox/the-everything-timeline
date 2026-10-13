/**
 * Day 58 — inland Africa on the globe (Phase 4c step 6.2), about 100–1815 CE.
 *
 * Before this the globe had seven thin schematic African blobs (Ghana, Mali, Songhai, Axum,
 * Ethiopia, Great Zimbabwe, Kongo) and nothing for Kanem–Bornu, the Hausa states, Benin, Oyo,
 * Asante, the Sokoto Caliphate, Mutapa, Luba, Lunda, the Zagwe kingdom, the Swahili city-states
 * or Buganda. This module redraws the first seven and adds the rest, each with dated keyframes,
 * era names, sources and an honest confidence level. From 1815 the nations layer takes over
 * (Sokoto, Bornu, Ashanti, Dahomey, Kongo, Buganda, Ethiopia … in globe-nations-table-1815.js).
 *
 * Most of these states ruled people and tribute, not surveyed lines: rings are the zone of
 * known towns, campaigns and tributaries from Arabic writers, oral traditions, Portuguese
 * reports and archaeology. Shapes live in the lazy globe chunk (docs/DATA.md).
 */

const A = 'simplified';
const R = (id, name, ring) => ({ id, name, ring });
const K = (year, label, regions, extra = {}) => ({ year, label, approximation: A, regions, ...extra });
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${title.replace(/ /g, '_')}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}/` });
const GHA = { title: 'UNESCO General History of Africa, vols. II–V', url: 'https://www.unesco.org/en/general-history-africa' };

const CONF = {
  sahel: {
    level: 'approximate',
    reason: 'Known from Arabic writers (al-Bakri, Ibn Battuta, the Timbuktu chronicles) and archaeology at capitals; the empire was a core plus tributary peoples, so the outer edge is a zone of influence, drawn roughly.',
  },
  wagadu: {
    level: 'conjectural',
    reason: 'Ghana/Wagadu is known mainly from al-Bakri (1068) and oral tradition; its origins, extent and even the identity of Koumbi Saleh as the capital are debated.',
  },
  forest: {
    level: 'approximate',
    reason: 'Known from oral histories, court traditions and European visitors from the 1480s on; borders with neighbours and tributaries moved and are drawn as rough regions.',
  },
  central: {
    level: 'conjectural',
    reason: 'Reconstructed largely from oral tradition, later Portuguese reports and archaeology; dates before about 1700 and the reach of tribute networks are uncertain.',
  },
  plateau: {
    level: 'approximate',
    reason: 'Great Zimbabwe and Mutapa are known from archaeology (stone enclosures, imported trade goods) and from Portuguese reports after 1500; the edge of the trading state is a rough zone.',
  },
  horn: {
    level: 'approximate',
    reason: 'Aksumite and Ethiopian kingdoms are known from inscriptions, coins, royal chronicles and church records; frontier provinces and tributaries changed often and are drawn roughly.',
  },
  swahili: {
    level: 'documented',
    reason: 'The towns themselves are well documented (the Kilwa Chronicle, Ibn Battuta, Portuguese accounts, excavations); each city ruled only a narrow coastal strip and islands, drawn as such — never as a filled interior.',
  },
};

// ---- West Africa: Ghana / Wagadu, Mali, Songhai ------------------------------------------

const GHANA_CORE = [[-11.5, 14.0], [-11.0, 16.5], [-8.0, 17.0], [-5.5, 16.2], [-6.0, 14.2], [-8.5, 13.6], [-11.5, 14.0]];
const GHANA_PEAK = [[-12.5, 13.8], [-12.0, 17.2], [-8.0, 18.0], [-4.5, 16.8], [-5.0, 14.0], [-8.5, 13.2], [-12.5, 13.8]];
const GHANA_LATE = [[-10.5, 14.5], [-10.0, 16.3], [-7.5, 16.5], [-6.5, 15.0], [-8.5, 14.2], [-10.5, 14.5]];

const MALI_EARLY = [[-11.0, 10.2], [-11.5, 13.5], [-9.0, 14.8], [-6.5, 14.0], [-6.5, 11.0], [-8.5, 10.0], [-11.0, 10.2]];
const MALI_PEAK = [
  [-17.0, 12.5], [-16.5, 15.5], [-12.0, 17.5], [-6.0, 18.0], [-2.0, 17.5], [1.5, 16.8],
  [1.0, 14.5], [-3.0, 13.0], [-5.5, 10.0], [-8.5, 8.8], [-12.0, 10.0], [-15.0, 11.5], [-17.0, 12.5],
];
const MALI_1450 = [
  [-17.0, 12.5], [-16.0, 15.5], [-11.0, 16.0], [-6.5, 15.0], [-6.0, 12.0], [-6.5, 9.5],
  [-9.0, 8.8], [-12.5, 10.0], [-15.0, 11.5], [-17.0, 12.5],
];
const MALI_1550 = [[-16.5, 12.5], [-15.5, 14.0], [-11.0, 14.0], [-8.0, 12.5], [-7.0, 10.0], [-9.5, 9.0], [-13.0, 10.5], [-16.5, 12.5]];
const MALI_REMNANT = [[-10.5, 10.5], [-10.5, 12.8], [-8.0, 13.0], [-7.2, 11.0], [-8.5, 10.0], [-10.5, 10.5]];

const SONGHAI_GAO = [[-2.0, 14.5], [-3.5, 16.8], [0.0, 17.5], [3.0, 16.0], [2.5, 13.5], [0.0, 13.2], [-2.0, 14.5]];
const SONGHAI_SUNNI = [[-5.0, 14.0], [-5.0, 16.5], [-3.0, 17.8], [0.5, 17.8], [3.5, 16.0], [3.0, 13.0], [0.0, 12.8], [-3.5, 13.2], [-5.0, 14.0]];
const SONGHAI_PEAK = [
  [-5.5, 14.0], [-6.0, 16.5], [-3.0, 18.5], [1.0, 18.5], [4.0, 17.0], [4.5, 14.0],
  [3.0, 12.3], [0.0, 12.5], [-3.5, 13.0], [-5.5, 14.0],
];

// ---- Central Sudan: Kanem–Bornu, Hausa, Sokoto ------------------------------------------

const KANEM_EARLY = [[14.0, 13.5], [13.5, 16.0], [16.0, 18.0], [19.0, 17.0], [19.5, 14.0], [17.0, 12.8], [14.0, 13.5]];
const KANEM_PEAK = [
  [12.0, 12.5], [12.5, 16.0], [14.0, 21.0], [16.0, 25.5], [18.0, 25.0], [19.5, 20.0],
  [20.0, 15.0], [18.5, 12.0], [15.0, 11.8], [12.0, 12.5],
];
const BORNU_CORE = [[10.6, 11.5], [11.0, 13.8], [13.5, 14.2], [14.5, 12.5], [14.0, 11.0], [12.0, 10.5], [10.6, 11.5]];
const BORNU_1500 = [[10.6, 11.2], [10.8, 14.0], [14.0, 15.5], [17.0, 15.5], [18.0, 13.5], [15.0, 11.5], [13.0, 10.3], [10.6, 11.2]];
const BORNU_ALOOMA = [[10.4, 11.0], [10.6, 14.5], [13.0, 18.0], [16.0, 20.0], [18.5, 17.0], [19.0, 13.5], [16.0, 11.0], [13.0, 10.0], [10.4, 11.0]];

const HAUSA_EARLY = [[7.0, 11.5], [7.2, 13.2], [8.8, 12.8], [9.0, 11.6], [8.0, 11.2], [7.0, 11.5]];
const HAUSA_WIDE = [[5.0, 12.5], [5.5, 14.0], [7.5, 13.8], [9.8, 12.8], [9.5, 11.0], [7.8, 10.2], [6.5, 11.0], [5.0, 12.5]];

const SOKOTO_JIHAD = [[4.8, 12.6], [5.2, 13.9], [6.8, 13.8], [7.0, 12.6], [5.8, 12.2], [4.8, 12.6]];
const SOKOTO_WIDE = [[3.5, 12.5], [4.5, 14.0], [8.0, 13.8], [10.2, 12.5], [11.5, 9.5], [10.0, 7.8], [6.5, 8.2], [4.0, 9.5], [3.5, 12.5]];

// ---- Forest kingdoms: Benin, Oyo, Asante -------------------------------------------------

const BENIN_EARLY = [[5.2, 6.0], [5.3, 7.0], [6.2, 7.0], [6.3, 6.0], [5.8, 5.6], [5.2, 6.0]];
const BENIN_PEAK = [[3.3, 6.5], [4.0, 6.9], [4.8, 7.1], [6.5, 7.5], [6.9, 6.3], [6.2, 5.4], [5.2, 5.4], [4.2, 6.2], [3.3, 6.5]];
const BENIN_LATE = [[4.6, 6.2], [4.9, 7.0], [6.3, 7.3], [6.6, 6.2], [6.0, 5.5], [5.1, 5.6], [4.6, 6.2]];

const OYO_EARLY = [[3.0, 8.0], [3.2, 9.5], [4.5, 10.0], [5.3, 9.3], [5.0, 8.0], [4.0, 7.6], [3.0, 8.0]];
const OYO_MID = [[2.3, 7.5], [2.5, 9.8], [4.5, 10.3], [5.5, 9.3], [5.2, 7.8], [4.0, 7.2], [2.3, 7.5]];
const OYO_PEAK = [[1.5, 6.8], [1.8, 9.8], [4.5, 10.4], [5.6, 9.3], [5.2, 7.6], [4.0, 7.2], [2.5, 6.6], [1.5, 6.8]];

const ASANTE_EARLY = [[-2.5, 6.2], [-2.4, 7.4], [-1.0, 7.6], [-0.8, 6.4], [-1.6, 6.0], [-2.5, 6.2]];
const ASANTE_MID = [[-3.2, 5.6], [-3.0, 8.6], [-0.5, 8.8], [0.6, 7.2], [-0.3, 5.9], [-1.6, 5.4], [-3.2, 5.6]];
const ASANTE_COAST = [[-3.1, 5.2], [-3.0, 8.8], [-0.5, 9.0], [0.6, 7.2], [0.0, 5.7], [-1.5, 5.0], [-3.1, 5.2]];

// ---- West-central Africa: Kongo, Luba, Lunda ---------------------------------------------

const KONGO_CORE = [[13.2, -5.6], [14.6, -5.0], [15.6, -5.6], [15.4, -7.0], [14.0, -7.4], [13.2, -6.6], [13.2, -5.6]];
const KONGO_PEAK = [[12.4, -5.8], [13.5, -4.6], [15.5, -4.4], [16.5, -5.5], [16.2, -7.8], [14.5, -8.8], [13.3, -8.6], [12.7, -7.0], [12.4, -5.8]];
const KONGO_1600 = [[12.4, -5.8], [13.5, -4.6], [15.5, -4.4], [16.5, -5.5], [16.2, -7.6], [14.5, -8.2], [13.4, -8.0], [12.7, -7.0], [12.4, -5.8]];

const LUBA_CORE = [[25.5, -7.5], [26.0, -6.5], [27.5, -6.8], [27.8, -8.8], [26.5, -9.5], [25.3, -8.8], [25.5, -7.5]];
const LUBA_PEAK = [[24.5, -7.0], [25.5, -5.5], [28.5, -5.8], [29.0, -8.0], [27.8, -9.2], [25.5, -9.8], [24.6, -8.5], [24.5, -7.0]];

const LUNDA_CORE = [[21.5, -7.5], [22.3, -6.5], [23.8, -7.0], [23.8, -9.3], [22.0, -9.5], [21.5, -7.5]];
const LUNDA_PEAK = [[19.0, -7.0], [21.0, -5.8], [24.0, -6.3], [24.2, -9.5], [22.5, -11.5], [20.0, -10.5], [19.0, -7.0]];
const KAZEMBE = [[28.4, -9.9], [29.3, -9.4], [29.8, -10.6], [28.8, -11.6], [28.3, -10.8], [28.4, -9.9]];

// ---- Southern Africa: Great Zimbabwe, Mutapa ---------------------------------------------

const GZ_EARLY = [[30.0, -19.6], [31.2, -19.4], [32.0, -20.3], [31.5, -21.2], [30.2, -21.0], [30.0, -19.6]];
const GZ_PEAK = [[28.5, -19.2], [30.5, -18.3], [32.6, -19.2], [32.5, -21.0], [30.5, -22.0], [28.6, -21.2], [28.5, -19.2]];

const MUTAPA_CORE = [[29.5, -16.3], [31.0, -15.8], [33.2, -16.3], [33.0, -17.8], [31.0, -18.0], [29.8, -17.5], [29.5, -16.3]];
const MUTAPA_PEAK = [[28.8, -16.2], [30.5, -15.6], [33.5, -15.8], [34.5, -17.5], [33.5, -18.0], [31.0, -18.1], [29.2, -17.8], [28.8, -16.2]];
const MUTAPA_LATE = [[30.5, -16.0], [32.5, -15.9], [32.8, -17.2], [31.0, -17.4], [30.5, -16.0]];

// ---- Horn of Africa: Aksum, Zagwe, Solomonic Ethiopia ------------------------------------

const AKSUM_CORE = [[37.5, 13.5], [38.4, 15.8], [39.6, 15.6], [40.2, 14.0], [39.4, 13.0], [38.0, 12.9], [37.5, 13.5]];
const AKSUM_PEAK = [[36.2, 13.0], [37.0, 15.5], [38.5, 17.6], [39.6, 15.8], [41.0, 14.2], [40.0, 12.3], [38.0, 12.0], [36.2, 13.0]];
const AKSUM_YEMEN = [[43.2, 13.0], [43.5, 16.0], [45.5, 15.5], [45.0, 13.0], [44.0, 12.7], [43.2, 13.0]];
const AKSUM_LATE = [[38.0, 13.5], [38.6, 14.8], [39.5, 14.5], [39.3, 13.4], [38.6, 13.1], [38.0, 13.5]];

const ZAGWE = [[37.8, 11.3], [38.0, 13.2], [39.5, 13.8], [40.0, 12.3], [39.3, 11.0], [37.8, 11.3]];
const ZAGWE_WIDE = [[37.4, 11.0], [37.8, 13.5], [39.4, 14.6], [40.2, 12.5], [39.4, 10.4], [37.4, 11.0]];

const ETH_1270 = [[37.5, 9.5], [37.5, 12.5], [38.5, 14.5], [39.6, 14.3], [40.2, 12.0], [39.5, 9.3], [38.0, 8.8], [37.5, 9.5]];
const ETH_PEAK = [
  [35.8, 9.0], [36.2, 13.0], [37.5, 15.5], [39.5, 15.5], [41.0, 13.5], [40.8, 10.0],
  [40.0, 8.2], [38.0, 7.0], [36.5, 7.5], [35.8, 9.0],
];
const ETH_ADAL = [[37.5, 11.0], [37.6, 13.8], [39.3, 14.2], [39.7, 12.3], [38.5, 10.8], [37.5, 11.0]];
const ETH_GONDAR = [[35.5, 9.5], [36.0, 13.0], [37.5, 15.2], [39.8, 15.0], [40.0, 12.5], [39.5, 10.5], [38.0, 9.3], [35.5, 9.5]];
const ETH_PRINCES = [[36.5, 10.5], [36.8, 13.2], [38.3, 14.6], [39.6, 14.3], [39.8, 12.0], [39.0, 10.0], [37.5, 9.6], [36.5, 10.5]];

// ---- East Africa: the Swahili coast, Buganda ---------------------------------------------

const SW_LAMU_MOMBASA = [[41.0, -2.0], [40.3, -2.6], [39.85, -3.9], [39.5, -4.6], [39.1, -4.3], [39.5, -3.4], [40.0, -2.4], [40.7, -1.7], [41.0, -2.0]];
const SW_ZANZIBAR = [[39.25, -5.75], [39.55, -6.15], [39.5, -6.45], [39.3, -6.4], [39.25, -5.75]];
const SW_KILWA = [[39.6, -8.4], [39.55, -9.3], [39.2, -9.3], [39.2, -8.4], [39.6, -8.4]];
const SW_SOFALA = [[34.5, -19.7], [35.0, -20.4], [34.6, -20.6], [34.2, -20.0], [34.5, -19.7]];

const BUGANDA_CORE = [[31.8, 0.0], [32.2, 0.8], [33.0, 0.7], [33.0, 0.05], [32.4, -0.2], [31.8, 0.0]];
const BUGANDA_MID = [[31.5, -0.3], [31.6, 1.0], [32.6, 1.3], [33.2, 0.8], [33.2, 0.05], [32.3, -0.4], [31.5, -0.3]];
const BUGANDA_WIDE = [[31.3, -0.7], [31.4, 1.2], [32.7, 1.4], [33.3, 0.6], [33.2, 0.0], [32.0, -0.8], [31.3, -0.7]];

// ---- Entities ----------------------------------------------------------------------------

const ghana = {
  id: 'ghana-empire-ov',
  name: 'Ghana Empire (Wagadu)',
  color: '#CA8A04',
  type: 'empire',
  description:
    'Wagadu, called Ghana after its king’s title, was the first great Sahel state, between the upper Senegal and Niger rivers. It taxed the gold coming north and the salt coming south. Al-Bakri described its twin-town capital in 1068; the Almoravids weakened it around 1076 and by about 1200 the Sosso had taken its heartland.',
  keyYears: [700, 1000, 1076, 1150, 1200],
  overlays: [
    K(700, 'Wagadu between the Senegal and Niger', [R('wagadu', 'Wagadu (Aukar / Hodh)', GHANA_CORE)]),
    K(1000, 'Ghana at its height (gold trade)', [R('wagadu', 'Ghana / Wagadu', GHANA_PEAK)]),
    K(1076, 'Almoravid pressure', [R('wagadu', 'Ghana / Wagadu', GHANA_CORE)]),
    K(1150, 'Late Ghana', [R('wagadu', 'Wagadu remnant', GHANA_LATE)]),
    K(1200, 'Sosso take the heartland', [R('wagadu', 'Wagadu remnant', GHANA_LATE)]),
  ],
  timelineItemIds: ['ghana-empire'],
  confidence: CONF.wagadu,
  sources: [W('Ghana Empire'), W('Koumbi Saleh'), W('Abu Abdullah al-Bakri'), GHA],
  edgeGrace: 10,
};

const mali = {
  id: 'mali-empire',
  name: 'Mali Empire',
  color: '#EAB308',
  type: 'empire',
  description:
    'Founded by Sundiata Keita after the battle of Kirina (c. 1235), Mali ruled the upper Niger, the gold fields of Bambuk and Bure, and at its height the trade towns of Timbuktu and Gao and the Atlantic coast of Senegambia. Mansa Musa’s pilgrimage of 1324 made it famous in Cairo and Europe. Songhai and the Tuareg took the Niger bend in the 15th century; a Mande kingdom survived on the upper Niger to about 1600.',
  keyYears: [1240, 1324, 1360, 1450, 1550, 1600],
  overlays: [
    K(1240, 'Sundiata’s Mali', [R('mali', 'Upper Niger (Manden)', MALI_EARLY)]),
    K(1324, 'Mansa Musa’s empire', [R('mali', 'Mali Empire', MALI_PEAK)]),
    K(1360, 'Ibn Battuta’s visit', [R('mali', 'Mali Empire', MALI_PEAK)]),
    K(1450, 'After losing Timbuktu', [R('mali', 'Mali (west of the Niger bend)', MALI_1450)]),
    K(1550, 'Shrinking to the west', [R('mali', 'Mali', MALI_1550)]),
    K(1600, 'Mande remnant', [R('mali', 'Mali remnant (Niani / Kangaba)', MALI_REMNANT)]),
  ],
  timelineItemIds: ['mali-empire'],
  confidence: CONF.sahel,
  sources: [W('Mali Empire'), W('Mansa Musa'), W('Ibn Battuta'), GHA],
  edgeGrace: 10,
};

const songhai = {
  id: 'songhai-empire',
  name: 'Songhai Empire',
  color: '#F97316',
  type: 'empire',
  description:
    'Gao on the Niger had been a trading kingdom for centuries; from 1464 Sunni Ali turned it into an empire, taking Timbuktu (1468) and Djenné. Askia Muhammad (1493–1528) stretched it from the Atlantic side of the Sahel toward the Hausa lands. A Moroccan army with firearms won at Tondibi in 1591 and the empire broke up.',
  keyYears: [1464, 1475, 1500, 1530, 1591],
  overlays: [
    K(1464, 'Gao under Sunni Ali', [R('songhai', 'Gao and the Niger bend', SONGHAI_GAO)]),
    K(1475, 'Timbuktu and Djenné taken', [R('songhai', 'Songhai', SONGHAI_SUNNI)]),
    K(1500, 'Askia Muhammad’s empire', [R('songhai', 'Songhai Empire', SONGHAI_PEAK)]),
    K(1530, 'Songhai at its height', [R('songhai', 'Songhai Empire', SONGHAI_PEAK)]),
    K(1591, 'Tondibi: Moroccan invasion', [R('songhai', 'Songhai (Gao)', SONGHAI_SUNNI)]),
  ],
  timelineItemIds: ['songhai'],
  confidence: CONF.sahel,
  sources: [W('Songhai Empire'), W('Askia Muhammad I'), W('Battle of Tondibi'), { title: 'Hunwick, Timbuktu and the Songhay Empire (1999)', url: 'https://brill.com/display/title/7470' }],
  edgeGrace: 6,
};

const kanem = {
  id: 'kanem-bornu',
  name: 'Kanem–Bornu',
  color: '#A16207',
  type: 'empire',
  description:
    'One of Africa’s longest-lived states, ruled by the Sayfawa dynasty for about a thousand years. Kanem grew north-east of Lake Chad and reached the Fezzan under Dunama Dabbalemi (13th c.). Civil war and the Bulala pushed the court west of the lake to Bornu around 1380; from Ngazargamu, Idris Alooma (1564–96) rebuilt a strong, musket-armed state.',
  nameAt: [
    [700, 'Kanem'],
    [1380, 'Bornu'],
  ],
  keyYears: [800, 1100, 1250, 1390, 1500, 1600, 1800],
  overlays: [
    K(800, 'Early Kanem', [R('kanem', 'Kanem (north-east of Lake Chad)', KANEM_EARLY)]),
    K(1100, 'Sayfawa Kanem turns Muslim', [R('kanem', 'Kanem', KANEM_EARLY)]),
    K(1250, 'Dunama Dabbalemi reaches the Fezzan', [R('kanem', 'Kanem to the Fezzan', KANEM_PEAK)]),
    K(1390, 'Court moves west to Bornu', [R('bornu', 'Bornu (west of Lake Chad)', BORNU_CORE)]),
    K(1500, 'Ngazargamu; Kanem retaken', [R('bornu', 'Bornu with Kanem', BORNU_1500)]),
    K(1600, 'Idris Alooma’s Bornu', [R('bornu', 'Bornu', BORNU_ALOOMA)]),
    K(1800, 'Bornu before the Fulani jihad', [R('bornu', 'Bornu', BORNU_CORE)]),
  ],
  timelineItemIds: ['kanem-bornu'],
  confidence: CONF.sahel,
  sources: [W('Kanem–Bornu Empire'), W('Kanem Empire'), W('Bornu Empire'), W('Idris Alooma'), GHA],
  edgeGrace: 10,
};

const hausa = {
  id: 'hausa-states',
  name: 'Hausa city-states',
  color: '#0D9488',
  type: 'state',
  description:
    'A group of walled trading cities in what is now northern Nigeria — Kano, Katsina, Zazzau (Zaria), Gobir, Daura, Rano and others — that were never one empire. They grew rich on cloth, leather and the trans-Saharan trade, fought each other and paid tribute at times to Songhai and Bornu. The Fulani jihad of 1804–08 replaced their rulers with the Sokoto Caliphate.',
  keyYears: [1100, 1450, 1600, 1800],
  overlays: [
    K(1100, 'Early walled towns (Kano, Katsina, Daura)', [R('hausa', 'Hausaland', HAUSA_EARLY)]),
    K(1450, 'Hausa Bakwai (the seven states)', [R('hausa', 'Hausaland (Kano, Katsina, Zazzau, Gobir …)', HAUSA_WIDE)]),
    K(1600, 'Kano and Katsina trade cities', [R('hausa', 'Hausaland', HAUSA_WIDE)]),
    K(1800, 'Before the jihad', [R('hausa', 'Hausaland', HAUSA_WIDE)]),
  ],
  timelineItemIds: ['hausa-states'],
  confidence: {
    level: 'approximate',
    reason: 'The cities are well known (the Kano Chronicle, Leo Africanus, Bornu records); the combined ring covers a group of rival city-states, not one state, and the countryside each controlled changed often.',
  },
  sources: [W('Hausa Kingdoms'), W('Kano Chronicle'), W('Kingdom of Kano'), GHA],
  edgeGrace: 6,
};

const sokoto = {
  id: 'sokoto-caliphate',
  name: 'Sokoto Caliphate',
  color: '#15803D',
  type: 'empire',
  description:
    'Usman dan Fodio’s jihad (1804–08) overthrew the Hausa kings and created a Fulani-led caliphate of emirates, one of the largest states in 19th-century Africa. It lasted until British conquest in 1903; from 1815 the globe’s nations layer shows it.',
  keyYears: [1804, 1810, 1815],
  overlays: [
    K(1804, 'Jihad begins in Gobir', [R('sokoto', 'Gobir / Degel', SOKOTO_JIHAD)]),
    K(1810, 'Hausa kingdoms conquered', [R('sokoto', 'Sokoto Caliphate', SOKOTO_WIDE)]),
    K(1815, 'Caliphate of emirates', [R('sokoto', 'Sokoto Caliphate', SOKOTO_WIDE)]),
  ],
  timelineItemIds: ['sokoto-caliphate'],
  confidence: {
    level: 'approximate',
    reason: 'Well documented by the caliphate’s own Arabic writings and European travellers (Clapperton, Barth); emirate frontiers in the south were raiding zones and are drawn roughly.',
  },
  sources: [W('Sokoto Caliphate'), W('Usman dan Fodio'), W('Fulani War')],
  edgeGrace: 4,
};

const benin = {
  id: 'benin-kingdom',
  name: 'Kingdom of Benin',
  color: '#B91C1C',
  type: 'state',
  description:
    'An Edo kingdom ruled by the Oba from Benin City, behind huge earthen walls. Oba Ewuare (c. 1440) and his successors expanded it west toward Lagos and east to the Niger. Its court artists cast the famous Benin Bronzes. It traded with the Portuguese from 1485, and Britain sacked Benin City in 1897.',
  keyYears: [1200, 1440, 1500, 1650, 1800],
  overlays: [
    K(1200, 'Early Benin (Edo heartland)', [R('benin', 'Edo heartland', BENIN_EARLY)]),
    K(1440, 'Oba Ewuare’s reforms', [R('benin', 'Benin', BENIN_LATE)]),
    K(1500, 'Benin west to Lagos', [R('benin', 'Kingdom of Benin', BENIN_PEAK)]),
    K(1650, 'Benin and the coast trade', [R('benin', 'Kingdom of Benin', BENIN_PEAK)]),
    K(1800, 'Late Benin', [R('benin', 'Kingdom of Benin', BENIN_LATE)]),
  ],
  timelineItemIds: ['benin-kingdom'],
  confidence: CONF.forest,
  sources: [W('Kingdom of Benin'), W('Benin Bronzes'), W('Ewuare'), GHA],
  edgeGrace: 10,
};

const oyo = {
  id: 'oyo-empire',
  name: 'Oyo Empire',
  color: '#7C2D12',
  type: 'empire',
  description:
    'A Yoruba empire of the savanna north of the forest, ruled by the Alaafin from Oyo-Ile. Its cavalry made it the strongest Yoruba state; from the 1720s Dahomey paid it tribute. Civil war, Ilorin’s revolt and the Fulani jihad brought it down in the 1830s.',
  keyYears: [1450, 1650, 1750, 1800],
  overlays: [
    K(1450, 'Oyo-Ile and the northern Yoruba', [R('oyo', 'Oyo', OYO_EARLY)]),
    K(1650, 'Oyo expanding south and west', [R('oyo', 'Oyo Empire', OYO_MID)]),
    K(1750, 'Oyo with Dahomey as tributary', [R('oyo', 'Oyo Empire', OYO_PEAK)]),
    K(1800, 'Oyo before the collapse', [R('oyo', 'Oyo Empire', OYO_MID)]),
  ],
  timelineItemIds: ['oyo-empire'],
  confidence: CONF.forest,
  sources: [W('Oyo Empire'), W('Oyo-Ile'), { title: 'Law, The Oyo Empire c.1600–c.1836 (1977)', url: 'https://en.wikipedia.org/wiki/Oyo_Empire#Bibliography' }],
  edgeGrace: 10,
};

const asante = {
  id: 'asante-empire',
  name: 'Asante Empire',
  color: '#D97706',
  type: 'empire',
  description:
    'Osei Tutu and the priest Okomfo Anokye united the Akan states around Kumasi about 1701 (the Golden Stool), then beat Denkyira. Asante grew rich on gold and kola, and by 1807 reached the Gold Coast forts. From 1815 the nations layer shows it; Britain annexed it in 1901.',
  keyYears: [1701, 1750, 1807, 1815],
  overlays: [
    K(1701, 'Osei Tutu and the Golden Stool', [R('asante', 'Kumasi and the Akan union', ASANTE_EARLY)]),
    K(1750, 'Asante after Opoku Ware', [R('asante', 'Asante Empire', ASANTE_MID)]),
    K(1807, 'Asante reaches the coast', [R('asante', 'Asante Empire', ASANTE_COAST)]),
    K(1815, 'Asante Empire', [R('asante', 'Asante Empire', ASANTE_COAST)]),
  ],
  timelineItemIds: ['asante-empire'],
  confidence: CONF.forest,
  sources: [W('Ashanti Empire'), W('Osei Tutu'), W('Golden Stool'), { title: 'Wilks, Asante in the Nineteenth Century (1975)', url: 'https://en.wikipedia.org/wiki/Ashanti_Empire#Further_reading' }],
  edgeGrace: 4,
};

const kongo = {
  id: 'kongo',
  name: 'Kingdom of Kongo',
  color: '#13708A',
  type: 'state',
  description:
    'A kingdom south of the lower Congo River, ruled by the Manikongo from Mbanza Kongo. Its king was baptised in 1491, and Afonso I (1509–42) wrote to the kings of Portugal about the slave trade. Kongo lost the battle of Mbwila to Portuguese Angola in 1665 and then split into rival factions for decades; the kingdom survived in weaker form into the colonial era.',
  keyYears: [1400, 1500, 1600, 1665, 1700, 1800],
  overlays: [
    K(1400, 'Early Kongo (Mbanza Kongo)', [R('kongo', 'Kongo heartland', KONGO_CORE)]),
    K(1500, 'Kongo at contact with Portugal', [R('kongo', 'Kingdom of Kongo', KONGO_PEAK)]),
    K(1600, 'Kongo beside Portuguese Luanda', [R('kongo', 'Kingdom of Kongo', KONGO_1600)]),
    K(1665, 'Battle of Mbwila', [R('kongo', 'Kingdom of Kongo', KONGO_1600)]),
    K(1700, 'Civil wars; Pedro IV restores the capital', [R('kongo', 'Kongo core', KONGO_CORE)]),
    K(1800, 'Late Kongo', [R('kongo', 'Kongo core', KONGO_CORE)]),
  ],
  timelineItemIds: ['kongo'],
  confidence: {
    level: 'approximate',
    reason: 'Unusually well documented for Central Africa: Kongo kings’ own letters, missionaries and Portuguese records. Provinces and tributaries at the edges are drawn roughly.',
  },
  sources: [W('Kingdom of Kongo'), W('Afonso I of Kongo'), W('Battle of Mbwila'), { title: 'Thornton, The Kingdom of Kongo (1983)', url: 'https://en.wikipedia.org/wiki/Kingdom_of_Kongo#Further_reading' }],
  edgeGrace: 10,
};

const luba = {
  id: 'luba-kingdom',
  name: 'Luba Kingdom',
  color: '#6D28D9',
  type: 'state',
  description:
    'A kingdom of the upper Lualaba in Katanga, built on sacred kingship and the memory-board (lukasa) traditions of its court. It grew from the 16th–17th century and peaked around 1800 under Ilunga Sungu and Kasongo Kalombo, before civil war and slave raiders broke it in the 1870s–80s.',
  keyYears: [1600, 1700, 1800],
  overlays: [
    K(1600, 'Luba heartland (upper Lualaba)', [R('luba', 'Luba heartland', LUBA_CORE)]),
    K(1700, 'Luba expanding', [R('luba', 'Luba Kingdom', LUBA_CORE)]),
    K(1800, 'Luba at its height', [R('luba', 'Luba Kingdom', LUBA_PEAK)]),
  ],
  timelineItemIds: ['luba-kingdom'],
  confidence: CONF.central,
  sources: [W('Luba Empire'), W('Lukasa'), GHA],
  edgeGrace: 10,
};

const lunda = {
  id: 'lunda-empire',
  name: 'Lunda Empire',
  color: '#BE185D',
  type: 'empire',
  description:
    'A Lunda state west of the Luba, ruled by the Mwata Yamvo from his capital (musumba). From the late 17th century it spread through tribute and by sending out chiefs who founded daughter kingdoms, the largest being Kazembe on the Luapula (from about 1740). It traded slaves and ivory west to the Atlantic and east toward Mozambique.',
  keyYears: [1680, 1750, 1800],
  overlays: [
    K(1680, 'Mwata Yamvo’s kingdom', [R('lunda', 'Lunda heartland', LUNDA_CORE)]),
    K(1750, 'Lunda with Kazembe', [R('lunda', 'Lunda Empire', LUNDA_PEAK), R('kazembe', 'Kazembe (Luapula)', KAZEMBE)]),
    K(1800, 'Lunda at its height', [R('lunda', 'Lunda Empire', LUNDA_PEAK), R('kazembe', 'Kazembe (Luapula)', KAZEMBE)]),
  ],
  timelineItemIds: ['lunda-empire'],
  confidence: CONF.central,
  sources: [W('Lunda Empire'), W('Kingdom of Kazembe'), GHA],
  edgeGrace: 10,
};

const greatZimbabwe = {
  id: 'great-zimbabwe',
  name: 'Great Zimbabwe',
  color: '#78716C',
  type: 'state',
  description:
    'A Shona state on the Zimbabwe plateau whose capital’s dry-stone walls are the largest ancient structures south of the Sahara. It controlled gold exports to the Swahili port of Sofala; Chinese porcelain and Persian glass have been dug up there. It was abandoned in the 15th century as power moved north (Mutapa) and west (Torwa).',
  keyYears: [1150, 1300, 1380, 1440],
  overlays: [
    K(1150, 'Early Great Zimbabwe', [R('zimbabwe', 'Zimbabwe plateau', GZ_EARLY)]),
    K(1300, 'Great Enclosure built; gold trade', [R('zimbabwe', 'Great Zimbabwe state', GZ_PEAK)]),
    K(1380, 'Great Zimbabwe at its height', [R('zimbabwe', 'Great Zimbabwe state', GZ_PEAK)]),
    K(1440, 'Decline and abandonment', [R('zimbabwe', 'Zimbabwe plateau', GZ_EARLY)]),
  ],
  timelineItemIds: ['great-zimbabwe'],
  confidence: CONF.plateau,
  sources: [W('Great Zimbabwe'), UNESCO('Great Zimbabwe National Monument', 364), W('Kingdom of Zimbabwe')],
  edgeGrace: 10,
};

const mutapa = {
  id: 'mutapa',
  name: 'Kingdom of Mutapa',
  color: '#8A6F4E',
  type: 'state',
  description:
    'Founded by Nyatsimba Mutota around 1430 north of Great Zimbabwe, Mutapa ruled the Zambezi plateau and its gold. The Portuguese pushed up the Zambezi from the 1530s and made the Mwenemutapa a vassal in 1629. The Rozvi took the south in the 1680s and Mutapa shrank to the Zambezi valley until the 1760s.',
  keyYears: [1450, 1550, 1629, 1700, 1760],
  overlays: [
    K(1450, 'Mutota’s new kingdom', [R('mutapa', 'Mutapa (northern plateau)', MUTAPA_CORE)]),
    K(1550, 'Mutapa at its height', [R('mutapa', 'Mutapa', MUTAPA_PEAK)]),
    K(1629, 'Portuguese vassal', [R('mutapa', 'Mutapa', MUTAPA_CORE)]),
    K(1700, 'After the Rozvi', [R('mutapa', 'Mutapa (Zambezi valley)', MUTAPA_LATE)]),
    K(1760, 'Mutapa remnant', [R('mutapa', 'Mutapa remnant', MUTAPA_LATE)]),
  ],
  timelineItemIds: ['mutapa'],
  confidence: CONF.plateau,
  sources: [W('Kingdom of Mutapa'), W('Nyatsimba Mutota'), W('Rozvi Empire')],
  edgeGrace: 10,
};

const axum = {
  id: 'axum',
  name: 'Kingdom of Aksum',
  color: '#9333EA',
  type: 'empire',
  description:
    'A trading kingdom of the Tigray and Eritrean highlands with its port at Adulis on the Red Sea. It minted gold coins, raised giant stelae, and under Ezana (c. 330) became one of the first states to adopt Christianity. In the 520s Kaleb conquered Himyar in Yemen. Trade shifted after the rise of Islam, and Aksum faded by the 10th century.',
  keyYears: [100, 350, 530, 700, 900],
  overlays: [
    K(100, 'Aksum and Adulis', [R('aksum', 'Aksumite highlands', AKSUM_CORE)]),
    K(350, 'Ezana’s Christian kingdom', [R('aksum', 'Kingdom of Aksum', AKSUM_PEAK)]),
    K(530, 'Kaleb rules Himyar', [R('aksum', 'Kingdom of Aksum', AKSUM_PEAK), R('himyar', 'Himyar (Yemen)', AKSUM_YEMEN)]),
    K(700, 'Aksum after the Red Sea trade shifts', [R('aksum', 'Aksumite highlands', AKSUM_CORE)]),
    K(900, 'Late Aksum', [R('aksum', 'Aksumite remnant', AKSUM_LATE)]),
  ],
  timelineItemIds: ['axum'],
  confidence: CONF.horn,
  sources: [W('Kingdom of Aksum'), W('Ezana of Axum'), W('Kaleb of Axum'), UNESCO('Aksum', 15)],
  edgeGrace: 10,
};

const zagwe = {
  id: 'zagwe-dynasty',
  name: 'Zagwe Kingdom',
  color: '#C026D3',
  type: 'state',
  description:
    'An Agaw dynasty that ruled the Ethiopian highlands between Aksum and the Solomonic kings. King Lalibela (c. 1185–1225) had the famous rock-cut churches carved at his capital Roha, later named Lalibela after him. Yekuno Amlak overthrew the last Zagwe king in 1270.',
  keyYears: [1137, 1200, 1260],
  overlays: [
    K(1137, 'Zagwe kings at Roha', [R('zagwe', 'Lasta / Wag highlands', ZAGWE)]),
    K(1200, 'King Lalibela’s churches', [R('zagwe', 'Zagwe kingdom', ZAGWE_WIDE)]),
    K(1260, 'Last Zagwe kings', [R('zagwe', 'Zagwe kingdom', ZAGWE)]),
  ],
  timelineItemIds: ['zagwe-dynasty'],
  confidence: {
    level: 'conjectural',
    reason: 'Few Zagwe-period documents survive; reign dates come from later church traditions and differ by decades. The churches of Lalibela are the firm evidence; the realm’s extent is rough.',
  },
  sources: [W('Zagwe dynasty'), W('Gebre Mesqel Lalibela'), UNESCO('Rock-Hewn Churches, Lalibela', 18)],
  edgeGrace: 6,
};

const ethiopia = {
  id: 'ethiopian-empire',
  name: 'Ethiopian Empire',
  color: '#16A34A',
  type: 'empire',
  description:
    'The Solomonic dynasty took power in 1270. Amda Seyon (1314–44) and Zara Yaqob (1434–68) built a large Christian highland empire with Muslim tributaries to the east. Ahmad Grañ of Adal overran most of it in 1529–43, until Portuguese musketeers helped restore it. The court settled at Gondar from 1636; after 1769 regional lords held real power (the Era of the Princes).',
  nameAt: [
    [1270, 'Ethiopian Empire (Solomonic)'],
    [1636, 'Ethiopian Empire (Gondar)'],
    [1769, 'Ethiopia (Era of the Princes)'],
  ],
  keyYears: [1270, 1340, 1450, 1535, 1600, 1700, 1800],
  overlays: [
    K(1270, 'Yekuno Amlak’s Solomonic kingdom', [R('ethiopia', 'Amhara / Shewa highlands', ETH_1270)]),
    K(1340, 'Amda Seyon’s conquests', [R('ethiopia', 'Ethiopian Empire', ETH_PEAK)]),
    K(1450, 'Zara Yaqob’s empire', [R('ethiopia', 'Ethiopian Empire', ETH_PEAK)]),
    K(1535, 'Adal invasion (Ahmad Grañ)', [R('ethiopia', 'Unconquered highlands', ETH_ADAL)]),
    K(1600, 'Restored empire', [R('ethiopia', 'Ethiopian Empire', ETH_GONDAR)]),
    K(1700, 'Gondarine Ethiopia', [R('ethiopia', 'Ethiopian Empire', ETH_GONDAR)]),
    K(1800, 'Era of the Princes', [R('ethiopia', 'Ethiopia (nominal empire)', ETH_PRINCES)]),
  ],
  timelineItemIds: ['ethiopian-empire'],
  confidence: CONF.horn,
  sources: [W('Ethiopian Empire'), W('Solomonic dynasty'), W('Ethiopian–Adal war'), W('Zemene Mesafint')],
  edgeGrace: 10,
};

const swahili = {
  id: 'swahili-city-states',
  name: 'Swahili city-states',
  color: '#0284C7',
  type: 'state',
  description:
    'Independent Muslim trading towns along the East African coast — Lamu, Malindi, Mombasa, Zanzibar, Kilwa and, in the south, Sofala — speaking Swahili, a Bantu language with Arabic loanwords. They shipped gold, ivory and slaves across the Indian Ocean. Kilwa was the richest in the 14th century. The Portuguese sacked several in 1505, and Oman drove them out of Mombasa in 1698.',
  keyYears: [1000, 1300, 1500, 1600, 1698],
  overlays: [
    K(1000, 'Early Swahili towns', [
      R('north', 'Lamu–Mombasa coast', SW_LAMU_MOMBASA),
      R('zanzibar', 'Zanzibar', SW_ZANZIBAR),
      R('kilwa', 'Kilwa', SW_KILWA),
    ]),
    K(1300, 'Kilwa’s golden age', [
      R('north', 'Lamu–Malindi–Mombasa', SW_LAMU_MOMBASA),
      R('zanzibar', 'Zanzibar', SW_ZANZIBAR),
      R('kilwa', 'Kilwa Kisiwani', SW_KILWA),
      R('sofala', 'Sofala (gold port)', SW_SOFALA),
    ]),
    K(1500, 'Before the Portuguese', [
      R('north', 'Lamu–Malindi–Mombasa', SW_LAMU_MOMBASA),
      R('zanzibar', 'Zanzibar', SW_ZANZIBAR),
      R('kilwa', 'Kilwa', SW_KILWA),
      R('sofala', 'Sofala', SW_SOFALA),
    ]),
    K(1600, 'Under Portuguese pressure', [
      R('north', 'Lamu–Malindi–Mombasa', SW_LAMU_MOMBASA),
      R('zanzibar', 'Zanzibar', SW_ZANZIBAR),
      R('kilwa', 'Kilwa', SW_KILWA),
    ]),
    K(1698, 'Oman takes Mombasa', [R('north', 'Lamu–Mombasa coast', SW_LAMU_MOMBASA), R('zanzibar', 'Zanzibar', SW_ZANZIBAR)]),
  ],
  timelineItemIds: ['swahili-city-states'],
  confidence: CONF.swahili,
  sources: [W('Swahili culture'), W('Kilwa Sultanate'), UNESCO('Ruins of Kilwa Kisiwani and Songo Mnara', 144), { title: 'Horton & Middleton, The Swahili (2000)', url: 'https://en.wikipedia.org/wiki/Swahili_people#Further_reading' }],
  edgeGrace: 6,
};

const buganda = {
  id: 'buganda',
  name: 'Kingdom of Buganda',
  color: '#4D7C0F',
  type: 'state',
  description:
    'A Ganda kingdom on the north-west shore of Lake Victoria, ruled by the Kabaka. Small beside its rival Bunyoro at first, it grew from the 17th century with a strong centralised court and war canoes on the lake, and by 1800 was the leading power of the region. From 1815 the nations layer shows it; it became a British protectorate in 1894.',
  keyYears: [1400, 1700, 1800],
  overlays: [
    K(1400, 'Early Buganda (Kintu traditions)', [R('buganda', 'Buganda heartland', BUGANDA_CORE)]),
    K(1700, 'Buganda expanding against Bunyoro', [R('buganda', 'Buganda', BUGANDA_MID)]),
    K(1800, 'Buganda the leading lake kingdom', [R('buganda', 'Buganda', BUGANDA_WIDE)]),
  ],
  timelineItemIds: ['buganda'],
  confidence: {
    level: 'conjectural',
    reason: 'Before Speke’s visit (1862) Buganda’s history comes from royal oral king-lists; dates before about 1700 rest on counting reigns and are uncertain by decades.',
  },
  sources: [W('Buganda'), W('Kabaka of Buganda'), { title: 'Kiwanuka, A History of Buganda (1972)', url: 'https://en.wikipedia.org/wiki/Buganda#Further_reading' }],
  edgeGrace: 10,
};

/** All inland-Africa polities; ids already on the globe are replaced, the rest appended. */
export const inlandAfricaPolities = [
  ghana, mali, songhai, kanem, hausa, sokoto, benin, oyo, asante,
  kongo, luba, lunda, greatZimbabwe, mutapa, axum, zagwe, ethiopia, swahili, buganda,
];
