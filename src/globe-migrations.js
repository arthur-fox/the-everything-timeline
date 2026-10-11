/**
 * Day 55 (Phase 4c step 5.2): migrations on the globe.
 *
 * Data: data/migrations.json (static, loaded with a dynamic import once the globe is up, like the
 * trade routes; see docs/DATA.md). Each migration has active years, a colour, who moved
 * (`people`), a scale 1–4 (the line width), forced or not, a description, sources, a confidence
 * level and one or more paths of [lat, lng] waypoints in the direction people moved. A path can
 * have its own start / end inside the migration's years, so a long expansion unrolls stage by
 * stage as the year moves. scripts/check-migrations.js keeps sea paths off the land.
 *
 * Drawing (globe-view.js, the same Globe.gl paths layer as the trade routes): a wide soft glow,
 * a dark core and long, slow dashes moving the way people went. Width grows with scale.
 */

let migrations = null;
let loadPromise = null;
const entryCache = new Map(); // `${migration id}|${path index}` → [glow, core, flow]

/** Start loading the migrations (idempotent). Resolves to the list. */
export function loadMigrations() {
  if (migrations) return Promise.resolve(migrations);
  if (!loadPromise) {
    loadPromise = import('../data/migrations.json')
      .then((m) => {
        migrations = (m.default || m).migrations || [];
        return migrations;
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

export function areMigrationsLoaded() {
  return Boolean(migrations);
}

export function getMigrations() {
  return migrations || [];
}

export function getMigrationById(id) {
  return (migrations || []).find((m) => m.id === id) || null;
}

const pathStart = (m, p) => p.start ?? m.start;
const pathEnd = (m, p) => p.end ?? m.end;

function pathLengthDeg(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const [lat0, lng0raw] = points[i - 1];
    const [lat1, lng1] = points[i];
    let lng0 = lng0raw;
    while (Math.abs(lng0 - lng1) > 180) lng0 += lng0 < lng1 ? 360 : -360;
    const k = Math.cos((((lat0 + lat1) / 2) * Math.PI) / 180);
    len += Math.hypot(lat1 - lat0, (lng1 - lng0) * k);
  }
  return Math.max(len, 0.1);
}

function pathEntries(m, i) {
  const key = `${m.id}|${i}`;
  let list = entryCache.get(key);
  if (list) return list;
  const p = m.paths[i];
  const base = {
    layer: 'migration',
    route: m, // same field name as trade-route entries, so the shared paths layer reads both
    pathName: p.name,
    pathStart: pathStart(m, p),
    pathEnd: pathEnd(m, p),
    via: p.via || null,
    points: p.points,
    lengthDeg: pathLengthDeg(p.points),
    scale: m.scale || 1,
  };
  list = [{ ...base, kind: 'glow' }, { ...base, kind: 'core' }, { ...base, kind: 'flow' }];
  entryCache.set(key, list);
  return list;
}

/** Glow / core / flow entries for every migration path running in `year` (inclusive). */
export function migrationEntriesAtYear(year) {
  const y = Number(year);
  const byKind = { glow: [], core: [], flow: [] };
  if (!migrations || !Number.isFinite(y)) return [];
  for (const m of migrations) {
    if (y < m.start || y > m.end) continue;
    m.paths.forEach((p, i) => {
      if (y < pathStart(m, p) || y > pathEnd(m, p)) return;
      for (const e of pathEntries(m, i)) byKind[e.kind].push(e);
    });
  }
  return byKind.glow.concat(byKind.core, byKind.flow);
}

/** "1500 BCE – 500 CE" style span (same wording as the trade routes). */
export function formatMigrationYears(start, end) {
  const f = (y) => (y < 0 ? `${-y} BCE` : `${y} CE`);
  return `${f(start)} – ${f(end)}`;
}
