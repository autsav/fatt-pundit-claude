import { test, expect } from '@playwright/test';

const ld = async (page: import('@playwright/test').Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));

// AUDIT B-24: no Restaurant entity for Dubai until it opens; the Organization still names it.
test('JSON-LD: Restaurant only for open rooms', async ({ page }) => {
  await page.goto('/dubai/');
  expect((await ld(page)).filter((x) => x['@type'] === 'Restaurant')).toEqual([]);
  await page.goto('/soho/');
  const soho = (await ld(page)).find((x) => x['@type'] === 'Restaurant');
  expect(soho?.openingHoursSpecification?.length).toBeGreaterThan(0);
  expect(soho?.acceptsReservations).toContain('opentable');
  await page.goto('/');
  const org = (await ld(page)).find((x) => x['@type'] === 'Organization');
  expect(org.subOrganization.map((r: { name: string }) => r.name).join(' ')).toContain('Dubai');
});
