export const japanCategories = [
  { id: 'ancient',    name: 'Ancient & Classical',      color: '#F59E0B' },
  { id: 'feudal',     name: 'Feudal & Shogunate',        color: '#78716C' },
  { id: 'imperial',   name: 'Imperial Japan',            color: '#EF4444' },
  { id: 'modern',     name: 'Modern Japan',              color: '#3B82F6' },
  { id: 'culture',    name: 'Culture & Society',         color: '#10B981' },
];

export const japanItems = [
  {
    id: 'yayoi-kofun',
    name: 'Yayoi & Kofun Periods',
    start: -300, end: 710,
    region: 'ancient',
    icon: '🏺',
    description: 'The Yayoi people introduced rice cultivation and metalworking to the Japanese archipelago. The Kofun period (250–710 CE) is named for the large burial mounds (kofun) of its rulers; this era saw the emergence of the Yamato state and the beginning of a centralised monarchy. Buddhism arrived from Korea and China in the 6th century, transforming Japanese culture alongside Confucian administrative practices.',
    periods: [
      { name: 'Yayoi', start: -300, end: 250 },
      { name: 'Kofun', start: 250, end: 710 },
    ],
  },
  {
    id: 'nara-heian',
    name: 'Nara & Heian Periods',
    start: 710, end: 1185,
    region: 'ancient',
    icon: '🌸',
    description: "The Nara period established Japan's first permanent capital and saw the compilation of the Kojiki and Nihon Shoki (Japan's founding myths). The Heian period (794–1185), centred on Kyoto, was a golden age of aristocratic culture: the Tale of Genji (c. 1000 CE) by Murasaki Shikibu is considered the world's first novel. The Fujiwara clan dominated court politics while a warrior class — the samurai — rose in the provinces.",
    periods: [
      { name: 'Nara Period', start: 710, end: 794 },
      { name: 'Heian Period', start: 794, end: 1185 },
    ],
  },
  {
    id: 'kamakura-shogunate',
    name: 'Kamakura Shogunate',
    start: 1185, end: 1333,
    region: 'feudal',
    icon: '⚔️',
    description: "Minamoto no Yoritomo established Japan's first shogunate (military government) at Kamakura in 1192, inaugurating samurai rule that would last 700 years. The Emperor became a figurehead. The Mongol invasion fleets of Kublai Khan (1274 and 1281) were repelled by typhoons — the kamikaze ('divine wind') — reinforcing Japanese beliefs in divine protection. Zen Buddhism flourished among the warrior class.",
    periods: [
      { name: 'Genpei War & Foundation', start: 1185, end: 1200 },
      { name: 'Mongol Invasions', start: 1274, end: 1281 },
      { name: 'Late Kamakura', start: 1281, end: 1333 },
    ],
  },
  {
    id: 'muromachi-sengoku',
    name: 'Muromachi & Sengoku Period',
    start: 1336, end: 1600,
    region: 'feudal',
    icon: '🗡️',
    description: "The Muromachi shogunate was plagued by weakness and civil war. The Sengoku ('Warring States') period (1467–1615) was a century of near-constant military conflict between feudal lords (daimyo). Three unifiers — Oda Nobunaga, Toyotomi Hideyoshi, and Tokugawa Ieyasu — successively moved Japan toward reunification. European traders and Jesuit missionaries arrived, introducing firearms and Christianity.",
    periods: [
      { name: 'Muromachi', start: 1336, end: 1467 },
      { name: 'Sengoku', start: 1467, end: 1568 },
      { name: 'Unification', start: 1568, end: 1600 },
    ],
  },
  {
    id: 'edo-period',
    name: 'Edo Period (Tokugawa)',
    start: 1603, end: 1868,
    region: 'feudal',
    icon: '🏯',
    description: "Tokugawa Ieyasu's victory at Sekigahara (1600) and establishment of the Tokugawa shogunate inaugurated 265 years of peace and enforced isolation (sakoku). Japan was closed to most foreign trade and contact; Christianity was banned. The merchant class (chonin) flourished, producing kabuki theatre, ukiyo-e woodblock prints, and haiku poetry. When American Commodore Perry's 'Black Ships' arrived in 1853, the shock of Japan's technological gap with the West triggered the Meiji Restoration.",
    sources: [
      { title: 'Wikipedia — Edo period', url: 'https://en.wikipedia.org/wiki/Edo_period' },
      { title: 'Britannica — Tokugawa period', url: 'https://www.britannica.com/event/Tokugawa-period' },
    ],
    periods: [
      { name: 'Early Edo', start: 1603, end: 1700 },
      { name: 'Genroku & High Edo', start: 1700, end: 1800 },
      { name: 'Late Edo & Opening', start: 1800, end: 1868 },
    ],
  },
  {
    id: 'meiji-taisho',
    name: 'Meiji & Taisho Eras',
    start: 1868, end: 1926,
    region: 'imperial',
    icon: '🏭',
    description: "The Meiji Restoration (1868) abolished the shogunate and restored imperial rule. Japan rapidly modernised, adopting Western technology, institutions, and military methods. It defeated China (1895) and Russia (1905) in quick succession — shocking the world by demonstrating that a non-Western nation could defeat a European great power. The Taisho era brought tentative democracy and vibrant cosmopolitan culture.",
    sources: [
      { title: 'Wikipedia — Meiji Restoration', url: 'https://en.wikipedia.org/wiki/Meiji_Restoration' },
      { title: 'Britannica — Meiji Restoration', url: 'https://www.britannica.com/event/Meiji-Restoration' },
    ],
    periods: [
      { name: 'Meiji Era', start: 1868, end: 1912 },
      { name: 'Taisho Democracy', start: 1912, end: 1926 },
    ],
  },
  {
    id: 'imperial-japan-wwii',
    name: 'Imperial Expansion & WWII',
    start: 1926, end: 1945,
    region: 'imperial',
    icon: '✈️',
    description: "The Showa era began with military ultranationalism and expansionism. Japan invaded Manchuria (1931), China (1937), and after the attack on Pearl Harbor (December 1941) swept rapidly through Southeast Asia and the Pacific. The tide turned at Midway (1942). Allied island-hopping campaigns and the atomic bombings of Hiroshima and Nagasaki (August 1945) led to Japan's unconditional surrender on 15 August 1945.",
    periods: [
      { name: 'Manchuria & China', start: 1931, end: 1941 },
      { name: 'Pacific War', start: 1941, end: 1945 },
    ],
  },
  {
    id: 'postwar-japan',
    name: 'Postwar & Modern Japan',
    start: 1945, end: 2025,
    region: 'modern',
    icon: '📱',
    description: "American occupation (1945–1952) demilitarised Japan and established a democratic constitution. The Korean War triggered Japan's economic recovery. The 1960s–80s saw the Japanese Economic Miracle: Japan became the world's second-largest economy, pioneering consumer electronics, automobiles, and manufacturing quality (Toyota Production System). The 1990s 'Lost Decade' and 2011 Fukushima disaster presented major challenges. Japan remains a global technological and cultural powerhouse.",
    sources: [
      { title: 'Wikipedia — Postwar Japan', url: 'https://en.wikipedia.org/wiki/Japan#Postwar_period' },
      { title: 'Britannica — Japan: The postwar years', url: 'https://www.britannica.com/place/Japan/The-postwar-years-to-the-present' },
    ],
    periods: [
      { name: 'American Occupation', start: 1945, end: 1952 },
      { name: 'Economic Miracle', start: 1955, end: 1991 },
      { name: 'Modern Japan', start: 1991, end: 2025 },
    ],
  },
];
