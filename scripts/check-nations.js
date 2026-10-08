/**
 * Day 38 — sanity checks for the modern nations layer (1914–2025).
 *
 * The heavy checks (no overlapping claims, no unclaimed land, valid admin codes) run in
 * scripts/build-nations.mjs against Natural Earth. This script runs offline in CI against the
 * generated src/data/nations.topo.json and checks it is in sync with the date table and that
 * real-world dates land where they should.
 */
import { readFileSync } from 'node:fs';
import { geoArea, geoContains } from 'd3-geo';
import { nationColorGroup } from '../src/globe-nations-table.js';
import {
  NATION_ENTITIES,
  NATIONS_START,
  NATIONS_END,
  NATIONS_HANDOFF_YEAR,
  setNationsTopology,
  getNationPolygonFeatures,
  getGlobePolygonFeatures,
  getActiveNationsAtYear,
  getActiveSchematicOverlaysAtYear,
  getNationEntityById,
  getNationPeriodAtYear,
  nationColorFor,
} from '../src/globe-nations.js';
import { NATION_NEIGHBOURS } from '../src/data/nations-colors.js';
import { civilisations } from '../src/civilisations.js';

let failures = 0;
function fail(msg) {
  failures += 1;
  console.error('✗ ' + msg);
}

const topo = JSON.parse(readFileSync(new URL('../src/data/nations.topo.json', import.meta.url), 'utf8'));
setNationsTopology(topo);

// 1. Topology versions cover exactly the table's periods.
const end = NATIONS_END + 1;
const fromTable = new Set();
for (const ent of NATION_ENTITIES) {
  for (const p of ent.periods) {
    fromTable.add(`${ent.id}|${Math.max(p.from, NATIONS_START)}|${p.to == null ? end : p.to}`);
  }
}
const fromTopo = new Set();
for (const [id, from, to] of topo.versions) {
  if (!NATION_ENTITIES.some((e) => e.id === id)) fail(`topology has unknown nation ${id}`);
  fromTopo.add(`${id}|${from}|${to}`);
}
for (const k of fromTable) if (![...fromTopo].some((t) => t.startsWith(k.split('|')[0] + '|'))) fail(`no geometry for ${k}`);
const coverYears = (id, y) => topo.versions.some(([i, f, t]) => i === id && y >= f && y < t);
for (const ent of NATION_ENTITIES) {
  for (const p of ent.periods) {
    const to = p.to == null ? end : p.to;
    for (let y = Math.max(p.from, NATIONS_START); y < to; y += 1) {
      if (!coverYears(ent.id, y)) {
        fail(`${ent.id} has no geometry in ${y} — re-run npm run build:nations`);
        break;
      }
    }
  }
}

