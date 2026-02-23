export const australiaCategories = [
  { id: 'indigenous', name: 'Aboriginal & Torres Strait', color: '#F59E0B' },
  { id: 'colonial',   name: 'Colonial Era',              color: '#78716C' },
  { id: 'federation', name: 'Federation & Modern',       color: '#3B82F6' },
  { id: 'conflicts',  name: 'Major Conflicts',           color: '#EF4444' },
  { id: 'culture',    name: 'Culture & Society',         color: '#10B981' },
];

export const australiaItems = [
  {
    id: 'aboriginal-history',
    name: 'Aboriginal & Torres Strait Islander Peoples',
    start: -65000, end: 1788,
    region: 'indigenous',
    icon: '🪃',
    description: "Aboriginal Australians and Torres Strait Islander peoples are the custodians of the world's oldest continuing culture — at least 65,000 years old, and possibly older. Hundreds of distinct language groups with rich oral traditions, spiritual practices centred on the Dreaming (Tjukurpa), sophisticated land management (fire-stick farming), and complex social structures thrived across the continent. Seafaring Makassans from Indonesia traded with northern Australians for centuries before European contact.",
    periods: [
      { name: 'Earliest Inhabitation', start: -65000, end: -10000 },
      { name: 'Holocene Cultures', start: -10000, end: 1606 },
      { name: 'Pre-British Contact', start: 1606, end: 1788 },
    ],
  },
  {
    id: 'convict-colonial',
    name: 'Convict Settlement & Early Colony',
    start: 1788, end: 1850,
    region: 'colonial',
    icon: '⛵',
    description: "Captain Arthur Phillip arrived at Sydney Cove on 26 January 1788 with the First Fleet — 11 ships carrying over 1,000 people, including 778 convicts. Britain used Australia as a penal colony after losing the American colonies. The Aboriginal population was catastrophically reduced by disease (smallpox killed over half the Sydney Aboriginal population in the first year), displacement, and frontier violence. Pastoralists expanded the wool industry inland, driving violent dispossession of Aboriginal peoples.",
    periods: [
      { name: 'First Fleet & Penal Colony', start: 1788, end: 1820 },
      { name: 'Pastoral Expansion', start: 1820, end: 1850 },
    ],
  },
  {
    id: 'gold-rush-self-government',
    name: 'Gold Rush & Self-Government',
    start: 1850, end: 1901,
    region: 'colonial',
    icon: '⛏️',
    description: "The discovery of gold in Victoria (1851) transformed Australia — the population trebled within a decade. Chinese miners faced violent racism; the Eureka Stockade rebellion (1854) against mining licence fees became a symbol of democratic defiance. The separate colonies achieved self-government in the 1850s. Waves of free immigrants joined the remaining convicts and their descendants. The Australian bush mythology — the swagman, the digger, mateship — crystallised in this era.",
    periods: [
      { name: 'Gold Rush', start: 1851, end: 1860 },
      { name: 'Colonial Self-Government', start: 1855, end: 1901 },
    ],
  },
  {
    id: 'federation',
    name: 'Federation of Australia',
    start: 1901, end: 1945,
    region: 'federation',
    icon: '🦘',
    description: "The six colonies federated into the Commonwealth of Australia on 1 January 1901. The White Australia Policy restricted non-European immigration. Anzac troops distinguished themselves — and suffered catastrophically — at Gallipoli (1915) in WWI, forging a national identity. Australia entered WWII immediately; Japanese forces reached New Guinea and bombed Darwin (1942). The fall of Singapore (1942), where 80,000 Allied troops surrendered, shocked Australians into reorienting toward America.",
    periods: [
      { name: 'Early Federation', start: 1901, end: 1914 },
      { name: 'World War I & Anzac', start: 1914, end: 1918 },
      { name: 'Interwar & WWII', start: 1919, end: 1945 },
    ],
  },
  {
    id: 'postwar-australia',
    name: 'Post-War Australia',
    start: 1945, end: 2000,
    region: 'federation',
    icon: '🏙️',
    description: "Post-war immigration under the 'populate or perish' policy brought millions of European migrants, transforming Australian society. Gough Whitlam's Labor government (1972–1975) — controversially dismissed by the Governor-General — enacted sweeping social reforms: universal healthcare, equal pay, free university. The White Australia Policy was abolished (1973). Land rights for Aboriginal Australians were progressively recognised from the 1970s. Australia joined the US alliance system and participated in Vietnam and Gulf wars.",
    periods: [
      { name: 'Post-War Migration & Boom', start: 1945, end: 1972 },
      { name: 'Reform Era', start: 1972, end: 1996 },
      { name: 'Howard Years', start: 1996, end: 2007 },
    ],
  },
  {
    id: 'modern-australia',
    name: 'Modern Australia',
    start: 2000, end: 2025,
    region: 'culture',
    icon: '🇦🇺',
    description: "Australia hosted the Sydney Olympics (2000) and navigated the Global Financial Crisis (2008) better than most developed nations. The Rudd government's formal apology to the Stolen Generations (2008) was a landmark moment of reconciliation. Australia became one of the world's longest economic expansions (29 years without recession). The 2019–20 Black Summer bushfires and COVID-19 pandemic were defining crises. The 2023 Voice to Parliament referendum on Aboriginal recognition was defeated.",
    periods: [
      { name: 'Sydney Olympics & Growth', start: 2000, end: 2013 },
      { name: 'Political Instability', start: 2013, end: 2022 },
      { name: 'Modern Australia', start: 2022, end: 2025 },
    ],
  },
];
