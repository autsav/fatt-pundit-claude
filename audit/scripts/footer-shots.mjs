// The footer alone, at 375 and 1280, for before/after: BASE=… OUT=dir node audit/scripts/footer-shots.mjs [path...]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const BASE = process.env.BASE ?? 'http://localhost:4399';
const OUT = process.env.OUT ?? join(import.meta.dirname, '..', 'screens', 'after');
mkdirSync(OUT, { recursive: true });
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/soho/'];
const b = await chromium.launch();
for (const [w, h] of [[375, 812], [1280, 800]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  const p = await ctx.newPage();
  for (const path of paths) {
    await p.goto(BASE + path, { waitUntil: 'load' });
    await p.evaluate(() => document.querySelectorAll('[data-dock]').forEach((d) => (d.style.display = 'none')));
    const f = p.locator('#footer');
    await f.scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    const height = await f.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    const name = `footer${path.replace(/\W+/g, '-').replace(/-$/, '') || '-home'}--${w}.jpg`;
    await f.screenshot({ path: join(OUT, name), type: 'jpeg', quality: 70 });
    console.log(name, height + 'px');
  }
  await ctx.close();
}
await b.close();
