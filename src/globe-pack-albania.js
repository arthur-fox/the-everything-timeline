/**
 * Day 91 — Phase 5 country pack 5, Southeast Europe: Albania (ROADMAP item 5, fifth country).
 *
 * Albania had no country timeline. On the globe before the 1815 nations layer the Albanian lands
 * were drawn only by the big rings passing over them (Rome, Byzantium to 1025, the Bulgarian and
 * Serbian packs’ northern Albania, the Ottoman Balkans ring from 1520 to the 1770s). Nothing
 * showed the Illyrian kingdom of Agron, Teuta and Gentius, Arbanon, the Angevin Kingdom of
 * Albania and its Duchy of Durazzo, Venetian Albania, Skanderbeg’s League of Lezhë or the Bushati and Ali Pasha
 * pashaliks, and the Roman Republic’s Illyricum grew over Gentius’s kingdom from 191 BCE. The
 * nations layer draws Albania (id `albania`) only from 1913; this pack uses other ids and has no
 * keyframe after 1813. The Maliq culture, the Greek colonies, Roman Dyrrachium, the Thopia and
 * Balšić lords, the Ottoman sanjaks before 1520 and everything after 1813 are timeline items with
 * pins, not outlines.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - 15 new pieces from Natural Earth 1:10m counties (public domain), clipped to the globe’s own
 *    Albania land (shape 119): the Serbia pack’s N_ALBANIA (Shkodër, Lezhë, Kukës, Dibër) split
 *    along its counties, so their union is N_ALBANIA exactly, and the other eight counties cut to
 *    fit the Serbia pack’s Zeta, Kosovo, North Macedonia and Greek Epirus / western Macedonia
 *    pieces. Shkodër, Lezhë and Durrës are cut at a meridian (19.70°, 19.80°, 19.66°E) into the
 *    coast (the Venetian towns’ districts) and the hinterland (Pukë and Malësia, Mirdita, Krujë).
 *    Reused: ZETA, EPIRUS and THESSALY from the Serbia pack. Generator: et-tools
 *    day91-pieces.py (outside the repo).
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - Trims (`applyAlbaniaShapeFixes`, run after the Croatia fixes): the Roman Republic’s -191
 *    keyframe is held to -168, so Illyricum appears at Pydna instead of growing over Gentius’s
 *    kingdom from 191 BCE. The Ottoman `anatolia-balkans` held steps 1740–1759 (split at 1757),
 *    1760–1779, 1780–1799 (split at 1787) and 1800–1813 (held from the 1800 keyframe, the
 *    1814 morph toward 1900 restored) are cut back from the pashaliks of Scutari and
 *    Yanina (precomputed rings, buffered 0.05°, simplified); the function throws if a source ring
 *    changes.
 *  - Pieces are regions, not surveyed borders (see each polity’s confidence reason).
 */

import { ensureClockwise, morphEntityAtYear } from './globe-morph.js';
import { resolveRegionHoles } from './globe-holes.js';
import { mergeRings } from './globe-med-pieces.js';
import { RS_PIECES } from './globe-pack-serbia.js';

const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });

export const AL_PIECES = {
  SHKODER_C: [[19.3682, 41.9774], [19.371, 41.9866], [19.3683, 41.9891], [19.3683, 41.992], [19.3696, 42.0801], [19.3697, 42.0863], [19.3749, 42.0947], [19.3662, 42.1099], [19.2864, 42.197], [19.2846, 42.199], [19.4004, 42.3259], [19.4012, 42.3348], [19.4051, 42.3393], [19.4794, 42.4259], [19.4903, 42.4387], [19.5178, 42.458], [19.5486, 42.5066], [19.5515, 42.51], [19.5881, 42.5329], [19.5977, 42.5638], [19.5984, 42.5647], [19.6566, 42.6324], [19.658, 42.634], [19.6589, 42.6336], [19.7, 42.6132], [19.7, 41.9061], [19.6839, 41.9137], [19.6183, 41.9161], [19.6254, 41.9337], [19.5601, 41.9387], [19.5732, 41.9028], [19.5474, 41.8899], [19.4732, 41.9139], [19.4662, 41.8826], [19.5267, 41.8377], [19.433, 41.8686], [19.3664, 41.8527], [19.3682, 41.9774]],
  SHKODER_IN: [[19.7438, 42.5916], [19.7468, 42.5901], [19.7454, 42.5829], [19.7343, 42.5244], [19.7516, 42.4934], [19.8291, 42.4687], [19.7892, 42.4141], [19.8099, 42.385], [19.8102, 42.3398], [19.8309, 42.2678], [19.8219, 42.2386], [19.87, 42.223], [19.9241, 42.2517], [20.0369, 42.2565], [20.1505, 42.2156], [20.2356, 42.1924], [20.2325, 42.1604], [20.1593, 42.1043], [20.1428, 42.0533], [20.1741, 42.0581], [20.2126, 42.0282], [20.1723, 41.9999], [20.0882, 41.9631], [20.0703, 41.9326], [20.005, 41.88], [19.9532, 41.8762], [19.9433, 41.9116], [19.9017, 41.9689], [19.8415, 41.9371], [19.8, 41.9456], [19.7955, 41.9465], [19.7393, 41.9378], [19.751, 41.9116], [19.7229, 41.8953], [19.7, 41.9061], [19.7, 42.6132], [19.7438, 42.5916]],
  KUKES: [[20.564, 41.8896], [20.5638, 41.8717], [20.5417, 41.8616], [20.5409, 41.8463], [20.54, 41.8453], [20.5401, 41.8448], [20.4982, 41.839], [20.4046, 41.8454], [20.3577, 41.8207], [20.3202, 41.8966], [20.2257, 41.8673], [20.2072, 41.8992], [20.2581, 41.9438], [20.2672, 41.9931], [20.2542, 42.0176], [20.2126, 42.0282], [20.1741, 42.0581], [20.1428, 42.0533], [20.1593, 42.1043], [20.2325, 42.1604], [20.2356, 42.1924], [20.1505, 42.2156], [20.0369, 42.2565], [19.9241, 42.2517], [19.87, 42.223], [19.8219, 42.2386], [19.8309, 42.2678], [19.8102, 42.3398], [19.8099, 42.385], [19.7892, 42.4141], [19.8291, 42.4687], [19.7516, 42.4934], [19.8299, 42.4691], [19.8303, 42.469], [19.9429, 42.5056], [19.9818, 42.5108], [19.9937, 42.5225], [19.9974, 42.5236], [20.0668, 42.544], [20.068, 42.5443], [20.0709, 42.5419], [20.0856, 42.53], [20.1026, 42.5231], [20.1456, 42.4967], [20.1512, 42.4933], [20.1584, 42.4804], [20.1986, 42.4084], [20.1997, 42.4065], [20.2296, 42.3267], [20.2498, 42.3186], [20.4702, 42.2387], [20.4729, 42.2377], [20.4759, 42.2353], [20.4773, 42.2323], [20.5508, 42.0739], [20.5632, 41.9018], [20.5632, 41.9009], [20.563, 41.8974], [20.5627, 41.8928], [20.564, 41.8896]],
  DIBER: [[20.3574, 41.38], [20.295, 41.3743], [20.2357, 41.3444], [20.16, 41.3645], [20.1084, 41.4031], [20.0641, 41.3893], [20.0001, 41.4271], [19.9622, 41.4821], [19.8362, 41.5667], [19.8121, 41.6478], [19.8135, 41.7069], [19.8584, 41.6929], [19.9062, 41.7047], [19.9465, 41.6831], [19.973, 41.7042], [20.0247, 41.7005], [20.0598, 41.7324], [20.1557, 41.7617], [20.159, 41.7976], [20.116, 41.8254], [20.1907, 41.864], [20.2072, 41.8992], [20.2257, 41.8673], [20.3202, 41.8966], [20.3577, 41.8207], [20.4046, 41.8454], [20.4982, 41.839], [20.5401, 41.8448], [20.5407, 41.8426], [20.5405, 41.8394], [20.5441, 41.828], [20.5446, 41.8265], [20.5493, 41.8069], [20.5502, 41.7999], [20.5498, 41.7993], [20.5318, 41.7755], [20.5113, 41.7579], [20.5007, 41.7344], [20.5004, 41.7339], [20.5004, 41.7338], [20.5083, 41.6617], [20.5186, 41.6339], [20.5283, 41.6077], [20.5328, 41.5875], [20.5275, 41.5849], [20.4758, 41.559], [20.4456, 41.544], [20.445, 41.5085], [20.4909, 41.436], [20.5185, 41.4276], [20.5372, 41.4067], [20.5392, 41.4025], [20.5387, 41.4018], [20.4918, 41.3388], [20.4781, 41.3216], [20.4494, 41.3883], [20.3574, 41.38]],
  ELBASAN: [[20.4788, 41.3214], [20.4882, 41.2891], [20.5112, 41.2099], [20.5702, 41.1252], [20.5962, 41.0879], [20.5973, 41.0863], [20.5974, 41.0862], [20.5901, 41.0185], [20.5428, 41.0296], [20.4229, 40.9881], [20.406, 40.9342], [20.3813, 40.9247], [20.3985, 40.8889], [20.4685, 40.7997], [20.4157, 40.7523], [20.3397, 40.7453], [20.2932, 40.726], [20.2219, 40.7157], [20.145, 40.7433], [20.1543, 40.7549], [20.093, 40.7801], [20.0686, 40.8112], [20.0131, 40.8285], [20.0166, 40.8737], [19.8672, 40.8684], [19.8031, 40.9013], [19.8119, 40.9995], [19.7234, 41.0111], [19.6762, 41.031], [19.6709, 41.0566], [19.7462, 41.1218], [19.8415, 41.1285], [19.8577, 41.159], [19.9712, 41.1948], [20.0356, 41.2543], [20.0692, 41.252], [20.1201, 41.2732], [20.1689, 41.3153], [20.2226, 41.3265], [20.2357, 41.3444], [20.295, 41.3743], [20.3574, 41.38], [20.4494, 41.3883], [20.4781, 41.3216], [20.4918, 41.3388], [20.491, 41.3377], [20.4799, 41.3229], [20.4788, 41.3214]],
  TIRANE: [[19.442, 41.1435], [19.442, 41.1441], [19.442, 41.1444], [19.4497, 41.1562], [19.5176, 41.26], [19.5175, 41.2602], [19.5873, 41.244], [19.6422, 41.3071], [19.6417, 41.3605], [19.62, 41.3895], [19.622, 41.4462], [19.66, 41.4562], [19.6875, 41.4635], [19.7192, 41.41], [19.7373, 41.4072], [19.893, 41.4693], [19.9111, 41.5098], [19.8362, 41.5667], [19.9622, 41.4821], [20.0001, 41.4271], [20.0641, 41.3893], [20.1084, 41.4031], [20.16, 41.3645], [20.2357, 41.3444], [20.2226, 41.3265], [20.1689, 41.3153], [20.1201, 41.2732], [20.0692, 41.252], [20.0356, 41.2543], [19.9712, 41.1948], [19.8577, 41.159], [19.8415, 41.1285], [19.7462, 41.1218], [19.6709, 41.0566], [19.5971, 41.0693], [19.5013, 41.0361], [19.4678, 41.0467], [19.4491, 41.0114], [19.4487, 41.0179], [19.442, 41.1435]],
  MIRDITA: [[19.8362, 41.5667], [19.8, 41.5802], [19.8, 41.9456], [19.8415, 41.9371], [19.9017, 41.9689], [19.9433, 41.9116], [19.9532, 41.8762], [20.005, 41.88], [20.0703, 41.9326], [20.0882, 41.9631], [20.1723, 41.9999], [20.2126, 42.0282], [20.2542, 42.0176], [20.2672, 41.9931], [20.2581, 41.9438], [20.2072, 41.8992], [20.1907, 41.864], [20.116, 41.8254], [20.159, 41.7976], [20.1557, 41.7617], [20.0598, 41.7324], [20.0247, 41.7005], [19.973, 41.7042], [19.9465, 41.6831], [19.9062, 41.7047], [19.8584, 41.6929], [19.8135, 41.7069], [19.8121, 41.6478], [19.8362, 41.5667]],
  KRUJE: [[19.8362, 41.5667], [19.9111, 41.5098], [19.893, 41.4693], [19.7373, 41.4072], [19.7192, 41.41], [19.6875, 41.4635], [19.66, 41.4562], [19.66, 41.5726], [19.6858, 41.5581], [19.7738, 41.59], [19.8, 41.5802], [19.8362, 41.5667]],
  LEZHE_C: [[19.5597, 41.5817], [19.5833, 41.6169], [19.5835, 41.6173], [19.613, 41.6053], [19.5773, 41.7021], [19.5822, 41.7737], [19.5852, 41.8185], [19.5494, 41.8303], [19.5267, 41.8377], [19.4662, 41.8826], [19.4732, 41.9139], [19.5474, 41.8899], [19.5732, 41.9028], [19.5601, 41.9387], [19.6254, 41.9337], [19.6183, 41.9161], [19.6839, 41.9137], [19.7, 41.9061], [19.7229, 41.8953], [19.751, 41.9116], [19.7393, 41.9378], [19.7955, 41.9465], [19.8, 41.9456], [19.8, 41.5802], [19.7738, 41.59], [19.6858, 41.5581], [19.66, 41.5726], [19.6375, 41.5852], [19.5605, 41.5814], [19.5594, 41.5813], [19.5597, 41.5817]],
  DURRES_C: [[19.4144, 41.3799], [19.3952, 41.4022], [19.5035, 41.5259], [19.5529, 41.5823], [19.5791, 41.6122], [19.5833, 41.6169], [19.5597, 41.5817], [19.5594, 41.5813], [19.5605, 41.5814], [19.6375, 41.5852], [19.66, 41.5726], [19.66, 41.4562], [19.622, 41.4462], [19.62, 41.3895], [19.6417, 41.3605], [19.6422, 41.3071], [19.5873, 41.244], [19.5175, 41.2602], [19.515, 41.263], [19.4822, 41.3011], [19.4144, 41.3799]],
  KORCE: [[20.6616, 40.167], [20.6614, 40.1664], [20.66, 40.1612], [20.6156, 40.0811], [20.6153, 40.0811], [20.5268, 40.1581], [20.496, 40.2255], [20.5126, 40.2663], [20.482, 40.2728], [20.4617, 40.3245], [20.4702, 40.3677], [20.4426, 40.4397], [20.4337, 40.5067], [20.4184, 40.5314], [20.4224, 40.5896], [20.3823, 40.5958], [20.2932, 40.726], [20.3397, 40.7453], [20.4157, 40.7523], [20.4685, 40.7997], [20.3985, 40.8889], [20.3813, 40.9247], [20.406, 40.9342], [20.4229, 40.9881], [20.5428, 41.0296], [20.5901, 41.0185], [20.5974, 41.0862], [20.5976, 41.0859], [20.6566, 41.0622], [20.6622, 41.0599], [20.702, 40.9367], [20.7026, 40.9366], [20.8113, 40.926], [20.8362, 40.9236], [20.8363, 40.9236], [20.9648, 40.849], [20.9658, 40.8439], [20.9887, 40.7206], [20.9888, 40.7204], [20.9893, 40.7175], [21.0177, 40.5653], [21.0177, 40.5652], [20.9807, 40.5288], [20.9199, 40.4692], [20.9108, 40.4602], [20.9091, 40.4603], [20.828, 40.4643], [20.7704, 40.3632], [20.7396, 40.3092], [20.7365, 40.3035], [20.6994, 40.236], [20.6732, 40.1882], [20.6616, 40.167]],
  GJIROKASTER: [[20.3918, 39.8369], [20.3917, 39.8369], [20.2995, 39.8054], [20.2811, 39.8603], [20.2398, 39.8677], [20.205, 39.9386], [20.1197, 39.9898], [20.0413, 40.0496], [19.9394, 40.0653], [19.8102, 40.2954], [19.7586, 40.3463], [19.7943, 40.3805], [19.7764, 40.423], [19.8249, 40.4719], [19.9049, 40.5273], [19.9371, 40.5119], [20.068, 40.4892], [20.0723, 40.5033], [20.1484, 40.4726], [20.2486, 40.3724], [20.2978, 40.3553], [20.3066, 40.3763], [20.3704, 40.3992], [20.3723, 40.4331], [20.4426, 40.4397], [20.4702, 40.3677], [20.4617, 40.3245], [20.482, 40.2728], [20.5126, 40.2663], [20.496, 40.2255], [20.5268, 40.1581], [20.6153, 40.0811], [20.5063, 40.0712], [20.4611, 40.067], [20.432, 40.0644], [20.3096, 39.9905], [20.31, 39.9897], [20.3918, 39.8369]],
  VLORE: [[19.6894, 40.1223], [19.6032, 40.1595], [19.4871, 40.2096], [19.478, 40.2135], [19.3526, 40.3563], [19.2947, 40.4223], [19.2908, 40.4267], [19.4132, 40.3347], [19.4137, 40.3355], [19.4781, 40.4339], [19.4816, 40.4393], [19.4784, 40.4432], [19.4528, 40.4741], [19.4176, 40.5167], [19.3153, 40.6403], [19.3052, 40.6525], [19.3053, 40.6527], [19.346, 40.6587], [19.4115, 40.6413], [19.4451, 40.6505], [19.4801, 40.6126], [19.5679, 40.5797], [19.5749, 40.5615], [19.6321, 40.554], [19.7111, 40.5261], [19.7401, 40.4855], [19.7393, 40.4302], [19.7764, 40.423], [19.7943, 40.3805], [19.7586, 40.3463], [19.8102, 40.2954], [19.9394, 40.0653], [20.0413, 40.0496], [20.1197, 39.9898], [20.205, 39.9386], [20.2398, 39.8677], [20.2811, 39.8603], [20.2995, 39.8054], [20.2988, 39.8052], [20.2986, 39.8048], [20.2844, 39.7672], [20.255, 39.69], [20.2467, 39.6682], [20.2448, 39.6631], [20.09, 39.6825], [20.0015, 39.6935], [20.0, 39.6937], [20.0137, 39.8387], [20.0144, 39.8456], [19.996, 39.8694], [19.856, 40.0505], [19.7387, 40.1011], [19.6894, 40.1223]],
  FIER: [[19.3766, 40.7953], [19.3975, 40.8371], [19.4122, 40.8666], [19.4132, 40.8685], [19.4141, 40.8689], [19.4272, 40.8739], [19.4888, 40.8978], [19.5068, 40.9047], [19.5066, 40.9051], [19.479, 40.9551], [19.4686, 40.9741], [19.4496, 41.0085], [19.4492, 41.0092], [19.4491, 41.0114], [19.4678, 41.0467], [19.5013, 41.0361], [19.5971, 41.0693], [19.6709, 41.0566], [19.6762, 41.031], [19.7234, 41.0111], [19.8119, 40.9995], [19.8031, 40.9013], [19.8672, 40.8684], [19.8692, 40.8502], [19.8124, 40.8606], [19.7743, 40.8471], [19.7646, 40.8125], [19.7319, 40.812], [19.7608, 40.7552], [19.7562, 40.7166], [19.7952, 40.6976], [19.8322, 40.6361], [19.8085, 40.6202], [19.8489, 40.5686], [19.9049, 40.5273], [19.8249, 40.4719], [19.7764, 40.423], [19.7393, 40.4302], [19.7401, 40.4855], [19.7111, 40.5261], [19.6321, 40.554], [19.5749, 40.5615], [19.5679, 40.5797], [19.4801, 40.6126], [19.4451, 40.6505], [19.4115, 40.6413], [19.346, 40.6587], [19.3053, 40.6527], [19.3057, 40.6535], [19.3628, 40.7677], [19.3766, 40.7953]],
  BERAT: [[20.2219, 40.7157], [20.2932, 40.726], [20.3823, 40.5958], [20.4224, 40.5896], [20.4184, 40.5314], [20.4337, 40.5067], [20.4426, 40.4397], [20.3723, 40.4331], [20.3704, 40.3992], [20.3066, 40.3763], [20.2978, 40.3553], [20.2486, 40.3724], [20.1484, 40.4726], [20.0723, 40.5033], [20.068, 40.4892], [19.9371, 40.5119], [19.9049, 40.5273], [19.8489, 40.5686], [19.8085, 40.6202], [19.8322, 40.6361], [19.7952, 40.6976], [19.7562, 40.7166], [19.7608, 40.7552], [19.7319, 40.812], [19.7646, 40.8125], [19.7743, 40.8471], [19.8124, 40.8606], [19.8692, 40.8502], [19.8672, 40.8684], [20.0166, 40.8737], [20.0131, 40.8285], [20.0686, 40.8112], [20.093, 40.7801], [20.1543, 40.7549], [20.145, 40.7433], [20.2219, 40.7157]],
};

