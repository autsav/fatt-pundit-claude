# Phase 7: Premium plan

**Status:** 21 Nov 2026: steps 7.0–7.5 built where they need nothing from the client (see `report.md`); the rest waits on CLIENT-INPUTS #29, #32, #35, #36, #46–#54.
**What it's based on:** a screen-by-screen audit of every public route on the current build (13 routes; 79 desktop screens at 1440×900 and 85 phone screens at 390×844).
**Contact sheets:** `audit/d_<route>_<n>.webp` (desktop, 4 screens per sheet) and `audit/m_<route>_<n>.webp` (phone, 5 per sheet).
**Inputs:** Phase 2 creative direction ("A disciplined by B": *objects for moments, ledger for facts*), the Phase 3 design system, the Phase 4 UX structure, Phase 5 home and Phase 6 pages.

---

## 1. Verdict

### What already works
Keep all of this:
- A strong, ownable idea: the voyage from Guangdong to Calcutta to London.
- Real objects that carry it: boarding passes, luggage tags, postcards, the departures board, the menu book, the street sign.
- One colour family: ink, sand, gold, tiger.
- Fast pages: 96–99 on everything except home.
- Clean accessibility results, and working booking routes.

The Phase 6 chapter head (a numbered label on a rule beside a light headline) gives the inner pages a calm, editorial rhythm.

### What stops it feeling premium
In order of impact:

1. **Too few photographs.**
   - Soho has none: its hero is a drawn street sign and its room section is five floor plans.
   - No branch page shows a plate of food.
   - The menus, booking, groups and Dubai pages show no photos at all.
   - Premium restaurant sites sell with light, texture and food. Today ours sells with diagrams and paper.
2. **Four headline voices on one site.** It reads as several designers' work:
   - light sentence case ("Turn the pages", "The first Fatt Pundit.")
   - heavy capitals ("TO CALCUTTA", "THE BAR", "THANK YOU FOR TRAVELLING WITH FATT PUNDIT", "À LA CARTE")
   - embroidered type ("THE BAR")
   - tracked small capitals in the navigation
3. **Too many controls and too much text in the busy places:**
   - The home menus section has four control groups (16 buttons and tabs) before the book.
   - The menu rows carry name, tags, description, price and a stamp icon on every line.
   - Branch pages list menus as a 10-row ledger.
4. **Nothing proves the place is good.** The 4.8 rating sits in small print. There are no review quotes, press or awards, no chef, and no "what to order".
5. **Pages run out of content before they run out of space:**
   - sand gaps before the footer on Soho, booking and groups
   - a long empty dark area under Visit
   - a dark home ending with a hard-to-read object
6. **Placeholders still show.** The Soho walk, the Dubai "DXB" art, "sample lines" on Tonight's board, and a site-wide preview banner.
7. **Small craft gaps:**
   - the boxed scroll-progress rail on home
   - three rows of tiny footer links
   - icon tiles in square boxes
   - the phone header's "Index" label
   - one broken menu row on phones (§2)

### Direction for Phase 7: "Photograph the room, print the facts"
Keep "objects for moments, ledger for facts" and add a third rule: **photographs for desire**.
- Every page earns its first screen with a real photograph or film loop of food or room.
- Objects (tickets, tags, postcards) become accents that sit *on* the photography, not substitutes for it.
- Type goes down to two voices.
- Controls go down to the minimum.
- Every page ends with a clear next step and no empty band.

---

## 2. Fix first: defects found in this audit

| # | Where | Defect | Fix | Size |
| --- | --- | --- | --- | --- |
| D1 | `/soho/menu/`, `/covent-garden/menu/`, phones | A dish with a long price ("Stir fry Szechuan noodles — Veg £13, Chicken or beef £15") squeezes the name into a one-letter column; the letters stack vertically (`audit/m_soho_menu_1.webp`, screen 5). Cause: `.mi-head` gives the price an `auto` column with `white-space: nowrap` (`menu.astro:226–229`). | Prices longer than a short limit drop under the name, aligned right, and are allowed to wrap. Add a QA check: no `.mi-name` narrower than 40% of its row. | S |
| D2 | Home | Performance 74–78 (budget 85), TBT around 450ms. Already open from Phase 6. | Profile the scroll scenes (doors, voyage, bar light). Delay islands below the first screen until idle. Cap the voyage's per-frame work. | M |
| D3 | `/soho/menu/#drinks` | Deep-link layout shift 0.257 on a slow phone. Already open. | Hold the anchor scroll until the menu block is laid out. | S |
| D4 | Branch heroes, 900–1023px | The hero text is bottom-aligned, so it can slide on a slow load (same cause as the fix of 21 Nov). | Top-align it, and add 960 to the QA widths. | S |
| D5 | Every page | The preview banner and "sample lines" will show at launch unless content arrives. | Turn both off with build flags at launch, and make the launch checklist fail while either is on. | S |

