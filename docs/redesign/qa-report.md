# QA report

Every entry says how it was obtained. Nothing here was checked on a real phone or in Safari.

## Baseline — 19 Nov 2026 (tag `baseline-pre-redesign`, commit 0ead5a8)

### Environment
- Windows 11, Node 24.19.0, npm 11.17.0
- Browser for tests: Microsoft Edge 157.0.4341.60 (Chromium), headless. Chrome is not installed.
- Lighthouse 12.8.2, mobile preset (simulated slow 4G, 4× CPU), installed in a scratch folder (not in the project)
- Astro preview of the production build (`npx astro preview`, port 4321)
- **Workaround:** Windows Application Control blocks `@bruits/satteri-win32-x64-msvc/*.node`. Install `@bruits/satteri-wasm32-wasi@0.11.7` (`npm i --no-save --force`) and run Astro with `NAPI_RS_FORCE_WASI=1`. Without it, `build`, `dev`, `preview` and `check` all fail.

### Commands
| Command | Result |
| --- | --- |
| `npm test` | exit 0, "hours: all tests passed" |
| `npm run validate:data` | exit 0. 62 items, 10 menus, 3 branches, 0 errors, 7 warnings (set-menu price; Soho vouchers URL; photos missing for momo-kid-goat, popcorn-cauliflower, hakka-chilly-paneer-lettuce-cups, malabar-monkfish-curry, bombay-chilly-prawns) |
| `npm run build` | exit 0, 12 s, 16 HTML pages |
| `npm run check` | **exit 1**, 1 error, 0 warnings, 5 hints. `astro.config.mjs:44:18 ts(2322)`: `{src,weight,style}[]` is not assignable to `[Variant, ...Variant[]]` |

### Page weight (from `dist/`, gzip) — measured
| Page | HTML | JS (files) | CSS |
| --- | --- | --- | --- |
| / | 29.0 KB | 116.7 KB (11) | 20.9 KB |
| /soho/ | 23.4 | 99.7 (6) | 20.1 |
| /covent-garden/ | 26.2 | 99.5 (6) | 20.1 |
| /dubai/ | 11.6 | 65.8 (3) | 20.1 |
| /soho/menu/, /covent-garden/menu/ | 18.1 / 18.0 | inline only | 18.4 |
| info pages | 7.7–8.7 | 0 | 16.4 |

The JS column counts scripts referenced in the HTML (entry points + island component/renderer URLs). Chunks loaded later through dynamic imports are not included.

### Lighthouse mobile — measured (1 run each, local preview build with noindex)
| Page | Perf | A11y | BP | SEO* | FCP | LCP (lab) | LCP (observed) | TBT | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 88 | 100 | 100 | 69 | 2.12 s | **3.66 s** | 0.27 s | 0 ms | 0.000 | 974 KB |
| /soho/ | 95 | 100 | 100 | 69 | 1.81 s | **2.80 s** | 0.35 s | 0 ms | 0.000 | 266 KB |
| /covent-garden/ | 97 | 100 | 100 | 69 | 1.23 s | 2.29 s | 0.27 s | 113 ms | 0.000 | 936 KB |
| /dubai/ | 97 | 100 | 100 | 66 | 1.66 s | 2.42 s | 0.21 s | 0 ms | 0.000 | 221 KB |
| /soho/menu/ | 99 | 100 | 100 | 66 | 1.51 s | 1.81 s | 0.13 s | 0 ms | 0.000 | 140 KB |

*The SEO score fails only on `is-crawlable` (the preview build sets noindex on purpose). No other SEO audit failed.
These are single runs, so expect ±5 on Perf. For comparison, todo.md [T] recorded home 88–92 and Dubai 100.

### Sweep — measured (puppeteer-core + Edge)
12 pages × {390, 768, 1440} plus calm mode (reduced motion) at {390, 1440} = 60 loads.
- Horizontal overflow: **0** of 60
- Page errors / console errors / HTTP ≥ 400: **0**
- Request failures: `/_astro/cg-lights-on.*.mp4` on /covent-garden/ (all 5 modes). Most likely an aborted media range request in headless; to confirm in a real browser.
- Page length (screens): home 16.2 @390 / 13.5 @1440; Soho 12.2 / 11.1; CG 11.5 / 10.1; Dubai 7.1 / 6.2; menus 38–41 / 28–30; info pages 3–5.

