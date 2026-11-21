// Viewport montages (6 scroll positions side by side, 4 at 1920) + keyboard probe + 404 asset finder.
// Usage: node shots.mjs  (env BASE, OUT, PAGES, CHROME_PATH). Needs playwright-core installed beside it.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const BASE = process.env.BASE ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? join(import.meta.dirname, 'screens');
const CHROME = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : '/usr/bin/google-chrome');
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const PAGES = process.env.PAGES ? process.env.PAGES.split(',') : ['/', '/soho/', '/covent-garden/', '/soho/menu/', '/book/', '/private-dining/', '/our-story/', '/allergens/'];
const VIEWS = [['320', 320, 568, true], ['390', 390, 844, true], ['844land', 844, 390, true], ['768', 768, 1024, true], ['1920', 1920, 1080, false]];
const bad = new Set();
for (const [vn, w, h, mob] of VIEWS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob, reducedMotion: 'reduce' });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    page.on('response', (r) => r.status() >= 400 && bad.add(`${path} ${r.status()} ${r.url()}`));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); } window.scrollTo(0, 0); });
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const shots = [];
    const n = vn === '1920' ? 4 : 6;
    for (let i = 0; i < n; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((H * i) / (n - 1)));
      await page.waitForTimeout(250);
      shots.push((await page.screenshot()).toString('base64'));
    }
    const m = await ctx.newPage();
    await m.setContent(`<body style="margin:0;background:#888;display:flex;gap:6px;padding:6px">${shots.map((s) => `<img src="data:image/png;base64,${s}" style="display:block;width:${w}px;height:${h}px">`).join('')}</body>`);
    await m.setViewportSize({ width: n * (w + 6) + 6, height: h + 12 });
    const slug = path.replace(/\W+/g, '_').replace(/^_|_$/g, '') || 'home';
    await m.screenshot({ path: join(OUT, `${slug}--${vn}.png`), fullPage: true });
    await m.close();
    await page.close();
  }
  await ctx.close();
}
console.log('404s:', [...bad]);

// keyboard probe at 1440 and 390
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob, reducedMotion: 'reduce' });
  for (const path of ['/', '/soho/', '/soho/menu/', '/book/', '/private-dining/']) {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const seq = [];
    let noRing = [];
    for (let i = 0; i < 45; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => {
        const e = document.activeElement; if (!e || e === document.body) return null;
        const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
        const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
        const vis = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden';
        const inView = r.bottom > 0 && r.top < innerHeight;
        return { d: `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(/\s+/)[0] : ''}:${(e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 22)}`, ring, vis, inView, hiddenBy: e.closest('[hidden],[inert],[aria-hidden=true]') ? 'yes' : '' };
      });
      if (!f) break;
      seq.push(f.d + (f.ring ? '' : ' [NO-RING]') + (f.vis ? '' : ' [INVISIBLE]') + (f.hiddenBy ? ' [IN-HIDDEN]' : ''));
      if (!f.ring || !f.vis || f.hiddenBy) noRing.push(seq.at(-1));
    }
    console.log(`\n## ${w} ${path}\n` + seq.join(' > ') + '\nPROBLEMS: ' + (noRing.join(' | ') || 'none'));
    // drawer: open via the first element matching data-book-open or header book button
    const opener = await page.$('header a.nav-book, [data-book-open]');
    if (opener) {
      await opener.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
      const st = await page.evaluate(() => { const d = document.querySelector('dialog.book'); const a = document.activeElement; return { open: d?.open, focusIn: d?.contains(a), active: a?.tagName + ':' + (a?.getAttribute('aria-label') || a?.textContent || '').trim().slice(0, 20) }; });
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      const after = await page.evaluate(() => ({ open: document.querySelector('dialog.book')?.open, active: document.activeElement?.tagName + ':' + (document.activeElement?.textContent || '').trim().slice(0, 20) }));
      console.log('drawer:', JSON.stringify(st), 'after Esc:', JSON.stringify(after));
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
