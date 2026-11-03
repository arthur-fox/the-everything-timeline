/**
 * Day 77 — Phase 5 country pack 2 (Central Asia), globe backfill: Afghanistan (ROADMAP item 12). The
 * last country of pack 2.
 *
 * Afghanistan had no country timeline (now data/countries/afghanistan.json), and on the globe most of
 * it was empty for most of its history. South of the Hindu Kush (Kabul, Ghazni, Kandahar, Sistan)
 * nothing was drawn between the Sasanian ring (to 620) and Timur (1405): no Turk or Hindu Shahis, no
 * Zunbils, no Saffarids, and — most glaringly — neither the Ghaznavids nor the Ghurids, two of the
 * great empires of the Islamic east, both ruled from here. Herat and Kandahar were empty from the end
 * of the Timurid shape (1506) to 1815, so the Mughal–Safavid contest, the Hotaks who took Isfahan
 * and Ahmad Shah Durrani's empire never showed, and Isfahan itself was empty in 1722–1729. This
 * module draws
 *
 *   the Kabul Shahis (Turk Shahis from c. 665, Hindu Shahis from c. 822) · the Zunbils of Zabul ·
 *   the Saffarids · the Ghaznavids · the Ghurids · the Kartids of Herat · Mughal Kabul · Safavid
 *   Herat and Kandahar · the Hotaks · the Abdalis of Herat · the Durrani Empire
 *
 * and trims two schematic rings that ran over the Hindu Kush: the Parthian Empire's eastern ring
 * (-50 and 50, over Bactria, Kabul and Ghazni, which the Greco-Bactrians, Yuezhi and Kushans held) and
 * the Sasanian Empire's (400, over Kabul and Ghazni, which the Kidarites and Alchon Huns held). From
 * 1815 the nations layer takes over (Durrani Afghanistan, then Afghanistan), so no keyframe here is
 * later than 1815.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"): like the other Central Asia packs,
 * from the shared pieces (globe-central-asia-pieces.js). Afghanistan already had BALKH and HERAT
 * (Day 73) and the hand-drawn KUNDUZ ring (Day 76, globe-pack-tajikistan.js); Day 77 adds BADAKHSHAN,
 * KABUL, GHAZNI, KANDAHAR, SISTAN (Nimruz and Farah), GHOR and BAMYAN (with Daykundi), and around them
 * PESHAWAR, PUNJAB and KASHMIR (Pakistan and India) and ISFAHAN, YAZD, KERMAN and FARS (Iran), cut
 * from Natural Earth provinces in the same topology. Provinces are a coarse stand-in for valleys,
 * oases and tribal lands: these shapes show who held the towns, not borders. The Hazarajat (GHOR,
 * BAMYAN) and the eastern hills were often beyond any ruler's reach.
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';
import { CA_PIECES } from './globe-central-asia-pieces.js';
import { KUNDUZ } from './globe-pack-tajikistan.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const IR = (title, slug) => ({ title: `Encyclopaedia Iranica — ${title}`, url: `https://www.iranicaonline.org/articles/${slug}` });
const NE = { title: 'Natural Earth — 1:10m admin-1 states and provinces (piece outlines)', url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/' };

/**
 * The vale of Kashmir with Muzaffarabad and the Pir Panjal (the Durrani province of Kashmir): the KASHMIR
 * piece clipped to 73.0–75.8°E, 33.2–35.2°N, so Jammu, Ladakh and Gilgit-Baltistan, which the Durranis
 * never ruled, are left out (et-tools day77-kashmir-sikh.py). It keeps the piece's vertices where it
 * meets the PESHAWAR piece.
 */
export const KASHMIR_VALE = [[73.58, 33.91], [73.519, 34.008], [73.4, 34.376], [73.447, 34.558], [73.623, 34.564], [73.758, 34.793], [74.012, 34.876], [74.125, 35.099], [74.521, 35.106], [74.634, 34.94], [74.928, 34.813], [75.161, 34.862], [75.375, 34.371], [75.8, 34.028], [75.8, 33.2], [73.619, 33.2], [73.58, 33.91]];

const HAND = { KUNDUZ, KASHMIR_VALE };
function ringOf(label, names) {
  const ps = names.map((n) => {
    if (HAND[n]) return HAND[n];
    if (!CA_PIECES[n]) throw new Error(`afghanistan pack: no piece ${n}`);
    return CA_PIECES[n];
  });
  return ensureClockwise(ps.length === 1 ? ps[0] : mergeRings(label, ...ps));
}

/**
 * steps: [[year, label, { regionId: [name, pieces] }], …]. Keyframes are written for every step
 * year and the year before it (still the old extent), so each change is a one-year step. A step
 * must have at least one region.
 */
export const AF_STEPS = {};
const RING_CACHE = new Map();
function build(meta, steps) {
  AF_STEPS[meta.id] = steps;
  const years = new Set();
  steps.forEach(([y], i) => {
    years.add(y);
    if (i > 0 && y - 1 > steps[i - 1][0]) years.add(y - 1);
  });
  const overlays = [...years].sort((x, y) => x - y).map((y) => {
    let s = steps[0];
    for (const st of steps) if (st[0] <= y) s = st;
    const regions = Object.entries(s[2]).map(([rid, [name, pieces]]) => {
      const key = `${rid}|${pieces.join(',')}`;
      if (!RING_CACHE.has(key)) RING_CACHE.set(key, ringOf(`${meta.id} ${y} ${rid}`, pieces));
      return { id: rid, name, ring: RING_CACHE.get(key) };
    });
    return { year: y, label: s[1], approximation: A, regions };
  });
  return { edgeGrace: 1, keyYears: steps.map(([y]) => y), type: 'state', ...meta, overlays };
}

// ---- Confidence --------------------------------------------------------------------------------------

