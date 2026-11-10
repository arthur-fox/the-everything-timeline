/**
 * Day 83 — Phase 5 country pack 4, Central Africa: DR Congo (ROADMAP item 4, first country).
 *
 * DR Congo had no country timeline, and on the globe before the 1815 nations layer only three
 * hand-drawn Day 58 rings (the Luba Kingdom from 1600, the Lunda Empire from 1680 with Kazembe,
 * and Kongo's eastern edge), plus the Bantu peoples bands. Nothing showed the Upemba Depression's
 * Kisalian villages, the Kuba Kingdom or the Yaka on the Kwango. This module draws DR Congo's
 * states before 1815:
 *
 *   Upemba Depression cultures (Kisalian, Kabambian) · Luba Kingdom · Lunda Empire (with
 *   Kazembe and its Angolan provinces) · Kuba Kingdom · Yaka kingdom
 *
 * From 1815 the nations layer takes over (Kongo at its core; the Congo Free State from 1885), so
 * no keyframe here is later than 1815. The Tio kingdom, the Atlantic trade, the Zande and
 * Mangbetu, Tippu Tip and Msiri, the Free State, the Belgian Congo, independence, Mobutu and the
 * Congo Wars are timeline items with pins.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - DR Congo and Angola's Lunda Norte and Lunda Sul are cut into 23 pieces, of which CD_PIECES keeps
 *    the 18 in and around the pack's states: Natural Earth 1:10m provinces (public domain; the eleven provinces before the
 *    2015 split) cut on straight lines into regions close to today's provinces — Bandundu into
 *    Kwango / Kwilu / Mai-Ndombe, Kasaï-Occidental into the Kuba lands / north / middle / south
 *    Kasai, Katanga into Tanganyika / Haut-Katanga / Upemba / Haut-Lomami / west and east
 *    Lualaba — clipped to the globe's own DR Congo and Angola land (src/data/nations.topo.json
 *    shapes 238 and 275), simplified together as one coverage and noded on a 1e-4° grid, so
 *    neighbours share every vertex. Generator: et-tools day83-pieces.py (outside the repo).
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - The Day 58 Luba Kingdom and Lunda Empire are replaced by id (same ids, colours and
 *    civilisation links). Kazembe keeps its Day 58 hand ring on the Luapula (KAZEMBE), which
 *    belongs to the Zambia pack. Kongo is left as drawn on Day 58; it waits for the Angola pack.
 *  - Pieces are regions, not surveyed borders. These states ruled through tribute and titles,
 *    not fixed frontiers (see each polity's confidence reason).
 */

import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const GHA = { title: 'UNESCO General History of Africa, vols. II–V', url: 'https://www.unesco.org/en/general-history-africa' };

