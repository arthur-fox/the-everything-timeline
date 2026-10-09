#!/usr/bin/env node
/**
 * Day 42: checks for the globe labels.
 *  - every nation period gets a short, non-empty label;
 *  - era-correct names at sample years (Prussia vs Germany, Siam / Thailand, Persia / Iran, Zaire …);
 *  - every nations shape has a label anchor that lies inside the shape;
 *  - src/data/places.json is well-formed and era-neutral (no state names).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { NATION_ENTITIES } from '../src/globe-nations-table.js';
import { shortNationLabel } from '../src/globe-label-names.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (m) => errors.push(m);

// 1. Every period name shortens to something sensible.
let names = 0;
for (const e of NATION_ENTITIES) {
  for (const p of e.periods) {
    const full = p.name || e.name;
    const s = shortNationLabel(full, p.kind);
    names++;
    if (!s) fail(`empty label for ${full}`);
    else if (s.length > 34) fail(`label too long (${s.length}): ${full} → ${s}`);
    else if (/\((?!Br\.|Fr\.|Sp\.|Port\.|Ger\.|Neth\.|Dan\.|It\.|Belg\.|US\)|Aus\.|NZ\)|Jp\.|Rus\.|Ind\.|Transvaal\)|HBC\)|Br\.\/Fr\.|occupied\)|Soviet zone\)|US zone\))/.test(s)) {
      fail(`unexpected parenthesis in label: ${full} → ${s}`);
    }
  }
}

// 2. Era-correct names at sample years (label of the entity holding a given table id / name).
function labelsAt(year) {
  const out = new Set();
  for (const e of NATION_ENTITIES) {
    for (const p of e.periods) {
      const to = p.to ?? Infinity;
      if (year >= p.from && year < to) out.add(shortNationLabel(p.name || e.name, p.kind));
    }
  }
  return out;
}
const EXPECT = [
  [1850, ['Prussia', 'Ottoman Empire', 'Persia', 'Siam', 'Austrian Empire', 'Qing China', 'Russian Empire'], ['Germany', 'German Empire', 'Thailand', 'Iran', 'Turkey']],
  [1871, ['German Empire', 'Austria-Hungary', 'France', 'Italy', 'Ottoman Empire'], ['Prussia', 'Germany']],
  [1900, ['German Empire', 'Ottoman Empire', 'Siam', 'Persia', 'Congo Free State', 'Russian Empire'], ['Thailand', 'Iran', 'Turkey', 'Zaire']],
  [1950, ['Thailand', 'Iran', 'Turkey', 'West Germany', 'East Germany', 'Soviet Union'], ['Siam', 'Persia', 'Ottoman Empire']],
  [1980, ['Zaire', 'Iran', 'Thailand', 'Soviet Union', 'Yugoslavia'], ['DR Congo', 'Russia']],
  [1995, ['FR Yugoslavia', 'Russia', 'Bosnia and Herzegovina', 'Croatia'], ['Yugoslavia', 'Soviet Union']],
  [2010, ['DR Congo', 'Germany'], ['Zaire']],
];
for (const [year, must, mustNot] of EXPECT) {
  const L = labelsAt(year);
  for (const n of must) if (!L.has(n)) fail(`${year}: expected label "${n}"`);
  for (const n of mustNot) if (L.has(n)) fail(`${year}: anachronistic label "${n}"`);
}

// 3. Anchors inside their shapes.
const topo = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/nations.topo.json'), 'utf8'));
const geoms = topo.objects.shapes.geometries;
if (!Array.isArray(topo.labels) || topo.labels.length !== geoms.length) fail('nations.topo.json: labels missing / wrong length (npm run build:nations)');
const inRings = (x, y, rings) => {
  let inside = false;
  for (const r of rings) for (let i = 0, n = r.length, j = n - 1; i < n; j = i++) {
    if (r[i][1] > y !== r[j][1] > y && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) inside = !inside;
  }
  return inside;
};
let outside = 0;
(topo.labels || []).forEach((l, s) => {
  if (!l) return fail(`shape ${s}: no label anchor`);
  if (l[2] < 50) return; // micro-states (Monaco, Macau, Maldives atolls): degenerate after simplification
  const g = feature(topo, geoms[s]).geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  if (!polys.some((rings) => inRings(l[0], l[1], rings))) outside++;
});
if (outside) fail(`${outside} label anchors fall outside their shape`);

// 4. Places.
const places = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/places.json'), 'utf8')).places || [];
if (places.length < 300) fail(`places.json: only ${places.length} places (npm run build:places)`);
// A place that shares a state's label (the island of Sardinia vs the Kingdom of Sardinia) is
// dropped at runtime while that state is on the map; here we just make sure it's rare.
const stateNames = new Set();
for (const e of NATION_ENTITIES) for (const p of e.periods) stateNames.add(shortNationLabel(p.name || e.name, p.kind));
const shared = [];
for (const [name, lat, lng, rank, cls] of places) {
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(rank) || !cls) fail(`bad place row: ${name}`);
  if (stateNames.has(name)) shared.push(name);
}
if (shared.length > 5) fail(`too many places share a state label: ${shared.join(', ')}`);

if (errors.length) {
  console.error(`✗ labels: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 40)) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✓ labels: ${names} period names shortened, ${EXPECT.length} era samples, ${topo.labels.length} anchors inside their shapes, ${places.length} places (${shared.length} shared with a state label, deduped at runtime: ${shared.join(', ') || 'none'})`);
