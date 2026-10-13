/**
 * Day 56 — shared building blocks for the ancient Mediterranean and Near East on the globe
 * (the Greek world, 1600–146 BCE, and its neighbours).
 *
 * Instead of one hand-drawn blob per empire, the land is cut into small "pieces" (Attica,
 * Boeotia, Laconia, Ionia, Cilicia, Media, Latium …) whose shared borders are the *same* point
 * lists, so neighbouring pieces fit exactly and `mergeRings` can fuse any set of touching pieces
 * into one outline (Alexander's Asia, the Athenian empire's Ionian coast, Rome's Italy). A
 * polity is then a few stable blocks per keyframe: blocks that persist keep identical rings (the
 * globe does not re-sample them), and blocks that are gained or lost fade in or out.
 *
 * Lines follow coasts, rivers and mountain watersheds from standard historical atlases at roughly
 * 10–30 km; they are hand-drawn approximations, not surveyed borders (see each entity's
 * confidence). Points are [lng, lat].
 */

/** Join polylines into one closed ring (shared end points are not repeated). */
export function path(...parts) {
  const out = [];
  for (const part of parts) {
    for (const pt of part) {
      const last = out[out.length - 1];
      if (last && last[0] === pt[0] && last[1] === pt[1]) continue;
      out.push(pt);
    }
  }
  const f = out[0];
  const l = out[out.length - 1];
  if (f[0] !== l[0] || f[1] !== l[1]) out.push(f);
  return out;
}

/** A polyline walked the other way. */
export const rev = (line) => line.slice().reverse();

const key = (p) => `${p[0]},${p[1]}`;
const open = (ring) => {
  const o = ring.slice();
  const a = o[0];
  const b = o[o.length - 1];
  if (a[0] === b[0] && a[1] === b[1]) o.pop();
  return o;
};
function area(o) {
  let s = 0;
  for (let i = 0; i < o.length; i++) {
    const p = o[i];
    const q = o[(i + 1) % o.length];
    s += p[0] * q[1] - q[0] * p[1];
  }
  return s / 2;
}

/** How many outlines the last mergeRings call produced (1 = the pieces really touch). */
export const MERGE_STATS = { calls: 0, problems: [] };

/**
 * Union of pieces that share borders point-for-point: shared edges cancel and the outer outline
 * is walked once. Returns the largest outline (closed ring).
 * @param {string} label for MERGE_STATS when the pieces do not form one outline
 * @param {...[number, number][]} rings
 */
export function mergeRings(label, ...rings) {
  MERGE_STATS.calls += 1;
  const edges = new Map();
  for (const r of rings) {
    let o = open(r);
    if (area(o) > 0) o = o.reverse();
    for (let i = 0; i < o.length; i++) {
      const a = o[i];
      const b = o[(i + 1) % o.length];
      const k = `${key(a)}|${key(b)}`;
      const rk = `${key(b)}|${key(a)}`;
      if (edges.has(rk)) edges.delete(rk);
      else edges.set(k, [a, b]);
    }
  }
  const next = new Map();
  for (const [k, [a, b]] of edges) {
    const ka = key(a);
    if (!next.has(ka)) next.set(ka, []);
    next.get(ka).push([k, b]);
  }
  const used = new Set();
  const loops = [];
  for (const [k0, [a0]] of edges) {
    if (used.has(k0)) continue;
    const loop = [a0];
    let cur = a0;
    for (let guard = 0; guard < 100000; guard++) {
      const outs = next.get(key(cur)) || [];
      const hit = outs.find(([k]) => !used.has(k));
      if (!hit) break;
      used.add(hit[0]);
      if (key(hit[1]) === key(a0)) break;
      loop.push(hit[1]);
      cur = hit[1];
    }
    loops.push(loop);
  }
  loops.sort((x, y) => Math.abs(area(y)) - Math.abs(area(x)));
  if (loops.length !== 1) MERGE_STATS.problems.push(`${label}: ${loops.length} outlines`);
  const best = loops[0];
  return [...best, best[0]];
}

// ============================================================================================
// Greece and the southern Balkans
// ============================================================================================

// Coasts (walked anticlockwise round the peninsula from the Ambracian Gulf).
const COAST_ACARN = [[20.77, 38.93], [20.72, 38.8], [20.85, 38.6], [21.1, 38.35]];
const COAST_AETOL = [[21.1, 38.35], [21.45, 38.33], [21.8, 38.37]];
const COAST_LOCRIS_W = [[21.8, 38.37], [22.1, 38.36], [22.42, 38.43], [22.63, 38.38]];
const COAST_BOEO_W = [[22.63, 38.38], [22.85, 38.25], [23.1, 38.2], [23.23, 38.15]];
const COAST_MEGARIS_N = [[23.23, 38.15], [23.12, 38.05]];
const COAST_CORINTH_N = [[23.12, 38.05], [22.95, 38.03], [22.89, 37.93], [22.72, 38.02], [22.6, 38.07]];
const COAST_ACHAEA = [[22.6, 38.07], [22.08, 38.25], [21.73, 38.25], [21.35, 38.15]];
const COAST_ELIS = [[21.35, 38.15], [21.12, 37.9], [21.43, 37.65], [21.67, 37.28]];
const COAST_MESSENIA = [[21.67, 37.28], [21.66, 36.92], [21.7, 36.8], [21.96, 36.79], [21.95, 36.95], [22.11, 37.02], [22.23, 36.88]];
const COAST_LACONIA = [[22.23, 36.88], [22.38, 36.6], [22.48, 36.39], [22.57, 36.76], [22.75, 36.8], [23.06, 36.5], [23.2, 36.44], [23.06, 36.69], [22.86, 37.17]];
const COAST_ARGOLID = [[22.86, 37.17], [22.75, 37.45], [22.8, 37.57], [23.1, 37.35], [23.25, 37.38], [23.45, 37.5], [23.38, 37.6], [23.15, 37.63], [23.05, 37.75]];
const COAST_CORINTH_S = [[23.05, 37.75], [22.99, 37.88], [23.13, 37.93]];
const COAST_MEGARIS_S = [[23.13, 37.93], [23.34, 37.97], [23.45, 38.02]];
const COAST_ATTICA = [[23.45, 38.02], [23.54, 38.04], [23.63, 37.94], [23.78, 37.8], [24.03, 37.65], [24.05, 37.72], [24.0, 38.02], [24.0, 38.15], [23.75, 38.32]];
const COAST_BOEO_E = [[23.75, 38.32], [23.57, 38.45], [23.28, 38.57], [23.05, 38.68]];
const COAST_LOCRIS_E = [[23.05, 38.68], [22.75, 38.8], [22.55, 38.88]];
const COAST_THESSALY = [[22.55, 38.88], [22.8, 38.9], [22.85, 39.2], [22.95, 39.36], [23.05, 39.25], [23.2, 39.12], [23.3, 39.25], [23.15, 39.5], [22.85, 39.8], [22.68, 39.9]];
const COAST_MACEDON = [[22.68, 39.9], [22.57, 40.05], [22.55, 40.2], [22.6, 40.47], [22.75, 40.6], [22.95, 40.63]];
const COAST_CHALC = [[22.95, 40.63], [22.95, 40.45], [23.3, 40.2], [23.4, 39.95], [23.55, 40.15], [23.8, 40.2], [23.9, 39.95], [24.0, 40.15], [24.4, 40.15], [24.0, 40.4], [23.85, 40.75]];
const COAST_THRACE = [[23.85, 40.75], [24.4, 40.92], [24.98, 40.93], [25.5, 40.85], [26.05, 40.7], [26.2, 40.05], [26.7, 40.42], [27.3, 40.7], [27.95, 40.97], [28.98, 41.01], [29.1, 41.22]];
const COAST_BLACKSEA_W = [[29.1, 41.22], [28.1, 41.6], [27.98, 41.88], [27.7, 42.42], [27.47, 42.5], [27.73, 42.66], [27.92, 43.2], [28.47, 43.36], [28.58, 43.81], [28.65, 44.17], [28.9, 44.6]];
const COAST_EPIRUS = [[20.75, 38.96], [20.4, 39.28], [20.27, 39.5], [20.02, 39.75], [19.75, 40.1], [19.45, 40.45]];
const COAST_ILLYRIA = [[19.45, 40.45], [19.4, 40.9], [19.45, 41.3], [19.5, 41.8], [18.5, 42.45], [17.6, 42.95]];
const GULF_AMBR_N = [[21.15, 39.02], [21.0, 39.05], [20.75, 38.96]];
const GULF_AMBR_S = [[21.15, 39.02], [21.0, 38.95], [20.77, 38.93]];

