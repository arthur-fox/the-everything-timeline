#!/usr/bin/env node
/**
 * Day 42: era-neutral place labels for the globe (close zoom) → src/data/places.json.
 *
 * Source: Natural Earth 1:50m physical labels (public domain) — marine polygons (oceans, seas,
 * gulfs, bays, straits) and geography regions (mountain ranges, deserts, plateaus, plains,
 * basins, peninsulas, big islands, deltas …). These names don't change with the year slider, so
 * they are safe at any date; dated cities are a later roadmap step (Phase 4b "Dated cities").
 *
 * Each place is [name, lat, lng, rank, class, areaKm2, clearKm]: anchor = pole of
 * inaccessibility of its largest part (src/geo-label-point.js), rank = Natural Earth scalerank
 * (0 = biggest), clearKm = the anchor's distance to the outline. Run: npm run build:places
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { geometryLabelAnchor } from '../src/geo-label-point.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, '.cache', 'natural-earth');
const OUT = path.join(ROOT, 'src', 'data', 'places.json');
const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';

async function load(name) {
  const local = path.join(CACHE, `${name}.geojson`);
  if (!fs.existsSync(local)) {
    fs.mkdirSync(CACHE, { recursive: true });
    console.log(`Downloading ${name} …`);
    const res = await fetch(`${BASE}${name}.geojson`);
    if (!res.ok) throw new Error(`Natural Earth download failed (${name}): ${res.status}`);
    fs.writeFileSync(local, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(local, 'utf8'));
}

const titleCase = (s) =>
  String(s)
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
    .replace(/\b(Of|The|And)\b/g, (w) => w.toLowerCase());

// Region classes → our label class. Continents and archipelago groups are left out (country
// labels already cover them, and "Japan" / "Philippines" island groups would read as states).
const REGION_CLASS = {
  'Range/mtn': 'range',
  Desert: 'desert',
  Plateau: 'region',
  Plain: 'region',
  Basin: 'region',
  Tundra: 'region',
  Lowland: 'region',
  Valley: 'region',
  Foothills: 'region',
  Wetlands: 'region',
  Delta: 'region',
  Gorge: 'region',
  Geoarea: 'region',
  Isthmus: 'region',
  'Pen/cape': 'region',
  Peninsula: 'region',
  Coast: 'region',
  Island: 'island',
};
// Names that are (or were) also a state / colony label, NE oddities, or not a region at all.
const SKIP = new Set([
  'Greenland', 'Iceland', 'Madagascar', 'Sri Lanka', 'Ireland', 'Taiwan', 'Cuba', 'Jamaica', 'Cyprus',
  'Puerto Rico', 'Trinidad', 'Timor', 'Newfoundland', 'Prince Edward Island', 'Sakhalin', 'Hispaniola',
  'Great Britain', 'Mainland Tasmania', 'North Island', 'South Island', 'Central America', 'Punjab',
  'Enugu Nigeria', 'Grande Sertão Veredas National Park', 'Dome A', 'Dome C', 'Dome F', 'Talos Dome',
  'Alaska', 'Labrador', 'Nova Scotia', 'Florida', 'Indian subcontinent', 'Western Plateau',
]);

async function main() {
  const marine = await load('ne_50m_geography_marine_polys');
  const regions = await load('ne_50m_geography_regions_polys');
  const seen = new Map();
  const places = [];
  const add = (name, cls, rank, geometry) => {
    const a = geometryLabelAnchor(geometry, 0.05);
    if (!a) return;
    const key = `${cls}:${name}`;
    // Natural Earth splits a few features (Andes ranges, Transantarctic Mountains …): keep the biggest.
    if (seen.has(key)) {
      const prev = seen.get(key);
      if (prev[5] >= a.areaKm2) return;
      places.splice(places.indexOf(prev), 1);
    }
    const row = [name, +a.lat.toFixed(2), +a.lng.toFixed(2), rank, cls, Math.round(a.areaKm2), Math.round(a.distKm)];
    seen.set(key, row);
    places.push(row);
  };

  for (const f of marine.features) {
    const p = f.properties;
    if (p.featurecla === 'river' || p.featurecla === 'reef') continue; // estuary stubs, not the river
    // Oceans keep their North / South split (`name`); others use the English name.
    let name = p.featurecla === 'ocean' ? titleCase(p.name) : p.name_en || p.name;
    if (name === 'Tikahtnu Inlet') name = 'Cook Inlet';
    add(name, p.featurecla === 'ocean' ? 'ocean' : 'sea', Number(p.scalerank) || 0, f.geometry);
  }
  for (const f of regions.features) {
    const p = f.properties;
    const cls = REGION_CLASS[p.FEATURECLA];
    if (!cls) continue;
    const rank = Number(p.SCALERANK) || 0;
    let name = p.NAME_EN || titleCase(p.NAME);
    name = name.replace(/^horn of Africa$/, 'Horn of Africa').replace(/^Pamir mountains$/, 'Pamir Mountains');
    name = name.replace(/^(Kolyma|Tannu-Ola) mountains$/, '$1 Mountains').replace(/^Naga hills$/, 'Naga Hills');
    name = name.replace(/^Amazon basin$/, 'Amazon Basin').replace(/^Congo basin$/, 'Congo Basin');
    name = name.replace(/^Nullabor Plain$/, 'Nullarbor Plain').replace(/^Serra da Mantiquiera$/, 'Serra da Mantiqueira');
    name = name.replace(/^Ahag$/, 'Ahaggar').replace(/^Southern Alps\/.*$/, 'Southern Alps');
    if (SKIP.has(name)) continue;
    if (cls === 'island' && rank > 3) continue; // small islands carry their own state labels
    if (p.FEATURECLA === 'Coast' && /Coast$/.test(name) && p.REGION === 'Antarctica') continue;
    add(name, cls, rank, f.geometry);
  }
  places.sort((a, b) => a[3] - b[3] || b[5] - a[5]);
  const out = {
    meta: {
      source: 'Natural Earth 1:50m geography marine polys + regions polys (public domain)',
      columns: ['name', 'lat', 'lng', 'rank', 'class', 'areaKm2', 'clearKm'],
    },
    places,
  };
  fs.writeFileSync(OUT, `${JSON.stringify(out)}\n`);
  const by = {};
  for (const p of places) by[p[4]] = (by[p[4]] || 0) + 1;
  console.log(`✓ ${path.relative(ROOT, OUT)}: ${places.length} places ${JSON.stringify(by)}, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
