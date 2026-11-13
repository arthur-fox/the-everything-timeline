/**
 * Day 85 — Phase 5 country pack 4, Central Africa: Cameroon (ROADMAP item 4, third country).
 *
 * Cameroon had no country timeline, and on the globe before the 1815 nations layer only the Day 58
 * Kanem–Bornu rings (which spilled south over the Mandara Mountains), the Bantu peoples bands and
 * the "Cameroon / Congo fringe" presence. Nothing showed Mandara, Bamum, Nso or the Duala of the
 * Wouri. This module draws Cameroon's states before 1815:
 *
 *   Kingdom of Mandara (Wandala) · Kingdom of Bamum · Kingdom of Nso · Duala of the Wouri
 *
 * From 1815 the nations layer takes over (Cameroon itself only from German Kamerun in 1884), so no
 * keyframe here is later than 1815. The Sao and Kotoko of the Logone, the Adamawa Emirate (whose
 * Cameroon lamidates were mostly founded after 1815), German Kamerun, the French and British
 * mandates, independence and the years since 1960 are timeline items with pins.
 *
 * How it is built (docs/DATA.md, "Country-pack globe backfill"):
 *  - Cameroon is cut into 4 pieces the pack's states use: Natural Earth 1:10m provinces (public
 *    domain; the ten regions) cut on straight lines into historical regions — Extrême-Nord at
 *    13.55–14.55°E and 10.72–11.50°N (the Mandara Mountains around Kerawa, Doulo and Mora, not
 *    Maroua or the Logone floodplain), Ouest at 10.52–11.40°E and 5.56–6.35°N (the Noun highlands
 *    of Foumban and Njimom, not Bafoussam), Nord-Ouest at 10.42–11.25°E and 6.05–6.70°N (Bui:
 *    Kovifem and Kumbo, not Bamenda or Kom), Littoral at 9.33–10.05°E and 3.70–4.35°N (the Wouri
 *    estuary around Douala, not Edéa) — clipped to the globe's own Cameroon land
 *    (src/data/nations.topo.json shape 244, the modern country including the Southern Cameroons)
 *    and simplified together as one coverage. The four pieces do not touch a neighbouring pack, so
 *    there is nothing to snap to. Generator: et-tools day85-pieces.py (outside the repo).
 *  - A polity is a dated list of pieces; every change is a one-year step.
 *  - Kanem–Bornu is not replaced (its centre is in Chad and Nigeria; the Chad pack can redraw it).
 *    Its 1390, 1500, 1600 and 1800 rings are trimmed off the Mandara Mountains so Mandara can be
 *    drawn as a neighbour, not an enclave (cameroonShapeFixes). The Logone floodplain, where the
 *    Kotoko city-states often paid tribute to Bornu, stays in the Bornu fill.
 *  - Pieces are regions, not surveyed borders. These states ruled through tribute, palaces and
 *    lineages, not fixed frontiers (see each polity's confidence reason).
 */

import { ensureClockwise } from './globe-morph.js';
import { mergeRings } from './globe-med-pieces.js';

const A = 'simplified';
const W = (title) => ({ title: `Wikipedia — ${title}`, url: `https://en.wikipedia.org/wiki/${encodeURI(title.replace(/ /g, '_')).replace(/'/g, '%27')}` });
const GHA = { title: 'UNESCO General History of Africa, vols. IV–V', url: 'https://www.unesco.org/en/general-history-africa' };
const BARKINDO = { title: 'Barkindo, The Sultanate of Mandara to 1902 (1989)', url: 'https://en.wikipedia.org/wiki/Mandara_Kingdom#Bibliography' };

