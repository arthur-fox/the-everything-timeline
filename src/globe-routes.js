/**
 * Day 53 (Phase 4c step 5.1): trade routes on the globe.
 *
 * Data: data/trade-routes.json (static, loaded with a dynamic import the first time the globe is
 * up — it never touches the timeline landing; see docs/DATA.md). Each route has active years
 * (start…end), land / sea, a colour, goods, a description, sources, a confidence level and one or
 * more paths of [lat, lng] waypoints. scripts/check-routes.js keeps sea lanes off the land.
 *
 * Drawing (globe-view.js, Globe.gl's paths layer): each path is three lines — a soft, wide glow in
 * the route's colour (also the tap target), a dark core so the track reads on any fill or terrain,
 * and bright dashes that move from the first waypoint to the last at the same on-globe speed on
 * every route, so "flow" reads as direction, not distance.
 */

let routes = null;
let loadPromise = null;
const entryCache = new Map(); // route id → [entries] (stable objects so Globe.gl reuses its meshes)

/** Start loading the routes (idempotent). Resolves to the route list. */
export function loadTradeRoutes() {
  if (routes) return Promise.resolve(routes);
  if (!loadPromise) {
    loadPromise = import('../data/trade-routes.json')
      .then((m) => {
        routes = (m.default || m).routes || [];
        return routes;
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

export function areTradeRoutesLoaded() {
  return Boolean(routes);
}

export function getTradeRoutes() {
  return routes || [];
}

export function getTradeRouteById(id) {
  return (routes || []).find((r) => r.id === id) || null;
}

/** Routes running in `year` (inclusive). */
export function tradeRoutesAtYear(year) {
  const y = Number(year);
  if (!routes || !Number.isFinite(y)) return [];
  return routes.filter((r) => y >= r.start && y <= r.end);
}

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

/**
 * The Globe.gl path entries for one route: per path, a glow, a core and a flow line.
 * Fields used by globe-view.js: points, kind ('glow' | 'core' | 'flow'), route, pathName, lengthDeg.
 */
export function routeEntries(route) {
  let list = entryCache.get(route.id);
  if (list) return list;
  list = [];
  for (const p of route.paths) {
    const lengthDeg = pathLengthDeg(p.points);
    const base = { route, pathName: p.name, via: p.via || null, points: p.points, lengthDeg };
    list.push({ ...base, kind: 'glow' }, { ...base, kind: 'core' }, { ...base, kind: 'flow' });
  }
  entryCache.set(route.id, list);
  return list;
}

/** All entries to draw in `year`: glows, then dark cores, then the moving dashes on top. */
export function tradeRouteEntriesAtYear(year) {
  const byKind = { glow: [], core: [], flow: [] };
  for (const r of tradeRoutesAtYear(year)) {
    for (const e of routeEntries(r)) byKind[e.kind].push(e);
  }
  return byKind.glow.concat(byKind.core, byKind.flow);
}

/** "130 BCE – 1450 CE" style span for the hover label (same wording as the detail panel). */
export function formatRouteYears(route) {
  const f = (y) => (y < 0 ? `${-y} BCE` : `${y} CE`);
  return `${f(route.start)} – ${f(route.end)}`;
}
