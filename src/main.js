import { events, eras } from './events.js';

// --- Logarithmic scale mapping ---
// We need to map years spanning 13.8 billion years onto a screen.
// A pure linear scale would make everything before ~1000 CE invisible.
// We use a signed-log scale: position = sign(offset) * log10(1 + |offset|)
// where offset is years relative to a reference year.

const REFERENCE_YEAR = 2025;
const MIN_YEAR = -13_800_000_000;
const MAX_YEAR = 2025;

function yearToLog(year) {
  const offset = REFERENCE_YEAR - year; // always positive for past events
  if (offset <= 0) return 0;
  return -Math.log10(1 + offset); // negative so older = further left
}

function logToYear(logVal) {
  const offset = Math.pow(10, -logVal) - 1;
  return REFERENCE_YEAR - offset;
}

const LOG_MIN = yearToLog(MIN_YEAR);
const LOG_MAX = yearToLog(MAX_YEAR);
const LOG_RANGE = LOG_MAX - LOG_MIN;

// --- State ---
let viewStart = LOG_MIN; // left edge in log-space
let viewEnd = LOG_MAX;   // right edge in log-space
let isDragging = false;
let dragStartX = 0;
let dragStartViewStart = 0;
let hoveredEvent = null;
let selectedEvent = null;
let animationId = null;

// target values for smooth animation
let targetViewStart = viewStart;
let targetViewEnd = viewEnd;

const canvas = document.getElementById('timeline-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('timeline-container');
const tooltip = document.getElementById('tooltip');
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas.getContext('2d');
const minimapViewport = document.getElementById('minimap-viewport');

// Precompute log positions for events
const eventPositions = events.map(e => ({
  ...e,
  logPos: yearToLog(e.year),
}));

// --- Canvas sizing ---
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Minimap
  const mmRect = document.getElementById('minimap').getBoundingClientRect();
  minimapCanvas.width = mmRect.width * dpr;
  minimapCanvas.height = mmRect.height * dpr;
  minimapCanvas.style.width = mmRect.width + 'px';
  minimapCanvas.style.height = mmRect.height + 'px';
  minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  draw();
}

// --- Drawing ---
function logToX(logVal) {
  const w = canvas.style.width ? parseFloat(canvas.style.width) : canvas.width;
  return ((logVal - viewStart) / (viewEnd - viewStart)) * w;
}

function xToLog(x) {
  const w = canvas.style.width ? parseFloat(canvas.style.width) : canvas.width;
  return viewStart + (x / w) * (viewEnd - viewStart);
}

function formatYear(year) {
  if (year <= -1_000_000_000) return (year / 1_000_000_000).toFixed(1) + ' Bya';
  if (year <= -1_000_000) return (year / 1_000_000).toFixed(1) + ' Mya';
  if (year <= -10_000) return Math.round(year / 1000) + ',000 BCE';
  if (year < 0) return Math.abs(Math.round(year)) + ' BCE';
  return Math.round(year) + ' CE';
}

function getEraForLogPos(logPos) {
  for (const era of eras) {
    const eraLogStart = yearToLog(era.start);
    const eraLogEnd = yearToLog(era.end);
    if (logPos >= eraLogStart && logPos <= eraLogEnd) return era;
  }
  return null;
}

function draw() {
  const w = parseFloat(canvas.style.width);
  const h = parseFloat(canvas.style.height);
  ctx.clearRect(0, 0, w, h);

  // Draw era backgrounds
  for (const era of eras) {
    const eraLogStart = yearToLog(era.start);
    const eraLogEnd = yearToLog(era.end);
    const x1 = Math.max(0, logToX(eraLogStart));
    const x2 = Math.min(w, logToX(eraLogEnd));
    if (x2 < 0 || x1 > w) continue;

    ctx.fillStyle = era.color + '18';
    ctx.fillRect(x1, 0, x2 - x1, h);

    // Era label
    const midX = (x1 + x2) / 2;
    if (x2 - x1 > 60) {
      ctx.save();
      ctx.fillStyle = era.color + '60';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(era.name, midX, 8);
      ctx.restore();
    }
  }

  // Draw timeline axis
  const axisY = h * 0.55;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, axisY);
  ctx.lineTo(w, axisY);
  ctx.stroke();

  // Draw tick marks based on zoom level
  drawTicks(w, h, axisY);

  // Draw events
  const eventRadius = 18;
  const visibleEvents = eventPositions.filter(e => {
    const x = logToX(e.logPos);
    return x > -50 && x < w + 50;
  });

  // Resolve overlaps with simple collision
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
    const y = axisY - 40 - yOffset;
    const isHovered = hoveredEvent === evt;
    const isSelected = selectedEvent === evt;

    // Connector line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, axisY);
    ctx.lineTo(x, y + eventRadius);
    ctx.stroke();
    ctx.setLineDash([]);

    // Event circle
    const era = eras.find(er => er.name === evt.era);
    const baseColor = era ? era.color : '#6366F1';

    ctx.beginPath();
    ctx.arc(x, y, eventRadius + (isHovered || isSelected ? 4 : 0), 0, Math.PI * 2);
    ctx.fillStyle = isHovered || isSelected ? baseColor : baseColor + 'CC';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(evt.icon, x, y);

    // Store hit area
    evt._hitX = x;
    evt._hitY = y;
    evt._hitR = eventRadius + 4;
  }

  drawMinimap();
}

