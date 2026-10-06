/**
 * Day 20 / PR F slice 1 — schematic ring morphing between overlay keyframes.
 * Day 21 — denser non-rect keyframes (data) + smoothstep lifespan edge fades.
 * Day 22 — higher base opacity + softer fade-in for newly appearing colony fragments.
 * Day 32 (PR F slice 4) — ocean gaps: regions may carry `holes` (inner rings, planar-CCW)
 *   that morph alongside the outer ring; eased (smoothstep) keyframe interpolation.
 * Resample → lerp lng/lat (antimeridian-aware). Unmatched regions fade via scale-to-centroid.
 */

import {
  ensureHoleWinding,
  fitHoleInsideRing,
  holeCentroid,
  ringInsideRing,
  scaleRingAbout,
} from './globe-holes.js';

/** Vertex count for morph correspondence (closed ring stores N+1 with repeat). */
export const MORPH_RING_SAMPLES = 48;

/**
 * Signed area of a closed ring (positive ⇒ counter-clockwise in lng/lat plane).
 * @param {[number, number][]} ring
 */
export function ringSignedArea(ring) {
  if (!ring || ring.length < 4) return 0;
  let a = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return a / 2;
}

/**
 * Globe.gl / three-globe spherical caps expect **clockwise** lng/lat exteriors
 * (all authored REGION_RINGS are CW). Planar-CCW rings (e.g. bboxToRing) fill
 * the complement → planet-wide colour wash. Force CW before render.
 * @param {[number, number][]} ring
 * @returns {[number, number][]|null}
 */
export function ensureClockwise(ring) {
  if (!ring || ring.length < 4) return null;
  const closed = ring.slice();
  const [fLng, fLat] = closed[0];
  const [lLng, lLat] = closed[closed.length - 1];
  if (fLng !== lLng || fLat !== lLat) closed.push([fLng, fLat]);
  if (ringSignedArea(closed) <= 0) return closed; // already CW or zero
  const open = closed.slice(0, -1).reverse();
  open.push([open[0][0], open[0][1]]);
  return open;
}

/** @deprecated use ensureClockwise — kept as alias during Day 20 fix */
export function ensureCounterClockwise(ring) {
  return ensureClockwise(ring);
}

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
  return ensureClockwise(out);
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
  return ensureClockwise(open);
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
/**
 * Lerp two closed rings. Prefer corner lerp for simple quads (bboxes) —
 * dense perimeter resampling was producing Globe.gl complement fills (planet wash).
 */
