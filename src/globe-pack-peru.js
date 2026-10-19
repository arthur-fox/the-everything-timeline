/**
 * Day 65 — Phase 5 country pack 1, globe backfill: Peru (ROADMAP item 12).
 *
 * Peru had a sourced timeline (data/countries/peru.json, Day 33) but on the globe only a schematic
 * Inca Empire, broad Andean peoples / presence bands and a rough Spanish "Andes" fragment, several of
 * them washing over the Pacific. This module draws Peru's history from Caral to the Viceroyalty:
 *
 *   Norte Chico · Chavín · Paracas · Nazca · Moche · Wari · Sicán · Chimú · Chachapoyas · Chincha ·
 *   Ychsma · Chanka · Kingdom of Cusco · Colla · Lupaca · the Inca Empire (redrawn) · Neo-Inca State
 *
 * Every shape has dated keyframes, an honest confidence level with a reason, sources and links to
 * Peru's timeline items. Coastal shapes take their west side from the shared coast trace
 * (globe-andes-coast.js), so they stop at the shore. `applyPeruShapeFixes()` redraws the existing
 * Spanish / colonial / Andean shapes over Peru the same way (see the end of this file).
 *
 * Before about 1450 nobody in the Andes wrote; "states" here are archaeological cultures known from
 * sites, pottery and art styles, plus — for the last century before the Inca — Spanish chroniclers'
 * accounts. Their outlines are the valleys and highlands where their sites are found, drawn roughly.
 * Shapes live in the lazy globe chunk (docs/DATA.md).
 */
import { coastal, coastBetween } from './globe-andes-coast.js';

const A = 'simplified';
const R = (id, name, ring) => ({ id, name, ring });
const K = (year, label, regions, extra = {}) => ({ year, label, approximation: A, regions, ...extra });
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_'))}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}/` });
const E = (o) => ({ edgeGrace: 10, ...o });

const SHADY_2001 = { title: 'Shady Solís, Haas & Creamer, “Dating Caral, a preceramic site in the Supe Valley”, Science 292 (2001)', url: 'https://doi.org/10.1126/science.1059519' };
const SHIMADA_1982 = { title: 'Shimada et al., “Batán Grande: a prehistoric metallurgical center in Peru”, Science 216 (1982)', url: 'https://doi.org/10.1126/science.216.4549.952' };
const MOORE_MACKEY_2008 = { title: 'Moore & Mackey, “The Chimú Empire”, Handbook of South American Archaeology (2008)', url: 'https://doi.org/10.1007/978-0-387-74907-5_39' };
const ROWE_1945 = { title: 'Rowe, “Absolute chronology in the Andean area”, American Antiquity 10 (1945)', url: 'https://doi.org/10.2307/275130' };
const MARSH_2017 = { title: 'Marsh et al., “Dating the expansion of the Inca Empire: Bayesian models from Ecuador and Argentina”, Radiocarbon 59 (2017)', url: 'https://doi.org/10.1017/RDC.2016.118' };

const CONF = {
  preceramic: {
    level: 'approximate',
    reason: 'Known from radiocarbon-dated monumental sites (Caral, Áspero and some 30 more) in four small coastal valleys; the shape is those valleys, which are well surveyed.',
  },
  horizon: {
    level: 'conjectural',
    reason: 'Chavín was a religious art style and pilgrimage centre, not a state. The wide shape is where its style and imports turn up (Kuntur Wasi, Pacopampa, Garagay, Karwa), and its dates are argued over.',
  },
  culture: {
    level: 'approximate',
    reason: 'An archaeological culture: drawn as the valleys where its sites, cemeteries and pottery are found. Whether it was one state, several, or a shared style is debated.',
  },
  wari: {
    level: 'conjectural',
    reason: 'Wari ruled through planned provincial centres (Pikillacta, Viracochapampa, Cerro Baúl) and roads, not a continuous territory. The shape joins those centres; how much of the land between them Wari controlled is unknown.',
  },
  chronicle: {
    level: 'approximate',
    reason: 'Known from archaeology plus Spanish chroniclers who recorded Inca and local oral history in the 16th century. Core valleys are clear; borders and dates are rough.',
  },
  inca: {
    level: 'approximate',
    reason: 'Dates follow Rowe’s 1945 chronology from the chroniclers (Pachacuti 1438, Topa Inca 1471, Huayna Capac 1493). Radiocarbon dates now suggest the expansion began decades earlier (Marsh et al. 2017). Borders follow Inca roads, forts and administrative centres; the eastern forest edge is rough.',
  },
};

// ---- Shared lines ([lng, lat]) ------------------------------------------------------------

/** Eastern edge of the Andes in Peru, where the cloud forest drops to the Amazon (south → north). */
const EAST_PERU = [
  [-69.4, -14.5], [-70.4, -13.8], [-71.3, -13.1], [-72.4, -12.8], [-73.6, -12.4], [-74.6, -11.9], [-75.4, -10.9],
  [-76.1, -9.6], [-76.8, -8.3], [-77.2, -7.0], [-77.6, -6.0], [-78.4, -5.0],
];
/** Peru's southern line, coast (Tacna) → Lake Titicaca → north of the lake (west → east). */
const SOUTH_LINE = [[-69.95, -17.6], [-69.5, -17.0], [-69.05, -16.5], [-69.35, -15.8], [-69.25, -15.1], [-69.4, -14.5]];
/** Peru's northern line, west → east, from the coast south of Tumbes to the Andes' edge. */
const NORTH_LINE = [[-80.1, -3.6], [-79.6, -4.4], [-79.0, -4.9], [-78.4, -5.0]];
/** Highland Ecuador's eastern edge (south → north). */
const EAST_ECUADOR = [[-78.6, -4.2], [-78.5, -3.3], [-78.1, -2.0], [-77.8, -0.8]];
/** The Andes' eastern edge from Lake Titicaca south through Bolivia and north-west Argentina (north → south). */
const EAST_SOUTH = [
  [-68.8, -15.2], [-67.8, -16.0], [-66.5, -16.6], [-65.0, -17.2], [-63.9, -18.2], [-63.8, -19.5], [-64.2, -21.0],
  [-64.6, -22.5], [-65.0, -24.0], [-65.1, -25.5], [-65.4, -27.0], [-66.3, -28.5], [-67.3, -30.0], [-68.2, -31.5],
  [-68.6, -32.9], [-69.6, -34.0], [-70.4, -35.3],
];
const rev = (pts) => pts.slice().reverse();

// ---- Norte Chico (Caral–Supe), c. 3000–1800 BCE -----------------------------------------------

const NC_EARLY = coastal(-10.6, -11.0, [[-77.4, -11.0], [-77.35, -10.6]]);
const NC_PEAK = coastal(-10.4, -11.25, [[-77.25, -11.25], [-77.15, -10.95], [-77.2, -10.6], [-77.45, -10.4]]);