function drawTicks(w, h, axisY) {
  const viewLogRange = viewEnd - viewStart;

  // Generate tick positions in log space
  ctx.fillStyle = '#94A3B8';
  ctx.font = '400 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const numTicks = Math.floor(w / 120);
  for (let i = 0; i <= numTicks; i++) {
    const logVal = viewStart + (i / numTicks) * viewLogRange;
    const x = logToX(logVal);
    const year = logToYear(logVal);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, axisY - 6);
    ctx.lineTo(x, axisY + 6);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.fillText(formatYear(year), x, axisY + 12);
  }
}

function drawMinimap() {
  const mmW = parseFloat(minimapCanvas.style.width);
  const mmH = parseFloat(minimapCanvas.style.height);
  minimapCtx.clearRect(0, 0, mmW, mmH);

  // Draw era colours on minimap
  for (const era of eras) {
    const eraLogStart = yearToLog(era.start);
    const eraLogEnd = yearToLog(era.end);
    const x1 = ((eraLogStart - LOG_MIN) / LOG_RANGE) * mmW;
    const x2 = ((eraLogEnd - LOG_MIN) / LOG_RANGE) * mmW;
    minimapCtx.fillStyle = era.color + '40';
    minimapCtx.fillRect(x1, 0, x2 - x1, mmH);
  }

  // Draw event dots
  for (const evt of eventPositions) {
    const x = ((evt.logPos - LOG_MIN) / LOG_RANGE) * mmW;
    minimapCtx.fillStyle = '#94A3B8';
    minimapCtx.beginPath();
    minimapCtx.arc(x, mmH / 2, 2, 0, Math.PI * 2);
    minimapCtx.fill();
  }

  // Viewport indicator
  const vpLeft = ((viewStart - LOG_MIN) / LOG_RANGE) * mmW;
  const vpRight = ((viewEnd - LOG_MIN) / LOG_RANGE) * mmW;
  minimapViewport.style.left = vpLeft + 'px';
  minimapViewport.style.width = Math.max(4, vpRight - vpLeft) + 'px';
}

// --- Interaction ---
function getEventAtPos(mx, my) {
  for (const evt of eventPositions) {
    if (evt._hitX === undefined) continue;
    const dx = mx - evt._hitX;
    const dy = my - evt._hitY;
    if (dx * dx + dy * dy < evt._hitR * evt._hitR) return evt;
  }
  return null;
}

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartViewStart = viewStart;
  canvas.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const dx = e.clientX - dragStartX;
    const w = parseFloat(canvas.style.width);
    const logDx = (dx / w) * (viewEnd - viewStart);
    const newStart = dragStartViewStart - logDx;
    const range = viewEnd - viewStart;
    viewStart = newStart;
    viewEnd = newStart + range;
    targetViewStart = viewStart;
    targetViewEnd = viewEnd;
    draw();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const evt = getEventAtPos(mx, my);

  if (evt !== hoveredEvent) {
    hoveredEvent = evt;
    canvas.style.cursor = evt ? 'pointer' : 'grab';
    if (evt) {
      tooltip.innerHTML = `<strong>${evt.title}</strong><br>${formatYear(evt.year)}`;
      tooltip.style.left = (evt._hitX + 20) + 'px';
      tooltip.style.top = (evt._hitY - 10) + 'px';
      tooltip.classList.add('visible');
    } else {
      tooltip.classList.remove('visible');
    }
    draw();
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = hoveredEvent ? 'pointer' : 'grab';
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const evt = getEventAtPos(mx, my);

  if (evt) {
    selectedEvent = evt;
    showDetail(evt);
    draw();
  }
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const w = rect.width;
  const mouseLog = xToLog(mx);

  const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87;
  const newRange = (viewEnd - viewStart) * zoomFactor;

  // Clamp to total range
  const clampedRange = Math.min(LOG_RANGE * 1.1, Math.max(LOG_RANGE * 0.0001, newRange));
  const mouseRatio = mx / w;

  targetViewStart = mouseLog - clampedRange * mouseRatio;
  targetViewEnd = mouseLog + clampedRange * (1 - mouseRatio);

  if (!animationId) animateZoom();
}, { passive: false });

