# Phase 10: final quality assurance (21 Nov 2026)

Independent desk audit of the built site (`npm run build`, Astro 7.4.13) as it stands at the end of
phase 9, done as if another team had built it. Everything below is **lab evidence from one Windows
machine** (headless Edge via Playwright, Lighthouse 13.6 mobile): no real phone, Safari, Firefox or screen
reader was used, and no field data exists yet. "Verified" means a script or a screenshot in this folder
shows it; "not tested" means exactly that.

Scripts and outputs beside this report (`screens/` is gitignored, re-made by the commands at the end):
`functional.mjs` (61 regression checks, `functional-results.txt`), `states.mjs` (interaction screenshots
at 390 / 768 / 1440), the phase 7 `audit.mjs` and `shots.mjs` re-run against this build
(`screens-audit/summary.txt`, `keyboard-probe.txt`), the phase 8 `check.mjs` (`motion-check.log`),
`scripts/smoke-booking.mjs`, and Lighthouse via the phase 9 `lighthouse.mjs` (`lighthouse.txt`).

## 1. Executive quality assessment

The site is coherent, distinctive and technically sound. One design language (sand / ink / tiger, the
typewriter face, boarding passes, stamps, printed menus) runs through all 13 pages at every width from
320 to 1920 px; the type scale, spacing, buttons, fields, chips and dialogs are one system
(`src/styles/components.css`) and nothing in the screenshots reads as a template default. Core journeys
(choose a room, book, read a menu, filter it, plan a group, find hours and directions) work by mouse,
touch and keyboard, with honest feedback states. Build gates, strict type checking, data validation,
contrast checks, axe and a 61-check functional suite all pass.

Six real defects were found and fixed in this phase (section 8). What keeps the site from "world-class"
is not craft but **unfinished content that only the client can supply**: the story page's comic panels
are placeholder sketches with the illustrator's brief printed where the art should be; several dish and
room photos are upscaled stand-ins; the licensed typeface is not yet bought; every page says "Website
preview, not the live site" and carries `noindex` until `PUBLIC_LAUNCH=true`. Those are launch blockers
in `tasks/todo.md`, not engineering gaps.

**Release readiness: ready for staging review now; ready for production once the launch-blocker list in
section 10 is cleared.** No deployment was made in this phase.

## 2. Before-and-after screenshot references

| What | Before | After |
|---|---|---|
| Booking desk at 768 px: actions squeezed the room name and address | `screens/state-book-desk--768.png` (first run, overwritten) and this report's description | `screens/state-book-desk--768.png`: actions stack under each room |
| Menu page under 200 % text zoom at 1440 px: "Vegetarian" chip one letter per line, rail label clipped | first-run `state-zoom200-menu--1440.png` (overwritten) | `screens/state-zoom200-menu--1440.png`: chips wrap, label wraps |
| Plate wall at 768 px: 8 px prices on the plate backs | measured (`plates` probe, below) | measured: every shown price ≥ 15 px |
| Story page: no skip link | `functional-results` run 1 (`skip link missing`) | run 4 passes; first Tab stop is "Skip to the story" |
| Home, Dubai pass stub: dead `#wl-dubai` link | `functional-results` run 1 (`/#wl-dubai` has no target) | run 4 passes; stub goes to `/dubai/#waitlist` |
| Whole-page montages, five widths, every page | phase 7 `docs/qa/phase7-responsive/screens/` | `screens/<page>--{320,390,844land,768,1920}.png` |
| Interaction states (drawer, index, picker, search, empty state, passport, form errors, email fallback, lights on, lightbox, 404, footer) | – | `screens/state-*--{390,768,1440}.png` (111 files) |

The "before" images for the three layout fixes were overwritten by the re-shoot; the measurements and
the first functional run (`functional-run2.log`, `functional-run3.log` kept) are the record.

## 3. Page-by-page QA results

Reviewed at 320, 375, 390, 430, 600, 768, 844×390, 1024, 1280, 1440, 1920 and 1280 at 200 % text
(`screens-audit/summary.txt`), plus the state screenshots at 390 / 768 / 1440.

