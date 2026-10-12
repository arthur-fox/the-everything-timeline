/**
 * Day 56: checks for the ancient Greek world on the globe (src/globe-greek-world.js).
 *  - the shared pieces (src/globe-med-pieces.js) fit edge to edge: every merge gives one outline;
 *  - no piece or merged block crosses itself (a crossing ring fills the wrong side on the globe);
 *  - era names (nameAt) are in order, and labels switch at the right years;
 *  - the key polities are on the globe at the years Arthur asked about.
 */
import { MERGE_STATS } from '../src/globe-med-pieces.js';
import * as PIECES from '../src/globe-med-pieces.js';
import { greekWorldPolities, hellenesPeople } from '../src/globe-greek-world.js';
import { getActiveOverlaysAtYear, entityNameAt, spatialEntities } from '../src/globe-overlays.js';

let failed = 0;
const fail = (m) => {
  failed += 1;
  console.error(`FAIL: ${m}`);
};

function crossings(ring) {
  const o = ring.slice(0, -1);
  const n = o.length;
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const hit = (p1, p2, p3, p4) => {
    const d1 = d(p3, p4, p1);
    const d2 = d(p3, p4, p2);
    const d3 = d(p1, p2, p3);
    const d4 = d(p1, p2, p4);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (hit(o[i], o[(i + 1) % n], o[j], o[(j + 1) % n])) count += 1;
    }
  }
  const seen = new Set();
  for (const p of o) {
    const k = p.join();
    if (seen.has(k)) count += 1;
    seen.add(k);
  }
  return count;
}

// 1. Pieces merge cleanly.
for (const p of MERGE_STATS.problems) fail(`merge ${p} (pieces must share borders point for point)`);

// 2. No self-crossing rings.
let rings = 0;
for (const [name, v] of Object.entries(PIECES)) {
  if (!Array.isArray(v) || !Array.isArray(v[0])) continue;
  rings += 1;
  const c = crossings(v);
  if (c) fail(`piece ${name} crosses itself (${c})`);
  const a = v[0];
  const b = v[v.length - 1];
  if (a[0] !== b[0] || a[1] !== b[1]) fail(`piece ${name} is not closed`);
}
const all = [...greekWorldPolities, hellenesPeople];
const checked = new Set();
for (const e of all) {
  for (const o of e.overlays) {
    for (const r of o.regions) {
      if (typeof r === 'string' || checked.has(r.ring)) continue;
      checked.add(r.ring);
      const c = crossings(r.ring);
      if (c) fail(`${e.id} ${o.year} ${r.id} crosses itself (${c})`);
    }
  }
}

// 3. Era names.
for (const e of all) {
  if (!e.nameAt) continue;
  for (let i = 1; i < e.nameAt.length; i++) {
    if (!(e.nameAt[i][0] > e.nameAt[i - 1][0])) fail(`${e.id} nameAt not ascending`);
  }
}
const byId = new Map(spatialEntities.map((e) => [e.id, e]));
const NAMES = [
  ['classical-greece', -600, 'Archaic Greece'],
  ['classical-greece', -400, 'Independent Greek states'],
  ['athens-delian-league', -440, 'Athenian Empire (Delian League)'],
  ['athens-delian-league', -370, 'Athens and the Second Athenian League'],
  ['sparta-peloponnesian-league', -431, 'Sparta and the Peloponnesian League'],
  ['epirus', -200, 'Epirote League'],
  ['carthage', -300, 'Carthage'],
];
for (const [id, y, want] of NAMES) {
  const got = entityNameAt(byId.get(id), y);
  if (got !== want) fail(`${id} in ${y}: name ${got}, expected ${want}`);
}

// 4. Who is on the globe when.
const EXPECT = {
  [-1600]: ['minoan-crete', 'mycenaean-greece', 'hittite-empire', 'hellenes'],
  [-1300]: ['mycenaean-greece', 'hittite-empire', 'hellenes'],
  [-600]: ['classical-greece', 'lydia', 'carthage', 'etruscans', 'hellenes'],
  [-480]: ['classical-greece', 'athens-delian-league', 'sparta-peloponnesian-league', 'achaemenid-empire', 'carthage', 'etruscans', 'syracuse', 'argead-macedon', 'roman-republic'],
  [-431]: ['athens-delian-league', 'sparta-peloponnesian-league', 'thebes-boeotian-league', 'achaemenid-empire'],
  [-371]: ['thebes-boeotian-league', 'sparta-peloponnesian-league', 'athens-delian-league'],
  [-323]: ['macedonian-empire', 'carthage', 'roman-republic', 'epirus'],
  [-250]: ['ptolemaic-kingdom', 'seleucid-empire', 'antigonid-macedon', 'attalid-pergamon', 'greco-bactria', 'achaean-league', 'aetolian-league', 'syracuse', 'carthage', 'roman-republic'],
  [-200]: ['ptolemaic-kingdom', 'seleucid-empire', 'antigonid-macedon', 'attalid-pergamon', 'greco-bactria', 'achaean-league', 'aetolian-league', 'roman-republic', 'carthage', 'parthian-empire'],
  [-150]: ['indo-greek-kingdom', 'achaean-league', 'roman-republic', 'seleucid-empire', 'ptolemaic-kingdom', 'attalid-pergamon'],
};
const GONE = {
  [-480]: ['macedonian-empire', 'mycenaean-greece'],
  [-323]: ['classical-greece', 'athens-delian-league', 'thebes-boeotian-league', 'achaemenid-empire', 'argead-macedon'],
  [-140]: ['carthage', 'achaean-league', 'antigonid-macedon'],
};
for (const [y, ids] of Object.entries(EXPECT)) {
  const on = new Set(getActiveOverlaysAtYear(Number(y), spatialEntities).map((a) => a.entity.id));
  for (const id of ids) if (!on.has(id)) fail(`${id} should be on the globe in ${y}`);
}
for (const [y, ids] of Object.entries(GONE)) {
  const on = new Set(getActiveOverlaysAtYear(Number(y), spatialEntities).map((a) => a.entity.id));
  for (const id of ids) if (on.has(id)) fail(`${id} should be gone by ${y}`);
}

if (failed) {
  console.error(`check-greek-world: ${failed} problem(s)`);
  process.exit(1);
}
console.log(`✓ greek world: ${greekWorldPolities.length} polities + Hellenes, ${rings} pieces and ${checked.size} blocks with clean outlines (${MERGE_STATS.calls} merges), era names and ${Object.keys(EXPECT).length} sample years OK`);
