/**
 * Day 76 — Phase 5 country pack 2 (Central Asia), globe backfill: Tajikistan (ROADMAP item 12).
 *
 * Tajikistan had no country timeline (now data/countries/tajikistan.json), and on the globe south
 * Tajikistan (Hisar, Dushanbe, the Vakhsh valley and Khuttal) was empty for most of the first
 * millennium: nothing between the Kushans (to 200) and the Samanids (from 900), so the Hephthalites,
 * the Western Turks' yabghus of Tokharistan and the princes of Khuttal and Chaghaniyan never showed.
 * In the north, Ustrushana — the afshins' principality between Samarkand and Khujand — was empty
 * until the Samanid grant of 819, and the whole of Transoxiana was empty from the end of the Mongol
 * ring (1300) to Timur (1370). This module draws
 *
 *   the Hephthalite Empire · the Yabghus of Tokharistan · Ustrushana · the Chagatai ulus under the
 *   Qara'unas amirs (Qazaghan and Amir Husayn, 1346–1369)
 *
 * and trims the Sasanian Empire's schematic eastern ring off Tokharistan (Balkh and Kunduz). From 1815 the nations layer takes over (Bukhara and Kokand, then Russia,
 * the USSR and Tajikistan), so no keyframe here is later than 1815.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"): like the other Central Asia packs,
 * from the shared pieces (globe-central-asia-pieces.js). Tajikistan has three: SUGHD (Khujand,
 * Istaravshan, Panjakent and the upper Zarafshan), HISAR (the districts of republican subordination
 * with Dushanbe, Hisar and the Rasht valley) and KHATLON (Khuttal and the Vakhsh valley). Gorno-
 * Badakhshan (the Pamirs) is not a piece, so nothing here reaches the Pamirs. Kunduz, the Hephthalite
 * and yabghu capital just south of the Panj, is a hand ring that shares its border with the KHATLON
 * and BALKH pieces point for point (KUNDUZ below). Provinces are a coarse stand-in for valleys and
 * oases: these shapes show who held the towns, not borders.
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';
import { CA_PIECES } from './globe-central-asia-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const NE = { title: 'Natural Earth — 1:10m admin-1 states and provinces (piece outlines)', url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/' };

/**
 * Kunduz and Baghlan (Tokharistan's core south of the Panj), hand-drawn. Its north side is the KHATLON
 * piece's southern edge (the Panj) and its west side the BALKH piece's eastern edge, vertex for
 * vertex, so mergeRings fuses it with either; the south and east sides are approximate.
 */
export const KUNDUZ = [[68.025, 36.926], [68.307, 37.114], [68.814, 37.323], [69.006, 37.306], [69.246, 37.104], [69.445, 37.236], [69.5, 36.8], [69.3, 36.3], [68.9, 36.0], [68.531, 36.153], [68.371, 36.264], [68.189, 36.593], [68.025, 36.926]];

const HAND = { KUNDUZ };
function ringOf(label, names) {
  const ps = names.map((n) => {
    if (HAND[n]) return HAND[n];
    if (!CA_PIECES[n]) throw new Error(`tajikistan pack: no piece ${n}`);
    return CA_PIECES[n];
  });
  return ensureClockwise(ps.length === 1 ? ps[0] : mergeRings(label, ...ps));
}

/**
 * steps: [[year, label, { regionId: [name, pieces] }], …]. Keyframes are written for every step
 * year and the year before it (still the old extent), so each change is a one-year step.
 */
