/**
 * Day 74 — Phase 5 country pack 2 (Central Asia), globe backfill: Turkmenistan (ROADMAP item 12).
 *
 * Turkmenistan had no country timeline (now data/countries/turkmenistan.json) and on the globe,
 * before the 1815 nations layer, only empire-wide schematic rings (Achaemenid, Seleucid, Parthian,
 * Sasanian, Abbasid, Mongol, Timurid, Safavid), the Uzbekistan pack's Khwarazm and Bukhara, and the
 * peoples and presence washes: no Oxus civilisation at Gonur and Altyn Depe, a Parthian heartland
 * ring that missed Nisa itself, no Seljuks at all (nothing over Merv from 1000 to 1150), no Sufids
 * of Khwarazm, and Merv — the "mother of the world" — left empty for most of its history. This
 * module draws Turkmenistan's own states from the Bronze Age to 1815:
 *
 *   the Oxus civilisation (BMAC) · the Great Seljuks of Merv · the Sufids of Khwarazm ·
 *   Merv under the Safavids, Nader Shah and the Qajar khans
 *
 * and fixes three older shapes: the Parthian Empire's 'parthia' and 'parthia-aria' rings now reach
 * Nisa and the Kopet Dag foothills; the Safavid 1620 'persia' ring no longer runs over the Merv
 * oasis; and the Uzbekistan pack's Khanate of Bukhara gains Merv from Shah Murad's conquest (1785)
 * until he razed it (1788–89). From 1815 the nations layer takes over (Khiva and Bukhara over Dashoguz
 * and Lebap; the Turkmen lands of Ahal, Balkan and Mary unclaimed until Russia's conquest of
 * 1881–84), so no keyframe here is later than 1815, and the Turkmen tribes, who held most of the
 * country between the empires, are left to the peoples layer.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"): like the Uzbekistan and Kazakhstan
 * packs, from the shared Central Asia pieces (globe-central-asia-pieces.js: Natural Earth admin-1
 * provinces, now including Turkmenistan's Balkan region, simplified together so neighbours share
 * their borders). Provinces are a coarse stand-in: Ahal stands for Nisa, Abiward and the Kopet Dag
 * foothills, Balkan for Dihistan and the Caspian side, Mary for the Merv oasis, Lebap for Amul on the
 * Oxus and Dashoguz for Urgench (Konye-Urgench). The desert provinces take in the Karakum around the
 * oases.
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';
import { CA_PIECES } from './globe-central-asia-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}` });
const NE = { title: 'Natural Earth — 1:10m admin-1 states and provinces (piece outlines)', url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/' };

function ringOf(label, names) {
  const ps = names.map((n) => {
    if (!CA_PIECES[n]) throw new Error(`turkmenistan pack: no piece ${n}`);
    return CA_PIECES[n];
  });
  return ensureClockwise(ps.length === 1 ? ps[0] : mergeRings(label, ...ps));
}

/**
 * steps: [[year, label, { regionId: [name, pieces] }], …]. Keyframes are written for every step
 * year and the year before it (still the old extent), so each change is a one-year step.
 */
