/**
 * Interactive Globe.gl earth (Phase 4 PR B) + historical polygons (PR D).
 * Mounted only while Globe mode is active; disposed on leave.
 */

import { getOverlayPolygonFeatures } from './globe-overlays.js';

const EARTH_DAY =
  'https://unpkg.com/three-globe@2.45.0/example/img/earth-blue-marble.jpg';
const EARTH_TOPOLOGY =
  'https://unpkg.com/three-globe@2.45.0/example/img/earth-topology.png';

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
  globe.width(w).height(h);
}

function hexToRgba(hex, alpha) {
  const h = String(hex || '#888888').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = Number.parseInt(full.slice(0, 6), 16);
  if (!Number.isFinite(n)) return `rgba(136,136,136,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyPolygonLayer() {
  if (!globe) return;
  globe
    .polygonGeoJsonGeometry('geometry')
    .polygonCapColor((d) => hexToRgba(d.color || d.properties?.color, 0.42))
    .polygonSideColor((d) => hexToRgba(d.color || d.properties?.color, 0.2))
    .polygonStrokeColor(() => 'rgba(255,255,255,0.4)')
    .polygonAltitude(0.008)
    .polygonsTransitionDuration(280);
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
 * Safe to call repeatedly while already mounted.
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
    .bumpImageUrl(EARTH_TOPOLOGY)
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

  if (hostEl) {
    hostEl.innerHTML = '';
  }
  hostEl = null;
  mounted = false;
}

export function isGlobeMounted() {
  return mounted && Boolean(globe);
}
