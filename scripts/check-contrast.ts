#!/usr/bin/env node
/**
 * Contrast gate for the design tokens (runs in prebuild). Reads the real surface blocks in
 * src/styles/tokens.css and the palette in global.css, measures every pair the components use,
 * and exits 1 if any is below WCAG 2.2 AA (4.5:1 text, 3:1 edges and focus rings).
 *   node scripts/check-contrast.ts          summary + failures
 *   node scripts/check-contrast.ts --all    every pair
 */
import { readFileSync } from 'node:fs';
import { measure, readPalette, readSurfaces } from '../src/lib/contrast.ts';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const palette = readPalette(read('src/styles/global.css'));
const surfaces = readSurfaces(read('src/styles/tokens.css'), palette);
const results = measure(surfaces);
const fails = results.filter((r) => !r.ok);

if (process.argv.includes('--all') || fails.length) {
  for (const r of process.argv.includes('--all') ? results : fails) {
    console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.surface.padEnd(20)} ${`${r.fg} on ${r.bg}`.padEnd(28)} ${r.fgHex} / ${r.bgHex}  ${r.ratio.toFixed(2)} (min ${r.min})  ${r.use}`);
  }
}
const surfaceCount = Object.keys(surfaces).length;
const lowest = [...results].sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0];
console.log(`contrast: ${results.length - fails.length}/${results.length} pairs pass on ${surfaceCount} surfaces; tightest ${lowest.surface} ${lowest.fg} on ${lowest.bg} ${lowest.ratio}:1 (min ${lowest.min})`);
if (surfaceCount < 6) { console.error(`expected 6 surfaces in tokens.css, found ${surfaceCount}`); process.exit(1); }
if (fails.length) process.exit(1);
