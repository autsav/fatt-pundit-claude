# Motion design: research and implementation plan (21 Nov 2026)

What the field says about motion on the web in 2026, measured against what this site already does
(`docs/MOTION.md`, phase 8), and a plan for the gap. The short version: the principles are already in
place; the work is (1) adopting three platform features that have become usable this year, (2) giving
the signature moments physical weight with springs, (3) the story page once the art arrives, and (4)
measuring interaction latency, not only scroll.

## 1. Research findings

### 1.1 Principles: what the strongest sources agree on

| Source | Guidance | Where we stand |
|---|---|---|
| Emil Kowalski, *Great animations* | Natural (ease-out for feedback), fast (usually under 300 ms), purposeful, performant (transform/opacity only; CSS or WAAPI when the main thread is busy), **interruptible**, accessible, and "never animate keyboard-initiated actions". | Met, except interruptibility is untested: a drawer closed while opening, a plate re-tapped mid-flip. |
| Nielsen Norman Group, *Animation duration*, *Animation purpose* | Purpose first; the more often an animation is seen, the subtler and shorter; 200–300 ms for large changes such as a sheet arriving; motion is feedback, not entertainment. | Met: fast 200 / panel 260 / story 900 (once). |
| Apple HIG, *Motion* (updated for Liquid Glass, Sep 2025) | Add motion purposefully, make it optional, keep feedback realistic, avoid motion at the edges of the field of view; Liquid Glass objects appear by changing refraction, not by fading. | Met. The "edges" point argues against the rain intensifying at viewport edges. |
| Material 3 Expressive (2025) | Replaced duration + easing with a **motion physics system**: spring tokens split into *spatial* (movement, may overshoot) and *effects* (colour/opacity, never overshoot), each fast/default/slow; CSS gets published cubic-bezier equivalents. | Partly: we have five curves and three springs (`SPRING.door/stamp/ui`) but no spatial-vs-effects rule, so an overshoot curve can land on an opacity change. |
| WCAG 2.3.3 (AAA) and 2.2.2 (A) | Interaction-triggered motion must be disableable; looping or auto-playing content needs a pause control; the OS `prefers-reduced-motion` is the primary technique, an in-page toggle is recommended too. | Met (three-layer reduce, Pause motion). One caution from the literature: setting every duration to 0 "passes the audit and quietly kills the confirmation signal". Our state changes keep a `role="status"` line, so the signal survives as text. |
| Hospitality conversion writing (agency sources, no controlled studies found) | No evidence that animation raises bookings; evidence that **delaying the primary action** (menu or Book behind a scroll video) hurts. Primary action next to the hero visual. | Met: Book is on the first screen on every page; links never wait. |

### 1.2 Platform: what changed in 2025–26

| Feature | Support (caniuse / MDN, Nov 2026) | Use for us |
|---|---|---|
| **CSS scroll-driven animations** (`animation-timeline: scroll()` / `view()`) | Chrome 115+, Edge 115+, Safari 26+ (threaded off the main thread from 26.4), Firefox 159+ (Oct 2026). 89 % global. Baseline as of Oct 2026. | Scroll-linked effects that are one property on one element (the chapter rail's reading line, the "Lights on" dusk, the hero's settle) can leave JavaScript entirely and run on the compositor. The voyage camera stays in JS (two layers, a route overlay, a parked end state). |
| **Cross-document View Transitions** | Chrome 126+, Safari 18.2+ (sources conflict; verify in Safari release notes), Firefox: same-document since 144, cross-document not shipped. Interop 2026 focus area. | Already used (`@view-transition`, `branch-*` names). Keep as progressive enhancement; nothing to add until Firefox ships. |
| **`@starting-style` + `transition-behavior: allow-discrete`** | Chrome 117+, Safari 17.5+, Firefox 129+. | Entry **and exit** transitions for `<dialog>` and `[hidden]` with plain CSS transitions. Our dialogs animate in with keyframes and close instantly: asymmetrical. |
| **`linear()` easing** | Chrome 113+, Safari 17.2+, Firefox 112+. | A real spring curve in CSS (pre-sampled, not simulated), gated by `@supports`, with the cubic-bezier as fallback. Replaces the overshoot approximation `--curve-stamp`. |
| **`interpolate-size: allow-keywords`** | Chrome 129+, Safari 26+, Firefox behind flag. | `height: auto` transitions for the phone menu picker, the header Menus `<details>`, and the drawer's group route, without JS measuring. Progressive: unsupported browsers snap, as now. |
| **Web Animations API** | Everywhere. | Already used by the split-flap board. The route for any remaining JS-driven movement that must keep running while the main thread is busy. |

