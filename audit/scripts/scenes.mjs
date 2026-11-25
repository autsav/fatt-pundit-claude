// Phase 3 before/after frames: fixed points inside each home scene, at 375 and 1280.
// Usage: BASE=http://localhost:4399 STAGE=before|after node audit/scripts/scenes.mjs [scene...]
// Pinned scenes are shot by progress p through their scroll length (0 = pin starts, 1 = pin ends).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4399';
const STAGE = process.env.STAGE ?? 'before';
const OUT = join(import.meta.dirname, '..', 'screens', STAGE, 'scenes');
mkdirSync(OUT, { recursive: true });
const ONLY = process.argv.slice(2);

// [scene, selector, progress points]
const SCENES = [
  ['hero', '#top', [0, 0.6]],
  ['doors', '[data-doors]', [0.05, 0.3, 0.55, 0.8]],
  ['curtain', '[data-doors]', [0.92, 1]],
  ['voyage', '#story', [0.05, 0.35, 0.7, 1]],
  ['menu', '#menu', [0, 0.35]],
  ['bar', '#bar', [0, 0.5]],
  ['room', '#room', [0, 0.5]],
  ['passes', '#tables', [0, 0.4]],
  ['goodbye', '#footer', [0, 0.3]],
];

const browser = await chromium.launch();
for (const [w, h] of [[375, 812], [1280, 800]]) {
  const mobile = w < 800;
  // Intro: first visit, timed frames.
  if (!ONLY.length || ONLY.includes('arrival')) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'commit' });
    const t0 = Date.now();
    for (const t of [400, 750, 1000]) {
      while (Date.now() - t0 < t) await new Promise((r) => setTimeout(r, 10));
      await p.screenshot({ path: join(OUT, `arrival-${t}ms--${w}.jpg`), type: 'jpeg', quality: 70 });
    }
    await ctx.close();
  }
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
  await ctx.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.waitForTimeout(600);
  // Walk the page once so lazy scenes hydrate.
  for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, 800); await p.waitForTimeout(60); }
  for (const [name, sel, points] of SCENES) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    for (const pr of points) {
      const y = await p.evaluate(([s, pr]) => {
        const el = document.querySelector(s); if (!el) return null;
        const top = el.getBoundingClientRect().top + scrollY;
        const span = Math.max(0, el.offsetHeight - innerHeight);
        return Math.round(top + span * pr);
      }, [sel, pr]);
      if (y === null) continue;
      // Approach from just above, as a guest scrolling down would (scrubbed scenes read the direction).
      await p.evaluate((yy) => { const l = window.__lenis; if (l) l.scrollTo(yy - 200, { immediate: true, force: true }); else scrollTo(0, yy - 200); }, y);
      await p.waitForTimeout(150);
      await p.mouse.wheel(0, 200);
      await p.evaluate((yy) => { const l = window.__lenis; if (l) l.scrollTo(yy, { immediate: true, force: true }); else scrollTo(0, yy); }, y);
      await p.waitForTimeout(900);
      await p.screenshot({ path: join(OUT, `${name}-${String(Math.round(pr * 100)).padStart(3, '0')}--${w}.jpg`), type: 'jpeg', quality: 70 });
    }
  }
  await ctx.close();
}
await browser.close();
console.log('frames in', OUT);
