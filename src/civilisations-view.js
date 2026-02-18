import { civilisations, regions } from './civilisations.js';
import { currentTheme } from './theme.js';

// --- Linear scale for civilisations view ---
const CIV_MIN_YEAR = -3600;
const CIV_MAX_YEAR = 2050;
const CIV_YEAR_RANGE = CIV_MAX_YEAR - CIV_MIN_YEAR;

// Layout constants
const TIME_AXIS_HEIGHT = 40;
const REGION_HEADER_HEIGHT = 28;
const BAR_HEIGHT = 26;
const BAR_GAP = 4;
const BAR_ROW_HEIGHT = BAR_HEIGHT + BAR_GAP;
const REGION_PADDING_BOTTOM = 12;

// --- State (managed by main.js, passed in) ---
// civViewStartYear, civViewEndYear, civScrollY are in main.js

export function getCivDefaults() {
  return {
    startYear: CIV_MIN_YEAR,
    endYear: CIV_MAX_YEAR,
    minYear: CIV_MIN_YEAR,
    maxYear: CIV_MAX_YEAR,
    yearRange: CIV_YEAR_RANGE,
  };
}

// --- Scale helpers ---
function yearToX(year, viewStart, viewEnd, w) {
  return ((year - viewStart) / (viewEnd - viewStart)) * w;
}

function xToYear(x, viewStart, viewEnd, w) {
  return viewStart + (x / w) * (viewEnd - viewStart);
}

// --- Layout ---
function layoutCivilisations(viewStart, viewEnd, w) {
  const regionGroups = [];

  for (const region of regions) {
    const civs = civilisations.filter(c => c.region === region.id);
    if (civs.length === 0) continue;

    const rows = [];
    for (const civ of civs) {
      const xStart = yearToX(civ.start, viewStart, viewEnd, w);
      const xEnd = yearToX(civ.end, viewStart, viewEnd, w);

      // Skip if entirely off-screen
      if (xEnd < -100 || xStart > w + 100) continue;

      let rowIndex = 0;
      let placed = false;
      while (!placed) {
        if (!rows[rowIndex]) rows[rowIndex] = [];
        const overlaps = rows[rowIndex].some(bar =>
          xStart < bar.xEnd + 6 && xEnd > bar.xStart - 6
        );
        if (!overlaps) {
          rows[rowIndex].push({ civ, xStart, xEnd });
          placed = true;
        } else {
          rowIndex++;
        }
      }
    }

    regionGroups.push({ region, rows });
  }

  return regionGroups;
}

// --- Round rect helper ---
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// --- Drawing ---
export function drawCivilisationsView(ctx, w, h, viewStart, viewEnd, scrollY, hoveredCiv, formatYearShort) {
  const theme = currentTheme();
  ctx.clearRect(0, 0, w, h);

  // Time axis at top
  drawTimeAxis(ctx, w, viewStart, viewEnd, formatYearShort);

  // Layout and draw civilisations
  const layout = layoutCivilisations(viewStart, viewEnd, w);

  let y = TIME_AXIS_HEIGHT - scrollY;
  const hitAreas = [];

  for (const group of layout) {
    const { region, rows } = group;

    // Region header
    if (y + REGION_HEADER_HEIGHT > 0 && y < h) {
      ctx.fillStyle = region.color + theme.regionHeaderBg;
      ctx.fillRect(0, y, w, REGION_HEADER_HEIGHT);

      ctx.fillStyle = region.color;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(region.name.toUpperCase(), 12, y + REGION_HEADER_HEIGHT / 2);

      // Region colour indicator
      ctx.fillStyle = region.color;
      roundRect(ctx, 3, y + 8, 4, REGION_HEADER_HEIGHT - 16, 2);
      ctx.fill();
    }
    y += REGION_HEADER_HEIGHT;

    // Bars
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      for (const bar of rows[rowIdx]) {
        const barY = y + rowIdx * BAR_ROW_HEIGHT;

        // Skip if off-screen vertically
        if (barY + BAR_HEIGHT < TIME_AXIS_HEIGHT || barY > h) continue;

        const isHovered = hoveredCiv === bar.civ;
        const barW = Math.max(4, bar.xEnd - bar.xStart);

        // Main bar
        ctx.fillStyle = isHovered ? region.color + theme.barHover : region.color + theme.barNormal;
        roundRect(ctx, bar.xStart, barY, barW, BAR_HEIGHT, 4);
        ctx.fill();

        // Border
        ctx.strokeStyle = isHovered ? region.color : region.color + theme.barBorderNormal;
        ctx.lineWidth = isHovered ? 2 : 1;
        roundRect(ctx, bar.xStart, barY, barW, BAR_HEIGHT, 4);
        ctx.stroke();

        // Sub-periods (darker segments)
        for (const period of bar.civ.periods) {
          const px1 = yearToX(period.start, viewStart, viewEnd, w);
          const px2 = yearToX(period.end, viewStart, viewEnd, w);
          const clampedX1 = Math.max(bar.xStart + 1, px1);
          const clampedX2 = Math.min(bar.xStart + barW - 1, px2);
          if (clampedX2 > clampedX1) {
            ctx.fillStyle = region.color + theme.barPeriod;
            roundRect(ctx, clampedX1, barY + 2, clampedX2 - clampedX1, BAR_HEIGHT - 4, 2);
            ctx.fill();

            // Period label if wide enough
            if (clampedX2 - clampedX1 > 80) {
              ctx.fillStyle = theme.periodLabelColor;
              ctx.font = '400 9px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(period.name, (clampedX1 + clampedX2) / 2, barY + BAR_HEIGHT / 2, clampedX2 - clampedX1 - 8);
            }
          }
        }

        // Label (if bar is wide enough and no sub-period labels shown)
        const hasVisiblePeriodLabels = bar.civ.periods.some(p => {
          const px1 = yearToX(p.start, viewStart, viewEnd, w);
          const px2 = yearToX(p.end, viewStart, viewEnd, w);
          return px2 - px1 > 80;
        });

        if (barW > 50) {
          ctx.fillStyle = theme.text;
          ctx.font = '500 11px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          const label = bar.civ.icon + ' ' + bar.civ.name;
          const labelX = Math.max(bar.xStart + 6, 6);
          ctx.fillText(label, labelX, barY + BAR_HEIGHT / 2, barW - 12);
        }

        // Store hit area
        hitAreas.push({
          civ: bar.civ,
          x: bar.xStart,
          y: barY,
          w: barW,
          h: BAR_HEIGHT,
        });
      }
    }

    y += rows.length * BAR_ROW_HEIGHT + REGION_PADDING_BOTTOM;
  }

  // Clip time axis area (draw over any bars that scrolled up)
  ctx.fillStyle = theme.clipBg;
  ctx.fillRect(0, 0, w, TIME_AXIS_HEIGHT);
  drawTimeAxis(ctx, w, viewStart, viewEnd, formatYearShort);

  return { hitAreas, totalHeight: y + scrollY };
}

