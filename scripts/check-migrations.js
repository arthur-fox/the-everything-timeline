#!/usr/bin/env node
/**
 * Day 55 (Phase 4c step 5.2): checks for the migrations in data/migrations.json.
 *  - rows: unique kebab-case ids, a name, an icon, kind land / sea / mixed, start < end inside the
 *    globe's years, a colour, forced true / false, scale 1–4, who moved (`people`), a description,
 *    at least one https source, a confidence level with a reason, and paths of ≥ 2 [lat, lng]
 *    waypoints. A path may carry its own start / end (inside the migration's years) and, in a
 *    mixed migration, must say whether it goes by land or sea;
 *  - every `related` ref points at a real timeline entry ('event:<title>' or '<view>:<id>');
 *  - land paths: every waypoint on land; sea paths: the line as drawn stays off land
 *    (same rules as the trade routes, scripts/flow-geo.js).
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
const { migrations } = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/migrations.json'), 'utf8'));
const errors = [];
const fail = (m) => errors.push(m);
const LEVELS = new Set(['documented', 'approximate', 'conjectural']);
const KINDS = new Set(['land', 'sea', 'mixed']);
const YEAR_MIN = -3000;
const YEAR_MAX = 2025;
const VIEWS = {
  civilisations, wars: warsItems, technology: technologies, science: sciences, religion: religionItems,
  philosophy: philosophyItems, art: artItems, economics: economicsItems,
};

const ids = new Set();
let samples = 0;
let pathCount = 0;
for (const m of migrations) {
  const tag = `migration ${m.id}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id || '') || ids.has(m.id)) fail(`${tag}: id missing / not kebab-case / duplicate`);
  ids.add(m.id);
  if (!m.name || !m.icon) fail(`${tag}: name / icon missing`);
  if (!KINDS.has(m.kind)) fail(`${tag}: kind must be land, sea or mixed`);
  if (!Number.isInteger(m.start) || !Number.isInteger(m.end) || m.start >= m.end) fail(`${tag}: bad years ${m.start}–${m.end}`);
  if (m.start < YEAR_MIN || m.end > YEAR_MAX) fail(`${tag}: years outside ${YEAR_MIN}–${YEAR_MAX}`);
  if (!/^#[0-9a-f]{6}$/i.test(m.color || '')) fail(`${tag}: colour must be #rrggbb`);
  if (typeof m.forced !== 'boolean') fail(`${tag}: forced must be true or false`);
  if (![1, 2, 3, 4].includes(m.scale)) fail(`${tag}: scale must be 1, 2, 3 or 4`);
  if (!m.people || !m.description || m.description.length < 80) fail(`${tag}: people / description missing or too short`);
  if (!Array.isArray(m.sources) || !m.sources.length) fail(`${tag}: needs at least one source`);
  for (const s of m.sources || []) if (!s.title || !/^https:\/\//.test(s.url || '')) fail(`${tag}: source needs a title and an https url`);
  if (!LEVELS.has(m.confidence?.level) || !m.confidence?.reason) fail(`${tag}: confidence { level, reason } missing`);
  for (const ref of m.related || []) {
    const k = ref.indexOf(':');
    const kind = ref.slice(0, k);
    const key = ref.slice(k + 1);
    const ok = kind === 'event' ? events.some((e) => e.title === key) : VIEWS[kind]?.some((x) => x.id === key);
    if (!ok) fail(`${tag}: related "${ref}" is not a timeline entry`);
  }
  if (!Array.isArray(m.paths) || !m.paths.length) fail(`${tag}: no paths`);
  const names = new Set();
  for (const p of m.paths || []) {
    pathCount++;
    const ptag = `${tag} / ${p.name}`;
    if (!p.name || names.has(p.name)) fail(`${tag}: a path has no name or a duplicate name`);
    names.add(p.name);
    const ps = p.start ?? m.start;
    const pe = p.end ?? m.end;
    if (!Number.isInteger(ps) || !Number.isInteger(pe) || ps >= pe || ps < m.start || pe > m.end) fail(`${ptag}: path years ${ps}–${pe} must sit inside ${m.start}–${m.end}`);
    const kind = p.kind || m.kind;
    if (kind !== 'land' && kind !== 'sea') fail(`${ptag}: a path in a mixed migration needs kind land or sea`);
    if (p.via != null && p.via !== 'river' && p.via !== 'overland') fail(`${ptag}: via must be river or overland`);
    if (!Array.isArray(p.points) || p.points.length < 2) {
      fail(`${ptag}: needs ≥ 2 points`);
      continue;
    }
    let bad = false;
    for (const pt of p.points) {
      if (!Array.isArray(pt) || pt.length !== 2 || Math.abs(pt[0]) > 90 || Math.abs(pt[1]) > 180) {
        fail(`${ptag}: bad point ${JSON.stringify(pt)}`);
        bad = true;
      }
    }
    if (bad || (kind !== 'land' && kind !== 'sea')) continue;
    const res = checkPathTerrain(kind, p);
    samples += res.samples;
    if (res.error) fail(`${ptag}: ${res.error}`);
  }
}

if (errors.length) {
  console.error(`check-migrations: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-migrations: ${migrations.length} migrations, ${pathCount} paths OK (${samples} sea-lane samples off land; related entries resolve)`);
