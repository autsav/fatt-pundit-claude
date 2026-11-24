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
  test(`scripts blocked: the overlay never shows (${width})`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height: 812 } });
    const page = await ctx.newPage();
    await page.route('**/_astro/*.js', (r) => r.abort());
    await page.goto('/');
    for (const at of [300, 1300]) {
      await page.waitForTimeout(at === 300 ? 300 : 1000);
      await expect(page.locator('[data-arrival-overlay]')).toBeHidden();
    }
    await expect(page.locator('h1').first()).toBeVisible();
    await page.screenshot({ path: `audit/screens/after/b01-blocked--${width}.jpg`, type: 'jpeg', quality: 70 });
    await ctx.close();
  });
}

// AUDIT B-04: the intro hands over within 1.2 s (≤ 1.3 s measured), and Skip has the focus.
test('intro gone within 1.3 s, first Tab is Skip', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  const t0 = Date.now();
  await page.waitForSelector('html.arrival-ready', { timeout: 1500 }).catch(() => {});
  const playing = await page.evaluate(() => document.documentElement.dataset.arrival === 'play' && document.documentElement.classList.contains('arrival-ready'));
  if (playing) {
    // Focus starts on Skip, the only control not made inert, so a keyboard guest's first stop is Skip.
    await expect(page.locator('[data-skip]')).toBeFocused({ timeout: 300 });
  }
  await page.waitForFunction(() => {
    const o = document.querySelector('[data-arrival-overlay]');
    return !o || getComputedStyle(o).visibility === 'hidden' || getComputedStyle(o).display === 'none'
      || document.querySelector<HTMLElement>('.arrival .half.top')!.getBoundingClientRect().bottom <= 0;
  }, null, { timeout: 4000, polling: 25 });
  expect(Date.now() - t0).toBeLessThanOrEqual(1300);
});

// AUDIT B-20: the "wipe the glass" hint only appears where a mouse can wipe.
test('wipe hint: shown with a mouse, not on touch phones', async ({ page }, info) => {
  await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  await page.goto('/');
  await page.waitForTimeout(3600);
  const on = await page.locator('.hero-wipe').evaluate((el) => el.classList.contains('is-on'));
  expect(on).toBe(info.project.name === 'desktop');
});
