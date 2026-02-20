import { events, eras } from './events.js';
import {
  drawSwimLaneView,
  drawSwimLaneMinimap,
  getItemAtPos,
  getSwimLaneDefaults,
  minimapClickToYear,
} from './swim-lane-view.js';
import { civilisations, regions } from './civilisations.js';
import { technologies, technologyCategories } from './technology.js';
import { sciences, scienceCategories } from './science.js';
import { cosmicHistoryItems, cosmicHistoryCategories, COSMIC_LOG_MIN, COSMIC_LOG_MAX } from './cosmic-history.js';
import { currentTheme, initTheme, toggleTheme } from './theme.js';

// ============================================================
// Logarithmic scale mapping (cosmic timeline)
// ============================================================
const REFERENCE_YEAR = 2025;
const MIN_YEAR = -13_800_000_000;
const MAX_YEAR = 2025;

function yearToLog(year) {
  const offset = REFERENCE_YEAR - year;
  if (offset <= 0) return 0;
  return -Math.log10(1 + offset);
}

function logToYear(logVal) {
  const offset = Math.pow(10, -logVal) - 1;
  return REFERENCE_YEAR - offset;
}

const LOG_MIN = yearToLog(MIN_YEAR);
const LOG_MAX = yearToLog(MAX_YEAR);
const LOG_RANGE = LOG_MAX - LOG_MIN;

// Padded range so edge events aren't clipped by their circle radius on initial load
const VIEW_PAD = LOG_RANGE * 0.03;
const LOG_MIN_PADDED = LOG_MIN - VIEW_PAD;
const LOG_MAX_PADDED = LOG_MAX + VIEW_PAD;

// ============================================================
// Date formatting
// ============================================================
function formatYear(year) {
  if (year <= -1_000_000_000) {
    return (Math.abs(year) / 1_000_000_000).toFixed(1) + ' billion years ago';
  }
  if (year <= -1_000_000) {
    return Math.round(Math.abs(year) / 1_000_000) + ' million years ago';
  }
  if (year <= -10_000) {
    return Math.round(Math.abs(year) / 1000).toLocaleString() + ',000 years ago';
  }
  if (year < 0) return Math.abs(Math.round(year)).toLocaleString() + ' BCE';
  return Math.round(year) + ' CE';
}

function formatYearShort(year) {
  if (year <= -1_000_000_000) return (Math.abs(year) / 1e9).toFixed(1) + 'B ya';
  if (year <= -1_000_000) return Math.round(Math.abs(year) / 1e6) + 'M ya';
  if (year <= -10_000) return Math.round(Math.abs(year) / 1000) + 'K ya';
  if (year < 0) return Math.abs(Math.round(year)).toLocaleString() + ' BCE';
  return Math.round(year) + ' CE';
}

// ============================================================
// Shared state
// ============================================================
let currentView = 'cosmic'; // 'cosmic' | 'civilisations' | 'technology' | 'science'

// Cosmic view state
let viewStart = LOG_MIN_PADDED;
let viewEnd = LOG_MAX_PADDED;
let targetViewStart = viewStart;
let targetViewEnd = viewEnd;
let hoveredEvent = null;
let selectedEvent = null;

// ============================================================
// Swim-lane state (generic for all swim-lane views)
// ============================================================
function createSwimLaneState(items, categories, minYear, maxYear) {
  const defaults = getSwimLaneDefaults(minYear, maxYear);
  return {
    items,
    categories,
    defaults,
    viewStart: defaults.startYear,
    viewEnd: defaults.endYear,
    targetStart: defaults.startYear,
    targetEnd: defaults.endYear,
    scrollY: 0,
    maxScrollY: 0,
    hoveredItem: null,
    selectedItem: null,
    hitAreas: [],
  };
}

const swimStates = {
  'cosmic-history': createSwimLaneState(cosmicHistoryItems, cosmicHistoryCategories, COSMIC_LOG_MIN, COSMIC_LOG_MAX),
  civilisations: createSwimLaneState(civilisations, regions, -3600, 2050),
  technology: createSwimLaneState(technologies, technologyCategories, -3500, 2050),
  science: createSwimLaneState(sciences, scienceCategories, -3100, 2050),
};