const norteChico = E({
  id: 'norte-chico', name: 'Norte Chico (Caral–Supe)', color: '#D97706', type: 'civilization',
  description: 'The oldest known civilisation in the Americas. From about 3000 BCE the people of four small valleys on Peru’s north-central coast — Huaura, Supe, Pativilca and Fortaleza — built platform mounds and sunken circular plazas at some 30 sites, Caral the largest. They fished, grew cotton and squash by irrigation, and built on this scale before pottery or maize farming. The centres were abandoned by about 1800 BCE.',
  keyYears: [-2900, -2600, -2000, -1850],
  overlays: [
    K(-2900, 'Áspero and the first Supe valley mounds', [R('supe', 'Supe valley and Áspero', NC_EARLY)]),
    K(-2600, 'Caral at its height', [R('supe', 'Huaura, Supe, Pativilca and Fortaleza valleys', NC_PEAK)]),
    K(-2000, 'Norte Chico valleys', [R('supe', 'Huaura, Supe, Pativilca and Fortaleza valleys', NC_PEAK)]),
    K(-1850, 'The centres are abandoned', [R('supe', 'Supe valley', NC_EARLY)]),
  ],
  timelineItemIds: ['peru-caral-norte-chico'], confidence: CONF.preceramic,
  sources: [W('Norte Chico civilization'), UNESCO('Sacred City of Caral-Supe', 1269), SHADY_2001],
});

// ---- Chavín, c. 900–200 BCE -----------------------------------------------------------------

const CHAVIN_CORE = [[-77.5, -9.3], [-77.0, -9.2], [-76.85, -9.6], [-77.05, -9.95], [-77.45, -9.9], [-77.5, -9.3]];
const CHAVIN_SPREAD = [
  [-78.3, -7.6], [-77.6, -7.7], [-77.0, -8.6], [-76.5, -9.6], [-76.6, -10.4], [-77.1, -10.6], [-77.7, -10.0],
  [-78.1, -9.0], [-78.5, -8.2], [-78.3, -7.6],
];
const CHAVIN_HORIZON = coastal(-6.85, -12.2, [
  [-76.7, -12.2], [-75.7, -12.6], [-74.9, -12.9], [-74.7, -12.4], [-75.8, -10.8], [-76.5, -9.3], [-77.2, -7.8],
  [-78.2, -6.3], [-79.1, -6.1], [-79.6, -6.55],
]);

const chavin = E({
  id: 'chavin', name: 'Chavín', color: '#A16207', type: 'civilization',
  description: 'A religious tradition centred on the temple of Chavín de Huántar, high in the Mosna valley, with its stone galleries and the carved Lanzón. At its height (about 500–250 BCE) its jaguar, serpent and fanged-deity art spread across the northern and central highlands and much of the coast, from Kuntur Wasi and Pacopampa in the north to Garagay near Lima and Karwa near Paracas. The shape is that sphere of influence, not a kingdom.',
  keyYears: [-850, -600, -400, -250],
  overlays: [
    K(-850, 'The temple at Chavín de Huántar', [R('chavin', 'Mosna and Puchka valleys', CHAVIN_CORE)]),
    K(-600, 'Chavín draws the north-central highlands', [R('chavin', 'North-central highlands', CHAVIN_SPREAD)]),
    K(-400, 'The Chavín horizon at its widest', [R('chavin', 'Chavín sphere of influence', CHAVIN_HORIZON)]),
    K(-250, 'Chavín de Huántar declines', [R('chavin', 'Mosna and Puchka valleys', CHAVIN_CORE)]),
  ],
  timelineItemIds: ['peru-chavin'], confidence: CONF.horizon,
  sources: [W('Chavín culture'), UNESCO('Chavin (Archaeological Site)', 330), W('Early Horizon')],
});

// ---- Paracas, c. 800–100 BCE ------------------------------------------------------------------

const PARACAS_EARLY = coastal(-13.55, -14.35, [[-75.6, -14.35], [-75.75, -13.9], [-75.95, -13.55]]);
const PARACAS_PEAK = coastal(-13.15, -14.95, [[-75.1, -14.95], [-75.3, -14.4], [-75.6, -13.7], [-75.95, -13.15]]);
const PARACAS_LATE = coastal(-13.6, -14.6, [[-75.25, -14.6], [-75.55, -14.1], [-75.9, -13.6]]);

const paracas = E({
  id: 'paracas', name: 'Paracas', color: '#B91C1C', type: 'civilization',
  description: 'A south-coast culture of the Ica, Pisco and Chincha valleys and the Paracas peninsula, famous for the hundreds of mummy bundles wrapped in brilliantly embroidered textiles that Julio C. Tello excavated in the 1920s. Its late phase shades into the Nazca culture that followed.',
  nameAt: [[-800, 'Paracas'], [-300, 'Paracas (Necrópolis)']],
  keyYears: [-750, -400, -120],
  overlays: [
    K(-750, 'Paracas Cavernas', [R('paracas', 'Ica valley and Paracas peninsula', PARACAS_EARLY)]),
    K(-400, 'Paracas at its height', [R('paracas', 'Chincha, Pisco and Ica valleys', PARACAS_PEAK)]),
    K(-120, 'Paracas Necrópolis', [R('paracas', 'Paracas peninsula and Ica valley', PARACAS_LATE)]),
  ],
  timelineItemIds: ['peru-paracas'], confidence: CONF.culture,
  sources: [W('Paracas culture'), W('Paracas Peninsula')],
  edgeGrace: 20,
});

// ---- Nazca, c. 100 BCE–750 CE -----------------------------------------------------------------

const NAZCA_EARLY = coastal(-14.45, -15.25, [[-74.75, -15.25], [-74.8, -14.65], [-75.05, -14.45]]);
const NAZCA_PEAK = coastal(-13.95, -15.6, [[-74.45, -15.6], [-74.55, -15.0], [-74.7, -14.5], [-75.35, -14.0], [-75.6, -13.95]]);
const NAZCA_LATE = coastal(-14.3, -15.45, [[-74.6, -15.45], [-74.65, -14.8], [-74.9, -14.35]]);

const nazca = E({
  id: 'nazca', name: 'Nazca', color: '#E11D48', type: 'civilization',
  description: 'The south-coast culture of the Río Grande de Nazca and Ica drainages, which drew the Nazca Lines — giant lines and figures scraped into the desert — and made fine polychrome pottery. Its ceremonial centre was Cahuachi; underground aqueducts (puquios) still carry water. After about 550 the region declined and fell under Wari influence.',
  keyYears: [-80, 300, 550, 720],
  overlays: [
    K(-80, 'Early Nazca at Cahuachi', [R('nazca', 'Río Grande de Nazca drainage', NAZCA_EARLY)]),
    K(300, 'Nazca at its height', [R('nazca', 'Nazca and Ica valleys', NAZCA_PEAK)]),
    K(550, 'Late Nazca', [R('nazca', 'Río Grande de Nazca drainage', NAZCA_LATE)]),
    K(720, 'Under Wari influence', [R('nazca', 'Río Grande de Nazca drainage', NAZCA_LATE)]),
  ],
  timelineItemIds: ['peru-nazca-moche'], confidence: CONF.culture,
  sources: [W('Nazca culture'), UNESCO('Lines and Geoglyphs of Nasca and Palpa', 700), W('Cahuachi')],
  edgeGrace: 20,
});

