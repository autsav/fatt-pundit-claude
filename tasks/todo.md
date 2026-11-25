# Fatt Pundit rebuild: open tasks

Tick only with proof (build log, screenshot, test output). Finished phases: tasks/archive/todo-done.md.
Client question numbers (#n) refer to docs/CLIENT-INPUTS.md.

## Launch blockers (before DNS switch)
- [ ] Font licence: buy ITC American Typewriter web fonts (incl. Semi Bold), same filenames in src/assets/fonts/american-typewriter/. Backup: FONT_BACKUP=1 (Kameron)
- [ ] Client confirms every row in docs/content-discrepancies.md
- [ ] Logo SVGs from the B3 branding pack replace PNG placeholders in src/assets/images/brand/ (#32)
- [ ] Geo coordinates for Soho and Covent Garden (schema + map)

## Waiting on client
- [ ] Send client input list + discrepancy report (Utsab)
- [ ] Draft pages: allergen wording, privacy controller details, booking hold time/deposits, step-free access
- [ ] vouchersUrl in branches.json; PUBLIC_NEWSLETTER_ACTION; OpenTable/SevenRooms deep-link params; spice data per dish
- [ ] Form service for groups/Dubai list (#5, #10, #41)
- [ ] Guidelines map art cleared for web use at this size?
- [ ] Photos (#35, #36, #46) incl. signature dishes and Soho room/night; quotes (#29); spaces/set price (#2, #47); allergen matrix (#48); FAQ pages (#51); dish picks (#53)
- [ ] Wording: Phase 6 (#45), home changes (#52), #54, Phase 8 branch restructure sign-off (#55)
- [ ] Story: approve characters + panel script (#49), then commission the illustrator (docs/STORY-BRIEF.md)

## Engineering
- [x] Motion roadmap M1 (docs/MOTION-ROADMAP.md): spring token + spatial/effects rule, dialog exits, unfolding lists, CSS scroll timelines. 21 Nov 2026: verify green, phase 8 check.mjs ok with the new dialog-exit assertion (5 pages × 2 widths), perf budget unchanged (home 84–85 / jank 3.2 %, the open item below)
- [x] Motion roadmap M2 (docs/MOTION-ROADMAP.md §M2): springs on the seven signature moments + interruption test. 22 Nov 2026: verify green, check.mjs `interrupt` ok on 5 pages × 2 widths, probes in the roadmap's done note
- [x] Motion roadmap M3, the part before the art (§M3): story panels rise on a CSS `view()` timeline (probe: 13 panels, both widths, opacity follows the scroll). 22 Nov 2026
- [ ] Motion roadmap M3, the art: SVG/Rive/Lottie choice waits for the illustrator (#49)
- [x] Motion roadmap M4, the measured part (§M4 done note): voyage wake-up 750 ms → 220–300 ms (idle-sliced sampling), camera on a transformed group, no filters on the ship, will-change only while pinned. 22 Nov 2026
- [x] Motion roadmap M5 (§M5 done note): `npm run perf:taps` (five taps, Event Timing, 4× CPU, 200 ms budget) green; it found and fixed the drawer's 248 ms open (chips pre-drawn at idle). docs/MOTION.md v2, HANDOVER field-INP note. 22 Nov 2026
- [ ] Home scroll dropped frames still 3.5–3.7% by `perf:budget` (target < 2%; voyage hidden = 0.3%): the per-frame remainder is overlay raster. Next: bake the static overlay (labels, mountains, compass) into the chart image; keep route, ports and ship in the SVG. Menu book hydration measured at 0–3 long frames, left on client:visible
- [ ] Phase 10 nits (docs/qa/phase10-final/REPORT.md §8): voyage ship badge covers the "Dubai" map label at the last stop; Book drawer day chips clip at the drawer edge with no scroll cue; street-sign subtitle is 8px (decorative)
- [ ] QA deps: add playwright-core@1.49 and axe-core@4.10 as devDependencies (hand-installed today), or document `npm i --no-save` in HANDOVER
- [ ] Higgsfield: rain on Soho street front (needs Soho night photo), tile pattern + Dubai dusk sky textures, stopgap upscales
- [ ] Not built: brand street map (needs OSM data), wall-lettering translations, pre-theatre clock, graffiti line drawing (needs Soho photos)

## Not yet tested
- [ ] Core Web Vitals in the field: set PUBLIC_PLAUSIBLE_DOMAIN after launch and read the "Vitals" events (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75). Lab only so far: docs/qa/phase9-optimisation/REPORT.md (home lab LCP 3.6 s on simulated slow 4G)
- [ ] Watch the CSP report-only console on the live host, then enforce it (public/_headers, vercel.json)
- [ ] Real phones, Safari, Firefox, mid-range Android frame rate, screen readers (Phase 7 desk audit, Chromium only: docs/qa/phase7-responsive/REPORT.md; Phase 10 final QA, same limits: docs/qa/phase10-final/REPORT.md)
- [ ] On the first deployment: response headers (HSTS, CSP report-only) and the four 301 redirects, which `astro preview` cannot apply
- [ ] Home menu book on phones: page type is 9–11px at 320–390px (cqw-scaled). The list menus carry the readable copy; decide whether the book needs a phone type floor

## Original 10-day plan leftovers (likely superseded by later phases; confirm, then drop)
- [ ] Day 2 journey storyboard (docs/journey-storyboard.md) + client direction sign-off
- [ ] Day 3 design; Day 4 BaseLayout/header/footer, <OpeningHours>, <Price> per branch currency

## Story motion, step 1 (branch story-motion)
- [x] Chapter 1 of /our-story/ as two scroll-driven scenes, "Harbour" and "At sea" (src/components/story/StoryScenes.astro; timelines in global.css "Story scenes"). CSS view timelines only, gated on support and no reduced-motion; otherwise the comic's chapter 1 shows as before
- [x] Captions and bubbles read from src/data/story.ts; caption, bubble and chapter-head styles shared with the comic (global.css "Story type")
- [x] Checks: astro check 0 errors, build, perf budget on /our-story/ (median of 3: perf 100, CLS 0.003, 338 KB, 1.5% dropped frames); 1440 and 390 screenshots, no horizontal scroll, reduced motion shows the comic
- [ ] Illustrator's cut-outs: Fatt and the crew as separate layers (no people drawn yet); larger mountain and ship art (the brand files are 196-355px wide and upscale soft)
- [ ] Decide the sea layer: voyage-sea.svg is the whole world chart (293 KB raw), cropped to open ocean with an SVG view fragment; a purpose-made water strip would be lighter
- [ ] Real Safari 26 / Firefox 159 check of the scenes (Chromium only so far)
- [x] Step 2: reusable scene engine (StoryScene, SceneArt, fx presets), chapter-by-chapter page, "Read as a comic" switch, QA script docs/qa/story-motion/check.mjs
- [x] Steps 3a-6 (plan "Revision: the whole story on one screen"): chapters 2-5 as one pinned stage each (scenes/ChapterTangra, ChapterSomethingNew, ChapterLondon, ChapterNextStop), title cards, steam/rain/flame/photo layers, stages joined, gold hand-over to #end. 22 Nov 2026: verify green, check.mjs all passed (6 stages × 2 widths), perf on /our-story/ dropped frames 1.3-1.7% (median ~1.6), score 92-100
- [ ] Perf: TBT on /our-story/ swings 7-392 ms between runs (median 79); watch it on the deployed page
- [ ] Storyboard cards still stand in for: Tangra lane, Pundit, spice sacks, wok scene, queue, friends' table, Dubai travellers, laid table (illustrator, step 7). Dubai skyline is a plain SVG silhouette for now
- [ ] Safari 26: confirm var() inside animation-range works (owner's Mac), else range classes
- [ ] Steps 7-8 in docs/STORY-MOTION-PLAN.md: illustrator layers, release check (client #57 open)
- [x] Award plan A1-A7 (docs/STORY-AWARD-PLAN.md): torn-paper wipes, colour arc, kinetic titles + sound words, frame breaks, opening stage, "Where the recipes went" map, pacing (~20 screens), rail from 1024px. 22 Nov 2026: verify green, check.mjs all passed, dropped frames 1.7-2.0%
- [x] B1 style frame A approved; harbour layers generated (hills far/near, water, junk) and the opening backdrop; voyage-sea.svg no longer used by the story
- [x] B1 rest (22 Nov 2026): Tangra lane far/near, stall, spice sacks, chillies, wok street at night, wok, steamer lid, Soho at night (replaces the CC photo), Dubai skyline + dunes, suitcases, laid table, crumpled paper; opening re-rendered at 2K. Perf medians: score 96, TBT 179 ms, LCP 2.2 s, dropped frames 1.8%, 522 KB
- [ ] B2 characters (illustrator, #49); C release check + award entry

## Premium audit — Phase 1 (branch redesign/premium-audit; plan: brief of 24 Nov 2026)
Audit only. No src/ changes. Commit only audit/ + tasks/. Stop for approval at the end.
- [x] P1-0 Branch + QA devDeps (@playwright/test 1.60, @axe-core/playwright, lighthouse; package.json uncommitted until Phase 2) — proof: deps installed (package.json uncommitted, per decision)
- [x] P1-1 `npm run verify` green + `astro preview` on :4321; live build = main? — proof: verify ok; 0 errors/0 warnings/7 hints; live assets == local
- [x] P1-2 Sweep: full-page screens 375/768/1280/1920 × motion on/off → audit/screens/before/ (slim set committed); console/network per route — proof: audit/data/sweep-*.json, audit/screens/before/
- [x] P1-3 axe (@axe-core/playwright) every route at 375 + 1280, plus open dialogs — proof: audit/data/sweep-*.json (axe + axeDialogs); AUDIT.md §Accessibility
- [x] P1-4 Lighthouse mobile (median 3) + desktop, local + live → audit/lighthouse/; PUBLIC_LAUNCH SEO pass — proof: audit/data/lighthouse-{local,live,launch}.json, audit/lighthouse/
- [x] P1-5 Link checker: internal routes, #tables #menu #bar #footer #waitlist, ?at= — proof: audit/data/links.json: 0 broken, 0 missing #, 0 bad ?at= (+ B-14)
- [x] P1-6 Existing checks re-run: test:smoke, phase8 motion check, perf:taps — proof: smoke 6/8 (stale test), phase8 → B-25, taps aborted (harness); AUDIT.md §Accessibility
- [x] P1-7 Probes for the 13 suspects (booking matrix, names, images, home DOM, no-JS, intro, skip links, dialogs, date strip, hours TZ, reviews, SEO, Dubai list) — proof: audit/data/probes.json, audit/screens/probes/
- [x] P1-8 Design review: scores per page × category; references; what "premium" means here — proof: AUDIT.md §Scores, §UX; refs in audit/refs/ (local)
- [x] P1-9 Two redesign directions with annotated mocks (audit/mocks/) — proof: audit/mocks/direction-{a,b}--{1280,375}.jpg
- [x] P1-10 audit/AUDIT.md in the brief's structure; commit audit/ + tasks/; STOP for approval — proof: audit/AUDIT.md; commit on redesign/premium-audit

## Premium audit — Phase 2 (prompt of 24 Nov, supersedes the earlier Phase 2 list)
Source of truth: audit/AUDIT.md. One commit per ID (follow-ups to an ID already committed reference the same ID). No scene design. Locked: prices, menu text, allergen codes, addresses, phones, hours data, booking URLs, legal copy, review figures.
Done = proof recorded here.

P0
- [x] B-01 Overlay shown only after the module adds a class; pure-CSS auto-hide by ~1.2 s; `<noscript>` hide — proof: Playwright JS off + `_astro/*.js` blocked, 375/1280 screens in audit/screens/after/ — done: 7516873 · intro.spec.ts · audit/screens/after/b01-*
P1
- [x] B-04 Intro ≤ 1.2 s, focus Skip on start, no 4.5 s cap — proof: probe overlay gone ≤ 1.3 s (375, 1280), first Tab = Skip — done: facafb7, d6bfd9b · intro.spec.ts (≤ 1.3 s, Skip focused, next Tab = Skip to content) · probe 1.08–1.12 s
- [x] B-02 Vitest table (both rooms × opening edge × 19:00 × last slot); desk per-room time list + nearest time; slot grid a one-line data change — proof: Vitest + Playwright desk Tue–Sun 7pm — done: 062c21a · booking.test.ts table · booking.spec.ts Tue–Sun 7pm
- [x] B-03 No-Lenis lock on `html` + stable gutter, unlock on close — proof: dialogs probe 6/6 reduced motion still, no layout shift on open — done: 32b9acb, 9d259d5, 5977f14 · dialogs.spec.ts (no shift) · probe 5/5 (no phone menus trigger on /soho/)
- [x] B-05 Story reveal start state gated on an inline-set `js` class — proof: JS off, all headings/paragraphs opacity 1 — done: 1df565f · story.spec.ts
- [x] B-06 Button says "Follow @fattpundit for the date (opens Instagram)" until a form service; comment true; form behind PUBLIC_DUBAI_LIST_ENDPOINT — proof: screenshot + grep — done: 92b8a66 · dubai.spec.ts · audit/screens/after/b06-*
- [x] B-07 Launch robots.txt has no `Disallow: /og/`; `X-Robots-Tag: noindex` on /og/* — proof: launch build robots.txt + vercel.json rule — done: 06ed5d0, b6eeb28 · audit/data/robots-launch.txt · robots.test.ts
- [x] B-16 No `mailto:` form action without an endpoint: "Email us" link + phone CTA; no client `to` field — proof: Lighthouse BP ≥ 95 on /private-dining/, 0 console warnings — done: 6087119 · groups.spec.ts · BP 100 local
- [x] B-08 `src/data/story-art.ts` manifest (placeholders kept) + `docs/ILLUSTRATOR-BRIEF.md` — proof: every panel resolves through the manifest — done: f25d9cc · story-art.test.ts · docs/ILLUSTRATOR-BRIEF.md
P2 accessibility
- [x] B-11 Base: "Skip to content" (→ main#content) first, page skip second, no "Skip to footer" — proof: first Tab on all 16 routes — done: cae8c30 · a11y.spec.ts (16 routes)
- [x] B-09 Day chip names "Today, …" / "Tomorrow, …" — proof: a11y tree — done: 1af7125 · a11y.spec.ts (names)
- [x] B-10 Day strip fade, snap, padding — proof: screenshot 375 — done: 1a07842 · audit/screens/after/b09-b10-day-strip--phone.jpg
- [x] B-15 sr "(opens in a new tab)" on branch hero Book links — proof: a11y tree — done: fc33dd2 · a11y.spec.ts
- [x] B-19 Calm-mode voyage strip grows (no scroll region) — proof: axe 375 reduced motion — done: 4ed61f7 · a11y.spec.ts axe · audit/screens/after/b19-*
- [x] B-25 One paused rule for loops; register o-cue-bob, lo-sway, lo-fall; fix the motion check's stale selector — proof: phase8 check.mjs clean, motion on — done: e10e97b · check.mjs motion on: ok · motion.spec.ts
P2 correctness
- [x] B-12 Group label swap — proof: Playwright Soho 8, CG 5 — done: 16d9628, b52f1d0 · booking.spec.ts
- [x] B-13 Ratings from branches.json — proof: grep, no review numbers in .astro — done: 84cf3aa · audit/data/phase2-proofs.txt
- [x] B-14 No canonical/og:url on noindex — proof: dist/404.html — done: e80c0be · phase2-proofs.txt
- [x] B-17 TonightBoard neutral on server, pick in effect — proof: build, clock D+1 — done: f3da74e · phase2-proofs.txt (D+1)
- [x] B-18 Drawer text only in shown nodes — proof: dist/index.html + hydrated DOM scrape — done: 8d9d5d4 · phase2-proofs.txt + hidden-copy.spec.ts
- [x] B-20 Wipe hint fine pointer only — proof: phone screenshot at 3 s — done: c3b9e29 · audit/screens/after/b20-hero-phone-3s.jpg
- [x] B-21 spring() — proof: 0 console warnings — done: dfd088c · phase2-proofs.txt
- [x] B-24 No Dubai Restaurant JSON-LD until open — proof: JSON-LD dump — done: 10268c5 · jsonld.spec.ts · audit/data/jsonld-dump.txt
- [x] Host apex → www 308, host-matched — proof: vercel.json rule — done: 1783692 · robots.test.ts
P2 quick performance
- [x] map.webp ~750 px, stamps 200 px — done: d4065f1
- [x] B-22 no forced-loaded curtain fallback in live mode — done: 7292cd1
- [x] Sitemap lastmod = build date — done: dad380c · phase2-proofs.txt
- (B-23, B-26 stay for Phase 3)
Harness
- [x] test:smoke 8/8 (phone dock), perf:taps re-run — done: e07b68e · audit/data/gate-smoke.txt, gate-taps.txt
- [x] Booking e2e: both rooms × 2/4/7/8 × today/+3 — done: booking.spec.ts (f0ad81f, e2651e7)
Gate
- [x] verify green, astro check 0 errors, Vitest + Playwright green — done: audit/data/gate-playwright.txt (120 passed), Vitest 22, astro check 0/0
- [x] sweep, lighthouse, links, probes re-run; axe with ≥ 800 ms settle: 0 serious/critical on every route — done: audit/data/sweep-gate-*.json, links-gate.log, probes.json: 0 serious/critical
- [x] AUDIT.md "After" column for every route; home P ≥ 89 local, ≥ 96 live — done: home mobile local median of 5 = P89 (86–94); every route filled. Live: the branch isn't deployed, so live is measured on the PR preview
- [ ] PR opened; then STOP (next: storyboard sign-off)

Open with the client (code ready for a one-line data change): CG slot grid, CG pre-theatre window, form service (#5/#10/#41), review source.