export const TM_STEPS = {};
const RING_CACHE = new Map();
function build(meta, steps) {
  TM_STEPS[meta.id] = steps;
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

const PROVINCES = 'Drawn with modern provinces (velayats) as stand-ins for oases and their desert margins, so the edges are rough.';
const CONF = {
  bronze: {
    level: 'conjectural',
    reason: `Known only from excavated sites (Gonur Depe, Togolok, Kelleli, Altyn Depe, Namazga Tepe, Sapalli Tepe) and radiocarbon dates, which archaeologists read differently (c. 2400–1950 or c. 2250–1700 BCE for the urban phase); there were no written records, and whether these towns formed one state is unknown. ${PROVINCES}`,
  },
  medieval: {
    level: 'approximate',
    reason: `The chronicles (Bayhaqi, Ibn al-Athir, Juvaini, the Zafarnama) date the conquests and name the towns each ruler held, not the borders between them. ${PROVINCES}`,
  },
};

// ---- Polities ----------------------------------------------------------------------------------------

const KOPET_DAG = ['Kopet Dag foothill towns (Namazga Tepe, Altyn Depe)', ['AHAL']];
const MARGIANA = ['Margiana (Gonur Depe and the Murghab delta)', ['MARY']];
const BACTRIA = ['Northern Bactria (Sapalli Tepe, Djarkutan)', ['SU']];
const oxus = build({
  id: 'oxus-civilisation', name: 'Oxus civilisation (BMAC)', color: '#C08A3E', type: 'civilization',
  description: 'The Bactria–Margiana Archaeological Complex, or Oxus civilisation, was a Bronze Age culture of fortified oasis towns. It grew out of the Kopet Dag foothill villages (Namazga V, c. 2400–2000 BCE), where Namazga Tepe covered some 60 hectares and Altyn Depe had a temple tower of the ziggurat type, and spread to the Murghab delta (ancient Margiana) and to Bactria on the upper Oxus. Its greatest site, Gonur Depe in Margiana, had a walled palace, fire temples and a royal necropolis. The urban phase is dated c. 2400–1950 BCE by some archaeologists and c. 2250–1700 BCE by others; the Kopet Dag towns shrank from c. 1800 BCE, when herders from the steppe arrived, and Gonur was abandoned by about 1600 BCE. Northern Bactria (Sapalli Tepe, Djarkutan) is drawn from c. 1950 BCE, southern Bactria is not drawn.',
  timelineItemIds: ['tm-oxus-civilisation', 'tm-kopet-dag-towns'], confidence: CONF.bronze,
  sources: [W('Bactria–Margiana Archaeological Complex'), W('Gonur Depe'), W('Altyndepe'), W('Namazga-Tepe'), NE],
}, [
  [-2400, 'Namazga V: the Kopet Dag towns become cities (c. 2400 BCE)', { kopetdag: KOPET_DAG }],
  [-2250, 'Gonur Depe and the Margiana oasis towns (c. 2250 BCE)', { kopetdag: KOPET_DAG, margiana: MARGIANA }],
  [-1950, 'Sapalli Tepe and the northern Bactrian towns (c. 1950 BCE)', { kopetdag: KOPET_DAG, margiana: MARGIANA, bactria: BACTRIA }],
  [-1800, 'Namazga VI: the Kopet Dag towns shrink as steppe herders arrive (c. 1800 BCE)', { margiana: MARGIANA, bactria: BACTRIA }],
  [-1650, 'Last years of Gonur Depe (abandoned c. 1600 BCE)', { margiana: MARGIANA }],
]);

const SELJUK_1035 = ['AHAL', 'BALKAN'];
const SELJUK_1037 = [...SELJUK_1035, 'MARY'];
const SELJUK_1038 = [...SELJUK_1037, 'KHOR_IR'];
const SELJUK_1040 = [...SELJUK_1038, 'HERAT', 'LEBAP'];
const KHURASAN = ['Khurasan (Merv, Nishapur, Herat)', SELJUK_1040];
const KHWARAZM = ['Khwarazm', ['XO', 'DASH', 'QR']];
const JIBAL = ['Rayy and the Jibal', ['IRAQ_AJAM']];
const seljuk = build({
  id: 'seljuk-empire', name: 'Great Seljuk Empire (Khurasan)', color: '#2B6CB0',
  description: 'The Seljuks were an Oghuz Turkmen clan from the lower Syr Darya. Driven out of Khwarazm in 1035, the brothers Tughril and Chaghri beat a Ghaznavid army and made Sultan Mas’ud grant them Nasa (Nisa), Farawa and Dihistan; Chaghri took Merv in 1037, Tughril entered Nishapur in 1038, and on 23 May 1040 they destroyed Mas’ud’s army at Dandanaqan, near Merv, and took all Khurasan. Chaghri ruled the east from Merv while Tughril conquered western Iran (Rayy and the Jibal, 1042–43) and Baghdad (1055). Under Sultan Sanjar (1118–1157) Merv was the capital of the whole empire, and by some estimates the largest city in the world. Sanjar lost Transoxiana to the Qara Khitai at Qatwan (1141), was captured by rebel Oghuz Turkmens in 1153 while they pillaged Khurasan, escaped in 1156 and died at Merv in 1157. Drawn here is the eastern, Khurasan side of the empire: the Seljuks of Iraq are in the Iraq pack, and the Anatolian, Syrian and western Iranian lands (the Sultanate of Iraq under Sanjar\'s nephews from 1118) are not drawn.',
  nameAt: [[1035, 'Seljuks'], [1040, 'Great Seljuk Empire (Khurasan)']],
  timelineItemIds: ['tm-seljuks'], confidence: CONF.medieval,
  sources: [W('Seljuk Empire'), W('Chaghri Beg'), W('Tughril'), W('Battle of Dandanaqan'), W('Ahmad Sanjar'), W('Tomb of Ahmad Sanjar'), UNESCO('State Historical and Cultural Park “Ancient Merv”', 886), NE],
}, [
  [1035, 'Mas’ud I grants the Seljuks Nasa, Farawa and Dihistan (1035)', { khurasan: ['Nasa, Farawa and Dihistan', SELJUK_1035] }],
  [1037, 'Chaghri Beg takes Merv (1037)', { khurasan: ['Merv, Nasa and Dihistan', SELJUK_1037] }],
  [1038, 'Tughril enters Nishapur (1038)', { khurasan: ['Khurasan (Merv and Nishapur)', SELJUK_1038] }],
  [1040, 'Battle of Dandanaqan (23 May 1040): all Khurasan', { khurasan: KHURASAN }],
  [1043, 'Khwarazm taken from Shah Malik; Rayy and the Jibal (1042–43)', { khurasan: KHURASAN, khwarazm: KHWARAZM, jibal: JIBAL }],
  [1097, 'Khwarazm to the Anushteginid Khwarazmshahs (1097)', { khurasan: KHURASAN, jibal: JIBAL }],
  [1118, 'Sanjar, supreme sultan at Merv (1118); western Iran to his nephews', { khurasan: KHURASAN }],
  [1141, 'Sanjar defeated by the Qara Khitai at Qatwan (1141)', { khurasan: KHURASAN }],
  [1153, 'Oghuz Turkmens capture Sanjar and pillage Khurasan (1153)', { khurasan: KHURASAN }],
  [1157, 'Sanjar dies at Merv (1157)', { khurasan: KHURASAN }],
]);

const SUFID_NORTH = ['Northern Khwarazm (Urgench)', ['DASH', 'QR']];
const sufid = build({
  id: 'sufid-khwarazm', name: 'Sufids of Khwarazm', color: '#8B5A9F',
  description: 'After the Mongol conquest Khwarazm was split between the Golden Horde in the north (Urgench) and the Chagatai khans in the south (Kath and Khiva). Around 1361 Husain Sufi, of the Onggirat Mongol family of Naghday Biy, made northern Khwarazm independent — coins were minted for him from 1364 — and, while Transoxiana had no strong ruler, seized Kath and Khiva too. Timur, who had united Transoxiana by 1369, invaded in 1372: Kath fell and Husain died during the siege of Urgench, and his brother Yusuf Sufi made peace by ceding Kath and Khiva. After Yusuf’s raids Timur besieged Urgench again in 1379, stormed it and ended Sufid independence; Suleiman Sufi’s revolt of 1387 was crushed, and Sufids later ruled as Timurid governors. Kath lies in the Karakalpakstan piece, so the north–south split is drawn at the Khorezm border.',
  timelineItemIds: ['tm-khwarazm-mongols'], confidence: CONF.medieval,
  sources: [W('Sufi dynasty'), W('Konye-Urgench'), UNESCO('Kunya-Urgench', 1199), NE],
}, [
  [1361, 'Husain Sufi takes Urgench and northern Khwarazm (c. 1361)', { khwarazm: SUFID_NORTH }],
  [1365, 'Husain Sufi seizes Kath and Khiva (1360s)', { khwarazm: ['Khwarazm (Urgench, Kath and Khiva)', ['DASH', 'QR', 'XO']] }],
  [1372, 'Timur takes Kath and Khiva (1372)', { khwarazm: SUFID_NORTH }],
  [1379, 'Timur storms Urgench (1379)', { khwarazm: SUFID_NORTH }],
]);

const MERV = ['Merv oasis', ['MARY']];
const merv = build({
  id: 'merv-qajar', name: 'Merv (Safavid and Qajar)', color: '#B7472A',
  description: 'Shah Abbas won Merv back from the Uzbeks of Bukhara, and in 1600 a Safavid governor, Biktash Khan Ustajlu, was appointed. From 1608, when Mihrab Khan Qajar became governor, a Qajar family ruled the oasis for nearly two centuries. From 1715 the Qajar elite pushed for independence from the failing Safavids, but Tatar and Turkmen raids made the oasis insecure until Nader Shah cowed the raiders and restored Merv’s irrigation. After Nader’s death (1747) the local Qajars declared the independent Qajar Principality of Merv. In 1785 Shah Murad of Bukhara attacked Merv and killed its ruler, Bayram Ali Khan; in 1788–89 he razed the city, broke the dams and deported its people to Bukhara and Samarkand (drawn under the Khanate of Bukhara).',
  nameAt: [[1600, 'Merv (Safavid province)'], [1736, 'Merv (Afsharid Persia)'], [1747, 'Qajar Principality of Merv']],
  timelineItemIds: ['tm-between-empires'], confidence: CONF.medieval,
  sources: [W('Merv'), W('Safavid Iran'), W('Nader Shah'), UNESCO('State Historical and Cultural Park “Ancient Merv”', 886), NE],
}, [
  [1600, 'Biktash Khan Ustajlu, Safavid governor of Merv (1600)', { merv: MERV }],
  [1608, 'Mihrab Khan Qajar: two centuries of Qajar governors (1608)', { merv: MERV }],
  [1736, 'Nader Shah restores Merv’s irrigation', { merv: MERV }],
  [1747, 'The Qajar Principality of Merv (1747)', { merv: MERV }],
  [1784, 'Bayram Ali Khan, last Qajar khan of Merv', { merv: MERV }],
]);

export const turkmenistanPolities = [oxus, seljuk, sufid, merv];

// ---- Fixes to older shapes over Turkmenistan ---------------------------------------------------------
//
//  - The Parthian Empire's 'parthia' ring (−238 and −200 keyframes) and 'parthia-aria' ring (−141 and
//    −100) ran along 37.7°N east of 56°E, just south of Nisa (37.97°N), the Arsacids' early centre
//    and the 'Parthian Fortresses of Nisa' World Heritage site. They now reach the Kopet Dag foothills
//    from Dihistan's edge to Abiward, taking in Nisa.
//  - The Safavid 1620 'persia' ring ran to 62°E, 37°N, over the Merv oasis, which from 1600 is drawn
//    as its own Safavid/Qajar province (merv-qajar); that vertex now sits at Sarakhs (61.15°E,
//    36.55°N), so Merv is drawn once.
//  - The Uzbekistan pack's Khanate of Bukhara gains Merv from Shah Murad's conquest (1785) to its
//    destruction (1788–89); the oasis is left empty from 1790, as the 1815 nations table leaves it.
const PARTHIA_NISA = [[57.3, 38.25], [58.3, 38.2], [59.2, 37.65]];
const BUKHARA_MERV = ['Merv (taken 1785, razed 1788–89)', ['MARY']];
export const turkmenistanShapeFixes = {
  'parthian-empire': ['parthia and parthia-aria reach Nisa (−238 to −100)'],
  'safavid-empire': 'trimmed',
  'bukhara-khanate': ['Merv 1785–1789'],
};

/** Apply `turkmenistanShapeFixes` (runs after the packs are appended; throws if a target is missing). */
export function applyTurkmenistanShapeFixes(entities, resolveRegionRing) {
  const find = (id) => {
    const e = entities.find((x) => x.id === id);
    if (!e) throw new Error(`turkmenistan fixes: no entity ${id}`);
    return e;
  };
  const rid = (r) => (typeof r === 'string' ? r : r.id);
  const swap = (ring, at, by) => {
    const i = ring.findIndex(([x, y]) => x === at[0] && y === at[1]);
    if (i < 0) return null;
    return [...ring.slice(0, i), ...by, ...ring.slice(i + 1)];
  };

  // 1. Parthia reaches Nisa.
  const parth = find('parthian-empire');
  for (const [y, region, name] of [[-238, 'parthia', 'Parthia'], [-200, 'parthia', 'Parthia'], [-141, 'parthia-aria', 'Parthia and Aria'], [-100, 'parthia-aria', 'Parthia and Aria']]) {
    const kf = parth.overlays.find((o) => o.year === y);
    const i = kf ? kf.regions.findIndex((r) => rid(r) === region) : -1;
    if (i < 0) throw new Error(`turkmenistan fixes: parthian-empire ${y} has no ${region}`);
    const old = resolveRegionRing(kf.regions[i]);
    if (old.some(([x, yy]) => x === PARTHIA_NISA[1][0] && yy === PARTHIA_NISA[1][1])) continue;
    const ring = swap(old, [58.5, 37.7], PARTHIA_NISA);
    if (!ring) throw new Error(`turkmenistan fixes: parthian-empire ${y} ${region} has no 58.5,37.7 vertex`);
    kf.regions[i] = { id: region, name: typeof kf.regions[i] === 'string' ? name : kf.regions[i].name, ring: ensureClockwise(ring) };
  }

  // 2. Safavid 1620 'persia' stops at Sarakhs.
  const saf = find('safavid-empire');
  const s1620 = saf.overlays.find((o) => o.year === 1620);
  const si = s1620 ? s1620.regions.findIndex((r) => rid(r) === 'persia') : -1;
  if (si < 0) throw new Error('turkmenistan fixes: safavid-empire 1620 has no persia');
  const sOld = resolveRegionRing(s1620.regions[si]);
  if (sOld.some(([x, y]) => x === 62 && y === 37)) {
    const r = s1620.regions[si];
    s1620.regions[si] = { id: 'persia', name: typeof r === 'string' ? 'Persia' : r.name, ring: ensureClockwise(swap(sOld, [62, 37], [[61.15, 36.55]])) };
  }

  // 3. Bukhara holds Merv 1785–1789.
  const bu = find('bukhara-khanate');
  if (bu.overlays.some((o) => o.regions.some((r) => rid(r) === 'merv'))) return;
  const mervRegion = { id: 'merv', name: BUKHARA_MERV[0], ring: ringOf('bukhara merv', BUKHARA_MERV[1]) };
  const k1785 = bu.overlays.find((o) => o.year === 1785);
  if (!k1785) throw new Error('turkmenistan fixes: bukhara-khanate has no 1785 keyframe');
  const after = bu.overlays.find((o) => o.year > 1790);
  if (!after) throw new Error('turkmenistan fixes: bukhara-khanate has no keyframe after 1790');
  k1785.regions = [...k1785.regions, mervRegion];
  const at1789 = { ...k1785, year: 1789, label: 'Shah Murad razes Merv and deports its people (1788–89)', regions: k1785.regions.map((r) => ({ ...r })) };
  const at1790 = { ...k1785, year: 1790, label: 'Merv left in ruins (1790)', regions: k1785.regions.filter((r) => rid(r) !== 'merv').map((r) => ({ ...r })) };
  bu.overlays = [...bu.overlays.filter((o) => o.year <= 1785), at1789, at1790, ...bu.overlays.filter((o) => o.year > 1790)];
  bu.keyYears = [...new Set([...(bu.keyYears || []), 1789, 1790])].sort((a, b) => a - b);
  if (!bu.sources.some((s) => s.url.endsWith('/Merv'))) bu.sources = [...bu.sources, W('Merv')];
}
