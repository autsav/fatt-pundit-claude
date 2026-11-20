# What we need from Fatt Pundit

The one list of everything to ask the client. Add new questions here as they come up; when one is answered, move it to "Answered" with the date and where it was used.
Last updated: 20 Nov 2026.

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
| 13 | Tick the right price for each dish and drink: live site vs brand guidelines PDF (17 food rows, 10 drink rows) | Every menu | L |
| 14 | Are Covent Garden's menus and prices the same as Soho's? (Soho has a pescatarian menu; does Covent Garden?) | Covent Garden menus page | L |
| 15 | Bing bread: "buttery", yet on the vegan and dairy-free menus. Which is right? | Diet tags | L |
| 16 | Stir-fry Szechuan noodles on the vegan menu: veg option only, or all? | Diet tags | L |
| 17 | Spelling: "Lollypop" or "Lollipop"; "chilly" or "chilli" | All menus | M |
| 18 | Add "Anti-foaming agent E900" to every menu's allergen line? | Allergen notes | M |
| 19 | Is The Scholar and the Priest still on the drinks list? | The bar scene names it | M |
| 20 | Spice level per dish | A spice filter on the menu pages | N |
| 21 | Tonight's specials: the Google Sheet link (CSV) | Tonight's board shows sample rows until set; must not launch with samples | L |

### Words, legal and access
| # | Need | Why / where it's used | Pri |
| --- | --- | --- | --- |
| 22 | House term: "Chinese-Indian" or "Indo-Chinese" | Titles and copy (mixed today) | M |
| 23 | Map label: Kolkata, Calcutta or "Kalkata" (guidelines map) | Voyage map | M |
| 24 | Allergen page wording sign-off | `/allergens/` (draft) | L |
| 25 | Privacy: data controller name, address and contact | `/privacy/` (draft) | L |
| 26 | Step-free access and accessible toilets, per restaurant | `/accessibility/`, Good to know | L |
| 27 | "Last updated" dates for the legal pages | Info pages | M |
| 28 | Exact Soho Google review count (shows "16k"; site says "16,000+") | Home rating line | N |
| 29 | Press quotes or awards that can be named with a source | One line on branch pages | N |
| 30 | Show the food hygiene rating? | Branch pages | N |

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
| 20 Nov 2026 | Phase 4 UX decisions D1–D5 approved | `docs/redesign/phase4/ux-structure.md` |
