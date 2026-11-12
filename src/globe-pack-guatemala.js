/**
 * Day 81 — Phase 5 country pack 3, Caribbean and Central America: Guatemala (ROADMAP item 12,
 * after Cuba, Haiti/DR and Jamaica).
 *
 * Guatemala had no country timeline, and on the globe before 1815 only the Maya civilisation's
 * single 'yucatan' ring (to 900), lidar presence shapes in Petén, and from 1530 the Spanish
 * Empire's schematic 'new-spain' ring, which washed over the whole country, including Itza Petén
 * that Spain did not take until 1697. Nothing showed a Maya kingdom by name. This module draws
 * Guatemala from the Preclassic to 1815:
 *
 *   Kaminaljuyu · Mutal (Tikal) · Dos Pilas / Petexbatún · Quiriguá · K’iche’ (Q’umarkaj) ·
 *   Kaqchikel (Iximche) · Tz’utujil · Mam (Zaculeu) · Tezulutlán · Itza (Nojpetén) ·
 *   Spanish Guatemala (Kingdom / Captaincy General, Guatemala's part)
 *
 * From 1815 the nations layer takes over (the Captaincy General, the Federation, then Guatemala),
 * so no keyframe here is later than 1815. Independence, the Liberal Reform, 1944–54, the civil
 * war and the Peace Accords are timeline items with pins.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - Guatemala is cut into 13 pieces (GT_PIECES, plus ALL, their union): Natural Earth 1:10m departments (public
 *    domain) grouped into historical regions, clipped to the globe's own Guatemala land
 *    (src/data/nations.topo.json shape 421) and simplified together as one coverage so
 *    neighbouring pieces share edges and never overlap. Petén is split on 16.75°N and, north of
 *    that, 89.75°W (PETEN_S, PETEN_NW, PETEN_NE). Generator: et-tools day81-pieces.py (outside
 *    the repo); the output is plain coordinates.
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - The Spanish Empire's schematic 'new-spain' ring is trimmed clear of Guatemala (1530–1800
 *    keyframes; GT_TRIMS) so Spanish Guatemala and the Itza are each drawn once. The Maya
 *    civilisation ring and the lidar / peoples / presence layers are cultural, not states, and
 *    stay underneath.
 *  - Pieces are regions, not surveyed borders. Classic kingdoms are drawn at their core domain,
 *    not their shifting hegemonies (see each polity's confidence reason).
 */

import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });

// ---- Pieces ([lng, lat]; departments grouped, clipped to nations.topo.json Guatemala shape 421) --
//  HUEHUE: Huehuetenango · KICHE: Quiché + Totonicapán · WEST: San Marcos + Quetzaltenango +
//  Retalhuleu · TZUTUJIL: Sololá + Suchitepéquez · KAQCHIKEL: Chimaltenango + Sacatepéquez +
//  Guatemala · ESCUINTLA · XINCA: Santa Rosa + Jalapa + Jutiapa · MOTAGUA: El Progreso + Zacapa +
//  Chiquimula · VERAPAZ: Alta + Baja Verapaz · IZABAL · PETEN_S / PETEN_NW / PETEN_NE: Petén.
//  ALL: the union of every piece (simplified 0.01°), used when a shape holds the whole country —
//  merging all 13 pieces at once leaves pinch points.
export const GT_PIECES = {
  HUEHUE: [[-90.995, 16.0695], [-91.1272, 15.816], [-91.1923, 15.6878], [-91.2594, 15.6276], [-91.3034, 15.611], [-91.3222, 15.56], [-91.3322, 15.5171], [-91.3222, 15.4892], [-91.3022, 15.4658], [-91.2944, 15.4317], [-91.2636, 15.3993], [-91.2247, 15.4018], [-91.1844, 15.3868], [-91.1908, 15.3329], [-91.1791, 15.2922], [-91.2368, 15.2919], [-91.3029, 15.2769], [-91.3154, 15.2632], [-91.3411, 15.2649], [-91.3925, 15.2412], [-91.4458, 15.2288], [-91.4742, 15.19], [-91.477, 15.1618], [-91.5188, 15.156], [-91.5489, 15.204], [-91.6161, 15.2209], [-91.6213, 15.2343], [-91.6609, 15.2665], [-91.6959, 15.3081], [-91.7157, 15.3501], [-91.7856, 15.335], [-91.8068, 15.3366], [-91.8496, 15.3612], [-91.9103, 15.3298], [-91.9566, 15.3189], [-91.993, 15.2779], [-92.0441, 15.2802], [-92.0552, 15.2885], [-92.0676, 15.4071], [-92.0998, 15.4336], [-92.1057, 15.4536], [-91.7523, 16.0457], [-91.7235, 16.0694], [-90.995, 16.0695]],
  KICHE: [[-91.5188, 15.156], [-91.477, 15.1618], [-91.4742, 15.19], [-91.4458, 15.2288], [-91.3925, 15.2412], [-91.3411, 15.2649], [-91.3154, 15.2632], [-91.3029, 15.2769], [-91.2368, 15.2919], [-91.1791, 15.2922], [-91.1908, 15.3329], [-91.1844, 15.3868], [-91.2247, 15.4018], [-91.2636, 15.3993], [-91.2944, 15.4317], [-91.3022, 15.4658], [-91.3222, 15.4892], [-91.3322, 15.5171], [-91.3222, 15.56], [-91.3034, 15.611], [-91.2594, 15.6276], [-91.1923, 15.6878], [-91.1272, 15.816], [-90.995, 16.0695], [-90.4491, 16.0792], [-90.4488, 16.0997], [-90.4345, 16.1072], [-90.4478, 16.0797], [-90.4315, 16.0655], [-90.436, 16.034], [-90.4693, 16.0107], [-90.4874, 16.018], [-90.5067, 16.0062], [-90.5444, 16.0107], [-90.5581, 15.9977], [-90.5903, 16.0184], [-90.6055, 16.0429], [-90.6201, 16.0312], [-90.6343, 16.0452], [-90.6601, 16.0398], [-90.7027, 16.0175], [-90.6953, 16.0039], [-90.7128, 15.9763], [-90.7232, 15.9902], [-90.7635, 15.9697], [-90.7362, 15.9424], [-90.7538, 15.921], [-90.7635, 15.8878], [-90.7386, 15.8853], [-90.7326, 15.8681], [-90.743, 15.8486], [-90.7672, 15.8394], [-90.7846, 15.7984], [-90.8181, 15.7506], [-90.7933, 15.7508], [-90.7772, 15.737], [-90.7915, 15.7233], [-90.771, 15.709], [-90.7882, 15.6884], [-90.7806, 15.6789], [-90.7434, 15.6727], [-90.689, 15.6544], [-90.6625, 15.6592], [-90.6617, 15.6476], [-90.6327, 15.6229], [-90.6406, 15.5924], [-90.6255, 15.5821], [-90.597, 15.526], [-90.6481, 15.4763], [-90.6401, 15.4589], [-90.6922, 15.449], [-90.7098, 15.4266], [-90.7027, 15.3944], [-90.682, 15.375], [-90.6508, 15.3631], [-90.4935, 15.3397], [-90.4776, 15.331], [-90.4785, 15.3106], [-90.4972, 15.2709], [-90.5413, 15.2125], [-90.5744, 15.21], [-90.6916, 15.2149], [-90.8574, 15.2527], [-90.8657, 15.2568], [-90.8719, 15.1485], [-90.7972, 15.0549], [-90.7073, 15.0002], [-90.7122, 14.9738], [-90.6735, 14.939], [-90.6576, 14.9039], [-90.7536, 14.9282], [-90.8051, 14.9282], [-90.8529, 14.9419], [-90.894, 14.9368], [-90.9772, 14.9386], [-91.0246, 14.9166], [-91.0535, 14.8449], [-91.0874, 14.8263], [-91.1039, 14.832], [-91.1165, 14.8095], [-91.1319, 14.8149], [-91.1185, 14.8605], [-91.1563, 14.8753], [-91.183, 14.9107], [-91.2296, 14.86], [-91.2461, 14.8557], [-91.2925, 14.8626], [-91.3131, 14.854], [-91.3581, 14.8633], [-91.3787, 14.8588], [-91.4283, 14.8176], [-91.4589, 14.8607], [-91.4705, 14.9101], [-91.5178, 14.9093], [-91.5365, 14.9316], [-91.536, 14.9616], [-91.5602, 14.9859], [-91.5888, 15.0914], [-91.5875, 15.131], [-91.5188, 15.156]],
  WEST: [[-92.1057, 15.4536], [-92.0998, 15.4336], [-92.0676, 15.4071], [-92.0552, 15.2885], [-92.0441, 15.2802], [-91.993, 15.2779], [-91.9566, 15.3189], [-91.9103, 15.3298], [-91.8496, 15.3612], [-91.8068, 15.3366], [-91.7856, 15.335], [-91.7157, 15.3501], [-91.6959, 15.3081], [-91.6609, 15.2665], [-91.6213, 15.2343], [-91.6161, 15.2209], [-91.5489, 15.204], [-91.5188, 15.156], [-91.5875, 15.131], [-91.5888, 15.0914], [-91.5602, 14.9859], [-91.536, 14.9616], [-91.5365, 14.9316], [-91.5178, 14.9093], [-91.4705, 14.9101], [-91.4589, 14.8607], [-91.4283, 14.8176], [-91.4405, 14.7785], [-91.4697, 14.7396], [-91.5406, 14.6871], [-91.569, 14.6522], [-91.5689, 14.6156], [-91.6084, 14.5371], [-91.6162, 14.4661], [-91.5987, 14.4206], [-91.6039, 14.3311], [-91.6278, 14.2778], [-91.6367, 14.2066], [-91.6652, 14.1654], [-91.6585, 14.1173], [-91.6513, 14.113], [-91.6587, 14.1171], [-91.9071, 14.2843], [-92.1627, 14.4878], [-92.2455, 14.5463], [-92.1627, 14.7024], [-92.1915, 14.8139], [-92.1555, 14.9964], [-92.0727, 15.0731], [-92.2023, 15.2375], [-92.1057, 15.4536]],
  TZUTUJIL: [[-91.4283, 14.8176], [-91.3787, 14.8588], [-91.3581, 14.8633], [-91.3131, 14.854], [-91.2925, 14.8626], [-91.2461, 14.8557], [-91.2296, 14.86], [-91.183, 14.9107], [-91.1563, 14.8753], [-91.1185, 14.8605], [-91.1319, 14.8149], [-91.1165, 14.8095], [-91.1039, 14.832], [-91.0874, 14.8263], [-91.0688, 14.7448], [-91.0741, 14.7004], [-91.1057, 14.6324], [-91.1141, 14.5304], [-91.0972, 14.513], [-91.0972, 14.4676], [-91.1113, 14.4304], [-91.1462, 14.3569], [-91.1491, 14.309], [-91.1711, 14.272], [-91.2941, 14.282], [-91.2891, 14.3059], [-91.3, 14.3164], [-91.3263, 14.2919], [-91.359, 14.3073], [-91.3652, 14.3392], [-91.3563, 14.3574], [-91.3647, 14.376], [-91.3857, 14.3758], [-91.4142, 14.3554], [-91.4233, 14.3366], [-91.4134, 14.2965], [-91.4299, 14.2857], [-91.448, 14.3065], [-91.4583, 14.3003], [-91.4617, 14.2699], [-91.4569, 14.1899], [-91.5298, 14.0822], [-91.5285, 14.0483], [-91.5434, 14.054], [-91.6513, 14.113], [-91.6585, 14.1173], [-91.6652, 14.1654], [-91.6367, 14.2066], [-91.6278, 14.2778], [-91.6039, 14.3311], [-91.5987, 14.4206], [-91.6162, 14.4661], [-91.6084, 14.5371], [-91.5689, 14.6156], [-91.569, 14.6522], [-91.5406, 14.6871], [-91.4697, 14.7396], [-91.4405, 14.7785], [-91.4283, 14.8176]],
  KAQCHIKEL: [[-90.3999, 14.899], [-90.4176, 14.8709], [-90.4068, 14.8521], [-90.3501, 14.8549], [-90.3311, 14.7941], [-90.3434, 14.7704], [-90.3388, 14.751], [-90.3085, 14.7223], [-90.2367, 14.6951], [-90.2091, 14.6743], [-90.2228, 14.6448], [-90.2658, 14.6115], [-90.2836, 14.5452], [-90.2852, 14.5143], [-90.3141, 14.5059], [-90.3498, 14.4781], [-90.3596, 14.5025], [-90.3883, 14.4965], [-90.4294, 14.4335], [-90.4478, 14.3879], [-90.4438, 14.3286], [-90.4722, 14.3037], [-90.5097, 14.2884], [-90.5364, 14.2662], [-90.5649, 14.2562], [-90.5863, 14.3173], [-90.5856, 14.3504], [-90.5964, 14.4151], [-90.6377, 14.4315], [-90.6505, 14.4687], [-90.7147, 14.444], [-90.7258, 14.4673], [-90.763, 14.4593], [-90.8202, 14.4049], [-90.8531, 14.4561], [-90.8905, 14.4893], [-90.945, 14.4409], [-90.9713, 14.3863], [-90.9828, 14.3883], [-90.9907, 14.4216], [-91.016, 14.4087], [-91.0469, 14.4284], [-91.0902, 14.4159], [-91.1113, 14.4304], [-91.0972, 14.4676], [-91.0972, 14.513], [-91.1141, 14.5304], [-91.1057, 14.6324], [-91.0741, 14.7004], [-91.0688, 14.7448], [-91.0874, 14.8263], [-91.0535, 14.8449], [-91.0246, 14.9166], [-90.9772, 14.9386], [-90.894, 14.9368], [-90.8529, 14.9419], [-90.8051, 14.9282], [-90.7536, 14.9282], [-90.6576, 14.9039], [-90.5942, 14.8835], [-90.5388, 14.89], [-90.4898, 14.9078], [-90.4775, 14.8942], [-90.4431, 14.8975], [-90.4121, 14.917], [-90.3999, 14.899]],
  ESCUINTLA: [[-91.5434, 14.054], [-91.5285, 14.0483], [-91.5298, 14.0822], [-91.4569, 14.1899], [-91.4617, 14.2699], [-91.4583, 14.3003], [-91.448, 14.3065], [-91.4299, 14.2857], [-91.4134, 14.2965], [-91.4233, 14.3366], [-91.4142, 14.3554], [-91.3857, 14.3758], [-91.3647, 14.376], [-91.3563, 14.3574], [-91.3652, 14.3392], [-91.359, 14.3073], [-91.3263, 14.2919], [-91.3, 14.3164], [-91.2891, 14.3059], [-91.2941, 14.282], [-91.1711, 14.272], [-91.1491, 14.309], [-91.1462, 14.3569], [-91.1113, 14.4304], [-91.0902, 14.4159], [-91.0469, 14.4284], [-91.016, 14.4087], [-90.9907, 14.4216], [-90.9828, 14.3883], [-90.9713, 14.3863], [-90.945, 14.4409], [-90.8905, 14.4893], [-90.8531, 14.4561], [-90.8202, 14.4049], [-90.763, 14.4593], [-90.7258, 14.4673], [-90.7147, 14.444], [-90.6505, 14.4687], [-90.6377, 14.4315], [-90.5964, 14.4151], [-90.5856, 14.3504], [-90.5863, 14.3173], [-90.5649, 14.2562], [-90.5797, 14.2424], [-90.5872, 14.2124], [-90.5359, 14.2134], [-90.5157, 14.2025], [-90.5534, 14.1671], [-90.5785, 14.1613], [-90.5784, 14.1474], [-90.5562, 14.1182], [-90.5824, 14.0965], [-90.593, 14.0726], [-90.6271, 14.0559], [-90.6273, 13.9207], [-90.5002, 13.8947], [-90.4012, 13.8586], [-90.2456, 13.7907], [-90.0999, 13.732], [-90.0999, 13.7311], [-90.4995, 13.8942], [-90.6291, 13.9206], [-90.9099, 13.9109], [-91.3167, 13.9555], [-91.5434, 14.054]],
  XINCA: [[-90.0999, 13.732], [-90.2456, 13.7907], [-90.4012, 13.8586], [-90.5002, 13.8947], [-90.6273, 13.9207], [-90.6271, 14.0559], [-90.593, 14.0726], [-90.5824, 14.0965], [-90.5562, 14.1182], [-90.5784, 14.1474], [-90.5785, 14.1613], [-90.5534, 14.1671], [-90.5157, 14.2025], [-90.5359, 14.2134], [-90.5872, 14.2124], [-90.5797, 14.2424], [-90.5649, 14.2562], [-90.5364, 14.2662], [-90.5097, 14.2884], [-90.4722, 14.3037], [-90.4438, 14.3286], [-90.4478, 14.3879], [-90.4294, 14.4335], [-90.3883, 14.4965], [-90.3596, 14.5025], [-90.3498, 14.4781], [-90.3141, 14.5059], [-90.2852, 14.5143], [-90.2836, 14.5452], [-90.2658, 14.6115], [-90.2228, 14.6448], [-90.2091, 14.6743], [-90.1842, 14.6869], [-90.1735, 14.7094], [-90.1135, 14.7303], [-90.0781, 14.7201], [-90.0386, 14.7826], [-89.9818, 14.7932], [-89.9224, 14.8193], [-89.8875, 14.8619], [-89.8625, 14.8771], [-89.834, 14.8765], [-89.8417, 14.8598], [-89.7937, 14.7857], [-89.676, 14.7786], [-89.667, 14.7599], [-89.6678, 14.7157], [-89.6602, 14.6957], [-89.696, 14.599], [-89.6996, 14.5776], [-89.6452, 14.5732], [-89.6235, 14.5598], [-89.5945, 14.523], [-89.5194, 14.5259], [-89.4991, 14.5087], [-89.4976, 14.4921], [-89.5115, 14.4419], [-89.4961, 14.4229], [-89.5218, 14.3981], [-89.5995, 14.3275], [-89.5311, 14.2258], [-89.7111, 14.1492], [-89.7471, 14.0447], [-89.8803, 14.0433], [-90.0999, 13.8579], [-90.0999, 13.732]],
  MOTAGUA: [[-90.2091, 14.6743], [-90.2367, 14.6951], [-90.3085, 14.7223], [-90.3388, 14.751], [-90.3434, 14.7704], [-90.3311, 14.7941], [-90.3501, 14.8549], [-90.4068, 14.8521], [-90.4176, 14.8709], [-90.3999, 14.899], [-90.3874, 14.8873], [-90.3543, 14.8815], [-90.3034, 14.8896], [-90.2826, 14.9545], [-90.1239, 15.0613], [-90, 15.1421], [-89.973, 15.1565], [-89.9238, 15.1511], [-89.878, 15.1599], [-89.8505, 15.1717], [-89.817, 15.1724], [-89.7703, 15.157], [-89.7066, 15.1664], [-89.6747, 15.1643], [-89.6055, 15.1799], [-89.5498, 15.1878], [-89.4313, 15.2264], [-89.3143, 15.2721], [-89.2882, 15.2911], [-89.2505, 15.3029], [-89.2099, 15.2976], [-89.1756, 15.2756], [-89.1704, 15.2599], [-89.1771, 15.2216], [-89.1972, 15.2104], [-89.1891, 15.1364], [-89.1812, 15.1026], [-89.1469, 15.0713], [-89.1098, 15.0915], [-89.0316, 15.1168], [-89.1459, 15.0717], [-89.1891, 14.9128], [-89.2287, 14.8348], [-89.1459, 14.7108], [-89.1603, 14.5812], [-89.2467, 14.5728], [-89.3619, 14.4153], [-89.4951, 14.4223], [-89.5218, 14.3981], [-89.4961, 14.4229], [-89.5115, 14.4419], [-89.4976, 14.4921], [-89.4991, 14.5087], [-89.5194, 14.5259], [-89.5945, 14.523], [-89.6235, 14.5598], [-89.6452, 14.5732], [-89.6996, 14.5776], [-89.696, 14.599], [-89.6602, 14.6957], [-89.6678, 14.7157], [-89.667, 14.7599], [-89.676, 14.7786], [-89.7937, 14.7857], [-89.8417, 14.8598], [-89.834, 14.8765], [-89.8625, 14.8771], [-89.8875, 14.8619], [-89.9224, 14.8193], [-89.9818, 14.7932], [-90.0386, 14.7826], [-90.0781, 14.7201], [-90.1135, 14.7303], [-90.1735, 14.7094], [-90.1842, 14.6869], [-90.2091, 14.6743]],
  VERAPAZ: [[-90.6576, 14.9039], [-90.6735, 14.939], [-90.7122, 14.9738], [-90.7073, 15.0002], [-90.7972, 15.0549], [-90.8719, 15.1485], [-90.8657, 15.2568], [-90.8574, 15.2527], [-90.6916, 15.2149], [-90.5744, 15.21], [-90.5413, 15.2125], [-90.4972, 15.2709], [-90.4785, 15.3106], [-90.4776, 15.331], [-90.4935, 15.3397], [-90.6508, 15.3631], [-90.682, 15.375], [-90.7027, 15.3944], [-90.7098, 15.4266], [-90.6922, 15.449], [-90.6401, 15.4589], [-90.6481, 15.4763], [-90.597, 15.526], [-90.6255, 15.5821], [-90.6406, 15.5924], [-90.6327, 15.6229], [-90.6617, 15.6476], [-90.6625, 15.6592], [-90.689, 15.6544], [-90.7434, 15.6727], [-90.7806, 15.6789], [-90.7882, 15.6884], [-90.771, 15.709], [-90.7915, 15.7233], [-90.7772, 15.737], [-90.7933, 15.7508], [-90.8181, 15.7506], [-90.7846, 15.7984], [-90.7672, 15.8394], [-90.743, 15.8486], [-90.7326, 15.8681], [-90.7386, 15.8853], [-90.7635, 15.8878], [-90.7538, 15.921], [-90.7362, 15.9424], [-90.7635, 15.9697], [-90.7232, 15.9902], [-90.7128, 15.9763], [-90.6953, 16.0039], [-90.7027, 16.0175], [-90.6601, 16.0398], [-90.6343, 16.0452], [-90.6201, 16.0312], [-90.6055, 16.0429], [-90.5903, 16.0184], [-90.5581, 15.9977], [-90.5444, 16.0107], [-90.5067, 16.0062], [-90.4874, 16.018], [-90.4693, 16.0107], [-90.436, 16.034], [-90.4315, 16.0655], [-90.4478, 16.0797], [-90.4208, 16.0824], [-90.2168, 16.0521], [-90.0467, 15.9995], [-90.0147, 16.0089], [-89.9887, 15.9948], [-89.9597, 16.0076], [-89.9574, 15.9851], [-89.8873, 15.9627], [-89.8589, 15.9157], [-89.7922, 15.9118], [-89.7748, 15.9257], [-89.7426, 15.9309], [-89.6795, 15.892], [-89.6558, 15.887], [-89.634, 15.8997], [-89.565, 15.8922], [-89.5155, 15.8952], [-89.513, 15.8431], [-89.4633, 15.8583], [-89.4464, 15.8494], [-89.3963, 15.8613], [-89.4238, 15.8258], [-89.4593, 15.8123], [-89.4775, 15.7792], [-89.5277, 15.75], [-89.654, 15.5777], [-89.6542, 15.5575], [-89.5881, 15.4812], [-89.6117, 15.438], [-89.6383, 15.4229], [-89.6471, 15.2907], [-89.6274, 15.2549], [-89.6298, 15.2193], [-89.6055, 15.1799], [-89.6747, 15.1643], [-89.7066, 15.1664], [-89.7703, 15.157], [-89.817, 15.1724], [-89.8505, 15.1717], [-89.878, 15.1599], [-89.9238, 15.1511], [-89.973, 15.1565], [-90, 15.1421], [-90.1239, 15.0613], [-90.2826, 14.9545], [-90.3034, 14.8896], [-90.3543, 14.8815], [-90.3874, 14.8873], [-90.3999, 14.899], [-90.4121, 14.917], [-90.4431, 14.8975], [-90.4775, 14.8942], [-90.4898, 14.9078], [-90.5388, 14.89], [-90.5942, 14.8835], [-90.6576, 14.9039]],
  IZABAL: [[-89.0316, 15.1168], [-89.1098, 15.0915], [-89.1469, 15.0713], [-89.1812, 15.1026], [-89.1891, 15.1364], [-89.1972, 15.2104], [-89.1771, 15.2216], [-89.1704, 15.2599], [-89.1756, 15.2756], [-89.2099, 15.2976], [-89.2505, 15.3029], [-89.2882, 15.2911], [-89.3143, 15.2721], [-89.4313, 15.2264], [-89.5498, 15.1878], [-89.6055, 15.1799], [-89.6298, 15.2193], [-89.6274, 15.2549], [-89.6471, 15.2907], [-89.6383, 15.4229], [-89.6117, 15.438], [-89.5881, 15.4812], [-89.6542, 15.5575], [-89.654, 15.5777], [-89.5277, 15.75], [-89.4775, 15.7792], [-89.4593, 15.8123], [-89.4238, 15.8258], [-89.3963, 15.8613], [-89.3807, 15.8716], [-89.358, 15.9129], [-89.266, 15.9147], [-89.236, 15.9065], [-89.2341, 15.9549], [-89.2213, 16.0712], [-89.2359, 15.9064], [-88.9155, 15.8939], [-88.7859, 15.859], [-88.5987, 15.7057], [-88.5591, 15.8534], [-88.6203, 15.9538], [-88.2207, 15.7252], [-88.3179, 15.6751], [-88.4691, 15.5204], [-88.9731, 15.14], [-89.0316, 15.1168]],
  PETEN_S: [[-90.6601, 16.6326], [-90.6677, 16.6526], [-90.7353, 16.7466], [-90.7398, 16.75], [-89.1687, 16.75], [-89.1927, 16.3927], [-89.2213, 16.0712], [-89.2341, 15.9549], [-89.236, 15.9065], [-89.266, 15.9147], [-89.358, 15.9129], [-89.3807, 15.8716], [-89.3963, 15.8613], [-89.4464, 15.8494], [-89.4633, 15.8583], [-89.513, 15.8431], [-89.5155, 15.8952], [-89.565, 15.8922], [-89.634, 15.8997], [-89.6558, 15.887], [-89.6795, 15.892], [-89.7426, 15.9309], [-89.7748, 15.9257], [-89.7922, 15.9118], [-89.8589, 15.9157], [-89.8873, 15.9627], [-89.9574, 15.9851], [-89.9597, 16.0076], [-89.9887, 15.9948], [-90.0147, 16.0089], [-90.0467, 15.9995], [-90.2168, 16.0521], [-90.4208, 16.0824], [-90.4478, 16.0797], [-90.4345, 16.1072], [-90.4488, 16.0997], [-90.4455, 16.3077], [-90.3951, 16.4192], [-90.5427, 16.4903], [-90.6327, 16.4833], [-90.6327, 16.592], [-90.6601, 16.6326]],
  PETEN_NW: [[-89.75, 17.8146], [-89.75, 16.75], [-90.7398, 16.75], [-90.7353, 16.7466], [-90.6677, 16.6526], [-90.6601, 16.6326], [-90.7371, 16.7467], [-91.0683, 16.9181], [-91.2915, 17.1884], [-91.4319, 17.2539], [-90.9927, 17.2525], [-90.9927, 17.8016], [-90.9639, 17.8155], [-89.75, 17.8146]],
  PETEN_NE: [[-89.1687, 16.75], [-89.75, 16.75], [-89.75, 17.8146], [-89.1603, 17.8141], [-89.1495, 17.3208], [-89.1495, 17.0365], [-89.1687, 16.75]],
  ALL: [[-92.2455, 14.5463], [-92.1627, 14.7024], [-92.1915, 14.8139], [-92.1555, 14.9964], [-92.0727, 15.0731], [-92.2023, 15.2375], [-92.1057, 15.4536], [-91.7523, 16.0457], [-91.7235, 16.0694], [-90.4491, 16.0792], [-90.4455, 16.3077], [-90.3951, 16.4192], [-90.5427, 16.4903], [-90.6327, 16.4833], [-90.6327, 16.592], [-90.7371, 16.7467], [-91.0683, 16.9181], [-91.2915, 17.1884], [-91.4319, 17.2539], [-90.9927, 17.2525], [-90.9927, 17.8016], [-90.9639, 17.8155], [-89.1603, 17.8141], [-89.1495, 17.0365], [-89.2359, 15.9064], [-88.9155, 15.8939], [-88.7859, 15.859], [-88.5987, 15.7057], [-88.5591, 15.8534], [-88.6203, 15.9538], [-88.2207, 15.7252], [-88.3179, 15.6751], [-88.4691, 15.5204], [-88.9731, 15.14], [-89.1459, 15.0717], [-89.1891, 14.9128], [-89.2287, 14.8348], [-89.1459, 14.7108], [-89.1603, 14.5812], [-89.2467, 14.5728], [-89.3619, 14.4153], [-89.4951, 14.4223], [-89.5995, 14.3275], [-89.5311, 14.2258], [-89.7111, 14.1492], [-89.7471, 14.0447], [-89.8803, 14.0433], [-90.0999, 13.8579], [-90.0999, 13.7311], [-90.4995, 13.8942], [-90.6291, 13.9206], [-90.9099, 13.9109], [-91.3167, 13.9555], [-91.6587, 14.1171], [-91.9071, 14.2843], [-92.2455, 14.5463]],
};