// Land borders between pieces.
const B_ACARN_AETOL = [[21.1, 38.35], [21.15, 38.7], [21.15, 39.02]];
const B_AETOL_LOCRIS = [[21.8, 38.37], [21.9, 38.85]];
const B_AETOL_THESS = [[21.9, 38.85], [21.6, 39.0], [21.15, 39.02]];
const B_LOCRIS_THESS = [[21.9, 38.85], [22.2, 38.95], [22.55, 38.88]];
const B_LOCRIS_BOEO = [[23.05, 38.68], [22.85, 38.5], [22.63, 38.38]];
const B_BOEO_ATTICA = [[23.23, 38.15], [23.45, 38.2], [23.65, 38.25], [23.75, 38.32]];
const B_MEGARIS_ATTICA = [[23.23, 38.15], [23.42, 38.1], [23.45, 38.02]];
const B_MEGARIS_CORINTH = [[23.12, 38.05], [23.13, 37.93]];
const B_CORINTH_ARGOLID = [[23.05, 37.75], [22.85, 37.8], [22.6, 37.85]];
const B_CORINTH_ACHAEA = [[22.6, 37.85], [22.6, 38.07]];
const B_ACHAEA_ARCADIA = [[22.6, 37.85], [22.2, 37.9], [21.8, 37.95]];
const B_ACHAEA_ELIS = [[21.8, 37.95], [21.35, 38.15]];
const B_ELIS_ARCADIA = [[21.8, 37.95], [21.85, 37.45]];
const B_ELIS_MESSENIA = [[21.85, 37.45], [21.67, 37.28]];
const B_MESSENIA_ARCADIA = [[21.85, 37.45], [22.05, 37.35], [22.3, 37.25]];
const B_MESSENIA_LACONIA = [[22.3, 37.25], [22.35, 37.05], [22.23, 36.88]];
const B_LACONIA_ARCADIA = [[22.3, 37.25], [22.45, 37.4], [22.7, 37.42]];
const B_LACONIA_ARGOLID = [[22.7, 37.42], [22.86, 37.17]];
const B_ARGOLID_ARCADIA = [[22.7, 37.42], [22.55, 37.65], [22.6, 37.85]];
const B_THESS_MACEDON = [[22.68, 39.9], [22.4, 40.0], [21.5, 39.95]];
const B_THESS_EPIRUS = [[21.5, 39.95], [21.3, 39.6], [21.15, 39.02]];
const B_EPIRUS_ILLYRIA = [[19.45, 40.45], [20.2, 40.45], [20.85, 40.4]];
const B_EPIRUS_MACEDON = [[20.85, 40.4], [21.15, 40.15], [21.5, 39.95]];
const B_MACEDON_ILLYRIA = [[20.85, 40.4], [20.85, 40.75]];
const B_MACEDON_NORTH = [[20.85, 40.75], [21.2, 41.15], [22.0, 41.35], [22.8, 41.25], [23.05, 40.85]];
const B_MACEDON_CHALC = [[23.05, 40.85], [22.95, 40.63]];
const B_CHALC_THRACE = [[23.85, 40.75], [23.4, 40.85], [23.05, 40.85]];
const B_THRACE_W = [[23.05, 40.85], [23.4, 41.2]];
const B_THRACE_INLAND = [[29.1, 41.22], [28.7, 41.15], [27.8, 41.25], [27.0, 41.1], [26.3, 41.1], [25.5, 41.2], [24.9, 41.2], [24.2, 41.15], [23.4, 41.2]];
const THRACE_N = [[28.9, 44.6], [28.0, 44.15], [26.5, 43.8], [25.0, 43.65], [23.0, 43.9], [22.6, 43.4], [22.9, 42.3], [23.1, 41.6], [23.4, 41.2]];
const B_ILLYRIA_INLAND = [[17.6, 42.95], [18.6, 43.1], [20.0, 42.3], [20.5, 41.6], [20.85, 40.75]];

