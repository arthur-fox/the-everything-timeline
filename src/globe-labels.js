/**
 * Day 42 (Phase 4c item 2): zoom-aware country and place labels on the globe.
 *
 * A DOM overlay above the WebGL canvas (crisp text, cheap to move: one composited transform per
 * label per frame). What shows is decided every ~120 ms (phones ~180 ms):
 *   1. candidates = the polygons the globe is drawing right now (so layer toggles and the year
 *      slider are respected for free) + era-neutral physical places (Natural Earth) at close zoom;
 *   2. drop anything on the far side of the globe or too near the limb;
 *   3. a label only shows once its country / sea is big enough on screen to hold the text
 *      (biggest countries far out, smaller ones as you zoom in);
 *   4. greedy collision avoidance by priority (area; labels already up get a small bonus so they
 *      don't flicker), capped at ~50 labels on phones / ~110 on desktop.
 * Between placements, visible labels just follow their anchor every frame.
 */
import { geometryLabelAnchor } from './geo-label-point.js';
import { shortNationLabel, shortOverlayLabel } from './globe-label-names.js';

const R = 100; // Globe.gl globe radius (scene units)
const KM_PER_DEG = 111.2;
const PLACE_TICK_MS = { desktop: 120, mobile: 180 };
const MAX_LABELS = { desktop: 110, mobile: 50 };
const LIMB_MIN = 0.16; // 0 = horizon, 1 = straight below the camera
const PAD = 3; // px around each label for collision

let host = null;
let globe = null;
let Vec3 = null;
let mobile = false;
let container = null;
let enabled = true;
let getSelected = () => null;

let featureCands = [];
let placeCands = [];
let placesState = 'idle'; // idle | loading | ready | error
const records = new Map(); // id → { el, on, fadeUntil, cand, x, y }
let lastTick = 0;
let dirty = true;
let measureCtx = null;
let fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
let hostW = 0;
let hostH = 0;
let tmp = null;
let lastCamKey = '';
const anchorCache = new Map();
const stats = { candidates: 0, shown: 0, lastTickMs: 0, maxTickMs: 0, ticks: 0, frameMs: 0 };

/** Mount the overlay inside the globe host. */
export function initGlobeLabels(opts) {
  destroyGlobeLabels();
  host = opts.host;
  globe = opts.globe;
  Vec3 = opts.THREE?.Vector3 || null;
  mobile = Boolean(opts.mobile);
  if (typeof opts.getSelected === 'function') getSelected = opts.getSelected;
  if (!host || !globe || !Vec3) return;
  tmp = new Vec3();
  container = document.createElement('div');
  container.className = 'globe-labels';
  container.setAttribute('aria-hidden', 'true');
  container.hidden = !enabled;
  host.appendChild(container);
  try {
    const ff = getComputedStyle(host).fontFamily;
    if (ff) fontFamily = ff;
  } catch (_) {
    // ignore
  }
  dirty = true;
  loadPlaces();
}

export function destroyGlobeLabels() {
  if (container?.parentNode) container.parentNode.removeChild(container);
  container = null;
  records.clear();
  host = null;
  globe = null;
  featureCands = [];
  lastCamKey = '';
}

export function setGlobeLabelsEnabled(on) {
  enabled = Boolean(on);
  if (container) container.hidden = !enabled;
  dirty = true;
}

export function areGlobeLabelsEnabled() {
  return enabled;
}

/** Called whenever the globe's polygonsData changes. */
export function setGlobeLabelFeatures(features) {
  featureCands = buildFeatureCandidates(features || []);
  dirty = true;
}

/** Mark for re-placement (e.g. the selection changed). */
export function invalidateGlobeLabels() {
  dirty = true;
}

/** QA / screenshot harness (exposed with ?globeDebug=1). */
export function getGlobeLabelsDebug() {
  const shown = [];
  for (const [id, r] of records) {
    if (!r.on) continue;
    shown.push({ id, text: r.cand.display, kind: r.cand.kind, x: r.x, y: r.y, w: r.cand.w, h: r.cand.h });
  }
  return { enabled, placesState, ...stats, featureCandidates: featureCands.length, placeCandidates: placeCands.length, shown };
}

