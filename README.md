# The Everything Timeline

An interactive, canvas-based history explorer that maps major events from the Big Bang to the age of AI.

The project is built as a Vite-powered static web app. It combines a compressed cosmic-scale timeline with multiple swim-lane views for civilizations, countries, technology, science, religion, philosophy, art and culture, economics, wars, and cosmic history.

## What it does

- Shows a broad “everything” timeline from roughly 13.8 billion years ago to the present.
- Uses a logarithmic scale for the main cosmic timeline so deep time and recent human history can coexist in one view.
- Provides topic-specific swim-lane timelines for comparing overlapping periods and developments.
- Includes country-focused timelines through a searchable country picker.
- Supports zooming, panning, fit-to-view, hover tooltips, click-through detail panels, a minimap, and light/dark themes.
- Deploys as a static site through GitHub Pages.

## Current views

The app currently includes:

- Timeline / “everything” overview
- Cosmic History
- Civilisations
- Technology
- Science
- Religion
- Philosophy
- Art & Culture
- Economics
- Wars & Conflicts
- Country timelines, including Argentina, Australia, Brazil, Canada, China, Egypt, Ethiopia, France, Germany, Greece, India, Indonesia, Iran, Italy, Japan, Mexico, Netherlands, Nigeria, Pakistan, Poland, Portugal, Russia, Saudi Arabia, South Africa, South Korea, Spain, Sweden, Thailand, Turkey, United Kingdom, United States, and Vietnam

## Tech stack

- Vanilla JavaScript modules
- HTML canvas rendering
- Vite
- GitHub Pages deployment via GitHub Actions

## Project structure

```text
.
├── index.html                  # App shell and controls
├── src/
│   ├── main.js                 # App state, event handling, view selection, canvas orchestration
│   ├── swim-lane-view.js       # Generic swim-lane layout, rendering, minimap, and hit testing
│   ├── events.js               # Main “everything” timeline events and eras
│   ├── cosmic-history.js       # Log-space cosmic history swim-lane data
│   ├── civilisations.js        # Civilization swim-lane data
│   ├── technology.js           # Technology timeline data
│   ├── science.js              # Science timeline data
│   ├── religion.js             # Religion timeline data
│   ├── philosophy.js           # Philosophy timeline data
│   ├── art.js                  # Art and culture timeline data
│   ├── economics.js            # Economics timeline data
│   ├── wars.js                 # Wars and conflicts timeline data
│   ├── countries/              # Individual country timeline datasets
│   ├── style.css               # App layout, controls, responsive styles, and CSS themes
│   └── theme.js                # Canvas color palettes and theme persistence
└── .github/workflows/deploy.yml # GitHub Pages build/deploy workflow
```

## Running locally

Install dependencies:

```bash
npm ci --include=dev
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

> Note: in environments where `NODE_ENV=production` is set globally, `npm ci` may omit dev dependencies. Use `npm ci --include=dev` so Vite is installed for local builds.


## Pull request previews

Pull requests are configured to publish mobile-testable preview builds under:

```text
https://arthur-fox.github.io/the-everything-timeline/pr-preview/pr-<PR_NUMBER>/
```

The preview workflow comments the exact URL and a QR code on each PR. When a PR is closed, its preview is removed from the `gh-pages` branch.

> Repository setup note: this branch-based preview flow requires GitHub Pages to serve from the `gh-pages` branch. If Pages is instead set to GitHub Actions-only deployment, the workflow can still publish preview files, but GitHub Pages will not serve them until the Pages source is changed.

## Deployment

The repository includes GitHub Actions workflows that build the Vite app and publish the production site to the `gh-pages` branch whenever changes land on `main`. Pull requests publish temporary preview builds under `pr-preview/pr-<PR_NUMBER>` on that same branch.

## Development notes

- Main timeline dates use negative years for BCE and positive years for CE.
- The cosmic overview uses log-space mapping to make billions of years navigable.
- Most topic views share the generic swim-lane renderer. Each dataset exports `items` plus `categories`, where items include `start`, `end`, `region`, `description`, `icon`, and optional `periods`.
- Countries are registered in `src/main.js`; adding a country generally means adding `src/countries/<country>.js` and registering it in `COUNTRY_REGISTRY`.
- Theme colors are split between CSS variables for DOM elements and `src/theme.js` palettes for canvas drawing.
- Globe nations (1815–2025) live in `src/globe-nations-table.js` (1914–2025) and `src/globe-nations-table-1815.js` (1815–1914), dated periods built from Natural Earth admin units (shared unit groups in `src/globe-nations-units.js`). After editing it, run `npm run build:nations` to regenerate `src/data/nations.topo.json`, the close-zoom `src/data/nations-fine.topo.json` and `src/data/nations-colors.js` (downloads Natural Earth once into `.cache/`, or set `NE_ADMIN1=/path/to/ne_10m_admin_1_states_provinces.geojson`). `npm run validate` checks the result.

## Data credits

- Globe borders 1815–2025: [Natural Earth](https://www.naturalearthdata.com/) admin-0 / admin-1 boundaries (public domain), regrouped by year for this project. The dates (which provinces belonged to which state, when) are hand-written from standard historical facts. No licensed historical-border dataset is bundled: CShapes 2.0 (CC BY-NC-SA) and historical-basemaps (GPL-3.0) are not used.
- Globe imagery: NASA Blue Marble (NASA Earth Observatory); close-up tiles from [NASA GIBS](https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api) (Blue Marble shaded relief, ESDIS).
- Historical overlays before 1815, peoples and presence: hand-drawn schematic shapes (see each entity's sources).

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full project roadmap, including search, deep links, data validation, citations, story/compare modes, broader country and topic coverage, and the planned Globe Mode for spatial historical overlays.