export const ACARNANIA = path(COAST_ACARN, B_ACARN_AETOL, GULF_AMBR_S);
export const AETOLIA = path(COAST_AETOL, B_AETOL_LOCRIS, B_AETOL_THESS, rev(B_ACARN_AETOL));
export const PHOCIS_LOCRIS = path(COAST_LOCRIS_W, rev(B_LOCRIS_BOEO), COAST_LOCRIS_E, rev(B_LOCRIS_THESS), rev(B_AETOL_LOCRIS));
export const BOEOTIA = path(COAST_BOEO_W, B_BOEO_ATTICA, COAST_BOEO_E, B_LOCRIS_BOEO);
export const ATTICA = path(COAST_ATTICA, rev(B_BOEO_ATTICA), B_MEGARIS_ATTICA);
export const MEGARIS = path(COAST_MEGARIS_N, B_MEGARIS_CORINTH, COAST_MEGARIS_S, rev(B_MEGARIS_ATTICA));
export const CORINTHIA = path(COAST_CORINTH_N, rev(B_CORINTH_ACHAEA), rev(B_CORINTH_ARGOLID), COAST_CORINTH_S, rev(B_MEGARIS_CORINTH));
export const ACHAEA = path(COAST_ACHAEA, rev(B_ACHAEA_ELIS), rev(B_ACHAEA_ARCADIA), B_CORINTH_ACHAEA);
export const ELIS = path(COAST_ELIS, rev(B_ELIS_MESSENIA), rev(B_ELIS_ARCADIA), B_ACHAEA_ELIS);
export const MESSENIA = path(COAST_MESSENIA, rev(B_MESSENIA_LACONIA), rev(B_MESSENIA_ARCADIA), B_ELIS_MESSENIA);
export const LACONIA = path(COAST_LACONIA, rev(B_LACONIA_ARGOLID), rev(B_LACONIA_ARCADIA), B_MESSENIA_LACONIA);
export const ARGOLID = path(COAST_ARGOLID, B_CORINTH_ARGOLID, rev(B_ARGOLID_ARCADIA), B_LACONIA_ARGOLID);
export const ARCADIA = path(B_ACHAEA_ARCADIA, B_ELIS_ARCADIA, B_MESSENIA_ARCADIA, B_LACONIA_ARCADIA, B_ARGOLID_ARCADIA);
export const THESSALY = path(COAST_THESSALY, B_THESS_MACEDON, B_THESS_EPIRUS, rev(B_AETOL_THESS), B_LOCRIS_THESS);
export const EPIRUS = path(COAST_EPIRUS, B_EPIRUS_ILLYRIA, B_EPIRUS_MACEDON, B_THESS_EPIRUS, GULF_AMBR_N);
export const MACEDON = path(COAST_MACEDON, rev(B_MACEDON_CHALC), rev(B_MACEDON_NORTH), rev(B_MACEDON_ILLYRIA), B_EPIRUS_MACEDON, rev(B_THESS_MACEDON));
export const CHALCIDICE = path(COAST_CHALC, B_CHALC_THRACE, B_MACEDON_CHALC);
export const THRACE_COAST = path(COAST_THRACE, B_THRACE_INLAND, rev(B_THRACE_W), rev(B_CHALC_THRACE));
export const THRACE = path(COAST_BLACKSEA_W, THRACE_N, rev(B_THRACE_INLAND));
export const ILLYRIA = path(COAST_ILLYRIA, B_ILLYRIA_INLAND, rev(B_MACEDON_ILLYRIA), rev(B_EPIRUS_ILLYRIA));

// Islands.
export const EUBOEA = [[22.85, 38.83], [23.05, 38.98], [23.3, 39.05], [23.65, 38.75], [24.2, 38.55], [24.6, 38.15], [24.58, 37.98], [24.3, 38.0], [23.95, 38.25], [23.62, 38.45], [23.6, 38.6], [23.32, 38.77], [23.05, 38.86], [22.85, 38.83]];
export const CYCLADES = [[24.3, 37.65], [24.75, 38.0], [25.0, 37.9], [25.4, 37.5], [26.0, 36.9], [25.6, 36.3], [25.3, 36.3], [24.3, 36.6], [24.3, 37.65]];
export const CRETE = [[23.52, 35.3], [23.6, 35.6], [24.1, 35.58], [24.3, 35.38], [25.0, 35.42], [25.6, 35.3], [25.75, 35.27], [26.0, 35.32], [26.32, 35.28], [26.25, 35.0], [25.73, 34.98], [24.8, 34.92], [24.3, 35.15], [23.55, 35.22], [23.52, 35.3]];
export const LESBOS = [[25.85, 39.2], [26.2, 39.4], [26.6, 39.3], [26.6, 39.0], [26.1, 39.05], [25.85, 39.2]];
export const CHIOS = [[25.85, 38.5], [26.1, 38.6], [26.15, 38.3], [26.0, 38.15], [25.85, 38.5]];
export const SAMOS = [[26.55, 37.75], [26.75, 37.82], [27.05, 37.72], [26.95, 37.63], [26.55, 37.75]];
export const RHODES = [[27.68, 36.15], [27.95, 36.45], [28.25, 36.45], [28.2, 36.1], [27.75, 35.88], [27.68, 36.15]];
export const CORCYRA = [[19.65, 39.75], [19.93, 39.8], [20.08, 39.45], [19.85, 39.4], [19.65, 39.75]];
export const KEPHALLENIA = [[20.35, 38.3], [20.6, 38.55], [20.75, 38.4], [20.95, 37.75], [20.65, 37.7], [20.35, 38.3]];
export const CYPRUS = [[32.3, 34.75], [32.4, 35.05], [32.9, 35.2], [33.6, 35.35], [34.6, 35.7], [34.0, 35.05], [33.95, 34.95], [33.0, 34.6], [32.3, 34.75]];