// ---------------------------------------------------------------------------------------------
// Candidates

function measure(c) {
  if (!measureCtx) {
    const cv = document.createElement('canvas');
    measureCtx = cv.getContext('2d');
  }
  const font = `${c.italic ? 'italic ' : ''}${c.weight} ${c.size}px ${fontFamily}`;
  c.font = font;
  let w = c.display.length * c.size * 0.6;
  if (measureCtx) {
    measureCtx.font = font;
    w = measureCtx.measureText(c.display).width;
  }
  c.w = Math.ceil(w + c.spacing * c.size * c.display.length + 2);
  c.h = Math.ceil(c.size * 1.2);
}

function nationStyle(r, kind) {
  const d = mobile ? 1 : 0;
  let s;
  if (r >= 900) s = { size: 13 - d, upper: true, spacing: 0.14, weight: 700, tier: 'xl' };
  else if (r >= 380) s = { size: 12 - d, upper: true, spacing: 0.1, weight: 700, tier: 'l' };
  else if (r >= 150) s = { size: 11 - d, upper: true, spacing: 0.06, weight: 600, tier: 'm' };
  else s = { size: 10 - d, upper: true, spacing: 0.04, weight: 600, tier: 's' };
  if (kind === 'colony' || kind === 'vassal') s.weight = Math.min(s.weight, 600) - 100;
  s.italic = kind === 'disputed';
  return s;
}

function makeCandidate(base) {
  const c = { ...base };
  c.display = c.upper ? c.text.toLocaleUpperCase('en-GB') : c.text;
  c.id = `${c.key}|${c.display}`;
  c.pos = null;
  c.offN = null;
  c.offE = null;
  measure(c);
  return c;
}

function schematicAnchor(f) {
  const g = f.__etSrcGeometry || f.geometry;
  const ring = g?.type === 'Polygon' ? g.coordinates[0] : g?.coordinates?.[0]?.[0];
  if (!ring || ring.length < 3) return null;
  const mid = ring[Math.floor(ring.length / 2)];
  const key = `${f.__id}|${ring.length}|${ring[0][0].toFixed(2)},${ring[0][1].toFixed(2)}|${mid[0].toFixed(2)},${mid[1].toFixed(2)}`;
  let a = anchorCache.get(key);
  if (a === undefined) {
    a = geometryLabelAnchor(g, 0.1);
    if (anchorCache.size > 4000) anchorCache.clear();
    anchorCache.set(key, a);
  }
  return a;
}

function buildFeatureCandidates(features) {
  const byEntity = new Map();
  for (const f of features) {
    const type = f.entityType || f.properties?.entityType;
    if (type === 'presence') continue;
    const entityId = f.entityId || f.properties?.entityId;
    if (!entityId) continue;
    let anchor = null;
    if (type === 'nation' && Array.isArray(f.labelAnchor)) {
      const [lng, lat, areaKm2, clearKm] = f.labelAnchor;
      anchor = { lng, lat, areaKm2, partKm2: areaKm2, distKm: clearKm };
    } else {
      anchor = schematicAnchor(f);
    }
    if (!anchor) continue;
    const g = byEntity.get(entityId);
    if (!g) byEntity.set(entityId, { f, type, entityId, anchor, area: anchor.areaKm2, best: anchor.partKm2 ?? anchor.areaKm2 });
    else {
      g.area += anchor.areaKm2;
      if ((anchor.partKm2 ?? anchor.areaKm2) > g.best) {
        g.best = anchor.partKm2 ?? anchor.areaKm2;
        g.anchor = anchor;
        g.f = f;
      }
    }
  }
  const out = [];
  for (const g of byEntity.values()) {
    const { f, type, anchor } = g;
    const r = Math.sqrt(g.area / Math.PI);
    const clear = Math.max(anchor.distKm || 0, 1);
    if (type === 'people') {
      // Big peoples only, and not over the nations-era map (they sit dimmed under it).
      if (g.area < 120000 || f.nationsEraDim) continue;
      const text = shortOverlayLabel(f.name || f.properties?.name);
      if (!text) continue;
      out.push(
        makeCandidate({
          key: g.entityId, kind: 'people', text, entityId: g.entityId, lat: anchor.lat, lng: anchor.lng,
          size: mobile ? 10 : 11, upper: false, spacing: 0.02, weight: 500, italic: true, tier: 'p',
          fitKm: Math.max(clear * 1.6, r * 0.7), fit: 0.9, prio: r * 0.45, cls: 'is-people',
        }),
      );
      continue;
    }
    const geom = f.__etSrcGeometry || f.geometry;
    const kind = type === 'nation' ? f.nationKind || 'state' : 'state';
    const text = type === 'nation' ? shortNationLabel(f.name, kind) : shortOverlayLabel(f.name || f.properties?.name);
    if (!text) continue;
    const st = nationStyle(r, kind);
    out.push(
      makeCandidate({
        key: g.entityId, kind: type === 'nation' ? 'nation' : 'polity', text, entityId: g.entityId,
        lat: anchor.lat, lng: anchor.lng, ...st,
        fitKm: Math.max(clear * 2, r * 0.9), fit: 0.65, prio: r, geom,
        cls: `is-${type === 'nation' ? 'nation' : 'polity'} is-${st.tier} is-kind-${kind}`,
      }),
    );
  }
  return out;
}

