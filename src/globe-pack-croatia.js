/**
 * Day 90 — Phase 5 country pack 5, Southeast Europe: Croatia (ROADMAP item 5, fourth country).
 *
 * Croatia had no country timeline. On the globe before the 1815 nations layer nothing showed the
 * Croatian duchy and kingdom, the union with Hungary, Habsburg Croatia and Slavonia, the Military
 * Frontier, the Republic of Ragusa or the Illyrian Provinces. Instead Venice's schematic 'dalmatia'
 * region (a six-point blob, keyframes 1200 and 1500) painted the whole Dalmatian hinterland, Lika
 * and western Bosnia as Venetian from the 10th century to the 1660s, and the Ottoman Balkans ring
 * painted Split, Šibenik, Hvar and Dubrovnik as Ottoman from 1580/1650 to the 1750s. The nations
 * layer draws Croatia (id `croatia`) only from 1991; from 1815 it shows the Austrian Empire there.
 * This pack uses other ids and has no keyframe after 1813. Krapina, Vučedol, the Illyrians and
 * Greek colonies, Roman Dalmatia (drawn by the Roman ring), the migrations, and everything after
 * 1813 are timeline items with pins, not outlines.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - 20 new pieces from Natural Earth 1:10m provinces (public domain): Croatia's 21 counties
 *    grouped into 15 historical regions (Međimurje, Hungarian until 1918, is left out), the three
 *    Dalmatian counties split into a coastal strip (within 0.13° of the sea: the districts of the
 *    Venetian towns) and the hinterland, Split's strip cut again at 16.75°E (Makarska), the
 *    Dubrovnik exclave (Ragusa, with Pelješac and Konavle) and Slovenia's Carniola and Littoral
 *    regions (for the Illyrian Provinces). Clipped to the globe's own land (shapes 108, 107 and,
 *    for the Dubrovnik exclave that shape 108 leaves out, 93) and simplified as one coverage.
 *    Generator: et-tools day90-pieces.py (outside the repo).
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - Venice's 'dalmatia' region is dropped (`applyCroatiaShapeFixes`): Venetian Dalmatia is now its
 *    own polity drawn from the coastal pieces (1409–1797), and Venice keeps its lagoon and Istria.
 *  - Trims (precomputed rings, OTT_TRIM_RINGS): the Ottoman 'anatolia-balkans' held steps (Day 89)
 *    are cut back from the pack's shapes active in each step (buffered 0.05°, simplified): Ragusa
 *    paid tribute but was never Ottoman land, the Venetian coastal towns were Venetian, and Slavonia,
 *    Lika and the Dalmatian hinterland were Habsburg or Venetian again after Karlowitz (1699), so
 *    the step 1683–1717 is split at 1699. `applyCroatiaShapeFixes` throws if a source ring changes.
 *    The Byzantine 1019/1025 box (west edge on 19°E) is notched east round Osijek's Danube bank.
 *  - Pieces are regions, not surveyed borders (see each polity's confidence reason).
 */

import { ensureClockwise, morphEntityAtYear } from './globe-morph.js';
import { resolveRegionHoles } from './globe-holes.js';
import { mergeRings } from './globe-med-pieces.js';

const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });

export const HR_PIECES = {
  ZAGREB: [[15.8798, 46.2586], [15.895, 46.228], [15.9379, 46.2181], [15.96, 46.1937], [16.0396, 46.1846], [16.1581, 46.1876], [16.2006, 46.2123], [16.2474, 46.1876], [16.2559, 46.0611], [16.2938, 46.0128], [16.3592, 46.0246], [16.4436, 46.0041], [16.4753, 45.9581], [16.5199, 45.9755], [16.6011, 45.927], [16.6926, 45.9242], [16.6884, 45.8392], [16.6449, 45.8201], [16.6221, 45.8419], [16.5932, 45.7798], [16.5318, 45.7884], [16.4967, 45.7651], [16.4401, 45.8205], [16.3816, 45.812], [16.3732, 45.749], [16.32, 45.7483], [16.2939, 45.7279], [16.2973, 45.6423], [16.2782, 45.613], [16.2379, 45.5968], [16.1479, 45.6341], [16.0495, 45.581], [16.1019, 45.5333], [16.1108, 45.5064], [16.0465, 45.4759], [16.0074, 45.4852], [15.9359, 45.4748], [15.9285, 45.5031], [15.8644, 45.5473], [15.8129, 45.5234], [15.7799, 45.5225], [15.7392, 45.5589], [15.7316, 45.5886], [15.6264, 45.6214], [15.5756, 45.6024], [15.5137, 45.6324], [15.5131, 45.6473], [15.4209, 45.6953], [15.35, 45.6696], [15.3208, 45.682], [15.2516, 45.7137], [15.3295, 45.7521], [15.3584, 45.7588], [15.4316, 45.775], [15.55, 45.8237], [15.6261, 45.8202], [15.6761, 45.8417], [15.6683, 45.8681], [15.6764, 45.9729], [15.698, 46.0362], [15.6224, 46.0773], [15.626, 46.1945], [15.678, 46.2145], [15.7498, 46.2108], [15.8003, 46.249], [15.8798, 46.2586]],
  VARAZDIN: [[15.895, 46.228], [15.8798, 46.2586], [15.9984, 46.2915], [16.054, 46.3217], [16.0904, 46.3728], [16.178, 46.3754], [16.2171, 46.3674], [16.2816, 46.3781], [16.3183, 46.3687], [16.3613, 46.32], [16.4838, 46.3018], [16.5856, 46.3168], [16.7452, 46.3057], [16.7723, 46.2874], [16.7579, 46.247], [16.664, 46.2009], [16.596, 46.2031], [16.4466, 46.1354], [16.4275, 46.145], [16.3496, 46.1225], [16.3592, 46.0246], [16.2938, 46.0128], [16.2559, 46.0611], [16.2474, 46.1876], [16.2006, 46.2123], [16.1581, 46.1876], [16.0396, 46.1846], [15.96, 46.1937], [15.9379, 46.2181], [15.895, 46.228]],
  KRIZEVCI: [[16.4436, 46.0041], [16.3592, 46.0246], [16.3496, 46.1225], [16.4275, 46.145], [16.4466, 46.1354], [16.596, 46.2031], [16.664, 46.2009], [16.7579, 46.247], [16.7723, 46.2874], [16.7452, 46.3057], [16.815, 46.2844], [16.8594, 46.3648], [16.8892, 46.2922], [16.9748, 46.2106], [17.0529, 46.1535], [17.1162, 46.1231], [17.1994, 46.1203], [17.3066, 45.9799], [17.2169, 45.981], [17.1351, 45.9159], [17.1404, 45.8703], [17.2772, 45.8033], [17.2788, 45.7825], [17.3236, 45.7505], [17.3533, 45.7548], [17.3852, 45.7025], [17.4226, 45.7181], [17.4898, 45.693], [17.492, 45.6751], [17.4245, 45.5924], [17.4423, 45.5582], [17.4185, 45.5133], [17.3351, 45.5175], [17.2336, 45.5058], [17.185, 45.5283], [17.1467, 45.5142], [17.0164, 45.5045], [16.9691, 45.5204], [16.9442, 45.547], [16.9292, 45.4759], [16.8513, 45.4846], [16.8309, 45.5104], [16.8687, 45.5228], [16.8173, 45.5666], [16.7907, 45.6091], [16.6561, 45.6597], [16.6168, 45.6628], [16.5647, 45.6973], [16.5007, 45.722], [16.4967, 45.7651], [16.5318, 45.7884], [16.5932, 45.7798], [16.6221, 45.8419], [16.6449, 45.8201], [16.6884, 45.8392], [16.6926, 45.9242], [16.6011, 45.927], [16.5199, 45.9755], [16.4753, 45.9581], [16.4436, 46.0041]],
  SISAK: [[16.4401, 45.8205], [16.4967, 45.7651], [16.5007, 45.722], [16.5647, 45.6973], [16.6168, 45.6628], [16.6561, 45.6597], [16.7907, 45.6091], [16.8173, 45.5666], [16.8687, 45.5228], [16.8309, 45.5104], [16.8513, 45.4846], [16.9292, 45.4759], [16.9987, 45.4435], [17.0229, 45.4186], [17.0533, 45.4258], [17.062, 45.3782], [17.1438, 45.3419], [17.1812, 45.3479], [17.2006, 45.2946], [17.1508, 45.2811], [17.0816, 45.2161], [17.1246, 45.1691], [16.9256, 45.2845], [16.7857, 45.179], [16.587, 45.2209], [16.5289, 45.2223], [16.4819, 45.1995], [16.4298, 45.1299], [16.3818, 45.1076], [16.3459, 45.0198], [16.2146, 45.0307], [16.0906, 45.1373], [16.0204, 45.2139], [15.8789, 45.2172], [15.8023, 45.1966], [15.7593, 45.2098], [15.7049, 45.2009], [15.6394, 45.2107], [15.6312, 45.2395], [15.6616, 45.2681], [15.6639, 45.3396], [15.6796, 45.3488], [15.6568, 45.4152], [15.6765, 45.4252], [15.8141, 45.3987], [15.8425, 45.4659], [15.8129, 45.5234], [15.8644, 45.5473], [15.9285, 45.5031], [15.9359, 45.4748], [16.0074, 45.4852], [16.0465, 45.4759], [16.1108, 45.5064], [16.1019, 45.5333], [16.0495, 45.581], [16.1479, 45.6341], [16.2379, 45.5968], [16.2782, 45.613], [16.2973, 45.6423], [16.2939, 45.7279], [16.32, 45.7483], [16.3732, 45.749], [16.3816, 45.812], [16.4401, 45.8205]],
  KARLOVAC: [[15.7799, 45.5225], [15.8129, 45.5234], [15.8425, 45.4659], [15.8141, 45.3987], [15.6765, 45.4252], [15.6568, 45.4152], [15.6796, 45.3488], [15.6639, 45.3396], [15.6616, 45.2681], [15.6312, 45.2395], [15.6394, 45.2107], [15.7049, 45.2009], [15.7593, 45.2098], [15.8023, 45.1966], [15.781, 45.168], [15.7825, 45.1208], [15.7339, 44.9343], [15.6561, 44.9476], [15.6103, 44.9298], [15.5525, 44.9491], [15.5345, 44.9328], [15.5668, 44.8786], [15.5049, 44.9206], [15.4642, 44.9242], [15.3765, 45.0263], [15.2425, 45.0847], [15.1942, 45.1258], [15.1255, 45.1053], [15.008, 45.1241], [14.9709, 45.1498], [14.9862, 45.2411], [14.9709, 45.2683], [14.9941, 45.3118], [15.0292, 45.3286], [15.1224, 45.2933], [15.1742, 45.3246], [15.221, 45.3748], [15.2258, 45.4365], [15.226, 45.4365], [15.2264, 45.4364], [15.2286, 45.4372], [15.314, 45.4505], [15.3605, 45.4815], [15.3632, 45.4824], [15.284, 45.5716], [15.3238, 45.6316], [15.3738, 45.6402], [15.35, 45.6696], [15.4209, 45.6953], [15.5131, 45.6473], [15.5137, 45.6324], [15.5756, 45.6024], [15.6264, 45.6214], [15.7316, 45.5886], [15.7392, 45.5589], [15.7799, 45.5225]],
  SLAV_W: [[17.2169, 45.981], [17.3066, 45.9799], [17.3453, 45.9557], [17.3892, 45.9631], [17.4062, 45.9437], [17.4686, 45.9554], [17.593, 45.9348], [17.6647, 45.8416], [17.8092, 45.8144], [17.858, 45.7759], [17.9063, 45.7917], [17.948, 45.7242], [17.9819, 45.7181], [18.0099, 45.6748], [18.0769, 45.6456], [18.0832, 45.6303], [18.1516, 45.6203], [18.2239, 45.5778], [18.1943, 45.5351], [18.2351, 45.511], [18.2776, 45.5116], [18.3047, 45.4928], [18.376, 45.4973], [18.3943, 45.523], [18.4412, 45.4737], [18.3491, 45.455], [18.2937, 45.4579], [18.2376, 45.4263], [18.1859, 45.4214], [18.077, 45.3451], [18.1082, 45.3024], [18.0816, 45.2715], [18.1342, 45.2429], [18.201, 45.2254], [18.2679, 45.2281], [18.3267, 45.2464], [18.4867, 45.2116], [18.5369, 45.1935], [18.5034, 45.1555], [18.5348, 45.0884], [18.481, 45.0672], [18.412, 45.1124], [18.3458, 45.1215], [18.2396, 45.1577], [18.1424, 45.0978], [18.02, 45.1493], [17.8368, 45.0645], [17.7145, 45.152], [17.6847, 45.164], [17.63, 45.1573], [17.5722, 45.1204], [17.2676, 45.1898], [17.1246, 45.1691], [17.0816, 45.2161], [17.1508, 45.2811], [17.2006, 45.2946], [17.1812, 45.3479], [17.1438, 45.3419], [17.062, 45.3782], [17.0533, 45.4258], [17.0229, 45.4186], [16.9987, 45.4435], [16.9292, 45.4759], [16.9442, 45.547], [16.9691, 45.5204], [17.0164, 45.5045], [17.1467, 45.5142], [17.185, 45.5283], [17.2336, 45.5058], [17.3351, 45.5175], [17.4185, 45.5133], [17.4423, 45.5582], [17.4245, 45.5924], [17.492, 45.6751], [17.4898, 45.693], [17.4226, 45.7181], [17.3852, 45.7025], [17.3533, 45.7548], [17.3236, 45.7505], [17.2788, 45.7825], [17.2772, 45.8033], [17.1404, 45.8703], [17.1351, 45.9159], [17.2169, 45.981]],
  OSIJEK: [[17.948, 45.7242], [17.9063, 45.7917], [17.987, 45.7899], [18.0805, 45.7717], [18.129, 45.7854], [18.2108, 45.7848], [18.3177, 45.7473], [18.3466, 45.7566], [18.4124, 45.743], [18.4862, 45.79], [18.5303, 45.7909], [18.5855, 45.8269], [18.6275, 45.8799], [18.6752, 45.9102], [18.7633, 45.884], [18.9014, 45.9309], [18.848, 45.8099], [18.9057, 45.7435], [18.9173, 45.7066], [18.9685, 45.6687], [18.9124, 45.6192], [18.9036, 45.5731], [18.932, 45.5455], [19.0168, 45.4979], [19.0023, 45.4437], [18.9385, 45.4325], [18.8822, 45.4781], [18.7886, 45.4554], [18.7869, 45.4136], [18.7141, 45.4161], [18.655, 45.3916], [18.6323, 45.3214], [18.5119, 45.2926], [18.5067, 45.251], [18.5679, 45.2266], [18.5369, 45.1935], [18.4867, 45.2116], [18.3267, 45.2464], [18.2679, 45.2281], [18.201, 45.2254], [18.1342, 45.2429], [18.0816, 45.2715], [18.1082, 45.3024], [18.077, 45.3451], [18.1859, 45.4214], [18.2376, 45.4263], [18.2937, 45.4579], [18.3491, 45.455], [18.4412, 45.4737], [18.3943, 45.523], [18.376, 45.4973], [18.3047, 45.4928], [18.2776, 45.5116], [18.2351, 45.511], [18.1943, 45.5351], [18.2239, 45.5778], [18.1516, 45.6203], [18.0832, 45.6303], [18.0769, 45.6456], [18.0099, 45.6748], [17.9819, 45.7181], [17.948, 45.7242]],
  SRIJEM: [[18.5034, 45.1555], [18.5369, 45.1935], [18.5679, 45.2266], [18.5067, 45.251], [18.5119, 45.2926], [18.6323, 45.3214], [18.655, 45.3916], [18.7141, 45.4161], [18.7869, 45.4136], [18.7886, 45.4554], [18.8822, 45.4781], [18.9385, 45.4325], [19.0023, 45.4437], [18.9775, 45.3712], [19.0387, 45.3452], [19.1036, 45.2985], [19.2898, 45.2363], [19.3774, 45.2296], [19.3941, 45.1717], [19.1216, 45.1953], [19.0449, 45.1372], [19.0628, 45.1145], [19.0784, 44.9111], [19.0184, 44.9257], [18.9914, 44.9149], [19.0158, 44.8656], [18.9703, 44.8627], [18.8401, 44.8772], [18.783, 44.9539], [18.8046, 44.9738], [18.789, 45.0057], [18.7346, 45.0191], [18.6896, 45.0797], [18.6263, 45.0831], [18.6167, 45.0977], [18.5348, 45.0884], [18.5034, 45.1555]],
  ZADAR_IN: [[15.6561, 44.9476], [15.7339, 44.9343], [15.716, 44.787], [15.7593, 44.7342], [15.806, 44.6965], [15.8955, 44.7186], [15.969, 44.6392], [16.0413, 44.5878], [16.0061, 44.541], [16.0473, 44.5233], [16.0837, 44.5349], [16.1156, 44.5209], [16.1599, 44.4007], [16.1388, 44.3854], [16.1996, 44.3621], [16.1876, 44.2824], [16.2158, 44.2082], [16.3269, 44.0824], [16.5253, 43.968], [16.4703, 43.9643], [16.4105, 43.9226], [16.3509, 43.9262], [16.3187, 43.9409], [16.2312, 43.9184], [16.1701, 43.9269], [16.1541, 43.9445], [16.1487, 44.0264], [16.0923, 44.0113], [16.0327, 44.0127], [16.0015, 43.9497], [15.9601, 43.9413], [15.9037, 43.9091], [15.8387, 43.9391], [15.773, 43.9374], [15.7878, 43.9189], [15.7745, 43.9051], [15.6178, 43.9867], [15.4066, 44.1538], [15.4965, 44.1335], [15.5091, 44.1313], [15.5217, 44.1303], [15.5345, 44.1306], [15.5471, 44.1321], [15.5595, 44.1349], [15.5716, 44.1389], [15.5833, 44.144], [15.5944, 44.1502], [15.6048, 44.1575], [15.6145, 44.1658], [15.6233, 44.175], [15.6311, 44.185], [15.638, 44.1957], [15.6438, 44.207], [15.6484, 44.2189], [15.6518, 44.2311], [15.6541, 44.2437], [15.6551, 44.2564], [15.6549, 44.2691], [15.6534, 44.2817], [15.6507, 44.2942], [15.6468, 44.3063], [15.6417, 44.3179], [15.6355, 44.329], [15.6282, 44.3395], [15.62, 44.3492], [15.6108, 44.358], [15.6009, 44.366], [15.5988, 44.3673], [15.616, 44.3793], [15.634, 44.4217], [15.5911, 44.4572], [15.6535, 44.495], [15.6231, 44.5413], [15.5628, 44.5817], [15.5558, 44.6309], [15.5357, 44.6481], [15.5167, 44.7047], [15.4763, 44.7296], [15.4828, 44.752], [15.5331, 44.755], [15.602, 44.7967], [15.5272, 44.839], [15.5668, 44.8786], [15.5345, 44.9328], [15.5525, 44.9491], [15.6103, 44.9298], [15.6561, 44.9476]],
  LIKA: [[15.5049, 44.9206], [15.5668, 44.8786], [15.5272, 44.839], [15.602, 44.7967], [15.5331, 44.755], [15.4828, 44.752], [15.4763, 44.7296], [15.5167, 44.7047], [15.5357, 44.6481], [15.5558, 44.6309], [15.5628, 44.5817], [15.6231, 44.5413], [15.6535, 44.495], [15.5911, 44.4572], [15.634, 44.4217], [15.616, 44.3793], [15.5988, 44.3673], [15.546, 44.3305], [15.4941, 44.3688], [15.4178, 44.3742], [15.3515, 44.4118], [15.3281, 44.4117], [15.2942, 44.3652], [15.1541, 44.4676], [15.0801, 44.5361], [15.0032, 44.578], [14.9023, 44.6895], [14.8904, 44.8808], [14.9216, 44.9588], [14.8813, 45.0356], [14.9265, 45.0776], [15.0127, 45.0723], [15.0272, 45.0974], [15.008, 45.1241], [15.1255, 45.1053], [15.1942, 45.1258], [15.2425, 45.0847], [15.3765, 45.0263], [15.4642, 44.9242], [15.5049, 44.9206]],
  RIJEKA: [[14.9709, 45.1498], [15.008, 45.1241], [15.0272, 45.0974], [15.0127, 45.0723], [14.9265, 45.0776], [14.8813, 45.0356], [14.8528, 45.0937], [14.7456, 45.1485], [14.5819, 45.2859], [14.3298, 45.354], [14.272, 45.2901], [14.2347, 45.1546], [14.2026, 45.1716], [14.1946, 45.275], [14.2105, 45.3278], [14.2036, 45.4039], [14.1389, 45.4343], [14.1173, 45.4727], [14.312, 45.4769], [14.3728, 45.4778], [14.4689, 45.5256], [14.4913, 45.578], [14.5414, 45.6342], [14.5436, 45.6364], [14.5441, 45.6372], [14.5675, 45.6636], [14.5935, 45.6386], [14.616, 45.5941], [14.664, 45.57], [14.6685, 45.534], [14.7811, 45.4933], [14.7972, 45.4652], [14.8388, 45.459], [14.8819, 45.4701], [14.9765, 45.4918], [14.9825, 45.4912], [14.9894, 45.4898], [15.0074, 45.4808], [15.0369, 45.4803], [15.065, 45.4746], [15.1393, 45.43], [15.2258, 45.4365], [15.221, 45.3748], [15.1742, 45.3246], [15.1224, 45.2933], [15.0292, 45.3286], [14.9941, 45.3118], [14.9709, 45.2683], [14.9862, 45.2411], [14.9709, 45.1498]],
  ISTRIA: [[14.2026, 45.1716], [14.2347, 45.1546], [14.1541, 45.072], [14.1637, 44.9958], [14.1013, 44.9743], [14.0689, 44.9495], [14.0838, 44.9864], [14.0403, 45.039], [14.0443, 45.0014], [14.0757, 44.9837], [14.0393, 44.934], [13.9735, 44.9013], [13.9426, 44.8155], [13.6135, 45.1173], [13.6385, 45.13], [13.7262, 45.1345], [13.6836, 45.1434], [13.6122, 45.1368], [13.6027, 45.2789], [13.5063, 45.5099], [13.5895, 45.4888], [13.6241, 45.4627], [13.6609, 45.46], [13.8156, 45.4357], [13.8356, 45.4291], [13.8897, 45.424], [13.8907, 45.4239], [13.8925, 45.4255], [13.9826, 45.4753], [13.9646, 45.4905], [13.9879, 45.5117], [14.0359, 45.4972], [14.0667, 45.4803], [14.1163, 45.473], [14.1173, 45.4727], [14.1389, 45.4343], [14.2036, 45.4039], [14.2105, 45.3278], [14.1946, 45.275], [14.2026, 45.1716]],
  ZADAR_C: [[15.546, 44.3305], [15.5988, 44.3673], [15.6009, 44.366], [15.6108, 44.358], [15.62, 44.3492], [15.6282, 44.3395], [15.6355, 44.329], [15.6417, 44.3179], [15.6468, 44.3063], [15.6507, 44.2942], [15.6534, 44.2817], [15.6549, 44.2691], [15.6551, 44.2564], [15.6541, 44.2437], [15.6518, 44.2311], [15.6484, 44.2189], [15.6438, 44.207], [15.638, 44.1957], [15.6311, 44.185], [15.6233, 44.175], [15.6145, 44.1658], [15.6048, 44.1575], [15.5944, 44.1502], [15.5833, 44.144], [15.5716, 44.1389], [15.5595, 44.1349], [15.5471, 44.1321], [15.5345, 44.1306], [15.5217, 44.1303], [15.5091, 44.1313], [15.4965, 44.1335], [15.4066, 44.1538], [15.6178, 43.9867], [15.7745, 43.9051], [15.7399, 43.8692], [15.6855, 43.8895], [15.629, 43.8659], [15.5752, 43.8966], [15.5473, 43.8768], [15.1445, 44.1955], [15.1522, 44.2353], [15.1112, 44.2645], [15.1595, 44.2754], [15.1766, 44.2499], [15.2231, 44.2897], [15.2796, 44.2518], [15.2817, 44.2854], [15.3092, 44.3091], [15.4245, 44.268], [15.5252, 44.2607], [15.406, 44.3206], [15.2942, 44.3652], [15.3281, 44.4117], [15.3515, 44.4118], [15.4178, 44.3742], [15.4941, 44.3688], [15.546, 44.3305]],
  SPLIT_IN: [[16.4703, 43.9643], [16.5253, 43.968], [16.7132, 43.7712], [17.0846, 43.5132], [17.1428, 43.4893], [17.2388, 43.4785], [17.2676, 43.3531], [17.2899, 43.3034], [17.3287, 43.2604], [17.3801, 43.2276], [17.3939, 43.2121], [17.148, 43.3461], [16.9681, 43.5038], [16.9587, 43.5113], [16.9487, 43.5179], [16.9382, 43.5235], [16.9271, 43.5281], [16.9157, 43.5317], [16.904, 43.5342], [16.75, 43.5602], [16.6592, 43.5756], [16.378, 43.6737], [16.366, 43.6773], [16.3537, 43.6796], [16.3413, 43.6808], [16.3288, 43.6808], [16.3164, 43.6796], [16.1276, 43.652], [16.1606, 43.6829], [16.2287, 43.6707], [16.3417, 43.71], [16.3569, 43.7783], [16.4255, 43.8123], [16.4267, 43.8315], [16.3429, 43.8848], [16.3509, 43.9262], [16.4105, 43.9226], [16.4703, 43.9643]],
  SIBENIK_IN: [[16.3187, 43.9409], [16.3509, 43.9262], [16.3429, 43.8848], [16.4267, 43.8315], [16.4255, 43.8123], [16.3569, 43.7783], [16.3417, 43.71], [16.2287, 43.6707], [16.1606, 43.6829], [16.1276, 43.652], [16.0579, 43.6418], [16.0601, 43.6543], [16.0616, 43.6668], [16.0619, 43.6794], [16.061, 43.692], [16.0589, 43.7044], [16.0556, 43.7166], [16.0511, 43.7284], [16.0455, 43.7397], [16.0388, 43.7504], [16.0312, 43.7604], [16.0226, 43.7696], [16.0131, 43.7779], [16.0029, 43.7853], [15.992, 43.7917], [15.7745, 43.9051], [15.7878, 43.9189], [15.773, 43.9374], [15.8387, 43.9391], [15.9037, 43.9091], [15.9601, 43.9413], [16.0015, 43.9497], [16.0327, 44.0127], [16.0923, 44.0113], [16.1487, 44.0264], [16.1541, 43.9445], [16.1701, 43.9269], [16.2312, 43.9184], [16.3187, 43.9409]],
  SIBENIK_C: [[15.7399, 43.8692], [15.7745, 43.9051], [15.992, 43.7917], [16.0029, 43.7853], [16.0131, 43.7779], [16.0226, 43.7696], [16.0312, 43.7604], [16.0388, 43.7504], [16.0455, 43.7397], [16.0511, 43.7284], [16.0556, 43.7166], [16.0589, 43.7044], [16.061, 43.692], [16.0619, 43.6794], [16.0616, 43.6668], [16.0601, 43.6543], [16.0579, 43.6418], [16.1276, 43.652], [16.0917, 43.6183], [16.0453, 43.5969], [16.0779, 43.5431], [16.0436, 43.534], [16.0512, 43.5111], [16.0128, 43.504], [15.918, 43.5933], [15.9424, 43.648], [15.9316, 43.6766], [15.844, 43.7299], [15.7721, 43.7597], [15.6388, 43.8361], [15.5473, 43.8768], [15.5752, 43.8966], [15.629, 43.8659], [15.6855, 43.8895], [15.7399, 43.8692]],
  SPLIT_C: [[16.0917, 43.6183], [16.1276, 43.652], [16.3164, 43.6796], [16.3288, 43.6808], [16.3413, 43.6808], [16.3537, 43.6796], [16.366, 43.6773], [16.378, 43.6737], [16.6592, 43.5756], [16.75, 43.5602], [16.75, 43.4285], [16.6268, 43.4493], [16.5348, 43.4971], [16.4239, 43.52], [16.4734, 43.5382], [16.4338, 43.5498], [16.3368, 43.5512], [16.0128, 43.504], [16.0512, 43.5111], [16.0436, 43.534], [16.0779, 43.5431], [16.0453, 43.5969], [16.0917, 43.6183]],
  MAKARSKA: [[17.3939, 43.2121], [17.4509, 43.1482], [17.4063, 43.1418], [17.3531, 43.1568], [17.4063, 43.1005], [17.3657, 43.0794], [17.3163, 43.1273], [17.1902, 43.1751], [17.0735, 43.239], [16.9339, 43.3736], [16.8824, 43.4061], [16.75, 43.4285], [16.75, 43.5602], [16.904, 43.5342], [16.9157, 43.5317], [16.9271, 43.5281], [16.9382, 43.5235], [16.9487, 43.5179], [16.9587, 43.5113], [16.9681, 43.5038], [17.148, 43.3461], [17.3939, 43.2121]],
  RAGUSA: [[18.4443, 42.4779], [18.4929, 42.4424], [18.4284, 42.4551], [18.4119, 42.476], [18.2922, 42.5335], [18.2206, 42.5792], [18.2175, 42.6201], [18.0929, 42.6482], [18.0479, 42.6906], [18.0033, 42.7007], [17.8076, 42.8124], [17.7548, 42.792], [17.4405, 42.8737], [17.4427, 42.8986], [17.3509, 42.9218], [17.2713, 42.9634], [17.2031, 42.9842], [17.2388, 43.0228], [17.462, 42.9211], [17.5815, 42.9019], [17.6737, 42.8751], [17.716, 42.8442], [17.7074, 42.887], [17.6575, 42.889], [17.81, 42.9078], [17.8272, 42.8531], [17.8571, 42.8148], [17.9568, 42.7675], [17.9953, 42.7404], [18.2241, 42.6281], [18.3027, 42.6035], [18.3683, 42.5723], [18.438, 42.5568], [18.4443, 42.4779]],
  CARNIOLA: [[15.3584, 45.7588], [15.3308, 45.7527], [15.3295, 45.7521], [15.2635, 45.7304], [15.2489, 45.7118], [15.3049, 45.6721], [15.3208, 45.682], [15.3488, 45.6691], [15.3238, 45.6316], [15.2686, 45.6017], [15.2967, 45.523], [15.3605, 45.4815], [15.2286, 45.4372], [15.226, 45.4365], [15.065, 45.4746], [15.0562, 45.4799], [15.0369, 45.4803], [14.9894, 45.4898], [14.9863, 45.4909], [14.9825, 45.4912], [14.9779, 45.4922], [14.9765, 45.4918], [14.9044, 45.5144], [14.8819, 45.4701], [14.6647, 45.5702], [14.5935, 45.6386], [14.5809, 45.6678], [14.5639, 45.6627], [14.5441, 45.6372], [14.5414, 45.6342], [14.4986, 45.5962], [14.4913, 45.578], [14.3731, 45.4782], [14.312, 45.4769], [14.2187, 45.4972], [14.1163, 45.473], [14.0359, 45.4972], [14.014, 45.508], [13.9719, 45.5142], [13.9646, 45.4905], [13.8925, 45.4255], [13.8897, 45.424], [13.8156, 45.4357], [13.7593, 45.4632], [13.6609, 45.46], [13.5895, 45.4889], [13.6098, 45.5379], [13.7529, 45.5529], [13.7118, 45.5932], [13.7611, 45.5962], [13.8005, 45.5813], [13.8478, 45.5847], [13.8943, 45.6343], [13.8371, 45.6745], [13.7787, 45.7434], [13.6603, 45.792], [13.5739, 45.8196], [13.5987, 45.9114], [13.6228, 45.9664], [13.5984, 45.9842], [13.4623, 46.0064], [13.5277, 46.078], [13.6164, 46.125], [13.645, 46.1617], [13.6374, 46.1804], [13.4227, 46.2293], [13.3975, 46.3074], [13.6884, 46.4678], [13.701, 46.5191], [14.0172, 46.4828], [14.1499, 46.4401], [14.2452, 46.4382], [14.437, 46.4189], [14.518, 46.402], [14.5687, 46.3688], [14.6399, 46.3664], [14.6467, 46.3339], [14.704, 46.2698], [14.753, 46.2543], [14.8548, 46.2529], [14.9301, 46.2188], [14.9374, 46.1919], [14.9999, 46.199], [15.111, 46.1873], [15.1885, 46.1162], [15.1634, 46.0925], [15.1063, 46.0935], [15.0783, 46.0485], [15.1161, 46.0042], [15.1807, 45.9514], [15.2386, 45.9244], [15.3171, 45.9571], [15.363, 45.9348], [15.3506, 45.8917], [15.3881, 45.8766], [15.4011, 45.8099], [15.4291, 45.7753], [15.3584, 45.7588]],
};