export const TJ_STEPS = {};
const RING_CACHE = new Map();
function build(meta, steps) {
  TJ_STEPS[meta.id] = steps;
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

const PROVINCES = 'Drawn with modern provinces as stand-ins for valleys and oases, so the edges are rough; the Pamirs (Gorno-Badakhshan) are not drawn.';
const CONF = {
  huns: {
    level: 'conjectural',
    reason: `Known from Chinese annals, Byzantine and Persian historians, coins and a few Bactrian documents (tax receipts from the Kingdom of Rob, 484–527); the capital (probably Kunduz) and the dates of the conquests (Tokharistan c. 466, Sogdia 479 or 509) are uncertain, and no border is recorded. ${PROVINCES}`,
  },
  principality: {
    level: 'conjectural',
    reason: `Known from the Arabic historians (al-Tabari, al-Baladhuri, al-Ya'qubi), Chinese annals and coins, which name the rulers, their towns and the campaigns against them, not the limits of their lands. ${PROVINCES}`,
  },
  ulus: {
    level: 'approximate',
    reason: `The Persian chroniclers of Timur (and Manz's study of them) describe a loose confederation of tribes under the amir and his puppet khans; who held which district changed year by year, and the 1360–1361 Moghul invasions are not drawn. ${PROVINCES}`,
  },
};

// ---- Polities ----------------------------------------------------------------------------------------

const TOKH = ['Tokharistan (Kunduz, Balkh, Termez, Chaghaniyan, Khuttal)', ['SU', 'HISAR', 'KHATLON', 'BALKH', 'KUNDUZ']];
const USTRU_H = ['Ustrushana and the upper Zarafshan', ['SUGHD']];
const hephthalites = build({
  id: 'hephthalite-empire', name: 'Hephthalite Empire', color: '#8E6C8A',
  description: 'The Hephthalites, the ‘White Huns’, became a power in Bactria around 450, displacing the Kidarites (in Tokharistan probably by 466). Their stronghold was Tokharistan and their capital probably Kunduz; they wrote Bactrian in Greek letters and called themselves Ebodalo. By 479 (or 509) they had conquered Sogdia, and Ustrushana was part of their realm; they also reached the Tarim basin. The Sasanian king Peroz I fought three wars with them and was killed near Herat in 484, after which Persia paid them tribute. Around 557 the Göktürks and Khosrow I defeated them near Qarshi, and the empire broke into principalities. Drawn as Tokharistan from 466 and Ustrushana from 479; Sogdia proper (Samarkand, Bukhara, Kesh) stays the Sogdian city-states shape, as its kings kept their thrones under Hephthalite overlordship, and the Tarim, Merv, Herat and Gandhara are not drawn.',
  nameAt: [[466, 'Hephthalites (Tokharistan)'], [479, 'Hephthalite Empire']],
  timelineItemIds: ['tj-hephthalites'], confidence: CONF.huns,
  sources: [W('Hephthalites'), W('Tokharistan'), W('Chaghaniyan'), W('Osrushana'), NE],
}, [
  [466, 'The Hephthalites take Tokharistan from the Kidarites (c. 466)', { tokharistan: TOKH }],
  [479, 'Sogdia conquered (by 479, or 509): Ustrushana', { tokharistan: TOKH, ustrushana: USTRU_H }],
  [484, 'Peroz I killed near Herat (484): Persia pays tribute', { tokharistan: TOKH, ustrushana: USTRU_H }],
  [557, 'The Göktürks and Khosrow I defeat the Hephthalites near Qarshi (c. 557)', { tokharistan: TOKH, ustrushana: USTRU_H }],
  [559, 'Hephthalite principalities in Tokharistan (c. 560)', { tokharistan: TOKH }],
]);

const YAB_NORTH = ['Shuman, Hisar and Khuttal', ['HISAR', 'KHATLON']];
const yabghus = build({
  id: 'tokhara-yabghus', name: 'Yabghus of Tokharistan', color: '#5F7FA8',
  description: 'In 625 the Western Turkic qaghan Tong Yabghu invaded Tokharistan, made the Hephthalite principalities submit and installed his son Tardush Shad as yabghu (sub-king) at Kunduz; Xuanzang visited him there in 630. A Chinese list of the yabghus’ vassals names Khuttal, Chaghaniyan, Shughnan, Wakhan, Kobadiyan and Badakhshan, as well as Kabul and Zabul south of the Hindu Kush. After 650 the yabghus came under nominal Tang suzerainty; the Arabs took Balkh in 652–653 but were driven out in the civil war of 656–661. Qutayba ibn Muslim made Chaghaniyan submit in 705, when the yabghu Pantu Nili ruled from Badakhshan, and in 710 sent the yabghu to Damascus as a hostage; Khuttal held out as an ally or enemy of the Arabs until the Abbasids took direct control in 750–751, and the yabghus survived in Badakhshan until at least 758. Drawn as Tokharistan north of the Hindu Kush (625–704), then the princes north of the Oxus (705–750); Badakhshan, Wakhan and the lands south of the Hindu Kush are not drawn.',
  nameAt: [[625, 'Yabghus of Tokharistan (Kunduz)'], [705, 'Yabghus of Tokharistan (vassal princes north of the Oxus)']],
  timelineItemIds: ['tj-tokhara-yabghus'], confidence: CONF.principality,
  sources: [W('Yabghus of Tokharistan'), W('Tong Yabghu'), W('Khuttal'), W('Chaghaniyan'), W('Qutayba ibn Muslim'), NE],
}, [
  [625, 'Tong Yabghu takes Tokharistan; Tardush Shad yabghu at Kunduz (625)', { tokharistan: TOKH }],
  [630, 'Xuanzang at Kunduz; Ishbara Yabghu (630–650)', { tokharistan: TOKH }],
  [653, 'The Arabs take Balkh (652–653); nominal Tang suzerainty', { tokharistan: TOKH }],
  [705, 'Qutayba ibn Muslim: Chaghaniyan submits; the yabghu rules from Badakhshan (705)', { tokharistan: YAB_NORTH }],
  [710, 'Qutayba sends the yabghu to Damascus as a hostage (710)', { tokharistan: YAB_NORTH }],
  [749, 'Khuttal’s princes hold out until the Abbasids take it over (750–751)', { tokharistan: YAB_NORTH }],
]);

const USTRU = ['Ustrushana (Bunjikat), with Khujand and the upper Zarafshan', ['SUGHD']];
const ustrushana = build({
  id: 'ustrushana', name: 'Principality of Ustrushana', color: '#B3843E',
  description: 'Ustrushana lay south of the great bend of the Syr Darya, roughly between Samarkand and Khujand; its capital was Bunjikat, near today’s Shahristan, and its princes bore the title afshin. Closely tied to Sogdia, it belonged to the Hephthalites and from about 560 to the Western Turks, probably keeping much autonomy. Qutayba ibn Muslim’s invasion of 712–714 did not bring it under Arab control; Nasr ibn Sayyar subdued it only partly in 739, the afshin submitted nominally to al-Mahdi (775–785), and in 794–795 the afshin Karakana submitted to the Barmakid al-Fadl ibn Yahya. His son Kawus broke away again, and an Abbasid army guided by Kawus’s son Khaydhar (the later general al-Afshin) conquered it for good in 822. Drawn from 630, when the schematic Göktürk ring (which covers part of it from 560) withdraws to the east, to 818: from 819 the Samanid Yahya ibn Asad was caliphal governor of Chach and Ustrushana, and the Samanid shape covers it, though the afshins went on ruling under Abbasid and Samanid overlords until 893. The Sughd piece also takes in Khujand and Panjakent, which had their own rulers (Panjakent’s last king, Devashtich, was killed by the Arabs in 722).',
  nameAt: [[630, 'Ustrushana (afshins, under the Turks)'], [712, 'Ustrushana (afshins)'], [794, 'Ustrushana (afshins, Abbasid tributaries)']],
  timelineItemIds: ['tj-ustrushana'], confidence: CONF.principality,
  sources: [W('Osrushana'), W('Khaydhar ibn Kawus al-Afshin'), W('Istaravshan'), W('Samanid Empire'), NE],
}, [
  [630, 'The afshins of Ustrushana under the Western Turks (630s)', { ustrushana: USTRU }],
  [712, 'Qutayba’s invasion (712–714) fails to hold Ustrushana', { ustrushana: USTRU }],
  [739, 'Nasr ibn Sayyar subdues it only partly (739)', { ustrushana: USTRU }],
  [794, 'The afshin Karakana submits to al-Fadl the Barmakid (794–795)', { ustrushana: USTRU }],
  [818, 'Kawus breaks with the caliph; al-Ma’mun’s grant to the Samanids (819), conquest in 822', { ustrushana: USTRU }],
]);

const ULUS = ['Transoxiana, Hisar, Khuttal and Balkh', ['SA', 'BU', 'NW', 'QA', 'JI', 'SUGHD', 'SU', 'HISAR', 'KHATLON', 'BALKH', 'KUNDUZ']];
const chagataiAmirs = build({
  id: 'chagatai-ulus-amirs', name: 'Chagatai Ulus (Qara’unas amirs)', color: '#9A7B45',
  description: 'The Qara’unas were Mongol soldiers settled in Afghanistan. In 1346 their amir Qazaghan, who had rebelled the year before, killed the Chagatai khan Qazan; after him the khans of the western Chagatai ulus were rulers in name only. For twelve years Qazaghan ruled through puppet khans (Danishmandchi, then Bayan Quli) over a loose confederation of tribes, most loyal in the south of the ulus; he raided northern India and sacked Herat. He was assassinated in 1358. His grandson Amir Husayn and Timur, who married Husayn’s sister, fought the khans of Moghulistan: after Tughlugh Timur died (1363) they took over Transoxiana, and in 1365 they drove out his son Ilyas Khoja. They fell out, and in 1370 Timur besieged Husayn in Balkh and had him executed. Drawn over Transoxiana, Hisar, Khuttal and Balkh from 1346 until the Timurid shape begins in 1370; the Moghul invasions of 1360–1361, Tashkent and Fergana are not drawn.',
  nameAt: [[1346, 'Chagatai Ulus (Amir Qazaghan)'], [1358, 'Chagatai Ulus (the amirs)'], [1364, 'Chagatai Ulus (Amir Husayn and Timur)']],
  timelineItemIds: ['tj-chagatai-timurids'], confidence: CONF.ulus,
  sources: [W('Qazaghan'), W('Amir Husayn'), W('Qara\'unas'), W('Chagatai Khanate'), NE],
}, [
  [1346, 'Qazaghan kills Qazan Khan (1346): puppet khans', { ulus: ULUS }],
  [1358, 'Qazaghan assassinated (1358); the amirs fall out', { ulus: ULUS }],
  [1364, 'Tughlugh Timur dies (1363): Husayn and Timur take Transoxiana', { ulus: ULUS }],
  [1365, 'Husayn and Timur drive Ilyas Khoja out (1365)', { ulus: ULUS }],
  [1369, 'Timur turns on Husayn, besieged in Balkh (1370)', { ulus: ULUS }],
]);

export const tajikistanPolities = [hephthalites, yabghus, ustrushana, chagataiAmirs];

// ---- Fixes to older shapes over Tajikistan -----------------------------------------------------------
//
//  - The Sasanian Empire's schematic 'parthia-east' ring (its 400 keyframe, held until 620 and already
//    trimmed to the Amu Darya by the Uzbekistan pack) ran over Balkh and Kunduz — Tokharistan, which
//    the Kidarites and from c. 466 the Hephthalites held, and from 625 the yabghus. Its northern edge
//    now runs west and south of the BALKH piece and the KUNDUZ ring (the Hindu Kush side), with a margin
//    for the ring's fade-out shrink, keeping Merv
//    and Herat; the south and west are unchanged. Not land-checked (the ring is schematic and reaches
//    the Gulf), so notOver tests prove the trim.
export const SASANID_TOKHARISTAN = [[58, 38.6], [61.2, 38.2], [63.4, 37.8], [63.6, 37.2], [63.2, 36.4], [62.9, 35.9], [63.2, 35.1], [64.8, 34.0], [66.1, 33.9], [67.0, 34.2], [68.0, 34.4], [69.0, 34.6], [70, 35], [65, 30], [58, 30], [55, 32], [58, 38.6]];
export const tajikistanShapeFixes = {
  'sassanid-empire': ['parthia-east (400) trimmed off Tokharistan (Balkh, Kunduz)'],
};

/** Apply `tajikistanShapeFixes` (runs after the packs are appended; throws if a target is missing). */
export function applyTajikistanShapeFixes(entities) {
  const sas = entities.find((x) => x.id === 'sassanid-empire');
  if (!sas) throw new Error('tajikistan fixes: no entity sassanid-empire');
  const kf = sas.overlays.find((o) => o.year === 400);
  const i = kf ? kf.regions.findIndex((r) => (typeof r === 'string' ? r : r.id) === 'parthia-east') : -1;
  if (i < 0) throw new Error('tajikistan fixes: sassanid-empire 400 has no parthia-east');
  const r = kf.regions[i];
  kf.regions[i] = { id: 'parthia-east', name: typeof r === 'string' ? 'Eastern Iran (Khurasan, Herat, Sistan)' : r.name, ring: ensureClockwise(SASANID_TOKHARISTAN) };
}
