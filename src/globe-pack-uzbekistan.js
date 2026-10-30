/**
 * Day 72 — Phase 5 country pack 2 (Central Asia), globe backfill: Uzbekistan (ROADMAP item 12),
 * the first country of pack 2.
 *
 * Uzbekistan had no country timeline (now data/countries/uzbekistan.json) and on the globe, before
 * the 1815 nations layer, only the Achaemenid / Seleucid / Greco-Bactrian "Bactria and Sogdia"
 * regions, the Kushan core, a schematic Khwarezmian Empire (Transoxiana in 1200, a decade before
 * Muhammad II took it), a six-point Timurid Transoxiana that missed Bukhara and Khwarazm, and
 * nothing at all for the Sogdian city-states, the Samanids, the Karakhanids or the Uzbek khanates;
 * meanwhile the Russian Empire's 1850 "central-asia" ring grew over Bukhara and Samarkand from the
 * 1750s, a century before Russia got there. This module draws the oases' own states from the
 * Afrighids (305) to 1815:
 *
 *   Sogdian city-states · Afrighid and Ma'munid Khwarazm · the Samanid Empire · the Karakhanids ·
 *   the Khwarezmian Empire (redrawn) · the Timurids (Transoxiana redrawn) · the Khanate of Bukhara
 *   (Shaybanids, Janids, Manghits, the Emirate) · the Khanate of Khiva · the Khanate of Kokand
 *
 * From 1815 the nations layer takes over (Bukhara, Khiva and Kokand, then Russian Turkestan, the
 * Soviet republics and Uzbekistan), so no keyframe here is later than 1815. The pack's last
 * keyframes use the same provinces as the 1815 nations table (globe-nations-table-1815.js).
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - The land is cut into 27 "pieces" (UZ_PIECES): modern first-level provinces from Natural Earth
 *    1:10m admin-1 (public domain) — Khorezm, Karakalpakstan, Bukhara, Navoi, Samarkand,
 *    Kashkadarya, Surkhandarya, Jizzakh, Sirdaryo, Tashkent, Fergana, Namangan, Andijan, and the
 *    neighbouring provinces of Tajikistan, Kyrgyzstan, Turkmenistan, southern Kazakhstan, northern
 *    Afghanistan and north-eastern Iran — simplified together as one topology (Visvalingam,
 *    150 km²), so neighbouring pieces share their borders point for point and `mergeRings` fuses
 *    any set of touching pieces into one outline. They are generated offline from the Natural Earth
 *    file the nations layer is built from; rerunning that generator is the way to change them.
 *  - Provinces are a coarse stand-in for historical districts: Khwarazm is Khorezm, Dashoguz and
 *    Karakalpakstan; Sogdia is Samarkand, Bukhara and Kashkadarya; Chach is Tashkent and Sirdaryo;
 *    Ushrusana is Jizzakh and Sughd; Chaghaniyan and Termez are Surkhandarya. Desert provinces
 *    (Navoi, Karakalpakstan) take in the Kyzylkum and the Ustyurt around the oases, as the nations
 *    layer does from 1815.
 *  - A polity is a dated list of pieces; every change is a one-year step (a keyframe the year before
 *    with the old extent), so no outline morphs across a neighbour. Where no source puts a state over
 *    a district it is left empty (Chach between the Timurids and the Shaybanids, and from 1598 to
 *    Kokand's conquest; the Chagatai years 1320–1370).
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';
import { CA_PIECES } from './globe-central-asia-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const IR = (title, slug) => ({ title: `Encyclopaedia Iranica — ${title}`, url: `https://www.iranicaonline.org/articles/${slug}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}` });
const NE = { title: 'Natural Earth — 1:10m admin-1 states and provinces (piece outlines)', url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/' };

// ---- Pieces ([lng, lat], Natural Earth admin-1, simplified together; generated offline) ----------
//
// XO Khorezm · DASH Dashoguz (Konye-Urgench) · QR Karakalpakstan · BU Bukhara · NW Navoi ·
// SA Samarkand · QA Kashkadarya · SU Surkhandarya · JI Jizzakh · SI Sirdaryo · TO Tashkent (with the
// city) · FA Fergana · NG Namangan · AN Andijan · SUGHD Sughd (Khujand, Ura-Tyube, Panjikent) ·
// HISAR Hisar and Dushanbe · KHATLON Khatlon (Khuttal) · LEBAP Lebap (Amul) · MARY Mary (Merv) ·
// AHAL Ahal (Nisa) · KG_S Osh, Jalal-Abad, Batken · KG_N Chuy, Talas, Issyk-Kul, Naryn ·
// YUZ + ZHA Turkistan and Zhambyl (Isfijab, Otrar, Taraz) · BALKH Balkh, Jowzjan, Samangan, Faryab,
// Sar-e Pol · HERAT Herat and Badghis · KHOR_IR Razavi, North and South Khorasan ·
// IRAQ_AJAM Semnan, Tehran (Rayy), Qazvin, Qom, Markazi, Hamadan.
export const UZ_PIECES = CA_PIECES;

/** Kashgar and the western Tarim (the eastern Karakhanids' seat), hand-drawn: east of the Kyrgyz and Tajik pieces. */
const KASHGAR = [[75.3, 38.9], [75.5, 39.7], [76.4, 39.9], [77.4, 39.55], [77.3, 38.75], [76.2, 38.45], [75.3, 38.9]];

