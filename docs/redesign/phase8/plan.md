# Phase 8: a calmer, premium branch page (plan, 21 Nov 2026)

Status: built 21 Nov. See `report.md` for what changed, the checks, and where the build differs from this plan (Soho hero photo, "Our other rooms" heading, pre-theatre line).

Fixes the 30 flaws found on `/soho/` (same template for `/covent-garden/` and `/dubai/`).
The page today: 9 bands, 7,269px tall on desktop, 8,824px on a phone, and the same facts, dishes and buttons said two or three times.

## The idea in one line

A premium restaurant page says little and says it once. Keep the brand's real objects (the departure board, the street sign, the ticket, the floor plan, the postcards) and cut the website chrome around them (numbers, label columns, rules over every heading, repeated buttons).

## Design system for this pass (brand-locked)

The palette and typefaces come from the brand guidelines and stay. What changes is the rules for using them.

**Colour: each colour gets one job**

| Token | Hex | Job on the branch page |
| --- | --- | --- |
| Ink | `#2c2925` | Arrival and the room. Night, the restaurant itself |
| Sand | `#dac7b5` | Food and visit. Daytime, paper |
| Paper light | `#faf6ef` | Objects only (ticket, strip, postcards), never a whole band except the practical strip |
| Tiger | `#f15d3d` | **Booking only.** No inline links, no delivery links |
| Gold | `#cba052` | Live status and "today". Nothing decorative |
| Slate | `#758591` | The floor plan's lines only |

Result: 4 surface changes from top to footer (today 6), never 2 in one screen.

**Type: American Typewriter throughout, Lora italic as the single spoken line**

| Role | Size desktop / phone | Weight |
| --- | --- | --- |
| Branch name (departure board) | 112 / 56px tiles | Bold, capitals: the one place capitals stay |
| Section heading | 56 / 34px | Regular on ink, Light only on sand (the light cut breaks up on ink: flaw 6) |
| Dish name, fact | 22 / 19px | Bold |
| Body | 18 / 17px, line height 1.6, max 62ch | Regular |
| Spoken line (Lora italic) | 22 / 19px | One per section at most |
| Small | 15px | Regular, never below 13px (the plan labels are 9px today) |

No all-caps labels, no tracked-out kickers, no section numbers.

**Layout: five bands, each with one job**

```
Desktop                                         Phone
┌────────────────────────────────────────────┐  ┌──────────────────┐
│ INK  SOHO (board, huge)  │ sign / room      │  │ sign band 180px  │
│      Book a table   See the menus           │  │ SOHO             │
│                          │ photo, full bleed│  │ Book a table     │
├────────────────────────────────────────────┤  │ See the menus    │
│ PAPER  Today 12–10.30pm · address · Call    │  ├──────────────────┤
├────────────────────────────────────────────┤  │ PAPER facts      │ ← in the first screen
│ SAND  What to eat at Soho.                  │  ├──────────────────┤
│  [ticket: kid goat momo]  story, 1 sentence │  │ SAND food        │
│  [photo] [photo] [photo]                    │  │ ticket, cards →  │
│  Menus: À la carte  Set  Pre-theatre …      │  │ menus line       │
│  Dietary: Vegan  Halal  Gluten free …       │  ├──────────────────┤
├────────────────────────────────────────────┤  │ INK room         │
│ INK  The first Fatt Pundit.                 │  ├──────────────────┤
│  floor plan walk, one stop at a time ◀ ▶    │  │ SAND visit+book  │
├────────────────────────────────────────────┤  └──────────────────┘
│ SAND  Open six days a week.  │ Book a table │
│  hours table                 │ 4.8 Google   │
│  Maps · Email · Delivery     │ groups line  │
│  Covent Garden is close by. postcards ×2    │
└────────────────────────────────────────────┘
```

Left-aligned throughout; one 12-column grid; headings start on the same column as body text (no label column in front of them).

**Principles**
1. Each fact once (address, phone, hours, stations, menus).
2. The board name is the one bold thing; everything around it is quiet.
3. Tiger means "book". If it's orange, it books a table.
4. Objects, not chrome: structure comes from the ticket, sign, plan and postcards, not from numbers and rules.
5. A section exists only if a guest would miss it.

**Review against generic defaults.** Ink plus a vermilion accent and hairline rules over every heading is the generic "dark page, bright accent, broadsheet" look. The colours are the brand's own Pantones, so they stay. The broadsheet chrome is ours, so it goes: no rules over headings, no numbered label column. Section heads become plain headings, and each section opens with its own object instead.

## Sections, before and after

