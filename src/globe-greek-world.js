/**
 * Day 56 — the ancient Greek world on the globe, about 1600 BCE to 146 BCE, with its neighbours.
 *
 * Arthur (11 Oct 2026): "Can you do Greeks and that period next". Before this the globe had one
 * blue blob for "Classical Greece" (480–330 BCE), rough Achaemenid / Seleucid / Carthage shapes,
 * and nothing for the Bronze Age Aegean, Macedon, Alexander or the other successor kingdoms.
 * This module adds or redraws:
 *   - Minoan Crete, Mycenaean Greece and the Hittite empire (Bronze Age, to the collapse c. 1180);
 *   - the Greek city-states: Archaic Greece, Athens and the Delian League, Sparta and the
 *     Peloponnesian League, Thebes and the Boeotian League, the Achaean and Aetolian leagues;
 *   - Lydia, Achaemenid Persia, Carthage, the Etruscans, Syracuse, Epirus and the Roman Republic
 *     as the neighbours that shaped them;
 *   - Macedon, Alexander's empire, and the Ptolemaic, Seleucid, Antigonid, Attalid, Greco-Bactrian
 *     and Indo-Greek kingdoms;
 *   - the Hellenes as a people (Greek speakers, from the Mycenaeans and the colonies to today);
 *   - extra keyframes for Mesopotamia (Assyria / Babylon), Phoenicia, Egypt and early Parthia.
 *
 * Shapes are built from the shared pieces in globe-med-pieces.js, so allies, satrapies and
 * provinces fit together edge to edge. Each entity says how sure we are (`confidence`).
 * Labels follow the era: `nameAt` gives the name in use from a year on.
 */

import * as P from './globe-med-pieces.js';

