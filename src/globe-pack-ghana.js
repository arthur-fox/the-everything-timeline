/**
 * Day 66 — Phase 5 country pack 1, globe backfill: Ghana (ROADMAP item 12).
 *
 * Ghana had a sourced timeline (data/countries/ghana.json) but on the globe only a four-keyframe
 * Asante Empire (Day 58, inland Africa) whose southern side washed into the Gulf of Guinea, plus
 * broad presence bands. Nothing showed the Akan states before Asante, the coast or the north.
 * This module draws Ghana's history from Bono to the eve of colonial rule:
 *
 *   Bono · Denkyira · Akwamu · Akyem · Great Accra (Ga) · the Fante states ·
 *   Dagbon · Mamprugu · Gonja · the Asante Empire (redrawn, same id)
 *
 * From 1815 the nations layer takes over (Ashanti, then the British Gold Coast), so no keyframe
 * here is later than 1815. Every shape has dated keyframes, an honest confidence level, sources
 * and links to Ghana's timeline items. Shapes that meet the sea take their south side from a coast
 * traced off the globe's own land (GOLD_COAST below), so they stop at the shore.
 *
 * None of these states had written borders. Their outlines are the towns and districts that oral
 * traditions, Dutch / English / Danish traders and later historians (Wilks, Kea, Daaku, Levtzion)
 * say they ruled or took tribute from, drawn roughly. Shapes live in the lazy globe chunk
 * (docs/DATA.md).
 */
import { ensureClockwise } from './globe-morph.js';

const A = 'simplified';
const R = (id, name, ring) => ({ id, name, ring: ensureClockwise(ring) });
const K = (year, label, regions, extra = {}) => ({ year, label, approximation: A, regions, ...extra });
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_'))}` });
const E = (o) => ({ edgeGrace: 6, ...o });

const UNESCO_FORTS = { title: 'UNESCO World Heritage — Forts and Castles, Volta, Greater Accra, Central and Western Regions', url: 'https://whc.unesco.org/en/list/34/' };
const UNESCO_ASANTE = { title: 'UNESCO World Heritage — Asante Traditional Buildings', url: 'https://whc.unesco.org/en/list/35/' };
const WILKS_1975 = { title: 'Wilks, Asante in the Nineteenth Century (Cambridge, 1975)', url: 'https://en.wikipedia.org/wiki/Ashanti_Empire#Further_reading' };
const KEA_1982 = { title: 'Kea, Settlements, Trade, and Polities in the Seventeenth-Century Gold Coast (Johns Hopkins, 1982)', url: 'https://en.wikipedia.org/wiki/Akwamu#Further_reading' };
const EFFAH_GYAMFI_1985 = { title: 'Effah-Gyamfi, Bono Manso: An Archaeological Investigation into Early Akan Urbanism (1985)', url: 'https://en.wikipedia.org/wiki/Bono_Manso' };
const LEVTZION_1968 = { title: 'Levtzion, Muslims and Chiefs in West Africa: the Middle Volta Basin (Oxford, 1968)', url: 'https://en.wikipedia.org/wiki/Kingdom_of_Dagbon' };

const CONF = {
  forestState: {
    level: 'approximate',
    reason: 'Known from oral traditions and from Dutch, English and Danish traders’ reports on the coast. The capital and core districts are clear; how far its tribute reached, and when, is drawn roughly.',
  },
  bono: {
    level: 'conjectural',
    reason: 'Known from Bono and Asante oral traditions and from excavations at Bono Manso and Begho (radiocarbon dates from about the 13th–14th centuries). No outside writer described it before the 1600s, so the extent is a guess around those sites.',
  },
  coast: {
    level: 'approximate',
    reason: 'The coast towns are well recorded by European traders from the 1470s, but the inland edge of each state is not; drawn as the coastal districts its towns controlled.',
  },
  savanna: {
    level: 'approximate',
    reason: 'Known from the kingdoms’ own drum histories and Arabic chronicles (the Kitab Ghanja), with dates that are argued over. The capitals and chiefdoms are clear; borders between Dagbon, Gonja and Mamprugu were zones, not lines.',
  },
  asante: {
    level: 'approximate',
    reason: 'Unusually well recorded for West Africa: Asante court traditions plus Dutch and British envoys’ reports. The shape is the metropolitan provinces and directly ruled states; tributaries in the north (Gonja, Dagbon) are drawn as their own kingdoms instead.',
  },
};

