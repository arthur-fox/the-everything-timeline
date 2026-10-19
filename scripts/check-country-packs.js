/**
 * Day 65: checks for Phase 5 country-pack globe backfills (ROADMAP item 12), starting with Peru
 * (src/globe-pack-peru.js). Add a pack to PACKS to cover it.
 *  - every ring is closed and does not cross itself;
 *  - shapes stay on land: every vertex is on land or the coast, and ≥97% of an interior grid is
 *    on land (no Pacific spill), for the pack's polities and the shapes it redrew;
 *  - every polity has sources, confidence with a reason, ≥3 keyframes, no keyframe after 1815 and
 *    timeline links that exist (country items or civilisations);
 *  - capitals / type sites sit inside (or within ~10 km of the coast-hugging edge of) their polity;
 *  - who is on and who is gone at sample years, and the anachronisms the pack fixed stay fixed.
 */
import fs from 'node:fs';
import { geoContains } from 'd3-geo';
import { peruPolities, peruShapeFixes } from '../src/globe-pack-peru.js';
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
  for (const id of Object.keys(pack.fixes)) if (!pack.redrawn[id]) fail(`fix target ${id} is not land-checked`);

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
}

if (failed) {
  console.error(`check-country-packs: ${failed} problem(s)`);
  process.exit(1);
}
const n = PACKS.reduce((t, p) => t + p.polities.length, 0);
const caps = PACKS.reduce((t, p) => t + p.capitals.length, 0);
console.log(`✓ country packs (${PACKS.map((p) => p.country).join(', ')}): ${n} polities, ${rings} clean on-land outlines, ${caps} sites inside, anachronisms fixed`);
