# Data: where content lives and how to add it

The Everything Timeline is a static site: all content is plain files in this repo, built by Vite and served by GitHub Pages. No database, no server. (If we get accounts later, a DB is for *accounts*, not content.)

**The one rule:** the timeline landing must not download content it doesn't show. New content goes in a file that loads only when its view is opened, never into a static import in `src/main.js`.

## Layout (Day 51)

| What | Source of truth | Loaded |
|---|---|---|
| Country timelines (38) | `data/countries/<id>.json`, one file per country | when that country is opened (or deep-linked / compared) |
| Country list + light item index | generated: `src/generated/countries-index.json` (gitignored) | with the main bundle (5 KB gzipped) |
| Cosmic landing events + eras | `src/events.js` | main bundle (the landing needs them) |
| Topic views (civilisations, technology, science, religion, philosophy, art, economics, wars, cosmic history) | `src/<topic>.js` | main bundle (see "Not done" below) |
| Globe content: polities/overlays, peoples, presence, nations tables + colours, holes, confidence, label names | `src/globe-*.js`, `src/data/nations-colors.js` | lazy globe chunk (`src/globe-app.js`), first time the globe is opened or the Globe button is hovered |
| Borders | `src/data/nations.topo.json`, `nations-fine.topo.json` (TopoJSON, built by `npm run build:nations`) | with the globe; fine borders at close zoom |
| Cities, event pins, physical places | `src/globe-cities.js`, `src/globe-event-pins.js`, `src/data/places.json` | with the globe, after first paint |
| Trade routes (Day 53) | `data/trade-routes.json` (see below) | with the globe, once it is up (≈5 KB gzipped chunk) |
| Migrations (Day 55) | `data/migrations.json` (see below) | with the globe, once it is up (≈6 KB gzipped chunk) |
| Celestial sky (Days 61–62) | `public/sky/bsc-stars.bin` + `milkyway-celestial.webp` + `constellations.bin` (see ATTRIBUTION-sky.md) | with the globe (`globe-sky.js`); Points + texture + LineSegments/names; key toggle `&constellations=0` |

Ids are stable kebab-case strings (`kamakura-shogunate`, `nation-france`) and are used in deep links (`?view=country:japan&id=kamakura-shogunate`), bookmarks and globe ↔ timeline links (`timelineItemIds`). Never rename an id; add a new one instead.

## Country file format

```json
{
  "id": "japan",            // must match the file name
  "name": "Japan",
  "flag": "🇯🇵",
  "minYear": -300, "maxYear": 2025,
  "categories": [ { "id": "politics", "name": "Politics", "color": "#…" } ],
  "items": [
    { "id": "kamakura-shogunate", "name": "Kamakura Shogunate", "start": 1185, "end": 1333,
      "region": "politics", "icon": "⚔️", "description": "…",
      "sources": [ { "title": "…", "url": "https://…" } ],
      "periods": [ { "name": "…", "start": 1185, "end": 1221 } ] }
  ]
}
```

Fields follow `schemas/timeline.schema.json` (swim-lane items: `start`, `end`, `region` = a category id, `icon`, `description`, optional `sources` and `periods`). Years are numbers; negative = BCE.

## Trade route file format (Day 53)

`data/trade-routes.json` holds `{ "routes": [ … ] }`. One route:

```json
{
  "id": "silk-roads", "name": "Silk Roads", "kind": "land",   // or "sea"
  "start": -130, "end": 1450,                                  // years it is drawn (inclusive)
  "color": "#f5c46b", "goods": "Silk, paper, …", "description": "…",
  "confidence": { "level": "approximate", "reason": "…" },     // documented | approximate | conjectural
  "related": ["economics:silk-road-roman", "event:Silk Road Trade Peaks"],  // timeline entries
  "sources": [ { "title": "…", "url": "https://…" } ],
  "paths": [ { "name": "Kashgar to Antioch", "points": [[39.47, 75.99], [40.51, 72.8]] } ]
}
```

Points are `[lat, lng]` waypoints; the globe joins them with straight lat/lng segments, so sea lanes need enough waypoints to stay off the coast. A sea leg that goes up a river or overland can say `"via": "river"` or `"via": "overland"`. Dashes flow from the first point to the last, so list points in the direction goods moved. `scripts/check-routes.js` (in `npm run validate`) checks the fields, the related entries, land waypoints on land and every sea lane off land.

## Migration file format (Day 55)

`data/migrations.json` holds `{ "migrations": [ … ] }`. One migration:

