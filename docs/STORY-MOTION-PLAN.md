# Story motion: plan to finish the whole story

Status, 22 Nov 2026: step 1 is done (branch `story-motion`, commit `920c603`). Chapter 1 plays as two
scroll-driven scenes; chapters 2-5 are still the comic. This plan takes the "paper puppet theatre" to the
end of the story, then to the booking section.

## Revision, 22 Nov 2026: the whole story on one screen
Since 22 Nov the site is live with chapter 1 in motion and chapters 2-5 still as the stacked portrait
comic. The owner wants the rest of the story to play the same way: on one pinned screen, scene after
scene, with no stacked panels. This section replaces "The scenes" table and steps 3-6 below. Everything
in "What stays fixed" still holds.

### How "one screen" works
- **One stage per chapter, five stages back to back.** Each chapter is one tall track with a single
  sticky 100svh stage. Its scenes crossfade inside that stage, so the screen never scrolls away in the
  middle of a chapter. Between chapters the next stage slides up over the last, like a page turn. It
  is one movement, about one screen long.
- **Why not one huge track:** Chrome's scrollytelling guide uses one timeline per section, and no
  source covers about 100 layers on one timeline. Five tracks keep each chapter's layers, and their GPU
  memory, inside that chapter. The rail also gets a real box to measure for each chapter.
- **Chapter title inside the stage:** each stage opens on a title card ("Chapter two / Tangra") for
  the first 10% of the track, then the scene builds behind it. The `h2` stays in the DOM, and its id
  stays unique as `<chapter>-scenes-title`.
- **Rail anchors:** `#tangra` and the other chapter ids stay on the in-flow `.story-chapter` wrapper,
  never inside the sticky stage. The rail's "last chapter past the middle" logic keeps working.
- **Comic:** once chapter 5 lands, motion mode hides the whole comic. The comic stays for reduced
  motion, unsupported browsers and the "Read as a comic" switch.
- **Ending:** chapter 5's last beat warms the stage to gold. The gold `#end` section ("Come and taste
  the rest") follows with no visible seam.
- **Length:** chapter 1 is 480vh (two tracks). Chapters 2-5 add about 1500vh. That is about 20
  screens on desktop, the limit already set in step 8. Phone tracks are about 20% shorter.

### New engine pieces (step 3a, before any chapter)
- `fx-in-out`: one layer fades in over `--from`/`--to` and out over `--out-from`/`--out-to`, for beats
  that replace each other on the stage. It is built from the existing `fx-move` and `fx-out`.
- `.scene-photo`: a photo layer with object-fit cover, a paper border and a slight static tilt, used
  for dish and room photos.
- Ambient layers, all CSS gradients that move only by transform and opacity:
  - steam: soft radial puffs that rise
  - rain: a repeating streak layer that slides down
  - flame: a gradient that scales up with the scroll
- `.scene-title`: the chapter title card.
- No new dependency, no JS for motion, no filters.

### The scenes
"Now" means art we own today. Every "slot" is a SceneArt storyboard card until the illustrator's
layer arrives (story/layers/<scene>-<layer>.png), and then it needs no code change.

