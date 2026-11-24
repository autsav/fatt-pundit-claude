// Targeted probes for the brief's 13 suspects. Each writes evidence into audit/data/probes.json.
// Usage: BASE=http://localhost:4399 node audit/scripts/probes.mjs [probeName...]
import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const BASE = process.env.BASE ?? 'http://localhost:4399';
const OUTF = join(ROOT, 'data', 'probes.json');
const SHOTS = join(ROOT, 'screens', 'probes'); mkdirSync(SHOTS, { recursive: true });
const out = existsSync(OUTF) ? JSON.parse(readFileSync(OUTF, 'utf8')) : {};
const ONLY = process.argv.slice(2);
const browser = await chromium.launch();
const wait = (p, ms) => p.waitForTimeout(ms);
const phone = { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true };
const desk = { viewport: { width: 1280, height: 800 } };
const ROUTES = ['/', '/book/', '/soho/', '/soho/menu/', '/covent-garden/', '/covent-garden/menu/', '/dubai/', '/private-dining/', '/our-story/', '/allergens/', '/accessibility/', '/privacy/', '/booking-terms/', '/this-page-does-not-exist/'];
// Returning visitor: the intro is skipped (Arrival.astro reads localStorage), so probes start on the page itself.
const returning = async (ctx) => ctx.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
const desc = `(el) => el ? (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.getAttribute('aria-label') ? '[' + el.getAttribute('aria-label') + ']' : '') + ' "' + (el.innerText || el.value || '').trim().replace(/\\s+/g, ' ').slice(0, 40) + '"') : null`;

