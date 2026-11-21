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
- [ ] Home scroll dropped frames 2.5–3.7% (target < 2%): rebuild the voyage route overlay as a transform-moved layer (no per-frame viewBox)
- [ ] Higgsfield: rain on Soho street front (needs Soho night photo), tile pattern + Dubai dusk sky textures, stopgap upscales
- [ ] Not built: brand street map (needs OSM data), wall-lettering translations, pre-theatre clock, graffiti line drawing (needs Soho photos)

## Not yet tested
- [ ] Real phones, Safari, Firefox, mid-range Android frame rate, screen readers (Phase 7 desk audit, Chromium only: docs/qa/phase7-responsive/REPORT.md)
- [ ] Home menu book on phones: page type is 9–11px at 320–390px (cqw-scaled). The list menus carry the readable copy; decide whether the book needs a phone type floor

## Original 10-day plan leftovers (likely superseded by later phases; confirm, then drop)
- [ ] Day 2 journey storyboard (docs/journey-storyboard.md) + client direction sign-off
- [ ] Day 3 design; Day 4 BaseLayout/header/footer, <OpeningHours>, <Price> per branch currency
