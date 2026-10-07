/**
 * Interactive Globe.gl earth (Phase 4) + historical polygons + Day 20 living-border morph.
 * Day 26: stable per-entity polygonAltitude offsets to stop overlap z-fighting.
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
  const op = Math.max(0.05, Math.min(0.55, Number(opacity) || 0.43));
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
 * Day 26: per-entity altitude so coplanar empire meshes do not z-fight.
 * Base hugs the globe; hash slots add a tiny epsilon (stable while scrubbing).
 * Max stays ~0.01 so overlays do not float off the surface.
 */
const POLYGON_ALT_BASE = 0.0045;
const POLYGON_ALT_STEP = 0.00011;
const POLYGON_ALT_SLOTS = 48;

function polygonAltitudeForFeature(d) {
  const entityId = d?.entityId || d?.properties?.entityId || '';
  const regionId = d?.regionId || d?.properties?.regionId || '';
  const key = entityId ? `${entityId}::${regionId}` : regionId || d?.name || 'anon';
  const slot = hashId(key) % POLYGON_ALT_SLOTS;
  return POLYGON_ALT_BASE + slot * POLYGON_ALT_STEP;
}

function applyPolygonLayer() {
  if (!globe) return;
  // Use Globe.gl colour accessors (not custom MeshBasicMaterial) — custom DoubleSide/
  // FrontSide caps contributed to planet-wide washes with spherical triangulation.
  globe
    .polygonGeoJsonGeometry('geometry')
    .polygonAltitude(polygonAltitudeForFeature)
    .polygonCapColor((d) => hexToRgba(d.color || d.properties?.color, d.opacity ?? d.properties?.opacity))
    .polygonSideColor(() => 'rgba(0,0,0,0)')
    // Soft stroke — white 0.4 edges shimmered on overlaps (Day 26).
    .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.12)')
    .polygonsTransitionDuration(0);
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
 * @param {{ year?: number }} [opts]
 */
export async function mountGlobe(container, opts = {}) {
  if (!container) return null;
  hostEl = container;

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

  hostEl.innerHTML = '';

  const Globe = (await import('globe.gl')).default;
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
  return globe;
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

  if (hostEl) {
    hostEl.innerHTML = '';
  }
  hostEl = null;
  mounted = false;
}

export function isGlobeMounted() {
  return mounted && Boolean(globe);
}
