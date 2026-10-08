#!/usr/bin/env node
/**
 * Day 38 — build the modern nations layer (1914–2025) from Natural Earth admin-1 units.
 *
 *   node scripts/build-nations.mjs            # downloads Natural Earth into .cache/ if needed
 *   NE_ADMIN1=/path/ne_10m_admin_1_states_provinces.geojson node scripts/build-nations.mjs
 *
 * Input:  Natural Earth 1:10m admin-1 states/provinces (public domain, naturalearthdata.com).
 * Table:  src/globe-nations-table.js (which units belonged to which state, by year).
 * Output: src/data/nations.topo.json — one TopoJSON geometry per distinct territory shape,
 *         shared arcs (so 1914 and 2025 borders reuse the same coordinates), quantised.
 *
 * Steps: admin-1 units → topology → Visvalingam simplify (topology-preserving, so neighbours
 * keep a shared border) → mergeArcs per state-period → drop tiny islands → rewind to the
 * Globe.gl convention (planar-clockwise exteriors, counter-clockwise holes) → re-topologise.
 * Also fails loudly if two states claim the same unit in the same year, or a unit id is unknown.
 *
 * Day 40: `--fine` (npm run build:nations:fine) writes the close-zoom set instead:
 * src/data/nations-fine.topo.json — same table, same shape indices (so the globe can swap a
 * shape's coarse geometry for its fine one), but simplified 20× less (2 km² vs 40 km²), quantised 3×
 * finer, and keeping islands down to 100 km². Colours are not regenerated in this mode.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { topology } from 'topojson-server';
import { mergeArcs, feature, neighbors } from 'topojson-client';
import { presimplify, simplify, sphericalTriangleArea } from 'topojson-simplify';
import { geoArea, geoCentroid } from 'd3-geo';
import {
  NATION_ENTITIES,
  NATIONS_START,
  NATIONS_END,
  NATION_FIXED_COLORS,
  NATION_PALETTE,
  NATION_ENTITIES_BY_ID,
  nationColorGroup,
} from '../src/globe-nations-table.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, '.cache', 'natural-earth');
const NE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson';
const FINE = process.argv.includes('--fine') || process.env.NATIONS_VARIANT === 'fine';
const OUT = path.join(ROOT, 'src', 'data', FINE ? 'nations-fine.topo.json' : 'nations.topo.json');
const COLORS_OUT = path.join(ROOT, 'src', 'data', 'nations-colors.js');

const EARTH_KM2 = 6371 * 6371;
/** Visvalingam threshold (steradians): ~ effective triangle area kept. */
const SIMPLIFY_SR = Number(process.env.NATIONS_SIMPLIFY_KM2 || (FINE ? 2 : 40)) / EARTH_KM2;
/** Islands / exclaves smaller than this (km²) are dropped unless the largest part or a sizeable exclave. */
const MIN_PART_KM2 = Number(process.env.NATIONS_MIN_PART_KM2 || (FINE ? 100 : 3000));
/** Fine mode: hard cap on parts per shape (atoll states), and smaller holes kept. */
const MAX_SMALL_PARTS = FINE ? 40 : 8;
const QUANTIZE = FINE ? 3e5 : 1e5;

