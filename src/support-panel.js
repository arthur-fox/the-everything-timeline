/**
 * Day 52: tip-jar panel ("☕ Support"), loaded lazily by src/support.js.
 * Values come only from src/support-config.js (guarded by scripts/check-support.js); QR codes
 * are inline SVGs generated at build time (scripts/build-data.mjs → src/generated/support-qr.json).
 * Accessible dialog: focus moves in and is trapped, Esc closes (without leaving full screen),
 * focus returns to the pill.
 */
import { SUPPORT_CONFIG } from './support-config.js';
import QR from './generated/support-qr.json';
import './support-panel.css';

let panel = null;
let lastFocus = null;

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  n.append(...kids.filter(Boolean));
  return n;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // older browsers / insecure contexts: select a temporary field and copy
    const ta = el('textarea', { readonly: true, 'aria-hidden': 'true', style: 'position:fixed;left:-9999px;top:0' });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

function coinRow(c) {
  const qrId = `support-qr-${c.id}`;
  const copyBtn = el('button', { type: 'button', class: 'support-copy', 'aria-label': `Copy ${c.name} address`, text: 'Copy' });
  const qrBtn = el('button', { type: 'button', class: 'support-qr-toggle', 'aria-expanded': 'false', 'aria-controls': qrId, 'aria-label': `Show ${c.name} QR code`, text: 'QR code' });
  const qr = el('div', { class: 'support-qr', id: qrId, hidden: true });
  qr.innerHTML = QR[c.id] || '';
  qr.querySelector('svg')?.setAttribute('aria-label', `QR code for the ${c.name} address`);
  const row = el(
    'li',
    { class: 'support-coin', 'data-coin': c.id },
    el('div', { class: 'support-coin-head' }, el('span', { class: 'support-coin-name', text: `${c.name} (${c.symbol})` }), el('span', { class: 'support-coin-network', text: c.network })),
    el('code', { class: 'support-address', 'data-address': c.id, text: c.address }),
    c.note ? el('p', { class: 'support-coin-note', text: c.note }) : null,
    el('div', { class: 'support-coin-actions' }, copyBtn, qrBtn),
    qr,
  );
  let timer = 0;
  copyBtn.addEventListener('click', async () => {
    const ok = await copyText(c.address);
    copyBtn.textContent = ok ? 'Copied ✓' : 'Select & copy';
    copyBtn.classList.toggle('is-copied', ok);
    if (!ok) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(row.querySelector('.support-address'));
      sel.removeAllRanges();
      sel.addRange(range);
    }
    panel.querySelector('.support-live').textContent = ok ? `${c.name} address copied` : 'Copy failed; the address is selected, copy it manually';
    clearTimeout(timer);
    timer = setTimeout(() => {
      copyBtn.textContent = 'Copy';
      copyBtn.classList.remove('is-copied');
    }, 2200);
  });
  qrBtn.addEventListener('click', () => {
    const show = qr.hidden;
    qr.hidden = !show;
    qrBtn.setAttribute('aria-expanded', String(show));
    qrBtn.textContent = show ? 'Hide QR' : 'QR code';
    qrBtn.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} ${c.name} QR code`);
  });
  return row;
}

function buildPanel() {
  const p = el(
    'div',
    { id: 'support-panel', class: 'feedback-panel support-panel hidden', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'support-title' },
    el(
      'div',
      { class: 'feedback-card support-card', tabindex: '-1' },
      el('div', { class: 'feedback-head' }, el('h2', { id: 'support-title', text: '☕ Support the timeline' }), el('button', { type: 'button', class: 'feedback-close', 'aria-label': 'Close support panel', text: '×' })),
      el('p', { class: 'support-lede', text: 'The Everything Timeline is free and independent. If you enjoy it, you can chip in. Every tip helps keep it growing.' }),
      el('a', { class: 'support-kofi', href: SUPPORT_CONFIG.KOFI_URL, target: '_blank', rel: 'noopener noreferrer' }, el('span', { 'aria-hidden': 'true', text: '☕' }), el('span', { text: 'Tip on Ko-fi' })),
      el('p', { class: 'support-kofi-sub', text: 'Card or PayPal, via ko-fi.com (opens in a new tab).' }),
      el('h3', { class: 'support-crypto-title', text: 'Crypto' }),
      el('ul', { class: 'support-coins' }, ...SUPPORT_CONFIG.CRYPTO.map(coinRow)),
      el('p', { class: 'support-footnote', text: 'Check the first and last few characters after pasting. Send only on the network shown. Tips are gifts: no account, perks or refunds.' }),
      el('p', { class: 'support-live', role: 'status', 'aria-live': 'polite' }),
    ),
  );
  document.body.append(p);
  p.addEventListener('click', (e) => {
    if (e.target === p || e.target.closest('.feedback-close')) closeSupport();
  });
  // Capture phase so Esc closes this panel without also leaving full screen.
  document.addEventListener(
    'keydown',
    (e) => {
      if (!isSupportOpen()) return;
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        closeSupport();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = [...p.querySelectorAll('a[href], button')].filter((n) => !n.disabled && n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!p.contains(document.activeElement)) {
        first.focus();
        e.preventDefault();
      } else if (e.shiftKey && (document.activeElement === first || document.activeElement === p.querySelector('.support-card'))) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    },
    true,
  );
  return p;
}

export function openSupport(opener = null) {
  if (!panel) panel = buildPanel();
  lastFocus = opener || document.activeElement;
  panel.classList.remove('hidden');
  document.body.classList.add('has-support-panel');
  requestAnimationFrame(() => panel.querySelector('.support-card')?.focus({ preventScroll: true }));
}

export function closeSupport() {
  if (!panel || panel.classList.contains('hidden')) return;
  panel.classList.add('hidden');
  document.body.classList.remove('has-support-panel');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

export function isSupportOpen() {
  return Boolean(panel && !panel.classList.contains('hidden'));
}
