/**
 * Day 70 — Phase 5 country pack 1, globe backfill: Iraq (ROADMAP item 12).
 *
 * Iraq had a sourced timeline (data/countries/iraq.json) but on the globe only one schematic
 * "Mesopotamia" sphere (3000–560 BCE), seven-point blobs for the Parthian, Sasanian, Umayyad and
 * Abbasid provinces, and nothing at all between the Abbasid collapse (c. 900) and the 1815 nations
 * layer except a stray Mongol wedge and Safavid and Ottoman outlines in the wrong years. This module
 * draws Iraq's history from the first city-states to the eve of the 1815 handoff:
 *
 *   Early Dynastic city-states · Akkad · Ur III · Isin · Larsa · Eshnunna · Mari · Assyria (Old,
 *   Middle and Neo-Assyrian) · Mitanni · Babylon (First Dynasty, Kassite, Second Isin and later
 *   dynasties) · the First Sealand dynasty · the Neo-Babylonian Empire · the Hamdanids of Mosul ·
 *   the Buyid emirs of Iraq · the Uqaylids · the Seljuks · the Zengid and Lu'lu'id atabegs of Mosul
 *   · the restored Abbasid caliphate · the Ilkhanate · the Jalayirids · the Qara Qoyunlu · the Aq
 *   Qoyunlu · Safavid Iraq and Safavid Baghdad · Ottoman Iraq (the eyalets of Baghdad, Mosul, Basra
 *   and Shahrizor, the Mamluk pashas) · the house of Afrasiyab at Basra
 *
 * From 1815 the nations layer takes over (Ottoman Iraq, Mandatory Iraq from 1919, the Kingdom in
 * 1932, the Republic in 1958), so no keyframe here is later than 1815.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - The land is cut into 10 "pieces" (the western and eastern Jazira, Suhum on the middle
 *    Euphrates, Assyria, the Kurdish uplands, Akkad, the Diyala, northern and southern Sumer and
 *    the Sealand) whose shared borders are the same point lists, so `mergeRings`
 *    (globe-med-pieces.js) fuses any set of touching pieces into one outline. The west edge is the
 *    Greek-world `MESOPOTAMIA` piece's own border with `SYRIA`, so Assyria and Babylon can take Syria
 *    and the Levant (P.SYRIA, P.COELE_SYRIA) without a seam. A polity is a dated list of pieces.
 *  - Lines follow the rivers, the desert edge and the Zagros foothills at roughly 20–40 km. They are
 *    hand-drawn approximations of where each power's cities and provinces lay, not surveyed borders.
 *  - Changes are drawn as dated steps: every change has a keyframe the year before (old extent) and
 *    the year of the change (new extent), so a shape never slides over a neighbour mid-morph. A
 *    polity's last step is the year before its successor's first.
 *  - Ancient city-states are small rings round their city (their fields and canals), not pieces.
 *
 * Dates before 1000 BCE follow the middle chronology and are approximate (± a few decades).
 */
import { ensureClockwise } from './globe-morph.js';
import { mergeRings, path, rev } from './globe-med-pieces.js';
import * as GP from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const UNESCO = (title, n) => ({ title: `UNESCO World Heritage — ${title}`, url: `https://whc.unesco.org/en/list/${n}/` });
const CAH = { title: 'Van De Mieroop, A History of the Ancient Near East, ca. 3000–323 BC (Wiley-Blackwell, 3rd ed. 2016)', url: 'https://www.wiley.com/en-us/A+History+of+the+Ancient+Near+East+ca+3000+323+BC%2C+3rd+Edition-p-9781118718230' };
const KENNEDY = { title: 'Kennedy, The Prophet and the Age of the Caliphates (Routledge, 3rd ed. 2016)', url: 'https://doi.org/10.4324/9781315665405' };
const CETINSAYA = { title: 'Encyclopaedia Iranica — Iraq iv. Relations in the Safavid period', url: 'https://www.iranicaonline.org/articles/iraq-iv-relations-in-the-safavid-period' };

// ---- Junctions and borders ([lng, lat]) ------------------------------------------------------------
//
// The west edge W0–W3 is exactly the Greek-world MESOPOTAMIA | SYRIA border (B_SYRIA_MESO).
const W0 = [38.0, 36.9];
const W1 = [38.4, 36.0];
const W2 = [38.6, 35.0];
const W3 = [38.5, 33.0];
const N1 = [40.5, 37.15]; // north edge: western / eastern Jazira
const NJ = [42.3, 37.3]; // north edge: eastern Jazira / Assyria (Zakho)
const E1 = [44.0, 37.1]; // north edge: Assyria / the Kurdish uplands (the Greek-world Media / Armenia corner)
const EH = [45.9, 34.35]; // Assyria / Kurdish uplands / Diyala (the Zagros foothills)
const DN = [46.92, 32.6]; // east edge: Diyala / northern Sumer
const NS_E = [47.4, 32.0]; // east edge: northern / southern Sumer
const SL2 = [47.877, 31.3]; // east edge: southern Sumer / the Sealand
const D = [48.3, 30.2]; // the Shatt al-Arab
const SL1 = [46.3, 30.6]; // south edge: southern Sumer / the Sealand (below Eridu)
const S44 = [44.5, 31.5]; // south edge: northern / southern Sumer
const AKS = [44.1, 31.8]; // south edge: Akkad / northern Sumer (Kufa)
const S42 = [42.5, 33.0]; // south edge: Akkad / Suhum
const JWS = [40.3, 35.45]; // western Jazira / eastern Jazira / Suhum (below Deir ez-Zor)
const TJS = [42.25, 35.35]; // eastern Jazira / Suhum / Assyria
const TSAK = [42.75, 34.45]; // Suhum / Assyria / Akkad
const TAD = [43.65, 34.9]; // Assyria / Akkad / Diyala (above Tikrit)
const TADS = [45.6, 32.6]; // Akkad / Diyala / northern Sumer

// Outer edges.
const O_N_W = [W0, [38.5, 36.9], N1];
const O_N_E = [N1, [41.3, 37.15], [42.0, 37.3], NJ];
const O_N_A = [NJ, [42.6, 37.3], [43.5, 37.33], E1];
const O_KURD = [E1, [44.8, 37.3], [45.3, 36.8], [45.9, 36.0], [46.2, 35.2], [46.05, 34.6], EH];
const O_E_D = [EH, [46.2, 33.5], DN];
const O_E_N = [DN, NS_E];
const O_E_S = [NS_E, [47.8, 31.5], SL2];
const O_E_SEA = [SL2, D];
const O_S_SEA = [D, [47.8, 29.9], SL1];
const O_S_S = [SL1, S44];
const O_S_N = [S44, AKS];
const O_S_A = [AKS, S42];
const O_S_SU = [S42, [40.5, 34.2], W3];
const O_W_SU = [W3, W2];
const O_W_J = [W2, W1, W0];
// Inner borders.
const B_JWE = [N1, [40.6, 36.3], JWS]; // the Khabur: western / eastern Jazira
const B_JWSU = [W2, JWS];
const B_JESU = [JWS, TJS];
const B_JEA = [TJS, [42.35, 36.2], [42.3, 36.95], NJ]; // Jebel Sinjar to the Tigris above Mosul
const B_SUA = [TJS, TSAK];
const B_SUAK = [TSAK, [42.95, 33.7], S42]; // Hit: Suhum / Akkad
const B_AAK = [TSAK, TAD];
const B_AD = [TAD, [44.4, 34.95], [45.2, 34.7], EH]; // Jebel Hamrin
// Zagros foothills; to (45.2, 35.82) this is the Greek-world MESOPOTAMIA | MEDIA border (B_MESO_IRAN),
// so Assyria and Babylonia never overlap the Persian shapes east of it.
const B_KA = [E1, [44.7, 36.35], [45.2, 35.82], [45.55, 34.9], EH];
const B_AKD = [TAD, [44.0, 34.15], [44.45, 33.3], [45.0, 32.85], TADS]; // the Tigris
const B_AKN = [AKS, [44.9, 32.2], TADS]; // Akkad / Sumer, above Nippur
const B_DN = [TADS, DN];
const B_NS = [S44, [45.4, 31.5], [46.0, 31.62], [46.4, 31.7], [46.9, 31.85], NS_E]; // above Uruk and Girsu
const B_SSEA = [SL1, [46.6, 30.95], [47.2, 31.3], SL2]; // the head of the marshes

/** The pieces: shared borders point for point, so any touching set merges into one outline. */
export const IRAQ_PIECES = {
  JAZ_W: path(O_N_W, B_JWE, rev(B_JWSU), O_W_J), // Harran, the Balikh, Raqqa, Washukanni
  JAZ_E: path(O_N_E, rev(B_JEA), rev(B_JESU), rev(B_JWE)), // the Khabur, Nisibis, Shubat-Enlil, Sinjar
  ASSUR: path(O_N_A, B_KA, rev(B_AD), rev(B_AAK), rev(B_SUA), B_JEA), // Assur, Nineveh, Nimrud, Arbela, Arrapha
  KURD: path(O_KURD, rev(B_KA)), // the Kurdish uplands: Rawanduz, Shahrizor, Halabja
  SUHU: path(B_JWSU, B_JESU, B_SUA, B_SUAK, O_S_SU, O_W_SU), // Suhum and Khana: Mari, Terqa, Anah, Hit
  AKKAD: path(B_AAK, B_AKD, rev(B_AKN), O_S_A, rev(B_SUAK)), // Kish, Babylon, Sippar, Borsippa, Baghdad
  DIYALA: path(B_AD, O_E_D, rev(B_DN), rev(B_AKD)), // Eshnunna, Der, the Diyala
  NSUM: path(B_AKN, B_DN, O_E_N, rev(B_NS), O_S_N), // Nippur, Isin, Shuruppak, Adab, Umma, Wasit
  SSUM: path(B_NS, O_E_S, rev(B_SSEA), O_S_S), // Uruk, Larsa, Ur, Eridu, Lagash, Girsu
  SEA: path(B_SSEA, O_E_SEA, O_S_SEA), // the Sealand: the marshes, Basra
};
const PC = { ...IRAQ_PIECES, SYRIA: GP.SYRIA, LEVANT: GP.COELE_SYRIA };

