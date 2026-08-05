/**
 * WCAG relative luminance / contrast helpers for non-text contrast checks
 * (SC 1.4.11 — UI component boundaries need ≥ 3:1 against adjacent colors).
 */

function parseRgb(color) {
  if (!color || color === "transparent") {
    return null;
  }
  const match = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (!match) {
    return null;
  }
  const alpha = match[4] === undefined ? 1 : Number(match[4]);
  if (alpha < 0.01) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function srgbChannelToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]) {
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

function contrastRatio(colorA, colorB) {
  const L1 = relativeLuminance(colorA);
  const L2 = relativeLuminance(colorB);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function formatRgb([r, g, b]) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Walk ancestors until an opaque background color is found (falls back to white).
 */
function adjacentBackgroundColor(el, win = window) {
  let node = el;
  while (node && node.nodeType === 1) {
    const bg = parseRgb(win.getComputedStyle(node).backgroundColor);
    if (bg) {
      return bg;
    }
    node = node.parentElement;
  }
  return [255, 255, 255];
}

/**
 * Measure contrast between a checkbox's visible border and the color behind it.
 * Targets custom-styled (appearance: none) checkboxes such as Bootstrap's
 * .form-check-input, where the border defines the control's bounds.
 */
function measureCheckboxBoundContrast(checkbox, win = window) {
  const style = win.getComputedStyle(checkbox);
  const borderWidth = parseFloat(style.borderTopWidth) || 0;
  const borderColor =
    parseRgb(style.borderTopColor) || parseRgb(style.borderColor);
  const adjacent = adjacentBackgroundColor(
    checkbox.parentElement || checkbox,
    win
  );

  if (!borderColor || borderWidth <= 0) {
    return {
      ok: false,
      ratio: 0,
      border: borderColor ? formatRgb(borderColor) : "none",
      adjacent: formatRgb(adjacent),
      reason: "Checkbox has no visible border to define its bounds"
    };
  }

  const ratio = contrastRatio(borderColor, adjacent);
  return {
    ok: ratio >= 3,
    ratio,
    border: formatRgb(borderColor),
    adjacent: formatRgb(adjacent),
    reason: null
  };
}

module.exports = {
  contrastRatio,
  measureCheckboxBoundContrast,
  parseRgb,
  adjacentBackgroundColor
};
