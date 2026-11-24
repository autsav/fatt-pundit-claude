// Static proofs for Phase 2 IDs that aren't a Playwright assertion of their own. Writes audit/data/phase2-proofs.txt.
// Usage (after `npm run build`, preview on BASE): BASE=http://localhost:4399 node audit/scripts/phase2-proofs.mjs
import { chromium, devices } from '@playwright/test';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = join(import.meta.dirname, '..', '..');
const BASE = process.env.BASE ?? 'http://localhost:4399';
const out = [];
const say = (id, ok, note) => out.push(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`);
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

// B-13: no review figures typed into .astro files.
const astro = walk(join(ROOT, 'src')).filter((p) => p.endsWith('.astro'));
const hits = astro.filter((p) => /20,030|16,000\+|4\.8\s*<span/.test(readFileSync(p, 'utf8')));
say('B-13', hits.length === 0, hits.length ? `hard-coded in ${hits.join(', ')}` : `${astro.length} .astro files, no hard-coded review numbers`);

// B-14: dist/404.html has no canonical or og:url.
const h404 = readFileSync(join(ROOT, 'dist', '404.html'), 'utf8');
say('B-14', !/rel="canonical"/.test(h404) && !/og:url/.test(h404), 'dist/404.html: no canonical, no og:url');

// B-18: static HTML carries no booking-note copy (written only while shown).
const hHome = readFileSync(join(ROOT, 'dist', 'index.html'), 'utf8');
say('B-18 (static)', !/No more tables|please call or send an enquiry/.test(hHome), 'dist/index.html: no "No more tables…" / "For 2, please call"');

// Sitemap: every URL carries lastmod = the build date.
const sm = readFileSync(join(ROOT, 'dist', 'sitemap.xml'), 'utf8');
const locs = (sm.match(/<loc>/g) ?? []).length, mods = [...new Set(sm.match(/<lastmod>[^<]+/g) ?? [])];
say('Sitemap lastmod', locs > 0 && (sm.match(/<lastmod>/g) ?? []).length === locs && mods.length === 1, `${locs} URLs, lastmod ${mods.join(', ').replace(/<lastmod>/g, '')}`);

const browser = await chromium.launch();
// B-18 (hydrated): drawer closed, after its idle pre-draw.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  const p = await ctx.newPage(); await p.goto(BASE + '/'); await p.waitForTimeout(3500);
  const txt = await p.evaluate(() => document.body.textContent);
  say('B-18 (hydrated)', !/No more tables|please call or send an enquiry/.test(txt), 'hydrated home DOM with the drawer closed: no stale notes');
  // B-21: console after a full scroll.
  const warn = []; p.on('console', (m) => ['warning', 'error'].includes(m.type()) && !m.text().includes('GL Driver') && warn.push(m.text()));
  await p.reload(); for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, 700); await p.waitForTimeout(70); }
  await p.waitForTimeout(800);
  say('B-21', warn.length === 0, warn.length ? warn.join(' | ') : 'home: 0 console warnings or errors after a full scroll');
  await ctx.close();
}
// B-17: build day D, browser on D+1: static HTML neutral, hydrated value today's.
{
  const html = readFileSync(join(ROOT, 'dist', 'soho', 'index.html'), 'utf8');
  const board = html.match(/<section class="tonight"[\s\S]*?<\/section>/);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, timezoneId: 'Europe/London' });
  await ctx.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date(Date.now() + 24 * 3600e3) });
  await p.goto(BASE + '/soho/'); await p.evaluate(() => document.querySelector('.tonight, #visit')?.scrollIntoView()); await p.waitForTimeout(1500);
  const today = await p.evaluate(() => [...document.querySelectorAll('*')].find((e) => /^Today, \w+day$/.test(e.textContent.trim()) && e.children.length === 0)?.textContent.trim());
  const expected = 'Today, ' + new Date(Date.now() + 24 * 3600e3).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'Europe/London' });
  say('B-17', !board && today === expected, `static HTML: ${board ? 'board with build-day lines' : 'neutral (no board)'}; hydrated on D+1: "${today}" (expected "${expected}")`);
  await ctx.close();
}
// B-20: phone at 3 s, no wipe hint.
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  await ctx.addInitScript(() => { try { localStorage.setItem('fp-arrived', '1'); } catch {} });
  const p = await ctx.newPage(); await p.goto(BASE + '/'); await p.waitForTimeout(3200);
  const on = await p.locator('.hero-wipe').evaluate((e) => e.classList.contains('is-on'));
  await p.screenshot({ path: join(ROOT, 'audit', 'screens', 'after', 'b20-hero-phone-3s.jpg'), type: 'jpeg', quality: 70 });
  say('B-20', !on, 'phone hero at 3.2 s: no wipe hint (audit/screens/after/b20-hero-phone-3s.jpg)');
  await ctx.close();
}
await browser.close();
writeFileSync(join(ROOT, 'audit', 'data', 'phase2-proofs.txt'), out.join('\n') + '\n');
console.log(out.join('\n'));
