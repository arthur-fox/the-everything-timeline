/**
 * Day 20 / PR F slice 1 — schematic ring morphing between overlay keyframes.
 * Resample → lerp lng/lat (antimeridian-aware). Unmatched regions fade via scale-to-centroid.
 */

/** Vertex count for morph correspondence (closed ring stores N+1 with repeat). */
export const MORPH_RING_SAMPLES = 48;

/**
 * Cumulative perimeter lengths for open polyline (no closing edge).
 * @param {[number, number][]} pts
 */
function cumulativeLengths(pts) {
  const lens = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    total += Math.hypot(dx, dy);
    lens.push(total);
  }
  return { lens, total };
}

/**
 * Resample a closed [lng,lat] ring to `sampleCount` open vertices, then close.
 * @param {[number, number][]} ring
 * @param {number} [sampleCount]
 * @returns {[number, number][]|null}
 */
export function resampleRing(ring, sampleCount = MORPH_RING_SAMPLES) {
  if (!ring || ring.length < 4 || sampleCount < 3) return null;
  const open = ring.slice(0, -1).map(([lng, lat]) => [Number(lng), Number(lat)]);
  if (open.length < 3) return null;
  // Ensure we include the closing edge for perimeter sampling
  const loop = open.concat([open[0]]);
  const { lens, total } = cumulativeLengths(loop);
  if (!(total > 0)) return null;

  const out = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const target = (i / sampleCount) * total;
    let j = 1;
    while (j < lens.length && lens[j] < target) j += 1;
    const a = loop[j - 1];
    const b = loop[j] || loop[loop.length - 1];
    const segStart = lens[j - 1];
    const segLen = (lens[j] ?? total) - segStart;
    const u = segLen > 0 ? (target - segStart) / segLen : 0;
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  out.push([out[0][0], out[0][1]]);
  return out;
}

/** @param {[number, number][]} ring */
export function ringCentroid(ring) {
  const open = ring.slice(0, -1);
  let sx = 0;
  let sy = 0;
  for (const [lng, lat] of open) {
    sx += lng;
    sy += lat;
  }
  const n = open.length || 1;
  return [sx / n, sy / n];
}

/**
 * Scale ring toward centroid (factor 0 → point, 1 → full).
 * @param {[number, number][]} ring
 * @param {number} factor
 */
export function scaleRingTowardCentroid(ring, factor) {
  const f = Math.max(0, Math.min(1, Number(factor)));
  const [cx, cy] = ringCentroid(ring);
  const open = ring.slice(0, -1).map(([lng, lat]) => [
    cx + (lng - cx) * f,
    cy + (lat - cy) * f,
  ]);
  if (!open.length) return null;
  open.push([open[0][0], open[0][1]]);
  return open;
}

/** Shortest-path lerp for longitude across ±180. */
export function lerpLng(a, b, t) {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  let out = a + d * t;
  if (out > 180) out -= 360;
  if (out < -180) out += 360;
  return out;
}

/**
 * Lerp two closed rings (same vertex count preferred; resamples if needed).
 * @param {[number, number][]} ringA
 * @param {[number, number][]} ringB
 * @param {number} t
 * @param {number} [samples]
 */
export function lerpRings(ringA, ringB, t, samples = MORPH_RING_SAMPLES) {
  const a = resampleRing(ringA, samples);
  const b = resampleRing(ringB, samples);
  if (!a || !b) return a || b;
  const tt = Math.max(0, Math.min(1, t));
  const out = [];
  for (let i = 0; i < samples; i += 1) {
    out.push([
      lerpLng(a[i][0], b[i][0], tt),
      a[i][1] + (b[i][1] - a[i][1]) * tt,
    ]);
  }
  out.push([out[0][0], out[0][1]]);
  return out;
}

/**
 * Find prev/next overlay snapshots bracketing `year` (overlays sorted ascending).
 * @param {{ year: number }[]} overlays
 * @param {number} year
 * @returns {{ prev: object|null, next: object|null, t: number }}
 */
