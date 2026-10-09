/**
 * Interactive Globe.gl earth (Phase 4) + historical polygons + Day 20 living-border morph.
 * Day 26: stable per-entity polygonAltitude offsets to stop overlap z-fighting.
 * Day 30: polygon click → detail panel; selected-entity highlight.
 * Day 35: peoples hatched + dashed edge vs solid polities; presence soft wash (no edge).
 * Day 34: real flicker fix — no depth-writing side walls / caps, stable layer-aware render order.
 * Day 38: modern nations layer (1914–2025) — real Natural Earth borders regrouped by year; from 1914
 *   nations sit above dimmed peoples / presence (taps pick the country); crisp edges; schematic
 *   empires hand off at 1914.
 * Day 39: zoom much closer (≈380 km up, was ≈1,300 km) without floating shapes — overlay altitudes
 *   shrink toward the surface as the camera comes in (band order kept), caps get finer curvature
 *   close up so they never dip under the globe, and borders get crisper / fills lighter when close.
 *   `?at=lat,lng,alt` opens the camera at a given point of view.
 * Day 40: map-key layer toggles (Polities / Nations, Peoples, Presence; `?hide=`) — with Nations off,
 *   peoples / presence come back undimmed so they can be tapped after 1914.
 * Day 41: the nations layer starts in 1815 (Congress of Vienna), so every schematic empire hands
 *   off at 1815 instead of 1914; vassal / autonomous states draw like colonies (paler, softer edge).
 * Day 40 (review B): close-zoom fidelity — NASA GIBS Blue Marble tiles (z ≤ 8, ~600 m/px, no
 *   labels) sharpen the ground as you zoom (the 4k texture stays underneath as the far view and
 *   the fallback), and nation borders near the centre of the view swap to a finer Natural Earth
 *   set (2 km² simplification vs 40 km²) when close.
 * Day 44: showing uncertainty (Phase 4c item 4) — every shape carries a confidence level
 *   (globe-confidence.js). Documented: crisp solid edge. Approximate: softer edge and a fill that
 *   fades towards it. Conjectural: dotted edge and a fill that fades out well inside it. The fade
 *   is a per-vertex distance-to-edge attribute on the refined cap mesh (hand-drawn shapes only;
 *   nations keep crisp fills so neighbours never show gaps). `&certainty=0` / the key turns it off.
 * Mounted only while Globe mode is active; disposed on leave.
 */

import {
  getGlobePolygonFeatures,
  loadNationsTopology,
  loadNationsFineTopology,
  isNationsFineLoaded,
  isNationsLoaded,
  nationShapesNear,
  NATIONS_HANDOFF_YEAR,
  NATIONS_START,
  NATIONS_END,
} from './globe-nations.js';
import {
  initGlobeLabels,
  destroyGlobeLabels,
  setGlobeLabelFeatures,
  updateGlobeLabels,
  invalidateGlobeLabels,
  setGlobeLabelsEnabled as setLabelsEnabled,
  areGlobeLabelsEnabled,
  getGlobeLabelsDebug,
  setGlobeCitiesEnabled,
  areGlobeCitiesEnabled,
  setGlobeEventsEnabled,
  areGlobeEventsEnabled,
  setGlobePinHandlers,
} from './globe-labels.js';

/** Day 43: dated cities (`&cities=0`) and event pins (`&events=0`) — see globe-labels.js. */
export { setGlobeCitiesEnabled, areGlobeCitiesEnabled, setGlobeEventsEnabled, areGlobeEventsEnabled, setGlobePinHandlers };

/** Day 42: country / place labels on or off (legend "Labels" toggle, `&labels=0`). */
export function setGlobeLabelsEnabled(on) {
  setLabelsEnabled(on);
}
export { areGlobeLabelsEnabled };

const EARTH_DAY =
  'https://unpkg.com/three-globe@2.45.0/example/img/earth-blue-marble.jpg';
// No bump map while overlays are shown — bump shading exaggerates z-fighting vs polygon meshes.

/**
 * Day 40: NASA GIBS (Global Imagery Browse Services) Blue Marble shaded relief — label-free,
 * no key, free and open (credit NASA Earth Observatory / NASA GIBS, ESDIS). Web Mercator tiles
 * up to z8 (~600 m/px at the equator, vs ~10 km/px for the 4096×2048 texture). Globe.gl's tile
 * engine picks z8 at the closest zoom (camera altitude < 0.0625 radii).
 *
 * The 4k texture stays as the far view (tiles at z2–z4 are no sharper) and as the fallback:
 * tiles are only switched on once a test tile loads, they're only drawn when the camera is
 * close (TILE_SHOW_ALT), and the textured globe stays underneath (a touch smaller) so a tile
 * that fails or is still loading shows the old texture instead of a hole.
 */
