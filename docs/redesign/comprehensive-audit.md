# Comprehensive website audit

Date: 19 Nov 2026 · Branch `redesign/world-class` @ `49a9828` (baseline + slices 2.1, 2.2, 2.3, 2.3a) · **No UI or source code was changed for this audit.**

This is the "Phase 1 — comprehensive website audit" from the redesign brief. (In `implementation-roadmap.md`, "Phase 1" is the approved design direction; this audit sits beside it and updates the Phase 2 slice list in §8.)

**Evidence key:**
- **[M]** measured in this audit (raw data in `audit/*.json`, method in `qa-report.md` → "Comprehensive audit")
- **[V]** seen in this audit's screenshots (`audit/sheets/`, `audit/first/`, `audit/probes/`)
- **[C]** read from the code
- **[U]** not verified

**Method:** headless Microsoft Edge 157 (Chromium) against the production build (`astro preview`).
- **Sweep:** 13 routes × 6 widths (375, 390, 768, 1024, 1440, 1920) + calm mode (reduced motion) at 390 and 1440 = 104 page loads.
- **Checks:** axe-core 4.14 (WCAG 2.2 AA + best practice) on 52 of those loads, Lighthouse 12.8.2 on 7 pages (mobile + desktop), a keyboard walk of 254 tab stops, and scripted interaction probes.
- **Not covered:** real phones, Safari and Firefox were not used.

---

## 0. Summary

**Score: 70 / 100** (method in §5). The site has a rare, original brand concept that is carried out with discipline. It is fast on desktop and does not overflow at any width. Booking deep links are correct on branch pages.

What holds it back:
1. **One critical bug in the main booking path** (C01).
2. **Demo-only waitlists and a `mailto:` enquiry form**, so there are no working lead capture forms (C02, C23).
3. **WCAG AA failures that Lighthouse's 100 score hides**, because Lighthouse only looks at the first screen (C03–C07).
4. **Wide screens that still read as a phone column with empty space around it** (O01).

Top 5 confirmed defects:

| # | Defect | Severity |
| --- | --- | --- |
| C01 | Home page: tapping **+** or **−** (party size) in the Book drawer sends the guest to `/undefined` (404) | **Critical** |
| C02 | Waitlists (Dubai page + home Dubai boarding pass) throw the email away: "Demo only: nothing was sent" | High |
| C03 | Text contrast 2.0–3.1:1 on the home boarding-pass bands and the Covent Garden "lights on" cue | High |
| C11 | Phones: the header has only the logo and Book; home and info pages offer no route to menus or branches except the footer | Medium |
| C09 | A 1.26 MB unoptimised PNG is used as the menu book's border | Medium |

---

## 1. Technical discovery [C][M]

### Stack and structure

| Layer | What |
| --- | --- |
| Framework | Astro 7.4.12, static output, `trailingSlash: 'always'`, view transitions (`@view-transition`), speculation-rules prerender |
| UI | React 19 islands (`client:idle` / `client:visible` / `client:load`), `motion` 14 (5 imports), `animejs` 4 (arrival intro only), a vendored KokonutUI set (MIT: rain glass, page flip, split-flap, typewriter, marker, attract button) |
| Styling | Tailwind 4 via `@tailwindcss/vite`. `src/styles/global.css` (22.7 KB: `@theme` tokens, `@layer base/components`, focus ring, view transitions, slice 2.1 layout tokens). `site.css` (7 KB: buttons, header). 17 components with scoped `<style>`. 401 `class=""` attributes in `.astro` files. 16 `!important`. |
| Fonts | Self-hosted via Astro `fonts`. American Typewriter 300/400/700 (**unlicensed files**, launch blocker) + Lora 500 italic (OFL). `FONT_BACKUP=1` → Kameron (OFL). Bold + Lora preloaded. |
| Data | `src/data/{branches,dishes,menus,specials,world-route}.json`, Zod schema (`content.config.ts`) + `scripts/validate-data.mjs` (runs before every build) |
| Pages | `index`, `[branch]/index` (Soho, Covent Garden, Dubai), `[branch]/menu` (Soho, CG), `private-dining`, `allergens`, `privacy`, `accessibility`, `booking-terms`, `404`, `styleguide` (internal), `og/[id]` (share-card sources), `robots.txt.ts`, `sitemap.xml.ts` → 17 HTML files |
| Components | `scenes/` (11: Arrival, ArrivalBoard, RainHero, GateBoard, Doors, Voyage, MenuBook, BarAfterDark, RoomContactSheet, BoardingPasses, OpenNowPill). `branch/` (4: BranchArrival, TonightBoard, WalkTheRoom, PlateWall). `site/` (10: SiteHeader, SiteFooter, BookDrawer, DishPassport, Goodbye, LightsOn, LoopVideo, LampHalos, Analytics). `kokonutui/` (6). Layouts `Base`, `InfoPage`. |
| Largest source files | `[branch]/index.astro` 39.9 KB, `rain-glass-background.tsx` 23.9 KB, `page-flip.tsx` 22.3 KB, `MenuBook.tsx` 21.6 KB, `index.astro` 19.1 KB |

