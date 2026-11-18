# Fatt Pundit rebuild: tasks

Plan: "Fatt Pundit Website Rebuild Plan" doc (10-day schedule). Tick only with proof (build log, screenshot, test output).

## Launch blockers (must be done before DNS switch)
- [ ] **Font licence**: current American Typewriter files came from ufonts.com (1997 E+F Designstudios digitisation, no web licence). Buy ITC American Typewriter web fonts (Monotype) and drop them into `src/assets/fonts/american-typewriter/` with the same filenames. Licensed set should include Semi Bold (guidelines use it for subtitles; we use Bold until then).
- [ ] Client confirms every row in docs/content-discrepancies.md
- [ ] Logo SVGs from B3 branding pack replace PNG placeholders in src/assets/images/brand/
- [ ] Geo coordinates for Soho and Covent Garden (schema + map)
- [ ] Remove or protect /styleguide/

## Day 1: inputs and content  ✅ done 18 Nov
- [x] Crawl old site (no sitemap; 7 live URLs) → docs/redirects.csv
- [x] Menus from live site → src/data/dishes.json (35 dishes, 27 drinks) + src/data/menus.json (10 menus)
- [x] Branches → src/data/branches.json (Soho, Covent Garden, Dubai opening-soon)
- [x] Zod schemas (src/content.config.ts) + cross-file checks (scripts/validate-data.mjs, runs as prebuild)
- [x] Proved validators fail on bad data (unknown dish id → exit 1; "25:00" → schema error)
- [x] Diet tags derived from the dietary menus, not guessed
- [x] Discrepancy report for client: docs/content-discrepancies.md
- [ ] Send client input list + discrepancy report (Utsab)

## Foundation pulled forward (from day 4)
- [x] Astro 7 + Tailwind 4 + TypeScript strict
- [x] Brand tokens in src/styles/global.css (5 colours, contrast notes)
- [x] American Typewriter (Light/Regular/Bold + Condensed set) + Lora Medium Italic, self-hosted woff2
- [x] src/assets/images/ structure + README of expected files; brand placeholders cut from guidelines PDF
- [x] /styleguide/ renders fonts, colours, branches, à la carte from data (screenshot checked, desktop + 375 px)
- [x] `astro check` 0 errors; `npm run build` passes

## Day 2: journey storyboard (next)
- [ ] docs/journey-storyboard.md: 7 scenes, copy ≤ 25 words each, asset per scene, motion note, reduced-motion still
- [ ] Client approves direction

## Day 3: design
- [ ] Home scenes 1–3, one location page, one menu page; mobile + desktop

## Day 4: foundation (rest)
- [ ] BaseLayout, header, footer (all branches), sticky Book bar with branch picker
- [ ] <OpeningHours> with "open now" per branch timezone + unit tests incl. BST/GMT change
- [ ] <Price> per branch currency

## Days 5–10
See plan doc.
