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
// KZ_S Turkistan and Zhambyl (Isfijab, Otrar, Taraz) · BALKH Balkh, Jowzjan, Samangan, Faryab,
// Sar-e Pol · HERAT Herat and Badghis · KHOR_IR Razavi, North and South Khorasan ·
// IRAQ_AJAM Semnan, Tehran (Rayy), Qazvin, Qom, Markazi, Hamadan.
export const UZ_PIECES = {
  XO: [[60.141, 41.874], [60.459, 41.967], [60.55, 41.777], [61.269, 41.302], [61.446, 41.386], [61.864, 41.285], [62.239, 40.999], [62.447, 40.788], [62.187, 40.506], [61.878, 41.125], [61.47, 41.297], [61.281, 41.157], [61.004, 41.23], [60.415, 41.235], [60.094, 41.39], [60.141, 41.874]],
  DASH: [[60.141, 41.874], [60.094, 41.39], [60.415, 41.235], [61.004, 41.23], [60.981, 41.003], [60.248, 41.001], [60.253, 40.353], [60.492, 40.302], [60.517, 39.489], [60.002, 39.662], [59.981, 40], [59.185, 40.004], [58.988, 40.11], [58.399, 40.214], [57.885, 40.097], [57.165, 40.092], [57.029, 40.554], [56.595, 41.118], [56.534, 41.299], [57.01, 41.254], [56.95, 41.866], [57.382, 42.164], [57.85, 42.191], [57.998, 42.493], [58.494, 42.306], [58.131, 42.639], [58.493, 42.645], [58.612, 42.781], [58.894, 42.548], [59.122, 42.538], [59.478, 42.286], [59.866, 42.304], [60.028, 42.2], [59.932, 41.948], [60.141, 41.874]],
  QR: [[62.028, 43.481], [62.185, 43.314], [62.465, 43.231], [61.882, 42.397], [61.862, 42.167], [61.996, 41.98], [61.752, 41.834], [62.18, 41.392], [62.465, 41.095], [62.239, 40.999], [61.864, 41.285], [61.446, 41.386], [61.269, 41.302], [60.55, 41.777], [60.459, 41.967], [60.141, 41.874], [59.932, 41.948], [60.028, 42.2], [59.866, 42.304], [59.478, 42.286], [59.122, 42.538], [58.894, 42.548], [58.612, 42.781], [58.493, 42.645], [58.131, 42.639], [58.494, 42.306], [57.998, 42.493], [57.85, 42.191], [57.382, 42.164], [56.95, 41.866], [57.01, 41.254], [56.534, 41.299], [55.978, 41.322], [55.976, 44.994], [58.531, 45.559], [61.036, 44.383], [61.162, 44.168], [62.028, 43.481]],
  BU: [[62.187, 40.506], [62.447, 40.788], [62.239, 40.999], [62.465, 41.095], [62.18, 41.392], [62.619, 41.492], [62.979, 41.075], [63.854, 40.758], [63.985, 40.933], [64.165, 40.797], [64.802, 40.927], [64.847, 40.77], [65.317, 40.699], [65.134, 40.336], [64.85, 40.351], [64.905, 40.171], [64.59, 39.908], [64.983, 39.7], [65.138, 39.464], [64.841, 39.238], [64.879, 39.161], [64.368, 38.94], [64.121, 38.962], [63.709, 39.191], [63.478, 39.403], [62.593, 39.89], [62.453, 40.009], [62.353, 40.43], [62.187, 40.506]],
  NW: [[66.013, 42.373], [66.017, 41.998], [66.504, 41.993], [66.688, 41.199], [66.758, 41.153], [66.614, 41.084], [66.801, 40.775], [66.62, 40.495], [66.493, 40.624], [66.209, 40.538], [66.094, 40.051], [65.879, 40.016], [65.5, 40.139], [65.435, 39.906], [65.143, 39.866], [65.256, 39.492], [65.138, 39.464], [64.983, 39.7], [64.59, 39.908], [64.905, 40.171], [64.85, 40.351], [65.134, 40.336], [65.317, 40.699], [64.847, 40.77], [64.802, 40.927], [64.165, 40.797], [63.985, 40.933], [63.854, 40.758], [62.979, 41.075], [62.619, 41.492], [62.18, 41.392], [61.752, 41.834], [61.996, 41.98], [61.862, 42.167], [61.882, 42.397], [62.465, 43.231], [62.185, 43.314], [62.028, 43.481], [63.208, 43.627], [64.427, 43.547], [64.957, 43.697], [65.517, 43.297], [65.795, 42.877], [66.101, 42.99], [66.013, 42.373]],
  SA: [[67.436, 39.486], [67.359, 39.29], [66.689, 39.431], [66.089, 39.32], [65.815, 39.553], [65.256, 39.492], [65.143, 39.866], [65.435, 39.906], [65.5, 40.139], [65.879, 40.016], [66.094, 40.051], [66.209, 40.538], [66.493, 40.624], [66.62, 40.495], [66.883, 40.478], [66.94, 40.074], [67.46, 39.938], [67.295, 39.596], [67.436, 39.486]],
  QA: [[67.359, 39.29], [67.679, 39.106], [67.673, 39.003], [67.437, 38.731], [66.895, 38.274], [66.637, 37.967], [65.877, 38.273], [65.604, 38.237], [64.978, 38.612], [64.635, 38.744], [64.368, 38.94], [64.879, 39.161], [64.841, 39.238], [65.138, 39.464], [65.256, 39.492], [65.815, 39.553], [66.089, 39.32], [66.689, 39.431], [67.359, 39.29]],
  SU: [[67.673, 39.003], [68.086, 38.994], [68.153, 38.899], [68.055, 38.536], [68.361, 38.174], [68.238, 37.943], [67.829, 37.528], [67.781, 37.189], [67.482, 37.277], [67.237, 37.192], [67.006, 37.384], [66.52, 37.364], [66.519, 37.783], [66.637, 37.967], [66.895, 38.274], [67.437, 38.731], [67.673, 39.003]],
  JI: [[68.643, 40.184], [68.697, 40.112], [68.931, 40.147], [68.748, 39.826], [68.64, 39.848], [68.517, 39.548], [67.765, 39.623], [67.436, 39.486], [67.295, 39.596], [67.46, 39.938], [66.94, 40.074], [66.883, 40.478], [66.62, 40.495], [66.801, 40.775], [66.614, 41.084], [66.758, 41.153], [67.937, 41.2], [68.117, 41.067], [67.991, 40.811], [68.267, 40.663], [68.11, 40.233], [68.664, 40.282], [68.643, 40.184]],
  SI: [[69.074, 40.217], [68.643, 40.184], [68.664, 40.282], [68.11, 40.233], [68.267, 40.663], [68.593, 40.599], [68.65, 40.952], [69.106, 40.599], [69.074, 40.217]],
  TO: [[71.25, 42.198], [70.169, 41.578], [70.471, 41.405], [70.458, 41.016], [70.28, 40.878], [69.66, 40.639], [69.436, 40.803], [69.198, 40.546], [69.285, 40.195], [69.074, 40.217], [69.106, 40.599], [68.65, 40.952], [69.039, 41.22], [69.032, 41.367], [69.625, 41.668], [69.912, 41.713], [70.455, 42.094], [70.61, 42.027], [70.948, 42.248], [71.25, 42.198]],
  FA: [[72.013, 40.262], [71.673, 40.148], [71.24, 40.321], [70.959, 40.238], [70.582, 40.222], [70.354, 40.456], [70.756, 40.696], [70.931, 40.775], [71.271, 40.617], [71.582, 40.774], [71.869, 40.624], [72.222, 40.56], [72.228, 40.46], [72.013, 40.262]],
  NG: [[70.471, 41.405], [70.634, 41.468], [70.77, 41.239], [71.18, 41.108], [71.421, 41.162], [71.753, 41.447], [71.872, 41.194], [72.17, 41.169], [72.195, 41.006], [72.166, 40.907], [71.644, 40.89], [71.582, 40.774], [71.271, 40.617], [70.931, 40.775], [70.756, 40.696], [70.458, 41.016], [70.471, 41.405]],
  AN: [[73.135, 40.835], [72.586, 40.509], [72.352, 40.602], [72.228, 40.46], [72.222, 40.56], [71.869, 40.624], [71.582, 40.774], [71.644, 40.89], [72.166, 40.907], [72.195, 41.006], [72.477, 41.012], [72.619, 40.88], [73.135, 40.835]],
  SUGHD: [[70.959, 40.238], [70.525, 40.034], [69.97, 40.212], [69.314, 39.987], [69.226, 39.751], [69.3, 39.516], [69.669, 39.578], [70.206, 39.524], [70.46, 39.6], [70.656, 39.495], [70.117, 39.312], [69.666, 39.262], [69.066, 39.03], [68.775, 39.077], [68.51, 38.951], [68.153, 38.899], [68.086, 38.994], [67.673, 39.003], [67.679, 39.106], [67.359, 39.29], [67.436, 39.486], [67.765, 39.623], [68.517, 39.548], [68.64, 39.848], [68.748, 39.826], [68.931, 40.147], [68.697, 40.112], [68.643, 40.184], [69.074, 40.217], [69.285, 40.195], [69.198, 40.546], [69.436, 40.803], [69.66, 40.639], [70.28, 40.878], [70.458, 41.016], [70.756, 40.696], [70.354, 40.456], [70.582, 40.222], [70.959, 40.238]],
  HISAR: [[71.51, 39.585], [71.74, 39.448], [71.733, 39.285], [72.05, 39.369], [72.229, 39.19], [72.007, 38.885], [72.063, 38.808], [71.614, 38.64], [71.431, 38.477], [71.072, 38.6], [71.013, 38.797], [70.733, 38.804], [70.439, 38.516], [70.033, 38.724], [69.707, 38.612], [69.381, 38.328], [69.177, 38.436], [68.609, 38.328], [68.466, 37.916], [68.238, 37.943], [68.361, 38.174], [68.055, 38.536], [68.153, 38.899], [68.51, 38.951], [68.775, 39.077], [69.066, 39.03], [69.666, 39.262], [70.117, 39.312], [70.656, 39.495], [70.798, 39.385], [71.51, 39.585]],
  KHATLON: [[67.781, 37.189], [67.829, 37.528], [68.238, 37.943], [68.466, 37.916], [68.609, 38.328], [69.177, 38.436], [69.381, 38.328], [69.707, 38.612], [70.033, 38.724], [70.439, 38.516], [70.356, 38.442], [70.262, 37.939], [70.283, 37.705], [70.158, 37.541], [69.895, 37.618], [69.529, 37.586], [69.384, 37.453], [69.445, 37.236], [69.246, 37.104], [68.965, 37.329], [68.307, 37.114], [68.025, 36.926], [67.781, 37.189]],
  LEBAP: [[65.488, 37.242], [65.063, 37.233], [64.76, 37.093], [64.729, 36.851], [63.537, 36.85], [63.489, 37.344], [63.709, 37.618], [63.229, 38.06], [62.739, 38.255], [61.222, 39.501], [61.022, 39.514], [60.517, 39.489], [60.492, 40.302], [60.253, 40.353], [60.248, 41.001], [60.981, 41.003], [61.004, 41.23], [61.281, 41.157], [61.47, 41.297], [61.878, 41.125], [62.187, 40.506], [62.353, 40.43], [62.453, 40.009], [62.593, 39.89], [63.478, 39.403], [63.709, 39.191], [64.121, 38.962], [64.368, 38.94], [64.635, 38.744], [64.978, 38.612], [65.604, 38.237], [65.877, 38.273], [66.637, 37.967], [66.519, 37.783], [66.52, 37.364], [66.251, 37.36], [65.669, 37.521], [65.488, 37.242]],
  MARY: [[64.729, 36.851], [64.606, 36.461], [64.445, 36.25], [63.906, 36.032], [63.343, 35.856], [63.125, 35.86], [63.214, 35.699], [63.08, 35.437], [62.823, 35.328], [62.459, 35.282], [62.302, 35.148], [62.034, 35.424], [61.539, 35.452], [61.419, 35.546], [61.575, 35.768], [61.512, 36.073], [61.506, 36.664], [61.004, 37.353], [61.231, 37.196], [61.41, 37.288], [60.964, 37.391], [60.854, 38.096], [60.603, 38.302], [60.46, 38.754], [60.691, 38.94], [60.77, 39.247], [60.995, 39.321], [61.022, 39.514], [61.222, 39.501], [62.739, 38.255], [63.229, 38.06], [63.709, 37.618], [63.489, 37.344], [63.537, 36.85], [64.729, 36.851]],
  AHAL: [[61.27, 35.619], [61.223, 36.118], [61.075, 36.648], [60.342, 36.637], [60.019, 37.026], [59.37, 37.319], [59.352, 37.494], [58.801, 37.695], [58.372, 37.63], [58.181, 37.775], [57.735, 37.898], [57.352, 37.968], [57.138, 38.262], [56.889, 38.467], [56.572, 38.503], [56.977, 39.567], [57.101, 39.643], [56.984, 39.99], [57.165, 40.092], [57.885, 40.097], [58.399, 40.214], [58.988, 40.11], [59.185, 40.004], [59.981, 40], [60.002, 39.662], [60.517, 39.489], [61.022, 39.514], [60.995, 39.321], [60.77, 39.247], [60.691, 38.94], [60.46, 38.754], [60.603, 38.302], [60.854, 38.096], [60.964, 37.391], [61.41, 37.288], [61.231, 37.196], [61.004, 37.353], [61.506, 36.664], [61.512, 36.073], [61.575, 35.768], [61.419, 35.546], [61.27, 35.619]],
  KG_S: [[72.013, 40.262], [72.228, 40.46], [72.352, 40.602], [72.586, 40.509], [73.135, 40.835], [72.619, 40.88], [72.477, 41.012], [72.195, 41.006], [72.17, 41.169], [71.872, 41.194], [71.753, 41.447], [71.421, 41.162], [71.18, 41.108], [70.77, 41.239], [70.634, 41.468], [70.471, 41.405], [70.169, 41.578], [71.25, 42.198], [71.627, 42.203], [72.127, 42.07], [72.383, 42.206], [72.803, 42.066], [73.112, 42.139], [73.382, 42.019], [73.801, 41.958], [74.105, 41.719], [74.076, 41.565], [74.752, 41.612], [74.639, 41.377], [74.4, 41.214], [74.077, 41.153], [74.042, 40.972], [74.582, 40.56], [74.832, 40.508], [74.37, 40.106], [74.004, 40.061], [73.823, 39.806], [73.927, 39.593], [73.821, 39.468], [73.368, 39.444], [73.136, 39.353], [72.65, 39.394], [72.316, 39.329], [72.229, 39.19], [72.05, 39.369], [71.733, 39.285], [71.74, 39.448], [71.51, 39.585], [70.798, 39.385], [70.656, 39.495], [70.46, 39.6], [70.206, 39.524], [69.669, 39.578], [69.3, 39.516], [69.226, 39.751], [69.314, 39.987], [69.97, 40.212], [70.525, 40.034], [70.959, 40.238], [71.24, 40.321], [71.673, 40.148], [72.013, 40.262]],
  KG_N: [[73.801, 41.958], [73.382, 42.019], [73.112, 42.139], [72.803, 42.066], [72.383, 42.206], [72.127, 42.07], [71.627, 42.203], [71.25, 42.198], [70.948, 42.248], [70.889, 42.339], [71.003, 42.564], [71.405, 42.795], [71.848, 42.834], [72.726, 42.653], [73.505, 42.422], [73.41, 42.59], [73.634, 43.062], [74.179, 43.262], [74.714, 43], [75.179, 42.85], [75.646, 42.806], [75.807, 42.937], [76.432, 42.89], [76.957, 42.989], [77.212, 42.91], [78.496, 42.876], [79.148, 42.791], [79.426, 42.47], [79.918, 42.424], [80.21, 42.19], [80.182, 42.021], [79.843, 42.002], [79.748, 41.88], [79.304, 41.788], [78.36, 41.378], [78.231, 41.173], [78.075, 41.04], [77.475, 40.982], [77.008, 41.044], [76.767, 40.945], [76.624, 40.628], [76.314, 40.343], [76.244, 40.441], [75.682, 40.292], [75.588, 40.612], [75.194, 40.441], [74.832, 40.508], [74.582, 40.56], [74.042, 40.972], [74.077, 41.153], [74.4, 41.214], [74.639, 41.377], [74.752, 41.612], [74.076, 41.565], [74.105, 41.719], [73.801, 41.958]],
  KZ_S: [[69.171, 45.937], [74.184, 45.956], [74.056, 45.777], [74.094, 45.269], [73.847, 45.258], [73.9, 45.078], [74.54, 44.655], [74.611, 44.413], [75.149, 44.221], [75.326, 44.078], [75.273, 43.877], [75.018, 43.563], [75.428, 43.468], [75.365, 43.158], [75.807, 42.937], [75.646, 42.806], [75.179, 42.85], [74.714, 43], [74.179, 43.262], [73.634, 43.062], [73.41, 42.59], [73.505, 42.422], [72.726, 42.653], [71.848, 42.834], [71.405, 42.795], [71.003, 42.564], [70.889, 42.339], [70.948, 42.248], [70.61, 42.027], [70.455, 42.094], [69.912, 41.713], [69.625, 41.668], [69.032, 41.367], [69.039, 41.22], [68.65, 40.952], [68.593, 40.599], [68.267, 40.663], [67.991, 40.811], [68.117, 41.067], [67.937, 41.2], [66.758, 41.153], [66.688, 41.199], [66.504, 41.993], [66.017, 41.998], [66.013, 42.373], [66.184, 42.353], [66.497, 42.579], [66.736, 42.609], [67.435, 42.985], [67.924, 43.16], [67.835, 43.423], [67.939, 43.707], [68.202, 43.973], [67.607, 44.31], [67.594, 45.072], [67.292, 45.253], [67.436, 45.698], [67.276, 45.958], [69.171, 45.937]],
  BALKH: [[66.835, 35.375], [66.682, 35.215], [66.34, 35.141], [66.331, 34.957], [66.098, 34.791], [66.037, 35.063], [65.805, 35.105], [65.642, 35.27], [65.451, 35.254], [64.73, 35.213], [64.416, 35.237], [64.416, 35.418], [64.027, 35.487], [63.889, 35.713], [63.906, 36.032], [64.445, 36.25], [64.606, 36.461], [64.729, 36.851], [64.76, 37.093], [65.063, 37.233], [65.488, 37.242], [65.669, 37.521], [66.251, 37.36], [66.52, 37.364], [67.006, 37.384], [67.237, 37.192], [67.482, 37.277], [67.781, 37.189], [68.025, 36.926], [68.189, 36.593], [68.371, 36.264], [68.516, 36.178], [68.164, 35.69], [68.089, 35.461], [67.599, 35.47], [67.017, 35.352], [66.835, 35.375]],
  HERAT: [[62.823, 35.328], [63.08, 35.437], [63.214, 35.699], [63.125, 35.86], [63.343, 35.856], [63.906, 36.032], [63.889, 35.713], [64.027, 35.487], [64.416, 35.418], [64.416, 35.237], [64.73, 35.213], [65.047, 34.94], [64.966, 34.765], [64.476, 34.671], [64.47, 34.486], [64.194, 34.465], [64.201, 34.272], [63.85, 34.22], [63.493, 34.268], [63.388, 34.074], [63.577, 33.795], [63.45, 33.652], [63.075, 33.533], [63.14, 33.319], [63.041, 33.176], [62.397, 32.997], [62.352, 32.845], [62.032, 32.787], [61.672, 32.901], [61.844, 33.167], [61.847, 33.476], [61.452, 33.46], [60.92, 33.513], [60.512, 33.638], [60.488, 34.081], [60.644, 34.307], [60.89, 34.319], [60.7, 34.516], [60.948, 34.638], [61.065, 34.815], [61.108, 35.278], [61.27, 35.619], [61.419, 35.546], [61.539, 35.452], [62.034, 35.424], [62.302, 35.148], [62.459, 35.282], [62.823, 35.328]],
  KHOR_IR: [[58.148, 32.749], [57.782, 32.997], [57.642, 33.544], [57.56, 33.653], [57.106, 33.624], [57.005, 34.143], [57.199, 34.558], [57.692, 34.867], [57.671, 34.994], [57.38, 35.177], [57.017, 35.148], [56.21, 34.906], [56.614, 35.221], [56.825, 35.286], [57.087, 35.7], [56.785, 35.919], [56.672, 36.643], [56.318, 36.665], [56.067, 36.882], [56.077, 37.075], [55.867, 37.354], [56.248, 37.573], [56.167, 38.081], [56.436, 38.255], [57.038, 38.187], [57.138, 38.262], [57.352, 37.968], [57.735, 37.898], [58.181, 37.775], [58.372, 37.63], [58.801, 37.695], [59.352, 37.494], [59.37, 37.319], [60.019, 37.026], [60.342, 36.637], [61.075, 36.648], [61.223, 36.118], [61.27, 35.619], [61.108, 35.278], [61.065, 34.815], [60.948, 34.638], [60.7, 34.516], [60.89, 34.319], [60.644, 34.307], [60.488, 34.081], [60.512, 33.638], [60.92, 33.513], [60.568, 33.151], [60.578, 32.994], [60.83, 32.249], [60.775, 32.027], [60.822, 31.495], [61.125, 31.449], [61.018, 30.992], [61.035, 30.408], [60.865, 30.392], [60.625, 30.647], [60.297, 30.803], [59.515, 30.607], [59.116, 31.106], [58.973, 31.198], [57.835, 31.637], [58.174, 32.146], [58.224, 32.353], [58.1, 32.568], [58.148, 32.749]],
  IRAQ_AJAM: [[51.033, 34.106], [50.899, 33.815], [50.243, 33.635], [50.002, 33.499], [49.831, 33.668], [49.747, 33.575], [49.464, 33.887], [49.181, 33.68], [48.91, 33.763], [48.971, 33.989], [48.698, 34.086], [48.212, 34.059], [47.694, 34.35], [47.96, 34.41], [47.969, 34.608], [47.815, 34.514], [47.581, 34.711], [47.851, 34.951], [48.152, 35.098], [47.799, 35.587], [48.101, 35.63], [48.691, 35.556], [48.803, 35.636], [48.619, 35.86], [49.037, 35.94], [49.381, 36.082], [49.299, 36.375], [49.036, 36.593], [49.246, 36.813], [49.472, 36.624], [49.805, 36.562], [50.305, 36.67], [50.801, 36.319], [51.357, 36.116], [51.754, 36.011], [51.95, 35.8], [52.177, 35.79], [52.398, 35.976], [53.035, 35.831], [53.472, 35.911], [53.788, 36.164], [53.936, 36.421], [54.464, 36.49], [55.096, 36.793], [55.504, 36.773], [55.64, 37.099], [55.867, 37.354], [56.077, 37.075], [56.067, 36.882], [56.318, 36.665], [56.672, 36.643], [56.785, 35.919], [57.087, 35.7], [56.825, 35.286], [56.614, 35.221], [56.21, 34.906], [55.851, 34.407], [55.287, 34.384], [52.9, 34.325], [52.422, 34.448], [51.982, 34.455], [51.789, 34.542], [51.158, 34.453], [51.014, 34.358], [51.033, 34.106]],
};

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

const KK_999 = ['SA', 'SUGHD', 'JI', 'FA', 'NG', 'AN', 'TO', 'SI', 'BU', 'NW', 'QA', 'SU', 'KG_S', 'KG_N', 'KZ_S'];
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
const KW_TRANS = ['SA', 'QA', 'SU', 'JI', 'SUGHD', 'HISAR', 'KHATLON', 'TO', 'SI', 'FA', 'NG', 'AN', 'KZ_S'];
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