// 2. Point checks: real cities fall in the right nation at real dates.
const CITY = {
  vienna: [16.37, 48.21], warsaw: [21.01, 52.23], lviv: [24.03, 49.84], vilnius: [25.28, 54.69],
  strasbourg: [7.75, 48.58], baghdad: [44.36, 33.31], nairobi: [36.82, -1.29], delhi: [77.21, 28.61],
  hanoi: [105.85, 21.03], saigon: [106.66, 10.78], helsinki: [24.94, 60.17], seoul: [126.98, 37.57],
  pyongyang: [125.75, 39.03], jerusalem: [35.21, 31.77], riga: [24.11, 56.95], istanbul: [28.98, 41.01],
  kyiv: [30.52, 50.45], prague: [14.42, 50.08], belgrade: [20.46, 44.82], dublin: [-6.26, 53.35],
  kaliningrad: [20.51, 54.71], chisinau: [28.86, 47.01], shenyang: [123.43, 41.8], addis: [38.75, 9.03],
  bonn: [7.1, 50.73], leipzig: [12.37, 51.34], wroclaw: [17.04, 51.11], karachi: [67.0, 24.86],
  dhaka: [90.41, 23.81], jakarta: [106.85, -6.21], taipei: [121.56, 25.03], lhasa: [91.1, 29.65],
  lagos: [3.38, 6.52], algiers: [3.06, 36.75], kinshasa: [15.31, -4.32], luanda: [13.23, -8.84],
  windhoek: [17.08, -22.56], ljubljana: [14.51, 46.06], bratislava: [17.11, 48.15], asmara: [38.93, 15.33],
  simferopol: [34.1, 44.95], juba: [31.58, 4.85], pristina: [21.17, 42.66], laayoune: [-13.2, 27.15],
  dili: [125.57, -8.56], tallinn: [24.75, 59.44], tbilisi: [44.79, 41.72], almaty: [76.89, 43.24],
  accra: [-0.19, 5.6], mumbai: [72.88, 19.08], rangoon: [96.16, 16.84], cairo: [31.24, 30.04],
  ottawa: [-75.7, 45.42], moscow: [37.62, 55.75], berlin: [13.4, 52.52], harare: [31.05, -17.83],
};
const EXPECT = [
  [1914, { vienna: 'austria-hungary', lviv: 'austria-hungary', warsaw: 'russia', helsinki: 'russia', strasbourg: 'germany', baghdad: 'ottoman-empire', jerusalem: 'ottoman-empire', nairobi: 'kenya', delhi: 'british-raj', hanoi: 'french-indochina', seoul: 'korea', moscow: 'russia' }],
  [1925, { vienna: 'austria', warsaw: 'poland', lviv: 'poland', vilnius: 'poland', strasbourg: 'france', riga: 'latvia', tallinn: 'estonia', istanbul: 'turkey', baghdad: 'iraq', kyiv: 'ussr', tbilisi: 'ussr', prague: 'czechoslovakia', belgrade: 'yugoslavia', dublin: 'ireland', kaliningrad: 'germany', chisinau: 'romania', shenyang: 'china', jerusalem: 'mandatory-palestine', helsinki: 'finland', cairo: 'egypt' }],
  [1935, { shenyang: 'manchukuo', addis: 'ethiopia' }],
  [1938, { addis: 'ethiopia' }],
  [1941, { warsaw: 'germany', lviv: 'ussr', riga: 'ussr', vienna: 'germany', prague: 'germany', chisinau: 'ussr' }],
  [1949, { lhasa: 'tibet' }],
  [1950, { bonn: 'west-germany', leipzig: 'east-germany', kaliningrad: 'ussr', wroclaw: 'poland', lviv: 'ussr', delhi: 'india', mumbai: 'india', karachi: 'pakistan', dhaka: 'pakistan', jakarta: 'indonesia', hanoi: 'french-indochina', nairobi: 'kenya', taipei: 'taiwan', seoul: 'south-korea', pyongyang: 'north-korea', lhasa: 'china', jerusalem: 'israel', rangoon: 'myanmar', accra: 'ghana' }],
  [1960, { hanoi: 'vietnam', saigon: 'south-vietnam', lagos: 'nigeria', nairobi: 'kenya', algiers: 'algeria', kinshasa: 'dr-congo', accra: 'ghana' }],
  [1975, { luanda: 'angola', dhaka: 'bangladesh', windhoek: 'namibia', harare: 'zimbabwe', ottawa: 'canada' }],
  [1995, { kyiv: 'ukraine', berlin: 'germany', leipzig: 'germany', ljubljana: 'slovenia', prague: 'czechia', bratislava: 'slovakia', asmara: 'eritrea', belgrade: 'yugoslavia', almaty: 'kazakhstan', tbilisi: 'georgia', simferopol: 'ukraine', moscow: 'russia' }],
  [2025, { simferopol: 'crimea', kyiv: 'ukraine', juba: 'south-sudan', pristina: 'kosovo', laayoune: 'western-sahara', dili: 'east-timor', taipei: 'taiwan', belgrade: 'serbia', moscow: 'russia' }],
];
const kindAt = {
  1914: { nairobi: 'colony', delhi: 'colony', seoul: 'colony' },
  1938: { addis: 'colony' },
  1950: { nairobi: 'colony', hanoi: 'colony' },
  1960: { nairobi: 'colony', algiers: 'colony', lagos: 'state' },
  1975: { windhoek: 'colony' },
  2025: { simferopol: 'disputed', laayoune: 'disputed' },
};
for (const [year, expect] of EXPECT) {
  const feats = getNationPolygonFeatures(year);
  for (const [city, want] of Object.entries(expect)) {
    const hits = feats.filter((f) => geoContains(f.geometry, CITY[city]));
    const ids = [...new Set(hits.map((f) => f.entityId.replace(/^nation-/, '')))];
    if (ids.length !== 1 || ids[0] !== want) fail(`${year}: ${city} should be in ${want}, got [${ids.join(', ')}]`);
    const k = kindAt[year]?.[city];
    if (k && hits[0] && hits[0].nationKind !== k) fail(`${year}: ${city} should be ${k}, got ${hits[0].nationKind}`);
  }
}

// 3. Coverage stays roughly constant (no missing land, no double counting) and fits a mobile budget.
const STEP_YEARS = [1914, 1918, 1925, 1939, 1941, 1945, 1950, 1960, 1975, 1991, 1995, 2008, 2025];
const R2 = 6371 * 6371;
const areaAt = (y) => getNationPolygonFeatures(y).reduce((s, f) => s + geoArea(f.geometry) * R2, 0);
const ref = areaAt(2025);
for (const y of STEP_YEARS) {
  const a = areaAt(y);
  if (Math.abs(a - ref) / ref > 0.015) fail(`${y}: land area ${Math.round(a / 1e6)}M km² vs ${Math.round(ref / 1e6)}M in 2025 (gap or overlap)`);
  let parts = 0;
  let verts = 0;
  for (const f of getNationPolygonFeatures(y)) {
    for (const poly of f.geometry.coordinates) {
      parts += 1;
      for (const ring of poly) {
        verts += ring.length;
        // d3 treats a ring wound the wrong way as "the rest of the planet".
      }
      if (geoArea({ type: 'Polygon', coordinates: poly }) > 2 * Math.PI) fail(`${y}: ${f.entityId} has an inverted ring`);
    }
  }
  if (parts > 700 || verts > 60000) fail(`${y}: ${parts} polygons / ${verts} vertices exceeds the mobile budget`);
}

