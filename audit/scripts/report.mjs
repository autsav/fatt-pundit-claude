// Fills the Lighthouse tables in audit/AUDIT.md from audit/data/lighthouse-{local,live,launch}.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = join(import.meta.dirname, '..');
const load = (l) => { const f = join(ROOT, 'data', `lighthouse-${l}.json`); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {}; };
// Lighthouse 13 keeps the LCP node in lcp-breakdown-insight (type 'node'); lighthouse.mjs stored the old audit path.
const lcpNode = (label, r) => { const f = join(ROOT, 'lighthouse', label, `${r === '/' ? 'home' : r.replace(/^\/|\/$/g, '').replace(/\//g, '-')}--mobile.json`); if (!existsSync(f)) return null; const j = JSON.parse(readFileSync(f, 'utf8')); const n = j.audits['lcp-breakdown-insight']?.details?.items?.find((i) => i.type === 'node'); return n ? (n.selector || n.snippet || '').slice(0, 70) : null; };
const local = load('local'), live = load('live'), launch = load('launch'), after = load('after');
const routes = [...new Set(Object.keys(local).map((k) => k.split(' ')[0]))];
const cell = (s) => (typeof s !== 'object' ? '—' : s.perf + s.seo === 0 ? 'n/a (Lighthouse won\'t audit a 404 response)' : `${s.perf} / ${s.a11y} / ${s.bp} / ${s.seo}`);
let before = '## Before / after (Lighthouse, mobile median of 3 local; P / A11y / BP / SEO)\n| Route | Mobile local (before) | Desktop local (before) | Mobile live (before) | After (mobile local) |\n|---|---|---|---|---|\n';
for (const r of routes) before += `| \`${r}\` | ${cell(local[r + ' mobile'])} | ${cell(local[r + ' desktop'])} | ${cell(live[r + ' mobile'])} | ${after[r + ' mobile'] ? cell(after[r + ' mobile']) + ' (Phase 2)' : '—'} |\n`;
before += '\nBudgets (brief §4, mobile): P ≥ 90, A11y 100, BP ≥ 95, SEO ≥ 95, LCP < 2.5 s, CLS < 0.05. SEO 69 everywhere is the intended preview `noindex`; the launch-build pass is under SEO.\n\nBelow budget (before): home mobile local P89 (runs 78/89/90; live 96) with lab LCP 3.6 s; LCP > 2.5 s also on `/soho/` (2.6), `/covent-garden/` (2.9), `/our-story/` (3.2) locally (all < 2.1 s live); live `/private-dining/` Best Practices 77 (B-16); live `/dubai/` CLS 0.1 in one run (re-measure in Phase 2). Everything else meets budget.\n';
let perf = '| Route | LCP (lab, mobile) | Observed LCP | CLS | TBT | Total KB | JS KB | CSS KB | Img KB | Font KB | LCP element | Top 5 heaviest |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n';
for (const r of routes) { const s = local[r + ' mobile']; if (typeof s !== 'object' || !s.lcp) continue;
  perf += `| \`${r}\` | ${(s.lcp / 1000).toFixed(1)} s${s.lcp > 2500 ? ' ⚠️' : ''} | ${s.observedLcp ?? '—'} ms | ${s.cls} | ${s.tbt} ms | ${s.totalKB} | ${s.jsKB} | ${s.cssKB} | ${s.imgKB} | ${s.fontKB} | \`${(lcpNode('local', r) ?? s.lcpEl ?? '—').replace(/\|/g, '/').replace(/`/g, '').slice(0, 70)}\` | ${s.heaviest.map((h) => h.replace(/\|/g, '/').slice(0, 60)).join('<br>')} |\n`; }
perf += '\nJS KB is transfer size (gzip/brotli as served). Budget: home JS < 100 KB — **home ships 157 KB of JS (over budget)**; branch pages ~104 KB (React client 63 KB). Observed LCP is 65–230 ms everywhere; lab LCP > 2.5 s comes from simulated slow-4G image loads (lesson: check observed first).\n';
let seo = '';
if (Object.keys(launch).length) { seo = '\nLaunch-build pass (`PUBLIC_LAUNCH=true`, SEO only, mobile):\n\n| Route | SEO | Failing audits |\n|---|---|---|\n'; for (const [k, s] of Object.entries(launch)) if (k.endsWith('mobile') && typeof s === 'object') seo += `| \`${k.split(' ')[0]}\` | ${s.seo} | ${s.failing.join(', ') || '—'} |\n`; }
let md = readFileSync(join(ROOT, 'AUDIT.md'), 'utf8');
md = md.replace(/<!-- LH-BEFORE-AFTER -->[\s\S]*?(?=\n## Summary)/, `<!-- LH-BEFORE-AFTER -->\n${before}`).replace(/<!-- LH-PERF -->[\s\S]*?(?=\nImage probe)/, `<!-- LH-PERF -->\n${perf}`).replace(/<!-- LH-SEO -->[\s\S]*?(?=\n## UX)/, `<!-- LH-SEO -->\n${seo}`);
writeFileSync(join(ROOT, 'AUDIT.md'), md);
console.log('filled', routes.length, 'routes; live', Object.keys(live).length, 'launch', Object.keys(launch).length);
