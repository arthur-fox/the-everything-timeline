/**
 * Day 84 — Phase 5 country pack 4, Central Africa: Angola (ROADMAP item 4, second country).
 *
 * Angola had no country timeline, and on the globe before the 1815 nations layer only the Day 58
 * Kingdom of Kongo ring, the Portuguese Empire's schematic 'angola-coast' box (1600–1700, which ran
 * into the Atlantic and over the highlands) and the Bantu peoples bands. Nothing showed Ndongo,
 * Matamba, Kasanje, Soyo or the Ovimbundu kingdoms. This module draws Angola's states before 1815:
 *
 *   Kingdom of Kongo (redrawn) · Soyo · Kingdom of Ndongo · Kingdom of Matamba (Njinga's Ndongo
 *   and Matamba from 1631) · Kasanje · Portuguese Angola (Luanda, the Kwanza forts, Benguela) ·
 *   Bailundo · Viye
 *
 * From 1815 the nations layer takes over (Kongo at its core and Portuguese Angola's coast), so no
 * keyframe here is later than 1815. The Dutch years at Luanda (1641–48), the slave trade, the
 * colonial conquest, the war of independence, the civil war and modern Angola are timeline items
 * with pins.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - Angola is cut into 21 pieces, of which AO_PIECES keeps the 14 the pack's states use: Natural
 *    Earth 1:10m provinces (public domain; the eighteen before the 2024 split) cut on straight lines
 *    into historical regions — Zaire into Soyo (west of 12.95°E) and the Mpemba lands of Mbanza
 *    Kongo, Uíge at 7.3°S, Bengo at 8.45°S (Mbamba / Dande to the north) and along the lower Kwanza
 *    (Kisama to the south, not drawn), Cuanza Norte at 14.6°E (the Kwanza forts / the Kabasa
 *    highlands), Malanje into Pungo a Ndongo (west of 16.1°E), Matamba (north of 9.25°S) and the
 *    Baixa de Cassanje (east of 16.9°E), coastal Benguela (west of 13.9°E), northern Huambo
 *    (Bailundo, north of 12.55°S) and western Bié (Viye) — clipped to the globe's own Angola land
 *    (src/data/nations.topo.json shape 275) and simplified together as one coverage. They are then
 *    fitted to the Day 83 pieces they touch (DR Congo's BAS_CONGO and KWANGO, Angola's LUNDA_N and
 *    LUNDA_S, which are not changed): a vertex that lands on a Day 83 edge is snapped to that
 *    piece's nearest vertex, so the two packs' pieces share every vertex along their borders.
 *    Generator: et-tools day84-pieces.py (outside the repo).
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - The Day 58 Kingdom of Kongo is replaced by id (same id, colour and civilisation link) and drawn
 *    on pieces, including DR Congo's Kongo Central (CD_PIECES.BAS_CONGO: Nsundi, Mpangu, Mbata).
 *    Soyo is its own region (the Congo estuary would leave a hole if it were merged in).
 *  - The Portuguese Empire's 'angola-coast' region is dropped (angolaShapeFixes): Portuguese
 *    Angola is drawn once, by this pack.
 *  - Pieces are regions, not surveyed borders. These states ruled through tribute, titles and
 *    vassal sobas, not fixed frontiers (see each polity's confidence reason).
 */

import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';
import { CD_PIECES } from './globe-pack-dr-congo.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const GHA = { title: 'UNESCO General History of Africa, vols. IV–V', url: 'https://www.unesco.org/en/general-history-africa' };
const THORNTON = { title: 'Thornton, A History of West Central Africa to 1850 (2020)', url: 'https://en.wikipedia.org/wiki/Kingdom_of_Ndongo#Bibliography' };
const MILLER = { title: 'Miller, Kings and Kinsmen: Early Mbundu States in Angola (1976)', url: 'https://en.wikipedia.org/wiki/Kingdom_of_Ndongo#Bibliography' };

