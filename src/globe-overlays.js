/**
 * Historical overlay spatial entities (Phase 4 / PR C + Day 14–18).
 * Day 18: activation clamped to linked timeline lifespan + overlay keyframe span.
 * Day 19: early Bronze Age fill (Mesopotamia, early Egypt, Shang, Phoenicia, Olmec, Kush).
 * Day 20: living borders — morph rings between overlay keyframes + soft lifespan dissolve.
 *
 * Spatial entities + schematic region rings for Globe polygons.
 * Rings are intentionally rough — not GIS-accurate ancient borders.
 */

import { civilisations } from './civilisations.js';
import { warsItems } from './wars.js';
import { morphEntityAtYear, ensureClockwise } from './globe-morph.js';

/** @typedef {'empire' | 'civilization' | 'state' | 'other'} SpatialEntityType */
/** @typedef {'rough' | 'simplified' | 'schematic'} ApproximationLevel */

/**
 * @typedef {Object} RegionRef
 * @property {string} id
 * @property {string} [name]
 * @property {[number, number, number, number]} [bbox] west,south,east,north degrees
 */

/**
 * @typedef {Object} OverlaySnapshot
 * @property {number} year
 * @property {string} [label]
 * @property {ApproximationLevel} approximation
 * @property {(string|RegionRef)[]} regions
 */

/**
 * @typedef {Object} SpatialEntity
 * @property {string} id
 * @property {string} name
 * @property {string} color
 * @property {SpatialEntityType} type
 * @property {string} description
 * @property {number[]} [keyYears]
 * @property {OverlaySnapshot[]} overlays
 * @property {string[]} [timelineItemIds]
 * @property {{ title: string, url: string }[]} [sources]
 */