const PLACE_MAX_ALT = {
  sea: [Infinity, 1.5, 0.95, 0.6, 0.38],
  land: [Infinity, 1.05, 0.72, 0.46, 0.3],
};

async function loadPlaces() {
  if (placesState !== 'idle') {
    if (placesState === 'ready') dirty = true;
    return;
  }
  placesState = 'loading';
  try {
    const mod = await import('./data/places.json');
    const data = mod.default || mod;
    placeCands = (data.places || []).map(([name, lat, lng, rank, cls, areaKm2, clearKm]) => {
      const r = Math.sqrt(areaKm2 / Math.PI);
      const sea = cls === 'ocean' || cls === 'sea';
      const d = mobile ? 1 : 0;
      const st =
        cls === 'ocean'
          ? { size: 12.5 - d, upper: true, spacing: 0.22, weight: 500, italic: true }
          : sea
            ? { size: 11 - d, upper: false, spacing: 0.04, weight: 500, italic: true }
            : { size: 10 - d, upper: true, spacing: 0.12, weight: 600, italic: false };
      return makeCandidate({
        key: `place:${cls}:${name}`, kind: 'place', text: name, lat, lng, ...st, tier: cls,
        maxAlt: PLACE_MAX_ALT[sea ? 'sea' : 'land'][Math.min(4, rank)] ?? 0.3,
        fitKm: Math.max(clearKm * 1.6, r * 0.5), fit: cls === 'ocean' ? 0.6 : 0.9,
        prio: r * (cls === 'ocean' ? 0.25 : 0.3), cls: `is-place is-${cls}`,
      });
    });
    placesState = 'ready';
  } catch (err) {
    console.warn('Globe place labels unavailable:', err);
    placesState = 'error';
  }
  dirty = true;
}

// ---------------------------------------------------------------------------------------------
// Placement + per-frame tracking

function coords(lat, lng) {
  const p = globe.getCoords(lat, lng, 0.004);
  return [p.x, p.y, p.z];
}

function ensurePos(c) {
  if (c.pos) return;
  c.pos = coords(c.lat, c.lng);
  const dLat = Math.min(c.fitKm / KM_PER_DEG, 30);
  const lat2 = c.lat > 60 ? c.lat - dLat : c.lat + dLat;
  c.offN = coords(lat2, c.lng);
  const cosL = Math.max(0.2, Math.cos((c.lat * Math.PI) / 180));
  c.offE = coords(c.lat, c.lng + Math.min(c.fitKm / (KM_PER_DEG * cosL), 60));
}

function project(p, camera) {
  tmp.set(p[0], p[1], p[2]).project(camera);
  return [((tmp.x + 1) / 2) * hostW, ((1 - tmp.y) / 2) * hostH, tmp.z];
}

function facing(p, cx, cy, cz, dist) {
  const horizon = R / dist;
  const len = Math.hypot(p[0], p[1], p[2]) || 1;
  const dot = (p[0] * cx + p[1] * cy + p[2] * cz) / (len * dist);
  return (dot - horizon) / (1 - horizon);
}

