/**
 * Day 86 — Phase 5 country pack 4, Central Africa: Chad (ROADMAP item 4, fourth country).
 *
 * Chad had no country timeline. On the globe before the 1815 nations layer, Kanem–Bornu was the
 * Day 58 schematic rings (trimmed off the Mandara Mountains by Day 85, but still a hand-drawn
 * blob across Chad, Nigeria and Niger). Nothing showed Bagirmi or Wadai. This module redraws
 * Kanem–Bornu by id from province pieces, and adds Bagirmi and Wadai:
 *
 *   Kanem–Bornu (redrawn) · Sultanate of Bagirmi · Sultanate of Wadai
 *
 * From 1815 the nations layer takes over (French Chad only from 1900), so no keyframe here is
 * later than 1815. The Sao and Kotoko of the Logone, the Tubu of the north, Rabih az-Zubayr,
 * French conquest, independence and the years since 1960 are timeline items with pins. Kotoko
 * towns often paid tribute to Bornu, so the Logone floodplain stays in the Bornu fill (as Day 85
 * required) rather than a second overlapping outline. The Mandara Mountains stay out, so Mandara
 * remains a neighbour.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - Chad, Nigeria, Niger and Cameroon (and, at the 1250 peak, a boxed Fezzan and Kawar) are cut
 *    into 12 pieces the pack's states use: Natural Earth 1:10m provinces (public domain) cut on
 *    straight lines into historical regions — Kanem (around Mao and the Tié cluster), western
 *    Barh El Gazel, Lac, western Hadjer-Lamis, Bagirmi around Massenya, Wadai around Ouara and
 *    Abéché, northern Borno, eastern Yobe (Ngazargamu), southern Diffa (Nguigmi), the Logone
 *    floodplain in Cameroon's Extrême-Nord (Kousséri, Makari, Logone-Birni, not Maroua or the
 *    Mandara Mountains), Kawar around Bilma and Fezzan around Zawila and Murzuq — clipped to the
 *    globe's own land (src/data/nations.topo.json shapes 243 Chad, 250 Nigeria, 260 Niger, 244
 *    Cameroon, 206 Libya) and simplified together as one coverage. The Logone piece is fitted to
 *    the Day 85 Mandara ring without changing it. Generator: et-tools day86-pieces.py (outside
 *    the repo).
 *  - A polity is a dated list of pieces; every change is a one-year step. Kanem (north-east of
 *    the lake) and Bornu (west of the lake) are separate regions, so the 1380 move does not morph
 *    a single outline across the water. Bornu itself is several regions (Nigerian Borno/Yobe,
 *    Diffa, the Logone, the lower Chari), because pieces clipped to different country lands do
 *    not share vertices at the modern border. Kawar and Fezzan at 1250 are separate regions too,
 *    because merging them with Kanem would stretch a corridor across the desert.
 *  - Kanem–Bornu replaces the Day 58 entity by id (same id, colour and civilisation link).
 *    Day 85's Mandara trim still holds: the new Bornu pieces are cut clear of the Mandara
 *    Mountains; the Logone floodplain stays in Bornu.
 *  - Pieces are regions, not surveyed borders. These states ruled through tribute, palaces and
 *    lineages, not fixed frontiers (see each polity's confidence reason).
 */

import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const GHA = { title: 'UNESCO General History of Africa, vols. III–VII', url: 'https://www.unesco.org/en/general-history-africa' };