// ============================================================================================
// Anatolia
// ============================================================================================
const COAST_PROPONTIS_AS = [[29.15, 41.2], [29.03, 40.99], [29.2, 40.65], [28.88, 40.38], [28.5, 40.4], [27.88, 40.38], [27.3, 40.45], [26.69, 40.35], [26.4, 40.2], [26.15, 39.95], [26.1, 39.5], [26.9, 39.6]];
const COAST_IONIA = [[26.9, 39.6], [26.6, 39.3], [26.8, 38.95], [26.75, 38.67], [26.3, 38.65], [26.25, 38.3], [26.6, 38.1], [27.1, 37.95], [27.2, 37.7], [27.25, 37.42]];
const COAST_CARIA = [[27.25, 37.42], [27.43, 37.02], [27.6, 37.0], [27.35, 36.68], [28.1, 36.75], [28.6, 36.78]];
const COAST_LYCIA = [[28.6, 36.78], [29.1, 36.62], [29.3, 36.27], [29.64, 36.2], [30.15, 36.3], [30.55, 36.52], [30.7, 36.88], [31.4, 36.77], [32.0, 36.55]];
const COAST_CILICIA = [[32.0, 36.55], [32.83, 36.02], [33.93, 36.37], [34.63, 36.8], [34.9, 36.85], [35.6, 36.6], [36.2, 36.9], [36.17, 36.58]];
const COAST_PONTUS_W = [[29.15, 41.2], [30.5, 41.2], [31.42, 41.3], [32.4, 41.75], [33.4, 42.0], [35.15, 42.05], [35.6, 41.7]];
const COAST_PONTUS_E = [[35.6, 41.7], [36.33, 41.32], [37.5, 41.05], [38.5, 40.95], [39.72, 41.0], [41.0, 41.2], [41.6, 41.6]];
const B_IONIA_HELL = [[27.6, 39.6], [26.9, 39.6]];
const B_HELL_IN = [[27.6, 39.6], [28.5, 40.1], [29.5, 40.4]];
const B_HELL_BITH = [[29.5, 40.4], [29.55, 40.95], [29.15, 41.2]];
const B_IONIA_CARIA = [[27.25, 37.42], [27.7, 37.45]];
const B_IONIA_IN = [[27.7, 37.45], [27.8, 37.9], [27.6, 38.5], [27.5, 39.1], [27.6, 39.6]];
const B_CARIA_IN = [[29.0, 37.0], [28.6, 37.4], [28.2, 37.5], [27.7, 37.45]];
const B_CARIA_LYCIA = [[28.6, 36.78], [29.0, 37.0]];
const B_LYCIA_IN = [[32.3, 36.9], [31.5, 37.15], [30.7, 37.2], [29.8, 37.05], [29.0, 37.0]];
const B_LYCIA_CILICIA = [[32.0, 36.55], [32.3, 36.9]];
const B_CILICIA_CAPP = [[36.6, 36.8], [36.5, 37.3], [35.0, 37.45]];
const B_CILICIA_PHRYG = [[35.0, 37.45], [33.5, 37.05], [32.3, 36.9]];
const B_SYRIA_CILICIA = [[36.17, 36.58], [36.6, 36.8]];
const S1 = [[29.5, 40.4], [30.5, 40.05], [32.0, 39.85], [33.5, 39.4], [34.2, 39.0]];
const S2 = [[34.2, 39.0], [34.3, 38.2], [35.0, 37.45]];
const S3 = [[35.6, 41.7], [34.8, 41.0], [34.6, 40.0], [34.2, 39.0]];
const E_ARM = [[41.6, 41.6], [42.5, 40.5], [43.5, 39.5], [42.5, 38.0]];
const E_MESO_N1 = [[42.5, 38.0], [40.5, 37.2], [38.5, 36.9], [38.0, 36.9]];
const E_SYR_N = [[38.0, 36.9], [36.6, 36.8]];

export const HELLESPONT = path(COAST_PROPONTIS_AS, rev(B_IONIA_HELL), B_HELL_IN, B_HELL_BITH);
export const IONIA = path(COAST_IONIA, B_IONIA_CARIA, B_IONIA_IN, B_IONIA_HELL);
export const CARIA = path(COAST_CARIA, B_CARIA_LYCIA, B_CARIA_IN, rev(B_IONIA_CARIA));
export const LYCIA = path(COAST_LYCIA, B_LYCIA_CILICIA, B_LYCIA_IN, rev(B_CARIA_LYCIA));
export const CILICIA = path(COAST_CILICIA, B_SYRIA_CILICIA, B_CILICIA_CAPP, B_CILICIA_PHRYG, rev(B_LYCIA_CILICIA));
export const BITHYNIA = path(COAST_PONTUS_W, S3, rev(S1), B_HELL_BITH);
export const PHRYGIA = path(S1, S2, B_CILICIA_PHRYG, B_LYCIA_IN, B_CARIA_IN, B_IONIA_IN, B_HELL_IN);
export const CAPPADOCIA = path(COAST_PONTUS_E, E_ARM, E_MESO_N1, E_SYR_N, B_CILICIA_CAPP, rev(S2), rev(S3));