/** Region builder: piece names → one ring (touching pieces merged). */
function ringOf(label, names) {
  const ps = names.map((n) => {
    if (n === 'KASHGAR') return KASHGAR;
    if (!UZ_PIECES[n]) throw new Error(`uzbekistan pack: no piece ${n}`);
    return UZ_PIECES[n];
  });
  return ensureClockwise(ps.length === 1 ? ps[0] : mergeRings(label, ...ps));
}

/**
 * steps: [[year, label, { regionId: [name, pieces] }], …]. Keyframes are written for every step
 * year and the year before it (still the old extent), so each change is a one-year step.
 */
export const UZ_STEPS = {};
const RING_CACHE = new Map();
function build(meta, steps) {
  UZ_STEPS[meta.id] = steps;
  const years = new Set();
  steps.forEach(([y], i) => {
    years.add(y);
    if (i > 0 && y - 1 > steps[i - 1][0]) years.add(y - 1);
  });
  const overlays = [...years].sort((x, y) => x - y).map((y) => {
    let s = steps[0];
    for (const st of steps) if (st[0] <= y) s = st;
    const regions = Object.entries(s[2]).map(([rid, [name, pieces]]) => {
      const key = `${meta.id}|${rid}|${pieces.join(',')}`;
      if (!RING_CACHE.has(key)) RING_CACHE.set(key, ringOf(`${meta.id} ${y} ${rid}`, pieces));
      return { id: rid, name, ring: RING_CACHE.get(key) };
    });
    return { year: y, label: s[1], approximation: A, regions };
  });
  return { edgeGrace: 1, keyYears: steps.map(([y]) => y), type: 'state', ...meta, overlays };
}

// ---- Confidence --------------------------------------------------------------------------------------

const PROVINCES = 'Drawn with modern provinces as stand-ins for the historical districts, so edges in the desert and mountains are rough.';
const CONF = {
  cityStates: {
    level: 'conjectural',
    reason: `Known from Chinese, Arabic and Sogdian documents (the Mount Mugh archive), coins and excavations at Afrasiyab, Panjikent and Varakhsha. Each city-state ruled its own oasis; their borders, and how far the overlords' power reached, are not recorded. ${PROVINCES}`,
  },
  khwarazm: {
    level: 'conjectural',
    reason: `The Afrighid start (305) and king list come from al-Biruni, writing seven centuries later; Kath and Gurganj and the oasis are well attested, but the dynasty's early reach is not. ${PROVINCES}`,
  },
  emirate: {
    level: 'approximate',
    reason: `The Arabic geographers (Istakhri, Ibn Hawqal, Muqaddasi) and the chronicles (Narshakhi, Gardizi, Ibn al-Athir) name the provinces and the dates they changed hands; borders between oases ran through steppe and mountains and are drawn roughly. ${PROVINCES}`,
  },
  khanate: {
    level: 'approximate',
    reason: `Persian and Chagatai chronicles and Russian, British and Qing reports give the khans, their capitals and the provinces they held; their power ran through appanage princes and tribal beys, and the edges in the desert, the steppe and the mountains are drawn roughly. ${PROVINCES}`,
  },
};

// ---- Polities ----------------------------------------------------------------------------------------

const SOGDIA = ['SA', 'BU', 'QA'];
const sogdia = build({
  id: 'sogdia', name: 'Sogdian city-states', color: '#E0A458',
  description: 'The Sogdian city-states of the Zarafshan and Kashkadarya valleys — Samarkand under its ikhshid, Bukhara under the Bukhar Khudah, Kesh, Nasaf, Panjikent and smaller towns — were the merchants of the Silk Road from the 4th to the 8th century, with colonies across Central Asia and China. They paid tribute in turn to the Hephthalites and, from the 560s, the Western Turkic khagans. The Arabs under Qutayba ibn Muslim took Bukhara in 709 and Samarkand in 712; the kings of Samarkand stayed on as tributaries, and Devashtich of Panjikent held out at Mount Mugh until 722.',
  nameAt: [[350, 'Sogdian city-states'], [479, 'Sogdian city-states (Hephthalite overlords)'], [560, 'Sogdian city-states (Western Turkic overlords)'], [712, 'Samarkand (tributary to the caliphate)']],
  timelineItemIds: ['uz-sogdian-city-states', 'uz-arab-conquest'], confidence: CONF.cityStates,
  sources: [W('Sogdia'), W('Afrasiab paintings'), W('Devashtich'), W('Muslim conquest of Transoxiana'), NE],
}, [
  [350, 'Sogdian city-states after the Kushans (4th century)', { sogdia: ['Sogdia (Samarkand, Bukhara, Kesh, Nasaf)', SOGDIA] }],
  [560, 'Western Turkic khagans become the overlords (560s)', { sogdia: ['Sogdia (Samarkand, Bukhara, Kesh, Nasaf)', SOGDIA] }],
  [709, 'Qutayba ibn Muslim takes Bukhara (709)', { sogdia: ['Samarkand, Kesh and Nasaf', ['SA', 'QA']] }],
  [712, 'Samarkand capitulates to Qutayba (712); Ghurak reigns as a tributary', { sogdia: ['Samarkand', ['SA']] }],
  [722, 'Devashtich of Panjikent defeated at Mount Mugh (722)', { sogdia: ['Samarkand', ['SA']] }],
]);

