#!/usr/bin/env node
/**
 * Day 53 (Phase 4c step 5.1): checks for the trade routes in data/trade-routes.json.
 *  - rows are well-formed: unique kebab-case ids, a name, land / sea, start < end inside the
 *    globe's years, a colour, goods, a description, at least one https source, a confidence
 *    level with a reason, and paths of ≥ 2 [lat, lng] waypoints;
 *  - every `related` ref points at a real timeline entry ('event:<title>' or '<view>:<id>');
 *  - land routes: every waypoint sits on land (or within ~25 km of the simplified coast);
 *  - sea routes: the line as drawn (sampled every 0.25°, like the globe's own interpolation)
 *    never crosses land, apart from the first / last ~70 km of a path (harbours up estuaries)
 *    and legs marked `"via": "river"` or `"via": "overland"`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPathTerrain } from './flow-geo.js';
import { events } from '../src/events.js';
import { civilisations } from '../src/civilisations.js';
import { warsItems } from '../src/wars.js';
import { technologies } from '../src/technology.js';
import { sciences } from '../src/science.js';
import { religionItems } from '../src/religion.js';
import { philosophyItems } from '../src/philosophy.js';
import { artItems } from '../src/art.js';
import { economicsItems } from '../src/economics.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { routes } = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/trade-routes.json'), 'utf8'));
const errors = [];
const fail = (m) => errors.push(m);
const LEVELS = new Set(['documented', 'approximate', 'conjectural']);
const YEAR_MIN = -3000;
const YEAR_MAX = 2025;

// 1. Rows.
const ids = new Set();
for (const r of routes) {
  const tag = `route ${r.id}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id || '') || ids.has(r.id)) fail(`${tag}: id missing / not kebab-case / duplicate`);
  ids.add(r.id);
  if (!r.name) fail(`${tag}: no name`);
  if (r.kind !== 'land' && r.kind !== 'sea') fail(`${tag}: kind must be land or sea`);
  if (!Number.isInteger(r.start) || !Number.isInteger(r.end) || r.start >= r.end) fail(`${tag}: bad years ${r.start}–${r.end}`);
  if (r.start < YEAR_MIN || r.end > YEAR_MAX) fail(`${tag}: years outside ${YEAR_MIN}–${YEAR_MAX}`);
  if (!/^#[0-9a-f]{6}$/i.test(r.color || '')) fail(`${tag}: colour must be #rrggbb`);
  if (!r.goods || !r.description || r.description.length < 80) fail(`${tag}: goods / description missing or too short`);
  if (!Array.isArray(r.sources) || !r.sources.length) fail(`${tag}: needs at least one source`);
  for (const s of r.sources || []) if (!s.title || !/^https:\/\//.test(s.url || '')) fail(`${tag}: source needs a title and an https url`);
  if (!LEVELS.has(r.confidence?.level) || !r.confidence?.reason) fail(`${tag}: confidence { level, reason } missing`);
  if (!Array.isArray(r.paths) || !r.paths.length) fail(`${tag}: no paths`);
  for (const p of r.paths || []) {
    if (!p.name) fail(`${tag}: a path has no name`);
    if (!Array.isArray(p.points) || p.points.length < 2) fail(`${tag} / ${p.name}: needs ≥ 2 points`);
    for (const pt of p.points || []) {
      if (!Array.isArray(pt) || pt.length !== 2 || Math.abs(pt[0]) > 90 || Math.abs(pt[1]) > 180) fail(`${tag} / ${p.name}: bad point ${JSON.stringify(pt)}`);
    }
    if (p.via != null && p.via !== 'river' && p.via !== 'overland') fail(`${tag} / ${p.name}: via must be river or overland`);
  }
}

// 2. Related timeline entries.
const VIEWS = {
  civilisations, wars: warsItems, technology: technologies, science: sciences, religion: religionItems,
  philosophy: philosophyItems, art: artItems, economics: economicsItems,
};
for (const r of routes) {
  for (const ref of r.related || []) {
    const k = ref.indexOf(':');
    const kind = ref.slice(0, k);
    const key = ref.slice(k + 1);
    const ok = kind === 'event' ? events.some((e) => e.title === key) : VIEWS[kind]?.some((x) => x.id === key);
    if (!ok) fail(`route ${r.id}: related "${ref}" is not a timeline entry`);
  }
}

// 3. Land / sea (shared with check-migrations.js).
let samples = 0;
for (const r of routes) {
  for (const p of r.paths || []) {
    const res = checkPathTerrain(r.kind, p);
    samples += res.samples;
    if (res.error) fail(`route ${r.id} / ${p.name}: ${res.error}`);
  }
}

if (errors.length) {
  console.error(`check-routes: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const paths = routes.reduce((n, r) => n + r.paths.length, 0);
console.log(`check-routes: ${routes.length} routes, ${paths} paths OK (${samples} sea-lane samples off land; related entries resolve)`);
