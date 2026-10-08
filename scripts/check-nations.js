/**
 * Day 38 — sanity checks for the nations layer (1914–2025; extended to 1815 on Day 41).
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
  NATIONS_FULL_COVERAGE_START,
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
  // Day 41: 19th-century checkpoints
  milan: [9.19, 45.46], padua: [11.88, 45.41], turin: [7.69, 45.07], florence: [11.26, 43.77], rome: [12.5, 41.9],
  naples: [14.27, 40.85], munich: [11.58, 48.14], hanover: [9.73, 52.37], dresden: [13.74, 51.05], paris: [2.35, 48.86],
  nice: [7.27, 43.7], brussels: [4.35, 50.85], oslo: [10.75, 59.91], athens: [23.73, 37.98], thessaloniki: [22.94, 40.64],
  sofia: [23.32, 42.7], plovdiv: [24.75, 42.15], bucharest: [26.1, 44.43], sarajevo: [18.41, 43.86], budapest: [19.04, 47.5],
  tirana: [19.82, 41.33], nis: [21.9, 43.32], kars: [43.1, 40.6], yerevan: [44.51, 40.18], grozny: [45.69, 43.32],
  tashkent: [69.24, 41.3], samarkand: [66.96, 39.65], bukhara: [64.42, 39.77], khiva: [60.36, 41.38], kokand: [70.94, 40.53],
  ashgabat: [58.38, 37.95], vladivostok: [131.89, 43.12], kashgar: [75.99, 39.47], beijing: [116.4, 39.9], tokyo: [139.69, 35.69],
  naha: [127.68, 26.21], sapporo: [141.35, 43.06], lahore: [74.34, 31.55], pune: [73.86, 18.52], kolkata: [88.36, 22.57],
  mandalay: [96.08, 21.97], kabul: [69.17, 34.53], tehran: [51.39, 35.69], bangkok: [100.5, 13.76], phnompenh: [104.92, 11.56],
  singapore: [103.82, 1.35], kualalumpur: [101.69, 3.14], manila: [120.98, 14.6], honolulu: [-157.86, 21.31], sydney: [151.21, -33.87],
  perth: [115.86, -31.95], auckland: [174.76, -36.85], mexicocity: [-99.13, 19.43], sanfrancisco: [-122.42, 37.77], dallas: [-96.8, 32.78],
  portland: [-122.68, 45.52], tampa: [-82.46, 27.95], havana: [-82.37, 23.11], bogota: [-74.07, 4.71], caracas: [-66.9, 10.48],
  quito: [-78.47, -0.18], lima: [-77.04, -12.05], lapaz: [-68.15, -16.5], antofagasta: [-70.4, -23.65], santiago: [-70.65, -33.45],
  cordoba: [-64.18, -31.42], durazno: [-56.52, -33.38], rio: [-43.2, -22.91], winnipeg: [-97.14, 49.9], kamloops: [-120.33, 50.67],
  guatemalacity: [-90.51, 14.63], santodomingo: [-69.93, 18.49], tunis: [10.18, 36.81], sabha: [14.43, 27.04], rabat: [-6.84, 34.02],
  khartoum: [32.53, 15.5], kaolack: [-16.07, 14.15], kumasi: [-1.62, 6.69], sokoto: [5.24, 13.06], kano: [8.52, 12.0],
  abomey: [1.99, 7.18], capetown: [18.42, -33.92], johannesburg: [28.05, -26.2], bloemfontein: [26.21, -29.12], durban: [31.02, -29.86],
  antananarivo: [47.52, -18.88], daressalaam: [39.28, -6.79], kampala: [32.58, 0.35], kigali: [30.06, -1.94], lusaka: [28.32, -15.39],
  chimoio: [33.48, -19.12], gaborone: [25.91, -24.65], riyadh: [46.72, 24.71], mecca: [39.83, 21.42], sanaa: [44.19, 15.37],
};
const EXPECT = [
  // Day 41: 1815–1913
  [1815, {
    vienna: 'austria-hungary', milan: 'austria-hungary', padua: 'austria-hungary', turin: 'italy', nice: 'italy', florence: 'tuscany',
    rome: 'papal-states', naples: 'two-sicilies', berlin: 'prussia', munich: 'bavaria', hanover: 'hanover', dresden: 'saxony',
    paris: 'france', brussels: 'netherlands', oslo: 'norway', warsaw: 'russia', helsinki: 'russia', athens: 'ottoman-empire',
    sofia: 'ottoman-empire', belgrade: 'serbia', bucharest: 'romania', sarajevo: 'ottoman-empire', budapest: 'austria-hungary',
    yerevan: 'iran', tashkent: 'kokand', samarkand: 'bukhara', khiva: 'khiva', vladivostok: 'china', beijing: 'china',
    tokyo: 'japan', naha: 'ryukyu', seoul: 'korea', delhi: 'british-raj', kolkata: 'british-raj', lahore: 'sikh-empire',
    pune: 'maratha', karachi: 'sindh', kabul: 'afghanistan', mandalay: 'myanmar', bangkok: 'thailand', hanoi: 'vietnam',
    algiers: 'algeria', tunis: 'tunisia', cairo: 'egypt', rabat: 'morocco', capetown: 'south-africa', sokoto: 'sokoto',
    kumasi: 'ashanti', abomey: 'dahomey', mexicocity: 'mexico', sanfrancisco: 'mexico', dallas: 'mexico', tampa: 'spanish-florida',
    portland: 'oregon-country', havana: 'cuba', lima: 'peru', bogota: 'colombia', cordoba: 'argentina', rio: 'brazil',
    honolulu: 'hawaii', sydney: 'australia', ottawa: 'canada', winnipeg: 'ruperts-land', riyadh: 'saudi-arabia',
  }],
  [1830, { kamloops: 'british-columbia', bogota: 'gran-colombia', caracas: 'gran-colombia', quito: 'gran-colombia', mexicocity: 'mexico', lima: 'peru', lapaz: 'bolivia', durazno: 'uruguay', athens: 'greece', yerevan: 'russia', pune: 'british-raj', santodomingo: 'haiti' }],
  [1848, { athens: 'greece', bogota: 'colombia', quito: 'ecuador', caracas: 'venezuela', dallas: 'usa', portland: 'usa', sanfrancisco: 'usa', tampa: 'usa', guatemalacity: 'guatemala', santodomingo: 'dominican-republic', karachi: 'british-raj', lahore: 'sikh-empire', grozny: 'caucasian-imamate', auckland: 'new-zealand', perth: 'australia', singapore: 'malaysia', durban: 'natal', algiers: 'algeria' }],
  [1861, { turin: 'italy', milan: 'italy', florence: 'italy', naples: 'italy', rome: 'papal-states', padua: 'austria-hungary', nice: 'france', bucharest: 'romania', vladivostok: 'russia', lahore: 'british-raj', saigon: 'vietnam', johannesburg: 'transvaal', bloemfontein: 'orange-free-state' }],
  [1871, { berlin: 'germany', munich: 'germany', hanover: 'germany', dresden: 'germany', strasbourg: 'germany', rome: 'italy', padua: 'italy', paris: 'france', vienna: 'austria-hungary', tashkent: 'russia', samarkand: 'russia', bukhara: 'bukhara', saigon: 'french-indochina', phnompenh: 'french-indochina', kashgar: 'yettishar', sapporo: 'japan', winnipeg: 'canada', kamloops: 'canada' }],
  [1880, { belgrade: 'serbia', nis: 'serbia', bucharest: 'romania', sofia: 'bulgaria', plovdiv: 'eastern-rumelia', sarajevo: 'austria-hungary', kars: 'russia', athens: 'greece', thessaloniki: 'ottoman-empire', kamloops: 'canada', kashgar: 'china', tunis: 'tunisia', antofagasta: 'bolivia' }],
  [1885, { cairo: 'egypt', khartoum: 'sudan', kinshasa: 'dr-congo', windhoek: 'namibia', daressalaam: 'tanzania', lagos: 'nigeria', tunis: 'tunisia', hanoi: 'french-indochina', mandalay: 'myanmar', antofagasta: 'chile', johannesburg: 'transvaal', gaborone: 'botswana' }],
  [1900, { plovdiv: 'bulgaria', khartoum: 'sudan', nairobi: 'kenya', kampala: 'uganda', kigali: 'rwanda', harare: 'zimbabwe', lusaka: 'zambia', antananarivo: 'madagascar', kaolack: 'senegal', abomey: 'benin', kumasi: 'ashanti', sokoto: 'sokoto', kano: 'sokoto', chimoio: 'mozambique', mandalay: 'british-raj', manila: 'philippines', taipei: 'taiwan', seoul: 'korea', havana: 'cuba', sydney: 'australia', ashgabat: 'russia' }],
  [1913, { tirana: 'albania', thessaloniki: 'greece', sabha: 'libya', rabat: 'morocco', seoul: 'korea', beijing: 'china', lhasa: 'tibet', capetown: 'south-africa', johannesburg: 'south-africa', durban: 'south-africa', kumasi: 'ghana', sokoto: 'nigeria', istanbul: 'ottoman-empire', belgrade: 'serbia', pristina: 'serbia', bukhara: 'bukhara', khiva: 'khiva', almaty: 'russia' }],
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
  1815: { mexicocity: 'colony', lima: 'colony', belgrade: 'vassal', bucharest: 'vassal', algiers: 'vassal', cairo: 'vassal', delhi: 'colony', capetown: 'colony', bogota: 'colony', havana: 'colony', rabat: 'state', seoul: 'state' },
  1848: { bogota: 'state', mexicocity: 'state', algiers: 'colony', durban: 'colony' },
  1880: { belgrade: 'state', sofia: 'vassal', plovdiv: 'vassal' },
  1885: { cairo: 'colony', kinshasa: 'colony', windhoek: 'colony' },
  1900: { seoul: 'state', manila: 'colony', nairobi: 'colony', khartoum: 'colony', bukhara: 'colony' },
  1913: { seoul: 'colony', sofia: 'state', sabha: 'colony', capetown: 'dominion' },
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
//    Day 41: before 1914 stateless land is left empty, so coverage only has to grow, never overshoot.
const STEP_YEARS = [1815, 1830, 1848, 1861, 1871, 1878, 1885, 1900, 1913, 1914, 1918, 1925, 1939, 1941, 1945, 1950, 1960, 1975, 1991, 1995, 2008, 2025];
const R2 = 6371 * 6371;
const areaAt = (y) => getNationPolygonFeatures(y).reduce((s, f) => s + geoArea(f.geometry) * R2, 0);
const ref = areaAt(2025);
let prevShare = 0;
for (const y of STEP_YEARS) {
  const a = areaAt(y);
  if (y >= NATIONS_FULL_COVERAGE_START) {
    if (Math.abs(a - ref) / ref > 0.015) fail(`${y}: land area ${Math.round(a / 1e6)}M km² vs ${Math.round(ref / 1e6)}M in 2025 (gap or overlap)`);
  } else {
    const share = a / ref;
    if (share > 1.015) fail(`${y}: land area ${Math.round(a / 1e6)}M km² exceeds 2025 (overlap)`);
    if (share < 0.7) fail(`${y}: only ${(share * 100).toFixed(0)}% of land inside a drawn state`);
    if (share < prevShare - 0.03) fail(`${y}: drawn state area shrank sharply (${(prevShare * 100).toFixed(0)}% → ${(share * 100).toFixed(0)}%)`);
    prevShare = share;
  }
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

// 4. Handoff: no schematic empires from the handoff (1815 since Day 41), still there the year before.
const polityAt = (y) => getGlobePolygonFeatures(y).filter((f) => !['people', 'presence', 'nation'].includes(f.entityType));
if (!polityAt(NATIONS_HANDOFF_YEAR - 1).some((f) => f.entityId === 'british-empire')) fail(`${NATIONS_HANDOFF_YEAR - 1}: schematic British Empire should still be drawn`);
for (const y of [NATIONS_HANDOFF_YEAR, 1848, 1871, 1900, 1913, 1920, 1960, 2025]) {
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
  // Day 41: 1815–1913
  [1866, 'germany', false], [1867, 'germany', true], [1866, 'prussia', true], [1867, 'prussia', false], [1870, 'bavaria', true], [1871, 'bavaria', false],
  [1859, 'two-sicilies', true], [1860, 'two-sicilies', false], [1869, 'papal-states', true], [1870, 'papal-states', false],
  [1818, 'gran-colombia', false], [1819, 'gran-colombia', true], [1830, 'gran-colombia', true], [1831, 'gran-colombia', false],
  [1829, 'greece', false], [1830, 'greece', true], [1830, 'belgium', true], [1829, 'belgium', false], [1835, 'texas', false], [1836, 'texas', true], [1845, 'texas', false],
  [1877, 'bulgaria', false], [1878, 'bulgaria', true], [1912, 'albania', false], [1913, 'albania', true], [1904, 'norway', true],
  [1817, 'maratha', true], [1818, 'maratha', false], [1848, 'sikh-empire', true], [1849, 'sikh-empire', false],
  [1875, 'kokand', true], [1876, 'kokand', false], [1882, 'dr-congo', false], [1885, 'dr-congo', true], [1883, 'namibia', false], [1884, 'namibia', true],
  [1909, 'south-africa', true], [1910, 'natal', false], [1901, 'transvaal', true], [1902, 'transvaal', true], [1910, 'transvaal', false],
  [1878, 'ryukyu', true], [1879, 'ryukyu', false], [1867, 'japan', true], [1910, 'korea', true],
]) {
  if (has(y, id) !== want) fail(`${y}: ${id} should ${want ? '' : 'not '}be active`);
}
const africaStates = (y) => getActiveNationsAtYear(y).filter(({ entity, period }) => (period.kind || 'state') === 'state' && ['nigeria', 'ghana', 'senegal', 'mali', 'dr-congo', 'cameroon', 'chad', 'niger', 'cote-divoire', 'madagascar', 'kenya', 'tanzania', 'zambia', 'angola', 'mozambique'].includes(entity.tableId)).length;
if (africaStates(1955) > 1) fail(`1955: expected almost no independent sub-Saharan states in the sample, got ${africaStates(1955)}`);
if (africaStates(1966) < 12) fail(`1966: expected most of the sample independent, got ${africaStates(1966)}`);
// Day 41: the Scramble for Africa — few African colonies before the Berlin Conference, nearly all by 1900.
const AFRICA_IDS = new Set(['nigeria', 'ghana', 'senegal', 'mali', 'dr-congo', 'congo', 'gabon', 'car', 'chad', 'cameroon', 'togo', 'benin', 'niger', 'cote-divoire', 'burkina-faso', 'guinea', 'mauritania', 'madagascar', 'kenya', 'uganda', 'tanzania', 'rwanda', 'burundi', 'zambia', 'zimbabwe', 'malawi', 'botswana', 'namibia', 'angola', 'mozambique', 'somalia', 'eritrea', 'djibouti', 'sudan', 'egypt', 'tunisia', 'libya', 'morocco']);
const africaColonies = (y) => getActiveNationsAtYear(y).filter(({ entity, period }) => period.kind === 'colony' && AFRICA_IDS.has(entity.tableId)).length;
if (africaColonies(1875) > 10) fail(`1875: expected few African colonies before the Scramble, got ${africaColonies(1875)}`);
if (africaColonies(1900) < 30) fail(`1900: expected most of Africa colonised, got ${africaColonies(1900)}`);
// Names at real dates.
for (const [y, id, want] of [
  [1858, 'italy', 'Kingdom of Sardinia (Piedmont-Sardinia)'], [1861, 'italy', 'Kingdom of Italy'], [1868, 'germany', 'North German Confederation'],
  [1871, 'germany', 'German Empire'], [1866, 'austria-hungary', 'Austrian Empire'], [1867, 'austria-hungary', 'Austria-Hungary'],
  [1867, 'japan', 'Tokugawa Japan'], [1868, 'japan', 'Empire of Japan'], [1898, 'korea', 'Korean Empire'], [1911, 'china', 'Qing China'], [1912, 'china', 'Republic of China'],
  [1857, 'british-raj', 'Company rule in India (British East India Company)'], [1858, 'british-raj', 'British India (the Raj)'],
]) {
  const ent = getNationEntityById('nation-' + id, y);
  if (!ent || ent.name !== want) fail(`${y}: ${id} should be named “${want}”, got “${ent?.name}”`);
}

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
      // NATION_NEIGHBOURS is keyed by colour group; a colony's group is its ruler's, so only
      // flag a clash when the two groups really border each other (Day 41: many more colonies).
      const touching = ga === a && gb === b ? true : (NATION_NEIGHBOURS[ga] || []).includes(gb);
      if (ca && ca === cb && ga !== gb && touching) fail(`${y}: neighbours ${a} and ${b} share ${ca}`);
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

// 8. Day 40: the close-zoom set (nations-fine.topo.json) must be built from the same table, so
//    the globe can swap shape i's coarse geometry for fine shape i.
let fineNote = '';
try {
  const fine = JSON.parse(readFileSync(new URL('../src/data/nations-fine.topo.json', import.meta.url), 'utf8'));
  if (fine.objects?.shapes?.geometries?.length !== topo.objects.shapes.geometries.length) {
    fail(`nations-fine: ${fine.objects?.shapes?.geometries?.length} shapes vs ${topo.objects.shapes.geometries.length} — run npm run build:nations`);
  }
  if (JSON.stringify(fine.versions) !== JSON.stringify(topo.versions)) fail('nations-fine: versions differ from nations.topo.json — run npm run build:nations');
  const emptyFine = fine.objects.shapes.geometries.filter((g) => !g.arcs || !g.arcs.length).length;
  if (emptyFine) fail(`nations-fine: ${emptyFine} empty shapes`);
  fineNote = `, fine set in sync (${fine.meta?.simplifyKm2?.toFixed?.(0) ?? '?'} km²)`;
} catch (err) {
  fail(`nations-fine.topo.json missing or unreadable (${err.message}) — run npm run build:nations`);
}

if (failures) {
  console.error(`\n✗ nations: ${failures} check(s) failed`);
  process.exit(1);
}
console.log(`✓ nations: ${NATION_ENTITIES.length} nations, ${topo.versions.length} shape-periods, ${STEP_YEARS.length} sample years checked (handoff ${NATIONS_HANDOFF_YEAR})${fineNote}.`);
