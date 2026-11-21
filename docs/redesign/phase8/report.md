# Phase 8: what was built (21 Nov 2026)

Plan: `plan.md`. All 30 flaws addressed on the branch template (`/soho/`, `/covent-garden/`, `/dubai/`).
Shots: `before/` (Soho before this pass), `after/` (`<room>_1440_n` desktop, `<room>_390_n` phone, slices from the top).

## Result

| | Before | After |
| --- | --- | --- |
| Sections after the facts strip | 7 | 3 (what to eat, the room, visit and book) |
| Soho page height, desktop / phone | 7,269 / 8,824px | 5,305 / 5,949px |
| Address in the page body | 6× | 1× (the strip) |
| Book buttons in the first screen | 2 (+ the dock on phones) | 1 |
| Places linking to the menus page | 6 | 3 (hero, dish cards, menu ledger) |

## What changed, by step

**8.1 Structure**
- No section numbers or label rail. Headings start on the body's own line, without a rule over them.
- "Born here", "What to order", "Menus" and "Good to know" are one section, "What to eat at …":
  - the ticket
  - the photo cards
  - a three-row ledger: menus, dietary menus, allergies
- "Visit", the other rooms and the page-end strip are one section, "Visit and book". It holds:
  - the hours
  - map, email and delivery links
  - one Book button, with the Google rating and the group rule beside it
  - the postcards, without numbers
- The NextStep strip is no longer used on branch pages.

**8.2 Arrival**
- **Removed:** the round badge, the small "Fatt Pundit" label, the status pill and the London local-time line. Dubai keeps its clock, since its time zone is real information there.
- **Name board:** up to 112px tiles. The hinge is now a 1px gap instead of a bar through the letters.
- **One Book:** labelled "Book a table". The header's Book and the phone dock appear once the hero has scrolled away; without JavaScript they always show. The menu pages keep "Book at Soho" in the header.
- **Tonight's board:** shows only real lines from the client's sheet, in the preview too, inside "What to eat".
- **Soho hero:** the momo photograph with the Berwick Street sign on it. The plan said the "lit wall" photo, but that photo is Covent Garden's. It stays until a Soho room photo arrives (#35, #46).
- **Phones:** the photo band is 16:9 and "See the menus" is a text link. The facts strip ends at 714px, inside the first screen.

**8.3 Facts strip.**
- Address shows as "77 Berwick Street, W1F 8TH" (no city), and the postcode never splits.
- Today's status and times sit on one line.

**8.4 What to eat**
- **Ticket:** carries the name, spices, price and stamp, sized to its content.
- **Beside the ticket:** the story, shortened in `branches.json` to "On Berwick Street since 2019, folded by hand.", and "Dairy free and halal." in place of "Marked DF, H".
- **Photo cards:** name, price and description sit on shared rows (CSS subgrid), so a long name no longer pushes a price out of line. On phones the cards are 80% wide in a sideways row.
- **Menu ledger:** "Pre-theatre: seated 5–5.45pm." appears once. The "opens as a list, with search…" line is gone.

**8.5 The room (Soho)**
- **Walk:** one stop at a time with Previous / Next and "n of 5". It no longer pins and pans with the page scroll, which used two screens.
- **No half-cut stops:** the next stop waits behind a fade, which lifts on the last stop. Snapped stops line up with the heading.
- **Buttons:** use `aria-disabled`, so keyboard focus stays on a button at either end.
- **Floor plan:** labels are 20 plan units (about 13px on a phone, 21px on a desktop), and the lines and labels are stronger.

**8.6 Visit and colour**
- Every link in Visit uses one style (ink, underlined); tiger is no longer used on delivery or postcard links.
- Headings on ink use the regular weight.

## Checks (production build)
- `astro check`: 0 errors, 0 warnings. Build gates: data, hours, contrast 150/150.
- QA 439/439:
  - 13 routes × 7 widths plus calm mode
  - axe at 390 and 1440
  - new branch checks:
    - no section numbers
    - ≤ 3 chapters
    - one Book in the hero, one in Visit
    - no status, clock or badge in the hero
    - street once in the page body, one Call link
    - no page-end strip and no sample specials
    - menus linked from ≤ 3 places
    - header Book hidden over the hero and back after it
- Interactions 19/19, at 1440 and at 390 with reduced motion:
  - walk Previous / Next, ends and fade
  - phone dock hidden over the hero, back after it
  - facts strip in the first screen
  - menu page keeps its header Book
- Menu rows: OK.
- Rhythm (`rhythm.mjs`, now measuring empty bands inside the page body only):
  - 5 of 6 pass.
  - Soho at 1440: 162px below the menu ledger. This is section padding under a visible rule.
  - Surface changes: 2 per screen only where the hero meets the facts strip and the first section; 1 elsewhere.
- Lighthouse, phone:

  | Page | Perf | TBT | CLS |
  | --- | --- | --- | --- |
  | Soho | 97 | 0ms | 0 |
  | Covent Garden | 94 | 0ms | 0 |
  | Dubai | 99 | 0ms | 0 |

- Dropped frames on Dubai:
  - In the budget run: 4–11%. These runs are noisy, from frames lost while the name board flips through its words.
  - Measured alone, 3 runs each: this build 0.3–2%; the live (pre-Phase 8) page 2.5–3.2% in the same session; 0% with reduced motion.

## Still open
- Client sign-off on the restructure and wording (#55).
- A Soho room photo for the hero (#35, #46).
- The home page is unchanged (#52).
