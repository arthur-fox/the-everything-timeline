export const greeceCategories = [
  { id: 'ancient',    name: 'Ancient Greece',           color: '#EAB308' },
  { id: 'hellenistic',name: 'Hellenistic & Roman',      color: '#6366F1' },
  { id: 'byzantine',  name: 'Byzantine & Ottoman',      color: '#C084FC' },
  { id: 'modern',     name: 'Modern Greece',            color: '#3B82F6' },
  { id: 'conflicts',  name: 'Major Conflicts',          color: '#EF4444' },
];

export const greeceItems = [
  {
    id: 'minoan-mycenaean',
    name: 'Minoan & Mycenaean',
    start: -3000, end: -800,
    region: 'ancient',
    icon: '🏺',
    description: "The Minoan civilisation on Crete (c. 3000–1450 BCE) was Bronze Age Europe's first advanced culture, known for its palace complexes at Knossos, linear script, and vibrant frescoes. The Mycenaeans on mainland Greece absorbed and supplanted them; their civilisation of warrior kings, palace economies, and epic warfare is preserved in Homer's Iliad and Odyssey. The Bronze Age collapse (c. 1200 BCE) destroyed Mycenaean civilisation, leading to a 'Dark Age' from which Classical Greece emerged.",
    periods: [
      { name: 'Minoan Crete', start: -3000, end: -1450 },
      { name: 'Mycenaean Greece', start: -1600, end: -1100 },
      { name: 'Greek Dark Ages', start: -1100, end: -800 },
    ],
  },
  {
    id: 'archaic-classical',
    name: 'Archaic & Classical Greece',
    start: -800, end: -323,
    region: 'ancient',
    icon: '🏛️',
    description: "The Archaic period saw the rise of the polis (city-state), colonisation of the Mediterranean, and the Olympic Games (776 BCE). Classical Athens produced democracy, philosophy (Socrates, Plato, Aristotle), drama (Sophocles, Euripides), history (Herodotus, Thucydides), and the Parthenon. The Persian Wars (490, 480 BCE) forged Greek identity; the Peloponnesian War (431–404 BCE) between Athens and Sparta exhausted both. Philip II of Macedon unified Greece before his assassination.",
    periods: [
      { name: 'Archaic Period', start: -800, end: -479 },
      { name: 'Classical Athens', start: -479, end: -404 },
      { name: 'Late Classical', start: -404, end: -323 },
    ],
  },
  {
    id: 'hellenistic-roman',
    name: 'Hellenistic & Roman Greece',
    start: -323, end: 330,
    region: 'hellenistic',
    icon: '📜',
    description: "Alexander the Great (356–323 BCE) spread Greek culture from Egypt to India, creating the Hellenistic world where Greek became the common language of scholarship. After his death, his generals divided the empire. Rome gradually absorbed Greek territories, but 'captive Greece took captive its rude conqueror' — Roman culture was profoundly Hellenised. Athens became the philosophical capital of the Roman world; Corinth a major commercial centre.",
    periods: [
      { name: 'Hellenistic Period', start: -323, end: -146 },
      { name: 'Roman Greece', start: -146, end: 330 },
    ],
  },
  {
    id: 'byzantine-greece',
    name: 'Byzantine Era',
    start: 330, end: 1453,
    region: 'byzantine',
    icon: '⛪',
    description: "With Constantine's transfer of the Roman capital to Constantinople (330 CE), Greece became the core of the Eastern Roman (Byzantine) Empire. Greek became the official language; Orthodox Christianity the state religion. Thessaloniki was the empire's second city. Byzantium preserved classical learning through the medieval period. The empire gradually shrank under pressure from Slavic migrations, Arab invasions, and Crusader attacks until the final Ottoman conquest of Constantinople in 1453.",
    periods: [
      { name: 'Early Byzantine', start: 330, end: 700 },
      { name: 'Middle Byzantine', start: 700, end: 1204 },
      { name: 'Late Byzantine', start: 1204, end: 1453 },
    ],
  },
  {
    id: 'ottoman-greece',
    name: 'Ottoman Greece',
    start: 1453, end: 1821,
    region: 'byzantine',
    icon: '🕌',
    description: "Most of Greece came under Ottoman rule between 1453 and 1460. The Orthodox Church preserved Greek identity under Ottoman rule. The Phanariot Greeks (wealthy Constantinople merchants) served as Ottoman administrators and translators. Greek merchants and intellectuals across the diaspora kept Hellenic culture alive. The Enlightenment and French Revolution inspired Greek nationalists; secret societies like the Filiki Eteria planned revolution.",
    periods: [
      { name: 'Early Ottoman', start: 1453, end: 1600 },
      { name: 'Phanariot Era', start: 1600, end: 1821 },
    ],
  },
  {
    id: 'independence-war',
    name: 'Greek War of Independence',
    start: 1821, end: 1832,
    region: 'conflicts',
    icon: '🔵',
    description: "The Greek Revolution (1821) began on 25 March — now Greece's national day. The war attracted Philhellenes from across Europe, including Lord Byron, who died at Missolonghi. Ottoman reprisals were brutal, including the massacres of Chios (1822) and Missolonghi (1826). European powers — Britain, France, and Russia — intervened at the Battle of Navarino (1827), destroying the Ottoman-Egyptian fleet. Greek independence was recognised in 1830; a Bavarian prince became King Otto.",
    periods: [
      { name: 'Revolutionary War', start: 1821, end: 1827 },
      { name: 'European Intervention', start: 1827, end: 1832 },
    ],
  },
  {
    id: 'modern-greece',
    name: 'Modern Greece',
    start: 1832, end: 2025,
    region: 'modern',
    icon: '🇬🇷',
    description: "Modern Greece expanded gradually — acquiring Thessaly (1881), Macedonia and Crete (1912–13), and Thrace after WWI. The Asia Minor Catastrophe (1922) ended Greek presence in Anatolia after 3,000 years. WWII brought brutal Axis occupation and devastating civil war (1946–1949). Military junta ruled 1967–1974. Greece joined the EU (1981) and eurozone (2001). The 2010 debt crisis led to severe austerity. Greece's ancient legacy continues to shape Western civilisation.",
    periods: [
      { name: 'Kingdom & Megali Idea', start: 1832, end: 1922 },
      { name: 'Post-War & Junta', start: 1940, end: 1974 },
      { name: 'Democratic Republic', start: 1974, end: 2025 },
    ],
  },
];
