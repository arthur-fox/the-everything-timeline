/**
 * Day 68 — Phase 5 country pack 1, globe backfill: Morocco (ROADMAP item 12).
 *
 * Morocco had a sourced timeline (data/countries/morocco.json) but almost nothing of its own on the
 * globe before the 1815 nations layer: a schematic Roman blob that ran over Fez and the Rif, an
 * Umayyad sliver, and a French "Maghreb fringe" that slid over Fez from the 1770s. This module draws
 * Morocco's history from the Mauri kings to the eve of the 1815 handoff:
 *
 *   Kingdom of Mauretania · Roman Mauretania (Tingitana, Caesariensis) · Barghawata · Idrisids ·
 *   Nekor · Midrarids of Sijilmasa · Maghrawa and Banu Ifran (Zenata) · Almoravids · Almohads ·
 *   Marinids · Wattasids · Saadians · Tazerwalt (Iligh) · Dila · Republic of Salé · Alaouites ·
 *   Portuguese, Spanish and English coastal enclaves
 *
 * From 1815 the nations layer takes over (Sultanate of Morocco, then the French and Spanish
 * protectorates in 1912), so no keyframe here is later than 1815.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - The land is cut into ~26 "pieces" (Tingis, the Gharb, the Saïs, Tamesna, the Haouz, the High
 *    Atlas, the Sous, Tafilalt, western Algeria, Ifriqiya, the parts of al-Andalus …) whose shared
 *    borders are the same point lists, so `mergeRings` (globe-med-pieces.js) fuses any set of
 *    touching pieces into one outline. A polity is a dated list of which pieces it held.
 *  - Coasts are read off the globe's own simplified land (src/data/nations.topo.json, Natural Earth,
 *    public domain) and nudged 0.04° inland, so shapes stop at the Atlantic and Mediterranean shore.
 *  - Changes are drawn as dated steps: every change has a keyframe the year before (old extent) and
 *    the year of the change (new extent), so a shape never slides over a neighbour mid-morph.
 *  - Coastal enclaves (Portuguese Ceuta, Tangier, Mazagan …, Spanish Melilla, Larache …, English
 *    Tangier, the Republic of Salé) are small shapes cut out of whichever state holds that coast in
 *    each year, so the two never overlap.
 *
 * Outlines are the regions chronicles (al-Bakri, Ibn Khaldun, Ibn Abi Zar), inscriptions and later
 * historians (Abun-Nasr, Bennison, Cornell) say each dynasty ruled or taxed, drawn roughly; borders
 * in the mountains and the desert were zones of tribal allegiance, not lines (see each confidence).
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings, path, rev } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}/` });
const ABUN_NASR = { title: 'Abun-Nasr, A History of the Maghrib in the Islamic Period (Cambridge, 1987)', url: 'https://doi.org/10.1017/CBO9780511608100' };

// ---- Coasts --------------------------------------------------------------------------------------
//
// [lng, lat] along the shore, read off src/data/nations.topo.json and nudged 0.04° inland, with a
// few points added where an enclave or a border meets the sea. AFRICA_COAST runs from Cap Blanc
// north up the Atlantic, round Cape Spartel and east along the Mediterranean to the Libyan border;
// IBERIA_COAST runs from the Ebro coast south, west along Andalusia and north up Portugal to Peniche.
// Both walk with the land on the right.
const AFRICA_COAST = [
  [-16.977, 21.411], [-16.932, 21.587], [-16.931, 21.77], [-16.783, 22.112], [-16.685, 22.241], [-16.496, 22.284], [-16.395, 22.489], [-16.319, 22.569],
  [-16.252, 22.883], [-16.138, 22.954], [-16.097, 23.171], [-15.934, 23.493], [-15.797, 23.666], [-15.726, 23.858], [-15.838, 23.899], [-15.592, 23.996],
  [-15.145, 24.466], [-14.99, 24.56], [-14.875, 24.667], [-14.798, 24.913], [-14.808, 25.21], [-14.747, 25.43], [-14.679, 25.509], [-14.586, 25.766],
  [-14.484, 25.91], [-14.454, 26.119], [-14.383, 26.23], [-14.275, 26.269], [-14.138, 26.399], [-13.906, 26.465], [-13.595, 26.658], [-13.466, 26.842],
  [-13.364, 27.161], [-13.264, 27.308], [-13.136, 27.664], [-13.033, 27.717], [-12.94, 27.886], [-12.833, 27.931], [-12.506, 27.955], [-12.051, 28.051],
  [-11.766, 28.173], [-11.464, 28.292], [-11.3, 28.487], [-11.026, 28.728], [-10.554, 28.956], [-10.371, 29.133], [-10.236, 29.257], [-10.053, 29.488],
  [-10.033, 29.56], [-9.787, 29.815], [-9.616, 30.113], [-9.574, 30.373], [-9.573, 30.421], [-9.621, 30.495], [-9.673, 30.572], [-9.851, 30.703],
  [-9.78, 30.783], [-9.783, 30.961], [-9.772, 31.369], [-9.808, 31.397], [-9.765, 31.452], [-9.712, 31.53], [-9.652, 31.619], [-9.636, 31.707],
  [-9.431, 31.915], [-9.332, 32.005], [-9.231, 32.212], [-9.235, 32.267], [-9.251, 32.346], [-9.23, 32.552], [-8.843, 32.852], [-8.597, 33.101],
  [-8.504, 33.238], [-8.472, 33.225], [-8.434, 33.228], [-8.377, 33.266], [-8.287, 33.326], [-8.258, 33.347], [-8.23, 33.367], [-8.001, 33.428],
  [-7.873, 33.471], [-7.482, 33.613], [-7.325, 33.695], [-7.097, 33.799], [-6.905, 33.911], [-6.85, 33.974], [-6.79, 34.044], [-6.692, 34.157],
  [-6.661, 34.2], [-6.607, 34.277], [-6.523, 34.397], [-6.256, 34.862], [-6.211, 34.987], [-6.154, 35.114], [-6.14, 35.147], [-6.104, 35.225],
  [-6.02, 35.413], [-5.988, 35.486], [-5.948, 35.587], [-5.877, 35.774], [-5.837, 35.763], [-5.757, 35.77], [-5.595, 35.783], [-5.562, 35.797],
  [-5.502, 35.827], [-5.412, 35.872], [-5.412, 35.886], [-5.402, 35.862], [-5.378, 35.833], [-5.285, 35.563], [-5.09, 35.384], [-4.787, 35.204],
  [-4.504, 35.141], [-4.37, 35.112], [-3.915, 35.227], [-3.818, 35.167], [-3.675, 35.247], [-3.419, 35.158], [-3.183, 35.201], [-3.017, 35.284],
  [-2.962, 35.406], [-2.986, 35.32], [-2.974, 35.297], [-2.951, 35.26], [-2.951, 35.246], [-2.919, 35.136], [-2.567, 35.057], [-2.418, 35.109],
  [-2.231, 35.051], [-2.051, 35.036], [-1.747, 35.093], [-1.493, 35.26], [-1.348, 35.282], [-1.236, 35.368], [-1.157, 35.543], [-1.088, 35.588],
  [-0.817, 35.729], [-0.681, 35.677], [-0.498, 35.749], [-0.457, 35.857], [-0.359, 35.87], [-0.279, 35.781], [-0.107, 35.749], [0.063, 35.836],
  [0.152, 36.019], [0.681, 36.297], [0.755, 36.301], [1.059, 36.449], [1.352, 36.504], [1.702, 36.507], [2.067, 36.529], [2.333, 36.598],
  [2.453, 36.549], [2.649, 36.569], [2.996, 36.776], [3.173, 36.702], [3.243, 36.773], [3.462, 36.736], [3.663, 36.786], [3.836, 36.873],
  [4.041, 36.857], [4.441, 36.872], [4.59, 36.856], [4.777, 36.857], [5.087, 36.747], [5.094, 36.666], [5.301, 36.603], [5.442, 36.627],
  [5.77, 36.795], [6.043, 36.815], [6.271, 36.903], [6.362, 37.038], [6.452, 37.055], [6.569, 36.953], [6.813, 36.915], [6.905, 36.853],
  [7.177, 36.879], [7.278, 37.038], [7.48, 37.015], [7.583, 36.949], [7.78, 36.958], [7.742, 36.866], [7.913, 36.81], [8.235, 36.918],
  [8.496, 36.864], [8.613, 36.902], [8.914, 36.982], [9.104, 37.134], [9.221, 37.195], [9.352, 37.197], [9.75, 37.307], [9.82, 37.32],
  [9.734, 37.224], [9.808, 37.115], [9.956, 37.19], [9.886, 37.258], [10.044, 37.227], [10.27, 37.174], [10.18, 37.138], [10.183, 36.958],
  [10.299, 36.883], [10.219, 36.773], [10.414, 36.69], [10.565, 36.742], [10.589, 36.829], [10.752, 36.86], [11.008, 37.045], [11.075, 36.837],
  [10.991, 36.813], [10.771, 36.482], [10.498, 36.377], [10.439, 36.073], [10.576, 35.832], [10.676, 35.752], [10.822, 35.733], [10.819, 35.666],
  [11.029, 35.584], [10.974, 35.565], [11.007, 35.318], [11.122, 35.244], [10.984, 35.118], [10.88, 34.973], [10.885, 34.899], [10.572, 34.577],
  [10.414, 34.532], [10.101, 34.358], [9.971, 34.182], [10.014, 33.966], [10.137, 33.809], [10.309, 33.669], [10.46, 33.613], [10.694, 33.674],
  [10.69, 33.454], [10.931, 33.506], [10.98, 33.603], [11.074, 33.53], [11.051, 33.443], [11.131, 33.318], [11.164, 33.174], [11.5, 33.142],
];
const IBERIA_COAST = [
  [0.966, 41.07], [0.66, 40.8], [0.582, 40.649], [0.492, 40.55], [0.322, 40.312], [0.038, 40.06],
  [-0.228, 39.74], [-0.361, 39.527], [-0.34, 39.312], [-0.245, 39.058], [-0.054, 38.85], [0.09, 38.814], [0.194, 38.755], [-0.037, 38.659],
  [-0.11, 38.572], [-0.346, 38.506], [-0.542, 38.36], [-0.54, 38.228], [-0.643, 38.2], [-0.689, 38.006], [-0.793, 37.87], [-0.89, 37.713],
  [-0.741, 37.636], [-0.927, 37.596], [-1.076, 37.623], [-1.11, 37.572], [-1.334, 37.6], [-1.666, 37.412], [-1.847, 37.228], [-1.932, 36.972],
  [-2.135, 36.776], [-2.356, 36.876], [-2.593, 36.848], [-2.683, 36.727], [-2.748, 36.72], [-2.925, 36.791], [-3.128, 36.786], [-3.335, 36.784],
  [-3.415, 36.736], [-3.598, 36.782], [-3.777, 36.775], [-4.057, 36.788], [-4.228, 36.753], [-4.421, 36.761], [-4.547, 36.613], [-4.729, 36.532],
  [-4.908, 36.546], [-5.206, 36.445], [-5.289, 36.318], [-5.37, 36.164], [-5.455, 36.208], [-5.472, 36.087], [-5.608, 36.046],
  [-5.778, 36.121], [-5.901, 36.22], [-6.017, 36.225], [-6.122, 36.323], [-6.2, 36.599], [-6.369, 36.666], [-6.396, 36.742], [-6.314, 36.852],
  [-6.193, 36.903], [-6.359, 36.939], [-6.375, 36.846], [-6.477, 36.993], [-6.877, 37.203], [-7.085, 37.246], [-7.417, 37.232], [-7.528, 37.207],
  [-7.835, 37.036], [-7.948, 37.042], [-8.171, 37.127], [-8.437, 37.122], [-8.627, 37.161], [-8.695, 37.121], [-8.974, 37.053], [-8.846, 37.217],
  [-8.767, 37.443], [-8.761, 37.833], [-8.854, 37.949], [-8.736, 38.178], [-8.762, 38.379], [-8.942, 38.476], [-8.656, 38.366], [-8.776, 38.519],
  [-8.962, 38.544], [-9.192, 38.452], [-9.146, 38.559], [-9.225, 38.638], [-9.039, 38.655], [-8.905, 38.768], [-8.973, 38.913], [-8.921, 38.982],
  [-8.773, 39.034], [-8.799, 39.122], [-8.949, 39.08], [-9.141, 38.834], [-9.135, 38.747], [-9.323, 38.711], [-9.454, 38.721], [-9.384, 38.924],
  [-9.398, 39.021], [-9.308, 39.283], [-9.315, 39.372],
];
const MALLORCA = [[3.353, 39.784], [3.476, 39.749], [3.407, 39.592], [3.22, 39.359], [3.062, 39.269], [2.957, 39.363], [2.763, 39.4], [2.756, 39.503], [2.655, 39.564], [2.493, 39.471], [2.356, 39.612], [2.705, 39.814], [2.932, 39.914], [3.181, 39.968], [3.094, 39.882], [3.163, 39.769], [3.353, 39.784]];

function nearest(line, [x, y]) {
  let best = -1;
  let d = Infinity;
  line.forEach(([px, py], i) => {
    const e = Math.hypot(px - x, py - y);
    if (e < d) { d = e; best = i; }
  });
  if (d > 0.08) throw new Error(`morocco pack: no coast point near ${x},${y} (nearest ${d.toFixed(3)}°)`);
  return best;
}
const exact = (p) => {
  const i = AFRICA_COAST.findIndex((q) => q[0] === p[0] && q[1] === p[1]);
  if (i < 0) throw new Error(`morocco pack: ${p} is not an Africa coast vertex`);
  return i;
};
/** The coast point nearest [lng, lat] (so borders meet the shore exactly on a coast vertex). */
const ac = (x, y) => AFRICA_COAST[nearest(AFRICA_COAST, [x, y])];
const ic = (x, y) => IBERIA_COAST[nearest(IBERIA_COAST, [x, y])];
/** The shore from `a` to `b` (in coast order). */
function shore(line, a, b) {
  const i = line.indexOf(a);
  const j = line.indexOf(b);
  if (i < 0 || j < 0 || j <= i) throw new Error('morocco pack: bad shore slice');
  return line.slice(i, j + 1);
}
const aShore = (a, b) => shore(AFRICA_COAST, a, b);
const iShore = (a, b) => shore(IBERIA_COAST, a, b);