// ---- The Gulf of Guinea coast ------------------------------------------------------------------
//
// [lng, southernmost-land lat] every 0.1° along Ghana's coast, read off the globe's own simplified
// land (src/data/nations.topo.json, Natural Earth, public domain) and nudged 0.05° inland (north),
// so a shape whose south side is `shore(west, east)` stops at the beach.
const RAW = [
  [-3.0, 5.06], [-2.9, 5.04], [-2.8, 5.03], [-2.7, 5.02], [-2.6, 4.99], [-2.5, 4.96], [-2.4, 4.93], [-2.3, 4.9],
  [-2.2, 4.84], [-2.1, 4.75], [-2.0, 4.78], [-1.9, 4.82], [-1.8, 4.86], [-1.7, 4.92], [-1.6, 5.0], [-1.5, 5.04],
  [-1.4, 5.07], [-1.3, 5.09], [-1.2, 5.12], [-1.1, 5.17], [-1.0, 5.22], [-0.9, 5.22], [-0.8, 5.22], [-0.7, 5.3],
  [-0.6, 5.35], [-0.5, 5.38], [-0.4, 5.47], [-0.3, 5.52], [-0.2, 5.56], [-0.1, 5.59], [0.0, 5.62], [0.1, 5.68],
  [0.2, 5.74], [0.3, 5.78], [0.4, 5.78], [0.5, 5.77], [0.6, 5.77], [0.7, 5.77], [0.8, 5.77], [0.9, 5.78],
  [1.0, 5.85], [1.1, 6.05], [1.2, 6.11], [1.3, 6.14], [1.4, 6.18], [1.5, 6.2], [1.6, 6.22], [1.7, 6.24], [1.8, 6.26],
];
const INLAND = 0.05;
export const GOLD_COAST = RAW.map(([lng, lat]) => [lng, Math.round((lat + INLAND) * 100) / 100]);

function latAt(lng) {
  for (let i = 1; i < GOLD_COAST.length; i++) {
    const [a, la] = GOLD_COAST[i - 1];
    const [b, lb] = GOLD_COAST[i];
    if (lng >= a && lng <= b) return Math.round((la + ((lb - la) * (lng - a)) / (b - a || 1)) * 100) / 100;
  }
  throw new Error(`gold coast: longitude ${lng} is outside the trace`);
}

/** [lng, lat] points along the shore from `west` to `east`, ends interpolated. */
export function shore(west, east) {
  if (!(east > west)) throw new Error(`gold coast: east ${east} must be east of west ${west}`);
  const out = [[west, latAt(west)]];
  for (const [lng, lat] of GOLD_COAST) if (lng > west + 1e-9 && lng < east - 1e-9) out.push([lng, lat]);
  out.push([east, latAt(east)]);
  return out;
}

/** Closed ring: the shore from `west` to `east`, then `inland` ([lng, lat], east → west), closed. */
function coastal(west, east, inland) {
  const c = shore(west, east);
  return [...c, ...inland, c[0]];
}

// ---- Bono (Bonoman), c. 1300–1723 --------------------------------------------------------------

const BONO_EARLY = [[-2.2, 7.45], [-2.15, 7.95], [-1.75, 8.05], [-1.5, 7.8], [-1.6, 7.5], [-1.95, 7.38], [-2.2, 7.45]];
const BONO_PEAK = [[-2.75, 7.5], [-2.7, 8.15], [-2.2, 8.3], [-1.6, 8.25], [-1.25, 7.9], [-1.35, 7.45], [-1.9, 7.3], [-2.5, 7.3], [-2.75, 7.5]];
const BONO_LATE = [[-2.62, 7.58], [-2.58, 8.1], [-2.0, 8.2], [-1.5, 8.1], [-1.35, 7.8], [-1.6, 7.52], [-2.1, 7.47], [-2.62, 7.58]];
const BONO_CORE = [[-2.1, 7.52], [-2.05, 7.95], [-1.7, 8.0], [-1.5, 7.8], [-1.62, 7.55], [-2.1, 7.52]];

const bono = E({
  id: 'bono-state', name: 'Bono (Bonoman)', color: '#CA8A04', type: 'state',
  description: 'One of the first Akan states, on the forest edge around its capital Bono Manso near today’s Techiman. Bono grew rich on forest gold and kola, sold through the market town of Begho to Mande (Wangara) merchants who carried the gold north to Jenne and Timbuktu. Akan traditions remember Bono as where gold weights, the gold-dust trade and kingship began. It declined in the 1600s and was conquered by Asante in 1722–23.',
  keyYears: [1350, 1450, 1600, 1680, 1722],
  overlays: [
    K(1350, 'Bono Manso and the first Bono towns', [R('bono', 'Bono', BONO_EARLY)]),
    K(1450, 'Bono and Begho at the height of the gold trade', [R('bono', 'Bono and Begho', BONO_PEAK)]),
    K(1600, 'Bono and Begho', [R('bono', 'Bono and Begho', BONO_PEAK)]),
    K(1680, 'Bono in decline', [R('bono', 'Bono', BONO_LATE)]),
    K(1722, 'Asante conquers Bono', [R('bono', 'Bono Manso', BONO_CORE)]),
  ],
  edgeGrace: 1,
  timelineItemIds: ['ghana-bono-akan', 'ghana-asante'], confidence: CONF.bono,
  sources: [W('Bonoman'), W('Bono Manso'), W('Begho'), EFFAH_GYAMFI_1985],
});

