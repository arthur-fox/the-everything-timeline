// Canvas colour palettes for dark and light themes.
// CSS variables handle DOM elements; these handle canvas drawing.

const darkTheme = {
  name: 'dark',
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

export function currentTheme() {
  return active;
}

export function initTheme() {
  const saved = localStorage.getItem('timeline-theme');
  const name = saved || 'dark';
  active = name === 'light' ? lightTheme : darkTheme;
  document.documentElement.dataset.theme = active.name;
  return active.name;
}

export function toggleTheme() {
  active = active === darkTheme ? lightTheme : darkTheme;
  document.documentElement.dataset.theme = active.name;
  localStorage.setItem('timeline-theme', active.name);
  return active.name;
}

export function getThemeName() {
  return active.name;
}
