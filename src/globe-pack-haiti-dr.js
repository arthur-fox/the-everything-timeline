/**
 * Day 79 — Phase 5 country pack 3, Caribbean and Central America: Haiti / Dominican Republic
 * (ROADMAP item 12, after Cuba).
 *
 * Hispaniola had no country timelines, and on the globe before 1815 only the schematic Spanish Empire
 * 'caribbean' ring (dropped by the Cuba pack) and similar British / French / Dutch Caribbean
 * footholds meant for other islands. Nothing showed the five Taíno cacicazgos of Ayiti / Quisqueya,
 * Spanish Santo Domingo, French Saint-Domingue, or the revolutionary states that became Haiti. This
 * module draws the island from the late pre-Columbian chiefdoms to 1815:
 *
 *   Marién · Magua · Maguana · Jaragua · Higüey · Spanish Santo Domingo · French Saint-Domingue · Haiti · España Boba
 *
 * From 1815 the nations layer takes over (Haiti; Spanish Santo Domingo / Dominican Republic after
 * 1844), so no keyframe here is later than 1815. Boyer’s unification, Dominican independence,
 * Trujillo, the Duvaliers and the rest are timeline items with pins.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - The island is cut into 5 "pieces" (HT_PIECES) from the globe’s own Hispaniola land
 *    (src/data/nations.topo.json shape 430 = Haiti 1822–44 whole-island outline), clipped on a
 *    latitude line (~19.05°N) and a longitude line (~70.15°W) plus the modern Haiti/DR shore so
 *    neighbouring pieces share cut edges and never overlap. Coasts are the land’s own coast.
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - The Spanish Empire’s schematic 'caribbean' ring is already dropped by the Cuba pack; Spanish
 *    Santo Domingo is drawn above. French / British / Dutch Caribbean footholds stay on the Lesser
 *    Antilles schematics and do not cover this island.
 */

import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });

// ---- Pieces ([lng, lat], clipped from nations.topo.json Hispaniola shape) -----------------------

