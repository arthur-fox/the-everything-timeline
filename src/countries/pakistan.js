export const pakistanCategories = [
  { id: 'ancient',      name: 'Ancient Civilisations',  color: '#F59E0B' },
  { id: 'medieval',     name: 'Medieval Kingdoms',      color: '#C084FC' },
  { id: 'mughal',       name: 'Mughal & Colonial Era',  color: '#78716C' },
  { id: 'independence', name: 'Independence & Partition',color: '#EF4444' },
  { id: 'modern',       name: 'Modern Pakistan',        color: '#3B82F6' },
];

export const pakistanItems = [
  {
    id: 'indus-valley',
    name: 'Indus Valley Civilisation',
    start: -2600, end: -1900,
    region: 'ancient',
    icon: '🏺',
    description: "The Indus Valley Civilisation (c. 2600–1900 BCE), also called the Harappan Civilisation, was one of the ancient world's three great urban civilisations alongside Egypt and Mesopotamia — and in some ways the most sophisticated. At its peak it covered over 1.25 million square kilometres, with cities like Mohenjo-daro and Harappa (both in modern Pakistan) housing populations of 40,000–80,000. Remarkably, the Indus cities show evidence of extraordinary urban planning: grid-pattern streets, standardised baked-brick construction, sophisticated drainage and sewage systems, public baths, and granaries — all without palaces, temples, or monumental royal tombs. The Indus script remains undeciphered. The civilisation declined around 1900 BCE, possibly due to climate change and river course changes.",
    periods: [
      { name: 'Early Harappan', start: -2600, end: -2200 },
      { name: 'Mature Harappan', start: -2200, end: -1900 },
    ],
  },
  {
    id: 'vedic-persian',
    name: 'Vedic, Persian & Mauryan Periods',
    start: -1500, end: -185,
    region: 'ancient',
    icon: '🏛️',
    description: "Following the Indus Valley decline, Indo-Aryan migrations brought the Vedic culture to the Punjab and Gandhara. The Persian Achaemenid Empire under Darius I incorporated the Punjab and Sindh as the satrapy of 'Hindush' (c. 518 BCE) — its richest province. Alexander the Great crossed the Khyber Pass and fought King Porus at the Hydaspes (326 BCE). After Alexander's death, Chandragupta Maurya — possibly inspired by Alexander's methods — founded the Mauryan Empire (c. 322 BCE) and eventually united the subcontinent. His grandson Ashoka (r. 268–232 BCE) converted to Buddhism after the bloody Kalinga War; his rock edicts, scattered across modern Pakistan and Afghanistan, are among history's most remarkable documents of royal remorse and ethical governance.",
    periods: [
      { name: 'Vedic & Gandharan Cultures', start: -1500, end: -550 },
      { name: 'Persian & Greek Invasions', start: -550, end: -322 },
      { name: 'Mauryan Empire', start: -322, end: -185 },
    ],
  },
  {
    id: 'kushan-gupta',
    name: 'Kushans, Guptas & Early Medieval',
    start: 30, end: 1000,
    region: 'medieval',
    icon: '🕌',
    description: "The Kushan Empire (c. 30–375 CE), based in what is now Afghanistan and Pakistan, was a major crossroads civilisation — combining Hellenistic, Indian, Chinese, and Zoroastrian influences. The Kushans were great patrons of Buddhism; Gandharan Buddhist art (the first depictions of the Buddha in human form, blending Greek sculptural style with Indian iconography) is one of history's most remarkable artistic syntheses. After Gupta decline, the Hunnic invasions disrupted northern India. Arab forces conquered Sindh in 711 CE under Muhammad ibn Qasim — beginning over a millennium of Islamic presence in the subcontinent. The Ghaznavid Empire (977–1186 CE), based in modern Afghanistan, raided the Punjab repeatedly; Mahmud of Ghazni's 17 raids spread Islam and transferred wealth westward.",
    periods: [
      { name: 'Kushan Empire', start: 30, end: 375 },
      { name: 'Post-Kushan & Arab Conquest', start: 375, end: 900 },
      { name: 'Ghaznavid Raids', start: 977, end: 1000 },
    ],
  },
  {
    id: 'delhi-sultanate-mughal',
    name: 'Delhi Sultanate & Mughal Empire',
    start: 1206, end: 1857,
    region: 'mughal',
    icon: '👑',
    description: "The Delhi Sultanate (1206–1526) established the first lasting Islamic empire over the subcontinent, with its heartland in modern Punjab and the Indo-Gangetic Plain. Lahore became one of the empire's great cities. The Mughal Empire (1526–1857), founded by Babur (a Timurid prince from Fergana), united most of South Asia under Islamic rule while blending Persian, Turkic, and Indian cultures into a uniquely syncretic civilisation. Emperor Akbar (r. 1556–1605) promoted religious tolerance; his Ibadatkhana debated all religions. The Mughals made Lahore a second capital; Shah Jahan's Lahore Fort and Shalimar Gardens are testaments to Mughal architectural magnificence. Aurangzeb (r. 1658–1707) reversed religious tolerance and overextended the empire; it fragmented rapidly after his death.",
    periods: [
      { name: 'Delhi Sultanate', start: 1206, end: 1526 },
      { name: 'Early Mughal (Babur to Akbar)', start: 1526, end: 1605 },
      { name: 'Mughal Height & Decline', start: 1605, end: 1857 },
    ],
  },
  {
    id: 'british-raj',
    name: 'British Raj & Independence Movement',
    start: 1849, end: 1947,
    region: 'mughal',
    icon: '🏳️',
    description: "Britain annexed the Punjab (1849) after two Anglo-Sikh Wars, completing the conquest of the subcontinent. The NorthWest Frontier Province became a perpetual military concern — the 'Great Game' between Britain and Russia played out in Afghanistan. The Muslim League, founded in Dhaka (1906), increasingly advocated for Muslim political interests. Muhammad Ali Jinnah — trained as a barrister in London, initially a secularist who favoured Hindu-Muslim unity — eventually concluded that Muslims required a separate homeland: Pakistan ('land of the pure'). The Lahore Resolution (1940) formally demanded a separate Muslim state. As British withdrawal accelerated, the partition of British India into India and Pakistan (August 14–15, 1947) was accompanied by catastrophic communal violence: an estimated 200,000–2 million people killed and 10–20 million displaced in one of history's largest forced migrations.",
    periods: [
      { name: 'British Punjab & NWFP', start: 1849, end: 1900 },
      { name: 'Muslim League & Jinnah', start: 1906, end: 1947 },
    ],
  },
  {
    id: 'partition-early-pakistan',
    name: 'Partition & Early Pakistan',
    start: 1947, end: 1971,
    region: 'independence',
    icon: '💥',
    description: "Pakistan was born as a geographically divided nation — West Pakistan (the dominant partner) and East Pakistan (modern Bangladesh) were separated by 1,600 km of Indian territory. Jinnah died just 13 months after independence (September 1948), depriving the new nation of its founding leader. Political instability followed; the first military coup (Ayub Khan, 1958) set a pattern of civilian-military oscillation that continues today. The Kashmir dispute — both India and Pakistan claim it; it was divided by the Line of Control after the 1947–48 war — has poisoned relations and produced three further wars (1965, 1971, Kargil 1999). The 1971 Bangladesh Liberation War was the defining trauma: West Pakistan's military suppression of Bengali nationalism in East Pakistan killed 300,000–3 million people; India intervened, and East Pakistan became independent Bangladesh. Pakistan lost half its population and its eastern wing.",
    periods: [
      { name: 'Birth of Pakistan & Jinnah', start: 1947, end: 1951 },
      { name: 'Military Rule (Ayub Khan)', start: 1958, end: 1969 },
      { name: 'Bangladesh Liberation War', start: 1971, end: 1971 },
    ],
  },
  {
    id: 'modern-pakistan',
    name: 'Modern Pakistan',
    start: 1971, end: 2025,
    region: 'modern',
    icon: '🇵🇰',
    description: "Post-1971 Pakistan rebuilt under Zulfikar Ali Bhutto, who was overthrown and hanged by General Zia ul-Haq (1977–1988). Zia's Islamisation programme transformed Pakistan's legal and cultural landscape; his support of Afghan Mujahideen against the Soviet invasion (CIA-financed) left Pakistan flooded with weapons and jihadist networks. Benazir Bhutto — the Muslim world's first female head of government — was twice elected PM (1988–90, 1993–96) and assassinated in 2007. Pakistan tested nuclear weapons in 1998, becoming the first Muslim-majority nuclear power. The post-9/11 era made Pakistan a frontline state in the 'War on Terror' (US drone strikes; Osama bin Laden found in Abbottabad, 2011). Imran Khan's populist PTI party won 2018 elections; he was ousted in 2022 and imprisoned in 2023. Pakistan faces persistent challenges: economic crises, political instability, extremist insurgency in the northwest, and tensions with India.",
    periods: [
      { name: 'Bhutto & Zia ul-Haq Era', start: 1971, end: 1988 },
      { name: 'Democracy & Nuclear Tests', start: 1988, end: 2001 },
      { name: 'War on Terror & Modern Politics', start: 2001, end: 2025 },
    ],
  },
];
