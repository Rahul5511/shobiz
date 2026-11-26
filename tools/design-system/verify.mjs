import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { transformPoint } from './svg-geometry.mjs';

const dir = 'src/app/shared/design-system';
const files = (folder) =>
  fs
    .readdirSync(folder, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? files(path.join(folder, entry.name)) : [path.join(folder, entry.name)],
    );
const cssFiles = files(dir).filter((file) => file.endsWith('.css'));
const defined = new Set();
const referenced = new Set();
for (const file of cssFiles) {
  postcss.parse(fs.readFileSync(file, 'utf8')).walkDecls((decl) => {
    if (decl.prop.startsWith('--')) defined.add(decl.prop);
    // Component sizing hooks may intentionally rely on a CSS fallback until
    // the consumer overrides them; only fallback-free references are required.
    for (const match of decl.value.matchAll(/var\((--ngage-[a-z0-9-]+)\s*([,)])/g)) {
      if (match[2] === ')') referenced.add(match[1]);
    }
  });
}
assert.deepEqual(
  [...referenced].filter((name) => !defined.has(name)),
  [],
  'Shared styles must not reference missing tokens',
);
const icons = files('public/ngage/library/icons');
for (const file of icons) {
  const svg = fs.readFileSync(file, 'utf8');
  assert.ok(!/undefined|NaN/.test(svg), `Invalid geometry in ${file}`);
  assert.ok(/<path\b/.test(svg), `Empty icon ${file}`);
  assert.ok(!/viewBox="0 0 (0|undefined)/.test(svg), `Invalid viewport in ${file}`);
}
// Check the generated assets used by dropdowns/pagination, not just the matrix
// helper: dropping a rotation used to leave the down chevron clipped below 24px.
for (const direction of ['down', 'left', 'right']) {
  const file = `public/ngage/library/icons/arrow-${direction}-01-stroke-rounded.svg`;
  const svg = fs.readFileSync(file, 'utf8');
  const layers = [
    ...svg.matchAll(/<g transform="matrix\(([^)]+)\)"><svg width="([^"]+)" height="([^"]+)"/g),
  ];
  assert.ok(layers.length, `Missing transformed arrow geometry: ${file}`);
  const points = layers.flatMap(([, values, width, height]) => {
    const matrix = values.split(/\s+/).map(Number);
    return [
      [0, 0],
      [+width, 0],
      [0, +height],
      [+width, +height],
    ].map(([x, y]) => transformPoint(matrix, x, y));
  });
  for (const [x, y] of points)
    assert.ok(x >= -0.01 && x <= 24.01 && y >= -0.01 && y <= 24.01, `Clipped arrow: ${file}`);
  const width = Math.max(...points.map(([x]) => x)) - Math.min(...points.map(([x]) => x));
  const height = Math.max(...points.map(([, y]) => y)) - Math.min(...points.map(([, y]) => y));
  assert.ok(
    direction === 'down' ? width > height : height > width,
    `Incorrect arrow orientation: ${file}`,
  );
}
console.log(
  `Verified ${defined.size} token definitions and ${icons.length} non-empty SVG geometries.`,
);