function P(ids) {
  return ids.map((id) => {
    const r = HR_PIECES[id];
    if (!r) throw new Error(`croatia pack: missing piece ${id}`);
    return r;
  });
}

export const HR_STEPS = {};
function build(meta, steps) {
  HR_STEPS[meta.id] = steps;
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
    return { year: y, label: s[1], approximation: 'simplified', regions };
  });
  return { edgeGrace: 1, keyYears: steps.map(([y]) => y), type: 'state', ...meta, overlays };
}
const conf = (level, reason) => ({ level, reason });

// Piece groups.
const DAL_C = ['ZADAR_C', 'SIBENIK_C', 'SPLIT_C']; // the coastal towns' districts
const HINTER = ['ZADAR_IN', 'SIBENIK_IN', 'SPLIT_IN']; // the Dalmatian hinterland (Benkovac, Knin, Sinj, Imotski)
const PANNONIA = ['ZAGREB', 'SISAK', 'KARLOVAC', 'KRIZEVCI', 'VARAZDIN', 'SLAV_W', 'OSIJEK'];

// ---- Duchy and Kingdom of Croatia (879–1101) ---------------------------------------------------
const dalmatianCroatia = ['RIJEKA', 'LIKA', ...DAL_C, ...HINTER];
const k879 = { croatia: ['Dalmatian Croatia', dalmatianCroatia] };
const k925 = { croatia: ['Dalmatian Croatia', dalmatianCroatia], pannonia: ['Pannonian Croatia (Slavonia)', PANNONIA] };
const kingdomOfCroatia = build({
  id: 'kingdom-of-croatia', name: 'Kingdom of Croatia', color: '#C0262D',
  nameAt: [
    [879, 'Duchy of Croatia (Branimir)'],
    [925, 'Kingdom of Croatia (Tomislav)'],
    [1058, 'Kingdom of Croatia and Dalmatia (Peter Krešimir IV)'],
    [1075, 'Kingdom of Croatia and Dalmatia (Zvonimir)'],
    [1091, 'Kingdom of Croatia (succession war)'],
  ],
  description: 'The Trpimirović duchy and kingdom of the Croats. Duke Branimir broke with the Franks and Byzantium and was blessed by Pope John VIII in 879; Tomislav, called king in 925, joined Dalmatian and Pannonian Croatia and fought off the Hungarians and the Bulgarians. Its seats were Nin, Knin, Biograd and Solin. Peter Krešimir IV (1058–1074) brought the Byzantine Dalmatian towns under the crown, and Demetrius Zvonimir was crowned by a papal legate in 1075/1076. When his line died out, Ladislaus I of Hungary took Slavonia (1091); Petar Snačić, the last native king, fell at Gvozd Mountain in 1097, and Coloman of Hungary was crowned king of Croatia in 1102.',
  timelineItemIds: ['hr-duchy', 'hr-kingdom'],
  confidence: conf('conjectural', 'The rulers, synods and charters are known (papal letters, the Split synods, De Administrando Imperio, royal charters), but the borders are not: the outlines are modern Croatian counties. The Byzantine Dalmatian towns (Zadar, Trogir, Split) and the islands are inside the coastal pieces from 879, though they came under the kings only around 1069; Pagania (the Neretva principality, Makarska and the Neretva mouth), Istria and the Croatian lands in western Bosnia are not drawn, and Pannonian Croatia (the Sava–Drava land) under Tomislav is a reconstruction. Slavonia after 1091 is left blank (Hungary is not drawn on the globe).'),
  sources: [W('Kingdom of Croatia (925–1102)'), W('Duchy of Croatia'), W('Branimir of Croatia'), W('Tomislav of Croatia'), W('Peter Krešimir IV of Croatia'), W('Battle of Gvozd Mountain')],
}, [
  [879, 'Branimir: the duchy blessed by Pope John VIII', k879],
  [925, 'Tomislav, first king: Dalmatian and Pannonian Croatia', k925],
  [1058, 'Peter Krešimir IV', k925],
  [1075, 'Zvonimir crowned at Solin', k925],
  [1091, 'Ladislaus I of Hungary takes Slavonia', k879],
  [1097, 'Petar Snačić falls at Gvozd Mountain', k879],
  [1101, 'Coloman of Hungary marches in (crowned 1102)', k879],
]);

