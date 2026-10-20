/**
 * Day 58: checks for inland Africa on the globe (src/globe-inland-africa.js).
 *  - every ring is closed and does not cross itself;
 *  - every polity has sources, a confidence level with a reason, ≥3 keyframes, no keyframe
 *    after 1815 (the nations layer takes over) and a timeline entry that exists;
 *  - era names switch at the right years (Kanem → Bornu, Solomonic → Gondar → Era of the Princes);
 *  - each capital sits inside its polity at a real date (Koumbi Saleh 1000, Niani 1324, Gao 1500 …);
 *  - who is on and who is gone at sample years.
 */
import { geoContains } from 'd3-geo';
import { inlandAfricaPolities } from '../src/globe-inland-africa.js';
import { ghanaPolities } from '../src/globe-pack-ghana.js';
import { getActiveOverlaysAtYear, entityNameAt, spatialEntities } from '../src/globe-overlays.js';
import { civilisations } from '../src/civilisations.js';

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

const REQUIRED = [
  'ghana-empire-ov', 'mali-empire', 'songhai-empire', 'kanem-bornu', 'hausa-states', 'sokoto-caliphate',
  'benin-kingdom', 'oyo-empire', 'asante-empire', 'kongo', 'luba-kingdom', 'lunda-empire',
  'great-zimbabwe', 'mutapa', 'axum', 'zagwe-dynasty', 'ethiopian-empire', 'swahili-city-states', 'buganda',
];
const civIds = new Set(civilisations.map((c) => c.id));
const have = new Set(inlandAfricaPolities.map((e) => e.id));
for (const id of REQUIRED) if (!have.has(id)) fail(`missing polity ${id}`);

let rings = 0;
for (const e of inlandAfricaPolities) {
  for (const o of e.overlays) {
    for (const r of o.regions) {
      rings += 1;
      const a = r.ring[0];
      const b = r.ring[r.ring.length - 1];
      if (a[0] !== b[0] || a[1] !== b[1]) fail(`${e.id} ${o.year} ${r.id} is not closed`);
      if (crossings(r.ring)) fail(`${e.id} ${o.year} ${r.id} crosses itself`);
    }
  }
  if (!e.confidence?.level || !e.confidence?.reason) fail(`${e.id} missing confidence`);
  if (!(e.sources || []).length) fail(`${e.id} has no sources`);
  if ((e.overlays || []).length < 3) fail(`${e.id} has fewer than 3 keyframes`);
  if (!(e.timelineItemIds || []).length) fail(`${e.id} missing timelineItemIds`);
  for (const t of e.timelineItemIds || []) if (!civIds.has(t)) fail(`${e.id} links missing timeline entry ${t}`);
  if (e.overlays.some((o) => o.year > 1815)) fail(`${e.id} has a keyframe after 1815 (nations layer takes over)`);
}

const byId = new Map(spatialEntities.map((e) => [e.id, e]));
// Day 66: a country pack may redraw one of these under the same id (the Ghana pack's Asante).
const PACK_REDRAWS = new Map(ghanaPolities.map((e) => [e.id, e]));
for (const id of REQUIRED) {
  const want = PACK_REDRAWS.get(id) || inlandAfricaPolities.find((e) => e.id === id);
  if (byId.get(id) !== want) fail(`${id} not wired into spatialEntities`);
}

const NAMES = [
  ['kanem-bornu', 1200, 'Kanem'],
  ['kanem-bornu', 1500, 'Bornu'],
  ['ethiopian-empire', 1450, 'Ethiopian Empire (Solomonic)'],
  ['ethiopian-empire', 1700, 'Ethiopian Empire (Gondar)'],
  ['ethiopian-empire', 1800, 'Ethiopia (Era of the Princes)'],
];
for (const [id, y, want] of NAMES) {
  const got = entityNameAt(byId.get(id), y);
  if (got !== want) fail(`${id} in ${y}: name ${got}, expected ${want}`);
}

// Capitals inside their polity's keyframe at a real date: [id, year, lng, lat, place]
const CAPITALS = [
  ['ghana-empire-ov', 1000, -8.0, 15.77, 'Koumbi Saleh'],
  ['mali-empire', 1324, -8.38, 11.38, 'Niani'],
  ['mali-empire', 1324, -3.01, 16.77, 'Timbuktu'],
  ['songhai-empire', 1500, -0.04, 16.27, 'Gao'],
  ['songhai-empire', 1500, -3.01, 16.77, 'Timbuktu'],
  ['kanem-bornu', 1600, 11.03, 13.0, 'Ngazargamu'],
  ['hausa-states', 1450, 8.52, 12.0, 'Kano'],
  ['sokoto-caliphate', 1810, 5.24, 13.06, 'Sokoto'],
  ['benin-kingdom', 1500, 5.62, 6.34, 'Benin City'],
  ['oyo-empire', 1750, 4.15, 8.95, 'Oyo-Ile'],
  ['asante-empire', 1750, -1.62, 6.69, 'Kumasi'],
  ['kongo', 1500, 14.24, -6.27, 'Mbanza Kongo'],
  ['great-zimbabwe', 1300, 30.93, -20.27, 'Great Zimbabwe'],
  ['axum', 350, 38.72, 14.13, 'Aksum'],
  ['zagwe-dynasty', 1200, 39.05, 12.03, 'Lalibela'],
  ['ethiopian-empire', 1700, 37.47, 12.61, 'Gondar'],
  ['swahili-city-states', 1300, 39.51, -8.96, 'Kilwa'],
  ['swahili-city-states', 1300, 39.67, -4.05, 'Mombasa'],
  ['buganda', 1800, 32.58, 0.32, 'Kampala hills'],
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
  1000: ['ghana-empire-ov', 'kanem-bornu', 'swahili-city-states'],
  1324: ['mali-empire', 'kanem-bornu', 'great-zimbabwe', 'ethiopian-empire', 'swahili-city-states', 'hausa-states', 'benin-kingdom'],
  1500: ['songhai-empire', 'mali-empire', 'kanem-bornu', 'hausa-states', 'benin-kingdom', 'oyo-empire', 'kongo', 'mutapa', 'ethiopian-empire', 'swahili-city-states', 'buganda'],
  1750: ['kanem-bornu', 'hausa-states', 'benin-kingdom', 'oyo-empire', 'asante-empire', 'kongo', 'luba-kingdom', 'lunda-empire', 'mutapa', 'ethiopian-empire', 'buganda'],
  1810: ['sokoto-caliphate', 'kanem-bornu', 'asante-empire', 'oyo-empire', 'ethiopian-empire'],
};
const GONE = {
  1000: ['axum'],
  1250: ['ghana-empire-ov'],
  1300: ['zagwe-dynasty'],
  1480: ['great-zimbabwe'],
  1620: ['songhai-empire'],
  1830: ['hausa-states', 'asante-empire'],
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
  console.error(`check-inland-africa: ${failed} problem(s)`);
  process.exit(1);
}
console.log(
  `✓ inland Africa: ${inlandAfricaPolities.length} polities, ${rings} clean outlines, ${CAPITALS.length} capitals inside, ${Object.keys(EXPECT).length} sample years OK`,
);
