export const mexicoCategories = [
  { id: 'ancient',    name: 'Ancient Civilisations',   color: '#F59E0B' },
  { id: 'colonial',   name: 'Colonial New Spain',      color: '#78716C' },
  { id: 'republic',   name: 'Republic & Reform',       color: '#10B981' },
  { id: 'conflicts',  name: 'Major Conflicts',         color: '#EF4444' },
  { id: 'modern',     name: 'Modern Mexico',           color: '#3B82F6' },
];

export const mexicoItems = [
  {
    id: 'olmec-maya',
    name: 'Olmec & Early Civilisations',
    start: -2000, end: -300,
    region: 'ancient',
    icon: '🗿',
    description: "The Olmec (c. 1500–400 BCE) were Mesoamerica's 'mother culture' — the first complex civilisation in Mexico, producing colossal stone heads, a calendar system, and the concept of the ballgame. They influenced all subsequent Mesoamerican cultures. The Maya developed independently in southern Mexico and Central America, producing the most sophisticated writing system and astronomical knowledge in the pre-Columbian Americas.",
    periods: [
      { name: 'Olmec', start: -1500, end: -400 },
      { name: 'Zapotec & Transition', start: -400, end: 250 },
    ],
  },
  {
    id: 'teotihuacan-toltec',
    name: 'Teotihuacán & Toltec',
    start: -100, end: 1200,
    region: 'ancient',
    icon: '🔺',
    description: "Teotihuacán, near modern Mexico City, was the largest city in the pre-Columbian Americas at its height (c. 150–650 CE) with a population of 125,000–200,000 — one of the world's great cities. Its Pyramid of the Sun is one of the largest pyramids ever built. The city's collapse (c. 550–650 CE) remains mysterious. The Toltec city of Tula dominated central Mexico (900–1150 CE) and heavily influenced the Aztecs.",
    periods: [
      { name: 'Teotihuacán', start: -100, end: 650 },
      { name: 'Toltec', start: 900, end: 1150 },
    ],
  },
  {
    id: 'aztec-empire',
    name: 'Aztec Empire',
    start: 1300, end: 1521,
    region: 'ancient',
    icon: '🦅',
    description: "The Mexica (Aztecs) founded Tenochtitlán on an island in Lake Texcoco in 1325. Through the Triple Alliance with Texcoco and Tlacopan, they built an empire controlling most of central Mexico. Tenochtitlán was a marvel of urban planning: population 200,000–300,000, larger than any contemporary European city. Hernán Cortés's small force, allied with subject peoples who resented Aztec rule, and devastating European diseases conquered the empire by 1521.",
    periods: [
      { name: 'Foundation & Alliance', start: 1300, end: 1428 },
      { name: 'Imperial Height', start: 1428, end: 1519 },
      { name: 'Spanish Conquest', start: 1519, end: 1521 },
    ],
  },
  {
    id: 'colonial-new-spain',
    name: 'Colonial New Spain',
    start: 1521, end: 1821,
    region: 'colonial',
    icon: '⛪',
    description: "New Spain became Spain's richest colony. Silver mines at Zacatecas and Guanajuato produced enormous wealth. The indigenous population collapsed catastrophically due to disease (from perhaps 25 million to 1 million within a century). A complex caste system developed. The Catholic Church built magnificent baroque cathedrals and ran extensive missions. Sor Juana Inés de la Cruz (1648–1695) was one of the colonial era's great writers.",
    periods: [
      { name: 'Early Colonial', start: 1521, end: 1650 },
      { name: 'Height of New Spain', start: 1650, end: 1750 },
      { name: 'Pre-Independence', start: 1750, end: 1821 },
    ],
  },
  {
    id: 'independence-reform',
    name: 'Independence & Reform War',
    start: 1810, end: 1876,
    region: 'republic',
    icon: '🔔',
    description: "Father Miguel Hidalgo's Grito de Dolores (1810) launched the independence movement. After brutal warfare, Mexico achieved independence in 1821. The young republic was devastated by instability: over 50 presidents in 30 years, the disastrous Mexican-American War (1846–48) that lost half its territory, and French intervention (1862–1867) under Emperor Maximilian. Benito Juárez, Mexico's first indigenous president, led Reform War liberals to victory.",
    periods: [
      { name: 'Independence War', start: 1810, end: 1821 },
      { name: 'Santa Anna & US War', start: 1821, end: 1855 },
      { name: 'Juárez & Reform', start: 1855, end: 1876 },
    ],
  },
  {
    id: 'porfiriato-revolution',
    name: 'Porfiriato & Revolution',
    start: 1876, end: 1940,
    region: 'conflicts',
    icon: '🌵',
    description: "Porfirio Díaz's 35-year dictatorship (1876–1910) modernised Mexico through foreign investment while dispossessing peasants. The Mexican Revolution (1910–1920) was one of the first major revolutions of the 20th century, drawing in figures like Zapata, Villa, Carranza, and Obregón. Over a million died. The 1917 Constitution was remarkably progressive: land reform, workers' rights, and curbs on the Church. The PRI party dominated Mexican politics for 71 years.",
    periods: [
      { name: 'Porfiriato', start: 1876, end: 1910 },
      { name: 'Revolution', start: 1910, end: 1920 },
      { name: 'Consolidation', start: 1920, end: 1940 },
    ],
  },
  {
    id: 'modern-mexico',
    name: 'Modern Mexico',
    start: 1940, end: 2025,
    region: 'modern',
    icon: '🇲🇽',
    description: "Post-war Mexico industrialised rapidly under PRI rule ('Mexican Miracle', 1940s–70s). The 1985 Mexico City earthquake exposed government incompetence and galvanised civil society. NAFTA (1994) transformed the economy but also unleashed the Zapatista uprising in Chiapas. The PAN broke PRI's 71-year grip in 2000. Drug cartel violence has been Mexico's defining challenge since the 2000s. AMLO's government (2018–2024) and Claudia Sheinbaum's election (2024) continued the 'Fourth Transformation'.",
    periods: [
      { name: 'PRI Rule & Miracle', start: 1940, end: 1982 },
      { name: 'Debt Crisis & Transition', start: 1982, end: 2000 },
      { name: 'Post-PRI & Modern', start: 2000, end: 2025 },
    ],
  },
];
