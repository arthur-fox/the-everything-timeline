/**
 * Day 38 — modern nations layer (1914–2025) for the globe.
 *
 * Arthur: "the past 100 years or so should be filled up with nations since we now live in a
 * world full of nations". From 1914 the hand-drawn schematic empires hand off to real
 * nation-state polygons that change at real dates (WWI breakups, the 1922 Soviet union,
 * decolonisation, 1991). Geometry: Natural Earth (public domain) regrouped by year — see
 * src/globe-nations-table.js (the date table) and scripts/build-nations.mjs (the build).
 *
 * The table is bundled (cheap, synchronous: lookups, active checks, the sidebar list);
 * the polygons (~130 KB gzipped TopoJSON) are fetched lazily when the globe first mounts.
 */
import { feature } from 'topojson-client';
import {
  NATION_ENTITIES,
  NATION_ENTITIES_BY_ID,
  NATION_OWNERS,
  NATIONS_START,
  NATIONS_END,
  nationColorGroup,
} from './globe-nations-table.js';
import { NATION_COLORS } from './data/nations-colors.js';
import { getOverlayPolygonFeatures, getActiveOverlaysAtYear } from './globe-overlays.js';

export { NATIONS_START, NATIONS_END, NATION_ENTITIES };

export const NATION_ID_PREFIX = 'nation-';

/** Day 38: schematic polities (empires) are replaced by the nations layer from this year. */
export const NATIONS_HANDOFF_YEAR = NATIONS_START;

export const NATIONS_SOURCES = [
  { title: 'Natural Earth — admin-0 / admin-1 boundaries (public domain)', url: 'https://www.naturalearthdata.com/' },
  { title: 'Natural Earth terms of use', url: 'https://www.naturalearthdata.com/about/terms-of-use/' },
];

const KIND_OPACITY = { state: 0.56, dominion: 0.46, colony: 0.4, disputed: 0.42 };

export function isNationEntityId(id) {
  return typeof id === 'string' && id.startsWith(NATION_ID_PREFIX);
}

function tableIdFrom(entityId) {
  return isNationEntityId(entityId) ? entityId.slice(NATION_ID_PREFIX.length) : null;
}

function periodEnd(per) {
  return per.to == null ? NATIONS_END + 1 : per.to;
}

/** The table period active for a nation at `year`, or null. */
export function getNationPeriodAtYear(entityOrId, year) {
  const ent = typeof entityOrId === 'string' ? NATION_ENTITIES_BY_ID.get(tableIdFrom(entityOrId) ?? entityOrId) : entityOrId;
  if (!ent) return null;
  const y = Math.round(Number(year));
  return ent.periods.find((p) => y >= p.from && y < periodEnd(p)) || null;
}

export function isNationActiveAtYear(entityId, year) {
  return Boolean(getNationPeriodAtYear(entityId, year));
}

/** Nearest year (to `year`) at which the nation exists — for sidebar / deep-link jumps. */
export function nearestNationYear(entityId, year) {
  const ent = NATION_ENTITIES_BY_ID.get(tableIdFrom(entityId) ?? entityId);
  if (!ent) return null;
  const y = Math.round(Number(year));
  let best = null;
  for (const p of ent.periods) {
    const lo = p.from;
    const hi = periodEnd(p) - 1;
    const c = Math.min(hi, Math.max(lo, y));
    if (best == null || Math.abs(c - y) < Math.abs(best - y)) best = c;
  }
  return best;
}

export function nationColorFor(ent, per) {
  return NATION_COLORS[nationColorGroup(ent, per)] || '#9AA3AD';
}

export function nationKindLabel(per) {
  const kind = per?.kind || 'state';
  if (kind === 'colony') {
    const adj = NATION_OWNERS[per.owner] || '';
    return `${adj} colony / protectorate`.trim();
  }
  if (kind === 'dominion') return 'British dominion';
  if (kind === 'disputed') return 'Disputed / occupied';
  return 'Nation';
}

function formatSpan(from, to) {
  // The layer starts in 1914, so a period "from 1914" usually began earlier.
  if (from <= NATIONS_START) return to == null ? 'Throughout 1914–today' : `Until ${to}`;
  return to == null ? `From ${from}` : `${from}–${to}`;
}

