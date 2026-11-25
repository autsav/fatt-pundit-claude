// Writes docs/ILLUSTRATOR-BRIEF.md from the story-art slots (one source with the site). Run: node scripts/illustrator-brief.ts
import { writeFileSync } from 'node:fs';
import { ART_SLOTS } from '../src/data/story-art-slots.ts';

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const aspect = (w: number, h: number) => { const r = w / h; const g = gcd(w, h); const exact = `${w / g}:${h / g}`; return exact.length <= 6 ? exact : `${r.toFixed(2)}:1`; };
const esc = (s: string) => s.replace(/\|/g, '\\|');
const rows = ART_SLOTS.map((s) => `| \`${s.id}\` | ${s.kind} | ${s.chapter} | ${esc(s.what)} | ${s.deliver.width} × ${s.deliver.height} | ${aspect(s.deliver.width, s.deliver.height)} | ${esc(s.deliver.layers)} | ${s.deliver.transparent ? 'Yes (alpha)' : 'No'} | ${s.placeholder ? '**Commission** (placeholder in place)' : 'Approved; redraw optional'} | \`${s.file}\` |`);
const commission = ART_SLOTS.filter((s) => s.placeholder);

const md = `# Illustrator brief: "The tale of Fatt & Pundit"

Generated from \`src/data/story-art-slots.ts\` by \`node scripts/illustrator-brief.ts\`. Do not edit by hand; edit the slots and re-run.

## What this is
The story page (/our-story/) is built and live with art in every slot below. **The owner keeps the tiger art in place as the final art (decision of 25 Nov 2026), so nothing is commissioned today.** This brief stays as the spec for any future redraw: a delivered file replaces the current one with **no code change** (save it under the delivery file name and rebuild).

**To commission: ${commission.length} slots.** All ${ART_SLOTS.length - commission.length} slots have owner-approved art; redrawing any of them in one hand is optional.

## Rules for every file
- Style: paper-cut / printed ephemera, matching the brand guidelines; brand palette (ink #2c2925, tiger #f15d3d, gold #cba052, sand #dac7b5, slate #758591, paper #f6efe4).
- **No lettering in the art** (captions, speech bubbles and signs are set in type by the site). Bengali/Chinese shop signs as shapes only, unless the owner supplies the exact words.
- Characters: Fatt (Hakka cook, Chinese tiger) and Pundit (Calcutta scholar, Indian tiger) stay on-model across every slot; one model sheet first, for sign-off.
- Size: at least the pixel size given (it is the largest the site shows, at 2× on phones). sRGB. PNG or WebP; JPEG is fine for flat panels.
- Transparency: "Yes" means a clean alpha edge, no halo, figure trimmed to its bounds with 2% padding.
- Comic panels keep the top 30% calm: the caption sits there.
- Delivery: one file per row, named exactly as in the last column.

## Slots (${ART_SLOTS.length})
| Slot ID | Kind | Chapter | What happens | Size (px) | Aspect | Layers | Transparency | Status | Delivery file |
|---|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
writeFileSync(new URL('../docs/ILLUSTRATOR-BRIEF.md', import.meta.url), md);
console.log(`docs/ILLUSTRATOR-BRIEF.md: ${ART_SLOTS.length} slots, ${commission.length} to commission`);
