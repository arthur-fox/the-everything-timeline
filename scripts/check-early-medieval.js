/**
 * Day 57: checks for the early medieval world on the globe (src/globe-early-medieval.js).
 *  - no ring crosses itself or fails to close;
 *  - era names (nameAt) are in order, and labels switch at the right years;
 *  - the key polities are on the globe at sample years 600 / 750 / 800 / 900, and
 *    Visigoths / Göktürks are gone after their fall.
 */
import { earlyMedievalPolities } from '../src/globe-early-medieval.js';
import { getActiveOverlaysAtYear, entityNameAt, spatialEntities } from '../src/globe-overlays.js';

let failed = 0;
const fail = (m) => {
  failed += 1;
  console.error(`FAIL: ${m}`);
};

function crossings(ring) {
  const o = ring.slice(0, -1);
  const n = o.length;
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const hit = (p1, p2, p3, p4) => {
    const d1 = d(p3, p4, p1);
    const d2 = d(p3, p4, p2);
    const d3 = d(p1, p2, p3);
    const d4 = d(p1, p2, p4);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (hit(o[i], o[(i + 1) % n], o[j], o[(j + 1) % n])) count += 1;
    }
  }
  const seen = new Set();
  for (const p of o) {
    const k = p.join();
    if (seen.has(k)) count += 1;
    seen.add(k);
  }
  return count;
}

const REQUIRED = [
  'frankish-empire',
  'visigothic-kingdom',
  'anglo-saxon-kingdoms',
  'avar-khaganate',
  'khazar-khaganate',
  'gokturk-khaganate',
  'uyghur-khaganate',
  'tibetan-empire',
  'nanzhao',
  'silla',
  'srivijaya',
];
const have = new Set(earlyMedievalPolities.map((e) => e.id));
for (const id of REQUIRED) if (!have.has(id)) fail(`missing polity ${id}`);

let rings = 0;
const checked = new Set();
for (const e of earlyMedievalPolities) {
  for (const o of e.overlays) {
    for (const r of o.regions) {
      if (!r?.ring || checked.has(r.ring)) continue;
      checked.add(r.ring);
      rings += 1;
      const a = r.ring[0];
      const b = r.ring[r.ring.length - 1];
      if (!a || !b || a[0] !== b[0] || a[1] !== b[1]) fail(`${e.id} ${o.year} ${r.id} is not closed`);
      const c = crossings(r.ring);
      if (c) fail(`${e.id} ${o.year} ${r.id} crosses itself (${c})`);
    }
  }
  if (e.nameAt) {
    for (let i = 1; i < e.nameAt.length; i++) {
      if (!(e.nameAt[i][0] > e.nameAt[i - 1][0])) fail(`${e.id} nameAt not ascending`);
    }
  }
  if (!e.confidence?.level || !e.confidence?.reason) fail(`${e.id} missing confidence`);
  if (!Array.isArray(e.timelineItemIds) || !e.timelineItemIds.length) fail(`${e.id} missing timelineItemIds`);
}

const byId = new Map(spatialEntities.map((e) => [e.id, e]));
for (const id of REQUIRED) {
  if (!byId.has(id)) fail(`${id} not wired into spatialEntities`);
}

const NAMES = [
  ['frankish-empire', 600, 'Merovingian Francia'],
  ['frankish-empire', 800, 'Carolingian Empire'],
  ['frankish-empire', 843, 'Frankish realms (after Verdun)'],
  ['visigothic-kingdom', 500, 'Visigothic Kingdom (Toulouse)'],
  ['visigothic-kingdom', 600, 'Visigothic Kingdom (Toledo)'],
  ['anglo-saxon-kingdoms', 700, 'Anglo-Saxon kingdoms (Heptarchy)'],
  ['anglo-saxon-kingdoms', 927, 'Kingdom of the English'],
  ['gokturk-khaganate', 580, 'First Turkic Khaganate'],
  ['gokturk-khaganate', 700, 'Second Turkic Khaganate'],
  ['silla', 600, 'Silla'],
  ['silla', 700, 'Unified Silla'],
];
for (const [id, y, want] of NAMES) {
  const got = entityNameAt(byId.get(id), y);
  if (got !== want) fail(`${id} in ${y}: name ${got}, expected ${want}`);
}

const EXPECT = {
  600: ['frankish-empire', 'visigothic-kingdom', 'anglo-saxon-kingdoms', 'avar-khaganate', 'gokturk-khaganate', 'silla'],
  750: ['frankish-empire', 'anglo-saxon-kingdoms', 'khazar-khaganate', 'uyghur-khaganate', 'tibetan-empire', 'nanzhao', 'silla', 'srivijaya', 'tang-china'],
  800: ['frankish-empire', 'anglo-saxon-kingdoms', 'avar-khaganate', 'khazar-khaganate', 'uyghur-khaganate', 'tibetan-empire', 'nanzhao', 'silla', 'srivijaya'],
  900: ['anglo-saxon-kingdoms', 'khazar-khaganate', 'silla', 'srivijaya'],
};
const GONE = {
  720: ['visigothic-kingdom'],
  760: ['gokturk-khaganate'],
  850: ['uyghur-khaganate', 'avar-khaganate'],
  860: ['tibetan-empire'],
};
for (const [y, ids] of Object.entries(EXPECT)) {
  const on = new Set(getActiveOverlaysAtYear(Number(y), spatialEntities).map((a) => a.entity.id));
  for (const id of ids) if (!on.has(id)) fail(`${id} should be on the globe in ${y}`);
}
for (const [y, ids] of Object.entries(GONE)) {
  const on = new Set(getActiveOverlaysAtYear(Number(y), spatialEntities).map((a) => a.entity.id));
  for (const id of ids) if (on.has(id)) fail(`${id} should be gone by ${y}`);
}

if (failed) {
  console.error(`check-early-medieval: ${failed} problem(s)`);
  process.exit(1);
}
console.log(
  `✓ early medieval: ${earlyMedievalPolities.length} polities, ${rings} clean outlines, era names and ${Object.keys(EXPECT).length} sample years OK`,
);
