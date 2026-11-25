import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} }); });

// AUDIT B-11: the first Tab stop is the page's own skip link, never "Skip to footer".
// AUDIT B-11: on all 16 routes the first Tab stop is "Skip to content", landing on main#content.
const ROUTES = ['/', '/book/', '/soho/', '/soho/menu/', '/covent-garden/', '/covent-garden/menu/', '/dubai/', '/groups/', '/our-story/', '/our-story/fatt/', '/our-story/pundit/', '/allergens/', '/accessibility/', '/privacy/', '/booking-terms/', '/no-such-page/'];
for (const path of ROUTES) {
  test(`first Tab is Skip to content: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(450); // Base re-asserts scroll for ~300 ms after load
    await page.keyboard.press('Tab');
    const a = page.locator(':focus');
    await expect(a).toHaveText('Skip to content');
    await expect(page.locator('main#content')).toHaveCount(1);
    await expect(page.getByText('Skip to footer')).toHaveCount(0);
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
  // AUDIT B-09: "Today, Tuesday 24 November" / "Tomorrow, …"; the chip's own word leads the name.
  await expect(chips.nth(0)).toHaveAccessibleName(/^Today, \w+day \d{1,2} \w+$/);
  await expect(chips.nth(1)).toHaveAccessibleName(/^Tomorrow, \w+day \d{1,2} \w+$/);
  await expect(chips.nth(1)).toContainText('Tomorrow');
  await expect(chips.nth(5)).toHaveAccessibleName(/^\w+day \d{1,2} \w+$/);
  await page.screenshot({ path: `audit/screens/after/b09-b10-day-strip--${test.info().project.name}.jpg`, type: 'jpeg', quality: 70 });
  const mask = await page.locator('[data-book-days]').evaluate((el) => getComputedStyle(el).getPropertyValue('mask-image') || getComputedStyle(el).getPropertyValue('-webkit-mask-image'));
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
  // @axe-core/playwright types a newer Playwright Page than the pinned @playwright/test 1.60; same object at runtime.
  const r = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
});

// AUDIT B-15: branch hero Book links say where they go: a new tab without JS, the booking panel with it.
test('branch Book link announces where it opens', async ({ page, browser }) => {
  await page.goto('/soho/');
  await expect(page.locator('main a[data-book="soho"]').first()).toHaveAccessibleName('Book a table (opens the booking panel)');
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await ctx.newPage();
  await p2.goto('/covent-garden/');
  await expect(p2.locator('main a[data-book="covent-garden"]').first()).toHaveAccessibleName('Book a table (opens in a new tab)');
  await ctx.close();
});

// U-04: on phones Book stays one tap away the whole way down the home page.
test('phone: the dock Book stays on screen while scrolling down', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'phones only');
  await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  await page.goto('/');
  await page.waitForTimeout(500);
  const book = page.locator('[data-dock] .dock-book');
  for (const f of [0.15, 0.35, 0.55, 0.75, 0.9]) {
    await page.evaluate((f) => { const y = document.documentElement.scrollHeight * f; window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, f);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(400);
    await expect(book, `at ${f * 100}%`).toBeInViewport();
  }
});