// Where land borders meet the shore.
const CAP_BLANC = AFRICA_COAST[0];
const BOUJDOUR = ac(-14.45, 26.12);
const DRAA_MOUTH = ac(-11.03, 28.73);
const CAP_GHIR = ac(-9.85, 30.70);
const TAMRI = ac(-9.78, 30.78);
const TENSIFT = ac(-9.33, 32.0);
const OUM_ER_RBIA = ac(-8.25, 33.36);
const RABAT_S = ac(-6.89, 33.92);
const LIXUS_S = ac(-6.15, 35.12);
const OUED_LAOU = ac(-5.05, 35.38);
const RIF_MID = ac(-4.37, 35.11);
const MOULOUYA = ac(-2.41, 35.11);
const SAIDIA = ac(-2.22, 35.05);
const TENES = ac(1.04, 36.45);
const AMPSAGA = ac(6.25, 36.9);
const TABARKA = ac(8.6, 36.9);
const LIBYA = AFRICA_COAST[AFRICA_COAST.length - 1];

const I_EBRO = IBERIA_COAST[0];
const I_PENISCOLA = ic(0.33, 40.28);
const I_NAO = ic(0.2, 38.73);
const I_AGUILAS = ic(-1.63, 37.41);
const I_GUADIANA = ic(-7.41, 37.23);
const I_SETUBAL = ic(-8.94, 38.53);
const I_PENICHE = IBERIA_COAST[IBERIA_COAST.length - 1];

// ---- Inland junctions and borders (lng, lat) ------------------------------------------------------
// Morocco: J1 Tingis / Gharb / western Rif … (see the piece list below).
const J1 = [-5.6, 34.95];
const J2 = [-5.42, 34.0]; // east of Volubilis: the edge of Roman Tingitana
const J3 = [-5.48, 34.55];
const J4 = [-6.2, 33.85]; // the Sala limes meets the Saïs and Tamesna
const J5 = [-4.4, 34.75];
const J6 = [-3.3, 34.35];
const J7 = [-3.75, 33.4];
const J8 = [-3.9, 32.6];
const J10 = [-4.9, 30.0];
const J11 = [-4.6, 32.1];
const J12 = [-5.0, 31.5];
const J13 = [-8.6, 28.9];
const J14 = [-7.9, 30.6];
const J15 = [-7.2, 31.5];
const J17 = [-8.67, 26.0];
const J18 = [-7.6, 32.2];
const J19 = [-7.4, 32.6];
const J20 = [-6.0, 33.35];
const J21 = [-1.68, 34.1];
const J24 = [-7.0, 29.3];
const FIGUIG = [-1.15, 32.1];
// Algeria and Ifriqiya.
const J22 = [6.0, 35.5]; // the Ampsaga (Rhumel): Mauretania / Numidia
const J23 = [8.3, 35.2];
const J25 = [1.1, 35.4];
const J26 = [11.45, 32.75];
// al-Andalus.
const K1 = [-8.4, 39.3];
const K2 = [-5.6, 38.6];
const K3 = [-2.5, 38.2];
const K4 = [-0.9, 38.85];
const K5 = [-0.6, 40.1];

const B_TING_GHARB = [LIXUS_S, [-5.95, 34.93], J1];
const B_TING_RIFW = [J1, [-5.35, 35.3], OUED_LAOU];
const B_GHARB_RIFW = [J3, J1];
const B_GHARB_SAIS = [J4, [-5.78, 33.93], J2, J3];
const B_GHARB_TAM = [RABAT_S, [-6.62, 33.88], J4];
const B_RIFW_SAIS = [J3, [-4.9, 34.6], J5];
const B_RIFW_RIFE = [J5, [-4.45, 35.0], RIF_MID];
const B_RIFE_SAIS = [J5, [-3.95, 34.4], J6];
const B_RIFE_EAST = [J6, [-3.0, 34.8], MOULOUYA];
const B_SAIS_EAST = [J6, J7];
const B_SAIS_TADLA = [J7, [-4.6, 33.35], [-5.4, 33.45], J20];
const B_TAM_SAIS = [J20, J4];
const B_TAM_TADLA = [J19, [-6.6, 32.85], J20];
const B_DOUK_TAM = [OUM_ER_RBIA, [-7.85, 33.0], J19];
const B_DOUK_TADLA = [J19, J18];
const B_HAOUZ_DOUK = [J18, [-8.5, 32.05], TENSIFT];
const B_HAOUZ_TADLA = [J15, [-7.2, 32.0], J18];
const B_ATLAS_HAOUZ = [J15, [-7.8, 31.3], [-8.7, 31.1], [-9.3, 30.9], TAMRI];
const B_ATLAS_TADLA = [J11, [-5.6, 32.2], [-6.6, 31.75], J15];
const B_ATLAS_SOUS = [CAP_GHIR, [-9.2, 30.75], [-8.4, 30.75], J14];
const B_ATLAS_DRAA = [J14, [-6.9, 31.15], J12];
const B_ATLAS_TAF = [J12, J11];
const B_TAF_TADLA = [J11, J8];
const B_EAST_TADLA = [J7, J8];
const B_EAST_TAF = [FIGUIG, [-2.6, 32.25], J8];
const B_TAF_DRAA = [J10, J12];
const B_DRAA_SOUS = [J14, [-8.2, 29.8], J13];
const B_DRAA_SAHN = [J13, [-8.0, 28.95], J24];
const B_SOUS_SAHN = [DRAA_MOUTH, [-10.0, 28.65], J13];
const B_SAHN_SAHS = [BOUJDOUR, [-12.0, 26.0], J17];
const B_EAST_ALGW = [SAIDIA, [-1.78, 34.75], J21];
const B_ALGW_ALGC = [TENES, J25];
const B_ALGC_ALGE = [AMPSAGA, [6.3, 36.2], J22];
const B_ALGE_IFR = [TABARKA, [8.4, 36.4], J23];
const B_IFR_TRIP = [LIBYA, J26];
// Outer edges (the desert, the Algerian frontier).
const O_EAST = [J21, [-1.55, 33.4], [-1.2, 32.6], FIGUIG];
const O_TAF = [FIGUIG, [-2.4, 31.35], [-3.65, 30.2], J10];
const O_DRAA = [J10, [-5.6, 29.5], J24];
const O_SAHN = [J24, [-7.6, 27.7], J17];
const O_SAHS = [J17, [-9.0, 23.5], [-10.5, 21.0], [-12.0, 20.2], [-13.6, 20.2], [-15.5, 21.0], CAP_BLANC];
const O_ALGW = [J21, [-0.8, 34.2], [0.6, 34.6], J25];
const O_ALGC = [J25, [2.5, 35.1], [4.5, 35.2], J22];
const O_ALGE = [J22, [7.0, 35.2], J23];
const O_IFR = [J23, [8.3, 34.0], [9.0, 33.2], [10.3, 33.0], J26];
// al-Andalus.
const B_LIS_W = [K1, [-8.7, 38.85], I_SETUBAL];
const B_W_S = [K2, [-6.6, 38.1], [-7.2, 37.6], I_GUADIANA];
const B_S_MUR = [K3, [-2.2, 37.7], I_AGUILAS];
const B_MUR_VAL = [K4, [-0.3, 38.8], I_NAO];
const B_VAL_NE = [K5, I_PENISCOLA];
const O_LIS = [I_PENICHE, [-8.9, 39.45], K1];
const O_W = [K1, [-7.4, 39.25], [-6.3, 39.1], K2];
const O_S = [K2, [-4.5, 38.35], [-3.4, 38.35], K3];
const O_MUR = [K3, [-1.6, 38.7], K4];
const O_VAL = [K4, [-1.2, 39.5], K5];
const O_NE = [K5, [-1.5, 40.5], [-1.9, 41.3], [-1.4, 41.9], [-0.6, 41.95], [0.5, 41.8], [0.9, 41.3], I_EBRO];

