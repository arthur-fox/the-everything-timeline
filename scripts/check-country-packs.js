/**
 * Day 65: checks for Phase 5 country-pack globe backfills (ROADMAP item 12), starting with Peru
 * (src/globe-pack-peru.js), Ghana (Day 66, src/globe-pack-ghana.js), Morocco (Day 68,
 * src/globe-pack-morocco.js), Kenya (Day 69, src/globe-pack-kenya.js), Iraq (Day 70,
 * src/globe-pack-iraq.js), the Philippines (Day 71, src/globe-pack-philippines.js) and
 * Uzbekistan (Day 72, src/globe-pack-uzbekistan.js) and Kazakhstan (Day 73,
 * src/globe-pack-kazakhstan.js). Add a pack to PACKS to cover it. `PACK=<country>` checks one pack.
 *  - every ring is closed and does not cross itself;
 *  - shapes stay on land: every vertex is on land or the coast, and ≥97% of an interior grid is
 *    on land (no Pacific spill), for the pack's polities and the shapes it redrew;
 *  - every polity has sources, confidence with a reason, ≥3 keyframes, no keyframe after 1815 and
 *    timeline links that exist (country items or civilisations);
 *  - capitals / type sites sit inside (or within ~10 km of the coast-hugging edge of) their polity;
 *  - who is on and who is gone at sample years, and the anachronisms the pack fixed stay fixed;
 *  - (Day 66+) the pack's shapes never overlap each other — and (Day 68) the neighbours it lists —
 *    at any sampled year, and (Day 68) each coastal enclave is drawn by exactly one shape;
 *  - (Day 69) a region the pack dropped from an older shape stays dropped (`dropped`);
 *  - (Day 70) whole shapes a pack replaces are gone (`droppedEntities`), and shapes it only trimmed
 *    back (schematic rings that run through the sea, so not land-checked) have a notOver test that
 *    proves the trim (`trimmed`);
 *  - (Day 71) an archipelago pack can set `fineLand` so the land test also accepts the close-zoom
 *    land (nations-fine.topo.json) for islands too small for the simplified shapes (Jolo, Tawi-Tawi).
 */
import fs from 'node:fs';
import { geoContains } from 'd3-geo';
import { peruPolities, peruShapeFixes } from '../src/globe-pack-peru.js';
import { ghanaPolities, ghanaShapeFixes, GOLD_COAST } from '../src/globe-pack-ghana.js';
import { moroccoPolities, moroccoShapeFixes, ENCLAVE_SHAPES, ENCLAVE_RULE } from '../src/globe-pack-morocco.js';
import { kenyaPolities, kenyaShapeFixes } from '../src/globe-pack-kenya.js';
import { iraqPolities, iraqShapeFixes, IRAQ_TRIMS } from '../src/globe-pack-iraq.js';
import { philippinesPolities, philippinesShapeFixes } from '../src/globe-pack-philippines.js';
import { uzbekistanPolities, uzbekistanShapeFixes, UZ_TRIMS } from '../src/globe-pack-uzbekistan.js';
import { kazakhstanPolities, kazakhstanShapeFixes } from '../src/globe-pack-kazakhstan.js';
import { MERGE_STATS } from '../src/globe-med-pieces.js';
import { getActiveOverlaysAtYear, getOverlayPolygonFeatures, spatialEntities, resolveRegionRing } from '../src/globe-overlays.js';
import { civilisations } from '../src/civilisations.js';
import { ensureClockwise } from '../src/globe-morph.js';
import { landAt as landAtSimple, landAtFine } from './flow-geo.js';

let failed = 0;
const fail = (m) => {
  failed += 1;
  console.error(`FAIL: ${m}`);
};

function crossings(ring) {
  const o = ring.slice(0, -1);
  const n = o.length;
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const [p1, p2, p3, p4] = [o[i], o[(i + 1) % n], o[j], o[(j + 1) % n]];
      if (d(p3, p4, p1) * d(p3, p4, p2) < 0 && d(p1, p2, p3) * d(p1, p2, p4) < 0) count += 1;
    }
  }
  return count + (o.length - new Set(o.map((p) => p.join())).size);
}

/** Vertices off land, and the share of an interior grid that is on land. */
function landStats(ring, landAt = landAtSimple) {
  const off = ring.filter(([lng, lat]) => !landAt(lat, lng));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of ring) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const step = Math.max(0.1, Math.max(x1 - x0, y1 - y0) / 40);
  const poly = { type: 'Polygon', coordinates: [ensureClockwise(ring)] }; // d3: clockwise = the small side
  let inside = 0;
  let land = 0;
  for (let y = y0 + step / 2; y < y1; y += step) {
    for (let x = x0 + step / 2; x < x1; x += step) {
      if (!geoContains(poly, [x, y])) continue;
      inside += 1;
      if (landAt(y, x)) land += 1;
    }
  }
  return { off, share: inside ? land / inside : 1 };
}

/** Distance (km) from a point to a ring's edge. */
function edgeKm(ring, lng, lat) {
  const k = Math.cos((lat * Math.PI) / 180);
  let best = Infinity;
  for (let i = 1; i < ring.length; i++) {
    const [ax, ay] = ring[i - 1];
    const [bx, by] = ring[i];
    const ux = (bx - ax) * k, uy = by - ay, vx = (lng - ax) * k, vy = lat - ay;
    const L = ux * ux + uy * uy;
    const t = L ? Math.max(0, Math.min(1, (vx * ux + vy * uy) / L)) : 0;
    best = Math.min(best, Math.hypot(vx - t * ux, vy - t * uy) * 111.2);
  }
  return best;
}

/** Planar point-in-ring with a bounding-box prefilter (fast enough for a 0.1° grid over the Maghreb). */
function planarFeature(f) {
  const ring = f.geometry.coordinates[0];
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of ring) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return {
    f,
    has(x, y) {
      if (x < x0 || x > x1 || y < y0 || y > y1) return false;
      let c = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [a, b] = ring[i];
        const [e, g] = ring[j];
        if ((b > y) !== (g > y) && x < ((e - a) * (y - b)) / (g - b) + a) c = !c;
      }
      return c;
    },
  };
}

