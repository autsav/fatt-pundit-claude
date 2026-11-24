import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// U-03 (Direction C S7): one bookmark row of menus; the dietary menus and list views sit behind Filter.
test('menu book: Filter holds the dietary menus and list views', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  await page.goto('/?at=soho#menu');
  const menu = page.locator('#menu');
  await menu.scrollIntoViewIfNeeded();
  // The book is a client:visible island: wait until it has hydrated (Astro drops the ssr attribute).
  await page.waitForFunction(() => { const i = document.getElementById('menu')?.closest('astro-island'); return !!i && !i.hasAttribute('ssr'); });
  await expect(menu.getByRole('tab')).toHaveText(['À la carte', 'Set menu', 'Pre-theatre', 'Veg pre-theatre', 'Drinks']);
  const filter = menu.locator('[data-filter-toggle]');
  await expect(filter).toHaveAttribute('aria-expanded', 'false');
  await filter.click();
  await expect(menu.locator('#menu-filter')).toBeVisible();
  const axe = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] }).include('#menu').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => v.id)).toEqual([]);
  await menu.getByRole('button', { name: 'Vegan', exact: true }).click();
  await expect(filter).toHaveText('Filter: Vegan');
  await expect(menu.locator('#menu-panel')).toHaveAttribute('aria-label', /Vegan menu/);
  await filter.click();
  await page.keyboard.press('Escape');
  await expect(menu.locator('#menu-filter')).toBeHidden();
  await expect(filter).toBeFocused();
  await menu.getByRole('tab', { name: 'À la carte' }).click();
  await expect(filter).toHaveText('Filter');
});