/** @type {SpatialEntity[]} */
export const spatialEntities = [
  {
    id: 'roman-empire',
    name: 'Roman Empire',
    color: '#FF5A5F',
    type: 'empire',
    description:
      'A major Mediterranean empire centered on Rome. At its height under Trajan it spanned three continents.',
    keyYears: [-27, 117, 395, 476],
    overlays: [
      {
        year: -27,
        label: 'Principate begins (Augustus)',
        approximation: 'rough',
        regions: [
          { id: 'italy', name: 'Italy', bbox: [6.5, 36.5, 18.5, 47] },
          { id: 'mediterranean', name: 'Mediterranean basin', bbox: [-10, 30, 37, 46] },
        ],
      },
      {
        year: 117,
        label: 'Height under Trajan',
        approximation: 'rough',
        regions: [
          { id: 'mediterranean', name: 'Mediterranean basin', bbox: [-10, 24, 45, 56] },
          { id: 'italy', name: 'Italy' },
          { id: 'near-east', name: 'Near East fringe', bbox: [35, 30, 48, 42] },
        ],
      },
      {
        year: 395,
        label: 'East–West division',
        approximation: 'schematic',
        regions: [
          { id: 'mediterranean', name: 'Mediterranean basin', bbox: [-10, 30, 40, 48] },
        ],
      },
    ],
    timelineItemIds: ['roman-empire', 'roman-conquest'],
    sources: [
      { title: 'Wikipedia — Roman Empire', url: 'https://en.wikipedia.org/wiki/Roman_Empire' },
    ],
  },
  {
    id: 'han-china',
    name: 'Han China',
    color: '#F59E0B',
    type: 'empire',
    description:
      'Golden-age Chinese empire that consolidated imperial administration and opened Silk Road exchange.',
    keyYears: [-206, 2, 220],
    overlays: [
      {
        year: -141,
        label: 'Western Han expansion (Wu)',
        approximation: 'rough',
        regions: [
          { id: 'north-china', name: 'North China plain', bbox: [105, 30, 122, 42] },
          { id: 'central-china', name: 'Central China', bbox: [102, 25, 120, 35] },
        ],
      },
      {
        year: 2,
        label: 'Western Han census peak',
        approximation: 'simplified',
        regions: [
          { id: 'china-proper', name: 'China proper (approx.)', bbox: [100, 22, 122, 42] },
          { id: 'tarim', name: 'Tarim / Silk Road fringe', bbox: [75, 36, 95, 43] },
        ],
      },
      {
        year: 100,
        label: 'Eastern Han',
        approximation: 'schematic',
        regions: [
          { id: 'china-proper', name: 'China proper (approx.)', bbox: [102, 22, 122, 41] },
        ],
      },
    ],
    timelineItemIds: ['han-dynasty'],
    sources: [
      { title: 'Wikipedia — Han dynasty', url: 'https://en.wikipedia.org/wiki/Han_dynasty' },
    ],
  },
  {
    id: 'parthian-empire',
    name: 'Parthian Empire',
    color: '#A8A29E',
    type: 'empire',
    description:
      'Iranian empire controlling the Iranian plateau and Mesopotamia; Rome’s great eastern rival.',
    keyYears: [-247, 50, 224],
    overlays: [
      {
        year: 50,
        label: 'Parthia vs Rome (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'persia', name: 'Iranian plateau' },
          { id: 'mesopotamia', name: 'Mesopotamia fringe' },
          { id: 'parthia-east', name: 'Eastern Parthia', bbox: [55, 30, 70, 40] },
        ],
      },
      {
        year: 150,
        label: 'Later Parthian period',
        approximation: 'schematic',
        regions: [
          { id: 'persia', name: 'Iranian plateau' },
          { id: 'mesopotamia', name: 'Mesopotamia fringe' },
        ],
      },
    ],
    timelineItemIds: ['parthian'],
    sources: [
      { title: 'Wikipedia — Parthian Empire', url: 'https://en.wikipedia.org/wiki/Parthian_Empire' },
    ],
  },
  {
    id: 'kushan-empire',
    name: 'Kushan Empire',
    color: '#D946EF',
    type: 'empire',
    description:
      'Central Asian / North Indian empire linking Silk Road trade between China, Iran, and the Gangetic plain.',
    keyYears: [30, 100, 230],
    overlays: [
      {
        year: 100,
        label: 'Kushan high period',
        approximation: 'schematic',
        regions: [
          { id: 'kushan-core', name: 'Bactria–Gandhara', bbox: [65, 30, 78, 40] },
          { id: 'north-india', name: 'Northwest India fringe', bbox: [70, 24, 82, 34] },
        ],
      },
    ],
    timelineItemIds: ['kushan'],
    sources: [
      { title: 'Wikipedia — Kushan Empire', url: 'https://en.wikipedia.org/wiki/Kushan_Empire' },
    ],
  },
  {
    id: 'maurya-empire',
    name: 'Maurya Empire',
    color: '#059669',
    type: 'empire',
    description:
      'Early Indian empire that, under Ashoka, controlled much of the subcontinent.',
    keyYears: [-322, -250, -185],
    overlays: [
      {
        year: -250,
        label: 'Ashokan Maurya (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'india-north', name: 'Gangetic / north India', bbox: [72, 20, 90, 32] },
          { id: 'india-deccan', name: 'Deccan fringe', bbox: [74, 12, 85, 22] },
        ],
      },
    ],
    timelineItemIds: ['maurya'],
    sources: [
      { title: 'Wikipedia — Maurya Empire', url: 'https://en.wikipedia.org/wiki/Maurya_Empire' },
    ],
  },
  {
    id: 'gupta-empire',
    name: 'Gupta Empire',
    color: '#34D399',
    type: 'empire',
    description:
      'Classical Indian empire often associated with a “golden age” of science, art, and literature.',
    keyYears: [320, 450, 550],
    overlays: [
      {
        year: 450,
        label: 'Gupta high water (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'india-north', name: 'North India', bbox: [72, 20, 90, 32] },
          { id: 'india-central', name: 'Central India', bbox: [74, 16, 88, 26] },
        ],
      },
    ],
    timelineItemIds: ['gupta'],
    sources: [
      { title: 'Wikipedia — Gupta Empire', url: 'https://en.wikipedia.org/wiki/Gupta_Empire' },
    ],
  },
  {
    id: 'byzantine-empire',
    name: 'Byzantine Empire',
    color: '#6366F1',
    type: 'empire',
    description:
      'Eastern Roman continuity centered on Constantinople; endured through medieval centuries.',
    keyYears: [395, 565, 800, 1453],
    overlays: [
      {
        year: 565,
        label: 'Justinianic reconquest',
        approximation: 'schematic',
        regions: [
          { id: 'byzantine-core', name: 'Balkans / Anatolia', bbox: [20, 35, 42, 46] },
          { id: 'egypt', name: 'Egypt (briefly)' },
          { id: 'italy', name: 'Italy fringe' },
        ],
      },
      {
        year: 800,
        label: 'Middle Byzantine world',
        approximation: 'schematic',
        regions: [
          { id: 'byzantine-core', name: 'Balkans / Anatolia', bbox: [22, 36, 42, 45] },
          { id: 'levant', name: 'Levant fringe' },
        ],
      },
      {
        year: 1025,
        label: 'Macedonian apex',
        approximation: 'schematic',
        regions: [
          { id: 'byzantine-core', name: 'Balkans / Anatolia', bbox: [19, 35, 42, 46] },
        ],
      },
    ],
    timelineItemIds: ['byzantine'],
    sources: [
      { title: 'Wikipedia — Byzantine Empire', url: 'https://en.wikipedia.org/wiki/Byzantine_Empire' },
    ],
  },
  {
    id: 'frankish-empire',
    name: 'Carolingian / Frankish realm',
    color: '#14B8A6',
    type: 'empire',
    description:
      'Frankish realm under Charlemagne covering much of Western and Central Europe.',
    keyYears: [768, 800, 843],
    overlays: [
      {
        year: 800,
        label: 'Charlemagne crowned (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'frankish-west', name: 'Gaul / West Francia', bbox: [-5, 42, 8, 51] },
          { id: 'frankish-east', name: 'East Francia / Germany', bbox: [5, 45, 18, 54] },
          { id: 'italy', name: 'Northern Italy fringe' },
        ],
      },
    ],
    timelineItemIds: ['frankish'],
    sources: [
      { title: 'Wikipedia — Carolingian Empire', url: 'https://en.wikipedia.org/wiki/Carolingian_Empire' },
    ],
  },
  {
    id: 'tang-china',
    name: 'Tang China',
    color: '#FDE047',
    type: 'empire',
    description:
      'Cosmopolitan Chinese empire of the early medieval period; capital Chang’an a hub of Eurasian exchange.',
    keyYears: [618, 755, 907],
    overlays: [
      {
        year: 750,
        label: 'High Tang (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'china-proper', name: 'China proper' },
          { id: 'tarim', name: 'Western Regions fringe' },
          { id: 'tang-north', name: 'North China / steppe fringe', bbox: [100, 35, 125, 45] },
        ],
      },
    ],
    timelineItemIds: ['tang-dynasty'],
    sources: [
      { title: 'Wikipedia — Tang dynasty', url: 'https://en.wikipedia.org/wiki/Tang_dynasty' },
    ],
  },
  {
    id: 'song-china',
    name: 'Song China',
    color: '#CA8A04',
    type: 'empire',
    description:
      'Song dynasty China — commercially advanced, later pressed by Jurchen and Mongol powers.',
    keyYears: [960, 1127, 1279],
    overlays: [
      {
        year: 1100,
        label: 'Northern Song (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'china-proper', name: 'China proper', bbox: [102, 22, 122, 41] },
        ],
      },
      {
        year: 1200,
        label: 'Southern Song (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'south-china', name: 'South China', bbox: [105, 20, 122, 33] },
        ],
      },
    ],
    timelineItemIds: ['song-dynasty'],
    sources: [
      { title: 'Wikipedia — Song dynasty', url: 'https://en.wikipedia.org/wiki/Song_dynasty' },
    ],
  },
  {
    id: 'abbasid-caliphate',
    name: 'Abbasid Caliphate',
    color: '#10B981',
    type: 'empire',
    description:
      'Islamic caliphate centered on Baghdad; a major scholarly and commercial power across the Middle East and beyond.',
    keyYears: [750, 800, 1258],
    overlays: [
      {
        year: 800,
        label: 'High Abbasid period',
        approximation: 'rough',
        regions: [
          { id: 'mesopotamia', name: 'Mesopotamia', bbox: [38, 30, 48, 37] },
          { id: 'levant', name: 'Levant', bbox: [34, 30, 42, 37] },
          { id: 'egypt', name: 'Egypt', bbox: [25, 22, 35, 32] },
          { id: 'persia', name: 'Iran / Persia', bbox: [44, 25, 62, 40] },
        ],
      },
      {
        year: 900,
        label: 'Fragmenting caliphal world',
        approximation: 'schematic',
        regions: [
          { id: 'mesopotamia', name: 'Mesopotamia', bbox: [38, 30, 48, 37] },
          { id: 'persia', name: 'Iran / Persia', bbox: [44, 25, 62, 40] },
        ],
      },
    ],
    timelineItemIds: ['abbasid-caliphate'],
    sources: [
      {
        title: 'Wikipedia — Abbasid Caliphate',
        url: 'https://en.wikipedia.org/wiki/Abbasid_Caliphate',
      },
    ],
  },
  {
    id: 'mali-empire',
    name: 'Mali Empire',
    color: '#EAB308',
    type: 'empire',
    description:
      'West African empire famed for gold, scholarship (Timbuktu), and the pilgrimage of Mansa Musa.',
    keyYears: [1235, 1324, 1460],
    overlays: [
      {
        year: 1324,
        label: 'Mansa Musa era (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'west-africa-sahel', name: 'Sahel / Niger bend', bbox: [-12, 10, 4, 20] },
        ],
      },
    ],
    timelineItemIds: ['mali-empire'],
    sources: [
      { title: 'Wikipedia — Mali Empire', url: 'https://en.wikipedia.org/wiki/Mali_Empire' },
    ],
  },
  {
    id: 'khmer-empire',
    name: 'Khmer Empire',
    color: '#FB7185',
    type: 'empire',
    description:
      'Mainland Southeast Asian empire centered on Angkor; hydraulic cities and temple complexes.',
    keyYears: [802, 1150, 1431],
    overlays: [
      {
        year: 1150,
        label: 'Angkor high period (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'mainland-sea', name: 'Mainland SE Asia', bbox: [100, 10, 110, 18] },
        ],
      },
    ],
    timelineItemIds: ['khmer'],
    sources: [
      { title: 'Wikipedia — Khmer Empire', url: 'https://en.wikipedia.org/wiki/Khmer_Empire' },
    ],
  },
  {
    id: 'mongol-empire',
    name: 'Mongol Empire',
    color: '#8B5CF6',
    type: 'empire',
    description:
      'Largest contiguous land empire in history, founded by Genghis Khan; linked East and West along the Silk Road.',
    keyYears: [1206, 1279, 1368],
    overlays: [
      {
        year: 1227,
        label: 'At Genghis Khan’s death',
        approximation: 'rough',
        regions: [
          { id: 'mongolia', name: 'Mongolia / steppe core', bbox: [87, 42, 120, 52] },
          { id: 'central-asia', name: 'Central Asia', bbox: [50, 35, 80, 48] },
        ],
      },
      {
        year: 1279,
        label: 'Yuan peak under Kublai',
        approximation: 'rough',
        regions: [
          { id: 'eurasian-steppe', name: 'Eurasian steppe belt', bbox: [30, 35, 135, 55] },
          { id: 'china-proper', name: 'China under Yuan', bbox: [100, 20, 125, 42] },
          { id: 'persia', name: 'Ilkhanate Persia', bbox: [44, 25, 65, 40] },
        ],
      },
    ],
    timelineItemIds: ['mongol-empire', 'mongol-conquests'],
    sources: [
      { title: 'Wikipedia — Mongol Empire', url: 'https://en.wikipedia.org/wiki/Mongol_Empire' },
    ],
  },
  {
    id: 'delhi-sultanate',
    name: 'Delhi Sultanate',
    color: '#A3E635',
    type: 'state',
    description:
      'Series of Muslim dynasties ruling large parts of the Indian subcontinent from Delhi.',
    keyYears: [1206, 1290, 1398],
    overlays: [
      {
        year: 1300,
        label: 'Delhi Sultanate extent (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'india-north', name: 'North India' },
          { id: 'india-central', name: 'Central India fringe' },
        ],
      },
    ],
    timelineItemIds: ['delhi-sultanate'],
    sources: [
      { title: 'Wikipedia — Delhi Sultanate', url: 'https://en.wikipedia.org/wiki/Delhi_Sultanate' },
    ],
  },
  {
    id: 'ottoman-empire',
    name: 'Ottoman Empire',
    color: '#9A3412',
    type: 'empire',
    description:
      'Turkish empire spanning southeastern Europe, Anatolia, and much of the eastern Mediterranean.',
    keyYears: [1453, 1520, 1683, 1914],
    overlays: [
      {
        year: 1520,
        label: 'Early modern Ottoman peak approach',
        approximation: 'schematic',
        regions: [
          { id: 'anatolia-balkans', name: 'Anatolia / Balkans', bbox: [18, 35, 45, 46] },
          { id: 'levant', name: 'Levant' },
          { id: 'egypt', name: 'Egypt' },
        ],
      },
      {
        year: 1683,
        label: 'Ottoman high water',
        approximation: 'schematic',
        regions: [
          { id: 'anatolia-balkans', name: 'Anatolia / Balkans', bbox: [15, 34, 48, 48] },
          { id: 'levant', name: 'Levant' },
          { id: 'egypt', name: 'Egypt' },
          { id: 'maghreb-east', name: 'Eastern Maghreb', bbox: [5, 30, 25, 37] },
        ],
      },
      {
        year: 1900,
        label: 'Late Ottoman (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'anatolia-balkans', name: 'Anatolia / Balkans remnant', bbox: [26, 36, 45, 42] },
          { id: 'levant', name: 'Levant' },
        ],
      },
    ],
    timelineItemIds: ['ottoman'],
    sources: [
      { title: 'Wikipedia — Ottoman Empire', url: 'https://en.wikipedia.org/wiki/Ottoman_Empire' },
    ],
  },
  {
    id: 'spanish-empire',
    name: 'Spanish Empire',
    color: '#FF8C42',
    type: 'empire',
    description:
      'Iberian oceanic empire with American viceroyalties and Pacific footholds after 1492.',
    keyYears: [1492, 1550, 1700],
    overlays: [
      {
        year: 1492,
        label: 'Iberia at contact (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'iberia', name: 'Iberian Peninsula', bbox: [-10, 36, 4, 44] },
        ],
      },
      {
        year: 1550,
        label: 'Spanish Americas',
        approximation: 'schematic',
        regions: [
          { id: 'iberia', name: 'Iberia' },
          { id: 'mesoamerica', name: 'New Spain / Mesoamerica', bbox: [-110, 14, -86, 28] },
          { id: 'andes', name: 'Andean corridor' },
        ],
      },
      {
        year: 1700,
        label: 'Bourbon-era Spanish world',
        approximation: 'schematic',
        regions: [
          { id: 'iberia', name: 'Iberia' },
          { id: 'mesoamerica', name: 'New Spain' },
          { id: 'andes', name: 'Andes / Peru' },
          { id: 'southern-cone', name: 'Southern Cone fringe', bbox: [-75, -40, -55, -20] },
        ],
      },
    ],
    timelineItemIds: ['spanish-empire'],
    sources: [
      { title: 'Wikipedia — Spanish Empire', url: 'https://en.wikipedia.org/wiki/Spanish_Empire' },
    ],
  },
  {
    id: 'aztec-empire',
    name: 'Aztec Empire',
    color: '#A855F7',
    type: 'empire',
    description:
      'Mesoamerican tributary empire centered on Tenochtitlan in the Valley of Mexico.',
    keyYears: [1428, 1519, 1521],
    overlays: [
      {
        year: 1519,
        label: 'Triple Alliance peak (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'valley-mexico', name: 'Valley of Mexico / central Mexico', bbox: [-102, 16, -94, 22] },
        ],
      },
    ],
    timelineItemIds: ['aztec'],
    sources: [
      { title: 'Wikipedia — Aztec Empire', url: 'https://en.wikipedia.org/wiki/Aztec_Empire' },
    ],
  },
  {
    id: 'inca-empire',
    name: 'Inca Empire',
    color: '#EA580C',
    type: 'empire',
    description:
      'Andean empire stretching along the western spine of South America before Spanish conquest.',
    keyYears: [1438, 1527, 1533],
    overlays: [
      {
        year: 1527,
        label: 'Late Inca extent (approx.)',
        approximation: 'rough',
        regions: [
          { id: 'andes', name: 'Andean corridor', bbox: [-81, -22, -68, 2] },
          { id: 'peru', name: 'Peru highlands', bbox: [-80, -18, -69, -3] },
        ],
      },
    ],
    timelineItemIds: ['inca'],
    sources: [
      { title: 'Wikipedia — Inca Empire', url: 'https://en.wikipedia.org/wiki/Inca_Empire' },
    ],
  },
  {
    id: 'ming-china',
    name: 'Ming China',
    color: '#FBBF24',
    type: 'empire',
    description:
      'Ming dynasty restored Han Chinese rule after the Yuan; maritime voyages then inward turn.',
    keyYears: [1368, 1420, 1644],
    overlays: [
      {
        year: 1420,
        label: 'Early Ming (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'china-proper', name: 'China proper' },
        ],
      },
      {
        year: 1550,
        label: 'Mid–late Ming',
        approximation: 'schematic',
        regions: [
          { id: 'china-proper', name: 'China proper' },
        ],
      },
    ],
    timelineItemIds: ['ming-dynasty'],
    sources: [
      { title: 'Wikipedia — Ming dynasty', url: 'https://en.wikipedia.org/wiki/Ming_dynasty' },
    ],
  },
  {
    id: 'mughal-empire',
    name: 'Mughal Empire',
    color: '#4D7C0F',
    type: 'empire',
    description:
      'Early modern Indian empire blending Persianate court culture with the subcontinent’s diversity.',
    keyYears: [1526, 1605, 1707],
    overlays: [
      {
        year: 1605,
        label: 'Akbar–Jahangir era (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'india-north', name: 'North India' },
          { id: 'india-central', name: 'Central India' },
          { id: 'india-deccan', name: 'Deccan fringe' },
        ],
      },
      {
        year: 1700,
        label: 'Aurangzeb-era extent',
        approximation: 'schematic',
        regions: [
          { id: 'india-north', name: 'North India' },
          { id: 'india-central', name: 'Central India' },
          { id: 'india-deccan', name: 'Deccan' },
          { id: 'india-south', name: 'South India fringe', bbox: [74, 8, 80, 16] },
        ],
      },
    ],
    timelineItemIds: ['mughal'],
    sources: [
      { title: 'Wikipedia — Mughal Empire', url: 'https://en.wikipedia.org/wiki/Mughal_Empire' },
    ],
  },
  {
    id: 'qing-china',
    name: 'Qing China',
    color: '#F472B6',
    type: 'empire',
    description:
      'Manchu-led Qing empire — China’s last imperial dynasty, with vast Inner Asian frontiers.',
    keyYears: [1644, 1750, 1911],
    overlays: [
      {
        year: 1750,
        label: 'High Qing (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'china-proper', name: 'China proper' },
          { id: 'tarim', name: 'Xinjiang / Tarim' },
          { id: 'mongolia', name: 'Mongolia fringe' },
          { id: 'manchuria', name: 'Manchuria', bbox: [120, 40, 135, 50] },
        ],
      },
      {
        year: 1900,
        label: 'Late Qing (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'china-proper', name: 'China proper' },
          { id: 'manchuria', name: 'Manchuria' },
        ],
      },
    ],
    timelineItemIds: ['qing-dynasty'],
    sources: [
      { title: 'Wikipedia — Qing dynasty', url: 'https://en.wikipedia.org/wiki/Qing_dynasty' },
    ],
  },
  {
    id: 'russian-empire',
    name: 'Russian Empire',
    color: '#3B82F6',
    type: 'empire',
    description:
      'Eurasian land empire expanding from Muscovy across Siberia to the Pacific and into Central Asia.',
    keyYears: [1721, 1800, 1914],
    overlays: [
      {
        year: 1700,
        label: 'Petrine Russia',
        approximation: 'schematic',
        regions: [
          { id: 'russia-european', name: 'European Russia', bbox: [28, 48, 60, 68] },
          { id: 'siberia-west', name: 'Western Siberia', bbox: [60, 50, 90, 68] },
        ],
      },
      {
        year: 1850,
        label: 'Mid-imperial Russia',
        approximation: 'schematic',
        regions: [
          { id: 'russia-european', name: 'European Russia' },
          { id: 'siberia-belt', name: 'Siberian belt', bbox: [60, 50, 140, 70] },
          { id: 'central-asia', name: 'Central Asia fringe' },
        ],
      },
      {
        year: 1914,
        label: 'Russian Empire on the eve of WWI',
        approximation: 'schematic',
        regions: [
          { id: 'russia-european', name: 'European Russia' },
          { id: 'siberia-belt', name: 'Siberia' },
          { id: 'central-asia', name: 'Central Asia' },
        ],
      },
    ],
    timelineItemIds: ['russian-empire'],
    sources: [
      { title: 'Wikipedia — Russian Empire', url: 'https://en.wikipedia.org/wiki/Russian_Empire' },
    ],
  },
  {
    id: 'british-empire',
    name: 'British Empire',
    color: '#38BDF8',
    type: 'empire',
    description:
      'Oceanic empire with settler colonies, Indian Raj, and African/Asian possessions at its Victorian peak.',
    keyYears: [1700, 1815, 1900, 1920],
    overlays: [
      {
        year: 1700,
        label: 'Early British Atlantic',
        approximation: 'schematic',
        regions: [
          { id: 'british-isles', name: 'British Isles', bbox: [-8, 50, 2, 59] },
          { id: 'east-north-america', name: 'Eastern North America fringe', bbox: [-80, 30, -60, 48] },
        ],
      },
      {
        year: 1850,
        label: 'Victorian expansion',
        approximation: 'schematic',
        regions: [
          { id: 'british-isles', name: 'British Isles' },
          { id: 'india-north', name: 'India (Raj core)' },
          { id: 'india-deccan', name: 'India Deccan' },
          { id: 'australia-east', name: 'Eastern Australia', bbox: [140, -38, 154, -12] },
          { id: 'south-africa', name: 'South Africa fringe', bbox: [16, -35, 32, -22] },
        ],
      },
      {
        year: 1900,
        label: 'British peak (approx.)',
        approximation: 'schematic',
        regions: [
          { id: 'british-isles', name: 'British Isles' },
          { id: 'india-north', name: 'India' },
          { id: 'india-deccan', name: 'India Deccan' },
          { id: 'india-south', name: 'South India' },
          { id: 'australia-east', name: 'Australia east' },
          { id: 'canada-east', name: 'Eastern Canada', bbox: [-80, 42, -55, 55] },
          { id: 'egypt', name: 'Egypt (occupation)' },
          { id: 'south-africa', name: 'South Africa' },
        ],
      },
    ],
    timelineItemIds: ['british-empire', 'british-raj'],
    sources: [
      { title: 'Wikipedia — British Empire', url: 'https://en.wikipedia.org/wiki/British_Empire' },
    ],
  },

  // --- Day 17 densification: ancient + colonial pass ---
  {
    id: 'achaemenid-empire',
    name: 'Achaemenid Persian Empire',
    color: '#C2410C',
    type: 'empire',
    description:
      'First true superpower of the ancient Near East — schematic core from Anatolia and Egypt to the Iranian plateau.',
    keyYears: [-550, -500, -330],
    overlays: [
      {
        year: -500,
        label: 'Height under Darius',
        approximation: 'schematic',
        regions: [
          { id: 'persia', name: 'Iranian plateau' },
          { id: 'mesopotamia', name: 'Mesopotamia' },
          { id: 'levant', name: 'Levant' },
          { id: 'egypt', name: 'Egypt' },
          { id: 'anatolia', name: 'Anatolia', bbox: [26, 36, 44, 42] },
        ],
      },
    ],
    timelineItemIds: ['persian-achaemenid'],
    sources: [
      { title: 'Wikipedia — Achaemenid Empire', url: 'https://en.wikipedia.org/wiki/Achaemenid_Empire' },
    ],
  },
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    color: '#A16207',
    type: 'civilization',
    description:
      'Nile-valley civilisation across Old, Middle, and New Kingdoms — schematic river-core influence.',
    keyYears: [-3000, -2686, -2500, -2000, -1500, -1250, -500, -30],
    overlays: [
      {
        year: -3000,
        label: 'Early Dynastic Nile',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
        ],
      },
      {
        year: -2500,
        label: 'Old Kingdom Nile core',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
        ],
      },
      {
        year: -2000,
        label: 'Middle Kingdom',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
          { id: 'nile-upper', name: 'Upper Nile fringe' },
        ],
      },
      {
        year: -1500,
        label: 'New Kingdom rise',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
          { id: 'nile-upper', name: 'Upper Nile fringe' },
          { id: 'levant', name: 'Levant fringe' },
        ],
      },
      {
        year: -1250,
        label: 'New Kingdom core',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
          { id: 'nile-upper', name: 'Upper Nile fringe', bbox: [30, 10, 36, 22] },
        ],
      },
      {
        year: -500,
        label: 'Late Period',
        approximation: 'schematic',
        regions: [
          { id: 'egypt', name: 'Nile / Egypt' },
        ],
      },
    ],
    timelineItemIds: ['ancient-egypt'],
    sources: [
      { title: 'Wikipedia — Ancient Egypt', url: 'https://en.wikipedia.org/wiki/Ancient_Egypt' },
    ],
  },
  {
    id: 'classical-greece',
    name: 'Classical Greece',
    color: '#1D4ED8',
    type: 'civilization',
    description:
      'City-state world of the Aegean and southern Balkans — schematic cultural-political core, not a unitary empire.',
    keyYears: [-480, -450, -323, -146],
    overlays: [
      {
        year: -450,
        label: 'Classical Aegean',
        approximation: 'schematic',
        regions: [
          { id: 'greece', name: 'Greece / Aegean', bbox: [19, 35, 28, 42] },
        ],
      },
    ],
    timelineItemIds: ['classical-greece'],
    sources: [
      { title: 'Wikipedia — Classical Greece', url: 'https://en.wikipedia.org/wiki/Classical_Greece' },
    ],
  },
  {
    id: 'carthage',
    name: 'Carthage',
    color: '#7F1D1D',
    type: 'empire',
    description:
      'Phoenician-founded North African power with western Mediterranean trade reach — schematic Maghreb core.',
    keyYears: [-814, -500, -264, -146],
    overlays: [
      {
        year: -500,
        label: 'Punic western Med',
        approximation: 'schematic',
        regions: [
          { id: 'carthage-core', name: 'Carthage / Tunisia', bbox: [8, 32, 12, 38] },
          { id: 'maghreb-east', name: 'Eastern Maghreb fringe' },
        ],
      },
      {
        year: -220,
        label: 'Before Second Punic War',
        approximation: 'schematic',
        regions: [
          { id: 'carthage-core', name: 'Carthage / Tunisia' },
          { id: 'iberia', name: 'Iberian fringe' },
        ],
      },
    ],
    timelineItemIds: ['carthage'],
    sources: [
      { title: 'Wikipedia — Ancient Carthage', url: 'https://en.wikipedia.org/wiki/Ancient_Carthage' },
    ],
  },
  {
    id: 'sassanid-empire',
    name: 'Sassanid Empire',
    color: '#9D174D',
    type: 'empire',
    description:
      'Late antique Iranian empire rivaling Rome and Byzantium — schematic Persia–Mesopotamia core.',
    keyYears: [224, 400, 620, 651],
    overlays: [
      {
        year: 400,
        label: 'Sassanid high',
        approximation: 'schematic',
        regions: [
          { id: 'persia', name: 'Iranian plateau' },
          { id: 'mesopotamia', name: 'Mesopotamia' },
          { id: 'parthia-east', name: 'Eastern fringe' },
        ],
      },
      {
        year: 620,
        label: 'Late Sassanid',
        approximation: 'schematic',
        regions: [
          { id: 'persia', name: 'Iranian plateau' },
          { id: 'mesopotamia', name: 'Mesopotamia' },
          { id: 'levant', name: 'Levant fringe' },
          { id: 'egypt', name: 'Egypt (briefly)' },
        ],
      },
    ],
    timelineItemIds: ['sassanid'],
    sources: [
      { title: 'Wikipedia — Sasanian Empire', url: 'https://en.wikipedia.org/wiki/Sasanian_Empire' },
    ],
  },
  {
    id: 'umayyad-caliphate',
    name: 'Umayyad Caliphate',
    color: '#115E59',
    type: 'empire',
    description:
      'Early Islamic caliphate spanning Iberia to Central Asia — schematic Maghreb–Near East–Iberia arc.',
    keyYears: [661, 711, 750],
    overlays: [
      {
        year: 720,
        label: 'Umayyad extent',
        approximation: 'schematic',
        regions: [
          { id: 'iberia', name: 'Al-Andalus / Iberia' },
          { id: 'maghreb-east', name: 'Maghreb' },
          { id: 'egypt', name: 'Egypt' },
          { id: 'levant', name: 'Levant' },
          { id: 'mesopotamia', name: 'Mesopotamia' },
          { id: 'persia', name: 'Iran fringe' },
        ],
      },
    ],
    timelineItemIds: ['umayyad-caliphate'],
    sources: [
      { title: 'Wikipedia — Umayyad Caliphate', url: 'https://en.wikipedia.org/wiki/Umayyad_Caliphate' },
    ],
  },
  {
    id: 'holy-roman-empire',
    name: 'Holy Roman Empire',
    color: '#B45309',
    type: 'empire',
    description:
      'Central European patchwork empire — schematic German–Italian core, not precise princely borders.',
    keyYears: [962, 1050, 1250, 1550],
    overlays: [
      {
        year: 1050,
        label: 'Ottonian–Salian core',
        approximation: 'schematic',
        regions: [
          { id: 'central-europe-hre', name: 'German lands', bbox: [5, 45, 18, 55] },
          { id: 'italy', name: 'Northern Italy fringe' },
        ],
      },
      {
        year: 1250,
        label: 'High medieval HRE',
        approximation: 'schematic',
        regions: [
          { id: 'central-europe-hre', name: 'German lands' },
          { id: 'frankish-east', name: 'East Francia fringe' },
        ],
      },
    ],
    timelineItemIds: ['holy-roman-empire'],
    sources: [
      { title: 'Wikipedia — Holy Roman Empire', url: 'https://en.wikipedia.org/wiki/Holy_Roman_Empire' },
    ],
  },
  {
    id: 'portuguese-empire',
    name: 'Portuguese Empire',
    color: '#16A34A',
    type: 'empire',
    description:
      'Early modern oceanic empire — schematic Iberian home plus Brazilian and African footholds.',
    keyYears: [1415, 1500, 1700, 1822],
    overlays: [
      {
        year: 1500,
        label: 'Age of Discovery',
        approximation: 'schematic',
        regions: [
          { id: 'iberia', name: 'Portugal / Iberia west' },
          { id: 'brazil-coast', name: 'Brazilian coast', bbox: [-50, -25, -35, -5] },
          { id: 'west-africa-coast', name: 'West African forts', bbox: [-18, 4, -5, 15] },
        ],
      },
      {
        year: 1700,
        label: 'Brazil & Atlantic',
        approximation: 'schematic',
        regions: [
          { id: 'iberia', name: 'Portugal' },
          { id: 'brazil-coast', name: 'Brazil' },
          { id: 'west-africa-coast', name: 'West Africa fringe' },
        ],
      },
    ],
    timelineItemIds: ['portugal'],
    sources: [
      { title: 'Wikipedia — Portuguese Empire', url: 'https://en.wikipedia.org/wiki/Portuguese_Empire' },
    ],
  },
  {
    id: 'dutch-republic',
    name: 'Dutch Republic / Empire',
    color: '#F97316',
    type: 'empire',
    description:
      'Dutch Golden Age maritime power — schematic Low Countries plus East Indies footholds.',
    keyYears: [1581, 1650, 1700, 1795],
    overlays: [
      {
        year: 1650,
        label: 'Dutch Golden Age',
        approximation: 'schematic',
        regions: [
          { id: 'low-countries', name: 'Low Countries', bbox: [3, 50, 8, 54] },
          { id: 'java-bali', name: 'East Indies / Java', bbox: [105, -9, 116, -5] },
        ],
      },
      {
        year: 1700,
        label: 'VOC peak',
        approximation: 'schematic',
        regions: [
          { id: 'low-countries', name: 'Low Countries' },
          { id: 'java-bali', name: 'Java / Spice Islands fringe' },
          { id: 'south-africa', name: 'Cape fringe' },
        ],
      },
    ],
    timelineItemIds: ['dutch-republic'],
    sources: [
      { title: 'Wikipedia — Dutch Empire', url: 'https://en.wikipedia.org/wiki/Dutch_Empire' },
    ],
  },
  {
    id: 'french-colonial',
    name: 'French Colonial Empire',
    color: '#2563EB',
    type: 'empire',
    description:
      'French Atlantic and later African/Asian empire — schematic metro France plus early colonial footholds.',
    keyYears: [1534, 1700, 1830, 1914],
    overlays: [
      {
        year: 1700,
        label: 'First colonial empire',
        approximation: 'schematic',
        regions: [
          { id: 'frankish-west', name: 'Metropolitan France' },
          { id: 'canada-east', name: 'New France fringe' },
          { id: 'west-africa-coast', name: 'West Africa fringe' },
        ],
      },
      {
        year: 1914,
        label: 'Second colonial empire',
        approximation: 'schematic',
        regions: [
          { id: 'frankish-west', name: 'France' },
          { id: 'maghreb-east', name: 'Maghreb' },
          { id: 'west-africa-sahel', name: 'West Africa Sahel' },
          { id: 'mainland-sea', name: 'Indochina fringe' },
        ],
      },
    ],
    timelineItemIds: ['french-colonial'],
    sources: [
      { title: 'Wikipedia — French colonial empire', url: 'https://en.wikipedia.org/wiki/French_colonial_empire' },
    ],
  },
  {
    id: 'safavid-empire',
    name: 'Safavid Empire',
    color: '#5B21B6',
    type: 'empire',
    description:
      'Early modern Iranian empire that shaped Shiʿa identity — schematic Persia core.',
    keyYears: [1501, 1587, 1629, 1736],
    overlays: [
      {
        year: 1620,
        label: 'Safavid golden age',
        approximation: 'schematic',
        regions: [
          { id: 'persia', name: 'Iran / Persia' },
          { id: 'mesopotamia', name: 'Mesopotamia fringe' },
          { id: 'caucasus-south', name: 'South Caucasus fringe', bbox: [43, 38, 50, 43] },
        ],
      },
    ],
    timelineItemIds: ['safavid'],
    sources: [
      { title: 'Wikipedia — Safavid dynasty', url: 'https://en.wikipedia.org/wiki/Safavid_dynasty' },
    ],
  },
  {
    id: 'maya',
    name: 'Maya Civilisation',
    color: '#65A30D',
    type: 'civilization',
    description:
      'Mesoamerican civilisation of the Yucatán and highlands — schematic Classic-period core.',
    keyYears: [-2000, -1500, -500, 250, 800, 1500],
    overlays: [
      {
        year: -2000,
        label: 'Archaic / early Maya fringe',
        approximation: 'schematic',
        regions: [
          { id: 'yucatan', name: 'Yucatán / Maya lowlands', bbox: [-92, 14, -86, 22] },
        ],
      },
      {
        year: -1500,
        label: 'Early Preclassic Maya',
        approximation: 'schematic',
        regions: [
          { id: 'yucatan', name: 'Yucatán / Maya lowlands' },
        ],
      },
      {
        year: -500,
        label: 'Preclassic Maya fringe',
        approximation: 'schematic',
        regions: [
          { id: 'yucatan', name: 'Yucatán / Maya lowlands' },
        ],
      },
      {
        year: 800,
        label: 'Classic Maya',
        approximation: 'schematic',
        regions: [
          { id: 'yucatan', name: 'Yucatán / Maya lowlands' },
          { id: 'mesoamerica', name: 'Southern Mesoamerica fringe' },
        ],
      },
    ],
    timelineItemIds: ['maya'],
    sources: [
      { title: 'Wikipedia — Maya civilization', url: 'https://en.wikipedia.org/wiki/Maya_civilization' },
    ],
  },
  {
    id: 'songhai-empire',
    name: 'Songhai Empire',
    color: '#D97706',
    type: 'empire',
    description:
      'West African Sahel empire succeeding Mali along the Niger bend — schematic Sahel core.',
    keyYears: [1430, 1500, 1591],
    overlays: [
      {
        year: 1500,
        label: 'Songhai height',
        approximation: 'schematic',
        regions: [
          { id: 'west-africa-sahel', name: 'Sahel / Niger bend' },
          { id: 'west-africa-coast', name: 'Gulf of Guinea fringe' },
        ],
      },
    ],
    timelineItemIds: ['songhai'],
    sources: [
      { title: 'Wikipedia — Songhai Empire', url: 'https://en.wikipedia.org/wiki/Songhai_Empire' },
    ],
  },
  {
    id: 'majapahit-empire',
    name: 'Majapahit Empire',
    color: '#E11D48',
    type: 'empire',
    description:
      'Maritime Southeast Asian empire centered on Java — schematic archipelago core.',
    keyYears: [1293, 1350, 1527],
    overlays: [
      {
        year: 1350,
        label: 'Majapahit thalassocracy',
        approximation: 'schematic',
        regions: [
          { id: 'java-bali', name: 'Java / Bali' },
          { id: 'sumatra-south', name: 'Southern Sumatra fringe', bbox: [100, -6, 106, 2] },
        ],
      },
    ],
    timelineItemIds: ['majapahit'],
    sources: [
      { title: 'Wikipedia — Majapahit', url: 'https://en.wikipedia.org/wiki/Majapahit' },
    ],
  },
  {
    id: 'meiji-japan',
    name: 'Imperial Japan',
    color: '#BE185D',
    type: 'empire',
    description:
      'Meiji-to-Shōwa imperial state — schematic home islands plus early overseas footholds.',
    keyYears: [1868, 1905, 1914, 1945],
    overlays: [
      {
        year: 1905,
        label: 'After Russo-Japanese War',
        approximation: 'schematic',
        regions: [
          { id: 'japan-honshu', name: 'Japanese home islands', bbox: [129, 30, 146, 46] },
          { id: 'korea-peninsula', name: 'Korea (protectorate fringe)', bbox: [124, 33, 130, 43] },
          { id: 'manchuria', name: 'Manchuria fringe' },
        ],
      },
      {
        year: 1914,
        label: 'Early 20th-century empire',
        approximation: 'schematic',
        regions: [
          { id: 'japan-honshu', name: 'Home islands' },
          { id: 'korea-peninsula', name: 'Korea' },
          { id: 'manchuria', name: 'Manchuria fringe' },
        ],
      },
    ],
    timelineItemIds: ['meiji-japan'],
    sources: [
      { title: 'Wikipedia — Empire of Japan', url: 'https://en.wikipedia.org/wiki/Empire_of_Japan' },
    ],
  },

  // --- Day 19: early Bronze Age fill (3000–1200 BCE) ---
  {
    id: 'mesopotamia',
    name: 'Mesopotamia',
    color: '#0F766E',
    type: 'civilization',
    description:
      'Cradle of urban civilisation between the Tigris and Euphrates — schematic Sumer / Akkad / Babylon cores (not precise dynastic borders).',
    keyYears: [-3500, -3000, -2500, -1800, -1200, -539],
    overlays: [
      {
        year: -3000,
        label: 'Early Sumerian cities',
        approximation: 'schematic',
        regions: [
          { id: 'lower-mesopotamia', name: 'Lower Mesopotamia', bbox: [44, 30, 48, 34] },
        ],
      },
      {
        year: -2500,
        label: 'Early Dynastic Sumer',
        approximation: 'schematic',
        regions: [
          { id: 'lower-mesopotamia', name: 'Lower Mesopotamia' },
          { id: 'mesopotamia', name: 'Mesopotamia basin' },
        ],
      },
      {
        year: -1800,
        label: 'Old Babylonian world',
        approximation: 'schematic',
        regions: [
          { id: 'mesopotamia', name: 'Mesopotamia' },
          { id: 'levant', name: 'Fertile Crescent fringe' },
        ],
      },
      {
        year: -1200,
        label: 'Late Bronze Mesopotamia',
        approximation: 'schematic',
        regions: [
          { id: 'mesopotamia', name: 'Mesopotamia' },
          { id: 'near-east', name: 'Near East fringe' },
        ],
      },
    ],
    timelineItemIds: ['mesopotamia'],
    sources: [
      { title: 'Wikipedia — Mesopotamia', url: 'https://en.wikipedia.org/wiki/Mesopotamia' },
    ],
  },
  {
    id: 'shang-china',
    name: 'Shang Dynasty',
    color: '#7C2D12',
    type: 'empire',
    description:
      'Bronze Age Chinese dynasty on the Yellow River plain — schematic north-China core.',
    keyYears: [-1600, -1400, -1200, -1046],
    overlays: [
      {
        year: -1500,
        label: 'Shang Yellow River core',
        approximation: 'schematic',
        regions: [
          { id: 'north-china', name: 'North China plain' },
          { id: 'yellow-river-core', name: 'Yellow River core', bbox: [108, 32, 118, 40] },
        ],
      },
      {
        year: -1200,
        label: 'Late Shang',
        approximation: 'schematic',
        regions: [
          { id: 'north-china', name: 'North China plain' },
        ],
      },
    ],
    timelineItemIds: ['ancient-china-shang'],
    sources: [
      { title: 'Wikipedia — Shang dynasty', url: 'https://en.wikipedia.org/wiki/Shang_dynasty' },
    ],
  },
  {
    id: 'phoenicia',
    name: 'Phoenicia',
    color: '#0369A1',
    type: 'civilization',
    description:
      'Levantine seafaring city-states — schematic coastal strip (Tyre–Sidon–Byblos), not a unitary empire.',
    keyYears: [-1500, -1200, -800, -300],
    overlays: [
      {
        year: -1500,
        label: 'Late Bronze Levant coast',
        approximation: 'schematic',
        regions: [
          { id: 'phoenician-coast', name: 'Phoenician coast', bbox: [34.5, 32.5, 36.5, 35.5] },
          { id: 'levant', name: 'Levant fringe' },
        ],
      },
      {
        year: -1000,
        label: 'Iron Age Phoenician cities',
        approximation: 'schematic',
        regions: [
          { id: 'phoenician-coast', name: 'Phoenician coast' },
        ],
      },
    ],
    timelineItemIds: ['phoenicia'],
    sources: [
      { title: 'Wikipedia — Phoenicia', url: 'https://en.wikipedia.org/wiki/Phoenicia' },
    ],
  },
  {
    id: 'olmec',
    name: 'Olmec Civilisation',
    color: '#854D0E',
    type: 'civilization',
    description:
      'Formative Mesoamerican culture of the Gulf lowlands — schematic Olmec heartland.',
    keyYears: [-1500, -1200, -900, -400],
    overlays: [
      {
        year: -1500,
        label: 'Early Olmec heartland',
        approximation: 'schematic',
        regions: [
          { id: 'olmec-heartland', name: 'Gulf Olmec heartland', bbox: [-96, 16, -92, 20] },
        ],
      },
      {
        year: -900,
        label: 'Olmec florescence',
        approximation: 'schematic',
        regions: [
          { id: 'olmec-heartland', name: 'Gulf Olmec heartland' },
          { id: 'mesoamerica', name: 'Mesoamerica fringe' },
        ],
      },
    ],
    timelineItemIds: ['olmec'],
    sources: [
      { title: 'Wikipedia — Olmec', url: 'https://en.wikipedia.org/wiki/Olmec' },
    ],
  },
  {
    id: 'kush',
    name: 'Kingdom of Kush',
    color: '#166534',
    type: 'empire',
    description:
      'Nubian kingdom south of Egypt — schematic Upper Nile / Nubia core near the end of the Bronze Age window.',
    keyYears: [-1070, -750, -590, 350],
    overlays: [
      {
        year: -1000,
        label: 'Early Kush / Nubia',
        approximation: 'schematic',
        regions: [
          { id: 'nubia', name: 'Nubia / Upper Nile', bbox: [30, 12, 36, 22] },
        ],
      },
      {
        year: -700,
        label: 'Napatan Kush',
        approximation: 'schematic',
        regions: [
          { id: 'nubia', name: 'Nubia / Upper Nile' },
          { id: 'egypt', name: 'Egypt fringe' },
        ],
      },
    ],
    timelineItemIds: ['kush'],
    sources: [
      { title: 'Wikipedia — Kingdom of Kush', url: 'https://en.wikipedia.org/wiki/Kingdom_of_Kush' },
    ],
  },
];

