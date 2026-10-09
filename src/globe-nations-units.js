/**
 * Day 41 — shared building blocks for the nations date tables (1815–2025).
 *
 * Natural Earth (public domain) unit groups and the small period helpers used by
 * src/globe-nations-table.js (1914–2025) and src/globe-nations-table-1815.js (1815–1913).
 * Moved here so both tables can share them without an import cycle.
 */

// ---------------------------------------------------------------------------
// Reusable unit groups (Natural Earth admin-1 ISO codes)
// ---------------------------------------------------------------------------
export const AL = 'FR-67 FR-68 FR-57'; // Alsace–Lorraine
export const FR_OVS = 'FR-GF FR-RE FR-GP FR-MQ FR-YT';
export const PL_W45 = 'PL-ZP PL-LB PL-DS PL-OP PL-WN'; // German until 1945
export const PL_POSEN = 'PL-PM PL-WP PL-KP'; // Prussian partition (Posen / West Prussia)
export const PL_CONGRESS = 'PL-MZ PL-LD PL-LU PL-SK PL-PD'; // Russian partition
export const PL_GALICIA = 'PL-MA PL-PK'; // Austrian partition (west Galicia)
export const UA_GALICIA = 'UA-46 UA-26 UA-61'; // east Galicia
export const KRESY = 'BY-HR BY-BR UA-07 UA-56'; // interwar eastern Poland (approx.)
export const TRANSNISTRIA = 'MD-SN MD-CAM MD-GRI';
export const TRANSYLVANIA =
  'RO-SM RO-AR RO-BH RO-TM RO-CS RO-MM RO-CJ RO-BN RO-SJ RO-HD RO-AB RO-SB RO-BV RO-CV RO-HR RO-MS';
export const VOJVODINA = 'RS-01 RS-05 RS-03 RS-06 RS-02 RS-04 RS-07';
export const TYROL_S = 'IT-TN IT-BZ';
export const JULIAN = 'IT-TS IT-GO';
export const ISTRIA = 'HR-18';
export const KOTOR = 'ME-10 ME-08 ME-19 ME-05';
export const DOBRUJA_S = 'BG-08 BG-19';
export const KARS = 'TR-36 TR-75 TR-76';
export const HATAY = 'TR-31';
export const CRIMEA = 'UA-43 UA-40';
export const TUVA = 'RU-TY';
export const KGD = 'RU-KGD';
export const DE_EAST = 'DE-MV DE-BB DE-BE DE-ST DE-SN DE-TH';
export const CENTRAL_ASIA = 'KAZ KAB UZB TKM KGZ TJK';
export const CAUCASUS = 'GEO ARM AZE';
export const HEJAZ = 'SA-02 SA-03 SA-07 SA-11';
export const ASIR = 'SA-14 SA-09 SA-10';
export const NEJD = 'SA-01 SA-05 SA-04';
export const SHAMMAR = 'SA-06 SA-08 SA-12';
export const YE_SOUTH = 'YE-AD YE-LA YE-AB YE-SH YE-HD YE-MR YE-DA';
export const YE_NORTH = `YEM -${YE_SOUTH.split(' ').join(' -')}`;
export const WSAHARA = 'SAH MA-15 MA-16';
export const SP_MOROCCO = 'MA-01 MA-03';
export const MANCHURIA = 'CN-HL CN-JL CN-LN';
export const TIBET = 'CN-XZ';
export const SIKKIM = 'IN-SK';
export const GOA = 'IN-GA IN-DH';
export const PONDY = 'IN-PY';
export const MY_BORNEO = 'MY-12 MY-13 MY-15';
export const NNG = 'ID-PA ID-PB';
export const ZANZIBAR = 'TZ-11 TZ-07 TZ-15 TZ-10 TZ-06';
export const BR_CAMEROONS = 'CM-NW CM-SW';
export const NFLD = 'CA-NL';
export const UK_ISLES = 'GBR JEY GGY IMN';

/** Remove each unit in a group: neg('A B') → '-A -B'. */
export const neg = (group) => group.split(/\s+/).filter(Boolean).map((u) => `-${u}`).join(' ');

// Russian Empire / Soviet core pieces
export const RU_CORE = `RUS ${neg(KGD)}`; // RUS minus Kaliningrad (Crimea is re-homed to UKR in the build)
export const UA_RUSSIAN = `UKR ${neg(UA_GALICIA)} -UA-77 -UA-21`; // Ukraine minus Austro-Hungarian lands

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** period: years from ≤ y < to (to null = current). extra may set name / kind / owner / note. */
export const p = (from, to, units, extra = {}) => ({ from, to, units, ...extra });
export const state = (id, name, periods, opts = {}) => ({ id, name, kind: 'state', periods, ...opts });
/** Territory that starts as a colony / protectorate / mandate of `owner` and may later be independent. */
export const colony = (owner, from, to, units, name, extra = {}) => p(from, to, units, { kind: 'colony', owner, name, ...extra });
export const dominion = (from, to, units, name, extra = {}) =>
  p(from, to, units, { kind: 'dominion', owner: 'uk', name, ...extra });
export const disputed = (from, to, units, name, extra = {}) => p(from, to, units, { kind: 'disputed', name, ...extra });

export const BRIT = ['british-empire'];
export const FREN = ['french-colonial'];
export const PORT = ['portugal'];
export const SPAN = ['spanish-empire'];
export const JAPN = ['meiji-japan'];

// ---------------------------------------------------------------------------
// Day 41 additions (1815–1913)
// ---------------------------------------------------------------------------
/** Vassal / autonomous state under `owner`'s suzerainty (e.g. Serbia under the Ottomans). */
export const vassal = (owner, from, to, units, name, extra = {}) => p(from, to, units, { kind: 'vassal', owner, name, ...extra });

/** Emirate of Bukhara and Khanate of Khiva as Russian protectorates (1868 / 1873 to 1920). */
export const BUKHARA = 'UZ-BU UZ-NW UZ-QA UZ-SU TJ-X01~ TJ-KT TJ-DU TM-L';
export const KHIVA = 'UZ-XO TM-D';

/**
 * Build consecutive periods from a list of steps, each a delta on the previous units
 * (tokens appended, so `-X` removes and `X` adds), or a full replacement when the units
 * start with `=`. `extra` (name / kind / owner) carries forward until overridden; `note` does not.
 *   steps(1914, [[1815, 'A B', { name: 'X' }], [1830, '-B'], [1850, '= A C']])
 */
export function steps(end, list) {
  const out = [];
  let units = '';
  let carry = {};
  list.forEach(([from, delta, extra = {}], i) => {
    const d = String(delta || '').trim();
    units = d.startsWith('=') ? d.slice(1).trim() : `${units} ${d}`.trim();
    const { note, ...rest } = extra;
    carry = { ...carry, ...rest };
    const to = i + 1 < list.length ? list[i + 1][0] : end;
    out.push(p(from, to, units.replace(/\s+/g, ' '), { ...carry, ...(note ? { note } : {}) }));
  });
  return out;
}
