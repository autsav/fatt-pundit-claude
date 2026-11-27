import { test, expect, type Page } from '@playwright/test';

// The door scene's walk-in clip: frames load only after the guest's first interaction, the lit
// front holds until clip frame 0 is decoded, scrubbing is deterministic both ways, a reload
// resumes at the current t, rotation switches cut, and calm mode never fetches a frame.

const FRAMES = '/doors/v1/';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
});

/** Scroll to pinned progress t, as the scene reads it; waits for the scene's rAF to paint. */
async function go(page: Page, t: number) {
  await page.evaluate((t) => {
    const s = document.querySelector<HTMLElement>('[data-doors]')!;
    const stage = s.querySelector<HTMLElement>('.stage')!;
    const bar = parseFloat(getComputedStyle(s).getPropertyValue('--bar')) || 72;
    const y = s.getBoundingClientRect().top + scrollY - bar + t * (s.offsetHeight - stage.offsetHeight);
    const l = (window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis;
    if (l) l.scrollTo(y, { immediate: true, force: true });
    else scrollTo({ top: y, behavior: 'instant' });
  }, t);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** FNV-1a over a 32×32 downscale of the clip canvas. */
const canvasHash = (page: Page) =>
  page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('[data-clip]')!;
    const o = document.createElement('canvas');
    o.width = o.height = 32;
    const x = o.getContext('2d', { willReadFrequently: true })!;
    x.drawImage(c, 0, 0, 32, 32);
    const d = x.getImageData(0, 0, 32, 32).data;
    let h = 2166136261;
    for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619);
    return h >>> 0;
  });

/** Only frames near the shown one are decoded: a jump draws the nearest, then the exact frame lands.
 *  Waits until two reads 150 ms apart agree. */
async function settledHash(page: Page) {
  let prev = -1;
  await expect.poll(async () => { const h = await canvasHash(page); const same = h === prev; prev = h; return same; },
    { intervals: [150] }).toBe(true);
  return prev;
}

const BLANK = (() => {
  let h = 2166136261;
  for (let i = 0; i < 32 * 32 * 4; i++) h = Math.imul(h ^ 0, 16777619);
  return h >>> 0;
})();

const frameRequests = (page: Page) => {
  const urls: string[] = [];
  page.on('request', (r) => { if (r.url().includes(FRAMES)) urls.push(r.url()); });
  return urls;
};

const doors = (page: Page) => page.locator('[data-doors]');
const camera = (page: Page) => page.locator('[data-camera]');

test('no frames before first interaction', async ({ page }) => {
  const urls = frameRequests(page);
  await page.goto('/');
  await page.waitForTimeout(2000);
  expect(urls).toEqual([]);
});

test('no frames before first interaction, first visit (intro plays)', async ({ page }) => {
  // Runs after beforeEach's script: this guest has never arrived, so the intro plays (the Lighthouse path).
  await page.addInitScript(() => { try { localStorage.removeItem('fp-arrived'); } catch {} });
  const urls = frameRequests(page);
  await page.goto('/');
  await page.waitForTimeout(3000);
  expect(urls).toEqual([]);
});

test('page chrome steps back while the scene is pinned', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.5);
  const rail = page.locator('nav.rail');
  await expect(rail).toHaveClass(/is-on/);
  await expect(rail).toHaveClass(/is-quiet/);
  // The rail's own opacity transition settles on the quiet value.
  await expect.poll(() => rail.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeCloseTo(0.35, 2);
});

test('the story opening shows even if the clip never loads', async ({ page }) => {
  await page.route(`**${FRAMES}**`, (r) => r.abort());
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.95);
  await expect(page.locator('.flood')).not.toHaveCSS('display', 'none');
  await expect(page.locator('.opening')).toHaveCSS('opacity', '1');
});

test('frames load after first scroll and the canvas paints', async ({ page }) => {
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.5);
  await expect(doors(page)).toHaveClass(/is-clip-ready/, { timeout: 15_000 });
  // The scene also waits for the street to decode before it goes live, so poll for the paint.
  const alpha = () => page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('[data-clip]')!;
    return c.getContext('2d')!.getImageData(c.width >> 1, c.height >> 1, 1, 1).data[3];
  });
  await expect.poll(alpha, { timeout: 10_000 }).toBe(255);
  expect(await canvasHash(page)).not.toBe(BLANK);
});

test('Chromium fetches AVIF frames, not WebP', async ({ page }) => {
  const urls = frameRequests(page);
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.5);
  await expect(doors(page)).toHaveClass(/is-clip-ready/, { timeout: 15_000 });
  const frames = urls.filter((u) => /\/(land|port)\/\d+\./.test(u));
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.every((u) => u.endsWith('.avif'))).toBe(true);
});

