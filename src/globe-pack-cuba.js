/**
 * Day 78 — Phase 5 country pack 3, Caribbean and Central America: Cuba (ROADMAP item 12).
 *
 * Cuba had no country timeline, and on the globe before 1815 only a schematic Spanish Empire
 * 'caribbean' ring (a seven-point blob over Cuba, Hispaniola, Jamaica and Puerto Rico from 1550)
 * and similar British / French / Dutch Caribbean footholds. Nothing showed the Guanahatabey, the
 * Taíno cacicazgos, Velázquez’s conquest from Baracoa, or Spanish Cuba as its own colony. This
 * module draws the island from the late pre-Columbian chiefdoms to 1815:
 *
 *   Guanahatabey · Habana · Cubanacán · Camagüey · Oriente (Baracoa / Bayamo) · Spanish Cuba
 *
 * From 1815 the nations layer takes over (Spanish Cuba to 1898, US occupation, the Republic, then
 * Cuba), so no keyframe here is later than 1815. The independence wars, Platt Amendment, Revolution
 * and Missile Crisis are timeline items with pins.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - The main island is cut into 5 "pieces" (CU_PIECES) from the globe’s own land
 *    (src/data/nations.topo.json shape 428), clipped on longitude lines so neighbouring pieces share
 *    their cut edges and never overlap. Coasts are the land’s own coast.
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - The Spanish Empire’s schematic 'caribbean' ring is dropped: Spanish Cuba is drawn above. British,
 *    French and Dutch Caribbean footholds (meant for Jamaica / Saint-Domingue / the Lesser Antilles)
 *    are left for those packs; they may still wash schematically over Cuban waters.
 */

import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const TORRE = { title: 'Library of Congress — Map of the Island of Cuba (José María de la Torre, 1841)', url: 'https://www.loc.gov/item/2021668556/' };
const LAS_CASAS = { title: 'Bartolomé de las Casas, Historia de las Indias', url: 'https://en.wikipedia.org/wiki/Bartolom%C3%A9_de_las_Casas' };

// ---- Pieces ([lng, lat], clipped from nations.topo.json Cuba shape) -----------------------------