export const HT_PIECES = {
  "MARIEN": [
    [
      -72.82,
      19.078
    ],
    [
      -72.715,
      19.105
    ],
    [
      -72.802,
      19.231
    ],
    [
      -72.697,
      19.446
    ],
    [
      -73.122,
      19.628
    ],
    [
      -73.41,
      19.635
    ],
    [
      -73.432,
      19.779
    ],
    [
      -73.165,
      19.938
    ],
    [
      -73.075,
      19.913
    ],
    [
      -72.776,
      19.943
    ],
    [
      -72.564,
      19.875
    ],
    [
      -72.384,
      19.811
    ],
    [
      -72.33,
      19.753
    ],
    [
      -72.049,
      19.712
    ],
    [
      -71.97,
      19.733
    ],
    [
      -71.823,
      19.656
    ],
    [
      -71.758,
      19.711
    ],
    [
      -71.747,
      19.649
    ],
    [
      -71.704,
      19.415
    ],
    [
      -71.751,
      19.28
    ],
    [
      -71.653,
      19.217
    ],
    [
      -71.642,
      19.152
    ],
    [
      -71.734,
      19.05
    ],
    [
      -72.796,
      19.05
    ],
    [
      -72.82,
      19.078
    ]
  ],
  "JARAGUA": [
    [
      -72.796,
      19.05
    ],
    [
      -71.734,
      19.05
    ],
    [
      -71.783,
      18.996
    ],
    [
      -71.718,
      18.784
    ],
    [
      -71.787,
      18.685
    ],
    [
      -71.79,
      18.681
    ],
    [
      -71.841,
      18.618
    ],
    [
      -72.01,
      18.599
    ],
    [
      -71.912,
      18.43
    ],
    [
      -71.722,
      18.294
    ],
    [
      -71.765,
      18.22
    ],
    [
      -71.776,
      18.04
    ],
    [
      -71.927,
      18.183
    ],
    [
      -72.071,
      18.238
    ],
    [
      -72.557,
      18.221
    ],
    [
      -72.55,
      18.182
    ],
    [
      -72.885,
      18.142
    ],
    [
      -73.007,
      18.181
    ],
    [
      -73.309,
      18.252
    ],
    [
      -73.648,
      18.259
    ],
    [
      -73.846,
      18.115
    ],
    [
      -73.874,
      18.026
    ],
    [
      -73.968,
      18.142
    ],
    [
      -74.184,
      18.294
    ],
    [
      -74.332,
      18.287
    ],
    [
      -74.454,
      18.36
    ],
    [
      -74.49,
      18.43
    ],
    [
      -74.425,
      18.608
    ],
    [
      -74.278,
      18.667
    ],
    [
      -74.159,
      18.659
    ],
    [
      -73.81,
      18.543
    ],
    [
      -73.738,
      18.544
    ],
    [
      -73.605,
      18.498
    ],
    [
      -73.525,
      18.523
    ],
    [
      -73.057,
      18.458
    ],
    [
      -72.755,
      18.43
    ],
    [
      -72.629,
      18.554
    ],
    [
      -72.37,
      18.526
    ],
    [
      -72.326,
      18.671
    ],
    [
      -72.55,
      18.785
    ],
    [
      -72.704,
      18.944
    ],
    [
      -72.796,
      19.05
    ]
  ],
  "MAGUA": [
    [
      -71.642,
      19.152
    ],
    [
      -71.653,
      19.217
    ],
    [
      -71.751,
      19.28
    ],
    [
      -71.704,
      19.415
    ],
    [
      -71.747,
      19.649
    ],
    [
      -71.758,
      19.711
    ],
    [
      -71.743,
      19.817
    ],
    [
      -71.668,
      19.886
    ],
    [
      -71.506,
      19.91
    ],
    [
      -71.221,
      19.835
    ],
    [
      -71.02,
      19.935
    ],
    [
      -70.832,
      19.903
    ],
    [
      -70.624,
      19.766
    ],
    [
      -70.433,
      19.775
    ],
    [
      -70.372,
      19.715
    ],
    [
      -70.3,
      19.658
    ],
    [
      -70.094,
      19.637
    ],
    [
      -69.947,
      19.679
    ],
    [
      -69.897,
      19.635
    ],
    [
      -69.868,
      19.425
    ],
    [
      -69.77,
      19.304
    ],
    [
      -69.54,
      19.34
    ],
    [
      -69.335,
      19.294
    ],
    [
      -69.231,
      19.364
    ],
    [
      -69.166,
      19.307
    ],
    [
      -69.252,
      19.184
    ],
    [
      -69.601,
      19.229
    ],
    [
      -69.619,
      19.102
    ],
    [
      -69.385,
      19.096
    ],
    [
      -69.279,
      19.05
    ],
    [
      -71.734,
      19.05
    ],
    [
      -71.642,
      19.152
    ]
  ],
  "MAGUANA": [
    [
      -71.722,
      18.294
    ],
    [
      -71.912,
      18.43
    ],
    [
      -72.01,
      18.599
    ],
    [
      -71.841,
      18.618
    ],
    [
      -71.79,
      18.681
    ],
    [
      -71.787,
      18.685
    ],
    [
      -71.718,
      18.784
    ],
    [
      -71.783,
      18.996
    ],
    [
      -71.734,
      19.05
    ],
    [
      -70.15,
      19.05
    ],
    [
      -70.15,
      18.266
    ],
    [
      -70.181,
      18.234
    ],
    [
      -70.397,
      18.238
    ],
    [
      -70.552,
      18.204
    ],
    [
      -70.581,
      18.271
    ],
    [
      -70.581,
      18.386
    ],
    [
      -70.703,
      18.43
    ],
    [
      -70.76,
      18.348
    ],
    [
      -70.966,
      18.261
    ],
    [
      -71.085,
      18.305
    ],
    [
      -71.059,
      18.142
    ],
    [
      -71.203,
      17.912
    ],
    [
      -71.282,
      17.853
    ],
    [
      -71.416,
      17.605
    ],
    [
      -71.516,
      17.738
    ],
    [
      -71.678,
      17.765
    ],
    [
      -71.632,
      17.817
    ],
    [
      -71.66,
      17.953
    ],
    [
      -71.776,
      18.04
    ],
    [
      -71.765,
      18.22
    ],
    [
      -71.722,
      18.294
    ]
  ],
  "HIGUEY": [
    [
      -69.28,
      19.05
    ],
    [
      -69.213,
      19.021
    ],
    [
      -69.054,
      18.978
    ],
    [
      -68.978,
      19.033
    ],
    [
      -68.784,
      18.98
    ],
    [
      -68.356,
      18.657
    ],
    [
      -68.334,
      18.578
    ],
    [
      -68.518,
      18.348
    ],
    [
      -68.59,
      18.383
    ],
    [
      -68.658,
      18.211
    ],
    [
      -68.759,
      18.21
    ],
    [
      -68.788,
      18.295
    ],
    [
      -68.899,
      18.404
    ],
    [
      -69.087,
      18.397
    ],
    [
      -69.238,
      18.451
    ],
    [
      -69.529,
      18.41
    ],
    [
      -69.616,
      18.458
    ],
    [
      -69.879,
      18.472
    ],
    [
      -69.979,
      18.426
    ],
    [
      -70.004,
      18.418
    ],
    [
      -70.15,
      18.266
    ],
    [
      -70.15,
      19.05
    ],
    [
      -69.28,
      19.05
    ]
  ],
};
const P = (names) => names.map((n) => {
  if (!HT_PIECES[n]) throw new Error(`haiti-dr pack: no piece ${n}`);
  return HT_PIECES[n];
});

