/**
 * Day 64 — Honest shape updates from lidar (Phase 4c item 8, step 8.2).
 *
 * Day 63 put the big lidar discoveries on the globe as pins (data/lidar-finds.json). This module
 * changes what the globe *draws* where those surveys changed the picture:
 *
 *  1. `lidarPresenceEntities` — six presence shapes for landscapes lidar has mapped, each drawn at
 *     its published extent (area in km² from the paper; outline traced by hand from the paper's
 *     maps, so every one is "approximate") and only for the years the sites were lived in:
 *       - the central Maya lowlands in the Late Classic (Canuto et al. 2018, 95,000 km²),
 *       - the Mirador–Calakmul Karst Basin in the Preclassic (Hansen et al. 2022; basin 4,533 km²
 *         per Ensley et al. 2021),
 *       - Greater Angkor's low-density urban complex (Evans et al. 2013, ~1,000 km²),
 *       - Mahendraparvata on Phnom Kulen (Chevance et al. 2019, ~40–50 km²),
 *       - the Upano valley garden cities (Rostain et al. 2024, 300 km² studied),
 *       - the Casarabe culture of the Llanos de Mojos (Prümers et al. 2022, ~4,500 km²).
 *     They share the teal of the lidar pins, so a find and the landscape it revealed read together.
 *
 *  2. `lidarShapeNotes` — certainty notes and sources for existing shapes the surveys speak to
 *     (Maya polity, Khmer Empire, Mesoamerica and Amazonia presence). Keyframe `confidence` wins
 *     over the entity default (globe-confidence.js), so the "How sure" line now names the survey.
 *     The Maya polity also loses its Classic-era "southern Mesoamerica fringe" (most of Mexico),
 *     which other cultures held; lidar now shows where Maya settlement actually was.
 *
 * `lidar` on each presence entity links it to its finds and its published area;
 * scripts/check-lidar-shapes.js checks areas, land, years, pins inside shapes and sources.
 * All of this is in the lazy globe chunk (docs/DATA.md); it adds six small rings, no new requests.
 */

/** @typedef {import('./globe-overlays.js').SpatialEntity} SpatialEntity */

const A = 'simplified';
const LIDAR_TEAL = '#14B8A6';
const R = (id, name, ring) => ({ id, name, ring });
const K = (year, label, regions, confidence) => ({ year, label, approximation: A, regions, ...(confidence ? { confidence } : {}) });
const C = (level, reason) => ({ level, reason });

// ---- Sources (the surveys; same URLs as data/lidar-finds.json where the find cites them) --------
export const LIDAR_SOURCES = {
  canuto2018: { title: 'Canuto et al. 2018, Ancient lowland Maya complexity as revealed by airborne laser scanning of northern Guatemala (Science)', url: 'https://www.science.org/doi/10.1126/science.aau0137' },
  auldThomas2024: { title: 'Auld-Thomas et al. 2024, Running out of empty space: environmental lidar and the crowded ancient landscape of Campeche, Mexico (Antiquity)', url: 'https://www.cambridge.org/core/journals/antiquity/article/running-out-of-empty-space-environmental-lidar-and-the-crowded-ancient-landscape-of-campeche-mexico/FFDB435047017853F26CFC5D8804B08D' },
  hansen2022: { title: 'Hansen et al. 2022, LiDAR analyses in the contiguous Mirador–Calakmul Karst Basin (Ancient Mesoamerica)', url: 'https://doi.org/10.1017/s0956536122000244' },
  ensley2021: { title: 'Ensley et al. 2021, Geomorphology of the Mirador–Calakmul Karst Basin (PLOS ONE)', url: 'https://doi.org/10.1371/journal.pone.0255496' },
  inomata2020: { title: 'Inomata et al. 2020, Monumental architecture at Aguada Fénix and the rise of Maya civilization (Nature)', url: 'https://www.nature.com/articles/s41586-020-2343-4' },
  evans2013: { title: 'Evans et al. 2013, Uncovering archaeological landscapes at Angkor using lidar (PNAS)', url: 'https://www.pnas.org/doi/10.1073/pnas.1306539110' },
  evans2007: { title: 'Evans et al. 2007, A comprehensive archaeological map of the world’s largest preindustrial settlement complex at Angkor (PNAS)', url: 'https://pubmed.ncbi.nlm.nih.gov/17717084/' },
  chevance2019: { title: 'Chevance et al. 2019, Mahendraparvata: an early Angkor-period capital defined through airborne laser scanning at Phnom Kulen (Antiquity)', url: 'https://doi.org/10.15184/aqy.2019.133' },
  rostain2024: { title: 'Rostain et al. 2024, Two thousand years of garden urbanism in the Upper Amazon (Science)', url: 'https://www.science.org/doi/10.1126/science.adi6317' },
  pruemers2022: { title: 'Prümers et al. 2022, Lidar reveals pre-Hispanic low-density urbanism in the Bolivian Amazon (Nature)', url: 'https://www.nature.com/articles/s41586-022-04780-4' },
  peripato2023: { title: 'Peripato et al. 2023, More than 10,000 pre-Columbian earthworks are still hidden throughout Amazonia (Science)', url: 'https://doi.org/10.1126/science.ade2541' },
};
const S = LIDAR_SOURCES;