/**
 * Schematic region rings — intentionally rough [lng, lat] GeoJSON order.
 * Closed rings (first point repeated at end). Not GIS-accurate borders.
 */
export const REGION_RINGS = {
  // --- Roman / Mediterranean ---
  italy: [
    [8.2, 44.0], [9.5, 45.8], [12.5, 46.5], [13.8, 45.6], [12.4, 43.8],
    [15.0, 42.0], [16.5, 41.0], [18.3, 40.2], [17.2, 38.9], [15.5, 38.0],
    [13.0, 37.5], [12.5, 38.2], [14.0, 40.5], [12.0, 41.8], [10.5, 42.8],
    [8.5, 43.5], [8.2, 44.0],
  ],
  mediterranean: [
    [-9.5, 36.0], [-8.0, 43.5], [-1.0, 48.5], [5.0, 51.0], [12.0, 54.0],
    [20.0, 52.0], [28.0, 48.0], [36.0, 46.0], [42.0, 43.0], [44.0, 38.0],
    [42.0, 32.0], [36.0, 28.0], [30.0, 25.0], [20.0, 26.0], [10.0, 30.0],
    [3.0, 32.0], [-5.0, 34.0], [-9.5, 36.0],
  ],
  'near-east': [
    [34.0, 31.0], [35.5, 37.0], [38.0, 41.0], [44.0, 40.0], [48.0, 37.0],
    [46.0, 32.0], [42.0, 30.0], [38.0, 29.5], [34.0, 31.0],
  ],

  // --- China / Silk Road ---
  'north-china': [
    [105, 34], [110, 41], [118, 42], [122, 40], [121, 35], [115, 32], [108, 33], [105, 34],
  ],
  'central-china': [
    [102, 26], [108, 34], [118, 34], [120, 28], [116, 24], [108, 24], [102, 26],
  ],
  'china-proper': [
    [100, 22], [103, 32], [108, 40], [115, 42], [122, 41], [122, 30],
    [120, 24], [112, 21], [105, 22], [100, 22],
  ],
  'south-china': [
    [105, 20], [108, 30], [118, 32], [122, 28], [120, 21], [112, 20], [105, 20],
  ],
  'tang-north': [
    [100, 36], [108, 44], [122, 45], [125, 40], [118, 36], [108, 35], [100, 36],
  ],
  tarim: [
    [75, 37], [80, 42], [92, 43], [95, 40], [92, 36], [82, 36], [75, 37],
  ],
  manchuria: [
    [120, 40], [122, 48], [132, 50], [135, 46], [130, 40], [122, 40], [120, 40],
  ],

  // --- Parthia / India ---
  'parthia-east': [
    [55, 32], [58, 39], [68, 40], [70, 35], [65, 30], [58, 30], [55, 32],
  ],
  'kushan-core': [
    [65, 32], [68, 39], [76, 40], [78, 35], [74, 30], [68, 30], [65, 32],
  ],
  'north-india': [
    [70, 26], [72, 33], [80, 34], [88, 30], [86, 24], [78, 22], [72, 24], [70, 26],
  ],
  'india-north': [
    [72, 22], [74, 32], [86, 32], [90, 28], [88, 22], [80, 20], [74, 20], [72, 22],
  ],
  'india-central': [
    [74, 18], [76, 26], [86, 26], [88, 20], [84, 16], [78, 16], [74, 18],
  ],
  'india-deccan': [
    [74, 14], [76, 22], [84, 22], [85, 16], [80, 12], [76, 12], [74, 14],
  ],
  'india-south': [
    [74, 8], [76, 15], [80, 16], [80, 10], [78, 8], [74, 8],
  ],

  // --- Mongol / Central Asia ---
  mongolia: [
    [87, 44], [95, 50], [112, 52], [120, 50], [118, 44], [105, 42], [92, 42], [87, 44],
  ],
  'central-asia': [
    [50, 36], [55, 46], [70, 48], [80, 45], [78, 38], [65, 35], [55, 35], [50, 36],
  ],
  'eurasian-steppe': [
    [30, 42], [40, 50], [70, 55], [100, 55], [130, 52], [135, 45],
    [120, 38], [90, 36], [60, 35], [40, 38], [30, 42],
  ],
  persia: [
    [44, 26], [46, 38], [55, 40], [62, 37], [60, 28], [52, 25], [44, 26],
  ],

  // --- Abbasid / Near East ---
  mesopotamia: [
    [38.5, 30.5], [40, 36], [46, 37], [48, 33], [46, 30], [42, 30], [38.5, 30.5],
  ],
  levant: [
    [34, 30.5], [35, 36.5], [39, 37], [42, 34], [40, 31], [36, 30], [34, 30.5],
  ],
  egypt: [
    [25, 22], [28, 31.5], [34, 31.5], [35, 28], [33, 22], [29, 22], [25, 22],
  ],
  'maghreb-east': [
    [5, 30], [8, 36], [20, 37], [25, 33], [22, 30], [10, 30], [5, 30],
  ],

  // --- Byzantine / Frankish ---
  'byzantine-core': [
    [20, 36], [22, 44], [30, 46], [40, 42], [42, 36], [35, 35], [26, 35], [20, 36],
  ],
  'frankish-west': [
    [-5, 43], [-4, 50], [4, 51], [8, 48], [6, 43], [0, 42], [-5, 43],
  ],
  'frankish-east': [
    [5, 46], [8, 53], [16, 54], [18, 50], [14, 46], [8, 45], [5, 46],
  ],
  'anatolia-balkans': [
    [18, 36], [20, 45], [30, 46], [42, 42], [45, 36], [38, 35], [26, 35], [18, 36],
  ],

  // --- Africa / SE Asia ---
  'west-africa-sahel': [
    [-12, 12], [-10, 18], [0, 20], [4, 16], [2, 11], [-6, 10], [-12, 12],
  ],
  'mainland-sea': [
    [100, 11], [102, 17], [108, 18], [110, 14], [107, 10], [102, 10], [100, 11],
  ],
  'south-africa': [
    [16, -34], [18, -24], [30, -22], [32, -28], [28, -35], [20, -35], [16, -34],
  ],

  // --- Americas ---
  andes: [
    [-81, -18], [-79, -5], [-77, 1], [-72, 2], [-68, -5], [-69, -15],
    [-72, -22], [-78, -20], [-81, -18],
  ],
  peru: [
    [-80, -16], [-78, -6], [-74, -3], [-69, -8], [-70, -17], [-76, -18], [-80, -16],
  ],
  mesoamerica: [
    [-110, 16], [-108, 26], [-96, 28], [-86, 22], [-90, 14], [-100, 14], [-110, 16],
  ],
  'valley-mexico': [
    [-102, 17], [-100, 21], [-96, 22], [-94, 19], [-96, 16], [-100, 16], [-102, 17],
  ],
  'southern-cone': [
    [-75, -38], [-72, -22], [-58, -20], [-55, -32], [-62, -40], [-72, -40], [-75, -38],
  ],
  'east-north-america': [
    [-80, 32], [-78, 46], [-65, 48], [-60, 40], [-70, 30], [-78, 30], [-80, 32],
  ],
  'canada-east': [
    [-80, 44], [-78, 54], [-60, 55], [-55, 48], [-62, 42], [-75, 42], [-80, 44],
  ],

  // --- Iberia / Britain / Russia / Australia ---
  iberia: [
    [-10, 37], [-9, 43], [-2, 44], [3, 42], [2, 37], [-5, 36], [-10, 37],
  ],
  'british-isles': [
    [-8, 51], [-7, 58], [-2, 59], [2, 56], [1, 51], [-3, 50], [-8, 51],
  ],
  'russia-european': [
    [28, 50], [30, 66], [50, 68], [60, 62], [55, 50], [40, 48], [28, 50],
  ],
  'siberia-west': [
    [60, 52], [62, 66], [88, 68], [90, 56], [78, 50], [65, 50], [60, 52],
  ],
  'siberia-belt': [
    [60, 52], [70, 68], [110, 70], [140, 66], [135, 52], [100, 50], [70, 50], [60, 52],
  ],
  'australia-east': [
    [140, -36], [142, -16], [152, -12], [154, -28], [150, -38], [144, -38], [140, -36],
  ],

  // --- Day 17 densification rings ---
  anatolia: [
    [26, 36], [28, 42], [36, 42], [44, 40], [42, 36], [35, 35], [28, 35], [26, 36],
  ],
  'nile-upper': [
    [30, 12], [32, 22], [36, 22], [35, 12], [32, 10], [30, 12],
  ],
  greece: [
    [19, 36], [20, 41], [24, 42], [28, 41], [27, 36], [24, 35], [21, 35], [19, 36],
  ],
  'carthage-core': [
    [8, 33], [9, 37.5], [12, 38], [11, 33], [9, 32], [8, 33],
  ],
  'central-europe-hre': [
    [5, 46], [7, 54], [15, 55], [18, 50], [16, 46], [10, 45], [5, 46],
  ],
  'brazil-coast': [
    [-50, -24], [-48, -8], [-38, -5], [-35, -16], [-40, -25], [-48, -25], [-50, -24],
  ],
  'west-africa-coast': [
    [-18, 5], [-16, 14], [-8, 15], [-5, 8], [-8, 4], [-14, 4], [-18, 5],
  ],
  'low-countries': [
    [3.2, 50.5], [3.5, 53.5], [7.2, 53.8], [7.5, 51], [5.5, 50.2], [3.2, 50.5],
  ],
  'java-bali': [
    [105, -8.5], [106, -5.5], [115, -5], [116, -8], [112, -9], [106, -9], [105, -8.5],
  ],
  'sumatra-south': [
    [100, -5], [102, 1], [106, 2], [105, -4], [102, -6], [100, -5],
  ],
  yucatan: [
    [-92, 15], [-91, 21.5], [-87, 22], [-86, 18], [-88, 14], [-91, 14], [-92, 15],
  ],
  'caucasus-south': [
    [43, 39], [44, 42.5], [49, 42], [50, 39], [47, 38], [43, 39],
  ],
  'japan-honshu': [
    [129, 31], [131, 42], [141, 46], [146, 43], [142, 35], [136, 33], [131, 30], [129, 31],
  ],
  'korea-peninsula': [
    [124, 34], [126, 42], [130, 43], [129, 35], [127, 33], [124, 34],
  ],

  // --- Day 19 early Bronze Age rings ---
  'lower-mesopotamia': [
    [44, 30.5], [45, 33.5], [48, 34], [48, 31], [46, 30], [44, 30.5],
  ],
  'yellow-river-core': [
    [108, 33], [110, 39], [116, 40], [118, 36], [115, 32], [110, 32], [108, 33],
  ],
  'phoenician-coast': [
    [34.6, 32.8], [34.8, 35.2], [36.2, 35.4], [36.0, 33.0], [35.2, 32.6], [34.6, 32.8],
  ],
  'olmec-heartland': [
    [-96, 16.5], [-95.5, 19.5], [-92.5, 20], [-92, 17], [-94, 16], [-96, 16.5],
  ],
  nubia: [
    [30, 13], [31, 21], [35, 22], [36, 16], [34, 12], [31, 12], [30, 13],
  ],
};