const PROVINCES = 'Drawn with modern provinces as stand-ins for valleys, oases and tribal lands, so the edges are rough; the mountains of the Hazarajat and the eastern hills were often beyond any ruler’s reach.';
const CONF = {
  shahis: {
    level: 'conjectural',
    reason: `Known from coins, a few inscriptions, Chinese annals (the Tang investitures), the Arabic historians (al-Baladhuri, al-Tabari, al-Ya'qubi) and al-Biruni, who name the kings, their capitals (Kabul, Udabhandapura) and the campaigns against them, not the limits of their lands; the dates of the dynastic changes (c. 665, c. 680, c. 822) are approximate. ${PROVINCES}`,
  },
  dynasty: {
    level: 'approximate',
    reason: `The Persian and Arabic chroniclers (Bayhaqi, Gardizi, Juzjani, Ibn al-Athir) and Bosworth's studies date the conquests and losses of the main cities closely, but not the edges of the provinces, and vassal rulers in the mountains are drawn as part of the empire. ${PROVINCES}`,
  },
  early: {
    level: 'approximate',
    reason: `Mughal and Safavid chronicles (the Baburnama, the Akbarnama, Iskandar Beg Munshi) and the histories of Nader Shah and Ahmad Shah Durrani date the changes of hands at Kabul, Kandahar, Herat and Isfahan to the year; the countryside between, held by Pashtun, Hazara and Baloch chiefs, is drawn with the cities. ${PROVINCES}`,
  },
};

// ---- Region pieces -----------------------------------------------------------------------------------

const KAB = ['Kabul, Kapisa and Laghman', ['KABUL']];
const GANDHARA = ['Gandhara (Udabhandapura, Purushapura)', ['PESHAWAR']];
const ZABUL = ['Zabulistan (Ghazni)', ['GHAZNI']];
const PUNJAB_SHAHI = ['The Punjab (the Salt Range, Nandana, Lahore)', ['PUNJAB']];

// ---- Polities ----------------------------------------------------------------------------------------

const shahis = build({
  id: 'kabul-shahis', name: 'Kabul Shahis', color: '#C2410C',
  description: 'Around 665 a Turkic dynasty, the Turk Shahis, replaced the Nezak kings of Kabul and Gandhara; the Chinese pilgrim Wukong and the Tang annals call them kings of Jibin, and the Tang invested them (719, 745). They ruled from Kabul in summer and Udabhandapura (Hund) on the Indus in winter. A branch, the Zunbils, broke away around 680 in Zabulistan. Around 822, after the Abbasids forced the Shahi to submit (815), his Brahmin minister Kallar overthrew him and founded the Hindu Shahis. The Saffarid Ya’qub ibn al-Layth took Kabul around 870, and the Hindu Shahis withdrew to Gandhara. Jayapala (c. 964–1002) lost to Mahmud of Ghazni at Peshawar in 1001; his son Anandapala and grandson Trilochanapala fought on from the Salt Range (Nandana, taken by Mahmud c. 1014) and the Punjab until Mahmud annexed Lahore in about 1021, and the last king, Bhimapala, died in 1026. Drawn from 665 to 1020: Kabul, Gandhara and (to 679) Zabulistan, then Gandhara alone, then the Punjab, which is drawn whole although the Shahis’ hold on Lahore and the south is uncertain.',
  nameAt: [[665, 'Turk Shahis'], [822, 'Hindu Shahis']],
  timelineItemIds: ['af-shahis-zunbils'], confidence: CONF.shahis,
  sources: [W('Turk Shahis'), W('Hindu Shahis'), W('Jayapala'), W('Anandapala'), W('Hindu Shahi–Saffarid wars'), NE],
}, [
  [665, 'The Turk Shahis replace the Nezaks at Kabul (c. 665)', { kabul: KAB, gandhara: GANDHARA, zabul: ZABUL }],
  [680, 'The Zunbils break away in Zabulistan (c. 680)', { kabul: KAB, gandhara: GANDHARA }],
  [719, 'The Tang invest the Turk Shahi king (719)', { kabul: KAB, gandhara: GANDHARA }],
  [815, 'The Shahi submits to the caliph al-Ma’mun (815)', { kabul: KAB, gandhara: GANDHARA }],
  [822, 'Kallar overthrows the last Turk Shahi: the Hindu Shahis (c. 822)', { kabul: KAB, gandhara: GANDHARA }],
  [870, 'Ya’qub the Saffarid takes Kabul (c. 870): the Shahis hold Gandhara', { gandhara: GANDHARA }],
  [964, 'Jayapala becomes king (c. 964)', { gandhara: GANDHARA }],
  [1001, 'Mahmud beats Jayapala at Peshawar (1001): the Shahis hold the Punjab', { punjab: PUNJAB_SHAHI }],
  [1014, 'Mahmud takes Nandana in the Salt Range (c. 1014)', { punjab: PUNJAB_SHAHI }],
  [1020, 'Trilochanapala beaten; Mahmud annexes Lahore (c. 1021)', { punjab: PUNJAB_SHAHI }],
]);

const ZUN = ['Zabulistan, Arachosia and Zamindawar', ['GHAZNI', 'KANDAHAR']];
const zunbils = build({
  id: 'zunbils', name: 'Zunbils of Zabul', color: '#B45309',
  description: 'The Zunbils (Rutbils in the Arabic sources), a branch of the Turk Shahis of Kabul, ruled Zabulistan (around Ghazni), Arachosia and Zamindawar, the land of the god Zun, from about 680. Their kingdom was the wall against which the Arab armies of Sistan broke for two centuries: in 698 they trapped and destroyed the governor Ubayd Allah ibn Abi Bakra’s ‘Army of Destruction’, and in 700 al-Hajjaj’s ‘Peacock Army’ under Ibn al-Ash’ath turned against al-Hajjaj instead; the Tang emperors invested the Zunbil king in 710 and 720. The Saffarid Ya’qub ibn al-Layth killed the Zunbil in 865 and took Zabul and Arachosia by about 870. Drawn from 680 to 869 over the Ghazni and Kandahar pieces; Bost, often held by Arab garrisons, is drawn within them.',
  timelineItemIds: ['af-shahis-zunbils'], confidence: CONF.shahis,
  sources: [W('Zunbils'), W('Muslim conquests of Afghanistan'), W('Ibn al-Ash\'ath'), W('Zabulistan'), NE],
}, [
  [680, 'The Zunbil kings of Zabul break from Kabul (c. 680)', { zabul: ZUN }],
  [698, 'The ‘Army of Destruction’ is routed (698)', { zabul: ZUN }],
  [700, 'Ibn al-Ash’ath’s ‘Peacock Army’ turns on al-Hajjaj (700)', { zabul: ZUN }],
  [720, 'The Tang invest the Zunbil (710, 720)', { zabul: ZUN }],
  [865, 'Ya’qub the Saffarid kills the Zunbil (865)', { zabul: ZUN }],
  [869, 'The Saffarids take Zabul and Arachosia (c. 870)', { zabul: ZUN }],
]);

