import { currentTheme } from './theme.js';

// Layout constants
const TIME_AXIS_HEIGHT = 40;
const REGION_HEADER_HEIGHT = 28;
const BAR_HEIGHT = 26;
const BAR_GAP = 4;
const BAR_ROW_HEIGHT = BAR_HEIGHT + BAR_GAP;
const REGION_PADDING_BOTTOM = 12;

// --- Defaults factory (replaces hardcoded constants) ---
export function getSwimLaneDefaults(minYear, maxYear) {
  return {
    startYear: minYear,
    endYear: maxYear,
    minYear,
    maxYear,
    yearRange: maxYear - minYear,
  };
}

// --- Scale helpers ---
function yearToX(year, viewStart, viewEnd, w) {
  return ((year - viewStart) / (viewEnd - viewStart)) * w;
}

function xToYear(x, viewStart, viewEnd, w) {
  return viewStart + (x / w) * (viewEnd - viewStart);
}

// --- Layout (generic — accepts items + categories) ---
function layoutSwimLanes(viewStart, viewEnd, w, items, categories) {
  const regionGroups = [];

  for (const category of categories) {
    const catItems = items.filter(c => c.region === category.id);
    if (catItems.length === 0) continue;

    const rows = [];
    for (const item of catItems) {
      const xStart = yearToX(item.start, viewStart, viewEnd, w);
      const xEnd = yearToX(item.end, viewStart, viewEnd, w);

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
          rows[rowIndex].push({ item, xStart, xEnd });
          placed = true;
        } else {
          rowIndex++;
        }
      }
    }

    regionGroups.push({ category, rows });
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

// --- Drawing (generic) ---
export function drawSwimLaneView(ctx, w, h, viewStart, viewEnd, scrollY, hoveredItem, formatYearShort, scale, items, categories) {
  const theme = currentTheme();
  const s = scale || 1;
  ctx.clearRect(0, 0, w, h);

  // Scaled layout constants
  const timeAxisH = Math.round(TIME_AXIS_HEIGHT * s);
  const regionHeaderH = Math.round(REGION_HEADER_HEIGHT * s);
  const barH = Math.round(BAR_HEIGHT * s);
  const barGap = Math.round(BAR_GAP * s);
  const barRowH = barH + barGap;
  const regionPadBottom = Math.round(REGION_PADDING_BOTTOM * s);
  const regionIndent = Math.round(12 * s);
  const barLabelIndent = Math.round(6 * s);
  const barRadius = Math.round(4 * s);
  const headerFontSize = Math.round(11 * s);
  const barLabelFontSize = Math.round(11 * s);
  const periodLabelFontSize = Math.round(9 * s);

  // Time axis at top
  drawTimeAxis(ctx, w, viewStart, viewEnd, formatYearShort, s, timeAxisH);

  // Layout and draw items
  const layout = layoutSwimLanes(viewStart, viewEnd, w, items, categories);

  let y = timeAxisH - scrollY;
  const hitAreas = [];

  for (const group of layout) {
    const { category, rows } = group;

    // Category header
    if (y + regionHeaderH > 0 && y < h) {
      ctx.fillStyle = category.color + theme.regionHeaderBg;
      ctx.fillRect(0, y, w, regionHeaderH);

      ctx.fillStyle = category.color;
      ctx.font = `600 ${headerFontSize}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(category.name.toUpperCase(), regionIndent, y + regionHeaderH / 2);

      // Category colour indicator
      ctx.fillStyle = category.color;
      roundRect(ctx, Math.round(3 * s), y + Math.round(8 * s), Math.round(4 * s), regionHeaderH - Math.round(16 * s), 2);
      ctx.fill();
    }
    y += regionHeaderH;

    // Bars
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      for (const bar of rows[rowIdx]) {
        const barY = y + rowIdx * barRowH;

        // Skip if off-screen vertically
        if (barY + barH < timeAxisH || barY > h) continue;

        const isHovered = hoveredItem === bar.item;
        const barW = Math.max(4, bar.xEnd - bar.xStart);

        // Main bar
        ctx.fillStyle = isHovered ? category.color + theme.barHover : category.color + theme.barNormal;
        roundRect(ctx, bar.xStart, barY, barW, barH, barRadius);
        ctx.fill();

        // Border
        ctx.strokeStyle = isHovered ? category.color : category.color + theme.barBorderNormal;
        ctx.lineWidth = isHovered ? 2 : 1;
        roundRect(ctx, bar.xStart, barY, barW, barH, barRadius);
        ctx.stroke();

        // Whether this bar has visible periods
        const hasPeriods = bar.item.periods.length > 0;

        // Sub-periods (darker segments) — draw segments first, then labels
        let lastPeriodLabelRight = -Infinity;
        for (const period of bar.item.periods) {
          const px1 = yearToX(period.start, viewStart, viewEnd, w);
          const px2 = yearToX(period.end, viewStart, viewEnd, w);
          const clampedX1 = Math.max(bar.xStart + 1, px1);
          const clampedX2 = Math.min(bar.xStart + barW - 1, px2);
          if (clampedX2 > clampedX1) {
            ctx.fillStyle = category.color + theme.barPeriod;
            roundRect(ctx, clampedX1, barY + 2, clampedX2 - clampedX1, barH - 4, 2);
            ctx.fill();

            // Period label in lower portion — skip if overlaps previous label
            if (clampedX2 - clampedX1 > 50 * s) {
              ctx.fillStyle = theme.periodLabelColor;
              ctx.font = `400 ${periodLabelFontSize}px Inter, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const periodLabel = period.name;
              const labelWidth = ctx.measureText(periodLabel).width;
              const labelCenterX = (clampedX1 + clampedX2) / 2;
              const labelLeft = labelCenterX - labelWidth / 2;
              if (labelLeft > lastPeriodLabelRight + 4 * s) {
                ctx.fillText(periodLabel, labelCenterX, barY + barH * 0.72, clampedX2 - clampedX1 - 8);
                lastPeriodLabelRight = labelCenterX + labelWidth / 2;
              }
            }
          }
        }

        // Bar name label — top portion if periods exist, centred if not
        if (barW > 50 * s) {
          ctx.fillStyle = theme.text;
          ctx.font = `500 ${barLabelFontSize}px Inter, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          const label = bar.item.icon + ' ' + bar.item.name;
          const labelX = Math.max(bar.xStart + barLabelIndent, barLabelIndent);
          const labelY = hasPeriods ? barY + barH * 0.35 : barY + barH / 2;
          ctx.fillText(label, labelX, labelY, barW - barLabelIndent * 2);
        }

        // Store hit area
        hitAreas.push({
          item: bar.item,
          x: bar.xStart,
          y: barY,
          w: barW,
          h: barH,
        });
      }
    }

    y += rows.length * barRowH + regionPadBottom;
  }

  // Clip time axis area (draw over any bars that scrolled up)
  ctx.fillStyle = theme.clipBg;
  ctx.fillRect(0, 0, w, timeAxisH);
  drawTimeAxis(ctx, w, viewStart, viewEnd, formatYearShort, s, timeAxisH);

  return { hitAreas, totalHeight: y + scrollY };
}

function drawTimeAxis(ctx, w, viewStart, viewEnd, formatYearShort, scale, timeAxisH) {
  const theme = currentTheme();
  const s = scale || 1;
  const axisH = timeAxisH || Math.round(TIME_AXIS_HEIGHT * s);
  const axisY = axisH - 1;
  const tickFontSize = Math.round(10 * s);
  const tickHalf = Math.round(5 * s);
  const tickLabelOffset = Math.round(6 * s);

  // Background
  ctx.fillStyle = theme.clipBgAlpha;
  ctx.fillRect(0, 0, w, axisH);

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
    ctx.moveTo(x, axisY - tickHalf);
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
    ctx.font = `400 ${tickFontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(formatYearShort(year), x, axisY - tickLabelOffset);
  }
}

