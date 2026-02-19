export const scienceCategories = [
  { id: 'physics', name: 'Physics', color: '#6366F1' },
  { id: 'chemistry', name: 'Chemistry', color: '#F59E0B' },
  { id: 'biology', name: 'Biology', color: '#10B981' },
  { id: 'mathematics', name: 'Mathematics', color: '#3B82F6' },
  { id: 'astronomy', name: 'Astronomy', color: '#8B5CF6' },
  { id: 'medical-science', name: 'Medical Science', color: '#EF4444' },
  { id: 'earth-sciences', name: 'Earth Sciences', color: '#78716C' },
  { id: 'computer-science', name: 'Computer Science', color: '#EC4899' },
];

export const sciences = [
  // =========================================================
  // PHYSICS
  // =========================================================
  {
    id: 'greek-natural-philosophy',
    name: 'Greek Natural Philosophy',
    start: -600,
    end: -200,
    region: 'physics',
    icon: '🏛️',
    description: 'The earliest systematic attempt to explain the natural world without mythology. From Thales pondering the nature of matter to Aristotle\'s comprehensive physics, the Greeks laid the philosophical groundwork for all of science.',
    periods: [
      { name: 'Ionian School', start: -600, end: -450 },
      { name: 'Aristotelian Physics', start: -384, end: -200 },
    ],
  },
  {
    id: 'classical-mechanics',
    name: 'Classical Mechanics',
    start: 1687,
    end: 1905,
    region: 'physics',
    icon: '🍎',
    description: 'Newton\'s Principia revolutionised our understanding of motion and gravity, giving humanity the mathematical tools to predict everything from falling apples to orbiting planets. Later refined by Lagrange and Hamilton into elegant analytical frameworks.',
    periods: [
      { name: 'Newtonian', start: 1687, end: 1800 },
      { name: 'Lagrangian & Hamiltonian', start: 1788, end: 1905 },
    ],
  },
  {
    id: 'electromagnetism',
    name: 'Electromagnetism',
    start: 1600,
    end: 1905,
    region: 'physics',
    icon: '⚡',
    description: 'From Gilbert\'s early studies of magnetism to Maxwell\'s unifying equations, humanity discovered that electricity and magnetism are two faces of the same force. This insight paved the way for radio, television, and the modern electrical world.',
    periods: [
      { name: 'Electric Studies', start: 1600, end: 1820 },
      { name: 'Maxwell & Faraday', start: 1820, end: 1905 },
    ],
  },
  {
    id: 'thermodynamics',
    name: 'Thermodynamics',
    start: 1824,
    end: 1905,
    region: 'physics',
    icon: '🔥',
    description: 'The science of heat, energy, and entropy emerged from the steam engine age and grew into one of physics\' most universal frameworks. Boltzmann\'s statistical mechanics bridged the microscopic world of atoms with the macroscopic world we experience.',
    periods: [
      { name: 'Classical', start: 1824, end: 1877 },
      { name: 'Statistical Mechanics', start: 1877, end: 1905 },
    ],
  },
  {
    id: 'quantum-mechanics',
    name: 'Quantum Mechanics',
    start: 1900,
    end: 2025,
    region: 'physics',
    icon: '⚛️',
    description: 'Planck\'s discovery that energy comes in discrete packets shattered classical physics and unveiled a bizarre subatomic world where particles exist in superposition and entanglement defies intuition. The most precisely tested theory in all of science.',
    periods: [
      { name: 'Old Quantum Theory', start: 1900, end: 1925 },
      { name: 'Modern QM', start: 1925, end: 2025 },
    ],
  },
  {
    id: 'relativity',
    name: 'Relativity',
    start: 1905,
    end: 2025,
    region: 'physics',
    icon: '🕳️',
    description: 'Einstein\'s twin revolutions redefined space, time, and gravity. Special relativity revealed that mass and energy are interchangeable; general relativity showed that massive objects warp the fabric of spacetime itself.',
    periods: [
      { name: 'Special Relativity', start: 1905, end: 1915 },
      { name: 'General Relativity', start: 1915, end: 2025 },
    ],
  },
  {
    id: 'nuclear-particle-physics',
    name: 'Nuclear & Particle Physics',
    start: 1896,
    end: 2025,
    region: 'physics',
    icon: '☢️',
    description: 'From Becquerel\'s accidental discovery of radioactivity to the Standard Model and the Higgs boson, physicists have peeled back layer after layer of matter to reveal the fundamental building blocks of the universe.',
    periods: [
      { name: 'Radioactivity', start: 1896, end: 1932 },
      { name: 'Particle Physics', start: 1932, end: 2025 },
    ],
  },

  // =========================================================
  // CHEMISTRY
  // =========================================================
  {
    id: 'alchemy',
    name: 'Alchemy',
    start: 300,
    end: 1700,
    region: 'chemistry',
    icon: '⚗️',
    description: 'The mystical precursor to modern chemistry, spanning from Hellenistic Egypt through the Islamic world to medieval Europe. Though the quest to transmute lead into gold failed, alchemists discovered acids, distillation, and countless chemical processes along the way.',
    periods: [
      { name: 'Hellenistic Alchemy', start: 300, end: 700 },
      { name: 'Islamic Alchemy', start: 700, end: 1300 },
      { name: 'European Alchemy', start: 1300, end: 1700 },
    ],
  },
  {
    id: 'modern-chemistry',
    name: 'Modern Chemistry',
    start: 1789,
    end: 2025,
    region: 'chemistry',
    icon: '🧪',
    description: 'Lavoisier\'s meticulous experiments on combustion demolished the phlogiston theory and established chemistry as a quantitative science. The subsequent revolution in structural chemistry revealed how atoms bond together to form molecules.',
    periods: [
      { name: 'Lavoisier Era', start: 1789, end: 1860 },
      { name: 'Structural Chemistry', start: 1860, end: 2025 },
    ],
  },
  {
    id: 'periodic-table-atomic-theory',
    name: 'Periodic Table & Atomic Theory',
    start: 1803,
    end: 2025,
    region: 'chemistry',
    icon: '⚛️',
    description: 'Dalton proposed that all matter is composed of indivisible atoms, and Mendeleev arranged the elements into a periodic table so powerful it predicted elements not yet discovered. One of science\'s most elegant organisational achievements.',
    periods: [
      { name: 'Dalton\'s Atoms', start: 1803, end: 1869 },
      { name: 'Mendeleev\'s Table', start: 1869, end: 2025 },
    ],
  },
  {
    id: 'biochemistry',
    name: 'Biochemistry',
    start: 1828,
    end: 2025,
    region: 'chemistry',
    icon: '🧬',
    description: 'When Wohler synthesised urea from inorganic compounds, he shattered the belief that life\'s chemistry was fundamentally different. This opened the door to understanding the molecular machinery of life, from enzymes to DNA.',
    periods: [
      { name: 'Organic Chemistry', start: 1828, end: 1950 },
      { name: 'Molecular Biology', start: 1950, end: 2025 },
    ],
  },

  // =========================================================
  // BIOLOGY
  // =========================================================
  {
    id: 'natural-history-taxonomy',
    name: 'Natural History & Taxonomy',
    start: 1735,
    end: 2025,
    region: 'biology',
    icon: '🌿',
    description: 'Linnaeus created a universal system for naming and classifying every living organism on Earth, bringing order to the bewildering diversity of life. His binomial nomenclature remains the foundation of biological classification today.',
    periods: [
      { name: 'Linnaean Classification', start: 1735, end: 1859 },
      { name: 'Modern Taxonomy', start: 1859, end: 2025 },
    ],
  },
  {
    id: 'evolution',
    name: 'Evolution',
    start: 1859,
    end: 2025,
    region: 'biology',
    icon: '🐒',
    description: 'Darwin\'s theory of natural selection is arguably the most transformative idea in the history of biology, explaining how the staggering diversity of life arose from common ancestors. The Modern Synthesis merged it with genetics to form the bedrock of modern biology.',
    periods: [
      { name: 'Darwinian Theory', start: 1859, end: 1930 },
      { name: 'Modern Synthesis', start: 1930, end: 2025 },
    ],
  },
  {
    id: 'genetics-dna',
    name: 'Genetics & DNA',
    start: 1865,
    end: 2025,
    region: 'biology',
    icon: '🧬',
    description: 'Mendel\'s humble pea experiments revealed the laws of heredity, and nearly a century later Watson and Crick uncovered the double-helix structure of DNA. Together they unlocked the code of life itself.',
    periods: [
      { name: 'Mendelian', start: 1865, end: 1953 },
      { name: 'Molecular Genetics', start: 1953, end: 2025 },
    ],
  },
  {
    id: 'cell-biology',
    name: 'Cell Biology',
    start: 1665,
    end: 2025,
    region: 'biology',
    icon: '🔬',
    description: 'When Hooke peered through his microscope and saw tiny chambers he called "cells," he opened a window into the fundamental unit of all life. Cell theory established that every living organism is built from these microscopic building blocks.',
    periods: [
      { name: 'Cell Discovery', start: 1665, end: 1839 },
      { name: 'Cell Theory', start: 1839, end: 2025 },
    ],
  },
  {
    id: 'ecology',
    name: 'Ecology',
    start: 1866,
    end: 2025,
    region: 'biology',
    icon: '🌍',
    description: 'Haeckel coined the term "ecology" to describe the study of organisms and their environments, giving rise to a discipline that reveals the intricate web of relationships sustaining all life on Earth. Now more urgent than ever in an era of climate change.',
    periods: [
      { name: 'Classical Ecology', start: 1866, end: 1960 },
      { name: 'Systems Ecology', start: 1960, end: 2025 },
    ],
  },

  // =========================================================
  // MATHEMATICS
  // =========================================================
  {
    id: 'greek-mathematics',
    name: 'Greek Mathematics',
    start: -600,
    end: -200,
    region: 'mathematics',
    icon: '📐',
    description: 'The Greeks transformed mathematics from a practical tool into a rigorous intellectual pursuit. From Pythagoras\' theorem to Euclid\'s Elements, they established the axiomatic method and deductive reasoning that underpin all of modern mathematics.',
    periods: [
      { name: 'Pythagorean', start: -600, end: -400 },
      { name: 'Euclidean', start: -300, end: -200 },
    ],
  },
  {
    id: 'islamic-golden-age-mathematics',
    name: 'Islamic Golden Age Mathematics',
    start: 750,
    end: 1258,
    region: 'mathematics',
    icon: '🧮',
    description: 'Al-Khwarizmi gave us algebra and the algorithm, while scholars across the Islamic world preserved Greek knowledge and pushed mathematics far beyond its classical boundaries. Their work bridged antiquity and the European Renaissance.',
    periods: [
      { name: 'Algebra', start: 750, end: 1000 },
      { name: 'Advanced Methods', start: 1000, end: 1258 },
    ],
  },
  {
    id: 'calculus',
    name: 'Calculus',
    start: 1665,
    end: 2025,
    region: 'mathematics',
    icon: '∫',
    description: 'Independently invented by Newton and Leibniz, calculus gave humanity the language to describe change and accumulation. It became the indispensable mathematical engine powering physics, engineering, economics, and virtually every quantitative science.',
    periods: [
      { name: 'Newton & Leibniz', start: 1665, end: 1800 },
      { name: 'Analysis', start: 1800, end: 2025 },
    ],
  },
  {
    id: 'statistics-probability',
    name: 'Statistics & Probability',
    start: 1654,
    end: 2025,
    region: 'mathematics',
    icon: '📊',
    description: 'Born from a gambling puzzle posed to Pascal and Fermat, probability theory grew into the mathematical framework for reasoning under uncertainty. Modern statistics now underpins medicine, science, economics, and machine learning.',
    periods: [
      { name: 'Foundations', start: 1654, end: 1900 },
      { name: 'Modern Statistics', start: 1900, end: 2025 },
    ],
  },

  // =========================================================
  // ASTRONOMY
  // =========================================================
  {
    id: 'ancient-astronomy',
    name: 'Ancient Astronomy',
    start: -3000,
    end: 500,
    region: 'astronomy',
    icon: '⭐',
    description: 'For millennia, humans tracked the heavens with astonishing precision using only their eyes. Mesopotamian astronomers catalogued the stars and predicted eclipses, while Greek thinkers like Ptolemy built geometric models of the cosmos.',
    periods: [
      { name: 'Mesopotamian', start: -3000, end: -600 },
      { name: 'Greek', start: -600, end: 500 },
    ],
  },
  {
    id: 'copernican-revolution',
    name: 'Copernican Revolution',
    start: 1543,
    end: 1687,
    region: 'astronomy',
    icon: '☀️',
    description: 'Copernicus dared to move the Earth from the centre of the universe, and Kepler discovered that planets travel in ellipses rather than perfect circles. This intellectual earthquake overthrew 1,500 years of geocentric dogma.',
    periods: [
      { name: 'Heliocentric Model', start: 1543, end: 1610 },
      { name: 'Keplerian', start: 1610, end: 1687 },
    ],
  },
  {
    id: 'modern-astronomy',
    name: 'Modern Astronomy',
    start: 1687,
    end: 2025,
    region: 'astronomy',
    icon: '🔭',
    description: 'Newton\'s gravitational theory turned astronomy into a predictive science, and the 20th century brought astrophysics, revealing the life cycles of stars, the nature of galaxies, and the expansion of the universe.',
    periods: [
      { name: 'Newtonian', start: 1687, end: 1920 },
      { name: 'Astrophysics', start: 1920, end: 2025 },
    ],
  },
  {
    id: 'cosmology',
    name: 'Cosmology',
    start: 1915,
    end: 2025,
    region: 'astronomy',
    icon: '🌌',
    description: 'Einstein\'s general relativity provided the framework for understanding the universe as a whole, leading to the discovery that the cosmos is expanding and began in a Big Bang nearly 14 billion years ago.',
    periods: [
      { name: 'Expanding Universe', start: 1915, end: 1965 },
      { name: 'Standard Model of Cosmology', start: 1965, end: 2025 },
    ],
  },

  // =========================================================
  // MEDICAL SCIENCE
  // =========================================================
  {
    id: 'hippocratic-medicine',
    name: 'Hippocratic Medicine',
    start: -400,
    end: 500,
    region: 'medical-science',
    icon: '⚕️',
    description: 'Hippocrates freed medicine from superstition by insisting that diseases have natural causes, not divine punishments. The Hippocratic oath and Galen\'s anatomical studies shaped medical practice for over a thousand years.',
    periods: [
      { name: 'Greek Medicine', start: -400, end: 200 },
      { name: 'Roman Medicine', start: 200, end: 500 },
    ],
  },
  {
    id: 'germ-theory',
    name: 'Germ Theory',
    start: 1860,
    end: 2025,
    region: 'medical-science',
    icon: '🦠',
    description: 'Pasteur and Koch proved that microorganisms cause disease, overturning centuries of miasma theory and launching the era of antiseptics, vaccines, and antibiotics. Perhaps the single greatest advance in the history of medicine.',
    periods: [
      { name: 'Pasteur & Koch', start: 1860, end: 1920 },
      { name: 'Microbiology', start: 1920, end: 2025 },
    ],
  },
  {
    id: 'neuroscience',
    name: 'Neuroscience',
    start: 1791,
    end: 2025,
    region: 'medical-science',
    icon: '🧠',
    description: 'Galvani\'s discovery that electricity activates nerves sparked the quest to understand the brain. From mapping neural circuits to brain imaging, neuroscience tackles the most complex object in the known universe.',
    periods: [
      { name: 'Electrophysiology', start: 1791, end: 1930 },
      { name: 'Modern Neuroscience', start: 1930, end: 2025 },
    ],
  },
  {
    id: 'immunology',
    name: 'Immunology',
    start: 1796,
    end: 2025,
    region: 'medical-science',
    icon: '💉',
    description: 'Jenner\'s cowpox vaccine against smallpox was humanity\'s first deliberate weapon against infectious disease. The study of the immune system has since given us vaccines, organ transplants, and treatments for autoimmune disorders.',
    periods: [
      { name: 'Early Immunology', start: 1796, end: 1900 },
      { name: 'Modern Immunology', start: 1900, end: 2025 },
    ],
  },

  // =========================================================
  // EARTH SCIENCES
  // =========================================================
  {
    id: 'geology',
    name: 'Geology',
    start: 1669,
    end: 2025,
    region: 'earth-sciences',
    icon: '🪨',
    description: 'Steno\'s principles of stratigraphy taught humanity to read the rock record like a book, revealing that the Earth is unimaginably ancient. Geology uncovered deep time and the dramatic history written in stone beneath our feet.',
    periods: [
      { name: 'Stratigraphy', start: 1669, end: 1830 },
      { name: 'Modern Geology', start: 1830, end: 2025 },
    ],
  },
  {
    id: 'plate-tectonics',
    name: 'Plate Tectonics',
    start: 1912,
    end: 2025,
    region: 'earth-sciences',
    icon: '🌋',
    description: 'Wegener\'s radical idea that continents drift was ridiculed for decades until seafloor spreading proved him right. Plate tectonics became geology\'s grand unifying theory, explaining earthquakes, volcanoes, and mountain building.',
    periods: [
      { name: 'Continental Drift', start: 1912, end: 1960 },
      { name: 'Plate Theory', start: 1960, end: 2025 },
    ],
  },
  {
    id: 'oceanography',
    name: 'Oceanography',
    start: 1872,
    end: 2025,
    region: 'earth-sciences',
    icon: '🌊',
    description: 'The HMS Challenger expedition launched the systematic study of the deep ocean, revealing an alien world of abyssal plains, hydrothermal vents, and ocean currents that regulate Earth\'s climate.',
    periods: [
      { name: 'Exploration', start: 1872, end: 1950 },
      { name: 'Modern Oceanography', start: 1950, end: 2025 },
    ],
  },
  {
    id: 'climate-science',
    name: 'Climate Science',
    start: 1824,
    end: 2025,
    region: 'earth-sciences',
    icon: '🌡️',
    description: 'Fourier first described the greenhouse effect in 1824, and Keeling\'s precise CO2 measurements at Mauna Loa sounded the alarm on rising atmospheric carbon. Climate science is now central to humanity\'s greatest existential challenge.',
    periods: [
      { name: 'Greenhouse Effect', start: 1824, end: 1958 },
      { name: 'Modern Climate Science', start: 1958, end: 2025 },
    ],
  },

  // =========================================================
  // COMPUTER SCIENCE
  // =========================================================
  {
    id: 'theory-of-computation',
    name: 'Theory of Computation',
    start: 1936,
    end: 2025,
    region: 'computer-science',
    icon: '🖥️',
    description: 'Turing and Church independently defined the mathematical limits of what can be computed, laying the theoretical foundations for every computer ever built. Complexity theory later revealed why some problems are inherently harder than others.',
    periods: [
      { name: 'Turing & Church', start: 1936, end: 1970 },
      { name: 'Complexity Theory', start: 1970, end: 2025 },
    ],
  },
  {
    id: 'programming-languages',
    name: 'Programming Languages',
    start: 1957,
    end: 2025,
    region: 'computer-science',
    icon: '💻',
    description: 'From FORTRAN and LISP to Python and Rust, programming languages evolved to bridge the gap between human thought and machine execution. Each generation brought new paradigms that transformed how we write software.',
    periods: [
      { name: 'Early Languages', start: 1957, end: 1980 },
      { name: 'Modern Languages', start: 1980, end: 2025 },
    ],
  },
  {
    id: 'networking-internet',
    name: 'Networking & Internet',
    start: 1969,
    end: 2025,
    region: 'computer-science',
    icon: '🌐',
    description: 'ARPANET connected four university computers in 1969; Tim Berners-Lee invented the World Wide Web in 1990. In just a few decades, the internet grew from a military experiment into the connective tissue of modern civilisation.',
    periods: [
      { name: 'ARPANET', start: 1969, end: 1990 },
      { name: 'World Wide Web', start: 1990, end: 2025 },
    ],
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    start: 1943,
    end: 2025,
    region: 'computer-science',
    icon: '🤖',
    description: 'McCulloch and Pitts\' mathematical model of a neuron planted the seed for artificial intelligence. After decades of winters and revivals, deep learning breakthroughs have made machines that can see, speak, translate, and create.',
    periods: [
      { name: 'Perceptrons', start: 1943, end: 1986 },
      { name: 'Neural Networks', start: 1986, end: 2012 },
      { name: 'Deep Learning', start: 2012, end: 2025 },
    ],
  },
];
