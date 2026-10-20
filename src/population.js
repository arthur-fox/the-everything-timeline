/**
 * Day 67: approximate world population for the globe's year readout.
 *
 * Data: data/population.json (Our World in Data's long-run series: HYDE 3.3 to 1799,
 * Gapminder v7 1800–1949, UN WPP 2024 from 1950; see the file for notes). Loaded lazily with
 * the globe UI, never by the timeline landing (docs/DATA.md).
 *
 * Between points we interpolate log-linearly (constant growth rate within each interval),
 * which is how populations grow and keeps the readout smooth as the slider moves.
 */
import DATA from '../data/population.json';

const POINTS = DATA.points;
export const POPULATION_SOURCES = DATA.sources;
export const POPULATION_FIRST_YEAR = POINTS[0].year;
export const POPULATION_LAST_YEAR = POINTS[POINTS.length - 1].year;

/** Estimated world population in `year` (negative = BCE), or null before the first point. */
export function worldPopulation(year) {
  const y = Number(year);
  if (!Number.isFinite(y) || y < POPULATION_FIRST_YEAR) return null;
  if (y >= POPULATION_LAST_YEAR) return POINTS[POINTS.length - 1].pop;
  let lo = 0;
  let hi = POINTS.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (POINTS[mid].year <= y) lo = mid;
    else hi = mid;
  }
  const a = POINTS[lo];
  const b = POINTS[hi];
  const t = (y - a.year) / (b.year - a.year);
  return Math.exp(Math.log(a.pop) + t * (Math.log(b.pop) - Math.log(a.pop)));
}

/**
 * Human-readable, honestly rounded: 2 significant figures before 1800 (the estimates are only
 * good to tens of percent), 3 after. `short` gives "8.23B" / "230M" for tight phone layouts.
 */
export function formatPopulation(pop, year, { short = false } = {}) {
  if (pop == null) return short ? '<5M' : 'fewer than 5 million';
  const sig = year < 1800 ? 2 : 3;
  const round = (v) => Number(v.toPrecision(sig));
  if (pop >= 1e9) {
    const v = round(pop / 1e9);
    return short ? `${v}B` : `${v} billion`;
  }
  const v = round(pop / 1e6);
  return short ? `${v}M` : `${v} million`;
}

/** The point label for a year, e.g. "UN WPP 2024" or "HYDE 3.3", for the tooltip. */
export function populationSourceFor(year) {
  const y = Number(year);
  if (y < 1800) return 'HYDE 3.3';
  if (y < 1950) return 'Gapminder v7';
  return y > 2023 ? 'UN WPP 2024 (medium variant)' : 'UN WPP 2024';
}
