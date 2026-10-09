# The Everything Timeline Roadmap

This roadmap is a working plan for turning The Everything Timeline from an interactive historical timeline into a richer exploratory atlas of time, place, and change.

The guiding product idea:

> An interactive atlas of history where you can search, compare, and explore everything from cosmic time to individual countries.

## Product principles

- **Exploration first:** users should be able to wander, search, zoom, and follow curiosity.
- **Trust matters:** dates, descriptions, borders, and claims should become increasingly sourced and validated.
- **Approximate is acceptable when honest:** especially for ancient borders, spheres of influence, migrations, and empires.
- **Mobile should be excellent:** this is a natural phone/tablet exploration experience.
- **Data should not become spaghetti:** expansion should be paired with schemas, validation, and consistent IDs.

## Phase 1 — Navigation and usability

These features make the current timeline easier to use as content grows.

### 1. Search — done (in-view)

Add search as a core navigation tool.

- Search within the current view.
- Later, search across all views.
- Result click/tap should pan/zoom to the item and open its detail panel.
- Mobile search should feel like a command palette or bottom sheet.

### 2. Active view and context labels — done

Make it obvious what the user is looking at.

- Show labels such as `Technology`, `Civilisations`, or `🇯🇵 Japan`.
- Improve the current `Countries...` dropdown sentinel so selected countries are clearer.
- Consider a compact mobile header that prioritizes the current context.

### 3. Deep links — done (view / item / year)

Make timeline states shareable and restorable.

Potential URL patterns:

```text
/the-everything-timeline/?view=technology&id=internet-web
/the-everything-timeline/?view=country:us&id=civil-war
/the-everything-timeline/?view=civilisations&year=117
```

Deep links should eventually support:

- selected view ✅
- selected item ✅
- approximate year/range ✅
- active filters ✅ (Day 7 — `filters` query param)
- compare pair ✅ (Day 8 — `compare` query param)

### 4. Better mobile controls — done (Day 3)

Continue improving the phone experience.

