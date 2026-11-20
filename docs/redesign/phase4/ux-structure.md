# Phase 4 — UX structure, navigation and content

**Status: approved and built, 20 Nov 2026 (slices 4.1–4.9, results in `tasks/todo.md`).** The group form and the Dubai list switch to their real states once a form service is set (`HANDOVER.md`, `PUBLIC_FORM_ENDPOINT`, `PUBLIC_DUBAI_LIST_ENDPOINT`).
Companion: `wireframes.html` in this folder (sitemap, navigation model, journey diagrams, wireframes, each with a text equivalent). Screenshots: `shots/`.
Inputs: the live code on `redesign/world-class` (3f71b5a), `comprehensive-audit.md`, `phase2/creative-direction.md` (approved: *objects for moments, ledger for facts*), `phase3/design-system.md` (approved components), `docs/redirects.csv`, `docs/content-discrepancies.md`.

Draft wording is marked *(draft)*. Facts (hours, addresses, menus, limits) come from `src/data/*.json`, never from copy.

---

## 1. Analysis

### 1.1 Goals
| | Goal | How we know (today) |
| --- | --- | --- |
| **Primary** | A table booked at Soho (OpenTable) or Covent Garden (SevenRooms) | `fp:booking-click` event from the Book drawer (Plausible, when switched on) |
| Secondary | Menu read, including dietary menus and allergen policy | page views of `/<branch>/menu/` |
| Secondary | A call or a route to the door | not tracked: add events on `tel:` and Maps links |
| Secondary | A group enquiry (highest value per booking) | none: the form is `mailto:` (audit C23) |
| Secondary | A Dubai waitlist sign-up | none: the form is demo-only (audit C02) |
| Support | Brand recall (the Canton → Kolkata → London → Dubai story), vouchers, delivery, newsletter | — |

### 1.2 Audiences and their first need
| Audience | Usual way in | Needs first | Done when |
| --- | --- | --- | --- |
| **Tonight decider** (phone, in the West End) | Google or Maps → branch page | Open now? Where? Book or call | Booked or called within 3 taps |
| Planner (date night, friends) | Search or Instagram → home | Menu, the room, a date | Booking for a future date |
| Dietary or allergy guest (often booking for others) | Branch or menu page | Filters, dietary menus, allergen policy | Finds dishes, books with a note |
| Pre-theatre diner | Search → Covent Garden | Pre-theatre menu, early times, location | Early booking. *Gap: pre-theatre serving times are not in the data* |
| Group organiser | Home, branch, or the drawer's group message | Online limit, deposit, set menu, enquiry | Enquiry sent with date, numbers, branch |
| Dubai local | Instagram or press → `/dubai/` | When, where, what | On the list |
| Fan or gift buyer | Footer, search | Vouchers, delivery, news | Leaves to the right provider |

### 1.3 Current structure (as built)
16 public pages: `/`, `/soho/`, `/covent-garden/`, `/dubai/`, `/soho/menu/`, `/covent-garden/menu/`, `/private-dining/`, `/allergens/`, `/booking-terms/`, `/accessibility/`, `/privacy/`, 404 (plus `/og/*`, `sitemap.xml`, `robots.txt`; `/styleguide/` in preview builds only).

