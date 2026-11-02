/**
 * Day 75 — Phase 5 country pack 2 (Central Asia), globe backfill: Kyrgyzstan (ROADMAP item 12).
 *
 * Kyrgyzstan had no country timeline (now data/countries/kyrgyzstan.json) and on the globe, before
 * the 1815 nations layer, only the Kazakhstan pack's Wusun, Türgesh and Moghulistan over the north,
 * the Uzbekistan pack's Karakhanids (from 999), Timurid and Shaybanid Fergana over the south, the
 * schematic Göktürk and Mongol rings, and the peoples wash. The Chu valley — Suyab, Navekat and
 * Balasagun, capitals of three Turkic empires — was empty from 630 to 699 and from 766 to 999, and
 * again from 1134 to 1218, when Balasagun was the Qara Khitai capital; Osh was left out of Kokand
 * (1709–1815) although Bukhara and the Timurids held it before; and Han China's schematic 'Tarim'
 * rectangle ran over Issyk-Kul and Naryn, the Wusun's pastures. This module draws
 *
 *   the Western Turkic Khaganate at Suyab · the Karluk yabghus · the Qara Khitai at Balasagun
 *
 * and fixes three older shapes: the Uzbekistan pack's Karakhanid Khanate starts at Balasagun and
 * Kashgar around 940 instead of 999; the Khanate of Kokand holds Osh, Uzgen and Jalal-Abad (the
 * Kyrgyz side of the Fergana valley) from 1709, as the 1815 nations table already has it; and Han
 * China's 'Tarim' region stops at the Kyrgyz border. From 1815 the nations layer takes over (Kokand,
 * then the Russian Empire, the USSR and Kyrgyzstan), so no keyframe here is later than 1815; the
 * Kara-Kyrgyz Khanate of Ormon Khan (1842–67) is a timeline item, not a shape.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"): like the other Central Asia packs,
 * from the shared pieces (globe-central-asia-pieces.js). Kyrgyzstan has two: KG_N (Chuy, Talas,
 * Issyk-Kul and Naryn — the Chu, Talas and Issyk-Kul valleys and the inner Tian Shan) and KG_S (Osh,
 * Jalal-Abad and Batken — the Kyrgyz side of the Fergana valley and the Alai). Kashgar is the
 * Uzbekistan pack's hand ring east of the Kyrgyz border. Provinces are a coarse stand-in for nomad
 * pastures and oasis districts: these shapes show who held the valleys and towns, not borders.
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';
import { CA_PIECES } from './globe-central-asia-pieces.js';
import { KASHGAR } from './globe-pack-uzbekistan.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}` });
const NE = { title: 'Natural Earth — 1:10m admin-1 states and provinces (piece outlines)', url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/' };
const SILK = UNESCO('Silk Roads: the Routes Network of Chang’an-Tianshan Corridor', 1442);

const HAND = { KASHGAR };
function ringOf(label, names) {
  const ps = names.map((n) => {
    if (HAND[n]) return HAND[n];
    if (!CA_PIECES[n]) throw new Error(`kyrgyzstan pack: no piece ${n}`);
    return CA_PIECES[n];
  });
  return ensureClockwise(ps.length === 1 ? ps[0] : mergeRings(label, ...ps));
}

/**
 * steps: [[year, label, { regionId: [name, pieces] }], …]. Keyframes are written for every step
 * year and the year before it (still the old extent), so each change is a one-year step.
 */