// ---- Pieces ([lng, lat]) ---------------------------------------------------------------------------
export const TD_PIECES = {
  KANEM: [[13.6461, 14.6398], [13.7647, 14.7191], [13.7647, 14.72], [13.7732, 14.7425], [13.763, 14.7902], [13.7803, 14.9076], [13.8339, 15.0196], [14.3695, 15.7489], [14.8031, 16.2], [16.5864, 16.2], [16.4891, 16.0374], [16.2644, 15.2613], [16.1317, 14.812], [16.1113, 14.5771], [16.05, 14.475], [15.7743, 14.1482], [15.5905, 14.0767], [15.6007, 13.7539], [15.8418, 13.7658], [15.8402, 13.6426], [15.8984, 13.5215], [15.8836, 13.1879], [15.8717, 13.1715], [15.7762, 13.1719], [15.5601, 13.2648], [15.3758, 13.752], [15.2133, 13.7506], [14.9158, 13.6788], [14.7957, 13.6712], [14.6438, 13.9089], [14.4774, 14.1045], [14.3566, 14.135], [14.1457, 14.3139], [14.1271, 14.3867], [13.9505, 14.4661], [13.6153, 14.5165], [13.6461, 14.6398]],
  BEG_W: [[16.1363, 13.05], [15.9868, 13.0515], [15.8836, 13.1879], [15.8984, 13.5215], [15.8402, 13.6426], [15.8418, 13.7658], [15.6007, 13.7539], [15.5905, 14.0767], [15.7743, 14.1482], [16.05, 14.475], [16.1113, 14.5771], [16.1317, 14.812], [16.2644, 15.2613], [16.3046, 15.4], [17.2, 15.4], [17.2, 13.2458], [17.1317, 13.144], [16.9973, 13.1821], [16.8241, 13.1598], [16.7194, 13.1131], [16.4894, 13.0816], [16.4478, 13.051], [16.2, 13.0502], [16.1363, 13.05]],
  LAC: [[14.4812, 13.0003], [14.4785, 13.0045], [14.4354, 13.0703], [14.4224, 13.0785], [14.4199, 13.0817], [14.0649, 13.078], [13.6073, 13.7041], [13.4492, 14.3841], [13.4839, 14.4836], [13.6153, 14.5165], [13.9505, 14.4661], [14.1271, 14.3867], [14.1457, 14.3139], [14.3566, 14.135], [14.4774, 14.1045], [14.6438, 13.9089], [14.7957, 13.6712], [14.9158, 13.6788], [15.2133, 13.7506], [15.3758, 13.752], [15.5601, 13.2648], [15.4411, 13.3187], [15.3568, 13.4051], [15.2195, 13.3614], [15.3793, 13.185], [15.2699, 13.102], [15.1695, 13.2061], [15.0043, 13.2601], [15.0423, 13.1036], [14.9984, 12.9998], [14.4812, 13.0005], [14.4812, 13.0003]],
  HADJER_W: [[15.8717, 13.1715], [15.8836, 13.1879], [15.9868, 13.0515], [16.1363, 13.05], [16.2, 13.0502], [16.2, 12.4105], [16.0602, 12.4633], [15.9785, 12.3714], [15.8764, 12.3408], [15.713, 12.351], [15.4066, 12.2795], [15.3045, 12.3408], [15.2637, 12.2999], [14.906, 12.2488], [14.9095, 12.3264], [14.9042, 12.3451], [14.8912, 12.4027], [14.8837, 12.416], [14.8776, 12.4371], [14.8775, 12.447], [14.8741, 12.4493], [14.8617, 12.4924], [14.8308, 12.6182], [14.8198, 12.6377], [14.8195, 12.6386], [14.8192, 12.6387], [14.8192, 12.6388], [14.8191, 12.6388], [14.7509, 12.6701], [14.7433, 12.6772], [14.7316, 12.6789], [14.7108, 12.6885], [14.5851, 12.7465], [14.549, 12.8008], [14.549, 12.8182], [14.52, 12.8445], [14.4917, 12.8895], [14.5047, 12.969], [14.4812, 13.0003], [14.4812, 13.0005], [14.9984, 12.9998], [15.0423, 13.1036], [15.0043, 13.2601], [15.1695, 13.2061], [15.2699, 13.102], [15.3793, 13.185], [15.2195, 13.3614], [15.3568, 13.4051], [15.4411, 13.3187], [15.5601, 13.2648], [15.7762, 13.1719], [15.8476, 13.1688], [15.8717, 13.1715]],
  BAGIRMI: [[16.775, 11.8812], [16.7852, 11.7383], [16.8363, 11.6974], [16.9895, 11.6872], [17.1222, 11.5647], [17.2652, 11.4932], [17.255, 11.2379], [17.3162, 10.7477], [17.2958, 10.5844], [17.4, 10.5315], [17.4, 10.2], [16.6082, 10.2], [16.5622, 10.2508], [16.4785, 10.2], [16.2135, 10.2], [16.1265, 10.315], [16.1085, 10.446], [16.1392, 10.7344], [16.0012, 10.7894], [15.9218, 10.7758], [15.7456, 10.8112], [15.6495, 10.8966], [15.5487, 10.9259], [15.453, 11.0352], [15.4321, 11.1163], [15.3429, 11.1704], [15.2, 11.1581], [15.2, 12.0], [16.676, 12.0], [16.775, 11.8812]],
  WADAI: [[22.0736, 13.7715], [22.1321, 13.6387], [22.1959, 13.5805], [22.2752, 13.3758], [22.1249, 13.1831], [22.0161, 13.1402], [21.9332, 13.0594], [21.8094, 12.7937], [21.5745, 12.882], [21.3805, 12.7901], [21.2375, 12.6777], [21.0945, 12.6982], [20.9822, 12.6675], [20.8495, 12.7186], [20.8392, 12.882], [20.6861, 12.9126], [20.6759, 13.0454], [20.4104, 13.0454], [20.2946, 13.0923], [20.3048, 13.2232], [20.2832, 13.5632], [20.2317, 13.6698], [20.2385, 13.8862], [20.0001, 14.0106], [20.0001, 14.156], [20.288, 14.4414], [20.5588, 14.469], [20.8442, 14.355], [20.9581, 14.2041], [21.1682, 14.1015], [21.4355, 14.1515], [21.7023, 14.1109], [22.0423, 13.9995], [22.1808, 13.9206], [22.0736, 13.7715]],
  BORNO_N: [[14.4215, 12.3532], [14.427, 12.3483], [14.6098, 12.186], [14.6106, 12.1835], [14.6173, 12.1793], [14.6668, 12.1643], [14.6372, 12.1242], [14.6263, 12.0789], [14.6035, 12.031], [14.6051, 12.0229], [14.6063, 12.0113], [14.608, 12.0072], [14.6241, 11.9224], [14.6117, 11.8831], [14.5464, 11.7183], [14.5524, 11.689], [14.5697, 11.6877], [14.6259, 11.6139], [14.6272, 11.6053], [14.5927, 11.4959], [14.3549, 11.3969], [14.2315, 11.3], [12.2076, 11.3], [12.2872, 11.4185], [12.3539, 11.5], [12.354, 11.5], [12.3883, 11.542], [12.3363, 11.6467], [12.2357, 11.6632], [12.3011, 11.8197], [12.2828, 11.9635], [12.3289, 12.2999], [12.3083, 12.4496], [12.4185, 12.5518], [12.4875, 12.6728], [12.479, 12.7342], [12.3629, 12.8853], [12.3867, 13.0786], [12.3929, 13.0784], [12.4281, 13.0754], [12.4727, 13.0642], [12.4863, 13.0706], [12.4867, 13.0706], [12.518, 13.142], [12.5543, 13.1875], [12.5401, 13.1927], [12.5498, 13.2147], [12.5582, 13.2265], [12.5604, 13.239], [12.6556, 13.2891], [12.6743, 13.2837], [12.688, 13.305], [12.7223, 13.3218], [12.7244, 13.3223], [12.7536, 13.3502], [12.7853, 13.3798], [12.8052, 13.373], [12.7965, 13.3903], [12.8126, 13.4054], [12.8263, 13.4061], [12.8331, 13.4245], [13.0303, 13.5388], [13.0807, 13.5413], [13.0883, 13.5306], [13.1373, 13.5441], [13.1547, 13.5449], [13.2281, 13.548], [13.2449, 13.5692], [13.358, 13.71], [13.6067, 13.7041], [14.0635, 13.0776], [14.1774, 12.5456], [14.1787, 12.385], [14.2176, 12.3593], [14.4085, 12.3536], [14.4215, 12.3532]],
  YOBE_E: [[12.354, 11.5], [12.3539, 11.5], [10.9734, 11.5], [10.9681, 11.5753], [10.8479, 11.867], [10.8104, 12.1397], [10.7702, 12.2101], [10.7352, 12.4023], [10.6095, 12.5024], [10.5699, 12.7087], [10.5, 12.793], [10.5, 13.338], [10.6471, 13.3688], [10.9046, 13.3674], [11.4398, 13.3644], [11.8531, 13.2448], [12.0187, 13.1413], [12.038, 13.1264], [12.0582, 13.1166], [12.0583, 13.1166], [12.0585, 13.1166], [12.1164, 13.1028], [12.1976, 13.1247], [12.2042, 13.1245], [12.3867, 13.0786], [12.3629, 12.8853], [12.479, 12.7342], [12.4875, 12.6728], [12.4185, 12.5518], [12.3083, 12.4496], [12.3289, 12.2999], [12.2828, 11.9635], [12.3011, 11.8197], [12.2357, 11.6632], [12.3363, 11.6467], [12.3883, 11.542], [12.354, 11.5]],
  DIFFA_S: [[12.0583, 13.1166], [12.0582, 13.1166], [12.0187, 13.1413], [11.8528, 13.2454], [11.7423, 13.2894], [11.4398, 13.3644], [11.4391, 13.3646], [10.9046, 13.3674], [10.6449, 13.3748], [10.6233, 13.5296], [10.7965, 13.7055], [10.8154, 13.8068], [11.2215, 14.1723], [11.3417, 14.1575], [11.5241, 14.2132], [11.7753, 14.3717], [11.8806, 14.3757], [11.9752, 14.4304], [11.9154, 14.5641], [12.0001, 14.6085], [11.9994, 15.4], [14.1127, 15.4], [13.8331, 15.0201], [13.7803, 14.9076], [13.7539, 14.8259], [13.763, 14.7902], [13.7647, 14.72], [13.6461, 14.6398], [13.61, 14.5186], [13.4823, 14.4836], [13.4492, 14.3841], [13.6063, 13.7046], [13.3615, 13.7144], [13.2449, 13.5692], [13.1547, 13.5449], [13.144, 13.5506], [13.1373, 13.5441], [13.0807, 13.5413], [13.0293, 13.5392], [12.8423, 13.4891], [12.8331, 13.4245], [12.8126, 13.4054], [12.7973, 13.3996], [12.7965, 13.3903], [12.7853, 13.3798], [12.7774, 13.3867], [12.7536, 13.3502], [12.7223, 13.3218], [12.6901, 13.312], [12.688, 13.305], [12.6556, 13.2891], [12.63, 13.3104], [12.5604, 13.239], [12.5498, 13.2147], [12.5383, 13.1934], [12.5401, 13.1927], [12.518, 13.142], [12.4863, 13.0706], [12.4281, 13.0754], [12.4143, 13.0776], [12.3929, 13.0784], [12.2042, 13.1245], [12.2014, 13.1254], [12.1976, 13.1247], [12.0585, 13.1166], [12.0583, 13.1166]],
  LOGONE_CM: [[14.4215, 12.3532], [14.4085, 12.3536], [14.4, 12.356], [14.4, 13.08], [14.4224, 13.0785], [14.4785, 13.0045], [14.4812, 13.0003], [14.4917, 12.8895], [14.4901, 12.8736], [14.52, 12.8445], [14.549, 12.8008], [14.5548, 12.7669], [14.5851, 12.7465], [14.5855, 12.7459], [14.7108, 12.6885], [14.7137, 12.6525], [14.7316, 12.6789], [14.7509, 12.6701], [14.7688, 12.6332], [14.8191, 12.6388], [14.8192, 12.6388], [14.8192, 12.6387], [14.8198, 12.6377], [14.8617, 12.4924], [14.8496, 12.457], [14.8741, 12.4493], [14.8776, 12.4371], [14.8775, 12.4272], [14.8837, 12.416], [14.9042, 12.3451], [14.898, 12.1528], [15.0392, 12.0561], [15.0442, 11.8773], [15.1109, 11.7829], [15.0683, 11.7001], [15.1342, 11.5349], [15.116, 11.5], [14.5961, 11.5], [14.6272, 11.6053], [14.6287, 11.6102], [14.6259, 11.6139], [14.5809, 11.6833], [14.5697, 11.6877], [14.5464, 11.7183], [14.5907, 11.7832], [14.6117, 11.8831], [14.6251, 11.9168], [14.6241, 11.9224], [14.6252, 11.9681], [14.608, 12.0072], [14.6051, 12.0229], [14.6263, 12.0789], [14.6668, 12.1643], [14.6515, 12.1938], [14.6173, 12.1793], [14.6098, 12.186], [14.5144, 12.3235], [14.427, 12.3483], [14.4215, 12.3532]],
  KAWAR: [[12.4, 19.2], [13.4, 19.2], [13.4, 18.3], [12.4, 18.3], [12.4, 19.2]],
  FEZZAN: [[14.133, 26.2677], [14.4244, 26.3763], [14.5563, 26.5], [16.0, 26.5], [16.0, 25.4], [13.4, 25.4], [13.4, 26.5], [14.0175, 26.5], [13.9323, 26.3482], [13.9345, 26.245], [14.133, 26.2677]],
};