// ---- Denkyira, c. 1620–1701 ----------------------------------------------------------------------

const DENK_CORE = [[-2.25, 5.9], [-2.2, 6.38], [-1.65, 6.38], [-1.45, 6.1], [-1.7, 5.82], [-2.25, 5.9]];
const DENK_MID = [[-2.6, 5.75], [-2.55, 6.4], [-2.0, 6.6], [-1.45, 6.5], [-1.35, 6.0], [-1.6, 5.6], [-2.2, 5.55], [-2.6, 5.75]];
const DENK_PEAK = [[-3.0, 5.55], [-3.05, 6.35], [-2.6, 6.75], [-1.75, 6.75], [-1.38, 6.45], [-1.35, 5.95], [-1.5, 5.5], [-2.3, 5.38], [-3.0, 5.55]];

const denkyira = E({
  id: 'denkyira', name: 'Denkyira', color: '#9A3412', type: 'state',
  description: 'An Akan kingdom of the south-western forest with its capital at Abankeseso. Rich in gold and armed with Dutch guns, Denkyira made Adanse, Sefwi, Aowin, Wassa, Assin and Twifo its tributaries in the 1600s, and the young Kumasi states paid it tribute too. Osei Tutu’s Asante broke it at the battle of Feyiase in 1701; Denkyira survives today as a traditional state at Dunkwa.',
  keyYears: [1620, 1660, 1695, 1701],
  overlays: [
    K(1620, 'Denkyira around Abankeseso', [R('denkyira', 'Denkyira', DENK_CORE)]),
    K(1660, 'Denkyira conquers Adanse and the Ofin valley', [R('denkyira', 'Denkyira', DENK_MID)]),
    K(1695, 'Denkyira and its tributaries at their height', [R('denkyira', 'Denkyira and tributaries', DENK_PEAK)]),
    K(1701, 'Asante wins at Feyiase', [R('denkyira', 'Denkyira', DENK_CORE)]),
  ],
  edgeGrace: 3,
  timelineItemIds: ['ghana-bono-akan'], confidence: CONF.forestState,
  sources: [W('Denkyira'), W('Battle of Feyiase'), KEA_1982],
});

// ---- Great Accra (the Ga kingdom), c. 1500–1681 --------------------------------------------------

const GA_EARLY = coastal(-0.5, 0.05, [[0.05, 5.72], [-0.2, 5.72], [-0.45, 5.62]]);
const GA_PEAK = coastal(-0.55, 0.25, [[0.25, 5.86], [0.0, 5.75], [-0.3, 5.74], [-0.5, 5.62]]);

const greatAccra = E({
  id: 'great-accra', name: 'Great Accra (Ga kingdom)', color: '#0369A1', type: 'state',
  description: 'The Ga kingdom of the Accra plains, ruled from Ayawaso (Great Accra), a walled town a few miles inland, with its port towns on the shore below. From the 1550s Portuguese, then Dutch, English, Swedish and Danish traders built lodges and forts there (Christiansborg at Osu, James Fort, Ussher Fort). Akwamu conquered Great Accra in 1677–81; the Ga moved to the coast towns that grew into today’s Accra.',
  keyYears: [1500, 1600, 1660, 1677],
  overlays: [
    K(1500, 'Ga towns on the Accra plains', [R('ga', 'Ga', GA_EARLY)]),
    K(1600, 'Great Accra (Ayawaso)', [R('ga', 'Great Accra', GA_PEAK)]),
    K(1660, 'Great Accra and the coast forts', [R('ga', 'Great Accra', GA_PEAK)]),
    K(1677, 'Akwamu attacks Great Accra (taken by 1681)', [R('ga', 'Great Accra', GA_PEAK)]),
  ],
  edgeGrace: 2,
  timelineItemIds: ['ghana-akwamu-akyem', 'ghana-coast-forts'], confidence: CONF.coast,
  sources: [W('Ga-Dangme'), W('Osu Castle'), KEA_1982],
});

