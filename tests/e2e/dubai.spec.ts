import { test, expect } from '@playwright/test';

// AUDIT B-06: with no list endpoint, every Dubai list button says it opens Instagram, and does.
test('Dubai list buttons say what they do', async ({ page }, info) => {
  await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  for (const path of ['/', '/dubai/', '/book/']) {
    await page.goto(path);
    const ctas = page.getByRole('link', { name: /Follow (@fattpundit )?for the date/ });
    expect(await ctas.count(), path).toBeGreaterThan(0);
    for (const a of await ctas.all()) {
      await expect(a).toHaveAttribute('href', 'https://www.instagram.com/fattpundit/');
      await expect(a).toHaveAttribute('target', '_blank');
      await expect(a).toHaveAccessibleName(/opens Instagram/);
    }
  }
  await expect(page.getByText(/get the opening date/i)).toHaveCount(0);
  await page.goto('/dubai/');
  await page.locator('#footer').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `audit/screens/after/b06-dubai-footer--${info.project.name}.jpg`, type: 'jpeg', quality: 70 });
});