const P = (names) => names.map((n) => {
  const r = TD_PIECES[n];
  if (!r) throw new Error(`chad pack: no piece ${n}`);
  return r;
});
export const TD_STEPS = {};
function build(meta, steps) {
  TD_STEPS[meta.id] = steps;
  const years = new Set();
  steps.forEach(([y], i) => {
    years.add(y);
    if (i > 0 && y - 1 > steps[i - 1][0]) years.add(y - 1);
  });
  const overlays = [...years].sort((x, y) => x - y).map((y) => {
    let s = steps[0];
    for (const st of steps) if (st[0] <= y) s = st;
    const regions = Object.entries(s[2]).map(([rid, [name, pieces]]) => {
      const ps = P(pieces);
      const ring = ps.length === 1 ? ensureClockwise(ps[0]) : ensureClockwise(mergeRings(`${meta.id} ${y} ${rid}`, ...ps));
      return { id: rid, name, ring };
    });
    return { year: y, label: s[1], approximation: A, regions };
  });
  return { edgeGrace: 1, keyYears: steps.map(([y]) => y), type: 'state', ...meta, overlays };
}
const conf = (level, reason) => ({ level, reason });

const KANEM_EAST = ['KANEM', 'BEG_W', 'LAC'];
const BORNU_NG = ['YOBE_E', 'BORNO_N'];
const BORNU_CORE = {
  bornu: ['Bornu (west of Lake Chad)', BORNU_NG],
  diffa: ['Bornu (Diffa)', ['DIFFA_S']],
};
const BORNU_WIDE = {
  bornu: ['Bornu (west of Lake Chad)', BORNU_NG],
  diffa: ['Bornu (Diffa)', ['DIFFA_S']],
  logone: ['Logone floodplain', ['LOGONE_CM']],
  hadjer: ['Lower Chari', ['HADJER_W']],
};