const LOWER = ['AKKAD', 'DIYALA', 'NSUM', 'SSUM', 'SEA'];
const SUMER = ['NSUM', 'SSUM', 'SEA'];
const JAZ = ['JAZ_W', 'JAZ_E'];
const IRAQ = [...LOWER, 'SUHU', 'ASSUR', 'KURD'];

/** A small ring round a city (its fields and canals): octagon of radius r° (lat). */
function around(lng, lat, r) {
  const k = Math.cos((lat * Math.PI) / 180);
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    pts.push([Math.round((lng + (r / k) * Math.cos(a)) * 1000) / 1000, Math.round((lat + r * Math.sin(a)) * 1000) / 1000]);
  }
  pts.push(pts[0]);
  return ensureClockwise(pts);
}
export const CITY_RINGS = {
  kish: ['Kish', around(44.6, 32.54, 0.28)],
  uruk: ['Uruk', around(45.64, 31.32, 0.19)],
  ur: ['Ur', around(46.1, 30.96, 0.19)],
  lagash: ['Lagash (Girsu)', around(46.3, 31.48, 0.19)],
  umma: ['Umma', around(45.89, 31.67, 0.15)],
  adab: ['Adab', around(45.63, 31.95, 0.14)],
  mari: ['Mari', around(40.89, 34.55, 0.3)],
  eshnunna: ['Eshnunna', around(44.73, 33.48, 0.24)],
  assur: ['Assur', around(43.26, 35.46, 0.26)],
};

// ---- Building a polity from its dated piece list -----------------------------------------------------

const P = (names) => names.map((n) => {
  if (!PC[n]) throw new Error(`iraq pack: no piece ${n}`);
  return PC[n];
});
/** A region: [name, [PIECE names]] or [name, 'city:<key>'] for a city ring. */
const S = (year, label, regions) => [year, label, regions];

/**
 * steps: [[year, label, { regionId: [name, pieces | 'city:<key>'] }], …]. Keyframes are written for
 * every step year and the year before it (still the old extent), so each change is a one-year step.
 */
export const IRAQ_STEPS = {};
function build(meta, steps) {
  IRAQ_STEPS[meta.id] = steps;
  const years = new Set();
  steps.forEach(([y], i) => {
    years.add(y);
    if (i > 0 && y - 1 > steps[i - 1][0]) years.add(y - 1);
  });
  const overlays = [...years].sort((x, y) => x - y).map((y) => {
    let s = steps[0];
    for (const st of steps) if (st[0] <= y) s = st;
    const regions = Object.entries(s[2]).map(([rid, [name, pieces]]) => {
      if (typeof pieces === 'string') return { id: rid, name, ring: CITY_RINGS[pieces.slice(5)][1] };
      const ps = P(pieces);
      const ring = ps.length === 1 ? ensureClockwise(ps[0]) : ensureClockwise(mergeRings(`${meta.id} ${y} ${rid}`, ...ps));
      return { id: rid, name, ring };
    });
    return { year: y, label: s[1], approximation: A, regions };
  });
  return { edgeGrace: 1, keyYears: steps.map(([y]) => y), type: 'state', ...meta, overlays };
}

// ---- Confidence --------------------------------------------------------------------------------------

const CONF = {
  cities: {
    level: 'conjectural',
    reason: 'Early Dynastic city-states are known from royal inscriptions, the Sumerian King List and excavated temples. Each ruled its city and the fields and canals round it; how far that reached is not recorded, so each is a small ring round the city.',
  },
  bronze: {
    level: 'approximate',
    reason: 'Royal inscriptions, year names, letters and administrative archives say which cities each king held and when (middle chronology, ± a few decades). Between the cities, and out into the steppe and the mountains, borders are drawn roughly along rivers and the desert edge.',
  },
  obscure: {
    level: 'conjectural',
    reason: 'Known mostly from what neighbours wrote (king lists, a few letters and treaties) and from scattered excavated sites. Where the kingdom’s frontier ran, and even its exact dates, are uncertain; the outline is the region it is thought to have held.',
  },
  assyria: {
    level: 'approximate',
    reason: 'Assyrian annals, eponym lists and provincial letters record the provinces, campaigns and dates in detail. Vassal kingdoms, the steppe and the mountains are drawn as part of the empire only where Assyria governed them directly; frontiers are drawn roughly.',
  },
  emirate: {
    level: 'approximate',
    reason: 'Chronicles (Miskawayh, Ibn al-Athir, Ibn Khaldun) record which cities each dynasty held and when. Between the cities, rule meant the allegiance of tribes and governors, so borders are drawn roughly and only the Iraqi part of a wider realm is drawn here.',
  },
  turkmen: {
    level: 'approximate',
    reason: 'Persian and Arabic chronicles record when each dynasty took Baghdad, Mosul and the south. These were realms based in Iran, Azerbaijan or Anatolia; only their Iraqi provinces are drawn here, and southern Iraq was often in the hands of tribes and local rulers.',
  },
  ottoman: {
    level: 'approximate',
    reason: 'The eyalets of Baghdad, Mosul, Basra and Shahrizor and the years they changed hands are documented in Ottoman registers and Safavid chronicles. Their frontiers with Persia and among the tribes of the south and the mountains were zones, drawn roughly here.',
  },
};

const MESO_LINKS = ['mesopotamia', 'iraq-sumer-akkad', 'iraq-babylon-assyria'];

// ---- Early Dynastic city-states, c. 2900–2334 BCE ------------------------------------------------------

const ED = { kish: ['Kish', 'city:kish'], uruk: ['Uruk', 'city:uruk'], ur: ['Ur', 'city:ur'], lagash: ['Lagash', 'city:lagash'], umma: ['Umma', 'city:umma'], adab: ['Adab', 'city:adab'], mari: ['Mari', 'city:mari'], eshnunna: ['Eshnunna', 'city:eshnunna'] };
const cityStates = build({
  id: 'sumerian-city-states', name: 'Sumerian city-states', color: '#D97706',
  description: 'In the Early Dynastic period (c. 2900–2334 BCE) southern Mesopotamia was a land of rival walled city-states — Kish, Uruk, Ur, Lagash, Umma, Adab and others — each ruled by a king (lugal) or governor (ensi) in the name of its god. Kish’s kings claimed a wider kingship; Ur’s royal tombs held astonishing wealth; Lagash and Umma fought for generations over the fertile Gu-edena plain (the Stele of the Vultures). Lugal-zage-si of Umma briefly united Sumer from Uruk before Sargon of Akkad defeated him. Mari on the middle Euphrates and Eshnunna on the Diyala were city-states of the same world.',
  timelineItemIds: MESO_LINKS, confidence: CONF.cities,
  sources: [W('Early Dynastic Period (Mesopotamia)'), W('Sumer'), W('Lagash'), W('Lugal-zage-si'), W('Stele of the Vultures'), CAH],
}, [
  S(-2900, 'Early Dynastic city-states', ED),
  S(-2600, 'Kish claims hegemony; the royal tombs of Ur', ED),
  S(-2450, 'Eannatum of Lagash defeats Umma (Stele of the Vultures)', ED),
  S(-2350, 'Lugal-zage-si of Umma rules Sumer from Uruk', ED),
  S(-2335, 'Sargon of Akkad defeats Lugal-zage-si (c. 2334)', ED),
]);

// ---- Akkadian Empire, c. 2334–2154 BCE ---------------------------------------------------------------

const akkad = build({
  id: 'akkadian-empire', name: 'Akkadian Empire', color: '#B45309',
  description: 'Sargon, once cupbearer to the king of Kish, founded a new capital at Akkad (Agade, whose site is still unknown) around 2334 BCE, defeated Lugal-zage-si and united Sumer and Akkad under one king — often called the first empire. His successors campaigned from Elam to the Mediterranean; his grandson Naram-Sin called himself “king of the four quarters” and a god, and left the Victory Stele over the Lullubi of the Zagros. Revolts, the Gutians from the mountains and drought brought the empire down after Shar-kali-sharri (c. 2193 BCE). Elam and the empire’s Syrian conquests are not drawn.',
  timelineItemIds: MESO_LINKS, confidence: CONF.bronze,
  sources: [W('Akkadian Empire'), W('Sargon of Akkad'), W('Naram-Sin of Akkad'), W('Victory Stele of Naram-Sin'), CAH],
}, [
  S(-2334, 'Sargon founds Akkad and defeats Lugal-zage-si', { akkad: ['Sumer and Akkad', ['AKKAD', ...SUMER]] }),
  S(-2300, 'Sargon’s empire: Eshnunna, Mari and Assur', { akkad: ['Akkadian Empire', [...LOWER, 'SUHU', 'ASSUR']] }),
  S(-2254, 'Naram-Sin, “king of the four quarters”', { akkad: ['Akkadian Empire', [...LOWER, 'SUHU', 'ASSUR', 'KURD', ...JAZ]] }),
  S(-2217, 'Shar-kali-sharri: revolts and Gutian raids', { akkad: ['Akkadian Empire', [...LOWER, 'SUHU', 'ASSUR']] }),
  S(-2193, '“Who was king? Who was not?” — anarchy', { akkad: ['Akkad', ['AKKAD']] }),
  S(-2154, 'End of the Akkadian dynasty', { akkad: ['Akkad', ['AKKAD']] }),
]);

// ---- Third Dynasty of Ur, c. 2112–2004 BCE ---------------------------------------------------------

