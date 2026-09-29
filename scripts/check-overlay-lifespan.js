/**
 * Day 18–22 — sanity checks for globe overlay lifespan + morphing.
 * Day 21: denser hero keyframes + non-rect rings + softer edge fades.
 * Day 22: colony fragment/split + higher overlay opacity.
 */
import {
  getActiveOverlaysAtYear,
  getEntityLifespan,
  getOverlayPolygonFeatures,
  spatialEntities,
  OVERLAY_EDGE_GRACE,
  resolveRegionRing,
} from '../src/globe-overlays.js';
import {
  lerpRings,
  MORPH_RING_SAMPLES,
  findBracketingOverlays,
  lifespanEdgeFactor,
  smoothstep01,
  morphEntityAtYear,
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
assert(!idsAt(1980).has('british-empire'), 'British OFF at 1980 (last keyframe 1920)');

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
  // CW unit squares (Globe.gl winding)
  const a = [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]];
  const b = [[0, 0], [0, 20], [20, 20], [20, 0], [0, 0]];
  const mid = lerpRings(a, b, 0.5);
  assert(!!mid && mid.length >= 5, `lerp ring vertex count ${mid?.length}`);
  const xs = mid.slice(0, -1).map((p) => p[0]);
  const maxX = Math.max(...xs);
  assert(Math.abs(maxX - 15) < 0.05, `lerp mid extent maxX~15 (got ${maxX})`);
}

{
  // Day 21 denser keyframes: 1600 is now a snapshot (not mid-lerp between 1520–1683)
  assert(ott.overlays.some((o) => o.year === 1600), 'Ottoman has keyframe at 1600');
  const brAt = findBracketingOverlays(ott.overlays, 1600);
  assert(brAt.next?.year === 1600 && brAt.t === 1, 'Ottoman at 1600 lands on keyframe (t=1)');
  const brMid = findBracketingOverlays(ott.overlays, 1560);
  assert(brMid.prev?.year === 1520 && brMid.next?.year === 1600, 'Ottoman brackets 1520–1600 at 1560');
  assert(brMid.t > 0.4 && brMid.t < 0.6, `Ottoman t~0.5 at 1560 (got ${brMid.t})`);

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
    // Globe.gl: clockwise exteriors (negative planar signed area)
    if (a > 0) bad += 1;
  }
  assert(bad === 0, `all 1683 rings CW for Globe.gl (bad CCW=${bad})`);
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


// Day 21 — denser non-rect hero keyframes + soft edge
{
  assert(Math.abs(smoothstep01(0) - 0) < 1e-9, 'smoothstep(0)=0');
  assert(Math.abs(smoothstep01(1) - 1) < 1e-9, 'smoothstep(1)=1');
  assert(smoothstep01(0.5) > 0.49 && smoothstep01(0.5) < 0.51, 'smoothstep(0.5)~0.5');
  // Mid-ramp is gentler than linear near the tips (derivative 0 at 0/1)
  assert(smoothstep01(0.1) < 0.1, `smoothstep(0.1)=${smoothstep01(0.1)} < 0.1 (soft tip)`);

  const heroes = ['ottoman-empire', 'roman-empire', 'mongol-empire', 'british-empire'];
  for (const id of heroes) {
    const ent = spatialEntities.find((e) => e.id === id);
    assert(!!ent, `${id} exists`);
    assert((ent.overlays || []).length >= 4, `${id} has ≥4 overlay keyframes (got ${ent.overlays?.length})`);

    let nonRect = 0;
    for (const ov of ent.overlays || []) {
      for (const region of ov.regions || []) {
        if (typeof region !== 'object') continue;
        const ring = resolveRegionRing(region);
        if (!ring) continue;
        const verts = ring.length - 1; // open count
        if (verts > 4) nonRect += 1;
      }
    }
    assert(nonRect >= 3, `${id} has ≥3 non-rect rings (got ${nonRect})`);
  }

  // Ottoman core morph deforms (not only scales): mid ring between 1520–1600 differs in vertex path
  const ott = spatialEntities.find((e) => e.id === 'ottoman-empire');
  const o1520 = ott.overlays.find((o) => o.year === 1520);
  const o1600 = ott.overlays.find((o) => o.year === 1600);
  const rA = resolveRegionRing(o1520.regions.find((r) => r.id === 'anatolia-balkans'));
  const rB = resolveRegionRing(o1600.regions.find((r) => r.id === 'anatolia-balkans'));
  assert(rA && rB && rA.length > 5 && rB.length > 5, 'Ottoman anatolia-balkans rings are multi-vertex');
  const mid = lerpRings(rA, rB, 0.5);
  assert(!!mid && mid.length > 5, 'Ottoman mid morph ring is dense (not 4-corner bbox)');

  // Soft edge: near lifespan start, factor is between 0 and 1 (not a hard pop)
  const life = getEntityLifespan(ott);
  const nearStart = life.start + Math.max(2, Math.floor(OVERLAY_EDGE_GRACE * 0.25));
  const edge = lifespanEdgeFactor(nearStart, life, OVERLAY_EDGE_GRACE);
  assert(edge > 0 && edge < 1, `Ottoman edge factor soft at ${nearStart} (got ${edge})`);
}


