# Phase 6 — Complete website redesign (every page after home)

**Status: built and verified 20 Nov 2026, awaiting visual approval.** Home (Phase 5, approved) was not redesigned; it changed only where it shares parts (footer, two buttons).
Inputs: `phase2/creative-direction.md` ("A disciplined by B": *objects for moments, ledger for facts*), `phase3/design-system.md`, `phase4/ux-structure.md` §5–§7, `phase5/homepage.md` (the chapter head).
Screenshots: `shots/before_<route>_<width>.webp` and `shots/after_<route>_<width>.webp`, full page at 1440 (scaled to 720) and 390. In full-page captures the footer of long pages can look empty (it uses `content-visibility: auto`) and the phone dock shows part-way down (it is fixed to the screen); both are capture artefacts.

## 1. Routes and page types

| Type | Routes | Layout family |
| --- | --- | --- |
| Story (done) | `/` | Phase 5 chapters |
| Branch, open | `/soho/`, `/covent-garden/` | Arrival + facts row, then numbered chapters |
| Branch, opening soon | `/dubai/` | Same, list first |
| Menus | `/soho/menu/`, `/covent-garden/menu/` | Document desk, wide |
| Booking desk | `/book/` | Document desk, full width |
| Form | `/private-dining/` | Document desk, full width, form sheet |
| Text | `/allergens/`, `/privacy/`, `/accessibility/`, `/booking-terms/` | Document desk: contents, text, summary |
| Error | 404 | One object (the luggage tag) |
| Not public | `/og/*` (share-image renders), `/styleguide/` (preview builds only) | Unchanged |

**The family.** Every page now opens the way the home chapters do: a label on a rule beside a light, sentence-case headline (`.fp-section-head`). On branch pages each section is a numbered chapter (01, 02…), numbered from the sections that page actually shows. Document pages use the same head for their h1 and put their body on the same 12-column desk: label rail (columns 1–2), content from column 3. What fills the body differs by page (a ledger, a form sheet, a printed menu, a tag), so the pages share one rhythm without one template.

## 2. Route by route

### `/soho/`, `/covent-garden/` (open branch)
- **Purpose:** decide and book; facts first (hours, address, Call, Directions), then the room, the signature dish, the menus, visit details.
- **Weaknesses found:** four heading styles on one page (bold caps, coloured caps, Lora kickers, AT Light); capitals buttons in the arrival and Visit; a tiger "Google Maps" button (tiger is for Book); green open dot; tracked-capital labels in the facts strip; hours as a `dl` styled as a table; three local copies of system objects (tags, postcards, ledger); two stacked section paddings (256 px holes); tiger price text on paper (contrast).
- **Done:** chapter heads 01–06 on every section; room headline is the first brand line, the other two become one spoken line; arrival and Visit on system buttons (one primary each: Book); maps as secondary buttons, Call and Email as strong links; facts strip on `.fp-facts` + `.fp-badge` (dot/ring + words, slate not green); hours as a real `<table>` with caption, today's row `aria-current="date"` and the visible word "(today)"; menus ledger on `.fp-ledger--numbered` with the seating note under the name (it squeezed "Pre-theatre" onto two lines on phones); tags and postcards are the system's `.fp-tag` / `.fp-postcard`; consecutive sand chapters share one gap; price text tiger-deep. The open pill in the hero lost its green pulsing dot (slate dot, ring when closed, no glow).
- **Kept:** arrival composition and name board, Tonight's board, lights-on wall, plate wall, Soho walk-the-room, contact sheet, signature ticket.
- **Files:** `src/pages/[branch]/index.astro`, `src/components/branch/VisitStrip.astro`, `src/components/scenes/OpenNowPill.tsx`, `src/styles/global.css`.

