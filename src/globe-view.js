/**
 * Interactive Globe.gl earth (Phase 4) + historical polygons + Day 20 living-border morph.
 * Day 26: stable per-entity polygonAltitude offsets to stop overlap z-fighting.
 * Day 30: polygon click → detail panel; selected-entity highlight.
 * Day 35: peoples hatched + dashed edge vs solid polities; presence soft wash (no edge).
 * Day 34: real flicker fix — no depth-writing side walls / caps, stable layer-aware render order.
 * Mounted only while Globe mode is active; disposed on leave.
 */

import { getOverlayPolygonFeatures } from './globe-overlays.js';

const EARTH_DAY =
  'https://unpkg.com/three-globe@2.45.0/example/img/earth-blue-marble.jpg';
// No bump map while overlays are shown — bump shading exaggerates z-fighting vs polygon meshes.

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
const LAYER_BAND = { presence: 0, people: 1, polity: 2 };
const LAYER_ALT = { presence: 0.005, people: 0.0075, polity: 0.01 };
const POLYGON_ALT_STEP = 0.00004; // tie-break for picking only; depth no longer depends on it
const POLYGON_ALT_SLOTS = 24;
const SELECTED_ALT_BUMP = 0.004;
const SELECTED_BAND = 3;

function featureLayer(d) {
  const t = d?.entityType || d?.properties?.entityType;
  if (t === 'presence') return 'presence';
  if (t === 'people') return 'people';
  return 'polity';
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
  return LAYER_ALT[featureLayer(d)] + featureSlot(d) * POLYGON_ALT_STEP;
}

/** Stable draw order: presence under peoples under polities; selected on top. */
function polygonRenderOrder(d) {
  const band = isSelectedFeature(d) ? SELECTED_BAND : LAYER_BAND[featureLayer(d)];
  return 10 + band * 100 + featureSlot(d);
}

/**
 * Day 35: peoples vs polities read differently when shown together.
 * Polities: solid translucent fill + thin solid edge. Peoples: diagonal hatch fill (geographic,
 * anti-aliased, fades to a flat tint when stripes would go sub-pixel) + dashed edge.
 * Presence: soft wash, no edge.
 */
const HATCH_PERIOD_DEG = 1.1;

function addHatch(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.etHatchPeriod = { value: HATCH_PERIOD_DEG };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vEtPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEtPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vEtPos;\nuniform float etHatchPeriod;')
      .replace(
        '#include <alphamap_fragment>',
        `#include <alphamap_fragment>
        {
          vec3 etP = normalize(vEtPos);
          float etLat = asin(clamp(etP.y, -1.0, 1.0));
          float etLng = atan(etP.x, etP.z);
          float etC = (degrees(etLat) + degrees(etLng) * cos(etLat)) / etHatchPeriod;
          float etW = min(fwidth(etC), 1.0);
          float etF = abs(fract(etC) - 0.5);
          float etLine = 1.0 - smoothstep(0.22 - etW, 0.22 + etW, etF);
          float etFade = clamp(1.6 - etW * 3.0, 0.0, 1.0);
          diffuseColor.a *= mix(0.6, mix(0.22, 1.3, etLine), etFade);
        }`,
      );
  };
  mat.customProgramCacheKey = () => 'et-people-hatch-v1';
  return mat;
}

/** Shared cap materials keyed by colour + opacity + layer (Globe.gl skips colour updates for custom materials). */
const capMaterialCache = new Map();
let THREE_NS = null;

function capMaterialFor(d, rgba) {
  if (!THREE_NS) return undefined; // fall back to Globe.gl default until three is loaded
  const hatch = featureLayer(d) === 'people';
  const key = `${rgba}|${hatch ? 'hatch' : 'solid'}`;
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
    if (hatch) addHatch(mat);
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

/** Dashed outline for peoples (swapped onto Globe.gl's stroke LineSegments). */
function syncStrokeStyle(obj, d, stroke) {
  if (!THREE_NS || !stroke) return;
  const wantDashed = featureLayer(d) === 'people';
  if (wantDashed) {
    if (!obj.__etDashedMat) {
      obj.__etOrigStrokeMat = stroke.material;
      obj.__etDashedMat = new THREE_NS.LineDashedMaterial({
        color: stroke.material.color.clone(),
        opacity: stroke.material.opacity,
        transparent: true,
        depthWrite: false,
        dashSize: 2.4,
        gapSize: 1.6,
      });
    }
    if (stroke.material !== obj.__etDashedMat) {
      // Globe.gl updates colour/opacity on whichever material is attached.
      obj.__etDashedMat.color.copy(stroke.material.color);
      obj.__etDashedMat.opacity = stroke.material.opacity;
      stroke.material = obj.__etDashedMat;
    }
    if (stroke.geometry && obj.__etDashGeom !== stroke.geometry) {
      addLineDistances(stroke.geometry);
      obj.__etDashGeom = stroke.geometry;
    }
  } else if (obj.__etOrigStrokeMat && stroke.material !== obj.__etOrigStrokeMat) {
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
function applyPolygonRenderOrder(scene) {
  if (!scene) return;
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
  }
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
      return layer === 'people' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.24)';
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
  // Re-apply accessors + data so styles refresh without remounting
  if (globe && mounted) {
    applyPolygonLayer();
    if (Number.isFinite(currentPolygonYear)) {
      try {
        globe.polygonsData(getOverlayPolygonFeatures(currentPolygonYear));
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
  const features = getOverlayPolygonFeatures(y);
  try {
    globe.polygonsData(features);
  } catch (err) {
    console.warn('Failed to update globe polygons:', err);
  }
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
  attachLegend();

  try {
    const scene = globe.scene();
    scene.onBeforeRender = () => applyPolygonRenderOrder(scene);
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
    controls.minDistance = mobile ? 140 : 120;
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
    globe.pointOfView({ lat: 30, lng: 20, altitude: mobile ? 2.4 : 2.1 }, 0);
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
  return globe;
}

/** Day 35: map key lives in the stage markup; float it over the canvas while the globe is mounted. */
let legendHome = null;

function attachLegend() {
  if (!hostEl) return;
  const legend = document.querySelector('.globe-legend');
  if (!legend || legend.parentElement === hostEl) return;
  legendHome = { parent: legend.parentElement, next: legend.nextSibling };
  hostEl.appendChild(legend);
}

function detachLegend() {
  if (!hostEl || !legendHome) return;
  const legend = hostEl.querySelector(':scope > .globe-legend');
  if (legend) legendHome.parent.insertBefore(legend, legendHome.next);
  legendHome = null;
}

/** `?globeDebug=1` exposes the Globe.gl instance for screenshot / QA harnesses only. */
function exposeGlobeDebugHandle() {
  try {
    if (new URLSearchParams(window.location.search).get('globeDebug') === '1') {
      window.__etGlobe = globe;
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
  disposeCapMaterials();

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
