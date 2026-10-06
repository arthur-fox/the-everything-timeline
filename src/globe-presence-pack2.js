/**
 * Day 31 — Presence densify (human-atlas layer 3, pack 2).
 *
 * Ten more schematic inhabited-footprint hearths/belts so the Presence layer
 * isn't only the classic river-valley "cradles": Yangtze rice belt, Ethiopian
 * highlands, East/Southern African farming belt, Eastern Woodlands, Amazonia,
 * Japan, Aboriginal Australia, New Guinea highlands, the Eurasian steppe and
 * the Pacific islands. Still approximate and honest — not GIS, not
 * ethnolinguistic (that's Peoples), and no invented timelineItemIds.
 * Island / distant fragments stay separate region ids (no ocean-spanning rings).
 */

/** @typedef {import('./globe-overlays.js').SpatialEntity} SpatialEntity */

const r = (id, name, ring) => ({ id, name, ring });
const k = (year, label, regions) => ({ year, label, approximation: 'schematic', regions });

/** Presence pack 2 ids (Day 31). */
export const PRESENCE_PACK_2_IDS = [
  'yangtze-presence',
  'ethiopian-highlands-presence',
  'east-southern-africa-presence',
  'eastern-woodlands-presence',
  'amazonia-presence',
  'japan-archipelago-presence',
  'aboriginal-australia-presence',
  'new-guinea-highlands-presence',
  'eurasian-steppe-presence',
  'pacific-islands-presence',
];

