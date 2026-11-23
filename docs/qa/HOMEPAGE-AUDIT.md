# Homepage audit: premium feel, Apple-smooth scroll, art direction

Date: 2026-11-23. Scope: `/` (src/pages/index.astro and every scene it mounts).
Method: live walk on the dev server (1440×900 desktop, 375×812 phone) plus three parallel code audits (hero/chrome, scroll scenes, lower page/design system).
Severity: **H** = visible defect or major jank, **M** = noticeable polish gap, **L** = refinement.
Measured live (dev build): CLS 0.001, LCP = `h1.hero-title` at about 530ms, 12 of 22 images have no `width` attribute, `scroll-padding-top` is `auto` under a 70px sticky header. Scroll FPS could not be measured: the preview pane throttled rAF. Run `scripts/perf-budget.mjs` on a prod build for real fps numbers.

**Status (23 Nov 2026, branch home-audit).** Every item was re-checked against the code after the door, premium and story passes.
- 24 were already done and 3 no longer apply (Doors was rewritten).
- About 64 were fixed in this pass.
- Deferred, needing new art, a creative call or the client: #1, #2, #4, #7, #8, #9, #12, and #93 (the review counts and sources).
- Deferred, needing their own pass: #51 (re-pinning every scene to hide the header) and #56 (a site-wide container width).
- Partly done:
  - #61: phones open the menu as a list. The book's text cannot reach 13px at phone width.
  - #74: the reduced-motion catch-all stays, because four hard-coded animations still rely on it.
  - #27: a first visit's intro now ends by about 2.2s (was 2.5–3s).

---

## Verdict

- **Creative / art: 6.5/10.** The concept is ownable: a journey from the arrival board to the boarding pass, with a hand-drawn voyage map, tiger doors and paper props. The execution reads as separate set pieces, not one artwork. There are too many metaphors, there is no single headline system, surfaces change with hard cuts, and there is no recurring motion signature.
- **Apple-smooth scroll: 5/10.** The pinned scenes map raw scroll progress (steppy on a wheel). Several layers repaint every frame: SVG camera transforms, filters on moving elements, the bar spotlight gradients. React re-renders during scroll, and anchor jumps land under the header.
- **Premium polish: 6/10.** The design tokens are good, but two legacy systems run alongside them. Blurred shadows break the print rule. There are clipped labels and overlapping cards on phones, and the first-visit intro is too long.

## Top 10 to do first

