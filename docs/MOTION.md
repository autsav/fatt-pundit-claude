# Motion system

How things move on fattpundit.com, and why. Tokens live in `src/styles/tokens.css` (CSS) and
`src/lib/motion-tokens.ts` (the same values for anime.js and Motion); change both together.
The styleguide (`/styleguide/#motion`) shows them live.

## Principles

1. **Physical, not atmospheric.** Things stamp, slide, flip, drop and print. No drifting glows,
   no blur, no parallax for its own sake. Only `transform` and `opacity` animate (plus a few SVG
   stroke draws); never layout properties, filters or shadows.
2. **Two speeds, nothing in between.** *Fast* is feedback: the thing you touched answers in
   200 ms or less. *Story* is a reveal: 900 ms, once, as a scene comes on screen. *Panel* (260 ms) and *spring* (460 ms, with
   `--curve-spring`) are arrivals, not a third speed: a drawer, a sheet, a page change, a stamp
   landing. *Press* (60 ms) is the press down; *story-long* (1200 ms) a long mechanism.
3. **Motion never holds the guest up.** Links go on the click; a booking opens at once and the
   stub tears as feedback afterwards. A page change crossfades at feedback speed. Scroll is not
   hijacked: the two scroll-driven scenes (doors, voyage) are pinned sections the guest scrolls
   through at their own pace. By the owner's request, a notched mouse wheel is smoothed with Lenis
   (`src/lib/smooth-scroll.ts`); trackpad and touch stay native, and it is off under reduced motion
   and Pause motion. In-page jumps go through `scrollToEl`.
4. **Once, then still.** Reveals play the first time only. The only loops are the pulsing dot on
   the voyage, the breathing lamp halos and the rain, and the footer's *Pause motion* stops all
   of them (plus the loop videos and the cycling "Open now" line).