// ---- Rings ([lng, lat], areas fitted to the published figure; see scripts/check-lidar-shapes.js) ---
// Canuto et al.'s "central Maya Lowlands": Petén, southern Campeche and Quintana Roo, western Belize
// and the Usumacinta edge; northern Yucatán, the Gulf Coast plains and coastal Belize / Quintana Roo
// are excluded. ≈ 95,000 km².
const CENTRAL_LOWLANDS = [[-91.5, 17.2], [-91.3, 18.3], [-90.6, 19.3], [-89.4, 19.5], [-88.7, 18.9], [-88.5, 17.6], [-88.8, 16.5], [-89.6, 16.0], [-90.6, 16.1], [-91.2, 16.5], [-91.5, 17.2]];
// Mirador–Calakmul Karst Basin, from El Mirador / Nakbe / Tintal north to Calakmul. ≈ 4,533 km².
const MCKB = [[-90.24, 17.7], [-90.2, 18.07], [-89.99, 18.45], [-89.74, 18.41], [-89.7, 17.99], [-89.65, 17.7], [-89.86, 17.57], [-90.07, 17.57], [-90.24, 17.7]];
// Greater Angkor's low-density urban complex, West Baray to Roluos, north of the Tonle Sap. ≈ 1,000 km².
const GREATER_ANGKOR = [[103.714, 13.317], [103.714, 13.504], [103.849, 13.566], [104.005, 13.525], [104.057, 13.379], [103.984, 13.265], [103.818, 13.265], [103.714, 13.317]];
// Mahendraparvata's planned grid on the Phnom Kulen plateau (longest axes ~15 km E–W, ~10 km N–S). ≈ 45 km².
const MAHENDRAPARVATA = [[104.054, 13.602], [104.078, 13.63], [104.134, 13.634], [104.166, 13.614], [104.142, 13.59], [104.086, 13.586], [104.054, 13.602]];
// The 300 km² southern part of the Upano lidar block studied by Rostain et al., along the river near Macas.
const UPANO = [[-78.164, -2.068], [-78.085, -2.068], [-78.067, -2.2], [-78.085, -2.342], [-78.147, -2.342], [-78.173, -2.2], [-78.164, -2.068]];
// Casarabe culture area in the south-east Llanos de Mojos, east of Trinidad around Casarabe. ≈ 4,500 km².
const CASARABE = [[-64.76, -14.58], [-64.36, -14.49], [-64.1, -14.67], [-64.1, -15.02], [-64.41, -15.16], [-64.76, -15.02], [-64.85, -14.8], [-64.76, -14.58]];

const OUTLINE = 'The outline is traced by hand from the published maps to match the published area; the surveys do not release exact boundaries.';