const urIII = build({
  id: 'ur-iii', name: 'Third Dynasty of Ur', color: '#0B7285',
  description: 'Ur-Nammu of Ur founded the “Neo-Sumerian” state around 2112 BCE and built the great ziggurat of Ur; his son Shulgi (r. c. 2094–2047) turned it into a centralised kingdom of provinces under governors, with standard weights, calendars and tens of thousands of surviving administrative tablets. It reached Assur and the Zagros foothills. Under Ibbi-Sin, Eshnunna broke away, Ishbi-Erra made himself king at Isin (c. 2017), and Elamites sacked Ur in about 2004 BCE. Its eastern provinces in Elam are not drawn.',
  timelineItemIds: MESO_LINKS, confidence: CONF.bronze,
  sources: [W('Third Dynasty of Ur'), W('Ur-Nammu'), W('Shulgi'), W('Ziggurat of Ur'), CAH],
}, [
  S(-2112, 'Ur-Nammu founds the Third Dynasty of Ur', { ur: ['Sumer and Akkad', ['AKKAD', ...SUMER]] }),
  S(-2094, 'Shulgi', { ur: ['Sumer and Akkad', [...LOWER]] }),
  S(-2060, 'Shulgi’s kingdom of provinces: Assur under an Ur governor', { ur: ['Ur III state', [...LOWER, 'ASSUR']] }),
  S(-2026, 'Ibbi-Sin: Eshnunna and Assur break away', { ur: ['Sumer and Akkad', ['AKKAD', ...SUMER]] }),
  S(-2017, 'Ishbi-Erra makes himself king at Isin', { ur: ['Ur and the south', ['SSUM', 'SEA']] }),
  S(-2004, 'Elamites sack Ur', { ur: ['Ur and the south', ['SSUM', 'SEA']] }),
]);

// ---- Isin, Larsa, Eshnunna, Mari (c. 2026–1761 BCE) --------------------------------------------------

const isin = build({
  id: 'isin-dynasty', name: 'Isin', color: '#65A30D',
  description: 'Ishbi-Erra, an official of Ibbi-Sin, made himself king at Isin around 2017 BCE, drove the Elamites from Ur and claimed the old kingship of Sumer and Akkad. Isin’s kings, among them the law-giver Lipit-Ishtar, held Nippur and the south until Gungunum of Larsa took Ur (c. 1926). Rim-Sin of Larsa conquered Isin in 1794 BCE.',
  timelineItemIds: MESO_LINKS, confidence: CONF.bronze,
  sources: [W('Isin'), W('Ishbi-Erra'), W('Lipit-Ishtar'), CAH],
}, [
  S(-2017, 'Ishbi-Erra founds the dynasty of Isin', { isin: ['Isin and Nippur', ['NSUM']] }),
  S(-2000, 'Isin, heir of Ur, rules Sumer and Akkad', { isin: ['Kingdom of Isin', ['AKKAD', ...SUMER]] }),
  S(-1930, 'Lipit-Ishtar’s law code (c. 1930)', { isin: ['Kingdom of Isin', ['AKKAD', ...SUMER]] }),
  S(-1926, 'Gungunum of Larsa takes Ur', { isin: ['Kingdom of Isin', ['AKKAD', 'NSUM']] }),
  S(-1894, 'Babylon becomes a kingdom', { isin: ['Isin and Nippur', ['NSUM']] }),
  S(-1795, 'Rim-Sin of Larsa conquers Isin (1794)', { isin: ['Isin and Nippur', ['NSUM']] }),
]);

const larsa = build({
  id: 'larsa-dynasty', name: 'Larsa', color: '#A21CAF',
  description: 'Larsa, near Uruk, rose when its king Gungunum took Ur from Isin around 1926 BCE. Its last king, Rim-Sin I (r. c. 1822–1763), ruled the longest of any Mesopotamian king, took Uruk and in 1794 BCE conquered Isin, uniting the south — until Hammurabi of Babylon besieged and took Larsa in 1763 BCE.',
  timelineItemIds: MESO_LINKS, confidence: CONF.bronze,
  sources: [W('Larsa'), W('Gungunum'), W('Rim-Sin I'), CAH],
}, [
  S(-1926, 'Gungunum takes Ur', { larsa: ['Kingdom of Larsa', ['SSUM', 'SEA']] }),
  S(-1822, 'Rim-Sin I', { larsa: ['Kingdom of Larsa', ['SSUM', 'SEA']] }),
  S(-1794, 'Rim-Sin conquers Isin', { larsa: ['Kingdom of Larsa', [...SUMER]] }),
  S(-1764, 'Hammurabi besieges Larsa (1763)', { larsa: ['Kingdom of Larsa', [...SUMER]] }),
]);

const eshnunna = build({
  id: 'eshnunna', name: 'Eshnunna', color: '#0D9488',
  description: 'The city-state of Eshnunna on the Diyala broke away from Ur III in Ibbi-Sin’s reign (c. 2026 BCE) and became the leading power of the Diyala valley, with its own law code (the Laws of Eshnunna). It fought Mari, Assyria and Babylon for the Tigris corridor until Hammurabi occupied it in 1762 BCE.',
  timelineItemIds: MESO_LINKS, confidence: CONF.bronze,
  sources: [W('Eshnunna'), W('Laws of Eshnunna'), CAH],
}, [
  S(-2026, 'Eshnunna breaks away from Ur', { eshnunna: ['Eshnunna', ['DIYALA']] }),
  S(-1850, 'The kingdom of the Diyala', { eshnunna: ['Eshnunna', ['DIYALA']] }),
  S(-1763, 'Hammurabi occupies Eshnunna (1762)', { eshnunna: ['Eshnunna', ['DIYALA']] }),
]);

const mari = build({
  id: 'mari-kingdom', name: 'Mari', color: '#9333EA',
  description: 'Mari on the middle Euphrates controlled the river trade between Sumer and Syria. Under the Lim dynasty (from c. 1830 BCE) it was a regional kingdom; Shamshi-Adad I took it and installed his son Yasmah-Adad, and Zimri-Lim recovered the throne after Shamshi-Adad’s death (c. 1775). Zimri-Lim’s palace archive of some 25,000 tablets is one of the richest sources for the age. Hammurabi, his former ally, sacked Mari in 1761 BCE.',
  timelineItemIds: MESO_LINKS, confidence: CONF.bronze,
  sources: [W('Mari, Syria'), W('Zimri-Lim'), W('Yasmah-Adad'), CAH],
}, [
  S(-1830, 'The Lim dynasty at Mari', { mari: ['Kingdom of Mari', ['SUHU']] }),
  S(-1796, 'Yasmah-Adad, son of Shamshi-Adad, rules Mari', { mari: ['Mari (under Shamshi-Adad)', ['SUHU']] }),
  S(-1775, 'Zimri-Lim retakes the throne', { mari: ['Kingdom of Mari', ['SUHU']] }),
  S(-1762, 'Hammurabi sacks Mari (1761)', { mari: ['Kingdom of Mari', ['SUHU']] }),
]);

// ---- Assyria, c. 2025–609 BCE ------------------------------------------------------------------------