const PACKS = [
  {
    country: 'peru',
    polities: peruPolities,
    fixes: peruShapeFixes,
    // Redrawn regions that must stay on land (entity → region ids).
    redrawn: {
      'spanish-empire': ['andes', 'southern-cone'],
      'colonial-americas': ['andes-coast'],
      'andean-peoples': ['andean-central', 'andean-coast'],
      'andean-presence': ['and-coast'],
    },
    // [entity, year, lng, lat, place]
    capitals: [
      ['norte-chico', -2600, -77.52, -10.89, 'Caral'],
      ['chavin', -850, -77.18, -9.59, 'Chavín de Huántar'],
      ['chavin', -400, -78.85, -7.13, 'Kuntur Wasi'],
      ['paracas', -400, -76.33, -13.86, 'Paracas peninsula'],
      ['nazca', 300, -75.12, -14.82, 'Cahuachi'],
      ['moche', 450, -78.99, -8.13, 'Huacas de Moche'],
      ['moche', 450, -79.60, -6.80, 'Sipán'],
      ['moche', 760, -79.44, -7.18, 'San José de Moro'],
      ['wari-empire', 600, -74.20, -13.06, 'Huari'],
      ['wari-empire', 850, -71.72, -13.62, 'Pikillacta'],
      ['wari-empire', 850, -78.05, -7.79, 'Viracochapampa'],
      ['wari-empire', 850, -70.85, -17.11, 'Cerro Baúl'],
      ['sican', 1000, -79.80, -6.47, 'Batán Grande'],
      ['sican', 1150, -79.84, -6.52, 'Túcume'],
      ['chimu', 950, -79.07, -8.11, 'Chan Chan'],
      ['chimu', 1462, -80.45, -3.57, 'Tumbes'],
      ['chimu', 1462, -79.84, -6.52, 'Túcume'],
      ['chachapoyas', 1250, -77.93, -6.43, 'Kuélap'],
      ['chincha', 1300, -76.17, -13.45, 'La Centinela'],
      ['ychsma', 1250, -76.90, -12.26, 'Pachacamac'],
      ['chanka', 1350, -73.38, -13.66, 'Andahuaylas'],
      ['kingdom-of-cusco', 1350, -71.97, -13.53, 'Cusco'],
      ['colla', 1350, -70.21, -15.49, 'Hatunqolla'],
      ['lupaca', 1350, -69.89, -15.89, 'Chucuito'],
      ['inca-empire', 1438, -71.97, -13.53, 'Cusco'],
      ['inca-empire', 1471, -78.51, -0.22, 'Quito'],
      ['inca-empire', 1471, -79.07, -8.11, 'Chan Chan'],
      ['inca-empire', 1527, -70.66, -33.45, 'Santiago (Maipo valley)'],
      ['inca-empire', 1527, -77.28, 1.21, 'Pasto'],
      ['inca-empire', 1527, -72.55, -13.16, 'Machu Picchu'],
      ['neo-inca-state', 1560, -73.20, -12.90, 'Espíritu Pampa'],
      ['spanish-empire', 1535, -77.04, -12.05, 'Lima'],
      ['spanish-empire', 1550, -65.75, -19.58, 'Potosí'],
      ['spanish-empire', 1700, -71.54, -16.40, 'Arequipa'],
      ['spanish-empire', 1700, -57.63, -25.28, 'Asunción'],
    ],
    on: {
      [-2600]: ['norte-chico'],
      [-400]: ['chavin', 'paracas'],
      300: ['nazca', 'moche'],
      700: ['wari-empire', 'moche', 'nazca'],
      1000: ['sican', 'chimu', 'chachapoyas', 'ychsma', 'wari-empire'],
      1300: ['chimu', 'sican', 'chachapoyas', 'chincha', 'ychsma', 'chanka', 'kingdom-of-cusco', 'colla', 'lupaca'],
      1400: ['chimu', 'chachapoyas', 'chincha', 'ychsma', 'chanka', 'kingdom-of-cusco', 'colla', 'lupaca'],
      1470: ['inca-empire'],
      1500: ['inca-empire'],
      1530: ['inca-empire', 'spanish-empire'],
      1550: ['neo-inca-state', 'spanish-empire'],
      1700: ['spanish-empire'],
    },
    gone: {
      [-1500]: ['norte-chico'],
      100: ['chavin', 'paracas'],
      900: ['moche', 'nazca'],
      1100: ['wari-empire'],
      1400: ['sican'],
      1480: ['chimu', 'chincha', 'ychsma', 'chachapoyas', 'chanka', 'colla', 'lupaca', 'kingdom-of-cusco'],
      1545: ['inca-empire'],
      1580: ['neo-inca-state'],
    },
    // [entity, year, region id] that must NOT be drawn (Spanish Peru before Pizarro, etc.).
    absent: [
      ['spanish-empire', 1500, 'andes'],
      ['spanish-empire', 1525, 'andes'],
      ['colonial-americas', 1525, 'andes-coast'],
    ],
    present: [
      ['spanish-empire', 1540, 'andes'],
      ['colonial-americas', 1560, 'andes-coast'],
      ['spanish-empire', 1750, 'southern-cone'],
    ],
  },
  {
    country: 'ghana',
    polities: ghanaPolities,
    fixes: ghanaShapeFixes,
    redrawn: {},
    capitals: [
      ['bono-state', 1450, -1.85, 7.70, 'Bono Manso'],
      ['bono-state', 1450, -2.48, 7.84, 'Begho'],
      ['bono-state', 1722, -1.85, 7.70, 'Bono Manso'],
      ['denkyira', 1620, -1.85, 6.28, 'Abankeseso'],
      ['denkyira', 1695, -1.85, 6.28, 'Abankeseso'],
      ['great-accra', 1600, -0.24, 5.68, 'Ayawaso'],
      ['akwamu', 1681, -0.20, 5.56, 'Accra'],
      ['akwamu', 1710, -0.62, 5.35, 'Winneba'],
      ['akwamu', 1730, 0.08, 6.28, 'Akwamufie'],
      ['akyem', 1700, -0.55, 6.17, 'Kyebi'],
      ['akyem', 1731, -0.20, 5.56, 'Accra'],
      ['fante-states', 1700, -1.02, 5.27, 'Mankessim'],
      ['fante-states', 1760, -1.12, 5.17, 'Anomabo'],
      ['dagbon', 1600, -1.38, 9.53, 'Daboya'],
      ['dagbon', 1713, 0.0, 9.43, 'Yendi'],
      ['mamprugu', 1450, -0.44, 10.53, 'Gambaga'],
      ['mamprugu', 1700, -0.37, 10.53, 'Nalerigu'],
      ['gonja', 1675, -1.32, 10.0, 'Yagbum'],
      ['gonja', 1675, -2.48, 9.03, 'Bole'],
      ['gonja', 1713, -1.38, 9.53, 'Daboya'],
      ['gonja', 1751, -0.52, 8.55, 'Salaga'],
      ['asante-empire', 1701, -1.62, 6.69, 'Kumasi'],
      ['asante-empire', 1723, -1.85, 7.70, 'Bono Manso'],
      ['asante-empire', 1750, -0.20, 5.56, 'Accra'],
      ['asante-empire', 1750, -0.55, 6.17, 'Kyebi'],
      ['asante-empire', 1807, -1.62, 6.69, 'Kumasi'],
    ],
    on: {
      1400: ['bono-state'],
      1500: ['bono-state', 'dagbon', 'mamprugu', 'great-accra'],
      1650: ['bono-state', 'denkyira', 'great-accra', 'akwamu', 'akyem', 'fante-states', 'dagbon', 'mamprugu', 'gonja'],
      1720: ['bono-state', 'asante-empire', 'akwamu', 'akyem', 'fante-states', 'dagbon', 'mamprugu', 'gonja'],
      1760: ['asante-empire', 'fante-states', 'dagbon', 'mamprugu', 'gonja'],
      1810: ['asante-empire', 'fante-states', 'dagbon', 'mamprugu', 'gonja'],
    },
    gone: {
      1690: ['great-accra'],
      1710: ['denkyira'],
      1740: ['bono-state', 'akwamu'],
      1750: ['akyem'],
      1830: ['asante-empire', 'fante-states', 'dagbon', 'mamprugu', 'gonja'],
    },
    absent: [],
    present: [],
    // Day 66: the pack's own shapes must not overlap each other at any year (sampled every 5 years).
    noOverlap: { from: 1300, to: 1815, box: [-3.3, 4.7, 1.9, 11.2] },
    // The presence bands it redrew must not shade the sea off Ghana's coast (0.2° and 0.6° offshore).
    offshore: { coast: GOLD_COAST, west: -2.9, east: 1.7, entities: ['west-africa-sahel-presence', 'global-modern-presence'], years: [1400, 1550, 1700, 1850, 1900, 1960, 2025] }, // keyframes, and between identical ones
  },
  {
    country: 'morocco',
    polities: moroccoPolities,
    fixes: moroccoShapeFixes,
    // Rome's west was split off into fixed Hispania and Africa regions (its 'mediterranean' ring now
    // runs through the sea, so only the new land regions are land-checked).
    redrawn: { 'roman-empire': ['hispania', 'africa-numidia'] },
    capitals: [
      ['mauretania-kingdom', -206, -5.81, 35.77, 'Tingis'],
      ['mauretania-kingdom', -25, -5.56, 34.07, 'Volubilis'],
      ['mauretania-kingdom', -25, 2.19, 36.61, 'Caesarea (Iol)'],
      ['roman-mauretania', 117, -5.81, 35.77, 'Tingis'],
      ['roman-mauretania', 117, -5.56, 34.07, 'Volubilis'],
      ['roman-mauretania', 117, -6.81, 34.01, 'Sala'],
      ['roman-mauretania', 117, 2.19, 36.61, 'Caesarea'],
      ['roman-mauretania', 285, -5.81, 35.77, 'Tingis'],
      ['barghawata', 850, -7.59, 33.59, 'Anfa'],
      ['idrisid-dynasty', 789, -5.56, 34.07, 'Walili (Volubilis)'],
      ['idrisid-dynasty', 789, -4.98, 34.06, 'Fez'],
      ['idrisid-dynasty', 828, -1.32, 34.88, 'Tlemcen'],
      ['idrisid-dynasty', 951, -5.68, 35.24, 'Hajar an-Nasr'],
      ['emirate-of-nekor', 917, -3.85, 35.12, 'Nekor'],
      ['midrarids', 823, -4.27, 31.28, 'Sijilmasa'],
      ['maghrawa', 987, -4.98, 34.06, 'Fez'],
      ['maghrawa', 994, -1.91, 34.68, 'Oujda'],
      ['maghrawa', 1033, -7.80, 31.42, 'Aghmat'],
      ['banu-ifran', 1038, -6.80, 34.04, 'Salé'],
      ['almoravid-empire', 1055, -4.27, 31.28, 'Sijilmasa'],
      ['almoravid-empire', 1083, -7.99, 31.63, 'Marrakesh'],
      ['almoravid-empire', 1091, -5.99, 37.39, 'Seville'],
      ['almoravid-empire', 1110, -0.88, 41.65, 'Zaragoza'],
      ['almoravid-empire', 1147, 2.65, 39.57, 'Palma'],
      ['almohad-caliphate', 1124, -8.23, 30.98, 'Tinmel'],
      ['almohad-caliphate', 1160, 10.18, 36.80, 'Tunis'],
      ['almohad-caliphate', 1160, -7.99, 31.63, 'Marrakesh'],
      ['almohad-caliphate', 1172, -0.38, 39.47, 'Valencia'],
      ['marinid-sultanate', 1276, -4.98, 34.06, 'Fez'],
      ['marinid-sultanate', 1347, 10.18, 36.80, 'Tunis'],
      ['wattasid-sultanate', 1472, -4.98, 34.06, 'Fez'],
      ['saadi-sultanate', 1510, -8.88, 30.47, 'Taroudant'],
      ['saadi-sultanate', 1578, -7.99, 31.63, 'Marrakesh'],
      ['saadi-sultanate', 1641, -7.99, 31.63, 'Marrakesh'],
      ['dila-zawiya', 1641, -4.98, 34.06, 'Fez'],
      ['dila-zawiya', 1641, -5.55, 33.89, 'Meknes'],
      ['republic-of-sale', 1627, -6.80, 34.04, 'Salé'],
      ['alaouite-sultanate', 1631, -4.27, 31.28, 'Sijilmasa'],
      ['alaouite-sultanate', 1672, -5.55, 33.89, 'Meknes'],
      ['alaouite-sultanate', 1757, -7.99, 31.63, 'Marrakesh'],
      ['portuguese-morocco', 1415, -5.39, 35.87, 'Ceuta'],
      ['portuguese-morocco', 1541, -8.49, 33.24, 'Mazagan'],
      ['spanish-presidios', 1497, -2.94, 35.29, 'Melilla'],
      ['english-tangier', 1662, -5.80, 35.77, 'Tangier'],
    ],
    on: {
      '-100': ['mauretania-kingdom'],
      100: ['roman-mauretania'],
      800: ['barghawata', 'idrisid-dynasty', 'emirate-of-nekor', 'midrarids'],
      1000: ['barghawata', 'emirate-of-nekor', 'maghrawa'],
      1035: ['maghrawa', 'banu-ifran'],
      1100: ['almoravid-empire'],
      1180: ['almohad-caliphate', 'almoravid-empire'],
      1300: ['marinid-sultanate'],
      1500: ['wattasid-sultanate', 'portuguese-morocco', 'spanish-presidios'],
      1600: ['saadi-sultanate', 'portuguese-morocco', 'spanish-presidios'],
      1650: ['saadi-sultanate', 'tazerwalt', 'dila-zawiya', 'republic-of-sale', 'alaouite-sultanate', 'portuguese-morocco', 'spanish-presidios'],
      1670: ['alaouite-sultanate', 'english-tangier', 'portuguese-morocco', 'spanish-presidios'],
      1810: ['alaouite-sultanate', 'spanish-presidios'],
    },
    gone: {
      50: ['mauretania-kingdom'],
      450: ['roman-mauretania'],
      1210: ['almoravid-empire'],
      1280: ['almohad-caliphate'],
      1470: ['marinid-sultanate'],
      1560: ['wattasid-sultanate'],
      1665: ['saadi-sultanate'],
      1672: ['dila-zawiya', 'republic-of-sale', 'tazerwalt'],
      1690: ['english-tangier'],
      1780: ['portuguese-morocco'],
      1830: ['alaouite-sultanate', 'spanish-presidios'],
    },
    absent: [],
    present: [
      ['roman-empire', 100, 'hispania'],
      ['roman-empire', 100, 'africa-numidia'],
    ],
    // Anachronisms fixed: Rome no longer covers Mauretania, nor the French Maghreb shape Fez before 1815.
    notOver: [
      ['roman-empire', 0, -4.98, 34.06, 'Fez'],
      ['roman-empire', 100, -5.56, 34.07, 'Volubilis'],
      ['roman-empire', 300, 2.19, 36.61, 'Caesarea'],
      ['roman-empire', 380, -1.32, 34.88, 'Tlemcen'],
      ['french-colonial', 1790, -4.98, 34.06, 'Fez'],
      ['french-colonial', 1810, -1.91, 34.68, 'Oujda'],
    ],
    // The pack's shapes, and the older shapes around it, never overlap (every 5 years, 0.1° grid).
    noOverlap: {
      from: -210,
      to: 1815,
      box: [-17.5, 20, 15.5, 42.5],
      planar: true,
      with: ['roman-empire', 'carthage', 'umayyad-caliphate', 'byzantine-empire', 'ottoman-empire', 'spanish-empire', 'portuguese-empire', 'french-colonial'],
    },
    enclaves: { shapes: ENCLAVE_SHAPES, rule: ENCLAVE_RULE },
  },
  {
    country: 'kenya',
    polities: kenyaPolities,
    fixes: kenyaShapeFixes,
    // The Swahili city-states' schematic 'north' region was dropped, not redrawn.
    redrawn: {},
    dropped: [['swahili-city-states', 'north']],
    capitals: [
      ['shanga', 760, 41.07, -2.13, 'Shanga'],
      ['shanga', 1300, 41.07, -2.13, 'Shanga'],
      ['manda', 1000, 40.95, -2.21, 'Manda'],
      ['pate-sultanate', 1300, 41.00, -2.11, 'Pate'],
      ['pate-sultanate', 1700, 41.00, -2.11, 'Pate'],
      ['siyu', 1606, 41.07, -2.10, 'Siyu'],
      ['siyu', 1587, 41.10, -2.05, 'Faza'],
      ['lamu', 1300, 40.90, -2.27, 'Lamu'],
      ['lamu', 1812, 40.91, -2.30, 'Shela'],
      ['gedi', 1450, 40.02, -3.31, 'Gedi'],
      ['malindi-sultanate', 1498, 40.12, -3.22, 'Malindi'],
      ['mombasa-sultanate', 1151, 39.67, -4.06, 'Mombasa'],
      ['mombasa-sultanate', 1331, 39.67, -4.06, 'Mombasa'],
      ['portuguese-mombasa', 1593, 39.68, -4.06, 'Fort Jesus'],
      ['portuguese-mombasa', 1593, 40.12, -3.22, 'Malindi'],
      ['portuguese-mombasa', 1696, 39.68, -4.06, 'Fort Jesus'],
      ['mazrui-mombasa', 1746, 39.68, -4.06, 'Fort Jesus'],
      ['wanga-kingdom', 1650, 34.49, 0.34, 'Elureko (Mumias)'],
      ['wanga-kingdom', 1760, 34.56, 0.40, 'Matungu'],
    ],
    on: {
      800: ['shanga'],
      1000: ['shanga', 'manda'],
      1100: ['shanga', 'gedi'],
      1200: ['shanga', 'gedi', 'mombasa-sultanate', 'manda'],
      1400: ['shanga', 'gedi', 'mombasa-sultanate', 'malindi-sultanate', 'lamu', 'pate-sultanate'],
      1550: ['gedi', 'mombasa-sultanate', 'malindi-sultanate', 'lamu', 'pate-sultanate', 'siyu'],
      1600: ['gedi', 'portuguese-mombasa', 'lamu', 'pate-sultanate', 'siyu'],
      1700: ['mazrui-mombasa', 'lamu', 'pate-sultanate', 'siyu', 'wanga-kingdom'],
      1810: ['mazrui-mombasa', 'lamu', 'pate-sultanate', 'siyu', 'wanga-kingdom'],
    },
    gone: {
      1310: ['manda'],
      1430: ['shanga'],
      1595: ['mombasa-sultanate', 'malindi-sultanate'],
      1650: ['gedi'],
      1700: ['portuguese-mombasa'],
      1830: ['mazrui-mombasa', 'lamu', 'pate-sultanate', 'siyu', 'wanga-kingdom'],
    },
    absent: [['portuguese-mombasa', 1650, 'malindi']],
    present: [['portuguese-mombasa', 1620, 'malindi']],
    // The old schematic coast no longer covers the towns the pack draws.
    notOver: [
      ['swahili-city-states', 1300, 39.67, -4.06, 'Mombasa'],
      ['swahili-city-states', 1500, 40.12, -3.22, 'Malindi'],
      ['swahili-city-states', 1600, 40.90, -2.27, 'Lamu'],
    ],
    // The pack's shapes, and the older polities around it, never overlap (every 5 years, 0.1° grid).
    noOverlap: {
      from: 750,
      to: 1815,
      box: [33.8, -4.8, 42.0, 5.0],
      planar: true,
      with: ['swahili-city-states', 'ethiopian-empire', 'buganda'],
    },
  },
  {
    country: 'iraq',
    polities: iraqPolities,
    fixes: iraqShapeFixes,
    // Regions redrawn from the Iraq pieces (land-checked).
    redrawn: {
      'parthian-empire': ['babylonia'],
      'sassanid-empire': ['mesopotamia'],
      'umayyad-caliphate': ['mesopotamia'],
      'abbasid-caliphate': ['mesopotamia'],
      'ottoman-empire': ['jazira'],
    },
    // The schematic Mesopotamia sphere is replaced by the pack.
    droppedEntities: ['mesopotamia'],
    // Schematic rings trimmed back to a line clear of Iraq (they run through the sea elsewhere).
    trimmed: [...new Set(IRAQ_TRIMS.map(([id]) => id)), 'achaemenid-empire'],
    capitals: [
      ['sumerian-city-states', -2600, 46.1, 30.96, 'Ur'],
      ['sumerian-city-states', -2600, 45.64, 31.32, 'Uruk'],
      ['sumerian-city-states', -2600, 44.6, 32.54, 'Kish'],
      ['sumerian-city-states', -2600, 46.18, 31.55, 'Girsu'],
      ['sumerian-city-states', -2600, 40.89, 34.55, 'Mari'],
      ['akkadian-empire', -2300, 44.6, 32.54, 'Kish'],
      ['akkadian-empire', -2300, 45.23, 32.13, 'Nippur'],
      ['akkadian-empire', -2300, 43.26, 35.46, 'Assur'],
      ['akkadian-empire', -2254, 41.06, 36.67, 'Nagar (Tell Brak)'],
      ['ur-iii', -2094, 46.1, 30.96, 'Ur'],
      ['ur-iii', -2060, 43.26, 35.46, 'Assur'],
      ['isin-dynasty', -2000, 45.27, 31.88, 'Isin'],
      ['larsa-dynasty', -1822, 45.85, 31.29, 'Larsa'],
      ['larsa-dynasty', -1822, 46.1, 30.96, 'Ur'],
      ['eshnunna', -1850, 44.73, 33.48, 'Eshnunna'],
      ['mari-kingdom', -1775, 40.89, 34.55, 'Mari'],
      ['assyria', -1950, 43.26, 35.46, 'Assur'],
      ['assyria', -1808, 41.92, 36.96, 'Shubat-Enlil'],
      ['assyria', -880, 43.33, 36.1, 'Kalhu'],
      ['assyria', -689, 43.15, 36.36, 'Nineveh'],
      ['assyria', -689, 44.42, 32.54, 'Babylon'],
      ['assyria', -612, 39.03, 36.87, 'Harran'],
      ['mitanni', -1500, 41.06, 36.67, 'Nagar (Tell Brak)'],
      ['babylonia', -1792, 44.42, 32.54, 'Babylon'],
      ['babylonia', -1761, 40.89, 34.55, 'Mari'],
      ['babylonia', -1375, 44.2, 33.35, 'Dur-Kurigalzu'],
      ['sealand-dynasty', -1600, 46.1, 30.96, 'Ur'],
      ['neo-babylonian-empire', -587, 44.42, 32.54, 'Babylon'],
      ['neo-babylonian-empire', -587, 39.03, 36.87, 'Harran'],
      ['parthian-empire', 50, 44.58, 33.09, 'Ctesiphon'],
      ['sassanid-empire', 400, 44.58, 33.09, 'Ctesiphon'],
      ['umayyad-caliphate', 661, 44.4, 32.03, 'Kufa'],
      ['umayyad-caliphate', 720, 46.3, 32.19, 'Wasit'],
      ['abbasid-caliphate', 800, 44.36, 33.31, 'Baghdad'],
      ['abbasid-caliphate', 936, 44.36, 33.31, 'Baghdad'],
      ['hamdanids-mosul', 942, 43.13, 36.34, 'Mosul'],
      ['hamdanids-mosul', 942, 41.22, 37.07, 'Nisibis'],
      ['buyid-iraq', 945, 44.36, 33.31, 'Baghdad'],
      ['buyid-iraq', 979, 43.13, 36.34, 'Mosul'],
      ['uqaylids', 1044, 43.13, 36.34, 'Mosul'],
      ['seljuk-iraq', 1067, 44.36, 33.31, 'Baghdad'],
      ['seljuk-iraq', 1118, 43.13, 36.34, 'Mosul'],
      ['mosul-atabegs', 1146, 43.13, 36.34, 'Mosul'],
      ['abbasid-caliphate-iraq', 1180, 44.36, 33.31, 'Baghdad'],
      ['abbasid-caliphate-iraq', 1180, 47.81, 30.51, 'Basra'],
      ['ilkhanate-iraq', 1295, 44.36, 33.31, 'Baghdad'],
      ['ilkhanate-iraq', 1295, 43.13, 36.34, 'Mosul'],
      ['jalayirids', 1356, 44.36, 33.31, 'Baghdad'],
      ['jalayirids', 1410, 47.81, 30.51, 'Basra'],
      ['qara-qoyunlu', 1432, 44.36, 33.31, 'Baghdad'],
      ['aq-qoyunlu', 1478, 44.36, 33.31, 'Baghdad'],
      ['safavid-iraq', 1514, 44.36, 33.31, 'Baghdad'],
      ['safavid-baghdad', 1626, 44.36, 33.31, 'Baghdad'],
      ['ottoman-iraq', 1554, 44.36, 33.31, 'Baghdad'],
      ['ottoman-iraq', 1554, 43.13, 36.34, 'Mosul'],
      ['ottoman-iraq', 1554, 47.81, 30.51, 'Basra'],
      ['ottoman-iraq', 1780, 45.43, 35.56, 'Sulaymaniyah'],
      ['ottoman-iraq', 1780, 44.01, 36.19, 'Erbil'],
      ['afrasiyab-basra', 1624, 47.81, 30.51, 'Basra'],
    ],
    on: {
      '-2800': ['sumerian-city-states'],
      '-2300': ['akkadian-empire'],
      '-2100': ['ur-iii'],
      '-1900': ['isin-dynasty', 'larsa-dynasty', 'eshnunna', 'assyria'],
      '-1790': ['babylonia', 'larsa-dynasty', 'mari-kingdom', 'eshnunna', 'assyria'],
      '-1700': ['babylonia', 'sealand-dynasty', 'assyria'],
      '-1450': ['babylonia', 'mitanni', 'assyria'],
      '-700': ['assyria'],
      '-580': ['neo-babylonian-empire'],
      0: ['parthian-empire'],
      700: ['umayyad-caliphate'],
      935: ['abbasid-caliphate', 'hamdanids-mosul'],
      1000: ['buyid-iraq', 'uqaylids'],
      1100: ['seljuk-iraq'],
      1200: ['abbasid-caliphate-iraq', 'mosul-atabegs'],
      1300: ['ilkhanate-iraq'],
      1400: ['jalayirids'],
      1450: ['qara-qoyunlu'],
      1490: ['aq-qoyunlu'],
      1520: ['safavid-iraq'],
      1600: ['ottoman-iraq', 'afrasiyab-basra'],
      1630: ['safavid-baghdad', 'ottoman-iraq'],
      1810: ['ottoman-iraq'],
    },
    gone: {
      '-2800': ['mesopotamia'],
      '-2200': ['sumerian-city-states'],
      '-2100': ['akkadian-empire'],
      '-1990': ['ur-iii'],
      '-1750': ['larsa-dynasty', 'eshnunna', 'mari-kingdom', 'isin-dynasty'],
      '-1400': ['sealand-dynasty'],
      '-1200': ['mitanni'],
      '-700': ['babylonia'],
      '-600': ['assyria'],
      '-530': ['neo-babylonian-empire'],
      960: ['abbasid-caliphate'],
      990: ['hamdanids-mosul'],
      1060: ['buyid-iraq'],
      1100: ['uqaylids'],
      1160: ['seljuk-iraq'],
      1260: ['abbasid-caliphate-iraq'],
      1265: ['mosul-atabegs'],
      1340: ['ilkhanate-iraq'],
      1435: ['jalayirids'],
      1470: ['qara-qoyunlu'],
      1510: ['aq-qoyunlu'],
      1536: ['safavid-iraq'],
      1640: ['safavid-baghdad'],
      1670: ['afrasiyab-basra'],
    },
    absent: [
      ['safavid-empire', 1620, 'mesopotamia'],
      ['achaemenid-empire', -545, 'meso-syria'],
    ],
    present: [
      ['parthian-empire', 0, 'babylonia'],
      ['umayyad-caliphate', 715, 'mesopotamia'],
      ['abbasid-caliphate', 940, 'mesopotamia'],
      ['ottoman-empire', 1700, 'jazira'],
    ],
    // Anachronisms fixed: shapes that spilled over Iraq in other powers' years.
    notOver: [
      ['hittite-empire', -1300, 38.55, 36.5, 'the Balikh mouth (Mitanni)'],
      ['roman-empire', 117, 44.42, 32.54, 'Babylon'],
      ['roman-empire', 117, 43.13, 36.34, 'Mosul'],
      ['ancient-egypt', -1500, 40.89, 34.55, 'Mari'],
      ['phoenicia', -1500, 40.89, 34.55, 'Mari'],
      ['byzantine-empire', 800, 41.22, 37.07, 'Nisibis'],
      ['byzantine-empire', 1000, 41.22, 37.07, 'Nisibis'],
      ['mongol-empire', 1240, 43.13, 36.34, 'Mosul'],
      ['mongol-empire', 1300, 43.13, 36.34, 'Mosul'],
      ['mongol-empire', 1290, 44.36, 33.31, 'Baghdad'],
      ['mongol-empire', 1290, 47.81, 30.51, 'Basra'],
      ['safavid-empire', 1600, 44.36, 33.31, 'Baghdad'],
      ['safavid-empire', 1650, 47.81, 30.51, 'Basra'],
      ['safavid-empire', 1700, 45.43, 35.56, 'Sulaymaniyah'],
      ['ottoman-empire', 1500, 43.13, 36.34, 'Mosul'],
      ['ottoman-empire', 1600, 44.01, 36.19, 'Erbil'],
      ['ottoman-empire', 1700, 42.0, 34.4, 'Anah'],
      ['achaemenid-empire', -541, 44.42, 32.54, 'Babylon'],
    ],
    // The pack's shapes, and the older shapes around it, never overlap (every 5 years, 0.1° grid).
    noOverlap: {
      from: -2900,
      to: 1815,
      box: [37.5, 29.5, 49, 38],
      planar: true,
      with: ['achaemenid-empire', 'macedonian-empire', 'seleucid-empire', 'parthian-empire', 'roman-empire', 'sassanid-empire', 'umayyad-caliphate', 'abbasid-caliphate', 'ancient-egypt', 'phoenicia', 'hittite-empire', 'byzantine-empire', 'mongol-empire', 'timurid', 'safavid-empire', 'ottoman-empire'],
    },
  },
  {
    country: 'philippines',
    polities: philippinesPolities,
    fixes: philippinesShapeFixes,
    // Jolo and Tawi-Tawi are only in the close-zoom land.
    fineLand: true,
    // The Spanish Empire's schematic 'philippines' ring was dropped, not redrawn.
    redrawn: {},
    dropped: [['spanish-empire', 'philippines']],
    capitals: [
      ['tondo', 900, 120.97, 14.62, 'Tondo'],
      ['tondo', 1570, 120.97, 14.62, 'Tondo'],
      ['maynila', 1570, 120.975, 14.59, 'Maynila (Intramuros)'],
      ['namayan', 1500, 121.012, 14.581, 'Sapa (Santa Ana)'],
      ['caboloan', 1403, 120.23, 16.02, 'Lingayen'],
      ['caboloan', 1500, 120.35, 15.93, 'Binalatongan (San Carlos)'],
      ['butuan', 1001, 125.54, 8.95, 'Butuan'],
      ['butuan', 1521, 125.49, 9.79, 'Surigao (Calagan)'],
      ['cebu-rajahnate', 1521, 123.9, 10.29, 'Cebu'],
      ['cebu-rajahnate', 1521, 123.97, 10.3, 'Mactan'],
      ['sulu-sultanate', 1405, 121.0, 6.05, 'Jolo'],
      ['sulu-sultanate', 1638, 120.03, 5.17, 'Tawi-Tawi'],
      ['sulu-sultanate', 1704, 118.07, 5.84, 'Sandakan'],
      ['maguindanao-sultanate', 1520, 124.07, 7.59, 'Malabang'],
      ['maguindanao-sultanate', 1640, 124.25, 7.22, 'Cotabato'],
      ['maguindanao-sultanate', 1645, 124.28, 7.33, 'Simuay'],
      ['maguindanao-sultanate', 1625, 125.17, 6.11, 'Sarangani Bay'],
      ['maguindanao-sultanate', 1640, 125.61, 7.07, 'Davao'],
      ['buayan-sultanate', 1596, 124.5, 7.02, 'Buayan (Datu Piang)'],
      ['lanao-sultanates', 1616, 124.29, 8.0, 'Dansalan (Marawi)'],
      ['spanish-philippines', 1565, 123.9, 10.29, 'Cebu (San Miguel)'],
      ['spanish-philippines', 1569, 122.75, 11.55, 'Pan-ay'],
      ['spanish-philippines', 1571, 120.975, 14.59, 'Manila'],
      ['spanish-philippines', 1572, 120.39, 17.57, 'Vigan'],
      ['spanish-philippines', 1575, 123.19, 13.62, 'Nueva Cáceres'],
      ['spanish-philippines', 1581, 121.66, 18.2, 'Nueva Segovia (Lal-lo)'],
      ['spanish-philippines', 1609, 126.2, 9.08, 'Tandag'],
      ['spanish-philippines', 1623, 119.52, 10.82, 'Taytay'],
      ['spanish-philippines', 1626, 124.65, 8.48, 'Cagayan (de Oro)'],
      ['spanish-philippines', 1635, 122.08, 6.9, 'Zamboanga'],
      ['spanish-philippines', 1638, 121.0, 6.05, 'Jolo'],
      ['spanish-philippines', 1744, 123.85, 9.65, 'Tagbilaran'],
      ['spanish-philippines', 1815, 120.975, 14.59, 'Manila'],
      ['dagohoy-bohol', 1744, 124.07, 10.0, 'Inabanga'],
      ['dagohoy-bohol', 1744, 124.27, 10.02, 'Danao'],
    ],
    on: {
      900: ['tondo'],
      1001: ['tondo', 'butuan'],
      1250: ['tondo', 'namayan', 'butuan', 'cebu-rajahnate'],
      1450: ['tondo', 'namayan', 'butuan', 'cebu-rajahnate', 'caboloan', 'sulu-sultanate', 'buayan-sultanate'],
      1530: ['tondo', 'maynila', 'namayan', 'caboloan', 'cebu-rajahnate', 'sulu-sultanate', 'maguindanao-sultanate', 'buayan-sultanate'],
      1566: ['spanish-philippines', 'tondo', 'maynila', 'namayan', 'caboloan', 'sulu-sultanate', 'maguindanao-sultanate'],
      1600: ['spanish-philippines', 'sulu-sultanate', 'maguindanao-sultanate', 'buayan-sultanate'],
      1640: ['spanish-philippines', 'sulu-sultanate', 'maguindanao-sultanate', 'buayan-sultanate', 'lanao-sultanates'],
      1750: ['spanish-philippines', 'sulu-sultanate', 'maguindanao-sultanate', 'buayan-sultanate', 'lanao-sultanates', 'dagohoy-bohol'],
      1810: ['spanish-philippines', 'sulu-sultanate', 'maguindanao-sultanate', 'buayan-sultanate', 'lanao-sultanates', 'dagohoy-bohol'],
    },
    gone: {
      1530: ['butuan'],
      1566: ['cebu-rajahnate'],
      1573: ['tondo', 'maynila', 'namayan', 'caboloan'],
      1830: ['spanish-philippines', 'sulu-sultanate', 'maguindanao-sultanate', 'buayan-sultanate', 'lanao-sultanates', 'dagohoy-bohol'],
    },
    absent: [
      ['spanish-philippines', 1660, 'jolo'],
      ['spanish-philippines', 1700, 'zambo'],
      ['spanish-philippines', 1600, 'caraga'],
      ['sulu-sultanate', 1640, 'jolo'],
      ['sulu-sultanate', 1650, 'sabah'],
    ],
    present: [
      ['spanish-philippines', 1640, 'jolo'],
      ['spanish-philippines', 1640, 'zambo'],
      ['spanish-philippines', 1720, 'zambo'],
      ['spanish-philippines', 1590, 'cagayan'],
      ['sulu-sultanate', 1650, 'jolo'],
      ['sulu-sultanate', 1710, 'sabah'],
    ],
    // Anachronisms fixed: no Spanish shape before Legazpi, none over the sultanates, the Cordillera or Dagohoy's Bohol.
    notOver: [
      ['spanish-empire', 1560, 123.9, 10.29, 'Cebu (before Legazpi)'],
      ['spanish-empire', 1700, 121.0, 6.05, 'Jolo'],
      ['spanish-empire', 1700, 124.29, 8.0, 'Marawi'],
      ['spanish-philippines', 1700, 121.0, 6.05, 'Jolo'],
      ['spanish-philippines', 1700, 124.29, 8.0, 'Marawi'],
      ['spanish-philippines', 1700, 124.25, 7.22, 'Cotabato'],
      ['spanish-philippines', 1700, 121.0, 17.0, 'the Cordillera'],
      ['spanish-philippines', 1750, 124.27, 10.02, 'Danao (Dagohoy)'],
    ],
    // The pack's shapes, Brunei and what is left of the Spanish Empire never overlap (every 5 years, 0.1° grid).
    noOverlap: {
      from: 900,
      to: 1815,
      box: [116.5, 4.5, 126.8, 18.8],
      planar: true,
      with: ['brunei-sultanate', 'spanish-empire'],
    },
  },
  {
    country: 'uzbekistan',
    polities: uzbekistanPolities,
    fixes: uzbekistanShapeFixes,
    // The Timurids' oasis regions are redrawn from the Uzbekistan pieces (land-checked).
    redrawn: {
      timurid: ['transoxiana', 'hisar', 'chach', 'fergana', 'khwarazm'],
    },
    // The Russian Empire's schematic 'central-asia' ring (over Bukhara from the 1750s) is dropped.
    dropped: [['russian-empire', 'central-asia']],
    // Rings trimmed clear of the oases, and the Mongol 1227 shape kept off Transoxiana before 1219.
    trimmed: [...new Set(UZ_TRIMS.map(([id]) => id)), 'mongol-empire'],
    capitals: [
      ['sogdia', 350, 66.96, 39.65, 'Samarkand'],
      ['sogdia', 350, 64.42, 39.77, 'Bukhara'],
      ['afrighid-khwarazm', 305, 60.75, 41.69, 'Kath'],
      ['afrighid-khwarazm', 995, 59.15, 42.33, 'Gurganj'],
      ['samanid-empire', 819, 66.96, 39.65, 'Samarkand'],
      ['samanid-empire', 900, 64.42, 39.77, 'Bukhara'],
      ['karakhanid-khanate', 999, 66.96, 39.65, 'Samarkand'],
      ['karakhanid-khanate', 999, 64.42, 39.77, 'Bukhara'],
      ['karakhanid-khanate', 999, 75.99, 39.47, 'Kashgar'],
      ['khwarezmia', 1097, 59.15, 42.33, 'Gurganj'],
      ['khwarezmia', 1212, 66.96, 39.65, 'Samarkand'],
      ['timurid', 1370, 66.96, 39.65, 'Samarkand'],
      ['timurid', 1380, 59.15, 42.33, 'Urgench'],
      ['bukhara-khanate', 1500, 66.96, 39.65, 'Samarkand'],
      ['bukhara-khanate', 1557, 64.42, 39.77, 'Bukhara'],
      ['bukhara-khanate', 1815, 64.42, 39.77, 'Bukhara'],
      ['bukhara-khanate', 1815, 66.96, 39.65, 'Samarkand'],
      ['khiva-khanate', 1600, 60.36, 41.38, 'Khiva'],
      ['khiva-khanate', 1815, 60.36, 41.38, 'Khiva'],
      ['kokand-khanate', 1740, 70.94, 40.53, 'Kokand'],
      ['kokand-khanate', 1815, 69.24, 41.3, 'Tashkent'],
    ],
    on: {
      400: ['sogdia', 'afrighid-khwarazm'],
      700: ['sogdia', 'afrighid-khwarazm'],
      900: ['samanid-empire', 'afrighid-khwarazm'],
      1050: ['karakhanid-khanate'],
      1150: ['karakhanid-khanate', 'khwarezmia'],
      1215: ['khwarezmia'],
      1400: ['timurid'],
      1550: ['bukhara-khanate', 'khiva-khanate'],
      1750: ['bukhara-khanate', 'khiva-khanate', 'kokand-khanate'],
      1810: ['bukhara-khanate', 'khiva-khanate', 'kokand-khanate'],
    },
    gone: {
      300: ['sogdia', 'afrighid-khwarazm'],
      760: ['sogdia'],
      1010: ['samanid-empire'],
      1050: ['afrighid-khwarazm'],
      1240: ['karakhanid-khanate', 'khwarezmia'],
      1520: ['timurid'],
      1830: ['bukhara-khanate', 'khiva-khanate', 'kokand-khanate'],
    },
    absent: [
      ['khwarezmia', 1200, 'transoxiana'],
      ['timurid', 1490, 'chach'],
    ],
    present: [
      ['khwarezmia', 1215, 'transoxiana'],
      ['timurid', 1400, 'khwarazm'],
      ['bukhara-khanate', 1590, 'khurasan'],
    ],
    // Anachronisms fixed: shapes that spread over the oases in other powers' years.
    notOver: [
      ['russian-empire', 1800, 66.96, 39.65, 'Samarkand'],
      ['russian-empire', 1800, 64.42, 39.77, 'Bukhara'],
      ['russian-empire', 1800, 60.36, 41.38, 'Khiva'],
      ['sassanid-empire', 400, 66.96, 39.65, 'Samarkand'],
      ['sassanid-empire', 400, 64.42, 39.77, 'Bukhara'],
      ['gokturk-khaganate', 580, 66.96, 39.65, 'Samarkand'],
      ['khwarezmia', 1200, 66.96, 39.65, 'Samarkand'],
      ['mongol-empire', 1215, 66.96, 39.65, 'Samarkand'],
      ['mongol-empire', 1215, 59.15, 42.33, 'Gurganj'],
    ],
    // The pack's shapes and the older shapes around them never overlap (every 5 years, 0.1° grid).
    // (The Safavids' schematic 'persia' ring is not listed: it still takes in Herat while Abdullah
    // Khan II held it, 1588–98.)
    noOverlap: {
      from: 305,
      to: 1815,
      box: [55, 34, 78, 46],
      planar: true,
      with: ['timurid', 'sassanid-empire', 'gokturk-khaganate', 'russian-empire', 'mughal-empire'],
      // Fade-out remnants: in a step year a region that is given up is drawn at 12% size and faint
      // about its centre (here the Timurid Transoxiana in 1500, the year Shaybani takes Samarkand).
      remnants: [[1500, 'timurid', 'transoxiana']],
    },
  },
  {
    country: 'kazakhstan',
    polities: kazakhstanPolities,
    fixes: kazakhstanShapeFixes,
    // Kokand's Syr Darya region (1814–15) is drawn from the pieces (land-checked).
    redrawn: { 'kokand-khanate': ['steppe'] },
    // The Russian Empire's Western Siberia ring is trimmed north of the steppe before the fort lines.
    trimmed: ['russian-empire'],
    notOver: [
      ['russian-empire', 1730, 63.62, 53.2, 'Kostanay'],
      ['russian-empire', 1730, 73.1, 49.8, 'Karaganda'],
      ['russian-empire', 1740, 66.5, 51.5, 'the Turgay steppe'],
      ['russian-empire', 1800, 57.23, 50.28, 'Aktobe'],
      ['russian-empire', 1800, 76.95, 51.0, 'the Pavlodar steppe'],
    ],
    capitals: [
      ['wusun', -130, 77.61, 43.33, 'Issyk (Zhetysu)'],
      ['kangju', -128, 68.30, 42.85, 'Otrar oasis'],
      ['turgesh', 699, 75.2, 42.81, 'Suyab'],
      ['turgesh', 717, 71.37, 42.9, 'Taraz'],
      ['oghuz-yabgu', 750, 61.92, 45.61, 'Yangikent'],
      ['kimek-kipchak', 880, 80.27, 50.43, 'Irtysh (Semey)'],
      ['kimek-kipchak', 1055, 67.65, 53.3, 'Ishim steppe'],
      ['moghulistan', 1347, 81.28, 43.91, 'Almaliq / Kulja'],
      ['moghulistan', 1347, 77.23, 43.3, 'Talgar'],
      ['abulkhair-khanate', 1446, 66.96, 44.16, 'Sighnaq'],
      ['nogai-horde', 1440, 51.73, 47.5, 'Saraychik'],
      ['kazakh-khanate-early', 1465, 71.37, 42.9, 'Taraz (Chu and Talas)'],
      ['kazakh-khanate-early', 1470, 66.96, 44.16, 'Sighnaq'],
      ['kazakh-khanate-early', 1511, 68.27, 43.3, 'Turkestan'],
      ['kazakh-khanate-early', 1598, 69.24, 41.3, 'Tashkent'],
      ['kazakh-khanate-early', 1718, 68.27, 43.3, 'Turkestan'],
      ['kazakh-khanate-early', 1815, 76.89, 43.24, 'Almaty (Senior jüz)'],
      ['dzungar-khanate', 1634, 81.28, 43.91, 'Ghulja'],
      ['dzungar-khanate', 1723, 68.27, 43.3, 'Turkestan'],
      ['kokand-khanate', 1815, 68.27, 43.3, 'Turkestan'],
    ],
    on: {
      [-100]: ['wusun', 'kangju'],
      720: ['turgesh'],
      900: ['oghuz-yabgu', 'kimek-kipchak'],
      1100: ['kimek-kipchak'],
      1400: ['moghulistan'],
      1450: ['moghulistan', 'abulkhair-khanate', 'nogai-horde'],
      1550: ['kazakh-khanate-early', 'nogai-horde'],
      1700: ['kazakh-khanate-early', 'dzungar-khanate'],
      1800: ['kazakh-khanate-early'],
      1815: ['kazakh-khanate-early', 'kokand-khanate'],
    },
    gone: {
      [-200]: ['wusun', 'kangju'],
      500: ['wusun', 'kangju'],
      800: ['turgesh'],
      1100: ['oghuz-yabgu'],
      1230: ['kimek-kipchak'],
      1300: ['moghulistan'],
      1480: ['abulkhair-khanate'],
      1530: ['moghulistan'],
      1650: ['nogai-horde'],
      1760: ['dzungar-khanate'],
    },
    absent: [
      ['kazakh-khanate-early', 1730, 'senior'],
      ['kokand-khanate', 1800, 'steppe'],
    ],
    present: [
      ['dzungar-khanate', 1730, 'west'],
      ['kazakh-khanate-early', 1760, 'senior'],
      ['kazakh-khanate-early', 1780, 'junior'],
      ['kokand-khanate', 1814, 'steppe'],
    ],
    // The pack's shapes and the older shapes around them never overlap (every 5 years, 0.1° grid).
    noOverlap: {
      from: -130,
      to: 1815,
      box: [46, 40, 92, 56],
      planar: true,
      with: ['khazar-khaganate', 'karakhanid-khanate', 'khwarezmia', 'timurid', 'bukhara-khanate', 'khiva-khanate', 'kokand-khanate', 'gokturk-khaganate', 'mongol-empire', 'russian-empire', 'qing-china'],
    },
  },
];

