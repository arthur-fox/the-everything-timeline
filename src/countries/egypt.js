export const egyptCategories = [
  { id: 'pharaonic',  name: 'Pharaonic Egypt',          color: '#EAB308' },
  { id: 'classical',  name: 'Classical & Islamic',      color: '#6366F1' },
  { id: 'ottoman',    name: 'Ottoman & Khedivate',       color: '#C084FC' },
  { id: 'modern',     name: 'Modern Egypt',             color: '#3B82F6' },
  { id: 'conflicts',  name: 'Major Conflicts',          color: '#EF4444' },
];

export const egyptItems = [
  {
    id: 'early-dynastic',
    name: 'Early Dynastic & Old Kingdom',
    start: -3100, end: -2181,
    region: 'pharaonic',
    icon: '🔺',
    description: "Narmer unified Upper and Lower Egypt around 3100 BCE, founding the world's first nation-state. The Old Kingdom ('Age of Pyramids') saw the construction of the great pyramids at Giza — the last surviving Wonder of the Ancient World. The pharaoh was considered divine, an intermediary between gods and humans. The centralised state built monumental architecture, maintained complex bureaucracy, and established long-distance trade.",
    periods: [
      { name: 'Early Dynastic', start: -3100, end: -2686 },
      { name: 'Old Kingdom', start: -2686, end: -2181 },
    ],
  },
  {
    id: 'middle-new-kingdom',
    name: 'Middle & New Kingdom',
    start: -2055, end: -1069,
    region: 'pharaonic',
    icon: '🦅',
    description: "The Middle Kingdom restored unity after the First Intermediate Period and is often considered Egypt's 'Classical Age' of literature and art. The New Kingdom reached Egypt's greatest power: pharaohs like Thutmose III, Akhenaten, Ramesses II, and Tutankhamun. Egypt built an empire stretching to Syria and Nubia. Akhenaten's monotheistic sun-worship experiment (1353–1336 BCE) was later erased. The Sea Peoples' invasions weakened the New Kingdom fatally.",
    periods: [
      { name: 'Middle Kingdom', start: -2055, end: -1650 },
      { name: 'Hyksos Period', start: -1650, end: -1550 },
      { name: 'New Kingdom', start: -1550, end: -1069 },
    ],
  },
  {
    id: 'late-period',
    name: 'Late Period & Hellenistic Egypt',
    start: -664, end: 30,
    region: 'pharaonic',
    icon: '🏺',
    description: "Egypt fell to successive foreign rulers: Assyrians, Persians (Achaemenid), Greeks (after Alexander the Great conquered Egypt in 332 BCE). The Ptolemaic dynasty — Greek rulers who adopted pharaonic customs — presided over Alexandria, one of antiquity's greatest cities, home to its famous Library and Lighthouse. Cleopatra VII, last of the Ptolemies, aligned with Julius Caesar and Mark Antony before Rome incorporated Egypt as a province in 30 BCE.",
    periods: [
      { name: 'Saite & Persian Rule', start: -664, end: -332 },
      { name: 'Alexander & Ptolemaic', start: -332, end: 30 },
    ],
  },
  {
    id: 'roman-byzantine-egypt',
    name: 'Roman & Byzantine Egypt',
    start: -30, end: 641,
    region: 'classical',
    icon: '🏛️',
    description: "Roman Egypt was the empire's breadbasket, supplying grain to Rome. Christianity spread early in Egypt; Alexandria became a leading centre of theology (Clement, Origen, Athanasius). The Coptic Church, founded by the Evangelist Mark, developed its distinctive tradition. Byzantine (Eastern Roman) rule followed, but Egypt's Coptic Christians often clashed with Constantinople over theology. The Arab Muslim conquest (639–642) ended 600+ years of Greco-Roman rule.",
    periods: [
      { name: 'Roman Egypt', start: -30, end: 395 },
      { name: 'Byzantine Egypt', start: 395, end: 641 },
    ],
  },
  {
    id: 'islamic-egypt',
    name: 'Islamic Egypt',
    start: 641, end: 1517,
    region: 'classical',
    icon: '🕌',
    description: "Arab Muslim forces under Amr ibn al-As conquered Egypt in 641 CE. Under the Abbasids, Egypt's capital moved to Fustat (near modern Cairo). The Fatimid Caliphate (969–1171) founded Cairo (al-Qahira) and Al-Azhar university, still one of Islam's leading institutions. Saladin (Salah al-Din) ended Fatimid rule and founded the Ayyubid dynasty, defeating the Crusaders and recapturing Jerusalem (1187). The Mamluks then ruled Egypt until the Ottoman conquest of 1517.",
    periods: [
      { name: 'Arab & Abbasid', start: 641, end: 969 },
      { name: 'Fatimid Caliphate', start: 969, end: 1171 },
      { name: 'Ayyubid & Mamluk', start: 1171, end: 1517 },
    ],
  },
  {
    id: 'ottoman-khedivate',
    name: 'Ottoman & Khedivate',
    start: 1517, end: 1952,
    region: 'ottoman',
    icon: '🏗️',
    description: "Ottoman Egypt was dominated by the Mamluks under Ottoman suzerainty. Napoleon's invasion (1798–1801) shocked the Ottoman world. Muhammad Ali Pasha (1805–1848) modernised Egypt, building armies, industries, and educational institutions, creating a virtually independent state. His descendant Khedive Ismail built the Suez Canal (1869) but accumulated massive debts, leading to British occupation (1882). Egypt became a British protectorate during WWI.",
    periods: [
      { name: 'Ottoman Egypt', start: 1517, end: 1798 },
      { name: 'Muhammad Ali Dynasty', start: 1805, end: 1882 },
      { name: 'British Occupation', start: 1882, end: 1952 },
    ],
  },
  {
    id: 'modern-egypt',
    name: 'Modern Egypt',
    start: 1952, end: 2025,
    region: 'modern',
    icon: '🇪🇬',
    description: "The Free Officers Revolution (1952) ended the monarchy and British influence. Nasser nationalised the Suez Canal (1956), triggering the Suez Crisis. Egypt fought Israel in 1948, 1956, 1967 (disastrous Six-Day War), and 1973 (Yom Kippur War). Sadat's Camp David Accords (1978) made peace with Israel. Mubarak's 30-year rule ended in the Arab Spring (2011). Mohamed Morsi's brief Islamist government was overthrown by the military in 2013; Abdel Fattah el-Sisi has governed since.",
    periods: [
      { name: 'Nasser Era', start: 1952, end: 1970 },
      { name: 'Sadat & Mubarak', start: 1970, end: 2011 },
      { name: 'Arab Spring & Modern', start: 2011, end: 2025 },
    ],
  },
];
