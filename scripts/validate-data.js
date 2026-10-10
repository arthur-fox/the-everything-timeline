#!/usr/bin/env node
/**
 * Validate timeline datasets (Phase 2 #5 + #7 schema).
 *
 * Errors (exit 1): JSON Schema shape failures, duplicate/missing IDs,
 * invalid date ranges, unknown regions/categories, country registry
 * mismatches, invalid optional sources shapes (when present),
 * spatial entity / overlay schema failures, duplicate spatial entity ids,
 * unsorted overlay years, unknown timelineItemIds on spatial entities.
 * Warnings (printed; fail only with --strict): missing icons/descriptions,
 * periods outside parent item dates.
 *
 * Usage: node scripts/validate-data.js [--strict]
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Ajv from 'ajv';

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

// --- JSON Schema (Phase 2 #7) ---
const timelineSchema = JSON.parse(
  readFileSync(join(root, 'schemas/timeline.schema.json'), 'utf8'),
);
const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addSchema(timelineSchema);
const schemaId = timelineSchema.$id;
const schemaValidators = {
  category: ajv.getSchema(`${schemaId}#/definitions/category`),
  period: ajv.getSchema(`${schemaId}#/definitions/period`),
  source: ajv.getSchema(`${schemaId}#/definitions/source`),
  swimLaneItem: ajv.getSchema(`${schemaId}#/definitions/swimLaneItem`),
  overviewEvent: ajv.getSchema(`${schemaId}#/definitions/overviewEvent`),
  era: ajv.getSchema(`${schemaId}#/definitions/era`),
  spatialEntity: ajv.getSchema(`${schemaId}#/definitions/spatialEntity`),
  overlaySnapshot: ajv.getSchema(`${schemaId}#/definitions/overlaySnapshot`),
};

function formatAjvErrors(validate) {
  return (validate.errors || [])
    .map((e) => `${e.instancePath || '/'} ${e.message}`)
    .join('; ');
}

function assertSchema(kind, data, label) {
  const validate = schemaValidators[kind];
  if (!validate(data)) {
    err(`${label}: schema(${kind}) ${formatAjvErrors(validate)}`);
    return false;
  }
  return true;
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
    const catLabel = `${datasetName}: category "${cat?.id ?? '?'}"`;
    assertSchema('category', cat, catLabel);
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
    assertSchema('swimLaneItem', item, `${datasetName}/${label}`);

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

  if (Array.isArray(eras)) {
    for (const [i, era] of eras.entries()) {
      assertSchema('era', era, `events: eras[${i}] "${era?.name ?? '?'}"`);
    }
  }

  if (!Array.isArray(events)) {
    err('events: events export is not an array');
    return;
  }

  for (const [i, event] of events.entries()) {
    const label = event?.title ?? `#${i}`;
    assertSchema('overviewEvent', event, `events/${label}`);
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

/** Day 51: country timelines are plain JSON in data/countries/<id>.json (one file per country). */
function readCountryFiles() {
  const dir = join(root, 'data/countries');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(dir, f), 'utf8')) }));
}

async function validateCountries() {
  const seen = new Set();
  for (const { file, data } of readCountryFiles()) {
    const label = `data/countries/${file}`;
    const id = file.replace(/\.json$/, '');
    if (data.id !== id) err(`${label}: "id" must match the file name (${id})`);
    if (seen.has(data.id)) err(`${label}: duplicate country id "${data.id}"`);
    seen.add(data.id);
    if (typeof data.name !== 'string' || !data.name) err(`${label}: missing "name"`);
    if (typeof data.flag !== 'string' || !data.flag) err(`${label}: missing "flag"`);
    if (!Number.isFinite(data.minYear) || !Number.isFinite(data.maxYear) || data.minYear >= data.maxYear) {
      err(`${label}: minYear/maxYear must be numbers with minYear < maxYear`);
    }
    const categoryIds = validateCategories(label, data.categories);
    validateSwimLaneItems(label, data.items, categoryIds);
  }
}

/**
 * Collect every swim-lane item id across topics + countries for timelineItemIds checks.
 */
async function collectSwimLaneItemIds() {
  const ids = new Set();
  for (const ds of TOPIC_DATASETS) {
    const mod = await importModule(ds.file);
    const items = mod[ds.itemsKey];
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (item?.id) ids.add(item.id);
    }
  }
  for (const { data } of readCountryFiles()) {
    for (const item of data.items || []) {
      if (item?.id) ids.add(item.id);
    }
  }
  return ids;
}

/**
 * Phase 4 PR C — spatial entities / overlay snapshots.
 * Unknown timelineItemIds are errors (omit the id rather than invent one).
 * Overlay years must be strictly ascending per entity.
 */

