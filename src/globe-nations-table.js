/**
 * Day 38 — modern nations layer (1914–2025): who governed which land, year by year.
 *
 * Geometry is NOT hand-drawn here. Every unit below is a Natural Earth (public domain)
 * admin-0 country code (e.g. `FRA`) or admin-1 province code (e.g. `FR-67`), and
 * `scripts/build-nations.mjs` dissolves those units into one polygon per state-period
 * (`src/data/nations.topo.json`). This file is the date table: real dates of
 * independence, annexation, partition and union, written as facts (not copied from any
 * licensed dataset), so the whole layer stays public-domain-compatible with the ISC repo.
 *
 * Honesty notes:
 *   - Borders are today's Natural Earth lines regrouped by year. Pre-1945 border shifts are
 *     modelled at province level (e.g. interwar Poland = today's Polish voivodeships that were
 *     Polish then + Grodno/Brest/Volyn/Rivne/Lviv/Ivano-Frankivsk/Ternopil), so some lines
 *     are approximate (Karelia, Sudetenland, Schleswig, the Chaco, South Sakhalin are not split).
 *   - Wartime military occupations (1939–45 France, the Low Countries, Japanese-occupied
 *     China and Southeast Asia) are not drawn; formal annexations and puppet states are.
 *   - Disputed / occupied areas with their own Natural Earth unit get a neutral grey
 *     (Western Sahara, Palestinian territories, Northern Cyprus, Crimea since 2014,
 *     East Timor 1976–2002). Taiwan and Kosovo are shown as the de facto states they are.
 *
 * Period semantics: a period covers years `from <= y < to`; `to: null` = still current.
 *
 * Units syntax (space-separated, applied left to right): `XXX` = every admin-1 unit of Natural Earth admin-0 XXX;
 * `AA-BB` = one admin-1 unit by ISO 3166-2 code; `XXX^N17` / `XXX^S17` = units of XXX whose
 * centroid is north / south of 17°N (used for the 1954 Vietnam partition); a leading `-`
 * removes units.
 */

export const NATIONS_START = 1914;
export const NATIONS_END = 2025;

// ---------------------------------------------------------------------------
// Reusable unit groups (Natural Earth admin-1 ISO codes)
// ---------------------------------------------------------------------------
const AL = 'FR-67 FR-68 FR-57'; // Alsace–Lorraine
const FR_OVS = 'FR-GF FR-RE FR-GP FR-MQ FR-YT';
const PL_W45 = 'PL-ZP PL-LB PL-DS PL-OP PL-WN'; // German until 1945
const PL_POSEN = 'PL-PM PL-WP PL-KP'; // Prussian partition (Posen / West Prussia)
const PL_CONGRESS = 'PL-MZ PL-LD PL-LU PL-SK PL-PD'; // Russian partition
const PL_GALICIA = 'PL-MA PL-PK'; // Austrian partition (west Galicia)
const UA_GALICIA = 'UA-46 UA-26 UA-61'; // east Galicia
const KRESY = 'BY-HR BY-BR UA-07 UA-56'; // interwar eastern Poland (approx.)
const TRANSNISTRIA = 'MD-SN MD-CAM MD-GRI';
const TRANSYLVANIA =
  'RO-SM RO-AR RO-BH RO-TM RO-CS RO-MM RO-CJ RO-BN RO-SJ RO-HD RO-AB RO-SB RO-BV RO-CV RO-HR RO-MS';
const VOJVODINA = 'RS-01 RS-05 RS-03 RS-06 RS-02 RS-04 RS-07';
const TYROL_S = 'IT-TN IT-BZ';
const JULIAN = 'IT-TS IT-GO';
const ISTRIA = 'HR-18';
const KOTOR = 'ME-10 ME-08 ME-19 ME-05';
const DOBRUJA_S = 'BG-08 BG-19';
const KARS = 'TR-36 TR-75 TR-76';
const HATAY = 'TR-31';
const CRIMEA = 'UA-43 UA-40';
const TUVA = 'RU-TY';
const KGD = 'RU-KGD';
const DE_EAST = 'DE-MV DE-BB DE-BE DE-ST DE-SN DE-TH';
const CENTRAL_ASIA = 'KAZ KAB UZB TKM KGZ TJK';
const CAUCASUS = 'GEO ARM AZE';
const HEJAZ = 'SA-02 SA-03 SA-07 SA-11';
const ASIR = 'SA-14 SA-09 SA-10';
const NEJD = 'SA-01 SA-05 SA-04';
const SHAMMAR = 'SA-06 SA-08 SA-12';
const YE_SOUTH = 'YE-AD YE-LA YE-AB YE-SH YE-HD YE-MR YE-DA';
const YE_NORTH = `YEM -${YE_SOUTH.split(' ').join(' -')}`;
const WSAHARA = 'SAH MA-15 MA-16';
const SP_MOROCCO = 'MA-01 MA-03';
const MANCHURIA = 'CN-HL CN-JL CN-LN';
const TIBET = 'CN-XZ';
const SIKKIM = 'IN-SK';
const GOA = 'IN-GA IN-DH';
const PONDY = 'IN-PY';
const MY_BORNEO = 'MY-12 MY-13 MY-15';
const NNG = 'ID-PA ID-PB';
const ZANZIBAR = 'TZ-11 TZ-07 TZ-15 TZ-10 TZ-06';
const BR_CAMEROONS = 'CM-NW CM-SW';
const NFLD = 'CA-NL';
const UK_ISLES = 'GBR JEY GGY IMN';

/** Remove each unit in a group: neg('A B') → '-A -B'. */
const neg = (group) => group.split(/\s+/).filter(Boolean).map((u) => `-${u}`).join(' ');

// Russian Empire / Soviet core pieces
const RU_CORE = `RUS ${neg(KGD)}`; // RUS minus Kaliningrad (Crimea is re-homed to UKR in the build)
const UA_RUSSIAN = `UKR ${neg(UA_GALICIA)} -UA-77 -UA-21`; // Ukraine minus Austro-Hungarian lands

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** period: years from ≤ y < to (to null = current). extra may set name / kind / owner / note. */
const p = (from, to, units, extra = {}) => ({ from, to, units, ...extra });
const state = (id, name, periods, opts = {}) => ({ id, name, kind: 'state', periods, ...opts });
/** Territory that starts as a colony / protectorate / mandate of `owner` and may later be independent. */
const colony = (owner, from, to, units, name, extra = {}) => p(from, to, units, { kind: 'colony', owner, name, ...extra });
const dominion = (from, to, units, name, extra = {}) =>
  p(from, to, units, { kind: 'dominion', owner: 'uk', name, ...extra });
const disputed = (from, to, units, name, extra = {}) => p(from, to, units, { kind: 'disputed', name, ...extra });

const BRIT = ['british-empire'];
const FREN = ['french-colonial'];
const PORT = ['portugal'];
const SPAN = ['spanish-empire'];
const JAPN = ['meiji-japan'];

/**
 * Colonial owners: id → display adjective. Colonies take their owner's colour so empires
 * read as one bloc (internal colony borders are still drawn).
 */
export const NATION_OWNERS = {
  uk: 'British',
  france: 'French',
  portugal: 'Portuguese',
  spain: 'Spanish',
  italy: 'Italian',
  belgium: 'Belgian',
  netherlands: 'Dutch',
  germany: 'German',
  japan: 'Japanese',
  usa: 'US',
  denmark: 'Danish',
  'south-africa': 'South African',
  australia: 'Australian',
  'new-zealand': 'New Zealand',
  india: 'Indian',
};

