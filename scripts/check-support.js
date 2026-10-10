#!/usr/bin/env node
/**
 * Day 52: guards the tip-jar values in src/support-config.js against accidental edits.
 * The expected strings below were copied from Arthur's message (10 Oct 2026). If an address
 * really changes, update BOTH files in the same commit, after Arthur verifies the new value.
 * Also checks the addresses are well-formed (Bitcoin bech32 checksum, Solana = 32-byte base58
 * key, Ethereum EIP-55 mixed-case checksum) and that the built QR codes encode the current addresses.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUPPORT_CONFIG } from '../src/support-config.js';
import { qrSvg } from './support-qr.mjs';
import { eip55Valid } from './eth-checksum.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED = {
  KOFI_URL: 'https://ko-fi.com/affox',
  eth: '0x7bE8c264c9DCebA3A35990c78d5C4220D8724B6e',
  btc: 'bc1q7g20llyazt34ys7gue965gamwzrgwg2wg3cr79',
  sol: '6HaHdCrev3uHWQEinavVD23puCRt81c2XA2Kbmo6vbmX',
};

const errors = [];
const ok = (msg) => console.log(`ok: ${msg}`);
const fail = (msg) => errors.push(msg);

if (SUPPORT_CONFIG.KOFI_URL === EXPECTED.KOFI_URL) ok(`Ko-fi URL ${EXPECTED.KOFI_URL}`);
else fail(`Ko-fi URL is "${SUPPORT_CONFIG.KOFI_URL}", expected "${EXPECTED.KOFI_URL}"`);

const byId = Object.fromEntries(SUPPORT_CONFIG.CRYPTO.map((c) => [c.id, c]));
if (SUPPORT_CONFIG.CRYPTO.length !== 3) fail(`expected exactly 3 crypto entries (btc, eth, sol), got ${SUPPORT_CONFIG.CRYPTO.length}`);
for (const id of ['btc', 'eth', 'sol']) {
  const got = byId[id]?.address;
  if (got === EXPECTED[id]) ok(`${id} address ${got}`);
  else fail(`${id} address is "${got}", expected "${EXPECTED[id]}"`);
}

// --- well-formedness ---------------------------------------------------------------------------
function bech32Valid(addr) {
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const pos = addr.lastIndexOf('1');
  if (addr !== addr.toLowerCase() || pos < 1 || pos + 7 > addr.length) return false;
  const hrp = addr.slice(0, pos);
  const data = [...addr.slice(pos + 1)].map((ch) => CHARSET.indexOf(ch));
  if (data.some((v) => v < 0)) return false;
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  const values = [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31), ...data];
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= GEN[i];
  }
  return hrp === 'bc' && chk === 1 && data[0] === 0; // bech32 (segwit v0) mainnet
}
function base58Bytes(str) {
  const A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = 0n;
  for (const ch of str) {
    const v = A.indexOf(ch);
    if (v < 0) return -1;
    n = n * 58n + BigInt(v);
  }
  let len = 0;
  while (n > 0n) {
    n >>= 8n;
    len++;
  }
  for (const ch of str) {
    if (ch !== '1') break;
    len++;
  }
  return len;
}
if (bech32Valid(byId.btc?.address || '')) ok('btc address has a valid bech32 checksum (mainnet, segwit v0)');
else fail('btc address fails the bech32 checksum');
if (eip55Valid(byId.eth?.address || '')) ok('eth address is 0x + 40 hex with a valid EIP-55 mixed-case checksum');
else fail('eth address fails the EIP-55 checksum (or is not 0x + 40 hex)');
if (base58Bytes(byId.sol?.address || '') === 32) ok('sol address decodes to a 32-byte base58 public key');
else fail('sol address does not decode to 32 bytes of base58');
if (/^https:\/\/ko-fi\.com\/[A-Za-z0-9_]+$/.test(SUPPORT_CONFIG.KOFI_URL)) ok('Ko-fi URL is https://ko-fi.com/<name>');
else fail('Ko-fi URL is not https://ko-fi.com/<name>');

// --- built QR codes match the addresses --------------------------------------------------------
const qrFile = path.join(ROOT, 'src/generated/support-qr.json');
if (fs.existsSync(qrFile)) {
  const qr = JSON.parse(fs.readFileSync(qrFile, 'utf8'));
  for (const c of SUPPORT_CONFIG.CRYPTO) {
    if (qr[c.id] === qrSvg(c.address)) ok(`${c.id} QR code encodes the current address`);
    else fail(`${c.id} QR code is stale; run npm run build:data`);
  }
} else console.log('note: src/generated/support-qr.json not built yet (npm run build:data); QR check skipped');

if (errors.length) {
  console.error(`\ncheck-support: ${errors.length} error(s):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log('check-support: all tip-jar values match exactly');
