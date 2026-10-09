/**
 * Day 42: short, era-correct map labels from the nations table / overlay names.
 *
 * The label is always derived from the name in force at the slider year (the table already
 * carries period names: Kingdom of Prussia → German Empire → Germany, Siam → Thailand,
 * Persia → Iran, Zaire …), so the map never shows an anachronism the panel doesn't.
 * Here we only shorten: "Kingdom of Prussia" → "Prussia", "Empire of Japan" → "Japan",
 * "Gold Coast (British)" → "Gold Coast (Br.)". Adjective names ("Ottoman Empire",
 * "Russian Empire", "German Empire") are kept whole.
 */

/** Exact overrides (full table name → label). */
const OVERRIDES = {
  'United Kingdom of Great Britain and Ireland': 'United Kingdom',
  'United Kingdom of the Netherlands': 'Netherlands',
  'United Provinces of the Río de la Plata': 'Río de la Plata',
  'United States of the Ionian Islands (British protectorate)': 'Ionian Islands (Br.)',
  'Federal Republic of Central America': 'Central America',
  'Socialist Federal Republic of Yugoslavia': 'Yugoslavia',
  'FR Yugoslavia / Serbia and Montenegro': 'FR Yugoslavia',
  'Yugoslavia (breaking up)': 'Yugoslavia',
  'Democratic Republic of the Congo': 'DR Congo',
  'Republic of the Congo (Léopoldville)': 'Congo-Léopoldville',
  'Republic of the Congo': 'Congo',
  "People's Republic of China": 'China',
  'Republic of China': 'China',
  'Taiwan (Republic of China)': 'Taiwan',
  'Republic of the United States of Brazil': 'Brazil',
  'Kingdom of Brazil (united with Portugal)': 'Brazil',
  'Second French Empire': 'France',
  'Nazi Germany': 'Germany',
  'Nazi Germany (with annexed and occupied lands)': 'Germany',
  'Allied-occupied Germany': 'Germany (occupied)',
  'Company rule in India (British East India Company)': 'East India Company',
  'Spanish protectorate in Morocco': 'Spanish Morocco',
  'Yemen Arab Republic (North Yemen)': 'North Yemen',
  'Prince-Bishopric / Principality of Montenegro': 'Montenegro',
  'Mongolian People\'s Republic': 'Mongolia',
  "Tuvan People's Republic": 'Tuva',
  'Bambara Empire of Ségou': 'Ségou',
  'Emirate of Diriyah (First Saudi State)': 'Diriyah',
  'Emirate of Nejd (Second Saudi State)': 'Nejd',
  'Free cities of Hamburg and Bremen': 'Hamburg, Bremen',
  'Hessian states (Hesse-Kassel, Hesse-Darmstadt, Nassau, Frankfurt)': 'Hesse',
  'Thuringian states (Saxe-Weimar and other duchies)': 'Thuringia',
  'Danubian Principalities (Wallachia and Moldavia, Ottoman vassals)': 'Danubian Principalities',
  'Haiti (northern kingdom and southern republic)': 'Haiti',
  'Mexico (empire 1821–23, then republic)': 'Mexico',
  'New Granada / United States of Colombia': 'Colombia',
  'New Caledonia / British Columbia (British)': 'New Caledonia (Br.)',
  'British North America (British)': 'British North America',
  'Rupert’s Land (Hudson’s Bay Company)': 'Rupert’s Land (HBC)',
  'Oregon Country (British–US joint occupation)': 'Oregon Country',
  'Schleswig-Holstein (Austro-Prussian condominium)': 'Schleswig-Holstein',
  'New Hebrides (Anglo-French condominium)': 'New Hebrides',
  'Sakhalin (Russo-Japanese joint possession)': 'Sakhalin',
  'Korea (Japanese protectorate)': 'Korea (Jp.)',
  'Manchukuo (Japanese puppet state)': 'Manchukuo',
  'Slovak Republic (Axis client state)': 'Slovakia',
  'Soviet-occupied Korea': 'Korea (Soviet zone)',
  'Aden and the Aden Protectorate (British)': 'Aden (Br.)',
  'Zanzibar Protectorate (British)': 'Zanzibar (Br.)',
  'Uganda Protectorate (British)': 'Uganda (Br.)',
  'Bechuanaland Protectorate (British)': 'Bechuanaland (Br.)',
  'Saar Protectorate (French)': 'Saar (Fr.)',
  'Lagos Colony (British)': 'Lagos (Br.)',
  'Gold Coast Colony (British)': 'Gold Coast (Br.)',
  'Sierra Leone Colony (British)': 'Sierra Leone (Br.)',
  'Mandatory Iraq (British)': 'Iraq (Br.)',
  'Mandatory Palestine (British)': 'Palestine (Br.)',
  'Libya (British and French administration)': 'Libya (Br./Fr.)',
  'Northern and Southern Nigeria (British)': 'Nigeria (Br.)',
  'Lagos and the Niger Coast (British)': 'Lagos, Niger Coast (Br.)',
  'North Borneo and Labuan (British)': 'North Borneo (Br.)',
  'North Borneo and Sarawak (British)': 'North Borneo, Sarawak (Br.)',
  'US-occupied Korea': 'Korea (US zone)',
};

