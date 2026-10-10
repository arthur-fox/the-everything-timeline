#!/usr/bin/env node
/**
 * Day 51: the one small data build step (see docs/DATA.md).
 *
 * Reads the hand-edited country timelines in data/countries/<id>.json and writes
 * src/generated/countries-index.json (gitignored): the list of countries (id, name, flag,
 * year range) for the picker plus a light [id, name, icon] index of their items, so the
 * globe can link to country items without downloading every country file.
 * Full country files are imported lazily by src/main.js (Vite minifies + hashes them).
 *
 * Runs automatically before `npm run dev` and `npm run build`; validation lives in
 * scripts/validate-data.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'data/countries');
const OUT = path.join(ROOT, 'src/generated/countries-index.json');

const countries = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => {
    const c = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
    return {
      id: c.id,
      name: c.name,
      flag: c.flag,
      minYear: c.minYear,
      maxYear: c.maxYear,
      items: (c.items || []).map((it) => [it.id, it.name, it.icon || '']),
    };
  });

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const json = JSON.stringify(countries);
if (!fs.existsSync(OUT) || fs.readFileSync(OUT, 'utf8') !== json) fs.writeFileSync(OUT, json);
console.log(`build-data: ${countries.length} countries, ${countries.reduce((a, c) => a + c.items.length, 0)} items → src/generated/countries-index.json (${(json.length / 1024).toFixed(1)} KB)`);

// ---------------------------------------------------------------------------------------------
// Day 52: QR codes for the tip-jar crypto addresses (src/support-config.js), generated here at
// build time as tiny inline SVGs (one <path>) so the site ships no QR library. The QR encodes the
// bare address (scannable by every wallet). Written to src/generated/support-qr.json (gitignored)
// and imported only by the lazy support panel.
// ---------------------------------------------------------------------------------------------
import { qrSvg } from './support-qr.mjs';
import { SUPPORT_CONFIG } from '../src/support-config.js';

const QR_OUT = path.join(ROOT, 'src/generated/support-qr.json');
const qrJson = JSON.stringify(Object.fromEntries(SUPPORT_CONFIG.CRYPTO.map((c) => [c.id, qrSvg(c.address)])));
if (!fs.existsSync(QR_OUT) || fs.readFileSync(QR_OUT, 'utf8') !== qrJson) fs.writeFileSync(QR_OUT, qrJson);
console.log(`build-data: ${SUPPORT_CONFIG.CRYPTO.length} support QR codes → src/generated/support-qr.json (${(qrJson.length / 1024).toFixed(1)} KB)`);
