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

## How to add data

1. **A new country:** add `data/countries/<id>.json` in the format above. Nothing else to register — the build lists it in the picker.
2. **More items in a country:** edit its JSON file; give each item a new, unique id.
3. **Topic or landing items:** edit the matching `src/<topic>.js` / `src/events.js` array (same fields).
4. **Globe shapes, peoples, presence, cities, pins:** edit the matching `src/globe-*.js` module (they only load with the globe). After editing the nations tables, run `npm run build:nations`.
5. **A new kind of dataset:** a JSON file under `data/`, loaded with a dynamic `import()` from the view that needs it (see `COUNTRY_FILES` in `src/main.js`). Don't add a static import to `main.js`.
6. Run `npm run validate` (also part of `npm run build`): schema, unique ids, categories, dates, sources, links, borders, labels, cities and pins.

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
