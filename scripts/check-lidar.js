#!/usr/bin/env node
/**
 * Day 63 (Phase 4c step 8.1): checks for the lidar "hidden cities" in data/lidar-finds.json.
 *  - rows: unique kebab-case ids, a name, a short label (≤ 24 characters), a place, lat / lng on
 *    land, locationKm (how precisely the pin is placed, 1–60 km), site years start < end inside
 *    the globe's years, a period sentence, a discovery year (2000–2025, after the site ended), a
 *    survey line, a description, a "what this changed" note, a confidence level with a reason and
 *    at least one https source;
 *  - every `related` ref points at a real timeline entry ('event:<title>' or '<view>:<id>').
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { landAt } from './flow-geo.js';
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
const { finds } = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lidar-finds.json'), 'utf8'));
const errors = [];
const fail = (m) => errors.push(m);
const LEVELS = new Set(['documented', 'approximate', 'conjectural']);
const YEAR_MIN = -3000;
const YEAR_MAX = 2025;
const VIEWS = {
  civilisations, wars: warsItems, technology: technologies, science: sciences, religion: religionItems,
  philosophy: philosophyItems, art: artItems, economics: economicsItems,
};

if (!Array.isArray(finds) || finds.length < 8) fail('expected at least 8 lidar finds');
const ids = new Set();
let related = 0;
for (const f of finds || []) {
  const tag = `lidar find ${f.id}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.id || '') || ids.has(f.id)) fail(`${tag}: id missing / not kebab-case / duplicate`);
  ids.add(f.id);
  if (!f.name || !f.place || !f.period || !f.survey) fail(`${tag}: name / place / period / survey missing`);
  if (!f.label || f.label.length > 24) fail(`${tag}: label missing or longer than 24 characters`);
  if (!Number.isFinite(f.lat) || !Number.isFinite(f.lng) || Math.abs(f.lat) > 90 || Math.abs(f.lng) > 180) fail(`${tag}: bad lat / lng`);
  else if (!landAt(f.lat, f.lng)) fail(`${tag}: pin ${f.lat}, ${f.lng} is not on land`);
  if (!Number.isFinite(f.locationKm) || f.locationKm < 1 || f.locationKm > 60) fail(`${tag}: locationKm must be 1–60`);
  if (!Number.isInteger(f.start) || !Number.isInteger(f.end) || f.start >= f.end) fail(`${tag}: bad site years ${f.start}–${f.end}`);
  if (f.start < YEAR_MIN || f.end > YEAR_MAX) fail(`${tag}: site years outside ${YEAR_MIN}–${YEAR_MAX}`);
  if (!Number.isInteger(f.discovered) || f.discovered < 2000 || f.discovered > YEAR_MAX || f.discovered <= f.end) fail(`${tag}: discovered must be a year 2000–${YEAR_MAX}, after the site ended`);
  if (!f.description || f.description.length < 80) fail(`${tag}: description missing or too short`);
  if (!f.changed || f.changed.length < 40) fail(`${tag}: "changed" note missing or too short`);
  if (!LEVELS.has(f.confidence?.level) || !f.confidence?.reason) fail(`${tag}: confidence { level, reason } missing`);
  if (!Array.isArray(f.sources) || !f.sources.length) fail(`${tag}: needs at least one source`);
  for (const s of f.sources || []) if (!s.title || !/^https:\/\//.test(s.url || '')) fail(`${tag}: source needs a title and an https url`);
  for (const ref of f.related || []) {
    related++;
    const k = ref.indexOf(':');
    const kind = ref.slice(0, k);
    const key = ref.slice(k + 1);
    const ok = kind === 'event' ? events.some((e) => e.title === key) : VIEWS[kind]?.some((x) => x.id === key);
    if (!ok) fail(`${tag}: related "${ref}" is not a timeline entry`);
  }
}

if (errors.length) {
  console.error(`check-lidar: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-lidar: ${finds.length} lidar finds OK (pins on land, ${related} related entries resolve)`);
