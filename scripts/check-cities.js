#!/usr/bin/env node
/**
 * Day 43: checks for the dated cities and event pins on the globe.
 *  - city rows are well-formed: unique ids, a name at founding, renames in date order inside
 *    the city's lifetime, ranks 1–4;
 *  - era-correct names at sample years (Byzantium / Constantinople / Istanbul, Edo / Tokyo …);
 *  - every city (and every land pin) sits on land: inside, or within ~25 km of, a shape in
 *    src/data/nations.topo.json (coastal towns sit on the simplified coastline);
 *  - every event pin points at a real timeline entry and its year sits inside that entry's
 *    dates, give or take 30 years for founding moments (world events: within 15 years).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { CITIES, cityNameAt, citiesAtYear } from '../src/globe-cities.js';
import { EVENT_PINS } from '../src/globe-event-pins.js';
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
const errors = [];
const fail = (m) => errors.push(m);

// 1. Rows.
const ids = new Set();
for (const c of CITIES) {
  if (!c.id || ids.has(c.id)) fail(`city id missing / duplicate: ${c.id}`);
  ids.add(c.id);
  if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng) || Math.abs(c.lat) > 90 || Math.abs(c.lng) > 180) fail(`${c.id}: bad position`);
  if (![1, 2, 3, 4].includes(c.rank)) fail(`${c.id}: rank ${c.rank}`);
  if (!Number.isFinite(c.founded)) fail(`${c.id}: no founding year`);
  if (c.abandoned != null && !(c.abandoned > c.founded)) fail(`${c.id}: abandoned ${c.abandoned} before founded ${c.founded}`);
  if (!c.names.length || !c.names[0].name) fail(`${c.id}: no name`);
  let prev = -Infinity;
  for (const n of c.names) {
    if (typeof n.name !== 'string' || !n.name.trim()) fail(`${c.id}: empty name`);
    if (!Number.isFinite(n.from)) fail(`${c.id}: rename "${n.name}" has no year`);
    if (n.from <= prev) fail(`${c.id}: renames out of order at "${n.name}" (${n.from})`);
    if (c.abandoned != null && n.from >= c.abandoned) fail(`${c.id}: renamed "${n.name}" after abandonment`);
    prev = n.from;
  }
  if (c.names[0].from !== c.founded) fail(`${c.id}: first name must start at founding`);
  for (const [i, n] of c.names.entries()) if (i && n.name === c.names[i - 1].name) fail(`${c.id}: rename to the same name "${n.name}"`);
  if (c.ranks) {
    let p = -Infinity;
    for (const [y, r] of c.ranks) {
      if (!(y > p) || ![1, 2, 3, 4].includes(r)) fail(`${c.id}: bad rank step [${y}, ${r}]`);
      p = y;
    }
  }
}
if (CITIES.length < 300) fail(`only ${CITIES.length} cities`);

// 2. Era samples.
const SAMPLES = [
  ['istanbul', -500, 'Byzantium'], ['istanbul', 330, 'Constantinople'], ['istanbul', 1453, 'Constantinople'], ['istanbul', 1930, 'Istanbul'],
  ['tokyo', 1850, 'Edo'], ['tokyo', 1870, 'Tokyo'], ['tokyo', 1400, null],
  ['york', 100, 'Eboracum'], ['york', 900, 'Jórvík'], ['york', 1500, 'York'],
  ['mexico-city', 1500, 'Tenochtitlan'], ['mexico-city', 1600, 'Mexico City'], ['mexico-city', 1300, null],
  ['st-petersburg', 1800, 'St Petersburg'], ['st-petersburg', 1915, 'Petrograd'], ['st-petersburg', 1925, 'Leningrad'], ['st-petersburg', 1995, 'St Petersburg'],
  ['mumbai', 1990, 'Bombay'], ['mumbai', 2000, 'Mumbai'], ['kolkata', 2000, 'Calcutta'], ['kolkata', 2005, 'Kolkata'],
  ['beijing', 1300, 'Dadu'], ['beijing', 1935, 'Beiping'], ['beijing', 1960, 'Beijing'],
  ['new-york', 1650, 'New Amsterdam'], ['new-york', 1700, 'New York'],
  ['jakarta', 1700, 'Batavia'], ['jakarta', 1950, 'Jakarta'], ['ho-chi-minh-city', 1970, 'Saigon'], ['ho-chi-minh-city', 1980, 'Ho Chi Minh City'],
  ['seoul', 1920, 'Keijō'], ['kyoto', 1000, 'Heian-kyō'], ['xian', 700, "Chang'an"],
  ['teotihuacan', 400, 'Teotihuacan'], ['teotihuacan', 700, null], ['angkor', 1500, null], ['brasilia', 1950, null],
];
for (const [id, y, want] of SAMPLES) {
  const c = CITIES.find((x) => x.id === id);
  if (!c) {
    fail(`sample city missing: ${id}`);
    continue;
  }
  const got = cityNameAt(c, y);
  if (got !== want) fail(`${id} in ${y}: expected ${want ?? '(not yet / no longer there)'}, got ${got ?? '(none)'}`);
}

// 3. On land.
const topo = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/nations.topo.json'), 'utf8'));
const polys = [];
for (const g of topo.objects.shapes.geometries) {
  const geom = feature(topo, g).geometry;
  for (const rings of geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates) {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (const [x, y] of rings[0]) {
      a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y);
    }
    polys.push({ bbox: [a, b, c, d], rings });
  }
}
const inRings = (x, y, rings) => {
  let inside = false;
  for (const r of rings) for (let i = 0, n = r.length, j = n - 1; i < n; j = i++) {
    if (r[i][1] > y !== r[j][1] > y && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) inside = !inside;
  }
  return inside;
};
const TOL = 0.25; // degrees (~25 km): simplified coastlines cut off harbour towns and small islands
function segDist(px, py, ax, ay, bx, by, k) {
  const ux = (bx - ax) * k, uy = by - ay, vx = (px - ax) * k, vy = py - ay;
  const L = ux * ux + uy * uy;
  const t = L ? Math.max(0, Math.min(1, (vx * ux + vy * uy) / L)) : 0;
  return Math.hypot(vx - t * ux, vy - t * uy);
}
function onLand(lat, lng) {
  const k = Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  let near = false;
  for (const p of polys) {
    const [a, b, c, d] = p.bbox;
    if (lng < a - TOL / k || lng > c + TOL / k || lat < b - TOL || lat > d + TOL) continue;
    if (inRings(lng, lat, p.rings)) return 'in';
    if (!near) {
      for (const r of p.rings) {
        for (let i = 1; i < r.length && !near; i++) if (segDist(lng, lat, r[i - 1][0], r[i - 1][1], r[i][0], r[i][1], k) < TOL) near = true;
      }
    }
  }
  return near ? 'coast' : null;
}
let coast = 0;
for (const c of CITIES) {
  const r = c.island ? 'island' : onLand(c.lat, c.lng);
  if (!r) fail(`city ${c.id} (${c.lat}, ${c.lng}) is not on land`);
  else if (r === 'coast') coast++;
}

// 4. Event pins.
const VIEWS = {
  civilisations, wars: warsItems, technology: technologies, science: sciences, religion: religionItems,
  philosophy: philosophyItems, art: artItems, economics: economicsItems,
};
let seaPins = 0;
const refs = new Set();
for (const [i, p] of EVENT_PINS.entries()) {
  const tag = `pin ${i} (${p.label})`;
  if (!p.label || !p.place || !Number.isFinite(p.year)) fail(`${tag}: incomplete row`);
  if (p.label && p.label.length > 34) fail(`${tag}: label too long (${p.label.length})`);
  const k = p.ref.indexOf(':');
  const kind = p.ref.slice(0, k);
  const key = p.ref.slice(k + 1);
  refs.add(p.ref);
  if (kind === 'event') {
    const e = events.find((x) => x.title === key);
    if (!e) fail(`${tag}: no world event titled "${key}"`);
    else if (Math.abs(e.year - p.year) > 15) fail(`${tag}: year ${p.year} is far from the event (${e.year})`);
  } else {
    const it = VIEWS[kind]?.find((x) => x.id === key);
    if (!it) fail(`${tag}: no ${kind} item "${key}"`);
    else if (p.year < it.start - 30 || p.year > it.end + 30) fail(`${tag}: year ${p.year} outside ${kind}:${key} (${it.start}–${it.end})`);
  }
  if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) fail(`${tag}: bad position`);
  else if (p.sea) seaPins++;
  else if (p.island) continue;
  else if (!onLand(p.lat, p.lng)) fail(`${tag}: ${p.place} (${p.lat}, ${p.lng}) is not on land (mark naval pins { sea: true })`);
}
const dup = new Set();
for (const p of EVENT_PINS) {
  const key = `${p.ref}|${p.year}|${p.label}`;
  if (dup.has(key)) fail(`duplicate pin: ${key}`);
  dup.add(key);
}

// 5. Optional: positions vs Natural Earth populated places (only when the build cache has it;
//    `curl` it into .cache/natural-earth/ — see README). Same-name towns elsewhere are skipped.
let neNote = '';
const NE_FILE = path.join(ROOT, '.cache/natural-earth/ne_10m_populated_places_simple.geojson');
if (fs.existsSync(NE_FILE)) {
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const by = new Map();
  for (const f of JSON.parse(fs.readFileSync(NE_FILE, 'utf8')).features) {
    for (const n of [f.properties.name, f.properties.nameascii, f.properties.name_en]) {
      if (!n) continue;
      const k = norm(n);
      if (!by.has(k)) by.set(k, []);
      by.get(k).push(f.geometry.coordinates);
    }
  }
  const NAME_CLASH = new Set(['syracuse', 'winchester', 'nara']); // NE only has Syracuse NY, Winchester VA, Nara (Mali)
  let matched = 0;
  for (const c of CITIES) {
    if (c.abandoned != null || NAME_CLASH.has(c.id)) continue;
    const pts = by.get(norm(c.ne || c.names[c.names.length - 1].name));
    if (!pts) continue;
    matched++;
    const k = Math.cos((c.lat * Math.PI) / 180);
    const best = Math.min(...pts.map(([lng, lat]) => Math.hypot(lat - c.lat, (lng - c.lng) * k) * 111.2));
    if (best > 40) fail(`city ${c.id}: ${best.toFixed(0)} km from Natural Earth's ${c.ne || c.names[c.names.length - 1].name}`);
  }
  neNote = `; ${matched} matched Natural Earth populated places within 40 km`;
}

if (errors.length) {
  console.error(`✗ cities: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 60)) console.error('  - ' + e);
  process.exit(1);
}
const at = (y) => citiesAtYear(y).length;
console.log(
  `✓ cities: ${CITIES.length} cities (${CITIES.reduce((n, c) => n + c.names.length - 1, 0)} renames; ${at(-1000)} in 1000 BCE, ${at(1000)} in 1000, ${at(1900)} in 1900; ${coast} on the simplified coastline), ` +
    `${SAMPLES.length} era samples, ${EVENT_PINS.length} event pins (${refs.size} timeline entries, ${seaPins} at sea) all resolve${neNote}`,
);