// Day 22 — colony fragment/split + opacity bump
{
  const brit = spatialEntities.find((e) => e.id === 'british-empire');
  const parts1850 = morphEntityAtYear(brit, 1850, resolveRegionRing, getEntityLifespan(brit), OVERLAY_EDGE_GRACE);
  assert(parts1850.length > 0, 'British morphs at 1850');
  const maxOp = Math.max(...parts1850.map((p) => p.opacity));
  assert(maxOp >= 0.40 && maxOp <= 0.50, `British base opacity ~0.42–0.45 (got max ${maxOp.toFixed(3)})`);

  function regionIds(entityId, year) {
    return getOverlayPolygonFeatures(year)
      .filter((f) => f.entityId === entityId)
      .map((f) => f.regionId);
  }
  function assertNoOceanSpan(entityId, year, maxSpan = 55) {
    const feats = getOverlayPolygonFeatures(year).filter((f) => f.entityId === entityId);
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
      assert(
        span < maxSpan,
        `${entityId}@${year} ${f.regionId} span ${span.toFixed(1)} < ${maxSpan}° (no ocean-spanning blob)`,
      );
    }
  }

  const b1850 = regionIds('british-empire', 1850);
  for (const id of ['british-isles', 'india-north', 'australia-east', 'south-africa', 'canada-east', 'caribbean']) {
    assert(b1850.includes(id), `British 1850 has fragment ${id}`);
  }
  assert(new Set(b1850).size >= 6, `British 1850 has ≥6 region ids (got ${new Set(b1850).size})`);
  assertNoOceanSpan('british-empire', 1850, 55);
  assertNoOceanSpan('british-empire', 1920, 55);
  const b1920 = regionIds('british-empire', 1920);
  assert(new Set(b1920).size >= 7, `British 1920 stays fragmented (≥7 ids, got ${new Set(b1920).size})`);

  const sp = spatialEntities.find((e) => e.id === 'spanish-empire');
  assert((sp.overlays || []).length >= 4, `Spanish has ≥4 keyframes (got ${sp.overlays?.length})`);
  assert(sp.overlays.some((o) => o.year === 1550), 'Spanish has 1550 keyframe');
  assert(sp.overlays.some((o) => o.year === 1800), 'Spanish has 1800 contraction keyframe');
  const s1550 = regionIds('spanish-empire', 1550);
  for (const id of ['iberia', 'new-spain', 'andes', 'caribbean', 'philippines']) {
    assert(s1550.includes(id), `Spanish 1550 has fragment ${id}`);
  }
  assertNoOceanSpan('spanish-empire', 1550, 55);
  assertNoOceanSpan('spanish-empire', 1700, 55);

  const pt = spatialEntities.find((e) => e.id === 'portuguese-empire');
  assert((pt.overlays || []).length >= 3, `Portuguese has ≥3 keyframes (got ${pt.overlays?.length})`);
  const p1700 = regionIds('portuguese-empire', 1700);
  for (const id of ['iberia', 'brazil-coast', 'west-africa-coast', 'goa-fringe']) {
    assert(p1700.includes(id), `Portuguese 1700 has fragment ${id}`);
  }
  assertNoOceanSpan('portuguese-empire', 1700, 55);

  assertNoOceanSpan('dutch-republic', 1700, 55);
  assertNoOceanSpan('french-colonial', 1700, 55);
  assertNoOceanSpan('french-colonial', 1914, 55);
  const fr1700 = regionIds('french-colonial', 1700);
  assert(
    fr1700.includes('canada-east') && fr1700.includes('frankish-west'),
    'French 1700 keeps metro + New France separate',
  );

  const midAus = morphEntityAtYear(brit, 1740, resolveRegionRing, getEntityLifespan(brit), OVERLAY_EDGE_GRACE);
  const aus = midAus.find((p) => p.regionId === 'australia-east');
  assert(!!aus, 'British australia foothold fades in before 1780');
  assert(aus.opacity < maxOp * 0.95, `fade-in australia opacity ${aus.opacity.toFixed(3)} < full ${maxOp.toFixed(3)}`);
}

if (failed) {
  console.error(`\n${failed} lifespan/morph check(s) failed`);
  process.exit(1);
}
console.log(`\nLifespan + morph checks passed (${spatialEntities.length} entities, grace=${OVERLAY_EDGE_GRACE}).`);