// ---- Akwamu, c. 1600–1731 ------------------------------------------------------------------------

const AKW_EARLY = [[-0.55, 5.9], [-0.4, 6.25], [-0.05, 6.2], [0.0, 5.9], [-0.25, 5.8], [-0.55, 5.9]];
const AKW_MID = [[-0.5, 5.82], [-0.38, 6.3], [0.1, 6.35], [0.2, 6.0], [-0.05, 5.8], [-0.5, 5.82]];
const AKW_ACCRA = coastal(-0.5, 0.45, [[0.45, 6.05], [0.2, 6.4], [-0.38, 6.32], [-0.52, 5.85], [-0.55, 5.6]]);
const AKW_PEAK = coastal(-0.6, 1.7, [[1.7, 6.45], [1.2, 6.62], [0.5, 6.72], [0.1, 6.48], [-0.38, 6.32], [-0.52, 5.85], [-0.6, 5.6]]);
const AKW_CORE = [[0.12, 6.1], [0.1, 6.45], [0.45, 6.5], [0.55, 6.2], [0.3, 6.05], [0.12, 6.1]];

const akwamu = E({
  id: 'akwamu', name: 'Akwamu', color: '#7E22CE', type: 'empire',
  description: 'An Akan state that rose in the hills north of Accra and grew rich taxing the trade between the coast and the forest. It conquered Great Accra in 1677–81, briefly seized the Danish castle at Christiansborg (1693), and by about 1710 ruled the coast from Winneba east past the Volta, with tribute reaching Ouidah. Its harsh rule provoked a revolt: Akyem and its allies defeated Akwamu in 1730, and the Akwamu moved across the Volta to Akwamufie, where the kingdom continues.',
  keyYears: [1600, 1660, 1679, 1681, 1710, 1729, 1730],
  overlays: [
    K(1600, 'Akwamu in the hills behind Accra', [R('akwamu', 'Akwamu', AKW_EARLY)]),
    K(1660, 'Akwamu at Nyanaoase', [R('akwamu', 'Akwamu', AKW_MID)]),
    K(1679, 'Akwamu attacks Great Accra', [R('akwamu', 'Akwamu', AKW_MID)]),
    K(1681, 'Akwamu conquers Great Accra', [R('akwamu', 'Akwamu and Accra', AKW_ACCRA)]),
    K(1710, 'Akwamu from Winneba to Little Popo', [R('akwamu', 'Akwamu Empire', AKW_PEAK)]),
    K(1729, 'Akwamu at war with Akyem', [R('akwamu', 'Akwamu Empire', AKW_PEAK)]),
    K(1730, 'Defeated by Akyem; Akwamu moves across the Volta', [R('akwamu', 'Akwamu (Akwamufie)', AKW_CORE)]),
  ],
  edgeGrace: 3,
  timelineItemIds: ['ghana-akwamu-akyem', 'ghana-bono-akan'], confidence: CONF.forestState,
  sources: [W('Akwamu'), W('Akwamufie'), W('Osu Castle'), KEA_1982],
});

// ---- Akyem, c. 1620–1742 -------------------------------------------------------------------------

const AKYEM_EARLY = [[-1.25, 5.9], [-1.2, 6.45], [-0.7, 6.55], [-0.45, 6.3], [-0.6, 5.95], [-0.9, 5.82], [-1.25, 5.9]];
const AKYEM_ACCRA = coastal(-0.5, 0.0, [[0.0, 6.15], [-0.2, 6.5], [-0.7, 6.6], [-1.2, 6.45], [-1.25, 5.9], [-0.95, 5.85], [-0.55, 5.62]]);

const akyem = E({
  id: 'akyem', name: 'Akyem', color: '#15803D', type: 'state',
  description: 'Akan states of the Birim and Pra valleys, around the Atewa hills and the gold diggings of Kyebi, led by Akyem Abuakwa and Akyem Kotoku. In 1730 Akyem and its allies crushed Akwamu and took over its hold on Accra and the coast trade. Asante, competing for the same gold and the same road to the sea, conquered Akyem in 1742.',
  keyYears: [1620, 1700, 1730, 1731, 1741],
  overlays: [
    K(1620, 'Akyem in the Birim valley', [R('akyem', 'Akyem', AKYEM_EARLY)]),
    K(1700, 'Akyem Abuakwa and Kotoku', [R('akyem', 'Akyem', AKYEM_EARLY)]),
    K(1730, 'Akyem and its allies crush Akwamu', [R('akyem', 'Akyem', AKYEM_EARLY)]),
    K(1731, 'Akyem takes Accra and the coast trade', [R('akyem', 'Akyem and Accra', AKYEM_ACCRA)]),
    K(1741, 'Asante conquers Akyem (1742)', [R('akyem', 'Akyem', AKYEM_EARLY)]),
  ],
  edgeGrace: 2,
  timelineItemIds: ['ghana-akwamu-akyem'], confidence: CONF.forestState,
  sources: [W('Akyem'), W('Kibi, Ghana'), KEA_1982],
});