// ---- Pieces ----------------------------------------------------------------------------------------
/** The pieces: shared borders point for point, so any touching set merges into one outline. */
export const MOROCCO_PIECES = {
  // Morocco
  TING: path(aShore(LIXUS_S, OUED_LAOU), rev(B_TING_RIFW), rev(B_TING_GHARB)), // Tangier peninsula, Lixus, Tétouan
  GHARB: path(aShore(RABAT_S, LIXUS_S), B_TING_GHARB, rev(B_GHARB_RIFW), rev(B_GHARB_SAIS), rev(B_GHARB_TAM)), // Sala to Larache, Volubilis
  RIF_W: path(aShore(OUED_LAOU, RIF_MID), rev(B_RIFW_RIFE), rev(B_RIFW_SAIS), B_GHARB_RIFW, B_TING_RIFW), // Ghomara, Jbala, Chefchaouen
  RIF_E: path(aShore(RIF_MID, MOULOUYA), rev(B_RIFE_EAST), rev(B_RIFE_SAIS), B_RIFW_RIFE), // Nekor, Melilla
  SAIS: path(B_GHARB_SAIS, B_RIFW_SAIS, B_RIFE_SAIS, B_SAIS_EAST, B_SAIS_TADLA, B_TAM_SAIS), // Fez, Meknes, Taza
  EAST: path(aShore(MOULOUYA, SAIDIA), B_EAST_ALGW, O_EAST, B_EAST_TAF, rev(B_EAST_TADLA), rev(B_SAIS_EAST), B_RIFE_EAST), // Oujda, the Moulouya
  TAMESNA: path(aShore(OUM_ER_RBIA, RABAT_S), B_GHARB_TAM, rev(B_TAM_SAIS), rev(B_TAM_TADLA), rev(B_DOUK_TAM)), // Anfa, the Barghawata plain
  DOUKKALA: path(aShore(TENSIFT, OUM_ER_RBIA), B_DOUK_TAM, B_DOUK_TADLA, B_HAOUZ_DOUK), // Safi, Azemmour, Mazagan
  TADLA: path(B_TAM_TADLA, rev(B_SAIS_TADLA), B_EAST_TADLA, rev(B_TAF_TADLA), B_ATLAS_TADLA, B_HAOUZ_TADLA, rev(B_DOUK_TADLA)), // Middle Atlas, Tadla plain
  HAOUZ: path(aShore(TAMRI, TENSIFT), rev(B_HAOUZ_DOUK), rev(B_HAOUZ_TADLA), B_ATLAS_HAOUZ), // Marrakesh, Aghmat, Mogador
  ATLAS: path(aShore(CAP_GHIR, TAMRI), rev(B_ATLAS_HAOUZ), rev(B_ATLAS_TADLA), rev(B_ATLAS_TAF), rev(B_ATLAS_DRAA), rev(B_ATLAS_SOUS)), // High Atlas, Tinmel
  SOUS: path(aShore(DRAA_MOUTH, CAP_GHIR), B_ATLAS_SOUS, B_DRAA_SOUS, rev(B_SOUS_SAHN)), // Agadir, Taroudant, Tiznit
  DRAA: path(B_ATLAS_DRAA, rev(B_TAF_DRAA), O_DRAA, rev(B_DRAA_SAHN), rev(B_DRAA_SOUS)), // Ouarzazate, Zagora, Tagmadert
  TAFILALT: path(B_TAF_TADLA, rev(B_EAST_TAF), O_TAF, B_TAF_DRAA, B_ATLAS_TAF), // Sijilmasa, the Ziz
  SAHARA_N: path(aShore(BOUJDOUR, DRAA_MOUTH), B_SOUS_SAHN, B_DRAA_SAHN, O_SAHN, rev(B_SAHN_SAHS)), // Wad Noun, Saguia el-Hamra
  SAHARA_S: path(aShore(CAP_BLANC, BOUJDOUR), B_SAHN_SAHS, O_SAHS), // Rio de Oro and the Adrar (Azougui)
  // Algeria and Ifriqiya
  ALG_W: path(aShore(SAIDIA, TENES), B_ALGW_ALGC, rev(O_ALGW), rev(B_EAST_ALGW)), // Tlemcen, Oran
  ALG_C: path(aShore(TENES, AMPSAGA), B_ALGC_ALGE, rev(O_ALGC), rev(B_ALGW_ALGC)), // Caesarea, Algiers, Béjaïa
  ALG_E: path(aShore(AMPSAGA, TABARKA), B_ALGE_IFR, rev(O_ALGE), rev(B_ALGC_ALGE)), // Constantine, Annaba
  IFR: path(aShore(TABARKA, LIBYA), B_IFR_TRIP, rev(O_IFR), rev(B_ALGE_IFR)), // Tunis, Kairouan, Mahdia
  TRIP: path([LIBYA, [12.48, 32.8], [13.18, 32.9], [14.29, 32.64], [15.2, 32.35], [15.4, 31.9], [14.3, 32.2], [13.0, 32.45], [11.6, 32.7]], rev(B_IFR_TRIP)), // Tripoli
  // al-Andalus
  AND_LIS: path(iShore(I_SETUBAL, I_PENICHE), O_LIS, B_LIS_W), // Lisbon, Santarém
  AND_W: path(iShore(I_GUADIANA, I_SETUBAL), rev(B_LIS_W), O_W, B_W_S), // Gharb al-Andalus, Badajoz
  AND_S: path(iShore(I_AGUILAS, I_GUADIANA), rev(B_W_S), O_S, B_S_MUR), // Seville, Córdoba, Granada
  AND_MUR: path(iShore(I_NAO, I_AGUILAS), rev(B_S_MUR), O_MUR, B_MUR_VAL), // Murcia, Denia
  AND_VAL: path(iShore(I_PENISCOLA, I_NAO), rev(B_MUR_VAL), O_VAL, B_VAL_NE), // Valencia
  AND_NE: path(iShore(I_EBRO, I_PENISCOLA), rev(B_VAL_NE), O_NE), // Zaragoza, Tortosa, Lleida
  BAL: MALLORCA,
};
const PC = MOROCCO_PIECES;

// ---- Coastal enclaves ------------------------------------------------------------------------------
//
// Each enclave is the stretch of shore between two coast points, a few km deep. The state holding
// that coast in a given year has the same notch cut out of its outline (`notch`), so they never overlap.
const ENCLAVE_COAST = {
  ceuta: [[-5.412, 35.872], [-5.378, 35.833]],
  'ksar-es-seghir': [[-5.595, 35.783], [-5.502, 35.827]],
  tangier: [[-5.837, 35.763], [-5.757, 35.77]],
  asilah: [[-6.02, 35.413], [-5.988, 35.486]],
  larache: [[-6.14, 35.147], [-6.104, 35.225]],
  mamora: [[-6.661, 34.2], [-6.607, 34.277]],
  sale: [[-6.85, 33.974], [-6.79, 34.044]],
  azemmour: [[-8.377, 33.266], [-8.287, 33.326]],
  mazagan: [[-8.504, 33.238], [-8.472, 33.225]],
  safi: [[-9.235, 32.267], [-9.251, 32.346]],
  mogador: [[-9.765, 31.452], [-9.712, 31.53]],
  agadir: [[-9.573, 30.421], [-9.621, 30.495]],
  melilla: [[-2.974, 35.297], [-2.951, 35.26]],
};
const DEPTH = 0.06;

/** Chord-parallel inland offset of the shore a → b (land on the right). */
function inland(a, b, d) {
  const tx = b[0] - a[0];
  const ty = b[1] - a[1];
  const n = Math.hypot(tx, ty) || 1;
  const nx = (ty / n) * d;
  const ny = (-tx / n) * d;
  const r = (v) => Math.round(v * 1000) / 1000;
  return [[r(a[0] + nx), r(a[1] + ny)], [r(b[0] + nx), r(b[1] + ny)]];
}

/** id → { a, b, slice (shore a → b), inland (a' → b'), ring }. */
export const ENCLAVE_SHAPES = Object.fromEntries(
  Object.entries(ENCLAVE_COAST).map(([id, [p, q]]) => {
    const i = exact(p);
    const j = exact(q);
    if (j <= i) throw new Error(`morocco pack: enclave ${id} runs backwards`);
    const slice = AFRICA_COAST.slice(i, j + 1);
    const inl = inland(slice[0], slice[slice.length - 1], DEPTH);
    const ring = ensureClockwise([...slice, ...rev(inl), slice[0]]);
    return [id, { a: slice[0], b: slice[slice.length - 1], slice, inland: inl, ring }];
  }),
);

const same = (p, q) => p[0] === q[0] && p[1] === q[1];
/** Cut enclave `e` out of a closed ring that runs along its stretch of shore (either direction). */
function notch(ring, e) {
  const open = ring.slice(0, -1);
  const n = open.length;
  const L = e.slice.length;
  const at = (s) => open.findIndex((p) => same(p, s));
  const ia = at(e.a);
  const ib = at(e.b);
  if (ia < 0 || ib < 0) return ring;
  const rot = (k) => [...open.slice(k), ...open.slice(0, k)];
  let out = null;
  if (e.slice.every((p, k) => same(open[(ia + k) % n], p))) out = [e.a, ...e.inland, e.b, ...rot(ia).slice(L)];
  else if (e.slice.every((p, k) => same(open[(ib + k) % n], e.slice[L - 1 - k]))) out = [e.b, ...rev(e.inland), e.a, ...rot(ib).slice(L)];
  if (!out) throw new Error('morocco pack: enclave shore not found in host ring');
  return [...out, out[0]];
}

/**
 * Who held each enclave: [enclave id, polity id, from, to (exclusive), name]. The polity is drawn
 * with that small region from `from` until the year before `to`.
 */
export const ENCLAVE_RULE = [
  ['ceuta', 'portuguese-morocco', 1415, 1640, 'Ceuta (Portuguese)'],
  ['ceuta', 'spanish-presidios', 1640, 1816, 'Ceuta (Spanish)'],
  ['ksar-es-seghir', 'portuguese-morocco', 1458, 1550, 'Alcácer-Ceguer (Ksar es-Seghir)'],
  ['tangier', 'portuguese-morocco', 1471, 1662, 'Tânger (Portuguese Tangier)'],
  ['tangier', 'english-tangier', 1662, 1684, 'English Tangier'],
  ['asilah', 'portuguese-morocco', 1471, 1550, 'Arzila (Asilah)'],
  ['melilla', 'spanish-presidios', 1497, 1816, 'Melilla'],
  ['agadir', 'portuguese-morocco', 1505, 1541, 'Santa Cruz do Cabo de Gué (Agadir)'],
  ['mogador', 'portuguese-morocco', 1506, 1510, 'Castelo Real (Mogador)'],
  ['safi', 'portuguese-morocco', 1508, 1541, 'Safim (Safi)'],
  ['azemmour', 'portuguese-morocco', 1513, 1541, 'Azamor (Azemmour)'],
  ['mazagan', 'portuguese-morocco', 1514, 1769, 'Mazagão (El Jadida)'],
  ['larache', 'spanish-presidios', 1610, 1689, 'Larache (Spanish)'],
  ['mamora', 'spanish-presidios', 1614, 1681, 'La Mamora (Mehdya)'],
  ['sale', 'republic-of-sale', 1627, 1668, 'Salé and Rabat'],
];
const ENCLAVE_YEARS = [...new Set(ENCLAVE_RULE.flatMap(([, , f, t]) => [f, t]))].sort((x, y) => x - y);
const enclavesAt = (y) => ENCLAVE_RULE.filter(([, , f, t]) => y >= f && y < t);

// ---- Building a polity from its dated piece list -----------------------------------------------------

/**
 * steps: [[year, label, { regionId: [name, [PIECE, …]] }], …]. Keyframes are written for every step
 * year and the year before it (still the old extent), and around every enclave change while the
 * polity lives, so each change is a one-year step. Rings are cut round the enclaves held that year.
 */
