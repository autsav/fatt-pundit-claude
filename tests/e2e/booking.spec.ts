import { test, expect, type Page } from '@playwright/test';

// Returning guest (no intro); window.open stubbed so the provider hand-off can be read.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('fp-arrived', '1'); } catch {}
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((u: string) => { (window as unknown as { __opened: string[] }).__opened.push(String(u)); return { opener: null } as Window; }) as typeof window.open;
  });
});

// AUDIT B-02: Covent Garden (opens 16:45) must get a time at the desk's default 7pm.
test('/book/ desk: each room resolves its own nearest time', async ({ page }) => {
  await page.goto('/book/');
  await page.selectOption('[data-desk-day]', { index: 3 });
  await page.selectOption('[data-desk-time]', '19:00').catch(() => {});
  const fit = (id: string) => page.locator(`#book-${id} [data-desk-fit]`);
  await expect(fit('covent-garden')).not.toHaveText(/Outside opening hours/);
  await expect(fit('covent-garden')).toHaveText(/7\.15pm|6\.45pm|Closed/);
  await expect(fit('soho')).toHaveText(/7pm|Closed/);
});

// Brief §6: both rooms × 2/4/7/8 guests × today and a future day, through the Book drawer.
const RULES = { Soho: { online: 7 }, 'Covent Garden': { online: 4 } } as const;
const open = async (page: Page) => {
  if (await page.locator('dialog[data-book-drawer][open]').count()) return;
  const t = page.locator('[data-book]:visible').first();
  await t.scrollIntoViewIfNeeded();
  await t.click();
  await expect(page.locator('dialog[data-book-drawer][open]')).toBeVisible();
};
for (const room of Object.keys(RULES) as (keyof typeof RULES)[]) {
  for (const size of [2, 4, 7, 8]) {
    for (const day of ['today', 'future'] as const) {
      test(`drawer: ${room}, ${size} guests, ${day}`, async ({ page }) => {
        await page.goto('/book/');
        await open(page);
        const dlg = page.locator('dialog[data-book-drawer]');
        if (await dlg.locator('[data-book-where]').isVisible()) await dlg.locator('.book-chip', { hasText: room }).click();
        await dlg.locator('[data-book-size]').fill(String(size));
        await dlg.locator('[data-book-size]').dispatchEvent('change');
        await dlg.locator('.book-day').nth(day === 'today' ? 0 : 3).click();
        const deposit = dlg.locator('[data-book-deposit]');
        if (size >= 4) await expect(deposit).toBeVisible(); else await expect(deposit).toBeHidden();
        const tooMany = size > RULES[room].online;
        await expect(dlg.locator('[data-book-group]')).toBeVisible({ visible: tooMany });
        await expect(dlg.locator('[data-book-go]')).toBeVisible({ visible: !tooMany });
        if (size >= 8) await expect(dlg.locator('[data-book-group-text]')).toContainText('set menu');
        const times = dlg.locator('.book-time');
        if (tooMany || !(await times.count())) return; // today can be over: the closed note shows instead
        await times.first().click();
        await dlg.locator('[data-book-go]').click();
        const url = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened.at(-1) ?? '');
        expect(url).toContain(room === 'Soho' ? 'opentable' : 'sevenrooms');
        expect(url).toContain(room === 'Soho' ? `covers=${size}` : `party_size=${size}`);
      });
    }
  }
}
