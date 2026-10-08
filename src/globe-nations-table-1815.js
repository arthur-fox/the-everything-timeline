/**
 * Day 41 — the nations layer extended back to 1815 (Congress of Vienna → eve of World War I).
 *
 * Same method as the 1914–2025 table (src/globe-nations-table.js): every unit is a Natural
 * Earth (public domain) admin-0 / admin-1 code, regrouped by year; the dates are historical
 * facts written by hand (no licensed historical dataset — CShapes is CC BY-NC-SA and
 * historical-basemaps is GPL, so neither is used). Entities with an id that also exists in the
 * 1914 table get these periods prepended; new ids (Prussia, the Papal States, the Sokoto
 * Caliphate …) only live in the 19th century.
 *
 * Honesty notes (read before trusting a border):
 *   - Borders are today's provinces regrouped, so 19th-century lines are approximate wherever
 *     they cut across a modern province: German states use today's Länder (Baden and
 *     Württemberg are one shape; Western Pomerania sits with Mecklenburg), Kazakh and Central
 *     Asian conquests move oblast by oblast, the US gains whole modern states (Colorado counts
 *     as Mexican until 1848, the Gadsden Purchase is not split), Natal / Zululand are one shape.
 *   - Before 1914 only land a state actually claimed or governed is drawn. Land held by peoples
 *     outside any state (much of inland Africa before the 1880s, Patagonia, Aboriginal Australia
 *     before 1829) is left to the hand-drawn peoples / presence layers.
 *   - Colonial claims are drawn from the year they were made with roughly their final extent,
 *     although real control of the interior often came 10–30 years later (noted per colony).
 *   - Vassal / autonomous states (Serbia, the Danubian Principalities, Egypt, Tunisia, Bulgaria
 *     before 1908) are their own shapes in their suzerain's paler colour, like colonies.
 *   - Change years are whole years (a 1860 treaty shows from 1860); short-lived wartime
 *     occupations and revolutions (1848, the Taiping kingdom) are not drawn.
 */
import {
  AL, FR_OVS, PL_W45, PL_POSEN, PL_CONGRESS, PL_GALICIA, UA_GALICIA, TRANSYLVANIA, VOJVODINA,
  TYROL_S, JULIAN, KOTOR, DOBRUJA_S, KARS, KGD, HEJAZ, ASIR, NEJD, SHAMMAR, YE_SOUTH, YE_NORTH,
  WSAHARA, SP_MOROCCO, TIBET, GOA, PONDY, MY_BORNEO, ZANZIBAR, NFLD, UK_ISLES, neg, RU_CORE,
  UA_RUSSIAN, p, state, colony, dominion, disputed, vassal, steps, BUKHARA, KHIVA, BRIT, FREN,
  PORT, SPAN, JAPN,
} from './globe-nations-units.js';

const END = 1914; // these periods hand over to the 1914–2025 table here

// ---------------------------------------------------------------------------
// Unit groups (Natural Earth admin-1 codes)
// ---------------------------------------------------------------------------
// Italy before unification (provinces)
const IT_SARDINIA = 'IT-TO IT-CN IT-AT IT-AL IT-VC IT-NO IT-BI IT-VB IT-AO IT-GE IT-SV IT-IM IT-SP IT-SS IT-NU IT-OT IT-OR IT-VS IT-CA IT-CI IT-OG';
const SAVOY_NICE = 'FR-73 FR-74 FR-06';
const LOMBARDY = 'IT-VA IT-CO IT-SO IT-MI IT-LC IT-MB IT-LO IT-BG IT-BS IT-CR IT-PV';
const VENETIA = 'IT-VE IT-PD IT-RO IT-VR IT-VI IT-TV IT-BL IT-UD IT-PN IT-MN'; // with Mantua (Austrian until 1866)
const PARMA = 'IT-PR IT-PC';
const MODENA = 'IT-MO IT-RE IT-MS';
const LUCCA = 'IT-LU';
const TUSCANY = 'IT-FI IT-PO IT-PT IT-PI IT-LI IT-SI IT-AR IT-GR';
const PAPAL_LAZIO = 'IT-RM IT-VT IT-RI IT-FR IT-LT';
const PAPAL_REST = 'IT-PG IT-TR IT-AN IT-PU IT-MC IT-FM IT-AP IT-BO IT-FE IT-RA IT-FC IT-RN';
const TWO_SICILIES =
  'IT-AQ IT-TE IT-PE IT-CH IT-CB IT-IS IT-FG IT-BT IT-BA IT-BR IT-LE IT-TA IT-MT IT-PZ IT-CS IT-KR IT-CZ IT-VV IT-RC ' +
  'IT-SA IT-NA IT-CE IT-BN IT-AV IT-TP IT-PA IT-ME IT-AG IT-CL IT-EN IT-CT IT-RG IT-SR';

// German states (today's Länder)
const PRUSSIA_1815 = `DE-BB DE-BE DE-ST DE-NW DE-RP DE-SL ${PL_W45} ${PL_POSEN} PL-SL ${KGD} LT-KL`;
const GERMANY_1914 = `DEU ${AL} ${PL_W45} ${PL_POSEN} PL-SL ${KGD} LT-KL`; // same string as the 1914 table

// Austria
const AT_CORE = `AUT HUN CZE SVK SVN HRV ${TRANSYLVANIA} RO-SV UA-77 ${UA_GALICIA} ${PL_GALICIA} UA-21 ${VOJVODINA} ${TYROL_S} ${JULIAN} ${KOTOR}`;
const AT_1914 = `AUT HUN CZE SVK SVN HRV BIH ${TRANSYLVANIA} RO-SV UA-77 ${UA_GALICIA} ${PL_GALICIA} UA-21 ${VOJVODINA} ${TYROL_S} ${JULIAN} ${KOTOR}`;

// Balkans
const RS_SOUTH = 'RS-20 RS-21 RS-22 RS-23 RS-24'; // Niš, Toplica, Pirot, Jablanica, Pčinja (Serbian 1878)
const SANDZAK = 'RS-18'; // Raška / Novi Pazar (Ottoman until 1912–13)
const ME_1878 = 'ME-12 ME-16 ME-02 ME-20'; // Nikšić, Podgorica, Bar, Ulcinj (Montenegrin 1878–80)
const ME_SANDZAK = 'ME-14 ME-04 ME-03 ME-17 ME-13 ME-01'; // Pljevlja … Plav (Montenegrin 1913)
const SERBIA_1815 = `SRB ${neg(VOJVODINA)} ${neg(RS_SOUTH)} -${SANDZAK}`;
const MONTENEGRO_1815 = `MNE ${neg(KOTOR)} ${neg(ME_1878)} ${neg(ME_SANDZAK)}`;
const E_RUMELIA = 'BG-16 BG-24 BG-02 BG-26 BG-20 BG-28 BG-13';
const BG_RHODOPE_PIRIN = 'BG-01 BG-09 BG-21'; // Ottoman until 1912–13
const BULGARIA_1878 = `BGR ${neg(E_RUMELIA)} ${neg(BG_RHODOPE_PIRIN)}`;
const RO_DOBRUJA_N = 'RO-CT RO-TL';
const DANUBIAN = `ROU ${neg(TRANSYLVANIA)} -RO-SV ${neg(RO_DOBRUJA_N)}`; // Wallachia + Moldavia
const GREECE_1830 = 'GR-J GR-A1 GR-G GR-H GR-L';
const CYPRUS = 'CYP CYN ESB WSB';
const OTTOMAN_1914 = `TUR ${neg(KARS)} SYR LBN ISR PSX JOR IRQ ${HEJAZ} ${ASIR} ${YE_NORTH}`; // same string as the 1914 table

// Caucasus, Central Asia, Russian Far East
const NAKH = 'AZ-NX AZ-SAR AZ-SAD AZ-KAN AZ-BAB AZ-SAH AZ-CUL AZ-ORD'; // Nakhchivan
const N_CAUCASUS_IMAMATE = 'RU-DA RU-CE RU-IN';
const CIRCASSIA = 'RU-AD RU-KC';
const KZ_NORTH = 'KZ-SEV KZ-PAV KZ-KUS';
const KZ_JUNIOR_MIDDLE = 'KZ-ZAP KZ-ATY KZ-AKT KZ-AKM KZ-AST KZ-KAR KZ-VOS KZ-MAN';
const KOKAND_1815 = 'UZ-FA UZ-NG UZ-AN KG-O KG-J KG-B TJ-SU UZ-SI UZ-TO UZ-TK KZ-YUZ KZ-ZHA KZ-KZY KAB KG-C KG-GB KG-T KG-Y KG-N';
const KOKAND_1865_LOSS = 'KZ-ZHA KZ-YUZ UZ-TO UZ-TK KG-C KG-GB KG-T KG-Y KG-N';
const FERGANA = 'UZ-FA UZ-NG UZ-AN KG-O KG-J KG-B';
const RU_FAR_EAST_1858 = 'RU-AMU RU-YEV';
const RU_FAR_EAST_1860 = 'RU-PRI';

// South Asia
const KASHMIR = 'IN-JK PK-JK';
const KASHMIR_STATE = 'IN-JK PK-JK IN-LA PK-GB KAS';
const LOWER_BURMA = 'MM-07 MM-06 MM-02 MM-15 MM-13';
const UPPER_BURMA = 'MM-14 MM-11 MM-01 MM-17 MM-12 MM-03 MM-04';
const RAJ_1914 = `IND PAK BGD MMR KAS ${neg(GOA)} ${neg(PONDY)}`; // same string as the 1914 table

// Southeast Asia, Oceania
const LAO_RIGHT_BANK = 'LA-XA LA-CH';
const KH_WEST = 'KH-2 KH-17 KH-1 KH-22 KH-24'; // Battambang, Siem Reap … (Siamese until 1907)
const MY_SIAM = 'MY-02 MY-09 MY-03 MY-11'; // Kedah, Perlis, Kelantan, Terengganu (Siamese until 1909)
const COCHINCHINA = 'VNM^S11.5 -VN-40 VN-58'; // the six southern provinces
const NOT_COCHINCHINA = 'VNM -VNM^S11.5 VN-40 -VN-58';
const JAVA = 'ID-JK ID-JB ID-JT ID-YO ID-JI ID-BT';
const PAPUA = 'PG-WPD PG-GPK PG-CPM PG-NCD PG-MBA PG-NPP PG-SHM';

// Africa
const SOKOTO = 'NGA^N9 -NG-BO -NG-YO';
const BORNU = 'NG-BO NG-YO';
const NIGER_COAST = 'NG-LA NG-DE NG-BY NG-RI NG-AK NG-CR NG-OG NG-OY NG-OS NG-ON NG-EK NG-ED';
const DAHOMEY = 'BJ-ZO BJ-AQ BJ-LI BJ-MO BJ-KO BJ-CO BJ-PL';
const ASHANTI = 'GH-AH GH-BA';
const ANGOLA_1815 = 'AO-LUA AO-BGO AO-CNO AO-MAL AO-CUS AO-BGU AO-NAM';
const KONGO = 'AO-ZAI AO-UIG CD-BC';
const MOZ_1815 = 'MZ-N MZ-P MZ-Q MZ-S MZ-T MZ-I MZ-L';
const GAZA = 'MZ-G MZ-B';
const BUGANDA = 'UG-101 UG-102 UG-103 UG-104 UG-105 UG-106 UG-107 UG-108 UG-109 UG-110 UG-111 UG-112 UG-113 UG-114 UG-115 UG-116 UG-117 UG-118 UG-119 UG-120 UG-121 UG-122 UG-123 UG-124'; // Uganda's Central Region districts
const TRANSVAAL = 'ZA-GT ZA-LP ZA-MP ZA-NW';
const SEGOU = 'ML-4 ML-2 ML-BKO';