// ---- Moche, c. 100–800 CE ---------------------------------------------------------------------

const MOCHE_N_EARLY = coastal(-6.6, -7.5, [[-79.25, -7.5], [-79.3, -7.0], [-79.5, -6.6]]);
const MOCHE_S_EARLY = coastal(-7.6, -8.45, [[-78.7, -8.45], [-78.85, -8.0], [-79.15, -7.6]]);
const MOCHE_N_PEAK = coastal(-6.3, -7.55, [[-79.2, -7.55], [-79.25, -7.0], [-79.4, -6.6], [-79.6, -6.3]]);
const MOCHE_S_PEAK = coastal(-7.6, -10.1, [[-77.85, -10.1], [-78.0, -9.4], [-78.3, -8.8], [-78.55, -8.3], [-78.85, -7.9], [-79.15, -7.6]]);
const MOCHE_S_LATE = coastal(-7.6, -8.7, [[-78.6, -8.7], [-78.6, -8.3], [-78.85, -7.9], [-79.15, -7.6]]);

const moche = E({
  id: 'moche', name: 'Moche', color: '#C2410C', type: 'civilization',
  description: 'The Moche (Mochica) farmed the irrigated valleys of Peru’s north coast and built huge adobe pyramids — the Huacas del Sol y de la Luna — and the richest tombs of the ancient Americas, like the Lord of Sipán’s (found 1987). Archaeologists now see two spheres: northern Moche lords in the Lambayeque and Jequetepeque valleys, and a southern Moche state that pushed south to Huarmey. Severe floods and droughts in the 6th century weakened the south; northern centres like San José de Moro lasted to about 800.',
  keyYears: [150, 450, 650, 760],
  overlays: [
    K(150, 'Moche valley lords', [
      R('north', 'Northern Moche (Lambayeque, Jequetepeque)', MOCHE_N_EARLY), R('south', 'Southern Moche (Chicama, Moche)', MOCHE_S_EARLY),
    ]),
    K(450, 'Moche at its height', [
      R('north', 'Northern Moche (Lambayeque, Jequetepeque)', MOCHE_N_PEAK), R('south', 'Southern Moche (Chicama to Huarmey)', MOCHE_S_PEAK),
    ]),
    K(650, 'After the 6th-century floods and droughts', [
      R('north', 'Northern Moche (Lambayeque, Jequetepeque)', MOCHE_N_PEAK), R('south', 'Southern Moche (Chicama, Moche)', MOCHE_S_LATE),
    ]),
    K(760, 'Late Moche at San José de Moro', [R('north', 'Northern Moche (Jequetepeque)', MOCHE_N_PEAK)]),
  ],
  timelineItemIds: ['peru-nazca-moche'], confidence: CONF.culture,
  sources: [W('Moche culture'), W('Huacas del Sol y de la Luna'), W('Lord of Sipán')],
});

// ---- Wari, c. 600–1000 CE ---------------------------------------------------------------------

const WARI_CORE = [[-74.6, -12.7], [-73.9, -12.6], [-73.7, -13.1], [-74.0, -13.6], [-74.5, -13.5], [-74.8, -13.1], [-74.6, -12.7]];
const WARI_PEAK = [
  [-78.4, -7.5], [-77.7, -7.4], [-77.0, -8.8], [-76.0, -10.5], [-75.0, -11.7], [-73.6, -12.4], [-72.2, -13.0], [-71.4, -13.4],
  [-71.5, -13.9], [-72.5, -14.0], [-73.6, -14.0], [-74.5, -13.9], [-75.5, -12.9], [-76.4, -11.5], [-77.3, -10.0], [-78.0, -8.8],
  [-78.5, -8.0], [-78.4, -7.5],
];
const WARI_MOQUEGUA = [[-71.05, -16.95], [-70.7, -16.95], [-70.65, -17.25], [-70.95, -17.3], [-71.05, -16.95]];

const wari = E({
  id: 'wari-empire', name: 'Wari', color: '#7C3AED', type: 'empire',
  description: 'The first Andean empire, ruled from the city of Huari near today’s Ayacucho. From about 600 Wari built planned administrative centres along the highlands — Pikillacta near Cusco, Viracochapampa in the north, Cerro Baúl far south in Moquegua — linked by roads the Inca later reused. A royal tomb found at Castillo de Huarmey in 2012 shows its reach to the coast. Wari collapsed around 1000, perhaps in a long drought.',
  keyYears: [600, 750, 850, 1000],
  overlays: [
    K(600, 'Wari rises at Huari', [R('wari', 'Ayacucho basin', WARI_CORE)]),
    K(750, 'Wari builds its provincial centres', [R('wari', 'Wari highlands (Viracochapampa to Pikillacta)', WARI_PEAK)]),
    K(850, 'Wari at its height', [R('wari', 'Wari highlands (Viracochapampa to Pikillacta)', WARI_PEAK), R('moquegua', 'Cerro Baúl (Moquegua)', WARI_MOQUEGUA)]),
    K(1000, 'Wari collapses', [R('wari', 'Ayacucho basin', WARI_CORE)]),
  ],
  timelineItemIds: ['peru-wari-chimu'], confidence: CONF.wari,
  sources: [W('Wari culture'), W('Middle Horizon'), W('Pikillaqta'), W('Viracochapampa')],
  edgeGrace: 20,
});

// ---- Sicán (Lambayeque), c. 750–1375 ----------------------------------------------------------

const SICAN_CORE = coastal(-6.3, -7.0, [[-79.4, -7.0], [-79.45, -6.6], [-79.6, -6.3]]);
const SICAN_PEAK = coastal(-5.2, -7.5, [[-79.2, -7.5], [-79.25, -7.0], [-79.4, -6.5], [-79.75, -5.9], [-80.25, -5.2]]);

const sican = E({
  id: 'sican', name: 'Sicán (Lambayeque)', color: '#0891B2', type: 'state',
  description: 'The Sicán or Lambayeque culture of Peru’s far-north coast, remembered in the legend of Naylamp who came by sea. Its Middle Sicán lords (about 900–1100) built the adobe temples of Batán Grande and were the great metalworkers of the Andes, smelting arsenical bronze on an industrial scale. After drought and floods the temples were burned around 1100 and the centre moved to Túcume. Chimor conquered it around 1375.',
  keyYears: [800, 1000, 1150, 1360],
  overlays: [
    K(800, 'Early Sicán', [R('sican', 'Lambayeque valley', SICAN_CORE)]),
    K(1000, 'Middle Sicán at Batán Grande', [R('sican', 'Piura to Jequetepeque', SICAN_PEAK)]),
    K(1150, 'Late Sicán at Túcume', [R('sican', 'Lambayeque valleys', SICAN_CORE)]),
    K(1360, 'Before the Chimú conquest', [R('sican', 'Lambayeque valleys', SICAN_CORE)]),
  ],
  timelineItemIds: ['peru-sican'], confidence: CONF.culture,
  sources: [W('Sican culture'), W('Túcume'), SHIMADA_1982],
});

