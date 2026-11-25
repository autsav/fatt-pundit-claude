import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} }); });

// AUDIT B-03: with reduced motion there is no Lenis, and the page behind a dialog still scrolled.
for (const path of ['/', '/soho/']) for (const [name, sel] of [['site menu', '[data-index-open]:visible'], ['menus chooser', '[data-menus-open]:visible'], ['book drawer', '[data-book]:visible']] as const) {
  test(`${path} ${name}: page behind stays put, Esc closes, focus returns`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(path);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => ({ reduce: matchMedia('(prefers-reduced-motion: reduce)').matches, lenis: !!(window as unknown as { __lenis?: unknown }).__lenis }))).toEqual({ reduce: true, lenis: false });
    const trigger = page.locator(sel).first();
    test.skip(!(await trigger.count()), 'no trigger at this size');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const w0 = await page.evaluate(() => document.querySelector('main')!.getBoundingClientRect().width);
    await page.keyboard.press('Enter');
    await expect(page.locator('dialog[open]')).toBeVisible();
    // Locking the page must not shift it sideways (the scrollbar gutter is kept).
    expect(await page.evaluate(() => document.querySelector('main')!.getBoundingClientRect().width)).toBe(w0);
    const y0 = await page.evaluate(() => scrollY);
    // Tab through the sheet first (the audit probe's path), then wheel near the top-left edge.
    for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
    await page.mouse.move(10, 200);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => scrollY)).toBe(y0);
    await page.locator('dialog[open]').focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}
