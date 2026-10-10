// Canvas colour palettes for dark and light themes.
// CSS variables handle DOM elements; these handle canvas drawing.

const darkTheme = {
  name: 'dark',
  font: 'sans-serif',
  bg: '#0F172A',
  bgSurface: '#1E293B',
  axis: '#334155',
  axisLight: '#475569',
  gridLine: '#1E293B',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  eventStroke: '#ffffff',
  clipBg: '#0F172A',
  clipBgAlpha: '#0F172AF0',
  // Opacity suffixes for region/era colours on canvas
  eraBgAlpha: '18',
  eraLabelAlpha: '60',
  eraMinimapAlpha: '40',
  barNormal: '77',
  barHover: 'DD',
  barBorderNormal: 'AA',
  barPeriod: 'BB',
  periodLabelColor: '#F1F5F9AA',
  regionHeaderBg: '20',
  minimapBar: '80',
};

const lightTheme = {
  name: 'light',
  font: 'sans-serif',
  bg: '#F8FAFC',
  bgSurface: '#E2E8F0',
  axis: '#CBD5E1',
  axisLight: '#94A3B8',
  gridLine: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#475569',
  eventStroke: '#1E293B',
  clipBg: '#F8FAFC',
  clipBgAlpha: '#F8FAFCF0',
  eraBgAlpha: '15',
  eraLabelAlpha: '90',
  eraMinimapAlpha: '30',
  barNormal: '55',
  barHover: 'BB',
  barBorderNormal: '88',
  barPeriod: '99',
  periodLabelColor: '#1E293BAA',
  regionHeaderBg: '15',
  minimapBar: '60',
};

let active = darkTheme;

/**
 * Day 47: pull the canvas colours + UI font from the CSS design tokens so the canvas follows
 * the brand palette (incl. ?palette=b|c previews). Tokens must be 6-digit hex (alpha suffixes
 * are appended below).
 */
function readTokens(theme) {
  const cs = getComputedStyle(document.documentElement);
  const v = (name) => cs.getPropertyValue(name).trim();
  const hex = (name, fallback) => (/^#[0-9a-f]{6}$/i.test(v(name)) ? v(name) : fallback);
  const bg = hex('--bg', theme.bg);
  const text = hex('--text', theme.text);
  Object.assign(theme, {
    bg,
    bgSurface: hex('--bg-surface', theme.bgSurface),
    axis: hex('--canvas-axis', theme.axis),
    axisLight: hex('--canvas-axis-light', theme.axisLight),
    gridLine: hex('--bg-surface', theme.gridLine),
    text,
    textMuted: hex('--text-muted', theme.textMuted),
    clipBg: bg,
    clipBgAlpha: `${bg}F0`,
    periodLabelColor: `${text}AA`,
    font: v('--font-ui') || 'sans-serif',
  });
}

export function currentTheme() {
  return active;
}

export function initTheme() {
  const saved = localStorage.getItem('timeline-theme');
  const name = saved || 'dark';
  active = name === 'light' ? lightTheme : darkTheme;
  document.documentElement.dataset.theme = active.name;
  readTokens(active);
  return active.name;
}

export function toggleTheme() {
  active = active === darkTheme ? lightTheme : darkTheme;
  document.documentElement.dataset.theme = active.name;
  readTokens(active);
  localStorage.setItem('timeline-theme', active.name);
  return active.name;
}

export function getThemeName() {
  return active.name;
}
