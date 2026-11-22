// Phase 10 functional regression. Usage: node functional.mjs  (env BASE, CHROME_PATH, DIST, EXTERNAL=0)
// Needs playwright-core beside it (or in a parent node_modules) and `astro preview` on BASE.
// Checks: every internal link/asset in dist resolves; hash targets exist; sitemap/robots; head tags and
// JSON-LD; navigation chrome; skip link; Book desk + drawer; menu search/filters/picker/passport;
// group enquiry validation + mailto fallback; Dubai list; 404; Pause motion; Lights on; console errors.
import { chromium } from 'playwright-core';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const DIST = process.env.DIST ?? join(import.meta.dirname, '..', '..', '..', 'dist');
const CHROME = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : '/usr/bin/google-chrome');
const PAGES = ['/', '/soho/', '/covent-garden/', '/dubai/', '/soho/menu/', '/covent-garden/menu/', '/book/', '/private-dining/', '/our-story/', '/accessibility/', '/allergens/', '/booking-terms/', '/privacy/'];

const results = [];
const ok = (name, detail = '') => results.push({ name, pass: true, detail });
const fail = (name, detail = '') => results.push({ name, pass: false, detail });
const test = async (name, fn) => { try { const d = await fn(); ok(name, d ?? ''); } catch (e) { fail(name, String(e.message ?? e).split('\n')[0].slice(0, 300)); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

// ---------- 1. Static crawl of dist: links, assets, hash targets ----------
const htmlFiles = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) htmlFiles.push(p); } })(DIST);
const pageOf = (file) => '/' + file.slice(DIST.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
const ids = new Map(); // page -> Set(ids)
const refs = new Map(); // url -> [pages]
const external = new Map(); // href -> {pages, attrs}
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  const page = pageOf(f);
  ids.set(page, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  // Scripts' text is skipped (template literals such as `#eq-${n}` are not links); the 404 page's own #hash links are not fetched as /404.
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (s) => s.replace(/>[\s\S]*</, '><'));
  for (const m of markup.matchAll(/<(a|link|img|script|source|video|iframe|form)\b([^>]*)>/g)) {
    const attrs = m[2];
    const urls = [];
    for (const a of attrs.matchAll(/\s(href|src|action|poster|data-poster)="([^"]*)"/g)) urls.push(a[2]);
    for (const a of attrs.matchAll(/\ssrcset="([^"]*)"/g)) for (const part of a[1].split(',')) urls.push(part.trim().split(/\s+/)[0]);
    for (const u of urls) {
      if (!u || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('javascript:')) continue;
      if (/^https?:\/\//.test(u)) { const e = external.get(u) ?? { pages: new Set(), attrs: new Set() }; e.pages.add(page); e.attrs.add(attrs.includes('target="_blank"') ? (attrs.includes('rel="noopener') ? 'blank+noopener' : 'blank-NO-NOOPENER') : 'same-tab'); external.set(u, e); continue; }
      if (u.startsWith('#') && page === '/404') continue; // the 404 page is not a URL of its own
      const key = u.startsWith('#') ? page + u : u;
      (refs.get(key) ?? refs.set(key, []).get(key)).push(page);
    }
  }
}
const broken = [];
const hashMissing = [];
for (const [u, pages] of refs) {
  const [path, hash] = u.split('#');
  const clean = path.split('?')[0];
  if (hash !== undefined && hash && !hash.includes('/')) {
    const target = (clean.startsWith('/') ? clean : clean).replace(/index\.html$/, '');
    const set = ids.get(target.endsWith('/') || !target.includes('.') ? (target.endsWith('/') ? target : target + '/') : target);
    if (set && !set.has(hash) && hash !== 'top') hashMissing.push(`${u} (from ${[...new Set(pages)].join(',')})`);
    if (!set && target) { /* checked by fetch below */ }
  }
  if (!clean) continue;
  const res = await fetch(BASE + (clean.startsWith('/') ? clean : '/' + clean), { method: 'GET', redirect: 'manual' });
  if (res.status !== 200) broken.push(`${res.status} ${clean} (from ${[...new Set(pages)].slice(0, 3).join(',')})`);
}
await test('crawl: every internal link and asset in dist returns 200', () => { assert(!broken.length, broken.join(' | ')); return `${refs.size} urls`; });
await test('crawl: every same-page #hash link has a target id', () => { assert(!hashMissing.length, hashMissing.join(' | ')); });
const noNoopener = [...external].filter(([, e]) => e.attrs.has('blank-NO-NOOPENER')).map(([u]) => u);
await test('crawl: every target=_blank external link has rel=noopener', () => { assert(!noNoopener.length, noNoopener.join(' | ')); return `${external.size} external urls`; });
const insecure = [...external.keys()].filter((u) => u.startsWith('http://'));
await test('crawl: no http:// external link', () => { assert(!insecure.length, insecure.join(' | ')); });
if (process.env.EXTERNAL !== '0') {
  const hosts = [...new Set([...external.keys()].map((u) => new URL(u).origin))];
  const bad = [];
  for (const h of hosts) {
    try { const r = await fetch(h, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 link-check' } }); if (r.status >= 500) bad.push(`${r.status} ${h}`); } catch (e) { bad.push(`${h}: ${e.message}`); }
  }
  await test('external hosts reachable (origin GET, not the deep link)', () => { assert(!bad.length, bad.join(' | ')); return hosts.join(' '); });
}

// ---------- 2. sitemap, robots, 404, redirects config ----------
await test('sitemap.xml lists every public page and each returns 200', async () => {
  const xml = await (await fetch(BASE + '/sitemap.xml')).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const missing = PAGES.filter((p) => !locs.includes(p));
  assert(!missing.length, 'missing from sitemap: ' + missing.join(','));
  const bad = [];
  for (const l of locs) { const r = await fetch(BASE + l); if (r.status !== 200) bad.push(`${r.status} ${l}`); }
  assert(!bad.length, bad.join(' | '));
  return `${locs.length} urls`;
});
await test('robots.txt is served', async () => { const t = await (await fetch(BASE + '/robots.txt')).text(); assert(/User-agent/i.test(t), t.slice(0, 80)); return t.replace(/\n/g, ' / ').slice(0, 120); });
await test('unknown URL returns 404 with the Lost luggage page', async () => { const r = await fetch(BASE + '/no-such-page/'); assert(r.status === 404, 'status ' + r.status); const t = await r.text(); assert(t.includes('Lost luggage'), 'no Lost luggage'); });
await test('/dubai/menu/ (not a route) returns 404', async () => { const r = await fetch(BASE + '/dubai/menu/'); assert(r.status === 404, 'status ' + r.status); });
await test('vercel.json carries every old URL from docs/redirects.csv', () => {
  const v = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'vercel.json'), 'utf8'));
  const csv = readFileSync(join(import.meta.dirname, '..', '..', 'redirects.csv'), 'utf8').split('\n').slice(1).filter(Boolean);
  const want = csv.map((l) => l.split(',')).filter((c) => c[2] === '301').map((c) => [c[0], c[1]]);
  const have = new Map(v.redirects.map((r) => [r.source, r.destination]));
  const miss = want.filter(([s, d]) => have.get(s) !== d).map(([s, d]) => `${s} -> ${d}`);
  assert(!miss.length, miss.join(' | '));
  return `${want.length} redirects`;
});

