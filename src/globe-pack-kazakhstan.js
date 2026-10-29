/**
 * Day 73 — Phase 5 country pack 2 (Central Asia), globe backfill: Kazakhstan (ROADMAP item 12).
 *
 * Kazakhstan had no country timeline (now data/countries/kazakhstan.json) and on the globe, before
 * the 1815 nations layer, only peoples and presence washes, the Karakhanids' Syr Darya towns, the
 * Khwarezmian Empire's Otrar (1212–20), the Mongol Empire and the Russian Empire's Siberian ring:
 * no Wusun or Kangju, no Turgesh, Oghuz or Kipchaks, no Moghulistan, no Abu'l-Khayr, no Nogai Horde,
 * no Dzungars and no Kazakh Khanate at all. This module draws the steppe's own states from the Wusun
 * and Kangju (2nd century BCE) to 1815:
 *
 *   Wusun · Kangju · the Turgesh Khaganate · the Oghuz Yabgu State · the Kimeks and Kipchaks ·
 *   Moghulistan · Abu'l-Khayr's Uzbek Khanate · the Nogai Horde · the Kazakh Khanate (and its three
 *   jüz) · the Dzungar Khanate
 *
 * and adds Kokand's Syr Darya conquests (1814) to the Uzbekistan pack's Khanate of Kokand. From 1815
 * the nations layer takes over (the Kazakh jüz, Kokand, Russian Turkestan and the Steppe, the Kazakh
 * SSR, Kazakhstan), so no keyframe here is later than 1815, and the last keyframes use the 1815
 * nations table's provinces (globe-nations-table-1815.js).
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"): the same way as the Uzbekistan pack,
 * from the shared Central Asia pieces (globe-central-asia-pieces.js: Natural Earth admin-1 provinces,
 * now including Kazakhstan's 14 oblasts, simplified together so neighbours share their borders). Two
 * hand rings east of the Kazakh border stand in for the upper Ili valley (Kulja) and Dzungaria.
 * Oblasts are a very coarse stand-in for nomad pastures, whose limits moved with the seasons: these
 * shapes show who held the steppe and the oasis towns, not borders.
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';
import { CA_PIECES } from './globe-central-asia-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}` });
const NE = { title: 'Natural Earth — 1:10m admin-1 states and provinces (piece outlines)', url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/' };

/** The upper Ili valley around Kulja (Yining), hand-drawn just east of the Kazakh border. */
export const ILI = [[80.9, 43.15], [80.9, 44.45], [82.2, 44.6], [83.9, 43.95], [83.5, 43.25], [82.0, 43.05], [80.9, 43.15]];
/**
 * Dzungaria (the Dzungarian basin, Tarbagatai and Altai foothills), hand-drawn east of the Kazakh border.
 * Its east side stops short of the Qing Empire's schematic 'mongolia' ring (1680–1750 morph), which
 * reaches 87°E, so the Dzungars' Urumqi and Barkol side is not drawn.
 */
export const DZUNGARIA = [[82.4, 44.75], [82.9, 46.0], [83.6, 46.6], [85.6, 47.1], [86.4, 48.0], [87.6, 48.4], [89.6, 47.2], [89.0, 46.2], [88.0, 45.0], [87.2, 44.3], [86.6, 43.8], [85.6, 43.75], [84.1, 44.05], [82.4, 44.75]];

const HAND = { ILI, DZUNGARIA };
function ringOf(label, names) {
  const ps = names.map((n) => {
    if (HAND[n]) return HAND[n];
    if (!CA_PIECES[n]) throw new Error(`kazakhstan pack: no piece ${n}`);
    return CA_PIECES[n];
  });
  return ensureClockwise(ps.length === 1 ? ps[0] : mergeRings(label, ...ps));
}

/**
 * steps: [[year, label, { regionId: [name, pieces] }], …]. Keyframes are written for every step
 * year and the year before it (still the old extent), so each change is a one-year step. A region
 * whose pieces are not all touching is split into one region per touching group by the caller.
 */
