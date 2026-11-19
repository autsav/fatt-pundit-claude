# Design direction — Phase 1 proposal

**Status: proposal, awaiting approval.** Nothing in `src/` changes until it is approved.
Evidence: `website-audit.md` (§4) and the baseline frames in `baseline/frames/`. Mock frames: `mocks/` (see §8).

## 1. Concept: "The traveller's desk"

The site already tells one strong story: Hakka families sailing Canton → Kolkata → London → Dubai, told through travel ephemera (departure boards, postcards, boarding passes, receipts). **We keep that story.** What is missing is a *desktop* point of view. Today most wide screens are the phone column set in a large empty field (audit 4.1).

The new frame: on a wide screen, every section is **a desk spread**. The objects of the journey (a photo print, a ticket, a postcard, a menu) are laid out *together* across the width, overlapping a little, the way you would empty a travel wallet onto a table. On a phone the same objects stack into one hand-held pile, which is what the site already does well.

This is a refinement of the existing brand world, not a new one. It needs no new colours, fonts or illustration styles.

## 2. Principles

1. **Ephemera, not UI.** Every container is a real object from the journey: ticket, tag, postcard, receipt, menu, board. Generic white cards with icons (today's "Good to know") become objects. If an element can't be named as an object, it is plain type on the surface.
2. **Fill the frame with intent.** At 1024 px and wider, each section uses the 12-column grid and puts at least two objects in play (photo + text object, or object + object). No section is a centred phone column with empty sides. Photos may break the grid; text never does.
3. **Essentials before story.** On a branch page, today's hours, address, Book, Call and Directions sit in the first screen and a half, as one "boarding card" strip right under the hero. The long story follows for anyone who wants it, and the full Visit section stays where it is.
4. **Night and day surfaces.** Ink sections are evening (hero, bar, visit, goodbye). Sand and paper sections are daytime (room, menu, good to know). They alternate in a set rhythm, and two sections of the same surface never sit next to each other without an object between them.
5. **Hierarchy by scale, not by more fonts.** Only the two guideline families are allowed (AT + Lora Medium Italic). Contrast comes from size jumps (display ≥ 96 px at 1440), weight (Bold vs Regular/Light), and voice (Lora italic for the "spoken" line). Tracked capitals belong only on ephemera (tickets, tags, boards), never on running UI.
6. **Physical motion only.** Things stamp, tear, flip, sail, slide out of a wallet. No decorative fades, parallax drift or glow. Every motion has a calm-mode end state. The perf lessons are rules: transform and opacity only, first screen painted finished.
7. **Honest content.** Placeholder imagery (Soho) is a designed object: a drawn plan or a street sign. It never pretends to be a photo. Unconfirmed facts stay out of the design.

## 3. Grid and composition

| Width | Columns | Margin | Gutter | Content max | Notes |
| --- | --- | --- | --- | --- | --- |
| < 640 (phone) | 4 | 20 px | 16 px | — | One pile; objects full width with a little tilt-free overlap |
| 640–1023 (tablet) | 8 | 32 px | 20 px | — | Two-up where objects are small (tags, postcards) |
| ≥ 1024 (desktop) | 12 | clamp(40px, 5vw, 80px) | 24 px | 1320 px | Desk spreads; full-bleed photos allowed |

Desk-spread recipes (desktop):
- **Photo + object:** photo spans columns 1–7, bleeding off the left edge. The text object spans 7–12 and overlaps the photo by one column.
- **Object pair:** two objects at columns 2–6 and 7–11, offset vertically by 48–96 px.
- **Object + list:** a large object (menu book, board) at 1–6, with a scannable list or index at 8–12.

## 4. Typography (two families, existing files)

| Role | Font | 390 px | 1440 px | Notes |
| --- | --- | --- | --- | --- |
| Display (hero name) | AT Bold, caps | 52 | 140 | Unchanged clamp |
| H2 section | AT Bold, caps | 34 | 96 | Was 72 max; desktop sections looked small (audit 4.1) |
| H3 object title | AT Bold, caps | 22 | 32 | |
| Spoken line | Lora 500 italic | 20 | 30 | One per section, carries the voice |
| Body | AT Regular | 17 | 19 | Max 64ch |
| Ephemera label | AT Bold caps, 0.18em | 12 | 13 | Only on objects |
| Fine print | AT Regular | 14 | 14 | Legal, captions |

## 5. Imagery and art direction
- Keep the house grade (`.fp-photo`) and the Covent Garden set as the reference look.
- **Soho until the photos arrive:** the street sign hero becomes a full-width typographic composition (the Westminster sign at scale over the brick-coloured ink field, plus the tiger stamp). "Walk the room" keeps its plan drawings, labelled as plans. When `soho/hero.jpg` exists, the template swaps to the photo hero automatically (same mechanism as today's photo frames).
- Photos are printed objects: a thin paper border and a hard offset shadow (no blur) where they sit on sand. Edge to edge only on ink.

## 6. Motion
Keep the existing language (`motion-tokens.ts`: fast 200 ms feedback, story 900–1200 ms). Additions are limited to:
- The boarding-card strip slides up from under the hero once, at 900 ms. Calm: in place.
- Objects in a desk spread settle with a 4–8 px drop and a stamp spring. No rotation of logos (guidelines).

## 7. Page-by-page intent

| Page | Keep | Change (proposed) |
| --- | --- | --- |
| Home | Rain hero + departure chooser, voyage, bar, boarding passes | Doors: on desktop, the doors sit at columns 4–9 with the opening line set as a big spoken line on the gold field beside them, instead of a portrait in a landscape void. Menu book: larger on desktop (object + list recipe: the book left, bookmarks as an index right). Goodbye: receipt + room photo as a desk spread; no blank black panels |
| Branch (3) | Template, scenes, plate wall, menu book, visit | **Boarding-card strip** under the hero (today's hours, address, Book, Call, Directions). Soho typographic hero at full width. Tonight's board: lines fit to width on a word boundary. "Good to know" → three luggage tags. "Other rooms" → two postcards across the width |
| List menus | Search, filters, sticky index, passport | Desktop: filters sticky with the index; dish rows keep the "NAME — £price" menu style |
| Info pages | Content (draft wording stays marked) | Set as a printed document on paper: a narrower measure, a ticket header with the page name |
| 404 | Luggage tag with links home and to the 3 branches (already built) | Make "Lost luggage" the `<h1>` (today it is a `<p>`) |

## 8. Mock frames (in this phase)
`mocks/branch-arrival.html` renders three frames: (A) the Covent Garden arrival as a photo + object spread, plus the boarding-card strip; (B) the Soho typographic street-sign hero, plus the strip; (C) "Good to know" as luggage tags and "Other rooms" as postcards. It uses the real fonts, tokens, images, and copy and hours from `branches.json` ("Today · Thu" is fixed for the mock). Screenshots: `mocks/shots/branch-arrival_{390,1440}.webp`. These are static design mocks, not production code.

Checked (headless Edge): no horizontal overflow at 390 or 1440, all images and fonts load. Known mock-only shortcut: the header uses the long "Book at Covent Garden" label at 390 px, so it wraps. Production already shortens it on phones.

## 9. Open questions for you (do not block approval)
1. "Chinese-Indian" vs "Indo-Chinese": the site uses both (audit 4.8). Which one is the house term?
2. Is a bigger H2 (96 px) on desktop acceptable within the guidelines' hierarchy? The guidelines specify fonts, not sizes.