const KHWARAZM = ['XO', 'DASH', 'QR'];
const afrighid = build({
  id: 'afrighid-khwarazm', name: 'Khwarazm (Afrighids and Ma’munids)', color: '#2E7D6B',
  description: 'Khwarazm, the delta oasis of the lower Amu Darya south of the Aral Sea. According to al-Biruni the Afrighid Khwarazmshahs ruled from Kath from 305; after Qutayba ibn Muslim’s conquest (712) they stayed on as tributaries of the caliphate and then of the Samanids. In 995 the emir of Gurganj (Urgench), Ma’mun ibn Muhammad, overthrew the last Afrighid and united the oasis; the Ma’munid court at Gurganj hosted al-Biruni and Ibn Sina until Mahmud of Ghazni annexed Khwarazm in 1017.',
  nameAt: [[305, 'Afrighid Khwarazm'], [712, 'Afrighid Khwarazm (tributary shahs)'], [995, 'Ma’munid Khwarazm']],
  timelineItemIds: ['uz-ancient-khwarazm', 'uz-khwarazmshahs'], confidence: CONF.khwarazm,
  sources: [IR('Āl-e Afrīḡ', 'al-e-afrig'), IR('Chorasmia ii. In Islamic times', 'chorasmia-ii'), W('Afrighids'), W("Ma'munids"), W('Al-Biruni'), NE],
}, [
  [305, 'Afrigh founds the dynasty at Kath (305, after al-Biruni)', { khwarazm: ['Khwarazm (Kath)', KHWARAZM] }],
  [712, 'Qutayba takes Khwarazm (712): the Afrighids become tributaries', { khwarazm: ['Khwarazm (Kath)', KHWARAZM] }],
  [995, 'Ma’mun of Gurganj overthrows the last Afrighid (995)', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM] }],
  [1017, 'Mahmud of Ghazni annexes Khwarazm (1017)', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM] }],
]);

const SAM_819 = ['SA', 'SUGHD', 'JI', 'FA', 'NG', 'AN', 'TO', 'SI'];
const SAM_874 = [...SAM_819, 'BU', 'NW'];
const SAM_875 = [...SAM_874, 'QA', 'SU'];
const SAM_900 = [...SAM_875, 'HISAR', 'KHATLON', 'BALKH', 'LEBAP', 'MARY', 'HERAT', 'KHOR_IR'];
const samanid = build({
  id: 'samanid-empire', name: 'Samanid Empire', color: '#3F7FBF',
  description: 'In 819 the four grandsons of Saman Khuda were given Samarkand, Fergana, Chach (Tashkent) with Ushrusana, and Herat as caliphal governors. Isma’il ibn Ahmad took Bukhara in 874; his brother Nasr I was made governor of all Transoxiana in 875, and Isma’il, ruling from Bukhara, beat the Saffarid Amr ibn al-Layth near Balkh in 900 and took Khurasan. Bukhara became a capital of New Persian letters (Rudaki, Firdawsi’s patrons, Ibn Sina’s youth). The Karakhanid Bughra Khan briefly held Bukhara in 992, and Nasr ibn Ali took it for good in October 999.',
  nameAt: [[819, 'Samanid governors of Transoxiana'], [875, 'Samanid Empire']],
  timelineItemIds: ['uz-samanids', 'uz-arab-conquest'], confidence: CONF.emirate,
  sources: [W('Samanid Empire'), W('Isma\'il ibn Ahmad'), W('Samanid Mausoleum'), UNESCO('Historic Centre of Bukhara', 602), NE],
}, [
  [819, 'Al-Ma’mun’s grant: Samarkand, Fergana, Chach and Ushrusana (819)', { transoxiana: ['Samarkand, Ushrusana, Chach and Fergana', SAM_819] }],
  [874, 'Isma’il ibn Ahmad takes Bukhara (874)', { transoxiana: ['Transoxiana', SAM_874] }],
  [875, 'Nasr I governor of all Transoxiana (875)', { transoxiana: ['Transoxiana', SAM_875] }],
  [900, 'Isma’il beats Amr ibn al-Layth at Balkh (900): Khurasan', { transoxiana: ['Transoxiana and Khurasan', SAM_900] }],
  [992, 'The Karakhanid Bughra Khan briefly holds Bukhara (992)', { transoxiana: ['Transoxiana and Khurasan', SAM_900] }],
  [998, 'The last Samanid emirs (Bukhara falls in October 999)', { transoxiana: ['Transoxiana and Khurasan', SAM_900] }],
]);