// ---- Pieces ([lng, lat]) ---------------------------------------------------------------------------
//  SOYO (Zaire west of 12.95°E, north of 6.75°S) · ZAIRE (the rest of Zaire: Mpemba, Mbanza Kongo) ·
//  UIGE_N (Uíge north of 7.3°S) · BENGO_N (Bengo north of 8.45°S: Mbamba / Dande) · LUANDA ·
//  BENGO_S (Bengo between 8.45°S and the lower Kwanza) · KN_W (Cuanza Norte west of 14.6°E:
//  Massangano, Cambambe) · KN_E (Cuanza Norte east of 14.6°E: the Kabasa highlands) · MALANJE_W
//  (Malanje west of 16.1°E, north of 10.3°S: Pungo a Ndongo) · MATAMBA (Malanje east of 16.1°E,
//  north of 9.25°S) · KASANJE (Malanje east of 16.9°E, 9.25–10.6°S: the Baixa de Cassanje) ·
//  BENGUELA_C (Benguela west of 13.9°E) · BAILUNDO (Huambo north of 12.55°S) · VIYE (Bié west of
//  17.6°E, north of 13.2°S). Kongo also uses DR Congo's BAS_CONGO (globe-pack-dr-congo.js).
export const AO_PIECES = {
  SOYO: [[12.3956, -6.3245], [12.2754, -6.1174], [12.3756, -6.1071], [12.3812, -6.1062], [12.387, -6.1047], [12.3925, -6.1027], [12.3978, -6.1002], [12.4029, -6.0971], [12.4076, -6.0936], [12.4119, -6.0896], [12.4159, -6.0852], [12.4193, -6.0804], [12.4223, -6.0753], [12.4248, -6.07], [12.4268, -6.0644], [12.4282, -6.0587], [12.429, -6.0528], [12.4292, -6.0469], [12.4289, -6.041], [12.428, -6.0352], [12.4265, -6.0295], [12.4245, -6.024], [12.4219, -6.0187], [12.4507, -6.0513], [12.7243, -5.9788], [12.7454, -5.9486], [12.7434, -5.954], [12.7421, -5.9597], [12.7412, -5.9654], [12.741, -5.9713], [12.7413, -5.9771], [12.7422, -5.9828], [12.7436, -5.9884], [12.7455, -5.9939], [12.748, -5.9992], [12.751, -6.0042], [12.7544, -6.0089], [12.7583, -6.0132], [12.7626, -6.0171], [12.7672, -6.0206], [12.7722, -6.0237], [12.7774, -6.0262], [12.7828, -6.0282], [12.7885, -6.0297], [12.7942, -6.0306], [12.8, -6.031], [12.8058, -6.0308], [12.8116, -6.0301], [12.8169, -6.0289], [12.8615, -6.0163], [12.95, -5.9514], [12.95, -6.75], [12.637, -6.75], [12.4579, -6.4651], [12.3969, -6.3274], [12.3939, -6.3216], [12.3956, -6.3245]],
  ZAIRE: [[13.8703, -7.3], [13.8653, -7.3145], [13.8934, -7.4106], [13.9553, -7.4846], [13.8467, -7.5534], [13.817, -7.6198], [13.5039, -7.7345], [13.4004, -7.695], [13.0949, -7.7927], [12.9393, -7.436], [12.9152, -7.3486], [12.9135, -7.3434], [12.9113, -7.3383], [12.9087, -7.3335], [12.9056, -7.3289], [12.9022, -7.3247], [12.8503, -7.2664], [12.8326, -6.97], [12.8321, -6.9648], [12.8308, -6.959], [12.829, -6.9534], [12.8267, -6.9479], [12.8238, -6.9427], [12.8205, -6.9378], [12.8166, -6.9333], [12.8124, -6.9292], [12.8077, -6.9255], [12.8028, -6.9223], [12.7975, -6.9196], [12.792, -6.9174], [12.7863, -6.9158], [12.7804, -6.9148], [12.7798, -6.9147], [12.7796, -6.9147], [12.637, -6.75], [12.95, -6.75], [12.95, -5.9514], [12.9644, -5.9318], [12.9673, -5.9273], [12.97, -5.9222], [12.9722, -5.9168], [12.9739, -5.9113], [12.975, -5.9056], [12.9756, -5.8998], [12.9756, -5.894], [12.9751, -5.8882], [12.974, -5.8825], [12.9723, -5.8769], [12.9702, -5.8716], [12.9675, -5.8664], [12.9643, -5.8615], [12.9607, -5.857], [12.9566, -5.8528], [12.9522, -5.8491], [12.9474, -5.8458], [12.9423, -5.843], [12.937, -5.8406], [12.9315, -5.8388], [12.8215, -5.8297], [13.1851, -5.8562], [13.3435, -5.891], [13.3795, -5.8562], [13.6423, -5.8659], [13.9447, -5.8422], [14.0203, -5.8729], [14.5783, -5.9049], [14.7597, -5.8805], [14.8505, -6.0323], [14.9005, -6.1955], [14.9676, -6.2633], [14.7883, -6.5367], [14.7114, -6.5781], [14.5341, -6.6032], [14.4241, -6.6817], [14.2908, -6.715], [14.2315, -6.8141], [14.0451, -6.8829], [13.9417, -6.9603], [13.7975, -6.9795], [13.8527, -7.1093], [13.9241, -7.1958], [13.8746, -7.2877], [13.8703, -7.3]],
  UIGE_N: [[14.5783, -5.9049], [14.7583, -5.8798], [16.1012, -5.8576], [16.3172, -5.8548], [16.598, -5.9244], [16.6052, -6.0624], [16.7276, -6.1892], [16.6916, -6.3982], [16.7492, -6.5223], [16.7672, -6.709], [16.832, -6.8274], [16.9256, -6.8888], [16.9724, -7.0142], [16.9292, -7.0602], [16.9472, -7.2051], [17.0984, -7.3779], [17.5311, -8.0657], [17.0979, -7.3783], [17.0029, -7.3], [13.8703, -7.3], [13.8746, -7.2877], [13.9241, -7.1958], [13.8527, -7.1093], [13.7975, -6.9795], [13.9417, -6.9603], [14.0451, -6.8829], [14.2315, -6.8141], [14.2908, -6.715], [14.4241, -6.6817], [14.5341, -6.6032], [14.7114, -6.5781], [14.7883, -6.5367], [14.9676, -6.2633], [14.9005, -6.1955], [14.8505, -6.0323], [14.7597, -5.8805], [14.5783, -5.9049]],
  BENGO_N: [[14.2631, -8.4672], [14.281, -8.45], [13.3809, -8.45], [13.3694, -8.3235], [13.3707, -8.3378], [13.3699, -8.3322], [13.3686, -8.3267], [13.3668, -8.3214], [13.3645, -8.3162], [13.3618, -8.3113], [13.2787, -8.1792], [13.0949, -7.7927], [13.4004, -7.695], [13.5039, -7.7345], [13.817, -7.6198], [14.1249, -7.6418], [14.2888, -7.8197], [14.4183, -7.8929], [14.505, -7.9058], [14.6464, -7.876], [14.7183, -7.9271], [14.7105, -8.0899], [14.6394, -8.2341], [14.6618, -8.3985], [14.6003, -8.4028], [14.6, -8.4027], [14.5954, -8.4012], [14.3772, -8.388], [14.3012, -8.4306], [14.2631, -8.4672]],
  LUANDA: [[13.1434, -9.3303], [13.1378, -9.3211], [13.1382, -9.3219], [12.9979, -9.0933], [13.1, -8.9564], [13.1375, -8.9409], [13.1995, -8.823], [13.3529, -8.7653], [13.3584, -8.7629], [13.3636, -8.76], [13.3686, -8.7565], [13.3731, -8.7526], [13.3773, -8.7482], [13.381, -8.7434], [13.3842, -8.7383], [13.3868, -8.7329], [13.3889, -8.7273], [13.4081, -8.6669], [13.3723, -8.5817], [13.6161, -8.6939], [13.6373, -8.8357], [13.5712, -8.868], [13.5042, -8.9704], [13.4747, -9.1717], [13.3052, -9.1617], [13.2452, -9.2034], [13.1434, -9.3303]],
  BENGO_S: [[13.1378, -9.3211], [13.1434, -9.3303], [13.2452, -9.2034], [13.3052, -9.1617], [13.4747, -9.1717], [13.5042, -8.9704], [13.5712, -8.868], [13.6373, -8.8357], [13.6161, -8.6939], [13.3723, -8.5817], [13.3436, -8.4671], [13.3809, -8.45], [14.281, -8.45], [14.2631, -8.4672], [14.3345, -8.5979], [14.3732, -8.7181], [14.3342, -8.8045], [14.1206, -8.8898], [14.0841, -8.9508], [14.1412, -8.9989], [14.074, -9.0965], [14.1503, -9.1452], [14.2003, -9.2655], [14.1488, -9.3531], [14.0948, -9.5251], [14.1187, -9.5456], [13.8, -9.45], [13.1473, -9.3496], [13.1455, -9.3408], [13.1442, -9.3356], [13.1425, -9.3306], [13.1404, -9.3258], [13.1382, -9.3219], [13.1378, -9.3211]],
  KN_W: [[14.1187, -9.5456], [14.0948, -9.5251], [14.1488, -9.3531], [14.2003, -9.2655], [14.1503, -9.1452], [14.074, -9.0965], [14.1412, -8.9989], [14.0841, -8.9508], [14.1206, -8.8898], [14.3342, -8.8045], [14.3732, -8.7181], [14.3345, -8.5979], [14.2631, -8.4672], [14.3012, -8.4306], [14.3772, -8.388], [14.5954, -8.4012], [14.6, -8.4027], [14.6, -9.7699], [14.5652, -9.7692], [14.5383, -9.7817], [14.4113, -9.6875], [14.2847, -9.6796], [14.2397, -9.625], [14.1615, -9.6281], [14.1237, -9.5499], [14.1187, -9.5456]],
  KN_E: [[15.7973, -8.12], [15.8005, -8.2115], [15.8161, -8.4028], [15.6795, -8.4641], [15.6169, -8.6016], [15.7224, -8.7207], [15.665, -8.8811], [15.6378, -9.1516], [15.4886, -9.1602], [15.3708, -9.2202], [15.2856, -9.2326], [15.2309, -9.3382], [15.1206, -9.3552], [15.1737, -9.4591], [15.1202, -9.5268], [15.1554, -9.6496], [15.1094, -9.7237], [14.9485, -9.6735], [14.9318, -9.7206], [14.8533, -9.7138], [14.7401, -9.7587], [14.6, -9.7699], [14.6, -8.4027], [14.6003, -8.4028], [14.6618, -8.3985], [14.8159, -8.3961], [14.9205, -8.2753], [14.9974, -8.3095], [15.1127, -8.2978], [15.186, -8.2222], [15.221, -8.0932], [15.1821, -8.0596], [15.1925, -7.9698], [15.2814, -7.9383], [15.4079, -7.9341], [15.4209, -8.0291], [15.5401, -8.0542], [15.6253, -8.0151], [15.7161, -8.0113], [15.7973, -8.12]],
  MALANJE_W: [[16.092, -8.1152], [16.1, -8.0733], [16.1, -9.25], [16.1, -9.7377], [15.9659, -9.7123], [15.899, -9.7349], [15.809, -9.716], [15.7582, -9.7827], [15.5208, -9.7895], [15.3638, -9.8168], [15.203, -9.7963], [15.1094, -9.7237], [15.1554, -9.6496], [15.1202, -9.5268], [15.1737, -9.4591], [15.1206, -9.3552], [15.2309, -9.3382], [15.2856, -9.2326], [15.3708, -9.2202], [15.4886, -9.1602], [15.6378, -9.1516], [15.665, -8.8811], [15.7224, -8.7207], [15.6169, -8.6016], [15.6795, -8.4641], [15.8161, -8.4028], [15.8005, -8.2115], [15.919, -8.213], [16.092, -8.1152]],
  MATAMBA: [[17.5697, -8.933], [17.5851, -9.1098], [17.5434, -9.2198], [17.4009, -9.2785], [16.9, -9.25], [16.1, -9.25], [16.1, -8.0733], [16.1091, -8.0257], [16.1258, -7.8765], [16.1, -7.7969], [16.1, -7.5966], [16.1094, -7.591], [16.2194, -7.5686], [16.3457, -7.434], [16.5684, -7.3252], [16.6272, -7.3326], [16.7811, -7.552], [16.8907, -7.6009], [16.969, -7.5327], [16.9813, -7.455], [17.0979, -7.3783], [17.5311, -8.0657], [17.5533, -8.162], [17.5636, -8.3567], [17.5382, -8.5104], [17.5881, -8.6075], [17.5913, -8.8293], [17.5697, -8.933]],
  KASANJE: [[17.4009, -9.2785], [17.3365, -9.3279], [17.3384, -9.3793], [17.4055, -9.5102], [17.4136, -9.5773], [17.5094, -9.6716], [17.57, -9.6894], [17.6459, -9.7985], [17.7134, -9.8068], [18.213, -9.9943], [18.25, -10.0653], [18.1768, -10.2128], [18.2724, -10.3311], [18.4222, -10.4164], [18.4402, -10.4098], [18.5269, -10.4614], [18.6471, -10.6264], [16.9, -10.6], [16.9, -9.25], [17.4009, -9.2785]],
  BENGUELA_C: [[13.9, -13.835], [13.8583, -13.8452], [13.6713, -13.8112], [13.5334, -13.8495], [13.3821, -13.8221], [13.2876, -13.6646], [13.287, -13.6099], [13.2867, -13.6042], [13.2858, -13.5985], [13.2844, -13.5929], [13.2824, -13.5875], [13.2799, -13.5823], [13.277, -13.5773], [13.2735, -13.5727], [13.2697, -13.5684], [13.2655, -13.5645], [13.2609, -13.561], [13.2559, -13.558], [13.2508, -13.5555], [13.2454, -13.5534], [13.2398, -13.5519], [13.1011, -13.5217], [12.9192, -13.6069], [12.632, -13.5386], [12.6259, -13.5375], [12.6197, -13.537], [12.6135, -13.5371], [12.6073, -13.538], [12.6012, -13.5394], [12.5953, -13.5415], [12.5335, -13.567], [12.5128, -13.4418], [12.6188, -13.3561], [12.6229, -13.3524], [12.6267, -13.3484], [12.63, -13.3441], [12.633, -13.3394], [12.6356, -13.3345], [12.6376, -13.3294], [12.6392, -13.3241], [12.6565, -13.2556], [12.7615, -13.193], [12.9295, -13], [12.9329, -12.9956], [12.936, -12.991], [12.9386, -12.986], [12.9407, -12.9809], [12.9423, -12.9755], [12.9435, -12.9701], [12.9441, -12.9645], [12.9442, -12.959], [12.9403, -12.8168], [13.1779, -12.6022], [13.3432, -12.5936], [13.3492, -12.5929], [13.3551, -12.5917], [13.3608, -12.59], [13.3663, -12.5876], [13.3716, -12.5847], [13.3766, -12.5813], [13.3811, -12.5774], [13.4577, -12.5056], [13.4617, -12.5014], [13.4656, -12.4963], [13.469, -12.4909], [13.4717, -12.4851], [13.4738, -12.4791], [13.5051, -12.3722], [13.6195, -12.2727], [13.6234, -12.269], [13.6271, -12.2647], [13.6304, -12.2601], [13.6333, -12.2552], [13.6356, -12.2501], [13.7657, -11.9274], [13.7679, -11.9206], [13.7694, -11.9137], [13.7935, -11.7489], [13.8929, -11.7673], [13.9, -11.7685], [13.9, -13.835]],
  BAILUNDO: [[15.4034, -11.5579], [15.7482, -11.4437], [15.9048, -11.4879], [16.0554, -11.4495], [16.2923, -11.503], [16.3145, -11.6099], [16.4677, -11.7547], [16.4807, -11.816], [16.5757, -11.9081], [16.5789, -11.9696], [16.4796, -12.1512], [16.3375, -12.2769], [16.3795, -12.3791], [16.3712, -12.484], [16.3043, -12.55], [14.9967, -12.55], [15.0078, -12.5471], [15.0693, -12.516], [15.0168, -12.3307], [15.0212, -12.206], [15.1164, -12.0489], [15.3826, -11.9669], [15.4013, -11.7643], [15.3509, -11.6615], [15.4034, -11.5579]],
  VIYE: [[17.6, -13.2], [16.5347, -13.2], [16.5329, -13.1894], [16.5029, -12.7515], [16.3689, -12.6762], [16.3043, -12.55], [16.3712, -12.484], [16.3795, -12.3791], [16.3375, -12.2769], [16.4796, -12.1512], [16.5789, -11.9696], [16.5757, -11.9081], [16.4807, -11.816], [16.4677, -11.7547], [16.3145, -11.6099], [16.2923, -11.503], [16.0554, -11.4495], [15.9048, -11.4879], [15.7482, -11.4437], [15.7858, -11.2768], [15.8729, -11.1588], [15.9511, -10.9468], [16.0048, -10.9827], [16.2065, -10.9941], [16.3245, -10.8346], [16.5487, -10.6808], [16.6116, -10.5742], [16.6107, -10.6187], [16.7862, -10.7689], [16.8884, -10.75], [17.0926, -10.8332], [17.2813, -10.8577], [17.377, -10.9435], [17.3786, -10.9955], [17.4489, -11.1025], [17.401, -11.1908], [17.515, -11.3784], [17.4815, -11.5627], [17.5006, -11.684], [17.5878, -11.7262], [17.6, -11.7233], [17.6, -13.2]],
};

