# Implementation roadmap

| Phase | Content | Status | Gate |
| --- | --- | --- | --- |
| 0 | Understand the project, safe baseline, audit, docs | **Done** (19 Nov 2026) | Approval to start Phase 1 |
| 1 | Design direction + design-system proposal (docs and mock frames only) | Not started | Approval of direction |
| 2+ | Implementation in controlled slices | Not planned yet | Defined in Phase 1 |

## Rollback
- Baseline: `git checkout baseline-pre-redesign` (tag on `main` @ 0ead5a8)
- All redesign work happens on the `redesign/world-class` branch. Nothing is pushed without approval.

## Candidate work items from the audit (not yet prioritised or approved)
- Fix the `astro check` error (`astro.config.mjs:44`)
- Give `/404` a real heading
- Rework desktop compositions (Soho hero, doors, menu book, goodbye)
- Shorten branch pages / bring hours and address closer to the top
- Home lab LCP below 2.5 s without bringing back CLS
- CSP header (and confirm HSTS at the host)
- WCAG 2.2 manual checks (focus not obscured, target size, keyboard path through scenes)
- Windows build: document or replace the satteri WASM workaround
