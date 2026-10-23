/**
 * Day 69 — Phase 5 country pack 1, globe backfill: Kenya (ROADMAP item 12).
 *
 * Kenya had a sourced timeline (data/countries/kenya.json) but on the globe, before the 1815
 * nations layer, only one schematic "Lamu–Mombasa coast" region of the Day 58 Swahili city-states
 * shape — a long blob that covered the whole coast and a lot of sea from 1000 to 1704 — plus the
 * broad Bantu / Nilotic peoples and presence bands. This module draws Kenya's own states:
 *
 *   Shanga · Manda · Gedi · Mombasa (Mvita) · Malindi · Lamu · Pate · Siyu and Faza ·
 *   Portuguese Mombasa (Fort Jesus) · Omani and Mazrui Mombasa · the Wanga Kingdom
 *
 * From 1815 the nations layer takes over (it draws British East Africa from 1888), so no keyframe
 * here is later than 1815. Every shape has dated keyframes, an honest confidence level, sources
 * and links to Kenya's timeline items.
 *
 * How it is drawn (docs/DATA.md, "Country-pack globe backfill"):
 *  - The Swahili towns ruled a town, its island or creek and a strip of the mainland, not
 *    surveyed territories. Each is a small fixed "piece" of coast (MALINDI, GEDI, MOMBASA …);
 *    pieces share their borders, so successive rulers of a piece (Mombasa's sultans → the
 *    Portuguese → the Omani and Mazrui governors) never overlap, and changes are one-year steps.
 *  - Mainland pieces take their sea side from Kenya's coast traced off the globe's own land
 *    (KENYA_COAST below, nudged 0.03° inland), so they stop at the shore.
 *  - The Lamu archipelago's islands (Pate, Manda, Lamu) are smaller than the simplified land
 *    shapes, so their pieces are drawn where the islands really are, just off the traced coast.
 *  - Stretches where no source says who ruled (the Kilifi creek, the Tana delta, the south coast
 *    by Vanga, the Kiunga coast) are left empty, and so is the interior, apart from the Wanga
 *    Kingdom: the Maasai, Kikuyu, Kamba, Kalenjin, Luo, Luhya and Mijikenda were peoples without
 *    a single state, shown by the peoples layer.
 *
 * Shapes live in the lazy globe chunk (docs/DATA.md).
 */
