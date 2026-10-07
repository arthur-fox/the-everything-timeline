/**
 * Day 18–22 — sanity checks for globe overlay lifespan + morphing.
 * Day 21: denser hero keyframes + non-rect rings + softer edge fades.
 * Day 22: colony fragment/split + higher overlay opacity.
 * Day 23: denser overlay coverage — rise→peak→decline for thin empires.
 * Day 24: densify remaining 2-keyframe notables to ≥3 overlays.
 * Day 25: every timeline civilisation has ≥1 overlay entity; 27 new polity fills.
 * Day 27: first people pack (human-atlas layer 2) — type people overlays + layer filter.
 * Day 28: second people pack — global ethnolinguistic coverage (~20 people total).
 */
import {
  getActiveOverlaysAtYear,
  getEntityLifespan,
  getOverlayPolygonFeatures,
  spatialEntities,
  peopleEntities,
  PEOPLE_PACK_IDS,
  setOverlayLayerFilter,
  entitiesForLayer,
  OVERLAY_EDGE_GRACE,
  resolveRegionRing,
} from '../src/globe-overlays.js';
import { civilisations } from '../src/civilisations.js';
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


// Day 23 — denser overlay coverage (Aztec/Inca + former peak-only empires)
{
  const aztec = spatialEntities.find((e) => e.id === 'aztec-empire');
  const inca = spatialEntities.find((e) => e.id === 'inca-empire');
  assert(!!aztec && (aztec.overlays || []).length >= 3, `Aztec has ≥3 overlays (got ${aztec?.overlays?.length})`);
  assert(!!inca && (inca.overlays || []).length >= 3, `Inca has ≥3 overlays (got ${inca?.overlays?.length})`);
  assert(aztec.overlays.some((o) => o.year === 1428), 'Aztec has 1428 Triple Alliance keyframe');
  assert(aztec.overlays.some((o) => o.year === 1519), 'Aztec keeps 1519 peak');
  assert(inca.overlays.some((o) => o.year === 1438), 'Inca has 1438 Pachacuti keyframe');
  assert(inca.overlays.some((o) => o.year === 1527), 'Inca keeps 1527 late extent');

  assert(idsAt(1470).has('aztec-empire'), 'Aztec ON at 1470 (before Spanish contact)');
  assert(idsAt(1470).has('inca-empire'), 'Inca ON at 1470 (before Spanish contact)');
  assert(idsAt(1519).has('aztec-empire'), 'Aztec ON at 1519');

  const densified = [
    'aztec-empire', 'inca-empire', 'kushan-empire', 'maurya-empire', 'gupta-empire',
    'frankish-empire', 'tang-china', 'mali-empire', 'khmer-empire', 'delhi-sultanate',
    'achaemenid-empire', 'classical-greece', 'umayyad-caliphate', 'safavid-empire',
    'songhai-empire', 'majapahit-empire',
  ];
  for (const id of densified) {
    const ent = spatialEntities.find((e) => e.id === id);
    assert(!!ent, `${id} exists`);
    assert((ent.overlays || []).length >= 3, `${id} densified to ≥3 overlays (got ${ent.overlays?.length})`);
  }

  // Inca spine fragments: separate region ids along Andes at late extent
  const incaLate = inca.overlays.find((o) => o.year === 1527);
  const incaIds = (incaLate?.regions || []).map((r) => (typeof r === 'string' ? r : r.id));
  for (const rid of ['peru', 'andes-north', 'andes-south']) {
    assert(incaIds.includes(rid), `Inca 1527 has spine fragment ${rid}`);
  }

  // Soft warn: entities still under 3 overlays (data backlog; not a hard fail)
  const thin = spatialEntities.filter((e) => (e.overlays || []).length < 3);
  if (thin.length) {
    console.log(
      `note: ${thin.length} entit${thin.length === 1 ? 'y' : 'ies'} still have <3 overlays: ` +
        thin.map((e) => `${e.id}(${e.overlays.length})`).join(', '),
    );
  }

  // No single-keyframe empires left after Day 23 pass
  const singles = spatialEntities.filter((e) => (e.overlays || []).length === 1);
  assert(singles.length === 0, `no single-keyframe entities remain (got ${singles.map((e) => e.id).join(', ')})`);
}