// 4. Handoff: no schematic empires from 1914, still there in 1913.
const polityAt = (y) => getGlobePolygonFeatures(y).filter((f) => !['people', 'presence', 'nation'].includes(f.entityType));
if (!polityAt(1913).some((f) => f.entityId === 'british-empire')) fail('1913: schematic British Empire should still be drawn');
for (const y of [NATIONS_HANDOFF_YEAR, 1920, 1960, 2025]) {
  const leftover = polityAt(y);
  if (leftover.length) fail(`${y}: schematic polities double-paint over nations: ${[...new Set(leftover.map((f) => f.entityId))].join(', ')}`);
  if (getActiveSchematicOverlaysAtYear(y).some(({ entity }) => entity.type !== 'people' && entity.type !== 'presence')) {
    fail(`${y}: sidebar still lists schematic polities`);
  }
  if (!getGlobePolygonFeatures(y).some((f) => f.entityType === 'presence')) fail(`${y}: presence wash missing`);
}

// 5. Real dates: breakups and decolonisation.
const activeIds = (y) => new Set(getActiveNationsAtYear(y).map(({ entity }) => entity.tableId));
const has = (y, id) => activeIds(y).has(id);
for (const [y, id, want] of [
  [1917, 'austria-hungary', true], [1918, 'austria-hungary', false], [1918, 'poland', true], [1918, 'czechoslovakia', true],
  [1921, 'ussr', false], [1922, 'ussr', true], [1990, 'ussr', true], [1991, 'ussr', false], [1991, 'kazakhstan', true],
  [1990, 'east-germany', false], [1989, 'east-germany', true], [1992, 'slovenia', true], [1993, 'czechia', true],
  [1992, 'czechia', false], [2011, 'south-sudan', true], [2010, 'south-sudan', false], [1923, 'ottoman-empire', false],
]) {
  if (has(y, id) !== want) fail(`${y}: ${id} should ${want ? '' : 'not '}be active`);
}
const africaStates = (y) => getActiveNationsAtYear(y).filter(({ entity, period }) => (period.kind || 'state') === 'state' && ['nigeria', 'ghana', 'senegal', 'mali', 'dr-congo', 'cameroon', 'chad', 'niger', 'cote-divoire', 'madagascar', 'kenya', 'tanzania', 'zambia', 'angola', 'mozambique'].includes(entity.tableId)).length;
if (africaStates(1955) > 1) fail(`1955: expected almost no independent sub-Saharan states in the sample, got ${africaStates(1955)}`);
if (africaStates(1966) < 12) fail(`1966: expected most of the sample independent, got ${africaStates(1966)}`);

// 6. Colours: neighbours never share a colour in any year; colours stable per nation.
const byId = new Map(NATION_ENTITIES.map((e) => [e.id, e]));
const colourAt = (id, y) => {
  const ent = getNationEntityById('nation-' + id, y);
  return ent ? ent.color : null;
};
for (const y of STEP_YEARS) {
  const ids = activeIds(y);
  for (const [a, ns] of Object.entries(NATION_NEIGHBOURS)) {
    if (!ids.has(a)) continue;
    for (const b of ns) {
      if (!ids.has(b) || a >= b) continue;
      const ca = colourAt(a, y);
      const cb = colourAt(b, y);
      // Colonies deliberately wear their ruler's colour, so same-bloc neighbours may match.
      const ga = nationColorGroup(byId.get(a), getNationPeriodAtYear(a, y));
      const gb = nationColorGroup(byId.get(b), getNationPeriodAtYear(b, y));
      if (ca && ca === cb && ga !== gb) fail(`${y}: neighbours ${a} and ${b} share ${ca}`);
    }
  }
}
for (const ent of NATION_ENTITIES) {
  const states = ent.periods.filter((p) => !p.kind || p.kind === 'state');
  const cs = new Set(states.map((p) => nationColorFor(ent, p)));
  if (cs.size > 1) fail(`${ent.id} changes colour between its independent periods`);
}

// 7. Timeline links only point at real items.
const known = new Set(civilisations.map((c) => c.id));
for (const ent of NATION_ENTITIES) {
  for (const id of ent.timelineItemIds || []) if (!known.has(id)) fail(`${ent.id}: unknown timelineItemId ${id}`);
}

if (failures) {
  console.error(`\n✗ nations: ${failures} check(s) failed`);
  process.exit(1);
}
console.log(`✓ nations: ${NATION_ENTITIES.length} nations, ${topo.versions.length} shape-periods, ${STEP_YEARS.length} sample years checked (handoff ${NATIONS_HANDOFF_YEAR}).`);
