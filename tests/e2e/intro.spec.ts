import { test, expect } from '@playwright/test';

// AUDIT B-01: the home intro must never trap a guest when its script can't run.
test.describe('home intro fail-safe', () => {
  test('JavaScript off: no intro overlay, the page is readable', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('[data-arrival-overlay]')).toBeHidden();
    await expect(page.locator('h1').first()).toBeVisible();
    await ctx.close();
  });

  test('scripts fail to load: the overlay leaves by itself', async ({ page }) => {
    await page.route('**/_astro/*.js', (r) => r.abort());
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('[data-arrival-overlay]')).toBeHidden({ timeout: 6000 });
  });
});

// AUDIT B-04: the intro hands over to the page within 1.5 s (brief §3).
test('intro opens within 1.5 s on a first visit', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  const t0 = Date.now();
  await page.waitForFunction(() => {
    // Done when the board is gone, or its top shutter has slid fully off screen (it was laid out first).
    const state = document.documentElement.dataset.arrival;
    if (state === 'done' || state === 'skip') return true;
    const top = document.querySelector<HTMLElement>('.arrival .half.top');
    return !!top && top.offsetHeight > 0 && top.getBoundingClientRect().bottom <= 0;
  }, null, { timeout: 4000, polling: 50 });
  expect(Date.now() - t0).toBeLessThanOrEqual(1500);
});