const REUSED = { ZETA: RS_PIECES.ZETA, EPIRUS: RS_PIECES.EPIRUS, THESSALY: RS_PIECES.THESSALY };

function P(ids) {
  return ids.map((id) => {
    const r = AL_PIECES[id] || REUSED[id];
    if (!r) throw new Error(`albania pack: missing piece ${id}`);
    return r;
  });
}

export const AL_STEPS = {};
function build(meta, steps) {
  AL_STEPS[meta.id] = steps;
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
const SCODRA = ['SHKODER_C', 'SHKODER_IN', 'LEZHE_C', 'MIRDITA']; // Shkodër and Lezhë counties
const NORTH = [...SCODRA, 'KUKES', 'DIBER']; // the Serbia pack's N_ALBANIA

// ---- The Illyrian (Ardiaean) kingdom (-250 to -169) --------------------------------------------
const ill = { scodra: ['Scodra, Lissus and the Labeates', SCODRA], zeta: ['Rhizon’s hinterland (Zeta)', ['ZETA']] };
const illyrianKingdom = build({
  id: 'illyrian-kingdom', name: 'Illyrian Kingdom (Ardiaei)', color: '#7C2D12',
  nameAt: [
    [-250, 'Illyrian Kingdom (Agron)'],
    [-231, 'Illyrian Kingdom (Teuta, regent)'],
    [-219, 'Illyrian Kingdom (Scerdilaidas)'],
    [-181, 'Illyrian Kingdom (Gentius)'],
  ],
  description: 'The kingdom the Ardiaei built on the Adriatic in the 3rd century BCE, with its seats at Rhizon (Risan, on the Bay of Kotor) and Scodra (Shkodër). Agron (c. 250–231 BCE) made it a land and sea power and beat the Aetolians at Medion; his widow Teuta, regent for Pinnes, raided Elis, Messenia and Phoenice and besieged Epidamnos and Corcyra, until Rome’s First Illyrian War (229–228 BCE) took Corcyra, Apollonia and Epidamnos under Roman protection and barred her ships south of Lissus. A second war (219 BCE) drove out Demetrius of Pharos. Gentius, king from about 181 BCE, sided with Perseus of Macedon; the praetor Anicius took Scodra in 168 BCE, and Rome split the kingdom into three.',
  timelineItemIds: ['al-illyrian-kingdom'],
  confidence: conf('conjectural', 'The kings, wars and towns are known from Polybius and Livy, but not the borders. The outline is modern Shkodër and Lezhë counties and Montenegro’s Zeta piece (without the Bay of Kotor, so Rhizon itself sits just outside it); the Ardiaean homeland on the Neretva, the coast to Pharos, Teuta’s short-lived conquests and the Dardanian and Taulantian borders are not drawn, and the extent is held from 250 to 169 BCE.'),
  sources: [W('Ardiaei'), W('Agron of Illyria'), W('Teuta'), W('Gentius'), W('Illyro-Roman Wars'), W('Scodra')],
}, [
  [-250, 'Agron, king of the Ardiaei', ill],
  [-231, 'Medion; Teuta regent for Pinnes', ill],
  [-229, 'First Illyrian War', ill],
  [-219, 'Second Illyrian War: Demetrius of Pharos driven out', ill],
  [-181, 'Gentius king at Scodra', ill],
  [-169, 'Gentius sides with Perseus (Scodra falls 168 BCE)', ill],
]);

// ---- Principality of Arbanon (1190–1256) -------------------------------------------------------
const arb = { arbanon: ['Arbanon (Krujë, between the Mat and the Shkumbin)', ['KRUJE', 'TIRANE']] };
const arbanon = build({
  id: 'principality-of-arbanon', name: 'Principality of Arbanon', color: '#B91C1C',
  nameAt: [
    [1190, 'Principality of Arbanon (Progon)'],
    [1204, 'Principality of Arbanon (independent)'],
    [1216, 'Arbanon under Epirus (Gregorios Kamonas)'],
    [1252, 'Arbanon (Golem)'],
  ],
  description: 'The first Albanian state of recorded history: the principality of the Progoni round the fortress of Krujë, founded about 1190 by the archon Progon and held by his sons Gjin and Demetrius. After the Fourth Crusade (1204) it was briefly independent; Demetrius styled himself princeps Arbanorum, married Komnena, daughter of Stefan Nemanjić, and wrote to Pope Innocent III. From about 1216 Michael I of Epirus took Krujë and Arbanon was held by Gregorios Kamonas and then Golem under Epirote, Bulgarian (after Klokotnitsa, 1230) and Nicaean overlords, until George Akropolites annexed it for Nicaea in the winter of 1256–57. In 1272 most of it became part of the Angevin Kingdom of Albania.',
  timelineItemIds: ['al-arbanon'],
  confidence: conf('conjectural', 'The princes are known from a few letters, an inscription and Akropolites, but Arbanon’s borders are not. The outline is the Krujë hinterland of Durrës county and Tirana county (the land between the Mat and the Shkumbin); Durrës, the Mat valley and the highlands are not drawn, and the extent is held from 1190 to 1256 although Arbanon lost its independence about 1216.'),
  sources: [W('Principality of Arbanon'), W('Progon of Kruja'), W('Demetrius Progoni'), W('Golem of Kruja'), W('Krujë')],
}, [
  [1190, 'Progon, archon of Krujë', arb],
  [1198, 'Gjin Progoni', arb],
  [1204, 'Fourth Crusade: Arbanon independent', arb],
  [1208, 'Demetrius, princeps Arbanorum', arb],
  [1216, 'Michael I of Epirus takes Krujë', arb],
  [1230, 'Klokotnitsa: Bulgarian overlordship', arb],
  [1252, 'Golem of Krujë', arb],
  [1256, 'Akropolites annexes Arbanon for Nicaea', arb],
]);

// ---- Angevin Kingdom of Albania (1272–1368) ----------------------------------------------------
const ang1272 = { durazzo: ['Durazzo and Arbanon', ['DURRES_C', 'KRUJE', 'TIRANE']], valona: ['Spinarizza, Vlorë, Kanina and Butrint', ['FIER', 'VLORE']] };
const ang1274 = { durazzo: ['Durazzo and the Krujë region', ['DURRES_C', 'KRUJE']], valona: ['Vlorë and Kanina', ['VLORE']] };
const ang1288 = { valona: ['Kanina and Vlorë (the last forts)', ['VLORE']] };
const angevinAlbania = build({
  id: 'angevin-kingdom-of-albania', name: 'Kingdom of Albania (Angevin)', color: '#1E40AF',
  nameAt: [[1272, 'Kingdom of Albania (Charles of Anjou)']],
  description: 'Charles of Anjou, King of Sicily, was proclaimed King of Albania by the bishops, nobles and citizens of Durrës on 21 February 1272. His Regnum Albaniae ran from Durrës and the Krujë region south along the coast to Vlorë and Butrint. A Byzantine counter-attack took Berat and Butrint in 1274, his army was destroyed at the Siege of Berat (1280–1281), and after the Sicilian Vespers (1282) the Byzantines took Durrës (1288) and Kanina, the last fort, about 1294. Charles II passed his Albanian rights to Philip of Taranto in 1294; Philip won Durrës back in 1304 (the Duchy of Durazzo, drawn separately).',
  timelineItemIds: ['al-angevin'],
  confidence: conf('conjectural', 'The towns and dates are known from Angevin registers, but the hinterland each held is not. The outlines are modern counties: Durrës’s coast with the Krujë hinterland (to 1288) and Tirana (1272–1273), Fier and Vlorë (Spinarizza, Vlorë, Kanina and Butrint); the Angevins’ Corfu is not drawn, and Butrint (retaken for Charles in 1279) stays inside the Vlorë piece throughout.'),
  sources: [W('Kingdom of Albania (medieval)'), W('Charles I of Anjou'), W('Siege of Berat (1280–1281)'), W('Sicilian Vespers')],
}, [
  [1272, 'Charles of Anjou proclaimed King of Albania', ang1272],
  [1274, 'Byzantines take Berat and Butrint', ang1274],
  [1281, 'Siege of Berat: the Angevin army destroyed', ang1274],
  [1288, 'Durrës falls to the Byzantines', ang1288],
  [1294, 'Kanina, the last fort, falls', ang1288],
]);

// ---- Duchy of Durazzo, the Angevin kingdom restored at Durrës (1304–1368) ----------------------
const dur = { durazzo: ['Durazzo (Durrës)', ['DURRES_C']] };
const duchyOfDurazzo = build({
  id: 'duchy-of-durazzo', name: 'Duchy of Durazzo (Angevin Albania)', color: '#3354A8',
  nameAt: [
    [1304, 'Kingdom of Albania (Philip of Taranto)'],
    [1332, 'Duchy of Durazzo (John of Gravina)'],
    [1348, 'Duchy of Durazzo (Joanna)'],
  ],
  description: 'The second Angevin Kingdom of Albania, restricted to Durrës and its district. Philip I of Taranto, who had the Albanian rights from 1294, retook the city in 1304 and made Albanian lords marshals and counts of the kingdom. On his death (1332) Albania and Durazzo passed to John of Gravina as the Duchy of Durazzo, and then to his son Charles and granddaughter Joanna. Ringed by the Thopia between the Mat and the Shkumbin, the Muzaka to the south and, by 1346, Stefan Dušan’s Serbia, which held the rest of Albania, the city fell to Karl Thopia, Prince of Albania, in 1368. The Navarrese and Louis of Évreux held it again briefly (1376–1383).',
  timelineItemIds: ['al-angevin', 'al-principalities'],
  confidence: conf('approximate', 'The city and its rulers are well documented; the district is drawn as the coastal part of Durrës county (west of 19.66°E), roughly the modern Durrës District the sources describe. The 1376–1383 restoration is not drawn.'),
  sources: [W('Duchy of Durazzo'), W('Kingdom of Albania (medieval)'), W('Philip I, Prince of Taranto'), W('Karl Thopia')],
}, [
  [1304, 'Philip of Taranto retakes Durrës', dur],
  [1332, 'John of Gravina, Duke of Durazzo', dur],
  [1346, 'Dušan holds all Albania but Durrës', dur],
  [1368, 'Karl Thopia takes Durrës', dur],
]);

// ---- Venetian Albania (1392–1501) --------------------------------------------------------------
const durazzo = ['Durazzo (Durrës)', ['DURRES_C']];
const alessio = ['Alessio (Lezhë)', ['LEZHE_C']];
const scutari = ['Scutari and Drivasto (Shkodër)', ['SHKODER_C']];
const kruja = ['Croia (Krujë, Venetian garrison)', ['KRUJE']];
const venetianAlbania = build({
  id: 'venetian-albania', name: 'Venetian Albania', color: '#0B6E8A',
  nameAt: [[1392, 'Venetian Albania (Albania Veneta)']],
  description: 'Venice’s towns on the Albanian coast, part of its Stato da Màr: Durrës (Durazzo), handed over by Georg Thopia in 1392, Lezhë (Alessio) in 1393 and Shkodër (Scutari) with Drisht, bought from Đurađ II Balšić in 1396, alongside Ulcinj, Bar and Budva on the Montenegrin coast. The possessions reached rarely more than 20 km inland. The League of Lezhë met in Venetian Alessio in 1444, and after Skanderbeg’s death Venice garrisoned Krujë (1468–1478). Shkodër held through the sieges of 1474 and 1478–1479 but was ceded at the Treaty of Constantinople (January 1479); Durrës fell in August 1501, leaving Venetian Albania to the Bay of Kotor.',
  timelineItemIds: ['al-venetian'],
  confidence: conf('approximate', 'The towns and the years Venice held them are well documented, but their districts are not. Each town is drawn as the coastal part of its modern county (west of 19.70°E for Shkodër, 19.80°E for Lezhë, 19.66°E for Durrës), and Krujë as the Krujë hinterland piece; Ulcinj, Bar, Budva and the Bay of Kotor (Montenegro) are not drawn, nor the Balšić years of Shkodër before 1396 or the short Ottoman hold on Lezhë.'),
  sources: [W('Albania Veneta'), W('Siege of Shkodra (1478)'), W('Treaty of Constantinople (1479)'), W('Durrës'), W('Lezhë'), W('Stato da Màr')],
}, [
  [1392, 'Durazzo handed to Venice', { durazzo }],
  [1393, 'Alessio taken', { durazzo, alessio }],
  [1396, 'Scutari bought from Đurađ II Balšić', { durazzo, alessio, scutari }],
  [1444, 'The League of Lezhë meets in Alessio', { durazzo, alessio, scutari }],
  [1468, 'Krujë garrisoned after Skanderbeg’s death', { durazzo, alessio, scutari, kruja }],
  [1474, 'First Ottoman siege of Scutari', { durazzo, alessio, scutari, kruja }],
  [1478, 'Krujë and Alessio fall', { durazzo, scutari }],
  [1479, 'Treaty of Constantinople: Scutari ceded', { durazzo }],
  [1501, 'Durazzo falls to the Ottomans', { durazzo }],
]);

// ---- League of Lezhë and Skanderbeg’s Albania (1444–1478) -------------------------------------
const lg1444 = { league: ['Kastrioti lands and the League’s lords', ['KRUJE', 'DIBER', 'MIRDITA', 'KUKES', 'TIRANE', 'ELBASAN']] };
const lg1466 = { league: ['Kastrioti lands and the League’s lords', ['KRUJE', 'DIBER', 'MIRDITA', 'KUKES', 'TIRANE']] };
const lg1468 = { league: ['Dukagjini and Kastrioti highlands', ['DIBER', 'MIRDITA', 'KUKES']] };
const leagueOfLezhe = build({
  id: 'league-of-lezhe', name: 'League of Lezhë', color: '#D7263D',
  nameAt: [
    [1444, 'League of Lezhë (Skanderbeg)'],
    [1450, 'Skanderbeg’s Albania'],
    [1468, 'Albanian resistance (Lekë Dukagjini)'],
  ],
  description: 'Gjergj Kastrioti, Skanderbeg, deserted the Ottoman army at Niš in November 1443 and took Krujë. On 2 March 1444 the Albanian lords — the Arianiti, Dukagjini, Muzaka, Thopia, Zaharia, Spani, Balšići and the Crnojevići of Zeta — formed the League of Lezhë in Venetian Alessio with him as commander. He beat the Ottomans at Torvioll (1444), Otonetë (1446) and Albulena (1457), held Krujë through the sieges of 1450, 1466 and 1467, fought Venice in 1447–1448 and allied with Alfonso V of Naples and the Papacy. Mehmed II built Elbasan on the Via Egnatia in 1466. After Skanderbeg died at Lezhë in January 1468, Venice garrisoned Krujë and Lekë Dukagjini fought on in the highlands; Krujë fell in June 1478.',
  timelineItemIds: ['al-skanderbeg'],
  confidence: conf('conjectural', 'Skanderbeg’s campaigns are well known from Barleti and Venetian and Ragusan records, but the League was an alliance of lords whose lands shifted with each war. The outline is modern counties: Krujë, Dibër (Mat and Dibër, the Kastrioti lands), Lezhë’s Mirdita and Kukës (the Dukagjini), Tirana (the Thopia) and Elbasan (the Arianiti, until the 1466 fortress); Berat and the Muzaka lands, Ottoman-held towns inside it and the Zetan allies are not drawn.'),
  sources: [W('League of Lezhë'), W('Skanderbeg'), W('Siege of Krujë (1450)'), W('Battle of Albulena'), W('Lekë Dukagjini'), W("Skanderbeg's rebellion")],
}, [
  [1444, 'League of Lezhë; Torvioll', lg1444],
  [1450, 'First siege of Krujë fails', lg1444],
  [1457, 'Albulena', lg1444],
  [1466, 'Mehmed II builds Elbasan', lg1466],
  [1468, 'Skanderbeg dies; Venice garrisons Krujë', lg1468],
  [1478, 'Krujë falls', lg1468],
]);

// ---- Pashalik of Scutari (Bushati, 1757–1813 here) ---------------------------------------------
const sc1757 = { scutari: ['Sanjak of Scutari (Shkodër and Lezhë)', SCODRA] };
const sc1775 = { scutari: ['Northern Albania', NORTH] };
const sc1785 = { scutari: ['Northern Albania to the Shkumbin', [...NORTH, 'KRUJE', 'DURRES_C', 'TIRANE']] };
const pashalikOfScutari = build({
  id: 'pashalik-of-scutari', name: 'Pashalik of Scutari', color: '#4338CA',
  nameAt: [
    [1757, 'Pashalik of Scutari (Mehmed Bushati)'],
    [1775, 'Pashalik of Scutari (Kara Mahmud Bushati)'],
    [1796, 'Pashalik of Scutari (Ibrahim Bushati)'],
    [1810, 'Pashalik of Scutari (Mustafa Bushati)'],
  ],
  description: 'The semi-independent Ottoman pashalik of the Bushati family at Shkodër (Scutari). Mehmed Bushati made himself pasha in 1757 and stopped paying taxes to the Porte. His son Kara Mahmud Bushati (1775–1796) took northern Albania to the Shkumbin and pushed into Kosovo, beat several Ottoman armies, attacked Montenegro (1785, 1796) and the Venetians, and courted Austria and Russia before pledging loyalty to the sultan; he was killed by the Piperi and Bjelopavlići at the Battle of Krusi in 1796. Ibrahim Bushati (1796–1810) served the Porte against the Serbian uprising. The last pasha, Mustafa Bushati, surrendered Rozafa castle in 1831.',
  timelineItemIds: ['al-pashaliks'],
  confidence: conf('conjectural', 'The pashas and their wars are documented, but the pashalik’s reach rose and fell with each campaign. The outline is modern Albanian counties: Shkodër and Lezhë (1757), with Kukës and Dibër from 1775 and Krujë, Durrës and Tirana at Kara Mahmud’s height (1785–1795); its Kosovo, western Macedonian and Montenegrin lands (Podgorica, Ulcinj, Bar) are not drawn. The pashalik lasted to 1831; this pack stops in 1813.'),
  sources: [W('Pashalik of Scutari'), W('Bushati family'), W('Kara Mahmud Bushati'), W('Battle of Krusi'), W('Mustafa Pasha Bushati')],
}, [
  [1757, 'Mehmed Bushati, pasha of Shkodër', sc1757],
  [1775, 'Kara Mahmud Bushati', sc1775],
  [1785, 'Kara Mahmud at his height; war on Montenegro', sc1785],
  [1796, 'Krusi: Kara Mahmud killed', sc1775],
  [1810, 'Mustafa Bushati', sc1775],
  [1813, 'Bushati Scutari (to 1831)', sc1775],
]);

// ---- Pashalik of Yanina (Ali Pasha, 1787–1813 here) --------------------------------------------
const ya1787 = { thessaly: ['Sanjak of Trikala (Thessaly)', ['THESSALY']] };
const ya1788 = { ...ya1787, epirus: ['Ioannina and Epirus', ['EPIRUS']] };
const ya1789 = { ...ya1788, south: ['Tepelenë, Përmet and Libohovë', ['GJIROKASTER']] };
const ya1809 = { ...ya1788, south: ['Southern Albania with Berat', ['GJIROKASTER', 'BERAT', 'FIER']] };
const ya1810 = { ...ya1788, south: ['Southern Albania with Berat and Vlorë', ['GJIROKASTER', 'BERAT', 'FIER', 'VLORE']] };
const pashalikOfYanina = build({
  id: 'pashalik-of-yanina', name: 'Pashalik of Yanina', color: '#9D174D',
  nameAt: [[1787, 'Pashalik of Yanina (Ali Pasha)']],
  description: 'The near-independent state of Ali Pasha of Tepelenë, nominally an Ottoman pashalik. Ali took the sanjak of Trikala (Thessaly) in 1787 and Ioannina in 1787–1788; between 1789 and 1791 he annexed Konitsa, Libohovë, Përmet and Tepelenë, and he sacked Moscopole (1789) and Himara (1797). He took the Venetian coast towns from the French (1798), crushed Souli (1803), took over the Pashalik of Berat through his sons’ marriages (1809), seized Vlorë (1810) and annexed Gjirokastër and Delvina (1811); his sons governed the Morea and Lepanto. Byron visited him at Tepelenë in 1809. Sultan Mahmud II deposed him in 1820, and he was killed at Ioannina in January 1822.',
  timelineItemIds: ['al-ali-pasha'],
  confidence: conf('approximate', 'The dated gains are well documented (Trikala 1787, Ioannina 1788, the Avlona lands 1789–1791, Berat 1809, Vlorë 1810, Gjirokastër 1811), but the outlines are modern regions: Greek Thessaly and Epirus, and Albania’s Gjirokastër county from 1789 (although Gjirokastër town held out to 1811), Berat and Fier from 1809 and Vlorë from 1810. Souli (taken 1803) and Parga (French, then British) are inside Epirus; Himara, Korçë and Ohrid, western Macedonia, Lepanto and the Morea under his sons are not drawn. The pashalik lasted to 1822; this pack stops in 1813.'),
  sources: [W('Pashalik of Yanina'), W('Ali Pasha of Yanina'), W('Pashalik of Berat'), W('Souliotes'), W('Tepelenë')],
}, [
  [1787, 'Ali Pasha takes the sanjak of Trikala', ya1787],
  [1788, 'Ali seizes Ioannina', ya1788],
  [1789, 'Tepelenë, Përmet and Libohovë annexed', ya1789],
  [1803, 'Souli conquered', ya1789],
  [1809, 'The Pashalik of Berat passes to Muhtar Pasha', ya1809],
  [1810, 'Vlorë seized', ya1810],
  [1811, 'Gjirokastër and Delvina annexed', ya1810],
  [1813, 'Ali Pasha at his height (to 1822)', ya1810],
]);

export const albaniaPolities = [illyrianKingdom, arbanon, angevinAlbania, duchyOfDurazzo, venetianAlbania, leagueOfLezhe, pashalikOfScutari, pashalikOfYanina];

export const albaniaShapeFixes = {
  'roman-republic': ['the -191 keyframe held to -168, so Illyricum appears at Pydna instead of growing over Gentius’s kingdom'],
  'ottoman-empire': ['anatolia-balkans held steps 1757–1813 (split at 1757 and 1787; 1800–1813 held) cut back from the pashaliks of Scutari and Yanina'],
};

// Ottoman 'anatolia-balkans' at the start of each held step after the Croatia fixes: [start year,
// key, end year]. A step split by a pashalik's first year gets an extra keyframe the year before.
export const OTT_AL_PLAN = [[1757, "A1757", 1759, 1740], [1760, "A1760", 1779, 1760], [1780, "A1780", 1786, 1780], [1787, "A1787", 1799, 1780], [1800, "A1800", 1813, 1800]];
const OTT_AL_RINGS = {
  A1757: [[40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36.0], [37.3, 34.5], [26.0, 34.0], [18.0, 34.0], [15.0, 34.0], [15.57, 40.22], [16.0, 40.0], [17.64, 41.08], [18.6, 40.6], [18.9, 39.6], [19.6, 39.0], [20.4, 39.2], [20.38, 39.28], [20.13, 39.53], [20.18, 39.62], [20.0, 39.69], [20.01, 39.85], [19.86, 40.05], [19.48, 40.21], [19.29, 40.43], [19.41, 40.33], [19.48, 40.44], [19.31, 40.65], [19.41, 40.87], [19.51, 40.9], [19.44, 41.14], [19.52, 41.26], [19.4, 41.4], [19.52, 41.55], [19.85, 41.52], [19.89, 41.56], [19.87, 41.64], [20.04, 41.65], [20.19, 41.73], [20.21, 41.82], [20.31, 41.93], [20.3, 42.04], [20.22, 42.09], [20.28, 42.21], [20.04, 42.31], [19.88, 42.28], [19.87, 42.5], [19.79, 42.53], [19.78, 42.63], [19.64, 42.68], [19.24, 42.22], [19.32, 42.09], [19.32, 41.87], [19.17, 41.94], [18.87, 41.95], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.64, 42.94], [17.43, 43.06], [17.5, 43.16], [17.33, 43.33], [17.27, 43.51], [17.11, 43.56], [16.36, 44.12], [16.26, 44.23], [16.25, 44.38], [16.15, 44.56], [15.97, 44.71], [16.0, 45.0], [16.11, 45.06], [16.19, 44.99], [16.35, 44.97], [16.54, 45.17], [16.79, 45.13], [16.93, 45.22], [17.12, 45.12], [17.27, 45.14], [17.57, 45.07], [17.68, 45.11], [17.83, 45.01], [18.02, 45.09], [18.15, 45.05], [18.25, 45.1], [18.47, 45.02], [18.66, 45.03], [18.82, 44.83], [19.03, 44.82], [19.13, 44.9], [19.11, 45.13], [19.4, 45.12], [19.44, 45.18], [19.4, 45.27], [19.04, 45.4], [19.06, 45.52], [18.96, 45.59], [19.02, 45.69], [18.91, 45.82], [18.95, 45.92], [18.93, 45.97], [18.66, 45.96], [18.4, 45.8], [17.87, 45.83], [17.74, 45.87], [22.0, 48.0], [22.82, 48.0], [22.61, 47.87], [22.21, 47.8], [21.91, 47.56], [21.39, 46.76], [21.23, 46.67], [21.19, 46.47], [21.01, 46.33], [20.74, 46.35], [20.62, 46.22], [20.65, 46.09], [21.02, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.05, 46.55], [30.0, 46.87], [29.48, 47.06], [29.16, 47.34], [29.34, 47.87], [29.22, 48.0], [30.0, 48.0], [38.0, 45.0], [45.0, 42.0], [46.2, 38.6], [45.4, 38.2], [43.0, 37.9], [40.5, 37.65]],
  A1760: [[41.53, 37.75], [40.02, 37.59], [38.54, 37.35], [37.8, 36.21], [37.17, 35.05], [35.76, 34.8], [34.27, 34.62], [32.77, 34.46], [31.25, 34.4], [29.74, 34.35], [28.22, 34.3], [26.7, 34.26], [25.18, 34.26], [23.66, 34.26], [22.14, 34.26], [20.63, 34.28], [19.12, 34.36], [17.61, 34.43], [16.96, 35.29], [17.03, 36.74], [17.18, 38.26], [17.33, 39.77], [17.46, 40.95], [17.65, 41.08], [18.6, 40.6], [18.9, 39.6], [19.6, 39.0], [20.4, 39.2], [20.38, 39.28], [20.13, 39.53], [20.18, 39.62], [20.0, 39.69], [20.01, 39.85], [19.86, 40.05], [19.48, 40.21], [19.29, 40.43], [19.41, 40.33], [19.48, 40.44], [19.31, 40.65], [19.41, 40.87], [19.51, 40.9], [19.44, 41.14], [19.52, 41.26], [19.4, 41.4], [19.52, 41.55], [19.81, 41.52], [20.05, 41.34], [20.23, 41.29], [20.42, 41.34], [20.46, 41.28], [20.51, 41.29], [20.59, 41.4], [20.5, 41.52], [20.58, 41.58], [20.55, 41.73], [20.61, 41.87], [20.6, 42.09], [20.51, 42.27], [20.27, 42.36], [20.18, 42.54], [20.07, 42.59], [19.83, 42.52], [19.79, 42.53], [19.78, 42.63], [19.65, 42.68], [19.24, 42.22], [19.32, 42.09], [19.32, 41.87], [19.17, 41.94], [18.87, 41.95], [18.6, 42.35], [18.52, 42.4], [18.54, 42.46], [18.47, 42.59], [17.89, 42.85], [17.83, 42.95], [17.65, 42.94], [17.79, 44.3], [18.78, 44.88], [18.82, 44.83], [19.03, 44.82], [19.13, 44.9], [19.12, 45.07], [19.24, 45.12], [19.4, 45.12], [19.44, 45.18], [19.43, 45.21], [20.41, 45.64], [21.06, 45.92], [21.46, 45.93], [21.67, 45.8], [21.97, 45.87], [22.38, 45.75], [22.35, 45.62], [22.59, 45.44], [22.59, 45.32], [22.38, 44.87], [22.17, 44.89], [21.94, 44.57], [22.19, 44.42], [22.49, 44.6], [22.4, 44.53], [22.42, 44.38], [22.82, 44.07], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.28, 45.13], [28.19, 45.32], [28.54, 45.42], [28.59, 45.63], [28.83, 45.87], [29.03, 45.93], [29.03, 46.38], [29.1, 46.41], [29.19, 46.26], [29.43, 46.38], [29.85, 46.24], [30.12, 46.28], [30.18, 46.37], [30.05, 46.55], [30.01, 46.8], [30.74, 46.78], [32.18, 46.31], [33.62, 45.84], [35.05, 45.33], [36.48, 44.81], [37.91, 44.3], [39.32, 43.75], [40.73, 43.19], [42.14, 42.63], [43.5, 41.98], [44.72, 41.18], [45.36, 39.84], [45.99, 38.5], [44.55, 38.09], [43.04, 37.91], [41.53, 37.75]],
  A1780: [[44.36, 38.07], [43.08, 37.91], [41.81, 37.78], [40.53, 37.65], [39.27, 37.48], [38.26, 37], [37.56, 36.09], [36.56, 35.53], [35.36, 35.15], [34.14, 34.81], [32.86, 34.79], [31.58, 34.77], [30.3, 34.75], [29.01, 34.74], [27.73, 34.74], [26.45, 34.74], [25.16, 34.74], [23.89, 34.81], [22.63, 35.01], [21.37, 35.22], [20.42, 35.71], [20.34, 36.82], [20.5, 38.09], [20.66, 39.36], [20.82, 40.64], [20.98, 41.91], [21.14, 43.18], [22.08, 43.8], [22.8, 44.02], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.19, 44.9], [28.28, 44.89], [29.55, 44.77], [30.83, 44.65], [32.1, 44.52], [33.35, 44.25], [34.59, 43.97], [35.82, 43.59], [37.04, 43.2], [38.26, 42.82], [39.48, 42.42], [40.7, 42.01], [41.91, 41.61], [43, 40.95], [44, 40.2], [44.8, 39.25], [45.61, 38.3], [44.36, 38.07]],
  A1787: [[43.08, 37.91], [41.81, 37.78], [40.53, 37.65], [39.27, 37.48], [38.26, 37.0], [37.56, 36.09], [36.56, 35.53], [35.36, 35.15], [34.14, 34.81], [32.86, 34.79], [31.58, 34.77], [30.3, 34.75], [29.01, 34.74], [27.73, 34.74], [26.45, 34.74], [25.16, 34.74], [23.89, 34.81], [22.63, 35.01], [21.37, 35.22], [20.42, 35.71], [20.34, 36.82], [20.5, 38.09], [20.62, 39.06], [20.65, 39.04], [20.73, 38.9], [20.83, 39.05], [21.01, 38.97], [21.13, 39.04], [21.61, 39.19], [21.69, 39.05], [21.83, 39.08], [21.9, 38.98], [22.14, 39.06], [22.25, 39.18], [22.37, 39.13], [22.49, 38.98], [22.87, 38.91], [23.02, 38.92], [23.12, 39.06], [23.39, 39.16], [23.31, 39.35], [23.13, 39.54], [22.97, 39.63], [22.9, 39.8], [22.75, 39.97], [22.52, 39.98], [22.32, 40.2], [22.07, 40.21], [21.81, 39.96], [21.83, 39.88], [21.47, 39.91], [21.3, 39.86], [21.23, 39.9], [21.11, 39.88], [21.07, 40.04], [20.99, 40.09], [21.01, 40.16], [20.87, 40.37], [20.78, 40.36], [20.82, 40.64], [20.98, 41.91], [21.14, 43.18], [22.08, 43.8], [22.8, 44.02], [22.75, 43.9], [22.81, 43.81], [25.48, 43.57], [25.77, 43.63], [26.33, 43.95], [27.03, 44.07], [27.45, 44.03], [27.99, 44.18], [28.21, 44.44], [28.11, 44.7], [28.19, 44.9], [28.28, 44.89], [29.55, 44.77], [30.83, 44.65], [32.1, 44.52], [33.35, 44.25], [34.59, 43.97], [35.82, 43.59], [37.04, 43.2], [38.26, 42.82], [39.48, 42.42], [40.7, 42.01], [41.91, 41.61], [43.0, 40.95], [44.0, 40.2], [44.8, 39.25], [45.61, 38.3], [44.36, 38.07], [43.08, 37.91]],
  A1800: [[43.0, 37.9], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.6, 36.2], [35.0, 35.0], [26.0, 35.0], [22.0, 36.0], [22.44, 39.05], [22.49, 38.98], [22.87, 38.91], [23.02, 38.92], [23.12, 39.06], [23.39, 39.15], [23.31, 39.35], [23.13, 39.54], [22.97, 39.63], [22.9, 39.8], [22.75, 39.97], [22.57, 39.98], [23.0, 43.0], [28.0, 44.0], [35.0, 43.0], [42.0, 41.0], [45.4, 38.2], [43.0, 37.9]],
};
const OTT_AL_SUM = {"A1757": 93772.36, "A1760": 73208.79, "A1780": 42189.63, "A1787": 42189.63, "A1800": 10508.5};
const checksum = (ring) => ring.reduce((t, [x, y]) => t + x * 7 + y * 13, 0);
const rid = (r) => (typeof r === 'string' ? r : r.id);
const INF = { start: -Infinity, end: Infinity };
const closed = (r) => (r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1] ? r : [...r, r[0]]);
const resolveInline = (r) => (r && typeof r === 'object' && Array.isArray(r.ring) ? ensureClockwise(closed(r.ring)) : null);

