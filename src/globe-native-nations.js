/**
 * Day 60 — Native American nations after 1500 on the globe (Phase 4c step 6.4).
 *
 * Dated territories for nations named in the roadmap (Haudenosaunee, Cherokee, Muscogee,
 * Powhatan, Lakota, Comanche, Mapuche) plus Choctaw, Chickasaw, Seminole, Diné (Navajo) and
 * Ndee (Apache) so the Removal era and reservations read as a connected story. Shapes are
 * zones of known towns, hunting ranges and treaty lands — not surveyed cadastral lines —
 * with honest confidence levels. Unlike the Africa / Southeast Asia packs, these entities
 * keep drawing after the 1815 nations handoff (`type: 'indigenous'`) so Trail of Tears,
 * reservation reduction and Mapuche resistance remain visible beside US / Chilean borders.
 *
 * Names use each nation’s own name alongside a familiar English form where that helps
 * (Haudenosaunee / Iroquois Confederacy, Diné / Navajo). Sourced from tribal nation
 * histories, treaty records and standard references; edges stay approximate or conjectural.
 * Shapes live in the lazy globe chunk (docs/DATA.md).
 */

const A = 'simplified';
const R = (id, name, ring) => ({ id, name, ring });
const K = (year, label, regions, extra = {}) => ({ year, label, approximation: A, regions, ...extra });
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${title.replace(/ /g, '_')}` });

const CONF = {
  treaty: {
    level: 'approximate',
    reason: 'Homelands and treaty cessions are known from Indigenous oral histories, colonial journals and later US/Canadian/Chilean treaty maps; the outer edge of hunting range and tribute is a zone, drawn roughly.',
  },
  removal: {
    level: 'approximate',
    reason: 'Removal routes and Indian Territory / reservation outlines follow well-documented 19th-century treaties and acts (Indian Removal Act 1830, later allotment); the filled shape is still a simplified zone, not a cadastral survey.',
  },
  plains: {
    level: 'approximate',
    reason: 'Plains nations moved with the bison and with horse pastoralism; seasonal ranges and alliance zones are known from oral tradition and explorer accounts, but edges were never fixed lines.',
  },
  early: {
    level: 'conjectural',
    reason: 'Pre-contact and early-contact extent rests on archaeology, language spread and later colonial reports; town clusters are better known than the outer hunting hinterland.',
  },
  mapuche: {
    level: 'approximate',
    reason: 'Mapuche independence south of the Bío Bío is attested in Spanish parliaments (Quilín 1641) and Chilean records of the Occupation of Araucanía; Patagonian and Pampas reach mixed Mapuche–Tehuelche control and is drawn as a rough zone.',
  },
};

// ---- Eastern Woodlands --------------------------------------------------------------------

const HAUD_CORE = [[-79.5, 42.2], [-78.5, 43.5], [-76.0, 43.8], [-74.5, 43.2], [-74.0, 42.0], [-75.5, 41.5], [-78.0, 41.8], [-79.5, 42.2]];
const HAUD_BEAVER = [
  [-83.5, 41.5], [-82.0, 44.5], [-78.0, 45.2], [-74.0, 44.8], [-73.2, 42.5], [-73.5, 41.0],
  [-76.0, 40.5], [-80.0, 40.8], [-83.0, 41.0], [-83.5, 41.5],
];
const HAUD_1768 = [[-79.8, 42.0], [-79.0, 43.6], [-76.5, 43.9], [-75.0, 43.0], [-75.2, 41.8], [-77.5, 41.6], [-79.8, 42.0]];
const HAUD_1794 = [[-79.0, 42.3], [-78.5, 43.2], [-76.8, 43.3], [-75.8, 42.6], [-76.2, 42.0], [-78.2, 42.0], [-79.0, 42.3]];
const HAUD_ONONDAGA = [[-76.25, 42.85], [-76.05, 43.05], [-75.85, 42.95], [-75.95, 42.75], [-76.25, 42.85]];
const HAUD_SENECA = [[-79.05, 42.0], [-78.7, 42.35], [-78.4, 42.2], [-78.55, 41.9], [-79.05, 42.0]];
const HAUD_MOHAWK = [[-74.85, 42.95], [-74.55, 43.15], [-74.35, 43.0], [-74.55, 42.8], [-74.85, 42.95]];

const CHER_EARLY = [[-85.5, 34.0], [-84.0, 35.5], [-82.5, 36.2], [-81.5, 35.8], [-81.8, 34.5], [-83.0, 33.5], [-85.0, 33.2], [-85.5, 34.0]];
const CHER_1820 = [
  [-88.0, 34.0], [-86.5, 36.5], [-84.0, 36.8], [-82.0, 36.0], [-82.5, 34.2], [-84.5, 33.5],
  [-87.0, 33.5], [-88.0, 34.0],
];
const CHER_IT = [[-95.5, 35.2], [-94.5, 36.8], [-94.2, 36.5], [-94.5, 35.5], [-95.2, 35.0], [-95.5, 35.2]];
const CHER_OK = [[-95.4, 35.4], [-94.6, 36.6], [-94.4, 36.3], [-94.7, 35.6], [-95.2, 35.3], [-95.4, 35.4]];

const MUSC_EARLY = [[-87.5, 31.5], [-86.5, 34.0], [-84.5, 34.2], [-83.5, 32.5], [-84.5, 31.0], [-86.5, 30.8], [-87.5, 31.5]];
const MUSC_1820 = [[-88.5, 30.8], [-87.5, 34.2], [-85.0, 34.5], [-83.8, 32.8], [-84.5, 30.5], [-87.0, 30.2], [-88.5, 30.8]];
const MUSC_IT = [[-97.0, 34.3], [-96.5, 36.2], [-95.2, 36.2], [-95.0, 35.2], [-95.5, 34.2], [-97.0, 34.3]];
const MUSC_OK = [[-96.6, 34.7], [-95.6, 35.8], [-95.4, 35.4], [-96.0, 34.5], [-96.6, 34.7]];

const POW_PEAK = [[-77.5, 36.8], [-76.8, 38.0], [-75.8, 37.8], [-75.5, 36.5], [-76.2, 36.2], [-77.2, 36.5], [-77.5, 36.8]];
const POW_1646 = [[-77.2, 37.0], [-76.6, 37.6], [-76.2, 37.3], [-76.5, 36.8], [-77.0, 36.9], [-77.2, 37.0]];
const POW_1677 = [[-76.85, 37.25], [-76.55, 37.45], [-76.4, 37.3], [-76.55, 37.15], [-76.85, 37.25]];

const CHOC_EARLY = [[-91.5, 31.0], [-90.5, 33.5], [-88.5, 33.8], [-88.0, 32.0], [-89.0, 30.5], [-91.0, 30.5], [-91.5, 31.0]];
const CHOC_1820 = [[-91.8, 30.5], [-91.0, 34.0], [-88.2, 34.2], [-87.8, 32.0], [-88.5, 30.2], [-91.0, 30.0], [-91.8, 30.5]];
const CHOC_IT = [[-95.8, 33.5], [-94.5, 34.8], [-94.2, 34.2], [-95.0, 33.2], [-95.8, 33.5]];
const CHOC_OK = [[-95.6, 33.7], [-94.6, 34.6], [-94.4, 34.1], [-95.2, 33.4], [-95.6, 33.7]];

const CHICK_EARLY = [[-89.5, 33.5], [-88.8, 35.2], [-87.5, 35.0], [-87.2, 33.8], [-88.2, 33.2], [-89.5, 33.5]];
const CHICK_1820 = [[-90.0, 33.2], [-89.2, 35.5], [-87.2, 35.3], [-86.8, 33.5], [-88.0, 32.8], [-90.0, 33.2]];
const CHICK_IT = [[-97.2, 34.0], [-96.2, 35.2], [-95.8, 34.5], [-96.5, 33.8], [-97.2, 34.0]];
const CHICK_OK = [[-97.0, 34.2], [-96.3, 35.0], [-96.0, 34.5], [-96.6, 34.0], [-97.0, 34.2]];

const SEM_EARLY = [[-82.5, 27.5], [-82.0, 30.5], [-81.0, 30.8], [-80.5, 28.5], [-81.2, 26.5], [-82.2, 26.8], [-82.5, 27.5]];
const SEM_1820 = [[-83.0, 26.5], [-82.5, 30.8], [-81.0, 31.0], [-80.2, 28.0], [-80.8, 25.5], [-82.5, 25.8], [-83.0, 26.5]];
const SEM_IT = [[-97.0, 34.8], [-96.2, 35.8], [-95.8, 35.2], [-96.4, 34.5], [-97.0, 34.8]];
const SEM_OK = [[-96.8, 35.0], [-96.3, 35.6], [-96.0, 35.2], [-96.4, 34.7], [-96.8, 35.0]];
const SEM_FL_REM = [[-81.3, 26.0], [-81.0, 26.6], [-80.7, 26.3], [-80.9, 25.8], [-81.3, 26.0]];

// ---- Plains -------------------------------------------------------------------------------

const LAK_1700 = [[-97.5, 44.0], [-96.5, 46.5], [-94.5, 46.0], [-94.0, 44.5], [-95.5, 43.5], [-97.5, 44.0]];
const LAK_1800 = [
  [-104.0, 43.0], [-103.0, 46.5], [-100.0, 47.0], [-97.0, 45.5], [-97.5, 43.0], [-100.0, 42.0],
  [-103.0, 42.5], [-104.0, 43.0],
];
const LAK_1851 = [
  [-106.5, 42.5], [-105.5, 46.5], [-100.0, 47.5], [-96.5, 45.0], [-98.0, 42.0], [-102.0, 41.5],
  [-106.0, 42.0], [-106.5, 42.5],
];
const LAK_1868 = [
  [-104.5, 43.0], [-104.0, 46.0], [-100.0, 46.2], [-99.5, 43.5], [-102.0, 42.8], [-104.5, 43.0],
];
const LAK_PINE = [[-102.8, 43.0], [-102.2, 43.5], [-101.5, 43.2], [-101.8, 42.7], [-102.8, 43.0]];
const LAK_ROSEBUD = [[-101.3, 43.1], [-100.6, 43.5], [-100.2, 43.2], [-100.6, 42.8], [-101.3, 43.1]];
const LAK_STANDING = [[-101.8, 45.5], [-100.5, 46.0], [-100.2, 45.5], [-101.0, 45.2], [-101.8, 45.5]];

const COM_EARLY = [[-102.0, 34.0], [-101.0, 37.0], [-99.0, 36.5], [-98.5, 34.5], [-100.0, 33.5], [-102.0, 34.0]];
const COM_PEAK = [
  [-106.0, 32.5], [-105.0, 38.0], [-100.0, 38.5], [-97.0, 36.0], [-97.5, 32.0], [-100.5, 30.5],
  [-104.0, 31.0], [-106.0, 32.5],
];
const COM_1850 = [[-104.5, 33.0], [-103.5, 37.0], [-100.0, 37.0], [-98.5, 34.5], [-100.0, 32.0], [-103.0, 32.5], [-104.5, 33.0]];
const COM_RES = [[-98.9, 34.5], [-98.4, 34.9], [-98.1, 34.6], [-98.4, 34.3], [-98.9, 34.5]];

// ---- Southwest ----------------------------------------------------------------------------

const DINE_EARLY = [[-111.5, 35.5], [-110.5, 37.5], [-108.5, 37.2], [-108.0, 35.8], [-109.5, 35.0], [-111.5, 35.5]];
const DINE_WIDE = [[-112.5, 35.0], [-111.5, 37.8], [-108.0, 37.5], [-107.5, 35.5], [-109.0, 34.5], [-111.5, 34.5], [-112.5, 35.0]];
const DINE_BOSQUE = [[-104.6, 33.2], [-104.1, 33.6], [-103.8, 33.3], [-104.2, 33.0], [-104.6, 33.2]];
const DINE_RES = [
  [-111.5, 35.5], [-111.0, 37.2], [-109.0, 37.0], [-108.5, 35.8], [-109.5, 35.2], [-111.0, 35.2], [-111.5, 35.5],
];

const APACHE_EARLY = [[-110.0, 31.5], [-109.0, 34.5], [-106.5, 34.0], [-106.0, 32.0], [-107.5, 31.0], [-110.0, 31.5]];
const APACHE_WIDE = [
  [-111.5, 31.0], [-110.5, 35.0], [-107.0, 35.5], [-104.5, 33.5], [-105.0, 31.0], [-107.5, 30.5],
  [-110.0, 30.5], [-111.5, 31.0],
];
const APACHE_RES_W = [[-110.4, 33.2], [-109.8, 33.8], [-109.3, 33.4], [-109.7, 32.9], [-110.4, 33.2]];
const APACHE_RES_M = [[-105.95, 33.05], [-105.55, 33.35], [-105.35, 33.1], [-105.6, 32.85], [-105.95, 33.05]];

// ---- Southern Cone ------------------------------------------------------------------------

const MAP_CORE = [[-73.5, -40.5], [-72.5, -37.5], [-71.0, -37.0], [-70.5, -39.5], [-71.5, -41.5], [-73.0, -41.5], [-73.5, -40.5]];
const MAP_WIDE = [
  [-74.0, -41.0], [-73.0, -36.5], [-70.5, -36.0], [-69.0, -39.0], [-69.5, -42.5], [-71.5, -43.5],
  [-73.5, -42.5], [-74.0, -41.0],
];
const MAP_INDEP = [
  [-74.0, -40.5], [-73.0, -36.8], [-71.0, -36.5], [-70.0, -39.5], [-70.5, -42.0], [-72.5, -42.5],
  [-74.0, -41.5], [-74.0, -40.5],
];
const MAP_1885 = [[-73.2, -39.5], [-72.5, -37.8], [-71.5, -38.0], [-71.2, -39.5], [-72.0, -40.2], [-73.2, -39.5]];
const MAP_TODAY = [[-73.0, -39.2], [-72.4, -38.2], [-71.8, -38.4], [-71.6, -39.2], [-72.2, -39.6], [-73.0, -39.2]];

// ---- Entities -----------------------------------------------------------------------------

const haudenosaunee = {
  id: 'haudenosaunee',
  name: 'Haudenosaunee (Iroquois Confederacy)',
  color: '#7C3AED',
  type: 'indigenous',
  description:
    'The Haudenosaunee (“People of the Longhouse”) — Mohawk, Oneida, Onondaga, Cayuga, Seneca, and from 1722 the Tuscarora — formed a confederacy across what is now upstate New York. After the Beaver Wars their influence reached the Ohio country; 18th-century treaties and the American Revolution reduced them to remnant lands recognised at Canandaigua (1794). Today’s Onondaga, Seneca, Mohawk and other nations hold reservation and treaty territories in New York and Ontario.',
  keyYears: [1500, 1650, 1768, 1794, 1850, 1900],
  nameAt: [
    [1500, 'Haudenosaunee (Iroquois Confederacy)'],
    [1722, 'Haudenosaunee (Six Nations)'],
    [1794, 'Haudenosaunee nations (treaty lands)'],
    [1850, 'Haudenosaunee reservations'],
  ],
  overlays: [
    K(1500, 'Five Nations heartland', [R('haud', 'Finger Lakes & Mohawk Valley', HAUD_CORE)]),
    K(1650, 'After the Beaver Wars', [R('haud', 'Haudenosaunee sphere', HAUD_BEAVER)]),
    K(1768, 'Treaty of Fort Stanwix line', [R('haud', 'Haudenosaunee', HAUD_1768)]),
    K(1794, 'Canandaigua treaty lands', [R('haud', 'Haudenosaunee remnant', HAUD_1794)]),
    K(1850, 'Reservation communities', [
      R('onondaga', 'Onondaga Nation', HAUD_ONONDAGA),
      R('seneca', 'Seneca (Allegany / Cattaraugus)', HAUD_SENECA),
      R('mohawk', 'Mohawk (Akwesasne area)', HAUD_MOHAWK),
    ]),
    K(1900, 'Haudenosaunee nations today (schematic)', [
      R('onondaga', 'Onondaga Nation', HAUD_ONONDAGA),
      R('seneca', 'Seneca Nation', HAUD_SENECA),
      R('mohawk', 'Mohawk Nation', HAUD_MOHAWK),
    ]),
  ],
  timelineItemIds: ['haudenosaunee'],
  confidence: CONF.treaty,
  sources: [
    W('Haudenosaunee'),
    W('Iroquois'),
    { title: 'Onondaga Nation — History', url: 'https://www.onondaganation.org/history/' },
    W('Treaty of Canandaigua'),
  ],
  edgeGrace: 15,
};

const cherokee = {
  id: 'cherokee',
  name: 'Cherokee (Tsalagi)',
  color: '#F59E0B',
  type: 'indigenous',
  description:
    'The Cherokee (Tsalagi) built towns across the southern Appalachians. Sequoyah’s syllabary (1821) and a written constitution marked a literate republic before the Indian Removal Act (1830). The Trail of Tears (1838–39) forced most to Indian Territory; the Cherokee Nation, United Keetoowah Band and Eastern Band continue today.',
  keyYears: [1600, 1750, 1820, 1839, 1900],
  nameAt: [
    [1600, 'Cherokee (Tsalagi)'],
    [1820, 'Cherokee Nation (Southeast)'],
    [1839, 'Cherokee Nation (Indian Territory)'],
    [1900, 'Cherokee Nation (Oklahoma)'],
  ],
  overlays: [
    K(1600, 'Southern Appalachian towns', [R('cherokee', 'Cherokee homeland', CHER_EARLY)]),
    K(1750, 'Cherokee country', [R('cherokee', 'Cherokee', CHER_EARLY)]),
    K(1820, 'Before Removal', [R('cherokee', 'Cherokee Nation', CHER_1820)]),
    K(1839, 'After the Trail of Tears', [R('cherokee', 'Cherokee Nation (Indian Territory)', CHER_IT)]),
    K(1900, 'Cherokee Nation, Oklahoma', [R('cherokee', 'Cherokee Nation', CHER_OK)]),
  ],
  timelineItemIds: ['cherokee'],
  confidence: CONF.removal,
  sources: [
    W('Cherokee'),
    { title: 'Cherokee Nation — History', url: 'https://www.cherokee.org/about-the-nation/history/' },
    W('Trail of Tears'),
    W('Indian Removal Act'),
  ],
  edgeGrace: 12,
};

const muscogee = {
  id: 'muscogee',
  name: 'Muscogee (Creek)',
  color: '#22D3EE',
  type: 'indigenous',
  description:
    'The Muscogee (Creek) Confederacy linked towns across present-day Alabama and Georgia. After the Creek War (1813–14) and the Indian Removal Act, most were forced west on a Muscogee Trail of Tears to Indian Territory. The Muscogee (Creek) Nation remains in Oklahoma; some Poarch Creek stayed in Alabama.',
  keyYears: [1600, 1750, 1820, 1836, 1900],
  nameAt: [
    [1600, 'Muscogee (Creek) Confederacy'],
    [1836, 'Muscogee Nation (Indian Territory)'],
    [1900, 'Muscogee (Creek) Nation'],
  ],
  overlays: [
    K(1600, 'Muscogee towns', [R('muscogee', 'Muscogee homeland', MUSC_EARLY)]),
    K(1750, 'Creek Confederacy', [R('muscogee', 'Muscogee', MUSC_EARLY)]),
    K(1820, 'Before Removal', [R('muscogee', 'Muscogee Nation', MUSC_1820)]),
    K(1836, 'After Removal', [R('muscogee', 'Muscogee (Indian Territory)', MUSC_IT)]),
    K(1900, 'Muscogee Nation, Oklahoma', [R('muscogee', 'Muscogee (Creek) Nation', MUSC_OK)]),
  ],
  timelineItemIds: ['muscogee'],
  confidence: CONF.removal,
  sources: [
    W('Muscogee'),
    { title: 'Muscogee (Creek) Nation — History', url: 'https://www.muscogeenation.com/culturehistory/' },
    W('Creek War'),
    W('Trail of Tears'),
  ],
  edgeGrace: 12,
};

const powhatan = {
  id: 'powhatan',
  name: 'Powhatan Confederacy (Tsenacommacah)',
  color: '#CA8A04',
  type: 'indigenous',
  description:
    'Tsenacommacah, the Powhatan paramount chiefdom of the Virginia Tidewater under Wahunsenacawh (Powhatan), met the Jamestown colonists in 1607. War, disease and English expansion broke the confederacy; the 1646 and 1677 treaties left only small remnant communities. Several Virginia tribes (Pamunkey, Mattaponi and others) continue today on tiny reservations — too small to draw as filled shapes after 1700.',
  keyYears: [1570, 1607, 1646, 1677],
  nameAt: [
    [1570, 'Powhatan Confederacy (Tsenacommacah)'],
    [1646, 'Powhatan remnant'],
    [1677, 'Treaty tribes (Virginia)'],
  ],
  overlays: [
    K(1570, 'Tsenacommacah', [R('powhatan', 'Powhatan Confederacy', POW_PEAK)]),
    K(1607, 'At English contact', [R('powhatan', 'Powhatan Confederacy', POW_PEAK)]),
    K(1646, 'After the Anglo–Powhatan wars', [R('powhatan', 'Powhatan remnant', POW_1646)]),
    K(1677, 'Treaty of Middle Plantation', [R('powhatan', 'Treaty communities', POW_1677)]),
  ],
  timelineItemIds: ['powhatan'],
  confidence: CONF.early,
  sources: [
    W('Powhatan'),
    W('Tsenacommacah'),
    W('Anglo-Powhatan Wars'),
    { title: 'Pamunkey Indian Tribe — History', url: 'https://www.pamunkey.org/' },
  ],
  edgeGrace: 10,
};

const choctaw = {
  id: 'choctaw',
  name: 'Choctaw (Chahta)',
  color: '#2563EB',
  type: 'indigenous',
  description:
    'The Choctaw (Chahta) of the lower Mississippi were among the first nations removed under the 1830 Act (Treaty of Dancing Rabbit Creek, 1830). Most walked to Indian Territory; the Choctaw Nation of Oklahoma and the Mississippi Band of Choctaw Indians continue today.',
  keyYears: [1600, 1750, 1820, 1831, 1900],
  nameAt: [
    [1600, 'Choctaw (Chahta)'],
    [1831, 'Choctaw Nation (Indian Territory)'],
    [1900, 'Choctaw Nation (Oklahoma)'],
  ],
  overlays: [
    K(1600, 'Chahta homeland', [R('choctaw', 'Choctaw', CHOC_EARLY)]),
    K(1750, 'Choctaw country', [R('choctaw', 'Choctaw', CHOC_EARLY)]),
    K(1820, 'Before Removal', [R('choctaw', 'Choctaw Nation', CHOC_1820)]),
    K(1831, 'After Removal', [R('choctaw', 'Choctaw (Indian Territory)', CHOC_IT)]),
    K(1900, 'Choctaw Nation, Oklahoma', [R('choctaw', 'Choctaw Nation', CHOC_OK)]),
  ],
  timelineItemIds: ['choctaw'],
  confidence: CONF.removal,
  sources: [
    W('Choctaw'),
    { title: 'Choctaw Nation — History', url: 'https://www.choctawnation.com/about/history/' },
    W('Treaty of Dancing Rabbit Creek'),
    W('Trail of Tears'),
  ],
  edgeGrace: 12,
};

const chickasaw = {
  id: 'chickasaw',
  name: 'Chickasaw (Chikasha)',
  color: '#1D4ED8',
  type: 'indigenous',
  description:
    'The Chickasaw (Chikasha) held towns in northern Mississippi and adjacent Tennessee / Alabama. They were removed to Indian Territory in the 1830s–37 and formed the Chickasaw Nation west of the Choctaw; the Chickasaw Nation continues in Oklahoma.',
  keyYears: [1600, 1750, 1820, 1837, 1900],
  nameAt: [
    [1600, 'Chickasaw (Chikasha)'],
    [1837, 'Chickasaw Nation (Indian Territory)'],
    [1900, 'Chickasaw Nation (Oklahoma)'],
  ],
  overlays: [
    K(1600, 'Chikasha homeland', [R('chickasaw', 'Chickasaw', CHICK_EARLY)]),
    K(1750, 'Chickasaw country', [R('chickasaw', 'Chickasaw', CHICK_EARLY)]),
    K(1820, 'Before Removal', [R('chickasaw', 'Chickasaw', CHICK_1820)]),
    K(1837, 'After Removal', [R('chickasaw', 'Chickasaw (Indian Territory)', CHICK_IT)]),
    K(1900, 'Chickasaw Nation, Oklahoma', [R('chickasaw', 'Chickasaw Nation', CHICK_OK)]),
  ],
  timelineItemIds: ['chickasaw'],
  confidence: CONF.removal,
  sources: [
    W('Chickasaw'),
    { title: 'Chickasaw Nation — History', url: 'https://www.chickasaw.net/Our-Nation/History.aspx' },
    W('Trail of Tears'),
  ],
  edgeGrace: 12,
};

const seminole = {
  id: 'seminole',
  name: 'Seminole',
  color: '#A3E635',
  type: 'indigenous',
  description:
    'The Seminole formed in Florida from Muscogee migrants, Indigenous Florida peoples and free Black allies. After the Seminole Wars many were removed to Indian Territory; others remained in the Everglades. The Seminole Nation of Oklahoma, the Seminole Tribe of Florida and the Miccosukee continue today.',
  keyYears: [1750, 1820, 1842, 1900],
  nameAt: [
    [1750, 'Seminole'],
    [1842, 'Seminole (Indian Territory) & Florida remnant'],
    [1900, 'Seminole Nation / Florida Seminole'],
  ],
  overlays: [
    K(1750, 'Emerging Seminole towns', [R('seminole', 'Seminole Florida', SEM_EARLY)]),
    K(1820, 'Before the Seminole Wars peak', [R('seminole', 'Seminole', SEM_1820)]),
    K(1842, 'After Removal', [
      R('it', 'Seminole (Indian Territory)', SEM_IT),
      R('fl', 'Florida Seminole remnant', SEM_FL_REM),
    ]),
    K(1900, 'Seminole Nation & Florida communities', [
      R('it', 'Seminole Nation (Oklahoma)', SEM_OK),
      R('fl', 'Florida Seminole', SEM_FL_REM),
    ]),
  ],
  timelineItemIds: ['seminole'],
  confidence: CONF.removal,
  sources: [
    W('Seminole'),
    { title: 'Seminole Tribe of Florida — History', url: 'https://www.semtribe.com/stof/history/introduction' },
    W('Seminole Wars'),
    W('Trail of Tears'),
  ],
  edgeGrace: 12,
};

const lakota = {
  id: 'lakota',
  name: 'Lakota (Teton Sioux)',
  color: '#FC4C02',
  type: 'indigenous',
  description:
    'The Lakota (Teton) are the western council fire of the Oceti Šakowiŋ (Seven Council Fires). Horse culture carried them onto the northern Plains; the 1851 and 1868 Fort Laramie treaties recognised a vast Great Sioux Reservation, later broken into smaller agencies (Pine Ridge, Rosebud, Standing Rock and others) after the Black Hills seizure and Wounded Knee (1890).',
  keyYears: [1700, 1800, 1851, 1868, 1890, 1900],
  nameAt: [
    [1700, 'Lakota (Teton)'],
    [1851, 'Oceti Šakowiŋ treaty lands'],
    [1868, 'Great Sioux Reservation'],
    [1890, 'Lakota / Dakota reservations'],
  ],
  overlays: [
    K(1700, 'Eastern prairie Lakota', [R('lakota', 'Lakota', LAK_1700)]),
    K(1800, 'Onto the High Plains', [R('lakota', 'Lakota range', LAK_1800)]),
    K(1851, 'Treaty of Fort Laramie (1851)', [R('lakota', 'Sioux treaty lands', LAK_1851)]),
    K(1868, 'Great Sioux Reservation', [R('lakota', 'Great Sioux Reservation', LAK_1868)]),
    K(1890, 'After allotment & Wounded Knee', [
      R('pine', 'Pine Ridge', LAK_PINE),
      R('rosebud', 'Rosebud', LAK_ROSEBUD),
      R('standing', 'Standing Rock', LAK_STANDING),
    ]),
    K(1900, 'Lakota / Dakota reservations', [
      R('pine', 'Pine Ridge', LAK_PINE),
      R('rosebud', 'Rosebud', LAK_ROSEBUD),
      R('standing', 'Standing Rock', LAK_STANDING),
    ]),
  ],
  timelineItemIds: ['lakota'],
  confidence: CONF.plains,
  sources: [
    W('Lakota people'),
    W('Sioux'),
    W('Treaty of Fort Laramie (1868)'),
    { title: 'Oglala Sioux Tribe — History', url: 'https://oglalalakotanation.info/' },
  ],
  edgeGrace: 15,
};

const comanche = {
  id: 'comanche',
  name: 'Comanche (Nʉmʉnʉʉ)',
  color: '#EA580C',
  type: 'indigenous',
  description:
    'The Comanche (Nʉmʉnʉʉ, “the people”) split from the Shoshone and built Comancheria across the southern Plains — one of the most powerful horse nations in North America. After the Red River War (1874–75) survivors were confined near Fort Sill; the Comanche Nation is headquartered in Lawton, Oklahoma.',
  keyYears: [1700, 1800, 1850, 1875, 1900],
  nameAt: [
    [1700, 'Comanche (Nʉmʉnʉʉ)'],
    [1800, 'Comancheria'],
    [1875, 'Comanche Reservation (Fort Sill)'],
    [1900, 'Comanche Nation'],
  ],
  overlays: [
    K(1700, 'Emerging on the southern Plains', [R('comanche', 'Comanche', COM_EARLY)]),
    K(1800, 'Comancheria at its height', [R('comanche', 'Comancheria', COM_PEAK)]),
    K(1850, 'Under US and Texan pressure', [R('comanche', 'Comanche range', COM_1850)]),
    K(1875, 'After the Red River War', [R('comanche', 'Fort Sill reservation', COM_RES)]),
    K(1900, 'Comanche Nation', [R('comanche', 'Comanche Nation', COM_RES)]),
  ],
  timelineItemIds: ['comanche'],
  confidence: CONF.plains,
  sources: [
    W('Comanche'),
    W('Comancheria'),
    W('Red River War'),
    { title: 'Comanche Nation — History', url: 'https://comanchenation.com/' },
  ],
  edgeGrace: 15,
};

const navajo = {
  id: 'navajo',
  name: 'Diné (Navajo)',
  color: '#A855F7',
  type: 'indigenous',
  description:
    'The Diné (Navajo) made Dinétah their homeland across the Four Corners. Kit Carson’s campaign forced the Long Walk to Bosque Redondo (1864); the 1868 treaty allowed return to a reservation that later grew into today’s Navajo Nation — the largest Indigenous nation by land area in the United States.',
  keyYears: [1600, 1750, 1864, 1868, 1900],
  nameAt: [
    [1600, 'Diné (Navajo)'],
    [1864, 'Diné at Bosque Redondo'],
    [1868, 'Navajo Nation (treaty reservation)'],
    [1900, 'Navajo Nation'],
  ],
  overlays: [
    K(1600, 'Dinétah', [R('dine', 'Diné homeland', DINE_EARLY)]),
    K(1750, 'Diné country', [R('dine', 'Diné', DINE_WIDE)]),
    K(1864, 'Long Walk — Bosque Redondo', [R('bosque', 'Bosque Redondo', DINE_BOSQUE)]),
    K(1868, 'Return under the 1868 treaty', [R('dine', 'Navajo Reservation', DINE_RES)]),
    K(1900, 'Navajo Nation', [R('dine', 'Navajo Nation', DINE_RES)]),
  ],
  timelineItemIds: ['navajo'],
  confidence: CONF.treaty,
  sources: [
    W('Navajo'),
    W('Long Walk of the Navajo'),
    { title: 'Navajo Nation — History', url: 'https://www.navajo-nsn.gov/' },
    W('Treaty of Bosque Redondo'),
  ],
  edgeGrace: 12,
};

const apache = {
  id: 'apache',
  name: 'Ndee (Apache)',
  color: '#BE185D',
  type: 'indigenous',
  description:
    'Ndee (Apache) bands — including Chiricahua, Mescalero, Jicarilla, Western Apache and others — held mountains and deserts of the Southwest. After decades of resistance (Geronimo’s Chiricahua among the last), survivors were placed on reservations in Arizona, New Mexico and Oklahoma. This outline is a schematic umbrella over related nations, not one polity.',
  keyYears: [1600, 1750, 1850, 1886, 1900],
  nameAt: [
    [1600, 'Ndee (Apache) peoples'],
    [1886, 'Apache reservations'],
    [1900, 'Apache nations'],
  ],
  overlays: [
    K(1600, 'Ndee ranges', [R('apache', 'Apache country', APACHE_EARLY)]),
    K(1750, 'Apache country', [R('apache', 'Ndee', APACHE_WIDE)]),
    K(1850, 'Under Mexican and US pressure', [R('apache', 'Apache', APACHE_WIDE)]),
    K(1886, 'After Geronimo’s surrender', [
      R('west', 'Western Apache / San Carlos area', APACHE_RES_W),
      R('mescalero', 'Mescalero', APACHE_RES_M),
    ]),
    K(1900, 'Apache nations', [
      R('west', 'Western Apache reservations', APACHE_RES_W),
      R('mescalero', 'Mescalero Apache', APACHE_RES_M),
    ]),
  ],
  timelineItemIds: ['apache'],
  confidence: {
    level: 'conjectural',
    reason: '“Apache” covers several related Ndee nations with separate territories and histories; the early rings are a schematic umbrella, and reservation shapes are simplified stand-ins for multiple agencies.',
  },
  sources: [
    W('Apache'),
    W('Chiricahua'),
    W('Geronimo'),
    { title: 'Mescalero Apache Tribe — History', url: 'https://mescaleroapachetribe.com/' },
  ],
  edgeGrace: 15,
};

const mapuche = {
  id: 'mapuche',
  name: 'Mapuche',
  color: '#0F766E',
  type: 'indigenous',
  description:
    'The Mapuche of southern Chile and Argentina stopped Inca and then Spanish conquest south of the Bío Bío; the Parliament of Quilín (1641) recognised their independence. Chilean occupation of Araucanía (1861–83) and Argentine campaigns reduced Mapuche land to reservations and reductions; Mapuche communities remain a major Indigenous nation in both countries.',
  keyYears: [1500, 1641, 1800, 1883, 1900],
  nameAt: [
    [1500, 'Mapuche'],
    [1641, 'Mapuche (independent Wallmapu)'],
    [1883, 'Mapuche after Occupation of Araucanía'],
    [1900, 'Mapuche communities'],
  ],
  overlays: [
    K(1500, 'Mapuche homeland', [R('mapuche', 'Mapuche', MAP_CORE)]),
    K(1641, 'Parliament of Quilín — independent Wallmapu', [R('mapuche', 'Wallmapu', MAP_INDEP)]),
    K(1800, 'Still independent', [R('mapuche', 'Mapuche / Wallmapu', MAP_WIDE)]),
    K(1883, 'After the Occupation of Araucanía', [R('mapuche', 'Mapuche reductions', MAP_1885)]),
    K(1900, 'Mapuche communities', [R('mapuche', 'Mapuche', MAP_TODAY)]),
  ],
  timelineItemIds: ['mapuche'],
  confidence: CONF.mapuche,
  sources: [
    W('Mapuche'),
    W('Occupation of Araucanía'),
    W('Parliament of Quillín'),
    { title: 'Britannica — Mapuche', url: 'https://www.britannica.com/topic/Mapuche' },
  ],
  edgeGrace: 15,
};

/** All Native / Indigenous nation polities for Day 60; appended to spatialEntities. */
export const nativeNationsPolities = [
  haudenosaunee,
  cherokee,
  muscogee,
  powhatan,
  choctaw,
  chickasaw,
  seminole,
  lakota,
  comanche,
  navajo,
  apache,
  mapuche,
];