### 1.3 Libraries

- **GSAP** became free under Webflow in April 2025, but under GSAP's own licence (revocable, bars
  Webflow competitors), not MIT. Its strength is long timelines and ScrollTrigger. **Do not add it**:
  the site has anime.js v4 (timelines, springs, MIT) and Motion (springs, `scroll()`, React, MIT),
  and the direction of travel is *less* JavaScript, not a third engine.
- **Motion** v14 and **anime.js** v4 stay for what CSS cannot do: choreographed timelines (arrival
  board, hero letters), spring physics on React islands (menu book, voyage), the passes dropping in.
- **Rive vs Lottie** (for illustrated motion, i.e. the story page and the tiger): Rive for motion that
  *responds* (state machines, GPU-rendered, flat overhead with many instances); Lottie for motion that
  only *plays*. Independent 2026 benchmarks are thin; the one measured comparison (Callstack) put Rive
  near 60 fps against Lottie at 17 fps on a complex file. Decision deferred to the illustrator's output
  (section 2, M3). Simple line art is better as inline SVG with stroke draws, which we already do.

### 1.4 Performance

- INP target 200 ms at the 75th percentile (web.dev, Sep 2025). Animate `transform` and `opacity`
  only; `will-change` only on layers that are always about to move, added just before and removed
  after otherwise; update the UI first, then yield (`requestAnimationFrame` → `setTimeout`) for
  non-critical work; avoid reading layout after writing styles in the same task; `content-visibility`
  for off-screen sections. The site follows all of these; what it does not yet **measure** is INP.
- The home page's long frames (phase 8/10: 31 at 1440 px) are hydration (menu book, voyage) as the
  sections are reached, not animation. Scroll-driven CSS removes a little JS per frame; the real
  fix is moving the voyage route overlay to a transform-only layer (open in `tasks/todo.md`).

### 1.5 Patterns from award sites, filtered by our principles

Awwwards' restaurant category (GEM, White Desert, Dishoom's per-location myths) and the 2026
round-ups share four moves: a cinematic first screen, scroll storytelling with pinned scenes, menus as
objects (sheets, books, cards), and one memorable interaction per page. We have all four. What they also
share and we should **keep refusing**: smooth-scroll hijacking (Lenis-style), cursor followers,
parallax for atmosphere, text that drifts in on every scroll, loaders over 1 s. Each of those costs
INP or vestibular comfort and none has evidence of helping a booking.

## 2. Plan

Each phase ships on its own, keeps `docs/MOTION.md` the single reference, and ends with the phase 8
check (`docs/qa/phase8-motion/check.mjs`) and the perf budget green. Effort is desk-estimate days.

### M1. Platform foundations (2 days, low risk)

1. **Spring curve token.** Add `--curve-spring` as a sampled `linear()` spring (stiffness 420,
   damping 22, mass 1.1, the existing `SPRING.stamp`), inside `@supports (transition-timing-function:
   linear(0, 1))`, with `--curve-stamp` as the fallback value declared first. Apply to stamps, the
   lifted button, bubbles, the rail dot, the passport bump. `motion-tokens.ts` gains the same spring
   so Motion and CSS land identically.
2. **Spatial vs effects rule** (from M3 Expressive): overshoot curves (`--curve-stamp`,
   `--curve-spring`) may only drive `transform`; colour and opacity use `--curve-out`. Add the rule to
   `docs/MOTION.md`; grep `components.css` and the scenes for violations (expected: a few hover lifts
   that pair opacity with the stamp curve).
3. **Symmetrical sheets.** Book drawer, Index, Menus sheet, passport dialog, lightbox: replace the
   open-only keyframes with `transition` + `@starting-style` + `transition-behavior: allow-discrete`
   on `display` and `overlay`, so each closes the way it opened (`--dur-panel`, `--curve-panel` in,
   `--curve-in` out). `dialog.close()` then needs no JS wait. Reduced motion: unchanged (0 ms).