function currentSwimState() {
  return swimStates[currentView];
}

function isSwimLaneView() {
  return currentView !== 'cosmic';
}

// Responsive scale factor (1 on desktop, smaller on mobile)
let uiScale = 1;

// Shared interaction state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartViewStart = 0;
let dragStartScrollY = 0;
let animationId = null;

// ============================================================
// DOM refs
// ============================================================
const canvas = document.getElementById('timeline-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('timeline-container');
const tooltip = document.getElementById('tooltip');
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas.getContext('2d');
const minimapViewport = document.getElementById('minimap-viewport');
const eraNav = document.getElementById('era-nav');

// Precompute log positions for events
const eventPositions = events.map(e => ({
  ...e,
  logPos: yearToLog(e.year),
}));

// ============================================================
// Canvas sizing
// ============================================================
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  uiScale = Math.max(0.55, Math.min(1, rect.width / 700));
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const mmRect = document.getElementById('minimap').getBoundingClientRect();
  minimapCanvas.width = mmRect.width * dpr;
  minimapCanvas.height = mmRect.height * dpr;
  minimapCanvas.style.width = mmRect.width + 'px';
  minimapCanvas.style.height = mmRect.height + 'px';
  minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  draw();
}

// ============================================================
// Draw dispatcher
// ============================================================
function draw() {
  if (currentView === 'cosmic') {
    drawCosmicTimeline();
  } else {
    drawSwimView();
  }
}

// ============================================================
// Cosmic timeline drawing
// ============================================================
function logToX(logVal) {
  const w = parseFloat(canvas.style.width);
  return ((logVal - viewStart) / (viewEnd - viewStart)) * w;
}

function xToLog(x) {
  const w = parseFloat(canvas.style.width);
  return viewStart + (x / w) * (viewEnd - viewStart);
}