### Dependencies [M]
- **Security:** `npm audit` reports **0 vulnerabilities** (all dependencies and production only).
- **Outdated:** 3 packages: `astro` 7.4.12 → 7.4.13 (patch), `typescript` 6 → 7 (major), `web-vitals` 5 → 6 (major).
- **Unused:** none. Every dependency is imported. `@fontsource/kameron` is used only by the licence-backup build. The d3/topojson/world-atlas dev dependencies are used by `scripts/build-world-map.mjs`.

### Assets [M]
- **Large source images:** `voyage-sea.png` 1.4 MB, `frame.png` 1.3 MB, `menu-back-map.png` 1.2 MB, and CG gallery JPEGs at 0.64–1.25 MB. Most go through Astro's image pipeline. Two exceptions:
  - `frame.png` is shipped as the **original** file (C09).
  - Gallery links point at the **original** JPEGs (C10).
- **Videos:** `cg-booths-glow.mp4` and `cg-lights-on.mp4`, both `preload="none"` with a poster image.

### Integrations

| Integration | State |
| --- | --- |
| **Booking** | `BookDrawer.astro` builds OpenTable links (Soho, `rid=171789`) and SevenRooms links (CG, `fattpunditcoventgarden`). Both were intercepted and are correct [M]. |
| **Tonight's board** | Google Sheet CSV (`SPECIALS_CSV_URL` / `PUBLIC_SPECIALS_CSV_URL`), falling back to `specials.json`. It shows "sample lines" today [V]. |
| **Analytics** | Plausible + web-vitals, switched on by `PUBLIC_PLAUSIBLE_DOMAIN` (not set). |
| **Newsletter** | `PUBLIC_NEWSLETTER_ACTION` (not set, so the form is hidden) [M]. |
| **Waitlist** | Demo only; nothing is stored (C02) [M][C]. |
| **Private dining** | `mailto:` (C23) [C]. |
| **Third-party scripts** | None in the build [M]. |

### Build, test, start, deploy [C][M]
- **Commands:**
  - `npm run dev` / `build` / `preview` / `check`
  - `npm test` (opening hours, GMT/BST)
  - `npm run validate:data` (also runs as `prebuild`)
  - `npm run perf:budget`
- **Deploy:** Cloudflare Pages or Netlify (`public/_headers`). Build command `npm run build`, output `dist/`. Env vars are listed in `docs/HANDOVER.md`.
- **This PC:**
  - Windows Application Control blocks the native `satteri` binary. Builds need `@bruits/satteri-wasm32-wasi` + `NAPI_RS_FORCE_WASI=1`. That package is present now, and `npm install` removes it.
  - `perf-budget.mjs` cannot run on Windows (C20).
- **Results today [M]:**
  - `check` 0 errors / 0 warnings / 5 hints
  - `test` pass
  - `validate:data` 0 errors / 7 content warnings
  - `build` pass, 17 pages in 2.7 s

---

## 2. Measured results

### Lighthouse 12.8.2 [M]
Local preview build, so noindex is on. SEO is 66–69 only because of `is-crawlable`, which is by design. No other SEO, accessibility or best-practice audit failed.

| Page | Mobile Perf | Lab LCP | TBT | CLS | Weight | Desktop Perf / LCP |
| --- | --- | --- | --- | --- | --- | --- |
| `/` (3 runs) | **87 / 90 / 88** (median 88) | **3.73 / 3.48 / 3.63 s** | 0–7 ms | 0.000 | 975 KB | 100 / 0.73 s |
| `/soho/` | 98 | 2.11 s | 0 | 0.000 | 267 KB | 100 / 0.46 s |
| `/covent-garden/` | 96 | **2.64 s** | 0 | 0.000 | 937 KB | 100 / 0.72 s |
| `/dubai/` | 99 | 1.81 s | 0 | 0.000 | 222 KB | 100 / 0.54 s |
| `/soho/menu/` | 99 | 1.82 s | 0 | 0.000 | 141 KB | 100 / 0.45 s |
| `/allergens/` | 100 | 1.73 s | 0 | 0.001 | 153 KB | 100 / 0.39 s |
| `/private-dining/` | 100 | 1.74 s | 0 | 0.000 | 154 KB | 100 / 0.39 s |

Accessibility is 100 and best practices 100 on every page, mobile and desktop. Both scores audit the first screen only. axe after scrolling finds real failures (§4).

### Sweep: 104 loads [M]
- **Sideways scroll:** **0** on all 12 public pages × 8 modes. Only `/styleguide/` scrolls sideways (7–8 px at 375/390, C19).
- **Errors:** 0 JS errors. The only HTTP ≥ 400 is the intended 404 page. The only request failure is the CG `cg-lights-on.mp4` range request aborted by headless Edge (seen at baseline too).
- **CLS:** ≤ 0.004 on every page and width **except**:
  - `/allergens/`: 0.139 @1024, 0.055 @1440, 0.039 @1920, 0.047 @1440 calm (C08)
  - `/covent-garden/` 0.033 @1440 (C17)
  - Soho calm 0.052 accumulated while scrolling (C17)