4. **Auto-height transitions.** `interpolate-size: allow-keywords` scoped to the phone menu picker,
   the header `<details>` and the drawer's group route. Unsupported browsers snap as today.
5. **Scroll-linked in CSS.** Behind `@supports (animation-timeline: view())`: the chapter rail's
   reading line (`scaleX` on a `scroll()` timeline), the "Lights on" dusk (`opacity` on a `view()`
   timeline), the room hero's settle. The JS paths stay as the fallback for the 11 % without support;
   delete them when Firefox 159+ and Safari 26 are the floor.

Acceptance: check.mjs shows every dialog with an exit animation and nothing running after Pause;
`npm run perf:budget` unchanged or better; no new literal durations outside `kokonutui/`.

**Done 21 Nov 2026**, with three departures from the plan above, each forced by the platform:

- Exits are transitions behind `@supports (overlay: auto)` and the keyframe entries stay. `overlay` is
  Chromium-only (MDN, Nov 2026) and Firefox accepts `allow-discrete` without transitioning `display`,
  so a `@starting-style`-only rewrite would have lost the entry in Safari < 17.5 and shown a closing
  dialog in-flow in Firefox and Safari. Chromium gets the symmetrical exit; the others close at once.
- The scroll-timeline rules live in `global.css`, not the components: Astro's scoped-style pipeline
  emptied `animation` + `animation-timeline` declarations nested in `@supports`/`@media` (verified in
  the built CSS). Written as longhands. The hero "settle" did not exist as a per-frame effect; nothing
  to move.
- The drawer's group route uses `grid-template-rows: 0fr → 1fr` with an inner wrapper: `height: auto`
  does not interpolate for a flex item in Chromium even with `interpolate-size`. The phone picker and the
  Menus `<details>` keep `interpolate-size`, both behind `@supports (interpolate-size: allow-keywords)`
  so other browsers snap rather than flip 130 ms late.

Measured: every dialog on 5 pages × 2 widths exits with 2–3 running transitions and is gone within
700 ms; the reading line and the dusk run on CSS timelines with no script write; the picker unfolds
256 → 541 px and the group route 46 → 177 px over the panel beat and fold back before `display: none`.
Perf budget: home 84–85 / CLS 0–0.04 (font swap noise, as phase 10) / jank 3.2 % (open item, M4);
room pages 95–100. Not better, not worse.

### M2. Weight on the signature moments (3 days, medium risk)

Each page has one object the guest touches; give each real physics and test interruption.

| Moment | Today | Change |
|---|---|---|
| Boarding passes dropping in (home) | anime.js `outBack(1.6)`, stagger 2× | Spring (`SPRING.stamp`), tear-off and grow-back use the same spring; focus and click work mid-drop (already) |
| Menu book page turn | vendored page-flip timing | Spring-driven turn with velocity from the swipe; a turn can be reversed mid-flight; tabs stamp with `--curve-spring` |
| Plate wall flip | `--dur-story --curve-stamp` | `SPRING.ui` so a second tap mid-flip reverses instead of restarting; price fades (effects curve) while the plate turns (spatial) |
| Book drawer +/− and chips | fast colour change | Press (`--dur-press`) then spring settle; `[data-book-size-said]` already announces |
| Passport stamp | CSS bump keyframe | Spring scale + rotate, the floating button receives the stamp with a small settle; share sheet unchanged |
| Lights-on pull switch | plays the clip | Chain gives a short spring pull (transform only) before the clip |
| Header Book stamping in | `--dur-fast --curve-stamp` | `--curve-spring`; verify it never covers the hero's Book during the swap |

Interruptibility test added to check.mjs: open then close the drawer within 100 ms, flip a plate
twice within 300 ms, turn a page and turn back; assert no element ends mid-state and no error.