async function loadAdmin1() {
  const local = process.env.NE_ADMIN1 || path.join(CACHE, 'ne_10m_admin_1_states_provinces.geojson');
  if (!fs.existsSync(local)) {
    fs.mkdirSync(path.dirname(local), { recursive: true });
    console.log(`Downloading Natural Earth admin-1 → ${path.relative(ROOT, local)} …`);
    const res = await fetch(NE_URL);
    if (!res.ok) throw new Error(`Natural Earth download failed: ${res.status}`);
    fs.writeFileSync(local, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(local, 'utf8'));
}

/** Natural Earth puts Crimea/Sevastopol under RUS; the table treats them as their own unit group. */
const ADM0_OVERRIDE = { 'UA-43': 'UKR', 'UA-40': 'UKR' };

function prepareAtoms(fc) {
  const atoms = [];
  for (const f of fc.features) {
    const pr = f.properties || {};
    const adm0 = ADM0_OVERRIDE[pr.iso_3166_2] || pr.adm0_a3;
    if (!adm0 || adm0 === 'ATA') continue;
    if (!f.geometry) continue;
    const c = geoCentroid(f);
    atoms.push({
      idx: atoms.length,
      adm0,
      iso: pr.iso_3166_2,
      name: pr.name,
      lat: c[1],
      areaKm2: geoArea(f) * EARTH_KM2,
      feature: { type: 'Feature', properties: { i: atoms.length }, geometry: f.geometry },
    });
  }
  return atoms;
}

function makeResolver(atoms) {
  const byAdm0 = new Map();
  const byIso = new Map();
  for (const a of atoms) {
    if (!byAdm0.has(a.adm0)) byAdm0.set(a.adm0, []);
    byAdm0.get(a.adm0).push(a.idx);
    if (a.iso) {
      if (!byIso.has(a.iso)) byIso.set(a.iso, []);
      byIso.get(a.iso).push(a.idx);
    }
  }
  return function resolve(units, where) {
    // Tokens apply left to right, so `UKR -UA-46 … UA-46` removes then re-adds a unit.
    const plus = new Set();
    for (const raw of String(units).split(/\s+/).filter(Boolean)) {
      const neg = raw.startsWith('-');
      const tok = neg ? raw.slice(1) : raw;
      let ids;
      const lat = /^([A-Z]{3})\^([NS])(\d+(?:\.\d+)?)$/.exec(tok);
      if (lat) {
        const [, code, ns, deg] = lat;
        ids = (byAdm0.get(code) || []).filter((i) => (ns === 'N' ? atoms[i].lat >= +deg : atoms[i].lat < +deg));
        if (!ids.length) throw new Error(`${where}: no units for ${tok}`);
      } else if (/^[A-Z]{3}$/.test(tok)) {
        ids = byAdm0.get(tok);
        if (!ids) throw new Error(`${where}: unknown Natural Earth admin-0 code ${tok}`);
      } else {
        ids = byIso.get(tok);
        if (!ids) throw new Error(`${where}: unknown Natural Earth admin-1 code ${tok}`);
      }
      for (const i of ids) {
        if (neg) plus.delete(i);
        else plus.add(i);
      }
    }
    return [...plus].sort((a, b) => a - b);
  };
}

function ringPlanarArea(ring) {
  let s = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return s / 2; // > 0 counter-clockwise
}

function rewindPolygon(rings) {
  return rings.map((r, k) => {
    const ccw = ringPlanarArea(r) > 0;
    const wantCcw = k > 0; // exterior clockwise, holes counter-clockwise (repo / Globe.gl convention)
    return ccw === wantCcw ? r : r.slice().reverse();
  });
}

function polyAreaKm2(rings) {
  // geoArea with d3 winding: rewind to d3's spherical convention (exterior clockwise) — ours already is.
  return geoArea({ type: 'Polygon', coordinates: rings }) * EARTH_KM2;
}

async function main() {
  const fc = await loadAdmin1();
  const atoms = prepareAtoms(fc);
  const resolve = makeResolver(atoms);
  console.log(`Natural Earth admin-1 units: ${atoms.length}`);

  // ---- versions + overlap check ----------------------------------------------------------
  const versions = [];
  const errors = [];
  const ids = new Set();
  for (const ent of NATION_ENTITIES) {
    if (ids.has(ent.id)) errors.push(`duplicate entity id ${ent.id}`);
    ids.add(ent.id);
    let prevTo = -Infinity;
    for (const per of ent.periods) {
      const to = per.to == null ? NATIONS_END + 1 : per.to;
      if (!(per.from < to)) errors.push(`${ent.id}: empty period ${per.from}–${per.to}`);
      if (per.from < prevTo) errors.push(`${ent.id}: overlapping / unsorted periods at ${per.from}`);
      prevTo = to;
      let atomIds;
      try {
        atomIds = resolve(per.units, `${ent.id} ${per.from}`);
      } catch (e) {
        errors.push(e.message);
        continue;
      }
      if (!atomIds.length) errors.push(`${ent.id} ${per.from}: resolves to no units`);
      versions.push({ entity: ent.id, from: per.from, to, atomIds, group: nationColorGroup(ent, per) });
    }
  }
  const claim = new Map();
  for (let y = NATIONS_START; y <= NATIONS_END; y++) {
    claim.clear();
    for (const v of versions) {
      if (y < v.from || y >= v.to) continue;
      for (const a of v.atomIds) {
        if (claim.has(a)) {
          errors.push(`${y}: ${atoms[a].iso || atoms[a].adm0} (${atoms[a].name}) claimed by ${claim.get(a)} and ${v.entity}`);
        } else claim.set(a, v.entity);
      }
    }
  }
  // Coverage report: big unclaimed land units at sample years.
  const gaps = [];
  for (const y of [1914, 1920, 1925, 1939, 1945, 1950, 1960, 1975, 1991, 2000, 2025]) {
    const claimed = new Set();
    for (const v of versions) if (y >= v.from && y < v.to) for (const a of v.atomIds) claimed.add(a);
    const missing = atoms.filter((a) => !claimed.has(a.idx) && a.areaKm2 > 2500);
    if (missing.length) gaps.push(`${y}: ${missing.map((a) => `${a.adm0}/${a.iso} ${a.name} (${Math.round(a.areaKm2)} km²)`).join(', ')}`);
  }
  if (errors.length) {
    console.error(`\n✗ ${errors.length} table error(s):\n  ` + [...new Set(errors)].slice(0, 80).join('\n  '));
    process.exit(1);
  }
  if (gaps.length) {
    console.error('\n✗ Unclaimed land units > 2,500 km²:\n  ' + gaps.join('\n  '));
    process.exit(1);
  }

  // ---- topology, simplify, merge --------------------------------------------------------
  console.log('Building admin-1 topology …');
  let topo = topology({ atoms: { type: 'FeatureCollection', features: atoms.map((a) => a.feature) } }, 1e6);
  topo = presimplify(topo, sphericalTriangleArea);
  topo = simplify(topo, SIMPLIFY_SR);
  const atomGeoms = topo.objects.atoms.geometries; // same order as atoms

  const shapeKeyToIndex = new Map();
  const shapes = [];
  for (const v of versions) {
    const key = v.atomIds.join(',');
    if (!shapeKeyToIndex.has(key)) {
      shapeKeyToIndex.set(key, shapes.length);
      shapes.push({ key, atomIds: v.atomIds });
    }
    v.shape = shapeKeyToIndex.get(key);
  }

  console.log(`Merging ${shapes.length} distinct shapes for ${versions.length} state-periods …`);
  const features = [];
  let droppedParts = 0;
  let vertices = 0;
  let parts = 0;
  for (let s = 0; s < shapes.length; s++) {
    const merged = mergeArcs(topo, shapes[s].atomIds.map((i) => atomGeoms[i]));
    const g = feature(topo, merged).geometry;
    const polys = g ? (g.type === 'Polygon' ? [g.coordinates] : g.coordinates) : [];
    const cleaned = polys
      .map((rings) => rewindPolygon(rings.filter((r) => r.length >= 4)))
      .filter((rings) => rings.length)
      .map((rings) => ({ rings, area: polyAreaKm2(rings) }));
    const largest = cleaned.reduce((m, p) => Math.max(m, p.area), 0);
    const kept = cleaned
      // Keep big parts, the largest part, and sizeable exclaves (≥ 5% of the largest and
      // ≥ 150 km², e.g. Gaza). Each part costs two draw calls on the globe, so atoll states
      // (the Maldives had 176 parts) keep only their largest islands.
      .filter((p) => p.area >= MIN_PART_KM2 || p.area === largest || (p.area >= largest * 0.05 && p.area >= 150))
      .sort((a, b) => b.area - a.area)
      .filter((p, i) => p.area >= MIN_PART_KM2 || i < MAX_SMALL_PARTS)
      .map((p) => [p.rings[0], ...p.rings.slice(1).filter((h) => Math.abs(polyAreaKm2([h.slice().reverse()])) >= MIN_PART_KM2)]);
    droppedParts += cleaned.length - kept.length;
    parts += kept.length;
    for (const rings of kept) for (const r of rings) vertices += r.length;
    features.push({ type: 'Feature', properties: { s }, geometry: { type: 'MultiPolygon', coordinates: kept } });
  }

  const out = topology({ shapes: { type: 'FeatureCollection', features } }, QUANTIZE);
  // Keep per-shape index order stable; strip feature properties to a compact `s`.
  out.objects.shapes.geometries.forEach((gm, i) => {
    gm.properties = { s: i };
  });
  out.versions = versions.map((v) => [v.entity, v.from, v.to, v.shape]);
  out.meta = {
    source: 'Natural Earth 1:10m admin-1 states/provinces (public domain), regrouped by year',
    table: 'src/globe-nations-table.js',
    simplifyKm2: SIMPLIFY_SR * EARTH_KM2,
    minPartKm2: MIN_PART_KM2,
    years: [NATIONS_START, NATIONS_END],
  };
  if (FINE) {
    out.meta.variant = 'fine';
    const json = JSON.stringify(out);
    fs.writeFileSync(OUT, json);
    console.log(
      `✓ ${path.relative(ROOT, OUT)} (fine): ${(json.length / 1024).toFixed(0)} KB, ${shapes.length} shapes, ` +
        `${parts} polygons (${droppedParts} tiny parts dropped), ~${vertices} vertices`,
    );
    return;
  }

  // ---- colours: neighbours (shared border in any year) never share a colour ---------------
  const adj = new Map();
  const addEdge = (a, b) => {
    if (a === b) return;
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  };
  const groups = new Set(versions.map((v) => v.group));
  let lastKey = '';
  for (let y = NATIONS_START; y <= NATIONS_END; y++) {
    const act = versions.filter((v) => y >= v.from && y < v.to);
    const key = act.map((v) => `${v.entity}:${v.shape}`).join('|');
    if (key === lastKey) continue;
    lastKey = key;
    const nb = neighbors(act.map((v) => out.objects.shapes.geometries[v.shape]));
    nb.forEach((list, i) => list.forEach((j) => addEdge(act[i].group, act[j].group)));
  }
  // Pairs that read as "the same colour" over imagery + presence wash.
  const LOOKALIKE = new Map();
  for (const [a, b] of [
    ['#C9D45C', '#7E9F3D'], ['#C9D45C', '#D4A63A'], ['#D4A63A', '#F08A4B'], ['#F08A4B', '#B5654A'],
    ['#B5654A', '#D9534F'], ['#E46FC4', '#E7849F'], ['#A77BDB', '#5B8DEF'], ['#3DBE8B', '#2BB3C0'],
    ['#7E9F3D', '#3DBE8B'], ['#D4A63A', '#B5654A'],
  ]) {
    if (!LOOKALIKE.has(a)) LOOKALIKE.set(a, new Set());
    if (!LOOKALIKE.has(b)) LOOKALIKE.set(b, new Set());
    LOOKALIKE.get(a).add(b);
    LOOKALIKE.get(b).add(a);
  }
  const colors = {};
  const used = new Map(NATION_PALETTE.map((c) => [c, 0]));
  for (const [g, c] of Object.entries(NATION_FIXED_COLORS)) if (groups.has(g) || g === '__disputed') colors[g] = c;
  const order = [...groups]
    .filter((g) => !colors[g])
    .sort((a, b) => (adj.get(b)?.size || 0) - (adj.get(a)?.size || 0) || a.localeCompare(b));
  for (const g of order) {
    const taken = new Set([...(adj.get(g) || [])].map((n) => colors[n]).filter(Boolean));
    const free = NATION_PALETTE.filter((c) => !taken.has(c));
    if (!free.length) throw new Error(`colouring: no free colour for ${g}`);
    // Soft rule: also avoid colours that merely look alike next to each other (e.g. lime / olive).
    const nearClash = (c) => [...(adj.get(g) || [])].filter((n) => colors[n] && LOOKALIKE.get(c)?.has(colors[n])).length;
    free.sort((a, b) => nearClash(a) - nearClash(b) || used.get(a) - used.get(b));
    colors[g] = free[0];
    used.set(free[0], used.get(free[0]) + 1);
  }
  const clashes = [];
  for (const [g, set] of adj) for (const n of set) if (colors[g] === colors[n] && g < n) clashes.push(`${g}/${n}`);
  if (clashes.length) throw new Error(`colour clashes between neighbours: ${clashes.join(', ')}`);
  let near = 0;
  for (const [g, set] of adj) for (const n of set) if (g < n && LOOKALIKE.get(colors[g])?.has(colors[n])) near++;
  console.log(`  colours: ${groups.size} groups, ${near} look-alike neighbour pairs left`);
  fs.writeFileSync(
    COLORS_OUT,
    `// Generated by scripts/build-nations.mjs — do not edit by hand.\n` +
      `// Colour per nations colour group (state id, colonial owner, or __disputed); neighbours differ in every year.\n` +
      `export const NATION_COLORS = ${JSON.stringify(colors, null, 2)};\n` +
      `export const NATION_NEIGHBOURS = ${JSON.stringify(Object.fromEntries([...adj].map(([k, v]) => [k, [...v].sort()]).sort()))};\n`,
  );
  void NATION_ENTITIES_BY_ID;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const json = JSON.stringify(out);
  fs.writeFileSync(OUT, json);
  console.log(
    `✓ ${path.relative(ROOT, OUT)}: ${(json.length / 1024).toFixed(0)} KB, ${shapes.length} shapes, ` +
      `${versions.length} state-periods, ${parts} polygons (${droppedParts} tiny parts dropped), ~${vertices} vertices`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