// ---- Kingdom of Croatia and Slavonia, in union with Hungary, then Habsburg (1102–1813) ---------
const SLAV = ['ZAGREB', 'VARAZDIN', 'KRIZEVCI', 'SISAK', 'SLAV_W', 'OSIJEK', 'SRIJEM'];
const CRO = ['RIJEKA', 'LIKA', 'KARLOVAC', ...HINTER];
const u1102 = { croatia: ['Croatia', CRO], dalmatia: ['Dalmatia (the towns)', DAL_C], slavonia: ['Slavonia', SLAV] };
const u1409 = { croatia: ['Croatia', CRO], dalmatia: ['Dalmatia (Šibenik, Trogir, Split)', ['SIBENIK_C', 'SPLIT_C']], slavonia: ['Slavonia', SLAV] };
const u1420 = { croatia: ['Croatia', CRO], slavonia: ['Slavonia', SLAV] };
const u1522 = { croatia: ['Croatia', ['RIJEKA', 'LIKA', 'KARLOVAC', 'ZADAR_IN']], klis: ['Klis and the Split hinterland', ['SPLIT_IN']], slavonia: ['Slavonia', SLAV] };
const u1526 = { croatia: ['Croatia', ['RIJEKA', 'LIKA', 'KARLOVAC', 'ZADAR_IN']], klis: ['Klis and the Split hinterland', ['SPLIT_IN']], slavonia: ['Slavonia', ['ZAGREB', 'VARAZDIN', 'KRIZEVCI', 'SISAK', 'SLAV_W']] };
const u1527 = { croatia: ['Croatia', ['RIJEKA', 'KARLOVAC']], klis: ['Klis (held until 1537)', ['SPLIT_IN']], slavonia: ['Slavonia', ['ZAGREB', 'VARAZDIN', 'KRIZEVCI', 'SISAK', 'SLAV_W']] };
const u1537 = { croatia: ['Croatia (the remnants)', ['KARLOVAC', 'RIJEKA']], slavonia: ['Slavonia (the remnants)', ['ZAGREB', 'VARAZDIN', 'KRIZEVCI', 'SISAK']] };
const u1579 = {
  croatia: ['Croatia (the coast: Frankopan and Zrinski lands)', ['RIJEKA']],
  slavonia: ['Civil Croatia and Slavonia (the Ban and the Sabor)', ['ZAGREB', 'VARAZDIN', 'SISAK']],
  'frontier-karlovac': ['Military Frontier: Karlovac generalate', ['KARLOVAC']],
  'frontier-varazdin': ['Military Frontier: Varaždin generalate', ['KRIZEVCI']],
};
const u1699 = {
  croatia: ['Croatia (the coast: Rijeka and Vinodol)', ['RIJEKA']],
  slavonia: ['Civil Croatia and Slavonia (Slavonia regained at Karlowitz)', ['ZAGREB', 'VARAZDIN', 'SISAK', 'SLAV_W', 'OSIJEK', 'SRIJEM']],
  'frontier-karlovac': ['Military Frontier: Karlovac generalate with Lika', ['KARLOVAC', 'LIKA']],
  'frontier-varazdin': ['Military Frontier: Varaždin generalate', ['KRIZEVCI']],
};
const u1809 = {
  slavonia: ['Civil Croatia north of the Sava (Zagreb, Varaždin)', ['ZAGREB', 'VARAZDIN']],
  'slavonia-east': ['Slavonia', ['SLAV_W', 'OSIJEK', 'SRIJEM']],
  'frontier-varazdin': ['Military Frontier: Varaždin generalate', ['KRIZEVCI']],
};
const croatiaSlavonia = build({
  id: 'kingdom-of-croatia-and-slavonia', name: 'Kingdom of Croatia and Slavonia', color: '#B45309',
  nameAt: [
    [1102, 'Kingdom of Croatia and Slavonia (union with Hungary)'],
    [1527, 'Kingdom of Croatia and Slavonia (Habsburg)'],
    [1809, 'Croatia and Slavonia north of the Sava (Habsburg)'],
  ],
  description: 'Croatia under the crown of St Stephen from 1102 (Coloman, crowned at Biograd) and, after the election at Cetin on 1 January 1527, under the Habsburgs. It kept its own Ban and Sabor; Slavonia, between the Sava and the Drava, had its own ban for much of the Middle Ages. Venice took Zadar (1409) and Šibenik, Trogir and Split (1412–1420); the Ottomans took Knin (1522), Osijek and Syrmia (1526), Lika (1527) and Klis and most of Slavonia (1537–1552), leaving the “remnants of the remnants” round Zagreb, Varaždin, Karlovac and the coast. From 1579 the Karlovac and Varaždin generalates of the Military Frontier were ruled from Vienna and Graz. The Treaty of Karlowitz (1699) returned Slavonia and Lika; in 1809 Napoleon took everything south of the Sava.',
  timelineItemIds: ['hr-union', 'hr-ottoman-wars', 'hr-habsburg', 'hr-frontier'],
  confidence: conf('approximate', 'The losses and gains are well dated (Cetin, Krbava, Mohács, Karlowitz, Schönbrunn), but the outlines are modern Croatian counties. Senj and the Uskok coast (in the Lika piece) held out after 1527 but are dropped with Lika; Zadar, Venetian 1202–1358, stays in the Hungarian Dalmatia piece until 1409; Bihać and the Croatian lands in western Bosnia (Ottoman from 1592) and Međimurje (Hungarian Zala county) are not drawn, and the Ottoman-held lands of 1522–1699 are blank where the Ottoman ring does not reach. The Banal frontier and Slavonian Military Frontier regiments are folded into Civil Croatia and Slavonia; in 1809 Zagreb county south of the Sava stays in, and Sisak goes with Illyria.'),
  sources: [W('Croatia in personal union with Hungary'), W('Kingdom of Croatia (Habsburg)'), W('Kingdom of Slavonia'), W('Croatian Military Frontier'), W('Croatian–Ottoman wars'), W('Treaty of Karlowitz'), W('Treaty of Schönbrunn')],
}, [
  [1102, 'Coloman crowned at Biograd: union with Hungary', u1102],
  [1242, 'Béla IV, fleeing the Mongols, grants Zagreb’s Golden Bull', u1102],
  [1358, 'Treaty of Zadar: Venice gives up Dalmatia', u1102],
  [1409, 'Zadar sold to Venice', u1409],
  [1420, 'Venice takes Šibenik, Trogir and Split', u1420],
  [1493, 'Krbava Field', u1420],
  [1522, 'Knin falls to the Ottomans', u1522],
  [1526, 'Mohács; Osijek and Syrmia lost', u1526],
  [1527, 'Cetin: Ferdinand of Habsburg elected; Lika falls', u1527],
  [1537, 'Klis and Požega fall: the remnants of the remnants', u1537],
  [1579, 'Karlovac founded: the Military Frontier', u1579],
  [1593, 'Battle of Sisak', u1579],
  [1671, 'Zrinski and Frankopan beheaded', u1579],
  [1699, 'Treaty of Karlowitz: Slavonia and Lika regained', u1699],
  [1779, 'Rijeka a Hungarian corpus separatum', u1699],
  [1809, 'Treaty of Schönbrunn: south of the Sava to France', u1809],
  [1813, 'Austria retakes the Illyrian Provinces', u1809],
]);