// Americas
const US_1815_MISSING = 'US-FL US-WA US-OR US-ID US-TX US-CA US-NV US-UT US-AZ US-NM US-CO US-HI US-AK';
const MEX_CESSION = 'US-CA US-NV US-UT US-AZ US-NM US-CO';
const OREGON = 'US-WA US-OR US-ID';
const CENTRAL_AMERICA = 'GTM SLV HND NIC CRI';
const CHILE_1818 = 'CHL -CL-AN -CL-TA -CL-AP -CL-AR -CL-AI -CL-MA';
const ARG_FRONTIER = 'AR-Q AR-R AR-U AR-Z AR-V AR-L'; // Patagonia + La Pampa (Conquest of the Desert, 1878–85)
const ARG_CHACO = 'AR-H AR-P';
const RUPERTS_LAND = 'CA-MB CA-SK CA-AB CA-NT CA-NU CA-YT';

const OTT = ['ottoman'];

/** @type {{ id: string, name: string, kind: string, periods: object[], colorOf?: string, timelineItemIds?: string[] }[]} */
export const NATION_ENTITIES_1815 = [
  // =========================================================================
  // Western and northern Europe
  // =========================================================================
  state('uk', 'United Kingdom', [p(1815, END, `${UK_ISLES} IRL`, { name: 'United Kingdom of Great Britain and Ireland' })], { timelineItemIds: BRIT }),
  state('france', 'France', [
    p(1815, 1860, `FRA ${neg(FR_OVS)} ${neg(SAVOY_NICE)}`, { name: 'Kingdom of France', note: 'Bourbon Restoration; July Monarchy from 1830, Second Republic 1848, Second Empire 1852. Savoy and Nice were Sardinian until 1860.' }),
    p(1860, 1871, `FRA ${neg(FR_OVS)}`, { name: 'Second French Empire', note: 'Savoy and Nice annexed in 1860.' }),
    p(1871, END, `FRA ${neg(FR_OVS)} ${neg(AL)}`, { note: 'Third Republic; Alsace–Lorraine lost to Germany in 1871.' }),
  ], { timelineItemIds: FREN }),
  state('french-guiana', 'French Guiana', [colony('portugal', 1815, 1817, 'FR-GF', 'French Guiana (Portuguese-occupied)'), colony('france', 1817, END, 'FR-GF', 'French Guiana (France)', { note: 'Returned by Portugal in 1817.' })], { timelineItemIds: FREN }),
  state('french-overseas', 'French overseas territories', steps(END, [
    [1815, 'FR-RE FR-GP FR-MQ', { kind: 'colony', owner: 'france', name: 'French overseas territories' }],
    [1841, 'FR-YT', { note: 'Mayotte 1841.' }],
    [1842, 'PYF', { note: 'Tahiti a protectorate from 1842.' }],
    [1853, 'NCL', { note: 'New Caledonia 1853.' }],
    [1893, '= FR-RE FR-GP FR-MQ FR-YT NCL PYF ATF'],
  ]), { timelineItemIds: FREN }),
  state('netherlands', 'Netherlands', [
    p(1815, 1830, 'NLD -NL-BQ1 -NL-BQ2 -NL-BQ3 BEL -BE-WLX', { name: 'United Kingdom of the Netherlands', note: 'Included today’s Belgium until the 1830 revolution.' }),
    p(1830, END, 'NLD -NL-BQ1 -NL-BQ2 -NL-BQ3'),
  ]),
  state('belgium', 'Belgium', [
    p(1830, 1839, 'BEL -BE-WLX', { note: 'Independent from 1830 (recognised by the Netherlands in 1839).' }),
    p(1839, END, 'BEL', { note: 'Western Luxembourg joined in 1839.' }),
  ]),
  state('luxembourg', 'Luxembourg', [
    p(1815, 1839, 'LUX BE-WLX', { name: 'Grand Duchy of Luxembourg', note: 'Ruled by the Dutch king as grand duke until 1890.' }),
    p(1839, END, 'LUX', { note: 'The western half went to Belgium in 1839.' }),
  ]),
  state('switzerland', 'Switzerland', [p(1815, END, 'CHE')]),
  state('liechtenstein', 'Liechtenstein', [p(1815, END, 'LIE')]),
  state('andorra', 'Andorra', [p(1815, END, 'AND')]),
  state('monaco', 'Monaco', [p(1815, END, 'MCO')]),
  state('spain', 'Spain', [p(1815, END, 'ESP')], { timelineItemIds: SPAN }),
  state('portugal', 'Portugal', [p(1815, END, 'PRT')], { timelineItemIds: PORT }),
  state('denmark', 'Denmark', [
    p(1815, 1864, 'DNK FRO DE-SH', { name: 'Denmark (with Schleswig and Holstein)', note: 'The duchies of Schleswig and Holstein were ruled by the Danish king until the 1864 war.' }),
    p(1864, END, 'DNK FRO'),
  ]),
  state('schleswig-holstein', 'Schleswig-Holstein', [disputed(1864, 1866, 'DE-SH', 'Schleswig-Holstein (Austro-Prussian condominium)')]),
  state('norway', 'Norway', [
    p(1815, 1905, 'NOR', { name: 'Norway (in union with Sweden)', note: 'Own constitution and parliament, Swedish king, 1814–1905.' }),
    p(1905, END, 'NOR', { note: 'Union with Sweden dissolved in 1905.' }),
  ]),
  state('sweden', 'Sweden', [p(1815, END, 'SWE')]),
  state('iceland', 'Iceland', [colony('denmark', 1815, END, 'ISL', 'Iceland (Danish)')]),
  state('greenland', 'Greenland', [colony('denmark', 1815, END, 'GRL', 'Greenland (Danish realm)', { note: 'Danish trading posts on the coast; the whole island was claimed later.' })]),
  state('malta', 'Malta', [colony('uk', 1815, END, 'MLT', 'Malta (British)')], { timelineItemIds: BRIT }),
  state('ionian-islands', 'Ionian Islands', [colony('uk', 1815, 1864, 'GR-F', 'United States of the Ionian Islands (British protectorate)')], { timelineItemIds: BRIT }),

  // =========================================================================
  // Germany: from the German Confederation (1815) to the German Empire (1871)
  // =========================================================================
  state('prussia', 'Prussia', [
    p(1815, 1866, PRUSSIA_1815, { name: 'Kingdom of Prussia', note: 'The leading north German state of the German Confederation (1815–66).' }),
    p(1866, 1867, `${PRUSSIA_1815} DE-NI DE-HE DE-SH`, { name: 'Kingdom of Prussia', note: 'Annexed Hanover, Hesse-Kassel, Nassau, Frankfurt and Schleswig-Holstein after the 1866 war with Austria.' }),
  ], { colorOf: 'germany' }),
  state('germany', 'Germany', [
    p(1867, 1871, `DEU -DE-BY -DE-BW ${PL_W45} ${PL_POSEN} PL-SL ${KGD} LT-KL`, { name: 'North German Confederation', note: 'Prussia-led federal state of the states north of the Main.' }),
    p(1871, END, GERMANY_1914, { name: 'German Empire', note: 'Proclaimed at Versailles, 18 January 1871: Bavaria, Württemberg and Baden joined, Alsace–Lorraine annexed.' }),
  ]),
  state('bavaria', 'Bavaria', [p(1815, 1871, 'DE-BY', { name: 'Kingdom of Bavaria', note: 'The Bavarian Palatinate on the Rhine is not split out of today’s Rhineland-Palatinate.' })]),
  state('wurttemberg-baden', 'Württemberg and Baden', [
    p(1815, 1871, 'DE-BW', { name: 'Württemberg and Baden', note: 'Two states — the Kingdom of Württemberg (east) and the Grand Duchy of Baden (west) — drawn as one because today’s Baden-Württemberg is the smallest unit available.' }),
  ]),
  state('saxony', 'Saxony', [p(1815, 1867, 'DE-SN', { name: 'Kingdom of Saxony' })]),
  state('hanover', 'Hanover', [p(1815, 1866, 'DE-NI', { name: 'Kingdom of Hanover', note: 'Includes the smaller Oldenburg and Brunswick, which share today’s Lower Saxony.' })]),
  state('hessian-states', 'Hessian states', [p(1815, 1866, 'DE-HE', { name: 'Hessian states (Hesse-Kassel, Hesse-Darmstadt, Nassau, Frankfurt)' })]),
  state('thuringian-states', 'Thuringian states', [p(1815, 1867, 'DE-TH', { name: 'Thuringian states (Saxe-Weimar and other duchies)' })]),
  state('mecklenburg', 'Mecklenburg', [p(1815, 1867, 'DE-MV', { name: 'Mecklenburg', note: 'Western Pomerania (Prussian from 1815) shares today’s Mecklenburg-Vorpommern and is not split out.' })]),
  state('hanseatic-cities', 'Hamburg and Bremen', [p(1815, 1867, 'DE-HB DE-HH', { name: 'Free cities of Hamburg and Bremen' })]),

  // =========================================================================
  // Austria and Italy
  // =========================================================================
  state('austria-hungary', 'Austria-Hungary', [
    p(1815, 1859, `${AT_CORE} ${LOMBARDY} ${VENETIA}`, { name: 'Austrian Empire', note: 'Including the Kingdom of Lombardy–Venetia.' }),
    p(1859, 1866, `${AT_CORE} ${VENETIA}`, { name: 'Austrian Empire', note: 'Lombardy lost to Sardinia in 1859.' }),
    p(1866, 1867, AT_CORE, { name: 'Austrian Empire', note: 'Venetia lost to Italy in 1866.' }),
    p(1867, 1878, AT_CORE, { note: 'Dual monarchy from the 1867 Compromise.' }),
    p(1878, END, AT_1914, { note: 'Bosnia and Herzegovina occupied from 1878 (still nominally Ottoman), annexed in 1908.' }),
  ], { timelineItemIds: ['austro-hungarian'] }),
  state('italy', 'Italy', [
    p(1815, 1859, `${IT_SARDINIA} ${SAVOY_NICE}`, { name: 'Kingdom of Sardinia (Piedmont-Sardinia)' }),
    p(1859, 1860, `${IT_SARDINIA} ${SAVOY_NICE} ${LOMBARDY}`, { name: 'Kingdom of Sardinia (Piedmont-Sardinia)', note: 'Lombardy won from Austria in 1859.' }),
    p(1860, 1866, `${IT_SARDINIA} ${LOMBARDY} ${PARMA} ${MODENA} ${LUCCA} ${TUSCANY} ${PAPAL_REST} ${TWO_SICILIES}`, { name: 'Kingdom of Italy', note: 'Central Italy, Naples and Sicily joined in 1860 (Garibaldi’s expedition); Savoy and Nice went to France; the Kingdom of Italy was proclaimed in March 1861.' }),
    p(1866, 1870, `ITA ${neg(TYROL_S)} ${neg(JULIAN)} ${neg(PAPAL_LAZIO)}`, { name: 'Kingdom of Italy', note: 'Venetia joined in 1866.' }),
    p(1870, END, `ITA ${neg(TYROL_S)} ${neg(JULIAN)}`, { name: 'Kingdom of Italy', note: 'Rome taken in 1870.' }),
  ]),
  state('papal-states', 'Papal States', [
    p(1815, 1860, `${PAPAL_LAZIO} ${PAPAL_REST}`),
    p(1860, 1870, PAPAL_LAZIO, { note: 'Reduced to Rome and Lazio in 1860; taken by Italy in 1870.' }),
  ]),
  state('two-sicilies', 'Two Sicilies', [p(1815, 1860, TWO_SICILIES, { name: 'Kingdom of the Two Sicilies' })]),
  state('tuscany', 'Tuscany', [p(1815, 1847, TUSCANY, { name: 'Grand Duchy of Tuscany' }), p(1847, 1860, `${TUSCANY} ${LUCCA}`, { name: 'Grand Duchy of Tuscany', note: 'Lucca joined in 1847.' })]),
  state('lucca', 'Lucca', [p(1815, 1847, LUCCA, { name: 'Duchy of Lucca' })]),
  state('parma', 'Parma', [p(1815, 1860, PARMA, { name: 'Duchy of Parma' })]),
  state('modena', 'Modena', [p(1815, 1860, MODENA, { name: 'Duchy of Modena' })]),
  state('san-marino', 'San Marino', [p(1815, END, 'SMR')]),

  // =========================================================================
  // Russia and Central Asia
  // =========================================================================
  state('russia', 'Russia', steps(END, [
    [1815, `${RU_CORE} -RU-AMU -RU-YEV -RU-PRI -RU-TY -RU-SAK ${neg(CIRCASSIA)} ${UA_RUSSIAN} BLR LTU -LT-KL LVA EST FIN ALD ${PL_CONGRESS} MDA GEO -GE-AJ -GE-SJ AZE ${neg(NAKH)} ${KZ_NORTH} US-AK`,
      { name: 'Russian Empire', note: 'With Congress Poland and the Grand Duchy of Finland (both in personal union) and Russian America (Alaska).' }],
    [1824, KZ_JUNIOR_MIDDLE, { note: 'Rule of the Kazakh Middle and Junior jüz khans abolished, 1822–24.' }],
    [1828, `ARM ${NAKH}`, { note: 'Erivan and Nakhchivan taken from Persia (Treaty of Turkmenchay).' }],
    [1829, 'GE-SJ', { note: 'Akhaltsikhe taken from the Ottomans.' }],
    [1834, neg(N_CAUCASUS_IMAMATE), { note: 'Dagestan and Chechnya held by Imam Shamil’s state.' }],
    [1847, 'KZ-ALA', { note: 'The Kazakh Senior jüz under Russian rule.' }],
    [1853, 'KZ-KZY KAB', { note: 'Ak-Mechet on the Syr Darya taken from Kokand.' }],
    [1858, RU_FAR_EAST_1858, { note: 'Amur region from Qing China (Treaty of Aigun).' }],
    [1859, N_CAUCASUS_IMAMATE, { note: 'Shamil surrendered in 1859.' }],
    [1860, RU_FAR_EAST_1860, { note: 'Primorye and Vladivostok from Qing China (Convention of Peking).' }],
    [1864, CIRCASSIA, { note: 'Circassia conquered; most Circassians expelled.' }],
    [1865, KOKAND_1865_LOSS, { note: 'Tashkent taken, 1865.' }],
    [1866, 'TJ-SU UZ-JI UZ-SI'],
    [1867, '-US-AK', { note: 'Alaska sold to the United States, 1867.' }],
    [1868, 'UZ-SA', { note: 'Samarkand taken; Bukhara a Russian protectorate.' }],
    [1873, 'UZ-QR', { note: 'Khiva a Russian protectorate; the Amu Darya right bank annexed.' }],
    [1875, 'RU-SAK', { note: 'All of Sakhalin, in exchange for the Kurils (Treaty of St Petersburg).' }],
    [1876, FERGANA, { note: 'Khanate of Kokand annexed as Fergana oblast.' }],
    [1878, `${KARS} GE-AJ`, { note: 'Kars and Batumi taken from the Ottomans.' }],
    [1881, 'TM-A TM-B', { note: 'Turkmen Ahal conquered (Geok Tepe, 1881).' }],
    [1884, 'TM-M', { note: 'Merv annexed, 1884.' }],
    [1895, 'TJ-GB', { note: 'The Pamirs divided with Afghanistan and Britain, 1895.' }],
  ]), { timelineItemIds: ['russian-empire'] }),
  state('sakhalin', 'Sakhalin', [disputed(1855, 1875, 'RU-SAK', 'Sakhalin (Russo-Japanese joint possession)', { note: 'Shared under the Treaty of Shimoda (1855) until Russia took the whole island in 1875.' })]),
  state('caucasian-imamate', 'Caucasian Imamate', [p(1834, 1859, N_CAUCASUS_IMAMATE, { name: 'Caucasian Imamate (Imam Shamil)' })]),
  state('kazakh-khanate', 'Kazakh jüzes', [
    p(1815, 1824, `${KZ_JUNIOR_MIDDLE} KZ-ALA`, { name: 'Kazakh Khanate (the three jüz)', note: 'Nomadic hordes already partly under Russian suzerainty.' }),
    p(1824, 1847, 'KZ-ALA', { name: 'Kazakh Senior jüz' }),
  ]),
  state('kokand', 'Kokand', steps(1876, [
    [1815, KOKAND_1815, { name: 'Khanate of Kokand' }],
    [1853, '-KZ-KZY -KAB'],
    [1865, neg(KOKAND_1865_LOSS)],
    [1866, '-TJ-SU -UZ-SI'],
  ])),
  state('bukhara', 'Bukhara', [
    p(1815, 1866, `${BUKHARA} UZ-SA UZ-JI`, { name: 'Emirate of Bukhara' }),
    p(1866, 1868, `${BUKHARA} UZ-SA`, { name: 'Emirate of Bukhara' }),
    colony('russia', 1868, 1917, BUKHARA, 'Emirate of Bukhara (Russian protectorate)'),
    p(1917, 1920, BUKHARA, { name: 'Emirate of Bukhara', note: 'Taken by the Red Army in 1920.' }),
  ]),
  state('khiva', 'Khiva', [
    p(1815, 1873, `${KHIVA} UZ-QR`, { name: 'Khanate of Khiva' }),
    colony('russia', 1873, 1917, KHIVA, 'Khanate of Khiva (Russian protectorate)'),
    p(1917, 1920, KHIVA, { name: 'Khanate of Khiva', note: 'Taken by the Red Army in 1920.' }),
  ]),

  // =========================================================================
  // The Balkans and the Ottoman Empire
  // =========================================================================
  state('ottoman-empire', 'Ottoman Empire', steps(END, [
    [1815, `TUR SYR LBN ISR PSX JOR IRQ ${HEJAZ} GE-AJ GE-SJ ${CYPRUS} LBY GRC -GR-F BGR ALB MKD KOS BIH ${RS_SOUTH} ${SANDZAK} ${ME_1878} ${ME_SANDZAK} ${RO_DOBRUJA_N}`,
      { note: 'Hejaz under Egyptian administration 1811–40; Syria held by Egypt 1831–40.' }],
    [1829, '-GE-SJ'],
    [1830, neg(GREECE_1830), { note: 'Southern Greece independent, 1830.' }],
    [1871, `SA-04 ${ASIR} QAT`, { note: 'Al-Hasa, Asir and Qatar occupied, 1871.' }],
    [1872, YE_NORTH, { note: 'Sana’a taken, 1872.' }],
    [1878, `-BIH ${neg(RS_SOUTH)} ${neg(ME_1878)} ${neg(RO_DOBRUJA_N)} -GE-AJ ${neg(KARS)} ${neg(CYPRUS)} -BGR ${BG_RHODOPE_PIRIN}`,
      { note: 'Congress of Berlin, 1878: Serbia, Montenegro and Romania independent, Bulgaria autonomous, Bosnia occupied by Austria-Hungary, Cyprus to British administration.' }],
    [1881, '-GR-E', { note: 'Thessaly ceded to Greece, 1881.' }],
    [1898, '-GR-M', { note: 'Crete autonomous, 1898.' }],
    [1912, '-LBY', { note: 'Libya lost to Italy, 1912.' }],
    [1913, `= ${OTTOMAN_1914}`, { note: 'Balkan Wars, 1912–13: almost all of Ottoman Europe lost; al-Hasa taken by Ibn Saud.' }],
  ]), { timelineItemIds: OTT }),
  state('greece', 'Greece', [
    p(1830, 1864, GREECE_1830, { name: 'Kingdom of Greece', note: 'Independence war from 1821; recognised in 1830.' }),
    p(1864, 1881, `${GREECE_1830} GR-F`, { name: 'Kingdom of Greece', note: 'The Ionian Islands joined in 1864.' }),
    p(1881, 1913, `${GREECE_1830} GR-F GR-E`, { name: 'Kingdom of Greece', note: 'Thessaly joined in 1881.' }),
    p(1913, END, 'GRC', { note: 'Balkan Wars: Epirus, Macedonia, Crete and the Aegean islands, 1913.' }),
  ]),
  state('crete', 'Crete', [p(1898, 1913, 'GR-M', { name: 'Cretan State (autonomous)', note: 'Under nominal Ottoman suzerainty; joined Greece in 1913.' })]),
  state('serbia', 'Serbia', [
    vassal('ottoman-empire', 1815, 1878, SERBIA_1815, 'Principality of Serbia (autonomous, under Ottoman suzerainty)'),
    p(1878, 1913, `SRB ${neg(VOJVODINA)} -${SANDZAK}`, { name: 'Serbia (independent 1878; kingdom from 1882)', note: 'Niš, Pirot and Vranje gained at the Congress of Berlin.' }),
    p(1913, END, `SRB ${neg(VOJVODINA)} KOS MKD`, { name: 'Kingdom of Serbia', note: 'Kosovo, Vardar Macedonia and part of the Sandžak gained in the Balkan Wars.' }),
  ], { colorOf: 'yugoslavia' }),
  state('montenegro', 'Montenegro', [
    p(1815, 1878, MONTENEGRO_1815, { name: 'Prince-Bishopric / Principality of Montenegro' }),
    p(1878, 1913, `MNE ${neg(KOTOR)} ${neg(ME_SANDZAK)}`, { name: 'Principality of Montenegro', note: 'Recognised as independent and enlarged in 1878 (Ulcinj 1880); kingdom from 1910.' }),
    p(1913, END, `MNE ${neg(KOTOR)}`, { name: 'Kingdom of Montenegro' }),
  ]),
  state('romania', 'Romania', [
    vassal('ottoman-empire', 1815, 1859, DANUBIAN, 'Danubian Principalities (Wallachia and Moldavia, Ottoman vassals)'),
    vassal('ottoman-empire', 1859, 1878, DANUBIAN, 'United Principalities of Romania (autonomous)', { note: 'Wallachia and Moldavia united in 1859–62; named Romania from 1866.' }),
    p(1878, 1913, `ROU ${neg(TRANSYLVANIA)} -RO-SV`, { name: 'Kingdom of Romania', note: 'Independent from 1878 (with northern Dobruja); kingdom from 1881.' }),
    p(1913, END, `ROU ${neg(TRANSYLVANIA)} -RO-SV ${DOBRUJA_S}`, { name: 'Kingdom of Romania' }),
  ]),
  state('bulgaria', 'Bulgaria', [
    vassal('ottoman-empire', 1878, 1885, BULGARIA_1878, 'Principality of Bulgaria (autonomous, under Ottoman suzerainty)'),
    vassal('ottoman-empire', 1885, 1908, `BGR ${neg(BG_RHODOPE_PIRIN)}`, 'Principality of Bulgaria (autonomous, under Ottoman suzerainty)', { note: 'Eastern Rumelia united with Bulgaria in 1885.' }),
    p(1908, 1913, `BGR ${neg(BG_RHODOPE_PIRIN)}`, { name: 'Tsardom of Bulgaria', note: 'Independence declared in 1908.' }),
    p(1913, END, `BGR ${neg(DOBRUJA_S)}`, { note: 'Pirin Macedonia and the Rhodopes gained, southern Dobruja lost (1913).' }),
  ]),
  state('eastern-rumelia', 'Eastern Rumelia', [vassal('ottoman-empire', 1878, 1885, E_RUMELIA, 'Eastern Rumelia (autonomous Ottoman province)')]),
  state('albania', 'Albania', [p(1913, END, 'ALB', { note: 'Independence declared in November 1912; recognised in 1913.' })]),
  state('cyprus', 'Cyprus', [colony('uk', 1878, END, CYPRUS, 'Cyprus (British)', { note: 'British-administered from 1878 under Ottoman sovereignty; annexed in 1914.' })], { timelineItemIds: BRIT }),

  // =========================================================================
  // Middle East and North Africa
  // =========================================================================
  state('iran', 'Iran', [
    p(1815, 1828, `IRN ARM ${NAKH}`, { name: 'Persia', note: 'Qajar dynasty; Erivan and Nakhchivan lost to Russia in 1828.' }),
    p(1828, END, 'IRN', { name: 'Persia' }),
  ]),
  state('afghanistan', 'Afghanistan', [
    p(1815, 1819, `AFG PK-KP ${KASHMIR}`, { name: 'Durrani Afghanistan', note: 'Kashmir lost to the Sikhs in 1819.' }),
    p(1819, 1834, 'AFG PK-KP', { name: 'Afghanistan (Emirate of Kabul)', note: 'Peshawar lost to the Sikhs in 1834.' }),
    p(1834, END, 'AFG', { note: 'Herat and the northern khanates were only loosely held until the 1850s–60s; British control of foreign affairs 1879–1919.' }),
  ]),
  state('saudi-arabia', 'Saudi Arabia', [
    p(1815, 1818, `${NEJD} ${SHAMMAR}`, { name: 'Emirate of Diriyah (First Saudi State)', note: 'Destroyed by Egyptian–Ottoman forces in 1818.' }),
    p(1824, 1871, NEJD, { name: 'Emirate of Nejd (Second Saudi State)' }),
    p(1871, 1891, 'SA-01 SA-05', { name: 'Emirate of Nejd (Second Saudi State)', note: 'Al-Hasa occupied by the Ottomans in 1871.' }),
    p(1902, 1913, 'SA-01 SA-05', { name: 'Emirate of Riyadh', note: 'Ibn Saud retook Riyadh in 1902.' }),
    p(1913, END, NEJD, { name: 'Emirate of Nejd and Hasa' }),
  ]),
  state('jabal-shammar', 'Jabal Shammar', [
    p(1836, 1891, SHAMMAR, { name: 'Emirate of Jabal Shammar' }),
    p(1891, 1902, `${SHAMMAR} SA-01 SA-05`, { name: 'Emirate of Jabal Shammar', note: 'The Rashidis held Riyadh 1891–1902.' }),
    p(1902, END, SHAMMAR, { name: 'Emirate of Jabal Shammar' }),
  ]),
  state('yemen', 'Yemen', [p(1815, 1872, YE_NORTH, { name: 'Zaydi Imamate of Yemen', note: 'Taken by the Ottomans 1849–72.' })]),
  state('south-yemen', 'South Yemen', [
    colony('uk', 1839, 1886, 'YE-AD', 'Aden (British)'),
    colony('uk', 1886, END, YE_SOUTH, 'Aden and the Aden Protectorate (British)'),
  ], { timelineItemIds: BRIT }),
  state('oman', 'Oman', [
    p(1815, 1856, `OMN ${ZANZIBAR}`, { name: 'Omani Empire (Muscat, Oman and Zanzibar)' }),
    p(1856, END, 'OMN', { name: 'Muscat and Oman', note: 'Zanzibar became a separate sultanate in 1856.' }),
  ]),
  state('uae', 'United Arab Emirates', [colony('uk', 1853, END, 'ARE', 'Trucial States (British)', { note: 'Perpetual Maritime Truce, 1853; protectorate treaty 1892.' })], { timelineItemIds: BRIT }),
  state('bahrain', 'Bahrain', [p(1815, 1861, 'BHR', { name: 'Bahrain (Al Khalifa)' }), colony('uk', 1861, END, 'BHR', 'Bahrain (British protectorate)')], { timelineItemIds: BRIT }),
  state('kuwait', 'Kuwait', [p(1815, 1899, 'KWT', { name: 'Sheikhdom of Kuwait', note: 'Nominal Ottoman suzerainty from 1871.' }), colony('uk', 1899, END, 'KWT', 'Kuwait (British protectorate)')], { timelineItemIds: BRIT }),
  state('egypt', 'Egypt', [
    vassal('ottoman-empire', 1815, 1882, 'EGY', 'Egypt (Muhammad Ali’s dynasty, under Ottoman suzerainty)', { note: 'Khedivate from 1867.' }),
    colony('uk', 1882, END, 'EGY', 'Khedivate of Egypt (British-occupied)', { note: 'British occupation from 1882; nominally Ottoman until 1914.' }),
  ], { timelineItemIds: BRIT }),
  state('libya', 'Libya', [colony('italy', 1912, END, 'LBY', 'Italian Libya', { note: 'Taken from the Ottomans in the 1911–12 war.' })]),
  state('tunisia', 'Tunisia', [
    vassal('ottoman-empire', 1815, 1881, 'TUN', 'Beylik of Tunis (autonomous, under Ottoman suzerainty)'),
    colony('france', 1881, END, 'TUN', 'Tunisia (French protectorate)'),
  ], { timelineItemIds: FREN }),
  state('algeria', 'Algeria', [
    vassal('ottoman-empire', 1815, 1830, 'DZA^N34', 'Regency of Algiers (autonomous, under Ottoman suzerainty)'),
    colony('france', 1830, 1848, 'DZA^N34', 'Algeria (French)', { note: 'Conquest from 1830; Abd el-Kader resisted until 1847.' }),
    colony('france', 1848, 1882, 'DZA^N32', 'Algeria (French)', { note: 'Kabylia conquered in 1857; Saharan oases later.' }),
    colony('france', 1882, 1900, 'DZA^N30', 'Algeria (French)', { note: 'The M’zab annexed in 1882.' }),
    colony('france', 1900, END, 'DZA', 'Algeria (French)', { note: 'The deep Sahara (Touat, Hoggar) taken 1900–02.' }),
  ], { timelineItemIds: FREN }),
  state('morocco', 'Morocco', [
    p(1815, 1912, 'MAR -MA-15 -MA-16', { name: 'Sultanate of Morocco' }),
    colony('france', 1912, END, `MAR -MA-15 -MA-16 ${neg(SP_MOROCCO)}`, 'Morocco (French protectorate)'),
  ], { timelineItemIds: FREN }),
  state('spanish-morocco', 'Spanish Morocco', [colony('spain', 1912, END, SP_MOROCCO, 'Spanish protectorate in Morocco')], { timelineItemIds: SPAN }),
  state('western-sahara', 'Western Sahara', [colony('spain', 1884, END, WSAHARA, 'Spanish Sahara', { note: 'Coastal claim from 1884; the interior was occupied only in the 1930s.' })], { timelineItemIds: SPAN }),

  // =========================================================================
  // Sub-Saharan Africa — independent states, then the Scramble (claims drawn from
  // the treaty year; effective control of the interior often came much later)
  // =========================================================================
  state('sudan', 'Sudan', [
    colony('ottoman-empire', 1821, 1874, 'SDN', 'Turco-Egyptian Sudan', { note: 'Conquered by Muhammad Ali’s Egypt from 1820–21.' }),
    colony('ottoman-empire', 1874, 1885, 'SDN SDS', 'Turco-Egyptian Sudan', { note: 'Darfur and Equatoria added in the 1870s.' }),
    p(1885, 1899, 'SDN', { name: 'Mahdist State', note: 'Khartoum fell to the Mahdi in January 1885; defeated at Omdurman in 1898.' }),
    colony('uk', 1899, END, 'SDN SDS', 'Anglo-Egyptian Sudan'),
  ], { timelineItemIds: BRIT }),
  state('ethiopia', 'Ethiopia', steps(END, [
    [1815, 'ET-AM ET-TI ERI', { name: 'Ethiopian Empire', note: 'The “Era of the Princes”: the emperor’s rule was nominal until Tewodros II (1855).' }],
    [1882, 'ET-OR ET-AA', { note: 'Shewa and the Oromo south-west, under Menelik.' }],
    [1889, 'ET-HA ET-DD ET-SN ET-AF', { note: 'Harar taken in 1887; Menelik II emperor from 1889.' }],
    [1890, '-ERI', { note: 'Eritrea Italian from 1890 (Adwa, 1896, kept Ethiopia independent).' }],
    [1900, '= ETH', { note: 'The Ogaden and the far south conquered in the 1890s.' }],
  ]), { timelineItemIds: ['ethiopian-empire'] }),
  state('eritrea', 'Eritrea', [colony('italy', 1890, END, 'ERI', 'Italian Eritrea', { note: 'Massawa occupied in 1885; colony proclaimed in 1890.' })]),
  state('djibouti', 'Djibouti', [colony('france', 1884, END, 'DJI', 'French Somaliland', { note: 'Obock bought in 1862; protectorate extended 1884–88.' })], { timelineItemIds: FREN }),
  state('somalia', 'Somalia', [colony('italy', 1889, END, 'SOM', 'Italian Somaliland', { note: 'Coastal protectorates from 1889; the interior was held only in the 1920s.' })]),
  state('british-somaliland', 'British Somaliland', [colony('uk', 1887, END, 'SOL', 'British Somaliland', { note: 'The Dervish state of Sayyid Mohammed held much of the interior, 1899–1920.' })], { timelineItemIds: BRIT }),
  state('kenya', 'Kenya', [colony('uk', 1888, END, 'KEN', 'Kenya (British East Africa)', { note: 'Imperial British East Africa Company from 1888; protectorate 1895. The coastal strip stayed nominally Zanzibar’s.' })], { timelineItemIds: BRIT }),
  state('uganda', 'Uganda', [
    p(1815, 1894, BUGANDA, { name: 'Kingdom of Buganda', note: 'Only Buganda is drawn (as today’s Central Region); Bunyoro, Toro and Ankole were neighbouring kingdoms.' }),
    colony('uk', 1894, END, 'UGA', 'Uganda Protectorate (British)'),
  ], { timelineItemIds: BRIT }),
  state('tanzania', 'Tanzania', [colony('germany', 1885, END, `TZA ${neg(ZANZIBAR)}`, 'German East Africa', { note: 'Claimed from 1885; the coast bought from Zanzibar in 1890; Maji Maji rising 1905–07.' })]),
  state('zanzibar', 'Zanzibar', [
    p(1856, 1890, ZANZIBAR, { name: 'Sultanate of Zanzibar', note: 'Separated from Oman in 1856; also held the mainland coast.' }),
    colony('uk', 1890, END, ZANZIBAR, 'Zanzibar Protectorate (British)'),
  ], { timelineItemIds: BRIT }),
  state('rwanda', 'Rwanda', [p(1815, 1890, 'RWA', { name: 'Kingdom of Rwanda' }), colony('germany', 1890, END, 'RWA', 'German East Africa (Ruanda)')]),
  state('burundi', 'Burundi', [p(1815, 1890, 'BDI', { name: 'Kingdom of Burundi' }), colony('germany', 1890, END, 'BDI', 'German East Africa (Urundi)')]),
  state('kongo', 'Kingdom of Kongo', [p(1815, 1885, KONGO, { name: 'Kingdom of Kongo', note: 'Much weakened; shown at its core around Mbanza Kongo (São Salvador).' })], { timelineItemIds: ['kongo'] }),
  state('dr-congo', 'DR Congo', [
    colony('belgium', 1885, 1908, 'COD', 'Congo Free State (King Leopold II)', { note: 'The king’s personal colony, notorious for forced rubber labour.' }),
    colony('belgium', 1908, END, 'COD', 'Belgian Congo'),
  ]),
  state('congo', 'Republic of the Congo', [
    colony('france', 1885, 1910, 'COG', 'French Congo', { note: 'Brazza’s treaties from 1880.' }),
    colony('france', 1910, END, 'COG', 'Middle Congo (French Equatorial Africa)'),
  ], { timelineItemIds: FREN }),
  state('gabon', 'Gabon', [
    colony('france', 1843, 1885, 'GA-1', 'Gabon estuary (French)'),
    colony('france', 1885, END, 'GAB', 'Gabon (French Equatorial Africa)'),
  ], { timelineItemIds: FREN }),
  state('car', 'Central African Republic', [colony('france', 1894, END, 'CAF', 'Ubangi-Shari (French Equatorial Africa)')], { timelineItemIds: FREN }),
  state('chad', 'Chad', [colony('france', 1900, END, 'TCD', 'Chad (French Equatorial Africa)', { note: 'Rabih az-Zubayr defeated at Kousséri, 1900; the north was taken later.' })], { timelineItemIds: FREN }),
  state('cameroon', 'Cameroon', [colony('germany', 1884, END, 'CMR', 'Kamerun (German)')]),
  state('sokoto', 'Sokoto Caliphate', [p(1815, 1903, SOKOTO, { name: 'Sokoto Caliphate', note: 'Founded in the 1804–08 jihad of Usman dan Fodio; conquered by the British in 1903.' })]),
  state('bornu', 'Bornu', [p(1815, 1902, BORNU, { name: 'Bornu Empire' })]),
  state('nigeria', 'Nigeria', [
    colony('uk', 1861, 1885, 'NG-LA', 'Lagos Colony (British)'),
    colony('uk', 1885, 1900, NIGER_COAST, 'Lagos and the Niger Coast (British)', { note: 'Oil Rivers / Niger Coast Protectorate, with the Royal Niger Company inland.' }),
    colony('uk', 1900, 1903, 'NGA^S9', 'Southern Nigeria (British)'),
    colony('uk', 1903, END, 'NGA', 'Northern and Southern Nigeria (British)', { note: 'Amalgamated as Nigeria in January 1914.' }),
  ], { timelineItemIds: BRIT }),
  state('togo', 'Togo', [colony('germany', 1884, END, 'TGO', 'Togoland (German)')]),
  state('dahomey', 'Dahomey', [p(1815, 1894, DAHOMEY, { name: 'Kingdom of Dahomey', note: 'Conquered by France 1892–94.' })]),
  state('benin', 'Benin', [
    colony('france', 1882, 1894, 'BJ-OU', 'Porto-Novo (French protectorate)'),
    colony('france', 1894, END, 'BEN', 'Dahomey (French West Africa)'),
  ], { timelineItemIds: FREN }),
  state('ashanti', 'Ashanti', [p(1815, 1901, ASHANTI, { name: 'Ashanti Empire', note: 'Kumasi burned in 1874; annexed by Britain in 1901.' })]),
  state('ghana', 'Ghana', [
    colony('uk', 1821, 1874, 'GH-CP', 'Gold Coast forts (British)', { note: 'Danish forts bought in 1850 and Dutch ones in 1872 are not split out.' }),
    colony('uk', 1874, 1901, 'GH-CP GH-WP GH-AA GH-EP', 'Gold Coast Colony (British)'),
    colony('uk', 1901, END, 'GHA', 'Gold Coast (British)', { note: 'Ashanti and the Northern Territories added in 1901.' }),
  ], { timelineItemIds: BRIT }),
  state('cote-divoire', "Côte d'Ivoire", [colony('france', 1893, END, 'CIV', "Côte d'Ivoire (French West Africa)", { note: 'Colony from 1893; Samori Ture’s state held the north until 1898.' })], { timelineItemIds: FREN }),
  state('burkina-faso', 'Burkina Faso', [colony('france', 1896, END, 'BFA', 'Upper Volta (French West Africa)', { note: 'Ouagadougou (Mossi) taken in 1896; part of Upper Senegal–Niger until 1919.' })], { timelineItemIds: FREN }),
  state('segou', 'Ségou', [p(1815, 1861, SEGOU, { name: 'Bambara Empire of Ségou' })]),
  state('massina', 'Massina', [p(1818, 1862, 'ML-5', { name: 'Massina Empire (Hamdullahi)' })]),
  state('toucouleur', 'Toucouleur Empire', [
    p(1861, 1862, `${SEGOU} ML-1`, { name: 'Toucouleur Empire (Umar Tall)' }),
    p(1862, 1890, `${SEGOU} ML-1 ML-5`, { name: 'Toucouleur Empire', note: 'Massina conquered in 1862; Ségou taken by France in 1890.' }),
  ]),
  state('mali', 'Mali', [colony('france', 1890, END, 'MLI', 'French Sudan (French West Africa)', { note: 'Timbuktu taken in 1894; the far north later.' })], { timelineItemIds: FREN }),
  state('niger', 'Niger', [colony('france', 1900, END, 'NER', 'Niger (French West Africa)')], { timelineItemIds: FREN }),
  state('senegal', 'Senegal', [
    colony('france', 1817, 1855, 'SN-SL SN-DK', 'Senegal (French)', { note: 'Saint-Louis and Gorée, returned by Britain in 1817.' }),
    colony('france', 1855, 1895, 'SEN', 'Senegal (French)', { note: 'Expanded inland under Faidherbe from 1854; conquest completed in the 1880s.' }),
    colony('france', 1895, END, 'SEN', 'Senegal (French West Africa)'),
  ], { timelineItemIds: FREN }),
  state('mauritania', 'Mauritania', [colony('france', 1903, END, 'MRT', 'Mauritania (French West Africa)')], { timelineItemIds: FREN }),
  state('guinea', 'Guinea', [colony('france', 1891, END, 'GIN', 'French Guinea (French West Africa)', { note: 'Samori Ture resisted in the interior until 1898.' })], { timelineItemIds: FREN }),
  state('gambia', 'Gambia', [colony('uk', 1816, END, 'GMB', 'Gambia (British)', { note: 'Bathurst founded in 1816; protectorate up the river from 1894.' })], { timelineItemIds: BRIT }),
  state('sierra-leone', 'Sierra Leone', [
    colony('uk', 1815, 1896, 'SL-W', 'Sierra Leone Colony (British)', { note: 'The Freetown peninsula.' }),
    colony('uk', 1896, END, 'SLE', 'Sierra Leone (British)', { note: 'Protectorate over the hinterland, 1896.' }),
  ], { timelineItemIds: BRIT }),
  state('liberia', 'Liberia', [p(1847, END, 'LBR', { note: 'Settled by freed African Americans from 1822; independent in 1847.' })]),
  state('guinea-bissau', 'Guinea-Bissau', [colony('portugal', 1879, END, 'GNB', 'Portuguese Guinea', { note: 'Separated from Cape Verde in 1879; interior held only after 1915.' })], { timelineItemIds: PORT }),
  state('cape-verde', 'Cape Verde', [colony('portugal', 1815, END, 'CPV', 'Cape Verde (Portuguese)')], { timelineItemIds: PORT }),
  state('equatorial-guinea', 'Equatorial Guinea', [
    colony('spain', 1843, 1900, 'GQ-BN GQ-BS', 'Fernando Póo (Spanish)'),
    colony('spain', 1900, END, 'GNQ', 'Spanish Guinea', { note: 'Río Muni on the mainland from the 1900 Treaty of Paris.' }),
  ], { timelineItemIds: SPAN }),
  state('sao-tome', 'São Tomé and Príncipe', [colony('portugal', 1815, END, 'STP', 'São Tomé and Príncipe (Portuguese)')], { timelineItemIds: PORT }),
  state('angola', 'Angola', [
    colony('portugal', 1815, 1885, ANGOLA_1815, 'Portuguese Angola', { note: 'Luanda, Benguela and their hinterland only.' }),
    colony('portugal', 1885, END, 'AGO', 'Portuguese Angola', { note: 'Claimed in full after the Berlin Conference; the south and east were conquered only by the 1910s–20s.' }),
  ], { timelineItemIds: PORT }),
  state('namibia', 'Namibia', [colony('germany', 1884, END, 'NAM', 'German South West Africa', { note: 'Herero and Nama genocide, 1904–08. British Walvis Bay is not split out.' })]),
  state('south-africa', 'South Africa', steps(END, [
    [1815, 'ZA-WC ZA-EC', { kind: 'colony', owner: 'uk', name: 'Cape Colony (British)', note: 'Eastern frontier moved east in stages (the Xhosa wars); drawn by today’s Eastern Cape.' }],
    [1847, 'ZA-NC', { note: 'Northern frontier pushed to the Orange River, 1847.' }],
    [1910, '= ZAF', { kind: 'dominion', owner: 'uk', name: 'Union of South Africa (British dominion)', note: 'Cape, Natal, Transvaal and the Orange River Colony united in 1910.' }],
  ]), { timelineItemIds: BRIT }),
  state('zulu', 'Zulu Kingdom', [p(1816, 1843, 'ZA-NL', { name: 'Zulu Kingdom', note: 'Built by Shaka from 1816.' })], { timelineItemIds: ['zulu'] }),
  state('natal', 'Natal', [colony('uk', 1843, 1910, 'ZA-NL', 'Natal (British)', { note: 'Zululand (north of the Tugela) was the Zulu Kingdom until 1879 and joined Natal in 1897; today’s KwaZulu-Natal cannot be split, so it is drawn with Natal.' })], { colorOf: 'south-africa', timelineItemIds: BRIT }),
  state('orange-free-state', 'Orange Free State', [
    colony('uk', 1848, 1854, 'ZA-FS', 'Orange River Sovereignty (British)'),
    p(1854, 1902, 'ZA-FS', { name: 'Orange Free State', note: 'Boer republic; annexed in the Second Boer War (1899–1902).' }),
    colony('uk', 1902, 1910, 'ZA-FS', 'Orange River Colony (British)'),
  ]),
  state('transvaal', 'Transvaal', [
    p(1852, 1877, TRANSVAAL, { name: 'South African Republic (Transvaal)', note: 'Boer republic recognised by Britain in 1852.' }),
    colony('uk', 1877, 1881, TRANSVAAL, 'Transvaal (British)', { note: 'Annexed 1877; independence regained in the First Boer War.' }),
    p(1881, 1902, TRANSVAAL, { name: 'South African Republic (Transvaal)', note: 'Gold found on the Witwatersrand in 1886.' }),
    colony('uk', 1902, 1910, TRANSVAAL, 'Transvaal Colony (British)'),
  ]),
  state('lesotho', 'Lesotho', [
    p(1822, 1868, 'LSO', { name: 'Basotho Kingdom (Moshoeshoe I)' }),
    colony('uk', 1868, END, 'LSO', 'Basutoland (British)'),
  ], { timelineItemIds: BRIT }),
  state('eswatini', 'Eswatini', [
    p(1815, 1894, 'SWZ', { name: 'Kingdom of Swaziland' }),
    colony('transvaal', 1894, 1900, 'SWZ', 'Swaziland (Transvaal protectorate)'),
    colony('uk', 1900, END, 'SWZ', 'Swaziland (British)', { note: 'British administration from 1900 (formally 1903–06).' }),
  ], { timelineItemIds: BRIT }),
  state('botswana', 'Botswana', [colony('uk', 1885, END, 'BWA', 'Bechuanaland Protectorate (British)')], { timelineItemIds: BRIT }),
  state('zimbabwe', 'Zimbabwe', [colony('uk', 1890, END, 'ZWE', 'Southern Rhodesia (British)', { note: 'British South Africa Company rule from 1890; Ndebele kingdom conquered 1893.' })], { timelineItemIds: BRIT }),
  state('zambia', 'Zambia', [colony('uk', 1891, END, 'ZMB', 'Northern Rhodesia (British)', { note: 'British South Africa Company; named Northern Rhodesia from 1911.' })], { timelineItemIds: BRIT }),
  state('malawi', 'Malawi', [colony('uk', 1891, END, 'MWI', 'Nyasaland (British)', { note: 'British Central Africa Protectorate until 1907.' })], { timelineItemIds: BRIT }),
  state('mozambique', 'Mozambique', [
    colony('portugal', 1815, 1891, MOZ_1815, 'Portuguese Mozambique', { note: 'Coastal towns and the Zambezi prazos; drawn by today’s provinces.' }),
    colony('portugal', 1891, 1895, `MOZ ${neg(GAZA)}`, 'Portuguese Mozambique', { note: 'Borders fixed with Britain in 1891.' }),
    colony('portugal', 1895, END, 'MOZ', 'Portuguese Mozambique', { note: 'The Gaza Empire conquered in 1895.' }),
  ], { timelineItemIds: PORT }),
  state('gaza-empire', 'Gaza Empire', [p(1828, 1895, GAZA, { name: 'Gaza Empire (Nguni)' })]),
  state('madagascar', 'Madagascar', [
    p(1817, 1896, 'MDG', { name: 'Kingdom of Madagascar (Merina)', note: 'Recognised by Britain in 1817; the Merina never controlled the whole island.' }),
    colony('france', 1896, END, 'MDG', 'Madagascar (French)'),
  ], { timelineItemIds: FREN }),
  state('comoros', 'Comoros', [colony('france', 1886, END, 'COM', 'Comoros (French)')], { timelineItemIds: FREN }),
  state('mauritius', 'Mauritius', [colony('uk', 1815, END, 'MUS', 'Mauritius (British)')], { timelineItemIds: BRIT }),
  state('qatar', 'Qatar', [colony('uk', 1913, END, 'QAT', 'Qatar (British protectorate)', { note: 'Ottoman claim renounced in 1913; British treaty in 1916.' })], { timelineItemIds: BRIT }),

  // =========================================================================
  // East Asia
  // =========================================================================
  state('china', 'China', steps(END, [
    [1815, 'CHN TWN MNG HKG RU-AMU RU-YEV RU-PRI RU-TY', { name: 'Qing China', note: 'Tibet and Mongolia under Qing overlordship; Outer Manchuria north of the Amur still Qing.' }],
    [1842, '-HKG', { note: 'Hong Kong ceded to Britain after the First Opium War (Kowloon 1860, New Territories leased 1898).' }],
    [1858, neg(RU_FAR_EAST_1858), { note: 'Land north of the Amur ceded to Russia (Aigun, 1858).' }],
    [1860, neg(RU_FAR_EAST_1860), { note: 'Primorye ceded to Russia (Peking, 1860). The Taiping war (1850–64) is not drawn.' }],
    [1865, '-CN-XJ', { note: 'Xinjiang lost to Yaqub Beg’s Yettishar, 1865–77.' }],
    [1877, 'CN-XJ', { note: 'Xinjiang reconquered, 1877 (a province from 1884).' }],
    [1895, '-TWN', { note: 'Taiwan ceded to Japan (Shimonoseki, 1895).' }],
    [1911, '-MNG -RU-TY', { note: 'Outer Mongolia declared independence in December 1911.' }],
    [1912, `= CHN ${neg(TIBET)}`, { name: 'Republic of China', note: 'The Qing emperor abdicated in February 1912; Tibet expelled Qing troops.' }],
  ]), { timelineItemIds: ['qing-dynasty'] }),
  state('yettishar', 'Yettishar', [p(1865, 1877, 'CN-XJ', { name: 'Yettishar (Kashgaria, Yaqub Beg)', note: 'The Ili valley was Russian-occupied 1871–81 (not drawn).' })]),
  state('mongolia', 'Mongolia', [p(1911, END, 'MNG', { name: 'Bogd Khanate of Mongolia' })]),
  state('tibet', 'Tibet', [p(1912, END, TIBET, { name: 'Tibet (de facto independent)' })]),
  state('hong-kong', 'Hong Kong', [colony('uk', 1842, END, 'HKG', 'Hong Kong (British)')], { timelineItemIds: BRIT }),
  state('macau', 'Macau', [colony('portugal', 1815, END, 'MAC', 'Macau (Portuguese)')], { timelineItemIds: PORT }),
  state('taiwan', 'Taiwan', [colony('japan', 1895, END, 'TWN', 'Taiwan (Japanese)')], { timelineItemIds: JAPN }),
  state('japan', 'Japan', [
    p(1815, 1868, 'JPN -JP-47 -JP-01', { name: 'Tokugawa Japan', note: 'Ezo (Hokkaido) only partly held via the Matsumae domain.' }),
    p(1868, 1869, 'JPN -JP-47 -JP-01', { name: 'Empire of Japan', note: 'Meiji Restoration, 1868.' }),
    p(1869, 1879, 'JPN -JP-47', { name: 'Empire of Japan', note: 'Hokkaido colonised from 1869.' }),
    p(1879, END, 'JPN', { name: 'Empire of Japan', note: 'Ryukyu annexed as Okinawa, 1879. Southern Sakhalin (1905) cannot be split from Russian Sakhalin.' }),
  ], { timelineItemIds: ['tokugawa', 'meiji-japan'] }),
  state('ryukyu', 'Ryukyu Islands', [p(1815, 1879, 'JP-47', { name: 'Ryukyu Kingdom', note: 'Tributary to both Qing China and the Satsuma domain.' })]),
  state('korea', 'Korea', [
    p(1815, 1897, 'KOR PRK', { name: 'Joseon Korea' }),
    p(1897, 1905, 'KOR PRK', { name: 'Korean Empire' }),
    colony('japan', 1905, 1910, 'KOR PRK', 'Korea (Japanese protectorate)', { note: 'Protectorate treaty, November 1905.' }),
    colony('japan', 1910, END, 'KOR PRK', 'Korea (Japanese)', { note: 'Annexed by Japan, August 1910.' }),
  ], { timelineItemIds: ['joseon', 'meiji-japan'] }),

  // =========================================================================
  // South Asia — Company rule to the Raj (princely states drawn with British India)
  // =========================================================================
  state('british-raj', 'British India', steps(END, [
    [1815, `BGD IN-WB IN-BR IN-JH IN-OR IN-UP IN-DL IN-HR IN-TN IN-AP IN-TG IN-KL IN-KA IN-GJ IN-LD ${neg(GOA)} ${neg(PONDY)}`,
      { kind: 'colony', owner: 'uk', name: 'Company rule in India (British East India Company)', note: 'Includes the princely states under British protection (Hyderabad, Mysore, Baroda …).' }],
    [1816, 'IN-UT', { note: 'Kumaon and Garhwal from Nepal (Treaty of Sugauli, 1816).' }],
    [1818, 'IN-MH IN-MP IN-CT IN-RJ', { note: 'Third Anglo-Maratha War: the Peshwa deposed; the Rajput states became protected states.' }],
    [1826, 'IN-AS IN-MN IN-ML IN-TR MM-16 MM-05', { note: 'Assam, Arakan and Tenasserim from Burma (Treaty of Yandabo, 1826).' }],
    [1843, 'PK-SD', { note: 'Sindh conquered, 1843.' }],
    [1846, `IN-HP ${KASHMIR_STATE}`, { note: 'First Anglo-Sikh War: the hill country annexed; Jammu and Kashmir sold to Gulab Singh as a princely state.' }],
    [1849, 'PK-PB PK-IS IN-PB PK-KP', { note: 'The Punjab annexed after the Second Anglo-Sikh War.' }],
    [1852, LOWER_BURMA, { note: 'Lower Burma annexed, 1852.' }],
    [1858, 'IN-AN', { name: 'British India (the Raj)', note: 'After the 1857 rebellion the Crown took over from the Company (1858).' }],
    [1861, 'IN-SK', { note: 'Sikkim a British protectorate (1861; formally 1890).' }],
    [1876, 'PK-BA', { note: 'Kalat (Baluchistan) under British paramountcy, 1876.' }],
    [1886, UPPER_BURMA, { note: 'Upper Burma annexed, 1 January 1886.' }],
    [1890, `= ${RAJ_1914}`, { note: 'The north-east hills and the North-West Frontier tribal areas drawn in full from 1890.' }],
  ]), { timelineItemIds: ['british-raj', 'british-empire'] }),
  state('maratha', 'Maratha Confederacy', [p(1815, 1818, 'IN-MH IN-MP IN-CT', { name: 'Maratha Confederacy', note: 'The Peshwa at Pune with the Scindia, Holkar and Bhonsle states.' })], { timelineItemIds: ['maratha'] }),
  state('sikh-empire', 'Sikh Empire', steps(1849, [
    [1815, 'PK-PB PK-IS IN-PB IN-HP', { name: 'Sikh Empire (Ranjit Singh)', note: 'The cis-Sutlej states (British-protected from 1809) share today’s Indian Punjab and are not split out.' }],
    [1819, KASHMIR, { note: 'Kashmir taken from the Afghans, 1819.' }],
    [1834, 'PK-KP', { note: 'Peshawar taken, 1834.' }],
    [1842, 'IN-LA PK-GB', { note: 'Ladakh and Baltistan conquered by the Dogras of Jammu.' }],
    [1846, `-IN-HP ${neg(KASHMIR)} -IN-LA -PK-GB`, { note: 'Reduced after the First Anglo-Sikh War; annexed in 1849.' }],
  ]), { timelineItemIds: ['sikh-empire'] }),
  state('sindh', 'Sindh', [p(1815, 1843, 'PK-SD', { name: 'Talpur Amirs of Sindh' })]),
  state('kalat', 'Kalat', [p(1815, 1876, 'PK-BA', { name: 'Khanate of Kalat (Baluchistan)' })]),
  state('nepal', 'Nepal', [p(1815, 1816, 'NPL IN-UT', { name: 'Kingdom of Nepal (Gorkha)' }), p(1816, END, 'NPL')]),
  state('bhutan', 'Bhutan', [p(1815, END, 'BTN')]),
  state('sikkim', 'Sikkim', [p(1815, 1861, 'IN-SK', { name: 'Kingdom of Sikkim' })]),
  state('myanmar', 'Myanmar', [
    p(1815, 1826, 'MMR', { name: 'Konbaung Burma', note: 'Also occupied Manipur and Assam 1817–24 (not drawn).' }),
    p(1826, 1852, 'MMR -MM-16 -MM-05', { name: 'Konbaung Burma' }),
    p(1852, 1886, `MMR -MM-16 -MM-05 ${neg(LOWER_BURMA)}`, { name: 'Konbaung Burma (Upper Burma)' }),
  ]),
  state('sri-lanka', 'Sri Lanka', [colony('uk', 1815, END, 'LKA', 'Ceylon (British)', { note: 'The Kingdom of Kandy taken in 1815.' })], { timelineItemIds: BRIT }),
  state('maldives', 'Maldives', [p(1815, 1887, 'MDV', { name: 'Sultanate of the Maldives' }), colony('uk', 1887, END, 'MDV', 'Maldives (British protectorate)')], { timelineItemIds: BRIT }),
  state('portuguese-india', 'Portuguese India', [colony('portugal', 1815, END, GOA, 'Portuguese India (Goa, Daman and Diu)')], { timelineItemIds: PORT }),
  state('french-india', 'French India', [colony('france', 1816, END, PONDY, 'French India (Pondichéry)', { note: 'Returned by Britain in 1816.' })], { timelineItemIds: FREN }),

  // =========================================================================
  // Southeast Asia
  // =========================================================================
  state('thailand', 'Thailand', [
    p(1815, 1893, `THA LAO ${KH_WEST} ${MY_SIAM}`, { name: 'Siam', note: 'With the Lao kingdoms, western Cambodia and the northern Malay sultanates as tributaries.' }),
    p(1893, 1904, `THA ${LAO_RIGHT_BANK} ${KH_WEST} ${MY_SIAM}`, { name: 'Siam', note: 'Laos east of the Mekong ceded to France, 1893.' }),
    p(1904, 1907, `THA ${KH_WEST} ${MY_SIAM}`, { name: 'Siam' }),
    p(1907, 1909, `THA ${MY_SIAM}`, { name: 'Siam', note: 'Battambang and Siem Reap ceded to France, 1907.' }),
    p(1909, END, 'THA', { name: 'Siam', note: 'Kedah, Perlis, Kelantan and Terengganu transferred to Britain, 1909.' }),
  ]),
  state('cambodia', 'Cambodia', [p(1815, 1863, `KHM ${neg(KH_WEST)}`, { name: 'Kingdom of Cambodia', note: 'Under joint Siamese and Vietnamese overlordship.' })]),
  state('vietnam', 'Vietnam', [
    p(1815, 1862, 'VNM', { name: 'Nguyễn Vietnam (Đại Nam)' }),
    p(1862, 1883, NOT_COCHINCHINA, { name: 'Nguyễn Vietnam (Đại Nam)', note: 'Cochinchina lost to France in 1862–67.' }),
  ]),
  state('french-indochina', 'French Indochina', steps(END, [
    [1862, COCHINCHINA, { kind: 'colony', owner: 'france', name: 'French Cochinchina' }],
    [1863, `KHM ${neg(KH_WEST)}`, { name: 'French Cochinchina and Cambodia', note: 'Cambodia a French protectorate, 1863.' }],
    [1883, `= VNM KHM ${neg(KH_WEST)}`, { name: 'French Indochina', note: 'Annam and Tonkin protectorates, 1883; the Union of Indochina formed in 1887.' }],
    [1893, `LAO ${neg(LAO_RIGHT_BANK)}`, { note: 'Laos east of the Mekong, 1893.' }],
    [1904, LAO_RIGHT_BANK],
    [1907, '= VNM LAO KHM', { note: 'Battambang and Siem Reap, 1907.' }],
  ]), { timelineItemIds: FREN }),
  state('malaysia', 'Malaysia', steps(END, [
    [1815, 'MY-07', { kind: 'colony', owner: 'uk', name: 'British Malaya', note: 'Penang (1786); the Straits Settlements from 1826.' }],
    [1819, 'SGP', { note: 'Singapore founded, 1819.' }],
    [1824, 'MY-04', { note: 'Malacca from the Dutch (Anglo-Dutch Treaty, 1824).' }],
    [1874, 'MY-08 MY-10 MY-05 MY-14 MY-16', { note: 'Residents in Perak, Selangor and Sungai Ujong from 1874 (Federated Malay States, 1895).' }],
    [1888, 'MY-06', { note: 'Pahang, 1888.' }],
    [1909, MY_SIAM, { note: 'The northern sultanates from Siam, 1909. Johor took a British adviser in 1914.' }],
  ]), { timelineItemIds: BRIT }),
  state('johor', 'Johor', [p(1815, END, 'MY-01', { name: 'Sultanate of Johor' })]),
  state('brunei', 'Brunei', [
    p(1815, 1841, 'BRN MY-13 MY-12', { name: 'Sultanate of Brunei', note: 'Claims over Sarawak and Sabah (the latter shared with Sulu).' }),
    p(1841, 1881, 'BRN MY-12', { name: 'Sultanate of Brunei' }),
    p(1881, 1888, 'BRN', { name: 'Sultanate of Brunei' }),
    colony('uk', 1888, END, 'BRN', 'Brunei (British protectorate)'),
  ], { timelineItemIds: BRIT }),
  state('sarawak', 'Sarawak', [p(1841, 1888, 'MY-13', { name: 'Raj of Sarawak (Brooke)', note: 'Began as the Kuching district in 1841 and grew to today’s borders by 1905.' })]),
  state('british-borneo', 'British Borneo', [
    colony('uk', 1846, 1881, 'MY-15', 'Labuan (British)'),
    colony('uk', 1881, 1888, 'MY-15 MY-12', 'North Borneo and Labuan (British)'),
    colony('uk', 1888, END, MY_BORNEO, 'North Borneo and Sarawak (British)'),
  ], { timelineItemIds: BRIT }),
  state('indonesia', 'Indonesia', steps(END, [
    [1816, `${JAVA} ID-MA`, { kind: 'colony', owner: 'netherlands', name: 'Dutch East Indies', note: 'Returned by Britain in 1816; Java and the Moluccas.' }],
    [1830, `= IDN -ID-AC -ID-BA -ID-NB -ID-PA -ID-PB`, { note: 'After the Java War (1825–30); most outer islands were only claimed, not governed, until the 1900s.' }],
    [1894, 'ID-NB', { note: 'Lombok, 1894.' }],
    [1898, 'ID-PA ID-PB', { note: 'Posts in western New Guinea from 1898.' }],
    [1904, 'ID-AC', { note: 'Aceh subdued, 1903–04.' }],
    [1908, '= IDN', { note: 'Bali conquered, 1906–08.' }],
  ])),
  state('aceh', 'Aceh', [p(1815, 1904, 'ID-AC', { name: 'Sultanate of Aceh', note: 'Aceh War from 1873.' })]),
  state('bali', 'Bali', [
    p(1815, 1894, 'ID-BA ID-NB', { name: 'Balinese kingdoms (with Lombok)' }),
    p(1894, 1908, 'ID-BA', { name: 'Balinese kingdoms' }),
  ]),
  state('east-timor', 'Timor-Leste', [colony('portugal', 1815, END, 'TLS', 'Portuguese Timor')], { timelineItemIds: PORT }),
  state('philippines', 'Philippines', [
    colony('spain', 1815, 1899, 'PHL', 'Spanish Philippines', { note: 'Muslim Mindanao and Sulu largely outside Spanish control. Revolution 1896–98.' }),
    colony('usa', 1899, END, 'PHL', 'Philippines (US)', { note: 'Ceded by Spain (Treaty of Paris, 1898); Philippine–American War 1899–1902.' }),
  ]),

  // =========================================================================
  // Oceania
  // =========================================================================
  state('australia', 'Australia', [
    colony('uk', 1815, 1829, `AUS -AU-WA`, 'Australian colonies (British)', { note: 'New South Wales claimed everything east of 135°E; Aboriginal lands were not ceded.' }),
    colony('uk', 1829, 1901, 'AUS', 'Australian colonies (British)', { note: 'Western Australia claimed in 1829.' }),
    dominion(1901, END, 'AUS', 'Commonwealth of Australia (British dominion)', { note: 'Federated 1 January 1901.' }),
  ], { timelineItemIds: BRIT }),
  state('new-zealand', 'New Zealand', [
    colony('uk', 1840, 1907, 'NZL', 'New Zealand (British)', { note: 'Treaty of Waitangi, 1840; the New Zealand Wars 1845–72.' }),
    dominion(1907, END, 'NZL', 'Dominion of New Zealand (British dominion)'),
  ], { timelineItemIds: BRIT }),
  state('papua-new-guinea', 'Papua New Guinea', [
    colony('uk', 1884, 1906, PAPUA, 'British New Guinea'),
    colony('australia', 1906, END, PAPUA, 'Territory of Papua (Australian)'),
  ]),
  state('german-new-guinea', 'German New Guinea', [colony('germany', 1884, END, `PNG ${neg(PAPUA)}`, 'German New Guinea')]),
  state('fiji', 'Fiji', [p(1871, 1874, 'FJI', { name: 'Kingdom of Fiji' }), colony('uk', 1874, END, 'FJI', 'Fiji (British)')], { timelineItemIds: BRIT }),
  state('tonga', 'Tonga', [p(1845, 1900, 'TON', { name: 'Kingdom of Tonga' }), colony('uk', 1900, END, 'TON', 'Tonga (British protected state)')], { timelineItemIds: BRIT }),
  state('samoa', 'Samoa', [colony('germany', 1900, END, 'WSM', 'German Samoa')]),
  state('solomon-islands', 'Solomon Islands', [colony('uk', 1893, END, 'SLB', 'Solomon Islands (British)')], { timelineItemIds: BRIT }),
  state('vanuatu', 'Vanuatu', [colony('uk', 1906, END, 'VUT', 'New Hebrides (Anglo-French condominium)')], { timelineItemIds: BRIT }),
  state('hawaii', 'Hawaii', [
    p(1815, 1893, 'US-HI', { name: 'Kingdom of Hawaii' }),
    p(1893, 1898, 'US-HI', { name: 'Republic of Hawaii', note: 'The monarchy was overthrown in 1893; annexed by the US in 1898.' }),
  ]),

  // =========================================================================
  // The Americas — independence and westward expansion
  // =========================================================================
  state('usa', 'United States', steps(END, [
    [1815, `USA ${neg(US_1815_MISSING)}`, { note: 'Includes the Louisiana Purchase (1803), most of it still held by Native American nations.' }],
    [1821, 'US-FL', { note: 'Florida bought from Spain (Adams–Onís Treaty, 1819; in force 1821).' }],
    [1845, 'US-TX', { note: 'Texas annexed, 1845.' }],
    [1846, OREGON, { note: 'Oregon Treaty with Britain, 1846.' }],
    [1848, MEX_CESSION, { note: 'Mexican Cession after the Mexican–American War (1848); Gadsden Purchase 1853 not split out.' }],
    [1867, 'US-AK', { note: 'Alaska bought from Russia, 1867.' }],
    [1898, '= USA', { note: 'Hawaii annexed, 1898.' }],
  ])),
  state('spanish-florida', 'Spanish Florida', [colony('spain', 1815, 1821, 'US-FL', 'Spanish Florida')], { timelineItemIds: SPAN }),
  state('oregon-country', 'Oregon Country', [disputed(1815, 1846, OREGON, 'Oregon Country (British–US joint occupation)')]),
  state('texas', 'Texas', [p(1836, 1845, 'US-TX', { name: 'Republic of Texas' })]),
  state('mexico', 'Mexico', [
    colony('spain', 1815, 1821, `MEX US-TX ${MEX_CESSION}`, 'New Spain (Spanish)', { note: 'War of independence 1810–21; the far north was held by Comanche, Apache and other nations.' }),
    p(1821, 1836, `MEX US-TX ${MEX_CESSION}`, { name: 'Mexico (empire 1821–23, then republic)' }),
    p(1836, 1848, `MEX ${MEX_CESSION}`, { note: 'Texas broke away in 1836.' }),
    p(1848, END, 'MEX', { note: 'Northern half lost to the US in 1848. French intervention 1862–67 not drawn.' }),
  ]),
  state('central-america', 'Central America', [
    colony('spain', 1815, 1821, CENTRAL_AMERICA, 'Captaincy General of Guatemala (Spanish)'),
    p(1821, 1840, CENTRAL_AMERICA, { name: 'Federal Republic of Central America', note: 'Briefly part of the Mexican Empire 1821–23; the federation broke up 1838–40.' }),
  ], { colorOf: 'guatemala' }),
  state('guatemala', 'Guatemala', [p(1840, END, 'GTM')]),
  state('honduras', 'Honduras', [p(1840, END, 'HND')]),
  state('el-salvador', 'El Salvador', [p(1840, END, 'SLV')]),
  state('nicaragua', 'Nicaragua', [p(1840, END, 'NIC', { note: 'The British Mosquito Coast protectorate (to 1860) is not split out.' })]),
  state('costa-rica', 'Costa Rica', [p(1840, END, 'CRI')]),
  state('belize', 'Belize', [colony('uk', 1815, END, 'BLZ', 'British Honduras', { note: 'A settlement, formally a colony from 1862.' })], { timelineItemIds: BRIT }),
  state('panama', 'Panama', [p(1903, END, 'PAN', { note: 'Separated from Colombia with US backing, 1903.' })]),
  state('cuba', 'Cuba', [
    colony('spain', 1815, 1898, 'CUB USG', 'Spanish Cuba', { note: 'Ten Years’ War 1868–78; independence war from 1895.' }),
    colony('usa', 1898, 1902, 'CUB USG', 'Cuba (US occupation)'),
    p(1902, END, 'CUB USG'),
  ]),
  state('puerto-rico', 'Puerto Rico', [colony('spain', 1815, 1898, 'PRI', 'Puerto Rico (Spanish)'), colony('usa', 1898, END, 'PRI', 'Puerto Rico (US)')]),
  state('haiti', 'Haiti', [
    p(1815, 1822, 'HTI', { name: 'Haiti (northern kingdom and southern republic)' }),
    p(1822, 1844, 'HTI DOM', { name: 'Republic of Haiti (whole island)' }),
    p(1844, END, 'HTI'),
  ]),
  state('dominican-republic', 'Dominican Republic', [
    colony('spain', 1815, 1822, 'DOM', 'Santo Domingo (Spanish)'),
    p(1844, 1861, 'DOM', { note: 'Independent from Haiti, 1844.' }),
    colony('spain', 1861, 1865, 'DOM', 'Santo Domingo (Spanish, re-annexed)'),
    p(1865, END, 'DOM'),
  ]),
  state('jamaica', 'Jamaica', [colony('uk', 1815, END, 'JAM', 'Jamaica (British)')], { timelineItemIds: BRIT }),
  state('trinidad', 'Trinidad and Tobago', [colony('uk', 1815, END, 'TTO', 'Trinidad and Tobago (British)')], { timelineItemIds: BRIT }),
  state('bahamas', 'Bahamas', [colony('uk', 1815, END, 'BHS', 'Bahamas (British)')], { timelineItemIds: BRIT }),
  state('canada', 'Canada', steps(END, [
    [1815, 'CA-ON CA-QC CA-NS CA-NB', { kind: 'colony', owner: 'uk', name: 'British North America (British)', note: 'Upper and Lower Canada (united 1841), Nova Scotia and New Brunswick.' }],
    [1867, '', { kind: 'dominion', owner: 'uk', name: 'Dominion of Canada (British dominion)', note: 'Confederation, 1 July 1867.' }],
    [1870, RUPERTS_LAND, { note: 'Rupert’s Land and the North-Western Territory bought from the Hudson’s Bay Company, 1870.' }],
    [1871, 'CA-BC', { note: 'British Columbia joined, 1871.' }],
    [1873, `= CAN ${neg(NFLD)}`, { note: 'Prince Edward Island joined, 1873.' }],
  ]), { timelineItemIds: BRIT }),
  state('ruperts-land', "Rupert's Land", [colony('uk', 1815, 1870, RUPERTS_LAND, 'Rupert’s Land (Hudson’s Bay Company)', { note: 'A trading-company monopoly over First Nations lands.' })], { colorOf: 'canada', timelineItemIds: BRIT }),
  state('british-columbia', 'British Columbia', [colony('uk', 1815, 1871, 'CA-BC', 'New Caledonia / British Columbia (British)', { note: 'Hudson’s Bay Company lands; a colony from 1858.' })], { colorOf: 'canada', timelineItemIds: BRIT }),
  state('prince-edward-island', 'Prince Edward Island', [colony('uk', 1815, 1873, 'CA-PE', 'Prince Edward Island (British)')], { colorOf: 'canada', timelineItemIds: BRIT }),
  state('newfoundland', 'Newfoundland', [
    colony('uk', 1815, 1907, NFLD, 'Newfoundland (British)'),
    dominion(1907, END, NFLD, 'Dominion of Newfoundland (British dominion)'),
  ], { timelineItemIds: BRIT }),
  state('gran-colombia', 'Gran Colombia', [
    p(1819, 1821, 'COL PAN', { name: 'Gran Colombia', note: 'Proclaimed by Bolívar at Angostura, 1819.' }),
    p(1821, 1822, 'COL PAN VEN', { name: 'Gran Colombia', note: 'Venezuela freed at Carabobo, 1821.' }),
    p(1822, 1831, 'COL PAN VEN ECU', { name: 'Gran Colombia', note: 'Quito freed at Pichincha, 1822; Venezuela and Ecuador left in 1830.' }),
  ], { colorOf: 'colombia' }),
  state('colombia', 'Colombia', [
    colony('spain', 1815, 1819, 'COL PAN', 'New Granada (Spanish)', { note: 'Reconquered by Spain in 1815–16.' }),
    p(1831, 1903, 'COL PAN', { name: 'New Granada / United States of Colombia', note: 'Named the Republic of Colombia from 1886.' }),
    p(1903, END, 'COL', { note: 'Panama separated, 1903.' }),
  ]),
  state('venezuela', 'Venezuela', [colony('spain', 1815, 1821, 'VEN', 'Venezuela (Spanish)'), p(1831, END, 'VEN')]),
  state('ecuador', 'Ecuador', [colony('spain', 1815, 1822, 'ECU', 'Quito (Spanish)'), p(1831, END, 'ECU', { note: 'Border claims in the Amazon with Peru and Colombia not drawn.' })]),
  state('guyana', 'Guyana', [colony('uk', 1815, END, 'GUY', 'British Guiana')], { timelineItemIds: BRIT }),
  state('suriname', 'Suriname', [colony('netherlands', 1815, END, 'SUR', 'Surinam (Dutch)')]),
  state('peru', 'Peru', [
    colony('spain', 1815, 1821, 'PER CL-TA CL-AP', 'Viceroyalty of Peru (Spanish)', { note: 'Royalist forces held out until Ayacucho, 1824.' }),
    p(1821, 1884, 'PER CL-TA CL-AP', { note: 'With Tarapacá and Arica until the War of the Pacific (1879–84). The Peru–Bolivian Confederation (1836–39) is not drawn.' }),
    p(1884, END, 'PER'),
  ]),
  state('bolivia', 'Bolivia', [
    colony('spain', 1815, 1825, 'BOL CL-AN BR-AC', 'Upper Peru (Spanish)'),
    p(1825, 1884, 'BOL CL-AN BR-AC', { note: 'Independent 1825, with the Pacific coast (Litoral) until 1879–84.' }),
    p(1884, 1903, 'BOL BR-AC', { note: 'Coast lost to Chile.' }),
    p(1903, END, 'BOL', { note: 'Acre ceded to Brazil, 1903.' }),
  ]),
  state('chile', 'Chile', [
    colony('spain', 1815, 1818, CHILE_1818, 'Captaincy General of Chile (Spanish)', { note: 'Spanish reconquest 1814–17.' }),
    p(1818, 1881, CHILE_1818, { note: 'Independence declared 1818. Araucanía (Mapuche) and Patagonia outside Chilean control.' }),
    p(1881, 1883, `${CHILE_1818} CL-AI CL-MA`, { note: 'Southern Patagonia by the 1881 treaty with Argentina.' }),
    p(1883, 1884, `${CHILE_1818} CL-AI CL-MA CL-AR`, { note: 'Occupation of Araucanía completed, 1883.' }),
    p(1884, END, 'CHL', { note: 'Tarapacá, Arica and Antofagasta won in the War of the Pacific (1879–84).' }),
  ]),
  state('argentina', 'Argentina', [
    p(1815, 1861, `ARG ${neg(ARG_FRONTIER)} ${neg(ARG_CHACO)}`, { name: 'United Provinces of the Río de la Plata', note: 'Independence declared 1816; a loose confederation under Rosas; Buenos Aires apart 1852–61 (not drawn).' }),
    p(1861, 1880, `ARG ${neg(ARG_FRONTIER)} ${neg(ARG_CHACO)}`, { note: 'Pampas and Patagonia still held by Mapuche and Tehuelche peoples.' }),
    p(1880, 1884, `ARG ${neg(ARG_CHACO)}`, { note: 'The “Conquest of the Desert”, 1878–85.' }),
    p(1884, END, 'ARG', { note: 'The Chaco campaigns, 1884.' }),
  ]),
  state('paraguay', 'Paraguay', [p(1815, END, 'PRY', { note: 'Lost territory to Argentina and Brazil after the Paraguayan War (1864–70), not split out.' })]),
  state('uruguay', 'Uruguay', [
    p(1815, 1817, 'URY', { name: 'Banda Oriental (Artigas)' }),
    colony('portugal', 1817, 1822, 'URY', 'Cisplatina (Portuguese)'),
    p(1828, END, 'URY', { note: 'Independent after the Cisplatine War, 1828.' }),
  ]),
  state('brazil', 'Brazil', [
    p(1815, 1822, 'BRA -BR-AC', { name: 'Kingdom of Brazil (united with Portugal)', note: 'The Portuguese court ruled from Rio de Janeiro, 1808–21.' }),
    p(1822, 1828, 'BRA -BR-AC URY', { name: 'Empire of Brazil', note: 'Independent 1822, with Cisplatina (Uruguay) until 1828.' }),
    p(1828, 1889, 'BRA -BR-AC', { name: 'Empire of Brazil', note: 'Slavery abolished 1888.' }),
    p(1889, 1903, 'BRA -BR-AC', { name: 'Republic of the United States of Brazil' }),
    p(1903, END, 'BRA', { note: 'Acre bought from Bolivia, 1903.' }),
  ]),
  state('falklands', 'Falkland Islands', [colony('uk', 1833, END, 'FLK SGS', 'Falkland Islands (British)')], { timelineItemIds: BRIT }),
];
