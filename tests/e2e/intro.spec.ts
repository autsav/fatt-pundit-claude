import { test, expect } from '@playwright/test';

// AUDIT B-01: the home intro must never trap a guest when its script can't run.
for (const width of [375, 1280]) {
  test(`JavaScript off: no intro overlay, home readable (${width})`, async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 812 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('[data-arrival-overlay]')).toBeHidden();
    await expect(page.locator('h1').first()).toBeVisible();
    await page.screenshot({ path: `audit/screens/after/b01-nojs--${width}.jpg`, type: 'jpeg', quality: 70 });
    await ctx.close();
  });
  test(`scripts blocked: the overlay leaves by 1.2 s on its own (${width})`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height: 812 } });
    const page = await ctx.newPage();
    await page.route('**/_astro/*.js', (r) => r.abort());
    await page.goto('/', { waitUntil: 'commit' });
    await page.waitForTimeout(1300);
    await expect(page.locator('[data-arrival-overlay]')).toBeHidden();
    await expect(page.locator('h1').first()).toBeVisible();
    await page.screenshot({ path: `audit/screens/after/b01-blocked--${width}.jpg`, type: 'jpeg', quality: 70 });
    await ctx.close();
  });
}

// AUDIT B-04: the intro hands over within 1.2 s (≤ 1.3 s measured), and Skip has the focus.
test('intro gone within 1.3 s, first Tab is Skip', async ({ page }) => {
  // Record the first element to take focus (polling can miss it: the board can open within a few frames).
  await page.addInitScript(() => {
    const w = window as unknown as { __firstFocus?: string; __played?: boolean };
    document.addEventListener('focusin', (e) => { w.__firstFocus ??= (e.target as Element).matches('[data-skip]') ? 'skip' : (e.target as Element).tagName; }, true);
    document.addEventListener('DOMContentLoaded', () => { w.__played = document.documentElement.dataset.arrival === 'play'; });
  });
  await page.goto('/', { waitUntil: 'commit' });
  const t0 = Date.now();
  await page.waitForFunction(() => (window as unknown as { __played?: boolean }).__played !== undefined, null, { timeout: 1500 });
  if (await page.evaluate(() => (window as unknown as { __played?: boolean }).__played)) {
    // Focus starts on Skip, the only control not made inert, so a keyboard guest's first stop is Skip.
    await page.waitForFunction(() => (window as unknown as { __firstFocus?: string }).__firstFocus !== undefined, null, { timeout: 1500 });
    expect(await page.evaluate(() => (window as unknown as { __firstFocus?: string }).__firstFocus)).toBe('skip');
  }
  await page.waitForFunction(() => {
    const o = document.querySelector('[data-arrival-overlay]');
    return !o || getComputedStyle(o).visibility === 'hidden' || getComputedStyle(o).display === 'none'
      // the doors have swung edge-on and faded
      || [...document.querySelectorAll<HTMLElement>('.arrival .half')].every((d) => getComputedStyle(d).opacity === '0');
  }, null, { timeout: 4000, polling: 25 });
  expect(Date.now() - t0).toBeLessThanOrEqual(1300);
  // Once the board has gone, the next Tab starts from the top of the page.
  await page.waitForFunction(() => document.documentElement.dataset.arrival === 'done', null, { timeout: 3000 }).catch(() => {});
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Skip to content');
});

// AUDIT B-20: the "wipe the glass" hint only appears where a mouse can wipe, and only when the glass is live.
// B-26: on a software WebGL renderer (no GPU, e.g. SwiftShader in headless Chromium) the rain never starts
// and the fogged still stays.
test('wipe hint: shown with a mouse on live glass; no rain on a software renderer', async ({ page }, info) => {
  await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  await page.goto('/');
  await page.waitForTimeout(3600);
  const { on, live, software } = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const i = gl?.getExtension('WEBGL_debug_renderer_info');
    const r = gl ? String(gl.getParameter(i ? i.UNMASKED_RENDERER_WEBGL : gl.RENDERER)) : '';
    return {
      on: document.querySelector('.hero-wipe')!.classList.contains('is-on'),
      live: document.querySelector<HTMLElement>('[data-rain-glass] canvas')!.style.opacity === '1',
      software: !gl || /swiftshader|llvmpipe|softpipe|software/i.test(r),
    };
  });
  if (software) expect(live).toBe(false);
  expect(on).toBe(info.project.name === 'desktop' && live);
  await expect(page.locator('.hero-glass img')).toBeVisible();
});
