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
import { feature } from 'topojson-client';
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

// 3. Land / sea.
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
const TOL = 0.25; // degrees (~25 km)
function segDist(px, py, ax, ay, bx, by, k) {
  const ux = (bx - ax) * k, uy = by - ay, vx = (px - ax) * k, vy = py - ay;
  const L = ux * ux + uy * uy;
  const t = L ? Math.max(0, Math.min(1, (vx * ux + vy * uy) / L)) : 0;
  return Math.hypot(vx - t * ux, vy - t * uy);
}
function landAt(lat, lng) {
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
/** The same linear lat/lng interpolation the globe uses (shortest way across the antimeridian). */
export function samplePath(points, stepDeg = 0.25) {
  const out = [];
  for (let i = 1; i < points.length; i++) {
    const [lat0, lng0raw] = points[i - 1];
    const [lat1, lng1] = points[i];
    let lng0 = lng0raw;
    while (Math.abs(lng0 - lng1) > 180) lng0 += lng0 < lng1 ? 360 : -360;
    const n = Math.max(1, Math.ceil(Math.hypot(lat1 - lat0, lng1 - lng0) / stepDeg));
    for (let s = i === 1 ? 0 : 1; s <= n; s++) {
      const t = s / n;
      let lng = lng0 + (lng1 - lng0) * t;
      lng = ((((lng + 180) % 360) + 360) % 360) - 180;
      out.push([lat0 + (lat1 - lat0) * t, lng]);
    }
  }
  return out;
}
const kmBetween = ([a, b], [c, d]) => {
  const r = Math.PI / 180;
  const h = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
const PORT_KM = 70;
let samples = 0;
for (const r of routes) {
  for (const p of r.paths || []) {
    if (r.kind === 'land') {
      for (const pt of p.points) if (!landAt(pt[0], pt[1])) fail(`route ${r.id} / ${p.name}: waypoint ${pt} is not on land`);
      continue;
    }
    if (p.via) continue;
    const first = p.points[0];
    const last = p.points[p.points.length - 1];
    for (const s of samplePath(p.points)) {
      samples++;
      if (kmBetween(s, first) < PORT_KM || kmBetween(s, last) < PORT_KM) continue;
      if (landAt(s[0], s[1]) === 'in') {
        fail(`route ${r.id} / ${p.name}: crosses land near ${s[0].toFixed(2)}, ${s[1].toFixed(2)}`);
        break;
      }
    }
  }
}

if (errors.length) {
  console.error(`check-routes: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const paths = routes.reduce((n, r) => n + r.paths.length, 0);
console.log(`check-routes: ${routes.length} routes, ${paths} paths OK (${samples} sea-lane samples off land; related entries resolve)`);