- Compact top bar. ✅ single-row header with shortened title + Viewing pill
- More ergonomic zoom/theme controls. ✅ thumb bar above minimap (44px targets)
- Better current-view display. ✅ readable pill in compact header (`Countries › 🇯🇵 Japan`)
- Refined bottom sheets for search and details. ✅ drag handle, safe-area, taller sheet; search as bottom sheet on mobile
- Filters sheet. ✅ mobile bottom sheet + desktop panel (Day 7 / Phase 3 #8)

## Phase 2 — Trust and data quality

The project should become more credible as it grows.

### 5. Data validation — done (Day 4)

Add validation scripts and CI checks for timeline datasets.

- `npm run validate` runs `scripts/validate-data.js` against all topic + country datasets and the overview events list.
- Wired into `npm run build` so existing **PR Preview** and **Deploy** GitHub Actions jobs fail the build on validation errors (no separate workflow file required).
- Errors (fail build/CI): duplicate/missing IDs, invalid date ranges, unknown regions/categories, country registry ↔ file mismatches.
- Warnings (printed; `npm run validate:strict` fails on them): missing icons/descriptions, periods outside parent item dates (a few historical spillover edges remain as warnings).

Checks covered:

- duplicate IDs ✅
- missing IDs ✅
- invalid date ranges ✅
- periods outside parent item dates ✅ (warn)
- missing icons/descriptions ✅ (warn)
- regions/categories that do not exist ✅
- country registry mismatches ✅

### 6. Sources and citations — done (Day 5)

Add optional source fields to timeline items.

Shape:

```js
sources: [
  { title: 'Wikipedia — Roman Empire', url: 'https://en.wikipedia.org/wiki/Roman_Empire' },
  { title: 'Britannica — Roman Empire', url: 'https://www.britannica.com/place/Roman-Empire' }
]
```

- Detail panel shows a **Sources** section with external links (`target=_blank`, `rel=noopener`) when present; hidden when absent.
- Seeded ~16 notable items (Technology, Civilisations, Science, Japan, + 2 overview events) with real Wikipedia/Britannica URLs — not mass-annotated.
- `scripts/validate-data.js`: if `sources` is present, require `[{ title: string, url: http(s)... }]`; missing sources remain fine.

### 7. Content schema — done (Day 6)

Formalize the data model (without a TypeScript migration).

- `schemas/timeline.schema.json` — draft-07 definitions for category, period, source, swim-lane item, overview event, and era.
- `schemas/README.md` — authoring guide for future content.
- `npm run validate` (and `validate:schema`) runs Ajv schema checks on every dataset object, then the existing semantic rules.
- TypeScript types still optional / later.

**Phase 2 complete.** Next up is Phase 3.

## Phase 3 — Exploration features

These features make the app more than a static timeline.

### 8. Filters — done (Day 7)

Allow users to filter within views.

Examples:

- Technology: Computing, Medicine, Energy, Transport
- Civilisations: Europe, Africa, East Asia, Americas
- Wars: Ancient, Medieval, Modern, Global
- Countries: political, cultural, scientific, economic

Shipped:

- Filters control in the header (disabled on the cosmic Timeline view).
- Multi-select category chips for every swim-lane view (topics + countries), reusing each view’s existing `regions` / `*Categories` lanes — hide non-selected lanes/items.
- Empty / “All” = show everything; active filter count badge on the button.
- Desktop: compact panel near the Filters button; mobile: bottom sheet (same pattern as search/details).
- Deep links: optional `filters` query param (comma-separated category ids), e.g. `?view=technology&filters=computing,medicine`.

### 9. Compare mode — done (Day 8)

Let users compare timelines or regions.

Possible examples:

- Rome vs Han China
- Technology vs Wars
- United States vs United Kingdom
- Religion vs Philosophy

Shipped:

- Compare toggle in the header; Exit restores the previous view.
- Two synchronized swim-lane panels (A / B) sharing zoom, pan, and minimap time window.
- Pick any two topic or country views (linear-year swim lanes; cosmic / cosmic-history excluded).
- Independent vertical scroll per panel; shared horizontal time navigation.
- Search spans both panels; detail panel and deep links work (`?compare=technology,wars`, `?compare=country:us,country:uk`).
- Filters disabled while comparing (per-panel filters can come later).

### 10. Bookmarks and saved trails — done (Day 9)

Let users save interesting events locally.

- Bookmark events/items. ✅ detail-panel Bookmark toggle
- Create a simple reading list. ✅ Bookmarks panel (localStorage)
- Later, support shareable trails.

Shipped:

- **Bookmark** control on the detail panel (☆ / ★) for cosmic events and swim-lane items.
- Header **Bookmarks** button with count badge; desktop panel + mobile bottom sheet (same pattern as Filters).
- Reading list shows icon, name, view, and date; tap to jump (switches view + focuses item); per-item remove + Clear all.
- Persisted in `localStorage` (`timeline-bookmarks-v1`) on this device — shareable trails deferred.

## Additional ideas to explore later

These ideas may become useful, but they are less essential than search, validation, sources, filters, compare mode, and Globe Mode.

### Story mode

Curated guided paths through the data.

Possible stories:

- From Big Bang to Humans
- Rise of Civilisation
- History of Computing
- Empires of the Ancient World
- The Scientific Revolution
- From Writing to AI

This could be compelling eventually, especially for education, but it should not drive the near-term roadmap until the core exploration tools are stronger.

## Phase 4 — Globe mode

Globe mode is the major spatial companion to the timeline.

The core idea:

> Timeline shows what happened when. Globe mode shows where power, culture, borders, and influence shifted over time.

### Why this matters

A globe view could become the project’s flagship feature. It would let users push time forward and watch rough historical overlays shift across the Earth: empires expanding and contracting, civilizations rising, trade zones appearing, religions spreading, and countries changing shape.

### Recommended approach

Start with a stylized, approximate historical globe rather than a perfectly accurate historical GIS system.

The first version should be clear that overlays are approximate:

- rough spheres of control/influence
- simplified polygons or regions
- no claim of exact border precision for ancient periods
- source notes where possible

This keeps the feature achievable and honest.

### Globe MVP sequence

#### PR A — Globe view shell — done (Day 10)

- Add `Globe` to the view selector. ✅
- Create a dedicated globe view container. ✅ placeholder orb + copy
- Add a year slider and current-year label. ✅ scrubber + presets + captions
- Include placeholder explanatory copy. ✅ approximate-overlays disclaimer
- Deep link: `?view=globe&year=117`

#### PR B — Interactive globe prototype — done (Day 11)

- Render an interactive 3D globe. ✅ **Globe.gl** + Three.js (Blue Marble texture)
- Support mouse/touch rotation. ✅ orbit drag; subtle auto-rotate until first interaction
- Support zoom. ✅ scroll / pinch
- Keep mobile performance in mind. ✅ pause on hide/leave, dispose WebGL on view switch, lighter atmosphere on coarse pointers
- Year scrubber from PR A kept (label/caption only until overlay data)

#### PR C — Historical overlay data model — done (Day 12)

Introduce a data model for spatial entities. ✅

Example rough shape:

```js
{
  id: 'roman-empire',
  name: 'Roman Empire',
  color: '#DC2626',
  type: 'empire',
  description: 'A major Mediterranean empire centered on Rome.',
  keyYears: [-200, 117, 395, 476],
  overlays: [
    {
      year: 117,
      label: 'Height under Trajan',
      approximation: 'rough',
      regions: [/* simplified polygons or region references */]
    }
  ],
  timelineItemIds: ['roman-republic', 'roman-empire']
}
```

Shipped:

- Schema definitions (`spatialEntity`, `overlaySnapshot`, `regionRef`) in `schemas/timeline.schema.json` + authoring notes in `schemas/README.md`. ✅
- Seed module `src/globe-overlays.js` with 5 entities (Roman Empire, Han China, Mongol Empire, Abbasid Caliphate, Inca Empire) — named region refs + optional bbox placeholders, no invented precise polygons. ✅
- `npm run validate` schema-checks entities/overlays; errors on duplicate ids, unsorted overlay years, and unknown `timelineItemIds`. ✅
- Globe UI: year scrubber drives a small “Overlays at …” panel listing active seed entities (still no polygon drawing). ✅
- Deep link `?view=globe&year=117` still works. ✅

#### PR D — First historical overlays — done (Day 13)

Start with a small, visually meaningful set:

- Roman Empire ✅ schematic Med / Italy / Near East rings
- Han China ✅ china-proper (+ earlier north/central/tarim rings)
- Mongol Empire ✅ steppe / China / Persia rings
- Islamic Caliphates ✅ Abbasid Mesopotamia–Egypt–Persia rings
- Inca Empire ✅ Andes / Peru rings
- Ottoman / British / Spanish — deferred in Day 12 seed; added in Day 14 density pass ✅

Shipped:

- `REGION_RINGS` schematic GeoJSON rings + `getOverlayPolygonFeatures(year)` in `src/globe-overlays.js`. ✅
- Globe.gl `polygonsData` updates in place on year scrub (no full remount). ✅
- Overlay panel stays in sync; UI copy clarifies shapes are approximate. ✅
- Schema/validation accept optional `ring`; shared rings validated. ✅

#### Day 14 — Overlay polish (render fix + denser seed) — done

User feedback after PR D:

- **Z-fighting fix:** polygons hug the sphere — `polygonAltitude(0.005)`, translucent `MeshBasicMaterial` caps with `depthWrite: false` + polygonOffset, invisible side materials (no extruded walls), stroke kept for edge read. ✅
- **Denser empires:** ~24 schematic entities so key years (117, 800, 1279, 1492, 1700, 1900) light several continents — Parthia, Kushan, Maurya, Gupta, Byzantine, Frankish/Carolingian, Tang, Song, Mali, Khmer, Delhi Sultanate, Ottoman, Spanish, Aztec, Ming, Mughal, Qing, Russian, British (+ prior five). ✅
- Presets/captions expanded (1700, 1900). ✅
- Timeline tap integration still deferred to **PR E**.

#### Day 15 — Overlay UI polish (colors + layout) — done

User bugs after Day 14:

- **Unique colors:** curated 24-color palette — Qing (pink) vs British (sky blue) and no near-identical reds; list swatch matches polygon. ✅
- **Layout:** globe stage uses CSS grid split (canvas | overlays sidebar) so the rounded globe card no longer overlaps empire rows; sidebar scrolls independently. ✅
- Timeline tap integration still deferred to **PR E**.

#### Day 16 — Overlays sidebar cleanup — done

User bug: divider/border sliced through the era caption pill and cramped the OVERLAYS header.

- Sidebar restacked with flex `gap` only: disclaimer → gesture hint → opaque era caption card → overlays heading → scrollable list. ✅
- Removed conflicting `border-top` / nested panel chrome that crossed the caption. ✅
- Day 14/15 color + stage grid kept. **PR E** still next.

#### Day 17 — Denser globe overlays (ancient + colonial pass) — done

User feedback: globe feels good but is missing lots of information — timeline↔globe only works if the same civilisations appear in both.

- Fixed `song-china.timelineItemIds` → `['song-dynasty']`. ✅
- Added ~15 schematic entities with unique colours and valid `timelineItemIds`: Achaemenid Persia, Ancient Egypt, Classical Greece, Carthage, Sassanid, Umayyad, Holy Roman Empire, Portuguese, Dutch, French Colonial, Safavid, Maya, Songhai, Majapahit, Imperial Japan. ✅
- Extended `REGION_RINGS` (Greece, Anatolia, Yucatán, Japan, Java, Low Countries, etc.) — still approximate, not GIS. ✅
- −500 preset no longer empty; Africa / SE Asia / early-modern colonial coverage thickened. ✅
- Timeline tap integration still deferred to **PR E**.

#### Day 18 — Clamp globe overlay lifespans — done

User bug: Ottomans (and other late-snapshot empires) still showing in the 1980s while scrubbing.

- Root cause: `OVERLAY_ACTIVE_WINDOW = 80` kept an entity “on” if any overlay/keyYear was within ±80 years — so a 1900 Ottoman snapshot stayed active until ~1980. ✅ fixed
- Activation is now the **intersection** of (1) linked timeline item start/end (union of `timelineItemIds`) and (2) first→last overlay keyframe ± `OVERLAY_EDGE_GRACE` (15 years, not 80). ✅
- Ottoman ON at 1900, OFF by 1925 / 1980; same systematic clamp for British / Qing / Russian / etc. ✅
- `scripts/check-overlay-lifespan.js` wired into `npm run validate`. ✅
- Still nearest-keyframe geometry only — **no morphing yet**.

#### Day 19 — Early Bronze Age globe fill (3000–1200 BCE) — done

User scrubbed 3000–1200 BCE and found nothing — keep the −3000 scrubber range; fill it.

- Added **Mesopotamia** with schematic snapshots (−3000…−1200). ✅
- Extended **Ancient Egypt** with Old/Middle Kingdom overlays (−2500, −2000, −1500) so the Nile lights early. ✅
- Added Shang, Phoenicia, Olmec, Kush; early Maya Preclassic snapshot (−1500). ✅
- Presets **2500 BCE** / **2000 BCE** (+ captions). Scrubber min stays −3000. ✅
- Lifespan clamps respected — early years have real overlay keyframes, not orphan keyYears. ✅
- **Mobile globe polish:** phone layout prioritises canvas height (~42–50vh), collapses lede/note, scrollable overlays, horizontal preset chips, touch-action + resize settle so drag-rotate works. ✅
- Living/morphing borders (**PR F**) started Day 20; Day 21 densified hero keyframes; Day 22 colony fragment/split. **PR E** still secondary.

#### Day 20 — Living borders: morph between overlay keyframes (PR F slice 1) — done

Arthur’s vision: shapes that **grow, stretch, deform and reform** until they dissolve — not sit-then-vanish blobs.

- Keyframe interpolation: bracketing overlay snapshots → resample rings → lerp lng/lat (antimeridian-aware). ✅
- Match regions by `id`; unmatched regions fade in/out via scale-to-centroid. ✅
- Soft dissolve in the Day 18 lifespan grace band (opacity + shrink). ✅
- Per-snapshot `bbox` preferred over shared `REGION_RINGS` so growth is visible. ✅
- `src/globe-morph.js` + morph checks in validate. Ottoman visibly grows 1520→1683 and fades near end. ✅

**Follow-ups (later PR F slices):** denser mid-keyframes where morph looks stiff; better fragment/split for distant colonies; true multi-polygon topology / ocean gaps; optional easing curves.

#### Day 21 — Living borders polish: denser non-rect keyframes (PR F slice 2) — done

Addresses Day 20 follow-ups: morphs mostly *scaled* because footprints were axis-aligned boxes, and sparse keyframes (e.g. Ottoman 1520→1683→1900) made scrubbing feel stiff.

- **Hero empires densified** with mid-year overlay snapshots + inline multi-vertex `ring`s (not bbox quads):
  - **Ottoman:** 1453, 1520, **1600**, 1683, **1800**, 1900 — evolving `anatolia-balkans` crescent + Levant/Egypt/Maghreb.
  - **Roman:** −27, **50**, 117, **200**, 395 — Mediterranean basin silhouette stretches Britain↔Near East.
  - **Mongol:** 1227, **1241**, 1279, **1300** — steppe belt deforms westward then pinches.
  - **British:** 1700, **1780**, 1850, 1900, **1920** — Atlantic→India foothold→Victorian→interwar fragments.
- Morph path now uses dense ring lerp (vertex count > 4) so outlines **deform** while scrubbing, not only scale corners. ✅
- **Softer appear/disappear:** `OVERLAY_EDGE_GRACE` 15→20; `lifespanEdgeFactor` uses smoothstep; gentler edge shrink floor. ✅
- Validate extended for hero keyframe counts, non-rect rings, soft edge factor. ✅
- Fragment/split for distant colonies left for a later PR F slice (British already multi-region fade-in).

#### Day 22 — Living borders: colony fragment/split + opacity (PR F slice 3) — done

Distant possessions must stay **separate region ids** so scrubbing never stretches one polygon across oceans (same id → lerp; id only in next → fade in; only in prev → fade out).

- **Opacity bump:** overlay `baseOpacity` 0.28 → **0.43** (land still visible); `globe-view` rgba clamp aligned. No Day 20 planet-tint / custom DoubleSide materials. ✅
- **British:** Caribbean fragment + Australia mid-keyframe foothold (1780) so Victorian colonies do not hard-pop; 1850/1900/1920 stay multi-region (Isles / India / Australia / South Africa / Canada / Caribbean / Egypt). ✅
- **Spanish:** densified 1492 → 1550 → 1700 → **1800** with Iberia, New Spain, Andes, Southern Cone, Caribbean, Philippines as separate multi-vertex rings. ✅
- **Portuguese:** 1500 → **1600** → 1700 with Iberia, Brazil, West Africa, Angola, Goa fringe as separate ids. ✅
- **Dutch / French:** multi-vertex rings; Cape / Caribbean / Indochina stay distinct from metro cores (no ocean-spanning morph). ✅
- Softer smoothstep fade-in for newly appearing distant regions. ✅
- Validate extended for fragment counts, per-region span caps, opacity band. ✅
- True multi-polygon topology / ocean gaps (GIS holes) still deferred; **PR E** still secondary.


#### Day 23 — Denser overlay coverage (rise → peak → decline) — done

User feedback after Day 22: morphing looks good but **data is thin** — famous empires with a single late “peak” keyframe (Aztec 1519, Inca 1527) pop in right before conquest. This pass densifies overlay snapshots so scrubbing shows rise → peak → decline where historically sensible.

- **Aztec:** 1428 (Triple Alliance founding) → 1475 (expansion + tributary fringe) → 1519 (peak) → 1521 (brief fall). Multi-vertex Valley of Mexico + `aztec-tributary` rings. ✅
- **Inca:** 1438 (Pachacuti / early Tawantinsuyu) → 1475 → 1495 (Andean spine) → 1527 (late extent). Separate `peru` / `andes-north` / `andes-south` region ids so morph deforms along the corridor (not one ocean-tall bbox). ✅
- **Batch densify** all 16 former single-keyframe empires to ≥3 overlay years: kushan, maurya, gupta, frankish, tang-china, mali, khmer, delhi-sultanate, achaemenid, classical-greece, umayyad, safavid, songhai, majapahit (+ aztec/inca). ✅
- Schematic multi-vertex rings preferred; colors / ids / `timelineItemIds` unchanged. Lifespan clamp respected. ✅
- Validate extended: Aztec+Inca ≥3 keyframes + active at 1470; warn on entities with <3 overlays. ✅
- Remaining thin notables (2 keyframes): Ming, Qing, Mughal, Abbasid, Song, Sassanid, Parthian, HRE, Carthage, Dutch, French colonial, Meiji, Shang, Phoenicia, Olmec, Kush — backlog for a later densify pass. **PR E** still secondary. → **Done Day 24.**

#### Day 24 — Densify remaining 2-keyframe globe overlays (PR F densify backlog) — done

Finish the Day 23 remainder list so every notable polity/civilisation on the globe has ≥3 overlay snapshots (rise → mid/peak → late) and morph has something to deform.

- **All 16 former 2-keyframe entities** densified to ≥3 overlays: Ming, Qing, Mughal, Abbasid, Song, Sassanid, Parthian, HRE, Carthage, Dutch, French colonial, Meiji (Imperial Japan), Shang, Phoenicia, Olmec, Kush. ✅
- Schematic multi-vertex rings where helpful; distant fragments keep separate region ids (Dutch Cape/Java, French metro/colonies, Meiji home/Korea/Manchuria — no ocean-spanning morph). ✅
- Example scrub years: Ming 1380→1420→1550; Qing 1680→1750→1900; Mughal 1560→1605→1700; Abbasid 760→800→900; French 1700→1830→1914; Meiji 1875→1905→1914. ✅
- Validate: hard ≥3 for the Day 24 id list + spot-check years; soft note if any entity somehow still <3 (should be empty). Aztec/Inca Day 23 checks kept. ✅
- Colors / entity ids / `timelineItemIds` unchanged. Lifespan clamps respected. ✅


#### Day 25 — Globe overlays for remaining timeline civilisations — done

Close the timeline↔globe **polity** gap: every civilisation in `civilisations.js` now has ≥1 overlay entity with matching `timelineItemIds` (27→0 missing).

- Added **27 schematic overlay entities** (≥3 keyframes each, unique colours, multi-vertex rings): Zhou, Qin, Seleucid, Axum, Ghana, Chola, Srivijaya, Venice, Heian Japan, Viking Age, Mississippian, Kievan Rus', Toltec, Goryeo, Khwarezmia, Great Zimbabwe, Kamakura–Muromachi, Ethiopian Empire, Timurid, Kongo, Joseon, Colonial Americas, Tokugawa, Maratha, Sikh Empire, Zulu, Austro-Hungarian. ✅
- **Colonial Americas** and **Viking Age** use separate region ids for overseas footholds (no ocean-spanning single ring). ✅
- Validate: hard fail if any timeline civ lacks an overlay link; Day 25 entity list ≥3 overlays; easy-test years (Axum 400, Mississippian 1100, Zhou −850, Venice 1200, Zulu 1850). ✅
- Still schematic / honest, not GIS. **Do not invent timelineItemIds** — exact civ `id`s only.

**Human-atlas sequence (locked briefly):** (1) this polity fill ✅ (2) **people packs** — ✅ Day 27 + ✅ Day 28 pack 2 (3) **human presence** layer — ✅ Day 29 first slice. **PR E** (timeline↔globe deep sync) remains secondary.

#### Day 27 — People packs (human-atlas layer 2) — done

First cultural / ethnolinguistic **people pack** on the globe — not state polities.

- Schema: spatial entity `type` accepts **`people`**. ✅
- Seed module `src/globe-people.js` with **10** people entities (≥3 keyframes, unique colours, multi-vertex rings): Celts, Germanic peoples, Slavs, Bantu peoples, Turkic peoples, Polynesian peoples, Scythians, Aboriginal Australians, Amazigh, Ancestral Puebloans. ✅
- Appended into the shared `spatialEntities` catalogue; lifespan uses overlay keyframe span (± grace) — no invented `timelineItemIds`. ✅
- **Layer toggle** in the overlays sidebar: Both / Polities / Peoples (deep link `?view=globe&layer=peoples`). ✅
- Sidebar **People** / **Polity** badges; people fills slightly softer; Polynesian island groups stay separate region ids (no ocean blobs). ✅
- Validate: people-pack id list, colours, layer filter, easy-test years. ✅
- Still schematic / honest. Day 28 adds a second people pack for global coverage. Human presence ✅ Day 29; **PR E** still secondary.

#### Day 28 — People pack 2 (global coverage) — done

Second cultural / ethnolinguistic **people pack** filling geographic gaps left by Day 27.

- Extended `src/globe-people.js` with **10** more people entities (≥3 keyframes, unique colours vs polities + pack 1, multi-vertex rings): Indo-Aryan, Dravidian, Arab peoples, Sinitic, Finno-Ugric, Khoisan, Inuit, Maya peoples, Andean peoples, Nilotic. ✅
- Catalogue now **20** people + **71** polities → **≥91** `spatialEntities`. Lifespan from overlay keyframe span (± grace); no invented `timelineItemIds`. ✅
- Layer toggle Both / Polities / Peoples unchanged — filters `type === 'people'`. Distant footholds (Inuit Alaska/Canada/Greenland; Arab peninsula/Levant/Egypt/Maghreb; Finno-Ugric Baltic/Ural/Hungary) stay separate region ids. ✅
- Validate: Day 28 id list, easy-test years, fragment span checks, `spatialEntities.length >= 91`. ✅
- Branch stacks on Day 27 (`day-27-people-packs` / PR #32). PR #31 (z-fight) and PR #32 still awaiting merge if not yet on main.
- Still schematic / honest. Next was **human presence** → ✅ Day 29. **PR E** still secondary.

#### Day 29 — Human presence layer (human-atlas layer 3) — done

First **Presence** globe layer: schematic inhabited-footprint regions that expand/densify over deep time — honest approximate hearths/belts, not GIS, not ethnolinguistic (that's Peoples).

- New module `src/globe-presence.js` with **10** presence entities (`type: 'presence'`, ≥3 keyframes, unique colours vs polities + people, multi-vertex rings): Fertile Crescent, Nile Valley, Yellow River, Indus–Gangetic, Mesoamerica, Andean, West Africa/Sahel, Temperate Europe, Southeast Asia, Global modern. ✅
- Appended into `spatialEntities`; lifespan from overlay keyframe span (± grace); **no invented `timelineItemIds`**. ✅
- Layer toggle adds **Presence** (Both / Polities / Peoples / Presence); deep link `?view=globe&layer=presence`. Both = all layers. ✅
- Sidebar **Presence** badge; presence fills slightly more translucent than people. Distant fragments (esp. global-modern coastal belts, SE Asia islands) stay separate region ids. ✅
- Validate: PRESENCE_PACK_IDS, colours, layer filter, easy-test years (Nile −3000, Mesoamerica 500, global-modern 1900), `spatialEntities.length >= 101`. ✅
- Branch stacks on Day 28 (`day-28-people-pack-2` / PR #33). PRs #31–#33 still awaiting merge if not yet on main.
- Still schematic / honest. Next was **PR E** → ✅ Day 30. Optional: presence densify / more hearths.

#### Day 31 — Presence densify (presence pack 2) — done

Ten more schematic inhabited-footprint hearths/belts so Presence isn't only the classic river-valley cradles.

- New module `src/globe-presence-pack2.js` (**10** entities, spread into `PRESENCE_PACK_IDS` / `presenceEntities`): Yangtze rice belt, Ethiopian highlands, East & Southern Africa farming belt (Great Lakes / Swahili coast / Zimbabwe plateau), Eastern Woodlands (Hopewell → Mississippian), Amazonia (Marajó, central Amazon, upper Amazon, Llanos de Moxos), Japan archipelago (Jōmon → Yayoi → later), Aboriginal Australia (denser belts, with an explicit note that the whole continent was inhabited), New Guinea highlands (Kuk), Eurasian steppe (Pontic–Caspian, Kazakh, Transoxianan oases, Mongolia), Pacific islands (Bismarcks → Fiji → Tonga–Samoa → Hawaiʻi → Aotearoa). ✅
- Each has 4 keyframes, unique colour, ≥1 source, no invented `timelineItemIds`. Islands and distant hearths stay separate small regions (no ocean-filling rings). ✅
- Validate: ≥20 presence entities, easy-test years (Yangtze −1000, steppe −3000, Eastern Woodlands 1100, Amazonia 1200, Pacific 1300), ≥15 presence entities active at 500, region span < 15° for island/hearth packs, `spatialEntities.length >= 111`. ✅
- Branch stacks on Day 30 tip (`day-30-timeline-globe-sync` / PR #35). PRs #31–#35 still awaiting merge if not yet on main.

#### Day 32 — Living borders: ocean gaps + eased morph (PR F slice 4) — done

Rings that wrap an inland sea no longer paint the water as territory, and keyframe morphs ease instead of sliding at constant speed.

- **Polygon holes (inner rings):** regions may carry optional `holes` — ids from a new `src/globe-holes.js` catalogue of schematic sea/lake outlines (`SEA_HOLE_RINGS`: western + eastern Mediterranean, Aegean, Black Sea, Caspian, Aral, Persian Gulf, Lake Victoria) or inline `{ id, ring }`. Rendered as GeoJSON `Polygon` inner rings. Schema updated. ✅
- **Winding verified, not guessed:** exteriors stay planar-CW (existing Globe.gl convention); holes are planar-CCW. Checked against d3-geo (which `three-conic-polygon-geometry` uses for bounds/containment): a CCW hole gives `geoArea(outer) − geoArea(hole)` and `geoContains` excludes it; a CW hole would *add* area. turf / earcut paths ignore winding. ✅
- **Only where the outer ring truly wraps the sea:** a hole is kept only if it fits inside its outer ring; templates may shrink toward their centroid (validator requires ≥75% fit) — no hole hangs outside an empire. Placed on: Roman Empire (W. Med −27 / 50; W + E Med 117 / 200 / 395), Byzantine (Aegean + Black Sea 565 / 1025), Ottoman (Aegean 1520 / 1600 / 1800; Aegean + Black Sea 1683), Mongol (Aral 1227; Caspian + Aral 1241 / 1279 / 1300), Russian Central Asia (Aral 1850 / 1914), Classical Greece (Aegean −450 / −350), Turkic peoples (Aral 750 / 1000 / 1200), Bantu peoples east (Lake Victoria 200 / 800 / 1200), Temperate Europe presence (W. Med 0 / 1000), East & Southern Africa presence (Lake Victoria 500 / 1200 / 1700). Skipped where the ring only partly covers the sea (e.g. Roman Black Sea, Arab peoples / Persian Gulf). ✅
- **Holes morph:** matching hole ids lerp (antimeridian-aware) with the outer ring; one-sided holes grow from / shrink to their centroid (e.g. the eastern Mediterranean opens up across 50 → 117 CE). Lifespan fades scale holes about the *outer* centroid so they stay inside; any morphed hole that would poke out is re-fitted or dropped. ✅
- **Eased morph:** keyframe parameter `t` now goes through smoothstep (`easeMorphT`, constant-time) — borders accelerate out of a keyframe and settle into the next. Existing fade-in/out already used smoothstep, so they read the same. ✅
- Validate: templates closed / ≥4 vertices / non-self-intersecting; every authored hole resolves, is CCW, sits inside its outer bbox *and* ring; Roman@117 has both Mediterranean holes (+ d3-geo: Ionian/Balearic seas excluded, Gaul/Anatolia included); mid-morph Roman@158 / 80 / 300 still holed; east-Med hole grows 50→117; sweep −500…1950 every rendered hole valid; easing 0→0, 0.5→0.5, 1→1, monotonic. ✅
- Honesty: hand-drawn coarse coastlines, **not GIS**; islands inside a hole (Sardinia, Corsica, Crete, Cyprus, Balearics) show as unpainted. Branch stacks on Day 31 tip (`day-31-presence-densify` / PR #36). PRs #31–#36 still awaiting merge if not yet on main.

#### Day 26 — Overlap polygon z-fight fix — done

Denser overlays (71 entities) flickered where footprints overlapped — classic coplanar z-fighting between empire meshes (Day 14 only hugged polygons to the globe surface).

- **Stable altitude offsets:** `polygonAltitude(d => …)` from a deterministic hash of `entityId::regionId` — base ~0.0045 + (hash % 48) × 0.00011 so coplanar meshes separate in depth without floating off the globe. Offsets do not jump while scrubbing. ✅
- Softened white `polygonStrokeColor` (0.4 → 0.12) so edges do not shimmer on overlaps. ✅
- Kept Globe.gl colour accessors (no custom DoubleSide MeshBasicMaterial — Day 20 planet-tint bug). Bump map stays off; `polygonsTransitionDuration(0)`. ✅

#### Review feedback round (Arthur, 7 Oct 2026) — Days 34–37

PRs #31–#38 merged to main on 7 Oct 2026 (in order, merge commits). Arthur's review of that stack produced five follow-ups, shipped as stacked PRs (A → B → C → D) because they touch the same globe files:

- **A · Day 34 — real overlap-flicker fix.** ✅ (this PR) — see Day 34 below.
- **B · Day 35 — peoples vs polities visually distinct + "Both" always on + peoples persist to today.** ✅ — see Day 35 below.
- **C · Day 36 — Presence fills the modern globe** (near-complete land cover by ~1900–2025, leaving deserts, tundra, ice sheets and core rainforests sparse). ✅ — see Day 36 below.
- **D · Day 37 — fullscreen globe mode** (`?fullscreen=1`; only the year scrubber + clickable shapes remain; Esc / button to exit). ✅ — see Day 37 below.

#### Day 34 — Overlap flicker: root cause + fix — done

Arthur still saw flicker after Day 26, worst over Mughal India and around the Day 32 sea-gap shapes. Day 26 treated it as an altitude problem; the real causes were in how the meshes were drawn:

- **Altitude steps were below depth precision.** Day 26 steps were 0.00011 globe radii = 0.011 scene units; Globe.gl's camera (near = 0.05) only resolves ~0.05 units at the default view and ~0.2–0.3 zoomed out, so neighbouring slots still z-fought.
- **Translucent caps wrote depth.** Globe.gl's default cap material keeps `depthWrite: true` even when translucent, so whichever overlapping cap drew first punched the other out.
- **Invisible side walls.** `polygonSideColor(() => 'rgba(0,0,0,0)')` is a truthy colour, so every polygon also built transparent side walls that still wrote depth.
- **Draw order flipped with the camera.** Three.js re-sorts translucent meshes by bounding-sphere distance every frame; as the globe turned, overlapping shapes swapped order, so the visible "winner" kept changing.

Fix (globe-view): side colour `null` (no walls); caps use a shared translucent `MeshBasicMaterial` via `polygonCapMaterial` with `depthWrite: false` (same DoubleSide face handling as Globe.gl's default — not a new material type), so overlays depth-test only against the opaque globe; every polygon group gets a stable `renderOrder` (presence → peoples → polities → selected, then a hash slot), so blending order never depends on the camera; layer-aware altitude bands (0.005 / 0.0075 / 0.01) keep picking sensible (polities on top). Features also get a stable `__id` (`entity::region`) so Globe.gl reuses meshes while scrubbing instead of rebuilding them with random ids. `?globeDebug=1` exposes the Globe.gl instance for screenshot QA. ✅

Verified with headless-Chrome renders at several zooms (altitude 0.9–3.0) and tiny camera nudges: Mughal India 1650/1700, Rome 117, Ottomans 1683. Before: blotchy interior patches that change on every nudge (Rome's interior had ~31k changed pixels after erosion for a 0.3% zoom nudge); after: only 1-px edge shifts change (Ottomans 1683: 12k → 11 eroded pixels; Mughal 1650 zoomed out: 11 → 0). Tap-to-select still works (Mughal at 1650). Caveat: where one entity's own regions overlap (e.g. Mughal core + Deccan), the overlap reads slightly darker — stable, not flicker.

#### Day 35 — Peoples vs polities distinct, layers always together, peoples persist — done

Arthur: with "Both" on it wasn't clear which shapes were peoples and which were polities; peoples vanished once big empires took over ("there's more people than ever"); and the Polities / Peoples split felt wrong, so "Both" should just be on all the time.

- **Distinct styling** (globe-view): polities = solid translucent fill + thin solid edge; **peoples = diagonal hatch fill + dashed white edge** (hatch is computed in geographic space in a small `onBeforeCompile` tweak to the Day 34 cap material, anti-aliased, and fades to a flat tint when stripes would go sub-pixel at far zoom); presence = soft wash with no edge. Draw order stays presence → peoples → polities, so empires read on top. ✅
- **Map key** floats over the globe (Polities / Peoples / Presence swatches matching the globe styling); sidebar swatches for peoples are hatched with a dashed border too. ✅
- **Layers always together:** the Both / Polities / Peoples / Presence toggle is removed. Legacy `?layer=…` links open the combined view (and the URL no longer writes `layer=`). The internal filter API stays for validation. ✅
- **Peoples persist to 2025** (`src/globe-people-modern.js`): 19 of 20 peoples get 2–4 more keyframes (1500–1900–2025 range) with honest modern footprints. Most hold steady (Bantu, Polynesian, Inuit, Maya, Nilotic, Aboriginal Australians, Arab, Dravidian, Indo-Aryan incl. Sinhala Lanka). Some grow: Slavs add Siberian settler belts, Sinitic adds Taiwan, Manchuria and the northwest, Turkic adds Azerbaijan, Uyghur and Sakha, Uralic adds Sápmi. Some shrink: Celtic languages retreat to the Gaeltacht, Wales, the Hebrides and western Brittany; the Khoisan to the Kalahari and Namaqualand; the Amazigh to the Atlas, Kabylie and the Tuareg Sahara; Quechua/Aymara to the highlands. The Aral Sea hole is dropped by 2025. Ancestral Puebloans continue as today's Pueblo peoples. **Scythians are not extended** (they genuinely ceased). Descriptions gain a one-line honesty note; overseas diasporas are not drawn. No `timelineItemIds` invented. ✅
- Validate: every continuing people active at 1900 and 2025 with a 2025 keyframe, no century gaps after first appearance, Scythians off in 1900/2025, modern fragments < 55° span, Aral hole kept at 1900 and dropped at 2025, Lake Victoria hole kept at 2025. ✅

#### Day 36 — Presence fills the modern globe — done

Arthur: Presence had the same problem as Peoples. Today the globe should be almost completely full, except sparsely populated deserts, tundra, the poles and big rainforests.

- **Hearths hand off instead of vanishing** (`src/globe-presence-modern.js`): each of the 19 regional hearths holds its last footprint until the modern layer covers it. That's 1700 for Europe, China, the Yangtze, Indus–Ganges and West Africa, 1850 for the Eastern Woodlands, and 1880 for the rest. Presence no longer empties between antiquity and the modern era. ✅
- **Inhabited world (modern)** (the old `global-modern-presence`) grows 1700 → 1850 → **1900 (59 regions) → 2025 (62 regions)** to cover nearly all habitable land. Islands and continents stay separate regions (each < 70° span, no ocean-spanning rings), and Lake Victoria is a hole. Deliberately left sparse: the Sahara, Arabian / Australian interiors, the Gobi / Taklamakan / Tibetan core, Siberian and Canadian tundra and northern taiga, Greenland, Antarctica, core Amazon / Congo / Borneo rainforests, Kalahari / Namib and Atacama. 1900 has thinner frontiers (Prairies, US interior west, Australia, Siberia; no Russian Far East, Top End or Hokkaidō yet). ✅
- **Soft wash:** presence fills drop to ≤ 0.3 opacity (the inhabited-world layer uses a warm `#F2C57C` tint instead of slate, which read as haze at continent scale). Presence draws under peoples and polities and has no edge, so it never drowns them. ✅
- Validate: ≥45 regions at 2025, spans < 70°; d3-geo checks that 38 inhabited cities are covered at 2025 (London … Kinshasa … Auckland) and 14 sparse places are not (central Sahara, Rub' al Khali, Gobi, Taklamakan, Tibet, central Australia, core Amazon / Congo, Greenland, Antarctica, Siberian tundra, Canadian north, Kalahari, Atacama); no hearth gaps century by century; inhabited world active every 25 years 1700–2025. ✅
- Honesty: presence means people live here, not density; hand-drawn coarse rings, not GIS.

#### Day 37 — Full-screen globe — done

Arthur asked for a button that hides most of the UI and makes the globe huge, leaving only the timeline at the bottom to scrub and the shapes to click.

- **Full screen** button (top-right of the globe; icon-only on phones). `body.globe-fullscreen` hides the header, controls and side panel. The globe fills the window; the map key moves top-left; the year scrubber floats at the bottom (desktop keeps the notable-year chips as a single scrollable row, phones show only the slider). ✅
- Shapes stay clickable. In full screen the detail panel becomes a **compact popover**: top-right on desktop, a short sheet above the scrubber on phones. ✅
- **Exit:** the same button, or **Esc** (closes the popover first, then leaves full screen). Switching away from Globe always exits. ✅
- **Deep link** `?fullscreen=1` (implies `view=globe`) is kept in the URL while active and combines with `year` / `entity`. ✅
- CSS-only, no browser Fullscreen API, so it behaves the same on iOS Safari and Esc isn't swallowed by the browser. The globe's ResizeObserver re-fits the canvas. Headless check at 1280×800 and 390×844 (touch): deep link opens full screen, a click or tap on India selects the Mughal Empire, Esc twice closes the popover then exits, and the button toggles both ways. ✅

#### PR F — Living / morphing borders (continued)

Remaining: further mid-keyframes only where morph still looks stiff; optional finer coastline holes (e.g. Red Sea, Baltic, Great Lakes) only where a ring truly wraps them. Ocean gaps (polygon holes) ✅ + eased morph ✅ Day 32. Polity fill ✅; people packs ✅ (Day 27 + Day 28); presence ✅ Day 29 + densify Day 31; timeline↔globe ✅ Day 30 / PR E. Still schematic / honest, not GIS-perfect. PR F is essentially complete — next focus moves to Phase 5 content expansion.

#### Day 30 / PR E — Timeline ↔ globe integration — done

Wire the globe overlays back to the timeline detail panel and shareable URLs.

- Year scrub continues to drive overlays; selection clears when the entity leaves the active year. ✅
- Tapping a globe polygon **or** an overlay-list row opens the detail panel (name, lifespan-ish date line, description, sources). ✅
- **Related on timeline** links resolve real `timelineItemIds` against catalogue items only (empty ids for people/presence → no broken links). Click jumps to that swim-lane item. ✅
- Deep links: `?view=globe&year=117&entity=roman-empire` (+ optional `layer=`); URL updates on select; restore year → layer → entity if active. ✅
- Selected sidebar row + brighter/higher polygon highlight. Soft hint: “Tap a region for details”. ✅
- Branch stacks on Day 29 tip (`day-29-human-presence`). PRs #31–#34 still awaiting merge if not yet on main.

### Long-term globe layers

After the MVP, possible layers include:

- empires and states
- civilizations
- religions
- trade routes
- migrations
- wars and fronts
- language families
- climate and environment
- exploration routes

## Phase 4b — Deep zoom and real borders (Arthur, 8 Oct 2026)

Arthur, in full screen: "a lot closer to Google Maps in the level of definition … go a lot closer and see cities and borders evolve", and "the past 100 years or so should be filled up with nations". This phase does that one daily step at a time.

### Research summary (8 Oct 2026)

**Imagery tiles (Globe.gl `globeTileEngineUrl`, already in our globe.gl 2.46).** Globe.gl can swap the single Blue Marble texture for slippy-map tiles that load as you zoom.

| Source | Key? | Terms that matter | Fit |
| --- | --- | --- | --- |
| **NASA GIBS** Blue Marble Next Generation / shaded relief (EPSG:3857, `GoogleMapsCompatible_Level8`) | No | Free and open; credit "NASA Earth Observatory / NASA GIBS (ESDIS)". Stops at z8 (~600 m/px). | **Best first step.** No labels, no modern borders, nothing to contradict 1925. |
| EOX Sentinel-2 cloudless | No | 2016 mosaic CC BY 4.0; 2018–2025 mosaics CC BY-NC-SA 4.0 (commercial needs an EOX licence); attribution required | Sharper (~10 m). The 2016 CC BY mosaic is the only licence-clean option, so treat it as optional, behind a flag. |
| OpenStreetMap standard tiles | No | Tile usage policy: light use only, no bulk or prefetch, visible "© OpenStreetMap contributors" | No: modern labels and borders, plus policy risk at our traffic. |
| CARTO basemaps | Key required since 25 Sep 2026 | Free: 5M tiles/month non-commercial, 1M commercial; "© OpenStreetMap contributors, © CARTO" | Labelled modern map. Wrong era for history. |
| Esri World Imagery | Key / ArcGIS account | Attribution required; terms limit free use | Good imagery, but key and terms friction. |
| Stadia / MapTiler | Key + domain allowlist | Free tiers with caps; attribution | Fine for a later vector-tile phase, not needed now. |

Rule of thumb: **modern labelled basemaps show today's borders and city names**, which contradict any historical year. Use label-free imagery tiles and draw our own dated borders and cities on top.

**Cities.** Natural Earth populated places (public domain, ~7k places, with population rank) give modern cities and coordinates. They have no founding dates, so dates must be curated (founding year, optional "renamed" periods). A later option is the Reba–Reitsma–Seto historical urban population dataset (SEDAC, 3700 BC–AD 2000), but confirm its licence first. Render as Globe.gl `labelsData` / `pointsData`, filtered by camera altitude (capitals first, then by size), so labels appear as you zoom.

**MapLibre GL JS v5 globe projection.** It is a real vector-tile map on a globe: crisp at street level, with label collision. It would mean replacing Globe.gl (our flicker fix, morphing overlays and peoples hatch would all need rewriting), finding a vector-tile host, and still hiding its modern labels and borders. **Keep Globe.gl for now**; revisit only if we need street-level zoom.

**Polygon level of detail.** Overlays sit 30–64 km above the surface (altitude 0.005–0.01 radii). That is fine from orbit but floats visibly at city zoom, and Globe.gl's camera `near` (0.05) limits how close we can go. Plan: scale overlay altitude with camera distance (keeping the Day 34 band order), lower `controls.minDistance`, and swap polygon detail by zoom (coarse topojson far out, the 10m-derived set close in).

**Historical border datasets (1900–2025) against our ISC licence.**

- **Natural Earth (public domain).** Modern admin-0 / admin-1 only, but any regrouping is ours to ship. ✅ Used.
- **CShapes 2.0** (ETH Zürich / GROWup, 1886–2019, real dates). Licence **CC BY-NC-SA 4.0**: shipping it would make the app's data non-commercial and share-alike. ❌ Not bundled. Fine to read as a reference when checking our dates.
- **aourednik/historical-basemaps.** **GPL-3.0**, snapshot years only (1880, 1900, 1914, 1920, 1938, 1945, 1960, 1994, 2000, 2010 …), uneven accuracy. ❌ Not bundled (copyleft against ISC, and no in-between dates).

**Recommendation.** (1) Real borders from 1914 now, by regrouping Natural Earth's public-domain admin-1 provinces with a hand-written, dated table (Day 38). (2) Make zooming in feel good: altitude LOD and closer camera. (3) Label-free NASA GIBS tiles. (4) A dated cities layer. (5) Finer splits and an earlier start (1815/1880). MapLibre only if street-level zoom becomes a goal. Trade-off: with no licence-clean historical GIS dataset, pre-1945 border changes inside a province are approximate. That is honest and fixable province by province.

### Daily steps

#### Day 38 — Modern nations 1914–2025 (step 1) — done

- **Data:** `src/globe-nations-table.js` is a hand-written table of ~220 nations, colonies, dominions and disputed areas. Each has real start and end years, built from Natural Earth admin-0 / admin-1 units. It covers the post-WWI breakups (Austria-Hungary, the Ottoman and Russian empires → Poland, the Baltics, Czechoslovakia, Yugoslavia, the mandates), the USSR (1922) and its 1939–45 annexations, Manchukuo, Germany's 1938–45 annexations, East/West Germany, Indian partition, decolonisation in Asia and Africa (each colony switching at its real independence year), Vietnam, Yemen, the 1991 Soviet and Yugoslav breakups, Czechoslovakia (1993), Eritrea, South Sudan, Kosovo (partially recognised), and Crimea from 2014 (grey, occupied).
- **Build:** `npm run build:nations` (`scripts/build-nations.mjs`) downloads Natural Earth 10m admin-1 (cached in `.cache/`) and merges provinces with shared TopoJSON arcs, so borders never gap or overlap. It simplifies (Visvalingam, 40 km²) and drops islets under 2,000 km² (unless ≥5% of the state). It writes `src/data/nations.topo.json` (393 KB, ~130 KB gzipped, lazy-loaded after the globe mounts; ~45k vertices per year) and a graph-coloured palette (`src/data/nations-colors.js`). The build fails if two nations claim the same land in any year, or if land over 2,500 km² is left unclaimed.
- **Colours:** each nation keeps one colour across all its years. Neighbours (in any year) never share a colour, and look-alike pairs are avoided. The UK is pink, France blue, Russia/USSR red. **Colonies wear their ruler's colour, paler**, so empires still read as blocs and dissolve into independent colours at real dates.
- **Globe:** a new `nation` altitude/render band, keeping all of Day 34's flicker fix (depthWrite off, no side walls, stable renderOrder). From 1914 the peoples drop just below the nations and fade, so tapping a country picks the nation (peoples stay listed in the sidebar). Borders are crisper (white, 0.62 for states, 0.42 for colonies). **Handoff at 1914:** the hand-drawn empires stop and the nations take over, so nothing is double-painted. Presence also fades in the nations era. The key reads "Nations — colonies paler", and there is a credit line for Natural Earth and NASA Blue Marble.
- **UI:** tap a nation or a row in the new collapsible "Nations and territories" sidebar group to see its name for that year (e.g. "Gold Coast (British)" in 1950, "Ghana" in 1960), status and a dated history. Bookmarks and `?entity=nation-…` deep links work. CE years print as "1925 CE" (no thousands comma). There are new year chips (1925 / 1950 / 1975 / 1995) and captions.
- **Validate:** `scripts/check-nations.js` checks that the topology matches the table, plus 94 city-in-nation checks at real dates (Lviv: Austria-Hungary 1914 → Poland 1925 → USSR 1941 → Ukraine 1995; Shenyang: Manchukuo 1935; Windhoek: South African-run 1975; Simferopol: occupied 2025 …). It also checks that land coverage stays constant (no gaps or overlaps), a mobile vertex budget, no schematic empires from 1914, the breakup/decolonisation dates, neighbour colours, and that `timelineItemIds` only use existing catalogue ids.
- **Honest caveats:** borders are province-level, so some pre-1945 shifts are approximate (Karelia, Sudetenland, Schleswig, the Chaco, South Sakhalin and Danzig aren't split; Spanish Morocco and the 17th-parallel split in Vietnam are province-based). Wartime occupations aren't drawn (annexations and puppet states are). Borders switch by year, they don't morph. Tiny islands are omitted.

#### Day 39 — Zoom closer without floating shapes — done

- **Closer camera:** `controls.minDistance` 120 / 140 (phone) → 106, so you can get to ~380 km above the ground instead of ~1,300 km (altitude 0.06 globe radii, was 0.2). Globe.gl's camera `near` (0.05, ~3 km) is kept: overlays don't write depth and only test against the globe, which still resolves comfortably at this range.
- **Shapes come down to the ground as you zoom in:** Globe.gl applies polygon altitude as a radial scale, so each frame the meshes are rescaled (no geometry rebuild) from their Day 34 band altitude (32–64 km) toward a floor of ~5 km close up (~16.5 km while the finer mesh isn't in). The squeeze keeps the band order (presence < peoples < nations < polities < selected), so stacking and tap-picking never change. The default far view looks the same as before.
- **Root cause of "shapes dipping under the globe":** Globe.gl's cap triangulator left sliver triangles up to ~2,000 km long on the hand-drawn shapes and big countries. Flat triangles that long sag up to ~60 km below the sphere (measured). Some already dipped ~6 km under the globe at the old bands (Bantu, Aboriginal Australian, Arabian peoples), which showed as small bites near their edges. Now hand-drawn rings are densified to ≤ 1° segments, and every cap is refined after Globe.gl builds it. Triangles are split along their longest edge, and new points go back onto the sphere: ≤ 760 km edges far out (≤ 11.5 km sag) and ≤ 380 km close up (≤ 2.9 km sag; swapped in below camera altitude 0.45, out above 0.6). Refinement runs within a per-frame budget, and both meshes are cached.
- **Zoom-aware styling:** borders get up to 45% more opaque close up and fills ~20% lighter, so the land and the lines read through. The peoples hatch keeps roughly the same on-screen stripe spacing at every zoom instead of turning into wide bands. (WebGL draws 1 px lines, so stroke *width* can't change without a line-mesh rewrite; that is out of scope.)
- **`?at=lat,lng,alt`** opens the camera at a point of view (alt in globe radii, clamped 0.06–4), e.g. `?view=globe&year=1960&fullscreen=1&at=46,10,0.1`.
- **Verified (headless, 1280×800 and 390×844):**
  - At every camera altitude from 2.1 down to 0.06, in 117, 1700 and 1960, every visible cap triangle stays above the globe surface: at least 2 km clear close up and 20 km far out. Day 38 was −6 km at its default view.
  - Static frames are pixel-identical (no shimmer) at altitudes 0.06, 0.15 and 0.2.
  - Tapping a nation at close zoom selects it (Switzerland 1960, Croatia 1995 on phone).
  - Triangle count at 1960 is up ~9% at the default view (115k vs 106k).
- **Still to come:** the Blue Marble texture is blurry at the closest zoom (Day 40 tiles fix that), and nation borders are simplified to ~40 km² (Day 42 adds a finer set close up).

#### Day 40 (review A) — Layer toggles and a zoomable year scrubber — done (merged, #45)

Arthur, after #43/#44: "I should be able to toggle on/off Polities/Peoples/Presence in full-screen mode — definitely keep them all on by default" and "scrubbing should be able to zoom in a bit because like the last 100 years a lot moves around".

- **Layer toggles:** the map key on the globe is now three toggle buttons, Polities (it reads "Nations" from 1914), Peoples and Presence. All on by default; tap to hide or show (struck through when off). They work in full screen and the normal globe, on desktop and phone (≥ 32 px touch targets). The state survives leaving and re-entering full screen and goes in the URL as `?hide=peoples,presence` (`nations` is accepted for `polities`). Selecting something on a hidden layer (sidebar row, deep link) switches that layer back on; hiding the selected shape's layer deselects it. Sidebar rows on a hidden layer are dimmed.
- **Tapping peoples and presence after 1914:** with Nations off, peoples and presence come back to full strength and their own band, so they can be tapped on land again (they sit under the nations, dimmed, when Nations are on).
- **Zoomable scrubber:** the slider now shows a time window. Scroll the wheel (or pinch on a phone) on the scrubber to zoom around that point, horizontal trackpad scroll pans, `+` / `−` zoom ×4 around the current year, and `All` resets. A label shows the window ("1881–1960 · 79 yrs") and the tick labels follow it. Steps are always one year (down to a 12-year window). Dragging into either end of a zoomed window pages it along; presets and deep links recentre the window on their year. ←/→ step one year anywhere in globe mode (Shift: ten).
- **Verified (headless, 1280×800 and 390×844 touch):** layer counts per toggle (1960: 176 nations / 69 peoples / 62 presence → 0 nations), tapping central India with Nations off opens "Dravidian peoples", the URL round-trips (`hide=…` with and without full screen), pinch 314 → 55 years without moving the year, wheel zoom, edge paging, arrow keys.

#### Day 40 (review B) — Close-zoom fidelity: NASA GIBS tiles + finer borders (Days 40 and 42 together) — done (merged, #46)

Arthur, on the Day 39 close-up: "at that point the lack of fidelity really stands out".

- **Imagery tiles:** Globe.gl `globeTileEngineUrl` with NASA GIBS `BlueMarble_ShadedRelief` (Blue Marble Next Generation with shaded relief; EPSG:3857, z0–8, no key, no labels, free and open; GIBS sends a 3-day cache header for this layer, the plain BMNG layer sends no-store). At the closest zoom the ground is z8, ~600 m/px, against ~10 km/px for the old 4096×2048 texture (≈16× sharper linear): lakes, ridges and coastline detail now read. The old texture stays as the far view (z2–z4 tiles aren't sharper than it) and as the fallback: tiles switch on the first time the camera comes within altitude 1.0, only after a test tile loads (8 s timeout); they draw below altitude 0.75 (hysteresis to 0.85); the textured globe stays underneath ~13 km lower so a missing or failed tile shows the old texture, not a hole. `?tiles=0` turns tiles off. Credit: "close-up tiles via NASA GIBS" appears once tiles are on.
- **Tile planner guard:** three-slippy-map-globe's first plan after the URL is set sometimes asked for ~200 z7 tiles from the other side of the world (portrait phone viewports, about one load in two, same camera; a fresh engine with the same camera plans 8). The URL callback now refuses tiles well outside the visible cap (empty `data:` URL, no network) and the next frame clears the tile cache and re-plans. Checked: 9 requests instead of 180–270 on a 390×844 phone view. The engine is also re-planned twice a second while tiles show (a deep link opened close up got a strip of tiles off to one side), and its redundant 32k-triangle black backstop sphere is hidden.
- **Finer nation borders (Phase 4b Day 42):** `npm run build:nations` now also writes `src/data/nations-fine.topo.json` (same table and shape indices; Visvalingam 2 km² instead of 40 km², quantised 3× finer, islands down to 100 km², up to 40 parts per shape: 1.7 MB, 568 KB gzipped, ~5× the vertices). It is fetched the first time the camera comes below altitude 0.8 in the nations era. Below altitude 0.35 (out at 0.45), shapes with any part within the visible radius of the view centre swap to their fine geometry; shapes already fine stay fine until they're 1.6× that radius away, and the set is re-checked at most every 350 ms. Coarse geometry everywhere else and whenever zoomed out. `check-nations.js` fails if the fine set is out of sync with the coarse one.
- **Close-up styling:** fills go down to 60% of their opacity at the closest zoom (was 80%), so the sharper ground reads through; borders keep Day 39's crisper strokes.
- **Kept:** the Day 34 flicker fix (static frames pixel-identical at altitudes 0.06–0.15 in 117, 1700, 1960 and 1995), Day 39 surface-hugging (every cap triangle near the view centre ≥ 2.6 km above the globe at altitude 0.06–0.15), the peoples hatch, and tapping (Switzerland 1960 at altitude 0.1, Croatia 1995 on a phone at 0.08).
- **Cost (headless, software GL):** far default view unchanged (no tiles, no fine borders; 115k triangles at 1960). Close up, triangles are about +6k–+10k over Day 39 (Italy 1960 at 0.06: 70k vs 64k; Croatia 1995 on a phone at 0.08: 40k vs 34k), plus 9–30 tile textures (256², ~15 KB each). The first close zoom in the nations era downloads the 568 KB fine set and parses it; swapping in a big fine country (Canada, Russia: ~18–26k vertices) costs one triangulation, which may be a visible hitch on older phones.
- **Still blurry past z8:** GIBS Blue Marble stops at ~600 m/px. Sharper (Sentinel-2 cloudless 2016, CC BY 4.0, ~10 m) would need a flag and a licence check; Natural Earth 10m itself has ~1 km detail, so borders can't get much finer from this source.

#### Dated cities, step 1 — next (planned as Day 41; Day 41 went to Phase 4c group 1, real nations 1815–1914)

~300 cities (capitals and big historical cities) with founding year and dated names (Constantinople → Istanbul 1930, Leningrad 1924–1991, Bombay → Mumbai 1995 …), from Natural Earth places plus curated dates. Labels appear by zoom and rank, and capitals are marked for the year. Validate that dates are inside known ranges and that capitals sit inside their nation in that year.

#### Day 42 — Detail by zoom for nations — shipped early in Day 40 review B

Done together with the GIBS tiles (see Day 40 review B): a 2 km² nations set swapped in near the view centre below altitude 0.35. Still to check on a real mid-range phone: memory and frame time while panning close up.

#### Day 43 — Finer historical splits

Hand-drawn sub-province cut lines (public domain, our own) for the biggest approximations: Karelia 1940/44, Sudetenland 1938, South Sakhalin, Danzig, the Saar, Memel, Hatay, Chaco. Each is a small polygon with real dates, validated like Day 38.

#### Day 44 — Extend nations back to 1880 / 1815

Superseded by Phase 4c step group 1 (real nation borders 1815–1914), built on Day 41 (see Phase 4c).

#### Later — evaluate MapLibre GL globe

Only if street-level zoom becomes a goal. Spike first: rendering parity for overlays, the hatch shader and the flicker fix.

## Phase 4c — A richer, more honest world (Arthur, 8 Oct 2026)

Arthur's next asks, in his order. This phase starts after the Day 40 review PRs (layer toggles and scrubber zoom; close-zoom fidelity) and the remaining Phase 4b steps (Day 41 dated cities, Day 42 finer borders if not already shipped with Day 40, Day 43 finer splits). Each step is sized for one day and ships as its own PR with a preview link; day numbers continue from wherever Phase 4b ends.

### 1. Real nation borders, 1815–1914 (replaces Phase 4b Day 44)

Data rule as Day 38: Natural Earth (public domain) units regrouped by a hand-written, dated table, plus our own hand-drawn cut lines (public domain) where a historical border runs through a modern province. CShapes 2.0 (CC BY-NC-SA) and aourednik/historical-basemaps (GPL-3.0) are references for checking dates only, never bundled. Validation as `check-nations.js`: no overlaps or gaps, city-in-nation checks at real dates, colonies in their ruler's colour.

- **Step 1.1 — 1880–1914.** Scramble for Africa (Berlin Conference 1884–85; colonial lines dated as they were agreed, protectorates vs colonies), late Ottoman decline (Bulgaria 1878/1908, Bosnia 1878/1908, Crete, Libya 1912, the Balkan Wars 1912–13), Korea 1910, Siam's losses. Move the schematic-empire handoff to 1880.
- **Step 1.2 — 1848–1880.** German unification (1864–71, with Alsace-Lorraine), Italian unification (1859–70), US westward expansion (Mexican Cession 1848, Gadsden 1853, Alaska 1867; organised territories paler than states), Canadian Confederation 1867, the Paraguayan War, Meiji Japan.
- **Step 1.3 — 1815–1848.** Congress of Vienna Europe (German Confederation, Austrian Empire, the Two Sicilies), Latin American independence (1810s–1820s: Gran Colombia 1819–31, the Federal Republic of Central America, Brazil 1822, Mexico 1821), Greece 1830, Belgium 1830, Texas 1836. Move the handoff to 1815.
- **Honest limits:** province-level units fit poorly for US territories and inland African colonial lines; those get hand-drawn cuts, flagged as approximate (see group 4).
- **Status: steps 1.1–1.3 done on Day 41 (merged, PR #47).** Hand-drawn cut lines and paler organised US territories are not done yet (follow-up below).

#### Day 41 — Real nation borders 1815–1914 (steps 1.1–1.3 together) — done (merged, PR #47)

- **Data:** new `src/globe-nations-table-1815.js` (223 entities, 473 dated periods, 1815–1914), the same method as Day 38: Natural Earth admin-0 / admin-1 units (public domain) regrouped by a hand-written table of real dates. No CShapes (CC BY-NC-SA) or historical-basemaps (GPL) data is used. Entities that continue past 1914 have their 19th-century periods prepended to the Day 38 table by id, and a period that matches the 1914 one exactly is merged into it (e.g. one "United Kingdom of Great Britain and Ireland" period, 1815–1922). Shared unit groups moved to `src/globe-nations-units.js`. A `steps()` helper writes stepwise growth as deltas (Russia's Central Asian conquests, the British Raj, the Ottoman retreat). New kind **vassal** (autonomous states under a suzerain: Serbia and the Danubian Principalities before 1878, Bulgaria 1878–1908, Egypt before 1882, Tunis, Algiers), drawn paler in the suzerain's colour like colonies.
- **Covered:** Congress of Vienna Europe (Prussia, Bavaria, Württemberg/Baden, Saxony, Hanover, the Hessian and Thuringian states, Mecklenburg, the Hanseatic cities, Lombardy–Venetia, Sardinia, the Papal States, the Two Sicilies, Tuscany, Parma, Modena, Lucca, the Netherlands with Belgium to 1830, Sweden–Norway); German unification (Schleswig-Holstein 1864, Prussia's 1866 annexations, the North German Confederation 1867, the German Empire 1871 with Alsace–Lorraine); Italian unification (1859, 1860–61, Venetia 1866, Rome 1870); the Ottoman retreat (Greece 1830/1864/1881/1913, Serbia, Montenegro and Romania 1878, Bulgaria and Eastern Rumelia 1878/1885/1908, Bosnia 1878, Cyprus 1878, Crete 1898, Libya 1912, the Balkan Wars); Russia in the Caucasus (Erivan 1828, Shamil's Imamate 1834–59, Circassia 1864, Kars 1878) and Central Asia (the Kazakh jüz, Kokand, Tashkent 1865, Bukhara 1868 and Khiva 1873 as protectorates, Fergana 1876, Turkmen lands 1881–84, the Pamirs 1895) and the Amur/Primorye (1858/60) and Alaska sale (1867); Latin American independence (New Spain, New Granada, Peru, Upper Peru and Chile as Spanish colonies; Gran Colombia 1819–31, the Central American Federation 1821–40, Brazil 1822, Uruguay 1828, the War of the Pacific, Argentina's southern conquest, Acre 1903, Panama 1903); US expansion (Florida 1821, Texas 1836/45, Oregon 1846, the Mexican Cession 1848, Alaska 1867, Hawaii 1898); Canada (Rupert's Land, BC, Confederation 1867/1870/1871/1873); South Asia (Company rule growing step by step: the Marathas 1818, Assam/Arakan 1826, Sindh 1843, the Sikh Empire 1846/49, Burma 1852/1886, the Crown Raj 1858); East and Southeast Asia (Qing losses, Yettishar, Tokugawa → Meiji Japan, Ryukyu 1879, Joseon → Korean Empire 1897 → Japanese protectorate 1905 → annexation 1910, Taiwan 1895, Siam's losses 1893/1904/1907/1909, French Indochina 1862–1907, British Malaya and Borneo, the Dutch East Indies); and **the Scramble for Africa** (Sokoto, Bornu, Ashanti, Dahomey, Ségou, Massina, the Toucouleur, Zulu, Gaza, Merina, Buganda, Ethiopia's growth, the Mahdist state; then each colony from its claim year: Congo Free State 1885, German colonies 1884–85, British East Africa 1888, Rhodesia 1890–91, French West and Equatorial Africa, Italian Eritrea and Somalia, the Boer republics and the Union of South Africa 1910).
- **Handoff moved to 1815:** every hand-drawn empire stops at 1815 (each has a nation counterpart via `timelineItemIds`), so nothing is double-painted. Before 1914 land outside any state (inland Africa before the 1880s, Patagonia, the Australian interior before 1829, Hokkaido, Rajasthan 1815–18) is deliberately left empty for the peoples and presence layers, which fade less in that period (presence 60%, peoples 80% instead of 35% / 50%). Drawn coverage: 76% of land in 1815, 82% in 1848, 83% in 1871, 90% in 1885, 99% in 1900, 100% from 1914.
- **Colours:** the colouring now prefers each group's existing colour when it is still valid, so 135 of 194 modern colour groups keep their colour; the rest changed because of new neighbours (e.g. the US now borders Mexico's 1840s lands).
- **UI:** "Borders 1815–2025" credit, new 1815 and 1871 year chips, captions for 1790, 1815, 1848, 1871, 1885, 1900 and 1914, "by 1815" for periods that began earlier, and history lines in the detail panel merge consecutive periods with the same name (e.g. "Until 1914: Russian Empire — Erivan …; Tashkent …").
- **Validate:** the build fails on any overlap in any year 1815–2025; full coverage is still required from 1914. `check-nations.js` adds ~190 city checks at 1815, 1830, 1848, 1861, 1871, 1880, 1885, 1900 and 1913 (Milan: Austria 1815 → Italy 1861; Strasbourg: Germany 1871; Plovdiv: Eastern Rumelia 1880; Samarkand: Bukhara 1815 → Russia 1871; Kumasi: Ashanti 1900 → Gold Coast 1913; San Francisco: Mexico 1815 → USA 1848 …), status checks (Belgrade vassal 1815, Sofia vassal 1880, Seoul state 1900 → colony 1913), creation and end dates, names at real dates, the Scramble (≤ 10 African colonies in 1875, ≥ 30 by 1900), and coverage that only grows before 1914.
- **Kept (headless):** static frames pixel-identical at altitude 0.06–0.15 in 1815, 1871 and 1900; every cap triangle near the view centre ≥ 2 km above the globe close up; GIBS tiles and the fine border swap work in the new years; layer toggles and the 1814 → 1815 handoff checked. Cost: the 1815–1913 globe draws about as much as 1914–2025 (phone, 1885: 844 draw calls vs 895 at 1950). The coarse topology is 476 KB (was 381 KB), the fine set 1.93 MB (was 1.71 MB).
- **Honest caveats:** borders are today's provinces regrouped, so many 19th-century lines are approximate: Baden and Württemberg are one shape, Western Pomerania sits with Mecklenburg, Natal and Zululand are one shape, Colorado counts as Mexican until 1848 and the Gadsden Purchase isn't split, Kazakh and Central Asian conquests move oblast by oblast, Sakhalin 1905, Paraguay's 1870 losses and Bessarabia 1856–78 aren't split. Colonial claims are drawn at roughly their final extent from the claim year, although real control of the interior often came 10–30 years later (noted per colony). Short-lived states and occupations (1848 revolutions, the Taiping, the Peru–Bolivian Confederation, the French in Mexico, the Boer trek republics before 1852) are not drawn. Princely states are drawn inside British India.
- **Follow-up:** hand-drawn cut lines for the worst province misfits (Natal/Zululand, Baden/Württemberg, Gadsden, Sakhalin, inland colonial lines); organised US territories paler than states.

### 2. Country and place labels that get more detailed as you zoom

- **Step 2.1 — Country labels.** Each nation / polity shows its name for the year (e.g. "Gold Coast", then "Ghana") at a stable interior point, sized by area, with collision culling and back-of-globe hiding. Big states only from orbit; small ones appear as you zoom in. Phone budget: ≤ 60 labels on screen.
- **Step 2.2 — Place labels by zoom.** Seas, oceans, mountain ranges, deserts and big rivers from Natural Earth physical labels (public domain), then regions and provinces close up. These stay era-neutral (no modern admin names before they existed).
- **Status: steps 2.1 and 2.2 built together on Day 42 — IN REVIEW (PR #48). Do not start this item again;** the daily ship routine should move on to the next unfinished item (Phase 4b "Dated cities, step 1", which is also the first part of item 3 below). Rivers and province names are left for later (see the follow-up below), not part of this item.

#### Day 42 — Country and place labels by zoom (steps 2.1 + 2.2) — in review (PR #48)

- **What shows:** every state, colony and hand-drawn polity on the globe gets its name for the slider year, and big peoples get an italic label when the nations layer isn't covering them. Biggest countries show from orbit, smaller ones as you zoom in: a label only appears once its country is big enough on screen to hold the text. Close up, era-neutral physical names join in: oceans from orbit, then seas, gulfs and straits, mountain ranges, deserts, plateaus, plains, basins, peninsulas and big islands by Natural Earth rank (1:50m physical labels, public domain; 460 places in `src/data/places.json`, a 10 KB gzipped chunk loaded after the globe).
- **Era-correct names:** the label is the nations table's name for that year, shortened by `src/globe-label-names.js`: "<Title> of" prefixes and notes in brackets are dropped ("Kingdom of Prussia" → Prussia, "Empire of Japan" → Japan), adjective names are kept whole (Ottoman Empire, Russian Empire, German Empire, Austria-Hungary), colonies keep a short ruler tag (Gold Coast (Br.), Algeria (Fr.), Surinam (Neth.)), and ~60 hand overrides cover the rest (United Kingdom, DR Congo, Congo-Léopoldville, FR Yugoslavia, East India Company …). So 1850 shows Prussia, 1871 the German Empire, 1900 Siam and Persia, 1950 Thailand and Iran, 1980 Zaire. `scripts/check-labels.js` (in `npm run validate`) checks these at 7 sample years, that all 759 period names give a short label, that all 532 anchors sit inside their shape, and that places are well-formed.
- **Placement:** each nations shape stores a label anchor at build time (`npm run build:nations`): the pole of inaccessibility of its largest part (the point deepest inside, so Chile, Norway or the Ottoman horseshoe don't get a label in the sea) plus its area. Hand-drawn polities and peoples get the same anchor at runtime (cached). Close up (altitude < 0.85), a country whose anchor is off-screen or under the key is labelled inside its visible part instead (a coarse screen-grid sample), and keeps that spot while you pan.
- **Rules:** greedy collision avoidance by size (labels already shown get a small bonus, so nothing flickers while rotating); labels never overlap each other or the key, credit, full-screen button or full-screen scrubber; hidden near the limb and on the far side of the globe (checked every frame, not just at placement); at most 50 labels on a phone and 110 on a desktop. White text with a dark halo reads over the Blue Marble, GIBS tiles and polygon fills; colonies are slightly lighter, disputed areas italic, seas italic light blue, ranges and deserts sand-coloured. The selected shape's label turns gold.
- **Toggles:** labels follow the polygons actually drawn, so hiding Polities/Nations, Peoples or Presence hides their labels too. A new "Labels" item in the key turns all labels off and on, and `&labels=0` in the URL starts with them off (kept in shared links).
- **Cost (headless, software GL):** one placement pass takes 0.3–4 ms on a desktop, up to ~10 ms close up on an emulated phone with 4× CPU throttling (it runs at most every 120 ms on a desktop, 180 ms on a phone, and only while the camera moves); between passes, labels only move (≤ 0.2 ms per frame). Frame times with labels on and off were within noise. No extra draw calls: labels are HTML over the canvas.
- **Kept (headless):** static frames pixel-identical at altitude 0.06–0.15 (flicker fix), every cap triangle near the view centre ≥ 2 km above the globe close up, GIBS tiles and fine borders at close zoom, layer toggles and the 1814 → 1815 handoff.
- **Honest caveats:** no rivers (Natural Earth's river labels are lines; drawing them needs the river geometry) and no cities yet (dated cities are the next step). Physical names use Natural Earth's English defaults, including contested ones (Persian Gulf, Sea of Japan, South China Sea). Labels sit at one interior point, so a long name can spill over small neighbours, and a long thin country (Chile, Vietnam, Norway) is labelled late or not at all at mid zoom. Off-screen anchors are only corrected close up; further out, a country whose anchor is hidden under the key or past the screen edge has no label until you rotate. Text widths are measured with the page font, so a font that loads late can make the first placement slightly too tight or loose. Hand-drawn polities before 1815 use their overlay names as they are (e.g. "Portuguese Empire" placed on its largest part, Brazil's coast).
- **Follow-up:** river names along the river; capitals and dated cities (item 3); province names close up; a smarter in-view anchor at mid zoom.

### 3. Dated cities and pinned events

Builds on Phase 4b's dated cities step 1 (the first ~300 dated cities).

- **Step 3.1 — More cities, renamed over time.** ~1,000 cities including ancient ones (Ur, Memphis, Babylon, Chang'an, Teotihuacan) with founding years, abandonment, and dated names (Byzantium → Constantinople 330 → Istanbul 1930, Edo → Tokyo 1868, Tenochtitlan → Mexico City). Capitals marked for the year.
- **Step 3.2 — Events pinned to places.** Battles, treaties and other timeline items get coordinates, so they appear on the globe as you scrub past them (fading in a few years before and out a few years after), and tapping one opens its timeline detail. Validate that every pinned event's place exists at that date.
- **Step 3.3 — Event density.** Clustering when zoomed out, filters by topic (wars, science, religion …) that match the timeline's filters.

### 4. Showing uncertainty

- **Step 4.1 — Confidence data.** Each shape (and later each border segment) carries a confidence level: documented, approximate or conjectural, with a short reason. Default by era and source (Day 38 nations "documented", ancient spheres "approximate", most prehistoric peoples "conjectural"); validation makes sure every overlay has one.
- **Step 4.2 — Draw it.** Crisp solid edges where borders are well documented; softer, feathered or dotted edges and a fill that fades out towards the edge where they're guesswork. A key entry explains it, and the detail panel says how sure we are and why.
- **Status: steps 4.1 and 4.2 built together on Day 44 — IN REVIEW (PR #50). Do not start this item again;** the daily ship routine should move on to item 5 (trade routes and migrations). Per-border-segment confidence is left for later (see the follow-up below).

#### Day 44 — Showing uncertainty (steps 4.1 + 4.2) — in review (PR #50)

- **Data (`src/globe-confidence.js`):** every shape the globe draws, in every year, carries `confidence` (documented / approximate / conjectural) and a one-line reason. Defaults by layer, era and source: nations documented ("Natural Earth provinces regrouped by dated treaties"); hand-drawn polities approximate (ancient and medieval: frontier zones, not surveyed borders; 1500–1815: real borders better known than our rough outline), conjectural before 1200 BCE; peoples conjectural before 1500 (prehistoric: inferred from archaeology and language spread; later: outsiders' accounts), approximate after (ethnographic and language maps); presence conjectural before 1500, approximate after. Overrides for 11 polities where the default would overstate or understate what is known (Mesopotamia, Phoenicia, the Olmec, Shang, Great Zimbabwe, the Mississippians, the Toltecs and Ghana are conjectural; Egypt, the Vikings and colonial America approximate). An entity or keyframe can carry its own `confidence: { level, reason }`.
- **Honest nations:** a nations period is approximate where its table note admits it ("… not split out", "claimed …", "interior occupied only in the 1930s"), until the latest year the note mentions (Finland's Karelia caveat stops in 1944), and every African colony claimed 1880–1913 is approximate until 1914 ("claim drawn at roughly its final extent; real control came 10–30 years later"). So 13 of 157 nation shapes are approximate in 1850, 47 of 163 in 1900, 2 of 175 in 1930 and 0 of 186 in 2000. Disputed areas and declared-but-unrecognised states have known lines, so they stay documented.
- **Drawing:** documented keeps the crisp solid edge. Approximate gets a softer edge and a fill that fades towards it (to 30% at the edge); approximate nations get long dashes instead (no fill fade, so neighbours never show gaps). Conjectural gets a dotted edge and a fill that fades out well inside the shape (to 12%). Presence fades less (it is already a faint wash). The fade is a distance-to-edge value per vertex of the refined cap mesh (hand-drawn shapes only, refined to ≤ 4 globe units far out, ≤ 2 close up, looked up in a segment grid), read by the cap shader; its width shrinks as you zoom (like the peoples hatch) and is capped at 60% of a shape's half-width, so thin shapes like the Nile valley never vanish. Dashes and dots now keep their on-screen size as you zoom (peoples' dashes too).
- **Key and panel:** a new "Certainty" item in the key ("solid sure · soft rough · dotted guess") turns the styling off and on; `&certainty=0` in the URL starts with it off (kept in shared links). The detail panel has a "How sure" line (badge, reason, how it's drawn) for every polity, people, presence and nation, and the overlay list shows each shape's level instead of the old drawing-detail word.
- **Validate:** `scripts/check-confidence.js` (in `npm run validate`) checks every hand-drawn shape every 10 years plus each keyframe (47k shape-years), every nations period before and after 1914, every feature the globe builds at 10 sample years, the overrides, and expected levels at real dates (Rome 117 approximate, Mesopotamia −2300 conjectural, Celts −300 conjectural / 1900 approximate, Germany 1950 documented, Finland 1930 approximate / 1950 documented, North Vietnam 1960 approximate, ≥ 10 approximate African claims in 1900 and none in 1925, ≥ 90% of nations documented in 2000).
- **Cost (headless, software GL):** feathered caps have ~2× the triangles (117 CE desktop view: 50k vs 26k); scrubbing 40 steps costs ~15–20% more time per step (desktop 89 vs 75 ms, phone 4× throttled 151 vs 130 ms in 300 BCE–300 CE), and a few one-off shader compiles when a new style first appears (the worst single frame went from ~100 to ~200–280 ms once). With `&certainty=0` it is back to the old numbers.
- **Kept:** the phone full-screen credit moved above the scrubber (the key wraps to two rows now; same change as PR #49, so the two merge cleanly).
- **Honest caveats:** confidence is per shape, not per border segment, so a state with one well-known coast and one guessed frontier gets one level. The defaults are by era and layer; only 11 polities have hand-written reasons. The fade follows the shape's own edge, including coasts, so a conjectural coastal people fades at the sea too.
- **Follow-up:** per-segment confidence (coasts and rivers documented, steppe frontiers guessed); hand-written reasons for the biggest empires; a short "how sure" note in the timeline's own detail panel.

### 5. Movement: trade routes and migrations

- **Step 5.1 — Trade routes.** Dated route lines with animated flow along them: the Silk Roads, Indian Ocean monsoon trade, trans-Saharan caravans, the Amber Road, the Hanseatic League, the Manila galleons and the Atlantic triangle. Each route has its own active years and a "Flows" toggle in the key.
- **Step 5.2 — Migrations.** Major migrations as flows over time: out of Africa (schematic), the Bantu expansion, the Austronesian voyages, Indo-European spread, the Migration Period, the Atlantic slave trade, 19th-century European emigration, the 1947 Partition. Width hints at scale; each has sources and an uncertainty level.

### 6. Better coverage between empires

- **Step 6.1 — The early medieval world (500–1000).** Merovingian and Carolingian Francia, Anglo-Saxon kingdoms, the Visigoths, the Avars, the Khazars, the Göktürks and Uyghurs, Tang neighbours (Tibetan Empire, Nanzhao, Silla), Srivijaya.
- **Step 6.2 — Inland Africa.** Kanem–Bornu, Kongo, Great Zimbabwe and Mutapa, Luba and Lunda, Oyo, Benin, Asante, the Sokoto Caliphate, Buganda, and Ethiopia over time.
- **Step 6.3 — Southeast Asia.** Funan, Champa, the Khmer Empire, Pagan, Majapahit, Ayutthaya, Đại Việt, Malacca, Mataram.
- **Step 6.4 — Native American nations after 1500.** The Haudenosaunee, Cherokee, Muscogee, Powhatan, Lakota and Comanche, the Mapuche and others, with dated territories, removals (1830s) and reservations. Sourced carefully, with tribal nations' own histories where available and uncertainty shown honestly.

### 7. Space background

Arthur: replace the plain background with a starfield and space scene.

- **Step 7.1 — Stars and the Milky Way.** A celestial sphere behind the globe: stars from the Yale Bright Star Catalogue (~9,100 naked-eye stars; generally treated as public domain, confirm before bundling) or HYG (CC BY-SA, so only if we accept share-alike for that data file), sized and tinted by magnitude and colour index, plus a Milky Way band from a public-domain NASA sky map (e.g. NASA SVS Deep Star Maps). Aligned to the celestial sphere (Earth's axis = the celestial pole), so the sky rotates consistently as you spin the globe.
- **Step 7.2 — Constellations.** Constellation lines and names in roughly correct positions, from a public-domain / CC0 source where one exists (otherwise a permissive one such as d3-celestial's BSD-3 data, checked against our ISC licence), with a toggle. Optional: precession by year, so the pole star is Thuban around 3000 BCE and Polaris today.
- **Phone budget:** one point cloud and one texture; no per-frame CPU work.

## Phase 5 — Content expansion

Expand content after the navigation and data foundations are stronger.

### 12. Country coverage

Move toward comprehensive country coverage, but only with validation in place.

Goals:

- consistent data shape
- good coverage across regions, not only Europe/US
- major political, cultural, scientific, economic, and conflict events
- sources for contentious or modern claims

**Country pack 1 — Day 33 ✅.** Added Peru, Ghana, Kenya, Morocco, Iraq, and the Philippines (32 → 38 countries; 42 new items, every item sourced, 73 source links checked). Picks fill thin regions: Andean South America, West and East Africa, the Maghreb, Mesopotamia, and island Southeast Asia. Globe links kept in sync: Inca → Peru, Abbasid → Iraq, Mesopotamia → Iraq (Sumer/Akkad, Babylon/Assyria), Parthian → Iraq. Related-on-timeline links now resolve country items even before that country has been opened. Next country packs: Central Asia, Caribbean/Central America, Central Africa, Southeast Europe, and more South Asia.

### 13. Topic packs

Potential topic packs:

- Climate history
- Medicine and disease
- Law and political systems
- Language and writing systems
- Food and agriculture
- Exploration and migration
- Space exploration
- Computing and AI
- Energy transitions

### 14. Richer modern history

The 1900–present period could become much deeper:

- World Wars
- Cold War
- decolonization
- globalization
- internet
- climate change
- pandemics
- AI
- modern geopolitics

## Phase 6 — Product polish and accessibility

### 15. Visual polish

Make the project feel like a polished interactive atlas.

- clearer visual hierarchy
- refined event cards
- better empty/loading states
- improved typography and spacing
- more intentional color system

### 16. Performance

As datasets grow, optimize rendering and interaction.

- memoized swim-lane layouts
- indexed hit-testing
- lazy-loaded view data
- reduced label density on small screens
- profiling for mobile devices

### 17. Accessibility

Canvas-heavy interfaces need a semantic layer.

- keyboard navigation
- screen-reader-accessible event lists
- detail panels with proper focus management
- reduced-motion options
- high-contrast improvements

### 18. PWA/offline support

Make the app installable and usable offline.

- service worker
- app manifest
- offline dataset caching
- home-screen icon

## Suggested next PRs

A sensible near-term sequence:

1. Search current view.
2. Active view label and country context improvements.
3. Data validation script and CI check.
4. Sources/citations field and detail-panel display.
5. Filters for swim-lane categories. ✅ Day 7
6. Compare mode. ✅ Day 8
7. Bookmarks and saved trails. ✅ Day 9
8. Globe view shell. ✅ Day 10
9. Interactive globe prototype. ✅ Day 11
10. Historical overlay data model (PR C). ✅ Day 12
11. First historical overlays on the globe (PR D). ✅ Day 13
12. Overlay polish — z-fight fix + denser empires (Day 14). ✅
13. Overlay UI polish — unique colors + layout split (Day 15). ✅
14. Overlays sidebar cleanup — caption/borders stack (Day 16). ✅
15. Denser globe overlays — ancient + colonial pass (Day 17). ✅
16. Clamp globe overlay lifespans (Day 18). ✅
17. Early Bronze Age globe fill — 3000–1200 BCE (Day 19). ✅
18. Living borders — morph between overlay keyframes (Day 20 / PR F slice 1). ✅
19. Living borders polish — denser non-rect keyframes + softer edges (Day 21 / PR F slice 2). ✅
20. Living borders — fragment/split distant colonies (Day 22 / PR F slice 3). ✅
21. Denser overlay coverage — Aztec/Inca rise + thin empires (Day 23). ✅
22. Densify remaining 2-keyframe globe overlays (Day 24 / PR F densify backlog). ✅
23. Globe overlays for remaining timeline civilisations (Day 25 — polity gap closed). ✅
24. Overlap polygon z-fight fix — stable altitude offsets (Day 26). ✅
25. People packs (human-atlas layer 2) — first pack + layer toggle (Day 27). ✅
26. People pack 2 — global ethnolinguistic coverage (Day 28). ✅
27. Human presence layer (human-atlas layer 3) — first inhabited-footprint slice (Day 29). ✅
28. Presence densify / more hearths — presence pack 2 (Day 31). ✅
29. Timeline ↔ globe integration (PR E) — Day 30. ✅
30. Further living-border / topology polish — ocean gaps (polygon holes) + eased morph (Day 32 / PR F slice 4). ✅
31. Phase 5 content expansion — country pack 1 (Peru, Ghana, Kenya, Morocco, Iraq, Philippines; 32 → 38 countries; globe links synced) — Day 33. ✅
32. Review feedback round (Arthur, 7 Oct): A flicker root-cause fix (Day 34) ✅; B peoples vs polities distinct + Both always + peoples persist (Day 35) ✅; C presence fills modern globe (Day 36) ✅; D fullscreen globe mode (Day 37) ✅. All four in review as stacked PRs.
33. Phase 4b (Arthur, 8 Oct: deep zoom + real borders) — Day 38 modern nations 1914–2025 ✅ (merged) → Day 39 zoom closer without floating shapes ✅ (merged) → Day 40 review A: layer toggles + zoomable scrubber ✅ (merged) → Day 40 review B: NASA GIBS tiles + Day 42 finer borders ✅ (merged) → dated cities → Day 43 finer splits.
34. Phase 4c (Arthur, 8 Oct) — real nations 1815–1914 (Day 41) ✅ (merged, #47) → labels by zoom (Day 42, in review, #48) → dated cities + pinned events → showing uncertainty → trade routes and migrations → coverage between empires → space background (stars, Milky Way, constellations).
35. Phase 5 continued — topic pack 1 (item 13, e.g. Medicine & disease or Climate history) or country pack 2, alternating; keep globe-entity links in sync; only revisit topology if a review spots stiff morphs.

The globe is the exciting flagship, but search, deep links, validation, and sources make it much easier to build without turning the project into a beautiful historical junk drawer.
