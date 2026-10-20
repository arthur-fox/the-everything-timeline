# Sky data attribution (Phase 4c steps 7.1–7.2)

## Stars — Yale Bright Star Catalogue (BSC5)

- **File:** `public/sky/bsc-stars.bin` (compact binary of stars with V ≤ 6.5)
- **Source catalogue:** Yale Bright Star Catalogue, 5th edition (~9,100 naked-eye stars). Widely treated as public domain; NASA HEASARC hosts the BSC5P table derived from it.
- **JSON used to build our binary:** [aduboisforge/Bright-Star-Catalog-JSON](https://github.com/aduboisforge/Bright-Star-Catalog-JSON) (public domain release of a cleaned BSC5 extract). Rebuild with `node scripts/build-sky.mjs` (requires the upstream JSON).
- **Binary format (`ETB1`):** `uint32` count (LE), then per star: `float32` x,y,z (unit sphere in globe.gl axes), `float32` size (from magnitude), `uint8` r,g,b,brightness. Spectral tint from the MK class letter in the catalogue.

We do not invent coordinates — every star comes from the catalogue.

## Milky Way — NASA SVS Deep Star Maps 2020

- **File:** `public/sky/milkyway-celestial.webp` (~50 KB, 2048×1024 equirectangular, celestial coordinates)
- **Source:** [NASA/GSFC Scientific Visualization Studio — Deep Star Maps 2020](https://svs.gsfc.nasa.gov/4851/) (public domain unless otherwise noted; credit NASA/GSFC SVS; Gaia DR2: ESA/Gaia/DPAC).
- **Build path:** the SVS publishes linear OpenEXR plate-carrée maps. A 4K galactic cubemap derived from that set ([pyvista/data `cubemap_space`](https://github.com/pyvista/data/tree/master/Data/cubemap_space)) was sampled into a celestial equirectangular WebP (IAU galactic ↔ J2000 rotation) so Earth's axis lines up with the celestial poles. Softened so the BSC point cloud carries the bright stars.
- **Not used:** HYG (CC BY-SA) — avoided share-alike for this data file.

## Constellations — d3-celestial (Day 62 / step 7.2)

- **File:** `public/sky/constellations.bin` (~20 KB; 88 IAU stick figures + short names)
- **Source:** [ofrohn/d3-celestial](https://github.com/ofrohn/d3-celestial) `data/constellations.lines.json` and `data/constellations.json` (**BSD-3-Clause**, © Olaf Frohn). Compatible with this project's ISC licence when the copyright notice and conditions are retained (this file).
- **Geometry:** celestial `[RA_deg, Dec_deg]` mapped into the **same unit-sphere frame** as `bsc-stars.bin` (globe.gl axes; Earth's Y = celestial pole at J2000). Asterism lines are not invented — they are the upstream stick figures rebuilt into `LineSegments` pairs.
- **Binary format (`ETC1`):** `uint32` line-vertex count (even; consecutive pairs), `float32` x,y,z × N; then `uint32` name count; per name: `float32` x,y,z, `uint8` rank, desig UTF-8, classical name UTF-8.
- **Rebuild:** `python3 scripts/build-sky.py --constellations` (fetches upstream) or pass `--lines` / `--names` for local GeoJSON.

## Runtime

`src/globe-sky.js` loads the assets only with the globe chunk: one `THREE.Points` mesh, one inward-facing textured sphere, one `LineSegments` mesh for constellation lines, and sprite labels for names. No per-frame CPU star or constellation work. A key toggle shows or hides lines and names; since Day 67 they are off by default (`&constellations=1` turns them on). Light theme hides the whole sky group. Axial precession is a single quaternion on the sky group when the globe year changes (ecliptic-pole rotation; Thuban ≈ 3000 BCE, Polaris today).