const KK_999 = ['SA', 'SUGHD', 'JI', 'FA', 'NG', 'AN', 'TO', 'SI', 'BU', 'NW', 'QA', 'SU', 'KG_S', 'KG_N', 'YUZ', 'ZHA'];
const KK_1134 = KK_999.filter((p) => p !== 'KG_N');
const KK_1207 = KK_1134.filter((p) => p !== 'BU' && p !== 'NW');
const KASH = { kashgar: ['Kashgar', ['KASHGAR']] };
const karakhanid = build({
  id: 'karakhanid-khanate', name: 'Karakhanid Khanate', color: '#B5651D',
  description: 'A Turkic dynasty (the Qarakhanids or Ilek Khans) from the Chu and Talas valleys and Kashgar, the first Turkic rulers to convert to Islam. Nasr ibn Ali took Bukhara in October 999 and ended the Samanids. Around 1040 the realm split into a western khanate at Samarkand and an eastern one at Balasagun and Kashgar. Malik-Shah made the western khans Seljuk vassals (1089); the Qara Khitai took Balasagun (1134) and, after beating Sultan Sanjar at Qatwan near Samarkand (1141), became overlords of both. The Khwarazmshah Muhammad II took Bukhara (1207) and executed the last western khan, Uthman, at Samarkand in 1212; Kuchlug had seized Kashgar in 1211.',
  nameAt: [[999, 'Karakhanid Khanate'], [1040, 'Karakhanid khanates (west and east)'], [1089, 'Karakhanid khanates (Seljuk vassals in the west)'], [1141, 'Karakhanid khanates (Qara Khitai vassals)']],
  timelineItemIds: ['uz-karakhanids'], confidence: CONF.emirate,
  sources: [W('Kara-Khanid Khanate'), IR('Ilak-Khanids', 'ilak-khanids'), W('Battle of Qatwan'), W('Kalyan Minaret'), NE],
}, [
  [999, 'Nasr ibn Ali takes Bukhara (October 999)', { khanate: ['Transoxiana, Fergana and Semirechye', KK_999], ...KASH }],
  [1040, 'The khanate splits: Samarkand in the west, Balasagun and Kashgar in the east (c. 1040)', { khanate: ['Transoxiana, Fergana and Semirechye', KK_999], ...KASH }],
  [1089, 'Malik-Shah takes Samarkand: the western khans become Seljuk vassals (1089)', { khanate: ['Transoxiana, Fergana and Semirechye', KK_999], ...KASH }],
  [1134, 'The Qara Khitai take Balasagun (1134)', { khanate: ['Transoxiana and Fergana', KK_1134], ...KASH }],
  [1141, 'Battle of Qatwan (1141): Qara Khitai overlords', { khanate: ['Transoxiana and Fergana', KK_1134], ...KASH }],
  [1207, 'Muhammad II of Khwarazm takes Bukhara (1207)', { khanate: ['Samarkand, Chach and Fergana', KK_1207], ...KASH }],
  [1211, 'Kuchlug seizes Kashgar (1211); Uthman of Samarkand executed in 1212', { khanate: ['Samarkand, Chach and Fergana', KK_1207] }],
]);

const KW_IRAN = ['AHAL', 'MARY', 'LEBAP', 'KHOR_IR', 'IRAQ_AJAM'];
const KW_TRANS = ['SA', 'QA', 'SU', 'JI', 'SUGHD', 'HISAR', 'KHATLON', 'TO', 'SI', 'FA', 'NG', 'AN', 'YUZ', 'ZHA'];
const khwarezmia = build({
  id: 'khwarezmia', name: 'Khwarezmian Empire', color: '#C026D3',
  description: 'In 1077 the Seljuks made the Turkic commander Anushtegin governor of Khwarazm; his son Qutb al-Din Muhammad took the title Khwarazmshah in 1097. Atsiz broke with the Seljuks, and after the Qara Khitai victory at Qatwan (1141) the shahs paid them tribute. Tekish beat the last Seljuk sultan, Toghrul III, at Rayy in 1194 and took Khurasan and western Iran. Muhammad II took Ghurid Herat and Balkh (1206), Bukhara (1207) and, after executing the Karakhanid Uthman, Samarkand (1212), which became his capital. The massacre of a Mongol caravan at Otrar (1218) brought Genghis Khan: Otrar was besieged in 1219, Bukhara and Samarkand fell in 1220 and Gurganj in 1221. Jalal al-Din fought on in Iran until 1231.',
  nameAt: [[1097, 'Khwarazmshahs (Seljuk vassals)'], [1141, 'Khwarazmshahs (Qara Khitai tributaries)'], [1194, 'Khwarezmian Empire']],
  timelineItemIds: ['khwarezmia', 'uz-khwarazmshahs'], confidence: CONF.emirate,
  sources: [W('Khwarazmian Empire'), W('Muhammad II of Khwarazm'), W('Ala ad-Din Tekish'), W('Mongol invasion of the Khwarazmian Empire'), IR('Chorasmia ii. In Islamic times', 'chorasmia-ii'), NE],
}, [
  [1097, 'Qutb al-Din Muhammad, Khwarazmshah under the Seljuks (1097)', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM] }],
  [1141, 'Battle of Qatwan (1141): tribute to the Qara Khitai', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM] }],
  [1194, 'Tekish beats Toghrul III at Rayy (1194): Khurasan and western Iran', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM], iran: ['Khurasan and western Iran', KW_IRAN] }],
  [1206, 'Muhammad II takes Ghurid Herat and Balkh (1206)', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM], iran: ['Khurasan and western Iran', KW_IRAN], afghan: ['Herat and Balkh', ['HERAT', 'BALKH']] }],
  [1207, 'Muhammad II takes Bukhara (1207)', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM], iran: ['Khurasan and western Iran', KW_IRAN], afghan: ['Herat and Balkh', ['HERAT', 'BALKH']], bukhara: ['Bukhara', ['BU', 'NW']] }],
  [1212, 'Uthman executed; Samarkand becomes the capital (1212)', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM], iran: ['Khurasan and western Iran', KW_IRAN], afghan: ['Herat and Balkh', ['HERAT', 'BALKH']], bukhara: ['Bukhara', ['BU', 'NW']], transoxiana: ['Transoxiana (Samarkand, Chach, Fergana, Otrar)', KW_TRANS] }],
  [1219, 'Genghis Khan besieges Otrar (autumn 1219)', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM], iran: ['Khurasan and western Iran', KW_IRAN], afghan: ['Herat and Balkh', ['HERAT', 'BALKH']], bukhara: ['Bukhara', ['BU', 'NW']], transoxiana: ['Transoxiana (Samarkand, Chach, Fergana, Otrar)', KW_TRANS] }],
  [1220, 'Bukhara and Samarkand fall (1220); Gurganj falls in 1221, Jalal al-Din fights on to 1231', { khwarazm: ['Khwarazm (Gurganj)', KHWARAZM], iran: ['Khurasan and western Iran', KW_IRAN] }],
]);

