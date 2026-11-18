// Cross-file checks the Zod schemas can't do. Runs before every build (npm run build).
// Exit 1 on any error. Warnings print but don't fail.
import { readFileSync, existsSync } from 'node:fs';

const load = (f) => JSON.parse(readFileSync(new URL(`../src/data/${f}.json`, import.meta.url), 'utf8'));
const branches = load('branches');
const dishes = load('dishes');
const menus = load('menus');

const errors = [];
const warnings = [];
const dishIds = new Set(dishes.map((d) => d.id));
const menuIds = new Set(menus.map((m) => m.id));
const branchIds = new Set(branches.map((b) => b.id));

const dupes = (arr) => arr.filter((x, i) => arr.indexOf(x) !== i);
for (const [name, list] of [['dish', dishes], ['menu', menus], ['branch', branches]]) {
  for (const id of dupes(list.map((x) => x.id))) errors.push(`duplicate ${name} id "${id}"`);
}

for (const m of menus) {
  for (const b of m.branches) if (!branchIds.has(b)) errors.push(`menu "${m.id}": unknown branch "${b}"`);
  for (const s of m.sections) {
    for (const { dish } of s.items) {
      if (!dishIds.has(dish)) { errors.push(`menu "${m.id}" > "${s.title}": unknown dish "${dish}"`); continue; }
      const d = dishes.find((x) => x.id === dish);
      if (m.showPrices && !d.price && !d.options) errors.push(`menu "${m.id}" shows prices but "${dish}" has none`);
    }
  }
  if (m.kind === 'pre-theatre' && !m.setPrice) errors.push(`menu "${m.id}": pre-theatre needs setPrice`);
  if (m.kind === 'set' && !m.setPrice) warnings.push(`menu "${m.id}": no set price yet (ask client)`);
}

for (const b of branches) {
  for (const id of b.menus) if (!menuIds.has(id)) errors.push(`branch "${b.id}": unknown menu "${id}"`);
  if (b.status === 'open' && !b.geo) warnings.push(`branch "${b.id}": no geo coordinates (needed for schema/map)`);
  if (b.status === 'open' && !b.vouchersUrl && b.id === 'soho') warnings.push(`branch "${b.id}": vouchers URL missing`);
}

const used = new Set(menus.flatMap((m) => m.sections.flatMap((s) => s.items.map((i) => i.dish))));
for (const d of dishes) if (!used.has(d.id)) warnings.push(`dish "${d.id}" is on no menu`);

const signatures = dishes.filter((d) => d.signature && d.kind === 'food');
if (signatures.length !== 6) errors.push(`expected 6 signature dishes for scene 4, found ${signatures.length}`);
for (const d of signatures) {
  const img = new URL(`../src/assets/images/dishes/${d.id}.jpg`, import.meta.url);
  if (!existsSync(img)) warnings.push(`signature dish "${d.id}": photo missing (src/assets/images/dishes/${d.id}.jpg)`);
}

for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);
console.log(`validate-data: ${dishes.length} items, ${menus.length} menus, ${branches.length} branches — ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
