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
    'cosmic-dark-ages', 'Cosmic Dark Ages',
    -13_700_000_000, -13_500_000_000,
    'cosmic-structure', '🌑',
    'After the initial fireball cools, the universe enters a period of total darkness. No stars or galaxies exist yet — only a vast expanse of neutral hydrogen and helium gas.',
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
    'late-heavy-bombardment', 'Late Heavy Bombardment',
    -4_100_000_000, -3_800_000_000,
    'solar-system', '☄️',
    'A period of intense asteroid and comet impacts pummels the inner solar system, leaving heavily cratered surfaces on the Moon, Mercury, and Mars, and possibly delivering water to Earth.',
    []
  ),
  cosmicItem(
    'asteroid-belt', 'Asteroid Belt Stabilises',
    -4_500_000_000, -4_000_000_000,
    'solar-system', '🪨',
    'Millions of rocky fragments between Mars and Jupiter fail to coalesce into a planet due to Jupiter\'s immense gravity, forming a stable belt of asteroids.',
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
    'snowball-earth', 'Snowball Earth',
    -720_000_000, -635_000_000,
    'earth', '❄️',
    'Earth freezes almost entirely, with ice sheets extending to the equator. When volcanic CO2 eventually thaws the planet, the dramatic environmental upheaval may have triggered the evolution of complex animal life.',
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
    'late-devonian', 'Late Devonian Extinction',
    -375_000_000, -360_000_000,
    'extinctions', '💀',
    'A prolonged extinction event wipes out roughly 75% of species, devastating marine life. The cause remains debated — ocean anoxia, climate change, and asteroid impacts have all been proposed.',
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
];

// Exported log-space bounds (with padding)
const LOG_MIN_RAW = yearToLog(-13_800_000_000);
const LOG_MAX_RAW = yearToLog(2025);
const LOG_PAD = (LOG_MAX_RAW - LOG_MIN_RAW) * 0.03;
export const COSMIC_LOG_MIN = LOG_MIN_RAW - LOG_PAD;
export const COSMIC_LOG_MAX = LOG_MAX_RAW + LOG_PAD;