const BK_1500 = ['SA', 'BU', 'NW', 'QA', 'JI', 'SUGHD'];
const BK_1503 = [...BK_1500, 'TO', 'SI', 'FA', 'NG', 'AN', 'KG_S'];
const BK_1505 = [...BK_1503, 'SU', 'HISAR', 'KHATLON'];
const BK_1507 = [...BK_1505, 'BALKH', 'LEBAP'];
const BK_1598 = BK_1507.filter((p) => p !== 'TO' && p !== 'SI');
const BK_1709 = BK_1598.filter((p) => !['FA', 'NG', 'AN', 'KG_S', 'SUGHD'].includes(p));
const BK_1737 = BK_1709.filter((p) => p !== 'BALKH');
const KHURASAN = { khurasan: ['Herat and Merv', ['HERAT', 'MARY']] };
const KHW = { khwarazm: ['Khwarazm (Urgench)', KHWARAZM] };
const bukhara = build({
  id: 'bukhara-khanate', name: 'Khanate of Bukhara', color: '#1E88A8',
  description: 'Muhammad Shaybani, grandson of the Uzbek khan Abu’l-Khayr, took Samarkand and Bukhara (1500; Babur held Samarkand again for a few months in 1500–01), Tashkent and Fergana (1503), Hisar and Urgench (1505), Balkh (1506) and Herat (1507), and was killed by Shah Ismail I at Merv in December 1510. Khwarazm and Khurasan were lost; Babur, with Safavid help, held Samarkand and Bukhara from October 1511 until Ubaydullah beat him in 1512. The Shaybanids ruled as a family of appanage princes until Abdullah Khan II reunited them (Balkh 1573, Tashkent 1576, Herat 1588). After his death (1598) Tashkent went to the Kazakhs and Herat to Shah Abbas; the Janids (Ashtarkhanids) ruled from 1599. Fergana broke away as Kokand in 1709; Nadir Shah’s son took Balkh in 1737 and Nadir made Bukhara a vassal in 1740. From 1747 the Manghit atalyks ruled, and in 1785 Shah Murad took the title emir: the Emirate of Bukhara.',
  nameAt: [[1500, 'Shaybanid Khanate'], [1599, 'Khanate of Bukhara (Janids)'], [1740, 'Khanate of Bukhara (vassal of Nadir Shah)'], [1747, 'Khanate of Bukhara (Manghit atalyks)'], [1785, 'Emirate of Bukhara']],
  timelineItemIds: ['uz-shaybanids-bukhara', 'uz-emirate-bukhara'], confidence: CONF.khanate,
  sources: [W('Khanate of Bukhara'), W('Muhammad Shaybani'), W('Abdullah Khan II'), W('Janid dynasty'), W('Emirate of Bukhara'), IR('Bukhara iv. From the Mongol invasion to the Russian conquest', 'bukhara-iv'), NE],
}, [
  [1500, 'Muhammad Shaybani takes Samarkand and Bukhara (1500)', { bukhara: ['Bukhara and Samarkand', BK_1500] }],
  [1503, 'Shaybani takes Tashkent and Fergana (1503)', { bukhara: ['Transoxiana, Tashkent and Fergana', BK_1503] }],
  [1505, 'Urgench falls after a ten-month siege; Hisar taken (1505)', { bukhara: ['Transoxiana, Tashkent and Fergana', BK_1505], ...KHW }],
  [1507, 'Balkh (1506) and Herat (1507) taken from the Timurids', { bukhara: ['Transoxiana, Tashkent, Fergana and Balkh', BK_1507], ...KHW, ...KHURASAN }],
  [1510, 'Shaybani killed by Shah Ismail at Merv (December 1510)', { bukhara: ['Transoxiana, Tashkent, Fergana and Balkh', BK_1507] }],
  [1511, 'Babur holds Samarkand and Bukhara with Safavid help (October 1511 – 1512)', { bukhara: ['Transoxiana, Tashkent, Fergana and Balkh', BK_1507] }],
  [1512, 'Ubaydullah beats Babur and the Safavids (1512)', { bukhara: ['Transoxiana, Tashkent, Fergana and Balkh', BK_1507] }],
  [1557, 'Abdullah Khan II begins to reunite the appanages (Bukhara 1557)', { bukhara: ['Transoxiana, Tashkent, Fergana and Balkh', BK_1507] }],
  [1588, 'Abdullah Khan II takes Herat (1588)', { bukhara: ['Transoxiana, Tashkent, Fergana and Balkh', BK_1507], ...KHURASAN }],
  [1598, 'Abdullah II dies (1598): Tashkent to the Kazakhs, Herat to Shah Abbas', { bukhara: ['Transoxiana, Fergana and Balkh', BK_1598] }],
  [1599, 'The Janids (Ashtarkhanids) take the throne (1599)', { bukhara: ['Transoxiana, Fergana and Balkh', BK_1598] }],
  [1709, 'Fergana breaks away under Shahrukh Biy (1709)', { bukhara: ['Transoxiana and Balkh', BK_1709] }],
  [1737, 'Nadir Shah’s son Reza Qoli takes Balkh (1737)', { bukhara: ['Transoxiana', BK_1737] }],
  [1740, 'Nadir Shah makes Bukhara a vassal (1740)', { bukhara: ['Transoxiana', BK_1737] }],
  [1747, 'The Manghit atalyks take power (1747)', { bukhara: ['Transoxiana', BK_1737] }],
  [1785, 'Shah Murad takes the title emir (1785)', { bukhara: ['Transoxiana', BK_1737] }],
  [1815, 'The Emirate of Bukhara', { bukhara: ['Transoxiana', BK_1737] }],
]);

