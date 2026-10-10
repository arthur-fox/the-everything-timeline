/**
 * Day 45/50: where feedback goes — the one place to change it.
 *
 * FORM_ENDPOINT: Formspark form (Arthur's account; notifications go to his inbox). The panel
 * POSTs JSON with Content-Type + Accept: application/json; field names are chosen to read well
 * in the notification email, and `_email.subject` / `_email.from` set its subject and sender
 * name (see https://documentation.formspark.io/customization/notification-email.html).
 * `_honeypot` is Formspark's built-in honeypot: a submission with it filled is silently dropped.
 *
 * The workspace's submission quota is shared with another product: don't load-test this URL.
 * For format checks use https://submit-form.com/echo, which echoes the payload and stores nothing.
 *
 * Never put a personal email address in here: the site is public and so is this file.
 */
export const FEEDBACK_CONFIG = {
  FORM_ENDPOINT: 'https://submit-form.com/8iSgNi2yA',
  EMAIL_FROM: 'Everything Timeline', // letters, digits, spaces, dashes, underscores only (Formspark rule)
  MIN_SECONDS_BETWEEN_SENDS: 30,
  TIMEOUT_MS: 15000,
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