// ============================================================================================
// The Levant, Mesopotamia, Egypt, Iran, Central Asia, the Indus
// ============================================================================================
const COAST_SYRIA_N = [[35.97, 34.65], [35.78, 35.52], [35.95, 36.0], [36.17, 36.58]];
const B_SYRIA_MESO = [[38.0, 36.9], [38.4, 36.0], [38.6, 35.0], [38.5, 33.0]];
const B_SYRIA_DES2 = [[38.5, 33.0], [37.5, 32.0]];
const B_SYRIA_COELE = [[37.5, 32.0], [37.3, 33.3], [36.6, 34.2], [35.97, 34.65]];
const COAST_LEVANT_S = [[34.2, 31.3], [34.45, 31.5], [34.75, 32.05], [34.98, 32.82], [35.2, 33.27], [35.5, 33.9], [35.84, 34.44], [35.97, 34.65]];
const B_COELE_DESERT = [[37.5, 32.0], [37.0, 31.0], [34.95, 29.55]];
const B_EGYPT_COELE = [[34.95, 29.55], [34.2, 31.3]];
const B_ARM_MESO = [[42.5, 38.0], [44.0, 37.1]];
const B_MESO_IRAN = [[44.0, 37.1], [45.5, 35.5], [46.2, 33.5], [47.8, 31.5], [48.3, 30.2]];
const B_MESO_SOUTH = [[48.3, 30.2], [47.8, 29.9], [46.5, 30.5], [44.5, 31.5], [42.5, 33.0], [40.5, 34.2], [38.5, 33.0]];
const EGYPT_BODY = [[34.95, 29.55], [34.6, 28.6], [34.25, 27.75], [33.5, 28.4], [32.55, 29.95], [31.6, 29.0], [31.4, 27.5], [32.9, 26.2], [33.1, 25.0], [33.1, 24.0], [32.7, 24.0], [32.4, 25.0], [32.0, 25.9], [30.6, 27.4], [30.55, 28.9], [30.3, 29.5], [29.6, 29.9], [29.0, 30.9], [29.9, 31.2], [30.4, 31.47], [31.0, 31.6], [31.8, 31.52], [32.57, 31.1], [33.5, 31.15], [34.2, 31.3]];
const ARM_N = [[41.6, 41.6], [43.5, 41.3], [45.5, 41.0], [46.5, 39.8], [47.0, 38.8]];
const B_ARM_IRAN = [[47.0, 38.8], [45.5, 37.6], [44.0, 37.1]];
const COAST_CASPIAN_S = [[47.0, 38.8], [48.87, 38.4], [49.0, 37.6], [49.6, 37.45], [50.5, 36.9], [52.0, 36.65], [54.0, 36.85]];
const B_MEDIA_PARTHIA = [[54.0, 36.85], [53.5, 35.0], [54.5, 32.0], [55.5, 29.0], [56.3, 27.15]];
const COAST_GULF = [[56.3, 27.15], [54.5, 26.6], [52.5, 27.4], [50.8, 28.95], [50.1, 30.0], [48.9, 30.4], [48.3, 30.2]];
const PARTHIA_N = [[54.0, 36.85], [56.0, 37.6], [58.5, 37.7]];
const B_PARTHIA_BACTRIA = [[58.5, 37.7], [61.0, 36.6], [62.5, 35.6]];
const B_PARTHIA_ARACH = [[62.5, 35.6], [62.5, 33.0], [61.8, 30.5], [60.5, 28.5], [59.0, 25.45]];
const COAST_CARMANIA = [[59.0, 25.45], [57.8, 25.65], [57.0, 26.8], [56.3, 27.15]];
const B_BACTRIA_ARACH = [[62.5, 35.6], [64.5, 35.0]];
const B_ARACH_GANDH = [[64.5, 35.0], [66.5, 32.5], [67.5, 29.5], [67.2, 25.2], [67.0, 24.85]];
const COAST_GEDROSIA = [[67.0, 24.85], [64.5, 25.2], [62.3, 25.12], [60.6, 25.3], [59.0, 25.45]];
const BACTRIA_N = [[58.5, 37.7], [60.0, 39.0], [62.0, 40.0], [64.5, 40.6], [66.5, 41.0], [69.0, 41.2], [70.8, 40.6], [71.5, 39.0], [71.5, 37.0], [70.5, 35.8]];
const B_BACTRIA_GANDH = [[70.5, 35.8], [68.5, 35.2], [66.5, 34.8], [64.5, 35.0]];
const GANDH_E1 = [[70.5, 35.8], [72.0, 35.5], [73.2, 34.0]];
const B_GANDH_PUNJAB = [[73.2, 34.0], [72.5, 32.5], [71.2, 30.5]];
const GANDH_E2 = [[71.2, 30.5], [70.3, 28.0], [69.5, 26.0], [68.6, 24.1], [67.6, 24.3], [67.0, 24.85]];

export const SYRIA = path(COAST_SYRIA_N, B_SYRIA_CILICIA, rev(E_SYR_N), B_SYRIA_MESO, B_SYRIA_DES2, B_SYRIA_COELE);
export const COELE_SYRIA = path(COAST_LEVANT_S, rev(B_SYRIA_COELE), B_COELE_DESERT, B_EGYPT_COELE);
export const MESOPOTAMIA = path(E_MESO_N1, B_SYRIA_MESO, rev(B_MESO_SOUTH), rev(B_MESO_IRAN), rev(B_ARM_MESO));
export const EGYPT = path(EGYPT_BODY, rev(B_EGYPT_COELE));
export const ARMENIA = path(ARM_N, B_ARM_IRAN, rev(B_ARM_MESO), rev(E_ARM));
export const MEDIA_PERSIS = path(rev(B_ARM_IRAN), COAST_CASPIAN_S, B_MEDIA_PARTHIA, COAST_GULF, rev(B_MESO_IRAN));
export const PARTHIA_ARIA = path(PARTHIA_N, B_PARTHIA_BACTRIA, B_PARTHIA_ARACH, COAST_CARMANIA, rev(B_MEDIA_PARTHIA));
export const ARACHOSIA = path(B_BACTRIA_ARACH, B_ARACH_GANDH, COAST_GEDROSIA, rev(B_PARTHIA_ARACH));
export const BACTRIA = path(BACTRIA_N, B_BACTRIA_GANDH, rev(B_BACTRIA_ARACH), rev(B_PARTHIA_BACTRIA));
export const GANDHARA = path(GANDH_E1, B_GANDH_PUNJAB, GANDH_E2, rev(B_ARACH_GANDH), rev(B_BACTRIA_GANDH));
export const PUNJAB = path([[73.2, 34.0], [74.5, 33.0], [75.6, 31.6], [74.6, 30.3], [72.6, 29.6], [71.2, 30.5]], rev(B_GANDH_PUNJAB));
/** Parthia proper (Parthava / Astauene): the first Arsacid kingdom. */
export const PARTHIA_PROPER = [[54.0, 36.85], [56.0, 37.6], [58.5, 37.7], [59.5, 36.8], [58.0, 35.8], [55.5, 35.8], [54.0, 36.85]];