function build(meta, steps) {
  const first = steps[0][0];
  const last = steps[steps.length - 1][0];
  const years = new Set();
  steps.forEach(([y], i) => {
    years.add(y);
    if (i > 0 && y - 1 > steps[i - 1][0]) years.add(y - 1);
  });
  for (const y of ENCLAVE_YEARS) {
    if (y > first && y <= last) {
      years.add(y);
      years.add(y - 1);
    }
  }
  const overlays = [...years].sort((x, y) => x - y).map((y) => {
    let s = steps[0];
    for (const st of steps) if (st[0] <= y) s = st;
    const own = enclavesAt(y).filter(([, pid]) => pid === meta.id);
    const others = enclavesAt(y).filter(([, pid]) => pid !== meta.id);
    const regions = Object.entries(s[2]).map(([rid, [name, pieces]]) => {
      let ring = pieces.length === 1 ? ensureClockwise(pieces[0]) : ensureClockwise(mergeRings(`${meta.id} ${y} ${rid}`, ...pieces));
      for (const [eid] of others) ring = notch(ring, ENCLAVE_SHAPES[eid]);
      return { id: rid, name, ring };
    });
    for (const [eid, , , , name] of own) regions.push({ id: eid, name, ring: ENCLAVE_SHAPES[eid].ring });
    return { year: y, label: s[1], approximation: A, regions };
  });
  return {
    edgeGrace: 1,
    keyYears: steps.map(([y]) => y),
    ...meta,
    overlays,
  };
}

/** Enclave polities: regions are the enclaves they hold, keyframes around every change. */
function buildEnclaves(meta, steps) {
  const mine = ENCLAVE_RULE.filter(([, pid]) => pid === meta.id);
  const changes = [...new Set(mine.flatMap(([, , f, t]) => [f, t]))].filter((y) => y <= 1815);
  const years = new Set([...changes, ...changes.map((y) => y - 1), ...steps.map(([y]) => y)]);
  const first = Math.min(...mine.map(([, , f]) => f));
  const last = Math.min(1815, Math.max(...mine.map(([, , , t]) => t - 1)));
  const overlays = [...years].filter((y) => y >= first && y <= last).sort((x, y) => x - y).map((y) => {
    let label = steps[0][1];
    for (const [sy, sl] of steps) if (sy <= y) label = sl;
    const regions = mine.filter(([, , f, t]) => y >= f && y < t).map(([eid, , , , name]) => ({ id: eid, name, ring: ENCLAVE_SHAPES[eid].ring }));
    return { year: y, label, approximation: A, regions };
  }).filter((o) => o.regions.length);
  return { edgeGrace: 1, keyYears: steps.map(([y]) => y), ...meta, overlays };
}

// ---- Confidence and sources --------------------------------------------------------------------------

const CONF = {
  mauri: {
    level: 'conjectural',
    reason: 'Known only from Greek and Roman writers (Livy, Sallust, Strabo, Pliny) and from coins and the ruins of Volubilis, Lixus and Caesarea. The kings ruled from towns in the north; how far their power reached into the Atlas and the Rif is unknown, and the outline is a guess.',
  },
  roman: {
    level: 'approximate',
    reason: 'Roman Tingitana is well mapped by its roads, forts and inscriptions: a strip from Tingis to Volubilis and Sala, walled off by the Sala limes. Its land border with Caesariensis ran along the Moulouya, but the Rif between was never held; the outline shows the governed lowlands.',
  },
  berber: {
    level: 'conjectural',
    reason: 'Drawn from Arab geographers and chroniclers writing at a distance (al-Bakri, Ibn Hawqal, Ibn Khaldun). These were tribal states whose reach rose and fell with alliances; the outline is the region the sources name, not a border.',
  },
  dynasty: {
    level: 'approximate',
    reason: 'The cities each dynasty took, and when, are well recorded (Ibn Abi Zar, Ibn Khaldun, al-Bakri, later histories). In the mountains and the desert rule meant the allegiance of tribes, so borders between cities are drawn roughly and changes are shown in the year they are recorded.',
  },
  sharifian: {
    level: 'approximate',
    reason: 'The towns, campaigns and treaties are well documented, including by Portuguese, Spanish and English witnesses. The sultan’s writ (bilad al-makhzen) was patchy in the Atlas and the Rif, which are drawn as part of the state even where tribes were often independent.',
  },
  enclave: {
    level: 'documented',
    reason: 'The forts and walled towns, and the years they were taken and given up, are precisely recorded. Their size is enlarged a little so they show on the globe; the hinterland they controlled changed with every siege.',
  },
  crisis: {
    level: 'approximate',
    reason: 'Known from Moroccan chronicles (al-Ifrani, al-Qadiri) and European consuls’ reports. The zawiya and corsair states controlled towns and tribes rather than fixed territory; the outlines are drawn round the towns and plains they held.',
  },
};

// Piece groups.
const NORTH = ['TING', 'GHARB', 'RIF_W', 'RIF_E', 'SAIS', 'EAST'];
const ALMOHAD_REMAINDER = ['HAOUZ', 'ATLAS', 'SOUS', 'DRAA', 'TADLA', 'TAMESNA', 'DOUKKALA', 'TAFILALT'];
const MOROCCO = [...NORTH, ...ALMOHAD_REMAINDER];
const P = (names) => names.map((n) => {
  if (!PC[n]) throw new Error(`morocco pack: no piece ${n}`);
  return PC[n];
});
/** A dated step: [year, label, { regionId: [name, [PIECE names]] }]. */
const S = (year, label, regions) => [year, label, Object.fromEntries(Object.entries(regions).map(([k, [n, ps]]) => [k, [n, P(ps)]]))];
const minus = (list, ...drop) => list.filter((p) => !drop.includes(p));

// ---- Kingdom of Mauretania, c. 206 BCE – 40 CE ----------------------------------------------------------

const MAU_W = ['TING', 'GHARB', 'RIF_W', 'RIF_E', 'SAIS'];
const mauretania = build({
  id: 'mauretania-kingdom', name: 'Kingdom of Mauretania', color: '#B45309', type: 'state',
  description: 'The kingdom of the Mauri, Amazigh (Berber) kings of the far west who ruled from Tingis (Tangier), Lixus and Volubilis. Baga is the first king named, sending troops to Masinissa in 206 BCE; Bocchus I betrayed Jugurtha to Rome in 105 BCE and was given western Numidia. Rome installed the scholar-king Juba II and his queen Cleopatra Selene in 25 BCE, with capitals at Caesarea (Cherchell) and Volubilis. Caligula had their son Ptolemy killed in 40 CE, and Rome annexed the kingdom.',
  nameAt: [[-206, 'Kingdom of Mauretania'], [-25, 'Mauretania (Juba II)'], [23, 'Mauretania (Ptolemy)']],
  timelineItemIds: ['morocco-mauretania'], confidence: CONF.mauri,
  sources: [W('Mauretania'), W('Baga (king)'), W('Bocchus I'), W('Juba II'), W('Ptolemy of Mauretania'), UNESCO('Archaeological Site of Volubilis', 836)],
}, [
  S(-206, 'Baga, first named king of the Mauri', { mauri: ['Mauretania', MAU_W] }),
  S(-105, 'Bocchus I gains western Numidia', { mauri: ['Mauretania', [...MAU_W, 'EAST', 'ALG_W']] }),
  S(-49, 'Split between Bogud (west) and Bocchus II (east)', { mauri: ['Mauretania', [...MAU_W, 'EAST', 'ALG_W']] }),
  S(-25, 'Juba II and Cleopatra Selene, Rome’s client kings', { mauri: ['Mauretania', [...MAU_W, 'EAST', 'ALG_W', 'ALG_C']] }),
  S(23, 'Ptolemy of Mauretania', { mauri: ['Mauretania', [...MAU_W, 'EAST', 'ALG_W', 'ALG_C']] }),
  S(40, 'Caligula has Ptolemy killed; Rome annexes (44)', { mauri: ['Mauretania', [...MAU_W, 'EAST', 'ALG_W', 'ALG_C']] }),
]);

// ---- Roman Mauretania, 44–429 ------------------------------------------------------------------------

const romanMauretania = build({
  id: 'roman-mauretania', name: 'Roman Mauretania', color: '#B91C1C', type: 'state',
  description: 'Rome split the kingdom into two provinces in 44 CE: Mauretania Tingitana, governed from Tingis, and Mauretania Caesariensis, governed from Caesarea (Cherchell), with the Moulouya between. Tingitana was a narrow, well-defended lowland of olive estates and towns — Volubilis, Lixus, Sala, Banasa — behind the Sala limes. Under Diocletian (c. 285) Rome pulled back to the Tangier peninsula and the coast; Volubilis carried on without a garrison. The Vandals crossed from Spain in 429.',
  timelineItemIds: ['morocco-mauretania'], confidence: CONF.roman,
  sources: [W('Mauretania Tingitana'), W('Mauretania Caesariensis'), W('Volubilis'), W('Sala Colonia'), UNESCO('Archaeological Site of Volubilis', 836)],
}, [
  S(44, 'Rome annexes Mauretania: two provinces', { tingitana: ['Mauretania Tingitana', ['TING', 'GHARB']], caesariensis: ['Mauretania Caesariensis', ['ALG_W', 'ALG_C']] }),
  S(117, 'Tingitana and Caesariensis', { tingitana: ['Mauretania Tingitana', ['TING', 'GHARB']], caesariensis: ['Mauretania Caesariensis', ['ALG_W', 'ALG_C']] }),
  S(285, 'Diocletian withdraws to the Tangier peninsula', { tingitana: ['Mauretania Tingitana', ['TING']], caesariensis: ['Mauretania Caesariensis', ['ALG_W', 'ALG_C']] }),
  S(395, 'Tingitana under the Diocese of Spain', { tingitana: ['Mauretania Tingitana', ['TING']], caesariensis: ['Mauretania Caesariensis', ['ALG_W', 'ALG_C']] }),
  S(428, 'The Vandals cross from Spain (429)', { tingitana: ['Mauretania Tingitana', ['TING']], caesariensis: ['Mauretania Caesariensis', ['ALG_W', 'ALG_C']] }),
]);

// ---- Barghawata, 744–1058 ----------------------------------------------------------------------------

const barghawata = build({
  id: 'barghawata', name: 'Barghawata', color: '#0F766E', type: 'state',
  description: 'A confederation of Masmuda Berbers on the Atlantic plain of Tamesna, between Salé and Safi, who broke away during the great Berber Revolt of 739–743. In 744 Salih ibn Tarif proclaimed himself a prophet with a Berber-language Qur’an, and the Barghawata held out for three centuries against the Idrisids, the Umayyads of Córdoba and the Zenata. The Almoravids crushed them after 1058 (their leader Abdallah ibn Yasin died fighting them in 1059).',
  timelineItemIds: ['morocco-barghawata-zenata'], confidence: CONF.berber,
  sources: [W('Barghawata'), W('Salih ibn Tarif'), W('Berber Revolt'), ABUN_NASR],
}, [
  S(744, 'Salih ibn Tarif founds the Barghawata state', { barghawata: ['Barghawata (Tamesna)', ['TAMESNA', 'DOUKKALA']] }),
  S(850, 'The Barghawata of Tamesna', { barghawata: ['Barghawata (Tamesna)', ['TAMESNA', 'DOUKKALA']] }),
  S(960, 'Barghawata resist Córdoba and the Zenata', { barghawata: ['Barghawata (Tamesna)', ['TAMESNA', 'DOUKKALA']] }),
  S(1058, 'The Almoravids attack the Barghawata', { barghawata: ['Barghawata (Tamesna)', ['TAMESNA', 'DOUKKALA']] }),
]);

// ---- Idrisids, 788–974 -------------------------------------------------------------------------------