export const HT_STEPS = {};
function build(meta, steps) {
  HT_STEPS[meta.id] = steps;
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
  cacicazgo: {
    level: 'conjectural',
    reason: 'The five named cacicazgos of Hispaniola (Marién, Magua, Maguana, Jaragua, Higüey) come from early Spanish reports (las Casas, Oviedo) and later reconstructions. A cacicazgo was a chiefdom of allied villages under a cacique, not a surveyed territory; latitude and longitude cuts stand in for the rough north–south and east–west sequence on those maps.',
  },
  spanish: {
    level: 'approximate',
    reason: 'Founding years of La Isabela (1493) and Santo Domingo (1496) are well dated; Spanish rule meant towns, encomiendas and the coast, with the interior thinly held. The west was ceded to France at Ryswick (1697); Spain recovered the east in 1809 (España Boba). Outlines use the globe’s own Hispaniola land.',
  },
  french: {
    level: 'approximate',
    reason: 'French settlement from Tortuga and the north-west shore is attested from the mid-17th century; the Treaty of Ryswick (1697) recognised French Saint-Domingue on the west of the island. The Peace of Basel (1795) briefly gave France the Spanish east as well. The outline is the west (and, for 1795–1803, the whole island) from the globe’s coastline.',
  },
  haiti: {
    level: 'approximate',
    reason: 'Haitian independence (1 Jan 1804) is exact; Dessalines’s empire, then the northern state/kingdom of Christophe and the southern republic of Pétion (from 1807), are well documented. Shapes stop in 1815; the nations layer continues Haiti thereafter.',
  },
};

const PRE_HT = ['ht-taino-cacicazgos'];
const PRE_DO = ['do-taino-cacicazgos'];

// ---- Marién -------------------------------------------------------------------------------------

const marien = build({
  id: 'marien-cacicazgo', name: 'Marién', color: '#65A30D',
  description: 'The north-western Taíno cacicazgo of Ayiti, under Guacanagarí at European contact. Columbus’s La Navidad was built in Marién from the wreck of the Santa María (1492); Guacanagarí allied with the Spanish. Drawn as the north-west piece (modern Nord / Nord-Ouest Haiti); it leaves the map as Spanish rule consolidates after 1500.',
  timelineItemIds: [...PRE_HT, 'ht-columbus-navidad', ...PRE_DO], confidence: CONF.cacicazgo,
  sources: [W('Chiefdoms of Hispaniola'), W('Guacanagaríx'), W('Taíno'), W('History of Haiti')],
}, [
  [1200, 'Marién chiefdom of the north-west', { marien: ['Marién', ['MARIEN']] }],
  [1492, 'Guacanagarí; La Navidad in Marién', { marien: ['Marién', ['MARIEN']] }],
  [1503, 'Marién on the eve of full Spanish rule', { marien: ['Marién', ['MARIEN']] }],
]);

// ---- Magua --------------------------------------------------------------------------------------

const magua = build({
  id: 'magua-cacicazgo', name: 'Magua', color: '#DB2777',
  description: 'The northern Taíno cacicazgo of Quisqueya (the Cibao), under Guarionex. Columbus’s La Isabela (1493) stood on this coast; Guarionex’s defeat in the late 1490s opened the north to Spanish settlement. Drawn as the north-DR piece.',
  timelineItemIds: [...PRE_DO, 'do-columbus-isabela', ...PRE_HT], confidence: CONF.cacicazgo,
  sources: [W('Chiefdoms of Hispaniola'), W('Guarionex'), W('La Isabela'), W('History of the Dominican Republic')],
}, [
  [1200, 'Magua chiefdom of the Cibao', { magua: ['Magua', ['MAGUA']] }],
  [1400, 'Magua of the Cibao', { magua: ['Magua', ['MAGUA']] }],
  [1492, 'Magua at European contact', { magua: ['Magua', ['MAGUA']] }],
]);