function describeNation(ent) {
  const lines = ent.periods.map((p) => {
    const label = p.name || ent.name;
    // "Gold Coast (British)" already says who ruled it; otherwise add the status.
    const kind = p.kind && p.kind !== 'state' && !label.includes('(') ? ` (${nationKindLabel(p)})` : '';
    const note = p.note ? ` — ${p.note.replace(/\.+$/, '')}` : '';
    return `${formatSpan(p.from, p.to)}: ${label}${kind}${note}.`;
  });
  return (
    `${lines.join(' ')} ` +
    'Borders are Natural Earth (public domain) lines regrouped by year; before 1945 some shifts are approximated at province level.'
  );
}

/**
 * A detail-panel-ready entity for a nation (same shape the globe code uses for polities).
 * @param {string} entityId e.g. `nation-france`
 * @param {number} [year] picks the period name / colour for that year
 */
export function getNationEntityById(entityId, year) {
  const ent = NATION_ENTITIES_BY_ID.get(tableIdFrom(entityId) ?? '');
  if (!ent) return null;
  const per = (year != null && getNationPeriodAtYear(ent, year)) || ent.periods[ent.periods.length - 1];
  const first = ent.periods[0];
  const last = ent.periods[ent.periods.length - 1];
  return {
    id: NATION_ID_PREFIX + ent.id,
    tableId: ent.id,
    name: per.name || ent.name,
    baseName: ent.name,
    type: 'nation',
    nationKind: per.kind || 'state',
    kindLabel: nationKindLabel(per),
    period: per,
    color: nationColorFor(ent, per),
    description: describeNation(ent),
    sources: NATIONS_SOURCES,
    timelineItemIds: ent.timelineItemIds || [],
    firstYear: first.from,
    lastYear: last.to == null ? NATIONS_END : last.to - 1,
    keyYears: ent.periods.map((p) => p.from),
  };
}

/** Nations active at `year`, as `{ entity, period }` sorted by display name. */
export function getActiveNationsAtYear(year) {
  const y = Math.round(Number(year));
  if (!(y >= NATIONS_START && y <= NATIONS_END)) return [];
  const out = [];
  for (const ent of NATION_ENTITIES) {
    const per = getNationPeriodAtYear(ent, y);
    if (per) out.push({ entity: getNationEntityById(NATION_ID_PREFIX + ent.id, y), period: per });
  }
  out.sort((a, b) => a.entity.name.localeCompare(b.entity.name));
  return out;
}

/** Schematic polities stop at the handoff year so empires never double-paint over nations. */
export function isSupersededByNations(entity, year) {
  if (!entity || entity.type === 'people' || entity.type === 'presence' || entity.type === 'nation') return false;
  return Math.round(Number(year)) >= NATIONS_HANDOFF_YEAR;
}

/** getActiveOverlaysAtYear minus the polities the nations layer replaces. */
export function getActiveSchematicOverlaysAtYear(year) {
  return getActiveOverlaysAtYear(year).filter(({ entity }) => !isSupersededByNations(entity, year));
}

// ---------------------------------------------------------------------------
// Polygons (lazy TopoJSON)
// ---------------------------------------------------------------------------
let topo = null;
let loadPromise = null;
/** @type {Map<number, object>} shape index → MultiPolygon geometry (shared, so Globe.gl reuses meshes) */
const shapeGeometry = new Map();
/** @type {Map<string, object>} feature cache keyed by entity::shape::year-period */
const featureCache = new Map();
const loadedListeners = new Set();

export function isNationsLoaded() {
  return Boolean(topo);
}

export function onNationsLoaded(cb) {
  if (typeof cb !== 'function') return () => {};
  if (topo) {
    cb();
    return () => {};
  }
  loadedListeners.add(cb);
  return () => loadedListeners.delete(cb);
}

/** Inject a topology directly (validation scripts / tests). */
export function setNationsTopology(t) {
  topo = t;
  shapeGeometry.clear();
  featureCache.clear();
  shapeBoxes = null;
}