// Day 24 — densify remaining 2-keyframe notables (Day 23 backlog)
{
  const day24 = [
    'ming-china', 'qing-china', 'mughal-empire', 'abbasid-caliphate', 'song-china',
    'sassanid-empire', 'parthian-empire', 'holy-roman-empire', 'carthage',
    'dutch-republic', 'french-colonial', 'meiji-japan', 'shang-china',
    'phoenicia', 'olmec', 'kush',
  ];
  for (const id of day24) {
    const ent = spatialEntities.find((e) => e.id === id);
    assert(!!ent, `${id} exists`);
    assert((ent.overlays || []).length >= 3, `${id} densified to ≥3 overlays (got ${ent.overlays?.length})`);
  }

  // Spot-check rise / mid / late years for a few notables
  const ming = spatialEntities.find((e) => e.id === 'ming-china');
  assert(ming.overlays.some((o) => o.year === 1380), 'Ming has 1380 early consolidation');
  assert(ming.overlays.some((o) => o.year === 1420), 'Ming keeps 1420 Yongle-era');
  assert(ming.overlays.some((o) => o.year === 1550), 'Ming keeps 1550 mid–late');

  const qing = spatialEntities.find((e) => e.id === 'qing-china');
  assert(qing.overlays.some((o) => o.year === 1680), 'Qing has 1680 early Kangxi-era');
  assert(qing.overlays.some((o) => o.year === 1750), 'Qing keeps 1750 High Qing');
  assert(idsAt(1700).has('qing-china'), 'Qing ON at 1700 (between early and High Qing)');

  const mughal = spatialEntities.find((e) => e.id === 'mughal-empire');
  assert(mughal.overlays.some((o) => o.year === 1560), 'Mughal has 1560 Akbar rise');
  assert(idsAt(1580).has('mughal-empire'), 'Mughal ON at 1580');

  const abbasid = spatialEntities.find((e) => e.id === 'abbasid-caliphate');
  assert(abbasid.overlays.some((o) => o.year === 760), 'Abbasid has 760 early Baghdad era');
  assert(idsAt(780).has('abbasid-caliphate'), 'Abbasid ON at 780');

  const french = spatialEntities.find((e) => e.id === 'french-colonial');
  assert(french.overlays.some((o) => o.year === 1830), 'French has 1830 mid colonial keyframe');
  assertNoOceanSpanLocal('french-colonial', 1830, 55);
  assertNoOceanSpanLocal('dutch-republic', 1600, 55);
  assertNoOceanSpanLocal('meiji-japan', 1905, 55);

  // Soft warn only if anything somehow still under 3 (should be empty after Day 24)
  const thin = spatialEntities.filter((e) => (e.overlays || []).length < 3);
  if (thin.length) {
    console.log(
      `note: ${thin.length} entit${thin.length === 1 ? 'y' : 'ies'} still have <3 overlays: ` +
        thin.map((e) => `${e.id}(${e.overlays.length})`).join(', '),
    );
  } else {
    console.log('ok: no entities remain under 3 overlay keyframes');
  }

  function assertNoOceanSpanLocal(entityId, year, maxSpan = 55) {
    const feats = getOverlayPolygonFeatures(year).filter((f) => f.entityId === entityId);
    for (const f of feats) {
      const ring = f.geometry.coordinates[0];
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const [x, y] of ring) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      const span = Math.max(maxX - minX, maxY - minY);
      assert(
        span < maxSpan,
        `${entityId}@${year} ${f.regionId} span ${span.toFixed(1)} < ${maxSpan}° (no ocean-spanning blob)`,
      );
    }
  }
}


