// =============================================================
// Religion & Mythology — swim-lane data
// =============================================================

export const religionCategories = [
  { id: 'mesopotamian',   name: 'Mesopotamian & Sumerian',  color: '#F59E0B' },
  { id: 'egyptian',       name: 'Egyptian Religion',         color: '#EAB308' },
  { id: 'greco-roman',    name: 'Greco-Roman Mythology',     color: '#6366F1' },
  { id: 'norse',          name: 'Norse & Germanic',          color: '#64748B' },
  { id: 'celtic',         name: 'Celtic & Druidic',          color: '#10B981' },
  { id: 'vedic-hinduism', name: 'Vedic & Hindu Traditions',  color: '#EC4899' },
  { id: 'abrahamic',      name: 'Abrahamic Religions',       color: '#3B82F6' },
  { id: 'eastern',        name: 'Eastern Religions',         color: '#14B8A6' },
  { id: 'indigenous',     name: 'Indigenous & Shamanic',     color: '#8B5CF6' },
];

export const religionItems = [

  // =========================================================
  // MESOPOTAMIAN
  // =========================================================
  {
    id: 'mesopotamian-religion',
    name: 'Mesopotamian Religion',
    start: -3500, end: -500,
    region: 'mesopotamian',
    icon: '🏺',
    description: 'The oldest recorded religious tradition in the world, encompassing Sumerian, Akkadian, Babylonian, and Assyrian mythology. Gods like Enlil, Inanna, Marduk, and Ashur presided over a pantheon tied to city-states and natural forces. The Epic of Gilgamesh grapples with mortality and the divine. Cuneiform tablets preserve hymns, rituals, and the Enuma Elish creation epic.',
    periods: [
      { name: 'Sumerian', start: -3500, end: -2000 },
      { name: 'Akkadian & Babylonian', start: -2000, end: -1000 },
      { name: 'Assyrian & Late Period', start: -1000, end: -500 },
    ],
  },

  // =========================================================
  // EGYPTIAN
  // =========================================================
  {
    id: 'egyptian-religion',
    name: 'Egyptian Religion',
    start: -3100, end: 395,
    region: 'egyptian',
    icon: '👁️',
    description: "One of the longest-lasting religious traditions in history, centred on Ma'at (cosmic order), the afterlife, and an elaborate pantheon including Ra, Osiris, Isis, Horus, and Thoth. Monumental temples, the Book of the Dead, and mummification practices reflected a profound preoccupation with death and resurrection. Egyptian religion evolved through the great kingdoms before being absorbed into Greco-Roman syncretism.",
    periods: [
      { name: 'Old Kingdom', start: -3100, end: -2100 },
      { name: 'Middle & New Kingdom', start: -2100, end: -332 },
      { name: 'Greco-Roman Phase', start: -332, end: 395 },
    ],
  },

  // =========================================================
  // GRECO-ROMAN
  // =========================================================
  {
    id: 'greek-religion',
    name: 'Greek Religion',
    start: -800, end: 400,
    region: 'greco-roman',
    icon: '🏛️',
    description: 'Centred on the twelve Olympians — Zeus, Hera, Apollo, Athena, Poseidon, and others — Greek religion blended myth, ritual, and philosophy. The Oracle at Delphi, the Olympic Games (dedicated to Zeus), mystery cults at Eleusis, and the Homeric epics shaped Greek religious life. Hellenistic religion spread Greek gods across the Mediterranean and Near East.',
    periods: [
      { name: 'Archaic', start: -800, end: -480 },
      { name: 'Classical', start: -480, end: -323 },
      { name: 'Hellenistic', start: -323, end: 400 },
    ],
  },
  {
    id: 'roman-religion',
    name: 'Roman Religion',
    start: -753, end: 380,
    region: 'greco-roman',
    icon: '🦅',
    description: 'Roman religion evolved from animistic spirits (numina) and family ancestor cults into a civic religion centred on the Capitoline Triad (Jupiter, Juno, Minerva). The Imperial Cult deified emperors and served as political glue. Mystery religions from Egypt (Isis) and Persia (Mithras) flourished alongside the official cults until Christianity rose under Constantine.',
    periods: [
      { name: 'Republic Religion', start: -753, end: -27 },
      { name: 'Imperial Cult', start: -27, end: 312 },
      { name: 'Decline', start: 312, end: 380 },
    ],
  },

  // =========================================================
  // NORSE
  // =========================================================
  {
    id: 'norse-religion',
    name: 'Norse Religion',
    start: -200, end: 1100,
    region: 'norse',
    icon: '⚡',
    description: 'The pre-Christian religion of the Norse and Germanic peoples, centred on gods like Odin (wisdom, war, death), Thor (thunder), Freya (love, fertility), and Loki (trickery). The cosmos was structured around Yggdrasil, the world-tree, with nine realms including Asgard and Midgard. Ragnarok — the prophesied twilight of the gods — gave Norse mythology a distinctive apocalyptic dimension.',
    periods: [
      { name: 'Proto-Germanic', start: -200, end: 400 },
      { name: 'Viking Age', start: 793, end: 1066 },
      { name: 'Christianisation', start: 960, end: 1100 },
    ],
  },

  // =========================================================
  // CELTIC
  // =========================================================
  {
    id: 'celtic-religion',
    name: 'Celtic Religion',
    start: -800, end: 400,
    region: 'celtic',
    icon: '🌿',
    description: 'The religion of the Iron Age Celts across Gaul, Britain, Ireland, and Iberia, presided over by the Druids — a learned priestly class who maintained oral traditions, performed sacrifice, and served as judges and astronomers. Celtic gods were tied to nature, rivers, and local territories. Sacred groves (nemeton), the Otherworld, and the transmigration of souls were central beliefs.',
    periods: [
      { name: 'Continental Celtic', start: -800, end: -50 },
      { name: 'Druidic Peak', start: -400, end: -50 },
      { name: 'Insular Celtic', start: -50, end: 400 },
    ],
  },

  // =========================================================
  // VEDIC-HINDUISM
  // =========================================================
  {
    id: 'vedic-religion',
    name: 'Vedic Religion',
    start: -1500, end: -500,
    region: 'vedic-hinduism',
    icon: '🕉️',
    description: 'The earliest layer of Hinduism, brought by Indo-Aryan migrations into the Indian subcontinent. The four Vedas — Rigveda, Samaveda, Yajurveda, Atharvaveda — form the foundational scriptures. Ritual sacrifice (yajna) to devas such as Agni, Indra, and Varuna was central. The later Upanishads shifted focus from external ritual to inward philosophical inquiry, laying the groundwork for classical Hinduism.',
    periods: [
      { name: 'Early Vedic', start: -1500, end: -1000 },
      { name: 'Later Vedic', start: -1000, end: -700 },
      { name: 'Upanishadic', start: -700, end: -500 },
    ],
  },
  {
    id: 'hinduism',
    name: 'Hinduism',
    start: -500, end: 2025,
    region: 'vedic-hinduism',
    icon: '🪔',
    description: "The world's oldest living religion. Classical Hinduism synthesised Vedic religion with the Puranas, the Epics (Mahabharata, Ramayana), and the Bhagavad Gita. The Trimurti — Brahma the Creator, Vishnu the Preserver, Shiva the Destroyer — became central. Medieval bhakti movements democratised devotion. Hinduism encompasses extraordinary doctrinal diversity from Advaita Vedanta to Shaivism to Vaishnavism.",
    periods: [
      { name: 'Classical & Epic', start: -500, end: 500 },
      { name: 'Puranic & Medieval', start: 500, end: 1200 },
      { name: 'Bhakti Movements', start: 1200, end: 1800 },
      { name: 'Modern', start: 1800, end: 2025 },
    ],
  },
  {
    id: 'zoroastrianism',
    name: 'Zoroastrianism',
    start: -1500, end: 2025,
    region: 'vedic-hinduism',
    icon: '🔥',
    description: 'Founded by the prophet Zarathustra, Zoroastrianism was the state religion of the Achaemenid, Parthian, and Sassanid Persian Empires. Its dualistic theology — Ahura Mazda (good) versus Angra Mainyu (evil) — along with free will, judgment after death, and a final renovation of the world profoundly influenced Judaism, Christianity, and Islam. The Arab conquest (651 CE) shattered Persian Zoroastrianism; the Parsi community of India preserves it today.',
    periods: [
      { name: 'Early & Achaemenid', start: -1500, end: -330 },
      { name: 'Parthian & Sassanid', start: -247, end: 651 },
      { name: 'Modern Diaspora', start: 651, end: 2025 },
    ],
  },

  // =========================================================
  // ABRAHAMIC
  // =========================================================
  {
    id: 'jewish-religion',
    name: 'Judaism',
    start: -1800, end: 2025,
    region: 'abrahamic',
    icon: '✡️',
    description: "One of the world's oldest monotheistic traditions, tracing its origins to the covenant between Abraham and God and the Exodus from Egypt under Moses. The Hebrew Bible (Torah) and the prophetic tradition shaped Israelite identity through conquest, monarchy (David, Solomon), exile in Babylon, and return. After the destruction of the Second Temple (70 CE), Rabbinic Judaism emerged as the dominant form, producing the Talmud.",
    periods: [
      { name: 'Patriarchal & Mosaic', start: -1800, end: -1000 },
      { name: 'Temple Period', start: -1000, end: 70 },
      { name: 'Rabbinic Diaspora', start: 70, end: 1800 },
      { name: 'Modern', start: 1800, end: 2025 },
    ],
  },
  {
    id: 'christianity',
    name: 'Christianity',
    start: 30, end: 2025,
    region: 'abrahamic',
    icon: '✝️',
    description: "The world's largest religion, originating in the life, death, and resurrection of Jesus of Nazareth in Roman Judea. Paul's missionary journeys spread the faith across the Roman Empire; Constantine's Edict of Milan (313 CE) legalised it; Theodosius made it the state religion (380 CE). The Great Schism (1054) split East from West; the Protestant Reformation (1517) fractured the Western church. Today Christianity has over 2.4 billion adherents.",
    periods: [
      { name: 'Early Church', start: 30, end: 313 },
      { name: 'Byzantine & Catholic', start: 313, end: 1054 },
      { name: 'Medieval', start: 1054, end: 1517 },
      { name: 'Reformation & Modern', start: 1517, end: 2025 },
    ],
  },
  {
    id: 'islam',
    name: 'Islam',
    start: 622, end: 2025,
    region: 'abrahamic',
    icon: '☪️',
    description: "Founded by the Prophet Muhammad in Arabia, Islam spread with extraordinary speed from the Arabian Peninsula across the Middle East, North Africa, Persia, Central Asia, and beyond within a century. The Quran and Hadith form the scriptural foundation. The Sunni-Shia split (656 CE) arose over the question of succession. The Islamic Golden Age (8th–13th centuries) preserved and advanced Greek philosophy, mathematics, and science. Today Islam has over 1.9 billion adherents.",
    periods: [
      { name: 'Early Islam & Rashidun', start: 622, end: 661 },
      { name: 'Umayyad & Abbasid', start: 661, end: 1258 },
      { name: 'Ottoman & Mughal Era', start: 1299, end: 1924 },
      { name: 'Modern', start: 1924, end: 2025 },
    ],
  },

  // =========================================================
  // EASTERN
  // =========================================================
  {
    id: 'buddhism',
    name: 'Buddhism',
    start: -500, end: 2025,
    region: 'eastern',
    icon: '☸️',
    description: "Founded by Siddhartha Gautama (the Buddha) in the 5th century BCE in what is now Nepal. The Four Noble Truths and Eightfold Path offer a path to liberation from suffering (nirvana) through ethical conduct, meditation, and wisdom. Ashoka's patronage spread Buddhism across Asia. Mahayana emphasised the bodhisattva ideal; Theravada preserved early teachings; Vajrayana developed in Tibet. Today Buddhism has approximately 500 million adherents.",
    periods: [
      { name: 'Early Buddhism', start: -500, end: -250 },
      { name: 'Ashokan Spread', start: -250, end: 100 },
      { name: 'Mahayana & Theravada', start: 100, end: 700 },
      { name: 'Vajrayana & East Asian', start: 700, end: 2025 },
    ],
  },
  {
    id: 'jainism',
    name: 'Jainism',
    start: -600, end: 2025,
    region: 'eastern',
    icon: '🤲',
    description: 'One of the oldest living religions, founded on the teachings of Mahavira (6th century BCE), the 24th and final tirthankara. Jainism is distinguished by its radical commitment to non-violence (ahimsa), truth (satya), and asceticism. The Digambara–Shvetambara schism (c. 300 CE) split the community on questions of monastic practice. Jain philosophy contributed profoundly to Indian logic, epistemology, and ethics.',
    periods: [
      { name: 'Mahavira & Early Jainism', start: -600, end: -300 },
      { name: 'Digambara–Shvetambara Split', start: -300, end: 500 },
      { name: 'Classical & Modern', start: 500, end: 2025 },
    ],
  },
  {
    id: 'taoism',
    name: 'Taoism',
    start: -400, end: 2025,
    region: 'eastern',
    icon: '☯️',
    description: "A Chinese philosophical and religious tradition rooted in the Tao Te Ching attributed to Laozi and the Zhuangzi. The Tao (Way) is the underlying, indescribable force of the universe; following it through wu wei (non-action, effortless action) brings harmony. Religious Taoism developed elaborate rituals, a pantheon of deities, and alchemical practices seeking immortality. Tang Dynasty emperors claimed descent from Laozi, making Taoism a state religion.",
    periods: [
      { name: 'Classical Taoism', start: -400, end: 200 },
      { name: 'Religious Taoism', start: 200, end: 900 },
      { name: 'Tang Flourishing & Modern', start: 900, end: 2025 },
    ],
  },
  {
    id: 'confucianism',
    name: 'Confucianism',
    start: -500, end: 2025,
    region: 'eastern',
    icon: '📜',
    description: "Based on the teachings of Confucius (551–479 BCE), Confucianism is an ethical and social philosophy that became China's dominant state ideology. It emphasises ritual propriety (li), humaneness (ren), filial piety, and hierarchical social relationships as the foundation of a well-ordered society. Han emperors institutionalised Confucian learning through the civil service examination system. Neo-Confucianism (Song Dynasty) fused Confucian ethics with Buddhist and Taoist metaphysics.",
    periods: [
      { name: 'Classical', start: -500, end: -136 },
      { name: 'Han State Religion', start: -136, end: 220 },
      { name: 'Neo-Confucianism', start: 960, end: 1912 },
      { name: 'Modern', start: 1912, end: 2025 },
    ],
  },
  {
    id: 'shinto',
    name: 'Shinto',
    start: -300, end: 2025,
    region: 'eastern',
    icon: '⛩️',
    description: "Japan's indigenous religion, centred on kami — sacred spirits inhabiting natural phenomena, ancestors, and places. The Kojiki (712 CE) and Nihon Shoki record the mythological origins of Japan and the imperial family from the sun goddess Amaterasu. Shinto coexisted and intertwined with Buddhism for centuries. State Shinto (1868–1945) was used to promote nationalism and imperial divinity before being disestablished after World War II.",
    periods: [
      { name: 'Ancient Kami Worship', start: -300, end: 600 },
      { name: 'Shinto-Buddhist Fusion', start: 600, end: 1868 },
      { name: 'State Shinto & Modern', start: 1868, end: 2025 },
    ],
  },
  {
    id: 'sikhism',
    name: 'Sikhism',
    start: 1469, end: 2025,
    region: 'eastern',
    icon: '🪯',
    description: 'Founded by Guru Nanak Dev Ji in the Punjab region, Sikhism teaches monotheism, equality, and selfless service (seva). Ten Gurus shaped the faith between 1469 and 1708 CE; the Guru Granth Sahib then became the eternal living Guru. Guru Gobind Singh established the Khalsa in 1699, creating the distinctive identity with the Five Ks. The Golden Temple at Amritsar is Sikhism\'s holiest site. Today approximately 30 million Sikhs live worldwide.',
    periods: [
      { name: 'Guru Period', start: 1469, end: 1708 },
      { name: 'Khalsa & Sikh Empire', start: 1699, end: 1849 },
      { name: 'Modern', start: 1849, end: 2025 },
    ],
  },

  // =========================================================
  // INDIGENOUS
  // =========================================================
  {
    id: 'mayan-religion',
    name: 'Mayan Religion',
    start: -2000, end: 1500,
    region: 'indigenous',
    icon: '🌽',
    description: "The Maya developed one of Mesoamerica's most sophisticated religious traditions, centred on a complex pantheon, astronomical cycles (especially the 260-day ritual calendar and 365-day solar calendar), and elaborate sacrificial rites. The Popol Vuh records the Maya creation myth. Monumental temple-pyramids served as ritual centres and astronomical observatories. The collapse of Classic Maya cities (800–900 CE) remains one of history's great mysteries.",
    periods: [
      { name: 'Preclassic', start: -2000, end: 250 },
      { name: 'Classic', start: 250, end: 900 },
      { name: 'Postclassic', start: 900, end: 1500 },
    ],
  },
  {
    id: 'aztec-religion',
    name: 'Aztec Religion',
    start: 1300, end: 1521,
    region: 'indigenous',
    icon: '🌞',
    description: 'The Aztec (Mexica) religion was an elaborate polytheistic tradition centred on Tenochtitlan, with the sun god Huitzilopochtli and rain god Tlaloc among the most important deities. The Aztecs believed the sun required human blood sacrifice to rise each day. The 365-day xiuhpohualli and 260-day tonalpohualli calendars interlocked to form a 52-year sacred cycle. Spanish conquest in 1521 brought the tradition to an abrupt end.',
    periods: [
      { name: 'Rise of Tenochtitlan', start: 1300, end: 1428 },
      { name: 'Triple Alliance Peak', start: 1428, end: 1521 },
    ],
  },
  {
    id: 'inca-religion',
    name: 'Inca Religion',
    start: 1400, end: 1572,
    region: 'indigenous',
    icon: '🦙',
    description: "Centred on Inti (the sun god), the Inca religion was the state religion of the largest empire in pre-Columbian America. The Sapa Inca was considered a divine son of Inti. The Temple of the Sun (Coricancha) in Cusco was the empire's spiritual heart, its walls lined with gold. Ancestor worship was central — mummified ancestors (malquis) were treated as living presences. Spanish conquest devastated Inca religion, though Andean folk Catholicism preserves many elements.",
    periods: [
      { name: 'Inca Empire', start: 1400, end: 1532 },
      { name: 'Conquest & Suppression', start: 1532, end: 1572 },
    ],
  },
];
