// Copies the built site (home + branch pages) into demo/ with relative asset paths,
// so it can be hosted under any sub-path (e.g. a shared preview link).
// Usage: npm run build && node scripts/export-demo.mjs
import { cpSync, readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const out = new URL('../demo/', import.meta.url).pathname;
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
// Hosts may reserve names starting with "_", so ship assets/ instead of _astro/.
cpSync(join(dist, '_astro'), join(out, 'assets'), { recursive: true });

// Pages: the home page plus one per branch. Sub-pages get <base href="../"> so the shared
// assets/ folder and page-relative JS paths resolve from the root, and every internal link
// becomes an explicit index.html path (hosts may not map /soho/ to /soho/index.html).
const PAGES = ['', ...readdirSync(dist).filter((d) => !['_astro', 'styleguide'].includes(d) && statSync(join(dist, d)).isDirectory())];
const link = (path) => {
  const [p, hash] = path.split('#');
  const file = p === '' ? 'index.html' : p.endsWith('/') ? `${p}index.html` : p;
  return hash !== undefined ? `${file}#${hash}` : file;
};
for (const page of PAGES) {
  let html = readFileSync(join(dist, page, 'index.html'), 'utf8').replaceAll('"/_astro/', '"./assets/').replaceAll("'/_astro/", "'./assets/").replaceAll('(/_astro/', '(./assets/').replaceAll(' /_astro/', ' ./assets/').replaceAll(',/_astro/', ',./assets/').replaceAll('&quot;/_astro/', '&quot;./assets/');
  html = html.replace(/href="\/(?!\/)([^"]*)"/g, (_, path) => `href="${link(path)}"`);
  if (page) {
    html = html.replace(/href="#([^"]*)"/g, (_, hash) => `href="${page}/index.html#${hash}"`);
    html = html.replace('<head>', '<head><base href="../">');
  }
  mkdirSync(join(out, page), { recursive: true });
  writeFileSync(join(out, page, 'index.html'), html);
}

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const f of walk(join(out, 'assets'))) {
  const src = readFileSync(f, 'utf8');
  if (f.endsWith('.css')) {
    // CSS url() resolves against the stylesheet, which lives in assets/.
    const depth = f.slice(join(out, 'assets').length + 1).split('/').length - 1;
    writeFileSync(f, src.replaceAll('/_astro/', depth ? '../'.repeat(depth) : './'));
  } else if (f.endsWith('.js')) {
    // Strings in JS (image URLs, dynamic imports by path) resolve against the page.
    writeFileSync(
      f,
      src
        .replaceAll('"/_astro/', '"./assets/').replaceAll("'/_astro/", "'./assets/").replaceAll('`/_astro/', '`./assets/')
        // Vite's preload list ("_astro/x.js") and its "/"-prefixing helper → page-relative.
        .replaceAll('"_astro/', '"assets/').replaceAll('`_astro/', '`assets/')
        .replace(/return`\/`\+(\w)\}/g, 'return new URL($1,document.baseURI).href}'),
    );
  }
}
const left = PAGES.flatMap((pg) => readFileSync(join(out, pg, 'index.html'), 'utf8').match(/(?<![\w./])\/?_astro\//g) ?? []); // full https://…/_astro/ URLs (JSON-LD) are fine
console.log(`demo/ ready: ${PAGES.length} pages${left.length ? ` — WARNING: ${left.length} absolute /_astro/ paths left` : ''}`);
