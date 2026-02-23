export const portugalCategories = [
  { id: 'medieval',   name: 'Medieval Kingdom',         color: '#78716C' },
  { id: 'empire',     name: 'Portuguese Empire',        color: '#EAB308' },
  { id: 'modern',     name: 'Modern Portugal',          color: '#3B82F6' },
  { id: 'conflicts',  name: 'Major Conflicts',          color: '#EF4444' },
];

export const portugalItems = [
  {
    id: 'kingdom-portugal',
    name: 'Kingdom of Portugal',
    start: 1139, end: 1415,
    region: 'medieval',
    icon: '⚔️',
    description: "Afonso Henriques became the first King of Portugal in 1139 after defeating the Moors at the Battle of Ourique. Portugal was the first European nation-state with fixed borders, which have remained largely unchanged for 850 years. The Reconquista completed in Portugal by 1249 — earlier than Spain. The Order of Christ (successor to the Knights Templar in Portugal) financed early exploration. Prince Henry the Navigator (1394–1460) launched the Age of Discovery.",
    periods: [
      { name: 'Foundation & Reconquista', start: 1139, end: 1249 },
      { name: 'Medieval Kingdom', start: 1249, end: 1415 },
    ],
  },
  {
    id: 'age-of-discovery',
    name: 'Age of Discovery',
    start: 1415, end: 1580,
    region: 'empire',
    icon: '⚓',
    description: "Portugal led Europe's Age of Discovery, establishing the first global maritime trade network. Bartolomeu Dias rounded the Cape of Good Hope (1488); Vasco da Gama reached India (1498), opening the lucrative spice trade; Pedro Álvares Cabral claimed Brazil (1500). Portuguese traders established footholds from West Africa to Japan. Lisbon became the wealthiest city in Europe. The Treaty of Tordesillas (1494) with Spain divided the non-European world between the two Iberian powers.",
    periods: [
      { name: 'Henry the Navigator', start: 1415, end: 1460 },
      { name: 'Cape Route & India', start: 1460, end: 1510 },
      { name: 'Global Empire', start: 1510, end: 1580 },
    ],
  },
  {
    id: 'iberian-union-restoration',
    name: 'Iberian Union & Restoration',
    start: 1580, end: 1750,
    region: 'empire',
    icon: '🏰',
    description: "King Sebastian I's death at the Battle of Alcácer Quibir (1578) without an heir triggered a succession crisis. Philip II of Spain claimed the Portuguese throne, uniting the Iberian crowns (1580–1640). Portuguese colonies were attacked by the Dutch and English, who exploited the union. A national revolt restored the House of Braganza in 1640; John IV became king. The 1703 Methuen Treaty gave Britain preferential access to Portuguese wine in exchange for cloth — shaping both nations' economies.",
    periods: [
      { name: 'Iberian Union', start: 1580, end: 1640 },
      { name: 'Restoration', start: 1640, end: 1750 },
    ],
  },
  {
    id: 'pombal-brazil',
    name: 'Pombal Era & Brazil',
    start: 1750, end: 1822,
    region: 'empire',
    icon: '🌎',
    description: "The Marquis of Pombal dominated Portugal (1750–1777) under José I, modernising the state, expelling the Jesuits, and rebuilding Lisbon after the catastrophic 1755 earthquake (which killed tens of thousands). Napoleon's invasion (1807) forced the royal family to flee to Brazil, making Rio de Janeiro the imperial capital. When João VI returned to Portugal (1821), his son Pedro declared Brazilian independence (1822), ending Portuguese rule there.",
    periods: [
      { name: 'Pombaline Reform', start: 1750, end: 1777 },
      { name: 'Napoleonic Invasion', start: 1807, end: 1815 },
      { name: 'Brazilian Independence', start: 1815, end: 1822 },
    ],
  },
  {
    id: 'liberal-republic',
    name: 'Liberal Era & First Republic',
    start: 1822, end: 1926,
    region: 'modern',
    icon: '⚖️',
    description: "19th-century Portugal was marked by liberal-conservative civil war (1828–1834) and chronic instability. The monarchy was weakened by repeated crises; King Carlos I was assassinated in 1908. The Republic was proclaimed in 1910 but proved even more unstable than the monarchy — 16 years, 45 governments, and participation in WWI's bloodiest campaigns. Military coups ended the First Republic in 1926.",
    periods: [
      { name: 'Constitutional Monarchy', start: 1822, end: 1910 },
      { name: 'First Republic', start: 1910, end: 1926 },
    ],
  },
  {
    id: 'estado-novo',
    name: 'Estado Novo',
    start: 1926, end: 1974,
    region: 'conflicts',
    icon: '📰',
    description: "António de Oliveira Salazar dominated Portugal for 36 years (1932–1968) through his conservative 'Estado Novo' (New State) regime — one of Europe's longest-lasting dictatorships. Portugal maintained neutrality in WWII while supplying both sides. As decolonisation swept Africa and Asia, Portugal clung to its colonies, fighting costly wars in Angola, Mozambique, and Guinea-Bissau (1961–1974). The Carnation Revolution (25 April 1974) — a military coup turned popular uprising — peacefully ended the dictatorship.",
    periods: [
      { name: 'Salazarist Portugal', start: 1932, end: 1968 },
      { name: 'Colonial Wars', start: 1961, end: 1974 },
      { name: 'Carnation Revolution', start: 1974, end: 1974 },
    ],
  },
  {
    id: 'modern-portugal',
    name: 'Modern Democratic Portugal',
    start: 1974, end: 2025,
    region: 'modern',
    icon: '🇵🇹',
    description: "After the Carnation Revolution, Portugal rapidly decolonised (1974–1975), receiving nearly a million returnees (retornados). It joined the EU (then EEC) in 1986, transforming the economy with structural funds. Portugal adopted the euro in 1999. The 2010 debt crisis led to an international bailout and severe austerity. Portugal emerged as a resilient democracy and popular tourist destination, with Lisbon reinventing itself as a European tech and cultural hub.",
    periods: [
      { name: 'Decolonisation & Democracy', start: 1974, end: 1995 },
      { name: 'EU Integration & Euro', start: 1986, end: 2011 },
      { name: 'Modern Portugal', start: 2011, end: 2025 },
    ],
  },
];
