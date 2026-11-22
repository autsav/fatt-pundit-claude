#!/usr/bin/env node
/**
 * Phase 9 lab check: Lighthouse mobile (performance, SEO, best practices, accessibility) per page,
 * with the audits that drove the phase printed under each. The perf budget itself is
 * `scripts/perf-budget.mjs`; this one is for diagnosis, not a gate.
 *
 *   npm run build && npx astro preview --port 4321
 *   node docs/qa/phase9-optimisation/lighthouse.mjs
 *
 * Env: BASE (http://localhost:4321), PAGES (home,soho,covent-garden,soho/menu,book), OUT (folder for the
 * JSON reports), LIGHTHOUSE (path to lighthouse/cli/index.js: on Windows the .cmd shim will not start
 * from execFileSync; `npx --yes lighthouse@13 --version` installs one under the npx cache),
 * CHROME_PATH (Edge on Windows by default, as in perf-budget.mjs).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const PAGES = (process.env.PAGES ?? 'home,soho,covent-garden,soho/menu,book').split(',').map((p) => (p === 'home' ? '/' : `/${p}/`));
const OUT = process.env.OUT ?? join('docs', 'qa', 'phase9-optimisation', 'out');
const WIN = process.platform === 'win32';
const CHROME = process.env.CHROME_PATH ?? (WIN ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : '/usr/bin/google-chrome');
const LH = process.env.LIGHTHOUSE ? [process.execPath, [process.env.LIGHTHOUSE]] : ['lighthouse', []];
mkdirSync(OUT, { recursive: true });

const rows = [];
for (const page of PAGES) {
  const file = join(OUT, `${page.replace(/\W+/g, '_') || 'home'}.json`);
  execFileSync(LH[0], [...LH[1], BASE + page, '--quiet', '--output=json', `--output-path=${file}`,
    '--only-categories=performance,seo,best-practices,accessibility',
    '--chrome-flags=--headless=new --no-sandbox --use-gl=swiftshader --enable-unsafe-swiftshader'],
    { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'ignore' });
  const { categories, audits } = JSON.parse(readFileSync(file, 'utf8'));
  rows.push({
    page,
    perf: Math.round(categories.performance.score * 100),
    seo: Math.round(categories.seo.score * 100),
    bp: Math.round(categories['best-practices'].score * 100),
    a11y: Math.round(categories.accessibility.score * 100),
    labLcpMs: Math.round(audits['largest-contentful-paint'].numericValue),
    obsLcpMs: Math.round(audits.metrics.details.items[0].observedLargestContentfulPaint),
    fcpMs: Math.round(audits['first-contentful-paint'].numericValue),
    tbtMs: Math.round(audits['total-blocking-time'].numericValue),
    cls: +audits['cumulative-layout-shift'].numericValue.toFixed(3),
    weightKB: Math.round(audits['total-byte-weight'].numericValue / 1024),
  });
  const weak = Object.values(audits).filter((a) => a.score !== null && a.score < 0.9 && !['informative', 'notApplicable'].includes(a.scoreDisplayMode)).map((a) => `${a.id}=${a.score}${a.displayValue ? ` (${a.displayValue})` : ''}`);
  console.log(`\n${page}: ${weak.join(', ') || 'nothing under 0.9'}`);
  for (const id of ['unused-javascript', 'unused-css-rules', 'unsized-images', 'image-delivery-insight', 'render-blocking-insight', 'layout-shifts']) {
    const a = audits[id];
    if (!a?.details?.items?.length) continue;
    console.log(`  ${id}: ${a.displayValue ?? ''}`);
    for (const it of a.details.items.slice(0, 5)) console.log('    ', JSON.stringify(it).slice(0, 200));
  }
}
console.table(rows);
