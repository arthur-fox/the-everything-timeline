export const ghanaCategories = [
  { id: 'akan',         name: 'Akan States',       color: '#F59E0B' },
  { id: 'asante',       name: 'Asante Empire',     color: '#EAB308' },
  { id: 'colonial',     name: 'Gold Coast',        color: '#78716C' },
  { id: 'independence', name: 'Independence Era',  color: '#3B82F6' },
  { id: 'modern',       name: 'Modern Ghana',      color: '#10B981' },
];

export const ghanaItems = [
  {
    id: 'ghana-bono-akan',
    name: 'Bono & Early Akan States',
    start: 1300, end: 1701,
    region: 'akan',
    icon: '🪙',
    description: "Akan-speaking states grew rich on forest gold and kola nuts. Bonoman and the trading town of Begho linked the forest to the Mande merchants of the Mali world and the trans-Saharan routes. By the 1600s, states such as Denkyira and Akwamu competed for the gold and coastal trade. (The medieval Ghana Empire lay far to the north-west, in today's Mauritania and Mali — the modern country borrowed its name at independence.)",
    sources: [
      { title: 'Wikipedia — Bonoman', url: 'https://en.wikipedia.org/wiki/Bonoman' },
      { title: 'Wikipedia — Akan people', url: 'https://en.wikipedia.org/wiki/Akan_people' },
    ],
    periods: [
      { name: 'Bonoman & Begho', start: 1300, end: 1600 },
      { name: 'Denkyira & Akwamu', start: 1600, end: 1701 },
    ],
  },
  {
    id: 'ghana-coast-forts',
    name: 'European Forts & Atlantic Trade',
    start: 1471, end: 1874,
    region: 'colonial',
    icon: '🏰',
    description: "Portuguese sailors reached the coast in 1471 and built São Jorge da Mina (Elmina Castle) in 1482. Dutch, English, Danish, Swedish, and Brandenburg traders followed, building dozens of forts. Gold trading gave way to the Atlantic slave trade, and castles such as Elmina and Cape Coast held enslaved Africans before shipment across the Atlantic. Britain abolished its slave trade in 1807 and gradually bought out the Danish (1850) and Dutch (1872) forts.",
    sources: [
      { title: 'Wikipedia — Elmina Castle', url: 'https://en.wikipedia.org/wiki/Elmina_Castle' },
      { title: 'UNESCO — Forts and Castles, Volta, Greater Accra, Central and Western Regions', url: 'https://whc.unesco.org/en/list/34/' },
    ],
    periods: [
      { name: 'Portuguese gold trade', start: 1471, end: 1637 },
      { name: 'Slave-trade era', start: 1637, end: 1807 },
      { name: 'Abolition & British consolidation', start: 1807, end: 1874 },
    ],
  },
  {
    id: 'ghana-asante',
    name: 'Asante Empire',
    start: 1701, end: 1902,
    region: 'asante',
    icon: '🪑',
    description: "Osei Tutu united Akan chiefdoms around Kumasi and, after defeating Denkyira at Feyiase in 1701, founded the Asante Confederacy. Tradition holds that the priest Okomfo Anokye called down the Golden Stool, the embodiment of the nation's soul. Asante became one of West Africa's strongest states, fighting a series of Anglo-Asante wars through the 19th century. The War of the Golden Stool (1900), led by the queen mother Yaa Asantewaa, was the last major resistance before Britain annexed Asante in 1902.",
    sources: [
      { title: 'Wikipedia — Ashanti Empire', url: 'https://en.wikipedia.org/wiki/Ashanti_Empire' },
      { title: 'Wikipedia — War of the Golden Stool', url: 'https://en.wikipedia.org/wiki/War_of_the_Golden_Stool' },
    ],
    periods: [
      { name: 'Founding & expansion', start: 1701, end: 1824 },
      { name: 'Anglo-Asante wars', start: 1824, end: 1900 },
      { name: 'Yaa Asantewaa War & annexation', start: 1900, end: 1902 },
    ],
  },
  {
    id: 'ghana-gold-coast-colony',
    name: 'Gold Coast Colony',
    start: 1874, end: 1957,
    region: 'colonial',
    icon: '🍫',
    description: "Britain made the coast a Crown colony in 1874 and later added Asante and the Northern Territories. Cocoa, introduced by Tetteh Quarshie in 1879, turned the Gold Coast into the world's leading cocoa producer by the early 20th century. Governor Gordon Guggisberg (1919–1927) built Takoradi harbour and Achimota School. After the 1948 Accra riots, Kwame Nkrumah's Convention People's Party (founded 1949) pushed for 'self-government now'.",
    sources: [
      { title: 'Wikipedia — Gold Coast (British colony)', url: 'https://en.wikipedia.org/wiki/Gold_Coast_(British_colony)' },
    ],
    periods: [
      { name: 'Colony & cocoa boom', start: 1874, end: 1919 },
      { name: 'Guggisberg reforms', start: 1919, end: 1927 },
      { name: 'Nationalist movement', start: 1947, end: 1957 },
    ],
  },
  {
    id: 'ghana-nkrumah',
    name: 'Independence & Nkrumah',
    start: 1957, end: 1966,
    region: 'independence',
    icon: '⭐',
    description: "On 6 March 1957 the Gold Coast became independent as Ghana, one of the first sub-Saharan African colonies to do so, with Kwame Nkrumah as leader. Ghana became a republic in 1960 and a centre of Pan-Africanism. Nkrumah pursued rapid state-led development, including the Akosombo Dam on the Volta River, but turned the country into a one-party state in 1964. He was overthrown in a military coup in February 1966.",
    sources: [
      { title: 'Wikipedia — Kwame Nkrumah', url: 'https://en.wikipedia.org/wiki/Kwame_Nkrumah' },
    ],
    periods: [
      { name: 'Dominion of Ghana', start: 1957, end: 1960 },
      { name: 'First Republic', start: 1960, end: 1966 },
    ],
  },
  {
    id: 'ghana-coups-rawlings',
    name: 'Coups & Military Rule',
    start: 1966, end: 1992,
    region: 'independence',
    icon: '🎖️',
    description: "After 1966 Ghana alternated between short civilian governments and military regimes. Flight Lieutenant Jerry Rawlings seized power in 1979, handed over to an elected government, then took power again on 31 December 1981. His PNDC government adopted an IMF-backed structural adjustment programme from 1983 and oversaw the return to constitutional rule in 1992.",
    sources: [
      { title: 'Wikipedia — History of Ghana', url: 'https://en.wikipedia.org/wiki/History_of_Ghana' },
    ],
    periods: [
      { name: 'NLC, Busia & Acheampong', start: 1966, end: 1979 },
      { name: 'Rawlings & the PNDC', start: 1979, end: 1992 },
    ],
  },
  {
    id: 'ghana-fourth-republic',
    name: 'Fourth Republic',
    start: 1992, end: 2025,
    region: 'modern',
    icon: '🗳️',
    description: "The 1992 constitution restored multiparty democracy. Rawlings's party handed power to John Kufuor's opposition after the 2000 election, and Ghana has since seen several peaceful transfers of power, making it one of West Africa's more stable democracies. Kofi Annan, a Ghanaian, served as UN Secretary-General (1997–2006). Commercial oil production from the offshore Jubilee field began in 2010.",
    sources: [
      { title: 'Wikipedia — Fourth Republic of Ghana', url: 'https://en.wikipedia.org/wiki/Fourth_Republic_of_Ghana' },
    ],
    periods: [
      { name: 'Return to democracy', start: 1992, end: 2001 },
      { name: 'Alternating parties & oil era', start: 2001, end: 2025 },
    ],
  },
];
