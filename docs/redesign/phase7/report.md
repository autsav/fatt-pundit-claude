# Phase 7: what was built (21 Nov 2026)

Plan: `premium-plan.md`. This pass builds every step that needs nothing from the client. Steps waiting on the client are listed at the end with the question that unblocks each.
Shots: "before" = `audit/` (the plan's audit); "after" = `after/` (`d_` desktop 1440, `m_` phone 390, same layout as the audit sheets).

## Steps

### 7.0 Defects
| # | Fix | Result |
| --- | --- | --- |
| D1 | Menu rows: a price longer than 8 characters drops under the name, right-aligned, and may wrap, whenever the row is narrower than 560px (container query) | No dish name narrower than 40% of its row, both menus, 320–1440px (new check `menurow`) |
| D2 | The voyage hydrates a screen before it's reached (`client:visible`, rootMargin 100%), not during page load | Home: perf 74–75 → 84–86, TBT 482–505 → 98–121ms. Observed LCP 0.2s |
| D3 | The passport tip under the menu tools was Lora italic; its fallback wrapped to one more line, so the menu jumped when Lora arrived. Now set in the body face (width-matched fallback) and dismissable | `#drinks` on a slow phone: 0.12 → 0.03 in our trace (Lighthouse 0.26 earlier → 0) |
| D4 | Branch heroes 900–1023px top-aligned (they were bottom-aligned, so a slow first paint could slide them) | 960 added to the QA widths |
| D5 | With `PUBLIC_LAUNCH=true` the sample lines on Tonight's board are dropped (the board hides until the sheet exists); the build log warns, and fails if only half the sheet setting is there | HANDOVER.md updated |

### 7.1 System (the parts that don't touch the approved home)
- **Navigation:** sentence case, 16px, no tracking. The page you're on is gold with a 2px gold underline. "Index" kept on phones: "Menu" would be confused with the restaurant menus.
- **Footer:**
  - "Open until …" / "Opens …" per room, live in the room's own time zone
  - links 15px at full strength
  - the allergen line 15px
  - social icons as plain glyphs without boxes (44px targets kept)
- **Page-end strip** (`NextStep.astro`, `fp-next`): one next step and a photograph before every footer.
  - branch pages: "Hungry already? Book at …"
  - Dubai: "Hungry before Dubai opens?"
  - menus: "Ready? Book at …" with Print and Back
  - booking desk: "Read the menus first."
  - groups: "Two rooms in London."
  - info pages: "Hungry yet?"
  - The InfoPage layout takes a `next` prop (default strip, or `false`).
- **Rhythm:** less ink below the Soho walk. The strip after a sand chapter drops its top padding.

### 7.2 Photos and proof (from approved photos only)
- `src/lib/dish-photos.ts`: dish photos by dish id.
- **What to order** on branch pages: the à la carte dishes that have an approved photo, as square captioned cards with price, linking to the menu. Today that's three: crackling spinach, mix vegetable momo, crispy okra. More join when the shoot delivers (#36, #46, #53). On phones it's a sideways row of cards.
- **Proof:** the Google rating as a large figure with count, source and date, from new `page.rating` data in `branches.json` (validated). There are no quotes: none supplied (#29).
- **Branch menus:** two short columns of links, "Menus" and "For dietary needs", replacing the 10-row ledger.

### 7.3 Menu rows
- The name carries the weight (18px). Diet marks are a quiet muted line.
- Signature dishes get a "Born here" mark, and a round photo where one exists (crackling spinach).
- The passport tip has a "Got it" button and stays hidden afterwards. It's hidden before paint, so there's no shift.
- The strip replaces the old foot row.

### 7.4 Booking desk and groups
- **Booking desk:** choose a day, a time and how many once. Each room's line says what its button will do:
  - "OpenTable opens with 2 guests, Saturday 21 November, 7pm."
  - "No tables at … Try another time."
  - "Soho books online for up to 7. For 12, call or plan a group."

  Its Book button goes straight to the filled-in provider page. A party above the online limit goes to the groups form with the details filled in.
  - The picker shows before first paint (no shift). Without JavaScript the desk works as before, and `?branch=` still opens the drawer.
  - The drawer and the desk share `src/lib/booking.ts` (slots and deep links), so there's one copy of the logic.
- **Groups:** a set-table photo (Covent Garden, captioned) and a "Send an enquiry" jump link on phones and tablets.

### 7.5 Dubai
- The list moved into the hero: one action, in one place, with `#waitlist` kept for every link.
- The gold list band and the empty "room" chapter are gone. The page now runs: hero, facts, "What we're packing", "In London", strip.

## Checks (production build, 21 Nov)
- `astro check`: 0 errors, 0 warnings. Build gates: data, hours tests, and contrast 150/150.
- QA 419/419 checks:
  - overflow, JS errors and CLS on 13 routes × 7 widths (960 added) plus calm mode
  - axe at 390 and 1440
  - interactions, including new ones: Dubai list in the hero, no empty room chapter, desk picker shown, links filled in, 12 guests goes to groups, strip present
- Menu rows: every name at least 40% of its row (2 menus × 6 widths).
- New rhythm check (`rhythm`): at most 2 surface changes per screen and no empty band over 160px, on 11 routes at 1440 and 390.
  - 21 of 22 pass.
  - Dubai at 1440 measures 163px under the tilted tickets. Their bounding box hides the shadow; the visible gap is about 125px.
- Lighthouse budget, every touched route:

| Route | Perf | TBT ms | CLS | Weight KB |
| --- | --- | --- | --- | --- |
| `/` | 84–86 | 98–121 | 0–0.04 | 1012 |
| `/soho/` | 97 | 1 | 0 | 310 |
| `/covent-garden/` | 98 | 47 | 0.004 | 1039 |
| `/dubai/` | 99 | 0 | 0.002 | 327 |
| `/soho/menu/`, `/covent-garden/menu/` | 99 | 0 | 0 | 196 |
| `/book/` | 99 | 0 | 0.001 | 266 |
| `/private-dining/` | 98 | 0 | 0 | 293 |
| `/allergens/` | 99 | 0 | 0 | 233 |

- **Still over budget: home scroll smoothness.** 2.5–3.3% dropped frames against 2%.
  - It was 2.8% on the old setting in the same session, so this pass didn't cause it.
  - The known fix is the voyage overlay as a transform-moved layer (todo).

## Not built, and why
| Step / item | Waiting on |
| --- | --- |
| 7.1 Home headlines to light sentence case; home progress rail; closing screen | Client sign-off on changing the approved home (#52) |
| Home first-visit board (lab LCP) | It needs React at once for its 1.5s intro; deferring it changes the approved intro (#52) |
| Logo SVG in the shrunk header; Menus mega-menu photos | Logo files (#32); room photos (#35) |
| Dish photo beside the Born-here ticket; photos on the "other rooms" postcards | No approved photo of kid goat momo, White Tiger, or Soho (#35, #36) |
| Review quotes, press | #29 |
| Menu PDFs, "Download PDF", hours line on the menus page | PDFs need a generator in the build. Print/Save as PDF works today. Menu-specific hours exist only for pre-theatre (shown) |
| Stamp shown on hover only (desktop) | Left visible: hiding or fading it fails the 3:1 contrast for controls |
| Groups: two-step form, Spaces cards, set-menu price, testimonial | Two-step would rework a validated, tested form for little gain (revisit with the spaces content); #47, #2 |
| 7.6 Story, Contact/FAQ, allergen matrix | #49, #51, #48 |
| 7.7 Photography swap-in, hero films, Soho walk with photos | The shoot (#46) |
| 7.8 Home revisions | #52 |
| 7.9 Launch pass (real devices, Safari/Firefox, screen reader) | All of the above |
