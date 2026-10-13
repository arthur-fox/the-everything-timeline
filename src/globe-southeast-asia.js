/**
 * Day 59 — Southeast Asia on the globe (Phase 4c step 6.3), about 100–1815 CE.
 *
 * Before this the globe had three schematic shapes (Khmer, Majapahit, Srivijaya). This module
 * redraws those and adds Funan, Chenla, Champa, Đại Việt, Pagan, Ava, Toungoo, Konbaung,
 * Sukhothai, Ayutthaya → Thonburi/Rattanakosin Siam, Lan Na, Lan Xang, Medang (Hindu Mataram),
 * the Mataram Sultanate, Malacca, Johor, Aceh, Brunei, Tondo, Sulu and Maguindanao. Each has
 * dated keyframes, era names, sources and an honest confidence level. From 1815 the nations
 * layer takes over (Konbaung Burma, Siam, Cambodia, Nguyễn Vietnam, the Dutch and Spanish
 * colonies … in globe-nations-table-1815.js).
 *
 * Mainland and island states were mandalas — circles of tribute around a court — not bounded
 * territories. Rings are the core plus regularly tributary zones from inscriptions, Chinese
 * annals, court chronicles and European reports. Maritime powers are drawn as coasts and ports,
 * never as filled sea. Shapes live in the lazy globe chunk (docs/DATA.md).
 */

