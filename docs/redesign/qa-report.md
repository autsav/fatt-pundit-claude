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

### Comprehensive audit (19 Nov 2026, HEAD 49a9828, no code changes)
Findings and score: `comprehensive-audit.md`. Raw data: `audit/*.json`.

**Environment and tools:**
- Same PC, Node, Edge and WASM workaround as the baseline.
- Tools were installed in a scratch folder, not in the project: puppeteer-core 24.43, Lighthouse 12.8.2, axe-core 4.14.1, playwright-core 1.65, sharp 0.34.
- `@axe-core/puppeteer` would not load (package exports), so `axe.min.js` was injected directly.

**Commands (measured):**

| Command | Result |
| --- | --- |
| `npm run check` | 0 errors, 0 warnings, 5 hints |
| `npm test` | pass |
| `npm run validate:data` | 0 errors, 7 warnings (unchanged) |
| `npm run build` | 17 pages, 2.7 s |
| `npm audit` | 0 vulnerabilities |
| `npm outdated` | astro 7.4.13 (patch), typescript 7 (major), web-vitals 6 (major) |

**Sweep:**
- **Coverage:** 13 routes × {375, 390, 768 touch, 1024, 1440, 1920} + calm {390, 1440} = 104 loads, 3 in parallel.
- **What each load did:**
  - measured at the top of the page
  - scrolled 0.6 screen per step (scene pages) or 0.9 (others), waiting for in-view images, measuring each step and capturing a frame
  - measured again at the bottom
- **Results:**
  - sideways scroll 0 on all public pages; `/styleguide/` 7–8 px at 375/390
  - 0 JS errors
  - failed request: only `cg-lights-on.mp4` (aborted range request)
  - small targets failing the 2.5.8 spacing rule: 0
  - CLS > 0.01: `/allergens/` 0.139 @1024, 0.055 @1440, 0.039 @1920, 0.047 @1440 calm; CG 0.033 @1440; Soho calm 0.052 (while scrolling)
- The observed-LCP column in `sweep.json` was taken under 3× parallel load. It is not a performance measure.

**axe (WCAG 2.2 AA + best practice, after a full scroll, at 390/1440 normal + calm):**
- **serious `color-contrast`:**
  - home: 8 nodes, boarding-pass bands, 2.11–3.05:1
  - CG: `.cue`, 2.01:1
  - styleguide: swatches
- **serious `label-content-name-mismatch`:** home, 3
- **serious `scrollable-region-focusable`:** Soho, calm only
- **moderate `region`:** preview banner, every page
- **moderate `landmark-one-main`:** styleguide
- **Needs review:** `aria-prohibited-attr` 1,216 nodes (menu tag spans); `video-caption` 8 (silent loops)

**Lighthouse (one run each, home ×3 on mobile):**
- **Mobile Perf:**
  - home 87 / 90 / 88, LCP 3.73 / 3.48 / 3.63 s
  - Soho 98 (LCP 2.11 s)
  - CG 96 (LCP 2.64 s)
  - Dubai 99, Soho menu 99, allergens 100, private dining 100
- **Desktop:** 100 on all 7 pages, LCP 0.39–0.73 s.
- **Other scores:** A11y 100 and BP 100 everywhere. SEO 66–69 (only `is-crawlable`, noindex by design).

