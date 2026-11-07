/**
 * Day 80 — Phase 5 country pack 3, Caribbean and Central America: Jamaica (ROADMAP item 12,
 * after Cuba and Haiti/DR).
 *
 * Jamaica had no country timeline, and on the globe before 1815 only the schematic Spanish Empire
 * 'caribbean' ring (dropped by the Cuba pack) and a British Empire 'caribbean' fringe that washed
 * over the island from 1800. Nothing showed Taíno Yamaye, Spanish Jamaica (Sevilla la Nueva /
 * Spanish Town), or British Jamaica as its own colony. This module draws the island from late
 * pre-Columbian chiefdoms to 1815:
 *
 *   Taíno Yamaye · Spanish Jamaica · British Jamaica
 *
 * From 1815 the nations layer takes over (British Jamaica to 1962, then independent Jamaica), so
 * no keyframe here is later than 1815. Port Royal, the Maroons, emancipation, Morant Bay,
 * independence and reggae are timeline items with pins.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - The island is cut into 3 "pieces" (JM_PIECES) from the globe’s own Jamaica land
 *    (src/data/nations.topo.json / nations-fine shape 432), clipped on longitude lines
 *    (−77.55°W, −76.85°W) so neighbouring pieces share cut edges and never overlap. Coasts are
 *    the land’s own coast (fine coastline).
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - The Spanish Empire’s schematic 'caribbean' ring is already dropped by the Cuba pack. The
 *    British Empire’s schematic 'caribbean' fringe (which covered Jamaica from 1800) is dropped
 *    here; British Jamaica is drawn above. French / Dutch Caribbean footholds stay on the Lesser
 *    Antilles schematics. Maroon territories (Leeward / Windward) are timeline + pins only —
 *    Cockpit Country and Blue Mountain holds are too small and poorly bordered to cut honestly
 *    without overlapping British Jamaica.
 */

import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });

// ---- Pieces ([lng, lat], clipped from nations-fine.topo.json Jamaica shape 432) -----------------

