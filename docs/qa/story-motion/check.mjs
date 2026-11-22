// Story scenes QA (/our-story/, docs/STORY-MOTION-PLAN.md). Needs `astro preview` on BASE and
// playwright-core in the repo's node_modules (hand-installed for QA, see docs/qa/phase10-final/REPORT.md).
//
//   BASE=http://localhost:4321 OUT=<dir> node docs/qa/story-motion/check.mjs
//
// For every scene it finds, at 1440x900 and 390x844: screenshots at 25/50/75% of the track, no
// horizontal scroll, every visible caption / bubble / place name on top and on screen. Then: no
// duplicate ids, chapter anchors, the "Read as a comic" switch (and that it is remembered), reduced
// motion (scenes gone, comic back, scene-only art not fetched). Exit 1 on any problem.
import { pathToFileURL, fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const { chromium } = await import(pathToFileURL(join(REPO, 'node_modules/playwright-core/index.mjs')).href);
const BASE = process.env.BASE ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? join(tmpdir(), 'story-motion-shots');
const EDGE = process.env.CHROME_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
mkdirSync(OUT, { recursive: true });
const URL = `${BASE}/our-story/`;
const browser = await chromium.launch({ executablePath: EDGE });
const problems = [];
const bad = (m) => problems.push(m);
const shots = [];
const settle = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 120)))));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Which chapters have scenes, and is each chapter's comic shown or hidden as it should be?
const chapterState = (page) => page.evaluate(() => [...document.querySelectorAll('.story-chapter')].map((c) => ({
  id: c.id, scenes: c.hasAttribute('data-scenes'),
  scenesShown: !!c.querySelector('.story-scenes') && getComputedStyle(c.querySelector('.story-scenes')).display !== 'none',
  comicShown: getComputedStyle(c.querySelector('.comic')).display !== 'none',
})));

for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });

  const ids = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) bad(`${w}: duplicate ids ${dup}`);
  for (const c of await chapterState(page)) {
    if (c.scenes && (!c.scenesShown || c.comicShown)) bad(`${w}: ${c.id} should show scenes, not the comic`);
    if (!c.scenes && !c.comicShown) bad(`${w}: ${c.id} comic hidden`);
  }
  // The chapter components' own styles reach SceneArt's images (scope attribute passed through).
  const reach = await page.evaluate(() => [...document.querySelectorAll('.story-scene [data-art]')].filter((e) => getComputedStyle(e).position !== 'absolute' && !e.closest('.layer')).map((e) => e.className));
  if (reach.length) bad(`${w}: art not placed (scoped styles missing?) ${reach}`);

  const scenes = await page.evaluate(() => [...document.querySelectorAll('.story-scene')].map((s, i) => ({ i, label: s.getAttribute('aria-label') })));
  for (const { i, label } of scenes) {
    for (const p of [0.25, 0.5, 0.75]) {
      await page.evaluate(([i, p]) => {
        const el = document.querySelectorAll('.story-scene')[i];
        scrollTo(0, Math.round(el.getBoundingClientRect().top + scrollY + p * (el.offsetHeight - innerHeight)));
      }, [i, p]);
      await page.waitForFunction((i) => [...document.querySelectorAll('.story-scene')[i].querySelectorAll('img')].every((m) => m.complete), i, { timeout: 10000 })
        .catch(() => bad(`${w} ${label}: images not loaded`));
      await settle(page);
      const file = join(OUT, `scene-${String(i + 1).padStart(2, '0')}-${slug(label)}-${Math.round(p * 100)}-${w}.png`);
      await page.screenshot({ path: file });
      const r = await page.evaluate((i) => {
        const scene = document.querySelectorAll('.story-scene')[i];
        const seen = (e) => { for (let n = e; n; n = n.parentElement) if (+getComputedStyle(n).opacity < 0.05) return false; return true; };
        const texts = [];
        for (const t of scene.querySelectorAll('.cap, .bubble, .scene-place, .scene-credit')) {
          const op = +getComputedStyle(t).opacity;
          if (op < 0.5) continue;
          const b = t.getBoundingClientRect();
          const covered = [[0.5, 0.5], [0.1, 0.2], [0.9, 0.8]].some(([fx, fy]) => {
            const stack = document.elementsFromPoint(b.left + b.width * fx, b.top + b.height * fy);
            const k = stack.findIndex((e) => t.contains(e));
            return stack.slice(0, k < 0 ? stack.length : k).some(seen);
          });
          const off = b.left < 0 || b.right > innerWidth || b.top < 60 || b.bottom > innerHeight;
          texts.push({ cls: [...t.classList].pop(), op: +op.toFixed(2), covered, off });
        }
        return { hscroll: document.documentElement.scrollWidth > innerWidth, texts };
      }, i);
      shots.push(`${file}  ${r.texts.map((t) => `${t.cls}@${t.op}`).join(' ') || '(no text yet)'}`);
      if (r.hscroll) bad(`${w} ${label} ${p}: horizontal scroll`);
      for (const t of r.texts) if (t.covered || t.off) bad(`${w} ${label} ${p}: ${t.cls} covered=${t.covered} off-screen=${t.off}`);
    }
  }

  // Chapter anchors land on their chapter (the wrapper is never display:none).
  for (const c of await chapterState(page)) {
    await page.goto(`${URL}#${c.id}`, { waitUntil: 'networkidle' });
    await settle(page);
    const top = await page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top), c.id);
    if (Math.abs(top) > 2) bad(`${w}: #${c.id} lands at ${top}px`);
  }

  // "Read as a comic": scenes out, comic in, remembered on reload, and back again.
  await page.goto(URL, { waitUntil: 'networkidle' });
  const toggle = page.locator('[data-story-toggle]');
  if (!(await toggle.isVisible())) bad(`${w}: "Read as a comic" switch not shown`);
  else {
    await toggle.click();
    await page.reload({ waitUntil: 'networkidle' });
    const after = await chapterState(page);
    if (after.some((c) => c.scenesShown || !c.comicShown)) bad(`${w}: comic mode not applied after reload`);
    if ((await toggle.getAttribute('aria-pressed')) !== 'true') bad(`${w}: switch not pressed in comic mode`);
    await toggle.click();
    if ((await chapterState(page)).some((c) => c.scenes && !c.scenesShown)) bad(`${w}: scenes not back after switching again`);
  }
  await ctx.close();

  // Calm mode: no scenes, every comic chapter, no switch, scene-only art not fetched.
  const calm = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  const cp = await calm.newPage();
  await cp.goto(URL, { waitUntil: 'networkidle' });
  for (const c of await chapterState(cp)) if (c.scenesShown || !c.comicShown) bad(`${w} calm: ${c.id} wrong mode`);
  if (await cp.locator('[data-story-toggle]').isVisible()) bad(`${w} calm: switch shown`);
  await cp.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await cp.waitForTimeout(800);
  // Scene-only: an image the page also shows outside the scenes (the world chart on the map) is fetched anyway.
  const fetched = await cp.evaluate(() => {
    const shared = new Set([...document.querySelectorAll('img')].filter((i) => !i.closest('.story-scene')).map((i) => i.getAttribute('src')));
    return [...document.querySelectorAll('.story-scene img')].filter((i) => i.currentSrc && !shared.has(i.getAttribute('src'))).map((i) => i.className);
  });
  if (fetched.length) bad(`${w} calm: scene-only art fetched ${fetched}`);
  await calm.close();
}
await browser.close();
console.log(shots.join('\n'));
console.log(problems.length ? `\nPROBLEMS\n${problems.join('\n')}` : '\nStory scenes: all checks passed.');
process.exit(problems.length ? 1 : 0);