const khiva = build({
  id: 'khiva-khanate', name: 'Khanate of Khiva', color: '#7B5EA7',
  description: 'In 1511 the Arabshahid brothers Ilbars and Balbars, rival descendants of Genghis Khan’s son Jochi, took Khwarazm from the Safavids after Shaybani’s death and founded an independent Uzbek khanate ruled from Urgench (Konye-Urgench). The Bukharan khans occupied it twice (Ubaydullah 1538, Abdullah II 1593–98). When the western branch of the Amu Darya dried up around 1600, Arab Muhammad Khan moved the capital to Khiva, which gave the state its later name. Abu al-Ghazi Bahadur (1643–63), the historian-khan, founded new Urgench (1646). Nadir Shah took Khiva in 1740; from 1804 the Qongrat inaks ruled as khans. Russia made it a protectorate in 1873.',
  nameAt: [[1511, 'Khanate of Khwarazm (Urgench)'], [1600, 'Khanate of Khiva'], [1740, 'Khanate of Khiva (vassal of Nadir Shah)'], [1747, 'Khanate of Khiva'], [1804, 'Khanate of Khiva (Qongrats)']],
  timelineItemIds: ['uz-khiva'], confidence: CONF.khanate,
  sources: [W('Khanate of Khiva'), W('Abu al-Ghazi Bahadur'), IR('Khiva', 'khiva'), UNESCO('Itchan Kala', 543), NE],
}, [
  [1511, 'Ilbars and Balbars found the khanate at Urgench (1511)', KHW],
  [1600, 'The Amu Darya shifts; the capital moves to Khiva (c. 1600)', { khwarazm: ['Khwarazm (Khiva)', KHWARAZM] }],
  [1740, 'Nadir Shah takes Khiva (1740)', { khwarazm: ['Khwarazm (Khiva)', KHWARAZM] }],
  [1804, 'Eltuzar, the first Qongrat khan (1804)', { khwarazm: ['Khwarazm (Khiva)', KHWARAZM] }],
  [1815, 'The Khanate of Khiva', { khwarazm: ['Khwarazm (Khiva)', KHWARAZM] }],
]);

