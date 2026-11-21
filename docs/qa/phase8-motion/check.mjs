// Motion review. Usage: npm run build && npx astro preview --port 4321 & node docs/qa/phase8-motion/check.mjs
// Env: BASE, CHROME_PATH, PAGES (comma list), MOTION (no-preference|reduce). Needs playwright-core in a parent node_modules.
//
// Per page and viewport, with full motion at 4x slower CPU: scrolls top to bottom over ~600 frames and counts
// frames over 34 ms; then lists the loops still running (they must all be the known ones), checks every
// .fp-reveal has arrived, that a stub tear does not delay the booking hand-off, that Pause motion stops the
// loops, and that focus can land on a pass while the passes are still dropping in.
// With prefers-reduced-motion: reduce: scrolls through and checks nothing is left animating or hidden.
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : '/usr/bin/google-chrome');
const PAGES = (process.env.PAGES ?? '/,/soho/,/covent-garden/,/our-story/').split(',');
const MOTIONS = process.env.MOTION ? [process.env.MOTION] : ['no-preference', 'reduce'];
const VIEWS = [
  ['390', { width: 390, height: 844, mobile: true }],
  ['1440', { width: 1440, height: 900 }],
];
// Loops that are allowed to run for ever (all stopped by Pause motion).
const KNOWN_LOOPS = new Set(['fp-pulse', 'voyage-ping', 'breathe', 'fp-typing', 'kokonutui-typewriter-caret', 'ping']);

// WebGL off, as in scripts/perf-budget.mjs: headless Chrome draws it in software, which would drown everything else.
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu', '--disable-webgl', '--disable-webgl2'] });
const out = [];
const fail = [];

const scrollThrough = async (page, frames = 600) =>
  page.evaluate(
    (frames) =>
      new Promise((resolve) => {
        // The page grows as islands hydrate and content-visibility sections render on the way down
        // (by thousands of px on a phone), so the step is re-read each frame and the run goes on until
        // the real bottom: a last leap over the grown content would skip blocks no finger could skip.
        const step = (document.documentElement.scrollHeight - innerHeight) / frames;
        const long = [];
        let n = 0;
        let y = 0;
        let last = performance.now();
        const tick = (now) => {
          const dt = now - last;
          last = now;
          if (n > 0 && dt > 34) long.push(Math.round(dt));
          const max = document.documentElement.scrollHeight - innerHeight;
          y = Math.min(max, y + step);
          window.scrollTo(0, y);
          n++;
          if (y < max && n < frames * 3) requestAnimationFrame(tick);
          else resolve({ frames: n, long: long.length, worst: Math.max(0, ...long) });
        };
        requestAnimationFrame(tick);
      }),
    frames,
  );

const running = (page) =>
  page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === 'running').map((a) => {
      const t = a.effect?.getTiming?.() ?? {};
      return { name: a.animationName ?? a.transitionProperty ?? a.constructor.name, iterations: t.iterations, duration: t.duration };
    }),
  );

