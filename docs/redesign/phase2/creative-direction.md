# Phase 2 — Creative direction

**Status: direction approved 19 Nov 2026 — "A, disciplined by B" (§5).** The full branch-page mock (§9) awaits approval. Nothing here is implemented. No file in `src/` changed.
Inputs: `comprehensive-audit.md` (score 70/100), `design-direction.md` (Phase 1, "The traveller's desk", approved and partly built in slices 2.1–2.3a), brand tokens in `src/styles/global.css`.

## 1. What the three directions share (fixed constraints)

- **Brand colours only:** ink, tiger, gold, sand, slate, paper and their derived contrast tokens.
- **Two type families only:** American Typewriter (Light, Regular, Bold) and Lora Medium Italic. The American Typewriter licence is still unresolved for every direction.
- **Existing assets only:** photos from `src/assets`, the existing orange stamp file (Direction A). The wordmark in every header is plain type standing in for the logo; no logo was drawn or altered.
- **Honest content:** hours, addresses, dishes and prices come from `branches.json` and `dishes.json` ("today" is fixed to Thursday 19 Nov). Headlines and body lines are **draft wording**, except "Now arriving", "Pull up a chair" and "Choose your gate", which are on the site today.
- **Audience and jobs** (from the audit): people deciding where to eat tonight (need room, hours, Book inside one screen), people checking the menu or allergens, and people planning a group. The site's job is a booking, a menu view or a call.

## 2. The mockups

Each mock shows the home hero, header and navigation, one content section, the main call to action, at 1440 px and 390 px. Open the HTML files in a browser, or see the screenshots.

| | Live mock | Desktop | Phone | Board (both) |
| --- | --- | --- | --- | --- |
| A · The traveller's desk | `direction-a.html` | `shots/direction-a_1440.webp` | `shots/direction-a_390.webp` | `shots/board-a.webp` |
| B · The manifest | `direction-b.html` | `shots/direction-b_1440.webp` | `shots/direction-b_390.webp` | `shots/board-b.webp` |
| C · After dark | `direction-c.html` | `shots/direction-c_1440.webp` | `shots/direction-c_390.webp` | `shots/board-c.webp` |

Side by side (heroes, desktop and phone): `shots/side-by-side.webp`.

Checked in headless Edge: no sideways scroll at either width, every image loads. The mocks are static pictures of a design; nothing in them is interactive, and the phone "Menu" / "Index" buttons show where navigation would open, not the open state.

## 3. The three directions

### A · The traveller's desk (object-led)

| | |
| --- | --- |
| Concept | The journey Canton → Kolkata → London → Dubai, told with the things a traveller keeps: photo prints, a departures board, luggage tags, boarding passes. A wide screen is a desk with the objects laid out together; a phone is the same pile in one hand. This is the approved Phase 1 direction, pushed further. |
| Personality and tone | Warm, playful, a little theatrical. Feels like a place with a story. |
| Colour and contrast | Night (ink) and day (sand) sections alternate. Tiger is for actions and one accent word. Paper objects carry dark text. Risk area: small tracked capitals on coloured bands (audit C03). |
| Typography | American Typewriter Bold capitals for display (up to 96 px), Lora italic for one "spoken" line per section, tracked capitals only on objects. |
| Imagery | Photos are printed objects: paper border, hard offset shadow, one or two degrees of tilt. Line art (ship, mountains) as occasional decoration. |
| Layout | 12-column grid with deliberate overlap: a print bleeds off the left, the board overlaps the print and the next section. |
| Navigation | Solid ink bar: wordmark, five links, Book. Phone: wordmark, Menu, Book. The departures board in the hero doubles as the branch chooser. |
| Motion | Physical only: things stamp, flip, tear, slide out of a wallet. Split-flap board. Calm mode shows end states. |
| Responsive | Objects stack and lose their tilt; board rows become cards; passes put the stub underneath. |
| Advantages | Most ownable; nobody else's restaurant site looks like this. Continues what is approved and built. Essentials (room, hours, Book) are in the first screen. Works with few photos. |
| Limitations | Densest of the three; easy to over-decorate. Many custom components. Tracked capitals and coloured bands need constant contrast checking. The metaphor can slow down someone who only wants to book. |
| Technical | Highest build cost: six object components, overlap rules per breakpoint. Motion budget needs watching (home LCP is already 3.6 s on a slow phone, audit C12). Reuses tokens from slice 2.1. |

### B · The manifest (type-led)

