/**
 * Day 18–20 — sanity checks for globe overlay lifespan + morphing.
 */
import {
  getActiveOverlaysAtYear,
  getEntityLifespan,
  getOverlayPolygonFeatures,
  spatialEntities,
  OVERLAY_EDGE_GRACE,
} from '../src/globe-overlays.js';
import {
  lerpRings,
  MORPH_RING_SAMPLES,
  findBracketingOverlays,
} from '../src/globe-morph.js';

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`ok: ${msg}`);
  }
}

function idsAt(year) {
  return new Set(getActiveOverlaysAtYear(year).map((r) => r.entity.id));
}

assert(OVERLAY_EDGE_GRACE <= 20, `OVERLAY_EDGE_GRACE (${OVERLAY_EDGE_GRACE}) ≤ 20`);

const ott = spatialEntities.find((e) => e.id === 'ottoman-empire');
assert(!!ott, 'ottoman-empire entity exists');
const life = getEntityLifespan(ott);
assert(life.end <= 1922, `ottoman lifespan end ${life.end} ≤ civ end 1922`);
assert(life.end <= 1900 + OVERLAY_EDGE_GRACE, `ottoman end ≤ last overlay + grace`);

assert(idsAt(1900).has('ottoman-empire'), 'Ottoman ON at 1900');
assert(!idsAt(1925).has('ottoman-empire'), 'Ottoman OFF at 1925');
assert(!idsAt(1980).has('ottoman-empire'), 'Ottoman OFF at 1980');

assert(!idsAt(1980).has('qing-china'), 'Qing OFF at 1980');
assert(!idsAt(1980).has('russian-empire'), 'Russian OFF at 1980');
assert(!idsAt(1980).has('british-empire'), 'British OFF at 1980 (last keyframe 1900)');

assert(idsAt(1900).has('british-empire'), 'British ON at 1900');
assert(idsAt(1900).has('qing-china'), 'Qing ON at 1900');

assert(idsAt(-3000).has('mesopotamia'), 'Mesopotamia ON at −3000');
assert(idsAt(-3000).has('ancient-egypt'), 'Egypt ON at −3000');
assert(idsAt(-2500).size >= 2, `−2500 has ≥2 overlays (got ${idsAt(-2500).size})`);
assert(idsAt(-2000).size >= 2, `−2000 has ≥3 overlays (got ${idsAt(-2000).size})`);
assert(idsAt(-1500).size >= 4, `−1500 has ≥4 overlays (got ${idsAt(-1500).size})`);

assert(idsAt(-500).size >= 3, `−500 still has ≥3 overlays (got ${idsAt(-500).size})`);

// Day 20 morph
{
  const a = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
  const b = [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]];
  const mid = lerpRings(a, b, 0.5);
  assert(!!mid && mid.length === MORPH_RING_SAMPLES + 1, `lerp ring vertex count ${mid?.length}`);
  assert(Math.abs(mid[Math.floor(MORPH_RING_SAMPLES / 4)][0] - 15) < 0.01, 'lerp mid lng ~15');
}

{
  const br = findBracketingOverlays(ott.overlays, 1600);
  assert(br.prev?.year === 1520 && br.next?.year === 1683, 'Ottoman brackets 1520–1683 at 1600');
  assert(br.t > 0.4 && br.t < 0.6, `Ottoman t~0.5 at 1600 (got ${br.t})`);

  function totalBBoxArea(year) {
    return getOverlayPolygonFeatures(year)
      .filter((f) => f.entityId === 'ottoman-empire')
      .reduce((sum, f) => {
        const ring = f.geometry.coordinates[0];
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const [x, y] of ring) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
        return sum + (maxX - minX) * (maxY - minY);
      }, 0);
  }
  const a1520 = totalBBoxArea(1520);
  const a1600 = totalBBoxArea(1600);
  const a1683 = totalBBoxArea(1683);
  assert(a1600 > a1520, `Ottoman grows 1520→1600 (${a1520.toFixed(0)}→${a1600.toFixed(0)})`);
  assert(a1683 > a1600, `Ottoman grows 1600→1683 (${a1600.toFixed(0)}→${a1683.toFixed(0)})`);

  const fade = getOverlayPolygonFeatures(1910).filter((f) => f.entityId === 'ottoman-empire');
  assert(fade.length > 0 && fade.every((f) => f.opacity < 0.3), 'Ottoman soft-fades near lifespan end');
  assert(
    getOverlayPolygonFeatures(1980).every((f) => f.entityId !== 'ottoman-empire'),
    'Ottoman morph OFF at 1980',
  );
}


{
  const feats = getOverlayPolygonFeatures(1683);
  assert(feats.length > 0, '1683 has features');
  let bad = 0;
  for (const f of feats) {
    const ring = f.geometry.coordinates[0];
    let a = 0;
    for (let i = 0; i < ring.length - 1; i += 1) {
      a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    }
    if (a < 0) bad += 1;
  }
  assert(bad === 0, `all 1683 rings CCW (bad=${bad})`);
  // No planet-scale span — schematic empires stay regional
  for (const f of feats) {
    const ring = f.geometry.coordinates[0];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [x, y] of ring) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const span = Math.max(maxX - minX, maxY - minY);
    assert(span < 120, `${f.entityId}/${f.regionId} span ${span.toFixed(1)} < 120°`);
  }
}

if (failed) {
  console.error(`\n${failed} lifespan/morph check(s) failed`);
  process.exit(1);
}
console.log(`\nLifespan + morph checks passed (${spatialEntities.length} entities, grace=${OVERLAY_EDGE_GRACE}).`);