// ---- Kanem–Bornu (replaces the Day 58 schematic entity by id) ------------------------------------
const kanemBornu = build({
  id: 'kanem-bornu', name: 'Kanem–Bornu', color: '#A16207', type: 'empire',
  nameAt: [[700, 'Kanem'], [1380, 'Bornu']],
  description: 'One of Africa’s longest-lived states, ruled by the Sayfawa dynasty for about a thousand years. Kanem grew north-east of Lake Chad, around Mao and the fired-brick sites east of it (Tié is tentatively identified with the capital Njimi). Under Dunama Dabbalemi (c. 1221–59) it reached the Kawar oases and, loosely, the Fezzan. Civil war and the Bulala pushed the court west of the lake to Bornu around 1380; from Ngazargamu, Idris Alooma (1564–96) rebuilt a musket-armed state that again held Kanem and took tribute from the Logone. Ngazargamu fell to the Fulani in 1808; Muhammad al-Amin al-Kanemi founded a new capital at Kukawa in 1814.',
  timelineItemIds: ['kanem-bornu', 'td-kanem', 'td-bornu', 'td-ngazargamu', 'td-alooma', 'td-kanemi'],
  confidence: conf('conjectural', 'Rulers, capitals and wars are known from the Dīwān, Ibn Furtu, later chronicles and archaeology (Magnavita and others at Tié), but these were tribute states, not surveyed countries. Pieces are today’s provinces cut on straight lines. Njimi has not been securely identified (Tié, east of Mao, is the usual tentative site). Control of Kawar and the Fezzan in the 13th century was almost certainly a hold on oases and routes, not a solid province, so they are drawn as separate patches only at the 1250 peak. The Logone floodplain is included from 1500 because Kotoko towns often paid tribute; the Mandara Mountains stay out, as in Day 85. The 1800 ring is the western core before the Fulani jihad, not a claim to all of old Kanem.'),
  sources: [W('Kanem–Bornu Empire'), W('Kanem Empire'), W('Bornu Empire'), W('Njimi'), W('Idris Alooma'), W('Muhammad al-Amin al-Kanemi'), GHA],
}, [
  [800, 'Early Kanem, north-east of Lake Chad', { kanem: ['Kanem (north-east of Lake Chad)', ['KANEM']] }],
  [1100, 'Sayfawa Kanem turns Muslim', { kanem: ['Kanem', ['KANEM', 'BEG_W']] }],
  [1250, 'Dunama Dabbalemi reaches the Fezzan', { kanem: ['Kanem', KANEM_EAST], kawar: ['Kawar', ['KAWAR']], fezzan: ['Fezzan', ['FEZZAN']] }],
  [1280, 'After Dunama; Fezzan and Kawar dropped', { kanem: ['Kanem', KANEM_EAST] }],
  [1390, 'Court moves west to Bornu', { ...BORNU_CORE }],
  [1500, 'Ngazargamu; Kanem retaken', { ...BORNU_WIDE, kanem: ['Kanem', KANEM_EAST] }],
  [1600, 'Idris Alooma’s Bornu', { ...BORNU_WIDE, kanem: ['Kanem', KANEM_EAST] }],
  [1750, 'Bornu’s western core; Kanem no longer held tight', { ...BORNU_CORE }],
  [1800, 'Bornu before the Fulani jihad', { ...BORNU_CORE }],
  [1808, 'Ngazargamu falls; el-Kanemi rises', { ...BORNU_CORE }],
  [1814, 'Capital at Kukawa', { bornu: ['Bornu (Kukawa)', BORNU_NG], diffa: ['Bornu (Diffa)', ['DIFFA_S']] }],
  [1815, 'Bornu under al-Kanemi', { bornu: ['Bornu (Kukawa)', BORNU_NG], diffa: ['Bornu (Diffa)', ['DIFFA_S']] }],
]);

