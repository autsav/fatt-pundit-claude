#!/usr/bin/env node
/**
 * Booking smoke test. Fails (exit 1) when the Book drawer stops working.
 *
 *   npm run build && npx astro preview --port 4321 &
 *   node scripts/smoke-booking.mjs
 *
 * Needs playwright (PLAYWRIGHT=path/to/index.mjs if it isn't resolvable) and
 * Chrome or Edge (CHROME_PATH; same defaults as perf-budget.mjs).
 *
 * For each page it opens the drawer from the header (the dock on phones), presses + and −, and
 * checks the page did not navigate away (the bug this guards against sent the
 * home page to /undefined). Then it picks a time, presses the booking button
 * and checks the link that would open. The booking site itself is never loaded.
 */
import { isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : '/usr/bin/google-chrome');
const PW = process.env.PLAYWRIGHT ?? 'playwright';
const { chromium } = await import(isAbsolute(PW) ? pathToFileURL(PW).href : PW);

// page, branch to pick in the drawer (null = leave the default), expected booking link
const CASES = [
  ['/', 'soho', /^https:\/\/www\.opentable\.co\.uk\/restref\/client\/\?.*covers=2/],
  ['/', 'covent-garden', /^https:\/\/www\.sevenrooms\.com\/explore\/[^/]+\/reservations\/create\/search\/\?.*party_size=2/],
  ['/soho/', null, /^https:\/\/www\.opentable\.co\.uk\/restref\/client\/\?.*covers=2/],
  ['/covent-garden/', null, /^https:\/\/www\.sevenrooms\.com\/explore\/[^/]+\/reservations\/create\/search\/\?.*party_size=2/],
];
const VIEWS = [['phone', { width: 390, height: 844, isMobile: true, hasTouch: true }], ['desktop', { width: 1440, height: 900 }]];

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const fails = [];
let runs = 0;
for (const [view, viewport] of VIEWS) {
  for (const [path, branch, want] of CASES) {
    runs++;
    const name = `${view} ${path}${branch ? ` (${branch})` : ''}`;
    const ctx = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: !!viewport.isMobile, hasTouch: !!viewport.hasTouch });
    await ctx.addInitScript(() => {
      try { localStorage.setItem('fp-arrived', '1'); } catch {}
      window.__opened = [];
      window.open = (u) => { window.__opened.push(String(u)); return { closed: false, focus() {} }; };
    });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(e.message));
    try {
      await pg.goto(BASE + path, { waitUntil: 'load' });
      await pg.waitForTimeout(800);
      // Phones book from the dock; wider screens from the header.
      await pg.locator(view === 'phone' ? '[data-dock] [data-book]' : 'header [data-book]').first().click();
      const dlg = pg.locator('[data-book-drawer]');
      await dlg.waitFor({ state: 'visible', timeout: 3000 });
      if (branch) await dlg.locator(`label:has(input[name="where"][value="${branch}"])`).click();
      const size = async () => Number(await dlg.locator('[data-book-size]').textContent());
      const before = await size();
      await dlg.locator('[data-step="1"]').click();
      await pg.waitForTimeout(600); // longer than the 240 ms delayed navigation the old bug used
      if (new URL(pg.url()).pathname !== path) throw new Error(`+ navigated to ${new URL(pg.url()).pathname}`);
      if ((await size()) !== before + 1) throw new Error(`+ did not add a guest (${before} -> ${await size()})`);
      await dlg.locator('[data-step="-1"]').click();
      await pg.waitForTimeout(600);
      if (new URL(pg.url()).pathname !== path) throw new Error(`− navigated to ${new URL(pg.url()).pathname}`);
      if ((await size()) !== before) throw new Error(`− did not remove a guest`);
      await dlg.locator('[data-book-times] button').first().click();
      await dlg.locator('[data-book-go]').click();
      await pg.waitForTimeout(300);
      const opened = await pg.evaluate(() => window.__opened);
      if (opened.length !== 1 || !want.test(opened[0])) throw new Error(`booking link wrong: ${JSON.stringify(opened)}`);
      if (new URL(pg.url()).pathname !== path) throw new Error(`booking navigated this tab to ${pg.url()}`);
      if (errors.length) throw new Error(`page error: ${errors[0]}`);
      console.log(`ok    ${name}`);
    } catch (e) {
      fails.push(`${name}: ${e.message.split('\n')[0]}`);
      console.log(`FAIL  ${name}`);
    }
    await ctx.close();
  }
}
await browser.close();
if (fails.length) {
  console.error(`\nBooking smoke test failed (${fails.length} of ${runs}):\n  ` + fails.join('\n  '));
  process.exit(1);
}
console.log(`\nBooking smoke test passed (${runs} runs).`);
