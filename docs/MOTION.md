# Motion system

How things move on fattpundit.com, and why. Tokens live in `src/styles/tokens.css` (CSS) and
`src/lib/motion-tokens.ts` (the same values for anime.js and Motion); change both together.
The styleguide (`/styleguide/#motion`) shows them live.

## Principles

1. **Physical, not atmospheric.** Things stamp, slide, flip, drop and print. No drifting glows,
   no blur, no parallax for its own sake. Only `transform` and `opacity` animate (plus a few SVG
   stroke draws); never layout properties, filters or shadows.
2. **Two speeds, nothing in between.** *Fast* is feedback: the thing you touched answers in
   200 ms or less. *Story* is a reveal: 900 ms, once, as a scene comes on screen. The one middle
   value, *panel* (260 ms), is for something arriving: a drawer, a sheet, a stamp landing, a page
   change.
3. **Motion never holds the guest up.** Links go on the click; a booking opens at once and the
   stub tears as feedback afterwards. A page change crossfades at feedback speed. Scroll is never
   hijacked: the two scroll-driven scenes (doors, voyage) are pinned sections the guest scrolls
   through at their own pace, and every in-page jump uses `scrollIntoView`.
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
| `--dur-panel` | 260 ms | A drawer or sheet travelling in; a stamp, bubble or pill line landing; a page change; the time a stamp is shown before a page opens |
| `--dur-story` | 900 ms | A reveal in a scene: a block rises into place, a pass drops onto the counter, a plate turns, a cover swings |
| `--dur-story-long` | 1200 ms | A long mechanism: the receipt printing, the gold circle drawn round a photo |
| `--stagger` | 60 ms | Between siblings in a sequence; at most 6. Big objects (the three passes) use 2× |
| `--rise` | 24 px | How far a revealed block rises into place |

Curves:

| Token | Feel | Use |
| --- | --- | --- |
| `--curve-out` | arrives fast, settles | the default for anything appearing or changing |
| `--curve-stamp` | a little overshoot | things with weight landing: stamps, lifted buttons, bubbles, the rail's current dot |
| `--curve-panel` | smooth travel | drawers, sheets, the bill cover, the phone dock |
| `--curve-in-out` | slow start and end | scroll-linked and long mechanisms, the lamps warming up |
| `--curve-in` | gathers speed | things leaving or falling (the torn stub) |

In TypeScript: `MS.fast` etc. (milliseconds, anime.js), `DURATION.fast` (seconds, Motion),
`STAGGER_MS`, `RISE_PX`, `EASE.out / in / inOut` (arrays) and `EASE.animeOut / animeThud` (anime.js
names), `isCalm()`, `isPaused()`.

## The vocabulary, by situation

**Navigation and menus.** The header's Book stamps back in (`--dur-fast`, `--curve-stamp`) once
the hero's Book scrolls away; on room pages the header Book fades and the phone dock slides up at
panel speed once the hero has gone. The index and menus sheets are native `<dialog>`s that travel
in with `fp-in-right` / `fp-in-up` (`--dur-panel`, `--curve-panel`); so is the Book drawer. The
chapter rail (`ChapterRail.astro`) fades in at panel speed once the reader is past the hero; its
current dot grows with the stamp curve and labels slide in at fast speed. The reading line under
the header is a `scaleX` transform written once per frame.

**Buttons and links.** `.fp-btn`: lifts 2 px on hover (`--dur-fast`, `--curve-stamp`), presses
down 1 px at `--dur-press`, and in reduced motion neither moves. `.fp-link`: colour and underline
thickness at `--dur-fast`. The same press and lift apply to `.fp-choice`, `.menu-tag`, the gate
rows and the postcard links. A link to another page never waits for an animation except the one
panel beat (260 ms) a chosen gate row or boarding pass holds its stamp before the room morphs in.

**Section entrances and content reveals.** One mechanism: `.fp-reveal` (components.css) with
`bindReveals()` (`src/lib/reveal.ts`). The block starts `--rise` lower and transparent, rises
into place over `--dur-story` with `--curve-out` the first time 18 % of it is on screen. The CSS
hides nothing until the script has set `data-reveal` on `<html>`, so no-JS and calm mode see
everything in place. The comic's panels (StoryComic) use the same rise and timing; their speech
bubbles then land like stamps (`--dur-panel`, `--curve-stamp`), one `--stagger` apart.

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
dims with scroll via one custom property, then plays its clip once at mid-screen. In calm mode
each of these is a still picture of its end state at a normal height. Nothing else moves with
scroll.

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
- Budget: `scripts/perf-budget.mjs` fails a page that drops frames while scrolling at 4× CPU.

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
- **Vendored components** (`kokonutui/`): the page-flip book, split-flap boards and marker pen
  keep their own mechanical timings; each honours `prefers-reduced-motion` on its own.

## Adding motion

1. Is it feedback or a reveal? Pick `--dur-fast` / `--dur-press` or `--dur-story`. Something
   arriving (a sheet, a stamp) is `--dur-panel`.
2. Pick the curve from the table. Default `--curve-out`; weight means `--curve-stamp`.
3. Only `transform` and `opacity`. Write the end state first and transition to it.
4. Make sure the end state is what calm mode and no-JS see. If a script hides something before
   revealing it, gate the hiding on an attribute the script sets (as `.fp-reveal` does).
5. A loop? Stop it off screen and under `html[data-motion="paused"]`.
6. Never delay a link, a booking or a form send for an animation.
