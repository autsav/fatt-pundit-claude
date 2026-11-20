# Implementation roadmap

| Phase | Content | Status | Gate |
| --- | --- | --- | --- |
| 0 | Understand the project, safe baseline, audit, docs | **Done** (19 Nov 2026) | — |
| 0.1 | Fix `astro check` error | **Done** (7dbaa73) | — |
| 1 | Design direction + design-system proposal + mock frames | **Approved** 19 Nov 2026 | — |
| 2 | Implementation slices below | In progress: 2.1 to 2.4 done | Each slice has its own gate |

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
| 2.4a | Phone navigation: fixed dock (Menus, Call, Book) + numbered index (audit C11) | `SiteHeader.astro`, new dock component | Audit; approved mock |
| 2.5 | Good to know → luggage tags; Other rooms → postcards | `src/pages/[branch]/index.astro` | Principle 1 |
| 2.6 | Home desktop spreads: doors, menu book, goodbye | `components/scenes/Doors.astro`, `MenuBook.tsx`, `site/Goodbye.astro` | Audit 4.1. Heaviest slice: perf budget re-run required |
| 2.7 | Info pages as printed documents **+ fix font-swap CLS** (allergens 0.245 @768, privacy 0.116, found in 2.3a) | `src/layouts/InfoPage.astro`, font fallback metrics | Consistency; CWV |
| 2.7a | List menus as a ledger; merge the two chip rows (audit O04, O05) | `[branch]/menu.astro` | Approved direction |
| 2.8 | Security header: CSP (report-only first) | `public/_headers` | Audit 4.10. Needs your OK (deploy config) |
| 2.8a | Integrations that are demo-only today: waitlists, private-dining enquiry, rating claim (audit C02, C22, C23). **Needs client decisions** | `[branch]/index.astro`, `private-dining.astro`, `index.astro` | Audit |
| 2.9 | Full QA pass + manual WCAG 2.2 checks (focus not obscured, target size, keyboard through scenes) | `qa-report.md` | Release gate |

Out of scope until the client answers: prices, legal wording, Soho photos, the "Chinese-Indian" vs "Indo-Chinese" term, the font licence.