5. **Calm mode shows the finished state.** With `prefers-reduced-motion: reduce` every duration
   token is 0, scroll-driven scenes become still pictures of their end state, the arrival board
   never plays, and nothing is hidden waiting for a reveal.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--dur-press` | 60 ms | Press down (a button, a chip, a gate row) |
| `--dur-fast` | 200 ms | Hover lift, focus, colour change, an image zoom, a label sliding in |
| `--dur-panel` | 260 ms | A drawer or sheet travelling in or leaving; a pill line landing; a page change; the time a stamp is shown before a page opens |
| `--dur-spring` | 460 ms | How long the spring takes to be still. Always with `--curve-spring`: a stamp, bubble, lifted button or rail dot landing |
| `--dur-story` | 900 ms | A reveal in a scene: a block rises into place, a pass drops onto the counter, a plate turns, a cover swings |
| `--dur-story-long` | 1200 ms | A long mechanism: the receipt printing, the gold circle drawn round a photo |
| `--stagger` | 60 ms | Between siblings in a sequence; at most 6. Big objects (the three passes) use 2× |
| `--rise` | 24 px | How far a revealed block rises into place |

Curves:

| Token | Feel | Use |
| --- | --- | --- |
| `--curve-out` | arrives fast, settles | the default for anything appearing or changing |
| `--curve-spring` | a real spring (15 % over at 187 ms, still at 460 ms) | things with weight landing: stamps, lifted buttons, bubbles, the rail's current dot, the passport set down. The TypeScript `SPRING.stamp` sampled as a `linear()` curve, so CSS and Motion land alike; browsers without `linear()` get `--curve-stamp` |
| `--curve-stamp` | a little overshoot (bezier) | the fallback for `--curve-spring`, and the two stamps that precede a page change (gate row, boarding pass) at `--dur-panel`, so they have landed when the page leaves |
| `--curve-panel` | smooth travel | drawers, sheets, the bill cover, the phone dock, a list unfolding |
| `--curve-in-out` | slow start and end | scroll-linked and long mechanisms, the lamps warming up |
| `--curve-in` | gathers speed | things leaving or falling: the torn stub, a sheet or dialog closing, a list folding |

**Spatial, not effects** (after Material 3 Expressive): the overshooting curves (`--curve-spring`,
`--curve-stamp`, `SPRING.*`) drive `transform` only. Colour, opacity, shadow and underline use
`--curve-out` / `EASE.out`, because an overshoot on a colour or an opacity is a flicker, not weight.
When one rule moves and fades the same element, list the two properties with their own curves.

In TypeScript: `MS.fast` etc. (milliseconds, anime.js), (milliseconds only; Motion takes seconds, so divide by 1000),
`STAGGER_MS`, `RISE_PX`, `EASE.out / in / inOut` (arrays) and `EASE.animeOut` (anime.js
name), `SPRING.door / stamp / ui`, `isCalm()`, `isPaused()`.

## The vocabulary, by situation

**Navigation and menus.** The header's Book stamps back in (`--dur-spring`, `--curve-spring`) once
the hero's Book scrolls away; on room pages the header Book fades and the phone dock slides up at
panel speed once the hero has gone. The index and menus sheets are native `<dialog>`s that travel
in with `fp-in-right` / `fp-in-up` (`--dur-panel`, `--curve-panel`); so is the Book drawer. The
header's Menus dropdown (a `<details>`) and the phone menu picker unfold to their own height
(`interpolate-size`) at panel speed. The chapter rail (`ChapterRail.astro`) fades in at panel speed
once the reader is past the hero; its current dot grows with the spring and labels slide in at fast
speed. The reading line under the header is a `scaleX` on a CSS scroll timeline (the script writes
it only where the browser has none, or in calm mode).

**Sheets and dialogs leave the way they came.** Every dialog, sheet and unfolding list has a closed
state in CSS (`transform` back where it came from, `height: 0`, backdrop `opacity: 0`) and a
transition to it at `--dur-panel` with `--curve-in`. Where the browser can keep a closing dialog in
the top layer (`overlay`, Chromium) the exit plays; elsewhere the close is instant, as a close
should never wait on a script. The entry is still the keyframe (or `@starting-style`), so no browser
lost one. The lightbox keeps its photo for the fade-out (`MS.fast`), which is the one scripted wait.

**Buttons and links.** `.fp-btn`: lifts 2 px on hover (`--dur-spring`, `--curve-spring`), presses
down 1 px at `--dur-press`, and in reduced motion neither moves. `.fp-link`: colour and underline
thickness at `--dur-fast`. The same press and lift apply to `.fp-choice`, `.menu-tag`, the gate
rows and the postcard links. A link to another page never waits for an animation except the one
panel beat (260 ms) a chosen gate row or boarding pass holds its stamp before the room morphs in.

**Section entrances and content reveals.** One mechanism: `.fp-reveal` (components.css) with
`bindReveals()` (`src/lib/reveal.ts`). The block starts `--rise` lower and transparent, rises
into place over `--dur-story` with `--curve-out` the first time 18 % of it is on screen. The CSS
hides nothing until the script has set `data-reveal` on `<html>`, so no-JS and calm mode see
everything in place. The comic's panels (StoryComic) use the same rise and timing; their speech
bubbles then land like stamps (`--dur-spring`, `--curve-spring`), one `--stagger` apart.

**Images.** A hover zoom is feedback: `scale(1.03–1.04)` at `--dur-fast`, `--curve-out`
(contact sheet, dish photos). The lightbox photo lands with `fp-pill-in` (`--dur-panel`). The
gold circle round a chosen photo is drawn once over `--dur-story-long`. The plate wall turns a
plate over `--dur-story` with the stamp curve. Loop videos play only while on screen and never
in calm mode (`LoopVideo.astro`).

**Page transitions.** Cross-document View Transitions (global.css). The root crossfades at
`--dur-fast`; a room's card or gate row morphs into that page's arrival (`view-transition-name:
branch-*`) at `--dur-panel`. Off in calm mode; browsers without the feature just load the page.

**Form feedback.** Fields change border and ring colour at `--dur-fast`. Error and success
messages appear at once (a message that animates in is a message read late). A sending button
keeps its label and types three dots after it (`aria-busy`, `fp-typing`); on success it turns
over to the inverted "done" state with a tick (`data-state="done"`). Pair every state change with
a `role="status"` line that says what happened.

**Loading states.** The arrival board (first visit on this device only, about 1.5 s) is the one
loading screen, and a tap, scroll, key or Skip ends it at once. Everything else loads in place:
the rain's still is painted first and the canvas fades over it; the "Open now" pill holds its
height until its first line is known; the lamp video shows its still until it plays.

**Scroll-linked effects.** Two, both telling the story: the doors (a scroll-pinned swing open
onto the room) and the voyage (a scroll-pinned chart the ship sails across). Both read scroll
progress once per frame through Motion's `scroll()` / `useScroll` and write transforms and
opacities straight onto elements; nothing measures layout in the frame. The "Lights on" photo
dims with scroll, then plays its clip once at mid-screen. In calm mode each of these is a still
picture of its end state at a normal height. Nothing else moves with scroll.

The rule for anything scroll-linked: **one property on one element is CSS** (`animation-timeline:
scroll()` / `view()` behind `@supports`, with the script path kept for browsers without it): the
reading line, the dusk. **Anything more is JavaScript, once per frame**: the doors, the voyage.
The CSS timelines are off under `prefers-reduced-motion`, where the global safety net would
shorten them; the still state comes from the script there.

## Reduced motion

Three layers, so nothing slips through:

1. `tokens.css`: every `--dur-*` and `--stagger` becomes 0 ms, so every token-driven transition
   and animation shows its end state at once.
2. `global.css`: a `prefers-reduced-motion` safety net sets every animation and transition to
   0.01 ms and one iteration, and `@view-transition { navigation: none }`.
3. Scene scripts check `isCalm()` (or the media query) and take the still path: the arrival
   board is skipped, the doors stand open, the voyage shows the whole route, the bill is open
   with its receipt out, the lamps are lit, the passes are on the counter, the plates sit still,
   the comic and the chapter heads are all in place. Smooth in-page scrolling becomes instant.

The footer's **Pause motion** (`html[data-motion="paused"]`, remembered on the device) is for
guests who have not set the system preference: it stops the rain, the loop videos, the pulsing
and breathing loops, the bar's wandering light and the cycling "Open now" line.

## Performance rules

- Animate `transform` and `opacity` only. `will-change` only on the few scroll-driven layers.
- No blurred shadows or filters on anything that moves; elevation is a hard offset (`--lift-*`).
- One `requestAnimationFrame` per scroll listener, reads before writes, and section positions are
  measured on resize, not per frame (ChapterRail, LightsOn, Doors, Voyage).
- Reveals use `IntersectionObserver` and unobserve after firing. Loops run only while on screen
  (the bar light, the rain, the loop videos stop when they scroll away).
- Heavy libraries load on demand: anime.js for the passes arrives with the passes; the voyage
  island hydrates a screen early; the pill swap is CSS so Motion stays off the first load.
- Budget: `scripts/perf-budget.mjs` fails a page that drops frames while scrolling at 4× CPU;
  `scripts/tap-timing.mjs` (`npm run perf:taps`) fails any of the five taps that matter (Book from the
  dock, a plate, a page turn, a menu chip, a passport stamp) whose input-to-paint median is over 200 ms
  at 4× CPU, the lab stand-in for INP. In the field the "Vitals" event carries INP once
  `PUBLIC_PLAUSIBLE_DOMAIN` is set; read it at p75 after the first week.
- Interruptible: a second input mid-motion reverses or completes from where the thing is, never
  restarts it. CSS transitions do this by themselves (a plate tapped twice turns back); a scripted
  spring takes the current position and the hand's velocity (`page-flip.tsx` `run`). The drawer opened
  and closed within 100 ms, a plate flipped twice within 300 ms and a page turned and turned back are
  asserted by `docs/qa/phase8-motion/check.mjs` (`interrupt`).

## Documented exceptions

Mechanisms whose timing is their own, kept outside the two-speed rule on purpose:

- **Arrival board** (`Arrival.astro`): a choreographed intro timeline (thud, jolt, shutter) of
  about 1.5 s, first visit only, skippable.
- **Lamps warming up** (`LightsOn`, `LampHalos`): the one slow fade on the site, two long beats
  (2.4 s) per bulb, a panel beat apart. Light, not an object.
- **Receipt** (`Goodbye`): prints in 12 steps over `--dur-story-long`.
- **Hero title** (`HomeHero`): ten letters are one word, so they rise 45 ms apart, not 60.
- **Loops** (`fp-pulse` 1.6 s, `voyage-ping` 1.8 s, `breathe` 4.8 s, the rain, the bar light): a
  period, not a duration, so not a token. Each is listed in the `html[data-motion="paused"]` rule in
  global.css (or checks `isPaused()`), and `docs/qa/phase8-motion/check.mjs` proves none survives
  Pause motion. The typing dots on a busy button (`fp-typing`, 1.2 s) are an activity indicator and
  carry on under Pause motion, as WCAG 2.2.2 allows.
- **Waits** (the 2.4 s before a torn stub grows back, the 650 ms of dark before the lamps replay):
  pauses between movements, written as plain numbers.
- **Unfolding lists** (the Menus dropdown, the phone menu picker, the drawer's group route) transition
  `height` (and the picker's block padding and border), the one layout property allowed: small boxes,
  on their own layer or inside a sheet, with `interpolate-size` so the browser does the measuring.
- **Vendored components** (`kokonutui/`): the split-flap boards and marker pen keep their own
  mechanical timings; each honours `prefers-reduced-motion` on its own. The page-flip book turns on
  `SPRING.door` (near-critical: paper never passes its rest) and settles back on `SPRING.ui`, with the
  swipe's speed carried in as velocity; a page in flight can be caught, dragged back or reversed by
  the opposite button, key or swipe.

## Adding motion

1. Is it feedback or a reveal? Pick `--dur-fast` / `--dur-press` or `--dur-story`. Something
   arriving (a sheet, a stamp) is `--dur-panel`.
2. Pick the curve from the table. Default `--curve-out`; weight means `--dur-spring` with
   `--curve-spring`, on `transform` only.
3. Only `transform` and `opacity`. Write the end state first and transition to it. Something that
   opens needs a closed state too, so it can leave the way it came.
4. Make sure the end state is what calm mode and no-JS see. If a script hides something before
   revealing it, gate the hiding on an attribute the script sets (as `.fp-reveal` does).
5. A loop? Stop it off screen and under `html[data-motion="paused"]`.
6. Never delay a link, a booking or a form send for an animation.
7. Can the guest touch it mid-motion? Then it must reverse or complete from where it is: prefer a CSS
   transition (free), or hand a scripted spring the current value and velocity. Add the case to the
   `interrupt` block of `docs/qa/phase8-motion/check.mjs`.
8. Does it follow the scroll? One property on one element goes on a CSS scroll or view timeline in
   `global.css` (the story panels, the reading line, the dusk); anything else is one script write per
   frame.