// ---- Republic of Ragusa (1358–1808) ------------------------------------------------------------
const rag = { ragusa: ['Republic of Ragusa (Dubrovnik)', ['RAGUSA']] };
const republicOfRagusa = build({
  id: 'republic-of-ragusa', name: 'Republic of Ragusa', color: '#7C3AED',
  nameAt: [[1358, 'Republic of Ragusa (under the Hungarian crown)'], [1458, 'Republic of Ragusa (Ottoman tributary)']],
  description: 'The merchant republic of Dubrovnik (Ragusa), Venetian from 1205 until the Treaty of Zadar (1358) put it under the Hungarian crown. It was run by its nobility under a rector who served for a month, behind the walls still standing today, and held the coast from Konavle to Ston with the Pelješac peninsula (bought 1333) and the islands of Lastovo and Mljet. From 1458 it paid tribute to the Ottomans, which kept it free and open to Balkan trade; its fleet sailed the Mediterranean. The earthquake of 1667 destroyed much of the city. Napoleon’s army occupied it in 1806 and Marshal Marmont abolished the republic in 1808.',
  timelineItemIds: ['hr-ragusa'],
  confidence: conf('approximate', 'Ragusa’s territory is well known and changed little after Konavle (1419–1427). The outline is the Dubrovnik exclave of today’s Dubrovnik-Neretva county (Konavle, Dubrovnik, Ston and Pelješac) on the globe’s simplified coast; Konavle is drawn from 1358 although it was bought in 1419–1427, the islands are not drawn, and the 1699 cession of Neum and Sutorina to the Ottomans (outside Croatia) does not show.'),
  sources: [W('Republic of Ragusa'), W('Treaty of Zadar'), W('Walls of Dubrovnik'), W('Pelješac'), W('Konavle')],
}, [
  [1358, 'Treaty of Zadar: free of Venice', rag],
  [1458, 'Tribute to the Ottomans', rag],
  [1667, 'The great earthquake', rag],
  [1808, 'Marmont abolishes the republic', rag],
]);