// ---- Chimor (Chimú), c. 900–1470 ------------------------------------------------------------

const CHIMU_950 = coastal(-7.95, -8.4, [[-78.6, -8.4], [-78.75, -7.95]]);
const CHIMU_1200 = coastal(-7.6, -8.7, [[-78.55, -8.7], [-78.55, -8.25], [-78.8, -7.85], [-79.1, -7.6]]);
const CHIMU_1330 = coastal(-7.05, -9.1, [[-78.35, -9.1], [-78.35, -8.6], [-78.6, -8.0], [-79.0, -7.5], [-79.25, -7.05]]);
const CHIMU_1380 = coastal(-6.25, -9.6, [[-78.05, -9.6], [-78.25, -9.0], [-78.4, -8.4], [-78.75, -7.8], [-79.05, -7.2], [-79.35, -6.6], [-79.65, -6.25]]);
const CHIMU_PEAK = coastal(-3.5, -11.75, [
  [-77.0, -11.75], [-77.2, -11.2], [-77.55, -10.4], [-77.85, -9.6], [-78.2, -9.0], [-78.4, -8.4], [-78.75, -7.8], [-79.05, -7.2],
  [-79.35, -6.6], [-79.7, -6.0], [-80.1, -5.2], [-80.15, -4.5], [-80.1, -3.8],
]);

const chimu = E({
  id: 'chimu', name: 'Chimor (Chimú)', color: '#2563EB', type: 'state',
  description: 'The Kingdom of Chimor ruled Peru’s north coast from Chan Chan, the largest adobe city in the Americas, with walled royal compounds for each king. Its dynasty traced itself to Taycanamo, who came by sea; later kings took the Jequetepeque valley (about 1320) and the Sicán lands of Lambayeque (about 1375), until Chimor held some 1,000 km of coast from Tumbes to the Chillón valley — the southern limit is disputed. Topa Inca conquered it around 1470 and carried its king Minchançaman to Cusco.',
  keyYears: [950, 1200, 1330, 1380, 1462],
  overlays: [
    K(950, 'Taycanamo’s kingdom in the Moche valley', [R('chimor', 'Moche valley', CHIMU_950)]),
    K(1200, 'Chimor in the Chicama, Moche and Virú valleys', [R('chimor', 'Chicama, Moche and Virú valleys', CHIMU_1200)]),
    K(1330, 'Jequetepeque and Santa taken', [R('chimor', 'Jequetepeque to Santa', CHIMU_1330)]),
    K(1380, 'Lambayeque (Sicán) conquered', [R('chimor', 'Lambayeque to Casma', CHIMU_1380)]),
    K(1462, 'Chimor at its height under Minchançaman', [R('chimor', 'Tumbes to the Chillón valley', CHIMU_PEAK)]),
  ],
  timelineItemIds: ['peru-wari-chimu'], confidence: CONF.chronicle,
  sources: [W('Chimú culture'), UNESCO('Chan Chan Archaeological Zone', 366), MOORE_MACKEY_2008],
  edgeGrace: 8,
});

// ---- Other kingdoms before the Inca (about 1000–1470) -------------------------------------

const CHACHAPOYAS = [[-78.15, -5.8], [-77.45, -5.65], [-77.0, -6.3], [-77.15, -7.0], [-77.6, -7.35], [-78.0, -6.95], [-78.25, -6.3], [-78.15, -5.8]];
const chachapoyas = E({
  id: 'chachapoyas', name: 'Chachapoyas', color: '#15803D', type: 'civilization',
  description: 'The “cloud warriors” of the forested eastern Andes between the Marañón and Huallaga rivers, who built round stone houses, cliff tombs and sarcophagi, and the walled mountain-top town of Kuélap. Never a single kingdom, they resisted Topa Inca’s conquest in the 1470s and later sided with the Spanish against the Inca.',
  keyYears: [1000, 1250, 1462],
  overlays: [
    K(1000, 'Chachapoyas towns', [R('chachapoyas', 'Utcubamba valley', CHACHAPOYAS)]),
    K(1250, 'Kuélap at its height', [R('chachapoyas', 'Utcubamba valley', CHACHAPOYAS)]),
    K(1462, 'Before the Inca conquest', [R('chachapoyas', 'Utcubamba valley', CHACHAPOYAS)]),
  ],
  timelineItemIds: ['peru-late-intermediate'], confidence: CONF.culture,
  sources: [W('Chachapoya culture'), W('Kuélap')],
  edgeGrace: 8,
});

const CHINCHA = coastal(-13.1, -13.85, [[-75.8, -13.85], [-75.8, -13.4], [-76.05, -13.1]]);
const chincha = E({
  id: 'chincha', name: 'Chincha', color: '#0D9488', type: 'state',
  description: 'A rich south-coast kingdom of the Chincha and Pisco valleys, ruled from La Centinela. Spanish accounts describe thousands of Chincha merchants who traded by sea and llama caravan, as far as Ecuador for Spondylus shell. Chincha joined the Inca Empire peacefully, and its lord was the only one carried in a litter beside Atahualpa at Cajamarca.',
  keyYears: [1050, 1300, 1462],
  overlays: [
    K(1050, 'Chincha lords', [R('chincha', 'Chincha and Pisco valleys', CHINCHA)]),
    K(1300, 'Chincha merchants', [R('chincha', 'Chincha and Pisco valleys', CHINCHA)]),
    K(1462, 'Chincha joins Tawantinsuyu', [R('chincha', 'Chincha and Pisco valleys', CHINCHA)]),
  ],
  timelineItemIds: ['peru-late-intermediate'], confidence: CONF.chronicle,
  sources: [W('Chincha culture'), W('Late Intermediate Period')],
  edgeGrace: 8,
});

const YCHSMA = coastal(-11.85, -12.45, [[-76.6, -12.45], [-76.55, -12.05], [-76.85, -11.85]]);
const ychsma = E({
  id: 'ychsma', name: 'Ychsma (Pachacamac)', color: '#0EA5E9', type: 'state',
  description: 'The lords of the lower Rímac and Lurín valleys — where Lima stands now — around the great oracle of Pachacamac, a pilgrimage shrine for over a thousand years. The Inca kept the oracle and built a Sun temple beside it; Hernando Pizarro looted it in 1533.',
  keyYears: [950, 1250, 1462],
  overlays: [
    K(950, 'The Pachacamac oracle', [R('ychsma', 'Rímac and Lurín valleys', YCHSMA)]),
    K(1250, 'Ychsma lords', [R('ychsma', 'Rímac and Lurín valleys', YCHSMA)]),
    K(1462, 'Before the Inca conquest', [R('ychsma', 'Rímac and Lurín valleys', YCHSMA)]),
  ],
  timelineItemIds: ['peru-late-intermediate'], confidence: CONF.chronicle,
  sources: [W('Ychsma culture'), W('Pachacamac')],
  edgeGrace: 8,
});