/** @type {(SpatialEntity & { lidar: { finds: string[], km2: number, areaNote: string, cite: string } })[]} */
export const lidarPresenceEntities = [
  {
    id: 'lidar-central-maya-lowlands',
    name: 'Central Maya lowlands (lidar-mapped)',
    color: LIDAR_TEAL,
    type: 'presence',
    description:
      'Lidar has shown that the central Maya lowlands were one continuous, engineered landscape in the Late Classic, not scattered temple cities in empty forest. The PACUNAM survey (2016, published 2018) mapped 61,480 structures over 2,144 km² of northern Guatemala — about 29 per km² — with causeways, reservoirs, terraced and drained fields and defensive walls; Canuto et al. estimate 7–11 million people across the 95,000 km² drawn here at the height of the Late Classic (650–800 CE). Lidar flown to measure forest carbon in Campeche later revealed Valeriana and 6,764 structures in about 122 km² (Auld-Thomas et al. 2024).',
    keyYears: [650, 800, 900],
    overlays: [
      K(650, 'Late Classic: a crowded, connected landscape', [R('central-lowlands', 'Central Maya lowlands', CENTRAL_LOWLANDS)], C('approximate',
        `Density is measured: 61,480 structures in 2,144 km² of lidar (Canuto et al. 2018), confirmed by Campeche lidar (Auld-Thomas et al. 2024). The area is Canuto et al.'s 95,000 km² "central Maya Lowlands", over which they extrapolate it. ${OUTLINE}`)),
      K(800, 'Late Classic peak: an estimated 7–11 million people', [R('central-lowlands', 'Central Maya lowlands', CENTRAL_LOWLANDS)], C('approximate',
        `Canuto et al. 2018 extrapolate 80–120 people per km² (650–800 CE) from 2,144 km² of PACUNAM lidar to these 95,000 km²: an estimate, not a count, and settlement was uneven (rural, peri-urban and urban zones). ${OUTLINE}`)),
      K(900, 'Terminal Classic: southern cities emptying', [R('central-lowlands', 'Central Maya lowlands', CENTRAL_LOWLANDS)], C('conjectural',
        'Cities in the southern lowlands were abandoned at different times between about 800 and 950 CE; lidar maps the buildings but not when each was left, so how fast this landscape emptied is a guess.')),
    ],
    timelineItemIds: ['maya'],
    sources: [S.canuto2018, S.auldThomas2024],
    lidar: { finds: ['pacunam-maya-lowlands', 'valeriana'], km2: 95000, areaNote: 'Canuto et al. 2018: the 95,000 km² central Maya Lowlands', cite: 'Canuto et al. 2018' },
  },
  {
    id: 'lidar-mirador-calakmul-basin',
    name: 'Mirador–Calakmul basin (lidar-mapped)',
    color: LIDAR_TEAL,
    type: 'presence',
    description:
      'Centuries before the Classic, the Mirador–Calakmul Karst Basin in northern Guatemala and southern Campeche was full of planned cities. Lidar over 1,703 km² (flown 2015 and 2018) found 775 settlements in the basin and 189 more on the surrounding ridge, grouped into at least 417 cities, towns and villages, joined by 177 km of raised causeways; many date to the Middle and Late Preclassic (about 1000 BCE – 150 CE), when El Mirador was the leading centre (Hansen et al. 2022). The basin itself covers 4,533 km² (Ensley et al. 2021).',
    keyYears: [-1000, -300, 150],
    overlays: [
      K(-1000, 'Middle Preclassic: first platforms and causeways', [R('mckb', 'Mirador–Calakmul Karst Basin', MCKB)], C('conjectural',
        'Hansen et al. 2022 date many basin sites to the Middle Preclassic (from about 1000 BCE) by excavation at some and by matching architecture and building volumes at the rest, so how much of the basin was settled this early is uncertain.')),
      K(-300, 'Late Preclassic: El Mirador at its height', [R('mckb', 'Mirador–Calakmul Karst Basin', MCKB)], C('approximate',
        `Settlements and 177 km of causeways are mapped by lidar over 1,703 km², 87% of the basin's Guatemalan part (Hansen et al. 2022); the basin's 4,533 km² is from Ensley et al. 2021. Whether it was one centralised state is debated. ${OUTLINE}`)),
      K(150, 'End of the Preclassic: El Mirador declines', [R('mckb', 'Mirador–Calakmul Karst Basin', MCKB)], C('approximate',
        'Hansen et al. 2022 end the Preclassic florescence around 150 CE; the basin was occupied more modestly later, and Calakmul rose again in the Classic (not drawn as dense here).')),
    ],
    timelineItemIds: ['maya'],
    sources: [S.hansen2022, S.ensley2021],
    lidar: { finds: ['mirador-calakmul-basin'], km2: 4533, areaNote: 'Ensley et al. 2021: the Mirador–Calakmul Karst Basin covers 4,533 km²', cite: 'Hansen et al. 2022' },
  },
  {
    id: 'lidar-greater-angkor',
    name: 'Greater Angkor (lidar-mapped city)',
    color: LIDAR_TEAL,
    type: 'presence',
    description:
      'Angkor was not a temple complex in empty forest. Lidar flown over 370 km² in 2012 revealed a formally planned urban grid of roads, ponds and house mounds around and beyond the great temples: by the 13th century a dense core of at least 35 km² sat at the centre of a low-density urban complex stretching over about 1,000 km² (Evans et al. 2013), the most extensive urban complex of the pre-industrial world. Earlier mapping by the Greater Angkor Project covered nearly 3,000 km² and traced a water-management network over more than 1,000 km² (Evans et al. 2007).',
    keyYears: [1100, 1200, 1300, 1431],
    overlays: [
      K(1100, '11th century: high-density nodes forming', [R('greater-angkor', 'Greater Angkor', GREATER_ANGKOR)], C('conjectural',
        'Evans et al. 2013 describe 9th–10th-century Angkor as open, temple-centred settlements that grew dense nodes in the 11th–12th centuries; how far the low-density city reached at this date is not measured, so this is the later extent.')),
      K(1200, 'Jayavarman VII: a ~35 km² core in a ~1,000 km² city', [R('greater-angkor', 'Greater Angkor', GREATER_ANGKOR)], C('approximate',
        `Evans et al. 2013 (370 km² of lidar, 2012): by the 13th century a planned core of at least 35 km² inside a low-density urban complex of about 1,000 km². ${OUTLINE}`)),
      K(1300, 'Zhou Daguan’s Angkor', [R('greater-angkor', 'Greater Angkor', GREATER_ANGKOR)], C('approximate',
        `The ~1,000 km² low-density urban complex mapped by lidar (Evans et al. 2013) and the Greater Angkor Project (Evans et al. 2007). ${OUTLINE}`)),
      K(1431, 'Ayutthaya takes Angkor', [R('greater-angkor', 'Greater Angkor', GREATER_ANGKOR)], C('conjectural',
        'Angkor declined over the 14th–15th centuries, with strain on its waterworks a likely factor; it was never wholly abandoned, and how much of the wider city was still lived in by 1431 is uncertain.')),
    ],
    timelineItemIds: ['khmer'],
    sources: [S.evans2013, S.evans2007],
    lidar: { finds: ['greater-angkor'], km2: 1000, areaNote: 'Evans et al. 2013: a low-density urban complex of ~1,000 km²', cite: 'Evans et al. 2013' },
  },
  {
    id: 'lidar-mahendraparvata',
    name: 'Mahendraparvata (lidar-mapped city)',
    color: LIDAR_TEAL,
    type: 'presence',
    edgeGrace: 5,
    description:
      'The early Khmer capital on the Phnom Kulen plateau, where inscriptions say Jayavarman II was proclaimed universal king in 802. Lidar (2012 and 2015) and fieldwork revealed a centrally planned city of about 40–50 km²: a grid of major axes (the longest about 15 km east–west and 10 km north–south) dividing city blocks, with a palace, a state pyramid temple, shrines, ponds, dams and an unfinished reservoir (Chevance et al. 2019).',
    keyYears: [802, 850, 900],
    overlays: [
      K(802, 'Jayavarman II proclaimed on Phnom Kulen', [R('mahendraparvata', 'Mahendraparvata', MAHENDRAPARVATA)], C('approximate',
        `Chevance et al. 2019: a planned urban area of ~40–50 km² defined by airborne laser scanning and ground survey. ${OUTLINE}`)),
      K(850, 'A planned capital on the plateau', [R('mahendraparvata', 'Mahendraparvata', MAHENDRAPARVATA)], C('approximate',
        `Chevance et al. 2019: a grid of major axes, city blocks, a palace, a state temple and an unfinished reservoir, dated to the 9th century. ${OUTLINE}`)),
      K(900, 'The court has moved to the Angkor plain', [R('mahendraparvata', 'Mahendraparvata', MAHENDRAPARVATA)], C('conjectural',
        'The royal centre moved down to Hariharalaya and then Angkor in the 9th century; how long the plateau city stayed populated is not known.')),
    ],
    timelineItemIds: ['khmer'],
    sources: [S.chevance2019, S.evans2013],
    lidar: { finds: ['mahendraparvata'], km2: 45, areaNote: 'Chevance et al. 2019: a planned urban area of ~40–50 km²', cite: 'Chevance et al. 2019' },
  },
  {
    id: 'lidar-upano-valley',
    name: 'Upano valley garden cities (lidar-mapped)',
    color: LIDAR_TEAL,
    type: 'presence',
    description:
      'In the Upano valley on the eastern foot of the Andes in Ecuador, lidar flown in 2015 over 600 km² for Ecuador’s National Institute of Cultural Heritage, and studied in its southern 300 km² by Rostain et al. (2024), revealed more than 6,000 earthen platforms grouped around plazas, joined by wide, straight roads running for tens of kilometres, with drained fields and terraces between them. Excavations date the building to about 500 BCE – 300/600 CE: the oldest known urban network in the Amazon.',
    keyYears: [-500, 0, 450],
    overlays: [
      K(-500, 'Kilamope culture: platforms and roads begin', [R('upano', 'Upano valley', UPANO)], C('approximate',
        `Rostain et al. 2024 studied 300 km² of the 600 km² lidar block. The start date rests on few published radiocarbon dates and has been challenged (Science eLetters, 2024). The strip is placed along the Upano near Macas to within about 10–15 km. ${OUTLINE}`)),
      K(0, 'Upano culture: garden cities linked by roads', [R('upano', 'Upano valley', UPANO)], C('approximate',
        `Rostain et al. 2024: more than 6,000 earthen platforms around plazas, straight roads up to tens of kilometres long, drained fields and terraces, all in the 300 km² studied. Placed near Macas to within about 10–15 km. ${OUTLINE}`)),
      K(450, 'Upano culture ends (300–600 CE)', [R('upano', 'Upano valley', UPANO)], C('conjectural',
        'Rostain et al. 2024 date the end to between 300 and 600 CE (drawn to 450); why the valley emptied, and how suddenly, is unresolved. Some mounds were reoccupied by the Huapula culture about 800–1200 CE (not drawn).')),
    ],
    sources: [S.rostain2024],
    lidar: { finds: ['upano-valley'], km2: 300, areaNote: 'Rostain et al. 2024: the 300 km² studied part of a 600 km² lidar block', cite: 'Rostain et al. 2024' },
  },
  {
    id: 'lidar-casarabe',
    name: 'Casarabe culture towns (lidar-mapped)',
    color: LIDAR_TEAL,
    type: 'presence',
    description:
      'In the south-east Llanos de Mojos of Bolivia, the Casarabe culture (about 500–1400 CE) built a dense four-tier settlement system over some 4,500 km². Lidar of six areas (about 200 km² in all) mapped the two large settlements, Cotoca (147 ha) and Landívar (315 ha), with stepped platforms, U-shaped mounds and pyramids up to 22 m tall, ringed by banks and joined to smaller sites by straight raised causeways, canals and reservoirs; across the area there are on average ten sites within 10 km of each settlement (Prümers et al. 2022). It was the first clear case of low-density urbanism in Amazonia.',
    keyYears: [500, 1000, 1400],
    overlays: [
      K(500, 'Casarabe culture begins', [R('casarabe', 'Casarabe culture area', CASARABE)], C('conjectural',
        'Prümers et al. 2022 date the culture from about 500 CE from 144 radiocarbon dates at a few sites; how quickly settlement spread over the whole area is not known.')),
      K(1000, 'A dense, causeway-linked settlement system', [R('casarabe', 'Casarabe culture area', CASARABE)], C('approximate',
        `Prümers et al. 2022: Casarabe settlement spans ~4,500 km² as far as known, mapped by lidar in six areas (~200 km²) plus earlier survey and remote sensing. Placed in the south-east Llanos de Mojos to within about 20 km. ${OUTLINE}`)),
      K(1400, 'Casarabe culture ends', [R('casarabe', 'Casarabe culture area', CASARABE)], C('approximate',
        `Prümers et al. 2022 end the Casarabe culture around 1400 CE. ${OUTLINE}`)),
    ],
    sources: [S.pruemers2022],
    lidar: { finds: ['casarabe-llanos-de-mojos'], km2: 4500, areaNote: 'Prümers et al. 2022: the Casarabe culture area spans ~4,500 km²', cite: 'Prümers et al. 2022' },
  },
];

