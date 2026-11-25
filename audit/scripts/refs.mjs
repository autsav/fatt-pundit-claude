// Reference sites from the brief: first two screens at 1280 and 375 (local only, audit/refs is gitignored).
import { chromium } from '@playwright/test';
import { join } from 'node:path';
const SITES = ['endspeciesism.org', 'tonemaki.com', 'tigranz.com', 'landonorris.com', 'cta.gallery', 'navbar.gallery', 'designmd.app/library'];
const b = await chromium.launch();
for (const [w, h] of [[1280, 800], [375, 812]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
  for (const s of SITES) {
    const p = await ctx.newPage();
    try {
      await p.goto('https://' + s, { waitUntil: 'load', timeout: 40000 }); await p.waitForTimeout(3500);
      for (let i = 0; i < 2; i++) { await p.screenshot({ path: join(import.meta.dirname, '..', 'refs', `${s.replace(/\W/g, '-')}--${w}--${i}.jpg`), type: 'jpeg', quality: 60 }); await p.mouse.wheel(0, h); await p.waitForTimeout(1800); }
      console.log('ok', s, w);
    } catch (e) { console.log('FAIL', s, w, String(e).slice(0, 100)); }
    await p.close();
  }
  await ctx.close();
}
await b.close();
