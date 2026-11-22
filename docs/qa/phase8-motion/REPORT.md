# Phase 8: motion and interaction review (21 Nov 2026)

Desk review of every transition, hover, scroll effect, loading state and page change in the build,
followed by a scripted check (`check.mjs`, headless Edge via Playwright) at 390 and 1440 px, with full
motion and with `prefers-reduced-motion: reduce`. The motion language itself is written up in
`docs/MOTION.md`; the styleguide (`/styleguide/#motion`) shows the tokens live.

## What was found

The site already had a motion token set (`--dur-*`, `--curve-*`, `src/lib/motion-tokens.ts`) and the
system components used it. Outside the system it was not being followed:

- 38 hand-written durations and curves across 17 files (`.18s ease`, `.25s`, `.3s`, `.5s`, `.8s ease`,
  four near-copies of the stamp overshoot at 1.4, 1.45, 1.5 and 1.6), so the same gesture landed at a
  different speed in different scenes.
- Two undefined-token fallbacks (`var(--ease-out, ease)`) in site.css and the room page.
- The home page carried its own copy of the chapter rail (script and styles) beside
  `ChapterRail.astro`; the component used by `/our-story/` was the older version, measuring every
  section's position on every scroll frame (a forced layout per frame) with 28 px targets.
- The Book drawer re-declared the side-dialog slide with hard-coded values.
- Two fades used `filter: blur()` (the "Open now" pill swap and the lightbox photo): a filter, not
  transform/opacity, against the system's own rule.
- Booking from a boarding pass waited 380 ms for the stub to tear before opening the booking site;
  the branch links waited 240–260 ms for a stamp; every page change crossfaded for 550 ms.
- The cycling "Open now" line kept changing under the footer's Pause motion.
- Section reveals on the home page had no no-JS path (content hidden by CSS, shown by script only).

## What changed

### Motion language (documented in docs/MOTION.md)

Two speeds and nothing in between: fast (200 ms) is feedback, story (900 ms) is a reveal; panel
(260 ms) is something arriving. Five curves, each with one job. New tokens: `--rise` (24 px, how far a
revealed block rises), `--curve-in` (things leaving or falling), `isPaused()` in TypeScript.

### Replaced or removed

