/**
 * Day 42: label anchors. Pole of inaccessibility ("polylabel", the point inside a polygon
 * farthest from its edges) on a lng/lat polygon, plus a spherical-ish area, so a label sits
 * deep inside a country rather than at a centroid that can fall in the sea (Chile, Norway,
 * Croatia, the Ottoman Empire with its horseshoe round the Black Sea).
 *
 * Own implementation of the well-known cell-subdivision algorithm (Garcia-Castellanos &
 * Lombardo 2007; popularised by Mapbox's polylabel). Shared by scripts/build-*.mjs (build-time
 * anchors) and src/globe-labels.js (runtime anchors for the hand-drawn polities / peoples).
 */

const DEG = Math.PI / 180;
const EARTH_R_KM = 6371.0088;

/** Planar signed area of a [lng,lat] ring (degrees², sign = winding). */
function ringArea(ring) {
  let a = 0;
  for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
    a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return a / 2;
}

/** Approximate area (km²) of a polygon [outer, ...holes]: planar degrees² × cos(mean lat). */
export function polygonAreaKm2(rings) {
  if (!rings || !rings.length || !rings[0] || rings[0].length < 3) return 0;
  let lat = 0;
  for (const p of rings[0]) lat += p[1];
  lat /= rings[0].length;
  let a = Math.abs(ringArea(rings[0]));
  for (let h = 1; h < rings.length; h++) a -= Math.abs(ringArea(rings[h]));
  return Math.max(0, a) * Math.cos(lat * DEG) * (EARTH_R_KM * DEG) ** 2;
}

/** Polygons of a GeoJSON Polygon / MultiPolygon geometry as arrays of rings. */
export function geometryPolygons(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function unwrapRings(rings) {
  // Keep rings that cross the antimeridian continuous (lng may run past ±180).
  return rings.map((ring) => {
    const out = [];
    let prev = null;
    for (const [lng0, lat] of ring) {
      let lng = lng0;
      if (prev !== null) {
        while (lng - prev > 180) lng -= 360;
        while (lng - prev < -180) lng += 360;
      }
      out.push([lng, lat]);
      prev = lng;
    }
    return out;
  });
}

function segDistSq(px, py, a, b) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = px - x;
  dy = py - y;
  return dx * dx + dy * dy;
}

/** Signed distance from (x,y) to the polygon outline (negative outside). */
function pointToPolygonDist(x, y, rings) {
  let inside = false;
  let minSq = Infinity;
  for (const ring of rings) {
    for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
      const a = ring[i];
      const b = ring[j];
      if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
      minSq = Math.min(minSq, segDistSq(x, y, a, b));
    }
  }
  return (inside ? 1 : -1) * Math.sqrt(minSq);
}

/**
 * Pole of inaccessibility of one polygon ([outer, ...holes], lng/lat).
 * @returns {{ lng: number, lat: number, distKm: number }}
 */
export function polygonLabelPoint(rings0, precisionDeg = 0.05) {
  const rings = unwrapRings(rings0.filter((r) => r && r.length >= 3));
  if (!rings.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of rings[0]) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  // Work in a locally isotropic plane: x scaled by cos(mid lat).
  const k = Math.max(0.15, Math.cos(((minY + maxY) / 2) * DEG));
  const P = rings.map((r) => r.map(([x, y]) => [x * k, y]));
  const x0 = minX * k;
  const x1 = maxX * k;
  const w = x1 - x0;
  const h = maxY - minY;
  const size = Math.min(w, h);
  const toOut = (x, y, d) => {
    let lng = x / k;
    lng = ((((lng + 180) % 360) + 360) % 360) - 180;
    return { lng, lat: y, distKm: Math.max(0, d) * EARTH_R_KM * DEG };
  };
  if (size === 0) return toOut(x0, minY, 0);

  const cell = (x, y, half) => {
    const d = pointToPolygonDist(x, y, P);
    return { x, y, h: half, d, max: d + half * Math.SQRT2 };
  };
  // Seed with the planar centroid of the outer ring and the bbox centre.
  let best = cell(x0 + w / 2, minY + h / 2, 0);
  {
    let a = 0;
    let cx = 0;
    let cy = 0;
    const r = P[0];
    for (let i = 0, n = r.length, j = n - 1; i < n; j = i++) {
      const f = r[i][0] * r[j][1] - r[j][0] * r[i][1];
      cx += (r[i][0] + r[j][0]) * f;
      cy += (r[i][1] + r[j][1]) * f;
      a += f * 3;
    }
    if (a !== 0) {
      const c = cell(cx / a, cy / a, 0);
      if (c.d > best.d) best = c;
    }
  }
  const queue = [];
  const step = size;
  // Bound the initial grid (very elongated shapes like Chile).
  const half0 = step / 2;
  for (let x = x0; x < x1; x += step) for (let y = minY; y < maxY; y += step) queue.push(cell(x + half0, y + half0, half0));
  let guard = 0;
  while (queue.length && guard++ < 20000) {
    // Pop the most promising cell (small queues: linear scan is fine).
    let bi = 0;
    for (let i = 1; i < queue.length; i++) if (queue[i].max > queue[bi].max) bi = i;
    const c = queue[bi];
    queue[bi] = queue[queue.length - 1];
    queue.pop();
    if (c.d > best.d) best = c;
    if (c.max - best.d <= precisionDeg) continue;
    const hh = c.h / 2;
    queue.push(cell(c.x - hh, c.y - hh, hh), cell(c.x + hh, c.y - hh, hh), cell(c.x - hh, c.y + hh, hh), cell(c.x + hh, c.y + hh, hh));
  }
  return toOut(best.x, best.y, best.d);
}

/**
 * Label anchor for a Polygon / MultiPolygon: pole of inaccessibility of the largest part, and
 * the total area. `null` when the geometry is empty.
 * @returns {{ lng: number, lat: number, areaKm2: number, partKm2: number, distKm: number } | null}
 */
export function geometryLabelAnchor(geometry, precisionDeg = 0.05) {
  const polys = geometryPolygons(geometry);
  let total = 0;
  let best = null;
  let bestA = -1;
  for (const rings of polys) {
    const a = polygonAreaKm2(rings);
    total += a;
    if (a > bestA) {
      bestA = a;
      best = rings;
    }
  }
  if (!best) return null;
  const p = polygonLabelPoint(best, precisionDeg);
  if (!p) return null;
  return { lng: p.lng, lat: p.lat, areaKm2: total, partKm2: bestA, distKm: p.distKm };
}
