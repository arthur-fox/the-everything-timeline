#!/usr/bin/env node
/**
 * Validate timeline datasets (Phase 2 #5).
 *
 * Errors (exit 1): duplicate/missing IDs, invalid date ranges,
 * unknown regions/categories, country registry mismatches,
 * invalid optional sources shapes (when present).
 * Warnings (printed; fail only with --strict): missing icons/descriptions,
 * periods outside parent item dates.
 *
 * Usage: node scripts/validate-data.js [--strict]
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const strict = process.argv.includes('--strict');

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

/** Optional sources: if present, must be [{ title: string, url: http(s)... }]. */
function validateSources(label, sources) {
  if (sources == null) return;
  if (!Array.isArray(sources)) {
    err(`${label}: sources must be an array`);
    return;
  }
  sources.forEach((source, i) => {
    const sLabel = `${label}: sources[${i}]`;
    if (!source || typeof source !== 'object') {
      err(`${sLabel}: must be an object`);
      return;
    }
    if (typeof source.title !== 'string' || !source.title.trim()) {
      err(`${sLabel}: title must be a non-empty string`);
    }
    if (typeof source.url !== 'string' || !/^https?:\/\//i.test(source.url)) {
      err(`${sLabel}: url must be a string starting with http:// or https://`);
    }
  });
}

/** Swim-lane topic datasets: items + category lists. */
const TOPIC_DATASETS = [
  {
    name: 'technology',
    file: 'src/technology.js',
    itemsKey: 'technologies',
    categoriesKey: 'technologyCategories',
  },
  {
    name: 'civilisations',
    file: 'src/civilisations.js',
    itemsKey: 'civilisations',
    categoriesKey: 'regions',
  },
  {
    name: 'science',
    file: 'src/science.js',
    itemsKey: 'sciences',
    categoriesKey: 'scienceCategories',
  },
  {
    name: 'religion',
    file: 'src/religion.js',
    itemsKey: 'religionItems',
    categoriesKey: 'religionCategories',
  },
  {
    name: 'philosophy',
    file: 'src/philosophy.js',
    itemsKey: 'philosophyItems',
    categoriesKey: 'philosophyCategories',
  },
  {
    name: 'art',
    file: 'src/art.js',
    itemsKey: 'artItems',
    categoriesKey: 'artCategories',
  },
  {
    name: 'economics',
    file: 'src/economics.js',
    itemsKey: 'economicsItems',
    categoriesKey: 'economicsCategories',
  },
  {
    name: 'wars',
    file: 'src/wars.js',
    itemsKey: 'warsItems',
    categoriesKey: 'warsCategories',
  },
  {
    name: 'cosmic-history',
    file: 'src/cosmic-history.js',
    itemsKey: 'cosmicHistoryItems',
    categoriesKey: 'cosmicHistoryCategories',
    // Periods and item start/end are stored in log-space after conversion.
    useLogDates: true,
  },
];

async function importModule(relPath) {
  const url = pathToFileURL(join(root, relPath)).href;
  return import(url);
}

function validateCategories(datasetName, categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    err(`${datasetName}: categories list is missing or empty`);
    return new Set();
  }
  const ids = new Set();
  for (const cat of categories) {
    if (!cat?.id) {
      err(`${datasetName}: category missing id (${JSON.stringify(cat)})`);
      continue;
    }
    if (ids.has(cat.id)) err(`${datasetName}: duplicate category id "${cat.id}"`);
    ids.add(cat.id);
    if (!cat.name) warn(`${datasetName}: category "${cat.id}" missing name`);
  }
  return ids;
}

function validateSwimLaneItems(datasetName, items, categoryIds, { useLogDates = false } = {}) {
  if (!Array.isArray(items)) {
    err(`${datasetName}: items export is not an array`);
    return;
  }

  const seenIds = new Map();

  for (const item of items) {
    const label = item?.id ?? item?.name ?? '(unknown)';

    if (item?.id == null || item.id === '') {
      err(`${datasetName}: missing id for item "${item?.name ?? '?'}"`);
    } else if (seenIds.has(item.id)) {
      err(`${datasetName}: duplicate id "${item.id}"`);
    } else {
      seenIds.set(item.id, true);
    }

    const start = useLogDates ? item?.start : (item?.startYear ?? item?.start);
    const end = useLogDates ? item?.end : (item?.endYear ?? item?.end);

    if (typeof start !== 'number' || typeof end !== 'number' || Number.isNaN(start) || Number.isNaN(end)) {
      err(`${datasetName}/${label}: invalid or missing start/end dates`);
    } else if (start > end) {
      err(`${datasetName}/${label}: invalid date range (start ${start} > end ${end})`);
    }

    if (!item?.icon) warn(`${datasetName}/${label}: missing icon`);
    if (!item?.description || !String(item.description).trim()) {
      warn(`${datasetName}/${label}: missing description`);
    }

    validateSources(`${datasetName}/${label}`, item?.sources);

    if (item?.region != null && item.region !== '' && !categoryIds.has(item.region)) {
      err(`${datasetName}/${label}: region/category "${item.region}" does not exist`);
    }

    const periods = item?.periods;
    if (periods != null && !Array.isArray(periods)) {
      err(`${datasetName}/${label}: periods must be an array`);
      continue;
    }

    for (const period of periods || []) {
      const pLabel = period?.name ?? '?';
      const pStart = period?.start;
      const pEnd = period?.end;
      if (typeof pStart !== 'number' || typeof pEnd !== 'number') {
        err(`${datasetName}/${label}: period "${pLabel}" has invalid dates`);
        continue;
      }
      if (pStart > pEnd) {
        err(`${datasetName}/${label}: period "${pLabel}" start > end`);
        continue;
      }
      if (typeof start === 'number' && typeof end === 'number') {
        if (pStart < start || pEnd > end) {
          warn(
            `${datasetName}/${label}: period "${pLabel}" outside parent dates ` +
              `[${start}, ${end}] (got [${pStart}, ${pEnd}])`,
          );
        }
      }
    }
  }
}