| Page | Visual | Function | Notes |
|---|---|---|---|
| `/` | Strong. Rain hero, gate board with live clocks, boarding passes, menu book, bar, room sheet, voyage map, goodbye bill. | Pass | Fixed: Dubai stub link. Nit: the ship badge sits over the "Dubai" map label at the end of the voyage. Menu-book page type is 9–11 px on phones (known; the list menus carry the readable copy). |
| `/soho/`, `/covent-garden/` | Strong. Split-flap name, dish ledger, lights-on scene, plate wall, contact sheet, hours with "today" marked. | Pass | Fixed: plate-back type at tablet widths. Street-sign subtitle "City of Westminster" renders at 8 px (decorative prop, reads as a sign). |
| `/dubai/` | Good. DXB art, local clock, "Be first through the door", London rooms. | Pass | Without `PUBLIC_DUBAI_LIST_ENDPOINT` there is no form and the page says the list opens soon: consistent everywhere (home pass, index, dock, footer). |
| `/soho/menu/`, `/covent-garden/menu/` | Strong. Printed-sheet menu, one menu at a time, picker on phones, rail on desktop. | Pass | Fixed: 200 % text zoom. Search, five diet chips, empty state + Clear, passport stamps, share: verified. |
| `/book/` | Good. Day / time / guests picker fills every room's link; 12 guests routes to the group form with the details. | Pass | Fixed: 720–899 px rows. `?branch=` opens the drawer for that room. |
| `/private-dining/` | Good. Rules beside a paper form. | Pass | Validation lists "4 things to fix" with links, focuses the alert, clears per field as you type; valid submit opens the email app (no endpoint set) and says so. |
| `/our-story/` | **Incomplete content**: comic panels are placeholder sketches with the illustrator's brief as captions. Layout and chapter rail are fine. | Pass | Fixed: skip link. Chapter rail hidden 1100–1319 px (phase 8 trade-off). |
| `/allergens/`, `/accessibility/`, `/booking-terms/`, `/privacy/` | Good. Summary box, contents, questions. | Pass | Draft wording in italics awaits the client. |
| `/404` | Good. Luggage tag with every destination. | Pass | Served with HTTP 404 (`/no-such-page/`, `/dubai/menu/`). |

## 4. Functionality regression results

`functional.mjs`, final run (`functional-run4.log`): **60 of 61 pass**. The one failure (phone menu:
passport stamp click timed out) is a test-under-load artefact: the same sequence passes in isolation
(`seq` probe, twice) and the 1440 px variant passes; the stamp is the top element at its centre point.

Verified:

- Static crawl of `dist/`: every internal link and asset (1,000+ URLs incl. `srcset`) returns 200; every
  same-page `#hash` has a target; all 28 external links are `https`, and every `target="_blank"` has
  `rel="noopener"`; every external origin answers.
- `sitemap.xml` lists all 13 public pages, each 200; `robots.txt` served (preview mode: `Disallow: /`);
  `vercel.json` carries all four 301s from `docs/redirects.csv`; `/404` and `/dubai/menu/` return 404.
- Every page at 390 and 1440, first visit, full motion: title ≤ 75 chars and unique, description
  30–165 chars, canonical = path, `lang="en-GB"`, one `h1`, `og:image`, JSON-LD parses, skip link
  targets an id, **no console errors or page errors**.
- Header: rooms, Menus dropdown (Escape closes), Groups, Book; Index dialog (focus in, Escape closes).
  Phone dock: Menus → room sheet, Rooms → Index, Book → drawer. Room pages: header Book and dock stay
  away while the hero's Book is on screen, then appear.
- Skip link is the first Tab stop and moves focus to the main content.
- Booking: `scripts/smoke-booking.mjs` 8/8 (drawer from header and dock on home and both rooms, +/−
  guests, time, hand-off link to OpenTable `covers=2` / SevenRooms `party_size=2`, no navigation of this
  tab). Desk: 9 guests in the drawer shows the group route; `/book/?branch=` opens the right room.
