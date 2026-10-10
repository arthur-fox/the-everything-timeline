/**
 * Day 45: in-app Feedback panel (rating, wishes, "would you pay for…?", optional email).
 *
 * Day 50: answers are POSTed privately to FEEDBACK_CONFIG.FORM_ENDPOINT (Formspark, see
 * src/feedback-config.js); nothing is posted publicly. "Copy text" only appears if sending
 * fails. A hidden honeypot field and a 30 s gap between sends keep bots and double-taps out. Context (the link to this exact view, year, map position, selection,
 * screen size, app version) is attached so reports can be reproduced. Nothing is sent until
 * the person presses Send; nothing is stored except a local "feedback sent" note + time.
 */
import { FEEDBACK_CONFIG, PREMIUM_IDEAS, FEEDBACK_RATINGS } from './feedback-config.js';

const STORE_KEY = 'everything-timeline:feedback';
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
const APP_COMMIT = typeof __APP_COMMIT__ !== 'undefined' ? __APP_COMMIT__ : 'dev';
const APP_BUILT = typeof __APP_BUILT__ !== 'undefined' ? __APP_BUILT__ : '';

let panel = null;
let lastFocus = null;
let getAppContext = () => ({});
let rating = null;

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function writeStore(patch) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), ...patch }));
  } catch {
    // private mode: fine, we just forget
  }
}

/** Everything attached to a report besides the person's own answers. */
export function collectFeedbackContext() {
  const app = getAppContext() || {};
  const url = new URL(window.location.href);
  if (app.at) url.searchParams.set('at', app.at);
  url.searchParams.delete('globeDebug');
  url.searchParams.delete('feedback');
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  return {
    link: url.toString().replace(/%2C/gi, ','),
    view: app.view || url.searchParams.get('view') || 'cosmic',
    year: app.year ?? url.searchParams.get('year') ?? null,
    at: app.at || url.searchParams.get('at') || null,
    entity: app.entity || url.searchParams.get('entity') || null,
    item: app.item || url.searchParams.get('id') || null,
    fullscreen: Boolean(app.fullscreen),
    screen: `${window.innerWidth}×${window.innerHeight}, pixel ratio ${+(window.devicePixelRatio || 1).toFixed(2)}${coarse ? ', touch' : ''}`,
    version: `${APP_VERSION} (${APP_COMMIT}${APP_BUILT ? `, built ${APP_BUILT}` : ''})`,
  };
}

function readAnswers() {
  const f = panel.querySelector('form');
  return {
    rating,
    wish: f.elements.wish.value.trim(),
    pay: [...f.querySelectorAll('input[name="pay"]:checked')].map((i) => i.value),
    payOther: f.elements.payOther.value.trim(),
    email: f.elements.email.value.trim(),
    honeypot: f.elements._honeypot ? f.elements._honeypot.value : '',
  };
}

function ratingText(r) {
  const x = FEEDBACK_RATINGS.find((o) => o.value === r);
  return x ? `${x.emoji} ${r}/5 (${x.label})` : 'not given';
}

/** Plain-text report (the "Copy text" fallback when sending fails). */
export function formatFeedbackReport(answers, context, { includeEmail = true } = {}) {
  const pay = answers.pay.map((id) => PREMIUM_IDEAS.find((p) => p.id === id)?.label || id);
  if (answers.payOther) pay.push(`Other: ${answers.payOther}`);
  const lines = [
    `**Rating:** ${ratingText(answers.rating)}`,
    '',
    '**What would you love to see?**',
    answers.wish || '_(left blank)_',
    '',
    '**Would pay for:**',
    ...(pay.length ? pay.map((p) => `- ${p}`) : ['_(nothing ticked)_']),
  ];
  if (includeEmail && answers.email) lines.push('', `**Email for follow-up:** ${answers.email}`);
  lines.push(
    '',
    '---',
    'Context (attached automatically):',
    `- Link: ${context.link}`,
    `- View: ${context.view}${context.fullscreen ? ' (full screen)' : ''}`,
    `- Year: ${context.year ?? '—'}`,
    `- Map position (lat,lng,altitude): ${context.at ?? '—'}`,
    `- Selected: ${context.entity || context.item || '—'}`,
    `- Screen: ${context.screen}`,
    `- App version: ${context.version}`,
  );
  return lines.join('\n');
}