/** @type {SpatialEntity[]} */
export const presencePack2Entities = [
  {
    id: 'yangtze-presence',
    name: 'Yangtze rice belt presence',
    color: '#065F46',
    type: 'presence',
    description:
      'Schematic inhabited footprint of the middle and lower Yangtze rice-farming belt, spreading upriver into Sichuan and south of the river over time.',
    keyYears: [-3000, -1000, 500, 1200],
    overlays: [
      k(-3000, 'Neolithic Yangtze rice hearths (approx.)', [
        r('yz-middle', 'Middle Yangtze', [[110, 28], [111, 32], [116, 32], [117, 29], [113, 27], [110, 28]]),
        r('yz-lower', 'Lower Yangtze / Liangzhu fringe', [[118, 29], [119, 32], [122, 32], [122, 30], [120, 28], [118, 29]]),
      ]),
      k(-1000, 'Bronze Age Yangtze belt', [
        r('yz-middle', 'Middle Yangtze', [[108, 27], [109, 32], [116, 33], [117, 29], [112, 26], [108, 27]]),
        r('yz-lower', 'Lower Yangtze', [[117, 28], [118, 33], [122, 33], [122, 29], [119, 27], [117, 28]]),
        r('yz-sichuan', 'Sichuan basin (Sanxingdui fringe)', [[103, 29], [104, 32], [107, 32], [107, 29], [105, 28], [103, 29]]),
      ]),
      k(500, 'Early medieval Yangtze belt', [
        r('yz-middle', 'Middle Yangtze', [[108, 26], [109, 32], [116, 33], [117, 28], [112, 25], [108, 26]]),
        r('yz-lower', 'Lower Yangtze / Jiangnan', [[116, 27], [117, 33], [122, 33], [122, 28], [119, 26], [116, 27]]),
        r('yz-sichuan', 'Sichuan basin', [[102, 28], [103, 32], [108, 32], [108, 29], [105, 27], [102, 28]]),
      ]),
      k(1200, 'Song-era southern China inhabited belt', [
        r('yz-middle', 'Middle Yangtze', [[108, 26], [109, 32], [116, 33], [117, 28], [112, 25], [108, 26]]),
        r('yz-lower', 'Jiangnan', [[116, 26], [117, 33], [122, 33], [122, 27], [119, 25], [116, 26]]),
        r('yz-sichuan', 'Sichuan basin', [[102, 28], [103, 32], [108, 32], [108, 29], [105, 27], [102, 28]]),
        r('yz-south', 'Lingnan / south coast fringe', [[109, 21], [110, 25], [117, 25], [118, 23], [114, 21], [109, 21]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Yangtze', url: 'https://en.wikipedia.org/wiki/Yangtze' },
      { title: 'Wikipedia — Liangzhu culture', url: 'https://en.wikipedia.org/wiki/Liangzhu_culture' },
    ],
  },
  {
    id: 'ethiopian-highlands-presence',
    name: 'Ethiopian highlands presence',
    color: '#86EFAC',
    type: 'presence',
    description:
      'Schematic inhabited footprint of the Ethiopian and Eritrean highlands — teff and ensete farming country, from early hearths to the Aksumite and later highland belt.',
    keyYears: [-3000, -500, 500, 1400],
    overlays: [
      k(-3000, 'Early highland farming hearths (approx.)', [
        r('eth-north', 'Northern highlands', [[37, 12], [38, 15], [40, 15], [40, 13], [39, 12], [37, 12]]),
      ]),
      k(-500, 'Pre-Aksumite highland belt', [
        r('eth-north', 'Tigray / Eritrean highlands', [[36, 12], [37, 16], [40, 16], [41, 13], [39, 11], [36, 12]]),
      ]),
      k(500, 'Aksum-era highlands', [
        r('eth-north', 'Northern highlands', [[36, 11], [37, 16], [40, 16], [41, 13], [39, 10], [36, 11]]),
        r('eth-central', 'Central highlands fringe', [[37, 8], [37, 10], [40, 10], [40, 8], [38, 7], [37, 8]]),
      ]),
      k(1400, 'Medieval highland belt', [
        r('eth-north', 'Northern highlands', [[36, 11], [37, 16], [40, 16], [41, 13], [39, 10], [36, 11]]),
        r('eth-central', 'Shewa / central highlands', [[36, 7], [37, 10], [41, 10], [42, 8], [39, 6], [36, 7]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Ethiopian Highlands', url: 'https://en.wikipedia.org/wiki/Ethiopian_Highlands' },
    ],
  },
  {
    id: 'east-southern-africa-presence',
    name: 'East & Southern Africa farming presence',
    color: '#FDA4AF',
    type: 'presence',
    description:
      'Schematic inhabited footprint of the iron-using farming belts of the African Great Lakes, Zambezi plateau and Swahili coast — separate hearths, not one continental blob.',
    keyYears: [-500, 500, 1200, 1700],
    overlays: [
      k(-500, 'Great Lakes iron-farming hearth (approx.)', [
        r('esa-lakes', 'Interlacustrine Great Lakes', [[29, -3], [30, 1], [33, 1], [34, -2], [32, -4], [29, -3]]),
      ]),
      k(500, 'Eastern farming belt', [
        { ...r('esa-lakes', 'Great Lakes', [[29, -4], [29, 2], [34, 2], [35, -2], [32, -5], [29, -4]]), holes: ['lake-victoria'] },
        r('esa-coast', 'East African coast fringe', [[38, -8], [39, -3], [41, -3], [41, -6], [39, -9], [38, -8]]),
      ]),
      k(1200, 'Great Zimbabwe / Swahili era', [
        { ...r('esa-lakes', 'Great Lakes', [[29, -4], [29, 2], [34, 2], [35, -2], [32, -5], [29, -4]]), holes: ['lake-victoria'] },
        r('esa-coast', 'Swahili coast', [[38, -10], [39, -2], [42, -1], [41, -6], [40, -10], [38, -10]]),
        r('esa-zambezi', 'Zimbabwe plateau', [[27, -21], [28, -16], [33, -16], [33, -20], [30, -22], [27, -21]]),
      ]),
      k(1700, 'Early modern eastern / southern belts', [
        { ...r('esa-lakes', 'Great Lakes kingdoms belt', [[29, -5], [29, 3], [35, 3], [36, -2], [32, -6], [29, -5]]), holes: ['lake-victoria'] },
        r('esa-coast', 'Swahili coast', [[38, -10], [39, -2], [42, -1], [41, -6], [40, -10], [38, -10]]),
        r('esa-zambezi', 'Zambezi / Zimbabwe plateau', [[26, -22], [27, -15], [34, -15], [34, -20], [30, -23], [26, -22]]),
        r('esa-south-east', 'Southeast African coast / highveld fringe', [[27, -31], [28, -25], [32, -25], [33, -28], [30, -32], [27, -31]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Bantu expansion', url: 'https://en.wikipedia.org/wiki/Bantu_expansion' },
      { title: 'Wikipedia — Great Zimbabwe', url: 'https://en.wikipedia.org/wiki/Great_Zimbabwe' },
    ],
  },
  {
    id: 'eastern-woodlands-presence',
    name: 'Eastern Woodlands presence',
    color: '#C4B5FD',
    type: 'presence',
    description:
      'Schematic inhabited footprint of the North American Eastern Woodlands — Adena/Hopewell river valleys and the Mississippian mound-building belt (pre-colonial, not modern settlement).',
    keyYears: [-1000, 200, 1100, 1500],
    overlays: [
      k(-1000, 'Late Archaic / Early Woodland valleys (approx.)', [
        r('ew-ohio', 'Ohio valley', [[-90, 36], [-89, 41], [-82, 41], [-81, 37], [-85, 35], [-90, 36]]),
      ]),
      k(200, 'Hopewell interaction belt', [
        r('ew-ohio', 'Ohio / Illinois valleys', [[-92, 35], [-91, 42], [-80, 42], [-79, 37], [-85, 34], [-92, 35]]),
      ]),
      k(1100, 'Mississippian belt (Cahokia era)', [
        r('ew-ohio', 'Ohio valley', [[-87, 36], [-86, 42], [-78, 42], [-77, 37], [-82, 35], [-87, 36]]),
        r('ew-mississippi', 'Middle Mississippi / Cahokia', [[-94, 30], [-93, 40], [-87, 40], [-87, 32], [-89, 29], [-94, 30]]),
        r('ew-southeast', 'Southeastern mound belt', [[-87, 30], [-86, 35], [-79, 35], [-80, 31], [-83, 29], [-87, 30]]),
      ]),
      k(1500, 'Late Mississippian / Woodlands belt', [
        r('ew-ohio', 'Ohio valley / Great Lakes fringe', [[-87, 37], [-86, 44], [-76, 44], [-75, 38], [-81, 36], [-87, 37]]),
        r('ew-mississippi', 'Lower / middle Mississippi', [[-94, 30], [-93, 38], [-88, 38], [-87, 32], [-89, 29], [-94, 30]]),
        r('ew-southeast', 'Southeastern belt', [[-87, 30], [-86, 35], [-78, 36], [-80, 31], [-83, 29], [-87, 30]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Mississippian culture', url: 'https://en.wikipedia.org/wiki/Mississippian_culture' },
      { title: 'Wikipedia — Hopewell tradition', url: 'https://en.wikipedia.org/wiki/Hopewell_tradition' },
    ],
  },
  {
    id: 'amazonia-presence',
    name: 'Amazonia presence',
    color: '#FDE68A',
    type: 'presence',
    description:
      'Schematic inhabited footprint of pre-Columbian Amazonia — Marajó, central-Amazon terra preta sites, upper Amazon and Llanos de Moxos earthworks as separate hearths.',
    keyYears: [-1000, 500, 1200, 1500],
    overlays: [
      k(-1000, 'Lower Amazon hearth (approx.)', [
        r('amz-lower', 'Lower Amazon / Marajó', [[-56, -4], [-55, 0], [-49, 0], [-48, -3], [-52, -5], [-56, -4]]),
      ]),
      k(500, 'Amazon river belt', [
        r('amz-lower', 'Lower Amazon / Marajó', [[-56, -4], [-55, 1], [-48, 1], [-48, -3], [-52, -5], [-56, -4]]),
        r('amz-central', 'Central Amazon (terra preta)', [[-66, -5], [-65, -1], [-58, -1], [-57, -4], [-62, -6], [-66, -5]]),
      ]),
      k(1200, 'Late pre-Columbian Amazonia', [
        r('amz-lower', 'Lower Amazon / Marajó', [[-56, -4], [-55, 1], [-48, 1], [-48, -3], [-52, -5], [-56, -4]]),
        r('amz-central', 'Central Amazon', [[-67, -5], [-66, -1], [-57, -1], [-57, -4], [-62, -6], [-67, -5]]),
        r('amz-upper', 'Upper Amazon', [[-75, -8], [-74, -3], [-69, -3], [-68, -7], [-71, -9], [-75, -8]]),
        r('amz-moxos', 'Llanos de Moxos', [[-67, -16], [-66, -12], [-63, -12], [-62, -15], [-64, -16], [-67, -16]]),
      ]),
      k(1500, 'Amazonia on the eve of contact', [
        r('amz-lower', 'Lower Amazon', [[-56, -4], [-55, 1], [-48, 1], [-48, -3], [-52, -5], [-56, -4]]),
        r('amz-central', 'Central Amazon', [[-67, -5], [-66, -1], [-57, -1], [-57, -4], [-62, -6], [-67, -5]]),
        r('amz-upper', 'Upper Amazon', [[-75, -8], [-74, -3], [-69, -3], [-68, -7], [-71, -9], [-75, -8]]),
        r('amz-moxos', 'Llanos de Moxos', [[-67, -16], [-66, -12], [-63, -12], [-62, -15], [-64, -16], [-67, -16]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Pre-Columbian Amazonia', url: 'https://en.wikipedia.org/wiki/Amazon_rainforest#Human_activity' },
      { title: 'Wikipedia — Terra preta', url: 'https://en.wikipedia.org/wiki/Terra_preta' },
    ],
  },
  {
    id: 'japan-archipelago-presence',
    name: 'Japan archipelago presence',
    color: '#99F6E4',
    type: 'presence',
    description:
      'Schematic inhabited footprint of the Japanese archipelago from late Jōmon through Yayoi rice farming to the Heian and late-medieval belt — islands kept as separate regions.',
    keyYears: [-3000, -300, 700, 1600],
    overlays: [
      k(-3000, 'Middle Jōmon central Honshu (approx.)', [
        r('jp-honshu', 'Central / eastern Honshu', [[136, 35], [137, 37], [140, 39], [141, 37], [139, 35], [136, 35]]),
      ]),
      k(-300, 'Yayoi rice belt', [
        r('jp-kyushu', 'Northern Kyushu', [[129, 32], [130, 34], [132, 34], [132, 32], [130, 31], [129, 32]]),
        r('jp-honshu', 'Western / central Honshu', [[131, 34], [132, 36], [139, 37], [140, 35], [135, 33], [131, 34]]),
      ]),
      k(700, 'Nara-era archipelago belt', [
        r('jp-kyushu', 'Kyushu', [[129, 31], [130, 34], [132, 34], [132, 31], [130, 30], [129, 31]]),
        r('jp-honshu', 'Honshu (west / Kinai / Kanto)', [[131, 34], [132, 36], [140, 38], [141, 36], [135, 33], [131, 34]]),
      ]),
      k(1600, 'Late medieval archipelago belt', [
        r('jp-kyushu', 'Kyushu', [[129, 31], [130, 34], [132, 34], [132, 31], [130, 30], [129, 31]]),
        r('jp-honshu', 'Honshu', [[131, 34], [132, 36], [140, 38], [141, 36], [135, 33], [131, 34]]),
        r('jp-tohoku', 'Tohoku', [[139, 37], [140, 41], [142, 41], [142, 38], [141, 36], [139, 37]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Jōmon period', url: 'https://en.wikipedia.org/wiki/J%C5%8Dmon_period' },
      { title: 'Wikipedia — Yayoi period', url: 'https://en.wikipedia.org/wiki/Yayoi_period' },
    ],
  },
  {
    id: 'aboriginal-australia-presence',
    name: 'Aboriginal Australia presence',
    color: '#BEF264',
    type: 'presence',
    description:
      'Schematic denser inhabited belts of Aboriginal Australia (the continent was inhabited for 50,000+ years; these mark better-watered coastal and riverine country, not the limits of occupation).',
    keyYears: [-3000, 0, 1000, 1700],
    overlays: [
      k(-3000, 'Mid-Holocene denser belts (approx.)', [
        r('au-north', 'Top End / Arnhem Land', [[130, -15], [131, -11], [137, -12], [137, -15], [133, -16], [130, -15]]),
        r('au-southeast', 'Murray–Darling / SE coast', [[141, -37], [142, -30], [150, -29], [152, -33], [147, -38], [141, -37]]),
      ]),
      k(0, 'Late Holocene belts', [
        r('au-north', 'Top End / Arnhem Land', [[130, -15], [131, -11], [137, -12], [137, -15], [133, -16], [130, -15]]),
        r('au-southeast', 'Murray–Darling / SE coast', [[141, -38], [142, -29], [151, -28], [153, -32], [147, -38], [141, -38]]),
        r('au-southwest', 'Southwest', [[114, -34], [115, -29], [118, -29], [119, -33], [117, -35], [114, -34]]),
      ]),
      k(1000, 'Late Holocene belts', [
        r('au-north', 'Top End / Arnhem Land', [[130, -15], [131, -11], [137, -12], [137, -15], [133, -16], [130, -15]]),
        r('au-southeast', 'Murray–Darling / SE coast', [[141, -38], [142, -29], [151, -28], [153, -32], [147, -38], [141, -38]]),
        r('au-southwest', 'Southwest', [[114, -34], [115, -29], [118, -29], [119, -33], [117, -35], [114, -34]]),
        r('au-queensland', 'Queensland coast fringe', [[144, -19], [145, -15], [147, -16], [150, -22], [148, -23], [144, -19]]),
      ]),
      k(1700, 'Pre-contact belts', [
        r('au-north', 'Top End / Arnhem Land', [[130, -15], [131, -11], [137, -12], [137, -15], [133, -16], [130, -15]]),
        r('au-southeast', 'Murray–Darling / SE coast', [[141, -38], [142, -29], [151, -28], [153, -32], [147, -38], [141, -38]]),
        r('au-southwest', 'Southwest', [[114, -34], [115, -29], [118, -29], [119, -33], [117, -35], [114, -34]]),
        r('au-queensland', 'Queensland coast', [[144, -19], [145, -15], [147, -16], [151, -24], [149, -25], [144, -19]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Prehistory of Australia', url: 'https://en.wikipedia.org/wiki/Prehistory_of_Australia' },
    ],
  },
  {
    id: 'new-guinea-highlands-presence',
    name: 'New Guinea highlands presence',
    color: '#F9A8D4',
    type: 'presence',
    description:
      'Schematic inhabited footprint of the New Guinea highlands — an independent early farming hearth (Kuk swamp), plus later north-coast and island settlement.',
    keyYears: [-3000, -500, 800, 1600],
    overlays: [
      k(-3000, 'Highland farming hearth (approx.)', [
        r('ng-highlands', 'Central highlands (Kuk)', [[142, -7], [143, -5], [146, -5], [146, -7], [144, -8], [142, -7]]),
      ]),
      k(-500, 'Highlands + north coast', [
        r('ng-highlands', 'Central highlands', [[141, -7], [142, -5], [147, -5], [147, -7], [144, -8], [141, -7]]),
        r('ng-north-coast', 'North coast fringe', [[142, -3], [143, -2], [147, -4], [146, -5], [144, -4], [142, -3]]),
      ]),
      k(800, 'Highlands + coasts', [
        r('ng-highlands', 'Central highlands', [[140, -7], [141, -5], [147, -5], [147, -7], [144, -8], [140, -7]]),
        r('ng-north-coast', 'North coast', [[141, -3], [142, -2], [147, -4], [146, -5], [143, -4], [141, -3]]),
        r('ng-papuan-gulf', 'Papuan south coast fringe', [[143, -8], [144, -7], [148, -9], [148, -10], [146, -10], [143, -8]]),
      ]),
      k(1600, 'Highlands + coasts (sweet-potato era)', [
        r('ng-highlands', 'Central highlands', [[139, -7], [140, -5], [147, -5], [147, -7], [144, -8], [139, -7]]),
        r('ng-north-coast', 'North coast', [[141, -3], [142, -2], [147, -4], [146, -5], [143, -4], [141, -3]]),
        r('ng-papuan-gulf', 'Papuan south coast', [[143, -8], [144, -7], [148, -9], [148, -10], [146, -10], [143, -8]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Kuk Swamp', url: 'https://en.wikipedia.org/wiki/Kuk_Swamp' },
    ],
  },
  {
    id: 'eurasian-steppe-presence',
    name: 'Eurasian steppe presence',
    color: '#7DD3FC',
    type: 'presence',
    description:
      'Schematic pastoral and oasis belts of the Eurasian steppe — Pontic–Caspian, Kazakh, Transoxianan oases and Mongolian plateau as separate regions (mobile herders, so edges are especially soft).',
    keyYears: [-3000, -1500, 500, 1300],
    overlays: [
      k(-3000, 'Pontic–Caspian pastoral belt (approx.)', [
        r('st-pontic', 'Pontic–Caspian steppe', [[32, 46], [33, 51], [45, 51], [47, 47], [39, 45], [32, 46]]),
      ]),
      k(-1500, 'Bronze Age steppe belts', [
        r('st-pontic', 'Pontic–Caspian steppe', [[31, 46], [32, 52], [47, 52], [49, 47], [39, 45], [31, 46]]),
        r('st-kazakh', 'Kazakh steppe (Andronovo fringe)', [[56, 47], [57, 53], [72, 53], [73, 48], [64, 46], [56, 47]]),
        r('st-oasis', 'Transoxianan oases (BMAC fringe)', [[59, 37], [60, 40], [67, 40], [68, 37], [63, 36], [59, 37]]),
      ]),
      k(500, 'Late antique steppe + oases', [
        r('st-pontic', 'Pontic–Caspian steppe', [[31, 46], [32, 52], [47, 52], [49, 47], [39, 45], [31, 46]]),
        r('st-kazakh', 'Kazakh steppe', [[56, 46], [57, 53], [74, 53], [75, 47], [64, 45], [56, 46]]),
        r('st-oasis', 'Sogdian / Bactrian oases', [[59, 37], [60, 42], [70, 42], [71, 38], [65, 36], [59, 37]]),
        r('st-mongolia', 'Mongolian plateau', [[96, 44], [97, 50], [112, 50], [113, 45], [104, 42], [96, 44]]),
      ]),
      k(1300, 'Mongol-era steppe + oases', [
        r('st-pontic', 'Pontic–Caspian steppe', [[31, 46], [32, 52], [47, 52], [49, 47], [39, 45], [31, 46]]),
        r('st-kazakh', 'Kazakh steppe', [[56, 46], [57, 53], [74, 53], [75, 47], [64, 45], [56, 46]]),
        r('st-oasis', 'Transoxianan oases', [[59, 37], [60, 42], [70, 42], [71, 38], [65, 36], [59, 37]]),
        r('st-mongolia', 'Mongolian plateau', [[95, 44], [96, 51], [114, 51], [115, 45], [104, 42], [95, 44]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Eurasian Steppe', url: 'https://en.wikipedia.org/wiki/Eurasian_Steppe' },
    ],
  },
  {
    id: 'pacific-islands-presence',
    name: 'Pacific islands presence',
    color: '#FCD9B6',
    type: 'presence',
    description:
      'Schematic inhabited island groups of Remote Oceania as settlement reached them — Bismarcks, Fiji, Tonga–Samoa, then Hawaiʻi and Aotearoa. Every archipelago is its own region; the open ocean is never filled.',
    keyYears: [-1000, 0, 1000, 1300],
    overlays: [
      k(-1000, 'Lapita settlement (approx.)', [
        r('pac-bismarck', 'Bismarck Archipelago', [[147, -6], [148, -2], [153, -3], [153, -6], [150, -7], [147, -6]]),
        r('pac-fiji', 'Fiji', [[177, -19], [177, -16], [180, -16], [180, -19], [178, -20], [177, -19]]),
      ]),
      k(0, 'Western Polynesia settled', [
        r('pac-bismarck', 'Bismarck Archipelago', [[147, -6], [148, -2], [153, -3], [153, -6], [150, -7], [147, -6]]),
        r('pac-fiji', 'Fiji', [[177, -19], [177, -16], [180, -16], [180, -19], [178, -20], [177, -19]]),
        r('pac-tonga-samoa', 'Tonga–Samoa', [[-176, -22], [-176, -13], [-170, -13], [-170, -16], [-173, -22], [-176, -22]]),
      ]),
      k(1000, 'Hawaiʻi settled', [
        r('pac-bismarck', 'Bismarck Archipelago', [[147, -6], [148, -2], [153, -3], [153, -6], [150, -7], [147, -6]]),
        r('pac-fiji', 'Fiji', [[177, -19], [177, -16], [180, -16], [180, -19], [178, -20], [177, -19]]),
        r('pac-tonga-samoa', 'Tonga–Samoa', [[-176, -22], [-176, -13], [-170, -13], [-170, -16], [-173, -22], [-176, -22]]),
        r('pac-hawaii', 'Hawaiʻi', [[-160, 19], [-159, 22], [-155, 22], [-154, 19], [-156, 18], [-160, 19]]),
      ]),
      k(1300, 'Aotearoa settled', [
        r('pac-bismarck', 'Bismarck Archipelago', [[147, -6], [148, -2], [153, -3], [153, -6], [150, -7], [147, -6]]),
        r('pac-fiji', 'Fiji', [[177, -19], [177, -16], [180, -16], [180, -19], [178, -20], [177, -19]]),
        r('pac-tonga-samoa', 'Tonga–Samoa', [[-176, -22], [-176, -13], [-170, -13], [-170, -16], [-173, -22], [-176, -22]]),
        r('pac-hawaii', 'Hawaiʻi', [[-160, 19], [-159, 22], [-155, 22], [-154, 19], [-156, 18], [-160, 19]]),
        r('pac-aotearoa', 'Aotearoa / New Zealand', [[172, -46], [172, -41], [175, -36], [178, -37], [176, -41], [172, -46]]),
      ]),
    ],
    sources: [
      { title: 'Wikipedia — Lapita culture', url: 'https://en.wikipedia.org/wiki/Lapita_culture' },
      { title: 'Wikipedia — Polynesian navigation', url: 'https://en.wikipedia.org/wiki/Polynesian_navigation' },
    ],
  },
];
