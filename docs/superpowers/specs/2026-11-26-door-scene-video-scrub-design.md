# Door scene: scroll-scrubbed walk-in clip (design)

Date: 26 Nov 2026 · Scene: `src/components/scenes/Doors.astro` (homepage, scene 2, Covent Garden walk-in)
Earlier work: `docs/qa/DOOR-SCENE-PLAN.md` (Phase 5 brief + beat sheet), `docs/qa/DOOR-SCENE-100.md`.

## Intent

The walk-in from Maiden Lane through the door, past the velvet curtain and into the room "looks weird"
to the owner. A frame-by-frame review at 1024×768 (26 Nov) found four causes, all of which come from
faking a camera move by scaling flat pictures:

1. **The walk is a zoom.** One painted shopfront is scaled 1→6×; up close it reads as a picture growing.
2. **The door leaf becomes a plank.** A flat image on `rotateY(-78deg)`, then scaled with the camera.
3. **The curtain is squashed, not drawn.** `scaleX` + `skewX` on a flat velvet image; the brass rail
   stays pinned across the top of the room photo, floating over its ceiling.
4. **The room doesn't match where you stand.** `interior-door-view-g.jpg` is a wide, high shot down the
   room; you enter at street level and suddenly look down on it.

Plus a load race: scrolling in before `facade-g` decodes shows the curtain and rail through the front.

The owner wants the site to feel "3D premium". The fix is to stop faking the move: replace the walk,
door, curtain and reveal with one continuous first-person clip that the scroll scrubs forward and back
(the Apple product-page technique).

## Goals

- From the moment the door starts to open until the room is in view, the guest sees one continuous,
  correctly-perspectived camera move: door swings in onto the velvet, the camera steps up to it, the
  curtain is drawn aside (real fabric gathering), and the room is revealed from standing eye height.
- Scrub is 1:1 with scroll, both directions, smooth (no visible frame steps on a notched wheel or flick).
- The street beat that already works (lamps flick on, sign lights, gilt shine, glass clears) is kept.
- The handoff from the coded street to the clip is invisible.
- Never shows a half-loaded state (fixes the load race).

## Non-goals

- No change to the hero before the scene or the voyage after it.
- No change to the owner's curtain brief: velvet behind the door glass, the same velvet in the open
  doorway, drawn aside as you step in.
- No WebGL / three.js / cloth simulation.
- No sound.

## Anti-goals (a failure even if it "works")

- The homepage's first load gets heavier (Lighthouse weight budget is 1100 KB; frames must not load
  before the guest is near the scene).
- The namemark or sign is garbled by AI generation at any visible frame (brand guidelines p.8: the
  namemark is one approved piece). The sign must never come from the clip while readable.
- A visible jump, colour shift or double image at the street→clip handoff.
- Jank: the scene must stay under the existing 2 % jank budget (`perf:budget`).
- Breaking calm mode (`prefers-reduced-motion`), *Pause motion*, or no-JS.

## Constraints

