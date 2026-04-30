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

### 1. Search

Add search as a core navigation tool.

- Search within the current view.
- Later, search across all views.
- Result click/tap should pan/zoom to the item and open its detail panel.
- Mobile search should feel like a command palette or bottom sheet.

### 2. Active view and context labels

Make it obvious what the user is looking at.

- Show labels such as `Technology`, `Civilisations`, or `🇯🇵 Japan`.
- Improve the current `Countries...` dropdown sentinel so selected countries are clearer.
- Consider a compact mobile header that prioritizes the current context.

### 3. Deep links

Make timeline states shareable and restorable.

Potential URL patterns:

```text
/the-everything-timeline/?view=technology&id=internet-web
/the-everything-timeline/?view=country:us&id=civil-war
/the-everything-timeline/?view=civilisations&year=117
```

Deep links should eventually support:

- selected view
- selected item
- approximate year/range
- active filters

### 4. Better mobile controls

Continue improving the phone experience.

- Compact top bar.
- More ergonomic zoom/filter controls.
- Better current-view display.
- Refined bottom sheets for search, filters, and details.

## Phase 2 — Trust and data quality

The project should become more credible as it grows.

### 5. Data validation

Add validation scripts and CI checks for timeline datasets.

Checks should include:

- duplicate IDs
- missing IDs
- invalid date ranges
- periods outside parent item dates
- missing icons/descriptions
- regions/categories that do not exist
- country registry mismatches

### 6. Sources and citations

Add optional source fields to timeline items.

Possible shape:

```js
sources: [
  { title: 'Wikipedia — Roman Empire', url: 'https://en.wikipedia.org/wiki/Roman_Empire' },
  { title: 'Britannica — Roman Empire', url: 'https://www.britannica.com/place/Roman-Empire' }
]
```

Detail panels should display sources gracefully without overwhelming the main interface.

### 7. Content schema

Formalize the data model.

- Define common item/category shapes.
- Consider TypeScript or JSON schema later.
- Keep country/topic data consistent before expanding aggressively.

## Phase 3 — Exploration features

These features make the app more than a static timeline.

### 8. Filters

Allow users to filter within views.

Examples:

- Technology: Computing, Medicine, Energy, Transport
- Civilisations: Europe, Africa, East Asia, Americas
- Wars: Ancient, Medieval, Modern, Global
- Countries: political, cultural, scientific, economic

### 9. Compare mode

Let users compare timelines or regions.

Possible examples:

- Rome vs Han China
- Technology vs Wars
- United States vs United Kingdom
- Religion vs Philosophy

This could start simple as two synchronized swim-lane panels before becoming more visual.

### 10. Bookmarks and saved trails

Let users save interesting events locally.

- Bookmark events/items.
- Create a simple reading list.
- Later, support shareable trails.

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

#### PR A — Globe view shell

- Add `Globe` to the view selector.
- Create a dedicated globe view container.
- Add a year slider and current-year label.
- Include placeholder explanatory copy.

#### PR B — Interactive globe prototype

- Render an interactive 3D globe.
- Support mouse/touch rotation.
- Support zoom.
- Keep mobile performance in mind.

Likely technologies to evaluate:

- Three.js
- Globe.gl
- D3 geo projections / TopoJSON for a possible 2D fallback

#### PR C — Historical overlay data model

Introduce a data model for spatial entities.

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

#### PR D — First historical overlays

Start with a small, visually meaningful set:

- Roman Empire
- Han/Tang/Ming/Qing China
- Mongol Empire
- Islamic Caliphates
- Ottoman Empire
- British Empire
- Spanish Empire
- Inca Empire

#### PR E — Timeline integration

- Selecting a year updates the globe overlays.
- Tapping a region opens details.
- Details link back to timeline/civilisation entries.
- Deep links support globe year/entity state.

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

## Phase 5 — Content expansion

Expand content after the navigation and data foundations are stronger.

### 12. Country coverage

Move toward comprehensive country coverage, but only with validation in place.

Goals:

- consistent data shape
- good coverage across regions, not only Europe/US
- major political, cultural, scientific, economic, and conflict events
- sources for contentious or modern claims

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
5. Filters for swim-lane categories.
6. Globe view shell.
7. Interactive globe prototype.

The globe is the exciting flagship, but search, deep links, validation, and sources make it much easier to build without turning the project into a beautiful historical junk drawer.