/** Convert bbox [west,south,east,north] to a closed GeoJSON ring [lng,lat][]. */
export function bboxToRing(bbox) {
  if (!Array.isArray(bbox) || bbox.length !== 4) return null;
  const [w, s, e, n] = bbox.map(Number);
  if ([w, s, e, n].some((v) => !Number.isFinite(v))) return null;
  // Clockwise in lng/lat (matches REGION_RINGS / Globe.gl caps)
  return [
    [w, s],
    [w, n],
    [e, n],
    [e, s],
    [w, s],
  ];
}

function ensureClosed(ring) {
  if (!ring || ring.length < 3) return null;
  const out = ring.map(([lng, lat]) => [Number(lng), Number(lat)]);
  const [fLng, fLat] = out[0];
  const [lLng, lLat] = out[out.length - 1];
  if (fLng !== lLng || fLat !== lLat) out.push([fLng, fLat]);
  return out.length >= 4 ? out : null;
}

/**
 * Resolve a region ref to a closed [lng,lat] ring (schematic).
 * Prefer inline ring, then per-snapshot bbox (so keyframes can morph), then REGION_RINGS.
 */
export function resolveRegionRing(region) {
  if (region == null) return null;
  let ring = null;
  if (typeof region === 'string') {
    ring = ensureClosed(REGION_RINGS[region] || null);
  } else if (typeof region === 'object') {
    if (Array.isArray(region.ring)) ring = ensureClosed(region.ring);
    // Day 20: honour snapshot bbox before shared named rings so empires visibly grow/shrink.
    else if (region.bbox) ring = ensureClosed(bboxToRing(region.bbox));
    else if (REGION_RINGS[region.id]) ring = ensureClosed(REGION_RINGS[region.id]);
  }
  // Critical: Globe.gl wants CW exteriors; planar-CCW (bbox) washes the planet.
  return ensureClockwise(ring);
}