// ---- The Fante states, c. 1600–1815 --------------------------------------------------------------

const FANTE_EARLY = coastal(-1.25, -0.85, [[-0.85, 5.42], [-1.05, 5.55], [-1.25, 5.4]]);
const FANTE_1700 = coastal(-1.35, -0.62, [[-0.62, 5.42], [-0.72, 5.55], [-1.0, 5.68], [-1.3, 5.5]]);
const FANTE_PEAK = coastal(-1.45, -0.62, [[-0.62, 5.42], [-0.72, 5.5], [-1.0, 5.54], [-1.3, 5.5], [-1.45, 5.35]]);
const FANTE_LATE = coastal(-1.3, -0.8, [[-0.8, 5.38], [-1.05, 5.5], [-1.3, 5.38]]);

const fante = E({
  id: 'fante-states', name: 'Fante states', color: '#BE123C', type: 'state',
  description: 'Fante kingdoms and towns of the central coast, led from Mankessim, with ports at Anomabo, Kormantin and Saltpond beside the English, Dutch and Danish forts. In the 1700s the Fante grew into a strong alliance, the middlemen between Asante and European traders, and Anomabo became the busiest slave-trading port on the coast. Asante invaded in 1807, 1811 and 1816; in 1868 the Fante formed a written constitutional confederation, ended by the British Gold Coast Colony in 1874.',
  keyYears: [1620, 1700, 1760, 1807, 1815],
  overlays: [
    K(1620, 'Fante towns around Mankessim', [R('fante', 'Fante', FANTE_EARLY)]),
    K(1700, 'The Fante coalition', [R('fante', 'Fante states', FANTE_1700)]),
    K(1760, 'The Fante alliance; Anomabo the busiest port', [R('fante', 'Fante states', FANTE_PEAK)]),
    K(1807, 'Asante invades the Fante coast', [R('fante', 'Fante states', FANTE_LATE)]),
    K(1815, 'The Fante coast under Asante pressure', [R('fante', 'Fante states', FANTE_LATE)]),
  ],
  timelineItemIds: ['ghana-fante', 'ghana-coast-forts'], confidence: CONF.coast,
  sources: [W('Fante Confederacy'), W('Mankessim'), W('Anomabu'), UNESCO_FORTS],
});

// ---- The northern kingdoms: Dagbon, Mamprugu, Gonja ----------------------------------------------

const DAGBON_EARLY = [[-1.2, 9.3], [-1.1, 9.85], [-0.4, 10.0], [0.1, 9.7], [0.0, 9.25], [-0.6, 9.1], [-1.2, 9.3]];
const DAGBON_PEAK = [[-1.55, 9.25], [-1.5, 9.75], [-1.1, 9.85], [-0.4, 10.12], [0.4, 9.8], [0.35, 9.05], [-0.5, 8.9], [-1.55, 9.25]];
const DAGBON_EAST = [[-1.0, 9.15], [-1.0, 9.95], [-0.4, 10.1], [0.45, 9.8], [0.4, 9.02], [-0.45, 8.88], [-1.0, 9.15]];

const dagbon = E({
  id: 'dagbon', name: 'Dagbon', color: '#B45309', type: 'state',
  description: 'The kingdom of the Dagomba, founded in the 1400s when Naa Gbewaa’s heirs united chiefdoms of the White Volta valley under one king, the Ya Na. It traded horses, cloth and slaves with the Mande and Hausa caravans, and its court drummers kept its history. Gonja pushed it east in the early 1700s and its capital moved to Yendi. Asante defeated it in 1744, after which Dagbon sent yearly tribute to Kumasi; in 1899 Britain and Germany split it between the Gold Coast and Togoland.',
  keyYears: [1450, 1600, 1675, 1712, 1713, 1744, 1815],
  overlays: [
    K(1450, 'Naa Gbewaa’s heirs found Dagbon', [R('dagbon', 'Dagbon', DAGBON_EARLY)]),
    K(1600, 'Dagbon from Daboya to the Oti', [R('dagbon', 'Dagbon', DAGBON_PEAK)]),
    K(1675, 'Dagbon beside the new Gonja kingdom', [R('dagbon', 'Dagbon', DAGBON_PEAK)]),
    K(1712, 'Dagbon', [R('dagbon', 'Dagbon', DAGBON_PEAK)]),
    K(1713, 'Gonja takes Daboya; the capital moves to Yendi', [R('dagbon', 'Dagbon', DAGBON_EAST)]),
    K(1744, 'Dagbon becomes a tributary of Asante', [R('dagbon', 'Dagbon (Asante tributary)', DAGBON_EAST)]),
    K(1815, 'Dagbon', [R('dagbon', 'Dagbon', DAGBON_EAST)]),
  ],
  timelineItemIds: ['ghana-northern-kingdoms'], confidence: CONF.savanna,
  sources: [W('Kingdom of Dagbon'), W('Yendi'), LEVTZION_1968],
});