const SIS = ['Sistan (Zaranj, Farah)', ['SISTAN']];
// Ghor, which the Saffarids never conquered, is drawn inside: a polygon cannot have a hole here.
const SAF_870 = ['Sistan, Herat, Kabul, Ghazni, Arachosia and Balkh', ['SISTAN', 'HERAT', 'KANDAHAR', 'GHAZNI', 'KABUL', 'BAMYAN', 'BALKH', 'GHOR']];
const saffarids = build({
  id: 'saffarids', name: 'Saffarid dynasty', color: '#9F1239',
  description: 'Ya’qub ibn al-Layth al-Saffar (‘the coppersmith’), leader of volunteer fighters (ayyars) in Sistan, took Zaranj in 861. He took Herat from the Tahirids in 867, killed the Zunbil (865) and took Ghazni, Kabul and Bamiyan by about 870, and Balkh in 870; he also took Nishapur (873), Kerman and Fars and marched on Baghdad, but was beaten at Dayr al-Aqul (876) and died in 879. His brother Amr ruled Khurasan until the Samanid Isma’il beat and captured him near Balkh in 900. After that the Saffarids held only Sistan, under the Samanids and then independently, until Mahmud of Ghazni deposed Khalaf ibn Ahmad in 1003. Drawn over Afghanistan only (Ghor, never conquered, is drawn inside the 870–899 extent): their Iranian conquests (Nishapur, Kerman, Fars) are not drawn, because the Abbasid Caliphate’s schematic Persian ring already covers them.',
  nameAt: [[861, 'Saffarids (Ya’qub ibn al-Layth)'], [879, 'Saffarids (Amr ibn al-Layth)'], [900, 'Saffarids of Sistan']],
  timelineItemIds: ['af-saffarids'], confidence: CONF.dynasty,
  sources: [W('Saffarid dynasty'), W('Ya\'qub ibn al-Layth al-Saffar'), W('Amr ibn al-Layth'), IR('Saffarids', 'saffarids'), NE],
}, [
  [861, 'Ya’qub ibn al-Layth takes Zaranj (861)', { sistan: SIS }],
  [867, 'Ya’qub takes Herat from the Tahirids (867)', { sistan: ['Sistan and Herat', ['SISTAN', 'HERAT']] }],
  [870, 'Ya’qub takes Zabul, Kabul, Bamiyan and Balkh (c. 870)', { sistan: SAF_870 }],
  [879, 'Ya’qub dies; Amr ibn al-Layth succeeds (879)', { sistan: SAF_870 }],
  [900, 'Amr captured by the Samanids near Balkh (900): Sistan alone', { sistan: SIS }],
  [963, 'Khalaf ibn Ahmad, amir of Sistan (963)', { sistan: SIS }],
  [1002, 'Mahmud of Ghazni deposes Khalaf (1003)', { sistan: SIS }],
]);

const G_CORE = ['Ghazni, Kabul and Arachosia', ['GHAZNI', 'KABUL', 'KANDAHAR']];
const G_1000 = ['Afghanistan and Khurasan', ['GHAZNI', 'KABUL', 'KANDAHAR', 'HERAT', 'BALKH', 'KUNDUZ', 'BAMYAN', 'KHOR_IR']];
// With Sistan the empire rings Ghor, so Ghor (conquered only in 1011) is drawn from 1003: no holes.
const G_1003 = [...G_1000[1], 'PESHAWAR', 'SISTAN', 'GHOR'];
const G_1011 = G_1003;
const G_1038 = G_1011.filter((p) => p !== 'KHOR_IR');
const G_1040 = G_1038.filter((p) => !['HERAT', 'SISTAN'].includes(p));
const G_1059 = G_1040.filter((p) => !['BALKH', 'KUNDUZ', 'BAMYAN'].includes(p));
const G_1100 = G_1059.filter((p) => p !== 'GHOR');
const G_1155 = G_1100.filter((p) => p !== 'KANDAHAR');
const LAHORE = ['The Punjab (Lahore)', ['PUNJAB']];
const RAYY = ['Rayy and the Jibal', ['IRAQ_AJAM']];
const ghaznavids = build({
  id: 'ghaznavid-empire', name: 'Ghaznavid Empire', color: '#047857',
  description: 'Sabuktigin, a Turkic slave commander, was made governor of Ghazni in 977 and took Bost the same year; he won Kabul and Laghman from the Hindu Shahis (c. 988). His son Mahmud (998–1030) took Khurasan from the Samanids in 999, beat the Hindu Shahis at Peshawar (1001), took Sistan (1003), conquered Ghor (1011), annexed the Punjab with Lahore (c. 1021) and in 1029 took Rayy from the Buyids; he raided far into India, sacking Somnath in 1025, while Ferdowsi and al-Biruni worked under him. Mas’ud I lost Nishapur to the Seljuks (1038) and then all Khurasan at Dandanaqan (1040). By the peace of 1059 Sultan Ibrahim left Balkh and Tokharistan to the Seljuks; the later Ghaznavids ruled Ghazni, Kabul and the Punjab, with Ghor as a vassal until about 1100. The Ghurid Ala al-Din Husayn burned Ghazni in 1150–1151 and took Bost and Zamindawar; the Oghuz took Ghazni in 1163, leaving the dynasty Lahore and the Punjab until Muhammad of Ghor took Lahore in 1186. Drawn from 977 to 1185 (Ghor from 1003, when the empire surrounds it); the Indian raids (Multan, Kannauj, Somnath) are not drawn as territory.',
  nameAt: [[977, 'Ghaznavids (Sabuktigin)'], [998, 'Ghaznavid Empire (Mahmud)'], [1163, 'Ghaznavids of Lahore']],
  timelineItemIds: ['af-ghaznavids'], confidence: CONF.dynasty,
  sources: [W('Ghaznavids'), W('Mahmud of Ghazni'), W('Battle of Dandanaqan'), W('Ibrahim of Ghazni'), IR('Ghaznavids', 'ghaznavids'), NE],
}, [
  [977, 'Sabuktigin, governor of Ghazni; Bost taken (977)', { ghazni: ['Ghazni and Bost', ['GHAZNI', 'KANDAHAR']] }],
  [988, 'Kabul and Laghman won from the Hindu Shahis (c. 988)', { ghazni: G_CORE }],
  [1000, 'Mahmud takes Khurasan from the Samanids (999)', { ghazni: G_1000 }],
  [1001, 'Mahmud beats Jayapala at Peshawar (1001)', { ghazni: ['Afghanistan, Khurasan and Peshawar', [...G_1000[1], 'PESHAWAR']] }],
  [1003, 'Sistan taken from the Saffarids (1003)', { ghazni: ['Afghanistan, Khurasan and Peshawar', G_1003] }],
  [1011, 'Mahmud conquers Ghor (1011)', { ghazni: ['Afghanistan, Khurasan and Peshawar', G_1011] }],
  [1021, 'Lahore and the Punjab annexed (c. 1021)', { ghazni: ['Afghanistan, Khurasan and Peshawar', G_1011], punjab: LAHORE }],
  [1025, 'Mahmud sacks Somnath (1025)', { ghazni: ['Afghanistan, Khurasan and Peshawar', G_1011], punjab: LAHORE }],
  [1029, 'Rayy taken from the Buyids (1029)', { ghazni: ['Afghanistan, Khurasan and Peshawar', G_1011], punjab: LAHORE, rayy: RAYY }],
  [1030, 'Mahmud dies; Mas’ud I (1030)', { ghazni: ['Afghanistan, Khurasan and Peshawar', G_1011], punjab: LAHORE, rayy: RAYY }],
  [1035, 'Rayy lost (c. 1035)', { ghazni: ['Afghanistan, Khurasan and Peshawar', G_1011], punjab: LAHORE }],
  [1038, 'The Seljuks take Nishapur (1038)', { ghazni: ['Afghanistan and Herat', G_1038], punjab: LAHORE }],
  [1040, 'Dandanaqan (1040): Herat and Khurasan to the Seljuks', { ghazni: ['Afghanistan (Ghazni, Kabul, Balkh)', G_1040], punjab: LAHORE }],
  [1059, 'Peace with the Seljuks (1059): Balkh and Tokharistan left to them', { ghazni: ['Ghazni, Kabul, Ghor and Peshawar', G_1059], punjab: LAHORE }],
  [1100, 'Ghor passes to Seljuk overlordship (c. 1100)', { ghazni: ['Ghazni, Kabul and Peshawar', G_1100], punjab: LAHORE }],
  [1150, 'Ala al-Din the Ghurid burns Ghazni (1150–51)', { ghazni: ['Ghazni, Kabul and Peshawar', G_1100], punjab: LAHORE }],
  [1155, 'Bost and Zamindawar lost to the Ghurids (c. 1155)', { ghazni: ['Ghazni, Kabul and Peshawar', G_1155], punjab: LAHORE }],
  [1163, 'The Oghuz take Ghazni (1163): Lahore becomes the capital', { ghazni: ['Peshawar', ['PESHAWAR']], punjab: LAHORE }],
  [1179, 'Muhammad of Ghor takes Peshawar (1179)', { punjab: LAHORE }],
  [1185, 'Muhammad of Ghor takes Lahore (1186)', { punjab: LAHORE }],
]);