/**
 * Build Globe.gl polygon features for entities active at `year`.
 * Day 20: morph region rings between bracketing overlay keyframes; soft dissolve at lifespan edges.
 * @returns {object[]} GeoJSON-like features with color/opacity props for Globe.gl accessors
 */
export function getOverlayPolygonFeatures(year, entities = spatialEntities) {
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) return [];

  const active = getActiveOverlaysAtYear(y, entities);
  const features = [];

  for (const { entity, overlay: nearestOverlay } of active) {
    const lifespan = getEntityLifespan(entity);
    const morphed = morphEntityAtYear(
      entity,
      y,
      resolveRegionRing,
      lifespan,
      OVERLAY_EDGE_GRACE,
    );
    if (!morphed.length) continue;

    for (const part of morphed) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [part.ring],
        },
        entityId: entity.id,
        name: entity.name,
        regionId: part.regionId,
        regionName: part.regionName,
        color: entity.color,
        opacity: part.opacity,
        approximation: part.approximation || nearestOverlay?.approximation || 'rough',
        overlayYear: y,
        morphT: part.morphT,
        properties: {
          entityId: entity.id,
          name: entity.name,
          regionId: part.regionId,
          regionName: part.regionName,
          color: entity.color,
          opacity: part.opacity,
          approximation: part.approximation || nearestOverlay?.approximation || 'rough',
          morphT: part.morphT,
        },
      });
    }
  }

  return features;
}

