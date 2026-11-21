# Finished phases (archived from tasks/todo.md, 21 Nov 2026)

History only. Open items from these sections were carried to tasks/todo.md.

Plan: "Fatt Pundit Website Rebuild Plan" doc (10-day schedule). Tick only with proof (build log, screenshot, test output).

## Launch blockers (must be done before DNS switch)
- [ ] **Font licence**: current American Typewriter files came from ufonts.com (1997 E+F Designstudios digitisation, no web licence). Buy ITC American Typewriter web fonts (Monotype) and drop them into `src/assets/fonts/american-typewriter/` with the same filenames. Licensed set should include Semi Bold (guidelines use it for subtitles; we use Bold until then).
- [ ] Client confirms every row in docs/content-discrepancies.md
- [ ] Logo SVGs from B3 branding pack replace PNG placeholders in src/assets/images/brand/
- [ ] Geo coordinates for Soho and Covent Garden (schema + map)
- [x] Remove or protect /styleguide/: preview builds only, not generated when PUBLIC_LAUNCH=true (20 Nov, Phase 3)

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

## Motion plan · Day 1: hero slice ✅ done 18 Nov (plan doc: "Fatt Pundit Motion & Experience Plan")
- [x] React islands (@astrojs/react), shadcn components.json, cn(), motion tokens, calm mode
- [x] KokonutUI (MIT) vendored + restyled: split-flap-text (+ onSettled, maxFlips), rain-glass-background, attract-button
- [x] Scene 0 arrival: board → orange stamp thud (approved negative colour via mask) → shutter; first visit only, skip, 4.5 s safety
- [x] Scene 1 rain hero: wipeable fogged glass over dining room, title rises (anime.js split), cycling board, magnetic Book button, live open-now pill
- [x] Scene 2 doors: Motion scroll() drives hinge swing, camera push, warm flood into sand
- [x] hours.ts + tests (GMT/BST, closed days) run in prebuild
- [x] JS budget: 113 KB gzipped for whole page (target 120 first load)
- [x] Checked desktop, 390 px phone (no sideways scroll), reduced motion (no arrival, doors static), demo from sub-path (0 errors, 0 404s)
- [ ] Not checked: real phones and Safari (only headless Chrome here). Mid-range Android frame rate still to test.
- Deviation: Status Island not used (built for task progress); a small CSS pill does the open-now job without 30 KB of Motion on first load.

## Motion plan · Day 2: the voyage ✅ done 18 Nov
- [x] Brand art cut from guidelines p.24: gold junk ship, compass, 3 mountain sets (gold pixels only), gold + orange stamps, menu frame band; static ship erased from map.webp
- [x] scripts/build-world-map.mjs: Natural Earth 50m → engraved-coast world-land.svg in the menu-map style + world-route.json (sea lanes via Suez to London, Hormuz branch to Dubai)
- [x] Voyage.tsx: 560vh scrubbed timeline. Canton→Kolkata on the menu map (Tangra circled), pull-back onto the world map (city points line up), Kolkata→London, stamps land at London, gold dotted branch to Dubai, FATT / PUNDIT boards
- [x] Checked: desktop + 390 px frames, calm mode (finished map, ship docked at London), demo from sub-path (0 errors, 0 404s), astro check 0 errors
- [x] JS: Voyage chunk 54 KB gz, lazy (client:visible), not in first load
- [ ] Not checked: real phones, Safari
- [ ] Ask client: is the guidelines map art cleared for web use at this size? (same source as the menus)

