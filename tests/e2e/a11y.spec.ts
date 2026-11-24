import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} }); });

// AUDIT B-11: the first Tab stop is the page's own skip link, never "Skip to footer".
for (const path of ['/', '/soho/', '/dubai/', '/our-story/', '/book/', '/soho/menu/', '/allergens/']) {
  test(`first Tab is the page's skip link: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(450); // Base re-asserts scroll for ~300 ms after load
    await page.keyboard.press('Tab');
    const a = page.locator(':focus');
    await expect(a).toHaveClass(/skip/);
    await expect(a).not.toHaveText('Skip to footer');
    const target = (await a.getAttribute('href'))!.slice(1);
    expect(await page.locator(`[id="${target}"]`).count()).toBe(1);
  });
}

// AUDIT B-09 / B-10: day chips' names start with their visible words; the strip shows there is more.
test('booking day strip: label in name and a scroll cue', async ({ page }) => {
  await page.goto('/soho/');
  const t = page.locator('[data-book]:visible').first();
  await t.scrollIntoViewIfNeeded(); await t.click();
  const chips = page.locator('dialog[open] .book-day');
  for (const i of [0, 1, 5]) {
    const visible = (await chips.nth(i).innerText()).replace(/\s+/g, ' ').trim();
    expect(await chips.nth(i).getAttribute('aria-label')).toMatch(new RegExp(`^${visible}`));
  }
  const mask = await page.locator('[data-book-days]').evaluate((el) => getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage);
  expect(mask).toContain('linear-gradient');
});

// AUDIT B-19: reduced motion leaves the voyage's port strip keyboard-scrollable.
test('home, reduced motion: no serious or critical axe violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 700); await page.waitForTimeout(60); }
  // Back to the top before axe: mid-scroll, the sticky header overlaps whatever sits under it and axe's
  // target-size check reports that position, not the page.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
});