export const JM_PIECES = {
  "WEST": [
    [
      -77.55,
      17.854
    ],
    [
      -77.564,
      17.857
    ],
    [
      -77.588,
      17.861
    ],
    [
      -77.724,
      17.853
    ],
    [
      -77.787,
      17.885
    ],
    [
      -77.816,
      17.939
    ],
    [
      -77.84,
      17.95
    ],
    [
      -77.846,
      18.017
    ],
    [
      -77.871,
      18.026
    ],
    [
      -77.94,
      18.027
    ],
    [
      -77.965,
      18.05
    ],
    [
      -77.988,
      18.095
    ],
    [
      -78.02,
      18.113
    ],
    [
      -78.05,
      18.185
    ],
    [
      -78.075,
      18.198
    ],
    [
      -78.148,
      18.197
    ],
    [
      -78.21,
      18.204
    ],
    [
      -78.228,
      18.192
    ],
    [
      -78.261,
      18.204
    ],
    [
      -78.34,
      18.222
    ],
    [
      -78.37,
      18.248
    ],
    [
      -78.375,
      18.266
    ],
    [
      -78.346,
      18.298
    ],
    [
      -78.346,
      18.336
    ],
    [
      -78.332,
      18.367
    ],
    [
      -78.316,
      18.368
    ],
    [
      -78.289,
      18.394
    ],
    [
      -78.271,
      18.389
    ],
    [
      -78.261,
      18.417
    ],
    [
      -78.231,
      18.444
    ],
    [
      -78.195,
      18.456
    ],
    [
      -78.169,
      18.437
    ],
    [
      -78.154,
      18.454
    ],
    [
      -78.097,
      18.443
    ],
    [
      -78.032,
      18.451
    ],
    [
      -78,
      18.447
    ],
    [
      -77.96,
      18.45
    ],
    [
      -77.959,
      18.464
    ],
    [
      -77.93,
      18.502
    ],
    [
      -77.902,
      18.519
    ],
    [
      -77.862,
      18.525
    ],
    [
      -77.816,
      18.523
    ],
    [
      -77.736,
      18.507
    ],
    [
      -77.665,
      18.492
    ],
    [
      -77.568,
      18.49
    ],
    [
      -77.55,
      18.486
    ],
    [
      -77.55,
      17.854
    ]
  ],
  "CENTRAL": [
    [
      -76.85,
      17.992
    ],
    [
      -76.874,
      17.95
    ],
    [
      -76.887,
      17.952
    ],
    [
      -76.912,
      17.861
    ],
    [
      -76.926,
      17.843
    ],
    [
      -76.956,
      17.833
    ],
    [
      -76.983,
      17.847
    ],
    [
      -77.038,
      17.847
    ],
    [
      -77.017,
      17.861
    ],
    [
      -77.041,
      17.887
    ],
    [
      -77.094,
      17.903
    ],
    [
      -77.134,
      17.885
    ],
    [
      -77.162,
      17.841
    ],
    [
      -77.155,
      17.813
    ],
    [
      -77.181,
      17.8
    ],
    [
      -77.175,
      17.778
    ],
    [
      -77.197,
      17.783
    ],
    [
      -77.216,
      17.772
    ],
    [
      -77.18,
      17.758
    ],
    [
      -77.14,
      17.765
    ],
    [
      -77.133,
      17.71
    ],
    [
      -77.158,
      17.703
    ],
    [
      -77.216,
      17.717
    ],
    [
      -77.302,
      17.791
    ],
    [
      -77.32,
      17.813
    ],
    [
      -77.395,
      17.853
    ],
    [
      -77.44,
      17.865
    ],
    [
      -77.48,
      17.844
    ],
    [
      -77.502,
      17.842
    ],
    [
      -77.55,
      17.854
    ],
    [
      -77.55,
      18.486
    ],
    [
      -77.524,
      18.48
    ],
    [
      -77.466,
      18.476
    ],
    [
      -77.408,
      18.457
    ],
    [
      -77.377,
      18.465
    ],
    [
      -77.325,
      18.465
    ],
    [
      -77.236,
      18.45
    ],
    [
      -77.223,
      18.429
    ],
    [
      -77.209,
      18.437
    ],
    [
      -77.164,
      18.429
    ],
    [
      -77.138,
      18.409
    ],
    [
      -77.071,
      18.413
    ],
    [
      -77.052,
      18.416
    ],
    [
      -77.007,
      18.402
    ],
    [
      -76.894,
      18.409
    ],
    [
      -76.891,
      18.376
    ],
    [
      -76.85,
      18.351
    ],
    [
      -76.85,
      17.992
    ]
  ],
  "EAST": [
    [
      -76.63,
      18.226
    ],
    [
      -76.597,
      18.228
    ],
    [
      -76.555,
      18.204
    ],
    [
      -76.479,
      18.204
    ],
    [
      -76.464,
      18.182
    ],
    [
      -76.389,
      18.169
    ],
    [
      -76.351,
      18.156
    ],
    [
      -76.346,
      18.135
    ],
    [
      -76.296,
      18.079
    ],
    [
      -76.257,
      17.996
    ],
    [
      -76.234,
      17.954
    ],
    [
      -76.188,
      17.915
    ],
    [
      -76.25,
      17.895
    ],
    [
      -76.308,
      17.87
    ],
    [
      -76.329,
      17.888
    ],
    [
      -76.363,
      17.861
    ],
    [
      -76.414,
      17.878
    ],
    [
      -76.444,
      17.867
    ],
    [
      -76.524,
      17.86
    ],
    [
      -76.614,
      17.874
    ],
    [
      -76.623,
      17.905
    ],
    [
      -76.657,
      17.93
    ],
    [
      -76.707,
      17.946
    ],
    [
      -76.78,
      17.935
    ],
    [
      -76.832,
      17.937
    ],
    [
      -76.832,
      17.943
    ],
    [
      -76.723,
      17.95
    ],
    [
      -76.728,
      17.954
    ],
    [
      -76.748,
      17.963
    ],
    [
      -76.798,
      17.963
    ],
    [
      -76.813,
      17.971
    ],
    [
      -76.85,
      17.992
    ],
    [
      -76.85,
      18.351
    ],
    [
      -76.813,
      18.328
    ],
    [
      -76.798,
      18.292
    ],
    [
      -76.765,
      18.273
    ],
    [
      -76.701,
      18.267
    ],
    [
      -76.63,
      18.226
    ]
  ]
};

const P = (names) => names.map((n) => {
  if (!JM_PIECES[n]) throw new Error(`jamaica pack: no piece ${n}`);
  return JM_PIECES[n];
});

export const JM_STEPS = {};
function build(meta, steps) {
  JM_STEPS[meta.id] = steps;
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
  taino: {
    level: 'conjectural',
    reason: 'Taíno Yamaye is known from Spanish contact accounts and archaeology, but Jamaica has no surviving map of named cacicazgos comparable to Hispaniola’s five. The outline is the whole island’s land; internal chiefdom borders are not drawn.',
  },
  spanish: {
    level: 'approximate',
    reason: 'Esquivel’s settlement (1509), Sevilla la Nueva on the north coast, and the move to Villa de la Vega / Spanish Town (1534) are well dated. Spanish Jamaica was thinly held; the outline is the island’s own coastline from the globe’s land.',
  },
  british: {
    level: 'approximate',
    reason: 'The English conquest (May 1655) and the Treaty of Madrid (1670) are exact. British Jamaica as a sugar colony is well documented. The outline is the whole island to 1815; Maroon towns are not cut out as separate shapes (see pack caveats).',
  },
};

const PRE = ['jm-taino-yamaye'];

// ---- Taíno Yamaye -------------------------------------------------------------------------------

