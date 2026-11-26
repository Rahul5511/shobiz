import { test } from 'node:test';
import assert from 'node:assert/strict';
import { identity, layerMatrix, multiply, transformPoint } from './svg-geometry.mjs';

test('exported down chevron retains its rotation and stays inside the viewport', () => {
  const parent = layerMatrix({ left: '5.25px', top: '8.25px' });
  const child = layerMatrix({
    left: '0px',
    top: '7.5px',
    width: '7.5px',
    height: '13.4999px',
    transform: 'matrix(0, -1, 1, 0, 0, 0)',
    'transform-origin': '0 0',
  });
  const combined = multiply(parent, child);
  const tip = transformPoint(combined, 0, 6.75);
  const left = transformPoint(combined, 7.5, 0);
  const right = transformPoint(combined, 7.5, 13.4999);
  assert.ok(tip[1] > left[1] && tip[1] > right[1], 'Chevron must point down');
  for (const [x, y] of [tip, left, right]) assert.ok(x >= 0 && x <= 24 && y >= 0 && y <= 24);
});

test('nested transforms compose correctly and respect nonzero transform origins', () => {
  const matrix = layerMatrix({
    left: '10px',
    top: '20px',
    width: '10px',
    height: '10px',
    transform: 'matrix(-1, 0, 0, -1, 0, 0)',
    'transform-origin': '50% 50%',
  });
  assert.deepEqual(transformPoint(matrix, 0, 0), [20, 30]);
  assert.deepEqual(transformPoint(matrix, 10, 10), [10, 20]);
  assert.deepEqual(multiply(identity, matrix), matrix);
  assert.throws(() => layerMatrix({ transform: 'matrix(0, broken)' }), /Invalid/);
});