/**
 * Certainty notes for existing shapes the surveys speak to. `keyframes[year]` is merged into that
 * keyframe (it must exist, unless `add` supplies a new one); `sources` are appended once;
 * `dropRegions[year]` removes regions from a keyframe.
 */
export const lidarShapeNotes = {
  maya: {
    description:
      'Mesoamerican civilisation of the Yucatán peninsula and the Guatemalan highlands — the area of Maya cities, not one state. Lidar since 2018 shows the lowlands were far more densely built than once thought (see the lidar-mapped presence shapes).',
    add: [
      { year: -1000, label: 'Middle Preclassic: first monuments', approximation: 'schematic', regions: [{ id: 'yucatan', name: 'Yucatán / Maya lowlands' }] },
    ],
    keyframes: {
      [-1000]: { confidence: C('conjectural', 'Aguada Fénix (Inomata et al. 2020, lidar and excavation) shows monumental building in the western Maya lowlands by about 1000–800 BCE, and Mirador–Calakmul lidar (Hansen et al. 2022) shows planned centres from the Middle Preclassic. Beyond such sites the outline is a guess at a cultural sphere, not a state.') },
      [-500]: { confidence: C('approximate', 'Late Preclassic: lidar of the Mirador–Calakmul basin (Hansen et al. 2022) shows dense cities joined by causeways, drawn as its own presence shape. The wider outline is the area of Maya-style sites, many still unsurveyed.') },
      [800]: { confidence: C('approximate', 'Classic Maya: dozens of rival kingdoms, not one state, drawn as the area of Classic Maya cities. Lidar (PACUNAM, Canuto et al. 2018; Campeche, Auld-Thomas et al. 2024) shows the central lowlands were densely and continuously settled, drawn as its own presence shape. The old "southern Mesoamerica fringe" over most of Mexico is gone: those lands belonged to other cultures.') },
    },
    dropRegions: { 800: ['mesoamerica'] },
    sources: [S.inomata2020, S.hansen2022, S.canuto2018, S.auldThomas2024],
  },
  'khmer-empire': {
    keyframes: {
      802: { confidence: C('approximate', 'A mandala state: a core around the capital plus tributary rulers whose loyalty shifted. Lidar confirmed the first capital, Mahendraparvata on Phnom Kulen, as a ~40–50 km² planned city (Chevance et al. 2019); it does not change the outer ring, a zone of tribute drawn roughly.') },
      1200: { confidence: C('approximate', 'A mandala state at its height under Jayavarman VII; the outer ring is a zone of tribute, drawn roughly. Lidar changed the capital, not the frontier: Angkor was a ~1,000 km² low-density city with a ~35 km² planned core (Evans et al. 2013), drawn as its own presence shape.') },
    },
    sources: [S.evans2013, S.chevance2019],
  },
  'mesoamerica-presence': {
    keyframes: {
      [-500]: { confidence: C('conjectural', 'Where people lived is estimated from archaeological sites; the footprint is a guess. Lidar shows Preclassic cities densely filling the Mirador–Calakmul basin just east of this belt (Hansen et al. 2022) and huge early platforms such as Aguada Fénix inside it (Inomata et al. 2020).') },
      500: { confidence: C('conjectural', 'Where people lived is estimated from archaeological sites; the footprint is a guess. Where lidar has been flown in the Maya lowlands it found continuous, dense settlement (Canuto et al. 2018; Auld-Thomas et al. 2024), drawn as its own presence shape; much of the rest is unsurveyed.') },
    },
    sources: [S.canuto2018, S.hansen2022],
  },
  'amazonia-presence': {
    description:
      'Schematic inhabited footprint of pre-Columbian Amazonia — Marajó, central-Amazon terra preta sites, upper Amazon and Llanos de Moxos earthworks as separate hearths. Where lidar has been flown (the Upano valley, the Casarabe towns of Mojos) it found planned, densely settled landscapes, drawn as their own presence shapes.',
    keyframes: {
      500: { confidence: C('conjectural', 'Estimated from known sites; the footprint is a guess. Lidar at Upano (Rostain et al. 2024) and Casarabe (Prümers et al. 2022) found dense, planned settlement wherever it was flown, and models suggest more than 10,000 earthworks are still hidden (Peripato et al. 2023), so this wash likely understates people.') },
      1200: { confidence: C('conjectural', 'Estimated from known sites; the footprint is a guess. Lidar of the Casarabe culture (Prümers et al. 2022) shows a 4,500 km² low-density urban system in Mojos, and models suggest more than 10,000 earthworks are still hidden across Amazonia (Peripato et al. 2023).') },
    },
    sources: [S.rostain2024, S.pruemers2022, S.peripato2023],
  },
};

