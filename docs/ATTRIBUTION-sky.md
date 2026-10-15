# Sky data attribution (Phase 4c step 7.1)

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

## Runtime

`src/globe-sky.js` loads both assets only with the globe chunk: one `THREE.Points` mesh + one inward-facing textured sphere. No per-frame CPU star work. Constellation lines (step 7.2) are not included yet.
