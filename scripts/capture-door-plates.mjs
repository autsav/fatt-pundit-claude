// Captures the door-scene handoff plates (clip first frame) at pinned t = 0.22.
// Needs a dev server: `npx astro dev --port 4322`. Run: node scripts/capture-door-plates.mjs
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4322/';
const T = 0.22;
const OUT = 'assets/doors';
const SHOTS = { land: [1600, 900], port: [900, 1600] };

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const out = {};
for (const [name, [w, h]] of Object.entries(SHOTS)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5 });
  await ctx.addInitScript(() => localStorage.setItem('fp-arrived', '1'));
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-doors] .stage');
  // The stage is the viewport minus the header bar: grow the viewport by the bar (and drop the scrollbar)
  // so the stage is exactly w x h and the screenshot is the full plate size.
  await page.addStyleTag({ content: 'html{scrollbar-width:none}::-webkit-scrollbar{display:none}' });
  const barPx = await page.evaluate(() => Math.round(document.querySelector('header.bar').getBoundingClientRect().height));
  await page.setViewportSize({ width: w, height: h + barPx });
  await page.waitForTimeout(500); // resize handler re-measures
  // Same formula as Doors.astro read(): scrollY = secTop - bar + t * len.
  await page.evaluate((t) => {
    const sec = document.querySelector('[data-doors]');
    const stage = sec.querySelector('.stage');
    const bar = parseFloat(getComputedStyle(sec).getPropertyValue('--bar')) || 72;
    const secTop = sec.getBoundingClientRect().top + scrollY;
    const len = Math.max(1, sec.offsetHeight - stage.offsetHeight);
    scrollTo(0, secTop - bar + t * len);
  }, T);
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: 'header.bar,.rail,.below,.grain,.vig{display:none!important}' });
  await page.waitForTimeout(200);
  await page.locator('[data-doors] .stage').screenshot({ path: `${OUT}/plate-${name}.png` });
  out[name] = await page.evaluate(([pw, ph]) => {
    const s = document.querySelector('[data-doors] .stage').getBoundingClientRect();
    const c = document.querySelector('[data-camera]').getBoundingClientRect();
    return { w: pw, h: ph, front: [(c.left - s.left) / s.width, (c.top - s.top) / s.height, c.width / s.width, c.height / s.height] };
  }, [w * 1.5, h * 1.5]);
  await ctx.close();
}
await browser.close();
writeFileSync(`${OUT}/plates.json`, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out));