/** Hold the Roman Republic's -191 regions to -168 and cut the Ottoman held steps back (run after the Croatia fixes). */
export function applyAlbaniaShapeFixes(entities) {
  const rr = entities.find((e) => e.id === 'roman-republic');
  const o191 = rr?.overlays.find((o) => o.year === -191);
  const o167 = rr?.overlays.find((o) => o.year === -167);
  if (!o191 || !o167 || o191.regions.some((r) => rid(r) === 'illyria') || !o167.regions.some((r) => rid(r) === 'illyria')) throw new Error('albania fixes: roman-republic -191/-167 changed');
  if (!rr.overlays.some((o) => o.year === -168)) rr.overlays = [...rr.overlays, { ...o191, year: -168 }].sort((a, b) => a.year - b.year);

  const ott = entities.find((e) => e.id === 'ottoman-empire');
  if (!ott) throw new Error('albania fixes: no ottoman-empire');
  const at = (y) => ott.overlays.find((o) => o.year === y);
  const swap = (o, y, ring) => ({ ...o, year: y, regions: o.regions.map((r) => (rid(r) === 'anatolia-balkans' ? { ...r, ring } : r)) });
  const add = [];
  OTT_AL_PLAN.forEach(([start, key, end, src], i) => {
    const base = at(src);
    const reg = base?.regions.find((r) => rid(r) === 'anatolia-balkans');
    if (!reg || Math.abs(checksum(reg.ring) - OTT_AL_SUM[key]) > 1e-6) throw new Error(`albania fixes: ottoman anatolia-balkans ${src} changed — regenerate the ${key} trim`);
    const ring = OTT_AL_RINGS[key];
    if (!ring) throw new Error(`albania fixes: no ${key} trim`);
    // A step that starts inside a held step holds the untrimmed ring to the year before, unless the
    // previous plan step already ends there.
    if (start !== src && OTT_AL_PLAN[i - 1]?.[2] !== start - 1) add.push({ ...base, year: start - 1 });
    add.push(swap(base, start, ring));
    if (end !== start) add.push(swap(at(end) || base, end, ring));
    // A step that ends before a long morph (1813 → the 1900 keyframe) gets the morphed ring back the
    // year after, so the late-Ottoman contraction runs on unchanged from 1814.
    if (!at(end + 1) && !OTT_AL_PLAN[i + 1]) {
      const parts = morphEntityAtYear({ ...ott, overlays: ott.overlays.slice() }, end + 1, resolveInline, INF, 20, resolveRegionHoles);
      add.push({ ...base, year: end + 1, label: base.label, regions: parts.map((p) => ({ id: p.regionId, name: p.regionName, ring: p.ring, ...(p.holes.length ? { holes: p.holes } : {}) })) });
    }
  });
  const years = new Set(add.map((o) => o.year));
  ott.overlays = [...ott.overlays.filter((o) => !years.has(o.year)), ...add].sort((a, b) => a.year - b.year);
}