// ---- Venetian Dalmatia (1409–1797) -------------------------------------------------------------
const v1409 = { dalmatia: ['Venetian Dalmatia: Zadar (Zara)', ['ZADAR_C']] };
const v1420 = { dalmatia: ['Venetian Dalmatia: the coastal towns', DAL_C] };
const v1699 = { dalmatia: ['Venetian Dalmatia with the acquisto nuovo', [...DAL_C, 'MAKARSKA', ...HINTER]] };
const venetianDalmatia = build({
  id: 'venetian-dalmatia', name: 'Venetian Dalmatia', color: '#881337',
  nameAt: [[1409, 'Venetian Dalmatia (Stato da Màr)'], [1699, 'Venetian Dalmatia (acquisto nuovo)'], [1718, 'Venetian Dalmatia (acquisto nuovissimo)']],
  description: 'Venice’s Dalmatian province, part of its Stato da Màr. In 1409 Ladislaus of Naples sold Venice his rights to Dalmatia for 100,000 ducats; Venice took Zadar at once, then Šibenik (1412) and Trogir and Split (1420), and the islands of Pag, Brač, Hvar and Korčula. In the 16th century the Ottomans took the hinterland, leaving Venice the towns and a strip of coast. In the Morean War Venice took Knin and Sinj (1686–1688) and Makarska, confirmed at Karlowitz (1699) as the acquisto nuovo; Passarowitz (1718) added Imotski (the acquisto nuovissimo). When Napoleon ended the Republic of Venice, the Treaty of Campo Formio (1797) gave Dalmatia to Austria.',
  timelineItemIds: ['hr-venetian-dalmatia'],
  confidence: conf('approximate', 'The towns and the treaty lines are known, but the outline is a 0.13° (about 10–14 km) coastal strip of today’s Zadar, Šibenik-Knin and Split-Dalmatia counties, then the whole of them from 1699. The islands are not drawn (too small for the globe’s land), Klis (Venetian only from 1648) and Omiš (1444) are inside the strip from 1420, Imotski is folded into the 1699 step, and Venetian Istria stays with Venice’s own shape. Austrian Dalmatia (1797–1805) and Napoleon’s Italian Dalmatia (1806–1809) are not drawn.'),
  sources: [W('Venetian Dalmatia'), W('Stato da Màr'), W('Treaty of Karlowitz'), W('Treaty of Passarowitz'), W('Treaty of Campo Formio')],
}, [
  [1409, 'Dalmatia bought from Ladislaus of Naples: Zadar', v1409],
  [1420, 'Šibenik, Trogir and Split taken', v1420],
  [1537, 'The Ottomans take the hinterland (Klis)', v1420],
  [1699, 'Karlowitz: the acquisto nuovo (Knin, Sinj, Makarska)', v1699],
  [1718, 'Passarowitz: the acquisto nuovissimo (Imotski)', v1699],
  [1797, 'Campo Formio: Dalmatia to Austria', v1699],
]);

// ---- Illyrian Provinces (1809–1813) ------------------------------------------------------------
const ill = {
  carniola: ['Carniola and Gorizia', ['CARNIOLA']],
  croatia: ['Istria, and Civil and Military Croatia south of the Sava', ['ISTRIA', 'RIJEKA', 'KARLOVAC', 'LIKA', 'SISAK']],
  dalmatia: ['Dalmatia', [...DAL_C, 'MAKARSKA', ...HINTER]],
  ragusa: ['Ragusa', ['RAGUSA']],
};
const illyrianProvinces = build({
  id: 'illyrian-provinces', name: 'Illyrian Provinces', color: '#1D4ED8',
  nameAt: [[1809, 'Illyrian Provinces (French Empire)']],
  description: 'The provinces Napoleon took from Austria at the Treaty of Schönbrunn (October 1809) after Wagram — Carniola, Gorizia, Trieste, Istria, western Carinthia and Croatia south of the Sava with the Karlovac and Lika frontier — joined to Dalmatia and Ragusa, which France already held. They were ruled from Ljubljana (Laibach) by a governor-general, first Marshal Marmont, kept the frontier regiments, and got French law, schools and roads. Austria took them back in the autumn of 1813, and the Congress of Vienna (1815) made Dalmatia a kingdom of its own under Austria.',
  timelineItemIds: ['hr-illyrian-provinces'],
  confidence: conf('approximate', 'The provinces are well documented; the outline is modern Croatian counties south of the Sava and on the coast, and Slovenia’s Carniola and Littoral regions. Trieste, Gorizia’s Italian part, western Carinthia (Villach) and the Bay of Kotor are not drawn; Sisak and Zagreb county south of the Sava are approximations of the Sava line.'),
  sources: [W('Illyrian Provinces'), W('Treaty of Schönbrunn'), W('Auguste de Marmont')],
}, [
  [1809, 'Treaty of Schönbrunn: the Illyrian Provinces', ill],
  [1811, 'Organised as provinces of the French Empire', ill],
  [1813, 'Austria retakes the provinces', ill],
]);

export const croatiaPolities = [kingdomOfCroatia, croatiaSlavonia, republicOfRagusa, venetianDalmatia, illyrianProvinces];