const GH_1173 = ['GHOR', 'BAMYAN', 'KANDAHAR', 'GHAZNI', 'KABUL'];
const GH_1175 = [...GH_1173, 'HERAT', 'SISTAN'];
const GH_1179 = [...GH_1175, 'PESHAWAR'];
const GH_1198 = [...GH_1179, 'BALKH', 'KUNDUZ'];
const GH_1206 = GH_1179.filter((p) => !['HERAT', 'SISTAN'].includes(p));
const ghurids = build({
  id: 'ghurid-empire', name: 'Ghurid Empire', color: '#0B7285',
  description: 'The Shansabanid chiefs of Ghor, the mountains of central Afghanistan, ruled under the Ghaznavids and then the Seljuks. Ala al-Din Husayn (1149–1161), ‘the World Burner’, sacked Ghazni in 1150–1151 and took Bamiyan (given to a junior branch, 1152), Bost and Zamindawar. His nephews Ghiyath al-Din Muhammad (1163–1203), from Firozkoh, and Mu’izz al-Din Muhammad of Ghor, from Ghazni, built an empire: Ghazni (1173), Herat (1175, with the suzerainty of Sistan), Peshawar (1179), Lahore (1186), Balkh (from Qara Khitai vassals, 1198), and after Tarain (1192) Delhi and the Ganges plain. The Khwarazmshah beat Mu’izz at Andkhud (1204); after Mu’izz was murdered (1206) his Turkish generals kept India and the Khwarazmshahs took Herat and Balkh (1206), made the sultans at Firozkoh their vassals and took Ghazni from Taj al-Din Yildiz in 1215. Drawn from 1149 to 1214 over Afghanistan, Peshawar and the Punjab; the conquests in northern India (Delhi, Ajmer, Bengal) and the brief hold on Merv and Nishapur (1192, 1200–01) are not drawn.',
  nameAt: [[1149, 'Ghurids of Firozkoh'], [1173, 'Ghurid Empire'], [1206, 'Ghurid Sultanate (Khwarazmian vassals)']],
  timelineItemIds: ['af-ghurids'], confidence: CONF.dynasty,
  sources: [W('Ghurid dynasty'), W('Muhammad of Ghor'), W('Ghiyath al-Din Muhammad'), W('Battle of Andkhud'), IR('Ghurids', 'ghurids'), NE],
}, [
  [1149, 'Ala al-Din Husayn, ‘the World Burner’ (1149)', { ghor: ['Ghor (Firozkoh)', ['GHOR']] }],
  [1152, 'Bamiyan to a junior branch (1152); Ala al-Din captured by Sanjar at Nab', { ghor: ['Ghor and Bamiyan', ['GHOR', 'BAMYAN']] }],
  [1155, 'Bost and Zamindawar taken (c. 1155)', { ghor: ['Ghor, Bamiyan, Bost and Zamindawar', ['GHOR', 'BAMYAN', 'KANDAHAR']] }],
  [1163, 'Ghiyath al-Din Muhammad, sultan at Firozkoh (1163)', { ghor: ['Ghor, Bamiyan, Bost and Zamindawar', ['GHOR', 'BAMYAN', 'KANDAHAR']] }],
  [1173, 'Ghazni taken from the Oghuz (1173): Mu’izz rules there', { ghor: ['Ghor, Ghazni and Kabul', GH_1173] }],
  [1175, 'Herat taken (1175); Sistan submits', { ghor: ['Ghor, Ghazni, Kabul, Herat and Sistan', GH_1175] }],
  [1179, 'Peshawar taken (1179)', { ghor: ['Afghanistan and Peshawar', GH_1179] }],
  [1186, 'Lahore taken; the last Ghaznavid deposed (1186)', { ghor: ['Afghanistan and Peshawar', GH_1179], punjab: LAHORE }],
  [1192, 'Second Battle of Tarain (1192); Delhi taken (1193)', { ghor: ['Afghanistan and Peshawar', GH_1179], punjab: LAHORE }],
  [1198, 'Balkh taken from the Qara Khitai’s vassal (1198)', { ghor: ['Afghanistan, Balkh and Peshawar', GH_1198], punjab: LAHORE }],
  [1204, 'Mu’izz beaten by the Khwarazmshah at Andkhud (1204)', { ghor: ['Afghanistan, Balkh and Peshawar', GH_1198], punjab: LAHORE }],
  [1206, 'Mu’izz murdered (1206): Herat and Balkh to Khwarazm, India to Aibak', { ghor: ['Ghor, Ghazni, Kabul and Peshawar', GH_1206] }],
  [1214, 'Khwarazm takes Ghazni from Yildiz (1215)', { ghor: ['Ghor, Ghazni, Kabul and Peshawar', GH_1206] }],
]);

