/**
 * Day 32 / PR F slice 4 — ocean gaps (GeoJSON Polygon inner rings).
 *
 * Schematic inland-sea / lake outlines used as polygon *holes* so a region ring
 * that wraps a sea (Rome round the Mediterranean, Mongols round the Caspian…)
 * does not paint the water as territory. Hand-drawn, coarse, NOT GIS coastlines.
 *
 * Winding (verified against d3-geo, which three-conic-polygon-geometry uses for
 * bounds / containment): exterior rings are planar-CW (negative lng/lat signed
 * area — see ensureClockwise); holes must be the opposite, planar-CCW. A CCW hole
 * gives geoArea(outer) − geoArea(hole); a CW hole would *add* area instead.
 *
 * A region opts in with `holes: ['mediterranean-west', …]` (template ids) or
 * inline `{ id, name?, ring }`. Holes are only kept where they sit inside the
 * outer ring; if a template pokes out, it is shrunk toward its own centroid
 * (down to 50%) until it fits, otherwise dropped. Not for antimeridian rings.
 */

/** @type {Record<string, { name: string, ring: [number, number][] }>} */
export const SEA_HOLE_RINGS = {
  // Gibraltar → Sicily strait, west of Italy (Balearics/Sardinia/Corsica fall inside — schematic).
  'mediterranean-west': {
    name: 'Western Mediterranean',
    ring: [
      [-5.3, 36.2], [-2.2, 36.8], [-0.6, 37.6], [0.2, 38.8], [-0.3, 39.5], [0.9, 41.0],
      [3.2, 41.9], [3.1, 43.0], [4.6, 43.4], [6.5, 43.1], [7.6, 43.8], [8.8, 44.4],
      [10.2, 43.9], [10.5, 42.9], [11.8, 42.1], [13.0, 41.2], [14.1, 40.8], [15.0, 40.2],
      [15.6, 38.9], [15.6, 38.2], [14.0, 38.0], [12.5, 38.1], [12.4, 37.6], [11.0, 37.1],
      [10.2, 37.2], [9.8, 37.3], [8.6, 36.9], [7.0, 37.0], [5.0, 36.7], [3.0, 36.8],
      [1.0, 36.5], [-1.0, 35.7], [-2.2, 35.1], [-3.9, 35.2], [-5.3, 35.9], [-5.3, 36.2],
    ],
  },
  // Sicily strait → Levant incl. Ionian, Adriatic, Aegean (Crete/Cyprus inside — schematic).
  'mediterranean-east': {
    name: 'Eastern Mediterranean',
    ring: [
      [11.1, 36.8], [12.5, 37.5], [14.3, 36.8], [15.2, 36.7], [15.2, 37.5], [15.6, 37.95],
      [16.1, 38.4], [16.6, 38.9], [17.1, 39.0], [16.5, 39.7], [17.2, 40.4], [18.4, 40.0],
      [18.0, 40.6], [16.9, 41.2], [15.9, 41.6], [14.2, 42.4], [13.6, 43.5], [12.4, 44.4],
      [12.3, 45.3], [13.6, 45.7], [14.5, 45.2], [15.3, 44.2], [16.4, 43.5], [18.0, 42.7],
      [19.4, 41.8], [19.4, 40.4], [20.2, 39.5], [21.0, 38.4], [21.6, 37.0], [22.5, 36.4],
      [23.1, 36.5], [23.6, 37.9], [24.0, 38.4], [22.9, 39.4], [22.6, 40.4], [23.8, 40.4],
      [24.4, 40.9], [26.0, 40.8], [26.2, 40.1], [26.6, 39.3], [26.8, 38.4], [27.3, 37.4],
      [28.0, 36.7], [29.6, 36.2], [30.6, 36.8], [32.5, 36.1], [34.0, 36.3], [35.9, 36.8],
      [35.8, 35.4], [35.6, 34.0], [34.9, 32.8], [34.4, 31.5], [32.3, 31.2], [30.5, 31.5],
      [29.0, 30.9], [27.2, 31.4], [25.2, 31.6], [23.2, 32.2], [21.0, 32.9], [20.0, 32.1],
      [19.0, 30.4], [17.0, 31.1], [15.3, 32.2], [13.2, 32.9], [11.3, 33.2], [10.1, 33.8],
      [10.8, 34.8], [11.1, 35.3], [10.6, 36.0], [11.1, 36.8],
    ],
  },
  // Aegean alone (for rings that wrap it but not the whole east Med).
  'aegean-sea': {
    name: 'Aegean Sea',
    ring: [
      [23.2, 36.6], [23.6, 37.9], [24.0, 38.3], [22.9, 39.3], [22.7, 40.4], [23.8, 40.3],
      [24.4, 40.9], [26.0, 40.8], [26.3, 40.0], [26.6, 39.3], [26.8, 38.4], [27.3, 37.4],
      [27.6, 36.7], [26.3, 35.3], [25.0, 35.4], [23.6, 35.6], [23.2, 36.6],
    ],
  },
  // Black Sea (Sea of Azov omitted).
  'black-sea': {
    name: 'Black Sea',
    ring: [
      [29.1, 41.2], [28.0, 41.9], [27.8, 42.7], [28.6, 43.9], [28.7, 44.2], [29.7, 45.2],
      [30.7, 46.5], [31.8, 46.4], [32.5, 45.4], [33.6, 44.5], [34.9, 44.8], [36.4, 45.2],
      [37.4, 44.7], [38.4, 44.3], [39.8, 43.4], [41.6, 41.6], [40.0, 41.0], [38.0, 40.9],
      [36.1, 41.7], [34.0, 42.0], [32.3, 41.7], [30.4, 41.2], [29.1, 41.2],
    ],
  },
  'caspian-sea': {
    name: 'Caspian Sea',
    ring: [
      [46.7, 44.5], [48.0, 46.3], [49.2, 46.4], [51.2, 47.0], [53.0, 46.8], [53.2, 45.3],
      [51.3, 44.5], [52.7, 42.6], [52.9, 41.0], [52.9, 40.0], [53.5, 39.0], [53.9, 37.4],
      [51.5, 36.8], [50.0, 37.4], [49.0, 38.4], [49.4, 40.3], [48.6, 41.8], [47.5, 43.0],
      [46.7, 44.5],
    ],
  },
  // Pre-1960s extent.
  'aral-sea': {
    name: 'Aral Sea',
    ring: [
      [59.5, 46.8], [61.2, 46.6], [61.8, 45.2], [60.3, 43.9], [58.9, 43.5], [58.2, 44.6],
      [58.4, 45.6], [59.5, 46.8],
    ],
  },
  'persian-gulf': {
    name: 'Persian Gulf',
    ring: [
      [48.0, 30.0], [49.5, 30.1], [50.5, 29.2], [51.4, 27.9], [53.6, 26.8], [56.3, 27.1],
      [56.3, 26.2], [54.4, 24.3], [52.0, 24.0], [51.6, 25.9], [50.2, 25.6], [50.0, 26.5],
      [49.4, 27.1], [48.4, 28.6], [48.0, 30.0],
    ],
  },
  'lake-victoria': {
    name: 'Lake Victoria',
    ring: [
      [32.3, 0.3], [33.5, 0.4], [34.1, 0.0], [34.8, -0.4], [34.2, -1.2], [33.9, -2.3],
      [33.0, -2.6], [31.8, -2.0], [31.7, -0.8], [32.3, 0.3],
    ],
  },
};

