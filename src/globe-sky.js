/**
 * Day 61–62 / Phase 4c steps 7.1–7.2 — celestial sphere behind the globe.
 *
 * 7.1: One Points mesh (Yale Bright Star Catalogue subset, mag ≤ 6.5) + one inward-facing
 *      Milky Way texture (NASA SVS Deep Star Maps 2020 → celestial equirectangular WebP).
 * 7.2: Constellation stick figures + short names (d3-celestial BSD-3 GeoJSON → compact binary),
 *      key toggle (off by default since Day 67; `&constellations=1`), lightweight axial precession by year.
 *
 * No per-frame CPU work. Earth's axis = celestial pole (J2000); camera orbit reveals different
 * sky. Precession rotates the whole sky group only when the year changes.
 */

const STAR_URL = `${import.meta.env.BASE_URL || '/'}sky/bsc-stars.bin`;
const MILKY_WAY_URL = `${import.meta.env.BASE_URL || '/'}sky/milkyway-celestial.webp`;
const CONSTELLATIONS_URL = `${import.meta.env.BASE_URL || '/'}sky/constellations.bin`;

/** Past max camera distance (≈500) so the viewer never clips the sky. Globe.gl earth ≈ 100. */
const SKY_RADIUS = 900;
const STAR_RADIUS = 880;
const CONST_LINE_RADIUS = 860;
const CONST_NAME_RADIUS = 850;

/** Sidereal year-ish precession period (tropical ≈ 25771.5 yr). */
const PRECESSION_PERIOD_YR = 25771.5;
/** Ecliptic north pole in J2000 equatorial (degrees). */
const ECL_POLE_RA_DEG = 270.0;
const ECL_POLE_DEC_DEG = 66.5607;
const J2000_YEAR = 2000;

let skyGroup = null;
let milkyWayMesh = null;
let starPoints = null;
let constellationGroup = null;
let constellationLines = null;
let constellationNames = null;
let attachedScene = null;
let themeObserver = null;
let constellationsEnabled = false; // Day 67: off by default (main.js turns them on via the key / `&constellations=1`)
let skyYear = J2000_YEAR;
let THREE_REF = null;
let precessAxis = null;

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

function nameSpriteTexture(THREE, text, rank) {
  const padX = 10;
  const padY = 6;
  const fontPx = rank <= 1 ? 28 : rank === 2 ? 24 : 20;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = `600 ${fontPx}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
  const w = Math.ceil(ctx.measureText(text).width) + padX * 2;
  const h = fontPx + padY * 2;
  c.width = w;
  c.height = h;
  ctx.font = `600 ${fontPx}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Soft dark plate so gold text stays readable over the Milky Way.
  ctx.fillStyle = 'rgba(8, 12, 24, 0.45)';
  const r = 8;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = rank <= 2 ? 'rgba(253, 230, 180, 0.92)' : 'rgba(226, 232, 240, 0.78)';
  ctx.fillText(text, w / 2, h / 2 + 0.5);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return { tex, aspect: w / h };
}

function ensurePrecessAxis(THREE) {
  if (precessAxis) return precessAxis;
  const ra = (ECL_POLE_RA_DEG * Math.PI) / 180;
  const dec = (ECL_POLE_DEC_DEG * Math.PI) / 180;
  precessAxis = new THREE.Vector3(
    Math.cos(dec) * Math.sin(ra),
    Math.sin(dec),
    Math.cos(dec) * Math.cos(ra),
  ).normalize();
  return precessAxis;
}

/** Apply approximate axial precession for `year` (rotate sky about the ecliptic pole). */
function applySkyPrecession(year) {
  if (!skyGroup || !THREE_REF) return;
  const y = Number.isFinite(year) ? year : J2000_YEAR;
  skyYear = y;
  const axis = ensurePrecessAxis(THREE_REF);
  // Angle from J2000; negative years (BCE) move the pole toward Thuban.
  const angle = ((y - J2000_YEAR) / PRECESSION_PERIOD_YR) * Math.PI * 2;
  skyGroup.quaternion.setFromAxisAngle(axis, -angle);
}

function syncConstellationVisibility() {
  if (!constellationGroup) return;
  // Follow sky theme (light theme hides the whole skyGroup) and the key toggle.
  constellationGroup.visible = Boolean(constellationsEnabled);
}

/**
 * @param {object} opts
 * @param {import('three')} opts.THREE
 * @param {import('three').Scene} opts.scene
 * @param {boolean} [opts.mobile]
 * @param {number} [opts.year]
 */