function drawTimeAxis(ctx, w, viewStart, viewEnd, formatYearShort) {
  const theme = currentTheme();
  const axisY = TIME_AXIS_HEIGHT - 1;

  // Background
  ctx.fillStyle = theme.clipBgAlpha;
  ctx.fillRect(0, 0, w, TIME_AXIS_HEIGHT);

  // Axis line
  ctx.strokeStyle = theme.axis;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, axisY);
  ctx.lineTo(w, axisY);
  ctx.stroke();

  // Tick interval based on zoom
  const yearRange = viewEnd - viewStart;
  let tickInterval;
  if (yearRange > 4000) tickInterval = 500;
  else if (yearRange > 2000) tickInterval = 250;
  else if (yearRange > 1000) tickInterval = 200;
  else if (yearRange > 500) tickInterval = 100;
  else if (yearRange > 200) tickInterval = 50;
  else if (yearRange > 50) tickInterval = 10;
  else tickInterval = 5;

  const firstTick = Math.ceil(viewStart / tickInterval) * tickInterval;
  for (let year = firstTick; year <= viewEnd; year += tickInterval) {
    const x = yearToX(year, viewStart, viewEnd, w);

    ctx.strokeStyle = theme.axisLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, axisY - 5);
    ctx.lineTo(x, axisY);
    ctx.stroke();

    // Vertical grid line (subtle)
    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, axisY);
    ctx.lineTo(x, 2000); // extends down
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.font = '400 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(formatYearShort(year), x, axisY - 6);
  }
}

// --- Hit testing ---
export function getCivAtPos(hitAreas, mx, my) {
  for (const area of hitAreas) {
    if (mx >= area.x && mx <= area.x + area.w && my >= area.y && my <= area.y + area.h) {
      return area.civ;
    }
  }
  return null;
}

// --- Minimap ---
export function drawCivilisationsMinimap(mmCtx, mmW, mmH, viewStart, viewEnd) {
  const theme = currentTheme();
  mmCtx.clearRect(0, 0, mmW, mmH);

  const totalYearRange = CIV_MAX_YEAR - CIV_MIN_YEAR;

  // Draw region-coloured segments for each civilisation
  let regionY = 0;
  const regionHeight = mmH / regions.filter(r => civilisations.some(c => c.region === r.id)).length;

  for (const region of regions) {
    const civs = civilisations.filter(c => c.region === region.id);
    if (civs.length === 0) continue;

    // Region background
    mmCtx.fillStyle = region.color + theme.regionHeaderBg;
    mmCtx.fillRect(0, regionY, mmW, regionHeight);

    // Civilisation bars
    for (const civ of civs) {
      const x1 = ((civ.start - CIV_MIN_YEAR) / totalYearRange) * mmW;
      const x2 = ((civ.end - CIV_MIN_YEAR) / totalYearRange) * mmW;
      mmCtx.fillStyle = region.color + theme.minimapBar;
      mmCtx.fillRect(x1, regionY + 1, Math.max(1, x2 - x1), regionHeight - 2);
    }

    regionY += regionHeight;
  }

  // Viewport indicator handled by main.js via the DOM element
  return {
    vpLeft: ((viewStart - CIV_MIN_YEAR) / totalYearRange) * mmW,
    vpWidth: ((viewEnd - viewStart) / totalYearRange) * mmW,
  };
}

export function minimapClickToYear(mx, mmW) {
  return CIV_MIN_YEAR + (mx / mmW) * CIV_YEAR_RANGE;
}

export { xToYear };
