#!/usr/bin/env node
/**
 * Day 67: checks data/population.json (the globe's world-population readout).
 * - years strictly increasing, values positive integers, population never falls by more than
 *   a plague-sized step between points (HYDE has real dips at 300 and 1400 CE);
 * - the series covers the whole globe slider (3000 BCE to 2025) and ends near today's ~8.2 billion;
 * - every point names its source and the file lists source URLs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/population.json'), 'utf8'));
const GLOBE_MIN = -3000;
const GLOBE_MAX = 2025;
const errors = [];
const fail = (m) => errors.push(m);

const pts = data.points;
if (!Array.isArray(pts) || pts.length < 10) fail('points: expected an array of at least 10 points');
else {
  pts.forEach((p, i) => {
    if (!Number.isInteger(p.year)) fail(`point ${i}: year must be an integer`);
    if (!Number.isInteger(p.pop) || p.pop <= 0) fail(`point ${i} (${p.year}): pop must be a positive integer`);
    if (!p.src) fail(`point ${i} (${p.year}): missing src`);
    if (p.year === 0) fail('year 0 does not exist; use 1 (1 CE)');
    if (i > 0) {
      const q = pts[i - 1];
      if (p.year <= q.year) fail(`points not strictly increasing in year at ${q.year} → ${p.year}`);
      if (p.pop < q.pop * 0.85) fail(`population falls more than 15% from ${q.year} to ${p.year}; check the value`);
    }
  });
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first.year > GLOBE_MIN) fail(`series starts at ${first.year}, after the globe's first year ${GLOBE_MIN}`);
  if (last.year < GLOBE_MAX) fail(`series ends at ${last.year}, before the globe's last year ${GLOBE_MAX}`);
  if (last.pop < 7.5e9 || last.pop > 9e9) fail(`last point ${last.pop} is not near today's ~8.2 billion`);
}
if (!Array.isArray(data.sources) || !data.sources.length || data.sources.some((s) => !/^https:\/\//.test(s.url || '')))
  fail('sources: need a non-empty list with https urls');

if (errors.length) {
  console.error(`check-population: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-population: ${pts.length} points, ${pts[0].year} → ${pts[pts.length - 1].year}, monotonic years, positive values ✓`);