// ---- Maguana ------------------------------------------------------------------------------------

const maguana = build({
  id: 'maguana-cacicazgo', name: 'Maguana', color: '#EA580C',
  description: 'The central Taíno cacicazgo under Caonabo, whose seat was near today’s San Juan de la Maguana. Caonabo led the destruction of La Navidad (1493) and was captured by Alonso de Ojeda. Drawn as the south-central piece west of Higüey.',
  timelineItemIds: [...PRE_DO, ...PRE_HT, 'do-enriquillo'], confidence: CONF.cacicazgo,
  sources: [W('Chiefdoms of Hispaniola'), W('Caonabo'), W('San Juan de la Maguana'), W('Taíno')],
}, [
  [1200, 'Maguana chiefdom of the centre', { maguana: ['Maguana', ['MAGUANA']] }],
  [1492, 'Caonabo’s Maguana at contact', { maguana: ['Maguana', ['MAGUANA']] }],
  [1495, 'Maguana after Caonabo’s capture', { maguana: ['Maguana', ['MAGUANA']] }],
]);

// ---- Jaragua ------------------------------------------------------------------------------------

const jaragua = build({
  id: 'jaragua-cacicazgo', name: 'Jaragua', color: '#0284C7',
  description: 'The south-western Taíno cacicazgo (also Xaragua), the largest and last to fall, under Bohechío and then Anacaona. Ovando’s massacre at Jaragua (1503) and Anacaona’s execution broke organised Taíno power in the west. Drawn as the south-west piece (modern Ouest / Sud Haiti, including the site of later Port-au-Prince).',
  timelineItemIds: [...PRE_HT, 'ht-spanish-conquest', ...PRE_DO], confidence: CONF.cacicazgo,
  sources: [W('Chiefdoms of Hispaniola'), W('Anacaona'), W('Jaragua'), W('History of Haiti')],
}, [
  [1200, 'Jaragua chiefdom of the south-west', { jaragua: ['Jaragua', ['JARAGUA']] }],
  [1492, 'Jaragua at European contact', { jaragua: ['Jaragua', ['JARAGUA']] }],
  [1503, 'Jaragua before Ovando’s massacre', { jaragua: ['Jaragua', ['JARAGUA']] }],
]);

// ---- Higüey -------------------------------------------------------------------------------------

const higuey = build({
  id: 'higuey-cacicazgo', name: 'Higüey', color: '#7C3AED',
  description: 'The eastern Taíno cacicazgo under Cayacoa and later Cotubanamá (Juan de Esperita). Juan de Esquivel’s campaign (1502–04) subdued the east; Santo Domingo, founded 1496 on the Ozama, lay on its western edge. Drawn as the eastern piece.',
  timelineItemIds: [...PRE_DO, 'do-santo-domingo', ...PRE_HT], confidence: CONF.cacicazgo,
  sources: [W('Chiefdoms of Hispaniola'), W('Higüey'), W('Cotubanamá'), W('History of the Dominican Republic')],
}, [
  [1200, 'Higüey chiefdom of the east', { higuey: ['Higüey', ['HIGUEY']] }],
  [1492, 'Higüey at European contact', { higuey: ['Higüey', ['HIGUEY']] }],
  [1495, 'Higüey on the eve of Santo Domingo’s rise', { higuey: ['Higüey', ['HIGUEY']] }],
]);

// ---- Spanish Santo Domingo ----------------------------------------------------------------------

const WEST = ['MARIEN', 'JARAGUA'];
const EAST = ['MAGUA', 'MAGUANA', 'HIGUEY'];
const ALL = ['MARIEN', 'JARAGUA', 'MAGUA', 'MAGUANA', 'HIGUEY'];