const idrisid = build({
  id: 'idrisid-dynasty', name: 'Idrisids', color: '#15803D', type: 'state',
  description: 'Idris ibn Abdallah, a descendant of the Prophet who fled the Abbasids after the battle of Fakhkh (786), was welcomed by the Awraba Berbers at Walili (Volubilis) in 788 and founded the first Islamic dynasty of Morocco. He founded Fez in 789; his son Idris II built it into a capital and by 828 ruled from Tlemcen to the Sous. The realm was then shared among Idris II’s sons. Fatimid and Umayyad armies took Fez in 917–921, and the Idrisids held out in the Rif until 974.',
  timelineItemIds: ['morocco-idrisids'], confidence: CONF.dynasty,
  sources: [W('Idrisid dynasty'), W('Idris I of Morocco'), W('Idris II of Morocco'), W('Fez, Morocco'), UNESCO('Medina of Fez', 170), ABUN_NASR],
}, [
  S(789, 'Idris I at Walili; Fez founded', { idrisid: ['Idrisid Morocco', ['GHARB', 'SAIS']] }),
  S(790, 'Idris I takes Tlemcen', { idrisid: ['Idrisid Morocco', ['GHARB', 'SAIS', 'EAST', 'ALG_W']] }),
  S(809, 'Idris II makes Fez his capital', { idrisid: ['Idrisid Morocco', ['GHARB', 'SAIS', 'EAST', 'ALG_W']] }),
  S(828, 'Idris II dies; the realm shared among his sons', { idrisid: ['Idrisid Morocco', ['TING', 'GHARB', 'RIF_W', 'SAIS', 'EAST', 'ALG_W', 'TADLA', 'HAOUZ', 'ATLAS', 'SOUS']] }),
  S(917, 'Fatimid-backed Miknasa take Fez', { idrisid: ['Idrisid Morocco', ['TING', 'GHARB', 'RIF_W', 'SAIS', 'EAST', 'ALG_W', 'TADLA', 'HAOUZ', 'ATLAS', 'SOUS']] }),
  S(921, 'The Idrisids hold out in the north', { idrisid: ['Idrisids (north)', ['TING', 'GHARB', 'RIF_W']] }),
  S(925, 'Al-Hasan al-Hajjam retakes Fez', { idrisid: ['Idrisids (north)', ['TING', 'GHARB', 'RIF_W', 'SAIS']] }),
  S(927, 'Driven from Fez; Idrisids in the Rif and Jbala', { idrisid: ['Idrisids (Hajar an-Nasr)', ['TING', 'RIF_W']] }),
  S(951, 'Idrisids at Hajar an-Nasr under Umayyad pressure', { idrisid: ['Idrisids (Hajar an-Nasr)', ['TING', 'RIF_W']] }),
  S(973, 'The Umayyads of Córdoba end the dynasty (974)', { idrisid: ['Idrisids (Hajar an-Nasr)', ['TING', 'RIF_W']] }),
]);

// ---- Emirate of Nekor, c. 750–1015 ---------------------------------------------------------------------

const nekor = build({
  id: 'emirate-of-nekor', name: 'Emirate of Nekor', color: '#0369A1', type: 'state',
  description: 'A small Arab-led emirate of the eastern Rif, granted to Salih ibn Mansur in 710, with its capital at Nekor near today’s Al Hoceima. It survived Viking raids (859), Fatimid attacks and Umayyad overlordship, and was finally destroyed by the Maghrawa in 1015.',
  timelineItemIds: ['morocco-idrisids', 'morocco-barghawata-zenata'], confidence: CONF.berber,
  sources: [W('Emirate of Nekor'), ABUN_NASR],
}, [
  S(750, 'Salih ibn Mansur’s heirs rule Nekor', { nekor: ['Nekor', ['RIF_E']] }),
  S(917, 'The Fatimids sack Nekor', { nekor: ['Nekor', ['RIF_E']] }),
  S(1015, 'Destroyed by the Maghrawa', { nekor: ['Nekor', ['RIF_E']] }),
]);

// ---- Midrarids of Sijilmasa, 758–976 --------------------------------------------------------------------

const midrarids = build({
  id: 'midrarids', name: 'Midrarids (Sijilmasa)', color: '#A16207', type: 'state',
  description: 'The Miknasa Berber, Sufri Kharijite rulers of Sijilmasa, the oasis city in the Tafilalt founded in 757–758 at the northern end of the caravan road to the gold of Wagadu (Ghana). Sijilmasa grew rich on the trans-Saharan trade; the Fatimid founder Ubayd Allah was held prisoner there until 909. The Maghrawa took the city in 976–977.',
  timelineItemIds: ['morocco-barghawata-zenata'], confidence: CONF.berber,
  sources: [W('Midrarid dynasty'), W('Sijilmasa'), ABUN_NASR],
}, [
  S(758, 'Sijilmasa founded by the Miknasa', { midrar: ['Sijilmasa', ['TAFILALT']] }),
  S(823, 'The Midrarids rule the Tafilalt', { midrar: ['Sijilmasa', ['TAFILALT']] }),
  S(958, 'Fatimid general Jawhar takes Sijilmasa', { midrar: ['Sijilmasa', ['TAFILALT']] }),
  S(976, 'The Maghrawa take Sijilmasa', { midrar: ['Sijilmasa', ['TAFILALT']] }),
]);

// ---- The Zenata: Maghrawa and Banu Ifran, 977–1080 ----------------------------------------------------------

const maghrawa = build({
  id: 'maghrawa', name: 'Maghrawa', color: '#7C3AED', type: 'state',
  description: 'A Zenata Berber people who served the Umayyads of Córdoba in the Maghreb. They took Sijilmasa in 976–977 and Fez in 987, ruling northern Morocco for Córdoba and then for themselves; Ziri ibn Atiyya founded Oujda in 994. The rival Banu Ifran held Fez in 1033–1038, and a Maghrawa branch ruled Aghmat. The Almoravids took Aghmat in 1058, Fez in 1069 and the Maghrawa’s last towns in the east by 1080.',
  timelineItemIds: ['morocco-barghawata-zenata'], confidence: CONF.berber,
  sources: [W('Maghrawa'), W('Ziri ibn Atiyya'), W('Oujda'), ABUN_NASR],
}, [
  S(977, 'The Maghrawa take Sijilmasa', { maghrawa: ['Maghrawa', ['TAFILALT']] }),
  S(987, 'Fez taken for Córdoba', { maghrawa: ['Maghrawa', ['SAIS', 'GHARB', 'EAST', 'ALG_W', 'TADLA', 'TAFILALT']] }),
  S(994, 'Ziri ibn Atiyya founds Oujda', { maghrawa: ['Maghrawa', ['SAIS', 'GHARB', 'EAST', 'ALG_W', 'TADLA', 'TAFILALT']] }),
  S(1033, 'The Banu Ifran take Fez', { maghrawa: ['Maghrawa (east)', ['EAST', 'ALG_W', 'TAFILALT']], aghmat: ['Maghrawa of Aghmat', ['HAOUZ']] }),
  S(1038, 'The Maghrawa retake Fez', { maghrawa: ['Maghrawa', ['SAIS', 'EAST', 'ALG_W', 'TAFILALT']], aghmat: ['Maghrawa of Aghmat', ['HAOUZ']] }),
  S(1055, 'The Almoravids take Sijilmasa', { maghrawa: ['Maghrawa', ['SAIS', 'EAST', 'ALG_W']], aghmat: ['Maghrawa of Aghmat', ['HAOUZ']] }),
  S(1058, 'The Almoravids take Aghmat', { maghrawa: ['Maghrawa', ['SAIS', 'EAST', 'ALG_W']] }),
  S(1069, 'The Almoravids take Fez', { maghrawa: ['Maghrawa (east)', ['EAST', 'ALG_W']] }),
  S(1080, 'The last Maghrawa towns fall to the Almoravids', { maghrawa: ['Maghrawa (east)', ['EAST', 'ALG_W']] }),
]);

const banuIfran = build({
  id: 'banu-ifran', name: 'Banu Ifran', color: '#9D174D', type: 'state',
  description: 'A Zenata Berber dynasty, rivals of the Maghrawa, who ruled from Salé and took Fez in 1033 (with a massacre of its Jews). The Maghrawa drove them back out of Fez in 1037–1038; the Banu Ifran held the Bou Regreg and the Tadla until the Almoravids took their lands around 1059–1060.',
  timelineItemIds: ['morocco-barghawata-zenata'], confidence: CONF.berber,
  sources: [W('Banu Ifran'), ABUN_NASR],
}, [
  S(1033, 'The Banu Ifran take Fez', { ifran: ['Banu Ifran', ['SAIS', 'GHARB', 'TADLA']] }),
  S(1038, 'Driven from Fez; the Banu Ifran of Salé', { ifran: ['Banu Ifran (Salé)', ['GHARB']], tadla: ['Banu Ifran (Tadla)', ['TADLA']] }),
  S(1059, 'The Almoravids take Salé and the Tadla (1060)', { ifran: ['Banu Ifran (Salé)', ['GHARB']], tadla: ['Banu Ifran (Tadla)', ['TADLA']] }),
]);

// ---- Almoravids, c. 1045–1147 (Majorca to 1203) ------------------------------------------------------------

