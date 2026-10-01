# Content schema

This folder formalizes the data shapes used by The Everything Timeline (Phase 2 #7).

## Files

| File | Purpose |
|------|---------|
| `timeline.schema.json` | JSON Schema (draft-07) definitions for categories, periods, sources, swim-lane items, overview events, eras, and globe spatial overlays (PR C) |

`npm run validate` loads these definitions via [Ajv](https://ajv.js.org/) and checks every dataset object before the existing semantic rules (duplicate IDs, unknown regions, period spillover warnings, country registry, etc.).

TypeScript types / a full TS migration are **not** required yet — keep authoring in the existing `.js` modules.

## Shapes at a glance

### Category (swim-lane / region)

```js
{ id: 'communication', name: 'Communication', color: '#3B82F6' }
```

### Period (optional sub-range on an item)

```js
{ name: 'ARPANET', start: 1969, end: 1990 }
```

Years are CE positive / BCE negative. Cosmic History stores **log-space** numbers in `start`/`end` after conversion.

### Source (optional citation)

```js
{ title: 'Wikipedia — Internet', url: 'https://en.wikipedia.org/wiki/Internet' }
```

`url` must start with `http://` or `https://`. Prefer reputable encyclopedias; do not invent URLs.

### Swim-lane item (topics + countries)

```js
{
  id: 'internet-web',
  name: 'Internet & Web',
  start: 1969,
  end: 2025,
  region: 'communication', // category id
  icon: '🌐',
  description: '…',
  periods: [ /* optional */ ],
  sources: [ /* optional */ ],
  // Cosmic History only:
  // startYear, endYear  — raw years when start/end are log-space
}
```

Required: `id`, `name`, `start`, `end`. Everything else is optional at the schema layer; the validator still **warns** on missing `icon` / `description` and **errors** if `region` is set but unknown.

### Overview event (`src/events.js`)

```js
{
  title: 'The Big Bang',
  year: -13_800_000_000,
  icon: '💥',
  description: '…',
  era: 'Cosmic',       // optional; must match eras[].name
  sources: [ /* optional */ ]
}
```

There is no separate `id` field today — uniqueness is `year` + `title`.

### Era (overview chrome)

```js
{ name: 'Cosmic', color: '#6B21A8', start: -13_800_000_000, end: -4_600_000_000 }
```

## Authoring tips

1. Copy an existing item in the same file and edit fields — don’t invent new property names.
2. Run `npm run validate` (also runs on `npm run build`) before opening a PR.
3. New countries need both `src/countries/<id>.js` and an entry in `COUNTRY_REGISTRY` in `src/main.js`.
4. Optional `sources` should use real Wikipedia / Britannica (or similar) URLs only.

### Spatial entity (globe overlays — Phase 4 PR C)

```js
{
  id: 'roman-empire',
  name: 'Roman Empire',
  color: '#DC2626',
  type: 'empire', // empire | civilization | state | other
  description: '…',
  keyYears: [-27, 117, 395, 476], // optional
  overlays: [
    {
      year: 117,
      label: 'Height under Trajan',       // optional
      approximation: 'rough',             // rough | simplified | schematic
      regions: [
        { id: 'mediterranean', name: 'Mediterranean basin', bbox: [-10, 24, 45, 56] },
        // bbox is [west, south, east, north] degrees — placeholder only
        // string ids also allowed: 'italy'
      ]
    }
  ],
  timelineItemIds: ['roman-empire', 'roman-conquest'], // optional; must exist in swim-lane data
  sources: [ /* optional; same shape as timeline sources */ ]
}
```

Seed data lives in `src/globe-overlays.js`. Schematic `REGION_RINGS` (and optional per-region `ring` / `bbox`) drive Globe.gl polygons in PR D — approximate only.

### Overlay snapshot

Required: `year`, `approximation`, `regions` (non-empty). `label` optional. Regions are string ids or `{ id, name?, bbox?, ring? }`. Shared rings live in `REGION_RINGS` — schematic, not GIS-precise.

## What schema does *not* cover

Cross-object rules stay in `scripts/validate-data.js`:

- Duplicate IDs across a dataset
- `region` must exist in that file’s categories
- Country registry ↔ file pairing
- Period dates outside parent item range (warning)
- Duplicate spatial entity ids; overlay years must be sorted ascending per entity
- `timelineItemIds` on spatial entities must resolve to real swim-lane item ids (**error** if unknown)

## Globe people packs (Day 27)

Spatial entities may use `type: "people"` for cultural / ethnolinguistic footprints (human-atlas layer 2). Author them in `src/globe-people.js`; do **not** invent `timelineItemIds`. Keep overseas / island footholds as separate region ids.