export function findBracketingOverlays(overlays, year) {
  const list = (overlays || [])
    .filter((o) => Number.isFinite(o?.year))
    .slice()
    .sort((a, b) => a.year - b.year);
  if (!list.length) return { prev: null, next: null, t: 0 };
  if (year <= list[0].year) return { prev: list[0], next: list[0], t: 0 };
  if (year >= list[list.length - 1].year) {
    const last = list[list.length - 1];
    return { prev: last, next: last, t: 1 };
  }
  for (let i = 0; i < list.length - 1; i += 1) {
    const a = list[i];
    const b = list[i + 1];
    if (year >= a.year && year <= b.year) {
      const span = b.year - a.year;
      const t = span > 0 ? (year - a.year) / span : 0;
      return { prev: a, next: b, t };
    }
  }
  const last = list[list.length - 1];
  return { prev: last, next: last, t: 1 };
}

/**
 * Soft lifespan edge factor in [0,1] — fades across `grace` years at start/end.
 * @param {number} year
 * @param {{ start: number, end: number }} lifespan
 * @param {number} grace
 */
export function lifespanEdgeFactor(year, lifespan, grace) {
  const g = Math.max(1, Number(grace) || 15);
  const { start, end } = lifespan;
  if (!(Number.isFinite(start) && Number.isFinite(end))) return 1;
  if (year < start || year > end) return 0;
  let f = 1;
  if (year < start + g) f = Math.min(f, (year - start) / g);
  if (year > end - g) f = Math.min(f, (end - year) / g);
  return Math.max(0, Math.min(1, f));
}

function regionMeta(region) {
  if (typeof region === 'string') return { id: region, name: region };
  return { id: region.id, name: region.name || region.id };
}

/**
 * Build morphing region geometries for one entity at `year`.
 * @param {object} entity
 * @param {number} year
 * @param {(region: any) => [number,number][]|null} resolveRing
 * @param {{ start: number, end: number }} lifespan
 * @param {number} edgeGrace
 * @returns {{ regionId: string, regionName: string, ring: [number,number][], opacity: number, morphT: number, approximation: string }[]}
 */
export function morphEntityAtYear(entity, year, resolveRing, lifespan, edgeGrace) {
  const edge = lifespanEdgeFactor(year, lifespan, edgeGrace);
  if (edge <= 0) return [];

  const { prev, next, t } = findBracketingOverlays(entity.overlays || [], year);
  if (!prev && !next) return [];

  const approximation = (t < 0.5 ? prev : next)?.approximation || prev?.approximation || 'schematic';
  const baseOpacity = 0.42;

  /** @type {Map<string, { name: string, ring: [number,number][] }>} */
  const prevMap = new Map();
  /** @type {Map<string, { name: string, ring: [number,number][] }>} */
  const nextMap = new Map();

  for (const region of prev?.regions || []) {
    const meta = regionMeta(region);
    const ring = resolveRing(region);
    if (ring && meta.id) prevMap.set(meta.id, { name: meta.name, ring });
  }
  for (const region of next?.regions || []) {
    const meta = regionMeta(region);
    const ring = resolveRing(region);
    if (ring && meta.id) nextMap.set(meta.id, { name: meta.name, ring });
  }

  const ids = new Set([...prevMap.keys(), ...nextMap.keys()]);
  const out = [];

  for (const id of ids) {
    const a = prevMap.get(id);
    const b = nextMap.get(id);
    let ring = null;
    let regionOpacity = baseOpacity;

    if (a && b) {
      ring = lerpRings(a.ring, b.ring, t);
    } else if (b && !a) {
      // Fade in: grow from small toward full as t → 1
      const grown = scaleRingTowardCentroid(resampleRing(b.ring), Math.max(0.08, t));
      ring = grown;
      regionOpacity = baseOpacity * Math.max(0.15, t);
    } else if (a && !b) {
      // Fade out: shrink as t → 1
      const shrink = scaleRingTowardCentroid(resampleRing(a.ring), Math.max(0.08, 1 - t));
      ring = shrink;
      regionOpacity = baseOpacity * Math.max(0.15, 1 - t);
    }

    if (!ring) continue;

    // Soft dissolve near lifespan edges (shrink + fade)
    const edgeScale = 0.55 + 0.45 * edge;
    if (edge < 0.999) {
      ring = scaleRingTowardCentroid(ring, edgeScale);
    }
    regionOpacity *= edge;

    out.push({
      regionId: id,
      regionName: (b || a).name,
      ring,
      opacity: regionOpacity,
      morphT: t,
      approximation,
    });
  }

  return out;
}
