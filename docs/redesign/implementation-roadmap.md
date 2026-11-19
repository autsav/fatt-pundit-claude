# Implementation roadmap

| Phase | Content | Status | Gate |
| --- | --- | --- | --- |
| 0 | Understand the project, safe baseline, audit, docs | **Done** (19 Nov 2026) | — |
| 0.1 | Fix `astro check` error | **Done** (7dbaa73) | — |
| 1 | Design direction + design-system proposal + mock frames | **Approved** 19 Nov 2026 | — |
| 2 | Implementation slices below | In progress: 2.1 done | Each slice has its own gate |

## Rollback
- Baseline: `git checkout baseline-pre-redesign` (tag on `main` @ 0ead5a8)
- All redesign work happens on `redesign/world-class`. Nothing is pushed without approval.

## Proposed Phase 2 slices (in order; each one small, verifiable and revertible)

Gate for every slice: before/after screenshots at 390/768/1440 + calm mode; no horizontal overflow; 0 JS errors; `npm run check` 0 errors; Lighthouse mobile a11y 100 and perf not below its baseline (`qa-report.md`); CLS ≤ 0.05; text contrast ≥ 4.5:1; the relevant lessons in `tasks/lessons.md` respected.

| # | Slice | Files (expected) | Why |
| --- | --- | --- | --- |
| 2.1 ✅ | Foundation tokens: spacing, grid (`.desk`), type steps, surfaces, lift | `src/styles/global.css` | Done 19 Nov: additive, HTML identical, +453 B gz (qa-report.md) |
| 2.2 | Quick a11y fixes: 404 `<h1>`; Tonight's board fit-to-width | `src/pages/404.astro`, `components/branch/TonightBoard.tsx` | Audit 4.5, 4.1 |
| 2.3 | Branch arrival: photo + object spread (CG), typographic hero (Soho), Dubai check | `src/pages/[branch]/index.astro`, `components/branch/BranchArrival.tsx` | Audit 4.1, the biggest desktop gap |
| 2.4 | Boarding-card strip under the branch hero (reuses `lib/hours.ts`, `BookDrawer` triggers) | new `components/branch/VisitStrip.astro` | Audit 4.2, essentials before story |
| 2.5 | Good to know → luggage tags; Other rooms → postcards | `src/pages/[branch]/index.astro` | Principle 1 |
| 2.6 | Home desktop spreads: doors, menu book, goodbye | `components/scenes/Doors.astro`, `MenuBook.tsx`, `site/Goodbye.astro` | Audit 4.1. Heaviest slice: perf budget re-run required |
| 2.7 | Info pages as printed documents | `src/layouts/InfoPage.astro` | Consistency |
| 2.8 | Security header: CSP (report-only first) | `public/_headers` | Audit 4.10. Needs your OK (deploy config) |
| 2.9 | Full QA pass + manual WCAG 2.2 checks (focus not obscured, target size, keyboard through scenes) | `qa-report.md` | Release gate |

Out of scope until the client answers: prices, legal wording, Soho photos, the "Chinese-Indian" vs "Indo-Chinese" term, the font licence.
