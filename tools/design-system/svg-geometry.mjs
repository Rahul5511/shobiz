export const identity = [1, 0, 0, 1, 0, 0];

/** Compose SVG affine transforms in parent-to-child order. */
export function multiply(parent, child) {
  const [a, b, c, d, e, f] = parent;
  const [g, h, i, j, k, l] = child;
  return [
    a * g + c * h,
    b * g + d * h,
    a * i + c * j,
    b * i + d * j,
    a * k + c * l + e,
    b * k + d * l + f,
  ];
}

/** CSS transforms apply around the local origin, after layout positioning. */
export function layerMatrix(rule) {
  const left = parseFloat(rule.left) || 0;
  const top = parseFloat(rule.top) || 0;
  if (!rule.transform || rule.transform === 'none') return [1, 0, 0, 1, left, top];
  const match = rule.transform.match(/^matrix\(([^)]+)\)$/);
  if (!match) throw new Error(`Unsupported exported transform: ${rule.transform}`);
  const matrix = match[1].split(/[,\s]+/).map(Number);
  if (matrix.length !== 6 || !matrix.every(Number.isFinite))
    throw new Error('Invalid transform matrix');
  const origin = (rule['transform-origin'] ?? '50% 50%').split(/\s+/);
  const coordinate = (value, size) =>
    value.endsWith('%') ? (parseFloat(value) * size) / 100 : parseFloat(value);
  const ox = coordinate(origin[0], parseFloat(rule.width) || 0);
  const oy = coordinate(origin[1] ?? origin[0], parseFloat(rule.height) || 0);
  return multiply([1, 0, 0, 1, left + ox, top + oy], multiply(matrix, [1, 0, 0, 1, -ox, -oy]));
}

export function transformPoint(matrix, x, y) {
  const [a, b, c, d, e, f] = matrix;
  return [a * x + c * y + e, b * x + d * y + f];
}