// ---- Pieces ([lng, lat]) ---------------------------------------------------------------------------
export const CM_PIECES = {
  MANDARA: [[13.757, 11.02], [13.9815, 11.2756], [14.1433, 11.2327], [14.2792, 11.3018], [14.364, 11.3791], [14.55, 11.4743], [14.55, 10.72], [13.5953, 10.72], [13.7444, 10.9305], [13.757, 11.02]],
  BAMUM: [[11.1877, 6.2909], [11.2958, 6.2539], [11.2831, 6.1757], [11.3126, 6.0536], [11.2592, 5.9238], [11.2728, 5.7321], [11.2108, 5.6836], [11.2105, 5.56], [10.52, 5.56], [10.52, 5.8362], [10.6025, 5.8452], [10.6934, 6.0237], [10.8377, 6.0075], [10.9215, 6.0489], [10.9681, 6.0742], [10.9962, 6.1102], [11.0113, 6.2445], [11.0911, 6.2358], [11.1877, 6.2909]],
  NSO: [[10.9962, 6.1102], [10.9681, 6.0742], [10.9235, 6.05], [10.42, 6.05], [10.42, 6.7], [11.056, 6.7], [11.0606, 6.574], [11.097, 6.4493], [11.2023, 6.4362], [11.1877, 6.2909], [11.0911, 6.2358], [11.0113, 6.2445], [10.9962, 6.1102]],
  DUALA: [[9.596, 3.7574], [9.6211, 3.8748], [9.7445, 3.8196], [9.6771, 3.9067], [9.762, 3.957], [9.6195, 3.9597], [9.7189, 4.0996], [9.5773, 4.0134], [9.504, 4.0999], [9.5621, 4.1653], [9.5309, 4.2185], [9.4395, 4.2434], [9.4802, 4.35], [10.05, 4.35], [10.05, 3.7], [9.6147, 3.7], [9.596, 3.7574]],
};

const P = (names) => names.map((n) => {
  const r = CM_PIECES[n];
  if (!r) throw new Error(`cameroon pack: no piece ${n}`);
  return r;
});
export const CM_STEPS = {};
function build(meta, steps) {
  CM_STEPS[meta.id] = steps;
  const years = new Set();
  steps.forEach(([y], i) => {
    years.add(y);
    if (i > 0 && y - 1 > steps[i - 1][0]) years.add(y - 1);
  });
  const overlays = [...years].sort((x, y) => x - y).map((y) => {
    let s = steps[0];
    for (const st of steps) if (st[0] <= y) s = st;
    const regions = Object.entries(s[2]).map(([rid, [name, pieces]]) => {
      const ps = P(pieces);
      const ring = ps.length === 1 ? ensureClockwise(ps[0]) : ensureClockwise(mergeRings(`${meta.id} ${y} ${rid}`, ...ps));
      return { id: rid, name, ring };
    });
    return { year: y, label: s[1], approximation: A, regions };
  });
  return { edgeGrace: 1, keyYears: steps.map(([y]) => y), type: 'state', ...meta, overlays };
}
const conf = (level, reason) => ({ level, reason });

// ---- Kingdom of Mandara (Wandala) -----------------------------------------------------------------
const mandara = build({
  id: 'mandara', name: 'Kingdom of Mandara', color: '#C2410C',
  nameAt: [[1500, 'Kingdom of Mandara'], [1614, 'Mandara (under Bornu)'], [1715, 'Sultanate of Mandara'], [1781, 'Sultanate of Mandara']],
  description: 'The Wandala state of the Mandara Mountains, south of Lake Chad, whose people call themselves Wandala and whom the Kanuri called Mandara. Tradition places its founding shortly before 1500 (Soukda and Gaya); Fra Mauro noted “Mandera” in 1459 and Leo Africanus described Medra in 1526. The first capital was Kerawa; around 1580 the court moved to Doulo. Idris Alooma of Bornu installed King Nanda in 1614. Mai Bukar Aaji made it a sultanate around 1715 (Forkl: 1723/24). After defeating Bornu around 1781 it stood at its height (c. 1757–1813). Germany conquered it in 1902.',
  timelineItemIds: ['cm-mandara'],
  confidence: conf('conjectural', 'Rulers and wars are known from Ibn Furtu, Leo Africanus, Anania, Denham, the Wandala chronicle and Barkindo’s history, but the kingdom was a web of tribute, not a surveyed border. Drawn as the Mandara Mountains around Kerawa, Doulo and Mora, not Maroua or the Logone. Traditions of a 13th-century foundation are earlier than the first certain notices.'),
  sources: [W('Mandara Kingdom'), W('Mandara people'), BARKINDO, GHA],
}, [
  [1500, 'Wandala state in the Mandara Mountains', { mandara: ['Kingdom of Mandara', ['MANDARA']] }],
  [1580, 'Court moves to Doulo', { mandara: ['Kingdom of Mandara', ['MANDARA']] }],
  [1614, 'Idris Alooma installs King Nanda', { mandara: ['Mandara (under Bornu)', ['MANDARA']] }],
  [1715, 'Bukar Aaji makes Mandara a sultanate', { mandara: ['Sultanate of Mandara', ['MANDARA']] }],
  [1781, 'Mandara defeats Bornu; height of the sultanate', { mandara: ['Sultanate of Mandara', ['MANDARA']] }],
  [1815, 'Sultanate of Mandara', { mandara: ['Sultanate of Mandara', ['MANDARA']] }],
]);

