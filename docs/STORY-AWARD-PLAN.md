# Our story: plan to award level

Status, 22 Nov 2026. This is a draft for review: nothing in it is built yet. It follows
docs/STORY-MOTION-PLAN.md. All five chapters already play as pinned stages, and the site is live.
The goal is an Awwwards Site of the Day plus the Developer Award, and an entry to CSSDA and FWA.

## Decisions (22 Nov 2026)
1. **Engine: keep pure CSS** scroll-driven animations, with native scroll and no smooth-scroll
   library. This is our edge on usability, which is 30% of the Awwwards score, and on the Developer
   Award (performance, accessibility, animation).
2. **AI-generated art: yes, except characters.** Backgrounds, props and paper textures are made with
   Higgsfield, and the owner approves every image before it ships. Fatt and Pundit stay with the
   illustrator (docs/STORY-BRIEF.md, client #49). The tiger head stays out until #57 is answered.
3. **This plan is reviewed before anything is built.**

## Benchmark: endspeciesism.org ("The Tale of Two Tails")
- **Stack:** Next.js, plus a Theatre.js timeline driven by scrollY, plus Lenis smooth scroll. Pinning
  is sticky `h-lvh` stages.
- **Art:** about 164 objects from 64 PNG cut-outs (served as AVIF). Characters move by pose swaps and
  separate parts (tail, arms). Paper-tear and crumpled-paper textures, multiply blends.
- **Length:** about 24 screens and 4 chapters, then a coda with a live counter and cards.
- **Scene devices:**
  - a torn-paper wipe between scenes, about 5 times
  - comic panels with jagged hand-drawn outlines that characters break out of
  - a zoom-through from a panel to full screen
  - a palette arc from warm to neon to black and crimson
  - a title that shatters, with "VROOOOM" lettering
- **Weak spots:**
  - no h1 or h2, no skip link
  - no reduced-motion handling
  - about 1 MB of JS
  - empty grey gaps during wipes
  - cramped framing on phones
- **Result:** an Awwwards Honorable Mention (Apr 2025), not Site of the Day.

How the awards score:
- **Awwwards:** Design 40%, Usability 30%, Creativity 20%, Content 10%. The Developer Award (for Site
  of the Day winners only) checks semantics, animation, accessibility, performance, responsive design
  and markup.
- **Why sites lose points:**
  - a preloader longer than about 2 s
  - a weak phone layout
  - dropped frames
  - no reduced-motion path
  - poor focus states or contrast
- **CSS-only earns nothing by itself.** We make the case in the write-up instead: speed,
  accessibility, live text, and the comic fallback.

Our gap is mostly art: characters, painted depth, texture. Second comes stagecraft: wipes, kinetic
type, frame breaks, an opening and an ending. Our engine, accessibility and performance are already
stronger than the benchmark.

## Plan A: stagecraft (code only, works with today's art)
Each item is CSS and HTML on the existing engine (global.css "Story scenes" and the chapter
components). Motion uses transform and opacity only; drawn lines may use stroke-dashoffset. Each item
is one commit, with the usual checks.

| # | What | How, in CSS | Done when |
|---|---|---|---|
| A1 | **Torn-paper wipes** between chapters | A torn-edge sheet (texture PNG, or an SVG edge until the PNG exists) slides up over the last 10% of a stage, and the next stage opens from under it. Replaces the plain slide-up. | No blank paper screen; the next scene shows within one screen of scroll |
| A2 | **Colour arc per city** | Each stage gets a palette token set (`--sky`, `--ground`, `--glow`): jade mist (Guangdong), ink night (sea), monsoon ochre (Calcutta), wok-fire amber (Something new), wet slate and neon (Soho), desert gold (Dubai). Crossfades of full-stage colour layers. Contrast is checked for every caption. | test:contrast passes on every palette |
| A3 | **Kinetic titles and sound words** | Chapter titles: split letters (spans, `aria-hidden`, with the real `h2` text kept for screen readers) scatter and settle with the scroll. Sound words drawn as lettering layers, such as "SIZZLE!" at the wok, "HOOONK" at the ship and "PSSHH" at the steamer. | Titles read normally with CSS off; screen readers announce each title once |
| A4 | **Frame breaks** | Key beats show as jagged-edged panels (an SVG outline). Steam, flame and later characters sit above the frame edge and spill out. | Works with storyboard cards now; characters slot in later |
| A5 | **Opening scene** | The hero becomes stage 0: the title on torn paper over the harbour at dawn, letters lifting as you scroll into chapter 1. "Read as a comic" and the cue stay. No preloader. | LCP unchanged or better; the h1 stays real text |
| A6 | **Interactive ending** | Before #end: a world chart with the four cities pinned (Guangdong, Calcutta, then Soho, Covent Garden and Dubai as real branch links). Each pin opens a card with booking or waitlist (existing data-book links, real `<a>`). | Keyboard and screen reader reach every pin; the booking buttons work instantly |
| A7 | **Pacing and rail** | Trim tracks to about 20 desktop screens in total. Show the chapter rail from 1024px, not 1320px. Captions at most 2 lines on desktop. | Page about 20 screens; the rail is visible on laptops |

Not in plan A:
- **Sound.** Optional, off by default, needs audio files and a toggle; decide later.
- **Cursor effects and hover tilt.** These are JS, and only for mouse users.

## Plan B: art
### B1. Generated with Higgsfield (backgrounds, props, textures; no people, no characters)
**Style lock:**
- paper-cut theatre, layered cut paper
- muted brand palette (sand, ink, gold, tiger orange) plus each city's accent
- a visible paper grain
- flat light, no photoreal faces, no text or signage lettering in the image (words stay live HTML)

**Process:**
1. One style frame first. The owner approves it, and every later image references it.
2. Each scene in 3-4 depth layers (far, mid, near, foreground), each a transparent PNG at 2x display
   width (2400-3200px for full-bleed).
3. Named `story/layers/<scene>-<layer>.png`, so the slots pick them up with no code change.
4. The owner approves each image before commit.
5. A note of the prompt and model in `story/layers/README.md` (provenance).

**Scenes:**
- harbour-hills-far, harbour-hills-near, harbour-water, harbour-junks
- at-sea-sky, at-sea-waves-far, at-sea-waves-near
- tangra-lane-far, tangra-lane-near, tangra-stall (empty stall, no people)
- spice-market-back, spice-sacks
- wok-night-back, wok (prop)
- soho-night-street (paper-cut version; the CC BY-SA photo stays as an option)
- covent-garden-room
- dubai-skyline-far, dubai-skyline-near, dubai-sky
- table-laid, table-chair

**Props:** wok, steamer stack and lid, momos (cut-out), green and red chillies, rickshaw (empty),
stamped suitcases, lantern.

**Textures:**
- crumpled paper (tileable)
- torn edges: top, bottom, left, right
- a panel jagged-outline set

### B2. From the illustrator (characters only)
- Fatt and Pundit, 6-8 poses each: cooking, tasting, arguing, laughing, carrying suitcases, waving.
- Separate parts that move: arms, heads, Fatt's wok arm, Pundit's spectacles.
- Transparent PNG at 2x, the same paper-cut style as the B1 style frame.
- Prerequisite: the owner approves the characters and panel script (#49). #57 stays open.

### B3. From the owner (photos and licences)
- Soho at night (#35), kitchen and team shots, Dubai once open.
- The ITC American Typewriter web font licence (a launch blocker), so the titles use brand type.

## Plan C: release polish and entry
- Budgets on the full page, median of 3:
  - perf ≥ 90 (desktop) / ≥ 85 (mobile)
  - CLS ≤ 0.05
  - weight ≤ 1100 KB initial
  - dropped frames ≤ 2%
  - TBT median ≤ 200 ms
- Real devices:
  - iPhone Safari (toolbar collapse, svh)
  - a mid-range Android at 60fps
  - Safari 26 and Firefox 159 on desktop
- Accessibility: axe on both modes, a keyboard pass, a VoiceOver pass, contrast on every palette,
  focus states.
- Submission kit:
  - a 60-90 s screen recording (desktop and phone)
  - 6 stills
  - a write-up: the story, the paper theatre, pure CSS, the comic fallback, the numbers
- Enter Awwwards first (Site of the Day, then the Developer Award), then CSSDA and FWA. Webby when
  its window opens.

## Order and dependencies
1. **A1-A7.** Can start now; about 7 commits.
2. **B1 style frame**, then owner approval, then **B1 scenes**, one chapter at a time. These can run
   alongside A.
3. **B2 characters** once #49 is approved; they drop into the existing slots.
4. **C**, last, on the finished page.

## Open questions for the owner
- Approve the B1 style frame before any other generation.
- Use the AI paper-cut Soho street, the CC BY-SA photo, or the client's own night photo (#35)?
- Sound: worth adding (off by default), or skip?
- The illustrator's budget and timeline for B2.
