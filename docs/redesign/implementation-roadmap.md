# Implementation roadmap

| Phase | Content | Status | Gate |
| --- | --- | --- | --- |
| 0 | Understand the project, safe baseline, audit, docs | **Done** (19 Nov 2026) | — |
| 0.1 | Fix `astro check` error | **Done** (7dbaa73) | — |
| 1 | Design direction + design-system proposal + mock frames | **Approved** 19 Nov 2026 | — |
| 2 | Implementation slices below | Done except 2.8a (needs client decisions); see qa-report.md | Each slice has its own gate |
| 3 | Design system: tokens, `fp-` components, contrast gate, `/styleguide/` showcase | **Done 20 Nov 2026**, recommended options adopted (`phase3/design-system.md`). Pages unchanged except the drawer focus-ring fix | Contrast 150/150 in prebuild; computed-style check on 8 routes; axe 0 on `/styleguide/` |
| 4.0 | UX structure: sitemap, navigation model, journeys, page hierarchy, CTA rules, states, redirects, wireframes (`phase4/ux-structure.md`, `phase4/wireframes.html`) | **Approved** 20 Nov 2026 (D1–D5 yes; D6, D8, D9 answered; D7 open) | `phase4/ux-structure.md` §10 |
| 4 | Build the UX structure, slices 4.1–4.9 (`phase4/ux-structure.md` §11; results in `tasks/todo.md`) | **Done 20 Nov 2026**; forms wait for a form service (client) | Phase 2 slice gate + `/styleguide/` unchanged |
| 5 | Homepage design: immersive rain hero kept, numbered chapter heads, menus toolbar, rail fix (`phase5/homepage.md`) | **Approved and committed 20 Nov 2026** (hero kept immersive after review); other pages unchanged | Phase 2 slice gate; scripted hero/menus checks |

## Rollback
- Baseline: `git checkout baseline-pre-redesign` (tag on `main` @ 0ead5a8)
- All redesign work happens on `redesign/world-class`. Nothing is pushed without approval.

**Design rules for every slice from 2.4 on (approved 19 Nov 2026):** "objects for moments, ledger for facts". See `phase2/creative-direction.md` §5 and §9, the checklist in `design-system.md`, and the mock `phase2/branch-covent-garden.html`. Slice 2.4 is set as a ledger row; 2.5 uses one object type per section.

## Proposed Phase 2 slices (in order; each one small, verifiable and revertible)

Gate for every slice: before/after screenshots at 390/768/1440 + calm mode; no horizontal overflow; 0 JS errors; `npm run check` 0 errors; Lighthouse mobile a11y 100 and perf not below its baseline (`qa-report.md`); CLS ≤ 0.05; text contrast ≥ 4.5:1; the relevant lessons in `tasks/lessons.md` respected.

| # | Slice | Files (expected) | Why |
| --- | --- | --- | --- |
| 2.1 ✅ | Foundation tokens: spacing, grid (`.desk`), type steps, surfaces, lift | `src/styles/global.css` | Done 19 Nov: additive, HTML identical, +453 B gz (qa-report.md) |
| 2.2 ✅ | Quick a11y fixes: 404 `<h1>`; Tonight's board fit-to-width | `src/pages/404.astro`, `components/branch/TonightBoard.tsx`, `global.css` | Done 19 Nov (qa-report.md) |
| 2.3 ✅ | Branch arrival: photo + object spread (CG), typographic hero (Soho), Dubai check | `src/pages/[branch]/index.astro`, `components/branch/BranchArrival.tsx`, `global.css` | Done 19 Nov (qa-report.md) |
| 2.3a ✅ | Header wraps after font load (CLS 0.22–0.23 @768 on Soho/Dubai, existing before) | `src/styles/site.css` | Done 19 Nov: one line 320–1600, CLS ≤0.004 (qa-report.md) |
| 2.3b ✅ | **Critical:** home Book drawer + / − went to `/undefined` (audit C01). Booking smoke test. Budget script runs on Windows (C20) | `components/scenes/BoardingPasses.astro`, new `scripts/smoke-booking.mjs`, `scripts/perf-budget.mjs`, `package.json` | Done 19 Nov (qa-report.md) |
| 2.3c ✅ | Accessibility fixes: contrast on pass bands and the CG cue, label mismatches, pause control, calm-mode scroller focus, intro Skip (audit C03–C07, C15, C16, O12) | `BoardingPasses.astro`, `LightsOn.astro`, `Arrival.astro`, `BookDrawer.astro`, menu page | Done 20 Nov: axe clean on home, branches and menu (qa-report.md) |
| 2.3d ✅ | `frame.png` through the image pipeline, branch gallery lightbox, home LCP (audit C09, C10, C12) | `MenuBook.tsx`, `[branch]/index.astro` | Done 20 Nov: frame 1.26 MB to 131 KB; branch gallery uses the home lightbox; LCP unchanged (qa-report.md) |
| 2.4 ✅ | Visit strip under the branch hero, set as a ledger row (reuses `lib/hours.ts`) | new `components/branch/VisitStrip.astro` | Done 20 Nov (qa-report.md) |
| 2.4a ✅ | Phone navigation: fixed dock (Menus, Call, Book) + numbered index (audit C11) | `SiteHeader.astro`, new dock component | Done 20 Nov: dock on every page at ≤640 px (Menus, Call or Rooms, Book); numbered Index sheet where the bar's links step aside; branch-only dock removed |
| 2.5 ✅ | Good to know → luggage tags; Other rooms → postcards | `src/pages/[branch]/index.astro` | Done 20 Nov: luggage tags (no icons), airmail postcards, light section headlines |
| 2.6 ✅ | Home desktop spreads: doors, menu book, goodbye | `components/scenes/Doors.astro`, `MenuBook.tsx`, `site/Goodbye.astro` | Done 20 Nov, reduced: "Pull up a chair" is a two-column spread at ≥1100 px; Canton and Kolkata map labels no longer collide (C13). Doors, menu book and goodbye left as they are: they read well at 1440 |
| 2.7 ✅ | Info pages as printed documents **+ fix font-swap CLS** (allergens 0.245 @768, privacy 0.116, found in 2.3a) | `src/layouts/InfoPage.astro`, font fallback metrics | Done 20 Nov: body font preloaded on text pages; column measured in em, not ch; fallback faces sized per weight; preview banner one line at every width. Normal loads 0 everywhere; a slow first visit to allergens still shifts 0.16–0.25 at 768–1024 |
| 2.7a ✅ | List menus as a ledger; merge the two chip rows (audit O04, O05) | `[branch]/menu.astro` | Done 20 Nov: the two chip rows are labelled "Jump to" and "Show only"; on phones and tablets the Jump to row stays under the header. Full ledger restyle not done |
| 2.8 ✅ | Security header: CSP (report-only first) | `public/_headers` | Done 20 Nov: report-only CSP in `_headers`. Enforce after checking the live console |
| 2.8a | Integrations that are demo-only today: waitlists, private-dining enquiry, rating claim (audit C02, C22, C23). **Needs client decisions** | `[branch]/index.astro`, `private-dining.astro`, `index.astro` | Audit |
| 2.9 ✅ | Full QA pass + manual WCAG 2.2 checks (focus not obscured, target size, keyboard through scenes) | `qa-report.md` | Done 20 Nov: axe, CLS and overflow on every route at 320–1920; booking smoke test; see qa-report.md. Real devices, Safari, Firefox and screen readers not tested |

Out of scope until the client answers: prices, legal wording, Soho photos, the "Chinese-Indian" vs "Indo-Chinese" term, the font licence.
