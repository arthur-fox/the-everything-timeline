/**
 * Phones: one button hides / shows the globe's map key (layer toggles) and the credits line,
 * so the globe itself has the screen. Arthur: "On mobile there's too much info, can you have
 * the overlay be able to hide?"
 *
 * - Phones (<= 640px) start with the key hidden; the choice is remembered in localStorage.
 * - Desktop is untouched: the button is display:none there and the hiding CSS only applies
 *   inside the phone media query, so a stored "hidden" never changes the desktop layout.
 */
const STORAGE_KEY = 'globe-info';
const PHONE_QUERY = '(max-width: 640px)';
const BODY_CLASS = 'globe-info-hidden';

function readPref() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'hidden' || v === 'shown' ? v : null;
  } catch (_) {
    return null;
  }
}

function writePref(v) {
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch (_) {
    // private mode etc.: the toggle still works for this visit
  }
}

function apply(btn, hidden) {
  document.body.classList.toggle(BODY_CLASS, hidden);
  const label = hidden ? 'Show map key and credits' : 'Hide map key and credits';
  btn.setAttribute('aria-expanded', String(!hidden));
  btn.setAttribute('aria-label', label);
  btn.title = label;
  const text = btn.querySelector('.globe-info-toggle-label');
  if (text) text.textContent = hidden ? 'Key' : 'Hide key';
}

export function initGlobeInfoToggle() {
  const btn = document.getElementById('globe-info-toggle');
  if (!btn) return;
  const pref = readPref();
  let hidden = pref ? pref === 'hidden' : window.matchMedia?.(PHONE_QUERY).matches === true;
  apply(btn, hidden);
  btn.addEventListener('click', () => {
    hidden = !hidden;
    writePref(hidden ? 'hidden' : 'shown');
    apply(btn, hidden);
  });
}
