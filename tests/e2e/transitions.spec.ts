import { test, expect } from '@playwright/test';

// Direction C S12: moving from home to a room is a cross-document view transition (Chromium), the room's
// pass morphs into its page, and the header keeps its own group; reduced motion turns it off.
// We check what the site controls: the outgoing page opts in (pageswap carries a viewTransition) and the
// names match on both sides. Whether headless Chromium then reveals it is timing-dependent (it often skips
// under phone emulation), so the incoming pagereveal is not asserted.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('fp-arrived', '1'); } catch {}
    addEventListener('pageswap', (e) => { sessionStorage.setItem('vt-swap', String(!!(e as Event & { viewTransition?: unknown }).viewTransition)); });
  });
  // Plain navigations only: drop home's speculation rules so a prerendered activation can't change the path.
  await page.route((u) => u.pathname === '/', async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace(/<script type="speculationrules"[\s\S]*?<\/script>/, '');
    await route.fulfill({ response: res, body });
  });
});

const swapped = (page: import('@playwright/test').Page) => page.evaluate(() => sessionStorage.getItem('vt-swap'));

test('home → Soho starts a view transition with the header and the room named', async ({ page }) => {
  await page.goto('/');
  const names = await page.evaluate(() => [getComputedStyle(document.querySelector('header.bar')!).viewTransitionName, getComputedStyle(document.querySelector('[data-pass]')!).viewTransitionName]);
  expect(names).toEqual(['site-header', 'branch-soho']);
  await page.locator('#tables .pass-more').first().click();
  await page.waitForURL(/\/soho\/$/);
  expect(await swapped(page)).toBe('true');
  expect(await page.evaluate(() => [getComputedStyle(document.querySelector('header.bar')!).viewTransitionName, getComputedStyle(document.querySelector('[data-room-hero]')!).viewTransitionName])).toEqual(['site-header', 'branch-soho']);
});

test('reduced motion: no view transition between pages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#tables .pass-more').first().click();
  await page.waitForURL(/\/soho\/$/);
  expect(await swapped(page)).toBe('false');
});