// ---- Pieces ([lng, lat]) ---------------------------------------------------------------------------
//  KINSHASA · KWANGO (Bandundu south of 5°S and west of 18.3°E, and all of it south of 6.6°S) ·
//  KWILU · KUBA (Kasaï-Occidental between 20.4–23.6°E and 3.9–5.6°S: the Sankuru–Kasai–Lulua
//  lands) · KASAI_MID (5.6–7°S) · KASAI_SOUTH (south of 7°S) · TANGANYIKA (Katanga east of 26.8°E,
//  north of 8.6°S) · UPEMBA (25.4–26.8°E, 7.9–9.6°S: the lakes of the depression) · HAUT_LOMAMI
//  (23.9–26.8°E north of 9.6°S, less Upemba) · LUALABA_W (west of 23.9°E: Musumba, Sandoa,
//  Dilolo) · LUALABA_E (23.9–26.8°E south of 9.6°S: Kolwezi) · LUNDA_N / LUNDA_S: Angola's
//  Lunda Norte and Lunda Sul · KAZEMBE: the Day 58 hand ring on the Luapula (globe-inland-africa.js).
export const CD_PIECES = {
  KINSHASA: [[15.1507, -4.4252], [15.2007, -4.345], [15.4604, -4.2132], [15.5684, -4.0376], [15.8884, -3.9402], [15.9882, -3.9873], [16.2003, -3.9936], [16.3896, -4.0997], [16.5225, -4.2501], [16.5481, -4.3493], [16.49, -4.5058], [16.4218, -4.5325], [16.2605, -4.7945], [16.2787, -5], [16.0343, -4.9873], [15.8953, -4.9166], [15.8793, -5.0019], [15.8081, -5.0315], [15.7331, -5.0122], [15.6222, -4.901], [15.7177, -4.8539], [15.7533, -4.7012], [15.6815, -4.6399], [15.6717, -4.5535], [15.4448, -4.534], [15.3819, -4.6552], [15.2758, -4.6013], [15.1507, -4.4252]],
  KWANGO: [[19.963, -7.0016], [19.5212, -7.0016], [19.478, -7.3166], [19.514, -7.4796], [19.424, -7.5799], [19.3556, -7.5744], [19.3772, -7.7304], [19.334, -7.867], [19.3556, -8.0022], [18.7724, -8.0022], [18.74, -7.9325], [18.5168, -7.9325], [18.5096, -7.998], [18.1784, -7.9994], [18.0992, -8.1095], [17.9012, -8.0482], [17.6276, -8.0983], [17.5311, -8.0657], [17.0984, -7.3779], [16.9472, -7.2051], [16.9292, -7.0602], [16.9724, -7.0142], [16.9256, -6.8888], [16.832, -6.8274], [16.7672, -6.709], [16.7492, -6.5223], [16.6916, -6.3982], [16.7276, -6.1892], [16.6052, -6.0624], [16.598, -5.9244], [16.3172, -5.8548], [16.1012, -5.8576], [16.1906, -5.7717], [16.2223, -5.7004], [16.2208, -5.4359], [16.2584, -5.2209], [16.2559, -5.0672], [16.2787, -5], [18.3, -5], [18.3, -6.6], [19.7534, -6.6], [19.9181, -6.8199], [19.9628, -6.9999], [19.963, -7.0016]],
  KWILU: [[16.0829, -3.6], [20.6507, -3.6], [20.6508, -3.6], [20.664, -3.7455], [20.6609, -3.8652], [20.6658, -3.9], [20.669, -3.9222], [20.6709, -4.1308], [20.5991, -4.2081], [20.4, -4.2768], [20.4, -5.6], [20.1693, -5.6], [20.1532, -5.7641], [20.0534, -5.8653], [19.9667, -5.9863], [19.8866, -6.0018], [19.6974, -6.1562], [19.6898, -6.198], [19.7294, -6.5495], [19.7534, -6.6], [18.3, -6.6], [18.3, -5], [16.2787, -5], [16.2605, -4.7945], [16.4218, -4.5325], [16.49, -4.5058], [16.5481, -4.3493], [16.5225, -4.2501], [16.3896, -4.0997], [16.2003, -3.9936], [15.9882, -3.9873], [15.8884, -3.9402], [16.0829, -3.6]],
  KUBA: [[20.669, -3.9222], [20.6658, -3.9], [22.1919, -3.9], [22.1898, -3.9029], [22.0623, -3.915], [22.0192, -3.9668], [22.1337, -4.0264], [22.3039, -3.9952], [22.4227, -4.137], [22.676, -4.2927], [22.8603, -4.4915], [23.119, -4.5339], [23.1569, -4.5856], [23.1769, -4.7368], [23.1389, -4.7745], [23.0029, -4.8095], [22.957, -4.8733], [22.961, -4.9745], [23.1607, -5.1524], [23.2515, -5.2527], [23.419, -5.2173], [23.4674, -5.2754], [23.6, -5.3272], [23.6, -5.6], [20.4, -5.6], [20.4, -4.2768], [20.5991, -4.2081], [20.6709, -4.1308], [20.669, -3.9222]],
  KASAI_MID: [[19.7534, -6.6], [19.7294, -6.5495], [19.6898, -6.198], [19.6974, -6.1562], [19.8866, -6.0018], [19.9667, -5.9863], [20.0534, -5.8653], [20.1532, -5.7641], [20.1693, -5.6], [20.4, -5.6], [23.6, -5.6], [23.739, -5.6], [23.739, -5.6004], [23.5243, -5.6825], [23.4247, -5.7615], [23.3878, -5.7057], [23.2794, -5.7409], [22.9984, -5.7724], [22.9537, -5.8596], [22.9781, -6.0632], [23.0866, -6.2139], [23.0267, -6.382], [22.9326, -6.5721], [22.9396, -6.6663], [23.0205, -6.7262], [23.0849, -6.8259], [23.175, -6.8719], [23.2423, -6.974], [23.2324, -7], [20.5803, -7], [20.612, -6.9166], [20.3312, -6.9166], [20.2952, -7.0016], [19.963, -7.0016], [19.9628, -6.9999], [19.9181, -6.8199], [19.7534, -6.6]],
  KASAI_SOUTH: [[20.5803, -7], [23.2324, -7], [23.1999, -7.0855], [23.2127, -7.3812], [23.1876, -7.5114], [23.1581, -7.7974], [23.0886, -7.8395], [22.8765, -7.9014], [22.6836, -7.8592], [22.6569, -7.7674], [22.5951, -7.7223], [22.4859, -7.7867], [22.2474, -7.805], [22.0767, -7.7752], [21.9655, -7.7007], [21.8266, -7.6456], [21.7909, -7.748], [21.8612, -7.4699], [21.7856, -7.2831], [20.522, -7.2859], [20.5256, -7.1438], [20.5803, -7]],
  TANGANYIKA: [[28.9329, -8.6], [26.8, -8.6], [26.8, -7.9], [26.8, -5], [28.8245, -5], [29.342, -5], [29.4573, -5.2305], [29.5941, -5.6207], [29.6013, -5.7823], [29.4753, -6.0025], [29.5257, -6.2728], [29.7381, -6.6519], [30.0909, -6.8901], [30.2961, -7.1493], [30.3681, -7.3096], [30.4401, -7.5967], [30.6561, -7.9269], [30.7533, -8.1945], [28.9137, -8.4732], [28.9329, -8.6]],
  UPEMBA: [[26.8, -7.9], [26.8, -8.6], [26.8, -9.6], [25.4, -9.6], [25.4, -7.9], [26.8, -7.9]],
  HAUT_LOMAMI: [[26.2063, -5.1624], [26.2694, -5], [26.8, -5], [26.8, -7.9], [25.4, -7.9], [25.4, -9.6], [23.9, -9.6], [23.9, -7.8272], [23.9042, -7.8271], [23.9572, -7.8095], [23.9231, -7.73], [23.9319, -7.5241], [23.9914, -7.3433], [23.9585, -7.3235], [23.9681, -7.2062], [24.0756, -7.0664], [24.1363, -7.0427], [24.1354, -6.8804], [24.2023, -6.882], [24.2446, -6.9923], [24.37, -7.055], [24.4538, -7.0703], [24.5086, -7.0033], [24.5981, -6.9881], [24.7569, -6.9004], [24.8996, -6.7904], [24.9128, -6.709], [24.9734, -6.6624], [25.1437, -6.6702], [25.2883, -6.758], [25.4443, -6.6997], [25.4987, -6.535], [25.3606, -6.5251], [25.2571, -6.3995], [25.3346, -6.3291], [25.4936, -6.3553], [25.6505, -6.3048], [25.7637, -6.203], [25.8358, -6.1959], [25.9349, -6.2352], [25.9571, -6.3002], [26.0719, -6.2562], [26.1374, -6.2611], [26.1767, -6.1985], [26.1383, -6.1145], [26.1728, -6.0167], [26.1685, -5.795], [26.0677, -5.6415], [26.1419, -5.5046], [26.0863, -5.3795], [26.1239, -5.2807], [26.2063, -5.1624]],
  LUALABA_W: [[23.0886, -7.8395], [23.1581, -7.7974], [23.2251, -7.9381], [23.2779, -7.9022], [23.4976, -7.9251], [23.7732, -7.9034], [23.8798, -7.8277], [23.9, -7.8272], [23.9, -9.6], [23.9, -10.9649], [23.9044, -10.9623], [23.8664, -11.0164], [23.3732, -10.9745], [23.1968, -11.0721], [23.0132, -11.1028], [22.8296, -11.0526], [22.7288, -11.0972], [22.538, -11.0373], [22.4696, -11.1223], [22.2392, -11.2491], [22.2428, -11.0777], [22.1636, -10.8519], [22.3112, -10.7697], [22.3084, -10.6441], [22.3079, -10.6263], [22.3076, -10.6122], [22.2752, -10.5035], [22.3148, -10.3684], [22.2032, -10.1301], [22.16, -9.9322], [22.0556, -9.8751], [21.9836, -9.7483], [21.854, -9.6173], [21.7928, -9.3943], [21.8396, -9.2758], [21.8612, -8.8466], [21.9404, -8.4997], [21.9118, -8.3337], [21.9117, -8.3327], [21.9116, -8.3324], [21.8504, -8.1429], [21.7568, -8.0147], [21.7712, -7.8071], [21.7909, -7.748], [21.8266, -7.6456], [21.9655, -7.7007], [22.0767, -7.7752], [22.2474, -7.805], [22.4859, -7.7867], [22.5951, -7.7223], [22.6569, -7.7674], [22.6836, -7.8592], [22.8765, -7.9014], [23.0886, -7.8395]],
  LUALABA_E: [[26.8, -11.97], [26.8639, -11.9665], [26.6961, -12.0169], [26.4153, -11.9124], [26.2965, -11.9416], [26.1669, -11.9026], [25.9941, -11.9054], [25.8501, -11.7939], [25.7241, -11.8009], [25.6197, -11.7284], [25.5153, -11.7758], [25.3533, -11.6462], [25.2777, -11.3717], [25.3245, -11.2839], [25.2777, -11.2003], [25.1229, -11.2588], [24.9428, -11.2686], [24.7124, -11.3257], [24.5648, -11.4442], [24.446, -11.4637], [24.284, -11.3815], [24.392, -11.2797], [24.3812, -11.1209], [24.2948, -11.0498], [24.1256, -11.0428], [24.1148, -10.9188], [23.9672, -10.8728], [23.9044, -10.9623], [23.9, -10.9649], [23.9, -9.6], [25.4, -9.6], [26.8, -9.6], [26.8, -11.97]],
  LUNDA_N: [[19.963, -7.0016], [20.2952, -7.0016], [20.3312, -6.9166], [20.612, -6.9166], [20.5803, -7], [20.5256, -7.1438], [20.522, -7.2859], [21.7856, -7.2831], [21.8612, -7.4699], [21.7909, -7.748], [21.7712, -7.8071], [21.7568, -8.0147], [21.8504, -8.1429], [21.9116, -8.3324], [21.9117, -8.3327], [21.795, -8.4237], [21.654, -8.4582], [21.5522, -8.5416], [21.4236, -8.5726], [21.2583, -8.5593], [21.0288, -8.6088], [20.8373, -8.7456], [20.7549, -8.8589], [20.6944, -8.9848], [20.4274, -9.1003], [20.3692, -9.2185], [20.1879, -9.299], [19.9919, -9.4701], [19.958, -9.6949], [19.8639, -9.8431], [19.7977, -9.8848], [19.6566, -9.9182], [19.5665, -9.9778], [19.4721, -9.9934], [19.3444, -10.0801], [19.2726, -10.1022], [19.1171, -10.2087], [18.8946, -10.2607], [18.7934, -10.3469], [18.6323, -10.4035], [18.4402, -10.4098], [18.4222, -10.4164], [18.2724, -10.3311], [18.1768, -10.2128], [18.25, -10.0653], [18.213, -9.9943], [17.7134, -9.8068], [17.6459, -9.7985], [17.57, -9.6894], [17.5094, -9.6716], [17.4136, -9.5773], [17.4055, -9.5102], [17.3384, -9.3793], [17.3365, -9.3279], [17.4009, -9.2785], [17.5434, -9.2198], [17.5851, -9.1098], [17.5697, -8.933], [17.5913, -8.8293], [17.5881, -8.6075], [17.5382, -8.5104], [17.5636, -8.3567], [17.5533, -8.162], [17.5311, -8.0657], [17.6276, -8.0983], [17.9012, -8.0482], [18.0992, -8.1095], [18.1784, -7.9994], [18.5096, -7.998], [18.5168, -7.9325], [18.74, -7.9325], [18.7724, -8.0022], [19.3556, -8.0022], [19.334, -7.867], [19.3772, -7.7304], [19.3556, -7.5744], [19.424, -7.5799], [19.514, -7.4796], [19.478, -7.3166], [19.5212, -7.0016], [19.963, -7.0016]],
  LUNDA_S: [[22.3079, -10.6263], [22.3084, -10.6441], [22.0979, -10.5923], [22.0483, -10.6135], [21.8186, -10.627], [21.7628, -10.6807], [21.7454, -10.8143], [21.6739, -10.8948], [21.6569, -11.0003], [21.6962, -11.1325], [21.5938, -11.1797], [21.5117, -11.176], [21.2256, -11.2871], [21.1461, -11.3756], [21.0641, -11.4018], [21.0355, -11.4716], [20.9061, -11.4702], [20.7473, -11.4435], [20.5031, -11.3408], [20.416, -11.2827], [20.3589, -11.291], [20.1793, -11.2188], [20.0905, -11.2856], [19.9835, -11.2649], [19.9297, -11.3009], [19.8349, -11.2667], [19.7145, -11.3061], [19.6178, -11.2577], [19.4, -11.4109], [19.3105, -11.4055], [19.1886, -11.456], [19.2324, -11.2991], [19.2004, -11.2306], [19.0901, -11.197], [18.9714, -11.0927], [18.7627, -10.9613], [18.6398, -10.8037], [18.6088, -10.6734], [18.6471, -10.6264], [18.5269, -10.4614], [18.4402, -10.4098], [18.6323, -10.4035], [18.7934, -10.3469], [18.8946, -10.2607], [19.1171, -10.2087], [19.2726, -10.1022], [19.3444, -10.0801], [19.4721, -9.9934], [19.5665, -9.9778], [19.6566, -9.9182], [19.7977, -9.8848], [19.8639, -9.8431], [19.958, -9.6949], [19.9919, -9.4701], [20.1879, -9.299], [20.3692, -9.2185], [20.4274, -9.1003], [20.6944, -8.9848], [20.7549, -8.8589], [20.8373, -8.7456], [21.0288, -8.6088], [21.2583, -8.5593], [21.4236, -8.5726], [21.5522, -8.5416], [21.654, -8.4582], [21.795, -8.4237], [21.9117, -8.3327], [21.9118, -8.3337], [21.9404, -8.4997], [21.8612, -8.8466], [21.8396, -9.2758], [21.7928, -9.3943], [21.854, -9.6173], [21.9836, -9.7483], [22.0556, -9.8751], [22.16, -9.9322], [22.2032, -10.1301], [22.3148, -10.3684], [22.2752, -10.5035], [22.3076, -10.6122], [22.3079, -10.6263]],
  KASAI_NORTH: [[22.1919, -3.9], [20.6658, -3.9], [20.6609, -3.8652], [20.664, -3.7455], [20.6508, -3.6], [20.6424, -3.5084], [20.6647, -3.2803], [20.8414, -2.8275], [20.9522, -2.6869], [20.9686, -2.5615], [21.0071, -2.4888], [21.2574, -2.5118], [21.454, -2.4566], [21.4799, -2.339], [21.8303, -2.5229], [21.8991, -2.4904], [21.9698, -2.565], [21.9935, -2.6799], [22.1569, -2.8921], [22.1925, -3.018], [22.0497, -3.3971], [21.9765, -3.5052], [21.9861, -3.6285], [22.1227, -3.6917], [22.1974, -3.8925], [22.1898, -3.9029], [22.1919, -3.9]],
  KASAI_OR: [[23.9, -7.8272], [23.8798, -7.8277], [23.7732, -7.9034], [23.4976, -7.9251], [23.2779, -7.9022], [23.2251, -7.9381], [23.1581, -7.7974], [23.1876, -7.5114], [23.2127, -7.3812], [23.1999, -7.0855], [23.2324, -7], [23.2423, -6.974], [23.175, -6.8719], [23.0849, -6.8259], [23.0205, -6.7262], [22.9396, -6.6663], [22.9326, -6.5721], [23.0267, -6.382], [23.0866, -6.2139], [22.9781, -6.0632], [22.9537, -5.8596], [22.9984, -5.7724], [23.2794, -5.7409], [23.3878, -5.7057], [23.4247, -5.7615], [23.5243, -5.6825], [23.739, -5.6004], [23.739, -5.6], [23.6, -5.6], [23.6, -5.3272], [23.4674, -5.2754], [23.419, -5.2173], [23.2515, -5.2527], [23.1607, -5.1524], [22.961, -4.9745], [22.957, -4.8733], [23.0029, -4.8095], [23.1389, -4.7745], [23.1769, -4.7368], [23.1569, -4.5856], [23.119, -4.5339], [22.8603, -4.4915], [22.676, -4.2927], [22.4227, -4.137], [22.3039, -3.9952], [22.1337, -4.0264], [22.0192, -3.9668], [22.0623, -3.915], [22.1898, -3.9029], [22.1974, -3.8925], [22.1227, -3.6917], [21.9861, -3.6285], [21.9765, -3.5052], [22.0497, -3.3971], [22.1925, -3.018], [22.1569, -2.8921], [21.9935, -2.6799], [21.9698, -2.565], [21.8991, -2.4904], [22.1101, -2.2992], [22.1676, -2.2877], [22.1855, -2.4116], [22.2541, -2.4672], [22.2916, -2.4031], [22.229, -2.1801], [22.1835, -1.9123], [22.3278, -1.9499], [22.4795, -1.9598], [22.5476, -1.9247], [22.6243, -1.8087], [22.8096, -1.8559], [22.934, -1.9572], [23.0971, -1.9403], [23.2008, -2.0639], [23.5426, -2.0061], [23.6888, -2.0152], [23.7183, -1.9308], [23.7824, -1.8836], [23.8277, -1.7693], [24.0828, -1.7462], [24.4215, -1.7868], [24.4507, -1.9387], [24.4937, -2.1082], [24.5842, -2.2316], [24.6813, -2.4108], [24.7413, -2.4675], [25.0998, -2.4478], [25.0774, -2.5879], [25.106, -2.7907], [25.0335, -2.9575], [25.0354, -3.0551], [24.9609, -3.2555], [24.9005, -3.2715], [24.9066, -3.3517], [24.7803, -3.4583], [24.7962, -3.6859], [24.7474, -3.7566], [24.7592, -3.8278], [24.9503, -4.0264], [24.9962, -4.1046], [25.0099, -4.2789], [24.9748, -4.3901], [25.0124, -4.4447], [24.8541, -4.6495], [24.9027, -4.751], [25.0026, -4.8468], [25.0588, -4.9881], [25.1043, -4.9975], [26.2694, -5], [26.2063, -5.1624], [26.1239, -5.2807], [26.0863, -5.3795], [26.1419, -5.5046], [26.0677, -5.6415], [26.1685, -5.795], [26.1728, -6.0167], [26.1383, -6.1145], [26.1767, -6.1985], [26.1374, -6.2611], [26.0719, -6.2562], [25.9571, -6.3002], [25.9349, -6.2352], [25.8358, -6.1959], [25.7637, -6.203], [25.6505, -6.3048], [25.4936, -6.3553], [25.3346, -6.3291], [25.2571, -6.3995], [25.3606, -6.5251], [25.4987, -6.535], [25.4443, -6.6997], [25.2883, -6.758], [25.1437, -6.6702], [24.9734, -6.6624], [24.9128, -6.709], [24.8996, -6.7904], [24.7569, -6.9004], [24.5981, -6.9881], [24.5086, -7.0033], [24.4538, -7.0703], [24.37, -7.055], [24.2446, -6.9923], [24.2023, -6.882], [24.1354, -6.8804], [24.1363, -7.0427], [24.0756, -7.0664], [23.9681, -7.2062], [23.9585, -7.3235], [23.9914, -7.3433], [23.9319, -7.5241], [23.9231, -7.73], [23.9572, -7.8095], [23.9042, -7.8271], [23.9, -7.8272]],
  BAS_CONGO: [[15.2007, -4.345], [15.1507, -4.4252], [15.2758, -4.6013], [15.3819, -4.6552], [15.4448, -4.534], [15.6717, -4.5535], [15.6815, -4.6399], [15.7533, -4.7012], [15.7177, -4.8539], [15.6222, -4.901], [15.7331, -5.0122], [15.8081, -5.0315], [15.8793, -5.0019], [15.8953, -4.9166], [16.0343, -4.9873], [16.2787, -5], [16.2559, -5.0672], [16.2584, -5.2209], [16.2208, -5.4359], [16.2223, -5.7004], [16.1906, -5.7717], [16.1012, -5.8576], [14.7583, -5.8798], [14.5783, -5.9049], [14.0203, -5.8729], [13.9447, -5.8422], [13.6423, -5.8659], [13.3795, -5.8562], [13.3435, -5.891], [13.1851, -5.8562], [12.8215, -5.8297], [12.7243, -5.9788], [12.4507, -6.0513], [12.2095, -5.7628], [12.3463, -5.7252], [12.5083, -5.7266], [12.5299, -5.1622], [12.4435, -5.0549], [12.6775, -4.9239], [12.8323, -4.7232], [13.0735, -4.6354], [13.1131, -4.5769], [13.1707, -4.6759], [13.3507, -4.7859], [13.3939, -4.8849], [13.5163, -4.7553], [13.5811, -4.7832], [13.7143, -4.6856], [13.7107, -4.464], [13.7899, -4.425], [13.9051, -4.4905], [14.0203, -4.4153], [14.2219, -4.3595], [14.3695, -4.2787], [14.4703, -4.4292], [14.3515, -4.5672], [14.4055, -4.6759], [14.4019, -4.8863], [14.5207, -4.8417], [14.6359, -4.903], [14.8303, -4.8152], [14.9311, -4.6466], [15.0752, -4.5198], [15.2007, -4.345]],
  HAUT_KATANGA: [[26.8, -8.6], [28.9329, -8.6], [28.8921, -8.7658], [28.7661, -8.9344], [28.6005, -9.0961], [28.3737, -9.2354], [28.3701, -9.3093], [28.5141, -9.379], [28.6437, -9.7357], [28.6977, -9.7915], [28.6221, -9.9503], [28.6185, -10.1412], [28.5681, -10.2193], [28.6293, -10.2959], [28.6365, -10.5189], [28.7013, -10.6429], [28.5645, -10.8115], [28.4781, -11.0777], [28.4385, -11.348], [28.3557, -11.4469], [28.4529, -11.7814], [28.5069, -11.8734], [28.7589, -12.035], [28.9461, -12.2064], [29.0289, -12.3764], [29.2557, -12.3667], [29.4789, -12.4545], [29.5221, -12.3931], [29.4465, -12.3346], [29.4753, -12.2426], [29.7993, -12.1562], [29.7993, -13.4243], [29.6265, -13.4299], [29.6661, -13.292], [29.5761, -13.2251], [29.1693, -13.4341], [29.0649, -13.3881], [28.9929, -13.3965], [28.9029, -13.1624], [28.6689, -12.8488], [28.5825, -12.8892], [28.4745, -12.736], [28.5105, -12.6941], [28.4241, -12.5214], [28.3413, -12.4503], [28.0893, -12.3778], [27.9597, -12.3681], [27.8301, -12.2594], [27.6645, -12.3026], [27.5205, -12.1799], [27.4197, -11.9221], [27.2325, -11.8093], [27.1785, -11.5696], [27.0093, -11.61], [26.9661, -11.8706], [26.8639, -11.9665], [26.8, -11.97], [26.8, -9.6], [26.8, -8.6]],
  MAI_NDOMBE: [[20.6507, -3.6], [16.0829, -3.6], [16.2272, -3.2893], [16.1948, -3.2377], [16.184, -2.9409], [16.2272, -2.6357], [16.1768, -2.2874], [16.2308, -2.1285], [16.5252, -1.8588], [16.6443, -1.9987], [16.8884, -1.9989], [16.8891, -1.8785], [16.8206, -1.7934], [17.0768, -1.8076], [17.184, -1.7253], [17.521, -1.5263], [17.6652, -1.479], [17.8018, -1.4099], [17.9308, -1.3739], [18.0182, -1.3103], [18.1915, -1.1307], [18.3628, -1.1625], [18.4274, -1.2251], [18.5218, -1.2657], [18.82, -1.2211], [18.8761, -1.1309], [18.7945, -1.003], [18.8094, -0.907], [18.9456, -0.8219], [18.9779, -0.7458], [19.0481, -0.8085], [19.0859, -0.9981], [19.2136, -1.1882], [19.2945, -1.2731], [19.368, -1.4348], [19.4735, -1.5951], [19.514, -1.7788], [19.5918, -1.7983], [19.7089, -1.6682], [19.8278, -1.742], [19.8891, -1.9017], [19.9372, -1.9393], [20.1861, -1.9485], [20.2704, -2.0247], [20.4446, -2.0848], [20.5228, -2.0422], [20.6912, -2.023], [20.9869, -2.3714], [20.9953, -2.3923], [21, -2.4077], [21.0017, -2.4133], [21.0071, -2.4888], [20.9686, -2.5615], [20.9522, -2.6869], [20.8414, -2.8275], [20.6647, -3.2803], [20.6424, -3.5084], [20.6508, -3.6], [20.6507, -3.6]],
  KAZEMBE: [[28.4, -9.9], [29.3, -9.4], [29.8, -10.6], [28.8, -11.6], [28.3, -10.8], [28.4, -9.9]],
};

