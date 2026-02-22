// Log-space conversion (same formula as main.js cosmic timeline)
const REF = 2025;
function yearToLog(y) {
  const o = REF - y;
  return o <= 0 ? 0 : -Math.log10(1 + o);
}

// Helper to build an item with both log-space coords and raw years
function cosmicItem(id, name, startYear, endYear, region, icon, description, periods) {
  return {
    id,
    name,
    start: yearToLog(startYear),
    end: yearToLog(endYear),
    startYear,
    endYear,
    region,
    icon,
    description,
    periods: (periods || []).map(p => ({
      name: p.name,
      start: yearToLog(p.start),
      end: yearToLog(p.end),
    })),
  };
}

export const cosmicHistoryCategories = [
  { id: 'cosmic-structure', name: 'Cosmic Structure', color: '#8B5CF6' },
  { id: 'stars-elements', name: 'Stars & Elements', color: '#EAB308' },
  { id: 'solar-system', name: 'Solar System', color: '#F97316' },
  { id: 'earth', name: 'Earth', color: '#3B82F6' },
  { id: 'life', name: 'Life', color: '#10B981' },
  { id: 'extinctions', name: 'Extinction Events', color: '#EF4444' },
];

export const cosmicHistoryItems = [
  // =========================================================
  // COSMIC STRUCTURE
  // =========================================================
  cosmicItem(
    'big-bang', 'The Big Bang & Inflation',
    -13_800_000_000, -13_700_000_000,
    'cosmic-structure', '💥',
    'The universe begins from an infinitely dense singularity. In the first fractions of a second, cosmic inflation causes space to expand exponentially, seeding the structure of everything to come.',
    [{ name: 'Inflation', start: -13_800_000_000, end: -13_790_000_000 }]
  ),
  cosmicItem(
    'recombination-cmb', 'Recombination & the CMB',
    -13_799_620_000, -13_799_600_000,
    'cosmic-structure', '🌡️',
    'Around 380,000 years after the Big Bang, the universe cools enough for electrons to bind to nuclei, forming the first atoms. Light streams freely for the first time — the origin of the Cosmic Microwave Background, the oldest observable signal in the cosmos.',
    []
  ),
  cosmicItem(
    'cosmic-dark-ages', 'Cosmic Dark Ages',
    -13_700_000_000, -13_500_000_000,
    'cosmic-structure', '🌑',
    'After the initial fireball cools, the universe enters a period of total darkness. No stars or galaxies exist yet — only a vast expanse of neutral hydrogen and helium gas.',
    []
  ),
  cosmicItem(
    'reionization', 'Cosmic Reionization',
    -13_500_000_000, -12_700_000_000,
    'cosmic-structure', '✨',
    'The first stars and galaxies emit enough ultraviolet radiation to re-ionize the neutral hydrogen permeating the universe, ending the Cosmic Dark Ages and making the universe transparent.',
    []
  ),
  cosmicItem(
    'first-galaxies', 'First Galaxies Form',
    -13_400_000_000, -10_000_000_000,
    'cosmic-structure', '🌌',
    'Small proto-galaxies begin assembling from dark matter halos and gas clouds, merging and growing through collisions. The cosmic web of filaments and voids takes shape.',
    [{ name: 'Cosmic Dawn', start: -13_400_000_000, end: -12_000_000_000 }]
  ),
  cosmicItem(
    'milky-way', 'Milky Way Forms',
    -13_200_000_000, 2025,
    'cosmic-structure', '🌀',
    'Our home galaxy begins as merging proto-galaxies and gradually develops its iconic spiral structure. It will eventually contain over 200 billion stars and span 100,000 light-years.',
    [
      { name: 'Assembly', start: -13_200_000_000, end: -10_000_000_000 },
      { name: 'Spiral Structure', start: -10_000_000_000, end: 2025 },
    ]
  ),
  cosmicItem(
    'cosmic-web', 'Large-Scale Structure',
    -12_000_000_000, 2025,
    'cosmic-structure', '🕸️',
    'Gravity sculpts matter into a vast cosmic web of galaxy clusters, filaments, and enormous voids. The observable universe organises into structures spanning hundreds of millions of light-years.',
    []
  ),
  cosmicItem(
    'galaxy-clusters', 'Galaxy Clusters & Superclusters',
    -10_000_000_000, 2025,
    'cosmic-structure', '🔭',
    'Gravity draws galaxies into bound clusters and superclusters — the largest gravitationally bound structures in the universe, connected by filaments of dark matter and gas into the cosmic web.',
    []
  ),

  // =========================================================
  // STARS & ELEMENTS
  // =========================================================
  cosmicItem(
    'first-stars', 'First Stars (Population III)',
    -13_600_000_000, -12_000_000_000,
    'stars-elements', '⭐',
    'The very first generation of stars ignite from pure hydrogen and helium. Massive and short-lived, these titans forge the first heavy elements in their cores and seed them into space through violent supernovae.',
    []
  ),
  cosmicItem(
    'molecular-clouds', 'Molecular Clouds & Star Nurseries',
    -13_000_000_000, 2025,
    'stars-elements', '☁️',
    'Giant molecular clouds of gas and dust serve as stellar nurseries, collapsing under gravity to birth new generations of stars and planetary systems throughout cosmic history.',
    []
  ),
  cosmicItem(
    'stellar-nucleosynthesis', 'Stellar Nucleosynthesis',
    -13_500_000_000, 2025,
    'stars-elements', '⚛️',
    'Generations of stars live, burn, and die, fusing hydrogen into heavier elements — carbon, oxygen, iron, and more. Every atom in your body heavier than helium was forged inside a star.',
    [
      { name: 'Early Enrichment', start: -13_500_000_000, end: -10_000_000_000 },
      { name: 'Ongoing', start: -10_000_000_000, end: 2025 },
    ]
  ),
  cosmicItem(
    'supernovae', 'Supernovae & Neutron Stars',
    -13_500_000_000, 2025,
    'stars-elements', '💫',
    'When massive stars exhaust their fuel, they explode as supernovae — among the most energetic events in the universe. The crushed cores left behind become neutron stars or black holes.',
    []
  ),
  cosmicItem(
    'white-dwarfs', 'White Dwarfs & Planetary Nebulae',
    -12_000_000_000, 2025,
    'stars-elements', '💎',
    'When low-mass stars exhaust their fuel, they shed their outer layers as glowing planetary nebulae and leave behind dense white dwarf remnants, enriching space with carbon and nitrogen.',
    []
  ),
  cosmicItem(
    'neutron-star-mergers', 'Neutron Star Mergers',
    -12_000_000_000, 2025,
    'stars-elements', '🌟',
    'When neutron stars spiral together and collide, the extreme conditions forge the heaviest elements — gold, platinum, and uranium — through rapid neutron capture. Confirmed by LIGO gravitational wave detection in 2017.',
    []
  ),
  cosmicItem(
    'our-sun', 'Our Sun',
    -4_600_000_000, 2025,
    'stars-elements', '☀️',
    'A third-generation star born from the gravitational collapse of a molecular cloud enriched with heavy elements from earlier stellar generations. It has burned steadily for 4.6 billion years and will continue for another 5 billion.',
    [{ name: 'Main Sequence', start: -4_600_000_000, end: 2025 }]
  ),

  // =========================================================
  // SOLAR SYSTEM
  // =========================================================
  cosmicItem(
    'solar-nebula', 'Solar Nebula Collapses',
    -4_600_000_000, -4_500_000_000,
    'solar-system', '🌫️',
    'A vast cloud of gas and dust begins collapsing under gravity, forming a spinning disc. The Sun ignites at the centre while the remaining material begins clumping into planetesimals.',
    []
  ),
  cosmicItem(
    'gas-giants', 'Gas Giants Form',
    -4_600_000_000, -4_500_000_000,
    'solar-system', '🪐',
    'Jupiter and Saturn rapidly accumulate massive atmospheres of hydrogen and helium beyond the frost line, growing into gas giants. Uranus and Neptune form as ice giants farther out.',
    []
  ),
  cosmicItem(
    'rocky-planets', 'Rocky Planets Form',
    -4_500_000_000, -4_400_000_000,
    'solar-system', '🌍',
    'Mercury, Venus, Earth, and Mars coalesce from collisions between countless rocky planetesimals in the inner solar system, gradually sweeping their orbits clear of debris.',
    []
  ),
  cosmicItem(
    'moon-formation', 'The Moon Forms (Theia Impact)',
    -4_500_000_000, -4_400_000_000,
    'solar-system', '🌙',
    'A Mars-sized protoplanet called Theia collides with the young Earth in a cataclysmic impact. The debris ejected into orbit coalesces to form our Moon.',
    []
  ),
  cosmicItem(
    'water-delivery', 'Water Delivery to Earth',
    -4_400_000_000, -3_800_000_000,
    'solar-system', '💧',
    'Comets and water-rich asteroids bombard the young Earth, delivering the water that fills its oceans and creates the conditions necessary for life to emerge.',
    []
  ),
  cosmicItem(
    'asteroid-belt', 'Asteroid Belt Stabilises',
    -4_500_000_000, -4_000_000_000,
    'solar-system', '🪨',
    'Millions of rocky fragments between Mars and Jupiter fail to coalesce into a planet due to Jupiter\'s immense gravity, forming a stable belt of asteroids.',
    []
  ),
  cosmicItem(
    'planetary-migration', 'Planetary Migration (Nice Model)',
    -4_100_000_000, -3_800_000_000,
    'solar-system', '🔀',
    'The giant planets migrate from their original orbits to their current positions, scattering debris throughout the solar system and likely triggering the Late Heavy Bombardment.',
    []
  ),
  cosmicItem(
    'late-heavy-bombardment', 'Late Heavy Bombardment',
    -4_100_000_000, -3_800_000_000,
    'solar-system', '☄️',
    'A period of intense asteroid and comet impacts pummels the inner solar system, leaving heavily cratered surfaces on the Moon, Mercury, and Mars, and possibly delivering water to Earth.',
    []
  ),
  cosmicItem(
    'kuiper-oort', 'Kuiper Belt & Oort Cloud',
    -4_500_000_000, 2025,
    'solar-system', '🧊',
    'The frozen outer reaches of the solar system — a belt of icy bodies beyond Neptune and a vast spherical cloud of comets surrounding the Sun, the ultimate source of long-period comets.',
    []
  ),

  // =========================================================
  // EARTH
  // =========================================================
  cosmicItem(
    'hadean', 'Hadean Eon',
    -4_600_000_000, -4_000_000_000,
    'earth', '🔥',
    'Earth\'s hellish infancy. The surface is molten rock, bombarded by asteroids. A thick atmosphere of carbon dioxide and water vapour forms. As the planet cools, the first solid crust and oceans begin to appear.',
    []
  ),
  cosmicItem(
    'archean', 'Archean Eon',
    -4_000_000_000, -2_500_000_000,
    'earth', '🌊',
    'Earth\'s oceans expand and the first continental crust forms. The atmosphere is still oxygen-free, but microbial life flourishes in the warm seas, fundamentally altering Earth\'s chemistry.',
    []
  ),
  cosmicItem(
    'magnetic-field', 'Earth\'s Magnetic Field',
    -3_500_000_000, 2025,
    'earth', '🧲',
    'Earth\'s iron core generates a powerful magnetic field — the geodynamo — that deflects the solar wind and protects the atmosphere from being stripped away, making life on the surface possible.',
    []
  ),
  cosmicItem(
    'plate-tectonics', 'Plate Tectonics Begin',
    -3_000_000_000, 2025,
    'earth', '🌋',
    'Earth\'s outer shell fractures into moving tectonic plates that recycle carbon, build mountains, trigger volcanism, and regulate the climate over billions of years — a fundamental driver of Earth\'s habitability.',
    []
  ),
  cosmicItem(
    'great-oxygenation', 'Great Oxygenation Event',
    -2_400_000_000, -2_000_000_000,
    'earth', '🫧',
    'Cyanobacteria begin producing oxygen through photosynthesis on a massive scale. Free oxygen accumulates in the atmosphere for the first time, poisoning most anaerobic life but enabling the eventual rise of complex organisms.',
    []
  ),
  cosmicItem(
    'proterozoic', 'Proterozoic Eon',
    -2_500_000_000, -541_000_000,
    'earth', '🌐',
    'The longest eon in Earth\'s history. Oxygen rises, the ozone layer forms, continents assemble and break apart, and the stage is set for complex multicellular life.',
    [
      { name: 'Paleoproterozoic', start: -2_500_000_000, end: -1_600_000_000 },
      { name: 'Mesoproterozoic', start: -1_600_000_000, end: -1_000_000_000 },
      { name: 'Neoproterozoic', start: -1_000_000_000, end: -541_000_000 },
    ]
  ),
  cosmicItem(
    'boring-billion', 'The Boring Billion',
    -1_800_000_000, -800_000_000,
    'earth', '⏳',
    'A billion-year period of relative geological and evolutionary stability — oxygen levels plateau, the atmosphere settles, and complex life develops slowly before the dramatic upheavals of the Neoproterozoic.',
    []
  ),
  cosmicItem(
    'snowball-earth', 'Snowball Earth',
    -720_000_000, -635_000_000,
    'earth', '❄️',
    'Earth freezes almost entirely, with ice sheets extending to the equator. When volcanic CO2 eventually thaws the planet, the dramatic environmental upheaval may have triggered the evolution of complex animal life.',
    []
  ),
  cosmicItem(
    'pangaea', 'Formation of Pangaea',
    -335_000_000, -175_000_000,
    'earth', '🗺️',
    'Earth\'s continents drift together to form the supercontinent Pangaea, profoundly influencing climate, ocean currents, and the evolution of life before rifting apart into today\'s continents.',
    []
  ),
  cosmicItem(
    'phanerozoic', 'Phanerozoic Eon',
    -541_000_000, 2025,
    'earth', '🌎',
    'The current eon — the age of visible life. Continents drift, mountains rise and erode, and life diversifies spectacularly across land, sea, and air.',
    [
      { name: 'Paleozoic', start: -541_000_000, end: -252_000_000 },
      { name: 'Mesozoic', start: -252_000_000, end: -66_000_000 },
      { name: 'Cenozoic', start: -66_000_000, end: 2025 },
    ]
  ),

  // =========================================================
  // LIFE
  // =========================================================
  cosmicItem(
    'first-life', 'First Life — Prokaryotes',
    -3_800_000_000, 2025,
    'life', '🦠',
    'The earliest life appears in Earth\'s primordial oceans — simple single-celled organisms without a nucleus. These hardy microbes are the ancestors of all life on Earth.',
    [{ name: 'Microbial Dominance', start: -3_800_000_000, end: -2_100_000_000 }]
  ),
  cosmicItem(
    'eukaryotes', 'Eukaryotes Emerge',
    -2_100_000_000, 2025,
    'life', '🔬',
    'Cells with a true nucleus and complex internal structures appear, probably through the engulfment of smaller cells (endosymbiosis). This leap in complexity paves the way for all multicellular life.',
    []
  ),
  cosmicItem(
    'multicellular-life', 'Multicellular Life',
    -1_500_000_000, 2025,
    'life', '🧫',
    'Cells begin cooperating as multicellular organisms — one of life\'s most important transitions, bridging the gap between single-celled eukaryotes and the complex animals of the Cambrian.',
    []
  ),
  cosmicItem(
    'ediacaran-fauna', 'Ediacaran Fauna',
    -635_000_000, -541_000_000,
    'life', '🪸',
    'The first large, complex organisms appear in the oceans — bizarre soft-bodied creatures unlike anything alive today, representing life\'s first experiment with large body plans.',
    []
  ),
  cosmicItem(
    'cambrian-explosion', 'Cambrian Explosion',
    -541_000_000, -485_000_000,
    'life', '🐚',
    'An extraordinary burst of evolution produces most major animal body plans in a geologically short period. Complex eyes, shells, and predators appear for the first time.',
    []
  ),
  cosmicItem(
    'land-plants', 'Land Plants Colonise Earth',
    -470_000_000, 2025,
    'life', '🌿',
    'Plants move from water to land, transforming barren rock into green landscapes. They create soils, stabilise the atmosphere, and lay the foundation for terrestrial food chains.',
    [
      { name: 'Early Land Plants', start: -470_000_000, end: -360_000_000 },
      { name: 'Forests & Flowers', start: -360_000_000, end: 2025 },
    ]
  ),
  cosmicItem(
    'vertebrates-land', 'First Vertebrates on Land',
    -375_000_000, -300_000_000,
    'life', '🐸',
    'Fish with sturdy fins begin venturing onto land during the Devonian period. Creatures like Tiktaalik bridge the gap between fish and four-legged animals in one of evolution\'s most iconic transitions.',
    []
  ),
  cosmicItem(
    'insects-flight', 'Insects & Flight',
    -400_000_000, 2025,
    'life', '🦟',
    'Insects become the first animals to evolve flight and are by far the most species-rich animal group on Earth. During the Carboniferous, high oxygen levels produce giant dragonflies with 70cm wingspans.',
    [
      { name: 'Early Insects', start: -400_000_000, end: -300_000_000 },
      { name: 'Giant Insects', start: -300_000_000, end: -252_000_000 },
    ]
  ),
  cosmicItem(
    'age-of-dinosaurs', 'Age of Dinosaurs',
    -230_000_000, -66_000_000,
    'life', '🦕',
    'Dinosaurs dominate Earth for over 160 million years. From towering sauropods to ferocious tyrannosaurs, they fill every ecological niche while the first mammals remain small and marginal.',
    [
      { name: 'Triassic', start: -230_000_000, end: -201_000_000 },
      { name: 'Jurassic', start: -201_000_000, end: -145_000_000 },
      { name: 'Cretaceous', start: -145_000_000, end: -66_000_000 },
    ]
  ),
  cosmicItem(
    'flowering-plants', 'Flowering Plants (Angiosperms)',
    -140_000_000, 2025,
    'life', '🌸',
    'Angiosperms appear and begin a dramatic takeover of terrestrial ecosystems, co-evolving with insect pollinators. Today, flowering plants make up roughly 90% of all plant species.',
    []
  ),
  cosmicItem(
    'rise-of-mammals', 'Rise of Mammals',
    -66_000_000, 2025,
    'life', '🐾',
    'With the dinosaurs gone, mammals diversify rapidly to fill vacant ecological niches. From tiny insectivores, they evolve into whales, bats, elephants, and eventually primates.',
    [
      { name: 'Early Diversification', start: -66_000_000, end: -23_000_000 },
      { name: 'Modern Mammals', start: -23_000_000, end: 2025 },
    ]
  ),
  cosmicItem(
    'great-apes-hominins', 'Great Apes & Hominins',
    -7_000_000, -300_000,
    'life', '🦍',
    'The human lineage diverges from other great apes. Over millions of years, hominins evolve bipedalism, larger brains, and tool use — from Australopithecus through Homo erectus to the threshold of Homo sapiens.',
    [
      { name: 'Early Hominins', start: -7_000_000, end: -2_500_000 },
      { name: 'Homo genus', start: -2_500_000, end: -300_000 },
    ]
  ),
  cosmicItem(
    'homo-sapiens', 'Homo Sapiens',
    -300_000, 2025,
    'life', '🧑',
    'Anatomically modern humans emerge in Africa. With complex language, abstract thought, and sophisticated tool use, they spread across every continent and reshape the planet.',
    [
      { name: 'Hunter-Gatherers', start: -300_000, end: -12_000 },
      { name: 'Civilisation', start: -12_000, end: 2025 },
    ]
  ),

  // =========================================================
  // EXTINCTION EVENTS
  // =========================================================
  cosmicItem(
    'great-oxygenation-extinction', 'Great Oxygenation Extinction',
    -2_400_000_000, -2_000_000_000,
    'extinctions', '🫧',
    'Often called the first mass extinction — the rise of free oxygen is catastrophically toxic to the anaerobic organisms that dominate Earth, wiping out vast numbers of microbial species in the most dramatic atmospheric transformation in Earth\'s history.',
    []
  ),
  cosmicItem(
    'ordovician-extinction', 'End-Ordovician Extinction',
    -445_000_000, -443_000_000,
    'extinctions', '❄️',
    'A severe glaciation causes dramatic sea-level drops, wiping out roughly 85% of marine species — one of the Big Five mass extinctions. The cause was a sudden and severe ice age that froze much of the planet.',
    []
  ),
  cosmicItem(
    'late-devonian', 'Late Devonian Extinction',
    -375_000_000, -360_000_000,
    'extinctions', '💀',
    'A prolonged extinction event wipes out roughly 75% of species, devastating marine life. The cause remains debated — ocean anoxia, climate change, and asteroid impacts have all been proposed.',
    []
  ),
  cosmicItem(
    'capitanian-extinction', 'Capitanian Extinction',
    -262_000_000, -260_000_000,
    'extinctions', '🌋',
    'A significant extinction event linked to the Emeishan Traps volcanism in what is now southern China, wiping out many tropical marine species and foreshadowing the Great Dying.',
    []
  ),
  cosmicItem(
    'great-dying', 'The Great Dying (Permian–Triassic)',
    -252_000_000, -250_000_000,
    'extinctions', '☠️',
    'The most catastrophic extinction in Earth\'s history. Roughly 96% of marine species and 70% of land vertebrates perish, likely triggered by massive volcanic eruptions in Siberia.',
    []
  ),
  cosmicItem(
    'triassic-jurassic', 'Triassic–Jurassic Extinction',
    -201_000_000, -200_000_000,
    'extinctions', '🌋',
    'A mass extinction linked to volcanic activity in the Central Atlantic Magmatic Province clears the way for dinosaurs to become the dominant land animals.',
    []
  ),
  cosmicItem(
    'kpg-extinction', 'K-Pg Extinction (Asteroid Impact)',
    -66_000_000, -65_000_000,
    'extinctions', '☄️',
    'A 10km-wide asteroid strikes the Yucatan Peninsula, triggering global firestorms, impact winter, and acid rain. The non-avian dinosaurs are wiped out, opening the door for mammals.',
    []
  ),
  cosmicItem(
    'holocene-extinction', 'Holocene Extinction (Ongoing)',
    -50_000, 2025,
    'extinctions', '🦤',
    'The ongoing human-caused mass extinction. From Pleistocene megafauna to the dodo and beyond, human activity has driven thousands of species to extinction and threatens millions more — currently estimated at 1,000 times the background extinction rate.',
    [
      { name: 'Megafauna Loss', start: -50_000, end: -10_000 },
      { name: 'Modern Crisis', start: 1500, end: 2025 },
    ]
  ),
];

// Exported log-space bounds (with padding)
const LOG_MIN_RAW = yearToLog(-13_800_000_000);
const LOG_MAX_RAW = yearToLog(2025);
const LOG_PAD = (LOG_MAX_RAW - LOG_MIN_RAW) * 0.03;
export const COSMIC_LOG_MIN = LOG_MIN_RAW - LOG_PAD;
export const COSMIC_LOG_MAX = LOG_MAX_RAW + LOG_PAD;