function place(camera, camAlt, now) {
  const t0 = performance.now();
  hostW = host.clientWidth;
  hostH = host.clientHeight;
  const { x: cx, y: cy, z: cz } = camera.position;
  const dist = Math.hypot(cx, cy, cz);
  const sel = getSelected();
  const list = [];
  const obstacles = overlayObstacles(now);
  const EDGE = 4;
  const usable = (c, x, y) => {
    const b = [x - c.w / 2, y - c.h / 2, x + c.w / 2, y + c.h / 2];
    if (b[0] < EDGE || b[2] > hostW - EDGE || b[1] < EDGE || b[3] > hostH - EDGE) return false;
    for (const o of obstacles) if (b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]) return false;
    return true;
  };
  // Close up, a country's anchor is often off-screen or under the key although most of the
  // screen is that country: label it inside its visible part instead (screen-grid sampling).
  const grid = camAlt < GRID_MAX_ALT && featureCands.length ? viewportGrid(camera) : null;
  const consider = (c) => {
    if (c.maxAlt !== undefined && camAlt > c.maxAlt) return;
    ensurePos(c);
    const selected = sel && c.entityId === sel;
    const rec = records.get(c.id);
    let score = c.prio * (rec?.on ? 1.3 : 1);
    if (selected) score *= 1e4;
    const f = facing(c.pos, cx, cy, cz, dist);
    if (f >= LIMB_MIN) {
      const [x, y] = project(c.pos, camera);
      if (usable(c, x, y)) {
        const [nx, ny] = project(c.offN, camera);
        const [ex, ey] = project(c.offE, camera);
        const span = 2 * Math.max(Math.hypot(nx - x, ny - y), Math.hypot(ex - x, ey - y));
        if (!selected && span < c.w * c.fit) return;
        list.push({ c, x, y, pos: c.pos, score });
        return;
      }
    }
    const pts = grid?.hits.get(c);
    if (!pts || pts.length < 2) return;
    const span = 2 * Math.sqrt((pts.length * grid.cellArea) / Math.PI);
    if (!selected && span < c.w * 0.9) return;
    // Prefer the previous in-view anchor if it still works (no jumping while panning).
    let best = null;
    if (rec?.on && rec.dyn && rec.pos === rec.dyn.pos && facing(rec.dyn.pos, cx, cy, cz, dist) >= LIMB_MIN) {
      const [x, y] = project(rec.dyn.pos, camera);
      if (usable(c, x, y) && grid.containsNear(c, x, y)) best = { x, y, dyn: rec.dyn };
    }
    if (!best) {
      let mx = 0;
      let my = 0;
      for (const p of pts) {
        mx += p.x;
        my += p.y;
      }
      mx /= pts.length;
      my /= pts.length;
      let bd = Infinity;
      for (const p of pts) {
        if (!usable(c, p.x, p.y)) continue;
        const d = (p.x - mx) ** 2 + (p.y - my) ** 2;
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      if (!best) return;
      best = { x: best.x, y: best.y, dyn: { lat: best.lat, lng: best.lng, pos: coords(best.lat, best.lng) } };
    }
    list.push({ c, x: best.x, y: best.y, pos: best.dyn.pos, dyn: best.dyn, score: score * 0.9 });
  };
  for (const c of featureCands) consider(c);
  if (placesState === 'ready') {
    // The island of Sardinia while the Kingdom of Sardinia is on the map: one label, the state's.
    const stateTexts = new Set(featureCands.map((c) => c.text.toLowerCase()));
    for (const c of placeCands) if (!stateTexts.has(c.text.toLowerCase())) consider(c);
  }
  list.sort((a, b) => b.score - a.score);

  const max = MAX_LABELS[mobile ? 'mobile' : 'desktop'];
  // The key, credit, full-screen button and (full screen) year scrubber float over the globe:
  // treat them as already-placed boxes so no label hides underneath.
  const boxes = obstacles.slice();
  const chosen = new Set();
  for (const it of list) {
    if (chosen.size >= max) break;
    const { c, x, y } = it;
    if (chosen.has(c.id)) continue;
    const b = [x - c.w / 2 - PAD, y - c.h / 2 - PAD, x + c.w / 2 + PAD, y + c.h / 2 + PAD];
    let hit = false;
    for (const o of boxes) {
      if (b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]) {
        hit = true;
        break;
      }
    }
    if (hit) continue;
    boxes.push(b);
    chosen.add(c.id);
    let rec = records.get(c.id);
    if (!rec) {
      const el = document.createElement('div');
      el.className = `globe-label ${c.cls}`;
      el.textContent = c.display;
      el.style.font = c.font;
      el.style.letterSpacing = `${c.spacing}em`;
      container.appendChild(el);
      rec = { el, on: false, fadeUntil: 0, cand: c, x, y, pos: it.pos, dyn: null };
      records.set(c.id, rec);
      setPos(rec, x, y);
    }
    rec.cand = c;
    rec.pos = it.pos;
    rec.dyn = it.dyn || null;
    setPos(rec, x, y);
    if (!rec.on) {
      rec.on = true;
      setPos(rec, x, y);
      // Next frame so the fade-in transition runs from the right place.
      requestAnimationFrame(() => rec.on && rec.el.classList.add('is-on'));
    }
    rec.el.classList.toggle('is-selected', Boolean(sel && c.entityId === sel));
  }
  for (const [id, rec] of records) {
    if (chosen.has(id)) continue;
    if (rec.on) {
      rec.on = false;
      rec.fadeUntil = now + 300;
      rec.el.classList.remove('is-on');
    } else if (now > rec.fadeUntil + 4000) {
      rec.el.remove();
      records.delete(id);
    }
  }
  const ms = performance.now() - t0;
  stats.candidates = list.length;
  stats.shown = chosen.size;
  stats.lastTickMs = +ms.toFixed(2);
  stats.maxTickMs = Math.max(stats.maxTickMs, +ms.toFixed(2));
  stats.ticks++;
}