const CHANKA = [[-74.45, -12.85], [-73.4, -13.05], [-72.95, -13.55], [-73.15, -14.2], [-73.95, -14.35], [-74.5, -13.75], [-74.45, -12.85]];
const chanka = E({
  id: 'chanka', name: 'Chanka', color: '#9F1239', type: 'state',
  description: 'A warlike confederation of the Andahuaylas and Ayacucho highlands, west of Cusco. Inca tradition says the Chanka attacked Cusco around 1438 and that young Pachacuti’s victory over them began the Inca Empire.',
  keyYears: [1150, 1350, 1430],
  overlays: [
    K(1150, 'Chanka confederation', [R('chanka', 'Andahuaylas and Ayacucho highlands', CHANKA)]),
    K(1350, 'Chanka confederation', [R('chanka', 'Andahuaylas and Ayacucho highlands', CHANKA)]),
    K(1430, 'Before the attack on Cusco', [R('chanka', 'Andahuaylas and Ayacucho highlands', CHANKA)]),
  ],
  timelineItemIds: ['peru-late-intermediate'], confidence: CONF.chronicle,
  sources: [W('Chanka people'), W('Kingdom of Cusco')],
  edgeGrace: 8,
});

const CUSCO_EARLY = [[-72.2, -13.35], [-71.8, -13.3], [-71.65, -13.6], [-72.05, -13.8], [-72.3, -13.6], [-72.2, -13.35]];
const CUSCO_LATE = [[-72.6, -13.05], [-71.6, -13.0], [-71.3, -13.6], [-71.7, -14.1], [-72.4, -14.0], [-72.8, -13.55], [-72.6, -13.05]];
const cusco = E({
  id: 'kingdom-of-cusco', name: 'Kingdom of Cusco', color: '#F59E0B', type: 'state',
  description: 'Before the empire, the Inca were one small highland kingdom in the Cusco valley, founded according to legend by Manco Cápac. Under its early kings it fought and married its neighbours; Viracocha Inca raided further afield in the early 15th century. In 1438 Pachacuti turned it into Tawantinsuyu.',
  keyYears: [1200, 1350, 1420, 1430],
  overlays: [
    K(1200, 'Manco Cápac’s Cusco (legendary)', [R('cusco', 'Cusco valley', CUSCO_EARLY)]),
    K(1350, 'A Cusco valley kingdom', [R('cusco', 'Cusco valley', CUSCO_EARLY)]),
    K(1420, 'Viracocha Inca’s raids', [R('cusco', 'Cusco and the Urubamba valley', CUSCO_LATE)]),
    K(1430, 'Before the Chanka war', [R('cusco', 'Cusco and the Urubamba valley', CUSCO_LATE)]),
  ],
  timelineItemIds: ['peru-late-intermediate', 'peru-inca-empire'], confidence: CONF.chronicle,
  sources: [W('Kingdom of Cusco'), UNESCO('City of Cuzco', 273)],
  edgeGrace: 8,
});

const COLLA = [[-70.9, -14.6], [-69.95, -14.55], [-69.4, -15.15], [-69.7, -15.55], [-70.05, -15.7], [-70.6, -15.65], [-71.0, -15.2], [-70.9, -14.6]];
const colla = E({
  id: 'colla', name: 'Colla (Qulla)', color: '#6D28D9', type: 'state',
  description: 'An Aymara kingdom of the northern Lake Titicaca basin, ruled from Hatunqolla, rich in llama and alpaca herds. Rival of the Lupaca, it was conquered by Pachacuti in the mid-15th century and rebelled against the Inca more than once.',
  keyYears: [1150, 1350, 1445],
  overlays: [
    K(1150, 'Colla lords of Hatunqolla', [R('colla', 'Northern Titicaca basin', COLLA)]),
    K(1350, 'Colla kingdom', [R('colla', 'Northern Titicaca basin', COLLA)]),
    K(1445, 'Before Pachacuti’s conquest', [R('colla', 'Northern Titicaca basin', COLLA)]),
  ],
  timelineItemIds: ['peru-late-intermediate'], confidence: CONF.chronicle,
  sources: [W('Colla Kingdom'), W('Late Intermediate Period')],
  edgeGrace: 8,
});

const LUPACA = [[-70.15, -15.8], [-69.75, -15.85], [-69.3, -16.1], [-69.0, -16.45], [-69.3, -16.75], [-69.85, -16.65], [-70.3, -16.25], [-70.15, -15.8]];
const lupaca = E({
  id: 'lupaca', name: 'Lupaca', color: '#4F46E5', type: 'state',
  description: 'An Aymara kingdom on the south-west shore of Lake Titicaca, ruled from Chucuito. A Spanish inspection of 1567 counted tens of thousands of households and huge herds. The Lupaca allied with the Inca against the Colla and joined the empire.',
  keyYears: [1150, 1350, 1455],
  overlays: [
    K(1150, 'Lupaca lords of Chucuito', [R('lupaca', 'South-west Titicaca shore', LUPACA)]),
    K(1350, 'Lupaca kingdom', [R('lupaca', 'South-west Titicaca shore', LUPACA)]),
    K(1455, 'Lupaca join the Inca', [R('lupaca', 'South-west Titicaca shore', LUPACA)]),
  ],
  timelineItemIds: ['peru-late-intermediate'], confidence: CONF.chronicle,
  sources: [W('Lupaca'), W('Chucuito')],
  edgeGrace: 8,
});

// ---- The Inca Empire (Tawantinsuyu), 1438–1533, redrawn ------------------------------------
// Three regions as before (Peru, the northern and southern Andes), now meeting the coast and each
// other along shared lines, so the empire grows from Cusco without crossing the Pacific.