// Day 25 — every timeline civilisation linked; 27 missing polity fills
{
  const linked = new Set();
  for (const e of spatialEntities) {
    for (const id of e.timelineItemIds || []) linked.add(id);
  }
  const missing = civilisations.filter((c) => !linked.has(c.id)).map((c) => c.id);
  assert(missing.length === 0, `every timeline civ has ≥1 overlay link (missing: ${missing.join(', ') || 'none'})`);

  const day25 = [
    'zhou-china', 'seleucid-empire', 'qin-china', 'axum', 'ghana-empire-ov', 'chola-empire',
    'srivijaya', 'venice', 'heian-japan', 'viking-age', 'mississippian', 'kievan-rus',
    'toltec', 'goryeo', 'khwarezmia', 'great-zimbabwe', 'kamakura-muromachi', 'ethiopian-empire',
    'timurid', 'kongo', 'joseon', 'colonial-americas', 'tokugawa', 'maratha-empire',
    'sikh-empire', 'zulu', 'austro-hungarian',
  ];
  const expectedLinks = {
    'zhou-china': 'ancient-china-zhou',
    'seleucid-empire': 'seleucid',
    'qin-china': 'qin-dynasty',
    'axum': 'axum',
    'ghana-empire-ov': 'ghana-empire',
    'chola-empire': 'chola',
    'srivijaya': 'srivijaya',
    'venice': 'venice',
    'heian-japan': 'heian-japan',
    'viking-age': 'viking-age',
    'mississippian': 'mississippian',
    'kievan-rus': 'kievan-rus',
    'toltec': 'toltec',
    'goryeo': 'goryeo',
    'khwarezmia': 'khwarezmia',
    'great-zimbabwe': 'great-zimbabwe',
    'kamakura-muromachi': 'kamakura-muromachi',
    'ethiopian-empire': 'ethiopian-empire',
    'timurid': 'timurid',
    'kongo': 'kongo',
    'joseon': 'joseon',
    'colonial-americas': 'colonial-americas',
    'tokugawa': 'tokugawa',
    'maratha-empire': 'maratha',
    'sikh-empire': 'sikh-empire',
    'zulu': 'zulu',
    'austro-hungarian': 'austro-hungarian',
  };
  for (const id of day25) {
    const ent = spatialEntities.find((e) => e.id === id);
    assert(!!ent, `Day 25 entity ${id} exists`);
    assert((ent.overlays || []).length >= 3, `${id} has ≥3 overlays (got ${ent.overlays?.length})`);
    assert(
      (ent.timelineItemIds || []).includes(expectedLinks[id]),
      `${id} links timelineItemIds ${expectedLinks[id]}`,
    );
  }

  // Easy-test years covering Axum, Mississippian, Zhou, Venice, Zulu
  assert(idsAt(400).has('axum'), 'Axum ON at 400');
  assert(idsAt(1100).has('mississippian'), 'Mississippian ON at 1100');
  assert(idsAt(-850).has('zhou-china'), 'Zhou ON at −850');
  assert(idsAt(1200).has('venice'), 'Venice ON at 1200');
  assert(idsAt(1850).has('zulu'), 'Zulu ON at 1850');

  // Viking / colonial fragment rules — no ocean-spanning blob
  function assertNoOceanSpanLocal(entityId, year, maxSpan = 55) {
    const feats = getOverlayPolygonFeatures(year).filter((f) => f.entityId === entityId);
    for (const f of feats) {
      const ring = f.geometry.coordinates[0];
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const [x, y] of ring) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      const span = Math.max(maxX - minX, maxY - minY);
      assert(
        span < maxSpan,
        `${entityId}@${year} ${f.regionId} span ${span.toFixed(1)} < ${maxSpan}° (no ocean-spanning blob)`,
      );
    }
  }
  const viking900 = getOverlayPolygonFeatures(900).filter((f) => f.entityId === 'viking-age');
  const vikingIds = new Set(viking900.map((f) => f.regionId));
  assert(vikingIds.has('scandinavia'), 'Viking 900 has Scandinavia');
  assert(vikingIds.size >= 3, `Viking 900 has ≥3 region ids (got ${vikingIds.size})`);
  assertNoOceanSpanLocal('viking-age', 900, 55);

  const col1700 = getOverlayPolygonFeatures(1700).filter((f) => f.entityId === 'colonial-americas');
  const colIds = new Set(col1700.map((f) => f.regionId));
  assert(colIds.size >= 4, `Colonial Americas 1700 has ≥4 region ids (got ${colIds.size})`);
  assertNoOceanSpanLocal('colonial-americas', 1700, 55);
  assertNoOceanSpanLocal('colonial-americas', 1520, 55);

  assert(spatialEntities.length >= 71, `≥71 overlay entities after Day 25 (got ${spatialEntities.length})`);
}