**Done 22 Nov 2026.** Passes drop on anime.js `createSpring(animeSpring(SPRING.stamp))` (anime takes
the duration from the spring; opacity fades on the out-curve, separately), the stub grows back on the
same spring. The page turn runs `SPRING.door` (ζ ≈ 0.98, so paper never passes its rest) with the hand's
speed as `velocity` (drag: smoothed px/s projected on the path; swipe: dx over the press time), settles
on `SPRING.ui`, and a turn in flight can be caught by a press, dragged back, or reversed by the opposite
button, key or swipe (`reverse()` in `page-flip.tsx`; the opposite nav button stays enabled while a turn
is heading somewhere). Plate flip: `--curve-spring` on the transform, price fades on the out-curve
after the turn; a CSS transition already reverses from where it is. Drawer chips and +/−: press beat
on `:active`, spring back, the chosen chip and the number stamp in. Passport stamp: press beat added
(spring was M1). Lights pull: chain `scaleY`, knob `translateY`, out-curve down and spring back
(was `height`/`top`). Header Book: probe confirms it never overlaps the hero's Book during the swap
(flips at 850 px, hero Book already clear). The `interrupt` block in check.mjs passes on 5 pages × 2
widths; the first run caught the disabled-button gap on page 1 at phone width.

### M3. The story page (after the illustrator; 2–4 days)

Decide the format from the delivered art, in this order of preference:

1. **Inline SVG** line art with stroke draws (`pathLength: 1`, `--dur-story-long`): matches "physical,
   not atmospheric", no runtime, works in calm mode as finished drawings.
2. **Rive** for at most two responding elements (the tiger's eyes following the pointer on the cover,
   the wok flare on tap), loaded on interaction, with a still PNG poster for calm mode and no-JS.
3. **Lottie** only if the illustrator delivers After Effects and nothing interactive is wanted.

Panels keep the phase 8 rise-and-bubble choreography; a chapter's panels reveal on a `view()`
timeline so they arrive with the scroll rather than on an observer tick.

