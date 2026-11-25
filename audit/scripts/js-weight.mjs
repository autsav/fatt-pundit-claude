// Home JS actually fetched at load (no scrolling) vs after walking the page, gzip transfer sizes.
// Usage: BASE=http://localhost:4399 node audit/scripts/js-weight.mjs [path]
import { chromium, devices } from '@playwright/test';
const BASE = process.env.BASE ?? 'http://localhost:4399';
const path = process.argv[2] ?? '/';
const b = await chromium.launch();
const ctx = await b.newContext(devices['iPhone 13']);
const p = await ctx.newPage();
const sizes = new Map();
p.on('response', async (r) => {
  if (!/\.m?js(\?|$)/.test(r.url()) && r.request().resourceType() !== 'script') return;
  try { const s = (await r.request().sizes()).responseBodySize; sizes.set(r.url().replace(BASE, ''), s); } catch {}
});
const sum = () => [...sizes.values()].reduce((a, c) => a + c, 0) / 1024;
await p.goto(BASE + path, { waitUntil: 'load' });
await p.waitForTimeout(4000);
const atLoad = new Map(sizes);
console.log('at load KB (transfer):', sum().toFixed(1));
for (const [u, s] of [...atLoad].sort((a, c) => c[1] - a[1]).slice(0, 10)) console.log('  ', (s / 1024).toFixed(1).padStart(6), u);
for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(50); }
await p.waitForTimeout(2000);
console.log('after walk KB:', sum().toFixed(1));
for (const [u, s] of [...sizes].filter(([u]) => !atLoad.has(u)).sort((a, c) => c[1] - a[1])) console.log('  +', (s / 1024).toFixed(1).padStart(6), u);
await b.close();