const GRID_MAX_ALT = 0.85;
const DEG = Math.PI / 180;

/** Screen point → lat/lng on the globe (analytic ray–sphere; null off the globe). */
function screenToLatLng(x, y, camera) {
  tmp.set((x / hostW) * 2 - 1, -(y / hostH) * 2 + 1, 0.5).unproject(camera);
  const o = camera.position;
  let dx = tmp.x - o.x;
  let dy = tmp.y - o.y;
  let dz = tmp.z - o.z;
  const l = Math.hypot(dx, dy, dz);
  dx /= l;
  dy /= l;
  dz /= l;
  const b = o.x * dx + o.y * dy + o.z * dz;
  const cc = o.x * o.x + o.y * o.y + o.z * o.z - R * R;
  const disc = b * b - cc;
  if (disc < 0) return null;
  const t = -b - Math.sqrt(disc);
  const px = o.x + t * dx;
  const py = o.y + t * dy;
  const pz = o.z + t * dz;
  // Inverse of three-globe's polar2Cartesian (phi from +y, theta = 90° − lng).
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, py / R))) / DEG;
  let lng = 90 - Math.atan2(pz, px) / DEG;
  lng = ((((lng + 180) % 360) + 360) % 360) - 180;
  return { lat, lng };
}

const bboxCache = new WeakMap();
function bboxOf(c) {
  if (c.bbox !== undefined) return c.bbox;
  if (c.geom && bboxCache.has(c.geom)) return (c.bbox = bboxCache.get(c.geom));
  const polys = c.geom?.type === 'Polygon' ? [c.geom.coordinates] : c.geom?.type === 'MultiPolygon' ? c.geom.coordinates : [];
  c.bbox = polys.map((rings) => {
    let a = Infinity;
    let b = Infinity;
    let d = -Infinity;
    let e = -Infinity;
    for (const [x, y] of rings[0] || []) {
      if (x < a) a = x;
      if (y < b) b = y;
      if (x > d) d = x;
      if (y > e) e = y;
    }
    return [a, b, d, e, rings];
  });
  if (c.geom) bboxCache.set(c.geom, c.bbox);
  return c.bbox;
}