/** Soft edge (years) past first/last overlay keyframe. Not a ±80 sticky window. */
export const OVERLAY_EDGE_GRACE = 15;

/**
 * @deprecated Day 18 — was ±80 sticky activation; now an alias of OVERLAY_EDGE_GRACE.
 * Do not use as a “keep empire on” radius past death.
 */
export const OVERLAY_ACTIVE_WINDOW = OVERLAY_EDGE_GRACE;

/** @type {Map<string, { id: string, start?: number, end?: number }>} */
const timelineItemById = new Map();
for (const item of civilisations) timelineItemById.set(item.id, item);
for (const item of warsItems) timelineItemById.set(item.id, item);

/**
 * Inclusive [start, end] years when an entity may appear on the globe.
 * Intersection of:
 *   1) linked timeline item lifespan (union of timelineItemIds start/end), when any resolve
 *   2) [firstOverlay − grace, lastOverlay + grace]
 * So empires dissolve near their last keyframe / civ end — not ±80 years later.
 *
 * @param {SpatialEntity} entity
 * @returns {{ start: number, end: number }}
 */
export function getEntityLifespan(entity) {
  let start = -Infinity;
  let end = Infinity;

  const overlayYears = (entity?.overlays || [])
    .map((o) => Number(o?.year))
    .filter((y) => Number.isFinite(y));
  if (overlayYears.length) {
    start = Math.min(...overlayYears) - OVERLAY_EDGE_GRACE;
    end = Math.max(...overlayYears) + OVERLAY_EDGE_GRACE;
  }

  const ids = entity?.timelineItemIds || [];
  let tStart = Infinity;
  let tEnd = -Infinity;
  let linked = false;
  for (const id of ids) {
    const item = timelineItemById.get(id);
    if (!item) continue;
    linked = true;
    if (Number.isFinite(item.start)) tStart = Math.min(tStart, item.start);
    if (Number.isFinite(item.end)) tEnd = Math.max(tEnd, item.end);
  }
  if (linked && Number.isFinite(tStart) && Number.isFinite(tEnd)) {
    start = Math.max(start, tStart);
    end = Math.min(end, tEnd);
  }

  return { start, end };
}