- **Revision 21 Nov (client feedback: "the middle section looks odd"):** the middle of the page was five colour bands in about one and a half screens (dark hero, white facts strip, dark Tonight's board, sand room head, dark walk), and the room chapter's head was split from its content. Now:
  - Tonight's board hangs in the arrival, under the buttons, instead of a band of its own.
  - The room chapter holds its own content. Soho's chapter is night ink with the walk inside it; Covent Garden's stays sand and its contact sheet moves inside it, aligned with the headline.
  - The walk lines up with the headline and bleeds off the right edge only. Its caption and progress rule share that line, and the last stop ends on the column edge.
  - Stop cards are on the system type: "Stop 1 of 5" as a label, sentence-case light titles (were bold capitals).
  - The walk is 220svh instead of 320svh (180svh on phones instead of 240svh).
  - On desktop the arrival column is top-aligned wherever the board shows. A slow load can paint the hero before its HTML has fully arrived, and a centred column then slid up (CLS 0.053 in 1 of 6 loads).
  - Shots: `shots/middle-before_*` and `shots/middle-after_*` (page top to chapter 02).
  - Checks: branch QA 126/126; Lighthouse `/soho/` 98, `/covent-garden/` 96, `/dubai/` 99, CLS ≤ 0.004.
  - Files: `src/pages/[branch]/index.astro`, `src/components/branch/WalkTheRoom.tsx`, `src/styles/global.css`.

### `/dubai/` (opening soon)
- Same template. The list is chapter 01 on gold ("Be first through the door" as a light headline; the form, once its endpoint is set, uses `.fp-input` and an ink primary button, since tiger can't sit on gold). Room 02, Coming with us 03 (the three tickets), In London 04 (postcards). Hero "Join the list" is the system primary and still lands on `#waitlist`.

### `/soho/menu/`, `/covent-garden/menu/`
- **Purpose:** read one menu at a time, search across all, filter by diet, print, book.
- **Weaknesses found:** the whole page was a white card on sand with bold-caps h1; on desktop the left rail held index + search + filters and outgrew a 900 px screen (it scrolled inside itself and looked clipped); diet chips and search were one-off styles; on phones the passport stamp dropped onto its own line beside long dish names; on slow phones the page jumped twice while loading (CLS 0.18): the full chip list painted before one-menu mode switched on, then the "Menu:" button appeared.
- **Done:** document head (breadcrumb, "Fatt Pundit Soho" label, h1 "Soho menus"); desktop rail is the menu index only, like a contents list; search and "Show only" sit as a toolbar above the menu; the menu itself is the page's one object, a printed sheet (paper, ink edge, hard shadow; edge to edge on phones); chips are `.fp-choice` checkboxes, search is `.fp-input`; dish rows are a grid (name | price | stamp, marks underneath); one-menu mode now switches on before the tools are parsed, a deep link (`#vegan`) shows its menu from the first paint, and the phone menu button is drawn by CSS rather than unhidden by script; print and back links on system styles; the active index item is marked in ink, not tiger.
- **Files:** `src/pages/[branch]/menu.astro`, `src/components/site/DishPassport.astro`.

### `/book/` (booking desk)
- **Purpose:** the no-JavaScript and old "Reserve" target; equal choice between rooms.
- **Weaknesses found:** narrow card floating in empty sand; caps h1; no live status; Dubai and groups rows as text links beside room buttons (unequal weight).
- **Done:** numbered ledger (01 Soho, 02 Covent Garden, 03 Dubai, 04 A bigger table), each with a live status badge on the guest's clock in the room's time zone (line height reserved, no shift), address, provider named, one secondary button each (no tiger on the desk: equal choices), Call as a strong link; a pointer to booking terms. `?branch=` still opens the drawer over the desk.

### `/private-dining/` (groups)
- **Weaknesses found:** a long single column card, form at the bottom with no visual weight; "Prefer to talk?" numbers buried in a hint.
- **Done:** head with the intro as one line; desktop puts "What's possible" (ledger per room, set-menu links, deposit, "Prefer to talk?" with Call and email per room) beside the enquiry form as one paper sheet (the page's object). Phones keep the approved order (facts, then form). Form behaviour unchanged: prefill from the drawer, error summary with focus, re-check on input, email hand-off until `PUBLIC_FORM_ENDPOINT` is set.

### `/allergens/`, `/privacy/`, `/accessibility/`, `/booking-terms/` (text)
- **Weaknesses found:** narrow card, bold-caps h1 and caps h2s, "In short" and "Questions?" in the reading column, no contents on the longest page.
- **Done:** one layout (`InfoPage`, `layout="doc"`): head; contents list in the label rail when a page has more than four sections (booking terms: 5, generated from its headings at build time, with ids); reading column at the system measure, sentence-case h2s on a hairline; "In short" (paper note) and "Questions?" (ledger with Call and email per room, related buttons) in the side column on desktop, before and after the text on phones. Draft markers kept.
- **Files:** `src/layouts/InfoPage.astro` (the four pages are unchanged).

### 404
- **Weaknesses found:** tiger hard shadow (tiger means "press me"), no footer, no skip link.
- **Done:** the tag keeps its tilt (none in calm mode) and its shadow is a lift; skip link and footer added, with a rule between the ink main and the ink footer.

### Shared parts
- **Footer:** branch names and Book links in sentence case (were tracked capitals), Book links at 44 px; newsletter on `.fp-input` + primary button.
- **Book drawer, dish passport, home Dubai note, home pass waitlist:** moved from the legacy capitals `.btn` to `.fp-btn`; the legacy `.btn` rules are deleted from `site.css` (no users left). Passport: ink shadow (was tiger), unpressed stamp icon in the muted text colour (was 35% ink, under 3:1), remove links 24 px tall.
- **Consolidated:** local copies of tags, postcards, ledger rows, hours rows and buttons on the branch pages now use the system classes; `.chapter-body` (global.css) aligns any chapter body with its headline.

## 3. Verification (20 Nov 2026, headless Edge, this machine)

| Check | Result |
| --- | --- |
| `astro check` | 0 errors, 0 warnings |
| Build gates | data 0 errors; hours tests pass; contrast 150/150 |
| Overflow, JS errors, CLS (13 routes × 320/390/768/1024/1440/1920, + calm at 390 and 1440) | no overflow, 0 JS errors, CLS ≤ 0.05 on every non-home route |
| axe (WCAG 2.0/2.1/2.2 A+AA), 12 routes at 390 and 1440 | 0 violations |
| Scripted interactions | branch: today's row marked, facts badge, chapter numbers in order, one primary in arrival and Visit, Dubai list link; booking desk: 3 badges, no tiger, `?branch=` opens drawer, Escape closes, stays on desk; menus at 390 and 1440: search count, empty state, clear, VG chip filters correctly, `#drinks` shows one menu, stamps stay on the name line; groups: prefill, error summary with focus, re-check on input, valid submit hands off to email; text pages: contents only on booking terms and its links resolve. **376/376 checks** |
| Booking smoke test | 8/8 |
| Lighthouse budget (mobile, slow 4G, 4× CPU) | `/soho/` 98, `/covent-garden/` 96–98, `/dubai/` 99, `/soho/menu/` 99, `/covent-garden/menu/` 99, `/book/` 99, `/private-dining/` 99, `/allergens/` 99, `/booking-terms/` 99, 404 99; CLS ≤ 0.028 |
| Menu-page load shifts, previous build vs this one (same throttled phone trace, 2 rounds, identical) | `/soho/menu/` 0.180 → 0.002; `#vegan` deep link 0.573 → 0.015; `#drinks` deep link 0.560 → 0.257 |

Not tested: real phones, Safari, Firefox, screen readers (as in every phase); a live form service (none chosen: CLIENT-INPUTS #5).

## 4. Outstanding

1. **Home performance on this machine today: perf 74–78, TBT 424–522 ms** (budget 85 / 200), below the 86 recorded in Phase 5. Alternating runs of the previous commit and this build gave the same range (before 74–78, after 76–77), so Phase 6 did not cause it; it needs its own look (the home scroll scenes). Dropped frames on home and Covent Garden swing 0.7–8% between identical runs, the known voyage item from Phase 5 §4.
2. **Menu deep link to a long menu (`#drinks`) still shifts 0.257 on a slow phone** (was 0.560). The browser scrolls to the anchor while the menu is still arriving. Next step: hold the anchor scroll until the menu is complete.
3. **Wording (CLIENT-INPUTS #45):** new or changed labels on branch, groups and booking pages are draft.
4. **Groups on phones:** the form sits after the facts, as approved in Phase 4; on a phone that is about two screens down. A "Send an enquiry" jump link under the intro is an option if the client wants the form sooner.
5. Unchanged and still open from earlier phases: font licence, real-device testing, form service, Dubai list endpoint, Soho and Dubai photography.