const probes = {
  // 1. Booking drawer: branch × guests × day. Visible text, hidden-node rendering, a11y tree, Tab path, provider link.
  async booking() {
    const ctx = await browser.newContext({ ...phone, reducedMotion: 'reduce' }); await returning(ctx);
    const page = await ctx.newPage();
    await page.addInitScript(() => { window.open = (u) => { window.__opened = u; return { opener: null }; }; });
    await page.goto(BASE + '/', { waitUntil: 'load' }); await wait(page, 1500);
    const res = [];
    for (const branch of ['Soho', 'Covent Garden']) for (const size of [2, 4, 7, 8]) for (const dayIdx of [0, 3]) {
      if (!(await page.locator('dialog[data-book-drawer][open]').count())) {
        const t = page.locator('[data-book=""]:visible, [data-book]:visible').first();
        await t.evaluate((el) => el.scrollIntoView({ block: 'center' })); await t.click(); await wait(page, 500);
      }
      const where = page.locator('[data-book-where]');
      if (await where.isVisible()) await page.locator('.book-chip', { hasText: branch }).click();
      await page.evaluate((n) => { const i = document.querySelector('[data-book-size]'); i.value = String(n); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }, size);
      await page.locator('.book-day').nth(dayIdx).click(); await wait(page, 200);
      const r = await page.evaluate(() => {
        const dlg = document.querySelector('dialog[data-book-drawer]');
        const vis = (el) => { const cs = getComputedStyle(el); const b = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && b.height > 1; };
        return {
          name: dlg.querySelector('[data-book-name]').textContent,
          hiddenButRendered: [...dlg.querySelectorAll('[hidden]')].filter((el) => getComputedStyle(el).display !== 'none').map((el) => ({ el: el.className || el.tagName, display: getComputedStyle(el).display, h: Math.round(el.getBoundingClientRect().height), text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 110), focusables: el.querySelectorAll('a[href],button').length })),
          visibleNotes: [...dlg.querySelectorAll('.book-note,.book-closed,[data-book-group-text]')].filter(vis).map((el) => el.textContent.trim()),
          goVisible: vis(dlg.querySelector('[data-book-go]')), goDisabled: dlg.querySelector('[data-book-go]').getAttribute('aria-disabled'),
          groupVisible: vis(dlg.querySelector('[data-book-group]')),
          times: [...dlg.querySelectorAll('.book-time')].map((b) => b.textContent),
          day: dlg.querySelector('.book-day[aria-checked="true"]')?.getAttribute('aria-label'),
        };
      });
      // Pre-theatre note on a time inside the window (Soho 5pm, CG 4.45pm)
      const preT = branch === 'Soho' ? '5pm' : '4.45pm';
      if (dayIdx === 3 && r.times.includes(preT)) { await page.locator('.book-time', { hasText: new RegExp(`^${preT.replace('.', '\\.')}$`) }).click(); await wait(page, 100); r.preTheatreAt = preT; r.preNote = await page.evaluate(() => { const p = document.querySelector('[data-book-pre]'); return p.hidden ? null : p.textContent; }); }
      if (r.goVisible && r.goDisabled !== 'true') { await page.evaluate(() => (window.__opened = null)); await page.locator('[data-book-go]').click(); await wait(page, 300); r.opened = await page.evaluate(() => window.__opened); const ch = page.locator('[data-book-change]'); if (await ch.isVisible()) await ch.click(); }
      res.push({ branch, size, day: dayIdx === 0 ? 'today' : '+3', ...r, times: r.times.length });
    }
    // The a11y tree and Tab path at 8 guests, Soho (the group route).
    await page.locator('.book-chip', { hasText: 'Soho' }).click().catch(() => {});
    await page.evaluate(() => { const i = document.querySelector('[data-book-size]'); i.value = '2'; i.dispatchEvent(new Event('change', { bubbles: true })); });
    const aria2 = await page.locator('dialog[data-book-drawer]').ariaSnapshot();
    await page.evaluate(() => { const i = document.querySelector('[data-book-size]'); i.value = '8'; i.dispatchEvent(new Event('change', { bubbles: true })); });
    const aria8 = await page.locator('dialog[data-book-drawer]').ariaSnapshot();
    await page.screenshot({ path: join(SHOTS, 'booking-soho-8-guests--375.jpg'), type: 'jpeg', quality: 70 });
    await page.locator('[data-book-size]').focus();
    const tab = [];
    for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); tab.push(await page.evaluate(`(${desc})(document.activeElement) + ' h=' + Math.round(document.activeElement.getBoundingClientRect().height)`)); }
    await page.evaluate(() => { const i = document.querySelector('[data-book-size]'); i.value = '2'; i.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.screenshot({ path: join(SHOTS, 'booking-soho-2-guests--375.jpg'), type: 'jpeg', quality: 70 });
    // Day strip: label in name, overflow, scroll cue, selected day in view after a far pick.
    const strip = await page.evaluate(() => { const d = document.querySelector('[data-book-days]'); const chips = [...d.querySelectorAll('.book-day')]; return { scrollW: d.scrollWidth, clientW: d.clientWidth, mask: getComputedStyle(d).maskImage || getComputedStyle(d).webkitMaskImage, first: chips.slice(0, 2).map((c) => ({ visible: c.innerText.replace(/\s+/g, ' '), name: c.getAttribute('aria-label') })) }; });
    await page.locator('.book-day').nth(12).click(); await page.keyboard.press('Escape'); await wait(page, 500);
    const t2 = page.locator('[data-book]:visible').first(); await t2.click(); await wait(page, 600);
    strip.selectedInViewAfterReopen = await page.evaluate(() => { const c = document.querySelector('.book-day[aria-checked="true"]'); const d = c.parentElement.getBoundingClientRect(); const b = c.getBoundingClientRect(); return b.left >= d.left && b.right <= d.right; });
    await ctx.close();
    return { matrix: res, aria2, aria8, tabAt8: tab, strip };
  },

  // 1b. The /book/ desk with the same matrix.
  async desk() {
    const ctx = await browser.newContext({ ...phone }); await returning(ctx);
    const page = await ctx.newPage(); await page.goto(BASE + '/book/', { waitUntil: 'load' }); await wait(page, 1200);
    const res = [];
    for (const size of ['2', '4', '7', '8', '9']) for (const di of [0, 3]) {
      await page.selectOption('[data-desk-day]', { index: di }).catch(() => {}); await page.selectOption('[data-desk-size]', size); await wait(page, 150);
      res.push({ size, day: di, rows: await page.evaluate(() => [...document.querySelectorAll('[data-desk-room]')].map((el) => ({ room: JSON.parse(el.dataset.deskRoom).id, fit: el.querySelector('[data-desk-fit]').textContent.trim(), go: getComputedStyle(el.querySelector('[data-desk-go]')).display !== 'none' && !el.querySelector('[data-desk-go]').closest('[hidden]'), group: !el.querySelector('[data-desk-group]').hidden }))) });
    }
    await ctx.close(); return res;
  },

  // 2. Accessible names: does any name appear doubled in the a11y tree? (Intro plays: first visit.)
  async names() {
    const ctx = await browser.newContext({ ...desk }); const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' }); await wait(page, 600);
    const during = await page.locator('body').ariaSnapshot();
    await wait(page, 5000);
    const after = await page.locator('body').ariaSnapshot();
    const h1 = await page.locator('h1').first().ariaSnapshot();
    const raw = await page.evaluate(() => document.body.textContent.match(/F\s*F\s*A\s*A\s*T\s*T/g)?.length ?? 0);
    await ctx.close();
    const top = (s) => s.split('\n').slice(0, 40).join('\n');
    return { duringIntro: top(during), afterIntro: top(after), h1, doubledInRawText: raw, doubledInTree: /FFAA|FattFatt|PunditPundit/i.test(after) || /FFAA/i.test(during) };
  },

  // 3/4. Image inventory on home after a full scroll: alts, priorities, duplicates, bytes.
  async images() {
    const ctx = await browser.newContext({ ...desk }); await returning(ctx);
    const page = await ctx.newPage(); const bytes = {};
    page.on('response', async (r) => { if (r.request().resourceType() === 'image') { const len = Number(r.headers()['content-length'] ?? 0) || (await r.body().catch(() => Buffer.alloc(0))).length; bytes[r.url().replace(BASE, '')] = (bytes[r.url().replace(BASE, '')] ?? 0) + len; } });
    await page.goto(BASE + '/', { waitUntil: 'load' }); await wait(page, 500);
    for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 700); await wait(page, 120); }
    await wait(page, 1500);
    const imgs = await page.evaluate(() => [...document.querySelectorAll('img')].map((i) => ({ src: (i.currentSrc || i.src).replace(location.origin, ''), alt: i.getAttribute('alt'), hidden: !!i.closest('[aria-hidden="true"]'), loading: i.getAttribute('loading'), fetchpriority: i.getAttribute('fetchpriority'), natural: i.naturalWidth, rendered: Math.round(i.getBoundingClientRect().width), display: getComputedStyle(i).display })));
    const counts = {}; for (const i of imgs) counts[i.src] = (counts[i.src] ?? 0) + 1;
    const requests = Object.entries(bytes).map(([u, b]) => ({ u, kb: Math.round(b / 1024) })).sort((a, b) => b.kb - a.kb);
    await ctx.close();
    return { count: imgs.length, emptyAltVisibleToAT: imgs.filter((i) => i.alt === '' && !i.hidden), missingAlt: imgs.filter((i) => i.alt === null), highPriority: imgs.filter((i) => i.fetchpriority === 'high'), duplicatesInDom: Object.entries(counts).filter(([, n]) => n > 1), oversized: imgs.filter((i) => i.natural > 0 && i.rendered > 0 && i.natural > i.rendered * 2.5).map((i) => `${i.src} ${i.natural}→${i.rendered}`), totalImageKB: requests.reduce((s, r) => s + r.kb, 0), requested: requests.length, top: requests.slice(0, 12), downloadedTwice: Object.keys(bytes).length };
  },

  // 5. Home DOM weight and the menu copies.
  async homedom() {
    const html = await (await fetch(BASE + '/')).text();
    const ctx = await browser.newContext({ ...desk }); await returning(ctx);
    const page = await ctx.newPage(); await page.goto(BASE + '/', { waitUntil: 'load' }); await wait(page, 1000);
    await page.evaluate(() => document.getElementById('menu')?.scrollIntoView()); await wait(page, 3000);
    const d = await page.evaluate(() => ({ nodes: document.getElementsByTagName('*').length, continued: [...document.querySelectorAll('h2,h3,h4,p,span')].filter((e) => /continued/i.test(e.textContent) && e.children.length === 0).length, menuNodes: document.getElementById('menu')?.getElementsByTagName('*').length, hiddenMenuNodes: [...document.querySelectorAll('#menu [aria-hidden="true"]')].reduce((s, e) => s + e.getElementsByTagName('*').length, 0) }));
    await ctx.close();
    return { htmlKB: Math.round(html.length / 1024), dishMentionsInHtml: (html.match(/£\d/g) ?? []).length, continuedInHtml: (html.match(/continued/gi) ?? []).length, ...d };
  },

  // 6. No JavaScript: is every page readable and navigable?
  async nojs() {
    const ctx = await browser.newContext({ ...phone, javaScriptEnabled: false }); const res = [];
    for (const r of ROUTES) {
      const page = await ctx.newPage(); await page.goto(BASE + r, { waitUntil: 'load' });
      const d = await page.evaluate(() => { const ov = document.querySelector('.arrival'); const h1 = document.querySelector('h1'); return { overlayCovers: ov ? getComputedStyle(ov).display !== 'none' && ov.getBoundingClientRect().height > 300 : false, h1Opacity: h1 ? getComputedStyle(h1).opacity : null, h1: h1?.textContent.trim().slice(0, 40), links: document.querySelectorAll('a[href]').length, invisibleText: [...document.querySelectorAll('main h2, main p')].filter((e) => getComputedStyle(e).opacity === '0').length }; });
      if (r === '/' || r === '/soho/') await page.screenshot({ path: join(SHOTS, `nojs-${r === '/' ? 'home' : 'soho'}--375.jpg`), type: 'jpeg', quality: 70 });
      res.push({ route: r, ...d }); await page.close();
    }
    await ctx.close(); return res;
  },

  // 7. Intro timing, Skip, first paint (first visit, motion on).
  async intro() {
    const res = {};
    for (const [n, opt] of [['375', phone], ['1280', desk]]) for (const motion of ['no-preference', 'reduce']) {
      const ctx = await browser.newContext({ ...opt, reducedMotion: motion }); const page = await ctx.newPage();
      await page.addInitScript(() => { window.__lcp = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push({ t: Math.round(e.startTime), el: e.element?.tagName + '.' + (e.element?.className?.baseVal ?? e.element?.className ?? '') }))).observe({ type: 'largest-contentful-paint', buffered: true }); });
      const t0 = Date.now(); await page.goto(BASE + '/', { waitUntil: 'commit' });
      let skipVisibleAt = null; let goneAt = null;
      for (let i = 0; i < 120; i++) {
        const s = await page.evaluate(() => { const ov = document.querySelector('.arrival'); const sk = document.querySelector('[data-skip]'); return { ov: ov ? getComputedStyle(ov).display !== 'none' && getComputedStyle(ov).opacity !== '0' && ov.getBoundingClientRect().height > 0 : false, sk: sk ? sk.getBoundingClientRect().height > 0 && getComputedStyle(sk).visibility !== 'hidden' : false, state: document.documentElement.dataset.arrival }; }).catch(() => ({}));
        if (s.sk && skipVisibleAt === null) skipVisibleAt = Date.now() - t0;
        if (!s.ov && i > 2) { goneAt = Date.now() - t0; break; }
        await wait(page, 50);
      }
      const firstTab = []; await page.keyboard.press('Tab'); firstTab.push(await page.evaluate(`(${desc})(document.activeElement)`)); await page.keyboard.press('Tab'); firstTab.push(await page.evaluate(`(${desc})(document.activeElement)`));
      res[`${n}-${motion}`] = { skipVisibleAtMs: skipVisibleAt, overlayGoneAtMs: goneAt, lcp: await page.evaluate(() => window.__lcp), firstTab };
      await ctx.close();
    }
    // Skip by keyboard on a first visit
    const ctx = await browser.newContext({ ...desk }); const page = await ctx.newPage(); await page.goto(BASE + '/', { waitUntil: 'load' });
    const t = Date.now(); await page.locator('[data-skip]').focus().catch(() => {}); await page.keyboard.press('Enter');
    await page.waitForFunction(() => { const ov = document.querySelector('.arrival'); return !ov || getComputedStyle(ov).display === 'none' || getComputedStyle(ov).opacity === '0'; }, null, { timeout: 5000 }).catch(() => {});
    res.skipByEnterMs = Date.now() - t;
    // Wipe hint: does it show on a phone where vertical swipes scroll?
    await ctx.close();
    const pc = await browser.newContext({ ...phone }); await returning(pc); const pp = await pc.newPage(); await pp.goto(BASE + '/', { waitUntil: 'load' }); await wait(pp, 4000);
    res.wipeHintOnPhone = await pp.evaluate(() => [...document.querySelectorAll('*')].filter((e) => /wipe the glass/i.test(e.textContent) && e.children.length === 0).map((e) => ({ text: e.textContent.trim(), visible: e.getBoundingClientRect().height > 0 && getComputedStyle(e).opacity !== '0' })));
    await pp.screenshot({ path: join(SHOTS, 'hero-wipe-hint--375.jpg'), type: 'jpeg', quality: 70 });
    await pc.close();
    return res;
  },

  // 8. Skip links: order and targets on every route.
  async skiplinks() {
    const ctx = await browser.newContext({ ...desk }); await returning(ctx); const res = [];
    for (const r of ROUTES) {
      const page = await ctx.newPage(); await page.goto(BASE + r, { waitUntil: 'load' }); await wait(page, 500);
      const d = await page.evaluate(() => ({ skips: [...document.querySelectorAll('a.skip, a[class*="skip"]')].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href'), target: !!document.getElementById(a.getAttribute('href').slice(1)) })), mainId: document.querySelector('main')?.id || null }));
      const tab = []; for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); tab.push(await page.evaluate(`(${desc})(document.activeElement)`)); }
      res.push({ route: r, ...d, firstTabs: tab }); await page.close();
    }
    await ctx.close(); return res;
  },

  // 9. Dialogs: modal, Tab containment, Esc, focus return, scroll lock (motion on and off).
  async dialogs() {
    const res = [];
    for (const motion of ['no-preference', 'reduce']) for (const [name, sel] of [['site-menu', '[data-index-open]:visible'], ['menus', '[data-menus-open]:visible'], ['book', '[data-book]:visible']]) for (const r of ['/', '/soho/']) {
      const ctx = await browser.newContext({ ...phone, reducedMotion: motion }); await returning(ctx); const page = await ctx.newPage();
      await page.goto(BASE + r, { waitUntil: 'load' }); await wait(page, 800);
      const t = page.locator(sel).first(); if (!(await t.count())) { await ctx.close(); continue; }
      await t.evaluate((el) => el.scrollIntoView({ block: 'center' })); await wait(page, 300);
      await t.focus(); const trig = await page.evaluate(`(${desc})(document.activeElement)`);
      await page.keyboard.press('Enter'); await wait(page, 600);
      const open = await page.evaluate(() => { const d = document.querySelector('dialog[open]'); return d ? { modal: d.matches(':modal'), ariaModal: d.getAttribute('aria-modal') } : null; });
      let escaped = 0; for (let i = 0; i < 30; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]')))) escaped++; }
      const y0 = await page.evaluate(() => scrollY); await page.mouse.move(10, 200); await page.mouse.wheel(0, 900); await wait(page, 500); const y1 = await page.evaluate(() => scrollY);
      await page.keyboard.press('Escape'); await wait(page, 700);
      const after = await page.evaluate(`({ closed: !document.querySelector('dialog[open]'), focus: (${desc})(document.activeElement) })`);
      res.push({ motion, dialog: name, route: r, trigger: trig, open, tabEscapes: escaped, pageScrolledBehind: y1 !== y0, escCloses: after.closed, focusReturned: after.focus === trig, focusAfter: after.focus });
      await ctx.close();
    }
    return res;
  },

  // 10. Hours and "today" follow London, not the visitor's clock (visitor in New York at 19:30 = 00:30 London, 25 Nov).
  async hours() {
    const ctx = await browser.newContext({ ...desk, timezoneId: 'America/New_York' }); await returning(ctx); const page = await ctx.newPage();
    await page.clock.install({ time: new Date('2026-11-25T00:30:00Z') });
    await page.goto(BASE + '/soho/', { waitUntil: 'load' }); await wait(page, 1500);
    const visit = await page.evaluate(() => [...document.querySelectorAll('*')].filter((e) => /^Today/.test(e.textContent.trim()) && e.children.length === 0).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).slice(0, 6));
    const pill = await page.evaluate(() => [...document.querySelectorAll('*')].filter((e) => /(Open now|Closed|Opens|Closes)/.test(e.textContent) && e.children.length === 0).map((e) => e.textContent.trim()).slice(0, 6));
    const t = page.locator('[data-book]:visible').first(); await t.click(); await wait(page, 600);
    const firstDay = await page.evaluate(() => document.querySelector('.book-day')?.getAttribute('aria-label'));
    await ctx.close();
    return { visitorClock: 'New York 19:30 Tue 24 Nov = London 00:30 Wed 25 Nov', todayLines: visit, statusLines: pill, drawerFirstDay: firstDay };
  },
};

for (const [k, fn] of Object.entries(probes)) {
  if (ONLY.length && !ONLY.includes(k)) continue;
  const t = Date.now();
  try { out[k] = await fn(); console.log(`ok   ${k} (${Math.round((Date.now() - t) / 1000)}s)`); }
  catch (e) { out[k] = { error: String(e).slice(0, 400) }; console.log(`FAIL ${k}: ${String(e).slice(0, 200)}`); }
  writeFileSync(OUTF, JSON.stringify(out, null, 1));
}
await browser.close();