export const KZ_STEPS = {};
const RING_CACHE = new Map();
function build(meta, steps) {
  KZ_STEPS[meta.id] = steps;
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

const OBLASTS = 'Drawn with modern oblasts as stand-ins for pastures and town districts, so the edges are rough; nomad ranges moved with the seasons.';
const CONF = {
  ancient: {
    level: 'conjectural',
    reason: `Known almost only from the Chinese histories (the Shiji and the Han shu) and from kurgans and settlements; where their pastures ended is not recorded. ${OBLASTS}`,
  },
  khaganate: {
    level: 'conjectural',
    reason: `Known from Chinese, Arabic and Persian sources (the Tang histories, Ibn Khordadbeh, Ibn Fadlan, the Hudud al-'Alam, Gardizi) and Turkic inscriptions; their capitals and rough ranges are recorded, their limits are not. ${OBLASTS}`,
  },
  horde: {
    level: 'approximate',
    reason: `Persian, Chagatai and Russian sources (Mirza Haidar Dughlat's Tarikh-i Rashidi, Ruzbihan, Russian embassy reports) name the khans, their towns and the steppes they roamed; the limits between hordes were shifting pastures. ${OBLASTS}`,
  },
};

// ---- Polities ----------------------------------------------------------------------------------------

const wusun = build({
  id: 'wusun', name: 'Wusun', color: '#C2A14D',
  description: 'The Wusun were horse-herding nomads who, after the Xiongnu drove the Yuezhi west in the 160s–130s BCE, took over the Ili and Issyk-Kul valleys (Zhetysu, Semirechye) and built a confederation of perhaps 600,000 people under a ruler titled kunmo, with his seat at Chigu (the "Red Valley") near Issyk-Kul. Han China courted them against the Xiongnu: Zhang Qian visited around 115 BCE, a Han princess, Liu Xijun, married the kunmo around 105 BCE, and in 71 BCE a Han–Wusun army beat the Xiongnu. From 53 BCE they were split into a Greater and a Lesser kunmo. Pressed by the Rouran, they last sent envoys to the Northern Wei court in the 430s and then disappear from the sources.',
  nameAt: [[-130, 'Wusun'], [-53, 'Wusun (Greater and Lesser kunmo)']],
  timelineItemIds: ['kz-wusun-kangju'], confidence: CONF.ancient,
  sources: [W('Wusun'), W('Liu Xijun'), W('Zhang Qian'), NE],
}, [
  [-130, 'Wusun take the Ili and Issyk-Kul valleys (c. 130 BCE)', { zhetysu: ['Zhetysu and Issyk-Kul', ['ALA', 'KG_N']] }],
  [-71, 'Han and Wusun defeat the Xiongnu (71 BCE)', { zhetysu: ['Zhetysu and Issyk-Kul', ['ALA', 'KG_N']] }],
  [-53, 'Split into a Greater and a Lesser kunmo (53 BCE)', { zhetysu: ['Zhetysu and Issyk-Kul', ['ALA', 'KG_N']] }],
  [436, 'Last Wusun embassy to the Northern Wei (430s); the Rouran press them into the Tian Shan', { zhetysu: ['Issyk-Kul and the Tian Shan', ['KG_N']] }],
]);

const kangju = build({
  id: 'kangju', name: 'Kangju', color: '#A0522D',
  description: 'Kangju was a nomadic confederation of the middle Syr Darya, the Karatau hills and the Talas valley, known from Zhang Qian’s report (c. 128 BCE) as a country of 120,000 families that paid tribute to the Yuezhi in the south and the Xiongnu in the east. The rebel Xiongnu chanyu Zhizhi took refuge with them and built a fort on the Talas, where a Han army destroyed him in 36 BCE. The Otrar–Karatau oasis culture (Kaunchi) is often linked to Kangju. Its later lands were taken over by the Hephthalites and the Turks; Chinese sources still use the name in the 4th–5th centuries.',
  timelineItemIds: ['kz-wusun-kangju'], confidence: CONF.ancient,
  sources: [W('Kangju'), W('Battle of Zhizhi'), W('Zhizhi Chanyu'), NE],
}, [
  [-128, 'Zhang Qian describes Kangju (c. 128 BCE)', { syrdarya: ['Middle Syr Darya, Karatau and Talas', ['YUZ', 'ZHA', 'KZY']] }],
  [-36, 'Han army kills the chanyu Zhizhi on the Talas (36 BCE)', { syrdarya: ['Middle Syr Darya, Karatau and Talas', ['YUZ', 'ZHA', 'KZY']] }],
  [270, 'Kangju in decline (3rd century)', { syrdarya: ['Middle Syr Darya and Karatau', ['YUZ', 'KZY']] }],
  [380, 'The name fades from the sources (late 4th century)', { syrdarya: ['Middle Syr Darya', ['YUZ']] }],
]);

const TURGESH = ['ALA', 'ZHA', 'KG_N'];
const turgesh = build({
  id: 'turgesh', name: 'Turgesh Khaganate', color: '#8E6C8A',
  description: 'The Turgesh, a tribe of the Western Turks, took Suyab in the Chu valley under Wuzhile in 699 and ruled Zhetysu as their own khaganate. Under Suluk (717–738), the "Abu Muzahim" (the Butting One) of the Arab chroniclers, they fought the caliphate’s armies in Transoxiana for twenty years and won the Day of Thirst (724). After Suluk was murdered in 738 the "Yellow" and "Black" Turgesh fought each other; the Chinese defeated their last khagan in 739–742 and the Karluks took Suyab in 766.',
  timelineItemIds: ['kz-turkic-khaganates'], confidence: CONF.khaganate,
  sources: [W('Turgesh'), W('Suluk'), W('Suyab'), W('Day of Thirst'), NE],
}, [
  [699, 'Wuzhile takes Suyab (699)', { zhetysu: ['Zhetysu and the Chu and Talas valleys (Suyab, Taraz)', TURGESH] }],
  [717, 'Suluk khagan (717–738) fights the Arabs', { zhetysu: ['Zhetysu and the Chu and Talas valleys (Suyab, Taraz)', TURGESH] }],
  [738, 'Suluk murdered (738): Yellow and Black Turgesh at war', { zhetysu: ['Zhetysu and the Chu valley', ['ALA', 'KG_N']] }],
  [766, 'The Karluks take Suyab (766)', { zhetysu: ['Zhetysu (Suyab)', ['ALA']] }],
]);

const oghuz = build({
  id: 'oghuz-yabgu', name: 'Oghuz Yabgu State', color: '#6B8E23',
  description: 'The Oghuz Turks moved west from Zhetysu in the 8th century and ruled the steppe from the lower Syr Darya to the Aral and the Caspian under a yabgu whose winter seat was Yangikent (Dih-i Naw, the “New Town”) near the river’s mouth. Ibn Fadlan crossed their lands in 922. In 965 they helped Sviatoslav of Kiev destroy the Khazars; around 985 the Seljuk clan broke away and later conquered Iran. Shah Malik, the last important yabgu, took Khwarazm (1041) but was killed by the Seljuks, and the Kipchaks drove the Oghuz out of the steppe by the 1050s.',
  timelineItemIds: ['kz-oghuz-kipchaks'], confidence: CONF.khaganate,
  sources: [W('Oghuz Yabgu State'), W('Jankent'), W('Ahmad ibn Fadlan'), W('Seljuk dynasty'), NE],
}, [
  [750, 'The Oghuz on the lower Syr Darya (mid-8th century)', { steppe: ['Lower Syr Darya and the Aral steppe (Yangikent)', ['KZY', 'AKT']] }],
  [922, 'Ibn Fadlan crosses the Oghuz steppe (922)', { steppe: ['Lower Syr Darya and the Aral steppe (Yangikent)', ['KZY', 'AKT']] }],
  [965, 'With Sviatoslav, the Oghuz break the Khazars (965): Mangyshlak', { steppe: ['Lower Syr Darya and the Aral steppe (Yangikent)', ['KZY', 'AKT']], mangyshlak: ['Mangyshlak', ['MAN']] }],
  [1041, 'Shah Malik takes Khwarazm (1041); the Kipchaks press from the north', { steppe: ['Lower Syr Darya (Yangikent)', ['KZY']], mangyshlak: ['Mangyshlak', ['MAN']] }],
  [1055, 'The Kipchaks drive the Oghuz from the steppe (1050s)', { mangyshlak: ['Mangyshlak', ['MAN']] }],
]);

const KIMEK = ['VOS', 'PAV', 'KAR'];
const KIPCHAK_1030 = ['VOS', 'PAV', 'KAR', 'AKM', 'KUS', 'SEV'];
const KIPCHAK_1055 = [...KIPCHAK_1030, 'AKT', 'KZY', 'ZAP', 'ATY'];
const kipchak = build({
  id: 'kimek-kipchak', name: 'Kimeks and Kipchaks', color: '#B8860B',
  description: 'The Kimek confederation grew up on the middle Irtysh in the 9th century; its western wing, the Kipchaks, took over in the early 11th century and pushed the Oghuz out of the Aral steppe. From then the whole steppe from the Irtysh to the Volga was the Dasht-i Qipchaq, the "Kipchak Steppe" of the Persian sources; the western Kipchaks were the Cumans or Polovtsians of Europe. They had no single state: many clans, khans who married into the Khwarazmshahs’ family and served in their armies. The Mongols overran the eastern Kipchaks from 1218 and the western ones by 1237; their language became the base of the Golden Horde’s Turkic and of modern Kazakh.',
  nameAt: [[880, 'Kimek confederation'], [1030, 'Kipchaks (Dasht-i Qipchaq)']],
  timelineItemIds: ['kz-oghuz-kipchaks'], confidence: CONF.khaganate,
  sources: [W('Kimek–Kipchak confederation'), W('Kipchaks'), W('Cumania'), W('Hudud al-\'Alam'), NE],
}, [
  [880, 'The Kimeks on the Irtysh (9th century)', { steppe: ['Irtysh and the Kazakh uplands', KIMEK] }],
  [1030, 'The Kipchaks take over (early 11th century)', { steppe: ['The Kipchak steppe', KIPCHAK_1030] }],
  [1055, 'Oghuz driven out: the Dasht-i Qipchaq to the Volga (1050s)', { steppe: ['The Kipchak steppe (Dasht-i Qipchaq)', KIPCHAK_1055] }],
  [1218, 'The Mongols cross the steppe (1218–20); the western Kipchaks fall by 1237', { steppe: ['Western Kipchak steppe', ['AKT', 'KZY', 'ZAP', 'ATY', 'KUS']] }],
  [1220, 'Mongol conquest of the Kipchak steppe', { steppe: ['Western Kipchak steppe', ['ZAP', 'ATY']] }],
]);

const moghulistan = build({
  id: 'moghulistan', name: 'Moghulistan', color: '#4F6D7A',
  description: 'Moghulistan ("land of the Mongols") was the eastern half of the Chagatai Khanate, which broke away in 1347 when the Dughlat emir Bulaji raised Tughlugh Timur as khan. Its nomads held Zhetysu, the Issyk-Kul and the upper Ili, with the town of Almaliq, and raided Transoxiana; Timur campaigned against them repeatedly (1370s–1390s). Khan Esen Buqa let the Kazakh sultans Kerei and Janibek settle on the Chu and Talas around 1465. In the 1510s Moghulistan lost Zhetysu to Kasym Khan’s Kazakhs, and Sultan Said Khan moved the Moghul court to Kashgar (1514), founding the Yarkent Khanate.',
  timelineItemIds: ['kz-mongols-moghulistan'], confidence: CONF.horde,
  sources: [W('Moghulistan'), W('Tughlugh Timur'), W('Esen Buqa II'), W('Yarkent Khanate'), NE],
}, [
  [1347, 'Bulaji raises Tughlugh Timur as khan (1347)', { zhetysu: ['Zhetysu, Issyk-Kul and the upper Ili', ['ALA', 'ZHA', 'KG_N']], ili: ['Upper Ili (Almaliq)', ['ILI']] }],
  [1465, 'Kerei and Janibek settle on the Chu and Talas (c. 1465)', { zhetysu: ['Zhetysu, Issyk-Kul and the upper Ili', ['ALA', 'KG_N']], ili: ['Upper Ili (Almaliq)', ['ILI']] }],
  [1511, 'Kasym Khan’s Kazakhs take Zhetysu (1510s)', { zhetysu: ['Issyk-Kul and the Tian Shan', ['KG_N']], ili: ['Upper Ili (Almaliq)', ['ILI']] }],
  [1514, 'Sultan Said Khan moves to Kashgar (1514): the Yarkent Khanate', { zhetysu: ['Issyk-Kul and the Tian Shan', ['KG_N']] }],
]);

const uzbekKhanate = build({
  id: 'abulkhair-khanate', name: 'Uzbek Khanate (Abu’l-Khayr)', color: '#2F6F9F',
  description: 'Abu’l-Khayr Khan, a Shibanid descendant of Genghis Khan, was proclaimed khan of the nomadic Uzbeks at Tura (Tyumen) in 1428 and united the steppe east of the Ural river. He sacked Urgench (1431) and in 1446 took the Syr Darya towns — Sighnaq, which became his capital, Suzak, Arkuk and Uzgend — but was badly beaten by the Oirats in 1457. Two Jochid sultans, Kerei and Janibek, broke away with their people to Moghulistan around 1465; after Abu’l-Khayr’s death in 1468 his khanate fell apart. His grandson Muhammad Shaybani led the remaining Uzbeks south to conquer Transoxiana (1500).',
  timelineItemIds: ['kz-kazakh-khanate'], confidence: CONF.horde,
  sources: [W('Abu\'l-Khayr Khan'), W('Abulkhair Khanate'), W('Sighnaq'), W('Muhammad Shaybani'), NE],
}, [
  [1428, 'Abu’l-Khayr proclaimed khan of the Uzbeks (1428)', { steppe: ['Steppe between the Tobol and the Syr Darya', ['KUS', 'AKT', 'AKM', 'KAR']] }],
  [1446, 'Abu’l-Khayr takes the Syr Darya towns; Sighnaq his capital (1446)', { steppe: ['Steppe and the Syr Darya towns (Sighnaq)', ['KUS', 'AKT', 'AKM', 'KAR', 'KZY', 'YUZ']] }],
  [1465, 'Kerei and Janibek break away (c. 1465)', { steppe: ['Steppe and the Syr Darya towns (Sighnaq)', ['KUS', 'AKT', 'AKM', 'KAR', 'KZY', 'YUZ']] }],
  [1468, 'Abu’l-Khayr dies (1468); the khanate breaks up', { steppe: ['Syr Darya towns', ['YUZ']] }],
]);

const NOGAI = ['ATY', 'ZAP', 'MAN'];
const nogai = build({
  id: 'nogai-horde', name: 'Nogai Horde', color: '#7A5C3E',
  description: 'The Nogai Horde grew out of the followers of the Golden Horde emir Edigu (died 1419); by the 1440s his sons and grandsons ruled the steppe between the Volga and the Emba from Saraychik on the lower Ural (Yaik) river, as beys of the Mangit clan who never took the title of khan. In the 16th century they were the Kazakhs’ western neighbours and rivals. Ismail Bey sided with Moscow after it took Astrakhan (1556), and the horde split into the Great and Lesser Nogai; Cossacks sacked Saraychik in 1580, and in the 1630s the Kalmyks drove the Nogai west of the Volga.',
  timelineItemIds: ['kz-kazakh-khanate'], confidence: CONF.horde,
  sources: [W('Nogai Horde'), W('Saray-Jük'), W('Edigu'), NE],
}, [
  [1440, 'Edigu’s sons rule from Saraychik (1440s)', { yaik: ['Between the Volga, the Yaik and the Emba (Saraychik)', NOGAI] }],
  [1557, 'Ismail Bey sides with Moscow; the Great and Lesser Nogai split (1557)', { yaik: ['Between the Volga, the Yaik and the Emba (Saraychik)', NOGAI] }],
  [1580, 'Cossacks sack Saraychik (1580)', { yaik: ['Between the Volga, the Yaik and the Emba', NOGAI] }],
  [1634, 'The Kalmyks drive the Nogai west of the Volga (1630s)', { yaik: ['Lower Yaik', ['ATY']] }],
]);

// Kazakh Khanate: one region until Tauke Khan’s death (1715), then the three jüz.
const KZ_1470 = ['ZHA', 'KAR', 'AKM', 'KUS', 'AKT', 'KZY'];
const KZ_1511 = [...KZ_1470, 'YUZ', 'ALA'];
const KZ_1598 = [...KZ_1511, 'TO', 'SI'];
const SENIOR = (extra = []) => ['Senior jüz (Zhetysu and the south)', ['ALA', 'ZHA', 'YUZ', ...extra]];
const kazakh = build({
  id: 'kazakh-khanate-early', name: 'Kazakh Khanate', color: '#2AA5A0',
  description: 'Around 1465 the Jochid sultans Kerei and Janibek led their followers away from Abu’l-Khayr’s Uzbek Khanate to the Chu and Talas valleys in western Moghulistan; those who left were called Qazaq ("free wanderers"). After Abu’l-Khayr’s death (1468) they took over his steppe. Under Kasym Khan (c. 1511–1521) the khanate held Zhetysu and the Syr Darya towns and counted a million people; Haqnazar (1538–1580) beat the Nogai and the Moghuls, and Tauekel took Tashkent from Bukhara in 1598. Esim Khan (1598–1628) and Tauke Khan (1680–1715) gave it laws (Esim’s "ancient road" and Tauke’s Zheti Zhargy). After Tauke the three jüz (hordes) — Senior, Middle and Junior — went their own ways, and the Dzungar invasion of 1723 ("the Years of Great Disaster") took Turkestan, Tashkent and Zhetysu. Abu’l-Khayr of the Junior jüz swore allegiance to Russia in 1731, the Middle jüz followed in the 1740s, and Ablai Khan (khan 1771–1781) balanced Russia and Qing China. From 1815 the nations layer draws the jüz until Russia abolished the khans (1822–24 and 1847).',
  nameAt: [[1465, 'Kazakh Khanate'], [1718, 'Kazakh Khanate (the three jüz)'], [1731, 'Kazakh Khanate (the three jüz; Junior jüz under Russian protection)']],
  timelineItemIds: ['kz-kazakh-khanate', 'kz-dzungar-wars'], confidence: CONF.horde,
  sources: [W('Kazakh Khanate'), W('Kerei Khan'), W('Janibek Khan'), W('Kasym Khan'), W('Tauke Khan'), W('Jüz'), W('Ablai Khan'), NE],
}, [
  [1465, 'Kerei and Janibek on the Chu and Talas (c. 1465)', { khanate: ['Chu and Talas valleys', ['ZHA']] }],
  [1470, 'The Kazakhs take Abu’l-Khayr’s steppe (1468–70)', { khanate: ['Kazakh steppe and Sighnaq', KZ_1470] }],
  [1511, 'Kasym Khan: Zhetysu and the Syr Darya towns (1510s)', { khanate: ['Kazakh steppe, Zhetysu and Turkestan', KZ_1511] }],
  [1598, 'Tauekel takes Tashkent (1598)', { khanate: ['Kazakh steppe, Zhetysu, Turkestan and Tashkent', KZ_1598] }],
  [1718, 'After Tauke Khan (died 1715) the three jüz go their own ways', {
    senior: SENIOR(['TO', 'SI']),
    middle: ['Middle jüz (Saryarka)', ['KAR', 'AKM', 'KUS']],
    junior: ['Junior jüz (the west)', ['AKT', 'KZY']],
  }],
  [1723, 'Dzungar invasion: the "Years of Great Disaster" (1723)', {
    middle: ['Middle jüz (Saryarka)', ['KAR', 'AKM', 'KUS']],
    junior: ['Junior jüz (the west)', ['AKT', 'KZY']],
  }],
  [1731, 'Abu’l-Khayr of the Junior jüz swears allegiance to Russia (1731)', {
    middle: ['Middle jüz (Saryarka)', ['KAR', 'AKM', 'KUS']],
    junior: ['Junior jüz (the west)', ['AKT', 'KZY']],
  }],
  [1758, 'The Qing destroy the Dzungars (1755–58): Zhetysu, Turkestan and the Irtysh back to the Kazakhs', {
    senior: SENIOR(),
    middle: ['Middle jüz (Saryarka and the Irtysh)', ['KAR', 'AKM', 'KUS', 'PAV', 'VOS']],
    junior: ['Junior jüz (the west)', ['AKT', 'KZY']],
  }],
  [1771, 'Ablai khan of the three jüz (1771); the Kalmyks leave, the Junior jüz moves to the Yaik', {
    senior: SENIOR(),
    middle: ['Middle jüz (Saryarka and the Irtysh)', ['KAR', 'AKM', 'KUS', 'PAV', 'VOS']],
    junior: ['Junior jüz (to the Yaik)', ['AKT', 'KZY', 'ATY', 'MAN']],
  }],
  [1814, 'Kokand takes Turkestan and the Syr Darya towns (1814)', {
    senior: ['Senior jüz (Zhetysu)', ['ALA']],
    middle: ['Middle jüz (Saryarka and the Irtysh)', ['KAR', 'AKM', 'KUS', 'PAV', 'VOS']],
    junior: ['Junior jüz (to the Yaik)', ['AKT', 'ATY', 'MAN']],
  }],
  [1815, 'The three jüz in 1815; the Irtysh and Ishim fort lines count as Russian', {
    senior: ['Senior jüz (Zhetysu)', ['ALA']],
    middle: ['Middle jüz (Saryarka)', ['KAR', 'AKM', 'VOS']],
    junior: ['Junior jüz (to the Yaik)', ['AKT', 'ATY', 'MAN']],
  }],
]);

const dzungar = build({
  id: 'dzungar-khanate', name: 'Dzungar Khanate', color: '#9C3D54',
  description: 'The Dzungar Khanate was the last great nomad empire, founded by the Oirat (western Mongol) Choros chief Erdeni Batur in 1634 in Dzungaria and the Ili valley. Galdan Boshugtu (1671–1697) took the Tarim oases and fought the Qing for Mongolia; Tsewang Rabtan (1697–1727) and Galdan Tseren (1727–1745) turned west, and the invasion of 1723 drove the Kazakhs from Zhetysu, Turkestan and Tashkent ("Aqtaban Shubyryndy", the barefoot flight). The Kazakhs fought back at Bulanty (1728) and Anrakay (c. 1730). After Galdan Tseren’s death the khanate fell into civil war, and the Qing destroyed it in 1755–1758, killing or deporting most of the Dzungar people.',
  timelineItemIds: ['kz-dzungar-wars'], confidence: CONF.horde,
  sources: [W('Dzungar Khanate'), W('Kazakh–Dzungar Wars'), W('Tsewang Rabtan'), W('Dzungar genocide'), NE],
}, [
  [1634, 'Erdeni Batur founds the Dzungar Khanate (1634)', { dzungaria: ['Dzungaria', ['DZUNGARIA']], ili: ['The Ili valley (Ghulja)', ['ILI']] }],
  [1723, 'Tsewang Rabtan’s armies overrun Zhetysu, Turkestan and Tashkent (1723)', { dzungaria: ['Dzungaria', ['DZUNGARIA']], ili: ['The Ili valley (Ghulja)', ['ILI']], west: ['Zhetysu, Turkestan and Tashkent', ['ALA', 'ZHA', 'YUZ', 'TO', 'SI']] }],
  [1745, 'Galdan Tseren dies (1745): civil war', { dzungaria: ['Dzungaria', ['DZUNGARIA']], ili: ['The Ili valley (Ghulja)', ['ILI']], west: ['Zhetysu, Turkestan and Tashkent', ['ALA', 'ZHA', 'YUZ', 'TO', 'SI']] }],
  [1755, 'Qing armies take Ghulja (1755)', { dzungaria: ['Dzungaria', ['DZUNGARIA']], ili: ['The Ili valley (Ghulja)', ['ILI']], west: ['Zhetysu and Turkestan', ['ALA', 'ZHA', 'YUZ']] }],
  [1757, 'The Qing destroy the Dzungars (1755–58)', { dzungaria: ['Dzungaria', ['DZUNGARIA']] }],
]);

export const kazakhstanPolities = [wusun, kangju, turgesh, oghuz, kipchak, moghulistan, uzbekKhanate, nogai, kazakh, dzungar];

// ---- Fixes to older shapes over Kazakhstan -----------------------------------------------------------
//
//  - The Uzbekistan pack's Khanate of Kokand gains its Syr Darya conquests (Turkestan, Sayram and the
//    Syr Darya towns, 1814), the same provinces the 1815 nations table gives Kokand, so the handover in
//    1815 no longer jumps north. (Kokand's Tian Shan reach is left to the Kyrgyz pack.)
//  - The Russian Empire's schematic Western Siberia ring (1700 keyframe, drawn from 1721) ran south to
//    50°N, over Kostanay, Pavlodar and the Kazakh uplands, decades before the Ishim and Orenburg fort
//    lines (1740s–1750s) and a century before Russia ruled the steppe; it now stops along the line of
//    the early forts (Tobolsk, Omsk 1716, the upper Irtysh), and its European Russia ring stops at the
//    Yaik (Ural) Cossack line instead of running over the Aktobe and Atyrau steppe. A copy of the
//    trimmed keyframe at 1814 keeps both from morphing south before the 1815 handover. (European Russia
//    still takes in the Yaik Cossacks' Uralsk side, so West Kazakhstan oblast is left out of the Junior
//    jüz here; the 1815 nations table gives it to the jüz.)
const KOKAND_STEPPE = ['Turkestan and the Syr Darya towns', ['YUZ', 'ZHA', 'KZY']];
export const RU_EUROPE_1721 = [[28, 50], [30, 66], [50, 68], [60, 62], [59.8, 55], [58, 51.6], [55, 51.5], [53.5, 51.3], [51.5, 51.3], [49, 49.6], [47, 49.2], [40, 48], [28, 50]];
export const RU_SIBERIA_1721 = [[60, 56.3], [62, 66], [88, 68], [90, 56], [86, 53.2], [80, 53.6], [77, 54.8], [73.4, 55.0], [69, 55.4], [65, 55.8], [60, 56.3]];
export const kazakhstanShapeFixes = {
  'kokand-khanate': ['Syr Darya region from 1814'],
  'russian-empire': 'trimmed',
};

/** Apply `kazakhstanShapeFixes` (runs after the packs are appended; throws if a target is missing). */
export function applyKazakhstanShapeFixes(entities) {
  const ru = entities.find((x) => x.id === 'russian-empire');
  if (!ru) throw new Error('kazakhstan fixes: no entity russian-empire');
  const ru1700 = ru.overlays.find((o) => o.year === 1700);
  const sib = ru1700?.regions.findIndex((r) => (typeof r === 'string' ? r : r.id) === 'siberia-west');
  if (sib == null || sib < 0) throw new Error('kazakhstan fixes: russian-empire 1700 has no siberia-west');
  const eu = ru1700.regions.findIndex((r) => (typeof r === 'string' ? r : r.id) === 'russia-european');
  if (eu < 0) throw new Error('kazakhstan fixes: russian-empire 1700 has no russia-european');
  ru1700.regions[sib] = { id: 'siberia-west', name: 'Western Siberia', ring: ensureClockwise(RU_SIBERIA_1721) };
  ru1700.regions[eu] = { id: 'russia-european', name: 'European Russia', ring: ensureClockwise(RU_EUROPE_1721) };
  if (!ru.overlays.some((o) => o.year === 1814)) {
    const at = ru.overlays.findIndex((o) => o.year > 1814);
    ru.overlays.splice(at, 0, { ...ru1700, year: 1814, label: 'Russian Empire before the conquest of the steppe', regions: ru1700.regions.map((r) => ({ ...r })) });
  }

  const kok = entities.find((x) => x.id === 'kokand-khanate');
  if (!kok) throw new Error('kazakhstan fixes: no entity kokand-khanate');
  if (kok.overlays.some((o) => o.regions.some((r) => r.id === 'steppe'))) return;
  const ring = ringOf('kokand steppe', KOKAND_STEPPE[1]);
  const last = kok.overlays[kok.overlays.length - 1];
  if (last.year !== 1815) throw new Error('kazakhstan fixes: kokand-khanate does not end in 1815');
  const prev = kok.overlays.filter((o) => o.year < 1814).pop();
  const at1813 = { ...prev, year: 1813, regions: prev.regions.map((r) => ({ ...r })) };
  const at1814 = { ...prev, year: 1814, label: 'Kokand takes Turkestan and the Syr Darya towns (1814)', regions: [...prev.regions.map((r) => ({ ...r })), { id: 'steppe', name: KOKAND_STEPPE[0], ring }] };
  kok.overlays = [...kok.overlays.filter((o) => o.year < 1813), at1813, at1814, { ...last, regions: [...last.regions, { id: 'steppe', name: KOKAND_STEPPE[0], ring }] }];
  kok.keyYears = [...new Set([...(kok.keyYears || []), 1814])].sort((a, b) => a - b);
}
