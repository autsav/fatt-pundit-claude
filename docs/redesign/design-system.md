# Design system — as found (baseline)

This documents what exists today. The proposed changes come in Phase 1 and will be marked as such.
Sources: `src/styles/global.css`, `src/styles/site.css`, `src/lib/motion-tokens.ts`, `astro.config.mjs`, brand guidelines (B3, Aug 2026) as cited in code comments.

## Colour
| Token | Hex | Role (guidelines) |
| --- | --- | --- |
| `--color-ink` | #2c2925 | Main (Pantone Black C) |
| `--color-tiger` | #f15d3d | Main (Pantone 171 C) |
| `--color-gold` | #cba052 | Main (Pantone 7407 C) |
| `--color-sand` | #dac7b5 | Additional (Pantone 482 C) |
| `--color-slate` | #758591 | Additional (Pantone 7544 C) |
| `--color-tiger-deep` #93321b · `--color-gold-deep` #6b4c18 · `--color-slate-deep` #465460 · `--color-tiger-bright` #f5836a · `--color-ink-deep` #1a1714 | | Derived contrast tokens for text on paper and sand |
| `--color-paper` #f6efe4 · `--color-paper-light` #faf6ef | | Paper surfaces |

The focus ring colour follows the surface via `--fp-ring`, which is set on surfaces, never on the control (lesson 55).

## Type
- `--font-display`, `--font-body` and `--font-label` all point to `--font-typewriter` (American Typewriter 300/400/700; Kameron under `FONT_BACKUP=1`).
- `--font-note` uses `--font-lora` (Lora 500 italic). `font-synthesis: none`.
- Scale: modular 1.333 on desktop, h2 from 34 to 72 px, no text under 12 px except the decorative plate backs [todo E2].
- Hero h1: `clamp(52px, 10vw, 140px)`, uppercase bold.

## Buttons (`site.css`)
`.btn` (50 px min height, 17 px bold caps, 0.1em tracking), `.btn-sm` (44 px), and these variants: `.btn-orange` (primary, tiger on ink-deep text), `.btn-ink`, `.btn-line` (outline), `.btn-ghost-light` (outline on dark). Hover lifts 2 px with a hard offset shadow; press scales to 0.98. Text links are the third kind.

## Photo treatment
`.fp-photo`: `sepia(.14) saturate(.93) contrast(1.03)`, the house grade, applied to static photos only.

## Motion (`motion-tokens.ts`)
- Durations: fast 200 ms (feedback), story 900 ms / 1200 ms (reveals). Nothing in between.
- Springs: door, stamp, ui. Easings: out `[0.23,1,0.32,1]`, inOut `[0.65,0,0.35,1]`.
- Calm mode (`prefers-reduced-motion`) shows end states, not start states.

## Recurring motifs
Postage-stamp perforation, airmail-striped postcards, split-flap boards (digits/signs only while flipping), boarding passes with a tear-off stub, film-strip contact sheet, receipt, greaseproof tiger paper, gold line art (junk ship, mountains, compass).

## Gaps noted (for Phase 1, no decision yet)
- No documented spacing scale or layout grid tokens (a 1200 content width is mentioned in todo E3, not as a token).
- Semi Bold weight not available until fonts are licensed.
- No written component inventory beyond this page and `/styleguide/`.
