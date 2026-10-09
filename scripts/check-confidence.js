/**
 * Day 44 — Phase 4c item 4 (showing uncertainty): every shape on the globe carries a confidence
 * level (documented / approximate / conjectural) with a reason, in every year it is drawn.
 */
import { readFileSync } from 'node:fs';
import { spatialEntities, getOverlayPolygonFeatures, getEntityLifespan, getActiveOverlaysAtYear } from '../src/globe-overlays.js';
import { NATION_ENTITIES, NATIONS_START, NATIONS_END, setNationsTopology, getGlobePolygonFeatures, getNationEntityById } from '../src/globe-nations.js';
import {
  CONFIDENCE_LEVELS,
  CONFIDENCE_ENTITY_OVERRIDES,
  confidenceForEntity,
  confidenceForNationPeriod,
  isValidConfidence,
} from '../src/globe-confidence.js';

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error('✗ ' + msg);
};

const topo = JSON.parse(readFileSync(new URL('../src/data/nations.topo.json', import.meta.url), 'utf8'));
setNationsTopology(topo);

// 1. Overrides and explicit values are well-formed and point at real entities.
const ids = new Set(spatialEntities.map((e) => e.id));
for (const [id, c] of Object.entries(CONFIDENCE_ENTITY_OVERRIDES)) {
  if (!ids.has(id)) fail(`override for unknown entity "${id}"`);
  if (!isValidConfidence(c)) fail(`override for "${id}" has no valid level / reason`);
}
for (const e of spatialEntities) {
  if (e.confidence && !isValidConfidence(e.confidence)) fail(`${e.id}: invalid entity confidence`);
  for (const o of e.overlays || []) if (o.confidence && !isValidConfidence(o.confidence)) fail(`${e.id} @ ${o.year}: invalid overlay confidence`);
}

// 2. Every hand-drawn shape, in every year it is drawn (sampled every 10 years + each keyframe).
const counts = Object.fromEntries(CONFIDENCE_LEVELS.map((l) => [l, 0]));
let shapes = 0;
for (const e of spatialEntities) {
  const life = getEntityLifespan(e);
  const years = new Set((e.overlays || []).map((o) => o.year));
  const a = Math.max(-10000, Math.floor(life.start ?? e.overlays[0].year));
  const b = Math.min(2025, Math.ceil(life.end ?? e.overlays.at(-1).year));
  for (let y = a; y <= b; y += 10) years.add(y);
  for (const y of years) {
    for (const f of getOverlayPolygonFeatures(y, [e])) {
      shapes += 1;
      if (!CONFIDENCE_LEVELS.includes(f.confidence) || !f.confidenceReason) fail(`${e.id} @ ${y}: shape without confidence`);
      else counts[f.confidence] += 1;
      if (f.properties?.confidence !== f.confidence) fail(`${e.id} @ ${y}: properties.confidence out of sync`);
    }
  }
}

// 3. Every nations period resolves, before and after 1914.
let periods = 0;
for (const ent of NATION_ENTITIES) {
  for (const per of ent.periods) {
    for (const y of [per.from, Math.max(per.from, 1914)]) {
      periods += 1;
      if (!isValidConfidence(confidenceForNationPeriod(per, y, ent.id))) fail(`nation ${ent.id} ${per.from}: no confidence at ${y}`);
    }
  }
}
// …and every feature the globe actually builds carries it.
for (const y of [1815, 1848, 1871, 1885, 1900, 1913, 1914, 1950, 1990, 2025]) {
  for (const f of getGlobePolygonFeatures(y)) {
    if (!CONFIDENCE_LEVELS.includes(f.confidence) || !f.confidenceReason) fail(`${f.entityId} @ ${y}: globe shape without confidence`);
  }
}

// 4. Expected levels at real dates (the roadmap's rule plus the overrides).
const ent = (id) => spatialEntities.find((e) => e.id === id);
const expectEntity = (id, y, level) => {
  const e = ent(id);
  if (!e) return fail(`expected entity ${id} missing`);
  const ov = getActiveOverlaysAtYear(y, [e])[0]?.overlay || null;
  const got = confidenceForEntity(e, y, ov).level;
  if (got !== level) fail(`${id} @ ${y}: expected ${level}, got ${got}`);
};
expectEntity('roman-empire', 117, 'approximate');
expectEntity('han-china', 100, 'approximate');
expectEntity('ottoman-empire', 1683, 'approximate');
expectEntity('mesopotamia', -2300, 'conjectural');
expectEntity('olmec', -1000, 'conjectural');
expectEntity('ancient-egypt', -1450, 'approximate');
expectEntity('celts', -300, 'conjectural');
expectEntity('celts', 1900, 'approximate');
expectEntity('khoisan-peoples', -1500, 'conjectural');
expectEntity('fertile-crescent-presence', -6000, 'conjectural');
expectEntity('global-modern-presence', 1900, 'approximate');

const expectNation = (id, y, level) => {
  const e = getNationEntityById(id.startsWith('nation-') ? id : `nation-${id}`, y);
  if (!e) return fail(`expected nation ${id} @ ${y} missing`);
  const got = confidenceForNationPeriod(e.period, y, e.tableId).level;
  if (got !== level) fail(`nation ${id} @ ${y}: expected ${level}, got ${got}`);
};
expectNation('germany', 1950, 'documented');
expectNation('france', 1871, 'documented');
expectNation('finland', 1930, 'approximate'); // Karelia lost 1940/44 not split out (table note)
expectNation('finland', 1950, 'documented'); // …which no longer matters after 1944
expectNation('greenland', 1850, 'approximate'); // coastal posts, island claimed later
expectNation('vietnam', 1960, 'approximate'); // partition line approximated at 17°N

// Scramble for Africa: claims before 1914 approximate, the same colonies documented after.
let africaClaimEra = 0;
let africaLater = 0;
for (const f of getGlobePolygonFeatures(1900)) if (f.confidenceReason?.startsWith('A colonial claim')) africaClaimEra += 1;
for (const f of getGlobePolygonFeatures(1925)) if (f.confidenceReason?.startsWith('A colonial claim')) africaLater += 1;
if (africaClaimEra < 10) fail(`expected ≥ 10 approximate African colonial claims in 1900, got ${africaClaimEra}`);
if (africaLater !== 0) fail(`African claim-era caveat should end in 1914, still on ${africaLater} shapes in 1925`);

const modern = getGlobePolygonFeatures(2000).filter((f) => f.entityType === 'nation');
const modernDoc = modern.filter((f) => f.confidence === 'documented').length;
if (modernDoc / modern.length < 0.9) fail(`expected ≥ 90% of nations documented in 2000, got ${modernDoc}/${modern.length}`);

if (failures) {
  console.error(`\n${failures} confidence check(s) failed`);
  process.exit(1);
}
console.log(
  `✓ confidence: ${shapes} hand-drawn shape-years (${counts.documented} documented, ${counts.approximate} approximate, ${counts.conjectural} conjectural), ` +
    `${periods} nation period checks (${NATIONS_START}–${NATIONS_END}), ${africaClaimEra} African claims approximate in 1900, ` +
    `${modernDoc}/${modern.length} nations documented in 2000`,
);
