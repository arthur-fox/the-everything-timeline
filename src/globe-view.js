/**
 * Interactive Globe.gl earth for Phase 4 / PR B.
 * Mounted only while Globe mode is active; disposed on leave.
 */

const EARTH_DAY =
  'https://unpkg.com/three-globe@2.45.0/example/img/earth-blue-marble.jpg';
const EARTH_TOPOLOGY =
  'https://unpkg.com/three-globe@2.45.0/example/img/earth-topology.png';
let globe = null;
let hostEl = null;
let resizeObserver = null;
let onControlsStart = null;
let mounted = false;

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

/**
 * Create / show the WebGL globe inside `container`.
 * Safe to call repeatedly while already mounted.
 */
export async function mountGlobe(container) {
  if (!container) return null;
  hostEl = container;

  if (globe && mounted) {
    sizeToHost();
    try {
      globe.resumeAnimation();
    } catch (_) {
      // ignore
    }
    return globe;
  }

  // Clear any leftover placeholder nodes
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
    .enablePointerInteraction(true);

  // Wait a frame so layout has real dimensions (view just became visible)
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

  // Point camera toward Europe / Mediterranean as a friendly default for year 117
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
  return globe;
}

/** Pause the render loop while Globe view is hidden (keeps instance warm). */
export function pauseGlobe() {
  if (!globe) return;
  try {
    globe.pauseAnimation();
  } catch (_) {
    // ignore
  }
}

/** Resume after pause without full remount. */
export function resumeGlobe() {
  if (!globe) return;
  try {
    globe.resumeAnimation();
    sizeToHost();
  } catch (_) {
    // ignore
  }
}

/** Full teardown — WebGL context, listeners, DOM. */
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
