# Door scene video scrub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the faked walk / door swing / curtain / room reveal in the homepage door scene with one scroll-scrubbed first-person clip drawn on a canvas, keeping the coded street beat.

**Architecture:** A clip is cut into ~96 frames per cut (`land`, `port`) under `public/doors/v1/`, with a `manifest.json`. Pure helpers (`src/lib/frame-seq.ts`) do index/order/fit maths; a small loader/drawer (`src/lib/frame-player.ts`) fetches and decodes frames to `ImageBitmap`s and draws them on a canvas. `Doors.astro` keeps its street beat (t 0–.22), hands off to the canvas (.22–.24), scrubs the clip (.24–.82), and keeps the bloom into the story (.82–1).

**Tech Stack:** Astro 7, TypeScript strict, vanilla DOM script in `.astro`, Canvas 2D + `createImageBitmap`, ffmpeg (`/opt/homebrew/bin/ffmpeg`), Vitest (`tests/unit`), Playwright (`tests/e2e`), Higgsfield (via the connected generation tool) for the clip.

**Spec:** `docs/superpowers/specs/2026-11-26-door-scene-video-scrub-design.md`

## Global Constraints

- Motion rules in `docs/MOTION.md`: DOM layers animate `transform`/`opacity` only; scroll scenes are pinned and scrubbed at the guest's pace; calm mode shows a finished still.
- `npm run verify` passes. `PAGES=/ npm run perf:budget` passes: perf ≥ 85, LCP ≤ 1500 ms, TBT ≤ 200 ms, CLS ≤ 0.05, weight ≤ 1100 KB, jank ≤ 2 %.
- No frame is fetched before the guest's first scroll, wheel, touch, pointer or key event; none ever in calm mode or without JS.
- Frame weight: AVIF set ≤ 3 MB (`land`), ≤ 1.5 MB (`port`).
- Higgsfield: **hard cap 15 credits** for all clip work (both cuts, all takes, the eye-height room still). Stop and report before exceeding. The owner picks each cut's final take and signs off the grade.
- The namemark/sign must never come from the clip while readable (brand guidelines p.8).
- Grade matches the existing `*-g` art.
- No new npm dependencies. Files under 500 lines.
- Placeholder frames may live on the branch; nothing merges to `main` until real frames are in and owner-approved.
- Commit only on the working branch; no push without the owner's say-so.

## Review Focus

1. **Guest already deep in the scene when JS gates open** (reload mid-page, anchor link): the scene must resume at the current t, not jump or show the street at t .6. → Task 6 test `resumes at current t after a mid-scene reload`.
2. **Slow network**: scrolling past .24 before frame 0 decodes must hold the lit front, never show ink or a half scene. → Task 6 test `holds the lit front until frame 0 is ready`.
3. **Fast reverse scrub** after partial load: must draw the nearest loaded frame, never blank. → Task 4 `nearestLoaded` tests + Task 6 test `reverse scrub repaints the same frame`.
4. **Rotation mid-scene**: switches cut, keeps t, frees old bitmaps. → Task 6 test `rotation switches cut`.
5. **Calm mode / Pause motion**: calm fetches nothing and shows today's still; Pause motion leaves no infinite animation running (existing `motion.spec.ts`). → Task 6 test `calm mode fetches no frames` + existing `motion.spec.ts` in Task 9.

---

## Parallel tracks (for fan-out)

| Track | Tasks | Can start | Blocks |
|---|---|---|---|
| Art | 1 → 2 → 8 | now | 9 |
| Frames pipeline | 3 | now | 5, 6 |
| Player | 4 → 5 | now (4); after 3 (5) | 6 |
| Scene | 6 | after 3, 5 | 9 |
| Check | 7 (reviewer), 9 | after 6 / 8 | merge |

Tasks 1, 3 and 4 touch disjoint files and run in parallel. Task 2 has a human checkpoint (owner picks takes).

---

### Task 1: Capture the handoff plates

**Files:**
- Create: `scripts/capture-door-plates.mjs`
- Output (not committed, art inputs): `assets/doors/plate-land.png`, `assets/doors/plate-port.png`, `assets/doors/plates.json`

**Interfaces:**
- Produces: `plates.json` = `{ "land": { "w": 2400, "h": 1350, "front": [l, t, w, h] }, "port": { "w": 1350, "h": 2400, "front": [l, t, w, h] } }`, `front` = the `[data-camera]` box as fractions of the plate. Task 3 copies `front` into the manifest.