- **Targets:** no target under 24 px fails the WCAG 2.5.8 spacing rule (0 failures).
- **Text under 12 px:** home menu-book cover (10.8 px) and the CG plate wall (6.2–11.9 px, C14).
- **Page length (screens):**

  | Page | 375 | 390 | 1440 |
  | --- | --- | --- | --- |
  | Home | 16.6 | 16.2 | 13.5 |
  | Soho | 12.7 | 12.2 | 11.0 |
  | CG | 12.0 | 11.5 | 10.0 |
  | Dubai | 7.4 | 7.1 | 6.2 |
  | Menus | 41–44 | 38–41 | 28–30 |
  | Info pages | 4–5 | 4–5 | 3 |

### Other measurements [M]
- **Keyboard:** 254 tab stops across home, Soho (1440 and 768) and the Soho menu. **Focus ring visible on 100%.** 3 stops hidden under the intro overlay (C07). 5 diet-filter inputs are visually hidden, but their label shows the ring.
- **Scroll smoothness** (the project's own test method: phone, 4× CPU, 600 frames): dropped frames are home 1.3%, CG 0.7–1.2%, Dubai 0.3–0.8%, Soho 0.2–0.3%, menu 0.2%. **All within the 2% budget.**
- **Page weight (gzip, from `dist`):**

  | Page | HTML | JS (files) | CSS |
  | --- | --- | --- | --- |
  | Home | 29.0 KB | 116.7 KB (11) | 21.5 KB |
  | Soho / CG | 23.4 / 26.2 KB | ≈100 KB (6) | — |
  | Dubai | — | 65.8 KB | — |
  | Menus and info pages | — | 0 JS files | — |

  These match the baseline.

---

## 3. Page-by-page audit

### 3.1 Home `/`
- **Visual [V]:**
  - **Strong:** rain-glass hero with the wordmark and the departure-board branch chooser, the voyage map with postcards, the Bar section (photo + drinks card), the film-strip room sheet, and the three boarding passes.
  - **Weak at 1440 and 1920:**
    - the doors scene is a thin band in an empty ink field
    - the menu book is small in a large sand field
    - "Pull up a chair" is a left heading with an empty right half
    - the goodbye door panels are blank black rectangles (O01)
  - Two rows of 11 multicoloured menu chips read busy. Tracked capitals are used on running text (O06).
- **UX [M][V]:**
  - A **first-visit intro** ("Now arriving") locks scrolling for **≈2.2 s** after it starts. It replays on every new browser session (C07, O12).
  - On phones the header offers only Book. There is no dock, so the menus and branch pages are 16 screens away, in the footer (C11).
  - The rating "4.6 / 5 from more than 1,170 diners on OpenTable (Soho, November 2026)" is hard-coded and unverified (C22).
  - The goodbye receipt repeats the footer's hours and addresses (O09).
  - Branch rows show a clock ("▲ 4.01pm") next to "Opens 5pm", which reads like a second opening time (O08).
- **Function [M]:**
  - **The Book drawer navigates to `/undefined` when + or − is tapped (C01).**
  - The menu book turns pages (page 1 → 2–3 of 11).
  - "See the Soho menu" re-opens the book on that branch.
  - The pass stubs open the booking links.
  - The Dubai pass waitlist is demo only (C02).
- **Responsive [M][V]:** no overflow in 8 modes. At 390 calm, the voyage map labels collide ("KolkataCanton", C13).
- **Accessibility [M]:**
  - axe: contrast on the boarding-pass bands, 8 nodes (C03)
  - label-in-name failures, 3 (C04)
  - Skip button inside `aria-hidden` (C07)
  - no pause control for the rain (C05)
- **Performance [M]:**
  - Mobile Perf 87–90. Lab LCP 3.5–3.7 s, over the 2.5 s target (C12); the baseline measured observed LCP at ≈0.3 s.
  - 117 KB of JS across 11 files.
  - Reaching the menu book adds the 1.26 MB `frame.png` (C09).
  - Scroll jank 1.3%.

### 3.2 Soho `/soho/`
- **Visual [V]:**
  - At ≥1024 the typographic hero sets the words in columns 1–5 and the Westminster street sign on the right (slice 2.3). It is honest and on-brand. The dark field around it is still large.
  - "Walk the room" uses plan drawings in place of photos (honest placeholder). At 1440 the next and previous cards show cut-off titles at the frame edges (O07).
  - The Kid goat momo signature spread works. "Good to know" uses generic white icon cards (O02).
- **UX [M][V]:**
  - The phone dock (Book, Menu, Directions) and the drawer work. The drawer builds the correct OpenTable URL, keeps focus inside, closes on Escape and returns focus.
  - Hours and address sit about two-thirds of the way down (O03).
  - Tonight's board shows "sample lines" (C26).
- **Accessibility [M]:** in calm mode, the "Walk the room" scroller cannot be reached by keyboard (C06).
- **Performance [M]:** mobile 98, LCP 2.11 s, 267 KB, jank 0.2–0.3%.

### 3.3 Covent Garden `/covent-garden/`
- **Visual [V]:**
  - The photo + name-card desk spread (slice 2.3) is the strongest first screen on the site at every width ≥1024.
  - The lights-on wall, the plate wall and the film strip are distinctive.
  - Tonight's board is narrow in a wide ink band at 1440. The "White Tiger" spread and "The other rooms" leave large empty sand areas (O01).
- **UX [M]:** tapping a gallery photo opens the **original 0.67–1.25 MB JPEG** in a new tab, with no lightbox (C10). The home page already has one (`RoomContactSheet`).
- **Function [M]:**
  - A real tap flips a plate, and the caption shows "Kid goat momo, £8.50".
  - SevenRooms link correct.
  - Both loop videos were found paused while on screen in headless Edge (C27, unverified).
- **Accessibility [M]:**
  - The "Scroll to turn the lights on / Good evening" cue in tiger on sand is **2.01:1** (C03).
  - Plate text is 6.2–10 px on phones (C14).
- **Performance [M]:** mobile 96, **LCP 2.64 s** (C12), 937 KB, CLS 0.033 @1440 (C17), jank 0.7–1.2%.

### 3.4 Dubai `/dubai/`
- **Visual [V]:** outlined "DXB" art hero, the gold waitlist band, "What we're packing" ticket cards. After "Boarding soon." there is ≈250 px of empty sand at 1440 (O01).
- **UX / Function [M]:** the waitlist is the page's only action, and it **stores nothing** (C02). Empty submit is blocked by the browser (`required`).
- **Performance [M]:** mobile 99, LCP 1.81 s, 222 KB.

### 3.5 Menus `/soho/menu/`, `/covent-garden/menu/`
- **Visual [V]:** a menu printed on paper, a sticky index + filters column at ≥1024, and clean "name … price" rows.
- **UX [M][V]:**
  - Search "momo" → 19 of 186. Nonsense → "0 dishes match" plus a clear empty message. "V" filter → 94. The live count is announced (`aria-live`).
  - On phones the page is **38–44 screens** long and the tools are not sticky (O04).
  - Two chip rows repeat the same words with different behaviour ("Vegan" jumps to a menu; "VG Vegan" filters) (O05).
  - Print button present. Dish passport stamps toggle (`aria-pressed`) [M].
- **Accessibility:** diet-tag expansions are carried in `aria-label` on a `<span>`, which screen readers may ignore (C15). The search has an `sr-only` label [C].
- **Performance [M]:** mobile 99, no JS files (inline only), 141 KB.

### 3.6 Private dining `/private-dining/`
- **Visual [V]:** a paper document with clear field groups. At 1920 the type is small for the canvas (O10).
- **Function [M][C]:**
  - An empty submit flags date, guests, name and email and focuses the first invalid field.
  - A valid submit **builds a `mailto:` link**. Without a mail app, nothing visible happens, and the restaurant keeps no record (C23).
- **Performance:** mobile 100.

### 3.7 Info pages: `/allergens/`, `/privacy/`, `/accessibility/`, `/booking-terms/`
- **Visual [V]:** a consistent document layout. At desktop widths the column is narrow with small type (O10, slice 2.7).
- **Technical [M]:**
  - `/allergens/` **shifts as the font swaps**: CLS 0.139 @1024 (C08).
  - The wording is client-unconfirmed draft (known launch blocker).
  - Mobile 100.

### 3.8 404
- **Visual / Function [M][V]:**
  - The "Lost luggage" tag works at every width, with links home and to all 3 branches.
  - It returns HTTP 404 and has a real `<h1>` (fixed in slice 2.2).

### 3.9 `/styleguide/` (internal)
- **Exposed** in the build (noindex only).
- 7–8 px sideways scroll at 375/390, no `<main>`, and failing swatch contrast samples (C19). Remove or protect before launch (known blocker).

### 3.10 `/og/*` (share-card sources)
Four pages render the 1200×630 cards used by `scripts/make-og.mjs`. They have no meta description and are not in the sitemap. That is fine for build-only pages, but they are publicly reachable [M].

---

## 4. Issue register

**Type:** **D** = confirmed defect · **O** = design opportunity (subjective) · **U** = unverified.
**Severity:** Critical (breaks a core task) · High (blocks launch or fails WCAG AA on key content) · Medium (clear harm to some users or the business) · Low (polish).
**Slice:** where it would be fixed (see §8).

### 4.1 Confirmed defects

| ID | Type | Sev | Issue | Impact | Evidence | Files | Slice |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C01 | D | **Critical** | Home Book drawer: **+ / −** navigates to `/undefined` (404) after 240 ms. `BoardingPasses.astro` binds a "step inside" redirect to every `[data-step]`, and the drawer's party-size buttons use `data-step` too. | Every home visitor who changes party size loses the booking. Not in calm mode; branch pages unaffected | [M] reproduced on phone + desktop, 3/3 runs; calm OK; Soho OK | `src/components/scenes/BoardingPasses.astro:203`, `src/components/site/BookDrawer.astro:49,51` | 2.3b |
| C02 | D | High | Waitlists discard the email and say "Demo only: nothing was sent" | Dubai's only call to action collects nothing; lost leads at launch | [M] probe; [C] | `src/pages/[branch]/index.astro:400-408`, `src/pages/index.astro:213-215`, `BoardingPasses.astro:74` | 2.8a (needs a provider) |
| C03 | D | High | Contrast below 4.5:1. Boarding-pass bands: paper on tiger 3.05:1 and on gold 2.11:1, 12 px bold, 8 nodes. CG lights-on cue: tiger on sand 2.01:1, 18 px | Fails WCAG 1.4.3 AA on booking UI | [M] axe at 390/1440, normal + calm | `BoardingPasses.astro:224-225`, `src/components/site/LightsOn.astro:122-123` | 2.3c |
| C04 | D | Medium | Accessible name doesn't contain the visible label: pass stubs ("Book at Soho" visible vs "Book a table at Soho on OpenTable…") and the Dubai waitlist link | Voice-control users can't activate them by what they see (WCAG 2.5.3) | [M] axe | `BoardingPasses.astro:96` | 2.3c |
| C05 | D | Medium | No on-page pause or stop for content that starts moving on its own and runs > 5 s: rain canvas, loop videos, pinging "open" dot | WCAG 2.2.2. Reduced-motion is respected, but that is an OS setting few people know about | [C] no pause control in any component | `src/components/scenes/RainHero.tsx`, `src/components/site/LoopVideo.astro`, `src/components/scenes/OpenNowPill.tsx:41-42` | 2.3c |
| C06 | D | Medium | Calm mode: the Soho "Walk the room" scroller can't receive keyboard focus, so later stops can't be scrolled to | WCAG 2.1.1 for keyboard users who also use reduced motion | [M] axe `scrollable-region-focusable` | `src/components/branch/WalkTheRoom.tsx` | 2.3c |
| C07 | D | Medium | Arrival intro: the Skip button is focusable inside `aria-hidden="true"`. While it plays, focus lands on header links hidden under the overlay. Scroll is locked ≈2.2 s, once per browser session | WCAG 4.1.2 / 2.4.11. Every new session waits | [M] keyboard walk (3 stops hidden), timing probe; [C] | `src/components/scenes/Arrival.astro:25,34,67` | 2.3c |
| C08 | D | Medium | Info pages shift when the brand font replaces Courier New: CLS 0.139 @1024, 0.055 @1440, 0.039 @1920 | Fails the project budget (0.05). At 1024 it fails "good" (0.1) | [M] sweep, shift source `<p>` | `src/layouts/InfoPage.astro`, font fallbacks in `astro.config.mjs` | 2.7 |
| C09 | D | Medium | `frame.png` (1.26 MB original PNG) used as the menu book's `border-image`, bypassing the image pipeline | +1.26 MB per visit on home, Soho and CG once the menu book renders | [M] `dist/_astro`; [C] | `src/components/scenes/MenuBook.tsx:117`, `src/pages/index.astro:121`, `src/pages/[branch]/index.astro:97` | 2.3d |
| C10 | D | Medium | Branch gallery photos link to the original JPEG (0.67–1.25 MB) in a new tab; no lightbox | Heavy download on phones, leaves the site, inconsistent with home's lightbox | [M] probe (new tab `/_astro/gallery-01.CO-AmVvm.jpg`) | `src/pages/[branch]/index.astro:217` | 2.3d |
| C11 | D | Medium | Phones (≤640): the header shows only the logo and Book on every page; a dock exists only on branch pages | Home (16 screens) and info pages give no route to menus or branches except the footer | [M] probe of visible header items | `src/components/site/SiteHeader.astro`, `src/styles/site.css` | 2.4a |
| C12 | D | Medium | Mobile lab LCP over 2.5 s on home (3.48–3.73 s) and CG (2.64 s) | Fails the CWV target in lab conditions. Observed LCP was ≈0.3 s at baseline, so field data decides | [M] Lighthouse | Home first screen; preloaded fonts (`Base.astro:71-74`), see lessons 43/44/51 | 2.3d (investigate) |
| C13 | D | Low | Voyage map labels "Kolkata" and "Canton" collide at 390 (calm end state) | Looks broken at phone width | [V] `sheets/home_390-calm_01` #4 | `src/components/scenes/Voyage.tsx` | 2.6 |
| C14 | D | Low | Plate-wall back faces set prices at 6.2–10 px on phones (names 10.5–11.9 px at desktop) | Unreadable; a caption under the wall shows the last plate's name + price | [M] sweep | `src/components/branch/PlateWall.tsx` | 2.5 |
| C15 | D | Low | Diet-tag meaning is in `aria-label` on a `<span>` (not allowed on a generic role) | Screen readers may read "V · VG · DF" without the meaning | [M] axe "needs review" (1,216 nodes) | `src/pages/[branch]/menu.astro:104` | 2.3c |
| C16 | D | Low | Book drawer: days and times use `role="radio"`, but every option is its own tab stop | 31+ tab presses to reach "Find a table" | [M] keyboard probe | `BookDrawer.astro:162-185` | 2.3c |
| C17 | D | Low | CG load shift 0.033 @1440 (hero + nav). Soho calm shifts 0.052 while scrolling (signature stamp image) | Within "good"; Soho calm is just over the budget | [M] sweep | `BranchArrival`/`SiteHeader`; signature card image | 2.7 |
| C18 | D | Low | Preview banner sits outside landmarks (axe `region`, every page) | Goes away at launch | [M] axe | `SiteHeader.astro:26` | none (launch) |
| C19 | D | Low | `/styleguide/` public, sideways scroll at 375/390, no `<main>`, failing contrast samples | Internal page reachable by anyone | [M] | `src/pages/styleguide.astro` | Launch blocker |
| C20 | D | Low | `perf-budget.mjs` can't run on Windows (`execFileSync('lighthouse')` doesn't resolve `.cmd`) and defaults to a Linux Chrome path | The budget gate can't run on the dev PC | [M][C] | `scripts/perf-budget.mjs:43-46` | 2.3b (tooling) |
| C21 | D | Low | The native build binary is blocked on this PC; the WASM workaround disappears on `npm install` | Fragile builds | [M] | environment | doc only |
| C22 | D | Medium | Rating claim hard-coded and unverified: "4.6 / 5 from more than 1,170 diners on OpenTable (Soho, November 2026)". Not in `content-discrepancies.md` | Review claims must be accurate and current (consumer law); it goes stale | [C] | `src/pages/index.astro:181` | Client |
| C23 | D | Medium | Private-dining enquiry uses `mailto:` | No mail app means nothing happens; no confirmation, no record; highest-value leads | [C][M] | `src/pages/private-dining.astro:11,53-64` | 2.8a |
| C24 | D | Low | House term mixed: home title "Chinese-Indian" vs "Indo-Chinese" (5 uses) | Brand and SEO inconsistency | [M] | `src/pages/index.astro`, page titles | Client |
| C25 | D | Low | No Content-Security-Policy; no HSTS in `_headers` (the host may add HSTS) | Defence in depth | [C] | `public/_headers` | 2.8 |
| C26 | D | Low | Tonight's board shows "sample lines" until the Sheet env var is set | Placeholder visible if launched unset | [V][C] | env `SPECIALS_CSV_URL` | 2.8a |
| C27 | U | — | CG loop videos (hero glow, lights-on) found paused while on screen after scrolling away and back | Possibly a headless-only artefact | [M] headless only | `LoopVideo.astro`, `LightsOn.astro` | 2.9 (real device) |