1. `scroll-padding-top` + one `--header-h` token (#41, #42).
2. Smooth the scroll scrub with a spring or lerp on the Voyage camera (#21).
3. Kill the per-frame repaints in the Voyage SVG camera, the book filter and the bar spotlight (#22–#26).
4. Fix the phone voyage postcard overlap and clipped labels (#43, #44).
5. Shorten the arrival intro to about 1.2s (#27).
6. `scrollbar-gutter: stable` + one CSS scroll-lock rule (#45).
7. Route the boarding-pass stubs into the BookDrawer (#81).
8. Reduced-motion layout in CSS, not after hydration (#46).
9. A continuous surface/colour journey instead of hard cuts (#3, #29).
10. Make the menu book legible on phones (#61).

---

## A. Creative direction & art (1–20)

1. **H** Too many metaphors: departures board, window, doors, ship, book, bar, film contact sheet, airline pass and till receipt. Commit to the **voyage** and make every chapter a stop on it (stamps, passport, route line). Rework the contact sheet and the receipt to fit.
2. **H** There is no recurring motion signature, and every element fades up the same way. Let the **red route line** be the thread: it draws on through every chapter and terminates on the boarding pass.
3. **H** Surfaces cut hard (ink → sand → ink → sand halftone → gold → ink). Make lighting one continuous cue, night → dusk → dawn → gold, crossfading across the scroll (`animation-timeline: view()` bands between chapters).
4. **H** The hero undersells the art: a blurred room photo, a wordmark and a list. The strongest images (tiger doors, map, stamps) sit below the fold. Open on the tiger doors; the first scroll parts them to reveal the room.
5. **M** The doors look static at rest. Make the door-parting push the emotional climax: a slower ease, the room light spilling out, a sound-like visual "thud" when they open.
6. **M** There is no single headline system: "Turn the pages" and "Pull up a chair" use light typewriter type, "THE BAR" a heavy widely-tracked slab, and the goodbye a slab in caps. Pick one display treatment plus one accent and apply it to every chapter.
7. **M** The food is not the art. Dishes appear only as small thumbnails inside the book. Add one full-bleed dish interlude, such as the sizzling brownie with steam or momos, scrubbed on scroll.
8. **M** No breathing room between acts. Add 2–3 interludes: a full-screen Tangra quote, one dish, a moment of quiet ink.
9. **M** The tiger is drawn in four styles (doors, stamps, bar mark, wall painting). Treat it as a recurring character with intent, as `/our-story/` already does.
10. **M** Texture is inconsistent: grain and halftone appear on some surfaces only. Use one paper-grain and ink layer site-wide so it reads as printed matter.
11. **M** Instructional copy breaks the voice: "Swipe sideways or tap a page edge to turn", "Or read them as a list, with search and diet filters", "Tear off a stub to book". Put the affordance in the interaction and keep the copy poetic.
12. **M** The ending is diluted: boarding passes, then a receipt scene, then a dense footer. End on one image (the ship arriving, the stamp landing, "Your table is waiting").
13. **M** The voyage ends at Dubai with a hard cut. Pull back to the whole-route view as the payoff (the calm camera `camera(660,600,1080)` already exists; Voyage.tsx:60).
14. **M** The menu section is a control panel: branch toggle, list links, tabs and diet chips stacked above the book. The book is the art object, so move the controls into or beside it and quiet them.
15. **M** The voyage has no visible "01" chapter head, yet the menu is labelled "02" (Voyage.tsx:412-473). Add an "01 Our story" kicker on the ticket strip.
16. **L** On phones, chrome breaks the frame in the art moments: the preview banner, the header and the bottom dock take about 25% of the screen. Hide the dock and header while a scene is pinned.
17. **L** The room contact sheet feels generic next to the stagecraft. Grow the thumbnail into the lightbox with a shared-element view transition (RoomContactSheet.tsx:48-54).
18. **L** The junk flips direction instantly with `scale(-1 1)` (Voyage.tsx:162-166). Tween the turn so the ship steers rather than blinks.
19. **L** The bar is too dark at rest for keyboard and touch users, so the art is hidden (BarAfterDark.tsx:58-79). Light the room on `:focus-within` and give it a "Lights up" toggle.
20. **L** The X social icon is two crossed strokes, which reads as a close button (SiteFooter.astro:35). Use the real glyph.

## B. Scroll & motion: the Apple feel (21–40)

21. **H** The Voyage camera maps raw `scrollYProgress` (Voyage.tsx:293-295), so wheel notches step the camera, ship and zoom. Feed it from `useSpring(scrollYProgress,{stiffness:200,damping:40})`, or a frame-rate-independent lerp `1-exp(-dt*k)`.
22. **H** The Voyage camera `<g>` holds the mountain and compass bitmaps and gets a new transform every frame (Voyage.tsx:321-325). SVG child transforms are not composited, so the SVG re-rasterises each frame. Bake the mountains and compass into the sea raster; keep only the route, ports and ship in the SVG.
23. **H** The MenuBook has a `drop-shadow` filter on the page-flip ancestor (MenuBook.tsx:487), and page-flip animates `drop-shadow()` per frame (kokonutui/page-flip.tsx:625). Use a static shadow layer.
24. **H** Page-flip calls `setTurn` on every animation frame, so the whole book re-renders and clip-paths are recomputed (page-flip.tsx:292-295). Write clip-path and transform to refs instead.
25. **H** The bar spotlight rAF writes `--lx/--ly` every frame even when still, repainting two full-stage radial gradients; on touch the loop never stops (BarAfterDark.tsx:45-56, global.css:514). Use an oversized gradient div moved by `translate3d`, and stop at rest.
26. **H** The Doors `.camera` has a permanent `will-change` and scales to 2.6×, so the photo and tigers go soft during the push (Doors.astro:64,158). Set will-change only while pinned, or lay out at the final size and scale down.
27. **H** The first-visit intro is sequential: flaps, beat, thud, jolt, fade, shutter, title rise. The hero is readable only after about 2.5–3s (Arrival.astro:94-102, HomeHero.astro:69-74). Overlap the steps and cap at about 1.2s.
28. **M** `setPort/setLeg/setReached` re-render the whole Voyage mid-scroll (Voyage.tsx:179-202). `React.memo` the SVG and Postcards, and toggle classes through refs.
29. **M** Hard colour cuts: menu sand → bar ink (MenuBook.tsx:388 → BarAfterDark.tsx:89), voyage → ink band → sand (index.astro:160). Add dusk gradient bands on a `view()` timeline.
30. **M** The Doors scroll callback writes 9 inline styles per frame from JS (Doors.astro:152-171). Move them to CSS `animation-timeline: view()` with a JS fallback.
31. **M** The infinite `voyage-ping` scale on an SVG circle repaints the whole SVG at 60fps while idle (global.css:394). Use an HTML overlay element, or ping only at rest.
32. **M** Port holds are only 10–14% of the track, so a flick skips past the postcard (Voyage.tsx:53-61). Add proximity scroll-snap markers at the holds, or lengthen them.
33. **M** The sea note is remounted through `key={leg}`, so its fade never runs (Voyage.tsx:382). Use one stable `<p>` and toggle `is-on`.
34. **M** The menu book remounts from cover to spread after hydration, a visible pop (MenuBook.tsx:329-331). Hydrate earlier with `rootMargin:'100% 0px'`.
35. **M** Book pagination runs three times (estimate → layout → fonts.ready), so text reflows in view (MenuBook.tsx:170-193). Paginate at build, or fade in after the measure.
36. **M** Changing the menu tab or room hard-cuts the book through `key` (MenuBook.tsx:488). Crossfade with `startViewTransition`, or play a riffle.
37. **M** The reveal system has no stagger (reveal.ts:13-22), and the menu and bar heads have no `fp-reveal` at all. Add a `--i`-based stagger and reveal every chapter head.
38. **M** `data-reveal` is set after first paint, so on-screen blocks paint, vanish, then rise (reveal.ts:11). Set it in the Base head inline script.
39. **M** Boarding passes animate on one IntersectionObserver for the whole grid. On phones passes 2 and 3 stamp offscreen (BoardingPasses.astro:133-160). Observe each pass separately.
40. **M** The arrival stamp "thud" uses `inOutQuad` and reads as a pulse (Arrival.astro:94). Use the existing `SPRING.stamp`. Related: the bookmark tabs animate `padding` (MenuBook.tsx:477); animate `translateY` instead. The hero title's text-shadow pops back on in one step (HomeHero.astro:64,77).

## C. Layout, viewport & scroll mechanics (41–60)

41. **H** No `scroll-padding-top` (confirmed live: every section's `scroll-margin-top` is 0 under a 70px sticky header). ChapterRail jumps, `#tables` and skip links all land under the bar. `html { scroll-padding-top: calc(var(--header-h) + 16px) }`, then delete the ad-hoc scroll-margins in menu.astro, InfoPage and private-dining.
42. **H** The header height is hard-coded as 72, 68 and `offsetHeight ?? 72` across Doors, HomeHero, SiteHeader and Voyage (`top-[68px]`). Set one `--header-h` from a ResizeObserver on `.bar`.
43. **H** Phone voyage: the Stop 2 postcard stacks over Stop 1 with text bleeding through (seen live at 375px). Fade out the outgoing card fully and cap it with an overflow mask (global.css:416).
44. **H** Map labels are clipped or collide: "Guangdo…" at the right edge on phone, "Calcutta" under the postcard on desktop, "Hong…" cut, and the ticket strip clipped horizontally on phones. Clamp labels inside the stage, and on phones show only the current port plus punched holes.
45. **H** Scroll lock via `overflow:hidden` (Arrival, lightbox) shifts the page by about 15px. Add `html { scrollbar-gutter: stable }` + `html:has(dialog[open]) { overflow:hidden }`; this also fixes the BookDrawer, which doesn't lock scroll at all.
46. **H** Reduced-motion layout comes from JS after hydration: Voyage collapses 340vh → auto, a big shift that moves every anchor below it (Voyage.tsx:226-232). Put the calm layout in `@media (prefers-reduced-motion)`. Do the same for the bar veil and captions (BarAfterDark.tsx:116,123).
47. **H** The hero is `min-height:100svh` below the preview flag and sticky bar, so it is about 100px too tall. The CTA and menus link fall below the fold (HomeHero.astro:87). `calc(100svh - var(--header-h))`.
48. **M** vh/svh mismatch: Voyage track `340vh` with a `svh` stage, Doors `140vh` with a `100svh` stage. Pin distances drift as the iOS URL bar moves. Use svh on both.
49. **M** `content-visibility:auto` with a 900px placeholder on `#room`, `#tables` and the footer makes first-visit anchor jumps land off-target and the scrollbar thumb jump (global.css:560). Set real intrinsic sizes, or drop it from `#tables`.
50. **M** The chapter rail overlaps the footer and the boarding-pass edge (seen live). Fade the rail out once the footer enters.
51. **M** The sticky header never compacts or hides, costing 72px in every pinned scene. Hide on scroll down and show on scroll up with a transform.
52. **M** No `viewport-fit=cover`, so the safe-area insets used by the dock, Doors and Skip resolve to 0 (Base.astro:34).
53. **M** The `html` background is sand while home opens on ink, so iOS rubber-band shows a sand band (global.css:58). Make it ink on home and add a `color-scheme` meta.
54. **M** The DishPassport floating button sits under the phone dock (DishPassport.astro:32). Offset it by `--dock-h` + safe area.
55. **M** `.pass-boarding` uses a magic `top:112px` and collides with "Covent Garden" at narrow widths (BoardingPasses.astro:252). Make it a grid item.
56. **M** Two containers: `.wrap` 1240 and `--grid-max` 1320, with different gutters, so edges don't line up (site.css:3, tokens.css:49). Unify them.
57. **M** The room grid uses an off-system 1100px breakpoint and `clamp(32,4vw,64)` gap (index.astro:227). Use the 1024 `.desk` grid and `--grid-gutter`.
58. **L** The lightbox uses `100svh` while other dialogs use `dvh` (global.css:546). Make them consistent.
59. **L** The BookDrawer has nested `overflow-y:auto` containers, which can show a double scrollbar (BookDrawer.astro:102,115).
60. **L** OpenNowPill reserves height but not width, so it grows sideways when the times arrive (OpenNowPill.tsx:38).

## D. Typography & design system (61–75)

61. **H** Phone menu book type is around 7–9px: descriptions 3.3cqw ≈ 8.6px, tags ≈ 6.8px (MenuBook.tsx:129-153,487). Use the full width (~92vw) and `max(13px, 3.3cqw)` floors, or default to the list view on phones.
62. **M** Global `letter-spacing: 0.05em` tracks all body copy (global.css:61). Use 0.01em for running text; keep 0.05em for labels.
63. **M** Global `-webkit-font-smoothing: antialiased` thins the 300-weight typewriter on light surfaces (global.css:62). Scope it to dark surfaces.
64. **M** A legacy scale runs in parallel: `.stack/.stack-lg/.sec/.kicker/.note/.h2` in site.css. Map it onto `--space-*` and `--step-*` and delete the leftovers.
65. **M** Blurred shadows everywhere (GateBoard `0 20px 50px`, room strip, bill, bar prints, pass `drop-shadow`) break the system's "elevation is a hard offset" rule. Use `--lift-*`, or add one `--shadow-photo` token.
66. **M** Hero supporting lines use fixed 19/17/16px against a fluid title, so the ratio collapses on phones (HomeHero.astro:93-102). Use the step tokens.
67. **L** `text-wrap` is set on only three classes. Add `:where(h1,h2,h3){text-wrap:balance}` and `:where(p,li,dd){text-wrap:pretty}`.
68. **L** The 64px "4.8" rating uses tabular figures, so it looks gappy. Use proportional lining figures for display numbers.
69. **L** No `::selection` style, so the default blue shows on ink and gold. Use gold on ink.
70. **L** Odd room thumbnails are rotated -0.3deg, which resamples and softens the photos (global.css:528). Rotate the frame chrome only.
71. **L** The stamp uses `--curve-spring` with `--dur-panel`, against the token rule (BoardingPasses.astro:254).
72. **L** MOTION.md says "two speeds" while tokens define six. Align the doc with the code.
73. **L** Unused `DURATION` and `EASE.animeThud` in motion-tokens.ts, and `MS` duplicates `DURATION`.
74. **L** The reduced-motion `* {0.01ms !important}` nuke duplicates the token zeroing and overrides end states (global.css:435).
75. **L** Thumbnail hover zoom is 200ms (twitchy) and not gated to `(hover:hover)`. The same sticky-hover issue affects GateBoard rows (GateBoard.astro:106,116).

## E. Imagery & performance (76–90)

76. **H** One 3200px AVIF sea (~31 MB decoded) for every device, which is still upsampled at the closest zoom (index.astro:85). Ship 1600/2400/3200 variants chosen by fit×DPR, plus close-up crops for the port holds.
77. **H** `ArrivalBoard client:load` hydrates React for everyone, even returning guests who never see it (Arrival.astro:30). Load it with a dynamic import on the play path only.
78. **H** The arrival stamp is preloaded at high priority with `decoding="sync"` for every visitor, competing with LCP (Arrival.astro:24,32). Preload it only when the arrival plays.
79. **H** Doors photo `sizes="100vw"`: too big at rest, too small at the 2.6× push (Doors.astro:18). Set `sizes` to the zoomed width and add a 2800w cut.
80. **M** The hero still is a single 640w q60 image stretched full-screen at `scale-105`; it is the LCP image and looks mushy on large screens (index.astro:77). Add a 640/1280 srcset.
81. **M** The rain canvas DPR is capped at 1 on phones, so the drops look soft next to crisp text (rain-glass-background.tsx:560). Cap at 1.5–2 with frame-time fallback.
82. **M** RainHero swaps the whole subtree, so the hero can flash one ink frame as the shutter opens (RainHero.tsx:29-37). Keep the still persistent.
83. **M** The lightbox full image has no srcset, size or preload, so each arrow press shows an empty frame (RoomContactSheet.tsx:123). Add srcset/sizes and preload ±1.
84. **M** Voyage mountain, compass and ship images decode on first paint mid-scroll (Voyage.tsx:318-325). Call `img.decode()` up front, as the sea already does.
85. **L** Bar room and prints are single sources (a phone downloads 1400w). Reuse the `thumbSet` srcset pattern.
86. **L** The same art is fetched twice at near-identical sizes: map 900/1000, stamps 280/220/300 (index.astro:82-125). One width per asset.
87. **L** The ship is 400px for a ~50px badge. 160px is enough.
88. **L** MenuBook Back-page images have no width, height, lazy or async; the signature photos have no srcset (MenuBook.tsx:264-290).
89. **L** `motion/react` is imported for one `useScroll`, and SplitFlap/MarkerText (~980 lines) ship in the Voyage island. Use a passive scroll listener plus rAF, and `React.lazy` the extras.
90. **L** LampHalos `mix-blend-mode: screen` with an infinite scale forces a re-blend per frame. LightsOn uses `getBoundingClientRect` per scroll frame. Both components are unused (#100).

## F. Interaction, conversion & content (91–100)

91. **H** The boarding-pass stubs (the main CTA) go straight to OpenTable/SevenRooms in a new tab and skip the in-site BookDrawer and its analytics (BoardingPasses.astro:96-100). Add `data-book`, play the tear, then open the drawer.
92. **H** anime.js leaves an inline `transform` on the passes, so the hover lift never works after they land (BoardingPasses.astro:143-150). Clear it on complete.
93. **H** The rating copy is hard-coded, mixes exact and rounded counts and has no source link (index.astro:179). Move it to site-data with a source and `checkedAt`, and link to the listings.
94. **M** Each pass has five equal-weight actions, which buries booking. Make the stub primary and "Step inside" secondary, and fold Call and Menu into one muted row.
95. **M** The hero has seven stacked tiers. Cut to three: drop the board caption, and show "Wipe the glass" once after about 3s idle.
96. **M** Artificial navigation waits: GateBoard 260ms (GateBoard.astro:85-91), "Step inside" 260ms, and the stub opens the new tab before the tear plays. Navigate at once and let view transitions carry the stamp.
97. **M** The lightbox won't close on a backdrop click, because the figure covers the dialog (RoomContactSheet.tsx:111,122).
98. **M** The footer is dense with no hierarchy. Mute secondary rows, set legal at `--step-fine`, and add space between groups.
99. **M** Accessibility: hidden ChapterRail dots stay in the tab order (use `inert`). MenuBook tabs have no roving tabindex or tabpanel. The wipe hint is announced to users who can't wipe. The Doors opener has no heading. The lightbox changes aren't announced (aria-live). Pass links are 32px, under the 44px target. Social new-tab links have no hint.
100. **L** Code hygiene: LightsOn.astro and LoopVideo.astro are unused. GateBoard has duplicate `@media` blocks and a clock not aligned to the minute. NextStep has a hard-coded id and `!important`. ChapterRail has a double resize listener. Voyage has an unstable ref callback. Four dialogs hand-roll animations that duplicate `.fp-dialog--*`. The tables note shows `branches[0]` group rules as if they apply to every room. Passport "Clear" has no undo. Check that Plausible doesn't double-count on prerender.
