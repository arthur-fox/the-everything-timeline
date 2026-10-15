/**
 * Day 54: phones (< 700px). The header's "☰ <view>" button opens #controls as a bottom sheet
 * (view picker, search, filters, compare, bookmarks, era chips), so the timeline canvas gets the
 * screen. Also: swipe down to close the detail sheet, and the first-visit gesture hint hides
 * itself after a few seconds. Desktop never sees any of it (the button is display:none there).
 */
const PHONE = window.matchMedia('(max-width: 700px)');

export function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-toggle');
  const sheet = document.getElementById('controls');
  if (!btn || !sheet) return;
  const label = btn.querySelector('.mobile-menu-label');
  const viewLabel = document.getElementById('active-view-label');
  let backdrop = null;
  let lastFocus = null;

  const isOpen = () => document.body.classList.contains('mobile-menu-open');

  function open() {
    if (!PHONE.matches || isOpen()) return;
    lastFocus = document.activeElement;
    document.body.classList.add('mobile-menu-open');
    btn.setAttribute('aria-expanded', 'true');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Menu');
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-menu-backdrop';
    backdrop.addEventListener('click', () => close());
    // Same stacking context as the sheet: #app has z-index:1, so a backdrop on <body> sat above
    // the whole sheet and ate every tap in it (the menu just closed again).
    sheet.before(backdrop);
    sheet.scrollTop = 0;
    requestAnimationFrame(() => sheet.querySelector('select, input, button')?.focus({ preventScroll: true }));
  }

  function close({ restoreFocus = true } = {}) {
    if (!isOpen()) return;
    document.body.classList.remove('mobile-menu-open');
    btn.setAttribute('aria-expanded', 'false');
    sheet.removeAttribute('role');
    sheet.removeAttribute('aria-label');
    backdrop?.remove();
    backdrop = null;
    if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen()) close();
    else open();
  });

  // Close once something was chosen: a view, an era, a search result, or a button that opens its own panel.
  sheet.addEventListener('change', (e) => {
    if (e.target.matches('#view-select') && e.target.value !== 'countries') close({ restoreFocus: false });
  });
  sheet.addEventListener('click', (e) => {
    if (e.target.closest('#era-nav button, #filters-toggle, #compare-toggle, #bookmarks-toggle, .timeline-search-result')) {
      close({ restoreFocus: false });
    }
  });
  // the country picker opens from the view select ("Countries…")
  document.getElementById('view-select')?.addEventListener('change', (e) => {
    if (e.target.value === 'countries') close({ restoreFocus: false });
  });
  document.getElementById('timeline-search-results')?.addEventListener('click', () => close({ restoreFocus: false }));

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && isOpen()) {
        // let an open search-results list close first
        const results = document.getElementById('timeline-search-results');
        if (results && !results.classList.contains('hidden')) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        close();
      }
    },
    true,
  );
  PHONE.addEventListener?.('change', () => {
    if (!PHONE.matches) close({ restoreFocus: false });
  });

  const tabs = initViewTabs();
  // The view name lives in the tabs now; the button is just "Menu".
  const syncLabel = () => {
    const t = (viewLabel?.textContent || '').replace(/\s+/g, ' ').trim();
    if (label) label.textContent = 'Menu';
    btn.setAttribute('aria-label', `Menu: search, filters, compare, bookmarks, eras (viewing ${t || 'Timeline'})`);
    tabs?.sync();
  };
  if (viewLabel) new MutationObserver(syncLabel).observe(viewLabel, { childList: true, characterData: true, subtree: true });
  syncLabel();

  initSheetSwipe();
  autoHideGestureHint();
}

/**
 * Phones: a scrollable row of view tabs under the header, so switching timeline type is one tap
 * (it used to be a <select> inside the ☰ sheet). Built from #view-select's options and drives it
 * through its normal change event, so all existing view logic stays in one place.
 */
function initViewTabs() {
  const select = document.getElementById('view-select');
  const header = document.getElementById('header');
  if (!select || !header) return null;
  const nav = document.createElement('nav');
  nav.className = 'view-tabs';
  nav.setAttribute('aria-label', 'Timeline views');
  const short = { cosmic: 'All', 'cosmic-history': 'Cosmic', civilisations: 'Civilisations', art: 'Art', wars: 'Wars', countries: 'Countries' };
  for (const o of select.options) {
    if (o.value === 'globe') continue; // the Timeline/Globe switch covers it
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.view = o.value;
    b.textContent = short[o.value] || o.textContent.replace(/\.\.\.$/, '');
    b.title = o.value === 'countries' ? 'Pick a country timeline' : o.textContent;
    b.addEventListener('click', () => {
      // "Countries" always opens the picker, even when a country is already showing
      if (select.value === o.value && o.value !== 'countries') return;
      select.value = o.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    nav.append(b);
  }
  header.after(nav);
  const sync = () => {
    const v = select.value;
    let active = null;
    for (const b of nav.children) {
      const on = b.dataset.view === v;
      b.setAttribute('aria-pressed', String(on));
      if (on) active = b;
    }
    if (active && PHONE.matches) {
      const r = active.getBoundingClientRect(), n = nav.getBoundingClientRect();
      if (r.left < n.left || r.right > n.right) nav.scrollBy({ left: r.left - n.left - (n.width - r.width) / 2, behavior: 'smooth' });
    }
  };
  select.addEventListener('change', () => requestAnimationFrame(sync));
  sync();
  return { sync };
}

/** Swipe the detail sheet down (from its top, or when scrolled to the top) to close it. */
function initSheetSwipe() {
  const sheet = document.getElementById('event-detail');
  const closeBtn = document.getElementById('detail-close');
  if (!sheet || !closeBtn) return;
  let y0 = null;
  sheet.addEventListener(
    'touchstart',
    (e) => {
      if (!PHONE.matches || e.touches.length !== 1) return;
      const fromTop = e.touches[0].clientY - sheet.getBoundingClientRect().top;
      y0 = sheet.scrollTop <= 0 || fromTop < 48 ? e.touches[0].clientY : null;
    },
    { passive: true },
  );
  sheet.addEventListener(
    'touchmove',
    (e) => {
      if (y0 == null) return;
      const dy = e.touches[0].clientY - y0;
      sheet.style.transform = dy > 0 ? `translateY(${Math.min(dy, 240)}px)` : '';
    },
    { passive: true },
  );
  const end = (e) => {
    if (y0 == null) return;
    const dy = (e.changedTouches?.[0]?.clientY ?? y0) - y0;
    y0 = null;
    sheet.style.transform = '';
    if (dy > 80) closeBtn.click();
  };
  sheet.addEventListener('touchend', end);
  sheet.addEventListener('touchcancel', end);
}

function autoHideGestureHint() {
  const hint = document.getElementById('gesture-hint');
  if (!hint || !PHONE.matches) return;
  const watch = new MutationObserver(() => {
    if (!hint.classList.contains('hidden')) {
      watch.disconnect();
      setTimeout(() => hint.classList.add('hidden'), 7000); // shown again next visit until dismissed / used
    }
  });
  watch.observe(hint, { attributes: true, attributeFilter: ['class'] });
  if (!hint.classList.contains('hidden')) {
    watch.disconnect();
    setTimeout(() => hint.classList.add('hidden'), 7000);
  }
}