| Ch. | Track | Beats in the one stage, by % of track | Art now |
|---|---|---|---|
| 1 | 480vh (done) | Harbour, then At sea. Optional later: merge into one stage like the rest | brand cut-outs, map |
| 2 Tangra | 400vh | 0-12 title card. 5-25 the chart zooms into Calcutta (scale, continuing ch. 1's route). 20-40 the lane rises and steam lifts from the stall; caption p04. 40-60 Pundit's bubble "Good. But where is the fire?", caption p05. 60-95 the spice market: sacks rise from the bottom, chillies drop in, Fatt's "Show me.", caption p06 | map.webp; slots tangra-lane-far/near/stall, pundit, spice-sacks, chillies |
| 3 Something new | 400vh | 0-12 title. 10-40 the wok: the flame flares, "More chilli!" then "More wok!", the queue grows from the right; caption p07. 40-70 the steamer lid lifts in a cloud of steam to show the momos; chilli chicken and noodles slide in; caption p08. 70-95 the table after service, plates settle; caption p09 | photos: momo-mix-vegetable, crackling-spinach, crispy-okra; slots wok-fatt, wok-pundit, queue, table |
| 4 London calling | 350vh | 0-12 title. 5-35 the route draws Calcutta to London on world-land.svg. 30-65 the Soho front at dusk: photo plus an ink dusk overlay plus rain, Pundit's "Another sea, another kitchen.", caption p10, visible CC BY-SA credit. 65-95 three Covent Garden photos slide in as postcards; caption p11 | world-land.svg, soho-front photo, covent-garden gallery-01..08 |
| 5 Next stop | 350vh | 0-12 title. 5-35 the route draws London to Dubai; the skyline rises at dusk, Fatt's "Pack the wok.", caption p12. 40-90 the table: a momo basket with steam, Pundit's "Your table is ready.", caption p13. 90-100 the stage warms to gold and hands over to #end | world-land.svg; photo 04-momos-chutney; slots dubai-skyline, travellers, table-chair |

Art gaps that stay storyboard cards until the illustrator delivers:
- the Tangra lane, Pundit, the spice market
- the wok scene and the queue
- the Dubai skyline
- the laid table

The tiger head stays out of every scene until client #57 is answered.

### Steps (one commit each on `story-motion`, then a PR to main)
- **3a.** The engine pieces above. Back-to-back stages join with no gap in motion mode. Probe whether
  Safari 26 accepts `var()` in `animation-range`. The owner can open the preview in Safari on their
  Mac. If it fails, switch to fixed range classes.
- **3b.** Chapter 2 (`ChapterTangra.astro`).
- **4.** Chapter 3.
- **5.** Chapter 4.
- **6.** Chapter 5, the hand-over to the gold end section, and the whole comic hidden in motion mode.
- **7 and 8** are unchanged: the illustrator's art, then the release check.

Each step runs the same checks: verify, build, docs/qa/story-motion/check.mjs (it finds the new stages
by itself), the perf budget (median of 3), the reviewer, commit, push. After step 6 the PR to main
deploys.

### Built, 22 Nov 2026 (steps 3a-6 in one commit)
- All five chapters play as stages. Chapter 1's heading became a title card too, and its first
  track is 240vh.
- The motion custom properties are registered with `@property … inherits: false`. Without that, a
  wrapper that fades a group out handed its `--o1: 0` to the layers inside, which then never appeared.
- Chapter 2 zooms the clean world chart (world-land.svg), not the brand map. The brand map turned to
  noise at 2.6x.
- Performance: scaling an SVG re-rasters it every frame. Chapter 2's zoom alone dropped 1 frame in 6,
  and the chapter 1 sea strip cost about 1%. Both now have `will-change: transform`, which brings the
  page to 1.3-1.7% dropped frames. `content-visibility: auto` on the tracks made no difference and was
  removed.
- The Dubai skyline is a plain SVG silhouette until the illustrator's layer arrives.

### Research notes (22 Nov)
- Scroll-driven animations ship in Chrome 115+, Safari 26 and Firefox 159 (on by default since 27 Oct
  2026). Sources: web.dev/blog/web-platform-10-2026 and webkit.org/blog/17333.
- Safari 26.5 fixed view-timeline progress near 0% and 100%.
- Support for `var()` in `animation-range` in Safari is unconfirmed, so we test it (step 3a).
- Pure-CSS scroll animations run off the main thread. Sources: the developer.chrome.com
  scroll-animation-performance case study and the NRK case study.
- Pure CSS cannot toggle `inert`, so every scene's text stays in DOM order and decorative layers stay
  `aria-hidden`.

## What stays fixed
- CSS scroll-driven animations only: a view timeline per scene track, sticky 100svh stage, linear, fill
  both. Transform and opacity only; dashoffset for drawn routes. No JS for motion, no new dependency, no
  scroll hijacking.
- Gate: `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`. Otherwise
  the comic tells the story, exactly as today.
- Copy lives in `src/data/story.ts` and stays live HTML text. Speech never goes into the art.
- No people drawn by us: characters come from the illustrator. Logos and stamps never move (brand p.16).
- Every link and the booking buttons work at once; nothing waits for an animation (docs/MOTION.md).
- Budgets on /our-story/: perf >= 85, CLS <= 0.05, weight <= 1100 KB, dropped frames <= 2%.

## The scenes

Nine scenes in all: two per chapter, except one for chapter 4. "Now" means art we already own; "later" is
the illustrator's cut-outs, which drop in without code changes (see step 2, art slots).

| Ch. | Scene | Panels | Movement | Art now | Art later |
|---|---|---|---|---|---|
| 1 | Harbour | p01, p02 | done | brand cut-outs | Fatt on the quay; sharper ship and hills |
| 1 | At sea | p03 | done | brand cut-outs, map | Fatt and the crew on deck |
| 2 | Into Calcutta | p04 | the chart zooms from the route's end into Calcutta, then the lane slides up; steam rises from the stall | map.webp zoom, storyboard slot for the lane | Tangra lane in 3-4 depth layers, rickshaw, Fatt's stall |
| 2 | First taste | p05, p06 | Pundit's bubble, then sacks of spice rise from the bottom, chillies drop in | storyboard slots | Pundit, sacks, loose chillies |
| 3 | The wok | p07 | flame flares with the scroll, the two bubbles answer each other, the queue grows from the right | storyboard slots | Fatt and Pundit at the wok, queue cut-outs, flame |
| 3 | Momos and friends | p08, p09 | steamer lids lift to show momos, then the table after service | momo photos (dish and journey) on greaseproof paper; stamp-gold static | steamers, Fatt and Pundit at the table |
| 4 | Another sea | p10, p11 | the route draws on from Calcutta to London on the world chart, rain falls on Berwick Street, Covent Garden postcards slide in | world-land.svg, Covent Garden gallery photos | Soho front at night (client photo #35, or illustration) |
| 5 | Dubai | p12 | route London to Dubai, skyline rises at dusk | route on the chart; storyboard slot for the skyline | Dubai skyline, Fatt and Pundit with suitcases |
| 5 | Your table | p13 | the chair turns out towards the reader, steam from the basket, "Your table is ready." Then the page hands over to the end section, which does not move | storyboard slot, momo photo | laid table, chair, the two of them waving |

## Steps

Each step is one commit on `story-motion`, with the same checks as step 1 (below).

### Step 2: make the engine reusable (no visible change). Done 22 Nov 2026
Built as planned, with one change from items 2-3. A layer's motion is set by custom properties in its
chapter component's style block: range `--from`/`--to`, start `--x0 --y0 --r0 --s0 --o0`, end
`--x1 … --o1`. A single keyframe set, `fx-move`, reads them. Each chapter is a component in
`src/components/story/scenes/`, and its style block reads as the scene's score. No separate data file
was needed, and story.ts stays the only source of the words. Edge supports `var()` in
`animation-range`; Safari and Firefox are still to check in step 8. The "Read as a comic" switch landed
here too. Chapter 1 screenshots match step 1 pixel for pixel, within rounding.

Original plan:
1. **One scene component.** `StoryScene.astro` gives the track, sticky stage, sr-only sentence and the
   heights (desktop and phone) as props. Every track uses the same timeline name, `--scene`. A layer
   resolves it from its nearest track, so names can repeat.
2. **Motion presets, not per-layer CSS.** global.css gets a small set of classes: `fx-fade-up`, `fx-pop`,
   `fx-out`, `fx-slide-in` (left or right), `fx-drift` (slow or fast), `fx-cross`, `fx-rise`, `fx-turn`,
   `fx-draw`, `fx-zoom`. Each layer sets its range with inline custom properties (`--from`, `--to`); the
   comic already uses inline custom properties for bubbles. First, prove that `var()` inside
   `animation-range` survives the build and runs in Chromium, Safari 26 and Firefox 159. If it does not,
   fall back to a fixed set of range classes (`r-0-30`, `r-20-40` and so on).
3. **Scene data, separate from the copy.** `src/data/story-scenes.ts` lists each scene: its panels by
   id, heights, and layers (art slot, preset, range, position). story.ts stays the single source of the
   words.
4. **Chapter by chapter, not scenes then comic.** Render each chapter as one `<section id=chapter>`
   holding both versions: the scenes and the comic chapter. The gate shows one. Every rail anchor then
   lands right in both modes, and the `anchorless` prop goes away. This needs StoryComic split into a
   `ComicChapter.astro`.
5. **Art slots.** Layers look for `src/assets/images/story/layers/<scene>-<layer>.(png|webp)`. Until a
   file exists, the slot shows a storyboard card: faint brand art and the pencilled scene note, as the
   comic does. Then any chapter can be built and approved before the illustration arrives.
6. **Migrate chapter 1** onto all of this. The step-1 screenshots must match.
7. **Commit the QA script.** Move the scratchpad check into `docs/qa/story-motion/check.mjs`. It should
   find every scene itself and shoot 25/50/75% at 1440 and 390 wide.

### Steps 3 to 6: one chapter per step
- Step 3: chapter 2, Tangra.
- Step 4: chapter 3, Something new.
- Step 5: chapter 4, London calling.
- Step 6: chapter 5, Next stop, and the hand-over into the end section.

Per chapter: add its scenes to story-scenes.ts, use art slots where art is missing, then screenshot and
check. When chapter 5 lands, motion mode hides the whole comic.

### Step 7: illustrator art and polish
- Brief the illustrator for layered cut-outs, not flat panels (client question #56): transparent PNG,
  each moving part separate, at least 2x its largest display width (about 1600-2400 px).
- Drop the files in. No code change is needed, only checks and tuning ranges by eye.
- Replace soft brand art in chapter 1 (ship 196 px, hills 355 px wide today).
- Swap the world chart sea strip for a purpose-made water strip if the illustrator provides one.

### Step 8: release check
- Real devices and browsers: Safari 26, Firefox 159, a mid-range Android phone, iOS Safari with the toolbar
  collapsing (svh), a screen reader pass in both modes.
- Page length: aim for no more than about 20 screens on desktop for the whole story. Shorten tracks if
  it drags; the comic remains for anyone who prefers it.
- Run the budgets on the full page, median of three. If dropped frames creep up, try
  `content-visibility: auto` on tracks far from the screen, measuring before and after.
- Reviewer once on the final diff, then a PR from `story-motion` to main.

## Checks for every step
- `npm run verify` and `npm run build`.
- `astro preview` plus `scripts/perf-budget.mjs` on /our-story/ (median of 3).
- QA script: no horizontal scroll at 1440 and 390, no visible caption covered, no duplicate ids, rail
  anchors land in both modes, reduced motion shows the comic, scene-only images not fetched in calm mode.
- Look at the screenshots: text readable on every background, nothing under the phone dock.

## Decisions (22 Nov 2026)
1. **Build before the art: yes.** Chapters 2-5 are built now with art slots and photos.
2. **Illustrator format: yes, layered cut-outs.** `docs/STORY-BRIEF.md` "Delivery" now asks for them.
3. **Tiger head art: open** (client #57). Not used in any scene until answered.
4. **"Read as a comic" switch: yes.** It lands in step 2: a button at the top of the story that switches
   to the comic and remembers the choice (a few lines of JS, none of it for motion).
5. **Soho front: a photo found online.** "77 Berwick Street, Soho, May 2023" by No Swan So Fine, CC BY-SA
   4.0 (Wikimedia Commons), in `src/assets/images/story/photos/`. It is a daytime shot, so the scene lays
   a dusk overlay over it, and the licence needs a visible credit line in the scene. Client #35 stays
   open for their own photo.