| Page type | Header (≥ 1100) | Phone dock | Book goes to |
| --- | --- | --- | --- |
| Home | Menus (#menu) · Our story · Soho · Covent Garden · Dubai · Book a table | Menus · Rooms · Book | Drawer, guest picks the room |
| Branch | Soho · Covent Garden · Dubai · Book at X | Menus · Call · Book | Drawer for that room |
| Menu list | *same as home, links to `/#menu`* | Menus (**→ home**) · Rooms · Book | Drawer, guest picks again |
| Info pages, groups | same as home | Menus (→ home) · Rooms · Book | Drawer, guest picks |

Home order: intro → rain hero (gate board, Book) → doors → voyage → menu book → list-menu links → bar → the room (rating) → boarding passes → footer with receipt.
Branch order: arrival (Book, Call, Directions) → visit strip (hours, address, Call, Directions, Book) → [Dubai: waitlist] → Tonight's board → the room → born here → menu book → list link → visit (address, maps, phone, email, hours, groups, delivery) → good to know → other rooms → footer with receipt.

### 1.4 Findings
| # | Finding | Evidence | Effect |
| --- | --- | --- | --- |
| F1 | The menu page has no branch context. Its dock's "Menus" leaves for the home page, there is no Call, and Book asks "Where" again | `InfoPage.astro:25` renders `SiteHeader` without `current`; `SiteHeader.astro:33` | The busiest task page sends people away and re-asks a question |
| F2 | The header changes by page type. Branch pages drop Menus and Our story; Groups is in no desktop header | `SiteHeader.astro:40-50`; Groups only in the Index (`:31`) and footer | Desktop guests on a branch page have no header route to its menu or to groups (WCAG 3.2.3 asks for consistent navigation) |
| F3 | Dubai's dock "Menus" points at `#menu`, which Dubai doesn't render | `SiteHeader.astro:33`, `[branch]/index.astro:267` | Dead control on the page whose only job is the list |
| F4 | The group limit has four answers: "nine or more" (Index), "five or more, call" for both rooms (home), 8 vs 4 online (drawer), minimum 5 (enquiry form) | `SiteHeader.astro:31`, `index.astro:195`, `BookDrawer.astro:17,28`, `private-dining.astro:22` | Organisers get contradictory instructions |
| F5 | Footer "Gift vouchers" falls back to the boarding passes | `SiteFooter.astro:15,50` (`vouchersUrl` is null) | The label promises something the link doesn't do |
| F6 | The redirect plan is not live: 4 rules in `redirects.csv`, none in `vercel.json`; 3 targets (`/book/`, `/gift-vouchers/`, `/soho/click-and-collect/`) don't exist | `vercel.json`, `docs/redirects.csv` | Old "Reserve a table" links (likely in Google and Instagram profiles) 404 at launch |
| F7 | Branch contact facts appear four times; arrival and visit strip sit back to back, both with a tiger Book | `[branch]/index.astro:168-181`, `VisitStrip.astro:34-39` | Two primaries in one view; length without new information |
| F8 | Two menu formats. The list (searchable, filterable, accessible) is reached by small text links; the page-flip book leads | `index.astro:165`, `[branch]/index.astro:268` | The task route is the weaker route. The approved branch mock (§9) already lists menus as a numbered ledger |
| F9 | The menu page stacks 9–10 menus: 38–44 phone screens | audit O04 | Long scroll; filters and jump row only partly help |
| F10 | Section headings are brand lines only: "Before you travel.", "Onward travel.", a street name | `[branch]/index.astro:275,309,338` | A screen reader's heading list doesn't say what each section holds |
| F11 | Forms have no real outcome: enquiry opens a mail app (no confirmation, no record); waitlists discard the email; browser validation bubbles | audit C02, C23 | Highest-value leads are lost or unconfirmed |
| F12 | The drawer closes the moment it hands off | `BookDrawer.astro:245-248` | No confirmation that a tab opened, no retry if it opened behind |
| F13 | The goodbye receipt repeats the footer's hours and addresses on every page | audit O09 | Length, especially on info and menu pages |
| F14 | Trust: rating claim is unverified; legal pages are drafts; the arrival's Directions link doesn't announce its new tab | audit C22; `[branch]/index.astro:175` | Credibility and consumer-law risk |

What already works and stays: Book in the first screen everywhere, the 3-tap drawer, live open/closed status in the branch's time zone, facts before story on branch pages, the phone dock, calm mode and Pause motion, providers named at the point of booking, allergen policy on every menu.

---

## 2. Sitemap (deliverable 1)

```
fattpundit.co.uk
├── /                          Home: the story, then choose a room            kept
├── /soho/                     Soho                                           kept, reordered
│   └── /soho/menu/            Soho menus (#a-la-carte … #drinks)             kept, one menu at a time
├── /covent-garden/            Covent Garden                                  kept, reordered
│   └── /covent-garden/menu/   Covent Garden menus                            kept, one menu at a time
├── /dubai/                    Dubai, opening soon: the list                  kept
│   └── /dubai/menu/           appears by itself when Dubai has menus         automatic (pages.ts)
├── /book/                     Book a table: the booking desk                 NEW (decision D1)
├── /private-dining/           Groups and private dining                      kept, real form
├── /gift-vouchers/            only if the client names a provider            conditional (D7)
├── /allergens/  /booking-terms/  /accessibility/  /privacy/                  kept, document pattern
└── 404                        Lost luggage                                   kept, more routes
Not in navigation: /sitemap.xml, /robots.txt, /og/*, /styleguide/ (preview only)
```

- Two levels, never more. Everything a guest **does** lives under the branch URL; the story lives on home.
- From any page: any branch, its menus and the Book drawer are at most 2 taps away.
- `/book/` earns its place: it is the target of the old "Reserve" URLs (F6), the no-JavaScript and open-in-new-tab target of every Book button, and the one link to put in Google Business Profile and Instagram bios.
- No `/menus/` hub: the two-row chooser in the header (§3) does that job without a page.

---

## 3. Navigation model (deliverable 2)

**Rule 1: the same items, in the same order, on every page. Context changes where they go, not what they are.**
**Rule 2: a page belongs to a branch when its URL starts with `/<branch>/` (this includes the menu page).** Then Book, Call and Menus target that branch and the branch link carries `aria-current="page"`.

### Header
| Width | Items |
| --- | --- |
| ≥ 1100 | Wordmark · Soho · Covent Garden · Dubai · Menus ▾ · Groups · **Book** |
| 640–1099 | Wordmark · Index · **Book** (short labels, as today) |
| < 640 | Wordmark · Index; the dock holds the actions |

- **Book**: "Book at Soho" in context, "Book a table" elsewhere, "Join the list" on Dubai. Opens the drawer. Without JavaScript, or with Ctrl/Cmd-click: `/book/?branch=<id>` (or the provider URL if D1 is declined).
- **Menus ▾**: a disclosure button (`aria-expanded`, Escape closes, focus stays on the button) showing two links: "Soho menus, 77 Berwick Street" and "Covent Garden menus, 6 Maiden Lane"; the current or last-viewed room first. Plain links, not `role="menu"`. Without JavaScript it is a link to `#footer-menus`.
- **Groups** → `/private-dining/` (full name "Groups and private dining" in the Index and footer).
- **Our story** leaves the bar (D5): the home page *is* the story, the wordmark leads there, and the chapter rail covers it on home. It stays in the Index and footer.
- The bar's breakpoints are re-measured from content in slice 4.1 (design-system §4 rule); if the six items don't fit at 1100, the Index takes over sooner.

### Index sheet (phones and tablets): a numbered ledger
| No. | Row | Sub-actions |
| --- | --- | --- |
| 01 | **Soho**, 77 Berwick Street, open/closed now | Menus · Book |
| 02 | **Covent Garden**, 6 Maiden Lane, open/closed now | Menus · Book |
| 03 | **Dubai**, opening soon | Join the list |
| 04 | **Groups and private dining**, "online up to 7 at Soho, 4 at Covent Garden" *(from data, D6)* | — |
| 05 | **Our story** | — |
| 06 | **Allergens and dietary needs** | — |

The name is the row's link; sub-actions are separate 44 px links. Without JavaScript the Index button is a link to `#site-index` (the footer navigation).

### Dock (< 640): three slots at most
| Context | 1 | 2 | 3 |
| --- | --- | --- | --- |
| Open branch, and its menu page | Menus → `/<b>/menu/` | Call | **Book** (drawer, preset) |
| Opening-soon branch | Rooms (Index) | — | **Join the list** (focuses the email field) |
| Everywhere else | Menus (two-row chooser sheet) | Rooms (Index) | **Book** (drawer, guest picks) |

Unchanged: it hides when the footer is in view and never covers the last lines.

### Footer
Design-system footer pattern, plus: each branch block gains a "Menus" link (`id="footer-menus"` on the group); the nav is `id="site-index"`; "Gift vouchers" appears only when a voucher URL exists (F5); the goodbye receipt shows on home only, as the end of the story (F13).

### Wayfinding
- `aria-current="page"` on the branch link (header, Index, dock never needs it).
- Breadcrumb on second-level pages only: `Soho › Menus` (`<nav aria-label="Breadcrumb">`).
- Section headings start with plain words (F10): "Good to know: before you travel.", "The other rooms: onward travel.", "Visit: 77 Berwick Street". The visible rail label can stay as it is; the heading carries the plain words (visible or `sr-only` prefix).

---

## 4. Journeys (deliverable 3)

Diagrams with every branch are in `wireframes.html` §3. Tap counts are counted from the flows on our site (provider steps excluded), not measured with guests.

| # | Journey | Today | Proposed | Taps today → proposed |
| --- | --- | --- | --- | --- |
| J1 | **Book tonight** (phone, Google → `/soho/`) | Book → drawer (today, 2, first time after 7pm) → Find a table → drawer closes | Same path; the visit strip no longer repeats Book; the drawer stays open with a done state and a retry link | 2 → 2, with confirmation |
| J2 | **Check the menu for a diet** (phone, from `/covent-garden/`) | Dock Menus → 10 menus stacked (38–44 screens) → Jump to / Show only → header Book asks "Where" | Dock Menus → À la carte only → Show only VG (count announced, "there's also a full Vegan menu") or Menu ▾ Vegan → Book (preset) → Find a table | 6 + long scroll → 4–5 |
| J3 | **Plan a group of 12** (desktop) | Drawer → + ten times → message → `/private-dining/` → retype room, date, guests → mail app (or nothing) | Header Groups, or drawer → type 12 → "Send a group enquiry" carries room, date, guests → add name, email, occasion → Sent panel + email receipt | about 17 → about 6, three fields not retyped |
| J4 | **Find the door** (phone, on the street) | Arrival Directions → Maps | Facts row: address, station, Directions, Call | 1 → 1 |
| J5 | **Join the Dubai list** (phone, from Instagram) | Join the list → scroll → email → "Demo only: nothing was sent" | Join the list moves focus into the field → email → Join → "You're on the list" | 3 → 2, and it works |
| J6 | **Old "Reserve" link** | 404 | 301 → `/book/?branch=soho` → drawer opens for Soho (no JS: Soho row first) | dead end → 1 |
| J7 | **Story first, then book** (desktop, first visit) | Home story → passes → tear stub → provider | Unchanged; Book stays in the header throughout | 1 → 1 |

Failure paths designed into J1–J3 and J5 (details in §7): closed that day, last booking passed, party above the online limit, pop-up blocked, provider tab opened behind, no JavaScript, network failure, invalid email.

---

## 5. Page-by-page content hierarchy (deliverable 4)

Heading levels are real; **one tiger action per view**. "Object" = one of the six approved object types; "ledger" = facts set as rows.

### Home `/`
| # | Section (id) | Heading | Content | Actions | Change |
| --- | --- | --- | --- | --- | --- |
| 0 | Intro | — | Board → stamp, once per device, skippable | Skip | none |
| 1 | Hero `#top` | h1 Fatt Pundit | Spoken line; gate board (3 ledger rows, live status) | **Book a table**; rows → branch; "Or see the menus first" → `#menu` | none |
| 2 | Doors + voyage `#story` | h2 Our story | Story scene (calm: still) | — | none |
| 3 | Menu book `#menu` | h2 The menus | Object: book | "Soho menus" · "Covent Garden menus" as secondary buttons (were a text line) | F8 |
| 4 | Bar `#bar` | h2 | Object: apron | — | none |
| 5 | The room `#room` | h2 Pull up a chair | Object: contact sheet; rating **only with a source and date** (D8) | — | C22 |
| 6 | Your table `#tables` | h2 Choose your gate | Objects: 3 passes | Stubs: Book at Soho / Book at Covent Garden / Join the list; group line from data → `/private-dining/` | F4 |
| 7 | Footer | — | Receipt (home only), branch ledger, nav, legal, Pause motion | Book per branch | F5, F13 |

### Branch, open `/soho/`, `/covent-garden/`
| # | Section | Heading | Content | Actions | Change |
| --- | --- | --- | --- | --- | --- |
| 1 | Arrival (night) | h1 Fatt Pundit Covent Garden (board is decorative) | One spoken line; status badge "Open until 10.30pm" | **Book a table** · See the menus | Call, Directions move to row 2 (F7) |
| 2 | Facts row | — (part of arrival) | Ledger: Today's hours · Address + Directions · Nearest stations · Phone + Call | Directions, Call (strong links) | No second Book (F7) |
| 3 | Tonight's board | h2 Tonight | Object: board (only when specials exist) | — | none |
| 4 | The room | h2 The room: *brand lines* | Object: photo / lights on + plate wall / walk the room | — | heading prefix |
| 5 | Born here | h2 Born here: *dish* | Object: ticket; story line | "Find it on the menu" → `/<b>/menu/#<menu>` | link added |
| 6 | Menus | h2 Menus | Object: photo print; **numbered ledger of this room's menus** → `/<b>/menu/#id` | — | replaces the page-flip book (approved mock §9) |
| 7 | Visit (night) `#visit` | h2 Visit: 6 Maiden Lane | Object: boarding pass with Book; 7-day hours table (today marked); Google / Apple Maps, phone, email; "At home" row `#at-home` (Soho: Deliveroo, Uber Eats) | Pass stub Book | groups line moves to 8 |
| 8 | Good to know | h2 Good to know: before you travel. | Objects: 3 luggage tags (Dietary menus, Allergies, Groups with the limit from data) | links | heading |
| 9 | Other rooms | h2 The other rooms: onward travel. | Objects: 2 postcards | — | heading |
| 10 | Footer | — | No receipt | — | F13 |

### Branch, opening soon `/dubai/`
| # | Section | Heading | Content | Actions |
| --- | --- | --- | --- | --- |
| 1 | Arrival | h1 Fatt Pundit Dubai | "Opening soon at The Hangout, Mall of the Emirates"; badge "Opening soon" | **Join the list** (focus to field) |
| 2 | Facts row | — | Where · Opening: date to be announced · Hours: with the opening date · Station: Mall of the Emirates (Red Line) | — |
| 3 | The list `#waitlist` | h2 Be first through the door | Email field, consent line, states (§7) | **Join the list** |
| 4 | Packing | h2 What we're packing for Dubai | Objects: 3 tickets | — |
| 5 | London | h2 In London before then? *(draft)* | Objects: 2 postcards | — |
| Removed | Visit section with empty hours; dock "Menus" (F3) | | | |

### Menus `/<branch>/menu/`
| # | Part | Content | Change |
| --- | --- | --- | --- |
| 1 | Breadcrumb | Soho › Menus | new |
| 2 | Head | kicker Fatt Pundit Soho · **h1 Soho menus** · one line: allergens and "Show only" explained *(draft)* · link "Covent Garden menus" | h1 was "The menu" |
| 3 | Tools (sticky on phones) | Phone: "Menu: À la carte ▾" (opens the menu list as a sheet). ≥ 1024: sticky left index (as built). Search "Search all menus". Show only: V · VG · GF · DF · H. Live count | one menu at a time (D2) |
| 4 | The menu | h2 menu name → h3 sections → ledger rows: name, diet codes (with words for screen readers), price right-aligned; description | shows one menu; `#hash` picks it; no JS = all menus, as now |
| 5 | Notes | Allergy note → `/allergens/`; when a diet filter is on and a matching dietary menu exists: "There's also a full Vegan menu" | new link |
| 6 | Shortlist | Dish passport (as built) | none |
| 7 | Foot | **Book at Soho** · Print this menu · Back to Soho | Book preset (F1) |

Search covers every menu and groups matches under each menu's name ("12 dishes in 4 menus").

### Book a table `/book/` (new, D1)
h1 Book a table · spoken line *(draft)* "Pick a room; its booking page opens with your choices filled in." · Ledger rows: Soho (status now, OpenTable, Book at Soho, Call) · Covent Garden (same, SevenRooms) · Dubai (Opening soon, Join the list) · Groups ("8 or more at Soho: set menu", Plan a group). With `?branch=` and JavaScript, the drawer opens preset over the page; closing it leaves the guest on the desk. The two room rows are equal choices, so they use secondary buttons; no tiger on this page except inside the drawer.

### Groups and private dining `/private-dining/`
| # | Part | Content |
| --- | --- | --- |
| 1 | Head | kicker Bring everyone · h1 Groups and private dining · one paragraph (as today) |
| 2 | What's possible | Ledger per room: books online up to N · above that: this form or a call · deposit: £10 a person for 4 or more, taken off the bill or refunded · set menu (8 or more) → `/<b>/menu/#set-menu` · "Ask about space for your group: call the restaurant" (capacity is answered by phone, not printed). *Set-menu price: client content* |
| 3 | Form | `fp-form`: Restaurant (choice) · Date · Guests · Lunch or dinner (optional) · Name · Email · Phone (optional) · Occasion, dietary needs, anything else (optional). Pre-filled from `?branch=&date=&guests=` (from the drawer) |
| 4 | Outcome | States in §7. **Needs a real form endpoint (2.8a)** |
| 5 | Other ways | Call or email each room |

### Info pages (allergens, booking terms, accessibility, privacy)
Document pattern (`InfoPage`): h1 · "Last updated" date *(client)* · "In short" box with 2–4 points · contents list when there are more than 4 sections · h2 sections · "Questions?" ledger with each room's phone and email · one related link (allergens → both menu pages with "Show only"). Draft markers stay until the client confirms.

### 404
h1 Lost luggage · one line · ledger of destinations: Soho, Covent Garden, Dubai, Soho menus, Covent Garden menus, Book a table. No tiger: the header's Book is enough.

---

## 6. CTAs: placement and behaviour (deliverable 5)

### Hierarchy
| Tier | Look (design system) | Used for | Rule |
| --- | --- | --- | --- |
| Primary | `fp-btn--primary` (tiger) | Book · Join the list (Dubai) · Send enquiry · Find a table (drawer) | One per view. Never two tiger buttons on one screen |
| Secondary | `fp-btn` (outline) | See the menus · Google / Apple Maps · equal choices (the `/book/` rows) | Up to two beside a primary |
| Text | `fp-link--strong` | Call · Directions · Email · Print · Back | In ledgers and fine print |
| Persistent | header Book (≥ 640), dock (< 640) | Book, plus Menus and Call in the dock | Always reachable; the dock hides over the footer |

Choices between rooms (gate board, the three boarding passes, the `/book/` rows) are equal: none of them is tiger. The pass stubs keep the pass's own styling.

### Placement
| Page | Primary in view | Secondary | Persistent |
| --- | --- | --- | --- |
| Home | Hero: Book a table | gate rows, menus link, list-menu buttons, pass stubs (equal choices) | header Book / dock |
| Branch, open | Arrival: Book a table · Visit: pass stub | See the menus · Call · Directions | header Book at X / dock (Menus, Call, Book) |
| Branch, soon | Join the list (arrival, waitlist) | London postcards | dock Join the list |
| Menus | Foot: Book at X | Print · Back | header / dock, preset |
| Groups | Send enquiry | Call, Email | header / dock |
| `/book/` | — (equal choices) | Book at Soho · Book at Covent Garden | — |
| Info, 404 | — | inline links | header / dock |

### Behaviour
- **Book** opens the drawer (`fp-dialog--side`; bottom sheet on phones), focus on its title. **Find a table** opens the provider in a new tab (announced in the fine print and in hidden text) and **the drawer stays open in a done state** with the choices and a retry link (F12). Escape or Close returns focus to the opener.
- **Party size**: a stepper whose number can also be typed (1–20). Above the room's online limit, the submit button is **replaced** by "Send a group enquiry", which carries room, date and guests to `/private-dining/`; a Call link sits beside it.
- **Join the list** (Dubai) moves focus into the email field, so the keyboard opens at once.
- **Call**: `tel:`; the label includes the number ("Call 020 7836 8883"), so desktop users can read it.
- **Directions**: Google Maps; Apple Maps beside it in Visit; both announce the new tab.
- **Menus**: in context, the branch menu page; otherwise the two-row chooser.
- **Send enquiry**: real POST (2.8a). Loading and outcome per §7.

### Copy (meaning kept, brand voice kept)
| Where | Today | Proposed | Why |
| --- | --- | --- | --- |
| Menu page h1 | The menu | Soho menus | Says which room |
| Branch h2s | Before you travel. · Onward travel. · 77 Berwick Street | Good to know: before you travel. · The other rooms: onward travel. · Visit: 77 Berwick Street | Headings say what the section holds (F10) |
| Arrival actions | Book a table · Call 020… · Directions | Book a table · See the menus | Call and Directions live in the facts row (F7) |
| Home passes note | Five or more guests? Please call the restaurant. Larger bookings need a deposit. | Soho books online for up to 7, Covent Garden for up to 4. Tables of 4 or more pay a £10 a person deposit, taken off the bill or refunded. Bigger table? Plan a group: 8 or more at Soho dine from the set menu. *(numbers from data)* | Was true for one room only (F4) |
| Index note | Tables for nine or more | Bigger tables, set feasts, whole rooms | Was wrong for Covent Garden |
| Drawer, big party | For N or more, the restaurant plans your table with you: send a group enquiry or call … | For N or more, Covent Garden plans your table with you. [Send a group enquiry] or call 020 7836 8883 | The action carries the details |
| Drawer, done | (closes) | OpenTable is open in a new tab: 2 guests, Saturday 21 November, 7pm. Not there? Open OpenTable again | Confirms the hand-off |
| Dubai list, success | Thanks. (Demo only: nothing was sent.) | You're on the list. We'll email you@example.com when Dubai takes bookings. | Real outcome (after 2.8a) |
| Home list link | Read the menus as a list for Soho or Covent Garden | Buttons: Soho menus · Covent Garden menus | Task route as strong as the book (F8) |
| Footer | Gift vouchers → passes | hidden until a voucher URL exists | F5 |

### Guardrails (not manipulative)
No availability or scarcity claims (we have no availability data). No countdowns, pop-ups or exit prompts. No pre-ticked consent; the waitlist says exactly what it will send. Ratings and quotes only with a named source and date (C22). Motion never stands between a guest and a task (calm mode, Pause motion, skippable intro).

### Trust signals
Keep: real address, phone and live hours in the first screen; "since 2019 / 2021"; the booking provider named before the hand-off; allergen policy on every menu and in the footer. Fix: rating (source and date, or remove); legal pages out of draft (client). Ask the client: verifiable press quotes or awards (one line in "The room", never in the hero); food hygiene rating, if they want it shown.

---

## 7. States

| Component | Empty | Loading | Error | Success |
| --- | --- | --- | --- | --- |
| Open-now badge (`hours.ts`) | No hours: "Hours to be confirmed" · Dubai: "Opening soon" | Server-rendered from build; updates on the guest's clock | — | "Open until 10.30pm" / "Opens 5pm" / "Closed today, opens Tuesday 5pm": dot, ring or diamond **and** words |
| Book drawer | Day closed: "Covent Garden is closed on Mondays. Pick another day." Last booking passed: opens on the next open day and says so | None (no network) | Pop-up blocked: same tab (as built). Provider down: we can't detect it; the phone number is always in the fine print | Done state (§6) |
| Menu tools | "No dishes match 'lamb' with Vegan on." [Clear filters] [Search all menus] | — | — | Live count: "14 dishes" (`aria-live="polite"`) |
| Dish passport | "Tap a stamp beside a dish to add it." | — | Share unsupported → Copy | "Copied" (`data-state="done"`) |
| Tonight's board | No rows: section hidden (as built). **Sample rows must not ship (C26)** | Build-time rows show at once; the Sheet refreshes them | Sheet fails: keep build rows, say nothing | — |
| Dubai list | — | Button `aria-busy`, label kept, second press blocked | Invalid: "Enter an email address like name@example.com" (`aria-invalid`, message in `aria-describedby`, re-checked on input). Network: "We couldn't add you. Try again in a moment." (`role="alert"`, email kept) | Form replaced by "You're on the list…" (`role="status"`, focus moves to it) |
| Group enquiry | — | Same as above | On submit: error summary at the top (`role="alert"`), focus on the first bad field, messages say what to do. Network: everything kept; "We couldn't send this. Try again, or email reservations@fattpundit.co.uk" | Panel "Enquiry sent" with a summary and "We'll reply as soon as we can"; email receipt from the provider |
| Newsletter | Hidden until the client's tool is set (as built) | as above | as above | "You're on the list" |
| Images, video | Fixed aspect ratio, no layout shift | Lazy below the first screen | Video fails or calm mode: the still | — |
| No JavaScript | Index → footer nav; Menus ▾ → footer menus; Book → `/book/` or provider; menu page shows every menu | — | — | — |

Mechanics are the Phase 3 ones: `aria-busy` and `data-state="done"` on `.fp-btn`, `.fp-status` boxes, `.fp-field` error and success, errors re-checked on input never on blur (lesson 63).

---

## 8. URLs and redirects

Every current URL keeps working. Anchors kept: `#menu`, `#story`, `#bar`, `#room`, `#tables`, `#visit`, `#waitlist`, and each menu id. New anchors: `#at-home`, `#footer-menus`, `#site-index`.

| Old URL | Today | Proposed | Note |
| --- | --- | --- | --- |
| `/soho/reserve-a-table/` | 404 | `/book/?branch=soho` | D1; if declined, `/soho/` |
| `/covent-garden/reserve-a-table/` | 404 | `/book/?branch=covent-garden` | as above |
| `/soho/monetary-voucher/` | 404 | `/gift-vouchers/` if a provider exists, else `/soho/` | D7 |
| `/soho/food-pickup/` | 404 | `/soho/#at-home` | No pickup provider exists; the old page only linked Deliveroo and Uber Eats. `redirects.csv`'s `/soho/click-and-collect/` would itself 404 |
| `/soho`, `/covent-garden` (no slash) | not checked | the slashed URL | Set `"trailingSlash": true` in `vercel.json`; check on a preview deploy |

- Host is Vercel (`HANDOVER.md`): rules go in `vercel.json` `redirects` (note `"permanent": true` sends 308; use `"statusCode": 301` to match the CSV). Mirror them in `public/_redirects` if the `_headers` parity rule is kept. Update `docs/redirects.csv` to match.
- Before launch: check Search Console for other indexed old URLs (the crawl found 7); point the Google Business Profile "Reserve" link and the Instagram bio at `/book/?branch=…`.

---

## 9. How this reduces friction

1. **Context sticks** (F1, F2, F3). Once a guest is in a room's pages, every Book, Call and Menus means that room; nothing re-asks "Where?", nothing sends them home.
2. **One navigation, everywhere** (F2). Same six items in the same order; Groups becomes visible to the organisers it serves.
3. **The task route is the strong route** (F8, F9). Branch pages list their menus as a ledger straight into the list page; the list shows one menu at a time (from 38–44 phone screens to the length of one menu; to be measured in slice 4.4).
4. **One answer per question** (F4). The online limit lives in the data and is printed the same way in the drawer, Index, home, Good to know and the groups page.
5. **Fewer repeats, one primary per view** (F7, F13). The arrival offers Book and Menus; the facts row offers Directions and Call; the receipt ends only the home story.
6. **Hand-offs carry their data** (J3, F12). The drawer's choices travel to the enquiry form; the drawer confirms the provider tab and offers a retry.
7. **Every form ends in a clear outcome** (F11). Validation that says what to do, a busy state, a success that confirms what happens next, and a failure that keeps what was typed.
8. **No dead ends** (F5, F6). Old links land on the booking desk; links only appear when their destination exists; the 404 lists every task.
9. **Headings say what's there** (F10). Screen-reader and skim readers get plain words; the brand line stays.

---

## 10. Decisions

**Answered 20 Nov 2026.**

| # | Decision | Outcome |
| --- | --- | --- |
| D1 | Add `/book/` (booking desk; redirect and no-JS target) | **Approved** |
| D2 | Menu page shows one menu at a time (hash-driven, all menus without JS) | **Approved** |
| D3 | Branch pages replace the page-flip book with the numbered menu ledger (the book stays on home) | **Approved** |
| D4 | Goodbye receipt on home only | **Approved** |
| D5 | Header: add Menus ▾ and Groups; move Our story to the Index and footer | **Approved** |
| D6 | Group limit as a data field | **Answered:** at both rooms, 8 or more dine from the set menu (group path). Soho books online up to 7; Covent Garden up to 4 and asks guests to call for 5–7. **Done now:** drawer group threshold 9 → 8 (`BookDrawer.astro`) |
| D7 | Gift vouchers and pickup | **Pickup: yes, they take pickup orders** (Google shows "Order online"). *Needs: the pickup ordering link, and which rooms.* Then `clickAndCollectUrl` in data, an "At home" row with Pickup next to Deliveroo/Uber Eats, and `/soho/food-pickup/` → that row. Vouchers still open: no link until a provider exists |
| D8 | Rating claim | **Answered from Google (screenshots, 20 Nov 2026):** Covent Garden 4.8 from 20,030 reviews; Soho 4.8 from "16k". **Done now:** the home line reads "4.8 / 5 on Google at both restaurants: 20,030 reviews for Covent Garden and 16,000+ for Soho (November 2026)". Google labels these reviews "not verified", so the site says "on Google", never "verified". *Exact Soho count would replace "16,000+"* |
| D9 | Group enquiries and the Dubai list | **Answered: by email.** Both forms send to the restaurant's email through a form-to-email service, so the page can show "Sent" / "You're on the list" (a `mailto:` link cannot). *The Dubai address is not verified yet: the Dubai form stays off (or demo-marked) until it is* |

### New facts from the client (20 Nov 2026)
- **Pre-theatre seating:** Soho 5–5.45pm, Covent Garden 4.45–5.30pm. Shown on the pre-theatre menu, its menu-ledger row on the branch page ("Pre-theatre, seated 5–5.45pm") and as a hint in the drawer when a guest picks a time in that window. Goes into `branches.json` as data.
- **Deposit:** £10 a person for tables of 4 or more, taken off the bill or refunded. Shown in the drawer (fine print when 4 or more are chosen: "Tables of 4 or more pay a £10 a person deposit, taken off your bill or refunded"), on the groups page, the Good to know Groups tag and `/booking-terms/`. Confirmed for both rooms; refunded in full when cancelled at least 24 hours before the booking. **Done now:** `/booking-terms/` (new Deposits and Groups of 8 or more sections), the home passes note and Covent Garden's `groupsNote` say so. This replaced "Larger bookings need a deposit" and the home note's wrong "Five or more".
- **Capacity:** not printed; asked by phone. The groups page and the drawer's group message say "Ask about space for your group: call …".
- **Enquiry replies:** "as soon as possible". The Sent panel says "We'll reply as soon as we can"; no promised time.
- **Covent Garden opens at 4.45pm** (client, 20 Nov 2026). Done in `src/data/branches.json`: Tue–Fri evening service now starts 16:45 (Sat and Sun were already open all day); `scripts/test-hours.ts` updated. The drawer offers 4.45pm, and the pre-theatre window 4.45–5.30pm fits inside opening hours.

## 11. Build order after approval
Each slice keeps the Phase 2 gate (390/768/1440 + calm screenshots, no overflow, 0 JS errors, `astro check`, Lighthouse a11y 100, CLS ≤ 0.05, contrast) and leaves `/styleguide/` unchanged.

| Slice | Content | Needs |
| --- | --- | --- |
| 4.1 | Navigation and context: branch context on menu pages, one header, Menus ▾, Index ledger, dock contexts, limits from data, vouchers link rule, no-JS fallbacks | D5, D6 |
| 4.2 | Redirects + `/book/` | D1 |
| 4.3 | Branch page order: arrival + facts row, menu ledger, headings, receipt rule, Dubai cleanup | D3, D4 |
| 4.4 | Menu page: one menu at a time, phone menu sheet, search across menus, empty states | D2 |
| 4.5 | Book drawer: typeable party size, done state, group hand-off with pre-fill | — |
| 4.6 | Groups page on `fp-form` with states, sent by form-to-email; set-menu line for 8+ | form service chosen |
| 4.7 | Dubai list states | verified Dubai email |
| 4.9 | Pre-theatre seating times in data, menu and drawer hint; rating line from Google | Google figures |
| 4.8 | Info pages and 404 pattern | client dates |

## 12. Not verified
No guest testing: tap counts come from the flows. Wireframes were checked in headless Edge only (§ verification in the reply and `shots/`). Real phones, Safari, Firefox and screen readers are untested, as in earlier phases. Still client content: set-menu price, deposit refund conditions (cut-off for cancelling), vouchers and pickup.