test('the front stays under the clip until it covers the stage (4:3)', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.5);
  await expect(doors(page)).toHaveClass(/is-clip-ready/, { timeout: 15_000 });
  await go(page, 0.26);
  // At .26 the frame is narrower/shorter than the stage: the coded street must still be under it.
  await expect(camera(page)).not.toHaveCSS('display', 'none');
  await expect(camera(page)).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-clip]')).toHaveCSS('display', 'block');
  await expect(page.locator('[data-clip]')).toHaveCSS('opacity', '1');
});

test('the coded sign sub-lines fade out before the clip crossfades in', async ({ page }) => {
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.5);
  await expect(doors(page)).toHaveClass(/is-clip-ready/, { timeout: 15_000 });
  const sub = page.locator('.sign-lit .sign-sub');
  await go(page, 0.15);
  await expect.poll(async () => +(await sub.evaluate((e) => getComputedStyle(e).opacity))).toBeLessThan(0.05); // lit at .16
  await go(page, 0.18);
  await expect.poll(async () => +(await sub.evaluate((e) => getComputedStyle(e).opacity))).toBeGreaterThan(0.95);
  await go(page, 0.23);
  await expect.poll(async () => +(await sub.evaluate((e) => getComputedStyle(e).opacity))).toBeLessThan(0.05);
});

test('holds the lit front until frame 0 is ready', async ({ page }) => {
  await page.route(`**${FRAMES}**`, async (r) => { await new Promise((res) => setTimeout(res, 3000)); await r.continue(); });
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.6);
  await expect(camera(page)).not.toHaveCSS('display', 'none');
  await expect(camera(page)).toHaveCSS('opacity', '1');
  await expect(doors(page)).toHaveClass(/is-clip-ready/, { timeout: 20_000 });
  await expect(camera(page)).toHaveCSS('display', 'none');
});

test('sign sub-lines stay while the clip is gated', async ({ page }) => {
  await page.route(`**${FRAMES}**`, async (r) => { await new Promise((res) => setTimeout(res, 8000)); await r.continue(); });
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.6);
  // the gate holds t at 0 until the street is decoded, so wait for the lit street, then check the clip is still gated
  for (const sel of ['.sign-lit .sign-sub', '.sign-lit .sign-addr']) {
    await expect.poll(() => page.locator(sel).evaluate((e) => +getComputedStyle(e).opacity), { timeout: 6000 }).toBeGreaterThan(0.95);
    await expect(doors(page)).not.toHaveClass(/is-clip-ready/);
  }
});

test('reverse scrub repaints the same frame', async ({ page }) => {
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.3);
  await expect(doors(page)).toHaveClass(/is-clip-full/, { timeout: 30_000 });
  await expect(page.locator('[data-clip]')).toHaveCSS('opacity', '1'); // live: the clip has taken over
  await go(page, 0.5);
  await go(page, 0.3);
  const a = await settledHash(page);
  await go(page, 0.8);
  const mid = await settledHash(page);
  await go(page, 0.3);
  await expect.poll(() => canvasHash(page)).toBe(a);
  expect(mid).not.toBe(a);
});

test('resumes at current t after a mid-scene reload', async ({ page }) => {
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.6);
  await page.reload();
  await expect(doors(page)).toHaveClass(/is-clip-ready/, { timeout: 15_000 });
  await expect(camera(page)).toHaveCSS('display', 'none');
  await expect(doors(page)).toHaveClass(/is-clip-full/, { timeout: 30_000 });
  const resumed = await settledHash(page);
  await go(page, 0.3);
  await go(page, 0.6);
  await expect.poll(() => canvasHash(page)).toBe(resumed);
});

test('rotation switches cut', async ({ page }) => {
  const urls = frameRequests(page);
  await page.setViewportSize({ width: 812, height: 375 });
  await page.goto('/');
  await page.mouse.wheel(0, 100);
  await go(page, 0.5);
  await expect(doors(page)).toHaveClass(/is-clip-ready/, { timeout: 15_000 });
  expect(urls.some((u) => u.includes('/land/'))).toBe(true);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect.poll(() => urls.some((u) => u.includes('/port/')), { timeout: 10_000 }).toBe(true);
  await expect(doors(page)).toHaveClass(/is-clip-ready/, { timeout: 15_000 });
});

test('calm mode fetches no frames', async ({ page }) => {
  const urls = frameRequests(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(500);
  expect(urls).toEqual([]);
  await expect(page.locator('[data-clip]')).toHaveCSS('display', 'none');
  await expect(page.locator('[data-door]')).not.toHaveCSS('transform', 'none');
});
