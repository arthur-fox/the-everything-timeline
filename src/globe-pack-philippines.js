/**
 * Day 71 — Phase 5 country pack 1, globe backfill: the Philippines (ROADMAP item 12), the last
 * country of pack 1.
 *
 * The Philippines had a sourced timeline (data/countries/philippines.json) but on the globe, before
 * the 1815 nations layer, only three Day 59 Southeast Asia shapes (Tondo, Sulu, Maguindanao — rough
 * rings that ran into the sea) and one schematic "Philippines" ring of the Spanish Empire that
 * appeared in 1550, fifteen years before Legazpi, and covered Sulu, Lanao and Cotabato, which Spain
 * never held. This module draws the islands' own states from the Laguna Copperplate (900) to 1815:
 *
 *   Tondo · Maynila · Namayan · Caboloan (Pangasinan) · Butuan · Cebu (Sugbu) · the Sultanate of
 *   Sulu · the Sultanate of Maguindanao · Buayan · the Lanao sultanates · Spanish Philippines ·
 *   Dagohoy's Bohol
 *
 * From 1815 the nations layer takes over (Spanish Philippines to 1899, then the US colony and the
 * Republic from 1946), so no keyframe here is later than 1815. The Revolution, Biak-na-Bato, the
 * Malolos Republic, the Japanese occupation and Bangsamoro are timeline items with pins.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - The islands are cut into 32 "pieces" (PH_PIECES): each is an island of the globe's own land
 *    (src/data/nations.topo.json; Jolo and Tawi-Tawi, too small for it, from nations-fine.topo.json)
 *    clipped along straight hand-drawn lines — the Pasig, the edge of the Cordillera, the Lanao
 *    plateau and so on. Pieces of one island share their cut lines point for point, so `mergeRings`
 *    fuses touching pieces into one outline, and two polities that hold different pieces never
 *    overlap. Coasts are the land's own coast, so nothing spills into the sea.
 *  - A polity is a dated list of pieces; every change is a one-year step (a keyframe the year before
 *    with the old extent), so no outline morphs across a neighbour.
 *  - Land that no source puts under a state is left empty: the Cordillera, the Sierra Madre coast,
 *    most of Palawan, Basilan, the interior of Mindanao and, before 1565, most of the Visayas.
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const SCOTT = { title: 'Scott, Barangay: Sixteenth-Century Philippine Culture and Society (Ateneo de Manila University Press, 1994)', url: 'https://archive.org/details/barangaysixteent0000scot' };
const SALEEBY = { title: 'Saleeby, The History of Sulu (Bureau of Printing, Manila, 1908)', url: 'https://www.gutenberg.org/ebooks/30789' };
const BLAIR = { title: 'Blair & Robertson (eds.), The Philippine Islands, 1493–1898 (1903–09)', url: 'https://www.gutenberg.org/ebooks/author/34917' };
const WARREN = { title: 'Warren, The Sulu Zone, 1768–1898 (Singapore University Press, 1981)', url: 'https://en.wikipedia.org/wiki/Sultanate_of_Sulu#Further_reading' };

// ---- Pieces ([lng, lat], read off nations.topo.json / nations-fine.topo.json, cut on straight lines) --

export const PH_PIECES = {
  MAYNILA: [[120.959, 14.495], [120.974, 14.506], [120.985, 14.534], [120.981, 14.557], [120.963, 14.597], [121, 14.597], [121, 14.5], [121, 14.45], [120.867, 14.45], [120.877, 14.459], [120.959, 14.495]],
  NAMAYAN: [[121.13, 14.5], [121, 14.5], [121, 14.597], [121, 14.64], [121.13, 14.64], [121.13, 14.5]],
  TONDO: [[120.83, 14.764], [120.7, 14.776], [120.7, 14.95], [121.13, 14.95], [121.13, 14.64], [121, 14.64], [121, 14.597], [120.963, 14.597], [120.949, 14.629], [120.916, 14.694], [120.83, 14.764]],
  PANGASINAN: [[119.771, 15.915], [119.757, 16.203], [119.805, 16.35], [119.902, 16.35], [119.926, 16.345], [119.901, 16.251], [120.092, 16.153], [120.106, 16.069], [120.257, 16.053], [120.365, 16.108], [120.401, 16.21], [120.337, 16.292], [120.33, 16.35], [120.75, 16.35], [120.75, 15.65], [119.901, 15.65], [119.89, 15.802], [119.879, 15.915], [119.771, 15.915]],
  ILOCOS: [[120.398, 16.919], [120.437, 17.009], [120.401, 17.222], [120.441, 17.368], [120.401, 17.519], [120.333, 17.556], [120.401, 17.697], [120.427, 17.894], [120.47, 18.091], [120.585, 18.365], [120.563, 18.469], [120.61, 18.539], [120.772, 18.561], [120.851, 18.639], [120.927, 18.567], [120.95, 18.58], [120.95, 17.4], [120.75, 16.35], [120.33, 16.35], [120.308, 16.545], [120.326, 16.83], [120.398, 16.919]],
  CAGAYAN: [[121.852, 18.288], [121.975, 18.287], [122.111, 18.392], [122.155, 18.519], [122.219, 18.522], [122.317, 18.377], [122.306, 18.252], [122.18, 18.121], [122.14, 17.799], [122.183, 17.541], [122.252, 17.36], [122.381, 17.347], [122.417, 17.145], [122.529, 17.091], [122.464, 16.896], [122.345, 16.642], [122.245, 16.511], [122.236, 16.4], [121.25, 16.4], [121.05, 17.5], [121.007, 18.61], [121.107, 18.643], [121.593, 18.384], [121.852, 18.288]],
  CENTRAL: [[120.599, 14.506], [120.563, 14.442], [120.401, 14.456], [120.369, 14.62], [120.243, 14.73], [120.283, 14.806], [120.211, 14.879], [120.175, 14.757], [120.081, 14.804], [120.052, 15.062], [120.005, 15.27], [119.887, 15.428], [119.962, 15.515], [119.905, 15.597], [119.901, 15.65], [120.75, 15.65], [121.35, 15.65], [121.35, 14.95], [121.13, 14.95], [120.7, 14.95], [120.62, 14.95], [120.62, 14.86], [120.607, 14.885], [120.545, 14.826], [120.599, 14.506]],
  BICOL: [[123.314, 13.82], [123.217, 13.993], [123.346, 14.093], [123.425, 13.907], [123.443, 13.961], [123.681, 13.884], [123.713, 13.935], [123.973, 13.73], [123.861, 13.742], [123.796, 13.688], [123.587, 13.728], [123.53, 13.627], [123.595, 13.529], [123.667, 13.486], [123.821, 13.243], [123.767, 13.224], [123.746, 13.064], [123.872, 13.143], [123.937, 13.118], [124.081, 13.009], [124.185, 13.057], [124.117, 12.916], [124.142, 12.797], [124.095, 12.556], [124.009, 12.537], [123.879, 12.646], [123.843, 12.802], [124.019, 12.894], [124.027, 12.955], [123.893, 12.974], [123.821, 12.877], [123.724, 12.845], [123.497, 12.974], [123.44, 13.037], [123.31, 13.012], [123.292, 13.245], [123.191, 13.359], [123.17, 13.45], [122.972, 13.528], [122.813, 13.654], [122.864, 13.695], [122.767, 13.799], [122.7, 13.812], [122.7, 13.95], [122.473, 13.95], [122.45, 13.955], [122.45, 14.335], [122.471, 14.346], [122.691, 14.291], [122.68, 14.351], [122.853, 14.279], [123.011, 14.106], [123.083, 13.975], [123.047, 13.822], [123.109, 13.723], [123.267, 13.749], [123.314, 13.82]],
  STAG: [[122.497, 13.652], [122.644, 13.458], [122.691, 13.228], [122.587, 13.174], [122.504, 13.239], [122.5, 13.369], [122.32, 13.592], [122.194, 13.622], [122.119, 13.752], [121.726, 13.969], [121.636, 13.909], [121.55, 13.879], [121.456, 13.819], [121.431, 13.657], [121.28, 13.595], [121.046, 13.628], [121.039, 13.759], [120.931, 13.784], [120.895, 13.907], [120.704, 13.928], [120.722, 13.855], [120.628, 13.811], [120.596, 14.219], [120.867, 14.45], [121, 14.45], [121, 14.5], [121.13, 14.5], [121.13, 14.64], [121.13, 14.95], [121.35, 14.95], [121.576, 14.95], [121.615, 14.872], [121.726, 14.721], [121.629, 14.702], [121.611, 14.613], [121.661, 14.417], [121.759, 14.247], [121.78, 14.125], [121.935, 13.996], [122.23, 13.907], [122.201, 13.994], [122.291, 14.024], [122.187, 14.11], [122.245, 14.197], [122.309, 14.096], [122.389, 14.305], [122.45, 14.335], [122.45, 13.955], [122.417, 13.961], [122.511, 13.82], [122.497, 13.652]],
  MINDORO: [[121.121, 13.372], [121.197, 13.441], [121.431, 13.224], [121.449, 13.139], [121.546, 13.131], [121.489, 13.037], [121.485, 12.768], [121.546, 12.644], [121.384, 12.368], [121.247, 12.221], [121.114, 12.251], [121.089, 12.324], [120.916, 12.512], [120.913, 12.634], [120.797, 12.729], [120.758, 13.002], [120.643, 13.183], [120.481, 13.302], [120.459, 13.404], [120.34, 13.387], [120.358, 13.518], [120.567, 13.514], [120.754, 13.466], [120.895, 13.504], [120.956, 13.503], [121.121, 13.372]],
  PANAY: [[123.112, 11.266], [123.13, 11.182], [122.781, 10.957], [122.763, 10.81], [122.615, 10.762], [122.59, 10.699], [122.471, 10.688], [122.227, 10.642], [122.101, 10.569], [122.032, 10.461], [121.949, 10.433], [121.985, 10.625], [121.939, 10.775], [122.047, 11.018], [122.054, 11.234], [122.108, 11.658], [122.086, 11.724], [121.852, 11.769], [121.964, 11.933], [122.119, 11.823], [122.389, 11.727], [122.594, 11.554], [122.723, 11.612], [122.857, 11.591], [122.943, 11.522], [122.9, 11.437], [123.091, 11.529], [123.173, 11.468], [123.112, 11.266]],
  NEGROS: [[122.396, 9.836], [122.475, 9.974], [122.709, 9.987], [122.875, 10.101], [122.871, 10.35], [122.824, 10.533], [122.921, 10.618], [122.975, 10.742], [123.004, 10.913], [123.213, 10.997], [123.523, 10.92], [123.577, 10.826], [123.487, 10.55], [123.364, 10.392], [123.289, 10.094], [123.155, 9.868], [123.17, 9.695], [123.134, 9.619], [123.321, 9.343], [123.231, 9.107], [123.033, 9.035], [122.932, 9.121], [122.846, 9.347], [122.597, 9.438], [122.497, 9.562], [122.396, 9.836]],
  MASBATE: [[123.616, 12.08], [123.541, 12.194], [123.425, 12.201], [123.353, 12.095], [123.181, 11.931], [123.217, 12.134], [123.292, 12.236], [123.217, 12.228], [123.274, 12.424], [123.242, 12.595], [123.357, 12.495], [123.447, 12.512], [123.703, 12.321], [123.793, 12.187], [123.883, 12.212], [124.055, 11.954], [124.055, 11.8], [124.019, 11.783], [123.616, 12.08]],
  LEYTE: [[125.006, 10.798], [125.168, 10.622], [125.2, 10.433], [125.265, 10.369], [125.229, 10.254], [125.089, 10.229], [125.009, 10.382], [124.999, 10.2], [125.031, 10.02], [124.765, 10.186], [124.793, 10.303], [124.739, 10.395], [124.797, 10.66], [124.779, 10.821], [124.621, 11.003], [124.549, 10.983], [124.527, 10.879], [124.397, 10.934], [124.405, 11.302], [124.297, 11.527], [124.329, 11.557], [124.491, 11.447], [124.631, 11.305], [124.743, 11.329], [124.847, 11.433], [124.984, 11.382], [124.977, 11.334], [125.038, 11.198], [125.053, 10.968], [125.006, 10.798]],
  SAMAR: [[124.678, 12.516], [124.869, 12.53], [124.973, 12.576], [125.049, 12.53], [125.168, 12.579], [125.351, 12.399], [125.315, 12.303], [125.431, 12.283], [125.539, 12.173], [125.456, 12.108], [125.524, 12.046], [125.452, 11.964], [125.456, 11.786], [125.521, 11.46], [125.639, 11.369], [125.567, 11.269], [125.708, 11.177], [125.78, 11.053], [125.65, 11.149], [125.423, 11.09], [125.315, 11.149], [125.24, 11.095], [125.132, 11.283], [125.002, 11.29], [125.006, 11.426], [124.829, 11.508], [124.948, 11.57], [125.053, 11.738], [124.894, 11.762], [124.678, 12.03], [124.57, 12.051], [124.408, 12.194], [124.372, 12.29], [124.275, 12.533], [124.678, 12.516]],
  CEBU_PORT: [[123.868, 10.249], [123.75, 10.175], [123.75, 10.55], [124.041, 10.55], [123.98, 10.377], [123.933, 10.31], [123.868, 10.249]],
  CEBU_REST: [[123.645, 10.04], [123.602, 9.868], [123.487, 9.566], [123.371, 9.425], [123.314, 9.507], [123.422, 10.037], [123.508, 10.122], [123.598, 10.318], [123.706, 10.462], [123.764, 10.64], [123.85, 10.753], [123.933, 10.971], [123.951, 11.157], [124.073, 11.269], [124.041, 11.129], [124.066, 10.89], [124.019, 10.748], [124.055, 10.59], [124.041, 10.55], [123.75, 10.55], [123.75, 10.175], [123.721, 10.157], [123.645, 10.04]],
  BOHOL_N: [[124.185, 10.144], [124.333, 10.161], [124.45, 10.098], [124.45, 9.85], [123.95, 9.85], [123.95, 9.939], [124.052, 9.98], [124.185, 10.144]],
  BOHOL_S: [[124.498, 9.768], [124.412, 9.658], [124.293, 9.606], [124.066, 9.595], [123.893, 9.633], [123.811, 9.803], [123.886, 9.914], [123.95, 9.939], [123.95, 9.85], [124.45, 9.85], [124.45, 10.098], [124.588, 10.024], [124.567, 9.871], [124.624, 9.801], [124.585, 9.732], [124.498, 9.768]],
  TAYTAY: [[119.224, 10.851], [119.224, 10.941], [119.469, 10.741], [119.458, 10.831], [119.318, 10.943], [119.336, 11.103], [119.408, 11.05], [119.386, 11.187], [119.501, 11.423], [119.57, 11.262], [119.516, 11.117], [119.573, 11.015], [119.505, 10.971], [119.519, 10.838], [119.595, 10.837], [119.591, 10.672], [119.698, 10.55], [119.292, 10.55], [119.347, 10.724], [119.224, 10.851]],
  ZAMBO: [[122.245, 7.099], [122.119, 6.896], [121.939, 6.98], [121.903, 7.155], [121.996, 7.25], [122.267, 7.25], [122.266, 7.248], [122.245, 7.099]],
  BUTUAN: [[125.517, 9.015], [125.542, 9.19], [125.524, 9.25], [125.8, 9.25], [125.8, 8.6], [125.25, 8.6], [125.25, 8.75], [125.25, 9.045], [125.312, 8.995], [125.441, 8.981], [125.517, 9.015]],
  CARAGA: [[125.459, 9.822], [125.589, 9.754], [125.621, 9.63], [125.935, 9.492], [126.01, 9.294], [126.075, 9.24], [126.219, 9.305], [126.179, 9.093], [126.313, 8.957], [126.345, 8.854], [126.302, 8.769], [126.111, 8.607], [126.158, 8.528], [126.37, 8.539], [126.413, 8.466], [126.334, 8.347], [126.388, 8.292], [126.363, 8.188], [126.464, 8.23], [126.435, 8.007], [126.432, 8], [125.8, 8], [125.8, 8.6], [125.8, 9.25], [125.524, 9.25], [125.467, 9.445], [125.398, 9.682], [125.459, 9.822]],
  LANAO: [[123.85, 8.084], [123.901, 8.12], [123.95, 8.12], [124.6, 8.12], [124.6, 7.65], [124.45, 7.65], [123.97, 7.65], [123.861, 7.704], [123.85, 7.71], [123.85, 8.084]],
  NORTH: [[124.261, 8.324], [124.322, 8.515], [124.405, 8.607], [124.57, 8.528], [124.664, 8.476], [124.754, 8.561], [124.786, 8.734], [124.786, 8.75], [125.25, 8.75], [125.25, 8.6], [125.25, 8.12], [124.6, 8.12], [123.95, 8.12], [123.95, 8.155], [123.969, 8.168], [124.232, 8.213], [124.261, 8.324]],
  COTABATO: [[123.976, 6.966], [124.03, 7.115], [124.185, 7.226], [124.221, 7.321], [124.246, 7.405], [124.167, 7.432], [124.066, 7.602], [123.97, 7.65], [124.45, 7.65], [124.45, 7.5], [124.45, 6.75], [124.45, 6.6], [124.046, 6.6], [124.037, 6.758], [123.969, 6.812], [123.976, 6.966]],
  BUAYAN: [[125.15, 7.5], [125.15, 6.75], [124.45, 6.75], [124.45, 7.5], [125.15, 7.5]],
  SARANGANI: [[125.6, 6.447], [125.6, 5.858], [125.387, 5.573], [125.308, 5.583], [125.301, 5.671], [125.182, 5.798], [125.279, 5.979], [125.24, 6.095], [125.157, 6.109], [125.114, 5.954], [125.071, 5.862], [124.937, 5.863], [124.707, 5.947], [124.369, 6.132], [124.246, 6.187], [124.055, 6.437], [124.046, 6.6], [124.45, 6.6], [124.45, 6.75], [125.15, 6.75], [125.389, 6.75], [125.398, 6.599], [125.575, 6.517], [125.6, 6.447]],
  DAVAO: [[125.15, 6.75], [125.15, 7.5], [125.15, 7.6], [125.75, 7.6], [125.75, 7.308], [125.675, 7.265], [125.657, 7.129], [125.51, 7.016], [125.387, 6.768], [125.389, 6.75], [125.15, 6.75]],
  JOLO: [[121.429, 5.97], [121.419, 5.948], [121.392, 5.94], [121.386, 5.911], [121.347, 5.906], [121.303, 5.865], [121.281, 5.859], [121.254, 5.885], [121.253, 5.916], [121.227, 5.942], [121.19, 5.94], [121.081, 5.888], [121.05, 5.916], [121.008, 5.924], [120.963, 5.896], [120.935, 5.886], [120.915, 5.91], [120.891, 5.92], [120.872, 5.961], [120.889, 5.999], [120.906, 6.015], [120.971, 6.05], [121.002, 6.058], [121.025, 6.089], [121.043, 6.097], [121.115, 6.095], [121.179, 6.064], [121.202, 6.013], [121.218, 5.999], [121.272, 6.026], [121.316, 6.006], [121.381, 6.006], [121.421, 5.987], [121.429, 5.97]],
  TAWI: [[120.227, 5.129], [120.217, 5.115], [120.192, 5.126], [120.182, 5.153], [120.189, 5.196], [120.176, 5.203], [120.164, 5.182], [120.146, 5.183], [120.121, 5.218], [120.108, 5.171], [120.086, 5.15], [120.045, 5.164], [120.025, 5.16], [120.005, 5.129], [119.981, 5.126], [119.97, 5.088], [119.954, 5.076], [119.923, 5.088], [119.9, 5.064], [119.829, 5.049], [119.817, 5.072], [119.813, 5.122], [119.829, 5.135], [119.895, 5.161], [119.942, 5.19], [119.965, 5.222], [120.036, 5.242], [120.053, 5.259], [120.087, 5.259], [120.097, 5.29], [120.134, 5.318], [120.199, 5.349], [120.216, 5.329], [120.216, 5.277], [120.252, 5.267], [120.253, 5.251], [120.227, 5.129]],
  SABAH: [[117.057, 6.846], [117.028, 6.91], [117.143, 7.003], [117.255, 6.938], [117.23, 6.837], [117.295, 6.637], [117.46, 6.548], [117.532, 6.621], [117.745, 6.39], [117.723, 6.255], [117.601, 6.198], [117.676, 5.989], [117.493, 5.894], [117.773, 5.908], [118.018, 6.061], [118.126, 5.863], [118.058, 5.809], [117.91, 5.785], [117.964, 5.686], [118.133, 5.689], [118.162, 5.794], [118.263, 5.828], [118.411, 5.796], [118.594, 5.682], [118.738, 5.548], [118.918, 5.455], [118.947, 5.388], [119.206, 5.444], [119.275, 5.362], [119.267, 5.201], [119.156, 5.107], [118.681, 4.944], [118.508, 4.931], [118.357, 5.038], [118.137, 4.882], [118.245, 4.723], [118.49, 4.576], [118.645, 4.443], [118.544, 4.36], [118.148, 4.3], [117.836, 4.3], [117.673, 4.427], [117.604, 4.382], [117.644, 4.3], [117.284, 4.3], [117.215, 4.353], [117.165, 4.333], [116.85, 4.331], [116.85, 6.597], [116.974, 6.708], [117.057, 6.846]],
};

/** Region builder: [name, [PIECE names]] → { id, name, ring } (touching pieces merged). */
const P = (names) => names.map((n) => {
  if (!PH_PIECES[n]) throw new Error(`philippines pack: no piece ${n}`);
  return PH_PIECES[n];
});