// Day 27 — people packs (human-atlas layer 2)
{
  assert(peopleEntities.length === PEOPLE_PACK_IDS.length, `peopleEntities length matches PEOPLE_PACK_IDS (${peopleEntities.length})`);
  assert(peopleEntities.length >= 10, `≥10 people-pack entities (got ${peopleEntities.length})`);

  const polityColors = new Set(
    spatialEntities.filter((e) => e.type !== 'people').map((e) => e.color.toLowerCase()),
  );
  const peopleColors = new Set();
  for (const id of PEOPLE_PACK_IDS) {
    const ent = spatialEntities.find((e) => e.id === id);
    assert(!!ent, `people pack entity ${id} exists in spatialEntities`);
    assert(ent?.type === 'people', `${id} has type people`);
    assert((ent?.overlays || []).length >= 3, `${id} has ≥3 overlays (got ${ent?.overlays?.length})`);
    const c = String(ent.color || '').toLowerCase();
    assert(!polityColors.has(c), `${id} color ${c} does not collide with polity colors`);
    assert(!peopleColors.has(c), `${id} color ${c} unique within people pack`);
    peopleColors.add(c);
    // No invented timeline links required — people packs are cultural, not civ ids
    for (const tid of ent.timelineItemIds || []) {
      assert(false, `${id} should not invent timelineItemIds (found ${tid})`);
    }
  }

  // Layer filter
  setOverlayLayerFilter('peoples');
  const peoplesOnly = entitiesForLayer('peoples');
  assert(peoplesOnly.length === peopleEntities.length, `peoples layer size ${peoplesOnly.length}`);
  assert(peoplesOnly.every((e) => e.type === 'people'), 'peoples layer is only type=people');
  setOverlayLayerFilter('polities');
  const politiesOnly = entitiesForLayer('polities');
  assert(politiesOnly.every((e) => e.type !== 'people'), 'polities layer excludes people');
  assert(politiesOnly.length >= 71, `polities layer ≥71 (got ${politiesOnly.length})`);
  setOverlayLayerFilter('both');
  assert(entitiesForLayer('both').length === spatialEntities.length, 'both layer = all entities');

  // Easy-test years (with peoples layer)
  setOverlayLayerFilter('peoples');
  const idsPeople = (y) => new Set(getActiveOverlaysAtYear(y).map((r) => r.entity.id));
  assert(idsPeople(-250).has('celts'), 'Celts ON at −250 (peoples layer)');
  assert(idsPeople(450).has('germanic-peoples'), 'Germanic ON at 450');
  assert(idsPeople(900).has('slavs'), 'Slavs ON at 900');
  assert(idsPeople(800).has('bantu-peoples'), 'Bantu ON at 800');
  assert(idsPeople(1000).has('turkic-peoples'), 'Turkic ON at 1000');
  assert(idsPeople(800).has('polynesian-peoples'), 'Polynesian ON at 800');
  assert(idsPeople(-400).has('scythians'), 'Scythians ON at −400');
  assert(idsPeople(-1000).has('aboriginal-australian'), 'Aboriginal Australian ON at −1000');
  assert(idsPeople(800).has('amazigh'), 'Amazigh ON at 800');
  assert(idsPeople(900).has('ancestral-puebloans'), 'Ancestral Puebloans ON at 900');

  // Polynesian fragments — no ocean-spanning blob
  const poly800 = getOverlayPolygonFeatures(800).filter((f) => f.entityId === 'polynesian-peoples');
  const polyIds = new Set(poly800.map((f) => f.regionId));
  assert(polyIds.size >= 3, `Polynesian 800 has ≥3 region ids (got ${polyIds.size})`);
  for (const f of poly800) {
    const ring = f.geometry.coordinates[0];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of ring) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    const span = Math.max(maxX - minX, maxY - minY);
    assert(span < 40, `polynesian-peoples@800 ${f.regionId} span ${span.toFixed(1)} < 40°`);
  }

  setOverlayLayerFilter('both');
  assert(spatialEntities.length >= 81, `≥81 overlay entities after Day 27 (got ${spatialEntities.length})`);
}

