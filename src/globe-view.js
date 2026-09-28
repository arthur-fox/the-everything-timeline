/**
 * Interactive Globe.gl earth (Phase 4 PR B) + historical polygons (PR D/Day 14).
 * Mounted only while Globe mode is active; disposed on leave.
 */

import { MeshBasicMaterial, DoubleSide } from 'three';
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
const materialCache = new Map();

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
  globe.width(w).height(h);
}

function parseHex(hex) {
  const h = String(hex || '#888888').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return 0x888888;
  return n;
}

/** Flat translucent cap — depthWrite off + polygonOffset to hug the sphere without z-fighting. */
function capMaterialFor(hex) {
  const key = String(hex || '#888888');
  if (materialCache.has(key)) return materialCache.get(key);
  const mat = new MeshBasicMaterial({
    color: parseHex(key),
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    depthTest: true,
    side: DoubleSide,
  });
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -2;
  mat.polygonOffsetUnits = -2;
  materialCache.set(key, mat);
  return mat;
}

const INVISIBLE_SIDE = (() => {
  const mat = new MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
  });
  mat.colorWrite = false;
  return mat;
})();

function applyPolygonLayer() {
  if (!globe) return;
  globe
    .polygonGeoJsonGeometry('geometry')
    // Clamp to surface: tiny altitude, no visible side walls, cap materials that don't fight the globe.
    .polygonAltitude(0.005)
    .polygonCapMaterial((d) => capMaterialFor(d.color || d.properties?.color))
    .polygonSideMaterial(() => INVISIBLE_SIDE)
    .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.55)')
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
    sizeToHost();
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
  sizeToHost();

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
    resizeObserver = new ResizeObserver(() => sizeToHost());
    resizeObserver.observe(hostEl);
  } else {
    window.addEventListener('resize', sizeToHost);
  }

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
    sizeToHost();
  } catch (_) {
    // ignore
  }
}

export function destroyGlobe() {
  if (resizeObserver) {
    try {
      resizeObserver.disconnect();
    } catch (_) {
      // ignore
    }
    resizeObserver = null;
  } else {
    window.removeEventListener('resize', sizeToHost);
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

  for (const mat of materialCache.values()) {
    try {
      mat.dispose();
    } catch (_) {
      // ignore
    }
  }
  materialCache.clear();

  if (hostEl) {
    hostEl.innerHTML = '';
  }
  hostEl = null;
  mounted = false;
}

export function isGlobeMounted() {
  return mounted && Boolean(globe);
}
