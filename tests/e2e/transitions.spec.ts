import { test, expect } from '@playwright/test';

// Direction C S12: moving from home to a room is a cross-document view transition (Chromium), the room's
// pass morphs into its page, and the header keeps its own group; reduced motion turns it off.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('fp-arrived', '1'); } catch {}
    addEventListener('pagereveal', (e) => { (window as unknown as { __vt: boolean }).__vt = !!(e as Event & { viewTransition?: unknown }).viewTransition; });
  });
});

test('home → Soho runs a view transition with the header and the room named', async ({ page }) => {
  await page.goto('/');
  const names = await page.evaluate(() => [getComputedStyle(document.querySelector('header.bar')!).viewTransitionName, getComputedStyle(document.querySelector('[data-pass]')!).viewTransitionName]);
  expect(names).toEqual(['site-header', 'branch-soho']);
  await page.locator('#tables .pass-more').first().click();
  await page.waitForURL(/\/soho\/$/);
  expect(await page.evaluate(() => (window as unknown as { __vt: boolean }).__vt)).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('[data-room-hero]')!).viewTransitionName)).toBe('branch-soho');
});

test('reduced motion: no view transition between pages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#tables .pass-more').first().click();
  await page.waitForURL(/\/soho\/$/);
  expect(await page.evaluate(() => (window as unknown as { __vt: boolean }).__vt)).toBe(false);
});