### 4.2 Design opportunities (subjective)

| ID | Opportunity | Evidence | Slice |
| --- | --- | --- | --- |
| O01 | **Desktop voids.** At ≥1024 many sections are a phone column in a wide empty field: home doors band, menu book, "Pull up a chair", goodbye door panels; branch Tonight's board, signature spread, "The other rooms"; Dubai room block | [V] `sheets/*_1440_*`, `*_1920_*` | 2.5, 2.6 |
| O02 | "Good to know" is a generic white-card-with-line-icon pattern, the one place the site looks like a template | [V] | 2.5 (luggage tags) |
| O03 | Essentials buried: branch hours and address sit ~⅔ down the page | [M] page length | 2.4 (visit strip) |
| O04 | Very long phone pages: home 16 screens, menus 38–44. Make the menu jump bar sticky on phones; consider collapsing menu sections | [M] | 2.7a |
| O05 | The menu page has two chip rows that repeat words ("Vegan" menu vs "VG Vegan" filter). Label them "Jump to" / "Show only" or merge | [V] `first/soho-menu` | 2.7a |
| O06 | Typographic monotony and tracked capitals on running text (plate-wall intro, chip rows), against design principle 5 | [V] | 2.5, 2.6 |
| O07 | Soho has no photography (content). "Walk the room" at 1440 shows cut-off neighbour titles at the frame edges | [V] | Client photos; 2.5 |
| O08 | Branch clock lines ("▲ 4.01pm") next to "Opens 5pm" read as a second opening time; label them as local time | [V] | 2.4 |
| O09 | The goodbye receipt repeats the footer's hours and addresses, adding length | [V] | 2.6 |
| O10 | Info pages and private dining at 1920: small document type on a big canvas | [V] | 2.7 |
| O11 | Object colours outside the 5 guideline hues: cobalt plates `#23428f`, green open dot `#7fbf6a`, a system-ui street sign. Deliberate realism; confirm with the brand owner | [C] | Client |
| O12 | Intro: show once per device (not per session), let the first scroll or tap end it, and keep the board ≤1.5 s | [M] ≈2.2 s lock | 2.3c |