// Spanish Empire 'new-spain' split on 22°N: NS_SOUTH (1530 ring south of 22°N, with Guatemala +0.05° and everything south-east of 92.25°W / 17.85°N cut out, so its grow-in / fade-out, which scales towards the centroid, stays clear) and
// NS_NORTH_<year> (each keyframe's ring north of 22°N).
export const GT_TRIMS = {
  NS_SOUTH: [[-87.186, 17.85], [-89.14, 17.85], [-89.151, 17.863], [-90.977, 17.864], [-90.993, 17.85], [-92.25, 17.85], [-92.25, 14.634], [-92.294, 14.536], [-92.25, 14.502], [-92.25, 14.469], [-96, 14], [-104, 15], [-110, 16], [-108.8, 22], [-86, 22], [-87.186, 17.85]],
  NS_NORTH_1530: [[-108, 26], [-100, 28], [-92, 26], [-86, 22], [-108.8, 22], [-108, 26]],
  NS_NORTH_1700: [[-110, 30], [-100, 32], [-90, 28], [-86, 22], [-111.333, 22], [-110, 30]],
  NS_NORTH_1800: [[-108, 26], [-98, 28], [-90, 24], [-88, 22], [-108.8, 22], [-108, 26]],
};

const P = (names) => names.map((n) => {
  if (!GT_PIECES[n]) throw new Error(`guatemala pack: no piece ${n}`);
  return GT_PIECES[n];
});
export const GT_STEPS = {};
function build(meta, steps) {
  GT_STEPS[meta.id] = steps;
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

// ---- Kaminaljuyu --------------------------------------------------------------------------------
const kaminaljuyu = build({
  id: 'kaminaljuyu', name: 'Kaminaljuyu', color: '#A16207',
  description: 'The great highland Maya city of the Valley of Guatemala (now under Guatemala City). It peaked in the Late Preclassic, with irrigation canals from Lake Miraflores and control of the El Chayal obsidian source, then built Teotihuacan-style platforms in the Early Classic. Drawn as the central highland piece around the valley from 500 BCE to its Late Classic decline.',
  timelineItemIds: ['gt-kaminaljuyu'],
  confidence: conf('conjectural', 'Kaminaljuyu’s size and dates are well known from excavation, but no text names the land it ruled. The outline is the departments around the Valley of Guatemala (Guatemala, Sacatepéquez, Chimaltenango), standing in for its sphere.'),
  sources: [W('Kaminaljuyu'), W('Pre-Columbian history of Guatemala')],
}, [
  [-500, 'Kaminaljuyu, Late Preclassic highland centre', { valley: ['Valley of Guatemala', ['KAQCHIKEL']] }],
  [-100, 'Kaminaljuyu at its Preclassic peak', { valley: ['Valley of Guatemala', ['KAQCHIKEL']] }],
  [400, 'Teotihuacan-linked Kaminaljuyu', { valley: ['Valley of Guatemala', ['KAQCHIKEL']] }],
  [800, 'Kaminaljuyu in decline', { valley: ['Valley of Guatemala', ['KAQCHIKEL']] }],
]);

// ---- Mutal (Tikal) ------------------------------------------------------------------------------
const tikal = build({
  id: 'mutal-tikal', name: 'Mutal (Tikal)', color: '#B45309',
  description: 'Tikal’s kingdom, which its rulers called Mutal, one of the two Classic Maya superpowers. Siyaj K’ak’ arrived from Teotihuacan in 378; Caracol defeated Tikal in 562; Jasaw Chan K’awiil I beat Calakmul in 695 and the great temples followed. Drawn as its north-east Petén core domain (Tikal, Uaxactun, Yaxha), not its wider network of allies; the last dated monument is from 869.',
  nameAt: [[250, 'Mutal (Tikal)'], [562, 'Mutal (Tikal), after Caracol'], [695, 'Mutal (Tikal), Late Classic revival']],
  timelineItemIds: ['gt-tikal', 'gt-classic-collapse'],
  confidence: conf('conjectural', 'Kings, wars and dates come from Tikal’s own inscriptions, but Classic kingdoms had no surveyed borders and Tikal’s rivals Naranjo and Yaxha sat nearby. The outline is the north-east Petén piece as Mutal’s core domain.'),
  sources: [W('Tikal'), W('Siyaj K\'ak\''), W('Jasaw Chan K\'awiil I'), W('Classic Maya collapse')],
}, [
  [250, 'Early Classic Mutal', { core: ['North-east Petén', ['PETEN_NE']] }],
  [378, 'Siyaj K’ak’ and the Teotihuacan entrada (378)', { core: ['North-east Petén', ['PETEN_NE']] }],
  [562, 'Defeat by Caracol; the Tikal hiatus', { core: ['North-east Petén', ['PETEN_NE']] }],
  [695, 'Jasaw Chan K’awiil I defeats Calakmul (695)', { core: ['North-east Petén', ['PETEN_NE']] }],
  [869, 'Tikal’s last dated monument (869)', { core: ['North-east Petén', ['PETEN_NE']] }],
]);

// ---- Dos Pilas / Petexbatún ---------------------------------------------------------------------
const petexbatun = build({
  id: 'petexbatun', name: 'Dos Pilas (Petexbatún)', color: '#9A3412',
  description: 'A breakaway branch of Tikal’s dynasty founded Dos Pilas around 629 and sided with Calakmul. The Petexbatún kingdom ruled Seibal and the Pasión river; after Dos Pilas fell (761) the court held out at fortified Aguateca until it burned around 810.',
  nameAt: [[629, 'Dos Pilas (Petexbatún)'], [761, 'Aguateca (Petexbatún)']],
  timelineItemIds: ['gt-petexbatun', 'gt-classic-collapse'],
  confidence: conf('conjectural', 'Founding, wars and abandonment are dated from inscriptions and excavation (Vanderbilt Petexbatún project), but its territory is not mapped. The outline is southern Petén (the Pasión / Petexbatún basin), a generous stand-in.'),
  sources: [W('Dos Pilas'), W('Aguateca'), W('Ceibal (Maya site)')],
}, [
  [629, 'B’alaj Chan K’awiil founds Dos Pilas', { south: ['Southern Petén', ['PETEN_S']] }],
  [700, 'Petexbatún kingdom rules the Pasión', { south: ['Southern Petén', ['PETEN_S']] }],
  [761, 'Dos Pilas falls; court moves to Aguateca', { south: ['Southern Petén', ['PETEN_S']] }],
  [809, 'Aguateca on the eve of its burning', { south: ['Southern Petén', ['PETEN_S']] }],
]);

// ---- Quiriguá -----------------------------------------------------------------------------------
const quirigua = build({
  id: 'quirigua', name: 'Quiriguá', color: '#C2410C',
  description: 'The Motagua valley city, a dependency of Copán from 426 until 738, when K’ak’ Tiliw Chan Yopaat captured Copán’s king and made Quiriguá independent. Its giant stelae and zoomorphs are a UNESCO World Heritage Site. Drawn as the lower Motagua / Izabal piece.',
  nameAt: [[426, 'Quiriguá (under Copán)'], [738, 'Quiriguá']],
  timelineItemIds: ['gt-quirigua'],
  confidence: conf('conjectural', 'Quiriguá’s dynasty and the 738 capture are dated from its monuments, but its land is unmapped. The outline is the Izabal department (the lower Motagua valley and Caribbean shore), larger than any area it surely ruled.'),
  sources: [W('Quiriguá'), W('K\'ak\' Tiliw Chan Yopaat')],
}, [
  [426, 'Quiriguá founded under Copán', { motagua: ['Lower Motagua', ['IZABAL']] }],
  [738, 'K’ak’ Tiliw Chan Yopaat captures Copán’s king', { motagua: ['Lower Motagua', ['IZABAL']] }],
  [810, 'Quiriguá’s last monuments', { motagua: ['Lower Motagua', ['IZABAL']] }],
]);

// ---- K’iche’ ------------------------------------------------------------------------------------
const kiche = build({
  id: 'kiche-kingdom', name: 'K’iche’ kingdom', color: '#15803D',
  description: 'The strongest Postclassic highland Maya kingdom, ruled from Q’umarkaj (Utatlán), whose history the Popol Vuh tells. Under K’iq’ab (about 1425–1475) it took the Quetzaltenango valley and the cacao coast and held the Kaqchikel as allies, until their revolt around 1470. Pedro de Alvarado defeated the K’iche’ in February 1524 and burned Q’umarkaj in March.',
  nameAt: [[1225, 'K’iche’ kingdom'], [1400, 'K’iche’ kingdom of Q’umarkaj']],
  timelineItemIds: ['gt-kiche', 'gt-spanish-conquest'],
  confidence: conf('approximate', 'K’iche’ conquests are known from the Popol Vuh, the Título de Totonicapán and Spanish accounts, and Q’umarkaj is excavated. Borders are department groups: Quiché + Totonicapán, with the western valleys and coast from about 1425.'),
  sources: [W('K\'iche\' kingdom of Q\'umarkaj'), W('Q\'umarkaj'), W('Popol Vuh'), W('Spanish conquest of Guatemala')],
}, [
  [1225, 'K’iche’ lords settle the Quiché basin', { core: ['Quiché basin', ['KICHE']] }],
  [1400, 'Q’umarkaj founded', { core: ['Quiché basin', ['KICHE']] }],
  [1425, 'K’iq’ab conquers the western valleys and coast', { core: ['K’iche’ lands', ['KICHE', 'WEST']] }],
  [1450, 'K’iq’ab’s realm with Kaqchikel allies', { core: ['K’iche’ lands', ['KICHE', 'WEST', 'KAQCHIKEL']] }],
  [1470, 'Kaqchikel revolt splits the realm', { core: ['K’iche’ lands', ['KICHE', 'WEST']] }],
  [1523, 'K’iche’ on the eve of Alvarado', { core: ['K’iche’ lands', ['KICHE', 'WEST']] }],
]);

// ---- Kaqchikel ----------------------------------------------------------------------------------
const kaqchikel = build({
  id: 'kaqchikel-kingdom', name: 'Kaqchikel kingdom (Iximche)', color: '#CA8A04',
  description: 'The Kaqchikel broke away from the K’iche’ around 1470 and ruled from Iximche. They allied with Alvarado in 1524 (the first Spanish Santiago was founded at Iximche that July), then rose against Spanish tribute demands in August 1524 and held out until 1530. Drawn to 1526; from 1527 the Spanish capital at Almolonga holds the valley.',
  timelineItemIds: ['gt-kaqchikel', 'gt-spanish-conquest'],
  confidence: conf('approximate', 'Iximche’s founding and the 1524–30 revolt are recorded in the Annals of the Kaqchikels and Spanish letters. The outline is Chimaltenango + Sacatepéquez + Guatemala departments; the revolt years are shown only to 1526, while the Kaqchikel fought on from the hills to 1530.'),
  sources: [W('Iximche'), W('Kaqchikel people'), W('Annals of the Cakchiquels')],
}, [
  [1470, 'Kaqchikel kingdom founded at Iximche', { core: ['Kaqchikel lands', ['KAQCHIKEL']] }],
  [1500, 'Kaqchikel kingdom', { core: ['Kaqchikel lands', ['KAQCHIKEL']] }],
  [1524, 'Alliance with Alvarado, then revolt (Aug 1524)', { core: ['Kaqchikel lands', ['KAQCHIKEL']] }],
  [1526, 'Kaqchikel revolt', { core: ['Kaqchikel lands', ['KAQCHIKEL']] }],
]);

// ---- Tz’utujil ----------------------------------------------------------------------------------
const tzutujil = build({
  id: 'tzutujil-kingdom', name: 'Tz’utujil kingdom', color: '#0369A1',
  description: 'The Tz’utujil ruled the south shore of Lake Atitlán from Chiya’ (near Santiago Atitlán) and the cacao-rich Pacific piedmont below it, until Alvarado and his Kaqchikel allies defeated them in April 1524.',
  timelineItemIds: ['gt-highland-kingdoms', 'gt-spanish-conquest'],
  confidence: conf('approximate', 'The Tz’utujil capital and the 1524 conquest are well recorded; the outline is Sololá + Suchitepéquez departments, which also take in Kaqchikel towns on the north shore of the lake.'),
  sources: [W('Tz\'utujil people'), W('Spanish conquest of Guatemala')],
}, [
  [1250, 'Tz’utujil lords at Lake Atitlán', { core: ['Atitlán and the cacao coast', ['TZUTUJIL']] }],
  [1450, 'Tz’utujil kingdom', { core: ['Atitlán and the cacao coast', ['TZUTUJIL']] }],
  [1523, 'Tz’utujil on the eve of Alvarado', { core: ['Atitlán and the cacao coast', ['TZUTUJIL']] }],
]);

// ---- Mam ----------------------------------------------------------------------------------------
const mam = build({
  id: 'mam-kingdom', name: 'Mam (Zaculeu)', color: '#7C3AED',
  description: 'The Mam held the north-western highlands from Zaculeu near today’s Huehuetenango, losing the Quetzaltenango valley to the K’iche’ in the 15th century. Zaculeu surrendered to Gonzalo de Alvarado in October 1525 after a months-long siege.',
  timelineItemIds: ['gt-highland-kingdoms', 'gt-spanish-conquest'],
  confidence: conf('approximate', 'Zaculeu is excavated and its 1525 siege recorded; the outline is the Huehuetenango department only, smaller than Mam lands before the K’iche’ conquests (which also took in San Marcos and Quetzaltenango).'),
  sources: [W('Mam people'), W('Zaculeu'), W('Spanish conquest of Guatemala')],
}, [
  [1250, 'Mam lords at Zaculeu', { core: ['Huehuetenango highlands', ['HUEHUE']] }],
  [1450, 'Mam (Zaculeu)', { core: ['Huehuetenango highlands', ['HUEHUE']] }],
  [1525, 'Siege of Zaculeu (1525)', { core: ['Huehuetenango highlands', ['HUEHUE']] }],
]);

// ---- Tezulutlán ---------------------------------------------------------------------------------
const tezulutlan = build({
  id: 'tezulutlan', name: 'Tezulutlán (Q’eqchi’ lands)', color: '#0D9488',
  description: 'The Q’eqchi’ and Poqomchi’ uplands of the Verapaces, which the Spanish called Tezulutlán, the “Land of War”, after armed entries failed. Dominicans under Bartolomé de las Casas brought the region in peacefully from 1537; the Crown renamed it Verapaz in 1547.',
  timelineItemIds: ['gt-verapaz', 'gt-highland-kingdoms'],
  confidence: conf('conjectural', 'Q’eqchi’ and Poqomchi’ communities were a patchwork of towns, not one kingdom. The outline is the Alta + Baja Verapaz departments; the change to Spanish Verapaz is dated 1545 (between the first missions, 1537, and the renaming, 1547).'),
  sources: [W('Verapaz'), W('Q\'eqchi\' people'), W('Bartolomé de las Casas')],
}, [
  [1300, 'Q’eqchi’ and Poqomchi’ uplands', { core: ['Verapaz uplands', ['VERAPAZ']] }],
  [1524, 'Tezulutlán, the “Land of War”', { core: ['Verapaz uplands', ['VERAPAZ']] }],
  [1537, 'Dominican mission begins', { core: ['Verapaz uplands', ['VERAPAZ']] }],
  [1544, 'Tezulutlán before Spanish Verapaz', { core: ['Verapaz uplands', ['VERAPAZ']] }],
]);

// ---- Itza ---------------------------------------------------------------------------------------
const itza = build({
  id: 'itza-kingdom', name: 'Itza kingdom (Nojpetén)', color: '#16A34A',
  description: 'The Itza ruled central Petén from Nojpetén, an island city on Lake Petén Itzá (now Flores), with rival Kowoj lands to the north-east. Cortés passed through in 1525; missions and expeditions failed for nearly two centuries. Martín de Ursúa stormed Nojpetén on 13 March 1697, ending the last independent Maya kingdom.',
  timelineItemIds: ['gt-itza', 'gt-spanish-conquest'],
  confidence: conf('conjectural', 'Nojpetén and the 1697 conquest are well documented (Jones 1998), but the Itza arrival is dated variously and Itza / Kowoj borders are unknown. The outline is central and northern Petén (north of 16.75°N), much of it thinly peopled.'),
  sources: [W('Itza people'), W('Nojpetén'), W('Spanish conquest of Petén'), W('Kowoj')],
}, [
  [1440, 'Itza settle Lake Petén Itzá', { core: ['Central Petén', ['PETEN_NW', 'PETEN_NE']] }],
  [1525, 'Cortés at Nojpetén (1525)', { core: ['Central Petén', ['PETEN_NW', 'PETEN_NE']] }],
  [1618, 'Franciscan visit; Itza still independent', { core: ['Central Petén', ['PETEN_NW', 'PETEN_NE']] }],
  [1696, 'Itza on the eve of Ursúa', { core: ['Central Petén', ['PETEN_NW', 'PETEN_NE']] }],
]);

// ---- Spanish Guatemala --------------------------------------------------------------------------
const HIGH_1524 = ['KICHE', 'WEST', 'TZUTUJIL', 'ESCUINTLA', 'XINCA'];
const spanishGuatemala = build({
  id: 'spanish-guatemala', name: 'Spanish Guatemala', color: '#B91C1C',
  description: 'Guatemala under Spain: Alvarado’s conquest from 1524, the Audiencia from 1543 (at Santiago from 1549) and the Kingdom / Captaincy General of Guatemala that ruled Central America from Chiapas to Costa Rica within the Viceroyalty of New Spain. Drawn only over today’s Guatemala; it grows with the conquest — Zaculeu 1525, the Kaqchikel valley 1527, Chiquimula 1530, Verapaz 1545, the Izabal coast 1600 and Petén after Nojpetén fell in 1697. From 1815 the nations layer continues it to independence (1821).',
  nameAt: [[1524, 'Spanish Guatemala (conquest)'], [1543, 'Audiencia of Guatemala'], [1609, 'Captaincy General of Guatemala']],
  timelineItemIds: ['gt-spanish-conquest', 'gt-kingdom-of-guatemala', 'gt-santiago', 'gt-verapaz'],
  confidence: conf('approximate', 'Conquest dates are well recorded; the pace of control in the east (Chiquimula), the Izabal coast and southern Petén (Manche Ch’ol, Lakandon) is approximate. Pieces are today’s departments, not colonial provinces; the rest of the Kingdom of Guatemala (Chiapas to Costa Rica) is left to the empire and nations layers.'),
  sources: [W('Spanish conquest of Guatemala'), W('Captaincy General of Guatemala'), W('Real Audiencia of Guatemala'), W('Spanish conquest of Petén')],
}, [
  [1524, 'Alvarado’s conquest (1524)', { highlands: ['Conquered highlands and coast', HIGH_1524] }],
  [1526, 'Zaculeu taken (1525)', { highlands: ['Conquered highlands and coast', [...HIGH_1524, 'HUEHUE']] }],
  [1527, 'Santiago founded at Almolonga (1527)', { highlands: ['Highlands and coast', [...HIGH_1524, 'HUEHUE', 'KAQCHIKEL']] }],
  [1530, 'Kaqchikel surrender; Chiquimula conquered (1530)', { highlands: ['Highlands and coast', [...HIGH_1524, 'HUEHUE', 'KAQCHIKEL', 'MOTAGUA']] }],
  [1545, 'Verapaz brought in (1545–47)', { highlands: ['Highlands, coast and Verapaz', [...HIGH_1524, 'HUEHUE', 'KAQCHIKEL', 'MOTAGUA', 'VERAPAZ']] }],
  [1600, 'Izabal coast (Santo Tomás, San Felipe)', { highlands: ['Guatemala south of Petén', [...HIGH_1524, 'HUEHUE', 'KAQCHIKEL', 'MOTAGUA', 'VERAPAZ', 'IZABAL']] }],
  [1697, 'Nojpetén falls; Petén annexed (1697)', { highlands: ['Guatemala with Petén', ['ALL']] }],
  [1776, 'Capital moves to Nueva Guatemala (1776)', { highlands: ['Guatemala with Petén', ['ALL']] }],
  [1815, 'Captaincy General on the eve of the nations layer', { highlands: ['Guatemala with Petén', ['ALL']] }],
]);

export const guatemalaPolities = [kaminaljuyu, tikal, petexbatun, quirigua, kiche, kaqchikel, tzutujil, mam, tezulutlan, itza, spanishGuatemala];

// ---- Fixes to older shapes over Guatemala -------------------------------------------------------
// The Spanish Empire's schematic 'new-spain' ring covered all of Guatemala from 1530, including
// Itza Petén, and grew in from 1492 across the Maya lands before Cortés had landed. The ring is
// split on 22°N: the southern part (GT_TRIMS.NS_SOUTH: the 1530 ring south of 22°N with Guatemala
// cut out) is the same in every keyframe, so its morph never sweeps back over Guatemala, and the
// northern part ('new-spain-north', each keyframe's own ring north of 22°N) keeps New Spain's
// northward growth. New Spain now starts at the conquest of Mexico: a small Veracruz ring at 1519
// (Cortés lands; nothing before 1518) growing to the southern part by 1521 (fall of Tenochtitlan), instead of growing
// in across the Maya lands from 1492. The 1800 extent is held to 1815 (Spain kept its mainland
// American colonies until 1810–25), so its fade-out starts when the nations layer takes over
// instead of drifting across Guatemala from 1800.
const VERACRUZ_1519 = [[-96.5, 19.0], [-96.3, 19.5], [-95.9, 19.3], [-96.0, 18.9], [-96.5, 19.0]];
const NORTH_BY_YEAR = { 1530: 'NS_NORTH_1530', 1535: 'NS_NORTH_1530', 1550: 'NS_NORTH_1530', 1700: 'NS_NORTH_1700', 1800: 'NS_NORTH_1800' };
export const guatemalaShapeFixes = {
  'spanish-empire': {
    split: 'new-spain at 22°N; south trimmed clear of Guatemala',
    years: Object.keys(NORTH_BY_YEAR).map(Number),
    add: [
      { year: 1518, copyOf: 1530, label: 'Spanish Caribbean, before Mexico', drop: ['new-spain', 'new-spain-north'] },
      { year: 1519, copyOf: 1530, label: 'Cortés lands at Veracruz (1519)', drop: ['new-spain-north'], regions: { 'new-spain': VERACRUZ_1519 } },
      { year: 1521, copyOf: 1530, label: 'Fall of Tenochtitlan (1521)', drop: ['new-spain-north'] },
      { year: 1815, copyOf: 1800, label: 'Spanish America on the eve of independence' },
    ],
  },
};
/** Apply `guatemalaShapeFixes` (throws if a target is missing). */
export function applyGuatemalaShapeFixes(entities) {
  const ent = entities.find((e) => e.id === 'spanish-empire');
  if (!ent) throw new Error('guatemala fixes: no entity spanish-empire');
  let n = 0;
  for (const kf of ent.overlays) {
    const i = kf.regions.findIndex((x) => typeof x === 'object' && x.id === 'new-spain');
    if (i < 0) continue;
    const key = NORTH_BY_YEAR[kf.year];
    if (!key) throw new Error(`guatemala fixes: spanish-empire ${kf.year} new-spain has no split`);
    const r = kf.regions[i];
    kf.regions.splice(i, 1, { ...r, ring: GT_TRIMS.NS_SOUTH }, { id: 'new-spain-north', name: 'Northern New Spain', ring: GT_TRIMS[key] });
    n += 1;
  }
  if (n !== Object.keys(NORTH_BY_YEAR).length) throw new Error(`guatemala fixes: split ${n} new-spain keyframes`);
  for (const { year, copyOf, label, drop = [], regions: over = {} } of guatemalaShapeFixes['spanish-empire'].add) {
    if (ent.overlays.some((o) => o.year === year)) throw new Error(`guatemala fixes: spanish-empire already has ${year}`);
    const src = ent.overlays.find((o) => o.year === copyOf);
    if (!src) throw new Error(`guatemala fixes: spanish-empire has no ${copyOf} keyframe`);
    const regions = src.regions
      .filter((r) => !drop.includes(typeof r === 'string' ? r : r.id))
      .map((r) => (typeof r === 'string' ? r : { ...r, ring: (over[r.id] || r.ring).map((p) => [...p]) }));
    ent.overlays.push({ ...src, year, label, regions });
  }
  ent.overlays.sort((a, b) => a.year - b.year);
  ent.keyYears = [...new Set([...(ent.keyYears || []), 1518, 1519, 1521, 1815])].sort((a, b) => a - b);
}