// ============================================================================================
// Italy, Sicily and the islands
// ============================================================================================
const COAST_ETRURIA = [[10.3, 43.68], [10.5, 42.93], [11.2, 42.45], [11.8, 42.1], [12.29, 41.73]];
const COAST_LATIUM = [[12.29, 41.73], [12.63, 41.45], [13.08, 41.23], [13.75, 41.24]];
const COAST_CAMPANIA = [[13.75, 41.24], [13.95, 41.02], [14.05, 40.85], [14.25, 40.84], [14.33, 40.6], [14.77, 40.68], [14.95, 40.48]];
const COAST_LUCANIA_W = [[14.95, 40.48], [15.0, 40.42], [15.15, 40.16], [15.5, 40.05], [15.8, 39.82]];
const COAST_BRUTTIUM = [[15.8, 39.82], [16.07, 39.13], [16.1, 38.7], [15.85, 38.68], [15.72, 38.25], [15.65, 38.11], [16.06, 37.92], [16.25, 38.24], [16.55, 38.69], [17.13, 39.08], [17.15, 39.38], [16.6, 39.68]];
const COAST_LUCANIA_E = [[16.6, 39.68], [16.82, 40.38], [16.85, 40.42]];
const COAST_APULIA = [[16.85, 40.42], [17.24, 40.47], [17.99, 40.05], [18.36, 39.8], [18.49, 40.15], [17.95, 40.64], [16.87, 41.13], [16.28, 41.32], [15.92, 41.63], [16.18, 41.9], [15.3, 41.92]];
const COAST_SAMNIUM = [[15.3, 41.92], [14.99, 42.0], [14.21, 42.46]];
const COAST_PICENUM = [[14.21, 42.46], [13.5, 43.62], [12.57, 44.06], [12.4, 44.2]];
const COAST_CISALPINE = [[12.4, 44.2], [12.2, 44.42], [12.5, 44.95], [12.33, 45.44], [13.37, 45.77], [13.77, 45.65]];
const ALPS_E = [[13.77, 45.65], [13.5, 46.5], [12.0, 46.7], [10.5, 46.5], [9.0, 46.3], [7.0, 45.9]];
const ALPS_W = [[7.0, 45.9], [6.8, 45.1], [7.0, 44.2], [7.6, 43.79]];
const COAST_LIGURIA = [[7.6, 43.79], [8.93, 44.41], [9.83, 44.1], [10.3, 43.68]];
const B_ETR_LAT = [[12.29, 41.73], [12.5, 42.15]];
const B_ETR_SAB = [[12.5, 42.15], [12.6, 42.6]];
const B_ETR_UMB = [[12.6, 42.6], [12.3, 43.1], [12.0, 43.5], [11.3, 43.95]];
const B_ETR_CIS = [[11.3, 43.95], [10.3, 43.68]];
const B_LAT_SAM = [[12.5, 42.15], [12.9, 42.15], [13.4, 41.95], [13.75, 41.6]];
const B_LAT_CAMP = [[13.75, 41.6], [13.75, 41.24]];
const B_CAMP_SAM = [[13.75, 41.6], [14.4, 41.35], [14.7, 41.1], [15.1, 40.75]];
const B_CAMP_LUC = [[15.1, 40.75], [14.95, 40.48]];
const B_SAM_LUC = [[15.1, 40.75], [15.6, 40.9]];
const B_SAM_APUL = [[15.6, 40.9], [15.3, 41.92]];
const B_LUC_APUL = [[15.6, 40.9], [16.2, 40.6], [16.85, 40.42]];
const B_SAM_UMB = [[14.21, 42.46], [13.4, 42.9], [12.9, 42.9], [12.6, 42.6]];
const B_UMB_CIS = [[12.4, 44.2], [11.9, 43.95], [11.3, 43.95]];
const B_LUC_BRUT = [[15.8, 39.82], [16.3, 39.7], [16.6, 39.68]];

export const ETRURIA = path(COAST_ETRURIA, B_ETR_LAT, B_ETR_SAB, B_ETR_UMB, B_ETR_CIS);
export const LATIUM = path(COAST_LATIUM, rev(B_LAT_CAMP), rev(B_LAT_SAM), rev(B_ETR_LAT));
export const CAMPANIA = path(COAST_CAMPANIA, rev(B_CAMP_LUC), rev(B_CAMP_SAM), B_LAT_CAMP);
export const SAMNIUM = path(B_LAT_SAM, B_CAMP_SAM, B_SAM_LUC, B_SAM_APUL, COAST_SAMNIUM, B_SAM_UMB, rev(B_ETR_SAB));
export const UMBRIA = path(COAST_PICENUM, B_UMB_CIS, rev(B_ETR_UMB), rev(B_SAM_UMB));
export const LUCANIA = path(COAST_LUCANIA_W, B_LUC_BRUT, COAST_LUCANIA_E, rev(B_LUC_APUL), rev(B_SAM_LUC), B_CAMP_LUC);
export const BRUTTIUM = path(COAST_BRUTTIUM, rev(B_LUC_BRUT));
export const APULIA = path(COAST_APULIA, rev(B_SAM_APUL), B_LUC_APUL);
export const CISALPINE = path(COAST_CISALPINE, ALPS_E, ALPS_W, COAST_LIGURIA, rev(B_ETR_CIS), rev(B_UMB_CIS));

const S_COAST_W_N = [[12.43, 37.8], [12.5, 38.02], [12.9, 38.08], [13.36, 38.12], [13.75, 38.0]];
const S_COAST_N_E = [[13.75, 38.0], [14.02, 38.04], [14.7, 38.1], [15.55, 38.28], [15.29, 37.85]];
const S_COAST_SE = [[15.29, 37.85], [15.09, 37.5], [15.29, 37.07], [15.13, 36.68], [14.8, 36.7], [14.45, 36.88]];
const S_COAST_S = [[14.45, 36.88], [14.25, 37.07], [13.58, 37.29], [13.3, 37.4]];
const S_COAST_W_S = [[13.3, 37.4], [13.08, 37.5], [12.59, 37.65], [12.43, 37.8]];
const SB_W = [[13.75, 38.0], [13.5, 37.75], [13.3, 37.4]];
const SB_SE = [[14.45, 36.88], [14.5, 37.35], [14.9, 37.75], [15.29, 37.85]];
/** Western Sicily west of the Halycus (the Punic epikrateia). */
export const SICILY_W = path(S_COAST_W_N, SB_W, S_COAST_W_S);
/** South-east Sicily: Syracuse and its hinterland (Hiero II's kingdom after 263 BCE). */
export const SICILY_SE = path(S_COAST_SE, SB_SE);
export const SICILY_E = path(S_COAST_N_E, rev(SB_SE), S_COAST_S, rev(SB_W));

export const SARDINIA = [[8.2, 40.9], [8.4, 41.2], [9.2, 41.25], [9.6, 40.9], [9.75, 40.1], [9.6, 39.1], [9.0, 39.1], [8.4, 38.9], [8.4, 39.6], [8.4, 40.4], [8.2, 40.9]];
export const CORSICA = [[8.6, 41.4], [8.55, 42.0], [8.6, 42.6], [9.35, 43.0], [9.55, 42.6], [9.4, 41.4], [9.1, 41.37], [8.6, 41.4]];
export const IBIZA = [[1.2, 38.9], [1.45, 39.1], [1.6, 38.95], [1.4, 38.8], [1.2, 38.9]];