function wouldPayList(answers) {
  const pay = answers.pay.map((id) => PREMIUM_IDEAS.find((p) => p.id === id)?.label || id);
  if (answers.payOther) pay.push(`Other: ${answers.payOther}`);
  return pay.join(', ');
}

/** Notification email subject, e.g. "Everything Timeline feedback (4/5)". */
export function feedbackSubject(answers) {
  return `Everything Timeline feedback (${answers.rating ? `${answers.rating}/5` : 'no rating'})`;
}

/** The JSON body Formspark receives; keys are what Arthur reads in the notification email. */
export function feedbackPayload(answers, context) {
  return {
    rating: answers.rating ? ratingText(answers.rating) : 'not given',
    wish: answers.wish || '(left blank)',
    would_pay: wouldPayList(answers) || '(nothing ticked)',
    email: answers.email || '(not given)',
    page_url: context.link,
    view: `${context.view}${context.fullscreen ? ' (full screen)' : ''}`,
    year: context.year == null ? '' : String(context.year),
    map_position: context.at || '',
    selected: context.entity || context.item || '',
    screen: context.screen,
    app_version: context.version,
    _honeypot: answers.honeypot || '',
    _email: { from: FEEDBACK_CONFIG.EMAIL_FROM, subject: feedbackSubject(answers) },
  };
}