| Today (9) | After (5) |
| --- | --- |
| Arrival | 1. Arrival (name, Book, menus link, room photo or sign) |
| Facts strip | 2. Facts strip (today's status lives here only) |
| The room | 4. The room (moves below the food) |
| Born here | 3. What to eat (signature ticket, photo cards, menus) |
| What to order | merged into 3 |
| Menus at Soho | merged into 3 as two lines of links |
| Visit | 5. Visit and book |
| Good to know | removed: dietary → 3, allergies → 3, groups → 5 |
| Other rooms + closing strip | merged into 5 |

Target: about 4,500px desktop, 5,500px phone (measured after the build, not assumed).

## The 30 flaws and their fixes

### Step 8.1 Structure (flaws 1–5, 25, 26, 28, 29, 30)
| # | Flaw | Fix |
| --- | --- | --- |
| 1 | Nine sections | Five, as above |
| 2 | Same heading treatment ×7 | Plain headings without the label column. Each section opens with its own object (ticket, plan, hours) |
| 3 | Numbers 01–07 aren't a sequence | Remove section numbers. The floor-plan stops keep "1 of 5": that one is a sequence |
| 4 | Six links to the menus page | Three: hero "See the menus", the menu lines in "What to eat", each dish card |
| 5 | Five background switches | Ink → paper strip → sand → ink → sand → footer, as in the table above |
| 25 | Dietary list said twice | Once, as the "Dietary" line under the menus |
| 26 | "Seated 5–5.45pm" ×2; system-speak lead | Pre-theatre and veg pre-theatre share one line: "Pre-theatre, also vegetarian: seated 5–5.45pm". Remove the "opens as a list, with search…" line |
| 28 | Long paragraphs on luggage tags | Remove the section. Allergies: one sentence and link under the menus. Groups: one line next to Book |
| 29 | Travel headings, numbered postcards | No "Before you travel." / "Onward travel." Postcards lose their numbers and sit in Visit under "Covent Garden is close by." (Dubai: "Opening soon in Dubai.") |
| 30 | "Book" ×3 at the end, "Next" label | Visit and book: heading is the hours; one "Book a table" button; no "Next" label; the NextStep strip isn't used on branch pages |

### Step 8.2 Arrival (flaws 7–16)
| # | Flaw | Fix |
| --- | --- | --- |
| 7 | "Fatt Pundit" ×3 | Header logo only. Remove the round badge and the small brand label (the hidden page title still reads "Fatt Pundit Soho") |
| 8 | Small name, stray line on the S | Board name at 112px desktop / 56px phone. Fix the stray hinge line. It becomes the page's one bold thing |
| 9 | "Opens 12pm" twice | Status only in the facts strip, which sits directly below |
| 10 | Local-time line | Remove for London rooms; keep only for Dubai (a different time zone is real information there) |
| 11 | "sample lines" visible | Tonight's board only shows once the client's sheet is connected, in preview too |
| 12 | Board repeats dishes shown below | When live, the board sits in "What to eat" as "On tonight", not in the hero |
| 13 | Three all-caps styles | Capitals only on the board name and the real street sign |
| 14 | Empty dark tile wall | Covent Garden keeps its room photo and video. Soho: the lit-wall photo, cropped tight, with the sign at true scale, until a Soho room photo arrives (#35, #46) |
| 15 | Two Book buttons, two labels | One label everywhere on the page: "Book a table". The header's Book appears only after the hero has scrolled away |
| 16 | Phone hero pushes facts below the fold | Sign band 180px, then name, Book, menus link. The facts strip ends inside the first 844px screen. The bottom bar appears after the hero |

### Step 8.3 Facts strip (flaw 17)
| # | Flaw | Fix |
| --- | --- | --- |
| 17 | Address wraps to three lines | "77 Berwick Street, W1F 8TH" (no city: it's in the page title and footer), postcode never split. Today: status and times on one line. Four columns: today, address, stations, Directions / Call |

### Step 8.4 What to eat (flaws 20–24)
| # | Flaw | Fix |
| --- | --- | --- |
| 20 | Name and spices said twice | Heading "What to eat at Soho." The ticket carries name, price and the spices; beside it one sentence of story only |
| 21 | "Marked DF, H" | "Dairy free and halal." |
| 22 | Ticket half empty | Ticket sized to its content: name, spices line, price, stamp in the corner |
| 23 | Wrapped names misalign cards | Name on its own row, price on the row below (cards share rows with CSS subgrid). Phone: the row scrolls sideways, cards at 80% width so the next one shows |
| 24 | Rating as a footnote | Moves to Visit and book, next to the button: "4.8 on Google from 16,000+ reviews (November 2026)." Proof where the decision is made |

### Step 8.5 The room (flaws 18, 19)
| # | Flaw | Fix |
| --- | --- | --- |
| 18 | Second card cut mid-word, no arrows | One stop at a time on desktop, with previous / next buttons and "1 of 5"; the next card peeks behind a fade, never mid-word. Phone keeps swipe plus the buttons |
| 19 | 9px labels, faint lines | Plan labels 13px minimum. Lines in slate-bright on ink (contrast 3:1 or better for graphics) |

### Step 8.6 Visit and the colour rules (flaws 6, 27)
| # | Flaw | Fix |
| --- | --- | --- |
| 6 | Thin headings on dark | Regular weight on ink; Light only on sand |
| 27 | Mixed map buttons and links; tiger on delivery links | "Google Maps", "Apple Maps", "Email us", "Deliveroo", "Uber Eats" all as one style of underlined link in the text colour. Tiger stays for Book only. Check all pairs with `check-contrast.ts` |

### Step 8.7 Verify
- `astro check`, build gates (data, hours, contrast).
- QA on all routes and 7 widths. Update the checks:
  - no section numbers
  - one Book button per screen
  - menus page linked from at most 3 places
  - address once in the page body
- Rhythm check: at most 1 surface change per screen.
- Menu rows check, Lighthouse budget on the three branch pages, before/after screenshots in `docs/redesign/phase8/`.
- Measure page height before and after, both widths.

## Needs the client
- **#55: Sign-off on the restructure.** Removing "Good to know", moving "Other rooms" into Visit, hiding sample specials in the preview. Also the new wording:
  - "What to eat at Soho."
  - "Covent Garden is close by."
  - "Pre-theatre, also vegetarian: seated 5–5.45pm"
  - "Dairy free and halal."
- **Soho room photo (#35, #46).** Step 8.2 has a fallback until it arrives.
- Everything else uses content we already have.

## Not in this pass
Home page (#52), the menu pages, booking desk and groups page: they keep their Phase 7 design.
