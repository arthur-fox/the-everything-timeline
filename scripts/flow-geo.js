/**
 * Shared geometry for the flow checks (check-routes.js, check-migrations.js): is a point on land
 * (against the simplified nations TopoJSON), and the globe's own lat/lng interpolation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const topo = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/nations.topo.json'), 'utf8'));
const polys = [];
for (const g of topo.objects.shapes.geometries) {
  const geom = feature(topo, g).geometry;
  for (const rings of geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates) {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (const [x, y] of rings[0]) {
      a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y);
    }
    polys.push({ bbox: [a, b, c, d], rings });
  }
}
const inRings = (x, y, rings) => {
  let inside = false;
  for (const r of rings) for (let i = 0, n = r.length, j = n - 1; i < n; j = i++) {
    if (r[i][1] > y !== r[j][1] > y && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) inside = !inside;
  }
  return inside;
};
const TOL = 0.25; // degrees (~25 km)
function segDist(px, py, ax, ay, bx, by, k) {
  const ux = (bx - ax) * k, uy = by - ay, vx = (px - ax) * k, vy = py - ay;
  const L = ux * ux + uy * uy;
  const t = L ? Math.max(0, Math.min(1, (vx * ux + vy * uy) / L)) : 0;
  return Math.hypot(vx - t * ux, vy - t * uy);
}
export function landAt(lat, lng) {
  const k = Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  let near = false;
  for (const p of polys) {
    const [a, b, c, d] = p.bbox;
    if (lng < a - TOL / k || lng > c + TOL / k || lat < b - TOL || lat > d + TOL) continue;
    if (inRings(lng, lat, p.rings)) return 'in';
    if (!near) {
      for (const r of p.rings) {
        for (let i = 1; i < r.length && !near; i++) if (segDist(lng, lat, r[i - 1][0], r[i - 1][1], r[i][0], r[i][1], k) < TOL) near = true;
      }
    }
  }
  return near ? 'coast' : null;
}
/** The same linear lat/lng interpolation the globe uses (shortest way across the antimeridian). */
export function samplePath(points, stepDeg = 0.25) {
  const out = [];
  for (let i = 1; i < points.length; i++) {
    const [lat0, lng0raw] = points[i - 1];
    const [lat1, lng1] = points[i];
    let lng0 = lng0raw;
    while (Math.abs(lng0 - lng1) > 180) lng0 += lng0 < lng1 ? 360 : -360;
    const n = Math.max(1, Math.ceil(Math.hypot(lat1 - lat0, lng1 - lng0) / stepDeg));
    for (let s = i === 1 ? 0 : 1; s <= n; s++) {
      const t = s / n;
      let lng = lng0 + (lng1 - lng0) * t;
      lng = ((((lng + 180) % 360) + 360) % 360) - 180;
      out.push([lat0 + (lat1 - lat0) * t, lng]);
    }
  }
  return out;
}
export const kmBetween = ([a, b], [c, d]) => {
  const r = Math.PI / 180;
  const h = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
export const PORT_KM = 70;

/**
 * Land / sea check for one path. Land paths: every waypoint on land (or within ~25 km of the
 * coast). Sea paths: the line as drawn never crosses land, except the first / last PORT_KM and
 * legs marked `via`. Returns { error, samples }.
 */
export function checkPathTerrain(kind, p) {
  if (kind === 'land') {
    for (const pt of p.points) if (!landAt(pt[0], pt[1])) return { error: `waypoint ${pt} is not on land`, samples: 0 };
    return { error: null, samples: 0 };
  }
  if (p.via) return { error: null, samples: 0 };
  const first = p.points[0];
  const last = p.points[p.points.length - 1];
  let samples = 0;
  for (const s of samplePath(p.points)) {
    samples++;
    if (kmBetween(s, first) < PORT_KM || kmBetween(s, last) < PORT_KM) continue;
    if (landAt(s[0], s[1]) === 'in') return { error: `crosses land near ${s[0].toFixed(2)}, ${s[1].toFixed(2)}`, samples };
  }
  return { error: null, samples };
}