// ============================================================================================
// Iberia, Gaul, North Africa
// ============================================================================================
const COAST_HISP_S = [[-6.95, 37.25], [-6.36, 36.79], [-6.29, 36.53], [-5.6, 36.01], [-5.35, 36.14], [-4.42, 36.72], [-2.47, 36.84], [-2.19, 36.73], [-1.65, 37.4], [-0.99, 37.6], [-0.48, 38.35], [0.1, 38.84], [-0.37, 39.47], [0.2, 40.2], [0.87, 40.72]];
const COAST_HISP_NE = [[0.87, 40.72], [1.25, 41.12], [2.17, 41.38], [3.12, 42.13], [3.17, 42.43]];
const B_EBRO = [[0.87, 40.72], [0.3, 41.0], [-1.0, 41.5]];
const B_PYR_1 = [[3.17, 42.43], [1.5, 42.45]];
const B_PYR_2 = [[1.5, 42.45], [0.5, 42.3], [-1.0, 41.5]];
const B_HISP_IN = [[-1.0, 41.5], [-1.5, 40.5], [-2.0, 39.5], [-3.5, 38.8], [-5.0, 38.6], [-6.5, 38.2], [-6.95, 37.25]];
const COAST_NARB = [[3.17, 42.43], [3.05, 43.0], [3.47, 43.31], [4.2, 43.45], [4.85, 43.35], [5.37, 43.27], [6.1, 43.08], [6.7, 43.2], [7.3, 43.68], [7.6, 43.79]];
const B_NARB_N1 = [[7.0, 45.9], [6.1, 46.2]];
const B_NARB_N2 = [[6.1, 46.2], [5.0, 45.5], [4.5, 44.8], [3.5, 44.0], [2.0, 43.5], [1.5, 42.45]];
const GAUL_OUTER = [[1.5, 42.45], [-1.8, 43.35], [-1.2, 44.6], [-1.2, 46.2], [-2.2, 47.2], [-4.7, 48.4], [-3.0, 48.8], [-1.6, 48.7], [-1.3, 49.7], [0.2, 49.5], [1.5, 50.1], [2.5, 51.1], [4.3, 51.45], [6.0, 51.85], [7.0, 51.0], [8.2, 49.0], [7.6, 47.6], [6.1, 46.2]];

/** South and east Iberia below the Ebro (Barcid Spain; Rome's first Hispania). */
export const HISP_SE = path(COAST_HISP_S, B_EBRO, B_HISP_IN);
export const HISP_NE = path(COAST_HISP_NE, B_PYR_1, B_PYR_2, rev(B_EBRO));
export const HISP_W = path([[-6.95, 37.25], [-7.9, 37.0], [-8.99, 37.02], [-8.8, 38.0], [-9.2, 38.7], [-9.0, 39.5], [-8.67, 41.15], [-6.5, 41.8], [-4.5, 42.3], [-2.0, 42.6], [-0.5, 42.7], [0.5, 42.3], [-1.0, 41.5]], B_HISP_IN);
export const NARBONENSIS = path(COAST_NARB, rev(ALPS_W), B_NARB_N1, B_NARB_N2, rev(B_PYR_1));
export const GAUL = path(GAUL_OUTER, B_NARB_N2);
/** Phoenician and Punic towns on Spain's south coast (Gadir, Malaka, Sexi, Abdera). */
export const IBERIA_PUNIC_COAST = [[-6.36, 36.79], [-6.29, 36.53], [-5.6, 36.01], [-5.35, 36.14], [-4.42, 36.72], [-2.47, 36.84], [-2.19, 36.73], [-2.4, 37.1], [-3.5, 37.0], [-4.6, 36.95], [-5.6, 36.6], [-6.0, 36.95], [-6.36, 36.79]];

export const CARTHAGE_CORE = [[8.7, 36.95], [9.87, 37.3], [10.25, 37.18], [10.33, 36.88], [10.55, 36.8], [11.05, 37.08], [10.95, 36.7], [10.6, 36.4], [10.64, 35.83], [11.06, 35.5], [10.76, 34.74], [10.1, 33.88], [9.5, 33.6], [8.8, 34.4], [8.4, 35.5], [8.3, 36.4], [8.7, 36.95]];
/** What Carthage kept after 201 BCE, as Numidia nibbled at it (later Rome's province of Africa). */
export const CARTHAGE_RUMP = [[9.3, 37.15], [9.87, 37.3], [10.25, 37.18], [10.33, 36.88], [10.55, 36.8], [11.05, 37.08], [10.95, 36.7], [10.6, 36.4], [10.64, 35.83], [11.06, 35.5], [10.76, 34.74], [10.3, 34.6], [9.8, 35.5], [9.4, 36.3], [9.3, 37.15]];
/** The Emporia of Tripolitania (Leptis, Oea, Sabratha). */
export const LIBYPHOENICIA = [[10.9, 33.6], [11.5, 33.1], [12.48, 32.8], [13.18, 32.9], [14.29, 32.64], [15.2, 32.35], [15.4, 31.9], [14.3, 32.2], [13.0, 32.45], [11.6, 32.7], [10.9, 33.2], [10.9, 33.6]];
export const CYRENAICA = [[20.0, 32.1], [20.55, 32.55], [21.0, 32.75], [21.95, 32.92], [22.64, 32.8], [23.1, 32.6], [22.8, 32.4], [21.9, 32.55], [21.0, 32.3], [20.3, 31.8], [20.0, 32.1]];

