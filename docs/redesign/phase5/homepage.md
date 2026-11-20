# Phase 5 — Homepage design and implementation

**Status: approved 20 Nov 2026 and committed.** Only the homepage changed. The chapter head comes to the branch pages next.
Inputs: `phase2/creative-direction.md` (A disciplined by B: *objects for moments, ledger for facts*), `phase3/design-system.md`, `phase4/ux-structure.md` §5 (Home).
Screenshots: `shots/`. `compare_hero_1440.webp` and `compare_hero_390.webp` put the old and new first screens side by side. `before_*` and `after_*` are full-page scrolls (contact sheets) at 1440, 768 and 390. `hero_*` are first screens, calm mode included. `chapter_*` show each chapter at 1440 and 390.

## 1. The idea

The home page is one walk through the door. The guest stands at the restaurant's rainy window (hero), opens the doors and follows the ship from Guangdong to Calcutta and London (01), reads the menu (02), sits at the bar (03), looks round the room (04) and picks a table (05). Every chapter after the hero opens the same way: **a numbered label on a rule, then a light headline** (the system's `.fp-section-head`). What follows each head is different on purpose (a book, an apron, a contact sheet, boarding passes), so the page has one rhythm without repeating one layout.

## 2. Section by section (final)

| # | Section | What changed | Why |
| --- | --- | --- | --- |
| Hero | Rain on the window | **The composition is kept as it was**: full-screen glass; the name, restaurant board and Book centred on a soft dark pool; "Or see the menus first"; the wipe hint. Underneath: the words are static HTML over the glass island (`client:idle`), painted finished; the name rises only on a first visit. Book uses the system style (sentence case). A hand wipes one broad streak through the fog when the rain starts (already wiped in calm mode). | The client chose the immersive first screen (a split "window beside the words" version was built, reviewed and dropped). Faster first paint, works without JavaScript, and the streak shows the glass can be wiped |
| | One Book in view | The header's Book is hidden (`visibility`, no shift) while the hero's Book is on screen, and stamps back in after it. Phones: no hero Book (the dock has it) | One tiger action per view (UX §6). Without JavaScript and on other pages, the header's Book always shows |
| 01 | Doors + story | "01 Our story" label on a rule in the light past the doors | The chapter system starts here |
| 02 | The menus | Chapter head, then one toolbar: *Open the book for* [Soho] [Covent Garden] (+ Dubai line) and *Or read them as a list* [Soho menus] [Covent Garden menus] as secondary buttons | UX F8: the list route is as strong as the book; four stacked rows of controls became two groups |
| 03 | The bar | Chapter head; the embroidered title stays as the headline, set on the rule | The moment is kept, the rhythm is shared |
| 04 | The room | Label, headline, text and rating in one column beside the contact sheet, both from the top rule. The rating is a ledger fact: the figure in the light face, its source underneath | One reading line; the source stays next to the claim |
| 05 | Your table | Chapter head; the note sits under the passes | Same rhythm |
| — | Chapter rail | Shown from 1320px (from 1100 it covered content up to about 1310). Labels match the chapter names. **Positions are measured on resize only**: each scroll frame used to measure six sections right after the voyage had moved its map, which forced a style and layout pass every frame | Overlap fixed; smoother scroll (§3) |
| — | Small fixes | Page `<title>` encoding ("Â·" → "·"); the board's open dot in the system colour (no green); dead styles and unused imports removed; `tokens.css` comment encoding | Found on the way |

Spacing: every chapter uses `--section-pad` and `--section-gap`; the hero and chapters share the header's 1240 column (`.wrap`).

## 3. Verification (20 Nov 2026, headless Edge)

| Check | Result |
| --- | --- |
| `astro check` | 0 errors, 0 warnings |
| Build gates | data 0 errors; hours tests pass; contrast 150/150 |
| Overflow, 320–1920 and calm | none; 0 JS errors |
| axe on home, settled (WCAG 2.x AA), 320–1440 | clean. A whole-page run flags only scene items while they fade in (voyage postcards, revealed heads), the same as in earlier phases |
| CLS on load | ≤ 0.002 |
| Interactions, scripted (22/22) | first-visit rise; return visit painted at once; hero Book opens the drawer, and Escape returns focus; menus link; gate links; glass wipe; menus radio keys and label; list buttons; calm; no JS; rail shown at 1440, hidden at 1280; one tiger action on a phone; header Book hidden at the top, back after scrolling, skipped by Tab while hidden |
| Booking smoke test | 8/8 (desktop now clicks the Book in view: on home that's the hero's, since the header's waits) |
| Scroll smoothness (budget method: 390 px, 4× CPU, WebGL off), old vs new build, 3 alternating rounds on one static server | long frames 6.1% mean (3.6–8.6) → **3.1% (2.7–3.4)**; in the voyage, about 45 → about 24 per round. Still above the 2% budget |
| Lighthouse (astro preview), 2 runs | perf 86 (budget 85), observed LCP 218–287 ms, CLS 0, 1,022 KB. With the full-screen glass back, the blurred hero still is the largest thing painted: it now loads first (`fetchpriority=high`, decoded at once), which took perf from 82 to 86. The split version scored 92 |

Not tested: real phones, Safari, Firefox, screen readers (as in every phase). One environment note: under `astro preview` only, a gate-row navigation logs "Transition was aborted… opt-in disabled". The same build on a plain static server does not.

## 4. Open

- Scroll smoothness. Second pass (20 Nov 2026): the voyage samples its route once instead of asking the SVG for points every frame, writes the four route dashes only when they change, and steps its stroke-scale variable in 0.4% increments (the median per-frame restyle went from 38 elements to 16–18). Pixel-identical at 1440; on a phone, one frame differs by under 1 px along the route. Six alternating rounds: old 4.2% mean long frames (2.6–6.6), new 3.7% (2.6–3.3 with the intro skipped). Still above 2%. What's left is the full-screen route overlay redrawn every frame because its viewBox moves. Getting under 2% needs the overlay rebuilt as a layer moved by transform, which is a larger change to a tuned scene.
- ~~Draft wording~~: chapter names and menus labels approved 20 Nov 2026 (CLIENT-INPUTS #44 closed).
- Next: carry the chapter head to the branch pages.
