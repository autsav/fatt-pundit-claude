import { test, expect } from '@playwright/test';

// AUDIT B-14: a noindex page (the 404) names no canonical URL of its own.
test('404 page has no canonical or og:url', async ({ page }) => {
  const res = await page.goto('/no-such-page/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
});
test('normal pages keep their canonical', async ({ page }) => {
  await page.goto('/soho/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.fattpundit.co.uk/soho/');
});
