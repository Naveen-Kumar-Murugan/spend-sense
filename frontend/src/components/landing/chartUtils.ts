/* Presentation-only chart helpers for the landing visualizations. */

export interface ChartPoint {
  x: number;
  y: number;
}

interface SmoothOptions {
  /** Horizontal padding applied on both sides. */
  pad?: number;
  min?: number;
  max?: number;
}

/**
 * Maps values onto the canvas and builds a Catmull-Rom → cubic-bézier smooth
 * path. Point count is preserved so callers can animate between datasets.
 */
export function smoothPath(
  values: number[],
  width: number,
  height: number,
  opts?: SmoothOptions,
): string {
  if (values.length === 0) return '';
  const pad = opts?.pad ?? 8;
  const min = opts?.min ?? Math.min(...values);
  const max = opts?.max ?? Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;

  const points: ChartPoint[] = values.map((value, index) => ({
    x: pad + index * stepX,
    y: pad + (1 - (value - min) / range) * (height - pad * 2),
  }));

  if (points.length === 1) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/** Smooth line closed down to the baseline — for gradient area fills. */
export function areaPath(
  values: number[],
  width: number,
  height: number,
  opts?: SmoothOptions,
): string {
  const pad = opts?.pad ?? 8;
  const line = smoothPath(values, width, height, opts);
  if (!line) return '';
  const stepX = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const lastX = pad + (values.length - 1) * stepX;
  return `${line} L ${lastX.toFixed(2)} ${height} L ${pad.toFixed(2)} ${height} Z`;
}

/** X coordinate of the i-th value — used to place crosshairs and tooltips. */
export function xAt(index: number, count: number, width: number, pad = 8): number {
  if (count <= 1) return width / 2;
  return pad + (index * (width - pad * 2)) / (count - 1);
}

/** Y coordinate of a value given the same min/max scaling as smoothPath. */
export function yAt(
  value: number,
  min: number,
  max: number,
  height: number,
  pad = 8,
): number {
  const range = max - min || 1;
  return pad + (1 - (value - min) / range) * (height - pad * 2);
}