// ---- Kingdom of Bamum -----------------------------------------------------------------------------
const bamum = build({
  id: 'bamum-kingdom', name: 'Kingdom of Bamum', color: '#7C3AED',
  nameAt: [[1394, 'Kingdom of Bamum'], [1418, 'Kingdom of Bamum (Foumban)']],
  description: 'A Grassfields kingdom in the Noun highlands, founded by Nchare Yen, a Tikar prince from Rifum (Bankim), who crossed the Mapé, proclaimed the state at Njimom and then made his capital at Foumban (Mfomben) after defeating the Pa M’ben. The year 1394 is the traditional date reconstructed by Sultan Ibrahim Njoya from royal genealogies; it is a convention, not a contemporary record. The kingdom kept its own mfon through the German and French years; Njoya (c. 1889–1933) invented the Bamum script. A traditional kingdom remains at Foumban today.',
  timelineItemIds: ['cm-bamum', 'cm-njoya'],
  confidence: conf('conjectural', 'The 1394 founding year is Njoya’s reconstructed chronology, not an eyewitness date. The outline is the Noun highlands around Foumban and Njimom (northern West Region), not a surveyed border, and not the Bamiléké plateau around Bafoussam.'),
  sources: [W('Kingdom of Bamum'), W('Nchare Yen'), W('Foumban'), W('Ibrahim Njoya'), GHA],
}, [
  [1394, 'Nchare Yen founds Bamum at Njimom', { bamum: ['Kingdom of Bamum', ['BAMUM']] }],
  [1418, 'Capital at Foumban (Mfomben)', { bamum: ['Kingdom of Bamum (Foumban)', ['BAMUM']] }],
  [1815, 'Kingdom of Bamum', { bamum: ['Kingdom of Bamum (Foumban)', ['BAMUM']] }],
]);

// ---- Kingdom of Nso -------------------------------------------------------------------------------
const nso = build({
  id: 'nso-kingdom', name: 'Kingdom of Nso', color: '#0F766E',
  nameAt: [[1400, 'Kingdom of Nso (Kovifem)']],
  description: 'The largest fondom of the Bamenda Grassfields, in today’s Bui division. Oral tradition makes Ngonnso’, sister of Nchare Yen of Bamum, the founder: after they parted on the Mapé she settled with the Visale (Mntar) at Kovifem, and the people took her name. The 1394 date sometimes given is the same reconstructed Bamum year and is not a contemporary record. Chamba raids around 1780 sacked Kovifem; the court later returned, and Fon Sehm I moved the capital to Kumbo (Kimbo) around 1820–25, after this pack’s 1815 hand-off. The fondom continues as a traditional kingdom.',
  timelineItemIds: ['cm-nso'],
  confidence: conf('conjectural', 'Origins are known only from Grassfields oral tradition (and the shared Bamum–Nso Tikar story). Drawn as Bui around Kovifem and Kumbo, not Bamenda or the Kom fondom at Fundong, and not a border. The capital is at Kovifem until the 1820s move to Kumbo, which falls after 1815.'),
  sources: [W('Nso people'), W('Kumbo'), W('Nchare Yen'), GHA],
}, [
  [1400, 'Ngonnso’ founds Nso at Kovifem', { nso: ['Kingdom of Nso (Kovifem)', ['NSO']] }],
  [1780, 'Chamba raids on Kovifem', { nso: ['Kingdom of Nso (Kovifem)', ['NSO']] }],
  [1815, 'Nso at Kovifem, before the move to Kumbo', { nso: ['Kingdom of Nso (Kovifem)', ['NSO']] }],
]);