const spanishSD = build({
  id: 'spanish-santo-domingo', name: 'Spanish Santo Domingo', color: '#B91C1C',
  description: 'Spain’s first permanent American colony. La Isabela (1493) and Santo Domingo (1496) anchored the conquest; by the 1500s the island was under Spanish villas and encomiendas. The west was ceded to France at Ryswick (1697). At the Peace of Basel (1795) Spain also ceded the east to France, so this shape ends then; Spain’s return in 1809 is drawn as España Boba below.',
  nameAt: [
    [1493, 'Spanish Santo Domingo'],
    [1697, 'Spanish Santo Domingo (east)'],
  ],
  timelineItemIds: ['do-columbus-isabela', 'do-santo-domingo', 'do-spanish-colony', 'ht-spanish-conquest'],
  confidence: CONF.spanish,
  sources: [W('Captaincy General of Santo Domingo'), W('Santo Domingo'), W('Treaty of Ryswick'), W('Peace of Basel'), W('History of the Dominican Republic')],
}, [
  [1493, 'La Isabela founded (1493)', { magua: ['La Isabela / Magua', ['MAGUA']] }],
  [1496, 'Santo Domingo founded on the Ozama', { magua: ['North', ['MAGUA']], higuey: ['Santo Domingo / Higüey', ['HIGUEY']] }],
  [1502, 'Ovando consolidates the centre and east', {
    magua: ['Magua', ['MAGUA']], maguana: ['Maguana', ['MAGUANA']], higuey: ['Higüey', ['HIGUEY']],
  }],
  [1504, 'Island under Spanish rule', {
    marien: ['Marién', ['MARIEN']], jaragua: ['Jaragua', ['JARAGUA']],
    magua: ['Magua', ['MAGUA']], maguana: ['Maguana', ['MAGUANA']], higuey: ['Higüey', ['HIGUEY']],
  }],
  [1600, 'Captaincy General of Santo Domingo', {
    marien: ['West', ['MARIEN']], jaragua: ['South-west', ['JARAGUA']],
    magua: ['Cibao', ['MAGUA']], maguana: ['Centre', ['MAGUANA']], higuey: ['East', ['HIGUEY']],
  }],
  [1697, 'East kept after Ryswick; west to France', {
    magua: ['Cibao', ['MAGUA']], maguana: ['Centre', ['MAGUANA']], higuey: ['East', ['HIGUEY']],
  }],
  [1794, 'Spanish east on the eve of Basel', {
    magua: ['Cibao', ['MAGUA']], maguana: ['Centre', ['MAGUANA']], higuey: ['East', ['HIGUEY']],
  }],
]);

// ---- España Boba (Spanish return, 1809–1815) ----------------------------------------------------

const espanaBoba = build({
  id: 'espana-boba', name: 'España Boba', color: '#9F1239',
  description: 'Spain recovered the eastern part of Hispaniola from France in 1809, during the Peninsular War — a poorly resourced colony remembered in Dominican history as España Boba (“Foolish Spain”). It runs to 1815 on this pack; the nations layer continues Spanish Santo Domingo to the ephemeral independence of 1821 and Boyer’s occupation.',
  timelineItemIds: ['do-espana-boba', 'do-spanish-colony', 'ht-independence-1804'],
  confidence: CONF.spanish,
  sources: [W('España Boba'), W('Captaincy General of Santo Domingo'), W('History of the Dominican Republic')],
}, [
  [1809, 'Spain recovers the east (1809)', {
    magua: ['Cibao', ['MAGUA']], maguana: ['Centre', ['MAGUANA']], higuey: ['East', ['HIGUEY']],
  }],
  [1812, 'España Boba', {
    magua: ['Cibao', ['MAGUA']], maguana: ['Centre', ['MAGUANA']], higuey: ['East', ['HIGUEY']],
  }],
  [1815, 'Spanish east on the eve of independence', {
    magua: ['Cibao', ['MAGUA']], maguana: ['Centre', ['MAGUANA']], higuey: ['East', ['HIGUEY']],
  }],
]);

// ---- French Saint-Domingue ----------------------------------------------------------------------

