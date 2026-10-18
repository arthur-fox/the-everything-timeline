#!/usr/bin/env node
/**
 * Day 64 (Phase 4c step 8.2): checks for the honest shape updates from lidar (src/globe-lidar-shapes.js).
 *  - lidar-mapped presence shapes: presence type, linked finds exist in data/lidar-finds.json, every
 *    source is one of the survey papers and at least one is also cited by a linked find; every
 *    keyframe has a confidence with a reason and one names the survey; rings are closed, small
 *    (≤ 24 vertices), do not cross themselves, sit on land (vertices and an interior sample grid);
 *    the drawn area is within ±10% of the published figure; keyframe years sit inside the linked
 *    finds' site years; every linked find's pin is inside its shape;
 *  - they are on (and off) at sample years, and the globe builds features with the keyframe's level;
 *  - the certainty notes reached the shapes they annotate (Maya, Khmer, Mesoamerica, Amazonia), the
 *    Maya polity no longer spreads over West Mexico, and the sources were added;
 *  - a small budget so the globe stays light (≤ 8 shapes, ≤ 120 ring vertices in all).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea, geoContains } from 'd3-geo';
import { landAt } from './flow-geo.js';
import { lidarPresenceEntities, lidarShapeNotes, LIDAR_SOURCES } from '../src/globe-lidar-shapes.js';
import { spatialEntities, getActiveOverlaysAtYear, getOverlayPolygonFeatures, setOverlayLayerFilter } from '../src/globe-overlays.js';
import { CONFIDENCE_LEVELS, isValidConfidence } from '../src/globe-confidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { finds } = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lidar-finds.json'), 'utf8'));
const findById = new Map(finds.map((f) => [f.id, f]));
const errors = [];
const fail = (m) => errors.push(m);
const R_KM = 6371.0088;
const YEAR_MIN = -3000;
const YEAR_MAX = 2025;
const SURVEY_URLS = new Set(Object.values(LIDAR_SOURCES).map((s) => s.url));

/** GeoJSON polygon for a small ring, wound the way d3-geo reads "the small side". */
function smallPolygon(ring) {
  const poly = { type: 'Polygon', coordinates: [ring] };
  return geoArea(poly) > 2 * Math.PI ? { type: 'Polygon', coordinates: [ring.slice().reverse()] } : poly;
}
const km2 = (ring) => geoArea(smallPolygon(ring)) * R_KM * R_KM;
const closed = (r) => r.length >= 4 && r[0][0] === r.at(-1)[0] && r[0][1] === r.at(-1)[1];
function selfCrosses(r) {
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const n = r.length - 1;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue;
      const [p1, p2, p3, p4] = [r[i], r[i + 1], r[j], r[j + 1]];
      if (d(p3, p4, p1) * d(p3, p4, p2) < 0 && d(p1, p2, p3) * d(p1, p2, p4) < 0) return true;
    }
  }
  return false;
}
function interiorSamples(ring, n = 12) {
  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const poly = smallPolygon(ring);
  const out = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
    const p = [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * j) / n];
    if (geoContains(poly, p)) out.push(p);
  }
  return out;
}

