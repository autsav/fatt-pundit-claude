// Interaction timing (M5 of docs/MOTION-ROADMAP.md): input to next paint for the five taps that matter,
// at 4x slower CPU, in headless Edge/Chrome. Usage: npm run build && npx astro preview --port 4321 &
// node scripts/tap-timing.mjs. Env: BASE, CHROME_PATH, BUDGET_MS (default 200), RUNS (default 3: the median counts).
//
// Each tap is a real (trusted) click, so the Event Timing API reports it: `duration` is the time from the
// input's hardware timestamp to the next paint, the same measure as INP in the field. The dialogs' own
// transitions are not counted (they are the paint after the paint). Fails when a tap's median is over budget.
import { chromium } from 'playwright-core';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : '/usr/bin/google-chrome');
const BUDGET = Number(process.env.BUDGET_MS ?? 200);
const RUNS = Number(process.env.RUNS ?? 3);

/** The taps: page, viewport, how to get the control on screen, the control, and what must follow. */
const TAPS = [
  { name: 'Book from the dock', page: '/soho/', view: 'phone', ready: async (p) => p.evaluate(() => window.scrollTo(0, 900)), target: '.dock-book', after: 'dialog.book[open]' },
  { name: 'A plate', page: '/covent-garden/', view: 'desk', ready: async (p) => { await p.locator('[data-plate]').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(2800); }, target: '[data-plate]', after: '[data-plate][aria-pressed="true"]' },
  { name: 'A page turn', page: '/', view: 'desk', ready: async (p) => { await p.locator('#menu').scrollIntoViewIfNeeded(); await p.waitForTimeout(1200); }, target: 'button[aria-label="Next page"]', after: null },
  // A day chip: there are always 21 of them, while a closed day has no time chips.
  // The drawer draws its chips when its own button opens it (not on showModal), so open it from the dock.
  { name: 'A menu chip', page: '/soho/', view: 'phone', ready: async (p) => { await p.evaluate(() => window.scrollTo(0, 900)); await p.locator('.dock-book').click(); await p.waitForTimeout(600); }, target: '.book-day:not([aria-checked="true"])', after: '.book-day[aria-checked="true"]' },
  { name: 'A passport stamp', page: '/soho/menu/', view: 'phone', ready: async (p) => { await p.locator('.pp-stamp').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300); }, target: '.pp-stamp', after: '.pp-stamp[aria-pressed="true"]' },
];
const VIEWS = { phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, desk: { viewport: { width: 1440, height: 900 } } };

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu', '--disable-webgl', '--disable-webgl2'] });
const results = [];
const fails = [];
for (const tap of TAPS) {
  const durations = [];
  for (let run = 0; run < RUNS; run++) {
    const ctx = await browser.newContext({ ...VIEWS[tap.view], deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      try { localStorage.setItem('fp-arrived', '1'); } catch {}
      // Collect every input's time to next paint from the first event on.
      window.__taps = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__taps.push({ name: e.name, start: e.startTime, duration: e.duration, processing: e.processingEnd - e.processingStart }); }).observe({ type: 'event', durationThreshold: 16, buffered: true });
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(BASE + tap.page, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(600);
    await tap.ready(page);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const target = page.locator(tap.target).first();
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.evaluate(() => { window.__taps = []; window.__t0 = performance.now(); });
    await target.click({ timeout: 5000 });
    await page.waitForTimeout(700);
    const sample = await page.evaluate(() => {
      // The slowest frame the tap caused: pointerdown, pointerup or click, whichever waited longest for paint.
      const mine = window.__taps.filter((t) => t.start >= window.__t0 - 50 && /pointer|click|mouse|touch/.test(t.name));
      return mine.length ? mine.reduce((a, b) => (b.duration > a.duration ? b : a)) : null;
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const ok = tap.after ? (await page.locator(tap.after).count()) > 0 : true;
    if (!ok) fails.push(`${tap.name}: nothing happened after the tap (${tap.after} not found)`);
    if (errors.length) fails.push(`${tap.name}: page errors ${errors.join(' | ')}`);
    // No entry means the tap painted inside 16 ms: better than the threshold.
    durations.push(sample ? Math.round(sample.duration) : 0);
    await ctx.close();
  }
  const sorted = [...durations].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  results.push({ tap: tap.name, page: tap.page, view: tap.view, runsMs: durations, medianMs: median });
  if (median > BUDGET) fails.push(`${tap.name}: ${median} ms input to paint > ${BUDGET} ms`);
}
await browser.close();
console.table(results);
if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log(`ok: every tap paints within ${BUDGET} ms at 4x CPU (median of ${RUNS})`);