async function postToEndpoint(answers, context) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), FEEDBACK_CONFIG.TIMEOUT_MS || 15000) : null;
  try {
    const res = await fetch(FEEDBACK_CONFIG.FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(feedbackPayload(answers, context)),
      signal: ctrl?.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function secondsUntilNextSend() {
  const last = Date.parse(readStore().lastSendAt || '');
  if (!Number.isFinite(last)) return 0;
  const wait = (FEEDBACK_CONFIG.MIN_SECONDS_BETWEEN_SENDS || 30) * 1000 - (Date.now() - last);
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
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

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids) if (k != null) n.append(k);
  return n;
}

function buildPanel() {
  const ratings = el('div', { class: 'feedback-rating', role: 'radiogroup', 'aria-label': 'How do you like it so far?' });
  for (const r of FEEDBACK_RATINGS) {
    ratings.append(
      el('button', { type: 'button', class: 'feedback-rating-option', role: 'radio', 'aria-checked': 'false', 'data-value': r.value, title: r.label, 'aria-label': `${r.value} of 5: ${r.label}` }, r.emoji),
    );
  }
  const pays = el('div', { class: 'feedback-pay-options' });
  for (const p of PREMIUM_IDEAS) {
    pays.append(el('label', { class: 'feedback-check' }, el('input', { type: 'checkbox', name: 'pay', value: p.id }), el('span', { text: p.label })));
  }
  pays.append(el('input', { type: 'text', name: 'payOther', class: 'feedback-input', placeholder: 'Something else? (optional)', maxlength: '200', 'aria-label': 'Something else you would pay for' }));
  const privacy =
    'Sent privately to the Everything Timeline team (by email, via the Formspark form service) — nothing is posted publicly. ' +
    'It includes your answers, your email if you give one, the link to what you are looking at (view, year, map position, selection), your screen size and the app version. No cookies, no tracking.';
  const form = el(
    'form',
    { class: 'feedback-form', novalidate: true },
    el('p', { class: 'feedback-q', id: 'feedback-q-rating', text: 'How do you like it so far?' }),
    ratings,
    el('label', { class: 'feedback-q', for: 'feedback-wish', text: 'What would you love to see?' }),
    el('textarea', { id: 'feedback-wish', name: 'wish', class: 'feedback-input', rows: '3', maxlength: '4000', placeholder: 'A missing event, a map layer, a bug, anything…' }),
    el('fieldset', { class: 'feedback-pay' }, el('legend', { class: 'feedback-q' }, 'Would you pay for…? ', el('span', { class: 'feedback-opt', text: '(optional, tick any)' })), pays),
    el('label', { class: 'feedback-q', for: 'feedback-email' }, 'Email for a follow-up ', el('span', { class: 'feedback-opt', text: '(optional)' })),
    el('input', { id: 'feedback-email', name: 'email', type: 'email', class: 'feedback-input', autocomplete: 'email', placeholder: 'you@example.com', maxlength: '200' }),
    // Honeypot: hidden from people (and screen readers); bots that fill every field get dropped.
    el('div', { class: 'feedback-hp', 'aria-hidden': 'true' }, el('label', { text: 'Leave this empty' }, el('input', { type: 'text', name: '_honeypot', tabindex: '-1', autocomplete: 'off' }))),
    el('details', { class: 'feedback-privacy' }, el('summary', { text: 'Goes privately to the team: your answers + a link to this view, screen size & app version · details' }), el('p', { text: privacy }), el('pre', { class: 'feedback-context' })),
    el('p', { class: 'feedback-status', role: 'status', 'aria-live': 'polite' }),
    el(
      'div',
      { class: 'feedback-actions' },
      el('button', { type: 'button', class: 'feedback-copy', text: 'Copy text', hidden: true }),
      el('button', { type: 'submit', class: 'feedback-send', text: 'Send feedback' }),
    ),
  );
  const p = el(
    'div',
    { id: 'feedback-panel', class: 'feedback-panel hidden', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'feedback-title' },
    el(
      'div',
      { class: 'feedback-card', tabindex: '-1' },
      el(
        'div',
        { class: 'feedback-head' },
        el('h2', { id: 'feedback-title', text: 'Feedback' }),
        el('button', { type: 'button', class: 'feedback-close', 'aria-label': 'Close feedback', text: '×' }),
      ),
      el('p', { class: 'feedback-sent-note', hidden: true }),
      form,
    ),
  );
  document.body.append(p);

  ratings.addEventListener('click', (e) => {
    const b = e.target.closest('.feedback-rating-option');
    if (!b) return;
    rating = rating === +b.dataset.value ? null : +b.dataset.value;
    for (const o of ratings.children) o.setAttribute('aria-checked', String(+o.dataset.value === rating));
  });
  ratings.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const opts = [...ratings.children];
    const i = Math.max(0, opts.indexOf(document.activeElement));
    const n = opts[(i + (e.key === 'ArrowRight' ? 1 : opts.length - 1)) % opts.length];
    n.focus();
    n.click();
    e.preventDefault();
  });
  p.addEventListener('click', (e) => {
    if (e.target === p || e.target.closest('.feedback-close')) closeFeedback();
  });
  p.querySelector('.feedback-copy').addEventListener('click', async () => {
    const ok = await copyText(formatFeedbackReport(readAnswers(), collectFeedbackContext()));
    setStatus(ok ? 'Copied — paste it wherever suits you.' : 'Couldn’t copy automatically; select the text in “What gets sent”.');
  });
  form.addEventListener('submit', onSubmit);
  const clearError = () => {
    if (panel.querySelector('.feedback-status').dataset.kind === 'error') setStatus('');
  };
  form.addEventListener('input', clearError);
  ratings.addEventListener('click', clearError);
  return p;
}

function setStatus(msg, kind = '') {
  const s = panel.querySelector('.feedback-status');
  s.textContent = msg;
  s.dataset.kind = kind;
}

function hasContent(a) {
  return a.rating || a.wish || a.pay.length || a.payOther;
}