/**
 * Format a CE/BCE year for display.
 * @param {number} year
 */
export function formatOverlayYear(year) {
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) return '';
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return '1 BCE / 1 CE';
  return `${y.toLocaleString()} CE`;
}

/**
 * Entities whose lifespan includes `year` (timeline ∩ overlay keyframe span ± grace).
 * Nearest overlay supplies sidebar label; polygon geometry morphs in getOverlayPolygonFeatures (Day 20).
 * @param {number} year
 * @param {SpatialEntity[]} [entities]
 * @returns {{ entity: SpatialEntity, overlay: OverlaySnapshot|null, distance: number }[]}
 */
export function getActiveOverlaysAtYear(year, entities = spatialEntities) {
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) return [];

  const results = [];
  for (const entity of entities) {
    const { start, end } = getEntityLifespan(entity);
    if (y < start || y > end) continue;

    let bestOverlay = null;
    let bestDist = Infinity;
    for (const overlay of entity.overlays || []) {
      const d = Math.abs(overlay.year - y);
      if (d < bestDist) {
        bestDist = d;
        bestOverlay = overlay;
      }
    }

    results.push({ entity, overlay: bestOverlay, distance: bestDist });
  }

  results.sort((a, b) => a.distance - b.distance || a.entity.name.localeCompare(b.entity.name));
  return results;
}