const ALM_1083 = ['SAHARA_S', 'SAHARA_N', 'DRAA', 'TAFILALT', 'SOUS', 'HAOUZ', 'ATLAS', 'TAMESNA', 'DOUKKALA', 'TADLA', 'GHARB', 'SAIS', 'RIF_E', 'EAST', 'ALG_W', 'TING', 'RIF_W'];
const almoravid = build({
  id: 'almoravid-empire', name: 'Almoravids', color: '#C2410C', type: 'empire',
  description: 'A reform movement of the veiled Sanhaja nomads of the western Sahara (Lamtuna, Massufa, Guddala), led by the preacher Abdallah ibn Yasin and the chiefs Yahya and Abu Bakr ibn Umar. From the desert they took Sijilmasa (1055), Aghmat (1058) and Fez (1069); Yusuf ibn Tashfin founded Marrakesh (c. 1070), took Tlemcen (1081) and Algiers (1082), crossed to Spain to defeat Castile at Sagrajas (1086) and took over the taifa kingdoms of al-Andalus (1090–1110). The Almohads took Marrakesh in 1147; the Banu Ghaniya, an Almoravid family, held Majorca until 1203.',
  nameAt: [[1045, 'Almoravids'], [1147, 'Banu Ghaniya (Almoravids of Majorca)']],
  timelineItemIds: ['morocco-almoravid-almohad'], confidence: CONF.dynasty,
  sources: [W('Almoravid dynasty'), W('Yusuf ibn Tashfin'), W('Banu Ghaniya'), W('Marrakesh'), UNESCO('Medina of Marrakesh', 331), ABUN_NASR],
}, [
  S(1045, 'Abdallah ibn Yasin preaches to the Sanhaja', { almoravid: ['Almoravids', ['SAHARA_S']] }),
  S(1055, 'The Almoravids take Sijilmasa', { almoravid: ['Almoravids', ['SAHARA_S', 'SAHARA_N', 'DRAA', 'TAFILALT']] }),
  S(1057, 'The Almoravids take the Sous', { almoravid: ['Almoravids', ['SAHARA_S', 'SAHARA_N', 'DRAA', 'TAFILALT', 'SOUS']] }),
  S(1058, 'Aghmat taken; war on the Barghawata', { almoravid: ['Almoravids', ['SAHARA_S', 'SAHARA_N', 'DRAA', 'TAFILALT', 'SOUS', 'HAOUZ', 'ATLAS']] }),
  S(1060, 'The Atlantic plains and the Tadla', { almoravid: ['Almoravids', ['SAHARA_S', 'SAHARA_N', 'DRAA', 'TAFILALT', 'SOUS', 'HAOUZ', 'ATLAS', 'TAMESNA', 'DOUKKALA', 'TADLA', 'GHARB']] }),
  S(1069, 'Yusuf ibn Tashfin takes Fez', { almoravid: ['Almoravids', ['SAHARA_S', 'SAHARA_N', 'DRAA', 'TAFILALT', 'SOUS', 'HAOUZ', 'ATLAS', 'TAMESNA', 'DOUKKALA', 'TADLA', 'GHARB', 'SAIS']] }),
  S(1081, 'Tlemcen taken; Algiers next (1082)', { almoravid: ['Almoravids', minus(ALM_1083, 'TING', 'RIF_W')] }),
  S(1083, 'Ceuta taken: all of Morocco', { almoravid: ['Almoravids', ALM_1083] }),
  S(1091, 'Granada, Seville and Córdoba taken', { almoravid: ['Almoravids', ALM_1083], andalus: ['al-Andalus (Almoravid)', ['AND_S', 'AND_MUR']] }),
  S(1094, 'Badajoz taken', { almoravid: ['Almoravids', ALM_1083], andalus: ['al-Andalus (Almoravid)', ['AND_S', 'AND_MUR', 'AND_W']] }),
  S(1102, 'Valencia taken', { almoravid: ['Almoravids', ALM_1083], andalus: ['al-Andalus (Almoravid)', ['AND_S', 'AND_MUR', 'AND_W', 'AND_VAL']] }),
  S(1110, 'Zaragoza taken', { almoravid: ['Almoravids', ALM_1083], andalus: ['al-Andalus (Almoravid)', ['AND_S', 'AND_MUR', 'AND_W', 'AND_VAL', 'AND_NE']] }),
  S(1111, 'Santarém and Lisbon taken', { almoravid: ['Almoravids', ALM_1083], andalus: ['al-Andalus (Almoravid)', ['AND_S', 'AND_MUR', 'AND_W', 'AND_VAL', 'AND_NE', 'AND_LIS']] }),
  S(1116, 'Majorca taken after the Pisan–Catalan raid', { almoravid: ['Almoravids', ALM_1083], andalus: ['al-Andalus (Almoravid)', ['AND_S', 'AND_MUR', 'AND_W', 'AND_VAL', 'AND_NE', 'AND_LIS']], baleares: ['Majorca', ['BAL']] }),
  S(1118, 'Aragon takes Zaragoza', { almoravid: ['Almoravids', ALM_1083], andalus: ['al-Andalus (Almoravid)', ['AND_S', 'AND_MUR', 'AND_W', 'AND_VAL', 'AND_LIS']], baleares: ['Majorca', ['BAL']] }),
  S(1124, 'Ibn Tumart’s Almohads hold the High Atlas', { almoravid: ['Almoravids', minus(ALM_1083, 'ATLAS')], andalus: ['al-Andalus (Almoravid)', ['AND_S', 'AND_MUR', 'AND_W', 'AND_VAL', 'AND_LIS']], baleares: ['Majorca', ['BAL']] }),
  S(1145, 'Tlemcen falls; al-Andalus breaks into taifas', { almoravid: ['Almoravids', ['HAOUZ', 'TAMESNA', 'DOUKKALA', 'TADLA', 'GHARB', 'SAIS', 'RIF_E', 'TING', 'RIF_W']], sahara: ['Almoravids (Sahara)', ['SAHARA_S', 'SAHARA_N']], andalus: ['al-Andalus (Almoravid)', ['AND_S']], baleares: ['Majorca', ['BAL']] }),
  S(1146, 'The Almohads take Fez', { almoravid: ['Almoravids', ['HAOUZ', 'TAMESNA', 'DOUKKALA', 'TADLA']], sahara: ['Almoravids (Sahara)', ['SAHARA_S', 'SAHARA_N']], andalus: ['al-Andalus (Almoravid)', ['AND_S']], baleares: ['Majorca', ['BAL']] }),
  S(1147, 'Marrakesh falls; the Banu Ghaniya hold Majorca', { baleares: ['Majorca (Banu Ghaniya)', ['BAL']] }),
  S(1202, 'The Almohads take Majorca (1203)', { baleares: ['Majorca (Banu Ghaniya)', ['BAL']] }),
]);

// ---- Almohads, c. 1124–1269 --------------------------------------------------------------------------

const AMH_1146 = ['ATLAS', 'SOUS', 'DRAA', 'TAFILALT', 'EAST', 'ALG_W', 'SAIS', 'GHARB', 'TING', 'RIF_W', 'RIF_E'];
const AMH_1149 = [...AMH_1146, 'HAOUZ', 'TADLA', 'TAMESNA', 'DOUKKALA'];
const AMH_1160 = [...AMH_1149, 'ALG_C', 'ALG_E', 'IFR', 'TRIP'];
const AMH_AND = ['AND_S', 'AND_W', 'AND_MUR', 'AND_VAL'];
const AMH_1229 = minus(AMH_1160, 'ALG_C', 'ALG_E', 'IFR', 'TRIP');
const almohad = build({
  id: 'almohad-caliphate', name: 'Almohad Caliphate', color: '#1D4ED8', type: 'empire',
  description: 'A religious movement of the Masmuda Berbers of the High Atlas, founded by the preacher Ibn Tumart, who declared himself the Mahdi and made Tinmel his base (c. 1124). His successor Abd al-Mu’min took Marrakesh in 1147 and proclaimed himself caliph; by 1160 the Almohads ruled from the Atlantic to Tripoli and most of al-Andalus — the only time the whole Maghreb was ruled from Morocco. They built the Koutoubia, the Hassan Tower and the Giralda. After the defeat at Las Navas de Tolosa (1212) the empire split apart; the Marinids took Marrakesh in 1269.',
  timelineItemIds: ['morocco-almoravid-almohad'], confidence: CONF.dynasty,
  sources: [W('Almohad Caliphate'), W('Ibn Tumart'), W('Abd al-Mu\'min'), W('Battle of Las Navas de Tolosa'), UNESCO('Medina of Marrakesh', 331), ABUN_NASR],
}, [
  S(1124, 'Ibn Tumart, the Mahdi, at Tinmel', { almohad: ['Almohads', ['ATLAS']] }),
  S(1130, 'Abd al-Mu’min succeeds Ibn Tumart', { almohad: ['Almohads', ['ATLAS']] }),
  S(1145, 'The Almohads take Tlemcen', { almohad: ['Almohads', ['ATLAS', 'SOUS', 'DRAA', 'TAFILALT', 'EAST', 'ALG_W']] }),
  S(1146, 'The Almohads take Fez', { almohad: ['Almohads', AMH_1146] }),
  S(1147, 'Marrakesh taken; Abd al-Mu’min caliph; Seville', { almohad: ['Almohad Caliphate', [...AMH_1146, 'HAOUZ', 'TADLA']], andalus: ['al-Andalus (Almohad)', ['AND_S', 'AND_W']] }),
  S(1149, 'Revolts crushed on the Atlantic plains', { almohad: ['Almohad Caliphate', AMH_1149], andalus: ['al-Andalus (Almohad)', ['AND_S', 'AND_W']] }),
  S(1152, 'Béjaïa taken from the Hammadids', { almohad: ['Almohad Caliphate', [...AMH_1149, 'ALG_C', 'ALG_E']], andalus: ['al-Andalus (Almohad)', ['AND_S', 'AND_W']] }),
  S(1160, 'Mahdia taken: the Maghreb united to Tripoli', { almohad: ['Almohad Caliphate', AMH_1160], andalus: ['al-Andalus (Almohad)', ['AND_S', 'AND_W']] }),
  S(1172, 'Murcia and Valencia (Ibn Mardanish dies)', { almohad: ['Almohad Caliphate', AMH_1160], andalus: ['al-Andalus (Almohad)', AMH_AND] }),
  S(1203, 'Majorca taken from the Banu Ghaniya', { almohad: ['Almohad Caliphate', AMH_1160], andalus: ['al-Andalus (Almohad)', AMH_AND], baleares: ['Majorca', ['BAL']] }),
  S(1212, 'Defeat at Las Navas de Tolosa', { almohad: ['Almohad Caliphate', AMH_1160], andalus: ['al-Andalus (Almohad)', AMH_AND], baleares: ['Majorca', ['BAL']] }),
  S(1228, 'Al-Ma’mun leaves al-Andalus', { almohad: ['Almohad Caliphate', AMH_1160], baleares: ['Majorca', ['BAL']] }),
  S(1229, 'Aragon takes Majorca; the Hafsids break away', { almohad: ['Almohad Caliphate', AMH_1229] }),
  S(1236, 'The Zayyanids take Tlemcen', { almohad: ['Almohads', minus(AMH_1229, 'ALG_W')] }),
  S(1245, 'The Marinids take the east', { almohad: ['Almohads', minus(AMH_1229, 'ALG_W', 'EAST', 'RIF_E')] }),
  S(1248, 'The Marinids take Fez', { almohad: ['Almohads', ['ATLAS', 'SOUS', 'DRAA', 'TAFILALT', 'HAOUZ', 'TADLA', 'TAMESNA', 'DOUKKALA']] }),
  S(1268, 'The Marinids take Marrakesh (1269)', { almohad: ['Almohads', ['ATLAS', 'SOUS', 'DRAA', 'TAFILALT', 'HAOUZ', 'TADLA', 'TAMESNA', 'DOUKKALA']] }),
]);

// ---- Marinids, 1245–1465 -----------------------------------------------------------------------------

const MRN = ['EAST', 'RIF_E', 'SAIS', 'GHARB', 'RIF_W', 'HAOUZ', 'ATLAS', 'SOUS', 'DRAA', 'TADLA', 'TAMESNA', 'DOUKKALA'];
const MRN_1274 = [...MRN, 'TING', 'TAFILALT'];
const marinid = build({
  id: 'marinid-sultanate', name: 'Marinid Sultanate', color: '#BE123C', type: 'state',
  description: 'A Zenata Berber dynasty from the steppes of the east that rose as the Almohads weakened, taking Fez in 1248 and Marrakesh in 1269. The Marinids built Fez el-Jdid (1276), filled Fez with madrasas, and twice tried to reunite the Maghreb: Abu al-Hasan took Tlemcen (1337) and Tunis (1347) but was routed at Kairouan, and Abu Inan briefly retook the east (1352–1358). Portugal took Ceuta in 1415. Their Wattasid regents held real power from 1420; the last Marinid sultan was killed in the Fez revolt of 1465.',
  timelineItemIds: ['morocco-marinids-saadis'], confidence: CONF.dynasty,
  sources: [W('Marinid Sultanate'), W('Abu al-Hasan Ali ibn Othman'), W('Abu Inan Faris'), W('Fes Jdid'), UNESCO('Medina of Fez', 170), ABUN_NASR],
}, [
  S(1245, 'The Banu Marin take the east', { marinid: ['Marinids', ['EAST', 'RIF_E']] }),
  S(1248, 'The Marinids take Fez', { marinid: ['Marinids', ['EAST', 'RIF_E', 'SAIS', 'GHARB', 'RIF_W']] }),
  S(1269, 'Marrakesh taken; the Almohads end', { marinid: ['Marinid Sultanate', MRN] }),
  S(1274, 'Tangier and Sijilmasa taken', { marinid: ['Marinid Sultanate', MRN_1274] }),
  S(1276, 'Fez el-Jdid founded', { marinid: ['Marinid Sultanate', MRN_1274] }),
  S(1337, 'Abu al-Hasan takes Tlemcen', { marinid: ['Marinid Sultanate', [...MRN_1274, 'ALG_W']] }),
  S(1347, 'Abu al-Hasan takes Tunis', { marinid: ['Marinid Sultanate', [...MRN_1274, 'ALG_W', 'ALG_C', 'ALG_E', 'IFR']] }),
  S(1348, 'Routed at Kairouan; the east lost', { marinid: ['Marinid Sultanate', MRN_1274] }),
  S(1352, 'Abu Inan retakes Tlemcen and Béjaïa', { marinid: ['Marinid Sultanate', [...MRN_1274, 'ALG_W', 'ALG_C']] }),
  S(1359, 'Tlemcen restored to the Zayyanids', { marinid: ['Marinid Sultanate', MRN_1274] }),
  S(1420, 'The Wattasid viziers rule for the sultans', { marinid: ['Marinid Sultanate', MRN_1274] }),
  S(1465, 'Abd al-Haqq II killed in the Fez revolt', { marinid: ['Marinid Sultanate', MRN_1274] }),
]);