export function lerpRings(ringA, ringB, t, samples = MORPH_RING_SAMPLES) {
  const tt = Math.max(0, Math.min(1, t));
  if (tt <= 0.001) return ensureClockwise(ringA);
  if (tt >= 0.999) return ensureClockwise(ringB);

  const openA = (ringA || []).slice(0, -1);
  const openB = (ringB || []).slice(0, -1);
  // Simple quad / bbox path: lerp the 4 corners in order (after CW normalize)
  const aCw = ensureClockwise(ringA);
  const bCw = ensureClockwise(ringB);
  if (aCw && bCw && aCw.length === 5 && bCw.length === 5) {
    const out = [];
    for (let i = 0; i < 4; i += 1) {
      out.push([
        lerpLng(aCw[i][0], bCw[i][0], tt),
        aCw[i][1] + (bCw[i][1] - aCw[i][1]) * tt,
      ]);
    }
    out.push([out[0][0], out[0][1]]);
    return ensureClockwise(out);
  }

  const a = resampleRing(ringA, samples);
  const b = resampleRing(ringB, samples);
  if (!a || !b) return ensureClockwise(a || b);
  const out = [];
  for (let i = 0; i < samples; i += 1) {
    out.push([
      lerpLng(a[i][0], b[i][0], tt),
      a[i][1] + (b[i][1] - a[i][1]) * tt,
    ]);
  }
  out.push([out[0][0], out[0][1]]);
  return ensureClockwise(out);
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

/** Smoothstep (Hermite) — gentler appear/disappear than linear ramps. */
export function smoothstep01(t) {
  const x = Math.max(0, Math.min(1, Number(t)));
  return x * x * (3 - 2 * x);
}

/**
 * Soft lifespan edge factor in [0,1] — fades across `grace` years at start/end.
 * Day 21: smoothstep easing so cast pops are less abrupt than linear ramps.
 * @param {number} year
 * @param {{ start: number, end: number }} lifespan
 * @param {number} grace
 */
export function lifespanEdgeFactor(year, lifespan, grace) {
  const g = Math.max(1, Number(grace) || 20);
  const { start, end } = lifespan;
  if (!(Number.isFinite(start) && Number.isFinite(end))) return 1;
  if (year < start || year > end) return 0;
  let f = 1;
  if (year < start + g) f = Math.min(f, smoothstep01((year - start) / g));
  if (year > end - g) f = Math.min(f, smoothstep01((end - year) / g));
  return Math.max(0, Math.min(1, f));
}

/**
 * Day 32 — ease the keyframe interpolation parameter so borders accelerate out of a
 * keyframe and settle into the next one (instead of a constant-speed linear slide).
 * Smoothstep: f(0)=0, f(0.5)=0.5, f(1)=1, monotonic, zero slope at both ends. O(1).
 */
export const MORPH_EASING = 'smoothstep';
export function easeMorphT(t) {
  return smoothstep01(t);
}

/** Apply the same about-centre scale used on an outer ring to its holes (keeps containment). */
function scaleHolesWithOuter(holes, center, f) {
  return holes.map((h) => ({ ...h, ring: ensureHoleWinding(scaleRingAbout(h.ring, center, f)) }));
}

/**
 * Morph holes between two keyframes. Matching ids lerp (resampled, antimeridian-aware);
 * one-sided holes grow from / shrink to their own centroid. Every result is re-fitted
 * inside `outer` (shrunk toward its centroid) or dropped, so a hole never pokes out.
 * @param {{ id: string, name: string, ring: [number,number][] }[]} holesA
 * @param {{ id: string, name: string, ring: [number,number][] }[]} holesB
 * @param {number} te eased t in [0,1]
 * @param {[number,number][]} outer morphed exterior ring
 */
export function morphHoles(holesA, holesB, te, outer) {
  const mapA = new Map((holesA || []).map((h) => [h.id, h]));
  const mapB = new Map((holesB || []).map((h) => [h.id, h]));
  const ids = new Set([...mapA.keys(), ...mapB.keys()]);
  const out = [];
  for (const id of ids) {
    const a = mapA.get(id);
    const b = mapB.get(id);
    let ring = null;
    if (a && b) {
      const same =
        a.ring.length === b.ring.length &&
        a.ring.every((p, i) => p[0] === b.ring[i][0] && p[1] === b.ring[i][1]);
      if (same || te <= 0.001) ring = a.ring;
      else if (te >= 0.999) ring = b.ring;
      else if (a.ring.length === b.ring.length) {
        // Same template at different fit scales → vertex-wise lerp keeps correspondence exact.
        ring = a.ring.map((p, i) => [lerpLng(p[0], b.ring[i][0], te), p[1] + (b.ring[i][1] - p[1]) * te]);
      } else {
        ring = lerpRings(a.ring, b.ring, te);
      }
    } else {
      const src = a || b;
      const f = a ? 1 - te : te; // fade out (prev only) / fade in (next only)
      if (f < 0.05) continue;
      ring = scaleRingAbout(src.ring, holeCentroid(src.ring), f);
    }
    ring = ensureHoleWinding(ring);
    if (!ring) continue;
    if (!ringInsideRing(ring, outer)) {
      const fit = fitHoleInsideRing(ring, outer);
      if (!fit) continue;
      ring = fit.ring;
    }
    out.push({ id, name: (b || a).name, ring });
  }
  return out;
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
 * @param {(region: any, outerRing: [number,number][]) => { id: string, name: string, ring: [number,number][] }[]} [resolveHoles]
 *   Day 32: optional inner-ring resolver (ocean gaps). Omit → no holes.
 * @returns {{ regionId: string, regionName: string, ring: [number,number][], holes: { id: string, name: string, ring: [number,number][] }[], opacity: number, morphT: number, rawT: number, approximation: string }[]}
 */
export function morphEntityAtYear(entity, year, resolveRing, lifespan, edgeGrace, resolveHoles = null) {
  const edge = lifespanEdgeFactor(year, lifespan, edgeGrace);
  if (edge <= 0) return [];

  const { prev, next, t: rawT } = findBracketingOverlays(entity.overlays || [], year);
  if (!prev && !next) return [];
  // Day 32: eased interpolation parameter (smoothstep). Fades below already used
  // smoothstep01(t), so they read identically; ring lerps now ease too.
  const t = easeMorphT(rawT);

  const approximation = (rawT < 0.5 ? prev : next)?.approximation || prev?.approximation || 'schematic';
  const baseOpacity = 0.43;

  /** @type {Map<string, { name: string, ring: [number,number][], holes: object[] }>} */
  const prevMap = new Map();
  /** @type {Map<string, { name: string, ring: [number,number][], holes: object[] }>} */
  const nextMap = new Map();

  const holesFor = (region, ring) =>
    typeof resolveHoles === 'function' && ring ? resolveHoles(region, ring) || [] : [];
  for (const region of prev?.regions || []) {
    const meta = regionMeta(region);
    const ring = resolveRing(region);
    if (ring && meta.id) prevMap.set(meta.id, { name: meta.name, ring, holes: holesFor(region, ring) });
  }
  for (const region of next?.regions || []) {
    const meta = regionMeta(region);
    const ring = resolveRing(region);
    if (ring && meta.id) nextMap.set(meta.id, { name: meta.name, ring, holes: holesFor(region, ring) });
  }

  const ids = new Set([...prevMap.keys(), ...nextMap.keys()]);
  const out = [];

  for (const id of ids) {
    const a = prevMap.get(id);
    const b = nextMap.get(id);
    let ring = null;
    let holes = [];
    let regionOpacity = baseOpacity;

    if (a && b) {
      // Identical geometry (shared REGION_RINGS) — no morph, avoid resample artifacts
      const same =
        a.ring.length === b.ring.length &&
        a.ring.every((p, i) => p[0] === b.ring[i][0] && p[1] === b.ring[i][1]);
      ring = same ? ensureClockwise(a.ring) : lerpRings(a.ring, b.ring, t);
      if (ring) holes = morphHoles(a.holes, b.holes, t, ring);
    } else if (b && !a) {
      // Fade in: grow from small toward full as t → 1 (no dense resample).
      // Day 22: smoothstep so distant colony fragments ease in softer than linear.
      const fadeIn = smoothstep01(t);
      const bCw = ensureClockwise(b.ring);
      const f = Math.max(0.12, 0.15 + 0.85 * fadeIn);
      ring = scaleRingTowardCentroid(bCw, f);
      if (bCw && b.holes.length) holes = scaleHolesWithOuter(b.holes, ringCentroid(bCw), f);
      regionOpacity = baseOpacity * Math.max(0.15, fadeIn);
    } else if (a && !b) {
      // Fade out: shrink as t → 1 (smoothstep soften)
      const fadeOut = smoothstep01(1 - t);
      const aCw = ensureClockwise(a.ring);
      const f = Math.max(0.12, 0.15 + 0.85 * fadeOut);
      ring = scaleRingTowardCentroid(aCw, f);
      if (aCw && a.holes.length) holes = scaleHolesWithOuter(a.holes, ringCentroid(aCw), f);
      regionOpacity = baseOpacity * Math.max(0.15, fadeOut);
    }

    if (!ring) continue;

    // Soft dissolve near lifespan edges (shrink + fade) — Day 21: gentler shrink floor
    const edgeScale = 0.4 + 0.6 * edge;
    if (edge < 0.999) {
      // Holes scale about the *outer* centroid with the same factor so they stay inside.
      if (holes.length) holes = scaleHolesWithOuter(holes, ringCentroid(ring), edgeScale);
      ring = scaleRingTowardCentroid(ring, edgeScale);
    }
    regionOpacity *= edge;

    const safeRing = ensureClockwise(ring);
    if (!safeRing) continue;
    out.push({
      regionId: id,
      regionName: (b || a).name,
      ring: safeRing,
      holes: holes.filter((h) => h && h.ring && h.ring.length >= 4),
      opacity: regionOpacity,
      morphT: t,
      rawT,
      approximation,
    });
  }

  return out;
}
