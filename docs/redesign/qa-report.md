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

### Not tested in baseline
Real devices, Safari/Firefox, screen readers, keyboard-only walkthrough, INP in the field, newsletter, Plausible, the live Sheet CSV, the scroll-jank part of `perf-budget.mjs` (it needs Playwright).

### Artefacts
- `baseline/screens/*.webp`: full-page shots of the static pages (menus, info, 404) at 390/768/1440 and calm
- `baseline/frames/*_frames.webp`: contact sheets of viewport frames taken while scrolling home and the 3 branch pages at 390 and 1440. Full-page shots of these pages are misleading, because sticky scenes only paint at their own scroll position.
- `baseline/sweep.json`: raw sweep data