const MAMP_EARLY = [[-0.9, 10.3], [-0.9, 10.75], [-0.4, 10.85], [0.0, 10.6], [-0.05, 10.3], [-0.45, 10.24], [-0.9, 10.3]];
const MAMP = [[-1.0, 10.27], [-1.05, 10.85], [-0.4, 10.95], [0.1, 10.7], [0.05, 10.3], [-0.4, 10.22], [-1.0, 10.27]];

const mamprugu = E({
  id: 'mamprugu', name: 'Mamprugu', color: '#A16207', type: 'state',
  description: 'The kingdom of the Mamprusi on the Gambaga escarpment, remembered as the senior of the kingdoms descended from Naa Gbewaa, alongside Dagbon and the Mossi states to the north. Its king, the Nayiri, ruled from Gambaga and, from about 1700, Nalerigu, whose old defensive walls still stand. Muslim traders at Gambaga linked it to the Hausa caravan trade.',
  keyYears: [1450, 1700, 1815],
  overlays: [
    K(1450, 'Mamprugu at Gambaga', [R('mamprugu', 'Mamprugu', MAMP_EARLY)]),
    K(1700, 'Nalerigu becomes the capital', [R('mamprugu', 'Mamprugu', MAMP)]),
    K(1815, 'Mamprugu', [R('mamprugu', 'Mamprugu', MAMP)]),
  ],
  timelineItemIds: ['ghana-northern-kingdoms'], confidence: CONF.savanna,
  sources: [W('Mamprusi people'), W('Nalerigu'), W('Gambaga'), LEVTZION_1968],
});

// Same vertex order as GONJA_1675 so the 1600 → 1675 growth morphs cleanly past Dagbon.
const GONJA_EARLY = [
  [-2.6, 9.0], [-2.65, 9.35], [-2.5, 9.7], [-1.8, 10.05], [-1.62, 9.98], [-1.66, 9.9], [-1.7, 9.8], [-1.75, 9.3],
  [-1.85, 9.2], [-1.95, 9.12], [-2.05, 9.04], [-2.2, 9.0], [-2.35, 8.98], [-2.5, 8.98], [-2.6, 9.0],
];
// Gonja is drawn as three touching regions so it can grow without its outline morphing across
// Dagbon: the west (from 1600), the belt south of Dagbon to Salaga (from 1675) and Daboya (1713).
const GONJA_WEST = [
  [-2.75, 8.5], [-2.85, 9.35], [-2.55, 9.9], [-1.75, 10.25], [-1.15, 10.15], [-1.25, 9.93], [-1.6, 9.8], [-1.65, 9.2],
  [-1.65, 8.38], [-2.2, 8.35], [-2.75, 8.5],
];
const GONJA_BELT = [[-1.65, 9.2], [-1.12, 9.0], [-0.6, 8.8], [0.05, 8.82], [0.15, 8.45], [-0.5, 8.3], [-1.65, 8.38], [-1.65, 9.2]];
const GONJA_DABOYA = [[-1.62, 9.2], [-1.6, 9.8], [-1.25, 9.93], [-1.1, 9.6], [-1.12, 9.0], [-1.62, 9.2]];
const GONJA_FULL = (name) => [
  R('gonja', name, GONJA_WEST), R('gonja-belt', 'Gonja (Salaga and the Volta crossing)', GONJA_BELT),
];