export async function initGlobeSky({ THREE, scene, mobile = false, year = J2000_YEAR } = {}) {
  if (!THREE || !scene) return null;
  destroyGlobeSky();
  attachedScene = scene;
  THREE_REF = THREE;

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

  const constPromise = fetch(CONSTELLATIONS_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`constellations HTTP ${r.status}`);
      return r.arrayBuffer();
    })
    .then((buf) => {
      const view = new DataView(buf);
      const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
      if (magic !== 'ETC1') throw new Error(`bad constellation magic ${magic}`);
      let o = 4;
      const nLineVerts = view.getUint32(o, true);
      o += 4;
      const positions = new Float32Array(nLineVerts * 3);
      for (let i = 0; i < nLineVerts; i++) {
        positions[i * 3] = view.getFloat32(o, true) * CONST_LINE_RADIUS;
        positions[i * 3 + 1] = view.getFloat32(o + 4, true) * CONST_LINE_RADIUS;
        positions[i * 3 + 2] = view.getFloat32(o + 8, true) * CONST_LINE_RADIUS;
        o += 12;
      }

      const cGroup = new THREE.Group();
      cGroup.name = 'et-constellations';

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xf5e6c8,
        transparent: true,
        opacity: mobile ? 0.38 : 0.48,
        depthWrite: false,
        depthTest: true,
        fog: false,
      });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      lines.name = 'et-constellation-lines';
      lines.frustumCulled = false;
      lines.renderOrder = -18;
      constellationLines = lines;
      cGroup.add(lines);

      const nNames = view.getUint32(o, true);
      o += 4;
      const namesGroup = new THREE.Group();
      namesGroup.name = 'et-constellation-names';
      // Phone: only rank 1–2 labels to keep draw calls modest; desktop gets all 88.
      const maxRank = mobile ? 2 : 3;
      for (let i = 0; i < nNames; i++) {
        const x = view.getFloat32(o, true);
        const y = view.getFloat32(o + 4, true);
        const z = view.getFloat32(o + 8, true);
        o += 12;
        const rank = view.getUint8(o);
        o += 1;
        const desigLen = view.getUint8(o);
        o += 1;
        let desig = '';
        for (let k = 0; k < desigLen; k++) desig += String.fromCharCode(view.getUint8(o + k));
        o += desigLen;
        const nameLen = view.getUint8(o);
        o += 1;
        let fullName = '';
        for (let k = 0; k < nameLen; k++) fullName += String.fromCharCode(view.getUint8(o + k));
        o += nameLen;

        if (rank > maxRank) continue;
        // Short IAU abbreviation — readable without cluttering the sphere.
        const label = desig || fullName;
        const { tex, aspect } = nameSpriteTexture(THREE, label, rank);
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          depthWrite: false,
          depthTest: true,
          fog: false,
          opacity: rank <= 1 ? 0.9 : rank === 2 ? 0.75 : 0.55,
          sizeAttenuation: true,
        });
        const sprite = new THREE.Sprite(mat);
        sprite.name = `et-const-${desig || i}`;
        sprite.position.set(x * CONST_NAME_RADIUS, y * CONST_NAME_RADIUS, z * CONST_NAME_RADIUS);
        // World units: keep labels modest against the sky radius.
        const base = mobile ? 14 : rank <= 1 ? 18 : rank === 2 ? 15 : 12;
        sprite.scale.set(base * aspect, base, 1);
        sprite.renderOrder = -17;
        namesGroup.add(sprite);
      }
      constellationNames = namesGroup;
      cGroup.add(namesGroup);

      constellationGroup = cGroup;
      syncConstellationVisibility();
      group.add(cGroup);
      return cGroup;
    })
    .catch((err) => {
      console.warn('[globe-sky] Constellations skipped:', err?.message || err);
      return null;
    });

  await Promise.all([mwPromise, starsPromise, constPromise]);

  if (group.children.length === 0) {
    skyGroup = null;
    attachedScene = null;
    THREE_REF = null;
    return null;
  }

  scene.add(group);
  applySkyPrecession(year);
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

/** Day 62: constellation lines/names on or off (key toggle; off by default since Day 67, `&constellations=1`). */
export function setGlobeConstellationsEnabled(on) {
  constellationsEnabled = Boolean(on);
  syncConstellationVisibility();
}

export function areGlobeConstellationsEnabled() {
  return constellationsEnabled;
}

/**
 * Day 62: update axial precession when the globe year changes.
 * Cheap — one quaternion write; no geometry rebuild.
 */
export function setSkyYear(year) {
  if (!Number.isFinite(year)) return;
  if (Math.round(year) === Math.round(skyYear) && skyGroup) return;
  applySkyPrecession(Math.round(year));
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
  disposeObj(constellationLines);
  if (constellationNames) {
    constellationNames.children.forEach((spr) => {
      if (spr.material) {
        if (spr.material.map) spr.material.map.dispose();
        spr.material.dispose();
      }
    });
  }
  milkyWayMesh = null;
  starPoints = null;
  constellationLines = null;
  constellationNames = null;
  constellationGroup = null;
  skyGroup = null;
  attachedScene = null;
  THREE_REF = null;
  precessAxis = null;
}