---

## 5. Weighted quality score: 70 / 100

Each category is scored 0–10 against these anchors:
- **10:** best in class, no defects
- **8:** strong, minor issues
- **6:** solid but with notable defects
- **4:** significant problems
- **2:** broken

**Assumptions:**
- A category with an open Critical defect is capped at 6.
- The preview `noindex`, the preview banner and the "not live" state are not penalised.
- Content waiting on the client (prices, legal wording, photos, font licence) counts only in "SEO and content".
- **[U]** items are not penalised.
- Only Chromium (Edge) and emulated devices were used.

| Category | Weight | Score | Points | Evidence |
| --- | --- | --- | --- | --- |
| Visual design and brand | 20 | 7.5 | 15.0 | Original, coherent concept with strict brand discipline (+); desktop voids, generic cards, no Soho photos, monotone type (−) |
| UX and information architecture | 15 | 5.5 | 8.3 | 2–3 tap booking on branch pages, clear calls to action, good menu search (+); **C01 critical**, no phone nav on home/info, intro lock, demo waitlists, `mailto:` enquiry, raw-photo links (−). Capped at 6 |
| Accessibility | 15 | 7.0 | 10.5 | Skip links, visible focus on 100% of 254 stops, native dialogs with focus return, calm mode, labels (+); contrast, label-in-name, no pause control, keyboard trap in calm scroller, intro focus (−) |
| Performance | 15 | 8.0 | 12.0 | Desktop 100 everywhere; mobile 96–100 off home; CLS ~0; jank ≤1.3%; no JS on menus/info (+); home lab LCP 3.6 s, CG 2.64 s, 1.26 MB PNG, info-page CLS (−) |
| Responsive | 10 | 8.5 | 8.5 | 0 sideways scroll in 96 public loads; header one line 320–1600; phone layouts strongest (+); label collision, tiny plate text (−) |
| Motion and functionality | 10 | 6.0 | 6.0 | Purposeful scenes with calm end states; correct deep links; search, filters, passport, menu book work (+); **C01**, demo waitlist, no pause control (−). Capped at 6 |
| SEO and content | 7 | 7.0 | 4.9 | Unique titles and descriptions, canonical, sitemap, Restaurant/Menu/Organization JSON-LD with geo, OG cards (+); unconfirmed prices (27 discrepancies), unverified rating, mixed house term, sample lines (−) |
| Security | 4 | 6.5 | 2.6 | 0 npm vulnerabilities, no third-party scripts, nosniff/XFO/Permissions-Policy, `noopener` (+); no CSP or HSTS, public styleguide (−) |
| Maintainability | 4 | 6.5 | 2.6 | Typed, validated data; lessons file; handover; hours tests (+); 40 KB page template, mixed CSS styles, global `[data-*]` selectors (the cause of C01), Windows-fragile build and budget script, no booking smoke test (−) |
| **Total** | **100** | | **70.4** | |