const gonja = E({
  id: 'gonja', name: 'Gonja', color: '#9F1239', type: 'state',
  description: 'A kingdom between the Black and White Volta founded by Mande horsemen, the Ngbanya, who crossed the Black Volta after Songhai fell (about 1600). Under Sumaila Ndewura Jakpa (about 1675) they conquered the peoples of the middle Volta and set up a paramount king, the Yagbongwura, at Yagbum. Its markets, above all Salaga, were where the forest’s kola met the northern caravans. Asante made Gonja a tributary in 1751–52.',
  keyYears: [1600, 1665, 1675, 1712, 1713, 1751, 1815],
  overlays: [
    K(1600, 'The Ngbanya cross the Black Volta', [R('gonja', 'Gonja', GONJA_EARLY)]),
    K(1665, 'Gonja around Yagbum and Bole', [R('gonja', 'Gonja', GONJA_EARLY)]),
    K(1675, 'Jakpa founds the Gonja kingdom', GONJA_FULL('Gonja')),
    K(1712, 'Gonja', GONJA_FULL('Gonja')),
    K(1713, 'Gonja takes Daboya from Dagbon', [...GONJA_FULL('Gonja'), R('gonja-daboya', 'Daboya', GONJA_DABOYA)]),
    K(1751, 'Gonja becomes a tributary of Asante', [...GONJA_FULL('Gonja (Asante tributary)'), R('gonja-daboya', 'Daboya', GONJA_DABOYA)]),
    K(1815, 'Gonja and the Salaga kola market', [...GONJA_FULL('Gonja'), R('gonja-daboya', 'Daboya', GONJA_DABOYA)]),
  ],
  timelineItemIds: ['ghana-northern-kingdoms'], confidence: CONF.savanna,
  sources: [W('Gonja (kingdom)'), W('Salaga'), W('Yagbum'), LEVTZION_1968],
});

// ---- The Asante Empire, 1701–1815 (redrawn; replaces the Day 58 shape, same id) ------------------

const ASANTE_1701 = [[-2.05, 6.45], [-2.0, 7.2], [-1.5, 7.4], [-0.95, 7.25], [-0.95, 6.75], [-1.4, 6.45], [-2.05, 6.45]];
/** 1722: Denkyira's old lands, but not yet Bono (whose 1680–1722 outlines it stays clear of). */
const ASANTE_1722 = [
  [-3.0, 5.75], [-3.05, 6.6], [-2.8, 7.45], [-2.1, 7.36], [-1.6, 7.4], [-1.25, 7.5], [-1.1, 7.8], [-0.75, 7.1],
  [-0.8, 6.75], [-1.35, 6.55], [-1.4, 5.95], [-1.8, 5.6], [-2.5, 5.5], [-3.0, 5.75],
];
const ASANTE_1723 = [
  [-3.0, 5.75], [-3.05, 6.6], [-2.7, 7.6], [-2.55, 8.1], [-1.6, 8.2], [-1.1, 7.8], [-0.75, 7.1], [-0.8, 6.75],
  [-1.35, 6.55], [-1.4, 5.95], [-1.8, 5.6], [-2.5, 5.5], [-3.0, 5.75],
];
const ASANTE_1750 = coastal(-0.5, 0.0, [
  [0.0, 6.3], [-0.05, 6.6], [-0.4, 7.4], [-0.9, 7.95], [-1.6, 8.2], [-2.55, 8.1], [-2.7, 7.6], [-3.05, 6.6],
  [-3.0, 5.75], [-2.5, 5.5], [-1.8, 5.6], [-1.42, 5.85], [-1.0, 5.82], [-0.58, 5.66],
]);
const ASANTE_1807 = coastal(-0.5, 0.0, [
  [0.0, 6.3], [-0.05, 6.6], [-0.4, 7.4], [-0.9, 7.95], [-1.6, 8.2], [-2.55, 8.1], [-2.7, 7.6], [-3.1, 6.6],
  [-3.05, 5.6], [-2.3, 5.3], [-1.6, 5.42], [-1.45, 5.72], [-1.0, 5.82], [-0.58, 5.66],
]);