| | |
| --- | --- |
| Concept | A ship's manifest: the site as a clear, numbered document. Every room, dish and hour is a row in a ledger. Swiss-style order applied to a typewriter face. |
| Personality and tone | Confident, calm, literate. Reads like a well-set menu or a good magazine. |
| Colour and contrast | Paper and ink do nearly everything (about 15:1). Tiger appears only on things you can press and on one full-width booking band. Highest contrast of the three. |
| Typography | American Typewriter **Light** at very large sizes (up to 158 px, sentence case, tight tracking) against Bold for names. Lora italic for one emphasised word. Tabular figures for prices and hours. Almost no capitals. |
| Imagery | Few photos, strict crops (wide strip, 4:5), captioned "Fig. 1". No tilt, no shadow. |
| Layout | Visible 12-column grid, hairline rules, numbered sections (01, 02, 03), generous white space. |
| Navigation | Numbered index in the header (01 Soho … 05 Private dining). Phone: "Index" opens the same numbered list full-screen. |
| Motion | Minimal: rules draw in, rows highlight on hover, numbers tick. Nothing blocks reading. |
| Responsive | The simplest: tables collapse to stacked rows, type scales down, nothing is rearranged. |
| Advantages | Best usability, accessibility and speed. Cheapest to build and maintain. Scales to any number of rooms or menus. Does not depend on photography, which matters while Soho and Dubai have none. |
| Limitations | Loses most of the brand's playfulness and the journey objects people remember. Could read as a design studio, not a restaurant. Food appeal relies on words. |
| Technical | Lowest build cost: mostly type and tables. Would discard the scroll scenes and much of slices 2.1–2.3. Tabular figures need checking in the font files. |

### C · After dark (image-led)

| | |
| --- | --- |
| Concept | Walk into the room at night. Full-screen photography and video carry the site; the interface almost disappears. |
| Personality and tone | Sensory, intimate, grown-up. Sells the evening, not the story. |
| Colour and contrast | Near-black throughout. Colour comes from the photos (green walls, burgundy banquettes). Tiger for the one booking action, gold for small labels. All text on photos needs a dark scrim behind it. |
| Typography | Lora italic as the display face (up to 148 px), American Typewriter for small tracked labels and body. |
| Imagery | Everything depends on it: full-bleed rooms, tall dish tiles, video loops. |
| Layout | Edge to edge, thin 6 px gutters, tall tiles, split-screen room chooser. |
| Navigation | Transparent header over the photo. A booking bar sits in the hero (room, date, guests, time). Phone: fixed bottom dock with Menus, Call, Find a table. |
| Motion | Cinematic: slow cross-fades, gentle image scale, horizontal swipe reel. |
| Responsive | Hero stays full-screen; tiles become a swipe reel; the dock replaces the booking bar. |
| Advantages | Most appetising. Booking is the most prominent of the three. The phone dock fixes the missing phone navigation (audit C11). |
| Limitations | Least original: full-bleed photo plus italic serif is the most common pattern for restaurant sites. Drops the journey story. **Soho and Dubai have no photography**, so half the site would be placeholders (shown honestly in the mock). Text over photos is a standing contrast risk. |
| Technical | Heaviest pages: large images and video push load time the wrong way (audit C12). The booking bar implies live availability; today the site only deep-links to OpenTable and SevenRooms, so the bar would be a styled form that hands off, or a new integration. Fades and image scaling conflict with the project's "physical motion only" rule. |

## 4. Critique, side by side

Scores are my judgement, 1 (weak) to 5 (strong), based on the mocks and the audit. They are not measurements.

| Criterion | A · Desk | B · Manifest | C · After dark |
| --- | --- | --- | --- |
| Originality | **5** | 4 | 2 |
| Brand alignment | **5** | 3 | 3 |
| Usability | 3 | **5** | 4 |
| Implementation complexity (5 = simplest) | 2 | **5** | 3 |
| Accessibility | 3 | **5** | 2 |
| Scalability (new rooms, menus, pages) | 3 | **5** | 2 |
| **Total / 30** | 21 | **27** | 16 |

Reading the table honestly:

- **B wins on the numbers** because four of the six criteria reward order and simplicity. But it scores lowest where this brand is strongest. A restaurant site that is flawless and forgettable is a poor trade.
- **A is the only one that could not belong to another restaurant.** Its weaknesses (density, contrast, build cost) are exactly the defects the audit already found on the live site, which is A's ancestor.
- **C is the easiest to like in a screenshot** and the hardest to deliver: it needs photography the client has not supplied and it removes what makes the brand distinct.

## 5. Recommendation: A, disciplined by B

**Keep "The traveller's desk" as the world, and adopt the manifest's rules for everything that is information.** In short: *objects for moments, ledger for facts.*

What that means in practice:

