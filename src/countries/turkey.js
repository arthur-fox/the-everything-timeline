export const turkeyCategories = [
  { id: 'ottoman',    name: 'Ottoman Empire',           color: '#EF4444' },
  { id: 'conflicts',  name: 'Major Conflicts',          color: '#F97316' },
  { id: 'modern',     name: 'Modern Turkey',            color: '#3B82F6' },
  { id: 'culture',    name: 'Culture & Society',        color: '#10B981' },
];

export const turkeyItems = [
  {
    id: 'seljuk-anatolia',
    name: 'Seljuk & Pre-Ottoman Anatolia',
    start: 1071, end: 1299,
    region: 'ottoman',
    icon: '🏹',
    description: "The Seljuk Turks defeated the Byzantine Empire at the Battle of Manzikert (1071), opening Anatolia to Turkic migration. The Sultanate of Rum established a sophisticated Islamic court at Konya. Mongol invasions (1243) shattered Seljuk power, creating a patchwork of small Turkish beyliks (principalities) from which the Ottoman state would emerge.",
    periods: [
      { name: 'Seljuk Sultanate of Rum', start: 1071, end: 1243 },
      { name: 'Mongol Domination', start: 1243, end: 1299 },
    ],
  },
  {
    id: 'ottoman-rise',
    name: 'Ottoman Rise & Expansion',
    start: 1299, end: 1566,
    region: 'ottoman',
    icon: '🌙',
    description: "Osman I founded the Ottoman dynasty c. 1299 in northwestern Anatolia. His successors steadily expanded: Mehmed II's conquest of Constantinople (1453) ended the Byzantine Empire and made the Ottomans heirs to Rome. Selim I defeated the Safavid Persians and conquered Egypt and the Hijaz (Mecca and Medina). Suleiman the Magnificent (1520–1566) brought the empire to its greatest extent, reaching the gates of Vienna (1529).",
    periods: [
      { name: 'Early Ottomans', start: 1299, end: 1453 },
      { name: 'Fall of Constantinople', start: 1453, end: 1453 },
      { name: "Suleiman's Golden Age", start: 1520, end: 1566 },
    ],
  },
  {
    id: 'ottoman-height',
    name: 'Ottoman Empire at Height',
    start: 1453, end: 1683,
    region: 'ottoman',
    icon: '🕌',
    description: "At its height, the Ottoman Empire spanned three continents: from Hungary and the Crimea to Morocco, from Yemen to Iraq. Istanbul (Constantinople) became one of the world's great cities. The devshirme system recruited Christian boys as elite Janissary soldiers and administrators. Ottoman art, architecture (Sinan's mosques), and law flourished. The empire's defeat at Vienna (1683) marked the beginning of its long decline.",
    periods: [
      { name: 'Mediterranean Dominance', start: 1453, end: 1571 },
      { name: 'Battle of Lepanto', start: 1571, end: 1572 },
      { name: 'Continued Power', start: 1572, end: 1683 },
    ],
  },
  {
    id: 'ottoman-decline',
    name: 'Ottoman Decline',
    start: 1683, end: 1908,
    region: 'conflicts',
    icon: '📉',
    description: "After the failed siege of Vienna (1683), the Ottomans gradually retreated before European powers. The 'Eastern Question' — what to do about the declining empire — preoccupied European diplomacy for a century. Greece won independence (1821–1829); successive Balkan nationalisms further shrank the empire. Tanzimat reforms (1839–1876) attempted modernisation. The 'Sick Man of Europe' stumbled into the 20th century.",
    periods: [
      { name: 'Early Decline', start: 1683, end: 1789 },
      { name: 'Tanzimat Reforms', start: 1839, end: 1876 },
      { name: 'Abdulhamid & Decline', start: 1876, end: 1908 },
    ],
  },
  {
    id: 'wwi-collapse',
    name: 'WWI & Collapse',
    start: 1908, end: 1923,
    region: 'conflicts',
    icon: '💥',
    description: "The Young Turk revolution (1908) attempted to save the empire through constitutional reform. The empire joined WWI on Germany's side (1914), fighting on multiple fronts. The Armenian Genocide (1915–1923) — the systematic killing of over a million Armenians — remains one of the 20th century's great atrocities. Defeat in WWI led to the humiliating Treaty of Sèvres (1920), which Mustafa Kemal (Atatürk) repudiated through the Turkish War of Independence.",
    periods: [
      { name: 'Young Turks', start: 1908, end: 1914 },
      { name: 'WWI & Armenian Genocide', start: 1914, end: 1918 },
      { name: 'War of Independence', start: 1919, end: 1923 },
    ],
  },
  {
    id: 'republic-of-turkey',
    name: 'Republic of Turkey',
    start: 1923, end: 2025,
    region: 'modern',
    icon: '🇹🇷',
    description: "Mustafa Kemal Atatürk proclaimed the Republic of Turkey on 29 October 1923 and launched sweeping reforms: abolishing the caliphate, adopting the Latin alphabet, secularising law and education, and enfranchising women. Turkey joined NATO (1952) and applied for EU membership (1987). The AKP under Erdoğan has dominated politics since 2002, combining Islamic conservatism with authoritarian tendencies. Turkey is a major regional power bridging Europe and the Middle East.",
    periods: [
      { name: 'Atatürk Era', start: 1923, end: 1950 },
      { name: 'Cold War Turkey', start: 1950, end: 2002 },
      { name: 'AKP Era', start: 2002, end: 2025 },
    ],
  },
];
