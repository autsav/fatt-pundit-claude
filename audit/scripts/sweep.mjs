// Phase 1 sweep: full-page screens, console/network log and axe per route.
// Adapted from docs/qa/phase7-responsive/audit.mjs (same scroll-through idea, Playwright from the repo).
// Usage: BASE=http://localhost:4399 MOTION=motion|calm LABEL=local SHOTS=1 node audit/scripts/sweep.mjs [routes...]
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const BASE = process.env.BASE ?? 'http://localhost:4399';
const LABEL = process.env.LABEL ?? 'local';
const MOTION = process.env.MOTION ?? 'motion'; // motion = no-preference, calm = reduce
const SHOTS = process.env.SHOTS !== '0';
const WIDTHS = (process.env.WIDTHS ?? '375,768,1280,1920').split(',').map(Number);
const AXE_WIDTHS = [375, 1280];
const HEIGHT = { 375: 812, 768: 1024, 1280: 800, 1920: 1080 };
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// Routes = every built page except share images and the styleguide, plus one unknown path for the 404.
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : f === 'index.html' ? [p] : []; });
const built = walk(join(ROOT, '..', 'dist')).map((p) => p.slice(join(ROOT, '..', 'dist').length).replace(/index\.html$/, '')).filter((r) => !/^\/(og|styleguide)\//.test(r)).sort();
const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : [...built, '/this-page-does-not-exist/'];
const slug = (r) => (r === '/' ? 'home' : r === '/this-page-does-not-exist/' ? '404' : r.replace(/^\/|\/$/g, '').replace(/\//g, '-'));

const shotDir = join(ROOT, 'screens', 'before');
const frameDir = join(ROOT, 'frames');
mkdirSync(shotDir, { recursive: true }); mkdirSync(frameDir, { recursive: true }); mkdirSync(join(ROOT, 'data'), { recursive: true });

const browser = await chromium.launch();
const out = { base: BASE, motion: MOTION, at: new Date().toISOString(), pages: [] };
const settle = (page, ms) => page.waitForTimeout(ms);

async function scrollThrough(page, vh) {
  // Base.astro re-asserts scrollTo(0,0) for ~300 ms after load (tasks/lessons.md): wait it out first.
  await settle(page, 450);
  const max = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < max + vh; y += Math.round(vh * 0.8)) { await page.mouse.wheel(0, Math.round(vh * 0.8)); await settle(page, 140); }
  await settle(page, 600);
}

for (const w of WIDTHS) {
  const mobile = w < 1024;
  const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHT[w] ?? 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: MOTION === 'calm' ? 'reduce' : 'no-preference', colorScheme: 'light' });
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const log = { console: [], pageerror: [], failed: [], http: [] };
    page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !m.text().includes('GL Driver Message') && log.console.push(`${m.type()}: ${m.text().slice(0, 300)}`));
    page.on('pageerror', (e) => log.pageerror.push(String(e).slice(0, 300)));
    page.on('requestfailed', (r) => log.failed.push(`${r.failure()?.errorText} ${r.url()}`));
    page.on('response', (r) => r.status() >= 400 && log.http.push(`${r.status()} ${r.url()}`));
    const rec = { route, width: w, ...log };
    try {
      const res = await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 });
      rec.status = res?.status();
      const skip = page.locator('[data-skip]');
      if (await skip.isVisible().catch(() => false)) { await skip.click().catch(() => {}); await settle(page, 700); }
      await scrollThrough(page, HEIGHT[w] ?? 900);
      await page.evaluate(() => window.scrollTo(0, 0)); await settle(page, 500);
      rec.height = await page.evaluate(() => document.documentElement.scrollHeight);
      rec.dom = await page.evaluate(() => document.getElementsByTagName('*').length);
      if (SHOTS) {
        await page.screenshot({ path: join(shotDir, `${slug(route)}--${w}--${MOTION}.jpg`), fullPage: true, type: 'jpeg', quality: 70, timeout: 120000 }).catch((e) => (rec.shotError = String(e).slice(0, 200)));
        // Viewport frames for the design review (local only): every screen down the page, capped.
        if (MOTION === 'motion' && (w === 375 || w === 1280) && LABEL === 'local') {
          const vh = HEIGHT[w];
          for (let i = 0, y = 0; y < rec.height && i < 36; i++, y += vh) {
            await page.evaluate((yy) => window.scrollTo(0, yy), y); await settle(page, 350);
            await page.screenshot({ path: join(frameDir, `${slug(route)}--${w}--${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 60 });
          }
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      }
      if (AXE_WIDTHS.includes(w)) {
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        rec.axe = r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) }));
        // The three dialogs, opened the way a guest would.
        rec.axeDialogs = {};
        for (const [name, sel] of [['book', '[data-book]:visible'], ['site-menu', '[data-index-open]:visible'], ['menus', '[data-menus-open]:visible']]) {
          const t = page.locator(sel).first();
          if (!(await t.count())) continue;
          try {
            await t.evaluate((el) => el.scrollIntoView({ block: 'center' })); await settle(page, 300);
            await t.click({ timeout: 4000 }); await settle(page, 600);
            if (!(await page.locator('dialog[open]').count())) { rec.axeDialogs[name] = 'did not open'; continue; }
            const d = await new AxeBuilder({ page }).include('dialog[open]').withTags(TAGS).analyze();
            rec.axeDialogs[name] = d.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
            await page.keyboard.press('Escape'); await settle(page, 500);
          } catch (e) { rec.axeDialogs[name] = 'error: ' + String(e).slice(0, 120); }
        }
      }
    } catch (e) { rec.error = String(e).slice(0, 300); }
    out.pages.push(rec);
    console.log(`${w} ${route} ${rec.status ?? '-'} h=${rec.height ?? '-'} axe=${rec.axe ? rec.axe.length : '-'} err=${log.pageerror.length + log.console.filter((c) => c.startsWith('error')).length}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
writeFileSync(join(ROOT, 'data', `sweep-${LABEL}-${MOTION}.json`), JSON.stringify(out, null, 1));