function animateZoom() {
  const lerp = 0.25;
  viewStart += (targetViewStart - viewStart) * lerp;
  viewEnd += (targetViewEnd - viewEnd) * lerp;

  draw();

  if (Math.abs(viewStart - targetViewStart) > 0.0001 || Math.abs(viewEnd - targetViewEnd) > 0.0001) {
    animationId = requestAnimationFrame(animateZoom);
  } else {
    viewStart = targetViewStart;
    viewEnd = targetViewEnd;
    draw();
    animationId = null;
  }
}

// Touch support
let touchStartDist = 0;
let touchStartMid = 0;
let touchStartViewStart = 0;
let touchStartViewEnd = 0;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartViewStart = viewStart;
  } else if (e.touches.length === 2) {
    isDragging = false;
    touchStartDist = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
    touchStartMid = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    touchStartViewStart = viewStart;
    touchStartViewEnd = viewEnd;
  }
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (e.touches.length === 1 && isDragging) {
    const dx = e.touches[0].clientX - dragStartX;
    const w = parseFloat(canvas.style.width);
    const logDx = (dx / w) * (viewEnd - viewStart);
    const newStart = dragStartViewStart - logDx;
    const range = viewEnd - viewStart;
    viewStart = newStart;
    viewEnd = newStart + range;
    targetViewStart = viewStart;
    targetViewEnd = viewEnd;
    draw();
  } else if (e.touches.length === 2) {
    const dist = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
    const scale = touchStartDist / dist;
    const rect = canvas.getBoundingClientRect();
    const mid = touchStartMid - rect.left;
    const w = rect.width;
    const mouseLog = touchStartViewStart + (mid / w) * (touchStartViewEnd - touchStartViewStart);
    const origRange = touchStartViewEnd - touchStartViewStart;
    const newRange = Math.min(LOG_RANGE * 1.1, Math.max(LOG_RANGE * 0.0001, origRange * scale));
    const mouseRatio = mid / w;
    viewStart = mouseLog - newRange * mouseRatio;
    viewEnd = mouseLog + newRange * (1 - mouseRatio);
    targetViewStart = viewStart;
    targetViewEnd = viewEnd;
    draw();
  }
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDragging = false;
});

// --- Detail panel ---
function showDetail(evt) {
  document.getElementById('detail-title').textContent = evt.icon + ' ' + evt.title;
  document.getElementById('detail-date').textContent = formatYear(evt.year);
  document.getElementById('detail-description').textContent = evt.description;
  document.getElementById('event-detail').classList.remove('hidden');
}

document.getElementById('detail-close').addEventListener('click', () => {
  document.getElementById('event-detail').classList.add('hidden');
  selectedEvent = null;
  draw();
});

// --- Controls ---
document.getElementById('zoom-in').addEventListener('click', () => {
  const mid = (viewStart + viewEnd) / 2;
  const range = (viewEnd - viewStart) * 0.5;
  targetViewStart = mid - range / 2;
  targetViewEnd = mid + range / 2;
  if (!animationId) animateZoom();
});

document.getElementById('zoom-out').addEventListener('click', () => {
  const mid = (viewStart + viewEnd) / 2;
  const range = (viewEnd - viewStart) * 2;
  const clampedRange = Math.min(LOG_RANGE * 1.1, range);
  targetViewStart = mid - clampedRange / 2;
  targetViewEnd = mid + clampedRange / 2;
  if (!animationId) animateZoom();
});

document.getElementById('zoom-fit').addEventListener('click', () => {
  targetViewStart = LOG_MIN;
  targetViewEnd = LOG_MAX;
  if (!animationId) animateZoom();
});

// Era navigation buttons
const eraNav = document.getElementById('era-nav');
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

// Minimap click to navigate
document.getElementById('minimap').addEventListener('click', (e) => {
  const rect = document.getElementById('minimap').getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const mmW = rect.width;
  const clickLog = LOG_MIN + (mx / mmW) * LOG_RANGE;
  const range = viewEnd - viewStart;
  targetViewStart = clickLog - range / 2;
  targetViewEnd = clickLog + range / 2;
  if (!animationId) animateZoom();
});

// --- Init ---
window.addEventListener('resize', resize);
resize();
canvas.style.cursor = 'grab';