---

## 3. System-level changes (they apply to every page)

### 3.1 Photography system (the biggest step up)
- **Art direction:** warm practical light, tight crops of hands, steam and the wok. One hero image per room, shot at dusk from the street (the place's own "golden hour"). Food shot on the restaurant's own tables, not on white.
  - Brief: `docs/SHOT-LIST.md` (update it with the list below).
- **Shots needed (client #35, #36 and new #46):**
  - Soho exterior at night; Soho room, wide and two details
  - Covent Garden exterior; each bar
  - 8 signature dishes, each overhead and three-quarter
  - 3 cocktails
  - the kitchen pass; the team (chef plus front of house)
  - the private-dining spaces with tables set
  - a 6–10 second loop for each hero: steam, a pour, the street
- **Components to build:**
  - `fp-photo` frame with three crops (16:9, 4:5, 1:1)
  - a captioned photo ("Kid goat momo, folded by hand")
  - a photo-led hero
  - a full-bleed "breath" image between chapters
  - all served as AVIF/WebP with `srcset`, LQIP placeholders, and lazy loading below the first screen
- **Rule:** objects may sit on photographs (a ticket over the room), never text on a busy area (lesson 31).
- **Until the shoot:** reuse the approved photos we already have:
  - the dish photos from the home menu book: momo, crackling spinach and others
  - the Covent Garden room set
  - the guava-chilli-sour still
- No AI-invented food.

### 3.2 Typography: two voices
| Role | Face | Use | Retire |
| --- | --- | --- | --- |
| Display | American Typewriter Light, sentence case | Every page and chapter headline, including home "To Calcutta", "The bar" and the closing line | Heavy capitals as headlines |
| Label | American Typewriter Bold, small, no tracking or light tracking | Section numbers, small labels, buttons | Wide-tracked capitals in navigation and badges |
| Spoken | Lora italic | The one line under a headline, captions | Lora as a body face for long text |
| Body | American Typewriter Regular at 17–18px | Running text | — |

- Capitals and heavy weights stay **only on objects**: tickets, boards, tags, the menu sheet's section heads and the wordmark. That's where they belong in the "printed object" idea.
- The embroidered "THE BAR" stays as the bar's object, but it gets a light sentence-case chapter headline beside it.
- Needs the font licence decision (client #31) before launch.

### 3.3 Navigation and header
- Desktop:
  - Navigation in sentence case at 15px: "Soho, Covent Garden, Dubai, Menus, Groups".
  - The active item gets a 2px gold underline.
  - "Book a table" stays the one tiger button.
- When the header shrinks on scroll, the logo SVG (client #32) replaces the typed wordmark.
- Phone: rename "Index" to "Menu ≡" and test it, or keep "Index" if the client likes the passport metaphor. The dock (Menus · Call/Rooms · Book) stays.
- Mega-menu for "Menus": two columns ("Soho / Covent Garden"), each with its menus and a small photo.

### 3.4 Surfaces and rhythm
- At most **two surface changes per screen**. Every page should open on ink (night) and move to sand (day). Gold is kept for one moment per page: the list, the passes.
- New `fp-breath` band: a full-bleed photograph between two chapters on long pages, replacing a colour change.
- **No orphan bands:**
  - a chapter head always shares its section with its content
  - a page never ends with an empty sand band (the gap before the footer becomes the next-step strip, §3.7)

### 3.5 Controls
- Each view gets one primary action, at most two secondary buttons, and links for everything else.
- Chips and tabs only where they filter what's in view. Never two rows of tabs above an object.

### 3.6 Proof (new component family)
- `fp-proof`:
  - the rating as a large figure with its source and date
  - one to three short review quotes, with name and date
  - press or awards logos, only where the client can name a source (#29)
- `fp-from-the-kitchen`: chef portrait, two lines in their voice, signature.

### 3.7 Page ends
- New `fp-next` strip before every footer, giving the guest one next step and a photo. For example:
  - "Hungry already? Book at Soho"
  - on the menus page: "Ready? Book · Print this menu"
  - on info pages: "Questions? Call or email".
- It replaces the empty sand.

### 3.8 Footer
- Larger type (15px).
- Three columns: one per restaurant, with address, hours today, phone and a Book link.
- Then one row of site links, one row of legal links and "Pause motion".
- The newsletter appears once its tool is chosen (#37).
- Social icons as plain glyphs without boxes.
- The allergen sentence stays, at a readable size.

### 3.9 Motion
- Keep motion for moments: the doors, the voyage, the split-flap board, the lights-on wall.
- The home progress rail loses its box and becomes a thin line of six ticks with a label on hover.
- Every scene has a calm end state (already the rule).

---

## 4. Page by page

Each row: what's on screen now → what changes → done when.

### 4.1 Home `/` (Phase 5, approved; changes here need client sign-off)
| Section | Now | Change | Done when |
| --- | --- | --- | --- |
| Arrival | A room photo behind the falling-letter wordmark; the restaurant chooser; Book | Keep. Make the photo a 6s film loop (steam, light). The chooser rows get today's hours in words ("Open until 10.30pm"). | First screen shows the wordmark settled within 1.2s on a phone (check the capture timing, lesson 56) |
| Doors | Two tall doors on a dark screen, mostly empty | Shorten the scene by about 40%; the doors open onto the first photo of Tangra (archival, if the client has it) | The scene is no more than 1.5 screens |
| 01 Story, to Calcutta | Heavy capitals "TO CALCUTTA" on gold | Light sentence-case headline (§3.2); the paragraph stays | One headline voice on the page |
| Voyage map | Strong. Labels can clash with the ship marker; heavy contour lines | Thin the contour lines by 30%; keep labels clear of the ship; the postcards stay | No label overlaps at 390/1440 |
| 02 Menus | Four control groups above the book | One control: "Open the Soho book / Covent Garden book" (segmented). The diet tabs move inside the book as a side index. The list links become one "Read the menus as a list" link. | No more than 4 controls above the book |
| 03 Bar | Embroidered "THE BAR"; the light-across-the-bar scene; cocktail card | Add a light sentence-case headline; swap the still for a cocktail photograph (shoot) | — |
| 04 Room | "Pull up a chair", rating in small print, contact sheet | The rating becomes an `fp-proof` block with two quotes; the contact sheet stays | Proof visible without reading small print |
| 05 Your table | Boarding passes (strong); fine print below | Keep. Fine print to 15px, set as two short lines. | — |
| Closing | Dark screen, a hard-to-read wardrobe or ticket object, a capitals headline | Replace with a closing photo (the street at night) and the line "Thank you for travelling with Fatt Pundit" in the display voice, with Book and newsletter | No empty half-screen |

### 4.2 Branch pages `/soho/`, `/covent-garden/`
| Section | Now | Change | Done when |
| --- | --- | --- | --- |
| Arrival | Soho: drawn street sign. Covent Garden: photo plus card. Both: Tonight's board, Book, menus. | Soho gets its street-front photo (shoot); the sign becomes a small object on it. Covent Garden keeps its layout. Tonight's board stays (real lines needed, #21). | A real photo in both heroes |
| Facts strip | Hours today, address, stations, Directions, Call | Keep. Add a small static map thumbnail (an illustrated map in house style, not Google tiles) that links to Directions | — |
| 01 The room | Soho: five floor plans over 2.2 screens. Covent Garden: lights-on wall, plates, contact sheet (3 large objects) | Soho: three photographs in the walk (door, bar, pass) with the floor plan as a small inset key; walk down to 3 stops. Covent Garden: keep the lights-on wall and plates, and fold the contact sheet into a lightbox opened from "See all 16 photos". | The section is no more than 2 screens and photo-led |
| 02 Born here | Paper ticket plus text | Add the dish photograph beside the ticket (the ticket overlaps the photo's corner) | — |
| New: What to order | — | Four to six signature dishes as captioned photos with price, linking to the menu. Replaces most of what the 10-row menus ledger does today. | — |
| 03 Menus | A 10-row numbered ledger | Two short groups: "Menus" (À la carte, Set, Pre-theatre, Drinks) and "For dietary needs" (Vegan, Halal, Gluten free, Dairy free, Pescatarian) as two columns of links. PDF download per menu. | No more than 1 screen at 1440 |
| New: Proof | — | `fp-proof`: rating, two quotes, any press (#29) | — |
| 04 Visit | Big address, maps buttons, hours table; empty lower half | Add a photograph of the street front or door to fill the empty half; keep the hours table and buttons | No empty half-screen |
| 05 Good to know | Three luggage tags | Keep; tighten the copy to 2 lines each | — |
| 06 Other rooms | Postcards | Postcards with a photo of each room | — |
| Page end | Empty sand before the footer | `fp-next` strip: "Book at Soho" with a photo | — |

### 4.3 Dubai `/dubai/` (opening soon)
| Section | Now | Change |
| --- | --- | --- |
| Arrival | Outlined "DXB" art, Join the list | A real image of The Hangout or a mood film (#11), or a gold-on-ink "Boarding soon" board in split-flap. The list form sits in the hero as soon as its endpoint exists (#5, #10). |
| 01 The list | Gold block with Instagram text only | Merge into the hero (one action, in one place). |
| 02 The room | A headline only ("Next stop: Dubai.") | Drop it until there's a room to show; it reads as an orphan. |
| 03 Coming with us | Three tickets | Keep; add dish photos. |
| 04 In London | Postcards | Keep. |
| Later | — | Arabic version and AED prices at opening (new #50). Halal and alcohol status (#12). |

### 4.4 Menus `/soho/menu/`, `/covent-garden/menu/`
| Section | Now | Change | Done when |
| --- | --- | --- | --- |
| Head | Breadcrumb, label, "Soho menus" | Add one line with the menu's hours (from the data) and "Download PDF" | — |
| Tools | Search, five diet chips, passport tip | Keep search and chips. The passport tip becomes a one-time hint that can be dismissed. | — |
| Menu sheet | Printed sheet, one column | Dish rows: the name gets the weight; tags become a quiet line; the price stays right-aligned. The stamp icon shows on hover/focus on desktop and as a small "+" on phones. Signature dishes get a small round photo and a "Born here" mark. Spice level once the data exists (#20). | Fix D1. Each row scans in one glance. |
| Allergens | Footnote | Link to the allergen matrix (§4.7) | — |
| End | Book, Print, Back | `fp-next` strip | — |

### 4.5 Booking `/book/`
| Now | Change |
| --- | --- |
| A numbered list of rooms with status, address and an outline button per room | Make it the full-page version of the booking drawer: pick the date, time and party size once at the top, then every room shows its availability link already filled in. Each row gets a small room photo. Party-size rules sit inline ("Soho books online up to 7"). Keeps the no-JavaScript fallback. |

### 4.6 Groups `/private-dining/`
| Now | Change |
| --- | --- |
| What's possible plus the enquiry form; no photos; form two screens down on phones | Hero photo of a set table. "Spaces" cards per room (photo, seated/standing capacity, minimum spend if any; new #47). The set menu with price (#2) and a downloadable PDF. Two to three occasion examples (birthdays, team dinners). The form gets a "Send an enquiry" jump link on phones and is split into two steps (when/how many → who). A testimonial. |

### 4.7 Information pages (`/allergens/`, `/privacy/`, `/accessibility/`, `/booking-terms/`)
| Change |
| --- |
| Keep the document desk. Add "Last updated" (#27) and a print style. |
| **Allergens:** a 14-allergen matrix per dish (UK FSA list), filterable, from the menu data (new #48: the client confirms each dish). This is the most useful premium-and-trust feature for a menu with this many diets. |
| **Accessibility:** add the physical access facts per restaurant (#26), with photos of the entrance. |

### 4.8 404
Keep. The tag already does its job.

---

## 5. What a premium restaurant site should have: gap list

| Feature | Have now? | Plan | Needs from client |
| --- | --- | --- | --- |
| Professional photography and hero film | Covent Garden only | §3.1 | Shoot (#35, #36, #46) |
| Booking with live availability | Hand-off to provider, prefilled | Prefilled desk (§4.5); embed the provider's widget only if the client prefers it | #6, #7 |
| Menus as web pages, plus PDF downloads | Web pages | Add PDFs generated from the same data | — |
| Allergen matrix | No | §4.7 | #48 |
| Signature dishes / what to order | One per branch | §4.2 "What to order" | #36 |
| Reviews, press, awards | Rating only | §3.6 | #28, #29 |
| Story / about page | Home only ("Our story" links to home) | `/story/`: Tangra, the families, the founders, the chef, with archive photos | New #49 |
| Chef and team | No | A section on `/story/` and a "From the kitchen" block | #49 |
| Private dining with spaces and capacities | Text and form | §4.6 | #2, #47 |
| Gift vouchers | Hidden | Footer and page once a provider exists | #4 |
| Newsletter | Hidden | Footer and closing screen | #37 |
| Events / what's on | No | Optional `/whats-on/` from a sheet, like Tonight's board | New #51 |
| Careers | No | Optional `/join-us/`, one page linking out | New #51 |
| Contact and FAQ | Spread across pages | `/contact/`: per-room phone/email, FAQ (dress code, children, dogs, accessibility, corkage, service charge) with FAQ structured data | New #51 |
| Delivery and pickup | Deliveroo / Uber Eats links | Add pickup ordering (#3) | #3 |
| Structured data | Restaurant (done) | Add Menu/MenuItem and FAQ | — |
| Analytics | Planned (Plausible) | Booking and menu events | #38 |
| Speed | 96–99, home 74–78 | D2 | — |
| Accessibility | WCAG 2.2 AA in automated checks | Plus a real screen-reader pass and real devices | — |
| Languages | English | Arabic for Dubai at opening | #50 |

---

## 6. Order of work

| Step | Scope | Depends on | Size |
| --- | --- | --- | --- |
| 7.0 | Defects D1–D5 | — | S–M |
| 7.1 | Type to two voices; navigation; footer; progress rail; page-end strip; no orphan bands (§3.2–3.9) | Client OK on retiring heavy capitals headlines (also touches approved home) | M |
| 7.2 | Photo components and placeholders from existing approved photos (§3.1); "What to order"; branch Menus as two groups; proof block with the rating | — | M |
| 7.3 | Menus page row design, PDFs, D1 test | — | M |
| 7.4 | Booking desk with date/time/party; groups page rebuild (minus missing content) | #2, #47 for full version | M |
| 7.5 | Dubai simplification | #5, #10 for the form | S |
| 7.6 | New pages: Story, Contact/FAQ; allergen matrix | #48, #49, #51 | L |
| 7.7 | Photography swap-in after the shoot; hero films; Soho walk with photos | Shoot | M |
| 7.8 | Home revisions (§4.1) | Client sign-off on the approved home | M |
| 7.9 | Launch pass: banner off, samples off, real devices, screen reader, Safari/Firefox, performance budget on every route | All | M |

Each step finishes with the same verification as Phase 6:
- type check and build gates
- overflow, CLS and axe at 6 widths plus calm mode
- scripted interactions
- Lighthouse budget on every touched route
- before/after screenshots reviewed at 390 and 1440

Plus a new check: **no more than 2 surface changes per screen and no empty band over 160px**, measured by script.

---

## 7. Questions for the client
New items added to `docs/CLIENT-INPUTS.md` as #46–#52, besides the existing #2, #4, #5, #10, #20, #26–#29, #31, #32, #35–#38:

1. **#46** Approve a photo shoot (list in §3.1) or supply existing professional photos.
2. **#47** Private dining: spaces, seated and standing capacities, minimum spend, photos.
3. **#48** Allergen matrix: confirm the 14 allergens per dish.
4. **#49** Story: founders' and chef's names, bios, portraits, and any archive photos of Tangra.
5. **#50** Dubai: Arabic version at opening?
6. **#51** Which of these pages are wanted: events / what's on, careers, contact with FAQ (and the FAQ answers: dress code, children, dogs, corkage, service charge).
7. **#52** Sign-off on changing the approved home (§4.1) and retiring heavy capitals as headlines (§3.2).
