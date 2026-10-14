/**
 * Day 60: checks for Native American / Indigenous nations on the globe
 * (src/globe-native-nations.js).
 *  - every ring is closed and does not cross itself;
 *  - every polity has sources, confidence, ≥3 keyframes, timeline links, type indigenous;
 *  - rings stay on land (centroids / sample vertices are not in the open ocean);
 *  - era names switch at the right years (Removal → Indian Territory, Comancheria → Fort Sill …);
 *  - capitals / council seats sit inside their polity at a real date;
 *  - who is on and who is gone at sample years (including after the 1815 nations handoff).
 */
import { geoContains } from 'd3-geo';
import { nativeNationsPolities as POLS } from '../src/globe-native-nations.js';
import { getActiveOverlaysAtYear, entityNameAt, spatialEntities } from '../src/globe-overlays.js';
import { getGlobePolygonFeatures, setNationsTopology, isSupersededByNations } from '../src/globe-nations.js';
import { civilisations } from '../src/civilisations.js';
import { landAt } from './flow-geo.js';
import { readFileSync } from 'node:fs';

const topo = JSON.parse(readFileSync(new URL('../src/data/nations.topo.json', import.meta.url), 'utf8'));
setNationsTopology(topo);

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

function ringCentroid(ring) {
  let x = 0;
  let y = 0;
  const pts = ring.slice(0, -1);
  for (const [lng, lat] of pts) {
    x += lng;
    y += lat;
  }
  return [x / pts.length, y / pts.length];
}

const REQUIRED = [
  'haudenosaunee', 'cherokee', 'muscogee', 'powhatan', 'choctaw', 'chickasaw',
  'seminole', 'lakota', 'comanche', 'navajo', 'apache', 'mapuche',
];
const civIds = new Set(civilisations.map((c) => c.id));
const have = new Set(POLS.map((e) => e.id));
for (const id of REQUIRED) if (!have.has(id)) fail(`missing polity ${id}`);

let rings = 0;
for (const e of POLS) {
  if (e.type !== 'indigenous') fail(`${e.id} should have type indigenous (persists past 1815)`);
  for (const o of e.overlays) {
    for (const r of o.regions) {
      rings += 1;
      const a = r.ring[0];
      const b = r.ring[r.ring.length - 1];
      if (a[0] !== b[0] || a[1] !== b[1]) fail(`${e.id} ${o.year} ${r.id} is not closed`);
      if (crossings(r.ring)) fail(`${e.id} ${o.year} ${r.id} crosses itself`);
      const [clng, clat] = ringCentroid(r.ring);
      if (!landAt(clat, clng)) fail(`${e.id} ${o.year} ${r.id} centroid ${clat.toFixed(2)},${clng.toFixed(2)} is not on land`);
      // A few vertices must also be on/near land (no ocean-spanning blob).
      let landish = 0;
      for (let i = 0; i < r.ring.length - 1; i += Math.max(1, Math.floor((r.ring.length - 1) / 4))) {
        const [lng, lat] = r.ring[i];
        if (landAt(lat, lng)) landish += 1;
      }
      if (landish < 2) fail(`${e.id} ${o.year} ${r.id} looks like it sits in the ocean`);
    }
  }
  if (!e.confidence?.level || !e.confidence?.reason) fail(`${e.id} missing confidence`);
  if (!(e.sources || []).length) fail(`${e.id} has no sources`);
  if ((e.overlays || []).length < 3) fail(`${e.id} has fewer than 3 keyframes`);
  if (!(e.timelineItemIds || []).length) fail(`${e.id} missing timelineItemIds`);
  for (const tid of e.timelineItemIds || []) if (!civIds.has(tid)) fail(`${e.id} links missing timeline entry ${tid}`);
  if (isSupersededByNations(e, 1850)) fail(`${e.id} must not be superseded by nations in 1850`);
}

const byId = new Map(spatialEntities.map((e) => [e.id, e]));
for (const id of REQUIRED) {
  if (byId.get(id) !== POLS.find((e) => e.id === id)) fail(`${id} not wired into spatialEntities`);
}

const NAMES = [
  ['haudenosaunee', 1650, 'Haudenosaunee (Iroquois Confederacy)'],
  ['haudenosaunee', 1850, 'Haudenosaunee reservations'],
  ['cherokee', 1820, 'Cherokee Nation (Southeast)'],
  ['cherokee', 1839, 'Cherokee Nation (Indian Territory)'],
  ['muscogee', 1836, 'Muscogee Nation (Indian Territory)'],
  ['powhatan', 1646, 'Powhatan remnant'],
  ['lakota', 1868, 'Great Sioux Reservation'],
  ['lakota', 1890, 'Lakota / Dakota reservations'],
  ['comanche', 1800, 'Comancheria'],
  ['comanche', 1875, 'Comanche Reservation (Fort Sill)'],
  ['navajo', 1864, 'Diné at Bosque Redondo'],
  ['navajo', 1868, 'Navajo Nation (treaty reservation)'],
  ['mapuche', 1641, 'Mapuche (independent Wallmapu)'],
  ['mapuche', 1883, 'Mapuche after Occupation of Araucanía'],
];
for (const [id, y, want] of NAMES) {
  const got = entityNameAt(byId.get(id), y);
  if (got !== want) fail(`${id} in ${y}: name ${got}, expected ${want}`);
}