**Part done 22 Nov 2026** (the part that does not need the art): every panel rises on a CSS `view()`
timeline, `entry 0%` to `entry 60%` (global.css "Story panels"; opacity 0.02 → 0.38 → 0.67 → 0.97 → 1
as the panel climbs the screen, 13 panels, both widths), the bubbles still stamp on `.is-in` from the
observer, nothing is left hidden at the end. The format decision (inline SVG, Rive, Lottie) waits for
the illustrator (`tasks/todo.md` #49).

### M4. Scroll cost on the home page (2 days, ties to the open todo)

Rebuild the voyage route overlay as a transform-moved layer (no per-frame `viewBox`), move the sea
chart and ship to `will-change: transform` only while the section is pinned, and hydrate the menu book
on the first pointer or key event instead of `client:visible`. Target: home long frames under 2 % at
4× CPU on both widths, measured by `check.mjs` and `perf-budget.mjs` before and after on the same
machine in interleaved runs.

**Part done 22 Nov 2026; target not met.** Measured first (phone 390 × DPR 2, 4× CPU, the budget's
method, with layers hidden one at a time): with the voyage hidden the page scrolls at 0.3 % long frames,
with it 1.3–2 %; and the voyage's cost was one 550–780 ms frame at the first scroll, not the frame loop.
A `longtask` observer put it on the wake-up: 1,443 `getPointAtLength` calls in the hydration effect,
750 ms at 4× CPU. Done: the legs are sampled in `requestIdleCallback` slices (240 a leg, a leg reached
early asks the path per frame), the wake-up frame is now 220–300 ms (React's own hydration of the SVG);
the camera moves a `<g>` by transform instead of writing a viewBox (no layout per frame; no measurable
raster change, raster was the per-frame cost); the ship lost its two filters (hard offset shadow circle,
hull as an alpha mask of the art), as the performance rules require; the chart's `will-change` is on
only while the section is pinned. Not done: the budget's dropped-frame figure for home is still
3.5–3.7 % (one run 9.3 %; 3.2 % before, so within noise, no regression). The menu book's hydration
was measured at 0–3 long frames and left on `client:visible`. The per-frame remainder is raster of the
overlay (labels with `paint-order: stroke`, mountain and compass images) and the chart re-rastering as
its scale changes; the next step is to bake the static overlay into the chart image and keep only the
route, ports and ship in the SVG. `tasks/todo.md` keeps the item.

### M5. Measure interaction, not just scroll (1 day)

- Add a Lighthouse user-flow (or a Playwright timing) for the five taps that matter: Book from the
  dock, a plate, a page turn, a menu chip, a passport stamp. Report the input-to-paint time; budget
  200 ms at 4× CPU.
- Field: once `PUBLIC_PLAUSIBLE_DOMAIN` is set the "Vitals" event already carries INP; read it at p75
  after the first week and compare to the lab figure.
- `docs/MOTION.md` v2: the spatial/effects rule, the spring token, exit transitions, the scroll-timeline
  rule ("one property, one element, CSS; anything else, JS once per frame"), and the interruption test.

**Done 22 Nov 2026.** `scripts/tap-timing.mjs` (`npm run perf:taps`): real Playwright clicks, the Event
Timing API's `duration` (input timestamp to next paint, INP's measure), 4× CPU, median of three, budget
200 ms. First run found Book from the dock at 104–496 ms (median 248): the click handler drew the 21 day
chips and the times before `showModal()`. The drawer now draws the likely room at idle after load and
redraws only for another room or a new day; a reopened drawer keeps the guest's day. Final run, medians:
Book from the dock 64 ms, a plate 56, a page turn 40, a day chip 32, a passport stamp 72; all ok.
`docs/MOTION.md` carries the rules (Performance rules, Adding motion 7–8, Vendored components); the
field INP note is in `docs/HANDOVER.md` "Keeping it fast".

### Sequence and dependencies

M1 → M2 (M2 uses the spring token and symmetrical sheets). M4 is independent and can run first if the
scroll budget is the priority. M3 waits for the client (`tasks/todo.md` #49). M5 last, but the
Playwright timing probe can be written during M1 so M2 is measured from the start.

### What this plan deliberately leaves out

Smooth-scroll libraries, cursor effects, parallax backgrounds, a fourth animation library, autoplaying
hero video, loaders beyond the arrival board, motion that delays a link or the booking. Every one
contradicts a principle in `docs/MOTION.md` and none has evidence of helping a restaurant's bookings.

## Sources

Principles: [Emil Kowalski, Great animations](https://emilkowal.ski/ui/great-animations) ·
[NN/g, Animation duration](https://nngroup.com/articles/animation-duration) ·
[NN/g, Animation purpose](https://www.nngroup.com/articles/animation-purpose-ux/) ·
[Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion) ·
[Material 3, Motion: how it works](https://m3.material.io/styles/motion/overview/how-it-works) ·
[Material 3, Easing and duration tokens](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs) ·
[W3C, Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) ·
[A11yPath, Motion and animation](https://a11ypath.com/guides/motion-and-animation/).
Platform: [caniuse, animation-timeline](https://caniuse.com/mdn-css_properties_animation-timeline) ·
[DEV, Scroll-driven animations are Baseline](https://dev.to/richicodes/scroll-driven-animations-are-baseline-at-last-3c8g) ·
[caniuse, View Transitions](https://caniuse.com/view-transitions) ·
[MDN, Using the View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) ·
[MDN, transition-behavior](https://developer.mozilla.org/docs/Web/CSS/transition-behavior) ·
[Carmen Ansio, @starting-style](https://www.carmenansio.com/articles/css-entry-exit-animations/) ·
[Carmen Ansio, Springs with linear()](https://www.carmenansio.com/articles/spring-physics-css/) ·
[Google, Physics-based easing guide](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/ui-behaviors/physics-based-easing.md).
Libraries: [motion.dev, GSAP vs Motion](https://motion.dev/docs/gsap-vs-motion) ·
[ICS Media, Comparing animation libraries](https://ics.media/en/entry/14973/) ·
[LogRocket, React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) ·
[Callstack, Lottie vs Rive](https://www.callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation) ·
[LottieFiles, LottieFiles or Rive](https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive).
Performance: [web.dev, Optimize INP](https://web.dev/articles/optimize-inp) ·
[web.dev, Animations guide](https://web.dev/articles/animations-guide) ·
[webperf.tips, Animate on the compositor thread](https://webperf.tips/tip/animate-on-compositor-thread/).
Hospitality: [Awwwards, Hotel & Restaurant](https://www.awwwards.com/websites/hotel-restaurant/) ·
[Toimi, Best restaurant website designs 2026](https://toimi.pro/blog/best-restaurant-website-designs/) ·
[Do fancy animations hurt conversions](https://www.websitedesignerwix.com/post/do-fancy-website-animations-hurt-conversions) ·
[roast.page, Hero section statistics](https://roast.page/stats/hero-section-statistics).
