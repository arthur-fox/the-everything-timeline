#!/usr/bin/env node
/**
 * Day 51: the one small data build step (see docs/DATA.md).
 *
 * Reads the hand-edited country timelines in data/countries/<id>.json and writes
 * src/generated/countries-index.json (gitignored): the list of countries (id, name, flag,
 * year range) for the picker plus a light [id, name, icon] index of their items, so the
 * globe can link to country items without downloading every country file.
 * Full country files are imported lazily by src/main.js (Vite minifies + hashes them).
 *
 * Runs automatically before `npm run dev` and `npm run build`; validation lives in
 * scripts/validate-data.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'data/countries');
const OUT = path.join(ROOT, 'src/generated/countries-index.json');

const countries = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => {
    const c = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
    return {
      id: c.id,
      name: c.name,
      flag: c.flag,
      minYear: c.minYear,
      maxYear: c.maxYear,
      items: (c.items || []).map((it) => [it.id, it.name, it.icon || '']),
    };
  });

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const json = JSON.stringify(countries);
if (!fs.existsSync(OUT) || fs.readFileSync(OUT, 'utf8') !== json) fs.writeFileSync(OUT, json);
console.log(`build-data: ${countries.length} countries, ${countries.reduce((a, c) => a + c.items.length, 0)} items → src/generated/countries-index.json (${(json.length / 1024).toFixed(1)} KB)`);

// ---------------------------------------------------------------------------------------------
// Day 52: QR codes for the tip-jar crypto addresses (src/support-config.js), generated here at
// build time as tiny inline SVGs (one <path>) so the site ships no QR library. The QR encodes the
// bare address (scannable by every wallet). Written to src/generated/support-qr.json (gitignored)
// and imported only by the lazy support panel.
// ---------------------------------------------------------------------------------------------
import { qrSvg } from './support-qr.mjs';
import { SUPPORT_CONFIG } from '../src/support-config.js';

const QR_OUT = path.join(ROOT, 'src/generated/support-qr.json');
const qrJson = JSON.stringify(Object.fromEntries(SUPPORT_CONFIG.CRYPTO.map((c) => [c.id, qrSvg(c.address)])));
if (!fs.existsSync(QR_OUT) || fs.readFileSync(QR_OUT, 'utf8') !== qrJson) fs.writeFileSync(QR_OUT, qrJson);
console.log(`build-data: ${SUPPORT_CONFIG.CRYPTO.length} support QR codes → src/generated/support-qr.json (${(qrJson.length / 1024).toFixed(1)} KB)`);

// ---------------------------------------------------------------------------------------------
// Day 65: timeline → globe links. For every timeline item (topic items, country items, and world
// events as 'event:<title>') the globe shapes that link to it (entity.timelineItemIds) and the
// event pins that point at it, each with a year and a camera target, so the item's detail panel
// can offer "On the globe" jumps. Written to src/generated/globe-links.json (gitignored) and
// imported lazily by src/main.js the first time a timeline detail opens.
// ---------------------------------------------------------------------------------------------
import { spatialEntities, resolveRegionRing } from '../src/globe-overlays.js';
import { EVENT_PINS } from '../src/globe-event-pins.js';
import { civilisations } from '../src/civilisations.js';
import { warsItems } from '../src/wars.js';

const LINKS_OUT = path.join(ROOT, 'src/generated/globe-links.json');
const spans = new Map();
for (const it of [...civilisations, ...warsItems]) spans.set(it.id, [it.start, it.end]);
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith('.json'))) {
  for (const it of JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')).items || []) spans.set(it.id, [it.start, it.end]);
}
const r2 = (v) => Math.round(v * 100) / 100;
const pinKey = (ref) => {
  const [kind, ...rest] = ref.split(':');
  if (kind === 'event') return ref;
  return rest[rest.length - 1];
};
const links = {};
const add = (key, link) => (links[key] ||= []).push(link);
const pinsByKey = new Map();
for (const p of EVENT_PINS) {
  const key = pinKey(p.ref);
  if (!pinsByKey.has(key)) pinsByKey.set(key, []);
  pinsByKey.get(key).push(p);
}
function ringStats(ring) {
  let a = 0, x = 0, y = 0, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[i + 1];
    a += ax * by - bx * ay;
    x += ax; y += ay;
    x0 = Math.min(x0, ax); x1 = Math.max(x1, ax); y0 = Math.min(y0, ay); y1 = Math.max(y1, ay);
  }
  const n = Math.max(1, ring.length - 1);
  const k = Math.cos(((y / n) * Math.PI) / 180);
  return { area: Math.abs(a / 2) * k, lng: x / n, lat: y / n, span: Math.max(y1 - y0, (x1 - x0) * k) };
}
for (const ent of spatialEntities) {
  const overlays = (ent.overlays || []).filter((o) => Number.isFinite(o.year));
  if (!overlays.length) continue;
  for (const tid of new Set(ent.timelineItemIds || [])) {
    const [s, e] = spans.get(tid) || [-Infinity, Infinity];
    let frames = overlays.filter((o) => o.year >= s && o.year <= e);
    if (!frames.length) frames = [overlays.reduce((b, o) => (Math.min(Math.abs(o.year - s), Math.abs(o.year - e)) < Math.min(Math.abs(b.year - s), Math.abs(b.year - e)) ? o : b))];
    const pins = pinsByKey.get(tid) || [];
    const pinAt = pins.length ? [pins.reduce((t, p) => t + p.lat, 0) / pins.length, pins.reduce((t, p) => t + p.lng, 0) / pins.length] : null;
    let best = null;
    for (const o of frames) {
      const regions = (o.regions || []).map((r) => resolveRegionRing(r)).filter((r) => r && r.length > 3).map(ringStats);
      if (!regions.length) continue;
      const total = regions.reduce((t, r) => t + r.area, 0);
      const focus = pinAt
        ? regions.reduce((b, r) => (Math.hypot(r.lat - pinAt[0], r.lng - pinAt[1]) < Math.hypot(b.lat - pinAt[0], b.lng - pinAt[1]) ? r : b))
        : regions.reduce((b, r) => (r.area > b.area ? r : b));
      if (!best || total > best.total) best = { total, year: o.year, focus };
    }
    if (!best) continue;
    const { focus } = best;
    add(tid, { e: ent.id, n: ent.name, y: best.year, lat: r2(focus.lat), lng: r2(focus.lng), a: r2(Math.max(0.3, Math.min(1.6, focus.span / 12))) });
  }
}
for (const [key, pins] of pinsByKey) {
  for (const p of pins) add(key, { p: p.label, y: p.year, lat: r2(p.lat), lng: r2(p.lng), a: 0.45 });
}
for (const list of Object.values(links)) list.sort((a, b) => a.y - b.y || (a.e ? -1 : 1));
const linksJson = JSON.stringify(links);
if (!fs.existsSync(LINKS_OUT) || fs.readFileSync(LINKS_OUT, 'utf8') !== linksJson) fs.writeFileSync(LINKS_OUT, linksJson);
console.log(`build-data: globe links for ${Object.keys(links).length} timeline items → src/generated/globe-links.json (${(linksJson.length / 1024).toFixed(1)} KB)`);