export function loadNationsTopology() {
  if (topo) return Promise.resolve(topo);
  if (loadPromise) return loadPromise;
  const url = new URL('./data/nations.topo.json', import.meta.url);
  loadPromise = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`nations topology HTTP ${r.status}`);
      return r.json();
    })
    .then((t) => {
      setNationsTopology(t);
      for (const cb of loadedListeners) {
        try {
          cb();
        } catch (err) {
          console.warn('nations loaded listener failed', err);
        }
      }
      loadedListeners.clear();
      return t;
    })
    .catch((err) => {
      loadPromise = null;
      console.warn('Failed to load nations layer:', err);
      throw err;
    });
  return loadPromise;
}

function geometryForShape(s) {
  let g = shapeGeometry.get(s);
  if (!g && topo) {
    g = feature(topo, topo.objects.shapes.geometries[s]).geometry;
    shapeGeometry.set(s, g);
  }
  return g;
}

// ---------------------------------------------------------------------------
// Day 40: close-zoom borders. A second, finer TopoJSON (same table and shape indices,
// simplified 2 km² instead of 40 km², islands down to 100 km²) is fetched the first time the
// camera comes close; the globe swaps it in only for shapes near the centre of the view, so
// phones never mesh the whole fine world at once.
// ---------------------------------------------------------------------------
let fineTopo = null;
let finePromise = null;
const fineGeometry = new Map();
let shapeBoxes = null;

export function isNationsFineLoaded() {
  return Boolean(fineTopo);
}

export function loadNationsFineTopology() {
  if (fineTopo) return Promise.resolve(fineTopo);
  if (finePromise) return finePromise;
  const url = new URL('./data/nations-fine.topo.json', import.meta.url);
  finePromise = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`fine nations topology HTTP ${r.status}`);
      return r.json();
    })
    .then((t) => {
      // Guard: only usable if it was built from the same table (same shape indices).
      if (!topo || t.objects?.shapes?.geometries?.length !== topo.objects.shapes.geometries.length) {
        throw new Error('fine nations topology does not match the coarse one');
      }
      fineTopo = t;
      fineGeometry.clear();
      return t;
    })
    .catch((err) => {
      finePromise = null;
      console.warn('Fine borders unavailable (keeping the coarse ones):', err);
      throw err;
    });
  return finePromise;
}

function fineGeometryForShape(s) {
  let g = fineGeometry.get(s);
  if (!g && fineTopo) {
    g = feature(fineTopo, fineTopo.objects.shapes.geometries[s]).geometry;
    if (!g || !g.coordinates?.length) return null;
    fineGeometry.set(s, g);
  }
  return g || null;
}

/** Per-part lng/lat boxes of each coarse shape (lng unwrapped across the antimeridian). */
function getShapeBoxes() {
  if (shapeBoxes || !topo) return shapeBoxes;
  shapeBoxes = topo.objects.shapes.geometries.map((_, s) => {
    const g = geometryForShape(s);
    const boxes = [];
    for (const poly of g?.coordinates || []) {
      const ring = poly[0] || [];
      let lo = Infinity;
      let hi = -Infinity;
      let la = Infinity;
      let lb = -Infinity;
      for (const [x, y] of ring) {
        if (x < lo) lo = x;
        if (x > hi) hi = x;
        if (y < la) la = y;
        if (y > lb) lb = y;
      }
      if (hi - lo > 180) {
        lo = Infinity;
        hi = -Infinity;
        for (const [x] of ring) {
          const u = x < 0 ? x + 360 : x;
          if (u < lo) lo = u;
          if (u > hi) hi = u;
        }
      }
      if (Number.isFinite(lo)) boxes.push([lo, la, hi, lb]);
    }
    return boxes;
  });
  return shapeBoxes;
}

function angularDistDeg(lat1, lng1, lat2, lng2) {
  const r = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(a)))) / r;
}

function boxNearCap(box, lat, lng, radiusDeg) {
  const [lo, la, hi, lb] = box;
  const cy = Math.max(la, Math.min(lb, lat));
  let best = Infinity;
  for (const L of [lng, lng + 360, lng - 360]) {
    const cx = Math.max(lo, Math.min(hi, L));
    best = Math.min(best, angularDistDeg(lat, L, cy, cx));
  }
  return best <= radiusDeg;
}

/**
 * Shape indices active at `year` with any part within `radiusDeg` of (lat, lng).
 * @returns {Set<number>}
 */
