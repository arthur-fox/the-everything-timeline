#!/usr/bin/env node
/**
 * Day 61 — rebuild public/sky/{bsc-stars.bin,milkyway-celestial.webp}.
 *
 * Inputs (not in git; fetch when regenerating):
 *   - Yale BSC JSON (public domain): https://raw.githubusercontent.com/aduboisforge/Bright-Star-Catalog-JSON/master/BSC.json
 *   - NASA SVS Deep Star Maps 2020 galactic cubemap faces (public domain), e.g. pyvista/data Data/cubemap_space/4k.zip
 *
 * Full conversion lives next to this file as build-sky.py (PIL + numpy). This wrapper just runs it.
 *
 *   node scripts/build-sky.mjs
 *   # or: python3 scripts/build-sky.py --bsc /path/BSC.json --cubemap /path/to/faces
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const py = join(here, 'build-sky.py');
const r = spawnSync('python3', [py, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(r.status ?? 1);
