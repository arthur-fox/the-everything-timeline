/**
 * Day 60: Share panel, loaded lazily by src/share.js. Shares "this exact moment": the deep link
 * (view, year, map position, selection, layers) plus a short caption. Native share sheet where
 * supported, Copy link, X / WhatsApp / Reddit / email links, and on the globe a PNG snapshot with a
 * small branded caption. Reuses the feedback dialog shell; Esc closes without leaving full screen.
 */
import './share-panel.css';

const SITE = 'theeverythingtimeline.com';
let panel = null;
let lastFocus = null;
let opts = {};
let current = null;

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

export function shareTargets(url, caption) {
  const u = encodeURIComponent(url);
  const c = encodeURIComponent(caption);
  return [
    { id: 'x', label: 'X', href: `https://x.com/intent/post?text=${c}&url=${u}` },
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${caption} ${url}`)}` },
    { id: 'reddit', label: 'Reddit', href: `https://www.reddit.com/submit?url=${u}&title=${c}` },
    { id: 'email', label: 'Email', href: `mailto:?subject=${c}&body=${encodeURIComponent(`${caption}\n\n${url}`)}` },
  ];
}

function setLive(msg) {
  panel.querySelector('.share-live').textContent = msg;
}

/** Globe PNG: the current frame + a slim navy band with the gold caption and site URL. */
function buildImage(snap, info) {
  const w = snap.width;
  const scale = Math.max(1, w / 900);
  const band = Math.round(56 * scale);
  const out = document.createElement('canvas');
  out.width = w;
  out.height = snap.height + band;
  const g = out.getContext('2d');
  g.fillStyle = '#0b1226';
  g.fillRect(0, 0, out.width, out.height);
  g.drawImage(snap, 0, 0);
  g.fillStyle = '#E4B556';
  g.fillRect(0, snap.height, w, Math.max(1, Math.round(2 * scale)));
  const pad = Math.round(18 * scale);
  const mid = snap.height + band / 2 + Math.round(1 * scale);
  g.textBaseline = 'middle';
  const font = getComputedStyle(document.documentElement).getPropertyValue('--font-ui').trim() || 'system-ui, sans-serif';
  const right = SITE;
  g.font = `600 ${Math.round(15 * scale)}px ${font}`;
  const rw = g.measureText(right).width;
  g.fillStyle = '#c9d2e6';
  g.textAlign = 'right';
  g.fillText(right, w - pad, mid);
  g.textAlign = 'left';
  g.fillStyle = '#E4B556';
  let left = info.title ? `${info.title} · ${info.yearLabel}` : `The world in ${info.yearLabel}`;
  g.font = `700 ${Math.round(20 * scale)}px ${font}`;
  const room = w - rw - pad * 3;
  if (g.measureText(left).width > room) {
    while (g.measureText(left + '…').width > room && left.length > 4) left = left.slice(0, -1);
    left = left.trimEnd() + '…';
  }
  g.fillText(left, pad, mid);
  return out;
}

function fileName(info) {
  const y = (info.yearLabel || 'globe').replace(/[^0-9A-Za-z]+/g, '-').replace(/^-|-$/g, '');
  return `everything-timeline-${y || 'globe'}.png`;
}

async function saveImage(btn) {
  const snap = opts.snapshot?.();
  if (!snap) {
    setLive('The globe isn’t ready yet. Try again in a moment.');
    return;
  }
  btn.disabled = true;
  try {
    const canvas = buildImage(snap, current);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('toBlob failed');
    const name = fileName(current);
    const file = typeof File !== 'undefined' ? new File([blob], name, { type: 'image/png' }) : null;
    // Phones: hand the picture to the share sheet (save to Photos, send, post…) when it accepts files.
    const coarse = window.matchMedia?.('(pointer: coarse)').matches;
    if (coarse && file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: current.caption, text: `${current.caption} ${current.url}` });
        setLive('Image shared.');
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }
    const a = el('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setLive(`Saved ${name}`);
  } catch (err) {
    console.warn('Save image failed:', err);
    setLive('Sorry, the image couldn’t be saved.');
  } finally {
    btn.disabled = false;
  }
}