// ---- 1. The lidar-mapped presence shapes --------------------------------------------------------
if (!Array.isArray(lidarPresenceEntities) || lidarPresenceEntities.length < 6) fail('expected at least 6 lidar-mapped shapes');
if (lidarPresenceEntities.length > 8) fail('budget: at most 8 lidar-mapped shapes');
let vertices = 0;
const ids = new Set();
for (const e of lidarPresenceEntities) {
  const tag = `lidar shape ${e.id}`;
  if (!/^lidar-[a-z0-9-]+$/.test(e.id) || ids.has(e.id)) fail(`${tag}: id must be unique and start with "lidar-"`);
  ids.add(e.id);
  if (e.type !== 'presence') fail(`${tag}: must be a presence shape`);
  if (!spatialEntities.includes(e)) fail(`${tag}: not in the globe catalogue`);
  const L = e.lidar || {};
  if (!Array.isArray(L.finds) || !L.finds.length || !(L.km2 > 0) || !L.areaNote || !L.cite) fail(`${tag}: lidar { finds, km2, areaNote, cite } missing`);
  const linked = (L.finds || []).map((id) => findById.get(id));
  linked.forEach((f, i) => { if (!f) fail(`${tag}: lidar find "${L.finds[i]}" is not in data/lidar-finds.json`); });
  const found = linked.filter(Boolean);
  // Sources: the survey papers only, and at least one shared with a linked find.
  if (!Array.isArray(e.sources) || !e.sources.length) fail(`${tag}: needs sources`);
  for (const s of e.sources || []) {
    if (!s.title || !/^https:\/\//.test(s.url || '')) fail(`${tag}: source needs a title and an https url`);
    if (!SURVEY_URLS.has(s.url)) fail(`${tag}: source ${s.url} is not one of LIDAR_SOURCES`);
  }
  const findUrls = new Set(found.flatMap((f) => f.sources.map((s) => s.url)));
  if (!(e.sources || []).some((s) => findUrls.has(s.url))) fail(`${tag}: no source shared with its lidar find(s)`);
  if (!e.description.includes(L.cite?.split(' ')[0] || '\0')) fail(`${tag}: description should name the survey (${L.cite})`);
  // Keyframes: years, confidence, rings.
  const ovs = e.overlays || [];
  if (ovs.length < 2) fail(`${tag}: needs at least 2 keyframes`);
  const lo = Math.min(...found.map((f) => f.start));
  const hi = Math.max(...found.map((f) => f.end));
  let named = false;
  ovs.forEach((o, i) => {
    const at = `${tag} @ ${o.year}`;
    if (!Number.isInteger(o.year) || o.year < YEAR_MIN || o.year > YEAR_MAX) fail(`${at}: bad year`);
    if (i && o.year <= ovs[i - 1].year) fail(`${at}: keyframes must be in ascending order`);
    if (found.length && (o.year < lo || o.year > hi)) fail(`${at}: outside its finds' site years ${lo}–${hi}`);
    if (!isValidConfidence(o.confidence)) fail(`${at}: needs confidence { level, reason }`);
    else if (o.confidence.reason.includes(L.cite)) named = true;
    for (const reg of o.regions || []) {
      const ring = reg.ring;
      if (!Array.isArray(ring) || !closed(ring)) { fail(`${at}: region ${reg.id} needs a closed ring`); continue; }
      if (ring.length - 1 > 24) fail(`${at}: region ${reg.id} has ${ring.length - 1} vertices (budget 24)`);
      if (i === 0 || ring !== ovs[i - 1].regions.find((r) => r.id === reg.id)?.ring) vertices += ring.length - 1;
      if (selfCrosses(ring)) fail(`${at}: region ${reg.id} crosses itself`);
      for (const [lng, lat] of ring) if (landAt(lat, lng) !== 'in') fail(`${at}: vertex ${lat}, ${lng} is not on land`);
      for (const [lng, lat] of interiorSamples(ring)) if (!landAt(lat, lng)) fail(`${at}: interior point ${lat.toFixed(2)}, ${lng.toFixed(2)} is at sea`);
      const a = km2(ring);
      if (Math.abs(a - L.km2) / L.km2 > 0.1) fail(`${at}: drawn area ${Math.round(a)} km² is not within 10% of the published ${L.km2} km²`);
      const poly = smallPolygon(ring);
      for (const f of found) if (!geoContains(poly, [f.lng, f.lat])) fail(`${at}: lidar find ${f.id}'s pin is outside the shape`);
    }
  });
  if (!named) fail(`${tag}: no keyframe's confidence reason names the survey (${L.cite})`);
}
if (vertices > 120) fail(`budget: ${vertices} ring vertices in lidar shapes (max 120)`);

// ---- 2. On and off at sample years, with the keyframe's level -----------------------------------
setOverlayLayerFilter('presence');
const on = (y) => new Set(getActiveOverlaysAtYear(y).map((r) => r.entity.id));
const SAMPLES = [
  ['lidar-central-maya-lowlands', [650, 800, 900], [500, 1000]],
  ['lidar-mirador-calakmul-basin', [-1000, -300, 150], [-1100, 400]],
  ['lidar-greater-angkor', [1150, 1200, 1300], [1000, 1500]],
  ['lidar-mahendraparvata', [810, 850, 900], [790, 950]],
  ['lidar-upano-valley', [-500, 0, 450], [-700, 700]],
  ['lidar-casarabe', [500, 1000, 1400], [300, 1500]],
];
let featureYears = 0;
for (const [id, yes, no] of SAMPLES) {
  const e = lidarPresenceEntities.find((x) => x.id === id);
  if (!e) { fail(`sample: ${id} missing`); continue; }
  for (const y of yes) {
    if (!on(y).has(id)) fail(`${id} should be drawn in ${y}`);
    const feats = getOverlayPolygonFeatures(y, [e]);
    if (!feats.length) fail(`${id} builds no polygon in ${y}`);
    const nearest = getActiveOverlaysAtYear(y, [e])[0]?.overlay;
    for (const f of feats) {
      featureYears++;
      if (!CONFIDENCE_LEVELS.includes(f.confidence) || f.confidence !== nearest?.confidence?.level) fail(`${id} @ ${y}: feature confidence ${f.confidence} ≠ keyframe ${nearest?.confidence?.level}`);
    }
  }
  for (const y of no) if (on(y).has(id)) fail(`${id} should not be drawn in ${y}`);
}
setOverlayLayerFilter('both');

// ---- 3. Certainty notes on the shapes the surveys speak to --------------------------------------
const ent = (id) => spatialEntities.find((e) => e.id === id);
let notes = 0;
for (const [id, note] of Object.entries(lidarShapeNotes)) {
  const e = ent(id);
  if (!e) { fail(`note: entity ${id} missing`); continue; }
  for (const [y, patch] of Object.entries(note.keyframes || {})) {
    const kf = e.overlays.find((o) => o.year === Number(y));
    if (!kf || kf.confidence !== patch.confidence) fail(`note: ${id} @ ${y} did not get its certainty note`);
    else if (!isValidConfidence(kf.confidence) || !/et al\. 20\d\d/.test(kf.confidence.reason)) fail(`note: ${id} @ ${y} must cite a survey (Author et al. YEAR)`);
    else notes++;
  }
  const urls = new Set((e.sources || []).map((s) => s.url));
  for (const s of note.sources || []) if (!urls.has(s.url)) fail(`note: ${id} is missing source ${s.url}`);
  if (new Set(e.sources.map((s) => s.url)).size !== e.sources.length) fail(`note: ${id} has duplicate sources`);
}
const reasonAt = (id, y) => {
  const e = ent(id);
  return getOverlayPolygonFeatures(y, [e])[0]?.confidenceReason || '';
};
for (const [id, y, needle] of [
  ['maya', -900, 'Aguada Fénix'], ['maya', -300, 'Hansen'], ['maya', 800, 'Canuto'],
  ['khmer-empire', 820, 'Chevance'], ['khmer-empire', 1200, 'Evans'],
  ['mesoamerica-presence', 500, 'Canuto'], ['amazonia-presence', 500, 'Rostain'], ['amazonia-presence', 1200, 'Prümers'],
]) {
  if (!reasonAt(id, y).includes(needle)) fail(`${id} @ ${y}: "How sure" should cite ${needle}`);
}
// The Maya polity no longer covers West / Central Mexico (other cultures held it).
for (const y of [600, 800, 1000, 1400]) {
  for (const f of getOverlayPolygonFeatures(y, [ent('maya')])) {
    const west = Math.min(...f.geometry.coordinates[0].map((p) => p[0]));
    if (west < -94) fail(`maya @ ${y}: region ${f.regionId} reaches ${west.toFixed(1)}° W (Maya area ends near 94° W)`);
  }
}

if (errors.length) {
  console.error(`check-lidar-shapes: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const areas = lidarPresenceEntities.map((e) => `${e.id.replace('lidar-', '')} ${Math.round(km2(e.overlays[0].regions[0].ring)).toLocaleString('en')}/${e.lidar.km2.toLocaleString('en')} km²`).join(', ');
console.log(`check-lidar-shapes: ${lidarPresenceEntities.length} lidar-mapped shapes OK (${vertices} vertices; drawn/published: ${areas}), ${featureYears} sample features, ${notes} certainty notes cite their survey`);