/** Leading titles stripped from "<Title> of (the) X". Longest first. */
const TITLES = [
  'Federal Republic', 'Democratic Republic', "People's Republic", 'Socialist Republic', 'Captaincy General',
  'Prince-Bishopric', 'Grand Duchy', 'Viceroyalty', 'Commonwealth', 'Principality', 'Protectorate',
  'Khedivate', 'Sultanate', 'Sheikhdom', 'Kingdom', 'Republic', 'Dominion', 'Emirate', 'Khanate', 'Imamate',
  'Tsardom', 'Regency', 'Territory', 'Duchy', 'Beylik', 'Empire', 'Union', 'State', 'Raj', 'Trust Territory',
];
const TITLE_RE = new RegExp(
  `^(?:[A-Z][\\w’'-]+ )?(?:${TITLES.sort((a, b) => b.length - a.length).map((t) => t.replace(/[-']/g, (c) => `\\${c}`)).join('|')}) of (?:the )?`,
);

/** Owner adjectives shortened in a colony's parenthesis. */
const OWNER_ABBR = [
  [/^British/, 'Br.'], [/^French/, 'Fr.'], [/^Spanish/, 'Sp.'], [/^Portuguese/, 'Port.'], [/^German/, 'Ger.'],
  [/^Dutch/, 'Neth.'], [/^Danish/, 'Dan.'], [/^Italian/, 'It.'], [/^Belgian/, 'Belg.'], [/^US\b/, 'US'],
  [/^Australian/, 'Aus.'], [/^New Zealand/, 'NZ'], [/^Japanese/, 'Jp.'], [/^Russian protectorate/, 'Rus.'],
  [/^Indian protectorate/, 'Ind.'], [/^Transvaal protectorate/, 'Transvaal'], [/^France$/, 'Fr.'],
];

/**
 * Short label for a nation period name.
 * @param {string} name full period name from the nations table
 * @param {string} [kind] state | colony | dominion | vassal | disputed
 */
export function shortNationLabel(name, kind = 'state') {
  const raw = String(name || '').trim();
  if (!raw) return '';
  if (Object.prototype.hasOwnProperty.call(OVERRIDES, raw)) return OVERRIDES[raw];
  let base = raw;
  let tag = '';
  const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(raw);
  if (m) {
    base = m[1];
    if (kind === 'colony' || kind === 'vassal') {
      for (const [re, abbr] of OWNER_ABBR) {
        if (re.test(m[2])) {
          tag = abbr;
          break;
        }
      }
    }
  }
  base = base.replace(TITLE_RE, '');
  // A colony whose name already names its owner ("French Cameroun", "British Malaya") needs no tag.
  if (tag && /^(British|French|Spanish|Portuguese|German|Dutch|Danish|Italian|Belgian)\b/.test(base)) tag = '';
  return tag ? `${base} (${tag})` : base;
}

/** Labels for the hand-drawn polities / peoples (pre-1815 and peoples layer): drop parentheses only. */
export function shortOverlayLabel(name) {
  return String(name || '')
    .replace(/\s*\([^()]*\)\s*$/, '')
    .trim();
}