// ---- Wattasids, 1472–1549 --------------------------------------------------------------------------------

const WAT = ['TING', 'GHARB', 'RIF_W', 'RIF_E', 'SAIS', 'EAST', 'TADLA', 'TAMESNA'];
const wattasid = build({
  id: 'wattasid-sultanate', name: 'Wattasid Sultanate', color: '#4D7C0F', type: 'state',
  description: 'Kinsmen of the Marinids who had ruled as their viziers; Muhammad al-Shaykh took Fez in 1472 and made himself sultan. The Wattasids held the north while Portugal seized the Atlantic ports and the Saadians rose in the south; the Treaty of Tadla (1527) split Morocco between them. The Saadians took Fez in 1549, and a last Wattasid return with Ottoman help (1554) lasted months.',
  timelineItemIds: ['morocco-marinids-saadis'], confidence: CONF.dynasty,
  sources: [W('Wattasid dynasty'), W('Treaty of Tadla'), ABUN_NASR],
}, [
  S(1472, 'Muhammad al-Shaykh takes Fez', { wattasid: ['Wattasid Sultanate', WAT] }),
  S(1527, 'Treaty of Tadla: the Saadians hold the south', { wattasid: ['Wattasid Sultanate', WAT] }),
  S(1548, 'The Saadians take Fez (1549)', { wattasid: ['Wattasid Sultanate', WAT] }),
]);

// ---- Saadians, 1510–1659 ------------------------------------------------------------------------------

const SAADI = ['SOUS', 'DRAA', 'ATLAS', 'HAOUZ', 'DOUKKALA', 'TAFILALT', ...WAT];
const SAADI_1614 = minus(SAADI, 'SOUS', 'DRAA');
const saadi = build({
  id: 'saadi-sultanate', name: 'Saadi Sultanate', color: '#9333EA', type: 'state',
  description: 'A sharifian family from the Draa valley, proclaimed leaders of the holy war against the Portuguese in the Sous in 1510. They took Marrakesh (1524–25), Agadir from Portugal (1541) and Fez (1549). Ahmad al-Mansur, after the victory over Portugal at the Battle of the Three Kings (1578), sent an army across the Sahara to conquer Songhai (1591) and built the El Badi palace. After his death in 1603 his sons fought for the throne; marabouts took the Sous, the Middle Atlas and Salé, and the last Saadian sultan was killed in 1659.',
  timelineItemIds: ['morocco-marinids-saadis'], confidence: CONF.sharifian,
  sources: [W('Saadi Sultanate'), W('Ahmad al-Mansur'), W('Battle of Alcácer Quibir'), W('Treaty of Tadla'), UNESCO('Medina of Marrakesh', 331), ABUN_NASR],
}, [
  S(1510, 'Proclaimed in the Sous to fight Portugal', { saadi: ['Saadians', ['SOUS', 'DRAA']] }),
  S(1525, 'The Saadians take Marrakesh', { saadi: ['Saadians', ['SOUS', 'DRAA', 'ATLAS', 'HAOUZ']] }),
  S(1527, 'Treaty of Tadla: the south is Saadian', { saadi: ['Saadians', ['SOUS', 'DRAA', 'ATLAS', 'HAOUZ', 'DOUKKALA']] }),
  S(1537, 'The Saadians take the Tafilalt', { saadi: ['Saadians', ['SOUS', 'DRAA', 'ATLAS', 'HAOUZ', 'DOUKKALA', 'TAFILALT']] }),
  S(1549, 'The Saadians take Fez', { saadi: ['Saadi Sultanate', SAADI] }),
  S(1578, 'Battle of the Three Kings; Ahmad al-Mansur', { saadi: ['Saadi Sultanate', SAADI] }),
  S(1591, 'Al-Mansur’s army conquers Songhai', { saadi: ['Saadi Sultanate', SAADI] }),
  S(1603, 'Al-Mansur dies; his sons fight for the throne', { saadi: ['Saadi Sultanate', SAADI] }),
  S(1614, 'Tazerwalt takes the Sous', { saadi: ['Saadi Sultanate', SAADI_1614] }),
  S(1631, 'The Alaouites proclaimed in the Tafilalt', { saadi: ['Saadi Sultanate', minus(SAADI_1614, 'TAFILALT')] }),
  S(1638, 'The zawiya of Dila takes the Middle Atlas', { saadi: ['Saadi Sultanate', minus(SAADI_1614, 'TAFILALT', 'TADLA')] }),
  S(1641, 'Dila takes Fez, Meknes and Salé', { saadi: ['Saadians (Marrakesh)', ['HAOUZ', 'ATLAS', 'DOUKKALA']] }),
  S(1658, 'The last Saadian sultan is killed (1659)', { saadi: ['Saadians (Marrakesh)', ['HAOUZ', 'ATLAS', 'DOUKKALA']] }),
]);

// ---- The crisis of the 1600s: Tazerwalt, Dila, Salé -------------------------------------------------------

const tazerwalt = build({
  id: 'tazerwalt', name: 'Tazerwalt (Iligh)', color: '#127A8A', type: 'state',
  description: 'A marabout state of the Anti-Atlas, ruled from Iligh by Sidi Ali Bou Dmia (Abu Hassun), grandson of the saint Sidi Ahmed Ou Moussa, who took the Sous and the port of Agadir in the chaos after 1603. At its height it reached the Draa valley, Sijilmasa and the Saharan trade towns. The Alaouites razed Iligh in 1670.',
  timelineItemIds: ['morocco-sale-dila'], confidence: CONF.crisis,
  sources: [W('Tazerwalt'), W('Alawi dynasty')],
}, [
  S(1614, 'Sidi Ali Bou Dmia, amir of Tazerwalt', { tazerwalt: ['Tazerwalt (Iligh)', ['SOUS', 'DRAA']] }),
  S(1640, 'Tazerwalt at its height', { tazerwalt: ['Tazerwalt (Iligh)', ['SOUS', 'DRAA']] }),
  S(1669, 'The Alaouites raze Iligh (1670)', { tazerwalt: ['Tazerwalt (Iligh)', ['SOUS', 'DRAA']] }),
]);

const dila = build({
  id: 'dila-zawiya', name: 'Zawiya of Dila', color: '#65A30D', type: 'state',
  description: 'A Sufi lodge of the Middle Atlas whose Sanhaja Berber followers became the strongest power in Morocco in the 1640s. From its new zawiya (1638) it took Meknes, Fez and Salé by 1641, ruling the north-west plains, Tétouan and the Taza corridor. Salé rebelled in 1660 and Fez in 1662; the Alaouite al-Rashid destroyed Dila in June 1668.',
  timelineItemIds: ['morocco-sale-dila'], confidence: CONF.crisis,
  sources: [W('Zawiya Dila\'iya'), W('Alawi dynasty'), ABUN_NASR],
}, [
  S(1638, 'The second zawiya of Dila founded', { dila: ['Dila', ['TADLA']] }),
  S(1641, 'Dila takes Meknes, Fez and Salé', { dila: ['Dila', ['TADLA', 'SAIS', 'GHARB', 'TING']] }),
  S(1659, 'Mohammed al-Hajj proclaimed sultan in Fez', { dila: ['Dila', ['TADLA', 'SAIS', 'GHARB', 'TING']] }),
  S(1661, 'Salé and the north-west lost', { dila: ['Dila', ['TADLA', 'SAIS']] }),
  S(1662, 'Fez lost', { dila: ['Dila', ['TADLA']] }),
  S(1667, 'Al-Rashid destroys Dila (1668)', { dila: ['Dila', ['TADLA']] }),
]);

const sale = buildEnclaves({
  id: 'republic-of-sale', name: 'Republic of Salé', color: '#0891B2', type: 'state',
  description: 'A corsair republic at the mouth of the Bou Regreg, founded by Moriscos expelled from Spain (the Hornacheros) who threw off the sultan’s rule in 1627. Its "Salé rovers" raided shipping as far as Iceland and Cornwall. It came under Dila in 1641 and was taken by the Alaouites in 1668.',
  timelineItemIds: ['morocco-sale-dila', 'morocco-marinids-saadis'], confidence: CONF.crisis,
  sources: [W('Republic of Salé'), W('Salé Rovers'), UNESCO('Rabat, Modern Capital and Historic City', 1401)],
}, [[1627, 'The Republic of Salé'], [1641, 'Salé under Dila'], [1667, 'The Alaouites take Salé (1668)']]);

// ---- Alaouites, 1631–1815 ------------------------------------------------------------------------------

const ALA = [...MOROCCO];
const alaouite = build({
  id: 'alaouite-sultanate', name: 'Alaouite Sultanate', color: '#D9381E', type: 'state',
  description: 'A sharifian family of the Tafilalt, proclaimed there in 1631, who reunited Morocco: al-Rashid took Fez (1666), destroyed Dila and took Marrakesh (1668) and the Sous (1670). Moulay Ismail (1672–1727) made Meknes his imperial city, raised the slave army of the Abid al-Bukhari, and took back Mamora, Larache and Asilah from Spain and Tangier from England. Mohammed III founded Mogador (Essaouira), drove Portugal from Mazagan (1769) and recognised the United States (1777). The dynasty still reigns.',
  nameAt: [[1631, 'Alaouites (Tafilalt)'], [1666, 'Alaouite Sultanate']],
  timelineItemIds: ['morocco-alaouite-sultanate', 'morocco-sale-dila'], confidence: CONF.sharifian,
  sources: [W('Alawi dynasty'), W('Al-Rashid of Morocco'), W('Ismail Ibn Sharif'), W('Mohammed ben Abdallah'), UNESCO('Historic City of Meknes', 793), UNESCO('Medina of Essaouira (formerly Mogador)', 753)],
}, [
  S(1631, 'Mawlay al-Sharif proclaimed in the Tafilalt', { alaouite: ['Alaouites (Tafilalt)', ['TAFILALT']] }),
  S(1664, 'Al-Rashid takes Taza and the east', { alaouite: ['Alaouites', ['TAFILALT', 'EAST']] }),
  S(1666, 'Al-Rashid takes Fez', { alaouite: ['Alaouite Sultanate', ['TAFILALT', 'EAST', 'SAIS', 'RIF_E']] }),
  S(1668, 'Dila destroyed; Marrakesh and Salé taken', { alaouite: ['Alaouite Sultanate', minus(ALA, 'SOUS', 'DRAA')] }),
  S(1670, 'The Sous taken; Iligh razed', { alaouite: ['Alaouite Sultanate', ALA] }),
  S(1672, 'Moulay Ismail; Meknes the imperial city', { alaouite: ['Alaouite Sultanate', ALA] }),
  S(1727, 'Moulay Ismail dies; thirty years of strife', { alaouite: ['Alaouite Sultanate', ALA] }),
  S(1757, 'Mohammed III', { alaouite: ['Alaouite Sultanate', ALA] }),
  S(1815, 'Moulay Slimane', { alaouite: ['Alaouite Sultanate', ALA] }),
]);