const INCA_1438 = [[-73.6, -13.8], [-73.3, -12.9], [-72.2, -12.7], [-71.0, -13.2], [-70.8, -14.1], [-71.6, -14.7], [-72.8, -14.5], [-73.6, -13.8]];
const INCA_1463_PERU = [
  [-77.0, -9.4], ...rev(EAST_PERU.slice(0, 10)), ...rev(SOUTH_LINE.slice(1)).slice(1),
  [-70.6, -16.9], [-71.6, -16.2], [-72.8, -15.3], [-74.0, -14.6], [-75.2, -13.6], [-76.0, -12.4], [-76.5, -11.2], [-76.9, -10.2], [-77.0, -9.4],
];
const INCA_1463_SOUTH = [[-69.25, -15.1], [-68.6, -15.4], [-68.1, -16.1], [-68.2, -16.9], [-68.9, -17.2], [-69.5, -17.0], [-69.05, -16.5], [-69.35, -15.8], [-69.25, -15.1]];
const INCA_PERU = coastal(-3.45, -18.35, [...SOUTH_LINE, ...EAST_PERU.slice(1), ...rev(NORTH_LINE).slice(1)]);
const INCA_NORTH_QUITO = coastal(-2.6, -3.45, [
  ...NORTH_LINE, ...EAST_ECUADOR, [-77.75, -0.05], [-78.75, -0.05], [-79.0, -0.6], [-79.3, -1.5], [-79.6, -2.2],
]);
const INCA_NORTH_PASTO = coastal(-2.6, -3.45, [
  ...NORTH_LINE, ...EAST_ECUADOR, [-77.6, 0.3], [-77.1, 1.0], [-77.15, 1.4], [-77.7, 1.35], [-78.6, 0.3], [-79.0, -0.6], [-79.3, -1.5], [-79.6, -2.2],
]);
const INCA_SOUTH_1471 = [
  ...rev(SOUTH_LINE), [-69.4, -18.4], [-68.3, -19.3], [-67.0, -19.2], [-66.6, -18.0], [-67.0, -16.8], [-67.8, -16.0], [-68.8, -15.2], [-69.4, -14.5],
];
const southRing = (east) => [...rev(SOUTH_LINE), ...coastBetween(-18.35, -35.3), [-71.0, -35.4], ...rev(east), [-69.4, -14.5]];
// 1493: Topa Inca's south, before Huayna Capac's forts on the Chaco edge (east of Cochabamba and Tarija).
const INCA_SOUTH_1493 = southRing(EAST_SOUTH.map(([lng, lat]) => (lat < -16.5 && lat > -22 ? [lng - 0.8, lat] : [lng, lat])));
const INCA_SOUTH_1527 = southRing(EAST_SOUTH);

const inca = E({
  id: 'inca-empire', name: 'Inca Empire', color: '#EA580C', type: 'empire',
  description: 'Tawantinsuyu, “the four parts together”, the largest empire of the pre-Columbian Americas. After beating the Chanka (about 1438), Pachacuti made the Cusco kingdom an empire and took the central highlands and Lake Titicaca; his son Topa Inca conquered Chimor and Quito, then the south as far as Chile’s Maule river; Huayna Capac added the far north to Pasto. It ran on mit’a labour, storehouses and 40,000 km of roads. Huayna Capac died of an epidemic around 1527; the civil war between Huáscar and Atahualpa had just ended when Pizarro seized Atahualpa at Cajamarca in 1532.',
  nameAt: [[1438, 'Inca Empire (Tawantinsuyu)']],
  keyYears: [1438, 1463, 1471, 1493, 1527, 1532],
  overlays: [
    K(1438, 'Pachacuti’s Cusco after the Chanka war', [R('peru', 'Cusco and the Apurímac', INCA_1438)]),
    K(1463, 'Pachacuti takes the highlands and Lake Titicaca', [
      R('peru', 'Central and southern highlands', INCA_1463_PERU), R('andes-south', 'Lake Titicaca (Bolivian shore)', INCA_1463_SOUTH),
    ]),
    K(1471, 'Topa Inca takes Chimor and Quito', [
      R('peru', 'Peru: coast and highlands', INCA_PERU), R('andes-north', 'Highland Ecuador to Quito', INCA_NORTH_QUITO),
      R('andes-south', 'Bolivian altiplano', INCA_SOUTH_1471),
    ]),
    K(1493, 'Topa Inca’s empire reaches the Maule', [
      R('peru', 'Peru: coast and highlands', INCA_PERU), R('andes-north', 'Highland Ecuador to Quito', INCA_NORTH_QUITO),
      R('andes-south', 'Collasuyu: Bolivia, north-west Argentina, Chile to the Maule', INCA_SOUTH_1493),
    ]),
    K(1527, 'Huayna Capac’s empire at its height', [
      R('peru', 'Peru: coast and highlands', INCA_PERU), R('andes-north', 'Chinchaysuyu: Ecuador to Pasto', INCA_NORTH_PASTO),
      R('andes-south', 'Collasuyu: Bolivia, north-west Argentina, Chile to the Maule', INCA_SOUTH_1527),
    ]),
    K(1532, 'Civil war; Pizarro at Cajamarca', [
      R('peru', 'Peru: coast and highlands', INCA_PERU), R('andes-north', 'Chinchaysuyu: Ecuador to Pasto', INCA_NORTH_PASTO),
      R('andes-south', 'Collasuyu: Bolivia, north-west Argentina, Chile to the Maule', INCA_SOUTH_1527),
    ]),
  ],
  timelineItemIds: ['inca', 'peru-inca-empire'], confidence: CONF.inca,
  sources: [W('Inca Empire'), UNESCO('Qhapaq Ñan, Andean Road System', 1459), ROWE_1945, MARSH_2017],
  edgeGrace: 4,
});

const VILCABAMBA = [[-73.75, -12.55], [-73.05, -12.45], [-72.5, -12.75], [-72.45, -13.2], [-72.9, -13.4], [-73.5, -13.25], [-73.85, -12.9], [-73.75, -12.55]];
const neoInca = E({
  id: 'neo-inca-state', name: 'Neo-Inca State (Vilcabamba)', color: '#F97316', type: 'state',
  description: 'After his great rising and the siege of Cusco failed (1536–37), Manco Inca withdrew to the forested Vilcabamba valley and kept an Inca kingdom there for 35 years under himself, Sayri Túpac, Titu Cusi and Túpac Amaru. Viceroy Toledo’s army took Vilcabamba (Espíritu Pampa) in 1572 and Túpac Amaru was beheaded in Cusco.',
  keyYears: [1537, 1560, 1572],
  overlays: [
    K(1537, 'Manco Inca retreats to Vilcabamba', [R('vilcabamba', 'Vilcabamba valley', VILCABAMBA)]),
    K(1560, 'Titu Cusi’s Vilcabamba', [R('vilcabamba', 'Vilcabamba valley', VILCABAMBA)]),
    K(1572, 'Toledo takes Vilcabamba', [R('vilcabamba', 'Vilcabamba valley', VILCABAMBA)]),
  ],
  timelineItemIds: ['peru-inca-empire'], confidence: CONF.chronicle,
  sources: [W('Neo-Inca State'), W('Spanish conquest of the Inca Empire')],
  edgeGrace: 4,
});

/** Peru's polities, oldest first. Ids already on the globe (inca-empire) are replaced, the rest appended. */
export const peruPolities = [
  norteChico, chavin, paracas, nazca, moche, wari, sican, chimu, chachapoyas, chincha, ychsma, chanka, cusco, colla, lupaca,
  inca, neoInca,
];