export const KG_STEPS = {};
const RING_CACHE = new Map();
function build(meta, steps) {
  KG_STEPS[meta.id] = steps;
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

const PROVINCES = 'Drawn with modern provinces (oblasts) as stand-ins for valleys and pastures, so the edges are rough; nomad ranges moved with the seasons.';
const CONF = {
  khaganate: {
    level: 'conjectural',
    reason: `Known from the Tang histories, Xuanzang’s travels and the Arabic and Persian geographers (Ibn Khordadbeh, the Hudud al-'Alam, Gardizi), which name the capitals and towns and the tribes that held them, not the limits of their pastures. ${PROVINCES}`,
  },
  empire: {
    level: 'approximate',
    reason: `The Liao and Yuan histories and Juvaini and Rashid al-Din date the conquests and name the capital and the vassals; only the region around Balasagun was ruled directly, and its limits are not recorded. ${PROVINCES}`,
  },
};

// ---- Polities ----------------------------------------------------------------------------------------

const WT = ['Suyab, the Chu and Talas valleys and Zhetysu', ['KG_N', 'ZHA', 'ALA']];
const westernTurks = build({
  id: 'western-turkic-khaganate', name: 'Western Turkic Khaganate', color: '#7A6A9A',
  description: 'The Western Turkic Khaganate split from the first Turkic Khaganate around 600. Its principal (winter) capital was Suyab in the Chu valley, east of Bishkek, with a summer residence at Navekat; the Sogdian merchant towns of the valley paid tribute while the Turks guarded them. Under Tong Yabghu Qaghan (618–628 or 630) it ruled from the Tarim basin to the Caspian, and the Chinese pilgrim Xuanzang met the qaghan at Suyab in 629–630. After Tong Yabghu’s murder the Nushibi and Duolu tribes fought over the throne; Ashina Helu reunited them in 651, but the Tang general Su Dingfang destroyed his army on the Irtysh in 657, set up a victory stele at Suyab and installed puppet khagans. Drawn from 631, when the schematic Göktürk ring withdraws to the east; before that the united khaganate is that ring. The khaganate’s Tarim, Sogdian and Tokharistan dependencies are not drawn.',
  nameAt: [[631, 'Western Turkic Khaganate (Nushibi and Duolu at war)'], [651, 'Western Turkic Khaganate (Ashina Helu)']],
  timelineItemIds: ['kg-western-turks'], confidence: CONF.khaganate,
  sources: [W('Western Turkic Khaganate'), W('Tong Yabghu'), W('Suyab'), W('Navekat'), SILK, NE],
}, [
  [631, 'After Tong Yabghu’s murder (628–630): Nushibi and Duolu fight over the throne', { zhetysu: WT }],
  [640, 'The khaganate split between Nushibi and Duolu khagans (630s–640s)', { zhetysu: WT }],
  [651, 'Ashina Helu reunites the Western Turks (651)', { zhetysu: WT }],
  [657, 'Su Dingfang defeats Ashina Helu on the Irtysh (657): Tang puppet khagans', { zhetysu: WT }],
]);

const KARLUK_766 = ['The Chu, Talas and Issyk-Kul valleys (Suyab)', ['KG_N', 'ZHA']];
const KARLUK_768 = ['Zhetysu, the Chu and Talas valleys (Suyab, Balasagun, Taraz)', ['KG_N', 'ZHA', 'ALA']];
const KARLUK_893 = ['Zhetysu and the Chu valley (Balasagun)', ['KG_N', 'ALA']];
const karluks = build({
  id: 'karluk-yabgu', name: 'Karluk Yabghu', color: '#9C6B30',
  description: 'The Karluks, a union of three Turkic tribes from the Altai, overran the Türgesh in Zhetysu in 766, formed a khanate under a yabghu and moved their capital to Suyab; later their centre was Balasagun on the Chu. The 10th-century geographers list their towns along the Silk Road — Taraz, Navekat, Atbash, Barskhan, Issyk-Kul and others — and Yaqubi reports that a Karluk yabghu accepted Islam under the caliph al-Mahdi (775–785), though most of the Karluks were converted later. In 893 the Samanid Isma’il ibn Ahmad took Taraz, the Karluk capital in the Talas valley, and around 940 the Yagma, a tribe from the south, seized the Chu valley and Balasagun, where the Karakhanid dynasty took over. Drawn from 768, after the Türgesh fade out, over Zhetysu (ALA); parts of their lands were at times held by the Toquz Oghuz, the Kyrgyz and others, which is not drawn.',
  nameAt: [[766, 'Karluk Yabghu'], [893, 'Karluk Yabghu (Balasagun)']],
  timelineItemIds: ['kg-turgesh-talas'], confidence: CONF.khaganate,
  sources: [W('Karluks'), W('Karluk Yabghu'), W('Suyab'), W('Isma\'il ibn Ahmad'), W('Kara-Khanid Khanate'), NE],
}, [
  [766, 'The Karluks take Suyab and make it their capital (766)', { zhetysu: KARLUK_766 }],
  [768, 'The Karluk yabghus hold Zhetysu (after the Türgesh)', { zhetysu: KARLUK_768 }],
  [893, 'Isma’il ibn Ahmad the Samanid takes Taraz (893)', { zhetysu: KARLUK_893 }],
  [937, 'Last years of the Karluk yabghus at Balasagun (the Yagma take it c. 940)', { zhetysu: KARLUK_893 }],
]);

const QK_CORE = ['Balasagun and the Chu, Talas and Issyk-Kul valleys (direct rule)', ['KG_N']];
const qaraKhitai = build({
  id: 'qara-khitai', name: 'Qara Khitai (Western Liao)', color: '#4C7A5A',
  description: 'Yelü Dashi led Khitan remnants west after the Jurchens destroyed the Liao dynasty in northern China (1124). In 1134 he took the Karakhanid city of Balasagun, which the local Karakhanid ruler had asked him to defend against the Kankalis and Karluks, and made it the capital of the Qara Khitai or Western Liao, ruled by a Gurkhan (“universal khan”). Only the region around Balasagun was ruled directly; the Kankalis, Karluks, Kyrgyz, the Uyghurs of Qocho and the Karakhanids of Kashgar and Samarkand became vassals, and after the Battle of Qatwan (1141) the Khwarazmshahs paid tribute too. In 1211 the Naiman prince Kuchlug, a refugee from Genghis Khan, captured the Gurkhan Yelü Zhilugu and usurped the throne, and took Kashgar from its Karakhanid khan; in 1218 the Mongol general Jebe hunted him down and beheaded him, and Balasagun surrendered to the Mongols. Drawn here is the directly ruled core (and Kuchlug’s Kashgar); the vassals are drawn under their own dynasties.',
  nameAt: [[1134, 'Qara Khitai (Western Liao)'], [1211, 'Qara Khitai (Kuchlug the Naiman)']],
  timelineItemIds: ['kg-qara-khitai'], confidence: CONF.empire,
  sources: [W('Qara Khitai'), W('Yelü Dashi'), W('Kuchlug'), W('Battle of Qatwan'), W('Balasagun'), NE],
}, [
  [1134, 'Yelü Dashi takes Balasagun and makes it his capital (1134)', { balasagun: QK_CORE }],
  [1141, 'Battle of Qatwan (1141): overlords of Transoxiana and Khwarazm', { balasagun: QK_CORE }],
  [1211, 'Kuchlug the Naiman usurps the throne and takes Kashgar (1211)', { balasagun: QK_CORE, kashgar: ['Kashgar', ['KASHGAR']] }],
  [1217, 'Jebe pursues Kuchlug (1216–18); Balasagun surrenders to the Mongols (1218)', { balasagun: QK_CORE, kashgar: ['Kashgar', ['KASHGAR']] }],
]);

export const kyrgyzstanPolities = [westernTurks, karluks, qaraKhitai];

// ---- Fixes to older shapes over Kyrgyzstan -----------------------------------------------------------
//
//  - The Uzbekistan pack's Karakhanid Khanate started in 999, when Nasr ibn Ali took Bukhara; its
//    home lands came first. It now starts around 940 at Balasagun and the Chu valley (KG_N) with
//    Kashgar, taken over from the Karluk yabghus, and grows to its 999 extent in one year.
//  - The Uzbekistan pack's Khanate of Kokand drew the Fergana valley without its Kyrgyz side (Osh,
//    Uzgen, Jalal-Abad), which the Timurid and Shaybanid 'Fergana' regions before it and the 1815
//    nations table after it both include; every Kokand 'fergana' ring now takes in KG_S, so Osh is
//    drawn from 1709 and the 1815 handover no longer jumps.
//  - Han China's schematic 'Tarim / Silk Road fringe' region (a 75–95°E, 36–43°N rectangle in its
//    year-2 keyframe) ran over Issyk-Kul, the Naryn valley and the At-Bashy range — the Wusun's
//    pastures, never Han land. Its west and north-west side now follow the Kyrgyz border (the shared
//    KG_N / KG_S edge) and the Kazakh border to 43°N.
export const HAN_TARIM = [[75.0, 36.0], [75.0, 40.3], [75.194, 40.441], [75.588, 40.612], [75.682, 40.292], [76.244, 40.441], [76.314, 40.343], [76.624, 40.628], [76.767, 40.945], [77.008, 41.044], [77.475, 40.982], [78.075, 41.04], [78.231, 41.173], [78.36, 41.378], [79.304, 41.788], [79.748, 41.88], [79.843, 42.002], [80.182, 42.021], [80.21, 42.19], [80.14, 42.623], [80.227, 42.791], [80.555, 42.899], [80.43, 43.0], [95.0, 43.0], [95.0, 36.0], [75.0, 36.0]];
const KK_EARLY = { khanate: ['Balasagun and the Chu valley', ['KG_N']], kashgar: ['Kashgar', ['KASHGAR']] };
export const kyrgyzstanShapeFixes = {
  'karakhanid-khanate': ['Balasagun and Kashgar from c. 940'],
  'kokand-khanate': ['fergana takes in Osh, Uzgen and Jalal-Abad (1709–1815)'],
  'han-china': ['tarim stops at the Kyrgyz border'],
};

/** Apply `kyrgyzstanShapeFixes` (runs after the packs are appended; throws if a target is missing). */
export function applyKyrgyzstanShapeFixes(entities) {
  const find = (id) => {
    const e = entities.find((x) => x.id === id);
    if (!e) throw new Error(`kyrgyzstan fixes: no entity ${id}`);
    return e;
  };
  const rid = (r) => (typeof r === 'string' ? r : r.id);

  // 1. The Karakhanids from c. 940.
  const kk = find('karakhanid-khanate');
  if (!kk.overlays.some((o) => o.year === 940)) {
    const first = kk.overlays[0];
    if (first.year !== 999) throw new Error('kyrgyzstan fixes: karakhanid-khanate does not start in 999');
    const regions = Object.entries(KK_EARLY).map(([id, [name, pieces]]) => ({ id, name, ring: ringOf(`karakhanid ${id}`, pieces) }));
    const early = (year, label) => ({ year, label, approximation: A, regions: regions.map((r) => ({ ...r })) });
    kk.overlays = [early(940, 'The Karakhanids take Balasagun and the Chu valley (c. 940); Kashgar'), early(998, 'The Karakhanids of Balasagun and Kashgar'), ...kk.overlays];
    kk.keyYears = [...new Set([940, ...(kk.keyYears || [])])].sort((a, b) => a - b);
    kk.nameAt = [[940, 'Karakhanid Khanate (Balasagun and Kashgar)'], ...(kk.nameAt || []).filter(([y]) => y !== 940)];
    kk.timelineItemIds = [...new Set([...(kk.timelineItemIds || []), 'kg-karakhanids'])];
    if (!kk.sources.some((s) => s.url.endsWith('/Balasagun'))) kk.sources = [...kk.sources, W('Balasagun'), W('Burana Tower'), SILK];
  }

  // 2. Kokand's Fergana takes in Osh, Uzgen and Jalal-Abad.
  const kok = find('kokand-khanate');
  for (const kf of kok.overlays) {
    const i = kf.regions.findIndex((r) => rid(r) === 'fergana');
    if (i < 0) throw new Error(`kyrgyzstan fixes: kokand-khanate ${kf.year} has no fergana`);
    const r = kf.regions[i];
    if (typeof r !== 'string' && r.name.includes('Osh')) continue;
    const pieces = ['FA', 'NG', 'AN', 'KG_S', ...(kf.year >= 1806 ? ['SUGHD'] : []), ...(kf.year >= 1809 ? ['TO', 'SI'] : [])];
    const name = r.name === 'Fergana valley (Kokand)' ? 'Fergana valley (Kokand, Osh)' : r.name.replace('Fergana valley', 'Fergana valley with Osh');
    kf.regions[i] = { id: 'fergana', name, ring: ringOf(`kokand ${kf.year}`, pieces) };
  }
  if (!kok.sources.some((s) => s.url.endsWith('/Osh'))) kok.sources = [...kok.sources, W('Osh')];

  // 3. Han China's Tarim stops at the Kyrgyz border.
  const han = find('han-china');
  for (const kf of han.overlays) {
    const i = kf.regions.findIndex((r) => rid(r) === 'tarim');
    if (i < 0) continue;
    kf.regions[i] = { id: 'tarim', name: kf.regions[i].name, ring: ensureClockwise(HAN_TARIM) };
  }
}
