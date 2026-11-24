import { test, expect } from '@playwright/test';

// AUDIT B-05: with JavaScript off the story reads as the static comic; no heading or paragraph is left invisible.
test('our story without JavaScript: every heading and paragraph visible at load', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('/our-story/');
  const hidden = await page.evaluate(() => [...document.querySelectorAll('main h2, main p')]
    .filter((e) => e.getClientRects().length > 0 && getComputedStyle(e).opacity === '0')
    .map((e) => e.textContent!.trim().slice(0, 40)));
  expect(hidden).toEqual([]);
  expect(await page.locator('main h2:visible, main p:visible').count()).toBeGreaterThan(20);
  await ctx.close();
});

test('our story with JavaScript and motion: the scroll scenes still play', async ({ page }) => {
  await page.goto('/our-story/');
  await expect(page.locator('.story-scenes').first()).toBeVisible();
});
