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

const html = readFileSync(join(dist, 'index.html'), 'utf8').replaceAll('"/_astro/', '"./assets/').replaceAll("'/_astro/", "'./assets/").replaceAll('(/_astro/', '(./assets/').replaceAll(' /_astro/', ' ./assets/').replaceAll(',/_astro/', ',./assets/');
writeFileSync(join(out, 'index.html'), html);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const f of walk(join(out, 'assets')).filter((f) => f.endsWith('.css') || f.endsWith('.js'))) {
  const depth = f.slice(join(out, 'assets').length + 1).split('/').length - 1;
  const up = depth ? '../'.repeat(depth) : './';
  writeFileSync(f, readFileSync(f, 'utf8').replaceAll('/_astro/', up));
}
const left = readFileSync(join(out, 'index.html'), 'utf8').match(/_astro\//g);
console.log(`demo/ ready${left ? ` — WARNING: ${left.length} absolute /_astro/ paths left` : ''}`);