const assyria = build({
  id: 'assyria', name: 'Assyria', color: '#B91C1C',
  description: 'The city of Assur on the Tigris became an independent city-state around 2025 BCE, rich from its merchants’ trade with Anatolia (Kanesh). Shamshi-Adad I (c. 1808–1776) briefly built a Kingdom of Upper Mesopotamia; later Assur was a vassal of Mitanni. Ashur-uballit I (c. 1363) began the Middle Assyrian Empire, which annexed Hanigalbat and sacked Babylon, then shrank to its heartland under Aramaean pressure. From Adad-nirari II (911) the Neo-Assyrian Empire reconquered the north, built Kalhu, Dur-Sharrukin and Nineveh, ruled Babylonia from 729 and Egypt for a time (Egypt is not drawn). Babylon broke free in 626; the Medes and Babylonians sacked Assur (614) and Nineveh (612), and the last king fell at Harran in 610–609.',
  nameAt: [[-2025, 'Old Assyrian city-state'], [-1808, 'Kingdom of Upper Mesopotamia'], [-1776, 'Assur'], [-1363, 'Middle Assyrian Empire'], [-911, 'Neo-Assyrian Empire']],
  timelineItemIds: MESO_LINKS, confidence: CONF.assyria,
  sources: [W('Assyria'), W('Old Assyrian period'), W('Shamshi-Adad I'), W('Middle Assyrian Empire'), W('Neo-Assyrian Empire'), W('Fall of Assyria'), UNESCO('Ashur (Qal’at Sherqat)', 1130), CAH],
}, [
  S(-2025, 'Puzur-Ashur I: Assur independent', { assyria: ['Assur', 'city:assur'] }),
  S(-1950, 'Assur’s merchants trade with Kanesh', { assyria: ['Assur', 'city:assur'] }),
  S(-1808, 'Shamshi-Adad I takes Assur: the Kingdom of Upper Mesopotamia', { assyria: ['Kingdom of Upper Mesopotamia', ['ASSUR', ...JAZ]] }),
  S(-1776, 'Shamshi-Adad dies; the kingdom falls apart', { assyria: ['Assur', 'city:assur'] }),
  S(-1500, 'Assur a vassal of Mitanni', { assyria: ['Assur', 'city:assur'] }),
  S(-1363, 'Ashur-uballit I: the Middle Assyrian Empire', { assyria: ['Assyria', ['ASSUR']] }),
  S(-1260, 'Shalmaneser I annexes Hanigalbat', { assyria: ['Assyria', ['ASSUR', ...JAZ]] }),
  S(-1225, 'Tukulti-Ninurta I sacks Babylon', { assyria: ['Assyria', ['ASSUR', ...JAZ]] }),
  S(-1114, 'Tiglath-Pileser I', { assyria: ['Assyria', ['ASSUR', ...JAZ]] }),
  S(-1050, 'Aramaean migrations: Assyria shrinks to its heartland', { assyria: ['Assyria', ['ASSUR']] }),
  S(-911, 'Adad-nirari II: the Neo-Assyrian Empire', { assyria: ['Assyria', ['ASSUR']] }),
  S(-890, 'Upper Mesopotamia reconquered', { assyria: ['Assyria', ['ASSUR', ...JAZ]] }),
  S(-880, 'Ashurnasirpal II builds Kalhu; Zamua and Suhu', { assyria: ['Assyria', ['ASSUR', ...JAZ, 'KURD', 'SUHU']] }),
  S(-740, 'Tiglath-Pileser III takes Arpad: Syria annexed', { assyria: ['Assyria', ['ASSUR', ...JAZ, 'KURD', 'SUHU']], syria: ['Syria', ['SYRIA']] }),
  S(-732, 'Damascus falls; Israel and Judah under Assyria', { assyria: ['Assyria', ['ASSUR', ...JAZ, 'KURD', 'SUHU']], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-729, 'Tiglath-Pileser III takes the crown of Babylon', { assyria: ['Assyria and Babylonia', [...IRAQ, ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-721, 'Merodach-baladan holds Babylon (721–710); Sargon II', { assyria: ['Assyria and Babylonia', [...IRAQ, ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-689, 'Sennacherib destroys Babylon', { assyria: ['Assyria and Babylonia', [...IRAQ, ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-671, 'Esarhaddon conquers Egypt (not drawn)', { assyria: ['Assyria and Babylonia', [...IRAQ, ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-652, 'Shamash-shum-ukin’s revolt (652–648); Ashurbanipal', { assyria: ['Assyria and Babylonia', [...IRAQ, ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-626, 'Nabopolassar takes Babylon', { assyria: ['Assyria', ['ASSUR', ...JAZ, 'KURD', 'SUHU']], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-616, 'The Babylonians advance up the Euphrates', { assyria: ['Assyria', ['ASSUR', ...JAZ, 'KURD']], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-612, 'Nineveh falls; Ashur-uballit II at Harran', { assyria: ['Assyria (Harran)', [...JAZ]], syria: ['Syria', ['SYRIA']] }),
  S(-610, 'Harran falls (610–609)', { assyria: ['Assyria (Harran)', [...JAZ]], syria: ['Syria', ['SYRIA']] }),
]);

// ---- Mitanni, c. 1550–1260 BCE ---------------------------------------------------------------------

const mitanni = build({
  id: 'mitanni', name: 'Mitanni', color: '#7C3AED',
  description: 'A Hurrian-speaking kingdom with Indo-Aryan-named kings, centred on the Khabur basin (its capital Washukanni has not been securely found). In the 15th century BCE it was a great power that rivalled Egypt and held Assur and Arrapha (Kirkuk, whose Nuzi tablets come from this time) as vassals. The Hittite Suppiluliuma I sacked Washukanni around 1350; the rump kingdom of Hanigalbat was annexed by Shalmaneser I of Assyria (c. 1260).',
  timelineItemIds: MESO_LINKS, confidence: CONF.obscure,
  sources: [W('Mitanni'), W('Washukanni'), W('Nuzi'), CAH],
}, [
  S(-1550, 'The Hurrian kingdom of Mitanni', { mitanni: ['Mitanni', [...JAZ]] }),
  S(-1500, 'Mitanni, rival of Egypt; Assur a vassal', { mitanni: ['Mitanni', [...JAZ]] }),
  S(-1350, 'Suppiluliuma I sacks Washukanni: Hanigalbat', { mitanni: ['Hanigalbat', [...JAZ]] }),
  S(-1261, 'Shalmaneser I of Assyria annexes Hanigalbat (1260)', { mitanni: ['Hanigalbat', [...JAZ]] }),
]);

// ---- Babylon, 1894–730 BCE -----------------------------------------------------------------------

const babylon = build({
  id: 'babylonia', name: 'Babylonia', color: '#1D4ED8',
  description: 'Babylon became the seat of an Amorite dynasty under Sumu-abum (c. 1894 BCE). Hammurabi (r. 1792–1750) conquered Larsa, Eshnunna and Mari and issued his law code; under his son Samsu-iluna the south was lost to the Sealand. The Hittite king Mursili I sacked Babylon in 1595, and Kassite kings ruled Babylonia for over four centuries, conquering the Sealand and building Dur-Kurigalzu. Elam ended the Kassite dynasty (c. 1155); the Second Dynasty of Isin produced Nebuchadnezzar I, and then weak dynasties faced Aramaean and Chaldean tribes until Tiglath-Pileser III of Assyria took the crown in 729 BCE.',
  nameAt: [[-1894, 'Babylon (First Dynasty)'], [-1570, 'Kassite Babylonia'], [-1153, 'Babylonia (Second Dynasty of Isin)'], [-1025, 'Babylonia']],
  timelineItemIds: MESO_LINKS, confidence: CONF.bronze,
  sources: [W('First Babylonian dynasty'), W('Hammurabi'), W('Code of Hammurabi'), W('Kassites'), W('Second Dynasty of Isin'), W('Nebuchadnezzar I'), UNESCO('Babylon', 278), CAH],
}, [
  S(-1894, 'Sumu-abum: the First Dynasty of Babylon', { babylon: ['Babylon', ['AKKAD']] }),
  S(-1792, 'Hammurabi', { babylon: ['Babylon', ['AKKAD']] }),
  S(-1763, 'Hammurabi conquers Larsa', { babylon: ['Babylonia', ['AKKAD', ...SUMER]] }),
  S(-1762, 'Eshnunna taken', { babylon: ['Babylonia', [...LOWER]] }),
  S(-1761, 'Mari sacked; the Code of Hammurabi', { babylon: ['Babylonia', [...LOWER, 'SUHU']] }),
  S(-1749, 'Samsu-iluna: revolts in the south', { babylon: ['Babylonia', [...LOWER, 'SUHU']] }),
  S(-1732, 'The south lost to the Sealand', { babylon: ['Babylonia', ['AKKAD', 'DIYALA', 'NSUM']] }),
  S(-1595, 'Mursili I of Hatti sacks Babylon', { babylon: ['Babylonia', ['AKKAD', 'DIYALA']] }),
  S(-1570, 'Kassite kings rule Babylon', { babylon: ['Babylonia', ['AKKAD', 'DIYALA', 'NSUM']] }),
  S(-1475, 'The Kassites conquer the Sealand', { babylon: ['Babylonia', [...LOWER]] }),
  S(-1375, 'Kurigalzu I builds Dur-Kurigalzu', { babylon: ['Babylonia', [...LOWER]] }),
  S(-1225, 'Tukulti-Ninurta I of Assyria sacks Babylon', { babylon: ['Babylonia', [...LOWER]] }),
  S(-1155, 'Elam ends the Kassite dynasty', { babylon: ['Babylonia', [...LOWER]] }),
  S(-1121, 'Nebuchadnezzar I brings Marduk home', { babylon: ['Babylonia', [...LOWER]] }),
  S(-1025, 'Aramaean and Chaldean tribes; weak dynasties', { babylon: ['Babylonia', [...LOWER]] }),
  S(-747, 'Nabonassar: the Babylonian Chronicles begin', { babylon: ['Babylonia', [...LOWER]] }),
  S(-730, 'Tiglath-Pileser III takes the crown (729)', { babylon: ['Babylonia', [...LOWER]] }),
]);

const sealand = build({
  id: 'sealand-dynasty', name: 'First Sealand dynasty', color: '#0369A1',
  description: 'An enigmatic line of kings of the marshes at the head of the Gulf who broke away from Babylon under Samsu-iluna (very speculatively c. 1732 BCE) and ruled the far south, including Ur and Uruk, for about two and a half centuries. They are known mostly from king lists and a recently found archive. The Kassite Ulam-Buriash conquered the Sealand (c. 1475 BCE).',
  timelineItemIds: MESO_LINKS, confidence: CONF.obscure,
  sources: [W('First Sealand dynasty'), CAH],
}, [
  S(-1732, 'The Sealand breaks away from Babylon', { sealand: ['The Sealand', ['SSUM', 'SEA']] }),
  S(-1600, 'Kings of the Sealand', { sealand: ['The Sealand', ['SSUM', 'SEA']] }),
  S(-1476, 'The Kassite Ulam-Buriash conquers the Sealand (c. 1475)', { sealand: ['The Sealand', ['SSUM', 'SEA']] }),
]);

// ---- Neo-Babylonian Empire, 626–539 BCE -----------------------------------------------------------

const neoBabylon = build({
  id: 'neo-babylonian-empire', name: 'Neo-Babylonian Empire', color: '#2563EB',
  description: 'Nabopolassar, a Chaldean, was crowned king of Babylon in 626 BCE and with the Medes destroyed Assyria (Nineveh 612, Harran 610–609). His son Nebuchadnezzar II beat Egypt at Carchemish (605), took Jerusalem (597, 587) and rebuilt Babylon with the Ishtar Gate and the great ziggurat Etemenanki. The last king, Nabonidus, spent ten years at Tayma in Arabia leaving his son Belshazzar in Babylon; Cyrus the Great took Babylon in 539 BCE.',
  timelineItemIds: MESO_LINKS, confidence: CONF.assyria,
  sources: [W('Neo-Babylonian Empire'), W('Nabopolassar'), W('Nebuchadnezzar II'), W('Nabonidus'), W('Fall of Babylon'), UNESCO('Babylon', 278), CAH],
}, [
  S(-626, 'Nabopolassar crowned in Babylon', { babylonia: ['Babylonia', [...LOWER]] }),
  S(-616, 'Up the Euphrates', { babylonia: ['Babylonia', [...LOWER, 'SUHU']] }),
  S(-612, 'Nineveh falls; Assyria divided with the Medes', { babylonia: ['Babylonia and Assyria', [...LOWER, 'SUHU', 'ASSUR']] }),
  S(-609, 'Harran taken', { babylonia: ['Babylonia and Assyria', [...LOWER, 'SUHU', 'ASSUR', ...JAZ]] }),
  S(-605, 'Carchemish: Syria and the Levant', { babylonia: ['Babylonia and Assyria', [...LOWER, 'SUHU', 'ASSUR', ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['Phoenicia, Israel and Judah', ['LEVANT']] }),
  S(-587, 'Jerusalem destroyed', { babylonia: ['Babylonia and Assyria', [...LOWER, 'SUHU', 'ASSUR', ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['The Levant', ['LEVANT']] }),
  S(-552, 'Nabonidus at Tayma; Belshazzar in Babylon', { babylonia: ['Babylonia and Assyria', [...LOWER, 'SUHU', 'ASSUR', ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['The Levant', ['LEVANT']] }),
  S(-540, 'Cyrus takes Babylon (539)', { babylonia: ['Babylonia and Assyria', [...LOWER, 'SUHU', 'ASSUR', ...JAZ]], syria: ['Syria', ['SYRIA']], levant: ['The Levant', ['LEVANT']] }),
]);

// ---- Emirs of the 10th–12th centuries -------------------------------------------------------------

const ISLAMIC = ['iraq-abbasid-baghdad', 'iraq-emirs-sultans'];
const LOWER_IRAQ = [...LOWER, 'SUHU'];
const MOSUL = ['ASSUR', ...JAZ];

const hamdanids = build({
  id: 'hamdanids-mosul', name: 'Hamdanids of Mosul', color: '#15803D',
  description: 'An Arab dynasty of the Banu Taghlib. Abdallah ibn Hamdan was made governor of Mosul in 905; his son Nasir al-Dawla ruled Mosul and the Jazira from 929, was briefly amir al-umara in Baghdad (942–943), and his brother Sayf al-Dawla took Aleppo (945). The Buyid Adud al-Dawla drove them from Mosul in 979; the Uqaylids and Marwanids divided their lands.',
  timelineItemIds: ISLAMIC, confidence: CONF.emirate,
  sources: [W('Hamdanid dynasty'), W('Nasir al-Dawla'), KENNEDY],
}, [
  S(929, 'Nasir al-Dawla governor of Mosul', { mosul: ['Mosul and the Jazira', MOSUL] }),
  S(942, 'Nasir al-Dawla amir al-umara in Baghdad (942–943)', { mosul: ['Mosul and the Jazira', MOSUL] }),
  S(968, 'Nasir al-Dawla deposed by his sons', { mosul: ['Mosul and the Jazira', MOSUL] }),
  S(978, 'Adud al-Dawla takes Mosul (979)', { mosul: ['Mosul and the Jazira', MOSUL] }),
]);

const buyids = build({
  id: 'buyid-iraq', name: 'Buyid emirs of Iraq', color: '#1F7A63',
  description: 'The Buyids, a Daylamite family from the Caspian mountains, took Fars and the Jibal in the 930s; Mu‘izz al-Dawla entered Baghdad in 945 and the Abbasid caliphs became their figureheads. Adud al-Dawla (d. 983) united the Buyid lands, took Mosul (979) and rebuilt Baghdad. Mosul passed to the Uqaylids around 990, and the Seljuk Tughril Beg ended Buyid rule in Baghdad in 1055. Only the Iraqi part of the Buyid realm is drawn.',
  timelineItemIds: ISLAMIC, confidence: CONF.emirate,
  sources: [W('Buyid dynasty'), W('Mu\'izz al-Dawla'), W('Adud al-Dawla'), KENNEDY],
}, [
  S(945, 'Mu‘izz al-Dawla enters Baghdad', { iraq: ['Buyid Iraq', LOWER_IRAQ] }),
  S(979, 'Adud al-Dawla takes Mosul', { iraq: ['Buyid Iraq', [...LOWER_IRAQ, ...MOSUL]] }),
  S(990, 'Mosul lost to the Uqaylids', { iraq: ['Buyid Iraq', LOWER_IRAQ] }),
  S(1054, 'Tughril Beg enters Baghdad (1055)', { iraq: ['Buyid Iraq', LOWER_IRAQ] }),
]);

const uqaylids = build({
  id: 'uqaylids', name: 'Uqaylids', color: '#7A9A1A',
  description: 'A Shi‘i Arab dynasty of the Banu Uqayl that took Mosul around 990 and ruled the Jazira for a century; al-Muqallad and Qirwash raided as far as Baghdad, and Quraysh joined al-Basasiri’s seizure of Baghdad for the Fatimids (1058). They became Seljuk vassals, and the Seljuk commander Kerbogha took Mosul in late 1096.',
  timelineItemIds: ISLAMIC, confidence: CONF.emirate,
  sources: [W('Uqaylid dynasty'), W('Qirwash ibn al-Muqallad'), KENNEDY],
}, [
  S(990, 'The Uqaylids take Mosul', { mosul: ['Mosul and the Jazira', MOSUL] }),
  S(1044, 'Oghuz Turks sack Mosul', { mosul: ['Mosul and the Jazira', MOSUL] }),
  S(1058, 'Quraysh joins al-Basasiri in Baghdad', { mosul: ['Mosul and the Jazira', MOSUL] }),
  S(1095, 'Kerbogha takes Mosul (1096)', { mosul: ['Mosul and the Jazira', MOSUL] }),
]);

const seljuks = build({
  id: 'seljuk-iraq', name: 'Seljuks (Iraq)', color: '#1E6B8A',
  description: 'The Seljuk Turk Tughril Beg entered Baghdad in 1055 as the caliph’s protector; apart from al-Basasiri’s Fatimid interlude (1058–1059) the Great Seljuk sultans ruled Iraq, founding the Nizamiyya college (1067). Their atabeg Kerbogha took Mosul in 1096. After 1118 Iraq and western Iran formed the Seljuk Sultanate of Iraq; Zengi became atabeg of Mosul (1127), and after the failed siege of Baghdad in 1157 the caliphs ruled Iraq themselves. Only the Iraqi part of the Seljuk lands is drawn.',
  nameAt: [[1055, 'Great Seljuk Empire (Iraq)'], [1118, 'Seljuk Sultanate of Iraq']],
  timelineItemIds: ISLAMIC, confidence: CONF.emirate,
  sources: [W('Seljuk Empire'), W('Tughril'), W('Al-Basasiri'), W('Nizamiyya'), KENNEDY],
}, [
  S(1055, 'Tughril Beg enters Baghdad', { iraq: ['Seljuk Iraq', LOWER_IRAQ] }),
  S(1067, 'Nizam al-Mulk founds the Nizamiyya of Baghdad', { iraq: ['Seljuk Iraq', LOWER_IRAQ] }),
  S(1096, 'Kerbogha takes Mosul', { iraq: ['Seljuk Iraq', [...LOWER_IRAQ, ...MOSUL]] }),
  S(1118, 'The Seljuk Sultanate of Iraq', { iraq: ['Seljuk Iraq', [...LOWER_IRAQ, ...MOSUL]] }),
  S(1127, 'Zengi atabeg of Mosul', { iraq: ['Seljuk Iraq', LOWER_IRAQ] }),
  S(1156, 'Muhammad II besieges Baghdad and fails (1157)', { iraq: ['Seljuk Iraq', LOWER_IRAQ] }),
]);

const mosulAtabegs = build({
  id: 'mosul-atabegs', name: 'Atabegs of Mosul', color: '#CA8A04',
  description: 'Imad al-Din Zengi, appointed atabeg of Mosul by the Seljuks in 1127, built a state across the Jazira and northern Syria and took Edessa from the Crusaders (1144). His heirs ruled Mosul until 1233, losing the western Jazira to Saladin and accepting his overlordship (1186). Badr al-Din Lu’lu’, a former Zengid mamluk, ruled Mosul from 1234, submitting to the Mongols; his son was killed when the Mongols took Mosul in 1262.',
  nameAt: [[1127, 'Zengids of Mosul'], [1234, 'Lu’lu’ids of Mosul']],
  timelineItemIds: ISLAMIC, confidence: CONF.emirate,
  sources: [W('Zengid dynasty'), W('Imad al-Din Zengi'), W('Badr al-Din Lu\'lu\''), KENNEDY],
}, [
  S(1127, 'Zengi atabeg of Mosul', { mosul: ['Mosul and the Jazira', MOSUL] }),
  S(1146, 'Zengi killed; Sayf al-Din Ghazi at Mosul', { mosul: ['Mosul and the Jazira', MOSUL] }),
  S(1182, 'Saladin takes the western Jazira', { mosul: ['Mosul', ['ASSUR', 'JAZ_E']] }),
  S(1234, 'Badr al-Din Lu’lu’ rules Mosul', { mosul: ['Mosul', ['ASSUR', 'JAZ_E']] }),
  S(1259, 'Lu’lu’ dies; al-Salih Isma‘il', { mosul: ['Mosul', ['ASSUR', 'JAZ_E']] }),
  S(1261, 'The Mongols take Mosul (1262)', { mosul: ['Mosul', ['ASSUR', 'JAZ_E']] }),
]);

const abbasidRestored = build({
  id: 'abbasid-caliphate-iraq', name: 'Abbasid Caliphate (Iraq)', color: '#047857',
  description: 'After the Seljuk siege of Baghdad failed in 1157, the Abbasid caliphs ruled central and southern Iraq as a state of their own for the last century of the caliphate. Al-Nasir (r. 1180–1225) revived its prestige and organised the futuwwa brotherhoods; al-Mustansir founded the Mustansiriyya college (1233). Hulagu’s Mongols sacked Baghdad in February 1258 and killed the last caliph, al-Musta‘sim.',
  timelineItemIds: [...ISLAMIC, 'abbasid-caliphate'], confidence: CONF.emirate,
  sources: [W('Abbasid Caliphate'), W('Al-Nasir li-Din Allah'), W('Al-Mustansiriya Madrasa'), W('Siege of Baghdad (1258)'), KENNEDY],
}, [
  S(1157, 'Al-Muqtafi holds Baghdad against the Seljuks', { iraq: ['Caliphal Iraq', LOWER_IRAQ] }),
  S(1180, 'Al-Nasir revives the caliphate', { iraq: ['Caliphal Iraq', LOWER_IRAQ] }),
  S(1233, 'Al-Mustansir founds the Mustansiriyya', { iraq: ['Caliphal Iraq', LOWER_IRAQ] }),
  S(1257, 'The Mongols besiege Baghdad (1258)', { iraq: ['Caliphal Iraq', LOWER_IRAQ] }),
]);

// ---- Mongols and Turkmen, 1258–1508 -----------------------------------------------------------------

const TURK = ['iraq-mongols-turkmen'];
const NORTH = ['ASSUR', 'JAZ_E', 'KURD'];

const ilkhanate = build({
  id: 'ilkhanate-iraq', name: 'Ilkhanate (Iraq)', color: '#7E22CE',
  description: 'Hulagu, grandson of Genghis Khan, sacked Baghdad in 1258 and founded the Ilkhanate, ruled from Tabriz and Maragha; Iraq became a province (Arab Iraq), and Mosul fell in 1262. The historian and vizier Rashid al-Din served Ghazan, who made Islam the state religion (1295). The Ilkhanate broke up after Abu Sa‘id died without an heir in 1335. Only the Iraqi part is drawn; the Ilkhanate’s Iranian lands are part of the Mongol Empire shape to 1300.',
  timelineItemIds: [...TURK, 'mongol-empire'], confidence: CONF.turkmen,
  sources: [W('Ilkhanate'), W('Hulagu Khan'), W('Siege of Baghdad (1258)'), W('Ghazan')],
}, [
  S(1258, 'Hulagu sacks Baghdad', { iraq: ['Arab Iraq', LOWER_IRAQ] }),
  S(1262, 'The Mongols take Mosul', { iraq: ['Arab Iraq and Mosul', [...LOWER_IRAQ, ...NORTH]] }),
  S(1295, 'Ghazan makes Islam the state religion', { iraq: ['Arab Iraq and Mosul', [...LOWER_IRAQ, ...NORTH]] }),
  S(1335, 'Abu Sa‘id dies; the Ilkhanate breaks up', { iraq: ['Arab Iraq and Mosul', [...LOWER_IRAQ, ...NORTH]] }),
]);

const jalayirids = build({
  id: 'jalayirids', name: 'Jalayirids', color: '#BE185D',
  description: 'A Mongol dynasty that ruled Iraq and western Iran after the Ilkhanate broke up: Hasan Buzurg held Baghdad from the late 1330s, and Shaikh Uways took Tabriz (1360). Timur took Baghdad in 1393 and sacked it in 1401; Sultan Ahmad returned each time. The Qara Qoyunlu killed Ahmad and took Baghdad in 1410; Jalayirid princes held out in the south until 1432. Their Iranian lands are not drawn.',
  timelineItemIds: TURK, confidence: CONF.turkmen,
  sources: [W('Jalayirid Sultanate'), W('Hasan Buzurg'), W('Shaikh Uvais'), W('Siege of Baghdad (1401)')],
}, [
  S(1336, 'Hasan Buzurg rules Baghdad', { iraq: ['Jalayirid Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1356, 'Shaikh Uways', { iraq: ['Jalayirid Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1393, 'Timur takes Baghdad; Sultan Ahmad returns', { iraq: ['Jalayirid Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1401, 'Timur sacks Baghdad', { iraq: ['Jalayirid Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1410, 'The Qara Qoyunlu take Baghdad; the Jalayirids hold the south', { iraq: ['Jalayirids (southern Iraq)', ['SSUM', 'SEA']] }),
  S(1431, 'The last Jalayirids fall (1432)', { iraq: ['Jalayirids (southern Iraq)', ['SSUM', 'SEA']] }),
]);

const qaraQoyunlu = build({
  id: 'qara-qoyunlu', name: 'Qara Qoyunlu', color: '#334155',
  description: 'The “Black Sheep” Turkmen confederation, ruling from Tabriz, took Baghdad under Qara Yusuf in 1410 and finished the Jalayirids in 1432. Baghdad was often governed by restless princes (Pir Budaq was expelled in 1464). Uzun Hasan of the Aq Qoyunlu killed Jahan Shah in 1467 and took their lands. Only their Iraqi provinces are drawn.',
  timelineItemIds: TURK, confidence: CONF.turkmen,
  sources: [W('Qara Qoyunlu'), W('Qara Yusuf'), W('Jahan Shah')],
}, [
  S(1410, 'Qara Yusuf takes Baghdad', { iraq: ['Qara Qoyunlu Iraq', [...LOWER_IRAQ.filter((p) => p !== 'SSUM' && p !== 'SEA'), ...NORTH]] }),
  S(1432, 'The Jalayirid south taken', { iraq: ['Qara Qoyunlu Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1464, 'Jahan Shah expels Pir Budaq from Baghdad', { iraq: ['Qara Qoyunlu Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1467, 'Uzun Hasan defeats Jahan Shah', { iraq: ['Qara Qoyunlu Iraq', [...LOWER_IRAQ, ...NORTH]] }),
]);

const aqQoyunlu = build({
  id: 'aq-qoyunlu', name: 'Aq Qoyunlu', color: '#A8A29E',
  description: 'The “White Sheep” Turkmen of Diyarbakir under Uzun Hasan defeated the Qara Qoyunlu (1467) and by 1468 held Iraq, Azerbaijan and western Iran. After his death (1478) the confederation split; Shah Isma‘il I of the Safavids took Baghdad in 1508. Only their Iraqi provinces are drawn.',
  timelineItemIds: TURK, confidence: CONF.turkmen,
  sources: [W('Aq Qoyunlu'), W('Uzun Hasan')],
}, [
  S(1468, 'Uzun Hasan takes Iraq', { iraq: ['Aq Qoyunlu Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1478, 'Uzun Hasan dies; the confederation splits', { iraq: ['Aq Qoyunlu Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1501, 'Sultan Murad briefly at Baghdad', { iraq: ['Aq Qoyunlu Iraq', [...LOWER_IRAQ, ...NORTH]] }),
  S(1507, 'Shah Isma‘il takes Baghdad (1508)', { iraq: ['Aq Qoyunlu Iraq', [...LOWER_IRAQ, ...NORTH]] }),
]);

// ---- Safavids, Ottomans, the Afrasiyab house and the Mamluks, 1508–1815 --------------------------------

const OTT = ['iraq-ottoman'];
const BAGHDAD = ['AKKAD', 'DIYALA', 'NSUM', 'SUHU'];
const BASRA = ['SSUM', 'SEA'];

const safavidIraq = build({
  id: 'safavid-iraq', name: 'Safavid Iraq', color: '#0F766E',
  description: 'Shah Isma‘il I took Baghdad from the Aq Qoyunlu in 1508 and Mosul the same year. Safavid Iraq lasted until Suleiman the Magnificent’s Campaign of the Two Iraqs took Baghdad in 1534. Basra and the marshes, under the Arab emirs of the Al Mughamis, are not drawn.',
  timelineItemIds: [...TURK, 'safavid'], confidence: CONF.ottoman,
  sources: [W('Safavid Iran'), W('Ismail I'), W('Capture of Baghdad (1534)'), CETINSAYA],
}, [
  S(1508, 'Shah Isma‘il takes Baghdad and Mosul', { iraq: ['Safavid Iraq', [...BAGHDAD, ...NORTH]] }),
  S(1514, 'Chaldiran: the Ottomans take eastern Anatolia', { iraq: ['Safavid Iraq', [...BAGHDAD, ...NORTH]] }),
  S(1533, 'Suleiman’s Campaign of the Two Iraqs (1534)', { iraq: ['Safavid Iraq', [...BAGHDAD, ...NORTH]] }),
]);

const safavidBaghdad = build({
  id: 'safavid-baghdad', name: 'Safavid Baghdad', color: '#0F766E',
  description: 'Shah Abbas I took Baghdad in 1623–1624, sent troops to Kirkuk and Shahrizor and briefly seized Mosul; the Ottomans failed to retake Baghdad in 1625–1626 and 1630. Murad IV took it back after a 40-day siege in December 1638, and the Treaty of Zuhab (1639) fixed the frontier that still roughly divides Iraq and Iran.',
  timelineItemIds: [...OTT, 'safavid'], confidence: CONF.ottoman,
  sources: [W('Safavid Baghdad'), W('Siege of Baghdad (1638)'), W('Treaty of Zuhab'), CETINSAYA],
}, [
  S(1623, 'Shah Abbas takes Baghdad', { iraq: ['Baghdad', BAGHDAD], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1626, 'The Ottoman siege of Baghdad fails', { iraq: ['Baghdad', BAGHDAD], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1638, 'Murad IV besieges and retakes Baghdad (December)', { iraq: ['Baghdad', BAGHDAD], shahrizor: ['Shahrizor', ['KURD']] }),
]);

const ottomanIraq = build({
  id: 'ottoman-iraq', name: 'Ottoman Iraq', color: '#9F1239',
  description: 'Suleiman the Magnificent took Baghdad in 1534 and organised Iraq as the eyalet of Baghdad, reaching from Mosul to the marshes; Basra came under direct rule in 1546 and Shahrizor (the Kurdish uplands) in 1554. Basra was sold to the Afrasiyab family (1596–1668), and the Safavids held Baghdad from 1623 to 1638. In the 18th century the Mamluk pashas — Hasan Pasha and his son Ahmad, then their Georgian mamluks from 1749 — ruled Baghdad and Basra almost independently, with the Jalili family at Mosul and the Baban emirs in Shahrizor, until Istanbul restored direct rule in 1831.',
  nameAt: [[1534, 'Ottoman Iraq'], [1749, 'Mamluk Iraq (Ottoman)']],
  timelineItemIds: [...OTT, 'iraq-mamluk-iraq', 'ottoman'], confidence: CONF.ottoman,
  sources: [W('Ottoman Iraq'), W('Baghdad Eyalet'), W('Mosul Eyalet'), W('Basra Eyalet'), W('Shahrizor Eyalet'), W('Mamluk dynasty of Iraq'), W('Jalili dynasty')],
}, [
  S(1534, 'Suleiman takes Baghdad: the eyalet of Baghdad', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul', ['ASSUR', 'JAZ_E']] }),
  S(1546, 'Basra under direct rule', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA] }),
  S(1554, 'Shahrizor conquered', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1596, 'Basra sold to Afrasiyab', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul', ['ASSUR', 'JAZ_E']], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1623, 'The Safavids take Baghdad and Shahrizor', { mosul: ['Mosul', ['ASSUR', 'JAZ_E']] }),
  S(1639, 'Murad IV’s reconquest; the Treaty of Zuhab', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul', ['ASSUR', 'JAZ_E']], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1668, 'Basra under direct rule again', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1704, 'Hasan Pasha governor of Baghdad', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1726, 'The Jalili family govern Mosul (1726–1834)', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul (Jalili governors)', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1733, 'Nader Shah besieges Baghdad', { baghdad: ['Baghdad', BAGHDAD], mosul: ['Mosul (Jalili governors)', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1749, 'Sulayman Abu Layla: the Mamluk pashas', { baghdad: ['Baghdad (Mamluk pashas)', BAGHDAD], mosul: ['Mosul (Jalili governors)', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1775, 'Zand siege of Basra (Persian rule 1776–1779)', { baghdad: ['Baghdad (Mamluk pashas)', BAGHDAD], mosul: ['Mosul (Jalili governors)', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor', ['KURD']] }),
  S(1780, 'Sulayman the Great (1780–1802)', { baghdad: ['Baghdad (Mamluk pashas)', BAGHDAD], mosul: ['Mosul (Jalili governors)', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor (Baban emirs)', ['KURD']] }),
  S(1815, 'Mamluk Iraq on the eve of Dawud Pasha (1816–1831)', { baghdad: ['Baghdad (Mamluk pashas)', BAGHDAD], mosul: ['Mosul (Jalili governors)', ['ASSUR', 'JAZ_E']], basra: ['Basra', BASRA], shahrizor: ['Shahrizor (Baban emirs)', ['KURD']] }),
]);

const afrasiyab = build({
  id: 'afrasiyab-basra', name: 'House of Afrasiyab (Basra)', color: '#C2742F',
  description: 'In 1596 the Ottoman governor of Basra sold the province to Afrasiyab, a local notable, who took the title of pasha and founded a hereditary emirate under nominal Ottoman suzerainty. His son Ali Pasha made Basra a busy port for Portuguese, Dutch and English traders. When Husayn Pasha defied the sultan, the governor of Baghdad took Basra under direct rule in 1668.',
  timelineItemIds: OTT, confidence: CONF.ottoman,
  sources: [W('The Prince of Basra'), W('Basra Eyalet')],
}, [
  S(1596, 'Afrasiyab buys the governorship of Basra', { basra: ['Basra', BASRA] }),
  S(1624, 'Ali Pasha', { basra: ['Basra', BASRA] }),
  S(1667, 'Husayn Pasha defies the sultan (Ottoman rule 1668)', { basra: ['Basra', BASRA] }),
]);

export const iraqPolities = [
  cityStates, akkad, urIII, isin, larsa, eshnunna, mari, assyria, mitanni, babylon, sealand, neoBabylon,
  hamdanids, buyids, uqaylids, seljuks, mosulAtabegs, abbasidRestored,
  ilkhanate, jalayirids, qaraQoyunlu, aqQoyunlu, safavidIraq, safavidBaghdad, ottomanIraq, afrasiyab,
];

// ---- Fixes to older shapes over Iraq --------------------------------------------------------------------
//
// 1. The generic "Mesopotamia" sphere (3000–560 BCE) is replaced by the polities above, so it goes.
// 2. The Parthian, Sasanian, Umayyad and Abbasid Mesopotamian regions were seven-point blobs that ran
//    into the Syrian desert and Kuwait. They are redrawn from the pieces (the same ring in every
//    keyframe, so they never morph), and the gaps in their keyframes are filled (Parthian Babylonia
//    from 50 BCE, Umayyad Iraq from 661 and in 715). The Abbasid shape now ends in 944: from 929 it is
//    Iraq alone (Mosul to the Hamdanids, Iran long since lost to the Samanids, Saffarids and Buyids), and
//    the Buyids take Baghdad in 945.
// 3. Shapes that spilled over Iraq in years when someone else held it are trimmed back to a fixed
//    line west, north or east of Iraq: the Hittite Syria (Carchemish) now stops at the Euphrates bend
//    instead of reaching into Mitanni's Jazira; Trajan's Roman 'near-east' (117), Egypt's and Phoenicia's
//    Levant (1500 BCE), Byzantium's core rectangle and Levant, the Mongol 'central-asia', steppe and 'persia', the Safavid 'persia', and
//    the Ottoman Anatolia and Levant shapes. The Safavid 'mesopotamia' region (wrongly 1550–1650) goes:
//    Safavid Iraq (1508–1534) and Safavid Baghdad (1623–1638) are drawn above.
// 4. The Achaemenid 'meso-syria' region now appears in 539 BCE as a one-year step (a copy of the
//    547 BCE keyframe in 540), so it no longer fades in over the Neo-Babylonian Empire.

const ring = (pieces) => ensureClockwise(mergeRings(`iraq fix ${pieces.join('+')}`, ...P(pieces)));
export const IRAQ_FIX_RINGS = {
  parthian: ring([...IRAQ]),
  sasanian: ring([...IRAQ]),
  caliphate: ring([...IRAQ, ...JAZ]),
  abbasidLower: ring([...LOWER, 'SUHU']),
  jazira: ensureClockwise(IRAQ_PIECES.JAZ_W),
};

// West of Iraq (W line): x ≤ 37.9 at 37 N … 38.3 at 33 N. North of Iraq (N line): ≥ 37.6 N. East of
// Iraq (Z line): from the Gulf at (48.9, 29.6) to (45.6, 37.6).
const WEST = [[37.9, 37.05], [38.15, 34.8], [38.3, 33.0]];
const NORTH_ARC = [[45.4, 38.2], [43.0, 37.9], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05]];
const Z_LINE = [[50.0, 27.0], [48.9, 29.6], [47.6, 32.75], [46.6, 35.2], [45.6, 37.6]];
// Shared named rings (globe-overlays.js REGION_RINGS) used by regions given only by id.
const SHARED_RINGS = { levant: [[34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5]] };
/** [entity, keyframe, region, [vertices to replace (in ring order, consecutive)], replacement]. */
const TRIMS = [
  ['hittite-empire', -1340, 'syria', [[38.5, 36.9], [38.6, 35.8], [38, 35]], [[38.4, 36.0], [38.6, 35.0]]],
  ['hittite-empire', -1300, 'syria', [[38.5, 36.9], [38.6, 35.8], [38, 35]], [[38.4, 36.0], [38.6, 35.0]]],
  ['hittite-empire', -1250, 'syria', [[38.5, 36.9], [38.6, 35.8], [38, 35]], [[38.4, 36.0], [38.6, 35.0]]],
  ['hittite-empire', -1200, 'syria', [[38.5, 36.9], [38.6, 35.8], [38, 35]], [[38.4, 36.0], [38.6, 35.0]]],
  ['roman-empire', 117, 'near-east', [[48, 37], [46, 32], [42, 30]], [[44.0, 38.3], ...NORTH_ARC.slice(1), ...WEST, [38.0, 30.5]]],
  ['ancient-egypt', -1500, 'levant', [[39, 37], [42, 34], [40, 31]], [...WEST, [38.0, 31.0]]],
  ['phoenicia', -1500, 'levant', [[39, 37], [42, 34], [40, 31]], [...WEST, [38.0, 31.0]]],
  ['byzantine-empire', 800, 'levant', [[39, 37], [42, 34], [40, 31]], [...WEST, [38.0, 31.0]]],
  ['byzantine-empire', 565, 'byzantine-core', [[42, 35]], [[42, 38.0], ...NORTH_ARC.slice(2), [37.6, 36.0], [36.0, 35.2]]],
  ['byzantine-empire', 800, 'byzantine-core', [[42, 36]], [[42, 38.0], ...NORTH_ARC.slice(2), [37.6, 36.2]]],
  ['byzantine-empire', 1025, 'byzantine-core', [[42, 35]], [[42, 38.0], ...NORTH_ARC.slice(2), [37.6, 36.0], [36.0, 35.2]]],
  ['mongol-empire', 1241, 'central-asia', [[45, 35]], [[46.6, 35.2], [45.6, 37.6], [43.0, 37.9], [40.5, 37.65]]],
  ['mongol-empire', 1279, 'eurasian-steppe', [[40, 38]], [[46, 38.6], [40, 38.4]]],
  ['mongol-empire', 1300, 'eurasian-steppe', [[40, 36]], [[46.5, 38.6], [40, 38.4]]],
  ['mongol-empire', 1279, 'persia', [[44, 26], [46, 38]], [...Z_LINE, [46, 38.2]]],
  ['mongol-empire', 1300, 'persia', [[44, 27], [47, 37]], [...Z_LINE, [46.5, 38.2]]],
  ['safavid-empire', 1520, 'persia', [[46, 28], [48, 36]], [...Z_LINE, [46.5, 38.0]]],
  ['safavid-empire', 1620, 'persia', [[44, 26], [46, 38]], [...Z_LINE, [46, 38.2]]],
  ['safavid-empire', 1700, 'persia', [[45, 27], [47, 37]], [...Z_LINE, [46.5, 38.2]]],
  ['ottoman-empire', 1453, 'anatolia-balkans', [[43, 36], [38, 35]], [[41.5, 38.3], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.0, 36.3]]],
  ['ottoman-empire', 1520, 'anatolia-balkans', [[45, 37], [42, 35]], [[45.4, 38.2], ...NORTH_ARC.slice(1), [37.6, 36.2]]],
  ['ottoman-empire', 1520, 'levant', [[39, 37], [42, 34], [40, 31]], [...WEST, [38.0, 31.0]]],
  ['ottoman-empire', 1600, 'anatolia-balkans', [[47, 38], [45, 34]], [[46.2, 38.6], ...NORTH_ARC, [37.6, 36.0], [37.3, 34.5]]],
  ['ottoman-empire', 1600, 'levant', [[40, 37.5], [43, 34], [41, 30.5]], [...WEST, [38.0, 30.5]]],
  ['ottoman-empire', 1683, 'anatolia-balkans', [[48, 37], [46, 34], [38, 34]], [[46.2, 38.6], ...NORTH_ARC, [37.6, 36.0], [37.3, 34.5]]],
  ['ottoman-empire', 1683, 'levant', [[39, 37], [42, 34], [40, 31]], [...WEST, [38.0, 31.0]]],
  ['ottoman-empire', 1800, 'anatolia-balkans', [[45, 37], [43, 35]], [[45.4, 38.2], ...NORTH_ARC.slice(1), [37.6, 36.2]]],
  ['ottoman-empire', 1800, 'levant', [[39, 36.5], [41, 33.5], [39, 30.5]], [...WEST, [38.0, 30.5]]],
  ['ottoman-empire', 1900, 'anatolia-balkans', [[44, 36], [40, 35]], [[43.0, 37.9], [40.5, 37.65], [38.3, 37.4], [37.9, 37.05], [37.0, 36.3]]],
  ['ottoman-empire', 1900, 'levant', [[39, 37], [42, 34], [40, 31]], [...WEST, [38.0, 31.0]]],
];
/** The Ottoman Jazira (Urfa and Raqqa, taken c. 1517) is the western-Jazira piece, the same ring in every keyframe. */
const OTTOMAN_JAZIRA_YEARS = [1520, 1600, 1683, 1800, 1900];
/** [entity, keyframe year, region id, ring] — regions redrawn from the pieces. */
const REDRAW = [
  ['parthian-empire', 50, 'mesopotamia'], ['parthian-empire', 150, 'mesopotamia'],
  ['sassanid-empire', 260, 'mesopotamia'], ['sassanid-empire', 400, 'mesopotamia'], ['sassanid-empire', 620, 'mesopotamia'],
  ['umayyad-caliphate', 680, 'mesopotamia'], ['umayyad-caliphate', 720, 'mesopotamia'], ['umayyad-caliphate', 740, 'mesopotamia'],
  ['abbasid-caliphate', 760, 'mesopotamia'], ['abbasid-caliphate', 800, 'mesopotamia'], ['abbasid-caliphate', 900, 'mesopotamia'],
];
export const iraqShapeFixes = {
  mesopotamia: 'removed',
  'parthian-empire': ['mesopotamia', 'babylonia'],
  'sassanid-empire': ['mesopotamia'],
  'umayyad-caliphate': ['mesopotamia'],
  'abbasid-caliphate': ['mesopotamia', '750 copy of 760', '928–944 steps (Iraq only from 929)', 'edgeGrace 1'],
  'achaemenid-empire': ['-540 copy of -547'],
  ...Object.fromEntries(TRIMS.map(([id]) => [id, 'trimmed'])),
};
export const IRAQ_TRIMS = TRIMS.map(([id, y, rid]) => [id, y, rid]);

/** Apply the fixes (runs after the packs are appended). */
export function applyIraqShapeFixes(entities) {
  const find = (id) => {
    const e = entities.find((x) => x.id === id);
    if (!e) throw new Error(`iraq fixes: no entity ${id}`);
    return e;
  };
  const kfAt = (e, y) => {
    const kf = e.overlays.find((o) => o.year === y);
    if (!kf) throw new Error(`iraq fixes: ${e.id} has no ${y} keyframe`);
    return kf;
  };
  const inline = (kf, rid, e) => {
    const i = kf.regions.findIndex((r) => (typeof r === 'string' ? r : r.id) === rid);
    if (i < 0) throw new Error(`iraq fixes: ${e.id} ${kf.year} has no region ${rid}`);
    if (typeof kf.regions[i] === 'string') kf.regions[i] = { id: rid, name: rid };
    return i;
  };
  const insertKf = (e, kf) => {
    const at = e.overlays.findIndex((o) => o.year > kf.year);
    e.overlays.splice(at < 0 ? e.overlays.length : at, 0, kf);
  };

  // 1. The generic Mesopotamia sphere goes.
  const mi = entities.findIndex((x) => x.id === 'mesopotamia');
  if (mi >= 0) entities.splice(mi, 1);

  // 2. Redraw the Mesopotamian regions.
  for (const [id, y, rid] of REDRAW) {
    const e = find(id);
    const kf = kfAt(e, y);
    const i = inline(kf, rid, e);
    const r = id === 'parthian-empire' ? IRAQ_FIX_RINGS.parthian : id === 'sassanid-empire' ? IRAQ_FIX_RINGS.sasanian : IRAQ_FIX_RINGS.caliphate;
    kf.regions[i] = { id: rid, name: kf.regions[i].name || 'Mesopotamia', ring: r };
  }
  // Parthian Babylonia: the region the Greek world calls 'babylonia' (141–100 BCE) carries on as the
  // same id through 50 BCE, 50 and 150 CE instead of fading out and back in as 'mesopotamia'.
  const parth = find('parthian-empire');
  for (const o of parth.overlays) {
    const i = o.regions.findIndex((r) => typeof r !== 'string' && r.id === 'mesopotamia');
    if (i >= 0) o.regions[i] = { ...o.regions[i], id: 'babylonia', name: 'Babylonia' };
  }
  const p50 = kfAt(parth, -50);
  if (!p50.regions.some((r) => r.id === 'babylonia')) p50.regions.push({ id: 'babylonia', name: 'Babylonia', ring: IRAQ_FIX_RINGS.parthian });
  // Umayyad Iraq from Mu'awiya's accession (661) and in the 715 keyframe.
  const umay = find('umayyad-caliphate');
  const u680 = kfAt(umay, 680);
  if (!umay.overlays.some((o) => o.year === 661)) insertKf(umay, { ...u680, year: 661, label: 'Mu‘awiya: the Umayyad Caliphate', regions: u680.regions.map((r) => ({ ...r })) });
  const u715 = kfAt(umay, 715);
  if (!u715.regions.some((r) => r.id === 'mesopotamia')) u715.regions.push({ id: 'mesopotamia', name: 'Iraq', ring: IRAQ_FIX_RINGS.caliphate });
  // The Abbasid shape: Mosul to the Hamdanids (929), Iran lost (935), the Buyids in Baghdad (945).
  const abb = find('abbasid-caliphate');
  abb.edgeGrace = 1;
  const a760 = kfAt(abb, 760);
  if (!abb.overlays.some((o) => o.year === 750)) insertKf(abb, { ...a760, year: 750, label: 'The Abbasid revolution', regions: a760.regions.map((r) => (typeof r === 'string' ? r : { ...r })) });
  const a900 = kfAt(abb, 900);
  const lower = { id: 'mesopotamia', name: 'Iraq', ring: IRAQ_FIX_RINGS.abbasidLower };
  for (const [y, label, regions] of [
    [928, 'Caliphal Iraq and western Iran', a900.regions.map((r) => ({ ...r }))],
    [929, 'The Hamdanids take Mosul; the caliph’s realm is Iraq', [lower]],
    [936, 'Ibn Ra’iq becomes amir al-umara', [lower]],
    [944, 'The Buyids enter Baghdad (945)', [lower]],
  ]) if (!abb.overlays.some((o) => o.year === y)) insertKf(abb, { year: y, label, approximation: a900.approximation, regions });
  if (Array.isArray(abb.keyYears) && !abb.keyYears.includes(944)) abb.keyYears = [...abb.keyYears.filter((y) => y <= 900), 929, 944];

  // 3. Trim spills.
  const same = (p, q) => Math.abs(p[0] - q[0]) < 1e-9 && Math.abs(p[1] - q[1]) < 1e-9;
  for (const [id, y, rid, drop, add] of TRIMS) {
    const e = find(id);
    const kf = kfAt(e, y);
    const i = inline(kf, rid, e);
    const r0 = kf.regions[i];
    const bb = r0.bbox;
    const src = r0.ring || (bb && [[bb[0], bb[1]], [bb[0], bb[3]], [bb[2], bb[3]], [bb[2], bb[1]], [bb[0], bb[1]]]) || SHARED_RINGS[rid];
    if (!src) throw new Error(`iraq fixes: ${id} ${y} ${rid} has no ring`);
    const open = src.slice(0, -1);
    if (open.some((p) => same(p, add[0]))) continue; // already trimmed
    const k = open.findIndex((p) => same(p, drop[0]));
    if (k < 0) throw new Error(`iraq fixes: ${id} ${y} ${rid} lacks ${drop[0]}`);
    const n = open.length;
    for (let j = 1; j < drop.length; j++) if (!same(open[(k + j) % n], drop[j])) throw new Error(`iraq fixes: ${id} ${y} ${rid} vertices not consecutive at ${drop[j]}`);
    const rot = [...open.slice(k), ...open.slice(0, k)];
    const out = [...add, ...rot.slice(drop.length)];
    kf.regions[i] = { ...kf.regions[i], ring: ensureClockwise([...out, out[0]]) };
    delete kf.regions[i].bbox;
  }
  const ott = find('ottoman-empire');
  for (const y of OTTOMAN_JAZIRA_YEARS) {
    const kf = kfAt(ott, y);
    if (!kf.regions.some((r) => r.id === 'jazira')) kf.regions.push({ id: 'jazira', name: 'Urfa and Raqqa', ring: IRAQ_FIX_RINGS.jazira });
  }
  // The Safavid 'mesopotamia' region goes.
  for (const o of find('safavid-empire').overlays) o.regions = o.regions.filter((r) => (typeof r === 'string' ? r : r.id) !== 'mesopotamia');

  // 4. Achaemenid Babylon as a one-year step.
  const ach = find('achaemenid-empire');
  if (!ach.overlays.some((o) => o.year === -540)) {
    const k547 = kfAt(ach, -547);
    insertKf(ach, { ...k547, year: -540, regions: k547.regions.map((r) => (typeof r === 'string' ? r : { ...r })) });
  }
}