/** @type {{ id: string, name: string, kind: string, periods: object[], colorOf?: string, timelineItemIds?: string[] }[]} */
export const NATION_ENTITIES = [
  // =========================================================================
  // Europe
  // =========================================================================
  state('uk', 'United Kingdom', [
    p(1914, 1922, `${UK_ISLES} IRL`, { name: 'United Kingdom of Great Britain and Ireland' }),
    p(1922, null, UK_ISLES, { note: 'Southern Ireland left in 1922; Northern Ireland stayed.' }),
  ], { timelineItemIds: BRIT }),
  state('ireland', 'Ireland', [
    p(1922, 1937, 'IRL', { name: 'Irish Free State' }),
    p(1937, null, 'IRL'),
  ]),
  state('france', 'France', [
    p(1914, 1918, `FRA ${neg(FR_OVS)} ${neg(AL)}`, { note: 'Alsace–Lorraine was German until 1918.' }),
    p(1918, null, `FRA ${neg(FR_OVS)}`),
  ], { timelineItemIds: FREN }),
  state('french-guiana', 'French Guiana', [colony('france', 1914, null, 'FR-GF', 'French Guiana (France)')], { timelineItemIds: FREN }),
  state('french-overseas', 'French overseas territories', [
    colony('france', 1914, null, 'FR-RE FR-GP FR-MQ FR-YT NCL PYF ATF', 'French overseas territories'),
  ], { timelineItemIds: FREN }),
  state('germany', 'Germany', [
    p(1914, 1918, `DEU ${AL} ${PL_W45} ${PL_POSEN} PL-SL ${KGD} LT-KL`, { name: 'German Empire' }),
    p(1918, 1920, `DEU ${PL_W45} PL-SL ${KGD} LT-KL`, { name: 'Germany (Weimar Republic)', note: 'Posen and West Prussia went to Poland; Alsace–Lorraine to France.' }),
    p(1920, 1922, `DEU -DE-SL ${PL_W45} PL-SL ${KGD}`, { name: 'Germany (Weimar Republic)' }),
    p(1922, 1935, `DEU -DE-SL ${PL_W45} ${KGD}`, { name: 'Germany (Weimar Republic)', note: 'East Upper Silesia went to Poland in 1922 (approximated by the Silesian voivodeship).' }),
    p(1935, 1938, `DEU ${PL_W45} ${KGD}`, { name: 'Nazi Germany', note: 'The Saar voted to rejoin Germany in 1935.' }),
    p(1938, 1939, `DEU ${PL_W45} ${KGD} AUT`, { name: 'Nazi Germany', note: 'Austria annexed (Anschluss), March 1938.' }),
    p(1939, 1945, `DEU ${PL_W45} ${KGD} AUT CZE LT-KL ${PL_POSEN} PL-SL ${PL_CONGRESS} ${PL_GALICIA}`, { name: 'Nazi Germany (with annexed and occupied lands)', note: 'Includes the Czech lands (1939), Memel (1939), annexed western Poland and the occupied General Government (1939).' }),
    p(1945, 1947, 'DEU', { name: 'Allied-occupied Germany' }),
    p(1947, 1949, 'DEU -DE-SL', { name: 'Allied-occupied Germany' }),
    p(1990, null, 'DEU', { note: 'Reunified 3 October 1990.' }),
  ]),
  state('west-germany', 'West Germany', [
    p(1949, 1957, `DEU ${neg(DE_EAST)} -DE-SL`, { name: 'West Germany (Federal Republic)' }),
    p(1957, 1990, `DEU ${neg(DE_EAST)}`, { name: 'West Germany (Federal Republic)', note: 'The Saar rejoined on 1 January 1957.' }),
  ], { colorOf: 'germany' }),
  state('east-germany', 'East Germany', [p(1949, 1990, DE_EAST, { name: 'East Germany (GDR)' })]),
  state('saar', 'Saar', [
    disputed(1920, 1935, 'DE-SL', 'Saar Territory (League of Nations)'),
    colony('france', 1947, 1957, 'DE-SL', 'Saar Protectorate (French)'),
  ]),
  state('poland', 'Poland', [
    p(1918, 1920, `${PL_POSEN} ${PL_CONGRESS} ${PL_GALICIA} ${UA_GALICIA}`, { name: 'Second Polish Republic' }),
    p(1920, 1922, `${PL_POSEN} ${PL_CONGRESS} ${PL_GALICIA} ${UA_GALICIA} ${KRESY} LT-VL`, { name: 'Second Polish Republic', note: 'Eastern border set by the Treaty of Riga (1921); Wilno/Vilnius held from 1920.' }),
    p(1922, 1939, `${PL_POSEN} ${PL_CONGRESS} ${PL_GALICIA} ${UA_GALICIA} ${KRESY} LT-VL PL-SL`, { name: 'Second Polish Republic' }),
    p(1945, null, 'POL', { note: 'Borders shifted west in 1945.' }),
  ]),
  state('lithuania', 'Lithuania', [
    p(1918, 1920, 'LTU -LT-KL'),
    p(1920, 1939, 'LTU -LT-VL', { note: 'Klaipėda (Memel) included from 1920 (Lithuanian from 1923); Vilnius held by Poland 1920–39.' }),
    p(1939, 1940, 'LTU -LT-KL'),
    p(1991, null, 'LTU'),
  ]),
  state('latvia', 'Latvia', [p(1918, 1940, 'LVA'), p(1991, null, 'LVA')]),
  state('estonia', 'Estonia', [p(1918, 1940, 'EST'), p(1991, null, 'EST')]),
  state('finland', 'Finland', [p(1917, null, 'FIN ALD', { note: 'Karelian territory lost in 1940/1944 is not split out (province-level approximation).' })]),
  state('russia', 'Russia', [
    p(1914, 1917, `${RU_CORE} ${UA_RUSSIAN} BLR LTU -LT-KL LVA EST FIN ALD ${PL_CONGRESS} MDA ${CAUCASUS} ${CENTRAL_ASIA} ${KARS}`, { name: 'Russian Empire' }),
    p(1917, 1918, `${RU_CORE} ${UA_RUSSIAN} BLR LTU -LT-KL LVA EST ${PL_CONGRESS} MDA ${CAUCASUS} ${CENTRAL_ASIA} ${KARS}`, { name: 'Russia (revolution and civil war)' }),
    p(1918, 1920, `${RU_CORE} ${UA_RUSSIAN} BLR ${TRANSNISTRIA} ${CENTRAL_ASIA}`, { name: 'Soviet Russia (civil war)', note: 'Soviet republics in Ukraine, Belarus and Central Asia are grouped here until the 1922 union.' }),
    p(1920, 1921, `${RU_CORE} ${UA_RUSSIAN} ${neg('UA-07 UA-56')} BLR -BY-HR -BY-BR ${TRANSNISTRIA} ${CENTRAL_ASIA}`, { name: 'Soviet Russia (civil war)' }),
    p(1921, 1922, `${RU_CORE} -RU-TY ${UA_RUSSIAN} ${neg('UA-07 UA-56')} BLR -BY-HR -BY-BR ${TRANSNISTRIA} ${CENTRAL_ASIA} ${CAUCASUS}`, { name: 'Soviet Russia' }),
    p(1991, null, 'RUS', { note: 'Crimea, occupied since 2014, is shown separately.' }),
  ], { timelineItemIds: ['russian-empire'] }),
  state('ussr', 'Soviet Union', [
    p(1922, 1939, `${RU_CORE} -RU-TY ${UA_RUSSIAN} ${neg('UA-07 UA-56')} BLR -BY-HR -BY-BR ${CAUCASUS} ${CENTRAL_ASIA} ${TRANSNISTRIA}`),
    p(1939, 1940, `${RU_CORE} -RU-TY ${UA_RUSSIAN} ${UA_GALICIA} BLR ${CAUCASUS} ${CENTRAL_ASIA} ${TRANSNISTRIA}`, { note: 'Eastern Poland annexed, September 1939.' }),
    p(1940, 1944, `${RU_CORE} -RU-TY ${UA_RUSSIAN} ${UA_GALICIA} UA-77 BLR ${CAUCASUS} ${CENTRAL_ASIA} MDA EST LVA LTU -LT-KL`, { note: 'Baltic states, Bessarabia and northern Bukovina annexed, 1940.' }),
    p(1944, 1945, `${RU_CORE} ${UA_RUSSIAN} ${UA_GALICIA} UA-77 BLR ${CAUCASUS} ${CENTRAL_ASIA} MDA EST LVA LTU -LT-KL`, { note: 'Tuva annexed, 1944.' }),
    p(1945, 1991, `RUS UKR BLR ${CAUCASUS} ${CENTRAL_ASIA} MDA EST LVA LTU`, { note: 'Königsberg (Kaliningrad) and Transcarpathia added, 1945.' }),
  ], { colorOf: 'russia' }),
  state('ukraine', 'Ukraine', [p(1991, 2014, 'UKR'), p(2014, null, `UKR ${neg(CRIMEA)}`)]),
  state('crimea', 'Crimea', [disputed(2014, null, CRIMEA, 'Crimea (Russian-occupied, part of Ukraine)')]),
  state('belarus', 'Belarus', [p(1991, null, 'BLR')]),
  state('moldova', 'Moldova', [p(1991, null, 'MDA')]),
  state('georgia', 'Georgia', [p(1918, 1921, 'GEO'), p(1991, null, 'GEO')]),
  state('armenia', 'Armenia', [p(1918, 1921, 'ARM'), p(1991, null, 'ARM')]),
  state('azerbaijan', 'Azerbaijan', [p(1918, 1921, 'AZE'), p(1991, null, 'AZE')]),
  state('kazakhstan', 'Kazakhstan', [p(1991, null, 'KAZ KAB')]),
  state('uzbekistan', 'Uzbekistan', [p(1991, null, 'UZB')]),
  state('turkmenistan', 'Turkmenistan', [p(1991, null, 'TKM')]),
  state('kyrgyzstan', 'Kyrgyzstan', [p(1991, null, 'KGZ')]),
  state('tajikistan', 'Tajikistan', [p(1991, null, 'TJK')]),
  state('tuva', 'Tuva', [p(1921, 1944, TUVA, { name: "Tuvan People's Republic" })]),
  state('austria-hungary', 'Austria-Hungary', [
    p(1914, 1918, `AUT HUN CZE SVK SVN HRV BIH ${TRANSYLVANIA} RO-SV UA-77 ${UA_GALICIA} ${PL_GALICIA} UA-21 ${VOJVODINA} ${TYROL_S} ${JULIAN} ${KOTOR}`),
  ], { timelineItemIds: ['austro-hungarian'] }),
  state('austria', 'Austria', [p(1918, 1938, 'AUT'), p(1945, null, 'AUT')]),
  state('hungary', 'Hungary', [p(1918, 1939, 'HUN'), p(1939, 1945, 'HUN UA-21'), p(1945, null, 'HUN')]),
  state('czechoslovakia', 'Czechoslovakia', [p(1918, 1939, 'CZE SVK UA-21'), p(1945, 1993, 'CZE SVK')]),
  state('czechia', 'Czech Republic', [p(1993, null, 'CZE', { name: 'Czechia' })]),
  state('slovakia', 'Slovakia', [p(1939, 1945, 'SVK', { name: 'Slovak Republic (Axis client state)' }), p(1993, null, 'SVK')]),
  state('yugoslavia', 'Yugoslavia', [
    p(1918, 1945, `SRB KOS MNE MKD SVN HRV BIH ${neg(ISTRIA)}`, { name: 'Kingdom of Yugoslavia', note: 'Kingdom of Serbs, Croats and Slovenes until 1929.' }),
    p(1945, 1991, 'SRB KOS MNE MKD SVN HRV BIH', { name: 'Socialist Federal Republic of Yugoslavia' }),
    p(1991, 1992, 'SRB KOS MNE BIH', { name: 'Yugoslavia (breaking up)' }),
    p(1992, 2006, 'SRB KOS MNE', { name: 'FR Yugoslavia / Serbia and Montenegro' }),
  ]),
  state('serbia', 'Serbia', [
    p(1914, 1918, `SRB ${neg(VOJVODINA)} KOS MKD`, { name: 'Kingdom of Serbia' }),
    p(2006, 2008, 'SRB KOS'),
    p(2008, null, 'SRB'),
  ], { colorOf: 'yugoslavia' }),
  state('montenegro', 'Montenegro', [p(1914, 1918, `MNE ${neg(KOTOR)}`, { name: 'Kingdom of Montenegro' }), p(2006, null, 'MNE')]),
  state('kosovo', 'Kosovo', [p(2008, null, 'KOS', { name: 'Kosovo (partially recognised)' })]),
  state('slovenia', 'Slovenia', [p(1991, null, 'SVN')]),
  state('croatia', 'Croatia', [p(1991, null, 'HRV')]),
  state('north-macedonia', 'North Macedonia', [p(1991, 2019, 'MKD', { name: 'Macedonia' }), p(2019, null, 'MKD')]),
  state('bosnia', 'Bosnia and Herzegovina', [p(1992, null, 'BIH')]),
  state('italy', 'Italy', [
    p(1914, 1918, `ITA ${neg(TYROL_S)} ${neg(JULIAN)}`, { name: 'Kingdom of Italy' }),
    p(1918, 1939, `ITA ${ISTRIA}`, { name: 'Kingdom of Italy' }),
    p(1939, 1943, `ITA ${ISTRIA} ALB`, { name: 'Kingdom of Italy (with Albania)' }),
    p(1943, 1945, `ITA ${ISTRIA}`, { name: 'Kingdom of Italy' }),
    p(1945, null, 'ITA', { note: 'Republic since 1946.' }),
  ]),
  state('albania', 'Albania', [p(1914, 1939, 'ALB'), p(1943, null, 'ALB')]),
  state('romania', 'Romania', [
    p(1914, 1918, `ROU ${neg(TRANSYLVANIA)} -RO-SV ${DOBRUJA_S}`, { name: 'Kingdom of Romania' }),
    p(1918, 1940, `ROU ${DOBRUJA_S} MDA ${neg(TRANSNISTRIA)} UA-77`, { name: 'Greater Romania', note: 'Transylvania, Bukovina and Bessarabia joined in 1918.' }),
    p(1940, null, 'ROU'),
  ]),
  state('bulgaria', 'Bulgaria', [p(1914, 1940, `BGR ${neg(DOBRUJA_S)}`), p(1940, null, 'BGR')]),
  state('greece', 'Greece', [p(1914, null, 'GRC')]),
  state('spain', 'Spain', [p(1914, null, 'ESP')], { timelineItemIds: SPAN }),
  state('portugal', 'Portugal', [p(1914, null, 'PRT')], { timelineItemIds: PORT }),
  state('switzerland', 'Switzerland', [p(1914, null, 'CHE')]),
  state('liechtenstein', 'Liechtenstein', [p(1914, null, 'LIE')]),
  state('belgium', 'Belgium', [p(1914, null, 'BEL')]),
  state('netherlands', 'Netherlands', [p(1914, null, 'NLD -NL-BQ1 -NL-BQ2 -NL-BQ3')]),
  state('luxembourg', 'Luxembourg', [p(1914, null, 'LUX')]),
  state('denmark', 'Denmark', [p(1914, null, 'DNK FRO')]),
  state('norway', 'Norway', [p(1914, null, 'NOR')]),
  state('sweden', 'Sweden', [p(1914, null, 'SWE')]),
  state('iceland', 'Iceland', [
    colony('denmark', 1914, 1918, 'ISL', 'Iceland (Danish)'),
    p(1918, 1944, 'ISL', { name: 'Kingdom of Iceland' }),
    p(1944, null, 'ISL'),
  ]),
  state('greenland', 'Greenland', [colony('denmark', 1914, null, 'GRL', 'Greenland (Danish realm)')]),
  state('andorra', 'Andorra', [p(1914, null, 'AND')]),
  state('monaco', 'Monaco', [p(1914, null, 'MCO')]),
  state('san-marino', 'San Marino', [p(1914, null, 'SMR')]),
  state('malta', 'Malta', [colony('uk', 1914, 1964, 'MLT', 'Malta (British)'), p(1964, null, 'MLT')], { timelineItemIds: BRIT }),
  state('cyprus', 'Cyprus', [
    colony('uk', 1914, 1960, 'CYP CYN ESB WSB', 'Cyprus (British)'),
    p(1960, 1974, 'CYP CYN'),
    p(1974, null, 'CYP', { note: 'The north has been under Turkish occupation since 1974.' }),
  ], { timelineItemIds: BRIT }),
  state('northern-cyprus', 'Northern Cyprus', [disputed(1974, null, 'CYN', 'Northern Cyprus (Turkish-occupied)')]),

  // =========================================================================
  // Middle East and North Africa
  // =========================================================================
  state('ottoman-empire', 'Ottoman Empire', [
    p(1914, 1916, `TUR ${neg(KARS)} SYR LBN ISR PSX JOR IRQ ${HEJAZ} ${ASIR} ${YE_NORTH}`),
    p(1916, 1918, `TUR ${neg(KARS)} SYR LBN ISR PSX JOR IRQ ${YE_NORTH}`, { note: 'The Arab Revolt took the Hejaz in 1916.' }),
    p(1918, 1919, `TUR SYR LBN ISR PSX JOR IRQ`, { note: 'Kars, Ardahan and Iğdır regained from Russia, 1918.' }),
    p(1919, 1923, `TUR ${neg(HATAY)}`, { note: 'Arab provinces under Allied occupation, then League of Nations mandates.' }),
  ], { timelineItemIds: ['ottoman'] }),
  state('turkey', 'Turkey', [p(1923, 1939, `TUR ${neg(HATAY)}`), p(1939, null, 'TUR', { note: 'Hatay joined in 1939.' })]),
  state('hejaz', 'Hejaz', [p(1916, 1925, HEJAZ, { name: 'Kingdom of Hejaz' })]),
  state('asir', 'Asir', [p(1916, 1926, ASIR, { name: 'Idrisid Emirate of Asir' })]),
  state('jabal-shammar', 'Jabal Shammar', [p(1914, 1921, SHAMMAR, { name: 'Emirate of Jabal Shammar' })]),
  state('saudi-arabia', 'Saudi Arabia', [
    p(1914, 1921, NEJD, { name: 'Emirate of Nejd and Hasa' }),
    p(1921, 1925, `${NEJD} ${SHAMMAR}`, { name: 'Sultanate of Nejd' }),
    p(1925, 1926, `${NEJD} ${SHAMMAR} ${HEJAZ}`, { name: 'Kingdom of Hejaz and Nejd' }),
    p(1926, 1932, `${NEJD} ${SHAMMAR} ${HEJAZ} ${ASIR}`, { name: 'Kingdom of Hejaz and Nejd' }),
    p(1932, null, 'SAU'),
  ]),
  state('yemen', 'Yemen', [
    p(1918, 1962, YE_NORTH, { name: 'Mutawakkilite Kingdom of Yemen' }),
    p(1962, 1990, YE_NORTH, { name: 'Yemen Arab Republic (North Yemen)' }),
    p(1990, null, 'YEM', { note: 'North and South unified in 1990.' }),
  ]),
  state('south-yemen', 'South Yemen', [
    colony('uk', 1914, 1967, YE_SOUTH, 'Aden and the Aden Protectorate (British)'),
    p(1967, 1990, YE_SOUTH, { name: 'South Yemen' }),
  ], { timelineItemIds: BRIT }),
  state('oman', 'Oman', [p(1914, 1970, 'OMN', { name: 'Muscat and Oman' }), p(1970, null, 'OMN')]),
  state('uae', 'United Arab Emirates', [colony('uk', 1914, 1971, 'ARE', 'Trucial States (British)'), p(1971, null, 'ARE')], { timelineItemIds: BRIT }),
  state('qatar', 'Qatar', [colony('uk', 1914, 1971, 'QAT', 'Qatar (British protectorate)'), p(1971, null, 'QAT')], { timelineItemIds: BRIT }),
  state('bahrain', 'Bahrain', [colony('uk', 1914, 1971, 'BHR', 'Bahrain (British protectorate)'), p(1971, null, 'BHR')], { timelineItemIds: BRIT }),
  state('kuwait', 'Kuwait', [colony('uk', 1914, 1961, 'KWT', 'Kuwait (British protectorate)'), p(1961, null, 'KWT')], { timelineItemIds: BRIT }),
  state('iraq', 'Iraq', [
    colony('uk', 1919, 1932, 'IRQ', 'Mandatory Iraq (British)'),
    p(1932, 1958, 'IRQ', { name: 'Kingdom of Iraq' }),
    p(1958, null, 'IRQ'),
  ], { timelineItemIds: BRIT }),
  state('syria', 'Syria', [
    colony('france', 1919, 1939, `SYR ${HATAY}`, 'Syria (French mandate)'),
    colony('france', 1939, 1946, 'SYR', 'Syria (French mandate)'),
    p(1946, null, 'SYR'),
  ], { timelineItemIds: FREN }),
  state('lebanon', 'Lebanon', [colony('france', 1919, 1943, 'LBN', 'Lebanon (French mandate)'), p(1943, null, 'LBN')], { timelineItemIds: FREN }),
  state('mandatory-palestine', 'Mandatory Palestine', [colony('uk', 1919, 1948, 'ISR PSX', 'Mandatory Palestine (British)')], { timelineItemIds: BRIT }),
  state('israel', 'Israel', [p(1948, null, 'ISR')]),
  state('palestine', 'Palestinian territories', [
    disputed(1948, 1967, 'PS-GZZ', 'Gaza Strip (Egyptian-administered)'),
    disputed(1967, null, 'PS-GZZ PS-WBK', 'Palestinian territories', { note: 'Israeli-occupied since 1967; Palestinian Authority since 1994.' }),
  ]),
  state('jordan', 'Jordan', [
    colony('uk', 1919, 1946, 'JOR', 'Transjordan (British mandate)'),
    p(1946, 1948, 'JOR'),
    p(1948, 1967, 'JOR PS-WBK', { note: 'Held the West Bank 1948–67.' }),
    p(1967, null, 'JOR'),
  ], { timelineItemIds: BRIT }),
  state('iran', 'Iran', [p(1914, 1935, 'IRN', { name: 'Persia' }), p(1935, null, 'IRN')]),
  state('afghanistan', 'Afghanistan', [p(1914, null, 'AFG')]),
  state('egypt', 'Egypt', [colony('uk', 1914, 1922, 'EGY', 'Egypt (British protectorate)'), p(1922, 1953, 'EGY', { name: 'Kingdom of Egypt' }), p(1953, null, 'EGY')], { timelineItemIds: BRIT }),
  state('libya', 'Libya', [
    colony('italy', 1914, 1943, 'LBY', 'Italian Libya'),
    colony('uk', 1943, 1951, 'LBY', 'Libya (British and French administration)'),
    p(1951, null, 'LBY'),
  ]),
  state('tunisia', 'Tunisia', [colony('france', 1914, 1956, 'TUN', 'Tunisia (French protectorate)'), p(1956, null, 'TUN')], { timelineItemIds: FREN }),
  state('algeria', 'Algeria', [colony('france', 1914, 1962, 'DZA', 'Algeria (French)'), p(1962, null, 'DZA')], { timelineItemIds: FREN }),
  state('morocco', 'Morocco', [
    colony('france', 1914, 1956, `MAR -MA-15 -MA-16 ${neg(SP_MOROCCO)}`, 'Morocco (French protectorate)'),
    p(1956, null, 'MAR -MA-15 -MA-16'),
  ], { timelineItemIds: FREN }),
  state('spanish-morocco', 'Spanish Morocco', [colony('spain', 1914, 1956, SP_MOROCCO, 'Spanish protectorate in Morocco')], { timelineItemIds: SPAN }),
  state('western-sahara', 'Western Sahara', [
    colony('spain', 1914, 1976, WSAHARA, 'Spanish Sahara'),
    disputed(1976, null, WSAHARA, 'Western Sahara (disputed)', { note: 'Mostly Moroccan-administered; claimed by the Sahrawi Republic.' }),
  ], { timelineItemIds: SPAN }),

  // =========================================================================
  // Sub-Saharan Africa
  // =========================================================================
  state('sudan', 'Sudan', [colony('uk', 1914, 1956, 'SDN SDS', 'Anglo-Egyptian Sudan'), p(1956, 2011, 'SDN SDS'), p(2011, null, 'SDN')], { timelineItemIds: BRIT }),
  state('south-sudan', 'South Sudan', [p(2011, null, 'SDS')]),
  state('ethiopia', 'Ethiopia', [
    p(1914, 1936, 'ETH', { name: 'Ethiopian Empire' }),
    colony('italy', 1936, 1941, 'ETH', 'Italian East Africa (Ethiopia)'),
    p(1941, 1952, 'ETH', { name: 'Ethiopian Empire' }),
    p(1952, 1993, 'ETH ERI', { note: 'Eritrea federated in 1952 and annexed in 1962.' }),
    p(1993, null, 'ETH'),
  ], { timelineItemIds: ['ethiopian-empire'] }),
  state('eritrea', 'Eritrea', [colony('italy', 1914, 1941, 'ERI', 'Italian Eritrea'), colony('uk', 1941, 1952, 'ERI', 'Eritrea (British administration)'), p(1993, null, 'ERI')]),
  state('djibouti', 'Djibouti', [colony('france', 1914, 1977, 'DJI', 'French Somaliland'), p(1977, null, 'DJI')], { timelineItemIds: FREN }),
  state('somalia', 'Somalia', [
    colony('italy', 1914, 1941, 'SOM', 'Italian Somaliland'),
    colony('uk', 1941, 1950, 'SOM', 'Somalia (British administration)'),
    colony('italy', 1950, 1960, 'SOM', 'Trust Territory of Somaliland (Italian)'),
    p(1960, null, 'SOM SOL', { note: 'Somaliland (the north) has claimed independence since 1991, unrecognised.' }),
  ]),
  state('british-somaliland', 'British Somaliland', [colony('uk', 1914, 1960, 'SOL', 'British Somaliland')], { timelineItemIds: BRIT }),
  state('kenya', 'Kenya', [colony('uk', 1914, 1963, 'KEN', 'Kenya (British East Africa)'), p(1963, null, 'KEN')], { timelineItemIds: BRIT }),
  state('uganda', 'Uganda', [colony('uk', 1914, 1962, 'UGA', 'Uganda Protectorate (British)'), p(1962, null, 'UGA')], { timelineItemIds: BRIT }),
  state('tanzania', 'Tanzania', [
    colony('germany', 1914, 1916, `TZA ${neg(ZANZIBAR)}`, 'German East Africa'),
    colony('uk', 1916, 1961, `TZA ${neg(ZANZIBAR)}`, 'Tanganyika (British)'),
    p(1961, 1964, `TZA ${neg(ZANZIBAR)}`, { name: 'Tanganyika' }),
    p(1964, null, 'TZA', { note: 'Tanganyika and Zanzibar united in 1964.' }),
  ], { timelineItemIds: BRIT }),
  state('zanzibar', 'Zanzibar', [colony('uk', 1914, 1963, ZANZIBAR, 'Zanzibar Protectorate (British)'), p(1963, 1964, ZANZIBAR)], { timelineItemIds: BRIT }),
  state('rwanda', 'Rwanda', [colony('germany', 1914, 1916, 'RWA', 'German East Africa (Ruanda)'), colony('belgium', 1916, 1962, 'RWA', 'Ruanda-Urundi (Belgian)'), p(1962, null, 'RWA')]),
  state('burundi', 'Burundi', [colony('germany', 1914, 1916, 'BDI', 'German East Africa (Urundi)'), colony('belgium', 1916, 1962, 'BDI', 'Ruanda-Urundi (Belgian)'), p(1962, null, 'BDI')]),
  state('dr-congo', 'DR Congo', [
    colony('belgium', 1914, 1960, 'COD', 'Belgian Congo'),
    p(1960, 1971, 'COD', { name: 'Republic of the Congo (Léopoldville)' }),
    p(1971, 1997, 'COD', { name: 'Zaire' }),
    p(1997, null, 'COD', { name: 'Democratic Republic of the Congo' }),
  ]),
  state('congo', 'Republic of the Congo', [colony('france', 1914, 1960, 'COG', 'Middle Congo (French Equatorial Africa)'), p(1960, null, 'COG')], { timelineItemIds: FREN }),
  state('gabon', 'Gabon', [colony('france', 1914, 1960, 'GAB', 'Gabon (French Equatorial Africa)'), p(1960, null, 'GAB')], { timelineItemIds: FREN }),
  state('car', 'Central African Republic', [colony('france', 1914, 1960, 'CAF', 'Ubangi-Shari (French Equatorial Africa)'), p(1960, null, 'CAF')], { timelineItemIds: FREN }),
  state('chad', 'Chad', [colony('france', 1914, 1960, 'TCD', 'Chad (French Equatorial Africa)'), p(1960, null, 'TCD')], { timelineItemIds: FREN }),
  state('cameroon', 'Cameroon', [
    colony('germany', 1914, 1916, 'CMR', 'Kamerun (German)'),
    colony('france', 1916, 1960, `CMR ${neg(BR_CAMEROONS)}`, 'French Cameroun'),
    p(1960, 1961, `CMR ${neg(BR_CAMEROONS)}`),
    p(1961, null, 'CMR', { note: 'Southern British Cameroons joined in 1961.' }),
  ], { timelineItemIds: FREN }),
  state('british-cameroons', 'British Cameroons', [colony('uk', 1916, 1961, BR_CAMEROONS, 'British Cameroons')], { timelineItemIds: BRIT }),
  state('nigeria', 'Nigeria', [colony('uk', 1914, 1960, 'NGA', 'Nigeria (British)'), p(1960, null, 'NGA')], { timelineItemIds: BRIT }),
  state('togo', 'Togo', [colony('germany', 1914, 1916, 'TGO', 'Togoland (German)'), colony('france', 1916, 1960, 'TGO', 'French Togoland'), p(1960, null, 'TGO')], { timelineItemIds: FREN }),
  state('benin', 'Benin', [colony('france', 1914, 1960, 'BEN', 'Dahomey (French West Africa)'), p(1960, 1975, 'BEN', { name: 'Dahomey' }), p(1975, null, 'BEN')], { timelineItemIds: FREN }),
  state('ghana', 'Ghana', [colony('uk', 1914, 1957, 'GHA', 'Gold Coast (British)'), p(1957, null, 'GHA')], { timelineItemIds: BRIT }),
  state('cote-divoire', "Côte d'Ivoire", [colony('france', 1914, 1960, 'CIV', "Côte d'Ivoire (French West Africa)"), p(1960, null, 'CIV')], { timelineItemIds: FREN }),
  state('burkina-faso', 'Burkina Faso', [colony('france', 1914, 1960, 'BFA', 'Upper Volta (French West Africa)'), p(1960, 1984, 'BFA', { name: 'Upper Volta' }), p(1984, null, 'BFA')], { timelineItemIds: FREN }),
  state('mali', 'Mali', [colony('france', 1914, 1960, 'MLI', 'French Sudan (French West Africa)'), p(1960, null, 'MLI')], { timelineItemIds: FREN }),
  state('niger', 'Niger', [colony('france', 1914, 1960, 'NER', 'Niger (French West Africa)'), p(1960, null, 'NER')], { timelineItemIds: FREN }),
  state('senegal', 'Senegal', [colony('france', 1914, 1960, 'SEN', 'Senegal (French West Africa)'), p(1960, null, 'SEN')], { timelineItemIds: FREN }),
  state('mauritania', 'Mauritania', [colony('france', 1914, 1960, 'MRT', 'Mauritania (French West Africa)'), p(1960, null, 'MRT')], { timelineItemIds: FREN }),
  state('guinea', 'Guinea', [colony('france', 1914, 1958, 'GIN', 'French Guinea (French West Africa)'), p(1958, null, 'GIN')], { timelineItemIds: FREN }),
  state('gambia', 'Gambia', [colony('uk', 1914, 1965, 'GMB', 'Gambia (British)'), p(1965, null, 'GMB')], { timelineItemIds: BRIT }),
  state('sierra-leone', 'Sierra Leone', [colony('uk', 1914, 1961, 'SLE', 'Sierra Leone (British)'), p(1961, null, 'SLE')], { timelineItemIds: BRIT }),
  state('liberia', 'Liberia', [p(1914, null, 'LBR')]),
  state('guinea-bissau', 'Guinea-Bissau', [colony('portugal', 1914, 1974, 'GNB', 'Portuguese Guinea'), p(1974, null, 'GNB')], { timelineItemIds: PORT }),
  state('cape-verde', 'Cape Verde', [colony('portugal', 1914, 1975, 'CPV', 'Cape Verde (Portuguese)'), p(1975, null, 'CPV')], { timelineItemIds: PORT }),
  state('equatorial-guinea', 'Equatorial Guinea', [colony('spain', 1914, 1968, 'GNQ', 'Spanish Guinea'), p(1968, null, 'GNQ')], { timelineItemIds: SPAN }),
  state('sao-tome', 'São Tomé and Príncipe', [colony('portugal', 1914, 1975, 'STP', 'São Tomé and Príncipe (Portuguese)'), p(1975, null, 'STP')], { timelineItemIds: PORT }),
  state('angola', 'Angola', [colony('portugal', 1914, 1975, 'AGO', 'Portuguese Angola'), p(1975, null, 'AGO')], { timelineItemIds: PORT }),
  state('namibia', 'Namibia', [
    colony('germany', 1914, 1915, 'NAM', 'German South West Africa'),
    colony('south-africa', 1915, 1990, 'NAM', 'South West Africa (South African rule)'),
    p(1990, null, 'NAM'),
  ]),
  state('south-africa', 'South Africa', [
    dominion(1914, 1931, 'ZAF', 'Union of South Africa (British dominion)'),
    p(1931, 1961, 'ZAF', { name: 'Union of South Africa', note: 'Fully self-governing from the Statute of Westminster (1931).' }),
    p(1961, null, 'ZAF'),
  ], { timelineItemIds: BRIT }),
  state('botswana', 'Botswana', [colony('uk', 1914, 1966, 'BWA', 'Bechuanaland Protectorate (British)'), p(1966, null, 'BWA')], { timelineItemIds: BRIT }),
  state('lesotho', 'Lesotho', [colony('uk', 1914, 1966, 'LSO', 'Basutoland (British)'), p(1966, null, 'LSO')], { timelineItemIds: BRIT }),
  state('eswatini', 'Eswatini', [colony('uk', 1914, 1968, 'SWZ', 'Swaziland (British)'), p(1968, 2018, 'SWZ', { name: 'Swaziland' }), p(2018, null, 'SWZ')], { timelineItemIds: BRIT }),
  state('zimbabwe', 'Zimbabwe', [
    colony('uk', 1914, 1965, 'ZWE', 'Southern Rhodesia (British)'),
    p(1965, 1980, 'ZWE', { name: 'Rhodesia (unrecognised)', note: 'Unilateral declaration of independence, 1965; not recognised.' }),
    p(1980, null, 'ZWE'),
  ], { timelineItemIds: BRIT }),
  state('zambia', 'Zambia', [colony('uk', 1914, 1964, 'ZMB', 'Northern Rhodesia (British)'), p(1964, null, 'ZMB')], { timelineItemIds: BRIT }),
  state('malawi', 'Malawi', [colony('uk', 1914, 1964, 'MWI', 'Nyasaland (British)'), p(1964, null, 'MWI')], { timelineItemIds: BRIT }),
  state('mozambique', 'Mozambique', [colony('portugal', 1914, 1975, 'MOZ', 'Portuguese Mozambique'), p(1975, null, 'MOZ')], { timelineItemIds: PORT }),
  state('madagascar', 'Madagascar', [colony('france', 1914, 1960, 'MDG', 'Madagascar (French)'), p(1960, null, 'MDG')], { timelineItemIds: FREN }),
  state('comoros', 'Comoros', [colony('france', 1914, 1975, 'COM', 'Comoros (French)'), p(1975, null, 'COM')], { timelineItemIds: FREN }),
  state('mauritius', 'Mauritius', [colony('uk', 1914, 1968, 'MUS', 'Mauritius (British)'), p(1968, null, 'MUS')], { timelineItemIds: BRIT }),

  // =========================================================================
  // Asia and the Pacific
  // =========================================================================
  state('china', 'China', [
    p(1914, 1932, `CHN ${neg(TIBET)}`, { name: 'Republic of China' }),
    p(1932, 1945, `CHN ${neg(TIBET)} ${neg(MANCHURIA)}`, { name: 'Republic of China', note: 'Manchuria was the Japanese puppet state Manchukuo, 1932–45; wartime occupation is not drawn.' }),
    p(1945, 1949, `CHN ${neg(TIBET)} TWN`, { name: 'Republic of China' }),
    p(1949, 1950, `CHN ${neg(TIBET)}`, { name: "People's Republic of China" }),
    p(1950, 1997, 'CHN', { name: "People's Republic of China", note: 'Tibet annexed 1950–51.' }),
    p(1997, 1999, 'CHN HKG', { name: "People's Republic of China" }),
    p(1999, null, 'CHN HKG MAC', { name: "People's Republic of China" }),
  ]),
  state('tibet', 'Tibet', [p(1914, 1950, TIBET, { name: 'Tibet (de facto independent)' })]),
  state('manchukuo', 'Manchukuo', [colony('japan', 1932, 1945, MANCHURIA, 'Manchukuo (Japanese puppet state)')], { timelineItemIds: JAPN }),
  state('taiwan', 'Taiwan', [colony('japan', 1914, 1945, 'TWN', 'Taiwan (Japanese)'), p(1949, null, 'TWN', { name: 'Taiwan (Republic of China)' })], { timelineItemIds: JAPN }),
  state('mongolia', 'Mongolia', [
    p(1914, 1924, 'MNG', { name: 'Bogd Khanate of Mongolia' }),
    p(1924, 1992, 'MNG', { name: "Mongolian People's Republic" }),
    p(1992, null, 'MNG'),
  ]),
  state('hong-kong', 'Hong Kong', [colony('uk', 1914, 1997, 'HKG', 'Hong Kong (British)')], { timelineItemIds: BRIT }),
  state('macau', 'Macau', [colony('portugal', 1914, 1999, 'MAC', 'Macau (Portuguese)')], { timelineItemIds: PORT }),
  state('japan', 'Japan', [
    p(1914, 1945, 'JPN', { name: 'Empire of Japan' }),
    p(1945, 1972, 'JPN -JP-47', { note: 'Okinawa was US-administered until 1972.' }),
    p(1972, null, 'JPN'),
  ], { timelineItemIds: JAPN }),
  state('ryukyu', 'Ryukyu Islands', [colony('usa', 1945, 1972, 'JP-47', 'Ryukyu Islands (US-administered)')]),
  state('korea', 'Korea', [colony('japan', 1914, 1945, 'KOR PRK', 'Korea (Japanese)')], { timelineItemIds: JAPN }),
  state('north-korea', 'North Korea', [p(1945, 1948, 'PRK', { name: 'Soviet-occupied Korea' }), p(1948, null, 'PRK')]),
  state('south-korea', 'South Korea', [p(1945, 1948, 'KOR', { name: 'US-occupied Korea' }), p(1948, null, 'KOR')]),
  state('british-raj', 'British India', [
    colony('uk', 1914, 1937, `IND PAK BGD MMR KAS ${neg(GOA)} ${neg(PONDY)}`, 'British India (the Raj)'),
    colony('uk', 1937, 1947, `IND PAK BGD KAS ${neg(GOA)} ${neg(PONDY)}`, 'British India (the Raj)'),
  ], { timelineItemIds: ['british-raj', 'british-empire'] }),
  state('india', 'India', [
    p(1947, 1954, `IND KAS ${neg(GOA)} ${neg(PONDY)} ${neg(SIKKIM)}`),
    p(1954, 1961, `IND KAS ${neg(GOA)} ${neg(SIKKIM)}`),
    p(1961, 1975, `IND KAS ${neg(SIKKIM)}`),
    p(1975, null, 'IND KAS', { note: 'Kashmir is shown along the lines of control.' }),
  ]),
  state('sikkim', 'Sikkim', [colony('india', 1947, 1975, SIKKIM, 'Sikkim (Indian protectorate)')]),
  state('portuguese-india', 'Portuguese India', [colony('portugal', 1914, 1961, GOA, 'Portuguese India (Goa, Daman and Diu)')], { timelineItemIds: PORT }),
  state('french-india', 'French India', [colony('france', 1914, 1954, PONDY, 'French India (Pondichéry)')], { timelineItemIds: FREN }),
  state('pakistan', 'Pakistan', [p(1947, 1971, 'PAK BGD', { name: 'Pakistan (West and East)' }), p(1971, null, 'PAK')]),
  state('bangladesh', 'Bangladesh', [p(1971, null, 'BGD')]),
  state('myanmar', 'Myanmar', [
    colony('uk', 1937, 1948, 'MMR', 'British Burma'),
    p(1948, 1989, 'MMR', { name: 'Burma' }),
    p(1989, null, 'MMR'),
  ], { timelineItemIds: BRIT }),
  state('sri-lanka', 'Sri Lanka', [colony('uk', 1914, 1948, 'LKA', 'Ceylon (British)'), p(1948, 1972, 'LKA', { name: 'Ceylon' }), p(1972, null, 'LKA')], { timelineItemIds: BRIT }),
  state('nepal', 'Nepal', [p(1914, null, 'NPL')]),
  state('bhutan', 'Bhutan', [p(1914, null, 'BTN')]),
  state('maldives', 'Maldives', [colony('uk', 1914, 1965, 'MDV', 'Maldives (British protectorate)'), p(1965, null, 'MDV')], { timelineItemIds: BRIT }),
  state('thailand', 'Thailand', [p(1914, 1939, 'THA', { name: 'Siam' }), p(1939, null, 'THA')]),
  state('french-indochina', 'French Indochina', [
    colony('france', 1914, 1953, 'VNM LAO KHM', 'French Indochina'),
    colony('france', 1953, 1954, 'VNM', 'French Indochina (Vietnam)'),
  ], { timelineItemIds: FREN }),
  state('laos', 'Laos', [p(1953, null, 'LAO')]),
  state('cambodia', 'Cambodia', [p(1953, null, 'KHM')]),
  state('vietnam', 'Vietnam', [
    p(1954, 1976, 'VNM^N17', { name: 'North Vietnam', note: 'Partition line approximated at 17°N (provincial level).' }),
    p(1976, null, 'VNM', { note: 'Reunified in 1976.' }),
  ]),
  state('south-vietnam', 'South Vietnam', [p(1954, 1976, 'VNM^S17')]),
  state('malaysia', 'Malaysia', [
    colony('uk', 1914, 1957, `MYS ${neg(MY_BORNEO)} SGP`, 'British Malaya'),
    p(1957, 1963, `MYS ${neg(MY_BORNEO)}`, { name: 'Malaya' }),
    p(1963, 1965, 'MYS SGP'),
    p(1965, null, 'MYS', { note: 'Singapore left in 1965.' }),
  ], { timelineItemIds: BRIT }),
  state('singapore', 'Singapore', [colony('uk', 1957, 1963, 'SGP', 'Singapore (British)'), p(1965, null, 'SGP')], { timelineItemIds: BRIT }),
  state('british-borneo', 'British Borneo', [colony('uk', 1914, 1963, MY_BORNEO, 'North Borneo and Sarawak (British)')], { timelineItemIds: BRIT }),
  state('brunei', 'Brunei', [colony('uk', 1914, 1984, 'BRN', 'Brunei (British protectorate)'), p(1984, null, 'BRN')], { timelineItemIds: BRIT }),
  state('indonesia', 'Indonesia', [
    colony('netherlands', 1914, 1949, 'IDN', 'Dutch East Indies'),
    p(1949, 1963, `IDN ${neg(NNG)}`),
    p(1963, null, 'IDN', { note: 'Western New Guinea transferred in 1963.' }),
  ]),
  state('netherlands-new-guinea', 'Netherlands New Guinea', [colony('netherlands', 1949, 1963, NNG, 'Netherlands New Guinea')]),
  state('east-timor', 'Timor-Leste', [
    colony('portugal', 1914, 1976, 'TLS', 'Portuguese Timor'),
    disputed(1976, 1999, 'TLS', 'East Timor (Indonesian-occupied)'),
    disputed(1999, 2002, 'TLS', 'East Timor (UN administration)'),
    p(2002, null, 'TLS'),
  ], { timelineItemIds: PORT }),
  state('philippines', 'Philippines', [colony('usa', 1914, 1946, 'PHL', 'Philippines (US)'), p(1946, null, 'PHL')]),
  state('papua-new-guinea', 'Papua New Guinea', [colony('australia', 1914, 1975, 'PNG', 'Papua and New Guinea (Australian)'), p(1975, null, 'PNG')]),
  state('australia', 'Australia', [dominion(1914, 1931, 'AUS', 'Commonwealth of Australia (British dominion)'), p(1931, null, 'AUS')], { timelineItemIds: BRIT }),
  state('new-zealand', 'New Zealand', [dominion(1914, 1931, 'NZL', 'Dominion of New Zealand (British dominion)'), p(1931, null, 'NZL')], { timelineItemIds: BRIT }),
  state('fiji', 'Fiji', [colony('uk', 1914, 1970, 'FJI', 'Fiji (British)'), p(1970, null, 'FJI')], { timelineItemIds: BRIT }),
  state('solomon-islands', 'Solomon Islands', [colony('uk', 1914, 1978, 'SLB', 'Solomon Islands (British)'), p(1978, null, 'SLB')], { timelineItemIds: BRIT }),
  state('vanuatu', 'Vanuatu', [colony('uk', 1914, 1980, 'VUT', 'New Hebrides (Anglo-French condominium)'), p(1980, null, 'VUT')], { timelineItemIds: BRIT }),
  state('samoa', 'Samoa', [colony('new-zealand', 1914, 1962, 'WSM', 'Western Samoa (New Zealand)'), p(1962, null, 'WSM')]),
  state('tonga', 'Tonga', [colony('uk', 1914, 1970, 'TON', 'Tonga (British protected state)'), p(1970, null, 'TON')], { timelineItemIds: BRIT }),

  // =========================================================================
  // The Americas
  // =========================================================================
  state('usa', 'United States', [p(1914, null, 'USA')]),
  state('puerto-rico', 'Puerto Rico', [colony('usa', 1914, null, 'PRI', 'Puerto Rico (US)')]),
  state('canada', 'Canada', [
    dominion(1914, 1931, `CAN ${neg(NFLD)}`, 'Dominion of Canada (British dominion)'),
    p(1931, 1949, `CAN ${neg(NFLD)}`),
    p(1949, null, 'CAN', { note: 'Newfoundland joined in 1949.' }),
  ], { timelineItemIds: BRIT }),
  state('newfoundland', 'Newfoundland', [
    dominion(1914, 1934, NFLD, 'Dominion of Newfoundland (British dominion)'),
    colony('uk', 1934, 1949, NFLD, 'Newfoundland (British administration)'),
  ], { timelineItemIds: BRIT }),
  state('mexico', 'Mexico', [p(1914, null, 'MEX')]),
  state('guatemala', 'Guatemala', [p(1914, null, 'GTM')]),
  state('belize', 'Belize', [colony('uk', 1914, 1981, 'BLZ', 'British Honduras'), p(1981, null, 'BLZ')], { timelineItemIds: BRIT }),
  state('honduras', 'Honduras', [p(1914, null, 'HND')]),
  state('el-salvador', 'El Salvador', [p(1914, null, 'SLV')]),
  state('nicaragua', 'Nicaragua', [p(1914, null, 'NIC')]),
  state('costa-rica', 'Costa Rica', [p(1914, null, 'CRI')]),
  state('panama', 'Panama', [p(1914, null, 'PAN')]),
  state('cuba', 'Cuba', [p(1914, null, 'CUB USG')]),
  state('haiti', 'Haiti', [p(1914, null, 'HTI')]),
  state('dominican-republic', 'Dominican Republic', [p(1914, null, 'DOM')]),
  state('jamaica', 'Jamaica', [colony('uk', 1914, 1962, 'JAM', 'Jamaica (British)'), p(1962, null, 'JAM')], { timelineItemIds: BRIT }),
  state('trinidad', 'Trinidad and Tobago', [colony('uk', 1914, 1962, 'TTO', 'Trinidad and Tobago (British)'), p(1962, null, 'TTO')], { timelineItemIds: BRIT }),
  state('bahamas', 'Bahamas', [colony('uk', 1914, 1973, 'BHS', 'Bahamas (British)'), p(1973, null, 'BHS')], { timelineItemIds: BRIT }),
  state('colombia', 'Colombia', [p(1914, null, 'COL')]),
  state('venezuela', 'Venezuela', [p(1914, null, 'VEN')]),
  state('guyana', 'Guyana', [colony('uk', 1914, 1966, 'GUY', 'British Guiana'), p(1966, null, 'GUY')], { timelineItemIds: BRIT }),
  state('suriname', 'Suriname', [colony('netherlands', 1914, 1975, 'SUR', 'Surinam (Dutch)'), p(1975, null, 'SUR')]),
  state('ecuador', 'Ecuador', [p(1914, null, 'ECU')]),
  state('peru', 'Peru', [p(1914, null, 'PER')]),
  state('bolivia', 'Bolivia', [p(1914, null, 'BOL')]),
  state('brazil', 'Brazil', [p(1914, null, 'BRA')]),
  state('paraguay', 'Paraguay', [p(1914, null, 'PRY')]),
  state('uruguay', 'Uruguay', [p(1914, null, 'URY')]),
  state('argentina', 'Argentina', [p(1914, null, 'ARG')]),
  state('chile', 'Chile', [p(1914, null, 'CHL')]),
  state('falklands', 'Falkland Islands', [colony('uk', 1914, null, 'FLK SGS', 'Falkland Islands (British)')], { timelineItemIds: BRIT }),
];

