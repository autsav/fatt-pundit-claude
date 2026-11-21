# What we need from Fatt Pundit

The one list of everything to ask the client. Add new questions here as they come up; when one is answered, move it to "Answered" with the date and where it was used.
Last updated: 21 Nov 2026 (#53–#54 from the Phase 7 build; #46–#52 from the Phase 7 premium plan; #45: Soho walk caption).

Priority: **L** = blocks launch · **H** = needed for a Phase 4 slice · **M** = improves the site · **N** = nice to have.

## Open

### Booking, groups and orders
| # | Need | Why / where it's used | Pri |
| --- | --- | --- | --- |
| 1 | Late-arrival hold time (how long a table is kept) | `/booking-terms/` (still marked draft) | L |
| 2 | Set-menu price per person (groups of 8+ dine from it) | Set menu, groups page, booking terms; data warns "no set price yet" | H |
| 3 | Pickup ordering link (Google shows "Order online"), and whether Covent Garden takes pickup too | "At home" row on branch pages; redirect for the old `/soho/food-pickup/` | H |
| 4 | Gift vouchers: provider and link, or "we don't sell them online" | Footer link and the old `/soho/monetary-voucher/` URL (both hidden or redirected until then) | H |
| 5 | Which form-to-email service to use, and who owns the account | Group enquiry form and Dubai list must send to email with a confirmation | H |
| 6 | Covent Garden booking system: SevenRooms or ResDiary? (old home page linked ResDiary, old reserve page used SevenRooms) | Book drawer deep links | L |
| 7 | Check our pre-filled booking links work with OpenTable and SevenRooms (date, time, party size) | Book drawer | L |
| 8 | Update the Google Business Profile "Reserve" link and the Instagram bio to `/book/?branch=…` after launch | Old reserve links and new booking desk | M |
| 9 | Search Console access, to find any other old URLs still in Google | Redirect plan | M |
| 40 | Confirm online party limits: Soho online up to 7 (8+ set menu, inferred), Covent Garden online up to 4 and call for 5–7 (from its old note) | `branches.json` `groups`; drawer, Index, booking desk | H |
| 42 | Dish names "Kolkata chilli duck" and "Kolkata chilly chicken": keep (menu names) or change to Calcutta? | Menus, plate wall | M |
| 43 | The guidelines map art (menu back page) may carry its own printed labels ("Kalkata"): fine as artwork, or supply a version reading Calcutta? | Menu book back page, voyage | N |
| 41 | The form service's domain once chosen (#5), for the security policy | `vercel.json` / `_headers` `connect-src` | L |

### Dubai
| # | Need | Why / where it's used | Pri |
| --- | --- | --- | --- |
| 10 | Verified Dubai email address | The Dubai list stays off until it works | H |
| 11 | Opening date, hours, phone | Dubai page facts row, status, footer | M |
| 12 | Menu, AED prices, alcohol and halal status | Dubai menus page (appears by itself when data exists) | M |

### Menus and prices (details in `docs/content-discrepancies.md`)
| # | Need | Why / where it's used | Pri |
| --- | --- | --- | --- |
| 14 | Are Covent Garden's menus and prices the same as Soho's? (Soho has a pescatarian menu; does Covent Garden?) | Covent Garden menus page | L |
| 15 | Bing bread: "buttery", yet on the vegan and dairy-free menus. Which is right? | Diet tags | L |
| 16 | Stir-fry Szechuan noodles on the vegan menu: veg option only, or all? | Diet tags | L |
| 17 | Spelling "chilly" or "chilli" (the printed menu mixes both; "Lollipop" settled by the printed menu) | All menus | M |
| 18 | Add "Anti-foaming agent E900" to the dietary, set and pre-theatre menus too? (now on à la carte, as printed) | Allergen notes | M |
| 20 | Spice level per dish | A spice filter on the menu pages | N |
| 21 | Tonight's specials: the Google Sheet link (CSV) | Tonight's board shows sample rows until set; must not launch with samples | L |

### Words, legal and access
| # | Need | Why / where it's used | Pri |
| --- | --- | --- | --- |
| 22 | House term: "Chinese-Indian" or "Indo-Chinese" | Titles and copy (mixed today) | M |
| 24 | Allergen page wording sign-off | `/allergens/` (draft) | L |
| 25 | Privacy: data controller name, address and contact | `/privacy/` (draft) | L |
| 26 | Step-free access and accessible toilets, per restaurant | `/accessibility/`, Good to know | L |
| 27 | "Last updated" dates for the legal pages | Info pages | M |
| 28 | Exact Soho Google review count (shows "16k"; site says "16,000+") | Home rating line | N |
| 29 | Press quotes or awards that can be named with a source | One line on branch pages | N |
| 30 | Show the food hygiene rating? | Branch pages | N |
| 45 | Phase 6 wording (draft, new or changed): chapter labels on branch pages ("01 The room, since 2021 · 02 Born at … · 03 The menus · 04 Visit · 05 Good to know · 06 The other rooms"; Dubai "01 The list … 04 In London"); room headline = first brand line, the other two as one spoken line; Visit "Book at Soho", "Email us", "At home:" (was "Delivered:"); tag link "Plan a group" (was "Private dining and big tables"); signature "Marked V, VG on the menu."; groups page "Prefer to talk?"; booking desk "Booking terms, deposits and lateness: booking terms."; Soho walk caption "5 stops, from the door to the pass" (was "Walk the room, from the door to the pass") | Branch pages, `/private-dining/`, `/book/` (Phase 6) | M |

### Brand assets and photos
| # | Need | Why / where it's used | Pri |
| --- | --- | --- | --- |
| 31 | Buy the ITC American Typewriter web font licence (incl. Semi Bold), or approve the Kameron fallback | Whole site; current files have no web licence | L |
| 32 | Logo SVGs from the B3 branding pack | Replace PNG placeholders | L |
| 33 | Permission to use the guidelines map art at web size | Voyage and menu art | L |
| 34 | Confirm the map coordinates for Soho and Covent Garden | Structured data, maps | M |
| 35 | Soho photos (room, street front, ideally at night) | Soho has none; see `docs/SHOT-LIST.md` | H |
| 36 | Photos of the signature dishes: kid goat momo, popcorn cauliflower, paneer lettuce cups, monkfish, prawns | Menu book, born-here tickets | M |
| 37 | Newsletter tool (form address) | Footer sign-up, hidden until set | N |
| 38 | Analytics domain for Plausible | Booking and menu tracking | M |
| 39 | Brand owner OK for real-object colours (blue-and-white plates, Westminster street sign) | Covent Garden plate wall, Soho hero | N |
| 46 | Approve a professional photo and short-film shoot (list in `docs/redesign/phase7/premium-plan.md` §3.1), or supply existing professional photos | Every page's first screen, branch rooms, What to order, groups (Phase 7) | H |

### Phase 7 (premium plan)
| # | Need | Why / where it's used | Pri |
| --- | --- | --- | --- |
| 47 | Private dining: spaces per restaurant, seated and standing capacities, minimum spend (if any), photos | Groups page "Spaces" cards | M |
| 48 | Allergen matrix: the 14 UK allergens confirmed per dish | `/allergens/` matrix, menu rows | H |
| 49 | Story: founders' and chef's names, short bios, portraits; any archive photos of Tangra | New `/story/` page, "From the kitchen" block | M |
| 50 | Dubai: Arabic version and AED prices at opening? | Dubai page, menus | N |
| 51 | Which extra pages are wanted (events / what's on, careers, contact with FAQ), and the FAQ answers (dress code, children, dogs, corkage, service charge) | New pages, FAQ structured data | N |
| 52 | Sign-off to change the approved home page (Phase 7 §4.1) and to retire heavy capitals as headlines | Home, site-wide type | H |
| 53 | "What to order" on each branch page: which 4–6 dishes per room? We show the three à la carte dishes with approved photos (crackling spinach, mix vegetable momo, crispy okra) until the shoot | Branch pages "What to order" | M |
| 54 | Phase 7 wording (new): "Start with these." (What to order); rating line "4.8 / 5 on Google, from … reviews of Fatt Pundit … (November 2026)"; page-end lines "Hungry already? Book at Soho." / "Hungry before Dubai opens? Both London rooms are open tonight." / "Ready? Book at …" / "Read the menus first." / "Two rooms in London. Long banquettes at Covent Garden, the bar and the kitchen at Soho." / "Hungry yet? Two rooms in London, open tonight."; Dubai hero "Be first through the door. The list opens soon…"; booking desk "Choose a day, a time and how many of you…"; groups photo caption "Covent Garden, set for dinner."; menu tip button "Got it"; footer "Open until …" per room | Branch pages, Dubai, menus, booking desk, groups, info pages, footer | M |
| 55 | Phase 8 branch page (built, in the preview; docs/redesign/phase8/report.md): OK with 9 sections cut to 5? "Good to know" is gone (its facts moved into the menus and booking sections); the other rooms and the Google rating sit next to Book; sample "Tonight" lines no longer show; no section numbers, badge or London clock in the hero; Soho's hero is the momo photo with the Berwick Street sign until a Soho room photo arrives (#35, #46). New wording: "What to eat at Soho." / "What to eat at Covent Garden.", "Our other rooms", "Pre-theatre: seated 5–5.45pm.", "Dairy free and halal.", Soho story shortened to "On Berwick Street since 2019, folded by hand.", Dubai "Before then, in London. Two rooms in London while you wait." | Branch pages (Soho, Covent Garden, Dubai) | H |

## Answered
| Date | Answer | Used in |
| --- | --- | --- |
| 20 Nov 2026 | Covent Garden opens at 4.45pm | `branches.json` (Tue–Fri 16:45), hours test |
| 20 Nov 2026 | Pre-theatre seating: Soho 5–5.45pm, Covent Garden 4.45–5.30pm | Phase 4 slice 4.9 |
| 20 Nov 2026 | Deposit £10 a person for 4 or more, both restaurants; off the bill, or refunded in full if cancelled at least 24 hours before | `branches.json` `groups`; booking terms, home, drawer note, groups page |
| 20 Nov 2026 | Groups of 8 or more dine from the set menu, both restaurants | Book drawer switches to the group enquiry at 8; groups page |
| 20 Nov 2026 | Capacity is answered by phone, not printed | Groups page plan |
| 20 Nov 2026 | Enquiries are answered as soon as possible | "Enquiry sent" message |
| 20 Nov 2026 | Group enquiries and the Dubai list go by email | Phase 4 slices 4.6, 4.7 |
| 20 Nov 2026 | Google ratings: Covent Garden 4.8 (20,030 reviews), Soho 4.8 ("16k") | Home rating line |
| 20 Nov 2026 | They take pickup orders | "At home" row shows Pickup as soon as `clickAndCollectUrl` is filled in (#3) |
| 20 Nov 2026 | Pre-theatre seating times | `branches.json` `preTheatre`: menu page, branch menu list, drawer hint |
| 20 Nov 2026 | Guangdong (not Canton) and Calcutta (not Kolkata) everywhere a guest reads; closes #23 | All copy, map labels, alt text, meta, share images |
| 20 Nov 2026 | Phase 4 UX decisions D1–D5 approved | `docs/redesign/phase4/ux-structure.md` |
| 20 Nov 2026 | Home page wording approved: chapter names "01 Our story · 02 The menus · 03 The bar · 04 The room · 05 Your table"; menus labels "Open the book for" / "Or read them as a list"; closes #44 | Home (Phase 5) |
| 20 Nov 2026 | Printed menus (photos in `docs/reference/menu-2026-11/`): every à la carte price matches the site; drinks list updated to match (Scholar and the Priest, Birds Eye Margarita, Lunch Box, Gavi, saffron masala tea added; Desi Dragon and Akluj removed; Chin Chin Choo £13.50 rum recipe; Negroni £14; Hakka Garden Cuban rum). Closes #13 and #19 | `dishes.json`, `menus.json`, home bar card |
| 20 Nov 2026 | "Lollipop chicken" spelling; E900 on the à la carte allergen line (both as printed) | `dishes.json`, `menus.json` |