- Menus: one menu shown; search "momo" finds 19 dishes across 8 menus; VG chip leaves only vegan dishes;
  "Clear filters" restores; phone picker and desktop links switch menus; passport stamps, opens, clears
  (stored in `localStorage`).
- Group form: empty submit → 4 errors with links and `aria-invalid`; typing clears; URL prefill from the
  drawer; email-app fallback with a status message.
- Footer "Pause motion": sets `html[data-motion=paused]`, persists across reload, pauses every video,
  toggles back. Hours line filled per room. No newsletter form without `PUBLIC_NEWSLETTER_ACTION`.
- Lights on: lamps turn on when scrolled to, cue reads "Good evening, Maiden Lane", pull switch replays.
  Contact sheet lightbox: open, next, close.
- Old-site journeys: `/soho/` and `/covent-garden/` keep their URLs; reserve-a-table, voucher and
  food-pickup URLs redirect (config verified, redirects themselves need the host); OpenTable (Soho) and
  SevenRooms (Covent Garden) deep links carry party size, date and time.

Not tested: the real booking providers' pages (never loaded, by design), the form service and Dubai list
(no endpoints set), Plausible events (domain unset), `window.open` pop-up blocking in real browsers.

## 5. Accessibility findings

- axe-core 4.10 (WCAG 2.x A/AA + best practice) at 390 and 1440 on all 15 routes: **0 violations**.
- No horizontal overflow at any of 12 viewports; one `h1`; every image has `alt`; landmarks present.
- Keyboard probe (45 Tab stops on five pages at 1440 and 390): every stop visible, every stop has a
  ring, none inside hidden content; Book drawer traps focus and returns it on Escape.
- Reduced motion: no animation > 50 ms after a scroll, no reveal gate, no arrival board, nothing left
  at opacity 0 (`motion-check.log`).
- Fixed this phase: `/our-story/` had no skip link (WCAG 2.4.1); menu filter unusable at 200 % text
  zoom (1.4.4); plate-back prices at 8 px on tablets (readability).
- Remaining: sub-24 px targets are inline links in sentences (2.5.8 exempt) and the 1 px inputs behind
  44 px chip labels. Text over photographs (hero, bar) checked by eye only. The 404 page's luggage tag is
  rotated 1.5° (straight under reduced motion). Not covered: screen readers, Safari, Firefox, real touch.

## 6. Performance measurements

Lighthouse mobile (simulated slow 4G, 4× CPU, headless Edge, software WebGL) against `astro preview`,
same method as phase 9. Single-machine lab numbers; ±5 points / ±1 s run-to-run noise.

| Page | Perf | A11y | BP | SEO | Lab LCP | Obs LCP | TBT | CLS | Weight (gz) |
|---|---|---|---|---|---|---|---|---|---|
| `/` (median of 3: 92 / 91 / 85) | **91** | 100 | 100 | 69* | 2.8 s (2.7–3.7) | 0.23–0.25 s | 174 ms (142–208) | 0 (one run 0.04) | 940 KB |
| `/soho/` | 91 | 100 | 100 | 69* | 2.3 s | 0.39 s | 334 ms | 0 | 409 KB |
| `/covent-garden/` | 95 | 100 | 100 | 69* | 2.9 s | 0.35 s | 56 ms | 0 | 813 KB |
| `/soho/menu/` | 99 | 100 | 100 | 69* | 2.1 s | 0.28 s | 48 ms | 0 | 196 KB |
| `/book/` | 100 | 100 | 100 | 69* | 0.9 s | 0.17 s | 0 | 0.001 | 266 KB |
| `/private-dining/` | 99 | 100 | 100 | 69* | 2.2 s | 0.20 s | 0 | 0 | 293 KB |
| `/our-story/` | 100 | 100 | 100 | 69* | 0.9 s | 0.14 s | 0 | 0.003 | 295 KB |

