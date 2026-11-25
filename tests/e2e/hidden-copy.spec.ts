import { test, expect } from '@playwright/test';

// AUDIT B-18: hidden parts of the Book drawer must not carry copy (scrapers and reader modes read it).
test('Book drawer keeps no text in hidden notes', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  await page.goto('/soho/');
  await page.waitForTimeout(3500); // the drawer pre-draws at idle
  // The group box's link and phone line are fixed copy; its sentence is the part written per guest count.
  const stale = await page.evaluate(() => [...document.querySelectorAll('[data-book-closed], [data-book-group-text], [data-book-pre], [data-book-deposit]')]
    .filter((el) => el.closest('[hidden]'))
    .map((el) => el.textContent!.trim()).filter(Boolean));
  expect(stale).toEqual([]);
});
