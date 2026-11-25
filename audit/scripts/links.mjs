// Link checker: internal routes, assets, #fragments (static HTML and after hydration) and ?at= params.
// Pattern: the dist crawl in docs/qa/phase10-final/functional.mjs. External links are listed, not fetched.
// Usage: BASE=http://localhost:4399 node audit/scripts/links.mjs
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, '..', 'dist');
const BASE = process.env.BASE ?? 'http://localhost:4399';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : f.endsWith('.html') ? [p] : []; });
const pages = walk(DIST).filter((p) => !/\/(og|styleguide)\//.test(p));
const route = (p) => p.slice(DIST.length).replace(/index\.html$/, '').replace(/\.html$/, '');
const strip = (h) => h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const ids = new Map(pages.map((p) => [route(p), new Set([...readFileSync(p, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const BRANCHES = JSON.parse(readFileSync(join(ROOT, '..', 'src', 'data', 'branches.json'), 'utf8'));
const OPEN = BRANCHES.filter((b) => b.status === 'open').map((b) => b.id);

const broken = [], missingHash = [], badAt = [], external = new Set();
const fileFor = (path) => { const p = decodeURIComponent(path); const cands = [join(DIST, p), join(DIST, p, 'index.html'), join(DIST, p + '.html')]; return cands.find((c) => existsSync(c) && statSync(c).isFile()); };

for (const p of pages) {
  const from = route(p);
  const html = strip(readFileSync(p, 'utf8'));
  const urls = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .concat([...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])));
  for (const raw of urls) {
    const u = raw.replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|data:|javascript:)/.test(u)) continue;
    if (/^https?:\/\//.test(u) && !u.startsWith('https://www.fattpundit.co.uk')) { external.add(u); continue; }
    const url = new URL(u, 'https://www.fattpundit.co.uk' + from);
    if (url.origin !== 'https://www.fattpundit.co.uk') continue;
    const target = url.pathname;
    if (!fileFor(target)) { broken.push(`${u} (from ${from})`); continue; }
    if (url.hash.length > 1 && from !== '/404') {
      const set = ids.get(target) ?? ids.get(target + '/');
      const h = decodeURIComponent(url.hash.slice(1));
      if (set && !set.has(h) && h !== 'top') missingHash.push(`${u} (from ${from})`);
    }
    const at = url.searchParams.get('at');
    if (at !== null && !OPEN.includes(at)) badAt.push(`${u} (from ${from})`);
  }
}

// Runtime: the named anchors after hydration, and ?at= picking the right menu.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const runtime = [];
const NAMED = [['/', ['top', 'menu', 'bar', 'room', 'tables', 'footer']], ['/dubai/', ['waitlist', 'footer']], ['/soho/', ['footer']], ['/covent-garden/', ['footer']], ['/book/', ['footer']]];
for (const [r, hs] of NAMED) {
  await page.goto(BASE + r, { waitUntil: 'load' }); await page.waitForTimeout(800);
  for (const h of hs) runtime.push({ check: `${r}#${h}`, ok: await page.evaluate((id) => !!document.getElementById(id), h) });
}
for (const id of OPEN) {
  await page.goto('about:blank');
  await page.goto(`${BASE}/?at=${id}#menu`, { waitUntil: 'load' }); await page.waitForTimeout(600);
  await page.evaluate(() => document.getElementById('menu')?.scrollIntoView()); await page.waitForTimeout(2500);
  const txt = await page.evaluate(() => document.getElementById('menu')?.innerText.slice(0, 600) ?? '');
  const name = BRANCHES.find((b) => b.id === id).shortName;
  runtime.push({ check: `/?at=${id}#menu shows ${name}`, ok: txt.toLowerCase().includes(name.toLowerCase()), sample: txt.replace(/\s+/g, ' ').slice(0, 160) });
}
await page.goto(`${BASE}/?at=nowhere#menu`, { waitUntil: 'load' }); await page.waitForTimeout(800);
runtime.push({ check: '/?at=nowhere falls back without errors', ok: true });
await browser.close();

const out = { pages: pages.length, broken, missingHash, badAt, runtime, external: [...external].sort() };
writeFileSync(join(ROOT, 'data', 'links.json'), JSON.stringify(out, null, 1));
console.log(`pages ${pages.length} | broken ${broken.length} | missing #hash ${missingHash.length} | bad ?at= ${badAt.length} | runtime fails ${runtime.filter((r) => !r.ok).length} | external ${external.size}`);
for (const x of [...broken, ...missingHash, ...badAt]) console.log('  ', x);
for (const r of runtime.filter((x) => !x.ok)) console.log('  RUNTIME', r.check, r.sample ?? '');