/** PR D — shared REGION_RINGS must be well-formed and cover seed region ids when possible. */
function validateRegionRings(overlaysMod) {
  const rings = overlaysMod?.REGION_RINGS;
  if (rings == null) {
    warn('globe-overlays: REGION_RINGS missing (polygon layer may be empty)');
    return;
  }
  if (typeof rings !== 'object' || Array.isArray(rings)) {
    err('globe-overlays: REGION_RINGS must be an object map of id → ring');
    return;
  }

  for (const [id, ring] of Object.entries(rings)) {
    if (!Array.isArray(ring) || ring.length < 4) {
      err(`globe-overlays: REGION_RINGS["${id}"] must have at least 4 [lng,lat] points`);
      continue;
    }
    for (const [pi, pt] of ring.entries()) {
      if (!Array.isArray(pt) || pt.length < 2 || typeof pt[0] !== 'number' || typeof pt[1] !== 'number') {
        err(`globe-overlays: REGION_RINGS["${id}"][${pi}] must be [lng, lat] numbers`);
        continue;
      }
      if (pt[0] < -180 || pt[0] > 180 || pt[1] < -90 || pt[1] > 90) {
        err(`globe-overlays: REGION_RINGS["${id}"][${pi}] out of range`);
      }
    }
  }

  // Warn when a referenced region has neither shared ring nor bbox/inline ring.
  for (const entity of overlaysMod.spatialEntities || []) {
    for (const [i, overlay] of (entity.overlays || []).entries()) {
      for (const region of overlay.regions || []) {
        const id = typeof region === 'string' ? region : region?.id;
        if (!id) continue;
        const hasShared = Array.isArray(rings[id]);
        const hasInline = region && typeof region === 'object' && Array.isArray(region.ring);
        const hasBbox = region && typeof region === 'object' && Array.isArray(region.bbox);
        if (!hasShared && !hasInline && !hasBbox) {
          warn(
            `globe-overlays/${entity.id}/overlays[${i}]: region "${id}" has no ring/bbox ` +
              `(will not draw on globe)`,
          );
        }
      }
    }
  }
}

function validateSpatialEntities(entities, knownItemIds) {
  if (!Array.isArray(entities)) {
    err('globe-overlays: spatialEntities export is not an array');
    return;
  }
  if (entities.length === 0) {
    warn('globe-overlays: spatialEntities is empty');
    return;
  }

  const seenIds = new Set();
  for (const entity of entities) {
    const label = entity?.id ?? entity?.name ?? '(unknown)';
    assertSchema('spatialEntity', entity, `globe-overlays/${label}`);

    if (!entity?.id) {
      err(`globe-overlays: entity missing id (${JSON.stringify(entity?.name)})`);
      continue;
    }
    if (seenIds.has(entity.id)) {
      err(`globe-overlays: duplicate spatial entity id "${entity.id}"`);
    }
    seenIds.add(entity.id);

    validateSources(`globe-overlays/${label}`, entity?.sources);

    const overlays = entity?.overlays;
    if (Array.isArray(overlays)) {
      let prevYear = -Infinity;
      overlays.forEach((overlay, i) => {
        const oLabel = `globe-overlays/${label}/overlays[${i}]`;
        assertSchema('overlaySnapshot', overlay, oLabel);
        if (typeof overlay?.year === 'number') {
          if (overlay.year < prevYear) {
            err(
              `${oLabel}: overlay years must be sorted ascending ` +
                `(got ${overlay.year} after ${prevYear})`,
            );
          }
          prevYear = overlay.year;
        }

        // PR D — optional schematic rings (inline); bbox alone is still OK.
        (overlay?.regions || []).forEach((region, ri) => {
          if (!region || typeof region !== 'object' || region.ring == null) return;
          const rLabel = `${oLabel}/regions[${ri}]`;
          const ring = region.ring;
          if (!Array.isArray(ring) || ring.length < 4) {
            err(`${rLabel}: ring must have at least 4 [lng,lat] points`);
            return;
          }
          for (const [pi, pt] of ring.entries()) {
            if (!Array.isArray(pt) || pt.length < 2 || typeof pt[0] !== 'number' || typeof pt[1] !== 'number') {
              err(`${rLabel}: ring[${pi}] must be [lng, lat] numbers`);
              continue;
            }
            if (pt[0] < -180 || pt[0] > 180 || pt[1] < -90 || pt[1] > 90) {
              err(`${rLabel}: ring[${pi}] out of range`);
            }
          }
        });
      });
    }

    const links = entity?.timelineItemIds;
    if (links == null) continue;
    if (!Array.isArray(links)) {
      err(`globe-overlays/${label}: timelineItemIds must be an array`);
      continue;
    }
    for (const itemId of links) {
      if (typeof itemId !== 'string' || !itemId.trim()) {
        err(`globe-overlays/${label}: timelineItemIds entries must be non-empty strings`);
        continue;
      }
      if (!knownItemIds.has(itemId)) {
        err(
          `globe-overlays/${label}: unknown timelineItemId "${itemId}" ` +
            `(must match a swim-lane item id — omit rather than invent)`,
        );
      }
    }
  }
}

async function main() {
  console.log('Validating timeline datasets…');
  console.log(`Schema: schemas/timeline.schema.json (Ajv draft-07 definitions, incl. spatial overlays)\n`);

  for (const ds of TOPIC_DATASETS) {
    const mod = await importModule(ds.file);
    const categoryIds = validateCategories(ds.name, mod[ds.categoriesKey]);
    validateSwimLaneItems(ds.name, mod[ds.itemsKey], categoryIds, {
      useLogDates: ds.useLogDates,
    });
  }

  const eventsMod = await importModule('src/events.js');
  validateEvents(eventsMod.events, eventsMod.eras);

  await validateCountries();

  const knownItemIds = await collectSwimLaneItemIds();
  const overlaysMod = await importModule('src/globe-overlays.js');
  validateSpatialEntities(overlaysMod.spatialEntities, knownItemIds);
  validateRegionRings(overlaysMod);

  console.log(`Country timelines: ${readCountryFiles().length} files in data/countries/`);
  console.log(`Spatial entities: ${overlaysMod.spatialEntities?.length ?? 0}`);
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
