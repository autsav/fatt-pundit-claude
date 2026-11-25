import { test, expect } from '@playwright/test';

// AUDIT B-16: without a form service there is no form posting to mailto: (an insecure-form warning);
// each room offers "Email us" and a call instead.
test('groups page: no mailto form, Email us + Call per room, clean console', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (m) => ['warning', 'error'].includes(m.type()) && !m.text().includes('GL Driver') && warnings.push(m.text()));
  await page.goto('/private-dining/');
  await expect(page.locator('form[action^="mailto:"]')).toHaveCount(0);
  for (const room of ['Soho', 'Covent Garden']) {
    const box = page.locator('[data-contact-room]', { hasText: room });
    await expect(box.getByRole('link', { name: new RegExp(`Email us.*${room}`) })).toHaveAttribute('href', /^mailto:/);
    await expect(box.getByRole('link', { name: /^Call / })).toHaveAttribute('href', /^tel:/);
  }
  await page.waitForTimeout(800);
  expect(warnings).toEqual([]);
});