## Motion plan · Day 3: kitchen + menu book ✅ done 18 Nov
- [x] Greaseproof tiger paper (guidelines p.42) rebuilt as a seamless tile from the brand tiger heads + typewriter "FATT PUNDIT" (orange + gold): src/assets/images/brand/greaseproof-*.png
- [x] Ink Background (KokonutUI) restyled: "THE KITCHEN" in pale ink on the dark pass, wraps on phones, steam plumes rise by themselves and curl through the letters; stir with cursor/finger; still frame in calm mode
- [x] Momentum Rail (KokonutUI) restyled: perforated postage-stamp cards on the greaseproof sheet; 4 real photos + 5 signature dishes as kitchen order tickets (no fake photos); fling/arrows/keys
- [x] Page Flip (KokonutUI) restyled as the printed menu (p.26–27): ink cover + orange stamp, framed pages with gold/orange stamps, "NAME | £price", map back page; bookmarks: À la carte, Vegan, Halal, Gluten free, Dairy free, Drinks
- [x] Pagination measured from real block heights (hidden 1000px page, cqw units), so pages fill correctly at any width
- [x] Prices + tags come from dishes.json via menus.json (plan's done-test) — nothing typed in components
- [x] Checked: desktop + 390 px (single-page book, two-line headline), calm mode, fling test (lands on card 3), demo from sub-path (0 errors, 0 404s, 0 broken images, no sideways scroll)
- [x] JS: whole page 187 KB gz (budget 300); Kitchen 10 KB + MenuBook 13 KB load on scroll only
- [ ] Not checked: real phones, Safari, mid-range Android frame rate with steam running
- [ ] Ask client: photos of the signature dishes (kid goat momo, popcorn cauliflower, paneer cups, monkfish, prawns) to replace the order tickets

## Fixes + Day 4 (plan doc: "Fatt Pundit Fixes + Day 4 Plan") ✅ done 18 Nov
- [x] Phone menu book: vertical swipe scrolls the page, sideways swipe / outer-third tap turns; book capped on phones; "Continue to …" link. Touch-tested 3 pages.
- [x] Lights on (Covent Garden): wall dims to dusk on scroll, clip plays once off→on, halos + light pools, brass pull-switch replays; hero evening grade + 3 shelf-lamp halos. Calm: lit still.
- [x] Voyage rebuilt "follow the ship": night chart, camera follows ship, pull-back on long leg, 4 postcards, ticket holes punch + jump. Calm: whole route + postcard grid.
- [x] Day 4 bar after dark: apron weave, embroidered title, spotlight (cursor / auto-sweep + tap), leather apron drinks card from data. Calm: lit.
- [x] Day 4 room: contact sheet on halftone, 2 grease-pencil picks, <dialog> lightbox (arrows, swipe, Esc, focus return).
- [x] Verified desk/phone/calm, no page errors, JS home 161 KB gz / branch 113 KB; demo sub-path test clean; published v1794993077-db07.

## Motion plan · Day 5: boarding pass + goodbye ✅ done 18 Nov
- [x] Scene 8 "Your boarding pass": 3 passes (Soho, Covent Garden, Dubai) replace the table cards; stamp in (anime.js, staggered thud)
- [x] Tear-to-book: stub is a real link; tap/drag tears it off, then opens the booking page (new tab, fallback same tab). Dubai stub opens the waitlist
- [x] Pass shows: route, gate (address), today's hours (live, branch time zone), flight no. (year opened), call, step-inside link
- [x] Scene 9 goodbye in the footer: black bill holder (p.38–39: gold foil stamp, "Thank you!") opens, receipt prints opening hours + "Thank you for travelling with Fatt Pundit"
- [x] Calm mode: passes and receipt shown still, stub = plain link
- [x] Polish: phone check all pages, JS budget, calm check, no page errors
- [x] Export demo, sub-path test, publish v3, commit, lessons
- Verified: 4 pages × phone/desktop/calm, no overflow or page errors; tear opens booking in a new tab and keeps this page; Dubai stub focuses the waitlist; today's hours correct (Wed). JS: home 161 KB, branches 89–116 KB gz. Published v1794994034-f3c0. Not run: Lighthouse, real mid-range Android.

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

## Location pages (plan doc: Fatt Pundit Location Pages Plan) ✅ L1–L3 built 18 Nov
- [x] Branch data: `page` block in branches.json (three lines, colours, opened, stations, signature, teaser, hero, gallery), Zod schema + validate-data checks
- [x] Shared chrome: SiteHeader / SiteFooter components, site.css; lib/site-data.ts (branches, dishes, prices, hours, menu books) used by home + branch pages
- [x] /soho/, /covent-garden/, /dubai/ from one template: arrival (board + open-now pill + Book/Call/Directions), the room, born here, menu book filtered to the branch's menus, visit (hours with today, stations), good to know, other rooms, Restaurant structured data
- [x] Moments: Covent Garden plate wall (wave + hover/tap flip, prices from data); Soho walk-the-room (pinned sideways pan, "photo to come" frames); Dubai voyage London → Dubai with Boarding soon stamp; Soho street-sign hero; Dubai gate hero + waitlist (demo only)
- [x] Home cards link in; stamp thud then cross-page View Transition (CSS); off in calm mode
- [x] Checked: desktop, 390 px (no sideways scroll), calm mode, demo from sub-path across all 4 pages (0 404s); branch pages ~80 KB JS gz
- [x] Higgsfield (after user allowed upload.higgsfield.ai + the video CDN): 3 Kling 3.0 Pro loops from real photos, 22.5 credits (77.5 left). Each checked frame by frame vs its photo (≤2% pixels changed, room/dish unchanged). Ping-pong encoded, 130–170 KB each
    - Covent Garden arrival: booth shelf-lamp glow behind the hero
    - Covent Garden room: "The real wall" lamp loop above the drawn plate wall (caption says only the lamplight was brought to life)
    - Home kitchen rail: steam on the mixed-veg momo card
    - Play only in view; never in calm mode (poster photo instead)
- [ ] Higgsfield still open: rain on Soho street front (needs Soho night photo), 2 textures (tile pattern, Dubai dusk sky, ~13 credits), stopgap upscales
- [ ] Not built yet: brand street map (needs OSM data; network blocked here), wall-lettering translations, pre-theatre clock (needs times), graffiti line drawing (needs Soho photos)

## Quality pass + menu by location (plan doc: "Fatt Pundit Quality Pass + Menu by Location") ✅ done 18 Nov
- [x] 1 Every page: start at top on new visits; header one line at 360px; flap boards sized to word
- [x] 2 Heroes: phone photo band + ink text, no tint/glow on hero photos, stamp on dark round field, name once, rain cleared behind words
- [x] 3 Plate wall: tight glows, lighter dusk; dish names fit plates; overflow script reads SVG text
- [x] 4 Upscale 16 photos (Higgsfield, 2 credits each = 32), check each vs original
- [x] 5 Menu by location on home: branch tags, ?at= deep link, Dubai card, remembered choice
- [x] 6 QA at 360/390/768/1440, calm, budget, demo test, publish, commit, lessons
- Verified: overflow script (incl. text in round shapes) at 360/390/768/1440 on 4 pages clean except intentional off-screen (book back page, Soho pan); 3-mode sweep no errors/overflow; JS home 163 KB, branches ≤117 KB; pages land at top even when forced to bottom; menu-at flows (tag, arrows, reload, ?at=, pass link). 15/16 upscales kept, gallery-08 original (upscaler invented Chinese glyphs). Published v1795007885-3104.

## Home: choose your restaurant at the top ✅ done 18 Nov
- [x] Departure-board chooser in the hero (W1 Soho / WC2 Covent Garden / DXB Dubai), each row links to the branch page, live status on the guest's clock, stamp on tap
- [x] Replaces the cycling flip board, Book/See menus buttons and open pill; "Or see the menus first" link kept
- [x] Verified phone/desktop/calm + exported demo sub-path: board on first screen, rows land on branch page at top. Published v1795018269-a46d

## £10k upgrade (plan doc: "Fatt Pundit — £10k audit + upgrade plan") — started 18 Nov
Baseline (mobile Lighthouse): home 47, CG 53, Soho 94, Dubai 99. Home scroll drops 14% frames (doors, kitchen).
Decisions taken from the doc's "my pick" column (user said go without answering): deep-link to existing booking URLs, Google Sheet for specials (CSV URL env, falls back to JSON), Plausible (env domain, off until set), ideas = Tonight's board + Branch clocks + Dish passport, English only, Cloudflare Pages headers.

### Phase A — Butter (gate: home + CG mobile Perf 90+, dropped frames <1%)
- [x] A1 Doors: filter → fading dark layer
- [x] A2 Kitchen: no moving drop-shadow filter; only in-view video plays
- [x] A3 Rain hero: start after idle, dpr 1 on phones
- [x] A4 First screen paints finished (no hidden LCP); CG hero preload + fetchpriority
- [x] A5 Images at display size (stamps, logos), AVIF, sizes
- [x] A6 CSS inline, fonts preload one, content-visibility on lower sections
- [x] A7 Speculation rules for branch pages
- [x] A8 Budget script (lighthouse + fps) — fails on breach (`npm run perf:budget`)
- Result A: mobile Perf home 98, Soho 98, CG 99, Dubai 100; TBT ≤23 ms; CLS ≤0.031; dropped frames 1.7/0/0/0.2% (4× CPU). Observed LCP ~0.25 s. Kept external CSS (inlining all made FCP slower).
### Phase B — Found and trusted (gate: 4 Lighthouse areas 95+ with noindex off in test)
- [x] B1 Contrast tokens gold-ink/tiger-ink, heading order, sized images
- [x] B2 Share cards (OG image per branch), canonical, sitemap, robots, favicon set
- [x] B3 Schema: Organization on home, Restaurant + Menu per branch
- [x] B4 404 "Lost luggage" + Privacy, Allergens, Accessibility, Booking terms pages (+ Private dining enquiry, from C4)
- Result B (launch build, PUBLIC_LAUNCH=true): Accessibility 100, Best practices 100, SEO 100 on home, 3 branches, allergens, private dining. Launch switch = PUBLIC_LAUNCH env (robots, noindex, preview banner). Share cards: `node scripts/make-og.mjs` → public/og/.
- Client to confirm (marked in pages as drafts): allergen wording, privacy controller details, booking hold time/deposits, step-free access.
### Phase C — Book and come back (gate: link → booked in 3 taps)
- [x] C1 Book drawer per branch (party/date → booking URL) + sticky Book bar on phones + home hero Book
- [x] C2 Menu list view: search, dietary + spice filters, allergen note, print, /[branch]/menu/
- [x] C3 Find us: directions links, nearest station, static map
- [x] C4 Private dining enquiry, gift card link, newsletter
- Result C: Book drawer (home hero, header, branch hero, phone dock) → party, day, time → OpenTable restref / SevenRooms explore link pre-filled; 2–3 taps. /soho/menu/, /covent-garden/menu/ list menus with search + V/VG/GF/DF/H filters + print + Menu schema. Google + Apple Maps.
- Waiting on client: vouchersUrl in branches.json, PUBLIC_NEWSLETTER_ACTION (email tool), check deep-link params with OpenTable/SevenRooms, spice data per dish (for a spice filter). Static map skipped (map tiles blocked here).
### Phase D — Signature and handover
- [x] D1 Tonight's board (Sheet CSV → split-flap)
- [x] D2 Branch clocks (local time → day/after-dark)
- [x] D3 Dish passport (stamp dishes → shortlist, share)
- [x] D4 Analytics (Plausible, env) + web-vitals RUM + _headers
- [x] D5 Handover guide (docs/HANDOVER.md)
- Result D: Tonight's board (Sheet CSV, live re-read, sample rows until set); branch clocks (local time + sun/moon from NOAA sunrise/sunset, on gate board + branch hero, greeting follows local hour); dish passport on list menus (stamp → shortlist → share/copy); Plausible + web-vitals + Book/Passport events behind PUBLIC_PLAUSIBLE_DOMAIN; _headers.
- [x] D6 Final QA: Lighthouse 4 pages, fps, overflow, calm, demo publish, commit
- Final (18 Nov): budget met on all pages — perf 90/98/96/98, observed LCP ~0.2 s, CLS 0.001, TBT ≤13 ms, dropped frames ≤1.3%. Overflow clean at 360/390/768/1440 on 12 pages (only intentional off-screen items). 3-mode sweep: 0 errors. Demo (11 pages) under sub-path: 0 broken links. Published v1795042638-f4d6.

## Design upgrade plan (19 Nov) — /ui-ux-pro-max
Audit: screenshots of home, Soho, Covent Garden, Dubai, Soho menu at 390 and 1440 (/tmp/shots).
Brand stays (ink/tiger/gold/sand, typewriter + Lora). The skill's generic palette and fonts were rejected; its "scroll storytelling + chapter progress" pattern was kept.
Gate for every item: before/after screenshots 390 + 1440, contrast 4.5:1, `npm run perf:budget` still passes, calm mode ok.

### E1 Fill the empty screens (biggest win)
- [x] Home hero: a blank band between tagline and gate board (desktop + phone). Big stamp + display headline + one hero dish/room photo
- [x] Voyage intro: a whole viewport of plain gold glow. Add the opening line ("Canton → Kolkata, 1778") + the ship
- [x] Goodbye door: 2 blank black panels. Put the room photo / painted mural inside the doors
- [x] Soho: hero has sign only, room cards say "photo to come". Interim brand line drawings that swap to photos automatically
### E2 Type scale + hierarchy
- [x] One modular scale (1.333) for desktop; headlines bigger at 1440 (TURN THE PAGES, PULL UP A CHAIR look small)
- [x] Fewer tiny tracked caps labels (eyebrows ~9px); min 12px, keep only where they carry info (stop 1 of 5)
- [x] Nav 11px → 13px; footer text up
### E3 Desktop layouts (now = phone layout centred, wide empty sides)
- [x] List menu: sticky section index left + menu right
- [x] Good to know: bigger, card per topic with icon
- [x] Footer: hours, socials, newsletter, gift cards, 3 branch stamps
- [x] Content width 1200 grid; full-bleed photos break the grid on purpose
### E4 Photos + art direction
- [x] One photo grade (warm, light grain) for all photos; Covent Garden set is the reference
- [x] Dish photos on signature cards that lack them; shot list for client (Soho room, 12 dishes, bar)
### E5 Story spine
- [x] Slim chapter progress on home: Canton · Kolkata · London · Dubai (lights up as you scroll, tap to jump)
### E6 Vintage finish + consistency
- [x] Button system: 3 kinds only (tiger solid, outline, text link) + one focus ring style
- [x] Paper grain, perforation, stamp edges used the same way everywhere
- [x] One icon set (line, 1.5 stroke)
### E7 Feel
- [x] Hover/press: ticket lift, stamp press on Book, menu card tilt; 150–300 ms; reduced-motion = none
- [x] Phone dock: check it never covers last lines (bottom padding)

- Result E (19 Nov):
  - E1: the rain hero has a fogged still under the glass (it shows at once, and stays if WebGL can't run). The arrival stamp sits under the board, not over its letters. The doors' gold light now carries the opening line ("From Canton to Kolkata"). The receipt prints faster. Soho "Walk the room" shows a floor plan per stop, until the photos arrive.
  - E2: h2 scale 34→72px (1.333). No label under 12px except the decorative plate backs, which are repeated in the 17px caption. Fixed 5 tiger-on-paper text spots that failed contrast.
  - E3: list menu with a sticky index and scroll-spy at 1024+. Good to know as 3 cards with icons and links. Footer: tagline, socials, phone and Book link per branch.
  - E4: `.fp-photo` house grade on static photos only (measured: a spread of warm 21–58). Grain was skipped because the textures already carry it. docs/SHOT-LIST.md written.
  - E5: chapter rail (1100px+) and an orange reading line under the header. The voyage keeps its own port ticket, so the rail is per chapter of the visit.
  - E6: 3 button kinds with one size. The focus ring colour follows the surface via --fp-ring: 0 failures over 553 controls. Two paper tokens.
  - E7: stamp press on buttons, tabs and gate rows; boarding passes lift on hover; all off in reduced motion. The dock already hides at the foot.
  - QA: perf budget met (90/98/98/99, observed LCP ≤0.21 s, CLS 0.001, TBT ≤2 ms, home 1074 KB). Lighthouse a11y 100 except one flaky run (the arrival kicker caught mid-fade). No overflow on 9 pages at 360/768/1024/1440, 0 JS errors, calm mode ok.

## Brand guidelines check + audit fixes 1–6 (19 Nov, midday)
- [x] Read B3 guidelines (47 pp). Rules that matter for the web: never rotate or reshape the logo, nor put it on a busy photo; the 5 colours only; AT Bold/Semi Bold/Regular + Lora Medium Italic only
- [x] Logo: removed rotation from 9 stamp uses (arrival + its press animation, passes, voyage, menu book, kitchen, Dubai, signature card). Branch hero mark checked: full shape, on solid ink, approved colour
- [x] Fonts: dropped AT Condensed (labels now AT; one fewer font family to load). `font-synthesis: none` keeps Lora true Medium Italic wherever 600/700 was asked for
- [x] Colours: Soho teal and CG green branch accents → slate / tiger; film-edge ambers → gold/sand; #a87f33 → gold-deep; white → paper. Kept: the Westminster street sign and the blue-and-white plates (real objects)
- [x] 1 Split-flap: flips through digits/signs only, then lands. Verified 26 frames, no foreign letters
- [x] 2 Calm mode: opening line shows over the open doors
- [x] 3 Capital labels 97 → 71 distinct: label-above-heading habits became Lora notes; kept ticket/pass/receipt/menu tabs/diet codes/nav
- [x] 4 Dot strings → sentences (hours line now "Soho is open until 10.30pm"; test-hours updated + 2 new cases). Diet code lists keep dots
- [x] 5 Arrows only on scroll cues
- [x] 6 One booking vocabulary: "Book a table", "Book at <branch>", "Join the list"; "tear the stub" is the hint, not the label
- QA: no overflow on 9 pages × 4 widths; focus ring 0/553 + 0/526 failures; a11y 100 (home 97 = the arrival overlay sampled mid-fade, same artefact as before); Soho label-in-name fixed. Perf: home 89–91, CLS 0. Dropped frames 2.0–2.2% vs 1.5–1.8% for the previous build (interleaved runs); the heavier swiftshader test shows 7% for both, kitchen worst in both. At the 2% line: worth a kitchen pass.

## Audit 7–9 (19 Nov, afternoon)
- [x] 7 Home: kitchen scene removed; its signature dishes are now page 2 of the à la carte menu book ("From the pass": 4 photos + the rest named). Doors 280→190vh (phone 220→165vh), voyage 460→340vh. Home 16.3→12.7 screens on phone, 16.8→12.9 on desktop. Story rail lost its kitchen stop. Kitchen.tsx, carousel-cards.tsx, ink-background.tsx deleted (unused)
- [x] 8 Dubai: waitlist straight after the hero; VoyageToDubai removed (the home voyage already sails to Dubai); packing list is a compact strip on phones. 8.8→5.6 screens on phone; 303→221 KB
- [x] 9 Kept American Typewriter for copy: guidelines p.20–21 say titles AND copy, so "typewriter only for headlines" would break them. Licence backup instead: FONT_BACKUP=1 swaps to Kameron (OFL), checked 360–1440 with no overflow; buying steps in HANDOVER
- [x] Arrival overlay goes aria-hidden + inert the moment the shutter starts (Lighthouse kept sampling the fade)
- QA: no overflow 9 pages × 4 widths; focus ring 0/549, 0/523; a11y 100 on all 4 (home 100 ×2); budget met twice: home 88–92, dropped frames 0.8–1.5% (was 2.0–2.2), 970 KB; Dubai 100

## Phase 3: design system (20 Nov) ✅
- [x] tokens.css: type, spacing, layout, controls, elevation, motion, layers; 6 surfaces × 25 semantic colour roles
- [x] components.css (fp-): buttons (7 states), links, nav links, fields, chips, stepper, messages, ledger, hours, facts, badges, print/ticket/tag/postcard, dialogs, desk recipes
- [x] Contrast gate in prebuild (scripts/check-contrast.ts): 150/150 pairs pass
- [x] /styleguide/ is the showcase (preview builds only)
- [x] Decisions: sentence-case buttons, AT Light section headlines (recommended options)
- Verified: astro check 0; computed styles identical on 8 routes × 390/1440 except the Book drawer focus ring (gold on sand 1.6:1 → ink 8.8:1, fixed); styleguide axe 0, no overflow, 0 JS errors at 390/768/1440/calm; dialog and form behaviour scripted.
- Next: Phase 4, move pages onto the system (phase3/design-system.md §10)

## Phase 4: build the approved UX structure (docs/redesign/phase4/ux-structure.md) — started 20 Nov
Gate per slice: astro check 0, build, no overflow 320/390/768/1440, 0 JS errors, axe 0 on touched routes, booking smoke test. Full Lighthouse + CLS + screenshots at the end.
- [x] 4.1 Navigation: group/deposit/pre-theatre rules as data; menu page in branch context; one header (branches, Menus ▾, Groups, Book); Index ledger; dock per context + menus chooser; vouchers link only when set; no-JS fallbacks
- [x] 4.2 Redirects (vercel.json, _redirects, redirects.csv) + /book/ booking desk; trailing slash
- [x] 4.3 Branch pages: arrival = Book + See the menus; facts row without Book; menu ledger instead of page-flip; plain-word headings; receipt on home only; Dubai cleanup
- [x] 4.4 Menu page: one menu at a time (#hash), phone menu sheet, search across menus, empty state, h1 "<Branch> menus", breadcrumb
- [x] 4.5 Book drawer: typeable guests, done state + retry, group hand-off pre-filled, deposit note at 4+
- [x] 4.6 Groups page: fp-form, rules ledger, prefill from query, states; PUBLIC_FORM_ENDPOINT (form-to-email), mailto until set
- [x] 4.7 Dubai list: states; off ("coming soon") until PUBLIC_DUBAI_LIST_ENDPOINT is set
- [x] 4.8 Info pages "In short" + Questions block; 404 ledger
- [x] 4.9 Pre-theatre times on menu, branch ledger and drawer hint; pickup row when clickAndCollectUrl is set
- [x] Final QA: axe, CLS, screenshots, smoke test, docs + roadmap
- Result (20 Nov): 13 routes × 320/390/768/1024/1440 + calm: no overflow, 0 JS errors, axe 0 (home's scroll-scene fades flag mid-animation, clean once settled, as in the baseline). CLS worst 0.020 on load. astro check 0; contrast 150/150; hours tests pass; booking smoke 8/8. Scripted: nav + Index + dock (12 checks), menus (20), drawer (20), forms with a mocked service (11) and without (5). Menu page on a phone: 34,378 → ~7,000 px (one menu at a time). After shots: docs/redesign/slices/4/.
- Found and fixed during QA: menu Book button lost contrast to the info-page link colour; bar links and boarding-pass links under the WCAG 2.5.8 target size; the target-size fix briefly overrode the 641–919px rule (overflow at 768, caught by the probe).
- Not done: Lighthouse runs (axe used instead, same engine); real phones, Safari, Firefox, screen readers; live form service (none chosen yet: CLIENT-INPUTS #5, #10, #41).

## Header and first-screen fixes (20 Nov, after local review)
- [x] H1 Astro dev toolbar off (local only)
- [x] H2 Header Book button on the system: fp-btn primary, sentence case
- [x] H3 Hero title: no dark boxes (split letters reverted after the rise; shadow fades on after)
- [x] H4 Short screens (≥641 wide, <700 tall): slimmer bar and banner, title capped by height
- [x] QA: screenshots before/after, one-line header 320–1920, overflow, axe, CLS, contrast, smoke
- Result: 1280×560 chooser first row 607→445px (now in view), 1366×650 625→460; bar 70→58px and banner 32→26px only under 700px tall; title one line at those sizes; split letter spans 23→0 after the rise; header one line at 320–1920 on 3 page types (fixed an overflow at 1100px on Covent Garden from the long caps label). axe 0 (home clean once settled), CLS worst 0.005, contrast 150/150, nav checks 12/12, smoke 8/8. Phone on its side (844×390): chooser still below the fold; header Book visible.

## Home story scenes pass (planned 20 Nov; waiting for go-ahead + decisions S-A to S-E)
- [x] S1 Doors: fit below the header; "Come in." on ink below the doors; Kolkata/Canton plaques (S-D); fix edge strip + side glow; shorter scroll + skip link (S-A)
- [x] S2 Menu book: one neutral bookmark set in two groups (S-C); restaurant choice as two fp-choice options, Dubai as a note; open on the first spread on desktop (S-B); list-menu buttons above the book; sentence case outside the book; plain sand behind it (S-E)
- [x] S3 Chapter rail: 44px targets, current chapter's label always shown, night surface
- [~] S4 Dropped after measuring: bar, room and passes sit on the same 1240 .wrap as the header (all start at x=380 at 1920); moving the header alone to .fp-container would break that. The mismatch came from the narrow centred doors and book (fixed in S1/S2)
- [x] S5 Home section headings on the system (fp-h2 Light, plain-word prefix)
- [x] S6 Boarding passes: stubs not tiger (equal choices, W1); bar and room scenes checked at 1440/1920 for the same faults
- [x] QA: perf budget (LCP, dropped frames), CLS, axe settled, calm end states, screenshots 1280×560 / 1440×900 / 1920×1080 / 768 / 390
- Result (20 Nov): doors fit below the header with Calcutta/Guangdong plaques, "Come in." + skip link on ink (gold 6:1 vs 1.6:1), edge strips gone (room/dim/glow inset matched to the panels), scroll 190→140vh. Book: neutral bookmarks in two groups, Soho/Covent Garden chips (ink when chosen), Dubai as a line, opens on the first spread at ≥1024 (signature dishes beside page 1), list links under the instruction, sentence case outside the book, plain sand. Rail 28→44px targets, current chapter named ≥1600. Room sheet centred. Pass stubs were already not tiger. axe 0 once settled, CLS ≤0.005, nav 12/12, menus 20/20, smoke 8/8. Frames at 4x CPU (noisy, same method on live vs local): desktop menu book 4.2–4.7% long frames vs 1.1–2.2% live (bigger open spread) — watch item; other scenes within the live range.
- Naming (client, 20 Nov): Guangdong for Canton and Calcutta for Kolkata in all copy, labels, alt text, meta and share images (36 places). Map labels re-placed (Calcutta below its point) so the longer name does not collide at 390 calm. Dish names "Kolkata chilli duck" / "Kolkata chilly chicken" left as on the menu (CLIENT-INPUTS #42). make-og.mjs fixed for Windows paths; share images regenerated.

## Phase 5: homepage design (docs/redesign/phase5/homepage.md), 20 Nov. Waiting for visual approval before other pages
- [x] Hero: split shopfront (words + board + Book on ink; the room behind rainy glass in a gold frame, bleeding right). Words are static HTML painted finished; only the glass is an island (client:idle). Rise on first visit only. Phones: window band, dock carries Book/Menus, all 3 rooms above the dock at 390×844
- [x] Chapters 01–05: numbered label on a rule + light headline (.fp-section-head) on story, menus, bar, room, passes; --section-pad everywhere; one 1240 column with the header
- [x] Menus toolbar: "Open the book for" chips + list pages as secondary buttons (UX F8)
- [x] Room: words + rating in one column, rating as a ledger fact; sheet top-aligned
- [x] Fixes found on the way: page title encoding (Â·), chapter rail covering content at 1100–1310px (now ≥1320), gate open dot green → system success colour, dead styles and unused imports in index.astro
- [x] QA: astro check 0/0; prebuild gates; no overflow 7 routes × 7 widths + calm; axe settled clean 320–1440; CLS ≤0.002; scripted interactions 21/22 (the miss was the test counting the off-screen skip link); smoke 8/8; perf 92, LCP 170 ms, 1,022 KB
- Not met: dropped frames 3.2% (> 2%), same range as the old build in interleaved runs. Real devices, Safari, Firefox, screen readers not tested
- [x] After review (client): first screen back to the immersive full-screen rain hero; kept static words, sentence-case Book, no hero Book on phones, header Book hidden while the hero's is in view, opening hand-wipe streak. QA: overflow none 320–1920, axe settled clean, CLS 0.002, scripted 21/22 (known astro-preview transition message)

### Phase 5 close-out (approved 20 Nov: everything below the hero as recommended)
- [x] T1 tokens.css comments: fix the encoding slip (â€“ → –)
- [x] T2 Scroll smoothness pass: find the long frames on the home scroll (voyage, menu book), fix, re-measure against the old build
- [x] T3 Refresh docs/redesign/phase5/shots: before/after with the immersive hero, full-page tours, chapters
- [x] T4 Rewrite docs/redesign/phase5/homepage.md §2 for the final design
- [x] T5 Full QA: astro check, build gates, overflow, axe settled, CLS, scripted checks, smoke, budget
- [x] T6 Commit on branch phase5-homepage and push to GitHub
- Result (20 Nov): T1 17 comment characters fixed. T2 rail measures on resize only (it forced a style and layout pass every scroll frame): long frames 6.1% → 3.1% mean over 3 alternating rounds (still > 2%; the rest is the voyage's own script, logged in phase5/homepage.md §4). Hero poster loads first: perf 82 → 86. T3 shots regenerated (immersive hero). T4 homepage.md rewritten. T5 astro check 0/0, gates pass, no overflow 6 widths × 7 routes, axe settled clean, CLS 0.002, scripted 22/22, rail tracking 5/5, smoke 8/8 (desktop test now clicks the Book in view).

## After Phase 5 (20 Nov)
- [x] Merged phase5-homepage into main (94216c7)
- [x] Prices from the printed menu photos (docs/reference/menu-2026-11/): food matched; drinks list updated; CLIENT-INPUTS #13, #19 closed
- [x] Voyage scroll pass 2: sampled route, dash and --u writes only on change. Long frames 4.2% → 3.7% mean (noisy; still > 2%). Pixel check vs old build: identical at 1440, < 1 px route difference on phone. Checks: scripted 22/22, rail 5/5, axe settled clean, smoke 8/8
- [ ] Under 2%: rebuild the voyage route overlay as a transform-moved layer (no per-frame viewBox)

## Phase 6: every page after home (docs/redesign/phase6/report.md), 20 Nov. Waiting for visual approval
- [x] Routes grouped: branch open (2), branch soon (1), menus (2), booking desk, groups form, text (4), 404; /og and /styleguide not public
- [x] Branch pages: numbered chapter heads (home rhythm), system buttons/facts/badge/hours table/ledger/tags/postcards, Book as Visit primary, no green, one gap between sand chapters
- [x] Document desk (InfoPage): chapter-head h1, label rail with build-time contents (5+ sections), reading column, summary + questions in the side column
- [x] Booking desk ledger with live status; groups facts beside a form sheet; menu index rail + toolbar + printed-menu sheet; 404 tag without tiger, with footer
- [x] Shared: footer sentence case; Book drawer, passport, 2 home pieces on .fp-btn; legacy .btn deleted
- [x] Menu page load shifts: 0.18 → 0.002 (slow 4G phone), deep link #vegan 0.57 → 0.015
- [x] QA: astro check 0/0; gates; 376/376 scripted (overflow/errors/CLS 13 routes × 6 widths + calm, axe 0 at 390/1440, interactions); smoke 8/8; Lighthouse 96–99 on 10 redesigned routes
- [x] Home perf 74–78 / TBT ~450 ms on this machine (same for the previous commit, interleaved): investigate separately (Phase 7 D2: 84–86 / 98–121 ms)
- [x] Menu deep link to a long menu (#drinks) still 0.26 CLS on slow 4G (was 0.56) (Phase 7 D3: 0.03, Lighthouse 0)
- [ ] Client: Phase 6 wording (CLIENT-INPUTS #45)

## Phase 7: premium pass (docs/redesign/phase7/report.md), 21 Nov. Steps that need nothing from the client
- [x] 7.0 D1 menu price row (container query), D2 voyage hydrates on approach (home perf 74 → 86, TBT 490 → ~110 ms), D3 passport tip in the body face (#drinks CLS 0.12 → 0.03), D4 heroes top-aligned 900–1023, D5 sample specials dropped at launch + build check
- [x] 7.1 nav sentence case + gold underline; footer hours today, 15px, plain social glyphs; NextStep page-end strip on every page but home; rhythm fixes
- [x] 7.2 What to order (approved photos), Google rating block, branch menus as two link columns
- [x] 7.3 menu rows (weight on the name, quiet marks, Born here + photo, dismissable tip)
- [x] 7.4 booking desk picker (shared src/lib/booking.ts with the drawer); groups photo + phone jump link
- [x] 7.5 Dubai: list in the hero, no empty room chapter
- [x] Checks: astro check 0/0; gates; QA 419/419 (7 widths + calm, axe, interactions); menu rows; rhythm 21/22 (Dubai tickets' shadow); Lighthouse 97–99 on 8 routes, home 84–86
- [ ] Home scroll dropped frames 2.5–3.3% (> 2%, was 2.8% before this pass): voyage overlay as a transform layer
- [ ] Waiting on client: home changes (#52), photos (#35, #36, #46), quotes (#29), logo (#32), spaces/set price (#2, #47), allergen matrix (#48), story (#49), FAQ pages (#51), dish picks (#53), wording (#54)

## Phase 8: calmer branch page (docs/redesign/phase8/plan.md, report.md), built 21 Nov
- [x] 8.1 Structure: 9 sections → 5, no section numbers, menus/dietary/allergies merged into "What to eat", groups + other rooms + rating into "Visit and book"
- [x] 8.2 Arrival: board name as the one bold thing, no badge/kicker/clock (London), one "Book a table", sample board hidden, phone facts above the fold
- [x] 8.3 Facts strip: one-line address, status once
- [x] 8.4 What to eat: ticket carries name/spices/price, aligned cards, plain diet words
- [x] 8.5 The room: one stop at a time with buttons, 13px plan labels
- [x] 8.6 Visit: one link style, tiger for Book only, Regular headings on ink
- [x] 8.7 Verify: astro check 0/0; gates; QA 439/439; interactions 19/19; menu rows; rhythm 5/6 (Soho 1440 162px under a rule); Lighthouse 94–99; Soho 7,269 → 5,305px desktop, 8,824 → 5,949px phone
- [ ] Client: sign-off on the restructure and wording (#55); Soho room photo for the hero (#35, #46)

## Story comic on the new main (branch claude/story-on-main)
- [x] Port "The tale of Fatt & Pundit" (story.ts, StoryComic, /our-story/, ChapterRail, brief) from claude/story-comic
- [x] Wording matches the approved home: Guangdong and Calcutta (not Canton/Kolkata)
- [x] Home keeps the approved Voyage; one "Read the whole story" link after it; header + footer "Our story" → /our-story/
- [x] Buttons use fp-btn; sitemap has /our-story/
- [x] Checks: astro check 0 errors; build 19 pages; no overflow 1440/390; Lighthouse a11y 100, BP 100; /our-story/ perf 99, 295 KB; home same as main (interleaved 86–91, jank 1.8–3.2% vs 2.5–2.8%)
- [ ] Client: approve characters + panel script (#49), then commission the illustrator (docs/STORY-BRIEF.md)
