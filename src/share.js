/**
 * Day 60: the 🔗 Share pill. Like support.js, only this stub ships in the landing bundle; the
 * panel (src/share-panel.js) loads on first click or is warmed on hover / focus. ?share=1 opens it.
 * Static: no backend, no tracking, nothing leaves the browser except what the person shares.
 */
let panelModule = null;
let opts = {};
const loadPanel = () => (panelModule ||= import('./share-panel.js'));

export function initShare(o = {}) {
  opts = o;
  document.querySelectorAll('[data-share-open]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      loadPanel().then((m) => m.openShare(opts, b)).catch((err) => console.error('Share panel failed to load', err));
    });
    const warm = () => loadPanel().catch(() => {});
    b.addEventListener('pointerenter', warm, { passive: true, once: true });
    b.addEventListener('focus', warm, { once: true });
  });
  if (new URLSearchParams(window.location.search).get('share') === '1') loadPanel().then((m) => m.openShare(opts));
}