const KART = ['Herat and Ghor', ['HERAT', 'GHOR']];
const kartids = build({
  id: 'kartids', name: 'Kart dynasty (Herat)', color: '#6D28D9',
  description: 'The Karts were Tajik maliks from Ghor, related to the Ghurids. In 1245 the Mongols made Shams al-Din Kart ruler of Herat, which had been sacked in 1222, and Möngke Khan later confirmed him over Herat, Ghor and the lands east to the Indus, more claim than rule. Under the Ilkhans the Karts rebuilt Herat as a vassal kingdom; after the Ilkhanate collapsed (1335) Mu’izz al-Din Husayn (1332–1370) ruled independently and fought the Sarbadars at Zawa (1342). Timur took Herat in 1381 and put the last malik, Ghiyath al-Din Pir Ali, to death in 1389. Drawn over the Herat and Ghor pieces from 1245 to 1380; their wider claims in Sistan, Kandahar and Ghazni are not drawn.',
  nameAt: [[1245, 'Kartids (Mongol maliks of Herat)'], [1335, 'Kartids of Herat']],
  timelineItemIds: ['af-mongols-kartids'], confidence: CONF.dynasty,
  sources: [W('Kart dynasty'), W('Siege of Herat (1381)'), IR('Āl-e Kart', 'al-e-kart'), NE],
}, [
  [1245, 'Shams al-Din Kart made malik of Herat by the Mongols (1245)', { herat: KART }],
  [1251, 'Möngke confirms Herat and Ghor to Shams al-Din (c. 1251)', { herat: KART }],
  [1332, 'Mu’izz al-Din Husayn, malik (1332)', { herat: KART }],
  [1335, 'The Ilkhanate collapses: the Karts independent (1335)', { herat: KART }],
  [1342, 'The Sarbadars beaten at Zawa (1342)', { herat: KART }],
  [1380, 'Timur takes Herat (1381)', { herat: KART }],
]);

const MK = ['Kabul and Ghazni', ['KABUL', 'GHAZNI']];
const MK_PESH = ['Kabul, Ghazni and Peshawar', ['KABUL', 'GHAZNI', 'PESHAWAR']];
const KAND = ['Kandahar', ['KANDAHAR']];
const mughalKabul = build({
  id: 'mughal-kabul', name: 'Mughal Kabul', color: '#15803D',
  description: 'Babur, the Timurid prince driven out of Fergana, took Kabul in 1504 and in 1507 took the title padishah; he took Kandahar from the Arghuns in 1522 and from Kabul invaded India, winning at Panipat in 1526. Kabul stayed with his descendants: with Kamran while Humayun was in exile, then (1554–1585) with Akbar’s half-brother Mirza Hakim, after whose death Akbar annexed it as the Kabul subah, which with Peshawar guarded the road to India. Kandahar was lost to the Safavids in 1558, surrendered to Akbar by its Safavid governor in 1595, retaken by Shah Abbas I in 1622, handed back by Ali Mardan Khan in 1638 and lost for good in 1649; three Mughal sieges (1649, 1652, 1653) failed. Nader Shah took Kabul in 1738. Drawn from 1507 (the Timurid shape ends in 1506) to 1737; Shah Jahan’s occupation of Balkh and Badakhshan (1646–1647) and the Mughal Punjab and Sindh are not drawn here.',
  nameAt: [[1507, 'Kabul (Babur)'], [1526, 'Mughal Kabul'], [1554, 'Mughal Kabul (Mirza Hakim)'], [1585, 'Kabul Subah (Mughal Empire)']],
  timelineItemIds: ['af-mughal-safavid'], confidence: CONF.early,
  sources: [W('Babur'), W('Kabul Subah'), W('Mirza Muhammad Hakim'), W('Mughal–Safavid war (1649–1653)'), NE],
}, [
  [1507, 'Babur, padishah at Kabul (1507)', { kabul: MK }],
  [1522, 'Babur takes Kandahar from the Arghuns (1522)', { kabul: MK, kandahar: KAND }],
  [1526, 'Panipat (1526): Kabul joins the new Mughal Empire', { kabul: MK_PESH, kandahar: KAND }],
  [1554, 'Mirza Hakim, Akbar’s half-brother, rules Kabul (1554)', { kabul: MK_PESH, kandahar: KAND }],
  [1558, 'The Safavids take Kandahar (1558)', { kabul: MK_PESH }],
  [1585, 'Mirza Hakim dies: Akbar annexes Kabul (1585)', { kabul: MK_PESH }],
  [1595, 'Kandahar surrendered to Akbar (1595)', { kabul: MK_PESH, kandahar: KAND }],
  [1622, 'Shah Abbas I retakes Kandahar (1622)', { kabul: MK_PESH }],
  [1638, 'Ali Mardan Khan hands Kandahar to Shah Jahan (1638)', { kabul: MK_PESH, kandahar: KAND }],
  [1649, 'Kandahar lost to Abbas II (1649); sieges fail in 1652 and 1653', { kabul: MK_PESH }],
  [1707, 'Aurangzeb dies (1707)', { kabul: MK_PESH }],
  [1737, 'Nader Shah takes Kabul (1738)', { kabul: MK_PESH }],
]);