**Projection (estimate, not a promise):**
- After 2.3b–2.3d (hotfix, accessibility, media): UX 7, function 7.5, accessibility 8.5, performance 8.5 → **≈77**.
- After the design slices 2.4–2.7: visual 8.5, UX 8, responsive 9 → **≈81**.

The rest depends on client content and integrations.

---

## 6. Strengths to preserve (do not regress)

1. **The concept.** Canton → Kolkata → London → Dubai told through real travel objects: departure board, voyage map and postcards, boarding passes with tearable stubs, receipt, luggage-tag 404. Nothing here looks templated [V].
2. **Brand discipline.** Two typefaces, the five guideline colours plus derived tokens, the logo never rotated or set on a busy photo [C][V].
3. **The booking drawer on branch pages.** Party size, day and time open OpenTable or SevenRooms with everything filled in. Focus stays inside and returns to the trigger. The group limit sends big parties to the enquiry page [M].
4. **Performance engineering.** Desktop Lighthouse 100 on every page. Mobile 96–100 off home. CLS ≈ 0. Scroll jank ≤ 1.3% at 4× CPU. No JS on the menus or info pages [M].
5. **Responsive robustness.** 0 sideways scroll across 12 pages × 8 modes. The header stays on one line from 320 to 1600 px [M].
6. **Calm mode.** Every scene has a finished end state with reduced motion [M][V].
7. **Keyboard basics.** Skip links on every page, a focus ring on 100% of tab stops, native `<dialog>` [M].
8. **Menus.** Search, diet filters, a live count, an empty state, print, and the dish passport, with no JS bundle [M].
9. **Data integrity.** Zod + `validate-data` before every build, prices written once, hours tests for GMT/BST [M].
10. **SEO plumbing and security hygiene.** JSON-LD with geo, canonical, sitemap, OG cards; 0 vulnerabilities; no third-party scripts [M].
11. **Covent Garden's arrival spread and the house photo grade.** The reference look for the rest of the desktop work [V].
12. **Project memory.** `tasks/lessons.md`, `docs/HANDOVER.md`, `qa-report.md` [C].

