/**
 * Day 52: the ☕ Support pill. This tiny module is all the landing bundle carries; the panel,
 * the addresses and the QR codes (src/support-panel.js) load on first click, or are warmed on
 * hover / focus. ?support=1 opens the panel (handy for sharing and testing).
 */
let panelModule = null;
const loadPanel = () => (panelModule ||= import('./support-panel.js'));

export function initSupport() {
  document.querySelectorAll('[data-support-open]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      loadPanel().then((m) => m.openSupport(b)).catch((err) => console.error('Support panel failed to load', err));
    });
    const warm = () => loadPanel().catch(() => {});
    b.addEventListener('pointerenter', warm, { passive: true, once: true });
    b.addEventListener('focus', warm, { once: true });
  });
  if (new URLSearchParams(window.location.search).get('support') === '1') loadPanel().then((m) => m.openSupport());
}