| Where | Before | After |
|---|---|---|
| Home section heads, rating, tables note | `.reveal`: 28 px rise, `.8s ease` both properties, hidden without JS | `.fp-reveal` system class + `bindReveals()`: `--rise`, `--dur-story`, `--curve-out`; hidden only once the script has armed it (`html[data-reveal]`), so no-JS sees everything |
| Chapter rail | Two copies; the component version (used by /our-story/) measured layout per scroll frame, 28 px targets, shown from 1100 px where it sat on the 1240 px column | One component: positions measured on resize only, 44 px targets, shown from 1320 px (the home copy's phase 7 fixes), token timings; used by home and /our-story/. Side effect: the story page's rail is now hidden at 1100–1319 px, where it overlapped the comic |
| Book drawer | Own `book-in`/`book-up` keyframes, `260ms cubic-bezier(.2,.8,.2,1)` | The system's `fp-in-right`/`fp-in-up`, `--dur-panel --curve-panel` |
| "Open now" pill swap, lightbox photo | `fp-pill-in` with `filter: blur(4px)`, `.35s` | Transform and opacity only, `--dur-panel --curve-out`; the pill holds its line under Pause motion |
| Boarding pass: book | Stub tears for 380 ms, then the booking site opens | Booking opens on the click (32–60 ms measured); the tear plays as feedback |
| Boarding pass / gate row: step inside | Stamp held 240 / 260 ms before the page | One panel beat (260 ms) for both, from the token |
| Page changes | Every navigation crossfades 550 ms | Root crossfade `--dur-fast` (200 ms); the room card morph `--dur-panel` (260 ms) |
| Passes dropping in | 650 ms, stagger 140, two overshoot strengths | `--dur-story`, stagger 2× token (120 ms), one overshoot (`EASE.animeThud`) |
| Comic panels and bubbles | `.6s ease` / `.7s`, bubbles `.45s` at 1.6 overshoot | Panels `--dur-story --curve-out` rising `--rise`; bubbles land `--dur-panel --curve-stamp` |
| Goodbye bill | `.9s`, `1s`, receipt `1.5s` after `.45s` | `--dur-story --curve-panel`; receipt `--dur-story-long` in 12 steps after one panel beat |
| Lights on, lamp halos | `2.6s ease`, halos `2.6s` + `0.25s` per lamp | `calc(var(--dur-story-long) * 2)` `--curve-in-out`, one `--dur-panel` per lamp (the documented slow fade) |
| Voyage stamp, punch, sea note, postcard | `.35s/.55s`, `.3s`, `.5s`, `.45s/.6s` | fast/panel-stamp, fast-stamp, panel, story |
| Gate rows, pull switch, passport stamp, social links, menu chips, dish and room photo zooms, phone dock, header Book | Assorted `.18s`–`.5s` | `--dur-fast` (hover/press feedback) or `--dur-panel` (dock travelling); press at `--dur-press` |
| Plate wall flip | `0.7s cubic-bezier(0.34, 1.45, 0.5, 1)` | `--dur-story --curve-stamp` |
| Hero title letters | literal 900 ms / `outExpo` / 45 ms | `MS.story`, `EASE.animeOut`, `STAGGER_MS * 0.75` (documented exception: ten letters, one word) |

Nine per-component `prefers-reduced-motion` overrides were deleted where the tokens (0 ms in calm mode)
and the global safety net already cover them.

### Kept as they were (and why)

- The two scroll-driven scenes (doors, voyage): they tell the story, write only transforms and opacity
  once per frame, and are still pictures in calm mode.
- The arrival board (first visit only, 1.5 s, skippable by any input) and the lamps warming up: the two
  documented exceptions to the two-speed rule.
- The vendored kokonutui pieces (page-flip book, split-flap boards, marker pen): mechanical timings of
  their own, each honouring reduced motion.
- The plate wall's one-off wave on first sight: it shows the plates can be turned.

## Scripted check (`check.mjs`)

Pages `/`, `/soho/`, `/covent-garden/`, `/our-story/` at 390 (touch) and 1440 px, WebGL off as in
`perf-budget.mjs` (headless software WebGL would drown everything else), returning-guest state so the
arrival board does not play.

Full motion, 4× slower CPU, scrolled top to bottom one step per frame:

| Page | Long frames (> 34 ms) at 390 / 1440 | Before this phase |
|---|---|---|
| `/` | 10 / 33 | 20 / 34 |
| `/soho/` | 0 / 0 | – |
| `/covent-garden/` | 0 / 12 | – |
| `/our-story/` | 0 / 0 | – |

The home page's long frames are the voyage and menu book hydrating and the content-visibility sections
rendering as they are reached (worst single frame 620–680 ms), not animation work; the count is the same
as before this phase. The room pages and the story are clean.

Also checked, all passing on every page and width:

- The only loops left running after a full scroll are the known ones (`voyage-ping` on home); after
  Pause motion no infinite animation and no video is playing.
- Every `.fp-reveal` block has arrived by the bottom of the page.
- Booking from a pass: `window.open` is called 32–60 ms after the click (was 380 ms).
- Focus can land on a pass stub while the passes are still dropping in (controls usable during animation).
- With `prefers-reduced-motion: reduce`: no animation longer than 50 ms is running after a scroll, no
  reveal is armed, the arrival board is absent, and none of the story elements (chapter heads, comic
  panels, passes, voyage postcards, the bill) is left at opacity 0.
- No page errors in any run.

Re-run: `npm run build && npx astro preview --port 4321`, then `node docs/qa/phase8-motion/check.mjs`
(env `BASE`, `PAGES`, `MOTION`, `CHROME_PATH`). `results.json` holds the last run.

## Not covered

- Safari and Firefox (view transitions and `content-visibility` differ), real phones, and the feel of
  the timings on a 120 Hz screen were not tested; the numbers above are from headless Chromium.
- Lighthouse budgets (`scripts/perf-budget.mjs`) were not re-run; nothing in this phase changes what
  loads or when.