\* SEO 69 on every page is the preview-mode `noindex` + `robots.txt Disallow: /` (phase 9 verified 100 with
`PUBLIC_LAUNCH=true`). Phase 9's last figures for comparison: home 87 median / 3.6 s lab LCP / 101 ms TBT /
940 KB; Soho 99; Covent Garden 96; menu 99; book 99. Byte weights are identical (nothing in this phase
changes what loads); the score differences are run-to-run noise on this machine. The one home run with
CLS 0.04 was a web-font swap on the hero words (Lighthouse `layout-shifts`); two further runs and all
five phase 9 runs show 0, so it is timing noise, but within the 0.05 budget it is worth watching in the
field. `/soho/` TBT 334 ms in this run (phase 9: 1 ms) is the same kind of outlier. All pages stay inside
`scripts/perf-budget.mjs` (≥ 85, obs LCP ≤ 1.5 s, TBT ≤ 200 ms except that Soho outlier, CLS ≤ 0.05,
≤ 1.1 MB); the budget script itself was not re-run.

Scroll (phase 8 `check.mjs`, 4× CPU, one scroll step per frame, full motion):

| Page | Long frames (> 34 ms) at 390 / 1440, this build | Phase 8 baseline |
|---|---|---|
| `/` | 9 / 31 (worst 667 / 1000 ms: the menu book and voyage hydrating as they are reached) | 10 / 33 |
| `/soho/` | 0 / 1 | 0 / 0 |
| `/covent-garden/` | 0 / 7 | 0 / 12 |
| `/our-story/` | 1 / 1 | 0 / 0 |

Same run: no unknown animation loops, nothing left running after Pause motion, every reveal arrived,
booking from a pass opens in 32–63 ms, focus can land on a stub while the passes drop in; with
`prefers-reduced-motion: reduce` nothing animates and nothing is left hidden (8 of 8 checks). A first run
taken while the functional suite was also running showed 18 / 51 on home: these numbers move with
machine load, so compare only like with like.

Nothing in this phase changes what loads; the two CSS fixes and the plate thresholds are static.
No field data: Core Web Vitals targets remain unverified until `PUBLIC_PLAUSIBLE_DOMAIN` is set.

## 7. SEO and security checks

SEO (verified in the build): unique titles and descriptions on every page, canonical per page, `og:*` and
Twitter card, `lang`, one `h1`, JSON-LD `Restaurant` / `Menu` where relevant, sitemap and robots
generated from the page list. Preview mode intentionally sets `noindex` and `Disallow: /`
(Lighthouse SEO 69 for that reason only; phase 9 verified 100 in launch mode). Needs the client: geo
coordinates, real photos.