/**
 * Apply `lidarShapeNotes` to the shared catalogue (mutates in place). Called once by
 * globe-overlays.js after every module has merged its shapes.
 * @param {SpatialEntity[]} entities
 */
export function applyLidarShapeNotes(entities) {
  for (const [id, note] of Object.entries(lidarShapeNotes)) {
    const ent = entities.find((e) => e.id === id);
    if (!ent) throw new Error(`globe-lidar-shapes: no entity "${id}" to annotate`);
    if (note.description) ent.description = note.description;
    for (const kf of note.add || []) {
      if (!ent.overlays.some((o) => o.year === kf.year)) ent.overlays.push({ ...kf });
    }
    ent.overlays.sort((a, b) => a.year - b.year);
    ent.keyYears = [...new Set([...(ent.keyYears || []), ...ent.overlays.map((o) => o.year)])].sort((a, b) => a - b);
    for (const [y, patch] of Object.entries(note.keyframes || {})) {
      const kf = ent.overlays.find((o) => o.year === Number(y));
      if (!kf) throw new Error(`globe-lidar-shapes: ${id} has no keyframe at ${y}`);
      Object.assign(kf, patch);
    }
    for (const [y, drop] of Object.entries(note.dropRegions || {})) {
      const kf = ent.overlays.find((o) => o.year === Number(y));
      if (kf) kf.regions = kf.regions.filter((r) => !drop.includes(typeof r === 'string' ? r : r.id));
    }
    const have = new Set((ent.sources || []).map((s) => s.url));
    ent.sources = [...(ent.sources || []), ...(note.sources || []).filter((s) => !have.has(s.url))];
  }
  return entities;
}