async function onSubmit(e) {
  e.preventDefault();
  const answers = readAnswers();
  if (!hasContent(answers)) {
    setStatus('Pick a rating or write a line first.', 'error');
    return;
  }
  const email = panel.querySelector('#feedback-email');
  if (answers.email && !email.checkValidity()) {
    setStatus('That email doesn’t look right (or leave it empty).', 'error');
    email.focus();
    return;
  }
  const wait = secondsUntilNextSend();
  if (wait) {
    setStatus(`Thanks — you just sent one. Please wait ${wait} s before sending again.`, 'error');
    return;
  }
  const context = collectFeedbackContext();
  const send = panel.querySelector('.feedback-send');
  const copy = panel.querySelector('.feedback-copy');
  if (answers.honeypot) {
    // a bot filled the hidden field: pretend it worked, send nothing
    setStatus('Thank you! Your feedback was sent.', 'ok');
    return;
  }
  send.disabled = true;
  setStatus('Sending…');
  try {
    await postToEndpoint(answers, context);
    writeStore({ lastSendAt: new Date().toISOString() });
    markSent();
    copy.hidden = true;
    setStatus('Thank you! Your feedback was sent to the team.', 'ok');
    setTimeout(closeFeedback, 1800);
  } catch (err) {
    console.warn('Feedback send failed:', err);
    copy.hidden = false;
    setStatus(
      navigator.onLine === false
        ? 'You seem to be offline, so it couldn’t be sent. Try again when you’re back online, or use “Copy text” to keep what you wrote.'
        : 'Sorry, it couldn’t be sent just now. Please try again in a minute, or use “Copy text” to keep what you wrote.',
      'error',
    );
  } finally {
    send.disabled = false;
  }
}

function markSent() {
  const s = readStore();
  writeStore({ sentAt: new Date().toISOString(), count: (s.count || 0) + 1 });
  syncButtons();
}

function syncButtons() {
  const s = readStore();
  document.querySelectorAll('[data-feedback-open]').forEach((b) => {
    b.classList.toggle('is-sent', Boolean(s.sentAt));
    b.title = s.sentAt ? 'Feedback (thanks for yours!)' : 'Send feedback or ideas';
  });
}

export function openFeedback() {
  if (!panel) panel = buildPanel();
  lastFocus = document.activeElement;
  const s = readStore();
  const note = panel.querySelector('.feedback-sent-note');
  if (s.sentAt) {
    note.hidden = false;
    note.textContent = `Thanks for your feedback on ${new Date(s.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — send more any time.`;
  } else note.hidden = true;
  panel.querySelector('.feedback-context').textContent = Object.entries(collectFeedbackContext())
    .map(([k, v]) => `${k}: ${v ?? '—'}`)
    .join('\n');
  setStatus('');
  panel.querySelector('.feedback-copy').hidden = true;
  panel.classList.remove('hidden');
  document.body.classList.add('has-feedback-panel');
  writeStore({ openedAt: new Date().toISOString() });
  syncButtons();
  requestAnimationFrame(() => panel.querySelector('.feedback-card')?.focus({ preventScroll: true }));
}

export function closeFeedback() {
  if (!panel || panel.classList.contains('hidden')) return;
  panel.classList.add('hidden');
  document.body.classList.remove('has-feedback-panel');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

export function isFeedbackOpen() {
  return Boolean(panel && !panel.classList.contains('hidden'));
}

/**
 * @param {{ getContext?: () => object }} opts  getContext → { view, year, at, entity, item, fullscreen }
 */
export function initFeedback(opts = {}) {
  if (typeof opts.getContext === 'function') getAppContext = opts.getContext;
  document.querySelectorAll('[data-feedback-open]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      openFeedback();
    }),
  );
  // Capture phase so Esc closes the panel without also leaving full screen.
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape' || !isFeedbackOpen()) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      closeFeedback();
    },
    true,
  );
  // Keep Tab inside the dialog.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isFeedbackOpen()) return;
    const f = [...panel.querySelectorAll('button, input, textarea, summary, [tabindex]:not([tabindex="-1"])')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });
  syncButtons();
  if (new URLSearchParams(window.location.search).get('feedback') === '1') openFeedback();
}