const HER = ['Herat', ['HERAT']];
const SAF_SOURCES = [W('Safavid Iran'), W('Herat'), W('Abdullah Khan II'), W('Mughal–Safavid war (1649–1653)'), W('Mirwais Hotak'), NE];
const safavidHerat = build({
  id: 'safavid-herat', name: 'Safavid Herat and Kandahar', color: '#0F766E',
  description: 'Shah Isma’il I took Herat after killing Muhammad Shaybani at Merv in December 1510, and Herat, the seat of the heir to the throne, became Safavid Persia’s eastern capital. Uzbek khans besieged it again and again (1520s–1530s) and Abdullah Khan II of Bukhara took it in 1588. Kandahar was taken from the Mughals in 1558 and surrendered to Akbar by its Safavid governors in 1595, leaving the Safavids nothing in Afghanistan until Shah Abbas I retook Herat in 1598 (the next shape, safavid-herat-abbas). Drawn over Afghanistan only, from 1510 to 1594; Safavid Persia itself is the safavid-empire shape.',
  timelineItemIds: ['af-mughal-safavid'], confidence: CONF.early, sources: SAF_SOURCES,
}, [
  [1510, 'Shah Isma’il kills Shaybani at Merv and takes Herat (1510)', { herat: HER }],
  [1558, 'Kandahar taken from the Mughals (1558)', { herat: HER, kandahar: KAND }],
  [1588, 'Abdullah Khan II of Bukhara takes Herat (1588)', { kandahar: KAND }],
  [1594, 'Kandahar surrendered to Akbar (1595)', { kandahar: KAND }],
]);

const safavidHeratAbbas = build({
  id: 'safavid-herat-abbas', name: 'Safavid Herat and Kandahar', color: '#0F766E',
  description: 'Shah Abbas I retook Herat from the Uzbeks in 1598, after Abdullah Khan II’s death, and Kandahar from the Mughals in 1622. Ali Mardan Khan, its governor, handed Kandahar to Shah Jahan in 1638; Abbas II won it back in 1649, and three Mughal sieges (1649, 1652, 1653) failed. In April 1709 the Ghilji chief Mirwais Hotak killed the governor of Kandahar, the Georgian Gurgin Khan, and in 1716–1717 the Abdalis took Herat, ending Safavid rule in Afghanistan. Drawn over Afghanistan only, from 1598 to 1716.',
  timelineItemIds: ['af-mughal-safavid'], confidence: CONF.early, sources: SAF_SOURCES,
}, [
  [1598, 'Shah Abbas I retakes Herat (1598)', { herat: HER }],
  [1622, 'Shah Abbas I retakes Kandahar (1622)', { herat: HER, kandahar: KAND }],
  [1638, 'Ali Mardan Khan hands Kandahar to the Mughals (1638)', { herat: HER }],
  [1649, 'Abbas II retakes Kandahar (1649)', { herat: HER, kandahar: KAND }],
  [1709, 'Mirwais Hotak kills Gurgin Khan at Kandahar (1709)', { herat: HER }],
  [1716, 'The Abdalis take Herat (1716–17)', { herat: HER }],
]);

const HOT = ['Kandahar', ['KANDAHAR']];
const hotaks = build({
  id: 'hotaki-dynasty', name: 'Hotak dynasty', color: '#BE185D',
  description: 'In April 1709 Mirwais Hotak, chief of the Ghilji Pashtuns, killed the Safavid governor of Kandahar and made the province independent, beating the Persian armies sent against him. His son Mahmud invaded Persia, took Kerman, beat the Safavid army at Gulnabad (March 1722) and took Isfahan after a six-month siege (October 1722); Shah Sultan Husayn abdicated to him. Mahmud and his cousin Ashraf (1725–1729) held Isfahan, Kerman and Fars (Shiraz, 1724), while the Ottomans and Russians took western and northern Persia. Nader Quli Khan drove Ashraf out of Persia in 1729–1730. Mirwais’s son Hussain held Kandahar until Nader Shah took it in March 1738 after a year-long siege. Drawn from 1709 to 1736; in Persia only Isfahan, Kerman and Fars, the provinces the Afghans actually held, are drawn, and Yazd (besieged but never taken) is not.',
  nameAt: [[1709, 'Hotaks of Kandahar (Mirwais)'], [1722, 'Hotak dynasty (Isfahan)'], [1730, 'Hotaks of Kandahar (Hussain)']],
  timelineItemIds: ['af-hotaki'], confidence: CONF.early,
  sources: [W('Hotak dynasty'), W('Mirwais Hotak'), W('Battle of Gulnabad'), W('Siege of Isfahan'), W('Siege of Kandahar'), NE],
}, [
  [1709, 'Mirwais Hotak takes Kandahar from the Safavids (1709)', { kandahar: HOT }],
  [1715, 'Mirwais dies; Mahmud Hotak (1717)', { kandahar: HOT }],
  [1722, 'Gulnabad and the fall of Isfahan (1722)', { kandahar: HOT, isfahan: ['Isfahan', ['ISFAHAN']], kerman: ['Kerman', ['KERMAN']] }],
  [1724, 'Shiraz taken (1724)', { kandahar: HOT, isfahan: ['Isfahan and Fars', ['ISFAHAN', 'FARS']], kerman: ['Kerman', ['KERMAN']] }],
  [1725, 'Ashraf Hotak kills Mahmud (1725)', { kandahar: HOT, isfahan: ['Isfahan and Fars', ['ISFAHAN', 'FARS']], kerman: ['Kerman', ['KERMAN']] }],
  [1730, 'Nader drives the Afghans out of Persia (1729–30)', { kandahar: HOT }],
  [1736, 'Nader Shah besieges Kandahar (1737–38)', { kandahar: HOT }],
]);

const abdalis = build({
  id: 'abdali-herat', name: 'Abdalis of Herat', color: '#DB2777',
  description: 'In 1716–1717 the Abdali Pashtuns (later called the Durranis) under Abdullah Khan Sadozai and Asadullah Khan threw off Safavid rule at Herat, beat the Safavid armies and fought the Hotaks of Kandahar. Nader Quli Khan beat them in 1729 and left their leader Allahyar Khan as governor, but they rose again; after a ten-month siege Nader took Herat in 1732, and many Abdalis, Ahmad Khan (the later Ahmad Shah) among them, joined his army. Drawn over the Herat piece from 1717 to 1731.',
  timelineItemIds: ['af-hotaki'], confidence: CONF.early,
  sources: [W('Abdali'), W('Durrani'), W('Nader Shah'), NE],
}, [
  [1717, 'The Abdalis take Herat from the Safavids (1716–17)', { herat: HER }],
  [1720, 'The Abdalis beat the Hotaks (c. 1720)', { herat: HER }],
  [1729, 'Nader beats the Abdalis (1729)', { herat: HER }],
  [1731, 'Nader takes Herat after a ten-month siege (1732)', { herat: HER }],
]);