function validateEvents(events, eras) {
  const eraNames = new Set((eras || []).map((e) => e.name));
  const seen = new Map();

  if (!Array.isArray(events)) {
    err('events: events export is not an array');
    return;
  }

  for (const [i, event] of events.entries()) {
    const label = event?.title ?? `#${i}`;
    // Events use year+title rather than id; treat missing title/year as errors.
    if (!event?.title) err(`events: entry #${i} missing title`);
    if (typeof event?.year !== 'number' || Number.isNaN(event.year)) {
      err(`events/${label}: missing or invalid year`);
    }

    const key = `${event?.year}::${event?.title}`;
    if (seen.has(key)) err(`events: duplicate year+title "${key}"`);
    else seen.set(key, true);

    if (event?.era && !eraNames.has(event.era)) {
      err(`events/${label}: era "${event.era}" does not exist`);
    }
    if (!event?.icon) warn(`events/${label}: missing icon`);
    if (!event?.description || !String(event.description).trim()) {
      warn(`events/${label}: missing description`);
    }

    validateSources(`events/${label}`, event?.sources);
  }
}

function parseCountryRegistry(mainSource) {
  const start = mainSource.indexOf('const COUNTRY_REGISTRY');
  if (start < 0) {
    err('main.js: COUNTRY_REGISTRY not found');
    return [];
  }
  const end = mainSource.indexOf('];', start);
  if (end < 0) {
    err('main.js: could not parse COUNTRY_REGISTRY bounds');
    return [];
  }
  const block = mainSource.slice(start, end + 2);
  return [...block.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
}

async function validateCountries(registryIds) {
  const countriesDir = join(root, 'src/countries');
  const files = readdirSync(countriesDir).filter((f) => f.endsWith('.js')).sort();
  const fileIds = files.map((f) => f.replace(/\.js$/, ''));

  for (const id of fileIds) {
    if (!registryIds.includes(id)) {
      err(`country registry: file src/countries/${id}.js is not listed in COUNTRY_REGISTRY`);
    }
  }
  for (const id of registryIds) {
    if (!fileIds.includes(id)) {
      err(`country registry: id "${id}" has no matching src/countries/${id}.js file`);
    }
  }

  // Duplicate registry ids
  const seenReg = new Set();
  for (const id of registryIds) {
    if (seenReg.has(id)) err(`country registry: duplicate id "${id}"`);
    seenReg.add(id);
  }

  for (const file of files) {
    const mod = await importModule(`src/countries/${file}`);
    const exports = Object.keys(mod);
    const itemsKey = exports.find((k) => k.endsWith('Items'));
    const catsKey = exports.find((k) => k.endsWith('Categories'));
    if (!itemsKey || !catsKey) {
      err(`countries/${file}: expected *Items and *Categories exports`);
      continue;
    }
    const categoryIds = validateCategories(`countries/${file}`, mod[catsKey]);
    validateSwimLaneItems(`countries/${file}`, mod[itemsKey], categoryIds);
  }
}

async function main() {
  console.log('Validating timeline datasets…\n');

  for (const ds of TOPIC_DATASETS) {
    const mod = await importModule(ds.file);
    const categoryIds = validateCategories(ds.name, mod[ds.categoriesKey]);
    validateSwimLaneItems(ds.name, mod[ds.itemsKey], categoryIds, {
      useLogDates: ds.useLogDates,
    });
  }

  const eventsMod = await importModule('src/events.js');
  validateEvents(eventsMod.events, eventsMod.eras);

  const mainSource = readFileSync(join(root, 'src/main.js'), 'utf8');
  const registryIds = parseCountryRegistry(mainSource);
  await validateCountries(registryIds);

  console.log(`Country registry: ${registryIds.length} entries`);
  console.log(`Errors:   ${errors.length}`);
  console.log(`Warnings: ${warnings.length}\n`);

  if (errors.length) {
    console.log('ERRORS:');
    for (const e of errors) console.log(`  ✗ ${e}`);
    console.log('');
  }
  if (warnings.length) {
    console.log('WARNINGS:');
    for (const w of warnings) console.log(`  ⚠ ${w}`);
    console.log('');
  }

  if (errors.length) {
    console.error('Validation failed.');
    process.exit(1);
  }
  if (strict && warnings.length) {
    console.error('Validation failed (--strict: warnings treated as errors).');
    process.exit(1);
  }

  console.log(strict ? 'Validation passed (strict).' : 'Validation passed.');
}

main().catch((e) => {
  console.error('Validator crashed:', e);
  process.exit(1);
});