const frenchSD = build({
  id: 'french-saint-domingue', name: 'French Saint-Domingue', color: '#2563EB',
  description: 'The French colony on the west of Hispaniola, recognised at Ryswick (1697) after decades of flibuste and settlement from Tortuga. By the 1780s it was the richest sugar colony in the Americas, worked by a vast enslaved African majority. The Peace of Basel (1795) added the Spanish east; Toussaint Louverture governed the whole island for France before the Leclerc expedition. French rule ends with Dessalines’s victory (1803) and Haitian independence (1804).',
  nameAt: [
    [1697, 'French Saint-Domingue'],
    [1795, 'French Saint-Domingue (whole island)'],
    [1801, 'Saint-Domingue under Toussaint'],
  ],
  timelineItemIds: ['ht-saint-domingue', 'ht-sugar-slavery', 'ht-haitian-revolution', 'do-toussaint-occupation'],
  confidence: CONF.french,
  sources: [W('Saint-Domingue'), W('Treaty of Ryswick'), W('Peace of Basel'), W('Toussaint Louverture'), W('History of Haiti')],
}, [
  [1697, 'Saint-Domingue recognised (Ryswick)', {
    marien: ['North', ['MARIEN']], jaragua: ['South', ['JARAGUA']],
  }],
  [1750, 'Sugar colony at its height', {
    marien: ['North', ['MARIEN']], jaragua: ['South', ['JARAGUA']],
  }],
  [1789, 'On the eve of the Revolution', {
    marien: ['North', ['MARIEN']], jaragua: ['South', ['JARAGUA']],
  }],
  [1796, 'Basel (1795): France claims the whole island', {
    marien: ['North', ['MARIEN']], jaragua: ['South', ['JARAGUA']],
    magua: ['Cibao', ['MAGUA']], maguana: ['Centre', ['MAGUANA']], higuey: ['East', ['HIGUEY']],
  }],
  [1801, 'Toussaint’s constitution; whole island', {
    marien: ['North', ['MARIEN']], jaragua: ['South', ['JARAGUA']],
    magua: ['Cibao', ['MAGUA']], maguana: ['Centre', ['MAGUANA']], higuey: ['East', ['HIGUEY']],
  }],
  [1803, 'French defeat at Vertières (Nov 1803)', {
    marien: ['North', ['MARIEN']], jaragua: ['South', ['JARAGUA']],
  }],
]);

// ---- Haiti (1804–1815) --------------------------------------------------------------------------

const haiti = build({
  id: 'haiti-1804', name: 'Haiti', color: '#0F766E',
  description: 'Independence was declared at Gonaïves on 1 January 1804 — the first Black republic and the only state born of a successful slave revolution. Dessalines’s empire (1804–06) gave way to a north–south split: Henry Christophe’s northern state (later kingdom) and Alexandre Pétion’s southern republic. Shapes stop in 1815; Boyer reunified Haiti in 1820 and occupied the east 1822–44 (nations layer / timeline).',
  nameAt: [
    [1804, 'Empire of Haiti (Dessalines)'],
    [1807, 'Haiti (Christophe north / Pétion south)'],
    [1811, 'Kingdom of Haiti (north) & Republic (south)'],
  ],
  timelineItemIds: ['ht-independence-1804', 'ht-dessalines', 'ht-christophe-petion'],
  confidence: CONF.haiti,
  sources: [W('Haitian Independence'), W('Jean-Jacques Dessalines'), W('Henri Christophe'), W('Alexandre Pétion'), W('History of Haiti')],
}, [
  [1804, 'Independence; Empire of Haiti', {
    marien: ['North', ['MARIEN']], jaragua: ['South', ['JARAGUA']],
  }],
  [1807, 'Christophe in the north, Pétion in the south', {
    marien: ['State of Haiti (Christophe)', ['MARIEN']],
    jaragua: ['Republic of Haiti (Pétion)', ['JARAGUA']],
  }],
  [1811, 'Christophe’s kingdom; Pétion’s republic', {
    marien: ['Kingdom of Haiti', ['MARIEN']],
    jaragua: ['Republic of Haiti', ['JARAGUA']],
  }],
  [1815, 'Split Haiti on the eve of Boyer’s rise', {
    marien: ['Kingdom of Haiti', ['MARIEN']],
    jaragua: ['Republic of Haiti', ['JARAGUA']],
  }],
]);

export const haitiDrPolities = [marien, magua, maguana, jaragua, higuey, spanishSD, frenchSD, haiti, espanaBoba];

// ---- Fixes to older shapes over Hispaniola ------------------------------------------------------
//
// The Spanish Empire's schematic 'caribbean' ring is already dropped by the Cuba pack
// (applyCubaShapeFixes). No further drop is required for French/British/Dutch Caribbean footholds:
// those schematic rings sit on the Lesser Antilles, not over this island.

export const haitiDrShapeFixes = {};

/** Apply `haitiDrShapeFixes` (no-op today; kept for pack symmetry / future trims). */
export function applyHaitiDrShapeFixes(entities) {
  for (const [id, { dropRegions }] of Object.entries(haitiDrShapeFixes)) {
    const ent = entities.find((e) => e.id === id);
    if (!ent) throw new Error(`haiti-dr fixes: no entity ${id}`);
    let dropped = 0;
    for (const kf of ent.overlays) {
      const before = kf.regions.length;
      kf.regions = kf.regions.filter((r) => !dropRegions.includes(typeof r === 'string' ? r : r.id));
      dropped += before - kf.regions.length;
    }
    if (!dropped) throw new Error(`haiti-dr fixes: ${id} has no ${dropRegions.join(', ')} region`);
  }
}
