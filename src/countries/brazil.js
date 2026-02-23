export const brazilCategories = [
  { id: 'indigenous', name: 'Indigenous & Colonial',    color: '#78716C' },
  { id: 'empire',     name: 'Portuguese Empire & Empire of Brazil', color: '#EAB308' },
  { id: 'republic',   name: 'Republic & Modern',        color: '#10B981' },
  { id: 'conflicts',  name: 'Major Conflicts & Politics', color: '#EF4444' },
  { id: 'culture',    name: 'Culture & Society',        color: '#8B5CF6' },
];

export const brazilItems = [
  {
    id: 'pre-columbian-brazil',
    name: 'Pre-Columbian Brazil',
    start: -12000, end: 1500,
    region: 'indigenous',
    icon: '🌿',
    description: "Before European contact, Brazil was home to hundreds of indigenous peoples — perhaps 2–4 million people — including the Tupinambá, Guaraní, Yanomami, and many others. Complex chiefdoms and ceremonial centres existed in the Amazon basin. The Amazon may have supported sophisticated agricultural civilisations whose traces are still being discovered — terra preta (dark earth) soils suggest large-scale land management. European disease would devastate these populations after 1500.",
    periods: [
      { name: 'Early Inhabitants', start: -12000, end: -3000 },
      { name: 'Pre-Contact Civilisations', start: -3000, end: 1500 },
    ],
  },
  {
    id: 'colonial-brazil',
    name: 'Portuguese Colonial Brazil',
    start: 1500, end: 1822,
    region: 'indigenous',
    icon: '⛵',
    description: "Pedro Álvares Cabral claimed Brazil for Portugal in 1500. Unlike Spanish America, Brazil developed through plantation agriculture — especially sugar — worked by millions of enslaved Africans, making Brazil the destination for more enslaved people than any other country in the Americas (around 4.9 million). The Dutch occupied northeastern Brazil (1630–1654). When Napoleon invaded Portugal, the royal family fled to Rio de Janeiro (1808), making Brazil the only colony to host a European monarch.",
    periods: [
      { name: 'Early Colony', start: 1500, end: 1650 },
      { name: 'Sugar & Slave Economy', start: 1650, end: 1750 },
      { name: 'Royal Court in Rio', start: 1808, end: 1822 },
    ],
  },
  {
    id: 'empire-of-brazil',
    name: 'Empire of Brazil',
    start: 1822, end: 1889,
    region: 'empire',
    icon: '👑',
    description: "Dom Pedro I declared Brazilian independence in 1822 and became Emperor. His son Pedro II (1840–1889) presided over Brazil's most stable era: the empire expanded westward, fought the devastating Paraguayan War (1864–1870), and gradually moved toward abolishing slavery (completed 1888 — the last country in the Americas). The landowners who lost slaves in abolition switched support to the military republic, and Pedro II was deposed in an 1889 coup.",
    periods: [
      { name: 'Pedro I & Regency', start: 1822, end: 1840 },
      { name: 'Pedro II', start: 1840, end: 1888 },
      { name: 'Abolition & Fall', start: 1888, end: 1889 },
    ],
  },
  {
    id: 'old-republic',
    name: 'First Republic & Vargas Era',
    start: 1889, end: 1945,
    region: 'republic',
    icon: '☕',
    description: "The 'Old Republic' (1889–1930) was dominated by the 'café com leite' (coffee with milk) politics alternating power between the coffee-growing São Paulo and dairy-producing Minas Gerais elites. Getúlio Vargas seized power in 1930 and dominated Brazilian politics for 15 years, ruling as populist dictator (Estado Novo, 1937–1945). Brazil industrialised rapidly; Vargas built the 'Brazilian way' of state-led development.",
    periods: [
      { name: 'Old Republic', start: 1889, end: 1930 },
      { name: 'Vargas Era', start: 1930, end: 1945 },
    ],
  },
  {
    id: 'democracy-military',
    name: 'Democracy & Military Rule',
    start: 1945, end: 1985,
    region: 'conflicts',
    icon: '✊',
    description: "Post-Vargas democracy culminated in Juscelino Kubitschek building Brasília — a new futuristic capital in the interior (1960). Left-wing President João Goulart was overthrown in a US-backed military coup (1964). The military dictatorship (1964–1985) suppressed political opposition while presiding over the 'Brazilian miracle' of rapid economic growth in the late 1960s–70s, followed by debt crises.",
    periods: [
      { name: 'Populist Democracy', start: 1945, end: 1964 },
      { name: 'Military Dictatorship', start: 1964, end: 1985 },
    ],
  },
  {
    id: 'modern-brazil',
    name: 'Modern Democratic Brazil',
    start: 1985, end: 2025,
    region: 'republic',
    icon: '🇧🇷',
    description: "Brazil returned to democracy in 1985. The 1988 constitution established a robust democratic framework. Fernando Henrique Cardoso's Real Plan (1994) ended hyperinflation. Lula da Silva (2003–2010) lifted tens of millions out of poverty through Bolsa Família while presiding over the commodities boom. Brazil hosted the 2014 FIFA World Cup and 2016 Olympics. Political crises, the rise of Bolsonaro, COVID-19, and Amazon deforestation have dominated recent years.",
    periods: [
      { name: 'New Republic', start: 1985, end: 2002 },
      { name: 'Lula Era & PT', start: 2002, end: 2016 },
      { name: 'Political Polarisation', start: 2016, end: 2025 },
    ],
  },
];
