// Responsive + accessibility sweep. Usage: node audit.mjs [pages...]  (env BASE, OUT, SHOTS=0, CHROME_PATH)
// Needs playwright-core and axe-core installed beside it (or in a parent node_modules).
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? join(import.meta.dirname, 'screens');
const CHROME = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : '/usr/bin/google-chrome');
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const ONLY = process.argv.slice(2);
const SHOTS = process.env.SHOTS !== '0';

const PAGES = ONLY.length ? ONLY : ['/', '/soho/', '/covent-garden/', '/dubai/', '/soho/menu/', '/covent-garden/menu/', '/dubai/menu/', '/book/', '/private-dining/', '/our-story/', '/accessibility/', '/allergens/', '/booking-terms/', '/privacy/', '/404'];
const VIEWS = [
  ['320', { width: 320, height: 568, mobile: true }],
  ['375', { width: 375, height: 667, mobile: true }],
  ['390', { width: 390, height: 844, mobile: true }],
  ['430', { width: 430, height: 932, mobile: true }],
  ['600', { width: 600, height: 900, mobile: true }],
  ['768', { width: 768, height: 1024, mobile: true }],
  ['844x390-land', { width: 844, height: 390, mobile: true }],
  ['1024', { width: 1024, height: 768 }],
  ['1280', { width: 1280, height: 800 }],
  ['1440', { width: 1440, height: 900 }],
  ['1920', { width: 1920, height: 1080 }],
  ['1280-zoom200', { width: 1280, height: 800, zoom: 2 }],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const report = [];

for (const [vname, v] of VIEWS) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, isMobile: !!v.mobile, hasTouch: !!v.mobile, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
      if (v.zoom) await page.addStyleTag({ content: 'html{font-size:200% !important}' });
      await page.waitForTimeout(400);
      // scroll through to trigger lazy/animated content, then back to top
      await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(300);
      const data = await page.evaluate(() => {
        const vw = window.innerWidth;
        const de = document.documentElement;
        const overflowX = Math.max(de.scrollWidth, document.body.scrollWidth) - vw;
        const over = [];
        const small = [];
        const fixed = [];
        const seen = new Set();
        const desc = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          if (r.width > 0 && (r.right > vw + 1) && cs.position !== 'fixed') {
            // only report if an ancestor doesn't clip it
            let p = el.parentElement, clipped = false;
            while (p && p !== document.body) { const pc = getComputedStyle(p); if (/hidden|clip|scroll|auto/.test(pc.overflowX)) { clipped = true; break; } p = p.parentElement; }
            if (!clipped && over.length < 12) over.push(`${desc(el)} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
          }
          if (cs.position === 'fixed' || cs.position === 'sticky') { if (fixed.length < 8 && r.height > 0) fixed.push(`${desc(el)} ${cs.position} ${Math.round(r.width)}x${Math.round(r.height)} top=${Math.round(r.top)}`); }
        }
        for (const el of document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab],[tabindex="0"]')) {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden') continue;
          if (r.width < 24 || r.height < 24) { const k = desc(el) + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 25); if (!seen.has(k)) { seen.add(k); small.push(`${k} ${Math.round(r.width)}x${Math.round(r.height)}`); } }
        }
        const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => `${h.tagName.toLowerCase()}:${h.textContent.trim().replace(/\s+/g, ' ').slice(0, 50)}`);
        const landmarks = [...document.querySelectorAll('header,nav,main,footer,aside,[role=banner],[role=navigation],[role=main],[role=contentinfo],[role=region],section[aria-label],section[aria-labelledby]')].map((l) => `${l.tagName.toLowerCase()}${l.getAttribute('role') ? '[' + l.getAttribute('role') + ']' : ''}${l.getAttribute('aria-label') ? '(' + l.getAttribute('aria-label') + ')' : ''}`);
        const imgsNoAlt = [...document.querySelectorAll('img:not([alt])')].map((i) => i.src.split('/').pop()).slice(0, 10);
        const skip = !!document.querySelector('a[href^="#"][class*=skip], a[href="#main"], a[href="#content"]');
        const minFont = Math.min(...[...document.querySelectorAll('p,li,a,button,span,label,td,dd,dt,small,time')].filter((e) => e.textContent.trim() && e.getBoundingClientRect().height > 0).map((e) => parseFloat(getComputedStyle(e).fontSize)));
        return { overflowX, over, small, fixed, heads, landmarks, imgsNoAlt, skip, minFont, title: document.title, h1s: document.querySelectorAll('h1').length, lang: de.lang };
      });
      let axe = null;
      if (vname === '390' || vname === '1440') {
        await page.addScriptTag({ content: AXE });
        const res = await page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }); return r.violations.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.slice(0, 5).map((n) => n.target.join(' ')), count: x.nodes.length })); });
        axe = res;
      }
      if (SHOTS) {
        const slug = path.replace(/\W+/g, '_').replace(/^_|_$/g, '') || 'home';
        await page.screenshot({ path: join(OUT, `${slug}--${vname}.png`), fullPage: true });
      }
      report.push({ path, view: vname, ...data, axe, errors });
    } catch (e) {
      report.push({ path, view: vname, fail: String(e), errors });
    }
    await page.close();
  }
  await ctx.close();
  process.stderr.write(`done ${vname}\n`);
}
await browser.close();
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 1));

// summary
const lines = [];
for (const r of report) {
  const issues = [];
  if (r.fail) issues.push(`FAIL ${r.fail.slice(0, 100)}`);
  if (r.overflowX > 1) issues.push(`overflowX=${r.overflowX}`);
  if (r.over?.length) issues.push(`over:[${r.over.join(' | ')}]`);
  if (r.small?.length) issues.push(`small:[${r.small.join(' | ')}]`);
  if (r.imgsNoAlt?.length) issues.push(`noalt:${r.imgsNoAlt}`);
  if (r.h1s !== 1) issues.push(`h1s=${r.h1s}`);
  if (r.axe?.length) issues.push(`axe:${r.axe.map((a) => `${a.id}(${a.impact},${a.count})`).join(',')}`);
  if (r.errors?.length) issues.push(`jserr:${r.errors.slice(0, 2).join(';').slice(0, 120)}`);
  if (r.minFont && r.minFont < 12) issues.push(`minFont=${r.minFont}`);
  if (issues.length) lines.push(`${r.view} ${r.path}: ${issues.join(' ')}`);
}
writeFileSync(join(OUT, 'summary.txt'), lines.join('\n'));
console.log(lines.join('\n') || 'no issues');