// ---- The coastal enclaves -----------------------------------------------------------------------------

const portugueseMorocco = buildEnclaves({
  id: 'portuguese-morocco', name: 'Portuguese Morocco', color: '#1E40AF', type: 'state',
  description: 'Portugal’s fortified ports on the Moroccan coast, starting with the conquest of Ceuta in 1415: Ksar es-Seghir (1458), Asilah and Tangier (1471), then Agadir, Safi, Azemmour and Mazagan in the 1500s. Saadian attacks forced Portugal out of Agadir (1541), Safi and Azemmour (1541), and Asilah and Ksar es-Seghir (1550). Ceuta stayed with Spain after 1640, Tangier went to England as Catherine of Braganza’s dowry (1661–62), and Mazagan, the last, was abandoned in 1769.',
  timelineItemIds: ['morocco-enclaves', 'morocco-marinids-saadis'], confidence: CONF.enclave,
  sources: [W('Portuguese Morocco'), W('Conquest of Ceuta'), W('Portuguese Tangier'), W('Mazagan'), UNESCO('Portuguese City of Mazagan (El Jadida)', 1058)],
}, [[1415, 'Portugal takes Ceuta'], [1458, 'Ksar es-Seghir taken'], [1471, 'Asilah and Tangier taken'], [1505, 'Forts down the Atlantic coast'], [1541, 'Agadir, Safi and Azemmour lost'], [1550, 'Asilah and Ksar es-Seghir given up'], [1640, 'Ceuta stays with Spain'], [1662, 'Tangier goes to England'], [1768, 'Mazagan abandoned (1769)']]);

const spanishPresidios = buildEnclaves({
  id: 'spanish-presidios', name: 'Spanish presidios', color: '#CA8A04', type: 'state',
  description: 'Spain’s fortified towns on the Moroccan coast: Melilla (1497), Larache (1610–1689) and La Mamora (1614–1681), and Ceuta, which chose to stay with Spain when Portugal broke away in 1640 (confirmed in 1668). Moulay Ismail retook Mamora and Larache; Ceuta and Melilla are still Spanish.',
  timelineItemIds: ['morocco-enclaves'], confidence: CONF.enclave,
  sources: [W('Melilla'), W('Ceuta'), W('La Mamora'), W('Larache'), W('Plazas de soberanía')],
}, [[1497, 'Spain takes Melilla'], [1610, 'Larache handed to Spain'], [1614, 'Spain takes La Mamora'], [1640, 'Ceuta stays with Spain'], [1681, 'Moulay Ismail retakes La Mamora'], [1689, 'Moulay Ismail retakes Larache'], [1815, 'Ceuta and Melilla']]);

const englishTangier = buildEnclaves({
  id: 'english-tangier', name: 'English Tangier', color: '#E11D48', type: 'state',
  description: 'Tangier came to Charles II as part of Catherine of Braganza’s dowry and was held by an English garrison from 1662. Besieged by Moulay Ismail’s armies and too costly to keep, it was abandoned in 1684, the English blowing up the mole and walls as they left.',
  timelineItemIds: ['morocco-enclaves'], confidence: CONF.enclave,
  sources: [W('English Tangier'), W('Tangier Garrison')],
}, [[1662, 'English Tangier'], [1680, 'The great siege of Tangier'], [1683, 'England abandons Tangier (1684)']]);

export const moroccoPolities = [
  mauretania, romanMauretania, barghawata, idrisid, nekor, midrarids, maghrawa, banuIfran,
  almoravid, almohad, marinid, wattasid, saadi, tazerwalt, dila, sale, alaouite,
  portugueseMorocco, spanishPresidios, englishTangier,
];

// ---- Fixes to older shapes over Morocco -------------------------------------------------------------------
//
// The Roman Empire's single 'mediterranean' outline swept across Morocco and western Algeria in
// every keyframe. Mauretania is now drawn by its own kingdom and provinces above, so Rome's west is
// split off into two regions that are the same in every keyframe (so they never morph): Hispania
// (the Iberian peninsula, simplified from src/data/nations.topo.json) and Africa and Numidia (the
// Ampsaga to the Gulf of Gabès: the ALG_E and IFR pieces, sharing their border with Mauretania
// Caesariensis). The 'mediterranean' ring keeps its east and north but its west edge now runs
// through the sea east of Sardinia and Tunisia and along the Pyrenees, well clear of Mauretania
// even mid-morph. `[African vertex kept, first vertex kept after Iberia]` by keyframe.
const HISPANIA = [[3.18, 42.43], [3.32, 42.32], [3.15, 42.26], [3.23, 41.97], [3.15, 41.85], [2.3, 41.46], [2.06, 41.27], [0.99, 41.04], [0.7, 40.79], [0.85, 40.67], [0.6, 40.61], [-0.32, 39.52], [-0.21, 39.08], [0.23, 38.73], [-0.51, 38.34], [-0.51, 38.21], [-0.61, 38.18], [-0.85, 37.72], [-0.7, 37.62], [-1.32, 37.56], [-1.64, 37.38], [-2.13, 36.74], [-2.36, 36.84], [-2.76, 36.68], [-2.93, 36.75], [-4.4, 36.72], [-4.72, 36.49], [-5.19, 36.41], [-5.34, 36.14], [-5.43, 36.18], [-5.45, 36.06], [-5.61, 36.01], [-6.04, 36.19], [-6.23, 36.58], [-6.4, 36.64], [-6.44, 36.75], [-6.23, 36.9], [-6.39, 36.81], [-6.89, 37.17], [-7.41, 37.19], [-7.82, 37], [-8.63, 37.12], [-9, 37.02], [-8.81, 37.45], [-8.8, 37.83], [-8.89, 37.95], [-8.78, 38.19], [-8.8, 38.36], [-8.94, 38.48], [-8.66, 38.41], [-8.96, 38.51], [-9.2, 38.41], [-9.49, 38.71], [-9.35, 39.37], [-9.09, 39.58], [-8.79, 40.52], [-8.64, 40.69], [-8.88, 41.74], [-8.75, 41.97], [-8.87, 41.89], [-8.9, 42.1], [-8.62, 42.3], [-8.87, 42.26], [-8.66, 42.43], [-8.87, 42.42], [-8.73, 42.69], [-9.01, 42.53], [-9.07, 42.6], [-8.9, 42.79], [-9.14, 42.81], [-9.14, 42.92], [-9.29, 42.92], [-9.28, 43.05], [-8.84, 43.34], [-8.69, 43.29], [-8.33, 43.41], [-8.31, 43.57], [-7.91, 43.77], [-7.37, 43.68], [-7.03, 43.55], [-7.05, 43.48], [-7, 43.56], [-5.81, 43.65], [-5.71, 43.57], [-4.38, 43.38], [-3.56, 43.52], [-3.5, 43.43], [-3.15, 43.36], [-2.76, 43.45], [-2.13, 43.29], [-1.79, 43.39], [0.7, 42.85], [3.18, 42.43]];
const ROMAN_WEST = [[11.4, 33.6], [11.6, 35.6], [11.3, 37.3], [10.0, 38.4], [7.9, 38.9], [7.9, 41.0], [5.5, 42.3], [3.18, 42.43], [0.7, 42.85], [-1.79, 43.39]];
export const moroccoShapeFixes = {
  'roman-empire': {
    '-27': { mediterranean: [[12, 33], [4, 44]] },
    50: { mediterranean: [[14, 32], [-4, 50]] },
    117: { mediterranean: [[16, 26], [-4, 52]] },
    200: { mediterranean: [[18, 26], [-4, 52]] },
    395: { mediterranean: [[16, 30], [-1, 46]] },
  },
};
/** Sea vertices of the redrawn Roman edge (the pack check skips its land test for these). */
export const MOROCCO_SEA_FIX_POINTS = ROMAN_WEST.slice(1, 7);
const ROMAN_AFRICA = mergeRings('roman-empire africa', PC.ALG_E, PC.IFR);

/**
 * Apply the fixes (runs after the packs are appended). The French "Maghreb" shape first appears in
 * 1830 and used to grow over Morocco from 1700; an 1814 copy of its 1700 keyframe stops that
 * (from 1815 the nations layer draws Morocco).
 */
export function applyMoroccoShapeFixes(entities) {
  const find = (id) => {
    const e = entities.find((x) => x.id === id);
    if (!e) throw new Error(`morocco fixes: no entity ${id}`);
    return e;
  };
  for (const [id, years] of Object.entries(moroccoShapeFixes)) {
    const ent = find(id);
    for (const [year, regions] of Object.entries(years)) {
      const kf = ent.overlays.find((o) => o.year === Number(year));
      if (!kf) throw new Error(`morocco fixes: ${id} has no ${year} keyframe`);
      for (const [rid, [from, to]] of Object.entries(regions)) {
        const i = kf.regions.findIndex((r) => typeof r !== 'string' && r.id === rid);
        if (i < 0) throw new Error(`morocco fixes: ${id} ${year} has no inline region ${rid}`);
        const ring = kf.regions[i].ring.slice(0, -1);
        if (ring.some((p) => p[0] === ROMAN_WEST[0][0] && p[1] === ROMAN_WEST[0][1])) continue;
        const at = (q) => ring.findIndex((p) => p[0] === q[0] && p[1] === q[1]);
        const k = at(from);
        const m = at(to);
        if (k < 0 || m < 0) throw new Error(`morocco fixes: ${id} ${year} ${rid} lacks ${from} or ${to}`);
        const n = ring.length;
        const rot = [...ring.slice(k), ...ring.slice(0, k)];
        const out = [rot[0], ...ROMAN_WEST, ...rot.slice((m - k + n) % n)];
        // The ring no longer wraps the western basin, so its sea hole goes (the eastern one stays).
        const holes = (kf.regions[i].holes || []).filter((h) => h !== 'mediterranean-west');
        kf.regions[i] = { ...kf.regions[i], ring: ensureClockwise([...out, out[0]]), holes };
        if (!holes.length) delete kf.regions[i].holes;
        delete kf.regions[i].bbox;
        kf.regions = [
          ...kf.regions,
          { id: 'hispania', name: 'Hispania', ring: ensureClockwise(HISPANIA) },
          { id: 'africa-numidia', name: 'Africa and Numidia', ring: ensureClockwise(ROMAN_AFRICA) },
        ];
      }
    }
  }
  const fr = find('french-colonial');
  if (!fr.overlays.some((o) => o.year === 1814)) {
    const k1700 = fr.overlays.find((o) => o.year === 1700);
    if (!k1700) throw new Error('morocco fixes: french-colonial has no 1700 keyframe');
    const at = fr.overlays.findIndex((o) => o.year > 1814);
    fr.overlays.splice(at < 0 ? fr.overlays.length : at, 0, { ...k1700, year: 1814 });
  }
}
