/**
 * Day 65 — the Pacific coast of South America, from Colombia to central Chile, for hand-drawn
 * shapes that meet the sea (Phase 5 country pack 1: Peru).
 *
 * Rows are [lat, westernmost-land lng] read off the globe's own simplified land
 * (src/data/nations.topo.json, Natural Earth, public domain): every 0.25° along Peru, every 0.5°
 * north and south of it, plus the Paracas peninsula. Each point is moved 0.06° east (inland), so a shape whose west side is
 * `coastBetween(…)` stops at the shore instead of washing over the Pacific.
 *
 *   coastBetween(north, south)  → [lng, lat] points down the coast, ends interpolated
 *   coastal(north, south, inland) → a closed ring: the coast north → south, then `inland`
 *                                  ([lng, lat] points from the south end back up to the north end)
 */

const RAW = [
  [1.5, -78.84], [1, -79.55], [0.5, -80.04], [0, -80.11], [-0.5, -80.44], [-1, -80.86], [-1.5, -80.79],
  [-2, -80.73], [-2.5, -80.57], [-3, -79.88], [-3.25, -80.06], [-3.5, -80.51], [-3.75, -80.79], [-4, -81],
  [-4.25, -81.25], [-4.5, -81.33], [-4.75, -81.28], [-5, -81.08], [-5.25, -81.15], [-5.5, -80.91],
  [-5.75, -80.89], [-6, -81.11], [-6.25, -80.85], [-6.5, -80.4], [-6.75, -80], [-7, -79.81], [-7.25, -79.62],
  [-7.5, -79.55], [-7.75, -79.44], [-8, -79.21], [-8.25, -78.96], [-8.5, -78.87], [-8.75, -78.76], [-9, -78.62],
  [-9.25, -78.51], [-9.5, -78.39], [-9.75, -78.26], [-10, -78.21], [-10.25, -78.1], [-10.5, -77.95],
  [-10.75, -77.79], [-11, -77.64], [-11.25, -77.62], [-11.5, -77.31], [-11.75, -77.18], [-12, -77.13],
  [-12.25, -76.95], [-12.5, -76.79], [-12.75, -76.62], [-13, -76.49], [-13.25, -76.3], [-13.5, -76.19],
  [-13.75, -76.23], [-13.85, -76.37], [-13.9, -76.39], [-14, -76.28], [-14.25, -76.14], [-14.5, -75.97], [-14.75, -75.79], [-15, -75.46],
  [-15.25, -75.22], [-15.5, -74.96], [-15.75, -74.45], [-16, -74.03], [-16.25, -73.58], [-16.5, -73.04],
  [-16.75, -72.38], [-17, -72.12], [-17.25, -71.6], [-17.5, -71.38], [-17.75, -71.25], [-18, -70.89],
  [-18.25, -70.53], [-18.5, -70.31], [-19, -70.3], [-19.5, -70.22], [-20, -70.12], [-20.5, -70.19],
  [-21, -70.16], [-21.5, -70.08], [-22, -70.18], [-22.5, -70.25], [-23, -70.36], [-23.5, -70.43],
  [-24, -70.52], [-24.5, -70.57], [-25, -70.47], [-25.5, -70.6], [-26, -70.64], [-26.5, -70.69],
  [-27, -70.79], [-27.5, -70.89], [-28, -71.14], [-28.5, -71.26], [-29, -71.51], [-29.5, -71.29],
  [-30, -71.41], [-30.5, -71.69], [-31, -71.65], [-31.5, -71.58], [-32, -71.51], [-32.5, -71.46],
  [-33, -71.56], [-33.5, -71.65], [-34, -71.91], [-34.5, -72.05], [-35, -72.2], [-35.5, -72.54],
  [-36, -72.78], [-36.5, -72.95], [-37, -73.17],
];

const INLAND = 0.06;
/** [lat, lng] down the coast, north to south, already moved inland. */
export const PACIFIC_COAST = RAW.map(([lat, lng]) => [lat, Math.round((lng + INLAND) * 100) / 100]);
export const COAST_NORTH = PACIFIC_COAST[0][0];
export const COAST_SOUTH = PACIFIC_COAST[PACIFIC_COAST.length - 1][0];

function lngAt(lat) {
  for (let i = 1; i < PACIFIC_COAST.length; i++) {
    const [la, a] = PACIFIC_COAST[i - 1];
    const [lb, b] = PACIFIC_COAST[i];
    if (lat <= la && lat >= lb) {
      const t = la === lb ? 0 : (la - lat) / (la - lb);
      return Math.round((a + (b - a) * t) * 100) / 100;
    }
  }
  throw new Error(`coast: latitude ${lat} is outside ${COAST_NORTH}…${COAST_SOUTH}`);
}

/** [lng, lat] points down the coast from `north` to `south` (degrees, north > south). */
export function coastBetween(north, south) {
  if (!(north > south)) throw new Error(`coast: north ${north} must be above south ${south}`);
  const out = [[lngAt(north), north]];
  for (const [lat, lng] of PACIFIC_COAST) if (lat < north && lat > south) out.push([lng, lat]);
  out.push([lngAt(south), south]);
  return out;
}

/** Closed ring: the coast from `north` down to `south`, then `inland` back up, then closed. */
export function coastal(north, south, inland) {
  const c = coastBetween(north, south);
  return [...c, ...inland, c[0]];
}
