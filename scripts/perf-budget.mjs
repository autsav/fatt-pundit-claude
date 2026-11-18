#!/usr/bin/env node
/**
 * Performance budget check. Fails (exit 1) when a page breaks a budget.
 *
 *   npm run build && npx astro preview --port 4321 &
 *   node scripts/perf-budget.mjs            # all pages
 *   PAGES=/,/soho/ node scripts/perf-budget.mjs
 *
 * Needs: lighthouse (CLI on PATH) and playwright (PLAYWRIGHT=path/to/index.mjs
 * if it isn't resolvable), plus Chrome (CHROME_PATH, default /usr/bin/google-chrome).
 *
 * Two checks per page:
 *  1. Lighthouse, mobile preset (slow 4G, 4x CPU): score, LCP, TBT, CLS, weight.
 *  2. Scroll test: phone viewport, 4x slower CPU, scrolled top to bottom over
 *     600 frames; counts frames over 34 ms. WebGL is switched off here because
 *     headless Chrome draws it in software (many times slower than a phone GPU),
 *     which would drown everything else. The rain and ink canvases also halve
 *     their frame rate on their own when a device is slow.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const PAGES = (process.env.PAGES ?? '/,/soho/,/covent-garden/,/dubai/').split(',');
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';

// Lab budgets (see tasks/todo.md "£10k upgrade"). Lighthouse's simulated LCP
// counts the page's scripts too; the observed LCP on these pages is ~0.25 s. Real-user targets are tighter
// on INP; that is measured in the field by the web-vitals beacon.
const BUDGET = { perf: 90, lcpMs: 2800, tbtMs: 200, cls: 0.05, weightKB: 1100, jankPct: 2 };

const out = mkdtempSync(join(tmpdir(), 'fp-budget-'));
const fails = [];
const rows = [];

for (const page of PAGES) {
  const file = join(out, `${page.replace(/\W+/g, '_') || 'home'}.json`);
  execFileSync('lighthouse', [
    BASE + page, '--quiet', '--output=json', `--output-path=${file}`, '--only-categories=performance',
    '--chrome-flags=--headless=new --no-sandbox --use-gl=swiftshader --enable-unsafe-swiftshader',
  ], { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'ignore' });
  const { categories, audits } = JSON.parse(readFileSync(file, 'utf8'));
  const r = {
    page,
    perf: Math.round(categories.performance.score * 100),
    lcpMs: Math.round(audits['largest-contentful-paint'].numericValue),
    tbtMs: Math.round(audits['total-blocking-time'].numericValue),
    cls: +audits['cumulative-layout-shift'].numericValue.toFixed(3),
    weightKB: Math.round(audits['total-byte-weight'].numericValue / 1024),
  };
  rows.push(r);
  if (r.perf < BUDGET.perf) fails.push(`${page}: performance ${r.perf} < ${BUDGET.perf}`);
  if (r.lcpMs > BUDGET.lcpMs) fails.push(`${page}: LCP ${r.lcpMs} ms > ${BUDGET.lcpMs}`);
  if (r.tbtMs > BUDGET.tbtMs) fails.push(`${page}: TBT ${r.tbtMs} ms > ${BUDGET.tbtMs}`);
  if (r.cls > BUDGET.cls) fails.push(`${page}: CLS ${r.cls} > ${BUDGET.cls}`);
  if (r.weightKB > BUDGET.weightKB) fails.push(`${page}: weight ${r.weightKB} KB > ${BUDGET.weightKB}`);
}

const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const browser = await chromium.launch({ executablePath: CHROME, args: ['--disable-webgl', '--disable-webgl2', '--no-sandbox'] });
for (const r of rows) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await pg.goto(BASE + r.page, { waitUntil: 'load' });
  await pg.waitForTimeout(1500);
  r.jankPct = await pg.evaluate(async () => {
    const H = document.documentElement.scrollHeight - innerHeight;
    const gaps = [];
    let last = performance.now();
    let y = 0;
    await new Promise((done) => {
      const f = (t) => { gaps.push(t - last); last = t; y += H / 600; scrollTo(0, y); if (y < H) requestAnimationFrame(f); else done(); };
      requestAnimationFrame(f);
    });
    gaps.shift();
    return Math.round((gaps.filter((g) => g > 34).length / gaps.length) * 1000) / 10;
  });
  if (r.jankPct > BUDGET.jankPct) fails.push(`${r.page}: dropped frames ${r.jankPct}% > ${BUDGET.jankPct}%`);
  await ctx.close();
}
await browser.close();

console.table(rows);
if (fails.length) {
  console.error('\nBudget broken:\n  ' + fails.join('\n  '));
  process.exit(1);
}
console.log('\nAll budgets met.');