**Scroll jank** (the same method as `perf-budget.mjs`, run with playwright-core + Edge because the script's `execFileSync('lighthouse')` fails on Windows), 2 runs each:

| Page | Dropped frames |
| --- | --- |
| Home | 1.3% / 1.3% |
| Soho | 0.3% / 0.2% |
| CG | 0.7% / 1.2% |
| Dubai | 0.3% / 0.8% |
| Soho menu | 0.2% / 0.2% |

All are under the 2% budget.

**Keyboard:**
- **Coverage:** 254 tab stops (home 1440, Soho 1440 and 768, Soho menu 1440).
- **Focus visibility:** no focus indicator missing.
- **Hidden focus:** 3 stops under the arrival overlay while it plays.
- **Booking drawer:** opens on Enter, keeps focus inside over 30 tabs, closes on Escape, returns focus (Soho, CG). Days and times are 31 separate tab stops.

**Probes:**

| Probe | Result |
| --- | --- |
| Drawer URLs | Soho: `opentable.co.uk/restref/client/?rid=171789&restref=171789&datetime=2026-11-19T17:00&covers=2&lang=en-GB`. CG: `sevenrooms.com/explore/fattpunditcoventgarden/reservations/create/search/?date=2026-11-19&party_size=2&start_time=17:00` |
| Group message | Shown at 11 guests |
| **Home drawer +/−** | **Navigates to `/undefined` (404) at 390 and 1440, normal motion; stays on `/` in calm; Soho unaffected**. Cause: `BoardingPasses.astro:203` selects every `[data-step]` |
| Menu (390, 1440) | 186 dishes; "momo" 19; nonsense 0 + empty message; V filter 94; tools sticky at ≥1024 (780 px tall), static on phone (355 px) |
| Dubai waitlist | Empty submit blocked; valid submit shows "Thanks. (Demo only: nothing was sent.)" |
| Private dining | Empty submit marks date, guests, name and email invalid and focuses date |
| CG plate | Real tap flips it (false → true) and the caption reads "Kid goat momo, £8.50" |
| CG gallery tap | Opens `/_astro/gallery-01.CO-AmVvm.jpg` (original 665 KB) in a new tab |
| CG loop videos | Both paused while on screen after scrolling away and back (headless; unverified) |
| Intro | Releases the page 2.18–2.19 s after it starts (390 and 1440) |
| Phone header | Logo + Book only on `/`, `/soho/` and `/allergens/`; dock only on branch pages |

### Slice 2.3b (19 Nov 2026): home booking fix, smoke test, budget script on Windows

- **Cause (audit C01):** `BoardingPasses.astro` attached its "step inside" click handler to every `[data-step]` element. The Book drawer's + and − buttons use `data-step="1"` / `"-1"`, so on the home page they were sent to `button.href`, which is `undefined`.
- **Fix:** the pass links now use `data-step-inside`, and the handler selects `a[data-step-inside]`. Three lines changed.
- **New test:** `npm run test:smoke` (`scripts/smoke-booking.mjs`). Home (Soho and Covent Garden chosen in the drawer), /soho/ and /covent-garden/, at phone and desktop sizes: opens the drawer, presses + and −, checks the page stays put and the count changes, then checks the booking link (OpenTable `covers=2`, SevenRooms `party_size=2`). The booking sites are never loaded.
- **Result on the old build:** fails, "+ navigated to /undefined", home at both sizes. **On the new build:** 8 of 8 pass.
- `npm run check`: 0 errors. `npm run build`: 17 pages.
- **Budget script on Windows:** now runs with `LIGHTHOUSE=<path to lighthouse/cli/index.js>` and defaults to Edge. One run, home and Soho: performance 94 / 99, observed LCP 315 / 280 ms, TBT 176 / 3 ms, CLS 0 / 0, weight 975 / 267 KB, dropped frames **5.7% / 0.7%**. Home breaks the 2% dropped-frames budget in this run. The audit measured 1.3% or less with the arrival intro skipped; this script does not skip it, and the PC was short of memory during the run. Not re-run, so the cause is unconfirmed. The change in this slice only renames an attribute.
- Not tested: real phones, Safari, Firefox. The smoke test needs a browser and playwright supplied from outside the project, like the budget script.

### Slices 2.3c and 2.3d (20 Nov 2026)

**2.3c accessibility.** Checked with axe (WCAG 2.0 to 2.2 A and AA rules) on `/`, `/soho/`, `/covent-garden/`, `/dubai/` and `/soho/menu/` at 390 and 1440, normal and calm: **0 violations** on all 20 loads, no sideways scroll, no JS errors.
- Contrast (C03): pass bands now set ink-deep on the band colour (was paper, 2.1 to 3.1:1); the lights-on cue and the "Boarding soon" tag use tiger-deep; the Dubai gate code uses slate-deep.
- Labels (C04): pass stubs take their name from the visible words, plus a hidden "(opens in a new tab)".
- Pause (C05): a "Pause motion" button in the footer stops the rain, loop videos, the bar sweep and pulsing dots, and is remembered on the device. Measured on Covent Garden: 1 video playing, 0 after pausing, 0 after a reload, 1 after "Play motion".
- Calm scroller (C06): the Soho room strip can take keyboard focus.
- Intro (C07, O12): shown once per device, not once per session. While it plays, the first Tab lands on Skip and nothing behind it takes focus. A wheel, tap or key ends it (scroll back in 54 ms). The board now takes about 0.8 s from the moment it starts (it was about 1.5 s).
- Diet tags (C15): the meaning is real hidden text, not an `aria-label` on a span.
- Book drawer (C16): each of the day and time groups is one tab stop with arrow keys. From the day group to "Find a table" is 2 Tab presses (it was 31 or more).

**2.3d weight.** `frame.png` now goes through the image pipeline: 131 KB WebP (it was a 1.26 MB PNG); seen by eye on an open menu page at 1440. Branch gallery photos open in the same lightbox as the home page, from a 1600 px WebP, not the original JPEG in a new tab.
- Home lab LCP (C12) is unchanged: simulated 3.6 to 3.8 s, painted 0.25 to 0.37 s. Left as it is; field data decides.

**Budget script, same PC, same hour:**

| Build | Page | Perf | Painted LCP | TBT | CLS | Weight | Dropped frames |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Before (49a9828) | / | 88 | 246 ms | 53 ms | 0 | 976 KB | 12.4% |
| Before (49a9828) | /covent-garden/ | 99 | 183 ms | 3 ms | 0 | 996 KB | 8.8% |
| After 2.3d | / | 86 | 373 ms | 39 ms | 0 | 976 KB | 6.0% |
| After 2.3d | /covent-garden/ | 99 | 162 ms | 3 ms | 0 | 996 KB | 6.3% |
| After 2.3d | /soho/ | 99 | 324 ms | 5 ms | 0 | 267 KB | 0.7% |

The dropped-frame budget (2%) fails on this PC for the old build as well, and by more. The audit measured 1.3% or less on the same code, so today's figures show a loaded machine, not a change in the site. Single runs; treat differences of a few points as noise.

Also run: `npm run check` 0 errors, `npm test` passes, build 17 pages, booking smoke test 8 of 8.

### Slice 2.4: visit strip under the branch hero (20 Nov 2026)
- One ledger row on paper: today's status and hours (live, branch timezone), address, nearest stations, Call / Directions / Book. Phones show one fact per line; the actions are already in the hero. Dubai shows "Opening soon" and "Join the list".
- Checked on `/soho/`, `/covent-garden/`, `/dubai/` at 390, 768, 1440 and calm 1440: no sideways scroll, nothing in the strip past the edge, 0 JS errors, CLS 0 to 0.033, axe (WCAG 2.0 to 2.2 A/AA) **0 violations** on all 12 loads.
- Fixed during the gate: the "Good to know" luggage tags (2.5 work already on the branch) were a `<dl>` with an extra wrapper div, which axe flags (`definition-list`, `dlitem`). Now a list of tags with an `h3` each; looks the same.
- Screenshots: `slices/2.4/`. Also run: `npm run check` 0 errors, `npm test` passes, build 17 pages, booking smoke test 8 of 8.

### Slices 2.4a to 2.9 (20 Nov 2026)

**Checks on the final build** (every route, local preview, Edge headless):
- `npm run check` 0 errors; `npm test` passes; build 17 pages; booking smoke test 8 of 8 (phones now book from the dock).
- axe (WCAG 2.0 to 2.2 A and AA) at 390 and 1440, normal and calm: **0 violations** on every page except two. On home, 2 to 4 contrast readings on headings caught mid fade-in, which clear once the animation ends (0 after waiting). `/styleguide/` fails, as before (C19, internal page).
- Sideways scroll: none on any page at 320, 375, 768, 1024, 1440 or 1920, apart from `/styleguide/`. Fixed on the way: the footer's goodbye line and the "ACCESSIBILITY" title at 320.
- Load shift (CLS): 0 on every info and menu page at every width. Branch heroes read 0.001 on most loads, but about one load in three reads 0.023 to 0.066 at 1024 (0.033 at 1440 on CG). The build from before these slices (49a9828) gives the same readings, so this is the existing C17, not new.

**2.4a phone navigation.** At ≤640 px the bar shows the name and an **Index** link. The fixed dock at the bottom has Menus, Call (on branch pages) or Rooms (elsewhere), and Book. The Index is a numbered sheet of every destination and also appears where the bar's text links don't fit (641–719 px; 720–919 px on home and info pages). The page ends above the dock.

**2.5** Good to know is three luggage tags; the other rooms are airmail postcards. **2.6** "Pull up a chair" is a two-column spread at ≥1100 px; the Canton and Kolkata labels no longer collide at 390 (C13).

**2.7 font-swap shift.** Before → after, normal load: allergens 0.252 → 0 at 768, 0.162 → 0 at 1024, 0.055 → 0 at 1440; privacy 0.023 → 0 at 768. How: the body font is preloaded on text pages, the text column is measured in em (a `ch` changes width with the font), the fallback is Courier New sized per weight (bold split into capitals and the rest), and the preview banner never wraps. Still open: a slow first visit (200 KB/s) to allergens shifts 0.16 to 0.25 at 768 to 1024, because one paragraph re-wraps.

**2.7a menu list.** The two chip rows are labelled "Jump to" and "Show only". On phones and tablets the Jump to row stays under the header while you read. The full ledger restyle of the menu list is not done.

**2.8** `public/_headers` has a **report-only** Content-Security-Policy: it logs and blocks nothing. Check the browser console on the live host, then rename it to `Content-Security-Policy` to enforce it. Not testable locally (the preview server ignores `_headers`).

### Not tested in baseline
Real devices, Safari/Firefox, screen readers, keyboard-only walkthrough, INP in the field, newsletter, Plausible, the live Sheet CSV, the scroll-jank part of `perf-budget.mjs` (it needs Playwright).

### Artefacts
- `baseline/screens/*.webp`: full-page shots of the static pages (menus, info, 404) at 390/768/1440 and calm
- `baseline/frames/*_frames.webp`: contact sheets of viewport frames taken while scrolling home and the 3 branch pages at 390 and 1440. Full-page shots of these pages are misleading, because sticky scenes only paint at their own scroll position.
- `baseline/sweep.json`: raw sweep data
