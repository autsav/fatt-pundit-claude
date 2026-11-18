// Copies the built homepage into demo/ with relative asset paths,
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

const html = readFileSync(join(dist, 'index.html'), 'utf8').replaceAll('"/_astro/', '"./assets/').replaceAll("'/_astro/", "'./assets/").replaceAll('(/_astro/', '(./assets/').replaceAll(' /_astro/', ' ./assets/').replaceAll(',/_astro/', ',./assets/').replaceAll('&quot;/_astro/', '&quot;./assets/');
writeFileSync(join(out, 'index.html'), html);

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
const left = readFileSync(join(out, 'index.html'), 'utf8').match(/_astro\//g);
console.log(`demo/ ready${left ? ` — WARNING: ${left.length} absolute /_astro/ paths left` : ''}`);