export const CU_PIECES = {
  "GUANAHATABEY": [
    [
      -83.4,
      22.2
    ],
    [
      -83.926,
      22.172
    ],
    [
      -84.041,
      21.918
    ],
    [
      -84.142,
      21.94
    ],
    [
      -84.423,
      21.793
    ],
    [
      -84.52,
      21.787
    ],
    [
      -84.473,
      21.904
    ],
    [
      -84.538,
      21.94
    ],
    [
      -84.801,
      21.832
    ],
    [
      -84.948,
      21.861
    ],
    [
      -84.307,
      22.036
    ],
    [
      -84.444,
      22.205
    ],
    [
      -84.372,
      22.381
    ],
    [
      -84.077,
      22.666
    ],
    [
      -83.4,
      22.885
    ],
    [
      -83.4,
      22.2
    ]
  ],
  "HABANA": [
    [
      -81.8,
      22.192
    ],
    [
      -82.09,
      22.342
    ],
    [
      -82.119,
      22.432
    ],
    [
      -81.8,
      22.443
    ],
    [
      -81.8,
      22.644
    ],
    [
      -82.781,
      22.696
    ],
    [
      -83.4,
      22.2
    ],
    [
      -83.4,
      22.885
    ],
    [
      -83.245,
      22.994
    ],
    [
      -82.943,
      22.985
    ],
    [
      -82.101,
      23.188
    ],
    [
      -81.8,
      23.153
    ],
    [
      -81.8,
      22.192
    ]
  ],
  "CUBANACAN": [
    [
      -79.8,
      21.694
    ],
    [
      -80.268,
      21.887
    ],
    [
      -80.484,
      22.193
    ],
    [
      -80.538,
      22.165
    ],
    [
      -80.47,
      22.041
    ],
    [
      -80.992,
      22.055
    ],
    [
      -81.103,
      22.096
    ],
    [
      -81.204,
      22.278
    ],
    [
      -81.197,
      22.091
    ],
    [
      -81.24,
      22.151
    ],
    [
      -81.373,
      22.105
    ],
    [
      -81.395,
      22.17
    ],
    [
      -81.8,
      22.192
    ],
    [
      -81.8,
      22.443
    ],
    [
      -81.651,
      22.488
    ],
    [
      -81.651,
      22.574
    ],
    [
      -81.8,
      22.644
    ],
    [
      -81.8,
      23.153
    ],
    [
      -81.287,
      23.144
    ],
    [
      -81.121,
      23.038
    ],
    [
      -81.078,
      23.104
    ],
    [
      -80.664,
      23.09
    ],
    [
      -80.279,
      22.912
    ],
    [
      -80.023,
      22.946
    ],
    [
      -79.8,
      22.797
    ],
    [
      -79.8,
      21.694
    ]
  ],
  "CAMAGUEY": [
    [
      -77.5,
      19.849
    ],
    [
      -77.737,
      19.856
    ],
    [
      -77.5,
      20.119
    ],
    [
      -77.5,
      20.679
    ],
    [
      -78.065,
      20.711
    ],
    [
      -78.493,
      21.048
    ],
    [
      -78.609,
      21.494
    ],
    [
      -78.767,
      21.639
    ],
    [
      -79.21,
      21.549
    ],
    [
      -79.8,
      21.694
    ],
    [
      -79.8,
      22.797
    ],
    [
      -79.239,
      22.376
    ],
    [
      -78.781,
      22.39
    ],
    [
      -78.083,
      22.082
    ],
    [
      -77.763,
      21.814
    ],
    [
      -77.525,
      21.754
    ],
    [
      -77.5,
      21.858
    ],
    [
      -77.5,
      19.849
    ]
  ],
  "ORIENTE": [
    [
      -75.232,
      19.9
    ],
    [
      -76.247,
      19.991
    ],
    [
      -77.5,
      19.849
    ],
    [
      -77.5,
      20.119
    ],
    [
      -77.183,
      20.295
    ],
    [
      -77.082,
      20.465
    ],
    [
      -77.338,
      20.717
    ],
    [
      -77.5,
      20.679
    ],
    [
      -77.5,
      21.762
    ],
    [
      -77.338,
      21.65
    ],
    [
      -77.5,
      21.858
    ],
    [
      -77.194,
      21.671
    ],
    [
      -77.154,
      21.554
    ],
    [
      -77.251,
      21.61
    ],
    [
      -77.259,
      21.476
    ],
    [
      -77.154,
      21.496
    ],
    [
      -77.107,
      21.603
    ],
    [
      -76.636,
      21.322
    ],
    [
      -76.733,
      21.285
    ],
    [
      -76.553,
      21.267
    ],
    [
      -76.539,
      21.185
    ],
    [
      -76.456,
      21.225
    ],
    [
      -76.506,
      21.288
    ],
    [
      -76.139,
      21.167
    ],
    [
      -76.117,
      21.092
    ],
    [
      -75.685,
      21.103
    ],
    [
      -75.577,
      21.014
    ],
    [
      -75.649,
      20.899
    ],
    [
      -75.743,
      20.902
    ],
    [
      -75.783,
      20.746
    ],
    [
      -75.711,
      20.69
    ],
    [
      -75.631,
      20.781
    ],
    [
      -75.498,
      20.693
    ],
    [
      -74.998,
      20.701
    ],
    [
      -74.771,
      20.626
    ],
    [
      -74.494,
      20.354
    ],
    [
      -74.159,
      20.274
    ],
    [
      -74.141,
      20.183
    ],
    [
      -74.267,
      20.069
    ],
    [
      -74.814,
      20.037
    ],
    [
      -75.095,
      19.897
    ],
    [
      -75.16,
      19.971
    ],
    [
      -75.232,
      19.9
    ]
  ]
};

const P = (names) => names.map((n) => {
  if (!CU_PIECES[n]) throw new Error(`cuba pack: no piece ${n}`);
  return CU_PIECES[n];
});