// ---- Existing shapes over Peru, redrawn to the coast ----------------------------------------

/** Spanish Peru from Pizarro's first towns to Cusco (1535). */
const SPAIN_PERU_1535 = coastal(-3.5, -14.2, [
  [-75.6, -14.4], [-73.8, -14.6], [-71.6, -14.3], ...EAST_PERU.slice(2), ...rev(NORTH_LINE).slice(1),
]);
/** The Viceroyalty of Peru, 1550: Spanish South America from Quito to Concepción. */
const VICEROYALTY_1550 = coastal(1.5, -36, [
  [-71.0, -36.0], [-70.4, -34.5], [-70.2, -33.0], [-70.0, -31.0], [-69.6, -29.0], [-68.9, -27.0], [-68.2, -24.5], [-67.6, -22.8],
  [-66.0, -22.3], [-64.9, -21.6], [-64.6, -19.5], [-65.0, -17.6], [-66.5, -16.6], [-67.8, -16.0], [-68.8, -15.2], ...EAST_PERU,
  [-78.6, -4.2], [-78.5, -3.3], [-78.1, -2.0], [-77.8, -0.8], [-77.6, 0.3], [-77.4, 1.5],
]);
/** The Viceroyalty of Peru, 1700–1800: Peru, Upper Peru (Bolivia) and Quito; Chile and the Río de la Plata are drawn separately. */
const VICEROYALTY_1700 = coastal(1.5, -24, [
  [-68.3, -24.0], [-67.6, -22.8], [-65.5, -22.3], [-64.3, -21.8], [-63.2, -20.5], [-62.6, -18.5], [-63.4, -16.8], [-65.5, -16.3],
  [-67.8, -16.0], [-68.8, -15.2], ...EAST_PERU, [-78.6, -4.2], [-78.5, -3.3], [-78.1, -2.0], [-77.8, -0.8], [-77.6, 0.3], [-77.4, 1.5],
]);
/** Chile to the Biobío and the settled Río de la Plata (Tucumán, Córdoba, Buenos Aires, Paraguay). */
const SOUTHERN_CONE = coastal(-24, -37, [
  [-72.0, -37.2], [-70.4, -36.0], [-68.5, -35.0], [-65.0, -34.8], [-61.0, -35.0], [-58.2, -34.9], [-58.3, -34.0], [-58.6, -32.0],
  [-59.6, -29.5], [-57.9, -27.4], [-55.5, -27.0], [-54.6, -25.6], [-57.6, -25.2], [-60.0, -24.2], [-62.2, -22.1], [-64.3, -21.8],
  [-65.5, -22.3], [-67.6, -22.8], [-68.3, -24.0],
]);
/** Spanish coastal towns and haciendas from Guayaquil to the Atacama (colonial-americas). */
const COLONIAL_ANDES_COAST = coastal(-2.6, -24, [
  [-69.6, -24.0], [-69.6, -21.0], [-70.0, -18.5], [-71.4, -16.6], [-73.2, -15.6], [-75.0, -14.4], [-76.0, -13.0], [-76.6, -12.0],
  [-77.3, -10.8], [-77.8, -9.6], [-78.4, -8.3], [-79.0, -7.2], [-79.5, -6.2], [-80.0, -5.2], [-80.2, -4.2], [-80.0, -3.4], [-79.6, -2.6],
]);

/** A line about 50–100 km in from the coast, splitting the Andean peoples' coast and highland regions (south → north). */
const ANDEAN_STRIP = [
  [-70.0, -24.0], [-69.9, -22.5], [-69.8, -21.0], [-69.9, -19.5], [-70.0, -18.5], [-71.2, -17.0], [-72.6, -16.1], [-74.2, -15.2],
  [-75.3, -14.3], [-75.9, -13.1], [-76.5, -12.0], [-77.0, -11.0], [-77.6, -9.8], [-78.2, -8.6], [-78.8, -7.6], [-79.3, -6.7],
  [-79.8, -5.8], [-80.3, -5.0], [-80.4, -4.2], [-80.0, -3.4], [-79.3, -2.0], [-79.4, -0.8], [-79.2, 0.5], [-78.4, 1.3],
];
function stripLngAt(lat) {
  for (let i = 1; i < ANDEAN_STRIP.length; i++) {
    const [a, la] = ANDEAN_STRIP[i - 1];
    const [b, lb] = ANDEAN_STRIP[i];
    if (lat >= la && lat <= lb) return Math.round((a + ((b - a) * (lat - la)) / (lb - la)) * 100) / 100;
  }
  throw new Error(`strip: latitude ${lat} outside the Andean strip`);
}
/** The strip line from `south` up to `north` (ends interpolated). */
function strip(north, south) {
  return [[stripLngAt(south), south], ...ANDEAN_STRIP.filter(([, lat]) => lat > south && lat < north), [stripLngAt(north), north]];
}
const peopleCoast = (north, south) => coastal(north, south, strip(north, south));
const peopleHighland = (north, south, eastS2N) => {
  const s = rev(strip(north, south));
  return [...s, ...eastS2N, s[0]];
};
/** The Andes' eastern edge for peoples (a little wider than the Inca line), south → north. */
const PEOPLE_EAST = [
  [-67.8, -16.0], [-69.0, -14.2], [-70.6, -13.2], [-72.4, -12.3], [-74.4, -11.3], [-75.4, -10.0], [-76.2, -8.4], [-76.8, -6.8],
  [-77.6, -5.4],
];
const PEOPLES_500BCE = coastal(-7.2, -17.3, [[-71.3, -17.6], [-69.0, -14.0], [-70.0, -8.0], [-77.3, -7.2]]);
const PEOPLES_200_COAST = peopleCoast(-5.0, -17.5);
const PEOPLES_200_HIGH = peopleHighland(-5.0, -17.5, [[-70.8, -17.9], [-68.3, -16.0], ...PEOPLE_EAST.slice(1), [-78.2, -4.6], [-79.6, -4.9]]);
const PEOPLES_800_COAST = peopleCoast(-3.6, -19.5);
const PEOPLES_800_HIGH = peopleHighland(-3.6, -19.5, [[-67.0, -19.8], [-66.3, -17.6], ...PEOPLE_EAST, [-78.2, -4.2], [-79.0, -3.6]]);
const PEOPLES_LATE_COAST = peopleCoast(-2.0, -22.0);
const PEOPLES_LATE_HIGH = peopleHighland(-2.0, -22.0, [
  [-68.6, -22.2], [-66.0, -22.0], [-65.0, -19.5], [-65.5, -17.4], ...PEOPLE_EAST, [-78.0, -4.0], [-77.8, -2.0], [-78.6, -1.9],
]);
/** Quechua and Aymara highlands after 1900: the Andes only, west slope to east edge. */
const PEOPLES_MODERN = [
  [-79.0, -2.0], [-77.8, -2.0], [-78.0, -4.0], [-77.6, -5.4], [-76.8, -6.8], [-76.2, -8.4], [-75.4, -10.0], [-74.4, -11.3],
  [-72.4, -12.3], [-70.6, -13.2], [-69.0, -14.2], [-67.8, -16.0], [-65.5, -17.4], [-65.0, -19.5], [-66.0, -21.5], [-68.6, -21.5],
  [-69.2, -19.0], [-70.0, -17.6], [-71.6, -16.4], [-73.4, -15.2], [-74.8, -14.0], [-75.8, -12.6], [-76.6, -11.0], [-77.4, -9.4],
  [-78.1, -8.0], [-78.8, -6.4], [-79.4, -4.6], [-79.4, -3.0], [-79.0, -2.0],
];
const PRESENCE_2500BCE = coastal(-8.0, -15.0, [[-75.2, -15.0], [-74.0, -13.0], [-75.0, -8.0]]);
const PRESENCE_500BCE = coastal(-6.0, -17.0, [[-71.6, -17.2], [-73.0, -14.5], [-74.0, -6.0]]);
const PRESENCE_500 = coastal(-3.6, -19.0, [[-69.5, -19.0], [-70.0, -17.0], [-72.5, -15.0], [-73.5, -11.0], [-74.0, -4.0]]);
const PRESENCE_LATE = coastal(-2.0, -21.0, [[-69.3, -21.0], [-69.6, -18.5], [-70.2, -17.2], [-72.4, -15.2], [-72.8, -12.5], [-73.0, -2.0]]);