function drawCosmicTimeline() {
  const w = parseFloat(canvas.style.width);
  const h = parseFloat(canvas.style.height);
  const theme = currentTheme();
  const s = uiScale;
  ctx.clearRect(0, 0, w, h);

  // Scaled constants
  const eventRadius = Math.round(18 * s);
  const baseOffset = Math.round(40 * s);
  const hoverGrow = Math.round(4 * s);
  const connectorDash = Math.round(3 * s);
  const eraFontSize = Math.round(11 * s);
  const iconFontSize = Math.max(10, Math.round(14 * s));

  // Era backgrounds
  for (const era of eras) {
    const eraLogStart = yearToLog(era.start);
    const eraLogEnd = yearToLog(era.end);
    const x1 = Math.max(0, logToX(eraLogStart));
    const x2 = Math.min(w, logToX(eraLogEnd));
    if (x2 < 0 || x1 > w) continue;

    ctx.fillStyle = era.color + theme.eraBgAlpha;
    ctx.fillRect(x1, 0, x2 - x1, h);

    const midX = (x1 + x2) / 2;
    if (x2 - x1 > 60 * s) {
      ctx.save();
      ctx.fillStyle = era.color + theme.eraLabelAlpha;
      ctx.font = `600 ${eraFontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(era.name, midX, Math.round(8 * s));
      ctx.restore();
    }
  }

  // Timeline axis — positioned in the lower quarter for breathing room
  const axisY = h * 0.75;
  ctx.strokeStyle = theme.axis;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, axisY);
  ctx.lineTo(w, axisY);
  ctx.stroke();

  drawTicks(w, h, axisY);

  // Events
  const visibleEvents = eventPositions.filter(e => {
    const x = logToX(e.logPos);
    return x > -50 && x < w + 50;
  });

  // Collision resolution
  const placed = [];
  for (const evt of visibleEvents) {
    const x = logToX(evt.logPos);
    let row = 0;
    let collides = true;
    while (collides) {
      collides = false;
      for (const p of placed) {
        if (Math.abs(p.x - x) < eventRadius * 2.2 && p.row === row) {
          collides = true;
          row++;
          break;
        }
      }
    }
    placed.push({ x, row, evt });
  }

  for (const { x, row, evt } of placed) {
    const yOffset = row * (eventRadius * 2.5);
    const y = axisY - baseOffset - yOffset;
    const isHovered = hoveredEvent === evt;
    const isSelected = selectedEvent === evt;

    // Connector
    ctx.strokeStyle = theme.axisLight;
    ctx.lineWidth = 1;
    ctx.setLineDash([connectorDash, connectorDash]);
    ctx.beginPath();
    ctx.moveTo(x, axisY);
    ctx.lineTo(x, y + eventRadius);
    ctx.stroke();
    ctx.setLineDash([]);

    // Circle
    const era = eras.find(er => er.name === evt.era);
    const baseColor = era ? era.color : '#6366F1';

    ctx.beginPath();
    ctx.arc(x, y, eventRadius + (isHovered || isSelected ? hoverGrow : 0), 0, Math.PI * 2);
    ctx.fillStyle = isHovered || isSelected ? baseColor : baseColor + 'CC';
    ctx.fill();
    ctx.strokeStyle = theme.eventStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.font = `${iconFontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(evt.icon, x, y);

    evt._hitX = x;
    evt._hitY = y;
    evt._hitR = eventRadius + hoverGrow;
  }

  drawCosmicMinimap();
}

function drawTicks(w, h, axisY) {
  const theme = currentTheme();
  const s = uiScale;
  const tickFontSize = Math.round(10 * s);
  const tickHalf = Math.round(6 * s);
  const tickLabelOffset = Math.round(12 * s);

  ctx.fillStyle = theme.textMuted;
  ctx.font = `400 ${tickFontSize}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const numTicks = Math.floor(w / (120 * s));
  for (let i = 0; i <= numTicks; i++) {
    const logVal = viewStart + (i / numTicks) * (viewEnd - viewStart);
    const x = logToX(logVal);
    const year = logToYear(logVal);

    ctx.strokeStyle = theme.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, axisY - tickHalf);
    ctx.lineTo(x, axisY + tickHalf);
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.fillText(formatYearShort(year), x, axisY + tickLabelOffset);
  }
}

function drawCosmicMinimap() {
  const mmW = parseFloat(minimapCanvas.style.width);
  const mmH = parseFloat(minimapCanvas.style.height);
  const theme = currentTheme();
  minimapCtx.clearRect(0, 0, mmW, mmH);

  for (const era of eras) {
    const eraLogStart = yearToLog(era.start);
    const eraLogEnd = yearToLog(era.end);
    const x1 = ((eraLogStart - LOG_MIN) / LOG_RANGE) * mmW;
    const x2 = ((eraLogEnd - LOG_MIN) / LOG_RANGE) * mmW;
    minimapCtx.fillStyle = era.color + theme.eraMinimapAlpha;
    minimapCtx.fillRect(x1, 0, x2 - x1, mmH);
  }

  for (const evt of eventPositions) {
    const x = ((evt.logPos - LOG_MIN) / LOG_RANGE) * mmW;
    minimapCtx.fillStyle = theme.textMuted;
    minimapCtx.beginPath();
    minimapCtx.arc(x, mmH / 2, Math.max(1.5, 2 * uiScale), 0, Math.PI * 2);
    minimapCtx.fill();
  }

  const vpLeft = ((viewStart - LOG_MIN) / LOG_RANGE) * mmW;
  const vpRight = ((viewEnd - LOG_MIN) / LOG_RANGE) * mmW;
  minimapViewport.style.left = vpLeft + 'px';
  minimapViewport.style.width = Math.max(4, vpRight - vpLeft) + 'px';
}

// ============================================================
// Swim-lane view drawing (generic for civs, tech, science)
// ============================================================
function drawSwimView() {
  const w = parseFloat(canvas.style.width);
  const h = parseFloat(canvas.style.height);
  const state = currentSwimState();

  // For cosmic-history the view coordinates are log-space values, not years.
  // Wrap formatYearShort so tick labels convert log → year first.
  const formatFn = currentView === 'cosmic-history'
    ? (logVal) => formatYearShort(logToYear(logVal))
    : formatYearShort;

  const result = drawSwimLaneView(
    ctx, w, h,
    state.viewStart, state.viewEnd,
    state.scrollY, state.hoveredItem,
    formatFn, uiScale,
    state.items, state.categories
  );

  state.hitAreas = result.hitAreas;
  state.maxScrollY = Math.max(0, result.totalHeight - h + 40);

  // Minimap
  const mmW = parseFloat(minimapCanvas.style.width);
  const mmH = parseFloat(minimapCanvas.style.height);
  const vp = drawSwimLaneMinimap(
    minimapCtx, mmW, mmH,
    state.viewStart, state.viewEnd, uiScale,
    state.items, state.categories,
    state.defaults.minYear, state.defaults.maxYear
  );
  minimapViewport.style.left = vp.vpLeft + 'px';
  minimapViewport.style.width = Math.max(4, vp.vpWidth) + 'px';
}

// ============================================================
// Interaction — cosmic
// ============================================================
function getEventAtPos(mx, my) {
  for (const evt of eventPositions) {
    if (evt._hitX === undefined) continue;
    const dx = mx - evt._hitX;
    const dy = my - evt._hitY;
    if (dx * dx + dy * dy < evt._hitR * evt._hitR) return evt;
  }
  return null;
}

// ============================================================
// Mouse handlers
// ============================================================
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  canvas.style.cursor = 'grabbing';

  if (currentView === 'cosmic') {
    dragStartViewStart = viewStart;
  } else {
    const state = currentSwimState();
    dragStartViewStart = state.viewStart;
    dragStartScrollY = state.scrollY;
  }
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const dx = e.clientX - dragStartX;
    const w = parseFloat(canvas.style.width);

    if (currentView === 'cosmic') {
      const logDx = (dx / w) * (viewEnd - viewStart);
      const newStart = dragStartViewStart - logDx;
      const range = viewEnd - viewStart;
      viewStart = newStart;
      viewEnd = newStart + range;
      targetViewStart = viewStart;
      targetViewEnd = viewEnd;
    } else {
      const state = currentSwimState();
      const range = state.targetEnd - state.targetStart;
      const yearDx = (dx / w) * range;
      state.viewStart = dragStartViewStart - yearDx;
      state.viewEnd = state.viewStart + range;
      state.targetStart = state.viewStart;
      state.targetEnd = state.viewEnd;

      // Vertical scroll with drag
      const dy = e.clientY - dragStartY;
      state.scrollY = Math.max(0, Math.min(state.maxScrollY, dragStartScrollY - dy));
    }

    draw();
    return;
  }

  // Hover detection
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (currentView === 'cosmic') {
    const evt = getEventAtPos(mx, my);
    if (evt !== hoveredEvent) {
      hoveredEvent = evt;
      canvas.style.cursor = evt ? 'pointer' : 'grab';
      if (evt) {
        tooltip.innerHTML = `<strong>${evt.title}</strong><br>${formatYear(evt.year)}`;
        tooltip.style.left = (evt._hitX + Math.round(20 * uiScale)) + 'px';
        tooltip.style.top = (evt._hitY - Math.round(10 * uiScale)) + 'px';
        tooltip.classList.add('visible');
      } else {
        tooltip.classList.remove('visible');
      }
      draw();
    }
  } else {
    const state = currentSwimState();
    const item = getItemAtPos(state.hitAreas, mx, my);
    if (item !== state.hoveredItem) {
      state.hoveredItem = item;
      canvas.style.cursor = item ? 'pointer' : 'grab';
      if (item) {
        const tooltipX = Math.min(mx + 20, parseFloat(canvas.style.width) - 260);
        const itemStart = item.startYear !== undefined ? item.startYear : item.start;
        const itemEnd = item.endYear !== undefined ? item.endYear : item.end;
        tooltip.innerHTML = `<strong>${item.icon} ${item.name}</strong><br>${formatYear(itemStart)} — ${formatYear(itemEnd)}`;
        tooltip.style.left = tooltipX + 'px';
        tooltip.style.top = (my - 10) + 'px';
        tooltip.classList.add('visible');
      } else {
        tooltip.classList.remove('visible');
      }
      draw();
    }
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  if (currentView === 'cosmic') {
    canvas.style.cursor = hoveredEvent ? 'pointer' : 'grab';
  } else {
    const state = currentSwimState();
    canvas.style.cursor = state.hoveredItem ? 'pointer' : 'grab';
  }
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (currentView === 'cosmic') {
    const evt = getEventAtPos(mx, my);
    if (evt) {
      selectedEvent = evt;
      showDetail(evt.icon + ' ' + evt.title, formatYear(evt.year), evt.description);
      draw();
    }
  } else {
    const state = currentSwimState();
    const item = getItemAtPos(state.hitAreas, mx, my);
    if (item) {
      state.selectedItem = item;
      const itemStart = item.startYear !== undefined ? item.startYear : item.start;
      const itemEnd = item.endYear !== undefined ? item.endYear : item.end;
      const duration = Math.abs(itemEnd - itemStart);
      let durationStr;
      if (duration >= 1_000_000_000) durationStr = (duration / 1_000_000_000).toFixed(1) + ' billion years';
      else if (duration >= 1_000_000) durationStr = Math.round(duration / 1_000_000).toLocaleString() + ' million years';
      else durationStr = duration.toLocaleString() + ' years';
      const dateStr = formatYear(itemStart) + ' — ' + formatYear(itemEnd) + '  (' + durationStr + ')';
      showDetail(item.icon + ' ' + item.name, dateStr, item.description);
      draw();
    }
  }
});

// ============================================================
// Wheel / zoom
// ============================================================
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const w = rect.width;

  if (currentView === 'cosmic') {
    const mouseLog = xToLog(mx);
    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87;
    const newRange = (viewEnd - viewStart) * zoomFactor;
    const clampedRange = Math.min(LOG_RANGE * 1.1, Math.max(LOG_RANGE * 0.0001, newRange));
    const mouseRatio = mx / w;
    targetViewStart = mouseLog - clampedRange * mouseRatio;
    targetViewEnd = mouseLog + clampedRange * (1 - mouseRatio);
    if (!animationId) animateZoom();
  } else {
    const state = currentSwimState();
    const mouseYear = state.viewStart + (mx / w) * (state.viewEnd - state.viewStart);
    const zoomFactor = e.deltaY > 0 ? 1.12 : 0.89;
    const range = (state.viewEnd - state.viewStart) * zoomFactor;
    const minRange = currentView === 'cosmic-history' ? state.defaults.yearRange * 0.0001 : 20;
    const clampedRange = Math.min(state.defaults.yearRange * 1.2, Math.max(minRange, range));
    const mouseRatio = mx / w;
    state.targetStart = mouseYear - clampedRange * mouseRatio;
    state.targetEnd = mouseYear + clampedRange * (1 - mouseRatio);
    if (!animationId) animateZoom();
  }
}, { passive: false });

// ============================================================
// Smooth zoom animation
// ============================================================
function animateZoom() {
  const lerp = 0.25;

  if (currentView === 'cosmic') {
    viewStart += (targetViewStart - viewStart) * lerp;
    viewEnd += (targetViewEnd - viewEnd) * lerp;
    const done = Math.abs(viewStart - targetViewStart) < 0.0001 && Math.abs(viewEnd - targetViewEnd) < 0.0001;
    if (done) {
      viewStart = targetViewStart;
      viewEnd = targetViewEnd;
    }
    draw();
    if (!done) {
      animationId = requestAnimationFrame(animateZoom);
    } else {
      animationId = null;
    }
  } else {
    const state = currentSwimState();
    state.viewStart += (state.targetStart - state.viewStart) * lerp;
    state.viewEnd += (state.targetEnd - state.viewEnd) * lerp;
    // Use tighter threshold for log-space views (cosmic-history range is ~10, not ~5000)
    const epsilon = currentView === 'cosmic-history' ? 0.0001 : 0.5;
    const done = Math.abs(state.viewStart - state.targetStart) < epsilon && Math.abs(state.viewEnd - state.targetEnd) < epsilon;
    if (done) {
      state.viewStart = state.targetStart;
      state.viewEnd = state.targetEnd;
    }
    draw();
    if (!done) {
      animationId = requestAnimationFrame(animateZoom);
    } else {
      animationId = null;
    }
  }
}

// ============================================================
// Touch support
// ============================================================
let touchStartDist = 0;
let touchStartMid = 0;
let touchStartViewStart = 0;
let touchStartViewEnd = 0;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    if (currentView === 'cosmic') {
      dragStartViewStart = viewStart;
    } else {
      const state = currentSwimState();
      dragStartViewStart = state.viewStart;
      dragStartScrollY = state.scrollY;
    }
  } else if (e.touches.length === 2) {
    isDragging = false;
    touchStartDist = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
    touchStartMid = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    if (currentView === 'cosmic') {
      touchStartViewStart = viewStart;
      touchStartViewEnd = viewEnd;
    } else {
      const state = currentSwimState();
      touchStartViewStart = state.viewStart;
      touchStartViewEnd = state.viewEnd;
    }
  }
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (e.touches.length === 1 && isDragging) {
    const dx = e.touches[0].clientX - dragStartX;
    const w = parseFloat(canvas.style.width);

    if (currentView === 'cosmic') {
      const logDx = (dx / w) * (viewEnd - viewStart);
      const newStart = dragStartViewStart - logDx;
      const range = viewEnd - viewStart;
      viewStart = newStart;
      viewEnd = newStart + range;
      targetViewStart = viewStart;
      targetViewEnd = viewEnd;
    } else {
      const state = currentSwimState();
      const range = state.targetEnd - state.targetStart;
      const yearDx = (dx / w) * range;
      state.viewStart = dragStartViewStart - yearDx;
      state.viewEnd = state.viewStart + range;
      state.targetStart = state.viewStart;
      state.targetEnd = state.viewEnd;

      const dy = e.touches[0].clientY - dragStartY;
      state.scrollY = Math.max(0, Math.min(state.maxScrollY, dragStartScrollY - dy));
    }
    draw();
  } else if (e.touches.length === 2) {
    const dist = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
    const scale = touchStartDist / dist;
    const rect = canvas.getBoundingClientRect();
    const mid = touchStartMid - rect.left;
    const w = rect.width;

    if (currentView === 'cosmic') {
      const mouseLog = touchStartViewStart + (mid / w) * (touchStartViewEnd - touchStartViewStart);
      const origRange = touchStartViewEnd - touchStartViewStart;
      const newRange = Math.min(LOG_RANGE * 1.1, Math.max(LOG_RANGE * 0.0001, origRange * scale));
      const mouseRatio = mid / w;
      viewStart = mouseLog - newRange * mouseRatio;
      viewEnd = mouseLog + newRange * (1 - mouseRatio);
      targetViewStart = viewStart;
      targetViewEnd = viewEnd;
    } else {
      const state = currentSwimState();
      const mouseYear = touchStartViewStart + (mid / w) * (touchStartViewEnd - touchStartViewStart);
      const origRange = touchStartViewEnd - touchStartViewStart;
      const touchMinRange = currentView === 'cosmic-history' ? state.defaults.yearRange * 0.0001 : 20;
      const newRange = Math.min(state.defaults.yearRange * 1.2, Math.max(touchMinRange, origRange * scale));
      const mouseRatio = mid / w;
      state.viewStart = mouseYear - newRange * mouseRatio;
      state.viewEnd = mouseYear + newRange * (1 - mouseRatio);
      state.targetStart = state.viewStart;
      state.targetEnd = state.viewEnd;
    }
    draw();
  }
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDragging = false;
});

// ============================================================
// Detail panel
// ============================================================
function showDetail(title, date, description) {
  document.getElementById('detail-title').textContent = title;
  document.getElementById('detail-date').textContent = date;
  document.getElementById('detail-description').textContent = description;
  document.getElementById('event-detail').classList.remove('hidden');
}

document.getElementById('detail-close').addEventListener('click', () => {
  document.getElementById('event-detail').classList.add('hidden');
  selectedEvent = null;
  // Clear selected item in all swim-lane states
  for (const key of Object.keys(swimStates)) {
    swimStates[key].selectedItem = null;
  }
  draw();
});

// ============================================================
// View toggle
// ============================================================
const viewSelect = document.getElementById('view-select');

function switchView(view) {
  currentView = view;
  viewSelect.value = view;
  eraNav.style.display = view === 'cosmic' ? 'flex' : 'none';

  // Close detail panel on switch
  document.getElementById('event-detail').classList.add('hidden');
  tooltip.classList.remove('visible');
  hoveredEvent = null;
  selectedEvent = null;
  // Clear hovered/selected in all swim-lane states
  for (const key of Object.keys(swimStates)) {
    swimStates[key].hoveredItem = null;
    swimStates[key].selectedItem = null;
  }

  draw();
}

viewSelect.addEventListener('change', (e) => switchView(e.target.value));

// ============================================================
// Zoom controls
// ============================================================
document.getElementById('zoom-in').addEventListener('click', () => {
  if (currentView === 'cosmic') {
    const mid = (viewStart + viewEnd) / 2;
    const range = (viewEnd - viewStart) * 0.5;
    targetViewStart = mid - range / 2;
    targetViewEnd = mid + range / 2;
  } else {
    const state = currentSwimState();
    const mid = (state.viewStart + state.viewEnd) / 2;
    const range = (state.viewEnd - state.viewStart) * 0.5;
    state.targetStart = mid - range / 2;
    state.targetEnd = mid + range / 2;
  }
  if (!animationId) animateZoom();
});

document.getElementById('zoom-out').addEventListener('click', () => {
  if (currentView === 'cosmic') {
    const mid = (viewStart + viewEnd) / 2;
    const range = (viewEnd - viewStart) * 2;
    const clampedRange = Math.min(LOG_RANGE * 1.1, range);
    targetViewStart = mid - clampedRange / 2;
    targetViewEnd = mid + clampedRange / 2;
  } else {
    const state = currentSwimState();
    const mid = (state.viewStart + state.viewEnd) / 2;
    const range = (state.viewEnd - state.viewStart) * 2;
    const clampedRange = Math.min(state.defaults.yearRange * 1.2, range);
    state.targetStart = mid - clampedRange / 2;
    state.targetEnd = mid + clampedRange / 2;
  }
  if (!animationId) animateZoom();
});

document.getElementById('zoom-fit').addEventListener('click', () => {
  if (currentView === 'cosmic') {
    targetViewStart = LOG_MIN_PADDED;
    targetViewEnd = LOG_MAX_PADDED;
  } else {
    const state = currentSwimState();
    state.targetStart = state.defaults.startYear;
    state.targetEnd = state.defaults.endYear;
    state.scrollY = 0;
  }
  if (!animationId) animateZoom();
});

// ============================================================
// Era navigation (cosmic view only)
// ============================================================
for (const era of eras) {
  const btn = document.createElement('button');
  btn.className = 'era-btn';
  btn.textContent = era.name;
  btn.style.setProperty('--era-color', era.color);
  btn.addEventListener('click', () => {
    const eraLogStart = yearToLog(era.start);
    const eraLogEnd = yearToLog(era.end);
    const padding = (eraLogEnd - eraLogStart) * 0.1;
    targetViewStart = eraLogStart - padding;
    targetViewEnd = eraLogEnd + padding;
    if (!animationId) animateZoom();
  });
  eraNav.appendChild(btn);
}

// ============================================================
// Minimap click
// ============================================================
document.getElementById('minimap').addEventListener('click', (e) => {
  const rect = document.getElementById('minimap').getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const mmW = rect.width;

  if (currentView === 'cosmic') {
    const clickLog = LOG_MIN + (mx / mmW) * LOG_RANGE;
    const range = viewEnd - viewStart;
    targetViewStart = clickLog - range / 2;
    targetViewEnd = clickLog + range / 2;
  } else {
    const state = currentSwimState();
    const clickYear = minimapClickToYear(mx, mmW, state.defaults.minYear, state.defaults.maxYear);
    const range = state.viewEnd - state.viewStart;
    state.targetStart = clickYear - range / 2;
    state.targetEnd = clickYear + range / 2;
  }
  if (!animationId) animateZoom();
});

// ============================================================
// Theme toggle
// ============================================================
initTheme();
const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.textContent = currentTheme().name === 'dark' ? '🌙' : '☀️';
themeToggleBtn.addEventListener('click', () => {
  const name = toggleTheme();
  themeToggleBtn.textContent = name === 'dark' ? '🌙' : '☀️';
  draw();
});

// ============================================================
// Init
// ============================================================
window.addEventListener('resize', resize);
resize();
canvas.style.cursor = 'grab';