const asante = {
  id: 'asante-empire', name: 'Asante Empire', color: '#D97706', type: 'empire',
  description: 'Osei Tutu and the priest Okomfo Anokye united the Akan states around Kumasi about 1701 under the Golden Stool, then broke Denkyira at Feyiase. Asante went on to conquer Bono (1723), Akyem and the Accra coast (1742), and made Dagbon (1744) and Gonja (1751) pay tribute, so the gold and kola trades ran through Kumasi. Its armies reached the Fante coast in 1807. From 1815 the nations layer shows it; Britain burned Kumasi in 1874 and annexed Asante in 1901.',
  keyYears: [1701, 1722, 1723, 1742, 1750, 1807, 1815],
  overlays: [
    K(1701, 'Osei Tutu, the Golden Stool and Feyiase', [R('asante', 'Kumasi and the Akan union', ASANTE_1701)]),
    K(1722, 'Asante rules Denkyira’s old lands', [R('asante', 'Asante Empire', ASANTE_1722)]),
    K(1723, 'Asante conquers Bono', [R('asante', 'Asante Empire', ASANTE_1723)]),
    K(1742, 'Opoku Ware conquers Akyem', [R('asante', 'Asante Empire', ASANTE_1723)]),
    K(1750, 'Asante to the Accra coast', [R('asante', 'Asante Empire', ASANTE_1750)]),
    K(1807, 'Asante armies reach the Fante coast', [R('asante', 'Asante Empire', ASANTE_1807)]),
    K(1815, 'Asante Empire', [R('asante', 'Asante Empire', ASANTE_1807)]),
  ],
  timelineItemIds: ['asante-empire', 'ghana-asante'], confidence: CONF.asante,
  sources: [W('Ashanti Empire'), W('Osei Tutu'), W('Golden Stool'), W('Opoku Ware I'), UNESCO_ASANTE, WILKS_1975],
  edgeGrace: 4,
};

export const ghanaPolities = [bono, denkyira, greatAccra, akwamu, akyem, fante, dagbon, mamprugu, gonja, asante];

// ---- Fixes to existing shapes over Ghana ---------------------------------------------------------
//
// The old Asante is replaced by id above. The broad West African presence bands (Day 36) ran their
// southern edge straight across the Gulf of Guinea, so off Ghana they shaded the sea. Their edge now
// follows Ghana's shore between 3°W and 1.8°E (the coasts east and west of that wait for their own
// packs): `[west end, east end]` of the straight edge being replaced, by entity → year → region.
const SHORE_EW = () => shore(-3.0, 1.8).slice().reverse(); // east → west

/** Replace the straight sea-crossing edge `a → b` of a ring with a → Ghana's shore → b. */
function hugGhanaShore(ring, a, b) {
  const i = ring.findIndex((p, k) => k < ring.length - 1 && p[0] === a[0] && p[1] === a[1] && ring[k + 1][0] === b[0] && ring[k + 1][1] === b[1]);
  if (i < 0) throw new Error(`ghana fixes: edge ${a} → ${b} not found`);
  return [...ring.slice(0, i + 1), ...SHORE_EW(), ...ring.slice(i + 1)];
}

export const ghanaShapeFixes = {
  'west-africa-sahel-presence': { 1400: { 'wa-savanna': [[7, 6], [-4, 4]] }, 1700: { 'wa-savanna': [[7, 6], [-4, 4]] } },
  'global-modern-presence': {
    1700: { 'gm-w-africa': [[5, 5], [-4, 3]] },
    1850: { 'gm-w-africa': [[7, 5], [-4, 3]] },
    1900: { 'gm-w-africa': [[5, 4.5], [-1, 4.8], [-8, 4.3]] },
    2025: { 'gm-w-africa': [[5, 4.5], [-1, 4.8], [-8, 4.3]] },
  },
};

/** Apply `ghanaShapeFixes` (runs after people / presence are appended; throws if a target is missing). */
export function applyGhanaShapeFixes(entities) {
  for (const [id, years] of Object.entries(ghanaShapeFixes)) {
    const ent = entities.find((e) => e.id === id);
    if (!ent) throw new Error(`ghana fixes: no entity ${id}`);
    for (const [year, regions] of Object.entries(years)) {
      const kf = ent.overlays.find((o) => o.year === Number(year));
      if (!kf) throw new Error(`ghana fixes: ${id} has no ${year} keyframe`);
      for (const [rid, edge] of Object.entries(regions)) {
        const i = kf.regions.findIndex((r) => typeof r !== 'string' && r.id === rid);
        if (i < 0) throw new Error(`ghana fixes: ${id} ${year} has no inline region ${rid}`);
        let ring = kf.regions[i].ring;
        // Keyframes can share one regions list; skip a ring that already follows the shore.
        const sh = SHORE_EW()[0];
        if (ring.some((p) => p[0] === sh[0] && p[1] === sh[1])) continue;
        // A three-point edge drops its middle vertex (it sat in the sea) before hugging the shore.
        if (edge.length === 3) {
          const j = ring.findIndex((p) => p[0] === edge[1][0] && p[1] === edge[1][1]);
          if (j < 0) throw new Error(`ghana fixes: ${id} ${year} ${rid} has no vertex ${edge[1]}`);
          ring = ring.filter((_, k) => k !== j);
        }
        kf.regions[i] = { ...kf.regions[i], ring: hugGhanaShore(ring, edge[0], edge[edge.length - 1]) };
        delete kf.regions[i].bbox;
      }
    }
  }
}