/**
 * steps: [[year, label, { regionId: [name, pieces] }], …]. Keyframes are written for every step
 * year and the year before it (still the old extent), so each change is a one-year step.
 */
export const PH_STEPS = {};
function build(meta, steps) {
  PH_STEPS[meta.id] = steps;
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

// ---- Confidence --------------------------------------------------------------------------------------

const CONF = {
  barangay: {
    level: 'conjectural',
    reason: 'Known from a handful of documents (the Laguna Copperplate, Chinese annals, the first Spanish accounts) and archaeology. A pre-colonial polity was a river-mouth town of allied barangays under a datu, lakan or rajah, not a territory; the outline is the coast and river valley it is thought to have led.',
  },
  rajahnate: {
    level: 'conjectural',
    reason: 'Recorded by Song and Ming court annals and by Pigafetta (1521) and Legazpi’s men (1565); the rulers and dates in those records are good, but how far a rajah’s rule reached beyond his port is not recorded, and early dates rest on identifying Chinese place names.',
  },
  sultanate: {
    level: 'approximate',
    reason: 'Tarsilas (royal genealogies), Spanish, Dutch and English reports and the treaties with Spain record the sultans, their seats and the coasts and islands they claimed. Their power ran along coasts and rivers and through alliances of datus, so inland edges are drawn roughly.',
  },
  upland: {
    level: 'conjectural',
    reason: 'Known from Maguindanao and Maranao tarsilas and from Spanish reports of their expeditions; founding dates come from tradition, and the reach of the sultans over the upland datus is a guess.',
  },
  spanish: {
    level: 'approximate',
    reason: 'The founding of Spanish towns, forts and missions is well dated (Legazpi’s letters, the chroniclers, Blair & Robertson). Spanish rule meant lowland towns, encomiendas and parishes; the uplands (the Cordillera, the Sierra Madre, inland Mindoro, Negros and Mindanao) were outside it, and a whole island is drawn only where its coasts were held.',
  },
  revolt: {
    level: 'approximate',
    reason: 'The revolt’s dates and its strongholds (Inabanga, Danao, Talibon) are recorded by the Jesuit and Recollect missionaries and the Spanish governors; its exact reach over the northern half of Bohol is drawn roughly.',
  },
};

const PRE = ['ph-precolonial-polities'];

// ---- Luzon: Tondo, Maynila, Namayan, Caboloan ------------------------------------------------------

const tondo = build({
  id: 'tondo', name: 'Tondo', color: '#F06292',
  description: 'The polity on the north bank of the Pasig delta, the part of the Manila Bay coast the Tagalogs called Lusong. The Laguna Copperplate Inscription of 900 — the oldest document found in the Philippines — names a “Tundun”. Its lakans traded with China, Brunei and Japan; under Bunao Lakandula in the 1500s it held the bay shore of what are now Tondo, Navotas and Bulacan, and led — but did not rule — the Kapampangan datus. Lakandula made peace with the Spanish in 1571 and went with Martín de Goiti to Bulacan and Pampanga, and Tondo became part of Spanish Manila.',
  timelineItemIds: ['tondo', ...PRE, 'ph-luzon-polities'], confidence: CONF.barangay,
  sources: [W('Tondo (historical polity)'), W('Laguna Copperplate Inscription'), W('Lakan Dula'), SCOTT],
}, [
  [900, 'Tundun, named in the Laguna Copperplate Inscription (900)', { tondo: ['Tondo', ['TONDO']] }],
  [1500, 'Tondo on the north bank of the Pasig', { tondo: ['Tondo', ['TONDO']] }],
  [1570, 'Lakandula of Tondo meets Goiti’s expedition (1570)', { tondo: ['Tondo', ['TONDO']] }],
  [1571, 'Lakandula makes peace with Legazpi (1571)', { tondo: ['Tondo', ['TONDO']] }],
]);

const maynila = build({
  id: 'maynila', name: 'Maynila', color: '#AD1457',
  description: 'A fortified town on the south bank of the Pasig mouth, with close ties to Brunei: according to Bruneian tradition it was founded as a Bornean trading colony about 1500, and its earliest settlement remains date to the 1500s. In 1521 its prince Ache (later Rajah Matanda) was commanding Brunei’s fleet when he met the survivors of Magellan’s expedition. In May 1570 Martín de Goiti fought the forces of Rajah Sulayman and burned the town; the next year Legazpi negotiated with Maynila and Tondo and on 24 June 1571 declared the Spanish city of Manila on its site (Intramuros).',
  timelineItemIds: ['tondo', ...PRE, 'ph-luzon-polities'], confidence: CONF.barangay,
  sources: [W('Maynila (historical polity)'), W('Rajah Sulayman'), W('Rajah Matanda'), W('Battle of Manila (1570)'), SCOTT],
}, [
  [1500, 'Maynila, a Bornean-linked trading town (c. 1500)', { maynila: ['Maynila', ['MAYNILA']] }],
  [1521, 'Prince Ache of Maynila commands Brunei’s fleet (1521)', { maynila: ['Maynila', ['MAYNILA']] }],
  [1570, 'Goiti attacks Maynila; Rajahs Matanda and Sulayman (May 1570)', { maynila: ['Maynila', ['MAYNILA']] }],
]);

const namayan = build({
  id: 'namayan', name: 'Namayan (Sapa)', color: '#86198F',
  description: 'A confederation of barangays on the upper Pasig, centred on Sapa (now Santa Ana, Manila). Excavations by the National Museum in the 1960s found graves under the Santa Ana church with Chinese and Southeast Asian trade wares of the 12th to 15th centuries — older evidence of settlement than at Maynila or Tondo. After the Spanish took Manila it was absorbed into the town of Santa Ana de Sapa (1578).',
  timelineItemIds: [...PRE, 'ph-luzon-polities'], confidence: CONF.barangay,
  sources: [W('Namayan'), W('Santa Ana, Manila'), SCOTT],
}, [
  [1200, 'Namayan (Sapa): Santa Ana’s 12th–15th-century graves', { namayan: ['Namayan', ['NAMAYAN']] }],
  [1500, 'Namayan on the upper Pasig', { namayan: ['Namayan', ['NAMAYAN']] }],
  [1571, 'Namayan comes under Spanish Manila (Santa Ana de Sapa, 1578)', { namayan: ['Namayan', ['NAMAYAN']] }],
]);

const caboloan = build({
  id: 'caboloan', name: 'Caboloan (Pangasinan)', color: '#7CB342',
  description: 'The polity of the Agno delta on the Lingayen Gulf, centred on Binalatongan (now San Carlos), said to be the largest settlement of the region. It is identified with “Feng-jia-shi-lan” in the Ming records, whose envoys brought tribute to China in 1403–1405, and it traded rice, deer hides and gold with China and Japan. Juan de Salcedo conquered Pangasinan in 1572; in 1574–75 the Chinese corsair Limahong tried to found a kingdom at its coast until a Spanish force drove him out.',
  timelineItemIds: [...PRE, 'ph-luzon-polities'], confidence: CONF.rajahnate,
  sources: [W('Caboloan'), W('Pangasinan'), W('Limahong')],
}, [
  [1403, 'Pangasinan envoys at the Ming court (1403–05)', { caboloan: ['Caboloan', ['PANGASINAN']] }],
  [1500, 'Caboloan: Binalatongan on the Agno', { caboloan: ['Caboloan', ['PANGASINAN']] }],
  [1571, 'Caboloan, before Salcedo’s conquest (1572)', { caboloan: ['Caboloan', ['PANGASINAN']] }],
]);

// ---- Butuan and Cebu --------------------------------------------------------------------------------

const butuan = build({
  id: 'butuan', name: 'Butuan', color: '#FDD835',
  description: 'A port on the lower Agusan River in north-eastern Mindanao, known for its gold and for the balangay plank boats excavated at Libertad. Butuan (Chinese Puduan) sent its first tributary mission to the Song court on 17 March 1001, and more in 1003 and 1011 (led by Li Yu Xie, perhaps Ali Yusuf); Rajah Kiling asked the Song to rank Butuan equal with Champa, and was refused. In 1521 Pigafetta met its king, Rajah Siagu, whose rule covered Butuan and Calagan (Caraga), with his brother Rajah Kolambu of Limasawa, where the first Mass in the Philippines was said on 31 March 1521. The Spanish fort at Tandag (1609) brought the coast under Spain.',
  timelineItemIds: [...PRE, 'ph-butuan-cebu'], confidence: CONF.rajahnate,
  sources: [W('Butuan (historical polity)'), W('Balangay'), W('Limasawa'), SCOTT],
}, [
  [1001, 'Butuan’s first embassy to the Song court (17 March 1001)', { butuan: ['Butuan', ['BUTUAN']] }],
  [1011, 'Butuan’s mission to the Song court under Li Yu Xie (1011)', { butuan: ['Butuan', ['BUTUAN']] }],
  [1300, 'Butuan trades with Song, Yuan and Champa', { butuan: ['Butuan', ['BUTUAN']] }],
  [1521, 'Rajah Siagu of Butuan and Calagan meets Magellan (1521)', { butuan: ['Butuan and Calagan (Caraga)', ['BUTUAN', 'CARAGA']] }],
]);

const cebu = build({
  id: 'cebu-rajahnate', name: 'Cebu (Sugbu)', color: '#00897B',
  description: 'A port-kingdom on the strait between Cebu and Mactan: early Spanish accounts describe a long seaside town of some 300 houses round the rajah’s palace. A kingdom of “Suwu” in Zhao Rugua’s Zhufan Zhi (1225) is presumed to be Cebu; Visayan legend traces its rajahs to Sri Lumay. In April 1521 Rajah Humabon made a blood compact with Magellan and was baptised, and on 27 April Lapulapu of Mactan defeated and killed Magellan. Legazpi landed on 27 April 1565 and founded San Miguel, the first Spanish town in the islands, in the face of Rajah Tupas.',
  timelineItemIds: [...PRE, 'ph-butuan-cebu'], confidence: CONF.rajahnate,
  sources: [W('Cebu (historical polity)'), W('Rajah Humabon'), W('Lapulapu'), W('Battle of Mactan'), SCOTT],
}, [
  [1225, 'Suwu in the Zhufan Zhi (1225), presumed to be Cebu', { cebu: ['Sugbu', ['CEBU_PORT']] }],
  [1400, 'Sugbu, a port on the sea lane from Manila', { cebu: ['Sugbu', ['CEBU_PORT']] }],
  [1521, 'Rajah Humabon baptised; Lapulapu kills Magellan at Mactan (1521)', { cebu: ['Cebu and Mactan', ['CEBU_PORT']] }],
  [1564, 'Rajah Tupas’s Cebu, before Legazpi (1565)', { cebu: ['Cebu', ['CEBU_PORT']] }],
]);

// ---- The Moro sultanates ----------------------------------------------------------------------------

const sulu = build({
  id: 'sulu-sultanate', name: 'Sulu Sultanate', color: '#E8793A',
  description: 'The Tausug sultanate of the Sulu Archipelago, founded at Buansa on Jolo by the Johor-born scholar Sharif ul-Hashim in 1405 or 1457. In 1417 Paduka Batara of Sulu sailed to the Ming court and died there. Sulu grew on pearls, sea cucumber and, later, slave raids on the Visayas; it broke free of Brunei in 1578 and held out against Spain for three centuries. Corcuera took Jolo in 1638 and the sultan withdrew to Tawi-Tawi, but the garrison left on 14 April 1646. North-east Borneo, from Marudu Bay south-east, was ceded by Brunei (in 1658 or 1704). Zamboanga’s coasts and southern Palawan, also claimed, are not drawn.',
  timelineItemIds: ['sulu-sultanate', 'ph-moro-sultanates', 'ph-moro-wars'], confidence: CONF.sultanate,
  sources: [W('Sultanate of Sulu'), W('Spanish occupation of Jolo (1638)'), W('Tausug people'), SALEEBY, WARREN],
}, [
  [1405, 'Sharif ul-Hashim founds the sultanate at Buansa (1405, or 1457)', { jolo: ['Jolo', ['JOLO']], tawi: ['Tawi-Tawi', ['TAWI']] }],
  [1417, 'Paduka Batara of Sulu at the Ming court (1417)', { jolo: ['Jolo', ['JOLO']], tawi: ['Tawi-Tawi', ['TAWI']] }],
  [1578, 'Sulu breaks free of Brunei (1578)', { jolo: ['Jolo', ['JOLO']], tawi: ['Tawi-Tawi', ['TAWI']] }],
  [1600, 'Sulu raids the Visayas', { jolo: ['Jolo', ['JOLO']], tawi: ['Tawi-Tawi', ['TAWI']] }],
  [1638, 'Corcuera takes Jolo; the sultan holds Tawi-Tawi (1638–46)', { tawi: ['Tawi-Tawi', ['TAWI']] }],
  [1646, 'Spain leaves Jolo: treaty of 14 April 1646', { jolo: ['Jolo', ['JOLO']], tawi: ['Tawi-Tawi', ['TAWI']] }],
  [1704, 'North-east Borneo ceded by Brunei (1658 or 1704)', { jolo: ['Jolo', ['JOLO']], tawi: ['Tawi-Tawi', ['TAWI']], sabah: ['North-east Borneo', ['SABAH']] }],
  [1800, 'The Sulu zone: raiding and trade at their height', { jolo: ['Jolo', ['JOLO']], tawi: ['Tawi-Tawi', ['TAWI']], sabah: ['North-east Borneo', ['SABAH']] }],
  [1815, 'Sulu Sultanate', { jolo: ['Jolo', ['JOLO']], tawi: ['Tawi-Tawi', ['TAWI']], sabah: ['North-east Borneo', ['SABAH']] }],
]);

const maguindanao = build({
  id: 'maguindanao-sultanate', name: 'Maguindanao Sultanate', color: '#D9A066',
  description: 'The sultanate of the lower Pulangi (Rio Grande de Mindanao) and Illana Bay, founded when Shariff Kabungsuwan of Johor came to Malabang in the early 1500s and married into the ruling family. With Buayan it beat back the Spanish expedition of 1596. Sultan Muhammad Kudarat (r. c. 1619–1671) made it the strongest power in Mindanao: he took Sarangani in 1625, lost his fort at Lamitan to Corcuera in 1637, held his ground, and made peace with Spain in 1645, after which his capital at Simuay reopened to trade. The Lanao lords seceded in 1616. William Dampier described its court in the 1680s.',
  timelineItemIds: ['maguindanao-sultanate', 'ph-moro-sultanates', 'ph-moro-wars'], confidence: CONF.sultanate,
  sources: [W('Sultanate of Maguindanao'), W('Muhammad Kudarat'), W('Shariff Kabungsuwan'), BLAIR],
}, [
  [1520, 'Shariff Kabungsuwan at Malabang (early 1500s)', { cot: ['Maguindanao', ['COTABATO']] }],
  [1596, 'Maguindanao and Buayan repel the Spanish (1596)', { cot: ['Maguindanao', ['COTABATO']] }],
  [1619, 'Kudarat becomes sultan (c. 1619)', { cot: ['Maguindanao', ['COTABATO']] }],
  [1625, 'Kudarat takes Sarangani (1625)', { cot: ['Maguindanao', ['COTABATO', 'SARANGANI']] }],
  [1637, 'Corcuera storms Kudarat’s fort at Lamitan (1637)', { cot: ['Maguindanao', ['COTABATO', 'SARANGANI']] }],
  [1640, 'Kudarat’s Maguindanao: Davao Gulf pays tribute', { cot: ['Maguindanao', ['COTABATO', 'SARANGANI', 'DAVAO']] }],
  [1645, 'Peace with Spain (1645); trade from Simuay', { cot: ['Maguindanao', ['COTABATO', 'SARANGANI', 'DAVAO']] }],
  [1671, 'Kudarat dies (1671)', { cot: ['Maguindanao', ['COTABATO', 'SARANGANI', 'DAVAO']] }],
  [1815, 'Maguindanao Sultanate', { cot: ['Maguindanao', ['COTABATO', 'SARANGANI', 'DAVAO']] }],
]);

const buayan = build({
  id: 'buayan-sultanate', name: 'Buayan', color: '#B4530F',
  description: 'The upriver rival of Maguindanao on the upper Pulangi (the Cotabato valley), said in tradition to have been founded in the mid to late 1300s. In April 1596 its Rajah Silongan held off a joint Spanish and Maguindanao force and led a confederacy of Buayan, Cotabato and Tamontaka; Buayan fleets raided Cebu, Negros, Panay and Leyte from 1599 to 1603, and on 8 September 1605 it made a treaty with Spain. Under Sultan Kudarat it became a de facto subject of Maguindanao. Buayan outlasted it: its last leader, Datu Ali, fell fighting the Americans in 1905.',
  timelineItemIds: [...PRE, 'ph-moro-sultanates'], confidence: CONF.upland,
  sources: [W('Sultanate of Buayan'), W('Datu Uto'), BLAIR],
}, [
  [1390, 'Buayan on the upper Pulangi (founded mid–late 1300s, tradition)', { buayan: ['Buayan', ['BUAYAN']] }],
  [1596, 'Rajah Silongan holds off Spain and Maguindanao (1596)', { buayan: ['Buayan', ['BUAYAN']] }],
  [1605, 'Treaty with Spain (8 September 1605)', { buayan: ['Buayan', ['BUAYAN']] }],
  [1640, 'Buayan under Kudarat’s sway', { buayan: ['Buayan', ['BUAYAN']] }],
  [1815, 'Buayan', { buayan: ['Buayan', ['BUAYAN']] }],
]);

const lanao = build({
  id: 'lanao-sultanates', name: 'Sultanates of Lanao', color: '#5E35B1',
  description: 'The Maranao principalities round Lake Lanao — the four “pangampong” of Bayabao, Masiu, Unayan and Balo-i — which seceded from Maguindanao in 1616 rather than accept Kudarat’s line, and governed themselves by council under customary law (taritib and igma). Corcuera sent an expedition to the lake in April 1639 and a Spanish settlement was begun at Dansalan, but the Maranao drove out the garrison set up in 1640, and no Spanish force came back for more than 250 years (Marawi, 1895). Drawn as the Lanao plateau; the Iranun coast of Illana Bay is shown with Maguindanao.',
  timelineItemIds: ['ph-moro-sultanates', 'ph-moro-wars'], confidence: CONF.upland,
  sources: [W('Lanao Sultanate'), W('Maranao people'), W('Lake Lanao')],
}, [
  [1616, 'The Lanao lords secede from Maguindanao (1616)', { lanao: ['Lanao', ['LANAO']] }],
  [1639, 'Corcuera’s expedition to Lake Lanao (April 1639)', { lanao: ['Lanao', ['LANAO']] }],
  [1640, 'The Maranao drive out the Spanish garrison (1640)', { lanao: ['Lanao', ['LANAO']] }],
  [1815, 'The Lanao sultanates', { lanao: ['Lanao', ['LANAO']] }],
]);

// ---- Spanish Philippines, 1565–1815 ------------------------------------------------------------------

const LUZON_1572 = ['MAYNILA', 'NAMAYAN', 'TONDO', 'STAG', 'CENTRAL', 'PANGASINAN', 'ILOCOS'];
const LUZON_1575 = [...LUZON_1572, 'BICOL'];
const VISAYAS = {
  panay: ['Panay', ['PANAY']], cebu: ['Cebu', ['CEBU_PORT', 'CEBU_REST']], mindoro: ['Mindoro', ['MINDORO']],
};
const VISAYAS_1575 = {
  ...VISAYAS, negros: ['Negros', ['NEGROS']], bohol: ['Bohol', ['BOHOL_N', 'BOHOL_S']], leyte: ['Leyte', ['LEYTE']],
  samar: ['Samar', ['SAMAR']], masbate: ['Masbate', ['MASBATE']],
};
const CAGAYAN = { cagayan: ['Cagayan valley (Nueva Segovia)', ['CAGAYAN']] };
const sp = (luzon, more = {}) => ({ luzon: ['Luzon', luzon], ...VISAYAS_1575, ...more });
const CARAGA = { caraga: ['Caraga and Butuan', ['BUTUAN', 'CARAGA']] };
const CARAGA_N = { caraga: ['Caraga, Butuan and Cagayan', ['BUTUAN', 'CARAGA', 'NORTH']] };
const TAYTAY = { taytay: ['Taytay and the Calamianes', ['TAYTAY']] };
const ZAMBO = { zambo: ['Zamboanga', ['ZAMBO']] };
const JOLO = { jolo: ['Jolo (Spanish garrison)', ['JOLO']] };
const BOHOL_SOUTH = { bohol: ['Southern Bohol (Tagbilaran)', ['BOHOL_S']] };

const spanishPhilippines = build({
  id: 'spanish-philippines', name: 'Spanish Philippines', color: '#E53935',
  description: 'Miguel López de Legazpi landed at Cebu on 27 April 1565 and founded San Miguel; the same year Urdaneta found the return route to Mexico that began the Manila galleon trade (1565–1815). Legazpi moved to Panay in 1569, sent Goiti against Maynila in 1570 and declared Manila the capital on 24 June 1571. Juan de Salcedo took Pangasinan and Ilocos in 1572 (Vigan), Nueva Cáceres was founded in Camarines in 1575, and Nueva Segovia in Cagayan in 1581. Mindanao’s north and east were reached through the fort at Tandag (1609) and the Recollect missions; Zamboanga’s fort (1635) was abandoned in 1663 against Koxinga and rebuilt in 1718; Jolo was held 1638–46. Spanish rule meant lowland towns and parishes: the Cordillera, the Sierra Madre and inland Mindanao stayed outside it. Britain held Manila and Cavite from October 1762 to April 1764.',
  nameAt: [[1565, 'Spanish Philippines'], [1762, 'Spanish Philippines (British Manila, 1762–64)'], [1764, 'Spanish Philippines']],
  timelineItemIds: ['ph-spanish-colony', 'ph-moro-wars', 'ph-revolts'], confidence: CONF.spanish,
  sources: [W('Spanish East Indies'), W('Captaincy General of the Philippines'), W('Miguel López de Legazpi'), W('Juan de Salcedo'), W('Manila galleon'), W('Fort Pilar'), W('British occupation of Manila'), BLAIR],
}, [
  [1565, 'Legazpi founds San Miguel at Cebu (27 April 1565)', { cebu: ['Cebu (San Miguel)', ['CEBU_PORT']] }],
  [1569, 'Legazpi moves to Panay (1569)', { cebu: ['Cebu', ['CEBU_PORT', 'CEBU_REST']], panay: ['Panay', ['PANAY']] }],
  [1571, 'Manila founded as the capital (24 June 1571)', { luzon: ['Manila and the Tagalog lowlands', ['MAYNILA', 'STAG']], ...VISAYAS }],
  [1572, 'Salcedo takes Pangasinan and Ilocos; Vigan (1572)', { luzon: ['Luzon', LUZON_1572], ...VISAYAS }],
  [1574, 'Limahong attacks Manila (1574)', { luzon: ['Luzon', LUZON_1572], ...VISAYAS }],
  [1575, 'Nueva Cáceres founded in Camarines; Visayan encomiendas (1570s)', sp(LUZON_1575)],
  [1581, 'Nueva Segovia founded in Cagayan (1581)', sp(LUZON_1575, CAGAYAN)],
  [1609, 'Fort at Tandag: Caraga (1609)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA })],
  [1623, 'Taytay founded in northern Palawan (1623)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA, ...TAYTAY })],
  [1626, 'Recollects at Cagayan in northern Mindanao (1622–26)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY })],
  [1635, 'Fort San José at Zamboanga (23 June 1635)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY, ...ZAMBO })],
  [1638, 'Corcuera takes Jolo (1638–46)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY, ...ZAMBO, ...JOLO })],
  [1646, 'Spain leaves Jolo (14 April 1646)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY, ...ZAMBO })],
  [1663, 'Zamboanga evacuated against Koxinga (January 1663)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY })],
  [1718, 'Zamboanga rebuilt: Fort Pilar (1718–19)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY, ...ZAMBO })],
  [1744, 'Dagohoy’s revolt: northern Bohol lost (1744–1829)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY, ...ZAMBO, ...BOHOL_SOUTH })],
  [1762, 'Britain takes Manila and Cavite (October 1762); Silang’s revolt in Ilocos', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY, ...ZAMBO, ...BOHOL_SOUTH })],
  [1764, 'Manila handed back to Spain (April 1764)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY, ...ZAMBO, ...BOHOL_SOUTH })],
  [1815, 'The last Manila galleon (1815)', sp(LUZON_1575, { ...CAGAYAN, ...CARAGA_N, ...TAYTAY, ...ZAMBO, ...BOHOL_SOUTH })],
]);

const dagohoy = build({
  id: 'dagohoy-bohol', name: 'Dagohoy’s Bohol', color: '#039BE5',
  description: 'The longest revolt in Philippine history. In 1744 Francisco Dagohoy rose after the Jesuit curate of Inabanga refused Christian burial to his brother; the rebels killed the curate of Jagna on 24 January 1744 and made the hills of northern Bohol, with Dagohoy’s cave at Danao as headquarters, a free territory that Jesuits, Recollects and governors failed to win back. It held out for 85 years, until Governor-General Mariano Ricafort’s campaigns ended it in 1829 (after the 1815 handoff, so not drawn past 1815).',
  timelineItemIds: ['ph-spanish-colony', 'ph-revolts'], confidence: CONF.revolt,
  sources: [W('Dagohoy rebellion'), W('Francisco Dagohoy'), BLAIR],
}, [
  [1744, 'Dagohoy’s revolt begins (January 1744)', { bohol: ['Northern Bohol (Inabanga, Danao, Talibon)', ['BOHOL_N']] }],
  [1770, 'Free Bohol: Recollects replace the expelled Jesuits (1768)', { bohol: ['Northern Bohol (Inabanga, Danao, Talibon)', ['BOHOL_N']] }],
  [1815, 'Free Bohol, under Dagohoy’s successors (to 1829)', { bohol: ['Northern Bohol (Inabanga, Danao, Talibon)', ['BOHOL_N']] }],
]);

export const philippinesPolities = [tondo, maynila, namayan, caboloan, butuan, cebu, sulu, maguindanao, buayan, lanao, spanishPhilippines, dagohoy];

// ---- Fixes to older shapes over the Philippines ------------------------------------------------------
//
// The Spanish Empire's schematic 'philippines' ring (a seven-point blob from Palawan to Samar and
// Sulu, from 1550 — fifteen years before Legazpi — over Sulu, Lanao and Cotabato, which Spain never
// held) is dropped: Spanish Philippines is drawn above, island by island. The Day 59 Tondo, Sulu and
// Maguindanao shapes are replaced by id (Tondo without Maynila, which is now its own polity).
export const philippinesShapeFixes = { 'spanish-empire': { dropRegions: ['philippines'] } };

/** Apply `philippinesShapeFixes` (throws if a target is missing). */
export function applyPhilippinesShapeFixes(entities) {
  for (const [id, { dropRegions }] of Object.entries(philippinesShapeFixes)) {
    const ent = entities.find((e) => e.id === id);
    if (!ent) throw new Error(`philippines fixes: no entity ${id}`);
    let dropped = 0;
    for (const kf of ent.overlays) {
      const before = kf.regions.length;
      kf.regions = kf.regions.filter((r) => !dropRegions.includes(typeof r === 'string' ? r : r.id));
      dropped += before - kf.regions.length;
    }
    if (!dropped) throw new Error(`philippines fixes: ${id} has no ${dropRegions.join(', ')} region`);
  }
}