export function nationShapesNear(year, lat, lng, radiusDeg) {
  const out = new Set();
  const boxes = getShapeBoxes();
  if (!boxes) return out;
  const y = Math.round(Number(year));
  for (const [, from, to, shape] of topo.versions) {
    if (y < from || y >= to || out.has(shape)) continue;
    if ((boxes[shape] || []).some((b) => boxNearCap(b, lat, lng, radiusDeg))) out.add(shape);
  }
  return out;
}

/** Globe.gl polygon features for the nations active at `year` (empty until loaded). */
export function getNationPolygonFeatures(year, fineShapes = null) {
  const y = Math.round(Number(year));
  if (!topo || !(y >= NATIONS_START && y <= NATIONS_END)) return [];
  const out = [];
  for (const [tableId, from, to, shape] of topo.versions) {
    if (y < from || y >= to) continue;
    const ent = NATION_ENTITIES_BY_ID.get(tableId);
    if (!ent) continue;
    const per = getNationPeriodAtYear(ent, y);
    if (!per) continue;
    const fine = Boolean(fineShapes && fineTopo && fineShapes.has(shape) && fineGeometryForShape(shape));
    const key = `${tableId}::${shape}::${per.from}${fine ? '::fine' : ''}`;
    let f = featureCache.get(key);
    if (!f) {
      const geometry = fine ? fineGeometryForShape(shape) : geometryForShape(shape);
      if (!geometry || !geometry.coordinates.length) continue;
      const kind = per.kind || 'state';
      const color = nationColorFor(ent, per);
      const opacity = KIND_OPACITY[kind] ?? KIND_OPACITY.state;
      const name = per.name || ent.name;
      const entityId = NATION_ID_PREFIX + tableId;
      f = {
        // Same shape → same Globe.gl object id, so renames (e.g. Persia → Iran) reuse meshes.
        __id: `${entityId}::s${shape}${fine ? '::fine' : ''}`,
        type: 'Feature',
        geometry,
        entityId,
        name,
        regionId: `s${shape}`,
        regionName: name,
        color,
        opacity,
        entityType: 'nation',
        nationKind: kind,
        approximation: 'simplified',
        detail: fine ? 'fine' : 'coarse',
        properties: { entityId, name, regionId: `s${shape}`, color, opacity, entityType: 'nation', nationKind: kind },
      };
      featureCache.set(key, f);
    }
    out.push(f);
  }
  return out;
}

/**
 * Everything the globe draws at `year`: schematic presence / peoples / pre-1914 polities,
 * plus nations from 1914. `hidePolities` (Day 40 layer toggle) drops nations and keeps the
 * peoples / presence undimmed. Polities are dropped from the handoff year on (no double-painting
 * of, say, the British Empire over independent nations).
 */
export function getGlobePolygonFeatures(year, { hidePolities = false, fineShapes = null } = {}) {
  const y = Math.round(Number(year));
  const schematic = getOverlayPolygonFeatures(y);
  // Until the TopoJSON arrives, keep the schematic empires so the globe is never empty.
  if (y < NATIONS_HANDOFF_YEAR || !topo) return schematic;
  const kept = [];
  for (const f of schematic) {
    if (f.entityType !== 'people' && f.entityType !== 'presence') continue;
    // Day 40: with Polities / Nations switched off, peoples and presence come back to full
    // strength and their own band, so they can be tapped on land again.
    kept.push(hidePolities ? f : dimmedForNationsEra(f));
  }
  if (hidePolities) return kept;
  return [...kept, ...getNationPolygonFeatures(y, fineShapes)];
}

/**
 * In the nations era the land is already filled, so the schematic presence wash and peoples
 * hatch step back (fainter fill, softer edge) and the borders read first. Same geometry object,
 * so Globe.gl keeps its meshes.
 */
const NATIONS_ERA_DIM = { presence: 0.35, people: 0.5 };
const dimCache = new WeakMap();
function dimmedForNationsEra(f) {
  let d = dimCache.get(f);
  if (!d) {
    const k = NATIONS_ERA_DIM[f.entityType] ?? 1;
    const opacity = (Number(f.opacity ?? f.properties?.opacity) || 0.4) * k;
    d = { ...f, opacity, nationsEraDim: true, properties: { ...(f.properties || {}), opacity } };
    dimCache.set(f, d);
  }
  return d;
}
