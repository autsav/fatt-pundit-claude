import { test, expect } from '@playwright/test';

// AUDIT B-25: "Pause motion" stops every loop that never ends on its own (WCAG 2.2.2).
for (const path of ['/', '/soho/', '/our-story/']) {
  test(`Pause motion stills every infinite loop: ${path}`, async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); localStorage.setItem('fp-motion', 'paused'); } catch {} });
    await page.goto(path);
    for (let i = 0; i < 25; i++) { await page.mouse.wheel(0, 700); await page.waitForTimeout(60); }
    await page.waitForTimeout(600);
    const running = await page.evaluate(() => document.getAnimations()
      .filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations === Infinity)
      .map((a) => (a as CSSAnimation).animationName ?? 'js'));
    expect([...new Set(running)]).toEqual([]);
  });
}