const P = (names) => names.map((n) => {
  if (!CD_PIECES[n]) throw new Error(`dr-congo pack: no piece ${n}`);
  return CD_PIECES[n];
});
export const CD_STEPS = {};
function build(meta, steps) {
  CD_STEPS[meta.id] = steps;
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

// ---- Upemba Depression cultures -------------------------------------------------------------------
const upemba = build({
  id: 'upemba-cultures', name: 'Upemba Depression (Kisalian)', color: '#854D0E', type: 'civilization',
  description: 'Fishing, farming and metal-working villages on the lakes of the Upemba Depression in Katanga, lived in almost without a break since the 5th century. Their Kisalian cemeteries (Sanga, Katoto; 8th–14th centuries), the largest known south of the Sahara, hold copper cross-ingots, fine pottery and signs of growing rank; the later Kabambian phase leads into the Luba kingdom. A shared culture, not a known state.',
  nameAt: [[700, 'Upemba Depression (Kisalian)'], [1300, 'Upemba Depression (Kabambian)']],
  timelineItemIds: ['cd-upemba'],
  confidence: conf('conjectural', 'Dated by more than 55 radiocarbon and thermoluminescence dates across the depression (de Maret’s excavations at Sanga and Katoto), but there is no text, and nobody knows how the villages were ruled. Drawn as the depression’s lakes piece, not a border.'),
  sources: [W('Upemba Depression'), W('Upemba National Park'), W('Luba Empire')],
}, [
  [700, 'Kisalian villages and cemeteries of the Upemba lakes', { lakes: ['Upemba Depression', ['UPEMBA']] }],
  [1000, 'Kisalian at its height: copper, fish and salt trade', { lakes: ['Upemba Depression', ['UPEMBA']] }],
  [1300, 'Kabambian phase: copper croisettes as currency', { lakes: ['Upemba Depression', ['UPEMBA']] }],
  [1584, 'On the eve of the Luba kingdom', { lakes: ['Upemba Depression', ['UPEMBA']] }],
]);

// ---- Luba Kingdom (replaces the Day 58 ring by id) ------------------------------------------------
const luba = build({
  id: 'luba-kingdom', name: 'Luba Kingdom', color: '#6D28D9',
  description: 'A kingdom that grew out of the Upemba Depression and was ruled from the Kabongo region of the upper Lualaba, built on sacred kingship and the memory-board (lukasa) traditions of its court. Its founding is dated anywhere from before the 15th to the 18th century; the usual date is about 1585. It peaked around 1800, when Ilunga Sungu pushed east towards Lake Tanganyika, before civil war and slave raiders broke it in the 1870s–80s.',
  timelineItemIds: ['luba-kingdom', 'cd-luba'],
  confidence: conf('conjectural', 'Known from Luba oral traditions and king lists, whose dates scholars put centuries apart (Reefe, Vansina, Roberts), and from 19th-century travellers. The Kabongo capital region is not excavated. Drawn as its core (Upemba and Haut-Lomami) and, from Ilunga Sungu, the eastward reach to Lake Tanganyika; tribute zones are not borders.'),
  sources: [W('Luba Empire'), W('Lukasa'), W('Ilunga Sungu'), W('Upemba Depression'), GHA],
}, [
  [1585, 'Luba kingdom founded in the Upemba and Kabongo lands', { luba: ['Luba Kingdom', ['UPEMBA', 'HAUT_LOMAMI']] }],
  [1700, 'Luba kingdom of the upper Lualaba', { luba: ['Luba Kingdom', ['UPEMBA', 'HAUT_LOMAMI']] }],
  [1780, 'Ilunga Sungu pushes east towards Lake Tanganyika', { luba: ['Luba Kingdom at its height', ['UPEMBA', 'HAUT_LOMAMI', 'TANGANYIKA']] }],
  [1815, 'Luba under Kasongo Kalombo', { luba: ['Luba Kingdom at its height', ['UPEMBA', 'HAUT_LOMAMI', 'TANGANYIKA']] }],
]);

// ---- Lunda Empire (replaces the Day 58 ring by id) ------------------------------------------------
const LUNDA_1740 = ['LUALABA_W', 'LUALABA_E', 'KASAI_SOUTH', 'LUNDA_N', 'LUNDA_S'];
const lunda = build({
  id: 'lunda-empire', name: 'Lunda Empire', color: '#BE185D', type: 'empire',
  description: 'A Lunda state west of the Luba, ruled by the Mwata Yamvo (a title taken around 1665) from a moated royal town, the musumba, in southern Katanga. From the late 17th century it spread through tribute and by sending out chiefs who founded daughter kingdoms: the Yaka on the Kwango, and Kazembe on the Luapula (about 1740). It traded slaves, ivory and copper west to the Atlantic and east toward Mozambique, until Chokwe invasions overthrew it in the 1880s.',
  timelineItemIds: ['lunda-empire', 'cd-lunda'],
  confidence: conf('conjectural', 'Known from Lunda traditions (the first well-attested ruler, Nawej, about 1695), Portuguese reports from Angola and early 19th-century visitors (the pombeiros’ crossing of 1802–11). The commonwealth was a web of tributary chiefs, so its outline is a guess: the musumba lands (west Lualaba) and, from about 1740, the route east to Kazembe and Angola’s Lunda provinces to the west.'),
  sources: [W('Lunda Empire'), W('Mwata Yamvo'), W('Kingdom of Kazembe'), GHA],
}, [
  [1665, 'Mwata Yamvo’s kingdom (musumba lands)', { lunda: ['Lunda heartland', ['LUALABA_W']] }],
  [1695, 'Nawej, the first well-attested Mwata Yamvo', { lunda: ['Lunda heartland', ['LUALABA_W']] }],
  [1740, 'Lunda commonwealth; Kazembe founded on the Luapula', { lunda: ['Lunda Empire', LUNDA_1740], kazembe: ['Kazembe (Luapula)', ['KAZEMBE']] }],
  [1815, 'Lunda commonwealth at its height', { lunda: ['Lunda Empire', LUNDA_1740], kazembe: ['Kazembe (Luapula)', ['KAZEMBE']] }],
]);

// ---- Kuba Kingdom -------------------------------------------------------------------------------
const kuba = build({
  id: 'kuba-kingdom', name: 'Kuba Kingdom', color: '#0F766E',
  description: 'Between the Sankuru, Lulua and Kasai rivers, Shyaam a-Mbul a Ngoong united the Bushoong and neighbouring chiefdoms around 1625 and became the first nyim (king). The kingdom had a council of title-holders, courts with juries, taxation and a police force, grew rich on American crops (maize, cassava, tobacco), and is famous for its raffia cloth and ndop royal figures. Its capital was Nsheng (Mushenge).',
  timelineItemIds: ['cd-kuba'],
  confidence: conf('approximate', 'The kingdom’s rivers are its borders and its king lists and titles were recorded by Emil Torday (who visited in 1907–08) and Jan Vansina, whose dating of Shyaam to about 1625 is generally followed. Drawn as the Kasai lands between the rivers; outlying Kete and Coofa chiefdoms are not drawn.'),
  sources: [W('Kuba Kingdom'), W('Kuba textiles'), W('Ndop (Kuba)')],
}, [
  [1625, 'Shyaam a-Mbul unites the Kuba chiefdoms', { kuba: ['Kuba Kingdom', ['KUBA']] }],
  [1700, 'Kuba Kingdom at Nsheng', { kuba: ['Kuba Kingdom', ['KUBA']] }],
  [1815, 'Kuba Kingdom', { kuba: ['Kuba Kingdom', ['KUBA']] }],
]);

// ---- Yaka kingdom -------------------------------------------------------------------------------
const yaka = build({
  id: 'yaka-kingdom', name: 'Yaka kingdom', color: '#CA8A04',
  description: 'In the 17th century Lunda chiefs led by Kabamba crossed west to the Kwango River and founded a kingdom over Kongo-speaking peoples, ruled by the Kiamfu from Kasongo-Lunda. It sat on the trade routes between the Lunda and the Atlantic and was one of the states that most resisted colonial conquest.',
  timelineItemIds: ['cd-yaka'],
  confidence: conf('conjectural', 'Known from Yaka and Lunda traditions and later colonial ethnography; the founding date is only “17th century”. Drawn from 1700 as the Kwango piece (between the Kwango and the Wamba), not a border.'),
  sources: [W('Yaka people'), W('Lunda Empire'), W('Kwango River')],
}, [
  [1700, 'Yaka kingdom of the Kiamfu on the Kwango', { yaka: ['Yaka kingdom', ['KWANGO']] }],
  [1815, 'Yaka kingdom', { yaka: ['Yaka kingdom', ['KWANGO']] }],
]);

export const drCongoPolities = [upemba, luba, lunda, kuba, yaka];

// No older shape is trimmed or dropped: the Day 58 Luba and Lunda rings are replaced by id, and
// Kongo's Day 58 ring stays (it reaches the Kwango piece only before 1700, when the Yaka begin).
export const drCongoShapeFixes = {};
export function applyDrCongoShapeFixes() {}