// ---------- 3. Browser tests ----------
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const ctxOf = (w, h, mobile, opts = {}) => browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, ...opts });
const errs = (page) => { const list = []; page.on('pageerror', (e) => list.push('pageerror: ' + e.message)); page.on('console', (m) => m.type() === 'error' && list.push(m.text())); page.on('response', (r) => r.status() >= 400 && list.push(`${r.status()} ${r.url()} (${r.request().resourceType()})`)); return list; };

// 3a. Head tags, JSON-LD, console errors, first visit with full motion (arrival board plays)
for (const [w, h, mob] of [[390, 844, true], [1440, 900, false]]) {
  const ctx = await ctxOf(w, h, mob);
  const seenTitles = new Map();
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const errors = errs(page);
    await test(`${w} ${path}: loads, head tags, JSON-LD, no console errors (full motion, first visit)`, async () => {
      await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(2200);
      await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
      await page.waitForTimeout(500);
      const d = await page.evaluate(() => ({
        title: document.title, desc: document.querySelector('meta[name=description]')?.content ?? '', canon: document.querySelector('link[rel=canonical]')?.href ?? '',
        h1: document.querySelectorAll('h1').length, lang: document.documentElement.lang, og: document.querySelector('meta[property="og:image"]')?.content ?? '',
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { const j = JSON.parse(s.textContent); return j['@type'] ?? (Array.isArray(j['@graph']) ? 'graph' : '?'); } catch { return 'INVALID'; } }),
        skip: (() => { const a = document.querySelector('a.skip[href^="#"]'); return a ? !!document.getElementById(a.getAttribute('href').slice(1)) : false; })(), main: !!document.querySelector('main'),
      }));
      assert(d.title && d.title.length <= 75, 'title ' + d.title.length);
      assert(d.desc.length >= 30 && d.desc.length <= 165, 'description ' + d.desc.length);
      assert(new URL(d.canon).pathname === path, 'canonical ' + d.canon);
      assert(d.h1 === 1, 'h1 count ' + d.h1);
      assert(d.lang === 'en-GB', 'lang ' + d.lang);
      assert(!d.ld.includes('INVALID'), 'invalid JSON-LD');
      assert(d.main, 'no <main>');
      assert(d.skip, 'no skip link, or its target id is missing');
      if (seenTitles.has(d.title) && seenTitles.get(d.title) !== path) throw new Error('duplicate title with ' + seenTitles.get(d.title));
      seenTitles.set(d.title, path);
      const real = errors.filter((e) => !/ERR_ABORTED/.test(e) && !/^Failed to load resource/.test(e)); // the 404 line names the URL instead
      assert(!real.length, real.slice(0, 2).join(' ; '));
      return `title "${d.title}" ld=${d.ld.join('+') || 'none'}`;
    });
    await page.close();
  }
  await ctx.close();
}