const P = (names) => names.map((n) => {
  const r = AO_PIECES[n] || CD_PIECES[n];
  if (!r) throw new Error(`angola pack: no piece ${n}`);
  return r;
});
export const AO_STEPS = {};
function build(meta, steps) {
  AO_STEPS[meta.id] = steps;
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

// ---- Kingdom of Kongo (replaces the Day 58 ring by id) ---------------------------------------------
const KONGO = ['ZAIRE', 'UIGE_N', 'BENGO_N', 'BAS_CONGO'];
const kongo = build({
  id: 'kongo', name: 'Kingdom of Kongo', color: '#13708A',
  description: 'A kingdom south and north of the lower Congo River, founded around 1390 by Lukeni lua Nimi and ruled by the Manikongo from Mbanza Kongo. Its provinces were Soyo on the coast, Mbamba to the south, Mpemba around the capital, and Nsundi, Mpangu and Mbata to the north and east. King Nzinga a Nkuwu was baptised in 1491, and Afonso I (1509–42) wrote to the kings of Portugal about the slave trade. Soyo broke away in the 1640s; Kongo lost the battle of Mbwila to Portuguese Angola in 1665 and split into rival factions until Pedro IV reunited it in 1709. It survived, weaker, into the colonial era.',
  timelineItemIds: ['kongo', 'ao-kongo', 'cd-kongo'],
  confidence: conf('approximate', 'Unusually well documented for Central Africa: Kongo kings’ own letters, missionaries and Portuguese records (Thornton). The provinces are drawn as today’s provinces (Zaire, northern Uíge, northern Bengo and Kongo Central); the eastern marches toward the Kwango and the Dembos lords between Kongo and Ndongo, whose loyalty shifted, are not drawn. During the civil wars (1665–1709) the kingdom was split between rival houses, but it is drawn whole.'),
  sources: [W('Kingdom of Kongo'), W('Afonso I of Kongo'), W('Battle of Mbwila'), W('Pedro IV of Kongo'), W("M'banza-Kongo"), THORNTON],
}, [
  [1390, 'Lukeni lua Nimi founds Kongo at Mbanza Kongo', { kongo: ['Kongo heartland (Mpemba)', ['ZAIRE']] }],
  [1450, 'Kongo’s provinces on both banks of the river', { kongo: ['Kingdom of Kongo', KONGO], soyo: ['Soyo', ['SOYO']] }],
  [1491, 'Nzinga a Nkuwu baptised João I', { kongo: ['Kingdom of Kongo', KONGO], soyo: ['Soyo', ['SOYO']] }],
  [1500, 'Kongo at contact with Portugal', { kongo: ['Kingdom of Kongo', KONGO], soyo: ['Soyo', ['SOYO']] }],
  [1568, 'Jaga invasion; Mbanza Kongo sacked', { kongo: ['Kingdom of Kongo', KONGO], soyo: ['Soyo', ['SOYO']] }],
  [1641, 'Soyo breaks away', { kongo: ['Kingdom of Kongo', KONGO] }],
  [1665, 'Battle of Mbwila', { kongo: ['Kingdom of Kongo', KONGO] }],
  [1666, 'Civil wars between rival houses', { kongo: ['Kongo (rival houses)', KONGO] }],
  [1709, 'Pedro IV reunites Kongo', { kongo: ['Kingdom of Kongo', KONGO] }],
  [1815, 'Kingdom of Kongo', { kongo: ['Kingdom of Kongo', KONGO] }],
]);

// ---- Soyo -------------------------------------------------------------------------------------------
const soyo = build({
  id: 'soyo', name: 'Soyo', color: '#D97706',
  description: 'Kongo’s province at the mouth of the Congo River, where the Portuguese first landed in 1483 and whose count (mani Soyo) was the first person in Kongo to be baptised, in 1491. Rich from the port of Mpinda, Soyo acted as an independent principality from the 1640s, beat Kongo’s armies, and in 1670 routed a Portuguese army from Angola at Kitombo.',
  timelineItemIds: ['ao-soyo'],
  confidence: conf('approximate', 'Soyo’s independence is well documented by Capuchin missionaries and Portuguese reports; its inland border with Kongo is not, so it is drawn as the coastal corner of Zaire province west of 12.95°E.'),
  sources: [W('Soyo'), W('Mpinda'), W('Battle of Kitombo'), THORNTON],
}, [
  [1641, 'Soyo independent of Kongo', { soyo: ['Soyo', ['SOYO']] }],
  [1670, 'Battle of Kitombo: Soyo routs the Portuguese', { soyo: ['Soyo', ['SOYO']] }],
  [1815, 'Principality of Soyo', { soyo: ['Soyo', ['SOYO']] }],
]);

// ---- Kingdom of Ndongo ----------------------------------------------------------------------------
const ndongo = build({
  id: 'ndongo', name: 'Kingdom of Ndongo', color: '#B91C1C',
  nameAt: [[1518, 'Kingdom of Ndongo'], [1626, 'Ndongo (Pungo a Ndongo)']],
  description: 'The Mbundu kingdom between the Lukala and Kwanza rivers, ruled by the ngola (whose title gave Angola its name) from Kabasa, near today’s N’dalatando. Ngola Kiluanje sent envoys to Portugal in 1518. From 1579 Ndongo fought the Portuguese colony, routing it at the Lukala in 1590, but lost its coast and the lower Kwanza to the Portuguese forts and was overrun by Portuguese and Imbangala armies in 1617–21. After Njinga was driven out in 1626 the Portuguese kept a client king at the rock fortress of Pungo a Ndongo, which they took in 1671.',
  timelineItemIds: ['ao-ndongo', 'ao-njinga'],
  confidence: conf('conjectural', 'Known from Portuguese and Jesuit sources and Capuchin accounts of oral tradition (Cavazzi, Gaeta), studied by Miller, Heintze and Thornton. Ndongo was a web of tributary sobas, so its outline is a guess: the Kabasa highlands, the plateau to Pungo a Ndongo and, before the Portuguese forts, the coast between the Dande and the Kwanza.'),
  sources: [W('Kingdom of Ndongo'), W('Ngola (title)'), W('Black Rocks at Pungo Andongo'), MILLER, THORNTON],
}, [
  [1518, 'Ngola Kiluanje sends envoys to Portugal', { ndongo: ['Kingdom of Ndongo', ['LUANDA', 'BENGO_S', 'KN_W', 'KN_E', 'MALANJE_W']] }],
  [1576, 'Luanda becomes Portuguese', { ndongo: ['Kingdom of Ndongo', ['BENGO_S', 'KN_W', 'KN_E', 'MALANJE_W']] }],
  [1583, 'Portuguese forts up the Kwanza (Massangano)', { ndongo: ['Kingdom of Ndongo', ['KN_E', 'MALANJE_W']] }],
  [1590, 'Ndongo and Matamba rout the Portuguese at the Lukala', { ndongo: ['Kingdom of Ndongo', ['KN_E', 'MALANJE_W']] }],
  [1618, 'Portuguese and Imbangala invade; Kabasa sacked', { ndongo: ['Kingdom of Ndongo', ['KN_E', 'MALANJE_W']] }],
  [1626, 'Njinga driven out; a Portuguese client king at Pungo a Ndongo', { ndongo: ['Ndongo (Pungo a Ndongo)', ['MALANJE_W']] }],
  [1670, 'Pungo a Ndongo revolts and is besieged', { ndongo: ['Ndongo (Pungo a Ndongo)', ['MALANJE_W']] }],
]);

// ---- Kingdom of Matamba ---------------------------------------------------------------------------
const matamba = build({
  id: 'matamba', name: 'Kingdom of Matamba', color: '#7E22CE',
  nameAt: [[1530, 'Kingdom of Matamba'], [1631, 'Ndongo and Matamba (Njinga)'], [1663, 'Kingdom of Ndongo and Matamba']],
  description: 'Matamba, between Ndongo and the Kwango, is first recorded in 1530 paying tribute to Kongo. Its army helped Ndongo rout the Portuguese at the Lukala in 1590. Queen Njinga conquered it around 1631 and made it the base of the joint kingdom of Ndongo and Matamba, from which she fought the Portuguese, allied with the Dutch and finally made peace in 1657. After her the Guterres dynasty, including Queen Verónica I (1681–1721), defended it (Katole, 1681); after a war in 1744 it accepted Portuguese vassalage but kept its own rulers.',
  timelineItemIds: ['ao-matamba', 'ao-njinga'],
  confidence: conf('conjectural', 'Its rulers and wars are well recorded from the 1620s (Cavazzi, Gaeta, Cadornega), but its borders are not. Drawn as northern Malanje between the Lukala headwaters and the Kwango, not a border.'),
  sources: [W('Kingdom of Matamba'), W('Nzinga of Ndongo and Matamba'), W('Verónica I of Matamba'), W('Battle of Katole'), THORNTON],
}, [
  [1530, 'Matamba pays tribute to Kongo', { matamba: ['Kingdom of Matamba', ['MATAMBA']] }],
  [1590, 'Matamba’s army at the Lukala', { matamba: ['Kingdom of Matamba', ['MATAMBA']] }],
  [1631, 'Njinga conquers Matamba', { matamba: ['Ndongo and Matamba', ['MATAMBA']] }],
  [1681, 'Battle of Katole; Verónica I', { matamba: ['Ndongo and Matamba', ['MATAMBA']] }],
  [1744, 'War with Portugal; vassalage', { matamba: ['Ndongo and Matamba', ['MATAMBA']] }],
  [1815, 'Kingdom of Ndongo and Matamba', { matamba: ['Ndongo and Matamba', ['MATAMBA']] }],
]);

// ---- Kasanje ----------------------------------------------------------------------------------------
const kasanje = build({
  id: 'kasanje', name: 'Kasanje', color: '#4338CA',
  description: 'Around 1620 the Imbangala band of Kasanje deserted Portuguese service and settled in the Baixa de Cassanje, the lowland west of the upper Kwango, founding a kingdom ruled by an elected king (the kinguri). It warred with Njinga’s Matamba and became the great inland slave market between the Lunda and Luanda, until Ovimbundu caravan routes eclipsed it in the 1850s; Portugal absorbed it in 1910–12.',
  timelineItemIds: ['ao-kasanje'],
  confidence: conf('approximate', 'Its kings are known from Joseph Miller’s compilation of king lists and Portuguese reports (Cadornega put its people at 300,000 in 1680, probably too high). The Baixa de Cassanje between the Malanje escarpment and the Kwango is a clear natural region; drawn as eastern Malanje.'),
  sources: [W('Kasanje Kingdom'), W('Imbangala'), W('Baixa de Cassanje'), MILLER],
}, [
  [1620, 'Kasanje’s Imbangala settle on the upper Kwango', { kasanje: ['Kasanje', ['KASANJE']] }],
  [1680, 'Kasanje at its height', { kasanje: ['Kasanje', ['KASANJE']] }],
  [1815, 'Kasanje, the inland slave market', { kasanje: ['Kasanje', ['KASANJE']] }],
]);

// ---- Portuguese Angola ------------------------------------------------------------------------------
const PA_1583 = ['LUANDA', 'BENGO_S', 'KN_W'];
const PA_1626 = ['LUANDA', 'BENGO_S', 'KN_W', 'KN_E'];
const PA_1671 = ['LUANDA', 'BENGO_S', 'KN_W', 'KN_E', 'MALANJE_W'];
const BENG = { benguela: ['Benguela', ['BENGUELA_C']] };
const portugueseAngola = build({
  id: 'portuguese-angola', name: 'Portuguese Angola', color: '#16A34A', type: 'empire',
  nameAt: [[1576, 'Portuguese Angola'], [1641, 'Portuguese Angola (Dutch Luanda, 1641–48)'], [1648, 'Portuguese Angola']],
  description: 'Paulo Dias de Novais founded São Paulo de Loanda in 1576 with a charter to conquer the “Kingdom of Angola”. The colony advanced up the Kwanza with forts at Massangano (1582–83), Muxima (1599) and Cambambe (1602), founded Benguela in 1617 and, with Imbangala allies, broke Ndongo. The Dutch held Luanda from 1641 to 1648, when the Portuguese clung on at Massangano. Pungo a Ndongo fell in 1671. The colony was a chain of forts, markets and vassal sobas feeding the slave trade, not a bordered territory. From 1815 the nations layer shows Portuguese Angola.',
  timelineItemIds: ['ao-portuguese-angola', 'ao-dutch', 'ao-slave-trade', 'portugal'],
  confidence: conf('approximate', 'The forts and their dates are well recorded (Cadornega, Brásio’s documents); the reach of Portuguese authority among vassal sobas is not. Drawn as Luanda and the lower Kwanza from 1583, the Kabasa highlands from 1626, Pungo a Ndongo from 1671 and coastal Benguela from 1617; Benguela is not split out during the Dutch years.'),
  sources: [W('Portuguese Angola'), W('Paulo Dias de Novais'), W('Massangano'), W('Fortress of Muxima'), W('Benguela'), W('Dutch Loango-Angola')],
}, [
  [1576, 'São Paulo de Loanda founded', { angola: ['Luanda', ['LUANDA']] }],
  [1583, 'Forts up the Kwanza: Massangano', { angola: ['Portuguese Angola', PA_1583] }],
  [1617, 'Benguela founded', { angola: ['Portuguese Angola', PA_1583], ...BENG }],
  [1626, 'Forts across Ndongo’s heartland', { angola: ['Portuguese Angola', PA_1626], ...BENG }],
  [1641, 'Dutch take Luanda; the Portuguese hold Massangano', { angola: ['Portuguese Angola (Massangano)', ['KN_W', 'KN_E']], ...BENG }],
  [1648, 'Salvador de Sá retakes Luanda', { angola: ['Portuguese Angola', PA_1626], ...BENG }],
  [1671, 'Pungo a Ndongo taken', { angola: ['Portuguese Angola', PA_1671], ...BENG }],
  [1815, 'Portuguese Angola', { angola: ['Portuguese Angola', PA_1671], ...BENG }],
]);

// ---- Ovimbundu kingdoms: Bailundo and Viye -----------------------------------------------------------
const bailundo = build({
  id: 'bailundo-kingdom', name: 'Bailundo (Mbalundu)', color: '#9A3412',
  description: 'The largest of the Ovimbundu kingdoms of the central highlands, founded around 1700 by Katyavala at Halavala. Its armies raided north toward the Kwanza and its caravans traded with Benguela. Portugal invaded in the Mbailundu War (1773–76), captured its king and made it a vassal, but Bailundo kept its kings and many guns (3,800 by a 1785 count) into the colonial era.',
  timelineItemIds: ['ao-ovimbundu'],
  confidence: conf('conjectural', 'Known from oral traditions and 18th-century Portuguese reports; the founding date (about 1700) is a tradition, and some sources place it earlier. Drawn as northern Huambo province around Bailundo, not a border.'),
  sources: [W('Bailundo (kingdom)'), W('Ovimbundu'), W('Huambo')],
}, [
  [1700, 'Katyavala founds Bailundo', { bailundo: ['Bailundo', ['BAILUNDO']] }],
  [1773, 'Mbailundu War with Portugal', { bailundo: ['Bailundo', ['BAILUNDO']] }],
  [1776, 'Bailundo a Portuguese vassal', { bailundo: ['Bailundo', ['BAILUNDO']] }],
  [1815, 'Bailundo', { bailundo: ['Bailundo', ['BAILUNDO']] }],
]);

const viye = build({
  id: 'viye-kingdom', name: 'Viye (Bié)', color: '#0369A1',
  description: 'An Ovimbundu kingdom on the eastern highlands, ruled from Ekovongo and founded, by its traditions, by a hunter-king called Viye in the early 18th century. It sat on the crossroads of the caravan routes between Benguela and the Lunda and Luba lands, trading wax, ivory and slaves, and later became a Portuguese vassal.',
  timelineItemIds: ['ao-ovimbundu'],
  confidence: conf('conjectural', 'Its origins are known only from conflicting traditions; the first detailed description is João Nepomuceno Correia’s of 1797. Drawn from about 1720 as western Bié province around Kuito, not a border.'),
  sources: [W('Viye'), W('Ovimbundu')],
}, [
  [1720, 'Viye founded at Ekovongo', { viye: ['Viye', ['VIYE']] }],
  [1797, 'Viye described by a Portuguese trader', { viye: ['Viye', ['VIYE']] }],
  [1815, 'Viye', { viye: ['Viye', ['VIYE']] }],
]);

export const angolaPolities = [kongo, soyo, ndongo, matamba, kasanje, portugueseAngola, bailundo, viye];

// The Portuguese Empire's schematic 'angola-coast' region is dropped: Portuguese Angola is drawn
// once, by this pack. Kongo is replaced by id.
export const AO_DROPS = [['portuguese-empire', 'angola-coast']];
export const angolaShapeFixes = {
  'portuguese-empire': { dropRegions: ['angola-coast'] },
};
/** Apply `angolaShapeFixes` (throws if a target is missing or a keyframe would be left empty). */
export function applyAngolaShapeFixes(entities) {
  for (const [id, { dropRegions }] of Object.entries(angolaShapeFixes)) {
    const ent = entities.find((e) => e.id === id);
    if (!ent) throw new Error(`angola fixes: no entity ${id}`);
    let n = 0;
    for (const kf of ent.overlays) {
      const before = kf.regions.length;
      kf.regions = kf.regions.filter((r) => !dropRegions.includes(typeof r === 'string' ? r : r.id));
      n += before - kf.regions.length;
      if (!kf.regions.length) throw new Error(`angola fixes: ${id} ${kf.year} left with no region`);
    }
    if (!n) throw new Error(`angola fixes: ${id} had none of ${dropRegions.join(', ')}`);
  }
}