---

## 7. Prioritised improvements

Effort: **S** < ½ day · **M** ½–2 days · **L** > 2 days.

| Priority | Improvement | Fixes | Effort |
| --- | --- | --- | --- |
| **P0** | Scope the "step inside" handler to `a[data-step]` (or rename the attribute), and add a scripted booking smoke test (home + branch drawer, +/−, submit URL) so this class of bug can't come back | C01, C20 | S |
| P1 | Contrast fixes on the pass bands and the lights-on cue (use the existing `ink-deep` / `tiger-deep` tokens) | C03 | S |
| P1 | Label-in-name on the pass stubs; tag meanings as visible-to-AT text; roving tabindex for days and times | C04, C15, C16 | S |
| P1 | One site-wide "Pause motion" control (stops rain, loops and pings; remembered per device) | C05 | M |
| P1 | Intro: Skip outside `aria-hidden`, make the page behind inert while it plays, end on the first scroll or tap, show once per device | C07, O12 | S |
| P1 | Make the calm "Walk the room" scroller focusable (`tabindex="0"` + label) | C06 | S |
| P1 | Optimise `frame.png` through `getImage` (WebP at the needed size); branch gallery reuses the `RoomContactSheet` lightbox | C09, C10 | S–M |
| P1 | Investigate home mobile LCP within the font and preload rules in `lessons.md` | C12 | M |
| P2 | Phone navigation for home and info pages (a small menu sheet or the branch dock pattern) | C11 | M |
| P2 | Visit strip (hours today, address, Book, Call, Directions) under the branch hero; label the clocks | O03, O08 | M |
| P2 | Luggage tags and postcards; plate-wall legibility | O02, C14, O06 | M |
| P2 | Home desktop spreads (doors, menu book, goodbye); map label collision | O01, C13, O09 | L |
| P2 | Info pages as printed documents + fix the font-swap shift | C08, O10, C17 | M |
| P2 | Menu page: sticky jump bar on phones, label or merge the chip rows | O04, O05 | S |
| P3 | CSP (report-only first) | C25 | S |
| Launch | Waitlist, enquiry and newsletter providers; Sheet and Plausible env; content sign-off (rating, house term, prices, legal); Soho photos; font licence; logo SVGs; remove `/styleguide/`; real-device and Safari pass | C02, C23, C26, C22, C24, C19 | client-dependent |

