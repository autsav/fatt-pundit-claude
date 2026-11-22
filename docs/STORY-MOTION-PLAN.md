# Story motion: plan to finish the whole story

Status, 22 Nov 2026: step 1 is done (branch `story-motion`, commit `920c603`). Chapter 1 plays as two
scroll-driven scenes; chapters 2-5 are still the comic. This plan takes the "paper puppet theatre" to the
end of the story, then to the booking section.

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