- Astro 7 + React islands; motion rules in `docs/MOTION.md` (transform/opacity only for DOM layers;
  scroll-driven scenes are pinned and scrubbed at the guest's pace; calm mode shows a finished still).
- `npm run verify` must pass; `npm run perf:budget` must pass on `/` (perf ≥ 85, LCP ≤ 1500 ms,
  TBT ≤ 200 ms, CLS ≤ 0.05, weight ≤ 1100 KB, jank ≤ 2 %).
- Grade must match the existing `*-g` art (the warm grade baked into facade/door/room).
- AI generation spends Higgsfield credits on the owner's account: **hard cap 15 credits** for the whole
  clip work (both cuts, all takes and the eye-height room still), set by the owner 26 Nov 2026. Stop and
  report before going over. The owner picks the final take for each cut and signs off the grade.

## Approaches considered

| | Approach | Trade-off |
|---|---|---|
| A | Patch in place: cap zoom at 2.5× then a close-up doorway plate; door leaf exits early; curtain cut into 6–8 strips that bunch; new eye-height room plate; gate on decode | Cheap, no new weight, stays within today's technique — but stays 2.5D; the cardboard feel remains |
| **B (chosen)** | **Scroll-scrubbed image sequence of one continuous POV clip, from door opening to room; street beat stays as code** | Fixes 1–4 by construction (real perspective, real fabric, one viewpoint); costs ~2–4 MB of frames loaded on approach, and AI clips can drift on detail, so the handoff frame must match exactly |
| C | Real 3D (three.js, textured planes, cloth sim) | Most "3D", but a large JS cost on phones, risk to the perf budget, weeks of craft; B gets close for far less |

The owner picked **B** (26 Nov 2026).

## The design

### Beat sheet (pinned progress t, section length unchanged)

| Beat | t | Who draws it |
|---|---|---|
| Seam, lamps, sign letter-by-letter, shine, glass clears, hold on the lit front | 0–.22 | Existing code (unchanged) |
| Handoff | .22–.24 | Clip frame 0 is shown under the coded front, then the coded front fades out over ~2 % of t |
| Door swings in onto velvet → step up to the doorway → curtain drawn aside → room revealed at eye height → slow drift toward the bar | .24–.82 | Clip, frame = round(map(t, .24, .82) × (N−1)) |
| Bar light blooms into the story paper; "01 Our story" opening; route line draws | .82–1 | Existing code (unchanged), over the clip's last frame |

### The clip

- **Content:** locked to the owner's brief. Starts as the exact lit-front composition at t = .22 (door
  closed, velvet behind the glass); door opens inward (hinge left); camera walks up; curtain on a brass
  rail is drawn aside to the right; the room (Covent Garden dining room, towards the bar) is revealed
  from standing eye height; ends on a slow push toward the bar.
- **Two cuts:** landscape (16:9, 1600 px wide frames) and portrait (9:16, 900 px wide frames) — the
  front and the room crop too differently to share one. Curtain direction: to the right in both (owner's
  default; the current split-from-the-middle on tall screens is dropped). *(Builder/lead call.)*
- **Source, now:** AI image-to-video with first- and last-frame control. First frame = a screenshot of
  the live lit front at t = .22 at each cut's aspect (so the handoff matches by construction); last
  frame = an eye-height room still made from `interior-door-view-g.jpg` / gallery photos with the same
  grade. Generate several takes, keep the best. Any frame where the sign is still readable must match
  the coded sign or be covered (see Handoff).
- **Source, later:** the real 30-second shoot proposed in `DOOR-SCENE-PLAN.md` Phase 4, if the client
  agrees. Same pipeline: drop in the new clip, re-extract frames. The design must not assume AI.
- **Frames:** ~96 frames per cut (≈ 1 frame per 25–35 px of scroll on desktop), extracted with ffmpeg,
  encoded AVIF with WebP fallback, graded to match the `*-g` art. Target total ≤ 3 MB landscape,
  ≤ 1.5 MB portrait.

### Playback

- A `<canvas>` sized to the stage (device-pixel aware, capped at 2×), drawn with `drawImage` on the
  existing scroll → rAF tick (not `<video>.currentTime`: seeking is unreliable on iOS Safari).
- Frames are `ImageBitmap`s (decoded off the main thread via `createImageBitmap`).
- **Load trigger (lead call):** the scene sits right under a one-screen hero, so "near the section" is
  true at page load. Frames start downloading on the guest's first scroll, wheel, touch or key event
  (never on load or idle), so Lighthouse's weight and LCP are untouched. The `perf:budget` jank run
  scrolls, so it measures the real case with frames downloading and decoding; decoding must stay off
  the main thread (`createImageBitmap`) to keep jank ≤ 2 %.
- **Cut choice and rotation (lead call):** the cut follows the current aspect (portrait cut for
  `max-aspect-ratio: 3/4`, landscape otherwise; so 812×375 gets landscape). On rotation the scene
  re-measures (as today), keeps t, switches cut and draws the nearest loaded frame of the new cut while
  its keyframes load. The old cut's bitmaps are freed.
- **Load order:** Fetch frame 0 and the last frame first, then every 8th frame, then every 4th,
  then the rest. Until a frame is ready, draw the nearest loaded one (degrades to a coarser scrub on a
  slow line, never a blank).
- **Gate (fixes the load race):** the scene does not go live (stays the calm still) until the facade,
  door, sign and clip frame 0 are decoded. If the guest is already inside the scene when it becomes
  ready, it picks up at the current t.
