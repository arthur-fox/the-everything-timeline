/**
 * Day 18 — sanity checks for globe overlay lifespan clamping.
 * Ensures empires dissolve near last keyframe / civ end (not ±80 sticky).
 */
import {
  getActiveOverlaysAtYear,
  getEntityLifespan,
  spatialEntities,
  OVERLAY_EDGE_GRACE,
} from '../src/globe-overlays.js';

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

assert(idsAt(-500).size >= 3, `−500 still has ≥3 overlays (got ${idsAt(-500).size})`);

if (failed) {
  console.error(`\n${failed} lifespan check(s) failed`);
  process.exit(1);
}
console.log(`\nLifespan checks passed (${spatialEntities.length} entities, grace=${OVERLAY_EDGE_GRACE}).`);