function buildPanel() {
  const p = el(
    'div',
    { id: 'share-panel', class: 'feedback-panel share-panel hidden', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'share-title' },
    el(
      'div',
      { class: 'feedback-card share-card', tabindex: '-1' },
      el('div', { class: 'feedback-head' }, el('h2', { id: 'share-title', text: '🔗 Share this view' }), el('button', { type: 'button', class: 'feedback-close', 'aria-label': 'Close share panel', text: '×' })),
      el('p', { class: 'share-caption' }),
      el('div', { class: 'share-link-row' }, el('input', { class: 'share-url', type: 'text', readonly: true, 'aria-label': 'Link to this view' }), el('button', { type: 'button', class: 'share-copy', text: 'Copy link' })),
      el('button', { type: 'button', class: 'share-native', hidden: true }, el('span', { 'aria-hidden': 'true', text: '📤' }), el('span', { text: 'Share…' })),
      el('div', { class: 'share-targets' }),
      el('button', { type: 'button', class: 'share-image', hidden: true }, el('span', { 'aria-hidden': 'true', text: '🖼️' }), el('span', { text: 'Save image of the globe' })),
      el('p', { class: 'share-ask' }, 'What would you like to share? ', el('button', { type: 'button', class: 'share-tell', text: 'Tell us' })),
      el('p', { class: 'share-live support-live', role: 'status', 'aria-live': 'polite' }),
    ),
  );
  document.body.append(p);
  p.addEventListener('click', (e) => {
    if (e.target === p || e.target.closest('.feedback-close')) closeShare();
  });
  let timer = 0;
  const copyBtn = p.querySelector('.share-copy');
  copyBtn.addEventListener('click', async () => {
    const ok = await copyText(current.url);
    copyBtn.textContent = ok ? 'Copied ✓' : 'Select & copy';
    copyBtn.classList.toggle('is-copied', ok);
    if (!ok) p.querySelector('.share-url').select();
    setLive(ok ? 'Link copied' : 'Copy failed; the link is selected, copy it manually');
    clearTimeout(timer);
    timer = setTimeout(() => {
      copyBtn.textContent = 'Copy link';
      copyBtn.classList.remove('is-copied');
    }, 2200);
  });
  p.querySelector('.share-url').addEventListener('focus', (e) => e.target.select());
  p.querySelector('.share-native').addEventListener('click', async () => {
    try {
      await navigator.share({ title: 'The Everything Timeline', text: current.caption, url: current.url });
    } catch (err) {
      if (err?.name !== 'AbortError') setLive('Couldn’t open the share sheet; use Copy link instead.');
    }
  });
  p.querySelector('.share-image').addEventListener('click', (e) => saveImage(e.currentTarget));
  p.querySelector('.share-tell').addEventListener('click', () => {
    closeShare(false);
    opts.openFeedback?.('Share ideas: ');
  });
  document.addEventListener(
    'keydown',
    (e) => {
      if (!isShareOpen()) return;
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        closeShare();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = [...p.querySelectorAll('a[href], button, input')].filter((n) => !n.disabled && n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!p.contains(document.activeElement)) {
        first.focus();
        e.preventDefault();
      } else if (e.shiftKey && (document.activeElement === first || document.activeElement === p.querySelector('.share-card'))) {
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

export function openShare(o = {}, opener = null) {
  opts = o;
  if (!panel) panel = buildPanel();
  current = opts.getShare?.() || { url: window.location.href, caption: 'The Everything Timeline', globe: false };
  lastFocus = opener || document.activeElement;
  panel.querySelector('.share-caption').textContent = current.caption;
  panel.querySelector('.share-url').value = current.url;
  panel.querySelector('.share-native').hidden = typeof navigator.share !== 'function';
  panel.querySelector('.share-image').hidden = !current.globe;
  const targets = panel.querySelector('.share-targets');
  targets.replaceChildren(
    ...shareTargets(current.url, current.caption).map((t) =>
      el('a', { class: `share-target share-${t.id}`, href: t.href, target: t.id === 'email' ? null : '_blank', rel: 'noopener noreferrer', text: t.label }),
    ),
  );
  setLive('');
  panel.classList.remove('hidden');
  document.body.classList.add('has-share-panel');
  requestAnimationFrame(() => panel.querySelector('.share-card')?.focus({ preventScroll: true }));
}

export function closeShare(restoreFocus = true) {
  if (!panel || panel.classList.contains('hidden')) return;
  panel.classList.add('hidden');
  document.body.classList.remove('has-share-panel');
  if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

export function isShareOpen() {
  return Boolean(panel && !panel.classList.contains('hidden'));
}