// ============================================================================================
// Small special shapes
// ============================================================================================
/** Bronze Age Iolkos (Volos) in south-east Thessaly. */
export const IOLKOS = [[22.8, 39.2], [22.95, 39.36], [23.05, 39.25], [22.9, 39.45], [22.6, 39.4], [22.8, 39.2]];
/** Mycenaean Miletus (Hittite "Millawanda"). */
export const MILLAWANDA = [[27.15, 37.4], [27.3, 37.6], [27.45, 37.55], [27.35, 37.35], [27.15, 37.4]];
/** The Hittite heartland inside the Halys bend (Hattusa). */
export const HATTI_CORE = [[32.5, 39.3], [33.0, 41.0], [35.0, 41.3], [36.5, 40.6], [37.0, 39.0], [35.5, 38.0], [33.5, 38.3], [32.5, 39.3]];
/** The Hittite empire at its height, without the Kaska-held Black Sea coast. */
export const HATTI_EMPIRE = [[30.5, 39.5], [31.5, 40.6], [33.5, 41.0], [35.5, 40.9], [37.5, 40.0], [39.0, 39.3], [39.5, 38.3], [38.5, 37.3], [36.6, 36.8], [36.17, 36.58], [35.6, 36.6], [34.9, 36.85], [34.63, 36.8], [33.93, 36.37], [33.0, 36.8], [32.5, 37.6], [31.0, 38.3], [30.5, 39.5]];
/** Hittite-ruled north Syria (Carchemish, Aleppo, Ugarit, Amurru) down to Kadesh. */
export const NORTH_SYRIA_LBA = [[35.9, 34.5], [35.78, 35.52], [35.95, 36.0], [36.17, 36.58], [36.6, 36.8], [38.0, 36.9], [38.5, 36.9], [38.6, 35.8], [38.0, 35.0], [36.7, 34.5], [35.9, 34.5]];
/** The Arzawa lands of western Anatolia (Mira, Seha River Land, Wilusa), Hittite vassals. */
export const ARZAWA = [[26.15, 39.95], [26.4, 40.2], [27.3, 40.45], [28.5, 40.4], [29.5, 40.4], [30.5, 39.5], [31.0, 38.3], [30.5, 37.3], [29.0, 37.0], [28.2, 37.5], [27.7, 37.45], [27.2, 37.7], [27.1, 37.95], [26.6, 38.1], [26.25, 38.3], [26.3, 38.65], [26.75, 38.67], [26.8, 38.95], [26.6, 39.3], [26.1, 39.5], [26.15, 39.95]];
/** Early Lydia round Sardis, before the conquests of Alyattes. */
export const LYDIA_CORE = [[27.3, 38.05], [27.4, 38.9], [28.6, 39.2], [29.3, 38.6], [28.9, 37.9], [27.9, 37.85], [27.3, 38.05]];
/** Pergamon under Philetairos and Eumenes I. */
export const PERGAMON_SMALL = [[26.8, 38.95], [27.0, 39.4], [27.6, 39.35], [27.6, 38.95], [27.0, 38.75], [26.8, 38.95]];
/** Etruscan cities of the Po valley (Felsina, Spina, Mantua), c. 550–390 BCE. */
export const PO_ETRURIA = [[10.5, 44.4], [11.0, 45.0], [11.6, 45.2], [12.3, 45.1], [12.4, 44.6], [12.0, 44.3], [11.3, 44.2], [10.5, 44.4]];
/** Etruscan Campania (Capua and its plain), c. 600–424 BCE. */
export const CAMPANIA_ETR = [[13.95, 41.02], [14.05, 40.85], [14.25, 40.9], [14.6, 41.0], [14.45, 41.25], [14.0, 41.25], [13.95, 41.02]];
/** Greek cities of the Bay of Naples (Cumae, Neapolis). */
export const BAY_OF_NAPLES = [[13.98, 40.9], [14.05, 40.82], [14.25, 40.8], [14.4, 40.62], [14.5, 40.72], [14.3, 40.92], [14.0, 40.98], [13.98, 40.9]];
/** Taras and Metapontion on the Gulf of Taranto. */
export const GULF_OF_TARAS = [[16.6, 39.75], [16.82, 40.38], [17.24, 40.47], [17.45, 40.62], [16.95, 40.7], [16.5, 40.35], [16.4, 39.85], [16.6, 39.75]];
/** Massalia and its daughter towns on the Gaulish coast. */
export const MASSALIA_COAST = [[3.4, 43.25], [4.2, 43.45], [4.85, 43.35], [5.37, 43.27], [6.1, 43.08], [6.7, 43.2], [7.3, 43.68], [7.2, 43.85], [6.0, 43.6], [5.2, 43.65], [4.4, 43.75], [3.4, 43.5], [3.4, 43.25]];
export const EMPORION = [[2.95, 41.95], [3.2, 42.1], [3.3, 42.35], [3.0, 42.35], [2.95, 41.95]];
/** Greek towns of the western Black Sea (Apollonia, Mesembria, Odessos, Kallatis, Tomis, Istros). */
export const PONTIC_WEST = [[27.6, 42.35], [27.75, 42.45], [27.7, 42.7], [27.95, 43.2], [28.6, 43.75], [28.66, 44.2], [28.9, 44.6], [28.6, 44.7], [28.3, 44.2], [28.2, 43.8], [27.7, 43.25], [27.45, 42.7], [27.6, 42.35]];
/** Olbia and Tyras on the north-west Black Sea. */
export const PONTIC_NORTH = [[30.3, 46.1], [30.8, 46.5], [31.5, 46.6], [32.0, 46.55], [32.1, 46.8], [31.5, 46.9], [30.6, 46.6], [30.3, 46.1]];
/** Chersonesos, Theodosia and the Bosporan cities either side of the Kerch strait. */
export const BOSPORUS = [[33.4, 44.55], [33.8, 44.4], [34.4, 44.5], [35.3, 44.85], [35.5, 45.1], [36.0, 45.05], [36.45, 45.0], [37.0, 44.9], [37.4, 44.7], [37.6, 44.95], [37.2, 45.35], [36.6, 45.45], [35.9, 45.35], [35.4, 45.2], [34.6, 44.85], [33.6, 44.75], [33.4, 44.55]];
/** Greek towns of the southern Black Sea (Herakleia, Sinope, Amisos, Trapezous): later Pontic Greek. */
export const PONTIC_SOUTH = [[31.0, 41.15], [31.42, 41.3], [32.4, 41.75], [33.4, 42.0], [34.5, 42.0], [35.15, 42.05], [35.6, 41.7], [36.33, 41.32], [37.5, 41.05], [38.5, 40.95], [39.72, 41.02], [40.2, 40.92], [40.0, 40.75], [39.0, 40.75], [37.5, 40.85], [36.3, 41.05], [35.5, 41.45], [35.0, 41.75], [33.5, 41.75], [32.3, 41.45], [31.4, 41.05], [31.0, 41.15]];
/** Greek-speaking Alexandria and the western Delta (Ptolemaic and Roman). */
export const ALEXANDRIA_DELTA = [[29.6, 30.9], [29.9, 31.22], [30.4, 31.47], [31.0, 31.6], [31.2, 31.0], [30.6, 30.6], [29.9, 30.7], [29.6, 30.9]];
/** The Seleucis: Antioch, Seleucia Pieria, Apamea, Laodicea. */
export const SELEUCIS = [[35.78, 35.52], [35.95, 36.0], [36.17, 36.58], [36.6, 36.8], [37.2, 36.4], [36.9, 35.4], [36.3, 35.2], [35.78, 35.52]];
/** Greek-speaking Cappadocian villages that lasted until 1923. */
export const CAPPADOCIA_GREEK = [[34.4, 38.9], [35.2, 39.0], [35.6, 38.4], [34.8, 38.1], [34.4, 38.9]];