const GIBS_LAYER = 'BlueMarble_ShadedRelief';
const GIBS_MAX_LEVEL = 8;
function gibsTileUrl(x, y, level) {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${GIBS_LAYER}/default/GoogleMapsCompatible_Level${GIBS_MAX_LEVEL}/${level}/${y}/${x}.jpeg`;
}

/**
 * The tile engine's planner intermittently asks for a huge set of tiles nowhere near the view
 * (seen with portrait phone viewports: ~200 z7 tiles from the other side of the world instead of
 * ~8, same camera, roughly one load in two). So the URL callback is also a guard: a tile whose
 * centre is well outside the visible cap gets an empty data: URL (no network request), and the
 * next frame clears the engine's tile cache and re-plans. Loaded tiles come back from the HTTP
 * cache (GIBS sends max-age 3 days for this layer).
 */
let tileRejects = 0;
let tileReplans = 0;
let tileReplanAt = 0;
const EMPTY_TILE = 'data:,';

function tileCentre(x, y, level) {
  const n = 2 ** level;
  const lng = ((x + 0.5) / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / n))) * 180) / Math.PI;
  return [lat, lng];
}

function guardedTileUrl(x, y, level) {
  try {
    const cam = globe?.camera?.();
    if (cam && level >= 3) {
      const camAlt = cam.position.length() / 100 - 1;
      const pov = globe.pointOfView();
      const [lat, lng] = tileCentre(x, y, level);
      const tileDeg = 360 / 2 ** level;
      const allowed = visibleRadiusDeg(camAlt) * 1.5 + tileDeg * 1.5;
      if (angularDistDeg(pov.lat, pov.lng, lat, lng) > allowed) {
        tileRejects++;
        return EMPTY_TILE;
      }
    }
  } catch (_) {
    // fall through to the real URL
  }
  return gibsTileUrl(x, y, level);
}

function angularDistDeg(lat1, lng1, lat2, lng2) {
  const r = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(a)))) / r;
}

/** After a bad plan: clear the engine's tile state and plan again (rate-limited). */
function maybeReplanTiles() {
  if (!tileRejects || !globe || !tileEngineObj) return;
  const now = performance.now();
  if (now - tileReplanAt < 400) return;
  tileReplanAt = now;
  tileRejects = 0;
  tileReplans++;
  try {
    globe.globeTileEngineClearCache();
    tileEngineObj.updatePov(globe.camera());
  } catch (_) {
    // ignore
  }
}

const TILE_ENABLE_ALT = 1.0; // first time the camera comes this close, probe + switch tiles on
const TILE_SHOW_ALT = 0.75; // draw tiles below this (z ≥ 4: as sharp as the texture or better)
const TILE_HIDE_ALT = 0.85;
const BASE_UNDER_TILES_SCALE = 0.998; // textured globe ~13 km under the tiles while they show
/** 'off' | 'probing' | 'on' | 'failed' */
let tileState = 'off';
let tilesShown = false;
let baseGlobeObj = null;
let tileEngineObj = null;

function tilesDisabledByUrl() {
  try {
    return new URLSearchParams(window.location.search).get('tiles') === '0';
  } catch (_) {
    return false;
  }
}

function maybeEnableTiles(camAlt) {
  if (tileState !== 'off' || camAlt > TILE_ENABLE_ALT || !globe || tilesDisabledByUrl()) return;
  tileState = 'probing';
  const img = new Image();
  img.crossOrigin = 'anonymous';
  const timer = setTimeout(() => {
    img.onload = img.onerror = null;
    tileState = 'failed';
    syncTileCredit();
  }, 8000);
  img.onload = () => {
    clearTimeout(timer);
    if (!globe || tileState !== 'probing') return;
    try {
      const scene = globe.scene();
      findGlobeObjects(scene);
      const cam = globe.camera();
      cam.updateMatrixWorld();
      if (tileEngineObj?.updatePov) tileEngineObj.updatePov(cam);
      globe.globeTileEngineMaxLevel(GIBS_MAX_LEVEL).globeTileEngineUrl(guardedTileUrl);
      tileState = 'on';
    } catch (err) {
      console.warn('Imagery tiles unavailable:', err);
      tileState = 'failed';
    }
    syncTileCredit();
  };
  img.onerror = () => {
    clearTimeout(timer);
    tileState = 'failed';
    syncTileCredit();
  };
  img.src = gibsTileUrl(0, 0, 0);
}

function findGlobeObjects(scene) {
  if (baseGlobeObj && tileEngineObj) return;
  scene.traverse((obj) => {
    if (obj.__globeObjType === 'globe' && obj.children?.length >= 2) {
      // three-globe: [0] the textured sphere, [1] the slippy-map tile engine
      baseGlobeObj = obj.children[0];
      tileEngineObj = obj.children[1];
    }
  });
}

/** Each frame: tiles only when close; keep the textured globe visible underneath as a fallback. */
function syncTileVisibility(scene, camAlt) {
  if (tileState !== 'on') return;
  findGlobeObjects(scene);
  if (!baseGlobeObj || !tileEngineObj) return;
  if (!tilesShown && camAlt < TILE_SHOW_ALT) tilesShown = true;
  else if (tilesShown && camAlt > TILE_HIDE_ALT) tilesShown = false;
  // three-globe hides the textured sphere whenever a tile URL is set; we keep it as the backdrop.
  if (!baseGlobeObj.visible) baseGlobeObj.visible = true;
  // The engine's own black backstop sphere (32k triangles) is redundant under our textured globe.
  const backstop = tileEngineObj.children[0];
  if (backstop && backstop.isMesh && backstop.visible) backstop.visible = false;
  if (tileEngineObj.visible !== tilesShown) tileEngineObj.visible = tilesShown;
  const s = tilesShown ? BASE_UNDER_TILES_SCALE : 1;
  if (baseGlobeObj.scale.x !== s) baseGlobeObj.scale.setScalar(s);
  maybeReplanTiles();
  // The tile engine only re-plans on camera events, and its first plan after the URL is set
  // can use a stale view (deep links opened close up got a tile strip off to one side).
  // Re-plan a couple of times a second while tiles show; already-loaded tiles are kept.
  const now = performance.now();
  if (tilesShown && now - tilePovNudgeAt > 500 && typeof tileEngineObj.updatePov === 'function') {
    tilePovNudgeAt = now;
    try {
      tileEngineObj.updatePov(globe.camera());
    } catch (_) {
      // ignore
    }
  }
}
let tilePovNudgeAt = 0;

function syncTileCredit() {
  for (const el of document.querySelectorAll('.globe-credit')) {
    el.classList.toggle('has-tiles', tileState === 'on');
  }
}

/**
 * Day 40 (Phase 4b Day 42): finer nation borders close up, only near the view centre.
 * Below FINE_BORDERS_ENTER the fine TopoJSON is used for shapes with a part within the visible
 * radius (+ margin); shapes already fine stay fine until they're well outside it (hysteresis),
 * and the set is re-evaluated at most every FINE_CHECK_MS so dragging doesn't thrash meshes.
 */
const FINE_PREFETCH_ALT = 0.8;
const FINE_BORDERS_ENTER = 0.35;
const FINE_BORDERS_EXIT = 0.45;
const FINE_CHECK_MS = 350;
let fineShapes = null; // Set<number> | null
let fineLastCheck = 0;
let fineUpdatePending = false;

function visibleRadiusDeg(camAlt) {
  const cam = globe?.camera?.();
  const fov = Number(cam?.fov) || 50;
  const aspect = Math.max(1, Number(cam?.aspect) || 1);
  // Flat-earth estimate of the half-diagonal on the ground, capped at the horizon.
  const flat = camAlt * Math.tan(((fov / 2) * Math.PI) / 180) * Math.hypot(1, aspect) * (180 / Math.PI);
  const horizon = (Math.acos(1 / (1 + camAlt)) * 180) / Math.PI;
  return Math.min(horizon, flat) + 2;
}

function maybeUpdateFineBorders(camAlt) {
  const y = currentPolygonYear;
  const nationsEra = Number.isFinite(y) && y >= NATIONS_START && y <= NATIONS_END;
  if (!nationsEra || !isNationsLoaded() || hiddenLayers.has('polities')) {
    if (fineShapes) scheduleFineRefresh(null);
    return;
  }
  if (camAlt < FINE_PREFETCH_ALT && !isNationsFineLoaded()) {
    loadNationsFineTopology()
      .then(() => {
        fineLastCheck = 0;
      })
      .catch(() => {});
  }
  const now = performance.now();
  if (now - fineLastCheck < FINE_CHECK_MS || fineUpdatePending) return;
  fineLastCheck = now;
  const close = fineShapes ? camAlt < FINE_BORDERS_EXIT : camAlt < FINE_BORDERS_ENTER;
  if (!close || !isNationsFineLoaded()) {
    if (fineShapes) scheduleFineRefresh(null);
    return;
  }
  let pov;
  try {
    pov = globe.pointOfView();
  } catch (_) {
    return;
  }
  const r = visibleRadiusDeg(camAlt);
  const want = nationShapesNear(y, pov.lat, pov.lng, r);
  if (fineShapes) {
    // Keep shapes that are still roughly in view, so small pans don't swap meshes back and forth.
    const keep = nationShapesNear(y, pov.lat, pov.lng, r * 1.6);
    for (const sh of fineShapes) if (keep.has(sh)) want.add(sh);
  }
  const same = fineShapes && want.size === fineShapes.size && [...want].every((sh) => fineShapes.has(sh));
  if (!same) scheduleFineRefresh(want);
}

function scheduleFineRefresh(next) {
  fineUpdatePending = true;
  // Outside the render callback: rebuilding polygonsData mid-render would be re-entrant.
  setTimeout(() => {
    fineUpdatePending = false;
    fineShapes = next && next.size ? next : null;
    if (globe && mounted && Number.isFinite(currentPolygonYear)) setGlobeOverlayYear(currentPolygonYear);
  }, 0);
}

/** Day 45: current camera as the `at=lat,lng,alt` deep-link value (null before the globe exists). */
export function getGlobeCameraAt() {
  try {
    const pov = globe?.pointOfView?.();
    if (!pov || !Number.isFinite(pov.lat)) return null;
    return `${pov.lat.toFixed(2)},${pov.lng.toFixed(2)},${pov.altitude.toFixed(2)}`;
  } catch {
    return null;
  }
}

export function getGlobeDetailState() {
  return {
    tiles: tileState,
    tilesShown,
    tileReplans,
    fineLoaded: isNationsFineLoaded(),
    fineShapes: fineShapes ? fineShapes.size : 0,
  };
}

let globe = null;
let hostEl = null;
let resizeObserver = null;
let onControlsStart = null;
let mounted = false;
let currentPolygonYear = null;
/** @type {string|null} */
let selectedEntityId = null;
/** @type {((entityId: string, feature: object) => void)|null} */
let polygonClickHandler = null;

function isCoarsePointer() {
  try {
    return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  } catch (_) {
    return false;
  }
}

function sizeToHost() {
  if (!globe || !hostEl) return;
  const w = Math.max(1, Math.floor(hostEl.clientWidth));
  const h = Math.max(1, Math.floor(hostEl.clientHeight));
  if (w < 2 || h < 2) return;
  try {
    globe.width(w).height(h);
  } catch (_) {
    // ignore mid-dispose
  }
}

/** Re-measure after CSS grid/flex settles (esp. phone layout / orientation). */
function scheduleSizeToHost() {
  sizeToHost();
  requestAnimationFrame(() => {
    sizeToHost();
    setTimeout(sizeToHost, 120);
  });
}

function parseHex(hex) {
  const h = String(hex || '#888888').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return 0x888888;
  return n;
}

function hexToRgba(hex, opacity) {
  const n = parseHex(hex);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const op = Math.max(0.05, Math.min(0.72, Number(opacity) || 0.43));
  return `rgba(${r},${g},${b},${op})`;
}

/** FNV-1a 32-bit — stable across sessions for altitude slots. */
function hashId(str) {
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Day 34: overlap flicker — root cause + fix.
 *
 * Day 26 gave each polygon its own altitude (0.0045 + slot × 0.00011 globe radii), but on a
 * radius-100 globe that is a 0.011-unit step, while the depth buffer (Globe.gl camera
 * near = 0.05) only resolves ~0.05 units at the default view and ~0.2–0.3 units zoomed out —
 * so neighbouring slots still z-fought. Worse, Globe.gl's default cap material is translucent
 * yet writes depth, and `polygonSideColor('rgba(0,0,0,0)')` is truthy, so every polygon also
 * built invisible side walls that wrote depth. Three.js re-sorts translucent meshes by
 * bounding-sphere distance every frame, so as the globe turned the draw order flipped and the
 * winner of each overlap changed — the shimmer Arthur saw over Mughal India and the
 * hole-cut Mediterranean / Aegean shapes.
 *
 * Fix: no side walls; caps use a shared translucent material with depthWrite off (overlays
 * only depth-test against the opaque globe, never each other); each polygon group gets a
 * stable renderOrder (layer band, then a hash slot) so blending order never flips with the
 * camera; altitude bands are layer-aware and comfortably above depth resolution.
 */
// Day 38: from the handoff (1815 since Day 41) nations take the peoples' band and the (dimmed)
// peoples drop just below them, so tapping a country picks the nation; before it nothing changes.
const LAYER_BAND = { presence: 0, peopleUnder: 1, nation: 2, people: 2, polity: 3 };
const LAYER_ALT = { presence: 0.005, peopleUnder: 0.0062, nation: 0.0075, people: 0.0075, polity: 0.01 };
const POLYGON_ALT_STEP = 0.00004; // tie-break for picking only; depth no longer depends on it
const POLYGON_ALT_SLOTS = 24;
const SELECTED_ALT_BUMP = 0.004;
const SELECTED_BAND = 4;

/**
 * Day 39: zoom LOD — overlays come down to the surface as the camera comes in.
 *
 * The camera can now get to altitude 0.06 globe radii (~380 km). At that height the Day 34 bands
 * (32–64 km up) visibly float: shapes slide against the coastlines as you turn. So each frame the
 * polygon meshes are re-scaled (Globe.gl applies altitude as a radial scale, so this is cheap and
 * needs no geometry rebuild) from their band altitude toward a low floor:
 *
 *   effective = mix(floor + (band - ALT_REF) × BAND_SQUEEZE, band, zoomF)
 *
 * zoomF is 1 from camera altitude ZOOM_FAR_ALT up (unchanged look), 0 at ZOOM_NEAR_ALT and below.
 * The mapping is monotonic in the band altitude, so stacking / tap-picking order never changes,
 * and depth still doesn't depend on band spacing (caps don't write depth; renderOrder is fixed).
 *
 * The floor is set by cap tessellation, not by depth precision: a cap's flat triangles sit below
 * the sphere they approximate (a chord of length L sags ≈ L² / 8R), and anything that dips under
 * the globe's surface gets hidden by it. Globe.gl's triangulator left sliver triangles up to
 * ~2,000 km long (≈60 km sag, measured) on the hand-drawn shapes and big countries. So every cap
 * is refined after Globe.gl builds it — triangles are split along their longest edge, new points
 * pushed back onto the sphere — to ≤ REFINE_EDGE[lod]: far out ~760 km edges (≤ 11.5 km sag, under
 * the 16.5 km floor), close up (camera altitude < LOD_FINE_ENTER) ~380 km (≤ 2.9 km sag, under
 * the 5 km floor). Hysteresis (LOD_FINE_EXIT) stops swap ping-pong; both meshes are kept.
 */
const MIN_CAMERA_DISTANCE = 106; // globe radius 100 → ~380 km above the surface (was 120 / 140)
const ZOOM_FAR_ALT = 1.2;
const ZOOM_NEAR_ALT = 0.08;
const ALT_REF = 0.004; // just under the lowest Day 34 band (presence 0.005)
const BAND_SQUEEZE = 0.06; // keeps the bands stacked ~0.3–4 km apart when fully squeezed
const REFINE_EDGE = { coarse: 12, fine: 6 }; // globe units (radius 100): max sag 0.18 / 0.045
const ALT_FLOOR = { coarse: 0.0026, fine: 0.0008 }; // radii: above that max sag (0.0018 / 0.00045)
const REFINE_BUDGET_MS = 24; // per frame, so a zoom-in never stalls
const LOD_FINE_ENTER = 0.45;
const LOD_FINE_EXIT = 0.6;
let capLod = 'coarse';
let zoomF = 1;
let zoomStyleKey = '';

function smoothstep01(x) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

/** Camera altitude in globe radii → 0 (closest) … 1 (default look). */
function zoomFactorForAltitude(alt) {
  return smoothstep01((alt - ZOOM_NEAR_ALT) / (ZOOM_FAR_ALT - ZOOM_NEAR_ALT));
}

/** Effective (rendered) altitude for a polygon whose band altitude is `bandAlt`. */
export function zoomedAltitude(bandAlt, f = zoomF, lod = capLod) {
  const squeezed = ALT_FLOOR[lod] + (bandAlt - ALT_REF) * BAND_SQUEEZE;
  return squeezed + (bandAlt - squeezed) * f;
}

/**
 * Day 39: hand-drawn peoples / presence / polity rings have edges up to ~2,000 km long, and the
 * cap triangulator does not subdivide boundary edges, so their edge triangles sagged up to
 * ~60 km below the cap (measured) — already poking under the globe here and there at the old
 * bands, and badly once overlays come down close to the surface. Densify every ring to
 * ≤ RING_STEP_DEG per segment (cached per geometry object, so Globe.gl's meshes are reused).
 */
const RING_STEP_DEG = 1;
const densifiedGeometry = new WeakMap();
const densifiedFeature = new WeakMap();

function densifyRing(ring) {
  if (!Array.isArray(ring) || ring.length < 2) return ring;
  let needs = false;
  for (let i = 1; i < ring.length && !needs; i++) {
    const dl = Math.abs(ring[i][0] - ring[i - 1][0]);
    needs = dl <= 180 && Math.max(dl, Math.abs(ring[i][1] - ring[i - 1][1])) > RING_STEP_DEG;
  }
  if (!needs) return ring;
  const out = [ring[0]];
  for (let i = 1; i < ring.length; i++) {
    const [x0, y0] = ring[i - 1];
    const [x1, y1] = ring[i];
    const dl = Math.abs(x1 - x0);
    const n = dl > 180 ? 1 : Math.ceil(Math.max(dl, Math.abs(y1 - y0)) / RING_STEP_DEG);
    for (let k = 1; k < n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
    out.push(ring[i]);
  }
  return out;
}

function densifyGeometry(g) {
  if (!g || typeof g !== 'object') return g;
  let d = densifiedGeometry.get(g);
  if (d) return d;
  if (g.type === 'Polygon') d = { ...g, coordinates: g.coordinates.map(densifyRing) };
  else if (g.type === 'MultiPolygon') d = { ...g, coordinates: g.coordinates.map((poly) => poly.map(densifyRing)) };
  else d = g;
  densifiedGeometry.set(g, d);
  return d;
}

/** Same feature with a densified geometry (stable object per input, so meshes are reused). */
function densifyFeature(f) {
  if (!f || typeof f !== 'object') return f;
  // Nations come from Natural Earth (already dense) — skip the copy.
  if ((f.entityType || f.properties?.entityType) === 'nation') return f;
  let d = densifiedFeature.get(f);
  if (!d || d.__etSrcGeometry !== f.geometry) {
    d = { ...f, geometry: densifyGeometry(f.geometry), __etSrcGeometry: f.geometry };
    densifiedFeature.set(f, d);
  }
  return d;
}

/**
 * Day 40: map-key layer toggles (Arthur: "toggle on/off Polities/Peoples/Presence in
 * full-screen mode"). 'polities' covers the hand-drawn empires and, from 1815, the nations.
 */
export const GLOBE_LAYER_KEYS = ['polities', 'peoples', 'presence'];
let hiddenLayers = new Set();

function layerKeyForFeature(d) {
  const layer = featureLayer(d);
  if (layer === 'people') return 'peoples';
  if (layer === 'presence') return 'presence';
  return 'polities';
}

function polygonsForYear(year) {
  const all = getGlobePolygonFeatures(year, { hidePolities: hiddenLayers.has('polities'), fineShapes });
  const shown = hiddenLayers.size ? all.filter((f) => !hiddenLayers.has(layerKeyForFeature(f))) : all;
  return shown.map(densifyFeature);
}

/**
 * Hide / show whole layers without remounting (keys from GLOBE_LAYER_KEYS).
 * @param {Iterable<string>} keys layers to hide
 */
export function setGlobeHiddenLayers(keys) {
  const next = new Set([...(keys || [])].filter((k) => GLOBE_LAYER_KEYS.includes(k)));
  const same = next.size === hiddenLayers.size && [...next].every((k) => hiddenLayers.has(k));
  if (same) return;
  hiddenLayers = next;
  if (globe && mounted && Number.isFinite(currentPolygonYear)) setGlobeOverlayYear(currentPolygonYear);
}

export function getGlobeHiddenLayers() {
  return new Set(hiddenLayers);
}

function featureLayer(d) {
  const t = d?.entityType || d?.properties?.entityType;
  if (t === 'presence') return 'presence';
  if (t === 'people') return 'people';
  if (t === 'nation') return 'nation';
  return 'polity';
}

/** Altitude / draw band: peoples dimmed for the nations era sit under the nations. */
function featureBand(d) {
  const layer = featureLayer(d);
  return layer === 'people' && d?.nationsEraDim ? 'peopleUnder' : layer;
}

function featureKey(d) {
  const entityId = d?.entityId || d?.properties?.entityId || '';
  const regionId = d?.regionId || d?.properties?.regionId || '';
  return entityId ? `${entityId}::${regionId}` : regionId || d?.name || 'anon';
}

function featureSlot(d) {
  return hashId(featureKey(d)) % POLYGON_ALT_SLOTS;
}

function polygonAltitudeForFeature(d) {
  return LAYER_ALT[featureBand(d)] + featureSlot(d) * POLYGON_ALT_STEP;
}

/** Stable draw order: presence < (nations era: peoples < nations) < peoples < polities; selected on top. */
function polygonRenderOrder(d) {
  const band = isSelectedFeature(d) ? SELECTED_BAND : LAYER_BAND[featureBand(d)];
  return 10 + band * 100 + featureSlot(d);
}

/**
 * Day 35: peoples vs polities read differently when shown together.
 * Polities: solid translucent fill + thin solid edge. Peoples: diagonal hatch fill (geographic,
 * anti-aliased, fades to a flat tint when stripes would go sub-pixel) + dashed edge.
 * Presence: soft wash, no edge.
 */
const HATCH_PERIOD_DEG = 1.1;
// Day 39: one shared uniform, so the stripes keep roughly the same on-screen spacing as you zoom
// (a fixed 1.1° period turned into wide bands close up).
const hatchPeriodUniform = { value: HATCH_PERIOD_DEG };

/**
 * Day 44: certainty styling. Feather widths are in globe units (radius 100) at the default view
 * and shrink with the camera like the hatch, so the fade stays a similar width on screen.
 */
const FEATHER_W = 3.2; // ≈ 1.8° of fade at the default view (approximate); conjectural × 1.8
const FEATHER_STYLE = {
  approximate: { mul: 1, min: 0.3 },
  conjectural: { mul: 1.8, min: 0.12 },
  // Presence is already a faint wash with no edge: fade it less, or small footprints vanish.
  'presence-approximate': { mul: 1, min: 0.55 },
  'presence-conjectural': { mul: 1.4, min: 0.4 },
};
const featherWidthUniform = { value: FEATHER_W };
// Max refined triangle edge for feathered caps, so the distance field interpolates smoothly.
const FEATHER_EDGE = { coarse: 4, fine: 2 };
// Distances past this (unit sphere) are clamped: the widest fade is 1.8 × 3.2 ≈ 5.8 globe units.
const FEATHER_MAX_D = 0.08;
const FEATHER_CELL = 0.11; // > FEATHER_MAX_D + the longest densified ring segment (~0.025)
const FEATHER_SHAPE_FRAC = 0.6; // fade width ≤ 60% of the shape's deepest point from its edge
let certaintyEnabled = true;
let dashScale = 1;

/** Day 44: certainty styling on or off (legend "Certainty" toggle, `&certainty=0`). */
export function setGlobeCertaintyEnabled(on) {
  const next = Boolean(on);
  if (next === certaintyEnabled) return;
  certaintyEnabled = next;
  if (globe && mounted) {
    applyPolygonLayer();
    if (Number.isFinite(currentPolygonYear)) {
      try {
        globe.polygonsData(polygonsForYear(currentPolygonYear));
      } catch (err) {
        console.warn('Failed to refresh certainty styling:', err);
      }
    }
  }
}
export function isGlobeCertaintyEnabled() {
  return certaintyEnabled;
}

function featureConfidence(d) {
  if (!certaintyEnabled) return 'documented';
  return d?.confidence || d?.properties?.confidence || 'documented';
}

/** Fill fade only for hand-drawn shapes (nations tile the land; a fade would open gaps). */
function featherModeFor(d) {
  const layer = featureLayer(d);
  if (layer === 'nation') return null;
  const c = featureConfidence(d);
  if (c !== 'approximate' && c !== 'conjectural') return null;
  return layer === 'presence' ? `presence-${c}` : c;
}

/** Edge style: solid / dashed (peoples) / dotted (conjectural) / longdash (approximate nations). */
function strokeStyleFor(d) {
  const layer = featureLayer(d);
  const c = featureConfidence(d);
  if (c === 'conjectural') return 'dotted';
  if (layer === 'people') return 'dashed';
  if (layer === 'nation' && c === 'approximate') return 'longdash';
  return 'solid';
}

const DASH = {
  dashed: { dashSize: 2.4, gapSize: 1.6 },
  dotted: { dashSize: 0.55, gapSize: 1.05 },
  longdash: { dashSize: 1.7, gapSize: 0.9 },
};

function syncHatchPeriod(camAlt) {
  const k = Math.max(0.08, Math.min(1, camAlt / 1.1));
  hatchPeriodUniform.value = HATCH_PERIOD_DEG * k;
  featherWidthUniform.value = FEATHER_W * Math.max(0.12, k);
  // Dashes and dots keep roughly the same on-screen size as you zoom (they were fixed globe units).
  dashScale = 1 / Math.max(0.12, k);
}

/**
 * Cap shader: optional peoples hatch (Day 35) and optional certainty fade (Day 44). The fade reads
 * a per-vertex `etEdgeD` (distance to the shape's edge + 1, in globe units); 0 means "not built
 * yet", which draws without a fade rather than flashing transparent.
 */
function addCapShader(mat, { hatch = false, feather = null } = {}) {
  const fs = feather ? FEATHER_STYLE[feather] : null;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.etHatchPeriod = hatchPeriodUniform;
    shader.uniforms.etFeatherW = featherWidthUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vEtPos;' + (fs ? '\nattribute float etEdgeD;\nattribute float etEdgeMax;\nvarying float vEtEdgeD;\nvarying float vEtEdgeMax;' : ''),
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvEtPos = position;' + (fs ? '\nvEtEdgeD = etEdgeD;\nvEtEdgeMax = etEdgeMax;' : ''),
      );
    let frag = '#include <alphamap_fragment>\n';
    if (hatch) {
      frag += `{
          vec3 etP = normalize(vEtPos);
          float etLat = asin(clamp(etP.y, -1.0, 1.0));
          float etLng = atan(etP.x, etP.z);
          float etC = (degrees(etLat) + degrees(etLng) * cos(etLat)) / etHatchPeriod;
          float etW = min(fwidth(etC), 1.0);
          float etF = abs(fract(etC) - 0.5);
          float etLine = 1.0 - smoothstep(0.22 - etW, 0.22 + etW, etF);
          float etFade = clamp(1.6 - etW * 3.0, 0.0, 1.0);
          diffuseColor.a *= mix(0.6, mix(0.22, 1.3, etLine), etFade);
        }\n`;
    }
    if (fs) {
      frag += `if (vEtEdgeD > 0.5) {
          float etD = vEtEdgeD - 1.0;
          // Narrow shapes (the Nile valley) fade over at most ~60% of their half-width, so they never vanish.
          float etWid = max(0.05, min(etFeatherW * ${fs.mul.toFixed(2)}, vEtEdgeMax * ${FEATHER_SHAPE_FRAC.toFixed(2)}));
          float etK = smoothstep(0.0, etWid, etD);
          diffuseColor.a *= mix(${fs.min.toFixed(2)}, 1.0, etK);
        }\n`;
    }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vEtPos;\nuniform float etHatchPeriod;\nuniform float etFeatherW;' +
          (fs ? '\nvarying float vEtEdgeD;\nvarying float vEtEdgeMax;' : ''),
      )
      .replace('#include <alphamap_fragment>', frag);
  };
  mat.customProgramCacheKey = () => `et-cap-v2-${hatch ? 'h' : 'n'}-${feather || 'none'}`;
  return mat;
}

/** Unit vector for [lng, lat] in Globe.gl's axes (same as the hatch shader's inverse). */
function unitVec(lng, lat) {
  const la = (lat * Math.PI) / 180;
  const lo = (lng * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

/** Segment grid over a feature's rings (outer + holes), for distance-to-edge lookups. */
function edgeIndexFor(geometry) {
  if (!geometry) return null;
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  const seg = [];
  for (const poly of polys) {
    for (const ring of poly || []) {
      if (!Array.isArray(ring) || ring.length < 2) continue;
      let prev = unitVec(ring[0][0], ring[0][1]);
      for (let i = 1; i < ring.length; i++) {
        const cur = unitVec(ring[i][0], ring[i][1]);
        seg.push(prev[0], prev[1], prev[2], cur[0], cur[1], cur[2]);
        prev = cur;
      }
    }
  }
  if (!seg.length) return null;
  const cells = new Map();
  const cellKey = (ix, iy, iz) => ((ix + 20) * 41 + (iy + 20)) * 41 + (iz + 20);
  const add = (k, si) => {
    let a = cells.get(k);
    if (!a) cells.set(k, (a = []));
    if (a[a.length - 1] !== si) a.push(si);
  };
  for (let si = 0; si < seg.length; si += 6) {
    const ka = cellKey(Math.floor(seg[si] / FEATHER_CELL), Math.floor(seg[si + 1] / FEATHER_CELL), Math.floor(seg[si + 2] / FEATHER_CELL));
    const kb = cellKey(Math.floor(seg[si + 3] / FEATHER_CELL), Math.floor(seg[si + 4] / FEATHER_CELL), Math.floor(seg[si + 5] / FEATHER_CELL));
    add(ka, si);
    if (kb !== ka) add(kb, si);
  }
  return { seg, cells, cellKey };
}

/** Distance (unit sphere, chord) from p to the nearest edge segment, capped at FEATHER_MAX_D. */
function edgeDistance(idx, px, py, pz) {
  const { seg, cells, cellKey } = idx;
  const ix = Math.floor(px / FEATHER_CELL);
  const iy = Math.floor(py / FEATHER_CELL);
  const iz = Math.floor(pz / FEATHER_CELL);
  let best2 = FEATHER_MAX_D * FEATHER_MAX_D;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        const list = cells.get(cellKey(ix + dx, iy + dy, iz + dz));
        if (!list) continue;
        for (const si of list) {
          const ax = seg[si], ay = seg[si + 1], az = seg[si + 2];
          const ux = seg[si + 3] - ax, uy = seg[si + 4] - ay, uz = seg[si + 5] - az;
          const wx = px - ax, wy = py - ay, wz = pz - az;
          const uu = ux * ux + uy * uy + uz * uz;
          let t = uu > 0 ? (wx * ux + wy * uy + wz * uz) / uu : 0;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const ex = wx - t * ux, ey = wy - t * uy, ez = wz - t * uz;
          const d2 = ex * ex + ey * ey + ez * ez;
          if (d2 < best2) best2 = d2;
        }
      }
    }
  }
  return Math.sqrt(best2);
}

/** Add the `etEdgeD` attribute (distance to edge in globe units, + 1) to a refined cap mesh. */
function addEdgeDistance(g, geometry) {
  const idx = edgeIndexFor(geometry);
  if (!idx) return;
  const pos = g.getAttribute('position');
  const out = new Float32Array(pos.count);
  let maxD = 0;
  // The refined mesh is non-indexed (each vertex repeats ~6×): look each position up once.
  const seen = new Map();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const key = (Math.round(x * 500) * 131072 + Math.round(y * 500)) * 131072 + Math.round(z * 500);
    let dist = seen.get(key);
    if (dist === undefined) {
      const r = Math.hypot(x, y, z) || 1;
      dist = edgeDistance(idx, x / r, y / r, z / r) * 100;
      seen.set(key, dist);
      if (dist > maxD) maxD = dist;
    }
    out[i] = 1 + dist;
  }
  g.setAttribute('etEdgeD', new THREE_NS.Float32BufferAttribute(out, 1));
  g.setAttribute('etEdgeMax', new THREE_NS.Float32BufferAttribute(new Float32Array(pos.count).fill(maxD), 1));
}

/** Shared cap materials keyed by colour + opacity + layer (Globe.gl skips colour updates for custom materials). */
const capMaterialCache = new Map();
let THREE_NS = null;

function capMaterialFor(d, rgba) {
  if (!THREE_NS) return undefined; // fall back to Globe.gl default until three is loaded
  const hatch = featureLayer(d) === 'people';
  const feather = featherModeFor(d);
  const key = `${rgba}|${hatch ? 'hatch' : 'solid'}|${feather || 'crisp'}`;
  let mat = capMaterialCache.get(key);
  if (!mat) {
    const m = /rgba\((\d+),(\d+),(\d+),([\d.]+)\)/.exec(rgba);
    const [r, g, b, a] = m ? [+m[1], +m[2], +m[3], +m[4]] : [136, 136, 136, 0.43];
    mat = new THREE_NS.MeshBasicMaterial({
      color: new THREE_NS.Color(`rgb(${r},${g},${b})`),
      opacity: a,
      transparent: true,
      // Never occlude other overlays — only the opaque globe depth-tests these caps.
      depthWrite: false,
      // Same face handling as Globe.gl's default cap material (no planet-wide wash: rings stay CW).
      side: THREE_NS.DoubleSide,
    });
    mat.userData.etBaseOpacity = a;
    mat.opacity = a * capZoomOpacityMul();
    if (hatch || feather) addCapShader(mat, { hatch, feather });
    capMaterialCache.set(key, mat);
  }
  return mat;
}

/**
 * Globe.gl's stroke geometry is indexed, so three's computeLineDistances() refuses it.
 * Rings are stored as consecutive vertices, so cumulative distance in vertex order is enough.
 */
function addLineDistances(geometry) {
  const pos = geometry.getAttribute('position');
  if (!pos || !THREE_NS) return;
  const dist = new Float32Array(pos.count);
  for (let i = 1; i < pos.count; i++) {
    const dx = pos.getX(i) - pos.getX(i - 1);
    const dy = pos.getY(i) - pos.getY(i - 1);
    const dz = pos.getZ(i) - pos.getZ(i - 1);
    dist[i] = dist[i - 1] + Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  geometry.setAttribute('lineDistance', new THREE_NS.Float32BufferAttribute(dist, 1));
}

/**
 * Dashed outline for peoples, dotted for conjectural shapes, long dashes for approximate nations
 * (Day 44), swapped onto Globe.gl's stroke LineSegments.
 */
function syncStrokeStyle(obj, d, stroke) {
  if (!THREE_NS || !stroke) return;
  const style = strokeStyleFor(d);
  if (style !== 'solid') {
    if (!obj.__etOrigStrokeMat) obj.__etOrigStrokeMat = stroke.material;
    const mats = obj.__etDashMats || (obj.__etDashMats = {});
    let mat = mats[style];
    if (!mat) {
      const src = stroke.material;
      mat = mats[style] = new THREE_NS.LineDashedMaterial({
        color: src.color.clone(),
        opacity: src.opacity,
        transparent: true,
        depthWrite: false,
        ...DASH[style],
      });
    }
    if (stroke.material !== mat) {
      // Globe.gl updates colour/opacity on whichever material is attached.
      mat.color.copy(stroke.material.color);
      mat.opacity = stroke.material.opacity;
      stroke.material = mat;
    }
    if (mat.scale !== dashScale) mat.scale = dashScale;
    if (stroke.geometry && obj.__etDashGeom !== stroke.geometry) {
      addLineDistances(stroke.geometry);
      obj.__etDashGeom = stroke.geometry;
    }
  } else if (obj.__etOrigStrokeMat && stroke.material !== obj.__etOrigStrokeMat) {
    obj.__etOrigStrokeMat.color.copy(stroke.material.color);
    obj.__etOrigStrokeMat.opacity = stroke.material.opacity;
    stroke.material = obj.__etOrigStrokeMat;
  }
}

function disposeCapMaterials() {
  for (const mat of capMaterialCache.values()) {
    try {
      mat.dispose();
    } catch (_) {
      // ignore
    }
  }
  capMaterialCache.clear();
}

/** Each frame (cheap): give polygon groups their stable renderOrder; strokes draw after caps. */
function applyPolygonRenderOrder(scene, camera) {
  if (!scene) return;
  if (camera && camera.position) {
    const camAlt = camera.position.length() / 100 - 1;
    zoomF = zoomFactorForAltitude(camAlt);
    maybeSwitchCapLod(camAlt);
    syncHatchPeriod(camAlt);
    maybeEnableTiles(camAlt);
    syncTileVisibility(scene, camAlt);
    maybeUpdateFineBorders(camAlt);
    updateGlobeLabels(camera, camAlt);
  }
  applyZoomCapOpacity();
  refineSpentMs = 0;
  if (!polygonLayerParent || !polygonLayerParent.parent) {
    polygonLayerParent = null;
    scene.traverse((obj) => {
      if (!polygonLayerParent && obj.__globeObjType === 'polygon' && obj.parent) {
        polygonLayerParent = obj.parent;
      }
    });
    if (!polygonLayerParent) return;
  }
  for (const obj of polygonLayerParent.children) {
    const d = obj.__data?.data;
    if (!d) continue;
    const order = polygonRenderOrder(d);
    if (obj.renderOrder !== order) obj.renderOrder = order;
    const [cap, stroke] = obj.children;
    if (cap && cap.renderOrder !== 0) cap.renderOrder = 0;
    if (stroke && stroke.renderOrder !== 1) stroke.renderOrder = 1;
    syncStrokeStyle(obj, d, stroke);
    syncCapRefinement(cap, d);
    applyZoomToPolygon(obj, cap, stroke);
  }
}

/** Day 39: radial re-scale (Globe.gl's own altitude mechanism) + zoom-aware stroke opacity. */
function applyZoomToPolygon(obj, cap, stroke) {
  const bandAlt = Number(obj.__currentTargetD?.alt ?? obj.__data?.altitude);
  if (!Number.isFinite(bandAlt)) return;
  const alt = zoomedAltitude(bandAlt);
  const s = 1 + alt;
  if (cap && cap.scale.x !== s) cap.scale.setScalar(s);
  if (stroke && stroke.visible) {
    const ss = s + 1e-4; // Globe.gl keeps strokes just above the cap
    if (stroke.scale.x !== ss) stroke.scale.setScalar(ss);
    const mat = stroke.material;
    if (mat) {
      const ud = mat.userData || (mat.userData = {});
      // Globe.gl (re)writes opacity on data updates — treat any foreign value as the new base.
      if (mat.opacity !== ud.etSetOpacity) ud.etBaseOpacity = mat.opacity;
      const next = Math.min(1, ud.etBaseOpacity * (1 + 0.45 * (1 - zoomF)));
      if (mat.opacity !== next) mat.opacity = next;
      ud.etSetOpacity = next;
    }
  }
}

/**
 * Day 39: fills a little lighter close up so the land and the (crisper) borders read through.
 * Day 40: with sharp imagery underneath, fills go down to 60% (was 80%) at the closest zoom.
 */
function capZoomOpacityMul() {
  return 0.6 + 0.4 * zoomF;
}
/** Day 39: fills a little lighter close up so the land and the (crisper) borders read through. */
function applyZoomCapOpacity() {
  const key = zoomF.toFixed(3);
  if (key === zoomStyleKey) return;
  zoomStyleKey = key;
  const mul = capZoomOpacityMul();
  for (const mat of capMaterialCache.values()) {
    const base = mat.userData?.etBaseOpacity;
    if (Number.isFinite(base)) mat.opacity = base * mul;
  }
}

/** Day 39: finer cap meshes only while close, with hysteresis. */
function maybeSwitchCapLod(camAlt) {
  if (capLod === 'coarse' && camAlt < LOD_FINE_ENTER) capLod = 'fine';
  else if (capLod === 'fine' && camAlt > LOD_FINE_EXIT) capLod = 'coarse';
}

/**
 * Split every triangle until its longest edge is ≤ maxEdge, projecting new vertices onto the
 * sphere through the edge's endpoints. Non-conforming splits are fine here: the only offsets
 * they leave are radial (sub-km), invisible from above, and the caps don't write depth.
 */
function refineCapGeometry(src, maxEdge) {
  const pos = src.getAttribute('position');
  const index = src.getIndex();
  const triCount = index ? index.count / 3 : pos.count / 3;
  const max2 = maxEdge * maxEdge;
  const out = [];
  const v = (i) => [pos.getX(i), pos.getY(i), pos.getZ(i)];
  const d2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
  const mid = (p, q) => {
    const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
    const r = (Math.hypot(...p) + Math.hypot(...q)) / 2 / (Math.hypot(...m) || 1);
    return [m[0] * r, m[1] * r, m[2] * r];
  };
  const split = (a, b, c, depth) => {
    const ab = d2(a, b);
    const bc = d2(b, c);
    const ca = d2(c, a);
    const longest = Math.max(ab, bc, ca);
    if (longest <= max2 || depth > 10) {
      out.push(...a, ...b, ...c);
      return;
    }
    if (longest === ab) {
      const m = mid(a, b);
      split(a, m, c, depth + 1);
      split(m, b, c, depth + 1);
    } else if (longest === bc) {
      const m = mid(b, c);
      split(a, b, m, depth + 1);
      split(a, m, c, depth + 1);
    } else {
      const m = mid(c, a);
      split(a, b, m, depth + 1);
      split(m, b, c, depth + 1);
    }
  };
  for (let t = 0; t < triCount; t++) {
    const i0 = index ? index.getX(3 * t) : 3 * t;
    const i1 = index ? index.getX(3 * t + 1) : 3 * t + 1;
    const i2 = index ? index.getX(3 * t + 2) : 3 * t + 2;
    split(v(i0), v(i1), v(i2), 0);
  }
  const g = new THREE_NS.BufferGeometry();
  g.setAttribute('position', new THREE_NS.Float32BufferAttribute(out, 3));
  // Keep Globe.gl's material slot and parameters (it compares parameters to decide rebuilds).
  const materialIndex = src.groups?.[0]?.materialIndex ?? 0;
  g.addGroup(0, out.length / 3, materialIndex);
  g.parameters = src.parameters;
  g.computeBoundingSphere();
  return g;
}

let refineSpentMs = 0;

/**
 * Swap in the refined cap mesh for the current LOD (built lazily, within a frame budget).
 * Day 44: feathered (approximate / conjectural) caps are refined finer and carry a
 * distance-to-edge attribute for the fill fade.
 */
function syncCapRefinement(cap, d) {
  if (!cap || !cap.geometry || !THREE_NS) return;
  const feather = d ? featherModeFor(d) : null;
  let rec = cap.__etRefine;
  if (!rec || (cap.geometry !== rec.coarse && cap.geometry !== rec.fine)) {
    // Globe.gl built (or rebuilt) this cap; it already disposed our previous mesh in use.
    if (rec) for (const g of [rec.src, rec.coarse, rec.fine]) if (g && g !== cap.geometry) g.dispose();
    rec = cap.__etRefine = { src: cap.geometry, coarse: null, fine: null, feather };
  }
  if (rec.feather !== feather && (rec.src || rec.coarse)) {
    // Certainty changed for the same mesh (toggle, or a new era): rebuild from the plainest mesh.
    if (rec.fine && rec.fine !== cap.geometry) rec.fine.dispose();
    if (!rec.src) rec.src = rec.coarse;
    else if (rec.coarse && rec.coarse !== cap.geometry) rec.coarse.dispose();
    rec.coarse = null;
    rec.fine = null;
    rec.feather = feather;
  }
  if (cap.geometry === rec[capLod]) return;
  if (!rec[capLod]) {
    if (refineSpentMs > REFINE_BUDGET_MS) return;
    const t0 = performance.now();
    const base = capLod === 'fine' && rec.coarse ? rec.coarse : rec.src || rec.coarse;
    const edge = feather ? Math.min(REFINE_EDGE[capLod], FEATHER_EDGE[capLod]) : REFINE_EDGE[capLod];
    const g = refineCapGeometry(base, edge);
    if (feather && d?.geometry) addEdgeDistance(g, d.geometry);
    rec[capLod] = g;
    refineSpentMs += performance.now() - t0;
    if (rec.src && rec.coarse && !feather) {
      rec.src.dispose();
      rec.src = null;
    }
  }
  cap.geometry = rec[capLod];
}

let polygonLayerParent = null;

function featureEntityId(d) {
  return d?.entityId || d?.properties?.entityId || null;
}

function isSelectedFeature(d) {
  const id = featureEntityId(d);
  return Boolean(selectedEntityId && id && id === selectedEntityId);
}

function capColorFor(d) {
  const base = d.opacity ?? d.properties?.opacity;
  const opacity = isSelectedFeature(d)
    ? Math.min(0.72, Math.max(0.38, (Number(base) || 0.43) * 1.45))
    : base;
  return hexToRgba(d.color || d.properties?.color, opacity);
}

function applyPolygonLayer() {
  if (!globe) return;
  // Use Globe.gl colour accessors (not custom MeshBasicMaterial) — custom DoubleSide/
  // FrontSide caps contributed to planet-wide washes with spherical triangulation.
  globe
    .polygonGeoJsonGeometry('geometry')
    .polygonAltitude(
      (d) => polygonAltitudeForFeature(d) + (isSelectedFeature(d) ? SELECTED_ALT_BUMP : 0),
    )
    .polygonCapColor(capColorFor)
    .polygonCapMaterial((d) => capMaterialFor(d, capColorFor(d)))
    // Day 34: null (not transparent rgba) — a truthy side colour builds invisible depth-writing walls.
    .polygonSideColor(() => null)
    // Day 35: polities thin solid edge; peoples brighter dashed edge (see syncStrokeStyle);
    // presence no edge (soft wash). Day 34 removed the depth shimmer that forced 0.12 strokes.
    .polygonStrokeColor((d) => {
      if (isSelectedFeature(d)) return 'rgba(255, 255, 255, 0.95)';
      const layer = featureLayer(d);
      if (layer === 'presence') return null;
      if (layer === 'nation') {
        // Day 38: crisp national borders; colonial-internal lines a little softer.
        const kind = d.nationKind || d.properties?.nationKind;
        const soft = kind === 'colony' || kind === 'dominion' || kind === 'vassal';
        // Day 44: approximate lines (long dashes) a little softer than documented ones.
        if (featureConfidence(d) === 'approximate') return soft ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)';
        return soft ? 'rgba(255, 255, 255, 0.42)' : 'rgba(255, 255, 255, 0.62)';
      }
      if (layer === 'people') {
        const conj = featureConfidence(d) === 'conjectural';
        if (d.nationsEraDim) return conj ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.34)';
        return conj ? 'rgba(255, 255, 255, 0.62)' : 'rgba(255, 255, 255, 0.7)';
      }
      // Day 44: conjectural polities get a dotted edge (brighter so the dots read); approximate
      // ones keep the thin solid edge with a softer fill near it.
      return featureConfidence(d) === 'conjectural' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.24)';
    })
    .polygonsTransitionDuration(0);
}

/**
 * Register a callback for polygon taps (entityId, feature).
 * @param {((entityId: string, feature: object) => void)|null} handler
 */
export function setOnGlobePolygonClick(handler) {
  polygonClickHandler = typeof handler === 'function' ? handler : null;
}

/**
 * Highlight the selected spatial entity on the globe (no remount).
 * @param {string|null} entityId
 */
export function setGlobeSelectedEntity(entityId) {
  const next = entityId ? String(entityId) : null;
  if (selectedEntityId === next) return;
  selectedEntityId = next;
  invalidateGlobeLabels();
  // Re-apply accessors + data so styles refresh without remounting
  if (globe && mounted) {
    applyPolygonLayer();
    if (Number.isFinite(currentPolygonYear)) {
      try {
        globe.polygonsData(polygonsForYear(currentPolygonYear));
      } catch (err) {
        console.warn('Failed to refresh selected globe polygons:', err);
      }
    }
  }
}

export function getGlobeSelectedEntity() {
  return selectedEntityId;
}

/**
 * Update on-globe polygons for `year` without remounting Globe.gl.
 * @param {number} year
 */
export function setGlobeOverlayYear(year) {
  if (!globe || !mounted) {
    currentPolygonYear = year;
    return;
  }
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) return;
  currentPolygonYear = y;
  syncNationsEraUI(y);
  const features = polygonsForYear(y);
  try {
    globe.polygonsData(features);
  } catch (err) {
    console.warn('Failed to update globe polygons:', err);
  }
  setGlobeLabelFeatures(features, y);
}

/**
 * Create / show the WebGL globe inside `container`.
 * @param {HTMLElement} container
 * @param {{ year?: number, onPolygonClick?: (entityId: string, feature: object) => void }} [opts]
 */
export async function mountGlobe(container, opts = {}) {
  if (!container) return null;
  hostEl = container;

  if (typeof opts.onPolygonClick === 'function') {
    polygonClickHandler = opts.onPolygonClick;
  }

  const year = Number.isFinite(Number(opts.year)) ? Number(opts.year) : currentPolygonYear;

  if (globe && mounted) {
    scheduleSizeToHost();
    try {
      globe.resumeAnimation();
    } catch (_) {
      // ignore
    }
    if (Number.isFinite(year)) setGlobeOverlayYear(year);
    return globe;
  }

  detachLegend();
  hostEl.innerHTML = '';

  const [{ default: Globe }, THREE] = await Promise.all([import('globe.gl'), import('three')]);
  THREE_NS = THREE;
  const mobile = isCoarsePointer();

  globe = Globe()(hostEl)
    .globeImageUrl(EARTH_DAY)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor('#7dd3fc')
    .atmosphereAltitude(mobile ? 0.12 : 0.18)
    .showGraticules(false)
    .enablePointerInteraction(true)
    .polygonsData([]);

  applyPolygonLayer();
  initGlobeLabels({ host: hostEl, globe, THREE, mobile, getSelected: () => selectedEntityId });
  attachLegend();

  try {
    const scene = globe.scene();
    const camera = globe.camera();
    scene.onBeforeRender = () => applyPolygonRenderOrder(scene, camera);
  } catch (_) {
    // ignore — default sort still works, just less stable
  }

  globe.onPolygonClick((feat) => {
    const id = featureEntityId(feat);
    if (!id || !polygonClickHandler) return;
    polygonClickHandler(id, feat);
  });

  globe.onPolygonHover((feat) => {
    if (!hostEl) return;
    hostEl.style.cursor = feat ? 'pointer' : '';
  });

  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  scheduleSizeToHost();

  const controls = globe.controls();
  if (controls) {
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    // Day 39: much closer (was 120 desktop / 140 phone). Camera near stays Globe.gl's 0.05
    // (~3 km): overlays only depth-test against the globe, which resolves fine at this range.
    controls.minDistance = MIN_CAMERA_DISTANCE;
    controls.maxDistance = mobile ? 450 : 500;
    controls.autoRotate = true;
    controls.autoRotateSpeed = mobile ? 0.25 : 0.35;
    controls.enableZoom = true;

    onControlsStart = () => {
      if (controls.autoRotate) controls.autoRotate = false;
    };
    controls.addEventListener('start', onControlsStart);
  }

  try {
    const at = parseAtParam();
    if (at) {
      if (controls) controls.autoRotate = false;
      globe.pointOfView(at, 0);
    } else {
      globe.pointOfView({ lat: 30, lng: 20, altitude: mobile ? 2.4 : 2.1 }, 0);
    }
  } catch (_) {
    // ignore
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => scheduleSizeToHost());
    resizeObserver.observe(hostEl);
    const stage = hostEl.closest('.globe-stage');
    const view = hostEl.closest('.globe-view');
    if (stage) resizeObserver.observe(stage);
    if (view) resizeObserver.observe(view);
  } else {
    window.addEventListener('resize', scheduleSizeToHost);
  }
  window.addEventListener('orientationchange', scheduleSizeToHost);

  // Soften page-scroll stealing while dragging on the canvas (iOS Safari)
  hostEl.addEventListener(
    'touchmove',
    (e) => {
      if (e.cancelable) e.preventDefault();
    },
    { passive: false },
  );

  mounted = true;
  if (Number.isFinite(year)) setGlobeOverlayYear(year);
  exposeGlobeDebugHandle();
  // Day 38: fetch the nations TopoJSON (~130 KB gzipped) once; redraw when it lands.
  loadNationsTopology()
    .then(() => {
      if (mounted && Number.isFinite(currentPolygonYear)) setGlobeOverlayYear(currentPolygonYear);
    })
    .catch(() => {});
  return globe;
}

/** Day 35: map key lives in the stage markup; float it over the canvas while the globe is mounted. */
/** Day 35/37: legend + fullscreen button live in the canvas host while mounted (so they
 * overlay the globe wherever the host sits — grid cell or fullscreen) and go home on unmount. */
let hostOverlayHomes = [];

function attachLegend() {
  if (!hostEl) return;
  const els = document.querySelectorAll('.globe-legend, .globe-fullscreen-toggle, .globe-credit, .feedback-open-fs');
  for (const el of els) {
    if (el.parentElement === hostEl) continue;
    hostOverlayHomes.push({ el, parent: el.parentElement, next: el.nextSibling });
    hostEl.appendChild(el);
  }
}

function detachLegend() {
  if (!hostEl) return;
  for (const { el, parent, next } of hostOverlayHomes.reverse()) {
    if (el.parentElement === hostEl) parent.insertBefore(el, next && next.parentNode === parent ? next : null);
  }
  hostOverlayHomes = [];
}

/** Day 38: the key / credit switch from "Polities" to "Nations" at the handoff (1815 since Day 41). */
function syncNationsEraUI(year) {
  const era = Number(year) >= NATIONS_HANDOFF_YEAR;
  for (const el of document.querySelectorAll('.globe-legend, .globe-credit')) {
    el.classList.toggle('is-nations-era', era);
  }
}

/** Day 39: `?at=lat,lng,alt` (alt in globe radii, clamped to the zoom range) opens a close-up. */
function parseAtParam() {
  try {
    const raw = new URLSearchParams(window.location.search).get('at');
    if (!raw) return null;
    const [lat, lng, alt] = raw.split(',').map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const minAlt = MIN_CAMERA_DISTANCE / 100 - 1;
    return {
      lat: Math.max(-89, Math.min(89, lat)),
      lng: ((((lng + 180) % 360) + 360) % 360) - 180,
      altitude: Number.isFinite(alt) ? Math.max(minAlt, Math.min(4, alt)) : 0.3,
    };
  } catch (_) {
    return null;
  }
}

/** `?globeDebug=1` exposes the Globe.gl instance for screenshot / QA harnesses only. */
function exposeGlobeDebugHandle() {
  try {
    if (new URLSearchParams(window.location.search).get('globeDebug') === '1') {
      window.__etGlobe = globe;
      window.__etGlobeDetail = getGlobeDetailState;
      window.__etGlobeLabels = getGlobeLabelsDebug;
    }
  } catch (_) {
    // ignore
  }
}

export function pauseGlobe() {
  if (!globe) return;
  try {
    globe.pauseAnimation();
  } catch (_) {
    // ignore
  }
}

export function resumeGlobe() {
  if (!globe) return;
  try {
    globe.resumeAnimation();
    scheduleSizeToHost();
  } catch (_) {
    // ignore
  }
}

export function destroyGlobe() {
  window.removeEventListener('orientationchange', scheduleSizeToHost);
  if (resizeObserver) {
    try {
      resizeObserver.disconnect();
    } catch (_) {
      // ignore
    }
    resizeObserver = null;
  } else {
    window.removeEventListener('resize', scheduleSizeToHost);
  }

  if (globe) {
    try {
      const controls = globe.controls?.();
      if (controls && onControlsStart) {
        controls.removeEventListener('start', onControlsStart);
      }
    } catch (_) {
      // ignore
    }
    onControlsStart = null;

    try {
      globe.polygonsData([]);
    } catch (_) {
      // ignore
    }

    try {
      globe._destructor();
    } catch (_) {
      try {
        globe.pauseAnimation();
      } catch (__) {
        // ignore
      }
    }
    globe = null;
  }
  polygonLayerParent = null;
  baseGlobeObj = null;
  tileEngineObj = null;
  tileState = 'off';
  tilesShown = false;
  fineShapes = null;
  fineUpdatePending = false;
  syncTileCredit();
  disposeCapMaterials();
  capLod = 'coarse';
  zoomF = 1;
  zoomStyleKey = '';

  destroyGlobeLabels();
  detachLegend();
  if (hostEl) {
    hostEl.style.cursor = '';
    hostEl.innerHTML = '';
  }
  hostEl = null;
  mounted = false;
  // Keep selectedEntityId + click handler across remounts within the same session;
  // main.js clears selection when leaving Globe mode.
}

export function isGlobeMounted() {
  return mounted && Boolean(globe);
}