let rings = 0;
for (const pack of PACKS.filter((p) => !process.env.PACK || p.country === process.env.PACK)) {
  const file = new URL(`../data/countries/${pack.country}.json`, import.meta.url);
  const items = new Set(JSON.parse(fs.readFileSync(file, 'utf8')).items.map((i) => i.id));
  const civIds = new Set(civilisations.map((c) => c.id));
  const byId = new Map(spatialEntities.map((e) => [e.id, e]));
  const checkRing = (tag, ring) => {
    rings += 1;
    const a = ring[0];
    const b = ring[ring.length - 1];
    if (a[0] !== b[0] || a[1] !== b[1]) fail(`${tag} is not closed`);
    if (crossings(ring)) fail(`${tag} crosses itself`);
    const { off, share } = landStats(ring, pack.fineLand ? (lat, lng) => landAtSimple(lat, lng) || landAtFine(lat, lng) : landAtSimple);
    if (off.length) fail(`${tag}: ${off.length} vertex(es) in the sea, e.g. ${off[0].map((v) => v.toFixed(2)).join(',')}`);
    if (share < 0.97) fail(`${tag}: only ${(share * 100).toFixed(0)}% of its interior is land`);
  };

  for (const e of pack.polities) {
    if (byId.get(e.id) !== e) fail(`${e.id} not wired into spatialEntities`);
    for (const o of e.overlays) {
      if (o.year > 1815) fail(`${e.id} has a keyframe after 1815 (${o.year})`);
      for (const r of o.regions) checkRing(`${e.id} ${o.year} ${r.id}`, r.ring);
    }
    if (!e.confidence?.level || !e.confidence?.reason) fail(`${e.id} missing confidence`);
    if (!(e.sources || []).length) fail(`${e.id} has no sources`);
    for (const s of e.sources || []) if (!/^https:\/\//.test(s.url || '')) fail(`${e.id} source without an https url: ${s.title}`);
    if ((e.overlays || []).length < 3) fail(`${e.id} has fewer than 3 keyframes`);
    if (!(e.timelineItemIds || []).some((t) => items.has(t))) fail(`${e.id} links no ${pack.country} timeline item`);
    for (const t of e.timelineItemIds || []) if (!items.has(t) && !civIds.has(t)) fail(`${e.id} links missing timeline entry ${t}`);
  }

  for (const [id, regionIds] of Object.entries(pack.redrawn)) {
    const e = byId.get(id);
    if (!e) {
      fail(`redrawn entity ${id} missing`);
      continue;
    }
    for (const o of e.overlays) {
      for (const r of o.regions) {
        const rid = typeof r === 'string' ? r : r.id;
        if (!regionIds.includes(rid)) continue;
        checkRing(`${id} ${o.year} ${rid}`, resolveRegionRing(r));
      }
    }
  }
  for (const id of Object.keys(pack.fixes)) {
    if (pack.redrawn[id] || pack.offshore?.entities.includes(id) || (pack.dropped || []).some(([d]) => d === id)) continue;
    if (pack.droppedEntities?.includes(id) || pack.trimmed?.includes(id)) continue;
    fail(`fix target ${id} is not land-checked`);
  }
  for (const id of pack.droppedEntities || []) if (byId.has(id)) fail(`${id} should have been dropped by the ${pack.country} pack`);
  for (const id of pack.trimmed || []) if (!(pack.notOver || []).some(([e]) => e === id)) fail(`trimmed ${id} has no notOver test`);

  for (const [id, y, lng, lat, place] of pack.capitals) {
    const kf = byId.get(id)?.overlays.find((o) => o.year === y);
    if (!kf) {
      fail(`${id} has no ${y} keyframe`);
      continue;
    }
    const ringsAt = kf.regions.map((r) => resolveRegionRing(r)).filter(Boolean);
    const inside = ringsAt.some((ring) => geoContains({ type: 'Polygon', coordinates: [ensureClockwise(ring)] }, [lng, lat]));
    const near = ringsAt.some((ring) => edgeKm(ring, lng, lat) < 10);
    if (!inside && !near) fail(`${place} is outside ${id} in ${y}`);
  }

  const activeAt = (y) => getActiveOverlaysAtYear(Number(y), spatialEntities);
  for (const [y, ids] of Object.entries(pack.on)) {
    const on = new Set(activeAt(y).map((a) => a.entity.id));
    for (const id of ids) if (!on.has(id)) fail(`${id} should be on the globe in ${y}`);
  }
  for (const [y, ids] of Object.entries(pack.gone)) {
    const on = new Set(activeAt(y).map((a) => a.entity.id));
    for (const id of ids) if (on.has(id)) fail(`${id} should be gone by ${y}`);
  }
  const regionOn = (id, y, rid) => getOverlayPolygonFeatures(Number(y), spatialEntities).some((f) => f.entityId === id && f.regionId === rid);
  for (const [id, y, rid] of pack.absent) if (regionOn(id, y, rid)) fail(`${id} ${rid} should not be drawn in ${y}`);
  for (const [id, y, rid] of pack.present) if (!regionOn(id, y, rid)) fail(`${id} ${rid} should be drawn in ${y}`);
  if (pack.offshore) {
    const { coast, west, east, entities, years } = pack.offshore;
    const sea = coast.filter(([lng]) => lng >= west && lng <= east).flatMap(([lng, lat]) => [[lng, lat - 0.25], [lng, lat - 0.65]]);
    for (const y of years) {
      const feats = getOverlayPolygonFeatures(y, spatialEntities).filter((f) => entities.includes(f.entityId));
      const wet = sea.find((pt) => feats.some((f) => geoContains(f, pt)));
      if (wet) fail(`${pack.country}: a presence band shades the sea off the coast in ${y} at ${wet.map((v) => v.toFixed(2)).join(',')}`);
    }
  }
  for (const [id, rid] of pack.dropped || []) {
    const e = byId.get(id);
    if (!e) fail(`dropped-region entity ${id} missing`);
    else if (e.overlays.some((o) => o.regions.some((r) => (typeof r === 'string' ? r : r.id) === rid))) fail(`${id} still has its ${rid} region`);
  }
  for (const [id, y, lng, lat, place] of pack.notOver || []) {
    const over = getOverlayPolygonFeatures(Number(y), spatialEntities).some((f) => f.entityId === id && geoContains(f, [lng, lat]));
    if (over) fail(`${id} still covers ${place} in ${y}`);
  }
  if (pack.noOverlap) {
    const { from, to, box: [x0, y0, x1, y1], planar = false } = pack.noOverlap;
    const ids = new Set(pack.polities.map((e) => e.id));
    const others = new Set(pack.noOverlap.with || []);
    let worst = null;
    for (let y = from; y <= to && !worst; y += 5) {
      const remnant = (f) => (pack.noOverlap.remnants || []).some(([ry, re, rr]) => ry === y && re === f.entityId && rr === f.regionId);
      const all = getOverlayPolygonFeatures(y, spatialEntities).filter((f) => (ids.has(f.entityId) || others.has(f.entityId)) && !remnant(f));
      const feats = planar ? all.map(planarFeature) : all.map((f) => ({ f, has: (x, yy) => geoContains(f, [x, yy]) }));
      for (let lat = y0; lat < y1 && !worst; lat += 0.1) {
        for (let lng = x0; lng < x1; lng += 0.1) {
          const hit = feats.filter((q) => q.has(lng, lat)).map((q) => q.f);
          // Two of the pack's shapes, or one of them and a listed neighbour (a neighbour's own regions may overlap each other).
          const own = hit.filter((f) => ids.has(f.entityId));
          if (own.length > 1 || (own.length === 1 && hit.length > 1)) {
            worst = `${y}: ${hit.map((f) => `${f.entityId}/${f.regionId}`).join(' + ')} at ${lng.toFixed(2)},${lat.toFixed(2)}`;
            break;
          }
        }
      }
    }
    if (worst) fail(`${pack.country} shapes overlap — ${worst}`);
  }
  if (pack.enclaves) {
    // Each enclave is drawn by exactly one shape in its own years, and by its host after it is given up.
    // (A shape in its fade-out year is drawn at 12% size and faint; such remnants don't count.)
    const { shapes, rule } = pack.enclaves;
    const area = (ring) => Math.abs(ring.slice(0, -1).reduce((t, p, i) => t + p[0] * ring[i + 1][1] - ring[i + 1][0] * p[1], 0)) / 2;
    const years = [...new Set(rule.flatMap(([, , f, t]) => [f, t - 1, t].filter((v) => v <= 1815)))];
    for (const y of years) {
      const feats = getOverlayPolygonFeatures(y, spatialEntities).filter((f) => pack.polities.some((e) => e.id === f.entityId)).map(planarFeature);
      for (const [eid, pid, f, t] of rule) {
        const ring = shapes[eid].ring;
        const c = [ring.slice(0, -1).reduce((a, p) => a + p[0], 0) / (ring.length - 1), ring.slice(0, -1).reduce((a, p) => a + p[1], 0) / (ring.length - 1)];
        const big = area(ring) * 0.3;
        const hit = feats.filter((q) => q.has(c[0], c[1]) && area(q.f.geometry.coordinates[0]) > big).map((q) => q.f.entityId);
        if (hit.length > 1) fail(`${eid} is drawn twice in ${y}: ${hit.join(' + ')}`);
        if (y >= f && y < t && !hit.includes(pid)) fail(`${eid} should be ${pid}'s in ${y} (drawn: ${hit.join(', ') || 'none'})`);
      }
    }
  }
}
if (MERGE_STATS.problems.length) fail(`pieces that do not merge into one outline: ${MERGE_STATS.problems.slice(0, 3).join('; ')}`);

if (failed) {
  console.error(`check-country-packs: ${failed} problem(s)`);
  process.exit(1);
}
const n = PACKS.reduce((t, p) => t + p.polities.length, 0);
const caps = PACKS.reduce((t, p) => t + p.capitals.length, 0);
console.log(`✓ country packs (${PACKS.map((p) => p.country).join(', ')}): ${n} polities, ${rings} clean on-land outlines, ${caps} sites inside, anachronisms fixed`);