// ---------------------------------------------------------------------------
// Colours (Day 38). Fixed colours for the three biggest colonial / imperial blocs so they
// read the same in every year; everything else is graph-coloured by the build script so
// neighbours never share a colour in any year (see src/data/nations-colors.js).
// Palette avoids the warm presence-wash tint (#F2C57C) and the hatch-white of peoples.
// ---------------------------------------------------------------------------
export const NATION_FIXED_COLORS = {
  uk: '#E7849F', // imperial pink
  france: '#5B8DEF',
  russia: '#D9534F', // Russian Empire, Soviet Union, Russia
  __disputed: '#9AA3AD',
};

export const NATION_PALETTE = [
  '#3DBE8B', // green
  '#F08A4B', // orange
  '#A77BDB', // violet
  '#2BB3C0', // cyan
  '#C9D45C', // lime
  '#E46FC4', // magenta
  '#7E9F3D', // olive
  '#D4A63A', // ochre
  '#B5654A', // terracotta
];

/** Colour group of a period: colonies share their owner's colour; disputed areas share grey. */
export function nationColorGroup(entity, period) {
  const kind = period?.kind || entity.kind;
  if ((kind === 'colony' || kind === 'dominion') && period?.owner) {
    const owner = NATION_ENTITIES_BY_ID.get(period.owner);
    return owner?.colorOf || period.owner;
  }
  if (kind === 'disputed') return '__disputed';
  return entity.colorOf || entity.id;
}

export const NATION_ENTITIES_BY_ID = new Map(NATION_ENTITIES.map((e) => [e.id, e]));