```json
{
  "id": "partition-1947", "name": "Partition of India", "icon": "🚶",
  "kind": "land",                     // land | sea | mixed (mixed: every path says its own kind)
  "start": 1947, "end": 1951,         // years it is drawn (inclusive)
  "color": "#fde047", "forced": true,
  "scale": 3,                         // line width: 1 unknown / < 1M, 2 = 1–5M, 3 = 5–20M, 4 = > 20M people
  "people": "Between 12 and 20 million people displaced; …",
  "description": "…",
  "confidence": { "level": "documented", "reason": "…" },
  "related": ["event:Indian Independence & Partition"],
  "sources": [ { "title": "…", "url": "https://…" } ],
  "paths": [ { "name": "Hindus and Sikhs from west Punjab to India", "start": 1947, "end": 1948,
               "points": [[33.6, 73.05], [31.45, 74.3], [28.55, 77.3]] } ]
}
```

Paths follow the trade-route rules (points in the direction people moved; sea paths need enough waypoints to stay off the coast; `via` for river / overland legs). A path's own `start` / `end` (optional) must sit inside the migration's years; use them to unroll a long expansion stage by stage. `scripts/check-migrations.js` (in `npm run validate`) checks it all; the land / sea geometry is shared with the routes in `scripts/flow-geo.js`.

## How to add data

1. **A new country:** add `data/countries/<id>.json` in the format above. Nothing else to register — the build lists it in the picker.
2. **More items in a country:** edit its JSON file; give each item a new, unique id.
3. **Topic or landing items:** edit the matching `src/<topic>.js` / `src/events.js` array (same fields).
4. **Globe shapes, peoples, presence, cities, pins:** edit the matching `src/globe-*.js` module (they only load with the globe). Ancient Mediterranean / Near East shapes are built from shared pieces in `src/globe-med-pieces.js` (borders shared point for point; `scripts/check-greek-world.js` checks merges). Early medieval Eurasia (500–1000) lives in `src/globe-early-medieval.js` (hand-drawn rings with confidence; `scripts/check-early-medieval.js` checks outlines and sample years). Inland Africa (Day 58), Southeast Asia (Day 59) and Native American / Indigenous nations after 1500 (Day 60, `src/globe-native-nations.js`, `type: 'indigenous'` so they persist past the 1815 nations handoff; `scripts/check-native-nations.js`) follow the same pattern. After editing the nations tables, run `npm run build:nations`.
5. **Trade routes and migrations:** edit `data/trade-routes.json` / `data/migrations.json` (formats above).
5b. **Celestial sky (stars / Milky Way / constellations):** regenerate with `node scripts/build-sky.mjs --constellations` (and `--bsc` / `--cubemap` when rebuilding those); do not invent star coordinates or asterism geometry — rebuild from the Yale BSC JSON and d3-celestial GeoJSON. License notes in `docs/ATTRIBUTION-sky.md`.
6. **A new kind of dataset:** a JSON file under `data/`, loaded with a dynamic `import()` from the view that needs it (see `COUNTRY_FILES` in `src/main.js`). Don't add a static import to `main.js`.
7. Run `npm run validate` (also part of `npm run build`): schema, unique ids, categories, dates, sources, links, borders, labels, cities, pins, trade routes and migrations.

`npm run dev` and `npm run build` run `scripts/build-data.mjs` first (it writes the generated index); there is nothing else to run.

## Measured (Day 51, PR #57, cold cache; phone = Fast-3G-ish 1.6 Mbps / 150 ms + 4× CPU)

| | before | after |
|---|---|---|
| Main JS bundle | 918 KB (295 KB gz) | 330 KB (114 KB gz) |
| Timeline landing transfer | 336 KB | 158 KB |
| Timeline ready — desktop / phone | 0.43 s / 2.43 s | 0.35 s / 1.36 s |
| Globe transfer — desktop / phone | 1565 KB / 1167 KB | 1488 KB / 1090 KB |
| Globe interactive — desktop / phone | 5.1 s / 7.5 s | 3.8 s / 6.4 s |
| Country deep link (Japan) — transfer, phone ready | 336 KB, 2.37 s | 161 KB, 1.49 s |

## Not done (on purpose)

- **Globe content as JSON files.** It already loads only with the globe, and as JSON it would be about the same size gzipped, so it would save nothing. It also uses small helpers (shared ring constants, unit-group strings) that keep it readable. Convert later only if it becomes painful to edit.
- **Topic views as lazy files.** These are the remaining ~64 KB gz of the main bundle. They would be the next win (landing JS ~114 → ~50 KB gz), but the globe reads civilisations/wars synchronously and nine views would need async loading. That's worth doing only if landing speed matters more again.
- **Splitting descriptions from a light index**, per-era globe buckets, quantization: the files are small enough that extra requests would cost more than they save.