// ---- Duala of the Wouri ---------------------------------------------------------------------------
const duala = build({
  id: 'duala', name: 'Duala', color: '#0369A1',
  nameAt: [[1600, 'Duala of the Wouri']],
  description: 'The Duala settlements on the Wouri estuary, around today’s Douala. Portuguese navigators reached the river in 1472 and named it Rio dos Camarões (“river of prawns”), but the people they met may not yet have been the Duala; most historians place the Duala move to the estuary around 1600, displacing Bakoko and Basaa inland. They were fishing and trading lineages — Bell (Bonanjo), Akwa (Bonambela) and later Deido and Bonaberi — whose heads Europeans called kings, not a single territorial state. They brokered ivory, then enslaved people, then palm oil, with the Dutch, British and others, and remained independent of Europe until the German treaty of 12 July 1884.',
  timelineItemIds: ['cm-duala', 'cm-name', 'cm-slave-trade'],
  confidence: conf('conjectural', 'The Duala were lineage towns on the Wouri, not a kingdom with borders. Drawn as the estuary around Douala, not the inland Sanaga at Edéa, and not the older Bakoko or Basaa settlements they displaced. The 1600 start follows the usual date for their arrival on the coast.'),
  sources: [W('Duala people'), W('Douala'), W('History of Cameroon'), GHA],
}, [
  [1600, 'Duala settle the Wouri estuary', { duala: ['Duala of the Wouri', ['DUALA']] }],
  [1650, 'Duala as Atlantic trading intermediaries', { duala: ['Duala of the Wouri', ['DUALA']] }],
  [1815, 'Duala of the Wouri', { duala: ['Duala of the Wouri', ['DUALA']] }],
]);

export const cameroonPolities = [mandara, bamum, nso, duala];

// Kanem–Bornu rings trimmed off the Mandara Mountains (the Logone floodplain stays in Bornu).
// 1390 and 1800 use the core; 1500 the wider Ngazargamu ring; 1600 Idris Alooma’s ring.
export const CM_TRIMS = {
  1390: [[10.6, 11.5], [11.0, 13.8], [13.5, 14.2], [14.5, 12.5], [14.58, 11.52], [14.36, 11.42], [14.14, 11.28], [13.97, 11.32], [13.74, 11.05], [13.57, 10.7], [12.0, 10.5], [10.6, 11.5]],
  1500: [[10.6, 11.2], [10.8, 14.0], [14.0, 15.5], [17.0, 15.5], [18.0, 13.5], [15.0, 11.5], [14.58, 11.52], [14.36, 11.42], [14.14, 11.28], [13.97, 11.32], [13.74, 11.05], [13.57, 10.7], [13.0, 10.3], [10.6, 11.2]],
  1600: [[10.4, 11.0], [10.6, 14.5], [13.0, 18.0], [16.0, 20.0], [18.5, 17.0], [19.0, 13.5], [16.0, 11.0], [14.58, 11.52], [14.36, 11.42], [14.14, 11.28], [13.97, 11.32], [13.74, 11.05], [13.57, 10.7], [13.0, 10.0], [10.4, 11.0]],
  1800: [[10.6, 11.5], [11.0, 13.8], [13.5, 14.2], [14.5, 12.5], [14.58, 11.52], [14.36, 11.42], [14.14, 11.28], [13.97, 11.32], [13.74, 11.05], [13.57, 10.7], [12.0, 10.5], [10.6, 11.5]]
};

export const cameroonShapeFixes = {
  'kanem-bornu': { trimBornuYears: [1390, 1500, 1600, 1800] },
};

/** Apply `cameroonShapeFixes` (throws if a target keyframe or the bornu region is missing). */
export function applyCameroonShapeFixes(entities) {
  const ent = entities.find((e) => e.id === 'kanem-bornu');
  if (!ent) throw new Error('cameroon fixes: no entity kanem-bornu');
  let n = 0;
  for (const kf of ent.overlays) {
    const ring = CM_TRIMS[kf.year];
    if (!ring) continue;
    const i = kf.regions.findIndex((r) => (typeof r === 'string' ? r : r.id) === 'bornu');
    if (i < 0) throw new Error(`cameroon fixes: kanem-bornu ${kf.year} has no bornu region`);
    const r = kf.regions[i];
    const name = typeof r === 'string' ? 'Bornu' : r.name;
    kf.regions[i] = { id: 'bornu', name, ring: ensureClockwise(ring) };
    n += 1;
  }
  if (n !== 4) throw new Error(`cameroon fixes: expected 4 Bornu keyframes, got ${n}`);
}