const M = P.mergeRings;
const A = 'simplified';
/** A region block (same ring object every keyframe it appears in, so it never re-samples). */
const R = (id, name, ring) => ({ id, name, ring });
const K = (year, label, regions, extra = {}) => ({ year, label, approximation: A, regions, ...extra });
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${title.replace(/ /g, '_')}` });
const BARRINGTON = { title: 'Talbert (ed.), Barrington Atlas of the Greek and Roman World (Princeton, 2000)', url: 'https://press.princeton.edu/books/hardcover/9780691031699/barrington-atlas-of-the-greek-and-roman-world' };
const AWMC = { title: 'Ancient World Mapping Center (UNC): free historical maps', url: 'https://awmc.unc.edu/awmc/map_data/shapefiles/' };
const PLEIADES = { title: 'Pleiades gazetteer of ancient places', url: 'https://pleiades.stoa.org/' };

const CONF = {
  bronze: {
    level: 'conjectural',
    reason: 'Known from palace ruins, Linear B tablets and Hittite and Egyptian letters; how far each palace ruled is inferred from where its sites and pottery cluster.',
  },
  polis: {
    level: 'approximate',
    reason: 'City-state territories and alliance lists are well recorded (Thucydides, Xenophon, tribute lists, inscriptions), but borders between small states are drawn roughly here.',
  },
  league: {
    level: 'approximate',
    reason: 'Members are known from treaties, inscriptions and historians; membership changed year to year, and the hinterland of each member is drawn roughly.',
  },
  kingdom: {
    level: 'approximate',
    reason: 'Hand-drawn from historical atlases (Barrington Atlas). Hellenistic kingdoms had well-known provinces but changing frontiers and client rulers at the edges.',
  },
  empire: {
    level: 'approximate',
    reason: 'Satrapies and provinces are known from royal inscriptions and Greek historians; the desert and mountain edges, and how firmly the far east was held, are rough.',
  },
  colonies: {
    level: 'approximate',
    reason: 'Greek cities and their dates are well known; how far Greek speech reached inland around them is a reasoned guess.',
  },
};

// Blocks ---------------------------------------------------------------------------------------
const SOUTH_GREECE = [P.ACARNANIA, P.AETOLIA, P.PHOCIS_LOCRIS, P.BOEOTIA, P.ATTICA, P.MEGARIS, P.CORINTHIA, P.ACHAEA, P.ELIS, P.MESSENIA, P.LACONIA, P.ARGOLID, P.ARCADIA];
const HELLAS = M('hellas', ...SOUTH_GREECE, P.THESSALY);
const SOUTH_NO_LACONIA = [P.ACARNANIA, P.AETOLIA, P.PHOCIS_LOCRIS, P.BOEOTIA, P.ATTICA, P.MEGARIS, P.CORINTHIA, P.ACHAEA, P.ELIS, P.MESSENIA, P.ARGOLID, P.ARCADIA];
const LEAGUE_OF_CORINTH = M('league-of-corinth', ...SOUTH_NO_LACONIA);
const NORTH_GREECE = M('north-greece', P.EPIRUS, P.MACEDON, P.CHALCIDICE);
const MACEDON_THRACE = M('macedon-thrace', P.MACEDON, P.CHALCIDICE, P.THESSALY, P.THRACE_COAST, P.THRACE);
const THRACE_CHALC = M('thrace-chalcidice', P.CHALCIDICE, P.THRACE_COAST);
const ARGOLID_CORINTH = M('argolid-corinthia', P.ARGOLID, P.CORINTHIA);
const PELO_ARC_ELIS = M('arcadia-elis', P.ARCADIA, P.ELIS);
const PELO_CORINTH_MEGARA = M('corinth-megara', P.CORINTHIA, P.MEGARIS);
const AETOLIA_ACARNANIA = M('aetolia-acarnania', P.AETOLIA, P.ACARNANIA);
const ASIA_COAST = M('asia-coast', P.IONIA, P.CARIA);
const AEGEAN_COAST = M('aegean-coast', P.HELLESPONT, P.IONIA, P.CARIA);
const ANATOLIA_INNER = M('anatolia-inner', P.PHRYGIA, P.CAPPADOCIA, P.BITHYNIA, P.LYCIA, P.CILICIA);
const ANATOLIA_ALEX = M('anatolia-alexander', P.HELLESPONT, P.IONIA, P.CARIA, P.LYCIA, P.PHRYGIA, P.CILICIA);
const ANATOLIA_GREEK = M('anatolia-greek', P.PHRYGIA, P.BITHYNIA, P.LYCIA, P.CILICIA, P.CAPPADOCIA);
const SEL_ANATOLIA = M('seleucid-anatolia', P.PHRYGIA, P.IONIA, P.CARIA);
const LYDIA_REALM = M('lydia-realm', P.PHRYGIA, P.HELLESPONT, P.BITHYNIA);
const PERG_WEST = M('pergamon-west', P.HELLESPONT, P.IONIA);
const ASIA_PROVINCE = M('asia-province', P.HELLESPONT, P.IONIA, P.CARIA, P.PHRYGIA);
const MESO_SYRIA = M('meso-syria', P.MESOPOTAMIA, P.SYRIA, P.COELE_SYRIA);
const SYRIA_COELE = M('syria-coele', P.SYRIA, P.COELE_SYRIA);
const SYRIA_EGYPT = M('syria-egypt', P.SYRIA, P.COELE_SYRIA, P.EGYPT);
const IRAN = M('iran', P.MEDIA_PERSIS, P.PARTHIA_ARIA, P.ARACHOSIA);
const IRAN_BACTRIA = M('iran-bactria', P.MEDIA_PERSIS, P.PARTHIA_ARIA, P.ARACHOSIA, P.BACTRIA);
const INDIA = M('india', P.GANDHARA, P.PUNJAB);
const ITALY_SOUTH = M('italy-south', P.LUCANIA, P.BRUTTIUM, P.APULIA);
const SICILY_WE = M('sicily-w-e', P.SICILY_W, P.SICILY_E);
const HISPANIA = M('hispania', P.HISP_SE, P.HISP_NE);
const MACEDONIA_PROV = M('macedonia-province', P.MACEDON, P.CHALCIDICE, P.THESSALY, P.EPIRUS);
const ACHAEA_PROV = M('achaea-province', ...SOUTH_GREECE);
const GREECE_560 = M('greece-560', P.ACARNANIA, P.AETOLIA, P.PHOCIS_LOCRIS, P.BOEOTIA, P.ATTICA, P.MEGARIS, P.CORINTHIA, P.ACHAEA, P.ELIS, P.ARGOLID, P.ARCADIA, P.THESSALY);
const GREECE_500 = M('greece-500', P.ACARNANIA, P.AETOLIA, P.PHOCIS_LOCRIS, P.BOEOTIA, P.THESSALY);
const MAC_CHALC = M('mac-chalc', P.MACEDON, P.CHALCIDICE);

const ISL = {
  euboea: R('euboea', 'Euboea', P.EUBOEA),
  cyclades: R('cyclades', 'Cyclades', P.CYCLADES),
  crete: R('crete', 'Crete', P.CRETE),
  lesbos: R('lesbos', 'Lesbos', P.LESBOS),
  chios: R('chios', 'Chios', P.CHIOS),
  samos: R('samos', 'Samos', P.SAMOS),
  rhodes: R('rhodes', 'Rhodes', P.RHODES),
};

// Bronze Age -----------------------------------------------------------------------------------
const minoan = {
  id: 'minoan-crete',
  name: 'Minoan Crete',
  color: '#14B8A6',
  type: 'civilization',
  description:
    'Europe’s first palace civilisation. From about 1950 BCE Crete was run from great palaces (Knossos, Phaistos, Malia, Zakros) that stored crops, kept accounts in Linear A, a script still unread, and traded across the Aegean, to Egypt and the Levant. Minoan culture spread through the Cyclades until the huge eruption of Thera (Santorini), dated about 1600 BCE by radiocarbon (some archaeologists still argue for c. 1500), buried the town at Akrotiri. Around 1450 BCE most palaces burned, and Greek-speaking Mycenaeans took over Knossos.',
  keyYears: [-1950, -1700, -1600, -1500],
  overlays: [
    K(-1950, 'First palaces (Old Palace period)', [ISL.crete]),
    K(-1700, 'New palaces rebuilt after earthquakes', [ISL.crete]),
    K(-1600, 'Minoan Aegean before the Thera eruption', [ISL.crete, R('cyclades', 'Minoanised Cyclades (Thera, Melos, Kea)', P.CYCLADES)]),
    K(-1500, 'Late palaces', [ISL.crete]),
  ],
  timelineItemIds: ['minoan-crete'],
  confidence: CONF.bronze,
  sources: [W('Minoan civilization'), W('Minoan eruption'), { title: 'Cline (ed.), The Oxford Handbook of the Bronze Age Aegean (2010)', url: 'https://doi.org/10.1093/oxfordhb/9780199873609.001.0001' }],
};

const MYC = {
  argolid: R('argolid', 'Mycenae, Tiryns and the Argolid', ARGOLID_CORINTH),
  messenia: R('messenia', 'Pylos (Messenia)', P.MESSENIA),
  laconia: R('laconia', 'Laconia (Menelaion)', P.LACONIA),
  crete: R('crete', 'Knossos and Crete', P.CRETE),
  thebes: R('thebes', 'Thebes and Orchomenos (Boeotia)', P.BOEOTIA),
  athens: R('athens', 'Athens (Attica)', P.ATTICA),
  cyclades: R('cyclades', 'Cyclades', P.CYCLADES),
  rhodes: R('rhodes', 'Rhodes', P.RHODES),
  miletus: R('miletus', 'Millawanda (Miletus)', P.MILLAWANDA),
  iolkos: R('iolkos', 'Iolkos', P.IOLKOS),
};
const mycenaean = {
  id: 'mycenaean-greece',
  name: 'Mycenaean Greece',
  color: '#B45309',
  type: 'civilization',
  description:
    'The first Greek-speaking civilisation. From about 1600 BCE warrior elites at Mycenae (the Shaft Graves) and elsewhere grew rich; by 1400 BCE palace kingdoms at Mycenae, Tiryns, Pylos, Thebes, Athens, Iolkos and Knossos kept records in Linear B, an early form of Greek. They were never one state: each palace ruled its own district, drawn here separately. The Hittites called a western power "Ahhiyawa", probably Mycenaean Greeks, with a foothold at Miletus. Between about 1200 and 1180 BCE the palaces were destroyed, and writing disappeared from Greece for 400 years.',
  keyYears: [-1600, -1450, -1300, -1250, -1180, -1100],
  overlays: [
    K(-1600, 'Shaft Grave elites (early Mycenaean)', [MYC.argolid, MYC.messenia]),
    K(-1450, 'Mycenaeans take over Knossos', [MYC.argolid, MYC.messenia, MYC.laconia, MYC.crete]),
    K(-1300, 'Palace kingdoms', [MYC.argolid, MYC.messenia, MYC.laconia, MYC.crete, MYC.thebes, MYC.athens, MYC.cyclades, MYC.rhodes, MYC.miletus]),
    K(-1250, 'Height of the palaces', [MYC.argolid, MYC.messenia, MYC.laconia, MYC.crete, MYC.thebes, MYC.athens, MYC.cyclades, MYC.rhodes, MYC.miletus, MYC.iolkos]),
    K(-1180, 'Palaces destroyed (c. 1200–1180)', [MYC.argolid, MYC.athens, MYC.crete]),
    K(-1100, 'Post-palatial Greece', [MYC.argolid, MYC.athens]),
  ],
  timelineItemIds: ['mycenaean-greece'],
  confidence: CONF.bronze,
  sources: [W('Mycenaean Greece'), W('Late Bronze Age collapse'), W('Ahhiyawa'), BARRINGTON],
};

const HIT = {
  core: R('hatti', 'Hatti', P.HATTI_CORE),
  empire: R('hatti-empire', 'Hatti, Kizzuwatna and the Lower Land', P.HATTI_EMPIRE),
  syria: R('syria', 'North Syria (Carchemish, Aleppo, Ugarit, Amurru)', P.NORTH_SYRIA_LBA),
  arzawa: R('arzawa', 'Arzawa lands (Mira, Seha, Wilusa), vassals', P.ARZAWA),
};
const hittite = {
  id: 'hittite-empire',
  name: 'Hittite Empire',
  color: '#6366F1',
  type: 'empire',
  description:
    'An Anatolian great power ruled from Hattusa, inside the bend of the Halys river. The Old Kingdom (from about 1650 BCE) raided as far as Babylon; the New Kingdom under Suppiluliuma I (c. 1350–1322) took north Syria from Mitanni and from Egypt’s orbit, and the Arzawa kingdoms of the west became vassals. After the Battle of Kadesh (1274) Hattusili III and Ramesses II signed the oldest surviving peace treaty. The north coast stayed with the hostile Kaska. Around 1185–1180 BCE, amid famine and the upheavals of the Late Bronze Age collapse, Hattusa was abandoned.',
  keyYears: [-1650, -1500, -1400, -1340, -1300, -1250, -1200],
  overlays: [
    K(-1650, 'Old Kingdom (Hattusili I)', [HIT.core]),
    K(-1500, 'Middle Kingdom', [HIT.core]),
    K(-1400, 'Before Suppiluliuma', [HIT.core]),
    K(-1340, 'Suppiluliuma I: north Syria won', [HIT.empire, HIT.syria]),
    K(-1300, 'Arzawa lands made vassals', [HIT.empire, HIT.syria, HIT.arzawa]),
    K(-1250, 'After Kadesh: peace with Egypt', [HIT.empire, HIT.syria, HIT.arzawa]),
    K(-1200, 'Last years of Hattusa', [HIT.empire, HIT.syria]),
  ],
  timelineItemIds: ['hittite-empire'],
  confidence: { level: 'approximate', reason: 'Hittite royal archives, treaties and Egyptian letters name the vassal kingdoms; many of their exact locations, and the edges between them, are still debated.' },
  sources: [W('Hittites'), W('Battle of Kadesh'), W('Arzawa'), { title: 'Bryce, The Kingdom of the Hittites (Oxford, 2005)', url: 'https://global.oup.com/academic/product/the-kingdom-of-the-hittites-9780199281329' }],
};

// Archaic and Classical Greece -----------------------------------------------------------------
const CG = {
  hellas: R('hellas', 'Mainland Greece', HELLAS),
  asia: R('asia-coast', 'Aeolis, Ionia and Doris', ASIA_COAST),
  hellespont: R('hellespont', 'Greek towns of the Hellespont and Propontis', P.HELLESPONT),
  north560: R('north', 'Central and northern Greece', GREECE_560),
  central500: R('central', 'Thessaly, Boeotia, Phocis and the west', GREECE_500),
  thessaly: R('thessaly', 'Thessaly', P.THESSALY),
  west: R('west', 'Aetolia and Acarnania', AETOLIA_ACARNANIA),
  argos: R('argos', 'Argos', P.ARGOLID),
  achaea: R('achaea', 'Achaea', P.ACHAEA),
  arcadia: R('arcadia', 'Arcadian League (Megalopolis)', P.ARCADIA),
  messenia: R('messenia', 'Messene, free again (369)', P.MESSENIA),
  phocis: R('phocis', 'Phocis (holding Delphi)', P.PHOCIS_LOCRIS),
};
const ISLANDS_ALL = [ISL.euboea, ISL.cyclades, ISL.crete, ISL.lesbos, ISL.chios, ISL.samos, ISL.rhodes];
const classicalGreece = {
  id: 'classical-greece',
  name: 'Classical Greece',
  nameAt: [[-800, 'Archaic Greece'], [-480, 'Independent Greek states']],
  color: '#1D4ED8',
  type: 'civilization',
  description:
    'Greece was never one country: it was hundreds of self-governing city-states (poleis) sharing a language, gods, the Olympic Games and the Delphic oracle. In the Archaic age (c. 800–480 BCE) they adopted the alphabet, developed the hoplite phalanx, tried tyranny, oligarchy and (at Athens, 508 BCE) democracy, and planted colonies from Spain to the Black Sea. From 480 BCE most states belonged to one of the big alliances, drawn as their own shapes (Athens and the Delian League, Sparta and the Peloponnesian League, Thebes); this shape then shows the states outside them, such as Argos, Thessaly, Achaea and Aetolia. Philip II of Macedon’s victory at Chaeronea (338 BCE) ended their independence.',
  keyYears: [-750, -650, -560, -540, -500, -460, -430, -400, -370, -350, -338],
  overlays: [
    K(-750, 'Archaic poleis: the age of colonisation begins', [CG.hellas, ...ISLANDS_ALL, CG.asia]),
    K(-650, 'Tyrants and hoplites', [CG.hellas, ...ISLANDS_ALL, CG.asia, CG.hellespont]),
    K(-560, 'Ionia under Lydia; Sparta builds its league', [CG.north560, ...ISLANDS_ALL]),
    K(-540, 'Ionia and the east Aegean fall to Persia (546)', [CG.north560, ISL.euboea, ISL.cyclades, ISL.crete]),
    K(-500, 'Before the Persian Wars', [CG.central500, CG.argos, CG.achaea, ISL.euboea, ISL.cyclades, ISL.crete]),
    K(-460, 'Outside the two blocs', [CG.thessaly, CG.west, CG.argos, CG.achaea, ISL.crete]),
    K(-430, 'Neutral or loosely allied states', [CG.thessaly, CG.west, CG.argos, CG.achaea, ISL.crete]),
    K(-400, 'Under the Spartan hegemony', [CG.thessaly, CG.west, CG.argos, ISL.crete]),
    K(-370, 'After Leuctra: Arcadia and Messenia freed', [CG.west, CG.argos, CG.achaea, CG.arcadia, CG.messenia, ISL.crete]),
    K(-350, 'Third Sacred War', [CG.west, CG.argos, CG.achaea, CG.arcadia, CG.messenia, CG.phocis, ISL.crete]),
    K(-338, 'Chaeronea: Macedon takes over', [CG.west, CG.argos, CG.achaea, CG.arcadia, CG.messenia, ISL.crete]),
  ],
  timelineItemIds: ['archaic-greece', 'classical-greece'],
  confidence: CONF.polis,
  sources: [W('Archaic Greece'), W('Classical Greece'), W('Polis'), BARRINGTON, { title: 'Hansen & Nielsen, An Inventory of Archaic and Classical Poleis (Oxford, 2004)', url: 'https://global.oup.com/academic/product/an-inventory-of-archaic-and-classical-poleis-9780198140993' }],
};

const ATH = {
  attica: R('attica', 'Attica', P.ATTICA),
  asia: R('asia-coast', 'Ionian and Carian districts', ASIA_COAST),
  hellespont: R('hellespont', 'Hellespontine district', P.HELLESPONT),
  thrace: R('thrace', 'Thracian district (Chalcidice to Byzantion)', THRACE_CHALC),
};
const ATH_454 = [ATH.attica, ...ISLANDS_ALL.filter((r) => r.id !== 'crete'), ATH.asia, ATH.hellespont, ATH.thrace];
const athens = {
  id: 'athens-delian-league',
  name: 'Athens',
  nameAt: [[-508, 'Athens'], [-478, 'Athens and the Delian League'], [-454, 'Athenian Empire (Delian League)'], [-404, 'Athens'], [-378, 'Athens and the Second Athenian League'], [-338, 'Athens']],
  color: '#0EA5E9',
  type: 'state',
  description:
    'Athens became a democracy under Cleisthenes in 508 BCE, led the Greek fleet at Salamis (480) and in 478 founded the Delian League, an alliance of some 150–300 island and coastal cities sworn to keep fighting Persia. Athens turned it into an empire: the treasury moved from Delos to Athens in 454, tribute helped pay for the Parthenon, and revolts were crushed. The league covered the Aegean islands and the coasts of Ionia, Caria, the Hellespont, Thrace and Chalcidice. It collapsed with Athens’ defeat in the Peloponnesian War (404). A gentler Second Athenian League (378–338) faded after its allies revolted in the Social War of 357–355.',
  keyYears: [-508, -478, -454, -431, -413, -405, -404, -378, -357, -350, -338],
  overlays: [
    K(-508, 'Cleisthenes’ democracy', [ATH.attica]),
    K(-478, 'Delian League founded', [ATH.attica, ISL.euboea, ISL.cyclades, ISL.lesbos, ISL.chios, ISL.samos]),
    K(-454, 'Treasury moved to Athens: an empire', ATH_454),
    K(-431, 'Peloponnesian War begins', ATH_454),
    K(-413, 'After the Sicilian disaster: revolts begin', [ATH.attica, ISL.euboea, ISL.cyclades, ISL.lesbos, ISL.samos, ATH.asia, ATH.hellespont]),
    K(-405, 'Aegospotami: the fleet destroyed', [ATH.attica, ISL.samos]),
    K(-404, 'Surrender to Sparta', [ATH.attica]),
    K(-378, 'Second Athenian League', [ATH.attica, ISL.euboea, ISL.cyclades, ISL.lesbos, ISL.chios, ISL.rhodes]),
    K(-357, 'Social War: Chios, Rhodes and Byzantion revolt', [ATH.attica, ISL.euboea, ISL.cyclades, ISL.lesbos]),
    K(-350, 'A smaller league', [ATH.attica, ISL.cyclades, ISL.samos]),
    K(-338, 'Chaeronea: the league dissolved', [ATH.attica, ISL.samos]),
  ],
  timelineItemIds: ['classical-greece'],
  confidence: { level: 'approximate', reason: 'Members are known from the Athenian tribute lists carved in stone; the shapes cover their islands and coastal districts roughly, not exact city territories.' },
  sources: [W('Delian League'), W('Second Athenian League'), W('Athenian democracy'), { title: 'Athenian Tribute Lists (Attic Inscriptions Online)', url: 'https://www.atticinscriptions.com/' }],
};

const SPA = {
  laconia: R('laconia', 'Laconia', P.LACONIA),
  messenia: R('messenia', 'Messenia (helots)', P.MESSENIA),
  allies: R('allies', 'Allies: Elis and the Arcadians', PELO_ARC_ELIS),
  allies2: R('allies-isthmus', 'Allies: Corinth, Sicyon and Megara', PELO_CORINTH_MEGARA),
  phocis: R('phocis-locris', 'Allies: Phocis and Locris', P.PHOCIS_LOCRIS),
  achaea: R('achaea', 'Achaea', P.ACHAEA),
  corinth: R('corinth', 'Corinth and Phlius, still loyal', P.CORINTHIA),
};
const sparta = {
  id: 'sparta-peloponnesian-league',
  name: 'Sparta',
  nameAt: [[-550, 'Sparta'], [-505, 'Sparta and the Peloponnesian League'], [-366, 'Sparta']],
  color: '#B91C1C',
  type: 'state',
  description:
    'Sparta ruled Laconia and, from the 8th–7th centuries BCE, Messenia, whose people it held as helots (state serfs) who farmed while Spartan citizens trained for war. From the later 6th century BCE it led the Peloponnesian League, an alliance of mostly oligarchic states (Corinth, Elis, the Arcadians, Megara; Argos always stayed out). Allied with Boeotia, Phocis and Locris, it beat Athens in the Peloponnesian War (431–404) with Persian money, and dominated Greece until Thebes crushed its army at Leuctra (371). Messenia was freed in 369 and the league broke up; Sparta survived as a small state until the Achaean League absorbed it in 192 BCE.',
  keyYears: [-550, -500, -431, -404, -386, -372, -369, -365, -300, -222, -193],
  overlays: [
    K(-550, 'Sparta with subject Messenia', [SPA.laconia, SPA.messenia]),
    K(-500, 'Peloponnesian League', [SPA.laconia, SPA.messenia, SPA.allies, SPA.allies2]),
    K(-431, 'Peloponnesian War: Sparta’s alliance', [SPA.laconia, SPA.messenia, SPA.allies, SPA.allies2, SPA.phocis]),
    K(-404, 'Spartan hegemony', [SPA.laconia, SPA.messenia, SPA.allies, SPA.allies2, SPA.achaea, SPA.phocis]),
    K(-386, 'King’s Peace: Sparta enforces it', [SPA.laconia, SPA.messenia, SPA.allies, SPA.allies2, SPA.achaea, SPA.phocis]),
    K(-372, 'On the eve of Leuctra', [SPA.laconia, SPA.messenia, SPA.allies, SPA.allies2, SPA.achaea]),
    K(-369, 'Messenia freed by Epaminondas', [SPA.laconia, SPA.corinth]),
    K(-365, 'League dissolved', [SPA.laconia]),
    K(-300, 'A minor power', [SPA.laconia]),
    K(-222, 'Cleomenes III defeated at Sellasia', [SPA.laconia]),
    K(-193, 'Nabis, the last independent king', [SPA.laconia]),
  ],
  timelineItemIds: ['archaic-greece', 'classical-greece'],
  confidence: CONF.league,
  sources: [W('Sparta'), W('Peloponnesian League'), W('Battle of Leuctra'), BARRINGTON],
};

const THB = {
  boeotia: R('boeotia', 'Boeotia', P.BOEOTIA),
  phocis: R('phocis-locris', 'Allies: Phocis and Locris', P.PHOCIS_LOCRIS),
  thessaly: R('thessaly', 'Thessaly (Theban protectorate)', P.THESSALY),
};
const thebes = {
  id: 'thebes-boeotian-league',
  name: 'Thebes and the Boeotian League',
  color: '#65A30D',
  type: 'state',
  description:
    'The cities of Boeotia were organised as a federal league led by Thebes. Thebes sided with Persia in 480 and with Sparta against Athens. After throwing out a Spartan garrison (379 BCE), Epaminondas and Pelopidas rebuilt the league and smashed the Spartan army at Leuctra (371) with a deepened left wing; Theban armies then freed Messenia, founded Megalopolis and dominated Thessaly. The hegemony ended when Epaminondas fell at Mantinea (362). Thebes fought Philip II at Chaeronea (338), revolted against Alexander, and was razed in 335 BCE.',
  keyYears: [-447, -431, -379, -371, -364, -355, -338],
  overlays: [
    K(-447, 'Boeotian League restored after Coronea', [THB.boeotia]),
    K(-431, 'Ally of Sparta', [THB.boeotia]),
    K(-379, 'Spartan garrison expelled; league refounded', [THB.boeotia]),
    K(-371, 'Leuctra', [THB.boeotia, ISL.euboea]),
    K(-364, 'Theban hegemony at its height', [THB.boeotia, ISL.euboea, THB.thessaly]),
    K(-355, 'Sacred War against Phocis', [THB.boeotia]),
    K(-338, 'Chaeronea', [THB.boeotia]),
  ],
  timelineItemIds: ['classical-greece'],
  confidence: CONF.league,
  sources: [W('Boeotian League'), W('Theban hegemony'), W('Epaminondas')],
};

// Neighbours -----------------------------------------------------------------------------------
const LYD = {
  core: R('core', 'Lydia (Sardis)', P.LYDIA_CORE),
  realm: R('realm', 'Lydia to the Halys', LYDIA_REALM),
  ionia: R('ionia', 'Greek cities of Ionia and Caria (tributary)', ASIA_COAST),
};
const lydia = {
  id: 'lydia',
  name: 'Kingdom of Lydia',
  color: '#CA8A04',
  type: 'state',
  description:
    'The kingdom of the Mermnad dynasty, ruled from Sardis. Gyges (c. 680 BCE) began attacking the Greek cities of the coast; Alyattes pushed the border east to the Halys river, fixed by treaty with the Medes after the eclipse battle of 585; Croesus, proverbially rich, made the Ionian Greeks tributary and honoured Delphi. The Lydians are credited with the first coins, of electrum. Cyrus the Great took Sardis in 547/546 BCE.',
  keyYears: [-680, -600, -560, -547],
  overlays: [
    K(-680, 'Gyges founds the Mermnad dynasty', [LYD.core]),
    K(-600, 'Alyattes: west Anatolia to the Halys', [LYD.realm]),
    K(-560, 'Croesus: the Ionian Greeks pay tribute', [LYD.realm, LYD.ionia]),
    K(-547, 'Sardis falls to Cyrus', [LYD.realm, LYD.ionia]),
  ],
  timelineItemIds: ['lydia'],
  confidence: CONF.kingdom,
  sources: [W('Lydia'), W('Croesus'), W('Battle of the Eclipse')],
};

const PER = {
  iran: R('iran', 'Iranian plateau, Bactria and Sogdia', IRAN_BACTRIA),
  armenia: R('armenia', 'Armenia', P.ARMENIA),
  anatolia: R('anatolia', 'Anatolia', ANATOLIA_INNER),
  coast: R('aegean-coast', 'Ionia, Aeolis and Caria', AEGEAN_COAST),
  meso: R('meso-syria', 'Babylonia, Assyria and Across-the-River (Syria)', MESO_SYRIA),
  egypt: R('egypt', 'Egypt', P.EGYPT),
  cyprus: R('cyprus', 'Cyprus', P.CYPRUS),
  libya: R('libya', 'Cyrene and Barca (tributary)', P.CYRENAICA),
  india: R('india', 'Gandhara and Hindush (Indus)', P.GANDHARA),
  thrace: R('thrace', 'Skudra (Thrace)', P.THRACE_COAST),
  macedon: R('macedon', 'Macedon (vassal kingdom)', P.MACEDON),
};
const PER_CORE = [PER.iran, PER.armenia, PER.anatolia];
const achaemenid = {
  id: 'achaemenid-empire',
  name: 'Achaemenid Persian Empire',
  color: '#C2410C',
  type: 'empire',
  description:
    'The first empire to join the Mediterranean, the Near East and Central Asia. Cyrus the Great took Media (550 BCE), Lydia (547) and Babylon (539); Cambyses added Egypt (525); Darius I reached the Indus and crossed into Europe (c. 513), ruling through some 20 satrapies linked by the Royal Road. The Greek wars cost Persia Thrace and the Aegean coast (479–449), and Egypt broke away from 404 to 343. The King’s Peace of 387/386 gave the Ionian cities back to Persia. Alexander the Great conquered the empire between 334 and 330 BCE.',
  keyYears: [-547, -539, -525, -513, -492, -479, -449, -404, -386, -343, -334],
  overlays: [
    K(-547, 'Cyrus: Media and Lydia won', [...PER_CORE, PER.coast]),
    K(-539, 'Babylon falls', [...PER_CORE, PER.coast, PER.meso]),
    K(-525, 'Cambyses conquers Egypt', [...PER_CORE, PER.coast, PER.meso, PER.egypt, PER.cyprus, PER.libya]),
    K(-513, 'Darius I: the Indus and Thrace', [...PER_CORE, PER.coast, PER.meso, PER.egypt, PER.cyprus, PER.libya, PER.india, PER.thrace]),
    K(-492, 'Macedon a vassal; before Marathon', [...PER_CORE, PER.coast, PER.meso, PER.egypt, PER.cyprus, PER.libya, PER.india, PER.thrace, PER.macedon]),
    K(-479, 'After Plataea and Mycale', [...PER_CORE, PER.meso, PER.egypt, PER.cyprus, PER.india]),
    K(-449, 'Peace of Callias', [...PER_CORE, PER.meso, PER.egypt, PER.cyprus, PER.india]),
    K(-404, 'Egypt breaks away', [...PER_CORE, PER.meso, PER.cyprus, PER.india]),
    K(-386, 'King’s Peace: Ionia returned', [...PER_CORE, PER.coast, PER.meso, PER.cyprus, PER.india]),
    K(-343, 'Artaxerxes III retakes Egypt', [...PER_CORE, PER.coast, PER.meso, PER.egypt, PER.cyprus, PER.india]),
    K(-334, 'Alexander crosses into Asia', [...PER_CORE, PER.coast, PER.meso, PER.egypt, PER.cyprus]),
  ],
  timelineItemIds: ['persian-achaemenid'],
  confidence: CONF.empire,
  sources: [W('Achaemenid Empire'), W('Satrap'), W('Behistun Inscription'), { title: 'Briant, From Cyrus to Alexander: A History of the Persian Empire (2002)', url: 'https://www.eisenbrauns.org/books/titles/978-1-57506-120-7.html' }],
};

const CAR = {
  core: R('carthage', 'Carthage and northern Tunisia', P.CARTHAGE_CORE),
  ibiza: R('ibiza', 'Ebusus (Ibiza)', P.IBIZA),
  emporia: R('libyphoenicia', 'Emporia of Tripolitania', P.LIBYPHOENICIA),
  sicily: R('sicily-w', 'Western Sicily (Motya, Panormus, Lilybaeum)', P.SICILY_W),
  sardinia: R('sardinia', 'Sardinia', P.SARDINIA),
  corsica: R('corsica', 'Corsica', P.CORSICA),
  spainCoast: R('iberia-s', 'Gadir, Malaka and the Punic coast of Spain', P.IBERIA_PUNIC_COAST),
  barcid: R('iberia', 'Barcid Spain, south of the Ebro', P.HISP_SE),
  rump: R('carthage-rump', 'Carthage’s African territory', P.CARTHAGE_RUMP),
};
const CAR_540 = [CAR.core, CAR.ibiza, CAR.emporia, CAR.sicily, CAR.sardinia, CAR.spainCoast];
const carthage = {
  id: 'carthage',
  name: 'Carthage',
  color: '#7F1D1D',
  type: 'empire',
  description:
    'Founded by settlers from Tyre (traditionally 814 BCE), Carthage grew into the leading Phoenician power of the west. It ruled northern Tunisia and protected the older Phoenician towns of Tripolitania, western Sicily, Sardinia, Ibiza and southern Spain; with the Etruscans it fought the Greeks at Alalia (c. 540) and lost to Syracuse at Himera (480). Rome took Sicily (241), Sardinia and Corsica (238); Hamilcar and Hasdrubal built a new realm in Spain, from which Hannibal invaded Italy (218). After Zama (202) Carthage kept only its African core, and Rome destroyed it in 146 BCE.',
  keyYears: [-700, -650, -540, -480, -400, -264, -241, -237, -228, -218, -206, -201, -150],
  overlays: [
    K(-700, 'Early Carthage', [CAR.core]),
    K(-650, 'Ibiza settled (654)', [CAR.core, CAR.ibiza]),
    K(-540, 'Alalia: the western Phoenicians under Carthage', CAR_540),
    K(-480, 'Himera: defeat by Syracuse', CAR_540),
    K(-400, 'Punic Sicily west of the Halycus', CAR_540),
    K(-264, 'Before the First Punic War', [...CAR_540, CAR.corsica]),
    K(-241, 'Sicily lost to Rome', [CAR.core, CAR.ibiza, CAR.emporia, CAR.sardinia, CAR.corsica, CAR.spainCoast]),
    K(-237, 'Sardinia and Corsica lost; Hamilcar to Spain', [CAR.core, CAR.ibiza, CAR.emporia, CAR.spainCoast]),
    K(-228, 'Barcid Spain (New Carthage)', [CAR.core, CAR.ibiza, CAR.emporia, CAR.barcid]),
    K(-218, 'Hannibal marches on Italy', [CAR.core, CAR.ibiza, CAR.emporia, CAR.barcid]),
    K(-206, 'Spain lost to Scipio', [CAR.core, CAR.emporia]),
    K(-201, 'After Zama: Africa only', [CAR.rump, CAR.emporia]),
    K(-150, 'Squeezed by Numidia', [CAR.rump]),
  ],
  timelineItemIds: ['carthage'],
  confidence: CONF.empire,
  sources: [W('Ancient Carthage'), W('Punic Wars'), W('Battle of Alalia'), { title: 'Miles, Carthage Must Be Destroyed (2010)', url: 'https://www.penguin.co.uk/books/56143/carthage-must-be-destroyed-by-richard-miles/9780141018096' }],
};

const ETR = {
  etruria: R('etruria', 'Etruria', P.ETRURIA),
  campania: R('campania', 'Capua and Campania', P.CAMPANIA_ETR),
  po: R('po', 'Felsina, Spina and the Po valley', P.PO_ETRURIA),
  corsica: R('corsica', 'Corsica (after Alalia)', P.CORSICA),
};
const etruscans = {
  id: 'etruscans',
  name: 'Etruscan city-states',
  color: '#9A3412',
  type: 'civilization',
  description:
    'A league of twelve city-states between the Arno and the Tiber (Veii, Caere, Tarquinii, Vulci, Clusium …) speaking a non-Indo-European language. Rich from iron and trade, they spread into the Po valley (Felsina, Spina) and Campania (Capua), allied with Carthage against the Greeks at Alalia (c. 540) and gave Rome kings, the toga and gladiatorial games. Defeat by Syracuse off Cumae (474), the loss of Capua to the Samnites (c. 424), Celtic invasions of the Po valley and Rome’s capture of Veii (396) began a long decline; the last independent cities fell to Rome by 264 BCE.',
  keyYears: [-750, -600, -540, -474, -424, -396, -300, -264],
  overlays: [
    K(-750, 'Villanovan towns become cities', [ETR.etruria]),
    K(-600, 'Etruscans in Campania', [ETR.etruria, ETR.campania]),
    K(-540, 'Height: Po valley, Campania and Corsica', [ETR.etruria, ETR.campania, ETR.po, ETR.corsica]),
    K(-474, 'Defeat off Cumae', [ETR.etruria, ETR.campania, ETR.po, ETR.corsica]),
    K(-424, 'Capua lost to the Samnites', [ETR.etruria, ETR.po]),
    K(-396, 'Rome takes Veii; Celts in the Po valley', [ETR.etruria]),
    K(-300, 'Under Roman pressure', [ETR.etruria]),
    K(-264, 'Volsinii falls: the last independent city', [ETR.etruria]),
  ],
  timelineItemIds: ['etruscans'],
  confidence: CONF.polis,
  sources: [W('Etruscan civilization'), W('Etruscan League'), W('Battle of Cumae')],
};

const SYR = {
  se: R('syracuse', 'Syracuse and the south-east', P.SICILY_SE),
  east: R('east', 'Greek eastern Sicily', P.SICILY_E),
  bruttium: R('bruttium', 'Rhegion and the toe of Italy', P.BRUTTIUM),
};
const syracuse = {
  id: 'syracuse',
  name: 'Syracuse',
  color: '#E11D48',
  type: 'state',
  description:
    'Founded from Corinth in 734/733 BCE, Syracuse became the largest Greek city in the west. The tyrant Gelon beat Carthage at Himera (480); Syracuse crushed the Athenian expedition (413); Dionysius I (405–367) ruled most of Greek Sicily and the toe of Italy, and Agathocles (317–289) even invaded Africa. Under Hiero II (c. 270–215) it was a prosperous kingdom in the south-east and a loyal ally of Rome, home to Archimedes. It sided with Carthage after Cannae and fell to Rome in 212 BCE.',
  keyYears: [-480, -460, -400, -379, -367, -340, -300, -289, -270, -213],
  overlays: [
    K(-480, 'Gelon’s realm (Himera)', [SYR.se, SYR.east]),
    K(-460, 'Democracy after the tyrants', [SYR.se]),
    K(-400, 'Dionysius I', [SYR.se, SYR.east]),
    K(-379, 'Dionysius in southern Italy', [SYR.se, SYR.east, SYR.bruttium]),
    K(-367, 'Death of Dionysius I', [SYR.se, SYR.east]),
    K(-340, 'Timoleon frees the Greek cities', [SYR.se]),
    K(-300, 'King Agathocles', [SYR.se, SYR.east]),
    K(-289, 'Death of Agathocles', [SYR.se, SYR.east]),
    K(-270, 'Hiero II’s kingdom', [SYR.se]),
    K(-213, 'Siege by Rome; Archimedes’ machines', [SYR.se]),
  ],
  timelineItemIds: ['archaic-greece', 'classical-greece'],
  confidence: CONF.polis,
  sources: [W('Syracuse, Sicily'), W('Dionysius I of Syracuse'), W('Hiero II of Syracuse'), W('Siege of Syracuse (213–212 BC)')],
};

const EPI = {
  epirus: R('epirus', 'Epirus', P.EPIRUS),
  corcyra: R('corcyra', 'Corcyra', P.CORCYRA),
  acarnania: R('acarnania', 'Acarnania and Ambracia', P.ACARNANIA),
};
const epirus = {
  id: 'epirus',
  name: 'Kingdom of Epirus',
  nameAt: [[-330, 'Kingdom of Epirus'], [-232, 'Epirote League']],
  color: '#8B5E34',
  type: 'state',
  description:
    'The Molossian kings of Epirus, in the mountainous north-west of Greece, built a federal state in the 4th century BCE. Pyrrhus (297–272) added Ambracia, Acarnania and Corcyra, briefly ruled Macedon, and fought Rome and Carthage in Italy and Sicily, winning the costly "Pyrrhic" victories at Heraclea and Asculum. The monarchy ended in about 232 and the Epirote League followed. Siding with Macedon in the Third Macedonian War, Epirus was sacked by Rome in 167 BCE and 150,000 people were sold into slavery.',
  keyYears: [-330, -295, -280, -272, -232, -170],
  overlays: [
    K(-330, 'Alexander I of Epirus', [EPI.epirus]),
    K(-295, 'Pyrrhus: Corcyra', [EPI.epirus, EPI.corcyra]),
    K(-280, 'Pyrrhus sails for Italy', [EPI.epirus, EPI.corcyra, EPI.acarnania]),
    K(-272, 'Death of Pyrrhus', [EPI.epirus, EPI.acarnania]),
    K(-232, 'Monarchy ends: Epirote League', [EPI.epirus]),
    K(-170, 'Third Macedonian War', [EPI.epirus]),
  ],
  timelineItemIds: ['classical-greece'],
  confidence: CONF.kingdom,
  sources: [W('Epirus (ancient state)'), W('Pyrrhus of Epirus'), W('Pyrrhic War')],
};

const ROM = {
  latium: R('latium', 'Rome and Latium', P.LATIUM),
  campania: R('campania', 'Campania', P.CAMPANIA),
  samnium: R('samnium', 'Samnium and the Sabine hills', P.SAMNIUM),
  etruria: R('etruria', 'Etruria', P.ETRURIA),
  umbria: R('umbria', 'Umbria and Picenum', P.UMBRIA),
  south: R('south', 'Lucania, Bruttium and Apulia (allies)', ITALY_SOUTH),
  sicily: R('sicily', 'Sicilia (the first province)', SICILY_WE),
  sicilySE: R('sicily-se', 'Syracuse (taken 212)', P.SICILY_SE),
  sardinia: R('sardinia', 'Sardinia', P.SARDINIA),
  corsica: R('corsica', 'Corsica', P.CORSICA),
  cisalpine: R('cisalpine', 'Cisalpine Gaul', P.CISALPINE),
  hispania: R('hispania', 'Hispania Citerior and Ulterior', HISPANIA),
  hispW: R('hispania-w', 'Central and western Hispania', P.HISP_W),
  illyria: R('illyria', 'Illyricum', P.ILLYRIA),
  macedonia: R('macedonia', 'Macedonia (province, 146)', MACEDONIA_PROV),
  achaea: R('achaea', 'Greece (under the governor of Macedonia)', ACHAEA_PROV),
  euboea: R('euboea', 'Euboea', P.EUBOEA),
  africa: R('africa', 'Africa (Carthage’s land)', P.CARTHAGE_RUMP),
  asia: R('asia', 'Asia (Pergamon’s bequest)', ASIA_PROVINCE),
  narb: R('narbonensis', 'Gallia Transalpina (Narbonensis)', P.NARBONENSIS),
  cilicia: R('cilicia', 'Cilicia', P.CILICIA),
  cyrenaica: R('cyrenaica', 'Cyrenaica', P.CYRENAICA),
  bithynia: R('bithynia', 'Bithynia', P.BITHYNIA),
  crete: R('crete', 'Crete', P.CRETE),
  syria: R('syria', 'Syria (and client Judaea)', SYRIA_COELE),
  cyprus: R('cyprus', 'Cyprus', P.CYPRUS),
  gaul: R('gaul', 'Gaul (Caesar’s conquest)', P.GAUL),
};
const ITALY = [ROM.latium, ROM.campania, ROM.samnium, ROM.etruria, ROM.umbria, ROM.south];
const R201 = [...ITALY, ROM.sicily, ROM.sicilySE, ROM.sardinia, ROM.corsica, ROM.hispania];
const R146 = [...R201, ROM.cisalpine, ROM.illyria, ROM.macedonia, ROM.achaea, ROM.euboea, ROM.africa];
const R121 = [...R146, ROM.hispW, ROM.asia, ROM.narb];
const R74 = [...R121, ROM.cilicia, ROM.cyrenaica, ROM.bithynia];
const romanRepublic = {
  id: 'roman-republic',
  name: 'Roman Republic',
  color: '#F43F5E',
  type: 'state',
  description:
    'After expelling its last king (traditionally 509 BCE) Rome led the Latin League, beat the Latins (338) and the Samnites (343–290), and by 264 controlled peninsular Italy through colonies and allies. The Punic Wars brought its first provinces overseas: Sicily (241), Sardinia and Corsica (238), Spain (from 206). It then turned east, defeating Macedon (197, 168), the Seleucids (190) and the Achaean League; in 146 BCE it destroyed both Carthage and Corinth, and in 133 inherited Pergamon. Pompey and Caesar added Syria, Pontus and Gaul before the Republic gave way to Augustus in 27 BCE.',
  keyYears: [-500, -340, -290, -264, -241, -238, -218, -201, -191, -167, -146, -133, -121, -100, -74, -64, -50],
  overlays: [
    K(-500, 'Rome leads the Latin League', [ROM.latium]),
    K(-340, 'Latin War: Latium and Campania', [ROM.latium, ROM.campania]),
    K(-290, 'Samnites and Etruscans defeated', [ROM.latium, ROM.campania, ROM.samnium, ROM.etruria, ROM.umbria]),
    K(-264, 'All peninsular Italy', ITALY),
    K(-241, 'Sicily: the first province', [...ITALY, ROM.sicily]),
    K(-238, 'Sardinia and Corsica seized', [...ITALY, ROM.sicily, ROM.sardinia, ROM.corsica]),
    K(-218, 'Hannibal invades', [...ITALY, ROM.sicily, ROM.sardinia, ROM.corsica]),
    K(-201, 'After Zama: Spain and Syracuse', R201),
    K(-191, 'Cisalpine Gaul subdued', [...R201, ROM.cisalpine]),
    K(-167, 'Pydna: Illyria annexed, Macedon broken up', [...R201, ROM.cisalpine, ROM.illyria]),
    K(-146, 'Carthage and Corinth destroyed', R146),
    K(-133, 'Pergamon bequeathed; Numantia falls', [...R146, ROM.hispW, ROM.asia]),
    K(-121, 'Southern Gaul', R121),
    K(-100, 'Marius; war on the pirates', [...R121, ROM.cilicia]),
    K(-74, 'Bithynia and Cyrene bequeathed', R74),
    K(-64, 'Pompey in the east: Crete and Syria', [...R74, ROM.crete, ROM.syria]),
    K(-50, 'Caesar’s Gaul', [...R74, ROM.crete, ROM.syria, ROM.cyprus, ROM.gaul]),
  ],
  timelineItemIds: ['roman-republic'],
  confidence: { level: 'approximate', reason: 'Provinces and their dates are well recorded; Italy is drawn by region (Rome ruled it through allies), and frontier provinces like Spain were held patchily at first.' },
  sources: [W('Roman Republic'), W('Roman province'), BARRINGTON, AWMC],
};

// Macedon, Alexander and the successor kingdoms ------------------------------------------------
const MAC = {
  macedon: R('macedon', 'Lower and Upper Macedonia', P.MACEDON),
  thessaly: R('thessaly', 'Thessaly', P.THESSALY),
  thraceCoast: R('thrace-coast', 'Amphipolis, Philippi and the Thracian coast', P.THRACE_COAST),
  chalcidice: R('chalcidice', 'Chalcidice', P.CHALCIDICE),
  thrace: R('thrace', 'Thrace to the Danube', P.THRACE),
  league: R('league', 'League of Corinth (Greek allies)', LEAGUE_OF_CORINTH),
};
const argeadMacedon = {
  id: 'argead-macedon',
  name: 'Kingdom of Macedon',
  color: '#9333EA',
  type: 'state',
  description:
    'The Argead kings ruled Lower Macedonia from Aigai, and later Pella, with the hill cantons of Upper Macedonia loosely attached. Macedon was a Persian vassal from 492 to 479 BCE and a minor power for a century more. Philip II (359–336) reformed the army around the long-speared sarissa phalanx and the Companion cavalry, took Amphipolis and its gold mines, Chalcidice and Thrace, became leader of the Thessalian League, and after Chaeronea (338) headed a League of Corinth binding the Greek states (all but Sparta) to Macedon.',
  keyYears: [-500, -479, -431, -359, -352, -348, -340, -337],
  overlays: [
    K(-500, 'Argead kingdom', [MAC.macedon]),
    K(-479, 'Free of Persia again', [MAC.macedon]),
    K(-431, 'Perdiccas II', [MAC.macedon]),
    K(-359, 'Philip II becomes king', [MAC.macedon]),
    K(-352, 'Leader of the Thessalian League', [MAC.macedon, MAC.thessaly, MAC.thraceCoast]),
    K(-348, 'Olynthus destroyed: Chalcidice annexed', [MAC.macedon, MAC.thessaly, MAC.thraceCoast, MAC.chalcidice]),
    K(-340, 'Thrace conquered', [MAC.macedon, MAC.thessaly, MAC.thraceCoast, MAC.chalcidice, MAC.thrace]),
    K(-337, 'League of Corinth under Macedon', [MAC.macedon, MAC.thessaly, MAC.thraceCoast, MAC.chalcidice, MAC.thrace, MAC.league]),
  ],
  timelineItemIds: ['macedon'],
  confidence: CONF.kingdom,
  sources: [W('Macedonia (ancient kingdom)'), W('Philip II of Macedon'), W('League of Corinth')],
};

const ALX = {
  home: R('macedon', 'Macedon, Thessaly and Thrace', MACEDON_THRACE),
  league: R('league', 'League of Corinth (Greek allies)', LEAGUE_OF_CORINTH),
  asiaMinor: R('asia-minor', 'Asia Minor', ANATOLIA_ALEX),
  syriaEgypt: R('syria-egypt', 'Syria, Phoenicia and Egypt', SYRIA_EGYPT),
  cyprus: R('cyprus', 'Cyprus', P.CYPRUS),
  babylonia: R('babylonia', 'Babylonia and Assyria', P.MESOPOTAMIA),
  iran: R('iran', 'Persis, Media, Parthia, Aria, Arachosia, Gedrosia', IRAN),
  bactria: R('bactria', 'Bactria and Sogdia', P.BACTRIA),
  india: R('india', 'Gandhara and the Punjab (Porus a vassal)', INDIA),
};
const ALX_331 = [ALX.home, ALX.league, ALX.asiaMinor, ALX.syriaEgypt, ALX.cyprus, ALX.babylonia];
const ALX_PEAK = [...ALX_331, ALX.iran, ALX.bactria, ALX.india];
const alexander = {
  id: 'macedonian-empire',
  name: 'Empire of Alexander the Great',
  color: '#F59E0B',
  type: 'empire',
  description:
    'In eleven years Alexander III of Macedon took the whole Persian empire: Asia Minor after the Granicus (334), Syria and Egypt after Issus (333) and the siege of Tyre, Babylon and Persepolis after Gaugamela (331), then Bactria and Sogdia in three hard years of guerrilla war, and the Punjab after beating Porus at the Hydaspes (326). He founded or refounded a dozen or more cities named Alexandria. He died at Babylon in June 323 BCE, aged 32. His generals (the Diadochi) kept up the fiction of one empire under his half-brother and infant son until about 306, while fighting each other for its pieces.',
  keyYears: [-336, -334, -333, -331, -330, -327, -326, -323, -320],
  overlays: [
    K(-336, 'Alexander becomes king', [ALX.home, ALX.league]),
    K(-334, 'Granicus: into Asia', [ALX.home, ALX.league]),
    K(-333, 'Issus: Asia Minor won', [ALX.home, ALX.league, ALX.asiaMinor]),
    K(-331, 'Egypt taken; Gaugamela', ALX_331),
    K(-330, 'Persepolis burned; Darius III dead', [...ALX_331, ALX.iran]),
    K(-327, 'Bactria and Sogdia subdued', [...ALX_331, ALX.iran, ALX.bactria]),
    K(-326, 'Hydaspes: the Punjab', ALX_PEAK),
    K(-323, 'Alexander dies at Babylon', ALX_PEAK),
    K(-320, 'Triparadisus: one empire in name, run by rival generals', [ALX.home, ALX.asiaMinor, ALX.syriaEgypt, ALX.cyprus, ALX.babylonia, ALX.iran, ALX.bactria]),
  ],
  timelineItemIds: ['macedonian-empire'],
  confidence: CONF.empire,
  sources: [W('Alexander the Great'), W('Wars of Alexander the Great'), W('Diadochi'), { title: 'Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988)', url: 'https://doi.org/10.1017/CBO9780511518539' }],
};

const PTO = {
  egypt: R('egypt', 'Egypt', P.EGYPT),
  cyrene: R('cyrenaica', 'Cyrenaica', P.CYRENAICA),
  coele: R('coele-syria', 'Coele-Syria and Phoenicia', P.COELE_SYRIA),
  cyprus: R('cyprus', 'Cyprus', P.CYPRUS),
  lycia: R('lycia', 'Lycia and Pamphylia', P.LYCIA),
  cyclades: R('cyclades', 'Cyclades (League of the Islanders)', P.CYCLADES),
  samos: R('samos', 'Samos', P.SAMOS),
};
const ptolemaic = {
  id: 'ptolemaic-kingdom',
  name: 'Ptolemaic Kingdom',
  color: '#0D9488',
  type: 'empire',
  description:
    'Ptolemy, one of Alexander’s generals, took Egypt in 323 and was crowned king in 305 BCE. His dynasty ruled from Alexandria (with its Library, Museum and Pharos lighthouse) as pharaohs to Egyptians and Macedonian kings to Greeks. At its height under Ptolemy II and III it also held Cyrenaica, Cyprus, Coele-Syria, the coast of southern Asia Minor and Aegean islands. Antiochus III took Coele-Syria at Panium (200); after that the kingdom shrank to Egypt, Cyprus and Cyrenaica and leaned on Rome. Cleopatra VII’s death in 30 BCE ended it.',
  keyYears: [-305, -301, -275, -246, -200, -197, -168, -96, -58, -30],
  overlays: [
    K(-305, 'Ptolemy I crowned', [PTO.egypt, PTO.cyrene]),
    K(-301, 'Coele-Syria occupied', [PTO.egypt, PTO.cyrene, PTO.coele]),
    K(-275, 'Ptolemy II: an Aegean empire', [PTO.egypt, PTO.cyrene, PTO.coele, PTO.cyprus, PTO.lycia, PTO.cyclades, PTO.samos]),
    K(-246, 'Ptolemy III: Third Syrian War', [PTO.egypt, PTO.cyrene, PTO.coele, PTO.cyprus, PTO.lycia, PTO.samos]),
    K(-200, 'Panium: Coele-Syria lost', [PTO.egypt, PTO.cyrene, PTO.cyprus, PTO.lycia, PTO.samos]),
    K(-197, 'Asian possessions lost', [PTO.egypt, PTO.cyrene, PTO.cyprus]),
    K(-168, 'Rome stops Antiochus IV at Eleusis', [PTO.egypt, PTO.cyrene, PTO.cyprus]),
    K(-96, 'Cyrenaica left to Rome', [PTO.egypt, PTO.cyprus]),
    K(-58, 'Cyprus annexed by Rome', [PTO.egypt]),
    K(-30, 'Cleopatra VII dies; Egypt becomes Roman', [PTO.egypt]),
  ],
  timelineItemIds: ['ptolemaic-egypt'],
  confidence: CONF.kingdom,
  sources: [W('Ptolemaic Kingdom'), W('Syrian Wars'), W('Library of Alexandria')],
};

const SEL = {
  babylonia: R('babylonia', 'Babylonia and Mesopotamia', P.MESOPOTAMIA),
  media: R('media-persis', 'Media, Persis and Susiana', P.MEDIA_PERSIS),
  parthia: R('parthia-aria', 'Parthia, Aria, Drangiana, Carmania', P.PARTHIA_ARIA),
  bactria: R('bactria', 'Bactria and Sogdia', P.BACTRIA),
  syria: R('syria', 'Syria (Seleucis)', P.SYRIA),
  cilicia: R('cilicia', 'Cilicia', P.CILICIA),
  anatolia: R('anatolia', 'Asia Minor', SEL_ANATOLIA),
  coele: R('coele-syria', 'Coele-Syria and Judaea', P.COELE_SYRIA),
};
const seleucid = {
  id: 'seleucid-empire',
  name: 'Seleucid Empire',
  color: '#7C3AED',
  type: 'empire',
  description:
    'The largest of the successor kingdoms. Seleucus I won Babylon in 312 BCE, the eastern satrapies, Syria after Ipsus (301) and Asia Minor after Corupedium (281), but gave the Indus lands to Chandragupta Maurya for 500 war elephants. New Greek cities (Antioch, Seleucia on the Tigris, Ai-Khanoum) spread Greek culture. Bactria and Parthia broke away in the mid-3rd century. Antiochus III won much back for a while and took Coele-Syria (200), but after defeat by Rome at Magnesia (190) and the Treaty of Apamea (188) lost Asia Minor; the Parthians took Media and Babylonia between 148 and 129. Pompey ended the shrunken Syrian kingdom in 64/63 BCE.',
  keyYears: [-305, -301, -281, -261, -246, -220, -200, -188, -150, -129, -100, -64],
  overlays: [
    K(-305, 'Seleucus I: Babylon and the east', [SEL.babylonia, SEL.media, SEL.parthia, SEL.bactria]),
    K(-301, 'Ipsus: Syria won', [SEL.babylonia, SEL.media, SEL.parthia, SEL.bactria, SEL.syria, SEL.cilicia]),
    K(-281, 'Corupedium: Asia Minor won', [SEL.babylonia, SEL.media, SEL.parthia, SEL.bactria, SEL.syria, SEL.cilicia, SEL.anatolia]),
    K(-261, 'Antiochus I', [SEL.babylonia, SEL.media, SEL.parthia, SEL.bactria, SEL.syria, SEL.cilicia, SEL.anatolia]),
    K(-246, 'Bactria breaks away', [SEL.babylonia, SEL.media, SEL.parthia, SEL.syria, SEL.cilicia, SEL.anatolia]),
    K(-220, 'Parthia lost; Antiochus III', [SEL.babylonia, SEL.media, SEL.syria, SEL.cilicia, SEL.anatolia]),
    K(-200, 'Panium: Coele-Syria taken', [SEL.babylonia, SEL.media, SEL.syria, SEL.cilicia, SEL.anatolia, SEL.coele]),
    K(-188, 'Treaty of Apamea: Asia Minor lost', [SEL.babylonia, SEL.media, SEL.syria, SEL.cilicia, SEL.coele]),
    K(-150, 'Media threatened by Parthia', [SEL.babylonia, SEL.media, SEL.syria, SEL.cilicia, SEL.coele]),
    K(-129, 'Babylonia lost for good; Judaea independent', [SEL.syria, SEL.cilicia]),
    K(-100, 'A divided Syrian kingdom', [SEL.syria]),
    K(-64, 'Pompey annexes Syria', [SEL.syria]),
  ],
  timelineItemIds: ['seleucid'],
  confidence: CONF.kingdom,
  sources: [W('Seleucid Empire'), W('Treaty of Apamea'), W('Battle of Ipsus'), BARRINGTON],
};

const ANT = {
  mac: R('macedon', 'Macedonia', MAC_CHALC),
  thessaly: R('thessaly', 'Thessaly (Demetrias)', P.THESSALY),
  euboea: R('euboea', 'Euboea (Chalcis)', P.EUBOEA),
  corinth: R('corinth', 'Corinth (Acrocorinth garrison)', P.CORINTHIA),
  attica: R('attica', 'Athens and Attica (garrisoned)', P.ATTICA),
};
const antigonid = {
  id: 'antigonid-macedon',
  name: 'Antigonid Macedon',
  color: '#7E22CE',
  type: 'state',
  description:
    'Antigonus II Gonatas, grandson of Alexander’s general Antigonus the One-Eyed, won Macedon in 277 BCE after beating invading Gauls. His dynasty held Thessaly and the "fetters of Greece" (Demetrias, Chalcis, Corinth) and, for a time, Athens. Philip V allied with Hannibal and lost to Rome at Cynoscephalae (197), giving up Greece; his son Perseus lost again at Pydna (168), and Rome abolished the kingdom. After a pretender’s revolt it became the province of Macedonia in 148/146 BCE.',
  keyYears: [-277, -262, -243, -229, -222, -200, -196, -179, -168],
  overlays: [
    K(-277, 'Antigonus II wins Macedon', [ANT.mac, ANT.thessaly, ANT.euboea, ANT.corinth]),
    K(-262, 'Chremonidean War: Athens taken', [ANT.mac, ANT.thessaly, ANT.euboea, ANT.corinth, ANT.attica]),
    K(-243, 'Aratus seizes Corinth', [ANT.mac, ANT.thessaly, ANT.euboea, ANT.attica]),
    K(-229, 'Athens buys its freedom', [ANT.mac, ANT.thessaly, ANT.euboea]),
    K(-222, 'Sellasia: Antigonus III leads the Hellenic League', [ANT.mac, ANT.thessaly, ANT.euboea, ANT.corinth]),
    K(-200, 'Philip V against Rome', [ANT.mac, ANT.thessaly, ANT.euboea, ANT.corinth]),
    K(-196, 'After Cynoscephalae: "freedom of the Greeks"', [ANT.mac]),
    K(-179, 'Perseus', [ANT.mac]),
    K(-168, 'Pydna: the kingdom abolished', [ANT.mac]),
  ],
  timelineItemIds: ['macedon'],
  confidence: CONF.kingdom,
  sources: [W('Antigonid dynasty'), W('Macedonian Wars'), W('Battle of Pydna')],
};

const PRG = {
  core: R('pergamon', 'Pergamon', P.PERGAMON_SMALL),
  west: R('west', 'Mysia, Aeolis, Ionia and the Troad', PERG_WEST),
  phrygia: R('phrygia', 'Lydia, Phrygia, Pisidia (from 188)', P.PHRYGIA),
};
const pergamon = {
  id: 'attalid-pergamon',
  name: 'Attalid Pergamon',
  color: '#DB2777',
  type: 'state',
  description:
    'Philetairos, Lysimachus’ treasurer, kept the fortress of Pergamon and its 9,000 talents when his master fell (281 BCE). His heirs, the Attalids, beat the Galatians (Attalus I then took the title of king), built the Great Altar and a library rivalling Alexandria’s, and backed Rome. After Apamea (188) Rome gave them most of Seleucid Asia Minor. Attalus III left the kingdom to Rome in his will (133 BCE); it became the province of Asia.',
  keyYears: [-282, -241, -230, -188, -133],
  overlays: [
    K(-282, 'Philetairos holds Pergamon', [PRG.core]),
    K(-241, 'Attalus I defeats the Galatians', [PRG.core]),
    K(-230, 'King Attalus I', [PRG.west]),
    K(-188, 'Apamea: Seleucid Asia Minor given to Pergamon', [PRG.west, PRG.phrygia]),
    K(-133, 'Bequeathed to Rome', [PRG.west, PRG.phrygia]),
  ],
  timelineItemIds: ['attalid-pergamon'],
  confidence: CONF.kingdom,
  sources: [W('Attalid kingdom'), W('Pergamon Altar'), W('Treaty of Apamea')],
};

const BAC = {
  bactria: R('bactria', 'Bactria and Sogdia', P.BACTRIA),
  gandhara: R('gandhara', 'Paropamisadae and Gandhara', P.GANDHARA),
  punjab: R('punjab', 'Punjab (Sagala)', P.PUNJAB),
};
const grecoBactria = {
  id: 'greco-bactria',
  name: 'Greco-Bactrian Kingdom',
  color: '#059669',
  type: 'state',
  description:
    'Diodotus, the Seleucid governor of Bactria, broke away around 250 BCE. Greek settlers ruled a rich land of "a thousand cities" from Bactra and Ai-Khanoum, a Greek city on the Oxus with a theatre, a gymnasium and Delphic maxims carved in stone. Euthydemus held off Antiochus III; Demetrius crossed the Hindu Kush into India (c. 180). Nomads (Saka, then the Yuezhi) overran Bactria around 145–130 BCE; Greek kings lived on south of the mountains as the Indo-Greeks.',
  keyYears: [-250, -230, -206, -180, -170, -130],
  overlays: [
    K(-250, 'Diodotus breaks away', [BAC.bactria]),
    K(-230, 'Euthydemus', [BAC.bactria]),
    K(-206, 'Peace with Antiochus III', [BAC.bactria]),
    K(-180, 'Demetrius crosses the Hindu Kush', [BAC.bactria, BAC.gandhara]),
    K(-170, 'Eucratides', [BAC.bactria]),
    K(-130, 'Overrun by the Yuezhi', [BAC.bactria]),
  ],
  timelineItemIds: ['greco-bactria'],
  confidence: { level: 'conjectural', reason: 'Known mainly from coins, a few lines in Greek, Roman and Chinese historians, and digs at Ai-Khanoum; the order of kings and the borders are reconstructed.' },
  sources: [W('Greco-Bactrian Kingdom'), W('Ai-Khanoum'), { title: 'Holt, Thundering Zeus: The Making of Hellenistic Bactria (1999)', url: 'https://www.ucpress.edu/books/thundering-zeus/paper' }],
};

const indoGreek = {
  id: 'indo-greek-kingdom',
  name: 'Indo-Greek Kingdom',
  color: '#10B981',
  type: 'state',
  description:
    'Greek kings south of the Hindu Kush, from Demetrius’ invasion (c. 180 BCE) to about 10 CE. Menander I (Milinda, c. 165–130), remembered in the Buddhist dialogue the Milindapanha, ruled from Sagala (Sialkot) and raided deep into the Ganges plain. More than 30 kings are known, almost only from their bilingual Greek–Prakrit coins. Indo-Scythians took Gandhara in the 1st century BCE, and the last Greek kings held on in the eastern Punjab.',
  keyYears: [-170, -150, -100, -50, 0, 10],
  overlays: [
    K(-170, 'After Demetrius', [BAC.gandhara]),
    K(-150, 'Menander I', [BAC.gandhara, BAC.punjab]),
    K(-100, 'Rival Greek kings', [BAC.gandhara, BAC.punjab]),
    K(-50, 'Gandhara lost to the Indo-Scythians', [BAC.punjab]),
    K(0, 'Last kings in the eastern Punjab', [BAC.punjab]),
    K(10, 'Strato II', [BAC.punjab]),
  ],
  timelineItemIds: ['indo-greek'],
  confidence: { level: 'conjectural', reason: 'Reconstructed almost entirely from coins and their find-spots; reigns and frontiers are best guesses.' },
  sources: [W('Indo-Greek Kingdom'), W('Menander I'), W('Milinda Panha')],
};

const ACH = {
  achaea: R('achaea', 'Achaea', P.ACHAEA),
  corinth: R('corinth', 'Corinth and Sicyon', P.CORINTHIA),
  argolid: R('argolid', 'Argos and the Argolid', P.ARGOLID),
  arcadia: R('arcadia', 'Arcadia (Megalopolis)', P.ARCADIA),
  megaris: R('megaris', 'Megara', P.MEGARIS),
  laconia: R('laconia', 'Sparta and Laconia', P.LACONIA),
  messenia: R('messenia', 'Messene', P.MESSENIA),
  elis: R('elis', 'Elis', P.ELIS),
};
const ACH_191 = [ACH.achaea, ACH.corinth, ACH.argolid, ACH.arcadia, ACH.megaris, ACH.laconia, ACH.messenia, ACH.elis];
const achaeanLeague = {
  id: 'achaean-league',
  name: 'Achaean League',
  color: '#0891B2',
  type: 'state',
  description:
    'A federation of the small towns of Achaea, refounded about 280 BCE, with a common army, coinage and assembly. Under Aratus of Sicyon it freed Corinth from Macedon (243) and drew in Argos and Megalopolis; under Philopoemen it absorbed Sparta (192), Messene and Elis, uniting the whole Peloponnese for the first time. Polybius, the historian of Rome’s rise, was one of its statesmen. It went to war with Rome in 146 BCE and lost: the consul Mummius sacked Corinth, killed or enslaved its people, and dissolved the league.',
  keyYears: [-280, -250, -243, -229, -224, -196, -191, -147],
  overlays: [
    K(-280, 'Achaean towns refound the league', [ACH.achaea]),
    K(-250, 'Aratus brings in Sicyon', [ACH.achaea, ACH.corinth]),
    K(-243, 'Acrocorinth freed from Macedon', [ACH.achaea, ACH.corinth, ACH.megaris]),
    K(-229, 'Argos and Megalopolis join', [ACH.achaea, ACH.corinth, ACH.megaris, ACH.argolid, ACH.arcadia]),
    K(-224, 'Corinth handed back to Macedon', [ACH.achaea, ACH.argolid, ACH.arcadia]),
    K(-196, 'Corinth back after Cynoscephalae', [ACH.achaea, ACH.corinth, ACH.argolid, ACH.arcadia, ACH.megaris]),
    K(-191, 'Sparta, Messene and Elis: the whole Peloponnese', ACH_191),
    K(-147, 'Before the war with Rome', ACH_191),
  ],
  timelineItemIds: ['classical-greece'],
  confidence: CONF.league,
  sources: [W('Achaean League'), W('Battle of Corinth (146 BC)'), W('Polybius')],
};

const AET = {
  aetolia: R('aetolia', 'Aetolia', P.AETOLIA),
  phocis: R('phocis-locris', 'Delphi, Phocis and Locris', P.PHOCIS_LOCRIS),
};
const aetolianLeague = {
  id: 'aetolian-league',
  name: 'Aetolian League',
  color: '#4D7C0F',
  type: 'state',
  description:
    'A federal state of the mountain districts of Aetolia that won fame by driving the Gauls back from Delphi in 279 BCE. It then controlled Delphi and its Amphictyony, Locris, Phocis and for a time western Acarnania, and was the main rival of Macedon and the Achaean League. It allied with Rome against Philip V (211), then invited Antiochus III into Greece; defeated, it became a dependent ally of Rome in 189 BCE.',
  keyYears: [-290, -260, -240, -200, -189, -167],
  overlays: [
    K(-290, 'Aetolian federation', [AET.aetolia]),
    K(-260, 'Masters of Delphi', [AET.aetolia, AET.phocis]),
    K(-240, 'Western Acarnania shared with Epirus', [AET.aetolia, AET.phocis]),
    K(-200, 'Allies of Rome', [AET.aetolia, AET.phocis]),
    K(-189, 'A dependent ally of Rome', [AET.aetolia]),
    K(-167, 'Purged by Rome after Pydna', [AET.aetolia]),
  ],
  timelineItemIds: ['classical-greece'],
  confidence: CONF.league,
  sources: [W('Aetolian League'), W('Brennus (3rd century BC)')],
};

/** Polities, in drawing order. Existing ids (classical-greece, achaemenid-empire, carthage, seleucid-empire) replace the old shapes. */
export const greekWorldPolities = [
  minoan, mycenaean, hittite, lydia, achaemenid, carthage, etruscans, romanRepublic,
  classicalGreece, athens, sparta, thebes, syracuse, epirus,
  argeadMacedon, alexander, ptolemaic, seleucid, antigonid, pergamon, grecoBactria, indoGreek,
  achaeanLeague, aetolianLeague,
];

// The Hellenes (people layer) ------------------------------------------------------------------
const H = {
  hellas: R('hellas', 'Greece', HELLAS),
  north: R('north', 'Epirus and Macedonia', NORTH_GREECE),
  cyprus: R('cyprus', 'Cyprus', P.CYPRUS),
  ionian: R('ionian-isles', 'Ionian islands', P.KEPHALLENIA),
  corcyra: R('corcyra', 'Corcyra (Corfu)', P.CORCYRA),
  asia: R('asia-coast', 'Aeolis, Ionia and Doris', ASIA_COAST),
  hellespont: R('hellespont', 'Hellespont and Propontis', P.HELLESPONT),
  thrace: R('thrace-coast', 'Thracian coast and Byzantion', P.THRACE_COAST),
  sicily: R('sicily', 'Greek Sicily', P.SICILY_E),
  sicilySE: R('sicily-se', 'Syracuse', P.SICILY_SE),
  bruttium: R('magna-graecia', 'Magna Graecia (Rhegion, Locri, Croton, Sybaris)', P.BRUTTIUM),
  taras: R('taras', 'Taras and Metapontion', P.GULF_OF_TARAS),
  naples: R('naples', 'Cumae and Neapolis', P.BAY_OF_NAPLES),
  cyrene: R('cyrene', 'Cyrene and the Pentapolis', P.CYRENAICA),
  massalia: R('massalia', 'Massalia and its colonies', P.MASSALIA_COAST),
  emporion: R('emporion', 'Emporion', P.EMPORION),
  pontW: R('pontic-west', 'West Pontic towns (Apollonia to Istros)', P.PONTIC_WEST),
  pontN: R('pontic-north', 'Olbia and Tyras', P.PONTIC_NORTH),
  bosporus: R('bosporus', 'Chersonesos and the Bosporan kingdom', P.BOSPORUS),
  pontS: R('pontic-south', 'Sinope, Amisos, Trapezous (Pontic Greeks)', P.PONTIC_SOUTH),
  alexandria: R('alexandria', 'Alexandria and the Delta Greeks', P.ALEXANDRIA_DELTA),
  seleucis: R('seleucis', 'Antioch and the Seleucis', P.SELEUCIS),
  anatolia: R('anatolia', 'Hellenised Anatolia', ANATOLIA_GREEK),
  cappadocia: R('cappadocia', 'Cappadocian Greeks', P.CAPPADOCIA_GREEK),
};
const HI = [ISL.euboea, ISL.crete, ISL.cyclades, ISL.rhodes, ISL.lesbos, ISL.chios, ISL.samos];
const HCORE = [H.hellas, H.north, ...HI, H.ionian, H.corcyra, H.cyprus];
const COLONIES = [H.thrace, H.sicily, H.sicilySE, H.bruttium, H.taras, H.naples, H.cyrene, H.massalia, H.emporion, H.pontW, H.pontN, H.bosporus, H.pontS];

export const hellenesPeople = {
  id: 'hellenes',
  name: 'Hellenes (Greek speakers)',
  color: '#60A5FA',
  type: 'people',
  description:
    'Greek is written from about 1400 BCE (Linear B) and still spoken today: the longest written record of any living European language. Bronze Age Greek speakers lived in the southern Balkans, Crete and the Aegean; after the collapse, Aeolians, Ionians and Dorians crossed to the coast of Asia Minor and Cyprus (c. 1050–900 BCE). Between about 750 and 550 BCE colonies carried Greek from Spain to the Crimea, and Alexander’s conquests made it the language of rule from Egypt to Bactria. Under Rome and Byzantium Greek became the everyday speech of most of Anatolia; Turkish settlement after 1071 and the population exchange of 1923 reduced it to Greece and Cyprus, plus communities worldwide that are not drawn here.',
  keyYears: [-1600, -1400, -1050, -750, -600, -300, 100, 300, 700, 1100, 1300, 1500, 1700, 1900, 1923, 2025],
  overlays: [
    K(-1600, 'Mycenaean Greek speakers', [H.hellas]),
    K(-1400, 'Linear B: Greek in Crete and the islands', [H.hellas, ISL.euboea, ISL.crete, ISL.cyclades, ISL.rhodes, H.ionian]),
    K(-1050, 'Migrations across the Aegean (Aeolians, Ionians, Dorians)', [...HCORE, H.asia]),
    K(-750, 'The first colonies', [...HCORE, H.asia, H.sicily, H.naples]),
    K(-600, 'Greek cities from Spain to the Crimea', [...HCORE, H.asia, H.hellespont, ...COLONIES]),
    K(-300, 'Hellenistic world: Greek as the language of power', [...HCORE, H.asia, H.hellespont, ...COLONIES, H.alexandria, H.seleucis]),
    K(100, 'The Greek East of the Roman Empire', [...HCORE, H.asia, H.hellespont, H.thrace, H.sicily, H.sicilySE, H.bruttium, H.taras, H.cyrene, H.pontW, H.bosporus, H.pontS, H.alexandria, H.seleucis]),
    K(300, 'Anatolia largely Greek-speaking', [...HCORE, H.asia, H.hellespont, H.thrace, H.sicily, H.sicilySE, H.bruttium, H.cyrene, H.bosporus, H.alexandria, H.seleucis, H.anatolia]),
    K(700, 'Byzantine Greek world after the Arab conquests', [...HCORE, H.asia, H.hellespont, H.thrace, H.sicily, H.sicilySE, H.bruttium, H.bosporus, H.anatolia]),
    K(1100, 'After Manzikert: Turkish settlement begins', [...HCORE, H.asia, H.hellespont, H.thrace, H.bruttium, H.bosporus, H.anatolia]),
    K(1300, 'Greek coasts and the Pontus', [...HCORE, H.asia, H.hellespont, H.thrace, H.bruttium, H.bosporus, H.pontS, H.cappadocia]),
    K(1500, 'Under Ottoman and Venetian rule', [...HCORE, H.asia, H.thrace, H.bosporus, H.pontS, H.cappadocia]),
    K(1700, 'Greek Orthodox communities of the Ottoman Empire', [...HCORE, H.asia, H.thrace, H.pontS, H.cappadocia]),
    K(1900, 'Before the population exchange', [...HCORE, H.asia, H.thrace, H.pontS, H.cappadocia]),
    K(1923, 'Population exchange: Greece and Cyprus', HCORE),
    K(2025, 'Greece and Cyprus today', HCORE),
  ],
  confidence: CONF.colonies,
  sources: [W('Greeks'), W('Greek colonisation'), W('Hellenistic period'), W('1923 population exchange between Greece and Turkey'), PLEIADES],
};

// Extra keyframes for existing entities --------------------------------------------------------
const ASSYRIA = R('assyria', 'Assyria and Babylonia', P.MESOPOTAMIA);
const ASSYRIA_SYRIA = R('syria', 'Syria', P.SYRIA);
const ASSYRIA_LEVANT = R('levant', 'Phoenicia, Israel and Judah', P.COELE_SYRIA);
const PARTHIA = R('parthia', 'Parthia', P.PARTHIA_PROPER);
const PARTHIA_EAST = R('parthia-aria', 'Parthia and the eastern satrapies', P.PARTHIA_ARIA);
const PARTHIA_MEDIA = R('media', 'Media and Persis', P.MEDIA_PERSIS);
const PARTHIA_BAB = R('babylonia', 'Babylonia', P.MESOPOTAMIA);
export const extraKeyframes = {
  mesopotamia: [
    K(-900, 'Neo-Assyrian revival', [ASSYRIA]),
    K(-700, 'Neo-Assyrian Empire at its height', [ASSYRIA, ASSYRIA_SYRIA, ASSYRIA_LEVANT]),
    K(-600, 'Neo-Babylonian Empire (Nebuchadnezzar II)', [ASSYRIA, ASSYRIA_SYRIA, ASSYRIA_LEVANT]),
    K(-560, 'The last Babylonian kings', [ASSYRIA, ASSYRIA_SYRIA, ASSYRIA_LEVANT]),
  ],
  'parthian-empire': [
    K(-238, 'Arsaces I takes Parthia', [PARTHIA]),
    K(-200, 'Arsacid kingdom', [PARTHIA]),
    K(-141, 'Mithridates I takes Media and Babylonia', [PARTHIA_EAST, PARTHIA_MEDIA, PARTHIA_BAB]),
    K(-100, 'Mithridates II', [PARTHIA_EAST, PARTHIA_MEDIA, PARTHIA_BAB]),
  ],
};
