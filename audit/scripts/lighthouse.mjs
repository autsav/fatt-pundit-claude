// Lighthouse, all four categories, mobile (median of RUNS) + desktop (1 run). Pattern: docs/qa/phase9-optimisation/lighthouse.mjs.
// Usage: BASE=http://localhost:4399 LABEL=local RUNS=3 node audit/scripts/lighthouse.mjs [routes...]
// Saved JSON drops the base64 screenshot audits (slim set, user 24 Nov 2026); numbers are untouched.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(import.meta.dirname, '..');
const BASE = process.env.BASE ?? 'http://localhost:4399';
const LABEL = process.env.LABEL ?? 'local';
const RUNS = Number(process.env.RUNS ?? 3);
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LH = join(ROOT, '..', 'node_modules', 'lighthouse', 'cli', 'index.js');
const CATS = process.env.CATS ?? 'performance,accessibility,best-practices,seo';
const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/book/', '/soho/', '/soho/menu/', '/covent-garden/', '/covent-garden/menu/', '/dubai/', '/private-dining/', '/our-story/', '/our-story/fatt/', '/allergens/', '/accessibility/', '/privacy/', '/booking-terms/', '/this-page-does-not-exist/'];
const slug = (r) => (r === '/' ? 'home' : r === '/this-page-does-not-exist/' ? '404' : r.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
const dir = join(ROOT, 'lighthouse', LABEL); mkdirSync(dir, { recursive: true });
const STRIP = ['final-screenshot', 'screenshot-thumbnails', 'full-page-screenshot'];

const run = (url, preset) => {
  const f = join(tmpdir(), `lh-${Date.now()}.json`);
  const args = [LH, url, '--quiet', '--output=json', `--output-path=${f}`, `--only-categories=${CATS}`, '--chrome-flags=--headless=new --no-sandbox'];
  if (preset === 'desktop') args.push('--preset=desktop');
  try { execFileSync(process.execPath, args, { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'pipe', timeout: 180000 }); }
  catch (e) { if (!readFileSafe(f)) return null; }
  const j = readFileSafe(f); rmSync(f, { force: true }); return j;
};
const readFileSafe = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const kb = (n) => Math.round((n ?? 0) / 1024);
const sum = (j) => {
  const a = j.audits; const c = j.categories;
  const items = a['network-requests']?.details?.items ?? [];
  const by = (t) => kb(items.filter((i) => i.resourceType === t).reduce((s, i) => s + (i.transferSize ?? 0), 0));
  return {
    perf: Math.round((c.performance?.score ?? 0) * 100), a11y: Math.round((c.accessibility?.score ?? 0) * 100), bp: Math.round((c['best-practices']?.score ?? 0) * 100), seo: Math.round((c.seo?.score ?? 0) * 100),
    lcp: Math.round(a['largest-contentful-paint']?.numericValue ?? 0), cls: +(a['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3), tbt: Math.round(a['total-blocking-time']?.numericValue ?? 0), fcp: Math.round(a['first-contentful-paint']?.numericValue ?? 0),
    observedLcp: a.metrics?.details?.items?.[0]?.observedLargestContentfulPaint,
    lcpEl: a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 160) ?? a['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet?.slice(0, 160),
    totalKB: kb(a['total-byte-weight']?.numericValue), jsKB: by('Script'), cssKB: by('Stylesheet'), imgKB: by('Image'), fontKB: by('Font'),
    heaviest: [...items].sort((x, y) => (y.transferSize ?? 0) - (x.transferSize ?? 0)).slice(0, 5).map((i) => `${kb(i.transferSize)}KB ${i.url.replace(/^https?:\/\/[^/]+/, '')}`),
    failing: Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable' && x.scoreDisplayMode !== 'manual').map((x) => x.id),
  };
};

const summary = {};
for (const route of ROUTES) {
  for (const preset of ['mobile', 'desktop']) {
    const n = preset === 'mobile' ? RUNS : 1;
    const runs = [];
    for (let i = 0; i < n; i++) { const j = run(BASE + route, preset); if (j) runs.push(j); }
    if (!runs.length) { summary[`${route} ${preset}`] = 'failed'; console.log(route, preset, 'FAILED'); continue; }
    runs.sort((x, y) => (x.categories.performance?.score ?? 0) - (y.categories.performance?.score ?? 0));
    const med = runs[Math.floor(runs.length / 2)];
    for (const k of STRIP) delete med.audits[k];
    delete med.fullPageScreenshot;
    writeFileSync(join(dir, `${slug(route)}--${preset}.json`), JSON.stringify(med));
    const s = sum(med); s.perfRuns = runs.map((r) => Math.round((r.categories.performance?.score ?? 0) * 100));
    summary[`${route} ${preset}`] = s;
    console.log(route, preset, `P${s.perf} A${s.a11y} BP${s.bp} SEO${s.seo} LCP${s.lcp} CLS${s.cls} TBT${s.tbt} ${s.totalKB}KB runs=${s.perfRuns}`);
  }
}
writeFileSync(join(ROOT, 'data', `lighthouse-${LABEL}.json`), JSON.stringify(summary, null, 1));