// ---- Sultanate of Bagirmi ------------------------------------------------------------------------
const bagirmi = build({
  id: 'bagirmi', name: 'Sultanate of Bagirmi', color: '#7E22CE',
  nameAt: [[1522, 'Sultanate of Bagirmi']],
  description: 'A Chari basin sultanate south-east of Lake Chad, founded traditionally in 1522 and ruled from Massenya by the mbang. It sat between Bornu and Wadai, farmed the floodplain and raided south for slaves that were sold north. Bornu claimed suzerainty in the later 17th century; Sabun of Wadai sacked Massenya in 1805. The sultanate survived, weaker, until Rabih az-Zubayr burned Massenya in 1894 and the French took the remnant.',
  timelineItemIds: ['td-bagirmi'],
  confidence: conf('conjectural', 'The 1522 founding year is a tradition, not a contemporary record, and some accounts place the state a little earlier. Drawn as Chari-Baguirmi around Massenya, not a surveyed border, and not N’Djamena (a 1900 town) or Wadai. Tribute to Bornu or Wadai is not drawn as those empires’ fill.'),
  sources: [W('Sultanate of Bagirmi'), W('Massenya'), W('History of Chad'), GHA],
}, [
  [1522, 'Sultanate of Bagirmi at Massenya', { bagirmi: ['Sultanate of Bagirmi', ['BAGIRMI']] }],
  [1650, 'Bornu claims suzerainty over Bagirmi', { bagirmi: ['Bagirmi (under Bornu’s claim)', ['BAGIRMI']] }],
  [1805, 'Sabun of Wadai sacks Massenya', { bagirmi: ['Bagirmi', ['BAGIRMI']] }],
  [1815, 'Sultanate of Bagirmi', { bagirmi: ['Sultanate of Bagirmi', ['BAGIRMI']] }],
]);