const D_1748 = ['KANDAHAR', 'GHAZNI', 'KABUL', 'PESHAWAR'];
const D_1750 = [...D_1748, 'HERAT', 'SISTAN'];
const D_1751 = [...D_1750, 'BALKH', 'KUNDUZ', 'BAMYAN', 'GHOR'];
const D_1768 = [...D_1751, 'BADAKHSHAN'];
const D_KASH = ['Kashmir', ['KASHMIR_VALE']];
const D_PUNJAB = ['The Punjab (Lahore, Multan)', ['PUNJAB']];
const durrani = build({
  id: 'durrani-empire', name: 'Durrani Empire', color: '#C81E1E',
  description: 'After Nader Shah was killed in June 1747, a jirga near Kandahar chose Ahmad Khan of the Abdali Sadozai clan as king; he took the title Durr-i Durran and his tribe became the Durranis. He took Ghazni, Kabul and Peshawar (1747–1748), Herat (1750, after a long siege) and the Uzbek and Hazara lands north of the Hindu Kush (1751), and won Lahore, Multan and Kashmir from the Mughals (1752). The Marathas drove his son Timur out of the Punjab in 1758; Ahmad Shah crushed them at Panipat in January 1761, but the Sikhs took Lahore in 1765, and Badakhshan submitted in 1768. His son Timur Shah (1772–1793) moved the capital from Kandahar to Kabul in 1776. Timur’s sons Zaman, Mahmud and Shuja fought for the throne (1793–1818); Kashmir fell to Ranjit Singh in 1819. Drawn from 1747 to 1815, when the nations layer takes over with the same extent; the tributary lands — Sindh, Baluchistan (the khans of Kalat), Multan after 1765, and Khurasan under Shah Rukh Afshar — are not drawn, and the Hazarajat and Kafiristan are drawn although no Kabul government controlled them before the 1890s.',
  nameAt: [[1747, 'Durrani Empire (Ahmad Shah)'], [1772, 'Durrani Empire (Timur Shah)'], [1793, 'Durrani Empire (Zaman Shah)'], [1801, 'Durrani Empire']],
  timelineItemIds: ['af-durrani'], confidence: CONF.early,
  sources: [W('Durrani Empire'), W('Ahmad Shah Durrani'), W('Third Battle of Panipat'), W('Timur Shah Durrani'), IR('Dorrani', 'dorrani'), NE],
}, [
  [1747, 'Ahmad Shah chosen king near Kandahar (1747)', { afghan: ['Kandahar and Ghazni', ['KANDAHAR', 'GHAZNI']] }],
  [1748, 'Kabul and Peshawar taken (1747–48)', { afghan: ['Kandahar, Kabul and Peshawar', D_1748] }],
  [1750, 'Herat taken after a long siege (1750)', { afghan: ['Afghanistan (Kandahar, Kabul, Herat)', D_1750] }],
  [1751, 'Balkh and the lands north of the Hindu Kush (1751)', { afghan: ['Afghanistan', D_1751] }],
  [1752, 'Lahore, Multan and Kashmir won from the Mughals (1752)', { afghan: ['Afghanistan', D_1751], punjab: D_PUNJAB, kashmir: D_KASH }],
  [1758, 'The Marathas drive Timur out of the Punjab (1758)', { afghan: ['Afghanistan', D_1751], kashmir: D_KASH }],
  [1761, 'Third Battle of Panipat (January 1761)', { afghan: ['Afghanistan', D_1751], punjab: D_PUNJAB, kashmir: D_KASH }],
  [1765, 'The Sikhs take Lahore (1765)', { afghan: ['Afghanistan', D_1751], kashmir: D_KASH }],
  [1768, 'Badakhshan submits (1768)', { afghan: ['Afghanistan', D_1768], kashmir: D_KASH }],
  [1772, 'Ahmad Shah dies; Timur Shah (1772)', { afghan: ['Afghanistan', D_1768], kashmir: D_KASH }],
  [1776, 'Timur Shah moves the capital to Kabul (1776)', { afghan: ['Afghanistan', D_1768], kashmir: D_KASH }],
  [1793, 'Zaman Shah (1793)', { afghan: ['Afghanistan', D_1768], kashmir: D_KASH }],
  [1803, 'Shah Shuja (1803); Mahmud again from 1809', { afghan: ['Afghanistan', D_1768], kashmir: D_KASH }],
  [1815, 'Kashmir still Durrani (lost to the Sikhs in 1819)', { afghan: ['Afghanistan', D_1768], kashmir: D_KASH }],
]);

export const afghanistanPolities = [shahis, zunbils, saffarids, ghaznavids, ghurids, kartids, mughalKabul, safavidHerat, safavidHeratAbbas, hotaks, abdalis, durrani];