// ---- Fixes to other shapes -----------------------------------------------------------------------
export const OTT_TRIM_RINGS = {
  O1560: [[43.02, 37.9], [41.6, 37.76], [40.19, 37.61], [38.77, 37.45], [37.78, 36.65], [37.28, 35.37], [36.21, 34.55], [34.95, 34.08], [33.56, 34.06], [32.14, 34.13], [30.72, 34.2], [29.3, 34.27], [27.88, 34.35], [26.46, 34.45], [25.05, 34.62], [23.64, 34.81], [22.23, 34.99], [20.82, 35.18], [19.41, 35.36], [17.99, 35.45], [17.61, 36.42], [17.79, 37.84], [17.97, 39.25], [18.14, 40.66], [18.24, 41.47], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [18.39, 42.63], [18.5, 43.48], [19.77, 44.09], [21.05, 44.7], [22.33, 45.3], [22.59, 45.41], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [28.96, 45.91], [29.27, 45.89], [30.6, 45.38], [31.92, 44.87], [33.25, 44.36], [34.58, 43.85], [35.92, 43.38], [37.29, 42.99], [38.65, 42.6], [40.02, 42.2], [41.39, 41.81], [42.7, 41.33], [43.74, 40.35], [44.77, 39.38], [45.8, 38.4], [44.43, 38.08], [43.02, 37.9]],
  O1580: [[43.16, 37.92], [41.66, 37.77], [40.17, 37.61], [38.67, 37.44], [37.73, 36.47], [37.35, 35.03], [36.22, 34.23], [34.78, 34.03], [33.28, 34.02], [31.78, 34.04], [30.27, 34.06], [28.77, 34.09], [27.26, 34.11], [25.76, 34.19], [24.27, 34.37], [22.77, 34.56], [21.28, 34.75], [19.79, 34.94], [18.29, 35.11], [16.79, 35.14], [16.6, 36.33], [16.77, 37.83], [16.95, 39.32], [17.11, 40.73], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.65, 42.94], [17.38, 43.09], [17.47, 43.81], [18.75, 44.56], [20.06, 45.29], [21.18, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.14, 46.34], [29.19, 46.26], [29.26, 46.29], [30.08, 45.95], [31.47, 45.37], [32.86, 44.79], [34.25, 44.22], [35.67, 43.71], [37.12, 43.33], [38.58, 42.95], [40.04, 42.57], [41.49, 42.19], [42.93, 41.77], [43.98, 40.69], [45.03, 39.62], [46.08, 38.54], [44.65, 38.11], [43.16, 37.92]],
  O1600: [[43.0, 37.9], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36.0], [37.3, 34.5], [36.0, 34.0], [26.0, 34.0], [18.0, 35.0], [16.0, 35.0], [16.6, 40.39], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.65, 42.94], [16.93, 43.36], [17.0, 44.0], [20.63, 46.18], [20.65, 46.09], [21.02, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.49, 46.36], [35.0, 44.0], [43.0, 42.0], [46.2, 38.6], [45.4, 38.2], [43.0, 37.9]],
  O1625: [[43.18, 37.92], [41.62, 37.76], [40.07, 37.6], [38.52, 37.4], [37.68, 36.26], [37.29, 34.8], [36.03, 34.16], [34.48, 34.07], [32.91, 34.06], [31.35, 34.04], [29.78, 34.03], [28.22, 34.01], [26.65, 34.0], [25.09, 34.05], [23.53, 34.2], [21.98, 34.35], [20.42, 34.5], [18.86, 34.65], [17.31, 34.78], [15.99, 35.01], [15.95, 36.38], [16.11, 37.94], [16.28, 39.49], [16.36, 40.24], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.65, 42.94], [16.8, 43.43], [16.78, 43.6], [16.72, 43.62], [16.78, 44.16], [18.09, 44.97], [19.45, 45.75], [20.8, 46.54], [21.44, 46.84], [21.39, 46.76], [21.23, 46.67], [21.19, 46.47], [21.01, 46.33], [20.74, 46.35], [20.62, 46.22], [20.65, 46.09], [21.02, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.07, 46.52], [31.33, 45.99], [32.78, 45.39], [34.22, 44.79], [35.69, 44.26], [37.2, 43.84], [38.7, 43.41], [40.2, 42.97], [41.7, 42.54], [43.19, 42.09], [44.31, 41.03], [45.25, 39.82], [46.2, 38.6], [44.73, 38.12], [43.18, 37.92]],
  O1650: [[43.09, 37.91], [41.49, 37.75], [39.89, 37.58], [38.32, 37.33], [37.61, 36.0], [37.11, 34.62], [35.64, 34.3], [34.03, 34.22], [32.43, 34.17], [30.82, 34.13], [29.21, 34.08], [27.6, 34.03], [25.99, 34.0], [24.38, 34.02], [22.77, 34.09], [21.17, 34.16], [19.56, 34.22], [17.95, 34.29], [16.35, 34.35], [15.5, 35.04], [15.56, 36.56], [15.72, 38.16], [15.87, 39.76], [15.9, 40.05], [16.0, 40.0], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.65, 42.94], [16.8, 43.43], [16.78, 43.6], [16.31, 43.73], [16.26, 43.76], [16.34, 44.57], [17.7, 45.37], [19.12, 46.13], [20.54, 46.88], [21.91, 47.56], [21.39, 46.76], [21.23, 46.67], [21.19, 46.47], [21.01, 46.33], [20.74, 46.35], [20.62, 46.22], [20.65, 46.09], [21.02, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.05, 46.55], [30.0, 46.87], [29.48, 47.06], [29.16, 47.34], [29.2, 47.48], [29.95, 47.37], [31.45, 46.78], [32.95, 46.2], [34.45, 45.61], [35.96, 45.05], [37.48, 44.54], [39.0, 44.0], [40.5, 43.44], [42.01, 42.89], [43.51, 42.33], [44.75, 41.41], [45.47, 40.0], [46.2, 38.6], [44.69, 38.11], [43.09, 37.91]],
  O1683: [[43.0, 37.9], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36.0], [37.3, 34.5], [26.0, 34.0], [18.0, 34.0], [15.0, 34.0], [15.57, 40.22], [16.0, 40.0], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.65, 42.94], [16.8, 43.43], [16.78, 43.6], [16.31, 43.73], [15.91, 43.97], [16.0, 45.0], [16.12, 45.06], [16.2, 44.98], [16.35, 44.97], [16.54, 45.17], [16.79, 45.13], [16.93, 45.22], [17.15, 45.12], [17.15, 45.21], [17.25, 45.3], [17.21, 45.39], [17.11, 45.41], [17.09, 45.46], [17.44, 45.47], [17.54, 45.68], [17.52, 45.74], [17.49, 45.75], [22.0, 48.0], [22.82, 48.0], [22.61, 47.87], [22.21, 47.8], [21.91, 47.56], [21.39, 46.76], [21.23, 46.67], [21.19, 46.47], [21.01, 46.33], [20.74, 46.35], [20.62, 46.22], [20.65, 46.09], [21.02, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.05, 46.55], [30.0, 46.87], [29.48, 47.06], [29.16, 47.34], [29.34, 47.87], [29.22, 48.0], [30.0, 48.0], [38.0, 45.0], [45.0, 42.0], [46.2, 38.6], [45.4, 38.2], [43.0, 37.9]],
  O1699: [[43.0, 37.9], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36.0], [37.3, 34.5], [26.0, 34.0], [18.0, 34.0], [15.0, 34.0], [15.57, 40.22], [16.0, 40.0], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.64, 42.94], [17.43, 43.06], [17.5, 43.16], [17.33, 43.33], [17.27, 43.51], [17.11, 43.56], [16.36, 44.12], [16.26, 44.23], [16.25, 44.38], [16.15, 44.56], [15.97, 44.71], [16.0, 45.0], [16.11, 45.06], [16.19, 44.99], [16.35, 44.97], [16.54, 45.17], [16.79, 45.13], [16.93, 45.22], [17.12, 45.12], [17.27, 45.14], [17.57, 45.07], [17.68, 45.11], [17.83, 45.01], [18.02, 45.09], [18.15, 45.05], [18.25, 45.1], [18.47, 45.02], [18.66, 45.03], [18.82, 44.83], [19.03, 44.82], [19.13, 44.9], [19.11, 45.13], [19.4, 45.12], [19.44, 45.18], [19.4, 45.27], [19.04, 45.4], [19.06, 45.52], [18.96, 45.59], [19.02, 45.69], [18.91, 45.82], [18.95, 45.92], [18.93, 45.97], [18.66, 45.96], [18.4, 45.8], [17.87, 45.83], [17.74, 45.87], [22.0, 48.0], [22.82, 48.0], [22.61, 47.87], [22.21, 47.8], [21.91, 47.56], [21.39, 46.76], [21.23, 46.67], [21.19, 46.47], [21.01, 46.33], [20.74, 46.35], [20.62, 46.22], [20.65, 46.09], [21.02, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.05, 46.55], [30.0, 46.87], [29.48, 47.06], [29.16, 47.34], [29.34, 47.87], [29.22, 48.0], [30.0, 48.0], [38.0, 45.0], [45.0, 42.0], [46.2, 38.6], [45.4, 38.2], [43.0, 37.9]],
  O1718: [[43.0, 37.9], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36.0], [37.3, 34.5], [26.0, 34.0], [18.0, 34.0], [15.0, 34.0], [15.57, 40.22], [16.0, 40.0], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.64, 42.94], [17.43, 43.06], [17.5, 43.16], [17.33, 43.33], [17.27, 43.51], [17.11, 43.56], [16.36, 44.12], [16.26, 44.23], [16.25, 44.38], [16.15, 44.56], [15.97, 44.71], [16.0, 45.0], [16.11, 45.06], [16.19, 44.99], [16.35, 44.97], [16.54, 45.17], [16.79, 45.13], [16.93, 45.22], [17.12, 45.12], [17.27, 45.14], [17.57, 45.07], [17.68, 45.11], [17.83, 45.01], [18.02, 45.09], [18.15, 45.05], [18.25, 45.1], [18.47, 45.02], [18.66, 45.03], [18.82, 44.83], [19.03, 44.82], [19.13, 44.9], [19.11, 45.13], [19.4, 45.12], [19.44, 45.18], [19.4, 45.27], [19.04, 45.4], [19.06, 45.52], [18.96, 45.59], [19.02, 45.69], [18.91, 45.82], [18.95, 45.92], [18.93, 45.97], [18.66, 45.96], [18.4, 45.8], [17.87, 45.83], [17.74, 45.87], [22.0, 48.0], [22.82, 48.0], [22.61, 47.87], [22.21, 47.8], [21.91, 47.56], [21.39, 46.76], [21.23, 46.67], [21.19, 46.47], [21.01, 46.33], [20.74, 46.35], [20.62, 46.22], [20.65, 46.09], [21.02, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.05, 46.55], [30.0, 46.87], [29.48, 47.06], [29.16, 47.34], [29.34, 47.87], [29.22, 48.0], [30.0, 48.0], [38.0, 45.0], [45.0, 42.0], [46.2, 38.6], [45.4, 38.2], [43.0, 37.9]],
  O1740: [[43.0, 37.9], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36.0], [37.3, 34.5], [26.0, 34.0], [18.0, 34.0], [15.0, 34.0], [15.57, 40.22], [16.0, 40.0], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.64, 42.94], [17.43, 43.06], [17.5, 43.16], [17.33, 43.33], [17.27, 43.51], [17.11, 43.56], [16.36, 44.12], [16.26, 44.23], [16.25, 44.38], [16.15, 44.56], [15.97, 44.71], [16.0, 45.0], [16.11, 45.06], [16.19, 44.99], [16.35, 44.97], [16.54, 45.17], [16.79, 45.13], [16.93, 45.22], [17.12, 45.12], [17.27, 45.14], [17.57, 45.07], [17.68, 45.11], [17.83, 45.01], [18.02, 45.09], [18.15, 45.05], [18.25, 45.1], [18.47, 45.02], [18.66, 45.03], [18.82, 44.83], [19.03, 44.82], [19.13, 44.9], [19.11, 45.13], [19.4, 45.12], [19.44, 45.18], [19.4, 45.27], [19.04, 45.4], [19.06, 45.52], [18.96, 45.59], [19.02, 45.69], [18.91, 45.82], [18.95, 45.92], [18.93, 45.97], [18.66, 45.96], [18.4, 45.8], [17.87, 45.83], [17.74, 45.87], [22.0, 48.0], [22.82, 48.0], [22.61, 47.87], [22.21, 47.8], [21.91, 47.56], [21.39, 46.76], [21.23, 46.67], [21.19, 46.47], [21.01, 46.33], [20.74, 46.35], [20.62, 46.22], [20.65, 46.09], [21.02, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.05, 46.55], [30.0, 46.87], [29.48, 47.06], [29.16, 47.34], [29.34, 47.87], [29.22, 48.0], [30.0, 48.0], [38.0, 45.0], [45.0, 42.0], [46.2, 38.6], [45.4, 38.2], [43.0, 37.9]],
  O1760: [[43.04, 37.91], [41.53, 37.75], [40.02, 37.59], [38.54, 37.35], [37.8, 36.21], [37.17, 35.05], [35.76, 34.8], [34.27, 34.62], [32.77, 34.46], [31.25, 34.4], [29.74, 34.35], [28.22, 34.3], [26.7, 34.26], [25.18, 34.26], [23.66, 34.26], [22.14, 34.26], [20.63, 34.28], [19.12, 34.36], [17.61, 34.43], [16.96, 35.29], [17.03, 36.74], [17.18, 38.26], [17.33, 39.77], [17.46, 40.95], [18.9, 41.9], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.65, 42.94], [17.79, 44.3], [18.78, 44.88], [18.82, 44.83], [19.03, 44.82], [19.13, 44.9], [19.12, 45.07], [19.24, 45.12], [19.4, 45.12], [19.44, 45.18], [19.43, 45.21], [20.41, 45.64], [21.06, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.05, 46.55], [30.01, 46.8], [30.74, 46.78], [32.18, 46.31], [33.62, 45.84], [35.05, 45.33], [36.48, 44.81], [37.91, 44.3], [39.32, 43.75], [40.73, 43.19], [42.14, 42.63], [43.5, 41.98], [44.72, 41.18], [45.36, 39.84], [45.99, 38.5], [44.55, 38.09], [43.04, 37.91]],
};
const OTT_SUM = {"O1475": 36051.590000000004, "O1500": 39705.25, "O1520": 19536.84, "O1540": 43380.99, "O1560": 52355.91, "O1580": 59250.5, "O1600": 41489.01, "O1625": 67623.58, "O1650": 71765.22, "O1683": 55859.99, "O1699": 55859.99, "O1718": 55859.99, "O1740": 55859.99, "O1760": 62700.61, "O1780": 42189.63};
/** Ottoman: the Day 89 held steps, with 1683–1717 split at Karlowitz (1699). Steps listed in
 *  OTT_TRIM_RINGS are cut back from Ragusa, Venetian Dalmatia and Habsburg Croatia–Slavonia. */