### Smoke tests — measured
| Flow | Result |
| --- | --- |
| Soho Book drawer → submit | opened; URL `opentable.co.uk/restref/client/?rid=171789&restref=171789&datetime=2026-11-19T17:00&covers=2&lang=en-GB` (intercepted, not followed) |
| CG Book drawer → submit | opened; URL `sevenrooms.com/explore/fattpunditcoventgarden/reservations/create/search/?date=2026-11-19&party_size=2&start_time=17:00` |
| Soho menu search "momo" | priced items 149 → 15 |
| Unknown URL | HTTP 404, "Lost luggage" page. **No heading element on the page** |
| Home branch chooser | links to all 3 branch pages present |

### Fix after baseline: astro check (19 Nov 2026)
- `astro.config.mjs`: font variants are now written inline in `fonts[0].options` so Astro's `[Variant, ...Variant[]]` type applies. Same files, same weights, same `FONT_BACKUP` switch.
- `npm run check`: exit 0, **0 errors**, 0 warnings, 5 hints (measured)
- `npm run build`: exit 0 (default fonts, American Typewriter files referenced in the built CSS) and exit 0 with `FONT_BACKUP=1` (Kameron referenced) (measured)

### Slice 2.1: foundation tokens (19 Nov 2026)
- Change: `src/styles/global.css` only. Spacing, grid, type-step and lift custom properties in a plain `:root` (not `@theme`); `.desk` grid (4/8/12 columns), `.desk-bleed-start/-end`, `.surface-night/-day/-paper` (each sets `--fp-ring`), `.accent-text`, `.lift-1/-2`.
- `npm run check`: 0 errors, 0 warnings, 5 hints. `npm run build`: exit 0 (measured)
- No-visual-change proof (measured): built before and after from the same tree (stash of this one file). **All 16 HTML pages identical** apart from asset hashes. Global CSS: **0 rules removed, 15 added**, and no page uses the new classes yet. Global CSS 12,517 → 12,970 bytes gzip (+453 B).
- Not re-run: Lighthouse and the screenshot sweep. Unnecessary when the HTML is identical and the CSS only adds rules nothing uses. They run again in slice 2.2+, where the visuals change.

### Slice 2.2: 404 heading + Tonight's board fit (19 Nov 2026)
- **Cause of the clipped board (audit 4.1):** `SplitFlapText` carries `text-3xl sm:text-5xl`. Our `text-[clamp(…)]` only replaced the base size (tailwind-merge keeps the `sm:` variant), so from 640 px the tiles were 48 px: 22 tiles × 0.8em × 48 px ≈ 845 px in a ~700 px board, clipped.
- **Fix:** `.tonight-rows` is now a size container. `.tonight-flap { font-size: min(32px, 100cqw / (--n × 0.8)) }`, where `--n` is the longest line's tile count, set by `TonightBoard.tsx`. Unlayered CSS, so it beats the component's utilities.
- **404:** "Lost luggage" `<p>` → `<h1>` (`font-size/line-height: inherit` keeps the look: 17 px computed).
- Measured (headless Edge, `/soho/` and `/covent-garden/` at 360/390/768/1024/1440): every row ≤ board width, no page overflow. Tile size 16.8 px @360, 18.5 px @390 (was ~13–14 px), 32 px @768+. All lines readable in full (screenshot check at 390 and 1440).
- CLS: one capture gave 0.257 on /soho/ @768. Three repeat runs with a shift trace gave **0.000**, so it is not reproducible and no shift source was found. All other widths ≤ 0.002.
- Lighthouse mobile (measured): /soho/ P95 A100 BP100, CLS 0. /covent-garden/ P94 on the first run (TBT 192 ms), then **P97, P97 (TBT 1 / 4 ms)** on reruns, matching the baseline 97. /404.html A100 BP100. (Lighthouse refuses to audit a URL that returns HTTP 404, so the file was audited directly.)
- `npm run check` 0 errors; `npm run build` exit 0.