const FERGANA = ['FA', 'NG', 'AN'];
const kokand = build({
  id: 'kokand-khanate', name: 'Khanate of Kokand', color: '#5DA271',
  description: 'In 1709 Shahrukh Biy, leader of the Ming tribe, broke the Fergana valley away from Bukhara; Abd al-Karim Biy built the fortress of Kokand in 1740 and made it the capital, and Irdana Biy accepted nominal Qing overlordship after 1759. Alim (1798–1810), who took the title khan, built an army of Tajik highlanders, annexed Ura-Tyube (1806) and Khujand and took Tashkent (c. 1809). Kokand later reached into the Kazakh steppe and the Tian Shan; Russia took Tashkent in 1865 and annexed the khanate in 1876.',
  nameAt: [[1709, 'Ming beys of Fergana'], [1740, 'Kokand'], [1801, 'Khanate of Kokand']],
  timelineItemIds: ['uz-kokand'], confidence: CONF.khanate,
  sources: [W('Khanate of Kokand'), W('Alim Khan of Kokand'), IR('Kokand', 'kokand'), NE],
}, [
  [1709, 'Shahrukh Biy breaks Fergana away from Bukhara (1709)', { fergana: ['Fergana valley', FERGANA] }],
  [1740, 'Abd al-Karim Biy builds the Kokand fortress: the capital (1740)', { fergana: ['Fergana valley (Kokand)', FERGANA] }],
  [1798, 'Alim takes power (1798; khan from 1801)', { fergana: ['Fergana valley (Kokand)', FERGANA] }],
  [1806, 'Ura-Tyube and Khujand annexed (1806)', { fergana: ['Fergana valley, Khujand and Ura-Tyube', [...FERGANA, 'SUGHD']] }],
  [1809, 'Alim takes Tashkent (c. 1809)', { fergana: ['Fergana valley, Khujand and Tashkent', [...FERGANA, 'SUGHD', 'TO', 'SI']] }],
  [1815, 'The Khanate of Kokand', { fergana: ['Fergana valley, Khujand and Tashkent', [...FERGANA, 'SUGHD', 'TO', 'SI']] }],
]);

export const uzbekistanPolities = [sogdia, afrighid, samanid, karakhanid, khwarezmia, bukhara, khiva, kokand];

// ---- Fixes to older shapes over Uzbekistan -----------------------------------------------------------
//
//  - The Khwarezmian Empire is replaced by id (above): Transoxiana from 1212, not 1200.
//  - The Timurid Empire's six-point Transoxiana (which missed Bukhara and Khwarazm) is redrawn from the
//    pieces, the same rings in every keyframe: Transoxiana, Hisar, Chach (to Yunus Khan's capture of
//    Tashkent, 1484), Fergana (to 1503) and Khwarazm (1380–1505), with one-year steps for the losses
//    to the Moghuls and the Shaybanids; edgeGrace 1, so it ends in 1506 (Balkh falls; Herat 1507).
//  - The Russian Empire's 'central-asia' ring (1850 and 1914 keyframes) is dropped: from 1700 it grew
//    over Bukhara, Samarkand, Khiva, Balkh and Kashgar, a century or more before Russia took them;
//    the nations layer draws Russian Turkestan from 1815.
//  - The Mongol Empire's first keyframe (1227, with 'central-asia') was drawn from 1207; Mongolia-only
//    keyframes at 1219 and 1220 hold Central Asia back until the conquest (1220–21).
//  - The Sasanian 'parthia-east' ring (400) and the Göktürk 'steppe' ring (580), which ran over
//    Bukhara and Samarkand, are trimmed to the Amu Darya and to the north of Sogdia.
const TIMURID = {
  transoxiana: ['Transoxiana (Samarkand, Bukhara, Kesh)', ['SA', 'BU', 'NW', 'QA', 'JI', 'SUGHD']],
  hisar: ['Hisar, Chaghaniyan and Khuttal', ['SU', 'HISAR', 'KHATLON']],
  chach: ['Tashkent (Chach)', ['TO', 'SI']],
  fergana: ['Fergana (Andijan)', ['FA', 'NG', 'AN', 'KG_S']],
  khwarazm: ['Khwarazm (Urgench)', KHWARAZM],
};
const TIMURID_STEPS = [
  [1370, 'Timur, master of Transoxiana (1370)', ['transoxiana', 'hisar', 'chach', 'fergana']],
  [1380, 'Timur takes Urgench (1379): Khwarazm', ['transoxiana', 'hisar', 'chach', 'fergana', 'khwarazm']],
  [1484, 'Yunus Khan takes Tashkent (1484)', ['transoxiana', 'hisar', 'fergana', 'khwarazm']],
  [1500, 'Muhammad Shaybani takes Samarkand and Bukhara (1500)', ['hisar', 'fergana', 'khwarazm']],
  [1503, 'Babur loses Fergana (1503)', ['hisar', 'khwarazm']],
  [1505, 'Shaybani takes Urgench and Hisar (1505)', []],
];
const SASANID_TRIM = ['sassanid-empire', 400, 'parthia-east', [[58, 39], [68, 40]], [[58, 38.6], [61.2, 38.2], [63.4, 37.8], [65.4, 37.45], [67.2, 37.15], [68.6, 37.1]]];
const GOKTURK_TRIM = ['gokturk-khaganate', 580, 'steppe', [[65, 40]], [[69, 40.6], [66.5, 41.4]]];
export const UZ_TRIMS = [SASANID_TRIM, GOKTURK_TRIM].map(([id, y, rid]) => [id, y, rid]);
export const uzbekistanShapeFixes = {
  timurid: ['transoxiana redrawn from the pieces', 'hisar, chach, fergana, khwarazm regions', 'keyframes 1370–1505', 'edgeGrace 1'],
  'russian-empire': { dropRegions: ['central-asia'] },
  'mongol-empire': ['Mongolia-only keyframes 1219 and 1220'],
  'sassanid-empire': 'trimmed',
  'gokturk-khaganate': 'trimmed',
};

