/**
 * Day 65: checks for Phase 5 country-pack globe backfills (ROADMAP item 12), starting with Peru
 * (src/globe-pack-peru.js), Ghana (Day 66, src/globe-pack-ghana.js), Morocco (Day 68,
 * src/globe-pack-morocco.js) and Kenya (Day 69, src/globe-pack-kenya.js). Add a pack to PACKS to cover it.
 *  - every ring is closed and does not cross itself;
 *  - shapes stay on land: every vertex is on land or the coast, and ≥97% of an interior grid is
 *    on land (no Pacific spill), for the pack's polities and the shapes it redrew;
 *  - every polity has sources, confidence with a reason, ≥3 keyframes, no keyframe after 1815 and
 *    timeline links that exist (country items or civilisations);
 *  - capitals / type sites sit inside (or within ~10 km of the coast-hugging edge of) their polity;
 *  - who is on and who is gone at sample years, and the anachronisms the pack fixed stay fixed;
 *  - (Day 66+) the pack's shapes never overlap each other — and (Day 68) the neighbours it lists —
 *    at any sampled year, and (Day 68) each coastal enclave is drawn by exactly one shape;
 *  - (Day 69) a region the pack dropped from an older shape stays dropped (`dropped`).
 */
import fs from 'node:fs';
import { geoContains } from 'd3-geo';
import { peruPolities, peruShapeFixes } from '../src/globe-pack-peru.js';
import { ghanaPolities, ghanaShapeFixes, GOLD_COAST } from '../src/globe-pack-ghana.js';
import { moroccoPolities, moroccoShapeFixes, ENCLAVE_SHAPES, ENCLAVE_RULE } from '../src/globe-pack-morocco.js';
import { kenyaPolities, kenyaShapeFixes } from '../src/globe-pack-kenya.js';
import { MERGE_STATS } from '../src/globe-med-pieces.js';
import { getActiveOverlaysAtYear, getOverlayPolygonFeatures, spatialEntities, resolveRegionRing } from '../src/globe-overlays.js';
import { civilisations } from '../src/civilisations.js';
import { ensureClockwise } from '../src/globe-morph.js';
import { landAt } from './flow-geo.js';

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
function landStats(ring) {
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
];

let rings = 0;
for (const pack of PACKS) {
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
    const { off, share } = landStats(ring);
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
  for (const id of Object.keys(pack.fixes)) if (!pack.redrawn[id] && !pack.offshore?.entities.includes(id) && !(pack.dropped || []).some(([d]) => d === id)) fail(`fix target ${id} is not land-checked`);

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
      const all = getOverlayPolygonFeatures(y, spatialEntities).filter((f) => ids.has(f.entityId) || others.has(f.entityId));
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
