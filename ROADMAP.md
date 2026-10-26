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
/?view=technology&id=internet-web
/?view=country:us&id=civil-war
/?view=civilisations&year=117
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

#### Dated cities, step 1 — built on Day 43 together with Phase 4c item 3 (done, merged PR #49)

Built as part of Phase 4c item 3 (see Day 43 there): 523 dated cities with renames, by zoom and rank. Capital markers and the capital-inside-its-nation check are not done yet (follow-up in Phase 4c item 3). Original plan: ~300 cities (capitals and big historical cities) with founding year and dated names (Constantinople → Istanbul 1930, Leningrad 1924–1991, Bombay → Mumbai 1995 …), from Natural Earth places plus curated dates. Labels appear by zoom and rank, and capitals are marked for the year. Validate that dates are inside known ranges and that capitals sit inside their nation in that year.

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
- **Status: steps 2.1 and 2.2 done on Day 42 (merged, PR #48).** Rivers and province names are left for later (see the follow-up below), not part of this item.

#### Day 42 — Country and place labels by zoom (steps 2.1 + 2.2) — done (merged, PR #48)

- **What shows:** every state, colony and hand-drawn polity on the globe gets its name for the slider year, and big peoples get an italic label when the nations layer isn't covering them. Biggest countries show from orbit, smaller ones as you zoom in: a label only appears once its country is big enough on screen to hold the text. Close up, era-neutral physical names join in: oceans from orbit, then seas, gulfs and straits, mountain ranges, deserts, plateaus, plains, basins, peninsulas and big islands by Natural Earth rank (1:50m physical labels, public domain; 460 places in `src/data/places.json`, a 10 KB gzipped chunk loaded after the globe).
- **Era-correct names:** the label is the nations table's name for that year, shortened by `src/globe-label-names.js`: "<Title> of" prefixes and notes in brackets are dropped ("Kingdom of Prussia" → Prussia, "Empire of Japan" → Japan), adjective names are kept whole (Ottoman Empire, Russian Empire, German Empire, Austria-Hungary), colonies keep a short ruler tag (Gold Coast (Br.), Algeria (Fr.), Surinam (Neth.)), and ~60 hand overrides cover the rest (United Kingdom, DR Congo, Congo-Léopoldville, FR Yugoslavia, East India Company …). So 1850 shows Prussia, 1871 the German Empire, 1900 Siam and Persia, 1950 Thailand and Iran, 1980 Zaire. `scripts/check-labels.js` (in `npm run validate`) checks these at 7 sample years, that all 759 period names give a short label, that all 532 anchors sit inside their shape, and that places are well-formed.
- **Placement:** each nations shape stores a label anchor at build time (`npm run build:nations`): the pole of inaccessibility of its largest part (the point deepest inside, so Chile, Norway or the Ottoman horseshoe don't get a label in the sea) plus its area. Hand-drawn polities and peoples get the same anchor at runtime (cached). Close up (altitude < 0.85), a country whose anchor is off-screen or under the key is labelled inside its visible part instead (a coarse screen-grid sample), and keeps that spot while you pan.
- **Rules:** greedy collision avoidance by size (labels already shown get a small bonus, so nothing flickers while rotating); labels never overlap each other or the key, credit, full-screen button or full-screen scrubber; hidden near the limb and on the far side of the globe (checked every frame, not just at placement); at most 50 labels on a phone and 110 on a desktop. White text with a dark halo reads over the Blue Marble, GIBS tiles and polygon fills; colonies are slightly lighter, disputed areas italic, seas italic light blue, ranges and deserts sand-coloured. The selected shape's label turns gold.
- **Toggles:** labels follow the polygons actually drawn, so hiding Polities/Nations, Peoples or Presence hides their labels too. A new "Labels" item in the key turns all labels off and on, and `&labels=0` in the URL starts with them off (kept in shared links).
- **Cost (headless, software GL):** one placement pass takes 0.3–4 ms on a desktop, up to ~10 ms close up on an emulated phone with 4× CPU throttling (it runs at most every 120 ms on a desktop, 180 ms on a phone, and only while the camera moves); between passes, labels only move (≤ 0.2 ms per frame). Frame times with labels on and off were within noise. No extra draw calls: labels are HTML over the canvas.
- **Kept (headless):** static frames pixel-identical at altitude 0.06–0.15 (flicker fix), every cap triangle near the view centre ≥ 2 km above the globe close up, GIBS tiles and fine borders at close zoom, layer toggles and the 1814 → 1815 handoff.
- **Honest caveats:** no rivers (Natural Earth's river labels are lines; drawing them needs the river geometry) and no cities yet (dated cities are the next step). Physical names use Natural Earth's English defaults, including contested ones (Persian Gulf, Sea of Japan, South China Sea). Labels sit at one interior point, so a long name can spill over small neighbours, and a long thin country (Chile, Vietnam, Norway) is labelled late or not at all at mid zoom. Off-screen anchors are only corrected close up; further out, a country whose anchor is hidden under the key or past the screen edge has no label until you rotate. Text widths are measured with the page font, so a font that loads late can make the first placement slightly too tight or loose. Hand-drawn polities before 1815 use their overlay names as they are (e.g. "Portuguese Empire" placed on its largest part, Brazil's coast).
- **Follow-up:** river names along the river; capitals and dated cities (item 3); province names close up; a smarter in-view anchor at mid zoom.
- **After merge (Day 43 check):** deployed and live. A deep link once seemed to open at the default 117 CE instead of its `year=` while the PR was in review; 0 of 10 fresh live loads (5 links × desktop/phone) reproduced it after the merge (the deep link is applied synchronously at start-up, so it was most likely a half-rebuilt local `dist/` during that test). Watch for it; no fix needed unless it comes back.

### 3. Dated cities and pinned events

Builds on Phase 4b's dated cities step 1 (the first ~300 dated cities).

- **Step 3.1 — More cities, renamed over time.** ~1,000 cities including ancient ones (Ur, Memphis, Babylon, Chang'an, Teotihuacan) with founding years, abandonment, and dated names (Byzantium → Constantinople 330 → Istanbul 1930, Edo → Tokyo 1868, Tenochtitlan → Mexico City). Capitals marked for the year.
- **Step 3.2 — Events pinned to places.** Battles, treaties and other timeline items get coordinates, so they appear on the globe as you scrub past them (fading in a few years before and out a few years after), and tapping one opens its timeline detail. Validate that every pinned event's place exists at that date.
- **Step 3.3 — Event density.** Clustering when zoomed out, filters by topic (wars, science, religion …) that match the timeline's filters.
- **Status: steps 3.1 (first 523 cities) and 3.2 done on Day 43 (merged, PR #49).** Still open inside this item, for later: capital markers, the ~1,000-city target, and step 3.3 (clustering and topic filters).

#### Day 43 — Dated cities and events pinned to places (steps 3.1 + 3.2) — done (merged, PR #49)

- **Cities:** new `src/globe-cities.js`, a hand-curated table (our own work, public domain) of 523 cities from Eridu and Uruk to Brasília and Canberra: position, founding year (approximate for ancient towns), abandonment year where they were deserted (Ur, Babylon, Teotihuacan, Angkor, Cahokia, Karakorum, Vijayanagara …), the English name at each date (219 renames: Byzantium → Constantinople 330 → Istanbul 1930, Eboracum → Eoforwic → Jórvík → York, Tenochtitlan → Mexico City 1521, Edo → Tokyo 1868, St Petersburg → Petrograd 1914 → Leningrad 1924 → St Petersburg 1991, Bombay → Mumbai 1995, New Amsterdam → New York 1664, Batavia → Jakarta 1942, Saigon → Ho Chi Minh City 1976, Ji → Zhongdu → Dadu → Beiping → Beijing, Königsberg, Breslau, Lemberg, Agram and Brünn before 1918/45 …) and an importance rank 1–4 that can change over time (Edo becomes a world city around 1700, New York in 1850, Shanghai in 1900, Baghdad drops after 1258).
- **On the globe:** a dot and the name the city had in the slider year, placed by the Day 42 label system (same collision rules, never over the key or off-screen). Rank-1 cities show from orbit, rank 2 from altitude 1.6, rank 3 from 0.9 and towns from 0.5; from orbit country names win, close up cities do. State names still win, except close up, where a world city (Edo, Paris) goes first and the country name moves one line or into its visible part instead of disappearing. A city whose name is already a state label (Singapore, Venice) shows only the state's. Cities and pins are a lazy ~25 KB (gzipped) chunk. On phones in full screen the credit moved above the scrubber, since the key now wraps to two rows.
- **Event pins:** new `src/globe-event-pins.js`, 396 pins for 246 existing timeline entries: the world events list (Great Pyramid at Giza, Magna Carta at Runnymede, Gutenberg in Mainz, the Bastille …), battles and turning points from the wars view (Marathon, Cannae, Hastings, Agincourt, Waterloo, Gettysburg, the Somme, Stalingrad, D-Day …), foundings, capitals and falls from the civilisations view, and science, technology, religion, philosophy, art and economics moments (Mendel in Brünn, Benz in Mannheim, Obninsk, Bretton Woods …). No new text: tapping a pin opens that entry's detail panel, titled with the pin ("Battle of Waterloo"), dated with the place and year, and linked to the entry on its timeline. Pins show near the slider year: ±300 years before 1000 BCE, ±100 to 0, ±50 to 1000, ±30 to 1500, ±20 to 1800, ±10 to 1900 and ±5 after; pins further from the year are dimmer. A pin floats above its place on a stem, or hangs below it when the space above is taken, so the city name underneath stays readable.
- **Toggles:** two new key items, "Cities" and "Events", and `&cities=0` / `&events=0` in the URL (kept in shared links). Labels, Cities and Events switch independently.
- **Validation:** `scripts/check-cities.js` (in `npm run validate`): ids unique, renames in date order inside each city's lifetime, ranks valid, 37 era samples (Istanbul 330/1453/1930, Tokyo 1850/1870, Mexico City 1500/1600, Leningrad 1925, Bombay 1990 …), every city and land pin on land (inside or within ~25 km of a Natural Earth shape; 2 tiny islands flagged by hand), every pin's timeline entry exists and its year sits inside that entry's dates (±30 years; world events ±15). When the Natural Earth populated places file is in `.cache/`, it also checks that 392 living cities lie within 40 km of Natural Earth's point (all do).
- **Kept:** labels, layer toggles, tiles, fine borders, the flicker fix and close zoom unchanged (checked headless). Phone with 4× CPU throttling: frame time within noise of the live site; the placement pass peaks around 21–35 ms close up (vs 20–28 ms live) and still runs at most every 180 ms, only while the camera moves.
- **Honest caveats:** founding years for ancient cities are approximate (the first date a named town is attested) and one point marks a city for its whole history (Delhi's seven cities, moving harbours); names are the usual English ones, not every local form (Kyiv only from 1991, Kolkata from 2001). No capitals marked yet. Pins are one place per moment: wars and movements spread over a region get their best-known site (the Black Death at Caffa, the Industrial Revolution at Cromford). The pin list leans towards Europe and the Mediterranean because the timeline entries do.

### 4. Showing uncertainty

- **Step 4.1 — Confidence data.** Each shape (and later each border segment) carries a confidence level: documented, approximate or conjectural, with a short reason. Default by era and source (Day 38 nations "documented", ancient spheres "approximate", most prehistoric peoples "conjectural"); validation makes sure every overlay has one.
- **Step 4.2 — Draw it.** Crisp solid edges where borders are well documented; softer, feathered or dotted edges and a fill that fades out towards the edge where they're guesswork. A key entry explains it, and the detail panel says how sure we are and why.
- **Status: steps 4.1 and 4.2 done on Day 44 (merged, PR #50).** The data-architecture PR (#57) is merged and item 5 is built: **step 5.1 (trade routes) is done (merged, PR #59, Day 53) and step 5.2 (migrations) is done (merged, PR #61, Day 55), the Greek world (Day 56) is in review (PR #62) and step 6.1 the early medieval world (Day 57) is in review (PR #63); steps 6.1–6.3 are merged (early medieval #63/#64, inland Africa #68, Southeast Asia #69); step 6.4 Native American nations after 1500 is done-in-PR (Day 60); step 7.1 stars/Milky Way is done (Day 61); step 7.2 constellations is done-in-PR (Day 62); steps 7.2 constellations and 8.1 lidar hidden-cities pins are merged (#76, #77, 17 Oct) and PR #72 coast spill is merged; step 8.2 honest shape updates is done-in-PR (Day 64); Phase 5 country packs covering both views have started: pack 1 globe backfill, Peru, is done-in-PR (Day 65), Ghana is done-in-PR (Day 66) Morocco (Day 68) is merged (#82), Kenya is done-in-PR (Day 69), Iraq is done-in-PR (Day 70) and the Philippines is done-in-PR (Day 71), so the pack 1 globe backfill is complete pending the merges of #83, #84 and #85; next Central Asia (pack 2)** — the aesthetics (#53), full-screen globe (#54), load-speed (#55) and tip-jar (#58) reviews are all merged. Per-border-segment confidence is left for later (see the follow-up below).

#### Day 44 — Showing uncertainty (steps 4.1 + 4.2) — done (merged, PR #50)

- **Data (`src/globe-confidence.js`):** every shape the globe draws, in every year, carries `confidence` (documented / approximate / conjectural) and a one-line reason. Defaults by layer, era and source: nations documented ("Natural Earth provinces regrouped by dated treaties"); hand-drawn polities approximate (ancient and medieval: frontier zones, not surveyed borders; 1500–1815: real borders better known than our rough outline), conjectural before 1200 BCE; peoples conjectural before 1500 (prehistoric: inferred from archaeology and language spread; later: outsiders' accounts), approximate after (ethnographic and language maps); presence conjectural before 1500, approximate after. Overrides for 11 polities where the default would overstate or understate what is known (Mesopotamia, Phoenicia, the Olmec, Shang, Great Zimbabwe, the Mississippians, the Toltecs and Ghana are conjectural; Egypt, the Vikings and colonial America approximate). An entity or keyframe can carry its own `confidence: { level, reason }`.
- **Honest nations:** a nations period is approximate where its table note admits it ("… not split out", "claimed …", "interior occupied only in the 1930s"), until the latest year the note mentions (Finland's Karelia caveat stops in 1944), and every African colony claimed 1880–1913 is approximate until 1914 ("claim drawn at roughly its final extent; real control came 10–30 years later"). So 13 of 157 nation shapes are approximate in 1850, 47 of 163 in 1900, 2 of 175 in 1930 and 0 of 186 in 2000. Disputed areas and declared-but-unrecognised states have known lines, so they stay documented.
- **Drawing:** documented keeps the crisp solid edge. Approximate gets a softer edge and a fill that fades towards it (to 30% at the edge); approximate nations get long dashes instead (no fill fade, so neighbours never show gaps). Conjectural gets a dotted edge and a fill that fades out well inside the shape (to 12%). Presence fades less (it is already a faint wash). The fade is a distance-to-edge value per vertex of the refined cap mesh (hand-drawn shapes only, refined to ≤ 4 globe units far out, ≤ 2 close up, looked up in a segment grid), read by the cap shader; its width shrinks as you zoom (like the peoples hatch) and is capped at 60% of a shape's half-width, so thin shapes like the Nile valley never vanish. Dashes and dots now keep their on-screen size as you zoom (peoples' dashes too).
- **Key and panel:** a new "Certainty" item in the key ("solid sure · soft rough · dotted guess") turns the styling off and on; `&certainty=0` in the URL starts with it off (kept in shared links). The detail panel has a "How sure" line (badge, reason, how it's drawn) for every polity, people, presence and nation, and the overlay list shows each shape's level instead of the old drawing-detail word.
- **Validate:** `scripts/check-confidence.js` (in `npm run validate`) checks every hand-drawn shape every 10 years plus each keyframe (47k shape-years), every nations period before and after 1914, every feature the globe builds at 10 sample years, the overrides, and expected levels at real dates (Rome 117 approximate, Mesopotamia −2300 conjectural, Celts −300 conjectural / 1900 approximate, Germany 1950 documented, Finland 1930 approximate / 1950 documented, North Vietnam 1960 approximate, ≥ 10 approximate African claims in 1900 and none in 1925, ≥ 90% of nations documented in 2000).
- **Cost (headless, software GL):** feathered caps have ~2× the triangles (117 CE desktop view: 50k vs 26k); scrubbing 40 steps costs ~15–20% more time per step (desktop 89 vs 75 ms, phone 4× throttled 151 vs 130 ms in 300 BCE–300 CE), and a few one-off shader compiles when a new style first appears (the worst single frame went from ~100 to ~200–280 ms once). With `&certainty=0` it is back to the old numbers.
- **Kept:** the phone full-screen credit moved above the scrubber (the key wraps to two rows now; same change as PR #49, so the two merge cleanly).
- **Honest caveats:** confidence is per shape, not per border segment, so a state with one well-known coast and one guessed frontier gets one level. The defaults are by era and layer; only 11 polities have hand-written reasons. The fade follows the shape's own edge, including coasts, so a conjectural coastal people fades at the sea too.
- **Follow-up:** per-segment confidence (coasts and rivers documented, steppe frontiers guessed); hand-written reasons for the biggest empires; a short "how sure" note in the timeline's own detail panel.

### Aesthetics refresh + Timeline/Globe switch (Arthur, 9 Oct 2026) — done (merged, PR #53)

> "Before continuing with the roadmap I want us to improve the aesthetics, and I want Globe mode to be a button that we switch between right at the start … I don't like the current font and Purple title … more of a colour and branding thing and font sizes."

- **Status: Day 47 — done (merged, PR #53, 9 Oct).** Review round: Cormorant Garamond → Manrope 800 headings, readability pass, palette alternatives removed (Day 47b); gradient-title descender clipping fixed (Day 47c).
- Built: Timeline / Globe segmented switch top-left (desktop + phone; hidden in full-screen globe; `view=` deep links unchanged; topic + country timelines still in the view select, "Timeline" returns to the last one). "Gilded Night" identity: ink-navy space background, warm gold brand, Manrope throughout (bold 800 title-case wordmark and headings; Cormorant Garamond dropped on review as hard to read); gold mark (globe + timeline line + star) and favicon; design tokens (type scale, spacing, radii, colours) at the top of `src/style.css`, canvas reads them via `src/theme.js`; parchment light theme; new og-image + theme-color.  Arthur picked the gold palette (alternatives removed); readability pass: larger detail/panel text (16px), chips, key, scrubber ticks and canvas axis labels, brighter secondary text.
### Globe opens full screen by default (Arthur, 9 Oct 2026) — done (merged, PR #54)

- **Status: Day 48 — done (merged, PR #54, 9 Oct).**
- Built: every entry into the globe (the Timeline/Globe switch, the view select, `?view=globe` deep links) opens the full-screen globe. "Exit full screen" (labelled on phones too) or Esc gives the windowed layout with the side panel; Esc closes an open popover first. URL: full screen is the default and is no longer written; `fullscreen=0` forces windowed (shared links keep it); old `fullscreen=1` links still work. In full screen a compact Timeline | Globe pill sits top-left (the header stays hidden), so you can always get back to the timeline; the key moves just below it. Feedback, layer/label toggles and the scrubber are unchanged.
### Data architecture: static data files (Arthur, 10 Oct 2026) — done (merged, PR #57)
- Arthur: "keep it purely static data … store it as efficiently as possible (without over-engineering) on GitHub. If we get users later, a DB for accounts." and "make sure this is actually a saving".
- Built (the simplest version that captures most of the saving): country timelines moved to `data/countries/<id>.json` (one file each, loaded when opened; data identical, checked by deep-equal on every file); all globe code + content moved into one lazy chunk (`src/globe-app.js`). One small script (`scripts/build-data.mjs`) writes the country list. No new dependencies.
- Measured: main bundle 295 → 114 KB gz; timeline landing 336 → 158 KB; phone timeline ready 2.4 → 1.4 s; globe 1565 → 1488 KB (desktop), interactive 5.1 → 3.8 s. Details + "how to add data": [docs/DATA.md](docs/DATA.md). **All future data follows that guide.**
- Possible follow-up (not started): topic views as lazy files (landing JS ~114 → ~50 KB gz).
- Merged 10 Oct; all new data (trade routes onwards) follows docs/DATA.md.

### 5. Movement: trade routes and migrations — built (step 5.1 merged, PR #59; step 5.2 in review, PR #61)

- **Step 5.1 — Trade routes.** Dated route lines with animated flow along them: the Silk Roads, Indian Ocean monsoon trade, trans-Saharan caravans, the Amber Road, the Hanseatic League, the Manila galleons and the Atlantic triangle. Each route has its own active years and a "Flows" toggle in the key.
- **Step 5.2 — Migrations.** Major migrations as flows over time: out of Africa (schematic), the Bantu expansion, the Austronesian voyages, Indo-European spread, the Migration Period, the Atlantic slave trade, 19th-century European emigration, the 1947 Partition. Width hints at scale; each has sources and an uncertainty level.

#### Day 53 — Trade routes (step 5.1) — done (merged, PR #59)

- **Data (`data/trade-routes.json`, a static file per docs/DATA.md; ≈5 KB gzipped, loaded once the globe is up, never by the timeline landing):** the seven routes the step names, each with active years, land / sea, goods, a description, sources, a confidence level with a reason, links to existing timeline entries, and one or more named paths of [lat, lng] waypoints in the direction goods moved — Silk Roads (130 BCE – 1450 CE; Hexi corridor, north and south of the Taklamakan, Kashgar → Antioch, branches to India and Constantinople), Indian Ocean monsoon trade (100 BCE – 1800; Red Sea → Malabar, Persian Gulf → Gujarat, Malabar → Malacca → Guangzhou, Gulf of Aden → Kilwa), trans-Saharan caravans (700–1650; Fez–Sijilmasa–Taghaza–Walata–Timbuktu, Gao, Ghadames, Bilma–Murzuq to Tripoli), the Amber Road (1–450; Aquileia → Carnuntum → Baltic), the Hanseatic League (1250–1669; London/Bruges, Hamburg–Lübeck, Bergen, Visby, Riga, Danzig, Reval and Novgorod), the Manila galleons (1565–1815; both crossings), and the Atlantic triangular trade (1526–1867; Europe → West Africa, the Middle Passage, Angola → Brazil, Caribbean → Europe). 29 paths.
- **Drawing (Globe.gl paths layer):** each path is a soft glow in the route's colour (also the tap target), a dark core so the track reads over any fill or terrain, and bright dashes that move from the first waypoint to the last at the same speed (3°/s) on every route. Lines sit above every polygon band and squeeze toward the surface with the polygons as you zoom; widths are in screen pixels.
- **Key, hover, tap:** a "Flows · trade routes" key item turns them off and on; `&flows=0` starts with them off (kept in shared links). Hover shows the route, its years and the path; a tap opens the detail panel with the description, what moved, sources, "How sure" and related timeline entries (e.g. Silk Roads → Silk Road & Classical Trade, Silk Road Trade Peaks).
- **Validate:** `scripts/check-routes.js` (in `npm run validate`): ids, years, colours, sources, confidence, paths; every related ref resolves; land waypoints on land; every sea lane, sampled every 0.25° the way the globe draws it, stays off the simplified coastline except the first / last 70 km (harbours up estuaries) and legs marked `via: river` (Neva–Ladoga–Volkhov to Novgorod).
- **Honest caveats:** routes are typical tracks, not logged courses, and each route is on for its whole span (no rise and fall in volume yet). Dashes show the main direction only; most of these routes carried goods both ways. Route dash lengths are fixed on the globe, so they get long close up. Tap targets are ~9–11 px wide.

#### Day 55 — Migrations (step 5.2) — in review (PR #61)

- **Data (`data/migrations.json`, a static file per docs/DATA.md; ≈6 KB gzipped, loaded once the globe is up, never by the timeline landing):** seven migrations, each with years, who moved (`people`), a scale 1–4 that sets the line width, forced or not, a description, sources, a confidence level with a reason, related timeline entries and named paths. Paths can carry their own years, so long expansions unroll stage by stage as you move the slider:
  - Bantu expansion (3000 BCE – 500 CE; western stream to the lower Congo and Angola, eastern stream to the Great Lakes, then south to KwaZulu-Natal).
  - Austronesian voyages (2500 BCE – 1300 CE; out of Taiwan, the Moluccas, along New Guinea, Lapita into the open Pacific, then Samoa → Society Islands → Hawaiʻi, Rapa Nui and Aotearoa, plus Borneo → Madagascar).
  - Indo-European spread (3000–1200 BCE; Yamnaya along the Danube, Corded Ware north of the Carpathians, Sintashta/Andronovo east, Indo-Iranian south into South Asia).
  - Migration Period (370–600; Huns, Visigoths, Vandals, Ostrogoths, Anglo-Saxons by sea, Lombards).
  - Atlantic slave trade (1526–1867; four forced crossings, ~12.5 million embarked).
  - European mass emigration (1815–1914; Liverpool, Hamburg/Bremen, Genoa/Naples and Britain → Australia lanes).
  - Partition of India (1947–1951; Punjab both ways, Sindh, Bengal both ways).
- **Drawing:** the same Globe.gl paths layer as the trade routes, drawn just under them: a wide colour glow, a strong dark core and pale, colour-tinted dashes that move slowly the way people went. Width follows scale (1 unknown or under a million, 2 one to five million, 3 five to twenty million, 4 over twenty million). Hover shows the migration, its years, forced or not, and the stage under the pointer. A tap opens the story: description, who moved, the stage you tapped, sources, "How sure" and related timeline entries.
- **Key:** a "Migrations · wider = more people" item turns them off and on; `&migrations=0` starts with them off (kept in shared links).
- **Validate:** `scripts/check-migrations.js` (in `npm run validate`): fields, years (each path's years inside its migration's), scale, related refs, land waypoints on land, sea paths off land. The land/sea geometry now lives in `scripts/flow-geo.js`, shared with `check-routes.js`.
- **Honest caveats:** out of Africa is not drawn because it happened long before the globe's earliest year (3000 BCE); it needs a deep-time globe first. The prehistoric expansions (Bantu, Austronesian, Indo-European) were slow spreads over generations, not marches, so their arrows are schematic, and their scale is "unknown" (thinnest line). Greek and Anatolian Indo-European arrivals are debated and not drawn. Tap targets are the glow width (about 9–23 px).

### The ancient Greek world, 1600–146 BCE (Arthur, 11 Oct 2026: "Can you do Greeks and that period next") — Day 56, done-in-PR (PR #62)

Done ahead of step 6.1, which stays next for the daily routine.

- **Audit first:** before this the globe had one blob for "Classical Greece" (480–350 BCE), rough Achaemenid, Seleucid and Carthage shapes, and nothing for the Bronze Age Aegean, Macedon, Alexander or the other successor kingdoms; the timeline had no Minoans, Mycenaeans, Hittites, Etruscans, Roman Republic, Macedon, Ptolemies, Pergamon or Bactrian Greeks.
- **Shapes (`src/globe-med-pieces.js`, `src/globe-greek-world.js`, lazy globe chunk):** the land from Spain to the Punjab is cut into ~95 small pieces (Attica, Laconia, Ionia, Cilicia, Media, Latium …) that share borders point for point, so allies, satrapies and provinces fit edge to edge and `mergeRings` fuses them into clean outlines. 24 polities with dated keyframes: Minoan Crete, Mycenaean Greece (palace by palace), the Hittite empire, Lydia, Achaemenid Persia, Carthage, the Etruscans, the Roman Republic (to 50 BCE), Archaic/Classical Greece, Athens and the Delian League, Sparta and the Peloponnesian League, Thebes, Syracuse, Epirus, Argead Macedon, Alexander's empire, the Ptolemaic, Seleucid, Antigonid, Attalid, Greco-Bactrian and Indo-Greek kingdoms, the Achaean and Aetolian leagues. Plus the Hellenes as a people (Greek speakers, Mycenaeans → 1923 → today) and extra keyframes for Assyria/Babylon and early Parthia. Each has sources and a confidence level with a reason (Bronze Age = conjectural).
- **Era names:** `nameAt` (e.g. Archaic Greece → Independent Greek states; Athens → Athens and the Delian League → Athenian Empire → Second Athenian League) on the map label, the key and the detail panel; short map labels for long names. `edgeGrace` gives these fast-changing states a 6-year fade instead of 20 so successors don't double up.
- **Timeline:** 13 new entries (Minoan Crete, Mycenaean Greece, Archaic Greece, Etruscans, Macedon, Roman Republic, Hittites, Lydia, Alexander's empire, Ptolemaic Kingdom, Pergamon, Greco-Bactria, Indo-Greeks), 9 wars (Greek–Punic Sicily, Corinthian, Boeotian, Philip II, Diadochi, Pyrrhic, Syrian, Macedonian, Achaean), 2 world events (Late Bronze Age collapse, first Olympics).
- **Cities and pins:** 74 dated cities with era names (Taras → Tarentum → Taranto, Zancle → Messana → Messina, Tomis → Constanța …), 46 new event pins (Knossos, Thera, Kadesh, colonies founded, Plataea, Leuctra, Chaeronea, Alexandria founded, Ipsus, Raphia, Pydna, Mummius at Corinth …).
- **Validate:** `scripts/check-greek-world.js` (in `npm run validate`): every merge gives one outline, no ring crosses itself, era names switch at the right years, the right states are on (and gone) at sample years.
- **Size:** globe chunk +26 KB gz (104 → 130 KB), timeline landing +6 KB gz (timeline text), pins/cities +3 KB gz.
- **Honest caveats:** borders are hand-drawn at ~10–30 km from atlases; small city-state territories are drawn by region; Egypt under Persia (525–404) still shows the old Egypt shape underneath; Greek communities outside the drawn coasts are not shown.

### The early medieval world, 500–1000 (Phase 4c step 6.1) — Day 57, done-in-PR (PR #63)

Stacked on the Greek world PR (#62). Do not merge until Arthur approves.

- **Audit first:** before this the globe had a thin Merovingian→Carolingian blob, schematic Tang / Byzantine / Umayyad / Abbasid / Srivijaya shapes, and nothing for Visigoths, Anglo-Saxon kingdoms, Avars, Khazars, Göktürks, Uyghurs, Tibetan Empire, Nanzhao or Silla.
- **Shapes (`src/globe-early-medieval.js`, lazy globe chunk):** 11 polities with dated keyframes — Frankish / Carolingian realm (Merovingian partitions → Charlemagne → Verdun), Visigothic Kingdom (Toulouse → Toledo, hands off before Umayyad Spain 711), Anglo-Saxon kingdoms (Heptarchy regions → Wessex → Æthelstan’s England), Avar Khaganate, Khazar Khaganate, Göktürk Khaganate (First / Second), Uyghur Khaganate, Tibetan Empire (beside Tang, not over China proper), Nanzhao, Silla / Unified Silla, and a redrawn Srivijaya (island / peninsula footholds, no ocean blob). Extra keyframes for Umayyad Al-Andalus (715) and mid-Tang (700) so neighbours sit beside existing empires. Each has sources and a confidence level with a reason (steppe = conjectural; Francia / Iberia / Britain / Tibet / East Asia / maritime = approximate).
- **Era names:** `nameAt` (Merovingian Francia → Carolingian Empire → after Verdun; Visigothic Toulouse → Toledo; Heptarchy → Kingdom of the English; First / Second Türk; Silla → Unified Silla). Short `edgeGrace` where successors hand off quickly (Visigoths → Al-Andalus, Göktürks → Uyghurs).
- **Timeline:** Merovingian period on the existing Frankish entry; new entries for Visigothic Kingdom, Anglo-Saxon Kingdoms, Avar Khaganate, Göktürk Khaganate, Uyghur Khaganate, Khazar Khaganate, Tibetan Empire, Nanzhao, Silla.
- **Cities and pins:** Atil, Ordu-Baliq, Dali (Yunnan), Regensburg; pins for Charlemagne’s crowning, Reccared / Guadalete, Whitby / Edington / Æthelstan, Avar–Sasanian siege, Khazar Atil, Ötüken, Ordu-Baliq, Tibetans in Chang’an / Lhasa, Nanzhao, Unified Silla.
- **Validate:** `scripts/check-early-medieval.js` (in `npm run validate`): closed non-crossing rings, era names, who-is-on / who-is-gone at 600 / 750 / 800 / 900.
- **Honest caveats:** early medieval frontiers were fluid (especially steppe khaganates); rings are schematic pastoral / tribute zones, not surveyed borders. Tang neighbours are drawn beside Tang’s existing schematic shape (which still reaches the Tarim and north fringe). Visigoths end by 711; Umayyad Spain appears from the existing caliphate overlays plus a 715 Al-Andalus keyframe. Anglo-Saxon coverage stops at Æthelstan (927) on the globe even though the timeline entry runs to 1066. Inland Africa and deeper SE Asia wait for steps 6.2–6.3.

### Southeast Asia, 100–1815 (Phase 4c step 6.3) — Day 59, done-in-PR

Do not merge until Arthur approves.

- **Audit first:** before this the globe had three Southeast Asian shapes (a schematic Khmer, Majapahit and the Day 57 Srivijaya) and nothing for Funan, Chenla, Champa, Đại Việt, the Burmese and Thai kingdoms, Lan Na, Lan Xang, Mataram, Malacca, Johor, Aceh, Brunei or the Philippine sultanates.
- **Shapes (`src/globe-southeast-asia.js`, lazy globe chunk):** 24 polities, 153 dated outlines. Mainland: Funan, Chenla (Land/Water), Khmer (802 → Jayavarman VII peak → 1431), Champa (Lâm Ấp → Vijaya → Panduranga), Đại Việt (Lý → Trần → Lê → Trịnh/Nguyễn with Gia Định → Gia Long 1802), Pagan, Ava, Toungoo (Bayinnaung's 1570 empire with vassals → Restored Toungoo), Konbaung (Tenasserim 1767, Arakan 1785), Sukhothai, Ayutthaya → Thonburi → Rattanakosin Siam, Lan Na, Lan Xang → three Lao kingdoms. Islands: Srivijaya refined (Palembang → strait and isthmus ports → Chola raid 1025 → Jambi/Malayu → Dharmasraya), Medang (Borobudur era, move to East Java 929), Majapahit (only Java, Madura and Bali — the Nagarakretagama tributary list is not drawn), Mataram Sultanate (Sultan Agung → Giyanti 1755), Malacca, Johor–Riau, Aceh, Brunei, Tondo/Maynila, Sulu (with north-east Borneo from 1704), Maguindanao. Each has sources and a confidence level with a reason (Funan, Chenla and the Philippine polities = conjectural; the rest approximate). Hands off to the nations layer at 1815.
- **Era names:** Chenla → Land and Water Chenla (707); Champa → Panduranga (1471); Đại Việt Lý / Trần / Lê / Trịnh–Nguyễn → Vietnam (1802); Toungoo → Restored Toungoo (1599); Ayutthaya → Siam (Thonburi, 1768) → Siam (Rattanakosin, 1782); Lan Na Burmese vassal (1558) → Siamese vassal (1775); Lan Xang → three Lao kingdoms (1707); Srivijaya → Malayu (Jambi) → Dharmasraya; Mataram → Surakarta and Yogyakarta (1755).
- **Timeline:** 22 new Southeast Asia entries (Funan, Chenla, Champa, Đại Việt, Pagan, Ava, Toungoo, Konbaung, Sukhothai, Ayutthaya, Thonburi/Rattanakosin Siam, Lan Na, Lan Xang, Medang, Mataram, Malacca, Johor, Aceh, Brunei, Tondo, Sulu, Maguindanao).
- **Cities and pins:** Óc Eo, Isanapura, Vijaya, Simhapura, Ava, Pegu, Mrauk U, Luang Prabang, Thonburi, Aceh (Kutaraja → Banda Aceh), Jambi, Kotagede, Jolo, Cotabato, Tondo; 37 pins (Jayavarman II, the Cham sack of Angkor, Bạch Đằng 1288, Lê Lợi, Anawrahta at Thaton, Bayinnaung at Ayutthaya, Ayutthaya destroyed 1767, Bangkok founded, Fa Ngum, the Chola raid, Borobudur, Prambanan, Gajah Mada's oath, Batavia 1628, Giyanti, Zheng He and the Portuguese at Malacca, Pigafetta at Brunei, the Laguna Copperplate, Legazpi at Maynila, Kudarat …).
- **Validate:** `scripts/check-southeast-asia.js` (in `npm run validate`): clean rings, sources + confidence + ≥3 keyframes + no keyframe after 1815, timeline links, 14 era-name samples, 27 capitals inside their polity at real dates, who is on / gone at sample years.
- **Honest caveats:** these were mandala states — rings are cores plus tribute zones, and overlapping rings where one court paid tribute to two (Lan Na, Cambodia, the Lao kingdoms) are deliberate. Bayinnaung's 1570 ring includes vassals. Not yet drawn: Hanthawaddy (Pegu) and Mrauk U as their own kingdoms, post-Angkor Cambodia 1431–1815, Singhasari and Kediri, Demak and Banten, Makassar (Gowa), Ternate and Tidore, the Rajahnate of Cebu.

### Inland Africa, 100–1815 (Phase 4c step 6.2) — Day 58, done-in-PR

Do not merge until Arthur approves.

- **Audit first:** before this the globe had seven thin schematic African blobs (Ghana, Mali, Songhai, Axum, Ethiopia, Great Zimbabwe, Kongo) and nothing for Kanem–Bornu, the Hausa states, Benin, Oyo, Asante, Sokoto, Mutapa, Luba, Lunda, Zagwe, the Swahili coast or Buganda.
- **Shapes (`src/globe-inland-africa.js`, lazy globe chunk):** 19 polities, 101 dated outlines. Redrawn: Ghana/Wagadu (700–1200), Mali (Sundiata → Mansa Musa → Mande remnant 1600), Songhai (Sunni Ali → Askia → Tondibi), Kongo (1400–1800, Mbwila), Great Zimbabwe (1150–1440), Aksum (with Himyar in the 520s), Ethiopia (Solomonic 1270 → Adal invasion 1535 → Gondar → Era of the Princes). New: Kanem–Bornu (Kanem → Fezzan peak → move to Bornu → Idris Alooma), Hausa city-states, Sokoto Caliphate (1804–15), Benin, Oyo (with Dahomey tributary 1750), Asante (1701–1815), Luba, Lunda (with Kazembe), Mutapa (1450–1760), Zagwe, the Swahili city-states (coastal strips and islands only: Lamu–Mombasa, Zanzibar, Kilwa, Sofala) and Buganda. Each has sources and a confidence level with a reason (Wagadu, Luba, Lunda, Zagwe, Buganda = conjectural; Swahili towns = documented; the rest approximate). Everything hands off to the nations layer at 1815 (Sokoto, Bornu, Ashanti, Kongo, Buganda, Ethiopia are already there).
- **Era names:** Kanem → Bornu (1380); Ethiopian Empire (Solomonic) → (Gondar, 1636) → Era of the Princes (1769).
- **Timeline:** 12 new Africa entries — Kanem–Bornu (with Kanem / Bornu periods), Hausa City-States, Sokoto Caliphate, Kingdom of Benin, Oyo Empire, Asante Empire, Luba Kingdom, Lunda Empire, Kingdom of Mutapa, Zagwe Kingdom, Swahili City-States, Kingdom of Buganda.
- **Cities and pins:** Katsina, Zazzau → Zaria, Ngazargamu, Oyo-Ile, Mapungubwe, Malindi, Lamu, Sofala, Adulis; 20 pins (Mansa Musa leaves Niani, Ngazargamu, Idris Alooma, Muhammad Rumfa of Kano, Sokoto founded, Portuguese at Benin / Benin City sacked, Dahomey tribute to Oyo, the Golden Stool, Mbwila, the Mutapa vassal treaty, Mapungubwe, Lalibela's churches, Wayna Daga, Gondar, Kaleb in Himyar, Ibn Battuta at Kilwa, da Gama at Malindi, Oman takes Fort Jesus, Speke in Buganda).
- **Validate:** `scripts/check-inland-africa.js` (in `npm run validate`): closed non-crossing rings, sources + confidence + ≥3 keyframes + no keyframe after 1815, timeline links exist, era names, 19 capitals inside their polity at real dates (Koumbi Saleh 1000, Niani and Timbuktu 1324, Gao 1500, Kilwa 1300 …), who is on / gone at sample years.
- **Honest caveats:** most of these states ruled people and tribute, not lines; rings are zones of known towns, campaigns and tributaries. Hausa is one ring for a group of rival cities. Pre-1700 dates for Luba, Lunda and Buganda rest on oral king-lists. Neighbouring rings can overlap slightly where tribute zones did. Not yet drawn: Dahomey before 1815, Bunyoro, Rwanda/Burundi before 1815, Adal, Mapungubwe as a polity, Torwa/Rozvi, Ndongo/Matamba, Madagascar's Merina before 1815.

### 6. Better coverage between empires

- **Step 6.1 — The early medieval world (500–1000).** ✅ Day 57, done-in-PR (PR #63). Merovingian and Carolingian Francia, Anglo-Saxon kingdoms, the Visigoths, the Avars, the Khazars, the Göktürks and Uyghurs, Tang neighbours (Tibetan Empire, Nanzhao, Silla), Srivijaya — see the Day 57 write-up below.
- **Step 6.2 — Inland Africa.** ✅ Day 58, done-in-PR. Ghana/Wagadu, Mali, Songhai, Kanem–Bornu, the Hausa states, the Sokoto Caliphate, Benin, Oyo, Asante, Kongo, Luba and Lunda, Great Zimbabwe and Mutapa, Aksum, Zagwe and Ethiopia over time, the Swahili city-states, Buganda — see the Day 58 write-up below.
- **Step 6.3 — Southeast Asia.** ✅ Day 59, done-in-PR. Funan, Chenla, Khmer, Champa, Đại Việt, Pagan, Ava, Toungoo, Konbaung, Sukhothai, Ayutthaya → Siam, Lan Na, Lan Xang, Srivijaya (refined), Medang, Majapahit, Mataram, Malacca, Johor, Aceh, Brunei, Tondo, Sulu, Maguindanao — see the Day 59 write-up below.
- **Step 6.4 — Native American nations after 1500.** ✅ Day 60, done-in-PR. Haudenosaunee, Cherokee, Muscogee, Powhatan, Choctaw, Chickasaw, Seminole, Lakota, Comanche, Diné (Navajo), Ndee (Apache), Mapuche — dated territories, 1830s removals and reservations; `type: indigenous` so they persist past the 1815 nations handoff — see the Day 60 write-up below.

### 7. Space background

Arthur: replace the plain background with a starfield and space scene.

- **Step 7.1 — Stars and the Milky Way.** ✅ Day 61, done-in-PR. A celestial sphere behind the globe: Yale BSC stars (mag ≤ 6.5, public-domain JSON → `public/sky/bsc-stars.bin`) sized/tinted by magnitude and spectral class, plus a Milky Way equirectangular from NASA SVS Deep Star Maps 2020 (`public/sky/milkyway-celestial.webp`). Earth's axis = celestial pole; one Points mesh + one texture; see Day 61 write-up and `docs/ATTRIBUTION-sky.md`.
- **Step 7.2 — Constellations.** ✅ Day 62, done-in-PR. Constellation lines and names in roughly correct positions from d3-celestial BSD-3 GeoJSON → `public/sky/constellations.bin` (same celestial frame as Day 61 stars); key toggle (on by default until Day 67, now off by default; `&constellations=1` turns it on); lightweight axial precession by year (ecliptic-pole quaternion; Thuban ≈ 3000 BCE, Polaris today). See Day 62 write-up and `docs/ATTRIBUTION-sky.md`.
- **Phone budget:** one point cloud and one texture; no per-frame CPU work. ✅ met in step 7.1; step 7.2 adds one static `LineSegments` + sprites (rebuilt only on toggle / year for precession quaternion).

#### Day 61 — Stars and the Milky Way (step 7.1) — done-in-PR
- `src/globe-sky.js` (lazy with the globe): inward-facing Milky Way sphere + Yale BSC `THREE.Points`, fixed in world space with the earth so camera orbit reveals different sky; CSS body starfield muted while `body.globe-active`.
- Assets under `public/sky/` (~50 KB WebP + ~168 KB star binary); rebuild via `scripts/build-sky.py`. HYG (CC BY-SA) not used. Step 7.2 done on Day 62.
- PR #72 (coast spill) stays separate / awaiting review — this branch is from `main` only.


#### Day 62 — Constellations (step 7.2) — done-in-PR
- `src/globe-sky.js`: d3-celestial stick figures as one `THREE.LineSegments` mesh + short IAU abbreviation sprites; same world-fixed celestial frame as Day 61; light theme still hides the whole sky group.
- Key **"Constellations"** toggle (off by default since Day 67; `&constellations=1` turns it on); axial precession is one quaternion on the sky group when the year changes (no per-frame CPU).
- Asset `public/sky/constellations.bin` (~20 KB, 88 IAU constellations); rebuild `python3 scripts/build-sky.py --constellations`. Attribution in `docs/ATTRIBUTION-sky.md` (BSD-3 © Olaf Frohn / d3-celestial).
- **Next:** Item 8 lidar finds (8.1 hidden-cities pins).

### Item 8 — Lidar finds (Arthur, 15 Oct 2026) — after step 7.2
Inspired by [lidar lost-cities write-up](https://bakerbench.substack.com/p/i-went-looking-for-lost-cities-with). Static data only, no new tech.
- **Step 8.1 — "Hidden cities" pins.** A new event-pin type for major lidar discoveries (e.g. Valeriana and the Maya lowlands, greater Angkor, Amazonian settlements such as Llanos de Mojos / Upano valley), each with date of discovery, the period of the site, sources, and a short "what this changed" note. Toggle in the key.
- **Step 8.2 — Honest shape updates.** Where those finds change what we draw (e.g. denser Maya lowland presence, Angkor's urban sprawl, pre-Columbian Amazon), update polity/presence shapes and certainty notes, citing the survey.

#### Day 63 — Hidden cities: lidar finds (step 8.1) — done-in-PR
- **Data:** `data/lidar-finds.json` (lazy, ~5 KB gz), 10 finds: Valeriana (2024), the PACUNAM Maya lowlands survey (2018), the Mirador–Calakmul causeways (2022), Aguada Fénix (2020), Angamuco (2018), Greater Angkor (2013), Mahendraparvata (2013), the Upano valley (2024), the Casarabe towns of the Llanos de Mojos (2022) and Tugunbulak / Tashbulak (2024). Each has the site's years and period, the discovery year and survey, a description, a "what this changed" note, how precisely the pin is placed, a certainty level with a reason, timeline links (Maya, Olmec, Khmer) and peer-reviewed or press sources.
- **Globe:** teal 🔍 pins in the same label pass as event pins. A find shows while the site was lived in and again from the year lidar revealed it ("found 2024"), so today's globe shows where lidar has rewritten the map. Tap for its story. Key **"Lidar finds"** toggle (on by default; `&lidar=0`).
- **Validate:** `scripts/check-lidar.js` (in `npm run validate`): fields, years, discovery after the site ended, pins on land, label length, sources, related entries resolve.
- **Next:** step 8.2 (denser Maya / Angkor / Amazon presence shapes citing these surveys), then Phase 5 country packs.

#### Day 64 — Honest shape updates from lidar (step 8.2) — done-in-PR
- **Data (`src/globe-lidar-shapes.js`, lazy globe chunk):** six lidar-mapped landscapes are drawn as teal presence shapes. Each matches its published area to within 1%, but the outline is hand-traced:
  - **Central Maya lowlands**, 650–900. 95,000 km², the area Canuto et al. 2018 extrapolate the PACUNAM survey to. Valeriana sits inside it (Auld-Thomas et al. 2024).
  - **Mirador–Calakmul Karst Basin**, 1000 BCE–150 CE. 4,533 km² (Ensley et al. 2021), with the causeway network in Hansen et al. 2022.
  - **Greater Angkor**, 1100–1431. The ~1,000 km² low-density urban complex in Evans et al. 2013.
  - **Mahendraparvata** on Phnom Kulen, 802–900. 40–50 km² (Chevance et al. 2019).
  - **Upano valley**, 500 BCE–450 CE. The 300 km² studied by Rostain et al. 2024.
  - **Casarabe towns of the Llanos de Mojos**, 500–1400. The 4,500 km² culture area in Prümers et al. 2022.
- **Certainty notes:** the existing shapes now say in "How sure" what the surveys showed, and list them as sources.
  - **Maya:** a new 1000 BCE keyframe (Aguada Fénix, Inomata et al. 2020). The Preclassic note cites Mirador (Hansen et al. 2022). The Classic note cites PACUNAM and Valeriana. The Classic Maya polity no longer spreads across West and Central Mexico, which other cultures held (Angamuco is one of them).
  - **Khmer Empire:** 802 (Mahendraparvata) and 1200 (Greater Angkor). Lidar changed our picture of the capital, not the frontier.
  - **Mesoamerican presence:** 500 BCE and 500 CE.
  - **Amazonian presence:** 500 and 1200, citing Rostain, Prümers and Peripato et al. 2023.
- **Schema:** keyframes can carry `confidence` (globe-confidence.js already read it). Lidar shapes carry `lidar: { finds, km2, areaNote, cite }`. `data/lidar-finds.json`: Valeriana's structure count corrected to 6,764.
- **Validate:** `scripts/check-lidar-shapes.js` (in `npm run validate`) checks that:
  - linked finds exist and the sources are the survey papers;
  - rings are closed, ≤ 24 vertices, don't cross themselves, and sit on land;
  - drawn areas are within 10% of the published figure, and find pins are inside their shapes;
  - keyframe years fall within the finds' site years, and shapes are on or off at sample years;
  - the notes reached their shapes, and the Maya polity stays east of 94° W;
  - the set stays within a small budget (6 shapes, 44 vertices).
- **Next:** Phase 5 country packs covering both views (Timeline + Globe), starting with the pack 1 globe backfill (Peru, Ghana, Kenya, Morocco, Iraq, Philippines).

### World population readout on the globe (Arthur, 20 Oct 2026: "show an approximate shift in population size as you move the slider") — Day 67, done-in-PR

- **What:** a "World population ≈ 230 million" chip beside the globe year (full screen and windowed; "≈ 230M" on phones). It updates as the slider moves and climbs to ≈ 8.23 billion in 2025. Tap it for an "Estimate · sources" note.
- **Data (`data/population.json`, its own ≈1.4 KB gz chunk, loaded with the globe UI):** 57 points from 10,000 BCE to 2026, from Our World in Data's long-run series, rounded to 4 significant figures:
  - HYDE 3.3 (2023) for 10,000 BCE–1799;
  - Gapminder v7 for 1800–1949;
  - UN World Population Prospects 2024 for 1950 on (2024–2026 are the UN medium variant).
- **Display:** log-linear interpolation between points (a steady growth rate within each gap). The figure is rounded to 2 significant figures before 1800 and 3 after, because estimates before 1800 are only good to tens of percent. For example, published 1 CE estimates run from about 170 million (McEvedy & Jones 1978) to 300–330 million (UN, Population Reference Bureau, Durand 1974), as compiled by the US Census Bureau and Wikipedia's comparison table.
- **Validate:** `scripts/check-population.js` (in `npm run validate`) checks that:
  - years increase strictly, values are positive, and every point names its source;
  - no step falls by more than 15% (HYDE's real dips at 300 and 1400 CE pass);
  - the series covers the slider (3000 BCE–2025) and ends near 8.2 billion.
- **Constellations off by default (Arthur's review of #81):** they made the space background hard to see. The key toggle still turns them on, and `&constellations=1` turns them on in a link (`&constellations=0` still means off). No saved preference forces them on; the state lives only in the URL.
- **Later (only if wanted):** the same figure on the Timeline view; per-region populations (HYDE has continents) in a shape's detail panel.

## Custom domain & sharing (Arthur, 9 Oct 2026)

- **Status: step 1 done on Day 46 (merged, PR #52; live at https://theeverythingtimeline.com/ since 9 Oct).**

#### Day 46 — theeverythingtimeline.com (step 1) — done (merged, PR #52)
- Site at the root (`base: '/'`, `public/CNAME`); PR previews at `/pr-preview/pr-N/` once the domain is live (base rewritten in `vite.config.js`, no workflow change); canonical + description + Open Graph / Twitter card with a 1200×630 globe image (`public/og-image.png`).

Next steps (not started):
2. **Per-year / per-view static preview pages** so a shared deep link (e.g. `/?view=globe&year=1453&at=41,29,0.5`) gets its own card: pre-render a few hundred `/share/globe-1453/index.html`-style pages at build time (title, description, og:image per era, then redirect into the app), or generate og:images per era with a headless step in CI. Today every link shares the same static card.
3. Update `canonical` / `og:url` per deep link client-side (helps bookmarks / some crawlers; social scrapers don't run JS, hence step 2).
4. Small extras: favicon + apple-touch icon, `robots.txt` + `sitemap.xml`, `404.html` that forwards old `/the-everything-timeline/…` paths.

## Feedback & paid features discovery (Arthur, 9 Oct 2026)

> "Can you add a feedback button so that people can give feedback … so we can eventually figure out how to have paid features for this." Also: the site will move to a proper domain soon.

- **Status: step 1 done on Day 45 (merged, PR #51).**

#### Day 45 — Feedback button (step 1) — done (merged, PR #51)
- Unobtrusive **Feedback** button in every view (header top-right on desktop, icon on phones; bottom-left in the full-screen globe). In-app panel: 1–5 emoji rating, "What would you love to see?", optional "Would you pay for…?" (ad-free + early access, saved custom timelines & sharing, classroom / teacher mode, high-res exports & posters, deeper data layers & map packs, offline / installable app, something else), optional email.
- Context attached and shown to the person: deep link (view, year, `at`, entity / item), screen size, app version + commit. No cookies or tracking; local "feedback sent" note only.
- Target configurable in `src/feedback-config.js`: `FORM_ENDPOINT` (POST, JSON or form-encoded); empty → prefilled public GitHub issue (label `feedback`, no email) + Copy text.
- Domain-agnostic; README documents what a custom domain needs (CNAME + Vite base + preview base).
- Fix: in the normal (card) globe the credit moves to top-left — after #49 + #50 the key wraps to two rows and the bottom-right credit overlapped it (visible on live main).

#### Day 50 — Real feedback endpoint (step 2) — done (Formspark, Arthur, 10 Oct)
- Send now POSTs JSON straight to Formspark (`https://submit-form.com/8iSgNi2yA`, set in `src/feedback-config.js`); notifications go privately to Arthur's inbox. No GitHub account needed, nothing public; the GitHub-issue path is gone.
- Email-friendly fields: `rating`, `wish`, `would_pay` (comma list), `email`, `page_url`, `view`, `year`, `map_position`, `selected`, `screen`, `app_version`, plus `_email.subject` ("Everything Timeline feedback (4/5)") and `_email.from` ("Everything Timeline").
- Spam / double-tap guards: hidden `_honeypot` field (Formspark drops filled ones; the client also skips sending), one send per 30 s per browser, 15 s request timeout. "Copy text" only appears if sending fails, with a friendly retry message.
- Bigger, easier-to-find button (Arthur): one gold "💬 Feedback" pill fixed bottom-right in every view (replaces the small header button and the full-screen twin), 46 px tall (44 px on phones); lifts above the minimap / zoom bar / scrubber / phone full-screen credit so it never covers them; globe labels avoid it.
- Privacy note rewritten: goes privately to the team, by email via Formspark; lists exactly what is attached.
- Formspark's submission quota is shared with another product: test against `https://submit-form.com/echo` (echoes, stores nothing) or a mock, not the real form.

#### Day 52 — Tip jar ("☕ Support") — done (merged, PR #58)
- Arthur: a tip jar near the Feedback pill so people can give money before any monetisation plan exists.
- "☕ Support" pill beside Feedback (secondary: dark + gold border) in every view, desktop + phone; both pills share one dock that lifts over the scrubber / minimap / credit.
- Panel: warm line, primary "Tip on Ko-fi" (new tab, noopener), then Crypto: BTC, ETH (Ethereum + EVM chains) and SOL, each with Copy ("Copied ✓") and a build-time inline-SVG QR code. Accessible: focus trapped, Esc closes (full screen stays), ≥44 px targets.
- Values in `src/support-config.js` only; `scripts/check-support.js` asserts the exact strings plus BTC bech32 / ETH EIP-55 / SOL 32-byte checks and that the QR codes match. Panel lazy-loaded (~5 KB gz); landing +0.4 KB gz.

Next steps (not started):
3. After ~2–4 weeks, tally the "Would you pay for…?" answers and wishes into a short ranking; prototype the top idea behind a flag (e.g. saved custom timelines, or poster export) before any payment plumbing.
4. Only then: pricing test (e.g. a "notify me / pre-order" button on the top idea) and a privacy note page.

## Phase 5 — Content expansion: more and better data (MAIN TRACK)

**Top priority, long-running (Arthur, 15 Oct 2026).** The project's structure is now set: the Timeline and the Globe exist and are linked. From here, most growth comes from adding data and refining it, again and again. Accounts and similar features wait until there are users. After Phase 4c step 7.2 (done Day 62) and item 8, this is the daily routine's default work.

**Explicit goal: every place, both views (Arthur, 15 Oct 2026).** Every ISO 3166-1 entry should be covered on **both** the Timeline and the Globe. That is about 195 sovereign states plus dependent territories, 249 entries in all. Progress is tracked row by row in [docs/COVERAGE.md](docs/COVERAGE.md), with Timeline and Globe status (none/partial/done) and the pack or region responsible. Small territories batch with their region pack. Every pack PR updates its rows.

**Places with nothing drawn yet: 53 entries (Arthur, 15 Oct 2026).** These are the Globe `none` rows in [docs/COVERAGE.md](docs/COVERAGE.md). Each one is scheduled with its region pack:

- **Tiny islands and microstates** (Caribbean, Pacific, Indian Ocean, Gibraltar, the Holy See and similar): use higher-resolution outlines from a permissively licensed source, e.g. Natural Earth 10m, lazy-loaded only at close zoom so the base globe stays light. Where a shape isn't practical, use a tappable dot or marker with a label as the fallback. Either way, the place gets its own timeline links.
- **Antarctica:** research stations as dated pins, plus dated territorial claims (UK 1908, NZ 1923, France 1924, Australia 1933, Norway 1939, Chile 1940, Argentina 1943), drawn faintly, with the Antarctic Treaty (1959, in force 1961) freezing them.
- **Remote territories** (Bouvet, Heard & McDonald, South Georgia, French Southern Lands, Svalbard and similar): handled in the same way as the islands, batched in the "Polar & remote" pass.

Rules for every Phase 5 PR: data stays static, split into small lazy-loaded files (docs/DATA.md), every item sourced, validation passes on build, and no over-engineering.

### 12. Country packs: Timeline and Globe together

Each pack takes one country (or a small group of neighbours) and refines **both views at once**. While we research a country's timeline, we also refine its whole history on the globe:

- **Timeline:** major political, cultural, scientific, economic and conflict events, with sources for contentious or modern claims.
- **Globe shapes over time:** kingdoms, dynasties and regions, with borders before 1815 drawn as keyframes, and certainty levels on every shape.
- **Dated cities:** founding, peak and decline, and renames.
- **Pinned events:** battles, treaties, foundings and discoveries placed on the map.
- **Links:** Timeline ↔ Globe links both ways (country items ↔ polities/cities/events).

**Country pack 1 — Day 33 ✅ (timeline-only).** Added Peru, Ghana, Kenya, Morocco, Iraq, and the Philippines (32 → 38 countries; 42 new items, every item sourced, 73 source links checked). Picks fill thin regions: Andean South America, West and East Africa, the Maghreb, Mesopotamia, and island Southeast Asia. Globe links kept in sync: Inca → Peru, Abbasid → Iraq, Mesopotamia → Iraq (Sumer/Akkad, Babylon/Assyria), Parthian → Iraq. Related-on-timeline links now resolve country items even before that country has been opened. It added **no new globe territory**.

Proposed order:

1. **Pack 1 globe backfill:** Peru, Ghana, Kenya, Morocco, Iraq, Philippines. Add shapes over time, cities and pinned events for the six existing timeline packs. **Peru ✅ (Day 65, merged #79); Ghana ✅ (Day 66, merged #80); Morocco ✅ (Day 68, merged #82); Kenya ✅ (Day 69, done-in-PR #83); Iraq ✅ (Day 70, done-in-PR #84); Philippines ✅ (Day 71, done-in-PR #85). Pack 1 globe backfill complete pending merges; next item 2, Central Asia.**
2. **Central Asia:** Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan, Afghanistan (Sogdia, Bactria, Khwarazm, Timurids, khanates).
3. **Caribbean and Central America:** Cuba, Haiti/Dominican Republic, Jamaica, Guatemala, Mexico refinement (Maya city-states, Taíno, colonial splits).
4. **Central Africa:** DR Congo, Angola, Cameroon, Chad (Kongo, Luba, Lunda, Kanem-Bornu).
5. **Southeast Europe:** Serbia, Bulgaria, Romania, Croatia, Albania, Greece refinement (Byzantine/Ottoman/medieval kingdoms).
6. **South Asia:** Pakistan, Bangladesh, Sri Lanka, Nepal, India refinement (Mauryan → Mughal regional kingdoms).
7. **Globe refinement of the existing 38 countries**, one or a few per day, biggest gaps first. These packs are mostly globe work, as their timelines already exist.

#### Day 65 — Pack 1 globe backfill: Peru — done (merged, PR #79)

Peru had a sourced timeline (Day 33), but on the globe it had only a schematic Inca Empire and broad Andean peoples / presence bands. The Spanish "Andes" shape also spilled into the Pacific, and it appeared from 1492, 40 years before Pizarro. Now Peru's whole history is drawn, from Caral to the Viceroyalty.

- **Shapes (`src/globe-pack-peru.js`, lazy globe chunk): 17 polities, 64 keyframes.** Each has a certainty level with a reason, sources, and links to Peru's timeline items:
  - **Andean origins:** Norte Chico (Caral–Supe, 2900–1850 BCE), Chavín (temple, then a wide *sphere of influence*, conjectural), Paracas.
  - **Regional states:** Nazca; Moche as two spheres, north and south (to Huarmey), with the south shrinking after the 6th-century floods; Wari's highland network from Viracochapampa to Pikillacta plus Cerro Baúl (conjectural: centres and roads, not a solid territory); Sicán at Batán Grande and Túcume; Chimor in five stages, from the Moche valley (950) to Tumbes–Chillón (1462; its southern limit is disputed).
  - **Kingdoms before the Inca:** Chachapoyas (Kuélap), Chincha, Ychsma (Pachacamac), the Chanka, the Kingdom of Cusco, and the Colla and Lupaca around Titicaca.
  - **Inca Empire (redrawn, same id):** 1438 Cusco → 1463 highlands and Titicaca → 1471 Chimor and Quito → 1493 to the Maule → 1527 to Pasto → 1532. Its three regions (Peru, northern and southern Andes) share borders. Dates follow Rowe 1945, and the "How sure" note says radiocarbon now puts the expansion earlier (Marsh et al. 2017). The edge fade is now 4 years, so the empire is full size until Pizarro instead of shrinking from 1513.
  - **Neo-Inca State** in Vilcabamba, 1537–1572.
- **Coasts:** a traced Pacific coast (`src/globe-andes-coast.js`, read off the globe's own land, including the Paracas peninsula) gives every coastal shape its west side, so nothing washes over the sea.
- **Existing shapes redrawn (`applyPeruShapeFixes`):**
  - Spanish Empire: a 1530 keyframe with no Andes, a 1535 keyframe for Pizarro's conquest, then the Viceroyalty to the coast (1550: Quito–Concepción; 1700/1800: Peru, Upper Peru, Quito). Chile and the Río de la Plata are redrawn on land, and 1800 now has them too.
  - Colonial Americas: the Andean coast region from 1545, not 1520.
  - Andean peoples and Andean presence: every keyframe hugs the coast. Since 1900 the peoples shape covers only the Quechua / Aymara highlands.
- **Morph:** rings longer than 24 vertices now morph with about 2 samples per vertex (up to 160), lined up first, so coast detail doesn't melt mid-scrub. Short rings morph exactly as before.
- **Cities: +19** — Cahuachi, Huacas de Moche, Pachacamac, Huari, Kuélap, Pikillacta, Batán Grande, La Centinela, Túcume, Hatunqolla, Chucuito, Cajamarca, Huánuco Pampa, Piura, Trujillo, Huamanga → Ayacucho (1825), Arequipa, Puno, Iquitos.
- **Pins: +17.** They use the new `country:peru:<item>` refs, so a tap opens Peru's own timeline item. They run from the Áspero mounds, the Paracas necropolis, the Lord of Sipán and the Nazca Lines, through the Inca conquest of Chimor, the siege of Cusco, the fall of Vilcabamba, Huancavelica's mercury mine, the 1746 earthquake and Túpac Amaru II, to independence, Junín, Arica, the occupation of Lima, the Treaty of Ancón, Bingham at Machu Picchu and Chuschi (1980).
- **Timeline (`data/countries/peru.json`): +3 sourced items** — Paracas, Sicán (Lambayeque), and "Kingdoms before the Inca" (10 items now).
- **Links both ways:** a timeline item's detail now lists **"On the globe"**. These are the shapes and pins that belong to it, for every view, not only Peru. A tap opens the globe at that year, flies there and selects the shape. The table is generated at build time (`src/generated/globe-links.json`, ~19 KB gz, loaded the first time a detail opens). Globe → timeline links ("Related on timeline") were already there.
- **Validate:** `scripts/check-country-packs.js` (in `npm run validate`) checks:
  - rings are closed and don't cross themselves;
  - every vertex is on land and ≥97% of each interior is land, for the new shapes and every redrawn region;
  - sources, confidence, ≥3 keyframes, nothing after 1815, and timeline links;
  - 35 capitals and type sites are inside their shapes;
  - who is on and off at 12 sample years;
  - no Spanish Andes before 1532.
- **Honest caveats:**
  - Before about 1450 these are archaeological cultures (pottery, sites, art styles), not states with borders. Chavín and Wari are conjectural.
  - Inca dates are the chroniclers' and are debated.
  - Tiwanaku and the Bolivian / Chilean Andes are left for their own packs (§13 "The Andes before the Inca").
  - Ghana and Morocco were not started, so Peru got the full pass.
- **Next:** pack 1 globe backfill continues with **Ghana** (Ghana Empire is already drawn; add Bono, Akan states, Asante keyframes, Elmina / Cape Coast forts, Gold Coast colony), then Morocco, Kenya, Iraq, the Philippines.

#### Day 66 — Pack 1 globe backfill: Ghana — done (merged, PR #80)

Ghana had a sourced timeline but on the globe only a four-keyframe Asante Empire (Day 58) whose southern side ran into the Gulf of Guinea, plus broad presence bands. Nothing showed the Akan states before Asante, the coast states, or the savanna kingdoms of the north. Now Ghana's history is drawn from Bono to 1815, where the nations layer (Ashanti, then the British Gold Coast) takes over.

- **Shapes (`src/globe-pack-ghana.js`, lazy globe chunk): 10 polities, 54 keyframes,** each with a certainty level and reason, sources and links to Ghana's timeline items:
  - **Forest Akan states:** Bono (Bono Manso and Begho, 1350–1723, conjectural), Denkyira (Abankeseso, 1620–1701), Akwamu (1600–1730: Accra in 1681, Winneba to Little Popo by 1710, then the move across the Volta to Akwamufie), Akyem (Kyebi; crushes Akwamu in 1730, conquered by Asante in 1742).
  - **Coast:** Great Accra, the Ga kingdom (Ayawaso, 1500–1677/81), and the Fante states (Mankessim and Anomabo, 1620–1815).
  - **North:** Dagbon (from the 1400s; Yendi after Gonja takes Daboya in 1713), Mamprugu (Gambaga, then Nalerigu), Gonja (Ngbanya horsemen about 1600, Jakpa's kingdom about 1675, Salaga), drawn as three touching regions so it grows without its outline sliding over Dagbon.
  - **Asante Empire (redrawn, same id):** 1701 Kumasi union → 1722 Denkyira's old lands → 1723 Bono → 1742/1750 Akyem and the Accra coast → 1807 armies on the Fante coast. Tributaries (Dagbon 1744, Gonja 1751) are drawn as their own kingdoms with "(Asante tributary)" names, not swallowed into Asante.
- **Coast:** a traced Gulf of Guinea shore (`GOLD_COAST`, read off the globe's own land every 0.1° and nudged 0.05° inland), so coastal shapes stop at the beach. The old Asante's southern vertices were in the sea.
- **Existing shapes fixed (`applyGhanaShapeFixes`):** the West African presence bands (`west-africa-sahel-presence` 1400/1700, `global-modern-presence` 1700–2025) ran straight across the Gulf of Guinea and shaded the sea off Ghana; their southern edge now follows Ghana's shore from 3°W to 1.8°E (checked at their keyframes).
- **No overlaps:** the pack's own shapes never overlap each other in any year 1300–1815 (checked every 5 years on a 0.1° grid; keyframes for conquests are paired, e.g. Akwamu 1729/1730 with Akyem 1730/1731, so morphs don't slide over a neighbour).
- **Cities: +18** — Begho, Bono Manso, Takyiman → Techiman, Abankeseso, Kyebi, Akwamufie, Mankessim, Cabo Corso → Cape Coast, Anomabo, Axim, Keta, Yendi, Nalerigu, Salaga, Bole, Tamale (1907), Sekondi-Takoradi (1928), Tema (1952).
- **Pins: +24**, using `country:ghana:<item>` refs: Begho's market, Denkyira's rise, the Portuguese at Shama (1471), São Jorge da Mina (1482), Cape Coast Castle, Christiansborg, Gross Friedrichsburg, Elmina handed to Britain (1872); Akwamu takes Great Accra, Akyem defeats Akwamu; the Golden Stool, Feyiase, Anomabo (1807), Kumasi burned (1874), Yaa Asantewaa's war (1900); the Fante Confederation (1868); Gonja takes Daboya, Dagbon's tribute to Asante; Tetteh Quarshie's cocoa (1879), Takoradi harbour, the 1948 Cross-Roads shooting, independence (1957), Akosombo (1965), the 1966 coup.
- **Timeline (`data/countries/ghana.json`): +3 sourced items** — "Great Accra, Akwamu & Akyem", "Fante States", "Dagbon, Mamprugu & Gonja" (new "Northern Kingdoms" category; 10 items now).
- **Validate:** Ghana is a second row in `scripts/check-country-packs.js` (land, rings, sources, 26 capitals and type sites inside their shapes, who is on / gone at sample years, and the new no-overlap test). `check-inland-africa.js` now accepts a country pack's redraw of one of its polities (Asante).
- **Honest caveats:**
  - None of these states had written borders. Outlines are the districts traditions and European traders' reports say they ruled or taxed, drawn roughly; Bono is conjectural.
  - Northern dates (Dagbon and Mamprugu's founding, Gonja's) come from drum histories and the Kitab Ghanja and are argued over.
  - Smaller states (Wassa, Twifo, Assin, Nzema, Ahanta, Krobo, the Ewe states) and the European forts as territory are not drawn; the forts are cities and pins.
  - Next door, the schematic French (1700–1830) and Portuguese (1500–1700) "west-africa-coast" shapes still cover inland Côte d'Ivoire and Guinea, and the presence bands still cross the sea off Côte d'Ivoire and Benin. Those belong to the West Africa fill-the-globe pass.
- **Next:** pack 1 globe backfill continues with **Morocco** (Mauretania, Idrisids, Almoravids, Almohads, Marinids, Saadians, Alaouites), then Kenya, Iraq, the Philippines.

#### Day 68 — Pack 1 globe backfill: Morocco — done-in-PR

Morocco had a sourced timeline but on the globe only a schematic Roman outline that covered Fez, the Rif and the Atlas, an Umayyad sliver, and a French "Maghreb" shape that grew over Fez from the 1770s. Nothing showed the Mauri kings, the Idrisids, the Berber empires or the sharifian sultans. Now Morocco's history is drawn from the 200s BCE to 1815, where the nations layer (the Sultanate, then the French and Spanish protectorates in 1912) takes over.

- **Shapes (`src/globe-pack-morocco.js`, lazy globe chunk): 20 polities, 317 keyframes** (every change is a one-year step), each with a certainty level and reason, sources and links to Morocco's timeline items:
  - **Antiquity:** the Kingdom of Mauretania (Baga 206 BCE; Bocchus I gains western Numidia 105 BCE; Juba II and Cleopatra Selene at Caesarea and Volubilis from 25 BCE; Ptolemy killed 40 CE, conjectural) and Roman Mauretania (Tingitana and Caesariensis from 44; Diocletian's pull-back to the Tangier peninsula c. 285; the Vandals 429).
  - **Berber states after the Berber Revolt:** the Barghawata of Tamesna (744–1058), the Idrisids (Walili 788, Fez 789, Tlemcen 790, the realm of 828, then the Rif and Hajar an-Nasr to 974), the Emirate of Nekor, the Midrarids of Sijilmasa (758–976), and the Zenata Maghrawa and Banu Ifran (Fez 987, Oujda 994, Fez changing hands 1033 and 1038, Aghmat to 1058).
  - **Empires:** the Almoravids (Sijilmasa 1055 → Aghmat 1058 → Fez 1069 → Tlemcen 1081 → Ceuta 1083; al-Andalus 1091–1145 piece by piece, Zaragoza 1110–1118; Majorca under the Banu Ghaniya to 1203) and the Almohads (Tinmel c. 1124 → Marrakesh 1147 → Béjaïa 1152 → Mahdia and Tripoli 1160 → Murcia and Valencia 1172 → Las Navas 1212 → leaving Spain 1228, the Hafsids 1229, the Zayyanids 1236, the Marinids 1245–1269).
  - **Sultanates:** the Marinids (Fez 1248, Marrakesh 1269, Tangier and Sijilmasa 1274; Tlemcen 1337, Tunis 1347 and the rout of 1348; Abu Inan's return 1352–1359), the Wattasids (Fez 1472–1549), the Saadians (the Sous 1510, Marrakesh 1525, the Treaty of Tadla 1527, Fez 1549, al-Mansur, the break-up after 1603), the 1600s crisis states (Tazerwalt at Iligh, the zawiya of Dila, the Republic of Salé) and the Alaouites (Tafilalt 1631, Taza 1664, Fez 1666, Dila and Marrakesh 1668, the Sous 1670, Moulay Ismail, Mohammed III).
  - **Coastal enclaves:** Portuguese Morocco (Ceuta 1415 … Mazagan to 1769), the Spanish presidios (Melilla 1497, Larache 1610–1689, La Mamora 1614–1681, Ceuta from 1640) and English Tangier (1662–1684), each a small shape notched out of whoever held that shore that year.
- **How it is drawn:** 28 shared-border pieces (16 for Morocco, 5 for Algeria / Tunisia / Tripoli, 7 for al-Andalus and Majorca) merged per keyframe; coasts read off the globe's own land along the Atlantic and Mediterranean and nudged 0.04° inland; 13 enclaves with matching notches. See docs/DATA.md.
- **Existing shapes fixed (`applyMoroccoShapeFixes`):** Rome's single 'mediterranean' ring no longer sweeps over Mauretania — its west is now two regions that are the same in every keyframe (Hispania, and Africa and Numidia from the Ampsaga to the Gulf of Gabès), so they never morph across Mauretania, and the ring's west edge runs through the sea; the western-basin sea hole is no longer needed. The French "Maghreb" shape gets an 1814 keyframe so it no longer grows over Fez before 1815.
- **No overlaps:** the pack's shapes never overlap each other, or Rome, Carthage, the Umayyads, Byzantium, the Ottomans, Spain, Portugal or France, at any year −210 to 1815 (checked every 5 years on a 0.1° grid), and each enclave is drawn by exactly one shape in every year it changes hands.
- **Cities: +20** — Iol → Caesarea → Cherchell, Septem → Sabta → Ceuta, Rusaddir → Melilla, Zilil → Asila → Arzila → Asilah, Pomaria → Agadir → Tlemcen, Taza, Oujda, Salé, Meknes, Taroudant, Safi, Larache, Tinmel, Chefchaouen, Tétouan, Santa Cruz do Cabo de Gué → Agadir, Mazagan → El Jadida, Mogador → Essaouira, Tiznit, Villa Bens → Tarfaya.
- **Pins: +54**, using `country:morocco:<item>` refs, from Juba II's Caesarea and the Arch of Caracalla through Sijilmasa, the Qarawiyyin, Marrakesh, Sagrajas, Tinmel, Las Navas, Fez el-Jdid, Ibn Battuta, Río Salado, the Three Kings, the Portuguese and Spanish forts, the Republic of Salé, Moulay Ismail's Meknes, Mogador, Isly, the Treaty of Fez, Annual, independence and the Green March.
- **Timeline (`data/countries/morocco.json`): +4 sourced items** — "Barghawata, Sijilmasa & the Zenata", "Portuguese & Spanish Enclaves" (new "European Enclaves" category), "Crisis of the 1600s: Salé, Dila & Tafilalt" and "Rif War & the Republic of the Rif" (11 items now).
- **Validate:** Morocco is a third row in `scripts/check-country-packs.js` (land, rings, sources, 44 capitals and type sites inside their shapes, who is on / gone at sample years, Rome / France no longer over Fez, Volubilis, Caesarea, Tlemcen or Oujda, no overlap with the pack or its neighbours, one shape per enclave, clean piece merges). `check-overlay-lifespan.js` now expects Rome's 'mediterranean' ring to carry only the eastern sea hole.
- **Honest caveats:**
  - Before the 1800s Morocco had no surveyed borders; outlines are the regions chronicles say each dynasty ruled or taxed. Mountains and desert are drawn as part of the state even where tribes were often independent. Mauretania is conjectural.
  - Changes are one-year steps, not campaigns; some short gaps are left empty where no one source says who ruled (e.g. Fez 1465–1471, the Atlantic plains 1147–1149, Tangier 1248–1274).
  - Not drawn yet: al-Ayyashi's jihad state, Tetouan's Naqsis, the Hintata of Marrakesh, the Azafids of Ceuta, Marinid holdings in Spain, Saadian rule on the Niger after 1591, and Algeria and Tunisia's own dynasties (Rustamids, Zirids, Hammadids, Hafsids, Zayyanids) — those belong to the Maghreb pass. The Umayyad Maghreb (680–750) stays schematic.
  - Enclaves are drawn a little larger than the forts so they show up. The Rif Republic (1921–1926) is after the 1815 handoff, so it is a timeline item with pins, not a shape.
- **Next:** pack 1 globe backfill continues with **Kenya**, then Iraq, the Philippines.

#### Day 69 — Pack 1 globe backfill: Kenya — done-in-PR

Kenya had a sourced timeline, but on the globe only one schematic Swahili-coast blob from Lamu to Mombasa, the peoples and presence layers, and modern borders from 1888. No town-state, Fort Jesus or the Mazrui showed. Now the coast and the Wanga Kingdom are drawn from the 760s to 1815, where the nations layer takes over (it draws Kenya from 1888, and leaves 1815–1888 empty).

- **Shapes (`src/globe-pack-kenya.js`, lazy globe chunk): 11 polities, 114 keyframes** (every change is a one-year step), each with a certainty level and reason, sources and links to Kenya's timeline items:
  - **Lamu archipelago:** Shanga (760–1425), Manda (850–1300), Pate (from c. 1300, ruling the archipelago in the 1700s), Siyu and Faza, and Lamu (from c. 1300; Omani governor after Shela, 1812–1813).
  - **Mainland coast:** Gedi (c. 1050–1640), Mombasa / Mvita (from al-Idrisi's 1151), Malindi (from c. 1250; Portugal's ally, its sultans moved to Mombasa in 1592).
  - **Portuguese Mombasa (Fort Jesus)** 1593–1698 (with Malindi to 1630; Dom Jerónimo's revolt 1631–32 shown as a label), then **Omani and Mazrui Mombasa** 1698–1815 (Portuguese return 1728–29 as a label; Mazrui from 1746).
  - **Wanga Kingdom** (c. 1650–1815) around Elureko (Mumias) — conjectural outline.
- **Existing shapes fixed (`applyKenyaShapeFixes`):** the Swahili city-states' schematic 'north' region over the Kenya coast is dropped; the towns are now drawn one by one. `check-inland-africa.js` checks Zanzibar instead of Mombasa for that shape.
- **Cities: +16** — Shanga, Manda, Pate, Siyu, Faza, Takwa, Gedi, Mnarani, Rabai, Takaungu, Elureko → Mumias, Machakos, Kisumu, Nyeri, Nakuru, Eldoret.
- **Pins: +50**, using `country:kenya:<item>` refs, from Lothagam North and the Periplus through Shanga's mosques, al-Idrisi, Ibn Battuta, Gedi, Zheng He at Malindi, da Gama turned away from Mombasa, Almeida, Fort Jesus and its sieges, Shela, Thimlich Ohinga, the kayas, Elureko, Krapf and Rebmann, the Uganda Railway, Nairobi, Mau Mau, independence and the 2010 constitution.
- **Timeline (`data/countries/kenya.json`): +4 sourced items** — "Pate, Lamu & the Lamu Archipelago", "Fort Jesus & Portuguese Mombasa", "Omani & Mazrui Mombasa" and "Wanga Kingdom & the Peoples of the Interior" (new "Interior Kingdoms & Peoples" category; 11 items now).
- **Validate:** Kenya is a fourth row in `scripts/check-country-packs.js` (land, rings, sources, 19 capitals and sites inside their shapes, who is on / gone at sample years, the old Swahili shape no longer over Mombasa, Malindi or Lamu and its 'north' region stays dropped, no overlap with the pack, the Swahili city-states, Ethiopia or Buganda 750–1815).
- **Honest caveats:**
  - Swahili towns ruled a town and its nearby farmland, not surveyed territory; each hinterland is a small, approximate strip. Shanga, Manda, Gedi and the Wanga Kingdom are conjectural outlines.
  - Left empty where no source says who ruled: Kilifi creek (Mnarani), the Tana delta (Ungwana), the south coast (Vumba Kuu), the Kiunga mainland and the interior apart from Wanga. Interior peoples stay in the peoples layer.
  - Short interludes (1631–32, 1728–29) are labels on a continuous shape, because one shape can't have a gap in time.
  - 1815–1888 has no shape over Kenya (Zanzibar's coastal strip and the Mazrui after 1837 aren't drawn yet).
- **Next:** pack 1 globe backfill continues with **Iraq**, then the Philippines.

#### Day 70 — Pack 1 globe backfill: Iraq — done-in-PR

Iraq had a sourced timeline, but on the globe only one schematic "Mesopotamia" sphere (3000–560 BCE), seven-point blobs for the Parthian, Sasanian, Umayyad and Abbasid provinces, and nothing between the Abbasid collapse and the 1815 nations layer except a stray Mongol wedge and Safavid / Ottoman outlines in the wrong years. Now Iraq's own states are drawn from the first city-states (c. 2900 BCE) to 1815, where the nations layer takes over (Ottoman Iraq, the Mandate, the Kingdom, the Republic).

- **Shapes (`src/globe-pack-iraq.js`, lazy globe chunk): 26 polities, 290 keyframes** (every change is a one-year step), each with a certainty level and reason, sources and links to Iraq's timeline items, built from 10 shared-border pieces (the western and eastern Jazira, Suhum, Assyria, the Kurdish uplands, Akkad, the Diyala, northern and southern Sumer, the Sealand) whose west edge is the Greek-world `MESOPOTAMIA | SYRIA` border:
  - **Bronze and Iron Age:** the Early Dynastic city-states, Akkad, Ur III, Isin, Larsa, Eshnunna, Mari, Assyria (Old, Upper Mesopotamia, Middle and Neo-Assyrian), Mitanni, Babylonia (First Dynasty, Kassite and later), the First Sealand dynasty, the Neo-Babylonian Empire.
  - **Islamic era:** the Hamdanids of Mosul, the Buyid emirs, the Uqaylids, the Seljuks, the Zengid and Lu'lu'id atabegs of Mosul, the restored Abbasid caliphate (1157–1258), the Ilkhanate, the Jalayirids, the Qara and Aq Qoyunlu, Safavid Iraq (1508–34) and Safavid Baghdad (1623–38), Ottoman Iraq (the eyalets of Baghdad, Mosul, Basra and Shahrizor; the Mamluk pashas from 1749) and the house of Afrasiyab at Basra (1596–1668).
- **Existing shapes fixed (`applyIraqShapeFixes`):** the Mesopotamia sphere is dropped; the Parthian, Sasanian, Umayyad and Abbasid Iraq regions are redrawn from the pieces (with the missing keyframes filled, and the Abbasid shape cut back to Iraq from 929 and ended in 944); the Hittite, Roman (117), Egyptian, Phoenician, Byzantine, Mongol, Safavid and Ottoman shapes that spilled over Iraq in other powers' years are trimmed to a fixed line outside it; the Safavid 'mesopotamia' region (wrongly 1550–1650) goes; the Achaemenid 'meso-syria' region arrives in 539 BCE as a one-year step.
- **Cities: +19** (Isin, Larsa, Nuzi, Erbil, Kirkuk, Harran, Shubat-Enlil, Dur-Kurigalzu, Kalhu / Nimrud, Dur-Sharrukin, Tikrit, Hatra, Karbala, Wasit, Najaf, Hilla, Sulaymaniyah, Amara, Ramadi); Mosul now dates from 637.
- **Pins: +73**, using `country:iraq:<item>` refs, from Uruk's tablets and the Royal Tombs of Ur through Hammurabi, Ashurbanipal's library, the fall of Nineveh, Gaugamela, Hatra, Karbala, Samarra, the Buyids, Tughril Beg, Timur, Suleiman, Murad IV, the Mamluk pashas, the 1920 revolt, Faisal I, Baba Gurgur, 1958, Halabja and the 2017 referendum.
- **Timeline (`data/countries/iraq.json`): +6 sourced items** — client kingdoms (Characene, Hatra, Adiabene, the Lakhmids), the Arab conquest and Umayyad Iraq, the emirs and sultans, the Ilkhanate / Jalayirids / Turkmen, the Mamluk pashas and the Kurdistan Region (13 items now).
- **Validate:** Iraq is a fifth row in `scripts/check-country-packs.js` (land, rings, sources, 59 capitals and sites inside their shapes, who is on / gone at 23 sample years, the Mesopotamia sphere stays dropped (`droppedEntities`), each trimmed shape has a `notOver` test (`trimmed`), 18 anachronisms stay fixed, no overlap with the pack or 16 neighbouring empires, 2900 BCE–1815 CE). `check-confidence.js` and `check-overlay-lifespan.js` now test the city-states / Akkad instead of the old sphere.
- **Honest caveats:**
  - Dates before 1000 BCE follow the middle chronology (± a few decades). Mesopotamian kingdoms ruled cities and canals; the outlines between them are hand-drawn approximations along rivers, the desert edge and the Zagros foothills. The city-states, Mitanni and the Sealand are conjectural.
  - Only the Iraqi part of wider realms is drawn by the pack (Elam, Akkad's and Assyria's Syrian, Anatolian and Egyptian conquests, the Iranian lands of the Buyids, Seljuks, Ilkhans and Turkmen are not). The Persian, Hellenistic, Parthian and Sasanian centuries still use the older empire shapes; the client kingdoms (Characene, Hatra, Adiabene, the Lakhmids) are timeline items and pins, not shapes.
  - Gaps are left where no one held the land: e.g. the Gutian years after Akkad, and southern Iraq when tribes and local emirs held it. Short interludes (Yasmah-Adad at Mari, the Zand occupation of Basra 1776–79) are labels.
- **Next:** pack 1 globe backfill continues with **the Philippines**.

#### Day 71 — Pack 1 globe backfill: the Philippines — done-in-PR

The Philippines had a sourced timeline, but on the globe only the Day 59 Tondo, Sulu and Maguindanao outlines and a schematic Spanish 'philippines' blob drawn from 1550 (fifteen years before Legazpi landed) over the whole archipelago, Moro south included, until 1815. Now the islands' own states are drawn from Tondo (900) to 1815, where the nations layer takes over (Spanish Philippines, the US, the Commonwealth, the Republic). This completes the pack 1 globe backfill.

- **Shapes (`src/globe-pack-philippines.js`, lazy globe chunk): 12 polities, 124 keyframes** (every change is a one-year step), each with a certainty level and reason, sources and links to the Philippines timeline items, built from 32 island pieces (see `docs/DATA.md`):
  - **Rajahnates and lowland polities:** Tondo (redrawn), Maynila, Namayan, Caboloan (Pangasinan), Butuan, Cebu.
  - **Sultanates:** Sulu (redrawn; Jolo lost to Spain 1638–46, Sabah from 1704, disputed), Maguindanao (redrawn; Kudarat's height with Sarangani and Davao), Buayan, the Lanao sultanates (from 1616).
  - **Spanish Philippines (1565–1815):** Cebu 1565, Panay 1569, Manila 1571, Luzon's lowlands 1572, Bicol and the Visayas 1575, Cagayan 1581, Caraga 1609, Taytay 1623, the north Mindanao coast 1626, Zamboanga 1635 (abandoned 1663, back 1718), Jolo 1638–46; the British in Manila 1762–64 as a label.
  - **Dagohoy's Bohol** (1744–1815 on the globe; the revolt ends in 1829).
- **Existing shapes fixed (`applyPhilippinesShapeFixes`):** the Spanish Empire's schematic 'philippines' region is dropped; Tondo, Sulu and Maguindanao are replaced by the pack's versions (Tondo gets a colour of its own instead of Qing China's).
- **Cities: +17** (Butuan, Vigan, Nueva Segovia → Lal-lo, Nueva Cáceres → Naga, Iloilo, Malolos, Sawangan → Legazpi, Tandag, Taytay, Cagayan → Cagayan de Oro, Zamboanga, Dansalan → Marawi, Tagbilaran, Basco, Nueva Vergara → Davao, Quezon City, Dadiangas → Buayan → General Santos); Cebu is now Sugbu from 1225.
- **Pins: +75**, using `country:philippines:<item>` refs, from Butuan's Song missions and Limasawa through Bangkusay, Fort Pilar, Corcuera at Jolo, La Naval, the British in Manila, Silang and Dagohoy, Gomburza, Pugad Lawin, Rizal, Kawit, Malolos, Palanan, Bud Dajo, Bataan, Leyte, independence, martial law, EDSA, Pinatubo, the Marawi siege and the BARMM.
- **Timeline (`data/countries/philippines.json`): +6 sourced items** and a new Moro category — the Luzon polities, Butuan and Cebu, the Moro sultanates, the Moro wars, the revolts against Spain and Bangsamoro (12 items now).
- **Validate:** the Philippines is a sixth row in `scripts/check-country-packs.js` (land, rings, sources, 35 capitals and sites inside their shapes, who is on / gone at 14 sample years, the Spanish 'philippines' region stays dropped, 8 anachronisms stay fixed, no overlap with the pack, Brunei or the Spanish Empire, 900–1815). The row sets `fineLand: true` because Jolo and Tawi-Tawi exist only in the fine land. `check-southeast-asia.js` checks the redrawn Tondo, Sulu and Maguindanao; `check-overlay-lifespan.js` checks the Spanish blob is gone.
- **Honest caveats:**
  - Precolonial extents are conjectural: the polities ruled people and river mouths, not lines. Namayan's and Cebu's early dates are presumed (Santa Ana graves, Zhao Rugua's 1225 list). The 1575 Visayas step is a single date for a conquest that took years.
  - Sulu's founding (1405 or 1457) and the Sabah cession (1658 or 1704) are disputed; the pack uses 1405 and 1704 and says so.
  - The Cordillera, Sierra Madre, most of Palawan, Basilan and inland Mindanao are left empty: no lowland power held them before 1815.
  - Post-1815 states (Biak-na-Bato, the Malolos Republic, the US era, the Japanese occupation, Bangsamoro) are timeline items and pins, not shapes; the nations layer draws Spanish, US and independent Philippines. Dagohoy's Bohol is drawn only to 1815.
- **Next:** pack 1 globe backfill is complete pending merges. Next is item 2, **Central Asia** (pack 2, Timeline + Globe).

### 13. Fill the globe, region by region (after the packs above)

Once packs reach a region, do a pass over the whole region to fill gaps between countries:

- Central Asia and the steppe
- The Caucasus
- The Andes before the Inca (Chavín, Moche, Nazca, Wari, Tiwanaku, Chimú)
- Central Africa
- Pacific islands (Lapita, Polynesian voyaging, Tonga, Hawaiʻi)
- Siberia and Arctic peoples
- Also: the Horn of Africa, Tibet and the Himalaya, Mongolia and Manchuria, the Amazon basin, Australia beyond the Aboriginal band, and Madagascar

**City and pinned-event density.** Each pass also adds cities and pinned events, so zooming in anywhere usually turns up something.

**Density check (cheap).** Add a small script, `scripts/density-report`, to run by hand, not in the build. It prints a grid of regions × centuries with shape, city and event counts and flags empty cells. That empty-cell list is what the regional passes work from. It only reads the existing static data and does not change the data format.

### 14. Topic packs (later)

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

### 15. Richer modern history (later)

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

### 16. Visual polish

Make the project feel like a polished interactive atlas.

- clearer visual hierarchy
- refined event cards
- better empty/loading states
- improved typography and spacing
- more intentional color system

### 17. Performance

As datasets grow, optimize rendering and interaction.

- memoized swim-lane layouts
- indexed hit-testing
- lazy-loaded view data
- reduced label density on small screens
- profiling for mobile devices

### 18. Accessibility

Canvas-heavy interfaces need a semantic layer.

- keyboard navigation
- screen-reader-accessible event lists
- detail panels with proper focus management
- reduced-motion options
- high-contrast improvements

### 19. PWA/offline support

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
33. Phase 4b (Arthur, 8 Oct: deep zoom + real borders) — Day 38 modern nations 1914–2025 ✅ (merged) → Day 39 zoom closer without floating shapes ✅ (merged) → Day 40 review A: layer toggles + zoomable scrubber ✅ (merged) → Day 40 review B: NASA GIBS tiles + Day 42 finer borders ✅ (merged) → dated cities (built with Phase 4c item 3, Day 43) ✅ (merged, #49) → Day 43 finer splits.
34. Phase 4c (Arthur, 8 Oct) — real nations 1815–1914 (Day 41) ✅ (merged, #47) → labels by zoom (Day 42) ✅ (merged, #48) → dated cities + pinned events (Day 43) ✅ (merged, #49) → showing uncertainty (Day 44) ✅ (merged, #50) → trade routes and migrations → coverage between empires → space background (stars, Milky Way, constellations).
35. Phase 5 continued — topic pack 1 (item 13, e.g. Medicine & disease or Climate history) or country pack 2, alternating; keep globe-entity links in sync; only revisit topology if a review spots stiff morphs.
36. Feedback & paid features discovery (Arthur, 9 Oct) — Day 45 feedback button ✅ (merged, #51) → Day 50 Formspark endpoint ✅ → tally "would you pay for…?" answers.
37. Custom domain theeverythingtimeline.com (Day 46) ✅ (merged, #52) → per-year share pages + og images.
38. Aesthetics refresh + Timeline/Globe switch (Arthur, 9 Oct) — Day 47 ✅ (merged, #53).
39. Globe opens full screen by default (Arthur, 9 Oct) — Day 48 ✅ (merged, #54).
40. Globe load speed + globe/timeline loaders (Arthur, 9 Oct) — Day 49 ✅ (merged, #55).
41. Data architecture — static data files (Day 51) ✅ (merged, #57).
42. Tip jar (Day 52) ✅ (merged, #58; addresses guarded by scripts/check-support.js).
43. Phase 4c item 5 — trade routes (Day 53) ✅ (merged, #59) → migrations (Day 55, step 5.2) ✅ (in review, #61).
44. Ancient Greek world 1600–146 BCE (Arthur, 11 Oct; Day 56) ✅ (done-in-PR, #62).
45. Early medieval world 500–1000 (Phase 4c step 6.1; Day 57) ✅ (done-in-PR, #63; stacks on #62).
46. Inland Africa (Phase 4c step 6.2; Day 58) ✅ (done-in-PR).
47. Southeast Asia (Phase 4c step 6.3; Day 59) ✅ (done-in-PR).
48. Native American nations after 1500 (Phase 4c step 6.4; Day 60) ✅ (done-in-PR).
49. Phase 4c step 7.1 — stars / Milky Way (Day 61) ✅ (done-in-PR).
50. Phase 4c step 7.2 — constellations (Day 62) ✅ (done-in-PR).
51. Item 8 — lidar finds: 8.1 hidden-cities pins (Day 63) ✅ (merged, #77) → 8.2 honest shape updates (Day 64) ✅ (done-in-PR).
52. Phase 5 country packs covering both views (Timeline + Globe): pack 1 globe backfill — Peru (Day 65) ✅ (merged, #79).
53. Pack 1 globe backfill — Ghana (Day 66) ✅ (merged, #80).
54. World population readout on the globe (Day 67) ✅ (done-in-PR).
55. Pack 1 globe backfill — Morocco (Day 68) ✅ (merged, #82).
56. Pack 1 globe backfill — Kenya (Day 69) ✅ (done-in-PR).
57. Pack 1 globe backfill — Iraq (Day 70) ✅ (done-in-PR).
58. Pack 1 globe backfill — Philippines (Day 71) ✅ (done-in-PR). Pack 1 globe backfill complete pending merges of #83, #84 and #85.
59. **Now: Phase 5 pack 2 — Central Asia (Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan, Afghanistan), Timeline + Globe. Country packs stay the ongoing default for the daily routine, followed by region-by-region fill-the-globe passes.**

The globe is the exciting flagship, but search, deep links, validation, and sources make it much easier to build without turning the project into a beautiful historical junk drawer.

## Globe load speed + loading state (Arthur, 9 Oct 2026: "the globe takes a long time to load") — Day 49, done (merged, PR #55)

Merged together with #54 (fullscreen by default): the loader shows over the full-screen globe too.

- **Done in this PR:**
  - Stubbed the unused WebGPU build of three, which three-globe imports. The globe.gl chunk drops from 1.35 MB to 0.65 MB raw.
  - Self-hosted the NASA Blue Marble earth as WebP. A 43 KB 1024px texture paints first, and the 4096px one (~580 KB; 2048px ~185 KB on phones; was a 1.4 MB JPEG from unpkg) swaps in once the globe is idle.
  - The globe code and first texture start together on entry and are prefetched on Globe hover, focus or touch.
  - The nations TopoJSON (~155 KB gzipped) loads only when the year needs it (1815+); otherwise it loads shortly after the earth is up.
  - Branded loading state: gold ring + mark, "Loading the globe…", and Earth → Borders → Cities steps. It fades once the earth and borders are on screen.
  - Day 49b (Arthur: "you need a loader on the Timeline view too"):
    - The same gold ring + mark with "Loading the timeline…" is inlined in `index.html`, so it shows before the CSS / JS bundle. It fades once the canvas has drawn a full frame with fonts ready; a `?view=globe` load hands over to the globe loader.
    - Switching to a timeline view that still waits on fonts shows the ring inside the canvas area.
    - Manrope is self-hosted (`public/fonts`, OFL) with a preload, replacing the render-blocking Google Fonts CSS.
    - The saved theme is applied before first paint.
- **Further ideas (not done):**
  - Split the 900 KB main bundle so the landing page and globe load less JS. The biggest part is globe code (`globe-overlays`, `globe-people`, `globe-presence`, the nations tables, ~580 KB of source) that `main.js` imports statically for the detail panel and links; the 38 country timelines are another ~285 KB. Splitting them needs async detail and search paths, so it is not a quick change. This is the main lever for timeline load time on phones.
  - Precompute polygon triangulation at build time, or in a worker, for the hand-drawn layers.
  - Delay shader warm-up and label placement to idle frames on phones.
  - Self-host Manrope (one less origin).
  - Serve a 2048px texture to small screens.
  - Lazy-load cities and pins only when zoomed in enough to show them.
