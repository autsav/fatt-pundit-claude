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
  // A future Tuesday to Saturday: both rooms open (Soho closes Sundays, Covent Garden Mondays).
  const day = await page.locator('[data-desk-day] option').evaluateAll((os) =>
    (os as HTMLOptionElement[]).map((o) => o.value).find((v, i) => i > 0 && [2, 3, 4, 5, 6].includes(new Date(`${v}T12:00:00Z`).getUTCDay())));
  await page.selectOption('[data-desk-day]', day!);
  await page.selectOption('[data-desk-time]', '19:00');
  const fit = (id: string) => page.locator(`#book-${id} [data-desk-fit]`);
  await expect(fit('covent-garden')).toHaveText(/7\.15pm/);
  await expect(fit('soho')).toHaveText(/7pm/);
  await expect(page.locator('#book-covent-garden [data-desk-go]')).toHaveAttribute('href', /start_time=19%3A15|start_time=19:15/);
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

// AUDIT B-12: above a room's online limit, the desk's button says what it now does.
test('/book/ desk: the button names the group route above the online limit', async ({ page }) => {
  await page.goto('/book/');
  await page.selectOption('[data-desk-size]', '8');
  const go = page.locator('#book-soho [data-desk-go]');
  await expect(go).toHaveText('Plan a group at Soho');
  await expect(go).not.toHaveAttribute('target', '_blank');
  await page.selectOption('[data-desk-size]', '2');
  await expect(go).toHaveText(/Book at Soho/);
  await expect(go).toHaveAttribute('target', '_blank');
});

// AUDIT B-02: every Tuesday to Sunday of the coming week, 7pm gives Covent Garden a real time.
test('/book/ desk: Covent Garden has a time at 7pm on every open day', async ({ page }) => {
  await page.goto('/book/');
  const days = await page.locator('[data-desk-day] option').evaluateAll((os) =>
    (os as HTMLOptionElement[]).map((o) => o.value).filter((v, i) => i > 0 && i <= 7 && new Date(`${v}T12:00:00Z`).getUTCDay() !== 1));
  expect(days.length).toBe(6);
  for (const d of days) {
    await page.selectOption('[data-desk-day]', d);
    await page.selectOption('[data-desk-time]', '19:00');
    await expect(page.locator('#book-covent-garden [data-desk-fit]'), d).toHaveText(/opens with 2 guests, .*, (7pm|7\.15pm|6\.45pm)\./);
  }
});