// ---- Fixes to older shapes over Afghanistan ----------------------------------------------------------
//
//  - The Parthian Empire's schematic 'parthia-east' ring (-50 and 50) ran east over Bactria (Balkh,
//    Kunduz), Bamiyan, Kabul and Ghazni — the lands of the Greco-Bactrians, the Yuezhi and the Kushans
//    (whose own shape overlapped it in 50) — and in 50 north to the Zarafshan. Its eastern edge now
//    runs south of the Murghab and west of Bactria and the Helmand, keeping Merv, Herat and Sistan;
//    Arachosia (Kandahar), held by Indo-Scythian and Indo-Parthian kings rather than the Arsacids, is
//    left out.
//  - The Sasanian Empire's 400 'parthia-east' ring (held until 620; already trimmed off Tokharistan by
//    the Tajikistan pack) still ran over Kabul, Ghazni and Kandahar, which the Kidarites, the Alchon
//    Huns and the Nezaks held. Its eastern edge now runs from the Herat side down the Helmand, keeping
//    Herat and Sistan.
//  Both rings are schematic (they reach the Gulf and the Caspian), so they are not land-checked; notOver
//  tests prove the trims, with a margin for the fade-out shrink.
export const PARTHIAN_EAST_M50 = [[58, 32], [60, 38], [61.2, 38.1], [63.4, 37.8], [63.6, 37.2], [63.2, 36.4], [62.9, 35.9], [63.2, 35.1], [64.6, 34.0], [65.0, 31.0], [64, 30], [58, 30], [58, 32]];
export const PARTHIAN_EAST_50 = [[55, 32], [58, 39], [61.2, 38.4], [63.4, 37.8], [63.6, 37.2], [63.2, 36.4], [62.9, 35.9], [63.2, 35.1], [64.6, 34.0], [65.0, 31.0], [65, 30], [58, 30], [55, 32]];
export const SASANID_EAST = [[58, 38.6], [61.2, 38.2], [63.4, 37.8], [63.6, 37.2], [63.2, 36.4], [62.9, 35.9], [63.2, 35.1], [64.6, 34.0], [65.3, 32.0], [65, 30], [58, 30], [55, 32], [58, 38.6]];
//  - The Abbasid Caliphate's schematic 'persia' ring (800, 900, 928) ran east of the Iranian border
//    over western Sistan and the Herat oasis, which the Saffarids held from 861 (and the Tahirids and
//    then the Samanids governed for the caliph). Its eastern edge now follows the Afghan border just
//    inside Iran, keeping Khurasan (Mashhad, Nishapur); not land-checked (it reaches the Gulf).
export const ABBASID_PERSIA = [[44, 25], [46, 38], [55, 40], [62, 37], [61.0, 36.0], [61.0, 35.4], [60.35, 34.6], [60.35, 32.9], [60.6, 31.8], [60.6, 29.6], [60, 28], [52, 25], [44, 25]];
//  - The Safavid Empire's schematic 1620 'persia' ring ran a little east of the Iranian border over the
//    western Herat oasis, which the Safavid Herat shape now draws; its eastern edge now follows the
//    border (the vertex the Turkmenistan pack moved off Merv is kept).
//  - The Sikh Empire's schematic 1805 'punjab' ring reached north to 34°N, over Peshawar, Bannu and
//    Dera Ismail Khan (Durrani until 1818–1834) and the vale of Kashmir (Durrani until 1819). It now
//    stops short of the PESHAWAR piece and the vale (et-tools day77-kashmir-sikh.py), and is held
//    to a new 1815 keyframe, so the empire's growth to its 1835 extent (Multan 1818, Kashmir 1819,
//    Peshawar 1834) starts after the Durrani shape ends rather than in 1805.
export const SAFAVID_PERSIA_1620 = [[50, 27], [48.9, 29.6], [47.6, 32.75], [46.6, 35.2], [45.6, 37.6], [46, 38.2], [55, 40], [61.15, 36.55], [61.0, 35.4], [60.35, 34.6], [60.35, 32.9], [60, 28], [52, 25], [50, 27]];
export const SIKH_PUNJAB_1805 = [[71, 29], [71.86, 33.29], [71.98, 33.35], [72.1, 33.63], [72.3, 33.67], [72.36, 33.85], [72.53, 33.9], [72.71, 33.84], [72.97, 33.62], [73.46, 33.85], [73.5, 33.18], [73.59, 33.08], [77, 33.08], [77, 30], [74, 28.5], [71, 29]];
export const afghanistanShapeFixes = {
  'safavid-empire': ['persia (1620) trimmed back to the Iranian border, off Herat'],
  'sikh-empire': ['punjab (1805) trimmed off Peshawar and Kashmir; held to a new 1815 keyframe'],
  'abbasid-caliphate': ['persia (800, 900, 928) trimmed back to the Iranian border, off Sistan and Herat'],
  'parthian-empire': ['parthia-east (-50, 50) trimmed off Bactria, Kabul, Ghazni and Arachosia'],
  'sassanid-empire': ['parthia-east (400) trimmed off Kabul, Ghazni and Kandahar'],
};

function replaceRing(entities, id, year, rid, ring, name) {
  const ent = entities.find((x) => x.id === id);
  if (!ent) throw new Error(`afghanistan fixes: no entity ${id}`);
  const kf = ent.overlays.find((o) => o.year === year);
  const i = kf ? kf.regions.findIndex((r) => (typeof r === 'string' ? r : r.id) === rid) : -1;
  if (i < 0) throw new Error(`afghanistan fixes: ${id} ${year} has no ${rid}`);
  const r = kf.regions[i];
  kf.regions[i] = { id: rid, name: typeof r === 'string' ? name : r.name || name, ring: ensureClockwise(ring) };
}

/** Apply `afghanistanShapeFixes` (runs after the packs are appended; throws if a target is missing). */
export function applyAfghanistanShapeFixes(entities) {
  replaceRing(entities, 'parthian-empire', -50, 'parthia-east', PARTHIAN_EAST_M50, 'Eastern Parthia (Merv, Aria, Sistan)');
  replaceRing(entities, 'parthian-empire', 50, 'parthia-east', PARTHIAN_EAST_50, 'Eastern Parthia (Merv, Aria, Sistan)');
  for (const y of [800, 900, 928]) replaceRing(entities, 'abbasid-caliphate', y, 'persia', ABBASID_PERSIA, 'Persia');
  replaceRing(entities, 'safavid-empire', 1620, 'persia', SAFAVID_PERSIA_1620, 'Safavid Persia');
  replaceRing(entities, 'sikh-empire', 1805, 'punjab', SIKH_PUNJAB_1805, 'Punjab');
  const sikh = entities.find((x) => x.id === 'sikh-empire');
  const kf1805 = sikh.overlays.find((o) => o.year === 1805);
  if (sikh.overlays.some((o) => o.year === 1815)) throw new Error('afghanistan fixes: sikh-empire already has 1815');
  const i1835 = sikh.overlays.findIndex((o) => o.year === 1835);
  if (i1835 < 0) throw new Error('afghanistan fixes: sikh-empire has no 1835 keyframe');
  sikh.overlays.splice(i1835, 0, { ...kf1805, year: 1815, label: 'Ranjit Singh’s Punjab (Multan, Kashmir and Peshawar still Durrani)', regions: kf1805.regions.map((r) => ({ ...r })) });
  replaceRing(entities, 'sassanid-empire', 400, 'parthia-east', SASANID_EAST, 'Eastern Iran (Khurasan, Herat, Sistan)');
}