/** Planar signed area (positive ⇒ CCW in lng/lat). */
function signedArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return a / 2;
}

function closeRing(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return null;
  const out = ring.map(([lng, lat]) => [Number(lng), Number(lat)]);
  if (out.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) return null;
  const [f0, f1] = out[0];
  const [l0, l1] = out[out.length - 1];
  if (f0 !== l0 || f1 !== l1) out.push([f0, f1]);
  return out.length >= 4 ? out : null;
}

/**
 * Hole winding for Globe.gl / d3-geo: planar counter-clockwise (opposite of exteriors).
 * @param {[number, number][]} ring
 * @returns {[number, number][]|null}
 */
export function ensureHoleWinding(ring) {
  const closed = closeRing(ring);
  if (!closed) return null;
  if (signedArea(closed) >= 0) return closed;
  const open = closed.slice(0, -1).reverse();
  open.push([open[0][0], open[0][1]]);
  return open;
}

/** Ray-cast point-in-ring (planar lng/lat; fine away from the antimeridian). */
export function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** True when every vertex of `inner` lies strictly inside `outer`. */
export function ringInsideRing(inner, outer) {
  if (!inner || !outer) return false;
  return inner.every((p) => pointInRing(p, outer));
}

/** Vertex-mean centroid of a closed ring. */
export function holeCentroid(ring) {
  const open = ring.slice(0, -1);
  let sx = 0;
  let sy = 0;
  for (const [x, y] of open) {
    sx += x;
    sy += y;
  }
  const n = open.length || 1;
  return [sx / n, sy / n];
}

/** Scale a closed ring about `center` by factor f (keeps closure). */
export function scaleRingAbout(ring, center, f) {
  const [cx, cy] = center;
  return ring.map(([x, y]) => [cx + (x - cx) * f, cy + (y - cy) * f]);
}

/** Shrink steps tried when a hole pokes outside its outer ring. */
const FIT_SCALES = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5];

/**
 * Fit a hole inside an outer ring by shrinking toward its own centroid.
 * @returns {{ ring: [number, number][], scale: number }|null}
 */
export function fitHoleInsideRing(hole, outer, maxShrink = 0.5) {
  const h = ensureHoleWinding(hole);
  if (!h || !outer) return null;
  const c = holeCentroid(h);
  for (const s of FIT_SCALES) {
    if (s < maxShrink) break;
    const cand = s === 1 ? h : scaleRingAbout(h, c, s);
    if (ringInsideRing(cand, outer)) return { ring: cand, scale: s };
  }
  return null;
}

/**
 * Resolve a region's optional `holes` against its (already resolved) outer ring.
 * @param {object|string} region
 * @param {[number, number][]|null} outerRing closed exterior ring
 * @returns {{ id: string, name: string, ring: [number, number][], fitScale: number }[]}
 */
export function resolveRegionHoles(region, outerRing) {
  if (!region || typeof region !== 'object' || !Array.isArray(region.holes) || !outerRing) return [];
  const out = [];
  region.holes.forEach((ref, idx) => {
    let id;
    let name;
    let ring;
    if (typeof ref === 'string') {
      const tpl = SEA_HOLE_RINGS[ref];
      if (!tpl) return;
      id = ref;
      name = tpl.name;
      ring = tpl.ring;
    } else if (ref && typeof ref === 'object' && Array.isArray(ref.ring)) {
      id = ref.id || `hole-${idx}`;
      name = ref.name || id;
      ring = ref.ring;
    } else {
      return;
    }
    const fit = fitHoleInsideRing(ring, outerRing);
    if (!fit) return;
    out.push({ id, name, ring: fit.ring, fitScale: fit.scale });
  });
  return out;
}