for (const [vname, v] of VIEWS) {
  for (const motion of MOTIONS) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, isMobile: !!v.mobile, hasTouch: !!v.mobile, deviceScaleFactor: 1, reducedMotion: motion });
    // Returning guest: the arrival board has played on this device.
    await ctx.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
    for (const path of PAGES) {
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const row = { page: path, view: vname, motion, errors };
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(400);
        if (motion === 'no-preference') {
          const cdp = await ctx.newCDPSession(page);
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
          row.scroll = await scrollThrough(page);
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
          await page.waitForTimeout(1500);
          const loops = (await running(page)).filter((a) => a.iterations === Infinity);
          row.loops = [...new Set(loops.map((a) => a.name))];
          row.unknownLoops = row.loops.filter((n) => !KNOWN_LOOPS.has(n));
          if (row.unknownLoops.length) fail.push(`${path}@${vname}: unknown loop ${row.unknownLoops.join(', ')}`);
          row.revealsLeft = await page.evaluate(() => document.querySelectorAll('.fp-reveal:not(.is-in)').length);
          if (row.revealsLeft) fail.push(`${path}@${vname}: ${row.revealsLeft} .fp-reveal never arrived`);
          // Pause motion stops every loop and video.
          const toggle = page.locator('[data-motion-toggle]');
          if (await toggle.count()) {
            await toggle.scrollIntoViewIfNeeded();
            await toggle.click();
            await page.waitForTimeout(300);
            const still = (await running(page)).filter((a) => a.iterations === Infinity && a.name !== 'fp-typing');
            row.loopsAfterPause = [...new Set(still.map((a) => a.name))];
            row.videosPlaying = await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => !v.paused).length);
            if (row.loopsAfterPause.length || row.videosPlaying) fail.push(`${path}@${vname}: Pause motion left ${row.loopsAfterPause.join(', ')} ${row.videosPlaying} videos`);
            await toggle.click();
            await page.evaluate(() => { try { localStorage.removeItem('fp-motion'); } catch {} });
          }
          if (path === '/') {
            // A stub tear must not delay the booking hand-off.
            await page.evaluate(() => { window.__opened = null; window.open = (u) => { window.__opened = performance.now(); return { opener: null }; }; });
            const stub = page.locator('[data-tear][target="_blank"]').first();
            await stub.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1200);
            const t0 = await page.evaluate(() => performance.now());
            await stub.click();
            row.tearToOpenMs = await page.evaluate((t0) => (window.__opened === null ? null : Math.round(window.__opened - t0)), t0);
            if (row.tearToOpenMs === null || row.tearToOpenMs > 100) fail.push(`${path}@${vname}: booking opened after ${row.tearToOpenMs} ms`);
            // Controls stay usable while the passes drop in: focus lands on a stub during the animation.
            await page.reload({ waitUntil: 'networkidle' });
            await page.evaluate(() => document.getElementById('tables')?.scrollIntoView({ behavior: 'instant' }));
            await page.waitForTimeout(150);
            await page.evaluate(() => document.querySelector('[data-pass] .pass-stub')?.focus());
            row.focusDuringDrop = await page.evaluate(() => document.activeElement?.className ?? null);
            if (!/pass-stub/.test(row.focusDuringDrop ?? '')) fail.push(`${path}@${vname}: could not focus a stub during the drop`);
          }
        } else {
          await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
          await page.waitForTimeout(400);
          const anims = (await running(page)).filter((a) => (a.duration ?? 0) > 50);
          row.animating = [...new Set(anims.map((a) => a.name))];
          if (row.animating.length) fail.push(`${path}@${vname} reduce: still animating ${row.animating.join(', ')}`);
          row.revealGate = await page.evaluate(() => document.documentElement.hasAttribute('data-reveal') || document.documentElement.hasAttribute('data-comic-js'));
          if (row.revealGate) fail.push(`${path}@${vname} reduce: reveals armed`);
          row.arrival = await page.evaluate(() => !!document.querySelector('[data-arrival-overlay]'));
          if (row.arrival) fail.push(`${path}@${vname} reduce: arrival board present`);
          row.hidden = await page.evaluate(() =>
            [...document.querySelectorAll('.fp-reveal, [data-panel], [data-pass], .voyage-card, .bill, .chapter-head')].filter((el) => getComputedStyle(el).opacity === '0').length,
          );
          if (row.hidden) fail.push(`${path}@${vname} reduce: ${row.hidden} story elements still hidden`);
        }
      } catch (e) {
        row.error = String(e);
        fail.push(`${path}@${vname} ${motion}: ${e}`);
      }
      if (errors.length) fail.push(`${path}@${vname} ${motion}: page errors ${errors.join(' | ')}`);
      out.push(row);
      console.log(JSON.stringify(row));
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
writeFileSync(join(import.meta.dirname, 'results.json'), JSON.stringify(out, null, 2));
console.log(fail.length ? `\nFAIL\n${fail.join('\n')}` : '\nok');
process.exit(fail.length ? 1 : 0);
