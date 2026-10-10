# The Everything Timeline

An interactive, canvas-based history explorer that maps major events from the Big Bang to the age of AI.

**Live:** https://theeverythingtimeline.com/ (formerly https://arthur-fox.github.io/the-everything-timeline/, which redirects once the custom domain is set).

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
https://theeverythingtimeline.com/pr-preview/pr-<PR_NUMBER>/
```

(Before the custom domain is set they live at `https://arthur-fox.github.io/the-everything-timeline/pr-preview/pr-<PR_NUMBER>/`; afterwards that address redirects. The workflow still builds with `--base=/the-everything-timeline/pr-preview/pr-N/`; `vite.config.js` drops the old prefix when it sees the custom domain is live — see *Custom domain*.)

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
- Globe labels (Day 42) come from the same data: country names are the period names in the nations table, shortened by `src/globe-label-names.js` ("Kingdom of Prussia" → "Prussia", "Gold Coast (British)" → "Gold Coast (Br.)"); `npm run build:nations` also stores a label anchor per shape. Seas, mountain ranges, deserts and other physical names are built by `npm run build:places` into `src/data/places.json`. `scripts/check-labels.js` (part of `npm run validate`) checks era-correct names, anchors and places. Add `&labels=0` to a globe link to hide labels.
- Globe cities and event pins (Day 43): dated cities live in `src/globe-cities.js` (one row per city: position, rank 1–4, founding / abandonment year, the name at each date, optional rank changes) and event pins in `src/globe-event-pins.js` (each pin points at an existing timeline entry by `event:<title>` or `<view>:<id>`, with a year, place and short label). `scripts/check-cities.js` (part of `npm run validate`) checks rename order, era samples, that cities and land pins sit on land, and that every pin resolves to a timeline entry near its dates. To also check positions against Natural Earth populated places, download `ne_10m_populated_places_simple.geojson` (from the natural-earth-vector repo's `geojson/` folder) into `.cache/natural-earth/`. Add `&cities=0` or `&events=0` to a globe link to hide them.

## Design

Brand "Gilded Night" (Day 47): ink-navy space background, warm gold accent, **Manrope** throughout (800 for the wordmark and headings, 400–600 for UI), both from Google Fonts with system fallbacks. All colours, fonts, the type scale, spacing and radii are CSS variables at the top of `src/style.css`; the timeline canvas reads the same tokens through `src/theme.js`. Light mode is a parchment variant. The mark / favicon live in `index.html` and `public/favicon.svg`.

## Feedback

A small **Feedback** button sits in the header (top right; an icon on phones) and, in the full-screen globe, bottom-left. It opens a panel with a 1–5 emoji rating, "What would you love to see?", an optional "Would you pay for…?" list of candidate premium ideas, and an optional email. The link to the exact view (view, year, `at=` camera, selected entity / item), screen size and app version (`package.json` version + git commit, injected by `vite.config.js`) are attached, and the panel says so ("Sends your answers + …"). Nothing is sent until Send is pressed; the only thing stored is a local "feedback sent" note (`localStorage`), so it never nags. `?feedback=1` opens the panel directly.

Where it goes is set in one file, `src/feedback-config.js`:

- **`FORM_ENDPOINT` empty (default):** "Continue on GitHub" opens a prefilled *public* issue on `arthur-fox/the-everything-timeline` with the `feedback` label (the label only sticks for people with triage rights; Arthur can add it on triage). The email is never put in the issue. "Copy text" puts the full report, email included, on the clipboard.
- **`FORM_ENDPOINT` set:** answers are POSTed there (`FORM_FORMAT: 'json'` for Formspree / Getform / Basin-style services, `'form'` for a Google Apps Script web app). Fields: `rating`, `wish`, `pay`, `payOther`, `email`, `context_*`, `_subject`.

Never put a personal email address in the site or config: everything here is public.

## Custom domain

The site is served at the root of **https://theeverythingtimeline.com/** (apex; `www` redirects to it). Pages publishes from the `gh-pages` branch (legacy branch build), so:

- `public/CNAME` (`theeverythingtimeline.com`) is copied into every build, so the domain survives each deploy (the production deploy also uses `keep_files: true`, and the PR-preview action only writes inside `pr-preview/`, so neither removes it).
- `vite.config.js` builds with `base: '/'`. App code has no hard-coded paths: data loads via `new URL(..., import.meta.url)`, and deep links / feedback links use the live `location`, so `/?view=globe&year=1453…` works at the root.
- PR previews: the workflow passes `--base=/the-everything-timeline/pr-preview/pr-N/`. A small Vite plugin checks whether `arthur-fox.github.io/the-everything-timeline/` already redirects to the custom domain; if it does, the base becomes `/pr-preview/pr-N/`, otherwise the old path is kept (so previews keep working before cutover). Override with `CUSTOM_DOMAIN_LIVE=1|0` or force any base with `SITE_BASE=/x/`.
- `index.html` has the canonical URL, description, Open Graph and Twitter card tags; the share image is `public/og-image.png` (1200×630).

Setup (once): DNS apex `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, `AAAA` records `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`, and `www` `CNAME` → `arthur-fox.github.io`; then Settings → Pages → Custom domain `theeverythingtimeline.com` and, once the certificate is issued, *Enforce HTTPS*. Optionally verify the domain under the account's Settings → Pages to block takeovers.

## Data credits

- Globe borders 1815–2025: [Natural Earth](https://www.naturalearthdata.com/) admin-0 / admin-1 boundaries (public domain), regrouped by year for this project. The dates (which provinces belonged to which state, when) are hand-written from standard historical facts. No licensed historical-border dataset is bundled: CShapes 2.0 (CC BY-NC-SA) and historical-basemaps (GPL-3.0) are not used.
- Globe place labels (seas, oceans, mountain ranges, deserts, plateaus, big islands): [Natural Earth](https://www.naturalearthdata.com/) 1:50m physical labels (`geography_marine_polys`, `geography_regions_polys`, public domain). Label positions are computed by this project.
- Globe cities and event pins: hand-curated for this project (public domain), with founding dates and historical names from standard reference works; living cities' positions cross-checked against [Natural Earth](https://www.naturalearthdata.com/) 1:10m populated places (public domain).
- Globe imagery: NASA Blue Marble (NASA Earth Observatory); close-up tiles from [NASA GIBS](https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api) (Blue Marble shaded relief, ESDIS).
- Historical overlays before 1815, peoples and presence: hand-drawn schematic shapes (see each entity's sources).

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full project roadmap, including search, deep links, data validation, citations, story/compare modes, broader country and topic coverage, and the planned Globe Mode for spatial historical overlays.