export const OTT_PLAN = [[1475, "O1475"], [1499, "O1475"], [1500, "O1500"], [1519, "O1500"], [1520, "O1520"], [1539, "O1520"], [1540, "O1540"], [1559, "O1540"], [1560, "O1560"], [1579, "O1560"], [1580, "O1580"], [1599, "O1580"], [1600, "O1600"], [1624, "O1600"], [1625, "O1625"], [1649, "O1625"], [1650, "O1650"], [1682, "O1650"], [1683, "O1683"], [1698, "O1683"], [1699, "O1699"], [1717, "O1699"], [1718, "O1718"], [1739, "O1718"], [1740, "O1740"], [1759, "O1740"], [1760, "O1760"], [1779, "O1760"], [1780, "O1780"], [1799, "O1780"]];

export const croatiaShapeFixes = {
  'ottoman-empire': ['anatolia-balkans held steps cut back from Ragusa, the Venetian coast and (after 1699) Slavonia, Lika and the Dalmatian hinterland'],
  venice: ['the schematic dalmatia region dropped (Venetian Dalmatia is its own polity)'],
  'byzantine-empire': ['byzantine-core 1019 and 1025 notched east round eastern Slavonia (Osijek’s Danube bank)'],
};

const INF = { start: -Infinity, end: Infinity };
const closed = (r) => (r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1] ? r : [...r, r[0]]);
const resolveInline = (r) => (r && typeof r === 'object' && Array.isArray(r.ring) ? ensureClockwise(closed(r.ring)) : null);
const checksum = (ring) => ring.reduce((s, [x, y]) => s + x * 7 + y * 13, 0);

/** Rebuild an entity's [lo, hi] keyframes as held steps (Day 89 pattern); a step with no trim ring
 *  keeps its morphed ring. */
function replan(entities, id, rid, lo, hi, plan, rings, sums) {
  const ent = entities.find((e) => e.id === id);
  if (!ent) throw new Error(`croatia fixes: no entity ${id}`);
  const src = { ...ent, overlays: ent.overlays.slice() };
  for (const o of src.overlays) {
    for (const r of o.regions) if (typeof r === 'string' || !Array.isArray(r.ring)) throw new Error(`croatia fixes: ${id} ${o.year} has a region without an inline ring`);
  }
  const seen = new Set();
  let stepHoles = [];
  let open = false;
  const made = plan.map(([y, key], i) => {
    const parts = morphEntityAtYear(src, y, resolveInline, INF, 20, resolveRegionHoles);
    const part = parts.find((p) => p.regionId === rid);
    if (!part) throw new Error(`croatia fixes: ${id} has no ${rid} at ${y}`);
    if (open) open = false; // the end year of a held step keeps the start year's holes
    else {
      stepHoles = part.holes;
      open = plan[i + 1]?.[1] === key;
    }
    if (!seen.has(key)) {
      seen.add(key);
      if (Math.abs(checksum(part.ring) - sums[key]) > 1e-6) throw new Error(`croatia fixes: ${id} ${rid} at ${y} changed — regenerate the ${key} trim`);
    }
    let base = src.overlays[0];
    for (const o of src.overlays) if (o.year <= y) base = o;
    const regions = parts.map((p) => {
      const holes = p.regionId === rid ? stepHoles : p.holes;
      return { id: p.regionId, name: p.regionName, ring: p.regionId === rid ? rings[key] || p.ring : p.ring, ...(holes.length ? { holes } : {}) };
    });
    return { year: y, label: base.label, approximation: base.approximation, regions };
  });
  ent.overlays = [...src.overlays.filter((o) => o.year <= lo || o.year >= hi), ...made].sort((a, b) => a.year - b.year);
}

/** Byzantine 1019/1025 'byzantine-core' (a schematic box with its west edge on 19°E): notched east
 *  round eastern Slavonia's Danube bank, which was never Byzantine (Syrmia across the river was). */
const BYZ_1019 = [[42, 38], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36], [36, 35.2], [19, 35], [19, 46], [42, 46], [42, 38]];
const BYZ_1019_NOTCHED = [[42, 38], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36], [36, 35.2], [19, 35], [19, 45.15], [19.07, 45.15], [19.07, 45.95], [19, 45.95], [19, 46], [42, 46], [42, 38]];
const sameRing = (a, b) => a.length === b.length && a.every((p, i) => p[0] === b[i][0] && p[1] === b[i][1]);

/** Drop Venice's schematic Dalmatia and cut the Ottoman ring back (run after the Romania fixes). */
export function applyCroatiaShapeFixes(entities) {
  const venice = entities.find((e) => e.id === 'venice');
  if (!venice) throw new Error('croatia fixes: no venice');
  venice.overlays = venice.overlays.map((o) => ({ ...o, regions: o.regions.filter((r) => (typeof r === 'string' ? r : r.id) !== 'dalmatia') }));
  replan(entities, 'ottoman-empire', 'anatolia-balkans', 1453, 1800, OTT_PLAN, OTT_TRIM_RINGS, OTT_SUM);
  const byz = entities.find((e) => e.id === 'byzantine-empire');
  for (const y of [1019, 1025]) {
    const core = byz?.overlays.find((o) => o.year === y)?.regions.find((r) => typeof r !== 'string' && r.id === 'byzantine-core');
    if (core && sameRing(core.ring, BYZ_1019_NOTCHED)) continue; // the two keyframes may share one region object
    if (!core || !sameRing(core.ring, BYZ_1019)) throw new Error(`croatia fixes: byzantine-core ${y} changed`);
    core.ring = BYZ_1019_NOTCHED;
  }
}