---

## 8. Preliminary phased roadmap (reconciled with `implementation-roadmap.md`)

Done: 2.1, 2.2, 2.3, 2.3a. **Kept:** 2.4–2.9. **New:** 2.3b, 2.3c, 2.3d, 2.4a, 2.7a, 2.8a. **Dropped:** none.

| Phase | Slice | Content | Status vs old list | Gate (in addition to the standard slice gate) |
| --- | --- | --- | --- | --- |
| **A. Stabilise** | 2.3b | C01 hotfix + booking smoke test + Windows-runnable budget script (C20) | **New, P0** | Home drawer +/− stays on `/` in normal and calm, phone and desktop; smoke test in `npm test` |
| A | 2.3c | Accessibility fixes C03–C07, C15, C16, O12 | **New** | axe **after scrolling** shows 0 serious/critical on all pages at 390/1440 (normal + calm) |
| A | 2.3d | `frame.png` via the pipeline, branch lightbox, home LCP investigation (C09, C10, C12) | **New** | Home transfer after a full scroll −1 MB; LCP change measured, not assumed |
| **B. Desktop composition** | 2.4 | Boarding-card visit strip + labelled clocks (O03, O08) | Kept | Essentials visible within 1.5 screens on phone |
| B | 2.4a | Phone navigation on home and info pages (C11) | **New, needs a design OK** | Menus and branches reachable in ≤ 2 taps from any page on a phone |
| B | 2.5 | Luggage tags, postcards, plate-wall legibility (O02, C14) | Kept, extended | No text < 12 px outside decorative `aria-hidden` |
| B | 2.6 | Home desktop spreads + map label fix + goodbye (O01, C13, O09) | Kept, extended | Perf budget re-run (heaviest slice) |
| B | 2.7 | Info pages as documents + font-swap CLS (C08, C17, O10) | Kept | CLS ≤ 0.05 at every width |
| B | 2.7a | Menu page: sticky jump bar on phone, chip-row labels (O04, O05) | **New, small** | Search and filters still 0 JS files |
| **C. Launch readiness** | 2.8 | CSP report-only (C25) | Kept, needs your OK | No CSP reports on a full sweep |
| C | 2.8a | Waitlist / enquiry / newsletter providers, Sheet + Plausible env (C02, C23, C26) | **New, blocked on client accounts** | Real submissions arrive; failure states shown |
| C | 2.9 | Full QA: axe after scroll, keyboard, NVDA + VoiceOver, real iPhone/Android + Safari, C27 videos | Kept, extended | Release gate |
| Client track | — | Rating (C22), house term (C24), 27 price discrepancies, legal wording, Soho photos, font licence, logo SVGs, `/styleguide/` (C19), off-palette object colours (O11) | Unchanged blockers + C22, O11 | Client sign-off |

---

## 9. Not verified [U]

- **Devices and browsers:** real phones and tablets, Safari (iOS/macOS) and Firefox.
- **Assistive technology:** screen readers (NVDA, VoiceOver), Windows High Contrast, 200–400% zoom and text spacing (1.4.10, 1.4.12).
- **Field data:** Core Web Vitals and INP, which need the web-vitals beacon after launch.
- **Live hosting and network:** the host's response headers (HSTS, `_headers` applied), and following booking links through to the providers' pages (links were checked, not followed).
- **Integrations:** Plausible, the newsletter provider and the live Google Sheet (env vars not set).
- **Video playback** on a real device (C27).
- **Print layout:** the stylesheet exists; no print preview was captured.

## 10. Evidence index

All under `docs/redesign/audit/`:
- `sweep.json`: 104 loads (overflow, clipping, targets, small text, images, errors, CLS and shift sources, headings, landmarks)
- `axe.json`: violations and needs-review items per page and mode
- `lighthouse.json`: mobile and desktop results, including failing audits
- `probes.json`, `probes2.json`: keyboard walks, drawer, menu, forms, widgets, intro timing
- `static-seo.json`: meta, canonical, headings, JSON-LD, links and forms per built page
- `sheets/`: 171 labelled contact sheets of scroll frames (page_mode_nn.webp)
- `first/`: first screen of each page at all 6 widths
- `probes/`: drawer, menu tools and empty state, waitlist, private-dining form, plate tap, menu book

Scripts (scratch, not in the repo): `sweep.mjs`, `probes.mjs`, `probes2.mjs`, `probe3.mjs`, `probe4.mjs`, `static-seo.mjs`, `lh.mjs`, `jank.mjs`.