// --- Hit testing (generic) ---
export function getItemAtPos(hitAreas, mx, my) {
  for (const area of hitAreas) {
    if (mx >= area.x && mx <= area.x + area.w && my >= area.y && my <= area.y + area.h) {
      return area.item;
    }
  }
  return null;
}

// --- Minimap (generic) ---
export function drawSwimLaneMinimap(mmCtx, mmW, mmH, viewStart, viewEnd, scale, items, categories, minYear, maxYear) {
  const theme = currentTheme();
  mmCtx.clearRect(0, 0, mmW, mmH);

  const totalYearRange = maxYear - minYear;

  // Draw category-coloured segments for each item
  let regionY = 0;
  const activeCategories = categories.filter(cat => items.some(it => it.region === cat.id));
  const regionHeight = mmH / activeCategories.length;

  for (const category of categories) {
    const catItems = items.filter(it => it.region === category.id);
    if (catItems.length === 0) continue;

    // Category background
    mmCtx.fillStyle = category.color + theme.regionHeaderBg;
    mmCtx.fillRect(0, regionY, mmW, regionHeight);

    // Item bars
    for (const item of catItems) {
      const x1 = ((item.start - minYear) / totalYearRange) * mmW;
      const x2 = ((item.end - minYear) / totalYearRange) * mmW;
      mmCtx.fillStyle = category.color + theme.minimapBar;
      mmCtx.fillRect(x1, regionY + 1, Math.max(1, x2 - x1), regionHeight - 2);
    }

    regionY += regionHeight;
  }

  // Viewport indicator handled by main.js via the DOM element
  return {
    vpLeft: ((viewStart - minYear) / totalYearRange) * mmW,
    vpWidth: ((viewEnd - viewStart) / totalYearRange) * mmW,
  };
}

export function minimapClickToYear(mx, mmW, minYear, maxYear) {
  return minYear + (mx / mmW) * (maxYear - minYear);
}

export { xToYear };