// Capitals / seats inside keyframes: [id, year, lng, lat, place]
const CAPITALS = [
  ['haudenosaunee', 1500, -76.15, 42.95, 'Onondaga'],
  ['cherokee', 1820, -84.91, 34.54, 'New Echota'],
  ['cherokee', 1839, -94.97, 35.92, 'Tahlequah'],
  ['muscogee', 1820, -85.5, 32.5, 'Muscogee heartland'],
  ['muscogee', 1836, -95.96, 35.62, 'Okmulgee area'],
  ['powhatan', 1607, -76.65, 37.41, 'Werowocomoco'],
  ['choctaw', 1820, -88.95, 32.92, 'Nanih Waiya'],
  ['choctaw', 1831, -95.0, 34.0, 'Choctaw IT'],
  ['chickasaw', 1837, -96.68, 34.24, 'Tishomingo'],
  ['seminole', 1820, -81.5, 28.0, 'Seminole Florida'],
  ['lakota', 1868, -102.5, 44.5, 'Great Sioux Reservation'],
  ['lakota', 1890, -102.56, 43.03, 'Pine Ridge'],
  ['comanche', 1800, -101.0, 34.0, 'Comancheria'],
  ['comanche', 1875, -98.42, 34.67, 'Fort Sill'],
  ['navajo', 1750, -109.5, 36.0, 'Dinétah'],
  ['navajo', 1864, -104.35, 33.40, 'Bosque Redondo'],
  ['navajo', 1868, -109.05, 35.68, 'Window Rock area'],
  ['mapuche', 1641, -72.0, -39.0, 'Wallmapu'],
  ['mapuche', 1883, -72.59, -38.74, 'Temuco area'],
];
for (const [id, y, lng, lat, place] of CAPITALS) {
  const kf = byId.get(id).overlays.find((o) => o.year === y);
  if (!kf) {
    fail(`${id} has no ${y} keyframe`);
    continue;
  }
  const inside = kf.regions.some((r) => geoContains({ type: 'Polygon', coordinates: [r.ring] }, [lng, lat]));
  if (!inside) fail(`${place} is outside ${id} in ${y}`);
}

const EXPECT = {
  1607: ['powhatan', 'haudenosaunee', 'cherokee', 'muscogee', 'choctaw', 'mapuche'],
  1750: ['haudenosaunee', 'cherokee', 'muscogee', 'choctaw', 'seminole', 'navajo', 'apache', 'mapuche'],
  1820: ['haudenosaunee', 'cherokee', 'muscogee', 'choctaw', 'chickasaw', 'seminole', 'lakota', 'comanche', 'mapuche'],
  1839: ['cherokee', 'muscogee', 'choctaw', 'chickasaw', 'haudenosaunee', 'lakota', 'comanche', 'mapuche'],
  1868: ['lakota', 'navajo', 'cherokee', 'comanche', 'mapuche'],
  1890: ['lakota', 'comanche', 'navajo', 'apache', 'mapuche', 'cherokee'],
};
const GONE = {
  1700: ['powhatan'],
  1845: ['powhatan'],
};
for (const [y, ids] of Object.entries(EXPECT)) {
  const on = new Set(getActiveOverlaysAtYear(Number(y), spatialEntities).map((a) => a.entity.id));
  for (const id of ids) if (!on.has(id)) fail(`${id} should be on the globe in ${y}`);
}
for (const [y, ids] of Object.entries(GONE)) {
  const on = new Set(getActiveOverlaysAtYear(Number(y), spatialEntities).map((a) => a.entity.id));
  for (const id of ids) if (on.has(id)) fail(`${id} should be gone by ${y}`);
}

// After the nations handoff, indigenous shapes must still appear in the combined globe features.
for (const y of [1830, 1839, 1868, 1890]) {
  const ids = new Set(getGlobePolygonFeatures(y).map((f) => f.entityId));
  for (const id of ['cherokee', 'lakota', 'mapuche']) {
    if (!ids.has(id)) fail(`${id} missing from getGlobePolygonFeatures(${y}) (must persist past 1815)`);
  }
}

if (failed) {
  console.error(`check-native-nations: ${failed} problem(s)`);
  process.exit(1);
}
console.log(
  `✓ native nations: ${POLS.length} polities, ${rings} clean on-land outlines, ${CAPITALS.length} seats inside, ${Object.keys(EXPECT).length} sample years OK (persists past 1815)`,
);
