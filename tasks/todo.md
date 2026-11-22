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