/** Apply `uzbekistanShapeFixes` (runs after the packs are appended; throws if a target is missing). */
export function applyUzbekistanShapeFixes(entities) {
  const find = (id) => {
    const e = entities.find((x) => x.id === id);
    if (!e) throw new Error(`uzbekistan fixes: no entity ${id}`);
    return e;
  };
  const kfAt = (e, y) => {
    const kf = e.overlays.find((o) => o.year === y);
    if (!kf) throw new Error(`uzbekistan fixes: ${e.id} has no ${y} keyframe`);
    return kf;
  };
  const rid = (r) => (typeof r === 'string' ? r : r.id);

  // 1. Timurids: Central Asian regions from the pieces, one-year steps; Iran and Afghanistan as before.
  const tim = find('timurid');
  if (!tim.overlays.some((o) => o.regions.some((r) => rid(r) === 'hisar'))) {
    const ring = Object.fromEntries(Object.entries(TIMURID).map(([k, [, ps]]) => [k, ringOf(`timurid ${k}`, ps)]));
    const ownOf = (y) => {
      let s = TIMURID_STEPS[0];
      for (const st of TIMURID_STEPS) if (st[0] <= y) s = st;
      return s;
    };
    const old = tim.overlays.map((o) => ({ ...o, regions: o.regions.filter((r) => rid(r) !== 'transoxiana') }));
    const outerAt = (y) => {
      // The Iranian / Afghan regions of the nearest older keyframe at or before y (none before 1405).
      let k = null;
      for (const o of old) if (o.year <= y) k = o;
      return k ? k.regions.map((r) => (typeof r === 'string' ? r : { ...r })) : [];
    };
    const years = new Set(old.map((o) => o.year));
    TIMURID_STEPS.forEach(([y], i) => {
      years.add(y);
      if (i > 0 && y - 1 > TIMURID_STEPS[i - 1][0]) years.add(y - 1);
    });
    tim.overlays = [...years].filter((y) => y <= 1505).sort((a, b) => a - b).map((y) => {
      const s = ownOf(y);
      const base = old.find((o) => o.year === y);
      const own = s[2].map((k) => ({ id: k, name: TIMURID[k][0], ring: ring[k] }));
      return { year: y, label: base?.label && y !== s[0] ? base.label : s[1], approximation: A, regions: [...own, ...outerAt(y)] };
    });
    tim.keyYears = [...new Set([...(tim.keyYears || []), ...TIMURID_STEPS.map(([y]) => y)])].sort((a, b) => a - b);
    tim.timelineItemIds = [...new Set([...(tim.timelineItemIds || []), 'uz-timurids'])];
    tim.sources = [...(tim.sources || []), W('Timurid Empire'), UNESCO('Samarkand – Crossroad of Cultures', 603), NE];
    tim.edgeGrace = 1;
  }

  // 2. Russian Empire: no Central Asia before the nations layer.
  const ru = find('russian-empire');
  let dropped = 0;
  for (const kf of ru.overlays) {
    const before = kf.regions.length;
    kf.regions = kf.regions.filter((r) => rid(r) !== 'central-asia');
    dropped += before - kf.regions.length;
  }
  if (!dropped) throw new Error('uzbekistan fixes: russian-empire has no central-asia region');

  // 3. Mongol Empire: Mongolia only until the conquest of Transoxiana (1220–21).
  const mon = find('mongol-empire');
  const m1227 = kfAt(mon, 1227);
  for (const y of [1219, 1220]) {
    if (mon.overlays.some((o) => o.year === y)) continue;
    const at = mon.overlays.findIndex((o) => o.year > y);
    mon.overlays.splice(at, 0, { ...m1227, year: y, label: y === 1219 ? 'Genghis Khan invades the Khwarazmian Empire (1219)' : 'Bukhara and Samarkand fall (1220)', regions: m1227.regions.filter((r) => rid(r) === 'mongolia') });
  }

  // 4. Trims: swap a run of vertices for a line outside Sogdia.
  const same = (p, q) => Math.abs(p[0] - q[0]) < 1e-9 && Math.abs(p[1] - q[1]) < 1e-9;
  for (const [id, y, regionId, drop, add] of [SASANID_TRIM, GOKTURK_TRIM]) {
    const kf = kfAt(find(id), y);
    const i = kf.regions.findIndex((r) => rid(r) === regionId);
    if (i < 0) throw new Error(`uzbekistan fixes: ${id} ${y} has no region ${regionId}`);
    const src = kf.regions[i].ring;
    if (!src) throw new Error(`uzbekistan fixes: ${id} ${y} ${regionId} has no inline ring`);
    const open = src.slice(0, -1);
    if (open.some((p) => same(p, add[0]))) continue; // already trimmed
    const k = open.findIndex((p) => same(p, drop[0]));
    if (k < 0) throw new Error(`uzbekistan fixes: ${id} ${y} ${regionId} lacks ${drop[0]}`);
    const n = open.length;
    for (let j = 1; j < drop.length; j++) if (!same(open[(k + j) % n], drop[j])) throw new Error(`uzbekistan fixes: ${id} ${y} ${regionId} vertices not consecutive at ${drop[j]}`);
    const rot = [...open.slice(k), ...open.slice(0, k)];
    const out = [...add, ...rot.slice(drop.length)];
    kf.regions[i] = { ...kf.regions[i], ring: ensureClockwise([...out, out[0]]) };
  }
}
