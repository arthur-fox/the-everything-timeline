/**
 * Day 61 / Phase 4c step 7.1 — celestial sphere behind the globe.
 *
 * One Points mesh (Yale Bright Star Catalogue subset, mag ≤ 6.5) + one inward-facing
 * Milky Way texture (NASA SVS Deep Star Maps 2020 → celestial equirectangular WebP).
 * No per-frame CPU work. Earth's axis = celestial pole; camera orbit reveals different
 * sky as you go around Earth (sky is fixed in world space with the globe).
 *
 * Step 7.2 (constellation lines / names) is intentionally not here.
 */

const STAR_URL = `${import.meta.env.BASE_URL || '/'}sky/bsc-stars.bin`;
const MILKY_WAY_URL = `${import.meta.env.BASE_URL || '/'}sky/milkyway-celestial.webp`;

/** Past max camera distance (≈500) so the viewer never clips the sky. Globe.gl earth ≈ 100. */
const SKY_RADIUS = 900;
const STAR_RADIUS = 880;

let skyGroup = null;
let milkyWayMesh = null;
let starPoints = null;
let attachedScene = null;
let themeObserver = null;

function softCircleTexture(THREE) {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * @param {object} opts
 * @param {import('three')} opts.THREE
 * @param {import('three').Scene} opts.scene
 * @param {boolean} [opts.mobile]
 */
export async function initGlobeSky({ THREE, scene, mobile = false }) {
  if (!THREE || !scene) return null;
  destroyGlobeSky();
  attachedScene = scene;

  const group = new THREE.Group();
  group.name = 'et-celestial-sky';
  group.renderOrder = -20;
  skyGroup = group;

  const mwPromise = new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(MILKY_WAY_URL, resolve, undefined, (err) => reject(err || new Error('milky-way failed')));
  })
    .then((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.needsUpdate = true;
      const geo = new THREE.SphereGeometry(SKY_RADIUS, mobile ? 48 : 64, mobile ? 24 : 32);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: true,
        fog: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = 'et-milky-way';
      mesh.frustumCulled = false;
      mesh.renderOrder = -20;
      // SphereGeometry UVs: u=0 at +X. Our equirect has RA=0 at u=0; globe.gl uses
      // lng=0 on +Z, so −90° yaw lines celestial RA up with geographic longitude.
      mesh.rotation.y = -Math.PI / 2;
      milkyWayMesh = mesh;
      group.add(mesh);
      return mesh;
    })
    .catch((err) => {
      console.warn('[globe-sky] Milky Way texture skipped:', err?.message || err);
      return null;
    });

  const starsPromise = fetch(STAR_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`stars HTTP ${r.status}`);
      return r.arrayBuffer();
    })
    .then((buf) => {
      const view = new DataView(buf);
      const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
      if (magic !== 'ETB1') throw new Error(`bad star magic ${magic}`);
      const count = view.getUint32(4, true);
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      let o = 8;
      // Encode magnitude into colour brightness; point size is one shared material value
      // (phone budget: one Points draw, no per-frame work).
      for (let i = 0; i < count; i++) {
        const x = view.getFloat32(o, true);
        const y = view.getFloat32(o + 4, true);
        const z = view.getFloat32(o + 8, true);
        // size float unused for material size — still advance past it
        o += 16;
        const r = view.getUint8(o) / 255;
        const g = view.getUint8(o + 1) / 255;
        const b = view.getUint8(o + 2) / 255;
        const bright = view.getUint8(o + 3) / 255;
        o += 4;
        positions[i * 3] = x * STAR_RADIUS;
        positions[i * 3 + 1] = y * STAR_RADIUS;
        positions[i * 3 + 2] = z * STAR_RADIUS;
        const k = 0.35 + 0.65 * bright;
        colors[i * 3] = Math.min(1, r * k);
        colors[i * 3 + 1] = Math.min(1, g * k);
        colors[i * 3 + 2] = Math.min(1, b * k);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: mobile ? 3.2 : 4.2,
        sizeAttenuation: true,
        map: softCircleTexture(THREE),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        fog: false,
        opacity: 0.95,
      });

      const points = new THREE.Points(geo, mat);
      points.name = 'et-bsc-stars';
      points.frustumCulled = false;
      points.renderOrder = -19;
      starPoints = points;
      group.add(points);
      return points;
    })
    .catch((err) => {
      console.warn('[globe-sky] Star catalogue skipped:', err?.message || err);
      return null;
    });

  await Promise.all([mwPromise, starsPromise]);

  if (group.children.length === 0) {
    skyGroup = null;
    attachedScene = null;
    return null;
  }

  scene.add(group);
  syncSkyTheme();
  watchTheme();
  return group;
}

function watchTheme() {
  if (themeObserver || typeof MutationObserver === 'undefined') return;
  try {
    themeObserver = new MutationObserver(() => syncSkyTheme());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (document.body) {
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    }
  } catch (_) {
    themeObserver = null;
  }
}

/** Hide the celestial sphere in light theme (CSS already hides the body starfield). */
export function syncSkyTheme() {
  if (!skyGroup) return;
  let light = false;
  try {
    light =
      document.documentElement.getAttribute('data-theme') === 'light' ||
      document.body?.getAttribute('data-theme') === 'light';
  } catch (_) {
    // ignore
  }
  skyGroup.visible = !light;
}

export function destroyGlobeSky() {
  if (themeObserver) {
    try {
      themeObserver.disconnect();
    } catch (_) {
      // ignore
    }
    themeObserver = null;
  }
  if (skyGroup && attachedScene) {
    try {
      attachedScene.remove(skyGroup);
    } catch (_) {
      // ignore
    }
  }
  const disposeObj = (obj) => {
    if (!obj) return;
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (obj.material.map) obj.material.map.dispose();
      obj.material.dispose();
    }
  };
  disposeObj(milkyWayMesh);
  disposeObj(starPoints);
  milkyWayMesh = null;
  starPoints = null;
  skyGroup = null;
  attachedScene = null;
}