import { ensureClockwise } from './globe-morph.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_'))}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}/` });

const HORTON_SHANGA = { title: 'Horton, Shanga: the archaeology of a Muslim trading community on the coast of East Africa (British Institute in Eastern Africa, 1996)', url: 'https://en.wikipedia.org/wiki/Pate_Island#Bibliography' };
const CHITTICK_MANDA = { title: 'Chittick, Manda: Excavations at an Island Port on the Kenya Coast (British Institute in Eastern Africa, 1984)', url: 'https://en.wikipedia.org/wiki/Manda_Island#References' };
const KIRKMAN_FJ = { title: 'Kirkman, Fort Jesus: A Portuguese Fortress on the East African Coast (Oxford, 1974)', url: 'https://en.wikipedia.org/wiki/Fort_Jesus#References' };
const POUWELS_SHELA = { title: 'Pouwels, “The Battle of Shela: the climax of an era and a point of departure in the modern history of the Kenya coast”, Cahiers d’études africaines 31 (1991)', url: 'https://doi.org/10.3406/cea.1991.1581' };
const PRADINES_GEDI = { title: 'Pradines, “Islamization and urbanization on the coast of East Africa: recent excavations at Gedi, Kenya”, Azania 38 (2003)', url: 'https://doi.org/10.1080/00672700309480369' };
const WERE_1967 = { title: 'Were, A History of the Abaluyia of Western Kenya, c. 1500–1930 (East African Publishing House, 1967)', url: 'https://en.wikipedia.org/wiki/Wanga_Kingdom#References' };

const CONF = {
  site: {
    level: 'conjectural',
    reason: 'Known almost only from excavation (Chittick, Horton, Kirkman, Pradines): the dates of building, rebuilding and abandonment are good, but no text says who ruled the town or how far its rule reached. Drawn as the town with its island or a strip of hinterland.',
  },
  town: {
    level: 'approximate',
    reason: 'Recorded by Arab geographers (al-Idrisi, Ibn Battuta), Portuguese chroniclers from 1498 and the Swahili town chronicles. A Swahili state was a town, its island or creek and the farms and allies on the mainland opposite; the inland edge is drawn roughly.',
  },
  fort: {
    level: 'approximate',
    reason: 'Fort Jesus, its garrison, its captains and its sieges are precisely recorded (Portuguese and Omani sources, Kirkman’s excavations). Portuguese power outside the island and Malindi was a matter of tribute and alliances, so the mainland edge is drawn roughly.',
  },
  mazrui: {
    level: 'approximate',
    reason: 'The governors of Mombasa and their dates are well recorded. Their mainland reach depended on alliances with the Mijikenda and the Twelve Nations of Mombasa, so the inland edge is drawn roughly; their holdings on Pemba (to 1822) belong to the Tanzania pack.',
  },
  wanga: {
    level: 'conjectural',
    reason: 'Known from Wanga oral traditions collected by Were (1967) and in Dealing’s thesis on Wanga politics, whose king lists and dates differ by decades. The capitals (Imanga, Matungu, Elureko / Mumias) are known; the extent of the Nabongo’s rule over neighbouring clans is a guess.',
  },
};

// ---- Kenya's coast ---------------------------------------------------------------------------------
//
// [lng, lat] from the Tana delta south to Vanga, read off the globe's own simplified land
// (src/data/nations.topo.json, Natural Earth, public domain) and nudged 0.03° inland. At Mombasa
// the trace skips Tudor Creek and Port Reitz and runs just outside the island, so the old town and
// Fort Jesus sit inside the shape.
export const KENYA_COAST = [
  [40.218, -2.641], [40.146, -2.755], [40.135, -2.94], [40.195, -2.994], [40.16, -3.066], [40.10, -3.293],
  [39.949, -3.358], [39.829, -3.609], [39.84, -3.688], [39.759, -3.905], [39.705, -4.04], [39.70, -4.075],
  [39.665, -4.115], [39.514, -4.417], [39.384, -4.597],
];

function lngAt(lat) {
  for (let i = 1; i < KENYA_COAST.length; i++) {
    const [a, la] = KENYA_COAST[i - 1];
    const [b, lb] = KENYA_COAST[i];
    if (lat <= la && lat >= lb) return Math.round((a + ((b - a) * (lat - la)) / (lb - la || 1)) * 1000) / 1000;
  }
  throw new Error(`kenya coast: latitude ${lat} is outside the trace`);
}

/** [lng, lat] points along the shore from latitude `north` south to `south`, ends interpolated. */
export function kenyaShore(north, south) {
  if (!(south < north)) throw new Error(`kenya coast: ${south} must be south of ${north}`);
  const out = [[lngAt(north), north]];
  for (const [lng, lat] of KENYA_COAST) if (lat < north - 1e-9 && lat > south + 1e-9) out.push([lng, lat]);
  out.push([lngAt(south), south]);
  return out;
}

/** Closed ring: the shore from `north` to `south`, then `inland` ([lng, lat], south → north). */
const coastal = (north, south, inland) => {
  const c = kenyaShore(north, south);
  return [...c, ...inland, c[0]];
};

// ---- Pieces --------------------------------------------------------------------------------------
//
// Mainland pieces share their cross-edges (same points), island pieces their channels, so two
// pieces never overlap. North → south.
const PIECES = {
  // Pate Island (the simplified land has no islands here; these sit where the island is).
  pateWest: [[40.884, -2.014], [41.028, -2.043], [41.035, -2.11], [41.03, -2.17], [40.93, -2.175], [40.895, -2.12], [40.884, -2.014]],
  pateNorth: [[41.028, -2.043], [41.12, -1.985], [41.17, -2.03], [41.14, -2.09], [41.09, -2.11], [41.035, -2.11], [41.028, -2.043]],
  pateSouthEast: [[41.035, -2.11], [41.09, -2.11], [41.14, -2.09], [41.12, -2.15], [41.06, -2.175], [41.03, -2.17], [41.035, -2.11]],
  manda: [[40.925, -2.21], [40.97, -2.185], [41.05, -2.19], [41.04, -2.26], [40.975, -2.31], [40.94, -2.30], [40.925, -2.21]],
  // Lamu Island and the mainland opposite (Mokowe).
  lamu: [[40.80, -2.225], [40.86, -2.195], [40.925, -2.21], [40.94, -2.30], [40.905, -2.345], [40.83, -2.335], [40.80, -2.29], [40.80, -2.225]],
  // The coast from Mambrui to Malindi Bay, and Malindi's farms on the Sabaki.
  malindi: coastal(-2.90, -3.25, [[39.90, -3.25], [39.93, -2.90]]),
  // Gedi in the Arabuko-Sokoke forest, Watamu and Mida Creek.
  gedi: coastal(-3.25, -3.40, [[39.80, -3.40], [39.90, -3.25]]),
  // Mombasa Island, Tudor Creek and the mainland from Mtwapa to Tiwi.
  mombasa: coastal(-3.88, -4.30, [[39.45, -4.25], [39.55, -4.00], [39.66, -3.86]]),
  mombasaCore: coastal(-3.97, -4.15, [[39.58, -4.13], [39.62, -3.97]]),
};
const P = (id, name, piece) => ({ id, name, ring: ensureClockwise(PIECES[piece]) });

// Wanga (western Kenya), around Imanga, Matungu and Elureko (Mumias).
const WANGA_EARLY = [[34.38, 0.22], [34.40, 0.42], [34.55, 0.46], [34.65, 0.36], [34.60, 0.20], [34.48, 0.15], [34.38, 0.22]];
const WANGA_NETYA = [[34.25, 0.15], [34.28, 0.50], [34.50, 0.60], [34.75, 0.48], [34.75, 0.20], [34.55, 0.05], [34.25, 0.15]];
const WANGA_SPLIT = [[34.30, 0.15], [34.32, 0.48], [34.50, 0.56], [34.68, 0.46], [34.70, 0.20], [34.55, 0.08], [34.30, 0.15]];
const Wr = (name, ring) => ({ id: 'wanga', name, ring: ensureClockwise(ring) });

/**
 * Keyframes from dated steps `[year, label, regions]`: every change also gets a keyframe the year
 * before (the old extent), so a shape never morphs across a neighbour's piece.
 */
function build(meta, steps) {
  const years = new Set();
  steps.forEach(([y], i) => {
    years.add(y);
    if (i > 0 && y - 1 > steps[i - 1][0]) years.add(y - 1);
  });
  const overlays = [...years].sort((a, b) => a - b).map((y) => {
    let s = steps[0];
    for (const st of steps) if (st[0] <= y) s = st;
    return { year: y, label: s[1], approximation: A, regions: s[2] };
  });
  return { edgeGrace: 1, keyYears: steps.map(([y]) => y), ...meta, overlays };
}

// ---- The Lamu archipelago ------------------------------------------------------------------------

const shanga = build({
  id: 'shanga', name: 'Shanga', color: '#0891B2', type: 'state',
  description: 'A trading town on the south-east shore of Pate Island and one of the oldest Muslim settlements in sub-Saharan Africa. Mark Horton’s excavations (1980–88) found a timber stockade and round houses of the 700s, a small Muslim community from the late 700s, mosques rebuilt more than twenty times, and a stone town of about 130 houses by the 1300s. Shanga was abandoned between about 1400 and 1425, as the Pate Chronicle and oral tradition also record; its people (the Washanga) moved to Siyu.',
  timelineItemIds: ['kenya-lamu-archipelago', 'kenya-swahili-city-states'], confidence: CONF.site,
  sources: [W('Pate Island'), HORTON_SHANGA, W('Swahili coast')],
}, [
  [760, 'Shanga: a timber stockade and the first mosques', [P('shanga', 'Shanga', 'pateSouthEast')]],
  [900, 'Shanga’s mosques rebuilt in coral stone', [P('shanga', 'Shanga', 'pateSouthEast')]],
  [1050, 'The Friday Mosque destroyed and rebuilt', [P('shanga', 'Shanga', 'pateSouthEast')]],
  [1300, 'Shanga’s stone town: some 130 houses and a palace', [P('shanga', 'Shanga', 'pateSouthEast')]],
  [1424, 'Shanga abandoned (c. 1400–1425)', [P('shanga', 'Shanga', 'pateSouthEast')]],
]);

const manda = build({
  id: 'manda', name: 'Manda', color: '#4F46E5', type: 'state',
  description: 'An island port in the Lamu archipelago, excavated by Neville Chittick in 1966–78. From the mid-800s it traded ivory and mangrove poles with the Persian Gulf, built in fired brick (probably brought as ballast from Sohar in Oman) and coral, and imported Chinese porcelain and Islamic glazed ware; its sea walls and some 3,500 people made it the richest town on the coast of its time. It declined from the 1200s. The shape shows Manda’s great period only; the island’s later small towns, Manda and Takwa (1500–1700), are cities on the map.',
  timelineItemIds: ['kenya-lamu-archipelago', 'kenya-swahili-city-states'], confidence: CONF.site,
  sources: [W('Manda Island'), CHITTICK_MANDA],
}, [
  [850, 'Manda trades with the Persian Gulf', [P('manda', 'Manda', 'manda')]],
  [1000, 'Manda at its height (sea walls, about 3,500 people)', [P('manda', 'Manda', 'manda')]],
  [1200, 'Manda in decline', [P('manda', 'Manda', 'manda')]],
  [1299, 'Manda in decline', [P('manda', 'Manda', 'manda')]],
]);

const pate = build({
  id: 'pate-sultanate', name: 'Pate', color: '#7C3AED', type: 'state',
  description: 'The town and sultanate of Pate on the south-west of Pate Island, ruled by the Nabhani family. The Pate Chronicle dates the Nabhani to 1203 and says Pate once ruled most of the coast, but excavation suggests the town rose in the 1300s and the chronicle exaggerates. Pate paid tribute to the Portuguese and played them off against Oman; the 1700s were its golden age of fine houses, silk weaving, siwa horns and Swahili poetry (the Utendi wa Tambuka was written at its court in 1728). Pate and its Mazrui allies were routed by Lamu at Shela about 1812, and Pate declined; from 1815 it is outside this pack (its sultans later moved to Witu).',
  timelineItemIds: ['kenya-lamu-archipelago', 'kenya-swahili-city-states', 'kenya-portuguese-omani'], confidence: CONF.town,
  sources: [W('Pate Island'), W('Battle of Shela'), POUWELS_SHELA, { title: 'Tolmacheva (ed.), The Pate Chronicle (Michigan State University Press, 1993)', url: 'https://en.wikipedia.org/wiki/Pate_Island#References' }],
}, [
  [1300, 'Pate town rises (the chronicle claims 1203)', [P('pate', 'Pate', 'pateWest')]],
  [1500, 'Pate pays tribute to the Portuguese', [P('pate', 'Pate', 'pateWest')]],
  [1700, 'The golden age of Pate', [P('pate', 'Pate', 'pateWest')]],
  [1812, 'Pate and the Mazrui defeated at Shela', [P('pate', 'Pate', 'pateWest')]],
  [1815, 'Pate in decline', [P('pate', 'Pate', 'pateWest')]],
]);

const siyu = build({
  id: 'siyu', name: 'Siyu and Faza', color: '#A21CAF', type: 'state',
  description: 'The towns of the north coast of Pate Island. Faza (the Portuguese Ampaza) was destroyed by a Portuguese fleet from Goa in 1587 for helping the Ottoman corsair Mir Ali Bey, then resettled. Siyu was the island’s largest town when the friar Gaspar de Santo Bernadino passed in 1606; in 1634 it had “no king but is ruled by governors”, and in the 1700s a Famao patrician and a Somali shaykh ruled it jointly, making it a centre of Islamic learning and Qur’an copying. Siyu held out against the sultans of Zanzibar until 1863.',
  timelineItemIds: ['kenya-lamu-archipelago'], confidence: CONF.town,
  sources: [W('Siyu'), W('Pate Island')],
}, [
  [1500, 'Siyu and Faza (Ampaza)', [P('siyu', 'Siyu and Faza', 'pateNorth')]],
  [1587, 'The Portuguese destroy Faza', [P('siyu', 'Siyu and Faza', 'pateNorth')]],
  [1606, 'Siyu, the largest town on Pate', [P('siyu', 'Siyu', 'pateNorth')]],
  [1700, 'Siyu under a Famao–Somali diarchy', [P('siyu', 'Siyu and Faza', 'pateNorth')]],
  [1815, 'Siyu and Faza', [P('siyu', 'Siyu and Faza', 'pateNorth')]],
]);

const lamu = build({
  id: 'lamu', name: 'Lamu', color: '#2563EB', type: 'state',
  description: 'The town on Lamu Island, continuously inhabited for over 700 years and now the best-preserved Swahili town (a UNESCO World Heritage site). Ruled by its elders (wazee) and long the rival of Pate, it traded mangrove poles, ivory and grain. About 1812 Lamu routed the forces of Pate and the Mazrui of Mombasa on the dunes at Shela; fearing revenge it asked Sayyid Said of Oman for protection, received an Omani governor about 1814 and began Lamu Fort (1813–21), the first step of the Busaidi takeover of the coast.',
  nameAt: [[1300, 'Lamu'], [1814, 'Lamu (Omani governor)']],
  timelineItemIds: ['kenya-lamu-archipelago', 'kenya-swahili-city-states', 'kenya-portuguese-omani'], confidence: CONF.town,
  sources: [UNESCO('Lamu Old Town', 1055), W('Battle of Shela'), POUWELS_SHELA],
}, [
  [1300, 'Lamu town', [P('lamu', 'Lamu', 'lamu')]],
  [1500, 'Lamu pays tribute to the Portuguese', [P('lamu', 'Lamu', 'lamu')]],
  [1700, 'Lamu, rival of Pate', [P('lamu', 'Lamu', 'lamu')]],
  [1812, 'Lamu wins the Battle of Shela (c. 1812)', [P('lamu', 'Lamu', 'lamu')]],
  [1813, 'Lamu Fort begun; Lamu turns to Oman', [P('lamu', 'Lamu', 'lamu')]],
  [1815, 'Lamu under an Omani governor', [P('lamu', 'Lamu (Omani governor)', 'lamu')]],
]);

// ---- Malindi, Gedi and Mombasa -------------------------------------------------------------------

const gedi = build({
  id: 'gedi', name: 'Gedi', color: '#0F766E', type: 'state',
  description: 'A walled Swahili town in the Arabuko-Sokoke forest near Watamu, now a UNESCO World Heritage site (2024). UNESCO dates the town to the 10th–17th centuries and a radiocarbon-dated grave marker to 1041–1278; its mosques, palace, stone houses and pillar tombs (one dated 1399) were excavated by James Kirkman from 1948. Gedi peaked in the 1400s and 1500s with perhaps 2,500 people, then declined — Portuguese trade monopolies, a falling water table, the Zimba raid of 1589 and Oromo raids — and was abandoned by about 1650. No document names its rulers; it may have been under Malindi.',
  timelineItemIds: ['kenya-swahili-city-states'], confidence: CONF.site,
  sources: [W('Gedi Ruins'), UNESCO('The Historic Town and Archaeological Site of Gedi', 1720), PRADINES_GEDI],
}, [
  [1050, 'Gedi founded (11th–12th century)', [P('gedi', 'Gedi', 'gedi')]],
  [1399, 'Gedi’s dated tomb (AH 802)', [P('gedi', 'Gedi', 'gedi')]],
  [1450, 'Gedi at its height: walls and the Great Mosque', [P('gedi', 'Gedi', 'gedi')]],
  [1589, 'The Zimba raid the coast', [P('gedi', 'Gedi', 'gedi')]],
  [1640, 'Gedi abandoned (by about 1650)', [P('gedi', 'Gedi', 'gedi')]],
]);

const malindi = build({
  id: 'malindi-sultanate', name: 'Malindi', color: '#DB2777', type: 'state',
  description: 'A Swahili town on Malindi Bay, at the mouth of the Galana (Sabaki) River, recorded from the 1200s (Abu al-Fida). Its envoys sailed with Zheng He’s Ming fleet, which called in 1417–19, and in 1498 its ruler welcomed Vasco da Gama, gave him a pilot for India and let him raise the pillar that still stands. Malindi became Portugal’s ally against Mombasa and Kilwa and the seat of its factor on the coast (1502–1593). In 1593 its ruling family took over Mombasa under Portuguese protection; Malindi itself dwindled and was almost empty by 1700.',
  timelineItemIds: ['kenya-swahili-city-states', 'kenya-portuguese-omani'], confidence: CONF.town,
  sources: [W('Malindi'), W('Vasco da Gama'), W('Zheng He')],
}, [
  [1250, 'Malindi (recorded by Abu al-Fida)', [P('malindi', 'Malindi', 'malindi')]],
  [1418, 'Zheng He’s fleet at Malindi', [P('malindi', 'Malindi', 'malindi')]],
  [1498, 'Vasco da Gama welcomed at Malindi', [P('malindi', 'Malindi', 'malindi')]],
  [1502, 'Malindi, Portugal’s ally (Portuguese factory 1502)', [P('malindi', 'Malindi (Portuguese ally)', 'malindi')]],
  [1589, 'The Segeju halt the Zimba at Malindi', [P('malindi', 'Malindi (Portuguese ally)', 'malindi')]],
  [1592, 'Malindi’s sheikh is given Mombasa', [P('malindi', 'Malindi (Portuguese ally)', 'malindi')]],
]);

const mombasa = build({
  id: 'mombasa-sultanate', name: 'Mombasa (Mvita)', color: '#B91C1C', type: 'state',
  description: 'The Swahili city on Mombasa Island, called Mvita in Swahili. Tradition remembers its founding queen Mwana Mkisi and the scholar Shehe Mvita; al-Idrisi described it in 1151 and Ibn Battuta stayed a night in 1331. It was the strongest town on this coast when Vasco da Gama was turned away in 1498, and the Portuguese sacked it in 1505 (Almeida) and 1528 (Nuno da Cunha). In 1585–89 it took the side of the Ottoman corsair Mir Ali Bey; in 1589 the Zimba sacked it as the Portuguese fleet destroyed the Turks, and in 1592 the Segeju took it and handed it to the sheikh of Malindi.',
  timelineItemIds: ['kenya-swahili-city-states', 'kenya-portuguese-omani'], confidence: CONF.town,
  sources: [W('Mombasa'), W('Ibn Battuta'), { title: 'Berg, “The Swahili Community of Mombasa, 1500–1900”, Journal of African History 9 (1968)', url: 'https://doi.org/10.1017/s0021853700008343' }],
}, [
  [1151, 'Manbasa, described by al-Idrisi', [P('mombasa', 'Mombasa', 'mombasaCore')]],
  [1300, 'Mombasa’s first stone mosque (Mnara)', [P('mombasa', 'Mombasa (Mvita)', 'mombasa')]],
  [1331, 'Ibn Battuta at Mombasa', [P('mombasa', 'Mombasa (Mvita)', 'mombasa')]],
  [1498, 'Mombasa turns Vasco da Gama away', [P('mombasa', 'Mombasa (Mvita)', 'mombasa')]],
  [1505, 'Almeida sacks Mombasa', [P('mombasa', 'Mombasa (Mvita)', 'mombasa')]],
  [1528, 'Nuno da Cunha sacks Mombasa', [P('mombasa', 'Mombasa (Mvita)', 'mombasa')]],
  [1586, 'Mombasa joins Mir Ali Bey’s Ottoman fleet', [P('mombasa', 'Mombasa (Mvita)', 'mombasa')]],
  [1589, 'The Zimba sack Mombasa', [P('mombasa', 'Mombasa (Mvita)', 'mombasa')]],
  [1591, 'Mombasa', [P('mombasa', 'Mombasa (Mvita)', 'mombasa')]],
]);

const portugueseMombasa = build({
  id: 'portuguese-mombasa', name: 'Portuguese Mombasa (Fort Jesus)', color: '#15803D', type: 'state',
  description: 'In 1593 the Portuguese moved their base on the coast from Malindi to Mombasa, set the Malindi sultans over the town and began Fort Jesus (1593–96), designed by Giovanni Battista Cairati — now a UNESCO World Heritage site. In 1631 the sultan Yusuf ibn al-Hasan (baptised Dom Jerónimo Chingulia) killed the garrison and held the fort; he left in 1632 and the Portuguese returned to rule directly. Omani forces under Saif ibn Sultan besieged Fort Jesus from March 1696 until it fell in December 1698, ending Portuguese rule north of Mozambique (apart from a brief return in 1728–29, shown on the Omani shape).',
  nameAt: [[1593, 'Portuguese Mombasa (Fort Jesus)'], [1631, 'Mombasa (Dom Jerónimo’s revolt, 1631–32)'], [1632, 'Portuguese Mombasa (Fort Jesus)']],
  timelineItemIds: ['kenya-fort-jesus', 'kenya-portuguese-omani'], confidence: CONF.fort,
  sources: [UNESCO('Fort Jesus, Mombasa', 1295), W('Fort Jesus'), W('Mombasa'), KIRKMAN_FJ],
}, [
  [1593, 'Fort Jesus begun; Malindi’s rulers govern Mombasa', [P('mombasa', 'Mombasa and Fort Jesus', 'mombasa'), P('malindi', 'Malindi', 'malindi')]],
  [1630, 'Portuguese Mombasa and Malindi', [P('mombasa', 'Mombasa and Fort Jesus', 'mombasa'), P('malindi', 'Malindi', 'malindi')]],
  [1631, 'Dom Jerónimo kills the garrison (1631–32)', [P('mombasa', 'Mombasa and Fort Jesus', 'mombasa')]],
  [1632, 'The Portuguese return and rule Mombasa directly', [P('mombasa', 'Mombasa and Fort Jesus', 'mombasa')]],
  [1696, 'The siege of Fort Jesus (1696–98)', [P('mombasa', 'Fort Jesus (besieged)', 'mombasa')]],
  [1697, 'The siege of Fort Jesus (1696–98)', [P('mombasa', 'Fort Jesus (besieged)', 'mombasa')]],
]);

const omaniMombasa = build({
  id: 'mazrui-mombasa', name: 'Omani and Mazrui Mombasa', color: '#9F1239', type: 'state',
  description: 'After Fort Jesus fell in December 1698, Mombasa was governed for the imams of Oman, from 1698 by Nasr ibn Abdallah al-Mazrui. The town rose in 1728 and let the Portuguese back into the fort until September 1729. When the Busaidi took power in Oman, the Mazrui governor ‘Ali ibn Uthman ruled on his own account from about 1746, and the Mazrui made Mombasa the leading power of the Kenya coast, with Pemba, allies among the Mijikenda and a hand in Pate’s succession wars. Their defeat with Pate at Shela (c. 1812) opened the coast to Sayyid Said of Oman, who took Fort Jesus in 1837 (after a short British protectorate in 1824–26).',
  nameAt: [[1698, 'Omani Mombasa (governors for the imam)'], [1746, 'Mazrui Mombasa']],
  timelineItemIds: ['kenya-mazrui-mombasa', 'kenya-portuguese-omani'], confidence: CONF.mazrui,
  sources: [W('Mazrui'), W('Mombasa'), W('Fort Jesus'), W('Battle of Shela'), POUWELS_SHELA],
}, [
  [1698, 'Oman takes Fort Jesus; Nasr al-Mazrui governor', [P('mombasa', 'Mombasa', 'mombasa')]],
  [1728, 'Mombasa rises; the Portuguese hold Fort Jesus again (1728–29)', [P('mombasa', 'Mombasa (Portuguese again in Fort Jesus, 1728–29)', 'mombasa')]],
  [1730, 'Omani governors again', [P('mombasa', 'Mombasa', 'mombasa')]],
  [1746, 'The Mazrui rule Mombasa independently', [P('mombasa', 'Mazrui Mombasa', 'mombasa')]],
  [1807, 'The Mazrui back a claimant to Pate', [P('mombasa', 'Mazrui Mombasa', 'mombasa')]],
  [1812, 'The Mazrui defeated with Pate at Shela', [P('mombasa', 'Mazrui Mombasa', 'mombasa')]],
  [1815, 'Mazrui Mombasa', [P('mombasa', 'Mazrui Mombasa', 'mombasa')]],
]);

// ---- The Wanga Kingdom ---------------------------------------------------------------------------

const wanga = build({
  id: 'wanga-kingdom', name: 'Wanga Kingdom', color: '#CA8A04', type: 'state',
  description: 'The kingdom of the Wanga, one of the Luhya peoples of western Kenya, ruled by a king (Nabongo) of the Abashitse clan — the most centralised state in pre-colonial Kenya. Traditions trace the founder, Wanga, to Buganda or Bunyoro and date him from the 1500s to about 1650. His heirs quarrelled: Murono set up a rival centre near Matungu (c. 1679–1706), Netya (c. 1760–87) tried to bring the Wanga centres under Elureko (later Mumias) and hired Uasin Gishu Maasai warriors, and Osundwa made peace with the Maasai; at his death (c. 1814) Kweyu broke away to Eshimuli. Under Nabongo Mumia (r. c. 1882–1926) Wanga allied with Swahili traders and then the British.',
  timelineItemIds: ['kenya-interior-peoples'], confidence: CONF.wanga,
  sources: [W('Wanga Kingdom'), WERE_1967],
}, [
  [1650, 'Nabongo Wanga’s kingdom (traditions: 1500s–1650)', [Wr('Wanga', WANGA_EARLY)]],
  [1680, 'Murono’s rival centre at Matungu', [Wr('Wanga', WANGA_EARLY)]],
  [1760, 'Nabongo Netya unites the Wanga centres', [Wr('Wanga Kingdom', WANGA_NETYA)]],
  [1787, 'Netya dies; wars with the Maasai', [Wr('Wanga Kingdom', WANGA_NETYA)]],
  [1800, 'Osundwa makes peace with the Maasai at Mumias', [Wr('Wanga Kingdom', WANGA_NETYA)]],
  [1814, 'Kweyu breaks away to Eshimuli', [Wr('Wanga Kingdom', WANGA_SPLIT)]],
  [1815, 'Wanga Kingdom', [Wr('Wanga Kingdom', WANGA_SPLIT)]],
]);

export const kenyaPolities = [shanga, manda, gedi, mombasa, malindi, lamu, pate, siyu, portugueseMombasa, omaniMombasa, wanga];

// ---- Fixes to existing shapes over Kenya ---------------------------------------------------------
//
// The Day 58 Swahili city-states shape drew the Kenya coast as one schematic 'north' region
// ("Lamu–Mombasa coast") that spread well out to sea; the towns are now drawn one by one above, so
// that region is dropped (Zanzibar, Kilwa and Sofala stay for the Tanzania / Mozambique packs).
export const kenyaShapeFixes = { 'swahili-city-states': { dropRegions: ['north'] } };

/** Apply `kenyaShapeFixes` (throws if a target is missing). */
export function applyKenyaShapeFixes(entities) {
  for (const [id, { dropRegions }] of Object.entries(kenyaShapeFixes)) {
    const ent = entities.find((e) => e.id === id);
    if (!ent) throw new Error(`kenya fixes: no entity ${id}`);
    let dropped = 0;
    for (const kf of ent.overlays) {
      const before = kf.regions.length;
      kf.regions = kf.regions.filter((r) => !dropRegions.includes(typeof r === 'string' ? r : r.id));
      dropped += before - kf.regions.length;
    }
    if (!dropped) throw new Error(`kenya fixes: ${id} has no ${dropRegions.join(', ')} region`);
  }
}