/**
 * Redraws, by entity id → keyframe year → region id. `null` drops a region; `add` inserts keyframes
 * (copies of an existing keyframe's other regions, so nothing else moves). Applied by
 * applyPeruShapeFixes() in globe-overlays.js; it throws if a target is missing.
 */
export const peruShapeFixes = {
  'spanish-empire': {
    add: [
      { year: 1530, copyOf: 1550, label: 'Spanish Caribbean and New Spain', drop: ['andes', 'philippines'] },
      { year: 1535, copyOf: 1550, label: 'Pizarro’s conquest of Peru', drop: ['philippines'], regions: { andes: SPAIN_PERU_1535 } },
    ],
    regions: {
      1550: { andes: VICEROYALTY_1550 },
      1700: { andes: VICEROYALTY_1700, 'southern-cone': SOUTHERN_CONE },
      1800: { andes: VICEROYALTY_1700, 'southern-cone': { ring: SOUTHERN_CONE, name: 'Chile and the Río de la Plata' } },
    },
    timelineItemIds: ['peru-viceroyalty'],
    sources: [W('Viceroyalty of Peru'), W('Spanish conquest of the Inca Empire')],
  },
  'colonial-americas': {
    regions: { 1520: { 'andes-coast': null }, 1700: { 'andes-coast': COLONIAL_ANDES_COAST }, 1800: { 'andes-coast': COLONIAL_ANDES_COAST } },
    add: [
      { year: 1533, copyOf: 1520, label: 'Early Iberian Americas' },
      { year: 1545, copyOf: 1520, label: 'Spanish Peru founded', regions: { 'andes-coast': { ring: COLONIAL_ANDES_COAST, name: 'Andean coast' } } },
    ],
  },
  'andean-peoples': {
    regions: {
      [-500]: { 'andean-central': PEOPLES_500BCE },
      200: { 'andean-central': PEOPLES_200_HIGH, 'andean-coast': PEOPLES_200_COAST },
      800: { 'andean-central': PEOPLES_800_HIGH, 'andean-coast': PEOPLES_800_COAST },
      1400: { 'andean-central': PEOPLES_LATE_HIGH, 'andean-coast': PEOPLES_LATE_COAST },
      1700: { 'andean-central': PEOPLES_LATE_HIGH, 'andean-coast': PEOPLES_LATE_COAST },
      1900: { 'andean-central': PEOPLES_MODERN },
      2025: { 'andean-central': PEOPLES_MODERN },
    },
  },
  'andean-presence': {
    regions: {
      [-2500]: { 'and-coast': PRESENCE_2500BCE },
      [-500]: { 'and-coast': PRESENCE_500BCE },
      500: { 'and-coast': PRESENCE_500 },
      1400: { 'and-coast': PRESENCE_LATE },
      1880: { 'and-coast': PRESENCE_LATE },
    },
  },
};

/** Apply peruShapeFixes to the shared catalogue (mutates the entities in place). */
export function applyPeruShapeFixes(entities) {
  const byId = new Map(entities.map((e) => [e.id, e]));
  for (const [id, fix] of Object.entries(peruShapeFixes)) {
    const ent = byId.get(id);
    if (!ent) throw new Error(`peru fixes: no entity ${id}`);
    const at = (year) => {
      const kf = ent.overlays.find((o) => o.year === Number(year));
      if (!kf) throw new Error(`peru fixes: ${id} has no ${year} keyframe`);
      return kf;
    };
    for (const [year, regions] of Object.entries(fix.regions || {})) {
      const kf = at(year);
      for (const [rid, v] of Object.entries(regions)) {
        const i = kf.regions.findIndex((r) => (typeof r === 'string' ? r : r.id) === rid);
        if (i < 0 && v && v.name) {
          kf.regions.push({ id: rid, name: v.name, ring: v.ring });
          continue;
        }
        if (i < 0) throw new Error(`peru fixes: ${id} ${year} has no region ${rid}`);
        if (v === null) kf.regions.splice(i, 1);
        else {
          const ring = Array.isArray(v) ? v : v.ring;
          kf.regions[i] = { ...kf.regions[i], ring, ...(v.name ? { name: v.name } : {}) };
          delete kf.regions[i].bbox;
        }
      }
    }
    for (const add of fix.add || []) {
      const src = at(add.copyOf);
      const regions = src.regions
        .filter((r) => !(add.drop || []).includes(typeof r === 'string' ? r : r.id))
        .map((r) => (typeof r === 'string' ? r : { ...r }));
      for (const [rid, v] of Object.entries(add.regions || {})) {
        const ring = Array.isArray(v) ? v : v.ring;
        const old = regions.find((r) => r.id === rid);
        if (old) old.ring = ring;
        else regions.push({ id: rid, name: v.name || 'Andes / Peru', ring });
      }
      ent.overlays.push({ ...src, year: add.year, label: add.label, regions });
    }
    ent.overlays.sort((a, b) => a.year - b.year);
    if (fix.add) ent.keyYears = [...new Set([...(ent.keyYears || []), ...fix.add.map((a) => a.year)])].sort((a, b) => a - b);
    if (fix.timelineItemIds) ent.timelineItemIds = [...new Set([...(ent.timelineItemIds || []), ...fix.timelineItemIds])];
    if (fix.sources) {
      const have = new Set((ent.sources || []).map((s) => s.url));
      ent.sources = [...(ent.sources || []), ...fix.sources.filter((s) => !have.has(s.url))];
    }
  }
}