// Day 28 — people pack 2 (global coverage)
{
  assert(peopleEntities.length === PEOPLE_PACK_IDS.length, `peopleEntities length matches PEOPLE_PACK_IDS (${peopleEntities.length})`);
  assert(peopleEntities.length >= 20, `≥20 people-pack entities after Day 28 (got ${peopleEntities.length})`);

  const day28Ids = [
    'indo-aryan',
    'dravidian-peoples',
    'arab-peoples',
    'sinitic-peoples',
    'finno-ugric',
    'khoisan-peoples',
    'inuit-peoples',
    'maya-peoples',
    'andean-peoples',
    'nilotic-peoples',
  ];
  for (const id of day28Ids) {
    assert(PEOPLE_PACK_IDS.includes(id), `PEOPLE_PACK_IDS includes Day 28 ${id}`);
    const ent = spatialEntities.find((e) => e.id === id);
    assert(!!ent, `Day 28 people entity ${id} exists`);
    assert(ent?.type === 'people', `${id} has type people`);
    assert((ent?.overlays || []).length >= 3, `${id} has ≥3 overlays (got ${ent?.overlays?.length})`);
  }

  // Easy-test years for Day 28 pack (peoples layer)
  setOverlayLayerFilter('peoples');
  const idsPeople28 = (y) => new Set(getActiveOverlaysAtYear(y).map((r) => r.entity.id));
  assert(idsPeople28(-400).has('indo-aryan'), 'Indo-Aryan ON at −400');
  assert(idsPeople28(800).has('dravidian-peoples'), 'Dravidian ON at 800');
  assert(idsPeople28(1000).has('arab-peoples'), 'Arab peoples ON at 1000');
  assert(idsPeople28(800).has('sinitic-peoples'), 'Sinitic ON at 800');
  assert(idsPeople28(1000).has('finno-ugric'), 'Finno-Ugric ON at 1000');
  assert(idsPeople28(-500).has('khoisan-peoples'), 'Khoisan ON at −500');
  assert(idsPeople28(1200).has('inuit-peoples'), 'Inuit ON at 1200');
  assert(idsPeople28(800).has('maya-peoples'), 'Maya peoples ON at 800');
  assert(idsPeople28(800).has('andean-peoples'), 'Andean peoples ON at 800');
  assert(idsPeople28(800).has('nilotic-peoples'), 'Nilotic ON at 800');

  // Fragmented footholds — no ocean-spanning blobs for Inuit / Arab / Finno-Ugric
  function assertNoOceanSpanPeople(entityId, year, maxSpan = 55) {
    const feats = getOverlayPolygonFeatures(year).filter((f) => f.entityId === entityId);
    assert(feats.length >= 1, `${entityId}@${year} has ≥1 polygon`);
    for (const f of feats) {
      const ring = f.geometry.coordinates[0];
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const [x, y] of ring) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      const span = Math.max(maxX - minX, maxY - minY);
      assert(
        span < maxSpan,
        `${entityId}@${year} ${f.regionId} span ${span.toFixed(1)} < ${maxSpan}° (no ocean-spanning blob)`,
      );
    }
  }
  assertNoOceanSpanPeople('inuit-peoples', 1200, 55);
  assertNoOceanSpanPeople('arab-peoples', 1000, 55);
  assertNoOceanSpanPeople('finno-ugric', 1000, 55);
  const inuit1200 = getOverlayPolygonFeatures(1200).filter((f) => f.entityId === 'inuit-peoples');
  assert(new Set(inuit1200.map((f) => f.regionId)).size >= 3, 'Inuit 1200 has ≥3 region ids');

  setOverlayLayerFilter('both');
  assert(spatialEntities.length >= 91, `≥91 overlay entities after Day 28 (got ${spatialEntities.length})`);
}


if (failed) {
  console.error(`\n${failed} lifespan/morph check(s) failed`);
  process.exit(1);
}
console.log(`\nLifespan + morph checks passed (${spatialEntities.length} entities, grace=${OVERLAY_EDGE_GRACE}).`);
