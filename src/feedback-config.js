/**
 * Day 45: where feedback goes — the one place to change it.
 *
 * FORM_ENDPOINT: a form service URL that accepts a POST (Formspree, Getform, Basin, a Google
 * Apps Script web app, your own API …). Leave it '' and the Feedback panel falls back to
 * opening a prefilled *public* GitHub issue on GITHUB_REPO (the email field is left out of it)
 * plus a "Copy" button. See README → "Feedback" for the options.
 *
 * FORM_FORMAT: 'json' (Formspree, Getform, Basin, most APIs: JSON body, Accept: application/json)
 *              or 'form' (application/x-www-form-urlencoded, e.g. Google Apps Script).
 *
 * Never put a personal email address in here: the site is public and so is this file.
 */
export const FEEDBACK_CONFIG = {
  FORM_ENDPOINT: '',
  FORM_FORMAT: 'json',
  GITHUB_REPO: 'arthur-fox/the-everything-timeline',
  ISSUE_LABEL: 'feedback',
};

/** Candidate paid features we're testing interest in ("Would you pay for…?"). */
export const PREMIUM_IDEAS = [
  { id: 'ad-free', label: 'Ad-free + early access to new layers' },
  { id: 'saved-timelines', label: 'Saved custom timelines & sharing' },
  { id: 'classroom', label: 'Classroom / teacher mode' },
  { id: 'exports', label: 'High-res exports & posters' },
  { id: 'data-packs', label: 'Deeper data layers & historical map packs' },
  { id: 'offline-app', label: 'Offline / installable app' },
];

export const FEEDBACK_RATINGS = [
  { value: 1, emoji: '😞', label: 'Not for me' },
  { value: 2, emoji: '🙁', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'OK' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😍', label: 'Love it' },
];