1. **One hero object per section, at most.** A print, a board, a pass. Everything else in the section is plain type on the surface, set on B's grid with B's hairline rules. This removes A's density problem.
2. **Facts are set as a manifest.** Branch rows (room, address, today's hours, Book), menu lists with right-aligned prices, numbered navigation. Sentence case, tabular figures, no tracked capitals on running information. This fixes most of the audit's contrast and label findings (C03, C04) by design.
3. **Display type gains B's light weight.** Bold capitals stay for object titles; section headlines may use American Typewriter Light, large, in sentence case. Still two families.
4. **Tiger means "press me".** Outside one accent word in the hero, tiger is reserved for actions, as in B.
5. **Borrow two things from C:** the fixed phone dock (Menus, Call, Book), which closes audit C11, and one full-bleed night photograph per branch page where photography exists.
6. **Do not take from C:** the inline booking bar (no availability integration exists) or fade-based motion.

Why this over pure B: slices 2.1–2.3a already build A's foundation, the client approved A's concept, and the journey story is the brand's main asset. Why this over pure A: the audit shows that A without discipline produces the density, contrast and phone-navigation defects we are trying to remove.

### Effect on the roadmap

No approved slice is thrown away. Slices 2.4–2.7 stay, with these changes if you approve:
- 2.4 (boarding-card strip) is set as a manifest row, not a decorated ticket.
- 2.4a (phone navigation, from the audit) becomes the fixed dock plus a numbered index.
- 2.5 keeps luggage tags and postcards, limited to one object type per section.
- 2.7a (menu page) adopts the ledger layout from mock B.
- The critical booking fix (2.3b) and accessibility slice (2.3c) are unaffected and should still go first.

## 6. Design risks

| Risk | Applies to | Mitigation |
| --- | --- | --- |
| Hybrid drifts into two styles on one page | Recommendation | The rule in §5.1–5.2 is written into `design-system.md` as a checklist; one mock of a full branch page before building. |
| American Typewriter Light at display size looks thin on low-quality screens | B, recommendation | Minimum 48 px for Light; test on a real mid-range phone (not yet done). |
| Font licence unresolved | All | Kameron fallback already exists (`FONT_BACKUP=1`); re-check the hybrid in Kameron before sign-off. |
| No Soho or Dubai photography | C most, A least | The recommendation needs only one photo per section and falls back to typographic objects. |
| Contrast on photos and coloured bands | A, C | Text sits on paper, ink or sand; anything on a photo gets a measured scrim; every slice keeps the 4.5:1 gate. |
| Object components raise build and upkeep cost | A, recommendation | Cap at six object types (already listed in `design-system.md`); no new ones without approval. |
| Draft headlines mistaken for approved copy | All mocks | Marked as draft here and in each mock's footer; "Chinese-Indian" vs "Indo-Chinese" is still an open client question. |

## 7. Not verified

Real phones, Safari and Firefox, screen readers, and client reaction. The mocks were only rendered in headless Edge at 1440 and 390 px. Tablet widths were not mocked. The scores in §4 are judgement, not test results.

## 8. Decision needed

Approve one of:
1. **A + B rules** (recommended), or
2. pure A, pure B or pure C, or
3. a different mix: say which parts.

**Decided 19 Nov 2026: option 1.**

## 9. Full branch-page mock in the approved direction

`branch-covent-garden.html` · screenshots `shots/branch-covent-garden_1440.webp`, `_390.webp`, `_390_first-screen.webp` (shows the phone dock in place), board `shots/board-branch-covent-garden.webp`.

How the rules are applied, top to bottom:

| Section | Object (max one) | Facts as ledger |
| --- | --- | --- |
| Arrival (night) | Photo print | Numbered kicker, name, one spoken line |
| Visit strip | none | Today's hours, address, stations, Call, Directions, Book (slice 2.4) |
| 01 The room | Full-bleed photo (the one borrowed from C) | Light headline, figure caption |
| 02 Born here | none | Name and one line, from `branches.json` |
| 03 Menus (day) | Photo print | Nine menus as a numbered list (slice 2.7a) |
| 04 Visit (night) | Boarding pass with Book | Seven-day hours table, today highlighted |
| 05 Good to know (day) | Luggage tags (one type, three of them) | Only facts already in the data |
| 06 Other rooms | Postcards (one type, two of them) | Address and one link each |
| Phone | Fixed dock: Menus, Call, Book (slice 2.4a) | "Index" opens the numbered navigation |

Checked in headless Edge at 1440 and 390 px: no sideways scroll, all images load. In the full-length phone screenshot the dock appears part-way down the page; that is a screenshot artefact of a fixed bar, and the first-screen shot shows its real position.

Draft wording in this mock: the headlines of sections 03, 05 and 06 and the third luggage tag. Everything else is from the site data.

Next step after approval of this mock: implementation by slice, starting with 2.3b (the critical booking fix). No implementation has started.