function inRings(lng, lat, rings) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
      const a = ring[i];
      const b = ring[j];
      if (a[1] > lat !== b[1] > lat && lng < ((b[0] - a[0]) * (lat - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
  }
  return inside;
}

function candContains(c, lng, lat) {
  for (const [a, b, d, e, rings] of bboxOf(c)) {
    if (lng < a || lng > d || lat < b || lat > e) continue;
    if (inRings(lng, lat, rings)) return true;
  }
  return false;
}

/** Sample the visible globe on a coarse screen grid and record which state each sample is in. */
function viewportGrid(camera) {
  const cols = mobile ? 6 : 10;
  const rows = mobile ? 11 : 7;
  const cw = hostW / cols;
  const ch = hostH / rows;
  const hits = new Map();
  const nations = featureCands.filter((c) => c.geom && c.kind !== 'people');
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const x = (gx + 0.5) * cw;
      const y = (gy + 0.5) * ch;
      const ll = screenToLatLng(x, y, camera);
      if (!ll) continue;
      for (const c of nations) {
        if (!candContains(c, ll.lng, ll.lat)) continue;
        let arr = hits.get(c);
        if (!arr) hits.set(c, (arr = []));
        arr.push({ x, y, lat: ll.lat, lng: ll.lng });
        break;
      }
    }
  }
  return {
    hits,
    cellArea: cw * ch,
    containsNear(c, x, y) {
      const ll = screenToLatLng(x, y, camera);
      return Boolean(ll && candContains(c, ll.lng, ll.lat));
    },
  };
}

let obstacleCache = { at: 0, boxes: [] };
const OBSTACLE_SELECTOR = '.globe-legend, .globe-credit, .globe-fullscreen-toggle, .globe-scrubber, body.globe-fullscreen .event-detail';
function overlayObstacles(now) {
  if (now - obstacleCache.at > 500) {
    const hr = host.getBoundingClientRect();
    const out = [];
    for (const el of document.querySelectorAll(OBSTACLE_SELECTOR)) {
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const b = [r.left - hr.left - 2, r.top - hr.top - 2, r.right - hr.left + 2, r.bottom - hr.top + 2];
      if (b[2] < 0 || b[0] > hr.width || b[3] < 0 || b[1] > hr.height) continue;
      out.push(b);
    }
    obstacleCache = { at: now, boxes: out };
  }
  return obstacleCache.boxes.slice();
}

function setPos(rec, x, y) {
  const rx = Math.round(x * 2) / 2;
  const ry = Math.round(y * 2) / 2;
  if (rec.x === rx && rec.y === ry && rec.el.style.transform) return;
  rec.x = rx;
  rec.y = ry;
  rec.el.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
}

/** Per-frame hook (from the scene's onBeforeRender). */
export function updateGlobeLabels(camera, camAlt) {
  if (!container || !enabled || !camera) return;
  const now = performance.now();
  const t0 = now;
  const { x: cx, y: cy, z: cz } = camera.position;
  const camKey = `${cx.toFixed(2)},${cy.toFixed(2)},${cz.toFixed(2)},${host.clientWidth}x${host.clientHeight}`;
  const moved = camKey !== lastCamKey;
  lastCamKey = camKey;
  const tick = PLACE_TICK_MS[mobile ? 'mobile' : 'desktop'];
  if (dirty || (moved && now - lastTick > tick)) {
    dirty = false;
    lastTick = now;
    place(camera, camAlt, now);
    return;
  }
  if (!moved) return;
  const dist = Math.hypot(cx, cy, cz);
  for (const rec of records.values()) {
    if (!rec.on && now > rec.fadeUntil) continue;
    const p = rec.pos || rec.cand.pos;
    if (!p) continue;
    if (rec.on && facing(p, cx, cy, cz, dist) < LIMB_MIN * 0.5) {
      // Rotated round the limb between placements: hide straight away.
      rec.on = false;
      rec.fadeUntil = now + 300;
      rec.el.classList.remove('is-on');
      continue;
    }
    const [x, y] = project(p, camera);
    setPos(rec, x, y);
  }
  stats.frameMs = +(performance.now() - t0).toFixed(3);
}
