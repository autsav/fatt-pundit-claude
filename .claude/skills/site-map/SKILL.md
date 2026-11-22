---
name: site-map
description: "Read before exploring the codebase."
---

# Site map: where things live

Astro 7 + React islands + Tailwind 4, TypeScript strict. Copy the named pattern file instead of scanning.

## src/pages
- Routes. Info page: copy `accessibility.astro` (wraps `layouts/InfoPage.astro`).
- `[branch]/index.astro` = one template for /soho/, /covent-garden/, /dubai/; `[branch]/menu.astro` = list menus.
- `book.astro` booking desk, `private-dining.astro` groups form (copy for any form page).
- `og/[id].astro` share images, `styleguide/` preview-only showcase, `sitemap.xml.ts` + `robots.txt.ts`.
- New public page: add it to `INFO_PAGES` in `src/lib/pages.ts` (sitemap).

## src/layouts
- `Base.astro` (head, header, footer, analytics) and `InfoPage.astro` (text pages: summary, contents, questions).

## src/components
- `scenes/`: home story scenes. Static scene: copy `GateBoard.astro`; small React island: copy `OpenNowPill.tsx`.
- `branch/`: branch-page pieces. Copy `VisitStrip.astro` (static) or `BranchArrival.tsx` (island).
- `site/`: shared chrome (SiteHeader, SiteFooter, BookDrawer, ChapterRail, NextStep). Copy `NextStep.astro`.
- `story/`: `StoryComic.astro` for /our-story/ (data from `src/data/story.ts`).
- `kokonutui/`: vendored MIT components, restyled. Edit in place; don't add new ones without need.

## src/lib
- Pure TS helpers. Copy `format.ts` for a small helper, `hours.ts` for anything with tests (tested by `scripts/test-hours.ts`).
- `site-data.ts`: the only way pages read branches/dishes/menus/prices/hours. Add accessors here.
- `booking.ts` (drawer + desk), `motion-tokens.ts` + `reveal.ts` (motion language: `docs/MOTION.md`), `contrast.ts`, `dialog.ts`, `clock.ts`, `specials.ts`.

## src/data
- `branches.json`, `dishes.json`, `menus.json`, `specials.json`, `world-route.json` (generated), `story.ts`.
- Schemas in `src/content.config.ts` (Zod); cross-file checks in `scripts/validate-data.mjs`. Change both together.

## src/styles
- `tokens.css`: foundation tokens + semantic `--fp-*` colours per surface (`.surface-night|deep|day|paper|paper-light|gold`). Use roles, never raw brand colours.
- `components.css`: the `fp-` system: `.fp-btn(--primary|--text|--sm)`, `.fp-link`, `.fp-field/.fp-input/.fp-select`, `.fp-choice`, `.fp-ledger`, `.fp-facts`, `.fp-hours`, `.fp-badge`, `.fp-ticket`, `.fp-postcard`, `.fp-dialog`, `.fp-section-head`, `.fp-h2/.fp-h3`, `.fp-stack`. Reuse before writing CSS.
- `global.css`: brand palette (`@theme`), fonts, base. `site.css`: legacy chrome helpers (`.wrap`, `.stack`).
- Contrast of every token pair is checked by `scripts/check-contrast.ts` (build fails on breach).

## scripts/
- `verify.sh`: run via `npm run verify` (astro check, build, validate:data, test, test:contrast).
- `validate-data.mjs`, `test-hours.ts`, `check-contrast.ts`: build gates (also run in prebuild).
- `smoke-booking.mjs` (needs `astro preview` on :4321), `perf-budget.mjs` (Lighthouse + fps).
- `build-world-map.mjs`, `make-og.mjs`, `export-demo.mjs`: one-off generators.

## Docs
- `docs/CLIENT-INPUTS.md` (open client questions, keep updated), `docs/HANDOVER.md`. Skip `docs/redesign/`, `dist/`, `demo/`.