// ---- Sultanate of Wadai --------------------------------------------------------------------------
const wadai = build({
  id: 'wadai', name: 'Sultanate of Wadai', color: '#9F1239',
  nameAt: [[1635, 'Sultanate of Wadai']],
  description: 'An eastern Chad sultanate founded around 1635 when ʿAbd al-Karim overthrew the Tunjur and made Ouara (Wara) his capital. The Maba-led state sat on the pilgrimage and trade road toward Darfur and the Nile, and in the 18th century became Bornu’s main eastern rival. Sabun sacked Massenya in 1805. The court later moved to Abéché (c. 1850, after this pack’s 1815 hand-off). France took Wadai in 1909–12.',
  timelineItemIds: ['td-wadai'],
  confidence: conf('conjectural', 'The 1635 founding year is the usual date for ʿAbd al-Karim’s coup; the Tunjur years before it are poorly mapped and are not drawn. The outline is the Ouaddaï region around Ouara and Abéché, not a surveyed border, and not Darfur or Bagirmi. 18th-century campaigns reached farther than this core, but those limits are too uncertain to draw.'),
  sources: [W('Wadai Empire'), W('Ouara'), W('Abéché'), W('History of Chad'), GHA],
}, [
  [1635, 'ʿAbd al-Karim founds Wadai at Ouara', { wadai: ['Sultanate of Wadai (Ouara)', ['WADAI']] }],
  [1805, 'Sabun sacks Massenya', { wadai: ['Sultanate of Wadai (Ouara)', ['WADAI']] }],
  [1815, 'Sultanate of Wadai', { wadai: ['Sultanate of Wadai (Ouara)', ['WADAI']] }],
]);

export const chadPolities = [kanemBornu, bagirmi, wadai];

/** No extra empire drops: Kanem–Bornu is replaced by id; Mandara stays a Day 85 neighbour. */
export const chadShapeFixes = {};

/** Apply `chadShapeFixes` (none today; kept so the overlays hook matches other packs). */
export function applyChadShapeFixes(entities) {
  if (!entities.find((e) => e.id === 'kanem-bornu')) throw new Error('chad fixes: no entity kanem-bornu');
}