- Free the bitmaps once the section is far off-screen in both directions; refetch on return.

### Handoff and the sign

- **Framing match on every screen (lead call):** the coded front is framed differently per aspect
  (ultrawide, short landscape, tall, portrait tablet media queries, plus `measure()`'s lamp-top and dock
  offsets), so a full-screen frame 0 can't match it everywhere. Instead, each cut's source frames place
  the shopfront at a known rectangle (recorded with the cut). At the handoff the canvas is transformed
  so that rectangle sits exactly on the camera's measured box (`cam` from `measure()`), so frame 0
  lines up pixel-for-pixel on any viewport; over the first part of the clip (≈ t .24–.32) the canvas
  transform eases to full-stage cover. Source frames therefore need margin around the shopfront
  (generate wider than the cut's aspect and crop at extraction). No extra cuts, no change to the street
  framing.
- The coded street layers (facade, door leaf, lamps, sign, reflections, surround on tall screens) stay
  exactly as they are for t < .22, with the camera **not** moving (the old walk/scale is removed).
- At .22–.24 the clip's frame 0 is drawn under them and they fade out. The lamps and lit sign keep
  their state across the fade (frame 0 was captured from them).
- If the AI clip mangles the sign in its first frames while still readable, the coded lit sign stays on
  top and is moved to track the clip's sign for those frames (positions recorded per frame), fading out
  once it is off-screen or unreadable. Prefer a take where this isn't needed. *(Builder decides after
  seeing the takes.)*

### What is removed from `Doors.astro`

The camera scale/translate walk, `rotateY` door swing, gap bars, threshold layer (velvet panels, shade,
dim, rim, hem, stacks, rail, leaks), dip, exposure, inside layer and its drift, the door-shaped
clip-paths, and the `velvet-g`, `curtain-stack`, `rail`, and live-only `interior-door-view-g` imports
(kept only if calm/no-JS still uses them). Expect the file to shrink well under 500 lines.

### Calm mode, Pause motion, no-JS

- Calm (`prefers-reduced-motion: reduce`) and no-JS: unchanged — the lit front with the door open onto
  the curtain, the story opening below, no pin, no frames fetched.
- *Pause motion*: the clip is scroll-driven (the guest's own pace), so it keeps scrubbing; nothing
  autoplays. Consistent with `MOTION.md` rule 3.
- Save-Data: no special path; the keyframes-first load order degrades gracefully. *(Lead call: add a
  still fallback only if testing shows a need.)*

### Accessibility

- The canvas is `aria-hidden`; the section keeps its `aria-label`; "Skip the story" link unchanged.

## Verification

- Frame captures at t = .20, .22, .23, .24, .30, .40, .50, .60, .70, .80, .85 at 1440×900, 1024×768,
  375×812 (portrait) and 812×375 (phone landscape): handoff invisible, no blank frame, no sign garble.
- Scroll backwards through the whole scene: same result in reverse.
- Throttled network (slow 4G): no blank frame; scene waits on the gate rather than showing layers.
- `npm run verify` and `npm run perf:budget` (PAGES=/) pass, including jank ≤ 2 %.
- Calm mode and no-JS screenshots unchanged from today.

## Left to the builder

- Exact frame count, frame size and encoder settings within the weight targets.
- The canvas fit (cover) and focal point per cut.
- Prompting, take selection and grading of the AI clip; how the eye-height room still is made.
- Where the frames live (`public/doors/<cut>/NNN.avif` is fine) and their cache headers in
  `public/_headers` (long-lived, immutable, versioned path).
- Whether the frame loader is a small module in `src/lib/` (copy `reveal.ts` style) — keep it
  dependency-free.

## Execution note

The owner asked for the work to be fanned out to agents. Natural parallel tracks once planned:
(1) art — clip generation, take selection, grade, frame extraction; (2) build — canvas frame loader +
scrub; (3) build — strip the old layers, handoff, gate; (4) run — captures, verify, perf budget.
Track 1 blocks the final look of 2–4 but 2–3 can be built against placeholder frames (lead call:
placeholders are fine on the branch, but nothing merges until the real frames are in and approved).
