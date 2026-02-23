export const netherlandsCategories = [
  { id: 'medieval',   name: 'Medieval Low Countries',  color: '#78716C' },
  { id: 'republic',   name: 'Dutch Republic & Empire', color: '#F97316' },
  { id: 'modern',     name: 'Modern Netherlands',      color: '#3B82F6' },
  { id: 'conflicts',  name: 'Major Conflicts',         color: '#EF4444' },
];

export const netherlandsItems = [
  {
    id: 'habsburg-netherlands',
    name: 'Habsburg Netherlands',
    start: 1477, end: 1581,
    region: 'medieval',
    icon: '🏰',
    description: "The seventeen provinces of the Low Countries passed to the Spanish Habsburgs under Charles V. The region was the most urbanised and commercially advanced in Europe. The Spanish Inquisition's persecution of Protestants (primarily Calvinists) and the brutal repression by the Duke of Alba triggered the revolt of the Netherlands — one of history's first successful bourgeois revolutions against absolute monarchy.",
    periods: [
      { name: 'Habsburg Rule', start: 1477, end: 1566 },
      { name: 'Dutch Revolt', start: 1566, end: 1581 },
    ],
  },
  {
    id: 'dutch-republic',
    name: 'Dutch Republic & Golden Age',
    start: 1581, end: 1795,
    region: 'republic',
    icon: '⚓',
    description: "The Dutch Republic (United Provinces) was the first modern republic and the world's leading economy in the 17th century. The Dutch East India Company (VOC, 1602) was history's first publicly traded multinational corporation. Dutch merchant ships dominated global trade; the Dutch Empire stretched from New Amsterdam (New York) to the Cape Colony, Indonesia, and Brazil. Rembrandt, Vermeer, and Spinoza flourished in this era of extraordinary tolerance and commercial prosperity.",
    periods: [
      { name: 'Founding & Eighty Years War', start: 1581, end: 1648 },
      { name: 'Dutch Golden Age', start: 1600, end: 1672 },
      { name: 'Decline', start: 1672, end: 1795 },
    ],
  },
  {
    id: 'kingdom-netherlands',
    name: 'Kingdom of the Netherlands',
    start: 1815, end: 1940,
    region: 'modern',
    icon: '👑',
    description: "After Napoleonic occupation, the Kingdom of the Netherlands was established (1815) including modern Belgium and Luxembourg (which separated in 1830 and 1867 respectively). The Netherlands industrialised in the 19th century, maintaining a vast colonial empire centred on the Dutch East Indies (Indonesia). The Netherlands declared neutrality in WWI (successfully) and WWI (unsuccessfully — Germany invaded in 1940).",
    periods: [
      { name: 'United Kingdom', start: 1815, end: 1830 },
      { name: 'Constitutional Kingdom', start: 1840, end: 1940 },
    ],
  },
  {
    id: 'wwii-occupation',
    name: 'WWII & Occupation',
    start: 1940, end: 1945,
    region: 'conflicts',
    icon: '⚠️',
    description: "Germany invaded the Netherlands in May 1940; Rotterdam was bombed into rubble. The Dutch East Indies fell to Japan (1942). The Netherlands hosted Anne Frank's famous hiding — her diary became one of the Holocaust's defining documents. The Hongerwinter (1944–45 famine) killed 20,000 Dutch civilians after Allied forces liberated the south but not the north. Liberation came on 5 May 1945.",
    periods: [
      { name: 'German Invasion', start: 1940, end: 1941 },
      { name: 'Occupation', start: 1941, end: 1944 },
      { name: 'Liberation', start: 1944, end: 1945 },
    ],
  },
  {
    id: 'modern-netherlands',
    name: 'Modern Netherlands',
    start: 1945, end: 2025,
    region: 'modern',
    icon: '🇳🇱',
    description: "Post-war, the Netherlands rapidly decolonised (Indonesia independence 1949), rebuilt its economy through the Marshall Plan, and joined NATO and the European Coal and Steel Community. The discovery of natural gas (1959) funded the 'Dutch miracle'. The Netherlands pioneered progressive social policies — gay marriage (2001, world's first), drug tolerance, euthanasia. Rotterdam became Europe's largest port. The Netherlands is a core EU member and home to the International Court of Justice.",
    periods: [
      { name: 'Reconstruction & Decolonisation', start: 1945, end: 1965 },
      { name: 'Progressive Social Reform', start: 1965, end: 2000 },
      { name: 'Modern Netherlands', start: 2000, end: 2025 },
    ],
  },
];