// 3b. Chrome: header nav, menus dropdown, index dialog, dock, skip link
{
  const ctx = await ctxOf(1440, 900, false);
  const page = await ctx.newPage();
  await page.goto(BASE + '/our-story/', { waitUntil: 'load' });
  await test('1440: header has rooms, Menus, Groups, Book; Index opens and closes with Escape; Menus dropdown opens', async () => {
    const nav = await page.evaluate(() => [...document.querySelectorAll('header nav[aria-label=Main] a, header nav[aria-label=Main] summary')].map((a) => a.textContent.trim().replace(/\s+/g, ' ')));
    for (const want of ['Soho', 'Covent Garden', 'Dubai', 'Menus', 'Groups', 'Book']) assert(nav.some((n) => n.includes(want)), `nav missing ${want}: ${nav.join('|')}`);
    // The Index link shows under 920 px only; wider screens open it from the dock-less header? No: the full nav replaces it. Open it by script to test the dialog itself.
    await page.evaluate(() => document.querySelector('[data-index]').showModal());
    await page.waitForTimeout(300);
    assert(await page.evaluate(() => document.querySelector('[data-index]').open), 'index not open');
    const inside = await page.evaluate(() => document.querySelector('[data-index]').contains(document.activeElement));
    assert(inside, 'focus not inside index dialog');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert(!(await page.evaluate(() => document.querySelector('[data-index]').open)), 'index still open after Escape');
    await page.click('header [data-menus-pop] summary');
    await page.waitForTimeout(200);
    const links = await page.evaluate(() => document.querySelector('[data-menus-pop]').open ? [...document.querySelectorAll('[data-menus-pop] a')].map((a) => a.getAttribute('href')) : []);
    assert(links.includes('/soho/menu/') && links.includes('/covent-garden/menu/'), 'menus dropdown links ' + links.join(','));
    await page.keyboard.press('Escape');
    assert(!(await page.evaluate(() => document.querySelector('[data-menus-pop]').open)), 'dropdown still open after Escape');
    return nav.join(' | ');
  });
  await test('1440: skip link is the first Tab stop and moves focus to main', async () => {
    await page.goto(BASE + '/allergens/', { waitUntil: 'load' });
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement?.className + ':' + document.activeElement?.textContent.trim());
    assert(first.startsWith('skip'), 'first stop ' + first);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => ({ hash: location.hash, active: document.activeElement?.id || document.activeElement?.tagName, y: scrollY }));
    assert(after.hash === '#content' || after.active === 'content', JSON.stringify(after));
    return JSON.stringify(after);
  });
  await test('1440: header Book opens the drawer on a text page', async () => {
    await page.click('header a.nav-book');
    await page.waitForTimeout(400);
    assert(await page.evaluate(() => document.querySelector('[data-book-drawer]').open), 'drawer not open');
    await page.keyboard.press('Escape');
  });
  await page.close();
  await ctx.close();
}
{
  const ctx = await ctxOf(390, 844, true);
  const page = await ctx.newPage();
  await test('390: dock on home shows Menus, Rooms, Book; Menus opens the room sheet; Rooms opens Index', async () => {
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.evaluate(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
    await page.waitForTimeout(2500);
    const dock = await page.evaluate(() => { const d = document.querySelector('[data-dock]'); const r = d.getBoundingClientRect(); return { items: [...d.querySelectorAll('a')].map((a) => a.textContent.trim()), visible: getComputedStyle(d).display !== 'none' && r.height > 0 && r.bottom <= innerHeight + 1, h: r.height }; });
    assert(dock.visible, 'dock not visible ' + JSON.stringify(dock));
    assert(dock.items.join() === 'Menus,Rooms,Book', dock.items.join());
    await page.click('[data-dock] [data-menus-open]');
    await page.waitForTimeout(300);
    assert(await page.evaluate(() => document.querySelector('[data-menus]').open), 'menus sheet not open');
    await page.click('[data-menus] [data-sheet-close]');
    await page.click('[data-dock] [data-index-open]');
    await page.waitForTimeout(300);
    assert(await page.evaluate(() => document.querySelector('[data-index]').open), 'index not open');
    await page.click('[data-index] [data-sheet-close]');
    return JSON.stringify(dock);
  });
  await test('390: on /soho/ the dock and header Book stay away while the hero is on screen, then appear', async () => {
    await page.goto(BASE + '/soho/', { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const before = await page.evaluate(() => ({ hero: document.documentElement.dataset.hero, dockVis: (() => { const d = document.querySelector('[data-dock]'); const cs = getComputedStyle(d); return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0' && d.getBoundingClientRect().top < innerHeight; })(), heroBook: !!document.querySelector('section[data-room-hero] [data-book]') }));
    assert(before.hero === 'in', 'hero state ' + before.hero);
    assert(!before.dockVis, 'dock visible over the hero');
    assert(before.heroBook, 'hero has no Book');
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => ({ hero: document.documentElement.dataset.hero, dockVis: (() => { const d = document.querySelector('[data-dock]'); const cs = getComputedStyle(d); return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0' && d.getBoundingClientRect().top < innerHeight; })() }));
    assert(after.hero === 'out' && after.dockVis, JSON.stringify(after));
    return `before ${JSON.stringify(before)} after ${JSON.stringify(after)}`;
  });
  await page.close();
  await ctx.close();
}

// 3c. Booking desk
{
  const ctx = await ctxOf(1440, 900, false);
  const page = await ctx.newPage();
  await test('/book/?branch=soho opens the drawer with Soho chosen; Escape leaves the guest on the desk', async () => {
    await page.goto(BASE + '/book/?branch=soho', { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const d = await page.evaluate(() => ({ open: document.querySelector('[data-book-drawer]').open, where: document.querySelector('[data-book-drawer] input[name=where]:checked')?.value, name: document.querySelector('[data-book-name]')?.textContent }));
    assert(d.open && d.where === 'soho', JSON.stringify(d));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert(new URL(page.url()).pathname === '/book/', 'left the desk');
    return JSON.stringify(d);
  });
  await test('/book/?branch=covent-garden opens the drawer with Covent Garden chosen', async () => {
    await page.goto(BASE + '/book/?branch=covent-garden', { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const where = await page.evaluate(() => document.querySelector('[data-book-drawer]').open && document.querySelector('[data-book-drawer] input[name=where]:checked')?.value);
    assert(where === 'covent-garden', 'where ' + where);
    await page.keyboard.press('Escape');
  });
  await test('desk picker: day/time/guests fill each room link; 12 guests routes to the group form', async () => {
    await page.goto(BASE + '/book/', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const shown = await page.evaluate(() => !document.querySelector('[data-desk-when]').hidden);
    assert(shown, 'picker hidden');
    const times = await page.evaluate(() => document.querySelectorAll('[data-desk-time] option').length);
    assert(times > 3, 'time options ' + times);
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('[data-desk-go]')].map((a) => a.href));
    assert(hrefs.some((h) => /opentable\.co\.uk.*covers=2/.test(h)), 'soho link ' + hrefs[0]);
    assert(hrefs.some((h) => /sevenrooms\.com.*party_size=2/.test(h)), 'cg link ' + hrefs[1]);
    await page.fill('[data-desk-size]', '12');
    await page.waitForTimeout(200);
    const big = await page.evaluate(() => [...document.querySelectorAll('[data-desk-room]')].map((el) => ({ fit: el.querySelector('[data-desk-fit]').textContent, href: el.querySelector('[data-desk-go]').getAttribute('href'), target: el.querySelector('[data-desk-go]').target })));
    assert(big.every((b) => b.href.startsWith('/private-dining/?') && b.href.includes('guests=12') && !b.target), JSON.stringify(big));
    return big.map((b) => b.fit).join(' | ');
  });
  await test('drawer: 9 guests shows the group route (enquiry link), 2 guests shows Find a table', async () => {
    await page.goto(BASE + '/soho/', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.click('section[data-room-hero] [data-book]');
    await page.waitForTimeout(400);
    await page.fill('[data-book-size]', '9');
    await page.dispatchEvent('[data-book-size]', 'input');
    await page.waitForTimeout(300);
    const g = await page.evaluate(() => ({ group: !document.querySelector('[data-book-group]').hidden, go: document.querySelector('[data-book-go-wrap]').hidden, href: document.querySelector('[data-book-enquire]').getAttribute('href'), text: document.querySelector('[data-book-group-text]').textContent }));
    assert(g.group && g.go && g.href.startsWith('/private-dining/'), JSON.stringify(g));
    await page.fill('[data-book-size]', '2');
    await page.dispatchEvent('[data-book-size]', 'input');
    await page.waitForTimeout(300);
    const s = await page.evaluate(() => ({ group: !document.querySelector('[data-book-group]').hidden, go: document.querySelector('[data-book-go-wrap]').hidden }));
    assert(!s.group && !s.go, JSON.stringify(s));
    await page.keyboard.press('Escape');
    return g.text;
  });
  await page.close();
  await ctx.close();
}

// 3d. Menu page
for (const [w, h, mob] of [[390, 844, true], [1440, 900, false]]) {
  const ctx = await ctxOf(w, h, mob);
  const page = await ctx.newPage();
  await page.goto(BASE + '/soho/menu/', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const visibleItems = () => page.evaluate(() => [...document.querySelectorAll('[data-dish]')].filter((li) => li.getBoundingClientRect().height > 0).map((li) => li.dataset.dish));
  await test(`${w} menu: one menu shown at a time; search finds momo across menus; empty state + Clear filters`, async () => {
    const blocks = await page.evaluate(() => [...document.querySelectorAll('[data-menu-block]')].map((b) => ({ id: b.id, vis: b.getBoundingClientRect().height > 0 })));
    assert(blocks.filter((b) => b.vis).length === 1, 'visible menus ' + JSON.stringify(blocks));
    await page.fill('[data-menu-q]', 'momo');
    await page.waitForTimeout(400);
    const items = await visibleItems();
    assert(items.length > 0 && items.every((i) => /momo/.test(i)), 'momo results ' + items.join(','));
    const count = await page.evaluate(() => document.querySelector('[data-menu-count]').textContent);
    await page.fill('[data-menu-q]', 'zzzzqq');
    await page.waitForTimeout(400);
    const empty = await page.evaluate(() => !document.querySelector('[data-menu-empty]').hidden);
    assert(empty, 'no empty state');
    await page.click('[data-menu-clear]');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ q: document.querySelector('[data-menu-q]').value, empty: document.querySelector('[data-menu-empty]').hidden, n: [...document.querySelectorAll('[data-dish]')].filter((li) => li.getBoundingClientRect().height > 0).length }));
    assert(after.q === '' && after.empty && after.n > 5, JSON.stringify(after));
    return `${items.length} momo items, "${count}"`;
  });
  await test(`${w} menu: diet chip (vg) hides everything without the tag`, async () => {
    const chip = page.locator('.menu-diet label', { hasText: 'Vegan' }).first();
    await chip.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await chip.click();
    await page.waitForTimeout(400);
    const tags = await page.evaluate(() => [...document.querySelectorAll('[data-dish]')].filter((li) => li.getBoundingClientRect().height > 0).map((li) => li.dataset.tags));
    assert(tags.length > 0 && tags.every((t) => t.toLowerCase().split(' ').includes('vg')), 'vg filter ' + tags.slice(0, 5).join('|'));
    await chip.click();
    await page.waitForTimeout(300);
    return `${tags.length} vg dishes`;
  });
  await test(`${w} menu: switching menu via the ${mob ? 'phone picker' : 'menu links'} shows that menu`, async () => {
    if (mob) { await page.click('[data-menu-pick]'); await page.waitForTimeout(200); assert(await page.evaluate(() => document.getElementById('menu-nav').classList.contains('is-open')), 'picker did not open'); }
    const target = await page.evaluate(() => [...document.querySelectorAll('[data-menu-link]')].map((a) => a.getAttribute('href'))[1]);
    await page.click(`[data-menu-link][href="${target}"]`);
    await page.waitForTimeout(400);
    const sel = await page.evaluate(() => [...document.querySelectorAll('[data-menu-block]')].filter((b) => b.getBoundingClientRect().height > 0).map((b) => '#' + b.id));
    assert(sel.length === 1 && sel[0] === target, `shown ${sel.join(',')} wanted ${target}`);
    const cur = await page.evaluate(() => document.querySelector('[data-menu-current]')?.textContent);
    return `${target} current="${cur}"`;
  });
  await test(`${w} menu: dish passport stamps a dish, opens, clears`, async () => {
    const stamp = page.locator('[data-menu-block].is-sel .pp-stamp:visible').first();
    await stamp.evaluate((el) => el.scrollIntoView({ block: 'center' })); // clear of the sticky picker and the dock
    await page.waitForTimeout(200);
    await stamp.click();
    await page.waitForTimeout(300);
    const n = await page.evaluate(() => ({ n: document.querySelector('[data-pp-n]').textContent, hidden: document.querySelector('[data-passport]').hidden, stored: localStorage.getItem('fp-passport') }));
    assert(n.n === '1' && !n.hidden && n.stored?.includes('soho'), JSON.stringify(n));
    await page.click('[data-pp-open]');
    await page.waitForTimeout(300);
    const li = await page.evaluate(() => ({ open: document.querySelector('[data-pp-dlg]').open, items: document.querySelectorAll('[data-pp-list] li').length }));
    assert(li.open && li.items === 1, JSON.stringify(li));
    await page.click('[data-pp-clear]');
    await page.waitForTimeout(200);
    await page.click('[data-pp-close]');
    return JSON.stringify(n);
  });
  await page.close();
  await ctx.close();
}

// 3e. Group enquiry form
{
  const ctx = await ctxOf(390, 844, true);
  const page = await ctx.newPage();
  await test('group form: empty submit lists 4 things to fix with links, marks fields invalid, typing clears the error', async () => {
    await page.goto(BASE + '/private-dining/', { waitUntil: 'load' });
    await page.click('[data-enquiry-send]');
    await page.waitForTimeout(300);
    const s = await page.evaluate(() => ({ alert: document.querySelector('[data-enquiry-top] [role=alert]')?.textContent.trim().slice(0, 60), links: document.querySelectorAll('[data-enquiry-top] a').length, invalid: [...document.querySelectorAll('[aria-invalid=true]')].map((i) => i.name), focused: document.activeElement?.getAttribute('role') }));
    assert(s.alert?.startsWith('4 things to fix') && s.links === 4 && s.invalid.length === 4 && s.focused === 'alert', JSON.stringify(s));
    await page.fill('#eq-name', 'Test Guest');
    await page.waitForTimeout(100);
    const cleared = await page.evaluate(() => ({ inv: document.getElementById('eq-name').getAttribute('aria-invalid'), msg: document.getElementById('eq-name-msg').hidden }));
    assert(cleared.inv === 'false' && cleared.msg, JSON.stringify(cleared));
    return JSON.stringify(s);
  });
  await test('group form: ?branch=covent-garden&guests=12&date prefills; valid submit falls back to the email app (no endpoint)', async () => {
    const date = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
    await page.goto(BASE + `/private-dining/?branch=covent-garden&guests=12&date=${date}&time=19:30`, { waitUntil: 'load' });
    const pre = await page.evaluate(() => ({ room: document.querySelector('input[name=restaurant]:checked')?.dataset.id, guests: document.getElementById('eq-guests').value, date: document.getElementById('eq-date').value, time: document.getElementById('eq-time').value }));
    assert(pre.room === 'covent-garden' && pre.guests === '12' && pre.date === date && pre.time === '19:30', JSON.stringify(pre));
    await page.fill('#eq-name', 'Test Guest');
    await page.fill('#eq-email', 'guest@example.com');
    const navs = [];
    page.on('request', (r) => r.isNavigationRequest() && navs.push(r.url()));
    await page.click('[data-enquiry-send]');
    await page.waitForTimeout(600);
    const st = await page.evaluate(() => document.querySelector('[data-enquiry-top] [role=status]')?.textContent.trim().slice(0, 80));
    assert(st?.startsWith('Your email app should open now'), 'status ' + st);
    assert(new URL(page.url()).pathname === '/private-dining/', 'navigated away');
    return `${JSON.stringify(pre)} status="${st}"`;
  });
  await page.close();
  await ctx.close();
}

// 3f. Dubai, pause motion, lights on, home hero + passes
{
  const ctx = await ctxOf(1440, 900, false);
  const page = await ctx.newPage();
  await test('/dubai/: no list form without PUBLIC_DUBAI_LIST_ENDPOINT, the page says so; clock and Book in London present', async () => {
    await page.goto(BASE + '/dubai/', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const d = await page.evaluate(() => ({ form: !!document.querySelector('[data-waitlist]'), wl: document.getElementById('waitlist')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 160), clock: document.querySelector('[data-branch-clock]')?.textContent.trim(), london: [...document.querySelectorAll('a[href^="/soho/"], a[href^="/covent-garden/"]')].length }));
    assert(!d.form, 'a list form is rendered without an endpoint');
    assert(d.wl && d.wl.length > 10, 'no #waitlist text');
    assert(d.clock, 'clock empty');
    assert(d.london >= 2, 'no London links');
    return JSON.stringify(d);
  });
  await test('footer Pause motion: toggles html[data-motion], persists across reload, pauses videos', async () => {
    await page.goto(BASE + '/covent-garden/', { waitUntil: 'load' });
    await page.locator('[data-motion-toggle]').scrollIntoViewIfNeeded();
    await page.click('[data-motion-toggle]');
    await page.waitForTimeout(200);
    const a = await page.evaluate(() => ({ m: document.documentElement.dataset.motion, pressed: document.querySelector('[data-motion-toggle]').getAttribute('aria-pressed'), text: document.querySelector('[data-motion-toggle]').textContent, ls: localStorage.getItem('fp-motion'), playing: [...document.querySelectorAll('video')].filter((v) => !v.paused).length }));
    assert(a.m === 'paused' && a.pressed === 'true' && a.text === 'Play motion' && a.ls === 'paused' && a.playing === 0, JSON.stringify(a));
    await page.reload({ waitUntil: 'load' });
    const b = await page.evaluate(() => document.documentElement.dataset.motion);
    assert(b === 'paused', 'not persisted');
    await page.locator('[data-motion-toggle]').scrollIntoViewIfNeeded();
    await page.click('[data-motion-toggle]');
    const c = await page.evaluate(() => ({ m: document.documentElement.dataset.motion, ls: localStorage.getItem('fp-motion') }));
    assert(!c.m && !c.ls, JSON.stringify(c));
    return JSON.stringify(a);
  });
  await test('/covent-garden/ Lights on: scrolling into view turns the lamps on; the pull switch replays', async () => {
    await page.goto(BASE + '/covent-garden/', { waitUntil: 'load' });
    await page.locator('[data-lights]').scrollIntoViewIfNeeded();
    await page.evaluate(() => { const r = document.querySelector('[data-lights]').getBoundingClientRect(); scrollBy(0, r.top + r.height / 2 - innerHeight * 0.4); });
    await page.waitForFunction(() => document.querySelector('[data-lights]').dataset.glow === 'on', null, { timeout: 8000 });
    const cue = await page.evaluate(() => document.querySelector('[data-lights] .cue').textContent);
    await page.click('[data-lights] .pull');
    await page.waitForTimeout(300);
    const mid = await page.evaluate(() => document.querySelector('[data-lights]').dataset.glow);
    await page.waitForFunction(() => document.querySelector('[data-lights]').dataset.glow === 'on', null, { timeout: 8000 });
    return `cue="${cue}" after pull=${mid} then on`;
  });
  await test('/covent-garden/ contact sheet: a thumb opens the lightbox; next/prev/close work', async () => {
    await page.locator('.room-shot').first().scrollIntoViewIfNeeded();
    await page.locator('.room-shot').first().click();
    await page.waitForTimeout(400);
    const a = await page.evaluate(() => ({ open: document.querySelector('.room-lightbox').open, cap: document.querySelector('.room-lightbox figcaption')?.textContent.replace(/\s+/g, ' ').trim() }));
    assert(a.open && /1 of \d+/.test(a.cap), JSON.stringify(a));
    await page.click('.room-lb-next');
    await page.waitForTimeout(400);
    const b = await page.evaluate(() => document.querySelector('.room-lightbox figcaption')?.textContent.replace(/\s+/g, ' ').trim());
    assert(/2 of \d+/.test(b), b);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert(!(await page.evaluate(() => document.querySelector('.room-lightbox').open)), 'lightbox still open');
    return a.cap;
  });
  await test('home: hero Book opens the drawer; passes link to the rooms; menu book toolbar lists both list menus', async () => {
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    await page.click('.hero-book');
    await page.waitForTimeout(400);
    assert(await page.evaluate(() => document.querySelector('[data-book-drawer]').open), 'drawer not open from hero');
    await page.keyboard.press('Escape');
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
    for (const want of ['/soho/', '/covent-garden/', '/dubai/', '/soho/menu/', '/covent-garden/menu/', '/private-dining/', '/our-story/']) assert(links.includes(want), 'home lacks link ' + want);
    const tabs = await page.evaluate(() => [...document.querySelectorAll('#menu [role=tab]')].map((b) => b.textContent.trim()));
    assert(tabs.length >= 3, 'book tabs ' + tabs.join(','));
    await page.evaluate(() => document.querySelector('#menu [role=tablist]').scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(1500); // the book hydrates one screen early (client:visible)
    await page.locator('#menu [role=tab]').nth(1).click();
    await page.waitForTimeout(800);
    const sel = await page.evaluate(() => [...document.querySelectorAll('#menu [role=tab]')].findIndex((b) => b.getAttribute('aria-selected') === 'true'));
    assert(sel === 1, 'tab not selected ' + sel);
    return `tabs: ${tabs.join(', ')}`;
  });
  await test('footer: no newsletter form without PUBLIC_NEWSLETTER_ACTION; today\'s hours line filled per room', async () => {
    const f = await page.evaluate(() => ({ news: !!document.querySelector('footer form'), hours: [...document.querySelectorAll('[data-foot-hours]')].map((e) => e.textContent.trim()) }));
    assert(!f.news, 'newsletter form rendered');
    assert(f.hours.length >= 2 && f.hours.every(Boolean), JSON.stringify(f.hours));
    return f.hours.join(' | ');
  });
  await page.close();
  await ctx.close();
}
await browser.close();

const lines = results.map((r) => `${r.pass ? 'ok  ' : 'FAIL'} ${r.name}${r.detail ? `  -- ${r.detail}` : ''}`);
writeFileSync(join(import.meta.dirname, 'functional-results.txt'), lines.join('\n'));
console.log(lines.join('\n'));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