### Slice 2.3: branch arrival as a desk spread (19 Nov 2026)
- Change (≥1024 px only; phones and 900–1023 unchanged): the hero becomes a 14-track grid (edge | 12 columns | edge). Photo hero (Covent Garden): the photo bleeds left to the end of col 7 and the name card (ink, gold rule) overlaps it at cols 7–12. Art hero (Soho sign, Dubai gate): words in cols 1–5, art bleeds right from col 6. The dark fade over the photo is gone, so no text sits on the photo. 1024–1439: the card widens to cols 6–12 with tighter padding. Hero image `sizes` = `(min-width:1024px) 62vw, 100vw` (preload matches).
- Hero name board: same fix as Tonight's board. `sm:text-5xl` no longer wins; `.arrival-flap` = intended `clamp(22px, 4.6vw, 56px)` but never wider than its column. Phone size unchanged (22 px). At 768 the name is now 35 px (it was 48 px by accident).
- Measured (headless Edge), 3 branches × 390/768/1024/1280/1440/1920 + calm @390/1440: no horizontal overflow, no JS errors, name board ≤ column width everywhere. All hero actions (Book/Call/Directions or Join/Directions) above the fold at 1024×768, 1280×720, 1366×768 and 1440×900.
- Screenshots: `slices/2.3/` (390, 1024, 1440, calm 1440, CG 1280×720). Before = `baseline/frames/*_frames.webp`.
- Lighthouse mobile: Soho P95, CG P97, Dubai P99. A11y 100 and BP 100 on all three. CLS 0.000. Desktop preset: P100 / A100 on all three. CG mobile weight 936 → 1005 KB = `cg-lights-on.mp4` (Lights-on scene further down) fully loaded in this run and aborted at baseline (0 KB). Hero requests unchanged on mobile.
- **New finding (existing before this slice, confirmed by A/B with the slice stashed):** at 768 px (non-touch), the site header's nav wraps to a second line after the typewriter font loads. It shifts the page 44 px: **CLS 0.229 on /soho/, 0.224 on /dubai/**, identical without slice 2.3. Covent Garden does not shift (its longer Book label already wraps in the fallback font). Fix belongs to `SiteHeader.astro` (reserve the line or collapse the nav earlier). Added to the roadmap.

### Slice 2.3a: header on one line at every width (19 Nov 2026)
- **Cause:** `.bar-in` and `.nav` were allowed to wrap. The header fit on one line in the fallback font, but the typewriter font is wider, so after it loaded the nav dropped to a second (or third) line and pushed the page down. Measured with the brand font: the home/info nav needs 965 px of content, branch navs 751–866 px.
- **Fix (`src/styles/site.css` only):** no wrapping. From 641 to 1099 px: brand 18 px, nav 13 px, short "Book a table" label. Text links hidden at 641–719 px, and at 720–919 px when the nav has 5 links (home, info pages), as on phones. Below 381 px: tighter brand and button so the bar fits at 320 px.
- **Header sweep** (5 page types × every 8 px from 320 to 1600, brand font loaded): **0 failures** (one line, inside the bar, no page overflow). Before: 210 failures (2–3 line header, up to 143 px tall, roughly 641–1060 px; plus 28 px sideways scroll at 320 px, which also existed before).
- **CLS** (5 pages × 320/390/768/768 touch/1024/1280/1440): home and branches all ≤ 0.004. **Soho @768: 0.229 → 0.0012; Dubai @768: 0.224 → 0.0012.**
- **New finding, not the header:** `/allergens/` (0.245 @768 → 0.055 @1440) and `/privacy/` (0.116 @768) shift on desktop sizes because the body text reflows when the typewriter font replaces Courier New (paragraphs lose a line, content moves up ~30 px). The nav doesn't move. Phones (touch emulation): 0. Moved to slice 2.7 (info pages): needs a metric-matched fallback (`size-adjust`) or `font-display` handling for the body font.
- **Lighthouse mobile:** Soho P99 A100 BP100. Home P86 A100 BP100 CLS 0.000. Home A/B with this slice stashed vs applied, 2 runs each: 86/87 vs 86/88, observed LCP ~0.30 s in both, so no effect from this slice. Home's lab score ranges 86–88 between runs (the baseline 88 was a single run).

### Not tested in baseline
Real devices, Safari/Firefox, screen readers, keyboard-only walkthrough, INP in the field, newsletter, Plausible, the live Sheet CSV, the scroll-jank part of `perf-budget.mjs` (it needs Playwright).

### Artefacts
- `baseline/screens/*.webp`: full-page shots of the static pages (menus, info, 404) at 390/768/1440 and calm
- `baseline/frames/*_frames.webp`: contact sheets of viewport frames taken while scrolling home and the 3 branch pages at 390 and 1440. Full-page shots of these pages are misleading, because sticky scenes only paint at their own scroll position.
- `baseline/sweep.json`: raw sweep data