- [ ] **Step 1:** Write the script: Playwright Chromium, viewport 1600×900 (`land`) and 900×1600 (`port`) at `deviceScaleFactor: 1.5`, `localStorage fp-arrived=1`, goto `http://localhost:4321/`, jump to pinned t = 0.22 (same formula as the scene: `secTop - bar + t * len`), wait 1500 ms (lamps, sign, shine settled), hide `header.bar`, `.rail`, `.below`, `.grain`, `.vig`, screenshot `[data-doors] .stage`, read the `[data-camera]` rect relative to `.stage` and write it as fractions.
- [ ] **Step 2:** Run with the dev server up: `node scripts/capture-door-plates.mjs`. Expected: two PNGs (2400×1350, 1350×2400) showing the lit front with the door closed, and `plates.json` with `front` values in 0..1 (land `w` ≥ 1).
- [ ] **Step 3:** Commit the script only: `git add scripts/capture-door-plates.mjs && git commit -m "chore(doors): script to capture handoff plates"`.

### Task 2: Generate the clip (HUMAN CHECKPOINT, ≤ 15 credits)

**Files:**
- Output (not committed): `assets/doors/room-eye-land.png`, `assets/doors/room-eye-port.png`, `assets/doors/clip-land.mp4`, `assets/doors/clip-port.mp4`, `assets/doors/credits.md` (running log: tool, credits per call, take id).

**Interfaces:**
- Consumes: Task 1 plates.
- Produces: one approved MP4 per cut, ≥ 4 s, 24 fps, at least the plate's resolution, first frame = the plate.