const A = 'simplified';
const R = (id, name, ring) => ({ id, name, ring });
const K = (year, label, regions, extra = {}) => ({ year, label, approximation: A, regions, ...extra });
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${title.replace(/ /g, '_')}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}/` });
const CHS = { title: 'Tarling (ed.), The Cambridge History of Southeast Asia, vol. 1 (1992)', url: 'https://doi.org/10.1017/CHOL9780521355056' };
const LIEBERMAN = { title: 'Lieberman, Strange Parallels: Southeast Asia in Global Context, c. 800–1830 (2003)', url: 'https://doi.org/10.1017/CBO9780511652349' };

const CONF = {
  early: {
    level: 'conjectural',
    reason: 'Known mostly from Chinese annals, a few Sanskrit and Khmer inscriptions and archaeology (Óc Eo, Sambor Prei Kuk); the extent of these early mandalas is a scholarly reconstruction.',
  },
  mandala: {
    level: 'approximate',
    reason: 'A mandala state: a core around the capital plus tributary rulers whose loyalty shifted. Known from inscriptions, court chronicles and Chinese records; the outer ring is a zone of tribute, drawn roughly.',
  },
  chronicle: {
    level: 'approximate',
    reason: 'Well documented by royal chronicles, Chinese records and (after 1500) European reports; frontier provinces and vassals changed often and are drawn as rough regions.',
  },
  maritime: {
    level: 'approximate',
    reason: 'A port-polity: it ruled harbours, rivers and sea lanes more than hinterland. Drawn as the coasts and islands known from chronicles, Chinese and European reports — never as filled sea.',
  },
  islands: {
    level: 'conjectural',
    reason: 'Pre-Spanish Philippine polities are known from a few documents (the Laguna Copperplate, Chinese notices, early Spanish accounts) and tarsilas (genealogies); their reach beyond the river mouths is uncertain.',
  },
};

// ---- Mekong: Funan, Chenla, Khmer -------------------------------------------------------

const FUNAN_CORE = [[104.0, 9.0], [103.8, 11.5], [105.5, 12.5], [106.8, 11.5], [106.6, 9.6], [105.2, 8.6], [104.0, 9.0]];
const FUNAN_PEAK = [[102.5, 10.5], [103.0, 12.8], [105.8, 13.5], [107.0, 11.5], [106.6, 9.6], [105.2, 8.6], [103.5, 9.2], [102.5, 10.5]];

const CHENLA_EARLY = [[103.5, 12.5], [103.8, 15.5], [105.8, 16.0], [106.6, 14.0], [106.5, 11.6], [105.0, 11.0], [103.5, 12.5]];
const CHENLA_WIDE = [[102.5, 11.0], [102.8, 15.8], [105.5, 17.0], [107.0, 14.5], [106.8, 10.0], [105.0, 8.8], [103.5, 9.8], [102.5, 11.0]];

const KHMER_802 = [[102.8, 12.0], [103.2, 14.8], [105.5, 15.2], [106.5, 13.0], [106.2, 10.5], [104.8, 9.5], [103.5, 10.2], [102.8, 12.0]];
const KHMER_1000 = [[101.5, 12.5], [101.8, 15.8], [104.5, 17.2], [106.5, 15.5], [107.0, 12.0], [106.6, 9.5], [105.0, 8.6], [103.0, 10.0], [101.5, 12.5]];
const KHMER_PEAK = [
  [99.5, 12.5], [99.8, 16.0], [102.0, 18.2], [104.8, 18.0], [106.8, 15.5], [107.6, 13.5],
  [107.0, 10.5], [106.6, 9.3], [105.0, 8.6], [102.0, 10.5], [99.5, 12.5],
];
const KHMER_1300 = [[101.5, 12.5], [102.0, 15.5], [104.8, 16.0], [106.5, 14.0], [106.8, 10.5], [105.0, 8.6], [103.0, 10.0], [101.5, 12.5]];
const KHMER_LATE = [[102.5, 12.0], [103.0, 14.3], [105.5, 14.5], [106.5, 12.5], [106.5, 10.3], [104.8, 9.5], [103.3, 10.4], [102.5, 12.0]];

// ---- Vietnam coast: Champa, Đại Việt -----------------------------------------------------

const CHAMPA_FULL = [
  [106.6, 17.0], [107.3, 17.8], [108.4, 16.0], [109.35, 13.5], [109.3, 11.8], [108.6, 11.0],
  [108.0, 11.6], [108.0, 13.5], [107.2, 15.5], [106.6, 17.0],
];
const CHAMPA_1306 = [[107.6, 16.0], [108.3, 16.1], [109.35, 13.5], [109.3, 11.8], [108.6, 11.0], [108.0, 11.6], [108.0, 13.5], [107.6, 16.0]];
const CHAMPA_SOUTH = [[107.9, 11.2], [108.5, 12.8], [109.3, 12.8], [109.3, 11.6], [108.6, 10.9], [107.9, 11.2]];
const PANDURANGA = [[108.0, 11.0], [108.3, 12.0], [109.2, 11.9], [109.0, 11.0], [108.4, 10.8], [108.0, 11.0]];

const DV_1010 = [[104.8, 21.0], [105.5, 22.5], [107.5, 21.5], [106.8, 20.0], [105.8, 19.0], [105.0, 19.8], [104.8, 21.0]];
const DV_1100 = [[104.0, 21.0], [105.0, 22.8], [107.8, 21.6], [106.8, 20.0], [106.2, 18.2], [105.2, 18.2], [104.3, 19.5], [104.0, 21.0]];
const DV_1306 = [[103.5, 21.5], [104.5, 22.8], [107.8, 21.6], [106.8, 20.0], [107.4, 16.2], [106.8, 16.5], [105.0, 18.5], [103.8, 19.8], [103.5, 21.5]];
const DV_1471 = [
  [103.5, 21.5], [104.5, 22.8], [107.8, 21.6], [106.8, 20.0], [107.6, 16.6], [108.9, 14.5],
  [109.2, 13.6], [108.2, 13.8], [107.4, 15.5], [106.2, 17.0], [105.0, 18.5], [103.8, 19.8], [103.5, 21.5],
];
const GIA_DINH = [[104.6, 10.4], [106.0, 11.4], [107.2, 10.6], [106.6, 9.4], [105.0, 8.6], [104.6, 10.4]];

// ---- Burma: Pagan, Ava, Toungoo, Konbaung ------------------------------------------------

const PAGAN_CORE = [[94.0, 20.0], [94.3, 22.2], [95.8, 22.5], [96.3, 21.0], [95.5, 19.8], [94.0, 20.0]];
const PAGAN_PEAK = [
  [93.5, 19.0], [94.0, 23.5], [96.5, 24.0], [97.5, 21.0], [97.8, 17.0], [97.0, 15.5],
  [96.0, 16.0], [95.0, 15.8], [94.5, 17.5], [93.5, 19.0],
];
const AVA = [[94.2, 20.5], [94.5, 23.8], [96.5, 24.0], [97.0, 21.0], [96.0, 19.5], [94.2, 20.5]];
const TOUNGOO_EARLY = [[95.0, 17.0], [95.5, 19.5], [96.5, 20.5], [97.2, 18.5], [97.6, 16.0], [96.5, 15.6], [95.2, 15.9], [95.0, 17.0]];
const TOUNGOO_PEAK = [
  [93.5, 17.0], [94.0, 24.5], [97.5, 25.0], [100.5, 21.5], [103.5, 19.5], [102.5, 17.5],
  [101.5, 14.0], [100.5, 12.5], [99.0, 10.5], [98.3, 12.5], [97.6, 16.0], [95.0, 15.8], [93.5, 17.0],
];
const BURMA = [[93.5, 17.0], [94.0, 24.5], [97.5, 25.0], [99.5, 21.0], [98.8, 17.0], [97.8, 15.5], [95.0, 15.8], [93.5, 17.0]];
const BURMA_TENASSERIM = [
  [93.5, 17.0], [94.0, 24.5], [97.5, 25.0], [99.5, 21.0], [98.8, 17.0], [99.2, 12.0],
  [98.4, 10.0], [98.0, 13.5], [97.6, 16.0], [95.0, 15.8], [93.5, 17.0],
];
const ARAKAN = [[92.3, 20.8], [92.8, 21.6], [93.65, 20.2], [93.4, 17.6], [92.9, 18.4], [92.3, 20.8]];

// ---- Thai and Lao kingdoms ---------------------------------------------------------------

const SUKHOTHAI_CORE = [[99.0, 16.5], [99.2, 17.8], [100.4, 17.8], [100.6, 16.5], [99.8, 16.0], [99.0, 16.5]];
const SUKHOTHAI_PEAK = [[98.5, 15.5], [98.8, 18.5], [100.8, 18.5], [101.0, 16.0], [100.0, 15.0], [98.5, 15.5]];

const AYUT_1351 = [[99.5, 13.0], [99.8, 15.5], [101.0, 15.8], [101.5, 13.5], [100.6, 12.6], [99.5, 13.0]];
const AYUT_1450 = [[98.8, 11.5], [98.5, 17.5], [100.8, 18.0], [102.0, 16.5], [102.5, 13.5], [101.5, 12.0], [100.0, 10.0], [99.0, 10.0], [98.8, 11.5]];
const AYUT_PEAK = [
  [98.3, 8.0], [98.5, 17.5], [100.8, 18.0], [102.5, 16.5], [103.0, 14.0], [102.0, 12.0],
  [100.2, 10.5], [100.5, 7.5], [99.5, 6.8], [98.3, 8.0],
];
const SIAM_1800 = [
  [98.3, 8.0], [98.3, 18.0], [100.2, 20.4], [101.5, 18.0], [104.5, 17.5], [105.5, 15.0],
  [103.0, 13.5], [102.0, 12.0], [100.2, 10.5], [100.5, 7.5], [99.5, 6.8], [98.3, 8.0],
];

const LAN_NA = [[98.0, 18.0], [98.3, 20.3], [100.2, 20.4], [100.8, 19.0], [100.0, 17.6], [98.0, 18.0]];

const LAN_XANG = [
  [100.8, 19.0], [101.0, 21.5], [102.5, 22.4], [104.5, 20.5], [106.0, 17.5], [105.8, 15.0],
  [104.5, 14.5], [103.0, 17.5], [101.5, 17.8], [100.8, 19.0],
];
const LUANG_PRABANG = [[100.8, 19.0], [101.0, 21.5], [102.5, 22.4], [103.5, 20.8], [102.5, 19.0], [100.8, 19.0]];
const VIENTIANE = [[101.8, 17.5], [102.3, 18.9], [104.5, 18.8], [105.3, 17.0], [103.5, 16.8], [101.8, 17.5]];
const CHAMPASAK = [[104.8, 14.5], [105.0, 16.5], [106.2, 16.0], [106.0, 14.3], [104.8, 14.5]];

// ---- Islands: Srivijaya, Medang, Majapahit, Mataram --------------------------------------

const SV_PALEMBANG = [[102.8, -4.6], [103.2, -2.5], [104.4, -1.6], [106.0, -3.0], [105.6, -4.4], [104.0, -5.2], [102.8, -4.6]];
const SV_JAMBI = [[101.6, -1.8], [102.0, -0.4], [103.6, -0.6], [104.4, -1.6], [103.2, -2.5], [101.6, -1.8]];
const SV_MALAY = [[101.0, 2.8], [101.3, 4.5], [103.4, 4.8], [104.2, 1.6], [103.4, 1.3], [102.0, 1.9], [101.0, 2.8]];
const SV_KEDAH = [[100.2, 5.2], [100.3, 6.5], [101.0, 6.4], [101.0, 5.2], [100.6, 4.9], [100.2, 5.2]];
const SV_CHAIYA = [[98.8, 8.2], [99.0, 9.8], [99.6, 9.6], [100.0, 8.4], [99.5, 7.8], [98.8, 8.2]];
const SV_DHARMASRAYA = [[100.8, -1.8], [101.0, -0.6], [102.0, -0.4], [101.6, -1.8], [101.2, -2.2], [100.8, -1.8]];

const JAVA_CENTRAL = [[109.5, -7.9], [109.8, -7.0], [111.0, -6.8], [111.3, -8.1], [110.3, -8.2], [109.5, -7.9]];
const JAVA_EAST = [[111.2, -8.2], [111.5, -7.2], [112.8, -6.9], [113.0, -8.3], [112.0, -8.4], [111.2, -8.2]];
const JAVA_EAST_FULL = [[111.0, -8.2], [111.3, -7.0], [113.0, -6.9], [114.4, -7.7], [114.0, -8.5], [112.0, -8.4], [111.0, -8.2]];
const JAVA_ALL = [
  [105.5, -6.8], [106.0, -5.9], [108.5, -6.3], [110.5, -6.4], [112.5, -6.8], [114.4, -7.7],
  [114.0, -8.5], [111.0, -8.2], [108.0, -7.7], [106.0, -7.4], [105.5, -6.8],
];
const BALI = [[114.5, -8.2], [115.2, -8.05], [115.7, -8.4], [115.2, -8.8], [114.6, -8.4], [114.5, -8.2]];
const MADURA = [[112.7, -7.1], [113.0, -6.9], [114.1, -6.95], [114.0, -7.2], [113.0, -7.25], [112.7, -7.1]];

const MATARAM_CORE = [[109.8, -8.0], [110.0, -7.0], [111.2, -6.8], [111.6, -8.2], [110.5, -8.2], [109.8, -8.0]];
const MATARAM_PEAK = [
  [107.2, -7.6], [107.4, -6.5], [109.0, -6.7], [110.5, -6.4], [112.5, -6.8], [113.8, -7.6],
  [113.5, -8.3], [111.0, -8.2], [108.5, -7.8], [107.2, -7.6],
];
const MATARAM_1680 = [[108.5, -7.6], [108.8, -7.0], [110.0, -7.0], [112.0, -7.3], [112.6, -8.2], [110.5, -8.2], [108.5, -7.6]];
const MATARAM_SPLIT = [[109.8, -8.0], [110.0, -7.2], [111.2, -7.2], [111.4, -8.2], [110.5, -8.2], [109.8, -8.0]];

// ---- Straits and Borneo: Malacca, Johor, Aceh, Brunei -----------------------------------

const MALACCA_CORE = [[101.6, 2.6], [102.0, 3.2], [102.8, 2.8], [102.6, 2.0], [102.1, 1.9], [101.6, 2.6]];
const MALACCA_PEN = [[100.4, 3.5], [101.0, 5.0], [103.4, 5.2], [104.2, 1.6], [103.4, 1.3], [102.0, 1.9], [100.4, 3.5]];
const MALACCA_SUMATRA = [[100.5, 1.8], [101.5, 2.2], [103.0, 0.5], [103.8, -0.8], [102.6, -0.6], [100.5, 1.8]];
const JOHOR = [[102.8, 2.6], [103.2, 2.9], [104.3, 2.2], [104.2, 1.4], [103.4, 1.3], [102.8, 2.6]];
const JOHOR_WIDE = [[102.6, 2.8], [103.0, 3.8], [103.5, 3.9], [104.3, 2.2], [104.2, 1.4], [103.4, 1.3], [102.6, 2.8]];
const RIAU = [[104.0, 0.6], [104.1, 1.1], [104.6, 1.1], [104.7, 0.8], [104.3, 0.4], [104.0, 0.6]];

const ACEH_CORE = [[95.2, 5.5], [95.6, 5.7], [97.5, 5.2], [97.2, 4.2], [96.0, 4.4], [95.2, 5.5]];
const ACEH_PEAK = [[95.2, 5.5], [95.6, 5.7], [97.5, 5.2], [99.0, 3.8], [100.0, 2.5], [99.0, 0.0], [98.0, 1.5], [96.5, 3.0], [95.2, 5.5]];
const ACEH_LATE = [[95.2, 5.5], [95.6, 5.7], [97.5, 5.2], [98.2, 4.0], [97.0, 3.0], [96.0, 4.0], [95.2, 5.5]];

const BRUNEI_CORE = [[114.1, 4.5], [114.6, 5.0], [115.4, 5.0], [115.3, 4.3], [114.6, 4.1], [114.1, 4.5]];
const BRUNEI_PEAK = [
  [109.6, 1.8], [111.0, 2.6], [113.0, 3.4], [115.3, 5.6], [116.8, 7.0], [117.8, 6.0],
  [117.3, 5.0], [115.5, 4.2], [113.5, 2.8], [111.0, 1.3], [109.6, 1.8],
];
const BRUNEI_1700 = [[111.5, 2.5], [113.0, 3.4], [115.3, 5.6], [116.3, 6.5], [116.5, 5.8], [115.5, 4.4], [113.5, 2.8], [111.6, 1.9], [111.5, 2.5]];
const BRUNEI_1800 = [[113.0, 3.2], [114.0, 4.4], [115.3, 5.4], [115.8, 5.0], [115.3, 4.3], [114.2, 3.6], [113.0, 3.2]];

// ---- Philippines: Tondo, Sulu, Maguindanao -----------------------------------------------

const TONDO = [[120.6, 14.5], [120.8, 15.0], [121.2, 14.9], [121.5, 14.2], [121.1, 14.1], [120.8, 14.3], [120.6, 14.5]];
const JOLO = [[120.8, 5.9], [121.0, 6.2], [121.4, 6.1], [121.3, 5.8], [121.0, 5.75], [120.8, 5.9]];
const TAWI = [[119.8, 5.0], [120.1, 5.3], [120.3, 5.1], [120.0, 4.9], [119.8, 5.0]];
const SABAH_NE = [[116.5, 6.5], [117.2, 7.0], [118.5, 6.0], [119.2, 5.2], [118.0, 4.4], [117.0, 5.0], [116.5, 6.5]];
const MAGUINDANAO_CORE = [[124.0, 6.8], [124.3, 7.6], [125.0, 7.5], [124.9, 6.6], [124.4, 6.3], [124.0, 6.8]];
const MAGUINDANAO_PEAK = [[123.3, 7.0], [123.8, 8.0], [125.0, 8.0], [125.6, 6.8], [125.2, 5.8], [124.2, 6.0], [123.3, 7.0]];

// ---- Entities ----------------------------------------------------------------------------

const E = (o) => ({ edgeGrace: 10, ...o });

const funan = E({
  id: 'funan', name: 'Funan', color: '#0F766E', type: 'state',
  description: 'The first great state of mainland Southeast Asia, known from Chinese envoys of the 3rd century. Its port at Óc Eo in the Mekong delta traded Roman, Indian and Chinese goods; its kings adopted Sanskrit names and Indian religions. Chenla, once its vassal, absorbed it in the 6th century.',
  keyYears: [100, 250, 400, 540],
  overlays: [
    K(100, 'Early Funan (Mekong delta)', [R('funan', 'Mekong delta', FUNAN_CORE)]),
    K(250, 'Fan Shiman’s expansion', [R('funan', 'Funan', FUNAN_PEAK)]),
    K(400, 'Kaundinya II era', [R('funan', 'Funan', FUNAN_PEAK)]),
    K(540, 'Funan absorbed by Chenla', [R('funan', 'Funan remnant', FUNAN_CORE)]),
  ],
  timelineItemIds: ['funan'], confidence: CONF.early,
  sources: [W('Funan'), W('Óc Eo'), CHS],
});

const chenla = E({
  id: 'chenla', name: 'Chenla', color: '#14B8A6', type: 'state',
  description: 'A Khmer kingdom on the middle Mekong (Chinese “Zhenla”) that took over Funan in the 6th century, with a capital at Isanapura (Sambor Prei Kuk). Chinese sources say it split into “Land Chenla” and “Water Chenla” around 707. Jayavarman II reunified the Khmer lands in 802.',
  nameAt: [[550, 'Chenla'], [707, 'Chenla (Land and Water)']],
  keyYears: [560, 620, 707, 790],
  overlays: [
    K(560, 'Chenla takes over Funan', [R('chenla', 'Middle Mekong', CHENLA_EARLY)]),
    K(620, 'Isanavarman’s Chenla', [R('chenla', 'Chenla', CHENLA_WIDE)]),
    K(707, 'Split into Land and Water Chenla', [R('chenla', 'Land and Water Chenla', CHENLA_WIDE)]),
    K(790, 'Before Jayavarman II', [R('chenla', 'Chenla', CHENLA_EARLY)]),
  ],
  timelineItemIds: ['chenla'], confidence: CONF.early,
  sources: [W('Chenla'), UNESCO('Sambor Prei Kuk', 1532), CHS],
  edgeGrace: 8,
});

const khmer = E({
  id: 'khmer-empire', name: 'Khmer Empire', color: '#FB7185', type: 'empire',
  description: 'From 802, when Jayavarman II proclaimed himself universal king, the Khmer ruled from Angkor, building huge temples and reservoirs. Suryavarman II built Angkor Wat (12th c.) and Jayavarman VII, after the Cham sack of 1177, built Angkor Thom and reached the largest extent. Thai pressure grew and Ayutthaya took Angkor in 1431.',
  nameAt: [[802, 'Khmer Empire (Angkor)']],
  keyYears: [802, 1000, 1150, 1200, 1300, 1431],
  overlays: [
    K(802, 'Jayavarman II: the Angkor kingdom', [R('khmer', 'Angkor and the Tonle Sap', KHMER_802)]),
    K(1000, 'Suryavarman I', [R('khmer', 'Khmer Empire', KHMER_1000)]),
    K(1150, 'Angkor Wat built', [R('khmer', 'Khmer Empire', KHMER_1000)]),
    K(1200, 'Jayavarman VII at the height', [R('khmer', 'Khmer Empire', KHMER_PEAK)]),
    K(1300, 'Zhou Daguan’s visit', [R('khmer', 'Khmer Empire', KHMER_1300)]),
    K(1431, 'Ayutthaya takes Angkor', [R('khmer', 'Khmer core', KHMER_LATE)]),
  ],
  timelineItemIds: ['khmer'], confidence: CONF.mandala,
  sources: [W('Khmer Empire'), UNESCO('Angkor', 668), W('Jayavarman VII'), CHS],
});

const champa = E({
  id: 'champa', name: 'Champa', color: '#C81E4A', type: 'state',
  description: 'A group of Cham principalities along the central Vietnamese coast — Indrapura, Amaravati, Vijaya, Kauthara and Panduranga — rich from sea trade, with Hindu temples at Mỹ Sơn. Champa sacked Angkor in 1177 but lost ground steadily to Đại Việt moving south: Vijaya fell in 1471, and the last Cham principality, Panduranga, survived as a Vietnamese vassal into the 1830s.',
  nameAt: [[192, 'Champa (Lâm Ấp)'], [800, 'Champa'], [1471, 'Champa (Panduranga)']],
  keyYears: [200, 400, 1000, 1306, 1471, 1700, 1800],
  overlays: [
    K(200, 'Lâm Ấp breaks from Han rule', [R('champa', 'Central coast', CHAMPA_1306)]),
    K(400, 'Cham principalities', [R('champa', 'Champa', CHAMPA_FULL)]),
    K(1000, 'Capital moves south to Vijaya', [R('champa', 'Champa', CHAMPA_FULL)]),
    K(1306, 'Thuận Hóa ceded to Đại Việt', [R('champa', 'Champa', CHAMPA_1306)]),
    K(1471, 'Vijaya falls; southern Champa', [R('champa', 'Kauthara and Panduranga', CHAMPA_SOUTH)]),
    K(1700, 'Panduranga under the Nguyễn', [R('champa', 'Panduranga', PANDURANGA)]),
    K(1800, 'Panduranga (vassal)', [R('champa', 'Panduranga', PANDURANGA)]),
  ],
  timelineItemIds: ['champa'], confidence: CONF.mandala,
  sources: [W('Champa'), UNESCO('My Son Sanctuary', 949), CHS],
});

const daiViet = E({
  id: 'dai-viet', name: 'Đại Việt', color: '#EF4444', type: 'state',
  description: 'The Vietnamese kingdom of the Red River delta, independent of China from 939. The Lý moved the capital to Thăng Long (Hanoi) in 1010; the Trần beat three Mongol invasions; Lê Lợi drove out the Ming in 1428. Đại Việt pushed south (nam tiến) at Champa’s expense, and from the 1600s was split between the Trịnh lords in the north and the Nguyễn in the south, who settled the Mekong delta. Gia Long reunited it in 1802.',
  nameAt: [[1009, 'Đại Việt (Lý)'], [1225, 'Đại Việt (Trần)'], [1428, 'Đại Việt (Lê)'], [1600, 'Đại Việt (Trịnh and Nguyễn lords)'], [1802, 'Vietnam (Nguyễn)']],
  keyYears: [1010, 1100, 1306, 1471, 1700, 1802],
  overlays: [
    K(1010, 'Lý dynasty at Thăng Long', [R('north', 'Red River delta', DV_1010)]),
    K(1100, 'Lý Đại Việt', [R('north', 'Đại Việt', DV_1100)]),
    K(1306, 'Trần gains Thuận Hóa', [R('north', 'Đại Việt', DV_1306)]),
    K(1471, 'Lê Thánh Tông conquers Vijaya', [R('north', 'Đại Việt', DV_1471)]),
    K(1700, 'Trịnh north, Nguyễn south', [R('north', 'Đại Việt', DV_1471), R('gia-dinh', 'Gia Định (Mekong delta)', GIA_DINH)]),
    K(1802, 'Gia Long reunites Vietnam', [R('north', 'Vietnam', DV_1471), R('gia-dinh', 'Gia Định', GIA_DINH)]),
  ],
  timelineItemIds: ['dai-viet'], confidence: CONF.chronicle,
  sources: [W('Đại Việt'), W('Nam tiến'), W('Lê Lợi'), CHS],
});

const pagan = E({
  id: 'pagan-kingdom', name: 'Pagan Kingdom', color: '#C2410C', type: 'state',
  description: 'The first state to unite the Irrawaddy valley. Anawrahta (1044–77) took the Mon city of Thaton and spread Theravada Buddhism; his successors built over 10,000 temples on the plain of Pagan. Mongol invasions from 1277 and internal decline broke the kingdom by about 1297.',
  keyYears: [900, 1057, 1100, 1250, 1290],
  overlays: [
    K(900, 'Early Pagan (dry zone)', [R('pagan', 'Pagan and the dry zone', PAGAN_CORE)]),
    K(1057, 'Anawrahta takes Thaton', [R('pagan', 'Pagan Kingdom', PAGAN_PEAK)]),
    K(1100, 'Kyansittha’s Pagan', [R('pagan', 'Pagan Kingdom', PAGAN_PEAK)]),
    K(1250, 'Late Pagan', [R('pagan', 'Pagan Kingdom', PAGAN_PEAK)]),
    K(1290, 'After the Mongol invasions', [R('pagan', 'Pagan remnant', PAGAN_CORE)]),
  ],
  timelineItemIds: ['pagan-kingdom'], confidence: CONF.chronicle,
  sources: [W('Pagan Kingdom'), UNESCO('Bagan', 1588), LIEBERMAN],
});

const ava = E({
  id: 'ava-kingdom', name: 'Ava Kingdom', color: '#EA580C', type: 'state',
  description: 'After Pagan fell, Upper Burma was ruled from Ava (Inwa), founded in 1365. Ava fought the Mon kingdom of Hanthawaddy (Pegu) in the Forty Years’ War and was overrun by the Shan confederation in 1527; Toungoo reunified Burma soon after.',
  keyYears: [1365, 1450, 1527],
  overlays: [
    K(1365, 'Ava founded', [R('ava', 'Upper Burma', AVA)]),
    K(1450, 'Ava kingdom', [R('ava', 'Upper Burma', AVA)]),
    K(1527, 'Taken by the Shan confederation', [R('ava', 'Ava', PAGAN_CORE)]),
  ],
  timelineItemIds: ['ava-kingdom'], confidence: CONF.chronicle,
  sources: [W('Ava Kingdom'), W('Forty Years’ War'), LIEBERMAN],
  edgeGrace: 6,
});

const toungoo = E({
  id: 'toungoo-dynasty', name: 'Toungoo Burma', color: '#F59E0B', type: 'empire',
  description: 'From the small fort-town of Toungoo, Tabinshwehti and Bayinnaung built the largest empire in Southeast Asian history in the mid-16th century, taking Pegu, Ava, the Shan states, Lan Na, Ayutthaya (1564, 1569) and Lan Xang. It collapsed after Bayinnaung died in 1581; the Restored Toungoo kings ruled Burma from Ava until the Mon took it in 1752.',
  nameAt: [[1510, 'Toungoo Burma'], [1599, 'Restored Toungoo Burma']],
  keyYears: [1540, 1570, 1600, 1650, 1740],
  overlays: [
    K(1540, 'Tabinshwehti takes Pegu', [R('toungoo', 'Toungoo and Lower Burma', TOUNGOO_EARLY)]),
    K(1570, 'Bayinnaung’s empire', [R('toungoo', 'Toungoo Empire with vassals', TOUNGOO_PEAK)]),
    K(1600, 'Collapse and restoration', [R('toungoo', 'Burma', BURMA)]),
    K(1650, 'Restored Toungoo at Ava', [R('toungoo', 'Burma', BURMA)]),
    K(1740, 'Mon revolt in the south', [R('toungoo', 'Upper Burma', AVA)]),
  ],
  timelineItemIds: ['toungoo-dynasty'], confidence: CONF.chronicle,
  sources: [W('Toungoo dynasty'), W('Bayinnaung'), LIEBERMAN],
  edgeGrace: 8,
});

const konbaung = E({
  id: 'konbaung-dynasty', name: 'Konbaung Burma', color: '#B45309', type: 'empire',
  description: 'Alaungpaya reunified Burma from 1752 and founded Rangoon. His sons destroyed Ayutthaya (1767), beat four Qing invasions (1765–69) and annexed Arakan (1785). From 1815 the nations layer shows Konbaung Burma; Britain took it in three wars (1824–1885).',
  keyYears: [1755, 1767, 1785, 1815],
  overlays: [
    K(1755, 'Alaungpaya reunifies Burma', [R('burma', 'Burma', BURMA)]),
    K(1767, 'Ayutthaya destroyed; Tenasserim taken', [R('burma', 'Burma', BURMA_TENASSERIM)]),
    K(1785, 'Arakan annexed', [R('burma', 'Burma', BURMA_TENASSERIM), R('arakan', 'Arakan', ARAKAN)]),
    K(1815, 'Konbaung Burma', [R('burma', 'Burma', BURMA_TENASSERIM), R('arakan', 'Arakan', ARAKAN)]),
  ],
  timelineItemIds: ['konbaung-dynasty'], confidence: CONF.chronicle,
  sources: [W('Konbaung dynasty'), W('Alaungpaya'), W('Sino-Burmese War (1765–1769)'), LIEBERMAN],
  edgeGrace: 4,
});

const sukhothai = E({
  id: 'sukhothai', name: 'Sukhothai', color: '#22C55E', type: 'state',
  description: 'A Thai kingdom that broke from Khmer rule about 1238. Under Ram Khamhaeng (c. 1279–98) it spread across the Chao Phraya basin; the famous Ram Khamhaeng inscription is the oldest known Thai writing (its date is debated). It became a vassal of Ayutthaya and was absorbed by 1438.',
  keyYears: [1250, 1290, 1350, 1430],
  overlays: [
    K(1250, 'Sukhothai breaks from Angkor', [R('sukhothai', 'Sukhothai', SUKHOTHAI_CORE)]),
    K(1290, 'Ram Khamhaeng’s kingdom', [R('sukhothai', 'Sukhothai', SUKHOTHAI_PEAK)]),
    K(1350, 'Li Thai’s Sukhothai', [R('sukhothai', 'Sukhothai', SUKHOTHAI_CORE)]),
    K(1430, 'Vassal of Ayutthaya', [R('sukhothai', 'Sukhothai', SUKHOTHAI_CORE)]),
  ],
  timelineItemIds: ['sukhothai'], confidence: CONF.mandala,
  sources: [W('Sukhothai Kingdom'), UNESCO('Historic Town of Sukhothai', 574), W('Ram Khamhaeng Inscription')],
  edgeGrace: 6,
});

const ayutthaya = E({
  id: 'ayutthaya', name: 'Ayutthaya', color: '#16A34A', type: 'empire',
  description: 'Founded in 1351 on an island in the Chao Phraya, Ayutthaya absorbed Sukhothai, took Angkor (1431) and grew into one of Asia’s great trading cities, with Dutch, Japanese, Persian and Chinese quarters. Burma took it in 1569 and destroyed it in 1767. Taksin rallied the Thai at Thonburi; from 1782 the Chakri kings ruled Siam from Bangkok (Rattanakosin).',
  nameAt: [[1351, 'Ayutthaya'], [1768, 'Siam (Thonburi)'], [1782, 'Siam (Rattanakosin)']],
  keyYears: [1351, 1450, 1600, 1700, 1760, 1775, 1800],
  overlays: [
    K(1351, 'U Thong founds Ayutthaya', [R('siam', 'Lower Chao Phraya', AYUT_1351)]),
    K(1450, 'Ayutthaya after taking Angkor', [R('siam', 'Ayutthaya', AYUT_1450)]),
    K(1600, 'Naresuan restores independence', [R('siam', 'Ayutthaya', AYUT_PEAK)]),
    K(1700, 'Ayutthaya, a trading capital', [R('siam', 'Ayutthaya', AYUT_PEAK)]),
    K(1760, 'Before the Burmese conquest', [R('siam', 'Ayutthaya', AYUT_PEAK)]),
    K(1775, 'Taksin’s Thonburi kingdom', [R('siam', 'Siam (Thonburi)', AYUT_PEAK)]),
    K(1800, 'Rattanakosin Siam with Lao vassals', [R('siam', 'Siam', SIAM_1800)]),
  ],
  timelineItemIds: ['ayutthaya', 'rattanakosin'], confidence: CONF.chronicle,
  sources: [W('Ayutthaya Kingdom'), UNESCO('Historic City of Ayutthaya', 576), W('Thonburi Kingdom'), W('Rattanakosin Kingdom (1782–1932)')],
  edgeGrace: 6,
});

const lanNa = E({
  id: 'lan-na', name: 'Lan Na', color: '#84CC16', type: 'state',
  description: 'A northern Thai kingdom founded by Mangrai, who built Chiang Mai in 1296. It flourished as a Buddhist centre under Tilokarat (15th c.), was a Burmese vassal from 1558, and was freed by Siam in the 1770s; from 1800 it is part of Siam on the globe.',
  nameAt: [[1292, 'Lan Na'], [1558, 'Lan Na (Burmese vassal)'], [1775, 'Lan Na (Siamese vassal)']],
  keyYears: [1300, 1450, 1558, 1650, 1775],
  overlays: [
    K(1300, 'Mangrai founds Chiang Mai', [R('lanna', 'Lan Na', LAN_NA)]),
    K(1450, 'Tilokarat’s Lan Na', [R('lanna', 'Lan Na', LAN_NA)]),
    K(1558, 'Taken by Bayinnaung', [R('lanna', 'Lan Na', LAN_NA)]),
    K(1650, 'Under Burma', [R('lanna', 'Lan Na', LAN_NA)]),
    K(1775, 'Freed from Burma by Siam', [R('lanna', 'Lan Na', LAN_NA)]),
  ],
  timelineItemIds: ['lan-na'], confidence: CONF.mandala,
  sources: [W('Lan Na'), W('Mangrai'), W('Chiang Mai')],
  edgeGrace: 6,
});

const lanXang = E({
  id: 'lan-xang', name: 'Lan Xang', color: '#A855F7', type: 'state',
  description: 'The “Land of a Million Elephants”, a Lao kingdom founded by Fa Ngum in 1353 at Luang Prabang. Setthathirath moved the capital to Vientiane in 1560. After King Sourigna Vongsa died, it split into Luang Prabang, Vientiane and Champasak (1707–13), which Siam made vassals in 1779.',
  nameAt: [[1353, 'Lan Xang'], [1707, 'Lao kingdoms (Luang Prabang, Vientiane, Champasak)']],
  keyYears: [1360, 1560, 1690, 1713, 1779],
  overlays: [
    K(1360, 'Fa Ngum’s Lan Xang', [R('lanxang', 'Lan Xang', LAN_XANG)]),
    K(1560, 'Capital moves to Vientiane', [R('lanxang', 'Lan Xang', LAN_XANG)]),
    K(1690, 'Sourigna Vongsa’s golden age', [R('lanxang', 'Lan Xang', LAN_XANG)]),
    K(1713, 'Split into three kingdoms', [R('luang-prabang', 'Luang Prabang', LUANG_PRABANG), R('vientiane', 'Vientiane', VIENTIANE), R('champasak', 'Champasak', CHAMPASAK)]),
    K(1779, 'Siam makes the Lao kingdoms vassals', [R('luang-prabang', 'Luang Prabang', LUANG_PRABANG), R('vientiane', 'Vientiane', VIENTIANE), R('champasak', 'Champasak', CHAMPASAK)]),
  ],
  timelineItemIds: ['lan-xang'], confidence: CONF.mandala,
  sources: [W('Lan Xang'), W('Fa Ngum'), W('Setthathirath')],
});

const srivijaya = E({
  id: 'srivijaya', name: 'Srivijaya', color: '#4338CA', type: 'empire',
  description: 'A Buddhist trading empire based at Palembang that controlled the Strait of Malacca from the late 7th century, known from the Kedukan Bukit inscription (683) and the Chinese pilgrim Yijing. It held ports on both sides of the strait and on the isthmus (Kedah, Chaiya). A Chola naval raid in 1025 broke its hold; the centre moved to Jambi (Malayu) and then upriver to Dharmasraya. Drawn as river and coastal footholds, not a filled sea.',
  nameAt: [[650, 'Srivijaya'], [1080, 'Srivijaya–Malayu (Jambi)'], [1280, 'Malayu (Dharmasraya)']],
  keyYears: [683, 750, 850, 1000, 1025, 1100, 1200, 1300],
  overlays: [
    K(683, 'Srivijaya at Palembang', [R('palembang', 'Palembang (South Sumatra)', SV_PALEMBANG)]),
    K(750, 'Srivijaya controls the strait', [
      R('palembang', 'Palembang', SV_PALEMBANG), R('jambi', 'Jambi (Malayu)', SV_JAMBI), R('kedah', 'Kedah', SV_KEDAH),
    ]),
    K(850, 'Srivijaya and the isthmus ports', [
      R('palembang', 'Palembang', SV_PALEMBANG), R('jambi', 'Jambi', SV_JAMBI), R('malay', 'Malay Peninsula ports', SV_MALAY),
      R('kedah', 'Kedah', SV_KEDAH), R('chaiya', 'Chaiya (Grahi)', SV_CHAIYA),
    ]),
    K(1000, 'Height before the Chola raid', [
      R('palembang', 'Palembang', SV_PALEMBANG), R('jambi', 'Jambi', SV_JAMBI), R('malay', 'Malay Peninsula ports', SV_MALAY),
      R('kedah', 'Kedah', SV_KEDAH), R('chaiya', 'Chaiya (Grahi)', SV_CHAIYA),
    ]),
    K(1025, 'After the Chola raid', [R('palembang', 'Palembang', SV_PALEMBANG), R('jambi', 'Jambi', SV_JAMBI), R('malay', 'Malay ports', SV_MALAY)]),
    K(1100, 'Centre moves to Jambi', [R('jambi', 'Jambi (Malayu)', SV_JAMBI), R('palembang', 'Palembang', SV_PALEMBANG)]),
    K(1200, 'Malayu', [R('jambi', 'Jambi (Malayu)', SV_JAMBI)]),
    K(1300, 'Dharmasraya after Singhasari’s expedition', [R('dharmasraya', 'Dharmasraya (upper Batang Hari)', SV_DHARMASRAYA)]),
  ],
  timelineItemIds: ['srivijaya'], confidence: CONF.maritime,
  sources: [W('Srivijaya'), W('Kedukan Bukit inscription'), W('Chola invasion of Srivijaya'), CHS],
});

const medang = E({
  id: 'medang-kingdom', name: 'Medang (Mataram)', color: '#9333EA', type: 'state',
  description: 'A Javanese kingdom (often called Hindu Mataram) of the Kedu and Prambanan plains. Its Sailendra and Sanjaya kings built Borobudur (c. 800) and Prambanan (c. 850). Around 929, perhaps after an eruption of Merapi, the court moved to East Java; the kingdom collapsed in 1016.',
  keyYears: [732, 825, 900, 929, 1000],
  overlays: [
    K(732, 'Sanjaya’s Mataram', [R('central', 'Central Java', JAVA_CENTRAL)]),
    K(825, 'Borobudur built', [R('central', 'Central Java', JAVA_CENTRAL)]),
    K(900, 'Balitung’s Medang', [R('central', 'Central Java', JAVA_CENTRAL), R('east', 'East Java', JAVA_EAST)]),
    K(929, 'Mpu Sindok moves to East Java', [R('east', 'East Java', JAVA_EAST)]),
    K(1000, 'Dharmawangsa’s Medang', [R('east', 'East Java', JAVA_EAST)]),
  ],
  timelineItemIds: ['medang-kingdom'], confidence: CONF.mandala,
  sources: [W('Mataram Kingdom'), UNESCO('Borobudur Temple Compounds', 592), UNESCO('Prambanan Temple Compounds', 642)],
});

const majapahit = E({
  id: 'majapahit-empire', name: 'Majapahit', color: '#E11D48', type: 'empire',
  description: 'Founded in 1293 in East Java after the Mongol expedition, Majapahit grew under the minister Gajah Mada and King Hayam Wuruk into the strongest power of the archipelago. The court poem Nagarakretagama (1365) lists tributaries from Sumatra to New Guinea; those claims are not drawn — only Java, Madura and Bali, which it really governed. Civil war and the rise of Muslim port states ended it around 1527.',
  keyYears: [1293, 1350, 1389, 1450, 1500, 1527],
  overlays: [
    K(1293, 'Raden Wijaya founds Majapahit', [R('java', 'East Java', JAVA_EAST_FULL)]),
    K(1350, 'Gajah Mada and Hayam Wuruk', [R('java', 'Java', JAVA_ALL), R('madura', 'Madura', MADURA), R('bali', 'Bali', BALI)]),
    K(1389, 'After Hayam Wuruk', [R('java', 'Java', JAVA_ALL), R('madura', 'Madura', MADURA), R('bali', 'Bali', BALI)]),
    K(1450, 'Majapahit after the Regreg war', [R('java', 'East Java', JAVA_EAST_FULL), R('bali', 'Bali', BALI)]),
    K(1500, 'Pressed by Demak', [R('java', 'East Java', JAVA_EAST_FULL)]),
    K(1527, 'Fall to Demak', [R('java', 'East Java remnant', JAVA_EAST)]),
  ],
  timelineItemIds: ['majapahit'], confidence: CONF.chronicle,
  sources: [W('Majapahit'), W('Nagarakretagama'), W('Gajah Mada'), CHS],
  edgeGrace: 6,
});

const mataram = E({
  id: 'mataram-sultanate', name: 'Mataram Sultanate', color: '#7E22CE', type: 'empire',
  description: 'A Muslim Javanese kingdom founded by Senapati in the 1580s near today’s Yogyakarta. Sultan Agung (1613–45) conquered most of Java and twice besieged Dutch Batavia (1628–29). The VOC gained territory in every succession war, and the Treaty of Giyanti (1755) split what was left into Surakarta and Yogyakarta.',
  nameAt: [[1587, 'Mataram Sultanate'], [1755, 'Surakarta and Yogyakarta']],
  keyYears: [1590, 1640, 1680, 1755],
  overlays: [
    K(1590, 'Senapati’s Mataram', [R('mataram', 'Mataram (Kotagede)', MATARAM_CORE)]),
    K(1640, 'Sultan Agung rules most of Java', [R('mataram', 'Mataram', MATARAM_PEAK)]),
    K(1680, 'After the Trunajaya revolt', [R('mataram', 'Mataram', MATARAM_1680)]),
    K(1755, 'Treaty of Giyanti', [R('mataram', 'Surakarta and Yogyakarta', MATARAM_SPLIT)]),
  ],
  timelineItemIds: ['mataram-sultanate'], confidence: CONF.chronicle,
  sources: [W('Mataram Sultanate'), W('Sultan Agung of Mataram'), W('Treaty of Giyanti')],
});

const malacca = E({
  id: 'malacca-sultanate', name: 'Malacca Sultanate', color: '#0EA5E9', type: 'state',
  description: 'Founded about 1400 by Parameswara, a prince from Palembang and Singapura. Backed by Ming China (Zheng He’s fleets called there), Malacca became the great entrepôt of the strait and spread Islam along its trade routes, ruling much of the Malay Peninsula and the east coast of Sumatra. The Portuguese took it in 1511.',
  keyYears: [1405, 1450, 1480, 1511],
  overlays: [
    K(1405, 'Parameswara’s Malacca', [R('malacca', 'Malacca', MALACCA_CORE)]),
    K(1450, 'Malacca grows', [R('malacca', 'Malay Peninsula', MALACCA_PEN)]),
    K(1480, 'Malacca at its height', [R('malacca', 'Malay Peninsula', MALACCA_PEN), R('sumatra', 'East Sumatra coast', MALACCA_SUMATRA)]),
    K(1511, 'Portuguese conquest', [R('malacca', 'Malay Peninsula', MALACCA_PEN)]),
  ],
  timelineItemIds: ['malacca-sultanate'], confidence: CONF.maritime,
  sources: [W('Malacca Sultanate'), W('Malay Annals'), W('Capture of Malacca (1511)')],
  edgeGrace: 4,
});

const johor = E({
  id: 'johor-sultanate', name: 'Johor Sultanate', color: '#38BDF8', type: 'state',
  description: 'The Malacca royal line regrouped at the tip of the peninsula and the Riau islands, fighting Portuguese Malacca and Aceh. Allied with the Dutch it helped take Malacca in 1641, and Johor–Riau remained a major Malay power through the 18th century under its Bugis viceroys.',
  keyYears: [1530, 1650, 1720, 1800],
  overlays: [
    K(1530, 'Johor founded by Malacca’s heirs', [R('johor', 'Johor', JOHOR)]),
    K(1650, 'Johor after Dutch Malacca', [R('johor', 'Johor', JOHOR_WIDE), R('riau', 'Riau islands', RIAU)]),
    K(1720, 'Johor–Riau and the Bugis', [R('johor', 'Johor', JOHOR_WIDE), R('riau', 'Riau islands', RIAU)]),
    K(1800, 'Johor–Riau', [R('johor', 'Johor', JOHOR_WIDE), R('riau', 'Riau islands', RIAU)]),
  ],
  timelineItemIds: ['johor-sultanate'], confidence: CONF.maritime,
  sources: [W('Johor Sultanate'), W('Johor–Riau')],
});

const aceh = E({
  id: 'aceh-sultanate', name: 'Aceh Sultanate', color: '#059669', type: 'state',
  description: 'A Muslim sultanate at the northern tip of Sumatra that rose as Malacca fell, dealing in pepper with the Ottomans and Gujarat. Iskandar Muda (1607–36) ruled both Sumatran coasts and raided the peninsula. It stayed independent until the long Dutch war of 1873–1903.',
  keyYears: [1520, 1630, 1700, 1800],
  overlays: [
    K(1520, 'Ali Mughayat Syah’s Aceh', [R('aceh', 'Aceh', ACEH_CORE)]),
    K(1630, 'Iskandar Muda’s empire', [R('aceh', 'Aceh and the Sumatran coasts', ACEH_PEAK)]),
    K(1700, 'Aceh under the sultanas', [R('aceh', 'Aceh', ACEH_LATE)]),
    K(1800, 'Aceh (pepper trade)', [R('aceh', 'Aceh', ACEH_LATE)]),
  ],
  timelineItemIds: ['aceh-sultanate'], confidence: CONF.maritime,
  sources: [W('Aceh Sultanate'), W('Iskandar Muda'), CHS],
});

const brunei = E({
  id: 'brunei-sultanate', name: 'Brunei Sultanate', color: '#D4A017', type: 'state',
  description: 'A Muslim sultanate on Borneo’s north-west coast. At its height under Bolkiah (early 16th c.) its influence ran along Borneo’s north coast and into the Philippines; Pigafetta, with Magellan’s fleet, described the city in 1521. Civil war and the cession of north-east Borneo to Sulu (1704) shrank it.',
  keyYears: [1400, 1520, 1600, 1700, 1800],
  overlays: [
    K(1400, 'Early Brunei', [R('brunei', 'Brunei Bay', BRUNEI_CORE)]),
    K(1520, 'Bolkiah’s Brunei', [R('brunei', 'North Borneo coast', BRUNEI_PEAK)]),
    K(1600, 'Brunei after the Castilian War', [R('brunei', 'North Borneo coast', BRUNEI_PEAK)]),
    K(1700, 'After the civil war', [R('brunei', 'Brunei', BRUNEI_1700)]),
    K(1800, 'Brunei', [R('brunei', 'Brunei', BRUNEI_1800)]),
  ],
  timelineItemIds: ['brunei-sultanate'], confidence: CONF.maritime,
  sources: [W('Bruneian Empire'), W('Bolkiah'), W('Castilian War')],
});

const tondo = E({
  id: 'tondo', name: 'Tondo and Maynila', color: '#F472B6', type: 'state',
  description: 'River-mouth polities on Manila Bay ruled by lakan and rajah, trading with China and Brunei. The Laguna Copperplate Inscription (900) mentions Tondo. The Spanish under Legazpi took Maynila in 1571 and made it their capital.',
  keyYears: [900, 1400, 1500, 1571],
  overlays: [
    K(900, 'Tondo in the Laguna Copperplate', [R('tondo', 'Manila Bay and Laguna', TONDO)]),
    K(1400, 'Tondo trades with Ming China', [R('tondo', 'Tondo', TONDO)]),
    K(1500, 'Tondo and Maynila', [R('tondo', 'Tondo and Maynila', TONDO)]),
    K(1571, 'Spanish take Maynila', [R('tondo', 'Tondo and Maynila', TONDO)]),
  ],
  timelineItemIds: ['tondo'], confidence: CONF.islands,
  sources: [W('Tondo (historical polity)'), W('Laguna Copperplate Inscription'), W('Maynila (historical polity)')],
  edgeGrace: 4,
});

const sulu = E({
  id: 'sulu-sultanate', name: 'Sulu Sultanate', color: '#E8793A', type: 'state',
  description: 'A Muslim sultanate of the Sulu archipelago founded in the mid-15th century, a hub for pearls, sea cucumber and later slave raiding. It resisted Spain for three centuries and gained north-east Borneo from Brunei in 1704.',
  keyYears: [1450, 1600, 1704, 1800],
  overlays: [
    K(1450, 'Sultanate founded at Jolo', [R('jolo', 'Jolo', JOLO), R('tawi', 'Tawi-Tawi', TAWI)]),
    K(1600, 'Sulu resists Spain', [R('jolo', 'Jolo', JOLO), R('tawi', 'Tawi-Tawi', TAWI)]),
    K(1704, 'North-east Borneo from Brunei', [R('jolo', 'Jolo', JOLO), R('tawi', 'Tawi-Tawi', TAWI), R('sabah', 'North-east Borneo', SABAH_NE)]),
    K(1800, 'Sulu at its height', [R('jolo', 'Jolo', JOLO), R('tawi', 'Tawi-Tawi', TAWI), R('sabah', 'North-east Borneo', SABAH_NE)]),
  ],
  timelineItemIds: ['sulu-sultanate'], confidence: CONF.islands,
  sources: [W('Sultanate of Sulu'), W('Tausug people'), { title: 'Warren, The Sulu Zone 1768–1898 (1981)', url: 'https://en.wikipedia.org/wiki/Sultanate_of_Sulu#Further_reading' }],
});

const maguindanao = E({
  id: 'maguindanao-sultanate', name: 'Maguindanao Sultanate', color: '#D9A066', type: 'state',
  description: 'A sultanate of the Cotabato basin in Mindanao, founded by Shariff Kabungsuwan in the early 16th century. Sultan Kudarat (c. 1619–71) led its resistance to the Spanish and made it the strongest power in Mindanao.',
  keyYears: [1520, 1640, 1800],
  overlays: [
    K(1520, 'Shariff Kabungsuwan arrives', [R('maguindanao', 'Cotabato basin', MAGUINDANAO_CORE)]),
    K(1640, 'Sultan Kudarat’s Maguindanao', [R('maguindanao', 'Maguindanao', MAGUINDANAO_PEAK)]),
    K(1800, 'Maguindanao', [R('maguindanao', 'Cotabato basin', MAGUINDANAO_CORE)]),
  ],
  timelineItemIds: ['maguindanao-sultanate'], confidence: CONF.islands,
  sources: [W('Sultanate of Maguindanao'), W('Muhammad Kudarat')],
});

/** All Southeast Asia polities; ids already on the globe are replaced, the rest appended. */
export const southeastAsiaPolities = [
  funan, chenla, khmer, champa, daiViet, pagan, ava, toungoo, konbaung, sukhothai, ayutthaya,
  lanNa, lanXang, srivijaya, medang, majapahit, mataram, malacca, johor, aceh, brunei, tondo, sulu, maguindanao,
];
