export const technologyCategories = [
  { id: 'communication', name: 'Communication', color: '#3B82F6' },
  { id: 'transportation', name: 'Transportation', color: '#F97316' },
  { id: 'computing', name: 'Computing', color: '#8B5CF6' },
  { id: 'energy', name: 'Energy', color: '#EAB308' },
  { id: 'medicine', name: 'Medicine', color: '#EF4444' },
  { id: 'manufacturing', name: 'Manufacturing', color: '#6B7280' },
  { id: 'agriculture', name: 'Agriculture', color: '#22C55E' },
  { id: 'warfare', name: 'Warfare', color: '#991B1B' },
];

export const technologies = [
  // =========================================================
  // COMMUNICATION
  // =========================================================
  {
    id: 'writing-systems',
    name: 'Writing Systems',
    start: -3400,
    end: 2025,
    region: 'communication',
    icon: '🔤',
    description: 'From Sumerian cuneiform pressed into clay tablets to the alphabets that underpin every modern language, writing transformed humanity\'s ability to record, transmit, and accumulate knowledge across generations.',
    periods: [
      { name: 'Cuneiform', start: -3400, end: -500 },
      { name: 'Alphabets', start: -1050, end: 2025 },
    ],
  },
  {
    id: 'printing',
    name: 'Printing',
    start: -200,
    end: 2025,
    region: 'communication',
    icon: '🖨️',
    description: 'The technology that democratised knowledge. From Chinese woodblock printing to Gutenberg\'s movable type, the printing press fuelled the Renaissance, the Reformation, and the Scientific Revolution.',
    periods: [
      { name: 'Woodblock', start: -200, end: 1440 },
      { name: 'Movable Type', start: 1440, end: 1800 },
      { name: 'Industrial Press', start: 1800, end: 2025 },
    ],
  },
  {
    id: 'telegraph-telephone',
    name: 'Telegraph & Telephone',
    start: 1837,
    end: 2025,
    region: 'communication',
    icon: '📞',
    description: 'The first technologies to transmit human communication at the speed of electricity. The telegraph shrank the world overnight, and the telephone made real-time voice conversation across continents possible.',
    periods: [
      { name: 'Telegraph', start: 1837, end: 1900 },
      { name: 'Telephone', start: 1876, end: 2025 },
    ],
  },
  {
    id: 'radio-television',
    name: 'Radio & Television',
    start: 1895,
    end: 2025,
    region: 'communication',
    icon: '📻',
    description: 'Broadcast technologies that created shared cultural experiences for billions. Radio united nations through wartime and music, while television brought moving images into every living room on Earth.',
    periods: [
      { name: 'Radio', start: 1895, end: 1950 },
      { name: 'Television', start: 1927, end: 2025 },
    ],
  },
  {
    id: 'internet-web',
    name: 'Internet & Web',
    start: 1969,
    end: 2025,
    region: 'communication',
    icon: '🌐',
    description: 'The most transformative communication technology since the printing press. What began as a Cold War military network became a global web connecting billions of people and reshaping every facet of modern life.',
    periods: [
      { name: 'ARPANET', start: 1969, end: 1990 },
      { name: 'World Wide Web', start: 1990, end: 2025 },
    ],
  },

  // =========================================================
  // TRANSPORTATION
  // =========================================================
  {
    id: 'wheel-axle',
    name: 'Wheel & Axle',
    start: -3500,
    end: 2025,
    region: 'transportation',
    icon: '☸️',
    description: 'One of the most fundamental inventions in human history. First used for pottery, the wheel was soon paired with the axle to revolutionise transport, warfare, and agriculture across the ancient world.',
    periods: [
      { name: 'Invention', start: -3500, end: -2000 },
      { name: 'Chariots', start: -2000, end: -500 },
    ],
  },
  {
    id: 'sailing',
    name: 'Sailing',
    start: -3000,
    end: 2025,
    region: 'transportation',
    icon: '⛵',
    description: 'Harnessing the wind allowed humanity to cross rivers, seas, and oceans. Sailing vessels enabled global trade, exploration, empire-building, and the interconnection of distant civilisations.',
    periods: [
      { name: 'River Sailing', start: -3000, end: -1000 },
      { name: 'Ocean Sailing', start: -1000, end: 1850 },
      { name: 'Steam Ships', start: 1807, end: 1960 },
    ],
  },
  {
    id: 'railways',
    name: 'Railways',
    start: 1804,
    end: 2025,
    region: 'transportation',
    icon: '🚂',
    description: 'The iron horse transformed the world by making overland mass transit fast and reliable. Railways drove industrialisation, connected nations, and shrank travel times from weeks to hours.',
    periods: [
      { name: 'Steam', start: 1804, end: 1960 },
      { name: 'Diesel & Electric', start: 1890, end: 2025 },
      { name: 'High Speed', start: 1964, end: 2025 },
    ],
  },
  {
    id: 'automobiles',
    name: 'Automobiles',
    start: 1886,
    end: 2025,
    region: 'transportation',
    icon: '🚗',
    description: 'Karl Benz\'s patent motorcar launched a revolution in personal freedom and urban design. The automobile reshaped cities, created suburbs, and became the defining machine of the twentieth century.',
    periods: [
      { name: 'Early Cars', start: 1886, end: 1913 },
      { name: 'Mass Production', start: 1913, end: 1970 },
      { name: 'Modern Era', start: 1970, end: 2025 },
    ],
  },
  {
    id: 'aviation',
    name: 'Aviation',
    start: 1903,
    end: 2025,
    region: 'transportation',
    icon: '✈️',
    description: 'From the Wright brothers\' twelve-second flight at Kitty Hawk to jumbo jets carrying millions daily, aviation conquered the skies and made the entire planet accessible within hours.',
    periods: [
      { name: 'Propeller Era', start: 1903, end: 1945 },
      { name: 'Jet Age', start: 1945, end: 2025 },
    ],
  },
  {
    id: 'rocketry-spaceflight',
    name: 'Rocketry & Spaceflight',
    start: 1926,
    end: 2025,
    region: 'transportation',
    icon: '🚀',
    description: 'Humanity\'s boldest technological leap. From Robert Goddard\'s first liquid-fuelled rocket to the Moon landings and Mars rovers, spaceflight expanded civilisation\'s reach beyond Earth itself.',
    periods: [
      { name: 'Military Rockets', start: 1926, end: 1957 },
      { name: 'Space Age', start: 1957, end: 2025 },
    ],
  },

  // =========================================================
  // COMPUTING
  // =========================================================
  {
    id: 'mechanical-computing',
    name: 'Mechanical Computing',
    start: 1623,
    end: 1945,
    region: 'computing',
    icon: '⚙️',
    description: 'The intellectual ancestors of the modern computer. From Pascal\'s calculator to Babbage\'s visionary Analytical Engine, these machines proved that complex thought could be mechanised.',
    periods: [
      { name: 'Calculators', start: 1623, end: 1834 },
      { name: 'Babbage & Lovelace', start: 1834, end: 1945 },
    ],
  },
  {
    id: 'electronic-computers',
    name: 'Electronic Computers',
    start: 1936,
    end: 2025,
    region: 'computing',
    icon: '🖥️',
    description: 'From room-sized mainframes cracking wartime codes to laptops in every backpack, electronic computers became the most versatile tool ever created, underpinning virtually every aspect of modern civilisation.',
    periods: [
      { name: 'Mainframes', start: 1936, end: 1970 },
      { name: 'Minicomputers', start: 1970, end: 1990 },
      { name: 'PCs & Laptops', start: 1981, end: 2025 },
    ],
  },
  {
    id: 'software-programming',
    name: 'Software & Programming',
    start: 1843,
    end: 2025,
    region: 'computing',
    icon: '💻',
    description: 'The invisible architecture of the digital world. Beginning with Ada Lovelace\'s first algorithm, programming languages evolved from machine code to high-level languages that power everything from websites to spacecraft.',
    periods: [
      { name: 'Theory', start: 1843, end: 1957 },
      { name: 'Languages', start: 1957, end: 2025 },
    ],
  },
  {
    id: 'smartphones',
    name: 'Smartphones',
    start: 1992,
    end: 2025,
    region: 'computing',
    icon: '📱',
    description: 'A pocket-sized supercomputer that combined phone, camera, GPS, and the entire internet into a single device. The smartphone became the most rapidly adopted technology in human history.',
    periods: [
      { name: 'Early PDAs', start: 1992, end: 2007 },
      { name: 'Modern Smartphones', start: 2007, end: 2025 },
    ],
  },
  {
    id: 'artificial-intelligence',
    name: 'Artificial Intelligence',
    start: 1956,
    end: 2025,
    region: 'computing',
    icon: '🤖',
    description: 'The quest to build machines that think. From early symbolic reasoning to deep neural networks capable of generating text, images, and code, AI is reshaping what it means to be intelligent.',
    periods: [
      { name: 'Symbolic AI', start: 1956, end: 1990 },
      { name: 'Machine Learning', start: 1990, end: 2017 },
      { name: 'Deep Learning', start: 2012, end: 2025 },
    ],
  },

  // =========================================================
  // ENERGY
  // =========================================================
  {
    id: 'wind-water-power',
    name: 'Wind & Water Power',
    start: -500,
    end: 2025,
    region: 'energy',
    icon: '💨',
    description: 'The original renewable energy sources. Watermills ground grain for ancient Rome, windmills drained the Netherlands, and their modern descendants now generate clean electricity at massive scale.',
    periods: [
      { name: 'Watermills', start: -500, end: 1800 },
      { name: 'Windmills', start: 600, end: 1900 },
      { name: 'Modern Renewables', start: 1970, end: 2025 },
    ],
  },
  {
    id: 'steam-power',
    name: 'Steam Power',
    start: 1698,
    end: 1960,
    region: 'energy',
    icon: '♨️',
    description: 'The engine of the Industrial Revolution. Newcomen\'s and Watt\'s steam engines liberated humanity from muscle power, driving factories, railways, and ships that transformed the modern world.',
    periods: [
      { name: 'Newcomen & Watt', start: 1698, end: 1830 },
      { name: 'Industrial Steam', start: 1830, end: 1960 },
    ],
  },
  {
    id: 'electricity',
    name: 'Electricity',
    start: 1752,
    end: 2025,
    region: 'energy',
    icon: '⚡',
    description: 'From Benjamin Franklin\'s kite experiment to the vast power grids that light up cities, electricity became the lifeblood of modern civilisation, powering everything from light bulbs to supercomputers.',
    periods: [
      { name: 'Discovery', start: 1752, end: 1880 },
      { name: 'Grid Power', start: 1880, end: 2025 },
    ],
  },
  {
    id: 'nuclear-power',
    name: 'Nuclear Power',
    start: 1942,
    end: 2025,
    region: 'energy',
    icon: '☢️',
    description: 'Harnessing the energy locked inside the atom. Born from the Manhattan Project, civilian nuclear power now provides roughly ten percent of the world\'s electricity with zero direct carbon emissions.',
    periods: [
      { name: 'Manhattan Project', start: 1942, end: 1954 },
      { name: 'Civilian Power', start: 1954, end: 2025 },
    ],
  },
  {
    id: 'solar-energy',
    name: 'Solar Energy',
    start: 1839,
    end: 2025,
    region: 'energy',
    icon: '☀️',
    description: 'Turning sunlight directly into electricity. From Becquerel\'s discovery of the photovoltaic effect to vast solar farms, this technology offers humanity a path to virtually limitless clean energy.',
    periods: [
      { name: 'Photovoltaic Discovery', start: 1839, end: 1954 },
      { name: 'Modern Solar', start: 1954, end: 2025 },
    ],
  },

  // =========================================================
  // MEDICINE
  // =========================================================
  {
    id: 'surgery',
    name: 'Surgery',
    start: -2500,
    end: 2025,
    region: 'medicine',
    icon: '🔬',
    description: 'From ancient trepanation to robotic-assisted procedures, surgery evolved from a desperate gamble into a precise science. Anaesthesia and antiseptics in the 1800s transformed it from barbaric ordeal to life-saving art.',
    periods: [
      { name: 'Ancient Surgery', start: -2500, end: 1540 },
      { name: 'Modern Surgery', start: 1540, end: 2025 },
    ],
  },
  {
    id: 'vaccination',
    name: 'Vaccination',
    start: 1796,
    end: 2025,
    region: 'medicine',
    icon: '💉',
    description: 'The single greatest life-saving innovation in medical history. Edward Jenner\'s smallpox vaccine launched a revolution that has eradicated or controlled dozens of deadly diseases worldwide.',
    periods: [
      { name: 'Smallpox Era', start: 1796, end: 1950 },
      { name: 'Mass Immunisation', start: 1950, end: 2025 },
    ],
  },
  {
    id: 'antibiotics',
    name: 'Antibiotics',
    start: 1928,
    end: 2025,
    region: 'medicine',
    icon: '💊',
    description: 'Alexander Fleming\'s accidental discovery of penicillin ushered in the antibiotic era, turning once-fatal bacterial infections into treatable conditions and adding decades to average human lifespan.',
    periods: [
      { name: 'Penicillin', start: 1928, end: 1960 },
      { name: 'Broad-spectrum', start: 1960, end: 2025 },
    ],
  },
  {
    id: 'medical-imaging',
    name: 'Medical Imaging',
    start: 1895,
    end: 2025,
    region: 'medicine',
    icon: '🩻',
    description: 'The ability to see inside the living human body without cutting it open. From Roentgen\'s X-rays to CT scans and MRI, imaging technologies revolutionised diagnosis and transformed modern medicine.',
    periods: [
      { name: 'X-Rays', start: 1895, end: 1970 },
      { name: 'CT & MRI', start: 1970, end: 2025 },
    ],
  },

  // =========================================================
  // MANUFACTURING
  // =========================================================
  {
    id: 'metallurgy',
    name: 'Metallurgy',
    start: -3300,
    end: 2025,
    region: 'manufacturing',
    icon: '⚒️',
    description: 'The mastery of metals defined entire ages of human civilisation. From bronze tools to iron ploughs to the steel skyscrapers and bridges of the modern world, metallurgy built the physical infrastructure of progress.',
    periods: [
      { name: 'Bronze Age', start: -3300, end: -1200 },
      { name: 'Iron Age', start: -1200, end: 1850 },
      { name: 'Steel Age', start: 1850, end: 2025 },
    ],
  },
  {
    id: 'textiles',
    name: 'Textiles',
    start: -5000,
    end: 2025,
    region: 'manufacturing',
    icon: '🧵',
    description: 'The fabric of civilisation, quite literally. Hand weaving clothed humanity for millennia, then the mechanised loom sparked the Industrial Revolution and created the first factory system.',
    periods: [
      { name: 'Hand Weaving', start: -5000, end: 1764 },
      { name: 'Mechanised', start: 1764, end: 2025 },
    ],
  },
  {
    id: 'assembly-line',
    name: 'Assembly Line & Mass Production',
    start: 1798,
    end: 2025,
    region: 'manufacturing',
    icon: '🏭',
    description: 'The techniques that made modern consumer society possible. From Eli Whitney\'s interchangeable parts to Ford\'s assembly line to robotic automation, mass production put affordable goods within everyone\'s reach.',
    periods: [
      { name: 'Interchangeable Parts', start: 1798, end: 1913 },
      { name: 'Ford Assembly Line', start: 1913, end: 1970 },
      { name: 'Automation', start: 1970, end: 2025 },
    ],
  },

  // =========================================================
  // AGRICULTURE
  // =========================================================
  {
    id: 'irrigation',
    name: 'Irrigation',
    start: -6000,
    end: 2025,
    region: 'agriculture',
    icon: '🌾',
    description: 'The technology that made civilisation possible. By channelling water to crops, irrigation freed humanity from dependence on rainfall, enabling cities, empires, and population growth on an unprecedented scale.',
    periods: [
      { name: 'Ancient Irrigation', start: -6000, end: 500 },
      { name: 'Medieval Systems', start: 500, end: 1700 },
      { name: 'Modern Irrigation', start: 1700, end: 2025 },
    ],
  },
  {
    id: 'mechanised-farming',
    name: 'Mechanised Farming',
    start: 1701,
    end: 2025,
    region: 'agriculture',
    icon: '🚜',
    description: 'Machines replaced muscle on the farm. Jethro Tull\'s seed drill began the process, steam tractors accelerated it, and today GPS-guided precision agriculture feeds eight billion people with a fraction of the labour.',
    periods: [
      { name: 'Seed Drills', start: 1701, end: 1830 },
      { name: 'Steam & Tractors', start: 1830, end: 1960 },
      { name: 'Precision Ag', start: 1960, end: 2025 },
    ],
  },

  // =========================================================
  // WARFARE
  // =========================================================
  {
    id: 'gunpowder-weapons',
    name: 'Gunpowder Weapons',
    start: 1000,
    end: 2025,
    region: 'warfare',
    icon: '💣',
    description: 'Gunpowder, invented in China, forever changed the face of warfare. From crude fire-lances to precision rifles and artillery, firearms ended the age of castles and armoured knights and reshaped global power.',
    periods: [
      { name: 'Early Firearms', start: 1000, end: 1500 },
      { name: 'Muskets & Cannons', start: 1500, end: 1850 },
      { name: 'Modern Arms', start: 1850, end: 2025 },
    ],
  },
  {
    id: 'naval-warfare',
    name: 'Naval Warfare',
    start: -1200,
    end: 2025,
    region: 'warfare',
    icon: '🚢',
    description: 'Control of the seas determined the fate of empires. From Greek triremes and Viking longships to ironclads and aircraft carriers, naval power has been the ultimate projection of military strength.',
    periods: [
      { name: 'Galleys', start: -1200, end: 1500 },
      { name: 'Age of Sail', start: 1500, end: 1860 },
      { name: 'Modern Navy', start: 1860, end: 2025 },
    ],
  },
  {
    id: 'nuclear-weapons',
    name: 'Nuclear Weapons',
    start: 1945,
    end: 2025,
    region: 'warfare',
    icon: '⚛️',
    description: 'The most destructive technology ever created. Nuclear weapons ended World War II and then held the world hostage during the Cold War, creating a paradox of peace through the threat of mutual annihilation.',
    periods: [
      { name: 'Development', start: 1945, end: 1970 },
      { name: 'Cold War Arsenal', start: 1970, end: 1991 },
      { name: 'Post\u2013Cold War', start: 1991, end: 2025 },
    ],
  },
];
