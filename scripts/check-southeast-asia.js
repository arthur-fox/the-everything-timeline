/**
 * Day 59: checks for Southeast Asia on the globe (src/globe-southeast-asia.js).
 *  - every ring is closed and does not cross itself;
 *  - every polity has sources, a confidence level with a reason, ≥3 keyframes, no keyframe
 *    after 1815 (the nations layer takes over) and a timeline entry that exists;
 *  - era names switch at the right years (Lý → Trần → Lê, Ayutthaya → Thonburi → Rattanakosin …);
 *  - each capital sits inside its polity at a real date (Angkor 1200, Pagan 1100, Malacca 1480 …);
 *  - who is on and who is gone at sample years.
 */
import { geoContains } from 'd3-geo';
import { southeastAsiaPolities as POLS } from '../src/globe-southeast-asia.js';
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

const REQUIRED = POLS.map((e) => e.id);
const civIds = new Set(civilisations.map((c) => c.id));
const have = new Set(POLS.map((e) => e.id));
for (const id of REQUIRED) if (!have.has(id)) fail(`missing polity ${id}`);

let rings = 0;
for (const e of POLS) {
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
for (const id of REQUIRED) {
  if (byId.get(id) !== POLS.find((e) => e.id === id)) fail(`${id} not wired into spatialEntities`);
}

const NAMES = [
  ['chenla', 750, 'Chenla (Land and Water)'],
  ['champa', 1500, 'Champa (Panduranga)'],
  ['dai-viet', 1100, 'Đại Việt (Lý)'],
  ['dai-viet', 1300, 'Đại Việt (Trần)'],
  ['dai-viet', 1450, 'Đại Việt (Lê)'],
  ['dai-viet', 1810, 'Vietnam (Nguyễn)'],
  ['toungoo-dynasty', 1650, 'Restored Toungoo Burma'],
  ['ayutthaya', 1700, 'Ayutthaya'],
  ['ayutthaya', 1775, 'Siam (Thonburi)'],
  ['ayutthaya', 1800, 'Siam (Rattanakosin)'],
  ['lan-na', 1600, 'Lan Na (Burmese vassal)'],
  ['lan-xang', 1750, 'Lao kingdoms (Luang Prabang, Vientiane, Champasak)'],
  ['srivijaya', 1200, 'Srivijaya–Malayu (Jambi)'],
  ['mataram-sultanate', 1755, 'Surakarta and Yogyakarta'],
];
for (const [id, y, want] of NAMES) {
  const got = entityNameAt(byId.get(id), y);
  if (got !== want) fail(`${id} in ${y}: name ${got}, expected ${want}`);
}

// Capitals inside their polity's keyframe at a real date: [id, year, lng, lat, place]
const CAPITALS = [
  ['funan', 250, 105.15, 10.25, 'Óc Eo'],
  ['chenla', 620, 105.04, 12.87, 'Isanapura'],
  ['khmer-empire', 1200, 103.87, 13.41, 'Angkor'],
  ['champa', 1000, 109.11, 13.87, 'Vijaya'],
  ['dai-viet', 1010, 105.85, 21.03, 'Thăng Long'],
  ['dai-viet', 1802, 107.59, 16.46, 'Huế'],
  ['pagan-kingdom', 1100, 94.86, 21.17, 'Pagan'],
  ['ava-kingdom', 1450, 95.98, 21.85, 'Ava'],
  ['toungoo-dynasty', 1570, 96.48, 17.33, 'Pegu'],
  ['konbaung-dynasty', 1785, 93.19, 20.6, 'Mrauk U'],
  ['sukhothai', 1290, 99.82, 17.01, 'Sukhothai'],
  ['ayutthaya', 1450, 100.58, 14.36, 'Ayutthaya'],
  ['ayutthaya', 1800, 100.5, 13.75, 'Bangkok'],
  ['lan-na', 1450, 98.98, 18.79, 'Chiang Mai'],
  ['lan-xang', 1560, 102.14, 19.89, 'Luang Prabang'],
  ['lan-xang', 1779, 102.61, 17.97, 'Vientiane'],
  ['srivijaya', 683, 104.76, -2.98, 'Palembang'],
  ['srivijaya', 1200, 103.61, -1.6, 'Jambi'],
  ['medang-kingdom', 825, 110.2, -7.61, 'Borobudur'],
  ['majapahit-empire', 1350, 112.38, -7.56, 'Trowulan'],
  ['mataram-sultanate', 1640, 110.4, -7.83, 'Kotagede'],
  ['malacca-sultanate', 1480, 102.25, 2.2, 'Malacca'],
  ['aceh-sultanate', 1630, 95.32, 5.55, 'Aceh'],
  ['brunei-sultanate', 1520, 114.94, 4.89, 'Brunei'],
  ['tondo', 1500, 120.97, 14.62, 'Tondo'],
  ['sulu-sultanate', 1600, 121.0, 6.05, 'Jolo'],
  ['maguindanao-sultanate', 1640, 124.25, 7.22, 'Cotabato'],
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
  300: ['funan', 'champa'],
  750: ['chenla', 'champa', 'srivijaya', 'medang-kingdom'],
  1200: ['khmer-empire', 'champa', 'dai-viet', 'pagan-kingdom', 'srivijaya', 'tondo'],
  1370: ['khmer-empire', 'champa', 'dai-viet', 'sukhothai', 'ayutthaya', 'lan-na', 'lan-xang', 'majapahit-empire', 'ava-kingdom'],
  1480: ['champa', 'dai-viet', 'ava-kingdom', 'ayutthaya', 'lan-na', 'lan-xang', 'majapahit-empire', 'malacca-sultanate', 'brunei-sultanate', 'sulu-sultanate', 'tondo'],
  1640: ['toungoo-dynasty', 'ayutthaya', 'lan-xang', 'mataram-sultanate', 'johor-sultanate', 'aceh-sultanate', 'brunei-sultanate', 'sulu-sultanate', 'maguindanao-sultanate', 'dai-viet'],
  1800: ['konbaung-dynasty', 'ayutthaya', 'dai-viet', 'champa', 'aceh-sultanate', 'brunei-sultanate', 'sulu-sultanate', 'johor-sultanate'],
};
const GONE = {
  700: ['funan'],
  900: ['chenla'],
  1450: ['khmer-empire', 'sukhothai', 'pagan-kingdom'],
  1550: ['malacca-sultanate', 'majapahit-empire'],
  1600: ['tondo', 'ava-kingdom'],
  1400: ['srivijaya'],
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
  console.error(`check-southeast-asia: ${failed} problem(s)`);
  process.exit(1);
}
console.log(
  `✓ southeast Asia: ${POLS.length} polities, ${rings} clean outlines, ${CAPITALS.length} capitals inside, ${Object.keys(EXPECT).length} sample years OK`,
);