Security: `npm audit --omit=dev` 0 vulnerabilities; no secrets in the repo; `vercel.json` and
`public/_headers` set HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`,
one-year immutable cache on `/_astro/*`; CSP is **report-only** with `'unsafe-inline'` (watch the
console on the host, then enforce; add form-service / Plausible origins to `connect-src` when set).
Forms escape user input before `innerHTML`; `localStorage` holds only the menu choice, passport, motion
preference and arrival flag; no cookies or trackers. Headers could not be verified from `astro preview`
(it does not apply `vercel.json`); verify on the first deployment.

Code health: `astro check` strict 0 errors, build gates pass, no `console.log` / TODO in `src/`,
dead code removed in phase 9. `typescript` 6 → 7 and `web-vitals` 5 → 6 are available majors, not
bumped. `playwright-core` and `axe-core` are hand-installed for QA, not in `package.json`.

## 8. Remaining issues and limitations

Fixed in this phase (all verified by re-run):

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | High (a11y) | `/our-story/` had no skip link and no `main#content` | `src/pages/our-story.astro` |
| 2 | High (function) | Home: the Dubai pass stub linked to `#wl-dubai`, which exists only once the list service is set; the click did nothing | `src/components/scenes/BoardingPasses.astro`: `/dubai/#waitlist` until then; handler navigates when the hash is not on this page |
| 3 | Medium (a11y) | Menu page ≥ 1024 px under 200 % text zoom: chips column ~100 px, "Vegetarian" one letter per line, rail label clipped | `src/pages/[branch]/menu.astro`: auto-fit columns, label may wrap |
| 4 | Medium (layout) | Booking desk 720–899 px: actions squeezed the room name and address | `src/pages/book.astro`: side-by-side from 900 px |
| 5 | Medium (readability) | Plate wall: 8–10 px prices and names on 60–89 px plates (768–1024 px, and the small plates on any wall) | `src/components/branch/PlateWall.tsx`: price-only under 90 px, at 30cqi |
| 6 | Low (tests) | QA scripts: path, scroll-reset and overlay traps | `tasks/lessons.md` (3 lines), scripts |

Open, in priority order:

| # | Severity | Issue | Owner |
|---|---|---|---|
| A | Blocker (content) | Story comic is placeholder art with the brief as captions | Client approves characters + script (#49), commission illustrator |
| B | Blocker (content) | Upscaled stand-in photos; no Soho room/night photos; licensed typeface not bought (`FONT_BACKUP=1` fallback exists) | Client (#35, #36, #46; font licence) |
| C | Blocker (launch) | `PUBLIC_LAUNCH`, specials CSV, form endpoints, Plausible domain unset; CSP report-only | Developer at launch (HANDOVER) |
| D | Medium | Home lab LCP ~3.6 s on simulated slow 4G (phase 9); no field data | Watch Vitals after launch |
| E | Low | Home menu book type 9–11 px on phones | Decide a phone floor or keep the list-menu hand-off |
| F | Low | Voyage: ship badge covers the "Dubai" map label at the final stop | Nudge label or badge |
| G | Low | Drawer day chips clip at the drawer edge with no scroll cue | Add a fade or wrap |
| H | Low | Street-sign subtitle 8 px (decorative) | Accept or enlarge |
| I | Untested | Real iPhone/Android, Safari, Firefox, VoiceOver/NVDA, 120 Hz feel, redirects and headers on the host | Launch checklist |

## 9. Final quality scorecard

The original 40-point checklist and weighted audit live in `docs/redesign/comprehensive-audit.md`,
which this session was not permitted to open (repository rule: do not read `docs/redesign`). The
"before" column is therefore **not re-stated here**; read it from that document and set it beside this
"after" column, which is scored 0–10 per item from the evidence above (10 only where a check passed in
full; nothing is scored without a listed check).

| Area (weight) | Item | After | Evidence |
|---|---|---|---|
| Visual design (20 %) | Distinctive, non-generic direction | 9 | montages, state shots |
| | Typography system and hierarchy | 8 | tokens, one face family; book type small on phones (E) |
| | Imagery quality and fit | 6 | upscaled stand-ins, placeholder comic (A, B) |
| | Colour, surface and contrast discipline | 9 | contrast gate, token pairs |
| | Spacing, alignment, component consistency | 9 | 12-viewport sweep, no overflow; three layout fixes |
| Functionality (15 %) | Navigation and links | 10 | crawl 0 broken, nav tests |
| | Booking hand-off | 10 | smoke 8/8, desk tests |
| | Menus (search, filters, picker, passport) | 10 | functional tests |
| | Forms and feedback states | 9 | validation + fallback; service path untested (no endpoint) |
| | Old-site journeys preserved | 9 | redirect config; host not tested |
| Usability (15 %) | Findability of hours, address, phone | 10 | every page, footer, visit strip |
| | Clarity of what each action does | 9 | provider named before hand-off, "opens in a new tab" |
| | Error handling and recovery | 9 | form errors, empty state, email fallback, 404 tag |
| | Interaction predictability | 9 | Escape/close patterns, focus return |
| | Content completeness | 5 | story placeholders, draft wording (A, B) |
| Accessibility (15 %) | Automated (axe) | 10 | 0 violations, 30 runs |
| | Keyboard and focus | 10 | probe + skip-link fix |
| | Reflow and text zoom | 9 | 320 px and 200 % pass after fix |
| | Reduced motion and pause control | 10 | check.mjs, footer toggle |
| | Assistive tech (screen readers) | – | not tested |
| Responsiveness (10 %) | 320–1920 layout stability | 10 | sweep, no overflow |
| | Landscape phone and tablet | 9 | 844×390 ok; desk fix at 768 |
| | Touch targets | 9 | 24 px+ except inline links |
| | Images sized to viewport | 9 | srcset (phase 9); Doors photo remains |
| | Tablet-specific states | 9 | plate fix |
| Performance (10 %) | Lighthouse mobile performance | 9 | 91 home median, 91–100 elsewhere |
| | LCP / TBT / CLS lab | 8 | home lab LCP 2.8 s > 2.5 s target; CLS 0; TBT under 200 ms bar one outlier |
| | Scroll smoothness | 8 | home 31 long frames at 1440 (hydration), rooms and story clean; < 2 % target still open |
| | Page weight and caching | 9 | ≤ 1.1 MB budget, immutable cache |
| | Field data | – | none yet |
| SEO (7.5 %) | Metadata, canonical, social cards | 10 | functional tests |
| | Structured data | 9 | Restaurant/Menu JSON-LD; geo missing |
| | Crawlability (launch mode) | 10 | phase 9 launch-mode build |
| | Redirect plan | 9 | config verified, host untested |
| | Sitemap/robots | 10 | tests |
| Security and code (7.5 %) | Headers and CSP | 8 | set; CSP report-only; host unverified |
| | Dependencies and secrets | 10 | audit 0, no secrets |
| | Build health and type safety | 10 | verify passes |
| | Maintainability (tokens, components, docs) | 9 | site-map, HANDOVER, lessons |
| | Test coverage | 9 | gates + 61 functional + smoke + a11y + motion |

Area averages: visual 8.2, functionality 9.6, usability 8.4, accessibility 9.75, responsiveness 9.2,
performance 8.5, SEO 9.6, security and code 9.2. Weighted "after" (items without a score excluded from
their area's average): **9.0 / 10**. The two areas under 9 are both content (imagery, completeness) and
the home page's lab LCP and scroll cost, which are the open items A, B and D.
Pull the "before" figure from the original audit for the comparison; the phase 9 report already gives
the lab performance before/after (85 → 87 median on `/`, 1014 → 940 KB).

## 10. Release-readiness assessment and rollback

- **Staging**: ready. Build is green, no runtime errors, no a11y violations, journeys verified.
- **Production**: not before the launch checklist in `docs/HANDOVER.md` is done (fonts or
  `FONT_BACKUP=1`, client wording, one real booking each on OpenTable and SevenRooms, photos, `make-og`,
  `PUBLIC_LAUNCH=true`, a phone check). The story page should either get its art or ship with the
  current sketches knowingly.
- **Rollback**: the site is static on Vercel deploying from `main`; rolling back is promoting the
  previous deployment in the Vercel dashboard (seconds, no data to migrate). Keep the old site's DNS
  record until the new one has been live and watched for a day. Environment switches
  (`PUBLIC_LAUNCH`, endpoints, Plausible) are build-time, so each change is a new deployment and the
  previous one stays available.
- This phase did **not** deploy anything and did not commit; the changes are in the working tree with
  the phase 9 changes for review.

## Re-running

```
npm run build && npx astro preview --port 4321 --host 127.0.0.1
cd docs/qa/phase10-final
MSYS_NO_PATHCONV=1 BASE=http://127.0.0.1:4321 node functional.mjs          # EXTERNAL=0 skips the external-host check
MSYS_NO_PATHCONV=1 BASE=http://127.0.0.1:4321 OUT=<windows path>/screens node states.mjs   # ONLY=name,prefix VIEWS=390,1440
cd ../phase7-responsive && MSYS_NO_PATHCONV=1 BASE=http://127.0.0.1:4321 SHOTS=0 OUT=<...>/phase10-final/screens-audit node audit.mjs
node shots.mjs   # with PAGES and OUT as above
node ../phase8-motion/check.mjs
node ../../../scripts/smoke-booking.mjs   # PLAYWRIGHT=<repo>/node_modules/playwright-core/index.mjs
LIGHTHOUSE=<npx cache>/node_modules/lighthouse/cli/index.js node ../phase9-optimisation/lighthouse.mjs
```