const tainoYamaye = build({
  id: 'taino-yamaye', name: 'Taíno Yamaye', color: '#65A30D',
  description: 'The Taíno island of Yamaye (Xaymaca) at European contact — village chiefdoms under caciques rather than a single territorial kingdom. Drawn as the whole island from late Ostionoid / Classic Taíno times to the Spanish settlement of 1509–10. Internal chiefdom borders are unknown and not drawn.',
  timelineItemIds: ['jm-early-peoples', ...PRE, 'jm-columbus'], confidence: CONF.taino,
  sources: [W('Taíno'), W('History of Jamaica'), W('Jamaica')],
}, [
  [1200, 'Taíno Yamaye', { yamaye: ['Yamaye', ['WEST', 'CENTRAL', 'EAST']] }],
  [1494, 'Columbus lands; Yamaye at contact', { yamaye: ['Yamaye', ['WEST', 'CENTRAL', 'EAST']] }],
  [1508, 'Yamaye on the eve of Esquivel', { yamaye: ['Yamaye', ['WEST', 'CENTRAL', 'EAST']] }],
]);

// ---- Spanish Jamaica ----------------------------------------------------------------------------

const spanishJamaica = build({
  id: 'spanish-jamaica', name: 'Spanish Jamaica', color: '#B91C1C',
  description: 'Spain’s Colony of Santiago. Juan de Esquivel settled the north coast in 1509 (Sevilla la Nueva near St Ann’s Bay); the capital moved to Villa de la Vega (Spanish Town) in 1534. Jamaica remained a thinly peopled Spanish frontier of cattle and pigs until the English conquest of 1655.',
  nameAt: [
    [1509, 'Spanish Jamaica (Sevilla la Nueva)'],
    [1534, 'Spanish Jamaica (Villa de la Vega)'],
  ],
  timelineItemIds: ['jm-spanish-jamaica', 'jm-columbus'], confidence: CONF.spanish,
  sources: [W('Colony of Santiago (Jamaica)'), W('Sevilla la Nueva'), W('Spanish Town, Jamaica'), W('History of Jamaica')],
}, [
  [1509, 'Esquivel settles Sevilla la Nueva (1509)', {
    central: ['North / Sevilla la Nueva', ['CENTRAL']],
  }],
  [1511, 'Spanish hold spreads from the north coast', {
    central: ['Centre', ['CENTRAL']], west: ['West', ['WEST']],
  }],
  [1534, 'Capital at Villa de la Vega (Spanish Town)', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
  [1600, 'Thin Spanish frontier', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
  [1654, 'Spanish Jamaica on the eve of conquest', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
]);

// ---- British Jamaica ----------------------------------------------------------------------------

const britishJamaica = build({
  id: 'british-jamaica', name: 'British Jamaica', color: '#1D4ED8',
  description: 'England took Jamaica in May 1655 (Western Design). Port Royal became a privateer boomtown until the 1692 earthquake; sugar and enslaved African labour made the island Britain’s premier Caribbean colony. The outline is the whole island to 1815; from then the nations layer continues British Jamaica to independence (1962). Maroon towns recognised by the 1739–40 treaties are not cut out as separate shapes.',
  nameAt: [
    [1655, 'English Jamaica'],
    [1670, 'British Jamaica'],
  ],
  timelineItemIds: ['jm-english-conquest', 'jm-port-royal', 'jm-sugar-slavery', 'jm-maroons'], confidence: CONF.british,
  sources: [W('Invasion of Jamaica'), W('Colony of Jamaica'), W('History of Jamaica'), W('Treaty of Madrid (1670)')],
}, [
  [1655, 'Penn and Venables take Jamaica (May 1655)', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
  [1670, 'Treaty of Madrid confirms English possession', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
  [1692, 'Port Royal earthquake; Kingston founded', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
  [1739, 'Maroon treaties; sugar colony', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
  [1760, 'Tacky’s War year', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
  [1815, 'British Jamaica on the eve of the nations layer', {
    west: ['West', ['WEST']], central: ['Centre', ['CENTRAL']], east: ['East', ['EAST']],
  }],
]);

export const jamaicaPolities = [tainoYamaye, spanishJamaica, britishJamaica];

// ---- Fixes to older shapes over Jamaica ---------------------------------------------------------
//
// Spanish Empire 'caribbean' is already dropped by the Cuba pack. The British Empire's schematic
// 'caribbean' fringe (1800–1920 keyframes) washed over Jamaica; drop it so British Jamaica is the
// island's outline. Colonial Americas' schematic 'caribbean' also covers Jamaica — drop that region
// too. French / Dutch Caribbean footholds stay on the Lesser Antilles.

export const jamaicaShapeFixes = {
  'british-empire': { dropRegions: ['caribbean'] },
  'colonial-americas': { dropRegions: ['caribbean'] },
};

/** Apply `jamaicaShapeFixes` (throws if a target is missing). */
export function applyJamaicaShapeFixes(entities) {
  for (const [id, { dropRegions }] of Object.entries(jamaicaShapeFixes)) {
    const ent = entities.find((e) => e.id === id);
    if (!ent) throw new Error(`jamaica fixes: no entity ${id}`);
    let dropped = 0;
    for (const kf of ent.overlays) {
      const before = kf.regions.length;
      kf.regions = kf.regions.filter((r) => !dropRegions.includes(typeof r === 'string' ? r : r.id));
      dropped += before - kf.regions.length;
    }
    if (!dropped) throw new Error(`jamaica fixes: ${id} has no ${dropRegions.join(', ')} region`);
  }
}
