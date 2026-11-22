// Interaction-state screenshots for the visual review. Usage: node states.mjs (env BASE, OUT, CHROME_PATH)
// Each shot is the viewport after a real interaction, full motion allowed (returning-guest state).
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const BASE = process.env.BASE ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? join(import.meta.dirname, 'screens');
const CHROME = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : '/usr/bin/google-chrome');
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });

const STATES = [
  ['home-arrival-first-visit', '/', async (p) => { await p.waitForTimeout(600); }, { fresh: true }],
  ['home-hero', '/', async (p) => { await p.waitForTimeout(2500); }],
  ['home-drawer', '/', async (p) => { await p.waitForTimeout(2000); await p.click('.hero-book'); await p.waitForTimeout(500); }],
  ['home-menubook-open', '/', async (p) => { await p.waitForTimeout(1500); await p.locator('#menu [role=tab]').first().scrollIntoViewIfNeeded(); await p.locator('#menu [role=tab]').nth(1).click(); await p.waitForTimeout(1400); await p.evaluate(() => document.querySelector('#menu [role=tablist]').scrollIntoView({ block: 'start' })); await p.waitForTimeout(400); }],
  ['home-gateboard', '/', async (p) => { await p.waitForTimeout(1200); await p.evaluate(() => document.querySelector('[data-hours]')?.closest('section')?.scrollIntoView({ block: 'start' })); await p.waitForTimeout(1500); }],
  ['home-voyage-end', '/', async (p) => { await p.waitForTimeout(1200); await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } }); await p.evaluate(() => { const el = document.querySelector('[aria-label*="voyage" i], [class*=voyage]'); el?.scrollIntoView({ block: 'end' }); }); await p.waitForTimeout(1200); }],
  ['home-goodbye', '/', async (p) => { await p.waitForTimeout(800); await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } }); await p.evaluate(() => document.querySelector('footer').scrollIntoView({ block: 'end' })); await p.waitForTimeout(2500); }],
  ['index-sheet', '/our-story/', async (p) => { const o = p.locator('[data-index-open]:visible').first(); if (await o.count()) await o.click(); else await p.evaluate(() => document.querySelector('[data-index]').showModal()); await p.waitForTimeout(500); }],
  ['menus-dropdown-desktop', '/our-story/', async (p) => { const s = p.locator('header [data-menus-pop] summary'); const d = p.locator('[data-dock] [data-menus-open]:visible'); if (await s.isVisible()) { await s.click(); } else if (await d.count()) { await d.click(); } else { await p.evaluate(() => document.querySelector('[data-menus]').showModal()); } await p.waitForTimeout(400); }],
  ['soho-hero', '/soho/', async (p) => { await p.waitForTimeout(1500); }],
  ['soho-mid', '/soho/', async (p) => { await p.waitForTimeout(600); await p.evaluate(() => scrollTo(0, innerHeight * 1.6)); await p.waitForTimeout(1200); }],
  ['soho-visit', '/soho/', async (p) => { await p.waitForTimeout(600); await p.evaluate(() => document.querySelector('[data-hours-tz]')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(800); }],
  ['cg-lights-on', '/covent-garden/', async (p) => { await p.evaluate(() => { const r = document.querySelector('[data-lights]').getBoundingClientRect(); scrollBy(0, r.top + r.height / 2 - innerHeight * 0.4); }); await p.waitForFunction(() => document.querySelector('[data-lights]').dataset.glow === 'on', null, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(2500); }],
  ['cg-plates', '/covent-garden/', async (p) => { await p.evaluate(() => document.querySelector('[class*=plate]')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(1500); }],
  ['cg-lightbox', '/covent-garden/', async (p) => { await p.locator('.room-shot').first().scrollIntoViewIfNeeded(); await p.locator('.room-shot').first().click(); await p.waitForTimeout(600); }],
  ['dubai-hero', '/dubai/', async (p) => { await p.waitForTimeout(1500); }],
  ['dubai-waitlist', '/dubai/', async (p) => { await p.evaluate(() => document.getElementById('waitlist')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(600); }],
  ['menu-top', '/soho/menu/', async (p) => { await p.waitForTimeout(500); }],
  ['menu-picker-open', '/soho/menu/', async (p) => { const b = p.locator('[data-menu-pick]'); if (await b.isVisible()) { await b.click(); await p.waitForTimeout(300); } }],
  ['menu-search-momo', '/soho/menu/', async (p) => { await p.fill('[data-menu-q]', 'momo'); await p.waitForTimeout(500); }],
  ['menu-empty', '/soho/menu/', async (p) => { await p.fill('[data-menu-q]', 'zzzz'); await p.waitForTimeout(500); }],
  ['menu-passport', '/soho/menu/', async (p) => { await p.locator('.pp-stamp').first().scrollIntoViewIfNeeded(); await p.locator('.pp-stamp').first().click(); await p.locator('.pp-stamp').nth(1).click(); await p.waitForTimeout(300); await p.click('[data-pp-open]'); await p.waitForTimeout(400); }],
  ['book-desk', '/book/', async (p) => { await p.waitForTimeout(600); }],
  ['book-desk-12-guests', '/book/', async (p) => { await p.fill('[data-desk-size]', '12'); await p.waitForTimeout(300); }],
  ['book-drawer-soho', '/book/?branch=soho', async (p) => { await p.waitForTimeout(900); }],
  ['book-drawer-9-guests', '/book/?branch=soho', async (p) => { await p.waitForTimeout(900); await p.fill('[data-book-size]', '9'); await p.dispatchEvent('[data-book-size]', 'input'); await p.waitForTimeout(300); }],
  ['groups-top', '/private-dining/', async (p) => { await p.waitForTimeout(400); }],
  ['groups-form-errors', '/private-dining/', async (p) => { await p.click('[data-enquiry-send]'); await p.waitForTimeout(400); }],
  ['groups-form-sent', '/private-dining/', async (p) => { await p.fill('#eq-date', new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10)); await p.fill('#eq-guests', '14'); await p.fill('#eq-name', 'Test Guest'); await p.fill('#eq-email', 'guest@example.com'); await p.click('[data-enquiry-send]'); await p.waitForTimeout(600); }],
  ['story-top', '/our-story/', async (p) => { await p.waitForTimeout(800); }],
  ['story-mid', '/our-story/', async (p) => { await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.45)); await p.waitForTimeout(1500); }],
  ['allergens', '/allergens/', async (p) => { await p.waitForTimeout(400); }],
  ['accessibility', '/accessibility/', async (p) => { await p.waitForTimeout(400); }],
  ['privacy', '/privacy/', async (p) => { await p.waitForTimeout(400); }],
  ['booking-terms', '/booking-terms/', async (p) => { await p.waitForTimeout(400); }],
  ['404', '/no-such-page/', async (p) => { await p.waitForTimeout(400); }],
  ['footer', '/allergens/', async (p) => { await p.evaluate(() => document.querySelector('footer').scrollIntoView({ block: 'end' })); await p.waitForTimeout(600); }],
  ['zoom200-menu', '/soho/menu/', async (p) => { await p.addStyleTag({ content: 'html{font-size:200% !important}' }); await p.waitForTimeout(600); }],
  ['zoom200-book', '/book/', async (p) => { await p.addStyleTag({ content: 'html{font-size:200% !important}' }); await p.waitForTimeout(600); }],
];
const VIEWS = [['390', 390, 844, true], ['768', 768, 1024, true], ['1440', 1440, 900, false]].filter(([vn]) => !process.env.VIEWS || process.env.VIEWS.split(',').includes(vn));
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
for (const [vn, w, h, mob] of VIEWS) {
  for (const [name, path, act, opts = {}] of STATES) {
    if (ONLY && !ONLY.some((o) => name.startsWith(o))) continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob, deviceScaleFactor: 1 });
    if (!opts.fresh) await ctx.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
      // Base.astro re-asserts scrollTo(0,0) up to 300 ms after load on a fresh visit: settle first.
      await page.waitForTimeout(450);
      await act(page);
      await page.screenshot({ path: join(OUT, `state-${name}--${vn}.png`) });
    } catch (e) { console.log(`${vn} ${name}: ${String(e.message).split('\n')[0].slice(0, 120)}`); }
    await page.close();
    await ctx.close();
  }
  process.stderr.write(`done ${vn}\n`);
}
await browser.close();
console.log('states done');