export const CU_STEPS = {};
function build(meta, steps) {
  CU_STEPS[meta.id] = steps;
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

const CONF = {
  guanahatabey: {
    level: 'conjectural',
    reason: 'Known from Spanish accounts (Columbus’s interpreters could not speak with them; las Casas distinguished them from the Taíno) and from Archaic archaeology in western Cuba. Their language is lost; the outline is the far-west peninsula they are said to have held at contact.',
  },
  cacicazgo: {
    level: 'conjectural',
    reason: 'Named cacicazgos (Habana, Cubanacán, Camagüey, Baracoa, Bayamo and others) come from early Spanish reports and from José María de la Torre’s 1841 reconstruction. A cacicazgo was a chiefdom of allied villages, not a surveyed territory; longitude cuts stand in for the rough east–west sequence on that map.',
  },
  spanish: {
    level: 'approximate',
    reason: 'The founding years of the Spanish villas (Baracoa 1511, Bayamo, Santiago, Trinidad, Sancti Spíritus, Puerto Príncipe, Havana) are well dated. Spanish rule meant towns, encomiendas and the coast; inland mountains stayed thinly held. The outline is the island’s own land from the globe’s coastline.',
  },
};

const PRE = ['cu-taino-cacicazgos'];

// ---- Guanahatabey (far west) --------------------------------------------------------------------

const guanahatabey = build({
  id: 'guanahatabey', name: 'Guanahatabey', color: '#65A30D',
  description: 'Hunter-gatherers of western Cuba at European contact, with a language distinct from Taíno (Columbus’s Taíno interpreter could not speak with them). Archaeology places an Archaic population across the island; by 1492 they held the Guanahacabibes / Pinar del Río end. Drawn as the far-west piece; they disappear from the map as Spanish settlement reaches the west in the 1510s.',
  timelineItemIds: ['cu-early-peoples', ...PRE], confidence: CONF.guanahatabey,
  sources: [W('Guanahatabey'), W('History of Cuba'), TORRE],
}, [
  [1000, 'Guanahatabey of the far west', { guanahatabey: ['Guanahatabey', ['GUANAHATABEY']] }],
  [1492, 'Guanahatabey at European contact', { guanahatabey: ['Guanahatabey', ['GUANAHATABEY']] }],
  [1514, 'Far west before Spanish Havana', { guanahatabey: ['Guanahatabey', ['GUANAHATABEY']] }],
]);

// ---- Habana cacicazgo ---------------------------------------------------------------------------

const habana = build({
  id: 'habana-cacicazgo', name: 'Habana (cacicazgo)', color: '#DB2777',
  description: 'The Taíno chiefdom of the Habana coast and harbour that gave its name to the Spanish city. De la Torre’s 1841 map places Habana (with Marién) on the north-west shore east of the Guanahatabey. Martín de Goiti’s and Velázquez’s men reached this coast as the conquest moved west; the Spanish villa of San Cristóbal de la Habana was established on the south coast in 1514 and moved to the present harbour in 1519.',
  timelineItemIds: [...PRE, 'cu-havana'], confidence: CONF.cacicazgo,
  sources: [W('Havana'), W('Taíno'), TORRE, W('History of Cuba')],
}, [
  [1200, 'Habana chiefdom on the north-west shore', { habana: ['Habana', ['HABANA']] }],
  [1492, 'Habana at European contact', { habana: ['Habana', ['HABANA']] }],
  [1513, 'Habana on the eve of the Spanish villa', { habana: ['Habana', ['HABANA']] }],
]);

// ---- Cubanacán ----------------------------------------------------------------------------------

const cubanacan = build({
  id: 'cubanacan', name: 'Cubanacán', color: '#EA580C',
  description: '“Cubanacán” — “central land” in Taíno — was the name early Spanish writers used for the middle of the island (roughly today’s Villa Clara / Cienfuegos / Sancti Spíritus, with neighbouring Magón, Jagua and Sabana on de la Torre’s map). Drawn as the central piece between Habana and Camagüey. Spanish Trinidad (1514) and Sancti Spíritus (1514) were founded in this belt.',
  timelineItemIds: [...PRE], confidence: CONF.cacicazgo,
  sources: [W('Taíno'), TORRE, W('History of Cuba')],
}, [
  [1200, 'Cubanacán, the central land', { cubanacan: ['Cubanacán', ['CUBANACAN']] }],
  [1492, 'Cubanacán at European contact', { cubanacan: ['Cubanacán', ['CUBANACAN']] }],
  [1513, 'Cubanacán before Trinidad and Sancti Spíritus', { cubanacan: ['Cubanacán', ['CUBANACAN']] }],
]);

// ---- Camagüey -----------------------------------------------------------------------------------

const camaguey = build({
  id: 'camaguey-cacicazgo', name: 'Camagüey (cacicazgo)', color: '#0284C7',
  description: 'The Camagüey (Camagüei) chiefdom of central-east Cuba, on de la Torre’s sequence between Magón and the Oriente chiefdoms. Las Casas described the Caonao massacre near here during the conquest. The Spanish villa of Santa María del Puerto del Príncipe (1514; later Camagüey) was founded in this region.',
  timelineItemIds: [...PRE, 'cu-spanish-conquest'], confidence: CONF.cacicazgo,
  sources: [W('Camagüey'), W('Taíno'), TORRE, LAS_CASAS],
}, [
  [1200, 'Camagüey chiefdom', { camaguey: ['Camagüey', ['CAMAGUEY']] }],
  [1492, 'Camagüey at European contact', { camaguey: ['Camagüey', ['CAMAGUEY']] }],
  [1512, 'Camagüey before Puerto Príncipe', { camaguey: ['Camagüey', ['CAMAGUEY']] }],
]);

// ---- Oriente (Baracoa / Bayamo) -----------------------------------------------------------------

const oriente = build({
  id: 'oriente-cacicazgos', name: 'Oriente (Baracoa & Bayamo)', color: '#7C3AED',
  description: 'The eastern chiefdoms — Maisí, Baracoa, Bayaquitirí, Bayamo, Guacanayabo and neighbours on de la Torre’s map — where Columbus first made landfall (1492) and where Velázquez founded Baracoa (1511). Hatuey, a cacique from Hispaniola, organised resistance here before he was captured and burned. Bayamo and Santiago de Cuba followed as Spanish villas. Drawn as the whole Oriente piece.',
  timelineItemIds: [...PRE, 'cu-columbus', 'cu-spanish-conquest'], confidence: CONF.cacicazgo,
  sources: [W('Baracoa'), W('Hatuey'), W('Bayamo'), TORRE, W('History of Cuba')],
}, [
  [1200, 'Eastern Taíno chiefdoms (Baracoa, Bayamo)', { oriente: ['Oriente', ['ORIENTE']] }],
  [1492, 'Columbus on the north-east coast', { oriente: ['Oriente', ['ORIENTE']] }],
  [1510, 'Oriente on the eve of Velázquez', { oriente: ['Oriente', ['ORIENTE']] }],
]);

// ---- Spanish Cuba, 1511–1815 --------------------------------------------------------------------

const ALL = ['ORIENTE', 'CAMAGUEY', 'CUBANACAN', 'HABANA', 'GUANAHATABEY'];

const spanishCuba = build({
  id: 'spanish-cuba', name: 'Spanish Cuba', color: '#B91C1C',
  description: 'Diego Velázquez founded Baracoa in 1511 and, within four years, a chain of villas across the island; Havana’s present harbour site dates to 1519. Cuba became Spain’s Caribbean hub for the treasure fleets, sugar and tobacco, worked first by encomienda labour and then by enslaved Africans. Britain held Havana and western Cuba from August 1762 to early 1763 (Treaty of Paris). From 1815 the nations layer continues Spanish Cuba to 1898.',
  nameAt: [[1511, 'Spanish Cuba'], [1762, 'Spanish Cuba (British Havana, 1762–63)'], [1763, 'Spanish Cuba']],
  timelineItemIds: ['cu-spanish-conquest', 'cu-havana', 'cu-sugar-slavery', 'cu-british-havana'], confidence: CONF.spanish,
  sources: [W('Captaincy General of Cuba'), W('Diego Velázquez de Cuéllar'), W('Battle of Havana (1762)'), W('History of Cuba')],
}, [
  [1511, 'Velázquez founds Baracoa (1511)', { oriente: ['Baracoa and Oriente', ['ORIENTE']] }],
  [1513, 'Bayamo, Santiago; conquest moves west', { oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']] }],
  [1514, 'Trinidad, Sancti Spíritus, Puerto Príncipe, first Havana', {
    oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']],
    cubanacan: ['Cubanacán', ['CUBANACAN']], habana: ['Habana', ['HABANA']],
  }],
  [1515, 'Island under Spanish villas', {
    oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']],
    cubanacan: ['Cubanacán', ['CUBANACAN']], habana: ['Habana', ['HABANA']],
    guanahatabey: ['Far west', ['GUANAHATABEY']],
  }],
  [1519, 'Havana on the north harbour; Cortés sails for Mexico', {
    oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']],
    cubanacan: ['Cubanacán', ['CUBANACAN']], habana: ['Habana', ['HABANA']],
    guanahatabey: ['Far west', ['GUANAHATABEY']],
  }],
  [1600, 'Treasure-fleet hub; El Morro begun 1589', {
    oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']],
    cubanacan: ['Cubanacán', ['CUBANACAN']], habana: ['Habana', ['HABANA']],
    guanahatabey: ['Far west', ['GUANAHATABEY']],
  }],
  [1700, 'Bourbon-era Cuba', {
    oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']],
    cubanacan: ['Cubanacán', ['CUBANACAN']], habana: ['Habana', ['HABANA']],
    guanahatabey: ['Far west', ['GUANAHATABEY']],
  }],
  [1762, 'Britain takes Havana (August 1762)', {
    oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']],
    cubanacan: ['Cubanacán', ['CUBANACAN']], habana: ['Habana (British)', ['HABANA']],
    guanahatabey: ['Far west', ['GUANAHATABEY']],
  }],
  [1763, 'Havana returned to Spain (Treaty of Paris)', {
    oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']],
    cubanacan: ['Cubanacán', ['CUBANACAN']], habana: ['Habana', ['HABANA']],
    guanahatabey: ['Far west', ['GUANAHATABEY']],
  }],
  [1815, 'Spanish Cuba on the eve of the sugar century', {
    oriente: ['Oriente', ['ORIENTE']], camaguey: ['Camagüey', ['CAMAGUEY']],
    cubanacan: ['Cubanacán', ['CUBANACAN']], habana: ['Habana', ['HABANA']],
    guanahatabey: ['Far west', ['GUANAHATABEY']],
  }],
]);

export const cubaPolities = [guanahatabey, habana, cubanacan, camaguey, oriente, spanishCuba];

// ---- Fixes to older shapes over Cuba ------------------------------------------------------------
//
// The Spanish Empire's schematic 'caribbean' ring (Cuba + Hispaniola + Jamaica + Puerto Rico from
// 1550, before Velázquez finished the conquest) is dropped: Spanish Cuba is drawn above. Hispaniola,
// Jamaica and Puerto Rico wait for their own packs for a Spanish outline.

export const cubaShapeFixes = { 'spanish-empire': { dropRegions: ['caribbean'] } };

/** Apply `cubaShapeFixes` (throws if a target is missing). */
export function applyCubaShapeFixes(entities) {
  for (const [id, { dropRegions }] of Object.entries(cubaShapeFixes)) {
    const ent = entities.find((e) => e.id === id);
    if (!ent) throw new Error(`cuba fixes: no entity ${id}`);
    let dropped = 0;
    for (const kf of ent.overlays) {
      const before = kf.regions.length;
      kf.regions = kf.regions.filter((r) => !dropRegions.includes(typeof r === 'string' ? r : r.id));
      dropped += before - kf.regions.length;
    }
    if (!dropped) throw new Error(`cuba fixes: ${id} has no ${dropRegions.join(', ')} region`);
  }
}
