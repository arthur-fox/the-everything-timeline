export const southKoreaCategories = [
  { id: 'ancient',    name: 'Ancient & Three Kingdoms', color: '#F59E0B' },
  { id: 'unified',    name: 'Unified & Goryeo',         color: '#C084FC' },
  { id: 'joseon',     name: 'Joseon Dynasty',           color: '#6366F1' },
  { id: 'modern',     name: 'Modern Korea',             color: '#3B82F6' },
  { id: 'conflicts',  name: 'Major Conflicts',          color: '#EF4444' },
];

export const southKoreaItems = [
  {
    id: 'gojoseon-three-kingdoms',
    name: 'Gojoseon & Three Kingdoms',
    start: -2333, end: 668,
    region: 'ancient',
    icon: '🏺',
    description: "According to Korean tradition, Dangun founded Gojoseon (2333 BCE) — Korea's mythological first state. The Three Kingdoms period (57 BCE–668 CE) saw Goguryeo (north, powerful warrior state), Baekje (southwest, cultural innovator), and Silla (southeast) compete for dominance. Buddhism arrived from China (4th century CE) and profoundly shaped Korean culture, art, and architecture. Goguryeo successfully repelled massive Tang Chinese invasions.",
    periods: [
      { name: 'Gojoseon', start: -2333, end: -108 },
      { name: 'Proto-Three Kingdoms', start: -108, end: 57 },
      { name: 'Three Kingdoms', start: 57, end: 668 },
    ],
  },
  {
    id: 'unified-silla',
    name: 'Unified Silla & Balhae',
    start: 668, end: 935,
    region: 'unified',
    icon: '👑',
    description: "Silla unified the peninsula with Tang Chinese aid (668 CE) and created Korea's first unified state. The Unified Silla period was a golden age of Buddhist art and culture — the Seokguram Grotto and Bulguksa Temple remain UNESCO masterpieces. The hwarang (elite warrior-scholars) embodied Silla's code of loyalty and skill. Silla declined through aristocratic power struggles; the Later Three Kingdoms period ended with Goryeo's reunification.",
    periods: [
      { name: 'Unified Silla', start: 668, end: 780 },
      { name: 'Silla Decline', start: 780, end: 935 },
    ],
  },
  {
    id: 'goryeo',
    name: 'Goryeo Dynasty',
    start: 918, end: 1392,
    region: 'unified',
    icon: '📜',
    description: "Wang Geon founded Goryeo (918 CE), from which 'Korea' takes its name. Goryeo was a sophisticated Buddhist state that produced the Tripitaka Koreana — 80,000 woodblocks of Buddhist scripture, still preserved at Haeinsa Temple. It also produced the world's first movable metal type (c. 1230), before Gutenberg. Goryeo survived Mongol invasions (1231–1259) but accepted vassal status, which eventually weakened the dynasty.",
    periods: [
      { name: 'Early Goryeo', start: 918, end: 1170 },
      { name: 'Military Rule', start: 1170, end: 1270 },
      { name: 'Mongol Period', start: 1270, end: 1392 },
    ],
  },
  {
    id: 'joseon-dynasty',
    name: 'Joseon Dynasty',
    start: 1392, end: 1897,
    region: 'joseon',
    icon: '🗼',
    description: "Yi Seonggye founded Joseon (1392) with Confucianism as the state ideology, replacing Buddhism. Sejong the Great (r. 1418–1450) created Hangul — the Korean alphabet — one of history's great achievements in literacy and linguistic analysis. The Imjin War (Japanese invasions 1592–1598) devastated the peninsula; Admiral Yi Sun-sin's turtle ships became legendary. The Manchu invasions (1627, 1636) forced Joseon into subservience to the Qing dynasty.",
    periods: [
      { name: 'Early Joseon & Sejong', start: 1392, end: 1494 },
      { name: 'Japanese Invasions', start: 1592, end: 1598 },
      { name: 'Late Joseon', start: 1600, end: 1897 },
    ],
  },
  {
    id: 'japanese-colonial',
    name: 'Japanese Colonial Period',
    start: 1897, end: 1945,
    region: 'conflicts',
    icon: '⚔️',
    description: "Japan forced Korea into a protectorate (1905) then annexed it outright (1910). Japanese colonial rule suppressed Korean language and culture; Koreans were used as forced labour in mines and factories. The March First Movement (1919) — a nationwide peaceful protest for independence — was brutally suppressed but inspired Korean nationalism. Korean 'comfort women' (enforced sexual slavery) remain a source of deep diplomatic tension with Japan.",
    periods: [
      { name: 'Korean Empire', start: 1897, end: 1910 },
      { name: 'Japanese Annexation', start: 1910, end: 1945 },
    ],
  },
  {
    id: 'korean-war',
    name: 'Division & Korean War',
    start: 1945, end: 1953,
    region: 'conflicts',
    icon: '💥',
    description: "After Japan's defeat (1945), Korea was arbitrarily divided at the 38th parallel — the USSR in the north, the USA in the south. Kim Il-sung's North Korea invaded the South (June 1950), triggering a UN (largely US) intervention. China entered the war (October 1950); brutal fighting left 3–5 million dead. The armistice (1953) restored the near-original border. Korea remains the world's most heavily fortified frontier — technically still at war.",
    periods: [
      { name: 'Division', start: 1945, end: 1950 },
      { name: 'Korean War', start: 1950, end: 1953 },
    ],
  },
  {
    id: 'modern-south-korea',
    name: 'Republic of Korea',
    start: 1953, end: 2025,
    region: 'modern',
    icon: '🇰🇷',
    description: "South Korea's 'Miracle on the Han River' transformed one of the world's poorest countries into a high-income economy within 50 years. Military dictators (Park Chung-hee, Chun Doo-hwan) drove industrialisation through chaebols (industrial conglomerates). Democracy was achieved after the 1987 June Democratic Struggle. Samsung, Hyundai, LG, and K-pop (BTS, BLACKPINK) made South Korea a global cultural and economic powerhouse. South Korea hosted the 1988 Olympics and 2002 FIFA World Cup.",
    periods: [
      { name: 'Authoritarian Development', start: 1953, end: 1987 },
      { name: 'Democratisation', start: 1987, end: 1997 },
      { name: 'Modern Korea', start: 1997, end: 2025 },
    ],
  },
];