- [ ] **Step 1:** Check the account balance and the per-call price of image-to-video with first/last-frame control and of image generation. Write the planned spend into `credits.md`. If the plan exceeds 15, stop and report.
- [ ] **Step 2:** Make the eye-height room still per cut from `src/assets/images/covent-garden/interior-door-view-g.jpg` and the gallery photos: standing just inside the door at ~1.6 m, looking down the dining room toward the bar, same warm grade. Log credits.
- [ ] **Step 3:** Generate the clip per cut, first frame = plate, last frame = room still. Prompt content (spec, "The clip"): door opens inward, hinged left; camera walks up; red velvet curtain on a brass rail drawn aside **to the right**; room revealed at eye height; ends on a slow push toward the bar; locked exposure, no cuts, no people facing camera. Log credits after every call; stop at 15.
- [ ] **Step 4:** Send the owner the takes (SendUserFile) with credits spent, and ask them to pick one per cut. Note per take whether the sign stays legible past frame 0 (if so, Task 6 needs the sign-tracking fallback; prefer takes where it doesn't).
- [ ] **Step 5:** Record the owner's picks in `credits.md`. No commit (assets are inputs).

### Task 3: Frame extraction pipeline + placeholder frames

**Files:**
- Create: `scripts/extract-door-frames.mjs`
- Create: `tests/unit/door-frames.test.ts`
- Create: `public/doors/v1/manifest.json`, `public/doors/v1/{land,port}/000.avif … 095.avif` and `.webp`
- Modify: `public/_headers` (add `/doors/*` block after `/_astro/*`), `vercel.json` `headers` (add `"/doors/(.*)"` entry after `/_astro/(.*)`), both `public, max-age=31536000, immutable`

**Interfaces:**
- Produces: `manifest.json` = `{ "version": "v1", "cuts": { "land": { "count": 96, "w": 1600, "h": 900, "front": [l, t, w, h] }, "port": { "count": 96, "w": 900, "h": 1600, "front": [...] } } }`. Frame path: `/doors/v1/<cut>/<NNN>.<avif|webp>`, `NNN` zero-padded from `000`.
- CLI: `node scripts/extract-door-frames.mjs --cut land|port --src <mp4> --front l,t,w,h [--count 96]`, and `--placeholder` (uses ffmpeg `testsrc2` with a frame counter, front `0,0,1,1`) so Tasks 5–6 can run before art lands.

- [ ] **Step 1: Write the failing test** `tests/unit/door-frames.test.ts`:
  - `manifest lists both cuts with count frames` → for `land` and `port`: `count === 96`, `front` has 4 numbers in [0, 1.5], and files `000…095` exist in both formats.
  - `AVIF weight within budget` → sum of `land/*.avif` ≤ 3 × 1024 × 1024; `port/*.avif` ≤ 1.5 × 1024 × 1024.
- [ ] **Step 2:** Run `npx vitest run tests/unit/door-frames.test.ts`. Expected: FAIL (no manifest).
- [ ] **Step 3:** Implement the script: ffmpeg `fps` filter to pick `count` evenly spaced frames, scale+crop to the cut size (cover), encode AVIF (`libaom-av1`, still-picture, CRF tuned to hit the budget) and WebP (q≈72), then merge the cut into `manifest.json`. Generate placeholders: `node scripts/extract-door-frames.mjs --placeholder --cut land` and `--cut port`.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5:** Commit: `git add scripts/extract-door-frames.mjs tests/unit/door-frames.test.ts public/doors public/_headers vercel.json && git commit -m "feat(doors): frame extraction pipeline + placeholder frames"`.

### Task 4: Pure frame-sequence helpers

**Files:**
- Create: `src/lib/frame-seq.ts`
- Test: `tests/unit/frame-seq.test.ts`

**Interfaces:**
- Produces:
  - `type Rect = { l: number; t: number; w: number; h: number }`
  - `frameIndex(t: number, a: number, b: number, n: number): number`: `round(clamp01((t - a) / (b - a)) * (n - 1))`.
  - `loadOrder(n: number): number[]`: `0`, `n-1`, then multiples of 8 ascending, then multiples of 4, then the rest ascending; each index once; length `n`.
  - `nearestLoaded(i: number, loaded: ArrayLike<unknown>): number`: nearest index with a truthy entry, ties go to the lower index; `-1` if none.
  - `handoffTransform(front: Rect, cam: Rect, stage: { w: number; h: number }, frame: { w: number; h: number }, k: number): { x: number; y: number; s: number }`: at `k = 0`, scale `s0 = cam.w / (front.w * frame.w)` and translate so `front` (fractions of the frame) lands on `cam` (stage px). At `k = 1`, cover-fit the frame to the stage, centred. Linear interpolation of `x`, `y`, `s` between them (k clamped to 0..1).

- [ ] **Step 1: Write the failing tests:**
  - `frameIndex(0.24, .24, .82, 96) === 0`, `frameIndex(0.82, .24, .82, 96) === 95`, `frameIndex(0.53, .24, .82, 96) === 48`, `frameIndex(0.1, .24, .82, 96) === 0`, `frameIndex(0.99, .24, .82, 96) === 95`.
  - `loadOrder(17)` equals `[0, 16, 8, 4, 12, 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15]`; `new Set(loadOrder(96)).size === 96`.
  - `nearestLoaded(5, [1,0,0,0,0,0,0,1]) === 7`, `nearestLoaded(4, [0,0,1,0,0,0,1]) === 2` (tie → lower), `nearestLoaded(3, [0,0,0]) === -1`.
  - `handoffTransform({l:0,t:0,w:1,h:1}, {l:-100,t:20,w:1200,h:900}, {w:1000,h:800}, {w:1600,h:1200}, 0)` → `{ x: -100, y: 20, s: 0.75 }`; same inputs with `k = 1` → `{ x: -33.33, y: 0, s: 0.6667 }` (toBeCloseTo, 2 dp); `k = 0.5` is the midpoint of both.
- [ ] **Step 2:** Run `npx vitest run tests/unit/frame-seq.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement the four functions in `src/lib/frame-seq.ts` (no DOM, no imports).
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `git add src/lib/frame-seq.ts tests/unit/frame-seq.test.ts && git commit -m "feat(doors): frame-sequence maths"`.

### Task 5: Frame player (load, decode, draw)

**Files:**
- Create: `src/lib/frame-player.ts`

**Interfaces:**
- Consumes: Task 3 manifest/paths; Task 4 `loadOrder`, `nearestLoaded`.
- Produces:
  - `type Cut = 'land' | 'port'`
  - `type Manifest = { version: string; cuts: Record<Cut, { count: number; w: number; h: number; front: [number, number, number, number] }> }`
  - `createFramePlayer(canvas: HTMLCanvasElement, base = '/doors/v1'): FramePlayer`
  - `interface FramePlayer { manifest(): Promise<Manifest>; setCut(cut: Cut): Promise<void> /* resolves when frame 0 of that cut is decoded; frees the other cut */; startLoading(): void /* idempotent; follows loadOrder, max 6 fetches in flight */; loadedCount(): number; resize(w: number, h: number): void /* canvas px = css px × min(devicePixelRatio, 2) */; draw(i: number, x: number, y: number, s: number): void /* draws nearestLoaded(i); no-op if none */; free(): void }`

- [ ] **Step 1:** Implement. AVIF if the browser decodes it (detect once with a 1×1 AVIF data URI via `createImageBitmap(await (await fetch(uri)).blob())`), else WebP. Decode with `createImageBitmap(blob)`. `free()` calls `bitmap.close()` on all and resets state so `startLoading()` can refetch. `draw` clears and `drawImage(bmp, x, y, frame.w * s, frame.h * s)` in stage CSS px (context pre-scaled by dpr). Skip `draw` when `(i, x, y, s)` equals the last call.
- [ ] **Step 2:** `npx astro check`. Expected: 0 errors. (Behaviour is tested through the scene in Task 6.)
- [ ] **Step 3:** Commit: `git add src/lib/frame-player.ts && git commit -m "feat(doors): frame player"`.

### Task 6: Rewrite the scene: canvas, handoff, gate, trigger, rotation

**Files:**
- Modify: `src/components/scenes/Doors.astro`
- Test: `tests/e2e/door-scene.spec.ts`

**Interfaces:**
- Consumes: Task 4 `frameIndex`, `handoffTransform`; Task 5 `createFramePlayer`, `Cut`.
- Produces (for tests): `[data-clip]` canvas; classes on `[data-doors]`: `is-clip-ready` (frame 0 of the current cut decoded), `is-clip-full` (all frames of the current cut loaded).

- [ ] **Step 1: Write the failing e2e tests** in `tests/e2e/door-scene.spec.ts` (each test: `addInitScript` sets `fp-arrived=1`; helper `go(page, t)` = scroll to `secTop - bar + t * len` like the scene; helper `canvasHash(page)` = a cheap hash of `getImageData` over a 32×32 downscale):
  - `no frames before first interaction` → goto `/`, wait 2000 ms, zero requests matching `/doors/v1/`.
  - `frames load after first scroll and the canvas paints` → wheel once, `go(.5)`, wait for `.is-clip-ready`; centre pixel alpha 255 and `canvasHash` ≠ hash of a blank canvas.
  - `holds the lit front until frame 0 is ready` → route `**/doors/v1/**` delayed 3000 ms; wheel, `go(.6)`; `[data-camera]` is displayed with opacity 1; after `.is-clip-ready`, `[data-camera]` is `display: none`.
  - `reverse scrub repaints the same frame` → load, wait `.is-clip-full`; `go(.3)` hash A; `go(.8)`; `go(.3)` hash B; `A === B`; and hash at `.8` ≠ A.
  - `resumes at current t after a mid-scene reload` → `go(.6)`, reload; after `.is-clip-ready`, `[data-camera]` is `display: none` and `canvasHash` equals a fresh `go(.6)` hash.
  - `rotation switches cut` → viewport 812×375, `go(.5)`, ready: requests hit `/land/`; set viewport 375×812; requests hit `/port/` and `.is-clip-ready` returns.
  - `calm mode fetches no frames` → `page.emulateMedia({ reducedMotion: 'reduce' })`, scroll the whole page; zero `/doors/v1/` requests; `[data-clip]` computed `display: none`; `[data-door]` computed `transform` ≠ `none` (today's calm still: door open onto the curtain).
- [ ] **Step 2:** Run `npx playwright test tests/e2e/door-scene.spec.ts`. Expected: FAIL (no `[data-clip]`).
- [ ] **Step 3: Strip** from `Doors.astro` (markup, CSS, script): the `inside` layer, the `threshold` layer (velvet panels, shade, dim, rim, hem, stacks, rail, leaks), `gap-bar`s, `dip`, `exposure`, the `.is-live` doorway clip-paths, the camera walk (scale/translate/bob, `DIST`, `WALK`, `STEPS`, `map`, `doorRect`, `base`), the `rotateY` door swing, the `stack`/`railArt`/`rail` imports and `getImage` for the rail, and `--rail-src`. Keep: `velvetImg` (calm/no-JS `.curtain-still`), `room` (shop windows), the street beat at t < .22 exactly as today, `vig`, `grain`, `seam`, `below`, `flood`/opening/route, the noscript and calm CSS.
- [ ] **Step 4: Add** `<canvas class="clip" data-clip aria-hidden="true">` as the first child of `.stage` (under `.camera`), CSS `position:absolute; inset:0; width:100%; height:100%; display:none`, shown only in the live, non-calm path. Script:
  - On first `scroll`/`wheel`/`touchstart`/`pointerdown`/`keydown` (once, passive): `player.setCut(cut)` then `player.startLoading()`. `cut = matchMedia('(max-aspect-ratio: 3/4)').matches ? 'port' : 'land'`.
  - Gate: `ready = streetDecoded && clipReady`; `streetDecoded` = `.facade` and `.door-img` `decode()` resolved. Effective `t = ready ? t : Math.min(t, streetDecoded ? 0.22 : 0)`. Add `is-clip-ready` when `setCut` resolves; on that, re-render at the real t.
  - Render: `camera` opacity `1 - range(t, .22, .24)`, `show(camera, t < .24)`; canvas shown for `t >= .22`; `i = frameIndex(t, .24, .82, count)`; `{x,y,s} = handoffTransform(front, cam, stage, frame, inOut(range(t, .24, .32)))`; `player.draw(i, x, y, s)`. Lamps/sign/opening/flood/route keep their current t ranges.
  - `measure()` also calls `player.resize(stageW, stageH)`; on cut change (rotation) call `setCut(newCut)`, keep t (existing remeasure already does).
  - `IntersectionObserver` with `rootMargin: '300% 0px'`: on leave → `player.free()`, drop `is-clip-ready`/`is-clip-full`; on return (after first interaction) → `setCut` + `startLoading`.
  - Add `is-clip-full` when `loadedCount() === count`.
  - Sign fallback only if Task 2 recorded a take with a legible sign past frame 0: keep `.sign-lit` above the canvas and move it with recorded per-frame positions; otherwise do not build it.
- [ ] **Step 5:** Run the e2e spec. Expected: 7 passed. Run `npx playwright test tests/e2e/motion.spec.ts tests/e2e/intro.spec.ts`. Expected: PASS. `wc -l src/components/scenes/Doors.astro` < 500.
- [ ] **Step 6:** Commit: `git add src/components/scenes/Doors.astro tests/e2e/door-scene.spec.ts && git commit -m "feat(doors): scroll-scrubbed walk-in clip replaces faked walk and curtain"`.

### Task 7: Review the scene diff

- [ ] **Step 1:** Run the `reviewer` agent on `git diff main...HEAD -- src/` against the spec. Fix real gaps; re-run Task 6 Step 5 after fixes; commit `fix(doors): review fixes`.

### Task 8: Real frames in (after Task 2 picks)

**Files:**
- Modify: `public/doors/v1/**` (replaces placeholders)

- [ ] **Step 1:** `node scripts/extract-door-frames.mjs --cut land --src assets/doors/clip-land.mp4 --front <land front from plates.json>` and the same for `port`.
- [ ] **Step 2:** `npx vitest run tests/unit/door-frames.test.ts`. Expected: PASS (weight within budget; lower CRF if not).
- [ ] **Step 3:** Capture frames (Task 9 Step 2 set) and send them to the owner to sign off the grade and handoff (SendUserFile). Wait for sign-off.
- [ ] **Step 4:** Commit: `git add public/doors && git commit -m "feat(doors): approved walk-in frames"`.

### Task 9: Full verification

- [ ] **Step 1:** `npm run verify`. Expected: every line `ok`.
- [ ] **Step 2:** With `astro preview` on :4321, capture `[data-doors] .stage` at t = .20, .22, .23, .24, .30, .40, .50, .60, .70, .80, .85 at 1440×900, 1024×768, 375×812, 812×375, forward and then backward. Check: no visible jump at .22–.24 on any size, no blank frame, no garbled sign, curtain pulls right.
- [ ] **Step 3:** Same captures with DevTools "Slow 4G" throttling: the lit front holds until the clip is ready; never a blank or half scene.
- [ ] **Step 4:** `PAGES=/ npm run perf:budget`. Expected: PASS (perf ≥ 85, LCP ≤ 1500, TBT ≤ 200, CLS ≤ 0.05, weight ≤ 1100 KB, jank ≤ 2 %).
- [ ] **Step 5:** `npx playwright test`. Expected: all pass (includes `motion.spec.ts` Pause motion and `a11y.spec.ts`).
- [ ] **Step 6:** Calm-mode and no-JS screenshots of the scene match today's (compare against `main`).
- [ ] **Step 7:** Report results to the owner; no merge or push without their say-so.
