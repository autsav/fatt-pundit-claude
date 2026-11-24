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
